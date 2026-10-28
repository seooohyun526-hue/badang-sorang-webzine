-- =========================================================
-- 바당소랑 '응원 온도' 창 — 모두의 응원 공용 저장소 (Supabase)
-- Supabase 대시보드 → SQL Editor → New query 에 이 파일을 통째로 붙여 넣고 Run (여러 번 실행해도 괜찮아요)
--
-- · 표는 잠가 둬요(RLS): 웹진(공개 키 anon)은 표를 직접 읽거나 쓸 수 없고, 아래 4개 함수로만 응원을 다뤄요
--     cheer_state()                      → { likes, commentCount, comments:[{ id, t, at }], scoreLikes, scoreComments, round }  최근 응원 50개
--                                          scoreLikes · scoreComments: 온도 점수에 들어가는 수 (리셋 시각 score_since 뒤에 저장된 것만)
--                                          round: 리셋 차례 (score_since 의 ms · 리셋한 적 없으면 0) — 바뀌면 브라우저가 '보낸 좋아요 수'를 0 으로
--     cheer_comment(p_id, p_body)        → 응원 한 마디 (p_id: 브라우저가 만든 UUID — 같은 id 는 한 번만 저장)
--     cheer_like(p_who)                  → 좋아요 (p_who: 브라우저가 만든 UUID — 한 사람당 5번까지 세는 이름표)
--     cheer_import(p_comments)           → 예전에 브라우저에만 남긴 응원 옮기기 (한 번에 20개까지)
-- · 규칙 (웹진이 예전부터 쓰던 것과 같아요)
--     글 1~100자 · 보이지 않는 제어 문자 빼기 · 빈칸 하나로 · 앞뒤 빈칸 빼기
--     좋아요: 한 사람(브라우저)당 5번까지 (이름표가 없으면 접속 주소로 세요 · 리셋한 뒤부터 다시 5번) · 같은 접속 주소는 하루 1000번까지 (이름표를 지워 가며 누르는 것 막기)
--     온도 리셋: cheer_config.score_since 에 시각을 적으면 그 뒤에 저장된 것만 점수로 세요 (데이터는 지우지 않아요 · README '온도 리셋' 참고)
--                이 파일을 다시 Run 해도 score_since 는 그대로예요 (리셋되지 않아요)
--     응원 한 마디: 횟수 · 시간 제한 없음 (욕설 · 비속어만 막아요)
--     접속 주소(IP)는 그대로 저장하지 않고 섞어서(해시) 세기에만 써요
-- · 문제가 생기면 함수는 { error: 'text' | 'id' | 'bad' | 'limit' | 'too_fast' } 를 돌려줘요 (웹진이 안내 문구로 바꿔 보여 줘요)
-- =========================================================

-- ── 표 ──
create table if not exists public.cheer_comments (
  id uuid primary key,
  body text not null check (char_length(body) between 1 and 100),
  created_at timestamptz not null default now(),
  ip_hash text not null,
  hidden boolean not null default false            -- true 면 목록에서 빠져요 (관리: README 참고)
);
create index if not exists cheer_comments_created on public.cheer_comments (created_at desc);
create index if not exists cheer_comments_ip on public.cheer_comments (ip_hash, created_at desc);

create table if not exists public.cheer_likes (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  ip_hash text not null
);
create index if not exists cheer_likes_ip on public.cheer_likes (ip_hash, created_at desc);
alter table public.cheer_likes add column if not exists who text;               -- 누른 사람 이름표 (브라우저 UUID 또는 접속 주소 · 5번까지 세기)
create index if not exists cheer_likes_who on public.cheer_likes (who);

create table if not exists public.cheer_config (       -- 접속 주소를 섞을 때 쓰는 비밀 글자 (처음 한 번 저절로 만들어져요)
  id int primary key default 1 check (id = 1),
  salt text not null default gen_random_uuid()::text
);
insert into public.cheer_config (id) values (1) on conflict (id) do nothing;
alter table public.cheer_config add column if not exists score_since timestamptz;   -- 온도 점수를 이 시각부터 세요 (비어 있으면 처음부터 다)

-- ── 잠그기: 공개 키로는 표를 직접 못 건드려요 ──
alter table public.cheer_comments enable row level security;
alter table public.cheer_likes enable row level security;
alter table public.cheer_config enable row level security;
revoke all on table public.cheer_comments, public.cheer_likes, public.cheer_config from anon, authenticated;
revoke all on sequence public.cheer_likes_id_seq from anon, authenticated;

-- ── 안쪽 도우미 (웹진에서는 못 불러요) ──
-- 지금 요청한 사람의 접속 주소 → 섞은 값
create or replace function public.cheer__who() returns text
language sql stable security definer set search_path = public as $$
  select encode(sha256(convert_to((select salt from public.cheer_config where id = 1) || '|' || coalesce(
           nullif(btrim(h->>'cf-connecting-ip'), ''),
           nullif(btrim(split_part(h->>'x-forwarded-for', ',', 1)), ''),
           nullif(btrim(h->>'x-real-ip'), ''),
           'unknown'), 'UTF8')), 'hex')
  from (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json as h) r
$$;

-- 글 다듬기 → 1~100자면 그 글, 아니면 null
create or replace function public.cheer__clean(t text) returns text
language sql immutable set search_path = public as $$
  select case when c = '' or char_length(c) > 100 then null else c end
  from (select btrim(regexp_replace(
                 regexp_replace(normalize(coalesce(t, ''), NFC), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F​-‏‪-‮⁦-⁩]', '', 'g'),
                 '\s+', ' ', 'g')) as c) s
$$;

-- 비속어 · 욕설인지 (응원 · 옛 응원 옮기기 · 목록 모두 이걸로 걸러요) — 대소문자 · 전각 글자 · 문장부호로 바꿔 써도 같게 봐요
--   목록을 늘리려면 아래 두 array 에 말을 더하고 이 파일을 다시 Run 하세요
create or replace function public.cheer__bad(t text) returns boolean
language sql immutable set search_path = public as $$
  select exists (
    select 1
    from (select lower(normalize(coalesce(t, ''), NFC)) as n                 -- ㅅㅂ 같은 자음은 이 모양 그대로
          union all select lower(normalize(coalesce(t, ''), NFKC))) a,        -- 전각 글자(ｆｕｃｋ)는 보통 글자로
         lateral (select regexp_replace(a.n, '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ぀-ヿ一-鿿]', '', 'g') as tight,
                         regexp_replace(a.n, '[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ぀-ヿ一-鿿 ]', '', 'g') as spaced) x
    where exists (select 1 from unnest(array['씨발', '씨빨', '씨팔', '씨바', '씨부랄', 'ㅆㅂ', 'ㅅㅂ', 'ㅂㅅ', 'ㅄ', 'ㅈㄴ', 'ㅈㄹ', 'ㅅㄲ', 'ㅁㅊ', 'ㅗㅗ', '좆', '존나', '개새끼', '개새기', '개색끼', '개쉐이', '지랄', '미친놈', '미친년', '또라이', '엿먹', '엠창', '느금', '니애미', '니애비', '썅', '쌍년', '쌍놈', '씹새', '씹할', '씹창', '씹년', '염병', '육시랄', '후레자식', '호로자식', '창녀', '섹스', 'fuck', 'shit', 'bitch', 'asshole', 'motherfucker', 'tlqkf', 'qudtls', '死ね', 'くたばれ', 'ファック']) w where x.tight like '%' || w || '%')      -- 띄어쓰기까지 빼고 봐요
       or exists (select 1 from unnest(array['시발', '시팔', '병신', '븅신', '빙신', '닥쳐', '니미', '등신']) w where x.spaced like '%' || w || '%'))      -- 띄어쓰기는 두고 봐요
$$;

-- ── 웹진이 부르는 함수 ──
create or replace function public.cheer_state() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'likes', (select count(*) from public.cheer_likes),
    'commentCount', (select count(*) from public.cheer_comments where not hidden and not public.cheer__bad(body)),
    'comments', coalesce((
      select jsonb_agg(jsonb_build_object('id', x.id, 't', x.body, 'at', (extract(epoch from x.created_at) * 1000)::bigint) order by x.created_at desc, x.id)
      from (select id, body, created_at from public.cheer_comments where not hidden and not public.cheer__bad(body) order by created_at desc, id limit 50) x), '[]'::jsonb),
    'scoreLikes', (select count(*) from public.cheer_likes where created_at >= s.since),
    'scoreComments', (select count(*) from public.cheer_comments where created_at >= s.since and not hidden and not public.cheer__bad(body)),
    'round', s.round)
  from (select coalesce(score_since, '-infinity'::timestamptz) as since,
               coalesce((extract(epoch from score_since) * 1000)::bigint, 0) as round
        from public.cheer_config where id = 1) s
$$;

drop function if exists public.cheer_like();                                   -- 예전 모양(이름표 없음) 지우기
create or replace function public.cheer_like(p_who text default null) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare ip text := public.cheer__who(); me text; mine int; n int;
begin
  me := case when p_who ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then 'b:' || lower(p_who) else 'ip:' || ip end;
  perform pg_advisory_xact_lock(hashtext('cheer_like|' || me));                -- 한 사람이 동시에 여러 번 눌러도 차례로 세요
  select count(*) into mine from public.cheer_likes
   where who = me and created_at >= coalesce((select score_since from public.cheer_config where id = 1), '-infinity'::timestamptz);
  if mine >= 5 then                                                              -- 한 사람당 5번까지 (온도 리셋 뒤부터 다시 세요)
    return public.cheer_state() || jsonb_build_object('error', 'limit', 'mine', mine);
  end if;
  select count(*) into n from public.cheer_likes where ip_hash = ip and created_at > now() - interval '1 day';
  if n >= 1000 then return public.cheer_state() || jsonb_build_object('error', 'too_fast', 'mine', mine); end if;
  insert into public.cheer_likes (ip_hash, who, created_at) values (ip, me, clock_timestamp());
  return public.cheer_state() || jsonb_build_object('mine', mine + 1);
end $$;

create or replace function public.cheer_comment(p_id text, p_body text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare who text := public.cheer__who(); t text := public.cheer__clean(p_body); uid uuid;
begin
  if t is null then return jsonb_build_object('error', 'text'); end if;
  if public.cheer__bad(t) then return jsonb_build_object('error', 'bad'); end if;   -- 욕설 · 비속어는 저장하지 않아요
  if p_id is null or p_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return jsonb_build_object('error', 'id');
  end if;
  uid := p_id::uuid;
  if exists (select 1 from public.cheer_comments where id = uid) then           -- 같은 응원을 두 번 보내도 한 번만
    return public.cheer_state() || jsonb_build_object('duplicate', true);
  end if;
  insert into public.cheer_comments (id, body, ip_hash, created_at) values (uid, t, who, clock_timestamp()) on conflict (id) do nothing;
  return public.cheer_state() || jsonb_build_object('created', true);
end $$;

create or replace function public.cheer_import(p_comments jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare who text := public.cheer__who(); c jsonb; t text; at_ms double precision; added int := 0; k int := 0; got int;
  now_ms double precision := extract(epoch from clock_timestamp()) * 1000;
begin
  if jsonb_typeof(p_comments) is distinct from 'array' then return public.cheer_state() || jsonb_build_object('imported', 0); end if;
  for c in select value from jsonb_array_elements(p_comments) loop
    k := k + 1; exit when k > 20;                                               -- 한 번에 20개까지
    t := public.cheer__clean(c->>'t');
    continue when t is null or public.cheer__bad(t) or coalesce(c->>'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
    at_ms := case when jsonb_typeof(c->'at') = 'number' then (c->>'at')::double precision else now_ms end;
    at_ms := least(now_ms, greatest(now_ms - 2 * 365 * 86400000.0, at_ms));     -- 미래 · 너무 옛날 시각은 고쳐서
    insert into public.cheer_comments (id, body, ip_hash, created_at)
      values ((c->>'id')::uuid, t, who, to_timestamp(at_ms / 1000.0)) on conflict (id) do nothing;
    get diagnostics got = row_count; added := added + got;
  end loop;
  return public.cheer_state() || jsonb_build_object('imported', added);
end $$;

-- ── 누가 부를 수 있나: 웹진(anon)은 위 4개만 ──
revoke execute on function public.cheer__who(), public.cheer__clean(text), public.cheer__bad(text) from public, anon, authenticated;
revoke execute on function public.cheer_state(), public.cheer_like(text), public.cheer_comment(text, text), public.cheer_import(jsonb) from public;
grant execute on function public.cheer_state(), public.cheer_like(text), public.cheer_comment(text, text), public.cheer_import(jsonb) to anon, authenticated;

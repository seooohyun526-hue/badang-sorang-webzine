(()=>{
 const root=document.getElementById('game');
 root.dataset.recordFlow='loading';
 root.insertAdjacentHTML('beforeend',`<button id="rank-open" hidden>온라인 랭킹</button><div id="rank-toast" hidden role="status"></div><section id="ranking" hidden aria-label="온라인 랭킹"><button id="rank-close" type="button" aria-label="랭킹 닫기">닫기</button><h2 id="rank-heading">바다를 지키는 해녀들</h2><p id="rank-result" hidden></p><label for="rank-name">내 닉네임</label><input id="rank-name" maxlength="12" autocomplete="nickname" placeholder="한글·영문·숫자 2~12자"><button id="name-save" type="button">닉네임 등록·변경</button><p id="name-status" role="status"></p><details><summary>닉네임 규칙</summary><small>한글·영문 등 글자를 포함한 2~12자. 숫자·공백·밑줄·하이픈을 함께 사용할 수 있어요. 대소문자·공백·밑줄·하이픈만 다른 이름도 중복입니다. 욕설·비하·혐오·음란 표현, 개인정보, 운영진 사칭 이름은 사용할 수 없어요.</small></details><small>닉네임과 기록이 공개됩니다. 이 브라우저에 내 기록이 연결됩니다.</small><div class="tabs" id="rank-metric"><button data-value="score" aria-pressed="true">점수</button><button data-value="cleaned" aria-pressed="false">해양 정화</button></div><div class="tabs" id="rank-period"><button data-value="week" aria-pressed="true">이번 주</button><button data-value="all" aria-pressed="false">전체</button></div><small id="rank-period-note">주간 기록은 월요일 0시(한국 시간)부터 집계합니다.</small><p id="rank-status" role="status"></p><div id="rank-me">아직 등록된 내 기록이 없어요.</div><ol id="rank-list"></ol><button id="rank-retry" type="button" hidden>기록 저장 다시 시도</button></section>`);
 const $=id=>document.getElementById(id),panel=$('ranking'),name=$('rank-name'),open=$('rank-open');
 const t=(ko,en)=>window.oceanLanguage==='en'?en:ko;
 let metric='score',period='week',pending=[],saving=false,request=0,registeredName='',claiming=false,lastPhase='loading',starting=false,session=null,prepared=null,autoStarted=false,titleSeen=false;
 try{name.value=localStorage.getItem('ocean.nickname')||'';const saved=JSON.parse(localStorage.getItem('ocean.pending')||'[]');if(Array.isArray(saved))pending=saved.filter(r=>r&&typeof r.runId==='string').slice(-10);}catch{}
 function persist(){try{localStorage.setItem('ocean.pending',JSON.stringify(pending));}catch{}}
 function flow(value){root.dataset.recordFlow=value;window.dispatchEvent(new CustomEvent('ocean-record-flow',{detail:{state:value}}));}
 function currentPending(){return session&&pending.find(r=>r.runId===session.runId);}
 function labels(){
  const naming=panel.dataset.naming==='true',run=currentPending();
  $('rank-heading').textContent=naming?t('오늘의 기록을 남겨요','Save your dive'):t('바다를 지키는 해녀들','Ocean guardians');
  $('rank-close').textContent=naming?t('나중에','Not now'):t('닫기','Close');
  $('name-save').textContent=naming?t('이 이름으로 기록 저장','Save my score'):t('닉네임 등록·변경','Save nickname');
  $('rank-result').hidden=!naming;
  if(run)$('rank-result').textContent=t(`${run.score}점 · 해양 정화 ${run.cleaned}개`,`${run.score} pts · ${run.cleaned} cleaned`);
  $('rank-retry').hidden=!pending.some(r=>r.nickname);
 }
 function showName(){
  panel.dataset.naming='true';panel.hidden=false;
  if(registeredName)name.value=registeredName;
  labels();$('name-status').textContent=t('닉네임을 정하면 이번 기록을 랭킹에 저장해요.','Choose a nickname to add this dive to the leaderboard.');
 }
 function toast(text){$('rank-toast').textContent=text;$('rank-toast').hidden=false;setTimeout(()=>$('rank-toast').hidden=true,4500);}
 async function api(path,body){
  const options={method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)};
  const r=await (window.OceanIntegration?.fetchApi?window.OceanIntegration.fetchApi(path,options):window.OceanIntegration.fetchApi(path,options));
  let data;try{data=await r.json();}catch{throw Error(t('온라인 랭킹 서버에 연결하지 못했어요.','Could not connect to the leaderboard.'));}
  if(!r.ok)throw Object.assign(Error(data.error||t('다시 시도해 주세요.','Please try again.')),{status:r.status,code:data.code});return data;
 }
 function prepareSession(){
  const result=api('session',{guest:true});result.catch(()=>{});return result;
 }
 // Establish identity while the 3D files load, instead of waiting at the title screen.
 prepared=prepareSession();
 async function startSession(){
  if(starting)return;starting=true;
  try{
   const started=await (prepared||prepareSession());prepared=null;session=started;
   registeredName=started.nickname||registeredName;if(registeredName)name.value=registeredName;
   window.dispatchEvent(new CustomEvent('ocean-run-started',{detail:{runId:started.runId}}));
   panel.hidden=true;panel.dataset.naming='false';
   window.unityInstance.SendMessage('Haenyeo Ocean','ConfirmOnlineName','');
  }catch(e){prepared=null;toast(e.message);throw e;}
  finally{starting=false;}
 }
 function autoStart(){
  if(autoStarted||!titleSeen||!window.unityInstance||document.hidden)return;
  autoStarted=true;startSession().catch(()=>{});
 }
 async function claim(){
  if(claiming)return false;claiming=true;$('name-save').disabled=true;$('name-status').textContent=t('닉네임을 확인하는 중…','Checking your nickname…');
  try{
   const data=await api('profile',{nickname:name.value});registeredName=data.nickname;name.value=data.nickname;
   try{localStorage.setItem('ocean.nickname',data.nickname);}catch{}
   $('name-status').textContent=t('등록됐어요. 이 닉네임은 나만 사용할 수 있어요.','Nickname saved. It belongs to you.');return true;
  }catch(e){$('name-status').textContent=window.oceanText?window.oceanText(e.message):e.message;return false;}
  finally{claiming=false;$('name-save').disabled=false;}
 }
 async function confirmName(){
  if(saving||claiming)return;if(!await claim())return;
  for(const run of pending)if(!run.nickname)run.nickname=registeredName;
  persist();labels();
  if(pending.length){panel.hidden=true;flow('saving');await save();}
 }
 $('name-save').onclick=confirmName;
 name.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();confirmName();}});
 name.addEventListener('input',()=>{$('name-status').textContent=t('기록 저장을 눌러 닉네임을 확인해 주세요.','Save your score to check this nickname.');});
 async function refresh(){
  const ticket=++request;$('rank-status').textContent=t('기록을 불러오는 중…','Loading scores…');$('rank-list').replaceChildren();
  try{
   const data=await api(`leaderboard?metric=${metric}&period=${period}`);if(ticket!==request)return;
   $('rank-status').textContent=data.entries.length?t('상위 100개 닉네임 · 닉네임별 최고 기록','Top 100 nicknames · personal best scores'):t('첫 기록을 남겨보세요.','Set the first score.');
   $('rank-me').textContent=data.me?t(`내 최고 순위 ${data.me.rank}위 · ${data.me.value}${metric==='score'?'점':'개'}`,`Your best rank #${data.me.rank} · ${data.me.value}`):t('아직 등록된 내 기록이 없어요.','No saved score yet.');
   for(const entry of data.entries){const row=document.createElement('li');if(entry.mine)row.className='mine';for(const value of [t(entry.rank+'위','#'+entry.rank),entry.nickname,entry.value+t(metric==='score'?'점':'개',metric==='score'?' pts':'')]){const span=document.createElement('span');span.textContent=value;row.append(span);}$('rank-list').append(row);}
  }catch(e){if(ticket===request)$('rank-status').textContent=e.message;}
 }
 open.onclick=()=>{if(currentPending()&&!currentPending().nickname){showName();return;}panel.dataset.naming='false';panel.hidden=false;labels();refresh();};
 $('rank-close').onclick=()=>{panel.hidden=true;if(root.dataset.recordFlow==='naming')flow('deferred');};
 for(const [id,key] of [['rank-metric','metric'],['rank-period','period']])$(id).onclick=e=>{if(!e.target.dataset.value)return;for(const b of $(id).children)b.setAttribute('aria-pressed',String(b===e.target));if(key==='metric')metric=e.target.dataset.value;else period=e.target.dataset.value;refresh();};
 async function save(){
  if(saving||!pending.some(r=>r.nickname))return;saving=true;let rejected=false;
  try{
   while(pending.some(r=>r.nickname)){
    const index=pending.findIndex(r=>r.nickname),run=pending[index];
    try{
     await api('submit',run);
     const promptEvent=lastPhase==='end'&&run.runId===session?.runId;
     if(promptEvent)flow('saved');
     window.dispatchEvent(new CustomEvent('ocean-record-saved',{detail:{runId:run.runId,score:run.score,furthest:run.furthest,collected:run.collected,cleaned:run.cleaned,promptEvent}}));
    }catch(e){if(e.status!==400&&e.status!==401)throw e;rejected=true;}
    pending.splice(index,1);persist();
   }
   toast(rejected?t('확인할 수 없는 기록은 등록되지 않았어요. 새 게임부터 다시 저장해요.','Unverified scores were not saved. Please start a new dive.'):t('온라인 기록이 저장됐어요','Your score is saved'));
   if(!panel.hidden)refresh();
  }catch(e){toast(t('기록 저장 실패 · 랭킹에서 다시 시도해 주세요.','Score not saved. Retry from the leaderboard.'));$('rank-status').textContent=e.message;}
  finally{saving=false;labels();}
 }
 $('rank-retry').onclick=save;
 window.addEventListener('ocean-language',labels);
 window.addEventListener('ocean-unity-ready',autoStart);
 document.addEventListener('visibilitychange',autoStart);
 window.addEventListener('ocean-game',e=>{
  const data=e.detail;
  if(data.phase==='title'){lastPhase='title';titleSeen=true;open.hidden=false;autoStart();}
  if(data.phase==='prepare')startSession().catch(()=>{});
  if(data.phase==='begin'){lastPhase='playing';flow('playing');open.hidden=true;panel.hidden=true;toast(t('탭해서 전진 · 밀어서 방향 이동','Tap to step forward · Swipe to turn'));}
  if(data.phase==='end'){
   lastPhase='end';open.hidden=false;
   if(!session)return;
   pending.push({runId:session.runId,score:data.score,furthest:data.furthest,collected:data.collected,cleaned:data.cleaned});pending=pending.slice(-10);persist();
   flow('naming');showName();
  }
 });
 labels();
})();

import {popupPreference} from './event-visibility.mjs';
let preferenceStorage;try{preferenceStorage=window.localStorage;}catch{}
const preference=popupPreference(preferenceStorage);
const root=document.getElementById('game');
root.insertAdjacentHTML('beforeend',`
<button id="event-open" hidden>체험권 이벤트</button>
<dialog id="event-panel" aria-labelledby="event-heading">
 <header><small>EVENT / 바당소랑</small><button type="button" id="event-close" aria-label="응모창 닫기">닫기</button></header>
 <label class="event-check event-hide"><input type="checkbox" id="event-hide-today">오늘 하루 안 보기 <small>한국 시간 자정까지</small></label>
 <h2 id="event-heading">물질하고, 제주로!</h2>
 <section class="event-prize"><small>조건 달성자 추첨</small><h3>제주 해녀 체험권 <em>2매</em></h3>
 <p>한 판에서 <b>500점 이상 · 정화 30개 이상</b><br>모두 달성하고 응모해 보세요.</p>
 <small>2명 추첨 · 1인 1매 · 중복 응모·당첨 불가</small></section>
 <p class="event-dates">응모 2026.10.26~11.06<br>발표 11.08 · 한국 시간 기준</p>
 <div id="event-record">저장된 기록을 확인하고 있어요.</div>
 <form id="event-form">
  <label for="event-email">이벤트 응모 이메일</label>
  <input id="event-email" type="email" maxlength="254" autocomplete="email" inputmode="email" placeholder="name@email.com" required>
  <small>응모 확인 및 당첨 시 연락받을 본인 이메일을 입력해 주세요.</small>
  <label class="event-check"><input type="checkbox" id="event-age" required>만 14세 이상입니다.</label>
  <div class="event-agree"><label class="event-check"><input type="checkbox" id="event-consent" required>[필수] 개인정보 수집·이용 동의</label><button type="button" data-policy="collection">자세히</button></div>
  <div class="event-agree"><label class="event-check"><input type="checkbox" id="event-overseas" required>[필수] 개인정보 국외 이전 동의</label><button type="button" data-policy="overseas">자세히</button></div>
  <p id="event-status" role="status" aria-live="polite"></p>
  <button id="event-submit" type="submit" disabled>이메일로 응모하기</button>
 </form>
 <div class="event-actions"><button type="button" id="event-refresh">기록 다시 확인</button><button type="button" id="event-back">게임으로 돌아가기</button></div>
 <small class="event-footer">응모하지 않아도 게임을 계속할 수 있어요.<br>운영·문의 <a href="https://www.instagram.com/badang_sorang/" target="_blank" rel="noopener noreferrer">@badang_sorang DM</a></small>
</dialog>
<dialog id="event-policy" aria-labelledby="policy-heading"><header><h2 id="policy-heading">개인정보 안내</h2><button type="button" id="policy-close">닫기</button></header><div id="policy-body"></div><button type="button" id="policy-back">응모 화면으로 돌아가기</button></dialog>`);
const $=id=>document.getElementById(id),panel=$('event-panel'),policy=$('event-policy');
let status=null,busy=false,ticket=0,currentRunId='';
const retention=`미당첨자의 응모 정보는 추첨 확정 시, 당첨자의 응모 정보는 체험권 전달·수령 확인이 끝나면 지체 없이 삭제합니다. 연락 및 지급 처리가 남아 있더라도 2026년 11월 22일까지만 보관하고 다음 날 삭제 작업으로 제거합니다. 이메일과 응모 기록의 연결·중복 확인값·동의 기록을 함께 삭제합니다. 일반 게임 랭킹은 별도로 유지됩니다.`;
const policies={
 collection:`<h3>운영자 및 문의</h3><p>바당소랑 · 인스타그램 @badang_sorang DM<br>열람·정정·삭제·동의 철회 요청도 같은 문의처로 접수합니다. 신청자 확인 후 처리합니다.</p>
 <h3>수집 항목</h3><p>이메일, 닉네임, 플레이어·게임 기록 식별값, 해당 판 점수·정화 수, 응모 시각, 만 14세 이상 확인 및 동의 내역.</p>
 <h3>이용 목적</h3><p>이벤트 응모 접수, 조건 및 중복 확인, 무작위 추첨, 당첨자 연락과 체험권 지급. 광고·홍보 메일 발송에는 사용하지 않습니다.</p>
 <h3>보관 및 파기</h3><p>${retention}</p><p>이메일은 암호화해 보관하고 공개 랭킹이나 방문 통계로 전송하지 않습니다. 운영 데이터는 삭제하며, 복구용 백업은 서비스 보존주기에 따라 소멸하고 복원 시 삭제 대상을 다시 제거합니다.</p>
 <h3>동의 거부</h3><p>동의를 거부할 수 있습니다. 거부하면 이벤트 응모는 할 수 없지만 게임과 랭킹은 이용할 수 있습니다. 만 14세 미만은 이번 이벤트에 응모할 수 없습니다.</p>
 <h3>응모·추첨 기준</h3><p>2026년 10월 26일 00:00부터 11월 6일 23:59:59까지 저장된 한 판에서 500점 이상, 정화 30개 이상을 모두 달성하고 기간 내 접수해야 합니다. 조건 충족 응모자 중 2명을 추첨해 각 1매를 지급합니다. 발표일은 11월 8일입니다. 동일 이메일 및 동일 플레이어는 1회만 응모할 수 있습니다. 이메일 소유권은 접수 단계에서 인증하지 않으므로 본인 주소를 정확히 입력해 주세요.</p>`,
 overseas:`<h3>국외 이전에 대한 별도 동의</h3><p>응모 처리와 저장을 위해 다음 사업자에게 정보를 처리위탁·보관합니다.</p>
 <h3>Neon, LLC (Databricks 계열)</h3><p>국가: 싱가포르(데이터베이스), 미국(사업자 운영·지원)<br>연락처: privacy@databricks.com<br>목적: 응모 데이터베이스 보관·운영<br>항목: 암호화한 이메일, 중복 확인값, 플레이어·게임 기록 식별값, 응모·동의 내역.</p>
 <h3>Vercel Inc.</h3><p>국가: 대한민국(서울 처리 리전), 미국(사업자 운영·지원)<br>연락처: privacy@vercel.com<br>목적: 웹 호스팅·응모 요청 처리<br>항목: 입력 이메일, 게임 기록 식별값, 동의 내역 등 응모 요청 정보.</p>
 <h3>이전 시기·방법</h3><p>응모 버튼을 눌러 접수할 때 및 서비스 운영에 필요한 처리 시 암호화된 네트워크 통신으로 전송합니다.</p>
 <h3>보유·이용 기간</h3><p>${retention}</p>
 <h3>동의 거부·철회</h3><p>체크하지 않으면 국외 이전에 동의하지 않은 것이며 응모 정보가 제출되지 않습니다. 이 경우 이벤트 응모만 제한됩니다. 철회·삭제 요청은 바당소랑 @badang_sorang DM으로 문의해 주세요.</p>`
};
async function api(path,body){
 const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
 const data=await r.json();if(!r.ok)throw Error(data.error||'잠시 후 다시 시도해 주세요.');return data;
}
function paint(){
 const allowed=status?.phase==='open'&&status.run&&!status.entered;
 $('event-submit').disabled=busy||!allowed;
 $('event-email').disabled=busy||!allowed;
 for(const id of ['event-age','event-consent','event-overseas'])$(id).disabled=busy||!allowed;
 $('event-record').textContent=status?.run?`${status.run.nickname} · ${status.run.score}점 · 정화 ${status.run.cleaned}개`:'기간 내 한 판에서 500점·정화 30개를 모두 달성해 주세요.';
 if(status?.entered)$('event-status').textContent='응모 완료! 11월 8일 발표를 기다려 주세요. 중복 응모는 불가해요.';
 else if(status?.phase==='before')$('event-status').textContent='10월 26일부터 응모할 수 있어요. 지금은 이벤트 안내만 볼 수 있어요.';
 else if(status?.phase==='closed')$('event-status').textContent='응모가 마감됐어요. 발표일은 11월 8일이에요.';
 else $('event-status').textContent=allowed?'응모 가능한 기록을 확인했어요.':'게임 기록 저장 후 다시 확인해 주세요.';
}
async function refresh(){
 const current=++ticket;status=null;paint();$('event-status').textContent='응모 가능 여부를 확인하는 중…';
 try{const result=await api('event-status'+(currentRunId?'?runId='+encodeURIComponent(currentRunId):''));if(current!==ticket)return;status=result;paint();}
 catch{if(current===ticket)$('event-status').textContent='연결하지 못했어요. 기록 다시 확인을 눌러 주세요.';}
}
function show(){if(window.oceanLanguage==='en')return; $('event-hide-today').checked=preference.hidden();if(!panel.open){panel.showModal();panel.scrollTop=0;}refresh();}
function autoShow(){if(!preference.hidden())show();}
function close(){if(policy.open)policy.close();panel.close();}
window.addEventListener('ocean-language',e=>{if(e.detail.language==='en')close();});
$('event-hide-today').onchange=()=>preference.set($('event-hide-today').checked);
$('event-open').onclick=show;$('event-close').onclick=close;$('event-back').onclick=close;
$('event-refresh').onclick=refresh;
for(const b of panel.querySelectorAll('[data-policy]'))b.onclick=()=>{
 $('policy-heading').textContent=b.dataset.policy==='collection'?'개인정보 수집·이용 안내':'개인정보 국외 이전 안내';
 $('policy-body').innerHTML=policies[b.dataset.policy];policy.showModal();policy.scrollTop=0;
};
$('policy-close').onclick=() => policy.close();$('policy-back').onclick=() => policy.close();
$('event-form').onsubmit=async e=>{
 e.preventDefault();if(busy||!status?.run||status.phase!=='open'||status.entered)return;
 busy=true;paint();$('event-status').textContent='응모를 접수하고 있어요…';
 try{
  await api('event-entry',{runId:status.run.id,email:$('event-email').value,consent:$('event-consent').checked,overseas:$('event-overseas').checked,age14:$('event-age').checked,version:status.consentVersion});
  status.entered=true;$('event-email').value='';busy=false;paint();
 }catch(error){busy=false;paint();$('event-status').textContent=error.message;}
};
window.addEventListener('ocean-run-started',e=>{currentRunId=e.detail.runId;});
window.addEventListener('ocean-game',e=>{
 if(['title','end'].includes(e.detail.phase)){$('event-open').hidden=false;}
 if(e.detail.phase==='end')autoShow();
 if(['prepare','begin'].includes(e.detail.phase)){$('event-open').hidden=true;close();}
});
window.addEventListener('ocean-record-saved',()=>{
 // Saving may finish after the user closes the popup. Never reopen it here.
 if(panel.open)refresh();
});
// The Unity title event can precede this module on a cached load.
if(document.getElementById('rank-open')?.hidden===false){$('event-open').hidden=false;}

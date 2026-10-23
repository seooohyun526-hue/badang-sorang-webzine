(()=>{
 let language='ko';try{language=localStorage.getItem('ocean.language')||(/^(ko)(-|$)/i.test(navigator.language)?'ko':'en');}catch{}
 if(language!=='en')language='ko';
 window.oceanLanguage=language;
 let unityReady=false;
 function sendLanguage(){if(unityReady)window.unityInstance?.SendMessage('Haenyeo Ocean','SetLanguage',language);}
 const originals=new WeakMap();
 const errors={
  '잠시 후 다시 출발해 주세요.':'Please wait a moment before starting another dive.',
  '새 게임을 시작해 주세요.':'Please start a new dive.',
  '잘못된 게임 기록입니다.':'Invalid game record.',
  '기록을 확인하지 못했습니다.':'Your game record could not be verified.',
  '요청이 너무 큽니다.':'The request is too large.'
 };
 function translate(value){
  if(language!=='en')return value;
  if(window.oceanTranslations[value])return window.oceanTranslations[value];
  if(errors[value])return errors[value];
  return value.replace(/^내 최고 순위 (\d+)위 · (\d+)(점|개)$/,'Your best rank #$1 · $2')
   .replace(/^(\d+)위$/,'#$1').replace(/^(\d+)점$/,'$1 pts').replace(/^(\d+)개$/,'$1');
 }
 window.oceanText=translate;
 function update(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){
   const p=node.parentElement;
   if(!p||p.closest('script,style,#event-panel,#event-policy,#event-open,#language-menu,#language-welcome,#rank-list li span:nth-child(2)'))continue;
   const old=originals.get(node),source=old&&old.output===node.nodeValue?old.source:node.nodeValue;
   const output=translate(source);originals.set(node,{source,output});if(node.nodeValue!==output)node.nodeValue=output;
  }
  for(const el of root.querySelectorAll?.('[placeholder],[aria-label]')||[]){
   for(const attr of ['placeholder','aria-label'])if(el.hasAttribute(attr)){
    const key='oceanOriginal'+attr.replace('-','');if(!el.dataset[key])el.dataset[key]=el.getAttribute(attr);
    el.setAttribute(attr,translate(el.dataset[key]));
   }
  }
 }
 function apply(){
  document.documentElement.lang=language;document.title=language==='en'?'Haenyeo Ocean Path':'해녀의 바당길 · 온라인 해양 정화';
  window.oceanLanguage=language;update(document.body);
  document.querySelector('#language-choice').value=language;
  sendLanguage();
  window.dispatchEvent(new CustomEvent('ocean-language',{detail:{language}}));
 }
 function init(){
  const root=document.getElementById('game');root.dataset.view='loading';
  root.insertAdjacentHTML('beforeend',`<div id="language-menu"><label for="language-choice">Language / 언어</label><select id="language-choice" aria-label="Language / 언어"><option value="ko">한국어</option><option value="en">English</option></select></div>
<dialog id="language-welcome" aria-labelledby="welcome-title" aria-describedby="welcome-intro">
 <div class="welcome-mark" aria-hidden="true">≈</div><p class="welcome-brand">HAENYEO / OCEAN PATH</p>
 <h2 id="welcome-title">Choose your language<span>언어를 선택해 주세요</span></h2>
 <p id="welcome-intro">A pixel adventure under the sea.<br><span>해녀와 함께 떠나는 픽셀 바닷속 모험</span></p>
 <div class="welcome-options"><button type="button" data-language="en"><b>English</b><span>Play in English <i aria-hidden="true">→</i></span></button><button type="button" data-language="ko"><b>한국어</b><span>한국어로 플레이 <i aria-hidden="true">→</i></span></button></div>
 <p class="welcome-tip">Tap to step forward. Swipe to change direction.<br><span>탭해서 전진 · 밀어서 방향 이동</span></p>
</dialog>`);
  const welcome=document.getElementById('language-welcome');
  function choose(value){language=value;try{localStorage.setItem('ocean.language',language);localStorage.setItem('ocean.languageConfirmed.v1','true');}catch{}apply();welcome.close();document.querySelector('canvas')?.focus();}
  document.getElementById('language-choice').onchange=e=>choose(e.target.value);
  for(const button of welcome.querySelectorAll('[data-language]'))button.onclick=()=>choose(button.dataset.language);
  welcome.addEventListener('cancel',e=>e.preventDefault());
  const observer=new MutationObserver(()=>update(document.body));observer.observe(document.body,{childList:true,subtree:true,characterData:true});apply();
  window.addEventListener('ocean-unity-ready',sendLanguage);
  window.addEventListener('ocean-game',e=>{
   if(e.detail.phase==='title'){unityReady=true;sendLanguage();}
   const views={title:'title',end:'ended',begin:'playing',prepare:'preparing'};
   const view=e.detail.phase.startsWith('view-')?e.detail.phase.slice(5):views[e.detail.phase];
   if(view){root.dataset.view=view;document.getElementById('language-menu').hidden=!['title','ended'].includes(view);}
  });
  let confirmed=false;try{confirmed=localStorage.getItem('ocean.languageConfirmed.v1')==='true';}catch{}
  if(!confirmed)welcome.showModal();
 }
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();

// HTML button for GTM click measurement. Existing Unity buttons remain untouched.
(()=>{
 const root=document.getElementById('game'),canvas=document.getElementById('unity-canvas');
 if(!root||!canvas||root.querySelector('.game-to-stories'))return;
 const link=document.createElement('button');
 link.type='button';link.className='game-to-stories';link.hidden=true;
 root.append(link);
 let ended=root.dataset.view==='ended';
 function language(){
  const english=window.oceanLanguage==='en';
  link.textContent=english?'Meet the Haenyeo':'해녀들 이야기 들으러 가기';
 }
 link.onclick=()=>window.location.assign(window.oceanLanguage==='en'?'https://lxwebzine.hankyung.com/2026-1/team6/en/#stories':'https://lxwebzine.hankyung.com/2026-1/team6/#stories');
 function visibility(){
  const ranking=document.getElementById('ranking');
  const blocked=!!document.querySelector('dialog[open]')||!!(ranking&&!ranking.hidden);
  const hidden=!ended||blocked;
  if(link.hidden!==hidden)link.hidden=hidden;
 }
 function layout(){
  const rect=canvas.getBoundingClientRect(),parent=root.getBoundingClientRect();
  // Match the existing CanvasScaler (480 x 900, matchWidthOrHeight=.5).
  const scale=Math.sqrt(rect.width/480*rect.height/900);
  link.style.left=`${rect.left-parent.left+rect.width/2}px`;
  link.style.top=`${rect.top-parent.top+rect.height*.9-28*scale}px`;
  link.style.width=`${320*scale}px`;link.style.height=`${56*scale}px`;
  link.style.fontSize=`${20*scale}px`;
 }
 window.addEventListener('ocean-game',e=>{
  const phase=e.detail.phase;
  if(['end','view-ended'].includes(phase))ended=true;
  else if(['title','prepare','begin','view-title','view-playing','view-paused'].includes(phase))ended=false;
  visibility();layout();
 });
 window.addEventListener('ocean-language',language);
 new MutationObserver(visibility).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden']});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(layout).observe(canvas);
 window.addEventListener('resize',layout);
 language();layout();visibility();
})();

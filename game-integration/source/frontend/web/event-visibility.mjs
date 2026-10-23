export function koreanDay(now=Date.now()){
 return new Date(now+9*60*60*1000).toISOString().slice(0,10);
}
export function popupPreference(storage){
 const key='ocean.event.badang-2026-autumn.hiddenDay';
 let fallback='';
 return {
  hidden(now=Date.now()){let day=fallback;try{day=storage.getItem(key)||'';}catch{}return day===koreanDay(now);},
  set(hidden,now=Date.now()){fallback=hidden?koreanDay(now):'';try{if(hidden)storage.setItem(key,fallback);else storage.removeItem(key);}catch{}}
 };
}

// No minimum intro duration. Download Unity files in parallel and reuse content-versioned caches.
(()=>{
 const root=document.getElementById('game'),canvas=document.getElementById('unity-canvas');
 const manifest=window.oceanBuild||{},loader=document.createElement('script'),started=performance.now();
 const defaults={loaderUrl:'Build/Web.loader.js',dataUrl:'Build/Web.data.unityweb',frameworkUrl:'Build/Web.framework.js.unityweb',codeUrl:'Build/Web.wasm.unityweb'};
 const url=key=>new URL(manifest[key]||defaults[key],document.baseURI).href;
 function fail(error){
  document.getElementById('loading').style.display='flex';
  document.getElementById('status').textContent=window.oceanLanguage==='en'?'Could not load the game':'게임을 불러오지 못했어요';
  document.getElementById('error').style.display='block';document.getElementById('error').textContent=String(error);
  document.getElementById('retry').style.display='block';
 }
 if(location.protocol==='file:'){fail('웹 서버 주소로 접속해 주세요. / Open this game through its website.');return;}
 loader.src=url('loaderUrl');loader.async=true;loader.onerror=()=>fail('인터넷 연결을 확인해 주세요. / Please check your connection.');
 loader.onload=()=>createUnityInstance(canvas,{
  dataUrl:url('dataUrl'),frameworkUrl:url('frameworkUrl'),codeUrl:url('codeUrl'),
  streamingAssetsUrl:new URL('StreamingAssets',document.baseURI).href,
  companyName:'Haenyeo Studio',productName:'Haenyeo Online',productVersion:manifest.version||'0.1.1',
  cacheControl:assetUrl=>/[?&]v=[a-f0-9]{16}(?:&|$)/.test(String(assetUrl))?'immutable':'must-revalidate',
  devicePixelRatio:Math.min(window.devicePixelRatio||1,1.5)
 },p=>{document.getElementById('progress').value=p;}).then(instance=>{
  window.unityInstance=instance;root.dataset.unityLoadMs=String(Math.round(performance.now()-started));
  document.getElementById('loading').style.display='none';canvas.focus();
  window.dispatchEvent(new Event('ocean-unity-ready'));
 }).catch(fail);
 document.body.appendChild(loader);
})();

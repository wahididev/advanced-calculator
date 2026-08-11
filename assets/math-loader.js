// local loader for mathjs: tries to load a local copy first, falls back to CDN; exposes window.math
(function(){
  const local = '/assets/vendor/math.min.js';
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; s.defer = true; document.head.appendChild(s);
    });
  }

  async function init(){
    try{
      // try local vendor
      await loadScript(local);
      if(window.math) return;
    }catch(e){}
    try{
      // fallback to CDN
      await loadScript('https://cdn.jsdelivr.net/npm/mathjs@11.8.0/dist/math.min.js');
    }catch(e){
      console.warn('Failed to load math.js');
    }
  }
  init();
})();

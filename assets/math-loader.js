// assets/math-loader.js
// Now the loader expects a local vendor bundle at /assets/vendor/math.min.js produced by the build script.
// This intentionally removes the CDN fallback to keep the app self-contained.
(function(){
  const local = '/assets/vendor/math.min.js';
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; s.defer = true; document.head.appendChild(s);
    });
  }

  async function init(){
    try{
      await loadScript(local);
      if(window.math) return;
      console.error('Local math bundle loaded but window.math is not available.');
    }catch(e){
      console.error('Local math bundle not found. Please run `npm run build:math` to produce /assets/vendor/math.min.js.');
    }
  }
  init();
})();

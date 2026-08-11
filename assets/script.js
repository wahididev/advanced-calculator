/* name: assets/script.js */
(() => {
  // Elements
  const input = document.getElementById('input');
  const expressionEl = document.getElementById('expression');
  const historyList = document.getElementById('historyList');
  const copyBtn = document.getElementById('copyBtn');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const exportHistoryBtn = document.getElementById('exportHistory');
  const toggleSci = document.getElementById('toggleSci');
  const sciencePanel = document.getElementById('sciencePanel');
  const memDisplay = document.getElementById('memVal');
  const degToggle = document.getElementById('degToggle');
  const helpBtn = document.getElementById('helpBtn');
  const helpOverlay = document.getElementById('helpOverlay');
  const openGraph = document.getElementById('openGraph');
  const graphModal = document.getElementById('graphModal');
  const plotExpr = document.getElementById('plotExpr');
  const plotCanvas = document.getElementById('plotCanvas');
  const closeGraph = document.getElementById('closeGraph');
  const openSolver = document.getElementById('openSolver');
  const solverModal = document.getElementById('solverModal');
  const closeSolver = document.getElementById('closeSolver');
  const solveExpr = document.getElementById('solveExpr');
  const solveGuessA = document.getElementById('solveGuessA');
  const solveGuessB = document.getElementById('solveGuessB');
  const runSolve = document.getElementById('runSolve');
  const solveResult = document.getElementById('solveResult');

  let current = '';
  let memory = 0;
  let degreeMode = true;
  const STORAGE_KEY = 'advanced_calc_history_v1';

  function hasMathJs(){ return typeof math !== 'undefined' && typeof math.evaluate === 'function'; }
  // configure math when loaded
  function configureMath(){
    if(!hasMathJs()) return;
    // BigNumber config & precision
    math.config({ number: 'BigNumber', precision: 64 });
  }

  // calculus helpers
  function numericDerivative(fn, x, h=1e-6){
    return (fn(x+h) - fn(x-h)) / (2*h);
  }
  function numericIntegral(fn, a, b, n=512){
    // composite Simpson's rule (n even)
    if(n%2===1) n++;
    const h = (b-a)/n; let s = fn(a) + fn(b);
    for(let i=1;i<n;i++){
      const x = a + i*h; s += (i%2===0 ? 2 : 4) * fn(x);
    }
    return s * h / 3;
  }

  function evalWithHelpers(expr){
    if(!hasMathJs()) throw new Error('math.js missing');
    // preprocess
    expr = String(expr).replace(/[××]/g, '*').replace(/[÷]/g, '/').replace(/−/g, '-');
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    const scope = {};
    // nCr, nPr
    scope.nCr = (n,k)=>{ n=Number(n); k=Number(k); if(n<0||k<0||k>n) return NaN; return math.factorial(n).div(math.factorial(k).mul(math.factorial(n-k))); };
    scope.nPr = (n,k)=>{ n=Number(n); k=Number(k); if(n<0||k<0||k>n) return NaN; return math.factorial(n).div(math.factorial(n-k)); };
    // degree/radian trig wrappers
    if(degreeMode){
      scope.sin = (x)=> math.sin(math.bignumber(x).mul(math.pi).div(180));
      scope.cos = (x)=> math.cos(math.bignumber(x).mul(math.pi).div(180));
      scope.tan = (x)=> math.tan(math.bignumber(x).mul(math.pi).div(180));
      scope.asin = (x)=> math.asin(x).mul(180).div(math.pi);
      scope.acos = (x)=> math.acos(x).mul(180).div(math.pi);
      scope.atan = (x)=> math.atan(x).mul(180).div(math.pi);
    }
    // derivative and integral helper functions exposed to users
    scope.derivative = (f, v)=>{
      // return symbolic derivative string if possible
      try{ const d = math.derivative(f, v); return d.toString(); }catch(e){ return null; }
    };
    scope.integral = (f,a,b)=>{
      // numeric integrate f over [a,b]
      const fn = (x)=> Number(math.evaluate(f, Object.assign({}, scope, {x})).toString());
      return numericIntegral(fn, Number(a), Number(b));
    };

    // complex, matrix, units handled by math.js itself
    const res = math.evaluate(expr, scope);
    // convert BigNumber results to string
    if(math.typeof(res) === 'BigNumber') return res.toString();
    return res;
  }

  function safeEval(expr){
    if(hasMathJs()) return evalWithHelpers(expr);
    // minimal fallback
    if(!/^[0-9+\-*/(). %]+$/.test(expr)) throw new Error('Invalid characters');
    expr = expr.replace(/[××]/g, '*').replace(/[÷]/g, '/').replace(/−/g, '-');
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    return Function(`"use strict";return (${expr})`)();
  }

  function setExpression(val){ current = val; expressionEl.textContent = val || '0'; input.value = val; }

  function pushHistory(expr,res){ const list = loadHistory(); list.unshift({expr,res,at:Date.now()}); if(list.length>500) list.pop(); localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); renderHistory(); }
  function loadHistory(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }catch(e){return []} }
  function renderHistory(){ const list = loadHistory(); historyList.innerHTML=''; for(const item of list){ const li=document.createElement('li'); const left=document.createElement('div'); left.className='expr'; left.textContent=item.expr; const right=document.createElement('div'); right.className='res'; right.textContent=item.res; li.appendChild(left); li.appendChild(right); li.tabIndex=0; li.addEventListener('click', ()=>{ setExpression(item.res + ''); input.focus(); }); historyList.appendChild(li); } }

  // UI wiring
  document.querySelectorAll('[data-value]').forEach(btn=>{ btn.addEventListener('click', ()=>{ const val = btn.dataset.value; const start = input.selectionStart || input.value.length; const next = input.value.slice(0,start) + val + input.value.slice(start); setExpression(next); input.focus(); input.setSelectionRange(start + val.length, start + val.length); }); });
  document.querySelector('[data-action="clear"]').addEventListener('click', ()=>{ setExpression(''); input.focus(); });
  document.querySelector('[data-action="back"]').addEventListener('click', ()=>{ const v = input.value || ''; setExpression(v.slice(0,-1)); input.focus(); });
  document.querySelector('[data-action="equals"]').addEventListener('click', compute);

  copyBtn.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(input.value||expressionEl.textContent); copyBtn.textContent='Copied ✓'; setTimeout(()=>copyBtn.textContent='Copy result',1200);}catch(e){copyBtn.textContent='Copy failed';setTimeout(()=>copyBtn.textContent='Copy result',1200);} });
  clearHistoryBtn.addEventListener('click', ()=>{ localStorage.removeItem(STORAGE_KEY); renderHistory(); });
  exportHistoryBtn.addEventListener('click', ()=>{ const data = JSON.stringify(loadHistory(), null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'calculator-history.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });

  // memory
  document.getElementById('mc').addEventListener('click', ()=>{ memory=0; updateMem(); });
  document.getElementById('mr').addEventListener('click', ()=>{ setExpression(String(memory)); input.focus(); });
  document.getElementById('mPlus').addEventListener('click', ()=>{ try{ const val = Number(safeEval(input.value||expressionEl.textContent)||0); memory += val; updateMem(); }catch(e){} });
  document.getElementById('mMinus').addEventListener('click', ()=>{ try{ const val = Number(safeEval(input.value||expressionEl.textContent)||0); memory -= val; updateMem(); }catch(e){} });
  function updateMem(){ memDisplay.textContent = String(memory); }

  toggleSci.addEventListener('click', ()=>{ const visible = !sciencePanel.hidden; sciencePanel.hidden = visible; toggleSci.textContent = visible ? 'Hide scientific' : 'Show scientific'; });

  degToggle.addEventListener('click', ()=>{ degreeMode = !degreeMode; degToggle.textContent = degreeMode ? 'Deg' : 'Rad'; degToggle.setAttribute('aria-pressed', String(degreeMode)); input.focus(); });

  helpBtn.addEventListener('click', ()=>{ helpOverlay.hidden = false; });
  document.getElementById('closeHelp').addEventListener('click', ()=>{ helpOverlay.hidden = true; });

  // Graph modal
  openGraph.addEventListener('click', ()=>{ graphModal.hidden = false; });
  closeGraph.addEventListener('click', ()=>{ graphModal.hidden = true; });
  document.getElementById('plotExpr').addEventListener('keydown', (e)=>{ if(e.key==='Enter') runPlot(); });
  document.getElementById('openGraph').addEventListener('click', ()=>{ plotExpr.focus(); });

  function runPlot(){
    const expr = plotExpr.value.trim(); if(!expr) return;
    if(!hasMathJs()){ alert('math.js not loaded yet'); return; }
    try{
      const fn = (x)=> Number(math.evaluate(expr, {x}));
      window.AdvCalcPlot.plot(plotCanvas, fn, { xmin:-10, xmax:10, ymin:-5, ymax:5 });
    }catch(e){ console.error(e); alert('Plot failed: '+e.message); }
  }
  document.getElementById('plotExpr').addEventListener('input', ()=>{ /* live preview possible */ });

  // Solver modal
  openSolver.addEventListener('click', ()=>{ solverModal.hidden = false; });
  closeSolver.addEventListener('click', ()=>{ solverModal.hidden = true; });
  runSolve.addEventListener('click', runSolver);

  function runSolver(){
    const expr = solveExpr.value.trim(); const a = Number(solveGuessA.value); const b = Number(solveGuessB.value);
    if(!expr) return; if(!hasMathJs()){ solveResult.textContent = 'math.js not ready'; return; }
    try{
      // simple bisection using math.evaluate
      let fa = math.evaluate(expr, {x:a}); let fb = math.evaluate(expr, {x:b}); if(fa===0) { solveResult.textContent = 'Root: '+a; return; } if(fb===0) { solveResult.textContent = 'Root: '+b; return; }
      if(fa*fb>0){ solveResult.textContent = 'f(a) and f(b) must have opposite signs for bisection.'; return; }
      let lo=a, hi=b, mid; for(let i=0;i<60;i++){ mid=(lo+hi)/2; const fm=math.evaluate(expr,{x:mid}); if(fm===0) break; if(fa*fm<0) { hi=mid; fb=fm; } else { lo=mid; fa=fm; } }
      solveResult.textContent = 'Root ≈ '+mid;
    }catch(e){ solveResult.textContent = 'Solve error: '+e.message; }
  }

  // keyboard & shortcuts
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ compute(); e.preventDefault(); } if(e.key==='Escape'){ setExpression(''); } });
  document.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.key==='h'){ helpOverlay.hidden = false; } });

  function compute(){ const expr = (input.value || expressionEl.textContent).trim(); if(!expr) return; try{ const res = safeEval(expr); setExpression(String(res)); pushHistory(expr, String(res)); }catch(err){ expressionEl.textContent = 'Error'; setTimeout(()=>{ expressionEl.textContent = expr; },900); } }

  // init
  setExpression(''); renderHistory(); updateMem();

  // attempt to configure math repeatedly until loaded
  const mathInit = setInterval(()=>{ if(hasMathJs()){ configureMath(); clearInterval(mathInit); } },200);

})();

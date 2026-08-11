/* name: assets/script.js */
(() => {
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

  let current = '';
  let memory = 0;
  let degreeMode = true; // default to degrees for usability
  const STORAGE_KEY = 'advanced_calc_history_v1';

  // Try to use mathjs if available; fallback to a small evaluator
  function hasMathJs(){ return typeof math !== 'undefined' && typeof math.evaluate === 'function'; }

  function evalWithMathJS(expr){
    // Preprocess expression: replace unicode symbols
    expr = expr.replace(/[××]/g, '*').replace(/[÷]/g, '/').replace(/−/g, '-');
    // percent: convert 50% to (50/100)
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    // Build a scope with helpers and trig conversions when in degree mode
    const scope = {};

    // Add nCr and nPr helpers using factorial to avoid depending on math.combinations
    scope.nCr = function(n,k){
      n = Number(n); k = Number(k);
      if(n<0 || k<0 || k>n) return NaN;
      return math ? (math.factorial(n) / (math.factorial(k) * math.factorial(n - k))) : NaN;
    };
    scope.nPr = function(n,k){
      n = Number(n); k = Number(k);
      if(n<0 || k<0 || k>n) return NaN;
      return math ? (math.factorial(n) / math.factorial(n - k)) : NaN;
    };

    if(degreeMode){
      // override trig functions to accept degrees
      scope.sin = function(x){ return math.sin(x * math.pi / 180); };
      scope.cos = function(x){ return math.cos(x * math.pi / 180); };
      scope.tan = function(x){ return math.tan(x * math.pi / 180); };
      // inverse trigs return degrees
      scope.asin = function(x){ return math.asin(x) * 180 / math.pi; };
      scope.acos = function(x){ return math.acos(x) * 180 / math.pi; };
      scope.atan = function(x){ return math.atan(x) * 180 / math.pi; };
    }

    // Provide a safe 'factorial' alias if user uses n! notation, mathjs understands it but keep alias
    scope.factorial = function(x){ return math.factorial(x); };

    // safe evaluate with provided scope
    return math.evaluate(expr, scope);
  }

  function safeEval(expr){
    if(hasMathJs()){
      return evalWithMathJS(expr);
    }
    // fallback: restrict characters and use Function for very basic math
    if(!/^[0-9+\-*/(). %]+$/.test(expr)) throw new Error('Invalid characters');
    expr = expr.replace(/[××]/g, '*').replace(/[÷]/g, '/').replace(/−/g, '-');
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    return Function(`"use strict";return (${expr})`)();
  }

  function setExpression(val){
    current = val;
    expressionEl.textContent = val || '0';
    input.value = val;
  }

  function pushHistory(expr,res){
    const list = loadHistory();
    list.unshift({expr,res,at:Date.now()});
    if(list.length>200) list.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderHistory();
  }

  function loadHistory(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }catch(e){return []}
  }

  function renderHistory(){
    const list = loadHistory();
    historyList.innerHTML = '';
    for(const item of list){
      const li = document.createElement('li');
      const left = document.createElement('div'); left.className='expr'; left.textContent = item.expr;
      const right = document.createElement('div'); right.className='res'; right.textContent = item.res;
      li.appendChild(left); li.appendChild(right);
      li.tabIndex = 0;
      li.addEventListener('click', ()=>{ setExpression(item.res + ''); input.focus(); });
      historyList.appendChild(li);
    }
  }

  document.querySelectorAll('[data-value]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const val = btn.dataset.value;
      // insert value at cursor position
      const start = input.selectionStart || input.value.length;
      const next = input.value.slice(0,start) + val + input.value.slice(start);
      setExpression(next);
      input.focus();
      input.setSelectionRange(start + val.length, start + val.length);
    });
  });
  document.querySelector('[data-action="clear"]').addEventListener('click', ()=>{ setExpression(''); input.focus(); });
  document.querySelector('[data-action="back"]').addEventListener('click', ()=>{ const v = input.value || ''; setExpression(v.slice(0,-1)); input.focus(); });
  document.querySelector('[data-action="equals"]').addEventListener('click', compute);

  document.getElementById('copyBtn').addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(input.value||expressionEl.textContent); copyBtn.textContent='Copied ✓'; setTimeout(()=>copyBtn.textContent='Copy result',1200);}catch(e){copyBtn.textContent='Copy failed';setTimeout(()=>copyBtn.textContent='Copy result',1200);}  
  });

  clearHistoryBtn.addEventListener('click', ()=>{ localStorage.removeItem(STORAGE_KEY); renderHistory(); });

  exportHistoryBtn.addEventListener('click', ()=>{
    const data = JSON.stringify(loadHistory(), null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'calculator-history.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // memory buttons
  document.getElementById('mc').addEventListener('click', ()=>{ memory = 0; updateMem(); });
  document.getElementById('mr').addEventListener('click', ()=>{ setExpression(String(memory)); input.focus(); });
  document.getElementById('mPlus').addEventListener('click', ()=>{ try{ const val = Number(safeEval(input.value||expressionEl.textContent)||0); memory += val; updateMem(); }catch(e){} });
  document.getElementById('mMinus').addEventListener('click', ()=>{ try{ const val = Number(safeEval(input.value||expressionEl.textContent)||0); memory -= val; updateMem(); }catch(e){} });
  function updateMem(){ memDisplay.textContent = String(memory); }

  toggleSci.addEventListener('click', ()=>{
    const visible = !sciencePanel.hidden;
    sciencePanel.hidden = visible;
    toggleSci.textContent = visible ? 'Hide scientific' : 'Show scientific';
  });

  degToggle.addEventListener('click', ()=>{
    degreeMode = !degreeMode;
    degToggle.textContent = degreeMode ? 'Deg' : 'Rad';
    degToggle.setAttribute('aria-pressed', String(degreeMode));
    input.focus();
  });

  function compute(){
    const expr = (input.value || expressionEl.textContent).trim();
    if(!expr) return;
    try{
      const res = safeEval(expr);
      setExpression(String(res));
      pushHistory(expr, String(res));
    }catch(err){
      expressionEl.textContent = 'Error';
      setTimeout(()=>{ expressionEl.textContent = expr; },900);
    }
  }

  // keyboard support
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter') { compute(); e.preventDefault(); }
    if(e.key === 'Escape') { setExpression(''); }
    if(e.key === 'Backspace') return; // handled by native input
    // allow letters for function names when mathjs is present
    if(e.key.length===1 && !hasMathJs() && !/^[0-9+\-*/(). %]$/.test(e.key)){
      e.preventDefault();
    }
  });

  // init
  setExpression('');
  renderHistory();
  updateMem();
  degToggle.textContent = degreeMode ? 'Deg' : 'Rad';
  degToggle.setAttribute('aria-pressed', String(degreeMode));

})();

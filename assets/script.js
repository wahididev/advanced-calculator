/* name: assets/script.js */
(() => {
  const input = document.getElementById('input');
  const expressionEl = document.getElementById('expression');
  const historyList = document.getElementById('historyList');
  const copyBtn = document.getElementById('copyBtn');
  const clearHistoryBtn = document.getElementById('clearHistory');

  let current = '';
  const STORAGE_KEY = 'advanced_calc_history_v1';

  function safeEval(expr){
    // allow only digits, operators, parentheses, decimal point and spaces
    if(!/^[0-9+\-*/(). %]+$/.test(expr)) throw new Error('Invalid characters');
    // replace unicode minus and multiply/divide with JS operators
    expr = expr.replace(/[××]/g, '*').replace(/[÷]/g, '/').replace(/−/g, '-');
    // simple percent handling: convert 50% -> (50/100)
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    // eslint-disable-next-line no-new-func
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
    if(list.length>50) list.pop();
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
      setExpression((input.value || '') + btn.dataset.value);
      input.focus();
    });
  });
  document.querySelector('[data-action="clear"]').addEventListener('click', ()=>{ setExpression(''); });
  document.querySelector('[data-action="back"]').addEventListener('click', ()=>{ setExpression((input.value||'').slice(0,-1)); });
  document.querySelector('[data-action="equals"]').addEventListener('click', compute);

  document.getElementById('copyBtn').addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(input.value||expressionEl.textContent); copyBtn.textContent='Copied ✓'; setTimeout(()=>copyBtn.textContent='Copy result',1200);}catch(e){copyBtn.textContent='Copy failed';setTimeout(()=>copyBtn.textContent='Copy result',1200);}  
  });

  clearHistoryBtn.addEventListener('click', ()=>{ localStorage.removeItem(STORAGE_KEY); renderHistory(); });

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
    // restrict to allowed keys for friendliness
    if(e.key.length===1 && !/^[0-9+\-*/(). %]$/.test(e.key)){
      e.preventDefault();
    }
  });

  // ensure visible expression sync for non-JS or screen-readers
  setExpression('');
  renderHistory();
})();

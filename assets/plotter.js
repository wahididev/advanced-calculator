// small plotting utilities — simple sampled line plot on canvas
window.AdvCalcPlot = (function(){
  function plot(canvas, fn, opts={}){
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#071029'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
    const samples = opts.samples || 800;
    const xmin = opts.xmin || -10, xmax = opts.xmax || 10;
    const ymin = opts.ymin ?? -5, ymax = opts.ymax ?? 5;
    ctx.beginPath();
    for(let i=0;i<samples;i++){
      const t = i/(samples-1);
      const x = xmin + t*(xmax-xmin);
      let y;
      try{ y = fn(x); if(y==null || !isFinite(y)) { ctx.moveTo((i/samples)*w, h/2); continue; } }catch(e){ continue; }
      const px = (x - xmin)/(xmax-xmin)*w;
      const py = h - (y - ymin)/(ymax-ymin)*h;
      if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();
    // axis
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    // x axis
    const zeroY = h - (0 - ymin)/(ymax-ymin)*h;
    ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();
    // y axis
    const zeroX = (0 - xmin)/(xmax-xmin)*w;
    ctx.beginPath(); ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, h); ctx.stroke();
  }
  return { plot };
})();

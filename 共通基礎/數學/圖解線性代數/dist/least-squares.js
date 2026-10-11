"use strict";
(() => {
  const $ = id => document.getElementById(id);
  function update() {
    const h=Number($('middle').value),m=Number($('slope').value),c=Number($('intercept').value);
    const data=[1,h,3],pred=data.map((_,x)=>m*x+c),errors=data.map((y,x)=>y-pred[x]);
    const bestC=(h+1)/3, bestPred=data.map((_,x)=>x+bestC);
    const sse=errors.reduce((sum,e)=>sum+e*e,0),bestSSE=2*(h-2)*(h-2)/3;
    $('middle-value').textContent=LA.fmt(h);$('slope-value').textContent=LA.fmt(m);$('intercept-value').textContent=LA.fmt(c);
    const lo=Math.floor(Math.min(0,...data,...pred,...bestPred))-1,hi=Math.ceil(Math.max(0,...data,...pred,...bestPred))+1;
    const scale=Math.min(52,310/(hi-lo)),X=x=>265+(x-1)*scale,Y=y=>225-((y-(lo+hi)/2)*scale);
    let g='<defs><clipPath id="fit-clip"><rect x="55" y="62" width="425" height="326"/></clipPath></defs>';
    for(let y=lo;y<=hi;y++){
      g+=LA.line(55,Y(y),480,Y(y),'gridline');
      if(y!==0)g+=LA.text(X(0)-10,Y(y)+5,y,'svg-small','end');
    }
    const xlo=(55-265)/scale+1,xhi=(480-265)/scale+1;
    for(let x=Math.ceil(xlo);x<=Math.floor(xhi);x++){
      g+=LA.line(X(x),62,X(x),388,'gridline');
      if(x!==0)g+=LA.text(X(x),Y(0)+21,x,'svg-small','middle');
    }
    g+=LA.line(55,Y(0),480,Y(0))+LA.line(X(0),62,X(0),388);
    g+=LA.text(471,Y(0)-9,'x','svg-label','end')+LA.text(X(0)+11,77,'y','svg-label')+LA.text(X(0)-10,Y(0)+21,'0','svg-small','end');
    g+=`<g clip-path="url(#fit-clip)"><line x1="55" y1="${Y(m*xlo+c)}" x2="480" y2="${Y(m*xhi+c)}" stroke="#345ce8" stroke-width="4"/><line x1="55" y1="${Y(xlo+bestC)}" x2="480" y2="${Y(xhi+bestC)}" stroke="#d96650" stroke-width="3" stroke-dasharray="9 5"/></g>`;
    data.forEach((y,x)=>{
      g+=`<line x1="${X(x)}" y1="${Y(y)}" x2="${X(x)}" y2="${Y(pred[x])}" stroke="#a5a42a" stroke-width="5"/>`;
      g+=`<circle cx="${X(x)}" cy="${Y(pred[x])}" r="5" fill="#fff" stroke="#345ce8" stroke-width="2"/>`;
      g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="#182849"/>`;
    });
    g+=LA.text(30,28,'藍實線：目前的線','svg-label')+LA.text(274,28,'珊瑚虛線：最佳線','svg-label')+LA.text(542,28,'把落差變成三個方塊','svg-label');
    g+=LA.text(670,82,'三筆落差（殘差 e）','svg-title','middle');
    const squareScale=56/Math.max(1,...errors.map(Math.abs));
    errors.forEach((e,i)=>{
      const cx=570+i*93,side=Math.abs(e)*squareScale;
      g+=LA.text(cx,120,'第 '+(i+1)+' 筆','svg-small','middle');
      g+=LA.text(cx,146,LA.fmt(e,2),'svg-label','middle');
      g+=side>.001 ? `<rect x="${cx-side/2}" y="${234-side}" width="${side}" height="${side}" fill="#e5df77" stroke="#a5a42a"/>` : `<circle cx="${cx}" cy="234" r="3" fill="#a5a42a"/>`;
      g+=LA.text(cx,263,'平方 '+LA.fmt(e*e,2),'svg-small','middle');
    });
    g+=LA.text(670,308,'SSE = '+LA.fmt(sse,3),'svg-title','middle');
    g+=LA.text(670,338,'三個方塊使用相同縮放','svg-small','middle');
    g+=LA.text(670,362,'誤差為 0 時畫成小點','svg-small','middle');
    g+=LA.text(266,420,'黑點：資料；空心點：預測；兩軸等比例。','svg-small','middle');
    $('drawing').innerHTML=g;
    $('result-primary').textContent='SSE = '+LA.fmt(sse,3)+'；目前 m = '+LA.fmt(m)+'，c = '+LA.fmt(c);
    $('result-secondary').textContent='m* = 1，c* = '+LA.fmt(bestC,3)+'；最佳 SSE = '+LA.fmt(bestSSE,3);
    const best = Math.abs(sse-bestSSE)<1e-8;
    $('feedback').textContent='目前殘差為 ('+errors.map(e=>LA.fmt(e,3)).join(', ')+')。'+(best?'這條線已達到此資料的最小誤差平方和。':'目前 SSE 比最佳值多 '+LA.fmt(sse-bestSSE,3)+'；移動中間點只改資料，你的斜率與截距旋鈕會保留原值。')+(bestSSE<1e-8?' 這三點共線，最佳線能全部穿過。':' 這三點不共線，所以最佳 SSE 仍大於 0。');
    $('plot-desc').textContent='資料點為 (0, 1)、(1, '+LA.fmt(h)+')、(2, 3)。目前斜率 '+LA.fmt(m)+'、截距 '+LA.fmt(c)+'，三筆殘差 '+errors.map(e=>LA.fmt(e,3)).join('、')+'，SSE '+LA.fmt(sse,3)+'。最佳斜率 1、截距 '+LA.fmt(bestC,3)+'、SSE '+LA.fmt(bestSSE,3)+'。';
  }
  LA.bind(['middle','slope','intercept'],update,{middle:3,slope:1,intercept:1});
})();

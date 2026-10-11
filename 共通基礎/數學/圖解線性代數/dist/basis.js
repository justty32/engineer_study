"use strict";
(() => {
 const el=id=>document.getElementById(id);
 const names={independent:'不共線',collinear:'共線',zero:'含零向量'};
 function update(){
  const mode=el('mode').value,a=Number(el('a').value),b=Number(el('b').value);
  const v=mode==='independent'?[1,1]:mode==='collinear'?[2,0]:[0,0],first=[a,0],second=[b*v[0],b*v[1]],w=[a+b*v[0],b*v[1]],rank=mode==='independent'?2:1;
  el('mode-value').textContent=names[mode];el('a-value').textContent=LA.fmt(a);el('b-value').textContent=LA.fmt(b);
  const {X,Y,axes}=LA.plane({cx:410,cy:229,scale:39,extentX:8,extentY:4});
  let svg=mode==='independent'?'<rect x="98" y="73" width="624" height="312" fill="#e5ebff" opacity=".6"/>':'<path d="M98 229H722" stroke="#e5ef68" stroke-width="17" opacity=".6"/>';
  svg+=axes+LA.text(28,28,'材料：u = (1, 0)，v = '+LA.vec(v),'svg-title');
  svg+=LA.line(X(0),Y(0),X(second[0]),Y(second[1]),'tangent');
  svg+=LA.line(X(second[0]),Y(second[1]),X(w[0]),Y(w[1]),'tangent');
  svg+=LA.arrow(X(0),Y(0),X(w[0]),Y(w[1]),'ink');
  svg+=LA.arrow(X(0),Y(0),X(first[0]),Y(first[1]),'blue');
  svg+=LA.arrow(X(first[0]),Y(first[1]),X(w[0]),Y(w[1]),'coral');
  svg+=LA.dot(X(w[0]),Y(w[1]));
  svg+=LA.text(X(w[0])+(w[0]>=0?12:-12),Y(w[1])-15,'w '+LA.vec(w),'svg-label',w[0]>=0?'start':'end');
  svg+=LA.text(28,419,'藍 a u '+LA.vec(first)+'；珊瑚 b v '+LA.vec(second),'svg-label');
  svg+=LA.text(790,419,rank===2?'生成：整個平面':'生成：整條 x 軸','svg-label','end');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='w = '+LA.vec(w);
  el('result-secondary').textContent='生成空間維度 '+rank;
  let why='';
  if(mode==='independent')why='兩支箭頭不共線：係數可取任意實數時，能到達整個平面，而且每個位置的係數唯一。目前配方是 ('+LA.fmt(a)+', '+LA.fmt(b)+')。';
  else if(mode==='collinear')why='v = 2u，無法提供新方向。('+LA.fmt(a)+', '+LA.fmt(b)+') 與 ('+LA.fmt(a+2)+', '+LA.fmt(b-1)+') 這兩組係數都得到 '+LA.vec(w)+'，所以配方不唯一。';
  else why='v 是零向量，不論 b 如何改變都不影響結果。只有非零 u 提供的水平線，因此維度是 1，配方不唯一。';
  el('feedback').textContent=why+'滑桿的有限範圍只供示範；完整生成空間沒有這個限制。'+(w[0]===0&&w[1]===0?'目前結果是零向量，方向未定。':'');
 }
 LA.bind(['mode','a','b'],update,{mode:'independent',a:1,b:1});
})();

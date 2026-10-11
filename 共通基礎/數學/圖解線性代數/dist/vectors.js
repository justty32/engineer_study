"use strict";
(() => {
 const el=id=>document.getElementById(id);
 function update(){
  const a=Number(el('a').value),b=Number(el('b').value),u=[2*a,0],v=[b,2*b],w=[2*a+b,2*b];
  el('a-value').textContent=LA.fmt(a);el('b-value').textContent=LA.fmt(b);
  const {X,Y,axes}=LA.plane({cx:410,cy:229,scale:39,extentX:8,extentY:4});
  let svg=axes+LA.text(28,28,'固定材料：u = (2, 0)，v = (1, 2)','svg-title');
  svg+=LA.line(X(0),Y(0),X(v[0]),Y(v[1]),'tangent');
  svg+=LA.line(X(v[0]),Y(v[1]),X(w[0]),Y(w[1]),'tangent');
  svg+=LA.arrow(X(0),Y(0),X(w[0]),Y(w[1]),'ink');
  svg+=LA.arrow(X(0),Y(0),X(u[0]),Y(u[1]),'blue');
  svg+=LA.arrow(X(u[0]),Y(u[1]),X(w[0]),Y(w[1]),'coral');
  svg+=LA.dot(X(w[0]),Y(w[1]));
  svg+=LA.text(X(w[0])+(w[0]>=0?12:-12),Y(w[1])-13,'w '+LA.vec(w),'svg-label',w[0]>=0?'start':'end');
  svg+=LA.text(28,419,'藍：a u = '+LA.vec(u),'svg-label');
  svg+=LA.text(790,419,'珊瑚：b v = '+LA.vec(v),'svg-label','end');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='w = '+LA.vec(w);
  el('result-secondary').textContent=LA.fmt(a)+' u + '+LA.fmt(b)+' v';
  let why='水平：2 × '+LA.fmt(a)+' + '+LA.fmt(b)+' = '+LA.fmt(w[0])+'；垂直：2 × '+LA.fmt(b)+' = '+LA.fmt(w[1])+'。';
  if(a===0&&b===0)why+='兩支箭頭都縮成零向量；總和也是零向量，方向未定。';
  else if(a<0||b<0)why+='負係數把對應箭頭反向。首尾相接後，起點到終點就是總和。';
  else if(a===0||b===0)why+='係數為 0 的那支箭頭不再提供移動，結果只剩另一支的貢献。';
  else why+='虛線是交換先後順序的另一條路；終點相同。';
  el('feedback').textContent=why;
 }
 LA.bind(['a','b'],update,{a:1,b:1});
})();

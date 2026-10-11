"use strict";
(() => {
 const el=id=>document.getElementById(id);
 function update(){
  const x=Number(el('x').value),y=Number(el('y').value),length=Math.hypot(x,y);
  el('x-value').textContent=LA.fmt(x);el('y-value').textContent=LA.fmt(y);
  const {X,Y,axes}=LA.plane({cx:410,cy:228,scale:39,extentX:7,extentY:4});
  let svg=axes;
  svg+=LA.text(28,28,'先走水平分量，再走垂直分量','svg-title');
  svg+=LA.line(X(x),Y(y),X(0),Y(y),'tangent');
  svg+=LA.arrow(X(0),Y(0),X(x),Y(0),'coral');
  svg+=LA.arrow(X(x),Y(0),X(x),Y(y),'yellow');
  svg+=LA.arrow(X(0),Y(0),X(x),Y(y),'blue');
  svg+=LA.dot(X(x),Y(y));
  svg+=LA.text(X(x)+(x>=0?13:-13),Y(y)-14,LA.vec([x,y]),'svg-label',x>=0?'start':'end');
  svg+=LA.text(30,419,'水平 '+LA.fmt(x)+' 格；垂直 '+LA.fmt(y)+' 格','svg-label');
  svg+=LA.text(790,419,'直接距離 '+LA.fmt(length)+' 格','svg-label','end');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='v = '+LA.vec([x,y]);
  el('result-secondary').textContent='長度 '+LA.fmt(length);
  const walk=(x===0?'水平不動':x>0?'向右 '+LA.fmt(x)+' 格':'向左 '+LA.fmt(-x)+' 格')+'，'+(y===0?'垂直不動':y>0?'向上 '+LA.fmt(y)+' 格':'向下 '+LA.fmt(-y)+' 格');
  el('feedback').textContent=length===0?'兩個分量都是 0：這是零向量，長度為 0，方向未定。':walk+'。長度 = √('+LA.fmt(x*x)+' + '+LA.fmt(y*y)+') = '+LA.fmt(length)+'；正負號表示移動方向，長度始終非負。';
 }
 LA.bind(['x','y'],update,{x:3,y:2});
})();

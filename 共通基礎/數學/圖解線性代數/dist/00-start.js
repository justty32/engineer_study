"use strict";
(() => {
 const el=id=>document.getElementById(id);
 function update(){
  const x=Number(el('x').value),y=Number(el('y').value),length=Math.hypot(x,y);
  el('x-value').textContent=LA.fmt(x);el('y-value').textContent=LA.fmt(y);
  const {X,Y,axes}=LA.plane({cx:410,cy:228,scale:39,extentX:7,extentY:4});
  let svg=axes;
  svg+=LA.text(28,28,'先左右，再上下；藍色箭頭記整段移動','svg-title');
  svg+=LA.line(X(x),Y(y),X(0),Y(y),'tangent');
  svg+=LA.arrow(X(0),Y(0),X(x),Y(0),'coral');
  svg+=LA.arrow(X(x),Y(0),X(x),Y(y),'yellow');
  svg+=LA.arrow(X(0),Y(0),X(x),Y(y),'blue');
  svg+=LA.dot(X(x),Y(y));
  const labelX=X(x)+(x===0?40:x>0?18:-18);
  const labelY=Y(y)+(y===-1?27:y===0?-34:-14);
  svg+=LA.text(labelX,labelY,'禮物／終點 '+LA.vec([x,y]),'svg-label',x>=0?'start':'end');
  svg+=LA.text(30,419,'左右 '+LA.fmt(x)+' 格；上下 '+LA.fmt(y)+' 格','svg-label');
  svg+=LA.text(790,419,'直接距離 '+LA.fmt(length)+' 格','svg-label','end');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='v = '+LA.vec([x,y]);
  el('result-secondary').textContent='長度 '+LA.fmt(length);
  const walk=(x===0?'水平不動':x>0?'向右 '+LA.fmt(x)+' 格':'向左 '+LA.fmt(-x)+' 格')+'，'+(y===0?'垂直不動':y>0?'向上 '+LA.fmt(y)+' 格':'向下 '+LA.fmt(-y)+' 格');
  el('feedback').textContent=length===0?'兩個數都是 0：留在原地。箭頭縮成一個點，這就是零向量；長度為 0，沒有確定方向。':walk+'。藍色箭頭把起點和終點連起來，直線距離是 '+LA.fmt(length)+' 格。改一個數字，就只改那個方向的移動。';
 }
 LA.bind(['x','y'],update,{x:3,y:2});
})();

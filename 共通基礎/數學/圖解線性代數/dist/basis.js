"use strict";
(() => {
 const el=id=>document.getElementById(id);
 const names={independent:'斜走：右 1、上 1',collinear:'水平：右 2、上 0',zero:'不動：右 0、上 0'};
 function update(){
  const mode=el('mode').value,a=Number(el('a').value),b=Number(el('b').value);
  const v=mode==='independent'?[1,1]:mode==='collinear'?[2,0]:[0,0],first=[a,0],second=[b*v[0],b*v[1]],w=[a+b*v[0],b*v[1]],rank=mode==='independent'?2:1;
  el('mode-value').textContent=names[mode];el('a-value').textContent=LA.fmt(a);el('b-value').textContent=LA.fmt(b);
  const {X,Y,axes}=LA.plane({cx:410,cy:229,scale:39,extentX:8,extentY:4});
  let svg=mode==='independent'?'<rect x="98" y="73" width="624" height="312" fill="#e5ebff" opacity=".6"/>':'<path d="M98 229H722" stroke="#e5ef68" stroke-width="17" opacity=".6"/>';
  svg+=axes+LA.text(28,28,'水平卡 u = (1, 0)，第二張卡 v = '+LA.vec(v),'svg-title');
  svg+=LA.line(X(0),Y(0),X(first[0]),Y(first[1]),'tangent');
  svg+=LA.line(X(first[0]),Y(first[1]),X(w[0]),Y(w[1]),'tangent');
  svg+=LA.arrow(X(0),Y(0),X(w[0]),Y(w[1]),'ink');
  svg+=LA.arrow(X(0),Y(0),X(second[0]),Y(second[1]),'coral');
  svg+=LA.arrow(X(second[0]),Y(second[1]),X(w[0]),Y(w[1]),'blue');
  svg+=LA.dot(X(w[0]),Y(w[1]));
  const labelX=X(w[0])+(w[0]===0?40:w[0]>0?12:-12);
  const labelY=Y(w[1])+(w[1]<0&&w[1]>=-1?27:w[1]===0?-34:-14);
  svg+=LA.text(labelX,labelY,'w '+LA.vec(w),'svg-label',w[0]>=0?'start':'end');
  svg+=LA.text(28,419,'藍 a u '+LA.vec(first)+'；珊瑚 b v '+LA.vec(second),'svg-label');
  svg+=LA.text(790,419,rank===2?'任意份數時：整個平面':'任意份數時：整條水平線','svg-label','end');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='w = '+LA.vec(w);
  el('result-secondary').textContent='可自由調整 '+rank+' 個方向';
  let why='';
  if(mode==='independent')why='斜卡負責高度，水平卡補左右；兩張一起，任何地方都到得了，而且固定目的地只有一組配方。目前兩張卡的份數是 ('+LA.fmt(a)+', '+LA.fmt(b)+')。';
  else if(mode==='collinear')why='長卡只是兩份水平卡，沒有提供向上的本領。('+LA.fmt(a)+', '+LA.fmt(b)+') 與 ('+LA.fmt(a+2)+', '+LA.fmt(b-1)+') 這兩組係數都得到 '+LA.vec(w)+'，所以配方不唯一。';
  else why='第二張是不動卡，拿幾份都不影響結果。只有第一張水平卡能提供移動，所以只剩左右這 1 種自由；同一個終點也能有許多配方。';
  el('feedback').textContent=why+'滑桿只是小範圍示範；完整模型允許任意實數份數。'+(w[0]===0&&w[1]===0?'目前結果是零向量，方向未定。':'');
 }
 LA.bind(['mode','a','b'],update,{mode:'independent',a:-1,b:2});
})();

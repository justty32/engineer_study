"use strict";
(() => {
 const el=id=>document.getElementById(id);
 function update(){
  const a=Number(el('a').value),b=Number(el('b').value),c=Number(el('c').value),d=Number(el('d').value),first=[a,c],second=[b,d],w=[a+b,c+d];
  ['a','b','c','d'].forEach(id=>{el(id+'-value').textContent=LA.fmt(Number(el(id).value));});
  const left=LA.plane({cx:190,cy:226,scale:35,extent:4}),right=LA.plane({cx:620,cy:226,scale:35,extent:4});
  let svg=LA.text(190,30,'輸入：x = (1, 1)','svg-title','middle')+LA.text(620,30,'輸出：把兩欄相加','svg-title','middle');
  svg+=left.axes+right.axes;
  svg+=LA.arrow(left.X(0),left.Y(0),left.X(1),left.Y(0),'blue');
  svg+=LA.arrow(left.X(0),left.Y(0),left.X(0),left.Y(1),'coral');
  svg+=LA.arrow(left.X(0),left.Y(0),left.X(1),left.Y(1),'ink');
  svg+=LA.text(left.X(1)+14,left.Y(0)+39,'e₁','svg-label');
  svg+=LA.text(left.X(0)-24,left.Y(1)-8,'e₂','svg-label','end');
  svg+=LA.text(left.X(1)+14,left.Y(1)-13,'x','svg-label');
  svg+=LA.arrow(369,216,425,216,'ink')+LA.text(397,196,'A','svg-title','middle');
  svg+=LA.arrow(right.X(0),right.Y(0),right.X(w[0]),right.Y(w[1]),'ink');
  svg+='<g opacity=".4">'+LA.arrow(right.X(0),right.Y(0),right.X(second[0]),right.Y(second[1]),'coral')+'</g>';
  svg+=LA.line(right.X(second[0]),right.Y(second[1]),right.X(w[0]),right.Y(w[1]),'tangent');
  svg+=LA.arrow(right.X(0),right.Y(0),right.X(first[0]),right.Y(first[1]),'blue');
  svg+=LA.arrow(right.X(first[0]),right.Y(first[1]),right.X(w[0]),right.Y(w[1]),'coral');
  svg+=LA.dot(right.X(w[0]),right.Y(w[1]));
  svg+=LA.text(190,391,'A = '+LA.matrix([[a,b],[c,d]]),'svg-label','middle');
  svg+=LA.text(620,391,'藍 第 1 欄 '+LA.vec(first),'svg-label','middle');
  svg+=LA.text(620,420,'珊瑚 第 2 欄 '+LA.vec(second),'svg-label','middle');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='A(1, 1) = '+LA.vec(w);
  el('result-secondary').textContent=LA.vec(first)+' + '+LA.vec(second);
  let why='第 1 欄 '+LA.vec(first)+' 是 e₁ 的去處；第 2 欄 '+LA.vec(second)+' 是 e₂ 的去處。輸入兩個分量都是 1，所以把兩欄各取一次，相加得到 '+LA.vec(w)+'。';
  if(a===1&&b===0&&c===0&&d===1)why+='這是單位矩陣：每個輸入都保持原樣。';
  else if(a===0&&b===0&&c===0&&d===0)why+='零矩陣把所有輸入都壓成零向量。';
  else if(a*d-b*c===0)why+='兩欄沒有提供兩個獨立方向，輸出空間被壓縮。';
  if(w[0]===0&&w[1]===0)why+='目前輸出長度為 0，方向未定。';
  el('feedback').textContent=why;
 }
 LA.bind(['a','b','c','d'],update,{a:1,b:1,c:0,d:1});
})();

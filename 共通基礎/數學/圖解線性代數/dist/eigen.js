"use strict";
(() => {
  const $=id=>document.getElementById(id);
  const modes={diagonal:{A:[[2,0],[0,.5]],name:'分別拉伸'},shear:{A:[[1,1],[0,1]],name:'剪切'},rotation:{A:[[0,-1],[1,0]],name:'旋轉 90°'}};
  function update(){
    const theta=Number($('theta').value),mode=$('mode').value,{A,name}=modes[mode];
    const angle=theta*Math.PI/180,v=[Math.cos(angle),Math.sin(angle)],w=LA.mat(A,v);
    const cross=v[0]*w[1]-v[1]*w[0],isEigen=Math.abs(cross)<1e-9,lambda=v[0]*w[0]+v[1]*w[1];
    $('theta-value').textContent=theta+'°';$('mode-value').textContent=name;
    const {X,Y,axes}=LA.plane({cx:410,cy:242,scale:77,extent:2.2});
    let g=axes+LA.line(X(-2.25*v[0]),Y(-2.25*v[1]),X(2.25*v[0]),Y(2.25*v[1]),'tangent');
    g+=LA.arrow(X(0),Y(0),X(w[0]),Y(w[1]),'coral');
    g+=LA.arrow(X(0),Y(0),X(v[0]),Y(v[1]),'blue');
    g+=`<circle cx="${X(w[0])}" cy="${Y(w[1])}" r="6" fill="#d96650" stroke="#fff" stroke-width="1.5"/><circle cx="${X(v[0])}" cy="${Y(v[1])}" r="4" fill="#345ce8"/>`;
    g+=LA.text(30,28,'藍色：輸入 v','svg-label')+LA.text(294,28,'珊瑚：輸出 Av','svg-label')+LA.text(565,28,'虛線：原本所在直線','svg-label');
    g+=LA.text(26,86,'A = '+LA.matrix(A),'svg-label');
    g+=LA.text(610,105,'v = '+LA.vec(v),'svg-label')+LA.text(610,137,'Av = '+LA.vec(w),'svg-label');
    g+=LA.text(610,186,isEigen?'✓ 同一直線':'離開原直線','svg-title');
    g+=LA.text(610,219,isEigen?'λ = '+LA.fmt(lambda,3):'此方向不是特徵方向','svg-small');
    g+=LA.text(410,434,'兩軸等比例；原箭頭的長度固定為 1。','svg-small','middle');
    $('drawing').innerHTML=g;
    $('result-primary').textContent='v = '+LA.vec(v)+' → Av = '+LA.vec(w);
    $('result-secondary').textContent=isEigen?'是特徵方向；λ = '+LA.fmt(lambda,3):'不是特徵方向；輸出與原向量不共線';
    let why=isEigen?'Av = '+LA.fmt(lambda,3)+'v：變換後仍留在原直線。':'輸出不能寫成同一個數乘上 v，所以這支箭頭不是特徵向量。';
    if(mode==='rotation')why='每支非零實箭頭都被轉了 90°，輸出永遠離開原直線，因此這台機器沒有實特徵方向。';
    if(mode==='shear'&&isEigen)why+=' 剪切的水平箭頭保持原樣，但它只有一個獨立特徵方向。';
    if(mode==='diagonal'&&!isEigen)why+=' 試試 0° 或 90°：水平與垂直的縮放倍率不同。';
    $('feedback').textContent=why;
    $('plot-desc').textContent='選用'+name+'，矩陣 A = '+LA.matrix(A)+'。輸入方向 '+theta+' 度，v = '+LA.vec(v)+'，輸出 Av = '+LA.vec(w)+'。'+$('result-secondary').textContent+'。'+why;
  }
  LA.bind(['mode','theta'],update,{mode:'diagonal',theta:45});
})();

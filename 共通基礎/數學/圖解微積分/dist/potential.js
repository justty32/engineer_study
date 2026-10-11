'use strict';
(() => {
 Calc.attach({controls:["position", "charge"],defaults:[1, 1],render:(x,q)=>{

 const voltage=-2*x,work=2*x*q,energy=-work;
 const {X,Y,axes}=Calc.plot({xmin:-2,xmax:2,ymin:-4,ymax:4,xlabel:'水平位置 x（m）',ylabel:'電位 V（V）'});
 const svg=axes+`<path d="${Calc.path(v=>-2*v,-2,2,X,Y)}" class="curve"/>`+Calc.dot(X(x),Y(voltage))+`<path d="M460 65H610m-15-10 15 10-15 10" stroke="#d96650" stroke-width="3" fill="none"/><text x="460" y="45" class="svg-label">E 向右，2 V/m</text>`;
 return{svg,values:[Calc.fmt(voltage)+' V',Calc.fmt(work)+' nJ',Calc.fmt(energy)+' nJ'],feedback:`以 x = 0 的電位為 0，向右走 ${Calc.fmt(x)} m，ΔV = −2 × ${Calc.fmt(x)} = ${Calc.fmt(voltage)} V。電荷 ${Calc.fmt(q)} nC 的電場作功為 ${Calc.fmt(work)} nJ，電位能改變為 ${Calc.fmt(energy)} nJ。改測試電荷不改這個既定電場的電位差。這裡是假設靜電場。`};

 }});
})();

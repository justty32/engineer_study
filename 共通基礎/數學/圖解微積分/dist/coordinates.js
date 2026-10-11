'use strict';
(() => {
 Calc.attach({controls:["radius", "width", "angle"],defaults:[1, 0.1, 0.1],render:(radius,width,angle)=>{

 const exact=((radius+width)**2-radius**2)*angle/2,approx=radius*width*angle;
 const cx=155,cy=330,scale=65,point=(r,a)=>[cx+scale*r*Math.cos(a),cy-scale*r*Math.sin(a)];
 const A=point(radius,0),B=point(radius+width,0),C=point(radius+width,angle),D=point(radius,angle);
 const sector=`M${A}L${B}A${scale*(radius+width)},${scale*(radius+width)} 0 0 0 ${C}L${D}A${scale*radius},${scale*radius} 0 0 1 ${A}Z`;
 const svg=`<path d="M80 ${cy}H475M${cx} 355V45" class="axis"/><path d="M${cx} ${cy}L${C}" class="tangent"/><path d="${sector}" fill="#f4d65e" stroke="#345ce8" stroke-width="3"/><text x="90" y="390" class="svg-label">圓環扇區（圖依 r、Δr、Δθ 畫）</text><text x="470" y="95" class="svg-label">內側弧長 r Δθ = ${Calc.fmt(radius*angle,3)}</text><rect x="485" y="140" width="210" height="105" fill="#e5ebff" stroke="#345ce8"/><text x="590" y="185" text-anchor="middle" class="svg-label">近似攤平的小格</text><text x="590" y="213" text-anchor="middle" class="svg-label">r Δθ × Δr</text><text x="485" y="280" class="svg-small">右圖僅示意兩邊長的角色</text><text x="485" y="312" class="svg-small">角度以弧度計；長度單位一致</text>`;
 return{svg,values:[Calc.fmt(approx,5),Calc.fmt(exact,5),Calc.fmt(exact-approx,5)],feedback:`內弧長 ${Calc.fmt(radius)} × ${Calc.fmt(angle)} = ${Calc.fmt(radius*angle,3)}，乘徑向寬 ${Calc.fmt(width)}，小格近似面積 ${Calc.fmt(approx,5)}。扇區外側較長，精確面積是 ${Calc.fmt(exact,5)}；Δr 縮小後，漏掉的二階量 Δr² Δθ/2 變小。`};

 }});
})();

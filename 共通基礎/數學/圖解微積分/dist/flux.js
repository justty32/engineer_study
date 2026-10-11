'use strict';
(() => {
 Calc.attach({controls:["strength", "area", "angle"],defaults:[2, 3, 0],render:(strength,area,angle)=>{

 const theta=angle*Math.PI/180,flux=strength*area*Math.cos(theta),cx=410,cy=205;
 const nx=Math.cos(theta),ny=-Math.sin(theta),tx=-ny,ty=nx;
 let arrows='';if(strength>0)for(let y=80;y<=330;y+=50)arrows+=`<path d="M100 ${y}H${100+55*strength}m-14-8 14 8-14 8" stroke="#b4c0de" stroke-width="3" fill="none"/>`;
 const svg=(strength===0?'<text x="78" y="205" class="svg-label">場強為 0：沒有場箭頭</text>':arrows)+`<path d="M${cx-105*tx} ${cy-105*ty}L${cx+105*tx} ${cy+105*ty}" stroke="#345ce8" stroke-width="9"/><path d="M${cx} ${cy}l${120*nx} ${120*ny}" stroke="#d96650" stroke-width="4"/><circle cx="${cx+120*nx}" cy="${cy+120*ny}" r="6" fill="#d96650"/><text x="75" y="385" class="svg-label">截面示意：藍線代表面；橘線指出選定法向</text><text x="555" y="85" class="svg-label">面積 A = ${Calc.fmt(area)}</text><text x="555" y="122" class="svg-label">法向夾角 ${Calc.fmt(angle)}°</text><text x="555" y="159" class="svg-label">投影因子 ${Calc.fmt(Math.cos(theta),3)}</text>`;
 return{svg,values:[Calc.fmt(flux,4),Calc.fmt(strength*Math.cos(theta),4),Calc.fmt(area)],feedback:`場強 ${Calc.fmt(strength)}，面積 ${Calc.fmt(area)}。場與法向夾角 ${Calc.fmt(angle)}°，所以每單位面積穿過量為 ${Calc.fmt(strength*Math.cos(theta),4)}，總通量 ${Calc.fmt(flux,4)}。角度不是量到面本身；翻轉法向會改符號。圖示面長不代表面積刻度。`};

 }});
})();

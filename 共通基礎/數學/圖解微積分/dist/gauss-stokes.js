'use strict';
(() => {
 Calc.attach({controls:["theorem", "size"],defaults:["gauss", 1],render:(mode,a)=>{

 const gauss=mode==='gauss',measure=gauss?a**3:Math.PI*a*a,density=gauss?3:2,total=density*measure;
 let svg;
 if(gauss)svg=`<path d="M180 150H420V350H180ZM180 150l120-90h240v200l-120 90M420 150l120-90M420 350V150M180 350l120-90h240M300 60v200" fill="#345ce812" stroke="#345ce8" stroke-width="3"/><text x="280" y="395" class="svg-label">每邊長 a = ${Calc.fmt(a)}，體積 a³</text><text x="575" y="110" class="svg-label">三個正向面各 a³</text><text x="575" y="145" class="svg-label">三個零座標面各 0</text><text x="575" y="200" class="svg-label">F = (x, y, z)</text><text x="575" y="235" class="svg-label">散度 = 1 + 1 + 1</text>`;
 else{const rr=70*a;svg=`<defs><marker id="stokes-boundary-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#345ce8"/></marker></defs><circle cx="310" cy="210" r="${rr}" fill="#e5ebff" stroke="#345ce8" stroke-width="3"/><path d="M${310+rr} 210A${rr} ${rr} 0 0 0 310 ${210-rr}" fill="none" stroke="#345ce8" stroke-width="4" marker-end="url(#stokes-boundary-arrow)"/><circle cx="310" cy="210" r="11" fill="white" stroke="#d96650" stroke-width="2"/><circle cx="310" cy="210" r="4" fill="#d96650"/><text x="195" y="48" class="svg-label">⊙ 法向 +z，朝向看圖的人</text><text x="535" y="160" class="svg-label">F = (−y, x, 0)</text><text x="535" y="200" class="svg-label">旋度 = (0, 0, 2)</text><text x="535" y="240" class="svg-label">邊界從 +z 看逆時針</text><text x="180" y="385" class="svg-label">圓盤面積 πa²；平面俯視示意</text>`;}
 return{svg,labels:[gauss?'封閉面向外通量':'逆時針邊界環流',gauss?'體積累積的散度':'盤面累積的旋度法向分量',gauss?'體積':'圓盤面積'],values:[Calc.fmt(total,4),Calc.fmt(total,4),Calc.fmt(measure,4)],feedback:gauss?`對光滑場 F = (x, y, z)，[0,a]³ 立方體每個正向面通量 a³，其餘三面是 0。合計 ${Calc.fmt(total,4)}，等於體積 ${Calc.fmt(measure,4)} 乘散度 3。共享內壁的兩側法向相反，彼此抵消。`:`對光滑場 F = (−y, x, 0)，半徑 ${Calc.fmt(a)} 圓周上的切向場大小為 ${Calc.fmt(a)}，周長 2πa，所以環流 2πa² = ${Calc.fmt(total,4)}。盤面旋度法向分量 2 乘面積得到同值；反轉法向時，邊界方向也必須反轉。`};

 }});
})();

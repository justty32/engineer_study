'use strict';
(() => {
 Calc.attach({controls:["field", "half-width"],defaults:["source", 0.5],render:(field,h)=>{

 const area=4*h*h,div=field==='source'?2:0,curl=field==='rotation'?2:0,flux=div*area,circulation=curl*area;
 const {X,Y,axes}=Calc.plot({xmin:-1.5,xmax:1.5,ymin:-1.5,ymax:1.5,x:120,y:35,w:315,h:315,xlabel:'水平位置 x',ylabel:'垂直位置 y'});
 let arrows='<defs><marker id="local-field-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#345ce8"/></marker></defs>';
 for(let x=-1;x<=1;x+=.5)for(let y=-1;y<=1;y+=.5){const fx=field==='source'?x:field==='rotation'?-y:1,fy=field==='source'?y:field==='rotation'?x:0;
  if(Math.hypot(fx,fy)<1e-10){arrows+=`<circle cx="${X(x)}" cy="${Y(y)}" r="3" fill="#61708a"/>`;continue;}
  arrows+=`<path d="M${X(x)} ${Y(y)}L${X(x+.22*fx)} ${Y(y+.22*fy)}" stroke="#345ce8" stroke-width="2" fill="none" marker-end="url(#local-field-arrow)"/>`;}
 const svg=axes+arrows+`<rect x="${X(-h)}" y="${Y(h)}" width="${X(h)-X(-h)}" height="${Y(-h)-Y(h)}" fill="#f4d65e22" stroke="#d96650" stroke-width="3"/><text x="485" y="90" class="svg-label">藍箭頭是場，橘框是觀察區</text><text x="485" y="129" class="svg-label">灰點代表零向量</text><text x="485" y="175" class="svg-label">兩軸同刻度，正方形不變形</text><text x="485" y="214" class="svg-small">箭頭長度 = 場向量的 0.22 倍</text>`;
 return{svg,values:[Calc.fmt(flux,3),Calc.fmt(circulation,3),Calc.fmt(div)+' ／ '+Calc.fmt(curl)],feedback:`正方形邊長 ${Calc.fmt(2*h)}、面積 ${Calc.fmt(area)}。淨向外通量 ${Calc.fmt(flux)} 除面積得到散度 ${div}；逆時針環流 ${Calc.fmt(circulation)} 除面積得到旋度 z 分量 ${curl}。這三個線性場的局部值固定，所以任意此尺寸的平均都恰等於局部值；一般場須取縮小極限。`};

 }});
})();

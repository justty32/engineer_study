'use strict';
(() => {
 Calc.attach({controls:["field", "path", "end-x", "end-y"],defaults:["uniform", "east-north", 1, 1],render:(field,path,a,b)=>{

 const uniform=field==='uniform',result=uniform?2*a:path==='east-north'?a*b:path==='north-east'?-a*b:0;
 const {X,Y,axes}=Calc.plot({xmin:0,xmax:3.5,ymin:0,ymax:3.5,x:105,y:35,w:315,h:315,xlabel:'水平位置 x',ylabel:'垂直位置 y'});
 let arrows='<defs><marker id="line-field-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#879dc8"/></marker><marker id="line-route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d96650"/></marker></defs>';
 for(let x=.5;x<=3;x+=.5)for(let y=.5;y<=3;y+=.5){const fx=uniform?2:-y,fy=uniform?0:x;arrows+=`<path d="M${X(x)} ${Y(y)}L${X(x+.16*fx)} ${Y(y+.16*fy)}" stroke="#879dc8" stroke-width="2" fill="none" marker-end="url(#line-field-arrow)"/>`;}
 const pts=path==='east-north'?[[0,0],[a,0],[a,b]]:path==='north-east'?[[0,0],[0,b],[a,b]]:[[0,0],[a,b]];
 const p=pts.map((v,i)=>(i?'L':'M')+X(v[0])+','+Y(v[1])).join('');
 return{svg:axes+arrows+`<path d="${p}" class="curve-alt" marker-mid="url(#line-route-arrow)" marker-end="url(#line-route-arrow)"/>`+Calc.dot(X(0),Y(0))+Calc.dot(X(a),Y(b))+Calc.text(475,85,'橘箭頭：走路方向')+Calc.text(475,120,'藍箭頭：當地的場')+Calc.text(475,168,'起點 (0, 0)')+Calc.text(475,203,`終點 (${Calc.fmt(a)}, ${Calc.fmt(b)})`)+Calc.text(475,253,'兩軸等比例，方向可直接比')+Calc.text(475,288,'箭頭長度 = 場向量的 0.16 倍','svg-small'),values:[Calc.fmt(result,3),uniform?'F = (2, 0)':'F = (−y, x)',path==='east-north'?'先右後上':path==='north-east'?'先上後右':'直走'],feedback:uniform?`每段只取場沿走路方向的分量。向右共 ${Calc.fmt(a)}，貢獻 2 × ${Calc.fmt(a)}；垂直段貢獻 0，所以此均勻場的積分是 ${Calc.fmt(result)}。`:`旋轉場會因走法不同而改變。到同一點 (${Calc.fmt(a)}, ${Calc.fmt(b)})，先右後上得 ${Calc.fmt(a*b)}，先上後右得 ${Calc.fmt(-a*b)}，直走得 0；目前是 ${Calc.fmt(result)}。這個反例說明不能只看端點。`};

 }});
})();

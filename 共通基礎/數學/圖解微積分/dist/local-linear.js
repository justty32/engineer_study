'use strict';
(() => {
 Calc.attach({controls:["base", "change"],defaults:[1, 0.1],render:(a,h)=>{

 const actual=(a+h)**2,linear=a*a+2*a*h,error=actual-linear;
 const {X,Y,axes}=Calc.plot({xmin:-1,xmax:3,ymin:-4,ymax:10,xlabel:'輸入 x',ylabel:'輸出 y'});
 const tangentMin=a>0?Math.max(-1,(-4+a*a)/(2*a)):-1,tangentMax=a>0?Math.min(3,(10+a*a)/(2*a)):3;
 const svg=axes+`<path d="${Calc.path(x=>x*x,-1,3,X,Y)}" class="curve"/><path d="${Calc.path(x=>a*a+2*a*(x-a),tangentMin,tangentMax,X,Y)}" class="tangent"/>`+Calc.dot(X(a),Y(a*a))+`<circle cx="${X(a+h)}" cy="${Y(actual)}" r="6" fill="#345ce8"/><circle cx="${X(a+h)}" cy="${Y(linear)}" r="6" fill="#d96650"/><line x1="${X(a+h)}" y1="${Y(linear)}" x2="${X(a+h)}" y2="${Y(actual)}" stroke="#d96650" stroke-width="3"/>`;
 return{svg,values:[Calc.fmt(linear,3),Calc.fmt(actual,3),Calc.fmt(error,3)],feedback:`從 (${Calc.fmt(a)}, ${Calc.fmt(a*a)}) 出發，切線每向右 1 增加 ${Calc.fmt(2*a)}。改變 ${Calc.fmt(h)}，先估 ${Calc.fmt(linear,3)}；平方曲線真值 ${Calc.fmt(actual,3)}。這個例子的誤差恰為 h² = ${Calc.fmt(error,3)}，不表示所有函數都如此。`};

 }});
})();

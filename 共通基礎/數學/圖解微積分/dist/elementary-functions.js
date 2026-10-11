'use strict';
(() => {
 Calc.attach({controls:["function", "input"],defaults:["exp", 1],render:(mode,a)=>{

 const f=mode==='exp'?Math.exp:mode==='log'?(x=>x>0?Math.log(x):NaN):Math.sin;
 const df=mode==='exp'?Math.exp:mode==='log'?(x=>x>0?1/x:NaN):Math.cos;
 const names={exp:'eˣ',log:'ln x',sin:'sin x'};
 const ymin=mode==='log'?-3:-2;
 const {X,Y,axes}=Calc.plot({xmin:-2,xmax:2,ymin,ymax:8,xlabel:'輸入 x（sin 用弧度）',ylabel:'輸出'});
 const value=f(a), slope=df(a),valid=Number.isFinite(value);
 const svg=axes+`<path d="${Calc.path(x=>{const y=f(x);return y>=ymin&&y<=8?y:NaN;},-2,2,X,Y)}" class="curve"/>`+(valid?Calc.dot(X(a),Y(value)):Calc.text(140,110,'ln x 在 x ≤ 0 沒有實數值'));
 return{svg,values:[names[mode],valid?Calc.fmt(value,4):'沒有實數值',valid?Calc.fmt(slope,4):'此處未定義'],feedback:mode==='exp'?`輸入 ${Calc.fmt(a)}，輸出 eˣ = ${Calc.fmt(value,4)}。輸入每加 1，輸出乘 e；不是每次加固定數。`:mode==='log'?valid?`ln ${Calc.fmt(a)} = ${Calc.fmt(value,4)}，意思是 e 的這個次方等於 ${Calc.fmt(a)}。ln 的實數輸入必須大於 0。`:'實數 ln x 只接受正數；零和負數沒有本頁模型的輸出。':`角度 ${Calc.fmt(a)} 弧度，是半徑 1 的圓上有向弧長 ${Calc.fmt(a)}；高度 sin x = ${Calc.fmt(value,4)}。導數 cos x 以弧度為前提。`};

 }});
})();

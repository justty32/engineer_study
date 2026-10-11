'use strict';
(() => {
 Calc.attach({controls:["time", "interval"],defaults:[2, 0.5],render:(t,h)=>{

 const q=t*t,next=(t+h)**2,average=(next-q)/h,current=2*t;
 const {X,Y,axes}=Calc.plot({xmin:0,xmax:5,ymin:0,ymax:25,xlabel:'時間 t（s）',ylabel:'累積通過電荷 Q（mC）'});
 const svg=axes+`<path d="${Calc.path(x=>x*x,0,5,X,Y)}" class="curve"/><path d="M${X(t)},${Y(q)}L${X(t+h)},${Y(next)}" class="curve-alt"/><path d="${Calc.path(x=>q+current*(x-t),Math.max(0,t-.7),Math.min(5,t+.7),X,Y)}" class="tangent"/>`+Calc.dot(X(t),Y(q))+`<circle cx="${X(t+h)}" cy="${Y(next)}" r="6" fill="#d96650"/>`;
 return{svg,values:[Calc.fmt(q,3)+' mC',Calc.fmt(current,3)+' mA',Calc.fmt(average,3)+' mA'],feedback:`沿指定正方向，到 ${Calc.fmt(t)} 秒累積通過 ${Calc.fmt(q)} mC。接著 ${Calc.fmt(h)} 秒多通過 ${Calc.fmt(next-q,3)} mC，平均 ${Calc.fmt(average,3)} mA；此刻斜率是 ${Calc.fmt(current,3)} mA。縮短間隔，平均值靠近瞬時值。這個 Q 是通過截面的帳，不是某區域的存量。`};

 }});
})();

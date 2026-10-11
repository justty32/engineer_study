'use strict';
(() => {
 Calc.attach({controls:["circuit", "tau", "time", "initial"],defaults:["rc", 1, 1, 0],render:(mode,tau,t,initial)=>{

 const value=1+(initial-1)*Math.exp(-t/tau),rate=(1-value)/tau;
 const rc=mode==='rc',unit=rc?'V':'A',slopeUnit=rc?'V/s':'A/s';
 const {X,Y,axes}=Calc.plot({xmin:0,xmax:5,ymin:0,ymax:1.1,xlabel:'時間 t（s）',ylabel:rc?'電容電壓 v（V）':'電感電流 i（A）'});
 const svg=axes+`<path d="${Calc.path(x=>1+(initial-1)*Math.exp(-x/tau),0,5,X,Y)}" class="curve"/><path d="M${X(0)},${Y(1)}H${X(5)}" class="tangent"/>`+Calc.dot(X(t),Y(value));
 return{svg,labels:[rc?'電容電壓':'電感電流','此刻的變化率','時間常數'],values:[Calc.fmt(value,4)+' '+unit,Calc.fmt(rate,4)+' '+slopeUnit,Calc.fmt(tau)+' s'],feedback:`${rc?'R = 1 kΩ，C = '+Calc.fmt(tau)+' mF，τ = RC':'R = 1 Ω，L = '+Calc.fmt(tau)+' H，τ = L/R'} = ${Calc.fmt(tau)} s。初值 ${Calc.fmt(initial)} ${unit}，目標 1 ${unit}。目前還差 ${Calc.fmt(1-value,4)} ${unit}，所以斜率為差值除以 τ。過一個 τ，剩下原來差距的 1/e，約 36.8%。`};

 }});
})();

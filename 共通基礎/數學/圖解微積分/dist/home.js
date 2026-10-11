"use strict";
(() => {
 const slider=document.getElementById('home-time');if(!slider)return;
 const svg=document.getElementById('home-diagram');const {fmt,plot,path,line,dot,text}=Calc;
 function update(){const t=Number(slider.value),s=t*t,v=2*t;
 const a=plot({xmin:0,xmax:4,ymin:0,ymax:16,x:68,y:93,w:295,h:255,xticks:[0,1,2,3,4],yticks:[0,4,8,12,16],xlabel:'時間（秒）',ylabel:'位置（公尺）'});
 const b=plot({xmin:0,xmax:4,ymin:0,ymax:8,x:477,y:93,w:290,h:255,xticks:[0,1,2,3,4],yticks:[0,2,4,6,8],xlabel:'時間（秒）',ylabel:'速度（公尺／秒）'});
 const tangentStart=Math.max(0,t-.65),tangentEnd=Math.min(4,t+.65);
 let area=`M${b.X(0)},${b.Y(0)} L${b.X(t)},${b.Y(v)} L${b.X(t)},${b.Y(0)} Z`;
 let out='<title id="home-svg-title">位置看斜率，速度看累積</title><desc id="home-svg-desc">'+t+'秒的位置是'+fmt(s)+'公尺，速度'+fmt(v)+'公尺每秒，從0秒累積的位移'+fmt(s)+'公尺。</desc>';
 out+=text(68,39,'看這一刻的斜率','svg-title')+text(477,39,'看一路累積的量','svg-title')+a.axes+b.axes;
 out+=`<path d="${path(x=>x*x,0,4,a.X,a.Y)}" class="curve"/>`;
 out+=`<path d="${area}" class="area-fill"/><path d="${path(x=>2*x,0,4,b.X,b.Y)}" class="curve-alt"/>`;
 out+=line(a.X(t),a.Y(0),a.X(t),a.Y(s),'tangent')+line(a.X(tangentStart),a.Y(s+v*(tangentStart-t)),a.X(tangentEnd),a.Y(s+v*(tangentEnd-t)),'tangent')+dot(a.X(t),a.Y(s));
 out+=line(b.X(t),b.Y(0),b.X(t),b.Y(v),'tangent')+dot(b.X(t),b.Y(v));
 out+=text(68,423,'微分：位置 → 速度','svg-label')+text(477,423,'積分：速度 → 位移','svg-label');
 svg.innerHTML=out;document.getElementById('home-time-value').textContent=fmt(t)+' 秒';document.getElementById('home-position').textContent=fmt(s)+' 公尺';document.getElementById('home-speed').textContent=fmt(v)+' 公尺／秒';document.getElementById('home-distance').textContent=fmt(s)+' 公尺';
 document.getElementById('home-feedback').textContent=t===0?'剛出發時，位置與速度都是 0。還沒有經過時間，所以累積位移也是 0。':`在 ${fmt(t)} 秒這一刻，位置圖的切線斜率是 ${fmt(v)} 公尺／秒。右圖從 0 到 ${fmt(t)} 秒的面積是 ${fmt(s)} 公尺，正好回到左圖的位置變化。`;
 }
 slider.addEventListener('input',update);document.getElementById('home-reset').addEventListener('click',()=>{slider.value='2';update();});update();
})();

"use strict";
(() => {
 const pages=[["index","∫","開始探索"],["00-start","00","先看懂一張圖"],["limits","01","越靠近，會怎樣？"],["derivatives","02","這一刻，變多快？"],["elementary-functions","03","三種常見的曲線"],["rules","04","倍率怎麼傳下去"],["local-linear","05","彎線旁的一小段直線"],["applications","06","找到最好的一點"],["integrals","07","一小片一小片加"],["fundamental","08","微分與積分牽手"],["techniques","09","積分也能倒著拆"],["series","10","用簡單拼出複雜"],["charge-current","11","每秒通過多少電荷"],["first-order","12","為何越充越慢"],["multivariable","13","走進有高度的地圖"],["multiple-integrals","14","整片區域一起加"],["coordinates","15","圓環怎麼切小格"],["vector-fields","16","每個位置一支箭頭"],["line-integrals","17","沿路累積多少"],["potential","18","電位差的負號"],["flux","19","穿過一張面的量"],["div-curl","20","小盒子與小槳輪"],["gauss-stokes","21","裡面與邊界互相換算"],["engineering","22","接上三條工程路"],["glossary","Aa","名詞小字典"],["sources","↗","來源與模型邊界"]];
 const current=document.body.dataset.page||'index';
 const header=document.getElementById('site-header');if(header)header.innerHTML='<a class="skip-link" href="#main-content">跳到主要內容</a><div class="header-inner"><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">∫</span>微積分小小實驗室</a><div class="header-links"><a class="wide-link" href="index.html#learning-path">學習地圖</a><a href="glossary.html">小字典</a><a class="wide-link" href="sources.html">參考資料</a><span class="header-note">看圖 · 動手 · 想明白</span></div></div>';
 const nav=document.getElementById('course-nav');if(nav){let html='<details class="course-menu"'+(window.matchMedia('(min-width:1100px)').matches?' open':'')+'><summary>學習路徑 · '+(pages.find(p=>p[0]===current)||pages[0])[2]+'</summary>';pages.forEach((p,i)=>{if(i===0||i===8||i===12||i===14||i===24)html+=(i?'</ul>':'')+'<p class="nav-label">'+(i===0?'從零開始 · 看懂變化':i===8?'把變化累積起來':i===12?'時間與電路':i===14?'空間與電磁':'隨時回來查')+'</p><ul class="course-links">';html+='<li><a href="'+p[0]+'.html"'+(p[0]===current?' aria-current="page"':'')+'><span class="nav-num">'+p[1]+'</span>'+p[2]+'</a></li>';});nav.innerHTML=html+'</ul><p class="nav-note">每張圖都能慢慢看。<br>不必考試，也不用一次學完。</p></details>';}
 const footer=document.getElementById('site-footer');if(footer)footer.innerHTML='<div class="footer-inner"><p>微積分小小實驗室 · 圖形是入口，條件讓理解站得穩。</p><p><a href="sources.html">教材與模型說明</a>　·　<a href="index.html">回到起點</a></p></div>';
 const fmt=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)).toLocaleString('zh-TW',{maximumFractionDigits:d}):'此處未定義';
 const line=(x1,y1,x2,y2,cls='axis')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
 const dot=(x,y,cls='marker',r=6)=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
 const text=(x,y,label,cls='svg-label')=>`<text x="${x}" y="${y}" class="${cls}">${label}</text>`;
 const path=(fn,xmin,xmax,X,Y,steps=140)=>{let d='',active=false;for(let i=0;i<=steps;i++){const x=xmin+(xmax-xmin)*i/steps,y=fn(x);if(!Number.isFinite(y)){active=false;continue;}d+=(active?'L':'M')+X(x).toFixed(2)+','+Y(y).toFixed(2)+' ';active=true;}return d;};
 function plot(o){const{xmin,xmax,ymin,ymax,x=74,y=35,w=700,h=320,xlabel='x',ylabel='y'}=o;const X=v=>x+(v-xmin)/(xmax-xmin)*w,Y=v=>y+h-(v-ymin)/(ymax-ymin)*h;const ticks=(a,b)=>Array.from({length:5},(_,i)=>a+(b-a)*i/4);let axes='';(o.xticks||ticks(xmin,xmax)).forEach(v=>{axes+=line(X(v),y,X(v),y+h,'gridline')+`<text x="${X(v)}" y="${y+h+25}" text-anchor="middle" class="svg-small">${fmt(v)}</text>`;});(o.yticks||ticks(ymin,ymax)).forEach(v=>{axes+=line(x,Y(v),x+w,Y(v),'gridline')+`<text x="${x-12}" y="${Y(v)+5}" text-anchor="end" class="svg-small">${fmt(v)}</text>`;});axes+=line(x,y+h,x+w,y+h)+line(x,y,x,y+h);if(ymin<0&&ymax>0)axes+=line(x,Y(0),x+w,Y(0));if(xmin<0&&xmax>0)axes+=line(X(0),y,X(0),y+h);axes+=`<text x="${x+w-4}" y="${y+h+48}" text-anchor="end" class="svg-small">${xlabel}</text>`+text(x,y-12,ylabel,'svg-small');return{X,Y,axes};}
 window.Calc={fmt,line,dot,text,path,plot};
})();

/* 新課共用：數值模型由各頁提供，所有控制器都有文字回饋。 */
(() => {
 const attach=({controls,defaults,render})=>{
  const get=id=>document.getElementById(id), inputs=controls.map(get);
  if(inputs.some(e=>!e)||!get('main-drawing'))return;
  const update=()=>{const values=inputs.map(e=>e.tagName==='SELECT'?e.value:Number(e.value));
   inputs.forEach((e,i)=>{const out=get(e.id+'-value');if(out)out.textContent=typeof values[i]==='number'?Calc.fmt(values[i],3):values[i];});
   const result=render(...values);get('main-drawing').innerHTML=result.svg;
   (result.values||[]).forEach((v,i)=>{const el=get('readout-'+String.fromCharCode(97+i));if(el)el.textContent=v;});
   (result.labels||[]).forEach((v,i)=>{const el=get('label-'+String.fromCharCode(97+i));if(el)el.textContent=v;});
   get('feedback').textContent=result.feedback;const desc=get('main-desc');if(desc)desc.textContent=result.desc||result.feedback;
  };
  inputs.forEach(e=>e.addEventListener(e.tagName==='SELECT'?'change':'input',update));
  const reset=get('reset');if(reset)reset.addEventListener('click',()=>{inputs.forEach((e,i)=>{e.value=defaults[i];});update();});update();
 };
 Calc.attach=attach;
})();

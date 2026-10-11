'use strict';
(function (root) {
  const titles = ['電壓、電流與功率','沿節點與迴路記帳','串並聯、分壓與分流','節點分析','網目與超網目','超節點與受控源','疊加','端口等效與最大功率','電容與電感','RC 暫態','RL 暫態','RLC 與阻尼','拉氏轉換','相量與阻抗','交流功率','頻率響應','理想運放','雙埠網路','磁耦合','平衡三相'];
  const slugs = ['00-start','01-laws','02-divider','03-nodal','04-mesh','05-controlled','06-superposition','07-equivalents','08-storage','09-rc','10-rl','11-rlc','12-laplace','13-phasors','14-ac-power','15-frequency','16-opamp','17-twoport','18-coupling','19-threephase'];
  const cfg = [
    [2,12,1,6,'電阻 R','Ω'],[0,18,1,12,'電源 Vₛ','V'],[1,12,1,4,'負載 R_L','kΩ'],[0,12,1,6,'注入電流 Iₛ','mA'],[0,24,1,12,'左電源 Vₛ','V'],[0,12,1,6,'跨節點電壓 Vₛ','V'],[0,6,.5,3,'注入電流 Iₛ','mA'],[.5,6,.5,2,'負載 R_L','kΩ'],[0,10,.5,5,'電容電壓 v_C','V'],[0,5,.1,1,'時間 t','ms'],[0,5,.1,1,'時間 t','ms'],[2,30,1,10,'串聯電阻 R','Ω'],[0,8,1,2,'初始電壓 V₀','V'],[0,80,5,40,'電感電抗 X_L','Ω'],[-80,80,5,60,'相位差 θ','°'],[.1,10,.1,1,'頻率比 f/f_c',''],[-2,2,.1,1,'輸入 V_in','V'],[10,100,5,40,'負載 R_L','Ω'],[.5,3,.5,2,'匝數比 n',''],[50,230,10,120,'相電壓 V_p','Vrms']
  ];
  const fmt = n => {if(Math.abs(n)<1e-10)n=0;return Number(n.toPrecision(6)).toLocaleString('zh-TW',{maximumFractionDigits:6});};
  const o = (label,value,unit) => ({label,value,unit});
  function rlc(R,t=.002){const a=R/0.02,w=1000;if(Math.abs(a-w)<1e-9)return 5*(1-(1+a*t)*Math.exp(-a*t));if(a<w){const d=Math.sqrt(w*w-a*a);return 5*(1-Math.exp(-a*t)*(Math.cos(d*t)+a/d*Math.sin(d*t)));}const q=Math.sqrt(a*a-w*w),s1=-a+q,s2=-a-q;return 5*(1+(s2*Math.exp(s1*t)-s1*Math.exp(s2*t))/(s1-s2));}
  function calculate(id,x){
    let out,why;
    switch(Number(id)){
    case 0:out=[o('回路電流',6/x,'A'),o('電阻吸收功率',36/x,'W'),o('電源吸收功率',-36/x,'W')];why=`同樣 6 V，R = ${fmt(x)} Ω 使電流成為 (6 V)/R。電源的負功率等於電阻的正功率，總和為零。`;break;
    case 1:out=[o('回路電流',x/6,'A'),o('2 Ω 壓降',x/3,'V'),o('4 Ω 壓降',2*x/3,'V')];why=`兩電阻共有電流 Vₛ/(2 Ω + 4 Ω)。兩段壓降相加 = ${fmt(x)} V，剛好抵消電源上升。`;break;
    case 2:{const p=4*x/(4+x),v=12*p/(2+p);out=[o('負載電壓',v,'V'),o('源電流',12/(2+p),'mA'),o('並聯等效電阻',p,'kΩ')];why=`R_L = ${fmt(x)} kΩ 先與 4 kΩ 並聯；負載變小會拉低並聯電阻，輸出更低，不能沿用無載 8 V。`;break;}
    case 3:out=[o('節點 A 電壓',4*x/3,'V'),o('節點 B 電壓',2*x/3,'V'),o('A → B 電流',x/3,'mA')];why=`A 流向地 ${fmt(2*x/3)} mA，加上 A → B 的 ${fmt(x/3)} mA，等於注入 ${fmt(x)} mA。箭頭不變，數字同時滿足兩個節點。`;break;
    case 4:out=[o('左網目 i₁',3*x/10,'A'),o('右網目 i₂',x/10,'A'),o('共支 i₁−i₂',x/5,'A')];why=`共用電阻上兩個順時針網目方向相反，真實支路電流要相減。(4 Ω)i₁−(2 Ω)i₂ = ${fmt(x)} V，−(2 Ω)i₁+(6 Ω)i₂ = 0 V。`;break;
    case 5:{const a=(12+x)/3,b=a-x;out=[o('節點 A 電壓',a,'V'),o('節點 B 電壓',b,'V'),o('B → 地電流',b/4,'mA')];why=`Va−Vb 固定等於 ${fmt(x)} V，超節點仍只注入 3 mA。${b<0?'B 電壓為負，因此按 B → 地箭頭算出的負電流代表實際由地流入 B。':'A、B 對地兩支電流相加仍等於 3 mA。'}`;break;}
    case 6:{const v=3+x;out=[o('節點總電壓',v,'V'),o('電流源單獨貢獻',x,'V'),o('負載功率',v*v/2,'mW')];why=`電壓可疊加 (3 V) + (${fmt(x)} V)；負載功率卻是整個電壓平方再除 2 kΩ，包含交叉項，不能把單源功率相加。`;break;}
    case 7:{const i=8/(4/3+x);out=[o('負載功率',i*i*x,'mW'),o('負載電流',i,'mA'),o('負載電壓',i*x,'V')];why=`R_L = ${fmt(x)} kΩ 改變電流與分壓兩件事。最大功率在 R_L = 4/3 kΩ，為 12 mW；負載越大並非功率越大。`;break;}
    case 8:out=[o('電容儲能',x*x,'μJ'),o('儲存電荷',2*x,'μC'),o('1 ms 斜坡電流',2*x,'mA')];why=`相同 2 μF 電容，電荷與電壓成正比，能量則與電壓平方成正比；0 到 ${fmt(x)} V 的 1 ms 斜坡需要 ${fmt(2*x)} mA。`;break;
    case 9:out=[o('電容電壓',5*(1-Math.exp(-x)),'V'),o('回路電流',5*Math.exp(-x),'mA'),o('電阻壓降',5*Math.exp(-x),'V')];why=`時間為 ${fmt(x)} 個 τ。電容電壓上升，電阻剩下的壓降下降，所以充電電流也下降；兩壓降仍合計 5 V。`;break;
    case 10:out=[o('電感電流',1-Math.exp(-x),'A'),o('電感電壓',10*Math.exp(-x),'V'),o('電阻壓降',10*(1-Math.exp(-x)),'V')];why=`電流從 0 A 連續增長。時間 ${fmt(x)} ms 時，越接近 1 A，電阻分掉越多源電壓，電感電流上升速度越小。`;break;
    case 11:{const z=x/20;out=[o('2 ms 的電容電壓',rlc(x),'V'),o('阻尼比 ζ',z,''),o('衰減因子 α',50*x,'s⁻¹')];why=`R = ${fmt(x)} Ω 對應 ζ = ${fmt(z)}，是${z<1?'欠阻尼：能量往返形成衰減振盪':z===1?'臨界阻尼：特徵根重合':'過阻尼：兩個實根衰減'}。圖比較固定 2 ms 的讀值，不是時間波形。`;break;}
    case 12:out=[o('1 ms 的電容電壓',5+(x-5)*Math.exp(-1),'V'),o('自然響應係數',x-5,'V'),o('1 ms 的電流',(5-x)*Math.exp(-1),'mA')];why=`初值由微分轉換中的 −V₀ 帶入。總響應是 v(t) = (5 V) + (${fmt(x-5)} V)e^(−t/τ)；${x>5?'初值高於源電壓，電容先放電。':x===5?'初值等於終值，因此沒有暫態。':'初值低於源電壓，電容會充電。'}`;break;
    case 13:{const z=Math.hypot(30,x),a=-Math.atan2(x,30)*180/Math.PI;out=[o('電流有效值',120/z,'A'),o('電流相位',a,'°'),o('阻抗大小',z,'Ω')];why=`感抗增加使阻抗向正虛軸拉長；在 120 Vrms 不變下，電流變小且更落後。時域峰值必須再乘 √2。`;break;}
    case 14:{const a=x*Math.PI/180;out=[o('平均功率 P',200*Math.cos(a),'W'),o('無效功率 Q',200*Math.sin(a),'var'),o('視在功率 |S|',200,'VA')];why=`θ = ${fmt(x)}° 是電壓相位減電流相位。${x<0?'Q 為負，電流超前，屬容性。':x>0?'Q 為正，電流落後，屬感性。':'Q 為零，電壓與電流同相。'} P²+Q² = (200 VA)²。`;break;}
    case 15:{const h=1/Math.hypot(1,x);out=[o('電壓增益大小',h,''),o('增益',20*Math.log10(h),'dB'),o('相位',-Math.atan(x)*180/Math.PI,'°')];why=`f = ${fmt(x/(2*Math.PI*.0001))} Hz 時，電容阻抗縮小；輸出取電容兩端，因此頻率升高時輸出比例下降。`;break;}
    case 16:out=[o('輸出電壓',-2*x,'V'),o('輸入電阻電流',x/10,'mA'),o('反相端電壓',0,'V')];why=`負回授且輸出 ${fmt(-2*x)} V 位於 ±5 V 內，才使用虛短路。流入 10 kΩ 的電流經 20 kΩ 回授電阻流走，輸出必須反號。`;break;
    case 17:{const i=10/(10+x);out=[o('輸出電壓 V₂',i*x,'V'),o('流入埠 1 的 I₁',i,'A'),o('流入埠 2 的 I₂',-i,'A')];why=`負載變大會讓輸出更接近 10 V，而電流下降。I₂ 箭頭定義為流入黑箱，與負載電流相反，故為 ${fmt(-i)} A。`;break;}
    case 18:{const v=12*x,i=v/24;out=[o('次側電壓',v,'Vrms'),o('次側負載電流',i,'Arms'),o('輸入等效電阻',24/x**2,'Ω')];why=`匝數比 ${fmt(x)} 使電壓乘 n，負載反映到一次側則除 n²。一次側電流 ${fmt(x*i)} A，兩側平均功率同為 ${fmt(v*i)} W。`;break;}
    case 19:out=[o('三相總功率',x*x/4,'W'),o('線電壓有效值',Math.sqrt(3)*x,'V'),o('線電流有效值',x/12,'A')];why=`三個平衡純阻相支路各取 ${fmt(x*x/12)} W。線電壓是相差 120° 的相量相減，大小為 √3 倍，不能直接把兩個相電壓相加。`;break;
    default:throw new Error('Unknown lesson');
    }
    return {out,why};
  }
  const api={calculate,rlc,cfg,slugs,titles};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(!root.document)return;
  const doc=root.document;
  const current=doc.body.dataset.page;
  const nav=doc.querySelector('.course-nav');
  if(nav){const links=slugs.map((s,i)=>`<a class="chapter-link${s===current?' current-chapter':''}" href="${s}.html"${s===current?' aria-current="page"':''}>${String(i).padStart(2,'0')}　${titles[i]}</a>`).join('');nav.innerHTML=`<nav aria-label="全課導覽"><a href="index.html">課程地圖</a><a href="glossary.html">名詞與概念字典</a><a href="sources.html">教材與查證</a><p class="nav-label">從圖、列式，到驗算</p>${links}</nav>`;}
  const search=doc.querySelector('#dictionary-search');
  if(search){search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let n=0;doc.querySelectorAll('.term').forEach(t=>{t.hidden=!t.textContent.toLowerCase().includes(q);if(!t.hidden)n++;});const count=doc.querySelector('#dictionary-count');if(count)count.textContent=`顯示 ${n} 個詞條`;});}
  const lab=doc.querySelector('[data-lab]');if(!lab)return;
  const id=Number(lab.dataset.lab),c=cfg[id];if(!c)return;const graphIndex=id===4?2:0;
  const input=doc.querySelector('#lab-input'),value=doc.querySelector('#lab-value'),results=doc.querySelector('#lab-results'),why=doc.querySelector('#lab-why'),plot=doc.querySelector('#lab-plot'),desc=doc.querySelector('#lab-description'),reset=doc.querySelector('#lab-reset');
  if(!input||!value||!results||!why||!plot||!desc||!reset)return;
  [input.min,input.max,input.step]=c.slice(0,3).map(String);input.value=String(c[3]);input.disabled=false;reset.disabled=false;
  if(!plot.parentElement.classList.contains('lab-graph')){const wrap=doc.createElement('div');wrap.className='lab-graph';wrap.tabIndex=0;wrap.setAttribute('aria-label','實驗曲線，可水平捲動');plot.before(wrap);wrap.append(plot);}
  function update(){let x=Number(input.value);if(!Number.isFinite(x)||input.value==='')x=c[3];x=Math.max(c[0],Math.min(c[1],x));input.value=String(x);const r=calculate(id,x);value.textContent=`${fmt(x)} ${c[5]}`;results.innerHTML=r.out.map(v=>`<div class="readout"><small>${v.label}</small><strong>${fmt(v.value)} <small>${v.unit}</small></strong></div>`).join('');why.textContent=r.why;
    const points=Array.from({length:121},(_,i)=>{const xx=c[0]+(c[1]-c[0])*i/120;return [xx,calculate(id,xx).out[graphIndex].value];});const ys=points.map(p=>p[1]);let low=Math.min(0,...ys),high=Math.max(0,...ys);if(high-low<1e-12)high=low+1;const pad=(high-low)*.08;low-=pad;high+=pad;
    const px=xx=>75+(xx-c[0])/(c[1]-c[0])*480,py=y=>220-(y-low)/(high-low)*165;const primary=r.out[graphIndex],text=`橫軸 ${c[4]}（${c[5]||'無因次'}），縱軸 ${primary.label}（${primary.unit||'無因次'}）。實線為模型掃描，圓點為 ${fmt(x)} ${c[5]} 時的 ${fmt(primary.value)} ${primary.unit}。`;
    plot.setAttribute('viewBox','0 0 600 280');plot.setAttribute('aria-labelledby','plot-title plot-desc');plot.innerHTML=`<title id="plot-title">${primary.label} 隨 ${c[4]} 的變化</title><desc id="plot-desc">${text}</desc><path d="M75 45V220H565" fill="none" stroke="#728781" stroke-width="1.5"/><text x="75" y="24" font-size="15">${primary.label}（${primary.unit||'無因次'}）</text><text x="310" y="274" text-anchor="middle" font-size="15">${c[4]}（${c[5]||'無因次'}）</text>${[0,.5,1].map(t=>{const xx=c[0]+(c[1]-c[0])*t,yy=low+(high-low)*t;return `<path d="M${px(xx)} 220v5M70 ${py(yy)}h485" stroke="#dce5df" fill="none"/><text x="${px(xx)}" y="246" text-anchor="middle" font-size="14">${fmt(xx)}</text><text x="65" y="${py(yy)+5}" text-anchor="end" font-size="13">${fmt(yy)}</text>`;}).join('')}<path d="${points.map((p,i)=>(i?'L':'M')+px(p[0]).toFixed(2)+' '+py(p[1]).toFixed(2)).join(' ')}" fill="none" stroke="#006d73" stroke-width="3"/><path d="M${px(x)} 220V${py(primary.value)}" stroke="#ba6215" stroke-dasharray="4 4"/><circle cx="${px(x)}" cy="${py(primary.value)}" r="6" fill="#ba6215" stroke="white" stroke-width="2"/>`;desc.textContent=text;
  }
  input.addEventListener('input',update);reset.addEventListener('click',()=>{input.value=String(c[3]);update();});update();
})(typeof globalThis!=='undefined'?globalThis:this);

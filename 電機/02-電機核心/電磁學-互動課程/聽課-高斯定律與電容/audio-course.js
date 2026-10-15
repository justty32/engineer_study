(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const eps0=8.8541878128e-12, k=1/(4*Math.PI*eps0), Q=1e-9;
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff',pink:'#ef9dbb'};
  const defs='<defs>'+Object.entries(colors).map(([n,c])=>`<marker id="gauss-${n}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('')+'</defs>';
  document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">'+defs+'</svg>');
  const line=(x1,y1,x2,y2,cls='axis',arrow=false,id='')=>`<line ${id?`id="${id}"`:''} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${arrow?` marker-end="url(#gauss-${cls.split(' ')[0]})"`:''}/>`;
  const txt=(x,y,t,cls='',anchor='start',id='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}"${id?` id="${id}"`:''}>${t}</text>`;
  const svg=(id,title,body,h=400)=>`<svg viewBox="0 0 600 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;
  const patch=svg('gauss-patch-art','面片與法向垂直，電場朝右；滑桿改變電場與法向夾角。',line(90,210,500,210,'axis')+line(290,210,450,210,'mint',true)+line(290,210,350,106,'amber',true,'gauss-normal')+line(180,147,400,273,'blue',false,'gauss-surface')+line(290,210,330,141,'pink dash',true,'gauss-projection')+line(450,210,330,141,'axis dash',false,'gauss-drop')+txt(470,210,'E','mint-fill')+txt(300,65,'n','amber-fill','middle','gauss-normal-label')+txt(55,315,'θ：E 與 n 的夾角','small-label')+txt(55,355,'粉色虛線：E 在 n 上的投影','small-label'),390);
  let cells='';
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){
    const x=65+i*260,y=75+j*155;
    cells+=`<rect x="${x}" y="${y}" width="220" height="140" rx="8" class="cell"/>`+txt(x+110,y+37,i?'150 V/m':'50 V/m','small-label','middle')+line(x+30,y+66,x+30+(i?150:50),y+66,'mint',true)+txt(x+110,y+114,i?'0.75 V·m':'0.25 V·m','amber-fill','middle');
  }
  const integral=svg('gauss-integral-art','同面四格，每格零點零零五平方公尺，左右法向場五十與一百五十，箭長比一比三。',cells+txt(300,410,'每格 0.005 m²；法向皆 +x','small-label','middle'),440);
  let box='<rect x="170" y="90" width="260" height="210" class="blue dash"/>';
  [150,230].forEach(y=>{box+=line(60,y,550,y,'mint',true);});
  box+=line(170,195,100,195,'amber',true)+line(430,195,500,195,'amber',true)+line(300,90,300,40,'amber',true)+line(300,300,300,350,'amber',true)+txt(90,120,'n','amber-fill')+txt(490,120,'n','amber-fill')+txt(95,285,'−2','amber-fill')+txt(460,285,'+2','amber-fill')+txt(300,395,'想像高斯面，非金屬','small-label','middle');
  const closed=svg('gauss-closed-art','均勻電場向右穿過虛線盒子，左面通量負二、右面正二，其餘四面零；盒內場非零。',box,430);
  let sphere='<circle cx="300" cy="210" r="115" class="blue dash"/>'+txt(300,220,'+1 nC','amber-fill','middle');
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
    const x=300+115*Math.cos(a),y=210+115*Math.sin(a);
    sphere+=line(x,y,x+65*Math.cos(a),y+65*Math.sin(a),'mint',true);
    const px=-Math.sin(a)*14,py=Math.cos(a)*14;
    sphere+=line(x+px,y+py,x+px+35*Math.cos(a),y+py+35*Math.sin(a),'amber',true);
  }
  sphere+=line(300,210,381.3,291.3,'axis')+txt(375,310,'r = 0.10 m','small-label')+txt(300,425,'圓形截面代表完整球面 4πr²','small-label','middle');
  const sphereArt=svg('gauss-sphere-art','孤立球心正一奈庫倫，四個電場箭頭等長徑向向外，外法向與場平行。',sphere,460);
  const plotX=r=>95+430*(r-.05)/.25,plotY=e=>355-270*e/3600;
  let radial=txt(80,40,'E（V/m）','small-label')+line(95,75,95,355)+line(95,355,525,355);
  for(const r of [.05,.1,.2,.3])radial+=line(plotX(r),75,plotX(r),355,'grid')+txt(plotX(r),390,r.toFixed(2),'small-label','middle');
  for(const e of [0,900,1800,3600])radial+=line(95,plotY(e),525,plotY(e),'grid')+txt(80,plotY(e)+7,e,'small-label','end');
  let d='';for(let i=0;i<=250;i++){const r=.05+i*.001;d+=`${i?'L':'M'}${plotX(r).toFixed(4)} ${plotY(k*Q/r**2).toFixed(4)}`;}
  radial+=`<path d="${d}" class="curve"/>`;
  for(const r of [.1,.2])radial+=`<circle cx="${plotX(r)}" cy="${plotY(k*Q/r**2)}" r="5" class="reference-point"/>`;
  radial+=`<circle id="gauss-radius-point" cx="${plotX(.1)}" cy="${plotY(k*Q/.1**2)}" r="8" class="point"/>`+txt(530,435,'r（m）','small-label','end');
  const radiusArt=svg('gauss-radius-art','點電荷場的平方反比曲線，橫軸半徑零點零五至零點三公尺，縱軸場強零至三千六百伏特每公尺。',radial,460);
  // Both straight rays start at the external charge; arrowheads point away from it.
  const cx=230,cy=220,R=125,sx=510,sy=220;
  let external='<circle cx="230" cy="220" r="125" class="blue dash"/>'+txt(530,228,'+q','amber-fill','middle');
  for(const slope of [-.22,.22]){
    const ex=50,ey=sy+slope*(ex-sx);
    external+=line(sx,sy,ex,ey,'mint',true);
    const A=1+slope*slope,B=2*(sx-cx),C=(sx-cx)**2-R**2;
    for(const dx of [(-B+Math.sqrt(B*B-4*A*C))/(2*A),(-B-Math.sqrt(B*B-4*A*C))/(2*A)]){
      const x=sx+dx,y=sy+slope*dx;
      external+=line(x,y,x+(x-cx)*.28,y+(y-cy)*.28,'amber',true);
    }
    const ax=390,ay=sy+slope*(ax-sx);external+=line(ax,ay,ax-28,ay-28*slope,'mint',true);
  }
  external+=txt(230,60,'Q內 = 0','small-label','middle')+txt(230,415,'淨 Φ = 0；局部 E ≠ 0','small-label','middle')+txt(400,350,'近側','small-label')+txt(55,350,'遠側','small-label');
  const externalArt=svg('gauss-external-art','外部正電荷在右側，兩條射線連續由右往左穿入再穿出左側球面；橘色法向朝外，球內沒有電荷。',external,450);
  let plates=line(130,70,130,235,'blue')+line(470,70,470,235,'blue')+txt(115,55,'+ / 10 V','amber-fill','middle')+txt(480,55,'− / 0 V','blue-fill','middle');
  for(const y of [110,155,200])plates+=line(165,y,430,y,'mint',true);
  plates+=line(130,260,470,260,'axis')+txt(300,290,'d = 1 mm','small-label','middle')+txt(300,330,'A = 0.01 m²；E → +x','small-label','middle');
  plates+=line(130,400,130,590)+line(130,590,470,590)+line(130,400,470,590,'mint')+line(300,495,300,590,'grid')+`<circle cx="300" cy="495" r="5" class="point"/>`+txt(90,407,'10','small-label','end')+txt(90,502,'5','small-label','end')+txt(90,597,'0','small-label','end')+txt(95,370,'電位（V）','small-label')+txt(130,625,'0','small-label','middle')+txt(300,625,'0.5','small-label','middle')+txt(470,625,'1','small-label','middle')+txt(500,665,'x（mm）','small-label','end');
  const platesArt=svg('gauss-plates-art','正板左十伏特，負板右零伏特，場朝右；下方電位線由零毫米十伏特線性降到一毫米零伏特，中點五伏特。',plates,690);
  const energyArt=svg('gauss-energy-art','充電當下電壓對電荷為過原點直線，曲線下三角面積為儲能，虛線矩形為電荷乘終值電壓。',txt(70,40,'v（V）','small-label')+line(100,80,100,360)+line(100,360,510,360)+'<path d="M100 360L510 360L510 90Z" fill="#78e2ca33"/>'+line(100,360,510,90,'mint')+'<path d="M100 360V90H510V360" class="amber dash"/>'+txt(80,98,'10','small-label','end')+txt(80,367,'0','small-label','end')+txt(100,398,'0','small-label','middle')+txt(510,398,'0.885419','small-label','end')+txt(510,440,'q（nC）','small-label','end')+txt(350,320,'U = ½QV','mint-fill','middle'),470);
  let dielectric=txt(155,55,'固定 V','mint-fill','middle')+txt(445,55,'固定 Q','amber-fill','middle');
  for(const x of [55,345]){
    dielectric+=`<rect x="${x}" y="90" width="220" height="180" class="material"/>`+line(x,80,x,280,'blue')+line(x+220,80,x+220,280,'blue')+txt(x+110,135,'εr = 3','small-label','middle');
  }
  dielectric+=line(75,210,255,210,'mint',true)+line(365,210,425,210,'mint',true)+txt(165,325,'E = 10000','small-label','middle')+txt(455,325,'E ≈ 3333.33','small-label','middle')+txt(300,375,'共同箭長尺度；E 單位 V/m','small-label','middle');
  const dielectricArt=svg('gauss-dielectric-art','相同幾何完全填入相對介電常數三。左固定電壓場不變，右固定初始電荷場降三分之一，兩欄電場箭長為三比一。',dielectric,410);
  const figures=[
    {id:'emgauss-patch',short:'01 法向投影',title:'轉的是面朝向，場沒有改。',subtitle:'θ 從電場量到法向；藍線是面片的側視。方向示意，非長度尺度。',diagram:patch,takeaways:take('電場 E / 面積 A','100 V/m / 0.02 m²')+take('法向投影 E cosθ','<span id="gauss-projected"></span>')+take('通量 Φ','<span id="gauss-flux"></span>'),extra:'<div class="phase-controls"><label for="gauss-angle">法向夾角 θ <output id="gauss-angle-out"></output></label><input id="gauss-angle" type="range" min="0" max="180" step="1" value="60"><div class="preset-controls">'+[0,60,90,120,180].map(v=>`<button type="button" data-angle="${v}">${v}°</button>`).join('')+'</div><p id="gauss-angle-why" aria-live="polite"></p></div><p class="formula-main">面積向量 = A n；Φ = E·(A n) = EA cosθ。</p>',detail:'<p>電通量（electric flux）是電場的面積加權投影，不是流過的電荷或電流。法向（normal）垂直面片；開放面可反選法向，正負改變而物理場不變。來源：圖解電磁學 05，高斯定律與對稱。</p>'},
    {id:'emgauss-integral',short:'02 分片加總',title:'先各自乘面積，再把四格相加。',subtitle:'四格是面片正面配置；綠箭頭另示 +x 法向場。箭長按 50 : 150 = 1 : 3。',diagram:integral,takeaways:take('左兩格','0.25 + 0.25 = 0.5 V·m')+take('右兩格','0.75 + 0.75 = 1.5 V·m')+take('總通量','2 V·m'),extra:'<p class="formula-main">Φ ≈ Σ (E·n) ΔA → ∫S E·n dA</p>',detail:'<p>這是同一平面各格的正面配置圖，綠箭頭另示各格沿 +x 的法向場，不是面內切向場。指定分區資料只教面積權重，邊界跳變不宣稱完整靜電場來源。再細分恆定區不改總和；一般非均勻場要取細分極限，不能拿單點乘全區面積。來源：圖解電磁學 05。</p>'},
    {id:'emgauss-closed',short:'03 封閉面',title:'有進有出，淨值可以為零。',subtitle:'均勻 E = 100 V/m 朝右；橘色外法向指向盒外。幾何為截面示意。',diagram:closed,takeaways:take('左面 / 右面','−2 / +2 V·m')+take('其餘四面','各 0 V·m')+take('全表面淨通量','0 V·m；E ≠ 0'),extra:'<p class="formula-main">左右面各 A = 0.02 m²。只取開放右面：+2 V·m；封閉六面：0 V·m。</p>',detail:'<p>封閉面積分（closed surface integral）統一用向外法向。上下、前後四面的法向垂直場，因此零通量；左右是非零貢獻抵消。虛線是想像高斯面，不是金屬屏蔽。來源：圖解電磁學 05。</p>'},
    {id:'emgauss-sphere',short:'04 球對稱',title:'對稱讓每一片都有同樣的場。',subtitle:'真空孤立點電荷，無外場或非對稱邊界。綠色 E、橘色 n；幾何示意。',diagram:sphereArt,takeaways:take('球面積 4πr²','0.125663706 m²')+take('E = kQ/r²','898.755179 V/m')+take('Φ = Q/ε0','112.940907 V·m'),extra:'<p class="formula-main">∮ E·n dA = E × 4πr² = Q/ε0。<br>ε0 = 8.8541878128 × 10⁻¹² F/m；k = 1/(4πε0)。</p>',detail:'<p>高斯定律（Gauss’s law）限制總通量。由來源球對稱得知徑向場、同半徑等大，才能把 E 提出積分；畫球面不會創造對稱。正電荷朝外；負電荷朝內，若 E 表徑向帶符號分量可為負。來源：圖解電磁學 05。</p>'},
    {id:'emgauss-radius',short:'05 半徑實驗',title:'面積變四倍，場變四分之一。',subtitle:'固定 Q = +1 nC；曲線使用未四捨五入常數。空心點是 0.10、0.20 m 參考。',diagram:radiusArt,takeaways:take('球面積 A','<span id="gauss-area"></span>')+take('場強 E','<span id="gauss-field"></span>')+take('總通量 Φ','<span id="gauss-total"></span>'),extra:'<div class="phase-controls"><label for="gauss-radius">半徑 r <output id="gauss-radius-out"></output></label><input id="gauss-radius" type="range" min="0.05" max="0.30" step="0.01" value="0.10"><div class="preset-controls"><button type="button" data-radius="0.10">0.10 m</button><button type="button" data-radius="0.20">0.20 m</button><button type="button" data-radius="0.10">重設 0.10 m</button></div><p id="gauss-radius-why" aria-live="polite"></p></div><p class="formula-main">E(r) = kQ/r²；A = 4πr²；EA = Q/ε0。<br>參考：E(0.10 m) ≈ 898.755；E(0.20 m) ≈ 224.689 V/m。</p>',detail:'<p>改變的是觀察球面半徑，不是電荷大小。曲線只畫 r &gt; 0；點電荷模型在 r → 0 發散，真實物體尺寸不能忽略時須另處理分布。來源：圖解電磁學 05。</p>'},
    {id:'emgauss-external',short:'06 外部電荷',title:'外部電荷改變場，不增加淨通量。',subtitle:'綠色射線由右側 +q 出發；橘色外法向。近側場較強，箭長僅示方向。',diagram:externalArt,takeaways:take('包覆電荷','Q內 = 0')+take('封閉面淨通量','Φ = 0')+take('球面局部電場','E ≠ 0'),extra:'<p class="formula-main">若另疊加球心 Q：總 Φ 仍為 Q/ε0，合成場卻失去球對稱。</p>',detail:'<p>外部電荷仍影響各點 E；抵消的是法向投影乘面積的積分，不是任選近遠兩點的場。Φ/A 只給平均外法向場，不能當每點的 E。均勻薄帶電球殼內零場還需完整球對稱且無外場。來源：圖解電磁學 05。</p>'},
    {id:'emgauss-plates',short:'07 場與端電壓',title:'場沿板距累成電壓。',subtitle:'板的長寬是示意；下方電位曲線按數值比例。導體內 E = 0，各自等位。',diagram:platesArt,takeaways:take('板間電場','10000 V/m → +x')+take('C = ε0 A/d','88.541878128 pF')+take('單板 |Q| = CV','0.88541878128 nC'),extra:'<p class="formula-main">V(x) = 10 − 10000x（V；x 用 m）。<br>由正板走向負板：ΔV = −Ed；端電壓 V正 − V負 = +Ed。<br>D = Q/A，D = εE，V = Ed → C = εA/d。</p>',detail:'<p>忽略邊緣、漏電與擊穿，中央場均勻；A = 0.01 m²，d = 0.001 m。Q 是單板電荷量大小，不把正負兩板相加成 2Q。導體等位不表示接地或零伏特。導體表面外場 σ/ε0 不同於孤立無限薄片單側場 σ/(2ε0)。來源：圖解電磁學 07、09。</p>'},
    {id:'emgauss-energy',short:'08 儲能',title:'一半來自逐步充電。',subtitle:'橫軸是電荷，不是時間；綠色三角形為儲能，橘色虛線是完整 QV 矩形。',diagram:energyArt,takeaways:take('U = ½QV = ½CV²','4.4270939064 nJ')+take('矩形 QV','8.8541878128 nJ')+take('場能密度 u','0.44270939064 mJ/m³'),extra:'<p class="formula-main">v(q) = q/C；U = ∫₀Q v(q) dq。<br>u = ½ε0E²；Ad = 10⁻⁵ m³；uAd = 4.4270939064 nJ。</p>',detail:'<p>線性電容由 0 到 10 V 的平均充電電壓是 5 V，三角形因此只有矩形一半。元件與場能是在算同一份能量，不是兩份相加。固定電壓源經電阻充電另有耗散，不把儲能當電源總供能。來源：圖解電磁學 09。</p>'},
    {id:'emgauss-dielectric',short:'09 材料與條件',title:'先問哪個量被固定。',subtitle:'共同初態：真空、10 V。相同幾何，線性均勻各向同性材料完全填滿。',diagram:dielectricArt,takeaways:take('兩側同樣的 C','265.625634384 pF'),extra:'<div class="comparison"><section><h4>接著電源：固定 V</h4><p>V = 10 V<br>Q = 2.65625634384 nC<br>E = 10000 V/m<br>U = 13.2812817192 nJ</p></section><section><h4>先斷開：固定 Q</h4><p>Q = 0.88541878128 nC<br>V = 10/3 ≈ 3.333333 V<br>E ≈ 3333.333333 V/m<br>U = 1.4756979688 nJ</p></section></div><p class="formula-main">∮ D·n dA = Q自由；D = εE。<br>∮ E·n dA = Q總/ε0；Q總含自由與束縛電荷。</p>',detail:'<p>電位移（electric displacement）D 的單位 C/m²；材料極化（polarization）形成束縛電荷。不能用自由 Q/ε0 當材料內 E 的通量。固定 V 時電源補自由電荷；固定 Q 時無進出通路且忽略漏電。能量變化含電源與插入材料的外力交換，不是憑空增加或消失。來源：圖解電磁學 08、09。</p>'}
  ];
  figures.forEach((f,i)=>f.look=`看圖${['一','二','三','四','五','六','七','八','九'][i]}：${f.subtitle} 看完再繼續。`);
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function point(id,x1,y1,x2,y2){const el=$(id);for(const [key,value] of Object.entries({x1,y1,x2,y2}))el.setAttribute(key,value);}
  function updateAngle(){
    const angle=Number($('gauss-angle').value),r=angle*Math.PI/180,c=Math.abs(Math.cos(r))<1e-12?0:Math.cos(r),s=Math.sin(r),x=290,y=210;
    point('gauss-normal',x,y,x+125*c,y-125*s);
    point('gauss-surface',x-110*s,y-110*c,x+110*s,y+110*c);
    point('gauss-projection',x,y,x+160*c*c,y-160*c*s);
    point('gauss-drop',450,210,x+160*c*c,y-160*c*s);
    $('gauss-projection').setAttribute('visibility',c===0?'hidden':'visible');
    $('gauss-normal-label').setAttribute('x',x+155*c);$('gauss-normal-label').setAttribute('y',y-155*s-12);
    $('gauss-angle-out').value=`${angle}°`;$('gauss-projected').textContent=`${(100*c).toFixed(3)} V/m`;$('gauss-flux').textContent=`${(2*c).toFixed(3)} V·m`;
    $('gauss-angle-why').textContent=c===0?'法向與場垂直，場沿面滑過，通量為零；電場仍然是 100 V/m。':c>0?'場沿選定法向穿過，投影與通量為正。面片始終與法向垂直。':'場朝選定法向的反面穿過，投影與通量為負；原來的電場沒有改變。';
  }
  function updateRadius(){const r=Number($('gauss-radius').value),a=4*Math.PI*r*r,e=k*Q/(r*r);$('gauss-radius-out').value=`${r.toFixed(2)} m`;$('gauss-area').textContent=`${a.toFixed(9)} m²`;$('gauss-field').textContent=`${e.toFixed(6)} V/m`;$('gauss-total').textContent=`${(Q/eps0).toFixed(6)} V·m`;$('gauss-radius-point').setAttribute('cx',plotX(r));$('gauss-radius-point').setAttribute('cy',plotY(e));$('gauss-radius-why').textContent=`相對 0.10 m：面積是 ${(r*r/.01).toFixed(2)} 倍，場是 ${(.01/r/r).toFixed(3)} 倍。包住同一電荷，總通量不變。`;}
  $('gauss-angle').addEventListener('input',updateAngle);document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>{$('gauss-angle').value=b.dataset.angle;updateAngle();}));
  $('gauss-radius').addEventListener('input',updateRadius);document.querySelectorAll('[data-radius]').forEach(b=>b.addEventListener('click',()=>{$('gauss-radius').value=b.dataset.radius;updateRadius();}));updateAngle();updateRadius();
  const lessons=window.EMGAUSS_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='emgauss-audio-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  let lessonIndex=Math.max(0,lessons.findIndex(l=>l.id===saved.lesson));
  let segmentIndex=Math.min(Math.max(0,Number.isInteger(saved.segment)?saved.segment:0),lessons[lessonIndex].segments.length-1);
  let state=saved.state==='checkpoint'?'checkpoint':'idle';
  let voices=[],voiceURI=saved.voice||'',rate=Math.min(1.2,Math.max(.7,Number(saved.rate)||.9));
  let mediaRate=Math.min(2,Math.max(.75,Number(saved.mediaRate)||1));
  let generation=0,audio=null,utterance=null,chunks=[],chunkIndex=0,chunkStarted=false,chunkElapsed=0,chunkLimit=0;
  const courseAudio=$('course-audio');
  const assets=window.EMGAUSS_AUDIO_ASSETS||{segments:{}};
  const courseSegmentIds=new Set(lessons.flatMap(item=>item.segments.map(part=>part.id)));
  const generatedAudioCount=[...courseSegmentIds].filter(id=>{
    const src=assets.segments?.[id]?.src;
    return typeof src==='string'&&src.trim().length>0;
  }).length;
  $('audio-generation-count').textContent=`已生成 ${generatedAudioCount}／${courseSegmentIds.size} 段音檔`;
  $('audio-generation-note').textContent=generatedAudioCount===courseSegmentIds.size
    ?'整課音檔已齊全，可依課程段落播放；看圖停靠仍會等待你繼續。'
    :'尚未生成的段落可先讀講稿、看圖；有中文系統聲音時，按播放才會朗讀。正式音檔尚未製作。';
  let mediaKey='';
  const lesson=()=>lessons[lessonIndex];
  const segment=()=>lesson().segments[segmentIndex];
  const selectedVoice=()=>voices.find(v=>v.voiceURI===voiceURI)||voices[0];
  function save(){try{localStorage.setItem(storageKey,JSON.stringify({lesson:lesson().id,segment:segmentIndex,state,rate,mediaRate,voice:voiceURI}));}catch{}}
  const audioSrc=()=>assets.segments?.[segment().id]?.src||segment().audioSrc||'';
  function canPlay(){return Boolean(audioSrc() || (supported&&voices.length));}
  function sourceLabel(){return audioSrc()?`聲音來源：本段音檔 ${audioSrc()}`:selectedVoice()?`聲音來源：瀏覽器系統語音 · ${selectedVoice().name}（${selectedVoice().lang}）`:'聲音來源：尚無可用的中文系統語音。';}
  function renderControls(message){
    const names={idle:'準備就緒',playing:'聆聽中',paused:'已暫停',checkpoint:'看圖停靠',ended:'本堂完成',error:'播放中斷'};
    $('state-badge').textContent=names[state]||'準備就緒';
    $('play-button').textContent=state==='checkpoint'?'看完了，繼續':state==='paused'?'繼續播放':state==='ended'?'重聽本堂':'開始聽課';
    $('play-button').disabled=state==='playing'||!canPlay();
    $('pause-button').disabled=state!=='playing';
    $('replay-button').disabled=!canPlay();
    $('next-button').disabled=segmentIndex>=lesson().segments.length-1;
    $('voice-source').textContent=sourceLabel();
    $('voice-select').disabled=Boolean(audioSrc())||!voices.length;
    $('speech-rate').disabled=Boolean(audioSrc());
    $('checkpoint-notice').hidden=state!=='checkpoint';
    if(state==='checkpoint'){
      const f=figures.find(f=>f.id===segment().figure);
      $('checkpoint-text').textContent=f?f.look:'稍作回顧；準備好後再繼續。';
      $('show-figure').hidden=!f;
    }
    if(message!==undefined)$('player-status').textContent=message;
    else if(!canPlay())$('player-status').textContent=supported?'尚未找到中文聲音，或聲音清單仍在載入。可展開下方完整講稿閱讀；不會改用英文聲音。':'此瀏覽器不支援系統朗讀。請使用完整講稿與圖解。';
    save();
  }
  function stop(){
    generation++;
    detachMediaEvents();courseAudio.pause();audio=null;
    utterance=null;chunkStarted=false;chunkElapsed=0;
    if(supported)synth.cancel();
  }
  function detachMediaEvents(){
    courseAudio.onplay=null;courseAudio.onpause=null;courseAudio.onended=null;courseAudio.onerror=null;courseAudio.onseeked=null;
  }
  function formatTime(seconds,exact=false){
    if(!Number.isFinite(seconds)||seconds<0)return '—';
    const minutes=Math.floor(seconds/60),rest=seconds-minutes*60;
    return `${minutes}:${(exact?rest.toFixed(1):String(Math.floor(rest))).padStart(exact?4:2,'0')}`;
  }
  function updateMediaTime(element,output){
    $(output).textContent=`${formatTime(element.currentTime)} / ${formatTime(element.duration,true)}`;
  }
  function atMediaEnd(tolerance=.04){return Number.isFinite(courseAudio.duration)&&courseAudio.duration>0&&courseAudio.currentTime>=courseAudio.duration-tolerance;}
  function pauseCourse(message='已暫停；按繼續回到剛才的位置。'){
    if(state!=='playing')return;
    state='paused';
    if(audio)audio.pause();else if(utterance)synth.pause();
    renderControls(message);
  }
  function prepareMedia(){
    const src=audioSrc(),key=src?`${segment().id}|${src}`:'';
    $('course-audio-panel').hidden=!src;$('tts-seek-note').hidden=Boolean(src);
    if(!src){
      detachMediaEvents();courseAudio.pause();audio=null;
      if(mediaKey){courseAudio.removeAttribute('src');courseAudio.load();mediaKey='';}
      return;
    }
    audio=courseAudio;
    if(mediaKey!==key){
      detachMediaEvents();courseAudio.pause();mediaKey=key;
      courseAudio.src=src;courseAudio.load();
    }
    courseAudio.playbackRate=mediaRate;
    $('course-download').href=src;
    $('course-download').download=src.split('/').pop()||`${segment().id}.mp3`;
    updateMediaTime(courseAudio,'course-time');
    const token=generation,id=segment().id;
    const valid=()=>token===generation&&id===segment().id&&mediaKey===key;
    courseAudio.onplay=()=>{
      if(!valid()||courseAudio.paused)return;
      state='playing';
      renderControls('正在播放本段音檔；時間與進度只代表這一段。');
    };
    courseAudio.onpause=()=>{
      if(!valid()||!courseAudio.paused||courseAudio.ended||atMediaEnd())return;
      if(state==='playing'){state='paused';renderControls('音檔已暫停；拖曳可調整本段播放位置。');}
    };
    courseAudio.onended=()=>{if(valid()&&atMediaEnd())completeSegment(token);};
    courseAudio.onseeked=()=>{
      if(!valid())return;
      updateMediaTime(courseAudio,'course-time');
      if(segment().checkpoint&&atMediaEnd(.15)&&state!=='checkpoint'){
        // Only an explicit seek gets tolerance for MP3 duration corrections.
        // Normal playback still waits for the actual ended event.
        state='playing';completeSegment(token);courseAudio.pause();
      }
    };
    courseAudio.onerror=()=>{if(valid())fail(token,'本段音檔無法讀取。');};
  }
  function setRate(value){
    const numeric=Number(value);if(!Number.isFinite(numeric))return;
    rate=Math.round(Math.min(1.2,Math.max(.7,numeric))*100)/100;
    $('speech-rate').value=String(rate);$('rate-value').value=`${rate}×`;
    save();
  }
  function setMediaRate(value){
    const numeric=Number(value);if(!Number.isFinite(numeric))return;
    mediaRate=Math.round(Math.min(2,Math.max(.75,numeric))*100)/100;
    for(const id of ['course-rate']){
      if(!Array.from($(id).options).some(option=>Number(option.value)===mediaRate)){
        const option=document.createElement('option');option.value=String(mediaRate);option.textContent=`${mediaRate}×`;$(id).append(option);
      }
      $(id).value=String(mediaRate);
    }
    for(const element of [courseAudio]){
      element.preservesPitch=true;
      if(Math.abs(element.defaultPlaybackRate-mediaRate)>.001)element.defaultPlaybackRate=mediaRate;
      if(Math.abs(element.playbackRate-mediaRate)>.001)element.playbackRate=mediaRate;
    }
    save();
  }
  function renderLesson(){
    $('lesson-select').value=lesson().id;
    $('lesson-summary').textContent=lesson().summary||'';
    const spokenChars=lesson().segments.reduce((sum,s)=>sum+(String(s.text).match(/[\u3400-\u9fff]/g)||[]).length,0);
    $('duration-estimate').textContent=`本堂約 ${Math.round(spokenChars/280)}–${Math.round(spokenChars/240)} 分鐘（正文估算）`;
    $('duration-estimate').title='以每分鐘 240–280 個中文字估算；實際長度受語速、音色及數字讀法影響，人工停靠另計。';
    $('segment-list').replaceChildren();
    $('transcript-content').replaceChildren();
    lesson().segments.forEach((s,i)=>{
      const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.dataset.index=String(i);button.setAttribute('aria-current',String(i===segmentIndex));
      const n=document.createElement('span');n.className='segment-number';n.textContent=String(i+1).padStart(2,'0');
      const label=document.createElement('span');label.className='segment-label';label.textContent=s.title;
      button.append(n,label);if(s.checkpoint){const stopLabel=document.createElement('span');stopLabel.className='stop-dot';stopLabel.textContent='看圖';button.append(stopLabel);}li.append(button);$('segment-list').append(li);
      const section=document.createElement('section');section.className='transcript-section';const heading=document.createElement('h3');heading.textContent=`${i+1}. ${s.title}`;const p=document.createElement('p');p.textContent=s.text;section.append(heading,p);if(s.checkpoint){const note=document.createElement('span');note.className='transcript-stop';note.textContent=figures.find(f=>f.id===s.figure)?.look||'此處停靠，手動繼續。';section.append(note);}$('transcript-content').append(section);
    });
    renderSegment();
  }
  function renderSegment(){
    $('segment-title').textContent=segment().title;
    $('progress-label').textContent=`${String(segmentIndex+1).padStart(2,'0')} / ${String(lesson().segments.length).padStart(2,'0')}`;
    $('lesson-progress').max=lesson().segments.length;$('lesson-progress').value=segmentIndex;
    $('segment-list').querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.index)===segmentIndex)));
    if(segment().figure)showFigure(segment().figure);
    prepareMedia();
    renderControls(state==='checkpoint'?'已停靠在教材。看完後按「看完了，繼續」。':canPlay()?'準備好後按開始；切換段落不會自動播放。':undefined);
  }
  function navigate(index){stop();segmentIndex=index;state='idle';renderSegment();}
  function completeSegment(token){
    if(token!==generation||state!=='playing')return;
    utterance=null;chunkStarted=false;
    if(segment().checkpoint){state='checkpoint';renderControls('這裡先停下來看圖。看完後按「看完了，繼續」。');}
    else if(segmentIndex<lesson().segments.length-1){stop();segmentIndex++;state='idle';renderSegment();start();}
    else{state='ended';$('lesson-progress').value=lesson().segments.length;renderControls('本堂已完成。可重聽、讀講稿，或選擇下一堂。');}
  }
  function fail(token,message){if(token!==generation)return;stop();state='error';renderControls(message+' 可按重播本段，或閱讀完整講稿。');}
  function splitText(text){
    // Short punctuation-aware utterances avoid browsers silently dropping long input.
    const sentences=String(text).match(/[^。！？；\n]+[。！？；\n]?/g)||[];
    return sentences.flatMap(sentence=>{const output=[];let part='';for(const char of sentence){part+=char;if(part.length>=65||(/[，、：]/.test(char)&&part.length>=35)){output.push(part);part='';}}if(part.trim())output.push(part);return output;}).filter(s=>s.trim());
  }
  function speakChunk(token){
    if(token!==generation||state!=='playing'||utterance)return;
    if(chunkIndex>=chunks.length){completeSegment(token);return;}
    const voice=selectedVoice();
    if(!voice){fail(token,'中文系統語音目前無法使用，已停止播放；聲音恢復後可重播本段。');return;}
    const u=new SpeechSynthesisUtterance(chunks[chunkIndex]);utterance=u;
    u.voice=voice;u.lang=voice.lang;u.rate=rate;
    chunkStarted=false;chunkElapsed=0;chunkLimit=Math.max(35,chunks[chunkIndex].length/(2*rate)+20);
    u.onstart=()=>{if(token===generation&&utterance===u)chunkStarted=true;};
    u.onend=()=>{if(token!==generation||utterance!==u)return;chunkStarted=false;utterance=null;chunkIndex++;if(state==='playing')setTimeout(()=>speakChunk(token),100);};
    u.onerror=event=>{if(token!==generation||utterance!==u)return;fail(token,`系統朗讀中斷（${event.error||'未知錯誤'}）。`);};
    try{synth.speak(u);}catch{fail(token,'無法啟動中文系統朗讀。');}
  }
  function start(){
    if(state==='playing'||!canPlay())return;

    if(state==='checkpoint'){
      if(segmentIndex===lesson().segments.length-1){state='ended';$('lesson-progress').value=lesson().segments.length;renderControls('本堂已完成，可選擇下一堂。');return;}
      stop();segmentIndex++;state='idle';renderSegment();
      if(!canPlay()){renderControls();return;}
    }
    if(state==='ended'){stop();segmentIndex=0;state='idle';renderSegment();}
    if(state==='paused'){
      state='playing';renderControls('繼續播放。');const token=generation;
      if(audio){audio.play().catch(()=>{if(state==='playing')fail(token,'瀏覽器未允許音檔繼續播放。');});}
      else if(utterance){synth.resume();}
      else{speakChunk(token);}
      return;
    }
    stop();prepareMedia();state='playing';const token=generation;renderControls('正在播放本段；看圖停靠處會等待你繼續。');
    if(audioSrc()){
      audio.play().catch(()=>{if(state==='playing')fail(token,'音檔播放未成功啟動。');});
    }else{chunks=splitText(segment().text);chunkIndex=0;speakChunk(token);}
  }
  function loadVoices(){
    const hadVoice=voices.length>0;
    if(!supported){renderControls();return;}
    voices=synth.getVoices().filter(v=>/^(zh|cmn|yue)([-_]|$)/i.test(v.lang));
    voices.sort((a,b)=>Number(/^zh[-_]TW$/i.test(b.lang))-Number(/^zh[-_]TW$/i.test(a.lang)));
    if(!voices.some(v=>v.voiceURI===voiceURI))voiceURI=voices[0]?.voiceURI||'';
    $('voice-select').replaceChildren();
    if(!voices.length){const option=document.createElement('option');option.textContent='尚無中文語音';$('voice-select').append(option);}
    voices.forEach(v=>{const option=document.createElement('option');option.value=v.voiceURI;option.textContent=`${v.name} · ${v.lang}`;$('voice-select').append(option);});
    $('voice-select').value=voiceURI;renderControls(!hadVoice&&voices.length&&state==='idle'?'中文系統語音已準備好。請按開始聽課。':undefined);
  }
  lessons.forEach(l=>{const option=document.createElement('option');option.value=l.id;option.textContent=l.title;$('lesson-select').append(option);});
  $('lesson-select').addEventListener('change',()=>{stop();lessonIndex=lessons.findIndex(l=>l.id===$('lesson-select').value);segmentIndex=0;state='idle';$('copy-status').textContent='';renderLesson();});
  $('segment-list').addEventListener('click',event=>{const button=event.target.closest('button');if(button)navigate(Number(button.dataset.index));});
  $('play-button').addEventListener('click',start);
  $('pause-button').addEventListener('click',()=>pauseCourse());
  $('replay-button').addEventListener('click',()=>{stop();if(audioSrc())courseAudio.currentTime=0;state='idle';start();});
  $('next-button').addEventListener('click',()=>{if(segmentIndex<lesson().segments.length-1)navigate(segmentIndex+1);});
  $('show-figure').addEventListener('click',()=>showFigure(segment().figure,true));
  $('voice-select').addEventListener('change',()=>{const wasActive=state==='playing'||state==='paused';stop();voiceURI=$('voice-select').value;if(wasActive)state='idle';renderControls('已切換系統聲音。按開始會從本段開頭播放。');});
  for(const id of ['course-rate']){
    $(id).innerHTML=[.75,.9,1,1.1,1.25,1.5,1.75,2].map(r=>`<option value="${r}">${r}×</option>`).join('');
    $(id).addEventListener('change',()=>setMediaRate($(id).value));
  }
  $('speech-rate').addEventListener('input',()=>setRate($('speech-rate').value));
  [courseAudio].forEach(element=>element.addEventListener('ratechange',()=>setMediaRate(element.playbackRate)));
  setRate(rate);setMediaRate(mediaRate);
  $('speech-rate').addEventListener('change',()=>{if(!audio&&state==='playing')renderControls('語速將從下一個短句套用；實際時長會隨語速與音色改變。');});
  $('copy-script').addEventListener('click',async()=>{
    const text=lesson().title+'\n\n'+lesson().segments.map((s,i)=>`${i+1}. ${s.title}\n\n${s.text}${s.checkpoint?'\n\n〔看圖停靠〕'+(figures.find(f=>f.id===s.figure)?.look||''):''}`).join('\n\n');
    try{await navigator.clipboard.writeText(text);$('copy-status').textContent='已複製本堂完整講稿。';}catch{const range=document.createRange();range.selectNodeContents($('transcript-content'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='瀏覽器不允許自動複製，已選取講稿；請按 Ctrl+C／⌘C。';}
  });
  // Detect silence without treating background-tab throttling as missing content.
  setInterval(()=>{if(state!=='playing'||audio||!utterance||document.hidden)return;chunkElapsed++;if(chunkElapsed>chunkLimit)fail(generation,chunkStarted?'系統語音長時間未完成這個短句。':'系統語音未開始出聲。');},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state==='playing')renderControls('已回到教材；若背景朗讀被瀏覽器暫停，可暫停再繼續，或重播本段。');});
  window.addEventListener('pagehide',()=>{save();stop();});
  if(supported){synth.addEventListener?.('voiceschanged',loadVoices);}
  ['loadedmetadata','durationchange','timeupdate','seeked','emptied'].forEach(event=>{
    courseAudio.addEventListener(event,()=>updateMediaTime(courseAudio,'course-time'));
  });
  renderLesson();loadVoices();
  // Some browsers populate voices late without emitting voiceschanged.
  [500,1500,4000].forEach(delay=>setTimeout(loadVoices,delay));
})();

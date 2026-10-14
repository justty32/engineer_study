(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden"><defs>'+Object.entries(colors).map(([n,c])=>`<marker id="eb-${n}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('')+'</defs></svg>');
  const line=(x,y,a,b,cls='axis',arrow=false)=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" class="${cls}"${arrow?` marker-end="url(#eb-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,cls='',anchor='start',id='')=>`<text ${id?`id="${id}"`:''} x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg=(id,title,body,h=450)=>`<svg viewBox="0 0 600 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,value)=>`<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  const control=(id,min,max)=>`<div class="phase-controls"><label for="${id}">電流增益 β <output id="${id}-output">100</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="10" value="100"><div class="preset-controls">${[50,100,200].map(v=>`<button type="button" data-control="${id}" data-value="${v}">β = ${v}</button>`).join('')}</div><p id="${id}-why" aria-live="polite"></p></div>`;
  const calc=b=>{const vth=120/57,rth=470/57,ib=(vth-.7)/(rth+b+1),ic=b*ib,ie=(b+1)*ib,ve=ie,vb=ve+.7,vc=12-2*ic;return{ib,ic,ie,ve,vb,vc,vce:vc-ve};};
  const fixed=b=>{const ib=9.3/180,ic=b*ib,vc=10-ic;return{ib,ic,vc,valid:vc>.7+1e-10};};
  const structure=svg('eb-physical','NPN 結構：重摻雜射極、薄基極、集極。綠色電子 E 到 C；橘色傳統電流 IC 和 IB 流入，IE 流出。',
    `<rect x="55" y="90" width="190" height="180" rx="12" class="blue"/><rect x="245" y="90" width="65" height="180" class="amber"/><rect x="310" y="90" width="230" height="180" rx="12" class="blue"/>`+
    txt(145,55,'射極 E','','middle')+txt(278,55,'B','','middle')+txt(430,55,'集極 C','','middle')+txt(145,125,'N⁺ 重摻雜','blue-fill','middle')+txt(278,125,'P','amber-fill','middle')+txt(430,125,'N','blue-fill','middle')+
    line(90,180,480,180,'mint',true)+txt(300,220,'電子 →','mint-fill','middle')+line(275,190,275,255,'mint',true)+txt(280,310,'薄基極：少量復合','muted-text','middle')+
    line(130,365,55,365,'amber',true)+txt(145,372,'IE 流出','amber-fill')+line(540,365,430,365,'amber',true)+txt(540,410,'IC 流入','amber-fill','end')+line(278,425,278,345,'amber',true)+txt(120,462,'IB 流入','amber-fill')+txt(300,510,'BE 順偏 · BC 反偏','','middle'),545);
  function circuit(id,divider=false){
    let body=`<path d="M80 165V60H450V110M450 180V225L355 270M355 245V320M355 300L450 350V${divider?370:455}M450 ${divider?430:455}V455H80V235" class="wire"/><circle cx="80" cy="200" r="35" class="blue"/>`+txt(80,195,'+','blue-fill','middle')+txt(80,222,'−','blue-fill','middle')+txt(80,285,divider?'12 V':'10 V','blue-fill','middle')+`<rect x="435" y="110" width="30" height="70" class="blue"/>`+txt(475,145,divider?'2 kΩ':'1 kΩ','blue-fill')+txt(475,225,'C')+txt(325,260,'B')+txt(475,350,'E')+line(382,314,420,335,'amber',true)+line(450,190,450,220,'amber',true)+txt(495,200,'IC','amber-fill')+line(280,282,330,282,'amber',true)+txt(280,265,'IB','amber-fill')+txt(300,505,'底端：0 V 參考點','muted-text','middle');
    if(divider){body+=`<path d="M220 60V110M220 180V282H355M220 282V355M220 425V455" class="wire"/><rect x="205" y="110" width="30" height="70" class="blue"/><rect x="205" y="355" width="30" height="70" class="blue"/><rect x="435" y="370" width="30" height="60" class="mint"/>`+txt(250,145,'47 kΩ')+txt(250,402,'10 kΩ')+txt(480,410,'1 kΩ','mint-fill')+txt(365,420,'IE','amber-fill');}
    else{body+=`<path d="M220 60V110M220 180V282H355" class="wire"/><rect x="205" y="110" width="30" height="70" class="blue"/>`+txt(250,145,'180 kΩ')+txt(220,330,'VB = 0.7 V','amber-fill','middle')+txt(220,375,'β = 100','muted-text','middle');}
    return svg(id,divider?'分壓偏壓：47k與10k接基極，2k接集極，1k接射極，12V閉合供電回路':'固定基極驅動：10V經180k接B，經1k接C，E接0V；NPN射極箭頭向外',body,535);
  }
  const equivalent=svg('eb-equivalent','基極戴維寧等效：2.105263V源串8.245614k歐姆，經BE及射極1k歐姆回到參考點；IC另外匯入，所以RE流IE',
    `<path d="M100 230V80H220M340 80H460V160M460 230V285M460 355V420H100V300" class="wire"/><circle cx="100" cy="265" r="35" class="blue"/><rect x="220" y="65" width="120" height="30" class="blue"/><rect x="440" y="160" width="40" height="70" class="amber"/><rect x="445" y="285" width="30" height="70" class="mint"/>`+
    txt(100,260,'+','blue-fill','middle')+txt(100,287,'−','blue-fill','middle')+txt(280,40,'Rth = 8.246 kΩ','','middle')+txt(100,345,'2.105 V','blue-fill','middle')+txt(425,200,'BE 0.7 V','amber-fill','end')+txt(420,325,'RE = 1 kΩ','mint-fill','end')+line(370,80,420,80,'amber',true)+txt(405,125,'IB','amber-fill','middle')+line(560,255,460,255,'amber',true)+txt(550,235,'IC','amber-fill','end')+line(515,285,515,350,'amber',true)+txt(545,335,'IE','amber-fill')+txt(300,470,'IE = IC + IB','','middle'),505);
  function qplot(id,dynamic=false){const x=v=>75+v*37,y=i=>335-i*65;let body=txt(75,38,'IC（mA）','muted-text')+line(75,335,535,335)+line(75,335,75,65);
    [0,4,8,12].forEach(v=>body+=line(x(v),65,x(v),335,'grid')+txt(x(v),370,v,'tiny-text','middle'));
    [0,1,2,3,4].forEach(i=>body+=txt(58,y(i)+7,i,'tiny-text','end'));
    if(!dynamic)body+=line(x(0),y(12/3.01),x(12),y(0),'blue dash');
    const q=calc(100);body+=`<circle id="${id}-point" cx="${x(q.vce)}" cy="${y(q.ic)}" r="8" class="point"/>`+txt(x(q.vce)+15,y(q.ic)-15,'Q','amber-fill','start',`${id}-label`)+txt(535,415,'VCE（V）','muted-text','end');return svg(id,dynamic?'目前貝塔設定的工作點，橫軸VCE、縱軸IC':'固定貝塔100的直流負載線與Q點；截距僅為幾何延伸，不保證作用區',body,440);}
  const voltage=svg('eb-node-levels','固定貝塔100：VC9.427V高於VB1.999V，VB高於VE1.299V。VCE等於VC減VE。',
    line(100,65,500,65,'blue')+txt(100,48,'VC 9.427 V','blue-fill')+line(100,185,500,185,'amber')+txt(100,165,'VB 1.999 V','amber-fill')+line(100,265,500,265,'mint')+txt(100,245,'VE 1.299 V','mint-fill')+line(100,345,500,345)+txt(100,325,'參考點 0 V','muted-text')+line(540,65,540,265,'amber',true)+txt(300,395,'VCE = VC − VE = 8.128 V','','middle')+txt(300,435,'高低順序示意，間距不按比例','muted-text','middle'),465);
  const region=svg('eb-region-meter','作用區候選集極電壓；低於或等於基極時隱藏候選點，不把負候選當實際電壓',
    line(80,110,530,110)+[0,.7,5,10].map(v=>line(80+45*v,100,80+45*v,120)+txt(80+45*v,v===.7?180:155,v,'tiny-text','middle')).join('')+line(111.5,75,111.5,125,'amber')+txt(100,220,'VB = 0.7 V','amber-fill')+`<circle id="eb-candidate-point" cx="297.5" cy="110" r="9" class="point"/>`+txt(300,280,'候選 VC = 4.833 V','big-text','middle','eb-candidate-label')+txt(300,325,'VC > VB 才可採用','muted-text','middle'),355);
  const bx=b=>80+450*(b-50)/150,by=r=>335-130*(r-.4),base=calc(100).ic;
  const path=f=>Array.from({length:151},(_,i)=>`${i?'L':'M'}${bx(i+50).toFixed(2)} ${by(f(i+50)).toFixed(2)}`).join(' ');
  const stability=svg('eb-stability-chart','電流相對貝塔100基準的比例：綠色分壓加RE曲線、橘色固定IB比例線；兩者皆各自歸一化',
    txt(80,35,'IC / IC（β = 100）','muted-text')+[.5,1,1.5,2].map(v=>line(80,by(v),530,by(v),'grid')+txt(65,by(v)+8,v,'tiny-text','end')).join('')+[50,100,150,200].map(b=>line(bx(b),65,bx(b),335,'grid')+txt(bx(b),370,b,'tiny-text','middle')).join('')+`<path d="${path(b=>b/100)}" class="amber"/><path d="${path(b=>calc(b).ic/base)}" class="mint"/><circle id="eb-stable-dot" cx="${bx(100)}" cy="${by(1)}" r="8" class="point"/><circle id="eb-fixed-dot" cx="${bx(100)}" cy="${by(1)}" r="6" class="blue"/>`+txt(530,415,'β','muted-text','end'),440);
  const figures=[
    {id:'eb-structure',short:'01 薄基區',title:'電子穿越薄基區，兩個接面相互影響。',subtitle:'綠色追蹤電子；橘色追蹤傳統電流。這是結構示意，尺寸不按比例。',look:'看圖一：綠色電子 E → B → C；橘色 IC、IB 流入，IE 流出。確認 BE 順偏、BC 反偏。',diagram:structure,takeaways:take('電荷守恆','IE = IC + IB')+take('前向作用區','BE 順偏、BC 反偏'),detail:'<p>雙極性接面電晶體（bipolar junction transistor, BJT）。NPN 射極重摻雜、基區薄且較輕摻雜。注入基區的電子是少數載子，主要靠擴散穿越基區，多數尚未復合就被集極接面的電場收集。</p><p>基極電流包含補充基區復合及基極向射極的載子注入。兩顆獨立二極體不具有共享薄基區的輸運耦合，不能取代電晶體。圖中復合箭頭表示少量電子在基區消失於復合，不是流向外部 B 端的電子電流比例圖。</p>'},
    {id:'eb-loop',short:'02 兩條回路',title:'小基極電流，連到較大的集極電流。',subtitle:'固定 β = 100；兩條閉合支路共享 10 V 供電，E 接 0 V。',look:'看圖二：分別追蹤 180 kΩ 基極支路與 1 kΩ 集極支路。最後確認 VC = 4.833 V > VB = 0.7 V。',diagram:circuit('eb-fixed-circuit'),takeaways:take('IB / IC','51.667 μA / 5.167 mA')+take('VC = VCE','4.833 V')+take('作用區檢查','4.833 > 0.7 V'),extra:'<p class="formula-main">輸出回路能量來自 VCC；β 不是能量增益。</p>',detail:'<p class="equation">IB = (10 − 0.7)/180 kΩ = 51.6667 μA<br>IC = 100 IB = 5.16667 mA<br>VC = 10 − IC × 1 kΩ = 4.83333 V<br>IE = IC + IB = 5.21833 mA</p><p>採固定 VBE = 0.7 V、固定 β，忽略 Early 效應。β 是隨器件與條件而變的近似參數。本例 E 接 0，故 VCE = VC；下一堂有 RE 時必須相減。</p>'},
    {id:'eb-region',short:'03 模型邊界',title:'算出電流後，還要檢查接面偏壓。',subtitle:'只改 β；作用區候選不符合 VC > VB 時，停止採用模型。',look:'看圖三：按 β = 50、100、200，再試 180。180 是 BC 零偏界；200 的負候選表示模型失效。',diagram:region,extra:control('eb-beta-region',50,250)+'<p class="formula-main">另行假設深飽和 VCE ≈ 0.2 V → 負載估計 IC ≈ 9.8 mA。<br>這不是飽和轉折的精確解；滑桿只檢查作用區候選。</p>',takeaways:take('作用區候選 IC','<span id="eb-region-ic">5.167 mA</span>')+take('候選判準','<span id="eb-region-state">前向作用區</span>'),detail:'<p class="equation">IB = 51.6667 μA（固定）<br>IC,candidate = β IB<br>VC,candidate = 10 − IC,candidate × 1 kΩ<br>採用條件：VC > VB = 0.7 V</p><p>β = 180：VC = VB = 0.7 V，BC 零偏，已到前向作用區邊界。β = 200：候選 VCE = −0.333333 V，這是原假設失效，並非實際負電壓工作點。滑桿不求飽和區解。</p><p>另行假設深飽和 VCE ≈ 0.2 V，集極負載估計 IC ≈ (10 − 0.2)/1 kΩ = 9.8 mA；此值不是進入飽和的轉折精確解，也不代表任意基極驅動都能達成。不能把所有飽和狀態固定為 0.2 V。</p>'},
    {id:'eb-divider',short:'04 分壓載入',title:'分壓器會被基極取電流，端電壓會下降。',subtitle:'上圖是原電路；下圖只替換基極前面的分壓網路。',look:'看圖四：47 kΩ 與 10 kΩ 化成 2.105 V 串 8.246 kΩ；射極 1 kΩ 流過 IE = IC + IB。',diagram:circuit('eb-divider-circuit',true)+equivalent,takeaways:take('開路 Vth','2.105263 V')+take('Rth = 47 kΩ ∥ 10 kΩ','8.245614 kΩ'),extra:'<p class="formula-main">Vth = IB Rth + VBE + IE RE<br>IE = (β + 1)IB → 保留基極載入。</p>',detail:'<p>戴維寧等效（Thévenin equivalent）：Vth = 12 × 10/(47 + 10)；Rth = 47 × 10/(47 + 10) kΩ。求 Rth 時把獨立理想電壓源短路，原工作電源仍為 12 V。</p><p class="equation">IB = (Vth − 0.7)/[Rth + (β + 1)RE]<br>VB = Vth − IB Rth<br>IE = (β + 1)IB；IC = β IB</p><p>等效回路仍有集極電流在射極節點匯入，RE 不是只流 IB。把 VB 直接設成開路 Vth 是忽略載入的近似，本課不採用。</p>'},
    {id:'eb-qpoint',short:'05 安靜落點',title:'Q 點同時需要電流與兩端電壓。',subtitle:'β 固定 100；先看節點順序，再看 IC–VCE 工作點。',look:'看圖五：VC = 9.427 V、VB = 1.999 V、VE = 1.299 V；VCE 要相減，得到 8.128 V。',diagram:voltage+qplot('eb-q-fixed'),takeaways:take('IB / IC / IE','12.863 μA / 1.286 / 1.299 mA')+take('Q = (IC, VCE)','(1.286 mA, 8.128 V)'),detail:'<p>靜態工作點（quiescent point, Q point）是無交流輸入時的穩態電流與端電壓。</p><p class="equation">IB = 12.863337 μA<br>IC = 1.28633371 mA；IE = 1.29919705 mA<br>VE = 1.29919705 V；VB = 1.99919705 V<br>VC = 9.42733258 V<br>VCE = VC − VE = 8.12813554 V</p><p>重驗：VB − VE = 0.7 V；VC > VB，BC 反偏。外回路：12 = IC × 2 kΩ + VCE + IE × 1 kΩ。β = 100 時負載線為 VCE = 12 − IC × 3.01 kΩ。圖中延伸截距不保證作用區成立，必須另驗接面。</p>'},
    {id:'eb-beta-stability',short:'06 β 敏感性',title:'讓基極電流一起回應，降低 β 的影響。',subtitle:'只改 β，固定圖四網路；曲線各自以 β = 100 的 IC 歸一化。',look:'看圖六：試 β = 50、100、200。綠線是分壓加 RE，橘線是固定 IB 的比例對照；小圖的 Q 點會跟著移動。',diagram:stability+qplot('eb-q-moving',true),extra:'<p class="diagram-legend"><span class="legend-mint">綠：分壓 + RE 網路</span><span class="legend-amber">橘：固定 IB 的比例規則</span></p>'+control('eb-beta-stable',50,200),takeaways:take('IC','<span id="eb-stable-ic">—</span>')+take('VE / VC','<span id="eb-stable-volts">—</span>')+take('VCE','<span id="eb-stable-vce">—</span>')+take('IC 相對基準','<span id="eb-stable-ratio">—</span>'),detail:'<p>電流增加使 VE = IE RE 上升，減少基極相對射極的有效驅動，形成負回授（negative feedback）。真實 VBE 會微變；固定 0.7 V 模型以回路平衡近似新的工作點。不能宣稱完全消除 β 或溫度影響。</p><p>固定 IB 對照只顯示 IC ∝ β 的歸一化規則，沒有指定或驗證另一條集極負載回路，不能把兩條線當同一電路的絕對電流比較。分壓網路則每次重算 IB 並檢查 VC > VB。</p><p class="equation">β = 50：IC = 1.18596387 mA，VCE = 8.41838910 V<br>β = 100：IC = 1.28633371 mA，VCE = 8.12813554 V<br>β = 200：IC = 1.34317096 mA，VCE = 7.96377128 V</p><p>本圖不提供 VCC 或 RE 調整；不含完整溫度模型、Early 效應或元件功耗設計。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function updateRegion(){const b=Number($('eb-beta-region').value),q=fixed(b);$('eb-beta-region-output').value=String(b);$('eb-region-ic').textContent=`${q.ic.toFixed(3)} mA（候選）`;$('eb-region-state').textContent=q.valid?'前向作用區':b===180?'BC 零偏邊界':'不可用作用區模型';$('eb-candidate-point').style.display=q.valid?'':'none';if(q.valid)$('eb-candidate-point').setAttribute('cx',80+45*q.vc);$('eb-candidate-label').textContent=q.valid?`候選 VC = ${q.vc.toFixed(3)} V`:'此設定不可採用作用區模型';$('eb-beta-region-why').textContent=q.valid?`候選 VC = ${q.vc.toFixed(6)} V > VB = 0.7 V，BC 反偏。`:b===180?'候選 VC = VB = 0.7 V：BC 零偏，前向作用區邊界。':`作用區候選 VCE = ${q.vc.toFixed(6)} V ≤ VB；假設失效，這不是實際電壓。需另用飽和模型重算。`;}
  function updateStable(){const b=Number($('eb-beta-stable').value),q=calc(b);$('eb-beta-stable-output').value=String(b);$('eb-stable-ic').textContent=`${q.ic.toFixed(6)} mA`;$('eb-stable-volts').textContent=`${q.ve.toFixed(3)} / ${q.vc.toFixed(3)} V`;$('eb-stable-vce').textContent=`${q.vce.toFixed(6)} V`;$('eb-stable-ratio').textContent=`${(q.ic/base).toFixed(4)} 倍`;$('eb-stable-dot').setAttribute('cx',bx(b));$('eb-stable-dot').setAttribute('cy',by(q.ic/base));$('eb-fixed-dot').setAttribute('cx',bx(b));$('eb-fixed-dot').setAttribute('cy',by(b/100));$('eb-q-moving-point').setAttribute('cx',75+37*q.vce);$('eb-q-moving-point').setAttribute('cy',335-65*q.ic);$('eb-q-moving-label').setAttribute('x',90+37*q.vce);$('eb-q-moving-label').setAttribute('y',320-65*q.ic);$('eb-beta-stable-why').textContent=`IB = ${(q.ib*1000).toFixed(6)} μA；VB = ${q.vb.toFixed(6)} V。VC > VB 且 VB − VE = 0.7 V，作用區成立；固定 IB 比例為 ${(b/100).toFixed(2)} 倍。`;}
  const updates={'eb-beta-region':updateRegion,'eb-beta-stable':updateStable};
  Object.entries(updates).forEach(([id,fn])=>{$(id).addEventListener('input',fn);fn();});
  document.querySelectorAll('[data-control]').forEach(b=>b.addEventListener('click',()=>{$(b.dataset.control).value=b.dataset.value;updates[b.dataset.control]();}));
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-bjt-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  let lessonIndex=Math.max(0,lessons.findIndex(l=>l.id===saved.lesson));
  let segmentIndex=Math.min(Math.max(0,Number.isInteger(saved.segment)?saved.segment:0),lessons[lessonIndex].segments.length-1);
  let state=saved.state==='checkpoint'?'checkpoint':'idle';
  let voices=[],voiceURI=saved.voice||'',rate=Math.min(1.2,Math.max(.7,Number(saved.rate)||.9));
  let mediaRate=Math.min(2,Math.max(.75,Number(saved.mediaRate)||1));
  let generation=0,audio=null,utterance=null,chunks=[],chunkIndex=0,chunkStarted=false,chunkElapsed=0,chunkLimit=0;
  const courseAudio=$('course-audio');
  const assets=window.CIRCUIT_AUDIO_ASSETS||{segments:{}};
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

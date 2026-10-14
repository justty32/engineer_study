(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden"><defs>'+Object.entries(colors).map(([n,c])=>`<marker id="tr-${n}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('')+'</defs></svg>');
  const line=(a,b,c,d,cls='axis',arrow=false,id='')=>`<line ${id?`id="${id}"`:''} x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${cls}"${arrow?` marker-end="url(#tr-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,cls='',anchor='start',id='')=>`<text ${id?`id="${id}"`:''} x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg=(id,title,body,h=410)=>`<svg viewBox="0 0 600 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;
  const path=(f,x,y,end,n=360)=>Array.from({length:n+1},(_,i)=>{const t=end*i/n;return `${i?'L':'M'}${x(t).toFixed(2)} ${y(f(t)).toFixed(2)}`;}).join(' ');
  const plot=(id,label,end,lo,hi,yticks,xticks,fn,extra='')=>{
    const x=t=>82+453*t/end,y=v=>320-245*(v-lo)/(hi-lo);
    return {x,y,markup:svg(id,label,txt(82,36,label,'muted-text')+yticks.map(v=>line(82,y(v),535,y(v),v===0?'axis':'grid')+txt(68,y(v)+8,v,'tiny-text','end')).join('')+xticks.map(t=>line(x(t),75,x(t),320,'grid')+txt(x(t),355,t,'tiny-text','middle')).join('')+`<path id="${id}-curve" d="${path(fn,x,y,end)}" class="curve"/>`+extra(x,y)+txt(535,398,end===5?'q = t / τ（無因次）':'時間 t（s）','muted-text','end'))};
  };
  const marker=(id,x,y)=>`<circle id="${id}" cx="${x}" cy="${y}" r="6" class="point"/>`;
  const rcfn=(t,v=2)=>10+(v-10)*Math.exp(-t/.1);
  const rcplot=plot('tr-rc-wave','電容電壓 vC（V）',.5,0,10,[0,2,5,10],[0,.1,.3,.5],rcfn,(x,y)=>line(82,y(10),535,y(10),'amber dash')+marker('tr-rc-tau',x(.1),y(rcfn(.1)))+marker('tr-rc-zero',x(0),y(2)));
  const expp=plot('tr-gap-wave','剩餘差距比例 u',5,0,1,[0,.5,1],[0,1,3,5],q=>Math.exp(-q),(x,y)=>line(x(0),y(1),x(1),y(0),'amber dash')+[1,3,5].map(q=>marker(`tr-gap-${q}`,x(q),y(Math.exp(-q)))).join(''));
  const initialplot=plot('tr-initial-wave','電容電壓 vC（V）',.5,0,14,[0,2,10,14],[0,.1,.3,.5],rcfn,(x,y)=>line(82,y(10),535,y(10),'amber dash')+marker('tr-initial-zero',x(0),y(2))+marker('tr-initial-tau',x(.1),y(rcfn(.1))));
  const rlfn=t=>1-Math.exp(-t/.1);
  const rlplot=plot('tr-rl-wave','電感電流 iL（A）',.5,0,1,[0,.5,1],[0,.1,.3,.5],rlfn,(x,y)=>line(82,y(1),535,y(1),'amber dash')+marker('tr-rl-tau',x(.1),y(rlfn(.1))));
  const rcp=plot('tr-res-rc','RC：剩餘差距比例 uRC',.6,0,1,[0,.5,1],[0,.2,.4,.6],t=>Math.exp(-t/.1),()=> '');
  const rlp=plot('tr-res-rl','RL：剩餘差距比例 uRL',.6,0,1,[0,.5,1],[0,.2,.4,.6],t=>Math.exp(-t/.1),()=> '');
  function seriesCircuit(id,inductor=false){
    const component=inductor?'<path d="M475 125c-35 0-35 25 0 25c-35 0-35 25 0 25c-35 0-35 25 0 25c-35 0-35 25 0 25" class="mint"/>':line(440,165,510,165,'mint')+line(440,190,510,190,'mint');
    return svg(id,inductor?'10伏特電源、10歐姆電阻、1亨利電感閉合回路，電流進入電感正端':'切換後10伏特電源、10歐姆電阻、0.01法拉電容閉合回路，電流流入電容正端',`<path d="M110 145V75H230l12-12 12 24 12-24 12 24 12-24 12 24 12-12H475V${inductor?125:165}M475 ${inductor?225:190}V285H110V215" class="wire"/><circle cx="110" cy="180" r="35" class="blue"/>${txt(110,175,'+','blue-fill','middle')}${txt(110,201,'−','blue-fill','middle')}${component}${line(345,43,405,43,'amber',true)}${txt(420,52,'i','amber-fill')}${txt(275,115,'R = 10 Ω','','middle')}${txt(110,255,'10 V','blue-fill','middle')}${txt(420,145,'+','mint-fill')}${txt(420,230,'−','mint-fill')}${txt(375,190,inductor?'vL':'vC','mint-fill')}${txt(475,325,inductor?'L = 1 H':'C = 0.01 F','mint-fill','middle')}${txt(300,365,inductor?'iL(0⁺) = 0 A':'vC(0⁺) = 2 V','muted-text','middle')}`,395);
  }
  function equivalent(id,zero=false){return svg(id,zero?'取下儲能元件，獨立電壓源短路，R1與R2在A與底端之間並聯':'10伏特電源經R1到A，R2和儲能元件分別由A接至底端',`<path d="M85 ${zero?285:145}V75H180l12-12 12 24 12-24 12 24 12-24 12 24 12-12H480V140M480 230V285H85${zero?'':'V215'}M300 75V140M300 230V285" class="wire"/>${zero?'':`<circle cx="85" cy="180" r="35" class="blue"/>${txt(85,175,'+','blue-fill','middle')}${txt(85,201,'−','blue-fill','middle')}`}
      <rect x="282" y="140" width="36" height="90" class="blue"/><circle cx="300" cy="75" r="5" fill="#8db8ff"/><circle cx="300" cy="285" r="5" fill="#8db8ff"/>${zero?'<circle cx="480" cy="140" r="5" class="blue"/><circle cx="480" cy="230" r="5" class="blue"/>':'<rect x="445" y="140" width="70" height="90" rx="8" class="mint"/>'}${txt(220,40,'R1 = 10 Ω','','middle')}${txt(275,120,'A','amber-fill')}${txt(330,185,'R2','blue-fill')}${txt(330,218,'10 Ω','blue-fill')}${txt(85,335,zero?'來源短路':'Vs = 10 V','blue-fill','middle')}${txt(480,195,zero?'已取下':'C / L','mint-fill','middle')}${txt(300,335,'底端：電壓參考點','muted-text')}`,375);}
  const rlcCircuit=svg('tr-rlc-circuit','無外源閉合RLC，電容左、電阻上、電感右；放電電流離開電容正端',`<path d="M110 165V80H230l12-12 12 24 12-24 12 24 12-24 12 24 12-12H470V135M470 235V305H110V195" class="wire"/>${line(75,165,145,165,'mint')}${line(75,195,145,195,'mint')}<path d="M470 135c-35 0-35 25 0 25c-35 0-35 25 0 25c-35 0-35 25 0 25c-35 0-35 25 0 25" class="blue"/>${line(145,43,205,43,'amber',true)}${line(530,155,530,220,'amber',true)}${txt(170,30,'i','amber-fill')}${txt(270,43,'R','','middle')}${txt(75,146,'+','mint-fill')}${txt(75,235,'−','mint-fill')}${txt(175,187,'vC','mint-fill')}${txt(110,345,'C = 0.01 F','mint-fill','middle')}${txt(470,345,'L = 1 H','blue-fill','middle')}${line(205,230,390,230,'mint',true)}${line(390,262,205,262,'blue',true)}${txt(300,210,'電容 ⇄ 電感：儲能交換','muted-text','middle')}${line(285,115,285,155,'amber',true)}${txt(300,180,'R：耗散成熱','amber-fill','middle')}`,380);
  function response(t,r){const a=r/2;if(r===0)return 10*Math.cos(10*t);if(r===20)return 10*(1+10*t)*Math.exp(-10*t);if(r<20){const w=Math.sqrt(100-a*a);return 10*Math.exp(-a*t)*(Math.cos(w*t)+a/w*Math.sin(w*t));}const b=Math.sqrt(a*a-100);return 5*((1+a/b)*Math.exp((-a+b)*t)+(1-a/b)*Math.exp((-a-b)*t));}
  const rootx=a=>330+11.5*a,rooty=w=>185-11.5*w;
  const rootplane=svg('tr-root-plane','固定R為6歐姆，兩個特徵根負3正負j9.539每秒',line(85,185,550,185)+line(330,330,330,45)+line(rootx(-3),rooty(-Math.sqrt(91)),rootx(-3),rooty(Math.sqrt(91)),'grid')+marker('tr-root-positive',rootx(-3),rooty(Math.sqrt(91)))+marker('tr-root-negative',rootx(-3),rooty(-Math.sqrt(91)))+txt(330,30,'虛軸 Im（s⁻¹）','muted-text','middle')+txt(550,235,'實軸 Re（s⁻¹）','muted-text','end')+txt(345,215,'0','tiny-text')+txt(rootx(-3)-5,215,'−3','tiny-text','end')+txt(120,72,'+j9.539','amber-fill')+txt(120,315,'−j9.539','amber-fill')+txt(300,375,'s = −3 ± j9.539 s⁻¹','big-text','middle'),405);
  const rootwave=plot('tr-root-wave','固定 R = 6 Ω：vC（V）',1.5,-12,12,[-10,0,10],[0,.5,1,1.5],t=>response(t,6),(x,y)=>[-1,1].map(sign=>`<path d="${path(t=>sign*100/Math.sqrt(91)*Math.exp(-3*t),x,y,1.5)}" class="envelope"/>`).join(''));
  const damp=plot('tr-damping-wave','目前 R 的電容電壓 vC（V）',1.5,-12,12,[-10,0,10],[0,.5,1,1.5],t=>response(t,6),()=> '');
  const controls=(id,label,min,max,value,buttons,why)=>`<div class="phase-controls"><label for="${id}">${label} <output id="${id}-output">${value}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="1" value="${value}"><div class="preset-controls">${buttons.map(([v,label])=>`<button type="button" data-control="${id}" data-value="${v}">${label}</button>`).join('')}</div><p id="${why}" aria-live="polite"></p></div>`;
  const figures=[
    {id:'tr-rc',short:'01 RC 切換',title:'還差得多，充得就快。',subtitle:'切換後接上 10 V；電容從原本的 2 V 開始，不能瞬間跳高。',look:'看圖一：先沿閉合回路看電流流入電容正端，再看電壓從二伏特靠近十伏特；一個時間常數時約七點零五七伏特。',diagram:seriesCircuit('tr-rc-circuit')+rcplot.markup,takeaways:take('初值 → 終值','2 V → 10 V')+take('τ = RC','0.1 s')+take('一 τ 時的電壓','7.057 V'),extra:'<p class="formula-main">斜率 = 剩餘電壓差距 ÷ RC<br>dvC/dt = (10 − vC) / 0.1</p>',detail:'<p>有限電流下，電容電壓連續；但電流可以在切換時從原值跳到 0.8 A，不能泛稱所有量都連續。圖中只畫電容電壓，沒有電流曲線。</p><p class="equation">i = (10 − vC)/10 = C dvC/dt<br>vC(t) = 10 − 8e^(−t/0.1) V<br>i(t) = 0.8e^(−t/0.1) A<br>初斜率 = 80 V/s</p><p>一個時間常數走完初值到終值差距的 63.2%，此例是 8 V 的 63.2%，不是 10 V 的 63.2%。示波器量電容兩端電壓可觀察起點與逐漸變平的形狀。</p>'},
    {id:'tr-exponential',short:'02 剩餘差距',title:'每過一個 τ，剩下的再乘 0.368。',subtitle:'這不是原電壓：u 是剩餘差距比例，q 是經過幾個時間常數。',look:'看圖二：綠線是剩餘差距，不是電壓；橘色起始切線在一個時間常數處碰到橫軸，綠線卻還剩百分之三十六點八。',diagram:expp.markup,takeaways:take('q = 1 / 3 / 5','u ≈ .3679 / .0498 / .00674')+take('RC 原差距 8 V','一 τ 剩 2.943 V'),extra:'<p class="formula-main">差距越小，縮小的速度也越慢。<br>u = e⁻ᑫ；du/dq = −u</p>',detail:'<p>取 d = vC − 10，則 d′ = −d/τ。試代入 d = Ke^(−t/τ)，微分正好只乘 −1/τ，所以滿足方程；初值給 K = −8 V。把剩餘差距除以原始差距，再令 q = t/τ，就得到圖中的 u = e^(−q)。</p><p class="equation">x(t) = x∞ + (x₀ − x∞)e^(−t/τ)<br>固定終值 + 同時存在的自然衰減</p><p>起始切線 u = 1 − q 是局部線性近似；實際曲線不會在 q = 1 歸零。分離變數可得 dd/d = −dt/τ，積分為 ln|d| = −t/τ + 常數。d = 0 則另外直接得到全程零差距。</p>'},
    {id:'tr-initial',short:'03 改初值',title:'同一條規則，也可以向下靠近。',subtitle:'只改電容原先電壓；10 V 電源、10 Ω 電阻與 0.01 F 電容都固定。',look:'看圖三：試按十四伏特，曲線改成從上方靠近十伏特；再按十伏特，全程就是一條水平線。',diagram:initialplot.markup,extra:controls('tr-initial-voltage','初始電壓 V₀（V）',0,14,2,[[2,'2 V'],[10,'10 V'],[14,'14 V'],[2,'重設 2 V']],'tr-initial-why'),takeaways:take('初值 → 終值','<span id="tr-initial-values">2 V → 10 V</span>')+take('時間常數保持不變','τ = 0.1 s')+take('一 τ 時的電壓','<span id="tr-initial-one">7.057 V</span>'),detail:'<p>一樣的時間常數，不代表一樣的起點或方向。V₀ &lt; 10 V 時充電；V₀ &gt; 10 V 時電容經電阻向理想電源送回能量；V₀ = 10 V 時沒有初終差距，故沒有暫態變化。</p><p class="equation">vC(t) = 10 + (V₀ − 10)e^(−t/0.1)<br>i(0⁺) = (10 − V₀)/10 A</p><p>橘色虛線始終是 10 V 終值。此滑桿不改圖一的固定案例；黃色兩點標出初值與一個時間常數。</p>'},
    {id:'tr-rl',short:'04 換成 RL',title:'電感不讓電流瞬間跳變。',subtitle:'有限電壓下，電感電流連續；改變電流需要時間。',look:'看圖四：沿回路看電流進入電感正端，再看電流從零安培靠近一安培；一個時間常數約零點六三二安培。',diagram:seriesCircuit('tr-rl-circuit',true)+rlplot.markup,takeaways:take('初值 → 終值','0 A → 1 A')+take('τ = L/R','0.1 s')+take('一 τ 時的電流','0.632 A'),extra:'<p class="formula-main">L diL/dt = 10 − RiL<br>還沒被電阻分走的電壓，推動電流改變。</p>',detail:'<p>電感極性採電流流入正端：vL = L diL/dt。開始時電流為零，電阻壓降為零，10 V 都在電感上，初始電流斜率為 10 A/s。終態電流不再變，理想電感電壓為零，電流為 10/10 = 1 A。</p><p class="equation">iL(t) = 1 − e^(−t/0.1) A<br>vL(t) = 10e^(−t/0.1) V</p><p>圖中只有電流曲線；電感電壓可立即改變，而不是和電流一樣必須連續。量電流波形需要電流探棒或適當的電流感測方法。本圖固定 R = 10 Ω，圖五操作不會改本圖。</p>'},
    {id:'tr-r-effect',short:'05 電阻與速度',title:'R 加大：RC 變慢，RL 卻變快。',subtitle:'兩張都只看「原始差距還剩幾成」，且採相同時間軸；不是電壓與電流大小。',look:'看圖五：把電阻從十改成二十歐姆，上面 RC 的差距消失得更慢，下面 RL 更快；但 RL 最後的電流也降為零點五安培。',diagram:rcp.markup+rlp.markup,extra:controls('tr-resistance-first','電阻 R（Ω）',5,20,10,[[5,'5 Ω'],[10,'10 Ω'],[20,'20 Ω'],[10,'重設 10 Ω']],'tr-first-why'),takeaways:take('RC 時間常數','<span id="tr-rc-tau-value">0.100 s</span>')+take('RL 時間常數','<span id="tr-rl-tau-value">0.100 s</span>')+take('RL 終值 10/R','<span id="tr-rl-final">1.000 A</span>'),detail:'<p>固定電源 10 V、電容 0.01 F、電感 1 H，RC 初始電壓 2 V，RL 初始電流零。兩張圖的起點都是一，因為各自除以自己的原始差距。這不代表實際電壓與電流具有相同單位或大小。</p><p class="equation">uRC = e^[−t/(R C)]；τRC = RC<br>uRL = e^[−t/(L/R)]；τRL = L/R<br>iL(∞) = 10/R A</p><p>RC 的較大電阻限制充放電流，所以靠近終值較慢；RL 的較大電阻使偏離終態的電流更快衰減，同時固定電壓下的終態電流較小。此操作不改圖四與圖六。</p>'},
    {id:'tr-equivalent',short:'06 看入等效',title:'先找終值，再把來源設零求電阻。',subtitle:'上圖保留來源找 Vth；下圖取下儲能元件並短路獨立電壓源，才求 Rth。',look:'看圖六：上圖看節點 A 的開路電壓五伏特；下圖沿短路導線追，兩顆十歐姆電阻都接在 A 與底端之間，所以等效五歐姆。',diagram:'<p class="diagram-caption">原網路：儲能元件接在 A 與底端；求開路 Vth 時先取下。</p>'+equivalent('tr-equivalent-original')+'<p class="diagram-caption">求 Rth：儲能元件已取下，獨立電壓源用導線短路。</p>'+equivalent('tr-equivalent-zero',true),takeaways:take('Vth / Rth','5 V / 5 Ω')+take('接 C = 0.01 F','τ = 0.05 s；終值 5 V')+take('接 L = 1 H','τ = 0.2 s；終值 1 A'),extra:'<p class="formula-main">找初值 → 保留來源求終值 → 來源設零求 Rth → 算 τ。<br>兩張圖是固定示意，沒有波形或切換控制。</p>',detail:'<p>戴維寧等效（Thévenin equivalent）把線性端口表示成一個等效電壓源串聯等效電阻。Vth 是取下儲能元件後的端口開路電壓；Rth 是將獨立電壓源設零並以短路取代後，從端口看入的電阻。</p><p class="equation">Vth = 10 × 10/(10 + 10) = 5 V<br>Rth = 10 ∥ 10 = 5 Ω<br>C：vC = 5 − 3e^(−t/0.05) V<br>一 τ 時 3.896 V（初值 2 V）<br>L：iL = 1 − e^(−t/0.2) A<br>一 τ 時 0.632 A（初值 0 A）</p><p>R1 與 R2 在來源短路後才從端口看來並聯，不是隨便相加為 20 Ω。來源設零僅用於求 Rth，不能拿無源電路求原本的終值。相依源不可任意關掉，一般需測試源，本課不展開。底端只是電壓參考點，不必真的接大地。</p>'},
    {id:'tr-rlc-loop',short:'07 儲能交換',title:'沒有外源，還能振盪：能量早已存好。',subtitle:'初始電容 10 V、電感電流 0 A；放電電流離開電容正端。',look:'看圖七：電容在左、電阻在上、電感在右，整圈沒有外部電源。放電箭頭離開電容正端，電容與電感交換能量，電阻持續耗散。',diagram:rlcCircuit,takeaways:take('初始 vC / i','10 V / 0 A')+take('初始總儲能','0.5 J')+take('無外源','能量只交換或耗散'),extra:'<p class="formula-main">i = −C vC′；L i′ + Ri = vC<br>電流離開電容正端，所以電容式有負號。</p>',detail:'<p>電容的被動電流應流入正端；本圖特別把放電電流定義為離開正端，故 i = −C vC′。沿 R、L 的電壓降相加等於電容電壓。</p><p class="equation">vC″ + (R/L)vC′ + vC/(LC) = 0<br>vC(0) = 10 V；vC′(0) = 0<br>E = (CvC² + Li²)/2<br>dE/dt = −Ri²</p><p>圖中交換箭頭表示可能的能量流向，沒有假設電容、電感在每一刻儲能相等。R = 0 時總能量保持 0.5 J；R &gt; 0 時耗散成熱。這裡全是時域瞬時量，不用 RMS 或正弦穩態相量取代切換分析。</p>'},
    {id:'tr-roots',short:'08 複數根',title:'實部讓它縮小，虛部讓它轉動。',subtitle:'本圖固定 R = 6 Ω。兩個共軛根配對後，得到真實的衰減電壓。',look:'看圖八：上方兩個根的實部都是負三，虛部一正一負；下方綠色真實電壓在橘色衰減包絡內振盪。圖八固定六歐姆，不隨圖九滑桿改變。',diagram:rootplane+rootwave.markup,extra:'<p class="formula-main">e⁻³ᵗ 縮小 × [A cos(ωdt) + B sin(ωdt)] 轉動<br>A = 10，B ≈ 3.145；ωd ≈ 9.539 rad/s<br>橘色包絡：±10.4828e⁻³ᵗ V</p>',takeaways:take('初值與初斜率','10 V；0 V/s')+take('第一個負極值','約 0.329 s，−3.723 V')+take('振盪週期','約 0.659 s'),detail:'<p>試解 v = Ae^(st)，微分各乘 s，把微分方程變成特徵方程 s² + (R/L)s + 1/(LC) = 0。R = 6 Ω 時，s = −3 ± j√91。兩個虛部的正負不是兩個不同振盪頻率。</p><p class="equation">e^[(−α+jωd)t]<br>= e^(−αt)[cos(ωdt)+j sin(ωdt)]<br>vC = 10e^(−3t)[cos(√91 t)<br>+ (3/√91)sin(√91 t)] V</p><p>共軛根與配對係數使虛部相消，留下真實電壓。初始電壓給 A = 10；初斜率零給 B = 30/√91。不能只留 10e^(−3t)cos(ωdt)，那會把初斜率錯改成 −30 V/s。</p><p>幅度包絡是 ±√(A²+B²)e^(−3t) = ±(100/√91)e^(−3t)，不是 ±10e^(−3t)。ωd 是自然響應的阻尼振盪角頻率，不等於受迫共振頻率。</p>'},
    {id:'tr-damping',short:'09 阻尼實驗',title:'阻尼太大，也會拖慢最後一段。',subtitle:'只改這張圖的 R；電容、電感與初值固定。觀察穿零與後段衰減。',look:'看圖九：依序試零、六、二十、四十歐姆；四十歐姆雖不振盪，後段卻被慢根拖住。',diagram:damp.markup,extra:controls('tr-resistance','電阻 R（Ω）',0,40,6,[[0,'0 Ω'],[6,'6 Ω'],[20,'20 Ω'],[40,'40 Ω'],[6,'重設 6 Ω']],'tr-damping-why'),takeaways:take('阻尼係數 α','<span id="tr-alpha">3 s⁻¹</span>')+take('特徵根 s（s⁻¹）','<span id="tr-roots-value">−3 ± j9.539</span>')+take('響應型態','<span id="tr-kind">欠阻尼</span>')+take('vC(0.3 s)','<span id="tr-at-three">—</span>'),detail:'<p>固定 L = 1 H、C = 0.01 F、vC(0) = 10 V、i(0) = 0 A。ω₀ = 1/√(LC) = 10 rad/s，α = R/(2L)。滑桿只更新圖九；圖八始終是六歐姆案例。</p><p class="equation">s = −α ± √(α² − 100)<br>R = 0：vC = 10cos(10t)<br>R = 20：vC = 10(1+10t)e^(−10t)<br>R &gt; 20：β = √(α² − 100)<br>vC = 5[(1+α/β)e^[(−α+β)t]<br>+ (1−α/β)e^[(−α−β)t]]</p><p>重根需要 (A+Bt)e^(−αt) 才有兩個獨立解；不能把兩個一樣的指數當成獨立解。R = 40 Ω 時根約 −2.679 與 −37.321，後段由接近零的慢根控制。</p><p>對本例固定初值，臨界阻尼是不反轉又快速趨零的分界；欠阻尼可以更早穿零。不可泛稱臨界在所有意義下最快，或任意初始條件的實根響應都不越零。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function updateInitial(){const v=Number($('tr-initial-voltage').value);$('tr-initial-voltage-output').value=`${v} V`;$('tr-initial-wave-curve').setAttribute('d',path(t=>rcfn(t,v),initialplot.x,initialplot.y,.5));$('tr-initial-zero').setAttribute('cy',initialplot.y(v));$('tr-initial-tau').setAttribute('cy',initialplot.y(rcfn(.1,v)));$('tr-initial-values').textContent=`${v} V → 10 V`;$('tr-initial-one').textContent=`${rcfn(.1,v).toFixed(3)} V`;$('tr-initial-why').textContent=v<10?'充電：初值低於電源，電壓向上靠近 10 V；時間常數仍是 0.1 s。':v===10?'沒有初終差距：電壓全程為 10 V，沒有暫態變化；RC 仍是 0.1 s。':'放電：初值高於電源，電壓向下靠近 10 V；時間常數仍是 0.1 s。';}
  function updateFirst(){const r=Number($('tr-resistance-first').value),tc=r*.01,tl=1/r;$('tr-resistance-first-output').value=`${r} Ω`;$('tr-res-rc-curve').setAttribute('d',path(t=>Math.exp(-t/tc),rcp.x,rcp.y,.6));$('tr-res-rl-curve').setAttribute('d',path(t=>Math.exp(-t/tl),rlp.x,rlp.y,.6));$('tr-rc-tau-value').textContent=`${tc.toFixed(3)} s`;$('tr-rl-tau-value').textContent=`${tl.toFixed(3)} s`;$('tr-rl-final').textContent=`${(10/r).toFixed(3)} A`;$('tr-first-why').textContent=r===10?'R = 10 Ω 時兩種時間常數都是 0.1 s；圖是各自歸一化差距，不是同一個電壓或電流。':r>10?'相對 10 Ω：RC 差距衰減更慢，RL 差距衰減更快；RL 最後電流也變小。':'相對 10 Ω：RC 差距衰減更快，RL 差距衰減更慢；RL 最後電流也變大。';}
  function updateDamping(){const r=Number($('tr-resistance').value),a=r/2;let roots,kind,why;if(r===0){roots='±j10';kind='無阻尼';why='沒有電阻耗散，儲能保持不變，電壓持續振盪。';}else if(r<20){roots=`−${a} ± j${Math.sqrt(100-a*a).toFixed(3)}`;kind='欠阻尼';why='共軛複根：負實部讓振幅衰減，虛部產生振盪；能量在電容與電感間交換。';}else if(r===20){roots='−10（重根）';kind='臨界阻尼';why='兩根合併，需要 (A+Bt)e^(−10t)；本例在不反轉與振盪之間的分界。';}else{const b=Math.sqrt(a*a-100);roots=`${(-a+b).toFixed(3)}、${(-a-b).toFixed(3)}`;kind='過阻尼';why='兩個不同實根：接近零的慢根拖住後段；本例比臨界阻尼更慢靠近零。';}$('tr-resistance-output').value=`${r} Ω`;$('tr-alpha').textContent=`${a} s⁻¹`;$('tr-roots-value').textContent=roots;$('tr-kind').textContent=kind;$('tr-at-three').textContent=`${response(.3,r).toFixed(3)} V`;$('tr-damping-why').textContent=why;$('tr-damping-wave-curve').setAttribute('d',path(t=>response(t,r),damp.x,damp.y,1.5));}
  const updates={'tr-initial-voltage':updateInitial,'tr-resistance-first':updateFirst,'tr-resistance':updateDamping};
  Object.entries(updates).forEach(([id,fn])=>{$(id).addEventListener('input',fn);fn();});
  document.querySelectorAll('[data-control]').forEach(b=>b.addEventListener('click',()=>{$(b.dataset.control).value=b.dataset.value;updates[b.dataset.control]();}));
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='circuit-audio-transient-v1';
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

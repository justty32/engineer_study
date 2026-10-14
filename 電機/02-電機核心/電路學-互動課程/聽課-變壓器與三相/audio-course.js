(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  const defs='<defs>'+Object.entries(colors).map(([name,color])=>`<marker id="xfm-${name}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')+'</defs>';
  document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">${defs}</svg>`);
  const line=(x1,y1,x2,y2,cls='axis',arrow=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${arrow?` marker-end="url(#xfm-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,text,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${text}</text>`;
  const svg=(id,title,body,height=440)=>`<svg viewBox="0 0 600 ${height}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,value)=>`<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="6" class="node"/>`;
  const coil=(x,y,side)=>`<path d="M${x} ${y}${Array.from({length:5},()=>`q${side*27} 18 0 36`).join('')}" class="blue"/>`;
  const source=(x,y)=>`<circle cx="${x}" cy="${y}" r="32" class="blue"/><path d="M${x-21} ${y}q10 -24 21 0t21 0" class="amber"/>`;
  const flux=`<path d="M75 208V100H245V150M245 330V390H75V272M350 150V100H525V180M525 300V390H350V330" class="wire"/>${source(75,240)}${coil(245,150,-1)}${coil(350,150,1)}<rect x="502" y="180" width="46" height="120" rx="5" class="amber"/>${dot(230,137)}${dot(365,137)}${line(120,100,190,100,'mint',true)}${line(395,100,465,100,'amber',true)}${txt(155,76,'I₁ →','mint-fill','middle')}${txt(430,76,'I₂ →','amber-fill','middle')}${txt(190,170,'+','blue-fill')}${txt(185,250,'V₁','blue-fill')}${txt(190,333,'−','blue-fill')}${txt(395,170,'+','blue-fill')}${txt(395,250,'V₂','blue-fill')}${txt(395,333,'−','blue-fill')}${txt(525,164,'8 Ω','amber-fill','middle')}${txt(120,440,'N₁ = 1000','blue-fill','middle')}${txt(452,440,'N₂ = 100','blue-fill','middle')}<path d="M284 320V190Q297 165 310 190V320Q297 345 284 320" class="mint dash"/>${line(284,275,284,220,'mint',true)}${txt(297,370,'Φ','mint-fill','middle')}${txt(300,490,'同一磁通，每匝同電壓','big-text','middle')}`;
  const power=[{y:120,left:'220 V',right:'22 V',label:'電壓 ÷10',color:'blue'},{y:245,left:'0.275 A',right:'2.75 A',label:'電流 ×10',color:'amber'},{y:370,left:'60.5 W',right:'60.5 W',label:'功率不變',color:'mint'}].map(r=>txt(115,r.y,r.left,r.color+'-fill','middle')+line(225,r.y-10,375,r.y-10,r.color,true)+txt(300,r.y-34,r.label,'tiny-text','middle')+txt(485,r.y,r.right,r.color+'-fill','middle')).join('')+txt(115,44,'一次側','','middle')+txt(485,44,'二次側','','middle')+txt(300,445,'n = N₁ / N₂ = 10','big-text','middle')+dot(192,500)+dot(392,500)+line(110,500,180,500,'mint',true)+line(405,500,475,500,'amber',true)+txt(150,540,'I₁ 入點','mint-fill','middle')+txt(430,540,'I₂ 出點','amber-fill','middle');
  const impedance=`<rect x="38" y="62" width="524" height="105" rx="18" class="blue"/>${txt(300,104,'從一次側看進去','blue-fill','middle')}${txt(300,146,'220 V ÷ 0.275 A = 800 Ω','big-text','middle')}${line(300,257,300,180,'mint',true)}${txt(300,294,'電壓 ×10；電流 ÷10','','middle')}${txt(300,338,'阻抗 ×100','big-text','middle')}<rect x="38" y="377" width="524" height="105" rx="18" class="amber"/>${txt(300,419,'二次側實際負載','amber-fill','middle')}${txt(300,461,'22 V ÷ 2.75 A = 8 Ω','big-text','middle')}`;
  const phaseCenter={x:300,y:220},phaseR=140;
  const phaseVectors=[{angle:0,label:'a：0°',c:'mint',lx:453,ly:204},{angle:-120,label:'b：−120°',c:'amber',lx:122,ly:381},{angle:120,label:'c：+120°',c:'blue',lx:122,ly:61}];
  const phases=line(95,220,495,220)+line(300,390,300,50)+phaseVectors.map(o=>{const a=o.angle*Math.PI/180;return line(300,220,300+phaseR*Math.cos(a),220-phaseR*Math.sin(a),o.c,true)+txt(o.lx,o.ly,o.label,o.c+'-fill',o.angle===0?'start':'middle');}).join('')+txt(300,435,'三支箭頭等長：120 V 有效值','','middle');
  const wx=t=>160+t/16.666666667*384,wy=v=>240-v*.82;
  const waves=[-120*Math.SQRT2,0,120*Math.SQRT2].map((v,i)=>line(160,wy(v),544,wy(v),'grid')+txt(150,wy(v)+7,['−120√2','0','+120√2'][i],'tiny-text','end')).join('')+[0,8.333333333,16.666666667].map((t,i)=>line(wx(t),89,wx(t),392,'grid')+txt(wx(t),425,['0','8.33','16.67'][i],'tiny-text','middle')).join('')+phaseVectors.map(o=>`<path class="${o.c}" d="${Array.from({length:361},(_,i)=>{const t=i/360*16.666666667;return `${i?'L':'M'}${wx(t).toFixed(2)} ${wy(120*Math.SQRT2*Math.cos(2*Math.PI*60*t/1000+o.angle*Math.PI/180)).toFixed(2)}`;}).join(' ')}"/>`).join('')+txt(160,42,'瞬時電壓（V）','muted-text')+txt(544,468,'時間（ms）','muted-text','end')+txt(300,512,'一週期 16.67 ms；峰值約 169.7 V','','middle');
  // 1 V = 1.8 viewBox units on both axes. Vab = Van + (−Vbn).
  const ox=150,oy=350,scale=1.8,ax=ox+120*scale,bx=ox-60*scale,by=oy+60*Math.sqrt(3)*scale,rx=ox+180*scale,ry=oy-60*Math.sqrt(3)*scale;
  const difference=line(20,oy,565,oy)+line(ox,565,ox,95)+line(ox,oy,ax,oy,'mint',true)+line(ox,oy,bx,by,'blue',true)+line(ax,oy,rx,ry,'blue dash',true)+line(ox,oy,rx,ry,'amber',true)+line(ox,ry,rx,ry,'grid')+line(rx,ry,rx,oy,'grid')+txt(250,390,'Vₐₙ = 120','mint-fill','middle')+txt(30,575,'Vᵦₙ','blue-fill')+txt(456,280,'−Vᵦₙ','blue-fill')+txt(300,123,'Vₐᵦ = 120√3','amber-fill','middle')+txt(305,448,'實部 180','muted-text','middle')+txt(480,220,'60√3','muted-text')+txt(240,332,'30°','amber-fill')+txt(570,390,'Re','muted-text','end')+txt(150,70,'Im','muted-text','middle');
  const yCircuit=[{y:110,p:'a',angle:'0°',c:'mint'},{y:260,p:'b',angle:'−120°',c:'amber'},{y:410,p:'c',angle:'+120°',c:'blue'}].map(r=>`<path d="M55 ${r.y}H108M172 ${r.y}H350M450 ${r.y}H545" class="wire"/>${source(140,r.y)}${txt(108,r.y-43,'−','blue-fill','middle')}${txt(172,r.y-43,'+','blue-fill','middle')}<rect x="350" y="${r.y-27}" width="100" height="54" rx="6" class="${r.c}"/>${line(225,r.y,300,r.y,r.c,true)}${txt(250,r.y-24,'I'+r.p,r.c+'-fill','middle')}${txt(330,r.y-22,r.p,r.c+'-fill','middle')}${txt(140,r.y+59,'120∠'+r.angle+' V','tiny-text','middle')}${txt(400,r.y+63,'768 W',r.c+'-fill','middle')}${txt(400,r.y+8,'Z','','middle')}${dot(55,r.y)}${dot(545,r.y)}`).join('')+`<path d="M55 110V510H545V110" class="wire"/>`+txt(300,552,'n：源與負載中性點相連','','middle')+txt(300,598,'每支 Z = 12 + j9 Ω','','middle');
  const delta=`<path d="M300 95L120 350H480Z" class="wire"/>${dot(300,95)}${dot(120,350)}${dot(480,350)}${line(300,25,300,80,'mint',true)}${line(240,145,190,216,'amber',true)}${line(200,380,340,380,'amber',true)}${line(452,270,400,196,'amber',true)}${txt(335,60,'Iₐ','mint-fill')}${txt(300,128,'a','','middle')}${txt(85,354,'b','','middle')}${txt(515,354,'c','','middle')}${txt(155,178,'Iab','amber-fill','middle')}${txt(270,418,'Ibc','amber-fill','middle')}${txt(465,192,'Ica','amber-fill','middle')}<rect x="155" y="241" width="50" height="44" rx="5" class="label-bg"/>${txt(180,271,'Z','','middle')}<rect x="276" y="325" width="48" height="49" rx="5" class="label-bg"/>${txt(300,357,'Z','','middle')}<rect x="395" y="241" width="50" height="44" rx="5" class="label-bg"/>${txt(420,271,'Z','','middle')}${txt(300,475,'Δ：Iₐ = Iab − Ica','big-text','middle')}`;
  const figures=[
    {id:'xfm-flux',short:'01 磁通與點標',title:'同一磁通，每匝同電壓。',subtitle:'一次與二次是兩個獨立閉合回路；靠共同磁通耦合。',look:'看圖一：兩個回路沒有接在一起。一次電流流入上端點，二次電流從上端點流出。',diagram:svg('xfm-flux-svg','一次交流源與線圈閉合；二次線圈與8歐姆負載閉合；上端點標、電壓正負、一次入點二次出點及共同磁通方向',flux,525),takeaways:take('兩側正電壓都從點端量','V₁ = nV₂')+take('本圖電流參考方向','I₂ = nI₁'),main:'<p>點端同時為正。電流箭頭是<strong>參考方向</strong>，交流瞬時電流仍會反轉。</p><p>理想模型：無漏磁、無損，忽略激磁電流。穩定直流不適用。</p>',question:'若把二次電流也改成「流入點端」，公式會怎樣？',answer:'二次電流的正方向反轉；此時才寫 N₁I₁ + N₂I₂ = 0。不可把這個負號關係與圖上的出點方向混用。',detail:'<p>同一磁通 Φ 連結兩組線圈，每匝感應電壓相同，因此 V₁/N₁ = V₂/N₂。點標記錄兩側繞組的相對極性，不是永久的直流正端。</p><p class="equation">n = N₁/N₂ = 1000/100 = 10<br>V₁ = nV₂；I₂ = nI₁</p><p>真實變壓器需要激磁電流建立磁通，還有銅損、鐵損與漏磁。本課把這些效應理想化；「忽略激磁電流」不代表「沒有磁通」。</p>'},
    {id:'xfm-power',short:'02 能量守恆',title:'電壓降十倍，電流可增十倍。',subtitle:'負載決定實際電流；變壓器不會免費放大功率。',look:'看圖二：電壓二百二十變二十二，電流零點二七五變二點七五；兩側仍各是六十點五瓦。',diagram:svg('xfm-power-svg','分別比較電壓220至22伏、電流0.275至2.75安培、功率60.5至60.5瓦，匝比10，一次入點二次出點',power,575),takeaways:take('由二次 8 Ω 負載求電流','I₂ = 22 / 8 = 2.75 A')+take('再換回一次側','I₁ = 2.75 / 10 = 0.275 A'),main:'<p>三列各有自己的單位，箭頭表示由來源到負載的關係；<strong>不是共用縱軸的大小圖</strong>。</p>',question:'降壓後電流增加，為什麼不是能量增加？',answer:'電壓與電流以互反比例改變；本例為純電阻，兩側 VI 都是 60.5 W。能量來自一次電源，二次負載拉多少功率，一次就供應多少。',detail:'<p class="equation">V₂ = 220 / 10 = 22 V<br>I₂ = V₂ / R = 22 / 8 = 2.75 A<br>I₁ = I₂ / 10 = 0.275 A<br>P入 = 220 × 0.275 = 60.5 W<br>P出 = 22 × 2.75 = 60.5 W</p><p>本例電壓與電流同相，所以 VI 就是實功率。若是複數負載，應以有效值複功率 VI* 描述兩側的能量關係，不能一律把幅值相乘叫做瓦數。</p>'},
    {id:'xfm-impedance',short:'03 反映阻抗',title:'負載沒有變，入口看起來變了。',subtitle:'二次仍是 8 Ω；一次電源所見是 800 Ω。',look:'看圖三：比較兩邊電壓除以電流。一次的電壓乘十、電流除十，阻抗因此乘上一百。',diagram:svg('xfm-impedance-svg','一次220伏除0.275安培為800歐姆，二次22伏除2.75安培為8歐姆，電壓電流互反比造成阻抗平方比例',impedance,520),takeaways:take('反映到一次側','Z入 = n² Z負載')+take('比例乘整個複數','實部與虛部都 ×100'),main:'<p class="equation">Z入 = V₁/I₁ = (nV₂)/(I₂/n)<br>= n²(V₂/I₂) = n²Z負載</p><p>除以「除十」等於再乘十。<strong>兩個十</strong>來自電壓與電流，不是多繞一次線圈。</p>',question:'若負載有虛部，反映後的相角會改變嗎？',answer:'理想模型中不會。n² 是正實數，將複數阻抗的實部、虛部一起放大，方向保持不變；並非只把電阻部分乘平方。',detail:'<p class="equation">Z負載 = R + jX<br>Z入 = n²R + jn²X<br>arg Z入 = arg Z負載</p><p>「看入阻抗」是從指定端口用電壓除以流入電流定義的量。換到二次側看，或反轉匝比定義，都必須重新確認自己站在哪一側。本圖箭頭由下方二次側指向上方一次側，表示把二次負載反映到一次入口：電壓乘十、電流除十，因此阻抗乘一百。</p>'},
    {id:'xfm-phases',short:'04 三相錯開',title:'三支等長箭頭，錯開一百二十度。',subtitle:'abc 正相序；時間慣例 cos(ωt + φ)。相量採有效值，波形顯示瞬時值。',look:'看圖四：先看三支等長箭頭，再看三條波形。箭頭長一百二十伏，波形峰值要乘根號二。',diagram:svg('xfm-phasors-svg','a零度向右、b負120度向左下、c正120度向左上，三相有效值皆120伏',phases,470)+svg('xfm-waves-svg','60赫茲三相電壓一週期波形，橫軸0至16.67毫秒，縱軸峰值正負120乘根號二伏',waves,545),extra:'<div class="diagram-legend"><span class="legend-mint">綠：a 相，0°</span><span class="legend-amber">橘：b 相，−120°</span><span class="legend-blue">藍：c 相，+120°</span></div>',takeaways:take('相量：相對中性點 n','Vₐₙ、Vᵦₙ、V꜀ₙ')+take('瞬時波形峰值','120√2 ≈ 169.7 V'),main:'<p>隨時間往前，峰值依 <strong>a → b → c</strong> 出現，再輪回 a；負角的 b 相較晚到達峰值。</p>',question:'圖上的 120 V 可以直接當波形最高點嗎？',answer:'不可以。120 V 是正弦有效值；瞬時波形最高為 120√2 V，最低為 −120√2 V。相量運算全程使用有效值。',detail:'<p class="equation">Vₐₙ = 120∠0° V<br>Vᵦₙ = 120∠−120° V<br>V꜀ₙ = 120∠120° V<br>vₐₙ(t) = 120√2 cos(120πt) V<br>vᵦₙ(t) = 120√2 cos(120πt − 120°) V<br>v꜀ₙ(t) = 120√2 cos(120πt + 120°) V</p><p>t 以秒代入；圖的時間軸則用毫秒。平衡正弦三相在每個時刻的三個相電壓相加為零。換相序會改變線電壓的相角方向，本課始終固定 abc。</p>'},
    {id:'xfm-difference',short:'05 線電壓相減',title:'減去一支箭頭，就是加上反向箭頭。',subtitle:'Vab = Va − Vb：從 b 到 a 的電位差。兩軸同尺度，1 V 對應相同長度。',look:'看圖五：綠箭頭走到 a 相終點，再接上反向的 b 相虛線。橘色合成箭頭長根號三倍，角度正三十度。',diagram:svg('xfm-difference-svg','同尺度向量，Van向右120伏，Vbn左下；負Vbn平移到Van終點，合成Vab實180虛60根號三，長120根號三，正30度',difference,615),takeaways:take('Vab 的直角式','180 + j60√3 V')+take('Vab 的極式','207.846∠30° V'),main:'<p class="equation">Vᵦₙ = −60 − j60√3<br>Vab = 120 − (−60 − j60√3)<br>= 180 + j60√3 V</p><p>實部、虛部<strong>分開相減</strong>；不是兩個長度做 120 − 120。</p><p class="equation">除以 120：3/2 + j√3/2<br>長度 = √[(3/2)² + (√3/2)²] = √3<br>角度 = arctan[(√3/2)/(3/2)] = 30°</p>',question:'為什麼線電壓不是 120 − 120 = 0？',answer:'兩個 120 只記錄長度，漏掉了相角。相減要連方向一起算；b 相的實部、虛部都為負，減掉之後得到向右上方的線電壓。',detail:'<p>Vab 定義為 a 的電位減 b 的電位，等於 Vₐₙ − Vᵦₙ。圖中橘線是這個相量差，不能把它當作實體電線方向。−Vᵦₙ 的長度仍是 120 V，只是方向反轉，平移不改變向量。</p><p>+30° 依賴本課 abc 正相序與 Vab 定義；若改成 Vba，整支向量反向。換相序也要重算，不能背成所有情況都「超前三十度」。</p>'},
    {id:'xfm-threepower',short:'06 三相功率',title:'先算一相，再把三相加起來。',subtitle:'上圖是固定 Y 接算例；下圖 Δ 僅比較接線與電流方向。',look:'看圖六：上方每相七百六十八瓦，三相合計二千三百零四瓦。功率因數角要拿同一支路的電壓與電流比。',diagram:svg('xfm-y-svg','三個交流相源與三個Y接負載，每支有完整回路、共用連接的中性線n；每相768瓦',yCircuit,640)+svg('xfm-delta-svg','三角形Δ負載，a到b的Iab、b到c的Ibc、c到a的Ica；Ia流入節點a，Ia等於Iab減Ica',delta,510),takeaways:take('Y：線電流 = 相電流','8 A')+take('Y：線電壓 = √3 相電壓','207.846 V')+take('三相實功 P','2304 W')+take('功率因數角','Van 與 Ia：36.87°'),main:'<p class="equation">Iₐ = 120/(12 + j9)<br>= 6.4 − j4.8 = 8∠−36.87° A</p><p><strong>Y：V線 = √3 V相，I線 = I相。</strong><br>Δ：V線 = V相，平衡時 |I線| = √3 |I支路|。</p><p class="equation">P總 = 3 V相 I相 cos θ<br>= √3 V線 I線 cos θ = 2304 W</p><p>θ 是<strong>同一負載支路</strong>電壓與電流夾角 36.87°；Vab 與 Ia 相差 66.87°，不能拿它代入功因。</p><p>Δ 圖沿 abc 相序、所示支路方向：Ia 落後 Iab 30°。此處只比較關係，<strong>沒有把 Y 的 120 V 相電壓套進 Δ</strong>。</p>',question:'平衡三相瞬時總功率固定，代表每相都不脈動嗎？',answer:'不是。每相功率仍有兩倍電源頻率的脈動；三相脈動恰好相消，所以總瞬時功率固定在 2304 W。三倍功率來自三個來源供應三個負載，不是免費增益。',detail:'<p class="equation">每相 S複 = V相 I相* = 768 + j576 VA<br>P總 = 2304 W；Q總 = 1728 var<br>|S總| = 2880 VA；pf = 0.8 落後</p><p>Y 接每一條線直接流過對應負載，因此線電流就是相電流。平衡時三線電流和為零，中性線電流為零；圖仍保留接通中性線，避免把分析前提藏起來。</p><p>Δ 接節點 a 的電流守恆給出 Ia + Ica = Iab，因此 Ia = Iab − Ica。平衡 abc 相序中，相減得到線電流幅值 √3 倍、相對 Iab 落後 30°。這是支路電流與線電流的比較，不是功率因數角。</p><p>圖是分析模型，不含實機配線指令；本課不處理不平衡負載與對稱分量。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><div class="xfm-mainline">${f.main}</div><div class="xfm-check"><p>想一下：${f.question}</p><details><summary>展開檢核答案</summary><p>${f.answer}</p></details></div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='circuit-audio-xfm-v1';
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

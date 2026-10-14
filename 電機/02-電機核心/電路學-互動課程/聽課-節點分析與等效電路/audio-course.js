(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const defs = `<defs>${['mint','amber','blue'].map((c,i)=>`<marker id="${c}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${['#78e2ca','#ffc67b','#8db8ff'][i]}"/></marker>`).join('')}</defs>`;
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">${defs}</svg>`);
  const line=(x1,y1,x2,y2,c='axis',arrow=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}"${arrow?` marker-end="url(#${c.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,c='',a='start')=>`<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${t}</text>`;
  const path=(d,c='blue')=>`<path d="${d}" class="${c}"/>`;
  const node=(x,y)=>`<circle cx="${x}" cy="${y}" r="6" class="node"/>`;
  const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="box"/>`;
  const ground=(x,y)=>line(x,y,x,y+15,'blue')+line(x-20,y+15,x+20,y+15,'blue')+line(x-13,y+25,x+13,y+25,'blue')+line(x-6,y+35,x+6,y+35,'blue');
  const resV=(x,y)=>path(`M${x} ${y}v30h-13v70h26v-70h-13m0 70v30`);
  const resH=(x,y)=>path(`M${x} ${y}h30v-13h70v26h-70v-13m70 0h60`);
  const current=(x,y,up=true,dependent=false)=> (dependent?path(`M${x} ${y-38}l32 38l-32 38l-32-38Z`,'mint'):`<circle cx="${x}" cy="${y}" r="34" class="mint"/>`)+line(x,y+(up?18:-18),x,y+(up?-18:18),'mint',true);
  const svg=(id,title,body,h=500)=>`<svg viewBox="0 0 680 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,value)=>`<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  const dualSource=(id,mode)=>{
    const v=mode==='v'?8:mode==='i'?2:10;
    let drawing=path('M110 125H220M380 125H540V226M540 294V390H110V294M110 226V125')+resH(220,125)+path('M390 125V200M390 330V390')+resV(390,200)+node(390,125)+ground(390,390);
    drawing+=mode==='i'?line(110,226,110,294,'blue'):`<circle cx="110" cy="260" r="34" class="blue"/>${txt(110,253,'+','blue-fill','middle')}${txt(110,282,'−','blue-fill','middle')}`;
    drawing+=mode==='v'?`<circle cx="540" cy="226" r="5" class="blue"/><circle cx="540" cy="294" r="5" class="blue"/>`:current(540,260);
    return svg(id,'一千歐姆與兩千歐姆的雙源節點電路，獨立電壓源與電流源分別作用',drawing+txt(300,85,'R₁ 1 kΩ','','middle')+txt(365,289,'R₂','blue-fill','end')+txt(360,328,'2 kΩ','blue-fill','end')+txt(390,176,`A：${v} V`,'amber-fill','middle')+txt(110,445,mode==='i'?'電壓源短路':'Vₛ = 12 V','','middle')+txt(530,445,mode==='v'?'電流源開路':'Iₛ = 3 mA','','middle'),480);
  };
  const figures=[
    {id:'net-1',short:'01 支路與節點',title:'先選地，再為每條支路定方向。',subtitle:'同頻餘弦穩態・峰值相量。地是零伏特參考，不是電流消失的地方。',look:'看圖一：先找 A、B 與共同地，再沿箭頭確認電流流入 A、分向地與 B。',diagram:svg('net-1','閉合雙節點電路：電流源從地注入A兩毫安，A對地與A至B各一千歐姆，B對地電容阻抗負j一千歐姆',path('M95 125H320M480 125H550V240M550 270V420H95V294M95 226V125')+current(95,260)+resH(320,125)+path('M255 125V220M255 350V420')+resV(255,220)+line(515,240,585,240,'mint')+line(515,270,585,270,'mint')+node(255,125)+node(550,125)+ground(350,420)+txt(255,85,'A','amber-fill','middle')+txt(550,85,'B','mint-fill','middle')+txt(400,73,'1 kΩ','','middle')+txt(215,295,'1 kΩ','','end')+txt(95,485,'2∠0° mA','mint-fill','middle')+txt(510,345,'Zc = −j1 kΩ','mint-fill','middle')+line(290,165,290,210,'amber',true)+line(360,175,425,175,'amber',true)+line(600,180,600,225,'mint',true)+txt(350,505,'共同參考地：0 V','muted-text','middle'),540),takeaways:take('A → B 支路','IAB = (VA − VB) / 1 kΩ')+take('B → 地電容','Ic = j1 mS × VB'),core:'<p>箭頭只定義正方向。算出負值或複數角度後，不要為了「看起來順」再改方向。</p>',detail:'<p>每一條回路都有共同下方導線。電容在所選頻率呈現 Zc = −j1 kΩ，故 Yc = 1/Zc = j1 mS。這裡不用指定頻率或電容量，因為該頻率下的阻抗已給定。</p>'},
    {id:'net-2',short:'02 導納列式',title:'一條支路，就是導納乘上壓差。',subtitle:'把每個節點流出的電流加起來，等於外部注入。',look:'看圖二：A 列有兩條電阻支路，B 列有一條電阻與一條電容支路；每項導納都帶 mS。',diagram:svg('net-2','節點A與B的導納列式，係數帶毫西門子，電流帶毫安',box(45,40,590,170)+txt(75,85,'A：兩條流出支路','amber-fill')+txt(75,135,'1 mS · VA + 1 mS · (VA − VB)')+txt(75,180,'= 2 mA','amber-fill')+box(45,240,590,170)+txt(75,285,'B：沒有外部注入','mint-fill')+txt(75,335,'1 mS · (VB − VA) + j1 mS · VB')+txt(75,380,'= 0 mA','mint-fill')+txt(340,470,'mS × V = mA','blue-fill','middle'),500),takeaways:take('A 列（電壓用 V 代數值）','2VA − VB = 2')+take('B 列（電壓用 V 代數值）','−VA + (1 + j)VB = 0'),core:'<p>兩式約去共同的 mS 後，右側的電流數值也按 mA 換算；係數不是憑空沒有單位。</p>',detail:'<p>等價矩陣是 [[2, −1], [−1, 1+j]] mS × [VA, VB]ᵀ = [2, 0]ᵀ mA。自己的電壓係數是連接導納總和，鄰居電壓係數是兩點間導納的負值。</p><p>網目法改以平面電路中的環流作未知量；共享支路電流是 Ia − Ib。基本一列可寫成 (Za + Zm)Ia − Zm Ib = Vs。本堂先把節點法做熟，不展開超節點或超網目。</p>'},
    {id:'net-3',short:'03 消去與驗算',title:'先消掉一個未知量，再處理複數。',subtitle:'電壓用 V、電流用 mA 代入。下圖是 A 節點電流的首尾相加。',look:'看圖三：先讀三行消去法，再看向量：兩條流出電流的虛部相消，合成注入的二毫安。',core:'<p class="equation">VA = (1 + j)VB<br>2(1 + j)VB − VB = 2<br>(1 + 2j)VB = 2<br>VB = 2(1 − 2j) / 5 = 0.4 − j0.8 V<br>VA = (1 + j)VB = 1.2 − j0.4 V</p>',diagram:svg('net-3','相同尺度複平面，A流向地1.2減j0.4毫安加A流向B0.8加j0.4毫安等於2毫安',line(70,185,625,185)+line(110,330,110,70)+line(110,185,398,281,'amber',true)+line(398,281,590,185,'mint',true)+line(110,185,590,185,'blue dash',true)+line(398,281,398,185,'grid')+txt(98,176,'0','muted-text','end')+txt(350,155,'1','muted-text','middle')+line(350,180,350,190)+txt(590,155,'2','muted-text','middle')+txt(100,289,'−0.4','muted-text','end')+txt(110,42,'Im（mA）','muted-text')+txt(610,350,'Re（mA）','muted-text','end')+txt(200,310,'1.2 − j0.4','amber-fill')+txt(435,310,'0.8 + j0.4','mint-fill')+txt(330,105,'合成 2 + j0 mA','blue-fill','middle'),385),takeaways:take('A 節點驗算','(1.2 − j0.4) + (0.8 + j0.4) = 2')+take('B 節點驗算','jVB = 0.8 + j0.4 mA'),detail:'<p>共軛相乘：(1 + 2j)(1 − 2j) = 1 + 4 = 5；這一步把分母變成實數。圖的橫、縱軸都是每 1 mA 畫 240 單位，方向與角度沒有被拉伸。</p><p>A→地電流為 VA / 1 kΩ = 1.2 − j0.4 mA。A→B 電流為 (VA − VB) / 1 kΩ = 0.8 + j0.4 mA。B→地電流為 j1 mS × VB = 0.8 + j0.4 mA；兩個節點的 KCL 殘差都為零。</p>'},
    {id:'net-4',short:'04 電源分工',title:'電壓可以相加，功率先別相加。',subtitle:'此處另開 DC 例：R₁ = 1 kΩ，R₂ = 2 kΩ，兩源同時作用時 VA = 10 V。',look:'看圖四：電壓源單獨作用得到八伏特，電流源單獨作用得到兩伏特，合成十伏特；功率必須合成後才算。',diagram:dualSource('net-4-v','v')+dualSource('net-4-i','i'),takeaways:take('電壓源單獨作用','VA,v = 8 V')+take('電流源單獨作用','VA,i = 2 V'),core:'<p class="equation">VA = 8 + 2 = 10 V<br>PR₂ = 10² / 2 kΩ = 50 mW<br>32 mW + 2 mW ≠ 50 mW</p><p>電壓源歸零變短路；電流源歸零變開路。其餘元件與方向保持原樣。</p>',detail:'<p>直接列式：(VA − 12)/1 + VA/2 = 3（電壓 V、電阻 kΩ、電流 mA），解得 10 V。電壓源單獨時是分壓 12×2/(1+2)=8 V；電流源單獨時看到 1 kΩ ∥ 2 kΩ，得到 2 V。</p><p>(8+2)² = 8²+2²+2×8×2。少掉的交叉項貢獻 16 mW。線性疊加適用於電壓與電流；功率是二次關係。交流同頻可疊加完整複數相量；不同頻率須分別求解，再回到時間相加。</p>'},
    {id:'net-5',short:'05 相依源',title:'菱形裡的電流，聽命於控制電壓。',subtitle:'獨立 DC 例。gm = 0.5 mS；受控電流源向下，控制電壓 VA 上正下負。',look:'看圖五：三毫安進入 A，電阻向下二毫安，受控源向下一毫安；菱形的大小仍由 VA 決定。',diagram:svg('net-5','獨立電流源向節點A注入3毫安，節點A對地並聯1千歐姆與gmVA受控電流源，gm0.5毫西門子',path('M110 120H540V222M540 298V410H110V294M110 226V120')+current(110,260)+path('M310 120V195M310 325V410')+resV(310,195)+current(540,260,false,true)+node(310,120)+ground(310,410)+txt(310,78,'A：VA = 2 V','amber-fill','middle')+txt(110,470,'3 mA ↑','mint-fill','middle')+txt(260,265,'1 kΩ','','end')+txt(540,470,'gmVA = 1 mA ↓','mint-fill','middle')+txt(430,205,'+','amber-fill')+txt(430,342,'−','amber-fill')+txt(425,275,'VA','amber-fill')+txt(310,365,'2 mA ↓','blue-fill','middle'),510),takeaways:take('KCL：注入 = 流出','3 mA = 2 mA + 1 mA')+take('受控關係','gmVA = 0.5 mS × VA'),core:'<p class="equation">VA / 1 kΩ + (0.5 mS)VA = 3 mA<br>VA = 2 V</p><p>只能將獨立源歸零。受控源的控制關係要留著；控制量恰為零時，其輸出才可能為零。</p>',detail:'<p>gm 是跨導，單位西門子 S，也就是 A/V；0.5 mS × 2 V = 1 mA。控制標示只是量測同一個節點對地的電壓，不是另一個額外電源。</p>'},
    {id:'net-6',short:'06 測試源',title:'送進一伏特，量網路收下多少電流。',subtitle:'獨立 3 mA 電流源歸零成開路；電阻與受控源完整保留。',look:'看圖六：測試源建立一伏特，流入網路的一點五毫安，分成電阻一毫安與受控源零點五毫安。',diagram:svg('net-6','獨立電流源開路後，在端口加一伏特測試電壓源，向網路送入1.5毫安，受控源保留',path('M110 120H540V222M540 298V410H110V294M110 226V120')+`<circle cx="110" cy="260" r="34" class="amber"/>`+txt(110,253,'+','amber-fill','middle')+txt(110,282,'−','amber-fill','middle')+path('M310 120V195M310 325V410')+resV(310,195)+current(540,260,false,true)+ground(310,410)+line(150,80,245,80,'amber',true)+txt(255,87,'Itest = 1.5 mA','amber-fill')+txt(110,470,'Vtest = 1 V','amber-fill','middle')+txt(260,270,'1 kΩ','','end')+txt(310,365,'1 mA ↓','blue-fill','middle')+txt(540,470,'0.5 mA ↓','mint-fill','middle')+txt(440,190,'+','amber-fill')+txt(440,350,'−','amber-fill')+txt(430,275,'VA','amber-fill'),510),takeaways:take('電流定義：流入網路','Itest = 1 + 0.5 = 1.5 mA')+take('端口電阻','Rtest = 1 V / 1.5 mA ≈ 666.667 Ω'),core:'<p>這裡用「流入待測網路」的電流計算 Rtest。不要直接拿測試電壓源自身的被動方向電流相除。</p>',detail:'<p>歸零的原獨立電流源支路已開路，所以不畫在測試後的網路中。VA 仍等於測試源建立的 1 V；gmVA 仍是 0.5 mA。保留受控關係後再用 Vtest/Itest 求等效電阻。</p>'},
    {id:'net-7',short:'07 端口等效',title:'外部看到的關係相同，內部可以不同。',subtitle:'回到 12 V 與 3 mA 的雙獨立源 DC 網路；共同端口是 A 對地。',look:'看圖七：三個網路都從 A 與地對外相接，端口電壓與負載電流遵守同一條關係。',diagram:svg('net-7','原網路、戴維寧與諾頓依序呈現共同端口A對地，十伏特與666.667歐姆等效於十五毫安並聯同電阻',box(70,35,430,110)+txt(285,82,'原雙源網路','','middle')+txt(285,120,'12 V、3 mA、1 kΩ、2 kΩ','small-label','middle')+line(500,65,570,65,'blue')+line(500,125,570,125,'blue')+node(570,65)+ground(570,125)+txt(600,75,'A','amber-fill')+box(70,200,430,150)+txt(285,238,'戴維寧','amber-fill','middle')+txt(285,282,'10 V 串聯 666.667 Ω','','middle')+txt(285,325,'電壓源上正下負','muted-text','middle')+line(500,235,570,235,'amber')+line(500,325,570,325,'amber')+node(570,235)+ground(570,325)+txt(600,245,'A','amber-fill')+box(70,410,430,150)+txt(285,448,'諾頓','mint-fill','middle')+txt(285,492,'15 mA 並聯 666.667 Ω','','middle')+txt(285,535,'源電流由地注入 A ↑','muted-text','middle')+line(500,445,570,445,'mint')+line(500,535,570,535,'mint')+node(570,445)+ground(570,535)+txt(600,455,'A','amber-fill'),600),takeaways:take('戴維寧','Vth = 10 V；Rth = 2/3 kΩ')+take('諾頓','IN = Vth / Rth = 15 mA'),core:'<p class="equation">V = Vth − Rth IL</p><p>V 的正端在 A；IL 定義由 A 流出、進入外接負載。等價的是端口的電壓與電流關係，內部支路與總效率未必相同。</p>',detail:'<p>移除外接負載得到開路電壓 10 V。將獨立電壓源短路、獨立電流源開路，得到 1 kΩ ∥ 2 kΩ = 666.667 Ω。相依源例則必須保留受控源：上一堂例的 Vth = 2 V、Rth ≈ 666.667 Ω、IN = 3 mA。</p><p>線性端口要有有限且唯一的適當解才能使用這種轉換。Rth = 0 等退化情況不能用有限 IN = Vth/Rth 硬換成一般諾頓形式。</p>'},
    {id:'net-8',short:'08 負載交點',title:'負載線，決定電路停在哪一點。',subtitle:'橘線是電源端口特性；綠線是 1 kΩ 負載。交點同時滿足兩者。',look:'看圖八：橘線從開路十伏特走到短路十五毫安；與綠色一千歐姆負載線交於六毫安、六伏特。',diagram:svg('net-8','端口電壓對流出電流圖，電源直線從0毫安10伏特至15毫安0伏特，負載線與之交於6毫安6伏特',line(95,420,620,420)+line(95,420,95,55)+line(95,110,560,420,'amber')+line(95,420,405,110,'mint')+line(281,234,281,420,'grid')+line(95,234,281,234,'grid')+node(281,234)+txt(95,38,'V（V）','muted-text')+txt(625,490,'IL（mA）','muted-text','end')+txt(75,427,'0','muted-text','end')+txt(75,117,'10','muted-text','end')+txt(75,241,'6','muted-text','end')+txt(281,452,'6','muted-text','middle')+txt(560,452,'15','muted-text','middle')+txt(130,91,'開路','amber-fill')+txt(550,388,'短路','amber-fill','middle')+txt(320,245,'6 mA，6 V','blue-fill')+txt(400,130,'RL = 1 kΩ','mint-fill')+txt(400,320,'V = 10 − ⅔ IL','amber-fill'),530),takeaways:take('串聯等效求電流','IL = 10 / (2/3 + 1) = 6 mA')+take('負載電壓','VL = 6 mA × 1 kΩ = 6 V'),core:'<p>圖中橫軸用 mA、縱軸用 V；端口線的 ⅔ 代表 Rth = ⅔ kΩ。接上負載後，端口電壓由 10 V 降到 6 V。</p>',detail:'<p>原電路直接驗算：(6 − 12)/1 + 6/2 + 6/1 = −6 + 3 + 6 = 3 mA，與注入源一致。開路時 IL = 0，端口 10 V；短路時 V = 0，IL = 15 mA。短路是理想模型的極限比較，並非實體操作指示。</p>'},
    {id:'net-9',short:'09 最大功率',title:'能調電抗，和只能換電阻，是兩個問題。',subtitle:'這是獨立 AC 例，明確改用 RMS：Vth = 10∠0° V，Zth = 3 + j4 Ω。',look:'看圖九：可調複數負載用三減 j 四歐姆抵消電抗；只准純電阻時，最佳值改成五歐姆。',diagram:svg('net-9','兩種最大平均功率限制比較：共軛負載3減j4歐姆得8.333瓦，純電阻5歐姆得6.25瓦',box(45,35,590,205)+txt(75,80,'可調複數負載','mint-fill')+txt(75,125,'ZL = 3 − j4 Ω')+txt(75,170,'Zth + ZL = 6 + j0 Ω','mint-fill')+txt(75,215,'電抗相消 → Pmax ≈ 8.333 W','amber-fill')+box(45,270,590,205)+txt(75,315,'只准純電阻','blue-fill')+txt(75,360,'RL = |Zth| = 5 Ω')+txt(75,405,'Zth + RL = 8 + j4 Ω','blue-fill')+txt(75,450,'電抗仍在 → Pmax = 6.25 W','amber-fill'),510),takeaways:take('可調複數負載','ZL = Zth*（共軛）')+take('只准純電阻','RL = |Zth|'),core:'<p class="equation">P = |Vth,RMS|² RL / [(Rth + RL)² + (Xth + XL)²]</p><p>Rth = 3 Ω &gt; 0。共軛匹配先抵消電抗，再選 RL = Rth；純電阻無法抵消 j4 Ω，只能另找最佳 RL。</p>',detail:'<p>共軛負載：Pmax = 100/(4×3) = 8.333 W。純電阻：P = 100×5/[(3+5)²+4²] = 500/80 = 6.25 W。若把來源 10 V 當成峰值，以上平均功率就要多除以二；本例已明確改用有效值 RMS。</p><p>純電阻情形令 P(RL) 對 RL 的導數為零，得到 RL² = Rth² + Xth²；選正根即 5 Ω。完整平均功率與功率因數在後續課程接續。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">圖 ${i+1} / 09</p><h3>${f.title}</h3><p>${f.subtitle}</p></header>${f.id==='net-3'?`<div class="core-reading">${f.core}</div>`:''}<div class="diagram">${f.diagram}</div><div class="figure-takeaway">${f.takeaways}</div>${f.core&&f.id!=='net-3'?`<div class="core-reading">${f.core}</div>`:''}<details class="figure-details"><summary>想多看一步：公式與推導</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){
    if(!figures.some(f=>f.id===id))return;
    figures.forEach(f=>$(f.id).hidden=f.id!==id);
    $('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));
    if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('figure-tabs').addEventListener('click',event=>{const button=event.target.closest('button');if(button)showFigure(button.dataset.figure);});
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='engineer-study-net-audio-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  let lessonIndex=Math.max(0,lessons.findIndex(l=>l.id===saved.lesson));
  let segmentIndex=Math.min(Math.max(0,Number.isInteger(saved.segment)?saved.segment:0),lessons[lessonIndex].segments.length-1);
  let state=saved.state==='checkpoint'?'checkpoint':'idle';
  let voices=[],voiceURI=saved.voice||'',rate=Math.min(1.2,Math.max(.7,Number(saved.rate)||1));
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
    const firstFigure=lesson().segments.find(s=>s.figure)?.figure;
    if(firstFigure)showFigure(firstFigure);
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

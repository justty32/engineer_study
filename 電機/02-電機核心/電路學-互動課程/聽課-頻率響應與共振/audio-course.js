(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const defs=`<defs>${['mint','amber','blue'].map((c,i)=>`<marker id="${c}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${['#78e2ca','#ffc67b','#8db8ff'][i]}"/></marker>`).join('')}</defs>`;
  document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">${defs}</svg>`);
  const line=(x1,y1,x2,y2,c='axis',arrow=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}"${arrow?` marker-end="url(#${c.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,c='',a='start')=>`<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${t}</text>`;
  const path=(d,c='blue')=>`<path d="${d}" class="${c}"/>`;
  const node=(x,y)=>`<circle cx="${x}" cy="${y}" r="6" class="node"/>`;
  const ground=(x,y)=>line(x,y,x,y+15,'blue')+line(x-20,y+15,x+20,y+15,'blue')+line(x-13,y+25,x+13,y+25,'blue')+line(x-6,y+35,x+6,y+35,'blue');
  const svg=(id,title,body,h=500)=>`<svg viewBox="0 0 680 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,value)=>`<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  const curve=(fn,x,y,start,end,n=360)=>path(Array.from({length:n+1},(_,i)=>{const t=start+(end-start)*i/n;return `${i?'L':'M'}${x(t).toFixed(3)} ${y(fn(t)).toFixed(3)}`;}).join(' '),'mint');
  const fc=10000/(2*Math.PI);
  function wavePanel(x,index){
    const a=1/Math.sqrt(1+x*x),phi=-Math.atan(x),px=t=>100+t/(2*Math.PI)*500,py=v=>235-85*v;
    const grid=[-1,0,1].map(v=>line(100,py(v),600,py(v),v===0?'axis':'grid')+txt(83,py(v)+8,String(v),'muted-text','end')).join('');
    const input=curve(Math.cos,px,py,0,2*Math.PI).replace('class="mint"','class="amber dash"');
    return svg(`freq-2-${index}`,`頻率比${x}，輸入1伏特峰值與輸出${a.toFixed(4)}伏特峰值，橫軸為各自一週期`,txt(80,40,`x = ${x}；f = ${(fc*x).toFixed(2)} Hz`,'blue-fill')+txt(80,84,`輸出 ${a.toFixed(4)} V；相位 ${(phi*180/Math.PI).toFixed(2)}°`,'mint-fill')+txt(80,130,'V','muted-text')+grid+input+curve(t=>a*Math.cos(t+phi),px,py,0,2*Math.PI)+[0,Math.PI,2*Math.PI].map((t,i)=>line(px(t),335,px(t),343)+txt(px(t),376,['0','π','2π'][i],'muted-text','middle')).join('')+txt(600,425,'θ = ωt（各自一週期）','muted-text','end'),450);
  }
  const bx=u=>100+(u+2)*125;
  function bodePanel(phase=false){
    const y=v=>phase?110-v/90*270:90+(5-v)*6, fn=u=>phase?-Math.atan(10**u)*180/Math.PI:20*Math.log10(1/Math.sqrt(1+10**(2*u)));
    const ticks=phase?[0,-45,-90]:[0,-20,-40];
    let body=txt(85,44,phase?'相位（°）':'電壓增益（dB）','blue-fill')+ticks.map(v=>line(100,y(v),600,y(v),'grid')+txt(83,y(v)+8,String(v),'muted-text','end')).join('');
    body+=[-2,-1,0,1,2].map(u=>line(bx(u),90,bx(u),390,u===0?'blue dash':'grid')+txt(bx(u),430,['0.01','0.1','1','10','100'][u+2],'tick-label','middle')).join('');
    if(!phase)body+=path(`M100 ${y(0)}H${bx(0)}L${bx(2)} ${y(-40)}`,'amber dash');
    body+=curve(fn,bx,y,-2,2)+node(bx(0),y(fn(0)))+txt(395,phase?255:120,phase?'−45°':'−3.0103 dB','mint-fill')+txt(600,480,'x = f / fc（對數軸）','muted-text','end');
    return svg(phase?'freq-6-phase':'freq-6-db',phase?'RC相位真曲線：截止點負45度':'RC電壓增益真曲線與虛線漸近線：截止點負3.0103分貝',body,510);
  }
  const half=Math.SQRT1_2,rl=Math.sqrt(1+1/400)-.05,rh=Math.sqrt(1+1/400)+.05;
  const rx=r=>100+(Math.log(r)/Math.log(2)+1)*250,ry=v=>375-v*260;
  const resonanceCurve=q=>curve(r=>1/Math.sqrt(1+q*q*(r-1/r)**2),rx,ry,.5,2,700);
  const figures=[
    {id:'freq-1',short:'01 輸出端點',title:'同一個電路，先說清楚量哪裡。',subtitle:'R = 1 kΩ，C = 0.1 μF；輸出取電容兩端，沒有額外負載。',look:'看圖一：找出 Vout 的正負端，再沿電源、電阻、電容與底部回線走一圈，確認是閉合迴路。',diagram:svg('freq-1','閉合RC電路，輸入為左側1伏特峰值理想源，輸出為右側電容兩端，電阻1千歐姆電容0.1微法',path('M130 140H260V127H350V153H260V140M350 140H520V245M520 275V410H130V299M130 231V140')+`<circle cx="130" cy="265" r="34" class="blue"/>`+path('M107 265Q118 240 130 265T153 265','amber')+line(480,245,560,245,'mint')+line(480,275,560,275,'mint')+ground(330,410)+line(185,90,245,90,'amber',true)+txt(205,67,'I →','amber-fill')+txt(310,88,'R = 1 kΩ','','middle')+txt(405,345,'C = 0.1 μF','mint-fill','middle')+txt(80,220,'+','blue-fill')+txt(80,320,'−','blue-fill')+txt(130,470,'Vin = 1 V 峰值','blue-fill','middle')+txt(585,235,'+','mint-fill')+txt(585,312,'−','mint-fill')+txt(590,275,'Vout','mint-fill')+node(520,140)+txt(550,135,'A','mint-fill'),510),takeaways:take('輸入','理想源兩端 Vin')+take('輸出','電容兩端 Vout'),core:'<p class="equation">H = Vout / Vin = Zc / (R + Zc)<br>Zc = 1 / (jωC)</p><p>以下只研究這個無額外負載的 RC 低通。改量電阻兩端會換成另一個問題。</p>',detail:'<p>電流參考方向為順時針，電流流入電容的電壓正端。理想源沒有額外串聯內阻；量測端不抽走電流。若加上負載，必須重新計算電容與負載的並聯阻抗。</p>'},
    {id:'freq-2',short:'02 三個頻率',title:'頻率升高，輸出變小、峰值更晚。',subtitle:'三圖共用 −1 至 +1 V 的電壓尺度；橫軸各自是一週期，代表的秒數不同。',look:'看圖二：由上到下比較綠色輸出的高度，以及峰值相對橘色輸入向右移的程度；不要把三張圖的橫距當成相同秒數。',diagram:[.1,1,10].map(wavePanel).join(''),extra:'<div class="diagram-legend"><span class="legend-amber">橘虛線：輸入 cos θ</span><span class="legend-mint">綠實線：輸出</span></div>',takeaways:take('頻率比','x = ωRC = f / fc')+take('同一公式，三個頻點','|H| = 1 / √(1 + x²)'),core:'<p class="equation">H = 1 / (1 + jx)<br>φ = −atan(x)<br>vout(t) = |H| cos(ωt + φ) V</p><p>時間式中的 φ 用弧度。相移不是對所有頻率都相同的固定秒延遲。</p>',detail:'<p>x = 0.1、1、10 的輸出峰值分別約 0.9950、0.7071、0.09950 V，相位分別約 −5.7106°、−45°、−84.2894°。橫軸 θ = ωt，因此每圖從 0 到 2π 都是一週期；三個實際週期約為 6.283、0.6283、0.06283 ms。</p><p>同一頻率內可以用 −φ/ω 表示峰值延後時間，但 φ 本身隨頻率改變；RC 對多頻訊號的影響不能概括成把整段訊號往後平移固定秒數。</p>'},
    {id:'freq-3',short:'03 截止相量',title:'半個實部、負半個虛部，合成斜箭頭。',subtitle:'x = 1 時，實部 0.5 V、虛部 −0.5 V；箭頭長度不是 0.5 V。',look:'看圖三：找輸出的實部 0.5 與虛部 −0.5，沿綠色斜箭頭看出長度約 0.7071 V、角度 −45°。',diagram:svg('freq-3','同尺度電壓複平面，輸入1伏特沿正實軸，輸出0.5減j0.5伏特向右下，角度負45度',line(75,160,610,160)+line(145,400,145,65)+line(145,160,505,160,'amber',true)+line(145,160,325,340,'mint',true)+line(325,160,325,340,'grid')+line(145,340,325,340,'grid')+path('M215 160A70 70 0 0 1 194.5 209.5','blue')+txt(225,230,'−45°','blue-fill')+txt(505,125,'Vin = 1 V','amber-fill','middle')+txt(325,135,'0.5','muted-text','middle')+txt(128,350,'−0.5','muted-text','end')+txt(135,190,'0','muted-text','end')+txt(365,340,'Vout','mint-fill')+txt(365,385,'0.7071 V','mint-fill')+txt(610,450,'Re（V）','muted-text','end')+txt(145,40,'Im（V）','muted-text'),480),takeaways:take('同尺度複平面','每 1 V = 360 圖面單位')+take('截止頻率','fc ≈ 1591.55 Hz'),core:'<p class="equation">H = 1 / (1 + j) = (1 − j) / 2<br>fc = 1 / (2πRC)<br>τ = RC = 100 μs</p><p>截止是一個方便辨識的轉折位置，不是過了這裡就完全沒有輸出的硬開關。</p>',detail:'<p>將分子分母乘上共軛 1−j：分母為 (1+j)(1−j)=2，故 H=0.5−j0.5。幅度為 √(0.5²+0.5²)=1/√2，角度為 −45°。ωc = 1/RC = 10000 rad/s，還要除以 2π 才得到以 Hz 表示的 fc。</p>'},
    {id:'freq-4',short:'04 對數頻率',title:'相鄰一格，代表乘十。',subtitle:'只看頻率比：0.1、1、10、100。等距代表相同比例，不是相同 Hz 差。',look:'看圖四：沿四個等距刻度走，每一步都是乘十；再對照下面的實際 Hz 數值。',diagram:svg('freq-4','對數頻率比軸0.1、1、10、100四個等距刻度，每一段乘十，下方列出log10位置負1、0、1、2',line(80,165,620,165)+[100,260,420,580].map((x,i)=>line(x,150,x,180,'blue')+txt(x,220,['0.1','1','10','100'][i],'blue-fill','middle')+txt(x,310,['−1','0','1','2'][i],'mint-fill','middle')).join('')+[180,340,500].map(x=>txt(x,120,'×10','amber-fill','middle')).join('')+txt(340,65,'頻率比 f / fc','blue-fill','middle')+txt(340,270,'u = log₁₀(f / fc)','mint-fill','middle'),345),takeaways:take('十倍頻率','增加 1 decade')+take('頻率乘法','換成座標加法'),core:'<div class="frequency-table"><div><strong>0.1 fc</strong><span>159.15 Hz</span></div><div><strong>1 fc</strong><span>1591.55 Hz</span></div><div><strong>10 fc</strong><span>15915.49 Hz</span></div><div><strong>100 fc</strong><span>159154.94 Hz</span></div></div><p class="equation">u = log₁₀(f / fc)<br>f / fc = 10ᵘ</p>',detail:'<p>對數回答「十的幾次方」。0.1 = 10⁻¹，1 = 10⁰，10 = 10¹，100 = 10²，因此四個位置是 −1、0、1、2。頻率必須先除以參考頻率變成無單位比值，再取對數。</p>'},
    {id:'freq-5',short:'05 比例與 dB',title:'半振幅約 −6 dB；不是 −3 dB。',subtitle:'負 dB 代表比值小於 1，不是電壓變成負數。',look:'看圖五：找 0.5 那一列，它對應約 −6 dB；再找 0.7071 那一列，才是約 −3 dB。',diagram:svg('freq-5','四列電壓比例條：1對應0分貝，0.7071對應負3.0103，0.5對應負6.0206，0.1對應負20',[[1,'1','0 dB'],[Math.SQRT1_2,'0.7071','−3.0103 dB'],[.5,'0.5','−6.0206 dB'],[.1,'0.1','−20 dB']].map(([v,label,db],i)=>{const y=75+i*120;return txt(80,y,label,'blue-fill')+txt(600,y,db,'amber-fill','end')+`<rect x="80" y="${y+18}" width="520" height="24" rx="6" fill="#2a3d51"/><rect x="80" y="${y+18}" width="${520*v}" height="24" rx="6" fill="#78e2ca"/>`;}).join(''),510),takeaways:take('電壓比例','AdB = 20 log₁₀ |H|')+take('功率比例','PdB = 10 log₁₀(P₂ / P₁)'),core:'<p>相同正實電阻下，功率才可按電壓平方比例比較。此處輸出是理想電容兩端，−3 dB 不表示電容吸收一半有功功率。</p>',detail:'<p>相同電阻時 P₂/P₁ = (V₂/V₁)²，所以 10log₁₀(P₂/P₁)=20log₁₀(V₂/V₁)。電壓增益使用 20log 的定義仍然可用，但不能省略條件直接解讀成不同元件吸收的實際功率比。</p><p>理想電容平均有功功率為零。RC 截止的 |H|² = 1/2，是等阻抗參考下的平方比。兩段增益相乘時，對應的 dB 可以相加。</p>'},
    {id:'freq-6',short:'06 Bode 幅相',title:'虛線幫忙估；真曲線告訴你轉彎。',subtitle:'上下共享對數頻率比軸；藍虛線標出 x = 1。',look:'看圖六：在 x = 1 找真曲線的 −3.0103 dB 與 −45°，再看 x = 10 到 100 的幅度約降 20 dB；漸近虛線只是估計。',diagram:bodePanel()+bodePanel(true),extra:'<div class="diagram-legend"><span class="legend-mint">綠實線：真曲線</span><span class="legend-amber">橘虛線：幅度漸近估計</span></div>',takeaways:take('x = 10 真值','−20.0432 dB')+take('x = 100 真值','−40.0004 dB'),core:'<p class="equation">AdB = −10 log₁₀(1 + x²)<br>φ = −atan(x)</p><p>遠高於 fc 時，每十倍頻率約下降 20 dB。截止點的漸近估計是 0 dB，與真值相差約 3.0103 dB。</p>',detail:'<p>幅度漸近線在 x≤1 時取 0 dB，在 x≥1 時取 −20log₁₀x。它在遠離轉折處準確，不能把交點當作實際曲線。x = 0.01、0.1、1、10、100 的真幅度約為 −0.000434、−0.043214、−3.010300、−20.043214、−40.000434 dB。</p><p>相位從接近 0° 連續走向 −90°，沒有在截止點突然跳變。這兩張圖描述穩態下單一頻率的縮放與相移。</p>'},
    {id:'freq-7',short:'07 串聯共振',title:'三個元件同一股電流，兩個電抗可抵消。',subtitle:'總 R = 10 Ω，L = 10 mH，C = 1 μF；Vs 固定 1 V 峰值。',look:'看圖七：沿閉合迴路確認 R、L、C 串聯，再找 VR 的正負端；輸出跨在總電阻兩端，不是某個端點對地。',diagram:svg('freq-7','閉合串聯RLC：左側電源1伏特峰值，上方總電阻10歐姆與電感10毫亨，右側電容1微法，VR差動取電阻兩端',path('M105 170H200V157H280V183H200V170M280 170H350')+path('M350 170a15 20 0 0 1 30 0a15 20 0 0 1 30 0a15 20 0 0 1 30 0a15 20 0 0 1 30 0H550V270M550 300V435H105V319M105 251V170')+`<circle cx="105" cy="285" r="34" class="blue"/>`+path('M82 285Q94 260 105 285T128 285','amber')+line(510,270,590,270,'mint')+line(510,300,590,300,'mint')+ground(330,435)+line(145,85,210,85,'amber',true)+txt(180,57,'I','amber-fill','middle')+txt(235,128,'總 R = 10 Ω','','middle')+txt(425,125,'L = 10 mH','','middle')+txt(470,365,'C = 1 μF','mint-fill','middle')+line(200,220,280,220,'amber')+line(200,210,200,230,'amber')+line(280,210,280,230,'amber')+txt(175,230,'+','amber-fill')+txt(294,230,'−','amber-fill')+txt(240,275,'VR','amber-fill','middle')+txt(65,245,'+','blue-fill')+txt(65,335,'−','blue-fill')+txt(105,500,'Vs = 1 V 峰值','blue-fill','middle'),540),takeaways:take('共振角頻率','ω₀ = 1 / √(LC) = 10000 rad/s')+take('共振電抗','XL = XC = 100 Ω'),core:'<p class="equation">Z = R + j(ωL − 1/ωC)<br>HR = VR / Vs = R / Z</p><p>R 包含來源串聯內阻、繞線等模型損耗。這堂只看串聯電流與總電阻電壓的響應。</p>',detail:'<p>共振時虛部為零，總阻抗剩下 R = 10 Ω，所以電流峰值為 1/10 = 0.1 A。低頻時電容電抗大，高頻時電感電抗大，兩側都限制電流。VR 是電阻兩端的差動電壓，不能改當成電阻某端對地電壓。</p>'},
    {id:'freq-8',short:'08 Q 與頻寬',title:'峰值一樣高，是因為各自除以自己的峰值。',subtitle:'頻率比 r = f / f₀ 採對數軸；綠色 Q = 10，橘色 Q = 5。',look:'看圖八：找 Q = 10 曲線與 0.7071 水平線的兩個交點，再比較 Q = 5 曲線較寬；兩者實際峰值電流並不相同。',diagram:svg('freq-8','對數頻率比0.5至2的歸一化串聯RLC電流曲線，Q10較窄、Q5較寬，Q10半功率兩點及頻率標示',txt(80,42,'|I| / Imax = |VR| / |Vs|','blue-fill')+[0,.5,half,1].map(v=>line(100,ry(v),600,ry(v),v===half?'blue dash':'grid')+txt(83,ry(v)+8,v===half?'0.707':String(v),'tick-label','end')).join('')+[.5,1,2].map(r=>line(rx(r),100,rx(r),375,'grid')+txt(rx(r),414,String(r),'tick-label','middle')).join('')+resonanceCurve(5).replace('class="mint"','class="amber"')+resonanceCurve(10)+node(rx(rl),ry(half))+node(rx(rh),ry(half))+path(`M${rx(rl)} ${ry(half)}L220 450M${rx(rh)} ${ry(half)}L470 450`,'blue fine')+txt(210,485,'rL = 0.95125','mint-fill','middle')+txt(480,485,'rH = 1.05125','mint-fill','middle')+txt(210,525,'1513.960 Hz','mint-fill','middle')+txt(480,525,'1673.115 Hz','mint-fill','middle')+txt(600,570,'r = f / f₀（對數軸）','muted-text','end'),600),extra:'<div class="diagram-legend"><span class="legend-mint">Q = 10；R = 10 Ω；Imax = 0.1 A</span><span class="legend-amber">Q = 5；R = 20 Ω；Imax = 0.05 A</span></div>',takeaways:take('Q = 10 的頻寬','BW ≈ 159.155 Hz')+take('半功率幅度','I / Imax = 1 / √2'),core:'<p class="equation">Q = ω₀L / R<br>BW = fH − fL = f₀ / Q<br>|I| / Imax = 1 / √[1 + Q²(r − 1/r)²]</p><p>半功率指固定來源振幅下，總 R 的平均功率降到其共振峰值的一半。Q 高代表這個模型的曲線較窄，不是好壞評分。</p>',detail:'<p>半功率條件是 |ωL−1/(ωC)|=R。rL,H = √[1+1/(4Q²)] ∓ 1/(2Q)。Q=10 時 fL≈1513.960154 Hz、fH≈1673.115097 Hz；幾何中心 √(fLfH)=f₀，而在線性 Hz 軸上兩側不等距。</p><p>每條曲線分別除以自己的電流峰值；改為 R=20 Ω 時，Q 降為 5，但實際峰值電流也由 0.1 A 降到 0.05 A。BW=f₀/Q 精確適用本理想串聯電流／總電阻電壓響應，不直接套到其他輸出端點或並聯共振。</p>'},
    {id:'freq-9',short:'09 大電壓相消',title:'上下各十伏特，留下向右的一伏特。',subtitle:'全是峰值相量；Re 與 Im 同尺度。1 V 箭頭刻意保持短，沒有放大。',look:'看圖九：看向上的 j10 V 與向下的 −j10 V 互相抵消，最後只剩向右的 VR = 1 V；不要直接把三個大小相加。',diagram:svg('freq-9','同尺度電壓複平面，電阻1伏特向右，電感j10伏特向上，電容負j10伏特向下，共原點且上下抵消',line(90,310,610,310)+line(300,555,300,65)+line(300,310,300,110,'blue',true)+line(300,310,300,510,'mint',true)+line(300,310,320,310,'amber',true)+txt(340,120,'VL = j10 V','blue-fill')+txt(340,515,'VC = −j10 V','mint-fill')+line(320,317,390,365,'amber fine')+txt(405,375,'VR = 1 V','amber-fill')+txt(280,345,'0','muted-text','end')+txt(260,120,'10','muted-text','end')+txt(260,515,'−10','muted-text','end')+txt(300,40,'Im（V）','muted-text','middle')+txt(605,285,'Re（V）','muted-text','end')+txt(340,580,'每 1 V = 20 圖面單位','muted-text','middle'),615),takeaways:take('電抗電壓相消','VL + VC = 0')+take('來源與電流','Vs = VR = 1 V；Ipeak = 0.1 A'),core:'<p class="equation">PR,avg = ½ Ipeak²R = 0.05 W</p><p>理想 L、C 的平均有功功率都是零。因為本課使用峰值，算電阻平均功率要保留 ½。</p>',detail:'<p>在共振頻率，VL = jω₀LI = j10 V，VC = −jI/(ω₀C) = −j10 V，VR = RI = 1 V。KVL 相加的是完整複數電壓，而不是 1+10+10。</p><p>電感與電容在週期中儲存並交換能量，電阻持續消耗平均功率；共振的穩態需要建立時間。這張圖不是暫態能量時間曲線，振鈴與建立過程留在後續。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">圖 ${i+1} / 09</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><div class="core-reading">${f.core}</div><details class="figure-details"><summary>想多看一步：公式與推導</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const button=event.target.closest('button');if(button)showFigure(button.dataset.figure);});
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='engineer-study-frequency-audio-v1';
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

(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const line=(x1,y1,x2,y2,cls='wire')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  const arrow=(x1,y1,x2,y2,cls='amber')=>{const a=Math.atan2(y2-y1,x2-x1);return line(x1,y1,x2,y2,cls)+`<path d="M${x2-11*Math.cos(a-.6)} ${y2-11*Math.sin(a-.6)}L${x2} ${y2}L${x2-11*Math.cos(a+.6)} ${y2-11*Math.sin(a+.6)}" class="${cls}"/>`;};
  const svg=(id,title,body,h=560)=>`<svg viewBox="0 0 760 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;
  const k=.001, vth=1, vov=1, iref=.0005, tail=.002, vt=.02585, rc=2000;
  const gm=(tail/2)/vt, ad=-gm*rc;
  const mirrorCurrent=vds=>vds<vov?k*(vov*vds-vds*vds/2):k*vov*vov/2;
  function differential(vd){const i1=tail/(1+Math.exp(-vd/vt)),i2=tail-i1;return {vd,i1,i2,vc1:5-rc*i1,vc2:5-rc*i2,vo:-rc*(i1-i2),linear:ad*vd};}
  function mirrorDiagram(id,connected){
    const transistor=(x,label)=>`<path d="M${x} 295V315H${x-20}V375H${x}V465M${x-45} 315V375" class="wire"/>`+line(x-20,345,x,345)+arrow(x,345,x-20,345,'mint')+txt(x+(label==='Q2'?60:18),349,label,'mint-fill');
    let body=`<path d="M75 252V75H255V125M255 181V295M255 465H75V308M255 260H160V345H210M160 285H415V345H455M500 465H255M500 245V295" class="wire"/>`;
    body+=`<circle cx="75" cy="280" r="28" class="blue"/><circle cx="255" cy="153" r="28" class="blue"/>`+arrow(255,136,255,170)+transistor(255,'Q1')+transistor(500,'Q2');
    body+=txt(75,276,'+','blue-fill','middle')+txt(75,299,'−','blue-fill','middle')+txt(75,220,'+5 V','blue-fill','middle');
    body+=txt(300,130,'理想參考源','tiny-text')+txt(300,169,'Iref = 0.5 mA','amber-fill')+txt(150,244,'G = D','tiny-text','end')+txt(365,271,'VG = 2 V','mint-fill','middle');
    body+=txt(365,420,'VS1 = VS2 = 0 V','tiny-text','middle')+txt(365,508,'共同 0 V；電源回線閉合','tiny-text','middle');
    if(connected){body+=`<path d="M500 245V210H665V280M665 336V465H500" class="wire"/><circle cx="665" cy="308" r="28" class="blue"/>`+txt(665,303,'+','blue-fill','middle')+txt(665,327,'−','blue-fill','middle')+txt(625,250,'測試源 2 V','tiny-text','middle')+arrow(540,300,540,365)+txt(590,399,'0.5 mA','amber-fill','middle')+txt(365,550,'IG1 = IG2 = 0；輸出由測試源供能','tiny-text','middle');}
    else {body+=`<circle cx="500" cy="245" r="5" class="node"/>`+txt(540,240,'輸出待接','tiny-text')+txt(365,550,'Q1：VDS = 2 V ≥ VOV = 1 V','tiny-text','middle');}
    return svg(id,connected?'兩匹配NMOS共閘；左5伏特供電經參考源與Q1閉合，右2伏特測試源經Q2閉合。閘極無直流電流':'參考支路半毫安注入Q1閘汲相接節點，得到閘源2伏特；Q2共閘同源，輸出待接',body,580);
  }
  function mirrorPlot(vds){
    const x=v=>90+560*v/4,y=i=>350-270*i/.6;
    let body=txt(90,40,'ID（mA）','muted-text');
    for(const i of [0,.2,.4,.6])body+=line(90,y(i),650,y(i),'grid')+txt(75,y(i)+7,i.toFixed(1),'tiny-text','end');
    for(const v of [0,1,2,3,4])body+=line(x(v),80,x(v),350,'grid')+txt(x(v),385,String(v),'tiny-text','middle');
    const path=Array.from({length:161},(_,n)=>`${n?'L':'M'}${x(n/40)} ${y(1000*mirrorCurrent(n/40))}`).join(' ');
    body+=`<path d="${path}" class="curve"/>`+line(x(1),75,x(1),350,'boundary')+`<circle cx="${x(vds)}" cy="${y(mirrorCurrent(vds)*1000)}" r="8" class="work-point"/>`+txt(x(.5),65,'三極','tiny-text','middle')+txt(x(2.7),65,'飽和：0.5 mA','tiny-text','middle')+txt(650,432,'VDS = Vout（V）','muted-text','end');
    return svg('ei-compliance-svg','固定閘源2伏特、超驅動1伏特；輸出電流在1伏特以下依三極式變動，以上為半毫安平台',body,460);
  }
  function diffCircuit(id,vd){
    const r=differential(vd), atZero=vd===0;
    let body=`<path d="M230 65H530M230 65V100M530 65V100M230 170V230L290 285M290 270V345M290 330L350 390V415H410V390L470 330M470 270V345M470 285L530 230V170M95 307H290M470 307H665M380 415V450M380 506V555" class="wire"/><rect x="216" y="100" width="28" height="70" class="blue"/><rect x="516" y="100" width="28" height="70" class="blue"/><circle cx="380" cy="478" r="28" class="blue"/>`;
    body+=arrow(308,347,340,380,'mint')+arrow(452,347,420,380,'mint')+arrow(380,460,380,495)+arrow(195,180,195,230)+arrow(565,180,565,230);
    body+=txt(380,38,'VCC = +5 V','','middle')+txt(185,145,'RC 2 kΩ','tiny-text','end')+txt(575,145,'RC 2 kΩ','tiny-text')+txt(85,345,`v1 ${atZero?'0':'+0.5 m'}V`,'blue-fill')+txt(585,345,`v2 ${atZero?'0':'−0.5 m'}V`,'blue-fill');
    body+=txt(180,258,`VC1 ${r.vc1.toFixed(5)} V`,'tiny-text','middle')+txt(580,258,`VC2 ${r.vc2.toFixed(5)} V`,'tiny-text','middle')+txt(85,203,`${(r.i1*1000).toFixed(5)}`,'amber-fill','middle')+txt(85,231,'IC1 / mA','tiny-text','middle')+txt(675,203,`${(r.i2*1000).toFixed(5)}`,'amber-fill','middle')+txt(675,231,'IC2 / mA','tiny-text','middle');
    body+=txt(430,485,'IT = 2 mA','amber-fill')+txt(380,588,'尾源下端 −5 V','','middle')+txt(160,430,'Q1：NPN','tiny-text','middle')+txt(600,430,'Q2：NPN','tiny-text','middle');
    return svg(id,atZero?'匹配NPN差動對，兩基極0伏特，尾流2毫安，各集極1毫安與3伏特。正負供電由電源系統回流閉合':'正1毫伏差模使左集極電流增加、左集極電壓下降；右側相反，尾流仍2毫安',body,620);
  }
  function diffPlot(mv){
    const x=v=>100+550*(v+50)/100,y=v=>255-43*v;
    let body=txt(100,32,'vo = VC1 − VC2（V）','muted-text');
    for(const v of [-4,-2,0,2,4])body+=line(100,y(v),650,y(v),'grid')+txt(85,y(v)+7,String(v),'tiny-text','end');
    for(const v of [-50,-25,0,25,50])body+=line(x(v),65,x(v),440,'grid')+txt(x(v),472,String(v),'tiny-text','middle');
    const curve=fn=>Array.from({length:201},(_,n)=>{const v=-50+n/2;return `${n?'L':'M'}${x(v)} ${y(fn(v/1000))}`;}).join(' ');
    const r=differential(mv/1000);
    body+=`<path d="${curve(v=>differential(v).vo)}" class="curve"/><path d="${curve(v=>ad*v)}" class="envelope"/><circle cx="${x(mv)}" cy="${y(r.vo)}" r="8" class="work-point"/>`+txt(650,515,'差模 vd（mV）','muted-text','end');
    return svg('ei-difference-svg','差模負50至正50毫伏，精確差動輸出綠線與局部直線橘色虛線，正差模輸出為負',body,545);
  }
  const mosModel='<p>匹配長通道 NMOS；k = 0.001 A/V²，不含二分之一；Vth = 1 V、λ = 0、基體接源極、無體效應，理想直流 IG = 0。</p><p class="equation">Iref = (k/2)VOV² → VOV = √(2Iref/k) = 1 V<br>VGS = Vth + VOV = 2 V<br>0 ≤ VDS &lt; 1 V：ID = k(VOV·VDS − VDS²/2)<br>VDS ≥ 1 V：ID = (k/2)VOV² = 0.5 mA</p><p>正超驅動才適用導通模型；不是 PN 二極體的 0.7 V 固定壓降。輸出電壓範圍限本例，未模擬擊穿、溫漂、失配與通道長度調變。</p>';
  const diffModel='<p>匹配 NPN、β → ∞、忽略 Early 效應；IT = 2 mA、VT = 0.02585 V、RC = 2 kΩ、VCC = +5 V，尾源下接 −5 V。固定共模 0 V，v1 = vd/2、v2 = −vd/2；假設基射與尾源順應有效。</p><p class="equation">IC1/IC2 = exp(vd/VT)；IC1 + IC2 = IT<br>IC1 = IT/[1 + exp(−vd/VT)]；IC2 = IT − IC1<br>VC1 = 5 − RC·IC1；VC2 = 5 − RC·IC2<br>vo = VC1 − VC2 = −RC(IC1 − IC2)<br>IC1 − IC2 = IT·tanh[vd/(2VT)]</p><p>指數模型是本課假設下的精確分流關係，不是所有真實元件的精確實測。有限 β 時尾流是 IE1 + IE2，集極總流須另乘 α。沒有指定 IS，所以不硬算射極絕對電壓；尾源順應與基射有效性為明列假設。</p>';
  const figures=[
    {id:'ei-reference',short:'01 參考轉閘壓',title:'半毫安先建立兩伏特。',subtitle:'理想參考源自 +5 V 注入；Q1 閘汲短接，Q2 共閘、兩源極接 0 V。',look:'圖一：找 Q1 閘汲短接、共同閘極 2 V，再驗 2 V ≥ VOV 1 V。',diagram:mirrorDiagram('ei-reference-svg',false),takeaways:take('參考設定','Iref = 0.5 mA')+take('閘源 / 超驅動','VGS 2 V / VOV 1 V'),extra:'<p class="formula-main">ID = (k/2)(VGS − Vth)²<br>二極體連接是接法，不能套 PN 二極體的 0.7 V。</p><p class="model-note">參考源兩端 5 − 2 = 3 V，假設在其順應範圍；本圖 Q2 輸出待接，未宣稱已流半毫安。</p>',detail:mosModel},
    {id:'ei-copy',short:'02 各自供電',title:'閘極傳控制，電源供能量。',subtitle:'右側測試源把 Vout 維持 2 V；Q2 是向 0 V 拉電流的 current sink。',look:'圖二：各追一個閉合供電回路；閘極 IG = 0，並非左電荷跨閘極餵右邊。',diagram:mirrorDiagram('ei-copy-svg',true),takeaways:take('輸出飽和檢查','VDS 2 V ≥ VOV 1 V')+take('輸出與耗散','ID2 0.5 mA；PQ2 1 mW'),extra:'<p class="formula-main">兩顆匹配、VGS 相同，且 Q2 在飽和區 → ID2 = Iref。<br>Vout 由測試源設定；換成負載後需重新求工作點。</p>',detail:mosModel+'<p>測試電源正端 → Q2 汲極 → 源極 → 測試電源負端形成回路。左參考電源另有閉合支路；可共用供電系統，不能省略回流。量電流需串接電表，電表負擔電壓也會占用順應餘裕。</p>'},
    {id:'ei-compliance',short:'03 輸出餘裕',title:'電壓餘裕夠，電流才跟得上。',subtitle:'只調 Vout；Iref = 0.5 mA、VGS = 2 V、VOV = 1 V 全部固定。',look:'圖三：依序比較 2、4、0.2、1 V，觀察半毫安平台與三極區 0.18 mA。',diagram:'<div id="ei-mirror-plot">'+mirrorPlot(2)+'</div>',takeaways:take('汲源電壓','<span id="ei-vds">2.0 V</span>')+take('工作區','<span id="ei-region">飽和區</span>')+take('輸出電流','<span id="ei-id">0.500 mA</span>'),extra:'<div class="phase-controls"><label for="ei-vout">Vout（V）<output id="ei-vout-value">2.0 V</output></label><input id="ei-vout" type="range" min="0.2" max="4" step="0.1" value="2"><div class="preset-controls"><button type="button" data-vout="0.2">0.2 V</button><button type="button" data-vout="1">1 V</button><button type="button" data-vout="2">2 V／重設</button><button type="button" data-vout="4">4 V</button></div><p id="ei-compliance-result" role="status"></p></div><p class="formula-main">VDS &lt; 1 V：ID = k(VOV·VDS − VDS²/2)<br>VDS ≥ 1 V：ID = 0.5 mA</p><p class="plot-note">綠線：電流；黃點：目前值；藍虛線：最低輸出 1 V。真器件的 λ 與失配另影響精度。</p>',detail:mosModel+'<p>0.2 V：ID = 0.001(1×0.2−0.2²/2) = 0.00018 A。1 V 的兩分段均得 0.0005 A，邊界連續；2 / 4 V 仍為 0.5 mA。不能把平台延伸成任意高壓都準確。</p>'},
    {id:'ei-tail',short:'04 尾流對半',title:'兩毫安，對稱時各分一毫安。',subtitle:'兩輸入皆 0 V；匹配 NPN、理想尾流、無基極電流、無 Early 效應。',look:'圖四：1 mA + 1 mA = 2 mA；每邊 5 − 1 mA×2 kΩ = 3 V，差動輸出 0 V。',diagram:diffCircuit('ei-tail-svg',0),takeaways:take('各支路電流','IC1 = IC2 = 1 mA')+take('各集極對地','VC1 = VC2 = 3 V')+take('差動輸出','vo = VC1 − VC2 = 0 V'),extra:'<p class="formula-main">vd = v1 − v2；vcm = (v1 + v2)/2<br>集極 3 V &gt; 基極 0 V；基射與尾源順應在本例假設有效。</p><p class="model-note">正負供電經電源系統回流閉合。尾源下端 −5 V；未指定 IS，不把射極電壓硬定成 −0.7 V。</p>',detail:diffModel},
    {id:'ei-steering',short:'05 分流到輸出',title:'左電流增加，左電壓下降。',subtitle:'固定 vd = +1 mV、v1 = +0.5 mV、v2 = −0.5 mV；此圖不隨圖六滑桿改變。',look:'圖五：左 IC 上升、左 VC 下降；vo 左減右為負。差動增益 −gmRC，單端只有一半。',diagram:diffCircuit('ei-steering-svg',.001),takeaways:take('精確差動輸出','−0.07735979 V')+take('跨導 gm','38.68472 mS')+take('差動 / 左單端增益','−77.36944 / −38.68472'),extra:'<p class="formula-main">IC1 = IT/[1 + exp(−vd/VT)]；IC2 = IT − IC1<br>vo = −RC(IC1 − IC2)<br>gm = (IT/2)/VT；小訊號 Ad = −gmRC<br>左單端增量 ΔVC1 ≈ −(gmRC/2)vd</p>',detail:diffModel+'<p>在 vd = 0 附近，tanh(x) ≈ x，所以 vo ≈ −RC·IT·vd/(2VT) = −gmRC·vd。左電流增量是 +gm·vd/2，右邊相反；差動相減得到兩個半份。單端以左集極相對 3 V 的增量定義，不能把其直流 3 V 除以 vd。</p>'},
    {id:'ei-difference',short:'06 精確與局部',title:'小差值像直線，大差值會彎。',subtitle:'只調差模，固定共模 0 V；±50 mV 已非很小的小訊號。',look:'圖六：按 0、1、50、−50 mV；看精確與直線差距，再看下方固定共模示意。',diagram:'<div id="ei-diff-plot">'+diffPlot(0)+'</div>',takeaways:take('左 / 右輸入','<span id="ei-inputs">0 / 0 mV</span>')+take('IC1 / IC2','<span id="ei-currents">1 / 1 mA</span>')+take('VC1 / VC2','<span id="ei-collectors">3 / 3 V</span>')+take('精確 vo','<span id="ei-vo">0 V</span>')+take('局部直線 vo','<span id="ei-linear">0 V</span>'),extra:'<div class="phase-controls"><label for="ei-vd">差模 vd（mV）<output id="ei-vd-value">0 mV</output></label><input id="ei-vd" type="range" min="-50" max="50" step="1" value="0"><div class="preset-controls"><button type="button" data-vd="-50">−50 mV</button><button type="button" data-vd="0">0／重設</button><button type="button" data-vd="1">1 mV</button><button type="button" data-vd="50">50 mV</button></div><p id="ei-difference-result" role="status"></p></div><p class="plot-note">綠實線：匹配指數模型；橘虛線：局部直線；黃點：目前精確值。</p><section class="common-mode"><h4>固定共模示意：vd = 0，不隨上方滑桿改變</h4><div class="common-columns"><p><strong>原先</strong><br>v1 = v2 = 0 V<br>IC1 = IC2 = 1 mA<br>VC1 = VC2 = 3 V</p><p><strong>兩輸入一起升高 0.5 V</strong><br>v1 = v2 = 0.5 V<br>IC1 = IC2 = 1 mA<br>VC1 = VC2 = 3 V</p></div><p>射極跟移 +0.5 V，兩個 VBE 不變。僅在理想尾流、兩顆作用區及尾源順應仍有效時成立；真實共模拒斥能力有限。此處無共模控制。</p></section>',detail:diffModel+'<p>gm = 0.0386847195358 S，Ad = −77.3694390716。vd = 1 mV：精確 vo = −0.077359791853 V，局部值 −0.077369439072 V。vd = 50 mV：精確 −2.989740300727 V，局部 −3.868471953578 V。</p><p>±50 mV 的最低集極電壓為 1.50513 V，對應較高基極也只有 0.025 V，因此集極仍高於基極。曲線彎曲主要來自指數分流，不能直接叫作電晶體飽和。量測需訊號源設定兩輸入，雙通道同參考後作相減；單點相符不能證明所有共模與幅度皆線性。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><p class="figure-scroll-hint" id="${f.id}-scroll-hint"><strong>↔ 左右滑動查看完整圖</strong><span>窄螢幕先顯示左半；鍵盤可用 Tab 聚焦圖框，再按 ← →。</span></p><div class="diagram" tabindex="0" role="region" aria-label="${f.short}，可左右捲動的圖解" aria-describedby="${f.id}-scroll-hint">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function updateMirror(){const raw=Number($('ei-vout').value),v=Math.min(4,Math.max(.2,Number.isFinite(raw)?raw:2));$('ei-vout').value=String(v);$('ei-vout-value').value=`${v.toFixed(1)} V`;$('ei-vds').textContent=`${v.toFixed(1)} V`;$('ei-region').textContent=v<1?'三極區':'飽和區';$('ei-id').textContent=`${(1000*mirrorCurrent(v)).toFixed(3)} mA`;$('ei-mirror-plot').innerHTML=mirrorPlot(v);$('ei-compliance-result').textContent=v<1?`VDS ${v.toFixed(1)} V < VOV 1 V：電壓餘裕不足，改用三極式；ID = ${(1000*mirrorCurrent(v)).toFixed(3)} mA。參考仍 0.5 mA。`:`VDS ${v.toFixed(1)} V ≥ VOV 1 V：符合飽和條件，λ = 0 模型維持 ID = 0.500 mA。${v===1?'邊界兩式相接。':''}`;}
  function updateDifferential(){const raw=Number($('ei-vd').value),mv=Math.min(50,Math.max(-50,Number.isFinite(raw)?raw:0)),r=differential(mv/1000);$('ei-vd').value=String(mv);$('ei-vd-value').value=`${mv} mV`;$('ei-inputs').textContent=`${(mv/2).toFixed(1)} / ${(-mv/2).toFixed(1)} mV`;$('ei-currents').textContent=`${(r.i1*1000).toFixed(6)} / ${(r.i2*1000).toFixed(6)} mA`;$('ei-collectors').textContent=`${r.vc1.toFixed(6)} / ${r.vc2.toFixed(6)} V`;$('ei-vo').textContent=`${r.vo.toFixed(8)} V`;$('ei-linear').textContent=`${r.linear.toFixed(8)} V`;$('ei-diff-plot').innerHTML=diffPlot(mv);const why=mv===0?'兩輸入相同，尾流對半分，差動輸出為零。':mv>0?'左電流增加 → 左集極下降；右側相反，所以左減右輸出為負。':'右電流增加 → 右集極下降；左側相反，所以左減右輸出為正。';$('ei-difference-result').textContent=why+` IC1 + IC2 = ${((r.i1+r.i2)*1000).toFixed(6)} mA；精確與直線相差 ${Math.abs(r.vo-r.linear).toFixed(8)} V。`+(Math.abs(mv)===50?' ±50 mV 已非很小，局部增益不能直接外推。':'')+` 集極皆高於各自基極，基射與尾源有效性仍為模型假設。`;}
  $('ei-vout').addEventListener('input',updateMirror);$('ei-vd').addEventListener('input',updateDifferential);
  document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.vout!==undefined){$('ei-vout').value=b.dataset.vout;updateMirror();}if(b.dataset.vd!==undefined){$('ei-vd').value=b.dataset.vd;updateDifferential();}});
  updateMirror();updateDifferential();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-mirror-diff-v1';
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

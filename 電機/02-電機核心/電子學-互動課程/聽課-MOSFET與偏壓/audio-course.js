(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const line=(x1,y1,x2,y2,cls='axis')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  const arrow=(x1,y1,x2,y2,cls='amber')=>{const a=Math.atan2(y2-y1,x2-x1);return line(x1,y1,x2,y2,cls)+`<path d="M${x2-12*Math.cos(a-.6)} ${y2-12*Math.sin(a-.6)}L${x2} ${y2}L${x2-12*Math.cos(a+.6)} ${y2-12*Math.sin(a+.6)}" class="${cls}"/>`;};
  const svg=(id,title,body,h=430)=>`<svg viewBox="0 0 760 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;
  const k=.001,threshold=2;
  function idCurrent(vgs,vds,vth=threshold){const ov=vgs-vth;if(ov<=0)return 0;return vds<ov?k*(ov*vds-vds*vds/2):k*ov*ov/2;}
  function operating(vg){if(vg<=threshold)return {vg,ov:vg-threshold,vd:10,id:0,region:'截止'};let lo=0,hi=10;for(let n=0;n<64;n++){const v=(lo+hi)/2;if((10-v)/2000>idCurrent(vg,v))lo=v;else hi=v;}const vd=(lo+hi)/2,id=(10-vd)/2000,ov=vg-threshold;return {vg,ov,vd,id,region:vd>=ov-1e-10?'飽和區':'三極區'};}
  const sourceI=(3-Math.sqrt(5))*.001;
  const sourceBias={id:sourceI,vs:sourceI*1000,vgs:3-sourceI*1000,ov:2-sourceI*1000,vd:10-sourceI*2000,vds:10-sourceI*3000};
  const structure=svg('em-structure-svg','增強型NMOS截面：n+源極與汲極置於p型基體，閘極與表面通道由絕緣層隔開；電子由源到汲，傳統電流由汲到源',
    `<rect x="100" y="180" width="560" height="135" rx="12" class="body-fill"/><rect x="120" y="180" width="105" height="75" class="n-fill"/><rect x="535" y="180" width="105" height="75" class="n-fill"/><rect x="225" y="180" width="310" height="13" class="channel-fill"/><rect x="220" y="157" width="320" height="23" class="oxide-fill"/><rect x="220" y="110" width="320" height="40" class="gate-fill"/>`+
    line(380,62,380,110,'wire')+txt(380,44,'閘極 G：正 VGS','blue-fill','middle')+txt(380,140,'金屬閘極','tiny-text','middle')+txt(565,173,'絕緣層','amber-fill')+txt(173,225,'n+','mint-fill','middle')+txt(587,225,'n+','mint-fill','middle')+txt(173,285,'源極 S','','middle')+txt(587,285,'汲極 D','','middle')+txt(380,244,'電子通道','mint-fill','middle')+txt(380,297,'p 型基體 B','blue-fill','middle')+arrow(200,365,560,365,'mint')+txt(380,347,'電子：S → D','mint-fill','middle')+arrow(560,425,200,425,'amber')+txt(380,410,'傳統電流 ID：D → S','amber-fill','middle')+txt(380,485,'示意不按比例；B 與 S 相接，無體效應','tiny-text','middle'),515);
  function characteristic(id,gates=[3],maxX=5,maxI=2.3,load=false,vg=3){
    const x=v=>85+610*v/maxX,y=i=>340-260*i/maxI;
    const path=(fn)=>Array.from({length:401},(_,i)=>{const v=maxX*i/400;return `${i?'L':'M'}${x(v).toFixed(3)} ${y(fn(v)).toFixed(3)}`;}).join(' ');
    let body=txt(85,38,'ID（mA）','muted-text');
    const xs=maxX===5?[0,1,2,3,4,5]:[0,2,4,6,8,10],ys=load?[0,1,2,3,4,5]:maxI<1?[0,.25,.5]:[0,.5,1,1.5,2];
    body+=ys.map(i=>line(85,y(i),695,y(i),'grid')+txt(72,y(i)+7,String(i),'tiny-text','end')).join('')+xs.map(v=>line(x(v),80,x(v),340,'grid')+txt(x(v),376,String(v),'tiny-text','middle')).join('');
    gates.forEach((g,n)=>{const ov=g-threshold,c=load?'curve':g===2?'cutoff':g===4?'gate4':'curve';body+=`<path d="${path(v=>1000*idCurrent(g,v))}" class="${c}"/>`;if(ov>0){body+=line(x(ov),80,x(ov),340,'boundary')+`<circle cx="${x(ov)}" cy="${y(1000*idCurrent(g,ov))}" r="6" class="work-point"/>`;}});
    if(load){const q=operating(vg);body+=`<path d="${path(v=>(10-v)/2)}" class="load-line"/><circle cx="${x(q.vd)}" cy="${y(q.id*1000)}" r="8" class="work-point"/>`;}
    else if(gates.length===1){body+=txt(x(.45),62,'三極區','tiny-text','middle')+txt(x(3),62,'飽和區','tiny-text','middle');}
    else {body+=txt(680,y(2)-15,'VGS 4 V','blue-fill','end')+txt(680,y(.5)-15,'VGS 3 V','mint-fill','end')+txt(680,y(0)-15,'VGS 2 V','tiny-text','end');}
    body+=txt(695,425,'VDS（V）','muted-text','end');
    return svg(id,load?`閘壓${vg}伏特的輸出曲線與負載線交點`:'固定閘源電壓的汲極電流曲線，虛線與點標示三極和飽和分界',body,450);
  }
  function circuit(id,rs=false,vg=3){
    const bottom=rs?495:390;
    let body=`<path d="M130 205V60H480V100M480 165V210H450V230M450 290H480V${rs?340:bottom}M480 ${rs?405:bottom}V${bottom}H130V265M260 325V260H420M260 385V${bottom}" class="wire"/><circle cx="130" cy="235" r="30" class="blue"/><circle cx="260" cy="355" r="30" class="blue"/><rect x="463" y="100" width="34" height="65" class="blue"/>`;
    body+=line(420,230,420,290,'blue')+line(450,230,450,290,'mint')+`<path d="M450 260H475V310H480" class="wire"/>`+arrow(474,260,451,260,'blue');
    if(rs)body+=`<rect x="463" y="340" width="34" height="65" class="blue"/>`+txt(530,380,'RS = 1 kΩ','blue-fill');
    body+=txt(130,229,'+','blue-fill','middle')+txt(130,252,'−','blue-fill','middle')+txt(90,305,'VDD 10 V','blue-fill')+txt(260,349,'+','blue-fill','middle')+txt(260,372,'−','blue-fill','middle')+txt(165,355,`VG ${vg} V`,'blue-fill','middle')+txt(530,143,'RD = 2 kΩ','blue-fill')+txt(390,249,'G','','end')+txt(510,222,'D')+txt(510,320,'S')+arrow(550,230,550,287,'amber')+txt(583,265,'ID','amber-fill')+txt(380,bottom+42,'共同參考 0 V','tiny-text','middle');
    return svg(id,rs?'10伏特供電經2千歐姆、NMOS與1千歐姆源阻閉合；3伏特閘源與基體接法示意':'10伏特供電經2千歐姆、NMOS、接地源極閉合；閘極由獨立3伏特來源設定，兩來源共參考',body,rs?565:485);
  }
  function sourceCompare(){
    const one=(shift,rs)=>{
      const top=55,bottom=410;let s=`<g transform="translate(${shift} 0)"><path d="M45 205V${top}H245V100M245 155V200H220V220M220 270H245V${rs?305:bottom}M245 ${rs?360:bottom}V${bottom}H45V265M120 325V245H195M120 385V${bottom}" class="wire"/><circle cx="45" cy="235" r="30" class="blue"/><circle cx="120" cy="355" r="30" class="blue"/><rect x="230" y="100" width="30" height="55" class="blue"/>`+line(195,220,195,270,'blue')+line(220,220,220,270,'mint')+txt(45,230,'+','blue-fill','middle')+txt(45,252,'−','blue-fill','middle')+txt(120,350,'+','blue-fill','middle')+txt(120,373,'−','blue-fill','middle');
      s+=txt(160,28,rs?'有源極電阻':'源極接 0 V','','middle')+txt(50,110,'10 V','blue-fill','middle')+txt(290,135,'2 kΩ','tiny-text','middle')+txt(98,300,'VG 3 V','tiny-text','middle')+txt(278,211,'D','tiny-text')+txt(278,278,'S','tiny-text')+txt(170,235,'G','tiny-text','end');
      if(rs)s+=`<rect x="230" y="305" width="30" height="55" class="blue"/>`+txt(290,340,'1 kΩ','tiny-text','middle');
      s+=txt(170,455,rs?'VS = 0.764 V':'VS = 0 V','mint-fill','middle')+txt(170,493,rs?'VGS = 2.236 V':'VGS = 3 V','mint-fill','middle')+txt(170,531,rs?'ID = 0.764 mA':'ID = 2 mA','amber-fill','middle')+txt(170,569,rs?'VDS = 7.708 V':'VDS = 6 V','tiny-text','middle')+'</g>';return s;
    };
    return svg('em-compare-svg','相同門檻1伏特：左源極接地，右有1千歐姆源阻。兩電源共參考；兩個模型均無體效應、基體接源極',one(25,false)+one(405,true),605);
  }
  const q=operating(3);
  const values=(prefix,r)=>take('超驅動 VOV',`<span id="${prefix}-ov">${r.ov.toFixed(3)} V</span>`)+take('汲極電流 ID',`<span id="${prefix}-id">${(r.id*1000).toFixed(3)} mA</span>`)+take('汲源電壓 VDS',`<span id="${prefix}-vds">${r.vd.toFixed(3)} V</span>`)+take('工作區',`<span id="${prefix}-region">${r.region}</span>`);
  const formulas='<p>本課 k = μnCoxW/L = 0.001 A/V² = 1 mA/V²，不含二分之一。VOV = VGS − Vth。</p><p class="equation">VOV ≤ 0：ID = 0（忽略次臨界）<br>0 ≤ VDS &lt; VOV：ID = k(VOV·VDS − VDS²/2)<br>VDS ≥ VOV &gt; 0：ID = (k/2)VOV²</p><p>長通道、強反轉的基本分段近似，λ = 0，基體接源極、忽略體效應；真實門檻附近與短通道元件需要更完整模型。</p>';
  const figures=[
    {id:'em-channel',short:'01 電場與通道',title:'隔著絕緣層，仍能建立通道。',subtitle:'正閘源電壓在 p 型表面吸引電子；源極、汲極為 n+ 區。',look:'圖一：找閘極、絕緣層、表面通道；電子S→D，傳統電流D→S。',diagram:structure,takeaways:take('理想直流閘極','IG = 0')+take('電壓改變時','仍需充放閘極電容'),extra:'<p class="model-note">前五圖 Vth = 2 V。VGS 超過門檻，才進入本課的導通模型。</p>',detail:'<p>增強型金氧半場效電晶體（MOSFET）由閘極電場建立反轉通道。以正常基板接法、VDS≥0的NMOS為例，電子由源極到汲極，傳統電流方向相反。閘極理想直流絕緣，並不代表切換時沒有充放電電流，也不代表汲極回路不耗能。</p><p>結構是示意圖，絕緣層厚度與通道長度不按實物比例。截止近似零電流，忽略次臨界電流。</p>'},
    {id:'em-regions',short:'02 工作區',title:'一伏特到邊界，半毫安接上平台。',subtitle:'固定 VGS = 3 V、Vth = 2 V，因此 VOV = 1 V。',look:'圖二：找VDS=1 V的分界，確認曲線連續接到0.5 mA；夾止仍有電流。',diagram:characteristic('em-regions-svg',[3],5,.6),takeaways:take('三極 → 飽和分界','VDS = VOV = 1 V')+take('邊界電流','0.5 mA'),extra:'<p class="formula-main">先看 VGS 是否超過 Vth，再比較 VDS 與 VOV。<br>夾止 ≠ 斷路；MOS 飽和與 BJT 深飽和意義不同。</p>',detail:formulas+'<p>汲端通道夾止後，電子仍被高電場帶入汲極。忽略通道長度調變時，電流對VDS呈平台。邊界代入三極式k(1×1−1²/2)=0.5 mA，與飽和式相同；VDS=0時電流0。</p>'},
    {id:'em-output',short:'03 換整條曲線',title:'閘壓提高，整條曲線改變。',subtitle:'VGS = 2 / 3 / 4 V；k 與 Vth = 2 V 全都固定。',look:'圖三：三伏特在一伏特接平台，四伏特在兩伏特接平台；平台高度與分界一起移動。',diagram:characteristic('em-output-svg',[2,3,4]),takeaways:take('VGS 3 V','VOV 1 V；平台 0.5 mA')+take('VGS 4 V','VOV 2 V；平台 2 mA'),extra:'<p class="model-note">VGS = 2 V 是模型截止邊界，電流取 0；沒有把負超驅動平方當成導通電流。</p>',detail:formulas+'<p>VDS=1.5 V時，VGS=3 V已在飽和區、ID=0.5 mA；VGS=4 V仍在三極區、ID=1.875 mA。提高閘壓同時提高平台與分界；固定汲壓不代表工作區固定。本圖無滑桿。</p>'},
    {id:'em-load',short:'04 固定負載線',title:'回路給一條線，元件給另一條。',subtitle:'固定 VG = 3 V、源極接地；VDD = 10 V，RD = 2 kΩ。',look:'圖四：沿完整汲極供能回路，再找VDS=9 V、ID=0.5 mA的交點；9≥1，飽和假設成立。',diagram:circuit('em-load-circuit')+characteristic('em-load-plot',[3],10,5.2,true,3),takeaways:values('em-fixed',q),extra:'<p class="formula-main">10 V = ID × 2 kΩ + VDS<br>0.5 mA → 電阻掉 1 V → 元件剩 9 V ≥ VOV 1 V</p><p class="plot-note">橘線：負載線；綠線：元件曲線；黃點：工作點。圖四不隨圖五滑桿變動。</p>',detail:formulas+'<p>閘極來源獨立設定VG，兩來源共參考。源極接地故VGS=VG，理想閘極不取直流電流，汲極回路仍由VDD供能。負載線ID=(10−VDS)/2000，端點為(0 V,5 mA)、(10 V,0)。假設飽和求ID後，必須回算VDS並驗區域。</p>'},
    {id:'em-gate',short:'05 調閘極',title:'提高閘壓，也會用掉汲源餘裕。',subtitle:'只改 VG；源極接地、Vth = 2 V、供電與 RD 固定。',look:'圖五：依序按1、3、5 V，看到截止、飽和、三極；5 V時真解4 mA與2 V。',diagram:'<div id="em-gate-plot">'+characteristic('em-gate-svg',[3],10,5.2,true,3)+'</div>',takeaways:values('em-var',q),extra:'<div class="phase-controls"><label for="em-gate-v">閘極 VG（V）<output id="em-gate-value">3.0 V</output></label><input id="em-gate-v" type="range" min="0" max="5" step="0.1" value="3"><div class="preset-controls"><button type="button" data-gate="1">1 V</button><button type="button" data-gate="3">3 V／重設</button><button type="button" data-gate="5">5 V</button></div><p id="em-gate-result" role="status"></p></div><p class="plot-note">橘線：固定負載線；綠線：當前閘壓曲線；黃點：交點；藍虛線：VOV分界。</p>',detail:formulas+'<p>在VDS∈[0,10]用二分法求(10−VDS)/2000=ID(VG,VDS)，先分出VG≤2的截止情況。負載線遞減，元件電流遞增後為平台，交點唯一。</p><p>VG=5 V的飽和候選ID=4.5 mA、VDS=1 V不符合VDS≥3 V，不能接受。三極式與負載線聯立得VDS²−7VDS+10=0，代數根2、5 V；5 V不在三極條件內，排除。真解VDS=2 V、ID=4 mA，電阻壓降8 V。</p>'},
    {id:'em-source-bias',short:'06 源極偏壓',title:'源極自己抬高，閘源差就縮小。',subtitle:'這裡改用 Vth = 1 V；兩個對照電路都使用這個門檻。',look:'圖六：先看Vth=1 V，再比較源極0與0.764 V，以及閘源3與2.236 V；右側飽和重驗成立。',diagram:sourceCompare(),takeaways:take('有 RS：VS / VGS','0.764 / 2.236 V')+take('有 RS：ID / VDS','0.764 mA / 7.708 V')+take('飽和重驗','7.708 V ≥ 1.236 V'),extra:'<p class="threshold-note">本圖另用 Vth = 1 V；前五圖是 2 V。k 仍為 1 mA/V²。</p><p class="mos-summary">電流 ↑ → VS ↑ → VGS = VG − VS ↓ → 電流增加受抑制。<br>固定兩個電路，沒有 RS 滑桿；兩者 B 皆接 S、無體效應。</p>',detail:'<p>固定VDD=10 V、RD=2 kΩ、VG=3 V、Vth=1 V，右圖另有RS=1 kΩ。先假設飽和，令x為ID的毫安數值：x=(2−x)²/2，故x²−6x+4=0，x=3±√5。</p><p>3+√5≈5.236會令VOV=2−x&lt;0，不符合導通前提，排除。物理解ID=(3−√5)mA≈0.763932 mA，VS≈0.763932 V，VGS≈2.236068 V，VOV≈1.236068 V，VD≈8.472136 V，VDS≈7.708204 V。汲極對地VD不可代替汲源差VDS。</p><p>無RS對照用同一門檻：ID=(k/2)(3−1)²=2 mA，VDS=6 V≥2 V。源阻負向調節不是宣稱永不漂移，也不是把電流降低叫作放大。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function updateGate(){const v=Number($('em-gate-v').value),r=operating(v);$('em-gate-value').value=`${v.toFixed(1)} V`;$('em-gate-plot').innerHTML=characteristic('em-gate-svg',[v],10,5.2,true,v);$('em-var-ov').textContent=`${r.ov.toFixed(3)} V`;$('em-var-id').textContent=`${(r.id*1000).toFixed(3)} mA`;$('em-var-vds').textContent=`${r.vd.toFixed(3)} V`;$('em-var-region').textContent=r.region;$('em-gate-result').textContent=r.ov<=0?'VGS ≤ Vth：先走截止分支。ID = 0，VDS = 10 V。':`VDS ${r.vd.toFixed(3)} V ${r.region==='飽和區'?'≥':'<'} VOV ${r.ov.toFixed(3)} V → ${r.region}；回路總壓降 ${(2000*r.id+r.vd).toFixed(3)} V。`;}
  $('em-gate-v').addEventListener('input',updateGate);document.addEventListener('click',event=>{const b=event.target.closest('[data-gate]');if(b){$('em-gate-v').value=b.dataset.gate;updateGate();}});updateGate();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-mos-v1';
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

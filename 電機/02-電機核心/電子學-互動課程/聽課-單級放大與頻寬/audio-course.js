(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden"><defs>'+Object.entries(colors).map(([n,c])=>`<marker id="ed-${n}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('')+'</defs></svg>');
  const line=(a,b,c,d,cls='axis',arrow=false,id='')=>`<line ${id?`id="${id}"`:''} x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${cls}"${arrow?` marker-end="url(#ed-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg=(id,title,body,h=410)=>`<svg viewBox="0 0 600 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;

  const fc=1/(2*Math.PI*10000*10e-9);
  const resistance=(x,y,label)=>`<path d="M${x} ${y}v20l-10 10 20 15-20 15 20 15-20 15 10 10v20" class="wire"/>`+txt(x-20,y+65,label,'small-label','end');
  function physical(id,load=false){
    let b='<path d="M70 210V65H350V90M70 290V430H350V365" class="wire"/><circle cx="70" cy="250" r="40" class="blue"/>'+txt(70,242,'+','blue-fill','middle')+txt(70,275,'−','blue-fill','middle')+txt(115,330,'12 V','blue-fill','middle')+resistance(350,90,'RD 4 kΩ')+line(350,210,350,285,'wire')+line(350,285,350,365,'mint')+line(310,295,310,355,'mint')+'<path d="M310 310H180V320M180 380V430" class="wire"/><circle cx="180" cy="350" r="30" class="blue"/>'+txt(180,345,'+','blue-fill','middle')+txt(180,371,'−','blue-fill','middle')+line(180,430,350,430,'wire')+txt(180,480,'VG = 2 V + vi','small-label','middle')+txt(350,480,'S = 0','small-label')+txt(390,335,'NMOS','small-label')+line(395,100,395,190,'amber',true)+txt(425,150,'ID','amber-fill')+txt(350,42,'VDD','blue-fill','middle')+txt(180,275,'G','blue-fill')+txt(370,265,'D','mint-fill');
    if(load)b+=line(350,245,420,245,'wire')+line(420,220,420,270,'mint')+line(440,220,440,270,'mint')+line(440,245,535,245,'wire')+line(535,245,535,285,'wire')+resistance(535,285,'RL')+line(535,405,535,430,'wire')+line(350,430,535,430,'wire')+txt(445,205,'耦合 C','small-label','middle')+txt(430,540,'DC 隔離 / 中頻近似短路','small-label','middle');
    else b+=line(350,245,535,245,'wire')+txt(535,220,'VDQ = 10 V','small-label','end')+txt(300,540,'vi ↑ → ID ↑ → VD ↓','amber-fill','middle');
    return svg(id,load?'汲極經耦合電容接負載RL，負載下端回參考；電容隔離直流，只在中頻增量近似短路。':'十二伏特供電經四千歐姆電阻與NMOS回源極，閘極為兩伏特偏壓加小訊號，汲極工作點十伏特。',b,570);
  }
  const kcl=svg('ea-kcl-art','輸出節點到交流參考有RD與向下受控電流源，兩支路離開節點為正，vo除RD加gm乘vi等於零。',line(160,80,380,80,'wire')+line(380,80,380,145,'wire')+line(160,80,160,120,'wire')+resistance(160,120,'RD')+line(160,240,160,335,'wire')+line(160,335,380,335,'wire')+line(380,230,380,335,'wire')+'<path d="M380 145L420 188L380 230L340 188Z" class="diamond"/>'+line(380,160,380,216,'mint',true)+txt(440,190,'gm vi','mint-fill')+line(280,80,280,40,'wire')+txt(280,30,'vo','amber-fill','middle')+txt(100,305,'vo / RD','small-label')+txt(300,380,'交流參考：VDD 增量 = 0','small-label','middle')+txt(300,430,'vo/RD + gm vi = 0','amber-fill','middle'),460);
  function wave(id,gain,phase){
    const x=t=>100+430*t,y=v=>210-3*v;
    const path=(amp,ph)=>Array.from({length:181},(_,i)=>`${i?'L':'M'}${x(i/180).toFixed(2)} ${y(amp*Math.cos(2*Math.PI*i/180+ph)).toFixed(2)}`).join('');
    return svg(id,'橫軸當前訊號的一個週期，縱軸共用毫伏特。綠色輸入峰值十毫伏特，橘色輸出包含完整相位。',txt(90,40,'瞬時增量（mV）','small-label')+[-40,0,40].map(v=>line(100,y(v),530,y(v),'grid')+txt(85,y(v)+7,v,'small-label','end')).join('')+[0,.25,.5,.75,1].map(t=>txt(x(t),375,t,'small-label','middle')).join('')+line(100,90,100,330)+`<path d="${path(10,0)}" class="curve"/><path id="${id}-output" d="${path(10*gain,phase)}" class="amber"/>`+txt(530,420,'當前週期比例 t/T','small-label','end'),445);
  }
  const cap=svg('ea-cap-art','來源電壓先經Rs到節點，Cin接該節點到參考，理想負四倍後級讀電容端電壓。下方獨立示意跨接Cgd的米勒輸入等效，不重複接入主電路。','<path d="M70 160V80H140M260 80H370M70 240V310H330V205M330 80V175" class="wire"/><circle cx="70" cy="200" r="40" class="blue"/>'+txt(70,197,'+','blue-fill','middle')+txt(70,227,'−','blue-fill','middle')+'<path d="M140 80h15l10-10 15 20 15-20 15 20 15-20 15 20 10-10h10" class="wire"/>'+txt(200,45,'Rs 10 kΩ','small-label','middle')+line(300,175,360,175,'mint')+line(300,205,360,205,'mint')+txt(365,250,'Cin 10 nF','small-label')+'<rect x="370" y="50" width="150" height="80" rx="10" class="blue"/>'+txt(445,100,'理想 −4','blue-fill','middle')+line(520,80,570,80,'wire')+txt(570,160,'vo','amber-fill','end')+txt(115,280,'vi','blue-fill','middle')+txt(300,355,'一個 RC 分壓 × 反相放大','small-label','middle')+line(80,450,270,450,'wire')+line(270,420,270,480,'mint')+line(295,420,295,480,'mint')+line(295,450,520,450,'wire')+txt(300,405,'跨接電容 Cgd = 2 nF','small-label','middle')+txt(80,505,'輸入 +1 份','blue-fill')+txt(520,505,'輸出 −4 份','amber-fill','end')+txt(300,555,'兩端差 5 份 → 輸入等效約 5Cgd','small-label','middle')+txt(300,600,'下圖只解釋上圖 Cin 的近似來源','small-label','middle'),630);
  function response(id,phase){
    const x=e=>100+430*(e+2)/4,y=v=>phase?90-245*v/90:90+245*(15-v)/45;
    let d='';for(let i=0;i<=160;i++){const e=-2+4*i/160,r=10**e,v=phase?-Math.atan(r)*180/Math.PI:20*Math.log10(4/Math.hypot(1,r));d+=`${i?'L':'M'}${x(e).toFixed(2)} ${y(v).toFixed(2)}`;}
    const ticks=phase?[0,-45,-90]:[12.04,0,-20];
    return svg(id,phase?'相對低頻反相的額外相位，對數頻率比零點零一到一百，截止處負四十五度。':'完整電壓增益分貝，對數頻率比零點零一到一百，低頻十二點零四分貝，截止九點零三分貝。',txt(70,40,phase?'額外相位（°）':'完整增益（dB）','small-label')+ticks.map(v=>line(100,y(v),530,y(v),'grid')+txt(85,y(v)+7,v,'small-label','end')).join('')+[-2,-1,0,1,2].map(e=>line(x(e),90,x(e),335,'grid')+txt(x(e),375,10**e,'small-label','middle')).join('')+line(100,90,100,335)+line(100,335,530,335)+line(x(0),80,x(0),345,'blue dash')+`<path d="${d}" class="${phase?'amber':'curve'}"/>`+txt(530,420,'頻率比 f/fc（對數）','small-label','end'),445);
  }
  const figures=[
    {id:'ea-physical',short:'01 供電與反相',title:'電源供能，閘極控制變動。',subtitle:'先看總量：閘極偏壓 2 V，汲極工作點 10 V，源極 0 V。',diagram:physical('ea-physical-art'),takeaways:take('IDQ','0.5 mA')+take('RD 直流壓降','2 V')+take('VDSQ ≥ Vov','10 V ≥ 1 V'),extra:'<p class="formula-main">VDD 供能 → RD → 汲極 D → 源極 S → 電源回程。<br>vi ↑ → ID ↑ → RD 壓降 ↑ → VD ↓。<br>總 VG = 2 V + vi；總 VD = 10 V + vo。</p>',detail:'<p>共源（common source, CS）：源極是輸入與輸出共同參考。長通道強反轉飽和區，k = 0.001 A/V²，Vth = 1 V，λ = 0，IDQ = ½k(2 − 1)² = 0.5 mA；VDD = 12 V，RD = 4 kΩ。放大能源來自電源，閘極負責控制；理想低頻閘極不消耗導電電流，真實高頻仍需充放電。</p>'},
    {id:'ea-kcl',short:'02 增量與 KCL',title:'兩條支路，算出反相增益。',subtitle:'只保留增量：固定電壓源短路，受控源仍保留。',diagram:kcl,takeaways:take('輸入增量 vi','+10 mV')+take('輸出增量 vo','−40 mV')+take('總輸出 VD','約 9.96 V'),extra:'<p class="formula-main">vo / RD + gm vi = 0<br>Av = vo / vi = −gm RD = −4，gm = 1 mS。<br>交流參考不是拔掉實體供電；負增量不是負總電壓。</p>',detail:'<p>KCL：Kirchhoff’s current law，克希荷夫電流定律；兩支路電流先以離開節點為正。vi 正時受控源向下，電阻支路增量實際向上，所以 vo 為負。完整平方律在 vi = 10 mV 時 ΔID = 10.05 μA，vo = −40.2 mV，與一次近似相差 0.2 mV；本圖採小訊號線性值。</p>'},
    {id:'ea-load',short:'03 負載實驗',title:'接上負載，電壓起伏變小。',subtitle:'耦合電容隔離 DC；中頻理想短路。固定輸入峰值 10 mV。',diagram:physical('ea-loaded-art',true)+wave('ea-loadwave',8/3,-Math.PI),takeaways:take('RD ∥ RL','<span id="ea-parallel"></span>')+take('電壓增益 Av','<span id="ea-gain"></span>')+take('輸出峰值','<span id="ea-loadpeak"></span>'),extra:'<div class="diagram-legend"><span class="legend-mint">綠：輸入 vi，10 mV 峰值</span><span class="legend-amber">橘：負載輸出，與輸入共用 mV 軸</span></div><div class="phase-controls"><label for="ea-rl">負載 RL <output id="ea-rl-out"></output></label><input id="ea-rl" type="range" min="2" max="20" step="1" value="8"><div class="preset-controls"><button type="button" data-rl="2">2 kΩ</button><button type="button" data-rl="8">8 kΩ</button><button type="button" data-rl="20">20 kΩ</button></div><p id="ea-load-why" aria-live="polite"></p></div><p class="formula-main">Av = −gm (RD ∥ RL)<br>並聯電阻 = RD × RL / (RD + RL)。<br>直流偏壓不變；若省掉耦合電容，必須重新求偏壓。</p>',detail:'<p>RL = 2 / 8 / 20 kΩ 時，Av = −1.333333 / −2.666667 / −3.333333。圖中正弦只代表中頻同頻反相，未指定實際耦合電容量或秒尺度。負載較重指 RL 較小；電壓增益下降不代表不能向負載傳能。此互動沒有模擬削波、耦合電容低頻截止或元件轉區。</p>'},
    {id:'ea-capacitor',short:'04 電容與米勒',title:'輸入電容先分走訊號。',subtitle:'獨立簡化模型：Rs = 10 kΩ、Cin = 10 nF、低頻增益 −4。',diagram:cap,takeaways:take('低頻電容阻抗大','後級輸入接近 vi')+take('高頻電容阻抗小','後級輸入變小')+take('RC 時間常數','100 μs'),extra:'<p class="formula-main">H(f) = −4 / (1 + j f/fc)<br>fc = 1/(2π Rs Cin) ≈ 1591.549 Hz。<br>米勒（Miller）近似：Cgd = 2 nF，Av ≈ −4 → Cin ≈ 5Cgd = 10 nF。</p><p class="power-note">主極點近似，忽略其他電容與輸出極點；下方跨接電容示意不再加進上方電路。第二堂不沿用圖三的負載值。</p>',detail:'<p>米勒效應由輸入端電流 i = Cgd d(vi − vo)/dt 看出：低頻 vo ≈ −4vi，所以兩端差約 5vi，等效輸入電容約 5Cgd。這是固定低頻增益估計；不能將頻變 H 隨意當成常數電容的精確解。輸入源經 Rs 後才接 Cin，理想負四倍後級視為不再負載 RC 節點。</p>'},
    {id:'ea-response',short:'05 幅值與相位',title:'一個轉折，兩種連續變化。',subtitle:'橫軸每格十倍頻率；藍虛線為 fc。下圖只畫額外相位。',diagram:response('ea-db',false)+response('ea-phase',true),takeaways:take('低頻增益','12.0412 dB')+take('fc 增益 / 相對下降','9.0309 / −3.0103 dB')+take('fc 額外相位','−45°'),extra:'<p class="formula-main">|H| = 4 / √[1 + (f/fc)²]<br>完整增益 dB = 20 log₁₀ |H|。<br>額外相位 = −atan(f/fc)；完整展開相位 = −180° − atan(f/fc)。</p>',detail:'<p>截止時 |H| = 2.828427，仍有電壓放大。−3 dB 是相對低頻平台的振幅下降，不是輸入電容耗散一半功率；理想電容平均有功功率為零。高頻單極點漸近斜率為 −20 dB/decade（頻率每十倍下降約 20 dB），額外相位趨近 −90°。</p>'},
    {id:'ea-frequency',short:'06 頻率實驗',title:'頻率越高，留給後級的訊號越少。',subtitle:'輸入峰值固定 10 mV；輸出波形已含原有反相與額外落後。',diagram:wave('ea-frequencywave',4/Math.sqrt(2),-Math.PI-Math.PI/4),takeaways:take('頻率 f / 週期 T','<span id="ea-frequency-value"></span>')+take('|H| / 輸出峰值','<span id="ea-frequency-gain"></span>')+take('額外 / 完整展開相位','<span id="ea-frequency-phase"></span>'),extra:'<div class="diagram-legend"><span class="legend-mint">綠：輸入 10 mV 峰值</span><span class="legend-amber">橘：輸出；共用 mV 軸</span></div><div class="phase-controls"><label for="ea-ratio">頻率比 f/fc <output id="ea-ratio-out"></output></label><input id="ea-ratio" type="range" min="-1" max="1" step="0.05" value="0"><div class="preset-controls"><button type="button" data-ratio="-1">0.1 fc</button><button type="button" data-ratio="0">1 fc</button><button type="button" data-ratio="1">10 fc</button></div><p id="ea-frequency-why" aria-live="polite"></p></div><p class="formula-main">vi = 10 mV cos(2πt/T)<br>vo = 10 mV × |H| cos[2πt/T − π − atan(f/fc)]。<br>橫軸各為當前頻率的一週期，不是固定秒軸。</p>',detail:'<p>滑桿值是 log₁₀(f/fc)，實際頻率比為 10 的滑桿次方。0.1 / 1 / 10 fc 對應 |H| = 3.980149 / 2.828427 / 0.398015，額外相位 −5.7106° / −45° / −84.2894°。示波器與訊號產生器可量小訊號掃頻；真實探棒電容、儀器頻寬與大訊號速度限制需要另行檢查，本頁沒有實物量測。</p>'}
  ];
  figures.forEach((f,i)=>f.look=`看圖${['一','二','三','四','五','六'][i]}：${f.subtitle} 看完再繼續。`);
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});

  function setWave(id,gain,phase){let d='';for(let i=0;i<=180;i++){const t=i/180;d+=`${i?'L':'M'}${(100+430*t).toFixed(2)} ${(210-30*gain*Math.cos(2*Math.PI*t+phase)).toFixed(2)}`;}$(id+'-output').setAttribute('d',d);}
  function updateLoad(){const r=Number($('ea-rl').value),parallel=4*r/(4+r),av=-parallel;$('ea-rl-out').value=`${r.toFixed(0)} kΩ`;$('ea-parallel').textContent=`${parallel.toFixed(6)} kΩ`;$('ea-gain').textContent=av.toFixed(6);$('ea-loadpeak').textContent=`${(-av*10).toFixed(4)} mV`;setWave('ea-loadwave',-av,-Math.PI);$('ea-load-why').textContent=`RL = ${r} kΩ，並聯電阻 ${parallel.toFixed(3)} kΩ。${r<8?'負載較重，並聯電阻下降，同一跨導電流只形成較小電壓。':r>8?'負載較輕，並聯電阻提高，增益大小向空載 4 靠近。':'預設八千歐姆負載把增益由空載 −4 降為 −2.666667。'} 耦合電容隔離 DC，工作點仍為 10 V。`;}
  function updateFrequency(){const ratio=10**Number($('ea-ratio').value),frequency=fc*ratio,gain=4/Math.hypot(1,ratio),extra=-Math.atan(ratio)*180/Math.PI;$('ea-ratio-out').value=`${ratio.toFixed(4)} fc`;$('ea-frequency-value').textContent=`${frequency.toFixed(3)} Hz / ${(1000/frequency).toFixed(4)} ms`;$('ea-frequency-gain').textContent=`${gain.toFixed(6)} / ${(10*gain).toFixed(4)} mV`;$('ea-frequency-phase').textContent=`${extra.toFixed(4)}° / ${(-180+extra).toFixed(4)}°`;setWave('ea-frequencywave',gain,-Math.PI-Math.atan(ratio));$('ea-frequency-why').textContent=ratio<1?'頻率低於截止：電容阻抗較大，來源電阻上的分壓較小，增益接近低頻 4 倍；額外相位仍不等於零。':ratio>1?'頻率高於截止：電容阻抗下降，留給後級的電壓更小，額外相位逐漸靠近 −90°。完整波形仍含低頻反相。':'截止位置：|H| = 2.828427，比低頻下降 3.0103 dB，仍在放大；額外 −45°，完整展開相位 −225°。';}
  $('ea-rl').addEventListener('input',updateLoad);document.querySelectorAll('[data-rl]').forEach(b=>b.addEventListener('click',()=>{$('ea-rl').value=b.dataset.rl;updateLoad();}));
  $('ea-ratio').addEventListener('input',updateFrequency);document.querySelectorAll('[data-ratio]').forEach(b=>b.addEventListener('click',()=>{$('ea-ratio').value=b.dataset.ratio;updateFrequency();}));updateLoad();updateFrequency();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-amplifier-v1';
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

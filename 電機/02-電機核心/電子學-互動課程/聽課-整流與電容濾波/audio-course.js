(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const line=(x1,y1,x2,y2,cls='axis')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  const svg=(id,title,body,h=430)=>`<svg viewBox="0 0 760 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;
  const available=t=>Math.max(12*Math.abs(Math.sin(2*Math.PI*50*t))-1.4,0);
  // Peak-to-peak periodic map: starting at the exact 10.6 V peak erases startup.
  // 2 microseconds × 5000 steps = one 10 ms period, then repeat for display.
  // Every peak pins the same value, so this is the periodic fixed point, not a warmup guess.
  function steady(uF,steps=5000){
    const dt=.01/steps,decay=Math.exp(-dt/(1000*uF*1e-6));
    let v=10.6,sum=0,min=v;const values=[v],on=[true];
    for(let i=1;i<=steps;i++){
      const supply=available(.005+i*dt),free=v*decay,next=Math.max(supply,free);
      sum+=(v+next)*.5;v=next;values.push(v);on.push(supply>=free);min=Math.min(min,v);
    }
    const avg=sum/steps;return {values,on,steps,min,max:10.6,avg,pp:10.6-min,approx:avg/1000/(100*uF*1e-6)};
  }
  const wavePath=(values,x,y)=>values.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(' ');
  function basePlot(id,title,values,lo,hi,ticks,extra=''){
    const x=i=>92+610*i/(values.length-1),y=v=>330-245*(v-lo)/(hi-lo);
    return svg(id,title,txt(92,35,'電壓（V）','muted-text')+ticks.map(v=>line(92,y(v),702,y(v),'grid')+txt(80,y(v)+7,String(v),'tiny-text','end')).join('')+[0,10,20,30,40].map(t=>line(92+610*t/40,85,92+610*t/40,330,'grid')+txt(92+610*t/40,365,t,'tiny-text','middle')).join('')+extra+`<path d="${wavePath(values,x,y)}" class="curve"/>`+txt(702,415,'時間（ms）','muted-text','end'));
  }
  function rawWave(id,rectified=false){const vals=Array.from({length:801},(_,i)=>rectified?available(i*.04/800):12*Math.sin(2*Math.PI*50*i*.04/800));return basePlot(id,rectified?'無電容全橋輸出，40毫秒內有4個正向脈動':'50赫茲輸入正弦，峰值正負12伏特',vals,rectified?0:-12,12,rectified?[0,6,12]:[-12,0,12]);}
  function ripplePlot(id,r){
    const lo=Math.floor((r.min-Math.max(.02,r.pp*.15))*100)/100,hi=10.62;
    const x=t=>92+610*t/40,y=v=>330-245*(v-lo)/(hi-lo);
    const vals=Array.from({length:2001},(_,i)=>r.values[Math.round((i%500)/500*r.steps)]);
    const bars=[];let start=null;
    for(let i=0;i<=2000;i++){
      const conducting=r.on[Math.round((i%500)/500*r.steps)];
      if(conducting&&start===null)start=i;
      if((!conducting||i===2000)&&start!==null){bars.push(`<rect x="${x(start*.02)}" y="85" width="${Math.max(.6,x(i*.02)-x(start*.02))}" height="245" class="conduction"/>`);start=null;}
    }
    return basePlot(id,'電容穩態電壓局部放大，淡色區為橋導通；從來源峰頂起算40毫秒',vals,lo,hi,[lo,Number(((lo+10.6)/2).toFixed(2)),10.6],bars.join('')+line(92,y(r.avg),702,y(r.avg),'mean'));
  }
  function diode(x1,y1,x2,y2,active){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),a=Math.atan2(dy,dx)*180/Math.PI;
    return `<g transform="translate(${(x1+x2)/2} ${(y1+y2)/2}) rotate(${a})"><path d="M${-len/2} 0H-16M13 0H${len/2}" class="${active?'amber':'wire'}"/><path d="M-16 -13L8 0L-16 13ZM13 -17V17" class="diode ${active?'active-diode':''}"/></g>`;
  }
  function bridgeDiagram(id,mode='positive',storage=false){
    const charge=mode!=='discharge',positive=mode!=='negative',loadX=storage?690:650,capX=575;
    const route=positive?`M140 220L320 70H${loadX}V370H320L500 220H140`:`M500 220L320 70H${loadX}V370H320L140 220H500`;
    let body=charge?`<path d="${route}" class="route"/>`:'';
    if(storage)body+=`<path d="${charge?`M320 70H${capX}V370H320`:`M${capX} 70H${loadX}V370H${capX}Z`}" class="route"/>`;
    body+=`<path d="M320 70H${loadX}V175M${loadX} 265V370H320M140 220H285M355 220H500" class="wire"/><circle cx="320" cy="220" r="35" class="blue"/>`+txt(320,229,'~','blue-fill','middle')+txt(320,280,'交流來源','tiny-text','middle');
    body+=diode(140,220,320,70,charge&&positive)+diode(500,220,320,70,charge&&!positive)+diode(320,370,140,220,charge&&!positive)+diode(320,370,500,220,charge&&positive);
    body+=`<rect x="${loadX-16}" y="175" width="32" height="90" class="blue"/>`+txt(loadX,153,'R','blue-fill','middle')+txt(loadX,302,'1 kΩ','tiny-text','middle');
    body+=`<path d="M${loadX+38} 180V245m-8-10 8 10 8-10" class="amber"/>`;
    if(storage){body+=`<path d="M${capX} 70V205M${capX} 232V370" class="wire"/>`+line(capX-25,205,capX+25,205,'mint')+line(capX-25,232,capX+25,232,'mint')+txt(capX,170,'C','mint-fill','middle')+txt(capX-38,201,'+','mint-fill','middle')+txt(capX-38,250,'−','mint-fill','middle');body+=`<path d="M${capX+38} ${charge?180:265}V${charge?265:180}m-8 ${charge?-10:10} 8 ${charge?10:-10} 8 ${charge?-10:10}" class="mint"/>`;}
    body+=[[140,220,'A',-25,8],[500,220,'B',25,8],[320,70,'P ＋',0,-22],[320,370,'N −',0,38]].map(([x,y,label,dx,dy])=>`<circle cx="${x}" cy="${y}" r="5" class="node"/>`+txt(x+dx,y+dy,label,'',dx<0?'end':dx>0?'start':'middle')).join('');
    body+=txt(190,126,'D_AP','small-diode-label','middle')+txt(452,126,'D_BP','small-diode-label','middle')+txt(190,335,'D_NA','small-diode-label','middle')+txt(452,335,'D_NB','small-diode-label','middle');
    body+=txt(380,467,storage?(charge?'補電：來源同時供應 C 與 R':'放電：C → R → C；橋截止'):(positive?'A 較高：A → P → R → N → B → 來源 → A':'B 較高：B → P → R → N → A → 來源 → B'),'tiny-text','middle');
    return svg(id,storage?'電容與負載並聯，切換補電或放電的閉合路徑':'四顆二極體方向為A到P、B到P、N到A、N到B；負載P到N，來源跨A與B',body,500);
  }
  const controls=(kind,buttons)=>`<div class="phase-controls"><div class="preset-controls">${buttons.map(([value,title])=>`<button type="button" data-${kind}="${value}" aria-pressed="${value===buttons[0][0]}">${title}</button>`).join('')}</div><p id="${kind}-status" class="route-output" role="status"></p></div>`;
  const stats=(prefix,r)=>take('最高 Vmax',`<span id="${prefix}-max">${r.max.toFixed(4)} V</span>`)+take('最低 Vmin',`<span id="${prefix}-min">${r.min.toFixed(4)} V</span>`)+take('平均 Vavg',`<span id="${prefix}-avg">${r.avg.toFixed(4)} V</span>`)+take('峰對峰 ΔVpp',`<span id="${prefix}-pp">${r.pp.toFixed(4)} V</span>`);
  const fixed=steady(1000);
  const modelDetail='<p>理想零源阻抗、恆壓降橋、固定電阻負載。每步先自由放電，再與來源扣壓降比較：v[n] = max(max(|vs[n]| − 1.4, 0), v[n−1] exp(−Δt/RC))。以每個來源峰頂10.6 V為起點，算一個10 ms週期；終點回到相同峰值，故直接得到週期固定點，不把啟動充電混入圖。</p><p>步長2 μs，平均值由週期梯形積分取得。展示四個週期，時間零對應原來源的5 ms峰頂；圖上導通區是此離散模型的判定。沒有計算真實充電電流、二極體恢復、來源與電容內阻。此模型只用來觀察穩態輸出電壓。</p>';
  const figures=[
    {id:'er-input',short:'01 輸入',title:'來源每二十毫秒重複一次。',subtitle:'甲端 A 相對乙端 B 的電壓；12 V 是峰值。',look:'圖一：找正負12 V與20 ms一個完整週期；負半週代表B高於A。',diagram:rawWave('er-input-plot'),takeaways:take('峰值 / 有效值','12 / 8.485 V')+take('來源頻率 / 週期','50 Hz / 20 ms'),detail:'<p>vs(t) = vA − vB = 12 sin(2π50t) V。輸入峰對峰24 V，整週平均0 V。純正弦有效值12/√2 ≈ 8.485 V；有效值比較電阻發熱，不能拿來代替整流後的直流平均。</p>'},
    {id:'er-bridge',short:'02 兩條回路',title:'兩條路，負載同一方向。',subtitle:'圖示選在壓差足以導通的時刻；靠近零點時橋會截止。',look:'圖二：切正負半週，沿高亮走到來源再回出發端；負載箭頭一直P→N。',diagram:'<div id="er-bridge-diagram">'+bridgeDiagram('er-bridge-svg')+'</div>',extra:controls('er-half',[['positive','正半週：A 較高'],['negative','負半週：B 較高']]),takeaways:take('每條通路','2 顆 × 0.7 V')+take('負載方向','P → R → N'),detail:'<p>二極體橫線側是陰極。固定接向：D_AP為A→P；D_BP為B→P；D_NA為N→A；D_NB為N→B。來源直接跨A與B，沒有接到輸出N。正半週D_AP與D_NB導通；負半週D_BP與D_NA導通。另兩顆截止。</p><p>只切換高亮，不改來源頻率。圖上箭頭採傳統電流方向。恆壓降模型下，無電容時|vs|≤1.4 V沒有負載電流。</p>'},
    {id:'er-rectified',short:'03 單向脈動',title:'沒有電容，低谷仍回到零。',subtitle:'固定 R = 1 kΩ；只畫輸出電壓，不混入濾波波形。',look:'圖三：相鄰峰相隔10 ms，峰值10.6 V，平均約6.29 V；單向仍會起伏。',diagram:rawWave('er-output-plot',true),takeaways:take('輸出峰值','10.6 V')+take('脈動頻率','100 Hz')+take('輸出平均','6.2915 V'),extra:'<p class="formula-main">vo = max(|vs| − 1.4, 0)<br>峰值 ≠ 平均值 ≠ 有效值</p>',detail:'<p>無電容平均值取一個完整脈動週期的面積除以10 ms。設α = asin(1.4/12)，平均為[24cosα − 1.4(π − 2α)]/π ≈ 6.291487 V。細分時間、把voΔt相加再除以週期，可獨立重驗。</p><p>有效值應計算√平均(vo²)，本例約7.2471 V，不能用輸入有效值減1.4。負載電流io = vo/1000，峰值10.6 mA。全波表示兩半週都形成同極性輸出，不表示能量憑空翻倍。</p>'},
    {id:'er-storage',short:'04 補電 / 放電',title:'補電與放電，各有一圈。',subtitle:'C 與 R 並聯：同一對 P、N 節點，同一個輸出電壓。',look:'圖四：先確認C與R並聯；切補電與放電，後者只沿C與R閉合，負載仍向下。',diagram:'<div id="er-storage-diagram">'+bridgeDiagram('er-storage-svg','charge',true)+'</div>',extra:controls('er-mode',[['charge','補電：來源接手'],['discharge','放電：電容接手']]),takeaways:take('補電條件','|vs| > vC + 1.4 V')+take('橋截止時','C 經 R 放電'),detail:'<p>補電圖取正半週代表：A→D_AP→P，在P分成C與R兩支，於N匯合，再經D_NB→B→來源→A。負半週換D_BP與D_NA。電容正端在P，負端在N。</p><p>放電：C正端→R上端→R下端→C負端，與橋無關。進入電容正端的電流為正，所以放電時iC = C dvC/dt = −vC/R。負載方向仍P→N。</p>'},
    {id:'er-ripple',short:'05 固定漣波',title:'橋休息時，電容仍在供電。',subtitle:'固定 C = 1000 μF、R = 1 kΩ；縱軸局部放大，下緣不是零。',look:'圖五：先讀縱軸，再看淡色導通帶以外的下降段；峰頂仍每10 ms重複。',diagram:ripplePlot('er-fixed-plot',fixed),takeaways:stats('er-fixed',fixed),extra:'<p class="plot-note">綠線：輸出電壓　橘虛線：時間平均　淡橘區：橋導通<br>時間零取穩態的來源峰頂；此圖不隨圖六滑桿改動。</p><p class="model-note">零源阻抗的穩態電壓模型；導通區不表示真實充電電流大小。</p>',detail:modelDetail},
    {id:'er-capacitance',short:'06 改電容量',title:'同樣十毫秒，電容越大掉得越少。',subtitle:'先猜最低值往哪裡移，再按 100、1000、2000 μF 比較。',look:'圖六：按三個電容快捷值，從數字確認電容越大、最低值越高、漣波越小；最後回1000 μF。',diagram:'<div id="er-variable-plot">'+ripplePlot('er-variable-svg',fixed)+'</div>',takeaways:stats('er-var',fixed),extra:'<div class="phase-controls"><label for="er-cap-uF">電容量 C（μF）<output id="er-cap-value">1000 μF</output></label><input id="er-cap-uF" type="range" min="100" max="2000" step="100" value="1000"><div class="preset-controls"><button type="button" data-cap="100">100 μF</button><button type="button" data-cap="1000">1000 μF／重設</button><button type="button" data-cap="2000">2000 μF</button></div><p id="er-cap-result" role="status"></p></div><p class="model-note">小漣波近似：ΔV ≈ Iavg / (100 C)，Iavg = Vavg / 1000<br>近似估計：<strong id="er-approx">—</strong>；與圖下模型漣波分開比較。</p><p class="plot-note">局部縱軸會隨電容量調整，請以伏特刻度與讀值比較。R 固定 1 kΩ，沒有電阻控制。</p>',detail:modelDetail+'<p>小漣波近似把負載電流視為近似固定，並把放電時間視為10 ms。來源峰頂、負載與頻率都固定，C增大使ΔQ/C下降。電阻較小代表重負載，空檔取走更多電荷、漣波較大；本互動不改電阻。有限電容與非零負載仍有漣波。</p>'}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function setHalf(mode){$('er-bridge-diagram').innerHTML=bridgeDiagram('er-bridge-svg',mode);document.querySelectorAll('[data-er-half]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.erHalf===mode)));$('er-half-status').textContent=mode==='positive'?'A → D_AP → P → R → N → D_NB → B → 來源 → A':'B → D_BP → P → R → N → D_NA → A → 來源 → B';}
  function setMode(mode){$('er-storage-diagram').innerHTML=bridgeDiagram('er-storage-svg',mode,true);document.querySelectorAll('[data-er-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.erMode===mode)));$('er-mode-status').textContent=mode==='charge'?'來源經兩顆二極體供應負載，也把電荷送進電容正端。':'橋截止；電容正端 → 負載 → 電容負端。負載仍有同方向電流。';}
  function updateCap(){const c=Number($('er-cap-uF').value),r=steady(c);$('er-cap-value').value=`${c} μF`;$('er-variable-plot').innerHTML=ripplePlot('er-variable-svg',r);for(const key of ['max','min','avg','pp'])$(`er-var-${key}`).textContent=`${r[key].toFixed(4)} V`;$('er-approx').textContent=`${r.approx.toFixed(4)} V`;$('er-cap-result').textContent=`C = ${c} μF，最低 ${r.min.toFixed(4)} V；模型漣波 ${r.pp.toFixed(4)} V。電容較大，空檔掉壓較少；最高值仍10.6 V。`;}
  document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.erHalf)setHalf(b.dataset.erHalf);if(b.dataset.erMode)setMode(b.dataset.erMode);if(b.dataset.cap){$('er-cap-uF').value=b.dataset.cap;updateCap();}});
  $('er-cap-uF').addEventListener('input',updateCap);setHalf('positive');setMode('charge');updateCap();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-rectifier-v1';
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

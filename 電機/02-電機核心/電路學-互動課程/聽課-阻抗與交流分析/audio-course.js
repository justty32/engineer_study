(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const defs = `<defs><marker id="mint-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#78e2ca"/></marker><marker id="amber-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#ffc67b"/></marker><marker id="blue-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#8db8ff"/></marker></defs>`;
  const line = (x1,y1,x2,y2,cls='axis',arrow=false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${arrow ? ` marker-end="url(#${cls.split(' ')[0]}-arrow)"` : ''}/>`;
  const txt = (x,y,t,cls='',anchor='start') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg = (id,title,body,height=370) => `<svg viewBox="0 0 680 ${height}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take = (label,value) => `<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">${defs}</svg>`);
  const wavePath = (fn,x,y,start,end,n=420) => Array.from({length:n+1},(_,i)=>{const t=start+(end-start)*i/n;return `${i?'L':'M'}${x(t).toFixed(2)} ${y(fn(t)).toFixed(2)}`;}).join(' ');
  const dx=t=>100+(t+.25)*416,dy=v=>235-100*v;
  const derivativeDiagram = [-.25,0,.25,.5,.75,1].map(t=>line(dx(t),100,dx(t),355,'grid')).join('')
    +[-1,0,1].map(v=>line(70,dy(v),635,dy(v),v===0?'axis':'grid')+txt(55,dy(v)+8,v,'muted-text','end')).join('')
    + `<path d="${wavePath(t=>Math.cos(2*Math.PI*t),dx,dy,-.25,1)}" class="amber"/><path d="${wavePath(t=>-Math.sin(2*Math.PI*t),dx,dy,-.25,1)}" class="mint dash"/>`
    +txt(630,55,'歸一化振幅','muted-text','end')+txt(dx(0),392,'0','muted-text','middle')+txt(dx(.5),392,'T/2','muted-text','middle')+txt(dx(1),392,'T','muted-text','middle')+txt(630,430,'時間 →','muted-text','end')
    +line(dx(-.25),90,dx(0),90,'mint')+txt(150,72,'提早 T/4','mint-fill','middle');
  const timeX=t=>85+(t+2)*60;
  const voltageY=v=>210-v*10,currentY=v=>490-v*1.05;
  const timeGrid=(top,bottom)=>[0,2,4,6].map(t=>line(timeX(t),top,timeX(t),bottom,'grid')).join('');
  const rcWaveDiagram = timeGrid(75,325)+timeGrid(385,590)
    +[-10,0,10].map(v=>line(85,voltageY(v),625,voltageY(v),v===0?'axis':'grid')+txt(65,voltageY(v)+8,v,'muted-text','end')).join('')
    +[-70.71,0,70.71].map(v=>line(85,currentY(v),625,currentY(v),v===0?'axis':'grid')).join('')
    + `<path d="${wavePath(t=>10*Math.cos(t),timeX,voltageY,-2,7)}" class="blue"/><path d="${wavePath(t=>Math.SQRT1_2*10*Math.cos(t+Math.PI/4),timeX,voltageY,-2,7)}" class="amber"/><path d="${wavePath(t=>Math.SQRT1_2*10*Math.cos(t-Math.PI/4),timeX,voltageY,-2,7)}" class="mint dash"/><path d="${wavePath(t=>Math.SQRT1_2*100*Math.cos(t+Math.PI/4),timeX,currentY,-2,7)}" class="amber"/>`
    +txt(85,45,'電壓（V）','muted-text')+txt(85,370,'電流（mA）｜獨立刻度','muted-text')+txt(75,currentY(70.71)+8,'70.7','tiny-text','end')+txt(65,498,'0','tiny-text','end')+txt(75,currentY(-70.71)+8,'−70.7','tiny-text','end')
    +[0,2,4,6].map(t=>txt(timeX(t),625,t,'muted-text','middle')).join('')+txt(625,665,'時間（ms）→','muted-text','end')
    +line(timeX(0),70,timeX(0),590,'blue dash');
  const figures = [
    {id:'derivative-wave',short:'01 微分與轉向',title:'微分，讓弦波提早四分之一週。',subtitle:'先把大小除以 ω，只看微分前後的相位。',look:'看圖一：綠色微分波的正峰值，比橘色原波提早四分之一週；原波到峰頂時，斜率是零。',diagram:svg('derivative-wave','原波 cos(ωt) 與歸一化微分 cos(ωt+90°)，微分波超前四分之一週',derivativeDiagram,455),extra:`<div class="diagram-legend"><span class="legend-amber">橘實線：原波 cos(ωt)</span><span class="legend-mint">綠虛線：微分後 ÷ ω</span></div>`,takeaways:take('微分後的大小','乘上 ω')+take('微分後的相位','加上 90°'),detail:`<p>斜率是「這一刻變得多快」。原波向上爬，微分為正；峰頂瞬間變平，微分為零；向下走時，微分為負。</p><p class="equation">d[A cos(ωt + φ)] / dt<br>= −ωA sin(ωt + φ)<br>= ωA cos(ωt + φ + 90°)</p><p>以同頻餘弦相量表示，微分等同乘上 jω：ω 縮放大小，j 逆時針轉 90°。圖中除去 ω，兩波才有相同的歸一化振幅；實際微分的物理單位也會改變。</p>`},
    {id:'impedance-map',short:'02 阻抗方向',title:'同一個比例，帶著三種方向。',subtitle:'Z = V / I；角度描述「電壓相對電流」。',look:'看圖二：電阻向右，電感向上，電容向下；這是阻抗方向，還不是電流相位。',diagram:svg('impedance-map','阻抗複平面：電阻正實軸、電感正虛軸、電容負虛軸；各大小 100 歐姆',`${line(90,260,605,260)}${line(300,460,300,60)}${line(300,260,470,260,'amber',true)}${line(300,260,300,90,'blue',true)}${line(300,260,300,430,'mint',true)}${txt(470,245,'R','amber-fill')}${txt(330,95,'jωL','blue-fill')}${txt(330,430,'−j/(ωC)','mint-fill')}${txt(615,295,'Re（Ω）','muted-text','end')}${txt(300,35,'Im（Ω）','muted-text','middle')}${txt(275,290,'0','muted-text','end')}${txt(80,120,'L：+90°','blue-fill')}${txt(80,408,'C：−90°','mint-fill')}${txt(430,320,'R：0°','amber-fill')}`,495),takeaways:take('電感：電壓超前電流','Zₗ = jωL')+take('電容：電壓落後電流','Zc = 1/(jωC)'),detail:`<p>阻抗（impedance）是同頻穩態下的電壓相量除以電流相量。它的角度是 φᵥ − φᵢ。此圖以 R = 100 Ω、L = 0.1 H、C = 10 μF、ω = 1000 rad/s 各別比較，三個箭頭都是 100 Ω，並未把它們接成某個 RLC 網路。阻抗箭頭描述複數比例，本身不隨時間旋轉。</p><p class="equation">vᵣ = Ri → Zᵣ = R<br>vₗ = L di/dt → Zₗ = jωL<br>ic = C dv/dt → I = jωCV<br>Zc = V/I = 1/(jωC) = −j/(ωC)</p><p>1/j = −j，因為 j(−j) = 1。電容公式的負角，來自除以 j；若改問電流相對電壓，則電容電流超前 90°。</p>`},
    {id:'frequency-effect',short:'03 頻率的影響',title:'頻率加倍，一個變大，一個變小。',subtitle:'固定 R = 100 Ω、L = 0.1 H、C = 10 μF。只比較各元件的阻抗大小。',look:'看圖三：把頻率調成兩倍，感抗變成 200 歐姆，容抗變成 50 歐姆；電阻仍是 100 歐姆。',diagram:svg('frequency-effect','頻率滑桿控制各元件阻抗大小，感抗隨頻率增加、容抗減少',`${[0,100,200,300,400].map(v=>line(175+v,65,175+v,345,'grid')+txt(175+v,387,v,'muted-text','middle')).join('')}${txt(135,115,'R','amber-fill','end')}${txt(135,225,'|Zₗ|','blue-fill','end')}${txt(135,335,'|Zc|','mint-fill','end')}<rect id="resistance-bar" x="175" y="90" width="100" height="28" rx="5" fill="#ffc67b"/><rect id="inductance-bar" x="175" y="200" width="100" height="28" rx="5" fill="#8db8ff"/><rect id="capacitance-bar" x="175" y="310" width="100" height="28" rx="5" fill="#78e2ca"/>${txt(175,65,'阻抗大小（Ω）','muted-text')}`,415),extra:`<div class="phase-controls"><label for="frequency-scale">頻率倍數 <output id="frequency-output">1×</output></label><input id="frequency-scale" type="range" min="0.25" max="4" step="0.25" value="1"><p id="frequency-description" class="frequency-values" aria-live="polite"></p></div>`,takeaways:take('感抗 Xₗ = ωL','<span id="inductance-value">100 Ω</span>')+take('容抗大小 Xc = 1/(ωC)','<span id="capacitance-value">100 Ω</span>'),detail:`<p>滑桿以 ω = 1000 rad/s 為一倍。角頻率 ω 與頻率 f 的關係是 ω = 2πf。一倍約 159.15 Hz，兩倍約 318.31 Hz；不是把 rad/s 直接當成 Hz。</p><p class="equation">ω = 1000 × 倍數<br>Xₗ = ω × 0.1 H<br>Xc = 1 / (ω × 10 μF)</p><p>這張圖畫的是大小，沒有正負方向；電容的阻抗仍是 −jXc。理想電阻不隨頻率改變。這裡比較理想元件與同頻弦波穩態，不能拿來取代切換瞬間的暫態分析。</p>`},
    {id:'rc-loop',short:'04 串聯 RC',title:'先固定參考，再沿一圈算。',subtitle:'電源正峰值決定 t = 0；順時針的 I 是全迴路共同電流。',look:'看圖四：確認迴路閉合，電流進入 R 和 C 的正端；沿順時針走，電源升壓等於兩個元件降壓。',diagram:svg('rc-loop','閉合串聯 RC 電路，電源上正下負，電流順時針，電阻左正右負，電容上正下負',`<path d="M140 160H255L270 145L285 175L300 145L315 175L330 145L345 175L360 160H510V250M510 280V390H140V285M140 160V215" class="blue"/><circle cx="140" cy="250" r="35" class="blue"/><path d="M116 250Q128 222 140 250T164 250" class="amber"/>${line(470,250,550,250,'mint')}${line(470,280,550,280,'mint')}${line(195,105,250,105,'amber',true)}${line(570,180,570,225,'amber',true)}${txt(275,113,'I','amber-fill')}${txt(300,67,'R = 100 Ω','','middle')}${txt(225,167,'+','amber-fill','end')}${txt(390,167,'−','amber-fill')}${txt(300,215,'Vᵣ','amber-fill','middle')}${txt(448,245,'+','mint-fill')}${txt(448,307,'−','mint-fill')}${txt(410,277,'Vc','mint-fill','end')}${txt(410,350,'C = 10 μF','','end')}${txt(88,220,'+','blue-fill')}${txt(88,295,'−','blue-fill')}${txt(140,445,'Vₛ = 10∠0° V','blue-fill')}${txt(140,487,'ω = 1000 rad/s','muted-text')}`,525),takeaways:take('總阻抗','Z = 100 − j100 Ω')+take('電流（峰值）','I = 70.71∠45° mA'),detail:`<p>採被動符號慣例：電流流入電阻、電容的電壓正端。順時針 KVL 為 Vₛ − Vᵣ − Vc = 0。正負號表示參考方向，並非交流電壓每一刻都維持正值。</p><p class="equation">Zc = 1/(jωC) = −j100 Ω<br>Z = R + Zc = 100 − j100<br>= 141.421∠−45° Ω<br>I = 10∠0° / 141.421∠−45°<br>= 0.070711∠45° A<br>= 0.05 + j0.05 A</p><p>除法讓角度相減：0° − (−45°) = +45°。電流超前電源電壓 45°，不是 90°；90° 是電流相對電容自身電壓的差。</p>`},
    {id:'rc-vectors',short:'05 電壓相加',title:'兩支斜箭頭，合成水平的 10 V。',subtitle:'水平、垂直採同一比例；箭頭首尾相接。',look:'看圖五：橘色先向右五、向上五；綠色再向右五、向下五。虛部抵消，總電壓回到十伏特。',diagram:svg('rc-vectors','電壓相量首尾相接：Vr=5+j5，Vc=5−j5，總和為10+j0伏特',`${line(65,350,610,350)}${line(100,410,100,60)}${line(100,350,320,130,'amber',true)}${line(320,130,540,350,'mint',true)}${line(100,350,540,350,'blue dash',true)}${line(320,130,320,350,'grid')}${txt(310,74,'Vᵣ + Vc = Vₛ','big-text','middle')}${txt(150,178,'Vᵣ','amber-fill')}${txt(395,178,'Vc','mint-fill')}${txt(136,222,'5 + j5','amber-fill')}${txt(422,222,'5 − j5','mint-fill')}${txt(320,430,'10 + j0 V','blue-fill','middle')}${txt(88,378,'0','muted-text','end')}${txt(320,378,'5','muted-text','middle')}${txt(550,378,'10','muted-text')}${txt(92,137,'5','muted-text','end')}${txt(600,477,'Re（V）','muted-text','end')}${txt(100,40,'Im（V）','muted-text','middle')}`,505),takeaways:take('各元件電壓大小','7.071 V，彼此相差 90°')+take('總電壓大小','10 V，不能把大小直接相加'),detail:`<p>Vᵣ 與電流同相；Vc 相對電流落後 90°。因此以電源為 0° 時，兩個元件電壓分別是 +45° 與 −45°。</p><p class="equation">Vᵣ = RI = 5 + j5 V<br>= 7.0711∠45° V<br>Vc = (−j100)I = 5 − j5 V<br>= 7.0711∠−45° V<br>Vᵣ + Vc = (5 + 5) + j(5 − 5)<br>= 10 + j0 V</p><p>圖中的箭頭代表相量，並非電流的空間軌跡。7.071 + 7.071 不是來源的 10 V，因為這兩個電壓在不同時刻達到峰值。KVL 相加的是瞬時電壓，或同頻的完整複數相量。</p>`},
    {id:'rc-wave',short:'06 回到時間',title:'相位算完，回到真實的先後。',subtitle:'藍色電源在 t = 0 達到 10 V；電流與電阻電壓提早到峰頂。',look:'看圖六：以藍色電源的零時刻峰頂為基準，橘色電流和電阻電壓向左，綠色電容電壓向右。電流另用毫安刻度。',diagram:svg('rc-wave','串聯 RC 時間波形，上方電壓以伏特表示，下方電流使用獨立毫安刻度，電流超前來源45度',rcWaveDiagram,695),extra:`<div class="diagram-legend"><span class="legend-blue">藍實線：電源 vₛ</span><span class="legend-amber">橘實線：vᵣ／下方 i</span><span class="legend-mint">綠虛線：電容 vc</span></div>`,takeaways:take('電流與電源相差','+45° → 提早 0.785 ms')+take('電容電壓與電源相差','−45° → 晚到 0.785 ms'),detail:`<p>相量大小直接作為餘弦的峰值；全課沒有混用有效值。ω = 1000 rad/s，因此 f ≈ 159.15 Hz，T ≈ 6.283 ms。</p><p class="equation">vₛ(t) = 10 cos(1000t) V<br>i(t) = 0.070711 cos(1000t + π/4) A<br>vᵣ(t) = 7.0711 cos(1000t + π/4) V<br>vc(t) = 7.0711 cos(1000t − π/4) V</p><p>公式中的 t 以秒計，圖上為了方便閱讀改標毫秒。正峰值位移 Δt = −φ/ω，所以 +45° 的波提早 π/(4×1000) 秒。電流與電壓是不同物理量，下方電流使用自己的 mA 刻度；不以圖上高度直接比較安培與伏特。</p><p>任一時刻都有 vᵣ(t) + vc(t) = vₛ(t)。例如 t = 0 時，兩個元件電壓各為 5 V，合成電源的 10 V。</p>`}
  ];
  $('figures').innerHTML = figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i ? ' hidden' : ''}><header class="figure-head"><p class="figure-kicker">圖 ${i+1} / ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想多看一步：公式與推導</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML = figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){
    if(!figures.some(f=>f.id===id)) return;
    figures.forEach(f=>$(f.id).hidden=f.id!==id);
    $('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));
    if(scroll) $(id).scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('figure-tabs').addEventListener('click',event=>{const button=event.target.closest('button');if(button)showFigure(button.dataset.figure);});
  function updateFrequency(){
    const scale=Number($('frequency-scale').value),omega=1000*scale,xl=omega*.1,xc=1/(omega*10e-6);
    $('frequency-output').value=`${scale}×`;
    $('frequency-description').textContent=`ω = ${omega} rad/s；f ≈ ${(omega/(2*Math.PI)).toFixed(2)} Hz；R = 100 Ω。`;
    $('inductance-bar').setAttribute('width',xl);
    $('capacitance-bar').setAttribute('width',xc);
    $('inductance-value').textContent=`${Number(xl.toFixed(2))} Ω`;
    $('capacitance-value').textContent=`${Number(xc.toFixed(2))} Ω`;
  }
  $('frequency-scale').addEventListener('input',updateFrequency);updateFrequency();

  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='circuit-audio-impedance-v1';
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

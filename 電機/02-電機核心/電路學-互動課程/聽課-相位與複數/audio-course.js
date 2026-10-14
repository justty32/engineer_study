(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const defs = `<defs><marker id="mint-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#78e2ca"/></marker><marker id="amber-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#ffc67b"/></marker><marker id="blue-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#8db8ff"/></marker></defs>`;
  const line = (x1,y1,x2,y2,cls='axis',arrow=false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${arrow ? ` marker-end="url(#${cls.split(' ')[0]}-arrow)"` : ''}/>`;
  const txt = (x,y,t,cls='',anchor='start') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg = (id,title,body,height=370) => `<svg viewBox="0 0 680 ${height}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take = (label,value) => `<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">${defs}</svg>`);
  const figures = [
    {id:'phase-time',short:'01 時間差',title:'向左的波，先到。',subtitle:'同樣 50 Hz，比較相同的峰值；參考波固定不動。',look:'看圖 1：追蹤同一個峰值，確認向左是超前、向右是落後。',diagram:svg('phase-time','50 Hz 餘弦波相位比較；滑桿調整後顯示超前落後與時間位移',`<g id="time-grid"></g><path id="reference-wave" class="amber dash"/><path id="shifted-wave" class="mint"/><g id="time-labels"></g>`),extra:`<div class="phase-controls"><label for="phase-angle">比較波相位 φ <output id="phase-output">+90°</output></label><input id="phase-angle" type="range" min="-180" max="180" step="15" value="90"><p id="phase-description"></p></div>`,takeaways:take('週期 T','20 ms = 360°')+take('比較波峰值位移','<span id="phase-shift"></span>'),detail:`<p>這裡使用餘弦：參考波 cos(ωt)，比較波 cos(ωt + φ)。橫軸往右代表時間增加。固定同一個峰值，正角使它提早出現。</p><p class="equation">Δt = −φ × T / 360°<br>φ = +90° → Δt = −5 ms<br>φ = −90° → Δt = +5 ms</p><p>180° 與 −180° 都是反相，可說半週超前或半週落後；兩者代表同一條週期波形。相位差只在同頻率、同參考慣例下比較。</p>`},
    {id:'phase-angle-view',short:'02 一圈與一週',title:'四分之一週，就是 90°。',subtitle:'角度是時間差的另一種刻度；先約定餘弦與共同的時間零點。',look:'看圖 2：一週 20 ms 對應 360°；下方兩列只換時間零點，A、B 兩事件的間隔仍是 5 ms。',diagram:svg('phase-angle-view','一圈 360 度對應週期 20 毫秒；四分之一圈 90 度對應 5 毫秒',`<circle cx="180" cy="178" r="100" class="axis" fill="none"/><path d="M280 178A100 100 0 0 0 180 78" class="mint" marker-end="url(#mint-arrow)"/>${line(65,178,300,178)}${line(180,290,180,60)}${line(180,178,280,178,'amber',true)}${line(180,178,180,78,'mint',true)}${txt(230,130,'90°','mint-fill')}${txt(180,325,'一圈 360°','big-text','middle')}${txt(310,183,'0°','muted-text')}${txt(180,45,'+90°','mint-fill','middle')}${txt(460,85,'一個週期 T','big-text','middle')}${line(365,160,630,160,'amber',true)}${[0,1,2,3,4].map((v)=>line(365+v*62,150,365+v*62,171)+txt(365+v*62,200,String(v*5),'muted-text','middle')).join('')}${line(365,140,427,140,'mint')}${txt(396,122,'5 ms','mint-fill','middle')}${txt(495,235,'時間向右 →（ms）','muted-text','middle')}${txt(495,285,'20 ms ↔ 360°','big-text','middle')}${line(35,352,645,352,'grid')}${line(220,405,220,520,'grid')}${line(370,405,370,520,'grid')}${line(170,415,590,415)}${line(170,510,590,510)}${txt(20,421,'原本零點','muted-text')}${txt(20,516,'零點晚 2 ms','muted-text')}<circle cx="220" cy="415" r="6" class="amber-fill"/><circle cx="370" cy="415" r="6" class="mint-fill"/><circle cx="220" cy="510" r="6" class="amber-fill"/><circle cx="370" cy="510" r="6" class="mint-fill"/>${txt(220,394,'A','amber-fill','middle')}${txt(370,394,'B','mint-fill','middle')}${txt(220,449,'0','muted-text','middle')}${txt(370,449,'5','muted-text','middle')}${txt(220,544,'−2','muted-text','middle')}${txt(370,544,'3','muted-text','middle')}${line(280,498,280,522,'axis')}${txt(280,544,'0','muted-text','middle')}${txt(485,449,'時間（ms）','muted-text')}${txt(485,544,'時間（ms）','muted-text')}${txt(340,585,'同兩事件，間隔仍是 5 ms = 90°','mint-fill','middle')}`,610),takeaways:take('正角（餘弦慣例）','相同峰值提早到')+take('一起移動時間零點','相位差不變'),detail:`<p>一個週期對應 360°。這堂課用 50 Hz，因此一週是 1/50 秒，也就是 20 ms；5 ms 便是四分之一週，即 90°。</p><p>以 cos(ωt + φ) 表示時，φ 為正代表超前。不能只看某一瞬間哪條波較高，就判斷誰超前；要找相同且同方向通過的特徵點。</p><p>如果兩條波共同改用新的時間零點，它們的相位角都增加或減少同一個量，兩者相減的結果不變。</p>`},
    {id:'complex-plane',short:'03 複數座標',title:'一個數，記住兩個方向。',subtitle:'3 + j4 是座標；5∠53.13° 是同一個箭頭的長度與方向。',look:'看圖 3：先找水平的 3、垂直的 4，再看斜邊 5 與角度 53.13°。',diagram:svg('complex-plane','複數 3+j4 的實部為 3、虛部為 4、大小 5、角度 53.13 度',`${line(65,285,445,285)}${line(125,330,125,42)}${line(125,285,275,285,'amber')}${line(275,285,275,85,'blue dash')}${line(125,285,275,85,'mint',true)}<path d="M188 285A63 63 0 0 0 162.8 234.6" class="mint"/>${txt(194,263,'53.13°','mint-fill')}${txt(200,311,'實部 3','amber-fill','middle')}${txt(291,190,'虛部 4','blue-fill')}${txt(176,155,'5','mint-fill')}${txt(290,77,'3 + j4','big-text')}${txt(115,307,'0','muted-text','end')}${txt(455,290,'實部 Re','muted-text')}${txt(127,28,'虛部 Im','muted-text')}${txt(495,145,'× j','big-text','middle')}${txt(495,183,'逆時針 90°','mint-fill','middle')}${txt(495,245,'1 → j → −1','muted-text','middle')}`,360),takeaways:take('直角式','z = 3 + j4')+take('極式','z = 5∠53.13°'),detail:`<p>電路以 j 表示虛數單位，避免與電流 i 混淆。j² = −1。實部與虛部是兩個互相垂直的座標方向；虛部不等於「假的電流」。</p><p class="equation">|z| = √(3² + 4²) = 5<br>θ = atan2(4, 3) ≈ 53.13°<br>3 = 5 cos θ，4 = 5 sin θ</p><p>求角度要同時看實部與虛部的正負、確認象限，不能一律直接套反正切。相量的角度描述相對時間基準的相位；平面箭頭本身不是導線中的實體軌跡。</p>`},
    {id:'complex-add',short:'04 加與減',title:'加減，分開算兩個方向。',subtitle:'a = 3 + j4，b = 1 − j2。相減就是加上反向的 b。',look:'看圖 4：左側把 b 接在 a 尾端；右側改接 −b，再看總箭頭終點。',diagram:svg('complex-add','複數加法得到 4+j2，減法得到 2+j6；箭頭首尾相接',`${txt(175,40,'a + b = 4 + j2','big-text','middle')}${txt(510,40,'a − b = 2 + j6','big-text','middle')}${line(45,290,307,290)}${line(70,320,70,85)}${line(70,290,214,98,'mint',true)}${line(214,98,262,194,'amber',true)}${line(70,290,262,194,'blue dash',true)}${txt(129,181,'a','mint-fill')}${txt(256,137,'b','amber-fill')}${txt(198,250,'4 + j2','blue-fill')}${txt(283,315,'Re','tiny-text')}${txt(52,81,'Im','tiny-text')}${line(380,290,645,290)}${line(405,320,405,65)}${line(405,290,501,162,'mint',true)}${line(501,162,469,98,'amber',true)}${line(405,290,469,98,'blue dash',true)}${txt(494,246,'a','mint-fill')}${txt(514,116,'−b','amber-fill')}${txt(380,85,'2 + j6','blue-fill')}${txt(621,315,'Re','tiny-text')}${txt(387,65,'Im','tiny-text')}`,350),takeaways:take('加法','(3 + 1) + j(4 − 2)')+take('減法','(3 − 1) + j(4 + 2)'),detail:`<p>直角式最適合加減：實部加實部，虛部加虛部。左圖的 b 向右 1、向下 2；右圖的 −b 則向左 1、向上 2。每張圖的水平與垂直都採相同單位比例。</p><p class="equation">a + b = (3 + 1) + j(4 − 2) = 4 + j2<br>a − b = (3 − 1) + j(4 − (−2)) = 2 + j6</p><p>不同方向的箭頭，長度不能直接相加。把 5∠53.13° 與另一個極式相加前，先轉回實部與虛部。</p>`},
    {id:'complex-multiply',short:'05 乘與除',title:'乘除，縮放再轉向。',subtitle:'a = 2∠30°，b = 3∠20°。乘 b：長度乘 3，角度再加 20°。',look:'看圖 5：乘法的長度相乘、角度相加；除法的長度相除、角度相減。',diagram:svg('complex-multiply','極式乘法為 6∠50 度，除法為三分之二∠10 度',`${line(65,300,335,300)}${line(100,325,100,55)}${line(100,300,181,253,'amber',true)}${line(100,300,281,84,'mint',true)}<path d="M159 266A68 68 0 0 0 144 248" class="mint"/>${txt(135,231,'+20°','mint-fill')}${txt(187,270,'a：2∠30°','amber-fill')}${txt(180,64,'乘：6∠50°','mint-fill')}${txt(490,107,'÷ 3','big-text','middle')}${txt(490,147,'長度變為三分之一','muted-text','middle')}${txt(490,205,'−20°','big-text','middle')}${txt(490,245,'方向回轉 20°','muted-text','middle')}${txt(490,300,'除：(2/3)∠10°','blue-fill','middle')}`,350),takeaways:take('乘法','2 × 3 ∠(30° + 20°)')+take('除法','2 ÷ 3 ∠(30° − 20°)'),detail:`<p>乘法把長度相乘、角度相加；除法把長度相除、角度相減，且除數不能是零。極式只是在這些運算時比較省事，並沒有換一種數。</p><p class="equation">(3 + j4)(1 − j2)<br>= 3 − j6 + j4 − j²8 = 11 − j2</p><p>直角式除法用共軛，讓分母變成實數：</p><p class="equation">(3 + j4) / (1 − j2)<br>= [(3 + j4)(1 + j2)] / [(1 − j2)(1 + j2)]<br>= (−5 + j10) / 5 = −1 + j2</p><p>共軛是把虛部變號。分子、分母必須同乘同一個數，才不改變原值。極式運算前後都要留意角度單位。</p>`},
    {id:'circuit-example',short:'06 回到電路',title:'電流落後，算得出也看得見。',subtitle:'串聯 RL：V = 10∠0° V；電阻 3 Ω，感抗 j4 Ω。',look:'看圖 6：上方沿電流方向讀元件，下方確認兩個元件電壓首尾相接回到電源電壓。',diagram:svg('circuit-example','閉合串聯 RL 電路與電壓相量；電流為 2∠−53.13 度安培，落後電壓',`<path d="M130 105H265L275 90L290 120L305 90L320 120L335 90L345 105H510V120" class="blue"/><path d="M510 120c35 0 35 25 0 25c35 0 35 25 0 25c35 0 35 25 0 25V220H130V175" class="blue"/>${line(130,105,130,125,'blue')}<circle cx="130" cy="150" r="25" class="blue"/><path d="M113 150Q121 131 130 150T147 150" class="amber"/>${line(185,75,232,75,'mint',true)}${txt(194,58,'I','mint-fill')}${txt(305,65,'R = 3 Ω','','middle')}${txt(557,161,'j4 Ω')}${txt(235,111,'+','amber-fill')}${txt(365,111,'−','amber-fill')}${txt(477,128,'+','amber-fill')}${txt(477,205,'−','amber-fill')}${txt(305,148,'Vᵣ','','middle')}${txt(468,166,'Vₗ','','end')}${txt(93,130,'+','amber-fill','end')}${txt(93,184,'−','amber-fill','end')}${txt(325,251,'V = 10∠0° V　　Z = 3 + j4 Ω','muted-text','middle')}${txt(65,305,'電壓首尾相接','muted-text')}${line(150,344,430,344,'blue dash',true)}${line(150,344,250.8,478.4,'amber',true)}${line(250.8,478.4,430,344,'mint',true)}${txt(335,329,'V = Vᵣ + Vₗ = 10 + j0','blue-fill','middle')}${txt(115,437,'Vᵣ','amber-fill')}${txt(378,422,'Vₗ','mint-fill')}${txt(265,505,'3.6 − j4.8','amber-fill','middle')}${txt(503,462,'6.4 + j4.8','mint-fill','middle')}`,535),takeaways:take('阻抗','Z = 5∠53.13° Ω')+take('電流（峰值）','I = 2∠−53.13° A'),detail:`<p>上圖是閉合回路，電流參考方向沿上支路向右。電阻及電感電壓採被動符號約定，電流流入元件的正端。下圖是相量圖，並非空間中的實體導線；各分量數值單位為伏特。</p><p class="equation">I = V / Z = 10∠0° / 5∠53.13°<br>= 2∠−53.13° A = 1.2 − j1.6 A<br>Vᵣ = 3I = 3.6 − j4.8 V<br>Vₗ = j4I = 6.4 + j4.8 V<br>Vᵣ + Vₗ = 10 + j0 V</p><p>使用峰值慣例：v(t) = 10 cos(ωt) V，i(t) = 2 cos(ωt − 53.13°) A。這些方法適用於同頻正弦穩態；切換瞬間的暫態需另行分析。此例的 j4 Ω 是該頻率下的感抗，不是任意頻率都固定為 4 Ω。</p><p>要實測相位，可用示波器雙通道比較同頻時間差。普通電表的單一電壓／電流讀值不能直接確認相位。</p>`}
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
  function updatePhase(){
    const angle=Number($('phase-angle').value),x=t=>80+(t+5)*18,y=a=>193-a*83;
    $('time-grid').innerHTML=[-5,0,5,10,15,20,25].map(t=>line(x(t),90,x(t),285,'grid')+txt(x(t),313,String(t),'muted-text','middle')).join('')+[-1,0,1].map(a=>line(80,y(a),620,y(a),a===0?'axis':'grid')+txt(65,y(a)+5,String(a),'muted-text','end')).join('');
    const wave=phase=>Array.from({length:361},(_,i)=>{const t=-5+i/12;return `${i?'L':'M'}${x(t).toFixed(2)} ${y(Math.cos(2*Math.PI*t/20+phase*Math.PI/180)).toFixed(2)}`;}).join(' ');
    $('reference-wave').setAttribute('d',wave(0));$('shifted-wave').setAttribute('d',wave(angle));
    $('time-labels').innerHTML=txt(80,45,'── 比較波 cos(ωt + φ)','mint-fill')+txt(390,45,'┄ 參考 cos(ωt)','amber-fill')+txt(80,75,'歸一化振幅','tiny-text')+txt(620,345,'時間（ms）→','muted-text','end');
    const abs= Math.abs(angle*20/360),ms=Number(abs.toFixed(2));
    $('phase-output').textContent=`${angle>0?'+':''}${angle}°`;
    const description=angle===0?'同相：兩個峰值同時到達。':Math.abs(angle)===180?'反相：相差半週，超前或落後 10 ms 是同一條波。':angle>0?`比較波超前：相同峰值向左 ${ms} ms。`:`比較波落後：相同峰值向右 ${ms} ms。`;
    $('phase-description').textContent=description;
    $('phase-shift').textContent=`Δt = ${angle===0?'0':angle>0?'−'+ms:'+'+ms} ms`;
  }
  $('phase-angle').addEventListener('input',updatePhase);updatePhase();

  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='circuit-audio-phase-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  let lessonIndex=Math.max(0,lessons.findIndex(l=>l.id===saved.lesson));
  let segmentIndex=Math.min(Math.max(0,Number.isInteger(saved.segment)?saved.segment:0),lessons[lessonIndex].segments.length-1);
  let state=saved.state==='checkpoint'?'checkpoint':'idle';
  let voices=[],voiceURI=saved.voice||'',rate=Math.min(1.2,Math.max(.7,Number(saved.rate)||.9));
  let mediaRate=Math.min(2,Math.max(.75,Number(saved.mediaRate)||1));
  let generation=0,audio=null,utterance=null,chunks=[],chunkIndex=0,chunkStarted=false,chunkElapsed=0,chunkLimit=0;
  const courseAudio=$('course-audio'),sampleAudio=$('sample-audio');
  const assets=window.CIRCUIT_AUDIO_ASSETS||{segments:{}};
  const courseSegmentIds=new Set(lessons.flatMap(item=>item.segments.map(part=>part.id)));
  const generatedAudioCount=[...courseSegmentIds].filter(id=>{
    const src=assets.segments?.[id]?.src;
    return typeof src==='string'&&src.trim().length>0;
  }).length;
  $('audio-generation-count').textContent=`已生成 ${generatedAudioCount}／${courseSegmentIds.size} 段音檔`;
  $('audio-generation-note').textContent=generatedAudioCount===courseSegmentIds.size
    ?'整課音檔已齊全，可依課程段落播放；看圖停靠仍會等待你繼續。'
    :assets.generationStatus==='paused'
      ?'音訊生成已暫停：第一堂已完整，第二堂尚未完成。已完成段落可播放；未完成段落仍可用系統朗讀。'
      :'未生成的段落仍使用系統朗讀。重新整理頁面可取得新增音檔，請等目前播放告一段落再重新整理。';
  let mediaKey='';
  const lesson=()=>lessons[lessonIndex];
  const segment=()=>lesson().segments[segmentIndex];
  const selectedVoice=()=>voices.find(v=>v.voiceURI===voiceURI)||voices[0];
  function save(){try{localStorage.setItem(storageKey,JSON.stringify({lesson:lesson().id,segment:segmentIndex,state,rate,mediaRate,voice:voiceURI}));}catch{}}
  const audioSrc=()=>assets.segments?.[segment().id]?.src||segment().audioSrc||'';
  function canPlay(){return Boolean(audioSrc() || (supported&&voices.length));}
  function sourceLabel(){return audioSrc()?`聲音來源：本段音檔 ${audioSrc()}${assets.segments?.[segment().id]?.reviewNote ? "；"+assets.segments[segment().id].reviewNote : ""}`:selectedVoice()?`聲音來源：瀏覽器系統語音 · ${selectedVoice().name}（${selectedVoice().lang}）`:'聲音來源：尚無可用的中文系統語音。';}
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
      sampleAudio.pause();state='playing';
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
    for(const id of ['sample-rate','course-rate']){
      if(!Array.from($(id).options).some(option=>Number(option.value)===mediaRate)){
        const option=document.createElement('option');option.value=String(mediaRate);option.textContent=`${mediaRate}×`;$(id).append(option);
      }
      $(id).value=String(mediaRate);
    }
    for(const element of [courseAudio,sampleAudio]){
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
    const durations=lesson().segments.map(s=>assets.segments?.[s.id]?.duration);
    const completeAudio=durations.every(d=>Number.isFinite(d)&&d>0);
    $('duration-estimate').textContent=completeAudio
      ?`本堂音檔 ${formatTime(durations.reduce((sum,d)=>sum+d,0))}（1×）`
      :`本堂約 ${Math.round(spokenChars/280)}–${Math.round(spokenChars/240)} 分鐘（正文估算）`;
    $('duration-estimate').title=completeAudio
      ?'逐段音檔的實測總長度，以原速計；看圖停靠與自行暫停時間另計。'
      :'以每分鐘 240–280 個中文字估算；實際長度受語速、音色及數字讀法影響，人工停靠另計。';
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
    sampleAudio.pause();
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
  for(const id of ['sample-rate','course-rate']){
    $(id).innerHTML=[.75,.9,1,1.1,1.25,1.5,1.75,2].map(r=>`<option value="${r}">${r}×</option>`).join('');
    $(id).addEventListener('change',()=>setMediaRate($(id).value));
  }
  $('speech-rate').addEventListener('input',()=>setRate($('speech-rate').value));
  [sampleAudio,courseAudio].forEach(element=>element.addEventListener('ratechange',()=>setMediaRate(element.playbackRate)));
  setRate(rate);setMediaRate(mediaRate);
  $('speech-rate').addEventListener('change',()=>{if(!audio&&state==='playing')renderControls('語速將從下一個短句套用；實際時長會隨語速與音色改變。');});
  $('copy-script').addEventListener('click',async()=>{
    const text=lesson().title+'\n\n'+lesson().segments.map((s,i)=>`${i+1}. ${s.title}\n\n${s.text}${s.checkpoint?'\n\n〔看圖停靠〕'+(figures.find(f=>f.id===s.figure)?.look||''):''}`).join('\n\n');
    try{await navigator.clipboard.writeText(text);$('copy-status').textContent='已複製本堂完整講稿。';}catch{const range=document.createRange();range.selectNodeContents($('transcript-content'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='瀏覽器不允許自動複製，已選取講稿；請按 Ctrl+C／⌘C。';}
  });
  // Detect silence without treating background-tab throttling as missing content.
  setInterval(()=>{if(state!=='playing'||audio||!utterance||document.hidden)return;chunkElapsed++;if(chunkElapsed>chunkLimit)fail(generation,chunkStarted?'系統語音長時間未完成這個短句。':'系統語音未開始出聲。');},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state==='playing')renderControls('已回到教材；若背景朗讀被瀏覽器暫停，可暫停再繼續，或重播本段。');});
  window.addEventListener('pagehide',()=>{save();stop();sampleAudio.pause();});
  if(supported){synth.addEventListener?.('voiceschanged',loadVoices);}
  ['loadedmetadata','durationchange','timeupdate','seeked','emptied'].forEach(event=>{
    courseAudio.addEventListener(event,()=>updateMediaTime(courseAudio,'course-time'));
    sampleAudio.addEventListener(event,()=>updateMediaTime(sampleAudio,'sample-time'));
  });
  sampleAudio.addEventListener('play',()=>{
    if(sampleAudio.paused)return;
    pauseCourse('主課已暫停並保留位置；短試音結束後可按繼續。');
    $('sample-status').textContent='正在播放官方音色短試音；這不是角色配音或課程段落。';
  });
  sampleAudio.addEventListener('pause',()=>{if(!sampleAudio.ended&&!sampleAudio.error)$('sample-status').textContent='短試音已暫停，播放位置保留。';});
  sampleAudio.addEventListener('ended',()=>{$('sample-status').textContent='短試音已結束；可重聽或繼續主課。';});
  sampleAudio.addEventListener('error',()=>{$('sample-status').textContent='短試音讀取失敗；可使用下載連結，或確認音檔是否存在。';});
  if(assets.sample?.src){
    sampleAudio.src=assets.sample.src;
    $('sample-download').href=assets.sample.src;
    $('sample-title').textContent=assets.sample.label||'官方音色短試音';
  }else{$('sample-status').textContent='目前尚無短試音檔。';$('sample-download').hidden=true;}
  renderLesson();loadVoices();
  // Some browsers populate voices late without emitting voiceschanged.
  [500,1500,4000].forEach(delay=>setTimeout(loadVoices,delay));
})();

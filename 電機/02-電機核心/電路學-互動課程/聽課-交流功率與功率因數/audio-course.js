(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  const defs='<defs>'+Object.entries(colors).map(([name,color])=>`<marker id="pwr-${name}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')+'</defs>';
  document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden">${defs}</svg>`);
  const line=(x1,y1,x2,y2,cls='axis',arrow=false,id='')=>`<line ${id?`id="${id}"`:''} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${arrow?` marker-end="url(#pwr-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,text,cls='',anchor='start',id='')=>`<text ${id?`id="${id}"`:''} x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${text}</text>`;
  const svg=(id,title,body,height=440)=>`<svg viewBox="0 0 600 ${height}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,value)=>`<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
  const path=(fn,x,y,a,b,n=300)=>Array.from({length:n+1},(_,i)=>{const t=a+(b-a)*i/n;return `${i?'L':'M'}${x(t).toFixed(2)} ${y(fn(t)).toFixed(2)}`;}).join(' ');
  const theta=Math.atan2(9,12), px=t=>92+25.8*t,py=p=>342-p*.155;
  const instant=[0,768,1728].map(v=>line(92,py(v),535,py(v),v===0?'axis':'grid')+txt(78,py(v)+7,v,'tiny-text','end')).join('')
    +[0,8.333333,16.666667].map(t=>line(px(t),65,px(t),380,'grid')+txt(px(t),412,t.toFixed(t?2:0),'tiny-text','middle')).join('')
    +`<path d="${path(t=>768+960*Math.cos(2*120*Math.PI*t/1000-theta),px,py,0,16.666667)}" class="amber"/>`
    +line(92,py(768),535,py(768),'mint dash')+txt(92,38,'瞬時功率 p（W）','muted-text')+txt(535,450,'時間（ms）','muted-text','end')+txt(360,py(768)-15,'平均 768 W','mint-fill')+txt(535,382,'最低 −192 W','amber-fill','end');
  const rx=t=>85+450*t,ry=v=>315-220*v;
  const rms=[0,.5,1].map(v=>line(85,ry(v),535,ry(v),v===0?'axis':'grid')+txt(70,ry(v)+8,v,'tiny-text','end')).join('')
    +`<path d="${path(t=>Math.cos(2*Math.PI*t)**2,rx,ry,0,1)}" class="blue"/>`+line(85,ry(.5),535,ry(.5),'mint dash')
    +txt(85,42,'先平方： (i / I峰值)²','muted-text')+txt(300,170,'平均 = 1/2','mint-fill','middle')+txt(85,353,'0','tiny-text','middle')+txt(310,353,'T/2','tiny-text','middle')+txt(535,353,'T','tiny-text','middle')+txt(535,395,'時間（T = 16.67 ms）','muted-text','end')+txt(300,450,'再開根號 → I有效值 = I峰值 / √2','big-text','middle');
  const triangle=line(95,355,540,355)+line(95,390,95,65)+line(95,355,440.6,355,'mint',true)+line(440.6,355,440.6,95.8,'amber',true)+line(95,355,440.6,95.8,'blue',true)
    +txt(260,400,'P = 768 W','mint-fill','middle')+txt(465,205,'Q','amber-fill')+txt(465,240,'576','amber-fill')+txt(465,275,'var','amber-fill')+txt(210,147,'S = 960 VA','blue-fill')+txt(145,330,'36.87°','tiny-text')+txt(95,45,'正交分量：實功與無效功率','muted-text');
  const circuit=`<path d="M95 180V95H485V222M485 246V360H95V250M300 95V160M300 270V360" class="wire"/><circle cx="95" cy="215" r="35" class="blue"/><path d="M71 215Q83 187 95 215T119 215" class="amber"/><rect x="260" y="160" width="80" height="110" rx="8" class="blue"/>${line(450,222,520,222,'mint')}${line(450,246,520,246,'mint')}<circle cx="300" cy="95" r="5" class="node"/><circle cx="300" cy="360" r="5" class="node"/>`
    +line(165,65,225,65,'amber',true)+line(360,120,360,165,'blue',true)+line(540,120,540,165,'mint',true)
    +txt(95,405,'120∠0° V','blue-fill','middle')+txt(95,438,'60 Hz','muted-text','middle')+txt(49,188,'+','blue-fill')+txt(49,260,'−','blue-fill')
    +txt(300,208,'負載','','middle')+txt(300,244,'Z','','middle')+txt(300,310,'12 + j9 Ω','blue-fill','middle')+txt(485,310,'C','mint-fill','middle')+txt(320,145,'+','blue-fill')+txt(320,294,'−','blue-fill')
    +txt(200,38,'來源','amber-fill','middle')+txt(380,115,'I負載','blue-fill')+txt(545,200,'Ic','mint-fill');
  const currents=line(85,210,545,210)+line(125,450,125,70)+line(125,210,413,426,'blue',true)+line(413,426,413,426,'mint',true,'pwr-cap-vector')+line(125,210,413,426,'amber dash',true,'pwr-source-vector')
    +txt(540,185,'Re（A）','muted-text','end')+txt(125,40,'Im（A）','muted-text','middle')+txt(115,240,'0','tiny-text','end')+txt(413,245,'6.4','tiny-text','middle')+txt(112,430,'−4.8','tiny-text','end')+txt(112,108,'+2.4','tiny-text','end')+line(125,426,413,426,'grid')+line(125,102,413,102,'grid')+txt(255,485,'I負載 = 6.4 − j4.8 A','blue-fill','middle');
  const cx=k=>95+290*k,cy=i=>365-(i-6)*110;
  const compensation=[6.4,7.2,8].map(i=>line(95,cy(i),530,cy(i),'grid')+txt(76,cy(i)+8,i.toFixed(1),'tiny-text','end')).join('')
    +line(95,365,530,365)+[0,.5,1,1.5].map(k=>txt(cx(k),402,k,'tiny-text','middle')).join('')
    +`<path d="${path(k=>Math.hypot(6.4,4.8*(k-1)),cx,cy,0,1.5)}" class="amber"/><circle id="pwr-operating-point" cx="95" cy="145" r="8" fill="#78e2ca"/>`
    +line(cx(1),110,cx(1),365,'mint dash')+txt(95,50,'來源電流大小（A，有效值）','muted-text')+txt(cx(1),95,'最小 6.4 A','mint-fill','middle')+txt(530,445,'補償比例 k','muted-text','end');
  const figures=[
    {id:'pwr-instant',short:'01 能量往返',title:'有時流回去，平均仍然消耗。',subtitle:'p > 0：負載吸收；p < 0：負載把能量送回。',look:'看圖一：橘線有一小段在零以下，但綠色平均線仍是正的七百六十八瓦。',diagram:svg('pwr-instant','瞬時功率在負192瓦至1728瓦之間變動，平均768瓦；時間零至16.67毫秒',instant,480),takeaways:take('平均功率 P','768 W')+take('瞬時功率範圍','−192 ～ 1728 W'),detail:`<p>電流流入負載電壓正端，採被動符號慣例。負值表示那一刻能量返回；不代表負載整體在發電。電感儲存能量後會釋放，電阻仍持續把能量轉成熱。</p><p class="equation">v(t) = 120√2 cos(ωt) V<br>i(t) = 8√2 cos(ωt − θ) A<br>ω = 120π rad/s；θ = 36.87°<br>p(t) = v(t)i(t)<br>= 768 + 960 cos(2ωt − θ) W</p><p>用 cos A cos B = [cos(A−B) + cos(A+B)] / 2。乘積的振盪項一整週平均為零，剩下 120 × 8 × cos θ = 768 W。功率振盪頻率是 120 Hz，為電壓頻率的兩倍。可用功率分析儀觀察瞬時功率與平均功率。</p>`},
    {id:'pwr-rms',short:'02 有效值',title:'先平方，再平均，最後開根號。',subtitle:'有效值（RMS）：和直流造成相同電阻平均發熱的大小。',look:'看圖二：正負電流平方後都向上，平均是一半；開根號才得到有效值。',diagram:svg('pwr-rms','歸一化電流平方，平均二分之一；正弦有效值等於峰值除以根號二',rms,485),takeaways:take('本課相量採有效值','V = 120 V；I = 8 A')+take('相對應的峰值','169.71 V；11.31 A'),detail:`<p>有效值（root mean square，RMS）就是平方平均根。電阻發熱是 i²R，即使電流正負平均為零，平方後仍有正的平均。前一課採峰值相量，本課改用有效值；運算時必須全程一致。</p><p class="equation">I有效值 = √[(1/T) ∫₀ᵀ i²(t) dt]<br>正弦：平均 cos² = 1/2<br>I有效值 = I峰值 / √2<br>P電阻 = I有效值² R</p><p>圖中縱軸是無單位的歸一化平方值，非電流安培。峰值除以根號二只適用純正弦，不能套到任意脈衝波形。真有效值電表能讀有效值，但單靠電表的電壓、電流讀數相乘只得到視在功率。</p>`},
    {id:'pwr-triangle',short:'03 功率三角形',title:'960 伏安，不等於 960 瓦。',subtitle:'P 是實功，Q 是無效功率；視在功率 S = |S複|，是複功率箭頭的長度。',look:'看圖三：水平七百六十八、垂直五百七十六，斜邊才是九百六十。',diagram:svg('pwr-triangle','功率三角形按768比576比960等比例繪製，P水平、Q向上、S斜邊',triangle,445),takeaways:take('功率因數 pf = P / S','0.8，電流落後')+take('複功率 S複 = P + jQ','768 + j576 VA'),detail:`<p>實功（active power）P 的單位為瓦 W；無效功率（reactive power）Q 用 var；視在功率（apparent power）S 用 VA。Q 不是浪費掉的瓦數，也不是某一刻的瞬時功率。感性負載 Q 為正，容性負載 Q 為負。</p><p class="equation">S複 = V I* = P + jQ<br>= 120(6.4 + j4.8)<br>= 768 + j576 VA<br>S = |S複| = √(P² + Q²) = 960 VA<br>pf = P/S = cos θ = 0.8</p><p>星號代表共軛：把電流虛部變號。V I* 的相角為 φᵥ − φᵢ；如果兩個相量一起轉動參考角，差角不變。正弦有效值相量不需再乘二分之一；若混用峰值，功率會差一倍。</p>`},
    {id:'pwr-parallel',short:'04 並聯支路',title:'變小的是上游，負載還是 8 A。',subtitle:'V = 120∠0° V（有效值）；電流以流入負載正端為正，採被動符號慣例。',look:'看圖四：負載與電容各有一條支路，來源供應的是兩支路的相量和。',diagram:svg('pwr-parallel','交流源與感性負載、補償電容形成閉合並聯電路，電流進入負載正端',circuit,470),takeaways:take('負載電流始終不變','8∠−36.87° A')+take('來源電流大小','<span id="pwr-source-branch">8.000 A</span>')+take('電容電流 Ic','<span id="pwr-cap-branch">j0.000 A</span>'),detail:`<p>電容的超前電流抵消負載的落後虛部分量，減少上游往返輸送；它不會讓負載自身所需的 8 A 消失。電路圖箭頭只是相量與正方向參考，交流瞬時方向會反轉。</p><p class="equation">I負載 = 120 / (12 + j9)<br>= 6.4 − j4.8 A<br>Ic = jωCV = j4.8k A<br>I來源 = I負載 + Ic<br>= 6.4 + j4.8(k − 1) A</p><p>模型固定理想負載端電壓；k = 0 代表沒有補償電容、該支路電流為零。可在負載與上游分別量電流驗證差異。這是分析模型，不是實機接線指引。</p>`},
    {id:'pwr-current',short:'05 電流相加',title:'相量抵消的是上下，不是左右。',subtitle:'兩軸同尺度；電壓參考沿正實軸。圖隨第六張的滑桿同步改變。',look:'看圖五：藍色負載箭頭固定；綠色電容箭頭從藍色終點向上，橘色是來源的合成箭頭。',diagram:svg('pwr-current','同尺度電流相量首尾相加，負載6.4-j4.8安培，電容向正虛軸，來源為合成',currents,520),extra:'<div class="diagram-legend"><span class="legend-blue">藍實線：負載</span><span class="legend-mint">綠實線：電容</span><span class="legend-amber">橘虛線：來源</span></div>',takeaways:take('來源電流相量','<span id="pwr-current-value">6.4 − j4.8 A</span>')+take('相對電壓的角度','<span id="pwr-current-phase">−36.87°</span>'),detail:`<p>一安培在水平與垂直都是相同長度。綠箭頭從藍箭頭的終點出發，首尾相加；k = 0 時綠箭頭長度為零，來源與負載重合。k = 1 時虛部恰好抵消，來源只剩 6.4 A；k 超過 1，來源開始超前，大小又增加。</p><p class="equation">|I來源| = √[6.4² + 4.8²(k − 1)²]<br>φ來源 = atan2(4.8(k − 1), 6.4)</p><p>電流虛部超前為正時，複功率的 Q 卻是負的；這來自 S複 = V I* 的共軛。不能把電流相角與功率相角直接當同一個符號。</p>`},
    {id:'pwr-compensation',short:'06 試著補償',title:'補到剛好，才是電流最小。',subtitle:'拖到 k = 1，再超過它：觀察電流回升與功率因數轉為超前。',look:'看圖六：滑到一倍，來源電流最小；滑過一倍，電流又回升。負載仍是八安培。',diagram:svg('pwr-compensation','補償比例0至1.5對來源電流大小，最低點k=1對應6.4安培',compensation,475),extra:`<div class="phase-controls"><label for="pwr-comp-scale">補償比例 k <output id="pwr-comp-output">0.00</output></label><input id="pwr-comp-scale" type="range" min="0" max="1.5" step="0.05" value="0"><div class="preset-controls"><button type="button" data-comp="0">未補償</button><button type="button" data-comp="1">剛好抵消</button><button type="button" data-comp="1.5">補過頭</button></div><p id="pwr-comp-why" aria-live="polite"></p></div>`,takeaways:take('補償電容 C','<span id="pwr-capacitance">0.00 µF</span>')+take('來源 |I| / 功因','<span id="pwr-current-pf">8.000 A / 0.800 落後</span>')+take('實功 P / 無效功率 Q','<span id="pwr-p-q">768 W / 576 var</span>')+take('視在功率 S','<span id="pwr-apparent">960.00 VA</span>')+take('同上游電阻的線損比','<span id="pwr-loss">1.000</span>'),detail:`<p>保持負載端電壓為 120 V、頻率 60 Hz。k 是抵消負載無效功率的比例，不是把負載功率縮小的比例。理想電容平均實功為零，所以 P 固定為 768 W。</p><p class="equation">Qc = −576k var<br>C = 576k / (120π × 120²) F<br>≈ 106.1033k µF<br>Q總 = 576(1 − k) var<br>S總 = √(768² + Q總²) VA<br>pf = 768 / S總<br>線損比 = (|I來源| / 8)²</p><p>線損比只比較同一上游電阻、同電壓近似下的 I²R；本例未加入線阻壓降，也不把線損加回理想電源功率。k = 1 時為 0.64，表示線損減少 36%，不是負載用電減少 36%。</p><p>固定電容遇到變動負載可能補過頭，頻率改變、諧波與共振要另行分析。真功率因數永遠定義為 P/(V有效值 I有效值)，僅純正弦時等於單一相角的 cos θ；畸變電流不能只靠相角判斷。</p>`}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function updateCompensation(){
    const k=Number($('pwr-comp-scale').value),imag=4.8*(k-1),current=Math.hypot(6.4,imag),q=576*(1-k),s=120*current,pf=768/s,c=576*k/(120*Math.PI*120**2)*1e6;
    const label=Math.abs(k-1)<1e-9?'同相':k<1?'落後':'超前';
    $('pwr-comp-output').value=k.toFixed(2);
    $('pwr-source-vector').setAttribute('y2',210-imag*45);
    $('pwr-cap-vector').setAttribute('y2',210-imag*45);
    $('pwr-cap-vector').style.visibility=k===0?'hidden':'visible';
    $('pwr-operating-point').setAttribute('cx',cx(k));$('pwr-operating-point').setAttribute('cy',cy(current));
    $('pwr-source-branch').textContent=`${current.toFixed(3)} A`;
    $('pwr-cap-branch').textContent=`j${(4.8*k).toFixed(3)} A`;
    $('pwr-current-value').textContent=`6.4 ${imag<0?'−':'+'} j${Math.abs(imag).toFixed(2)} A`;
    $('pwr-current-phase').textContent=`${(Math.atan2(imag,6.4)*180/Math.PI).toFixed(2)}°（${label}）`;
    $('pwr-capacitance').textContent=`${c.toFixed(2)} µF`;
    $('pwr-current-pf').textContent=`${current.toFixed(3)} A / ${pf.toFixed(3)} ${label}`;
    $('pwr-p-q').textContent=`768 W / ${q.toFixed(1)} var`;
    $('pwr-apparent').textContent=`${s.toFixed(2)} VA`;
    $('pwr-loss').textContent=(current**2/64).toFixed(3);
    $('pwr-comp-why').textContent=k===0?'未補償：來源承擔全部落後分量，負載與來源都是 8 A。':k<1?'部分抵消：電容提供超前分量，上游落後分量變小；負載仍是 8 A。':Math.abs(k-1)<1e-9?'剛好抵消：來源只剩同相的 6.4 A，功率因數為 1；負載仍是 8 A。':'補過頭：來源電流轉為超前，大小從最低點回升；負載仍是 8 A。';
  }
  $('pwr-comp-scale').addEventListener('input',updateCompensation);
  document.querySelectorAll('[data-comp]').forEach(b=>b.addEventListener('click',()=>{$('pwr-comp-scale').value=b.dataset.comp;updateCompensation();}));
  updateCompensation();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='circuit-audio-power-v1';
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

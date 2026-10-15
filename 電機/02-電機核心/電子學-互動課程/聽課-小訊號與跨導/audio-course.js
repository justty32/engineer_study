(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden"><defs>'+Object.entries(colors).map(([n,c])=>`<marker id="ed-${n}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('')+'</defs></svg>');
  const line=(a,b,c,d,cls='axis',arrow=false,id='')=>`<line ${id?`id="${id}"`:''} x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${cls}"${arrow?` marker-end="url(#ed-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg=(id,title,body,h=410)=>`<svg viewBox="0 0 600 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;

  function chart(id,title,xmin,xmax,ymin,ymax,curves,xticks,yticks,xlabel,ylabel,point){
    const x=v=>100+430*(v-xmin)/(xmax-xmin),y=v=>335-245*(v-ymin)/(ymax-ymin);
    let body=txt(90,40,ylabel,'small-label')+xticks.map(v=>line(x(v),90,x(v),335,'grid')+txt(x(v),372,v,'small-label','middle')).join('')+yticks.map(v=>line(100,y(v),530,y(v),'grid')+txt(85,y(v)+7,v,'small-label','end')).join('')+line(100,90,100,335)+line(100,335,530,335);
    curves.forEach(c=>{let d='';for(let i=0;i<=160;i++){const v=xmin+(xmax-xmin)*i/160;d+=`${i?'L':'M'}${x(v).toFixed(2)} ${y(c.fn(v)).toFixed(2)}`;}body+=`<path d="${d}" class="${c.cls}"/>`;});
    if(point)body+=`<circle id="${id}-point" cx="${x(point[0])}" cy="${y(point[1])}" r="7" class="point"/>`;
    return svg(id,title,body+txt(530,415,xlabel,'small-label','end'),440);
  }
  const curve=chart('es-full','平方曲線，橫軸總電壓一到三伏特、縱軸總電流零到二毫安培。工作點在二伏特與零點五毫安培。',1,3,0,2,[{fn:v=>.5*(v-1)**2,cls:'curve'}],[1,2,3],[0,.5,1,2],'總電壓 V（V）','總電流 I（mA）',[2,.5]);
  const tangent=chart('es-local','工作點附近，綠色真曲線與橘色切線。正負零點一伏特時真值都高於切線零點零零五毫安培。',1.8,2.2,.25,.75,[{fn:v=>.5*(v-1)**2,cls:'curve'},{fn:v=>.5+v-2,cls:'amber dash'}],[1.8,2,2.2],[.3,.5,.7],'總電壓 V（V）','總電流 I（mA）',[2,.5]);
  const error=chart('es-errorplot','改變輸入增量，綠線是總電流真值，橘線是一次近似，圓點標記目前真值。',-.5,.5,0,1.2,[{fn:v=>.5*(1+v)**2,cls:'curve'},{fn:v=>.5+v,cls:'amber dash'}],[-.5,0,.5],[0,.5,1],'電壓增量 δv（V）','總電流 I（mA）',[.1,.605]).replace('</svg>','<circle id="es-errorplot-linear" cx="358" cy="212.5" r="5" fill="#ffc67b"/></svg>');
  const bjtdelta=chart('es-exp','BJT在正負一毫伏附近的電流增量，綠色指數模型，橘色局部直線。',-1.5,1.5,-65,65,[{fn:v=>1000*Math.expm1(v/25.85),cls:'curve'},{fn:v=>1000*v/25.85,cls:'amber dash'}],[-1,0,1],[-50,0,50],'vbe（mV）','集極電流增量（μA）');
  function model(id,bjt,ro){
    let b=txt(60,55,bjt?'B':'G','blue-fill')+txt(345,55,bjt?'C':'D','mint-fill')+line(60,80,150,80,'wire')+line(350,80,350,150,'wire')+line(350,230,350,330,'wire')+line(60,330,500,330,'wire')+txt(60,375,bjt?'E：共點':'S：共點','blue-fill')+txt(60,140,'+','amber-fill')+txt(60,265,'−','amber-fill')+txt(55,205,bjt?'vbe':'vgs','amber-fill');
    if(bjt)b+='<path d="M150 80V135l-10 10 20 15-20 15 20 15-20 15 20 15-10 10V330" class="wire"/>'+txt(180,165,'rπ','blue-fill')+txt(180,205,'2585 Ω','small-label');
    else b+=line(150,80,150,245,'wire')+txt(115,285,'開路','small-label');
    b+='<path d="M350 150L390 190L350 230L310 190Z" class="diamond"/>'+line(350,167,350,215,'mint',true)+txt(240,290,bjt?'gm vbe':'gm vgs','mint-fill');
    if(ro)b+=line(350,80,500,80,'wire')+'<path d="M500 80V135l-10 10 20 15-20 15 20 15-20 15 20 15-10 10V330" class="wire"/>'+txt(470,275,'ro','amber-fill')+txt(500,420,'100 kΩ','amber-fill','end')+txt(565,115,'+','amber-fill','middle')+txt(565,210,bjt?'vce':'vds','amber-fill','middle')+txt(565,325,'−','amber-fill','middle');
    return svg(id,bjt?'B-E輸入電阻與C到E受控電流源，共用E節點。'+(ro?'C-E並聯輸出電阻。':'忽略Early效應。'):'閘極低頻理想輸入開路，D到S受控電流源，S共點。'+(ro?'D-S並聯輸出電阻。':'先忽略通道長度調變。'),b,450);
  }
  const trends=chart('es-gmtrend','gm隨工作點電流的平方根增加，點標目前偏壓。',.25,2,0,2.1,[{fn:i=>Math.sqrt(2*i),cls:'curve'}],[.25,1,2],[0,1,2],'IDQ（mA）','gm（mS）',[.5,1])+chart('es-rotrend','輸出電阻隨工作點電流反比下降，點標目前偏壓。',.25,2,0,220,[{fn:i=>50/i,cls:'amber'}],[.25,1,2],[0,100,200],'IDQ（mA）','ro（kΩ）',[.5,100]);
  const figures=[
    {id:'es-curve',short:'01 曲線與中心',title:'先找曲線上的直流中心。',subtitle:'總電壓與總電流 = 各自直流偏壓 + 瞬時變動；橫軸不是時間。',diagram:curve,takeaways:take('工作點 Q','2 V / 0.5 mA')+take('總電壓','V = VQ + δv'),extra:'<p class="formula-main">I = ½ k(V − Vth)²<br>k = 1 mA/V²，Vth = 1 V。</p>',detail:'<p>長通道、強反轉飽和區平方律示意；外部電路維持所需工作區。不同曲線位置斜率不同，因此先求直流偏壓，再在附近線性化。導數（derivative）是兩點割線斜率在間隔趨近零時的極限。</p>'},
    {id:'es-tangent',short:'02 局部切線',title:'切線在附近很像，走遠開始分開。',subtitle:'綠：平方真值；橘：一次近似。兩者在 Q 相切。',diagram:tangent,takeaways:take('+0.1 V 真值 / 近似','0.605 / 0.600 mA')+take('−0.1 V 真值 / 近似','0.405 / 0.400 mA'),extra:'<p class="formula-main">Ilin = 0.5 mA + (1 mS) δv<br>gm = dI/dV = k(VQ − Vth) = 1 mS。</p>',detail:'<p>泰勒展開（Taylor expansion）的第一階保留常數與斜率項。斜率單位 A/V = S（西門子），跨導（transconductance）將輸入電壓增量換成輸出電流增量，並不是電阻。</p>'},
    {id:'es-error',short:'03 幅度與誤差',title:'幅度多大，省略項就有多重要。',subtitle:'相對誤差以一次電流增量為分母，不用總電流淡化失真。',diagram:error,takeaways:take('真值 / 一次近似','<span id="es-true-linear"></span>')+take('絕對誤差','<span id="es-absolute"></span>')+take('相對增量誤差','<span id="es-relative"></span>'),extra:'<div class="phase-controls"><label for="es-delta">電壓增量 δv <output id="es-delta-out"></output></label><input id="es-delta" type="range" min="-0.5" max="0.5" step="0.01" value="0.1"><div class="preset-controls"><button type="button" data-delta="-0.1">−0.1 V</button><button type="button" data-delta="0">0 V</button><button type="button" data-delta="0.1">0.1 V</button><button type="button" data-delta="0.5">0.5 V</button></div><p id="es-error-why" aria-live="polite"></p></div><p class="formula-main">ΔI = kVov δv + ½k δv²<br>二次項 / 一次項的絕對比值 = |δv| / (2Vov)。</p>',detail:'<p>Vov = VQ − Vth = 1 V。絕對誤差是 |I − Ilin|；相對增量誤差是此值除以 |gm δv|。δv = 0 時分母為零，顯示「不適用」，真值與近似相同。</p>'},
    {id:'es-bjt-delta',short:'04 BJT 小增量',title:'一毫伏特，換成多少集極變動。',subtitle:'作用區、固定溫度；ICQ = 1 mA，VT = 25.85 mV。',diagram:bjtdelta,takeaways:take('+1 mV 真值 / 近似','39.4427 / 38.6847 μA')+take('−1 mV 真值 / 近似','−37.9460 / −38.6847 μA'),extra:'<p class="formula-main">Δic = ICQ [exp(vbe / VT) − 1]<br>ic ≈ gm vbe，gm = ICQ / VT = 38.6847 mS。</p>',detail:'<p>橫軸是疊在偏壓上的 vbe 增量，不是總 VBE。綠色為指數增量，橘色為線性增量。先忽略 Early 效應；小訊號尺度應和 VT 比較。</p>'},
    {id:'es-bjt-model',short:'05 混合 π',title:'輸入端一個電阻，輸出端一個受控源。',subtitle:'B-E 輸入；C→E 為正電流方向，E 為共點。',diagram:model('es-bjt-basic',true,false),takeaways:take('輸入電阻 rπ = β / gm','2585 Ω')+take('受控源電流','gm vbe'),extra:'<p class="formula-main">β = 100；vbe 的 + 在 B、− 在 E。<br>直流獨立電壓源增量為零；受控源保留。</p>',detail:'<p>混合 π（hybrid-pi）模型。輸入電流進入 rπ 的正端，ib = vbe/rπ；集極增量 ic = gm vbe。交流參考是增量零電位，不表示實際供電消失，也不表示可以關掉相依源。</p>'},
    {id:'es-bjt-output',short:'06 BJT 輸出電阻',title:'集極電流有兩份一階貢獻。',subtitle:'C-E 並聯 ro，兩個電壓各提供一項增量電流。',diagram:model('es-bjt-ro-art',true,true),takeaways:take('gm × 1 mV','38.6847 μA')+take('0.1 V / 100 kΩ','1 μA')+take('電流增量相加','39.6847 μA'),extra:'<p class="formula-main">ic ≈ gm vbe + vce / ro<br>ro ≈ VA / ICQ = 100 V / 1 mA = 100 kΩ。</p>',detail:'<p>Early 效應使輸出電流具有有限斜率。VA/ICQ 是高 Early 電壓近似；本圖未宣稱某完整大訊號模型的精確參數。vce 正端在 C、負端在 E；以上相加的是增量，總 IC 還要加 ICQ。</p>'},
    {id:'es-mos-model',short:'07 MOS 跨導',title:'閘極電壓控制汲極變動。',subtitle:'長通道強反轉飽和區；先令 λ = 0。',diagram:model('es-mos-basic',false,false),takeaways:take('IDQ / Vov','0.5 mA / 1 V')+take('gm = k Vov','1 mS')+take('vgs 10 mV → id','10 μA'),extra:'<p class="formula-main">gm = kVov = 2IDQ / Vov<br>低頻理想模型：閘極輸入電流為零；ro → ∞。</p>',detail:'<p>金氧半場效電晶體（MOSFET）閘極 G、汲極 D、源極 S。vgs 正端在 G、負端在 S。「無閘電流」限於此低頻理想電阻性模型；真實元件仍有閘電容，改變閘極電壓需要充放電。</p>'},
    {id:'es-mos-ro',short:'08 MOS 輸出電阻',title:'汲極電流，也受汲源變動影響。',subtitle:'λ = 0.02 V⁻¹；固定 gm = 1 mS 的一階參數模型。',diagram:model('es-mos-ro-art',false,true),takeaways:take('gm × 10 mV','10 μA')+take('0.2 V / 100 kΩ','2 μA')+take('id 增量','12 μA'),extra:'<p class="formula-main">id ≈ gm vgs + vds / ro<br>ro ≈ 1/(λIDQ) = 100 kΩ。</p>',detail:'<p>通道長度調變（channel-length modulation）用有限 ro 近似。此處忽略 gm 的通道調變修正，並非把 IDQ = 0.5 mA 與完整含 (1 + λVDS) 的大訊號式當作同時精確。vds 正端 D、負端 S。</p>'},
    {id:'es-current',short:'09 偏壓與參數',title:'換工作點，跨導與輸出電阻一起改變。',subtitle:'外部偏壓已重新調整、始終維持飽和；k 與 λ 固定。',diagram:trends,takeaways:take('Vov','<span id="es-vov"></span>')+take('gm / ro','<span id="es-gmro"></span>')+take('gm ro（無因次）','<span id="es-intrinsic"></span>'),extra:'<div class="phase-controls"><label for="es-idq">工作點電流 IDQ <output id="es-idq-out"></output></label><input id="es-idq" type="range" min="0.25" max="2" step="0.25" value="0.5"><div class="preset-controls"><button type="button" data-idq="0.25">0.25 mA</button><button type="button" data-idq="0.5">0.5 mA</button><button type="button" data-idq="2">2 mA</button></div><p id="es-current-why" aria-live="polite"></p></div><p class="formula-main">Vov = √(2IDQ/k)，gm = √(2kIDQ)<br>ro ≈ 1/(λIDQ)；gm ro 不是已接負載的實際電壓增益。</p>',detail:'<p>兩張趨勢圖的橫軸皆為毫安培。gm 隨電流平方根增加，ro 隨電流反比下降。此控制只比較工作點附近參數，不代替完整偏壓設計；輸入電壓與外部電路已由另一個偏壓步驟處理。</p>'}
  ];
  figures.forEach((f,i)=>f.look=`看圖${['一','二','三','四','五','六','七','八','九'][i]}：${f.subtitle} 看完再繼續。`);
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});

  function updateError(){const v=Number($('es-delta').value),truth=.5*(1+v)**2,lin=.5+v,err=.5*v*v;$('es-delta-out').value=`${v.toFixed(2)} V`;$('es-true-linear').textContent=`${truth.toFixed(5)} / ${lin.toFixed(5)} mA`;$('es-absolute').textContent=`${err.toFixed(5)} mA`;$('es-relative').textContent=v===0?'不適用（增量為 0）':`${(Math.abs(v)*50).toFixed(2)}%`;$('es-errorplot-point').setAttribute('fill','#78e2ca');$('es-errorplot-point').style.fill='#78e2ca';$('es-errorplot-point').setAttribute('cx',100+430*(v+.5));$('es-errorplot-linear').setAttribute('cx',100+430*(v+.5));$('es-errorplot-linear').setAttribute('cy',335-245*lin/1.2);$('es-errorplot-point').setAttribute('cy',335-245*truth/1.2);$('es-error-why').textContent=v===0?'回到 Q 點：真值與切線相同，相對增量誤差的分母為零。':`二次項永遠非負；目前被忽略的彎曲佔一次增量 ${Math.abs(v)*50}%。${Math.abs(v)>.1?'幅度增大，局部直線近似變差。':'靠近工作點，直線近似較好。'}`;}
  function updateCurrent(){const i=Number($('es-idq').value),vov=Math.sqrt(2*i),gm=vov,ro=50/i;$('es-idq-out').value=`${i.toFixed(2)} mA`;$('es-vov').textContent=`${vov.toFixed(6)} V`;$('es-gmro').textContent=`${gm.toFixed(6)} mS / ${ro.toFixed(3)} kΩ`;$('es-intrinsic').textContent=(gm*ro).toFixed(6);for(const [id,val,max] of [['es-gmtrend',gm,2.1],['es-rotrend',ro,220]]){$(id+'-point').setAttribute('cx',100+430*(i-.25)/1.75);$(id+'-point').setAttribute('cy',335-245*val/max);}$('es-current-why').textContent='增加直流電流讓 gm 依平方根上升，但 ro 反比下降，因此這組模型的 gm ro 會下降。偏壓電流提高不保證電壓增益提高。';}
  $('es-delta').addEventListener('input',updateError);document.querySelectorAll('[data-delta]').forEach(b=>b.addEventListener('click',()=>{$('es-delta').value=b.dataset.delta;updateError();}));
  $('es-idq').addEventListener('input',updateCurrent);document.querySelectorAll('[data-idq]').forEach(b=>b.addEventListener('click',()=>{$('es-idq').value=b.dataset.idq;updateCurrent();}));updateError();updateCurrent();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-smallsignal-v1';
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

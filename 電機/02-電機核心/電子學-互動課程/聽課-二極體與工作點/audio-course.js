(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const colors={mint:'#78e2ca',amber:'#ffc67b',blue:'#8db8ff'};
  document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden"><defs>'+Object.entries(colors).map(([n,c])=>`<marker id="ed-${n}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('')+'</defs></svg>');
  const line=(a,b,c,d,cls='axis',arrow=false,id='')=>`<line ${id?`id="${id}"`:''} x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${cls}"${arrow?` marker-end="url(#ed-${cls.split(' ')[0]}-arrow)"`:''}/>`;
  const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
  const svg=(id,title,body,h=410)=>`<svg viewBox="0 0 600 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
  const take=(label,v)=>`<div class="takeaway"><span>${label}</span><strong>${v}</strong></div>`;
  const ion=(x,y,sign,cls)=>`<rect x="${x-20}" y="${y-20}" width="40" height="40" rx="4" class="${cls}"/>${txt(x,y+8,sign,`${cls}-fill`,'middle')}`;
  const carrier=(x,y,sign,cls)=>`<circle cx="${x}" cy="${y}" r="18" class="${cls}"/>${sign?txt(x,y+8,sign,`${cls}-fill`,'middle'):''}`;
  const carriers=svg('ed-carriers-art','左p型多數載子是電洞，固定受體離子負；右n型多數載子是電子，固定施體離子正。原先整體電中性。',txt(160,45,'p 型','mint-fill','middle')+txt(440,45,'n 型','blue-fill','middle')+line(300,60,300,365,'grid')+[100,160,220].map(x=>carrier(x,120,'','mint')).join('')+[380,440,500].map(x=>carrier(x,120,'−','blue')).join('')+txt(160,180,'移動電洞','mint-fill','middle')+txt(440,180,'移動電子','blue-fill','middle')+[110,210].map(x=>ion(x,260,'−','mint')).join('')+[390,490].map(x=>ion(x,260,'+','blue')).join('')+txt(160,325,'固定受體離子','mint-fill','middle')+txt(440,325,'固定施體離子','blue-fill','middle')+txt(300,390,'原先整體電中性','muted-text','middle'),425);
  const equilibrium=svg('ed-equilibrium-art','p在左n在右，空乏層左負右正，內建電場由右向左。電子擴散向左，電洞擴散向右。',txt(95,45,'p 型','mint-fill','middle')+txt(505,45,'n 型','blue-fill','middle')+'<rect x="175" y="90" width="250" height="170" rx="12" fill="#ffffff07"/>'+[130,210].map(y=>ion(235,y,'−','mint')+ion(365,y,'+','blue')).join('')+line(420,60,180,60,'amber',true)+txt(300,35,'內建電場 E','amber-fill','middle')+txt(300,300,'空乏層：移動載子少','muted-text','middle')+line(470,355,130,355,'blue',true)+txt(300,340,'電子擴散 n → p','blue-fill','middle')+line(130,430,470,430,'mint',true)+txt(300,415,'電洞擴散 p → n','mint-fill','middle')+txt(300,490,'熱平衡：漂移與擴散電流抵消','muted-text','middle'),520);
  function biasRow(y,forward){const left=forward?'+':'−',right=forward?'−':'+';return txt(300,y,forward?'順偏：p 接正、n 接負':'反偏：p 接負、n 接正','', 'middle')+`<rect x="80" y="${y+30}" width="440" height="85" rx="12" fill="#78e2ca09"/><rect x="${forward?275:210}" y="${y+30}" width="${forward?50:180}" height="85" fill="#ffc67b33"/>`+txt(120,y+83,'p','mint-fill')+txt(465,y+83,'n','blue-fill')+txt(45,y+83,left,'amber-fill','middle')+txt(555,y+83,right,'amber-fill','middle')+txt(300,y+155,forward?'障壁降低 · 空乏層變窄':'障壁升高 · 空乏層變寬','muted-text','middle');}
  const bias=svg('ed-bias-art','上排順偏左正右負空乏層較窄；下排反偏左負右正空乏層較寬。',biasRow(45,true)+biasRow(270,false),465);
  const circuit=svg('ed-circuit','5伏特電源與1千歐姆電阻、順向二極體串聯閉合回路，電流進陽極A，陰極K回負端。','<path d="M100 145V80H220l10-12 10 24 10-24 10 24 10-24 10 24 10-12H460V150M460 210V290H100V215" class="wire"/><circle cx="100" cy="180" r="35" class="blue"/>'+txt(100,174,'+','blue-fill','middle')+txt(100,203,'−','blue-fill','middle')+'<path d="M430 150H490L460 200Z" class="mint"/>'+line(425,200,495,200,'mint')+line(460,200,460,210,'mint')+line(345,45,405,45,'amber',true)+txt(420,51,'i','amber-fill')+txt(270,127,'1 kΩ','','middle')+txt(100,255,'5 V','blue-fill','middle')+txt(590,157,'A 陽極','mint-fill','end')+txt(590,213,'K 陰極','mint-fill','end')+txt(300,350,'電流進入陽極 → 陰極','muted-text','middle'),390);
  const diodeCurrent=v=>1e-12*Math.expm1(v/.02585);
  function operatingPoint(source){if(source===0)return {v:0,i:0};let lo=0,hi=source;for(let k=0;k<100;k++){const v=(lo+hi)/2;if(diodeCurrent(v)>(source-v)/1000)hi=v;else lo=v;}const v=(lo+hi)/2;return {v,i:(source-v)/1000};}
  const px=v=>80+450*v/.8,py=i=>340-255*i/6;
  const linePath=source=>`M${px(0)} ${py(source)}L${px(Math.min(.8,source))} ${py(Math.max(0,source-.8))}`;
  function graph(id,source){const q=operatingPoint(source);let curve='';const end=.02585*Math.log1p(.006/1e-12);for(let k=0;k<=240;k++){const v=end*k/240;curve+=`${k?'L':'M'}${px(v).toFixed(3)} ${py(diodeCurrent(v)*1000).toFixed(3)}`;}return svg(id,'橫軸二極體端電壓0到0.8伏特，縱軸電流0到6毫安培，綠色指數曲線與橘色負載線交會。',txt(80,40,'iD（mA）','muted-text')+[0,2,4,6].map(i=>line(80,py(i),530,py(i),'grid')+txt(62,py(i)+8,i,'tiny-text','end')).join('')+[0,.2,.4,.6,.8].map(v=>line(px(v),85,px(v),340,'grid')+txt(px(v),378,String(v),'tiny-text','middle')).join('')+line(80,85,80,340)+line(80,340,530,340)+`<path d="${curve}" class="curve"/><path id="${id}-load" d="${linePath(source)}" class="amber"/><circle id="${id}-point" cx="${px(q.v)}" cy="${py(q.i*1000)}" r="7" class="point"/>`+txt(530,418,'vD（V）','muted-text','end'),445);}
  const modelDetails='<p>二極體（diode）：A 陽極 anode，K 陰極 cathode（符號橫線側）。端電壓 vD = vA − vK，正電流由 A 流向 K。</p><p>理想模型：導通 vD = 0、iD ≥ 0；截止 iD = 0、vD ≤ 0。恆壓降模型：導通 vD = 0.7 V、iD ≥ 0；截止 iD = 0、vD ≤ 0.7 V。先假設狀態，算完檢查條件。</p><p>指數模型是固定溫度、未擊穿範圍的教學模型；不包含高電流串聯電阻、溫升與切換電容。</p>';
  const expDetails='<p>指數（exponential）把等量輸入增加轉成固定倍數；自然對數（natural logarithm, ln）反過來由倍數求所需輸入。參數：Is = 10⁻¹² A，n = 1，VT = 0.02585 V，R = 1000 Ω。</p><p class="equation">iD = Is[exp(vD/(nVT)) − 1]<br>vD = nVT ln(1 + iD/Is)<br>Vs = RiD + vD<br>負載線：iD = (Vs − vD)/R</p><p>exp 是自然指數函數；充分順偏 iD ≫ Is 時，每增加 nVT，電流近似乘 e。嚴格而言按此倍數變化的是 iD + Is。</p><p>在 0 ≤ vD ≤ Vs 二分：若指數電流大於電阻電流，縮低上界；反之提高下界。兩曲線一增一減，因此這個非負來源案例交點唯一。圖只放大 0–0.8 V；5 V 負載線的橫截距在畫面外。</p>';
  const figures=[
    {id:'ed-carriers',short:'01 載子角色',title:'先分清會動的載子與固定離子。',subtitle:'p 在左、n 在右；圓形是載子，方框是固定離子。',look:'看圖一：上排圓形是移動載子，下排方框是固定離子；p 側受體負，n 側施體正。看完按繼續。',diagram:carriers,takeaways:take('材料原先','整體電中性')+take('電洞','缺電子的有效描述'),extra:'<p class="formula-main">電子帶負電；電洞以有效正載子描述。<br>電洞移動 ≠ 質子在晶體裡移動。</p>',detail:'<p>電子 electron；電洞 hole；施體 donor；受體 acceptor。n 型多數載子為電子，p 型多數載子為電洞，兩者也都有少數載子。圖為角色示意，非濃度、比例或原子尺度圖。</p><p>施體提供電子後成固定正離子；受體接受電子後成固定負離子。均勻區域中，移動載子與固定電荷原先大致平衡，n/p 名稱不表示整塊帶負/正淨電荷。</p>'},
    {id:'ed-equilibrium',short:'02 接面平衡',title:'濃度差留下電荷，電荷建立電場。',subtitle:'圖上擴散箭頭是載子移動方向；不是傳統電流箭頭。',look:'看圖二：空乏層 p 側負、n 側正，內建電場 n → p；再看下方兩個擴散方向。看完按繼續。',diagram:equilibrium,takeaways:take('內建電場','n → p')+take('熱平衡','淨電流零，微觀仍運動'),extra:'<p class="formula-main">擴散：濃度差驅動。漂移：電場驅動。<br>平衡時兩者的電流貢獻抵消。</p>',detail:'<p>擴散 diffusion；漂移 drift；空乏層 depletion region。電子擴散 n → p，電洞擴散 p → n。復合及載子重分布使接面附近多數移動載子減少，留下 p 側負受體離子與 n 側正施體離子。</p><p>內建電場由正向負，即 n → p。負電子受力方向與電場相反，正的有效電洞受力與電場同向，所以都阻礙多數載子繼續擴散。電子移動方向與它造成的傳統電流相反；電洞移動方向與傳統電流相同。</p><p>內建電位描述內部障壁，不可直接當作外端可取用的電池電壓；熱平衡接面不持續對外供功。</p>'},
    {id:'ed-bias',short:'03 外加偏壓',title:'外接極性，改變障壁。',subtitle:'同樣 p 左 n 右，改變的是外加端電壓；寬窄為趨勢示意。',look:'看圖三：比對上下兩排外接正負端，再比空乏層寬窄與障壁短句。看完按繼續。',diagram:bias,takeaways:take('順向偏壓 forward bias','障壁降低，電流增加')+take('反向偏壓 reverse bias','未擊穿：小漏電'),extra:'<p class="formula-main">內建電位 ≠ 外加端電壓 ≠ 0.7 V 模型壓降。<br>真實順向關係連續，沒有通用的 0.7 V 硬開關。</p>',detail:'<p>順偏 p 接較高電位、n 接較低電位；反偏相反。簡化接面模型中，順偏降低障壁並縮窄空乏層，反偏升高障壁並加寬空乏層。反向仍有少數載子相關漏電；擊穿 breakdown 超出本課簡化指數模型。</p><p>0.7 V 只是特定手算近似；實際端電壓隨電流、材料、結構與溫度改變。不能把內建電位與端電壓直接混用。</p>'},
    {id:'ed-model',short:'04 比較模型',title:'先選模型，再算同一個回路。',subtitle:'固定 5 V、1 kΩ。陽極 A 朝電源正，陰極 K 回負端。',look:'看圖四：沿回路確認串聯與 A/K，再比三個模型的電流與壓降卡。本圖固定五伏特。看完按繼續。',diagram:circuit,takeaways:take('理想導通','0 V / 5.000 mA')+take('0.7 V 恆壓降','0.7 V / 4.300 mA')+take('指數模型','0.574147 V / 4.425853 mA'),extra:'<p class="formula-main">電阻承受「電源減去二極體」的電壓。<br>固定 0.7 V 是近似，不是所有元件的固定門檻。</p>',detail:modelDetails+expDetails},
    {id:'ed-loadline',short:'05 找工作點',title:'兩條關係，交在同一個工作點。',subtitle:'橫軸端電壓，縱軸電流；本圖固定 Vs = 5 V。',look:'看圖五：橘線是外電路，綠線是二極體；交點同時滿足兩者。看下方卡，兩個壓降相加成五伏特。看完按繼續。',diagram:graph('ed-fixed-plot',5),takeaways:take('vD','0.574147 V')+take('iD','4.425853 mA')+take('電阻壓降','4.425853 V'),extra:'<div class="diagram-legend"><span class="legend-mint">綠：二極體指數曲線</span><span class="legend-amber">橘：電阻負載線與交點</span></div><p class="formula-main">工作點 Q：兩條關係同時成立。<br>Vs = RiD + vD；iD = (Vs − vD) / R</p>',detail:expDetails},
    {id:'ed-source',short:'06 改電源',title:'改變電源，找新的交點。',subtitle:'只改 Vs，R = 1 kΩ 與元件曲線固定；圖四、五不變。',look:'看圖六：依序按 5、0.5、0 V，比較指數與 0.7 V 模型；小電流請看數值卡。看完按繼續。',diagram:graph('ed-source-plot',5),takeaways:take('指數模型 vD','<span id="ed-v-result">—</span>')+take('指數模型 iD','<span id="ed-i-result">—</span>')+take('恆壓降模型','<span id="ed-constant-result">—</span>'),extra:'<div class="diagram-legend"><span class="legend-mint">綠：元件曲線固定</span><span class="legend-amber">橘：外電路改變</span></div><div class="phase-controls"><label for="ed-source-v">電源 Vs <output id="ed-source-output">5.0 V</output></label><input id="ed-source-v" type="range" min="0" max="5" step="0.1" value="5"><div class="preset-controls"><button type="button" data-source="0">0 V</button><button type="button" data-source="0.5">0.5 V</button><button type="button" data-source="5">5 V</button></div><p id="ed-source-why" aria-live="polite"></p></div>',detail:'<p>這是多個直流工作點的比較，不是隨時間切換的暫態模擬。0.7 V 模型採 iD = max(0, (Vs − 0.7)/1000)，導通時 vD = 0.7；截止時 vD = Vs。低來源時不可把負的候選電流當成導通解。</p><p>Vs = 0.5 V：恆壓降模型截止，iD = 0、vD = 0.5 V；指數模型 vD = 0.455338 V、iD = 0.044662 mA。小電流靠近圖軸，但不等於零。Vs = 0 時兩模型皆為零。</p>'+expDetails}
  ];
  $('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><div class="diagram">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways}</div><details class="figure-details"><summary>想知道細節，再展開</summary>${f.detail}</details></article>`).join('');
  $('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
  function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
  $('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
  function updateSource(){const source=Number($('ed-source-v').value),q=operatingPoint(source);$('ed-source-output').value=`${source.toFixed(1)} V`;$('ed-source-plot-load').setAttribute('d',linePath(source));$('ed-source-plot-point').setAttribute('cx',px(q.v));$('ed-source-plot-point').setAttribute('cy',py(q.i*1000));$('ed-v-result').textContent=`${q.v.toFixed(6)} V`;$('ed-i-result').textContent=`${(q.i*1000).toFixed(6)} mA`;$('ed-constant-result').textContent=source>.7?`導通 ${(source-.7).toFixed(3)} mA / 0.7 V`:`${source===.7?'邊界':'截止'} 0 mA / ${source.toFixed(1)} V`;$('ed-source-why').textContent=source===0?'兩模型同為 0；熱平衡的微觀運動不等於外部淨電流。':source<=.7?'恆壓降模型電流為零；指數模型仍有小正電流。差異來自近似，歐姆定律仍適用於電阻。':'電源提高時交點電流升高，二極體端電壓緩增；電流由元件與外電路共同決定。';}
  $('ed-source-v').addEventListener('input',updateSource);document.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>{$('ed-source-v').value=b.dataset.source;updateSource();}));updateSource();
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-diode-v1';
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

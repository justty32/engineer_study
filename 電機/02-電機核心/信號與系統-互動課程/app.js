"use strict";
/* 信號與系統（零基礎互動課）— 單一 hook 檔
   唯一依據：BUILD-SPEC.md（第 4、6、7 節）。
   確定性：不用亂數、不用時鐘、不用計時器、不用瀏覽器儲存、不連網。 */

/* ---------- 1. helper ---------- */
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const val=x=>Number($(x).value),pick=x=>$(x).value;
const fmt=(x,n=6)=>Number(x).toFixed(n),exp=(x,n=6)=>Number(x).toExponential(n);
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const db20=x=>20*Math.log10(x),db10=x=>10*Math.log10(x);
const sinc=x=>x===0?1:Math.sin(Math.PI*x)/(Math.PI*x);   // 歸一化 sinc，全檔唯一定義
/* 三角函式殘差夾零：sin／cos 及其比值的量級恆為 O(1)，理論上為 0 的點（sin π、cos 90°、
   sinc 的零點、移動平均的零點）在浮點下會留下 1e−16 量級的殘差，直接印出來會讓
   「完全被濾掉」「兩組樣本完全相同」這類判讀句自相矛盾。**只夾在三角量產生的當下**，
   不動 num6() 的通用行為——splane 的包絡、filterorder 的倍數、convolve 的深放電值
   都是規格明文要求以指數格式顯示的真值，不得經過這個函式。 */
const trig0=x=>Math.abs(x)<1e-12?0:x;

/* ---------- 2. 常數與慣例（唯一定義處，與 PROJECT-BRIEF 第 7 節一致） ---------- */
const SQRT1_2=Math.SQRT1_2;          // 0.7071067812
const DB3=10*Math.log10(2);          // 3.010300 dB
const MINUS="−";                // U+2212，畫面上的負號
const MU="µ";                   // U+00B5，micro sign
const CONV="∗";                 // U+2217，摺積符號

/* 統一數字格式：絕對值落在 [1e-4, 1e7) 用 6 位小數，否則指數格式；零一律 0.000000。
   格式化後把 ASCII 連字號換成 U+2212，畫面上不出現半形負號。 */
function num6(x){
  const v=Number(x);
  if(!isFinite(v))return "無限大";
  if(v===0)return "0.000000";
  const a=Math.abs(v);
  if(a>=1e-4&&a<1e7)return fmt(v,6).replace(/-/g,MINUS);
  return sci(v);
}
/* §4 有幾個欄位明文要求「指數格式」，但它們的值落在 num6 的定點區間 [1e-4, 1e7)
   （例 6.366198 × 10⁻⁴、1.250000 × 10⁻⁴）。這個 helper 只用在那些欄位，
   把 exp(x,6) 的 e 記號改寫成規格表格採用的 m × 10^e 形式。 */
function sci(x){
  const v=Number(x);
  if(!isFinite(v))return INF_TXT;
  if(v===0)return "0.000000";
  const parts=exp(v,6).split("e");
  return parts[0].replace(/-/g,MINUS)+" × 10<sup>"+parts[1].replace(/^\+/,"").replace(/-/g,MINUS)+"</sup>";
}
const INF_TXT="無限大";

/* ---------- 3. 十六個章節守衛函式 ---------- */

/* 00 世界觀：一階系統的增益、相位、相位延遲、群延遲 */
function sysmap(){
  if(!$('map-f'))return;
  const draw=()=>{
    const f=val('map-f'),fc=val('map-fc'),a=val('map-a');
    const r=f/fc;
    const mag=1/Math.sqrt(1+r*r);
    const db=db20(mag);
    const ph=-Math.atan(r)*180/Math.PI;
    const out=a*mag;
    const tp=Math.abs(ph)/(360*f);
    const tg=(1/(2*Math.PI*fc))/(1+r*r);
    let judge;
    if(r<0.1){
      judge="<strong>常數增益區</strong>：增益幾乎是 1、相位幾乎是 0，這個系統在這個頻率就只是一根電線"+MINUS+MINUS+"<strong>這種情況不需要本課</strong>。";
      if(r<1e-3)judge+="現在的頻率比 f<sub>c</sub> 小到看不出差別，但它<strong>不是零</strong>：增益仍然是 "+num6(mag)+"，只是小數點後好幾位才看得出來。";
    }else if(r<10){
      judge="<strong>動態區</strong>：增益與相位都在明顯變化，同一個系統對不同頻率的處理不同，<strong>這就是整門課要處理的事</strong>。";
    }else{
      judge="<strong>衰減區</strong>：訊號被壓掉超過 20 dB（現在是 "+num6(db)+" dB），這個頻率成分幾乎被系統丟掉了。";
    }
    $('sysmap-output').innerHTML=
      "<p>頻率比 r ＝ f/f<sub>c</sub> ＝ <strong>"+num6(r)+"</strong>｜增益 |H| ＝ <strong>"+num6(mag)+"</strong>（<strong>"+num6(db)+" dB</strong>）</p>"+
      "<p>輸出振幅 A·|H| ＝ <strong>"+num6(out)+" V</strong>｜相位 ∠H ＝ <strong>"+num6(ph)+"°</strong></p>"+
      "<p>相位延遲 t<sub>p</sub> ＝ <strong>"+num6(tp)+" s</strong>（＝ "+num6(tp*1e6)+" "+MU+"s）｜群延遲 τ<sub>g</sub> ＝ <strong>"+num6(tg)+" s</strong>（＝ "+num6(tg*1e6)+" "+MU+"s）</p>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：系統之所以會「挑頻率」，是因為它<strong>有記憶</strong>（要充放電），輸出取決於過去而不只是現在。</p>"+
      "<p>量級對照："+MINUS+"3 dB 就是掉到 70.7 %，功率剩一半；這是全業界定義頻寬的門檻。</p>"+
      "<p>邊界提醒：振幅滑桿 A 只縮放輸出振幅，<strong>不影響 |H|、相位與延遲</strong>——它們只由 f 與 f<sub>c</sub> 的比值決定。</p>";
  };
  ['map-f','map-fc','map-a'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 01 訊號的分類：能量、功率、rms、奇偶 */
function sigclass(){
  if(!$('cls-type'))return;
  const draw=()=>{
    const ty=pick('cls-type'),a=val('cls-a'),tau=val('cls-tau'),f=val('cls-f');
    let E=null,Einf=false,P=0,rms=null,T=null,parity="",name="",uses="";
    if(ty==='exp'){
      name="衰減指數 A·exp("+MINUS+"t/τ)·u(t)";uses="振幅 A 與時間參數 τ";
      E=a*a*tau/2;P=0;parity="t &lt; 0 恆為 0，所以<strong>非奇非偶</strong>";
    }else if(ty==='sine'){
      name="弦波 A·cos(2πft)";uses="振幅 A 與弦波頻率 f";
      Einf=true;P=a*a/2;rms=a/Math.SQRT2;T=1/f;parity="cos 是<strong>偶函數</strong>";
    }else if(ty==='rect'){
      name="矩形脈衝（高 A、寬 T、以 t ＝ 0 為中心）";uses="振幅 A 與脈衝寬 T";
      E=a*a*tau;P=0;parity="以 t ＝ 0 為中心，所以是<strong>偶函數</strong>";
    }else{
      name="單位步階 A·u(t)";uses="振幅 A";
      Einf=true;P=a*a/2;rms=a/Math.SQRT2;parity="t &lt; 0 恆為 0，所以<strong>非奇非偶</strong>";
    }
    const energySignal=(ty==='exp'||ty==='rect');
    let judge;
    if(energySignal){
      judge="<strong>能量訊號</strong>：總能量有限（E ＝ "+num6(E)+" V²·s），因為訊號終究會消失；能量有限的訊號平均功率一定是 0，所以問它的功率沒有意義。";
      if(ty==='exp'&&a<=0.6&&tau<=0.2)judge+="現在又矮又短，能量自然小。";
    }else{
      judge="<strong>功率訊號</strong>：能量發散（訊號永遠不停），只能問「平均每秒多少」。P ＝ "+num6(P)+" V²，rms ＝ √P ＝ "+num6(rms)+" V。";
    }
    $('sigclass-output').innerHTML=
      "<p>這個模式（"+name+"）只用到 <strong>"+uses+"</strong>，其餘滑桿不影響結果。</p>"+
      "<p>能量 E ＝ <strong>"+(Einf?INF_TXT:num6(E)+" V²·s")+"</strong>｜平均功率 P ＝ <strong>"+num6(P)+" V²</strong>｜rms ＝ <strong>"+(rms===null?"不適用":num6(rms)+" V")+"</strong></p>"+
      (T===null?"":"<p>基本週期 T ＝ 1/f ＝ <strong>"+num6(T)+" s</strong></p>")+
      "<p>奇偶判定："+parity+"</p>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：能量或功率有限與否，決定了下一步該用傅立葉轉換（能量訊號）還是傅立葉級數（週期功率訊號）——這是第 05、06 章分家的原因。</p>"+
      "<p>量級對照：市電 110 V 指的是 rms，峰值是 110 × √2 ＝ 155.563492 V。</p>"+
      "<p>邊界提醒：弦波與步階的能量在數學上就是發散的，這裡一律寫成文字「"+INF_TXT+"」，不是程式算壞。</p>";
  };
  ['cls-type','cls-a','cls-tau','cls-f'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 02 基本訊號與運算：平移、反轉、縮放與 δ 的篩選性 */
function sigops(){
  if(!$('ops-base'))return;
  const base=(ty,arg)=>{
    if(ty==='exp')return arg>=0?Math.exp(-arg):0;
    if(ty==='step')return arg>=0?1:0;
    if(ty==='ramp')return arg>=0?arg:0;
    return trig0(Math.cos(2*Math.PI*arg));
  };
  const draw=()=>{
    const ty=pick('ops-base'),a=val('ops-a'),t0=val('ops-t0'),t=val('ops-t');
    const arg=a*(t-t0);
    const y=base(ty,arg);
    const sift=base(ty,t0);
    const causal=(ty==='exp'||ty==='step'||ty==='ramp');
    let judge;
    if(a===0){
      judge="a ＝ 0：整條時間軸被壓成一個點，y 恆等於 x(0) ＝ <strong>"+num6(base(ty,0))+"</strong>，這是退化情形。";
    }else if(arg<0&&causal){
      judge="輸出是 0：因果訊號在引數為負的地方沒有值，<strong>這不是壞掉，是 u( ) 的定義</strong>。";
    }else{
      judge="引數 arg ＝ "+num6(arg)+" ≥ 0，訊號在這一點確實有值。";
    }
    let scaleTxt;
    if(a>0)scaleTxt="時間軸<strong>壓縮 "+num6(a)+" 倍</strong>"+(a<1?"（a &lt; 1 其實是拉伸）":"");
    else if(a<0)scaleTxt="<strong>時間反轉</strong>並壓縮 "+num6(Math.abs(a))+" 倍：現在看到的是原訊號另一側的值";
    else scaleTxt="a ＝ 0，時間軸退化成一個點";
    const shiftTxt=t0>0?"<strong>延後 "+num6(t0)+" 秒</strong>（訊號往右移）":(t0<0?"<strong>提前 "+num6(Math.abs(t0))+" 秒</strong>":"不平移");
    $('sigops-output').innerHTML=
      "<p>目前的變換：先把"+scaleTxt+"，再"+shiftTxt+"。</p>"+
      "<p>內部引數 arg ＝ a(t "+MINUS+" t<sub>0</sub>) ＝ <strong>"+num6(arg)+"</strong>｜輸出 y(t) ＝ <strong>"+num6(y)+"</strong></p>"+
      "<p>篩選性 ∫ x(τ)δ(τ "+MINUS+" t<sub>0</sub>) dτ ＝ x(t<sub>0</sub>) ＝ <strong>"+num6(sift)+"</strong></p>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：δ 不是一個很高很窄的脈衝而已——它的用途是<strong>把一條曲線在某一點的值挑出來</strong>，第 04 章的摺積就是靠這件事把任意輸入拆成無限多個延遲脈衝。</p>"+
      "<p>邊界提醒：本 widget 算的是 x(a(t "+MINUS+" t<sub>0</sub>))；如果你在課本看到 x(at "+MINUS+" b)，真正的平移量是 b/a 不是 b。</p>";
  };
  ['ops-base','ops-a','ops-t0','ops-t'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 03 系統的六個性質：疊加測試與判定表 */
function syscheck(){
  if(!$('chk-sys'))return;
  const TABLE={
    gain:{name:"y(t) ＝ 2x(t)",p:["是","是","是","是","是","是"],note:"六條全過：這是最單純的 LTI 無記憶系統。"},
    square:{name:"y(t) ＝ x(t)²",p:["否","是","是","是","是","否"],note:"殘差來自交叉項 2ab·x<sub>1</sub>x<sub>2</sub>，<strong>振幅愈大殘差愈大</strong>；而且 +1 與 "+MINUS+"1 送到同一個輸出，所以不可逆。"},
    bias:{name:"y(t) ＝ x(t) + 3",p:["否","是","是","是","是","是"],note:"殘差固定是 3 "+MINUS+" 3(a + b)，<strong>與輸入無關</strong>——毛病出在那個常數偏移，不在訊號上。這種系統叫仿射（affine）。"},
    delay:{name:"y(t) ＝ x(t "+MINUS+" 1)",p:["是","是","是","是","否","是"],note:"延遲一秒需要記住過去，所以<strong>有記憶</strong>；但它仍然是完整的 LTI 系統。"},
    scale:{name:"y(t) ＝ x(2t)",p:["是","否","否","是","否","是"],note:"這是本課唯一<strong>時變</strong>的例子：把輸入延後 1 秒，輸出只延後 0.5 秒。它還會用到未來的輸入，所以也不因果。"},
    integ:{name:"y(t) ＝ ∫ x(τ)dτ",p:["是","是","是","否","否","是"],note:"有界輸入 u(t) 產生無界輸出 t·u(t)，<strong>BIBO 不成立</strong>。"}
  };
  const LABEL=["線性","時不變","因果","BIBO 穩定","無記憶","可逆"];
  const draw=()=>{
    const sys=pick('chk-sys'),a=val('chk-a'),b=val('chk-b'),x1=val('chk-x1'),x2=val('chk-x2');
    const u=a*x1+b*x2;
    let lhs,rhs;
    if(sys==='square'){lhs=u*u;rhs=a*x1*x1+b*x2*x2;}
    else if(sys==='bias'){lhs=u+3;rhs=a*(x1+3)+b*(x2+3);}
    else if(sys==='gain'){lhs=2*u;rhs=a*2*x1+b*2*x2;}
    else{lhs=u;rhs=u;}
    const res=lhs-rhs;
    const info=TABLE[sys];
    let props="";
    for(let i=0;i<6;i++)props+="<li>"+LABEL[i]+"："+(info.p[i]==="是"?"是":"<strong>否</strong>")+"</li>";
    const judge=Math.abs(res)<1e-12
      ? "疊加成立（殘差 "+num6(0)+"）：<strong>這一組測試沒有推翻線性</strong>。注意單一組測試不能證明線性，只能推翻它。"
      : "<strong>線性被推翻</strong>：左式 "+num6(lhs)+"、右式 "+num6(rhs)+"、殘差 "+num6(res)+"。一個反例就夠了。";
    const zeroNote=(a===0&&b===0)
      ? "<p>邊界提醒：兩個係數都是 0，測試訊號整個消失；<code>bias</code> 的殘差仍然是 <strong>"+num6(3)+"</strong>（通式 3 "+MINUS+" 3(a + b)），其餘系統的殘差都是 "+num6(0)+"，測不出東西——<strong>這說明測試要挑得夠好</strong>。</p>"
      : "<p>邊界提醒：把 a、b、x<sub>1</sub>、x<sub>2</sub> 都推到 "+MINUS+"3，平方系統的殘差會衝到 "+num6(378)+"；把 a 與 b 都設成 0，只有偏移系統還留得下痕跡。</p>";
    $('syscheck-output').innerHTML=
      "<p>受測系統：<strong>"+info.name+"</strong></p><ul>"+props+"</ul>"+
      "<p>疊加測試 T{a·x<sub>1</sub> + b·x<sub>2</sub>}：左式 <strong>"+num6(lhs)+"</strong>｜右式 a·T{x<sub>1</sub>} + b·T{x<sub>2</sub>} ＝ <strong>"+num6(rhs)+"</strong>｜殘差 <strong>"+num6(res)+"</strong></p>"+
      "<p>"+judge+"</p><p>"+info.note+"</p>"+
      "<p>為什麼：六個性質裡只有<strong>線性＋時不變</strong>能換來「一個 h 就描述整個系統」的特權，這就是下一章只談 LTI 的原因。</p>"+
      zeroNote;
  };
  ['chk-sys','chk-a','chk-b','chk-x1','chk-x2'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 04 摺積：矩形脈衝通過一階系統 */
function convolve(){
  if(!$('cnv-a'))return;
  const draw=()=>{
    const a=val('cnv-a'),t1=val('cnv-t1'),tau=val('cnv-tau'),t=val('cnv-t');
    const m=Math.min(t,t1);
    const y=t<=0?0:a*tau*Math.exp(-t/tau)*(Math.exp(m/tau)-1);
    const peak=a*tau*(1-Math.exp(-t1/tau));
    const areaX=a*t1,areaH=tau,areaY=a*t1*tau;
    let judge;
    if(t<=0)judge="t ≤ 0：輸入還沒到，輸出是 "+num6(0)+"。<strong>因果系統不會提前反應</strong>。";
    else if(t<=t1)judge="<strong>充電段</strong>：輸入還在，輸出朝 A·τ ＝ "+num6(a*tau)+" 爬升，每過一個 τ 走完剩餘距離的 63.2 %。";
    else judge="<strong>放電段</strong>：輸入結束了，但輸出不會馬上歸零——系統有記憶，它在把存下來的東西吐出來。";
    let speed;
    if(tau<t1/5)speed="系統比脈衝快得多（τ ＜ T<sub>1</sub>/5），輸出幾乎複製輸入的形狀。";
    else if(tau>t1*5)speed="系統比脈衝慢得多（τ ＞ 5T<sub>1</sub>），輸出幾乎只看到「總面積」，形狀被抹平——<strong>這就是低通濾波在時間域的樣子</strong>。";
    else speed="τ 與 T<sub>1</sub> 同一個量級，輸出既有明顯的上升也有明顯的拖尾，是最能看出「記憶」的區間。";
    $('convolve-output').innerHTML=
      "<p>輸出 y(t) ＝ <strong>"+num6(y)+" V</strong>｜峰值 <strong>"+num6(peak)+"</strong>，發生在 t ＝ <strong>"+num6(t1)+" s</strong>（脈衝結束的瞬間）</p>"+
      "<p>面積檢查：輸入面積 ∫x dt ＝ <strong>"+num6(areaX)+"</strong> × 脈衝響應面積 ∫h dt ＝ <strong>"+num6(areaH)+"</strong> ＝ 輸出面積 ∫y dt ＝ <strong>"+num6(areaY)+"</strong></p>"+
      "<p>"+judge+"</p><p>"+speed+"</p>"+
      "<p>為什麼：摺積把兩條曲線的面積相乘，這是最好用的驗算：如果你算出來的 y 面積不等於 A·T<sub>1</sub>·τ，一定有地方錯了。這裡算的是 y(t) ＝ x(t) "+CONV+" h(t)。</p>"+
      "<p>邊界提醒：把 τ 拉到最小、T<sub>1</sub> 拉到最大再把 t 推到 6 s，y 會小到要用指數格式才寫得出來，但它<strong>不是 0</strong>——指數衰減永遠不會真的到 0。</p>";
  };
  ['cnv-a','cnv-t1','cnv-tau','cnv-t'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 05 傅立葉級數：三種波形的諧波與累積功率 */
function fourierseries(){
  if(!$('fsr-wave'))return;
  const bn=(wave,n,a)=>{
    if(wave==='square')return n%2===1?4*a/(n*Math.PI):0;
    if(wave==='triangle')return n%2===1?8*a/(Math.PI*Math.PI*n*n)*Math.pow(-1,(n-1)/2):0;
    return 2*a/(n*Math.PI)*Math.pow(-1,n+1);
  };
  const draw=()=>{
    const wave=pick('fsr-wave'),a=val('fsr-a'),N=val('fsr-n'),f0=val('fsr-f0');
    const Ptot=wave==='square'?a*a:a*a/3;
    let acc=0;
    for(let n=1;n<=N;n++){const b=bn(wave,n,a);acc+=b*b/2;}
    const share=acc/Ptot*100;
    let rows="",count=0;
    for(let n=1;n<=200&&count<5;n++){
      const b=bn(wave,n,a);
      if(Math.abs(b)>1e-12){rows+="<li>n ＝ "+n+"｜"+num6(n*f0)+" Hz｜|b<sub>n</sub>| ＝ "+num6(Math.abs(b))+"</li>";count++;}
    }
    let judge;
    if(share<90)judge="<strong>還差得遠</strong>：前 "+N+" 個諧波只湊到 "+num6(share)+" %，波形的稜角還原不出來。";
    else if(share<99)judge="<strong>形狀出來了</strong>："+num6(share)+" % 的功率已到位，剩下的高頻只負責邊緣的銳利度。";
    else judge="<strong>幾乎完全</strong>："+num6(share)+" %，再加諧波的邊際效益很小。";
    const gibbs=wave==='square'?"<p>方波專屬：不連續點附近永遠有約 9 % 的過衝（吉布斯現象），加再多諧波也不會消失，只會變窄。</p>":"";
    const hi=N*f0;
    const warnHi=hi>4000?"<p>邊界提醒：最高諧波已到 "+num6(hi)+" Hz，超過人耳上限，也超過 8000 Hz 取樣系統的奈奎斯特頻率——第 12 章會回來算這件事。</p>":"";
    $('fourierseries-output').innerHTML=
      "<p>這個模式用到全部三個滑桿（振幅 A、諧波數 N、基頻 f<sub>0</sub>），波形選單決定係數公式。</p>"+
      "<p>總功率 P ＝ <strong>"+num6(Ptot)+" V²</strong>｜基本週期 T ＝ 1/f<sub>0</sub> ＝ <strong>"+num6(1/f0)+" s</strong></p>"+
      "<p>累積功率（到第 "+N+" 諧波）＝ <strong>"+num6(acc)+"</strong>｜佔總功率 <strong>"+num6(share)+" %</strong></p>"+
      "<p>前 5 個非零諧波：</p><ul>"+rows+"</ul>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：係數掉得多快由波形的<strong>平滑度</strong>決定——方波有跳躍所以 |b<sub>n</sub>| ∝ 1/n，三角波連續所以 ∝ 1/n²，這就是三角波只用一根基波就有 98.553430 % 的原因。</p>"+
      "<p>振幅 A 只縮放功率（P ∝ A²），<strong>百分比完全不受影響</strong>。</p>"+
      gibbs+warnHi;
  };
  ['fsr-wave','fsr-a','fsr-n','fsr-f0'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 06 傅立葉轉換：矩形脈衝的 sinc 頻譜與時移相位 */
function ctft(){
  if(!$('ftr-a'))return;
  const draw=()=>{
    const a=val('ftr-a'),t=val('ftr-t'),f=val('ftr-f'),t0=val('ftr-t0');
    const tSI=t*1e-3,t0SI=t0*1e-3;
    const x=f===0?1:trig0(Math.sin(Math.PI*f*tSI)/(Math.PI*f*tSI));
    const X=a*tSI*x;
    const mag=Math.abs(X);
    const base=X<0?180:0;
    let ph=base-360*f*t0SI;
    while(ph<=-180)ph+=360;
    while(ph>180)ph-=360;
    const null1=1/tSI,bw3=0.442946/tSI,energy=a*a*tSI;
    let judge;
    if(mag<1e-15)judge="<strong>這個頻率剛好落在 sinc 的零點上</strong>：f 是 1/T ＝ "+num6(null1)+" Hz 的整數倍，這個頻率成分完全不存在。";
    else if(f<bw3)judge="在 3 dB 頻寬內：這個頻率是脈衝的主要成分。";
    else if(f>=null1)judge="已進入旁瓣區：這裡的能量只剩主瓣的零頭，而且每過一個零點相位就翻 180°。";
    else judge="介於 3 dB 頻寬與第一個零點之間：主瓣的裙邊，振幅正在快速下滑。";
    $('ctft-output').innerHTML=
      "<p>直流分量 X(0) ＝ A·T ＝ <strong>"+sci(a*tSI)+" V·s</strong>｜sinc(fT) ＝ <strong>"+num6(x)+"</strong></p>"+
      "<p>|X(jω)| ＝ <strong>"+sci(mag)+" V·s</strong>｜相位 ＝ <strong>"+num6(ph)+"°</strong></p>"+
      "<p>第一個零點 ＝ <strong>"+num6(null1)+" Hz</strong>｜3 dB 頻寬 ＝ <strong>"+num6(bw3)+" Hz</strong>｜訊號能量 E ＝ A²T ＝ <strong>"+sci(energy)+" V²·s</strong></p>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：脈衝愈窄（T 愈小），第一個零點 1/T 就愈遠，頻譜愈寬——<strong>時域與頻域的寬度成反比，這是本課最重要的權衡</strong>。</p>"+
      "<p>t<sub>0</sub> 只改相位、完全不改 |X|；相位隨頻率線性下降，斜率就是 "+MINUS+"t<sub>0</sub>。<strong>這就是第 09 章「線性相位＝不失真延遲」的來歷</strong>。</p>"+
      "<p>量級對照：T ＝ 1 ms 的脈衝佔的 3 dB 頻寬是 442.946000 Hz，大約是一條電話語音通道（約 3400 Hz）的八分之一。</p>"+
      "<p>邊界提醒：把觀測頻率拉到 0，sinc 取 1（不是除以 0），|X| 就等於 X(0)、相位是 "+num6(0)+"°。</p>";
  };
  ['ftr-a','ftr-t','ftr-f','ftr-t0'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 07 s 平面：共軛極點的自然響應 */
function splane(){
  if(!$('spl-k'))return;
  const draw=()=>{
    const k=val('spl-k'),sigma=val('spl-sigma'),omega=val('spl-omega'),t=val('spl-t');
    const h=k*Math.exp(sigma*t)*trig0(Math.cos(omega*t));
    const env=k*Math.exp(sigma*t);
    const tau=sigma<0?-1/sigma:null;
    const fosc=omega/(2*Math.PI);
    const period=omega>0?1/fosc:null;
    let judge,tauTxt;
    if(sigma<0){
      tauTxt=num6(tau)+" s（5τ ＝ "+num6(5*tau)+" s）";
      judge="<strong>穩定</strong>：極點在左半平面，自然響應以 e<sup>σt</sup> 衰減，時間常數 τ ＝ "+num6(tau)+" s，大約 5τ ＝ "+num6(5*tau)+" s 後就看不到了。";
    }else if(sigma===0){
      tauTxt="無限大（不衰減）";
      judge="<strong>邊界</strong>：極點正好在虛軸上，振幅永遠不變——這是理想振盪器，也是<strong>任何一點損耗就會離開的狀態</strong>。";
    }else{
      tauTxt="不適用（發散）";
      judge="<strong>不穩定</strong>：極點在右半平面，響應指數成長。真實系統會撞到飽和或燒掉，數學上則直接發散。";
    }
    const oscTxt=omega===0
      ? "無振盪"
      : num6(fosc)+" Hz（週期 "+num6(period)+" s）";
    const realPole=omega===0?"<p>ω<sub>d</sub> ＝ 0：<strong>實極點</strong>，純指數，沒有振盪。</p>":"";
    $('splane-output').innerHTML=
      "<p>極點 s ＝ "+num6(sigma)+" ± j"+num6(omega)+"（σ 的單位 1/s、ω<sub>d</sub> 的單位 rad/s）</p>"+
      "<p>自然響應 h(t) ＝ K·e<sup>σt</sup>·cos(ω<sub>d</sub>t) ＝ <strong>"+num6(h)+"</strong>｜包絡 K·e<sup>σt</sup> ＝ <strong>"+num6(env)+"</strong></p>"+
      "<p>時間常數：<strong>"+tauTxt+"</strong>｜振盪頻率：<strong>"+oscTxt+"</strong></p>"+
      "<p>"+judge+"</p>"+realPole+
      "<p>為什麼：極點的<strong>實部管衰減有多快、虛部管振多快</strong>，這兩件事完全獨立——這就是為什麼工程師看到零極點圖就知道系統會怎麼動。</p>"+
      "<p>H(jω) 是 H(s) 在虛軸上的切片：把 s 換成 jω 就從「這個系統會怎麼自己動」變成「它對每個頻率怎麼反應」。</p>"+
      "<p>邊界提醒：t ＝ 0 時 h 恆等於 K（任何參數皆然）；把 σ 推到 +5 再把 t 推到 5 s，包絡會來到 "+num6(k*Math.exp(25))+" 這種量級，所以一律用統一的數字格式輸出。</p>";
  };
  ['spl-k','spl-sigma','spl-omega','spl-t'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 08 標準二階系統：暫態指標與頻率響應 */
function secondorder(){
  if(!$('sec-zeta'))return;
  const draw=()=>{
    const z=val('sec-zeta'),wn=val('sec-wn'),w=val('sec-w'),t=val('sec-t');
    const under=z<1,crit=Math.abs(z-1)<1e-9;
    const wd=under?wn*Math.sqrt(1-z*z):0;
    const Mp=under?Math.exp(-Math.PI*z/Math.sqrt(1-z*z)):0;
    const tp=under?Math.PI/wd:null;
    const ts=4/(z*wn);
    const den=Math.sqrt(Math.pow(wn*wn-w*w,2)+Math.pow(2*z*wn*w,2));
    const mag=wn*wn/den;
    const ph=-Math.atan2(2*z*wn*w,wn*wn-w*w)*180/Math.PI;
    const hasPeak=z<SQRT1_2;
    const wr=hasPeak?wn*Math.sqrt(1-2*z*z):null;
    const Mr=hasPeak?1/(2*z*Math.sqrt(1-z*z)):1;
    const Q=1/(2*z);
    let y,poleTxt,cls;
    if(crit){
      y=1-(1+wn*t)*Math.exp(-wn*t);
      poleTxt="兩個重合的實極點 "+num6(-wn)+"（重根）";
      cls="<strong>臨界阻尼</strong>：不超越，而且是所有不超越的情形裡<strong>最快</strong>的。";
    }else if(under){
      y=1-Math.exp(-z*wn*t)*(Math.cos(wd*t)+(z/Math.sqrt(1-z*z))*Math.sin(wd*t));
      poleTxt="s ＝ "+num6(-z*wn)+" ± j"+num6(wd);
      cls="<strong>欠阻尼</strong>：會超越 "+num6(Mp*100)+" %，第一個峰在 t<sub>p</sub> ＝ "+num6(tp)+" s，大約 t<sub>s</sub> ＝ "+num6(ts)+" s 後穩定下來。";
    }else{
      const s1=-z*wn+wn*Math.sqrt(z*z-1),s2=-z*wn-wn*Math.sqrt(z*z-1);
      y=1-(s2*Math.exp(s1*t)-s1*Math.exp(s2*t))/(s2-s1);
      poleTxt="兩個實極點 "+num6(s1)+" 與 "+num6(s2);
      cls="<strong>過阻尼</strong>：兩個實極點（"+num6(s1)+" 與 "+num6(s2)+"），慢的那個主導，沒有振盪但比臨界慢。";
    }
    const peakTxt=hasPeak
      ? "ω<sub>r</sub> ＝ <strong>"+num6(wr)+" rad/s</strong>、M<sub>r</sub> ＝ <strong>"+num6(Mr)+"</strong>（＝ "+num6(db20(Mr))+" dB）"+(z>=0.69?"，峰只有 "+num6((Mr-1)*100)+" %，實務上視為平坦":"")
      : "<strong>沒有共振峰</strong>：ζ ≥ 0.707107 時 |H(jω)| 從直流開始就單調下降";
    const onWn=Math.abs(w-wn)<1e-9
      ? "<p><strong>現在剛好站在 ω<sub>n</sub> 上</strong>：|H| ＝ 1/(2ζ) ＝ "+num6(1/(2*z))+"，相位一定是 "+MINUS+"90.000000°——這是實驗室量 ω<sub>n</sub> 最可靠的方法，因為相位比振幅好認。</p>"
      : "";
    $('secondorder-output').innerHTML=
      "<p>阻尼分類："+cls+"</p>"+
      "<p>極點："+poleTxt+"｜ω<sub>d</sub> ＝ <strong>"+(under?num6(wd)+" rad/s":"不適用（不振盪）")+"</strong></p>"+
      "<p>超越量 M<sub>p</sub> ＝ <strong>"+(under?num6(Mp*100)+" %":"不適用（不振盪）")+"</strong>｜峰值時間 t<sub>p</sub> ＝ <strong>"+(under?num6(tp)+" s":"不適用（不振盪）")+"</strong>｜整定時間 t<sub>s</sub> ＝ <strong>"+num6(ts)+" s</strong>｜Q ＝ 1/(2ζ) ＝ <strong>"+num6(Q)+"</strong></p>"+
      "<p>共振："+peakTxt+"</p>"+
      "<p>在 ω ＝ "+num6(w)+" rad/s：|H(jω)| ＝ <strong>"+num6(mag)+"</strong>（"+num6(db20(mag))+" dB）｜∠H ＝ <strong>"+num6(ph)+"°</strong></p>"+
      "<p>步階響應 y("+num6(t)+") ＝ <strong>"+num6(y)+"</strong></p>"+onWn+
      "<p>為什麼：<strong>M<sub>p</sub> 只由 ζ 決定，ω<sub>n</sub> 只決定快慢</strong>：把 ω<sub>n</sub> 加倍，波形形狀一模一樣，只是時間軸壓縮一半。</p>"+
      "<p>換算：Q ＝ 1/(2ζ)，所以 ζ ＝ 0.5 就是 Q ＝ 1；電路學的 RLC 共振講的是同一件事。</p>"+
      "<p>邊界提醒：ω ＝ 0 時 |H| 一定是 "+num6(1)+"（標準式的直流增益就是 1）；t ＝ 0 時 y 一定是 "+num6(0)+"，三個分支皆然。</p>";
  };
  ['sec-zeta','sec-wn','sec-w','sec-t'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 09 巴特沃斯階數預算與群延遲 */
function filterorder(){
  if(!$('flt-fc'))return;
  const bwDb=(ratio,n)=>{
    if(ratio>100&&n>=5)return -20*n*Math.log10(ratio);      // 漸近式，避開 1 + 10^46 的精度陷阱
    return -10*Math.log10(1+Math.pow(ratio,2*n));
  };
  const draw=()=>{
    const fc=val('flt-fc'),fs=val('flt-fs'),as=val('flt-as'),n=val('flt-n'),f=val('flt-f');
    const ratio=fs/fc;
    const ok=ratio>1;
    const nmin=ok?Math.log10(Math.pow(10,as/10)-1)/(2*Math.log10(ratio)):null;
    const nreq=ok?Math.ceil(nmin):null;
    const att=ok?-bwDb(ratio,n):0;
    const fr=f/fc;
    const db=f===0?0:bwDb(fr,n);
    const mag=Math.pow(10,db/20);
    const slope=20*n;
    const tg0=1/(2*Math.PI*fc);
    const tgf=tg0/(1+fr*fr);
    let judge;
    if(!ok){
      judge="<strong>規格不成立</strong>：阻帶邊緣必須高於通帶邊緣，否則沒有過渡帶可言。現在 f<sub>s</sub> ＝ "+num6(fs)+" Hz 不大於 f<sub>c</sub> ＝ "+num6(fc)+" Hz，最小階數無從算起。";
    }else if(n>=nreq){
      judge="<strong>規格達成</strong>：採用 "+n+" 階在 f<sub>s</sub> 給 "+num6(att)+" dB，超過要求的 "+num6(as)+" dB。";
    }else{
      judge="<strong>不合格</strong>："+n+" 階只給 "+num6(att)+" dB，差 "+num6(as-att)+" dB。要嘛加階數、要嘛放寬阻帶邊緣、要嘛降低要求——<strong>三選一，沒有免費的午餐</strong>。";
    }
    $('filterorder-output').innerHTML=
      "<p>過渡帶比值 f<sub>s</sub>/f<sub>c</sub> ＝ <strong>"+num6(ratio)+"</strong>｜所需最小階數 n<sub>min</sub> ＝ <strong>"+(ok?num6(nmin)+" → 取 "+nreq+" 階":"不適用（規格不成立）")+"</strong></p>"+
      "<p>採用 "+n+" 階在 f<sub>s</sub> 的實際衰減 ＝ <strong>"+(ok?num6(att)+" dB":"不適用")+"</strong>｜下降斜率 ＝ <strong>"+slope+" dB/decade</strong></p>"+
      "<p>在觀測頻率 "+num6(f)+" Hz：|H(f)| ＝ <strong>"+num6(mag)+"</strong>（<strong>"+num6(db)+" dB</strong>）</p>"+
      "<p>同一個 f<sub>c</sub> 的一階系統群延遲：直流 <strong>"+num6(tg0*1e6)+" "+MU+"s</strong>，在 "+num6(f)+" Hz 只剩 <strong>"+num6(tgf*1e6)+" "+MU+"s</strong>（差 "+num6((tg0-tgf)*1e6)+" "+MU+"s）</p>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：階數愈高愈陡（每階 20 dB/decade），但<strong>每加一階就多一對極點</strong>，相位轉得更多、群延遲更不平坦、元件容差的影響也更大。</p>"+
      "<p>群延遲那一句：兩個頻率的成分不同步抵達，方波的角就是這樣被磨圓的。</p>"+
      "<p>家族取捨：要最平坦選巴特沃斯、要最陡選橢圓、要波形不變形選貝索、要在陡與階數之間妥協選柴比雪夫。</p>"+
      "<p>邊界提醒：觀測頻率為 0 時 |H| 恆等於 "+num6(1)+"（不會除以 0）；把階數與頻率比同時推到極端，dB 會走漸近式 "+MINUS+"20n·log<sub>10</sub>(f/f<sub>c</sub>)，倍數以指數格式顯示。</p>";
  };
  ['flt-fc','flt-fs','flt-as','flt-n','flt-f'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 10 AM 調變：邊帶、頻寬、功率與效率 */
function ammod(){
  if(!$('amm-fc'))return;
  const draw=()=>{
    const fc=val('amm-fc'),fm=val('amm-fm'),m=val('amm-m'),pc=val('amm-pc');
    const usb=fc+fm,lsb=fc-fm,bw=2*fm;
    const psb=m*m*pc/4;
    const pt=pc*(1+m*m/2);
    const eff=pt>0?2*psb/pt*100:0;
    const emax=1+m,emin=Math.abs(1-m);
    let judge;
    if(m===0)judge="<strong>沒有調變</strong>：頻譜只剩一根載波，效率 "+num6(0)+" %——全部功率都用來發一個不帶任何資訊的正弦波。";
    else if(m<=1)judge="<strong>正常調變</strong>：包絡在 "+num6(emin)+" 與 "+num6(emax)+" 之間擺動且不會碰到 0，<strong>一顆二極體加 RC 就能解調</strong>。效率 "+num6(eff)+" %。";
    else judge="<strong>過調變</strong>：包絡下限本來應該是 1 "+MINUS+" m ＝ 負數，實際上包絡檢波器會把它折回去（這裡顯示的 E<sub>min</sub> ＝ "+num6(emin)+" 是絕對值），<strong>聲音會破</strong>。要靠同步檢測才救得回來。";
    const lsbWarn=lsb<=0
      ? "<p>下邊帶頻率算出來不是正數：f<sub>m</sub> 太接近 f<sub>c</sub>，這不是合理的調變情境。</p>"
      : (fm>=fc/2?"<p>邊界提醒：f<sub>m</sub> 已達 f<sub>c</sub> 的一半，這已經不是窄頻調變。</p>":"");
    $('ammod-output').innerHTML=
      "<p>上邊帶 f<sub>c</sub> + f<sub>m</sub> ＝ <strong>"+num6(usb)+" kHz</strong>｜下邊帶 f<sub>c</sub> "+MINUS+" f<sub>m</sub> ＝ <strong>"+num6(lsb)+" kHz</strong>｜佔用頻寬 B ＝ 2f<sub>m</sub> ＝ <strong>"+num6(bw)+" kHz</strong></p>"+
      "<p>每個邊帶功率 ＝ <strong>"+num6(psb)+" W</strong>｜總發射功率 P<sub>t</sub> ＝ <strong>"+num6(pt)+" W</strong>｜功率效率 η ＝ <strong>"+num6(eff)+" %</strong></p>"+
      "<p>包絡最大 ＝ <strong>"+num6(emax)+"</strong>｜包絡最小 ＝ <strong>"+num6(emin)+"</strong>｜由波形反推 m ＝ (E<sub>max</sub> "+MINUS+" E<sub>min</sub>)/(E<sub>max</sub> + E<sub>min</sub>) ＝ <strong>"+num6(emax+emin===0?0:(emax-emin)/(emax+emin))+"</strong></p>"+
      "<p>"+judge+"</p>"+lsbWarn+
      "<p>為什麼：效率 η ＝ (m²/2)/(1 + m²/2) <strong>只由 m 決定，與載波功率無關</strong>——把發射機開大只是讓兩邊一起變大。</p>"+
      "<p>頻寬 2f<sub>m</sub> 與 m 完全無關：調得深不會佔更多頻寬，只會把功率從載波搬到邊帶。</p>"+
      "<p>量級對照：AM 廣播的頻道間隔是 10 kHz，所以 f<sub>m</sub> 實務上限只有 5 kHz——<strong>這就是 AM 廣播聽起來悶悶的物理原因</strong>。</p>";
  };
  ['amm-fc','amm-fm','amm-m','amm-pc'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 11 離散時間系統：一階 IIR 與 M 點移動平均 FIR */
function dtsystem(){
  if(!$('dts-mode'))return;
  const draw=()=>{
    const mode=pick('dts-mode'),xin=pick('dts-x'),a=val('dts-a'),m=val('dts-m'),n=val('dts-n');
    const iir=mode==='iir',step=xin==='step';
    let y,hn,sumh,ntauTxt,uses,shape;
    if(iir){
      y=step?(1-Math.pow(a,n+1))/(1-a):Math.pow(a,n);
      hn=Math.pow(a,n);
      sumh=1/(1-a);
      ntauTxt=a>0?num6(-1/Math.log(a))+" 個樣本":"不適用（沒有記憶）";
      uses="遞迴係數 a 與觀測樣本 n（平均點數 M 不影響結果）";
      shape="<strong>IIR</strong>：h[n] ＝ a<sup>n</sup> 永遠不會真的到 0，只是愈來愈小。Σ|h[n]| ＝ 1/(1 "+MINUS+" a) ＝ "+num6(sumh)+" ＜ ∞，所以 <strong>BIBO 穩定</strong>；每個輸出只要 2 次乘加，<strong>很便宜</strong>。";
    }else{
      y=step?Math.min(n+1,m)/m:(n<m?1/m:0);
      hn=n<m?1/m:0;
      sumh=1;
      ntauTxt="群延遲 "+num6((m-1)/2)+" 個樣本";
      uses="平均點數 M 與觀測樣本 n（遞迴係數 a 不影響結果）";
      shape="<strong>FIR</strong>：h[n] 只有 "+m+" 項，"+m+" 個樣本之後就完全結束，Σ|h[n]| ＝ "+num6(1)+" <strong>恆有限，天生穩定</strong>；代價是每個輸出要 "+m+" 次乘加。";
    }
    const dcgain=sumh;
    const reached=step?y/dcgain*100:null;
    let extra="";
    if(iir&&a===0)extra+="<p>a ＝ 0：遞迴消失，系統退化成 y[n] ＝ x[n]，直流增益 "+num6(1)+"。</p>";
    if(iir&&a>=0.95)extra+="<p>a 很接近 1：直流增益衝到 "+num6(sumh)+"，時間常數 "+ntauTxt+"——<strong>再往上一點點就會變成積分器，而 a ＝ 1 正好是不穩定的邊界</strong>。</p>";
    if(!step)extra+="<p>現在打的是 δ[n]，所以 y[n] 就是 h[n] 本身。</p>";
    if(!iir&&!step&&n>=m)extra+="<p>已經結束（y[n] ＝ "+num6(0)+"），<strong>這正是 FIR 的定義</strong>。</p>";
    $('dtsystem-output').innerHTML=
      "<p>這個模式只用到 <strong>"+uses+"</strong>，其餘滑桿不影響結果。</p>"+
      "<p>y["+n+"] ＝ <strong>"+num6(y)+"</strong>｜h["+n+"] ＝ <strong>"+num6(hn)+"</strong>｜Σ|h[n]| ＝ <strong>"+num6(sumh)+"</strong>｜直流增益 ＝ <strong>"+num6(dcgain)+"</strong></p>"+
      "<p>"+(iir?"等效時間常數 n<sub>τ</sub>":"群延遲")+"：<strong>"+ntauTxt+"</strong>"+(step?"｜已達終值 <strong>"+num6(reached)+" %</strong>":"")+"</p>"+
      "<p>"+shape+"</p>"+extra+
      "<p>為什麼：IIR 用回授換效率（少量係數就能做出很窄的濾波），FIR 用長度換保證（沒有回授就不可能不穩定，而且可以做到嚴格線性相位）——<strong>第 15 章會用頻率響應把這個取捨算給你看</strong>。</p>"+
      "<p>邊界提醒：n 是<strong>樣本序號</strong>不是秒；要換成秒必須乘上 T<sub>s</sub>，而 T<sub>s</sub> 要等第 12 章才會出現。</p>";
  };
  ['dts-mode','dts-x','dts-a','dts-m','dts-n'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 12 取樣與混疊：視在頻率、樣本序列與 ZOH 下垂 */
function sampling(){
  if(!$('smp-f'))return;
  const draw=()=>{
    const f=val('smp-f'),fs=val('smp-fs'),a=val('smp-a'),n=val('smp-n');
    const ts=1/fs,nyq=fs/2;
    const k=Math.round(f/fs);
    const fa=Math.abs(f-k*fs);
    const sample=a*trig0(Math.cos(2*Math.PI*f*n/fs));
    const x=f/fs;
    const zoh=x===0?1:trig0(Math.abs(Math.sin(Math.PI*x)/(Math.PI*x)));
    const zohdb=zoh>1e-12?db20(zoh):null;
    let list="";
    for(let i=0;i<6;i++)list+="<li>x["+i+"] ＝ "+num6(a*trig0(Math.cos(2*Math.PI*f*i/fs)))+"</li>";
    let judge;
    if(Math.abs(f-nyq)<1e-9){
      judge="<strong>恰好在臨界</strong>：f ＝ f<sub>s</sub>/2。理論上是邊界、實務上不可用——取樣點可能剛好全落在零交越，量到一整排 0。<strong>規格一律要求 f<sub>s</sub> 嚴格大於 2W</strong>。";
    }else if(f<nyq){
      judge="<strong>沒有混疊</strong>：f ＝ "+num6(f)+" Hz ＜ f<sub>s</sub>/2 ＝ "+num6(nyq)+" Hz，這些樣本足以完美還原原訊號（理論上用 sinc 內插）。";
    }else{
      judge="<strong>已經混疊</strong>：這個 "+num6(f)+" Hz 的訊號取樣後會被誤認成 "+num6(fa)+" Hz。<strong>注意它與真正的 "+num6(fa)+" Hz 訊號產生的樣本一模一樣，事後任何演算法都分不出來</strong>——所以抗混疊濾波器必須裝在 ADC <strong>之前</strong>的類比端。";
      if(fa<1e-9)judge+="現在視在頻率是<strong>直流</strong>：這個高頻訊號取樣後變成一條不動的線。";
    }
    $('sampling-output').innerHTML=
      "<p>取樣週期 T<sub>s</sub> ＝ 1/f<sub>s</sub> ＝ <strong>"+sci(ts)+" s</strong>（＝ "+num6(ts*1e6)+" "+MU+"s）｜奈奎斯特頻率 f<sub>s</sub>/2 ＝ <strong>"+num6(nyq)+" Hz</strong></p>"+
      "<p>視在頻率 f<sub>a</sub> ＝ |f "+MINUS+" k·f<sub>s</sub>| ＝ <strong>"+num6(fa)+" Hz</strong>（k ＝ "+k+"）｜第 "+n+" 個樣本 ＝ <strong>"+num6(sample)+" V</strong></p>"+
      "<p>前 6 個樣本：</p><ul>"+list+"</ul>"+
      "<p>零階保持衰減 |sinc(f/f<sub>s</sub>)| ＝ <strong>"+num6(zoh)+"</strong>（"+(zohdb===null?"ZOH 在這個頻率剛好是零點":num6(zohdb)+" dB")+"）</p>"+
      "<p>"+judge+"</p>"+
      "<p>為什麼：取樣把頻譜每隔 f<sub>s</sub> 複製一份；f<sub>s</sub> 不夠大時複製品的裙邊互相重疊，重疊的部分就永遠分不開了。</p>"+
      "<p>DAC 用零階保持把樣本撐成方塊，等於與一個寬 T<sub>s</sub> 的矩形摺積，所以高頻被 sinc 壓下去——這叫 droop，可以事後用數位等化補回來。</p>"+
      "<p>量級對照：電話 8000 Hz、CD 44100 Hz、專業錄音 48000 Hz；電話只留 3400 Hz 以下的語音，所以聽不出 s 與 f 的差別。</p>"+
      "<p>邊界提醒：n ＝ 0 的樣本恆等於 A（任何頻率皆然）；f 恰為 f<sub>s</sub> 的整數倍時 ZOH 落在零點，dB 一律寫成文字。</p>";
  };
  ['smp-f','smp-fs','smp-a','smp-n'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 13 DFT 實驗室：解析度、洩漏、窗與 FFT 加速 */
function dftlab(){
  if(!$('dft-nexp'))return;
  const WIN={rect:[2,-13.3],hann:[4,-31.5],hamming:[4,-42.7],blackman:[6,-58.1]};
  const WNAME={rect:"矩形（不加窗）",hann:"Hann",hamming:"Hamming",blackman:"Blackman"};
  const draw=()=>{
    const nexp=val('dft-nexp'),fs=val('dft-fs'),f=val('dft-f'),win=pick('dft-win');
    const N=Math.pow(2,nexp);
    const df=fs/N;
    const kexact=f*N/fs;
    const k=Math.round(kexact);
    const fbin=k*df;
    const err=f-fbin;
    const twin=N/fs;
    const ops=N*N,fftops=(N/2)*nexp,speed=ops/fftops;
    const lobe=WIN[win][0],side=WIN[win][1],lobeHz=lobe*df;
    let judge;
    if(Math.abs(kexact-k)<1e-9)judge="<strong>整數週期，無洩漏</strong>：訊號頻率正好落在第 "+k+" 根 bin 的中心，窗內剛好裝 "+k+" 個完整週期，頭尾接得上，能量集中在一根線上。";
    else judge="<strong>會洩漏</strong>：訊號頻率離 bin 中心差 "+num6(err)+" Hz，窗內不是整數個週期，接縫處的跳躍讓能量散到鄰近的 bin。<strong>這時候加窗才有意義。</strong>";
    const alias=f>=fs/2?"<p><strong>先處理混疊</strong>：f 已超過奈奎斯特頻率 "+num6(fs/2)+" Hz，這根線在 FFT 上會出現在別的位置——回第 12 章。</p>":"";
    let edge="";
    if(nexp<=4)edge+="<p>邊界提醒：N ＝ "+N+" 很小，FFT 只快 "+num6(speed)+" 倍，這時候 FFT 沒什麼好處。</p>";
    if(twin>=10)edge+="<p>邊界提醒：窗長已達 "+num6(twin)+" s，要等超過 "+Math.floor(twin)+" 秒才有一張頻譜。</p>";
    if(k===0)edge+="<p>邊界提醒：訊號頻率遠低於一根 bin 的寬度（Δf ＝ "+num6(df)+" Hz），整個掉進直流 bin 裡。</p>";
    $('dftlab-output').innerHTML=
      "<p>N ＝ 2<sup>"+nexp+"</sup> ＝ <strong>"+N+"</strong>｜頻率解析度 Δf ＝ f<sub>s</sub>/N ＝ <strong>"+num6(df)+" Hz</strong>｜窗長 T<sub>win</sub> ＝ N/f<sub>s</sub> ＝ <strong>"+num6(twin)+" s</strong></p>"+
      "<p>精確 bin 位置 f·N/f<sub>s</sub> ＝ <strong>"+num6(kexact)+"</strong>｜最近的 bin k ＝ <strong>"+k+"</strong>（中心 "+num6(fbin)+" Hz）｜誤差 ＝ <strong>"+num6(err)+" Hz</strong></p>"+
      "<p>選用窗："+WNAME[win]+"｜主瓣寬度 <strong>"+lobe+" 個 bin</strong>（＝ "+num6(lobeHz)+" Hz）｜最高旁瓣 <strong>"+num6(side)+" dB</strong></p>"+
      "<p>直接 DFT 運算量 N² ＝ <strong>"+ops+"</strong> 次複數乘法｜FFT (N/2)log<sub>2</sub>N ＝ <strong>"+fftops+"</strong> 次｜加速倍率 <strong>"+num6(speed)+" 倍</strong></p>"+
      "<p>"+judge+"</p>"+alias+
      "<p>為什麼：<strong>解析度只由窗長決定</strong>：Δf ＝ 1/T<sub>win</sub>。要分辨相差 1 Hz 的兩根線，就得量滿 1 秒，沒有捷徑。</p>"+
      "<p>加窗的取捨：主瓣 "+lobe+" 個 bin（＝ "+num6(lobeHz)+" Hz，解析度變差），最高旁瓣 "+num6(side)+" dB（洩漏被壓低）。<strong>沒有一個窗兩邊都贏。</strong></p>"+
      "<p>零填充：把 N 補 0 到兩倍只會讓譜線看起來更密（內插），T<sub>win</sub> 沒變，<strong>真正能分辨的最小頻率差完全不變</strong>。</p>"+
      "<p>量級對照：N ＝ 1024、f<sub>s</sub> ＝ 8000 就是 0.128 秒的窗，Δf ＝ 7.8125 Hz；要達到 1 Hz 解析度得量滿 1 秒。</p>"+edge;
  };
  ['dft-nexp','dft-fs','dft-f','dft-win'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 14 z 平面：極點半徑與角度決定一切 */
function zplane(){
  if(!$('zpl-r'))return;
  const draw=()=>{
    const r=val('zpl-r'),theta=val('zpl-theta'),n=val('zpl-n'),fs=val('zpl-fs');
    const th=theta*Math.PI/180;
    /* H(z) ＝ 1/(1 − 2r·cosθ·z⁻¹ + r²z⁻²) 的脈衝響應是
       h[n] ＝ rⁿ·sin((n+1)θ)/sinθ（兩個共軛極點做部分分式後的閉合式）。
       θ ＝ 0 或 180° 時是重根，sinθ ＝ 0，取極限得 h[n] ＝ rⁿ(n+1)cos(nθ)。 */
    const sth=Math.sin(th);
    const h=Math.abs(sth)<1e-12
      ? Math.pow(r,n)*(n+1)*trig0(Math.cos(n*th))
      : Math.pow(r,n)*trig0(Math.sin((n+1)*th))/sth;
    const fpk=theta/360*fs;
    const ntau=(r>0&&r<1)?-1/Math.log(r):null;
    const a1=2*r*trig0(Math.cos(th)),a2=r*r;
    const Hmag=w=>{
      const d1=1-2*r*Math.cos(th-w)+r*r;
      const d2=1-2*r*Math.cos(th+w)+r*r;
      const prod=d1*d2;
      return prod<1e-12?null:1/Math.sqrt(prod);
    };
    const hPk=Hmag(th),hDc=Hmag(0),hNy=Hmag(Math.PI);
    const txt=v=>v===null?INF_TXT:num6(v);
    const ratio=(hPk!==null&&hDc!==null&&hDc!==0)?num6(hPk/hDc)+" 倍":"不適用";
    let judge,ntauTxt;
    if(r===0){
      ntauTxt="不適用（沒有記憶）";
      judge="r ＝ 0：極點退化到原點，系統沒有記憶（h[n] 只有 n ＝ 0 那一項）。";
    }else if(Math.abs(r-1)<1e-9){
      ntauTxt=INF_TXT+"（不衰減）";
      judge="<strong>邊界穩定</strong>：極點正好在單位圓上，h[n] 永不衰減；|H| 在共振頻率上<strong>發散</strong>——這是理想振盪器，也是數位濾波器<strong>絕對要避開</strong>的位置（浮點誤差就足以把它推到圈外）。";
    }else if(r<1){
      ntauTxt=num6(ntau)+" 個樣本（＝ "+num6(ntau/fs*1e3)+" ms）";
      judge="<strong>穩定</strong>：極點在單位圓內，h[n] 以 r<sup>n</sup> 衰減，大約 n<sub>τ</sub> ＝ "+num6(ntau)+" 個樣本後掉到 36.8 %。";
    }else{
      ntauTxt="不適用（發散）";
      judge="<strong>不穩定</strong>：極點在單位圓外，h[n] 指數成長，輸出會很快撞到數值上限。";
    }
    let kind="";
    if(theta===0)kind="<p>θ ＝ 0：實極點，共振在直流，這是一個<strong>低通</strong>。</p>";
    else if(theta===180)kind="<p>θ ＝ 180°：共振在 f<sub>s</sub>/2，這是一個<strong>高通</strong>。</p>";
    $('zplane-output').innerHTML=
      "<p>極點 z ＝ r·exp(±jθ) ＝ "+num6(r)+"·exp(±j"+num6(theta)+"°)｜h["+n+"] ＝ <strong>"+num6(h)+"</strong></p>"+
      "<p>共振頻率 f<sub>peak</sub> ＝ (θ/360°)·f<sub>s</sub> ＝ <strong>"+num6(fpk)+" Hz</strong>｜衰減常數 n<sub>τ</sub>：<strong>"+ntauTxt+"</strong></p>"+
      "<p>差分方程：<code>y[n] ＝ "+num6(a1)+"·y[n"+MINUS+"1] "+MINUS+" "+num6(a2)+"·y[n"+MINUS+"2] + x[n]</code></p>"+
      "<p>|H| 在共振點 ＝ <strong>"+txt(hPk)+"</strong>｜在直流 ＝ <strong>"+txt(hDc)+"</strong>｜在 f<sub>s</sub>/2 ＝ <strong>"+txt(hNy)+"</strong>｜峰／直流比 ＝ <strong>"+ratio+"</strong></p>"+
      "<p>"+judge+"</p>"+kind+
      "<p>為什麼：|H| 的分母就是「單位圓上的觀測點到極點的距離」——<strong>距離愈近值愈大</strong>，所以 r 愈接近 1，共振峰愈高愈尖，代價是拖尾愈長。</p>"+
      "<p>對照：連續時間看「在不在左半平面」，離散時間看「在不在單位圓內」——z ＝ exp(sT<sub>s</sub>) 把無限長的虛軸捲成一個圓，這就是離散頻譜為什麼是週期的幾何理由。</p>"+
      "<p>邊界提醒：θ 的單位是「每個樣本的弧度」；同一組係數換一個 f<sub>s</sub>，濾的就是不同的頻率。</p>";
  };
  ['zpl-r','zpl-theta','zpl-n','zpl-fs'].forEach(x=>on(x,'input',draw));
  draw();
}

/* 15 數位濾波器與多速率：FIR、IIR、抽取 */
function digfilter(){
  if(!$('dgf-mode'))return;
  const draw=()=>{
    const mode=pick('dgf-mode'),m=val('dgf-m'),a=val('dgf-a'),f=val('dgf-f'),fs=val('dgf-fs');
    const w=2*Math.PI*f/fs;
    let body="",uses="";
    const overNyq=f>fs/2
      ? "<p><strong>觀測頻率已超過奈奎斯特頻率</strong>（f<sub>s</sub>/2 ＝ "+num6(fs/2)+" Hz）：離散系統的頻率響應以 f<sub>s</sub> 為週期，這裡的數值是摺回來的鏡像——先回第 12 章。</p>"
      : "";
    if(mode==='fir'){
      uses="點數 M、觀測頻率 f 與取樣頻率 f<sub>s</sub>（IIR 係數 a 不影響結果）";
      const s2=Math.abs(Math.sin(w/2));
      const mag=s2<1e-12?1:trig0(Math.abs(Math.sin(m*w/2)/(m*Math.sin(w/2))));
      const db=mag>1e-12?db20(mag):null;
      const grp=(m-1)/2,grpSec=grp/fs,null1=fs/m,mac=m*fs;
      const zero=mag<1e-12
        ? "<p><strong>這個頻率剛好落在零點上</strong>（f 是 f<sub>s</sub>/M ＝ "+num6(null1)+" Hz 的整數倍），完全被濾掉。</p>"
        : "";
      body=
        "<p>角頻率 ω ＝ 2πf/f<sub>s</sub> ＝ <strong>"+num6(w)+" rad/樣本</strong>｜|H| ＝ <strong>"+num6(mag)+"</strong>（"+(db===null?"落在零點，dB 無定義":num6(db)+" dB")+"）</p>"+
        "<p>第一個零點 ＝ f<sub>s</sub>/M ＝ <strong>"+num6(null1)+" Hz</strong>｜直流增益 ＝ <strong>"+num6(1)+"</strong></p>"+
        "<p>群延遲 ＝ (M "+MINUS+" 1)/2 ＝ <strong>"+num6(grp)+" 個樣本</strong>（＝ "+sci(grpSec)+" s ＝ "+num6(grpSec*1e6)+" "+MU+"s）｜運算量 <strong>"+num6(mac)+" 次乘加／秒</strong></p>"+
        zero+
        "<p>群延遲恆為 (M "+MINUS+" 1)/2 ＝ "+num6(grp)+" 個樣本，<strong>與頻率無關</strong>——這就是線性相位，所有頻率成分延後一樣多，波形只平移不變形。</p>";
    }else if(mode==='iir'){
      uses="係數 a、觀測頻率 f 與取樣頻率 f<sub>s</sub>（點數 M 不影響結果）";
      const mag=(1-a)/Math.sqrt(1-2*a*Math.cos(w)+a*a);
      const db=mag>1e-12?db20(mag):null;
      const c=(4*a-1-a*a)/(2*a);
      const fc3=Math.abs(c)<=1?fs/(2*Math.PI)*Math.acos(c):null;
      const mac=2*fs;
      const warn=fc3===null
        ? "<p>這個 a 太小（餘弦值算出來是 "+num6(c)+"，超出 ±1），"+MINUS+"3 dB 點算出來高過奈奎斯特頻率——<strong>它幾乎不濾波</strong>。</p>"
        : "";
      body=
        "<p>角頻率 ω ＝ <strong>"+num6(w)+" rad/樣本</strong>｜|H| ＝ <strong>"+num6(mag)+"</strong>（"+(db===null?"低於顯示下限":num6(db)+" dB")+"）</p>"+
        "<p>"+MINUS+"3 dB 頻率 ＝ <strong>"+(fc3===null?"高過奈奎斯特頻率（不適用）":num6(fc3)+" Hz")+"</strong>｜運算量 <strong>"+num6(mac)+" 次乘加／秒</strong></p>"+
        warn+
        "<p>一階 IIR 每個輸出只要 2 次乘加（"+num6(mac)+" 次／秒），M ＝ "+m+" 的 FIR 要 "+m+" 次（"+num6(m*fs)+" 次／秒）——<strong>這就是 IIR 便宜的地方</strong>；代價是相位非線性、群延遲隨頻率變，而且極點靠近單位圓時定點量化會出問題。</p>";
    }else{
      uses="抽取倍率 M 與取樣頻率 f<sub>s</sub>（係數 a 與觀測頻率 f 不影響結果）";
      const fs2=fs/m,cutoff=fs2/2,fsUp=fs*m;
      body=
        "<p>抽取 "+m+" 倍後的新取樣率 ＝ <strong>"+num6(fs2)+" Hz</strong>｜抽取前必須先低通到 <strong>"+num6(cutoff)+" Hz</strong>（新的奈奎斯特頻率）</p>"+
        "<p>內插 "+m+" 倍後的取樣率 ＝ <strong>"+num6(fsUp)+" Hz</strong>（先插 "+(m-1)+" 個 0，再低通）</p>"+
        "<p>抽取之前一定要先低通，否則第 12 章的混疊會原封不動再發生一次；多相分解讓這兩件事只算「用得到的那些乘法」。</p>";
    }
    $('digfilter-output').innerHTML=
      "<p>這個模式只用到 <strong>"+uses+"</strong>，其餘滑桿不影響結果。</p>"+
      body+overNyq+
      "<p>取捨總結：<strong>要相位不失真、要保證穩定選 FIR；要省運算、要陡峭的邊選 IIR。</strong></p>"+
      "<p>邊界提醒：觀測頻率為 0 時 FIR 的 |H| 走保護路徑取 "+num6(1)+"（不會除以 0）；IIR 的餘弦值超出 ±1 時一律輸出文字，不呼叫 arccos。</p>";
  };
  ['dgf-mode','dgf-m','dgf-a','dgf-f','dgf-fs'].forEach(x=>on(x,'input',draw));
  draw();
}

/* ---------- 4. 字典搜尋 ---------- */
function dictionary(){
  if(!$('term-search'))return;
  const cards=document.querySelectorAll('.term-card');
  const draw=()=>{
    const q=$('term-search').value.trim().toLocaleLowerCase('zh-Hant');
    let n=0;
    for(let i=0;i<cards.length;i++){
      const c=cards[i];
      const hay=(c.textContent+' '+(c.dataset.search||'')).toLocaleLowerCase('zh-Hant');
      const hit=q===''||hay.indexOf(q)>=0;
      c.hidden=!hit;
      if(hit)n++;
    }
    if($('term-count'))$('term-count').textContent="顯示 "+n+" 個條目";
  };
  on('term-search','input',draw);
  draw();
}

/* ---------- 5. 自我檢核（48 題，答案唯一事實來源） ---------- */
function selfcheck(){
  if(!$('quiz-reset'))return;
  const R={
    '00':['00-訊號與系統世界觀.html','00 訊號與系統世界觀'],
    '01':['01-訊號的分類.html','01 訊號的分類'],
    '02':['02-基本訊號與訊號運算.html','02 基本訊號與訊號運算'],
    '03':['03-系統的六個性質.html','03 系統的六個性質'],
    '04':['04-線性非時變與摺積.html','04 線性非時變與摺積'],
    '05':['05-傅立葉級數.html','05 傅立葉級數'],
    '06':['06-傅立葉轉換.html','06 傅立葉轉換'],
    '07':['07-拉氏轉換與轉移函數.html','07 拉氏轉換與轉移函數'],
    '08':['08-極零點與二階系統.html','08 極零點與二階系統'],
    '09':['09-濾波器與群延遲.html','09 濾波器與群延遲'],
    '10':['10-調變與頻譜搬移.html','10 調變與頻譜搬移'],
    '11':['11-離散時間訊號與差分方程.html','11 離散時間訊號與差分方程'],
    '12':['12-取樣與混疊.html','12 取樣與混疊'],
    '13':['13-離散頻譜分析.html','13 離散頻譜分析'],
    '14':['14-Z轉換與單位圓.html','14 Z 轉換與單位圓'],
    '15':['15-數位濾波器與多速率.html','15 數位濾波器與多速率']
  };
  const q=(id,o)=>{const c=id.slice(1,3);o.ref=R[c][0];o.refName=R[c][1];return o;};
  const Q={
    'q00-1':q('q00-1',{t:'sel',ans:'a',why:'系統一旦有記憶（電容要充電、機械有慣性），輸出就取決於過去而不只是現在，同一個振幅在不同頻率下得到不同的輸出——一個增益倍數描述不了這件事。',fix:'振幅、電壓、元件數量都不是關鍵；關鍵是「輸出依賴過去」。'}),
    'q00-2':q('q00-2',{t:'num',ans:0.707107,tol:0.001,why:'r ＝ f/f_c ＝ 1 時 |H| ＝ 1/√(1 + 1²) ＝ 0.707107，正好是 −3.010300 dB、功率剩一半。',fix:'常見的錯是把 −3 dB 當成「掉 3 %」；它其實是掉到 70.7 %。'}),
    'q00-3':q('q00-3',{t:'num',ans:-45,tol:0.5,why:'∠H ＝ −arctan(r)，r ＝ 1 時 arctan 1 ＝ 45°，所以相位是 −45.000000°。',fix:'注意是負的：一階低通讓輸出落後輸入。'}),
    'q01-1':q('q01-1',{t:'num',ans:1,tol:0.01,why:'E ＝ A²τ/2 ＝ 4 × 0.5 / 2 ＝ 1.000000 V²·s，因為 ∫ A²e^(−2t/τ) dt ＝ A²τ/2。',fix:'常見的錯是忘了指數平方後時間常數變成 τ/2，於是少除了一個 2。'}),
    'q01-2':q('q01-2',{t:'num',ans:0.707107,tol:0.001,why:'弦波的平均功率 P ＝ A²/2 ＝ 0.500000，rms ＝ √P ＝ A/√2 ＝ 0.707107 V。',fix:'rms 不是峰值的一半，是峰值除以 √2。'}),
    'q01-3':q('q01-3',{t:'sel',ans:'b',why:'弦波永遠不停，能量積分發散、平均功率有限，所以是功率訊號；所有週期訊號都是功率訊號。',fix:'能量訊號的能量有限且功率為 0，弦波兩者都不符合。'}),
    'q02-1':q('q02-1',{t:'num',ans:0.367879,tol:0.001,why:'arg ＝ a(t − t_0) ＝ 1 × (2 − 1) ＝ 1.000000，y ＝ e^(−1) ＝ 0.367879：訊號被延後 1 秒，t ＝ 2 秒看到的是原本 t ＝ 1 秒的值。',fix:'常見的錯是直接代 t ＝ 2 而忘了先減掉平移量。'}),
    'q02-2':q('q02-2',{t:'num',ans:0.367879,tol:0.001,why:'篩選性 ∫ x(τ)δ(τ − 1) dτ ＝ x(1) ＝ e^(−1) ＝ 0.367879；δ 的作用是把曲線在某一點的值挑出來。',fix:'δ 的高度沒有意義，只有面積有意義，所以答案就是被積函數在該點的值。'}),
    'q02-3':q('q02-3',{t:'sel',ans:'b',why:'把 x(2t − 1) 整理成標準形 x(2(t − 0.5))，真正的平移量是 0.5 秒。',fix:'式子裡的 1 是「at − b」的 b，真正的平移是 b/a。'}),
    'q03-1':q('q03-1',{t:'num',ans:20,tol:0.01,why:'左式 (2×1 + 3×1)² ＝ 25、右式 2×1² + 3×1² ＝ 5，殘差 20.000000；殘差來自交叉項 2ab·x_1x_2。',fix:'左式是「先加再平方」，右式是「先平方再加權」，兩者差的就是交叉項。'}),
    'q03-2':q('q03-2',{t:'num',ans:-12,tol:0.01,why:'左式 (2 + 3) + 3 ＝ 8、右式 2(1 + 3) + 3(1 + 3) ＝ 20，殘差 −12.000000；通式是 3 − 3(a + b)。',fix:'注意殘差是負的，而且與輸入大小無關——毛病在那個常數偏移。'}),
    'q03-3':q('q03-3',{t:'sel',ans:'c',why:'把輸入延後 t_0 得 x(2t − t_0)，把輸出延後 t_0 得 x(2t − 2t_0)，兩者差一倍，所以違反的是時不變。',fix:'它其實是線性的（對輸入的疊加成立），壞掉的是時間軸。'}),
    'q04-1':q('q04-1',{t:'num',ans:0.432332,tol:0.001,why:'t ＝ 1 ≤ T_1 ＝ 1 屬於充電段，y ＝ Aτ(1 − e^(−t/τ)) ＝ 0.5(1 − 0.135335) ＝ 0.432332，這也正好是峰值。',fix:'常見的錯是用放電段的式子；分段判定要先做。'}),
    'q04-2':q('q04-2',{t:'num',ans:0.5,tol:0.005,why:'摺積的面積性質：∫y ＝ (∫x)(∫h) ＝ (A·T_1)(τ) ＝ 1.000000 × 0.500000 ＝ 0.500000。',fix:'這條性質是驗算摺積最好用的檢查，不必真的積分。'}),
    'q04-3':q('q04-3',{t:'sel',ans:'a',why:'篩選性把輸入寫成無限多根加權延遲脈衝，時不變讓每根脈衝的響應都是平移過的 h，線性讓它們可以疊回來——四個步驟只用到 LTI 這兩條性質。',fix:'h 不是「最大的響應」，它是系統對 δ 的響應，特別之處在於能生出所有其他輸出。'}),
    'q05-1':q('q05-1',{t:'num',ans:1.273240,tol:0.005,why:'方波是奇函數且半波對稱，只有奇次 sin 項，B_n ＝ 4A/(nπ)，n ＝ 1 時就是 4/π ＝ 1.273240。',fix:'注意基波振幅比方波本身的 A 還大，這不是錯——級數各項會互相抵消。'}),
    'q05-2':q('q05-2',{t:'num',ans:93.305552,tol:0.05,why:'累積功率 (B_1² + B_3² + B_5²)/2 ＝ 0.933056，總功率 A² ＝ 1.000000，佔 93.305552 %。',fix:'記得每一項要除以 2（來自 cos² 的時間平均），不是直接平方相加。'}),
    'q05-3':q('q05-3',{t:'sel',ans:'b',why:'方波有跳躍（不連續）所以係數 ∝ 1/n，三角波連續、只有斜率跳躍所以 ∝ 1/n²——波形愈平滑，高頻成分愈少。',fix:'與振幅、週期、奇偶都無關，關鍵是不連續的階數。'}),
    'q06-1':q('q06-1',{t:'num',ans:1000,tol:5,why:'矩形脈衝的頻譜是 A·T·sinc(fT)，第一個零點在 sin(πfT) ＝ 0 的第一個非零解，即 f ＝ 1/T ＝ 1/0.001 ＝ 1000.000000 Hz。',fix:'零點位置只由脈衝寬度決定，與高度無關。'}),
    'q06-2':q('q06-2',{t:'num',ans:0.636620,tol:0.002,why:'sinc(fT) ＝ sinc(0.5) ＝ sin(π/2)/(π/2) ＝ 1/1.570796 ＝ 0.636620（本課全程用歸一化 sinc）。',fix:'如果用 sin(x)/x 版本會算成別的數；本課一律用 sin(πx)/(πx)。'}),
    'q06-3':q('q06-3',{t:'sel',ans:'b',why:'x(t − t_0) ⇔ X(jω)·exp(−jωt_0)，那個因子的絕對值是 1，所以只改相位、振幅完全不變，相位隨頻率線性下降。',fix:'這正是「線性相位＝不失真延遲」的來歷，第 09 章會再用一次。'}),
    'q07-1':q('q07-1',{t:'num',ans:0.104353,tol:0.002,why:'h(t) ＝ K·e^(σt)·cos(ω_d t) ＝ e^(−1)·cos(5) ＝ 0.367879 × 0.283662 ＝ 0.104353。',fix:'cos 的引數是弧度不是度：ω_d t ＝ 10 × 0.5 ＝ 5 rad。'}),
    'q07-2':q('q07-2',{t:'num',ans:0.5,tol:0.01,why:'τ ＝ 1/|σ| ＝ 1/2 ＝ 0.500000 s，5τ ＝ 2.500000 s 後包絡只剩 0.674 %，工程上視為結束。',fix:'時間常數只看實部，與虛部（振盪多快）完全無關。'}),
    'q07-3':q('q07-3',{t:'sel',ans:'c',why:'σ ＝ 0 時包絡 e^(σt) 恆為 1，響應等幅振盪、永遠不停，這是邊界穩定（理想振盪器）。',fix:'衰減要 σ ＜ 0、發散要 σ ＞ 0；虛軸正好是兩者的分界。'}),
    'q08-1':q('q08-1',{t:'num',ans:16.303353,tol:0.1,why:'M_p ＝ exp(−πζ/√(1 − ζ²)) ＝ exp(−π×0.5/0.866025) ＝ 0.163034，也就是 16.303353 %。',fix:'M_p 只跟 ζ 有關，跟 omega_n 完全無關。'}),
    'q08-2':q('q08-2',{t:'num',ans:8.660254,tol:0.01,why:'omega_d ＝ omega_n√(1 − ζ²) ＝ 10 × √0.75 ＝ 8.660254 rad/s，這是實際振盪的頻率。',fix:'omega_n、omega_d、omega_r 是三個不同的頻率（10.000000、8.660254、7.071068），不要混用。'}),
    'q08-3':q('q08-3',{t:'sel',ans:'c',why:'超越量的式子裡只有 ζ，omega_n 只決定時間軸的快慢——把 omega_n 加倍，波形形狀一模一樣，只是時間壓縮一半。',fix:'會變的是 t_p 與 t_s（都減半），不是 M_p。'}),
    'q09-1':q('q09-1',{t:'num',ans:4.191761,tol:0.01,why:'n_min ＝ log10(10^(A_s/10) − 1)/(2·log10(f_s/f_c)) ＝ log10(9999)/(2·log10 3) ＝ 4.191761，取上整得 5 階。',fix:'記得先減 1 再取對數；直接用 A_s/(20·log10 ratio) 只是漸近近似。'}),
    'q09-2':q('q09-2',{t:'num',ans:47.712199,tol:0.1,why:'衰減 ＝ 10·log10(1 + 3^10) ＝ 10·log10(59050) ＝ 47.712199 dB，超過要求的 40 dB 所以合格。',fix:'4 階只給 38.170362 dB，不到 40——這就是為什麼要取上整。'}),
    'q09-3':q('q09-3',{t:'sel',ans:'b',why:'群延遲是「這個頻率成分被延後多久」；不平坦就代表不同頻率延後不同，各成分不同步抵達，波形因此變形（方波的角被磨圓）。',fix:'增益、穩定性、頻寬都不是群延遲不平坦的直接後果。'}),
    'q10-1':q('q10-1',{t:'num',ans:112.5,tol:0.1,why:'P_t ＝ P_c(1 + m²/2) ＝ 100 × (1 + 0.125) ＝ 112.500000 W，其中兩個邊帶各 6.250000 W。',fix:'常見的錯是忘了載波功率本身仍然全額存在。'}),
    'q10-2':q('q10-2',{t:'num',ans:11.111111,tol:0.05,why:'η ＝ (m²/2)/(1 + m²/2) ＝ 12.5/112.5 ＝ 11.111111 %；即使 m ＝ 1 也只有 33.333333 %。',fix:'效率只由 m 決定，與 P_c 無關——把發射機開大不會改善效率。'}),
    'q10-3':q('q10-3',{t:'sel',ans:'b',why:'m ＞ 1 時包絡 A_c[1 + m·cos] 會變負，二極體只認絕對值，波形被折回去，這就是過調變造成的失真。',fix:'頻寬 2f_m 與 m 無關，總功率反而變大，載波也不會消失。'}),
    'q11-1':q('q11-1',{t:'num',ans:3.689280,tol:0.005,why:'y[n] ＝ (1 − a^(n+1))/(1 − a) ＝ (1 − 0.8^6)/0.2 ＝ (1 − 0.262144)/0.2 ＝ 3.689280，這是幾何級數求和的結果。',fix:'指數是 n + 1 不是 n：從 k ＝ 0 加到 k ＝ n 共有 n + 1 項。'}),
    'q11-2':q('q11-2',{t:'num',ans:5,tol:0.01,why:'Σ|h[n]| ＝ Σ a^n ＝ 1/(1 − 0.8) ＝ 5.000000，這個和有限所以 BIBO 穩定，同時它就是直流增益。',fix:'直流增益不是 1：一階遞迴 y[n] ＝ a·y[n−1] + x[n] 沒有做正規化。'}),
    'q11-3':q('q11-3',{t:'sel',ans:'b',why:'FIR 沒有回授，h[n] 只有有限項，Σ|h[n]| 一定是有限個有限數的和，必然收斂，所以天生 BIBO 穩定。',fix:'長度短、係數對稱、是不是低通都不是穩定的理由。'}),
    'q12-1':q('q12-1',{t:'num',ans:3000,tol:5,why:'f_a ＝ |f − k·f_s|，k ＝ round(5000/8000) ＝ 1，所以 f_a ＝ |5000 − 8000| ＝ 3000.000000 Hz，而且它的樣本與真正的 3000 Hz 完全相同。',fix:'混疊不是「訊號變差」，而是變成另一個確定的頻率。'}),
    'q12-2':q('q12-2',{t:'num',ans:0.784213,tol:0.002,why:'|sinc(f/f_s)| ＝ |sinc(0.375)| ＝ 0.784213，也就是 −2.111316 dB，這是零階保持造成的 droop。',fix:'注意是 f/f_s 不是 f/(f_s/2)；ZOH 的零點在 f_s 的整數倍。'}),
    'q12-3':q('q12-3',{t:'sel',ans:'a',why:'混疊在取樣的那一刻就發生了，樣本裡已經分不出原始頻率，所以抗混疊濾波器必須在 ADC 之前的類比端把頻寬限制住。',fix:'數位端再強的濾波器也救不回已經重疊的頻譜。'}),
    'q13-1':q('q13-1',{t:'num',ans:7.8125,tol:0.01,why:'Δf ＝ f_s/N ＝ 8000/1024 ＝ 7.812500 Hz，等價於 1/T_win，其中 T_win ＝ 0.128000 s。',fix:'解析度只由窗長決定，零填充不會讓它變好。'}),
    'q13-2':q('q13-2',{t:'num',ans:204.8,tol:1,why:'直接 DFT 要 N² ＝ 1048576 次複數乘法，基 2 FFT 要 (N/2)log2 N ＝ 512 × 10 ＝ 5120 次，加速 204.800000 倍。',fix:'N 很小時（例如 16）加速只有 8 倍，FFT 的優勢不明顯。'}),
    'q13-3':q('q13-3',{t:'sel',ans:'c',why:'補 0 沒有帶來新的觀測時間，T_win 沒變，所以真正能分辨的最小頻率差不變；它只是把 DTFT 取樣得更密，是內插。',fix:'要提高解析度只有一個辦法：量更久。'}),
    'q14-1':q('q14-1',{t:'num',ans:-0.835079,tol:0.002,why:'h[n] ＝ r^n·sin((n+1)θ)/sinθ ＝ 0.9^5 × sin(270°)/sin(45°) ＝ 0.590490 × (−1.414214) ＝ −0.835079。',fix:'(n + 1)θ ＝ 6 × 45° ＝ 270°，sin 270° ＝ −1，所以 h[5] 是負的。'}),
    'q14-2':q('q14-2',{t:'num',ans:1.272792,tol:0.005,why:'(1 − pz^(−1))(1 − p*z^(−1)) ＝ 1 − 2r·cos θ·z^(−1) + r²z^(−2)，所以係數是 2 × 0.9 × cos 45° ＝ 1.272792。',fix:'第二個係數是 −r² ＝ −0.810000，不要和第一個搞混。'}),
    'q14-3':q('q14-3',{t:'sel',ans:'b',why:'離散時間的穩定條件是所有極點落在單位圓內（|z| ＜ 1）；z ＝ exp(sT_s) 把左半平面映射成單位圓內部。',fix:'「左半平面」是連續時間的條件，不能拿來判斷離散系統。'}),
    'q15-1':q('q15-1',{t:'num',ans:0.640729,tol:0.002,why:'|H| ＝ |sin(Mω/2)/(M·sin(ω/2))|，ω ＝ 2π×500/8000 ＝ 0.392699，代入得 0.640729，也就是 −3.866514 dB。',fix:'注意分母有一個 M；ω ＝ 0 時整個式子要取極限值 1。'}),
    'q15-2':q('q15-2',{t:'num',ans:285.301514,tol:1,why:'令 |H|² ＝ 1/2 解得 cos ω ＝ (4a − 1 − a²)/(2a) ＝ 0.975，ω ＝ arccos(0.975)，換算成頻率是 285.301514 Hz。',fix:'a 太小時這個餘弦值會超出 ±1，代表 −3 dB 點高過奈奎斯特頻率。'}),
    'q15-3':q('q15-3',{t:'sel',ans:'a',why:'FIR 沒有回授所以保證穩定，係數對稱時可得嚴格線性相位；IIR 用回授換到同規格下少得多的係數，代價是相位非線性且要小心穩定性。',fix:'FIR 不一定比較快（M 次乘加通常更貴），IIR 也不一定不穩定。'})
  };
  const ids=Object.keys(Q);
  const progress=()=>{
    const n=ids.filter(i=>$(i)&&String($(i).value).trim()!=='').length;
    if($('quiz-progress'))$('quiz-progress').textContent="已作答 "+n+" / "+ids.length+" 題（僅供參考，不影響瀏覽）";
  };
  const link=o=>'<a href="'+o.ref+'">'+o.refName+'</a>';
  const check=id=>{
    const node=$(id),out=$(id+'-output');
    if(!node||!out)return;
    const o=Q[id];
    const raw=String(node.value).trim();
    if(raw===''){
      out.innerHTML="<p>"+(o.t==='sel'?"先選一個選項":"先填一個數字")+"，再按「對答案」。</p>";
      progress();
      return;
    }
    let good;
    if(o.t==='sel')good=raw===o.ans;
    else good=Math.abs(Number(raw)-o.ans)<=o.tol;
    if(good){
      out.innerHTML="<p><strong>答對</strong>："+o.why+"</p><p>回去看："+link(o)+"</p>";
    }else{
      const ansTxt=o.t==='sel'?o.ans:num6(o.ans);
      out.innerHTML="<p><strong>再看一次</strong>：正確答案是 "+ansTxt+"。"+o.why+"</p><p>常見的卡點："+o.fix+"</p><p>回去看："+link(o)+"</p>";
    }
    progress();
  };
  ids.forEach(id=>{on(id+'-check','click',()=>check(id));on(id,'input',progress)});
  on('quiz-reset','click',()=>{
    ids.forEach(id=>{if($(id))$(id).value='';if($(id+'-output'))$(id+'-output').innerHTML='';});
    progress();
  });
  progress();
}

/* ---------- 6. 註冊 ---------- */
if(typeof document!=="undefined"){
  [sysmap,sigclass,sigops,syscheck,convolve,fourierseries,ctft,splane,
   secondorder,filterorder,ammod,dtsystem,sampling,dftlab,zplane,digfilter,
   dictionary,selfcheck].forEach(f=>f());
}

/* ---------- 7. 匯出（供語法檢查與人工交叉驗算） ---------- */
if(typeof module!=="undefined")module.exports={
  fmt,exp,num6,sci,sinc,rad,deg,db20,db10,SQRT1_2,DB3,
  sysmap,sigclass,sigops,syscheck,convolve,fourierseries,ctft,splane,
  secondorder,filterorder,ammod,dtsystem,sampling,dftlab,zplane,digfilter,
  dictionary,selfcheck
};

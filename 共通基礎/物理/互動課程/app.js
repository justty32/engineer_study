"use strict";
// 普通物理（零基礎互動課）：所有頁面共用的互動邏輯。
// 規則：確定性（不使用亂數、不讀時鐘）、無外部請求、每個 widget 一個守衛函式。
// 依據：共通基礎/物理/互動課程/BUILD-SPEC.md 第 3.4、4、5、6、7 節。

// 1. helper
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// 負號一律輸出 U+2212（規約第 3.1 節）；非有限值一律不外露，改印破折號。
const fmt=(x,n=6)=>{const v=Number(x);if(!isFinite(v))return "—";return v.toFixed(n).replace("-","−")};
const val=x=>{const n=$(x);return n?Number(n.value):0};
const pick=x=>{const n=$(x);return n?String(n.value):""};

// 2. 物理常數（BUILD-SPEC 第 3.4 節，唯一事實來源）
const G_ACC=9.8;                          // m/s²
const C_LIGHT=299792458;                  // m/s
const EPS0=8.8541878128e-12;              // F/m
const MU0=1.25663706212e-6;               // T·m/A
const K_E=8.9875517873681764e9;           // N·m²/C²
const ETA0=376.730313668;                 // Ω
const E_CHARGE=1.602176634e-19;           // C
const H_PLANCK=6.62607015e-34;            // J·s
const HC_EVNM=1239.841984;                // eV·nm
const K_B=1.380649e-23;                   // J/K
const M_E=9.1093837015e-31;               // kg
const R_GAS=8.314462618;                  // J/(mol·K)
const I0_SOUND=1e-12;                     // W/m²
const P_ATM=101325;                       // Pa
const RHO_WATER=1000;                     // kg/m³
const EV_J=1.602176634e-19;               // J/eV

// 3. 數學／格式工具
// 科學記號：輸出「尾數e指數」，文字裡讀成「乘以 10 的幾次方」。
const fmtExp=(x,n=6)=>{
  const v=Number(x);
  if(!isFinite(v))return "—";
  if(v===0)return "0";
  let e=Math.floor(Math.log10(Math.abs(v)));
  let m=v/Math.pow(10,e);
  if(Math.abs(Number(m.toFixed(n)))>=10){m=m/10;e=e+1;}
  return m.toFixed(n).replace("-","−")+"e"+(e<0?"−"+String(-e):String(e));
};
const fmtSigned=(x,n=6)=>{const v=Number(x);if(!isFinite(v))return "—";return (v>=0?"+":"")+fmt(v,n)};
const pct=(x,n=6)=>fmt(100*Number(x),n)+" %";
const engFreq=f=>{
  const v=Number(f);
  if(!isFinite(v))return "—";
  if(v>=1e12)return fmt(v/1e12)+" THz";
  if(v>=1e9)return fmt(v/1e9)+" GHz";
  if(v>=1e6)return fmt(v/1e6)+" MHz";
  if(v>=1e3)return fmt(v/1e3)+" kHz";
  return fmt(v)+" Hz";
};
// 分母為零時回傳 null，由呼叫端走文字分支，避免非有限值外洩。
const safeDiv=(a,b)=>(Number(b)===0?null:Number(a)/Number(b));
// 量級太小或太大時自動改用科學記號。
const auto=(x,n=6)=>{
  const v=Number(x);
  if(!isFinite(v))return "—";
  if(v!==0&&(Math.abs(v)<1e-4||Math.abs(v)>=1e7))return fmtExp(v,n);
  return fmt(v,n);
};

// 4. 各章守衛函式

// 00 物理地圖
function physmap(){
  if(!$('topic-pick'))return;
  const MAP={
    circuit:{name:"電路學",need:"電荷、電流、電位、電容、電感、歐姆定律、KVL／KCL、RLC 與彈簧同形",ch:"第 03、06、08、09、10 章",stuck:"不知道電壓和電位差在講什麼，也看不懂為什麼二階電路會振盪"},
    em:{name:"電磁學",need:"電場、高斯定律、磁場、安培定律、法拉第定律、位移電流、馬克士威四式、電磁波",ch:"第 08、10、11 章",stuck:"看不懂四條方程在說什麼守恆"},
    motor:{name:"電機機械",need:"勞侖茲力、力矩、轉動慣量、角動量、法拉第與冷次定律",ch:"第 05、10 章",stuck:"不知道轉矩從哪來、反電動勢是什麼"},
    comm:{name:"通訊系統",need:"波動方程、疊加與干涉、都卜勒、dB、電磁波頻譜、熱雜訊",ch:"第 07、11、12、13 章",stuck:"算不出雜訊地板，也說不出頻寬的物理意義"},
    optic:{name:"光纖通訊",need:"折射率、全反射、干涉繞射、相干、光子能量",ch:"第 14、15 章",stuck:"不知道光為什麼被鎖在纖芯裡"},
    device:{name:"電子學",need:"能帶、能隙、熱激發、光電效應、半導體",ch:"第 07、15 章",stuck:"看不懂為什麼矽是半導體而銅不是"}
  };
  const draw=()=>{
    const m=MAP[pick('topic-pick')]||MAP.circuit;
    $('physmap-output').innerHTML=
      "<p><strong>"+m.name+"</strong></p>"+
      "<p>需要的物理＝"+m.need+"</p>"+
      "<p>對應本課"+m.ch+"</p>"+
      "<p>不學會卡在："+m.stuck+"</p>"+
      "<p>把「卡在哪」讀一遍就知道：這些章不是課綱湊數，是那門課的入場券。</p>";
  };
  ['topic-pick'].forEach(x=>on(x,'input',draw));
  draw();
}

// 01 運動學：拋體
function projectile(){
  if(!$('pj-v0'))return;
  const draw=()=>{
    const v0=val('pj-v0'),ang=val('pj-angle'),h0=val('pj-h0'),t=val('pj-t');
    const vx=v0*Math.cos(rad(ang)),vy0=v0*Math.sin(rad(ang));
    const T=(vy0+Math.sqrt(vy0*vy0+2*G_ACC*h0))/G_ACC;
    const R=vx*T,H=h0+vy0*vy0/(2*G_ACC),tPeak=vy0/G_ACC;
    const x=vx*t,y=h0+vy0*t-0.5*G_ACC*t*t,vy=vy0-G_ACC*t;
    const speed=Math.hypot(vx,vy),spec=speed*speed/2+G_ACC*y;
    const e0=v0*v0/2+G_ACC*h0;
    let msg="";
    if(T<=0){
      msg+="<p>貼地平拋：發射高度 0、仰角 0，物體一離手就在地面上，T = 0 s、R = 0 m。</p>";
    }else if(ang>=90){
      msg+="<p>垂直上拋，落回原點：水平分量為 0，所以射程 R = 0 m，但飛行時間與最高點都不為零。</p>";
    }
    if(t>T){
      msg+="<p>這個時刻物體已經落地（t = "+fmt(t)+" s 超過 T = "+fmt(T)+" s），公式外插只是數學延伸，不是真的還在飛。</p>";
    }
    $('projectile-output').innerHTML=
      "<p>分量：v<sub>0x</sub> = "+fmt(vx)+" m/s、v<sub>0y</sub> = "+fmt(vy0)+" m/s</p>"+
      "<p>飛行時間 T = "+fmt(T)+" s；射程 R = "+fmt(R)+" m；最高點 H = "+fmt(H)+" m，發生在 t = "+fmt(tPeak)+" s</p>"+
      "<p>t = "+fmt(t)+" s 時：x = "+fmt(x)+" m、y = "+fmt(y)+" m、v<sub>y</sub> = "+fmt(vy)+" m/s、速率 = "+fmt(speed)+" m/s</p>"+
      "<p>每單位質量的機械能 v²/2 + gy = "+fmt(spec)+"，起始值 v<sub>0</sub>²/2 + gh<sub>0</sub> = "+fmt(e0)+"——兩者永遠相同，這就是第 03 章的機械能守恆。</p>"+
      "<p>落地速率 = √(v<sub>0</sub>² + 2gh<sub>0</sub>) = "+fmt(Math.sqrt(v0*v0+2*G_ACC*h0))+" m/s</p>"+
      msg+
      "<p>因果：水平方向沒有力，所以 x 隨 t 線性成長；垂直方向被 g 拉，所以 y 是二次曲線。兩個方向互不干擾。</p>";
  };
  ['pj-v0','pj-angle','pj-h0','pj-t'].forEach(x=>on(x,'input',draw));
  draw();
}

// 02 牛頓運動定律：斜面
function incline(){
  if(!$('inc-mass'))return;
  const draw=()=>{
    const m=val('inc-mass'),ang=val('inc-angle'),mus=val('inc-mus'),muk=val('inc-muk');
    const w=m*G_ACC,along=w*Math.sin(rad(ang)),normal=w*Math.cos(rad(ang));
    const fsMax=mus*normal,slides=along>fsMax,fk=muk*normal;
    const a=slides?(along-fk)/m:0,fUsed=slides?fk:along,thetaC=deg(Math.atan(mus));
    const used=safeDiv(along,fsMax);
    let judge="";
    if(slides){
      judge="<p><strong>會滑動</strong>：驅動力 "+fmt(along)+" N 大於最大靜摩擦 "+fmt(fsMax)+" N，加速度 a = "+fmt(a)+" m/s²。</p>"+
        "<p>用公式驗算 a = g(sin θ − μ<sub>k</sub> cos θ) = "+fmt(G_ACC*(Math.sin(rad(ang))-muk*Math.cos(rad(ang))))+" m/s²——<strong>加速度與質量無關</strong>，把質量從 0.5 拉到 20 這個數字都不會變。</p>";
      if(a<0)judge+="<p>這個負值代表：若物體已經在下滑，動摩擦大於重力分量，它會減速直到停住。</p>";
    }else{
      judge="<p><strong>不會滑動</strong>：靜摩擦只用到 "+fmt(fUsed)+" N（等於 mg sin θ，<strong>不是</strong> μ<sub>s</sub>N），"+
        "用掉最大靜摩擦的 "+(used===null?"—":pct(clamp(used,0,1)))+"。</p>";
    }
    let warn="";
    if(mus<muk)warn+="<p>提醒：現實中 μ<sub>s</sub> ≥ μ<sub>k</sub>，你現在設成 μ<sub>s</sub> &lt; μ<sub>k</sub> 是非物理的設定，以下仍照公式算。</p>";
    if(ang===0)warn+="<p>θ = 0 時 N = mg、沿面分量為 0，必定不滑動。</p>";
    $('incline-output').innerHTML=
      "<p>重力 mg = "+fmt(w)+" N；沿斜面分量 mg sin θ = "+fmt(along)+" N；正向力 N = mg cos θ = "+fmt(normal)+" N</p>"+
      "<p>最大靜摩擦 μ<sub>s</sub>N = "+fmt(fsMax)+" N；動摩擦 μ<sub>k</sub>N = "+fmt(fk)+" N</p>"+
      judge+
      "<p>臨界角 θ<sub>c</sub> = arctan(μ<sub>s</sub>) = "+fmt(thetaC)+"°；判準等價於 tan θ = "+fmt(Math.tan(rad(ang)))+" 與 μ<sub>s</sub> = "+fmt(mus)+" 比大小——質量與 g 全部消掉。</p>"+
      warn+
      "<p>因果：靜摩擦是被動的，物體不動時它只長到剛好抵消驅動力；一旦超過上限就換動摩擦接手，值就固定在 μ<sub>k</sub>N。</p>";
  };
  ['inc-mass','inc-angle','inc-mus','inc-muk'].forEach(x=>on(x,'input',draw));
  draw();
}

// 03 功與能量
function energy(){
  if(!$('en-mass'))return;
  const draw=()=>{
    const m=val('en-mass'),h0=val('en-h0'),v0=val('en-v0'),h=val('en-h'),loss=val('en-loss'),t=val('en-t');
    const e0=0.5*m*v0*v0+m*G_ACC*h0,u=m*G_ACC*h,kNow=e0-loss-u;
    const hMax=(e0-loss)/(m*G_ACC),pAvg=m*G_ACC*(h0-h)/t;
    let core="";
    if(kNow<0){
      core="<p><strong>以目前的能量到不了 h = "+fmt(h)+" m</strong>：扣掉損耗後只剩 "+fmt(e0-loss)+" J，最高只能到 h<sub>max</sub> = "+fmt(hMax)+" m。把現在高度調低一點再看。</p>";
    }else{
      const v=Math.sqrt(2*kNow/m);
      core="<p>動能 K = "+fmt(kNow)+" J；速率 v = √(2K/m) = "+fmt(v)+" m/s</p>"+
        "<p>在無摩擦、v<sub>0</sub> = 0 時 v = √(2gΔh) = "+fmt(Math.sqrt(Math.max(2*G_ACC*(h0-h),0)))+" m/s，<strong>與質量無關</strong>——把質量從 2 拉到 20，速率完全不變。</p>";
    }
    $('energy-output').innerHTML=
      "<p>總機械能 E<sub>0</sub> = (1/2)mv<sub>0</sub>² + mgh<sub>0</sub> = "+fmt(e0)+" J</p>"+
      "<p>位能 U = mgh = "+fmt(u)+" J</p>"+
      core+
      "<p>帳目檢查：K + U + E<sub>loss</sub> = "+fmt(Math.max(kNow,0)+u+loss)+" J，E<sub>0</sub> = "+fmt(e0)+" J"+(kNow<0?"（能量不足時 K 記為 0，差額就是到不了的原因）":"——兩者相同")+"</p>"+
      "<p>可達最高點 h<sub>max</sub> = (E<sub>0</sub> − E<sub>loss</sub>)/(mg) = "+fmt(hMax)+" m</p>"+
      "<p>這段時間內<strong>重力對物體做功的平均功率</strong> P = mg(h<sub>0</sub> − h)/t = "+fmt(pAvg)+" W（不是瞬時功率）</p>"+
      "<p>因果：位能換成動能，總和不變；摩擦沒有讓能量消失，是把差額變成熱（第 07 章）。</p>";
  };
  ['en-mass','en-h0','en-v0','en-h','en-loss','en-t'].forEach(x=>on(x,'input',draw));
  draw();
}

// 04 動量與碰撞
function collide(){
  if(!$('col-m1'))return;
  const draw=()=>{
    const m1=val('col-m1'),v1=val('col-v1'),m2=val('col-m2'),v2=val('col-v2'),e=val('col-e');
    const M=m1+m2,p=m1*v1+m2*v2,vcm=p/M;
    const u1=(p+m2*e*(v2-v1))/M,u2=(p+m1*e*(v1-v2))/M;
    const mu=m1*m2/M;
    const k0=0.5*m1*v1*v1+0.5*m2*v2*v2,k1=0.5*m1*u1*u1+0.5*m2*u2*u2;
    const dk=0.5*mu*(1-e*e)*(v1-v2)*(v1-v2);
    const p1=m1*u1+m2*u2;
    let type="";
    if(Math.abs(e-1)<=1e-9)type="<p><strong>彈性碰撞：動能也守恆</strong>（碰前碰後都是 "+fmt(k0)+" J）。</p>";
    else if(e===0)type="<p><strong>完全非彈性碰撞</strong>：兩者黏在一起以質心速度 "+fmt(vcm)+" m/s 前進，動能損失最大。</p>";
    else type="<p><strong>非彈性碰撞</strong>：動量守恆、動能損失 "+fmt(dk)+" J，能量保留比例是 e² = "+fmt(e*e)+"。</p>";
    let warn="";
    if(v1===v2)warn+="<p>兩者速度相同，不會追撞：碰後速度與碰前一樣，損失 0 J。</p>";
    else if(v1<v2)warn+="<p>提醒：v<sub>1</sub> &lt; v<sub>2</sub> 代表兩者正在遠離，這組初速不會發生碰撞，以下只是把公式套上去的結果。</p>";
    $('collide-output').innerHTML=
      "<p>碰前總動量 p = "+fmt(p)+" kg·m/s；碰後總動量 = "+fmt(p1)+" kg·m/s——並排看就知道守恆。</p>"+
      "<p>碰後速度：v<sub>1</sub>′ = "+fmt(u1)+" m/s、v<sub>2</sub>′ = "+fmt(u2)+" m/s</p>"+
      "<p>碰前動能 = "+fmt(k0)+" J；碰後動能 = "+fmt(k1)+" J；直接相減的損失 = "+fmt(k0-k1)+" J；公式 (1/2)μ(1 − e²)(v<sub>1</sub> − v<sub>2</sub>)² = "+fmt(dk)+" J（約化質量 μ = "+fmt(mu)+" kg）</p>"+
      "<p>質心速度 v<sub>cm</sub> = "+fmt(vcm)+" m/s，碰前碰後相同。</p>"+
      type+warn+
      "<p>因果：碰撞只重新分配相對運動，不動質心；內力再大也成對抵消，所以動量一定守恆，動能卻不一定。</p>";
  };
  ['col-m1','col-v1','col-m2','col-v2','col-e'].forEach(x=>on(x,'input',draw));
  draw();
}

// 05 轉動與角動量
function rotation(){
  if(!$('rot-shape'))return;
  const COEF={hoop:1,disk:0.5,sphere:0.4,rodc:1/12,rode:1/3};
  const NAME={hoop:"薄圓環（MR²）",disk:"實心圓盤（½MR²）",sphere:"實心球（⅖MR²）",rodc:"細桿繞中心（1/12·ML²）",rode:"細桿繞端點（⅓ML²）"};
  const draw=()=>{
    const key=pick('rot-shape');
    const coef=(COEF[key]===undefined)?COEF.disk:COEF[key];
    const name=NAME[key]||NAME.disk;
    const M=val('rot-mass'),size=val('rot-size'),omega=val('rot-omega'),tau=val('rot-torque'),k=val('rot-shrink');
    const I=coef*M*size*size,L=I*omega,K=0.5*I*omega*omega;
    const alpha=I>0?tau/I:0;
    const I2=coef*M*(size*k)*(size*k);
    const w2=I2>0?L/I2:0;
    const K2=0.5*I2*w2*w2,dW=K2-K;
    let note="";
    if(tau===0)note+="<p>沒有外力矩，角加速度 α = 0，角速度不變——這是轉動版的第一定律。</p>";
    if(k===1)note+="<p>k = 1 代表沒有收手：I′ = I、ω′ = ω、ΔK = 0。</p>";
    if(omega===0)note+="<p>ω = 0 時 L = 0、K = 0，收手也不會自己轉起來（沒有角動量可以守恆）。</p>";
    $('rotation-output').innerHTML=
      "<p>形狀："+name+"，係數 = "+fmt(coef)+"</p>"+
      "<p>轉動慣量 I = "+fmt(I)+" kg·m²；角動量 L = Iω = "+fmt(L)+" kg·m²/s；轉動動能 K = (1/2)Iω² = "+fmt(K)+" J</p>"+
      "<p>角加速度 α = τ/I = "+fmt(alpha)+" rad/s²</p>"+
      "<p>收手到 k = "+fmt(k,2)+" 倍：I′ = "+fmt(I2)+" kg·m²、ω′ = "+fmt(w2)+" rad/s、K′ = "+fmt(K2)+" J</p>"+
      "<p>檢查角動量：L = "+fmt(L)+"、L′ = I′ω′ = "+fmt(I2*w2)+"——兩者相同；且 ω′ = ω/k² = "+fmt(k>0?omega/(k*k):0)+" rad/s、K′ = K/k² = "+fmt(k>0?K/(k*k):0)+" J。</p>"+
      "<p>多出來的動能 ΔK = "+fmt(dW)+" J，是收手的手臂做的功，不是憑空生出來的。</p>"+
      note+
      "<p>因果：角動量守恆，所以 I 變小 ω 就變大；動能卻變大，因為把質量往內拉需要對抗離心趨勢做功。</p>";
  };
  ['rot-shape','rot-mass','rot-size','rot-omega','rot-torque','rot-shrink'].forEach(x=>on(x,'input',draw));
  draw();
}

// 06 簡諧運動與共振
function shm(){
  if(!$('shm-m'))return;
  const draw=()=>{
    const m=val('shm-m'),k=val('shm-k'),c=val('shm-c'),w=val('shm-drive'),f0=val('shm-f0');
    const w0=Math.sqrt(k/m),cc=2*Math.sqrt(k*m),zeta=c/cc;
    const wd=zeta<1?w0*Math.sqrt(1-zeta*zeta):0;
    const den=Math.hypot(k-m*w*w,c*w);
    const xStatic=f0/k;
    const phase=deg(Math.atan2(c*w,k-m*w*w));
    const Lh=m,Rr=c,Cap=1/k,wLC=1/Math.sqrt(Lh*Cap);
    let kind="";
    if(zeta===0)kind="<p><strong>無阻尼</strong>（ζ = 0）：理論上驅動在 ω<sub>0</sub> 時振幅無限成長。</p>";
    else if(Math.abs(zeta-1)<=1e-9)kind="<p><strong>臨界阻尼</strong>（ζ = 1）：不振盪之中最快回到平衡（不是「最快」，是「不振盪裡最快」）。</p>";
    else if(zeta<1)kind="<p><strong>欠阻尼</strong>（ζ &lt; 1）：會振盪並指數衰減，阻尼自然頻率 ω<sub>d</sub> = "+fmt(wd)+" rad/s。</p>";
    else kind="<p><strong>過阻尼</strong>（ζ &gt; 1）：不振盪，慢慢爬回平衡。</p>";
    let amp="";
    if(den===0){
      amp="<p><strong>無阻尼共振</strong>：理論上振幅無限成長，真實系統會被非線性或結構破壞限制住，所以這個數字不存在上限值可印。</p>";
    }else{
      const X=f0/den,gain=k/den;
      amp="<p>穩態振幅 X = F<sub>0</sub>/√((k − mω²)² + (cω)²) = "+auto(X)+" m；靜態位移 F<sub>0</sub>/k = "+auto(xStatic)+" m；放大率 = "+fmt(gain)+"</p>";
      if(Math.abs(w-w0)<=1e-9&&zeta>0){
        amp+="<p>此刻 ω = ω<sub>0</sub>，放大率必須等於 1/(2ζ) = "+fmt(1/(2*zeta))+"——兩個數字相同，代表<strong>共振有多高完全由阻尼決定，跟驅動力大小無關</strong>。</p>";
      }
      if(w===0)amp+="<p>ω = 0（靜態施力）時放大率為 1，位移就是 F<sub>0</sub>/k。</p>";
      if(w>2*w0&&w0>0)amp+="<p>高頻時質量跟不上，放大率趨近 ω<sub>0</sub>²/ω² = "+fmt(w0*w0/(w*w))+"，振幅隨 ω² 掉。</p>";
      if(f0===0)amp+="<p>沒有驅動力（F<sub>0</sub> = 0），穩態振幅為 0，只剩自然響應；上面的放大率仍是這個系統的性質。</p>";
    }
    const q=zeta>0?"<p>品質因數 Q = 1/(2ζ) = "+fmt(1/(2*zeta))+"</p>":"<p>品質因數 Q = 1/(2ζ) 在 ζ = 0 時沒有有限值，代表共振峰無限窄也無限高。</p>";
    $('shm-output').innerHTML=
      "<p>自然角頻率 ω<sub>0</sub> = √(k/m) = "+fmt(w0)+" rad/s；f<sub>0</sub> = ω<sub>0</sub>/(2π) = "+fmt(w0/(2*Math.PI))+" Hz；週期 T = "+fmt(2*Math.PI/w0)+" s</p>"+
      "<p>臨界阻尼 c<sub>c</sub> = 2√(km) = "+fmt(cc)+" N·s/m；阻尼比 ζ = c/c<sub>c</sub> = "+fmt(zeta)+"（無單位）</p>"+
      kind+amp+q+
      "<p>相位落後 φ = arctan(cω/(k − mω²)) = "+fmt(phase)+"°（ω &lt; ω<sub>0</sub> 時介於 0° 與 90°、ω = ω<sub>0</sub> 時恰 90°、ω &gt; ω<sub>0</sub> 時介於 90° 與 180°）</p>"+
      "<p>等效電路：L = "+fmt(Lh)+" H、R = "+fmt(Rr)+" Ω、C = "+auto(Cap)+" F；1/√(LC) = "+fmt(wLC)+" rad/s，與 ω<sub>0</sub> = "+fmt(w0)+" rad/s 相同——彈簧與 RLC 是同一條方程。</p>"+
      "<p>因果：阻尼越小，共振峰越高也越窄；把 c 調大，尖峰立刻塌下來。</p>";
  };
  ['shm-m','shm-k','shm-c','shm-drive','shm-f0'].forEach(x=>on(x,'input',draw));
  draw();
}

// 07 熱學與流體
function thermal(){
  if(!$('th-mode'))return;
  const draw=()=>{
    const mode=pick('th-mode');
    const m=val('th-mass'),cSpec=val('th-c'),dT=val('th-dt');
    const th=val('th-thot'),tc=val('th-tcold');
    const logr=val('th-logr'),logb=val('th-logb');
    const Q=m*cSpec*dT;
    const eta=1-tc/th,W=Q*eta,Qc=Q-W;
    const R=Math.pow(10,logr),B=Math.pow(10,logb);
    const vrms=Math.sqrt(4*K_B*tc*R*B),Pn=K_B*tc*B;
    const dBm=10*Math.log10(Pn/1e-3),nvHz=Math.sqrt(4*K_B*tc*R)*1e9;
    let html="";
    if(mode==="heat"){
      html="<p>加熱升溫：Q = mcΔT = "+fmt(m,2)+" × "+fmt(cSpec,0)+" × "+fmt(dT,0)+" = "+fmt(Q)+" J = "+fmt(Q/1000)+" kJ</p>"+
        "<p>Q 與 m、c、ΔT 三者都成正比：任一項加倍，Q 就加倍。</p>"+
        "<p>同樣的 ΔT，水的比熱 4200 J/(kg·K) 是鋁 900 J/(kg·K) 的 4.666667 倍，所以水難加熱也難冷卻——這是水冷散熱的物理理由。</p>";
    }else if(mode==="carnot"){
      if(tc>=th){
        html="<p>低溫源不比高溫源冷（T<sub>C</sub> = "+fmt(tc,0)+" K ≥ T<sub>H</sub> = "+fmt(th,0)+" K），這台熱機不會輸出功。把 T<sub>C</sub> 調低或把 T<sub>H</sub> 調高再看。</p>";
      }else{
        html="<p>卡諾效率 η = 1 − T<sub>C</sub>/T<sub>H</sub> = 1 − "+fmt(tc,0)+"/"+fmt(th,0)+" = "+fmt(eta)+" = "+pct(eta)+"</p>"+
          "<p>若輸入熱量 Q<sub>H</sub> = "+fmt(Q)+" J（用上面的 mcΔT），最多輸出功 W = "+fmt(W)+" J，必定排掉廢熱 Q<sub>C</sub> = "+fmt(Qc)+" J。</p>"+
          "<p>效率只由兩個溫度決定，與工作物質、機構設計完全無關；而且 η 永遠 &lt; 1——要 100 % 得有 T<sub>C</sub> = 0 K，第三定律說做不到。</p>";
      }
    }else{
      html="<p>電阻 R = 10<sup>"+fmt(logr,1)+"</sup> = "+auto(R)+" Ω；頻寬 B = 10<sup>"+fmt(logb,1)+"</sup> = "+auto(B)+" Hz；溫度用 T<sub>C</sub> = "+fmt(tc,0)+" K</p>"+
        "<p>雜訊電壓 v<sub>rms</sub> = √(4k<sub>B</sub>TRB) = "+fmtExp(vrms)+" V = "+fmt(vrms*1e9)+" nV</p>"+
        "<p>雜訊密度 = √(4k<sub>B</sub>TR) = "+fmt(nvHz)+" nV/√Hz（1 kΩ、300 K 時就是常聽到的 4.070355）</p>"+
        "<p>可用雜訊功率 P<sub>n</sub> = k<sub>B</sub>TB = "+fmtExp(Pn)+" W = "+fmt(dBm)+" dBm（送進匹配負載時的功率，不是電阻兩端的功率）</p>"+
        "<p>頻寬變 4 倍或電阻變 4 倍，v<sub>rms</sub> 都只變 2 倍——因為它們在根號裡面。</p>"+
        "<p>這是電阻自己發出來的，跟有沒有接電源無關；降溫可以降低它，這就是低雜訊放大器要冷卻的原因。</p>";
    }
    $('thermal-output').innerHTML=html+
      "<p>三個模式的溫度都用絕對溫度 K：攝氏轉絕對溫度要 +273.15。</p>";
  };
  ['th-mode','th-mass','th-c','th-dt','th-thot','th-tcold','th-logr','th-logb'].forEach(x=>on(x,'input',draw));
  draw();
}

// 08 靜電學
function coulomb(){
  if(!$('es-q1'))return;
  const draw=()=>{
    const q1=val('es-q1'),q2=val('es-q2'),d=val('es-d'),x=val('es-x'),er=val('es-er');
    const Q1=q1*1e-9,Q2=q2*1e-9;
    const F=K_E*Math.abs(Q1*Q2)/(er*d*d);
    const r1=x,r2=x-d;
    let sign="";
    if(q1===0||q2===0)sign="沒有電荷就沒有力";
    else if(q1*q2>0)sign="排斥";
    else sign="吸引";
    let fieldHtml="";
    if(r1===0||r2===0){
      fieldHtml="<p><strong>觀察點正好在點電荷上</strong>：r = 0 時場與電位發散——這是點電荷模型的極限，真實電荷有大小，靠得夠近就要改用電荷分布來算。把觀察點 x 移開 0 或 d 再看。</p>";
    }else{
      const E1=K_E*Q1/(er*r1*r1)*Math.sign(r1);
      const E2=K_E*Q2/(er*r2*r2)*Math.sign(r2);
      const Ex=E1+E2;
      const V=K_E*Q1/(er*Math.abs(r1))+K_E*Q2/(er*Math.abs(r2));
      fieldHtml="<p>觀察點 x = "+fmt(x,2)+" m：E<sub>1</sub> = "+fmt(E1)+" V/m、E<sub>2</sub> = "+fmt(E2)+" V/m，合成 E<sub>x</sub> = "+fmt(Ex)+" V/m（正值代表指向 +x）</p>"+
        "<p>電位 V = "+fmt(V)+" V（純量直接相加，不看方向）</p>";
    }
    let zero="";
    const a=Math.abs(q1),b=Math.abs(q2);
    if(a===0&&b===0)zero="<p>兩個電荷都是 0，全空間電場都是 0。</p>";
    else if(a===0||b===0)zero="<p>只有一個電荷時電場處處不為零（只有無窮遠才趨近 0），沒有有限的零場點。</p>";
    else if(q1*q2<0&&Math.abs(a-b)<=1e-12)zero="<p>等量異號沒有零場點，電場處處不為零。</p>";
    else{
      const s=Math.sqrt(b/a);
      const xz=(q1*q2>0)?d/(1+s):(Math.abs(1-s)<=1e-12?null:d/(1-s));
      zero=(xz===null)?"<p>這組電荷沒有有限的零場點。</p>":
        "<p>零場點在 x = "+fmt(xz)+" m——"+(q1*q2>0?"同號時解落在兩電荷<strong>之間</strong>":"異號時解落在<strong>絕對值較小</strong>的電荷外側")+"。</p>";
    }
    $('coulomb-output').innerHTML=
      "<p>兩電荷間的作用力 F = k<sub>e</sub>|q<sub>1</sub>q<sub>2</sub>|/(ε<sub>r</sub>d²) = "+fmtExp(F)+" N（"+sign+"）</p>"+
      "<p>距離 d 加倍 F 會變成 1/4——平方反比；ε<sub>r</sub> 從 1 調到 2，F、E、V 全部剛好減半。</p>"+
      fieldHtml+zero+
      "<p>因果：電場是<strong>向量</strong>要看方向相加，電位是<strong>純量</strong>直接相加——這就是為什麼兩個異號電荷的中點電場相加、電位相減。</p>";
  };
  ['es-q1','es-q2','es-d','es-x','es-er'].forEach(x=>on(x,'input',draw));
  draw();
}

// 09 電流與電路基礎
function ohmwire(){
  if(!$('oh-mat'))return;
  const RHO={cu:1.68e-8,al:2.65e-8,fe:9.71e-8,nichrome:1.10e-6};
  const MATNAME={cu:"銅",al:"鋁",fe:"鐵",nichrome:"鎳鉻合金"};
  const draw=()=>{
    const key=pick('oh-mat');
    const rho=(RHO[key]===undefined)?RHO.cu:RHO[key];
    const matName=MATNAME[key]||MATNAME.cu;
    const len=val('oh-len'),area=val('oh-area'),v=val('oh-v'),rload=val('oh-rload');
    const Rw=rho*len/(area*1e-6),Rt=Rw+rload,I=v/Rt;
    const Vload=I*rload,Vw=I*Rw;
    const Pt=v*I,Pload=I*I*rload,Pw=I*I*Rw,eff=rload/Rt;
    let warn="";
    if(Rw>rload)warn+="<p>導線比負載還耗電（R<sub>線</sub> = "+fmt(Rw)+" Ω &gt; R<sub>負載</sub> = "+fmt(rload)+" Ω），這條線太細或太長，功率大半燒在路上。</p>";
    $('ohmwire-output').innerHTML=
      "<p>材料："+matName+"，ρ = "+fmtExp(rho)+" Ω·m（20 °C）</p>"+
      "<p>導線電阻 R<sub>線</sub> = ρℓ/A = "+fmt(Rw)+" Ω；總電阻 R<sub>總</sub> = "+fmt(Rt)+" Ω；電流 I = V/R<sub>總</sub> = "+fmt(I)+" A</p>"+
      "<p>V<sub>負載</sub> = "+fmt(Vload)+" V、V<sub>線</sub> = "+fmt(Vw)+" V，相加 = "+fmt(Vload+Vw)+" V＝電源電壓 "+fmt(v)+" V</p>"+
      "<p>P<sub>總</sub> = "+fmt(Pt)+" W、P<sub>負載</sub> = "+fmt(Pload)+" W、P<sub>線</sub> = "+fmt(Pw)+" W，相加 = "+fmt(Pload+Pw)+" W</p>"+
      "<p>傳輸效率 = P<sub>負載</sub>/P<sub>總</sub> = "+pct(Pload/Pt)+"，也等於 R<sub>負載</sub>/R<sub>總</sub> = "+pct(eff)+"</p>"+
      warn+
      "<p>因果：串聯的電流相同，所以功率照電阻比例分配；截面積加倍 R<sub>線</sub> 減半、長度加倍 R<sub>線</sub> 加倍——這就是電線要用銅、電熱絲要用鎳鉻的理由。</p>";
  };
  ['oh-mat','oh-len','oh-area','oh-v','oh-rload'].forEach(x=>on(x,'input',draw));
  draw();
}

// 10 磁場與電磁感應
function induction(){
  if(!$('mg-b'))return;
  const draw=()=>{
    const b=val('mg-b'),len=val('mg-len'),v=val('mg-v'),r=val('mg-r'),theta=val('mg-theta'),dist=val('mg-dist');
    const bEff=b*Math.cos(rad(theta));
    const emf=bEff*len*v,cur=emf/r,force=bEff*cur*len;
    const pMech=force*v,pElec=emf*cur,pJoule=cur*cur*r;
    const dPhi=bEff*len*v,iWire=2*Math.PI*dist*b/MU0;
    let note="";
    if(v===0)note+="<p>v = 0：磁場本身不生電，只有磁通變化才生電——ε、I、F、P 全部為 0。</p>";
    if(theta>=90)note+="<p>θ = 90°：磁場與迴路平行，cos θ = 0，沒有磁通穿過，感應電動勢為 0。</p>";
    $('induction-output').innerHTML=
      "<p>有效磁場 B cos θ = "+fmt(bEff)+" T；磁通變化率 dΦ/dt = BLv cos θ = "+fmt(dPhi)+" Wb/s</p>"+
      "<p>感應電動勢 ε = "+fmt(emf)+" V；感應電流 I = ε/R = "+fmt(cur)+" A；安培阻力 F = BIL = "+fmt(force)+" N</p>"+
      "<p>P<sub>機</sub> = Fv = "+fmt(pMech)+" W、P<sub>電</sub> = εI = "+fmt(pElec)+" W、I²R = "+fmt(pJoule)+" W——三個數字相同，<strong>這就是發電機的能量守恆</strong>。</p>"+
      "<p>B 加倍時 ε 加倍，但阻力 F 變成 4 倍（F ∝ B²）；R 變大時 I 與 F 同時變小，開路時沒有電流也就沒有阻力，推起來最輕。</p>"+
      "<p>若這個磁場要靠一根長直導線在 r = "+fmt(dist,2)+" m 處產生，需要 I<sub>線</sub> = 2πrB/μ<sub>0</sub> = "+fmt(iWire)+" A——所以沒有人這樣做，實務上一律用鐵芯或永久磁鐵。</p>"+
      note+
      "<p>因果：阻力來自感應電流自己造出的磁場，這就是冷次定律；你推得越用力，發出的電越多，付出的機械功也越多。</p>";
  };
  ['mg-b','mg-len','mg-v','mg-r','mg-theta','mg-dist'].forEach(x=>on(x,'input',draw));
  draw();
}

// 11 馬克士威與電磁波
function emwave(){
  if(!$('em-logf'))return;
  const band=f=>{
    if(f<3e9)return "無線電";
    if(f<3e11)return "微波";
    if(f<4e14)return "紅外";
    if(f<7.5e14)return "可見光";
    if(f<3e16)return "紫外";
    if(f<3e19)return "X 射線";
    return "伽馬射線";
  };
  const draw=()=>{
    const logf=val('em-logf'),er=val('em-er'),mur=val('em-mur'),e0=val('em-e0');
    const f=Math.pow(10,logf),n=Math.sqrt(er*mur),v=C_LIGHT/n,lam=v/f;
    const eta=ETA0*Math.sqrt(mur/er),b0=e0/v,sAvg=e0*e0/(2*eta);
    const ephJ=H_PLANCK*f,ephEv=ephJ/E_CHARGE;
    let note="";
    if(mur>=10)note+="<p>μ<sub>r</sub> 這麼大是鐵芯裡的情形，此時波阻抗遠大於真空值；實務上高頻鐵芯損耗很大，不會這樣用。</p>";
    $('emwave-output').innerHTML=
      "<p>頻率 f = "+auto(f)+" Hz ＝ "+engFreq(f)+"；折射率 n = √(ε<sub>r</sub>μ<sub>r</sub>) = "+fmt(n)+"</p>"+
      "<p>波速 v = c/n = "+auto(v)+" m/s；波長 λ = v/f = "+auto(lam)+" m；四分之一波長 λ/4 = "+auto(lam/4)+" m</p>"+
      "<p>波阻抗 η = η<sub>0</sub>√(μ<sub>r</sub>/ε<sub>r</sub>) = "+fmt(eta)+" Ω；磁場振幅 B<sub>0</sub> = E<sub>0</sub>/v = "+fmtExp(b0)+" T</p>"+
      "<p>檢查：E<sub>0</sub>/B<sub>0</sub> = "+auto(e0/b0)+" m/s，與 v = "+auto(v)+" m/s 相同。</p>"+
      "<p>平均能流 S<sub>avg</sub> = E<sub>0</sub>²/(2η) = "+fmtExp(sAvg)+" W/m²（E<sub>0</sub> 加倍時變 4 倍）</p>"+
      "<p>單顆光子能量 hf = "+fmtExp(ephJ)+" J = "+fmtExp(ephEv)+" eV</p>"+
      "<p>頻段："+band(f)+"</p>"+
      note+
      "<p>因果：介質讓波變慢，頻率不變所以波長變短——這就是印刷電路板走線長度要換算的原因。</p>";
  };
  ['em-logf','em-er','em-mur','em-e0'].forEach(x=>on(x,'input',draw));
  draw();
}

// 12 波動與駐波
function standing(){
  if(!$('wv-len'))return;
  const draw=()=>{
    const len=val('wv-len'),tension=val('wv-tension'),muGram=val('wv-mu'),n=val('wv-n'),xr=val('wv-x');
    const mu=muGram*1e-3;
    const v=Math.sqrt(tension/mu),lam=2*len/n,f=n*v/(2*len);
    const k=2*Math.PI/lam,shape=Math.sin(n*Math.PI*xr);
    const nodes=n+1,antinodes=n,period=1/f,omega=2*Math.PI*f;
    let judge="";
    if(Math.abs(shape)<=1e-9)judge="<strong>節點</strong>（振幅恆為 0，這一點永遠不動）";
    else if(Math.abs(shape)>=1-1e-9)judge="<strong>波腹</strong>（振幅最大）";
    else judge="介於兩者之間，相對振幅 "+pct(Math.abs(shape));
    $('standing-output').innerHTML=
      "<p>波速 v = √(T/μ) = "+fmt(v)+" m/s（μ = "+fmt(muGram,1)+" g/m = "+auto(mu)+" kg/m）</p>"+
      "<p>第 n = "+fmt(n,0)+" 諧波：λ<sub>n</sub> = 2L/n = "+fmt(lam)+" m；f<sub>n</sub> = nv/(2L) = "+fmt(f)+" Hz；ω = "+fmt(omega)+" rad/s；週期 T = "+fmt(period)+" s；波數 k = "+fmt(k)+" rad/m</p>"+
      "<p>檢查 f × λ = "+fmt(f*lam)+" m/s，與 v = "+fmt(v)+" m/s 相同。基頻 f<sub>1</sub> = "+fmt(v/(2*len))+" Hz，f<sub>n</sub> = n·f<sub>1</sub>。</p>"+
      "<p>節點數 "+fmt(nodes,0)+" 個（含兩端）、波腹數 "+fmt(antinodes,0)+" 個</p>"+
      "<p>觀察位置 x/L = "+fmt(xr,2)+"：sin(nπx/L) = "+fmt(shape)+" → "+judge+"</p>"+
      "<p>張力變 4 倍時 v 只變 2 倍、線密度變 4 倍時 v 減半——因為 v = √(T/μ)，兩者都在根號裡。</p>"+
      "<p>因果：兩端固定強迫 sin(kL) = 0，所以只有整數倍的頻率活得下來——第 15 章的能階量子化用的是同一個邏輯。</p>";
  };
  ['wv-len','wv-tension','wv-mu','wv-n','wv-x'].forEach(x=>on(x,'input',draw));
  draw();
}

// 13 反射折射與都卜勒
// 註：BUILD-SPEC 第 7.2 節指定的函式名 `interface` 是 JavaScript 嚴格模式的保留字
// （"use strict" 下 `function interface(){}` 直接是 SyntaxError），故改名為 interfaceWave。
// 守衛 id（if-mode）、output id（interface-output）與監聽清單全部維持原契約，HTML 完全不受影響。
function interfaceWave(){
  if(!$('if-mode'))return;
  const draw=()=>{
    const mode=pick('if-mode');
    const z1=val('if-z1'),z2=val('if-z2');
    const vsrc=val('if-vsrc'),vobs=val('if-vobs'),f0=val('if-f0'),vwave=val('if-vwave');
    const logi=val('if-logi');
    let html="";
    if(mode==="impedance"){
      const gam=(z2-z1)/(z2+z1),pr=gam*gam,pt=1-pr;
      if(Math.abs(gam)<=1e-12){
        html="<p><strong>完全匹配</strong>：Z<sub>1</sub> = Z<sub>2</sub> = "+fmt(z1,0)+" Ω，Γ = 0，沒有反射，功率 100 % 透射，VSWR = 1.000000，回波損耗無限大（沒有回波可量）。</p>";
      }else{
        const vswr=(1+Math.abs(gam))/(1-Math.abs(gam)),rl=-20*Math.log10(Math.abs(gam));
        html="<p>反射係數 Γ = (Z<sub>2</sub> − Z<sub>1</sub>)/(Z<sub>2</sub> + Z<sub>1</sub>) = "+fmt(gam)+"（"+(gam>0?"反射波同相":"反射波反相，相位翻轉 180°")+"）</p>"+
          "<p>反射功率比 |Γ|² = "+pct(pr)+"；透射功率比 1 − |Γ|² = "+pct(pt)+"；相加 = "+pct(pr+pt)+"</p>"+
          "<p>駐波比 VSWR = (1 + |Γ|)/(1 − |Γ|) = "+fmt(vswr)+"；回波損耗 RL = −20 log|Γ| = "+fmt(rl)+" dB</p>"+
          "<p>Γ 是<strong>振幅</strong>比，|Γ|² 才是<strong>功率</strong>比：VSWR 1.5 聽起來很大，其實只反射 4 % 功率。</p>";
      }
      html+="<p>阻抗差越大反射越多，能量被彈回源頭——這就是天線與傳輸線都做成 50 Ω 的理由。</p>";
    }else if(mode==="doppler"){
      if(vsrc>=vwave){
        html="<p>波源速度 v<sub>源</sub> = "+fmt(vsrc,0)+" m/s 已達到或超過波速 v = "+fmt(vwave,0)+" m/s，<strong>這個公式失效</strong>（進入音障與震波的範圍，波前疊在一起形成馬赫錐）。把波源速度調小再看。</p>";
      }else{
        const fp=f0*(vwave+vobs)/(vwave-vsrc);
        html="<p>觀察到的頻率 f′ = f<sub>0</sub>(v + v<sub>觀</sub>)/(v − v<sub>源</sub>) = "+fmt(fp)+" Hz</p>"+
          "<p>頻移量 Δf = "+fmtSigned(fp-f0)+" Hz；相對接近速度 = "+fmt(vsrc+vobs)+" m/s</p>"+
          "<p>波源移動壓縮的是<strong>波長</strong>，觀察者移動改變的是<strong>相對波速</strong>——兩者機制不同，所以同樣 30 m/s 的接近速度答案不一樣（1096.774194 Hz 對 1088.235294 Hz）。</p>";
        if(vsrc===0&&vobs===0)html+="<p>兩邊都靜止，f′ = f<sub>0</sub>，沒有頻移。</p>";
        if(vwave+vobs<=0)html+="<p><strong>接收頻率為零</strong>：觀察者正以波速（或更快）遠離，波前永遠追不上他，一個完整週期都送不到耳朵裡，所以 f′ = 0 Hz。這不是公式失效，是「跑得和波一樣快就看不到波在振動」的極限情形——與 v<sub>源</sub> ≥ v 那種波前疊出震波的失效機制正好相反。</p>";
      }
    }else{
      const I=Math.pow(10,logi),spl=10*Math.log10(I/I0_SOUND);
      html="<p>聲強 I = 10<sup>"+fmt(logi,1)+"</sup> = "+fmtExp(I)+" W/m²（參考值 I<sub>0</sub> = 10<sup>−12</sup> W/m²）</p>"+
        "<p>聲強級 L = 10 log(I/I<sub>0</sub>) = "+fmt(spl)+" dB</p>"+
        "<p>強度再大 10 倍是 +10 dB、大 2 倍是 +3.010300 dB；log<sub>10</sub>I 每 +1，L 就剛好 +10 dB。</p>"+
        "<p>聲學與功率用 10 log，電壓與電流要用 20 log——同一個 dB 數字在兩種脈絡下代表不同的比值。</p>";
    }
    $('interface-output').innerHTML=html;
  };
  ['if-mode','if-z1','if-z2','if-vsrc','if-vobs','if-f0','if-vwave','if-logi'].forEach(x=>on(x,'input',draw));
  draw();
}

// 14 幾何光學與波動光學
function optics(){
  if(!$('op-mode'))return;
  const draw=()=>{
    const mode=pick('op-mode');
    const f=val('op-f'),so=val('op-so'),n1=val('op-n1'),n2=val('op-n2'),theta=val('op-theta');
    const lambda=val('op-lambda'),d=val('op-d'),bigD=val('op-bigd');
    let html="";
    if(mode==="lens"){
      if(f===0){
        html="<p>焦距為零沒有物理意義（1/f 會發散），請把 f 調離 0。</p>";
      }else{
        const inv=1/f-1/so;
        if(Math.abs(inv)<1e-12){
          html="<p><strong>物在焦點上</strong>（s<sub>o</sub> = f = "+fmt(f,0)+" cm）：出射是平行光，像在無窮遠，沒有有限的像距可印。這正是準直器的工作點。</p>";
        }else{
          const si=1/inv,M=-si/so;
          let kind="";
          if(f<0)kind="凹透鏡：永遠成<strong>正立縮小虛像</strong>（s<sub>i</sub> &lt; 0），像和物在同一側。";
          else if(so>2*f)kind="s<sub>o</sub> &gt; 2f：<strong>倒立縮小實像</strong>——這是相機與人眼的工作區。";
          else if(Math.abs(so-2*f)<=1e-9)kind="s<sub>o</sub> = 2f：<strong>等大倒立實像</strong>，M = −1。";
          else if(so>f)kind="f &lt; s<sub>o</sub> &lt; 2f：<strong>倒立放大實像</strong>——這是投影機的工作區。";
          else kind="s<sub>o</sub> &lt; f：<strong>正立放大虛像</strong>（s<sub>i</sub> &lt; 0）——這是放大鏡。";
          html="<p>像距 s<sub>i</sub> = "+fmt(si)+" cm（正值＝實像在另一側，負值＝虛像與物同側）</p>"+
            "<p>橫向放大率 M = −s<sub>i</sub>/s<sub>o</sub> = "+fmt(M)+"（負號＝倒立，|M| &gt; 1 ＝放大）</p>"+
            "<p>成像判讀："+kind+"</p>";
        }
      }
      html+="<p>適用範圍：這是<strong>幾何光學</strong>的薄透鏡近似，只有在孔徑遠大於波長、且透鏡厚度可忽略時才準。</p>";
    }else if(mode==="snell"){
      const sinT2=n1*Math.sin(rad(theta))/n2;
      const tir=sinT2>1;
      html="<p>sin θ<sub>2</sub> = n<sub>1</sub> sin θ<sub>1</sub>/n<sub>2</sub> = "+fmt(sinT2)+"</p>";
      if(tir){
        html+="<p><strong>全反射</strong>：沒有折射光，能量全部反射回介質 1。這就是光纖鎖光的機制——纖芯折射率比包層高，超過臨界角的光一路被彈回去。</p>";
      }else{
        const t2=deg(Math.asin(clamp(sinT2,-1,1)));
        html+="<p>折射角 θ<sub>2</sub> = "+fmt(t2)+"°"+(theta===0?"（θ<sub>1</sub> = 0，光直穿不偏折）":"")+"</p>";
        if(Math.abs(n1-n2)<=1e-12)html+="<p>兩邊折射率相同，光直穿不偏折。</p>";
      }
      if(n1>n2){
        html+="<p>臨界角 θ<sub>c</sub> = arcsin(n<sub>2</sub>/n<sub>1</sub>) = "+fmt(deg(Math.asin(n2/n1)))+"°：入射角超過它就全反射。</p>";
      }else{
        html+="<p>從光疏到光密（n<sub>1</sub> ≤ n<sub>2</sub>）不會全反射，臨界角不存在。</p>";
      }
      html+="<p>適用範圍：<strong>幾何光學</strong>，把光當射線處理；界面尺度遠大於波長時才成立。</p>";
    }else{
      const dy=(lambda*1e-9)*bigD/(d*1e-6);
      const ang1=deg((lambda*1e-9)/(d*1e-6));
      html="<p>亮紋間距 Δy = λD/d = "+fmtExp(dy)+" m = "+fmt(dy*1000)+" mm</p>"+
        "<p>第一亮紋角度 θ<sub>1</sub> ≈ λ/d = "+fmtExp((lambda*1e-9)/(d*1e-6))+" rad = "+fmt(ang1)+"°</p>"+
        "<p>Δy 與 λ、D 成正比、與 d 成反比：把 d 加倍 Δy 剛好減半，把 d 縮小條紋就散開——這正是繞射越強的意思。</p>"+
        "<p>這裡的 d 是<strong>兩縫間距</strong>，不是縫寬；縫寬決定的是整體包絡（單縫繞射）。</p>"+
        "<p>適用範圍：<strong>波動光學</strong>，孔徑接近波長時必須用；幾何光學是它在 λ ≪ 孔徑時的極限。</p>";
    }
    $('optics-output').innerHTML=html;
  };
  ['op-mode','op-f','op-so','op-n1','op-n2','op-theta','op-lambda','op-d','op-bigd'].forEach(x=>on(x,'input',draw));
  draw();
}

// 15 量子與半導體
function photon(){
  if(!$('qm-mode'))return;
  const draw=()=>{
    const mode=pick('qm-mode');
    const lambda=val('qm-lambda'),work=val('qm-work'),volt=val('qm-volt'),eg=val('qm-eg');
    const ePhoton=HC_EVNM/lambda;
    let html="";
    if(mode==="photo"){
      const kMax=ePhoton-work,lamCut=HC_EVNM/work;
      html="<p>光子能量 E = hc/λ = "+fmt(ePhoton)+" eV = "+fmtExp(ePhoton*EV_J)+" J</p>";
      if(kMax<0){
        html+="<p><strong>光子能量不足</strong>（E = "+fmt(ePhoton)+" eV &lt; W = "+fmt(work,2)+" eV）：無論光強多大都打不出電子——這正是光的粒子性證據，光強只決定光子<strong>數量</strong>，不決定每顆的能量。</p>";
      }else{
        html+="<p>最大動能 K<sub>max</sub> = hf − W = "+fmt(kMax)+" eV；截止電壓 V<sub>stop</sub> = K<sub>max</sub>/e = "+fmt(kMax)+" V</p>";
      }
      html+="<p>截止波長 λ<sub>max</sub> = hc/W = "+fmt(lamCut)+" nm：比這更長的光照多強都打不出電子。</p>"+
        "<p>波長減半時光子能量剛好加倍（E ∝ 1/λ）。</p>";
    }else if(mode==="matter"){
      const lamDb=1.226426/Math.sqrt(volt);
      const pElec=H_PLANCK/(lamDb*1e-9);
      html="<p>加速電壓 V = "+fmt(volt,0)+" V → 動量 p = √(2m<sub>e</sub>eV) = "+fmtExp(pElec)+" kg·m/s</p>"+
        "<p>德布羅意波長 λ = h/p ≈ 1.226426/√V = "+fmt(lamDb)+" nm = "+fmt(lamDb*1000)+" pm</p>"+
        "<p>與矽的晶格常數 0.543 nm 相比："+(lamDb<0.543?"比晶格小":"與晶格同量級或更大")+"——所以電子會被晶體繞射，這就是電子顯微鏡與 LEED 的原理。</p>"+
        "<p>V 變 4 倍時 λ 剛好減半（λ ∝ 1/√V）。這是<strong>非相對論</strong>近似，超過約 10 kV 就會開始失準。</p>";
    }else{
      const lamGap=HC_EVNM/eg,absorbs=ePhoton>=eg;
      let cls="";
      if(eg<=0.1)cls="能隙這麼小，接近<strong>導體</strong>：室溫熱激發就足以讓大量電子跨過去。";
      else if(eg<3)cls="這是<strong>半導體</strong>的範圍（矽 1.12 eV）：熱激發與摻雜能有效控制載子數。";
      else cls="能隙 ≥ 3 eV 屬於<strong>絕緣體</strong>：常溫下幾乎沒有電子跨得過去。";
      html="<p>能隙 E<sub>g</sub> = "+fmt(eg,2)+" eV → 吸收邊波長 λ<sub>g</sub> = hc/E<sub>g</sub> = "+fmt(lamGap)+" nm</p>"+
        "<p>目前光子能量 E = "+fmt(ePhoton)+" eV（λ = "+fmt(lambda,0)+" nm）</p>"+
        "<p>"+(absorbs?"E ≥ E<sub>g</sub>：<strong>會被吸收</strong>，可以產生電子—電洞對。":"這個波長穿透，材料對它是<strong>透明的</strong>——光子能量不夠，跨不過能隙。")+"</p>"+
        "<p>材料判讀："+cls+"</p>";
      if(lamGap>2000)html+="<p>吸收邊已落在遠紅外，超出光纖通訊波段（1310 nm 與 1550 nm）。</p>";
      html+="<p>矽的 λ<sub>g</sub> ≈ 1107 nm，所以矽看得見可見光卻看不見 1550 nm——光纖接收端要改用能隙更小的 InGaAs。</p>";
    }
    $('photon-output').innerHTML=html+
      "<p>換算常數 hc = 1239.841984 eV·nm：把波長（nm）代進去就直接得到能量（eV），「波長乘能量等於 1240」是本章的口訣。</p>";
  };
  ['qm-mode','qm-lambda','qm-work','qm-volt','qm-eg'].forEach(x=>on(x,'input',draw));
  draw();
}

// 5. 名詞與概念字典
function dictionary(){
  if(!$('term-search'))return;
  const draw=()=>{
    const q=String($('term-search').value||"").toLocaleLowerCase('zh-Hant').trim();
    const cards=document.querySelectorAll('.term-card');
    let shown=0;
    for(let i=0;i<cards.length;i++){
      const card=cards[i];
      const hay=(card.textContent+" "+(card.dataset.search||"")).toLocaleLowerCase('zh-Hant');
      const hit=(q==="")||hay.indexOf(q)>=0;
      card.hidden=!hit;
      if(hit)shown++;
    }
    $('term-count').textContent="顯示 "+shown+" 個條目";
  };
  ['term-search'].forEach(x=>on(x,'input',draw));
  draw();
}

// 6. 自我檢核（答案的單一事實來源）
function selfcheck(){
  if(!$('quiz-reset'))return;
  const Q={
    'q00-1':{t:'sel',ans:'b',why:'馬達的轉矩來自載流導線在磁場中受的勞侖茲力 F = BIL，再乘上力臂變成力矩。',fix:'庫倫定律講的是靜止電荷之間的力，高斯定律講電通量，白努利講流體，都不是轉矩的來源。',ref:'10-磁場與電磁感應.html',refName:'10 磁場與電磁感應'},
    'q00-2':{t:'sel',ans:'b',why:'纖芯折射率比包層高，入射角超過臨界角 θc = arcsin(n2/n1) 的光會全反射，一路被鎖在纖芯裡。',fix:'干涉、繞射、偏振都是光的性質，但把光「關住」的機制是全反射。',ref:'14-幾何光學與波動光學.html',refName:'14 幾何光學與波動光學'},
    'q01-1':{t:'num',ans:40.816327,tol:0.05,unit:'m',why:'R = v0² sin(2θ)/g = 400 × sin 90°/9.8 = 40.816327 m。',fix:'常見錯誤是忘了 sin(2θ) 而寫成 sin θ，或用 g = 10 概算。',ref:'01-運動學.html',refName:'01 運動學'},
    'q01-2':{t:'num',ans:10.204082,tol:0.02,unit:'m',why:'H = v0y²/(2g) = 14.142136²/19.6 = 10.204082 m。',fix:'要用垂直分量 v0y = v0 sin θ，不是整個 v0。',ref:'01-運動學.html',refName:'01 運動學'},
    'q01-3':{t:'sel',ans:'b',why:'水平方向沒有力，vx 全程不變；最高點只是 vy = 0 的那一刻，所以只剩水平分量。',fix:'「最高點速度為零」是把拋體誤當成垂直上拋；兩個方向互不干擾。',ref:'01-運動學.html',refName:'01 運動學'},
    'q02-1':{t:'num',ans:2.353885,tol:0.01,unit:'m/s²',why:'a = g(sin 30° − 0.3 cos 30°) = 9.8 × (0.5 − 0.3 × 0.866025) = 2.353885 m/s²。',fix:'摩擦力要用 μk N = μk mg cos θ，不是 μk mg。',ref:'02-牛頓運動定律.html',refName:'02 牛頓運動定律'},
    'q02-2':{t:'num',ans:21.801409,tol:0.05,unit:'度',why:'θc = arctan(μs) = arctan(0.40) = 21.801409°，質量與 g 全部消掉。',fix:'常見錯誤是寫成 arcsin(μs) 或忘了換成度。',ref:'02-牛頓運動定律.html',refName:'02 牛頓運動定律'},
    'q02-3':{t:'sel',ans:'c',why:'ma = mg sin θ − μk mg cos θ，兩邊除以 m 之後 m 就消失了，所以加速度與質量無關。',fix:'「重的東西滑得快」是日常直覺，實際上重力分量與慣性同比例增加，互相抵消。',ref:'02-牛頓運動定律.html',refName:'02 牛頓運動定律'},
    'q03-1':{t:'num',ans:8.854377,tol:0.01,unit:'m/s',why:'v = √(2gΔh) = √(2 × 9.8 × 4) = √78.4 = 8.854377 m/s，與質量無關。',fix:'不必解運動方程，也不必知道軌道形狀——只有高度差有意義。',ref:'03-功與能量.html',refName:'03 功與能量'},
    'q03-2':{t:'num',ans:98,tol:0.1,unit:'J',why:'E = (1/2)mv0² + mgh0 = 0 + 2 × 9.8 × 5 = 98.000000 J。',fix:'起始靜止所以動能為 0，全部都是位能。',ref:'03-功與能量.html',refName:'03 功與能量'},
    'q03-3':{t:'sel',ans:'c',why:'(1/2)mv² = mgΔh 兩邊消掉 m，所以底端速率與質量無關。',fix:'質量變大時位能與動能同比例變大，比值不變。',ref:'03-功與能量.html',refName:'03 功與能量'},
    'q04-1':{t:'num',ans:-1.8,tol:0.01,unit:'m/s',why:'v1′ = (p + m2·e(v2 − v1))/M = (3 + 3 × (−4))/5 = −1.800000 m/s，負號代表被彈回去。',fix:'總動量 p = 2 × 3 + 3 × (−1) = 3 kg·m/s，別把 v2 的負號漏掉。',ref:'04-動量與碰撞.html',refName:'04 動量與碰撞'},
    'q04-2':{t:'num',ans:0.6,tol:0.01,unit:'m/s',why:'e = 0 時兩者黏在一起，共同速度就是質心速度 p/M = 3/5 = 0.600000 m/s。',fix:'完全非彈性碰撞仍然守動量，只是動能損失最大（這裡損失 9.600000 J）。',ref:'04-動量與碰撞.html',refName:'04 動量與碰撞'},
    'q04-3':{t:'sel',ans:'b',why:'碰撞的內力成對抵消，所以動量一定守恆；動能有一部分變成熱與形變，不守恆。',fix:'「非彈性」不是「沒有彈性」，是動能有損失。',ref:'04-動量與碰撞.html',refName:'04 動量與碰撞'},
    'q05-1':{t:'num',ans:0.25,tol:0.001,unit:'kg·m²',why:'實心圓盤 I = (1/2)MR² = 0.5 × 2 × 0.25 = 0.250000 kg·m²。',fix:'薄圓環才是 MR²，實心圓盤要乘 1/2。',ref:'05-轉動與角動量.html',refName:'05 轉動與角動量'},
    'q05-2':{t:'num',ans:40,tol:0.1,unit:'rad/s',why:'角動量守恆 Iω = I′ω′，半徑減半使 I 變 1/4，所以 ω′ = ω/k² = 10/0.25 = 40.000000 rad/s。',fix:'I 正比於 R²，所以尺寸倍率要平方，不是線性。',ref:'05-轉動與角動量.html',refName:'05 轉動與角動量'},
    'q06-1':{t:'num',ans:10,tol:0.01,unit:'rad/s',why:'ω0 = √(k/m) = √(100/1) = 10.000000 rad/s。',fix:'ω0 的單位是 rad/s，換成 Hz 要再除以 2π（等於 1.591549 Hz）。',ref:'06-簡諧運動與共振.html',refName:'06 簡諧運動與共振'},
    'q06-2':{t:'num',ans:0.1,tol:0.005,unit:'無單位',why:'ζ = c/(2√(km)) = 2/(2√100) = 2/20 = 0.100000，屬於欠阻尼。',fix:'阻尼比 ζ 無單位，阻尼係數 c 的單位是 N·s/m，兩者差一個 2√(km)。',ref:'06-簡諧運動與共振.html',refName:'06 簡諧運動與共振'},
    'q06-3':{t:'sel',ans:'c',why:'ω = ω0 時 k − mω² = 0，只剩 X = F0/(cω0)，除以靜態位移 F0/k 得放大率 k/(cω0) = 1/(2ζ)。',fix:'放大率由阻尼決定，與驅動力大小無關：F0 加倍時靜態位移與共振振幅同時加倍，比值不變。',ref:'06-簡諧運動與共振.html',refName:'06 簡諧運動與共振'},
    'q07-1':{t:'num',ans:50,tol:0.5,unit:'%',why:'η = 1 − TC/TH = 1 − 300/600 = 0.5 = 50.000000 %。',fix:'溫度一定要用絕對溫度 K，攝氏要先 +273.15。',ref:'07-熱學與流體.html',refName:'07 熱學與流體'},
    'q07-2':{t:'sel',ans:'b',why:'vrms = √(4kB T R B)，頻寬在根號裡，所以 B 變 4 倍時電壓只變 2 倍（功率才變 4 倍）。',fix:'把「功率正比於 B」與「電壓正比於 B」搞混，是這題最常見的失分點。',ref:'07-熱學與流體.html',refName:'07 熱學與流體'},
    'q08-1':{t:'num',ans:1.497925,tol:0.01,unit:'µN',why:'F = ke|q1q2|/d² = 8.9875517874e9 × 15e−18/0.09 = 1.497925 µN，異號所以互相吸引。',fix:'nC 要換成 1e−9 C，距離用公尺；答案的量級是微牛頓。',ref:'08-靜電學.html',refName:'08 靜電學'},
    'q08-2':{t:'num',ans:119.834024,tol:0.5,unit:'V',why:'電位是純量直接相加：299.585060 + (−179.751036) = 119.834024 V。',fix:'電位不看方向，別像電場那樣做向量分解。',ref:'08-靜電學.html',refName:'08 靜電學'},
    'q08-3':{t:'sel',ans:'b',why:'E = −∇V：電場指向電位下降最快的方向，負號不能省。',fix:'把負號漏掉會讓電場方向整個反過來。',ref:'08-靜電學.html',refName:'08 靜電學'},
    'q09-1':{t:'num',ans:0.168,tol:0.001,unit:'Ω',why:'R = ρℓ/A = 1.68e−8 × 10/1e−6 = 0.168000 Ω。',fix:'1 mm² = 1e−6 m²，這個換算漏掉會差 10<sup>6</sup> 倍。',ref:'09-電流與電路基礎.html',refName:'09 電流與電路基礎'},
    'q09-2':{t:'num',ans:1.180173,tol:0.005,unit:'A',why:'I = V/(Rload + Rw) = 12/10.168 = 1.180173 A。',fix:'導線與負載是串聯，電阻要相加後再除。',ref:'09-電流與電路基礎.html',refName:'09 電流與電路基礎'},
    'q10-1':{t:'num',ans:0.3,tol:0.005,unit:'V',why:'ε = BLv = 0.5 × 0.2 × 3 = 0.300000 V。',fix:'θ 不為 0 時還要乘 cos θ；本題 θ = 0 所以 cos θ = 1。',ref:'10-磁場與電磁感應.html',refName:'10 磁場與電磁感應'},
    'q10-2':{t:'num',ans:0.045,tol:0.001,unit:'W',why:'I = 0.3/2 = 0.15 A、F = BIL = 0.015 N、P機 = Fv = 0.045000 W，與 εI 和 I²R 完全相同。',fix:'機械功率與電功率是同一個數字，不是兩件事——這正是發電機的能量守恆。',ref:'10-磁場與電磁感應.html',refName:'10 磁場與電磁感應'},
    'q10-3':{t:'sel',ans:'b',why:'負號代表感應電流會製造反抗磁通變化的磁場，這是能量守恆的直接後果。',fix:'如果負號反過來，裝置會自己加速並無中生有地產生能量。',ref:'10-磁場與電磁感應.html',refName:'10 磁場與電磁感應'},
    'q11-1':{t:'num',ans:0.299792,tol:0.001,unit:'m',why:'λ = c/f = 299792458/1e9 = 0.299792 m，約 30 cm。',fix:'四分之一波長天線約 7.5 cm，這就是 Wi-Fi 天線那麼短的原因。',ref:'11-馬克士威與電磁波.html',refName:'11 馬克士威與電磁波'},
    'q11-2':{t:'num',ans:376.730314,tol:0.5,unit:'Ω',why:'η0 = √(μ0/ε0) = μ0c = 376.730314 Ω。',fix:'它不是電阻（真空裡沒有電流），只是 E 與 H 的比值。',ref:'11-馬克士威與電磁波.html',refName:'11 馬克士威與電磁波'},
    'q11-3':{t:'sel',ans:'b',why:'μ0 與 ε0 都是從靜電、靜磁實驗量出來的，卻算出光速——這說明光就是電磁波。',fix:'電磁波是橫波、不需要介質，「以太」在 19 世紀末已被否定。',ref:'11-馬克士威與電磁波.html',refName:'11 馬克士威與電磁波'},
    'q12-1':{t:'num',ans:316.227766,tol:0.5,unit:'m/s',why:'v = √(T/μ) = √(100/0.001) = 316.227766 m/s。',fix:'μ = 1 g/m = 0.001 kg/m，單位沒換會差 √1000 倍。',ref:'12-波動與駐波.html',refName:'12 波動與駐波'},
    'q12-2':{t:'num',ans:158.113883,tol:0.5,unit:'Hz',why:'f1 = v/(2L) = 316.227766/2 = 158.113883 Hz。',fix:'基頻的波長是 2L 不是 L，弦的兩端都必須是節點。',ref:'12-波動與駐波.html',refName:'12 波動與駐波'},
    'q12-3':{t:'sel',ans:'b',why:'n = 2 時 sin(2π × 0.5) = 0，正中央是節點（n = 1 時同一點才是波腹）。',fix:'節點與波腹的位置隨 n 改變，不能只記「中間是波腹」。',ref:'12-波動與駐波.html',refName:'12 波動與駐波'},
    'q13-1':{t:'num',ans:0.2,tol:0.005,unit:'無單位',why:'Γ = (Z2 − Z1)/(Z2 + Z1) = 25/125 = 0.200000，反射功率只有 |Γ|² = 4 %。',fix:'Γ 是振幅比，|Γ|² 才是功率比，兩者常被混用。',ref:'13-反射折射與都卜勒.html',refName:'13 反射折射與都卜勒'},
    'q13-2':{t:'num',ans:1.5,tol:0.01,unit:'無單位',why:'VSWR = (1 + |Γ|)/(1 − |Γ|) = 1.2/0.8 = 1.500000。',fix:'VSWR 1.5 聽起來很大，其實只反射 4 % 功率，回波損耗 13.979400 dB。',ref:'13-反射折射與都卜勒.html',refName:'13 反射折射與都卜勒'},
    'q13-3':{t:'num',ans:1096.774194,tol:1,unit:'Hz',why:'f′ = f0 v/(v − v源) = 1000 × 340/310 = 1096.774194 Hz。',fix:'波源移動壓縮的是波長，公式的速度放在分母；觀察者移動的公式在分子，兩者不對稱。',ref:'13-反射折射與都卜勒.html',refName:'13 反射折射與都卜勒'},
    'q14-1':{t:'num',ans:15,tol:0.1,unit:'cm',why:'1/si = 1/10 − 1/30 = 1/15，所以 si = 15.000000 cm，M = −0.5（倒立縮小實像）。',fix:'薄透鏡公式是 1/f = 1/so + 1/si，移項時容易把倒數關係算錯。',ref:'14-幾何光學與波動光學.html',refName:'14 幾何光學與波動光學'},
    'q14-2':{t:'num',ans:41.810315,tol:0.1,unit:'度',why:'θc = arcsin(n2/n1) = arcsin(1/1.5) = 41.810315°。',fix:'只有從光密到光疏（n1 > n2）才有臨界角，反過來永遠不會全反射。',ref:'14-幾何光學與波動光學.html',refName:'14 幾何光學與波動光學'},
    'q14-3':{t:'num',ans:5,tol:0.05,unit:'mm',why:'Δy = λD/d = 500e−9 × 1/100e−6 = 5.000000 mm。',fix:'d 是兩縫間距（µm 要換成 m），不是縫寬。',ref:'14-幾何光學與波動光學.html',refName:'14 幾何光學與波動光學'},
    'q15-1':{t:'num',ans:3.099605,tol:0.01,unit:'eV',why:'E = hc/λ = 1239.841984/400 = 3.099605 eV，「波長乘能量等於 1240」的口訣就是這樣用。',fix:'λ 要用 nm 代入才配 hc = 1239.841984 eV·nm。',ref:'15-量子與半導體.html',refName:'15 量子與半導體'},
    'q15-2':{t:'num',ans:539.061732,tol:1,unit:'nm',why:'λmax = hc/W = 1239.841984/2.30 = 539.061732 nm，比這更長的光照多強都打不出電子。',fix:'截止是對<strong>波長上限</strong>而言，波長越長能量越低。',ref:'15-量子與半導體.html',refName:'15 量子與半導體'},
    'q15-3':{t:'sel',ans:'b',why:'截止電壓只跟頻率有關、與光強無關，說明能量是以 hf 為單位一份一份交出的。',fix:'光強只決定光子數量（光電流大小），不改變每顆光子的能量。',ref:'15-量子與半導體.html',refName:'15 量子與半導體'}
  };
  const ids=Object.keys(Q);
  const progress=()=>{
    const n=ids.filter(i=>$(i)&&String($(i).value).trim()!=='').length;
    $('quiz-progress').textContent="已作答 "+n+" / "+ids.length+" 題（僅供參考，不影響瀏覽）";
  };
  const check=id=>{
    const q=Q[id],node=$(id),out=$(id+'-output');
    if(!q||!node||!out)return;
    const raw=String(node.value).trim();
    const link="<p><a href=\""+q.ref+"\">回到 "+q.refName+"</a></p>";
    if(raw===""){
      out.innerHTML="<p>"+(q.t==='sel'?"先選一個選項，再按「對答案」。":"先填一個數字，再按「對答案」。")+"</p>";
      progress();
      return;
    }
    let ok=false,shown="";
    if(q.t==='sel'){
      ok=(raw===q.ans);
      shown="選項 "+q.ans;
    }else{
      const v=Number(raw);
      ok=isFinite(v)&&Math.abs(v-q.ans)<=q.tol;
      shown=fmt(q.ans)+(q.unit==="無單位"?"（無單位）":" "+q.unit);
    }
    if(ok)out.innerHTML="<p><strong>答對</strong>："+q.why+"</p>"+link;
    else out.innerHTML="<p><strong>再看一次</strong>：正確答案是 "+shown+"。"+q.fix+"</p><p>"+q.why+"</p>"+link;
    progress();
  };
  ids.forEach(id=>{on(id+'-check','click',()=>check(id));on(id,'input',progress)});
  on('quiz-reset','click',()=>{
    ids.forEach(id=>{
      if($(id))$(id).value='';
      if($(id+'-output'))$(id+'-output').innerHTML='';
    });
    progress();
  });
  progress();
}

// 7. 註冊（只在瀏覽器環境執行）
if(typeof document!=="undefined"){
  [physmap,projectile,incline,energy,collide,rotation,shm,thermal,coulomb,ohmwire,induction,emwave,standing,interfaceWave,optics,photon,dictionary,selfcheck].forEach(f=>f());
}

// 8. 匯出（供 node --check 與人工交叉驗算）
if(typeof module!=="undefined")module.exports={fmt,fmtExp,fmtSigned,pct,engFreq,safeDiv,auto,clamp,rad,deg,G_ACC,C_LIGHT,EPS0,MU0,K_E,ETA0,E_CHARGE,H_PLANCK,HC_EVNM,K_B,M_E,R_GAS,I0_SOUND,P_ATM,RHO_WATER,EV_J};

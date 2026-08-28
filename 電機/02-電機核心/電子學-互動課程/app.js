"use strict";
// 電子學（零基礎互動課）互動邏輯
// 唯一依據：BUILD-SPEC.md 第 4、6、7 節。全部確定性計算，無亂數、無時間相依。

// ---------------------------------------------------------------------------
// 1. helper
// ---------------------------------------------------------------------------
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),fmt=(x,n)=>Number(x).toFixed(n===undefined?6:n);

// ---------------------------------------------------------------------------
// 2. 物理常數（全課唯一來源，不得在別處重寫）
// ---------------------------------------------------------------------------
const VT=0.025851999786435535;   // 熱電壓 kT/q（T = 300 K），單位 V
const QE=1.602176634e-19;        // 基本電荷，單位 C
const NI=1.5e10;                 // 矽的本徵載子濃度（300 K），單位 cm^-3
const MUN=1350;                  // 電子遷移率，單位 cm^2/(V*s)
const MUP=480;                   // 電洞遷移率，單位 cm^2/(V*s)

// ---------------------------------------------------------------------------
// 3. 工具
// ---------------------------------------------------------------------------
const val=id=>{const n=$(id);return n?Number(n.value):0;};
const sel=id=>{const n=$(id);return n?String(n.value):"";};
const par=(a,b)=>(a+b===0)?0:(a*b)/(a+b);
const dbv=x=>20*Math.log10(x);
// 顯示用格式化：負號一律換成 U+2212
const sfmt=(x,n)=>{
  const d=(n===undefined)?6:n,v=Number(x);
  let s=v.toFixed(d);
  const scaled=v*Math.pow(10,d),fl=Math.floor(scaled);
  if(isFinite(scaled)&&(scaled-fl===0.5)){          // 精確平局改用四捨六入五成雙
    const even=(fl%2===0)?fl:(fl+1);
    s=(even/Math.pow(10,d)).toFixed(d);
  }
  return s.charAt(0)==="-"?"−"+s.slice(1):s;
};
// 指數格式：1.000000 × 10<sup>16</sup>
const expFmt=(x,n)=>{
  const d=(n===undefined)?6:n;
  if(!isFinite(x))return "無限大";
  if(x===0)return "0";
  const sign=(x<0)?"−":"";
  let a=Math.abs(x),e=Math.floor(Math.log10(a)),m=a/Math.pow(10,e);
  if(m>=10){m=m/10;e=e+1;}
  if(m<1){m=m*10;e=e-1;}
  const es=(e<0)?("−"+Math.abs(e)):String(e);
  return sign+m.toFixed(d)+" × 10<sup>"+es+"</sup>";
};
// 電阻自動換單位
const ohmFmt=x=>{
  if(!isFinite(x))return "無限大";
  const a=Math.abs(x);
  if(a>=1e6)return sfmt(x/1e6,6)+" MΩ";
  if(a>=1e3)return sfmt(x/1e3,6)+" kΩ";
  return sfmt(x,6)+" Ω";
};
// 純 Ω 顯示（BUILD-SPEC 第 4 節指定「Ω，6 位小數」的欄位一律用它）
const ohms=x=>isFinite(x)?(sfmt(x,6)+" Ω"):"無限大";
// 非有限值守衛：不得讓 NaN／Infinity 進入畫面
const guardInf=(x,n)=>isFinite(x)?sfmt(x,(n===undefined)?6:n):"無法計算（超出模型適用範圍）";
// 頻率自動換單位
const hzFmt=x=>{
  if(!isFinite(x))return "無限大";
  const a=Math.abs(x);
  if(a>=1e6)return sfmt(x/1e6,6)+" MHz";
  if(a>=1e3)return sfmt(x/1e3,6)+" kHz";
  return sfmt(x,6)+" Hz";
};
const say=t=>"<p>"+t+"</p>";
const rows=arr=>"<ul>"+arr.map(x=>"<li>"+x+"</li>").join("")+"</ul>";

// ---------------------------------------------------------------------------
// 4. 每章一個守衛函式
// ---------------------------------------------------------------------------

// 00 非線性與小訊號線性化
function nonlinear(){
  if(!$('nl-v'))return;
  const draw=()=>{
    const VSI=val('nl-v')*1e-3,dVSI=val('nl-dv')*1e-3,IS=Number(sel('nl-is')),R=val('nl-r');
    const I0=IS*(Math.exp(VSI/VT)-1);
    const I1=IS*(Math.exp((VSI+dVSI)/VT)-1);
    const g=(I0+IS)/VT;
    const Ilin=I0+g*dVSI;
    const rd=1/g;
    const IR0=VSI/R,IR1=(VSI+dVSI)/R;
    const growD=(I0>0)?((I1-I0)/I0*100):0;
    const growR=(IR0>0)?((IR1-IR0)/IR0*100):0;
    const errSigned=(I1!==0)?((Ilin-I1)/I1*100):0;
    const errAbs=(I1!==0)?Math.abs(Ilin-I1)/I1:0;
    const dcR=(I0>0)?(VSI/I0):Infinity;
    let judge;
    if(errAbs<0.02){
      judge="<strong>小訊號近似成立</strong>：ΔV 遠小於 V<sub>T</sub> = 25.851999786 mV，曲線在這麼短的一段內幾乎就是它的切線，可以用一個固定電導 g 描述。";
    }else if(errAbs<0.2){
      judge="<strong>開始失真</strong>：切線已經明顯偏離曲線，這時放大器會產生諧波失真。";
    }else{
      judge="<strong>大訊號了</strong>：指數彎得太厲害，必須整條曲線去算，不能再用單一個 g——這就是為什麼放大器的輸入不能太大。";
    }
    let edge="";
    if(I0<1e-6){
      edge=say("邊界提醒：這裡二極體幾乎沒導通，工作點電流只有 "+expFmt(I0*1e3,6)+" mA，r<sub>d</sub> = "+ohms(rd)+" 大到像斷路——小訊號電阻在低電流時會爆炸性放大。");
    }else if(val('nl-dv')<=1){
      edge=say("邊界提醒：ΔV = 1 mV，誤差只有 "+sfmt(errSigned,6)+" %。<strong>這才是教科書說的「小訊號」</strong>。");
    }else if(val('nl-dv')>=200){
      edge=say("邊界提醒：ΔV = 200 mV 時線性模型已經完全失效——真值是 "+sfmt(I1*1e3,6)+" mA，線性預測只有 "+sfmt(Ilin*1e3,6)+" mA。");
    }
    $('nonlinear-output').innerHTML=
      say("<strong>二極體（非線性元件）</strong>")+
      rows([
        "工作點電流 I<sub>0</sub> = "+sfmt(I0*1e3,6)+" mA",
        "加上 ΔV 之後 I<sub>1</sub> = "+sfmt(I1*1e3,6)+" mA（增幅 "+sfmt(growD,6)+" %）",
        "小訊號電導 g = (I<sub>0</sub> + I<sub>S</sub>) / V<sub>T</sub> = "+sfmt(g*1e3,6)+" mA/V",
        "小訊號電阻 r<sub>d</sub> = 1/g = "+ohms(rd),
        "線性模型預測 I<sub>0</sub> + gΔV = "+sfmt(Ilin*1e3,6)+" mA（相對真值 "+sfmt(errSigned,6)+" %）",
        "同一點的直流電阻 V/I = "+(isFinite(dcR)?ohms(dcR):"無限大")+"（與 r<sub>d</sub> 完全是兩回事）"
      ])+
      say("<strong>線性電阻（對照組）</strong>")+
      rows([
        "R = "+ohms(val('nl-r'))+" 的工作點電流 = "+sfmt(IR0*1e3,6)+" mA",
        "加上 ΔV 之後 = "+sfmt(IR1*1e3,6)+" mA（增幅 "+sfmt(growR,6)+" %）",
        "電導 1/R = "+sfmt(1/val('nl-r')*1e3,6)+" mA/V（與偏壓無關）"
      ])+
      say(judge)+
      say("為什麼：g = I / V<sub>T</sub>，工作點電流愈大、小訊號電導愈大、r<sub>d</sub> 愈小。同樣加 "+sfmt(val('nl-dv'),0)+" mV，電阻電流只多 "+sfmt(growR,6)+" %，二極體電流多 "+sfmt(growD,6)+" %。<strong>電阻的電導與偏壓無關，二極體的不是——這一句就是電子學與電路學的分界線。</strong>")+
      edge;
  };
  ['nl-v','nl-dv','nl-is','nl-r'].forEach(x=>on(x,'input',draw));
  draw();
}

// 01 載子、摻雜與導電率
function carrier(){
  if(!$('car-type'))return;
  const draw=()=>{
    const type=sel('car-type'),dope=val('car-dope'),E=val('car-field');
    const N=Math.pow(10,dope);
    let n,p;
    if(type==='ntype'){n=N;p=NI*NI/N;}
    else if(type==='ptype'){p=N;n=NI*NI/N;}
    else{n=NI;p=NI;}
    const sigma=QE*(n*MUN+p*MUP);
    const rho=(sigma>0)?(1/sigma):Infinity;
    const J=sigma*E;
    // 同一濃度下 n 型與 p 型的電阻率比值
    const sigN=QE*(N*MUN+(NI*NI/N)*MUP);
    const sigP=QE*((NI*NI/N)*MUN+N*MUP);
    const rhoRatio=(sigN>0&&sigP>0)?((1/sigP)/(1/sigN)):Infinity;
    const massAction=Math.abs(n*p-NI*NI)/(NI*NI);
    const maj=(n>=p)?n:p,min=(n>=p)?p:n;
    const ratio=(min>0)?(maj/min):Infinity;
    const majName=(n>=p)?"電子":"電洞";
    const minName=(n>=p)?"電洞":"電子";
    let judge;
    if(type==='intrinsic'){
      judge="<strong>本徵矽</strong>：n = p = n<sub>i</sub>，電阻率高達 227377.379762 Ω⋅cm，這是它幾乎不導電的意思；不摻雜的矽是很差的導體，也不是絕緣體。<strong>濃度滑桿在本模式下不影響結果。</strong>";
    }else if(dope<=13){
      judge="<strong>輕摻雜</strong>：這種濃度常見於功率元件的漂移區，電阻率高但耐壓好——空乏區可以延伸得很長，電場才不會集中。";
    }else if(dope>=19){
      judge="<strong>重摻雜</strong>（寫作 n<sup>+</sup> 或 p<sup>+</sup>）：電阻率已經接近金屬，IC 裡拿它當內部走線與歐姆接觸。";
    }else{
      judge="<strong>一般元件摻雜區間</strong>：多數載子由摻雜濃度決定，少數載子被質量作用定律壓到極低。";
    }
    $('carrier-output').innerHTML=
      rows([
        "電子濃度 n = "+expFmt(n,6)+" cm<sup>−3</sup>",
        "電洞濃度 p = "+expFmt(p,6)+" cm<sup>−3</sup>",
        "多數載子（"+majName+"）／少數載子（"+minName+"）比 = "+expFmt(ratio,6)+" 倍",
        "導電率 σ = q(nµ<sub>n</sub> + pµ<sub>p</sub>) = "+sfmt(sigma,9)+" S/cm",
        "電阻率 ρ = 1/σ = "+sfmt(rho,6)+" Ω⋅cm",
        "漂移電流密度 J = σE = "+sfmt(J,6)+" A/cm²"
      ])+
      say("質量作用定律檢查：np = "+expFmt(n*p,6)+" cm<sup>−6</sup>，與 n<sub>i</sub>² = "+expFmt(NI*NI,6)+" 的相對差 "+expFmt(massAction,6)+"（判定 "+((massAction<1e-9)?"成立":"需注意")+"）。<strong>np = n<sub>i</sub>² 這條在任何摻雜濃度下都成立——摻雜不是「製造載子總量」，是把天平壓向一邊。</strong>")+
      say("同一個濃度下 p 型與 n 型的電阻率比值 = "+sfmt(rhoRatio,6)+"，差別只來自遷移率 µ<sub>n</sub>/µ<sub>p</sub> = 1350/480 = "+sfmt(MUN/MUP,6)+"。")+
      say(judge)+
      say("為什麼：載子多 → σ 大 → 同樣電場推出更大的電流密度。少數載子濃度 "+expFmt(min,6)+" cm<sup>−3</sup> 小到看起來像 0，<strong>但 PN 接面的反向飽和電流就是它撐起來的</strong>。");
  };
  ['car-type','car-dope','car-field'].forEach(x=>on(x,'input',draw));
  draw();
}

// 02 PN 接面與蕭克萊方程
function pnjunc(){
  if(!$('pn-na'))return;
  const draw=()=>{
    const NA=Math.pow(10,val('pn-na')),ND=Math.pow(10,val('pn-nd'));
    const IS=Number(sel('pn-is'));
    const V0=VT*Math.log(NA*ND/(NI*NI));
    const VD=val('pn-v')*1e-3;
    const ID=IS*(Math.exp(VD/VT)-1);
    const decade=VT*Math.LN10;
    let judge,extra="";
    if(VD>0.05){
      judge="<strong>順向偏壓</strong>：外加電壓抵消了一部分內建電場，空乏區變窄，多數載子越過接面成為對側的少數載子，電流隨電壓指數上升。";
      extra=say("再加 "+sfmt(decade*1e3,6)+" mV，電流就會變成現在的 10 倍，也就是 "+sfmt(ID*10*1e3,6)+" mA。");
    }else if(VD>=-0.05){
      judge="<strong>接近零偏</strong>：擴散與漂移幾乎打平，淨電流接近零。注意 V<sub>D</sub> = 0 時電流剛好是 0，不是 I<sub>S</sub>。";
    }else{
      judge="<strong>反向偏壓</strong>：空乏區變寬，只剩少數載子被電場掃過去，電流鎖在 −I<sub>S</sub> 不再變化。本互動不模擬崩潰，真實二極體超過崩潰電壓後電流會急速上升。";
    }
    let edge="";
    if(val('pn-v')<=-1000){
      edge=say("邊界提醒：<strong>反向電流與反向電壓完全無關</strong>，這是二極體能當整流器的根本原因。");
    }else if(val('pn-v')>=800&&IS>=1e-12){
      edge=say("邊界提醒：這個電流在真實元件早就燒掉了——本方程沒有包含串聯歐姆電阻與自熱，實際 I–V 在大電流會被壓平。");
    }
    if(val('pn-na')>=19&&val('pn-nd')>=19){
      edge=edge+say("邊界提醒：V<sub>0</sub> 有上限，它不可能超過能隙對應的電位 1.12 V。");
    }
    const idLine=(VD>0)
      ? ("二極體電流 I<sub>D</sub> = "+sfmt(ID*1e3,6)+" mA")
      : ("二極體電流 I<sub>D</sub> = "+sfmt(ID*1e12,6)+" pA（＝ "+expFmt(ID,6)+" A）");
    $('pnjunc-output').innerHTML=
      rows([
        "p 側摻雜 N<sub>A</sub> = "+expFmt(NA,6)+" cm<sup>−3</sup>、n 側摻雜 N<sub>D</sub> = "+expFmt(ND,6)+" cm<sup>−3</sup>",
        "內建電位 V<sub>0</sub> = V<sub>T</sub> ⋅ ln(N<sub>A</sub>N<sub>D</sub> / n<sub>i</sub>²) = "+sfmt(V0,6)+" V",
        "偏壓 V<sub>D</sub> = "+sfmt(VD,6)+" V",
        idLine,
        "電流變 10 倍所需的電壓 V<sub>T</sub>ln10 = "+sfmt(decade*1e3,6)+" mV"
      ])+
      say(judge)+extra+
      say("為什麼：V<sub>0</sub> 進的是摻雜濃度的對數，所以濃度差好幾個數量級，V<sub>0</sub> 也只差零點幾伏。V<sub>0</sub> 是零偏平衡時的內建電位、量不到，跟導通後那個 0.7 V 的外加壓降不是同一件事。")+
      edge;
  };
  ['pn-na','pn-nd','pn-v','pn-is'].forEach(x=>on(x,'input',draw));
  draw();
}

// 03 負載線、三種模型與牛頓法
function dload(){
  if(!$('dl-vs'))return;
  const IS=1e-14;
  const draw=()=>{
    const vs=val('dl-vs'),r=val('dl-r'),model=sel('dl-model');
    const Iideal=vs/r;
    const Icvd=Math.max(0,(vs-0.7)/r);
    let vd=0.7;
    for(let k=0;k<60;k++){
      const ex=Math.exp(vd/VT);
      const f=IS*(ex-1)-(vs-vd)/r;
      const df=IS*ex/VT+1/r;
      if(!isFinite(f)||!isFinite(df)||df===0)break;
      vd=vd-f/df;
      vd=clamp(vd,-1,1.2);
    }
    const Iexp=(vs-vd)/r;
    const resid=Math.abs(IS*(Math.exp(vd/VT)-1)-(vs-vd)/r);
    const rd=(Iexp>0)?(VT/Iexp):Infinity;
    const errIdeal=(Iexp!==0)?((Iideal-Iexp)/Iexp*100):0;
    const errCvd=(Iexp!==0)?((Icvd-Iexp)/Iexp*100):0;
    const pick=(model==='ideal')?{name:"理想開關（V<sub>D</sub> = 0）",I:Iideal,V:0,err:errIdeal}
      :(model==='cvd')?{name:"恆壓降（V<sub>D</sub> = 0.7 V）",I:Icvd,V:0.7,err:errCvd}
      :{name:"完整指數（牛頓法迭代）",I:Iexp,V:vd,err:0};
    const ea=Math.abs(pick.err);
    let judge;
    if(ea<1){
      judge="<strong>這個模型在此工作點夠用</strong>：誤差 "+sfmt(pick.err,6)+" %，手算可以直接用它，省下迭代。";
    }else if(ea<10){
      judge="<strong>開始有偏差</strong>：誤差 "+sfmt(pick.err,6)+" %，估算可以，設計要小心。";
    }else{
      judge="<strong>這個模型在此工作點不能用</strong>：誤差 "+sfmt(pick.err,6)+" %。電流太小時二極體的真實壓降遠低於 0.7 V，恆壓降模型會嚴重低估電流。";
    }
    let edge="";
    if(vs<=0.7){
      edge=say("邊界提醒：恆壓降模型認為二極體根本不導通（給出 0 mA），但完整指數說仍有 "+sfmt(Iexp*1e3,6)+" mA 的微小電流——<strong>模型的離散判斷 vs 真實的連續曲線</strong>。");
    }else if(vs<=1.05&&r>=9000){
      edge=say("邊界提醒：這是恆壓降模型的失效區，誤差已達 "+sfmt(errCvd,6)+" %。");
    }else if(vs<=1.05&&r<=200){
      edge=say("邊界提醒：理想開關與恆壓降的比值 = "+sfmt((Icvd>0)?(Iideal/Icvd):Infinity,6)+" 倍，兩個「手算模型」在低電壓時差距最大。");
    }
    $('dload-output').innerHTML=
      say("負載線：I = (V<sub>s</sub> − V<sub>D</sub>) / R，斜率 −1/R = "+expFmt(-1/r,6)+" S。")+
      rows([
        "理想開關：I<sub>D</sub> = "+sfmt(Iideal*1e3,6)+" mA、V<sub>D</sub> = "+sfmt(0,6)+" V（誤差 "+sfmt(errIdeal,6)+" %）"+((model==='ideal')?"　←　<strong>你選的模型</strong>":""),
        "恆壓降：I<sub>D</sub> = "+sfmt(Icvd*1e3,6)+" mA、V<sub>D</sub> = "+sfmt(0.7,6)+" V（誤差 "+sfmt(errCvd,6)+" %）"+((model==='cvd')?"　←　<strong>你選的模型</strong>":""),
        "完整指數：I<sub>D</sub> = "+sfmt(Iexp*1e3,6)+" mA、V<sub>D</sub> = "+sfmt(vd,6)+" V（基準）"+((model==='exp')?"　←　<strong>你選的模型</strong>":""),
        "所選模型「"+pick.name+"」對完整指數的相對誤差 = "+sfmt(pick.err,6)+" %",
        "小訊號電阻 r<sub>d</sub> = V<sub>T</sub> / I<sub>D</sub> = "+ohms(rd)
      ])+
      say(judge)+
      say("牛頓法收斂殘差 = "+expFmt(resid,6)+" A（要求 &lt; 1e−15 A，判定 "+((resid<1e-15)?"通過":"未達")+"）。殘差趨近 0 表示元件方程與電路方程同時被滿足，<strong>這就是工作點的定義</strong>。")+
      say("為什麼：負載線的斜率是 −1/R，R 愈大線愈平，交點就往低電流、低壓降移動。")+
      edge;
  };
  ['dl-vs','dl-r','dl-model'].forEach(x=>on(x,'input',draw));
  draw();
}

// 04 整流與濾波
function rect(){
  if(!$('rec-type'))return;
  const draw=()=>{
    const type=sel('rec-type'),vm=val('rec-vm'),f=val('rec-f'),r=val('rec-r'),c=val('rec-c');
    const drop=(type==='full')?1.4:0.7;
    const Vpk=Math.max(0,vm-drop);
    const feff=(type==='full')?(2*f):f;
    const CSI=c*1e-6;
    const den=feff*r*CSI;
    const dV=(den>0)?(Vpk/den):Infinity;
    const VdcRaw=Vpk-dV/2;
    const Vdc=Math.max(0,VdcRaw);
    const ripple=(Vpk>0&&isFinite(dV))?(dV/Vpk):Infinity;
    const Iload=(r>0)?(Vpk/r):0;
    // 另一種整流型式的對照
    const dropAlt=(type==='full')?0.7:1.4;
    const VpkAlt=Math.max(0,vm-dropAlt);
    const feffAlt=(type==='full')?f:(2*f);
    const dVAlt=(feffAlt*r*CSI>0)?(VpkAlt/(feffAlt*r*CSI)):Infinity;
    const rippleAlt=(VpkAlt>0)?(dVAlt/VpkAlt):Infinity;
    let judge;
    if(ripple<0.05){
      judge="<strong>漣波夠小</strong>：RC 遠大於半個週期，電容在不導通的期間幾乎沒放掉電，近似公式成立，這個輸出可以直接餵給穩壓器。";
    }else if(ripple<0.3){
      judge="<strong>漣波偏大</strong>：後面一定要接穩壓器，否則負載會看到明顯的 "+sfmt(feff,0)+" Hz 嗡聲。";
    }else{
      judge="<strong>近似已失效</strong>：ΔV 已經與 V<sub>pk</sub> 同量級，公式 ΔV ≈ V<sub>pk</sub>/(f<sub>eff</sub>RC) 的前提「RC 遠大於週期」不成立，真實波形是指數放電而不是直線，<strong>這裡顯示的 V<sub>dc</sub> 不可信</strong>。";
    }
    let cmp;
    if(type==='full'){
      cmp="切到半波會是：V<sub>pk</sub> = "+sfmt(VpkAlt,6)+" V（只串一顆二極體，峰值多 0.7 V）、f<sub>eff</sub> = "+sfmt(feffAlt,0)+" Hz、漣波 "+sfmt(rippleAlt*100,6)+" %。<strong>半波的峰值比較高，漣波卻是全波的兩倍——因為 f<sub>eff</sub> 只有一半。</strong>";
    }else{
      cmp="目前是半波：峰值多 0.7 V，但漣波是全波的兩倍——因為 f<sub>eff</sub> 只有一半。切到全波會是：V<sub>pk</sub> = "+sfmt(VpkAlt,6)+" V、f<sub>eff</sub> = "+sfmt(feffAlt,0)+" Hz、漣波 "+sfmt(rippleAlt*100,6)+" %。";
    }
    let edge="";
    if(!isFinite(ripple)||ripple>=1){
      edge=say("邊界提醒：ΔV 已經超過 V<sub>pk</sub>，V<sub>dc</sub> 一律以 0 為下限顯示（未截斷的算式值是 "+sfmt(VdcRaw,6)+" V）。這只代表近似公式徹底失效，不是真的會出現負電壓。");
    }else if(Vpk<=4){
      edge=say("邊界提醒：輸入峰值扣掉 "+sfmt(drop,1)+" V 之後所剩不多，低壓應用要改用蕭特基二極體（壓降 0.2–0.4 V）。");
    }else if(ripple<0.005){
      edge=say("邊界提醒：漣波極小。<strong>這就是切換式電源把工作頻率拉到數十 kHz 的理由：頻率高，電容可以做得很小。</strong>");
    }
    $('rect-output').innerHTML=
      rows([
        "二極體總壓降 = "+sfmt(drop,6)+" V（"+((type==='full')?"橋式串兩顆":"半波一顆")+"）",
        "輸出峰值 V<sub>pk</sub> = "+sfmt(Vpk,6)+" V",
        "有效漣波頻率 f<sub>eff</sub> = "+sfmt(feff,6)+" Hz",
        "漣波電壓 ΔV = V<sub>pk</sub>/(f<sub>eff</sub>RC) = "+guardInf(dV)+" V",
        "直流準位 V<sub>dc</sub> = V<sub>pk</sub> − ΔV/2 = "+sfmt(Vdc,6)+" V",
        "漣波百分比 = "+(isFinite(ripple)?(sfmt(ripple*100,6)+" %"):"無法計算（RC 太小）"),
        "負載電流（峰值時）= "+sfmt(Iload*1e3,6)+" mA"
      ])+
      say(judge)+
      say(cmp)+
      say("為什麼：電容愈大、負載愈輕（R 大）、頻率愈高，同一段時間放掉的電荷愈少，漣波就愈小。")+
      edge;
  };
  ['rec-type','rec-vm','rec-f','rec-r','rec-c'].forEach(x=>on(x,'input',draw));
  draw();
}

// 05 齊納穩壓器
function zener(){
  if(!$('zn-vin'))return;
  const IZMIN=0.005;
  const draw=()=>{
    const vin=val('zn-vin'),rs=val('zn-rs'),vz=val('zn-vz'),rl=val('zn-rl');
    if(rs<=0||rl<=0){
      $('zener-output').innerHTML=say("R<sub>s</sub> 與 R<sub>L</sub> 必須大於 0，這個組合沒有意義。");
      return;
    }
    const Vun=vin*rl/(rs+rl);
    let on2,Vout,IL,Is,Iz,Pz,Prs;
    if(Vun<=vz){
      on2=false;Vout=Vun;IL=Vun/rl;Is=IL;Iz=0;Pz=0;Prs=(vin-Vout)*Is;
    }else{
      on2=true;Vout=vz;IL=vz/rl;Is=(vin-vz)/rs;Iz=Is-IL;Pz=vz*Iz;Prs=(vin-vz)*Is;
    }
    const kcl=Math.abs(Is-IL-Iz);
    let judge;
    if(on2&&Iz>=IZMIN&&Pz<=0.25){
      judge="<strong>穩壓正常</strong>：齊納吃掉負載不要的那份電流，輸出被鎖在 V<sub>Z</sub> = "+sfmt(vz,6)+" V。";
    }else if(on2&&Iz<IZMIN){
      judge="<strong>快要脫出</strong>：齊納電流 "+sfmt(Iz*1e3,6)+" mA 低於 5 mA 的最小維持電流，崩潰不夠深，輸出會開始跟著輸入跑。";
    }else if(on2&&Pz>0.25){
      judge="<strong>功耗超標</strong>：齊納功耗 "+sfmt(Pz*1e3,6)+" mW 已超過常見 250 mW 封裝的額定，這顆會燒。要嘛加大 R<sub>s</sub>，要嘛換大封裝。";
    }else{
      judge="<strong>已脫出穩壓</strong>：齊納根本沒有崩潰（開路分壓只有 "+sfmt(Vun,6)+" V，低於 V<sub>Z</sub> = "+sfmt(vz,6)+" V），電路退化成單純的 R<sub>s</sub>–R<sub>L</sub> 分壓，輸出完全跟著輸入走。原因是輸入太低或負載太重。";
    }
    let edge="";
    if(!on2&&vz>=vin){
      edge=say("邊界提醒：<strong>V<sub>Z</sub> 必須明顯低於輸入</strong>，否則這個拓樸不可能工作。");
    }else if(!on2&&rl<=200){
      edge=say("邊界提醒：負載電流已經超過 R<sub>s</sub> 能供應的量，<strong>齊納無電流可分</strong>。");
    }else if(on2&&Pz>0.5){
      edge=say("邊界提醒：功耗 "+sfmt(Pz*1e3,6)+" mW 連 500 mW 封裝都撐不住，這是「輸入太高或負載太輕」那一種失效方向。");
    }
    $('zener-output').innerHTML=
      say("狀態："+(on2?"<strong>穩壓中</strong>":"<strong>已脫出穩壓</strong>"))+
      rows([
        "齊納不導通時的開路分壓 = "+sfmt(Vun,6)+" V（判斷用）",
        "輸出電壓 V<sub>out</sub> = "+sfmt(Vout,6)+" V",
        "負載電流 I<sub>L</sub> = "+sfmt(IL*1e3,6)+" mA",
        "串聯電阻電流 I<sub>s</sub> = "+sfmt(Is*1e3,6)+" mA",
        "齊納電流 I<sub>Z</sub> = "+sfmt(Iz*1e3,6)+" mA",
        "齊納功耗 P<sub>Z</sub> = "+sfmt(Pz*1e3,6)+" mW",
        "串聯電阻功耗 P<sub>Rs</sub> = "+sfmt(Prs*1e3,6)+" mW"
      ])+
      say(judge)+
      say("KCL 檢查：|I<sub>s</sub> − I<sub>Z</sub> − I<sub>L</sub>| = "+expFmt(kcl,6)+" A（判定 "+((kcl<1e-12)?"成立":"需注意")+"）。<strong>I<sub>s</sub> = I<sub>Z</sub> + I<sub>L</sub> 是節點的 KCL，齊納只是那個吸收多餘電流的角色。</strong>")+
      say("為什麼：輸入太低或負載太重 → 齊納拿不到電流 → 輸出跟著輸入跑；輸入太高或負載太輕 → 齊納吃下全部電流 → 燒掉。兩個失效方向要分開看。")+
      edge;
  };
  ['zn-vin','zn-rs','zn-vz','zn-rl'].forEach(x=>on(x,'input',draw));
  draw();
}

// 06 BJT 工作區
function bjt(){
  if(!$('bj-ib'))return;
  const draw=()=>{
    const IB=val('bj-ib')*1e-6,beta=val('bj-beta'),vcc=val('bj-vcc'),rc=val('bj-rc'),vaSel=sel('bj-va');
    const ICsat=(vcc-0.2)/rc;
    const IBsat=ICsat/beta;
    const ICactive=beta*IB;
    let region,IC,VCE,betaEff;
    if(ICactive>=ICsat){
      region='sat';IC=ICsat;VCE=0.2;betaEff=(IB>0)?(IC/IB):0;
    }else{
      region='active';IC=ICactive;VCE=vcc-IC*rc;betaEff=beta;
    }
    const IE=IC+IB;
    const alpha=beta/(beta+1);
    const ro=(vaSel==='inf'||IC<=0)?null:(Number(vaSel)/IC);
    const headroom=(IBsat>0)?((IBsat-val('bj-ib')*1e-6)/IBsat*100):0;
    let judge;
    if(region==='active'){
      judge="<strong>作用區（active）</strong>：BE 順偏、BC 反偏，射極注入的載子大部分穿過薄基極到達集極，所以 I<sub>C</sub> = βI<sub>B</sub> 成立，集極看起來像一個由 I<sub>B</sub> 控制的電流源。";
    }else{
      judge="<strong>飽和區（saturation）</strong>：BC 接面也順偏了，V<sub>CE</sub> 被鎖在 0.2 V，I<sub>C</sub> 由外部電路（V<sub>CC</sub> 與 R<sub>C</sub>）決定而不是由 β 決定。此時實際 β<sub>eff</sub> 只有 "+sfmt(betaEff,6)+"，再灌基極電流也沒用——<strong>這正是拿 BJT 當開關時故意做的事</strong>。注意 BJT 的飽和是「開關全開」，與 MOSFET 的飽和區（定電流放大）意思相反。";
    }
    let edge="";
    if(region==='sat'&&betaEff<beta*0.7){
      edge=say("邊界提醒：深度飽和，名目 β = "+sfmt(beta,0)+" 但實際 β<sub>eff</sub> 只有 "+sfmt(betaEff,6)+"——<strong>β 在飽和區完全失效</strong>。");
    }else if(region==='active'&&IC<1e-4){
      edge=say("邊界提醒：電流小、r<sub>o</sub> 就大（目前 "+((ro===null)?"無限大":ohms(ro))+"），<strong>這是低電流放大器輸出阻抗高的原因</strong>。");
    }
    $('bjt-output').innerHTML=
      rows([
        "工作區判定："+((region==='active')?"作用區（active）":"飽和區（saturation）"),
        "集極電流 I<sub>C</sub> = "+sfmt(IC*1e3,6)+" mA",
        "射極電流 I<sub>E</sub> = I<sub>C</sub> + I<sub>B</sub> = "+sfmt(IE*1e3,6)+" mA",
        "集—射電壓 V<sub>CE</sub> = "+sfmt(VCE,6)+" V",
        "α = β/(β + 1) = "+sfmt(alpha,6),
        "輸出阻抗 r<sub>o</sub> = "+((ro===null)?"<strong>無限大（理想電流源）</strong>":ohms(ro)),
        "飽和臨界集極電流 I<sub>C,sat</sub> = (V<sub>CC</sub> − 0.2)/R<sub>C</sub> = "+sfmt(ICsat*1e3,6)+" mA",
        "飽和臨界基極電流 I<sub>B,sat</sub> = I<sub>C,sat</sub>/β = "+sfmt(IBsat*1e6,6)+" µA",
        "有效電流增益 β<sub>eff</sub> = "+sfmt(betaEff,6)
      ])+
      say(judge)+
      say("離飽和還有多遠：目前 I<sub>B</sub> = "+sfmt(val('bj-ib'),0)+" µA，距離 I<sub>B,sat</sub> = "+sfmt(IBsat*1e6,6)+" µA "+((headroom>0)?("還有 "+sfmt(headroom,6)+" % 的餘裕"):("已經超過 "+sfmt(-headroom,6)+" %"))+"。<strong>基極電流一旦越過這條線，V<sub>CE</sub> 就再也降不下去，多灌的電流全部浪費。</strong>")+
      say("α = "+sfmt(alpha,6)+" 的意思是 "+sfmt(alpha*100,6)+" % 的射極電流到了集極，只有 "+sfmt((1-alpha)*100,6)+" % 變成基極電流——這就是薄基極買到的東西。")+
      ((vaSel==='inf')?say("r<sub>o</sub> 選了無限大：<strong>真實 BJT 沒有這種東西，Early 效應保證 r<sub>o</sub> 是有限的。</strong>"):"")+
      edge;
  };
  ['bj-ib','bj-beta','bj-vcc','bj-rc','bj-va'].forEach(x=>on(x,'input',draw));
  draw();
}

// 07 分壓偏壓與 Q 點
function bjtbias(){
  if(!$('bb-vcc'))return;
  const VBE=0.7;
  const solve=(vcc,R1,R2,re,rc,beta)=>{
    const VTH=vcc*R2/(R1+R2);
    const RTH=R1*R2/(R1+R2);
    const IB=(VTH-VBE)/(RTH+(beta+1)*re);
    const IC=beta*IB;
    const IE=(beta+1)*IB;
    const VE=IE*re;
    const VC=vcc-IC*rc;
    return {VTH:VTH,RTH:RTH,IB:IB,IC:IC,IE:IE,VE:VE,VC:VC,VCE:VC-VE,stab:(beta+1)*re/RTH};
  };
  const draw=()=>{
    const vcc=val('bb-vcc'),R1=val('bb-r1')*1e3,R2=val('bb-r2')*1e3;
    const re=val('bb-re'),rc=val('bb-rc'),beta=val('bb-beta');
    const s=solve(vcc,R1,R2,re,rc,beta);
    if(s.VTH<=VBE||s.IB<=0){
      $('bjtbias-output').innerHTML=
        rows([
          "戴維寧電壓 V<sub>TH</sub> = "+sfmt(s.VTH,6)+" V",
          "戴維寧電阻 R<sub>TH</sub> = R<sub>1</sub>‖R<sub>2</sub> = "+ohms(s.RTH),
          "基極電流 I<sub>B</sub> = 0.000000 µA（電晶體未導通）",
          "集極電流 I<sub>C</sub> = 0.000000 mA",
          "集極電位 V<sub>C</sub> = "+sfmt(vcc,6)+" V、射極電位 V<sub>E</sub> = 0.000000 V"
        ])+
        say("<strong>基極根本沒被偏到導通</strong>：戴維寧電壓 "+sfmt(s.VTH,6)+" V 低於 V<sub>BE</sub> = 0.7 V，電晶體在截止區。把 R<sub>2</sub> 加大或 R<sub>1</sub> 減小。")+
        say("為什麼：射極電阻是直流負回授，但前提是基極先被偏到導通；V<sub>TH</sub> 不夠高的時候整個回授迴路根本沒啟動。");
      return;
    }
    const s2=solve(vcc,R1,R2,re,rc,2*beta);
    const drift=(s2.IC-s.IC)/s.IC*100;
    let judge;
    if(s.VCE<0.2){
      judge="<strong>已進入飽和區</strong>：V<sub>CE</sub> = "+sfmt(s.VCE,6)+" V 低於 0.2 V，Q 點沒有訊號擺動的空間，這個放大器不能用。把 R<sub>C</sub> 或 R<sub>E</sub> 調小。"+((s.VCE<0)?"（算出負值代表「作用區」這個假設本身不成立，不是電路真的產生負電壓。）":"");
    }else if(s.stab>=10){
      judge="<strong>Q 點健康且對 β 不敏感</strong>：(β+1)R<sub>E</sub> 是 R<sub>TH</sub> 的 "+sfmt(s.stab,6)+" 倍，β 從 I<sub>C</sub> 的算式裡幾乎消失了。";
    }else{
      judge="<strong>Q 點在作用區，但穩定度不足</strong>：(β+1)R<sub>E</sub> 只有 R<sub>TH</sub> 的 "+sfmt(s.stab,6)+" 倍（建議 ≥ 10），換一顆 β 不同的電晶體 Q 點就會明顯移位。";
    }
    $('bjtbias-output').innerHTML=
      rows([
        "戴維寧電壓 V<sub>TH</sub> = V<sub>CC</sub>R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = "+sfmt(s.VTH,6)+" V",
        "戴維寧電阻 R<sub>TH</sub> = R<sub>1</sub>‖R<sub>2</sub> = "+sfmt(s.RTH,6)+" Ω",
        "基極電流 I<sub>B</sub> = (V<sub>TH</sub> − V<sub>BE</sub>) / [R<sub>TH</sub> + (β + 1)R<sub>E</sub>] = "+sfmt(s.IB*1e6,6)+" µA",
        "集極電流 I<sub>C</sub> = "+sfmt(s.IC*1e3,6)+" mA",
        "射極電位 V<sub>E</sub> = "+sfmt(s.VE,6)+" V",
        "集極電位 V<sub>C</sub> = "+sfmt(s.VC,6)+" V",
        "集—射電壓 V<sub>CE</sub> = "+sfmt(s.VCE,6)+" V",
        "穩定度指標 (β + 1)R<sub>E</sub> / R<sub>TH</sub> = "+sfmt(s.stab,6)
      ])+
      say(judge)+
      say("β 敏感度：β 從 "+sfmt(beta,0)+" 加倍到 "+sfmt(2*beta,0)+"，I<sub>C</sub> 從 "+sfmt(s.IC*1e3,6)+" mA 變成 "+sfmt(s2.IC*1e3,6)+" mA，只變 "+sfmt(drift,6)+" %。<strong>同一個 Q 點若改用固定基極偏壓，β 加倍 I<sub>C</sub> 會整整變 100 %。</strong>")+
      say("為什麼：射極電阻是直流負回授——I<sub>C</sub> 想變大就會抬高 V<sub>E</sub>，把 V<sub>BE</sub> 壓小，於是 I<sub>C</sub> 又被拉回來。");
  };
  ['bb-vcc','bb-r1','bb-r2','bb-re','bb-rc','bb-beta'].forEach(x=>on(x,'input',draw));
  draw();
}

// 08 MOSFET 三個工作區
function mosfet(){
  if(!$('mo-vgs'))return;
  const draw=()=>{
    const vgs=val('mo-vgs'),vds=val('mo-vds'),vth=val('mo-vth');
    const K=val('mo-k')*1e-6,lam=Number(sel('mo-lambda'));
    const VOV=vgs-vth;
    let region,ID,gm,ro=null,rds=null,A0=null;
    if(VOV<=0){
      region='cutoff';ID=0;gm=0;
    }else if(vds<VOV){
      region='triode';
      ID=K*(VOV*vds-0.5*vds*vds);
      gm=K*vds;
      rds=(ID>0)?(vds/ID):null;
    }else{
      region='sat';
      ID=0.5*K*VOV*VOV*(1+lam*vds);
      gm=K*VOV*(1+lam*vds);
      ro=(lam===0)?null:(1/(lam*ID));
      A0=(ro===null)?null:(gm*ro);
    }
    const atEdge=(VOV>0)&&(Math.abs(vds-VOV)<1e-9);
    let judge;
    if(region==='cutoff'){
      judge="<strong>截止區（cutoff）</strong>：V<sub>GS</sub> 還沒到門檻，閘極電場不足以在氧化層下感應出反轉層，源汲之間仍是背對背的反偏 PN 接面。真實元件仍有次臨界漏電流，本互動不模擬。";
    }else if(region==='triode'){
      judge="<strong>三極（線性）區（triode / linear）</strong>：通道從源到汲都存在，V<sub>DS</sub> 小的時候 MOSFET 就是一顆阻值由 V<sub>GS</sub> 控制的電阻"+((rds===null)?"":("（目前 r<sub>DS</sub> = "+ohms(rds)+"）"))+"。CMOS 開關與類比開關就用這一區。";
    }else{
      judge="<strong>飽和區（saturation）</strong>：汲極端的通道被夾斷，電流由 V<sub>GS</sub> 決定、幾乎不隨 V<sub>DS</sub> 變——這就是放大器要的定電流行為。<strong>注意：MOSFET 的飽和區是放大區，跟 BJT 的飽和區（開關全開、V<sub>CE</sub> ≈ 0.2 V）意思相反。</strong>";
    }
    let edge="";
    if(region==='triode'&&vds<=0){
      edge=say("邊界提醒：<strong>V<sub>DS</sub> = 0：沒有電場推動載子，電流為零</strong>；此時 r<sub>DS</sub> 的極限值是 1/(kV<sub>OV</sub>) = "+ohms(1/(K*VOV))+"，不是無意義的除以零。");
    }else if(region==='sat'&&ID>2e-3){
      edge=say("邊界提醒：這個電流密度在真實元件會遇到速度飽和，<strong>平方律高估了電流——這正是短通道效應</strong>，工業界因此改用 FinFET 與 GAA 結構。");
    }
    if(atEdge){
      edge=edge+say("邊界提醒：V<sub>DS</sub> 恰等於 V<sub>OV</sub>，<strong>這裡是兩區的交界，兩條公式在此連續</strong>（差別只來自 λ 項：三極區給 "+sfmt(K*(VOV*vds-0.5*vds*vds)*1e6,6)+" µA，飽和區給 "+sfmt(0.5*K*VOV*VOV*(1+lam*vds)*1e6,6)+" µA）。");
    }
    $('mosfet-output').innerHTML=
      rows([
        "工作區判定："+((region==='cutoff')?"截止區（cutoff）":(region==='triode')?"三極區／線性區（triode / linear）":"飽和區（saturation）"),
        "超驅動電壓 V<sub>OV</sub> = V<sub>GS</sub> − V<sub>th</sub> = "+sfmt(VOV,6)+" V",
        "汲極電流 I<sub>D</sub> = "+sfmt(ID*1e6,6)+" µA",
        "跨導 g<sub>m</sub> = "+sfmt(gm*1e6,6)+" µA/V",
        (region==='sat')
          ? ("輸出阻抗 r<sub>o</sub> = "+((ro===null)?"<strong>無限大（理想定電流源）</strong>":ohms(ro)))
          : ("等效通道電阻 r<sub>DS</sub> = "+((rds===null)?"（此區不適用或 V<sub>DS</sub> = 0）":ohms(rds))),
        "本徵增益 g<sub>m</sub>r<sub>o</sub> = "+((A0===null)?"（僅飽和區且 λ &gt; 0 時有定義）":sfmt(A0,6))
      ])+
      say(judge)+
      say("為什麼：I<sub>D</sub> 正比於 V<sub>OV</sub> 的平方，所以 V<sub>GS</sub> 多給一點，電流就多很多；但 g<sub>m</sub> 只正比於 √I<sub>D</sub>，所以靠加電流換增益的效率比 BJT 差。")+
      ((lam===0)?say("λ = 0 是教科書理想，<strong>真實元件永遠有通道長度調變</strong>，r<sub>o</sub> 一定是有限的。"):"")+
      edge;
  };
  ['mo-vgs','mo-vds','mo-vth','mo-k','mo-lambda'].forEach(x=>on(x,'input',draw));
  draw();
}

// 09 CMOS 反相器與動態功耗
function cmos(){
  if(!$('cm-vdd'))return;
  const draw=()=>{
    const vdd=val('cm-vdd'),vin=val('cm-vin'),vthn=val('cm-vthn'),kr=Number(sel('cm-kratio'));
    const s=Math.sqrt(kr);
    const VM=(vthn+s*(vdd-vthn))/(1+s);
    const CL=val('cm-cl')*1e-15,F=val('cm-f')*1e6;
    const E=CL*vdd*vdd,P=E*F;
    const vih=vdd-vthn;
    const impossible=(vthn>=vdd);
    const noGuard=(vih<=vthn);
    let state;
    if(impossible){state='transition';}
    else if(vin<vthn){state='low';}
    else if(vin>vih){state='high';}
    else{state='transition';}
    const vout=(state==='low')?vdd:((state==='high')?0:VM);
    const scale=(vdd>0)?Math.pow(1.0/vdd,2):Infinity;
    let judge;
    if(impossible){
      judge="<strong>這個組合不可能工作</strong>：門檻電壓 "+sfmt(vthn,6)+" V 已經超過電源電壓 "+sfmt(vdd,6)+" V，電晶體打不開。真實低壓製程必須同步降低 V<sub>th</sub>，代價是漏電流暴增。";
    }else if(state==='low'){
      judge="<strong>輸入低</strong>：NMOS 截止、PMOS 導通，輸出被拉到 V<sub>DD</sub>。從電源到地沒有導通路徑，靜態電流只剩漏電。";
    }else if(state==='high'){
      judge="<strong>輸入高</strong>：PMOS 截止、NMOS 導通，輸出被拉到 0 V。同樣沒有導通路徑。";
    }else{
      judge="<strong>轉態區</strong>：兩顆同時導通，電源到地出現直通電流，這是 CMOS 唯一會持續耗電的狀態。所以數位訊號的邊緣要夠陡——停在轉態區愈久愈耗電。";
    }
    let edge="";
    if(impossible){
      edge=say("邊界提醒：V<sub>th</sub> ≥ V<sub>DD</sub>，<strong>兩顆永遠不會完全導通</strong>，下面的功耗數字只是把公式代進去的形式值。");
    }else if(noGuard){
      edge=say("邊界提醒：V<sub>th</sub> ≥ V<sub>DD</sub>/2，「保證截止」的上下界重疊了（V<sub>th</sub> = "+sfmt(vthn,6)+" V ≥ V<sub>DD</sub> − V<sub>th</sub> = "+sfmt(vih,6)+" V），整個輸入範圍都算轉態區——這種設計沒有雜訊邊限。");
    }else if(P>=1e-3){
      edge=say("邊界提醒：單一個閘就 "+sfmt(P*1e3,6)+" mW，<strong>這就是高頻大負載的代價</strong>。");
    }
    $('cmos-output').innerHTML=
      rows([
        "切換閾值 V<sub>M</sub> = [V<sub>th,n</sub> + √k<sub>r</sub>(V<sub>DD</sub> − |V<sub>th,p</sub>|)] / (1 + √k<sub>r</sub>) = "+sfmt(VM,6)+" V",
        "V<sub>M</sub> 與 V<sub>DD</sub>/2 的差 = "+sfmt(VM-vdd/2,6)+" V",
        "目前輸入狀態："+((state==='low')?"低準位":(state==='high')?"高準位":"轉態區"),
        "輸出電壓 ≈ "+sfmt(vout,6)+" V",
        "NMOS："+((state==='low')?"截止":(state==='high')?"導通":"部分導通")+"；PMOS："+((state==='low')?"導通":(state==='high')?"截止":"部分導通"),
        "NMOS 保證截止的上界 = "+sfmt(vthn,6)+" V、PMOS 保證截止的下界 = "+sfmt(vih,6)+" V",
        "每次完整切換的能量 E = C<sub>L</sub>V<sub>DD</sub>² = "+sfmt(E*1e15,6)+" fJ",
        "動態功耗 P = C<sub>L</sub>V<sub>DD</sub>²f = "+sfmt(P*1e6,6)+" µW"
      ])+
      say(judge)+
      say("為什麼：P = C<sub>L</sub>V<sub>DD</sub>²f，電壓進的是平方，所以降壓比降頻省得多。V<sub>DD</sub> 若降到 1.0 V，功耗會變成現在的 "+sfmt(scale,6)+" 倍（也就是省 "+sfmt((1-scale)*100,6)+" %），代價是速度變慢。")+
      say("k<sub>r</sub> = 1 且兩個門檻相等時 V<sub>M</sub> 恰為 V<sub>DD</sub>/2；PMOS 弱（k<sub>r</sub> &lt; 1）就把閾值拉低。電洞遷移率只有電子的 480/1350，所以 PMOS 要做得比 NMOS 寬才拉得平。")+
      edge;
  };
  ['cm-vdd','cm-vin','cm-vthn','cm-kratio','cm-f','cm-cl'].forEach(x=>on(x,'input',draw));
  draw();
}

// 10 小訊號模型：BJT vs MOSFET
function smallsig(){
  if(!$('ss-dev'))return;
  const draw=()=>{
    const dev=sel('ss-dev'),I=val('ss-i')*1e-3,beta=val('ss-beta'),va=val('ss-va'),K=val('ss-kn')*1e-6;
    const gmB=I/VT,rpiB=beta/gmB,roB=va/I,A0B=gmB*roB;
    const VOV=Math.sqrt(2*I/K),gmM=Math.sqrt(2*K*I),roM=va/I,A0M=gmM*roM;
    const gmM2=K*VOV,gmM3=2*I/VOV;
    const idealB=va/VT;
    const chkB=Math.abs(A0B-idealB)/idealB;
    const chkM=Math.max(Math.abs(gmM2-gmM)/gmM,Math.abs(gmM3-gmM)/gmM);
    const ratio=gmB/gmM;
    let edge="";
    if(VOV<0.4){
      edge=say("邊界提醒：V<sub>OV</sub> = "+sfmt(VOV,6)+" V 太小會讓元件靠近次臨界區，<strong>平方律不再準確</strong>，真實的 g<sub>m</sub> 會比這裡算的高。");
    }else if(VOV>5){
      edge=say("邊界提醒：V<sub>OV</sub> = "+sfmt(VOV,6)+" V 在低壓製程根本擺不下，<strong>實務上 V<sub>OV</sub> 通常取 0.1–0.3 V</strong>。");
    }
    if(va<=30){
      edge=edge+say("邊界提醒：Early 電壓／通道長度調變愈嚴重，r<sub>o</sub> 與本徵增益就愈小，<strong>這是短通道製程做類比電路的痛</strong>。");
    }
    $('smallsig-output').innerHTML=
      say("<strong>BJT（混合 π 模型）</strong>"+((dev==='bjt')?"　←　你選的元件":""))+
      rows([
        "跨導 g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub> = "+sfmt(gmB*1e3,6)+" mA/V",
        "輸入電阻 r<sub>π</sub> = β/g<sub>m</sub> = "+ohms(rpiB),
        "輸出電阻 r<sub>o</sub> = V<sub>A</sub>/I<sub>C</sub> = "+ohms(roB),
        "本徵增益 g<sub>m</sub>r<sub>o</sub> = "+sfmt(A0B,6)
      ])+
      say("<strong>MOSFET（飽和區小訊號模型）</strong>"+((dev==='mos')?"　←　你選的元件":""))+
      rows([
        "超驅動電壓 V<sub>OV</sub> = √(2I<sub>D</sub>/k) = "+sfmt(VOV,6)+" V",
        "跨導 g<sub>m</sub> = √(2kI<sub>D</sub>) = "+sfmt(gmM*1e3,6)+" mA/V",
        "輸入電阻 = <strong>無限大（直流；高頻時閘極電容會讓它變有限）</strong>",
        "輸出電阻 r<sub>o</sub> = (1/λ)/I<sub>D</sub> = "+ohms(roM),
        "本徵增益 g<sub>m</sub>r<sub>o</sub> = "+sfmt(A0M,6)
      ])+
      say("模型自檢：BJT 的 g<sub>m</sub>r<sub>o</sub> 與 V<sub>A</sub>/V<sub>T</sub> = "+sfmt(idealB,6)+" 的相對差 = "+expFmt(chkB,6)+"（判定 "+((chkB<1e-12)?"通過":"需注意")+"）。<strong>BJT 的本徵增益恆等於 V<sub>A</sub>/V<sub>T</sub>，與電流無關——這是 BJT 的招牌性質。</strong>")+
      say("MOSFET 的三種 g<sub>m</sub> 寫法：kV<sub>OV</sub> = "+sfmt(gmM2*1e3,6)+"、2I<sub>D</sub>/V<sub>OV</sub> = "+sfmt(gmM3*1e3,6)+"、√(2kI<sub>D</sub>) = "+sfmt(gmM*1e3,6)+" mA/V，最大相對差 = "+expFmt(chkM,6)+"（判定 "+((chkM<1e-12)?"通過":"需注意")+"）。<strong>三種寫法是同一件事，不同教科書挑不同的來寫。</strong>")+
      say("同樣的電流 "+sfmt(val('ss-i'),6)+" mA 下，<strong>BJT 的 g<sub>m</sub> 是 MOSFET 的 "+sfmt(ratio,6)+" 倍</strong>。")+
      say("為什麼：BJT 的 g<sub>m</sub> 正比於 I<sub>C</sub>，MOSFET 的只正比於 √I<sub>D</sub>——所以要靠加電流換增益，BJT 划算得多。")+
      edge;
  };
  ['ss-dev','ss-i','ss-beta','ss-va','ss-kn'].forEach(x=>on(x,'input',draw));
  draw();
}

// 11 單級放大器三大組態
function stage(){
  if(!$('st-topo'))return;
  const draw=()=>{
    const topo=sel('st-topo'),IC=val('st-ic')*1e-3,beta=val('st-beta'),rc=val('st-rc'),re=val('st-re');
    const gm=IC/VT,rpi=beta/gm,re0=rpi/(beta+1);
    const gmRE=gm*re;
    const ratio=(re>0)?(rc/re):null;
    if(topo==='cc'&&re===0){
      $('stage-output').innerHTML=
        rows([
          "跨導 g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub> = "+sfmt(gm*1e3,6)+" mA/V",
          "輸入電阻 r<sub>π</sub> = β/g<sub>m</sub> = "+ohms(rpi)
        ])+
        say("<strong>共集組態的輸出取自射極，R<sub>E</sub> = 0 就等於把輸出接地，這個電路沒有意義。請把 R<sub>E</sub> 拉離 0。</strong>")+
        say("為什麼：射隨器靠的是「射極電位跟著基極走」，把射極直接接地就沒有輸出節點可言。");
      return;
    }
    let Av,Rin,Rout,note;
    if(topo==='ce'){
      Av=-gm*rc/(1+gmRE);Rin=rpi+(beta+1)*re;Rout=rc;
      note="共射 CE：訊號從基極進、集極出，射極（經 R<sub>E</sub>）接地。";
    }else if(topo==='cc'){
      Av=(beta+1)*re/(rpi+(beta+1)*re);Rin=rpi+(beta+1)*re;Rout=par(re0,re);
      note="共集 CC（射隨器）：訊號從基極進、射極出，集極接電源（交流接地）。";
    }else{
      Av=gm*rc;Rin=re0;Rout=rc;
      note="共基 CB：訊號從射極進、集極出，基極接地。<strong>R<sub>E</sub> 滑桿在本模式不參與計算。</strong>";
    }
    const AvCE=-gm*rc/(1+gmRE),AvCB=gm*rc;
    let judge;
    if(topo==='ce'&&re===0){
      judge="<strong>無退化的共射</strong>：增益 −g<sub>m</sub>R<sub>C</sub> 最大，但它完全靠 g<sub>m</sub>，而 g<sub>m</sub> 隨電流與溫度變——增益不可靠，失真也大。";
    }else if(topo==='ce'&&gmRE>=10){
      const approx=-rc/re;
      judge="<strong>深度退化</strong>：g<sub>m</sub>R<sub>E</sub> = "+sfmt(gmRE,6)+" ≫ 1，增益已經幾乎等於 −R<sub>C</sub>/R<sub>E</sub> = "+sfmt(approx,6)+"（誤差 "+sfmt((Av-approx)/approx*100,6)+" %），只由兩顆電阻的比值決定。<strong>你用增益換到了穩定度與線性度，這就是負回授。</strong>";
    }else if(topo==='ce'){
      judge="<strong>淺退化的共射</strong>：g<sub>m</sub>R<sub>E</sub> = "+sfmt(gmRE,6)+" 還不夠大，增益仍然明顯依賴 g<sub>m</sub>，還沒換到完整的穩定度。";
    }else if(topo==='cc'){
      judge="<strong>射隨器</strong>：電壓增益小於 1（目前 "+sfmt(Av,6)+"），但輸出阻抗只有 "+ohms(Rout)+"，可以驅動很重的負載。<strong>它放大的是電流不是電壓。</strong>";
    }else{
      judge="<strong>共基</strong>：增益與同條件的共射一樣大但同相；輸入阻抗只有 "+ohms(Rin)+"（是共射 r<sub>π</sub> = "+ohms(rpi)+" 的 1/(β+1)），所以要用電流源驅動。它的好處在第 12 章——沒有米勒效應。";
    }
    let edge="";
    if(topo==='ce'&&Math.abs(Av)>3000){
      edge=say("邊界提醒：|A<sub>v</sub>| = "+sfmt(Math.abs(Av),6)+" 是理論值——實際上 r<sub>o</sub> 與負載會把它壓下來，而且這麼大的 I<sub>C</sub>R<sub>C</sub> 壓降（"+sfmt(IC*rc,6)+" V）早就把 Q 點推進飽和了。");
    }else if(topo==='ce'&&Math.abs(Av)<1){
      edge=say("邊界提醒：|A<sub>v</sub>| &lt; 1，<strong>退化過頭就不是放大器了</strong>，這時該考慮直接用射隨器。");
    }
    $('stage-output').innerHTML=
      say(note)+
      rows([
        "跨導 g<sub>m</sub> = "+sfmt(gm*1e3,6)+" mA/V",
        "輸入電阻 r<sub>π</sub> = "+sfmt(rpi,6)+" Ω",
        "電壓增益 A<sub>v</sub> = "+sfmt(Av,6)+"（|A<sub>v</sub>| = "+sfmt(dbv(Math.abs(Av)),6)+" dB）",
        "輸入阻抗 R<sub>in</sub> = "+sfmt(Rin,6)+" Ω",
        "輸出阻抗 R<sub>out</sub> = "+sfmt(Rout,6)+" Ω",
        "g<sub>m</sub>R<sub>E</sub> = "+sfmt(gmRE,6)+"、R<sub>C</sub>/R<sub>E</sub> = "+((ratio===null)?"（R<sub>E</sub> = 0，不適用）":sfmt(ratio,6))
      ])+
      say(judge)+
      ((topo==='ce'||topo==='cb')
        ? say("正負號對照：同樣的 g<sub>m</sub> 與 R<sub>C</sub> 下，共射 A<sub>v</sub> = "+sfmt(AvCE,6)+"（反相），共基 A<sub>v</sub> = "+sfmt(AvCB,6)+"（同相）。<strong>大小一樣，差別只在相位。</strong>")
        : "")+
      say("為什麼：三種組態的電壓增益量級都是 g<sub>m</sub> 乘上輸出端看到的電阻，差別在輸入端怎麼接、以及電流增益是誰。")+
      edge;
  };
  ['st-topo','st-ic','st-beta','st-rc','st-re'].forEach(x=>on(x,'input',draw));
  draw();
}

// 12 米勒效應與頻寬
function freq(){
  if(!$('fq-topo'))return;
  const draw=()=>{
    const topo=sel('fq-topo'),av=val('fq-av'),rs=val('fq-rs');
    const CGD=val('fq-cgd')*1e-12,CGS=val('fq-cgs')*1e-12;
    const mk=cm=>{const cin=CGS+cm;const fh=1/(2*Math.PI*rs*cin);return {cmil:cm,cin:cin,fH:fh,gbw:av*fh};};
    const ce=mk((1+av)*CGD),casc=mk(2*CGD);
    const gbwLimit=1/(2*Math.PI*rs*CGD);
    const boost=ce.cin/casc.cin;
    const cur=(topo==='ce')?ce:casc;
    let judge;
    if(cur.cmil>5*CGS){
      judge="<strong>米勒效應主導</strong>：跨接電容被放大 (1 + |A<sub>v</sub>|) 倍之後遠大於 C<sub>gs</sub>，頻寬幾乎完全由它決定。這時改善 C<sub>gs</sub> 沒用，要嘛降增益、要嘛換拓樸。";
    }else{
      judge="<strong>C<sub>gs</sub> 仍佔可觀比重</strong>：米勒效應還沒完全主導，降低訊號源阻抗 R<sub>s</sub> 是最直接的改善手段。";
    }
    let edge="";
    if(cur.fH<1000){
      edge=say("邊界提醒：高阻抗源 ＋ 大跨接電容 ＋ 高增益，三者相乘讓頻寬掉到 "+sfmt(cur.fH,6)+" Hz，比音訊還低——<strong>這就是為什麼高頻電路一定要低阻抗驅動</strong>。");
    }else if(rs<=200){
      edge=say("邊界提醒：<strong>降低源阻抗是最省事的補救</strong>，代價是前級要有驅動力（回頭看第 11 章的射隨器）。");
    }
    $('freq-output').innerHTML=
      say("<strong>共射／共源（米勒效應全開）</strong>"+((topo==='ce')?"　←　你選的拓樸":""))+
      rows([
        "米勒放大後的跨接電容 = (1 + |A<sub>v</sub>|)C<sub>gd</sub> = "+sfmt(ce.cmil*1e12,6)+" pF",
        "輸入總電容 C<sub>in</sub> = "+sfmt(ce.cin*1e12,6)+" pF",
        "高頻 −3 dB 點 f<sub>H</sub> = "+sfmt(ce.fH,6)+" Hz（＝ "+hzFmt(ce.fH)+"）",
        "增益—頻寬乘積 = "+sfmt(ce.gbw/1e6,6)+" MHz"
      ])+
      say("<strong>疊接 Cascode（米勒效應被壓掉）</strong>"+((topo==='cascode')?"　←　你選的拓樸":""))+
      rows([
        "下級增益被壓成約 −1，所以米勒倍數只有 2：跨接電容 = "+sfmt(casc.cmil*1e12,6)+" pF",
        "輸入總電容 C<sub>in</sub> = "+sfmt(casc.cin*1e12,6)+" pF",
        "高頻 −3 dB 點 f<sub>H</sub> = "+sfmt(casc.fH,6)+" Hz（＝ "+hzFmt(casc.fH)+"）",
        "增益—頻寬乘積 = "+sfmt(casc.gbw/1e6,6)+" MHz"
      ])+
      say("疊接相對共射的頻寬提升倍數 = "+sfmt(boost,6)+" 倍，<strong>而電壓增益完全沒變</strong>。")+
      say(judge)+
      say("GBW 的理論上限 1/(2πR<sub>s</sub>C<sub>gd</sub>) = "+sfmt(gbwLimit/1e6,6)+" MHz。<strong>共射的 GBW 永遠爬不過這條線；疊接可以，因為它根本不讓米勒效應發生。</strong>")+
      say("為什麼：跨接電容兩端的電壓是反向擺動的，所以它看到的擺幅是輸入的 (1 + |A<sub>v</sub>|) 倍，等效電容就被放大同樣倍數。")+
      edge;
  };
  ['fq-topo','fq-av','fq-rs','fq-cgd','fq-cgs'].forEach(x=>on(x,'input',draw));
  draw();
}

// 13 差動對、CMRR 與電流鏡
function diffpair(){
  if(!$('dp-itail'))return;
  const VA=100;
  const draw=()=>{
    const Itail=val('dp-itail')*1e-3,rc=val('dp-rc'),Roc=val('dp-roc')*1e3;
    const load=sel('dp-load'),vid=val('dp-vid')*1e-3;
    const IC=Itail/2,gm=IC/VT,ro=VA/IC;
    const RL=(load==='resistor')?rc:(ro/2);
    const Ad=gm*RL,Acm=RL/(2*Roc),CMRR=Ad/Acm;
    const vout=Ad*vid;
    const dIreal=Itail*Math.tanh(vid/(2*VT));
    const dIlin=gm*vid;
    const linErr=(val('dp-vid')===0)?0:((dIlin-dIreal)/dIreal);
    const chk=Math.abs(CMRR-2*gm*Roc)/CMRR;
    const RLalt=(load==='resistor')?(ro/2):rc;
    const AdAlt=gm*RLalt;
    const ae=Math.abs(linErr);
    let judge;
    if(val('dp-vid')===0){
      judge="<strong>零輸入零輸出，這是差動對的平衡點</strong>：兩邊各分走一半的尾電流，線性化誤差定義為 0 %。";
    }else if(ae<0.02){
      judge="<strong>小訊號成立</strong>：|v<sub>id</sub>| 遠小於 2V<sub>T</sub> = 51.704000 mV，tanh 幾乎就是直線。";
    }else if(ae<0.3){
      judge="<strong>開始壓縮</strong>：差動對的增益隨振幅下降，這是類比乘法器與限幅放大器故意利用的效應。";
    }else{
      judge="<strong>已進入切換模式</strong>：|v<sub>id</sub>| 超過 4V<sub>T</sub> = 103.407999 mV 之後電流幾乎全部倒向一邊，差動對變成比較器而不是放大器。";
    }
    let edge="";
    if(Math.abs(val('dp-vid'))>=100){
      edge=say("邊界提醒：v<sub>id</sub> 已到滑桿極限，真實 ΔI = "+sfmt(dIreal*1e3,6)+" mA 已逼近尾電流 "+sfmt(Itail*1e3,6)+" mA，線性預測 "+sfmt(dIlin*1e3,6)+" mA 完全失真。");
    }else if(val('dp-roc')<=10){
      edge=say("邊界提醒：<strong>用一顆電阻當尾電流源就是這個下場</strong>——R<sub>oc</sub> 只有 "+ohmFmt(Roc)+" 太小，共模訊號直接漏過去，CMRR 只剩 "+sfmt(dbv(CMRR),6)+" dB。");
    }else if(Math.abs(Ad)>5000){
      edge=say("邊界提醒：A<sub>d</sub> = "+sfmt(Ad,6)+" 是小訊號理論值，實際上這麼大的 I ⋅ R 壓降會把電晶體推出作用區。");
    }
    $('diffpair-output').innerHTML=
      rows([
        "每邊集極電流 I<sub>C</sub> = I<sub>tail</sub>/2 = "+sfmt(IC*1e3,6)+" mA",
        "每邊跨導 g<sub>m</sub> = "+sfmt(gm*1e3,6)+" mA/V",
        "有效負載阻抗 R<sub>L,eff</sub> = "+sfmt(RL,6)+" Ω（"+((load==='resistor')?"電阻負載 R<sub>C</sub>":"電流鏡主動負載 r<sub>o</sub>‖r<sub>o</sub>")+"）",
        "差模增益 A<sub>d</sub>（單端輸出）= "+sfmt(Ad,6)+"（"+sfmt(dbv(Ad),6)+" dB）",
        "共模增益 A<sub>cm</sub> = R<sub>L,eff</sub>/(2R<sub>oc</sub>) = "+sfmt(Acm,6)+"（"+sfmt(dbv(Acm),6)+" dB）",
        "共模拒斥比 CMRR = "+sfmt(CMRR,6)+"（"+sfmt(dbv(CMRR),6)+" dB）",
        "輸出電壓 v<sub>out</sub> = A<sub>d</sub>v<sub>id</sub> = "+sfmt(vout,6)+" V",
        "真實 ΔI = I<sub>tail</sub>tanh[v<sub>id</sub>/(2V<sub>T</sub>)] = "+sfmt(dIreal*1e3,6)+" mA",
        "線性預測 g<sub>m</sub>v<sub>id</sub> = "+sfmt(dIlin*1e3,6)+" mA（高估 "+sfmt(linErr*100,6)+" %）"
      ])+
      say("CMRR 自檢：|CMRR − 2g<sub>m</sub>R<sub>oc</sub>| / CMRR = "+expFmt(chk,6)+"（判定 "+((chk<1e-12)?"通過":"需注意")+"）。<strong>CMRR = 2g<sub>m</sub>R<sub>oc</sub>，負載阻抗在分子分母同時出現、完全約掉——想提高 CMRR 只能改善尾電流源，換負載電阻沒有用。</strong>")+
      say(judge)+
      say("換負載對照：切到"+((load==='resistor')?"電流鏡主動負載":"電阻負載")+"時 A<sub>d</sub> 會變成 "+sfmt(AdAlt,6)+"（"+sfmt(AdAlt/Ad,6)+" 倍），<strong>但 CMRR 一個 dB 都沒變</strong>。主動負載買到的是差模增益，不是更好的 CMRR。")+
      say("為什麼：共模訊號要動，就得讓尾電流源的電流改變；R<sub>oc</sub> 愈大它愈不肯改變，共模增益就愈小。")+
      edge;
  };
  ['dp-itail','dp-rc','dp-roc','dp-load','dp-vid'].forEach(x=>on(x,'input',draw));
  draw();
}

// 14 負回授與穩定性
function feedback(){
  if(!$('fb-a'))return;
  const draw=()=>{
    const adb=val('fb-a'),bf=val('fb-beta'),f1=val('fb-f1'),dist=val('fb-dist');
    if(!(bf>0)){
      $('feedback-output').innerHTML=say("回授比例 β<sub>f</sub> 必須大於 0，否則 1/β<sub>f</sub> 沒有定義（滑桿最小值是 0.001，正常操作不會走到這裡）。");
      return;
    }
    const A=Math.pow(10,adb/20);
    const L=A*bf;
    const Af=A/(1+L);
    const ideal=1/bf;
    const err=(Af-ideal)/ideal*100;
    const fH=f1*(1+L);
    const gbwOpen=A*f1,gbwClosed=Af*fH;
    const distClosed=dist/(1+L);
    const sens=50/(1+L);
    const gbwChk=Math.abs(gbwClosed-gbwOpen)/gbwOpen;
    let judge;
    if(L>=100){
      judge="<strong>深度負回授</strong>：Aβ<sub>f</sub> = "+sfmt(L,6)+" ≫ 1，閉迴路增益已經幾乎完全由 β<sub>f</sub> 決定（誤差只有 "+sfmt(err,6)+" %）。開迴路增益就算漂了一半，閉迴路也只漂 "+sfmt(sens,6)+" %。";
    }else if(L>=1){
      judge="<strong>回授量不足</strong>：A<sub>f</sub> ≈ 1/β<sub>f</sub> 的近似還有可觀誤差（"+sfmt(err,6)+" %），設計時不能直接用理想值。";
    }else{
      judge="<strong>幾乎沒有回授效果</strong>：迴路增益 "+sfmt(L,6)+" 小於 1，A<sub>f</sub> 仍然幾乎等於 A，回授的所有好處都拿不到。要嘛提高開迴路增益，要嘛加大 β<sub>f</sub>。";
    }
    let edge="";
    if(bf>=1){
      edge=say("邊界提醒：β<sub>f</sub> = 1 就是<strong>單位增益緩衝器（電壓隨耦器）</strong>，這是 op-amp 最常見也最容易振盪的接法，因為迴路增益最大。");
    }else if(L<1){
      edge=say("邊界提醒：開迴路增益 "+sfmt(adb,0)+" dB 配上這麼小的 β<sub>f</sub>，迴路增益連 1 都不到——這個電路只是「接了回授線」，並沒有回授的效果。");
    }
    $('feedback-output').innerHTML=
      rows([
        "開迴路增益 A = "+sfmt(A,6)+"（"+sfmt(adb,6)+" dB）",
        "迴路增益 Aβ<sub>f</sub> = "+sfmt(L,6),
        "閉迴路增益 A<sub>f</sub> = A / (1 + Aβ<sub>f</sub>) = "+sfmt(Af,6)+"（"+sfmt(dbv(Af),6)+" dB）",
        "理想值 1/β<sub>f</sub> = "+sfmt(ideal,6),
        "與理想值的誤差 = "+sfmt(err,6)+" %",
        "閉迴路 −3 dB 頻寬 f<sub>H</sub> = f<sub>1</sub>(1 + Aβ<sub>f</sub>) = "+sfmt(fH,6)+" Hz",
        "開迴路 GBW = "+sfmt(gbwOpen,6)+" Hz、閉迴路 GBW = "+sfmt(gbwClosed,6)+" Hz",
        "閉迴路失真 = "+sfmt(distClosed,6)+" %（開迴路 "+sfmt(dist,6)+" %）",
        "靈敏度：A 變 ±50 % 時 A<sub>f</sub> 只變 ±"+sfmt(sens,6)+" %"
      ])+
      say(judge)+
      say("GBW 守恆自檢：|閉迴路 GBW − 開迴路 GBW| / 開迴路 GBW = "+expFmt(gbwChk,6)+"（判定 "+((gbwChk<1e-9)?"通過":"需注意")+"）。<strong>增益—頻寬乘積完全沒變：回授把增益除以 (1 + Aβ<sub>f</sub>)，同時把頻寬乘以 (1 + Aβ<sub>f</sub>)，兩者相乘守恆。</strong>")+
      say("為什麼：回授把誤差、失真、增益漂移全部除以同一個 (1 + Aβ<sub>f</sub>)，這是同一個機制的不同表現。")+
      say("穩定性提醒：<strong>本互動只算單極點系統，它永遠穩定（相位最多轉 −90°）。</strong>真實放大器有多個極點，Aβ<sub>f</sub> 愈大、單位增益頻率愈高，相位裕度就愈危險——這是回授唯一的代價。")+
      edge;
  };
  ['fb-a','fb-beta','fb-f1','fb-dist'].forEach(x=>on(x,'input',draw));
  draw();
}

// 15 運算放大器與電子系統（振盪器／電源／資料轉換）
function syscap(){
  if(!$('sy-mode'))return;
  const IOUT=0.5,ETA_BUCK=0.9;
  const draw=()=>{
    const mode=sel('sy-mode');
    const L=val('sy-l')*1e-6,C=val('sy-c')*1e-12;
    const vin=val('sy-vin'),vout=val('sy-vout'),bits=val('sy-bits'),fs=val('sy-fs');
    // 振盪器
    const f0=1/(2*Math.PI*Math.sqrt(L*C));
    // 電源
    const Pout=vout*IOUT;
    const ldoOk=(vout<vin);
    const etaLdo=ldoOk?(vout/vin):null;
    const PinLdo=vin*IOUT;
    const PlossLdo=(vin-vout)*IOUT;
    const PinBuck=Pout/ETA_BUCK;
    const PlossBuck=PinBuck-Pout;
    const IinBuck=PinBuck/vin;
    const D=ldoOk?(vout/vin):null;
    // 資料轉換
    const levels=Math.pow(2,bits);
    const lsb=vout/levels;
    const snr=6.02*bits+1.76;
    const fmax=fs/2;
    let oscJudge;
    if(f0<1e5){
      oscJudge="<strong>音頻範圍</strong>：這個頻段用 RC 振盪器（Wien 橋、相移網路）更省成本，因為電感在低頻要做得很大。";
    }else if(f0<=1e8){
      oscJudge="<strong>射頻範圍</strong>：LC 振盪器（Colpitts、Hartley、Clapp）的主場。";
    }else{
      oscJudge="<strong>高頻</strong>：寄生電感電容已經與元件同量級，實務上要改用分布式共振腔或晶體諧波。";
    }
    let supJudge;
    if(!ldoOk){
      supJudge="<strong>這個組合 LDO 做不到</strong>：線性穩壓器只能降壓，輸出必須低於輸入（還要扣掉壓差）。要升壓得用 Boost。";
    }else if(etaLdo>=0.8){
      supJudge="<strong>壓差小，LDO 合理</strong>：效率 "+sfmt(etaLdo*100,6)+" %，而且雜訊比切換式低得多，適合射頻與類比電源。";
    }else{
      supJudge="<strong>壓差大，LDO 不划算</strong>：白白燒掉 "+sfmt(PlossLdo,6)+" W，是輸出功率 "+sfmt(Pout,6)+" W 的 "+sfmt(PlossLdo/Pout,6)+" 倍，散熱會是主要問題。改用 Buck。";
    }
    const oscBlock=
      rows([
        "諧振頻率 f<sub>0</sub> = 1/(2π√(LC)) = "+sfmt(f0,6)+" Hz（＝ "+hzFmt(f0)+"）",
        "L = "+sfmt(val('sy-l'),6)+" µH、C = "+sfmt(val('sy-c'),6)+" pF"
      ])+
      say(oscJudge)+
      say("為什麼：迴路相位在 LC 諧振頻率轉為 0°，滿足巴克豪森準則。<strong>要更穩的頻率就換晶體：石英的等效 Q 高達 10<sup>4</sup>–10<sup>6</sup>，共振點銳利到頻率幾乎不受外界影響。</strong>");
    const supBlock=
      rows([
        "輸出功率（I<sub>out</sub> 固定 "+sfmt(IOUT,1)+" A）= "+sfmt(Pout,6)+" W",
        "LDO 效率 η = V<sub>out</sub>/V<sub>in</sub> = "+(ldoOk?(sfmt(etaLdo*100,6)+" %"):"<strong>不適用（輸出不低於輸入）</strong>"),
        "LDO 輸入功率 = "+sfmt(PinLdo,6)+" W、損耗（發熱）= "+(ldoOk?(sfmt(PlossLdo,6)+" W"):"不適用"),
        "Buck 效率 = "+sfmt(ETA_BUCK*100,6)+" %、輸入功率 = "+sfmt(PinBuck,6)+" W、損耗 = "+sfmt(PlossBuck,6)+" W",
        "LDO 輸入平均電流 = "+sfmt(IOUT,6)+" A、Buck 輸入平均電流 = "+sfmt(IinBuck,6)+" A",
        "Buck 佔空比 D = V<sub>out</sub>/V<sub>in</sub> = "+((D===null)?"不適用（要升壓，改用 Boost）":sfmt(D,6))
      ])+
      say(supJudge)+
      say("為什麼：LDO 是串聯元件，進出電流相同，所以多出來的 (V<sub>in</sub> − V<sub>out</sub>)I<sub>out</sub> 全部變成熱；Buck 的開關要嘛全通要嘛全斷，兩種狀態都幾乎不耗功——<strong>這正是第 08 章 MOSFET 三極區與截止區的用法</strong>。");
    const convBlock=
      rows([
        "量化階數 2<sup>N</sup> = "+sfmt(levels,0),
        "量化階 LSB = V<sub>ref</sub>/2<sup>N</sup> = "+sfmt(lsb*1e6,6)+" µV",
        "理論 SNR = 6.02N + 1.76 = "+sfmt(snr,6)+" dB",
        "可重建的最高頻率 = f<sub>s</sub>/2 = "+sfmt(fmax,6)+" kHz"
      ])+
      say("<strong>SNR = 6.02N + 1.76 dB 是理論上限</strong>，真實 ADC 的有效位元 ENOB 一定更低，因為電路雜訊、時脈抖動與非線性都會吃掉解析度。訊號超過 "+sfmt(fmax,6)+" kHz 就會混疊，取樣前一定要放抗混疊濾波器。")+
      say("為什麼：量化誤差在 ±LSB/2 均勻分布、rms 為 LSB/√12，滿刻度弦波的 rms 是 (2<sup>N</sup>LSB/2)/√2，兩者相除取 20log<sub>10</sub> 就得到那條公式。");
    const oscSum="振盪器：f<sub>0</sub> = "+hzFmt(f0);
    const supSum="電源：LDO 效率 "+(ldoOk?(sfmt(etaLdo*100,6)+" %"):"不適用")+"、Buck 損耗 "+sfmt(PlossBuck,6)+" W";
    const convSum="資料轉換："+sfmt(bits,0)+" 位元、LSB "+sfmt(lsb*1e6,6)+" µV、SNR "+sfmt(snr,6)+" dB";
    let html;
    if(mode==='osc'){
      html=say("<strong>你選的主題：振盪器（LC 諧振頻率）</strong>")+oscBlock+rows([supSum,convSum]);
    }else if(mode==='supply'){
      html=say("<strong>你選的主題：電源（LDO vs 切換式）</strong>")+supBlock+rows([oscSum,convSum]);
    }else{
      html=say("<strong>你選的主題：資料轉換（ADC 解析度）</strong>")+convBlock+rows([oscSum,supSum]);
    }
    let edge="";
    if(!ldoOk){
      edge=say("邊界提醒：V<sub>out</sub> ≥ V<sub>in</sub>，<strong>LDO 效率一律顯示「不適用」而不是大於 100 % 的數字</strong>。");
    }
    if(bits>=24){
      edge=edge+say("邊界提醒：LSB = "+sfmt(lsb*1e6,6)+" µV 已經比室溫下一顆 1 kΩ 電阻的熱雜訊還小，<strong>實務上量不到</strong>。");
    }
    if(fs<=1){
      edge=edge+say("邊界提醒：取樣率只有 "+sfmt(fs,6)+" kHz，可重建頻寬上限 "+sfmt(fmax,6)+" kHz。<strong>這是取樣定理不是工程經驗。</strong>");
    }
    $('syscap-output').innerHTML=html+edge;
  };
  ['sy-mode','sy-l','sy-c','sy-vin','sy-vout','sy-bits','sy-fs'].forEach(x=>on(x,'input',draw));
  draw();
}

// ---------------------------------------------------------------------------
// 5. 名詞與概念字典的搜尋過濾
// ---------------------------------------------------------------------------
function dictionary(){
  if(!$('term-search'))return;
  const cards=document.querySelectorAll('.term-card');
  const draw=()=>{
    const qs=String($('term-search').value).trim().toLocaleLowerCase('zh-Hant');
    let hit=0;
    for(let i=0;i<cards.length;i++){
      const card=cards[i];
      const hay=(card.textContent+' '+(card.dataset.search||'')).toLocaleLowerCase('zh-Hant');
      const show=(qs==='')||(hay.indexOf(qs)>=0);
      card.hidden=!show;
      if(show)hit=hit+1;
    }
    if($('term-count'))$('term-count').textContent='顯示 '+hit+' 個條目';
  };
  on('term-search','input',draw);
  draw();
}

// ---------------------------------------------------------------------------
// 6. 自我檢核（48 題；答案的單一事實來源）
// ---------------------------------------------------------------------------
function selfcheck(){
  if(!$('quiz-reset'))return;
  const R={
    '00':['00-電子學世界觀.html','00 電子學世界觀'],
    '01':['01-半導體與載子.html','01 半導體與載子'],
    '02':['02-PN接面與二極體方程.html','02 PN 接面與二極體方程'],
    '03':['03-二極體工作點與模型.html','03 二極體工作點與模型'],
    '04':['04-整流與濾波.html','04 整流與濾波'],
    '05':['05-穩壓限幅與特殊二極體.html','05 穩壓、限幅與特殊二極體'],
    '06':['06-BJT原理與工作區.html','06 BJT 原理與工作區'],
    '07':['07-BJT偏壓與Q點.html','07 BJT 偏壓與 Q 點'],
    '08':['08-MOSFET原理與三個工作區.html','08 MOSFET 原理與三個工作區'],
    '09':['09-CMOS反相器與數位功耗.html','09 CMOS 反相器與數位功耗'],
    '10':['10-小訊號模型.html','10 小訊號模型'],
    '11':['11-單級放大器三大組態.html','11 單級放大器三大組態'],
    '12':['12-米勒效應與頻寬.html','12 米勒效應與頻寬'],
    '13':['13-差動對與電流鏡.html','13 差動對與電流鏡'],
    '14':['14-回授與穩定性.html','14 回授與穩定性'],
    '15':['15-運算放大器與電子系統.html','15 運算放大器與電子系統']
  };
  const mk=(t,ans,tol,why,fix,ch)=>({t:t,ans:ans,tol:tol,why:why,fix:fix,ref:R[ch][0],refName:R[ch][1]});
  const Q={
    'q00-1':mk('sel','a',0,
      '小訊號線性化就是泰勒展開只留一次項，二次項與一次項的比值是 ΔV/(2V<sub>T</sub>)，所以條件是振幅遠小於 V<sub>T</sub> = 25.851999786 mV。',
      '常見的誤會是把條件放在電流或頻率上。工作點電流只決定 g 的大小，不決定「切線像不像曲線」；頻率則完全是另一件事。','00'),
    'q00-2':mk('num',0.574755,0.005,
      'I<sub>D</sub> = I<sub>S</sub>{exp[0.7 / V<sub>T</sub>] − 1} = 1 × 10<sup>−15</sup> × (exp(27.0771) − 1) = 0.574755 mA。',
      '最常見的原因是把 V<sub>T</sub> 記成 26 mV 或把 I<sub>S</sub> 記成 10 fA；I<sub>S</sub> 差 10 倍電流就差 10 倍。','00'),
    'q00-3':mk('num',44.979198,0.05,
      'g = (I + I<sub>S</sub>)/V<sub>T</sub> = 22.232499 mA/V，r<sub>d</sub> = 1/g = 44.979198 Ω。',
      '如果你算出 1217.917 Ω，那是直流電阻 V/I，不是小訊號電阻。兩者在同一個工作點差了 27 倍。','00'),
    'q01-1':mk('sel','a',0,
      '熱平衡下 np = n<sub>i</sub>² 恆成立。摻雜不是製造載子總量，是把天平壓向一邊：n 型的 n 上升、p 就被壓下去。',
      '若選「摻雜後 n = p」，那是本徵半導體才有的情況；n<sub>i</sub> 只跟材料與溫度有關，與摻雜濃度無關。','01'),
    'q01-2':mk('num',4,0.1,
      'p = n<sub>i</sub>²/N<sub>D</sub> = 2.25 × 10<sup>20</sup> / 10<sup>16</sup> = 2.25 × 10<sup>4</sup> cm<sup>−3</sup>，所以 x = 4。',
      '要記得 n<sub>i</sub>² = (1.5 × 10<sup>10</sup>)² = 2.25 × 10<sup>20</sup>，不是 1.5 × 10<sup>20</sup>。','01'),
    'q01-3':mk('num',0.462334,0.005,
      'σ = q(nµ<sub>n</sub> + pµ<sub>p</sub>) = 2.162938456 S/cm，ρ = 1/σ = 0.462334 Ω⋅cm。',
      '少數載子那一項幾乎沒有貢獻（2.25 × 10<sup>4</sup> × 480 相對 10<sup>16</sup> × 1350 可以忽略），但 q 與 µ<sub>n</sub> 不能記錯。','01'),
    'q02-1':mk('sel','b',0,
      '反偏時 exp 項趨近 0，I<sub>D</sub> → −I<sub>S</sub>。反向電流受限於少數載子的供應速率，不是受限於電場，所以與反向電壓幾乎無關。',
      '「恰好為零」是錯的：V<sub>D</sub> = 0 時電流才恰好是 0，反偏時是 −I<sub>S</sub>。實測值通常比 I<sub>S</sub> 大很多，那是表面漏電。','02'),
    'q02-2':mk('num',0.752879,0.005,
      'V<sub>0</sub> = V<sub>T</sub> ⋅ ln(N<sub>A</sub>N<sub>D</sub>/n<sub>i</sub>²) = 0.025851999786 × ln(4.4444 × 10<sup>12</sup>) = 0.752879 V。',
      '常見的原因是忘了 n<sub>i</sub> 要平方，或把 ln 寫成 log<sub>10</sub>（兩者差 2.302585093 倍）。','02'),
    'q02-3':mk('num',59.526429,0.5,
      'exp[ΔV/V<sub>T</sub>] = 10 ⇒ ΔV = V<sub>T</sub>ln10 = 25.851999786 × 2.302585093 = 59.526429 mV。',
      '這條「每 60 mV 十倍」的手指規則常被記成 60 mV，實驗室粗估可以，但本課一律用 59.526429 mV。','02'),
    'q03-1':mk('sel','b',0,
      '0.7 V 是毫安培級的經驗值。電流掉到微安培級時真實壓降只有 0.57 V 左右，恆壓降模型會嚴重低估電流，誤差可達 −29.701254 %。',
      '直覺上「電流小應該更準」是反的：指數曲線在低電流段的壓降變化才是最劇烈的。','03'),
    'q03-2':mk('num',4.3,0.01,
      '恆壓降模型把二極體換成 0.7 V 電壓源，I = (5 − 0.7)/1000 = 4.3 mA。',
      '若算成 5 mA，那是理想開關模型（V<sub>D</sub> = 0），它的誤差是 +16.077786 %。','03'),
    'q03-3':mk('num',0.692544,0.002,
      '牛頓法解 I<sub>S</sub>{exp[V<sub>D</sub>/V<sub>T</sub>] − 1} = (5 − V<sub>D</sub>)/1000，收斂到 V<sub>D</sub> = 0.692544 V、I<sub>D</sub> = 4.307456 mA。',
      '注意這裡 I<sub>S</sub> = 1 × 10<sup>−14</sup> A。用 0.7 V 猜一次不迭代會得到 0.7，離真值差 7.5 mV。','03'),
    'q04-1':mk('sel','b',0,
      '全波把負半週翻正，一個週期導通兩次，f<sub>eff</sub> = 2f；由 ΔV ≈ V<sub>pk</sub>/(f<sub>eff</sub>RC)，同一個電容漣波直接砍半。',
      '全波的輸出峰值其實比較低（橋式串兩顆二極體，壓降 1.4 V），所以「輸出峰值較高」是反的。','04'),
    'q04-2':mk('num',10.6,0.05,
      '橋式的電流路徑上永遠串著兩顆二極體，V<sub>pk</sub> = 12 − 2 × 0.7 = 10.6 V。',
      '若算成 11.3 V，那是半波（只串一顆）。這 0.7 V 的差別在低壓應用會吃掉大半個電壓預算。','04'),
    'q04-3':mk('num',0.187943,0.002,
      'ΔV = V<sub>pk</sub>/(f<sub>eff</sub>RC) = 10.6/(120 × 1000 × 470 × 10<sup>−6</sup>) = 0.187943 V。',
      '最常見的原因是 f<sub>eff</sub> 用了 60 Hz 而不是 120 Hz（全波要乘 2），這樣會算出兩倍的漣波。','04'),
    'q05-1':mk('sel','b',0,
      '負載太重時 R<sub>s</sub> 供應的電流全被負載拿走，齊納分不到電流就不會崩潰，電路退化成 R<sub>s</sub>–R<sub>L</sub> 分壓，輸出跟著輸入跑。',
      '燒毀是另一個方向的失效（輸入太高或負載太輕，齊納吃下全部電流）。兩種失效方向要分開記。','05'),
    'q05-2':mk('num',15.963830,0.05,
      'I<sub>L</sub> = 5.1/1000 = 5.1 mA，I<sub>s</sub> = (15 − 5.1)/470 = 21.063830 mA，I<sub>Z</sub> = I<sub>s</sub> − I<sub>L</sub> = 15.963830 mA。',
      '這是節點的 KCL：I<sub>s</sub> = I<sub>Z</sub> + I<sub>L</sub>。把 I<sub>s</sub> 直接當成齊納電流會高估 5.1 mA。','05'),
    'q05-3':mk('num',81.415532,0.5,
      'P<sub>Z</sub> = V<sub>Z</sub>I<sub>Z</sub> = 5.1 × 0.01596383 = 81.415532 mW，低於常見 250 mW 封裝的額定。',
      '功耗要用齊納自己的電流，不是 R<sub>s</sub> 的電流；用 21.063830 mA 會算成 107.4 mW。','05'),
    'q06-1':mk('sel','b',0,
      'BJT 的飽和是兩個接面都順偏、V<sub>CE</sub> 被鎖在約 0.2 V、I<sub>C</sub> 由外部電路決定的狀態，也就是開關全開。',
      '這是本課最大的用詞陷阱：MOSFET 的飽和區才是定電流的放大區，兩者意思相反。看到「飽和」先問是哪一種元件。','06'),
    'q06-2':mk('num',2,0.01,
      '作用區的 I<sub>C</sub> = βI<sub>B</sub> = 100 × 20 µA = 2 mA。先檢查 I<sub>B,sat</sub> = 118 µA，20 µA 遠低於它，所以確實在作用區。',
      '直接套 βI<sub>B</sub> 之前一定要先驗證沒有飽和；灌到 200 µA 時 I<sub>C</sub> 會被鎖在 11.8 mA，不是 20 mA。','06'),
    'q06-3':mk('num',10,0.05,
      'V<sub>CE</sub> = V<sub>CC</sub> − I<sub>C</sub>R<sub>C</sub> = 12 − 0.002 × 1000 = 10 V，遠離 0.2 V，作用區成立。',
      '若算出低於 0.2 V，就代表「在作用區」這個假設不成立，要改用飽和區的算法。','06'),
    'q07-1':mk('sel','a',0,
      'I<sub>B</sub> = (V<sub>TH</sub> − V<sub>BE</sub>)/[R<sub>TH</sub> + (β+1)R<sub>E</sub>]，當 (β+1)R<sub>E</sub> ≫ R<sub>TH</sub> 時 I<sub>C</sub> ≈ (V<sub>TH</sub> − V<sub>BE</sub>)/R<sub>E</sub>，β 從分子分母同時消失。',
      'β 其實非常不穩定（同型號不同顆可差 3 倍），V<sub>BE</sub> 也會隨溫度每度降約 2 mV，所以不能靠它們。','07'),
    'q07-2':mk('num',2.105263,0.005,
      'V<sub>TH</sub> = V<sub>CC</sub>R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = 12 × 10/57 = 2.105263 V。',
      '分壓是 R<sub>2</sub> 在分子（下分壓電阻對地）；分子放 R<sub>1</sub> 會得到 9.894737 V。','07'),
    'q07-3':mk('num',1.286334,0.005,
      'R<sub>TH</sub> = 8245.614035 Ω，I<sub>B</sub> = (2.105263 − 0.7)/(8245.614035 + 101 × 1000) = 12.863337 µA，I<sub>C</sub> = 100 × I<sub>B</sub> = 1.286334 mA。',
      '分母裡是 (β+1)R<sub>E</sub> 不是 βR<sub>E</sub>，而且不能漏掉 R<sub>TH</sub>；漏掉 R<sub>TH</sub> 會算成 1.391350 mA。','07'),
    'q08-1':mk('sel','b',0,
      'MOSFET 的飽和區是 V<sub>DS</sub> ≥ V<sub>OV</sub>、汲極端通道夾斷、電流幾乎不隨 V<sub>DS</sub> 變的定電流區，正是放大器要的。',
      '要當開關用的是三極區（全通）與截止區（全斷），不是飽和區。BJT 的飽和區才是開關全開。','08'),
    'q08-2':mk('num',275,1,
      'V<sub>OV</sub> = 1 V，V<sub>DS</sub> = 5 ≥ V<sub>OV</sub> 所以在飽和區：I<sub>D</sub> = (1/2)kV<sub>OV</sub>²(1 + λV<sub>DS</sub>) = 0.5 × 500 × 1 × 1.1 = 275 µA。',
      '漏掉 (1 + λV<sub>DS</sub>) 會得到 250 µA；λ 這一項在這個工作點就多了 10 %。','08'),
    'q08-3':mk('num',181818.181818,100,
      'r<sub>o</sub> = 1/(λI<sub>D</sub>) = 1/(0.02 × 275 × 10<sup>−6</sup>) = 181818.181818 Ω。',
      'I<sub>D</sub> 要用含 λ 修正後的 275 µA；用 250 µA 會得到 200000 Ω。','08'),
    'q09-1':mk('sel','a',0,
      'P = C<sub>L</sub>V<sub>DD</sub>²f，電壓進的是平方。V<sub>DD</sub> 從 3.3 V 降到 1.0 V，功耗降到 0.091827 倍，省了 90.817264 %。',
      '降頻只是線性關係；而漏電流不但不會消失，低壓製程還必須同步降 V<sub>th</sub>，漏電反而更嚴重。','09'),
    'q09-2':mk('num',1.65,0.01,
      'V<sub>M</sub> = [V<sub>th,n</sub> + √k<sub>r</sub>(V<sub>DD</sub> − |V<sub>th,p</sub>|)]/(1 + √k<sub>r</sub>) = (0.7 + 2.6)/2 = 1.65 V，恰好是 V<sub>DD</sub>/2。',
      '對稱（k<sub>r</sub> = 1 且兩門檻相等）時才等於 V<sub>DD</sub>/2；k<sub>r</sub> = 0.5 時是 1.487006 V。','09'),
    'q09-3':mk('num',21.78,0.1,
      'P = C<sub>L</sub>V<sub>DD</sub>²f = 20 × 10<sup>−15</sup> × 3.3² × 10<sup>8</sup> = 21.78 µW。',
      '單位換算最容易出錯：20 fF = 20 × 10<sup>−15</sup> F、100 MHz = 10<sup>8</sup> Hz。','09'),
    'q10-1':mk('sel','b',0,
      'g<sub>m</sub> = √(2kI<sub>D</sub>)，所以正比於 √I<sub>D</sub>。這也是為什麼靠加電流換增益，MOSFET 比 BJT 划不來。',
      '正比於電流的是 BJT：g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub>。兩者的差別是第 10 章對照表最重要的一行。','10'),
    'q10-2':mk('num',38.681727,0.05,
      'g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub> = 0.001/0.025851999786 = 38.681727 mA/V。',
      '把 V<sub>T</sub> 記成 26 mV 會得到 38.46 mA/V；本課固定用 25.851999786 mV。','10'),
    'q10-3':mk('num',2585.199979,5,
      'r<sub>π</sub> = β/g<sub>m</sub> = 100/0.038681727 = 2585.199979 Ω。',
      'r<sub>π</sub> 是小訊號輸入電阻，不是直流的 V<sub>BE</sub>/I<sub>B</sub>（後者約 70 kΩ，差很多）。','10'),
    'q11-1':mk('sel','b',0,
      '射隨器的 R<sub>out</sub> ≈ 1/g<sub>m</sub>（本例約 20–25 Ω），電壓增益接近 1 但電流增益很大，正好拿來當緩衝驅動重負載。',
      '大電壓增益要找共射；提高頻寬要找共基或疊接；射隨器也不反相。','11'),
    'q11-2':mk('num',193.408635,0.5,
      '|A<sub>v</sub>| = g<sub>m</sub>R<sub>C</sub> = 0.038681727 × 5000 = 193.408635（實際 A<sub>v</sub> = −193.408635，反相）。',
      '共射的電壓增益根本不含 β；若你把 β 乘進去就會差兩個數量級。','11'),
    'q11-3':mk('num',39.729206,0.1,
      '|A<sub>v</sub>| = g<sub>m</sub>R<sub>C</sub>/(1 + g<sub>m</sub>R<sub>E</sub>) = 193.408635/(1 + 3.8681727) = 39.729206。',
      '分母是 1 + g<sub>m</sub>R<sub>E</sub>，不能只寫 g<sub>m</sub>R<sub>E</sub>；此時 R<sub>C</sub>/R<sub>E</sub> = 50 還差得遠，要 g<sub>m</sub>R<sub>E</sub> ≫ 1 才趨近它。','11'),
    'q12-1':mk('sel','b',0,
      '疊接讓下級的負載變成上級的低輸入阻抗（約 1/g<sub>m</sub>），下級增益被壓成約 −1，米勒倍數從 (1 + 200) 掉到 2，C<sub>in</sub> 從 206 pF 變 7 pF。',
      '總增益完全沒變（仍由上級的集極負載決定），實體電容 C<sub>gd</sub> 也一點都沒變——變的只是它被放大的倍數。','12'),
    'q12-2':mk('num',206,0.5,
      'C<sub>in</sub> = C<sub>gs</sub> + (1 + |A<sub>v</sub>|)C<sub>gd</sub> = 5 + 201 × 1 = 206 pF。',
      '米勒倍數是 (1 + |A<sub>v</sub>|) = 201 不是 200，而且不能忘記加上 C<sub>gs</sub>。','12'),
    'q12-3':mk('num',386.298406,1,
      'f<sub>H</sub> = 1/(2πR<sub>s</sub>C<sub>in</sub>) = 1/(2π × 2000 × 206 × 10<sup>−12</sup>) = 386298.405563 Hz = 386.298406 kHz。',
      '題目要的是 kHz，別忘了除以 1000；另外 2π 不能寫成 π。','12'),
    'q13-1':mk('sel','b',0,
      'CMRR = |A<sub>d</sub>/A<sub>cm</sub>| = g<sub>m</sub>R<sub>L,eff</sub> / [R<sub>L,eff</sub>/(2R<sub>oc</sub>)] = 2g<sub>m</sub>R<sub>oc</sub>，負載完全約掉，兩種負載都是 85.729517 dB。',
      '主動負載買到的是 10 倍的差模增益（193.408635 → 1934.086354），不是更好的 CMRR。要提高 CMRR 只能改善尾電流源。','13'),
    'q13-2':mk('num',193.408635,0.5,
      '每邊電流是 I<sub>tail</sub>/2 = 0.5 mA，g<sub>m</sub> = 19.340864 mA/V，A<sub>d</sub>（單端）= g<sub>m</sub>R<sub>C</sub> = 193.408635。',
      '最常見的原因是用 I<sub>tail</sub> = 1 mA 去算 g<sub>m</sub>，那會得到兩倍的答案。','13'),
    'q13-3':mk('num',85.729517,0.1,
      'CMRR = 2g<sub>m</sub>R<sub>oc</sub> = 2 × 0.019340864 × 500000 = 19340.863536，20log<sub>10</sub> 後是 85.729517 dB。',
      'dB 要用 20log<sub>10</sub>（電壓比）不是 10log<sub>10</sub>；用後者會得到 42.86 dB。','13'),
    'q14-1':mk('sel','a',0,
      '多極點系統在高頻累積相位，轉到 −180° 時原本的負回授變成正回授；若此時 |Aβ<sub>f</sub>| 仍 ≥ 1，分母 1 + Aβ<sub>f</sub> 趨近 0，增益發散就是振盪。',
      '單極點系統相位最多轉 −90°，永遠穩定——所以射極退化不會振盪。振盪跟發熱、漏電無關。','14'),
    'q14-2':mk('num',99.900100,0.05,
      'A = 10<sup>5</sup>、Aβ<sub>f</sub> = 1000，A<sub>f</sub> = 100000/1001 = 99.900100，與理想值 100 差 −0.099900 %。',
      '分母是 1 + Aβ<sub>f</sub> = 1001 不是 1000；直接用 1/β<sub>f</sub> = 100 會漏掉那 0.0999 % 的誤差。','14'),
    'q14-3':mk('num',10010,10,
      'f<sub>H</sub> = f<sub>1</sub>(1 + Aβ<sub>f</sub>) = 10 × 1001 = 10010 Hz。閉迴路 GBW = 99.900100 × 10010 = 1000000 Hz，與開迴路完全相同。',
      '頻寬是乘以 (1 + Aβ<sub>f</sub>)、增益是除以它，兩者相乘守恆——這就是 GBW 不變。','14'),
    'q15-1':mk('sel','a',0,
      'SNR = 6.02N + 1.76 = 6.02 × 12 + 1.76 = 74 dB。這是量化雜訊的理論上限，真實 ADC 的 ENOB 一定更低。',
      '96 dB 對應的是 16 位元（98.08 dB 附近）；位元數與 SNR 是線性關係，不是無關。','15'),
    'q15-2':mk('num',1591549.430919,200,
      'f<sub>0</sub> = 1/(2π√(LC)) = 1/(2π√(100 × 10<sup>−6</sup> × 100 × 10<sup>−12</sup>)) = 1591549.430919 Hz。',
      '單位換算是主要陷阱：100 µH = 10<sup>−4</sup> H、100 pF = 10<sup>−10</sup> F，乘積是 10<sup>−14</sup>。','15'),
    'q15-3':mk('num',27.5,0.2,
      'LDO 是串聯元件，進出電流相同，所以 η = V<sub>out</sub>/V<sub>in</sub> = 3.3/12 = 27.5 %，其餘 4.35 W 全部變成熱。',
      'LDO 的效率跟負載電流無關，只看電壓比；壓差愈大愈不能用，這時要改 Buck（本例 90 %）。','15')
  };
  const ids=Object.keys(Q);
  const progress=()=>{
    const n=ids.filter(i=>$(i)&&String($(i).value).trim()!=='').length;
    if($('quiz-progress'))$('quiz-progress').textContent='已作答 '+n+' / '+ids.length+' 題（僅供參考，不影響瀏覽）';
  };
  const check=id=>{
    const el=$(id),out=$(id+'-output'),item=Q[id];
    if(!el||!out||!item)return;
    const raw=String(el.value).trim();
    const link=' <a href="'+item.ref+'">回去看：'+item.refName+'</a>';
    if(raw===''){
      out.innerHTML='<p>'+((item.t==='sel')?'先選一個選項，再按對答案。':'先填一個數字，再按對答案。')+'</p>';
      progress();return;
    }
    let ok;
    if(item.t==='sel'){ok=(raw===item.ans);}
    else{const v=Number(raw);ok=isFinite(v)&&(Math.abs(v-item.ans)<=item.tol);}
    if(ok){
      out.innerHTML='<p><strong>答對</strong>：'+item.why+link+'</p>';
    }else{
      const shown=(item.t==='sel')
        ? ('正確答案是選項 '+String(item.ans).toUpperCase())
        : ('正確答案是 '+sfmt(item.ans,6)+'（容許誤差 ±'+sfmt(item.tol,6)+'）');
      out.innerHTML='<p><strong>再看一次</strong>：'+shown+'。'+item.fix+' '+item.why+link+'</p>';
    }
    progress();
  };
  ids.forEach(id=>{on(id+'-check','click',()=>check(id));on(id,'input',progress);});
  on('quiz-reset','click',()=>{
    ids.forEach(id=>{if($(id))$(id).value='';if($(id+'-output'))$(id+'-output').innerHTML='';});
    progress();
  });
  progress();
}

// ---------------------------------------------------------------------------
// 7. 註冊
// ---------------------------------------------------------------------------
if(typeof document!=="undefined"){
  [nonlinear,carrier,pnjunc,dload,rect,zener,bjt,bjtbias,mosfet,cmos,smallsig,stage,freq,diffpair,feedback,syscap,dictionary,selfcheck].forEach(f=>f());
}

// ---------------------------------------------------------------------------
// 8. 匯出（供 node 語法檢查與人工交叉驗算）
// ---------------------------------------------------------------------------
if(typeof module!=="undefined")module.exports={
  VT:VT,QE:QE,NI:NI,MUN:MUN,MUP:MUP,
  fmt:fmt,sfmt:sfmt,clamp:clamp,par:par,dbv:dbv,expFmt:expFmt,ohmFmt:ohmFmt,guardInf:guardInf,hzFmt:hzFmt,
  nonlinear:nonlinear,carrier:carrier,pnjunc:pnjunc,dload:dload,rect:rect,zener:zener,
  bjt:bjt,bjtbias:bjtbias,mosfet:mosfet,cmos:cmos,smallsig:smallsig,stage:stage,
  freq:freq,diffpair:diffpair,feedback:feedback,syscap:syscap,
  dictionary:dictionary,selfcheck:selfcheck
};

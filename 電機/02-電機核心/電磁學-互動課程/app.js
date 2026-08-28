"use strict";
// 電磁學（零基礎互動課）互動邏輯：單一檔，所有頁面共用。
// 每個 widget 一個守衛函式，該頁沒有這個 widget 就直接跳出。
// 全檔不使用 Math.random、setTimeout 動畫、localStorage、fetch、document.write。

// ---------- 1. helper ----------
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const val=x=>Number($(x).value),pick=x=>$(x).value;
const fmt=(x,n=6)=>Number(x).toFixed(n),exp=(x,n=6)=>Number(x).toExponential(n);
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;

// 負號一律 U+2212
const neg=s=>String(s).replace(/-/g,"−");
// 指數格式：1.234560 × 10^-12 → HTML
function sci(x,n){
  if(n===undefined)n=6;
  if(!isFinite(x))return "∞";
  if(x===0)return "0.000000";
  const s=exp(x,n),i=s.indexOf("e"),m=s.slice(0,i),e=Number(s.slice(i+1));
  return neg(m)+" × 10<sup>"+neg(String(e))+"</sup>";
}
// 統一數字格式化：|x| 落在 [1e-4, 1e7) 用 6 位小數，否則用指數；零一律 0.000000
function num6(x){
  if(!isFinite(x))return "∞";
  const a=Math.abs(x);
  if(a===0)return "0.000000";
  if(a>=1e-4&&a<1e7)return neg(fmt(x,6));
  return sci(x,6);
}
const li=a=>"<ul>"+a.map(t=>"<li>"+t+"</li>").join("")+"</ul>";
const p=t=>"<p>"+t+"</p>";
const row=(k,v)=>"<li>"+k+"：<code>"+v+"</code></li>";

// ---------- 2. 物理常數（唯一定義處，與 PROJECT-BRIEF 第 7 節一致）----------
const EPS0=8.8541878128e-12;      // F/m
const MU0=4*Math.PI*1e-7;         // H/m
const C0=2.99792458e8;            // m/s
const KE=8.9875517923e9;          // N·m²/C²
const ETA0=376.730313564;         // Ω
const QE=1.602176634e-19;         // C
const MP=1.67262192369e-27;       // kg
const NP2DB=8.685889638;          // 1 Np = 8.685890 dB
const BEARTH=50e-6;               // 地磁量級 50 µT

// ---------- 3. 每章一個守衛函式（純計算與 DOM 分離，CALC 供離線交叉驗算）----------
const CALC={};

// ===== 00 emscale =====
CALC.emscale=function(fMHz,d,er){
  const v=C0/Math.sqrt(er),lam=v/(fMHz*1e6),ratio=d/lam;
  return {v:v,lam:lam,ratio:ratio,phase:360*ratio,t:d/v};
};
function emscale(){
  if(!$("scl-f"))return;
  const draw=()=>{
    const f=val("scl-f"),d=val("scl-d"),er=val("scl-er");
    const r=CALC.emscale(f,d,er);
    let verdict,why;
    if(r.ratio<0.05){
      verdict="<strong>集總成立</strong>：整條路徑上的相位差只有 "+num6(r.phase)+"°，可以把每個元件當成一個點——這是電路學的地盤。";
    }else if(r.ratio<0.5){
      verdict="<strong>灰色地帶</strong>：相位差已到 18°–180°，走線長度開始改變結果，要開始考慮等長與阻抗控制。";
    }else{
      verdict="<strong>分布效應</strong>：結構尺寸已經和半個波長同量級，必須用場與傳輸線描述——這就是本課第 13–15 章。";
    }
    why="λ = v/f，頻率愈高、介質 ε<sub>r</sub> 愈大，波長就愈短，同一塊板子愈容易踩出分布效應。";
    const edge=[];
    if(f<=1)edge.push("f = 1 MHz：λ = 299.792458 m，幾乎任何實驗室尺寸的東西在這裡都是集總。");
    if(f>=6000&&er>=12-1e-9)edge.push("f = 6000 MHz 配 ε<sub>r</sub> = 12：λ = 0.014425 m，只要 d ≥ 0.01 m 就已經 d/λ > 0.5。");
    if(er>=12-1e-9)edge.push("高介電常數材料會把波長壓縮 √ε<sub>r</sub> 倍，這就是陶瓷天線可以做很小的原因。");
    $("emscale-output").innerHTML=
      "<ul>"+
      row("相速 v","<span>"+sci(r.v)+" m/s</span>")+
      row("波長 λ",num6(r.lam)+" m")+
      row("尺寸比 d/λ",num6(r.ratio))+
      row("跨過整個結構的相位差",num6(r.phase)+" °")+
      row("傳播時間 t = d/v",sci(r.t)+" s")+
      "</ul>"+p(verdict)+p(why)+
      p("量級對照：2.4 GHz 在真空的波長是 0.124914 m，大約一個手掌長。")+
      (edge.length?li(edge):"");
  };
  ["scl-f","scl-d","scl-er"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 01 vecfield =====
CALC.vecfield=function(a,w,b,r){
  const div=2*a+b,curlz=2*w;
  const vol=(4/3)*Math.PI*r*r*r,area=Math.PI*r*r;
  return {div:div,curlz:curlz,vol:vol,area:area,flux:div*vol,circ:curlz*area};
};
function vecfield(){
  if(!$("vec-a"))return;
  const draw=()=>{
    const a=val("vec-a"),w=val("vec-w"),b=val("vec-b"),r=val("vec-r");
    const c=CALC.vecfield(a,w,b,r);
    const notes=[];
    if(c.div>0)notes.push("<strong>這裡是源</strong>：淨流出為正，像正電荷所在的位置。");
    else if(c.div<0)notes.push("<strong>這裡是匯</strong>：淨流入，像負電荷。");
    else notes.push("<strong>無源</strong>：進去多少出來多少。");
    if(c.curlz!==0)notes.push("這個場繞 z 軸有環流，右手大拇指指 "+(w>0?"+z":"−z")+"——像一條沿 z 軸流的電流在周圍造出的 <b>B</b>。");
    else notes.push("旋度為零：繞任何封閉路徑一圈的環流都是 0，這是無旋場。");
    notes.push("x 與 y 兩個旋度分量恆為 0（場的 x、y 分量都不含 z）。");
    if(a===0&&b===0&&w!==0)notes.push("<strong>純旋轉場</strong>：通量 0、環流不為 0，這是 ∇⋅<b>B</b> = 0 的原型。");
    if(w===0&&c.div!==0)notes.push("<strong>純徑向場</strong>：環流 0、通量不為 0，這是靜電場的原型。");
    if(a===0&&b===0&&w===0)notes.push("零場：兩邊都是 0，定理仍然成立，只是兩邊都沒東西。");
    if(c.flux<0)notes.push("負通量代表淨流入，不是算錯。");
    if(r<=0.5)notes.push("散度與旋度是<strong>每一點</strong>的性質，跟你畫多大的面無關；變的是通量與環流。");
    $("vecfield-output").innerHTML=
      "<ul>"+
      row("散度 ∇⋅<b>F</b> = 2a + b",num6(c.div)+" 1/s")+
      row("旋度 (∇×<b>F</b>)<sub>z</sub> = 2ω",num6(c.curlz)+" 1/s")+
      row("半徑 r 球體積",num6(c.vol)+" m³")+
      row("球面通量",num6(c.flux)+" m³/s")+
      row("圓面積",num6(c.area)+" m²")+
      row("圓周環流",num6(c.circ)+" m³/s²")+
      "</ul>"+
      p("通量 ÷ 體積 = "+num6(c.flux)+" ÷ "+num6(c.vol)+" = "+num6(c.div)+"（就是散度）；環流 ÷ 面積 = "+num6(c.circ)+" ÷ "+num6(c.area)+" = "+num6(c.curlz)+"（就是旋度）。這就是散度定理與史托克斯定理：微分性質乘上體積或面積，就是積分性質。")+
      li(notes);
  };
  ["vec-a","vec-w","vec-b","vec-r"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 02 coulomb =====
CALC.coulomb=function(q1nC,q2nC,rcm,er){
  const Q1=q1nC*1e-9,Q2=q2nC*1e-9,rSI=rcm*1e-2,half=rSI/2;
  const F=KE/er*Math.abs(Q1*Q2)/(rSI*rSI);
  const E1=KE/er*Q1/(half*half),E2=-KE/er*Q2/(half*half);
  return {F:F,E1:E1,E2:E2,Emid:E1+E2,Vmid:KE/er*(Q1+Q2)/half,rSI:rSI};
};
const dirTxt=x=>x>0?"指向 +x":(x<0?"指向 −x":"沒有方向（為零）");
function coulomb(){
  if(!$("cou-q1"))return;
  const draw=()=>{
    const q1=val("cou-q1"),q2=val("cou-q2"),r=val("cou-r"),er=val("cou-er");
    const c=CALC.coulomb(q1,q2,r,er);
    const notes=[];
    const prod=q1*q2;
    if(prod>0)notes.push("<strong>同號：互相排斥。</strong>");
    else if(prod<0)notes.push("<strong>異號：互相吸引。</strong>");
    else notes.push("其中一顆是零電荷，沒有力，但另一顆的場仍然存在。");
    notes.push("力隨 1/r² 掉，距離加倍力就剩 1/4；場也一樣，因為場就是力除以試驗電荷。");
    if(Math.abs(c.Emid)<1e-9&&Math.abs(c.Vmid)>1e-9)
      notes.push("<strong>中點電場為零但電位不為零</strong>：兩個場等大反向抵消了，但電位是純量相加，不會抵消。");
    if(Math.abs(c.Vmid)<1e-9&&Math.abs(c.Emid)>1e-9)
      notes.push("電位為零但電場不為零：q<sub>1</sub> = −q<sub>2</sub> 時中點電位剛好抵消，但兩個場同向相加。");
    notes.push("介質把力與場都除以 ε<sub>r</sub> = "+num6(er)+"，因為介質分子被極化後產生反向的場。");
    if(r<=1)notes.push("r = 1 cm 已經接近分子尺度，連續介質的 ε<sub>r</sub> 描述開始失真。");
    if(er>=12-1e-9)notes.push("力只剩 1/12：這就是為什麼電容器要塞高介電常數材料——同樣電壓能存更多電荷。");
    $("coulomb-output").innerHTML=
      "<ul>"+
      row("庫侖力大小 F",sci(c.F)+" N（"+(prod>0?"排斥":(prod<0?"吸引":"無力"))+"）")+
      row("q<sub>1</sub> 在中點的場 E<sub>1</sub>",num6(Math.abs(c.E1))+" V/m，"+dirTxt(c.E1))+
      row("q<sub>2</sub> 在中點的場 E<sub>2</sub>",num6(Math.abs(c.E2))+" V/m，"+dirTxt(c.E2))+
      row("中點合成電場 E",num6(Math.abs(c.Emid))+" V/m，"+dirTxt(c.Emid))+
      row("中點電位 V",num6(c.Vmid)+" V")+
      "</ul>"+li(notes);
  };
  ["cou-q1","cou-q2","cou-r","cou-er"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 03 gauss =====
CALC.gauss=function(shape,srcnC,rcm,er){
  const src=srcnC*1e-9,rSI=rcm*1e-2,eps=EPS0*er,flux=src/eps;
  let E,area,law,surf;
  if(shape==="line"){
    E=src/(2*Math.PI*eps*rSI);area=2*Math.PI*rSI*1;law="1/r";
    surf="半徑 r、長 1 m 的圓柱側面";
  }else if(shape==="plane"){
    E=src/(2*eps);area=2*1;law="常數";
    surf="面積 1 m² 的藥盒（兩個底面）";
  }else{
    E=src/(4*Math.PI*eps*rSI*rSI);area=4*Math.PI*rSI*rSI;law="1/r²";
    surf="半徑 r 的球面";
  }
  return {E:E,area:area,flux:flux,law:law,surf:surf,lhs:E*area,res:E*area-flux};
};
function gauss(){
  if(!$("gau-shape"))return;
  const draw=()=>{
    const shape=pick("gau-shape"),src=val("gau-src"),r=val("gau-r"),er=val("gau-er");
    const c=CALC.gauss(shape,src,r,er);
    const used=shape==="plane"
      ?"這個模式只用到<strong>源強度</strong>與 <strong>ε<sub>r</sub></strong> 兩個滑桿，距離滑桿不影響結果——這正是重點。"
      :"這個模式用到<strong>源強度</strong>、<strong>觀測距離 r</strong> 與 <strong>ε<sub>r</sub></strong> 三個滑桿。";
    const notes=[];
    if(shape==="sphere")notes.push("球對稱：面上 E 處處等大且垂直於面，所以積分變成一次乘法。這也證明了庫侖定律。");
    if(shape==="line")notes.push("柱對稱：兩個端面的 <b>E</b> 與 d<b>A</b> 垂直、貢獻為零，只剩側面。長度 L 兩邊都出現、自動消掉。");
    if(shape==="plane"){
      notes.push("面對稱：<strong>E 與距離完全無關</strong>。離得愈遠、看到的有效帶電面積愈大，兩個效應剛好抵消。");
      notes.push("所以平行板電容器內部的場是均勻的。");
    }
    notes.push(c.E>3e6
      ?"<strong>警告：E = "+num6(c.E)+" V/m 已超過空氣的介電強度約 3 × 10<sup>6</sup> V/m，真實裝置會打火。</strong>"
      :"量級對照：空氣的介電強度約 3 × 10<sup>6</sup> V/m，超過就會打火；目前的 E 還在安全側。");
    $("gauss-output").innerHTML=
      p("目前的高斯面："+c.surf+"。"+used)+
      "<ul>"+
      row("電場大小 E",num6(c.E)+" V/m")+
      row("高斯面面積",num6(c.area)+" m²")+
      row("E × 面積",num6(c.lhs))+
      row("Q<sub>內</sub>/ε",num6(c.flux)+" V⋅m")+
      row("兩邊殘差",sci(c.res))+
      row("衰減律",c.law)+
      "</ul>"+
      p("兩邊相等（殘差 "+sci(c.res)+"，絕對值 &lt; 1e−9）就是高斯定律本身：通量只由面內的電荷決定。")+
      li(notes);
  };
  ["gau-shape","gau-src","gau-r","gau-er"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 04 potential =====
CALC.potential=function(mode,qnC,rcm,dmm,thdeg){
  const Q=qnC*1e-9,rSI=rcm*1e-2,dSI=dmm*1e-3,th=rad(thdeg);
  if(mode==="dipole"){
    const pm=Q*dSI;
    const V=KE*pm*Math.cos(th)/(rSI*rSI);
    const Er=2*KE*pm*Math.cos(th)/(rSI*rSI*rSI);
    const Eth=KE*pm*Math.sin(th)/(rSI*rSI*rSI);
    return {mode:mode,p:pm,V:V,Er:Er,Eth:Eth,Emag:Math.hypot(Er,Eth),ratio:dSI/rSI};
  }
  const V=KE*Q/rSI;
  return {mode:mode,V:V,E:KE*Q/(rSI*rSI),W1nC:1e-9*V};
};
function potential(){
  if(!$("pot-mode"))return;
  const draw=()=>{
    const mode=pick("pot-mode"),q=val("pot-q"),r=val("pot-r"),d=val("pot-d"),th=val("pot-theta");
    const c=CALC.potential(mode,q,r,d,th);
    const notes=["<b>E</b> = −∇V 的負號代表場指向電位下降最快的方向；正電荷會自己往低電位滾。"];
    let head,body;
    if(mode==="dipole"){
      head="這個模式用到<strong>電荷量 Q</strong>、<strong>距離 r</strong>、<strong>偶極間距 d</strong> 與 <strong>夾角 θ</strong> 四個滑桿。";
      body="<ul>"+
        row("偶極矩 p = Qd",sci(c.p)+" C⋅m")+
        row("電位 V = kp cos θ/r²",num6(c.V)+" V")+
        row("徑向場 E<sub>r</sub> = 2kp cos θ/r³",num6(c.Er)+" V/m")+
        row("切向場 E<sub>θ</sub> = kp sin θ/r³",num6(c.Eth)+" V/m")+
        row("合成場 |<b>E</b>|",num6(c.Emag)+" V/m")+
        row("d/r",num6(c.ratio))+
        "</ul>";
      notes.unshift("V ∝ 1/r² 而 E ∝ 1/r³：偶極比點電荷掉得快，因為遠處看起來正負電荷幾乎抵消。");
      if(Math.abs(Math.cos(rad(th)))<1e-12)
        notes.unshift("<strong>赤道面：V = 0 但 E ≠ 0。</strong>兩個電荷到這裡等距，電位抵消；但兩個場的水平分量同向相加。V = 0 從來不代表 E = 0。");
      if(c.ratio>0.2)
        notes.push("<strong>遠場近似開始失效</strong>：d/r = "+num6(c.ratio)+" 已經不算小，真實電位會偏離這個值，請把 r 拉大或 d 縮小。");
      if(Math.cos(rad(th))<0)
        notes.push("負電位不是錯，代表這一側靠近負電荷。");
    }else{
      head="這個模式只用到<strong>電荷量 Q</strong> 與<strong>距離 r</strong> 兩個滑桿，偶極間距與夾角不影響結果。";
      body="<ul>"+
        row("電位 V = kQ/r",num6(c.V)+" V")+
        row("電場 E = kQ/r²",num6(c.E)+" V/m")+
        row("把 1 nC 從無窮遠搬過來的功",sci(c.W1nC)+" J")+
        "</ul>";
      notes.unshift("V ∝ 1/r 而 E ∝ 1/r²，所以 E = V/r 只在點電荷成立，不是通式。");
    }
    $("potential-output").innerHTML=p(head)+body+li(notes);
  };
  ["pot-mode","pot-q","pot-r","pot-d","pot-theta"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 05 dielectric =====
CALC.dielectric=function(er1,er2,thdeg,E1){
  const t1=rad(thdeg);
  const E1t=E1*Math.sin(t1),E1n=E1*Math.cos(t1);
  const D1n=EPS0*er1*E1n;
  const E2t=E1t,E2n=D1n/(EPS0*er2);
  const E2=Math.hypot(E2t,E2n),t2=Math.atan2(E2t,E2n);
  return {E1t:E1t,E1n:E1n,D1n:D1n,E2t:E2t,E2n:E2n,E2:E2,t2deg:deg(t2),
    P1:(er1-1)*EPS0*E1,P2:(er2-1)*EPS0*E2,
    resT:E1t-E2t,resN:EPS0*er1*E1n-EPS0*er2*E2n};
};
function dielectric(){
  if(!$("die-er1"))return;
  const draw=()=>{
    const er1=val("die-er1"),er2=val("die-er2"),th=val("die-theta"),e1=val("die-e1");
    const c=CALC.dielectric(er1,er2,th,e1);
    const notes=[];
    if(er2>er1)notes.push("場線往介質 2 躺平（θ<sub>2</sub> &gt; θ<sub>1</sub>）：高介電常數那一側，法向的 E 被壓縮成 1/ε<sub>r</sub>，切向沒變，所以合成向量更貼近界面。");
    else if(er2<er1)notes.push("場線往法線靠攏並變強。");
    else notes.push("同一種材料：沒有界面，θ<sub>2</sub> = θ<sub>1</sub>、|E<sub>2</sub>| = |E<sub>1</sub>|。");
    if(th===0)notes.push("<strong>垂直入射</strong>：切向分量為 0，只有法向被壓縮，<strong>方向不變、只變小</strong>。");
    if(th>=89)notes.push("掠射時場線幾乎平行界面，法向分量幾乎為零。");
    if(er2>=12-1e-9&&er1<=1+1e-9)notes.push("E<sub>2n</sub> 只剩 1/12，束縛電荷很大——這就是高 ε<sub>r</sub> 材料表面容易吸灰的原因之一。");
    notes.push("連續的是 E 的切向與 D 的法向，<strong>不是 E 的法向</strong>——這是本章唯一要背的東西。");
    $("dielectric-output").innerHTML=
      "<ul>"+
      row("E<sub>1t</sub>（切向）",num6(c.E1t)+" V/m")+
      row("E<sub>1n</sub>（法向）",num6(c.E1n)+" V/m")+
      row("D<sub>1n</sub>",sci(c.D1n)+" C/m²")+
      row("E<sub>2t</sub>（連續）",num6(c.E2t)+" V/m")+
      row("E<sub>2n</sub>",num6(c.E2n)+" V/m")+
      row("|E<sub>2</sub>|",num6(c.E2)+" V/m")+
      row("折射角 θ<sub>2</sub>",num6(c.t2deg)+" °")+
      row("介質 2 的極化 P<sub>2</sub>",sci(c.P2)+" C/m²")+
      "</ul>"+
      p("連續性殘差：切向 "+sci(c.resT)+"、法向 D "+sci(c.resN)+"（兩者絕對值都 &lt; 1e−15，邊界條件成立）。")+
      li(notes);
  };
  ["die-er1","die-er2","die-theta","die-e1"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 06 capacitor =====
CALC.capacitor=function(geom,areacm2,gapmm,amm,bmm,er,v){
  const eps=EPS0*er,aSI=amm*1e-3,bSI=bmm*1e-3;
  let C,E,vol=0,ok=true,note="";
  if(geom==="coax"||geom==="sphere"){
    if(bSI<=aSI){ok=false;note="外半徑要大於內半徑";}
  }
  if(!ok)return {ok:false,note:note};
  if(geom==="coax"){
    const L=Math.log(bSI/aSI);
    C=2*Math.PI*eps/L;E=v/(aSI*L);
  }else if(geom==="sphere"){
    C=4*Math.PI*eps*aSI*bSI/(bSI-aSI);E=v*bSI/(aSI*(bSI-aSI));
  }else{
    const A=areacm2*1e-4,d=gapmm*1e-3;
    C=eps*A/d;E=v/d;vol=A*d;
  }
  const Q=C*v,W=0.5*C*v*v,we=0.5*eps*E*E;
  return {ok:true,C:C,E:E,Q:Q,W:W,we:we,vol:vol,Wfield:we*vol,res:W-we*vol,eps:eps};
};
function capacitor(){
  if(!$("cap-geom"))return;
  const draw=()=>{
    const geom=pick("cap-geom");
    const c=CALC.capacitor(geom,val("cap-area"),val("cap-gap"),val("cap-a"),val("cap-b"),val("cap-er"),val("cap-v"));
    const used=geom==="parallel"
      ?"這個模式只用到<strong>板面積 A</strong>、<strong>板間距 d</strong>、<strong>ε<sub>r</sub></strong> 與<strong>電壓 V</strong>；內外半徑滑桿不影響結果。"
      :"這個模式只用到<strong>內半徑 a</strong>、<strong>外半徑 b</strong>、<strong>ε<sub>r</sub></strong> 與<strong>電壓 V</strong>；板面積與板間距滑桿不影響結果。";
    if(!c.ok){
      $("capacitor-output").innerHTML=p(used)+p("<strong>"+c.note+"</strong>：目前的內半徑不小於外半徑，這個幾何不存在，所以不計算。請把外半徑 b 拉大或內半徑 a 縮小。");
      return;
    }
    const unit=geom==="coax"?"pF/m":"pF";
    const notes=[];
    if(geom==="parallel")
      notes.push("W = (1/2)CV² = "+num6(c.W*1e9)+" nJ，w<sub>e</sub> × 體積 = "+num6(c.Wfield*1e9)+" nJ，殘差 "+sci(c.res)+"。兩邊相等就證明能量是存在場裡的，不是存在「那個零件」裡。");
    else
      notes.push("場不均勻，最大值在內導體表面，所以崩潰一定從那裡開始。");
    if(c.E>2e7)notes.push("<strong>E = "+num6(c.E)+" V/m：連 FR-4（約 2 × 10<sup>7</sup> V/m）都撐不住。</strong>");
    else if(c.E>3e6)notes.push("<strong>警告：已超過空氣的介電強度 3 × 10<sup>6</sup> V/m，真實裝置會打火。</strong>");
    notes.push("C 只跟幾何與材料有關，跟你加多少電壓無關；電壓只決定 Q 與 W。");
    notes.push("量級對照：一顆常見的 100 nF 陶瓷電容，等效 A/d 要比這個大一千倍以上——那是靠幾百層極薄陶瓷疊出來的。");
    $("capacitor-output").innerHTML=p(used)+
      "<ul>"+
      row("電容 C",num6(c.C*1e12)+" "+unit)+
      row("電荷 Q",num6(c.Q*1e9)+" nC")+
      row("儲能 W",num6(c.W*1e9)+" nJ")+
      row("最大場強 E<sub>max</sub>",num6(c.E)+" V/m")+
      row("能量密度 w<sub>e</sub>",num6(c.we)+" J/m³")+
      "</ul>"+li(notes);
  };
  ["cap-geom","cap-area","cap-gap","cap-a","cap-b","cap-er","cap-v"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 07 conduction =====
const RHO={copper:1.68e-8,aluminum:2.65e-8,iron:9.71e-8,seawater:0.2};
const MATNAME={copper:"銅",aluminum:"鋁",iron:"鐵",seawater:"海水"};
CALC.conduction=function(mat,i,areamm2,len){
  const rho=RHO[mat],ASI=areamm2*1e-6;
  const J=i/ASI,E=J*rho,V=E*len,R=rho*len/ASI,P=i*i*R,pd=J*E;
  return {rho:rho,J:J,E:E,V:V,R:R,P:P,pd:pd,tau:EPS0*rho,
    vd:J/(8.5e28*QE),vol:ASI*len,res:P-pd*ASI*len};
};
function conduction(){
  if(!$("con-mat"))return;
  const draw=()=>{
    const mat=pick("con-mat"),i=val("con-i"),area=val("con-area"),len=val("con-len");
    const c=CALC.conduction(mat,i,area,len);
    const notes=[];
    notes.push("P = I²R = "+num6(c.P)+" W，p × 體積 = "+num6(c.pd*c.vol)+" W，殘差 "+sci(c.res)+"。兩邊相等就證明 R 只是把場的性質積出來的結果。");
    notes.push("E 在導線裡小得可憐（毫伏／公尺等級），因為 σ 很大——σ 愈大，同樣的 J 只需要愈小的 E 就推得動。");
    if(c.J>5e6)notes.push("<strong>電流密度 "+sci(c.J)+" A/m² 已超過一般 PCB 走線與家用電線的建議值（約 2–5 A/mm²），會過熱。</strong>");
    if(c.J>=1e8)notes.push("<strong>這條線會在幾秒內熔斷。</strong>");
    if(mat==="copper")notes.push("電子漂移速度只有 "+sci(c.vd)+" m/s，燈卻立刻亮——亮燈的是場的傳播（接近光速），不是電子本身跑過去。");
    if(mat==="seawater")notes.push("<strong>海水不是導線材料</strong>：算出來的 R 與 P 荒謬到不可能發生，真實情況下這個電流根本建立不起來。這裡的用途只有一個——看 σ 差 7 個數量級會怎樣。");
    $("conduction-output").innerHTML=
      p("材料："+MATNAME[mat]+"，ρ = "+sci(c.rho)+" Ω⋅m。")+
      "<ul>"+
      row("電流密度 J = I/A",sci(c.J)+" A/m²")+
      row("導線內電場 E = Jρ",num6(c.E)+" V/m")+
      row("兩端電壓 V = Eℓ",num6(c.V)+" V")+
      row("電阻 R = ρℓ/A",num6(c.R)+" Ω")+
      row("功率 P = I²R",num6(c.P)+" W")+
      row("功率密度 p = JE",num6(c.pd)+" W/m³")+
      row("弛豫時間 τ = ε<sub>0</sub>ρ",sci(c.tau)+" s")+
      "</ul>"+li(notes);
  };
  ["con-mat","con-i","con-area","con-len"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 08 lorentz =====
CALC.lorentz=function(mode,b,angledeg,v6,i){
  const th=rad(angledeg),L=0.20;
  if(mode==="wire")return {mode:mode,F:b*i*L*Math.sin(th),L:L};
  const vSI=v6*1e6;
  const F=QE*vSI*b*Math.sin(th);
  const r=MP*vSI*Math.sin(th)/(QE*b);
  const fc=QE*b/(2*Math.PI*MP);
  return {mode:mode,F:F,r:r,fc:fc,T:1/fc,K:0.5*MP*vSI*vSI/QE,vSI:vSI};
};
function lorentz(){
  if(!$("lor-mode"))return;
  const draw=()=>{
    const mode=pick("lor-mode"),b=val("lor-b"),ang=val("lor-angle"),v=val("lor-v"),i=val("lor-i");
    const c=CALC.lorentz(mode,b,ang,v,i);
    const notes=["磁力對速度做的功是零：<b>F</b>⊥<b>v</b>，所以動能完全不變、只有方向在轉。"];
    if(ang===0)notes.push("θ = 0°：速度（或電流）與 <b>B</b> 平行，磁力為零，粒子直線前進。磁場只理會橫向的那一部分。沒有橫向分量就沒有圓周運動。");
    if(ang===90)notes.push("θ = 90°：全部速度都是橫向的，力最大，軌跡是完整的圓。");
    let head,body;
    if(mode==="wire"){
      head="這個模式只用到<strong>磁通密度 B</strong>、<strong>夾角 θ</strong> 與<strong>導線電流 I</strong>；粒子速率滑桿不影響結果。導線長度固定 0.20 m。";
      body="<ul>"+row("導線受力 F = BIL sin θ",num6(c.F)+" N")+"</ul>";
      notes.push("這就是馬達轉矩的源頭：把電流擺在磁場裡，導線就被推。");
    }else{
      head="這個模式只用到<strong>磁通密度 B</strong>、<strong>夾角 θ</strong> 與<strong>粒子速率 v</strong>；導線電流滑桿不影響結果。";
      body="<ul>"+
        row("磁力 F = qvB sin θ",sci(c.F)+" N")+
        row("迴旋半徑 r = mv<sub>⊥</sub>/(qB)",num6(c.r)+" m")+
        row("迴旋頻率 f<sub>c</sub> = qB/(2πm)",num6(c.fc/1e6)+" MHz")+
        row("週期 T = 1/f<sub>c</sub>",sci(c.T)+" s")+
        row("動能 K = (1/2)mv²",num6(c.K/1e3)+" keV")+
        "</ul>";
      if(ang>0&&ang<90)notes.push("真實軌跡是螺旋線：橫向分量畫圓、縱向分量等速前進。顯示的 r 是螺旋的半徑，只由橫向分量決定。");
      notes.push("f<sub>c</sub> 與 v 無關：粒子跑得快、圈也畫得大，剛好抵消——迴旋加速器就是靠這件事用固定頻率持續加速。");
      if(v>=3)notes.push("v/c = "+num6(100*c.vSI/C0)+" %，古典公式開始有誤差；超過 10 % 要用相對論質量。");
      if(c.r>1)notes.push("弱場下半徑大到裝置放不下，這就是為什麼加速器要用超導磁鐵。");
    }
    notes.push("量級對照：地磁 50 µT、冰箱磁鐵 5 mT、喇叭磁鐵 1 T、MRI 1.5–3 T。");
    $("lorentz-output").innerHTML=p(head)+body+li(notes);
  };
  ["lor-mode","lor-b","lor-angle","lor-v","lor-i"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 09 ampere =====
CALC.ampere=function(shape,i,rhocm,acm,zcm,ncmt){
  let B,m=null,path;
  if(shape==="loop"){
    const aSI=acm*1e-2,zSI=zcm*1e-2;
    B=MU0*i*aSI*aSI/(2*Math.pow(aSI*aSI+zSI*zSI,1.5));
    m=i*Math.PI*aSI*aSI;
    path="必須用畢歐—沙伐逐段積分（圓迴圈沒有可用的對稱性）";
  }else if(shape==="solenoid"){
    B=MU0*(ncmt*100)*i;
    path="橫跨管壁的長方形安培路徑";
  }else{
    B=MU0*i/(2*Math.PI*rhocm*1e-2);
    path="半徑 ρ 的同心圓安培路徑";
  }
  return {B:B,m:m,path:path,earthRatio:B/BEARTH};
};
const bUnit=B=>Math.abs(B)>=1?num6(B)+" T":(Math.abs(B)>=1e-3?num6(B*1e3)+" mT":num6(B*1e6)+" µT");
function ampere(){
  if(!$("amp-shape"))return;
  const draw=()=>{
    const shape=pick("amp-shape");
    const c=CALC.ampere(shape,val("amp-i"),val("amp-rho"),val("amp-a"),val("amp-z"),val("amp-n"));
    const used=shape==="wire"?"這個模式只用到<strong>電流 I</strong> 與<strong>距離 ρ</strong>；迴圈與螺線管的滑桿不影響結果。"
      :(shape==="loop"?"這個模式只用到<strong>電流 I</strong>、<strong>迴圈半徑 a</strong> 與<strong>軸向距離 z</strong>；距離 ρ 與匝密度滑桿不影響結果。"
      :"這個模式只用到<strong>電流 I</strong> 與<strong>匝密度 n</strong>；距離與半徑滑桿都不影響結果。");
    const notes=[];
    if(shape==="wire"){
      notes.push("B ∝ 1/ρ：距離加倍磁場減半。安培定律用得上，因為圓周上 B 處處等大且沿切向。");
      if(val("amp-rho")<=1)notes.push("這已經接近導線表面，真實導線有粗細，公式在導線內部要換成 B = µ<sub>0</sub>Iρ/(2πa²)。");
    }else if(shape==="loop"){
      notes.push("圓迴圈<strong>沒有</strong>能讓安培定律派上用場的對稱性，只能用畢歐—沙伐逐段積分。z = 0 時 B = µ<sub>0</sub>I/(2a)。");
      if(val("amp-z")>0)notes.push("離開中心後衰減得比 1/z² 還快，遠場趨近 1/z³ 的磁偶極律。");
    }else{
      notes.push("管內 B 與位置完全無關，這是唯一能做出均勻磁場的簡單結構；管外近似為零，所以螺線管自己就是屏蔽。");
      if(c.B>0.3)notes.push("這種電流需要主動散熱，實驗室螺線管會泡水冷。");
    }
    notes.push("量級對照：地磁約 50 µT，目前是它的 "+num6(c.earthRatio)+" 倍。");
    notes.push("右手大拇指指電流方向，四指彎曲的方向就是 <b>B</b> 繞行的方向。");
    $("ampere-output").innerHTML=
      p("目前的積分方式："+c.path+"。"+used)+
      "<ul>"+
      row("磁通密度 B",sci(c.B)+" T")+
      row("換算",bUnit(c.B))+
      row("與地磁（50 µT）的倍數",num6(c.earthRatio))+
      (c.m!==null?row("磁偶極矩 m = Iπa²",num6(c.m)+" A⋅m²"):"")+
      "</ul>"+li(notes);
  };
  ["amp-shape","amp-i","amp-rho","amp-a","amp-z","amp-n"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 10 magcircuit =====
CALC.magcircuit=function(mur,n,i,gapmm){
  const LC=0.30,AC=4e-4,g=gapmm*1e-3;
  const Rc=(LC-g)/(mur*MU0*AC);
  const Rg=g>0?g/(MU0*AC):0;
  const Rt=Rc+Rg;
  const F=n*i,Phi=F/Rt,B=Phi/AC;
  const L=n*n/Rt;
  return {LC:LC,AC:AC,g:g,Rc:Rc,Rg:Rg,Rt:Rt,F:F,Phi:Phi,B:B,
    Hc:B/(mur*MU0),Hg:g>0?B/MU0:0,L:L,L2:n*Phi/i,W:0.5*L*i*i,
    Wgap:g>0?0.5*B*B/MU0*AC*g:0,gapShare:Rg/Rt,res:L-n*Phi/i};
};
function magcircuit(){
  if(!$("mag-mur"))return;
  const draw=()=>{
    const mur=val("mag-mur"),n=val("mag-n"),i=val("mag-i"),gap=val("mag-gap");
    const c=CALC.magcircuit(mur,n,i,gap);
    const notes=[];
    notes.push("L = N²/R<sub>m</sub> = "+num6(c.L)+" H，L = NΦ/I = "+num6(c.L2)+" H，殘差 "+sci(c.res)+"。兩式相同就證明磁路類比是自洽的。");
    if(c.B<1.2)notes.push("<strong>線性區</strong>：µ<sub>r</sub> 大致是常數，磁路類比可信。");
    else if(c.B<1.5)notes.push("<strong>接近飽和</strong>：真實鐵心的 µ<sub>r</sub> 已經開始下降，算出來的值會偏高。");
    else notes.push("<strong>已超過矽鋼片約 1.5 T 的飽和點：真實鐵心到不了這個 B，µ<sub>r</sub> 會崩到只剩幾十，電感急遽下降、電流暴衝。這是電源與變壓器燒毀的典型路徑。</strong>");
    if(c.g>0){
      notes.push("氣隙只佔磁路長度的 "+num6(100*c.g/c.LC)+" %，卻佔了總磁阻的 "+num6(100*c.gapShare)+" %。因為 R<sub>m</sub> ∝ ℓ/µ，1 mm 空氣等效於 "+num6(mur)+" mm 的鐵心。");
      notes.push("能量幾乎全部存在氣隙裡（W<sub>氣隙</sub>/W = "+num6(c.W>0?100*c.Wgap/c.W:0)+" %）——這就是為什麼儲能電感一定要開氣隙。");
      if(c.gapShare>0.95)notes.push("氣隙佔總磁阻 95 % 以上，這已經不算磁路，比較像空心線圈。");
    }else{
      notes.push("沒有氣隙：磁阻全部在鐵心，電感最大，但也最容易飽和。");
    }
    if(mur<=100)notes.push("µ<sub>r</sub> = 100 是鐵氧體等級：高頻材料犧牲 µ<sub>r</sub> 換低損耗。");
    notes.push("本模型假設 µ<sub>r</sub> 是常數、磁通完全被鐵心導住、沒有磁滯——真實鐵心三條都會破。");
    $("magcircuit-output").innerHTML=
      p("固定幾何：平均磁路長 ℓ = 0.30 m、截面積 A = 4 cm²。")+
      "<ul>"+
      row("磁動勢 F<sub>m</sub> = NI",num6(c.F)+" A⋅匝")+
      row("鐵心磁阻 R<sub>m,鐵心</sub>",sci(c.Rc)+" A/Wb")+
      row("氣隙磁阻 R<sub>m,氣隙</sub>",sci(c.Rg)+" A/Wb")+
      row("氣隙佔總磁阻",num6(100*c.gapShare)+" %")+
      row("磁通 Φ",sci(c.Phi)+" Wb")+
      row("磁通密度 B",num6(c.B)+" T")+
      row("鐵心 H",num6(c.Hc)+" A/m")+
      row("氣隙 H",num6(c.Hg)+" A/m")+
      row("電感 L",num6(c.L)+" H")+
      row("儲能 W",num6(c.W)+" J")+
      "</ul>"+li(notes);
  };
  ["mag-mur","mag-n","mag-i","mag-gap"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 11 faraday =====
CALC.faraday=function(mode,b,l,v,r,n,f){
  if(mode==="varying"){
    const A=l*l,PhiMax=b*A,dPhi=PhiMax*2*Math.PI*f;
    const emfMax=n*dPhi;
    return {mode:mode,A:A,PhiMax:PhiMax,dPhi:dPhi,emfMax:emfMax,emfRms:emfMax/Math.SQRT2};
  }
  const emf=b*l*v,I=emf/r,F=b*I*l;
  return {mode:mode,emf:emf,I:I,F:F,Pmech:F*v,Pelec:emf*I,Pheat:I*I*r,
    res1:F*v-emf*I,res2:emf*I-I*I*r};
};
function faraday(){
  if(!$("far-mode"))return;
  const draw=()=>{
    const mode=pick("far-mode");
    const c=CALC.faraday(mode,val("far-b"),val("far-l"),val("far-v"),val("far-r"),val("far-n"),val("far-f"));
    const notes=[];
    let head,body;
    if(mode==="varying"){
      head="這個模式只用到<strong>峰值 B<sub>0</sub></strong>、<strong>線圈邊長 L</strong>、<strong>匝數 N</strong> 與<strong>頻率 f</strong>；棒速與迴路電阻滑桿不影響結果。";
      body="<ul>"+
        row("線圈面積 A = L²",num6(c.A)+" m²")+
        row("最大磁通 Φ<sub>max</sub> = B<sub>0</sub>A",sci(c.PhiMax)+" Wb")+
        row("磁通變化率峰值 dΦ/dt",num6(c.dPhi)+" Wb/s")+
        row("電動勢峰值 ε<sub>max</sub>",num6(c.emfMax)+" V")+
        row("有效值 ε<sub>rms</sub>",num6(c.emfRms)+" V")+
        "</ul>";
      notes.push("ε 與 f 成正比：同一個鐵心在 400 Hz 能做出 50 Hz 的 8 倍電壓，這就是開關電源與航空電源用高頻的原因。");
    }else{
      head="這個模式只用到<strong>磁通密度 B</strong>、<strong>導軌間距 L</strong>、<strong>棒速 v</strong> 與<strong>迴路電阻 R</strong>；匝數與頻率滑桿不影響結果。";
      body="<ul>"+
        row("感應電動勢 ε<sub>emf</sub> = BLv",num6(c.emf)+" V")+
        row("感應電流 I = ε<sub>emf</sub>/R",num6(c.I)+" A")+
        row("反抗力 F = BIL",num6(c.F)+" N")+
        row("機械功率 P = Fv",num6(c.Pmech)+" W")+
        row("電功率 P = ε<sub>emf</sub>I",num6(c.Pelec)+" W")+
        row("熱功率 P = I²R",num6(c.Pheat)+" W")+
        "</ul>";
      notes.push("三個功率的殘差是 "+sci(c.res1)+" 與 "+sci(c.res2)+"：完全相等。你推棒子花的力氣，一分不差變成電阻上的熱。這就是冷次定律的負號在守護的東西。");
      if(val("far-v")===0)notes.push("<strong>不動就不發電</strong>：磁通沒有變化，dΦ/dt = 0。磁場再強也沒用——<strong>變化才是源</strong>。");
      notes.push("反抗力 F = B²L²v/R 與速度成正比：你想推得愈快，它就頂得愈用力。發電機的「重」就是這樣來的。");
      if(c.I>10)notes.push("這種電流會讓導軌發燙，實驗室裝置要限流。");
    }
    notes.push("時變磁場讓 <b>E</b> 有旋（∇×<b>E</b> = −∂<b>B</b>/∂t），所以第 04 章的「電位」在這裡失效——繞一圈回來電位不會回到原值。");
    $("faraday-output").innerHTML=p(head)+body+li(notes);
  };
  ["far-mode","far-b","far-l","far-v","far-r","far-n","far-f"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 12 displacement =====
const DMAT={vacuum:[1,0],fr4:[4.4,0],water:[80,5.5e-6],seawater:[81,4]};
const DNAME={vacuum:"真空／空氣",fr4:"FR-4",water:"純水",seawater:"海水"};
CALC.displacement=function(mat,acm2,dmm,v,fexp){
  const er=DMAT[mat][0],sig=DMAT[mat][1];
  const f=Math.pow(10,fexp),w=2*Math.PI*f;
  const ASI=acm2*1e-4,dSI=dmm*1e-3,eps=EPS0*er;
  const C=eps*ASI/dSI,E0=v/dSI;
  const Jd=eps*E0*w,Id=Jd*ASI,Ic=sig*E0*ASI;
  const R=Math.sqrt(ASI/Math.PI);
  return {er:er,sig:sig,f:f,w:w,C:C,E0:E0,Jd:Jd,Id:Id,Ic:Ic,
    ratio:w*eps>0?sig/(w*eps):0,R:R,Bedge:MU0*Id/(2*Math.PI*R),
    Icomp:C*v*w,res:Id-C*v*w};
};
const aUnit=x=>Math.abs(x)>=1?num6(x)+" A":(Math.abs(x)>=1e-3?num6(x*1e3)+" mA":num6(x*1e6)+" µA");
function displacement(){
  if(!$("dsp-mat"))return;
  const draw=()=>{
    const mat=pick("dsp-mat");
    const c=CALC.displacement(mat,val("dsp-a"),val("dsp-d"),val("dsp-v"),val("dsp-fexp"));
    const notes=[];
    notes.push("場的算法 I<sub>d</sub> = εAωE<sub>0</sub> = "+aUnit(c.Id)+"，元件的算法 I = CV<sub>0</sub>ω = "+aUnit(c.Icomp)+"，殘差 "+sci(c.res)+"。兩邊完全相等——這就是位移電流不是硬湊出來的證據：板間沒有任何電荷在流，但「等效電流」剛好接上導線裡的電流。");
    if(c.ratio<0.01)notes.push("σ/(ωε) = "+sci(c.ratio)+"：<strong>位移電流主導，這個材料在這個頻率下是介質。</strong>");
    else if(c.ratio<=100)notes.push("σ/(ωε) = "+sci(c.ratio)+"：<strong>兩種電流同量級</strong>，既不算導體也不算介質，必須用完整的複數介電常數處理（第 14 章）。");
    else notes.push("σ/(ωε) = "+sci(c.ratio)+"：<strong>傳導電流主導，這個材料在這個頻率下是導體。</strong>");
    notes.push("板緣磁場 "+sci(c.Bedge)+" T，比地磁（50 µT）小 "+sci(BEARTH/c.Bedge)+" 倍——位移電流的磁場太小，從來不是被「量出來」的，是被方程式的自洽性逼出來的。");
    if(mat==="seawater"&&c.Ic>100)notes.push("<strong>算出的傳導電流荒謬到不可能</strong>：真實情況下電源根本無法在海水上維持這個電壓。這裡只用來看 σ/(ωε) 的量級。");
    if(c.E0>3e6)notes.push("<strong>E<sub>0</sub> 超過空氣介電強度 3 × 10<sup>6</sup> V/m，真實裝置會打火。</strong>");
    if(val("dsp-fexp")>=9)notes.push("1 GHz 下 1 mm 板間距對應的波長只有 0.3 m，這個尺寸已經不是集總電容，本模型只是為了看位移電流的量級。");
    $("displacement-output").innerHTML=
      p("材料："+DNAME[mat]+"（ε<sub>r</sub> = "+num6(c.er)+"、σ = "+sci(c.sig)+" S/m）。這個模式用到四個滑桿：板面積、板間距、電壓峰值與頻率指數。")+
      "<ul>"+
      row("頻率 f",sci(c.f)+" Hz")+
      row("電容 C",num6(c.C*1e12)+" pF")+
      row("場的峰值 E<sub>0</sub> = V<sub>0</sub>/d",num6(c.E0)+" V/m")+
      row("位移電流密度 J<sub>d</sub>",num6(c.Jd)+" A/m²")+
      row("位移電流 I<sub>d</sub>",aUnit(c.Id))+
      row("傳導電流 I<sub>c</sub>",aUnit(c.Ic))+
      row("損耗比 σ/(ωε)",sci(c.ratio))+
      row("板緣磁場 B",sci(c.Bedge)+" T")+
      "</ul>"+li(notes);
  };
  ["dsp-mat","dsp-a","dsp-d","dsp-v","dsp-fexp"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 13 planewave =====
CALC.planewave=function(fMHz,e0,er,mur){
  const n=Math.sqrt(er*mur),v=C0/n,lam=v/(fMHz*1e6);
  const eta=ETA0*Math.sqrt(mur/er),H0=e0/eta;
  return {n:n,v:v,lam:lam,k:2*Math.PI/lam,eta:eta,H0:H0,B0:e0/v,
    S:e0*e0/(2*eta),S2:e0*H0/2,T:1/(fMHz*1e6),res:e0*e0/(2*eta)-e0*H0/2};
};
function planewave(){
  if(!$("pwv-f"))return;
  const draw=()=>{
    const f=val("pwv-f"),e0=val("pwv-e0"),er=val("pwv-er"),mur=val("pwv-mur");
    const c=CALC.planewave(f,e0,er,mur);
    const notes=[];
    notes.push("⟨S⟩ = E<sub>0</sub>²/(2η) = "+sci(c.S)+"，⟨S⟩ = E<sub>0</sub>H<sub>0</sub>/2 = "+sci(c.S2)+"，殘差 "+sci(c.res)+"。兩式相同就是因為 η 的定義就是 E<sub>0</sub>/H<sub>0</sub>。");
    notes.push("<b>E</b>⊥<b>H</b>⊥傳播方向，三者構成右手系；<b>S</b> = <b>E</b>×<b>H</b> 指的就是能量往哪走。");
    notes.push("B<sub>0</sub> = "+sci(c.B0)+" T，比地磁 50 µT 小 "+sci(BEARTH/c.B0)+" 倍——電磁波的磁場分量小到日常儀器量不到，所以場強計都量 E。");
    if(er===1&&mur===1)notes.push("真空：η = 376.730314 Ω。常見的「120π = 376.991118 Ω」是把 c 取成 3 × 10<sup>8</sup> 的近似，差 0.069 %。");
    if(c.eta<ETA0)notes.push("η 比真空小：同樣的 E<sub>0</sub> 會伴隨更大的 H<sub>0</sub>，功率密度更高。");
    else if(c.eta>ETA0)notes.push("η 比真空大：同樣的 E<sub>0</sub> 只伴隨較小的 H<sub>0</sub>，功率密度更低。");
    if(c.n>10)notes.push("高 n 材料把波長壓縮成 1/"+num6(c.n)+"，這就是陶瓷天線與介質透鏡的原理。");
    if(f<=1)notes.push("λ = 299.792458 m：AM 廣播的波長是幾百公尺，所以天線只能做成 λ/4 甚至更短的一小段。");
    notes.push("量級對照：正午陽光約 1000 W/m²，目前是它的 "+sci(c.S/1000)+" 倍。");
    $("planewave-output").innerHTML=
      "<ul>"+
      row("折射率 n = √(ε<sub>r</sub>µ<sub>r</sub>)",num6(c.n))+
      row("相速 v = c/n",sci(c.v)+" m/s")+
      row("波長 λ = v/f",num6(c.lam)+" m")+
      row("波數 k = 2π/λ",num6(c.k)+" rad/m")+
      row("本質阻抗 η",num6(c.eta)+" Ω")+
      row("磁場振幅 H<sub>0</sub> = E<sub>0</sub>/η",sci(c.H0)+" A/m")+
      row("磁通密度振幅 B<sub>0</sub> = E<sub>0</sub>/v",sci(c.B0)+" T")+
      row("平均功率密度 ⟨S⟩",sci(c.S)+" W/m²")+
      row("週期 T = 1/f",sci(c.T)+" s")+
      "</ul>"+li(notes);
  };
  ["pwv-f","pwv-e0","pwv-er","pwv-mur"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 14 lossymedium =====
const LMAT={copper:[5.952380952e7,1],aluminum:[3.773584906e7,1],seawater:[4,81],water:[5.5e-6,80],fr4:[0,4.4]};
const LNAME={copper:"銅",aluminum:"鋁",seawater:"海水",water:"純水",fr4:"FR-4"};
CALC.lossymedium=function(mode,mat,fexp,thickum,angledeg){
  const sig=LMAT[mat][0],er=LMAT[mat][1];
  const f=Math.pow(10,fexp),w=2*Math.PI*f,eps=EPS0*er;
  const pp=sig/(w*eps),v=C0/Math.sqrt(er);
  const q=Math.atan(pp),u=Math.pow(1+pp*pp,0.25);
  const alpha=(w/v)*u*Math.sin(q/2),beta=(w/v)*u*Math.cos(q/2);
  const delta=alpha>0?1/alpha:Infinity;
  const etaMag=(ETA0/Math.sqrt(er))/u,etaAng=q/2;
  const etaRe=etaMag*Math.cos(etaAng),etaIm=etaMag*Math.sin(etaAng);
  const o={sig:sig,er:er,f:f,w:w,p:pp,v:v,q:q,u:u,alpha:alpha,beta:beta,delta:delta,
    etaMag:etaMag,etaAngDeg:deg(etaAng),etaRe:etaRe,etaIm:etaIm};
  if(mode==="skin"){
    const tSI=thickum*1e-6;
    o.tSI=tSI;o.np=alpha*tSI;o.db=alpha*tSI*NP2DB;
    o.approx=sig>0?Math.sqrt(2/(w*MU0*sig)):Infinity;
    o.approxErr=(sig>0&&isFinite(delta))?100*(o.approx-delta)/delta:0;
  }else{
    const den=(etaRe+ETA0)*(etaRe+ETA0)+etaIm*etaIm;
    const GRe=((etaRe*etaRe+etaIm*etaIm)-ETA0*ETA0)/den;
    const GIm=(2*ETA0*etaIm)/den;
    const Gmag=Math.hypot(GRe,GIm);
    o.GRe=GRe;o.GIm=GIm;o.Gmag=Gmag;
    o.Tmag=Math.hypot(1+GRe,GIm);
    o.RL=Gmag>1e-12?-20*Math.log10(Gmag):Infinity;
    o.vswr=Gmag<1?(1+Gmag)/(1-Gmag):Infinity;
    if(pp<0.01){
      const n2=Math.sqrt(er);
      o.n2=n2;
      o.th2=deg(Math.asin(Math.sin(rad(angledeg))/n2));
      o.thc=deg(Math.asin(1/n2));
      o.thB=deg(Math.atan(n2));
    }
  }
  return o;
};
function lossymedium(){
  if(!$("med-mode"))return;
  const draw=()=>{
    const mode=pick("med-mode"),mat=pick("med-mat");
    const c=CALC.lossymedium(mode,mat,val("med-fexp"),val("med-thick"),val("med-angle"));
    const used=mode==="skin"
      ?"這個模式用到<strong>材料</strong>、<strong>頻率指數</strong>與<strong>屏蔽厚度</strong>；入射角滑桿不影響結果。"
      :"這個模式用到<strong>材料</strong>、<strong>頻率指數</strong>與<strong>入射角</strong>；屏蔽厚度滑桿不影響結果。";
    const cls=c.p>100?"<strong>良導體</strong>：傳導電流完全主導，α ≈ β，波只在表面薄層存在。"
      :(c.p<0.01?"<strong>良介質</strong>：位移電流主導，衰減很小，波幾乎自由穿透。"
      :"<strong>中間地帶</strong>：兩者同量級，良導體與良介質的近似式都不能用，只能用完整的複數式（本互動用的就是完整式）。");
    const notes=[cls];
    let body;
    if(mode==="skin"){
      if(c.sig===0){
        body="<ul>"+
          row("損耗比 p = σ/(ωε)","0.000000")+
          row("衰減常數 α","0.000000 1/m")+
          row("相位常數 β",num6(c.beta)+" rad/m")+
          row("趨膚深度 δ","無限大（無損材料沒有趨膚效應）")+
          row("屏蔽衰減","0.000000 dB")+
          "</ul>";
        notes.push("σ = 0：α = 0，波不衰減，趨膚深度是無限大。理想無損材料沒有趨膚效應。");
      }else{
        body="<ul>"+
          row("損耗比 p = σ/(ωε)",sci(c.p))+
          row("衰減常數 α",num6(c.alpha)+" 1/m")+
          row("相位常數 β",num6(c.beta)+" rad/m")+
          row("趨膚深度 δ",sci(c.delta)+" m ＝ "+num6(c.delta*1e6)+" µm")+
          row("良導體近似 √(2/(ωµ<sub>0</sub>σ))",num6(c.approx*1e6)+" µm，相對誤差 "+num6(c.approxErr)+" %")+
          row("t/δ",num6(c.np)+" Np")+
          row("屏蔽衰減",num6(c.db)+" dB")+
          "</ul>";
        notes.push("p 愈大近似愈準；海水在 1 MHz 只差 0.06 %，但在 1 kHz 就差得多。目前的相對誤差是 "+num6(c.approxErr)+" %。");
      }
      notes.push("每走一個 δ，振幅剩 36.8 %、功率剩 13.5 %，換算 8.685890 dB。");
      if(mat==="copper"&&val("med-fexp")<=3)notes.push("低頻幾乎擋不住，磁屏蔽要改用高 µ<sub>r</sub> 材料（例如坡莫合金）而不是銅。");
    }else{
      let refr;
      if(c.p<0.01){
        refr="<ul>"+
          row("折射率 n<sub>2</sub>",num6(c.n2))+
          row("折射角 θ<sub>2</sub>",num6(c.th2)+" °")+
          row("反向的臨界角 θ<sub>c</sub>",num6(c.thc)+" °")+
          row("布魯斯特角 θ<sub>B</sub>",num6(c.thB)+" °")+
          "</ul>";
      }else{
        refr=p("這個材料在這個頻率損耗太大，折射角沒有實數意義，只給垂直入射的 Γ。");
      }
      body="<ul>"+
        row("|η<sub>2</sub>|",num6(c.etaMag)+" Ω")+
        row("∠η<sub>2</sub>",num6(c.etaAngDeg)+" °")+
        row("Γ 實部",num6(c.GRe))+
        row("Γ 虛部",num6(c.GIm))+
        row("|Γ|",num6(c.Gmag))+
        row("|T| = |1 + Γ|",num6(c.Tmag))+
        row("功率反射率 |Γ|²",num6(100*c.Gmag*c.Gmag)+" %")+
        row("回波損耗",isFinite(c.RL)?num6(c.RL)+" dB":"無限大（完全匹配）")+
        row("VSWR",isFinite(c.vswr)?num6(c.vswr):"∞（全反射）")+
        "</ul>"+refr;
      if(c.Gmag>0.99)notes.push("<strong>幾乎全反射</strong>：這就是金屬屏蔽的主力——<strong>反射損耗遠大於吸收損耗</strong>，波根本進不去。");
      if(c.GRe<0)notes.push("Γ 為負：反射波的相位翻轉 180°，因為波從高 η 進到低 η。");
    }
    $("lossymedium-output").innerHTML=
      p("材料："+LNAME[mat]+"（σ = "+sci(c.sig)+" S/m、ε<sub>r</sub> = "+num6(c.er)+"），f = "+sci(c.f)+" Hz。"+used)+
      body+li(notes);
  };
  ["med-mode","med-mat","med-fexp","med-thick","med-angle"].forEach(x=>on(x,"input",draw));
  draw();
}

// ===== 15 tline =====
CALC.tline=function(z0,rl,xl,lendeg){
  const den=(rl+z0)*(rl+z0)+xl*xl;
  const GRe=(rl*rl+xl*xl-z0*z0)/den,GIm=(2*z0*xl)/den;
  const Gmag=Math.hypot(GRe,GIm);
  const o={GRe:GRe,GIm:GIm,Gmag:Gmag,
    vswr:Gmag<1?(1+Gmag)/(1-Gmag):Infinity,
    RL:Gmag>1e-12?-20*Math.log10(Gmag):Infinity};
  const m=((lendeg%180)+180)%180;
  if(Math.abs(m-90)<1e-9){
    const mag2=rl*rl+xl*xl;
    if(mag2===0){o.open=true;o.ZinRe=Infinity;o.ZinIm=0;}
    else{o.open=false;o.ZinRe=z0*z0*rl/mag2;o.ZinIm=-z0*z0*xl/mag2;}
    o.quarter=true;
  }else{
    const t=Math.tan(rad(lendeg));
    const nr=rl,ni=xl+z0*t,dr=z0-xl*t,di=rl*t;
    const D=dr*dr+di*di;
    o.open=false;o.quarter=false;
    o.ZinRe=z0*(nr*dr+ni*di)/D;
    o.ZinIm=z0*(ni*dr-nr*di)/D;
  }
  o.half=Math.abs(m)<1e-9;
  return o;
};
function tline(){
  if(!$("tl-z0"))return;
  const draw=()=>{
    const z0=val("tl-z0"),rl=val("tl-rl"),xl=val("tl-xl"),len=val("tl-len");
    const c=CALC.tline(z0,rl,xl,len);
    const notes=[];
    if(c.Gmag<1e-9)notes.push("<strong>完全匹配</strong>：沒有反射，全部功率送進負載。VSWR = 1，回波損耗無限大。");
    else if(c.Gmag>=1-1e-12)notes.push("<strong>全反射</strong>：負載是短路、開路或純電抗，一點功率都進不去，線上是純駐波。");
    else notes.push("失配：|Γ|² = "+num6(100*c.Gmag*c.Gmag)+" % 的功率被反射回源端，"+num6(100*(1-c.Gmag*c.Gmag))+" % 進到負載。");
    if(c.half)notes.push("βℓ 是 180° 的整數倍（半波長的整數倍）：Z<sub>in</sub> 完全等於 Z<sub>L</sub>。半波長線是「阻抗複製器」。");
    if(c.quarter){
      notes.push("βℓ = 90°（λ/4）：Z<sub>in</sub> = Z<sub>0</sub>²/Z<sub>L</sub>。這就是 λ/4 轉換器，把大阻抗變小、小阻抗變大。");
      if(xl===0&&rl>0)notes.push("要匹配 R<sub>L</sub> = "+num6(rl)+" Ω 到 Z<sub>0</sub> = "+num6(z0)+" Ω，該用的轉換段阻抗是 √(Z<sub>0</sub>R<sub>L</sub>) = "+num6(Math.sqrt(z0*rl))+" Ω。");
      if(c.open)notes.push("短路線走過 λ/4 之後在輸入端看起來是<strong>開路</strong>——這是微波電路最常用的一招。");
    }
    if(rl===0&&xl===0&&!c.quarter&&!c.half)notes.push("一段短路線變成純電抗：Z<sub>in</sub> 只有虛部，這就是用線段做電感或電容的技巧。");
    if(Math.abs(xl)>0)notes.push("Γ 是複數：不只反射多少，還有反射回來的相位。");
    if(c.Gmag>0.9&&c.Gmag<1)notes.push("嚴重失配："+num6(100*c.Gmag*c.Gmag)+" % 的功率被打回去。");
    notes.push("|Γ| 只由 Z<sub>L</sub> 與 Z<sub>0</sub> 決定，<strong>不隨 βℓ 改變</strong>；改變的是 Z<sub>in</sub>。反射的量是固定的，你只是換了個位置看它。");
    notes.push("這條式子和第 14 章的界面反射一模一樣，只是 η 換成 Z<sub>0</sub>——傳輸線就是被導引起來的平面波。");
    const zinTxt=c.open?"開路（|Z<sub>in</sub>| → ∞）"
      :num6(c.ZinRe)+" "+(c.ZinIm<0?"−":"+")+" j"+num6(Math.abs(c.ZinIm))+" Ω";
    $("tline-output").innerHTML=
      "<ul>"+
      row("Γ 實部",num6(c.GRe))+
      row("Γ 虛部",num6(c.GIm))+
      row("|Γ|",num6(c.Gmag))+
      row("功率反射率 |Γ|²",num6(100*c.Gmag*c.Gmag)+" %")+
      row("功率透射率",num6(100*(1-c.Gmag*c.Gmag))+" %")+
      row("VSWR",isFinite(c.vswr)?num6(c.vswr):"∞（全反射）")+
      row("回波損耗",isFinite(c.RL)?num6(c.RL)+" dB":"無限大（完全匹配）")+
      row("輸入阻抗 Z<sub>in</sub>(ℓ)",zinTxt)+
      "</ul>"+li(notes);
  };
  ["tl-z0","tl-rl","tl-xl","tl-len"].forEach(x=>on(x,"input",draw));
  draw();
}

// ---------- 4. dictionary ----------
function dictionary(){
  if(!$("term-search"))return;
  const cards=document.querySelectorAll(".term-card");
  const draw=()=>{
    const qs=$("term-search").value.toLocaleLowerCase("zh-Hant").trim();
    let n=0;
    for(let i=0;i<cards.length;i++){
      const card=cards[i];
      const hay=(card.textContent+" "+(card.dataset.search||"")).toLocaleLowerCase("zh-Hant");
      const hit=qs===""||hay.indexOf(qs)>=0;
      card.hidden=!hit;
      if(hit)n++;
    }
    $("term-count").textContent="顯示 "+n+" 個條目";
  };
  on("term-search","input",draw);
  draw();
}

// ---------- 5. selfcheck ----------
function selfcheck(){
  if(!$("quiz-reset"))return;
  const R00="00-電磁世界觀.html",N00="00 電磁世界觀";
  const R01="01-向量場語言.html",N01="01 向量場語言";
  const R02="02-庫侖定律與電場.html",N02="02 庫侖定律與電場";
  const R03="03-高斯定律.html",N03="03 高斯定律";
  const R04="04-電位與電位梯度.html",N04="04 電位與電位梯度";
  const R05="05-介電質與邊界條件.html",N05="05 介電質與邊界條件";
  const R06="06-電容與電場儲能.html",N06="06 電容與電場儲能";
  const R07="07-電流密度與焦耳熱.html",N07="07 電流密度與焦耳熱";
  const R08="08-磁場與羅倫茲力.html",N08="08 磁場與羅倫茲力";
  const R09="09-畢歐沙伐與安培定律.html",N09="09 畢歐沙伐與安培定律";
  const R10="10-磁性材料與磁路.html",N10="10 磁性材料與磁路";
  const R11="11-電磁感應.html",N11="11 電磁感應";
  const R12="12-位移電流與馬克士威方程式.html",N12="12 位移電流與馬克士威方程式";
  const R13="13-電磁波與平面波.html",N13="13 電磁波與平面波";
  const R14="14-介質中的波與界面.html",N14="14 介質中的波與界面";
  const R15="15-傳輸線與駐波.html",N15="15 傳輸線與駐波";
  const Q={
    "q00-1":{t:"sel",ans:"a",why:"判準是尺寸與波長的比值 d/λ：d/λ &lt; 0.05 時整條路徑的相位差不到 18°，可以用集總電路；比值變大就要用場。",fix:"電壓、元件數量、電流大小都不決定該用哪個模型；決定的是幾何尺寸相對於波長有多大。",ref:R00,refName:N00},
    "q00-2":{t:"num",ans:2.997925,tol:0.01,why:"λ = v/f = 2.99792458 × 10<sup>8</sup> / 10<sup>8</sup> = 2.997925 m。",fix:"常見原因是把 100 MHz 當成 100 Hz，或忘了 M 是 10<sup>6</sup>。",ref:R00,refName:N00},
    "q00-3":{t:"num",ans:0.033356,tol:0.001,why:"d/λ = 0.1 / 2.997925 = 0.033356，遠小於 0.05，所以集總成立。",fix:"用 c ≈ 3 × 10<sup>8</sup> 會得到 0.033333，那是電路學 00 章的寫法；本課用精確 c。",ref:R00,refName:N00},
    "q01-1":{t:"num",ans:3,tol:0.01,why:"∇⋅<b>F</b> = ∂F<sub>x</sub>/∂x + ∂F<sub>y</sub>/∂y + ∂F<sub>z</sub>/∂z = a + a + b = 2 × 1 + 1 = 3 1/s。",fix:"ω 那兩項對散度沒有貢獻：−ωy 對 x 微分是 0、+ωx 對 y 微分也是 0。",ref:R01,refName:N01},
    "q01-2":{t:"num",ans:4,tol:0.01,why:"(∇×<b>F</b>)<sub>z</sub> = ∂F<sub>y</sub>/∂x − ∂F<sub>x</sub>/∂y = ω − (−ω) = 2ω = 4 1/s。",fix:"忘了第二項的負號會得到 2 而不是 4。",ref:R01,refName:N01},
    "q01-3":{t:"sel",ans:"b",why:"散度 0（無源）但旋度不為 0（有環流）正是靜磁場的特徵：∇⋅<b>B</b> = 0 且 ∇×<b>B</b> = µ<sub>0</sub><b>J</b>。",fix:"靜電場與重力場都是有源無旋；溫度場是純量場，談不上旋度。",ref:R01,refName:N01},
    "q02-1":{t:"num",ans:1.497925,tol:0.005,why:"F = k|q<sub>1</sub>q<sub>2</sub>|/r² = 8.9875517923 × 10<sup>9</sup> × 1.5 × 10<sup>−17</sup> / 0.09 = 1.497925 × 10<sup>−6</sup> N ＝ 1.497925 µN。",fix:"常見原因是忘了 nC 要乘 10<sup>−9</sup>，或把 0.30 m 沒有平方。",ref:R02,refName:N02},
    "q02-2":{t:"num",ans:3195.573971,tol:0.5,why:"兩個場在中點<strong>同方向</strong>（都由 q<sub>1</sub> 指向 q<sub>2</sub>），所以大小相加：1997.233732 + 1198.340239 = 3195.573971 V/m。",fix:"最常見的錯是把兩者相減。異號電荷在連線中點的場是相加的。",ref:R02,refName:N02},
    "q02-3":{t:"sel",ans:"a",why:"電場是向量、會互相抵消；電位是純量、只是相加。兩顆同號等量電荷的中點就是 E = 0 但 V ≠ 0。",fix:"E = 0 與 V = 0 沒有必然關係，兩者是「梯度」與「函數值」的關係。",ref:R02,refName:N02},
    "q03-1":{t:"num",ans:8987.551792,tol:0.5,why:"球對稱下 E × 4πr² = Q/ε<sub>0</sub>，得 E = kQ/r² = 8.9875517923 × 10<sup>9</sup> × 10<sup>−8</sup> / 0.01 = 8987.551792 V/m。",fix:"忘了 r 要平方，或把 10 cm 當成 10 m。",ref:R03,refName:N03},
    "q03-2":{t:"num",ans:1129.409067,tol:0.5,why:"Ψ = Q/ε<sub>0</sub> = 10<sup>−8</sup> / 8.8541878128 × 10<sup>−12</sup> = 1129.409067 V⋅m，<strong>與半徑完全無關</strong>。",fix:"通量只看面內的總電荷，不看你把球畫多大。",ref:R03,refName:N03},
    "q03-3":{t:"sel",ans:"c",why:"E = ρ<sub>s</sub>/(2ε<sub>0</sub>) 完全不含 r。離得愈遠、看到的有效帶電面積愈大，兩個效應剛好抵消。",fix:"1/r² 是點電荷、1/r 是無限長線，平面才是常數。",ref:R03,refName:N03},
    "q04-1":{t:"num",ans:898.755179,tol:0.05,why:"V = kQ/r = 8.9875517923 × 10<sup>9</sup> × 10<sup>−8</sup> / 0.10 = 898.755179 V（注意是 1/r 不是 1/r²）。",fix:"把 r 平方會得到 8987.551792，那是電場不是電位。",ref:R04,refName:N04},
    "q04-2":{t:"num",ans:89.875518,tol:0.05,why:"V = kp cos θ/r² = 8.9875517923 × 10<sup>9</sup> × 10<sup>−10</sup> × 1 / 0.01 = 89.875518 V。",fix:"偶極電位是 1/r²，比點電荷掉得快。",ref:R04,refName:N04},
    "q04-3":{t:"sel",ans:"b",why:"赤道面上兩個電荷等距，電位剛好抵消；但兩個場的水平分量同向相加，所以 E<sub>θ</sub> ≠ 0。",fix:"V = 0 只代表這個面上電位處處相同，不代表它的梯度為零。",ref:R04,refName:N04},
    "q05-1":{t:"num",ans:125,tol:0.5,why:"D 的法向連續：ε<sub>0</sub> × 1 × 500 = ε<sub>0</sub> × 4 × E<sub>2n</sub>，所以 E<sub>2n</sub> = 500/4 = 125 V/m。",fix:"連續的是 D 的法向不是 E 的法向；直接寫 E<sub>2n</sub> = 500 就錯了。",ref:R05,refName:N05},
    "q05-2":{t:"num",ans:875,tol:1,why:"|E<sub>2</sub>| = √(866.025404² + 125²) = √765625 = 875.000000 V/m。切向沒變、法向被壓縮成 1/4。",fix:"別把兩個分量直接相加，要平方和開根號。",ref:R05,refName:N05},
    "q05-3":{t:"sel",ans:"b",why:"E 的切向連續來自 ∮<b>E</b>⋅d<b>ℓ</b> = 0；D 的法向（無自由面電荷時）連續來自高斯定律。",fix:"四句話容易記混：連續的是 E 的切向與 D 的法向，另外兩個都不連續。",ref:R05,refName:N05},
    "q06-1":{t:"num",ans:88.541878,tol:0.05,why:"C = ε<sub>0</sub>ε<sub>r</sub>A/d = 8.8541878128 × 10<sup>−12</sup> × 0.01 / 0.001 = 8.8541878 × 10<sup>−11</sup> F ＝ 88.541878 pF。",fix:"100 cm² = 0.01 m²（乘 10<sup>−4</sup>）、1 mm = 0.001 m，兩個換算都容易錯。",ref:R06,refName:N06},
    "q06-2":{t:"num",ans:442.709391,tol:0.5,why:"W = (1/2)CV² = 0.5 × 8.8541878 × 10<sup>−11</sup> × 10000 = 4.42709391 × 10<sup>−7</sup> J ＝ 442.709391 nJ。",fix:"忘了 1/2，或忘了 V 要平方。",ref:R06,refName:N06},
    "q06-3":{t:"num",ans:100,tol:0.5,why:"平行板內是均勻場，E = V/d = 100 / 0.001 = 100000 V/m ＝ 100 kV/m，只有空氣崩潰值的 3.33 %。",fix:"題目要的單位是 kV/m，填 100000 會被判為不同的數。",ref:R06,refName:N06},
    "q07-1":{t:"num",ans:0.168,tol:0.001,why:"R = ρℓ/A = 1.68 × 10<sup>−8</sup> × 10 / 10<sup>−6</sup> = 0.168 Ω。這也等於 ℓ/(σA)。",fix:"1 mm² = 10<sup>−6</sup> m²，寫成 10<sup>−3</sup> 會差一千倍。",ref:R07,refName:N07},
    "q07-2":{t:"num",ans:0.0168,tol:0.0002,why:"E = Jρ = 10<sup>6</sup> × 1.68 × 10<sup>−8</sup> = 0.0168 V/m。導線內的場小得可憐，因為 σ 很大。",fix:"別把兩端電壓 0.168 V 當成場；場是每公尺的電壓。",ref:R07,refName:N07},
    "q07-3":{t:"sel",ans:"c",why:"建立電場的訊號沿導線以接近光速傳播，全線的電子幾乎同時開始動；電子自己每秒只爬 0.07 mm。",fix:"漂移速度與訊號速度差 12 個數量級，這是本章最容易混的一組。",ref:R07,refName:N07},
    "q08-1":{t:"num",ans:8.010883,tol:0.01,why:"F = qvB sin 90° = 1.602176634 × 10<sup>−19</sup> × 10<sup>6</sup> × 0.5 = 8.010883 × 10<sup>−14</sup> N。",fix:"題目的單位是 × 10<sup>−14</sup> N，只要填 8.010883。",ref:R08,refName:N08},
    "q08-2":{t:"num",ans:0.020879,tol:0.0005,why:"r = mv/(qB) = 1.67262192369 × 10<sup>−27</sup> × 10<sup>6</sup> / (1.602176634 × 10<sup>−19</sup> × 0.5) = 0.020879 m。",fix:"分母要同時放 q 與 B；只除 q 或只除 B 都會差好幾個數量級。",ref:R08,refName:N08},
    "q08-3":{t:"sel",ans:"b",why:"f<sub>c</sub> = qB/(2πm) 裡面沒有 v：跑得快、圈也畫得大，剛好抵消。迴旋加速器就是靠這件事。",fix:"半徑 r 與 v 成正比，但頻率不是——兩者不要混。",ref:R08,refName:N08},
    "q09-1":{t:"num",ans:40,tol:0.5,why:"B = µ<sub>0</sub>I/(2πρ) = 4π × 10<sup>−7</sup> × 10 / (2π × 0.05) = 4 × 10<sup>−5</sup> T ＝ 40 µT，和地磁同一個量級。",fix:"5 cm = 0.05 m；用 5 會差 100 倍。",ref:R09,refName:N09},
    "q09-2":{t:"num",ans:125.663706,tol:0.5,why:"軸心 z = 0 時 B = µ<sub>0</sub>I/(2a) = 4π × 10<sup>−7</sup> × 10 / 0.1 = 1.256637 × 10<sup>−4</sup> T ＝ 125.663706 µT。",fix:"迴圈的公式分母是 2a 不是 2πa，這一點和直導線不同。",ref:R09,refName:N09},
    "q09-3":{t:"num",ans:12.566371,tol:0.05,why:"B = µ<sub>0</sub>nI，n = 10 匝/cm = 1000 匝/m，所以 B = 4π × 10<sup>−7</sup> × 1000 × 10 = 1.256637 × 10<sup>−2</sup> T ＝ 12.566371 mT。",fix:"匝/cm 要乘 100 才是匝/m，忘了會差 100 倍。",ref:R09,refName:N09},
    "q10-1":{t:"num",ans:2.984155,tol:0.005,why:"R<sub>m</sub> = ℓ/(µ<sub>0</sub>µ<sub>r</sub>A) = 0.30 / (4π × 10<sup>−7</sup> × 2000 × 4 × 10<sup>−4</sup>) = 2.984155 × 10<sup>5</sup> A/Wb。",fix:"4 cm² = 4 × 10<sup>−4</sup> m²；忘了換算會差 10<sup>4</sup> 倍。",ref:R10,refName:N10},
    "q10-2":{t:"num",ans:0.837758,tol:0.005,why:"Φ = NI/R<sub>m</sub> = 100 / 2.984155 × 10<sup>5</sup> = 3.351032 × 10<sup>−4</sup> Wb，B = Φ/A = 0.837758 T。",fix:"最後一步要除以截面積才是 B；Φ 本身不是 B。",ref:R10,refName:N10},
    "q10-3":{t:"num",ans:0.109320,tol:0.002,why:"1 mm 氣隙的 R<sub>m,氣隙</sub> = 1.989437 × 10<sup>6</sup>，是鐵心的 6.7 倍，總磁阻變 2.286858 × 10<sup>6</sup>，B 只剩 0.109320 T（原來的 13.05 %）。",fix:"氣隙磁阻要用 µ<sub>0</sub>（µ<sub>r</sub> = 1）算，不能用鐵心的 µ。",ref:R10,refName:N10},
    "q11-1":{t:"num",ans:0.3,tol:0.005,why:"ε<sub>emf</sub> = BLv = 0.5 × 0.2 × 3 = 0.3 V。這是動生電動勢，來自導體裡的自由電子受到的 q<b>v</b>×<b>B</b>。",fix:"L 是導軌間距（垂直於運動與磁場的那一段），不是棒走過的距離。",ref:R11,refName:N11},
    "q11-2":{t:"num",ans:0.015,tol:0.0005,why:"I = 0.3/2 = 0.15 A，F = BIL = 0.5 × 0.15 × 0.2 = 0.015 N，方向與 v 相反（冷次定律）。",fix:"這個力必然存在：機械功率 Fv = 0.045 W 剛好等於電阻上的熱。",ref:R11,refName:N11},
    "q11-3":{t:"num",ans:628.318531,tol:1,why:"Φ<sub>max</sub> = B<sub>0</sub>A = 0.02 Wb，ε<sub>max</sub> = NΦ<sub>max</sub> × 2πf = 100 × 0.02 × 314.159265 = 628.318531 V。",fix:"忘了 2π 會得到 100 V；用 rms 會得到 444.288294 V。",ref:R11,refName:N11},
    "q12-1":{t:"num",ans:55.632503,tol:0.1,why:"I<sub>d</sub> = ε<sub>0</sub>AωE<sub>0</sub> = 8.8541878128 × 10<sup>−12</sup> × 0.01 × 6283.185307 × 10<sup>5</sup> = 5.563250 × 10<sup>−5</sup> A ＝ 55.632503 µA，與 CV<sub>0</sub>ω 完全相同。",fix:"ω = 2πf，不是 f；少了 2π 會差 6.28 倍。",ref:R12,refName:N12},
    "q12-2":{t:"sel",ans:"c",why:"位移電流補在安培定律：∇×<b>B</b> = µ<sub>0</sub><b>J</b> + µ<sub>0</sub>ε<sub>0</sub> ∂<b>E</b>/∂t，補完之後才與連續性方程自洽。",fix:"法拉第定律講的是反向的那件事（變化的磁場產生電場），本來就不缺項。",ref:R12,refName:N12},
    "q12-3":{t:"sel",ans:"b",why:"∂<b>D</b>/∂t 不是電荷在流動，它是「變化的電場也會產生磁場」，與法拉第定律對稱，兩者一起才形成電磁波。",fix:"位移電流不代表電容器漏電，也不代表有磁荷。",ref:R12,refName:N12},
    "q13-1":{t:"num",ans:0.299792458,tol:0.001,why:"λ = c/f = 2.99792458 × 10<sup>8</sup> / 10<sup>9</sup> = 0.299792458 m，大約 30 cm。",fix:"GHz 是 10<sup>9</sup> Hz，寫成 10<sup>6</sup> 會差一千倍。",ref:R13,refName:N13},
    "q13-2":{t:"num",ans:376.730314,tol:0.5,why:"η<sub>0</sub> = √(µ<sub>0</sub>/ε<sub>0</sub>) = 376.730314 Ω。常見的 120π = 376.991118 Ω 是近似值，差 0.069 %。",fix:"這是 E 與 H 的比值，不是電路裡的電阻。",ref:R13,refName:N13},
    "q13-3":{t:"num",ans:1.327209,tol:0.005,why:"⟨S⟩ = E<sub>0</sub>²/(2η<sub>0</sub>) = 1 / (2 × 376.730314) = 1.327209 × 10<sup>−3</sup> W/m²。",fix:"題目的單位是 × 10<sup>−3</sup> W/m²，只要填 1.327209；忘了 1/2 會得到 2.654419。",ref:R13,refName:N13},
    "q14-1":{t:"num",ans:65.234115,tol:0.5,why:"δ = √(2/(ωµ<sub>0</sub>σ)) = 6.523411 × 10<sup>−5</sup> m ＝ 65.234115 µm。銅在 1 MHz 的電流只走表面這麼薄一層。",fix:"ω = 2πf；直接用 f 會差 √(2π) 倍。",ref:R14,refName:N14},
    "q14-2":{t:"num",ans:13.314950,tol:0.1,why:"t/δ = 100/65.234115 = 1.532940 Np，乘 8.685890 得 13.314950 dB。",fix:"Np 與 dB 是兩種對數單位，直接把 1.53 當成 dB 會差 8.7 倍。",ref:R14,refName:N14},
    "q14-3":{t:"num",ans:0.354343,tol:0.002,why:"η<sub>2</sub> = 376.730314/√4.4 = 179.599130 Ω，Γ = (179.599130 − 376.730314)/(179.599130 + 376.730314) = −0.354343，大小 0.354343。",fix:"題目問的是大小，負號代表相位翻轉 180°；功率反射率是它的平方 12.5559 %。",ref:R14,refName:N14},
    "q15-1":{t:"num",ans:0.2,tol:0.005,why:"Γ<sub>L</sub> = (Z<sub>L</sub> − Z<sub>0</sub>)/(Z<sub>L</sub> + Z<sub>0</sub>) = (75 − 50)/(75 + 50) = 0.2，功率反射 4 %。",fix:"分母是相加不是相減。",ref:R15,refName:N15},
    "q15-2":{t:"num",ans:1.5,tol:0.02,why:"VSWR = (1 + |Γ|)/(1 − |Γ|) = 1.2/0.8 = 1.5。VSWR 與 |Γ| 是同一件事的兩種寫法。",fix:"分子分母的 1 不要漏；用 |Γ|² 代進去會得到別的數。",ref:R15,refName:N15},
    "q15-3":{t:"num",ans:33.333333,tol:0.1,why:"βℓ = 90° 時 Z<sub>in</sub> = Z<sub>0</sub>²/Z<sub>L</sub> = 2500/75 = 33.333333 Ω。這就是 λ/4 轉換器。",fix:"λ/4 是把阻抗「翻轉」，不是複製；複製的是 λ/2。",ref:R15,refName:N15}
  };
  const ids=Object.keys(Q);
  const progress=()=>{
    const n=ids.filter(i=>$(i)&&String($(i).value).trim()!=="").length;
    $("quiz-progress").textContent="已作答 "+n+" / "+ids.length+" 題（僅供參考，不影響瀏覽）";
  };
  const link=q=>"（回去看 <a href=\""+q.ref+"\">"+q.refName+"</a>）";
  const check=id=>{
    const q=Q[id],node=$(id),out=$(id+"-output");
    if(!q||!node||!out)return;
    const raw=String(node.value).trim();
    if(raw===""){
      out.innerHTML=p(q.t==="sel"?"先選一個選項，再按對答案。":"先填一個數字，再按對答案。");
      progress();return;
    }
    let ok,ansTxt;
    if(q.t==="sel"){ok=raw===q.ans;ansTxt="正確答案是 "+q.ans+"。";}
    else{
      const v=Number(raw);
      ok=isFinite(v)&&Math.abs(v-q.ans)<=q.tol;
      ansTxt="正確答案是 "+neg(String(q.ans))+"（容差 ±"+neg(String(q.tol))+"）。";
    }
    out.innerHTML=ok
      ?p("<strong>答對</strong>　"+q.why+link(q))
      :p("<strong>再看一次</strong>　"+ansTxt+q.fix+" "+q.why+link(q));
    progress();
  };
  ids.forEach(id=>{on(id+"-check","click",()=>check(id));on(id,"input",progress)});
  on("quiz-reset","click",()=>{
    ids.forEach(id=>{
      if($(id))$(id).value="";
      if($(id+"-output"))$(id+"-output").innerHTML="";
    });
    progress();
  });
  progress();
}

// ---------- 6. 註冊 ----------
if(typeof document!=="undefined"){
  [emscale,vecfield,coulomb,gauss,potential,dielectric,capacitor,conduction,
   lorentz,ampere,magcircuit,faraday,displacement,planewave,lossymedium,tline,
   dictionary,selfcheck].forEach(f=>f());
}

// ---------- 7. 匯出（供語法檢查與人工交叉驗算）----------
if(typeof module!=="undefined")module.exports={fmt:fmt,exp:exp,sci:sci,num6:num6,
  rad:rad,deg:deg,CALC:CALC,
  EPS0:EPS0,MU0:MU0,C0:C0,KE:KE,ETA0:ETA0,QE:QE,MP:MP,NP2DB:NP2DB};

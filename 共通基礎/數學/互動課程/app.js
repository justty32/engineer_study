"use strict";
// 工程數學先修（零基礎互動課）：所有頁面共用的互動邏輯。
// 規則：確定性（不使用亂數、不讀時鐘）、無外部請求、每個 widget 一個守衛函式。

// 1. helper
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=(x,n=6)=>{if(typeof x!=="number")x=Number(x);if(!isFinite(x))return x>0?"∞":(x<0?"−∞":"未定義");return x.toFixed(n).replace("-","−")};
const fmtSigned=(x,n=6)=>{if(typeof x!=="number")x=Number(x);if(!isFinite(x))return fmt(x,n);return (x>=0?"+":"")+x.toFixed(n).replace("-","−")};
const num=(x,n=6)=>{if(typeof x!=="number")x=Number(x);if(!isFinite(x))return fmt(x,n);if(x!==0&&Math.abs(x)<1e-5)return x.toExponential(3).replace("-","−").replace("e−","×10^−").replace("e+","×10^+");return fmt(x,n)};
const trimZeros=s=>{let r=String(s);if(r.indexOf(".")<0)return r;while(r.charAt(r.length-1)==="0")r=r.slice(0,-1);if(r.charAt(r.length-1)===".")r=r.slice(0,-1);return r};
const val=x=>{const n=$(x);return n?Number(n.value):0};
const pick=x=>{const n=$(x);return n?String(n.value):""};

// 2. 數學工具
const norm2=(a,b)=>Math.hypot(a,b);
const factorial=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r};
const nCk=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r};
const normalPdf=(x,mu,sigma)=>Math.exp(-(x-mu)*(x-mu)/(2*sigma*sigma))/(sigma*Math.sqrt(2*Math.PI));
// Abramowitz & Stegun 26.2.17，誤差 < 7.5e−8
const normalCdf=z=>{
  if(z<0)return 1-normalCdf(-z);
  const p=0.2316419,b1=0.319381530,b2=-0.356563782,b3=1.781477937,b4=-1.821255978,b5=1.330274429;
  const t=1/(1+p*z),phi=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
  return 1-phi*(b1*t+b2*t*t+b3*t*t*t+b4*t*t*t*t+b5*t*t*t*t*t);
};
const vec2=(x,y)=>({x:x,y:y});
const angleDeg=(ax,ay,bx,by)=>{
  const na=Math.hypot(ax,ay),nb=Math.hypot(bx,by);
  if(na<1e-12||nb<1e-12)return NaN;
  return deg(Math.acos(clamp((ax*bx+ay*by)/(na*nb),-1,1)));
};

// 3. 各章守衛函式

// 00 工程數學地圖
function mathmap(){
  if(!$('goal-pick'))return;
  const MAP={
    circuit:{name:"電路學",need:"微分與積分（i = C dv/dt、v = L di/dt）、複數相量、拉氏轉換",ch:"第 01、02、08、09 章",stuck:"算不出暫態與正弦穩態"},
    signal:{name:"信號與系統",need:"積分變換、卷積、傅立葉分析",ch:"第 02、08、10 章",stuck:"看不懂頻譜與濾波器"},
    control:{name:"控制系統",need:"常微分方程、拉氏極點、特徵值、狀態空間",ch:"第 06、07、08 章",stuck:"判斷不出穩定性"},
    comm:{name:"通訊系統",need:"傅立葉分析、機率、隨機過程",ch:"第 10、12、13 章",stuck:"算不出錯誤率與頻寬"},
    em:{name:"電磁學",need:"向量分析、偏微分方程",ch:"第 11 章",stuck:"看不懂馬克士威方程式"},
    ml:{name:"機器學習",need:"線性代數、梯度、機率統計",ch:"第 04、05、06、12、13 章",stuck:"看不懂模型在最佳化什麼"}
  };
  const draw=()=>{
    const k=pick('goal-pick'),m=MAP[k]||MAP.circuit;
    $('mathmap-output').innerHTML=
      "<p><strong>"+m.name+"</strong></p>"+
      "<p>需要的數學＝"+m.need+"</p>"+
      "<p>對應本課"+m.ch+"</p>"+
      "<p>不學會卡在："+m.stuck+"</p>"+
      "<p>這門課的數學不是額外負擔，而是它的語言：把上面那句「卡在哪」讀一遍，就知道為什麼要先蓋這幾章。</p>";
  };
  ['goal-pick'].forEach(x=>on(x,'input',draw));
  draw();
}

// 01 極限與導數
function secant(){
  if(!$('sec-fn'))return;
  const F={
    sq:{f:x=>x*x,d:x=>2*x,label:"f(x) = x²",dlabel:"f′(x) = 2x"},
    sin:{f:x=>Math.sin(x),d:x=>Math.cos(x),label:"f(x) = sin x",dlabel:"f′(x) = cos x"},
    exp:{f:x=>Math.exp(x),d:x=>Math.exp(x),label:"f(x) = e^x",dlabel:"f′(x) = e^x"}
  };
  const draw=()=>{
    const key=pick('sec-fn'),g=F[key]||F.sq;
    const x0=val('sec-x0'),lg=val('sec-logh'),h=Math.pow(10,lg);
    const fwd=(g.f(x0+h)-g.f(x0))/h;
    const cen=(g.f(x0+h)-g.f(x0-h))/(2*h);
    const ana=g.d(x0);
    const eF=Math.abs(fwd-ana),eC=Math.abs(cen-ana);
    let msg="";
    if(h>=1e-4){
      msg+="<p>中央差商的一次誤差項互相抵消，所以同一個 h 之下比前向差商更準：前向誤差 ≈ (h/2)·|f″|，中央誤差 ≈ (h²/6)·|f‴|。</p>";
    }
    if(h<=1e-6){
      msg+="<p><span>注意：h 太小，f(x+h) 與 f(x) 幾乎相等，相減後有效位數被吃掉（浮點相消），誤差反而變大。</span>把步長指數往右拉回 −4 附近看看誤差的 V 形谷底。</p>";
    }
    if(key==="sq"){
      msg+="<p>目前的 f 是二次函式，三階導數為 0，所以中央差商剛好精確（誤差只剩浮點捨入）。</p>";
    }
    $('secant-output').innerHTML=
      "<p>"+g.label+"，觀察點 x0 = "+fmt(x0,2)+"，步長 h = "+num(h)+"</p>"+
      "<p>前向差商 (f(x0+h) − f(x0)) / h = <strong>"+fmt(fwd)+"</strong>，絕對誤差 "+num(eF)+"</p>"+
      "<p>中央差商 (f(x0+h) − f(x0−h)) / (2h) = <strong>"+fmt(cen)+"</strong>，絕對誤差 "+num(eC)+"</p>"+
      "<p>解析導數 "+g.dlabel+" 在 x0 的值 = "+fmt(ana)+"</p>"+
      msg;
  };
  ['sec-fn','sec-x0','sec-logh'].forEach(x=>on(x,'input',draw));
  draw();
}

// 02 積分
function riemann(){
  if(!$('rie-fn'))return;
  const F={
    sq:{f:x=>x*x,a:0,b:1,exact:1/3,label:"f(x) = x²，區間 [0, 1]",mono:"inc"},
    sin:{f:x=>Math.sin(x),a:0,b:Math.PI,exact:2,label:"f(x) = sin x，區間 [0, π]",mono:"none"},
    inv:{f:x=>1/x,a:1,b:2,exact:Math.LN2,label:"f(x) = 1/x，區間 [1, 2]",mono:"dec"}
  };
  const RULE={left:"左端點",right:"右端點",mid:"中點",trap:"梯形"};
  const draw=()=>{
    const key=pick('rie-fn'),g=F[key]||F.sq;
    const rule=pick('rie-rule')||"left";
    const n=Math.max(1,Math.round(val('rie-n')));
    const dx=(g.b-g.a)/n;
    let s=0;
    for(let i=0;i<n;i++){
      const xl=g.a+i*dx,xr=xl+dx;
      if(rule==="left")s+=g.f(xl);
      else if(rule==="right")s+=g.f(xr);
      else if(rule==="mid")s+=g.f(xl+dx/2);
      else s+=(g.f(xl)+g.f(xr))/2;
    }
    const approx=s*dx,err=approx-g.exact;
    const firstOrder=(rule==="left"||rule==="right");
    let msg="<p>"+(firstOrder
      ?"這個法則是<strong>一階</strong>：誤差 ∝ 1/n，n 加倍誤差大約減半。"
      :"這個法則是<strong>二階</strong>：誤差 ∝ 1/n²，n 加倍誤差大約變成 1/4。")+"</p>";
    msg+="<p>預測：n 從 "+n+" 加倍到 "+(2*n)+" 時，誤差大約變成 "+num(firstOrder?err/2:err/4)+"。</p>";
    if(rule==="left"||rule==="right"){
      if(g.mono==="inc"){
        msg+="<p>這個函式在區間上遞增，所以每個小矩形取左端點就是取該段的最小值（整體低估），取右端點就是取最大值（整體高估）。</p>";
      }else if(g.mono==="dec"){
        msg+="<p>這個函式在區間上遞減，所以左端點取到該段的最大值（整體高估），右端點取到最小值（整體低估）。</p>";
      }else{
        msg+="<p>這個函式在區間上先升後降，左右端點的高估與低估會部分互相抵消，所以誤差看起來比想像中小，但階數仍然是一階。</p>";
      }
    }else{
      msg+="<p>中點與梯形的誤差符號相反、而且中點誤差大約是梯形的一半，這就是辛普森法則（把兩者以 2:1 加權）能到四階的原因。</p>";
    }
    $('riemann-output').innerHTML=
      "<p>"+g.label+"，"+RULE[rule]+"法則，分割數 n = "+n+"</p>"+
      "<p>Δx = (b − a)/n = "+fmt(dx)+"</p>"+
      "<p>近似值 = <strong>"+fmt(approx)+"</strong>，精確值 = "+fmt(g.exact)+"，有號誤差 = "+fmtSigned(err)+"</p>"+
      msg;
  };
  ['rie-fn','rie-rule','rie-n'].forEach(x=>on(x,'input',draw));
  draw();
}

// 03 級數與泰勒
function taylor(){
  if(!$('tay-fn'))return;
  const draw=()=>{
    const key=pick('tay-fn')||"exp";
    const x=val('tay-x'),n=Math.max(0,Math.round(val('tay-n')));
    // term(k)：第 k 階的項（未納入的階數回 0）
    const term=k=>{
      if(key==="exp")return Math.pow(x,k)/factorial(k);
      if(key==="sin")return (k%2===1)?(((k-1)/2)%2===0?1:-1)*Math.pow(x,k)/factorial(k):0;
      if(key==="cos")return (k%2===0)?((k/2)%2===0?1:-1)*Math.pow(x,k)/factorial(k):0;
      return (k>=1)?((k+1)%2===0?1:-1)*Math.pow(x,k)/k:0;
    };
    let sum=0;
    for(let k=0;k<=n;k++)sum+=term(k);
    const truth=key==="exp"?Math.exp(x):key==="sin"?Math.sin(x):key==="cos"?Math.cos(x):(x>-1?Math.log1p(x):NaN);
    const err=Math.abs(sum-truth);
    // 下一個非零項
    let nextK=n+1,nextVal=term(nextK),guard=0;
    while(nextVal===0&&guard<40){nextK++;nextVal=term(nextK);guard++;}
    const shown=[];
    for(let k=0;k<=Math.min(n,20)&&shown.length<4;k++){
      const t=term(k);
      if(t!==0)shown.push("x<sup>"+k+"</sup> 項 = "+num(t));
    }
    let msg="<p>離展開點 a = 0 越遠，同樣的截斷階數就越不準：目前 |x| = "+fmt(Math.abs(x),2)+"，把 x 拉大就會看到誤差跟著長大。</p>";
    if(key==="ln1p"&&x<=-1){
      msg="<p><span>x ≤ −1，ln(1+x) 無定義</span>：真值不存在，部分和算得出來也沒有意義。</p>"+msg;
    }else if(key==="ln1p"&&Math.abs(x)>1){
      msg="<p><span>超出收斂半徑 1，加再多項也不會收斂</span>：ln(1+x) 的級數只在 |x| < 1 收斂，這裡 |x| = "+fmt(Math.abs(x),2)+"。</p>"+msg;
    }
    if(key==="exp"&&x>0){
      msg+="<p>e<sup>x</sup> 在 x > 0 時所有項同號累加，下一項只是同數量級的誤差估計，不是嚴格上界。</p>";
    }else{
      msg+="<p>這是交錯級數，截斷誤差不超過第一個被丟掉的項（"+num(Math.abs(nextVal))+"），可以直接拿來當誤差上界。</p>";
    }
    $('taylor-output').innerHTML=
      "<p>展開點 a = 0，計算位置 x = "+fmt(x,2)+"，截斷階數 n = "+n+"</p>"+
      "<p>部分和 = <strong>"+num(sum)+"</strong>，真值 = "+num(truth)+"，絕對誤差 = "+num(err)+"</p>"+
      "<p>下一個非零項（第 "+nextK+" 階）的絕對值 = "+num(Math.abs(nextVal))+"</p>"+
      "<p>前幾個非零項："+(shown.length?shown.join("；"):"目前階數內沒有非零項")+"</p>"+
      msg;
  };
  ['tay-fn','tay-x','tay-n'].forEach(x=>on(x,'input',draw));
  draw();
}

// 04 向量與矩陣
function matvec(){
  if(!$('mat-a11'))return;
  const draw=()=>{
    const a11=val('mat-a11'),a12=val('mat-a12'),a21=val('mat-a21'),a22=val('mat-a22');
    const x=val('vec-x'),y=val('vec-y');
    const y1=a11*x+a12*y,y2=a21*x+a22*y;
    const det=a11*a22-a12*a21;
    const nx=Math.hypot(x,y),ny=Math.hypot(y1,y2);
    let msg="<p>兩種視角算出來的結果完全相同，這就證明了：矩陣乘向量就是<strong>把 A 的欄向量做線性組合</strong>，係數正是 x 的分量。</p>";
    if(a11===1&&a22===1&&a12===0&&a21===0){
      msg+="<p>這是單位矩陣 I，向量沒動：I 是「什麼都不做」的那個轉換。</p>";
    }
    if(Math.abs(det)<1e-9){
      msg+="<p>det = 0：兩欄線性相依，整個平面被壓成一條線或一點；第 05 章會說這叫<strong>奇異</strong>，代表資訊被壓掉、無法還原。</p>";
    }
    if(a12===0&&a21===0){
      msg+="<p>對角矩陣：x、y 分量各自獨立縮放，互不影響。</p>";
    }
    $('matvec-output').innerHTML=
      "<p>A = [["+fmt(a11,1)+", "+fmt(a12,1)+"], ["+fmt(a21,1)+", "+fmt(a22,1)+"]]，x = ("+fmt(x,1)+", "+fmt(y,1)+")</p>"+
      "<p><strong>列視角</strong>：y₁ = "+fmt(a11,1)+"⋅"+fmt(x,1)+" + "+fmt(a12,1)+"⋅"+fmt(y,1)+" = "+fmt(y1,4)+"；y₂ = "+fmt(a21,1)+"⋅"+fmt(x,1)+" + "+fmt(a22,1)+"⋅"+fmt(y,1)+" = "+fmt(y2,4)+"</p>"+
      "<p><strong>欄視角</strong>："+fmt(x,1)+"⋅("+fmt(a11,1)+", "+fmt(a21,1)+") + "+fmt(y,1)+"⋅("+fmt(a12,1)+", "+fmt(a22,1)+") = ("+fmt(y1,4)+", "+fmt(y2,4)+")</p>"+
      "<p>結果 y = (<strong>"+fmt(y1,4)+"</strong>, <strong>"+fmt(y2,4)+"</strong>)</p>"+
      "<p>|x| = "+fmt(nx)+"，|y| = "+fmt(ny)+"，長度比 = "+(nx>1e-12?fmt(ny/nx):"未定義（x 是零向量）")+"；det A = "+fmt(det)+"（面積縮放倍率）</p>"+
      msg;
  };
  ['mat-a11','mat-a12','mat-a21','mat-a22','vec-x','vec-y'].forEach(x=>on(x,'input',draw));
  draw();
}

// 05 線性方程組與逆
function linsolve(){
  if(!$('sys-a11'))return;
  const EPS=1e-9;
  const draw=()=>{
    const a11=val('sys-a11'),a12=val('sys-a12'),a21=val('sys-a21'),a22=val('sys-a22');
    const b1=val('sys-b1'),b2=val('sys-b2');
    const det=a11*a22-a12*a21;
    const rankA=Math.abs(det)>EPS?2:((Math.abs(a11)>EPS||Math.abs(a12)>EPS||Math.abs(a21)>EPS||Math.abs(a22)>EPS)?1:0);
    const m1=det,m2=a11*b2-b1*a21,m3=a12*b2-b1*a22;
    const rankAb=(Math.abs(m1)>EPS||Math.abs(m2)>EPS||Math.abs(m3)>EPS)?2:
      ((Math.abs(a11)>EPS||Math.abs(a12)>EPS||Math.abs(a21)>EPS||Math.abs(a22)>EPS||Math.abs(b1)>EPS||Math.abs(b2)>EPS)?1:0);
    let body="";
    if(rankA===2&&rankAb===2){
      const x=(b1*a22-a12*b2)/det,y=(a11*b2-b1*a21)/det;
      const c1=a11*x+a12*y,c2=a21*x+a22*y;
      body=
        "<p><strong>唯一解</strong>：(x, y) = (<strong>"+fmt(x)+"</strong>, <strong>"+fmt(y)+"</strong>)（克拉瑪法則）</p>"+
        "<p>回代驗證："+fmt(a11,1)+"x + "+fmt(a12,1)+"y = "+fmt(c1)+"（應等於 b₁ = "+fmt(b1,1)+"）；"+fmt(a21,1)+"x + "+fmt(a22,1)+"y = "+fmt(c2)+"（應等於 b₂ = "+fmt(b2,1)+"）</p>"+
        "<p>A<sup>−1</sup> = (1/det)⋅[["+fmt(a22,1)+", "+fmt(-a12,1)+"], ["+fmt(-a21,1)+", "+fmt(a11,1)+"]] = [["+fmt(a22/det)+", "+fmt(-a12/det)+"], ["+fmt(-a21/det)+", "+fmt(a11/det)+"]]</p>"+
        "<p>幾何：兩條直線斜率不同，<strong>交於一點</strong>，那個點就是解。</p>";
    }else if(rankA===1&&rankAb===1){
      let p=a11,q=a12,r=b1;
      if(Math.abs(p)<=EPS&&Math.abs(q)<=EPS){p=a21;q=a22;r=b2;}
      const param=Math.abs(q)>EPS
        ?"(x, y) = (t, ("+fmt(r,1)+" − "+fmt(p,1)+" t)/"+fmt(q,1)+")，t 為任意實數"
        :"(x, y) = ("+fmt(r/p)+", t)，t 為任意實數";
      body=
        "<p><strong>無限多解</strong>：兩條方程其實是同一條直線（一條是另一條的倍數）。</p>"+
        "<p>解集："+param+"</p>"+
        "<p>幾何：兩條直線<strong>完全重合</strong>。注意「無限多解」不是「隨便填都對」，仍然被這一條方程約束住。</p>";
    }else if(rankA<rankAb){
      body=
        "<p><strong>無解</strong>：兩條直線平行但不重合，限制互相矛盾。</p>"+
        "<p>係數矩陣的秩 "+rankA+" 小於增廣矩陣的秩 "+rankAb+"，代表 b 不落在 A 的欄空間裡。</p>"+
        "<p>幾何：兩條<strong>平行線</strong>，永遠不相交。若要硬給一個答案，得改用最小平方 x̂ = (A<sup>T</sup>A)<sup>−1</sup>A<sup>T</sup>b，那不是解，是誤差最小的折衷。</p>";
    }else{
      body="<p><strong>0 = 0</strong>：係數與右邊全是零，平面上每一點都是解。</p><p>幾何：整個平面。</p>";
    }
    $('linsolve-output').innerHTML=
      "<p>A = [["+fmt(a11,1)+", "+fmt(a12,1)+"], ["+fmt(a21,1)+", "+fmt(a22,1)+"]]，b = ("+fmt(b1,1)+", "+fmt(b2,1)+")</p>"+
      "<p>det = "+fmt(a11,1)+"⋅"+fmt(a22,1)+" − "+fmt(a12,1)+"⋅"+fmt(a21,1)+" = <strong>"+fmt(det)+"</strong>；rank(A) = <strong>"+rankA+"</strong>；rank([A|b]) = <strong>"+rankAb+"</strong></p>"+
      body;
  };
  ['sys-a11','sys-a12','sys-a21','sys-a22','sys-b1','sys-b2'].forEach(x=>on(x,'input',draw));
  draw();
}

// 06 特徵值與分解
function eigen2(){
  if(!$('eig-a11'))return;
  const EPS=1e-9;
  const draw=()=>{
    const a11=val('eig-a11'),a12=val('eig-a12'),a21=val('eig-a21'),a22=val('eig-a22');
    const vx=val('eig-vx'),vy=val('eig-vy');
    const T=a11+a22,D=a11*a22-a12*a21,disc=T*T-4*D;
    const Avx=a11*vx+a12*vy,Avy=a21*vx+a22*vy;
    const ang=angleDeg(vx,vy,Avx,Avy);
    const evec=lam=>{
      if(Math.abs(a12)>EPS)return [a12,lam-a11];
      if(Math.abs(a21)>EPS)return [lam-a22,a21];
      return null;
    };
    let body="",stable="";
    if(disc>EPS){
      const l1=(T+Math.sqrt(disc))/2,l2=(T-Math.sqrt(disc))/2;
      const v1=evec(l1),v2=evec(l2);
      const s1=v1?"("+fmt(v1[0],4)+", "+fmt(v1[1],4)+")":"(1, 0)";
      const s2=v2?"("+fmt(v2[0],4)+", "+fmt(v2[1],4)+")":"(0, 1)";
      body="<p><strong>兩個相異實特徵值</strong>：λ₁ = "+fmt(l1)+"，λ₂ = "+fmt(l2)+"</p>"+
        "<p>特徵向量：λ₁ → "+s1+"；λ₂ → "+s2+"（長度不唯一，任意非零倍數都是）</p>"+
        "<p>對角化 A = P D P<sup>−1</sup>：P 的兩欄就是上面兩個特徵向量，D = [["+fmt(l1,4)+", 0], [0, "+fmt(l2,4)+"]]。</p>";
      stable=(l1<-EPS&&l2<-EPS)
        ?"<p>若把 A 當作 ẋ = Ax 的系統矩陣，兩個特徵值都是負的，這個系統<strong>穩定</strong>。</p>"
        :"<p>若把 A 當作 ẋ = Ax 的系統矩陣，λ = "+fmt(Math.max(l1,l2))+" 的實部不是負的，這個模態會被放大，系統<strong>不穩定</strong>。</p>";
    }else if(Math.abs(disc)<=EPS){
      const l=T/2,v=evec(l);
      body="<p><strong>重根</strong>：λ = "+fmt(l)+"（判別式 = 0）</p>"+
        "<p>特徵向量："+(v?"("+fmt(v[0],4)+", "+fmt(v[1],4)+")":"整個平面都是（A 是純量倍的單位矩陣）")+"</p>"+
        "<p>重根時可能只有一個獨立特徵向量，此時<strong>無法對角化</strong>，要改用 Jordan 形。</p>";
      stable=l<-EPS
        ?"<p>重根為負，ẋ = Ax <strong>穩定</strong>（但暫態會出現 t·e<sup>λt</sup> 這種項）。</p>"
        :"<p>重根 λ = "+fmt(l)+" 不是負的，ẋ = Ax <strong>不穩定</strong>或處於邊界。</p>";
    }else{
      const re=T/2,im=Math.sqrt(-disc)/2;
      body="<p><strong>共軛複根</strong>：λ = "+fmt(re)+" ± j"+fmt(im)+"</p>"+
        "<p>沒有任何實方向保持不變，這個矩陣在<strong>轉圈</strong>：虛部 "+fmt(im)+" 給旋轉速率，實部 "+fmt(re)+" 給伸縮。</p>"+
        "<p>特徵值可以是複數，即使 A 全部是實數。</p>";
      stable=re<-EPS
        ?"<p>複根實部為負，ẋ = Ax <strong>穩定</strong>：振盪會衰減。</p>"
        :(re>EPS?"<p>複根實部為正，ẋ = Ax <strong>發散</strong>：振盪會越來越大。</p>"
                :"<p>複根實部為 0，ẋ = Ax 位於<strong>邊界穩定</strong>：等幅振盪。</p>");
    }
    let vmsg="";
    if(Math.hypot(vx,vy)<1e-12){
      vmsg="<p>v = (0, 0)：零向量沒有方向，夾角未定義；特徵向量的定義本來就要求 v ≠ 0。</p>";
    }else if(!isFinite(ang)){
      vmsg="<p>Av 是零向量（A 把 v 壓成 0），代表 λ = 0 是特徵值、v 在零空間裡。</p>";
    }else if(ang<0.5||ang>179.5){
      const lam=Math.abs(vx)>Math.abs(vy)?Avx/vx:Avy/vy;
      vmsg="<p><strong>v 就是特徵向量</strong>，因為 Av 與 v 共線；比例 λ = "+fmt(lam)+"（用 Av 與 v 的對應分量相除）。</p>";
    }else{
      vmsg="<p>v 不是特徵向量，Av 偏離了 "+fmt(ang,3)+"°。</p>";
    }
    $('eigen2-output').innerHTML=
      "<p>A = [["+fmt(a11,2)+", "+fmt(a12,2)+"], ["+fmt(a21,2)+", "+fmt(a22,2)+"]]；跡 T = "+fmt(T,4)+"，det D = "+fmt(D,4)+"，判別式 T² − 4D = "+fmt(disc,4)+"</p>"+
      body+
      "<p>測試向量 v = ("+fmt(vx,2)+", "+fmt(vy,2)+")，Av = ("+fmt(Avx,4)+", "+fmt(Avy,4)+")，夾角 = "+(isFinite(ang)?fmt(ang,3)+"°":"未定義")+"</p>"+
      vmsg+stable;
  };
  ['eig-a11','eig-a12','eig-a21','eig-a22','eig-vx','eig-vy'].forEach(x=>on(x,'input',draw));
  draw();
}

// 07 常微分方程
function odestep(){
  if(!$('ode-tau'))return;
  const draw=()=>{
    const tau=val('ode-tau'),v0=val('ode-v0'),vs=val('ode-vs'),t=val('ode-t'),dt=val('ode-dt');
    const exact=vs+(v0-vs)*Math.exp(-t/tau);
    const steps=Math.max(0,Math.round(t/dt));
    let v=v0;
    for(let k=0;k<steps;k++)v+=(dt/tau)*(vs-v);
    const err=v-exact;
    const r=dt/tau;
    const span=vs-v0;
    const done=Math.abs(span)>1e-12?(exact-v0)/span*100:NaN;
    let doneLine=isFinite(done)
      ?"<p>t = "+fmt(t,2)+" s 是 "+fmt(t/tau,3)+" 倍 τ，已走完全程的 <strong>"+fmt(done,1)+" %</strong>（t = τ 是 63.2 %、3τ 是 95.0 %、5τ 是 99.3 %）。</p>"
      :"<p>初值已等於穩態（v0 = vs），波形是一條水平線，沒有暫態可看。</p>";
    let warn="";
    if(r<1){
      warn="<p>Δt/τ = "+fmt(r,3)+" < 1：Euler 前向法<strong>單調逼近</strong>穩態，誤差 ∝ Δt。</p>";
    }else if(r<2){
      warn="<p><span>Δt/τ = "+fmt(r,3)+"，落在 1 到 2 之間：每一步都跨過穩態，數值解會左右振盪才收斂。真實的 RC 電路不會這樣振盪，這是方法造成的假象。</span></p>";
    }else{
      warn="<p><span>Δt/τ = "+fmt(r,3)+" ≥ 2：數值發散。誤差每一步乘上 |1 − Δt/τ| ≥ 1，越走越大。這是 Euler 法本身不穩定，不是電路不穩定。</span></p>";
    }
    $('odestep-output').innerHTML=
      "<p>τ = "+fmt(tau,2)+" s，v0 = "+fmt(v0,2)+" V，vs = "+fmt(vs,2)+" V，t = "+fmt(t,2)+" s，Δt = "+fmt(dt,3)+" s（走 "+steps+" 步）</p>"+
      "<p>解析解 v(t) = vs + (v0 − vs)e<sup>−t/τ</sup> = <strong>"+fmt(exact)+"</strong> V</p>"+
      "<p>Euler 前向法 v = <strong>"+fmt(v)+"</strong> V，有號誤差 = "+fmtSigned(err)+" V</p>"+
      doneLine+warn+
      "<p>把 Δt 減半，誤差大約也減半——<strong>Euler 前向法是一階方法</strong>，這是判斷方法階數最直接的實驗。</p>";
  };
  ['ode-tau','ode-v0','ode-vs','ode-t','ode-dt'].forEach(x=>on(x,'input',draw));
  draw();
}

// 08 拉氏轉換
function polezero(){
  if(!$('pole-sigma'))return;
  const EPS=1e-9;
  // 符號感知拼接：係數為負印「 − 值」、為正印「 + 值」，值本身不帶負號前綴
  const signTerm=(v,n)=>(v<0?" − ":" + ")+fmt(Math.abs(v),n);
  const draw=()=>{
    const sigma=val('pole-sigma'),omega=val('pole-omega'),t=val('pole-t');
    const wn=Math.hypot(sigma,omega);
    const zeta=wn>EPS?-sigma/wn:NaN;
    const mode=Math.exp(sigma*t)*Math.cos(omega*t);
    const env=Math.exp(sigma*t);
    const tau=Math.abs(sigma)>EPS?1/Math.abs(sigma):Infinity;
    const period=omega>EPS?2*Math.PI/omega:Infinity;
    let zetaShow=isFinite(zeta)?fmt(zeta):"未定義";
    let periodShow=omega>EPS?fmt(period,6)+" s":"不振盪，沒有週期";
    let zline="";
    if(omega<=EPS&&sigma<-EPS){
      zetaShow="1.000000（ζ ≥ 1）";
      zline="<p>ω ≈ 0：<strong>純實極點，沒有振盪</strong>，時域就是單純衰減的指數 e<sup>σt</sup>。這一側 ζ ≥ 1，落在臨界阻尼（ζ = 1）與過阻尼（ζ > 1）之間；把兩個實極點合起來看時 ζ 會大於 1，這裡顯示的 1 是單一極點退化後的邊界值。</p>";
    }else if(omega<=EPS&&sigma>EPS){
      zetaShow="不適用";
      zline="<p>ω ≈ 0 且 σ &gt; 0：<strong>右半平面的純實極點</strong>，時域是單純發散的指數 e<sup>σt</sup>，既不振盪也不衰減。阻尼比 ζ 描述的是「振盪衰減得多快」，只有在系統會回到穩態時才有物理意義，所以這裡標示為不適用，而不是給一個負值。</p>";
    }else if(omega<=EPS){
      zetaShow="未定義";
      zline="<p>σ ≈ 0 且 ω ≈ 0：<strong>極點落在原點</strong>，自然響應是一個常數（純積分器的行為），不振盪也不衰減。此時 ω<sub>n</sub> = 0，ζ = −σ/ω<sub>n</sub> 的分母為零，所以 ζ 未定義。</p>";
    }else if(Math.abs(zeta)<=EPS){
      zline="<p>ζ = 0：<strong>純振盪</strong>，振幅不增不減。</p>";
    }else if(zeta>0&&zeta<1){
      zline="<p>0 < ζ = "+fmt(zeta)+" < 1：<strong>欠阻尼</strong>，會邊振盪邊衰減。</p>";
    }else if(Math.abs(zeta-1)<=EPS){
      zline="<p>ζ = 1：<strong>臨界阻尼</strong>，不振盪而且是不超調的前提下最快。</p>";
    }else if(zeta>1){
      zline="<p>ζ = "+fmt(zeta)+" > 1：<strong>過阻尼</strong>，兩個實極點，慢慢爬到穩態。</p>";
    }else{
      zline="<p>ζ = "+fmt(zeta)+" < 0：阻尼是負的，能量被往系統裡灌，振幅會長大。</p>";
    }
    let stab="";
    if(sigma<-EPS){
      stab="<p><strong>穩定</strong>：包絡 e<sup>σt</sup> 遞減，t = τ = "+fmt(tau,4)+" s 之後只剩 36.8 %。</p>";
    }else if(Math.abs(sigma)<=EPS){
      stab=omega>EPS
        ?"<p><strong>邊界穩定</strong>：極點在虛軸上，振幅不增不減，是純振盪。</p>"
        :"<p><strong>邊界穩定</strong>：極點在原點，響應停在一個常數上，不增也不減，不是振盪。</p>";
    }else{
      stab="<p><strong>發散</strong>：包絡遞增，任何初始擾動都會被放大。極點跑到右半 s 平面就是這個下場。</p>";
    }
    $('polezero-output').innerHTML=
      "<p>極點 s = "+fmt(sigma,2)+" ± j"+fmt(omega,2)+"</p>"+
      "<p>對應分母 s² + 2ζω<sub>n</sub>s + ω<sub>n</sub>² = s²"+signTerm(-2*sigma,4)+"s"+signTerm(wn*wn,4)+"</p>"+
      "<p>ω<sub>n</sub> = √(σ² + ω²) = <strong>"+fmt(wn)+"</strong> rad/s；ζ = −σ/ω<sub>n</sub> = <strong>"+zetaShow+"</strong></p>"+
      "<p>時間常數 τ = 1/|σ| = "+fmt(tau,4)+" s；振盪週期 2π/ω = "+periodShow+"</p>"+
      "<p>模態 e<sup>σt</sup>cos(ωt) 在 t = "+fmt(t,2)+" s 的值 = <strong>"+fmt(mode)+"</strong>，包絡 e<sup>σt</sup> = "+fmt(env)+"</p>"+
      zline+stab+
      "<p>因果一句話：<strong>σ 決定衰減多快，ω 決定振多快。</strong></p>";
  };
  ['pole-sigma','pole-omega','pole-t'].forEach(x=>on(x,'input',draw));
  draw();
}

// 09 複變入門
function cmul(){
  if(!$('cz-re'))return;
  const draw=()=>{
    const zr=val('cz-re'),zi=val('cz-im'),wr=val('cw-re'),wi=val('cw-im');
    const pr=zr*wr-zi*wi,pi=zr*wi+zi*wr;
    const mz=Math.hypot(zr,zi),mw=Math.hypot(wr,wi),mp=Math.hypot(pr,pi);
    const az=(mz>1e-12)?deg(Math.atan2(zi,zr)):NaN;
    const aw=(mw>1e-12)?deg(Math.atan2(wi,wr)):NaN;
    const ap=(mp>1e-12)?deg(Math.atan2(pi,pr)):NaN;
    const sumA=az+aw;
    const wrapped=isFinite(sumA)&&Math.abs(sumA-ap)>1e-6;
    let msg="";
    if(mz<1e-12||mw<1e-12){
      msg="<p>z 或 w 為 0：乘積為 0，幅角未定義。</p>";
    }else{
      msg="<p>直角形式算出的模與 |z|⋅|w| 的差 = "+num(Math.abs(mp-mz*mw))+"，小於 1e−9：這證明<strong>複數乘法只做旋轉與伸縮</strong>，不做別的。</p>";
      if(Math.abs(wr)<1e-12&&Math.abs(wi-1)<1e-12){
        msg+="<p>w 是純 j：<strong>長度不變、逆時針轉 90°</strong>。這就是「乘 j 等於轉 90 度」的全部內容。</p>";
      }
      if(Math.abs(mw-1)<1e-9){
        msg+="<p>|w| = 1，w 在單位圓上：純旋轉，不改變長度。e<sup>jθ</sup> 全部都住在這個圓上。</p>";
      }
    }
    $('cmul-output').innerHTML=
      "<p>z = "+fmt(zr,2)+" + j"+fmt(zi,2)+"；|z| = "+fmt(mz)+"，arg z = "+(isFinite(az)?fmt(az,4)+"°":"未定義")+"</p>"+
      "<p>w = "+fmt(wr,2)+" + j"+fmt(wi,2)+"；|w| = "+fmt(mw)+"，arg w = "+(isFinite(aw)?fmt(aw,4)+"°":"未定義")+"</p>"+
      "<p>直角展開：zw = ("+fmt(zr,2)+"⋅"+fmt(wr,2)+" − "+fmt(zi,2)+"⋅"+fmt(wi,2)+") + j("+fmt(zr,2)+"⋅"+fmt(wi,2)+" + "+fmt(zi,2)+"⋅"+fmt(wr,2)+") = <strong>"+fmt(pr,4)+" + j"+fmt(pi,4)+"</strong></p>"+
      "<p>極形式：|zw| = "+fmt(mp)+"，arg(zw) = "+(isFinite(ap)?fmt(ap,4)+"°":"未定義")+"</p>"+
      "<p>驗證 |zw| = |z|⋅|w| = "+fmt(mz*mw)+"</p>"+
      "<p>驗證 arg(zw) = arg z + arg w = "+(isFinite(sumA)?fmt(sumA,4)+"°":"未定義")+(wrapped?"（已折回主值範圍 (−180°, 180°]）":"")+"</p>"+
      msg;
  };
  ['cz-re','cz-im','cw-re','cw-im'].forEach(x=>on(x,'input',draw));
  draw();
}

// 10 傅立葉分析
function fourier(){
  if(!$('fs-wave'))return;
  const draw=()=>{
    const wave=pick('fs-wave')||"square";
    const N=Math.max(1,Math.round(val('fs-n')));
    const u=val('fs-t');
    const terms=[];
    let sum=0;
    for(let k=1;k<=N;k++){
      let a=0;
      if(wave==="square"){if(k%2===1)a=(4/Math.PI)*Math.sin(2*Math.PI*k*u)/k;}
      else if(wave==="saw"){a=(2/Math.PI)*((k%2?1:-1)*Math.sin(2*Math.PI*k*u)/k);}
      else{if(k%2===1)a=(8/(Math.PI*Math.PI))*((((k-1)/2)%2===0?1:-1)*Math.sin(2*Math.PI*k*u)/(k*k));}
      if(a!==0&&terms.length<4)terms.push("第 "+k+" 諧波 "+num(a));
      sum+=a;
    }
    let target;
    if(wave==="square"){target=(u===0||Math.abs(u-0.5)<1e-12||u===1)?0:(u<0.5?1:-1);}
    else if(wave==="saw"){target=Math.abs(u-0.5)<1e-12?0:(u<0.5?2*u:2*u-2);}
    else{target=u<0.25?4*u:(u<0.75?2-4*u:4*u-4);}
    const err=sum-target;
    let usedCount=0,topK=0;
    for(let k=1;k<=N;k++){
      const nonzero=(wave==="saw")?true:(k%2===1);
      if(nonzero){usedCount++;topK=k;}
    }
    let msg="";
    if(wave==="tri"){
      msg+="<p>三角波是<strong>連續</strong>的（只有斜率跳變），係數 ∝ 1/k²，收斂很快：N 加倍誤差大約變成 1/4。偶次諧波係數為 0（半週對稱）。</p>";
      msg+="<p>預測：N 加倍到 "+(2*N)+" 時誤差大約變成 "+num(err/4)+"。</p>";
    }else{
      msg+="<p>這個波形有<strong>跳變</strong>，係數 ∝ 1/k，誤差 ∝ 1/N，收斂很慢：要多很多項才看得出改善。</p>";
      msg+="<p>預測：N 加倍到 "+(2*N)+" 時誤差大約變成 "+num(err/2)+"。</p>";
      if(wave==="square")msg+="<p>方波是奇對稱且半週對稱，<strong>偶次諧波係數為 0</strong>，只剩 1f、3f、5f……</p>";
      else msg+="<p>鋸齒波<strong>奇偶諧波都有</strong>，這是它和方波最直接的差別。</p>";
    }
    const jumps=(wave==="square")?[0,0.5,1]:(wave==="saw"?[0.5]:[]);
    let nearJump=false;
    for(let i=0;i<jumps.length;i++)if(Math.abs(u-jumps[i])<=0.02)nearJump=true;
    if(nearJump){
      msg="<p><span>靠近跳變處：部分和的超越量約 9 %，加項只會讓它變窄不會變小，這就是吉布斯現象（Gibbs phenomenon）。跳變點本身收斂到左右極限的平均。</span></p>"+msg;
    }
    $('fourier-output').innerHTML=
      "<p>波形："+(wave==="square"?"方波":wave==="saw"?"鋸齒波":"三角波")+"，保留到第 "+N+" 項，觀察點 t/T = "+fmt(u,3)+"</p>"+
      "<p>部分和 = <strong>"+fmt(sum)+"</strong>，目標值 = "+fmt(target)+"，有號誤差 = "+fmtSigned(err)+"</p>"+
      "<p>實際參與的非零諧波數 = "+usedCount+"，最高諧波階數 = "+topK+"</p>"+
      "<p>前幾個非零項振幅："+(terms.length?terms.join("；"):"無")+"</p>"+
      msg;
  };
  ['fs-wave','fs-n','fs-t'].forEach(x=>on(x,'input',draw));
  draw();
}

// 11 PDE 與向量分析
function fieldops(){
  if(!$('fld-pick'))return;
  const FIELD={
    radial:{fx:(x,y)=>x,fy:(x,y)=>y,div:(x,y)=>2,curl:(x,y)=>0,label:"F = (x, y)"},
    rot:{fx:(x,y)=>-y,fy:(x,y)=>x,div:(x,y)=>0,curl:(x,y)=>2,label:"F = (−y, x)"},
    shear:{fx:(x,y)=>y,fy:(x,y)=>0,div:(x,y)=>0,curl:(x,y)=>-1,label:"F = (y, 0)"},
    quad:{fx:(x,y)=>x*y,fy:(x,y)=>y,div:(x,y)=>y+1,curl:(x,y)=>-x,label:"F = (xy, y)"}
  };
  const phi=(x,y)=>x*x+y*y;
  const draw=()=>{
    const key=pick('fld-pick')||"radial",g=FIELD[key]||FIELD.radial;
    const x=val('fld-x'),y=val('fld-y'),h=val('fld-h');
    const divN=(g.fx(x+h,y)-g.fx(x-h,y))/(2*h)+(g.fy(x,y+h)-g.fy(x,y-h))/(2*h);
    const curlN=(g.fy(x+h,y)-g.fy(x-h,y))/(2*h)-(g.fx(x,y+h)-g.fx(x,y-h))/(2*h);
    const divA=g.div(x,y),curlA=g.curl(x,y);
    const gx=(phi(x+h,y)-phi(x-h,y))/(2*h),gy=(phi(x,y+h)-phi(x,y-h))/(2*h);
    let msg="";
    if(divN>1e-6)msg+="<p>散度 &gt; 0：這一點是<strong>源</strong>，向外淨流出。</p>";
    else if(divN<-1e-6)msg+="<p>散度 &lt; 0：這一點是<strong>匯</strong>，向內淨流入。</p>";
    else msg+="<p>散度 ≈ 0：<strong>無源</strong>，流進等於流出。</p>";
    if(Math.abs(curlN)>1e-6)msg+="<p>旋度 ≠ 0：這一點附近的場在<strong>轉</strong>，"+(curlN>0?"正值代表逆時針":"負值代表順時針")+"。</p>";
    else msg+="<p>旋度 ≈ 0：<strong>無旋</strong>，可以寫成某個位勢的梯度（電位就是這樣存在的）。</p>";
    $('fieldops-output').innerHTML=
      "<p>場："+g.label+"，觀察點 (x, y) = ("+fmt(x,2)+", "+fmt(y,2)+")，中央差分步長 h = "+fmt(h,3)+"</p>"+
      "<p>F 在該點 = ("+fmt(g.fx(x,y),4)+", "+fmt(g.fy(x,y),4)+")</p>"+
      "<p>∇⋅F：數值 = <strong>"+fmt(divN)+"</strong>，解析 = "+fmt(divA)+"，誤差 = "+num(Math.abs(divN-divA))+"</p>"+
      "<p>旋度 z 分量：數值 = <strong>"+fmt(curlN)+"</strong>，解析 = "+fmt(curlA)+"，誤差 = "+num(Math.abs(curlN-curlA))+"</p>"+
      "<p>φ = x² + y² 的數值梯度 = ("+fmt(gx,4)+", "+fmt(gy,4)+")，解析梯度 (2x, 2y) = ("+fmt(2*x,4)+", "+fmt(2*y,4)+")</p>"+
      msg+
      "<p>這四個場最高只到一次或雙線性，三階導數為 0，所以中央差分<strong>剛好精確</strong>；一般的場會留下 h² 等級的誤差。</p>"+
      "<p>恆等式驗證：φ = x² + y² 的梯度場旋度 = ∂(2y)/∂x − ∂(2x)/∂y = 0，這是 ∇ × (∇φ) = 0 的實例，也是電位存在的原因。</p>";
  };
  ['fld-pick','fld-x','fld-y','fld-h'].forEach(x=>on(x,'input',draw));
  draw();
}

// 12 機率與隨機變數
function dist(){
  if(!$('dist-pick'))return;
  const draw=()=>{
    const key=pick('dist-pick')||"die";
    const p=val('dist-p'),n=Math.round(val('dist-n')),lam=val('dist-lambda');
    const mu=val('dist-mu'),sg=val('dist-sigma'),kRaw=val('dist-k');
    let name="",param="",E=0,V=0,pointLabel="",pointVal=0,cdf=0,discrete=true,note="",support="";
    if(key==="die"){
      const k=Math.round(kRaw);
      name="公正骰子";param="六面等機率";discrete=true;
      E=3.5;V=35/12;
      pointVal=(k>=1&&k<=6)?1/6:0;
      cdf=clamp(k,0,6)/6;
      pointLabel="P(X = "+k+")";
      if(k<1||k>6)support="<p>查詢點 "+k+" 不在支撐集 {1, …, 6} 內，機率為 0：骰子擲不出這個點數。</p>";
      note="骰子：最單純的均勻離散分布，用來校準期望值與變異數的直覺。";
    }else if(key==="bernoulli"){
      const k=Math.round(kRaw);
      name="伯努利";param="p = "+fmt(p,2);discrete=true;
      E=p;V=p*(1-p);
      pointVal=k===0?1-p:(k===1?p:0);
      cdf=k<0?0:(k===0?1-p:1);
      pointLabel="P(X = "+k+")";
      if(k<0||k>1)support="<p>查詢點 "+k+" 不在支撐集 {0, 1} 內，機率為 0。</p>";
      note="伯努利：一次是非題，通訊裡就是一個位元對或錯。";
    }else if(key==="binomial"){
      const k=Math.round(kRaw);
      name="二項";param="n = "+n+"，p = "+fmt(p,2);discrete=true;
      E=n*p;V=n*p*(1-p);
      pointVal=(k>=0&&k<=n)?nCk(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k):0;
      let c=0;for(let i=0;i<=Math.min(k,n);i++)if(i>=0)c+=nCk(n,i)*Math.pow(p,i)*Math.pow(1-p,n-i);
      cdf=k<0?0:clamp(c,0,1);
      pointLabel="P(X = "+k+")";
      if(k<0||k>n)support="<p>查詢點 "+k+" 不在支撐集 {0, …, "+n+"} 內，機率為 0。</p>";
      note="二項：n 次獨立是非題裡成功幾次，封包中錯了幾個位元就是它。";
      if(n>=20&&p<=0.1)support+="<p>n 大而 p 小，np = "+fmt(n*p,4)+"：此時<strong>二項可用卜瓦松近似</strong>（取 λ ≈ np），兩者的 E 與 Var 會很接近。</p>";
    }else if(key==="poisson"){
      const k=Math.round(kRaw);
      name="卜瓦松";param="λ = "+fmt(lam,2);discrete=true;
      E=lam;V=lam;
      pointVal=k>=0?Math.exp(-lam)*Math.pow(lam,k)/factorial(k):0;
      let c=0;for(let i=0;i<=k;i++)if(i>=0)c+=Math.exp(-lam)*Math.pow(lam,i)/factorial(i);
      cdf=k<0?0:clamp(c,0,1);
      pointLabel="P(X = "+k+")";
      if(k<0)support="<p>查詢點 "+k+" 為負，不在支撐集 {0, 1, 2, …} 內，機率為 0。</p>";
      note="卜瓦松：單位時間內罕見事件的次數，封包到達、光子計數、元件失效都用它。E 與 Var 相等是它的招牌。";
    }else if(key==="exponential"){
      name="指數";param="λ = "+fmt(lam,2);discrete=false;
      E=1/lam;V=1/(lam*lam);
      pointVal=kRaw<0?0:lam*Math.exp(-lam*kRaw);
      cdf=kRaw<0?0:1-Math.exp(-lam*kRaw);
      pointLabel="f(x = "+fmt(kRaw,2)+")";
      if(kRaw<0)support="<p>x &lt; 0 不在支撐集內：等待時間不會是負的，密度與 CDF 都是 0。</p>";
      note="指數：事件之間的等待時間，具有無記憶性；與卜瓦松互為對偶（次數 vs 間隔）。";
    }else{
      name="常態（高斯）";param="μ = "+fmt(mu,2)+"，σ = "+fmt(sg,2);discrete=false;
      E=mu;V=sg*sg;
      pointVal=normalPdf(kRaw,mu,sg);
      cdf=normalCdf((kRaw-mu)/sg);
      pointLabel="f(x = "+fmt(kRaw,2)+")";
      note="常態：中央極限定理的終點站，熱雜訊、量測誤差幾乎都長這樣。";
      support="<p>Φ 用 Abramowitz–Stegun 26.2.17 近似計算，誤差 &lt; 7.5×10<sup>−8</sup>，不是封閉解。</p>";
    }
    const kindLine=discrete
      ?"<p>這是<strong>機率質量函數（PMF）</strong>，值本身就是機率，介於 0 與 1 之間。</p>"
      :"<p>這是<strong>機率密度（PDF）</strong>，<strong>不是機率</strong>；機率要對區間積分才有，所以密度值可以大於 1。</p>";
    $('dist-output').innerHTML=
      "<p><strong>"+name+"</strong>（"+param+"）</p>"+
      "<p>E[X] = <strong>"+fmt(E)+"</strong>，Var(X) = <strong>"+fmt(V)+"</strong>，σ = "+fmt(Math.sqrt(V))+"</p>"+
      "<p>"+pointLabel+" = <strong>"+fmt(pointVal)+"</strong>；CDF F(查詢點) = <strong>"+fmt(cdf)+"</strong></p>"+
      kindLine+(support||"")+
      "<p>用途："+note+"</p>"+
      "<p>E 是重心、Var 是離散程度；Var 用平方所以單位是原單位的平方，σ 才和原單位同單位。</p>";
  };
  ['dist-pick','dist-p','dist-n','dist-lambda','dist-mu','dist-sigma','dist-k'].forEach(x=>on(x,'input',draw));
  draw();
}

// 13 統計推論與隨機過程
function ci(){
  if(!$('ci-mean'))return;
  const Z={"0.90":1.645,"0.95":1.960,"0.99":2.576};
  const draw=()=>{
    const mean=val('ci-mean'),sigma=val('ci-sigma'),n=Math.max(1,Math.round(val('ci-n')));
    const lvKey=pick('ci-level')||"0.95";
    const z=Z[lvKey]||1.960;
    const mu0=val('ci-mu0');
    const se=sigma/Math.sqrt(n);
    const half=z*se;
    const lo=mean-half,hi=mean+half;
    const zstat=(mean-mu0)/se;
    const alpha=(1-Number(lvKey));
    let verdict;
    if(Math.abs(zstat)>z){
      verdict="<p><strong>拒絕 H₀</strong>：μ₀ = "+fmt(mu0,2)+" 落在區間外，在 α = "+fmt(alpha,2)+" 的顯著水準下，資料與 μ₀ 不相容。</p>";
    }else{
      verdict="<p><strong>不拒絕 H₀</strong>：μ₀ = "+fmt(mu0,2)+" 落在區間內。<strong>注意這不等於證明 H₀ 為真</strong>，只是資料不足以推翻它。</p>";
    }
    $('ci-output').innerHTML=
      "<p>x̄ = "+fmt(mean,2)+"，σ = "+fmt(sigma,2)+"（已知），n = "+n+"，信賴水準 "+fmt(Number(lvKey)*100,0)+" %</p>"+
      "<p>標準誤 SE = σ/√n = <strong>"+fmt(se)+"</strong>；z<sub>α/2</sub> = "+fmt(z,3)+"；半寬 = z⋅SE = <strong>"+fmt(half)+"</strong></p>"+
      "<p>信賴區間 = [<strong>"+fmt(lo)+"</strong>, <strong>"+fmt(hi)+"</strong>]</p>"+
      "<p>檢定統計量 z = (x̄ − μ₀)/SE = <strong>"+fmt(zstat)+"</strong>，臨界值 "+fmt(z,3)+"</p>"+
      verdict+
      "<p>要把半寬減半，n 必須變成目前的 4 倍，也就是 n = "+(n*4)+"：因為 SE 依 1/√n 縮小，開根號讓成本變成平方。</p>"+
      "<p>信賴水準提高時半寬一定變大——<strong>要更有把握就得說得更模糊</strong>，這是精確度與信心之間的取捨。</p>"+
      (n===1?"<p>只有一個樣本時中央極限定理不適用，這個區間只在母體本身就是常態時才成立。</p>":"")+
      "<p>這裡假設 σ 已知且樣本獨立同分布；σ 未知時要改用 t 分布，n 小的時候差別明顯。</p>";
  };
  ['ci-mean','ci-sigma','ci-n','ci-level','ci-mu0'].forEach(x=>on(x,'input',draw));
  draw();
}

// 4. 名詞與概念字典
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

// 5. 自我檢核
function selfcheck(){
  if(!$('quiz-reset'))return;
  const R00="00-工程數學地圖.html",N00="00 工程數學地圖";
  const R01="01-極限與導數.html",N01="01 極限與導數";
  const R02="02-積分.html",N02="02 積分";
  const R03="03-級數與泰勒.html",N03="03 級數與泰勒";
  const R04="04-向量與矩陣.html",N04="04 向量與矩陣";
  const R05="05-線性方程組與逆.html",N05="05 線性方程組與逆";
  const R06="06-特徵值與分解.html",N06="06 特徵值與分解";
  const R07="07-常微分方程.html",N07="07 常微分方程";
  const R08="08-拉氏轉換.html",N08="08 拉氏轉換";
  const R09="09-複變入門.html",N09="09 複變入門";
  const R10="10-傅立葉分析.html",N10="10 傅立葉分析";
  const R11="11-PDE與向量分析.html",N11="11 PDE與向量分析";
  const R12="12-機率與隨機變數.html",N12="12 機率與隨機變數";
  const R13="13-統計推論與隨機過程.html",N13="13 統計推論與隨機過程";
  const Q={
    'q00-1':{t:'sel',ans:'a',why:'i = C dv/dt 直接寫著「電壓對時間的變化率」，那就是微分。',fix:'常見誤解是看到電容就想到儲能積分；儲能確實是積分，但這條式子問的是電流，用的是微分。',ref:R01,refName:N01},
    'q00-2':{t:'sel',ans:'b',why:'y = Hx + n 就是一次矩陣乘向量，H 把發射向量搬成接收向量。',fix:'容易誤選傅立葉，因為通訊常談頻譜；但這條式子本身沒有任何頻率變數，它是線性代數。',ref:R04,refName:N04},
    'q01-1':{t:'num',ans:2.1,tol:0.005,why:'(1.1² − 1²) / 0.1 = (1.21 − 1) / 0.1 = 2.100000，殘留的 0.1 正好等於 h。',fix:'算成 2 的話是把解析導數當成差商了；差商一定會帶著 h 的誤差項。',ref:R01,refName:N01},
    'q01-2':{t:'num',ans:2,tol:0.001,why:'f(x) = x² 的導數是 2x，代 x = 1 得 2。',fix:'若寫 2.1，那是前向差商的值，不是解析導數。',ref:R01,refName:N01},
    'q01-3':{t:'sel',ans:'b',why:'前向差商的誤差主項正比於 h，h 縮到 1/10，誤差也大約縮到 1/10。',fix:'誤選「變 1/100」是把前向誤差當成中央差商的 h² 行為了。',ref:R01,refName:N01},
    'q02-1':{t:'num',ans:0.333333,tol:0.001,why:'∫₀¹ x² dx = [x³/3]₀¹ = 1/3 = 0.333333。',fix:'算成 0.5 是把 x² 當成 x 積分了。',ref:R02,refName:N02},
    'q02-2':{t:'num',ans:0.21875,tol:0.0005,why:'0.25 ⋅ (0² + 0.25² + 0.5² + 0.75²) = 0.25 ⋅ 0.875 = 0.218750，比真值 1/3 低估。',fix:'算成 0.468750 的是右端點和；遞增函式的左端點會低估。',ref:R02,refName:N02},
    'q02-3':{t:'sel',ans:'b',why:'中點法是二階方法，誤差 ∝ 1/n²，n 加倍誤差大約變 1/4。',fix:'誤選「減半」是把它當成左右端點那種一階方法。',ref:R02,refName:N02},
    'q03-1':{t:'num',ans:2.666667,tol:0.001,why:'1 + 1 + 1/2 + 1/6 = 2.666667，真值 e = 2.718282，誤差 0.051615。',fix:'寫 2.718282 是填了真值而不是截斷到 x³ 的部分和。',ref:R03,refName:N03},
    'q03-2':{t:'sel',ans:'b',why:'把 e^x 的級數代入 x = jθ，偶次項收成 cos θ、奇次項收成 j sin θ，得 e^(jθ) = cos θ + j sin θ。',fix:'選 cos θ − j sin θ 的是 e^(−jθ)，差一個共軛。',ref:R03,refName:N03},
    'q04-1':{t:'num',ans:6,tol:0.001,why:'第 2 個分量 = 0⋅1 + 3⋅2 = 6，也就是 A 的第 2 列與 x 的內積。',fix:'算成 4 的是第 1 個分量；列的順序不要弄反。',ref:R04,refName:N04},
    'q04-2':{t:'sel',ans:'b',why:'(AB)x = A(Bx)，最靠近 x 的先作用，所以是先做 B 再做 A。',fix:'誤選「順序可交換」是最常見的坑：矩陣乘法一般 AB ≠ BA。',ref:R04,refName:N04},
    'q05-1':{t:'num',ans:2,tol:0.001,why:'兩式相加得 3x = 6，x = 2，再代回得 y = 1。',fix:'算成 1 的是 y 的值，看清楚問的是哪一個未知數。',ref:R05,refName:N05},
    'q05-2':{t:'num',ans:-3,tol:0.001,why:'det = 2⋅(−1) − 1⋅1 = −3，不為零所以有唯一解。',fix:'算成 3 是漏了負號；det 是有號的，符號帶著方向資訊。',ref:R05,refName:N05},
    'q05-3':{t:'sel',ans:'c',why:'增廣矩陣的秩比係數矩陣大，代表 b 不在 A 的欄空間裡，方程互相矛盾，無解。',fix:'誤選「無限多解」是把兩個秩相等的情況記錯了；相等才有解。',ref:R05,refName:N05},
    'q06-1':{t:'num',ans:3,tol:0.001,why:'T = 4、D = 3，λ = (4 ± √(16 − 12))/2 = (4 ± 2)/2，較大的是 3。',fix:'算成 1 的是較小的那個特徵值。',ref:R06,refName:N06},
    'q06-2':{t:'sel',ans:'c',why:'A(1,1) = (2+1, 1+2) = (3,3) = 3⋅(1,1)，方向不變、長度變 3 倍，所以 λ = 3。',fix:'選 λ = 1 的是配到了另一個特徵向量 (1, −1)。',ref:R06,refName:N06},
    'q06-3':{t:'sel',ans:'b',why:'ẋ = Ax 的解由 e^(λt) 組成，只有所有特徵值實部為負，每個模態才會衰減。',fix:'誤選 det(A) = 0 的是把「可逆」和「穩定」混在一起了，兩者無關。',ref:R06,refName:N06},
    'q07-1':{t:'num',ans:3.160603,tol:0.02,why:'v(1) = 5(1 − e^(−1)) = 5 ⋅ 0.632121 = 3.160603 V，正好是全程的 63.2 %。',fix:'算成 5 的是把穩態值當成 t = τ 的值；τ 只走完 63.2 %。',ref:R07,refName:N07},
    'q07-2':{t:'num',ans:63.2,tol:0.5,why:'1 − e^(−1) = 0.632121，所以 t = τ 走完 63.2 %；3τ 是 95.0 %、5τ 是 99.3 %。',fix:'填 100 的是把時間常數當成「充飽的時間」，那是最常見的誤解。',ref:R07,refName:N07},
    'q07-3':{t:'sel',ans:'c',why:'0 < ζ < 1 是欠阻尼，特徵根為共軛複數，響應會邊振盪邊衰減。',fix:'誤選臨界阻尼的是把 ζ = 0.5 記成 ζ = 1；臨界阻尼剛好在 ζ = 1。',ref:R07,refName:N07},
    'q08-1':{t:'sel',ans:'b',why:'分部積分給出 L{f′} = sF(s) − f(0)，微分變成乘 s 再扣掉初值，初值條件因此自動被帶進代數式。',fix:'選「乘以 jω」的是傅立葉轉換的性質，那裡沒有初值項。',ref:R08,refName:N08},
    'q08-2':{t:'num',ans:1,tol:0.001,why:'σ = −1，τ = 1/|σ| = 1 s，包絡 e^(−t) 在 1 秒後剩 36.8 %。',fix:'填 2 的是拿了虛部 ω；τ 只由實部決定。',ref:R08,refName:N08},
    'q08-3':{t:'sel',ans:'c',why:'右半平面代表 σ > 0，包絡 e^(σt) 遞增，任何擾動都被放大。',fix:'誤選「無法判斷」的是忘了極點實部就是判準本身。',ref:R08,refName:N08},
    'q09-1':{t:'sel',ans:'b',why:'(1 + j)⋅j = j + j² = j − 1 = −1 + j，也就是把 1 + j 逆時針轉了 90°。',fix:'選 1 − j 的多半是把 j² 當成 +1；j² = −1。',ref:R09,refName:N09},
    'q09-2':{t:'num',ans:1.414214,tol:0.01,why:'|1 + j| = √(1² + 1²) = √2 = 1.414214，幅角 45°。',fix:'填 2 的是算了模的平方而沒有開根號。',ref:R09,refName:N09},
    'q09-3':{t:'sel',ans:'b',why:'v = L di/dt 在相量下對應 V = jωL I，所以 Z_L = jωL，頻率越高阻抗越大。',fix:'選 1/(jωC) 的是電容的阻抗，兩者剛好相反。',ref:R09,refName:N09},
    'q10-1':{t:'num',ans:1.273240,tol:0.005,why:'方波只留基波時，(4/π)⋅sin(2π⋅0.25) = 4/π = 1.273240，比目標 1 高出 0.273240。',fix:'填 1 的是填了目標值；只有一項時部分和一定會超過。',ref:R10,refName:N10},
    'q10-2':{t:'sel',ans:'c',why:'卷積定理：時間域卷積 ⇔ 頻率域相乘，這就是濾波器可以用頻率響應相乘來理解的原因。',fix:'誤選「卷積」的是把兩邊寫反了；相乘才是頻率域那一側。',ref:R10,refName:N10},
    'q10-3':{t:'num',ans:40,tol:0.1,why:'取樣定理 f_s ≥ 2W，W = 20 kHz 得最低 40 kHz，低於它就會摺疊。',fix:'填 20 的是直接抄了頻寬，忘了乘 2。',ref:R10,refName:N10},
    'q11-1':{t:'num',ans:2,tol:0.001,why:'∇⋅F = ∂x/∂x + ∂y/∂y = 1 + 1 = 2，代表每一點都是源，向外淨流出。',fix:'填 0 的多半是和 F = (−y, x) 的散度搞混了。',ref:R11,refName:N11},
    'q11-2':{t:'num',ans:2,tol:0.001,why:'旋度 z 分量 = ∂F_y/∂x − ∂F_x/∂y = 1 − (−1) = 2，這是純旋轉場。',fix:'填 0 的是把它當成無旋場；(−y, x) 正是最典型的有旋場。',ref:R11,refName:N11},
    'q11-3':{t:'sel',ans:'b',why:'梯度場一定無旋，∇ × (∇φ) = 0，這正是電位 V 存在、E = −∇V 成立的理由。',fix:'誤選 ∇²φ 的是把「旋度作用在梯度」和「散度作用在梯度」混了，後者才是拉普拉斯算子。',ref:R11,refName:N11},
    'q12-1':{t:'num',ans:3.5,tol:0.001,why:'(1+2+3+4+5+6)/6 = 3.5。期望值是重心，不一定是擲得出來的點數。',fix:'填 3 或 4 的是想找一個「實際會出現的值」；期望值沒有這個限制。',ref:R12,refName:N12},
    'q12-2':{t:'num',ans:0.246094,tol:0.002,why:'C(10,5)⋅0.5^10 = 252/1024 = 0.246094，是二項分布的最高點。',fix:'填 0.5 的是把「成功機率」當成「剛好五次的機率」。',ref:R12,refName:N12},
    'q12-3':{t:'sel',ans:'b',why:'CLT 說的是獨立同分布樣本和（或樣本平均）的分布趨近高斯，與原分布長什麼樣無關。',fix:'誤選「樣本平均收斂到母體平均」的是大數法則，那是另一條定理。',ref:R12,refName:N12},
    'q13-1':{t:'num',ans:4.216,tol:0.01,why:'SE = 2/√25 = 0.4，半寬 = 1.960 × 0.4 = 0.784，下界 = 5 − 0.784 = 4.216。',fix:'填 4.6 的多半是漏乘了 z 值，直接拿 SE 當半寬。',ref:R13,refName:N13},
    'q13-2':{t:'num',ans:4,tol:0.001,why:'半寬 ∝ 1/√n，要減半就要讓 √n 變 2 倍，也就是 n 變 4 倍。',fix:'填 2 的是忘了開根號；統計的成本是平方成長的。',ref:R13,refName:N13},
    'q13-3':{t:'sel',ans:'b',why:'白雜訊的「白」指功率譜密度為常數，所有頻率一樣強；它的自相關才是脈衝 δ(τ)。',fix:'選「是脈衝」的是把自相關和功率譜密度對調了，兩者互為傅立葉轉換對。',ref:R13,refName:N13}
  };
  const ids=Object.keys(Q);
  const progress=()=>{
    const n=ids.filter(i=>$(i)&&String($(i).value).trim()!=='').length;
    $('quiz-progress').textContent="已作答 "+n+" / "+ids.length+" 題（僅供參考，不影響瀏覽）";
  };
  const link=q=>'<a href="'+q.ref+'">'+q.refName+'</a>';
  const check=id=>{
    const q=Q[id],node=$(id),out=$(id+'-output');
    if(!q||!node||!out)return;
    const raw=String(node.value).trim();
    if(raw===''){
      out.innerHTML=q.t==='num'?"<p>先填一個數字再對答案。</p>":"<p>先選一個選項再對答案。</p>";
      progress();return;
    }
    let ok;
    if(q.t==='num'){
      const v=Number(raw);
      ok=isFinite(v)&&Math.abs(v-q.ans)<=q.tol;
    }else{
      ok=(raw===q.ans);
    }
    if(ok){
      out.innerHTML="<p><strong>答對</strong>："+q.why+"　回頭複習："+link(q)+"</p>";
    }else{
      const shownAns=q.t==='num'?trimZeros(fmt(q.ans,6)):q.ans;
      out.innerHTML="<p><strong>再看一次</strong>：正確答案是 "+shownAns+"。"+q.why+"</p><p>常見卡點："+q.fix+"　建議回去看："+link(q)+"</p>";
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

// 6. 註冊
if(typeof document!=="undefined"){
  [mathmap,secant,riemann,taylor,matvec,linsolve,eigen2,odestep,polezero,cmul,fourier,fieldops,dist,ci,dictionary,selfcheck].forEach(f=>f());
}

// 7. 匯出（供 node --check 與人工交叉驗算）
if(typeof module!=="undefined")module.exports={fmt,fmtSigned,num,clamp,rad,deg,nCk,factorial,normalPdf,normalCdf,norm2,vec2,angleDeg};

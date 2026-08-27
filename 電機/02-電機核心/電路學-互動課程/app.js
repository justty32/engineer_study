"use strict";
// 電路學（零基礎互動課）：所有頁面共用的互動邏輯。
// 規則：確定性（不使用亂數、不讀時鐘）、無外部請求、每個 widget 一個守衛函式。
// 每個守衛函式先確認自己那一頁的主控制存在，不存在就直接跳出，所以同一支檔可以掛在全部頁面。

// 1. helper
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=(x,n=6)=>{if(typeof x!=="number")x=Number(x);if(!isFinite(x))return x>0?"∞":(x<0?"−∞":"未定義");return x.toFixed(n).replace("-","−")};
const fmtSigned=(x,n=6)=>{if(typeof x!=="number")x=Number(x);if(!isFinite(x))return fmt(x,n);return (x>=0?"+":"−")+Math.abs(x).toFixed(n)};
const expHtml=(x,n=6)=>{if(typeof x!=="number")x=Number(x);if(!isFinite(x))return fmt(x,n);if(x===0)return "0";const e=Math.floor(Math.log10(Math.abs(x)));const m=x/Math.pow(10,e);return fmt(m,n)+" × 10<sup>"+String(e).replace("-","−")+"</sup>"};
const trimZeros=s=>{let r=String(s);if(r.indexOf(".")<0)return r;while(r.charAt(r.length-1)==="0")r=r.slice(0,-1);if(r.charAt(r.length-1)===".")r=r.slice(0,-1);return r};
const val=x=>{const n=$(x);return n?Number(n.value):0};
const pick=x=>{const n=$(x);return n?String(n.value):""};

// 2. 電路工具
const par=(a,b)=>{const s=a+b;return s===0?0:a*b/s};
const dbv=x=>x>0?20*Math.log10(x):-Infinity;
const hyp=Math.hypot;
// 秒 → 自動換成 s / ms / µs
const fmtEng=(s,n=6)=>{if(typeof s!=="number")s=Number(s);if(!isFinite(s))return fmt(s,n);const a=Math.abs(s);if(a>=1)return fmt(s,n)+" s";if(a>=1e-3)return fmt(s*1e3,n)+" ms";return fmt(s*1e6,n)+" µs"};
const P=s=>"<p>"+s+"</p>";
const setOut=(id,rows)=>{const n=$(id);if(n)n.innerHTML=rows.join("")};
// 把角度正規化到 (−180, 180]
const wrapDeg=d=>{let r=d;while(r<=-180)r+=360;while(r>180)r-=360;return r};

// 3. 各章守衛函式

// 00 集總假設
function lumped(){
  if(!$('lum-v'))return;
  const draw=()=>{
    const v=val('lum-v'),iMA=val('lum-i'),t=val('lum-t'),fMHz=val('lum-f'),d=val('lum-d');
    const iSI=iMA*1e-3;
    const Q=iSI*t;
    const N=Q/1.602176634e-19;
    const p=v*iSI;
    const w=p*t;
    const lam=fMHz>0?3e8/(fMHz*1e6):Infinity;
    const ratio=isFinite(lam)&&lam>0?d/lam:0;
    const rows=[];
    rows.push(P("電荷 Q = I ⋅ t = "+fmt(iSI,6)+" A × "+fmt(t,0)+" s = <strong>"+fmt(Q,6)+" C</strong>"));
    rows.push(P("換算成電子個數 N = Q / 1.602176634 × 10<sup>−19</sup> = <strong>"+expHtml(N,6)+" 個</strong>。1 A 就是每秒約 6.24 × 10<sup>18</sup> 個電子通過截面。"));
    rows.push(P("功率 P = V ⋅ I = "+fmt(v,0)+" V × "+fmt(iSI,6)+" A = <strong>"+fmt(p,6)+" W</strong>；單位自己約掉電荷：(J/C) × (C/s) = J/s。"));
    rows.push(P("能量 W = P ⋅ t = <strong>"+fmt(w,6)+" J</strong>。功率是能量流的速率，能量才是它對時間的累積。"));
    rows.push(P("波長 λ = c / f = 3 × 10<sup>8</sup> / "+expHtml(fMHz*1e6,6)+" = <strong>"+fmt(lam,6)+" m</strong>；電路最長尺寸 d = "+fmt(d,2)+" m，尺寸比 d/λ = <strong>"+fmt(ratio,6)+"</strong>。"));
    if(ratio<0.05){
      rows.push(P("<strong>集總假設成立</strong>：訊號跨過整個電路造成的相位差小於 18°，所以可以把每個元件當成一個點，用節點電壓與支路電流描述。"));
    }else if(ratio<0.5){
      rows.push(P("<strong>灰色地帶</strong>：相位差已經到 18°–180°，走線長度開始影響結果，實務上要開始考慮走線等長與阻抗控制。"));
    }else{
      rows.push(P("<strong>集總假設失效</strong>：電路尺寸已經和半個波長同量級，必須改用傳輸線模型（特性阻抗、反射、終端），本課的所有方法在這裡都不能直接用——請去 IoT 硬體課的匯流排章。"));
    }
    rows.push(P("為什麼：λ = c/f，頻率愈高波長愈短，同一塊板子就愈容易踩出分布效應。"));
    if(fMHz<=1){
      rows.push(P("邊界提醒：f = 1 MHz 時 λ = 300 m，幾乎任何實驗室尺寸的電路在這裡都是集總，你可以放心用本課的方法。"));
    }else if(fMHz>=5000){
      rows.push(P("邊界提醒：f = 5000 MHz 時 λ 只剩 0.06 m，只要 d ≥ 0.03 m 就進入 d/λ ≥ 0.5 的失效區——這正是 5 GHz 天線走線要當傳輸線設計的原因。"));
    }
    setOut('lumped-output',rows);
  };
  ['lum-v','lum-i','lum-t','lum-f','lum-d'].forEach(x=>on(x,'input',draw));
  draw();
}

// 01 歐姆定律與串並聯
function ohm(){
  if(!$('ohm-mode'))return;
  const draw=()=>{
    const mode=pick('ohm-mode'),vs=val('ohm-vs'),r1=val('ohm-r1'),r2=val('ohm-r2');
    const rows=[];
    let req,i,v1,v2,i1,i2,p1,p2;
    if(mode==='parallel'){
      req=par(r1,r2);i1=vs/r1;i2=vs/r2;i=i1+i2;v1=vs;v2=vs;p1=vs*vs/r1;p2=vs*vs/r2;
    }else{
      req=r1+r2;i=vs/req;i1=i;i2=i;v1=i*r1;v2=i*r2;p1=i*i*r1;p2=i*i*r2;
    }
    const psrc=vs*i,resid=psrc-p1-p2;
    rows.push(P("模式："+(mode==='parallel'?"<strong>並聯</strong>（同一個電壓加在兩顆上）":"<strong>串聯</strong>（同一個電流流過兩顆）")+"；V<sub>s</sub> = "+fmt(vs,0)+" V、R<sub>1</sub> = "+fmt(r1,0)+" Ω、R<sub>2</sub> = "+fmt(r2,0)+" Ω。"));
    rows.push(P("等效電阻 R<sub>eq</sub> = <strong>"+fmt(req,6)+" Ω</strong>；總電流 I = V<sub>s</sub>/R<sub>eq</sub> = <strong>"+fmt(i*1000,6)+" mA</strong>。"));
    rows.push(P("R<sub>1</sub>：電壓 "+fmt(v1,6)+" V、電流 "+fmt(i1*1000,6)+" mA、功率 "+fmt(p1*1000,6)+" mW。"));
    rows.push(P("R<sub>2</sub>：電壓 "+fmt(v2,6)+" V、電流 "+fmt(i2*1000,6)+" mA、功率 "+fmt(p2*1000,6)+" mW。"));
    rows.push(P("電源送出的功率 P<sub>源</sub> = V<sub>s</sub> ⋅ I = <strong>"+fmt(psrc*1000,6)+" mW</strong>；功率殘差 P<sub>源</sub> − P<sub>1</sub> − P<sub>2</sub> = "+expHtml(resid,3)+" W。"));
    if(Math.abs(resid)<1e-9){
      rows.push(P("殘差在 10<sup>−9</sup> W 以內：所有電阻消耗的功率相加等於電源送出的功率——這是能量守恆，也是你檢查自己算錯沒有的第一招。"));
    }
    if(mode==='parallel'){
      const share=r2/(r1+r2);
      rows.push(P("分流比 G<sub>1</sub>/(G<sub>1</sub> + G<sub>2</sub>) = <strong>"+fmt(share,6)+"</strong>：並聯時小電阻分到大電流，因為電壓一樣，i = v/R。"));
      rows.push(P("R<sub>eq</sub> = "+fmt(req,6)+" Ω 比兩顆裡較小的 "+fmt(Math.min(r1,r2),0)+" Ω 還小——多開一條路只會讓總電阻變小。"));
    }else{
      const share=r2/(r1+r2);
      rows.push(P("分壓比 R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = <strong>"+fmt(share,6)+"</strong>：串聯時大電阻分到大電壓，因為電流一樣，v = iR。"));
    }
    if(r1===r2){
      rows.push(P("兩顆電阻相等時的對稱：串聯 R<sub>eq</sub> = 2R = "+fmt(2*r1,6)+" Ω、並聯 R<sub>eq</sub> = R/2 = "+fmt(r1/2,6)+" Ω。"));
    }
    const bigger=Math.max(r1,r2),smaller=Math.min(r1,r2);
    if(bigger/smaller>=100){
      const domi=bigger/(r1+r2)*100;
      rows.push(P("邊界提醒：兩顆差了 "+fmt(bigger/smaller,0)+" 倍。串聯時 "+fmt(domi,2)+" % 的電壓落在大電阻上，並聯時同樣比例的電流走小電阻。差 100 倍時，另一個幾乎可以當作不存在——這就是為什麼實務上敢做近似。"));
    }
    setOut('ohm-output',rows);
  };
  ['ohm-mode','ohm-vs','ohm-r1','ohm-r2'].forEach(x=>on(x,'input',draw));
  draw();
}

// 02 KCL 與 KVL
function kirchhoff(){
  if(!$('kir-vs'))return;
  const draw=()=>{
    const vs=val('kir-vs'),r1=val('kir-r1'),r2=val('kir-r2'),r3=val('kir-r3');
    const rp=par(r2,r3);
    const va=vs*rp/(r1+rp);
    const i1=(vs-va)/r1,i2=va/r2,i3=va/r3;
    const kcl=i1-i2-i3,kvl=vs-i1*r1-va;
    const psrc=vs*i1,psum=i1*i1*r1+va*va/r2+va*va/r3;
    const rows=[];
    rows.push(P("拓樸：V<sub>s</sub> 正端 → R<sub>1</sub> → 節點 A；節點 A → R<sub>2</sub> → 地；節點 A → R<sub>3</sub> → 地；V<sub>s</sub> 負端 → 地。"));
    rows.push(P("R<sub>2</sub>‖R<sub>3</sub> = R<sub>2</sub>R<sub>3</sub>/(R<sub>2</sub> + R<sub>3</sub>) = <strong>"+fmt(rp,6)+" Ω</strong>；節點電壓 V<sub>A</sub> = V<sub>s</sub> ⋅ (R<sub>2</sub>‖R<sub>3</sub>)/(R<sub>1</sub> + R<sub>2</sub>‖R<sub>3</sub>) = <strong>"+fmt(va,6)+" V</strong>。"));
    rows.push(P("I<sub>1</sub>（流入 A）= <strong>"+fmt(i1*1000,6)+" mA</strong>；I<sub>2</sub>（經 R<sub>2</sub> 流出）= <strong>"+fmt(i2*1000,6)+" mA</strong>；I<sub>3</sub>（經 R<sub>3</sub> 流出）= <strong>"+fmt(i3*1000,6)+" mA</strong>。"));
    rows.push(P("KCL 殘差 I<sub>1</sub> − I<sub>2</sub> − I<sub>3</sub> = "+expHtml(kcl,3)+" A；KVL 殘差 V<sub>s</sub> − I<sub>1</sub>R<sub>1</sub> − V<sub>A</sub> = "+expHtml(kvl,3)+" V。"));
    if(Math.abs(kcl)<1e-9&&Math.abs(kvl)<1e-9){
      rows.push(P("兩個殘差都是 0：這組解同時滿足電荷守恆與能量守恆——<strong>這就是驗算，不是多此一舉</strong>。"));
    }
    rows.push(P("I<sub>2</sub>/I<sub>3</sub> = <strong>"+fmt(i3===0?0:i2/i3,6)+"</strong>，等於 R<sub>3</sub>/R<sub>2</sub> = "+fmt(r3/r2,6)+"：兩者跨在同一個電壓上，電阻大的分到的電流小。"));
    rows.push(P("源功率 "+fmt(psrc*1000,6)+" mW、元件功率總和 "+fmt(psum*1000,6)+" mW，差 "+expHtml(psrc-psum,3)+" W。功率也守恆，但它是 KVL 與 KCL 的推論，不是第三條獨立的律。"));
    rows.push(P("為什麼：V<sub>A</sub> 之所以是這個值，是因為 R<sub>1</sub> 上的壓降必須剛好讓流進 A 的電流等於流出 A 的電流。"));
    if(r1<=rp/5){
      rows.push(P("邊界提醒：R<sub>1</sub> 遠小於 R<sub>2</sub>‖R<sub>3</sub>，V<sub>A</sub> 逼近 V<sub>s</sub>。上游電阻很小時，節點電壓幾乎被電源鉗住，這就是「低阻抗源」的意思。"));
    }else if(r1>=rp*5){
      rows.push(P("邊界提醒：R<sub>1</sub> 遠大於 R<sub>2</sub>‖R<sub>3</sub>，V<sub>A</sub> 掉得很低。上游電阻很大時，任何負載變動都會把節點電壓拉垮，這就是為什麼分壓器不能直接當電源用。"));
    }
    setOut('kirchhoff-output',rows);
  };
  ['kir-vs','kir-r1','kir-r2','kir-r3'].forEach(x=>on(x,'input',draw));
  draw();
}

// 03 節點分析（2×2）
function nodal2(){
  if(!$('nod-r1'))return;
  const draw=()=>{
    const r1=val('nod-r1'),r2=val('nod-r2'),r3=val('nod-r3'),is1=val('nod-is1'),is2=val('nod-is2');
    const g1=1000/r1,g2=1000/r2,g3=1000/r3;
    const a=g1+g2,b=-g2,c=-g2,d=g2+g3;
    const det=a*d-b*c;
    const rows=[];
    rows.push(P("單位用 mS 與 mA，算出來直接是 V（因為 mA/mS = V）。G<sub>1</sub> = "+fmt(g1,6)+"、G<sub>2</sub> = "+fmt(g2,6)+"、G<sub>3</sub> = "+fmt(g3,6)+" mS。"));
    rows.push(P("G 矩陣 = [["+fmt(a,6)+", "+fmt(b,6)+"], ["+fmt(c,6)+", "+fmt(d,6)+"]]（mS）：第一列 "+fmt(a,6)+"、"+fmt(b,6)+"；第二列 "+fmt(c,6)+"、"+fmt(d,6)+"。"));
    rows.push(P("行列式 det = ad − bc = <strong>"+fmt(det,6)+" (mS)²</strong>。"));
    if(!(Math.abs(det)>1e-12)){
      rows.push(P("行列式太接近 0，這組參數在數值上無法解出唯一的節點電壓，請把電阻拉回一般值。"));
      setOut('nodal2-output',rows);return;
    }
    const v1=(is1*d-b*is2)/det,v2=(a*is2-c*is1)/det;
    const res1=a*v1+b*v2-is1,res2=c*v1+d*v2-is2;
    const i2branch=(v2-v1)*g2;
    rows.push(P("v<sub>1</sub> = (I<sub>s1</sub>d − bI<sub>s2</sub>)/det = <strong>"+fmt(v1,6)+" V</strong>；v<sub>2</sub> = (aI<sub>s2</sub> − cI<sub>s1</sub>)/det = <strong>"+fmt(v2,6)+" V</strong>。"));
    rows.push(P("代回殘差：式 1 = "+expHtml(res1,3)+" mA、式 2 = "+expHtml(res2,3)+" mA。"));
    if(Math.abs(res1)<1e-9&&Math.abs(res2)<1e-9){
      rows.push(P("把解代回原方程完全對上，這就是驗算。"));
    }
    rows.push(P("det 恆為正：被動電阻網路的 G 矩陣有對角優勢（對角元是所有連到該節點的電導和，一定大於旁邊那一項），所以行列式不會是 0——<strong>電路一定有唯一解，不會像數學課那樣出現無解或無限多解</strong>。"));
    if(Math.abs(v2-v1)<1e-12){
      rows.push(P("v<sub>2</sub> − v<sub>1</sub> = 0：兩節點等電位，R<sub>2</sub> 上沒有電流，這時候它有沒有接都一樣。"));
    }else if(v2>v1){
      rows.push(P("v<sub>2</sub> − v<sub>1</sub> = "+fmt(v2-v1,6)+" V > 0：電流由節點 2 流向節點 1，大小 "+fmt(Math.abs(i2branch),6)+" mA。"));
    }else{
      rows.push(P("v<sub>2</sub> − v<sub>1</sub> = "+fmt(v2-v1,6)+" V < 0：電流由節點 1 流向節點 2，大小 "+fmt(Math.abs(i2branch),6)+" mA。"));
    }
    rows.push(P("為什麼：節點電壓被「流進來的電流必須全部流出去」這條 KCL 決定，電阻只是把電流換算成電壓的匯率。"));
    if(is1===0&&is2===0){
      rows.push(P("邊界提醒：兩個電流源都是 0，兩個節點電壓也都是 0——沒有源就沒有響應，這是線性電路的必然。"));
    }else if(r2>=5*r1&&r2>=5*r3){
      rows.push(P("邊界提醒：R<sub>2</sub> 遠大於 R<sub>1</sub> 與 R<sub>3</sub>，非對角元趨近 0，兩個節點幾乎解耦，可以各自當獨立電路算。"));
    }else if(r2<=r1/5&&r2<=r3/5){
      rows.push(P("邊界提醒：R<sub>2</sub> 遠小於 R<sub>1</sub> 與 R<sub>3</sub>，兩節點被強耦合，電壓幾乎相等（差 "+fmt(Math.abs(v2-v1),6)+" V）。"));
    }
    setOut('nodal2-output',rows);
  };
  ['nod-r1','nod-r2','nod-r3','nod-is1','nod-is2'].forEach(x=>on(x,'input',draw));
  draw();
}

// 04 疊加原理
function superpose(){
  if(!$('sup-vs'))return;
  const draw=()=>{
    const vs=val('sup-vs'),r1=val('sup-r1'),isMA=val('sup-is'),r2=val('sup-r2');
    const isSI=isMA*1e-3;
    const vaV=vs*r2/(r1+r2);
    const vaI=isSI*par(r1,r2);
    const va=vaV+vaI;
    const vaDirect=(vs/r1+isSI)/(1/r1+1/r2);
    const pTot=va*va/r2,pV=vaV*vaV/r2,pI=vaI*vaI/r2,cross=2*vaV*vaI/r2;
    const rows=[];
    rows.push(P("V<sub>s</sub> 單獨作用（I<sub>s</sub> 開路，純分壓）：V<sub>A,V</sub> = V<sub>s</sub> ⋅ R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = <strong>"+fmt(vaV,6)+" V</strong>。"));
    rows.push(P("I<sub>s</sub> 單獨作用（V<sub>s</sub> 短路，R<sub>1</sub>‖R<sub>2</sub>）：V<sub>A,I</sub> = I<sub>s</sub> ⋅ (R<sub>1</sub>‖R<sub>2</sub>) = <strong>"+fmt(vaI,6)+" V</strong>。"));
    rows.push(P("兩者相加 V<sub>A</sub> = <strong>"+fmt(va,6)+" V</strong>；節點法一次算完 = <strong>"+fmt(vaDirect,6)+" V</strong>；差 "+expHtml(va-vaDirect,3)+" V。"));
    if(Math.abs(va-vaDirect)<1e-9){
      rows.push(P("<strong>電壓可以疊加</strong>：因為節點方程對源是線性的，把源拆開再相加跟一次算完是同一件事。"));
    }
    rows.push(P("R<sub>2</sub> 的總功率 = <strong>"+fmt(pTot*1000,4)+" mW</strong>；V<sub>s</sub> 單獨時 "+fmt(pV*1000,4)+" mW、I<sub>s</sub> 單獨時 "+fmt(pI*1000,4)+" mW，分項相加 "+fmt((pV+pI)*1000,4)+" mW。"));
    rows.push(P("交叉項 2V<sub>A,V</sub>V<sub>A,I</sub>/R<sub>2</sub> = <strong>"+fmt(cross*1000,4)+" mW</strong>；分項加交叉項與總功率的差 = "+expHtml(pV+pI+cross-pTot,3)+" W。"));
    if(Math.abs(pV+pI+cross-pTot)<1e-9){
      rows.push(P("<strong>功率不能疊加</strong>：P 是電壓的平方，展開後多出 2V<sub>A,V</sub>V<sub>A,I</sub>/R<sub>2</sub> 這個交叉項，這就是分項相加對不上的原因。"));
    }
    if(isMA===0){
      rows.push(P("目前 I<sub>s</sub> = 0，所以 V<sub>A,I</sub> = 0、交叉項 = 0，分項相加<strong>剛好</strong>等於總功率——這是只有一個源時的特例，不是通則。"));
    }
    rows.push(P("齊次性檢查：把 V<sub>s</sub> 從 "+fmt(vs,0)+" V 加倍到 "+fmt(2*vs,0)+" V，V<sub>A,V</sub> 會從 "+fmt(vaV,6)+" V 變成 "+fmt(2*vaV,6)+" V，剛好兩倍。"));
    rows.push(P("為什麼：疊加能用是因為電路是線性的；功率不能疊加是因為功率不是電路變數，是電路變數的二次函式。"));
    if(vaI>2*vaV){
      rows.push(P("邊界提醒：電流源主導，V<sub>A</sub> 幾乎全由 I<sub>s</sub> 決定。"));
    }else if(r1<=r2/10){
      rows.push(P("邊界提醒：R<sub>1</sub> 遠小於 R<sub>2</sub>，V<sub>s</sub> 幾乎完全鉗住節點。低阻抗的源會壓過高阻抗的源，這是實務上判斷「誰說了算」的方法。"));
    }
    setOut('superpose-output',rows);
  };
  ['sup-vs','sup-r1','sup-is','sup-r2'].forEach(x=>on(x,'input',draw));
  draw();
}

// 05 戴維寧等效與最大功率
function thevenin(){
  if(!$('thv-vs'))return;
  const draw=()=>{
    const vs=val('thv-vs'),r1=val('thv-r1'),r2=val('thv-r2'),k=val('thv-k');
    const vth=vs*r2/(r1+r2),rth=par(r1,r2);
    const iN=rth>0?vth/rth:0;
    const rl=k*rth;
    const il=(rth+rl)>0?vth/(rth+rl):0;
    const vl=il*rl,pl=vl*il;
    const pmax=rth>0?vth*vth/(4*rth):0;
    const eta=(rth+rl)>0?rl/(rth+rl):0;
    const rows=[];
    rows.push(P("戴維寧等效：V<sub>th</sub> = V<sub>s</sub> ⋅ R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = <strong>"+fmt(vth,6)+" V</strong>；R<sub>th</sub> = R<sub>1</sub>‖R<sub>2</sub> = <strong>"+fmt(rth,6)+" Ω</strong>。"));
    rows.push(P("諾頓等效電流 I<sub>N</sub> = V<sub>th</sub>/R<sub>th</sub> = "+fmt(vth,6)+" / "+fmt(rth,6)+" = <strong>"+fmt(iN*1000,6)+" mA</strong>——兩邊數值對得上，證明諾頓與戴維寧是同一個電路的兩種寫法。"));
    rows.push(P("負載 R<sub>L</sub> = k × R<sub>th</sub> = "+fmt(k,1)+" × "+fmt(rth,6)+" = <strong>"+fmt(rl,6)+" Ω</strong>。"));
    rows.push(P("I<sub>L</sub> = <strong>"+fmt(il*1000,6)+" mA</strong>、V<sub>L</sub> = <strong>"+fmt(vl,6)+" V</strong>、P<sub>L</sub> = <strong>"+fmt(pl*1000,6)+" mW</strong>。"));
    rows.push(P("理論上限 P<sub>max</sub> = V<sub>th</sub>²/(4R<sub>th</sub>) = <strong>"+fmt(pmax*1000,6)+" mW</strong>；P<sub>L</sub>/P<sub>max</sub> = "+fmt(pmax>0?pl/pmax*100:0,3)+" %；效率 η = R<sub>L</sub>/(R<sub>th</sub> + R<sub>L</sub>) = <strong>"+fmt(eta*100,3)+" %</strong>。"));
    if(Math.abs(pl-pmax)<1e-12){
      rows.push(P("<strong>匹配點</strong>：R<sub>L</sub> = R<sub>th</sub>，負載拿到最大功率，但效率剛好 50 %——另一半燒在等效內阻上。"));
    }else if(k<1){
      rows.push(P("<strong>負載太小</strong>：電流變大但分到的電壓變小，功率下降，而且效率更差（大部分功率燒在 R<sub>th</sub> 上）。"));
    }else{
      rows.push(P("<strong>負載太大</strong>：效率變高（η = k/(1 + k) = "+fmt(k/(1+k)*100,3)+" %），但拿到的功率反而變少——要功率還是要效率，必須先決定。"));
    }
    rows.push(P("為什麼：R<sub>th</sub> 是把獨立源歸零後從端口看進去的電阻——它代表這個源「內部」有多少阻力，負載每多拿一點電流，端電壓就被它拉低一點。"));
    if(k<=0.1){
      rows.push(P("邊界提醒：k = "+fmt(k,1)+" 已經接近短路，η ≈ "+fmt(eta*100,3)+" %。電流最大但幾乎全部功率燒在源內部。"));
    }else if(k>=5){
      rows.push(P("邊界提醒：k = "+fmt(k,1)+" 已經接近開路，η ≈ "+fmt(eta*100,3)+" %、P<sub>L</sub>/P<sub>max</sub> ≈ "+fmt(pmax>0?pl/pmax*100:0,3)+" %。效率漂亮但功率很小，極限是開路時效率 100 %、功率 0 W——效率的定義在這裡會誤導人。"));
    }
    setOut('thevenin-output',rows);
  };
  ['thv-vs','thv-r1','thv-r2','thv-k'].forEach(x=>on(x,'input',draw));
  draw();
}

// 06 電容與電感
function storage(){
  if(!$('sto-type'))return;
  const draw=()=>{
    const type=pick('sto-type'),cUF=val('sto-c'),lMH=val('sto-l'),rate=val('sto-rate'),level=val('sto-level');
    const rows=[];
    let resp,w,ser,par2,jump;
    if(type==='ind'){
      const L=lMH*1e-3;
      resp=L*rate;w=0.5*L*level*level;ser=lMH*2;par2=lMH/2;jump=L*1e6;
      rows.push(P("目前元件：<strong>電感 L = "+fmt(lMH,0)+" mH</strong>，定義式 v = L ⋅ di/dt。"));
      rows.push(P("<strong>v = L ⋅ di/dt：電壓由電流的變化率決定</strong>。電流不動時電壓是 0，所以直流穩態下電感等於短路。"));
      rows.push(P("目前 di/dt = "+fmt(rate,0)+" A/s → v = "+fmt(L,6)+" H × "+fmt(rate,0)+" A/s = <strong>"+fmt(resp,6)+" V</strong>。"));
      rows.push(P("儲能 W<sub>L</sub> = (1/2)Li² = (1/2) × "+fmt(L,6)+" × "+fmt(level,1)+"² = <strong>"+fmt(w,6)+" J ＝ "+fmt(w*1000,6)+" mJ</strong>。"));
      rows.push(P("兩顆相同電感：串聯 <strong>"+fmt(ser,6)+" mH</strong>、並聯 <strong>"+fmt(par2,6)+" mH</strong>。"));
      rows.push(P("跳變代價：要讓這顆電感的電流在 1 µs 內跳 1 A，需要 v = L ⋅ di/dt = <strong>"+fmt(jump,6)+" V</strong>。這個數字就是連續性條件的量化證明——電感電流不能瞬變，硬要它跳就會打出這麼高的電壓。"));
    }else{
      const C=cUF*1e-6;
      resp=C*rate;w=0.5*C*level*level;ser=cUF/2;par2=cUF*2;jump=C*1e7;
      rows.push(P("目前元件：<strong>電容 C = "+fmt(cUF,0)+" µF</strong>，定義式 i = C ⋅ dv/dt。"));
      rows.push(P("<strong>i = C ⋅ dv/dt：電流由電壓的變化率決定，不是由電壓大小決定</strong>。電壓不動時電流是 0，所以直流穩態下電容等於開路。"));
      rows.push(P("目前 dv/dt = "+fmt(rate,0)+" V/s → i = "+fmt(C,9)+" F × "+fmt(rate,0)+" V/s = <strong>"+fmt(resp,6)+" A</strong>。"));
      rows.push(P("儲能 W<sub>C</sub> = (1/2)Cv² = (1/2) × "+fmt(C,9)+" × "+fmt(level,1)+"² = <strong>"+fmt(w,6)+" J ＝ "+fmt(w*1000,6)+" mJ</strong>。"));
      rows.push(P("兩顆相同電容：串聯 <strong>"+fmt(ser,6)+" µF</strong>、並聯 <strong>"+fmt(par2,6)+" µF</strong>。"));
      rows.push(P("跳變代價：要讓這顆電容的電壓在 1 µs 內跳 10 V（dv/dt = 10<sup>7</sup> V/s），需要 i = <strong>"+fmt(jump,6)+" A</strong>。這個數字就是連續性條件的量化證明——電容電壓不能瞬變，硬要它跳就要灌進這麼大的電流。"));
    }
    rows.push(P("串並聯規則對照：<strong>電容和電阻顛倒</strong>（並聯相加、串聯倒數相加），<strong>電感和電阻同形</strong>（串聯相加、並聯倒數相加）。"));
    if(rate===0){
      rows.push(P("目前變化率是 0，所以響應量也是 0——變化率為 0 → 響應為 0 → 這正是「直流穩態」的定義。"));
    }
    rows.push(P("為什麼：儲能只跟<strong>現在的狀態量</strong>有關，跟你怎麼走到這裡無關——這就是「狀態變數」的意思。"));
    if(level===0){
      rows.push(P("邊界提醒：狀態量為 0 時儲能是 0 J，但電流／電壓不一定是 0——狀態量與變化率是兩件獨立的事。"));
    }
    if(type==='cap'&&rate>=2000&&cUF>=500){
      rows.push(P("邊界提醒：大電容配上快速變化，需要的電流會很可觀（目前 "+fmt(resp,6)+" A），這是選旁路電容時的實際考量。"));
    }
    setOut('storage-output',rows);
  };
  ['sto-type','sto-c','sto-l','sto-rate','sto-level'].forEach(x=>on(x,'input',draw));
  draw();
}

// 07 一階暫態
function rctau(){
  if(!$('rc-type'))return;
  const draw=()=>{
    const type=pick('rc-type'),r=val('rc-r'),cUF=val('rc-c'),lMH=val('rc-l'),x0=val('rc-v0'),xInf=val('rc-vs'),k=val('rc-k');
    const rows=[];
    let tau,unit,form;
    if(type==='rl'){
      const L=lMH*1e-3;
      tau=r>0?L/r:0;unit="mA";
      form="τ = L / R = "+fmt(L,6)+" H / "+fmt(r,0)+" Ω";
    }else{
      const C=cUF*1e-6;
      tau=r*C;unit="V";
      form="τ = R × C = "+fmt(r,0)+" Ω × "+fmt(C,9)+" F";
    }
    if(!(tau>0)){
      rows.push(P("目前參數算出的時間常數不是正數，請把 R、C 或 L 拉回一般值。"));
      setOut('rctau-output',rows);return;
    }
    const t=k*tau;
    const x=xInf+(x0-xInf)*Math.exp(-k);
    const rem=Math.exp(-k)*100;
    rows.push(P("模式："+(type==='rl'?"<strong>RL</strong>（電感電流建立）":"<strong>RC</strong>（電容充放電）")+"；"+form+" = <strong>"+fmtEng(tau,6)+"</strong>（換算成秒是 "+fmt(tau,9)+" s）。"));
    rows.push(P("觀察時刻 t = "+fmt(k,1)+"τ = <strong>"+fmtEng(t,6)+"</strong>（換算成秒是 "+fmt(t,9)+" s）。"));
    rows.push(P("狀態量 x(t) = x(∞) + [x(0<sup>+</sup>) − x(∞)] e<sup>−t/τ</sup> = "+fmt(xInf,1)+" + ("+fmt(x0,1)+" − "+fmt(xInf,1)+") e<sup>−"+fmt(k,1)+"</sup> = <strong>"+fmt(x,6)+" "+unit+"</strong>。"));
    if(x0===xInf){
      rows.push(P("初值已等於終值，這條曲線是水平線，沒有暫態：不管等多久，狀態量都停在 "+fmt(x0,6)+" "+unit+"。"));
    }else{
      const pct=(x-x0)/(xInf-x0)*100;
      rows.push(P("完成百分比 = (x(t) − x(0<sup>+</sup>))/(x(∞) − x(0<sup>+</sup>)) = <strong>"+fmt(pct,4)+" %</strong>；剩餘差距 e<sup>−t/τ</sup> = <strong>"+fmt(rem,4)+" %</strong>。"));
      rows.push(P("τ 是「走完 63.2 %」所需的時間，<strong>不是走完 100 %</strong>——理論上永遠走不完，工程上算到 5τ 就當它到了（1τ 63.2121 %、3τ 95.0213 %、5τ 99.3262 %）。"));
      if(x0>xInf){
        rows.push(P("目前初值大於終值，<strong>這是放電</strong>：狀態量從高往低指數衰減，但 63.2 % 的意義不變——它走完的是<strong>初值到終值的差距</strong>的 63.2 %。"));
      }
    }
    if(k===0){
      rows.push(P("t = 0 時狀態量等於初值 "+fmt(x0,6)+" "+unit+"、完成 0 %，這就是連續性條件：開關動作那一瞬間，電容電壓與電感電流不會跳。"));
    }
    if(type==='rl'){
      rows.push(P("為什麼：RL 的 τ 和 R 成<strong>反比</strong>——電阻愈大，電流的終值愈小也愈快到位。"));
    }else{
      rows.push(P("為什麼：RC 的 τ 和 R 成<strong>正比</strong>——電阻愈大，充電流愈小，爬得愈慢。"));
    }
    if(k>=6){
      rows.push(P("邊界提醒：t = 6τ 時只剩 "+fmt(rem,4)+" % 的差距。超過 5τ 之後，剩下的差距已經小於量測誤差，實務上視為到達穩態。"));
    }
    if(tau<1e-6){
      rows.push(P("邊界提醒：τ 只有 "+fmtEng(tau,6)+"，這麼快的暫態需要頻寬夠的示波器才看得到，一般三用電表完全跟不上。"));
    }
    setOut('rctau-output',rows);
  };
  ['rc-type','rc-r','rc-c','rc-l','rc-v0','rc-vs','rc-k'].forEach(x=>on(x,'input',draw));
  draw();
}

// 08 二階 RLC 阻尼
function rlcdamp(){
  if(!$('rlc-r'))return;
  const draw=()=>{
    const r=val('rlc-r'),lMH=val('rlc-l'),cUF=val('rlc-c');
    const L=lMH*1e-3,C=cUF*1e-6;
    const w0=1/Math.sqrt(L*C);
    const f0=w0/(2*Math.PI);
    const alpha=r/(2*L);
    const zeta=alpha/w0;
    const rcrit=2*Math.sqrt(L/C);
    const q=w0*L/r;
    const rows=[];
    rows.push(P("ω<sub>0</sub> = 1/√(LC) = <strong>"+fmt(w0,6)+" rad/s</strong>（f<sub>0</sub> = "+fmt(f0,6)+" Hz）；α = R/(2L) = <strong>"+fmt(alpha,6)+" 1/s</strong>。"));
    rows.push(P("阻尼比 ζ = α/ω<sub>0</sub> = <strong>"+fmt(zeta,6)+"</strong>；臨界電阻 R<sub>臨界</sub> = 2√(L/C) = <strong>"+fmt(rcrit,6)+" Ω</strong>。"));
    rows.push(P("R/R<sub>臨界</sub> = "+fmt(r/rcrit,6)+"，<strong>這個比值就是 ζ</strong>（因為 ζ = R/(2√(L/C))）。"));
    rows.push(P("品質因數 Q = ω<sub>0</sub>L/R = <strong>"+fmt(q,6)+"</strong>；1/(2ζ) = <strong>"+fmt(1/(2*zeta),6)+"</strong>。ζ 和第 13 章的品質因數 Q 是同一件事：ζ 小 = Q 大 = 振很久 = 選頻很銳利。"));
    if(zeta<1-1e-9){
      const wd=w0*Math.sqrt(1-zeta*zeta);
      const td=2*Math.PI/wd;
      const envTau=1/alpha;
      const os=Math.exp(-Math.PI*zeta/Math.sqrt(1-zeta*zeta));
      rows.push(P("<strong>欠阻尼</strong>：兩個根是共軛複數，波形會以 ω<sub>d</sub> 振盪、被 e<sup>−αt</sup> 包住慢慢收斂。能量在 L 與 C 之間來回，R 每次來回收一次過路費。"));
      rows.push(P("ω<sub>d</sub> = ω<sub>0</sub>√(1 − ζ²) = <strong>"+fmt(wd,6)+" rad/s</strong>；振盪週期 T<sub>d</sub> = 2π/ω<sub>d</sub> = <strong>"+fmtEng(td,6)+"</strong>；包絡時間常數 1/α = <strong>"+fmtEng(envTau,6)+"</strong>。"));
      rows.push(P("超越量 OS = e<sup>−πζ/√(1 − ζ²)</sup> = <strong>"+fmt(os*100,4)+" %</strong>。"));
      if(zeta<=0.01){
        rows.push(P("邊界提醒：ζ = "+fmt(zeta,6)+" 幾乎無阻尼，超越量 "+fmt(os*100,2)+" %，振鈴會持續數百個週期——這在開關電源上就是要被抑制的 ringing。"));
      }
    }else if(Math.abs(zeta-1)<=1e-9){
      rows.push(P("<strong>臨界阻尼</strong>：重根 s = −α = "+fmt(-alpha,6)+" 1/s，時間常數 1/α = "+fmtEng(1/alpha,6)+"。這是<strong>不產生振盪的前提下最快</strong>安定的設定，不是絕對最快。"));
    }else{
      const rt=Math.sqrt(alpha*alpha-w0*w0);
      const s1=-alpha+rt,s2=-alpha-rt;
      const tauSlow=1/Math.abs(s1);
      rows.push(P("<strong>過阻尼</strong>：兩個相異負實根 s<sub>1</sub> = <strong>"+fmt(s1,6)+" 1/s</strong>、s<sub>2</sub> = <strong>"+fmt(s2,6)+" 1/s</strong>，不振盪。"));
      rows.push(P("慢根時間常數 1/|s<sub>1</sub>| = <strong>"+fmtEng(tauSlow,6)+"</strong>。注意慢根 s<sub>1</sub> 決定安定時間，<strong>R 再加大反而更慢</strong>。"));
      if(zeta>=3){
        rows.push(P("邊界提醒：ζ = "+fmt(zeta,6)+" 已經是嚴重過阻尼，響應像兩個一階電路串起來。"));
      }
    }
    rows.push(P("為什麼：ω<sub>0</sub> 決定振多快（只看 L 與 C），α 決定衰多快（只看 R 與 L），兩者的比值 ζ 決定會不會振。"));
    rows.push(P("順帶一提：R<sub>臨界</sub> = 2√(L/C) 只由 L 與 C 的比值決定，和 ω<sub>0</sub> 是兩件獨立的事——L 與 C 同時放大 100 倍，ω<sub>0</sub> 不變但 R<sub>臨界</sub> 會變。"));
    setOut('rlcdamp-output',rows);
  };
  ['rlc-r','rlc-l','rlc-c'].forEach(x=>on(x,'input',draw));
  draw();
}

// 09 相量相加
function phasor(){
  if(!$('ph-m1'))return;
  const draw=()=>{
    const m1=val('ph-m1'),a1=val('ph-a1'),m2=val('ph-m2'),a2=val('ph-a2');
    const x1=m1*Math.cos(rad(a1)),y1=m1*Math.sin(rad(a1));
    const x2=m2*Math.cos(rad(a2)),y2=m2*Math.sin(rad(a2));
    const sx=x1+x2,sy=y1+y2;
    const mag=hyp(sx,sy);
    const naive=m1+m2;
    const diff=naive-mag;
    const rms=mag/Math.SQRT2;
    const dphi=wrapDeg(a1-a2);
    const rows=[];
    rows.push(P("<strong>V</strong><sub>1</sub> = "+fmt(m1,6)+"∠"+fmt(a1,0)+"° = "+fmt(x1,6)+" "+(y1>=0?"+":"−")+" j"+fmt(Math.abs(y1),6)+"。"));
    rows.push(P("<strong>V</strong><sub>2</sub> = "+fmt(m2,6)+"∠"+fmt(a2,0)+"° = "+fmt(x2,6)+" "+(y2>=0?"+":"−")+" j"+fmt(Math.abs(y2),6)+"。"));
    rows.push(P("相加（直角式）：<strong>V</strong><sub>1</sub> + <strong>V</strong><sub>2</sub> = "+fmt(sx,6)+" "+(sy>=0?"+":"−")+" j"+fmt(Math.abs(sy),6)+"。"));
    if(mag<1e-12){
      rows.push(P("極式：大小 <strong>"+fmt(mag,6)+"</strong>，角度 <strong>未定義（零相量沒有方向）</strong>。"));
    }else{
      rows.push(P("極式：<strong>"+fmt(mag,6)+"∠"+fmt(deg(Math.atan2(sy,sx)),6)+"°</strong>；有效值 = 大小/√2 = <strong>"+fmt(rms,6)+"</strong>。"));
    }
    rows.push(P("兩相量夾角 = "+fmt(dphi,0)+"°。大小直接相加會得到 "+fmt(naive,6)+"，實際是 "+fmt(mag,6)+"，錯了 "+fmt(diff,6)+"（"+fmt(naive>0?diff/naive*100:0,4)+" %）。"));
    if(Math.abs(dphi)<1e-9){
      rows.push(P("夾角 0°：<strong>只有同相位時大小才能直接相加</strong>，現在剛好是這個特例。"));
    }else if(Math.abs(Math.abs(dphi)-180)<1e-9&&Math.abs(m1-m2)<1e-12){
      rows.push(P("夾角 180° 且等幅：完全抵消，和是 0——這就是雜訊對消與差動訊號的原理。"));
    }else if(Math.abs(Math.abs(dphi)-90)<1e-9){
      rows.push(P("夾角 90°：大小 = √(m<sub>1</sub>² + m<sub>2</sub>²) = "+fmt(Math.sqrt(m1*m1+m2*m2),6)+"，正是畢氏定理。正交的兩個相量互不干擾，這是第 11 章 P 與 Q 為什麼用直角三角形的原因。"));
    }
    rows.push(P("三角不等式：大小 "+fmt(mag,6)+" ≤ m<sub>1</sub> + m<sub>2</sub> = "+fmt(naive,6)+"，等號只在同相時成立——夾角一張開，投影就開始互相抵消。"));
    rows.push(P("為什麼：相量能相加是因為 e<sup>jωt</sup> 是兩者共有的公因式；換句話說，<strong>不同頻率的相量不能相加</strong>，這個工具在那裡就失效了。"));
    if(m1===0&&m2===0){
      rows.push(P("邊界提醒：兩個振幅都是 0，和是零相量，角度沒有意義（不是 0°，是未定義）。"));
    }else if(m1===0){
      rows.push(P("邊界提醒：<strong>V</strong><sub>1</sub> = 0，所以和就等於 <strong>V</strong><sub>2</sub>。"));
    }else if(m2===0){
      rows.push(P("邊界提醒：<strong>V</strong><sub>2</sub> = 0，所以和就等於 <strong>V</strong><sub>1</sub>。"));
    }
    if(Math.abs(a1)===180&&Math.abs(a2)===180){
      rows.push(P("邊界提醒：180° 與 −180° 是同一個方向，所以這兩個相量其實同相。"));
    }
    setOut('phasor-output',rows);
  };
  ['ph-m1','ph-a1','ph-m2','ph-a2'].forEach(x=>on(x,'input',draw));
  draw();
}

// 10 阻抗與交流穩態
function impedance(){
  if(!$('imp-r'))return;
  const draw=()=>{
    const r=val('imp-r'),lMH=val('imp-l'),cUF=val('imp-c'),f=val('imp-f'),v=val('imp-v');
    const L=lMH*1e-3,C=cUF*1e-6;
    const w=2*Math.PI*f;
    const rows=[];
    if(!(w*C>0)||!(f>0)){
      rows.push(P("頻率或電容為 0 時容抗會發散，請把滑桿拉回一般值。"));
      setOut('impedance-output',rows);return;
    }
    const xl=w*L,xc=1/(w*C),x=xl-xc;
    const magZ=hyp(r,x);
    const angZ=deg(Math.atan2(x,r));
    const i=magZ>0?v/magZ:0;
    const f0=1/(2*Math.PI*Math.sqrt(L*C));
    rows.push(P("ω = 2πf = <strong>"+fmt(w,6)+" rad/s</strong>。"));
    rows.push(P("X<sub>L</sub> = ωL = <strong>"+fmt(xl,6)+" Ω</strong>；X<sub>C</sub> = 1/(ωC) = <strong>"+fmt(xc,6)+" Ω</strong>；總電抗 X = X<sub>L</sub> − X<sub>C</sub> = <strong>"+fmt(x,6)+" Ω</strong>。"));
    rows.push(P("Z = R + jX = "+fmt(r,0)+" "+(x>=0?"+":"−")+" j"+fmt(Math.abs(x),6)+" Ω；極式 |Z| = <strong>"+fmt(magZ,6)+" Ω</strong>∠<strong>"+fmt(angZ,6)+"°</strong>。"));
    rows.push(P("電流大小 I = V/|Z| = <strong>"+fmt(i*1000,6)+" mA</strong>，相位 ∠I = −∠Z = <strong>"+fmt(-angZ,6)+"°</strong>（以電壓為 0° 參考）。"));
    rows.push(P("虛部歸零頻率 f<sub>0</sub> = 1/(2π√(LC)) = <strong>"+fmt(f0,6)+" Hz</strong>；目前 f/f<sub>0</sub> = <strong>"+fmt(f/f0,6)+"</strong>（小於 1 → 容性、大於 1 → 感性）。"));
    if(x>1e-9){
      rows.push(P("<strong>感性</strong>：電感贏了，電流<strong>落後</strong>電壓 "+fmt(angZ,6)+" 度。頻率愈高 X<sub>L</sub> = ωL 愈大，電感愈像開路。"));
    }else if(x<-1e-9){
      rows.push(P("<strong>容性</strong>：電容贏了，電流<strong>超前</strong>電壓 "+fmt(Math.abs(angZ),6)+" 度。頻率愈低 X<sub>C</sub> = 1/(ωC) 愈大，電容愈像開路。"));
    }else{
      rows.push(P("<strong>純阻</strong>：兩個電抗剛好抵消，Z = R，電流與電壓同相，而且此時 |Z| 最小、電流最大——這就是共振（第 13 章）。"));
    }
    rows.push(P("把 f 加倍到 "+fmt(2*f,0)+" Hz：X<sub>L</sub> 會變成 "+fmt(2*xl,6)+" Ω（也加倍）、X<sub>C</sub> 會變成 "+fmt(xc/2,6)+" Ω（變一半）。一個正比於 ω、一個反比於 ω，這就是它們會在某個頻率相遇的原因。"));
    rows.push(P("為什麼：阻抗是複數，因為它同時要記住「擋多少」（大小）和「把電流推遲或提前多少」（相位）——這兩件事一個實數裝不下。"));
    if(f<=100){
      rows.push(P("邊界提醒：低頻時 X<sub>C</sub> 高達 "+fmt(xc,1)+" Ω，電容幾乎是開路，這就是耦合電容能擋直流的原因。"));
    }else if(f>=5000){
      rows.push(P("邊界提醒：高頻時 X<sub>L</sub> = "+fmt(xl,2)+" Ω 主導，電感幾乎是開路，這就是扼流圈的用法。"));
    }
    if(r<=2&&Math.abs(x)<=r*2){
      rows.push(P("邊界提醒：R 很小又接近共振，|Z| = "+fmt(magZ,6)+" Ω 極小、電流極大。真實電路在這裡會過流，L 的繞線電阻會救你一命。"));
    }
    setOut('impedance-output',rows);
  };
  ['imp-r','imp-l','imp-c','imp-f','imp-v'].forEach(x=>on(x,'input',draw));
  draw();
}

// 11 交流功率與功因校正
function acpower(){
  if(!$('pw-v'))return;
  const draw=()=>{
    const v=val('pw-v'),r=val('pw-r'),x=val('pw-x'),f=val('pw-f'),target=val('pw-target');
    const z=hyp(r,x);
    const rows=[];
    if(!(z>0)){
      rows.push(P("負載阻抗為 0，電流會發散，請把 R 拉回大於 0 的值。"));
      setOut('acpower-output',rows);return;
    }
    const th=Math.atan2(x,r);
    const i=v/z;
    const s=v*i;
    const p=s*Math.cos(th);
    const q=s*Math.sin(th);
    const pf=Math.cos(th);
    rows.push(P("|Z| = √(R² + X²) = <strong>"+fmt(z,6)+" Ω</strong>；θ = <strong>"+fmt(deg(th),6)+"°</strong>；pf = cos θ = <strong>"+fmt(pf,6)+"</strong>（"+(x>1e-12?"落後":(x<-1e-12?"超前":"同相"))+"）。"));
    rows.push(P("I = V/|Z| = <strong>"+fmt(i,6)+" A</strong>；S = VI = <strong>"+fmt(s,6)+" VA</strong>；P = S cos θ = <strong>"+fmt(p,6)+" W</strong>；Q = S sin θ = <strong>"+fmt(q,6)+" var</strong>。"));
    rows.push(P("交叉驗算：I²R = "+fmt(i*i*r,6)+" W（＝P）、I²X = "+fmt(i*i*x,6)+" var（＝Q）。P 全部落在 R 上、Q 全部落在 X 上——這是功率三角形的物理意義，不是幾何巧合。"));
    rows.push(P("功率三角形：S² = "+fmt(s*s,6)+"，P² + Q² = "+fmt(p*p+q*q,6)+"，兩邊對得上。"));
    if(x>1e-12){
      rows.push(P("<strong>感性、落後功因</strong>：電流落後電壓，要並<strong>電容</strong>校正。"));
    }else if(x<-1e-12){
      rows.push(P("<strong>容性、超前功因</strong>：電流超前電壓，要並<strong>電感</strong>校正（實務少見，長電纜輕載時會發生）。"));
    }else{
      rows.push(P("<strong>純阻</strong>，pf = 1，沒有東西要校正。"));
    }
    const th2=Math.acos(clamp(target,-1,1));
    const sgn=Math.sign(x||1);
    const q2=p*Math.tan(th2)*sgn;
    const qc=q-q2;
    const w=2*Math.PI*f;
    const s2=target>0?p/target:0;
    const i2=v>0?s2/v:0;
    const lossRatio=i>0?(i2/i)*(i2/i):0;
    rows.push(P("目標功因 "+fmt(target,2)+" → 目標 θ<sub>2</sub> = "+fmt(deg(th2)*sgn,6)+"°、目標 Q<sub>2</sub> = P tan θ<sub>2</sub> = <strong>"+fmt(q2,6)+" var</strong>；要抵掉的無效功率 Q<sub>C</sub> = Q − Q<sub>2</sub> = <strong>"+fmt(qc,6)+" var</strong>。"));
    if(Math.abs(qc)<1e-12){
      rows.push(P("Q<sub>C</sub> = 0，不需要加任何校正元件（並聯電容 0.000000 µF）。"));
    }else if(qc>0){
      const cap=qc/(w*v*v);
      rows.push(P("需要並聯電容 C = Q<sub>C</sub>/(ωV<sub>rms</sub>²) = "+fmt(qc,6)+" / ("+fmt(w,6)+" × "+fmt(v*v,0)+") = <strong>"+fmt(cap*1e6,6)+" µF</strong>（f = "+fmt(f,0)+" Hz）。"));
    }else{
      const ind=-v*v/(w*qc);
      rows.push(P("Q<sub>C</sub> 是負的，代表要並聯電感 L = −V<sub>rms</sub>²/(ωQ<sub>C</sub>) = <strong>"+fmt(ind*1000,6)+" mH</strong>（f = "+fmt(f,0)+" Hz）。"));
    }
    rows.push(P("校正後：S<sub>2</sub> = P/pf<sub>目標</sub> = <strong>"+fmt(s2,6)+" VA</strong>、I<sub>2</sub> = <strong>"+fmt(i2,6)+" A</strong>；線損比 (I<sub>2</sub>/I)² = <strong>"+fmt(lossRatio,6)+"</strong>，也就是降到原來的 "+fmt(lossRatio*100,4)+" %。"));
    rows.push(P("注意：校正後的 P 仍然是 "+fmt(p,6)+" W，<strong>一點都沒變</strong>——你付的電費（度數）沒省，省的是線損與變壓器容量。"));
    if(target>=1){
      rows.push(P("目標設在 1.00：完全補償，Q<sub>2</sub> = 0，此時電流最小，但實務上不會補到 1，因為負載變動時容易補過頭變成超前。"));
    }
    rows.push(P("為什麼：Q 不做功卻要佔電流，電流又決定線損與導線粗細——這就是電力公司要對低功因收費的理由。"));
    if(pf<=0.05){
      rows.push(P("邊界提醒：pf ≈ "+fmt(pf,4)+" 是極端落後功因，幾乎全是無效功率，線路要承受 "+fmt(1/Math.max(pf,1e-9),0)+" 倍於實功的電流。"));
    }
    setOut('acpower-output',rows);
  };
  ['pw-v','pw-r','pw-x','pw-f','pw-target'].forEach(x=>on(x,'input',draw));
  draw();
}

// 12 一階 RC 濾波器
function rcfilter(){
  if(!$('flt-type'))return;
  const draw=()=>{
    const type=pick('flt-type'),r=val('flt-r'),cUF=val('flt-c'),d=val('flt-d');
    const rc=r*(cUF*1e-6);
    const rows=[];
    if(!(rc>0)){
      rows.push(P("R 或 C 為 0 時截止頻率會發散，請把滑桿拉回一般值。"));
      setOut('rcfilter-output',rows);return;
    }
    const fc=1/(2*Math.PI*rc);
    const f=fc*Math.pow(10,d);
    const x=2*Math.PI*f*rc;
    let mag,ph;
    if(type==='hp'){
      mag=x/Math.sqrt(1+x*x);ph=90-deg(Math.atan(x));
    }else{
      mag=1/Math.sqrt(1+x*x);ph=-deg(Math.atan(x));
    }
    const db=dbv(mag);
    rows.push(P("型態："+(type==='hp'?"<strong>高通</strong>（輸出取自電阻）":"<strong>低通</strong>（輸出取自電容）")+"；RC = "+fmt(r,0)+" Ω × "+fmt(cUF*1e-6,9)+" F = <strong>"+fmt(rc,9)+" s ＝ "+fmt(rc*1e6,6)+" µs</strong>。"));
    rows.push(P("截止頻率 f<sub>c</sub> = 1/(2πRC) = <strong>"+fmt(fc,6)+" Hz</strong>；目前 f = f<sub>c</sub> × 10<sup>"+fmt(d,2)+"</sup> = <strong>"+fmt(f,6)+" Hz</strong>（ωRC = "+fmt(x,6)+"）。"));
    rows.push(P("|H| = <strong>"+fmt(mag,6)+"</strong> 倍 ＝ <strong>"+fmt(db,6)+" dB</strong>；相位 = <strong>"+fmt(ph,6)+"°</strong>；輸出振幅剩輸入的 <strong>"+fmt(mag*100,4)+" %</strong>。"));
    if(Math.abs(d)<1e-12){
      rows.push(P("d = 0，剛好落在截止頻率上：dB = "+fmt(db,6)+"、相位 = "+fmt(ph,6)+"°。這就是截止頻率的定義：振幅剩 70.7 %、功率剩一半，所以叫半功率點。"));
    }else if(type==='lp'&&Math.abs(d-1)<1e-12){
      rows.push(P("離 f<sub>c</sub> 一個十倍頻，已經很接近 −20 dB 的漸近線；再往上每十倍頻就穩定掉 20 dB。"));
    }else if(type==='lp'&&Math.abs(d+1)<1e-12){
      rows.push(P("遠低於 f<sub>c</sub> 時幾乎原封不動通過（"+fmt(db,6)+" dB），這才是「通帶」。"));
    }
    rows.push(P("時域與頻域是同一件事：這個 RC 就是第 07 章的時間常數 τ = "+fmt(rc*1e6,6)+" µs，而 f<sub>c</sub> = 1/(2πτ)。τ 愈大 → 反應愈慢 → 能通過的頻率愈低。"));
    rows.push(P("相位的極限：低通往上走到 −90°、高通往下走到 +90°，一個極點最多只能轉 90°。目前是 "+fmt(ph,6)+"°。"));
    rows.push(P("為什麼：高頻時 Z<sub>C</sub> = 1/(ωC) 變小，電容把訊號拉到地，所以輸出變小——低通不是「擋掉」高頻，是<strong>分壓分不到</strong>。"));
    if(d<=-2){
      rows.push(P("邊界提醒："+(type==='hp'?"高通在這裡只剩 "+fmt(mag*100,4)+" %，訊號幾乎被完全擋住，但沒有真正變成 0。":"低通幾乎 0 dB（"+fmt(db,6)+"），通帶內的衰減小到量不出來，這時你會以為濾波器不存在。")));
    }else if(d>=2){
      rows.push(P("邊界提醒："+(type==='lp'?"訊號只剩 "+fmt(mag*100,4)+" %（"+fmt(db,6)+" dB），但<strong>沒有變成 0</strong>——一階濾波器永遠有拖尾，要更陡就要串更多階（或用第 13 章的 RLC）。":"高通在這裡幾乎 0 dB（"+fmt(db,6)+"），已經完全進入通帶。")));
    }
    setOut('rcfilter-output',rows);
  };
  ['flt-type','flt-r','flt-c','flt-d'].forEach(x=>on(x,'input',draw));
  draw();
}

// 13 串聯 RLC 共振
function resonance(){
  if(!$('res-l'))return;
  const draw=()=>{
    const lMH=val('res-l'),cUF=val('res-c'),r=val('res-r'),ratio=val('res-ratio');
    const L=lMH*1e-3,C=cUF*1e-6;
    const w0=1/Math.sqrt(L*C);
    const f0=w0/(2*Math.PI);
    const q=w0*L/r;
    const q2=1/(w0*r*C);
    const q3=(1/r)*Math.sqrt(L/C);
    const zeta=1/(2*q);
    const b=f0/q;
    const kk=Math.sqrt(1+1/(4*q*q));
    const fl=f0*(kk-1/(2*q));
    const fh=f0*(kk+1/(2*q));
    const f=f0*ratio;
    const w=2*Math.PI*f;
    const rows=[];
    if(!(w*C>0)){
      rows.push(P("頻率或電容為 0 時容抗會發散，請把滑桿拉回一般值。"));
      setOut('resonance-output',rows);return;
    }
    const x=w*L-1/(w*C);
    const magZ=hyp(r,x);
    const rel=magZ>0?r/magZ:0;
    const angZ=deg(Math.atan2(x,r));
    rows.push(P("共振頻率 f<sub>0</sub> = 1/(2π√(LC)) = <strong>"+fmt(f0,6)+" Hz</strong>（ω<sub>0</sub> = "+fmt(w0,6)+" rad/s）。"));
    rows.push(P("品質因數三種算法都對得上：ω<sub>0</sub>L/R = <strong>"+fmt(q,6)+"</strong>、1/(ω<sub>0</sub>RC) = <strong>"+fmt(q2,6)+"</strong>、(1/R)√(L/C) = <strong>"+fmt(q3,6)+"</strong>。"));
    rows.push(P("ζ = 1/(2Q) = <strong>"+fmt(zeta,6)+"</strong>——<strong>這就是第 08 章的阻尼比</strong>：高 Q ＝ 低 ζ ＝ 頻域上選得很準，但時域上振鈴很久。選擇性與安定時間是同一枚硬幣的兩面，改 R 只能在兩者之間移動，不能同時變好。"));
    rows.push(P("頻寬 B = f<sub>0</sub>/Q = <strong>"+fmt(b,6)+" Hz</strong>；半功率頻率下限 <strong>"+fmt(fl,6)+" Hz</strong>、上限 <strong>"+fmt(fh,6)+" Hz</strong>，兩者相減 = "+fmt(fh-fl,6)+" Hz，與 B 一致：頻寬就是兩個半功率頻率的距離，而它只由 f<sub>0</sub>/Q 決定。"));
    rows.push(P("目前觀察頻率 f = "+fmt(ratio,2)+" × f<sub>0</sub> = <strong>"+fmt(f,6)+" Hz</strong>；X = ωL − 1/(ωC) = <strong>"+fmt(x,6)+" Ω</strong>；|Z| = <strong>"+fmt(magZ,6)+" Ω</strong>；∠Z = <strong>"+fmt(angZ,6)+"°</strong>。"));
    rows.push(P("相對電流 I/I<sub>max</sub> = R/|Z| = <strong>"+fmt(rel,6)+"</strong>。"));
    if(Math.abs(x)<1e-6){
      rows.push(P("<strong>共振</strong>：兩個電抗互相抵消，電路對外只剩 R = "+fmt(r,0)+" Ω，所以電流最大且與電壓同相。"));
    }else if(x>0){
      rows.push(P("目前在共振點<strong>上方</strong>，X > 0 呈感性，電流落後電壓 "+fmt(angZ,6)+" 度，而且被擋掉了一部分。"));
    }else{
      rows.push(P("目前在共振點<strong>下方</strong>，X < 0 呈容性，電流超前電壓 "+fmt(Math.abs(angZ),6)+" 度，而且被擋掉了一部分。"));
    }
    rows.push(P("共振時 L 與 C 上的電壓是源電壓的 Q = <strong>"+fmt(q,6)+"</strong> 倍。Q = 10 時元件就要承受 10 倍源電壓，選料要注意耐壓。"));
    if(q<0.5){
      rows.push(P("警語：Q 已經小於 0.5（ζ = "+fmt(zeta,6)+" > 1，過阻尼），共振峰幾乎平掉，這個電路不再有選頻能力。"));
    }
    rows.push(P("為什麼：Q 高是因為每週期存進 L 和 C 的能量遠多於 R 吃掉的；R 愈小，能量在 L 和 C 之間來回愈多次才耗盡。"));
    if(r<=1){
      rows.push(P("邊界提醒：R = "+fmt(r,0)+" Ω 時 Q = "+fmt(q,3)+"、B = "+fmt(b,2)+" Hz，是極窄帶：適合做選台，但共振時元件電壓是源的 "+fmt(q,0)+" 倍，而且振鈴會拖很久。"));
    }else if(Math.abs(q-0.5)<0.02){
      rows.push(P("邊界提醒：Q ≈ 0.5、ζ ≈ 1，已經到臨界阻尼，共振峰完全消失。"));
    }
    if(Math.abs(ratio-1)>=0.45){
      rows.push(P("邊界提醒：離共振點半個 f<sub>0</sub>，電流只剩 "+fmt(rel*100,4)+" %，幾乎完全被擋掉——這就是選擇性。"));
    }
    setOut('resonance-output',rows);
  };
  ['res-l','res-c','res-r','res-ratio'].forEach(x=>on(x,'input',draw));
  draw();
}

// 14 變壓器與三相
function transformer(){
  if(!$('tr-mode'))return;
  const draw=()=>{
    const mode=pick('tr-mode'),n1=val('tr-n1'),n2=val('tr-n2'),v1=val('tr-v1'),zl=val('tr-zl');
    const rows=[];
    if(!(zl>0)){
      rows.push(P("負載電阻為 0 會造成短路電流發散，請把滑桿拉回大於 0 的值。"));
      setOut('transformer-output',rows);return;
    }
    if(mode==='wye'||mode==='delta'){
      const isWye=(mode==='wye');
      const vp=isWye?v1/Math.sqrt(3):v1;
      const ip=vp/zl;
      const il=isWye?ip:Math.sqrt(3)*ip;
      const p=Math.sqrt(3)*v1*il;
      const p3=3*vp*ip;
      rows.push(P("接法："+(isWye?"<strong>三相 Y 接（星型）</strong>":"<strong>三相 Δ 接（三角）</strong>")+"；線電壓 V<sub>L</sub> = "+fmt(v1,0)+" V、每相負載 "+fmt(zl,0)+" Ω。"));
      rows.push(P("相電壓 V<sub>p</sub> = <strong>"+fmt(vp,6)+" V</strong>；相電流 I<sub>p</sub> = V<sub>p</sub>/Z = <strong>"+fmt(ip,6)+" A</strong>；線電流 I<sub>L</sub> = <strong>"+fmt(il,6)+" A</strong>。"));
      rows.push(P("總功率 P = √3 ⋅ V<sub>L</sub> ⋅ I<sub>L</sub> ⋅ cos θ = <strong>"+fmt(p,6)+" W</strong>；交叉驗算 3V<sub>p</sub>I<sub>p</sub> = <strong>"+fmt(p3,6)+" W</strong>，差 "+expHtml(p-p3,3)+" W。√3V<sub>L</sub>I<sub>L</sub> 與 3V<sub>p</sub>I<sub>p</sub> 算出同一個數，證明兩條公式是同一件事。"));
      if(isWye){
        rows.push(P("Y 接的 √3 在<strong>電壓</strong>：線電壓是相電壓的 √3 = 1.732051 倍，因為線電壓是兩個夾 120° 的相電壓相減。線電流就等於相電流。"));
        rows.push(P("換成 Δ 接、同一組線電壓與同樣的每相負載，功率會變成 <strong>"+fmt(3*p,6)+" W</strong>，剛好 3 倍——因為每相直接吃到整個線電壓。這正是 Y–Δ 啟動的原理：先用 Y 接把啟動功率與電流壓到三分之一，轉起來再切到 Δ。"));
      }else{
        rows.push(P("Δ 接的 √3 在<strong>電流</strong>：線電流是相電流的 √3 倍，因為線電流是兩個夾 120° 的相電流相減。相電壓就等於線電壓。"));
        rows.push(P("換成 Y 接、同一組線電壓與同樣的每相負載，功率只剩 <strong>"+fmt(p/3,6)+" W</strong>，剛好三分之一。這正是 Y–Δ 啟動的原理：先用 Y 接把啟動功率與電流壓到三分之一，轉起來再切到 Δ。"));
      }
      if(il>=200){
        rows.push(P("安全提醒：線電流已達 "+fmt(il,1)+" A，這是工業級的量，導線截面積與斷路器規格由它決定。實際量測三相電路必須斷電、掛接地棒、由具資格人員操作。"));
      }
    }else{
      const n=n2>0?n1/n2:0;
      if(!(n>0)){
        rows.push(P("匝數比無法計算，請確認 N<sub>1</sub> 與 N<sub>2</sub> 都大於 0。"));
        setOut('transformer-output',rows);return;
      }
      const v2=v1/n,i2=v2/zl,i1=i2/n,zref=zl*n*n;
      const p2=v2*i2,p1=v1*i1;
      rows.push(P("模式：<strong>理想變壓器</strong>；匝比 n = N<sub>1</sub>/N<sub>2</sub> = "+fmt(n1,0)+"/"+fmt(n2,0)+" = <strong>"+fmt(n,6)+"</strong>。"));
      rows.push(P("V<sub>2</sub> = V<sub>1</sub>/n = <strong>"+fmt(v2,6)+" V</strong>；I<sub>2</sub> = V<sub>2</sub>/Z<sub>L</sub> = <strong>"+fmt(i2,6)+" A</strong>；I<sub>1</sub> = I<sub>2</sub>/n = <strong>"+fmt(i1,6)+" A</strong>。"));
      rows.push(P("阻抗轉換 Z<sub>ref</sub> = Z<sub>L</sub> ⋅ n² = <strong>"+fmt(zref,6)+" Ω</strong>；從一次側量到的 V<sub>1</sub>/I<sub>1</sub> = <strong>"+fmt(i1>0?v1/i1:0,6)+" Ω</strong>。兩個值相等：<strong>阻抗按匝比的平方轉換</strong>，因為電壓乘 n、電流除以 n，比值就乘了 n²。"));
      rows.push(P("一次側功率 "+fmt(p1,6)+" W、二次側功率 "+fmt(p2,6)+" W，差 "+expHtml(p1-p2,3)+" W。理想變壓器只換電壓與電流的「匯率」，不創造也不消耗功率。"));
      if(n>1){
        rows.push(P("<strong>降壓</strong>：n > 1，二次側電壓變小、電流變大。"));
      }else if(n<1){
        rows.push(P("<strong>升壓</strong>：n < 1，二次側電壓變大、電流變小。"));
      }else{
        rows.push(P("<strong>隔離變壓器</strong>：n = 1，電壓不變，作用是把兩邊的地分開。"));
      }
      if(n<=0.2){
        rows.push(P("邊界提醒：n = "+fmt(n,6)+" 是升壓 "+fmt(1/n,3)+" 倍，Z<sub>ref</sub> 只剩 Z<sub>L</sub> 的 "+fmt(n*n,6)+" 倍。升壓變壓器把負載看起來變得很小，這在阻抗匹配上很有用。"));
      }
    }
    rows.push(P("為什麼：變壓器靠的是<strong>共用的磁通</strong>，所以它只對交流有用——直流的 dΦ/dt = 0，二次側什麼也感應不到。"));
    setOut('transformer-output',rows);
  };
  ['tr-mode','tr-n1','tr-n2','tr-v1','tr-zl'].forEach(x=>on(x,'input',draw));
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
    const c=$('term-count');
    if(c)c.textContent="顯示 "+shown+" 個條目";
  };
  ['term-search'].forEach(x=>on(x,'input',draw));
  draw();
}

// 5. 自我檢核
function selfcheck(){
  if(!$('quiz-reset'))return;
  const R00="00-電路世界觀.html",N00="00 電路世界觀";
  const R01="01-電阻與歐姆定律.html",N01="01 電阻與歐姆定律";
  const R02="02-KCL與KVL.html",N02="02 KCL與KVL";
  const R03="03-節點與網目分析.html",N03="03 節點與網目分析";
  const R04="04-疊加原理與相依源.html",N04="04 疊加原理與相依源";
  const R05="05-戴維寧與最大功率.html",N05="05 戴維寧與最大功率";
  const R06="06-電容與電感.html",N06="06 電容與電感";
  const R07="07-一階暫態RC與RL.html",N07="07 一階暫態RC與RL";
  const R08="08-二階RLC暫態.html",N08="08 二階RLC暫態";
  const R09="09-弦波與相量.html",N09="09 弦波與相量";
  const R10="10-阻抗與交流穩態.html",N10="10 阻抗與交流穩態";
  const R11="11-交流功率與功因.html",N11="11 交流功率與功因";
  const R12="12-一階濾波器與頻率響應.html",N12="12 一階濾波器與頻率響應";
  const R13="13-RLC共振與品質因數.html",N13="13 RLC共振與品質因數";
  const R14="14-變壓器與三相.html",N14="14 變壓器與三相";
  const Q={
    'q00-1':{t:'sel',ans:'a',why:'電流的定義是 i = dq/dt，也就是每秒通過某個截面的電荷量，單位 A = C/s。',fix:'常見卡點是把電流想成「電壓除以電阻」；那是歐姆定律的結果，不是電流的定義。',ref:R00,refName:N00},
    'q00-2':{t:'num',ans:1.2,tol:0.01,why:'定電流時 Q = I ⋅ t = 0.02 A × 60 s = 1.200000 C，換算成電子大約 7.489811 × 10<sup>18</sup> 個。',fix:'常見卡點是忘了把 20 mA 換成 0.02 A，算出 1200 就是差了 1000 倍。',ref:R00,refName:N00},
    'q00-3':{t:'sel',ans:'a',why:'λ = c/f = 3 × 10<sup>8</sup> / 10<sup>8</sup> = 3 m，d/λ = 0.1/3 = 0.033333 遠小於 0.05，所以集總假設成立。',fix:'常見卡點是看到 100 MHz 就直覺說「高頻一定失效」；判準是 d 與 λ 的比值，不是頻率本身。',ref:R00,refName:N00},
    'q01-1':{t:'num',ans:4,tol:0.01,why:'串聯 R<sub>eq</sub> = 1000 + 2000 = 3000 Ω，I = 12/3000 = 0.004 A = 4 mA，整條回路只有這一個電流。',fix:'常見卡點是把兩顆電阻分開各算一次電流；串聯時電流只有一個。',ref:R01,refName:N01},
    'q01-2':{t:'num',ans:8,tol:0.01,why:'V<sub>2</sub> = I ⋅ R<sub>2</sub> = 0.004 × 2000 = 8 V，也等於 12 × 2/3 的分壓比。',fix:'常見卡點是把分壓比寫反成 R<sub>1</sub>/(R<sub>1</sub> + R<sub>2</sub>)，那算出來會是 4 V。',ref:R01,refName:N01},
    'q01-3':{t:'num',ans:666.666667,tol:0.5,why:'兩顆並聯 R<sub>eq</sub> = R<sub>1</sub>R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>) = 1000 × 2000/3000 = 666.666667 Ω，比較小的那顆還小。',fix:'常見卡點是忘了最後要取倒數，算出 0.0015 那個是等效電導 G。',ref:R01,refName:N01},
    'q02-1':{t:'sel',ans:'b',why:'KCL 說節點流入電流的代數和為零，根據是電荷守恆——理想節點不囤積電荷。',fix:'常見卡點是把 KCL 和 KVL 的根據記反；能量守恆對應的是 KVL。',ref:R02,refName:N02},
    'q02-2':{t:'num',ans:2.181818,tol:0.005,why:'KCL 給 I<sub>3</sub> = I<sub>1</sub> − I<sub>2</sub> = 5.454545 − 3.272727 = 2.181818 mA，殘差正好是 0。',fix:'常見卡點是把兩支流出電流相加而不是相減；流入等於流出才是 KCL。',ref:R02,refName:N02},
    'q02-3':{t:'sel',ans:'a',why:'回路穿過變化磁通時，法拉第定律會多出 −dΦ/dt 這一項，KVL 的「代數和為零」就不再成立。',fix:'常見卡點是以為 KVL 永遠成立；量測時把探棒線圈成大迴路吃到雜訊，就是這一項在說話。',ref:R02,refName:N02},
    'q03-1':{t:'num',ans:10.833333,tol:0.01,why:'det = 1.5 × 0.833333 − 0.25 = 1.000000，v<sub>1</sub> = (10 × 0.833333 + 0.5 × 5)/1 = 10.833333 V。',fix:'常見卡點是忘了 G 矩陣的非對角元是負電導，少一個負號整組答案就跑掉。',ref:R03,refName:N03},
    'q03-2':{t:'num',ans:12.5,tol:0.01,why:'v<sub>2</sub> = (1.5 × 5 + 0.5 × 10)/1 = 12.500000 V，代回第二式得到 5.000000 mA，正好是 I<sub>s2</sub>。',fix:'常見卡點是把 v<sub>1</sub> 與 v<sub>2</sub> 的分子對調；克拉瑪法則換的是對應那一欄。',ref:R03,refName:N03},
    'q03-3':{t:'sel',ans:'b',why:'節點分析對每個非參考節點寫 KCL，未知數就是節點電壓，方程組寫成 G <strong>v</strong> = <strong>i</strong><sub>s</sub>。',fix:'常見卡點是選網孔電流，那是網孔分析的未知數，兩套方法不能混用。',ref:R03,refName:N03},
    'q04-1':{t:'num',ans:8,tol:0.01,why:'I<sub>s</sub> 開路後只剩分壓：V<sub>A</sub> = 12 × 2000/3000 = 8.000000 V。',fix:'常見卡點是把電流源短路；獨立電流源歸零要開路，獨立電壓源歸零才短路。',ref:R04,refName:N04},
    'q04-2':{t:'num',ans:11.333333,tol:0.01,why:'8.000000 + 3.333333 = 11.333333 V，用節點法直接解也是同一個值，證明電壓可以疊加。',fix:'常見卡點是把兩個分項相乘或取平均；疊加就是單純相加。',ref:R04,refName:N04},
    'q04-3':{t:'sel',ans:'c',why:'P 是電壓的二次函式，展開後多出交叉項 2V<sub>A,V</sub>V<sub>A,I</sub>/R<sub>2</sub>，所以分項功率相加對不上總功率。',fix:'常見卡點是以為疊加對所有量都成立；只有電路變數（電壓、電流）是線性的。',ref:R04,refName:N04},
    'q05-1':{t:'num',ans:8,tol:0.01,why:'開路電壓就是分壓結果：V<sub>th</sub> = 12 × 2000/3000 = 8.000000 V。',fix:'常見卡點是把負載也算進去；戴維寧電壓定義在把負載拿掉的開路狀態。',ref:R05,refName:N05},
    'q05-2':{t:'num',ans:666.666667,tol:0.5,why:'把獨立電壓源歸零（短路）後從端口看進去，R<sub>th</sub> = 1000‖2000 = 666.666667 Ω。',fix:'常見卡點是把電壓源當成開路，那會算出 3000 Ω。',ref:R05,refName:N05},
    'q05-3':{t:'num',ans:24,tol:0.05,why:'匹配時 P<sub>max</sub> = V<sub>th</sub>²/(4R<sub>th</sub>) = 64/2666.666667 = 0.024 W = 24 mW，此時效率剛好 50 %。',fix:'常見卡點是用 V<sub>th</sub>²/R<sub>th</sub> 忘了除以 4；那是短路時的假想值，不是負載拿到的功率。',ref:R05,refName:N05},
    'q06-1':{t:'num',ans:0.1,tol:0.001,why:'i = C ⋅ dv/dt = 100 × 10<sup>−6</sup> × 1000 = 0.100000 A，電流由變化率決定。',fix:'常見卡點是把電壓大小代進去；電容的電流只看 dv/dt，不看 v。',ref:R06,refName:N06},
    'q06-2':{t:'num',ans:5,tol:0.01,why:'W<sub>C</sub> = (1/2)Cv² = 0.5 × 100 × 10<sup>−6</sup> × 100 = 0.005 J = 5 mJ。',fix:'常見卡點是忘了那個 1/2，算出 10 mJ。',ref:R06,refName:N06},
    'q06-3':{t:'sel',ans:'b',why:'電容電壓與電感電流是狀態變數，跳變需要無限大的電流或電壓，所以在切換瞬間必定連續。',fix:'常見卡點是把兩者對調；電容的電流與電感的電壓反而可以瞬間跳。',ref:R06,refName:N06},
    'q07-1':{t:'num',ans:0.1,tol:0.001,why:'τ = RC = 10000 × 10 × 10<sup>−6</sup> = 0.100000 s，RC 的時間常數與 R 成正比。',fix:'常見卡點是忘了把 10 µF 換成 10 × 10<sup>−6</sup> F，算出 100000 就是差了 10<sup>6</sup> 倍。',ref:R07,refName:N07},
    'q07-2':{t:'num',ans:63.2121,tol:0.5,why:'1 − e<sup>−1</sup> = 0.632121，所以 t = τ 只走完 63.2121 %；3τ 是 95.0213 %、5τ 是 99.3262 %。',fix:'常見卡點是填 100，把時間常數當成「充飽的時間」，那是最普遍的誤解。',ref:R07,refName:N07},
    'q07-3':{t:'num',ans:3.160603,tol:0.02,why:'v<sub>C</sub> = 5 + (0 − 5)e<sup>−1</sup> = 5 × 0.632121 = 3.160603 V，正好是全程的 63.2121 %。',fix:'常見卡點是填 5，那是 t 趨近無限大的終值，不是 t = τ 的值。',ref:R07,refName:N07},
    'q08-1':{t:'num',ans:10000,tol:10,why:'ω<sub>0</sub> = 1 / √(LC) = 1 / √(0.01 × 10<sup>−6</sup>) = 1 / 10<sup>−4</sup> = 10000 rad/s。',fix:'常見卡點是把答案寫成 f<sub>0</sub> = 1591.549431 Hz；題目問的是角頻率，兩者差 2π。',ref:R08,refName:N08},
    'q08-2':{t:'num',ans:200,tol:1,why:'R<sub>臨界</sub> = 2√(L/C) = 2√(0.01 / 10<sup>−6</sup>) = 2 × 100 = 200 Ω，這個值只由 L 與 C 的比值決定。',fix:'常見卡點是忘了乘 2，算出 100 Ω。',ref:R08,refName:N08},
    'q08-3':{t:'sel',ans:'c',why:'ζ = R/R<sub>臨界</sub> = 100/200 = 0.5，落在 0 與 1 之間就是欠阻尼，兩個根是共軛複數，波形會振盪衰減。',fix:'常見卡點是把 0.5 看成「一半就是臨界」；臨界阻尼是 ζ 剛好等於 1。',ref:R08,refName:N08},
    'q09-1':{t:'num',ans:8.660254,tol:0.01,why:'實部 = 10 cos 30° = 10 × 0.866025 = 8.660254，虛部才是 10 sin 30° = 5。',fix:'常見卡點是把 sin 與 cos 對調，算出 5。',ref:R09,refName:N09},
    'q09-2':{t:'num',ans:12.925103,tol:0.02,why:'先化直角式相加得 12.902895 + j0.757359，大小 = √(12.902895² + 0.757359²) = 12.925103。',fix:'常見卡點是把大小直接相加得 16；只有同相位時才能那樣做。',ref:R09,refName:N09},
    'q09-3':{t:'sel',ans:'a',why:'相量法把共有的 e<sup>jωt</sup> 提出來，前提就是兩者頻率相同；頻率不同時這個公因式不存在。',fix:'常見卡點是選「振幅相同」；振幅不同完全可以相加，頻率不同才不行。',ref:R09,refName:N09},
    'q10-1':{t:'num',ans:62.831853,tol:0.05,why:'X<sub>L</sub> = ωL = 2π × 1000 × 0.01 = 62.831853 Ω，感抗與頻率成正比。',fix:'常見卡點是忘了乘 2π，直接用 f × L 算出 10。',ref:R10,refName:N10},
    'q10-2':{t:'num',ans:159.154943,tol:0.1,why:'X<sub>C</sub> = 1/(ωC) = 1/(6283.185307 × 10<sup>−6</sup>) = 159.154943 Ω，容抗與頻率成反比。',fix:'常見卡點是漏掉取倒數，算出 0.006283。',ref:R10,refName:N10},
    'q10-3':{t:'sel',ans:'b',why:'X = X<sub>L</sub> − X<sub>C</sub> < 0 代表電容贏了，電路呈容性，電流超前電壓。',fix:'常見卡點是把超前與落後記反；感性才是電流落後。',ref:R10,refName:N10},
    'q11-1':{t:'num',ans:3097.6,tol:5,why:'|Z| = 12.5 Ω、I = 220/12.5 = 17.6 A、S = 3872 VA、pf = 0.8，所以 P = 3872 × 0.8 = 3097.6 W，也等於 I²R。',fix:'常見卡點是直接用 V²/R 算，那忽略了電抗，會得到 4840 W。',ref:R11,refName:N11},
    'q11-2':{t:'num',ans:2323.2,tol:5,why:'Q = S sin θ = 3872 × 0.6 = 2323.2 var，也等於 I²X = 17.6² × 7.5。',fix:'常見卡點是把 Q 與 S 搞混；S = 3872 VA 是斜邊，Q 是垂直邊。',ref:R11,refName:N11},
    'q11-3':{t:'sel',ans:'b',why:'並聯電容抵掉一部分 Q，功率三角形的斜邊變短，所以 S 與線電流變小，線損隨電流平方下降。',fix:'常見卡點是以為 P 或電費會變小；實功一點都沒變，省的是線損與變壓器容量。',ref:R11,refName:N11},
    'q12-1':{t:'num',ans:1591.549431,tol:2,why:'RC = 1000 × 0.1 × 10<sup>−6</sup> = 10<sup>−4</sup> s，f<sub>c</sub> = 1/(2πRC) = 1591.549431 Hz。',fix:'常見卡點是忘了 2π，算出 10000 Hz。',ref:R12,refName:N12},
    'q12-2':{t:'num',ans:-3.010300,tol:0.05,why:'f = f<sub>c</sub> 時 |H| = 1/√2 = 0.707107，dB = 20 log<sub>10</sub>(0.707107) = −3.010300，功率剛好剩一半。',fix:'常見卡點是填 −6.02 dB，那是振幅剩一半（不是功率剩一半）時的值。',ref:R12,refName:N12},
    'q12-3':{t:'sel',ans:'a',why:'一階低通離截止頻率一個十倍頻，增益是 −20.043214 dB，非常接近 −20 dB 的漸近線，之後每十倍頻穩定掉 20 dB。',fix:'常見卡點是填 −40 dB，那是二階（或再遠一個十倍頻）的行為。',ref:R12,refName:N12},
    'q13-1':{t:'num',ans:10,tol:0.05,why:'ω<sub>0</sub> = 10000 rad/s，Q = ω<sub>0</sub>L/R = 10000 × 0.01/10 = 10；用 1/(ω<sub>0</sub>RC) 與 (1/R)√(L/C) 算也是 10。',fix:'常見卡點是把 R 放到分子；R 愈小 Q 愈大，因為損耗愈少。',ref:R13,refName:N13},
    'q13-2':{t:'num',ans:159.154943,tol:1,why:'f<sub>0</sub> = 1591.549431 Hz，B = f<sub>0</sub>/Q = 1591.549431/10 = 159.154943 Hz，也等於上下半功率頻率之差。',fix:'常見卡點是用 f<sub>0</sub> × Q，那會得到 15915 Hz；Q 愈大頻寬愈窄。',ref:R13,refName:N13},
    'q13-3':{t:'sel',ans:'b',why:'串聯共振時兩個電抗互相抵消，Z = R 是最小值，所以電流最大且與電壓同相。',fix:'常見卡點是把串聯共振與並聯共振記反；並聯共振才是阻抗最大。',ref:R13,refName:N13},
    'q14-1':{t:'num',ans:22,tol:0.1,why:'n = 1000/100 = 10，V<sub>2</sub> = V<sub>1</sub>/n = 220/10 = 22 V，是降壓變壓器。',fix:'常見卡點是把匝比乘上去算出 2200 V；n > 1 是降壓。',ref:R14,refName:N14},
    'q14-2':{t:'num',ans:800,tol:1,why:'Z<sub>ref</sub> = Z<sub>L</sub>n² = 8 × 100 = 800 Ω，因為電壓乘 n、電流除以 n，比值就乘了 n²。',fix:'常見卡點是只乘一次匝比算出 80 Ω；阻抗轉換要用匝比的平方。',ref:R14,refName:N14},
    'q14-3':{t:'num',ans:127.017059,tol:0.5,why:'Y 接的線電壓是相電壓的 √3 倍，所以 V<sub>p</sub> = 220/√3 = 127.017059 V。',fix:'常見卡點是乘以 √3 算成 381 V，或誤用 Δ 接（Δ 接的相電壓就等於線電壓 220 V）。',ref:R14,refName:N14}
  };
  const ids=Object.keys(Q);
  const progress=()=>{
    const n=ids.filter(i=>$(i)&&String($(i).value).trim()!=='').length;
    const node=$('quiz-progress');
    if(node)node.textContent="已作答 "+n+" / "+ids.length+" 題（僅供參考，不影響瀏覽）";
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
  [lumped,ohm,kirchhoff,nodal2,superpose,thevenin,storage,rctau,rlcdamp,phasor,impedance,acpower,rcfilter,resonance,transformer,dictionary,selfcheck].forEach(f=>f());
}

// 7. 匯出（供 node --check 與人工交叉驗算）
if(typeof module!=="undefined")module.exports={fmt,fmtSigned,expHtml,trimZeros,clamp,rad,deg,par,dbv,hyp,fmtEng,wrapDeg};

"use strict";
/* 電機機械（零基礎互動課）——全站互動邏輯 */

/* ---------- 1. helper ---------- */
var $ = function (id) {
  if (typeof document === "undefined") { return null; }
  return document.getElementById(id);
};
var bind = function (ids, f) { ids.forEach(function (x) { var n = $(x); if (n) { n.addEventListener(n.type === "checkbox" ? "change" : "input", f); } }); };
var val = function (id) { var n = $(id); return n ? Number(n.value) : 0; };
var pick = function (id) { var n = $(id); return n ? n.value : ""; };
var zc = function (x) { return Math.abs(x) < 1e-12 ? 0 : x; };
var minus = function (s) { return String(s).replace(/^-/, "−"); };
var num6 = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  return minus(zc(v).toFixed(6));
};
var int0 = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  return minus(String(Math.round(zc(v))));
};
var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
var put = function (id, html) { var n = $(id); if (n) { n.innerHTML = html; } };
var row = function (cells, th) {
  var t = th ? "th" : "td";
  return "<tr><" + t + ">" + cells.join("</" + t + "><" + t + ">") + "</" + t + "></tr>";
};
var safe = function (n) { return n !== null && isFinite(Number(n)) ? Number(n) : null; };
var f6 = function (n) { return n === null ? "不適用" : num6(n); };
var table = function (heads, rows) {
  var h = "<table><thead>" + row(heads, true) + "</thead><tbody>";
  rows.forEach(function (r) { h += row(r, false); });
  return h + "</tbody></table>";
};

/* ---------- 2. 常數 ---------- */
var MU0 = 4 * Math.PI * 1e-7;
var K444 = 2 * Math.PI / Math.SQRT2; /* 4.442883 */
var IM = {R1: 0.5, X1: 1.0, X2: 1.0, XM: 30, POLES: 4};
var SCORE = {
  pmsm: [5, 2, 2, 4, 5, 1], im: [3, 5, 4, 1, 3, 2], dcbrush: [3, 3, 5, 2, 2, 1],
  bldc: [4, 3, 3, 2, 5, 1], stepper: [1, 4, 4, 5, 2, 1], wrsm: [4, 1, 1, 1, 3, 5]
};
var MOTOR_NAME = {pmsm: "永磁同步馬達", im: "三相感應機", dcbrush: "有刷直流機", bldc: "無刷直流馬達", stepper: "步進馬達", wrsm: "繞線激磁同步機"};
var PRESET = {
  ev: [5, 2, 1, 1, 5, 0], pump: [4, 5, 3, 0, 1, 0], printer: [0, 4, 3, 5, 0, 0],
  drone: [2, 3, 4, 0, 5, 0], servo: [3, 1, 1, 4, 4, 0], plant: [4, 1, 0, 0, 2, 5]
};
var QUIZ_CH = {
  "00": ["00-線性直流機與能量轉換.html", "00 線性直流機與能量轉換"],
  "01": ["01-鐵心電壓與磁通.html", "01 鐵心電壓與磁通"],
  "02": ["02-阻抗折算與自耦變壓器.html", "02 阻抗折算與自耦變壓器"],
  "03": ["03-變壓器等效電路與試驗.html", "03 變壓器等效電路與試驗"],
  "04": ["04-電壓調整率與效率.html", "04 電壓調整率與效率"],
  "05": ["05-旋轉機共同語言.html", "05 旋轉機共同語言"],
  "06": ["06-直流機轉矩轉速線.html", "06 直流機轉矩轉速線"],
  "07": ["07-感應機滑差與功率流.html", "07 感應機滑差與功率流"],
  "08": ["08-感應機轉矩曲線.html", "08 感應機轉矩曲線"],
  "09": ["09-同步發電機功率角.html", "09 同步發電機功率角"],
  "10": ["10-同步馬達V曲線.html", "10 同步馬達 V 曲線"],
  "11": ["11-起動與速控.html", "11 起動與速控"],
  "12": ["12-馬達家族與選型.html", "12 馬達家族與選型"]
};
var QUIZ = [
  {id:"q00-1",t:"num",ans:10,tol:0.05,why:"i = F / (B × l)：電流由負載決定。",err:"常見錯因：把電池電壓直接除以電阻。"},
  {id:"q00-2",t:"num",ans:240,tol:1,why:"v = 0 時 e_ind = 0，i = V_B / R。",err:"常見錯因：沿用穩態負載電流。"},
  {id:"q00-3",t:"sel",ans:"a",tol:0,why:"e_ind 追上 V_B 後，電流與力都成為零。",err:"常見錯因：把理想模型的平衡誤認為摩擦造成。"},
  {id:"q01-1",t:"num",ans:1.125395,tol:0.01,why:"Φ_max = V / (4.442883 × f × N)，再除以 A。",err:"常見錯因：cm² 沒換成 m²。"},
  {id:"q01-2",t:"num",ans:3.799544,tol:0.05,why:"氣隙磁阻是鐵心的 5 倍，總磁阻為 6 倍。",err:"常見錯因：漏加原本的鐵心磁阻。"},
  {id:"q01-3",t:"sel",ans:"a",tol:0,why:"磁通峰值由電壓、頻率與匝數決定。",err:"常見錯因：把決定電流的磁阻當成決定磁通。"},
  {id:"q02-1",t:"num",ans:583.095189,tol:0.5,why:"Z′ = a² × Z_L。",err:"常見錯因：只乘 a，或沒先算複數阻抗大小。"},
  {id:"q02-2",t:"num",ans:11,tol:0.05,why:"功率優勢為 (N_C + N_SE) / N_SE。",err:"常見錯因：分母用了共同繞組匝數。"},
  {id:"q02-3",t:"sel",ans:"a",tol:0,why:"電壓乘 a、電流除 a，所以比值乘 a²。",err:"常見錯因：誤以為折算會改變功率。"},
  {id:"q03-1",t:"num",ans:7.993605,tol:0.01,why:"R_eq = P_sc / I_sc²。",err:"常見錯因：把 V_sc / I_sc 當成電阻而非阻抗大小。"},
  {id:"q03-2",t:"num",ans:2.498002,tol:0.01,why:"Z_base = 2400² / 10000 = 576 Ω。",err:"常見錯因：忘了乘 100 %。"},
  {id:"q03-3",t:"sel",ans:"a",tol:0,why:"開路試驗給 R_c 與 X_m。",err:"常見錯因：把開路與短路試驗的角色對調。"},
  {id:"q04-1",t:"num",ans:2.364503,tol:0.01,why:"|V_1′| = 245.674808 V。",err:"常見錯因：直接把電阻壓降與電抗壓降相加。"},
  {id:"q04-2",t:"num",ans:0.657267,tol:0.005,why:"x* = √(P_core / P_cu,fl)。",err:"常見錯因：漏取平方根。"},
  {id:"q04-3",t:"sel",ans:"a",tol:0,why:"領前時 X sin θ 項變號，二次電壓可能升高。",err:"常見錯因：把調整率和損耗混在一起。"},
  {id:"q05-1",t:"num",ans:1800,tol:0.5,why:"n_s = 120 × f / P。",err:"常見錯因：把極數當極對數。"},
  {id:"q05-2",t:"num",ans:7330.382858,tol:1,why:"P = T × ω，ω = 2π × 1750 / 60。",err:"常見錯因：rpm 沒換成 rad/s。"},
  {id:"q05-3",t:"sel",ans:"a",tol:0,why:"超過同步速時，機械功率往電網送。",err:"常見錯因：只看轉速高低，沒看能量方向。"},
  {id:"q06-1",t:"num",ans:20,tol:0.05,why:"I_a = T / KΦ。",err:"常見錯因：拿端電壓除以電樞電阻。"},
  {id:"q06-2",t:"num",ans:2196.338215,tol:1,why:"E_a = 230 V，ω = 230 rad/s。",err:"常見錯因：忘記 rad/s 換成 rpm。"},
  {id:"q06-3",t:"sel",ans:"a",tol:0,why:"改電樞電壓會讓整條線平移，斜率與電流不變。",err:"常見錯因：和改激磁的效果混淆。"},
  {id:"q07-1",t:"num",ans:2,tol:0.01,why:"f_r = s × f，s = 0.033333。",err:"常見錯因：把百分比 3.333333 直接乘頻率。"},
  {id:"q07-2",t:"num",ans:266.666667,tol:0.5,why:"P_RCL = s × P_AG。",err:"常見錯因：用 1 − s 計算銅損。"},
  {id:"q07-3",t:"sel",ans:"a",tol:0,why:"沒有相對運動就沒有感應電流。",err:"常見錯因：把同步速誤認為最大轉矩點。"},
  {id:"q08-1",t:"num",ans:143.556819,tol:0.5,why:"代入戴維寧參數與最大轉矩式。",err:"常見錯因：把線電壓當每相電壓。"},
  {id:"q08-2",t:"num",ans:61.626951,tol:0.5,why:"起動時 s = 1。",err:"常見錯因：代入額定滑差。"},
  {id:"q08-3",t:"sel",ans:"a",tol:0,why:"R_2 只移動崩潰滑差，不改崩潰轉矩。",err:"常見錯因：把起動轉矩與崩潰轉矩混淆。"},
  {id:"q09-1",t:"num",ans:33859.994189,tol:5,why:"P = 3 × V × E × sin δ / X_s。",err:"常見錯因：角度未換成弧度或漏掉三相。"},
  {id:"q09-2",t:"num",ans:99000,tol:5,why:"δ = 90° 時 sin δ = 1。",err:"常見錯因：仍代入 20°。"},
  {id:"q09-3",t:"sel",ans:"a",tol:0,why:"超過 90° 後實功反而下降，會脫步。",err:"常見錯因：以為功率角越大功率必然越大。"},
  {id:"q10-1",t:"num",ans:224.646646,tol:0.1,why:"E_f = |V − jX_s I_a,min|。",err:"常見錯因：直接把兩個量算術相加。"},
  {id:"q10-2",t:"num",ans:22.727273,tol:0.05,why:"I_a,min = P / (3 × V_φ)。",err:"常見錯因：漏掉三相係數。"},
  {id:"q10-3",t:"sel",ans:"a",tol:0,why:"超激磁時電流領前，馬達供給無功。",err:"常見錯因：把實功與無功方向混淆。"},
  {id:"q11-1",t:"num",ans:2,tol:0.01,why:"Y–Δ 的線電流是直接起動的 1 / 3。",err:"常見錯因：只除以 √3。"},
  {id:"q11-2",t:"num",ans:0.63375,tol:0.005,why:"x² × t = 0.4225 × 1.5。",err:"常見錯因：分接比例沒有平方。"},
  {id:"q11-3",t:"sel",ans:"a",tol:0,why:"V/f 定值維持磁通，低頻時電流仍可受控。",err:"常見錯因：以為變頻起動靠提高電壓。"},
  {id:"q12-1",t:"num",ans:60,tol:0.5,why:"5×5 + 2×2 + 1×2 + 1×4 + 5×5 + 0×1。",err:"常見錯因：權重與分數的順序對錯。"},
  {id:"q12-2",t:"num",ans:52,tol:0.5,why:"4×3 + 5×5 + 3×4 + 0 + 1×3 + 0。",err:"常見錯因：漏算控制簡單權重。"},
  {id:"q12-3",t:"sel",ans:"a",tol:0,why:"兩者同屬永磁機器，差在反電動勢波形與換向方式。",err:"常見錯因：把驅動差異誤認成有無磁鐵。"}
];

/* ---------- 3. 純計算函式 ---------- */
function linmachCalc(mode, vb, r, b, l, force) {
  var bl = b * l, i, e, v, pcu, eta;
  if (!bl || !r) { return {i:null,e:null,v:null,Pin:null,Pconv:null,Pcu:null,eta:null,v0:null,Istall:null,Fstall:null}; }
  i = force / bl;
  pcu = i * i * r;
  if (mode === "gen") {
    e = vb + i * r; v = e / bl; eta = e ? vb / e * 100 : null;
    return {i:safe(i),e:safe(e),v:safe(v),Pmech:safe(e*i),Pbatt:safe(vb*i),Pcu:safe(pcu),eta:safe(eta)};
  }
  e = vb - i * r; v = e / bl; eta = vb ? e / vb * 100 : null;
  return {i:safe(i),e:safe(e),v:safe(v),Pin:safe(vb*i),Pconv:safe(e*i),Pcu:safe(pcu),eta:safe(eta),v0:safe(vb/bl),Istall:safe(vb/r),Fstall:safe(bl*vb/r)};
}

function corefluxCalc(v, f, n, acm2, lcm, mur, gapmm) {
  var area = acm2 * 1e-4, len = lcm * 1e-2, gap = gapmm * 1e-3;
  var phimax, bmax, rc, rg, rt, fpk, ipk, irms, induct, xm;
  if (!f || !n || !area || !mur) { return {phimax:null,Bmax:null,Rc:null,Rg:null,Rt:null,Fpk:null,Ipk:null,Irms:null,L:null,Xm:null,sat:false}; }
  phimax = v / (K444 * f * n); bmax = phimax / area;
  rc = len / (MU0 * mur * area); rg = gap / (MU0 * area); rt = rc + rg;
  fpk = phimax * rt; ipk = fpk / n; irms = ipk / Math.sqrt(2);
  induct = rt ? n * n / rt : null; xm = induct === null ? null : 2 * Math.PI * f * induct;
  return {phimax:safe(phimax),Bmax:safe(bmax),Rc:safe(rc),Rg:safe(rg),Rt:safe(rt),Fpk:safe(fpk),Ipk:safe(ipk),Irms:safe(irms),L:safe(induct),Xm:safe(xm),sat:bmax>1.5};
}

function referralCalc(mode, v1, n1, n2, resistance, reactance) {
  var a, vh, ih, il, ic, sw;
  if (!n1 || !n2) { return {a:null,V2:null,I2:null,I1:null,Rref:null,Xref:null,Zrefm:null,S:null,P:null,Q:null,pf:null}; }
  if (mode === "auto") {
    if (!v1) { return {VH:null,IH:null,IL:null,IC:null,SW:null,adv:null}; }
    vh = v1 * (n1 + n2) / n1; ih = 10000 / vh; il = 10000 / v1; ic = il - ih; sw = (vh - v1) * ih;
    return {VH:safe(vh),IH:safe(ih),IL:safe(il),IC:safe(ic),SW:safe(sw),adv:safe(sw ? 10000/sw : null)};
  }
  a = n1 / n2;
  var zm = Math.sqrt(resistance*resistance + reactance*reactance), v2 = v1 / a, i2;
  if (!zm) { return {a:safe(a),V2:safe(v2),I2:null,I1:null,Rref:safe(a*a*resistance),Xref:safe(a*a*reactance),Zrefm:null,S:null,P:null,Q:null,pf:null}; }
  i2 = v2 / zm;
  return {a:safe(a),V2:safe(v2),I2:safe(i2),I1:safe(i2/a),Rref:safe(a*a*resistance),Xref:safe(a*a*reactance),Zrefm:safe(a*a*zm),S:safe(v2*i2),P:safe(i2*i2*resistance),Q:safe(i2*i2*reactance),pf:safe(resistance/zm)};
}

function xftestCalc(a, voc, ioc, poc, vsc, isc, psc) {
  var g, y, b2, rcLv, xmLv, z, req, x2, xeq, vhv, zbase, ir;
  var bad = (!voc || !isc || poc > voc*ioc || psc > vsc*isc);
  g = voc ? poc/(voc*voc) : null; y = voc ? ioc/voc : null;
  b2 = g === null || y === null ? null : y*y-g*g;
  rcLv = g ? 1/g : null; xmLv = b2 !== null && b2 > 0 ? 1/Math.sqrt(b2) : null;
  z = isc ? vsc/isc : null; req = isc ? psc/(isc*isc) : null;
  x2 = z === null || req === null ? null : z*z-req*req; xeq = x2 !== null && x2 > 0 ? Math.sqrt(x2) : null;
  vhv = 240*a; zbase = vhv ? vhv*vhv/10000 : null; ir = vhv ? 10000/vhv : null;
  if (b2 !== null && b2 <= 0) { bad = true; }
  if (x2 !== null && x2 <= 0) { bad = true; }
  return {bad:bad,Rc_lv:safe(rcLv),Xm_lv:safe(xmLv),Rc:safe(rcLv===null?null:rcLv*a*a),Xm:safe(xmLv===null?null:xmLv*a*a),Ic:safe(voc&&g!==null?voc*g:null),Im:safe(voc&&b2!==null&&b2>=0?voc*Math.sqrt(b2):null),Zeq:safe(z),Req:safe(req),Xeq:safe(xeq),Zbase:safe(zbase),Zpct:safe(z!==null&&zbase?z/zbase*100:null),Ir:safe(ir),Pcu_fl:safe(ir!==null&&req!==null?ir*ir*req:null),Req_lv:safe(req===null?null:req/(a*a)),Xeq_lv:safe(xeq===null?null:xeq/(a*a))};
}

function xfregCalc(load, pf, kind, req, xeq, pcore) {
  var rated = 10000/240, i2 = load*rated, theta = Math.acos(Math.max(-1,Math.min(1,pf)));
  if (kind === "lead") { theta = -theta; }
  var re = 240+i2*(req*Math.cos(theta)+xeq*Math.sin(theta));
  var im = i2*(xeq*Math.cos(theta)-req*Math.sin(theta));
  var v1 = Math.sqrt(re*re+im*im), vr=(v1-240)/240*100, pout=load*10000*pf;
  var pcu=i2*i2*req, pin=pout+pcu+pcore, pcuFl=rated*rated*req;
  var xs=pcuFl>0?Math.sqrt(pcore/pcuFl):null, ps=xs===null?null:xs*10000*pf;
  return {I2:safe(i2),V1:safe(v1),VR:safe(vr),Pout:safe(pout),Pcu:safe(pcu),Pin:safe(pin),eta:safe(pin?pout/pin*100:0),Pcu_fl:safe(pcuFl),xstar:safe(xs),eta_star:safe(ps===null?null:ps/(ps+2*pcore)*100)};
}

function powerflowCalc(f, poles, n, torque, pcu, pcore, pmech, pstray) {
  var ns=poles?120*f/poles:null, ws=ns===null?null:2*Math.PI*ns/60, w=2*Math.PI*n/60;
  var slip=ns?(ns-n)/ns*100:null, pout=torque*w, loss=pcu+pcore+pmech+pstray, pin=pout+loss;
  return {ns:safe(ns),ws:safe(ws),w:safe(w),s:safe(slip),Pout:safe(pout),hp:safe(pout/746),loss:safe(loss),Pin:safe(pin),eta:safe(pin?pout/pin*100:0)};
}

function dcmotorCalc(vt, field, ra, torque) {
  var kp=field, ia=kp?torque/kp:null, ea=ia===null?null:vt-ia*ra, w=kp&&ea!==null?ea/kp:null;
  var w0=kp?vt/kp:null, pin=ia===null?null:vt*ia, pconv=ea===null||ia===null?null:ea*ia;
  return {KP:safe(kp),Ia:safe(ia),Ea:safe(ea),w:safe(w),n:safe(w===null?null:w*60/(2*Math.PI)),w0:safe(w0),n0:safe(w0===null?null:w0*60/(2*Math.PI)),drop:safe(kp?ra*torque/(kp*kp):null),Pconv:safe(pconv),Pin:safe(pin),Pcu:safe(ia===null?null:ia*ia*ra),eta:safe(pin?pconv/pin*100:0),Istart:safe(ra?vt/ra:null),Tstall:safe(ra?kp*vt/ra:null)};
}

function imslipCalc(f, poles, n, pag, pmech) {
  var ns=poles?120*f/poles:null, s=ns?(ns-n)/ns:null, ws=ns===null?null:2*Math.PI*ns/60, w=2*Math.PI*n/60;
  var prcl=s===null?null:s*pag, pconv=s===null?null:(1-s)*pag, pout=pconv===null?null:pconv-pmech;
  return {ns:safe(ns),s:safe(s),fr:safe(s===null?null:s*f),ws:safe(ws),w:safe(w),Prcl:safe(prcl),Pconv:safe(pconv),Pout:safe(pout),Tind:safe(ws?pag/ws:null),Tout:safe(w&&pout!==null?pout/w:null)};
}

function imtorqueCalc(s, r2, vll, f, tload) {
  var k=f/60, r1=IM.R1, x1=IM.X1*k, x2=IM.X2*k, xm=IM.XM*k;
  var vph=vll/Math.sqrt(3), den=r1*r1+(x1+xm)*(x1+xm), vth=vph*xm/Math.sqrt(den);
  var ar=-xm*x1, ai=xm*r1, br=r1, bi=x1+xm;
  var rth=(ar*br+ai*bi)/den, xth=(ai*br-ar*bi)/den;
  var ns=120*f/IM.POLES, ws=2*Math.PI*ns/60, root=Math.sqrt(rth*rth+(xth+x2)*(xth+x2));
  var torqueAt=function (slip) {
    if (!slip || !ws) { return null; }
    var rr=r2/slip;
    return 3*vth*vth*rr/(ws*((rth+rr)*(rth+rr)+(xth+x2)*(xth+x2)));
  };
  var smax=root?r2/root:null, tmax=root&&ws?3*vth*vth/(2*ws*(rth+root)):null, tstart=torqueAt(1), ts=torqueAt(s);
  var rr=s?r2/s:null, i2=rr===null?null:vth/Math.sqrt((rth+rr)*(rth+rr)+(xth+x2)*(xth+x2));
  var n=(1-s)*ns, pag=ts===null?null:ts*ws, points=[1,0.5,0.3,0.2,0.1,0.05,0.03,0.01];
  return {Vph:safe(vph),VTH:safe(vth),RTH:safe(rth),XTH:safe(xth),ws:safe(ws),ns:safe(ns),smax:safe(smax),Tmax:safe(tmax),Tstart:safe(tstart),Ts:safe(ts),I2:safe(i2),n:safe(n),Pag:safe(pag),Pconv:safe(pag===null?null:pag*(1-s)),Prcl:safe(pag===null?null:s*pag),ok:tstart!==null&&tstart>=1.1*tload,curve:points.map(function(p){return {s:p,T:safe(torqueAt(p))};})};
}

function syncpowerCalc(ef, vt, xs, delta) {
  var d=delta*Math.PI/180, p=xs?3*vt*ef*Math.sin(d)/xs:null, q=xs?3*vt*(ef*Math.cos(d)-vt)/xs:null;
  var pmax=xs?3*vt*ef/xs:null, ire=xs?ef*Math.sin(d)/xs:null, iim=xs?-(ef*Math.cos(d)-vt)/xs:null;
  var ia=ire===null?null:Math.sqrt(ire*ire+iim*iim), iang=ia?Math.atan2(iim,ire)*180/Math.PI:0, apparent=ia===null?null:3*vt*ia;
  return {P:safe(p),Q:safe(q),Pmax:safe(pmax),Ia:safe(ia),Iang:safe(iang),S:safe(apparent),pf:safe(apparent?p/apparent:null),coef:safe(xs?3*vt*ef*Math.cos(d)/xs:null)};
}

function vcurveCalc(power, ef, xs) {
  var vt=220, emin=3*vt?power*xs/(3*vt):null, lost=ef<emin, iu=power/(3*vt), eu=Math.sqrt(vt*vt+(xs*iu)*(xs*iu));
  var one=function (e) {
    if (!e || e<emin || !xs) { return {Ef:e,lost:true,Ia:null}; }
    var sd=power*xs/(3*vt*e), d=Math.asin(Math.max(-1,Math.min(1,sd))), ere=e*Math.cos(d), eim=-e*Math.sin(d);
    var ire=-eim/xs, iim=(ere-vt)/xs;
    return {Ef:e,lost:false,deg:d*180/Math.PI,Ire:ire,Iim:iim,Ia:Math.sqrt(ire*ire+iim*iim),Iang:Math.atan2(iim,ire)*180/Math.PI,pf:Math.cos(Math.atan2(iim,ire)),Q:-3*vt*iim};
  };
  var current=one(ef), samples=[150,200,eu,250,300,350,400].map(one);
  return {Emin:safe(emin),lost:lost,deg:safe(current.deg),Ia:safe(current.Ia),Iang:safe(current.Iang),pf:safe(current.pf),Q:safe(current.Q),Iu:safe(iu),Eu:safe(eu),table:samples};
}

function startingCalc(method, k, directTorque, tap, load) {
  var make=function(key){
    var x=tap/100, il, im, ts;
    if(key==="ydelta"){il=k/3;im=k/3;ts=directTorque/3;}
    else if(key==="autotx"){il=x*x*k;im=x*k;ts=x*x*directTorque;}
    else if(key==="vfd"){il=1.5;im=1.5;ts=1.0;}
    else{il=k;im=k;ts=directTorque;}
    return {key:key,Iline:safe(il),Imotor:safe(im),Tstart:safe(ts),ok:ts>=1.1*load,margin:safe(ts-load)};
  };
  var all=[make("dol"),make("ydelta"),make("autotx"),make("vfd")], current=all[0], i;
  for(i=0;i<all.length;i+=1){if(all[i].key===method){current=all[i];}}
  return {Iline:current.Iline,Imotor:current.Imotor,Tstart:current.Tstart,ok:current.ok,margin:current.margin,all:all};
}

function motorpickCalc(weights) {
  var order=["pmsm","im","dcbrush","bldc","stepper","wrsm"];
  var ranked=order.map(function(key,index){
    var total=0,i; for(i=0;i<6;i+=1){total+=weights[i]*SCORE[key][i];}
    return {key:key,name:MOTOR_NAME[key],total:total,scores:SCORE[key].slice(),order:index};
  });
  ranked.sort(function(a,b){return b.total-a.total||a.order-b.order;});
  return {ranked:ranked};
}

/* ---------- 4. 每章守衛 ---------- */
function linmach() {
  if (!$ ("lm-vb")) { return; }
  var ids=["lm-mode","lm-vb","lm-r","lm-b","lm-l","lm-f"];
  var draw=function(){
    var mode=pick("lm-mode"), r=linmachCalc(mode,val("lm-vb"),val("lm-r"),val("lm-b"),val("lm-l"),val("lm-f")), rows;
    if(mode==="gen"){
      rows=[["電流",f6(r.i)+" A"],["感應電壓",f6(r.e)+" V"],["速度",f6(r.v)+" m/s"],["機械輸入",f6(r.Pmech)+" W"],["電池收到",f6(r.Pbatt)+" W"],["銅損",f6(r.Pcu)+" W"],["效率",f6(r.eta)+" %"]];
      put("linmach-output","<p>這個模式只用到六個控制的同一組值，把 F 當成外力（發電機）。</p>"+table(["量","結果"],rows)+"<p>電流反向流回電池，機械功率 e × i 比電池收到的 V_B × i 多出銅損。效率 ＝ V_B / e，差的那一段全是 i² × R。</p>"+(val("lm-vb")===0?"<p>電池收到 0 W，外力仍可推動發電。</p>":""));
    }else{
      rows=[["電流",f6(r.i)+" A"],["感應電壓",f6(r.e)+" V"],["速度",f6(r.v)+" m/s"],["電池輸出",f6(r.Pin)+" W"],["轉換功率",f6(r.Pconv)+" W"],["銅損",f6(r.Pcu)+" W"],["效率",f6(r.eta)+" %"],["無負載速度",f6(r.v0)+" m/s"],["失速電流",f6(r.Istall)+" A"],["失速力",f6(r.Fstall)+" N"]];
      var edge=r.e<0?"拉不動：負載力超過失速力，導桿被倒拖，這不是穩態工作點。":(r.e===0?"失速：全部電功率變成銅損。":(val("lm-f")===0?"無負載：電流為 0，感應電壓追上電池電壓後便不再加速。":"目前是可運作的馬達工作點。"));
      if(val("lm-vb")===0){edge="沒有電源，馬達模式不成立。";}
      if(val("lm-b")===0.1&&val("lm-f")>=24){edge+=" 磁通太弱，同樣的力要 10 倍電流。";}
      put("linmach-output","<p>這個模式只用到六個控制的同一組值，把 F 當成負載力（馬達）。</p>"+table(["量","結果"],rows)+"<p>"+edge+"</p><p>電流由負載力決定：i = F / (B × l)，不是由電壓決定。效率 ＝ e / V_B，差的那一段全是 i² × R。</p>");
    }
  }; bind(ids,draw); draw();
}

function coreflux(){
  if(!$ ("cf-v")){return;}
  var ids=["cf-v","cf-f","cf-n","cf-a","cf-l","cf-mur","cf-gap"];
  var draw=function(){var r=corefluxCalc(val("cf-v"),val("cf-f"),val("cf-n"),val("cf-a"),val("cf-l"),val("cf-mur"),val("cf-gap"));
    var rows=[["Φ_max",f6(r.phimax)+" Wb"],["B_max",f6(r.Bmax)+" T"],["鐵心磁阻",f6(r.Rc)+" A/Wb"],["氣隙磁阻",f6(r.Rg)+" A/Wb"],["總磁阻",f6(r.Rt)+" A/Wb"],["磁動勢峰值",f6(r.Fpk)+" A·匝"],["激磁電流峰值",f6(r.Ipk)+" A"],["激磁電流有效值",f6(r.Irms)+" A"],["L_m",f6(r.L)+" H"],["X_m",f6(r.Xm)+" Ω"],["V / X_m",f6(r.Xm?val("cf-v")/r.Xm:null)+" A"]];
    var msg=r.sat?"飽和：B_max 超過矽鋼片約 1.5 T 的參考值，這裡算出的激磁電流只是線性下限，實際會遠大於此且波形畸變。":"未飽和，線性模型成立。";
    if(val("cf-gap")>0){msg+=" 氣隙磁阻是鐵心的 "+f6(r.Rg/r.Rc)+" 倍，激磁電流跟著變成無氣隙時的 "+f6(r.Rt/r.Rc)+" 倍。";}else{msg+=" 這是變壓器的情況：不留氣隙，激磁電流最小。";}
    if(val("cf-gap")>=1){msg+=" 轉子要轉非留氣隙不可，因此激磁電流與無功較大。";}
    if(val("cf-f")===50&&val("cf-v")===240&&val("cf-n")===200){msg+=" 同一顆 60 Hz 鐵心接 50 Hz，磁通多 20 %。";}
    if(val("cf-mur")===5000){msg+=" 高導磁材料省的是激磁電流，不改變磁通。";}
    put("coreflux-output",table(["量","結果"],rows)+"<p>"+msg+"</p><p>磁通由 V、f、N 決定，磁阻只決定電流。</p>");}; bind(ids,draw);draw();
}

function referral(){
  if(!$ ("rf-v1")){return;}
  var ids=["rf-mode","rf-v1","rf-n1","rf-n2","rf-r","rf-x"];
  var draw=function(){var mode=pick("rf-mode"),r=referralCalc(mode,val("rf-v1"),val("rf-n1"),val("rf-n2"),val("rf-r"),val("rf-x"));
    if(mode==="auto"){
      put("referral-output","<p>這個模式只用到 V_1、N_1、N_2，其餘控制不影響結果。</p>"+table(["量","結果"],[["V_H",f6(r.VH)+" V"],["I_H",f6(r.IH)+" A"],["I_L",f6(r.IL)+" A"],["I_C",f6(r.IC)+" A"],["S_W",f6(r.SW)+" VA"],["功率優勢",f6(r.adv)]])+"<p>繞組只承擔 (V_H − V_L) × I_H，優勢 ＝ (N_C + N_SE) / N_SE。代價是沒有隔離，高壓側故障會直接打到低壓側。</p>"+(val("rf-n2")>=val("rf-n1")*5?"<p>升壓比太大，自耦沒有優勢，改用雙繞組。</p>":""));
    }else{
      var short=val("rf-r")===0&&val("rf-x")===0;
      var rows=[["匝比",f6(r.a)],["V_2",f6(r.V2)+" V"],["I_2",f6(r.I2)+" A"],["I_1",f6(r.I1)+" A"],["Z′ 實部",f6(r.Rref)+" Ω"],["Z′ 虛部",f6(r.Xref)+" Ω"],["Z′ 大小",f6(r.Zrefm)+" Ω"],["視在功率",f6(r.S)+" VA"],["實功",f6(r.P)+" W"],["無功",f6(r.Q)+" var"],["功率因數",f6(r.pf)]];
      var msg=short?"短路：理想變壓器無法限流；真實變壓器靠第 03 章的漏阻抗限流。":(r.a<1?"升壓：二次電壓比一次高，二次電流比一次小。":(r.a===1?"隔離變壓器：只隔離不變壓。":"目前為降壓折算。"));
      if(val("rf-x")<0){msg+=" 電容性負載，Q 為負，負載在供給無功。";}
      put("referral-output","<p>這個模式只用到 V_1、N_1、N_2、R、X。</p>"+table(["量","結果"],rows)+"<p>"+msg+"</p><p>Z′ = a² × Z_L：電壓乘 a、電流除 a，所以阻抗乘 a²，功率不變。</p>");
    }};bind(ids,draw);draw();
}

function xftest(){
  if(!$ ("xt-voc")){return;}
  var ids=["xt-a","xt-voc","xt-ioc","xt-poc","xt-vsc","xt-isc","xt-psc"];
  var draw=function(){var r=xftestCalc(val("xt-a"),val("xt-voc"),val("xt-ioc"),val("xt-poc"),val("xt-vsc"),val("xt-isc"),val("xt-psc"));
    var rows=[["R_c 低壓側",f6(r.Rc_lv)+" Ω"],["X_m 低壓側",f6(r.Xm_lv)+" Ω"],["R_c 高壓側",f6(r.Rc)+" Ω"],["X_m 高壓側",f6(r.Xm)+" Ω"],["鐵損電流",f6(r.Ic)+" A"],["激磁電流",f6(r.Im)+" A"],["Z_eq",f6(r.Zeq)+" Ω"],["R_eq",f6(r.Req)+" Ω"],["X_eq",f6(r.Xeq)+" Ω"],["Z_base",f6(r.Zbase)+" Ω"],["百分阻抗",f6(r.Zpct)+" %"],["額定一次電流",f6(r.Ir)+" A"],["滿載銅損",f6(r.Pcu_fl)+" W"],["R_eq 低壓側",f6(r.Req_lv)+" Ω"],["X_eq 低壓側",f6(r.Xeq_lv)+" Ω"]];
    var msg=r.bad?"讀數不可能：功率可能大於視在功率，或電流與阻抗條件互相矛盾，請檢查儀表讀數。":"開路試驗給激磁分支（R_c、X_m），短路試驗給串聯支路（R_eq、X_eq），兩個試驗各關掉一半電路。";
    if(r.Zpct!==null&&r.Zpct<1){msg+=" 百分阻抗很小：短路電流會非常大，保護要更快。";} if(r.Zpct!==null&&r.Zpct>8){msg+=" 百分阻抗偏大：電壓調整率會差。";} if(val("xt-a")===20){msg+=" 匝比改為 20，Z_base 變成原本 4 倍。";}
    put("xftest-output",table(["量","結果"],rows)+"<p>"+msg+"</p><p>滿載銅損 "+f6(r.Pcu_fl)+" W，鐵損 "+f6(val("xt-poc"))+" W。</p>");};bind(ids,draw);draw();
}

function xfreg(){
  if(!$ ("xr-load")){return;}
  var ids=["xr-load","xr-pf","xr-kind","xr-req","xr-xeq","xr-pcore"];
  var draw=function(){var x=val("xr-load"),r=xfregCalc(x,val("xr-pf"),pick("xr-kind"),val("xr-req"),val("xr-xeq"),val("xr-pcore"));
    var rows=[["I_2",f6(r.I2)+" A"],["|V_1′|",f6(r.V1)+" V"],["調整率",f6(r.VR)+" %"],["輸出功率",f6(r.Pout)+" W"],["銅損",f6(r.Pcu)+" W"],["鐵損",f6(val("xr-pcore"))+" W"],["輸入功率",f6(r.Pin)+" W"],["效率",f6(r.eta)+" %"],["滿載銅損",f6(r.Pcu_fl)+" W"],["x*",f6(r.xstar)],["η*",f6(r.eta_star)+" %"]];
    var msg=r.VR<0?"領前功因讓二次電壓比空載還高：X sin θ 項變號。":(Math.abs(x-r.xstar)<=0.05?"你正站在最大效率點附近：銅損約等於鐵損。":(x>r.xstar?"超過最大效率點：銅損已大於鐵損。":"輕載：鐵損佔比大。"));
    if(x===0){msg="空載：效率 0，鐵損仍在燒。";} if(x===1.25){msg+=" 過載 25 %：銅損變 1.5625 倍，長時間會過熱。";} if(r.xstar>1){msg+=" 最大效率點超過額定，這種設計把鐵損做得太大，不合理。";} if(val("xr-pf")===0.5){msg+=" 同樣電流只送一半實功，效率必然掉。";}
    put("xfreg-output",table(["量","結果"],rows)+"<p>"+msg+"</p><p>效率的分母裡鐵損固定、銅損隨 x² 變，所以最大效率在 x* = √(P_core / P_cu,fl)。</p>");};bind(ids,draw);draw();
}

function powerflow(){
  if(!$ ("pw-n")){return;}
  var ids=["pw-f","pw-poles","pw-n","pw-t","pw-pcu","pw-pcore","pw-pmech","pw-pstray"];
  var draw=function(){var r=powerflowCalc(val("pw-f"),val("pw-poles"),val("pw-n"),val("pw-t"),val("pw-pcu"),val("pw-pcore"),val("pw-pmech"),val("pw-pstray"));
    var rows=[["n_s",f6(r.ns)+" rpm"],["ω_s",f6(r.ws)+" rad/s"],["ω",f6(r.w)+" rad/s"],["滑差",f6(r.s)+" %"],["輸出功率",f6(r.Pout)+" W"],["馬力",f6(r.hp)+" hp"],["總損耗",f6(r.loss)+" W"],["輸入功率",f6(r.Pin)+" W"],["效率",f6(r.eta)+" %"]];
    var n=val("pw-n"),msg=n===0?"堵轉：輸出 0，全部輸入變損耗，銅損此時實際會遠大於你設的值。":(n<r.ns?"感應馬達區：轉子比旋轉磁場慢。":(n===r.ns?"同步速：只有同步機能在這裡出力，感應機在這裡沒有轉矩。":"超過同步速：這是感應發電機，機械功率在往電網送。"));
    if(val("pw-t")===0){msg+=" 無負載：只剩損耗。";} if(r.s>20&&n>0){msg+=" 滑差這麼大不是正常工作點，多半是極數或頻率設錯。";}
    put("powerflow-output",table(["量","結果"],rows)+"<p>P_in "+f6(r.Pin)+" W → 損耗 "+f6(r.loss)+" W → P_out "+f6(r.Pout)+" W</p><p>"+msg+"</p><p>P = T × ω，rpm 要先換成 rad/s 才能乘。固定損耗不隨負載變，銅損隨負載平方變。</p>");};bind(ids,draw);draw();
}

function dcmotor(){
  if(!$ ("dc-vt")){return;}
  var ids=["dc-vt","dc-if","dc-ra","dc-t"];
  var draw=function(){var r=dcmotorCalc(val("dc-vt"),val("dc-if"),val("dc-ra"),val("dc-t"));
    var rows=[["KΦ",f6(r.KP)],["I_a",f6(r.Ia)+" A"],["E_a",f6(r.Ea)+" V"],["ω",f6(r.w)+" rad/s"],["n",f6(r.n)+" rpm"],["無負載角速度",f6(r.w0)+" rad/s"],["無負載轉速",f6(r.n0)+" rpm"],["速降",f6(r.drop)+" rad/s"],["轉換功率",f6(r.Pconv)+" W"],["電樞輸入",f6(r.Pin)+" W"],["電樞銅損",f6(r.Pcu)+" W"],["效率",f6(r.eta)+" %"],["起動電流",f6(r.Istart)+" A"],["失速轉矩",f6(r.Tstall)+" N·m"]];
    var pts=[0,0.25,0.5,0.75,1].map(function(q){var t=q*r.Tstall,rr=dcmotorCalc(val("dc-vt"),val("dc-if"),val("dc-ra"),t);return [f6(t),f6(rr.n)];});
    var msg=r.Ea<0?"拉不動：負載超過失速轉矩。":(r.Ea===0?"失速。":"目前是可運作的工作點。");
    if(val("dc-if")<=0.3){msg+=" 磁通太弱、轉速失控：實機的激磁回路斷線會飛車。";} if(val("dc-t")===0){msg+=" 無負載：轉速停在 V_t / KΦ，不會無限升。";} if(val("dc-vt")===0){msg="沒有電樞電壓，馬達不轉。";} if(val("dc-vt")!==240&&val("dc-if")===1&&val("dc-ra")===0.5&&val("dc-t")===20){msg+=" 改電樞電壓：整條線平移、斜率不變、電流不變。";} if(val("dc-if")!==1){msg+=" 改激磁：截距與斜率都變；弱磁升速但同樣轉矩要更多電流，失速轉矩下降。";}
    var multiple=r.Ia?r.Istart/r.Ia:null;
    put("dcmotor-output",table(["量","結果"],rows)+table(["轉矩（N·m）","轉速（rpm）"],pts)+"<p>"+msg+"</p><p>電樞電流由負載轉矩決定 I_a = T / KΦ；電壓決定的是無負載速度。直接起動電流 V_t / R_a ＝ "+f6(r.Istart)+" A，是這個負載點電流的 "+f6(multiple)+" 倍，見第 11 章。</p>");};bind(ids,draw);draw();
}

function imslip(){
  if(!$ ("sl-n")){return;}
  var ids=["sl-f","sl-poles","sl-n","sl-pag","sl-pmech"];
  var draw=function(){var r=imslipCalc(val("sl-f"),val("sl-poles"),val("sl-n"),val("sl-pag"),val("sl-pmech"));
    var rows=[["n_s",f6(r.ns)+" rpm"],["滑差",f6(r.s)+"（"+f6(r.s*100)+" %）"],["f_r",f6(r.fr)+" Hz"],["轉子銅損",f6(r.Prcl)+" W"],["轉換功率",f6(r.Pconv)+" W"],["輸出功率",f6(r.Pout)+" W"],["感應轉矩",f6(r.Tind)+" N·m"],["軸轉矩",f6(r.Tout)+(r.Tout===null?"（軸不轉）":" N·m")]];
    var msg=r.s===1?"堵轉：全部氣隙功率變轉子銅損。":(r.s===0?"同步速：沒有感應、沒有轉矩，這裡的數字只是照式子算，實機到不了。":(r.s<0?"感應發電機：轉子比磁場快，P_conv 大於 P_AG，多出來的是機械輸入。":"馬達區。"));
    if(r.s>0.1&&r.s<1){msg+=" 滑差超過 10 %：轉子銅損佔比太高，不是正常工作點。";} if(r.Pout<0){msg+=" 機械損比轉換功率還大，軸實際轉不動。";}
    put("imslip-output",table(["量","結果"],rows)+"<p>P_AG → 轉子銅損 s × P_AG → P_conv (1 − s) × P_AG → 減機械損 → P_out</p><p>"+msg+"</p><p>氣隙功率照 1 : (1 − s) : s 分：滑差就是轉子銅損的比例。轉子頻率 f_r = s × f ＝ "+f6(r.fr)+" Hz。</p>");};bind(ids,draw);draw();
}

function imtorque(){
  if(!$ ("it-s")){return;}
  var ids=["it-s","it-r2","it-v","it-f","it-tload"];
  var draw=function(){var r=imtorqueCalc(val("it-s"),val("it-r2"),val("it-v"),val("it-f"),val("it-tload"));
    var rows=[["V_φ",f6(r.Vph)+" V"],["V_TH",f6(r.VTH)+" V"],["R_TH",f6(r.RTH)+" Ω"],["X_TH",f6(r.XTH)+" Ω"],["s_max",f6(r.smax)],["T_max",f6(r.Tmax)+" N·m"],["T_start",f6(r.Tstart)+" N·m"],["T(s)",f6(r.Ts)+" N·m"],["I_2",f6(r.I2)+" A"],["轉速",f6(r.n)+" rpm"],["P_AG",f6(r.Pag)+" W"],["P_conv",f6(r.Pconv)+" W"],["P_RCL",f6(r.Prcl)+" W"]];
    var curve=r.curve.map(function(p){return [f6(p.s),f6(p.T)];});
    var msg=r.ok?"直接起動起得動（起動轉矩 "+f6(r.Tstart)+" ≥ 1.1 × 負載）。":"起不動：起動轉矩 "+f6(r.Tstart)+" 小於 1.1 × 負載，見第 11 章換起動方式或改用繞線式加轉子電阻。";
    msg+=r.Ts>val("it-tload")?" 在這個滑差產生的轉矩大於負載，轉子會加速、s 變小。":" 在這個滑差產生的轉矩小於負載，轉子會減速、s 變大。";
    if(val("it-s")>r.smax&&val("it-s")<1){msg+=" 你在崩潰點右側的不穩定區：減速會讓轉矩更小。";} if(val("it-r2")!==0.4){msg+=" 崩潰轉矩不變，只有崩潰滑差跟著 R_2 移動。";} if(val("it-v")!==380){msg+=" 轉矩與電壓平方成正比：電壓 "+f6(val("it-v")/380*100)+" %，轉矩 "+f6(Math.pow(val("it-v")/380,2)*100)+" %。";} if(val("it-f")===50){msg+=" 電壓不變、頻率降低，磁通變大；本模型不含飽和，實機可能飽和。";} if(val("it-s")===0.005){msg+=" 接近同步速：轉矩趨近 0。";} if(val("it-s")===1){msg+=" 堵轉：轉子電流最大、全部氣隙功率變轉子銅損。";}
    put("imtorque-output",table(["量","結果"],rows)+table(["滑差","轉矩（N·m）"],curve)+"<p>"+msg+"</p><p>戴維寧把定子與激磁分支收成 V_TH 與 Z_TH，轉矩只剩一個迴路的事。</p>");};bind(ids,draw);draw();
}

function syncpower(){
  if(!$ ("sp-ef")){return;}
  var ids=["sp-ef","sp-vt","sp-xs","sp-delta"];
  var draw=function(){var r=syncpowerCalc(val("sp-ef"),val("sp-vt"),val("sp-xs"),val("sp-delta")),d=val("sp-delta");
    var rows=[["實功",f6(r.P)+" W"],["無功",f6(r.Q)+" var"],["最大實功",f6(r.Pmax)+" W"],["目前比例",f6(r.Pmax?r.P/r.Pmax*100:null)+" %"],["電樞電流",f6(r.Ia)+" A"],["電流相角",f6(r.Iang)+"°"],["視在功率",f6(r.S)+" VA"],["功率因數",f6(r.pf)],["同步化功率係數",f6(r.coef)+" W/rad"]];
    var curve=[0,30,60,90,120,150,180].map(function(a){return [int0(a),f6(syncpowerCalc(val("sp-ef"),val("sp-vt"),val("sp-xs"),a).P)];});
    var msg=d<90?"穩定區：δ 再增加，P 還會上升。":(d===90?"靜態穩定極限：P 到頂，同步化功率係數為 0。":"脫步區：δ 增加，P 反而下降，原動機推不回來，機器失去同步。");
    msg+=Math.abs(r.Q)<1?" 單位功因。":(r.Q>0?" 超激磁：E_f cos δ > V_φ，發電機在供給無功。":" 欠激磁：吸收無功。");
    if(d===0){msg+=" 不送實功，只有無功流動。";} if(d===180){msg+=" P = 0 且 Q 極負，這是不可能維持的狀態。";} if(val("sp-ef")<val("sp-vt")&&d===0){msg+=" 欠激磁到端電壓比內電勢高：無功往機器裡流。";}
    put("syncpower-output",table(["量","結果"],rows)+table(["δ（°）","P（W）"],curve)+"<p>"+msg+"</p><p>原動機推的是 δ（實功），激磁推的是 E_f（無功與電壓）。</p>");};bind(ids,draw);draw();
}

function vcurve(){
  if(!$ ("vc-p")){return;}
  var ids=["vc-p","vc-ef","vc-xs"];
  var draw=function(){var r=vcurveCalc(val("vc-p"),val("vc-ef"),val("vc-xs"));
    var rows=[["E_f,min",f6(r.Emin)+" V"],["δ",f6(r.deg)+"°"],["I_a",f6(r.Ia)+" A"],["電流相角",f6(r.Iang)+"°"],["功率因數",f6(r.pf)],["無功",f6(r.Q)+" var"],["I_a,min",f6(r.Iu)+" A"],["E_f,unity",f6(r.Eu)+" V"]];
    var samples=r.table.map(function(p,i){return [i===2?f6(p.Ef)+"（單位功因）":f6(p.Ef),p.lost?"脫步":f6(p.Ia)];});
    var msg=r.lost?"脫步：激磁不足以在 δ = 90° 內撐住這個實功。":(r.Iang>0.001?"超激磁：電流領前，馬達供給無功，像一顆電容。":(r.Iang < 0-0.001?"欠激磁：電流落後，馬達吸收無功。":"單位功因：電樞電流最小。"));
    if(!r.lost&&Math.abs(val("vc-ef")-r.Eu)<=5){msg+=" 你在 V 曲線最低點附近。";} if(val("vc-p")===0){msg+=" 同步調相機：不出力，只供無功。";} if(val("vc-ef")===400&&val("vc-p")===15000){msg+=" 激磁過頭：電流約為最低點的 4 倍，幾乎全是無功。";}
    put("vcurve-output",table(["量","結果"],rows)+table(["E_f（V）","I_a（A）"],samples)+"<p>"+msg+"</p><p>實功固定，電流實部固定 P / (3 V_φ)，改激磁只改虛部，所以電流對激磁是 V 形。</p>");};bind(ids,draw);draw();
}

function starting(){
  if(!$ ("st-method")){return;}
  var ids=["st-method","st-k","st-t","st-tap","st-tload"];
  var names={dol:"直接起動",ydelta:"Y–Δ 起動",autotx:"自耦變壓器起動",vfd:"變頻起動"};
  var draw=function(){var method=pick("st-method"),r=startingCalc(method,val("st-k"),val("st-t"),val("st-tap"),val("st-tload"));
    var rows=[["線電流",f6(r.Iline)+" 倍"],["馬達電流",f6(r.Imotor)+" 倍"],["起動轉矩",f6(r.Tstart)+" 倍"],["餘裕",f6(r.margin)+" 倍"],["判準",r.ok?"起得動":"起不動"]];
    var all=r.all.map(function(a){return [names[a.key],f6(a.Iline),f6(a.Imotor),f6(a.Tstart),a.ok?"起得動":"起不動"];});
    var used=method==="autotx"?"k、t、分接頭與負載":(method==="vfd"?"固定的變頻常數與負載":"k、t 與負載");
    var msg="這個方式只用到 "+used+"；自耦分接頭只在自耦模式有效。 "+(r.ok?"起得動：起動轉矩 "+f6(r.Tstart)+" ≥ 1.1 × 負載。":"起不動：起動轉矩 "+f6(r.Tstart)+" < 1.1 × 負載，換方式或減輕起動負載。");
    if(method==="ydelta"){msg+=" 電壓變 1 / √3，電流與轉矩都變 1 / 3。";} if(method==="autotx"){msg+=" 馬達電流 x 倍、線電流 x² 倍、轉矩 x² 倍。";} if(method==="vfd"){msg+=" 靠 V/f 維持磁通，用 1.5 倍電流拿到 1.0 倍轉矩，是唯一不靠降壓的方式。";} if(method==="dol"){msg+=" 電流 k 倍是第 00 章 v = 0 時 e_ind = 0 的結果。";} if(val("st-tload")===0){msg+=" 空載起動：任何方式都起得動，問題只剩電流。";} if(val("st-tload")>=1.5){msg+=" 重載起動：只有直接起動或繞線式加轉子電阻才可能夠力。";} if(val("st-tap")===50){msg+=" 分接頭太低：線電流只剩 1 / 4，轉矩也只剩 1 / 4。";}
    put("starting-output",table(["量","結果"],rows)+table(["方式","線電流","馬達電流","起動轉矩","判準"],all)+"<p>"+msg+"</p>");};bind(ids,draw);draw();
}

function motorpick(){
  if(!$ ("mp-app")){return;}
  var wids=["mp-w1","mp-w2","mp-w3","mp-w4","mp-w5","mp-w6"],criteria=["效率","低成本","控制簡單","定位能力","功率密度","可調激磁"];
  var draw=function(){var weights=wids.map(function(id){return val(id);}),r=motorpickCalc(weights),rows=r.ranked.map(function(m){return [m.name,String(m.total)].concat(m.scores.map(String));});
    var max=Math.max.apply(null,weights),idx=weights.indexOf(max),first=r.ranked[0],msg;
    if(max===0){msg="沒有準則就沒有取捨，先決定你在乎什麼。";}else{msg="第一名 "+first.name+"（總分 "+first.total+"），因為權重最高的準則是 "+criteria[idx]+"，而它在這項拿 "+first.scores[idx]+" 分。";}
    if(r.ranked[0].total-r.ranked[1].total<=2){msg+=" 差距很小，換一個權重就會翻盤，這正是選型要看細部規格的地方。";} if(pick("mp-app")==="plant"){msg+=" 發電廠要可調激磁來控電壓與無功，見第 09 章。";}
    put("motorpick-output",table(["家族","總分"].concat(criteria),rows)+"<p>"+msg+"</p><p>這是一階加權模型，真正的選型還要看轉矩曲線、環境、供應鏈與驅動器成本。</p>");};
  var app=$("mp-app");app.addEventListener("input",function(){var p=PRESET[pick("mp-app")],i;if(p){for(i=0;i<6;i+=1){$(wids[i]).value=p[i];}}draw();});
  bind(wids,draw);draw();
}

/* ---------- 5. 字典與自我檢核 ---------- */
function dictionary(){
  var search=$("term-search");if(!search){return;}
  var cards=Array.prototype.slice.call(document.querySelectorAll(".term-card"));
  var draw=function(){var q=search.value.toLowerCase().trim(),shown=0;cards.forEach(function(card){var hit=!q||card.textContent.toLowerCase().indexOf(q)!==-1;card.hidden=!hit;if(hit){shown+=1;}});put("term-count","顯示 "+shown+" / "+cards.length+" 張卡片");};
  bind(["term-search"],draw);draw();
}

function selfcheck(){
  if(!$ ("quiz-reset")){return;}
  var answered={};
  var progress=function(){var n=0;QUIZ.forEach(function(q){if(answered[q.id]){n+=1;}});put("quiz-progress","已作答 "+n+" / 39 題（僅供參考，不影響瀏覽）");};
  var link=function(id){var ch=id.slice(1,3),t=QUIZ_CH[ch];return t?"<p>回去看：<a href=\""+t[0]+"\">"+t[1]+"</a></p>":"";};
  var makeCheck=function(q){return function(){var node=$(q.id),raw=node?node.value:"",ok,v;if(raw===""||raw===null){put(q.id+"-output","<p>"+(q.t==="num"?"先填一個數字。":"先選一個選項。")+"</p>");answered[q.id]=false;progress();return;}if(q.t==="num"){v=Number(raw);if(isNaN(v)){put(q.id+"-output","<p>先填一個數字。</p>");answered[q.id]=false;progress();return;}ok=Math.abs(v-q.ans)<=q.tol;}else{ok=String(raw)===q.ans;}answered[q.id]=true;if(ok){put(q.id+"-output","<p><strong>答對</strong>　"+q.why+"</p>"+link(q.id));}else{put(q.id+"-output","<p><strong>再看一次</strong>　正確答案是 "+(q.t==="num"?num6(q.ans):"選項 "+q.ans)+"。"+q.why+"　"+q.err+"</p>"+link(q.id));}progress();};};
  QUIZ.forEach(function(q){var btn=$(q.id+"-check");if(btn){btn.addEventListener("click",makeCheck(q));}});
  $("quiz-reset").addEventListener("click",function(){QUIZ.forEach(function(q){var n=$(q.id);if(n){n.value="";}put(q.id+"-output","");answered[q.id]=false;});progress();});progress();
}

/* ---------- 6. 註冊 ---------- */
if(typeof document!=="undefined"){
  [linmach,coreflux,referral,xftest,xfreg,powerflow,dcmotor,imslip,imtorque,syncpower,vcurve,starting,motorpick,dictionary,selfcheck].forEach(function(f){f();});
}

/* ---------- 7. Node 匯出 ---------- */
if(typeof module!=="undefined"){
  module.exports={linmachCalc:linmachCalc,corefluxCalc:corefluxCalc,referralCalc:referralCalc,xftestCalc:xftestCalc,xfregCalc:xfregCalc,powerflowCalc:powerflowCalc,dcmotorCalc:dcmotorCalc,imslipCalc:imslipCalc,imtorqueCalc:imtorqueCalc,syncpowerCalc:syncpowerCalc,vcurveCalc:vcurveCalc,startingCalc:startingCalc,motorpickCalc:motorpickCalc,num6:num6,SCORE:SCORE,PRESET:PRESET,QUIZ:QUIZ};
}

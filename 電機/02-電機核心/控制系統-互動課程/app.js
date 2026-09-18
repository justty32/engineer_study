"use strict";
/* 控制系統（零基礎互動課）——全站互動邏輯 */

/* ---------- 1. helper ---------- */
var $ = function (id) {
  if (typeof document === "undefined") { return null; }
  return document.getElementById(id);
};
var bind = function (ids, f) { ids.forEach(function (x) { var n = $(x); if (n) { n.addEventListener("input", f); } }); };
var val = function (id) { var n = $(id); return n ? Number(n.value) : 0; };
var pick = function (id) { var n = $(id); return n ? n.value : ""; };
var minus = function (s) { return String(s).replace(/^-/, "−"); };
var num6 = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  if (Math.abs(v) < 5e-13) { v = 0; }
  return minus(v.toFixed(6));
};
var int0 = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  if (Math.abs(v) < 0.5) { v = 0; }
  return minus(String(Math.round(v)));
};
var sci = function (x) {
  var v = Number(x), p;
  if (!isFinite(v)) { return "不適用"; }
  if (v === 0) { return "0 × 10<sup>0</sup>"; }
  p = v.toExponential(6).split("e");
  return minus(p[0]) + " × 10<sup>" + minus(String(Number(p[1]))) + "</sup>";
};
var deg = function (x) { return num6(x) + "°"; };
var esc = function (s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
var put = function (id, html) { var n = $(id); if (n) { n.innerHTML = html; } };
var row = function (cells, th) {
  var t = th ? "th" : "td";
  return "<tr><" + t + ">" + cells.join("</" + t + "><" + t + ">") + "</" + t + "></tr>";
};
var finiteOrZero = function (x) { var v = Number(x); return isFinite(v) ? v : 0; };
var fmtRouth = function (x) {
  if (Math.abs(x - 1e-6) < 1e-15) { return "ε"; }
  return (Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-4)) ? sci(x) : num6(x);
};
var log10 = function (x) { return Math.log(x) / Math.LN10; };

/* ---------- 2. 常數 ---------- */
var L0 = { K: 10, t1: 0.1, t2: 0.01 };
var PID_PLANT = [6, 11, 6];
var PID_PRESET = { p: [10, 0, 0], pi: [10, 5, 0], zn: [36, 38, 8.5] };
var SS_PRESET = {
  motor: [0, 1, -2, -3, 0, 1, 1, 0],
  unctrl: [-1, 0, 0, -2, 1, 0, 1, 1],
  unobs: [-1, 0, 0, -2, 1, 1, 1, 0],
  unstable: [0, 1, 2, 1, 0, 1, 1, 0],
  osc: [0, 1, -4, 0, 0, 1, 1, 0]
};
var QUIZ_CH = {
  "00": ["00-回授的價值.html", "00 回授的價值"],
  "01": ["01-建模從微分方程到轉移函數.html", "01 建模：從微分方程到轉移函數"],
  "02": ["02-方塊圖化簡與閉迴路轉移函數.html", "02 方塊圖化簡與閉迴路轉移函數"],
  "03": ["03-穩態誤差與系統型式.html", "03 穩態誤差與系統型式"],
  "04": ["04-二階閉迴路與極點位置.html", "04 二階閉迴路與極點位置"],
  "05": ["05-Routh穩定度判別.html", "05 Routh 穩定度判別"],
  "06": ["06-根軌跡.html", "06 根軌跡"],
  "07": ["07-頻率響應與波德圖.html", "07 頻率響應與對數頻率圖"],
  "08": ["08-增益裕度相位裕度與奈奎斯特.html", "08 增益裕度、相位裕度與奈奎斯特"],
  "09": ["09-PID控制器設計.html", "09 PID 控制器設計"],
  "10": ["10-領先落後補償器.html", "10 領先與落後補償器"],
  "11": ["11-狀態空間入門.html", "11 狀態空間入門"]
};
var QUIZ = [
  {id:"q00-1",t:"num",ans:0.993388,tol:0.001,why:"y ＝ 120 / 121 ＋ 0.2 / 121 ＝ 0.993388。",err:"常見錯因：忘了干擾也要除以 1 ＋ L。"},
  {id:"q00-2",t:"num",ans:0.008264,tol:0.0001,why:"S ＝ 1 / (1 ＋ 120) ＝ 0.008264。",err:"常見錯因：算成 1 / L 而不是 1 / (1 ＋ L)。"},
  {id:"q00-3",t:"sel",ans:"a",why:"模型準且沒有干擾時，開迴路誤差為零。",err:"常見錯因：以為回授永遠更準。"},
  {id:"q01-1",t:"num",ans:0.0999,tol:0.0005,why:"τ ＝ JR / (bR ＋ K_tK_e) ＝ 0.01 / 0.1001 ＝ 0.099900 s。",err:"常見錯因：忘了分母的 K_tK_e 項或算成 J / b。"},
  {id:"q01-2",t:"num",ans:1.198801,tol:0.005,why:"穩態轉速 ＝ 12 × 0.01 / 0.1001 ＝ 1.198801 rad/s。",err:"常見錯因：忘了乘電壓。"},
  {id:"q01-3",t:"sel",ans:"a",why:"J 只出現在 τ 的分子，不在直流增益裡。",err:"常見錯因：以為慣性會改變穩態。"},
  {id:"q02-1",t:"num",ans:-42,tol:0.5,why:"極點 ＝ −(1 ＋ 10 × 2 × 1) / 0.5 ＝ −42。",err:"常見錯因：忘了分母裡的 1，或忘了除以 τ。"},
  {id:"q02-2",t:"num",ans:0.952381,tol:0.001,why:"T(0) ＝ 20 / 21 ＝ 0.952381。",err:"常見錯因：把分母的 1 漏掉。"},
  {id:"q02-3",t:"sel",ans:"a",why:"比例控制器需要非零誤差才能維持非零控制量。",err:"常見錯因：把穩態誤差歸咎於動態。"},
  {id:"q03-1",t:"num",ans:0.2,tol:0.005,why:"K_v ＝ K / a ＝ 5，所以斜坡誤差 ＝ 1 / K_v ＝ 0.2。",err:"常見錯因：算成 1 / K。"},
  {id:"q03-2",t:"num",ans:0.166667,tol:0.001,why:"K_pos ＝ K / a ＝ 5，步階誤差 ＝ 1 / 6 ＝ 0.166667。",err:"常見錯因：算成 1 / K_pos。"},
  {id:"q03-3",t:"sel",ans:"a",why:"型式 2 對拋物線命令留下有限常數 1 / K_a。",err:"常見錯因：把型式數與命令階數對錯。"},
  {id:"q04-1",t:"num",ans:0.6,tol:0.005,why:"ζ ＝ a / (2√K) ＝ 6 / 10 ＝ 0.6。",err:"常見錯因：忘了分母的 2。"},
  {id:"q04-2",t:"num",ans:9.478022,tol:0.05,why:"M_p ＝ e<sup>−π × 0.6 / 0.8</sup> × 100 ＝ 9.478022 %。",err:"常見錯因：把 ζ 與 √(1 − ζ²) 放反。"},
  {id:"q04-3",t:"sel",ans:"a",why:"極點實部 −a / 2 與 K 無關，所以整定時間不變。",err:"常見錯因：以為加 K 一定會縮短整定。"},
  {id:"q05-1",t:"num",ans:-6,tol:0.01,why:"依 Routh 交叉相乘，s¹ 列首元是 −6。",err:"常見錯因：交叉相乘的順序反了。"},
  {id:"q05-2",t:"num",ans:9,tol:0.01,why:"三階穩定條件是 3 × 3 ＞ K，所以 K 上限是 9。",err:"常見錯因：算成係數相加。"},
  {id:"q05-3",t:"sel",ans:"a",why:"全零列表示有對稱於原點的根，常見情形是一對純虛根。",err:"常見錯因：把全零列當成計算錯誤。"},
  {id:"q06-1",t:"num",ans:48,tol:0.01,why:"K_crit ＝ ab(a ＋ b) ＝ 2 × 4 × 6 ＝ 48。",err:"常見錯因：只算 ab。"},
  {id:"q06-2",t:"num",ans:-2,tol:0.01,why:"重心 ＝ −(0 ＋ 2 ＋ 4) / 3 ＝ −2。",err:"常見錯因：忘了除以極點數減零點數。"},
  {id:"q06-3",t:"sel",ans:"a",why:"分離點是兩個實根相遇並離開實軸的位置。",err:"常見錯因：把分離點與虛軸穿越混為一談。"},
  {id:"q07-1",t:"num",ans:-3.053514,tol:0.01,why:"將 ω ＝ 10 代入精確振幅式，再取 20 log10 得 −3.053514 dB。",err:"常見錯因：用了漸近線的 0 dB。"},
  {id:"q07-2",t:"num",ans:-140.710593,tol:0.05,why:"相位 ＝ −90° − arctan(1) − arctan(0.1) ＝ −140.710593°。",err:"常見錯因：漏掉積分器或第二個極點。"},
  {id:"q07-3",t:"sel",ans:"a",why:"每個一階極點最終多帶來 −20 dB/十倍頻與 −90°。",err:"常見錯因：與轉角處的 −3 dB 混淆。"},
  {id:"q08-1",t:"num",ans:31.622777,tol:0.01,why:"ω_pc ＝ 1 / √(0.1 × 0.01) ＝ 31.622777 rad/s。",err:"常見錯因：算成 1 / (τ_1 ＋ τ_2)。"},
  {id:"q08-2",t:"num",ans:20.827854,tol:0.05,why:"相位交越處振幅為 0.090909，GM ＝ −20 log10(0.090909) ＝ 20.827854 dB。",err:"常見錯因：忘了負號或用了自然對數。"},
  {id:"q08-3",t:"sel",ans:"a",why:"本課的相位裕度設計目標是 45° 到 60°。",err:"常見錯因：把增益裕度的範圍記成相位裕度。"},
  {id:"q09-1",t:"num",ans:60,tol:0.01,why:"臨界條件 6 × 11 ＝ 6 ＋ K_p，得 K_u ＝ 60。",err:"常見錯因：忘了減掉常數項 6。"},
  {id:"q09-2",t:"num",ans:1.894452,tol:0.005,why:"ω_u ＝ √11，T_u ＝ 2π / √11 ＝ 1.894452 s。",err:"常見錯因：用了 ω_u 卻沒換成週期。"},
  {id:"q09-3",t:"sel",ans:"a",why:"積分消除步階穩態誤差，但多帶來 −90° 相位。",err:"常見錯因：把積分與微分的角色對調。"},
  {id:"q10-1",t:"num",ans:36.869898,tol:0.05,why:"φ_max ＝ asin((4 − 1) / (4 ＋ 1)) ＝ 36.869898°。",err:"常見錯因：算成 arctan。"},
  {id:"q10-2",t:"num",ans:50,tol:0.01,why:"K_v ＝ 10β ＝ 50。",err:"常見錯因：以為落後補償不改 K_v。"},
  {id:"q10-3",t:"sel",ans:"a",why:"領先主要加相位，落後主要加低頻增益，角色不同。",err:"常見錯因：以為兩者可以互換。"},
  {id:"q11-1",t:"num",ans:-1,tol:0.01,why:"M_c ＝ [[0, 1], [1, −3]]，行列式為 −1。",err:"常見錯因：AB 算錯。"},
  {id:"q11-2",t:"num",ans:48,tol:0.01,why:"Ackermann 公式得到 K ＝ [48, 7]。",err:"常見錯因：忘了減掉開迴路的常數係數 2。"},
  {id:"q11-3",t:"sel",ans:"a",why:"det M_c ＝ 0 表示 B 與 AB 共線，輸入推不動某個方向。",err:"常見錯因：把可控性與穩定度混為一談。"}
];

/* ---------- 3. 純函式演算法 ---------- */
function routhTable(coefs) {
  var c = coefs.slice(), n = c.length - 1, w, rows, notes = [], aux = [], i, j;
  if (c[0] === 0) { return { error: "leading-zero", rows: [], first: [], changes: 0, notes: notes, aux: aux }; }
  var allNeg = true;
  for (i = 0; i < c.length; i += 1) { if (!(c[i] < 0)) { allNeg = false; } }
  if (allNeg) {
    for (i = 0; i < c.length; i += 1) { c[i] = -c[i]; }
    notes.push("已同乘 −1");
  }
  w = Math.ceil((n + 1) / 2);
  rows = [[], []];
  for (i = 0; i <= n; i += 1) { rows[i % 2].push(c[i]); }
  while (rows[0].length < w) { rows[0].push(0); }
  while (rows[1].length < w) { rows[1].push(0); }
  for (i = 2; i <= n; i += 1) {
    var prev2 = rows[i - 2], prev1 = rows[i - 1], allZero = true;
    for (j = 0; j < w; j += 1) { if (Math.abs(prev1[j]) >= 1e-12) { allZero = false; } }
    if (allZero) {
      var power = n - (i - 2), derivative = [], pw;
      for (j = 0; j < prev2.length; j += 1) {
        pw = power - 2 * j;
        if (pw > 0) { derivative.push(prev2[j] * pw); }
      }
      while (derivative.length < w) { derivative.push(0); }
      prev1 = derivative;
      rows[i - 1] = prev1;
      notes.push("s^" + String(n - (i - 1)) + " 列全零，改用 s^" + String(power) + " 列輔助多項式的導數");
      aux.push({ power: power, coefs: prev2.slice() });
    }
    if (Math.abs(prev1[0]) < 1e-12) {
      prev1[0] = 1e-6;
      rows[i - 1] = prev1;
      notes.push("s^" + String(n - (i - 1)) + " 列首元為 0，以 ε ＝ 10^−6 代入");
    }
    var next = [], a, b;
    for (j = 0; j <= w - 2; j += 1) {
      a = prev2[j + 1] || 0;
      b = prev1[j + 1] || 0;
      next.push((prev1[0] * a - prev2[0] * b) / prev1[0]);
    }
    next.push(0);
    rows.push(next);
  }
  var first = [], changes = 0;
  for (i = 0; i < rows.length; i += 1) { first.push(rows[i][0]); }
  for (i = 1; i < first.length; i += 1) {
    if ((first[i - 1] < 0) !== (first[i] < 0)) { changes += 1; }
  }
  return { rows: rows, first: first, changes: changes, notes: notes, aux: aux };
}

function cubicRoots(b, c, d) {
  var s = -b - 1, i, f, fp;
  for (i = 0; i < 80; i += 1) {
    f = s * s * s + b * s * s + c * s + d;
    fp = 3 * s * s + 2 * b * s + c;
    if (fp === 0) { break; }
    s = s - f / fp;
  }
  var r1 = s, p = b + r1, q = c + b * r1 + r1 * r1, disc = p * p - 4 * q;
  if (disc >= 0) {
    return [{ re: r1, im: 0 }, { re: (-p + Math.sqrt(disc)) / 2, im: 0 }, { re: (-p - Math.sqrt(disc)) / 2, im: 0 }];
  }
  return [{ re: r1, im: 0 }, { re: -p / 2, im: Math.sqrt(-disc) / 2 }, { re: -p / 2, im: -Math.sqrt(-disc) / 2 }];
}

function lmag(K, t1, t2, w) {
  var den = w * Math.sqrt(1 + (w * t1) * (w * t1)) * Math.sqrt(1 + (w * t2) * (w * t2));
  return den === 0 ? 0 : K / den;
}
function lphase(t1, t2, w) {
  return -90 - Math.atan(w * t1) * 180 / Math.PI - Math.atan(w * t2) * 180 / Math.PI;
}
function bisectGain(magFn) {
  var lo = 1e-3, hi = 1e5, mid, i;
  for (i = 0; i < 100; i += 1) { mid = Math.sqrt(lo * hi); if (magFn(mid) > 1) { lo = mid; } else { hi = mid; } }
  return Math.sqrt(lo * hi);
}
function bisectPhase(phFn) {
  var lo = 1e-2, hi = 1e5, mid, i;
  for (i = 0; i < 100; i += 1) { mid = Math.sqrt(lo * hi); if (phFn(mid) > -180) { lo = mid; } else { hi = mid; } }
  return Math.sqrt(lo * hi);
}

function pidSim(Kp, Ki, Kd) {
  var h = 0.001, n = 10000, x = [0, 0, 0, 0], ys = [0], i, j;
  var f = function (v) {
    var u = Kp * (1 - v[0]) + Ki * v[3] - Kd * v[1];
    return [v[1], v[2], u - PID_PLANT[0] * v[2] - PID_PLANT[1] * v[1] - PID_PLANT[2] * v[0], 1 - v[0]];
  };
  var add = function (v, k, scale) { return [v[0] + scale * k[0], v[1] + scale * k[1], v[2] + scale * k[2], v[3] + scale * k[3]]; };
  for (i = 0; i < n; i += 1) {
    var k1 = f(x), k2 = f(add(x, k1, h / 2)), k3 = f(add(x, k2, h / 2)), k4 = f(add(x, k3, h));
    for (j = 0; j < 4; j += 1) { x[j] += h * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]) / 6; }
    if (!isFinite(x[0]) || Math.abs(x[0]) > 100) { return { diverged: true }; }
    ys.push(x[0]);
  }
  var peak = ys[0], ip = 0, i10 = -1, i90 = -1, last = -1, iae = 0;
  for (i = 0; i <= n; i += 1) {
    if (ys[i] > peak) { peak = ys[i]; ip = i; }
    if (i10 < 0 && ys[i] >= 0.1) { i10 = i; }
    if (i90 < 0 && ys[i] >= 0.9) { i90 = i; }
    if (Math.abs(ys[i] - 1) > 0.02) { last = i; }
    iae += Math.abs(1 - ys[i]) * h;
  }
  return {
    diverged: false, peak: peak, Mp: Math.max(0, (peak - 1) * 100), tp: ip * h,
    tr: (i10 < 0 || i90 < 0) ? null : (i90 - i10) * h,
    ts: last < 0 ? 0 : last * h, notSettled: last === n,
    yfin: ys[n], ess: 1 - ys[n], iae: iae
  };
}

function stateSpace(A, B, C, d1, d0) {
  var a11 = A[0], a12 = A[1], a21 = A[2], a22 = A[3], b1 = B[0], b2 = B[1], c1 = C[0], c2 = C[1];
  var tr = a11 + a22, det = a11 * a22 - a12 * a21;
  var eig2 = function (M) {
    var t = M[0] + M[3], de = M[0] * M[3] - M[1] * M[2], di = t * t / 4 - de;
    if (di >= 0) { return [{ re: t / 2 + Math.sqrt(di), im: 0 }, { re: t / 2 - Math.sqrt(di), im: 0 }]; }
    return [{ re: t / 2, im: Math.sqrt(-di) }, { re: t / 2, im: -Math.sqrt(-di) }];
  };
  var Mc = [b1, a11 * b1 + a12 * b2, b2, a21 * b1 + a22 * b2];
  var detMc = Mc[0] * Mc[3] - Mc[1] * Mc[2];
  var Mo = [c1, c2, c1 * a11 + c2 * a21, c1 * a12 + c2 * a22];
  var detMo = Mo[0] * Mo[3] - Mo[1] * Mo[2];
  var out = { tr: tr, det: det, eig: eig2(A), Mc: Mc, detMc: detMc, Mo: Mo, detMo: detMo, K: null, eigCl: null, phi: null, Acl: null };
  if (Math.abs(detMc) >= 1e-9) {
    var A2 = [a11 * a11 + a12 * a21, a11 * a12 + a12 * a22, a21 * a11 + a22 * a21, a21 * a12 + a22 * a22];
    var phi = [A2[0] + d1 * a11 + d0, A2[1] + d1 * a12, A2[2] + d1 * a21, A2[3] + d1 * a22 + d0];
    var row0 = -Mc[2] / detMc, row1 = Mc[0] / detMc;
    var K = [row0 * phi[0] + row1 * phi[2], row0 * phi[1] + row1 * phi[3]];
    var Acl = [a11 - b1 * K[0], a12 - b1 * K[1], a21 - b2 * K[0], a22 - b2 * K[1]];
    out.K = K; out.phi = phi; out.Acl = Acl; out.eigCl = eig2(Acl);
  }
  return out;
}

/* ---------- 4. 十二章 widget ---------- */
function loop() {
  if (!$("lp-k")) { return; }
  var ids = ["lp-k", "lp-drift", "lp-d"];
  var draw = function () {
    var K = val("lp-k"), drift = val("lp-drift"), d = val("lp-d");
    var G = 2 * (1 + drift / 100), yOpen = 0.5 * G + d, eOpen = 1 - yOpen, L = K * G, S = 1 / (1 + L);
    var yCl = L / (1 + L) + d / (1 + L), eCl = 1 - yCl, ratio = Math.abs(eCl) > 1e-12 ? Math.abs(eOpen) / Math.abs(eCl) : null;
    var h = "<table>" + row(["量", "結果"], true) + row(["實際受控體增益 G", num6(G)]) + row(["開迴路輸出", num6(yOpen)])
      + row(["開迴路誤差", num6(eOpen)]) + row(["迴路增益 L", num6(L)]) + row(["靈敏度 S", num6(S)])
      + row(["閉迴路輸出", num6(yCl)]) + row(["閉迴路誤差", num6(eCl)]) + row(["誤差縮小倍數", ratio === null ? "不適用" : num6(ratio) + " 倍"]) + "</table>";
    h += Math.abs(eCl) < Math.abs(eOpen) ? "<p><strong>判讀：閉迴路贏，誤差縮小 " + num6(ratio) + " 倍</strong></p>" : "<p><strong>判讀：這個設定下開迴路反而更準——模型準、沒有干擾時，回授的 1 / (1 ＋ L) 誤差是純粹的代價</strong></p>";
    h += "<p>為什麼：閉迴路把漂移與干擾都乘上 S ＝ 1 / (1 ＋ L)，L 越大 S 越小；開迴路對漂移與干擾的靈敏度是 1，怎麼調都不變。</p>";
    if (drift === -50) { h += "<p>邊界提醒：受控體增益只剩一半，開迴路輸出掉到 0.5 ＋ d，閉迴路靠 L 撐住。</p>"; }
    if (K === 1) { h += "<p>邊界提醒：L 太小，S 接近 1 / 3，回授幾乎沒有幫助。</p>"; }
    if (K === 200) { h += "<p>邊界提醒：S 已小於 0.5 %，但這是靜態模型；真實受控體有慣性，K ＝ 200 多半已經不穩定。</p>"; }
    put("loop-output", h);
  };
  bind(ids, draw); draw();
}

function model() {
  if (!$("md-j")) { return; }
  var ids = ["md-j", "md-b", "md-r", "md-kt", "md-v", "md-t"];
  var draw = function () {
    var J = val("md-j"), b = val("md-b"), R = val("md-r"), kt = val("md-kt"), V = val("md-v"), t = val("md-t");
    var D = b * R + kt * kt, K = D !== 0 ? kt / D : 0, tau = D !== 0 ? J * R / D : 0;
    var pole = tau !== 0 ? -1 / tau : 0, yss = K * V, y = tau > 0 ? yss * (1 - Math.exp(-t / tau)) : 0, ts = 4 * tau, y63 = yss * (1 - Math.exp(-1));
    var h = "<table>" + row(["量", "結果"], true) + row(["D", num6(D)]) + row(["增益 K", num6(K)]) + row(["時間常數 τ", num6(tau) + " s"])
      + row(["極點", num6(pole)]) + row(["穩態轉速", num6(yss) + " rad/s"]) + row(["目前轉速", num6(y) + " rad/s"])
      + row(["2 % 整定時間", num6(ts) + " s"]) + row(["y(τ)", num6(y63) + " rad/s"]) + "</table>";
    if (t < tau) { h += "<p><strong>判讀：還在上升段，只到穩態的 " + num6(yss !== 0 ? y / yss * 100 : 0) + " %</strong></p>"; }
    else if (t < ts) { h += "<p><strong>判讀：已過 63.2 % 但還沒進 2 % 帶</strong></p>"; }
    else { h += "<p><strong>判讀：已進入 2 % 帶，可視為穩態</strong></p>"; }
    h += "<p>為什麼：一階系統只有一個極點 −1 / τ，響應就是一條指數曲線，τ 由 JR / (bR ＋ K_tK_e) 決定，與電壓無關。</p>";
    if (t === 0) { h += "<p>邊界提醒：t ＝ 0 時 y 必為 " + num6(0) + "，慣性讓轉速不能跳變。</p>"; }
    if (J === 0.05) { h += "<p>邊界提醒：τ 拉長五倍、穩態不變；慣性只改快慢。</p>"; }
    if (b === 0.02) { h += "<p>邊界提醒：增益與 τ 同時放大；阻尼同時決定跑多快與跑多高。</p>"; }
    if (R === 5) { h += "<p>邊界提醒：τ 幾乎不變但增益掉五倍；電阻只吃增益。</p>"; }
    if (kt === 0.1) { h += "<p>邊界提醒：反電動勢回授變強，τ 縮短、增益上升。</p>"; }
    put("model-output", h);
  };
  bind(ids, draw); draw();
}

function block() {
  if (!$("bk-config")) { return; }
  var ids = ["bk-config", "bk-kc", "bk-k", "bk-tau", "bk-h"];
  var draw = function () {
    var mode = pick("bk-config"), kc = val("bk-kc"), k = val("bk-k"), tau = val("bk-tau"), hs = val("bk-h"), KK = kc * k;
    var feedback = mode === "feedback", den = feedback ? 1 + KK * hs : 1, pole = tau !== 0 ? -den / tau : 0;
    var tauCl = tau / den, T0 = feedback ? KK / den : KK, ideal = feedback && hs !== 0 ? 1 / hs : null, ess = feedback ? ideal - T0 : null;
    var h = "<p>這個模式只用到 " + (feedback ? "K_c、K、τ、H。" : "K_c、K、τ；H 不影響結果。") + "</p><table>"
      + row(["量", "結果"], true) + row(["前向增益 K_cK", num6(KK)]) + row(["分母係數", num6(den)]) + row(["極點", num6(pole)])
      + row(["時間常數", num6(tauCl) + " s"]) + row(["直流增益", num6(T0)]) + row(["理想直流增益", ideal === null ? "不適用" : num6(ideal)])
      + row(["穩態誤差", ess === null ? "不適用" : num6(ess)]) + row(["加速倍數", feedback ? num6(den) + " 倍" : "不適用"]) + "</table>";
    if (feedback) {
      h += "<p>特徵方程式：τs ＋ 1 ＋ K_cKh ＝ 0。</p>";
      h += den >= 10 ? "<p><strong>判讀：迴路增益夠大，極點搬到 " + num6(pole) + "，比開迴路快 " + num6(den) + " 倍，但直流增益停在 " + num6(T0) + "，離理想 1 / H 差 " + num6(ess) + "</strong></p>" : "<p><strong>判讀：迴路增益偏低，穩態誤差 " + num6(ess) + " 太大，比例控制單獨撐不住</strong></p>";
    } else { h += "<p><strong>判讀：沒有回授，極點就是受控體自己的 −1 / τ，控制器只放大</strong></p>"; }
    h += "<p>為什麼：特徵方程式 1 ＋ L(s) ＝ 0 的根就是閉迴路極點，L 每加 1，根就往左多搬 1 / τ；比例控制器要有誤差才有輸出，所以 T(0) 永遠追不到 1 / H。</p>";
    if (kc === 0.5 && k === 0.5) { h += "<p>邊界提醒：迴路增益 0.25，回授幾乎沒有作用。</p>"; }
    if (hs === 2) { h += "<p>邊界提醒：感測器增益 2 讓系統追的是 r / 2，不是 r；H 不只改快慢，還改目標。</p>"; }
    if (kc === 50 && k === 5) { h += "<p>邊界提醒：極點已在 −1260 以外，真實受控體的第二個極點會先影響結果。</p>"; }
    put("block-output", h);
  };
  bind(ids, draw); draw();
}

function sserr() {
  if (!$("se-type")) { return; }
  var ids = ["se-type", "se-input", "se-k", "se-a"];
  var draw = function () {
    var type = pick("se-type"), input = pick("se-input"), K = val("se-k"), a = val("se-a");
    var inf = "∞（無限大）", Kpos, Kv, Ka, errs, stable = type !== "2" || a > 1, formula;
    if (type === "0") { Kpos = a !== 0 ? K / a : 0; Kv = 0; Ka = 0; errs = [1 / (1 + Kpos), Infinity, Infinity]; formula = "L(s) ＝ K / (s ＋ a)"; }
    else if (type === "1") { Kpos = Infinity; Kv = a !== 0 ? K / a : 0; Ka = 0; errs = [0, Kv !== 0 ? 1 / Kv : Infinity, Infinity]; formula = "L(s) ＝ K / (s(s ＋ a))"; }
    else { Kpos = Infinity; Kv = Infinity; Ka = a !== 0 ? K / a : 0; errs = [0, 0, Ka !== 0 ? 1 / Ka : Infinity]; formula = "L(s) ＝ K(s ＋ 1) / (s²(s ＋ a))"; }
    var idx = input === "step" ? 0 : input === "ramp" ? 1 : 2, names = ["步階命令", "斜坡命令", "拋物線命令"];
    var show = function (x) { return x === Infinity ? inf : num6(x); };
    var h = "<p>這個模式的 L(s) 是 " + formula + "。</p><table>" + row(["量", "結果"], true)
      + row(["K_pos", show(Kpos)]) + row(["K_v", show(Kv)]) + row(["K_a", show(Ka)]);
    var i;
    for (i = 0; i < 3; i += 1) { h += row([names[i], i === idx ? "<strong>" + show(errs[i]) + "</strong>" : show(errs[i])]); }
    h += row(["目前 e_ss", stable ? show(errs[idx]) : "不適用"]) + row(["閉迴路", stable ? "穩定" : "不穩定"]) + "</table>";
    if (!stable) { h += "<p><strong>判讀：閉迴路不穩定，終值定理不成立，穩態誤差不適用——先讓系統穩定再談誤差</strong></p>"; }
    else if (errs[idx] === 0) { h += "<p><strong>判讀：這種命令被積分器吃掉了，零穩態誤差</strong></p>"; }
    else if (errs[idx] === Infinity) { h += "<p><strong>判讀：命令比積分器能追的次數還高一階，誤差線性發散</strong></p>"; }
    else { h += "<p><strong>判讀：穩態誤差 " + num6(errs[idx]) + "，要再縮小只能加大 K 或提高型式，前者會動到穩定度</strong></p>"; }
    h += "<p>為什麼：e ＝ r / (1 ＋ L)，s → 0 時 L 有幾個 1 / s，就能把命令的幾階次消掉。</p>";
    if (type === "2" && a === 0.5) { h += "<p>邊界提醒：a ＝ 0.5 時閉迴路不穩定，不能套用終值定理。</p>"; }
    if (K === 100) { h += "<p>邊界提醒：K 已到 100，型式 1 的斜坡誤差只剩 " + num6(a / K) + "，但阻尼也會下降。</p>"; }
    if (type === "0" && a === 10) { h += "<p>邊界提醒：K_pos ＝ K / a 變小，步階誤差反而變大；極點離原點越遠，低頻增益越小。</p>"; }
    put("sserr-output", h);
  };
  bind(ids, draw); draw();
}

function second() {
  if (!$("so-k")) { return; }
  var ids = ["so-k", "so-a", "so-p", "so-t"];
  var draw = function () {
    var K = val("so-k"), a = val("so-a"), p = val("so-p"), t = val("so-t"), wn = Math.sqrt(Math.max(0, K));
    var zeta = wn !== 0 ? a / (2 * wn) : 0, ess = K !== 0 ? a / K : 0, ratio = zeta * wn !== 0 ? p / (zeta * wn) : 0;
    var kind, wd = null, Mp = 0, tp = null, ts, y, s1 = null, s2 = null, root;
    if (zeta < 1 - 1e-12) {
      kind = "欠阻尼"; root = Math.sqrt(Math.max(0, 1 - zeta * zeta)); wd = wn * root;
      Mp = Math.exp(-Math.PI * zeta / root) * 100; tp = wd !== 0 ? Math.PI / wd : null; ts = zeta * wn !== 0 ? 4 / (zeta * wn) : 0;
      y = 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + zeta / root * Math.sin(wd * t));
    } else if (Math.abs(zeta - 1) <= 1e-12) {
      kind = "臨界阻尼"; ts = wn !== 0 ? 4 / wn : 0; y = 1 - (1 + wn * t) * Math.exp(-wn * t);
    } else {
      kind = "過阻尼"; root = Math.sqrt(zeta * zeta - 1); s1 = -zeta * wn + wn * root; s2 = -zeta * wn - wn * root;
      ts = s1 !== 0 ? 4 / (-s1) : 0; y = s2 !== s1 ? 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1) : 0;
    }
    var tr = wn !== 0 ? 1.8 / wn : 0;
    var h = "<table>" + row(["量", "結果"], true) + row(["自然頻率 ω_n", num6(wn)]) + row(["阻尼比 ζ", num6(zeta)]) + row(["阻尼類型", kind])
      + row(["阻尼振盪頻率 ω_d", wd === null ? "不適用" : num6(wd)]) + row(["超越量", num6(Mp) + " %"])
      + row(["峰值時刻", tp === null ? "不適用" : num6(tp) + " s"]) + row(["整定時間", num6(ts) + " s"])
      + row(["上升時間粗估", num6(tr) + " s"]) + row(["穩態誤差", num6(ess)]) + row(["y(t)", num6(y)]) + row(["第三極點比", num6(ratio)]) + "</table>";
    if (zeta >= 1) { h += "<p><strong>判讀：不振盪，慢極點 " + num6(s1 === null ? -wn : s1) + " 主導，整定 " + num6(ts) + " s</strong></p>"; }
    else if (zeta < 0.4) { h += "<p><strong>判讀：ζ 太小，超越量 " + num6(Mp) + " %，K 太大了</strong></p>"; }
    else if (zeta <= 0.8) { h += "<p><strong>判讀：ζ 在設計帶 0.4–0.8 內，超越量 " + num6(Mp) + " % 可接受</strong></p>"; }
    else { h += "<p><strong>判讀：幾乎不超越，但斜坡誤差 " + num6(ess) + " 偏大</strong></p>"; }
    if (ratio < 5) { h += "<p>第三極點太近（比值 " + num6(ratio) + "），二階近似不可信，指標只當參考。</p>"; }
    h += "<p>為什麼：ω_n ＝ √K、ζ ＝ a / (2√K)，K 同時推高 ω_n 與壓低 ζ；實部 −a / 2 與 K 無關，所以整定時間不動。</p>";
    if (t === 0) { h += "<p>邊界提醒：y(0) ＝ " + num6(0) + "。</p>"; }
    if (K === 200 && a === 1) { h += "<p>邊界提醒：ζ 接近 0.035，超越量接近 90 %，這已經是振盪器。</p>"; }
    if (Math.abs(zeta - 1) <= 1e-12) { h += "<p>邊界提醒：臨界阻尼是不振盪裡最快的一種。</p>"; }
    if (p === 5) { h += "<p>邊界提醒：第三極點太近，二階近似要特別小心。</p>"; }
    put("second-output", h);
  };
  bind(ids, draw); draw();
}

function routh() {
  if (!$("rh-order")) { return; }
  var ids = ["rh-order", "rh-a4", "rh-a3", "rh-a2", "rh-a1", "rh-a0"];
  var draw = function () {
    var order = pick("rh-order"), allIds = order === "4" ? ["rh-a4", "rh-a3", "rh-a2", "rh-a1", "rh-a0"] : ["rh-a3", "rh-a2", "rh-a1", "rh-a0"];
    var coefs = [], blank = false, i, j;
    for (i = 0; i < allIds.length; i += 1) { if (pick(allIds[i]) === "") { blank = true; } coefs.push(finiteOrZero(pick(allIds[i]))); }
    var h = "<p>這個模式用到 " + (order === "4" ? "a4、a3、a2、a1、a0。" : "a3、a2、a1、a0；a4 不影響結果。") + "</p>";
    var result = routhTable(coefs);
    if (result.error) {
      h += "<table>" + row(["係數", "結果"], true) + row(["最高次係數", num6(coefs[0])]) + "</table><p><strong>判讀：最高次係數不能是 0，請填一個非零數</strong></p>";
      if (blank) { h += "<p>邊界提醒：清空的欄位視為 0。</p>"; }
      h += "<p>為什麼：最高次係數為 0 時，多項式的實際階數已經改變，必須先修正輸入。</p>";
      put("routh-output", h); return;
    }
    h += "<table>" + row(["次方", "第 1 欄", "第 2 欄", "第 3 欄"], true);
    for (i = 0; i < result.rows.length; i += 1) {
      var cells = ["s<sup>" + int0(coefs.length - 1 - i) + "</sup>"];
      for (j = 0; j < result.rows[i].length; j += 1) { cells.push(fmtRouth(result.rows[i][j])); }
      while (cells.length < 4) { cells.push(num6(0)); }
      h += row(cells);
    }
    h += row(["第一欄", result.first.map(fmtRouth).join("、"), "符號變化", int0(result.changes)]) + "</table>";
    if (result.changes === 0 && result.aux.length === 0) { h += "<p><strong>判讀：第一欄全同號，0 個右半平面極點，穩定</strong></p>"; }
    else if (result.changes > 0) { h += "<p><strong>判讀：第一欄符號變化 " + int0(result.changes) + " 次 → " + int0(result.changes) + " 個右半平面極點，不穩定</strong></p>"; }
    else { h += "<p><strong>判讀：第一欄沒有符號變化，但全零列表示系統至多臨界穩定</strong></p>"; }
    var necessary = false;
    for (i = 1; i < coefs.length; i += 1) { if (coefs[0] > 0 && coefs[i] <= 0) { necessary = true; } }
    if (necessary) { h += "<p>必要條件已失敗：係數不全同號或有缺項。</p>"; }
    for (i = 0; i < result.notes.length; i += 1) { h += "<p>特殊情形：" + esc(result.notes[i]) + "。</p>"; }
    for (i = 0; i < result.aux.length; i += 1) {
      var ac = result.aux[i].coefs, alpha = ac[0], beta = ac[1] || 0, q = alpha !== 0 ? beta / alpha : 0;
      var roots = q > 0 ? "±j" + num6(Math.sqrt(q)) : q < 0 ? "±" + num6(Math.sqrt(-q)) : num6(0);
      h += "<p>有一列全零：存在對稱於原點的極點，輔助多項式 " + num6(alpha) + "s<sup>2</sup> ＋ " + num6(beta) + " 的根在 " + roots + "，系統至多臨界穩定。</p>";
    }
    if (blank) { h += "<p>邊界提醒：清空的欄位視為 0。</p>"; }
    h += "<p>為什麼：Routh 表把求根換成交叉相乘，第一欄的符號變化次數就是右半平面根的個數，這是定理不是經驗。</p>";
    put("routh-output", h);
  };
  bind(ids, draw); draw();
}

var rootText = function (r) {
  if (Math.abs(r.im) < 1e-10) { return num6(r.re); }
  return num6(r.re) + (r.im >= 0 ? " ＋ j" : " − j") + num6(Math.abs(r.im));
};
var eigText = function (rs) { return rs.map(rootText).join("、"); };

function rlocus() {
  if (!$("rl-a")) { return; }
  var ids = ["rl-a", "rl-b", "rl-k"];
  var draw = function () {
    var a = val("rl-a"), b = val("rl-b"), K = val("rl-k"), centroid = -(a + b) / 3, Kcrit = a * b * (a + b), wcrit = Math.sqrt(Math.max(0, a * b));
    var disc = 4 * (a + b) * (a + b) - 12 * a * b, sA = (-2 * (a + b) + Math.sqrt(Math.max(0, disc))) / 6, sB = (-2 * (a + b) - Math.sqrt(Math.max(0, disc))) / 6;
    var limit = Math.min(a, b), sb = (sA < 0 && sA > -limit) ? sA : sB, Kb = -sb * (sb + a) * (sb + b), roots = cubicRoots(a + b, a * b, K);
    var pair = null, i;
    for (i = 0; i < roots.length; i += 1) { if (Math.abs(roots[i].im) > 1e-8) { pair = roots[i]; break; } }
    var zeta = pair ? -pair.re / Math.sqrt(pair.re * pair.re + pair.im * pair.im) : null;
    var h = "<table>" + row(["量", "結果"], true) + row(["漸近線重心", num6(centroid)]) + row(["漸近角", "60°、180°、300°"])
      + row(["實軸區段", "(−∞, −max(a,b)) 與 (−min(a,b), 0)"]) + row(["分離點", num6(sb)]) + row(["分離增益", num6(Kb)])
      + row(["臨界增益", num6(Kcrit)]) + row(["臨界頻率", num6(wcrit)]) + row(["三個根", eigText(roots)])
      + row(["主導對 ζ", zeta === null ? "不適用（三個實根）" : num6(zeta)]) + "</table>";
    if (K === 0) { h += "<p><strong>判讀：K ＝ 0，根就是開迴路極點 0、−a、−b</strong></p>"; }
    else if (Math.abs(K - Kcrit) < 0.5) { h += "<p><strong>判讀：共軛對落在虛軸 ±j" + num6(wcrit) + "，臨界穩定，等幅振盪</strong></p>"; }
    else if (K < Kb) { h += "<p><strong>判讀：三個實根，還沒分離，不振盪</strong></p>"; }
    else if (K < Kcrit) { h += "<p><strong>判讀：一實根加共軛對，ζ ＝ " + num6(zeta) + "，穩定</strong></p>" + (zeta < 0.4 ? "<p>ζ 已低於設計帶。</p>" : ""); }
    else { h += "<p><strong>判讀：共軛對實部 " + num6(pair ? pair.re : 0) + " ＞ 0，不穩定</strong></p>"; }
    h += "<p>為什麼：K 只出現在特徵多項式的常數項，K 越大根越被推離開迴路極點、沿漸近線走向右半平面；三條漸近線裡有兩條指向右邊，所以三階以上的迴路遲早不穩定。</p>";
    if (K === 120) { h += "<p>邊界提醒：K 已到上限，若超過臨界增益，共軛根會進入右半平面。</p>"; }
    if (a === 5 && b === 3) { h += "<p>邊界提醒：b 小於 a，分離點改在 (−3, 0) 內選取。</p>"; }
    if (b === 10 && a === 1) { h += "<p>邊界提醒：臨界增益為 " + num6(Kcrit) + "；遠極點讓穩定範圍變大。</p>"; }
    put("rlocus-output", h);
  };
  bind(ids, draw); draw();
}

function bode() {
  if (!$("bd-k")) { return; }
  var ids = ["bd-k", "bd-t1", "bd-t2", "bd-w"];
  var draw = function () {
    var K = val("bd-k"), t1 = val("bd-t1"), t2 = val("bd-t2"), w = val("bd-w"), wc1 = t1 !== 0 ? 1 / t1 : 0, wc2 = t2 !== 0 ? 1 / t2 : 0;
    var mag = lmag(K, t1, t2, w), dB = mag > 0 ? 20 * log10(mag) : 0, phase = lphase(t1, t2, w);
    var asym = K > 0 && w > 0 ? 20 * log10(K) - 20 * log10(w) - (w > wc1 ? 20 * log10(w * t1) : 0) - (w > wc2 ? 20 * log10(w * t2) : 0) : 0;
    var slope = -20 - (w > wc1 ? 20 : 0) - (w > wc2 ? 20 : 0), err = dB - asym;
    var h = "<table>" + row(["量", "結果"], true) + row(["第一轉角", num6(wc1) + " rad/s"]) + row(["第二轉角", num6(wc2) + " rad/s"])
      + row(["精確振幅", num6(mag)]) + row(["精確 dB", num6(dB) + " dB"]) + row(["相位", deg(phase)])
      + row(["漸近線", num6(asym) + " dB"]) + row(["斜率", num6(slope) + " dB/十倍頻"]) + row(["精確減漸近", num6(err) + " dB"]) + "</table>";
    var ws = [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000], i;
    h += "<table>" + row(["ω（rad/s）", "dB", "相位"], true);
    for (i = 0; i < ws.length; i += 1) {
      var mm = lmag(K, t1, t2, ws[i]), line = [num6(ws[i]), num6(mm > 0 ? 20 * log10(mm) : 0), deg(lphase(t1, t2, ws[i]))];
      h += row(ws[i] === w ? ["<strong>" + line[0] + "</strong>", "<strong>" + line[1] + "</strong>", "<strong>" + line[2] + "</strong>"] : line);
    }
    h += "</table>";
    if ((wc1 > 0 && Math.abs(w - wc1) / wc1 < 0.05) || (wc2 > 0 && Math.abs(w - wc2) / wc2 < 0.05)) { h += "<p><strong>判讀：正在轉角頻率上，精確值比漸近線低約 3.01 dB，相位剛好走過 −45° 的一半路程</strong></p>"; }
    else if (phase <= -180) { h += "<p><strong>判讀：相位已過 −180°，這個頻率的回授是正回授；振幅還有 " + num6(dB) + " dB</strong></p>"; }
    else if (phase <= -135) { h += "<p><strong>判讀：相位剩不到 45° 就到 −180°，下一章會判斷是否夠用</strong></p>"; }
    else { h += "<p><strong>判讀：這一段斜率 " + num6(slope) + " dB/十倍頻，相位 " + deg(phase) + "</strong></p>"; }
    h += "<p>為什麼：每個極點在自己的轉角之後多吃 20 dB/十倍頻與 90° 相位，dB 與相位都是相加，所以三個極點疊起來最後會掉到 −270°。</p>";
    if (Math.abs(t1 - t2) < 1e-12) { h += "<p>邊界提醒：兩個轉角重合，該處精確值比漸近線低 6.02 dB。</p>"; }
    if (w === 1000) { h += "<p>邊界提醒：三個極點都過了，斜率為 −60 dB/十倍頻。</p>"; }
    if (K === 100) { h += "<p>邊界提醒：增益只把整條振幅線抬 20 dB，相位一格都不動。</p>"; }
    put("bode-output", h);
  };
  bind(ids, draw); draw();
}

function margin() {
  if (!$("mg-k")) { return; }
  var ids = ["mg-k", "mg-t1", "mg-t2"];
  var draw = function () {
    var K = val("mg-k"), t1 = val("mg-t1"), t2 = val("mg-t2"), prod = t1 * t2, sum = t1 + t2;
    var wpc = prod > 0 ? 1 / Math.sqrt(prod) : 0, mpc = sum !== 0 ? K * prod / sum : 0, GM = mpc > 0 ? -20 * log10(mpc) : 0;
    var Kcrit = prod !== 0 ? sum / prod : 0, wgc = bisectGain(function (w) { return lmag(K, t1, t2, w); });
    var phGc = lphase(t1, t2, wgc), PM = 180 + phGc, zetaEst = PM / 100, N = mpc >= 1 ? 2 : 0;
    var h = "<table>" + row(["量", "結果"], true) + row(["相位交越頻率", num6(wpc) + " rad/s"]) + row(["交越處振幅", num6(mpc)])
      + row(["增益裕度", num6(GM) + " dB"]) + row(["臨界增益", num6(Kcrit)]) + row(["增益交越頻率", num6(wgc) + " rad/s"])
      + row(["交越處相位", deg(phGc)]) + row(["相位裕度", deg(PM)]) + row(["ζ 粗估", num6(zetaEst)]) + row(["N 與 Z", int0(N) + "、" + int0(N)]) + "</table>";
    h += "<p>奈奎斯特判定：軌跡穿越負實軸於 −" + num6(mpc) + "，在 −1 的" + (mpc < 1 ? "右邊" : "左邊") + "，環繞 −1 共 " + int0(N) + " 次，閉迴路右半平面極點 Z ＝ " + int0(N) + "。</p>";
    if (Math.abs(mpc - 1) < 1e-6) { h += "<p><strong>判讀：臨界，等幅振盪於 ω_pc；K ＝ K_crit ＝ " + num6(Kcrit) + "</strong></p>"; }
    else if (mpc > 1) { h += "<p><strong>判讀：GM ＜ 0 dB，軌跡環繞 −1，Z ＝ 2，不穩定</strong></p>"; }
    else if (PM < 45) { h += "<p><strong>判讀：穩定但 PM 只有 " + deg(PM) + "，步階響應會晃，ζ 粗估 " + num6(zetaEst) + "</strong></p>"; }
    else if (PM > 60) { h += "<p><strong>判讀：很穩但偏慢，ω_gc 只有 " + num6(wgc) + "</strong></p>"; }
    else if (GM >= 6 && GM <= 12) { h += "<p><strong>判讀：兩個裕度都在目標帶</strong></p>"; }
    else { h += "<p><strong>判讀：PM 在目標帶，GM ＝ " + num6(GM) + " dB " + (GM > 12 ? "偏大（偏大只是保守）" : "偏小") + "</strong></p>"; }
    h += "<p>為什麼：閉迴路極點是 L ＝ −1 的解；相位 −180° 時的振幅離 1 有多遠、振幅 1 時的相位離 −180° 有多遠，就是離不穩定有多遠。</p>";
    if (K === 110) { h += "<p>邊界提醒：K ＝ K_crit ＝ " + num6(Kcrit) + "。</p>"; }
    if (K === 200) { h += "<p>邊界提醒：增益超過臨界值，閉迴路有兩個右半平面極點。</p>"; }
    if (t1 === 0.01 && t2 === 0.01) { h += "<p>邊界提醒：兩個時間常數相等，ω_pc ＝ " + num6(wpc) + " rad/s、K_crit ＝ " + num6(Kcrit) + "。</p>"; }
    if (PM >= 60) { h += "<p>邊界提醒：ζ ≈ PM / 100 的粗估在 PM 大於 60° 時失效。</p>"; }
    put("margin-output", h);
  };
  bind(ids, draw); draw();
}

function pid() {
  if (!$("pd-preset")) { return; }
  var ids = ["pd-preset", "pd-kp", "pd-ki", "pd-kd"];
  var draw = function (event) {
    var preset = pick("pd-preset"), p;
    if (event && event.target && event.target.id === "pd-preset" && preset !== "manual" && PID_PRESET[preset]) {
      p = PID_PRESET[preset]; $("pd-kp").value = p[0]; $("pd-ki").value = p[1]; $("pd-kd").value = p[2];
    }
    var Kp = val("pd-kp"), Ki = val("pd-ki"), Kd = val("pd-kd"), b1 = (6 * (11 + Kd) - (6 + Kp)) / 6;
    var c1 = b1 !== 0 ? (b1 * (6 + Kp) - 6 * Ki) / b1 : 0;
    var critical = b1 === 0 || (Ki === 0 && 6 * (11 + Kd) === 6 + Kp);
    var stable = Ki > 0 ? b1 > 0 && c1 > 0 : 6 * (11 + Kd) > 6 + Kp;
    var wu = Math.sqrt(11), Tu = 2 * Math.PI / wu, sim = stable && !critical ? pidSim(Kp, Ki, Kd) : null;
    var h = "<p>目前參數 K_p ＝ " + num6(Kp) + "、K_i ＝ " + num6(Ki) + "、K_d ＝ " + num6(Kd) + "。</p><table>"
      + row(["量", "結果"], true) + row(["特徵多項式", Ki > 0 ? ("s⁴ ＋ 6s³ ＋ " + num6(11 + Kd) + "s² ＋ " + num6(6 + Kp) + "s ＋ " + num6(Ki)) : ("s³ ＋ 6s² ＋ " + num6(11 + Kd) + "s ＋ " + num6(6 + Kp))])
      + row(["Routh b₁", num6(b1)]) + row(["Routh c₁", Ki === 0 ? "不適用" : num6(c1)]) + row(["判定", critical ? "臨界" : stable ? "穩定" : "不穩定"]);
    if (sim && !sim.diverged) {
      h += row(["峰值", num6(sim.peak)]) + row(["超越量", num6(sim.Mp) + " %"]) + row(["峰值時刻", num6(sim.tp) + " s"])
        + row(["上升時間", sim.tr === null ? "不適用" : num6(sim.tr) + " s"]) + row(["整定時間", num6(sim.ts) + " s" + (sim.notSettled ? "（未進帶）" : "")])
        + row(["最後輸出", num6(sim.yfin)]) + row(["最後誤差", num6(sim.ess)]) + row(["IAE", num6(sim.iae)]);
    } else {
      h += row(["模擬", sim && sim.diverged ? "模擬發散" : "不執行"]);
    }
    var theoryEss = (Kp === 0 && Ki === 0 && Kd === 0) ? 1 : Ki === 0 ? 6 / (6 + Kp) : 0;
    h += row(["理論 e_ss", num6(theoryEss)]) + row(["固定參考", "K_u ＝ " + num6(60) + "、ω_u ＝ " + num6(wu) + "、T_u ＝ " + num6(Tu) + " s；Z–N 建議 " + num6(36) + "、" + num6(38) + "、" + num6(8.5)]) + "</table>";
    if (!stable || critical) { h += "<p><strong>判讀：Routh 第一欄變號或到達臨界，閉迴路不穩定；把 K_i 調小或 K_d 調大</strong></p>"; }
    else if (sim && sim.diverged) { h += "<p><strong>判讀：模擬發散</strong></p>"; }
    else if (Ki === 0) { h += "<p><strong>判讀：沒有積分項，穩態誤差停在 6 / (6 ＋ K_p) ＝ " + num6(theoryEss) + "</strong></p>"; }
    else if (sim.Mp > 25) { h += "<p><strong>判讀：超越量 " + num6(sim.Mp) + " % 過大（ζ 約低於 0.4），減 K_p 或 K_i、或加 K_d</strong></p>"; }
    else if (sim.ts >= 10) { h += "<p><strong>判讀：10 s 內未進 ±2 % 帶</strong></p>"; }
    else { h += "<p><strong>判讀：超越量 " + num6(sim.Mp) + " %、整定 " + num6(sim.ts) + " s，這組可用</strong></p>"; }
    if (preset === "zn") { h += "<p>Z–N 以四分之一衰減為目標，超越量本來就偏大，常當起點再手調。</p>"; }
    h += "<p>為什麼：K_p 把極點往虛軸推、K_i 多一個原點極點消掉穩態誤差但多吃 90° 相位、K_d 加一個零點把極點拉回左邊；三者都在動同一條特徵多項式。</p>";
    if (Kp === 0 && Ki === 0 && Kd === 0) { h += "<p>邊界提醒：沒有控制器，y 停在 " + num6(0) + "，e_ss ＝ " + num6(1) + "。</p>"; }
    if (Kp === 60 && Ki === 0 && Kd === 0) { h += "<p>邊界提醒：K_p ＝ K_u ＝ " + num6(60) + "，臨界，等幅振盪週期 T_u ＝ " + num6(Tu) + " s。</p>"; }
    put("pid-output", h);
  };
  bind(ids, draw); draw();
}

function lead() {
  if (!$("ld-type")) { return; }
  var ids = ["ld-type", "ld-alpha", "ld-wm", "ld-beta", "ld-z"];
  var draw = function () {
    var type = pick("ld-type"), alpha = val("ld-alpha"), wm = val("ld-wm"), beta = val("ld-beta"), zin = val("ld-z");
    var z, p, Kc, phimax = null;
    if (type === "lead") { z = wm / Math.sqrt(alpha); p = wm * Math.sqrt(alpha); Kc = 1; phimax = Math.asin(Math.max(-1, Math.min(1, (alpha - 1) / (alpha + 1)))) * 180 / Math.PI; }
    else { z = zin; p = beta !== 0 ? z / beta : 0; Kc = beta; }
    var cmag = function (w) { var den = Math.sqrt(1 + (w / p) * (w / p)); return den !== 0 ? Kc * Math.sqrt(1 + (w / z) * (w / z)) / den : 0; };
    var cphase = function (w) { return Math.atan(w / z) * 180 / Math.PI - Math.atan(w / p) * 180 / Math.PI; };
    var magFn = function (w) { return lmag(L0.K, L0.t1, L0.t2, w) * cmag(w); };
    var phFn = function (w) { return lphase(L0.t1, L0.t2, w) + cphase(w); };
    var wgc = bisectGain(magFn), PM = 180 + phFn(wgc), wpc = bisectPhase(phFn), atPc = magFn(wpc), GM = atPc > 0 ? -20 * log10(atPc) : 0;
    var oldPM = 47.403940, oldWgc = 7.844079, oldGM = 20.827854, Kv = 10 * Kc, ess = Kv !== 0 ? 1 / Kv : 0, delta = oldPM - PM;
    var h = "<p>這個模式只用到 " + (type === "lead" ? "α、ω_m；β、z 不影響結果。" : "β、z；α、ω_m 不影響結果。") + "</p><table>"
      + row(["量", "結果"], true) + row(["零點 z", num6(z) + " rad/s"]) + row(["極點 p", num6(p) + " rad/s"])
      + row(["最大相位提升", phimax === null ? "不適用" : deg(phimax)]) + row(["補償前 ω_gc / PM / GM", num6(oldWgc) + " / " + deg(oldPM) + " / " + num6(oldGM) + " dB"])
      + row(["補償後 ω_gc", num6(wgc) + " rad/s"]) + row(["補償後 PM", deg(PM)]) + row(["補償後 ω_pc", num6(wpc) + " rad/s"])
      + row(["補償後 GM", num6(GM) + " dB"]) + row(["K_v", num6(Kv)]) + row(["斜坡 e_ss", num6(ess)]) + "</table>";
    if (type === "lead") {
      h += PM > oldPM ? "<p><strong>判讀：PM 從 47.40° 提到 " + deg(PM) + "，ω_gc 從 7.84 推到 " + num6(wgc) + "（更快），K_v 不變</strong></p>" : "<p><strong>判讀：ω_m 放錯位置，相位提升沒有落在新的交越頻率上，PM 反而變差</strong></p>";
    } else {
      h += delta <= 5 ? "<p><strong>判讀：K_v 從 10 提到 " + num6(Kv) + "，斜坡誤差縮到 " + num6(ess) + "，PM 只掉 " + deg(delta) + "</strong></p>" : "<p><strong>判讀：z 放太靠近 ω_gc，相位滯後吃掉 " + deg(delta) + " 的 PM，把 z 往低頻搬</strong></p>";
    }
    h += "<p>為什麼：領先補償在 ω_m 附近加相位、同時抬振幅 √α 把交越頻率右移；落後補償只在低頻抬 β 倍增益，高頻增益回到 1，所以 K_v 變大而 ω_gc 附近幾乎沒動。</p>";
    if (type === "lead" && alpha === 20) { h += "<p>邊界提醒：高頻增益 20 倍，感測雜訊被放大 20 倍，實務上 α 很少超過 10。</p>"; }
    if (type === "lead" && wm === 1) { h += "<p>邊界提醒：中心頻率放得太低，相位提升錯過新的交越頻率。</p>"; }
    if (type === "lag" && zin === 5) { h += "<p>邊界提醒：零點太靠近交越頻率，相位裕度會明顯下降。</p>"; }
    if (type === "lag" && beta === 20 && zin === 0.1) { h += "<p>邊界提醒：p ＝ " + num6(p) + "，極點太靠近原點，補償器暫態要幾百秒才消。</p>"; }
    put("lead-output", h);
  };
  bind(ids, draw); draw();
}

function state() {
  if (!$("ss-preset")) { return; }
  var ids = ["ss-preset", "ss-a11", "ss-a12", "ss-a21", "ss-a22", "ss-b1", "ss-b2", "ss-c1", "ss-c2", "ss-d1", "ss-d0"];
  var matrixIds = ["ss-a11", "ss-a12", "ss-a21", "ss-a22", "ss-b1", "ss-b2", "ss-c1", "ss-c2"];
  var draw = function (event) {
    var preset = pick("ss-preset"), p, i;
    if (event && event.target && event.target.id === "ss-preset" && preset !== "custom" && SS_PRESET[preset]) {
      p = SS_PRESET[preset]; for (i = 0; i < matrixIds.length; i += 1) { $(matrixIds[i]).value = p[i]; }
    }
    var a = matrixIds.map(function (id) { return finiteOrZero(pick(id)); }), A = a.slice(0, 4), B = a.slice(4, 6), C = a.slice(6, 8), d1 = finiteOrZero(pick("ss-d1")), d0 = finiteOrZero(pick("ss-d0"));
    var r = stateSpace(A, B, C, d1, d0), mat = function (m) { return "[[" + num6(m[0]) + ", " + num6(m[1]) + "], [" + num6(m[2]) + ", " + num6(m[3]) + "]]"; };
    var h = "<p>目前 A ＝ " + mat(A) + "、B ＝ [" + num6(B[0]) + ", " + num6(B[1]) + "]、C ＝ [" + num6(C[0]) + ", " + num6(C[1]) + "]（選自訂後改欄位才會用到欄位值）。</p><table>"
      + row(["量", "結果"], true) + row(["特徵多項式", "s² − (" + num6(r.tr) + ")s ＋ " + num6(r.det)]) + row(["特徵值", eigText(r.eig)])
      + row(["M_c", mat(r.Mc)]) + row(["det M_c", num6(r.detMc)]) + row(["M_o", mat(r.Mo)]) + row(["det M_o", num6(r.detMo)]);
    if (r.K) { h += row(["φ(A)", mat(r.phi)]) + row(["K", "[" + num6(r.K[0]) + ", " + num6(r.K[1]) + "]"]) + row(["閉迴路特徵值", eigText(r.eigCl)]); }
    else { h += row(["φ(A)", "不適用"]) + row(["K", "不適用"]) + row(["閉迴路特徵值", "不適用"]); }
    h += "</table>";
    if (Math.abs(r.detMc) < 1e-9) { h += "<p><strong>判讀：det M_c ＝ 0，不可控，極點配置無解——u 推不動的那個方向由它自己決定</strong></p>"; }
    else if (Math.abs(r.detMo) < 1e-9) { h += "<p><strong>判讀：可控但不可觀，K ＝ [" + num6(r.K[0]) + ", " + num6(r.K[1]) + "] 算得出來，但沒有全狀態量測就實作不了，觀測器也無解</strong></p>"; }
    else { h += "<p><strong>判讀：K ＝ [" + num6(r.K[0]) + ", " + num6(r.K[1]) + "]，閉迴路特徵值 " + eigText(r.eigCl) + "，與期望多項式一致；可設計觀測器</strong></p>"; }
    for (i = 0; i < r.eig.length; i += 1) { if (r.eig[i].re > 0) { h += "<p>開迴路不穩定，但只要可控一樣能配置。</p>"; break; } }
    h += "<p>為什麼：狀態回授把 A 換成 A − BK，K 的兩個數剛好可以自由決定特徵多項式的兩個係數，前提是 [B, AB] 張得開整個平面。</p>";
    var blank = false; for (i = 0; i < matrixIds.length; i += 1) { if (pick(matrixIds[i]) === "") { blank = true; } }
    if (pick("ss-d1") === "" || pick("ss-d0") === "") { blank = true; }
    if (blank) { h += "<p>邊界提醒：清空的欄位視為 0。</p>"; }
    if (d1 <= 0 || d0 <= 0) { h += "<p>邊界提醒：期望多項式係數非正，配置後的極點不在左半平面，這不是穩定的設計。</p>"; }
    if (r.K && (Math.abs(r.K[0]) > 1000 || Math.abs(r.K[1]) > 1000)) { h += "<p>邊界提醒：增益極大，實務上會飽和。</p>"; }
    put("state-output", h);
  };
  bind(ids, draw); draw();
}

/* ---------- 5. 字典 ---------- */
function dictionary() {
  if (!$("term-search")) { return; }
  var draw = function () {
    var q = String(pick("term-search")).toLowerCase().trim(), cards = document.getElementsByClassName("term-card"), shown = 0, i, c, hay;
    for (i = 0; i < cards.length; i += 1) {
      c = cards[i]; hay = ((c.getAttribute("data-search") || "") + " " + (c.textContent || "")).toLowerCase();
      if (q === "" || hay.indexOf(q) !== -1) { c.removeAttribute("hidden"); shown += 1; } else { c.setAttribute("hidden", "hidden"); }
    }
    put("term-count", "顯示 " + int0(shown) + " / " + int0(54) + " 張卡");
  };
  bind(["term-search"], draw); draw();
}

/* ---------- 6. 自我檢核 ---------- */
function selfcheck() {
  if (!$("quiz-reset")) { return; }
  var answered = {};
  var progress = function () { var n = 0, k; for (k in answered) { if (answered.hasOwnProperty(k) && answered[k]) { n += 1; } } put("quiz-progress", "已作答 " + int0(n) + " / " + int0(QUIZ.length) + " 題（僅供參考，不影響瀏覽）"); };
  var link = function (id) { var t = QUIZ_CH[id.slice(1, 3)]; return t ? "<p>回去看：<a href=\"" + t[0] + "\">" + t[1] + "</a></p>" : ""; };
  var makeCheck = function (q) {
    return function () {
      var node = $(q.id), raw, ok, v, right;
      if (!node) { return; } raw = node.value;
      if (raw === "" || raw === null) { put(q.id + "-output", "<p>" + (q.t === "num" ? "先填一個數字。" : "先選一個選項。") + "</p>"); answered[q.id] = false; progress(); return; }
      if (q.t === "num") { v = Number(raw); if (!isFinite(v)) { put(q.id + "-output", "<p>先填一個數字。</p>"); answered[q.id] = false; progress(); return; } ok = Math.abs(v - q.ans) <= q.tol; }
      else { ok = String(raw) === q.ans; }
      answered[q.id] = true;
      if (ok) { put(q.id + "-output", "<p><strong>答對</strong>　" + q.why + "</p>" + link(q.id)); }
      else { right = q.t === "num" ? "正確答案是 " + num6(q.ans) + "。" : "正確答案是選項 " + q.ans + "。"; put(q.id + "-output", "<p><strong>再看一次</strong>　" + right + q.why + "　" + q.err + "</p>" + link(q.id)); }
      progress();
    };
  };
  var i, q, btn;
  for (i = 0; i < QUIZ.length; i += 1) { q = QUIZ[i]; btn = $(q.id + "-check"); if (btn) { btn.addEventListener("click", makeCheck(q)); } }
  $("quiz-reset").addEventListener("click", function () { var j, n; for (j = 0; j < QUIZ.length; j += 1) { n = $(QUIZ[j].id); if (n) { n.value = ""; } put(QUIZ[j].id + "-output", ""); answered[QUIZ[j].id] = false; } progress(); });
  progress();
}

/* ---------- 7. 註冊 ---------- */
if (typeof document !== "undefined") {
  [loop, model, block, sserr, second, routh, rlocus, bode, margin, pid, lead, state, dictionary, selfcheck].forEach(function (f) { f(); });
}

/* ---------- 8. Node 匯出 ---------- */
if (typeof module !== "undefined") {
  module.exports = { num6: num6, routhTable: routhTable, cubicRoots: cubicRoots, lmag: lmag, lphase: lphase, bisectGain: bisectGain, bisectPhase: bisectPhase, pidSim: pidSim, stateSpace: stateSpace, QUIZ: QUIZ };
}

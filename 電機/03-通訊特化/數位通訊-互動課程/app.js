"use strict";
/* 數位通訊（零基礎互動課）——全站互動邏輯 */

/* ---------- 1. helper ---------- */
var $ = function (id) {
  if (typeof document === "undefined") { return null; }
  return document.getElementById(id);
};
var bind = function (ids, f) {
  ids.forEach(function (x) {
    var n = $(x);
    if (n) { n.addEventListener("input", f); }
  });
};
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
var supNum = function (n) {
  var v = Math.round(Number(n));
  return v < 0 ? "−" + String(Math.abs(v)) : String(v);
};
var sci = function (x, digits) {
  var v = Number(x), parts;
  if (!isFinite(v)) { return "不適用"; }
  if (v === 0) { return "0"; }
  if (Math.abs(v) < 1e-300) { return "小於 10<sup>−300</sup>"; }
  parts = v.toExponential(digits === undefined ? 6 : digits).split("e");
  return minus(parts[0]) + " × 10<sup>" + supNum(Number(parts[1])) + "</sup>";
};
var row = function (cells, isHeader) {
  var t = isHeader ? "th" : "td";
  return "<tr><" + t + ">" + cells.join("</" + t + "><" + t + ">") + "</" + t + "></tr>";
};
var put = function (id, html) { var n = $(id); if (n) { n.innerHTML = html; } };
var esc = function (s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
var db10 = function (x) { return x > 0 ? 10 * Math.log(x) / Math.LN10 : 0; };
var undb = function (x) { return Math.pow(10, x / 10); };
var bits = function (a) { return a.join(""); };
var grouped = function (a) {
  var s = bits(a);
  return s.length === 7 ? s.slice(0, 4) + " " + s.slice(4) : s.replace(/(.{2})(?=.)/g, "$1 ");
};
var table2 = function (caption, pairs) {
  var h = "<table><caption>" + caption + "</caption>" + row(["量", "結果"], true), i;
  for (i = 0; i < pairs.length; i += 1) { h += row(pairs[i]); }
  return h + "</table>";
};
var comb = function (n, k) {
  var r = 1, i;
  for (i = 1; i <= k; i += 1) { r = r * (n - k + i) / i; }
  return r;
};

var erfc = function (x) {
  var term, s, n, t, f, k;
  if (x < 0) { return 2 - erfc(-x); }
  if (x < 2) {
    term = x; s = 0; n = 0;
    while (true) {
      t = term / (2 * n + 1); s += t;
      if (Math.abs(t) < 1e-17 * Math.abs(s) || n > 200) { break; }
      n += 1; term *= -x * x / n;
    }
    return 1 - 2 / Math.sqrt(Math.PI) * s;
  }
  f = x;
  for (k = 100; k >= 1; k -= 1) { f = x + (k / 2) / f; }
  return Math.exp(-x * x) / Math.sqrt(Math.PI) / f;
};
var Q = function (x) { return 0.5 * erfc(x / Math.sqrt(2)); };

/* ---------- 2. 常數 ---------- */
var CONS = {
  bpsk:   { name: "BPSK",    M: 2,   k: 1, eavg: 1,   epeak: 1,   navg: 1,    hnat: 1,        hgray: 1 },
  qpsk:   { name: "QPSK",    M: 4,   k: 2, eavg: 1,   epeak: 1,   navg: 2,    hnat: 1.5,      hgray: 1 },
  psk8:   { name: "8-PSK",   M: 8,   k: 3, eavg: 1,   epeak: 1,   navg: 2,    hnat: 1.75,     hgray: 1 },
  psk16:  { name: "16-PSK",  M: 16,  k: 4, eavg: 1,   epeak: 1,   navg: 2,    hnat: 1.875,    hgray: 1 },
  qam16:  { name: "16-QAM",  M: 16,  k: 4, eavg: 10,  epeak: 18,  navg: 3,    hnat: 1.333333, hgray: 1 },
  qam64:  { name: "64-QAM",  M: 64,  k: 6, eavg: 42,  epeak: 98,  navg: 3.5,  hnat: 1.571429, hgray: 1 },
  qam256: { name: "256-QAM", M: 256, k: 8, eavg: 170, epeak: 450, navg: 3.75, hnat: 1.733333, hgray: 1 }
};
var TRAIN = [1, 1, 1, 1, 1, -1, -1, 1, 1, -1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, 1, -1, 1, 1, 1, -1, 1, 1, -1, -1, -1];
var SYN2POS = { "000": 0, "110": 1, "101": 2, "011": 3, "111": 4, "100": 5, "010": 6, "001": 7 };
var SCHEMES = ["bpsk", "psk8", "psk16", "qam16", "qam64", "qam256", "dpsk", "ncfsk", "cfsk"];
var SCHEME_NAME = { bpsk: "BPSK／QPSK", psk8: "8-PSK", psk16: "16-PSK", qam16: "16-QAM", qam64: "64-QAM", qam256: "256-QAM", dpsk: "DBPSK", ncfsk: "非同調 BFSK", cfsk: "同調 BFSK" };

var QUIZ_CH = {
  "00": ["00-數位通訊世界觀與收發鏈.html", "00 數位通訊世界觀與收發鏈"],
  "01": ["01-訊號空間與正交基底.html", "01 訊號空間與正交基底"],
  "02": ["02-M進制星座與最小距離.html", "02 M 進制星座與最小距離"],
  "03": ["03-最佳接收機與ML判決.html", "03 最佳接收機與 ML 判決"],
  "04": ["04-誤碼率公式與Q函數.html", "04 誤碼率公式與 Q 函數"],
  "05": ["05-載波相位與同步.html", "05 載波相位與同步"],
  "06": ["06-等化器ZF與MMSE.html", "06 等化器 ZF 與 MMSE"],
  "07": ["07-自適應等化LMS.html", "07 自適應等化 LMS"],
  "08": ["08-漢明碼與症狀解碼.html", "08 漢明碼與症狀解碼"],
  "09": ["09-摺積碼與Viterbi解碼.html", "09 摺積碼與 Viterbi 解碼"],
  "10": ["10-交錯與突發錯誤.html", "10 交錯與突發錯誤"],
  "11": ["11-展頻與CDMA.html", "11 展頻與 CDMA"],
  "12": ["12-OFDM與循環字首.html", "12 OFDM 與循環字首"]
};
var QUIZ = [
  {id:"q00-1",t:"num",ans:1000,tol:0.5,why:"編碼後為 2000 kbit/s，再除以每符元 2 位元。",err:"常見錯因：忘了先除以編碼率。"},
  {id:"q00-2",t:"num",ans:1250,tol:0.5,why:"B ＝ (1 + 0.25) × 1000 ＝ 1250 kHz。",err:"常見錯因：漏掉滾降係數。"},
  {id:"q00-3",t:"sel",ans:"a",tol:0,why:"每符元載 k 個編碼位元，每個編碼位元分到 R 份資訊位元能量。",err:"常見錯因：把編碼率放到分母。"},
  {id:"q01-1",t:"num",ans:2,tol:0.01,why:"d² ＝ 1 + 1 − 2 × (−1) ＝ 4。",err:"常見錯因：填成距離平方。"},
  {id:"q01-2",t:"num",ans:2,tol:0.01,why:"正交時交叉項為 0，所以 d² ＝ 2。",err:"常見錯因：又開了一次根號。"},
  {id:"q01-3",t:"sel",ans:"a",tol:0,why:"反極性的 d² ＝ 4E 最大。",err:"常見錯因：把正交當成最佳。"},
  {id:"q02-1",t:"num",ans:10,tol:0.01,why:"一維平均平方為 5，兩維相加為 10。",err:"常見錯因：只算一個軸。"},
  {id:"q02-2",t:"num",ans:4.195285,tol:0.01,why:"20 log<sub>10</sub>(0.632456 / 0.390181) ＝ 4.195285 dB。",err:"常見錯因：功率比誤用 10 log。"},
  {id:"q02-3",t:"sel",ans:"b",tol:0,why:"Gray 讓相鄰點只差 1 位元，符元錯誤率不變。",err:"常見錯因：以為星座距離也改變。"},
  {id:"q03-1",t:"num",ans:-0.137973,tol:0.001,why:"γ ＝ 0.099527 × (−1.386294)。",err:"常見錯因：先驗比值放反。"},
  {id:"q03-2",t:"num",ans:1.297365,tol:0.01,why:"用 ML 錯誤率除以 MAP 錯誤率。",err:"常見錯因：倍率上下顛倒。"},
  {id:"q03-3",t:"sel",ans:"d",tol:0,why:"該點距離平方最小，相關度量最大。",err:"常見錯因：只看一個座標。"},
  {id:"q04-1",t:"num",ans:9.587858,tol:0.01,why:"二分反解 Q(√(2γ)) ＝ 10<sup>−5</sup>。",err:"常見錯因：把線性值當 dB。"},
  {id:"q04-2",t:"num",ans:3.846663,tol:0.01,why:"13.434522 − 9.587858 ＝ 3.846663 dB。",err:"常見錯因：直接填粗略的 4 dB。"},
  {id:"q04-3",t:"sel",ans:"b",tol:0,why:"差分判讀的結果是 ½ exp(−γ<sub>b</sub>)。",err:"常見錯因：與非同調 BFSK 混在一起。"},
  {id:"q05-1",t:"num",ans:1.817874,tol:0.01,why:"−20 log<sub>10</sub>(cos 10° − sin 10°)。",err:"常見錯因：忽略 QPSK 的最壞軸。"},
  {id:"q05-2",t:"num",ans:1.8,tol:0.01,why:"360° × 0.005 ＝ 1.8°。",err:"常見錯因：千分之一沒有除以 1000。"},
  {id:"q05-3",t:"sel",ans:"b",tol:0,why:"平方後 (±1)² ＝ 1，相位資訊少一半。",err:"常見錯因：把模糊歸咎於雜訊。"},
  {id:"q06-1",t:"num",ans:5.263158,tol:0.01,why:"1 / (1 − 0.81) ＝ 5.263158。",err:"常見錯因：忘了把 0.9 平方。"},
  {id:"q06-2",t:"num",ans:13.750613,tol:0.01,why:"15 − 1.249387 ＝ 13.750613 dB。",err:"常見錯因：線性倍數直接減 dB。"},
  {id:"q06-3",t:"sel",ans:"b",tol:0,why:"MMSE 不在通道壓低的頻率硬拉，因此少放大雜訊。",err:"常見錯因：以為 MMSE 會完全清掉 ISI。"},
  {id:"q07-1",t:"num",ans:0.32,tol:0.001,why:"2 / (5 × 1.25) ＝ 0.32。",err:"常見錯因：漏掉輸入功率。"},
  {id:"q07-2",t:"num",ans:0.25,tol:0.001,why:"(−0.5)² ＝ 0.25。",err:"常見錯因：抽頭位置從 0 起算。"},
  {id:"q07-3",t:"sel",ans:"b",tol:0,why:"一步跨過谷底，誤差會越推越大。",err:"常見錯因：把大步長只理解成更快。"},
  {id:"q08-1",t:"sel",ans:"a",tol:0,why:"三個校驗位元依序為 0、1、0。",err:"常見錯因：校驗式代錯訊息位置。"},
  {id:"q08-2",t:"num",ans:7.569620,tol:0.01,why:"10 + 10 log<sub>10</sub>(4 / 7) ＝ 7.569620。",err:"常見錯因：忘了編碼率小於 1。"},
  {id:"q08-3",t:"num",ans:0.413375,tol:0.005,why:"9.587858 − 9.174484 ＝ 0.413375 dB。",err:"常見錯因：填成漸近增益。"},
  {id:"q09-1",t:"num",ans:5,tol:0.01,why:"最短離開再回來路徑的輸出重量為 5。",err:"常見錯因：約束長度與自由距離混淆。"},
  {id:"q09-2",t:"sel",ans:"a",tol:0,why:"輸出 01，下一狀態為 11。",err:"常見錯因：狀態位元次序放反。"},
  {id:"q09-3",t:"num",ans:64,tol:0.01,why:"2<sup>7−1</sup> ＝ 64。",err:"常見錯因：算成 2<sup>7</sup>。"},
  {id:"q10-1",t:"num",ans:28,tol:0.01,why:"矩陣有 4 × 7 ＝ 28 個位元。",err:"常見錯因：只填深度。"},
  {id:"q10-2",t:"num",ans:2,tol:0.01,why:"⌈6 / 4⌉ ＝ 2。",err:"常見錯因：向下取整。"},
  {id:"q10-3",t:"sel",ans:"a",tol:0,why:"突發長度不超過深度時，每列最多挨 1 個。",err:"常見錯因：把碼長當深度。"},
  {id:"q11-1",t:"num",ans:18.0618,tol:0.01,why:"10 log<sub>10</sub> 64 ＝ 18.0618 dB。",err:"常見錯因：誤用 20 log。"},
  {id:"q11-2",t:"num",ans:0.109375,tol:0.001,why:"(8 − 1) / 64 ＝ 0.109375。",err:"常見錯因：沒有扣掉自己。"},
  {id:"q11-3",t:"sel",ans:"b",tol:0,why:"碼片邊界對齊時，Walsh 碼內積才為 0。",err:"常見錯因：以為正交不需要同步。"},
  {id:"q12-1",t:"num",ans:312.5,tol:0.01,why:"20000 / 64 ＝ 312.5 kHz。",err:"常見錯因：MHz 沒換成 kHz。"},
  {id:"q12-2",t:"num",ans:0.8,tol:0.001,why:"3.2 µs × 1 / 4 ＝ 0.8 µs。",err:"常見錯因：把比例乘到總時間。"},
  {id:"q12-3",t:"sel",ans:"b",tol:0,why:"複製尾端到前面，FFT 後每個子載波只需一個係數。",err:"常見錯因：把循環字首當成只補空白。"}
];

/* ---------- 3. 演算法 ---------- */
function berOf(scheme, g) {
  if (!(g >= 0) || !isFinite(g)) { return 0.5; }
  if (scheme === "bpsk") { return Q(Math.sqrt(2 * g)); }
  if (scheme === "psk8") { return 2 * Q(Math.sqrt(6 * g) * Math.sin(Math.PI / 8)) / 3; }
  if (scheme === "psk16") { return 2 * Q(Math.sqrt(8 * g) * Math.sin(Math.PI / 16)) / 4; }
  if (scheme === "qam16") { return (1 - 1 / 4) * Q(Math.sqrt(12 * g / 15)); }
  if (scheme === "qam64") { return (4 / 6) * (1 - 1 / 8) * Q(Math.sqrt(18 * g / 63)); }
  if (scheme === "qam256") { return (4 / 8) * (1 - 1 / 16) * Q(Math.sqrt(24 * g / 255)); }
  if (scheme === "dpsk") { return 0.5 * Math.exp(-g); }
  if (scheme === "ncfsk") { return 0.5 * Math.exp(-g / 2); }
  if (scheme === "cfsk") { return Q(Math.sqrt(g)); }
  return 0.5;
}
function reqEbN0(scheme, target) {
  var lo = -10, hi = 60, mid, i;
  if (!(target > 0 && target < 0.5)) { return 0; }
  for (i = 0; i < 200; i += 1) {
    mid = (lo + hi) / 2;
    if (berOf(scheme, undb(mid)) > target) { lo = mid; } else { hi = mid; }
  }
  return (lo + hi) / 2;
}
function lmsRun(mu, a, L, N) {
  var w = [], u = [], e2s = [], curve = {}, divergedAt = 0;
  var n, i, x, xp, un, y, e, e2, firstN, lastN, sum;
  for (i = 0; i < L; i += 1) { w.push(0); u.push(0); }
  for (n = 0; n < N; n += 1) {
    x = TRAIN[n % 31]; xp = n >= 1 ? TRAIN[(n - 1) % 31] : 0; un = x + a * xp;
    for (i = L - 1; i >= 1; i -= 1) { u[i] = u[i - 1]; }
    u[0] = un; y = 0;
    for (i = 0; i < L; i += 1) { y = y + w[i] * u[i]; }
    e = x - y; e2 = e * e; e2s.push(e2);
    if (!isFinite(e2) || e2 > 1e6) { divergedAt = n + 1; break; }
    for (i = 0; i < L; i += 1) { w[i] = w[i] + mu * e * u[i]; }
    if (n + 1 === 1 || n + 1 === 10 || n + 1 === 20 || n + 1 === 50 || n + 1 === 100 || n + 1 === 200 || n + 1 === 500) { curve[n + 1] = e2; }
  }
  firstN = Math.min(31, e2s.length); lastN = Math.min(31, e2s.length); sum = 0;
  for (i = 0; i < firstN; i += 1) { sum += e2s[i]; }
  var mseFirst = firstN ? sum / firstN : 0; sum = 0;
  for (i = e2s.length - lastN; i < e2s.length; i += 1) { sum += e2s[i]; }
  return { w: w, curve: curve, mseFirst: mseFirst, mseLast: lastN ? sum / lastN : 0, divergedAt: divergedAt };
}
function hamEncode(m) {
  return [m[0], m[1], m[2], m[3], m[0] ^ m[1] ^ m[3], m[0] ^ m[2] ^ m[3], m[1] ^ m[2] ^ m[3]];
}
function hamSyndrome(r) {
  return "" + (r[0] ^ r[1] ^ r[3] ^ r[4]) + (r[0] ^ r[2] ^ r[3] ^ r[5]) + (r[1] ^ r[2] ^ r[3] ^ r[6]);
}
function convEncode(input) {
  var s1 = 0, s2 = 0, out = [], i, u, c1, c2;
  for (i = 0; i < input.length; i += 1) {
    u = input[i]; c1 = u ^ s1 ^ s2; c2 = u ^ s2; out.push(c1); out.push(c2); s2 = s1; s1 = u;
  }
  return out;
}
function viterbiDecode(rcv) {
  var INF = 1e9, pm = [0, INF, INF, INF], hist = [], table = [];
  var n, r1, r2, nw, back, st, s1, s2, u, c1, c2, bm, ns, m, pair, dec = [];
  for (n = 0; n < 6; n += 1) {
    r1 = rcv[2 * n]; r2 = rcv[2 * n + 1]; nw = [INF, INF, INF, INF]; back = [null, null, null, null];
    for (st = 0; st < 4; st += 1) {
      if (pm[st] >= INF) { continue; }
      s1 = st >> 1; s2 = st & 1;
      for (u = 0; u <= 1; u += 1) {
        c1 = u ^ s1 ^ s2; c2 = u ^ s2; bm = (c1 ^ r1) + (c2 ^ r2); ns = (u << 1) | s1; m = pm[st] + bm;
        if (m < nw[ns]) { nw[ns] = m; back[ns] = [st, u]; }
      }
    }
    pm = nw; hist.push(back); table.push(pm.slice());
  }
  st = 0;
  for (n = 5; n >= 0; n -= 1) { pair = hist[n][st]; dec.unshift(pair[1]); st = pair[0]; }
  return { table: table, dec: dec, finalMetric: pm[0] };
}
function interleaveRun(D, b, start) {
  var n = 7, L = D * n, errs = [], errs0 = [], hits = 0, t, i, fail = 0, fail0 = 0;
  for (i = 0; i < D; i += 1) { errs.push(0); errs0.push(0); }
  for (t = start; t <= start + b - 1; t += 1) {
    if (t >= 1 && t <= L) { hits += 1; errs[(t - 1) % D] += 1; errs0[Math.floor((t - 1) / n)] += 1; }
  }
  for (i = 0; i < D; i += 1) { if (errs[i] > 1) { fail += 1; } if (errs0[i] > 1) { fail0 += 1; } }
  return { L: L, hits: hits, errs: errs, errs0: errs0, fail: fail, fail0: fail0 };
}

/* ---------- 4. widget 守衛函式 ---------- */
function chain() {
  if (!$("ch-rb")) { return; }
  var ids = ["ch-rb", "ch-rate", "ch-k", "ch-alpha"];
  var draw = function () {
    var rb = val("ch-rb"), key = pick("ch-rate"), k = val("ch-k"), alpha = val("ch-alpha");
    var rates = { "1": 1, "4/7": 4 / 7, "1/2": 0.5, "3/4": 0.75, "5/6": 5 / 6 };
    var R = rates[key], rc, rs, B, eta, kr, krdb, h, flow, i;
    if (!(R > 0) || !(k > 0)) { put("chain-output", "<p>參數不適用。</p>"); return; }
    rc = rb / R; rs = rc / k; B = (1 + alpha) * rs;
    if (!(B > 0)) { put("chain-output", "<p>頻寬分母必須大於 0。</p>"); return; }
    eta = rb / B; kr = k * R; krdb = db10(kr);
    h = table2("位元、符元與頻寬帳本", [
      ["編碼後位元率 R<sub>c</sub>", num6(rc) + " kbit/s"], ["符元率 R<sub>s</sub>", num6(rs) + " kbaud"],
      ["頻寬 B", num6(B) + " kHz"], ["頻譜效率 η", num6(eta) + " bit/s/Hz"],
      ["kR", num6(kr) + "（" + num6(krdb) + " dB）"]
    ]);
    flow = [["訊源編碼","壓縮資訊","資訊理論"],["通道編碼","加入冗餘","08–09"],["交錯","打散突發錯誤","10"],
      ["調變","位元變成星座點","01–04"],["脈衝整形","限制頻譜","通訊系統 07"],["上變頻","搬到載波","射頻"],
      ["天線","電訊號變電磁波","天線課"],["通道","加入衰減、多徑與干擾","06–07"],["下變頻","搬回基頻","射頻"],
      ["匹配濾波","集中位元能量","通訊系統 08"],["同步","對準載波與時序","05"],["等化","抵消拖尾","06–07"],
      ["解調與判決","選最近的合法點","03"],["解交錯","還原位元順序","10"],["通道解碼","利用冗餘救錯","08–09"],["訊源解碼","還原資訊","資訊理論"]];
    h += "<table><caption>收發鏈</caption>" + row(["方塊", "工作", "去處"], true);
    for (i = 0; i < flow.length; i += 1) { h += row(flow[i]); }
    h += "</table><p><strong>判讀</strong>：目前頻譜效率是 " + num6(eta) + " bit/s/Hz。</p>";
    if (alpha === 0) { h += "<p><strong>邊界</strong>：α ＝ 0 是理想 sinc 脈衝，頻寬最小但不可實現（時域無限長）。</p>"; }
    if (eta >= 4) { h += "<p>頻譜效率這麼高要靠高階星座，第 04 章會看到它要多付幾 dB。</p>"; }
    if (R < 1) { h += "<p>編碼讓符元率乘 1 / R，頻寬跟著變寬：編碼增益是用頻寬換來的。</p>"; }
    if (rb === 10) { h += "<p><strong>邊界</strong>：10 kbit/s 是遙測與感測器的量級。</p>"; }
    if (rb === 10000 && k === 8 && Math.abs(R - 5 / 6) < 1e-12) { h += "<p><strong>邊界</strong>：這是 Wi-Fi 單一空間流的量級。</p>"; }
    if (alpha === 1) { h += "<p><strong>邊界</strong>：頻寬翻倍，但時域拖尾最短，對時序誤差最寬容。</p>"; }
    h += "<p><strong>為什麼</strong>：位元率、編碼率、每符元位元數、滾降係數四個數決定頻寬，這是同一本帳。</p>";
    put("chain-output", h);
  };
  bind(ids, draw); draw();
}

function sigspace() {
  if (!$("ss-e1")) { return; }
  var ids = ["ss-e1", "ss-e2", "ss-rho", "ss-n0"];
  var draw = function () {
    var e1 = val("ss-e1"), e2 = val("ss-e2"), rho = val("ss-rho"), n0 = val("ss-n0"), ip, d2, d, x1, x2, y2, eb, ratio, arg, pe, h;
    if (!(e1 >= 0) || !(e2 >= 0) || !(n0 > 0)) { put("sigspace-output", "<p>能量不可為負，N<sub>0</sub> 必須大於 0。</p>"); return; }
    ip = rho * Math.sqrt(e1 * e2); d2 = Math.max(e1 + e2 - 2 * ip, 0); d = Math.sqrt(d2);
    x1 = Math.sqrt(e1); x2 = rho * Math.sqrt(e2); y2 = Math.sqrt(Math.max(e2 * (1 - rho * rho), 0));
    eb = (e1 + e2) / 2; ratio = eb / n0; arg = d / Math.sqrt(2 * n0); pe = Q(arg);
    h = table2("訊號空間計算", [["內積", num6(ip)], ["d²", num6(d2)], ["d", num6(d)],
      ["s<sub>1</sub> 座標", "(" + num6(x1) + ", 0.000000)"], ["s<sub>2</sub> 座標", "(" + num6(x2) + ", " + num6(y2) + ")"],
      ["E<sub>b</sub>", num6(eb)], ["E<sub>b</sub>/N<sub>0</sub>", num6(db10(ratio)) + " dB"], ["Q 引數", num6(arg)], ["P<sub>e</sub>", sci(pe)]]);
    if (rho === -1) { h += "<p><strong>判讀</strong>：反極性：同樣的能量下距離最大，等能量時 d² ＝ 4E。</p>"; }
    else if (rho === 0) { h += "<p><strong>判讀</strong>：正交：等能量時 d² ＝ 2E，比反極性差 3.010300 dB。</p>"; }
    else if (rho === 1 && e1 === e2) { h += "<p><strong>判讀</strong>：兩個訊號完全一樣，d ＝ 0，接收機只能猜。</p>"; }
    else if (rho > 0) { h += "<p><strong>判讀</strong>：正相關把兩點拉近，這是浪費能量。</p>"; }
    else { h += "<p><strong>判讀</strong>：負相關把兩點拉遠，誤判機率隨之降低。</p>"; }
    if (d === 0) { h += "<p><strong>邊界</strong>：兩點重合，P<sub>e</sub> ＝ " + sci(0.5) + "。</p>"; }
    if (n0 === 2 && e1 === 1 && e2 === 1) { h += "<p><strong>邊界</strong>：E<sub>b</sub>/N<sub>0</sub> ＝ −3.010300 dB，約每 6 個位元錯 1 個。</p>"; }
    if (e1 !== e2 && rho === -1) { h += "<p><strong>邊界</strong>：兩點不在原點兩側對稱，但距離仍是 √E<sub>1</sub> + √E<sub>2</sub>。</p>"; }
    h += "<p><strong>為什麼</strong>：誤判機率只由兩點距離除以雜訊標準差決定；能量與相關係數都是透過 d 起作用。</p>";
    put("sigspace-output", h);
  };
  bind(ids, draw); draw();
}

function maryCalc(key, map, ebn0) {
  var c = CONS[key], g = undb(ebn0), dmin, esn0, sigma, arg, q, raw, ps, H, pb;
  if (!c || !(g > 0) || !(c.k > 0) || !(c.eavg > 0)) { return null; }
  dmin = key.indexOf("qam") === 0 ? 2 / Math.sqrt(c.eavg) : 2 * Math.sin(Math.PI / c.M);
  esn0 = c.k * g; sigma = Math.sqrt(1 / (2 * esn0)); arg = dmin / (2 * sigma); q = Q(arg); raw = c.navg * q;
  ps = Math.min(1, raw); H = map === "gray" ? c.hgray : c.hnat; pb = Math.min(0.5, ps * H / c.k);
  return { c: c, dmin: dmin, esn0: esn0, sigma: sigma, arg: arg, q: q, raw: raw, ps: ps, H: H, pb: pb };
}
function mary() {
  if (!$("ma-scheme")) { return; }
  var ids = ["ma-scheme", "ma-map", "ma-ebn0"];
  var draw = function () {
    var key = pick("ma-scheme"), map = pick("ma-map"), ebn0 = val("ma-ebn0"), r = maryCalc(key, map, ebn0), papr, h, keys, i, x;
    if (!r) { put("mary-output", "<p>星座參數不適用。</p>"); return; }
    papr = r.c.epeak / r.c.eavg;
    h = table2("星座距離與誤判帳本", [["M、k", int0(r.c.M) + "、" + int0(r.c.k)], ["E<sub>avg</sub>、E<sub>peak</sub>", num6(r.c.eavg) + "、" + num6(r.c.epeak)],
      ["PAPR", num6(papr) + "（" + num6(db10(papr)) + " dB）"], ["d<sub>min</sub>", num6(r.dmin)], ["N<sub>avg</sub>", num6(r.c.navg)], ["H", num6(r.H)],
      ["E<sub>s</sub>/N<sub>0</sub>", num6(r.esn0)], ["σ", num6(r.sigma)], ["d<sub>min</sub> / (2σ)", num6(r.arg)], ["Q", sci(r.q)], ["P<sub>s</sub>", sci(r.ps)], ["P<sub>b</sub>", sci(r.pb)]]);
    keys = ["bpsk", "qpsk", "psk8", "psk16", "qam16", "qam64", "qam256"];
    h += "<table><caption>七種星座在同一條件下</caption>" + row(["星座", "P<sub>b</sub>"], true);
    for (i = 0; i < keys.length; i += 1) { x = maryCalc(keys[i], map, ebn0); h += row([CONS[keys[i]].name, sci(x.pb)]); }
    h += "</table><p><strong>判讀</strong>：目前 " + r.c.name + " 的 P<sub>b</sub> 為 " + sci(r.pb) + "。</p>";
    if (key === "psk16") { h += "<p>同樣 16 點，圓周上的 d<sub>min</sub> 只有方陣的 1 / 1.620930，差 4.195285 dB。</p>"; }
    if (map === "natural") { h += "<p>自然二進位讓一次符元錯誤平均錯 " + num6(r.H) + " 個位元，P<sub>b</sub> 是 Gray 的 H 倍。</p>"; }
    if (r.raw > 1) { h += "<p><strong>邊界</strong>：最近鄰近似算出超過 1，已夾成 1；近似只在高 E<sub>b</sub>/N<sub>0</sub> 準。</p>"; }
    if (db10(papr) > 3) { h += "<p>峰均功率比超過 3 dB，功率放大器要留更多線性餘裕。</p>"; }
    if (map === "gray" && key === "bpsk") { h += "<p><strong>邊界</strong>：BPSK 的 Gray 與自然二進位沒有差別。</p>"; }
    if (map === "gray" && key === "qpsk") { h += "<p><strong>邊界</strong>：QPSK 改用自然二進位後，P<sub>b</sub> 會變成 1.5 倍。</p>"; }
    h += "<p><strong>為什麼</strong>：點越多，同樣的平均能量要分給越多點，最近兩點就越近；誤判只看 d<sub>min</sub> 除以 2σ。</p>";
    put("mary-output", h);
  };
  bind(ids, draw); draw();
}

function mapml() {
  if (!$("ml-p1")) { return; }
  var ids = ["ml-p1", "ml-ebn0", "ml-rule"];
  var draw = function () {
    var p1 = val("ml-p1"), ebn0 = val("ml-ebn0"), rule = pick("ml-rule"), p0 = 1 - p1, g = undb(ebn0), n0, s2, s, lr, gm, gamma, peml, pemap, pe, guess, gain, h;
    if (!(p1 > 0 && p1 < 1) || !(g > 0)) { put("mapml-output", "<p>先驗機率與能量比不適用。</p>"); return; }
    n0 = 1 / g; s2 = n0 / 2; s = Math.sqrt(s2); lr = Math.log(p0 / p1); gm = s2 / 2 * lr; gamma = rule === "ml" ? 0 : gm;
    peml = Q(1 / s); pemap = p1 * Q((1 - gm) / s) + p0 * Q((1 + gm) / s); pe = rule === "ml" ? peml : pemap; guess = Math.min(p0, p1); gain = pemap > 0 ? peml / pemap : 0;
    h = "<p>目前用的是 " + (rule === "ml" ? "ML" : "MAP") + " 規則。</p>" + table2("ML 與 MAP", [["N<sub>0</sub>", num6(n0)], ["σ", num6(s)],
      ["ln(P<sub>0</sub> / P<sub>1</sub>)", num6(lr)], ["γ<sub>MAP</sub>", num6(gm)], ["實際門檻", num6(gamma)], ["本規則 P<sub>e</sub>", sci(pe)],
      ["P<sub>e</sub>(ML)", sci(peml)], ["P<sub>e</sub>(MAP)", sci(pemap)], ["ML / MAP", num6(gain) + " 倍"], ["只猜先驗大的錯誤率", sci(guess)]]);
    if (p1 === 0.5) { h += "<p><strong>判讀</strong>：先驗相等，MAP 與 ML 完全一樣。</p>"; }
    else if (rule === "ml") { h += "<p><strong>判讀</strong>：你忽略了先驗，錯誤率是 MAP 的 " + num6(gain) + " 倍。</p>"; }
    else { h += "<p><strong>判讀</strong>：MAP 把門檻移到 " + num6(gm) + "，錯誤率比 ML 低。</p>"; }
    if (Math.abs(gm) > 1) { h += "<p><strong>邊界</strong>：門檻已推到某個訊號點之外；能量比太低，先驗幾乎主導判決。</p>"; }
    if (ebn0 >= 10) { h += "<p><strong>邊界</strong>：高能量比時似然比先驗陡得多，MAP 只比 ML 好一點點。</p>"; }
    h += "<p><strong>為什麼</strong>：MAP 把門檻往少見的那個訊號推，用多錯一點常見訊號換少錯很多少見訊號。</p>";
    put("mapml-output", h);
  };
  bind(ids, draw); draw();
}

function berArg(scheme, g) {
  if (scheme === "bpsk") { return "√(2γ<sub>b</sub>) ＝ " + num6(Math.sqrt(2 * g)); }
  if (scheme === "psk8") { return num6(Math.sqrt(6 * g) * Math.sin(Math.PI / 8)); }
  if (scheme === "psk16") { return num6(Math.sqrt(8 * g) * Math.sin(Math.PI / 16)); }
  if (scheme === "qam16") { return num6(Math.sqrt(12 * g / 15)); }
  if (scheme === "qam64") { return num6(Math.sqrt(18 * g / 63)); }
  if (scheme === "qam256") { return num6(Math.sqrt(24 * g / 255)); }
  if (scheme === "dpsk") { return "exp(−γ<sub>b</sub>)"; }
  if (scheme === "ncfsk") { return "exp(−γ<sub>b</sub> / 2)"; }
  return "√γ<sub>b</sub> ＝ " + num6(Math.sqrt(g));
}
function berfam() {
  if (!$("bf-scheme")) { return; }
  var ids = ["bf-scheme", "bf-ebn0", "bf-target", "bf-n"];
  var draw = function () {
    var scheme = pick("bf-scheme"), ebn0 = val("bf-ebn0"), target = Number(pick("bf-target")), N = val("bf-n"), g = undb(ebn0), pb = berOf(scheme, g), errs = N * pb;
    var req = reqEbN0(scheme, target), reqb = reqEbN0("bpsk", target), gap = req - reqb, h, i, s, p, r;
    h = "<p>這個方案的公式是 " + berArg(scheme, g) + "。</p>" + table2("目前方案", [["線性 γ<sub>b</sub>", num6(g)], ["Q 引數或指數", berArg(scheme, g)],
      ["P<sub>b</sub>", sci(pb)], ["期望錯誤數", sci(errs)], ["所需 E<sub>b</sub>/N<sub>0</sub>", num6(req) + " dB"], ["相對 BPSK", num6(gap) + " dB"]]);
    h += "<table><caption>九方案對照</caption>" + row(["方案", "P<sub>b</sub>", "所需 dB", "相對 BPSK"], true);
    for (i = 0; i < SCHEMES.length; i += 1) { s = SCHEMES[i]; p = berOf(s, g); r = reqEbN0(s, target); h += row([SCHEME_NAME[s], sci(p), num6(r), num6(r - reqb)]); }
    h += "</table>";
    if (pb < 1e-5) { h += "<p><strong>判讀</strong>：良好，未編碼就可用。</p>"; }
    else if (pb < 1e-3) { h += "<p><strong>判讀</strong>：需要通道編碼（08–09 章）。</p>"; }
    else { h += "<p><strong>判讀</strong>：這個 E<sub>b</sub>/N<sub>0</sub> 下 " + SCHEME_NAME[scheme] + " 幾乎不可用。</p>"; }
    if (ebn0 < req) { h += "<p>離目標還差 " + num6(req - ebn0) + " dB。</p>"; } else { h += "<p>已超過目標 " + num6(ebn0 - req) + " dB。</p>"; }
    if (scheme === "dpsk") { h += "<p>差分判讀拿帶雜訊的前一個符元當參考，高能量比只差 0.754325 dB，低能量比差更多。</p>"; }
    if (scheme === "ncfsk") { h += "<p>不用相位就要付引數減半的代價。</p>"; }
    if (ebn0 === 0) { h += "<p><strong>邊界</strong>：BPSK 約每 13 個位元錯 1 個。</p>"; }
    if (ebn0 === 20 && scheme === "bpsk") { h += "<p><strong>邊界</strong>：P<sub>b</sub> 在 10<sup>−45</sup> 量級，實務上量不到。</p>"; }
    if (errs < 1) { h += "<p><strong>邊界</strong>：傳這麼多位元，期望連 1 個錯都不到。</p>"; }
    h += "<p><strong>為什麼</strong>：除了兩條指數式，每一條公式都是 d<sub>min</sub> / (2σ) 代進 Q 函數再修正位元數。</p>";
    put("berfam-output", h);
  };
  bind(ids, draw); draw();
}

function phase() {
  if (!$("ph-scheme")) { return; }
  var ids = ["ph-scheme", "ph-ebn0", "ph-phi", "ph-df"];
  var draw = function () {
    var scheme = pick("ph-scheme"), ebn0 = val("ph-ebn0"), deg = val("ph-phi"), df = val("ph-df"), g = undb(ebn0), a = Math.sqrt(2 * g), phi = deg * Math.PI / 180;
    var c = Math.cos(phi), s = Math.sin(phi), boundary, eff, pb, px, py, pb0 = Q(a), loss, rot = 360 * df / 1000, cross, h;
    if (scheme === "bpsk") { boundary = 90; eff = c; pb = Q(a * c); px = c; py = s; }
    else { boundary = 45; eff = c - Math.abs(s); pb = 0.5 * (Q(a * (c - s)) + Q(a * (c + s))); px = Math.cos(Math.PI / 4 + phi); py = Math.sin(Math.PI / 4 + phi); }
    loss = eff > 1e-9 ? -20 * Math.log(eff) / Math.LN10 : 0; cross = rot > 0 ? Math.floor(Math.max(0, boundary - Math.abs(deg)) / rot) : 0;
    h = "<p>這個模式的判決邊界在 ±" + int0(boundary) + "°；Δf/R<sub>s</sub> 只影響相位漂移那兩列，其餘計算不受它影響。</p>";
    h += table2("相位誤差", [["√(2γ<sub>b</sub>)", num6(a)], ["無誤差 P<sub>b</sub>", sci(pb0)], ["旋轉後代表點", "(" + num6(px) + ", " + num6(py) + ")"],
      ["最壞軸有效距離", num6(Math.max(eff, 0))], ["P<sub>b</sub>", sci(pb)], ["等效損失", eff > 1e-9 ? num6(loss) + " dB" : "不適用（距離為 0）"],
      ["每符元相位增量", num6(rot) + "°"], ["跨界所需符元數", rot > 0 ? int0(cross) : "不漂移"]]);
    if (Math.abs(deg) >= boundary) { h += "<p><strong>判讀</strong>：相位誤差已到判決邊界，一軸距離歸零，P<sub>b</sub> 掉到 " + (scheme === "qpsk" ? "0.25" : "0.5") + "。</p>"; }
    else if (scheme === "qpsk" && Math.abs(deg) > 0) { h += "<p><strong>判讀</strong>：同樣的 φ，QPSK 的損失是 BPSK 的好幾倍，因為它的邊界只有 45°。</p>"; }
    else { h += "<p><strong>判讀</strong>：目前仍在判決邊界內。</p>"; }
    if (loss > 1 && eff > 1e-9) { h += "<p>損失超過 1 dB，載波迴路必須把殘餘相位壓到 5° 以內。</p>"; }
    if (rot > 0 && cross <= 10) { h += "<p><strong>邊界</strong>：不到 10 個符元就會跨界；頻率偏移必須先估出來修正，相位迴路才追得上。</p>"; }
    if (deg === 0) { h += "<p><strong>邊界</strong>：相位損失為 0.000000 dB。</p>"; }
    if (df === 0) { h += "<p><strong>邊界</strong>：相位不漂移。</p>"; }
    h += "<p><strong>為什麼</strong>：相位誤差不改變雜訊，它把訊號點往判決邊界轉，縮短的是距離。</p>";
    put("phase-output", h);
  };
  bind(ids, draw); draw();
}

function eq() {
  if (!$("eq-a")) { return; }
  var ids = ["eq-a", "eq-snr"];
  var draw = function () {
    var a = val("eq-a"), snr = val("eq-snr"), s2 = Math.pow(10, -snr / 10), den = 1 - a * a, sinr0, ne, zf, c, b, root, mse, mmse, taps, sum = 0, i, h;
    if (!(den > 0) || !(s2 > 0)) { put("eq-output", "<p>計算分母必須大於 0。</p>"); return; }
    sinr0 = 1 / (a * a + s2); ne = 1 / den; zf = 1 / (s2 * ne); c = 1 + a * a + s2; b = 2 * a; root = c * c - b * b;
    if (!(root > 0)) { put("eq-output", "<p>MMSE 根號內必須大於 0。</p>"); return; }
    mse = s2 / Math.sqrt(root); mmse = 1 / mse - 1; taps = [1, -a, a * a, -a * a * a, a * a * a * a];
    for (i = 0; i < taps.length; i += 1) { sum += taps[i] * taps[i]; }
    h = table2("ZF 與 MMSE", [["σ²", num6(s2)], ["不等化 SINR", num6(sinr0) + "（" + num6(db10(sinr0)) + " dB）"],
      ["NE<sub>ZF</sub>", num6(ne) + "（" + num6(db10(ne)) + " dB）"], ["ZF 輸出 SNR", num6(zf) + "（" + num6(db10(zf)) + " dB）"],
      ["前 5 個抽頭", taps.map(num6).join("、")], ["抽頭平方和", num6(sum)], ["MMSE 的 MSE", num6(mse)],
      ["MMSE 輸出 SNR", num6(mmse) + "（" + num6(db10(mmse)) + " dB）"], ["MMSE 比 ZF 多", num6(db10(mmse) - db10(zf)) + " dB"]]);
    if (a >= 0.9) { h += "<p><strong>判讀</strong>：通道在 θ ＝ π 附近幾乎是零，ZF 把那裡的雜訊放大 " + num6(ne) + " 倍，MMSE 選擇不硬拉。</p>"; }
    else if (a === 0) { h += "<p><strong>判讀</strong>：沒有 ISI，三種數字相同。</p>"; }
    else { h += "<p><strong>判讀</strong>：MMSE 比 ZF 多保留 " + num6(db10(mmse) - db10(zf)) + " dB。</p>"; }
    if (snr <= 3) { h += "<p><strong>邊界</strong>：低 SNR 時 ZF 可能比不等化還差，因為放大的雜訊比消掉的 ISI 多。</p>"; }
    if (snr >= 25) { h += "<p><strong>邊界</strong>：高 SNR 時 MMSE 趨近 ZF，兩者只差不到 0.1 dB。</p>"; }
    h += "<p><strong>為什麼</strong>：等化器把通道反轉；哪個頻率壓得越低，反轉時就拉得越高，雜訊也一起被拉高。</p>";
    put("eq-output", h);
  };
  bind(ids, draw); draw();
}

function lms() {
  if (!$("lm-mu")) { return; }
  var ids = ["lm-mu", "lm-a", "lm-taps", "lm-iter"];
  var draw = function () {
    var mu = val("lm-mu"), a = val("lm-a"), L = val("lm-taps"), N = val("lm-iter"), Pu = 1 + a * a, den = L * Pu, bound, r, h, marks, i, n, ideal, verdict;
    if (!(den > 0)) { put("lms-output", "<p>上界分母必須大於 0。</p>"); return; }
    bound = 2 / den; r = lmsRun(mu, a, L, N);
    if (r.divergedAt) { verdict = "發散於第 " + int0(r.divergedAt) + " 次"; }
    else if (r.mseLast < 0.01) { verdict = "已收斂"; }
    else { verdict = "未收斂"; }
    h = table2("LMS 判定", [["P<sub>u</sub>", num6(Pu)], ["教科書上界", num6(bound)], ["μ 佔上界", num6(mu / bound * 100) + " %"], ["判定", verdict]]);
    marks = [1, 10, 20, 50, 100, 200, 500]; h += "<table><caption>學習曲線</caption>" + row(["迭代", "e²"], true);
    for (i = 0; i < marks.length; i += 1) { n = marks[i]; if (n <= N) { h += row([int0(n), r.divergedAt && n >= r.divergedAt ? "—" : (r.curve[n] === undefined ? "—" : num6(r.curve[n]))]); } }
    h += row(["前 31 次平均", num6(r.mseFirst)]) + row(["最後 31 次平均", num6(r.mseLast)]) + "</table>";
    h += "<table><caption>抽頭與 ZF 理想值</caption>" + row(["抽頭", "LMS", "理想值"], true);
    for (i = 0; i < L; i += 1) { ideal = Math.pow(-a, i); h += row(["w<sub>" + int0(i) + "</sub>", r.divergedAt ? "—" : num6(r.w[i]), num6(ideal)]); }
    h += "</table>";
    if (r.divergedAt) { h += "<p><strong>判讀</strong>：發散：e² 在第 " + int0(r.divergedAt) + " 次超過 10<sup>6</sup>，步長太大。</p>"; }
    else if (r.mseLast < 0.01) { h += "<p><strong>判讀</strong>：已收斂。</p>"; }
    else { h += "<p><strong>判讀</strong>：未收斂：太慢（μ 小）或震盪（μ 接近上界），試著調 μ 或加迭代。</p>"; }
    if (mu >= bound) { h += "<p>μ 已超過教科書上界。</p>"; }
    else if (mu >= bound / 2) { h += "<p>μ 接近上界，固定訓練序列下會劇烈震盪；上界不是保證。</p>"; }
    if (a >= 0.8 && L <= 5) { h += "<p>理想抽頭 (−a)<sup>L−1</sup> 還不夠小，抽頭數不夠長，收斂了也消不乾淨。</p>"; }
    if (a === 0) { h += "<p><strong>邊界</strong>：理想抽頭為 1、0、0、…，很快收斂。</p>"; }
    if (mu === 0.005 && N === 50) { h += "<p><strong>邊界</strong>：步長很小且只跑 50 次，幾乎沒動。</p>"; }
    h += "<p><strong>為什麼</strong>：每一步都把抽頭往誤差變小的方向推 μ × e × u；μ 決定一步跨多大，跨太大就跳過谷底。</p>";
    put("lms-output", h);
  };
  bind(ids, draw); draw();
}

function hamming() {
  if (!$("hm-msg")) { return; }
  var ids = ["hm-msg", "hm-e1", "hm-e2", "hm-ebn0"];
  var draw = function () {
    var ms = pick("hm-msg"), m = ms.split("").map(Number), e1 = val("hm-e1"), e2 = val("hm-e2"), ebn0 = val("hm-ebn0");
    var c = hamEncode(m), r = c.slice(), syn, pos, cor, dec, ok, actual = 0, i, g = undb(ebn0), rate = 4 / 7, p, pw = 0, pbc = 0, pbu, term, ratio, h, status;
    if (e1 > 0) { r[e1 - 1] ^= 1; } if (e2 > 0) { r[e2 - 1] ^= 1; }
    for (i = 0; i < 7; i += 1) { if (r[i] !== c[i]) { actual += 1; } }
    syn = hamSyndrome(r); pos = SYN2POS[syn]; cor = r.slice(); if (pos > 0) { cor[pos - 1] ^= 1; }
    dec = cor.slice(0, 4); ok = bits(dec) === ms; p = Q(Math.sqrt(2 * rate * g));
    for (i = 2; i <= 7; i += 1) { term = comb(7, i) * Math.pow(p, i) * Math.pow(1 - p, 7 - i); pw += term; pbc += (i + 1) / 7 * term; }
    pbu = Q(Math.sqrt(2 * g)); ratio = pbc > 0 ? pbu / pbc : 0;
    status = ok ? "正確" : (syn !== "000" ? "誤糾" : "偵測到但無法糾");
    h = table2("編碼與症狀", [["p<sub>1</sub>", int0(c[4])], ["p<sub>2</sub>", int0(c[5])], ["p<sub>3</sub>", int0(c[6])], ["碼字", grouped(c)],
      ["接收字", grouped(r)], ["症狀", syn], ["指向位置", int0(pos)], ["糾正後", grouped(cor)], ["解碼訊息", bits(dec)], ["判定", status]]);
    h += table2("硬判讀效能", [["E<sub>c</sub>/N<sub>0</sub>", num6(ebn0 + db10(rate)) + " dB"], ["交叉機率 p", sci(p)], ["字錯誤率 P<sub>w</sub>", sci(pw)],
      ["編碼後 P<sub>b</sub>", sci(pbc)], ["未編碼 P<sub>b</sub>", sci(pbu)], ["未編碼 / 編碼", num6(ratio) + " 倍"]]);
    if (actual === 0) { h += "<p><strong>判讀</strong>：症狀 000：沒有錯，或錯得剛好是另一個碼字（本實驗不會發生）。</p>"; }
    else if (actual === 1) { h += "<p><strong>判讀</strong>：症狀就是 H 的第 " + int0(pos) + " 行，直接指出位置。</p>"; }
    else { h += "<p><strong>判讀</strong>：兩行相加等於第 " + int0(pos) + " 行，解碼器翻錯位元；誤糾後的訊息是錯的。</p>"; }
    if (pbc > pbu) { h += "<p>這個 E<sub>b</sub>/N<sub>0</sub> 下編碼反而更糟：每個編碼位元只分到 4 / 7 的能量，交叉機率變大，短碼救不回來。</p>"; }
    else { h += "<p>編碼好 " + num6(ratio) + " 倍，但 (7,4) 在 10<sup>−5</sup> 只賺 0.413375 dB。</p>"; }
    if (e1 === e2 && e1 !== 0) { h += "<p><strong>邊界</strong>：同一位置翻兩次等於沒翻。</p>"; }
    h += "<p><strong>為什麼</strong>：d<sub>min</sub> ＝ 3 的碼，任兩個碼字至少差 3 位；1 個錯離原碼字最近，2 個錯離另一個碼字更近。</p>";
    put("hamming-output", h);
  };
  bind(ids, draw); draw();
}

function viterbi() {
  if (!$("vt-msg")) { return; }
  var ids = ["vt-msg", "vt-e1", "vt-e2", "vt-e3"];
  var draw = function () {
    var ms = pick("vt-msg"), m6 = ms.split("").map(Number); m6.push(0); m6.push(0);
    var c = convEncode(m6), r = c.slice(), es = [val("vt-e1"), val("vt-e2"), val("vt-e3")], i, j, actual = 0, d, ok, h, st = 0, s1, s2, u, c1, c2, ns, trans = [], enc = [], seen = {};
    for (i = 0; i < es.length; i += 1) { if (es[i] > 0) { r[es[i] - 1] ^= 1; seen[es[i]] = (seen[es[i]] || 0) + 1; } }
    for (i = 0; i < 12; i += 1) { if (r[i] !== c[i]) { actual += 1; } }
    d = viterbiDecode(r); ok = bits(d.dec.slice(0, 4)) === ms;
    for (st = 0; st < 4; st += 1) { s1 = st >> 1; s2 = st & 1; for (u = 0; u <= 1; u += 1) { c1 = u ^ s1 ^ s2; c2 = u ^ s2; ns = (u << 1) | s1; trans.push([(s1 + "" + s2), int0(u), c1 + "" + c2, ((ns >> 1) + "" + (ns & 1))]); } }
    h = "<table><caption>狀態轉移</caption>" + row(["目前", "輸入", "輸出", "下一個"], true); for (i = 0; i < trans.length; i += 1) { h += row(trans[i]); } h += "</table>";
    st = 0; h += "<table><caption>逐級編碼</caption>" + row(["級", "輸入", "目前", "輸出", "下一個"], true);
    for (i = 0; i < m6.length; i += 1) { s1 = st >> 1; s2 = st & 1; u = m6[i]; c1 = u ^ s1 ^ s2; c2 = u ^ s2; ns = (u << 1) | s1; enc = [int0(i + 1), int0(u), s1 + "" + s2, c1 + "" + c2, (ns >> 1) + "" + (ns & 1)]; h += row(enc); st = ns; }
    h += "</table><p>接收序列：" + grouped(r) + "</p><table><caption>Viterbi 路徑度量</caption>" + row(["級", "00", "01", "10", "11"], true);
    for (i = 0; i < d.table.length; i += 1) { enc = [int0(i + 1)]; for (j = 0; j < 4; j += 1) { enc.push(d.table[i][j] >= 1e9 ? "—" : int0(d.table[i][j])); } h += row(enc); }
    h += "</table>" + table2("回溯結果", [["輸入序列", bits(d.dec)], ["訊息", bits(d.dec.slice(0, 4))], ["判定", ok ? "正確" : "錯誤"], ["最終度量", int0(d.finalMetric)]]);
    if (actual <= 2) { h += "<p><strong>判讀</strong>：d<sub>free</sub> ＝ 5 保證任兩條路徑至少差 5 位，2 個錯以內一定解對。</p>"; }
    else if (ok) { h += "<p><strong>判讀</strong>：3 個錯超出保證，但這個圖樣剛好離正確路徑仍最近。</p>"; }
    else { h += "<p><strong>判讀</strong>：3 個錯讓另一條路徑更近；最終度量 " + int0(d.finalMetric) + " 小於或等於真實錯誤數 3，解碼器忠實地選了最近的合法序列。</p>"; }
    for (i in seen) { if (seen.hasOwnProperty(i) && seen[i] > 1) { h += "<p><strong>邊界</strong>：重複位置互相抵消。</p>"; break; } }
    if (ms === "0000" && actual === 0) { h += "<p><strong>邊界</strong>：全零訊息沿著全零路徑返回狀態 00。</p>"; }
    h += "<p><strong>為什麼</strong>：Viterbi 不是猜，它在所有合法序列裡挑漢明距離最小的一條；每級只留最短存活路徑，因為後面的路對它們一視同仁。</p>";
    put("viterbi-output", h);
  };
  bind(ids, draw); draw();
}

function interleave() {
  if (!$("il-depth")) { return; }
  var ids = ["il-depth", "il-burst", "il-start"];
  var draw = function () {
    var D = val("il-depth"), b = val("il-burst"), start = val("il-start"), r = interleaveRun(D, b, start), h, i, j, t, hit, maxPer = Math.ceil(b / D);
    h = table2("交錯摘要", [["發射串長 L", int0(r.L) + " 位元"], ["實際命中", int0(r.hits) + " 位元"], ["單端延遲", int0(r.L) + " 位元"], ["b ≤ D", b <= D ? "成立" : "不成立"], ["各碼字錯誤數", r.errs.map(int0).join("、")]]);
    h += "<table><caption>每個碼字的錯誤數</caption>" + row(["碼字", "交錯後", "可救回", "未交錯", "可救回"], true);
    for (i = 0; i < D; i += 1) { h += row([int0(i + 1), int0(r.errs[i]), r.errs[i] <= 1 ? "是" : "否", int0(r.errs0[i]), r.errs0[i] <= 1 ? "是" : "否"]); }
    h += "</table><table><caption>命中矩陣</caption>" + row(["碼字", "1", "2", "3", "4", "5", "6", "7"], true);
    for (i = 0; i < D; i += 1) { var cells = [int0(i + 1)]; for (j = 0; j < 7; j += 1) { t = j * D + i + 1; hit = t >= start && t <= start + b - 1 && t <= r.L; cells.push(hit ? "×" : "·"); } h += row(cells); }
    h += "</table>";
    if (b <= D) { h += "<p><strong>判讀</strong>：突發長度不超過深度，每個碼字最多挨 1 個，(7,4) 漢明碼全部救回。</p>"; }
    else if (r.fail > 0) { h += "<p><strong>判讀</strong>：突發超過深度，⌈b / D⌉ ＝ " + int0(maxPer) + " 個錯擠進同一碼字，救不回 " + int0(r.fail) + " 個。</p>"; }
    else { h += "<p><strong>判讀</strong>：這次實際命中太短，所有碼字仍可救回。</p>"; }
    if (start + b - 1 > r.L && start <= r.L) { h += "<p><strong>邊界</strong>：突發被發射串尾截斷，只打到 " + int0(r.hits) + " 個位元。</p>"; }
    if (D >= 8) { h += "<p><strong>邊界</strong>：深度加倍，延遲也加倍；D × 7 ＝ " + int0(r.L) + " 個位元。</p>"; }
    if (D === 1) { h += "<p><strong>邊界</strong>：深度 1 等於沒有交錯。</p>"; }
    if (start > r.L) { h += "<p><strong>邊界</strong>：起點在串外，沒有位元被打到。</p>"; }
    h += "<p><strong>為什麼</strong>：交錯不減少錯誤總數，只把連續錯誤分給不同碼字，讓每個碼字的錯誤數落回糾錯能力之內。</p>";
    put("interleave-output", h);
  };
  bind(ids, draw); draw();
}

function cdma() {
  if (!$("cd-sf")) { return; }
  var ids = ["cd-sf", "cd-users", "cd-js", "cd-ebn0", "cd-code"];
  var draw = function () {
    var N = val("cd-sf"), K = val("cd-users"), jsdb = val("cd-js"), ebn0 = val("cd-ebn0"), code = pick("cd-code"), g = undb(ebn0), js = undb(jsdb), heat, mai, jam, inv, geff, pb, otherMai, otherInv, other, otherPb, req = undb(7), kmax, gp, h, largest;
    if (!(N > 0) || !(g > 0) || !(req > 0)) { put("cdma-output", "<p>計算分母必須大於 0。</p>"); return; }
    heat = 1 / g; mai = code === "async" ? (K - 1) / N : 0; jam = js / N; inv = heat + mai + jam;
    if (!(inv > 0)) { put("cdma-output", "<p>倒數項總和必須大於 0。</p>"); return; }
    geff = 1 / inv; pb = Q(Math.sqrt(2 * geff)); otherMai = code === "async" ? 0 : (K - 1) / N; otherInv = heat + otherMai + jam; other = 1 / otherInv; otherPb = Q(Math.sqrt(2 * other));
    kmax = Math.max(0, Math.floor(1 + N * (1 / req - heat - jam))); gp = db10(N);
    h = code === "sync" ? "<p>這個模式只用到 N、J/S、E<sub>b</sub>/N<sub>0</sub>；用戶數不影響結果，因為同步 Walsh 碼互不干擾。</p>" : "<p>這個模式會用到全部控制；用戶數透過 MAI 改變結果。</p>";
    h += table2("CDMA 功率帳本", [["處理增益 G<sub>p</sub>", num6(gp) + " dB"], ["熱雜訊倒數項", num6(heat)], ["MAI 項", num6(mai)], ["干擾項", num6(jam)],
      ["γ<sub>eff</sub>", num6(geff) + "（" + num6(db10(geff)) + " dB）"], ["P<sub>b</sub>", sci(pb)], ["另一碼型 γ<sub>eff</sub>", num6(other) + "（" + num6(db10(other)) + " dB）"],
      ["另一碼型 P<sub>b</sub>", sci(otherPb)], ["K<sub>max</sub>（要求 7 dB）", int0(kmax)]]);
    largest = Math.max(heat, mai, jam);
    if (largest === jam) { h += "<p><strong>判讀</strong>：干擾主導；處理增益 " + num6(gp) + " dB 壓不住 J/S " + num6(jsdb) + " dB，要加展頻因子或濾波。</p>"; }
    else if (largest === mai) { h += "<p><strong>判讀</strong>：多用戶干擾主導；這是 CDMA 的容量極限，要靠功率控制與更長的碼。</p>"; }
    else { h += "<p><strong>判讀</strong>：熱雜訊主導，展頻沒有幫助也沒有損失。</p>"; }
    if (code === "sync") { h += "<p>同步正交碼把 MAI 歸零，但只有基地台下行做得到同步。</p>"; }
    if (kmax === 0) { h += "<p><strong>邊界</strong>：連單一用戶都達不到 7 dB。</p>"; }
    if (K === 1) { h += "<p><strong>邊界</strong>：只有一個用戶，兩種碼型結果相同。</p>"; }
    if (jsdb === 40 && N === 128) { h += "<p><strong>邊界</strong>：即使 N ＝ 128，40 dB 干擾仍壓不住。</p>"; }
    if (N === 4 && K === 64) { h += "<p><strong>邊界</strong>：MAI 高達 15.750000，判讀幾乎靠猜。</p>"; }
    h += "<p><strong>為什麼</strong>：展頻不省功率也不省頻寬，它把干擾攤薄 N 倍，用頻寬換抗干擾與多用戶。</p>";
    put("cdma-output", h);
  };
  bind(ids, draw); draw();
}

function ofdm() {
  if (!$("of-bw")) { return; }
  var ids = ["of-bw", "of-n", "of-cp", "of-tau", "of-k"];
  var draw = function () {
    var B = val("of-bw"), N = val("of-n"), cp = val("of-cp"), tau = val("of-tau"), k = val("of-k"), df, Tu, Tcp, Ts, free, eff, rate, papr, flat, cfo, h;
    if (!(B > 0) || !(N > 0)) { put("ofdm-output", "<p>頻寬與子載波數必須大於 0。</p>"); return; }
    df = B * 1000 / N; Tu = N / B; Tcp = Tu * cp; Ts = Tu + Tcp;
    if (!(Ts > 0) || !(df > 0)) { put("ofdm-output", "<p>時間與間距分母必須大於 0。</p>"); return; }
    free = tau <= Tcp + 1e-9; eff = Tu / Ts * 100; rate = N * k / Ts; papr = db10(N); flat = df * 1000 * tau * 1e-6; cfo = 1000 / (df * 1000) * 100;
    h = table2("OFDM 時間與頻率帳本", [["Δf", num6(df) + " kHz"], ["T<sub>u</sub>", num6(Tu) + " µs"], ["T<sub>cp</sub>", num6(Tcp) + " µs"],
      ["T<sub>u</sub> + T<sub>cp</sub>", num6(Ts) + " µs"], ["無 ISI", free ? "是" : "否"], ["效率", num6(eff) + " %"], ["原始位元率上限", num6(rate) + " Mbit/s"],
      ["最壞 PAPR", num6(papr) + " dB"], ["Δf × τ<sub>max</sub>", num6(flat)], ["1 kHz CFO 佔比", num6(cfo) + " %"]]);
    if (!free) { h += "<p><strong>判讀</strong>：τ<sub>max</sub> 超過 T<sub>cp</sub>；上一個符元的拖尾闖進 FFT 視窗，子載波不再正交，要加長 CP 或加大 N。</p>"; }
    else { h += "<p><strong>判讀</strong>：CP 蓋住最大延遲，FFT 視窗內沒有跨符元拖尾。</p>"; }
    if (free && Tcp - tau > Tu * 0.1) { h += "<p>CP 比需要的長很多，效率白付了。</p>"; }
    if (cfo >= 5) { h += "<p>1 kHz 的頻率偏移就佔子載波間距 " + num6(cfo) + " %，載波同步要比單載波系統嚴格得多。</p>"; }
    if (papr >= 30) { h += "<p>最壞 PAPR 超過 30 dB，功率放大器不可能留這麼多餘裕，實務靠削峰與編碼。</p>"; }
    if (flat >= 0.5) { h += "<p>Δf × τ<sub>max</sub> 不遠小於 1，單一子載波內的通道已不平坦，OFDM 的前提失效。</p>"; }
    if (tau === 0) { h += "<p><strong>邊界</strong>：無多徑，CP 純粹是負擔。</p>"; }
    if (tau === 10 && N === 64) { h += "<p><strong>邊界</strong>：N ＝ 64 時任何可選 CP 都不夠。</p>"; }
    if (B === 30.72 && N === 2048) { h += "<p><strong>邊界</strong>：Δf 是 15.000000 kHz；這裡 CP 選項不是 LTE 的 144 / 2048。</p>"; }
    h += "<p><strong>為什麼</strong>：循環字首把線性摺積變成圓形摺積，所以每個子載波只要除以一個複數；代價是 T<sub>cp</sub> 那段不載資料。</p>";
    put("ofdm-output", h);
  };
  bind(ids, draw); draw();
}

/* ---------- 5. 字典與自我檢核 ---------- */
function dictionary() {
  if (!$("term-search")) { return; }
  var draw = function () {
    var q = String(pick("term-search")).toLowerCase().trim(), cards = document.getElementsByClassName("term-card"), shown = 0, i, c, hay;
    for (i = 0; i < cards.length; i += 1) {
      c = cards[i]; hay = ((c.getAttribute("data-search") || "") + " " + (c.textContent || "")).toLowerCase();
      if (q === "" || hay.indexOf(q) !== -1) { c.removeAttribute("hidden"); shown += 1; } else { c.setAttribute("hidden", "hidden"); }
    }
    put("term-count", "顯示 " + int0(shown) + " / " + int0(cards.length) + " 張卡");
  };
  bind(["term-search"], draw); draw();
}

function selfcheck() {
  if (!$("quiz-reset")) { return; }
  var answered = {};
  var progress = function () {
    var n = 0, k; for (k in answered) { if (answered.hasOwnProperty(k) && answered[k]) { n += 1; } }
    put("quiz-progress", "已作答 " + int0(n) + " / " + int0(QUIZ.length) + " 題（僅供參考，不影響瀏覽）");
  };
  var link = function (id) {
    var ch = id.slice(1, 3), t = QUIZ_CH[ch]; if (!t) { return ""; }
    return "<p>回去看：<a href=\"" + t[0] + "\">" + t[1] + "</a></p>";
  };
  var makeCheck = function (q) {
    return function () {
      var node = $(q.id), raw, ok, v, right; if (!node) { return; } raw = node.value;
      if (raw === "" || raw === null) { put(q.id + "-output", "<p>" + (q.t === "num" ? "先填一個數字。" : "先選一個選項。") + "</p>"); answered[q.id] = false; progress(); return; }
      if (q.t === "num") { v = Number(raw); if (!isFinite(v)) { put(q.id + "-output", "<p>先填一個數字。</p>"); answered[q.id] = false; progress(); return; } ok = Math.abs(v - q.ans) <= q.tol; }
      else { ok = String(raw) === q.ans; }
      answered[q.id] = true;
      if (ok) { put(q.id + "-output", "<p><strong>答對</strong>　" + q.why + "</p>" + link(q.id)); }
      else { right = q.t === "num" ? "正確答案是 " + num6(q.ans).replace(/\.?0+$/, "") + "。" : "正確答案是選項 " + q.ans + "。"; put(q.id + "-output", "<p><strong>再看一次</strong>　" + right + q.why + "　" + q.err + "</p>" + link(q.id)); }
      progress();
    };
  };
  var i, q, btn, reset;
  for (i = 0; i < QUIZ.length; i += 1) { q = QUIZ[i]; btn = $(q.id + "-check"); if (btn) { btn.addEventListener("click", makeCheck(q)); } }
  reset = $("quiz-reset");
  if (reset) { reset.addEventListener("click", function () { var j, n; for (j = 0; j < QUIZ.length; j += 1) { n = $(QUIZ[j].id); if (n) { n.value = ""; } put(QUIZ[j].id + "-output", ""); answered[QUIZ[j].id] = false; } progress(); }); }
  progress();
}

/* ---------- 6. 註冊 ---------- */
if (typeof document !== "undefined") {
  [chain, sigspace, mary, mapml, berfam, phase, eq, lms, hamming, viterbi, interleave, cdma, ofdm, dictionary, selfcheck].forEach(function (f) { f(); });
}

/* ---------- 7. Node 匯出 ---------- */
if (typeof module !== "undefined") {
  module.exports = { erfc: erfc, Q: Q, num6: num6, sci: sci, CONS: CONS, TRAIN: TRAIN, berOf: berOf, reqEbN0: reqEbN0, lmsRun: lmsRun, hamEncode: hamEncode, hamSyndrome: hamSyndrome, convEncode: convEncode, viterbiDecode: viterbiDecode, interleaveRun: interleaveRun, QUIZ: QUIZ };
}

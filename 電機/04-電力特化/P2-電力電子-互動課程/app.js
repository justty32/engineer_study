"use strict";
/* 電力電子（零基礎互動課）——全站互動邏輯 */

/* ---------- 1. helper ---------- */
var $ = function (id) {
  if (typeof document === "undefined") { return null; }
  return document.getElementById(id);
};
var bind = function (ids, f) {
  ids.forEach(function (x) {
    var n = $(x);
    if (n) { n.addEventListener(n.type === "checkbox" ? "change" : "input", f); }
  });
};
var val = function (id) { var n = $(id); return n ? Number(n.value) : 0; };
var pick = function (id) { var n = $(id); return n ? n.value : ""; };
var zc = function (x) { return (Math.abs(x) < 1e-12) ? 0 : x; };
/* 負號一律 U+2212，半形 - 不得出現在數值輸出 */
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
var put = function (id, html) { var n = $(id); if (n) { n.innerHTML = html; } };
var row = function (cells, th) {
  var t = th ? "th" : "td";
  return "<tr><" + t + ">" + cells.join("</" + t + "><" + t + ">") + "</" + t + "></tr>";
};

/* ---------- 2. 常數 ---------- */
var SINK = { none: null, small: 10, medium: 4, fan: 1.5, cold: 0.3 };
var CARRIER = [1, 0.75, 0.5, 0.25, 0, 0.25, 0.5, 0.75];
var THD_LIMIT = { square: 48.342585, six: 31.084194, tri: 12.115293 };
var SWEEP = [100, 200, 500, 1000];

var QUIZ_CH = {
  "00": ["00-電力電子世界觀與切換不耗能.html", "00 電力電子世界觀與切換不耗能"],
  "01": ["01-功率開關與兩種損耗.html", "01 功率開關與兩種損耗"],
  "02": ["02-單相整流與電容濾波的代價.html", "02 單相整流與電容濾波的代價"],
  "03": ["03-三相與相控整流.html", "03 三相與相控整流"],
  "04": ["04-PWM與工作週期.html", "04 PWM 與工作週期"],
  "05": ["05-Buck降壓轉換器.html", "05 Buck 降壓轉換器"],
  "06": ["06-Boost與BuckBoost.html", "06 Boost 與 Buck-Boost"],
  "07": ["07-濾波與漣波設計.html", "07 濾波與漣波設計"],
  "08": ["08-逆變器與SPWM.html", "08 逆變器與 SPWM"],
  "09": ["09-諧波與THD.html", "09 諧波與 THD"],
  "10": ["10-散熱與效率.html", "10 散熱與效率"],
  "11": ["11-切換頻率取捨與設計總整合.html", "11 切換頻率取捨與設計總整合"]
};

var QUIZ = [
  { id: "q00-1", t: "num", ans: 14, tol: 0.1, why: "壓差 × 電流 ＝ (12 − 5) × 2 ＝ 14.000000 W。", err: "常見錯因：用了輸出功率而不是壓差 × 電流。" },
  { id: "q00-2", t: "num", ans: 41.666667, tol: 0.5, why: "效率 ＝ 5 / 12 × 100 % ＝ 41.666667 %。", err: "常見錯因：把效率算成 (V_in − V_o) / V_in。" },
  { id: "q00-3", t: "sel", ans: "b", why: "導通時電壓為 0、關斷時電流為 0，所以 V × I 恆為 0。", err: "常見錯因：把「快」當成原因；快只是讓過渡損耗小。" },
  { id: "q01-1", t: "num", ans: 1, tol: 0.05, why: "I²R_onD ＝ 10² × 0.020 × 0.5 ＝ 1.000000 W。", err: "常見錯因：忘了乘 D，或把 mΩ 當 Ω。" },
  { id: "q01-2", t: "num", ans: 83.333333, tol: 1, why: "f ＝ 1 W / (0.5 × 48 × 10 × 50 ns) ＝ 83.333333 kHz。", err: "常見錯因：E_sw 少乘 ½ 或 ns 單位沒換。" },
  { id: "q01-3", t: "sel", ans: "c", why: "每次過渡能量固定，頻率加倍時每秒過渡次數加倍。", err: "常見錯因：導通損只看導通那段的 I²R，與每秒切幾次無關。" },
  { id: "q02-1", t: "num", ans: 8.333333, tol: 0.05, why: "全波漣波頻率為 120 Hz，ΔV ＝ 1 / (120 × 0.001) ＝ 8.333333 V。", err: "常見錯因：漣波頻率用 60 而不是 120。" },
  { id: "q02-2", t: "num", ans: 10.513801, tol: 0.2, why: "導通比例 ＝ 18.924841° / 180° ＝ 10.513801 %。", err: "常見錯因：導通角除以 360 而不是 180（全波）。" },
  { id: "q02-3", t: "sel", ans: "d", why: "電流只在峰值附近短時間流動，窄脈衝的諧波很大。", err: "常見錯因：以為功因低一定是相位差。" },
  { id: "q03-1", t: "num", ans: 257.299944, tol: 0.5, why: "V_dc ＝ 297.104384 × cos 30° ＝ 257.299944 V。", err: "常見錯因：用相電壓算三相橋，或忘了 cos α。" },
  { id: "q03-2", t: "num", ans: 297.104384, tol: 0.5, why: "V_dc0 ＝ 3√2 × 220 / π ＝ 297.104384 V。", err: "常見錯因：係數用 0.9 而不是 1.35。" },
  { id: "q03-3", t: "sel", ans: "a", why: "反流需要電流連續，且直流側必須有能量來源。", err: "常見錯因：電阻負載電壓不能為負。" },
  { id: "q04-1", t: "num", ans: 5.04, tol: 0.01, why: "平均電壓 ＝ 0.42 × 12 ＝ 5.040000 V。", err: "常見錯因：拿峰值或 1 − D 來算。" },
  { id: "q04-2", t: "num", ans: 500, tol: 0.5, why: "N ＝ 100 MHz / 200 kHz ＝ 500 步。", err: "常見錯因：把 kHz 與 MHz 換算錯。" },
  { id: "q04-3", t: "sel", ans: "c", why: "開關節點只有 0 與 V_in 兩種瞬時值，平均才是 D × V_in。", err: "常見錯因：把平均值當成瞬時值。" },
  { id: "q05-1", t: "num", ans: 0.681818, tol: 0.005, why: "Δi_L ＝ (12 − 6) × 0.5 / (22 µH × 200 kHz) ＝ 0.681818 A。", err: "常見錯因：忘了乘 D，或 µH／kHz 單位錯。" },
  { id: "q05-2", t: "num", ans: 17.6, tol: 0.1, why: "R_crit ＝ 2 × 22 µH × 200 kHz / (1 − 0.5) ＝ 17.600000 Ω。", err: "常見錯因：用 1 − D 乘而不是除。" },
  { id: "q05-3", t: "sel", ans: "b", why: "輕載進入 DCM 時，V_o 高於 D × V_in，電壓比會隨負載改變。", err: "常見錯因：把 DCM 當成故障。" },
  { id: "q06-1", t: "num", ans: 23.076923, tol: 0.05, why: "V_o ＝ 24 × 0.961538 ＝ 23.076923 V。", err: "常見錯因：忘了乘損耗因子 F，答 24。" },
  { id: "q06-2", t: "num", ans: 0.9, tol: 0.005, why: "D_opt ＝ 1 − √(0.1 / 10) ＝ 0.900000。", err: "常見錯因：用 √(R/r_L) 而不是 √(r_L/R)。" },
  { id: "q06-3", t: "sel", ans: "d", why: "越過 D_opt 後輸出反而下降，控制方向也反轉。", err: "常見錯因：相信理想式 1 / (1 − D)。" },
  { id: "q07-1", t: "num", ans: 24.305556, tol: 0.05, why: "L ＝ (12 − 5) × (5/12) / (200 kHz × 0.6 A) ＝ 24.305556 µH。", err: "常見錯因：用 V_in 而不是 V_in − V_o。" },
  { id: "q07-2", t: "num", ans: 18.75, tol: 0.05, why: "C ＝ 0.6 / (8 × 200 kHz × 0.02) ＝ 18.750000 µF。", err: "常見錯因：分母的 8 寫成 2。" },
  { id: "q07-3", t: "sel", ans: "a", why: "當 Δi_L × ESR 大於目標 ΔV_o，就是 ESR 項主導。", err: "常見錯因：以為加大電容能壓掉 ESR 項。" },
  { id: "q08-1", t: "num", ans: 320, tol: 0.5, why: "全橋基波峰值 ＝ 0.8 × 400 ＝ 320.000000 V。", err: "常見錯因：用半橋公式除了 2。" },
  { id: "q08-2", t: "num", ans: 1050, tol: 1, why: "f_sw ＝ 21 × 50 ＝ 1050 Hz。", err: "常見錯因：把 m_f 當成諧波次數。" },
  { id: "q08-3", t: "sel", ans: "c", why: "m_a 超過 1 後基波增加變慢，出現 5、7 次低次諧波，極限是方波。", err: "常見錯因：以為線性區可以無限延伸。" },
  { id: "q09-1", t: "num", ans: 44.502424, tol: 0.05, why: "方波的 3、5、7、9、11、13 次分量平方相加後開根號為 44.502424 %。", err: "常見錯因：把幅值相加而不是平方和開根號。" },
  { id: "q09-2", t: "num", ans: 0.913615, tol: 0.001, why: "真功因 ＝ 1 / √(1 ＋ 0.445024²) ＝ 0.913615。", err: "常見錯因：THD 用百分比數值沒換成 0.445。" },
  { id: "q09-3", t: "sel", ans: "b", why: "諧波電流增加視在功率卻不做功，因此真功因下降。", err: "常見錯因：把位移功因與真功因混為一談。" },
  { id: "q10-1", t: "num", ans: 88, tol: 0.5, why: "T_J ＝ 40 ＋ 10 × (0.5 ＋ 0.3 ＋ 4.0) ＝ 88.000000 °C。", err: "常見錯因：忘了加環境溫度。" },
  { id: "q10-2", t: "num", ans: 7.7, tol: 0.05, why: "θ_SA ＝ (125 − 40) / 10 − 0.5 − 0.3 ＝ 7.700000 °C/W。", err: "常見錯因：忘了扣 θ_JC ＋ θ_CS。" },
  { id: "q10-3", t: "sel", ans: "d", why: "散熱片與風扇都動不了 θ_JC，只能降損耗、換封裝或並聯元件。", err: "常見錯因：以為散熱片能解決一切。" },
  { id: "q11-1", t: "num", ans: 1.92, tol: 0.01, why: "P_sw ＝ 0.5 × 48 × 10 × 40 ns × 200 kHz ＝ 1.920000 W。", err: "常見錯因：少乘 ½。" },
  { id: "q11-2", t: "num", ans: 3, tol: 0.05, why: "L 與 f 成反比，200 kHz 的 15 µH 到 1 MHz 變成 3.000000 µH。", err: "常見錯因：忘了 L 與 f 成反比。" },
  { id: "q11-3", t: "sel", ans: "a", why: "頻率提高讓電感與電容變小，卻讓切換損與結溫上升。", err: "常見錯因：以為頻率只影響 EMI。" }
];

/* ---------- 3. 純函式 ---------- */
function rect3Calc(topo, v, alpha, f, load) {
  var a = alpha * Math.PI / 180, vph, vdc0, pulses, vdc;
  if (topo === "t3b") { vdc0 = 3 * Math.sqrt(2) * v / Math.PI; pulses = 6; }
  else if (topo === "t3h") { vph = v / Math.sqrt(3); vdc0 = 3 * Math.sqrt(6) * vph / (2 * Math.PI); pulses = 3; }
  else { vdc0 = 2 * Math.sqrt(2) * v / Math.PI; pulses = 2; }
  if (load === "ind") { vdc = vdc0 * Math.cos(a); }
  else if (topo === "s1") { vdc = Math.sqrt(2) * v / Math.PI * (1 + Math.cos(a)); }
  else if (topo === "t3h") {
    if (alpha <= 30) { vdc = vdc0 * Math.cos(a); }
    else if (alpha < 150) { vdc = 3 * Math.sqrt(2) * vph / (2 * Math.PI) * (1 + Math.cos(a + Math.PI / 6)); }
    else { vdc = 0; }
  } else {
    if (alpha <= 60) { vdc = vdc0 * Math.cos(a); }
    else if (alpha < 120) { vdc = 3 * Math.sqrt(2) * v / Math.PI * (1 + Math.cos(a + Math.PI / 3)); }
    else { vdc = 0; }
  }
  return { vdc0: zc(vdc0), vdc: zc(vdc), ratio: zc(vdc / vdc0 * 100), pulses: pulses,
    fr: pulses * f, dpf: zc(Math.cos(a)) };
}

function buckCalc(vin, d, lUH, fkHz, r) {
  var L = lUH * 1e-6, f = fkHz * 1e3, vo = d * vin, io = vo / r;
  var dil = (vin - vo) * d / (L * f), ipk = io + dil / 2, ivl = io - dil / 2;
  var up = (vin - vo) / L / 1e6, dn = -vo / L / 1e6;
  var K = 2 * L * f / r, Kc = 1 - d, rcrit = 2 * L * f / (1 - d), T = 1e6 / f;
  var mode = K >= Kc ? "CCM" : "DCM", M = null, vo2 = null, io2 = null;
  var ipk2 = null, d2 = null, idle = null, rise = null;
  if (mode === "DCM") {
    M = 2 / (1 + Math.sqrt(1 + 4 * K / (d * d)));
    vo2 = M * vin;
    io2 = vo2 / r;
    ipk2 = (vin - vo2) * d / (L * f);
    d2 = d * (vin - vo2) / vo2;
    idle = 1 - d - d2;
    rise = (vo2 / vo - 1) * 100;
  }
  return { vo: vo, io: io, dil: dil, ipk: ipk, ivl: ivl, up: up, dn: dn, K: K, Kc: Kc,
    rcrit: rcrit, T: T, mode: mode, M: M, vo2: vo2, io2: io2, ipk2: ipk2, d2: d2,
    idle: idle, rise: rise };
}

function boostCalc(topo, vin, d, r, rl) {
  var F = 1 / (1 + rl / ((1 - d) * (1 - d) * r));
  var mi = topo === "boost" ? 1 / (1 - d) : d / (1 - d), M = mi * F;
  var vo = M * vin, io = vo / r, il = io / (1 - d), prl = il * il * rl, po = vo * io;
  var dopt, mmax, k, dd, g;
  if (topo === "boost") {
    dopt = 1 - Math.sqrt(rl / r);
    mmax = 0.5 * Math.sqrt(r / rl);
  } else {
    dopt = 0.001; mmax = 0;
    for (k = 1; k <= 998; k += 1) {
      dd = k / 1000;
      g = (dd / (1 - dd)) / (1 + rl / ((1 - dd) * (1 - dd) * r));
      if (g > mmax) { mmax = g; dopt = dd; }
    }
  }
  return { mi: mi, F: F, M: M, vo: vo, io: io, il: il, prl: prl, po: po, eta: F * 100,
    dopt: dopt, mmax: mmax, vomax: mmax * vin };
}

function thdCalc(wave, N, nc, dpf) {
  var theta = 36 * Math.PI / 180;
  var coef = function (n) {
    if (n % 2 === 0) { return 0; }
    if (wave === "square") { return 1 / n; }
    if (wave === "six") { return n % 3 === 0 ? 0 : 1 / n; }
    if (wave === "tri") { return 1 / (n * n); }
    return Math.abs(Math.sin(n * theta / 2)) / (n * Math.sin(theta / 2));
  };
  var gain = function (n) {
    var x;
    if (nc === 0) { return 1; }
    x = n / nc;
    return 1 / Math.sqrt((1 - x * x) * (1 - x * x) + x * x);
  };
  var h1 = gain(1), c1 = coef(1) * h1, rows = [], s = 0, n, r;
  for (n = 3; n <= N; n += 2) {
    r = coef(n) * gain(n) / c1;
    if (r !== 0) { s += r * r; rows.push({ n: n, r: r * 100, cum: Math.sqrt(s) * 100 }); }
  }
  return { rows: rows, thd: Math.sqrt(s) * 100, pf: dpf / Math.sqrt(1 + s), h1: h1 };
}

function tradeCalc(fk, vin, vo, io, ronM, tswNs, rip, dvMV, theta) {
  if (vo >= vin) { return null; }
  var f = fk * 1e3, ron = ronM / 1e3, tsw = tswNs * 1e-9, d = vo / vin;
  var dil = rip / 100 * io, L = (vin - vo) * d / (f * dil);
  var C = dil / (8 * f * dvMV * 1e-3), ipk = io + dil / 2, EL = 0.5 * L * ipk * ipk;
  var pch = io * io * ron * d, pcl = io * io * ron * (1 - d);
  var psw = 0.5 * vin * io * tsw * f, pt = pch + pcl + psw, po = vo * io;
  return { d: d, dil: dil, L: L, C: C, ipk: ipk, EL: EL, pch: pch, pcl: pcl,
    psw: psw, pt: pt, po: po, eta: po / (po + pt) * 100,
    tj: 40 + (pch + psw) * theta, occ: f * tsw * 100 };
}

var table2 = function (rows) {
  var h = "<table>" + row(["量", "數值"], true), i;
  for (i = 0; i < rows.length; i += 1) { h += row(rows[i]); }
  return h + "</table>";
};
var endText = function (judge, why, edge) {
  return "<p><strong>" + judge + "</strong></p><p>" + why + "</p><p>邊界提醒：" + edge + "</p>";
};

/* ---------- 4. 各章互動 ---------- */
function lvs() {
  if (!$("lv-vin")) { return; }
  var ids = ["lv-vin", "lv-vout", "lv-io", "lv-eta"];
  var draw = function () {
    var vin = val("lv-vin"), vo = val("lv-vout"), io = val("lv-io"), eta = val("lv-eta");
    var po = vo * io, ps = po * (100 / eta - 1), pins = po + ps;
    var valid = vo < vin, pl = valid ? (vin - vo) * io : 0;
    var el = valid ? vo / vin * 100 : 0, pinl = valid ? po + pl : 0, ratio = valid ? pl / ps : 0;
    var na = "不適用（無法升壓）";
    var h = table2([
      ["輸出功率", num6(po) + " W"], ["線性穩壓損耗", valid ? num6(pl) + " W" : na],
      ["線性穩壓效率", valid ? num6(el) + " %" : na], ["線性穩壓輸入功率", valid ? num6(pinl) + " W" : na],
      ["切換式損耗", num6(ps) + " W"], ["切換式效率", num6(eta) + " %"],
      ["切換式輸入功率", num6(pins) + " W"], ["損耗倍數", valid ? num6(ratio) + " 倍" : na]
    ]);
    var judge;
    if (!valid) { judge = "判讀：輸出高於輸入，線性穩壓做不到，只能用切換式（Boost）。"; }
    else if (vin - vo <= 0.5) { judge = "判讀：壓差只有 " + num6(vin - vo) + " V，線性穩壓效率 " + num6(el) + " %，與切換式差不多——這種場合線性穩壓反而更好：沒有切換雜訊、零件少。"; }
    else if (el < 60) { judge = "判讀：線性穩壓把 " + num6(100 - el) + " % 的能量燒成熱，切換式損耗只有它的 1/" + num6(ratio) + "。"; }
    else { judge = "判讀：線性穩壓效率 " + num6(el) + " %，損耗是切換式的 " + num6(ratio) + " 倍。"; }
    var edge = "線性穩壓只能降壓，壓差與電流都會直接增加熱。";
    if (eta === 98) { edge += " 效率 98 % 已是伺服器電源等級，量測誤差會比損耗本身還大。"; }
    if (io === 10 && valid && pl >= 50) { edge += " 50 W 以上的損耗沒有大散熱片撐不住（10 章）。"; }
    if (vin === 48 && vo <= 5) { edge += " 壓差 40 V 以上，線性穩壓連 15 % 都到不了。"; }
    h += endText(judge, "為什麼：線性穩壓器裡電晶體與負載串聯，整個壓差 × 整個電流都落在電晶體上；切換式的電晶體只有兩個狀態，導通時電壓近 0、關斷時電流近 0。", edge);
    put("lvs-output", h);
  };
  bind(ids, draw); draw();
}

function swloss() {
  if (!$("sl-dev")) { return; }
  var ids = ["sl-dev", "sl-i", "sl-ron", "sl-vce", "sl-v", "sl-tsw", "sl-f", "sl-d"];
  var draw = function () {
    var dev = pick("sl-dev"), i = val("sl-i"), ron = val("sl-ron") / 1000, vce = val("sl-vce");
    var v = val("sl-v"), tsw = val("sl-tsw") * 1e-9, f = val("sl-f") * 1e3, d = val("sl-d");
    var pc = dev === "mosfet" ? i * i * ron * d : i * vce * d;
    var esw = 0.5 * v * i * tsw, psw = esw * f, pt = pc + psw;
    var fx = pc / esw / 1000, share = psw / pt * 100, occ = f * tsw * 100, icross = vce / ron;
    var intro = dev === "mosfet" ? "這個模式只用到 R_on，V_ce(sat) 滑桿不影響結果（只用來算交叉電流）。" : "這個模式只用到 V_ce(sat)，R_on 滑桿不影響結果（只用來算交叉電流）。";
    var h = "<p>" + intro + "</p>" + table2([
      ["導通損", num6(pc) + " W"], ["每週期切換能量", num6(esw * 1e6) + " µJ"],
      ["切換損", num6(psw) + " W"], ["總損耗", num6(pt) + " W"],
      ["切換損佔比", num6(share) + " %"], ["交越頻率", num6(fx) + " kHz"],
      ["切換過渡佔週期", num6(occ) + " %"], ["MOSFET／IGBT 交叉電流", num6(icross) + " A"]
    ]);
    var judge;
    if (occ >= 20) { judge = "判讀：切換過渡已佔週期 " + num6(occ) + " %，線性交越模型失效——這個頻率這顆元件根本切不動。"; }
    else if (psw > pc) { judge = "判讀：切換損主導（佔 " + num6(share) + " %）：降頻、換更快的元件（SiC／GaN）或用軟切換才有用，降 R_on 沒用。"; }
    else { judge = "判讀：導通損主導：降 R_on、並聯元件或在大電流時改用 IGBT 才划算，降頻幫助有限。"; }
    var edge = "切換過渡佔週期達 20 % 時，線性交越模型失效。";
    if (i > icross && dev === "mosfet") { edge += " 電流已超過交叉電流 " + num6(icross) + " A，同樣導通損 IGBT 會更低。"; }
    if (i < icross && dev === "igbt") { edge += " 電流低於交叉電流，MOSFET 的導通損會更低。"; }
    if (val("sl-f") === 1000) { edge += " 1 MHz 是 GaN 的地盤，Si MOSFET 的 t_sw 通常做不到 50 ns 以下。"; }
    if (val("sl-tsw") >= 300 && dev === "mosfet") { edge += " 300 ns 以上是 IGBT 的典型過渡時間，Si MOSFET 通常 20–100 ns。"; }
    h += endText(judge, "為什麼：導通損只看導通那段的 V × I，切換損是每次過渡 V 與 I 同時非零的能量乘以每秒切幾次，所以它與 f_sw 成正比。", edge);
    put("swloss-output", h);
  };
  bind(ids, draw); draw();
}

function rect1() {
  if (!$("r1-topo")) { return; }
  var ids = ["r1-topo", "r1-vrms", "r1-f", "r1-c", "r1-io", "r1-vd"];
  var draw = function () {
    var topo = pick("r1-topo"), vrms = val("r1-vrms"), f = val("r1-f"), c = val("r1-c");
    var io = val("r1-io"), vd = val("r1-vd"), nd = topo === "full" ? 2 : 1, fr = topo === "full" ? 2 * f : f;
    var vpk = Math.sqrt(2) * vrms - nd * vd, dv = io / (fr * c * 1e-6), bad = vpk <= 0 || dv >= vpk;
    var vdc = 0, rip = 0, th = 0, k = 0, ip = 0, irms = 0, pf = 0, icap = 0;
    if (!bad) {
      vdc = vpk - dv / 2; rip = dv / vpk * 100;
      th = Math.acos(1 - dv / vpk) * 180 / Math.PI;
      k = topo === "full" ? th / 180 : th / 360;
      ip = io / k; irms = io / Math.sqrt(k); pf = vdc * io / (vrms * irms);
      icap = Math.sqrt(Math.max(irms * irms - io * io, 0));
    }
    var na = "不適用";
    var h = table2([
      ["峰值", num6(vpk) + " V"], ["漣波頻率", int0(fr) + " Hz"], ["漣波 ΔV", num6(dv) + " V"],
      ["直流平均", bad ? na : num6(vdc) + " V"], ["漣波百分比", bad ? na : num6(rip) + " %"],
      ["導通角", bad ? na : num6(th) + "°"], ["導通比例", bad ? na : num6(k * 100) + " %"],
      ["脈衝平均電流", bad ? na : num6(ip) + " A"], ["輸入電流有效值", bad ? na : num6(irms) + " A"],
      ["功因估計（矩形近似上界）", bad ? na : num6(pf)], ["電容漣波電流", bad ? na : num6(icap) + " A"]
    ]);
    var judge;
    if (bad) { judge = "判讀：ΔV 已不小於 V_pk，電容在下一個峰值之前就放光，線性放電公式失效——輸出接近沒濾波的整流波。"; }
    else if (rip > 10) { judge = "判讀：漣波 " + num6(rip) + " %，太大；加大電容或降負載電流，但注意下一條。"; }
    else if (k * 100 < 15) { judge = "判讀：導通比例只有 " + num6(k * 100) + " %，輸入電流是尖峰 " + num6(ip) + " A 的窄脈衝，功因估計只有 " + num6(pf) + "——這就是中大功率電源必須加 PFC 的原因。"; }
    else { judge = "判讀：漣波 " + num6(rip) + " %、導通比例 " + num6(k * 100) + " %，功因估計 " + num6(pf) + "。"; }
    var edge = "ΔV 不得接近或超過峰值，否則線性放電近似失效。";
    if (c === 4700) { edge += " 電容越大漣波越小，但導通角越窄、尖峰越高、功因越差；矩形近似在導通角很小時明顯低估功因，真實值多在 0.5–0.7。"; }
    if (io === 0.1) { edge += " 輕載時導通角極窄，開機瞬間的湧入電流是另一個問題。"; }
    if (vd === 0) { edge += " 理想二極體，峰值就是 √2 × V_rms。"; }
    h += endText(judge, "為什麼：電容只在電源電壓超過它的那一小段導通角內補充電荷，一整個週期的負載電荷都要在這一小段塞進來，所以電流是窄而高的脈衝；窄脈衝的有效值遠大於平均值，視在功率因此變大而功因變低。", edge);
    put("rect1-output", h);
  };
  bind(ids, draw); draw();
}

function rect3() {
  if (!$("r3-topo")) { return; }
  var ids = ["r3-topo", "r3-v", "r3-alpha", "r3-f", "r3-load"];
  var draw = function () {
    var topo = pick("r3-topo"), v = val("r3-v"), alpha = val("r3-alpha"), f = val("r3-f"), load = pick("r3-load");
    var x = rect3Calc(topo, v, alpha, f, load), cont = x.vdc0 * Math.cos(alpha * Math.PI / 180), judge;
    var h = table2([["V<sub>dc0</sub>", num6(x.vdc0) + " V"], ["V<sub>dc</sub>", num6(x.vdc) + " V"],
      ["V<sub>dc</sub> / V<sub>dc0</sub>", num6(x.ratio) + " %"], ["脈波數", int0(x.pulses)],
      ["漣波頻率", int0(x.fr) + " Hz"], ["位移功因估計 cos α", num6(x.dpf)]]);
    if (load === "ind" && alpha >= 160) { judge = "判讀：α 已到 " + num6(alpha) + "°，平均電壓 " + num6(x.vdc) + " V；實務上 α 不能到 180°，要留 20°–30° 換相裕度，否則換相失敗、閘流體無法關斷。"; }
    else if (load === "ind" && alpha > 90) { judge = "判讀：反流區——平均電壓為負，能量從直流側送回交流側；前提是電流連續且直流側有能量來源（馬達再生、HVDC 另一端）。"; }
    else if (load === "res" && alpha > 90) { judge = "判讀：電阻負載電壓不能為負，α 超過 90° 只是把輸出調小；平均 " + num6(x.vdc) + " V。"; }
    else if (load === "res" && ((topo === "t3h" && alpha > 30) || (topo === "t3b" && alpha > 60))) { judge = "判讀：電流已斷續，cos α 公式不再成立，改用斷續公式：" + num6(x.vdc) + " V（連續式會算成 " + num6(cont) + " V）。"; }
    else { judge = "判讀：α ＝ " + num6(alpha) + "°，輸出 " + num6(x.vdc) + " V，是全開時的 " + num6(x.ratio) + " %。"; }
    var edge = "反流只適用於電流連續且直流側有能量來源。";
    if (alpha === 0) { edge += " α ＝ 0 就是二極體整流，V_dc0 是這個拓樸的上限。"; }
    if (alpha === 90 && load === "ind") { edge += " 平均剛好 0：正負面積相等，但瞬時電壓仍在擺動，電感在承受全部漣波。"; }
    if (topo === "s1") { edge += " 脈波數 2，漣波頻率只有三相橋的 1/3，濾波元件要大得多。"; }
    h += endText(judge, "為什麼：閘流體被觸發後只導通到電流過零，α 越大就把波形前面那段電壓切掉越多，平均值跟著 cos α 走；電流連續時負電壓那段也被算進去，平均才可能為負。", edge);
    put("rect3-output", h);
  };
  bind(ids, draw); draw();
}

function pwm() {
  if (!$("pw-vin")) { return; }
  var ids = ["pw-vin", "pw-vm", "pw-fsw", "pw-fclk"];
  var draw = function () {
    var vin = val("pw-vin"), d = val("pw-vm"), fsw = val("pw-fsw"), fclk = val("pw-fclk");
    var T = 1000 / fsw, ton = d * T, vavg = d * vin, count = 0, h, k, state;
    h = "<table>" + row(["格 k", "載波 c_k", "開關"], true);
    for (k = 0; k < CARRIER.length; k += 1) { state = d > CARRIER[k]; if (state) { count += 1; } h += row([int0(k), num6(CARRIER[k]), state ? "導通" : "關斷"]); }
    h += "</table>";
    var d8 = count / 8, N = Math.floor(fclk * 1e6 / (fsw * 1e3)), bits = Math.log(N) / Math.log(2);
    var dd = 100 / N, dvo = vin / N * 1000, dq = Math.round(d * N) / N, vq = dq * vin, err = (vq - vavg) * 1000;
    h += table2([["工作週期", num6(d)], ["切換週期", num6(T) + " µs"], ["導通時間", num6(ton) + " µs"],
      ["平均電壓", num6(vavg) + " V"], ["導通格數與 d8", int0(count) + " 格／" + num6(d8)],
      ["步數 N", int0(N)], ["位元數", num6(bits)], ["最小 D 步階", num6(dd) + " %"],
      ["最小電壓步階", num6(dvo) + " mV"], ["可達 D", num6(dq)], ["量化誤差", num6(err) + " mV"]]);
    var judge;
    if (d === 0 || d === 1) { judge = "判讀：v_m ＝ " + num6(d) + "，開關永遠" + (d === 0 ? "關斷，平均就是 0。" : "導通，平均就是 V_in。") + "這不是調變。"; }
    else if (N < 256) { judge = "判讀：只有 " + int0(N) + " 步（" + num6(bits) + " 位元），不到 8 位元；最小電壓步階 " + num6(dvo) + " mV，控制迴路會在相鄰步階間來回跳（極限循環）。"; }
    else if (N < 1000) { judge = "判讀：" + int0(N) + " 步（" + num6(bits) + " 位元），夠一般用途；步階 " + num6(dvo) + " mV。"; }
    else { judge = "判讀：" + int0(N) + " 步（" + num6(bits) + " 位元），高解析度；步階 " + num6(dvo) + " mV。"; }
    var edge = "工作週期到 0 或 1 時不再形成脈衝。";
    if (fsw >= 500 && fclk === 48) { edge += " 高頻切換吃掉解析度：想同時要高頻與高解析，只能升時脈或用高解析 PWM 模組。"; }
    if (Math.abs(d8 - d) >= 0.05) { edge += " 8 格表算出 " + num6(d8) + "，與 v_m 差了 " + num6(Math.abs(d8 - d)) + "，這就是只有 8 步的解析度。"; }
    h += endText(judge, "為什麼：開關節點任何瞬間只有 0 或 V_in，負載看到的是面積除以週期；數位 PWM 的導通時間只能是時脈週期的整數倍，所以 D 的解析度是 f_sw / f_clk。", edge);
    put("pwm-output", h);
  };
  bind(ids, draw); draw();
}

function buck() {
  if (!$("bk-vin")) { return; }
  var ids = ["bk-vin", "bk-d", "bk-l", "bk-f", "bk-r"];
  var draw = function () {
    var vin = val("bk-vin"), d = val("bk-d"), l = val("bk-l"), fk = val("bk-f"), r = val("bk-r");
    var x = buckCalc(vin, d, l, fk, r), h, judge;
    if (x.mode === "CCM") {
      h = table2([["V<sub>o</sub>", num6(x.vo) + " V"], ["I<sub>o</sub>", num6(x.io) + " A"], ["Δi<sub>L</sub>", num6(x.dil) + " A"],
        ["峰值", num6(x.ipk) + " A"], ["谷值", num6(x.ivl) + " A"], ["K", num6(x.K)], ["K<sub>crit</sub>", num6(x.Kc)],
        ["R<sub>crit</sub>", num6(x.rcrit) + " Ω"], ["模式", x.mode]]);
      h += "<table>" + row(["段", "時間（µs）", "電感電壓", "斜率（A/µs）", "電流"], true)
        + row(["1", "0 到 " + num6(d * x.T), num6(vin - x.vo) + " V", num6(x.up), num6(x.ivl) + " → " + num6(x.ipk) + " A"])
        + row(["2", num6(d * x.T) + " 到 " + num6(x.T), num6(-x.vo) + " V", num6(x.dn), num6(x.ipk) + " → " + num6(x.ivl) + " A"]) + "</table>";
    } else {
      h = table2([["CCM 公式會給的 V<sub>o</sub>", num6(x.vo) + " V"], ["實際 V<sub>o</sub>（DCM）", num6(x.vo2) + " V"],
        ["上升百分比", num6(x.rise) + " %"], ["I<sub>o</sub>", num6(x.io2) + " A"], ["峰值", num6(x.ipk2) + " A"],
        ["D<sub>2</sub>", num6(x.d2)], ["空閒比例", num6(x.idle)], ["K", num6(x.K)], ["K<sub>crit</sub>", num6(x.Kc)],
        ["R<sub>crit</sub>", num6(x.rcrit) + " Ω"], ["模式", x.mode]]);
      h += "<table>" + row(["段", "時間（µs）", "電感電壓", "電流"], true)
        + row(["1", "0 到 " + num6(d * x.T), num6(vin - x.vo2) + " V", "0 → " + num6(x.ipk2) + " A"])
        + row(["2", "到 " + num6((d + x.d2) * x.T), num6(-x.vo2) + " V", num6(x.ipk2) + " → 0 A"])
        + row(["3", "到 " + num6(x.T), "0 V", "0 A"]) + "</table>";
    }
    if (x.mode === "DCM") { judge = "判讀：DCM——負載 " + num6(r) + " Ω 大於臨界值 " + num6(x.rcrit) + " Ω，谷值電流會碰到 0；輸出從 D × V_in ＝ " + num6(x.vo) + " V 升到 " + num6(x.vo2) + " V（＋" + num6(x.rise) + " %），電壓比隨負載改變，控制要換一套。"; }
    else if (Math.abs(x.K - x.Kc) / x.Kc <= 0.05) { judge = "判讀：剛好在 CCM／DCM 邊界附近（K ＝ " + num6(x.K) + "、K_crit ＝ " + num6(x.Kc) + "），谷值電流接近 0。"; }
    else if (x.dil / x.io > 0.6) { judge = "判讀：CCM，但漣波比例 " + num6(x.dil / x.io * 100) + " %（Δi_L / I_o）太大，電感峰值電流 " + num6(x.ipk) + " A 遠高於平均，電感要選更大的飽和電流。"; }
    else { judge = "判讀：CCM，V_o ＝ D × V_in ＝ " + num6(x.vo) + " V，與負載無關；漣波 Δi_L ＝ " + num6(x.dil) + " A。"; }
    var edge = "谷值電流一旦碰到 0，就必須改用 DCM 式子。";
    if (l === 1) { edge += " 1 µH 讓漣波電流 " + num6(x.dil) + " A，這在 200 kHz 幾乎一定進 DCM。"; }
    if (d === 0.05 || d === 0.95) { edge += " D(1 − D) 在 0.05 與 0.95 一樣小，漣波最小；D ＝ 0.5 漣波最大。"; }
    if (fk === 1000) { edge += " 1 MHz 讓漣波縮到 1/5，代價是 01 章的切換損乘 5。"; }
    h += endText(judge, "為什麼：穩態下電感一週期的伏秒必須抵銷——(V_in − V_o) × D ＝ V_o × (1 − D)——所以 V_o 只由 D 決定；電流碰到 0 之後二極體關斷，多出一段電感電壓為 0 的時間，伏秒平衡的式子換了，V_o 才與負載有關。", edge);
    put("buck-output", h);
  };
  bind(ids, draw); draw();
}

function boost() {
  if (!$("bs-topo")) { return; }
  var ids = ["bs-topo", "bs-vin", "bs-d", "bs-r", "bs-rl"];
  var draw = function () {
    var topo = pick("bs-topo"), vin = val("bs-vin"), d = val("bs-d"), r = val("bs-r"), rl = val("bs-rl");
    var x = boostCalc(topo, vin, d, r, rl), sign = topo === "bb" ? -1 : 1, judge;
    var h = table2([["理想增益", num6(x.mi)], ["理想 V<sub>o</sub>", num6(sign * x.mi * vin) + " V"],
      ["損耗因子 F", num6(x.F)], ["實際 V<sub>o</sub>", num6(sign * x.vo) + " V"], ["I<sub>o</sub>", num6(x.io) + " A"],
      ["電感平均電流", num6(x.il) + " A"], ["r<sub>L</sub> 損耗", num6(x.prl) + " W"], ["輸出功率", num6(x.po) + " W"],
      ["效率", num6(x.eta) + " %"], ["D<sub>opt</sub>", num6(x.dopt)], ["M<sub>max</sub> 與 V<sub>o,max</sub>", num6(x.mmax) + "／" + num6(sign * x.vomax) + " V"]]);
    if (d > x.dopt) { judge = "判讀：D ＝ " + num6(d) + " 已越過增益峰值 D_opt ＝ " + num6(x.dopt) + "——再加大 D 輸出反而下降（現在 " + num6(sign * x.vo) + " V，峰值 " + num6(sign * x.vomax) + " V），控制方向反轉，這一區不可用；這就是『Boost 推不上去』的診斷答案：寄生電阻。"; }
    else if (x.dopt - d <= 0.05) { judge = "判讀：D 已逼近 D_opt ＝ " + num6(x.dopt) + "，效率只剩 " + num6(x.eta) + " %，電感電流 " + num6(x.il) + " A；再往上沒有好處。"; }
    else if (x.eta < 80) { judge = "判讀：效率 " + num6(x.eta) + " %，r_L 損耗 " + num6(x.prl) + " W 已吃掉太多；降 r_L、降增益或改隔離式。"; }
    else { judge = "判讀：增益 " + num6(x.M) + "（理想 " + num6(x.mi) + "），效率 " + num6(x.eta) + " %，電感電流是輸出電流的 1/(1 − D) ＝ " + num6(1 / (1 - d)) + " 倍。"; }
    var edge = "超過 D_opt 後，增益下降且控制方向反轉。";
    if (d === 0.95) { edge += " 理想式給 20 倍，實際做不到；實務 Boost 單級增益多在 4–6 倍以內。"; }
    if (rl === 0.01) { edge += " r_L 越小峰值越高（M_max ＝ ½√(R/r_L)），但永遠有限。"; }
    if (topo === "bb") { edge += " 輸出電壓為負是拓樸本身的結果，不是接錯線；D ＝ 0.5 時增益剛好 1。"; }
    h += endText(judge, "為什麼：Boost 的電感電流是 I_o / (1 − D)，增益越高電感電流越大，r_L 上的 I² r 損耗以平方成長，最後吃掉所有增益；伏秒平衡給的 1 / (1 − D) 只在 r_L ＝ 0 時成立。", edge);
    put("boost-output", h);
  };
  bind(ids, draw); draw();
}

function filt() {
  if (!$("fl-vin")) { return; }
  var ids = ["fl-vin", "fl-vo", "fl-io", "fl-f", "fl-rip", "fl-dv", "fl-esr"];
  var draw = function () {
    var vin = val("fl-vin"), vo = val("fl-vo"), io = val("fl-io"), fk = val("fl-f");
    var rip = val("fl-rip"), dv = val("fl-dv"), esr = val("fl-esr"), bad = vo >= vin;
    var d = 0, dil = 0, L = 0, C = 0, vesr = 0, tot = 0, esrmax = 0, fc = 0, ratio = 0, att = 0, ipk = 0;
    if (!bad) {
      d = vo / vin; dil = rip / 100 * io; L = (vin - vo) * d / (fk * 1e3 * dil);
      C = dil / (8 * fk * 1e3 * dv * 1e-3); vesr = dil * esr; tot = dv + vesr; esrmax = dv / dil;
      fc = 1 / (2 * Math.PI * Math.sqrt(L * C)); ratio = fk * 1e3 / fc; att = 40 * Math.log(ratio) / Math.log(10); ipk = io + dil / 2;
    }
    var na = "不適用", h = table2([["D", bad ? na : num6(d)], ["Δi<sub>L</sub>", bad ? na : num6(dil) + " A"],
      ["L", bad ? na : num6(L * 1e6) + " µH"], ["C", bad ? na : num6(C * 1e6) + " µF"],
      ["ESR 漣波", bad ? na : num6(vesr) + " mV"], ["總漣波", bad ? na : num6(tot) + " mV"],
      ["ESR 上限", bad ? na : num6(esrmax) + " mΩ"], ["f<sub>c</sub>", bad ? na : num6(fc) + " Hz"],
      ["f<sub>sw</sub> / f<sub>c</sub>", bad ? na : num6(ratio)], ["切換頻率衰減", bad ? na : num6(att) + " dB"],
      ["電感峰值電流", bad ? na : num6(ipk) + " A"]]);
    var judge;
    if (bad) { judge = "判讀：Buck 不能升壓，V_o 必須小於 V_in。"; }
    else if (vesr > dv) { judge = "判讀：ESR 主導——ESR 單獨就貢獻 " + num6(vesr) + " mV，超過目標 " + num6(dv) + " mV；電容值再大也沒用，要換低 ESR（陶瓷）或多顆並聯，ESR 上限 " + num6(esrmax) + " mΩ。"; }
    else if (ratio < 10) { judge = "判讀：f_c ＝ " + num6(fc) + " Hz 離 f_sw 不到 10 倍，衰減只有 " + num6(att) + " dB；漣波與控制都會受影響。"; }
    else { judge = "判讀：L ＝ " + num6(L * 1e6) + " µH、C ＝ " + num6(C * 1e6) + " µF，總漣波 " + num6(tot) + " mV，ESR 佔 " + num6(vesr) + " mV。"; }
    var edge = "V_o 必須小於 V_in，且 ESR 項不會因加大 C 而消失。";
    if (esr === 0) { edge += " ESR ＝ 0 是理想陶瓷，實際陶瓷 2–10 mΩ、電解 50–500 mΩ。"; }
    if (rip === 60 && !bad) { edge += " 漣波 60 % 讓電感小，但峰值電流 " + num6(ipk) + " A、電容漣波電流與 ESR 損耗都變大。"; }
    if (fk === 1000) { edge += " 1 MHz 讓 L 與 C 都縮到 1/5，但 f_sw / f_c 不變——衰減沒有變好，只是元件變小。"; }
    h += endText(judge, "為什麼：電感漣波電流全部流進電容，三角波正半區的電荷除以 C 是電容項；同一個電流流過 ESR 直接變成電壓，這一項與 C 無關，所以電容值再大也壓不掉它。", edge);
    put("filt-output", h);
  };
  bind(ids, draw); draw();
}

function spwm() {
  if (!$("sp-topo")) { return; }
  var ids = ["sp-topo", "sp-vdc", "sp-ma", "sp-mf", "sp-f1"];
  var draw = function () {
    var topo = pick("sp-topo"), vdc = val("sp-vdc"), ma = val("sp-ma"), mf = val("sp-mf"), f1 = val("sp-f1");
    var fsw = mf * f1, v1pk, v1rms, limpk, limrms, spmax = 0, svmax = 0, svgain = 0;
    if (topo === "half") { v1pk = ma * vdc / 2; limpk = 4 / Math.PI * vdc / 2; }
    else if (topo === "full") { v1pk = ma * vdc; limpk = 4 / Math.PI * vdc; }
    else { v1rms = ma * Math.sqrt(3) / (2 * Math.sqrt(2)) * vdc; v1pk = v1rms * Math.sqrt(2); limrms = Math.sqrt(6) / Math.PI * vdc; limpk = limrms * Math.sqrt(2); spmax = Math.sqrt(3) / (2 * Math.sqrt(2)) * vdc; svmax = vdc / Math.sqrt(2); svgain = (svmax / spmax - 1) * 100; }
    if (topo !== "three") { v1rms = v1pk / Math.sqrt(2); limrms = limpk / Math.sqrt(2); }
    var util = v1rms / limrms * 100, sblo = (mf - 2) * f1, sbhi = (mf + 2) * f1, c2 = 2 * mf * f1;
    var rows = [["切換頻率", int0(fsw) + " Hz"], ["基波峰值", num6(v1pk) + " V"], ["基波有效值", num6(v1rms) + " V"],
      ["方波極限峰值", num6(limpk) + " V"], ["方波極限有效值", num6(limrms) + " V"], ["直流匯流排利用率", num6(util) + " %"],
      ["第一群諧波旁波帶", int0(sblo) + "／" + int0(sbhi) + " Hz"], ["第二群中心", int0(c2) + " Hz"]];
    if (topo === "three") { rows.push(["SPWM 線性上限", num6(spmax) + " V"]); rows.push(["SVPWM 上限", num6(svmax) + " V"]); rows.push(["SVPWM 高出", num6(svgain) + " %"]); }
    var h = table2(rows), judge;
    if (mf < 9) { judge = "判讀：m_f ＝ " + num6(mf) + " 太小，載波諧波（" + int0(sblo) + "–" + int0(sbhi) + " Hz）離基波太近、LC 濾不掉，而且必須用同步調變（載波與基波鎖相）。"; }
    else if (ma >= 0.95) { judge = "判讀：m_a ＝ " + num6(ma) + " 已到線性區天花板；再往上進入過調變，基波增加變慢、出現 5、7 次低次諧波，極限是方波（利用率 100 %，現在 " + num6(util) + " %）。"; }
    else if (topo === "three" && (mf % 2 === 0 || mf % 3 !== 0)) { judge = "判讀：三相建議 m_f 為 3 的奇數倍（9、15、21、27…），現在 m_f ＝ " + int0(mf) + "：載波諧波不會在線電壓中抵消。"; }
    else { judge = "判讀：線性區，基波有效值 " + num6(v1rms) + " V，利用率 " + num6(util) + " %，第一群諧波在 " + int0(sblo) + "–" + int0(sbhi) + " Hz、LC 濾波器的 f_c 要落在 f1 與 fsw 之間。"; }
    var edge = "m_a 接近 1 時即將離開線性區，m_f 太小則諧波靠近基波。";
    if (topo === "three") { edge += " 三相注入三次諧波共模可以把線性上限拉高 " + num6(svgain) + " %，因為線電壓看不到共模。"; }
    if (mf === 99) { edge += " m_f 99 讓濾波容易，但 01 章的切換損乘 99/21。"; }
    if (ma === 0.05) { edge += " m_a 很小時脈衝極窄，死區時間的比例失真最嚴重。"; }
    h += endText(judge, "為什麼：每個切換週期的局部平均等於 D(t) × V_dc，讓 D(t) 跟著弦波走，平均就是弦波，基波峰值正比於 m_a；切換動作本身的諧波集中在載波頻率附近，m_f 越大它們離基波越遠、越容易濾掉。", edge);
    put("spwm-output", h);
  };
  bind(ids, draw); draw();
}

function thd() {
  if (!$("th-wave")) { return; }
  var ids = ["th-wave", "th-n", "th-fc", "th-dpf"];
  var draw = function () {
    var wave = pick("th-wave"), N = val("th-n"), nc = val("th-fc"), dpf = val("th-dpf"), x = thdCalc(wave, N, nc, dpf);
    var h = "<table>" + row(["次數", "相對幅值", "累加 THD"], true), i;
    for (i = 0; i < x.rows.length; i += 1) { h += row([int0(x.rows[i].n), num6(x.rows[i].r) + " %", num6(x.rows[i].cum) + " %"]); }
    h += "</table>";
    var lim = nc === 0 ? (wave === "pulse" ? "無簡單封閉式" : num6(THD_LIMIT[wave]) + " %") : "不適用（已有濾波）";
    h += table2([["THD（到 N 次）", num6(x.thd) + " %"], ["解析極限", lim], ["基波增益 H(1)", nc > 0 ? num6(x.h1) : "不適用（無濾波）"],
      ["位移功因", num6(dpf)], ["真功因", num6(x.pf)], ["失真因數", num6(1 / Math.sqrt(1 + Math.pow(x.thd / 100, 2)))] ]);
    var judge;
    if (nc >= 1 && nc <= 2) { judge = "判讀：濾波器截止只有 " + num6(nc) + " 倍基波，基波本身被改成 " + num6(x.h1) + " 倍——濾波器不該切在基波附近。"; }
    else if (x.thd > 100) { judge = "判讀：THD " + num6(x.thd) + " %，諧波的能量比基波還多；這就是電容濾波整流輸入電流的長相，真功因只剩 " + num6(x.pf) + "。"; }
    else if (x.thd > 8) { judge = "判讀：THD " + num6(x.thd) + " %，超過典型電壓限值（IEEE 519 約 5–8 %）；真功因 " + num6(x.pf) + "（位移功因 " + num6(dpf) + "）。"; }
    else { judge = "判讀：THD " + num6(x.thd) + " %，在典型限值內；真功因 " + num6(x.pf) + "。"; }
    var edge = "截止頻率落在基波或諧波附近時，濾波器可能不衰減。";
    if (nc > 0 && nc >= 3 && nc <= N && nc % 2 === 1) { edge += " 第 " + int0(nc) + " 次剛好在濾波器共振點，Q ＝ 1 時不衰減也不放大；真實 LC 若無阻尼，這一次可能被放大。"; }
    if (N === 49 && nc === 0) { edge += " 累加到 49 次仍未到極限，因為 1/n 收斂很慢；三角波的 1/n² 早就收斂。"; }
    if (wave === "pulse") { edge += " 這就是 02 章那個導通比例 10 % 的脈衝，主動 PFC 就是為了把它整成正弦。"; }
    h += endText(judge, "為什麼：THD 是各次諧波相對基波的均方根和，越低次的諧波幅值越大、貢獻越多；只有基波做功，諧波電流卻照樣佔用有效值，所以視在功率變大、真功因 ＝ 位移功因 / √(1 ＋ THD²)。", edge);
    put("thd-output", h);
  };
  bind(ids, draw); draw();
}

function thermal() {
  if (!$("tm-p")) { return; }
  var ids = ["tm-p", "tm-po", "tm-ta", "tm-jc", "tm-cs", "tm-sink", "tm-tjmax"];
  var draw = function () {
    var p = val("tm-p"), po = val("tm-po"), ta = val("tm-ta"), jc = val("tm-jc"), cs = val("tm-cs");
    var sink = pick("tm-sink"), tjmax = val("tm-tjmax"), none = sink === "none", sa = none ? 0 : SINK[sink];
    var th = none ? 60 : jc + cs + sa, tj = ta + p * th, tc = none ? 0 : ta + p * (cs + sa), ts = none ? 0 : ta + p * sa;
    var margin = tjmax - tj, tgt = tjmax - 25, req = (tgt - ta) / p - jc - cs, eta = po / (po + p) * 100;
    var intro = none ? "這個模式只用到 P、T_a 與 θ_JA ＝ 60，θ_JC 與 θ_CS 滑桿不影響結果（只用來算所需 θ_SA）。" : "這個模式只用到 P、T_a、θ_JC、θ_CS 與所選 θ_SA。";
    var na = "不適用（無散熱片）", h = "<p>" + intro + "</p>" + table2([["總熱阻", num6(th) + " °C/W"],
      ["結溫", num6(tj) + " °C"], ["殼溫", none ? na : num6(tc) + " °C"], ["散熱片溫度", none ? na : num6(ts) + " °C"],
      ["裕度", num6(margin) + " °C"], ["所需 θ<sub>SA</sub>（降額 25 °C）", num6(req) + " °C/W"], ["效率", num6(eta) + " %"]]);
    var judge, safeP = (tjmax - ta) / th;
    if (tj > tjmax) { judge = "判讀：結溫 " + num6(tj) + " °C 超過上限 " + num6(tjmax) + " °C，元件會燒毀；要把散熱片熱阻降到 " + num6(req) + " °C/W 以下，或把損耗降到 " + num6(safeP) + " W。"; }
    else if (margin < 25) { judge = "判讀：結溫 " + num6(tj) + " °C，離上限只剩 " + num6(margin) + " °C，沒有降額裕度；長期可靠度會很差。"; }
    else if (req < 0) { judge = "判讀：即使散熱片熱阻為 0，θ_JC ＋ θ_CS ＝ " + num6(jc + cs) + " °C/W 也已讓結溫超過目標——散熱片救不了，只能降損耗、換封裝或並聯元件。"; }
    else { judge = "判讀：結溫 " + num6(tj) + " °C，裕度 " + num6(margin) + " °C；散熱片熱阻最多 " + num6(req) + " °C/W 就夠。"; }
    var edge = "設計目標要比元件上限低 25 °C，並保留降額裕度。";
    if (none && p > 2) { edge += " TO-220 不裝散熱片只能撐 1–2 W。"; }
    if (ta === 70) { edge += " 車用機艙 70 °C 以上，同樣的散熱片裕度少 30 °C。"; }
    if (tjmax === 175) { edge += " SiC 允許 175 °C，但旁邊的電解電容每升 10 °C 壽命減半，系統壽命常由電容決定。"; }
    if (jc >= 3) { edge += " θ_JC 3 °C/W 以上是小封裝的典型，10 W 就有 30 °C 落在封裝內。"; }
    h += endText(judge, "為什麼：熱和電流一樣要有路走，同一個 P 依序流過結到殼、殼到散熱片、散熱片到空氣三段熱阻，每段的溫升相加就是結溫超出環境的量；θ_JC 是封裝內部的路，散熱片再好也動不了它。", edge);
    put("thermal-output", h);
  };
  bind(ids, draw); draw();
}

function trade() {
  if (!$("to-f")) { return; }
  var ids = ["to-f", "to-vin", "to-vo", "to-io", "to-ron", "to-tsw", "to-rip", "to-dv", "to-theta"];
  var draw = function () {
    var fk = val("to-f"), vin = val("to-vin"), vo = val("to-vo"), io = val("to-io"), ron = val("to-ron");
    var tsw = val("to-tsw"), rip = val("to-rip"), dv = val("to-dv"), theta = val("to-theta"), x = tradeCalc(fk, vin, vo, io, ron, tsw, rip, dv, theta);
    var labels = ["D", "Δi<sub>L</sub>", "L", "C", "峰值電流", "電感儲能", "高側導通損", "低側導通損", "切換損", "總損耗", "輸出功率", "效率", "高側結溫", "切換過渡佔週期"];
    var h, judge, i, s;
    if (!x) {
      h = "<table>" + row(["量", "數值"], true); for (i = 0; i < labels.length; i += 1) { h += row([labels[i], "不適用"]); } h += "</table>";
      h += "<table>" + row(["f<sub>sw</sub>", "L", "C", "儲能", "切換損", "總損耗", "效率", "結溫"], true);
      for (i = 0; i < SWEEP.length; i += 1) { h += row([int0(SWEEP[i]) + " kHz", "不適用", "不適用", "不適用", "不適用", "不適用", "不適用", "不適用"]); } h += "</table>";
      judge = "判讀：Buck 不能升壓。";
    } else {
      h = table2([[labels[0], num6(x.d)], [labels[1], num6(x.dil) + " A"], [labels[2], num6(x.L * 1e6) + " µH"], [labels[3], num6(x.C * 1e6) + " µF"],
        [labels[4], num6(x.ipk) + " A"], [labels[5], num6(x.EL * 1e6) + " µJ"], [labels[6], num6(x.pch) + " W"], [labels[7], num6(x.pcl) + " W"],
        [labels[8], num6(x.psw) + " W"], [labels[9], num6(x.pt) + " W"], [labels[10], num6(x.po) + " W"], [labels[11], num6(x.eta) + " %"],
        [labels[12], num6(x.tj) + " °C"], [labels[13], num6(x.occ) + " %"]]);
      h += "<table>" + row(["f<sub>sw</sub>", "L", "C", "儲能", "切換損", "總損耗", "效率", "結溫"], true);
      for (i = 0; i < SWEEP.length; i += 1) { s = tradeCalc(SWEEP[i], vin, vo, io, ron, tsw, rip, dv, theta); h += row([int0(SWEEP[i]) + " kHz", num6(s.L * 1e6) + " µH", num6(s.C * 1e6) + " µF", num6(s.EL * 1e6) + " µJ", num6(s.psw) + " W", num6(s.pt) + " W", num6(s.eta) + " %", num6(s.tj) + " °C"]); } h += "</table>";
      if (x.occ >= 20) { judge = "判讀：切換過渡佔週期 " + num6(x.occ) + " %，01 章的線性交越模型失效，這個 t_sw 切不了這個頻率。"; }
      else if (x.tj > 125) { judge = "判讀：高側結溫 " + num6(x.tj) + " °C 已超過降額目標 125 °C——降頻、降 R_on、換 SiC／GaN（t_sw 更短）或改善散熱。"; }
      else if (x.eta < 90) { judge = "判讀：效率 " + num6(x.eta) + " %，切換損 " + num6(x.psw) + " W 是主因；頻率太高，或該換更快的元件。"; }
      else if (x.EL * 1e6 > 3000) { judge = "判讀：電感儲能 " + num6(x.EL * 1e6) + " µJ（體積指標）太大，頻率太低；拉高頻率可把它縮到 1/f。"; }
      else { judge = "判讀：效率 " + num6(x.eta) + " %、電感儲能 " + num6(x.EL * 1e6) + " µJ、結溫 " + num6(x.tj) + " °C——在這組元件下 f_sw ＝ " + num6(fk) + " kHz 是可接受的折衷；看掃描表決定往哪邊推。"; }
    }
    var edge = "V_o 必須小於 V_in；過渡佔週期達 20 % 時模型失效。";
    if (tsw <= 10) { edge += " t_sw 10 ns 以下是 GaN 的地盤，同樣頻率切換損只剩 Si 的 1/4。"; }
    if (io === 20) { edge += " 電流加倍導通損乘 4、切換損乘 2，這時降 R_on 比降頻有效。"; }
    if (vo <= 3 && vin >= 48) { edge += " D 很小時高側導通極短、低側幾乎全程導通，損耗落在低側；這就是 VRM 要用多相並聯的原因之一。"; }
    h += endText(judge, "為什麼：L 與 C 都反比於 f_sw，儲能（體積）跟著縮；切換損卻正比於 f_sw、導通損不變，所以總損耗與結溫線性上升——同一個 f_sw 同時決定體積與熱，只能取捨。", edge);
    put("trade-output", h);
  };
  bind(ids, draw); draw();
}

/* ---------- 5. 字典 ---------- */
function dictionary() {
  if (!$("term-search")) { return; }
  var draw = function () {
    var q = String(pick("term-search")).toLowerCase().trim();
    var cards = document.getElementsByClassName("term-card");
    var shown = 0, i, c, hay;
    for (i = 0; i < cards.length; i += 1) {
      c = cards[i];
      hay = ((c.getAttribute("data-search") || "") + " " + (c.textContent || "")).toLowerCase();
      if (q === "" || hay.indexOf(q) !== -1) { c.removeAttribute("hidden"); shown += 1; }
      else { c.setAttribute("hidden", "hidden"); }
    }
    put("term-count", "顯示 " + int0(shown) + " / " + int0(cards.length) + " 張卡");
  };
  bind(["term-search"], draw); draw();
}

/* ---------- 6. 自我檢核 ---------- */
function selfcheck() {
  if (!$("quiz-reset")) { return; }
  var answered = {};
  var progress = function () {
    var n = 0, k;
    for (k in answered) { if (answered.hasOwnProperty(k) && answered[k]) { n += 1; } }
    put("quiz-progress", "已作答 " + int0(n) + " / " + int0(QUIZ.length) + " 題（僅供參考，不影響瀏覽）");
  };
  var link = function (id) {
    var ch = id.slice(1, 3), t = QUIZ_CH[ch];
    if (!t) { return ""; }
    return "<p>回去看：<a href=\"" + t[0] + "\">" + t[1] + "</a></p>";
  };
  var makeCheck = function (q) {
    return function () {
      var node = $(q.id), raw, ok, v, right;
      if (!node) { return; }
      raw = node.value;
      if (raw === "" || raw === null) { put(q.id + "-output", "<p>" + (q.t === "num" ? "先填一個數字。" : "先選一個選項。") + "</p>"); answered[q.id] = false; progress(); return; }
      if (q.t === "num") {
        v = Number(raw);
        if (isNaN(v)) { put(q.id + "-output", "<p>先填一個數字。</p>"); answered[q.id] = false; progress(); return; }
        ok = Math.abs(v - q.ans) <= q.tol;
      } else { ok = String(raw) === q.ans; }
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

/* ---------- 7. 註冊 ---------- */
if (typeof document !== "undefined") {
  [lvs, swloss, rect1, rect3, pwm, buck, boost, filt, spwm, thd, thermal, trade, dictionary, selfcheck].forEach(function (f) { f(); });
}

/* ---------- 8. Node 匯出 ---------- */
if (typeof module !== "undefined") {
  module.exports = { num6: num6, int0: int0, rect3Calc: rect3Calc, buckCalc: buckCalc,
    boostCalc: boostCalc, thdCalc: thdCalc, tradeCalc: tradeCalc, QUIZ: QUIZ };
}

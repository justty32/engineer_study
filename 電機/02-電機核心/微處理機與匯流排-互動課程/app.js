"use strict";
/* 微處理機與匯流排（零基礎互動課）——全站互動邏輯
   規則：確定性（無 Math.random、無 Date）、零外部資源、無 localStorage、無 fetch。
   每個 widget 一個守衛函式，檔尾統一註冊。 */

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
var chk = function (id) { var n = $(id); return n ? !!n.checked : false; };
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
/* 上標裡的整數（次方），負號用 U+2212 */
var supNum = function (n) {
  var v = Math.round(Number(n));
  return (v < 0) ? ("−" + String(Math.abs(v))) : String(v);
};
/* 科學記號一律寫成 m × 10<sup>e</sup>，不用 ASCII 的 e 記號 */
var sci = function (x, digits) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  if (v === 0) { return "0"; }
  var parts = v.toExponential(digits === undefined ? 6 : digits).split("e");
  return minus(parts[0]) + " × 10<sup>" + supNum(Number(parts[1])) + "</sup>";
};
/* 17 位有效數字；量級過大或過小時自動轉成 m × 10<sup>e</sup> */
var fmtPrec = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  var s = v.toPrecision(17);
  if (s.indexOf("e") === -1) { return minus(s); }
  var parts = s.split("e");
  return minus(parts[0]) + " × 10<sup>" + supNum(Number(parts[1])) + "</sup>";
};
var hex = function (v, w) {
  var s = (v >>> 0).toString(16).toUpperCase();
  while (s.length < w) { s = "0" + s; }
  return s;
};
var b32 = function (u) {
  var s = (u >>> 0).toString(2);
  while (s.length < 32) { s = "0" + s; }
  return s;
};
var group4 = function (s) {
  var out = [], i;
  for (i = 0; i < s.length; i += 4) { out.push(s.slice(i, i + 4)); }
  return out.join(" ");
};
/* 時間自動換算：秒 → ns／µs／ms／s，一律 6 位小數 */
var fmtTime = function (sec) {
  var v = zc(sec);
  if (v === 0) { return "0.000000 ns"; }
  if (Math.abs(v) >= 1) { return num6(v) + " s"; }
  if (Math.abs(v) >= 1e-3) { return num6(v * 1e3) + " ms"; }
  if (Math.abs(v) >= 1e-6) { return num6(v * 1e6) + " µs"; }
  return num6(v * 1e9) + " ns";
};
var esc = function (s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
var put = function (id, html) { var n = $(id); if (n) { n.innerHTML = html; } };
var row = function (cells, th) {
  var t = th ? "th" : "td";
  return "<tr><" + t + ">" + cells.join("</" + t + "><" + t + ">") + "</" + t + "></tr>";
};

/* ---------- 2. 常數（唯一定義處） ---------- */

/* 01 章：指令成本表（BUILD-SPEC 第 4 節 01 章鎖定，不得自行推算） */
var ISA_COST = {
  imm:      { name: "立即",         risc: [1, 4, 1],  cisc: [1, 6, 1], mem: 0 },
  reg:      { name: "暫存器",       risc: [1, 4, 1],  cisc: [1, 2, 1], mem: 0 },
  disp:     { name: "基址加位移",   risc: [1, 4, 1],  cisc: [1, 3, 1], mem: 1 },
  indexed:  { name: "索引加縮放",   risc: [3, 12, 3], cisc: [1, 4, 1], mem: 1 },
  indirect: { name: "記憶體間接",   risc: [2, 8, 2],  cisc: [1, 3, 2], mem: 2 },
  pcrel:    { name: "PC 相對",      risc: [2, 8, 2],  cisc: [1, 5, 1], mem: 0 }
};
var ISA_PC = 16384;

/* 05 章：分支結果樣式 */
var PATTERN = {
  loop: "TTTTTTTN",
  alt: "TN",
  ttnn: "TTNN",
  taken: "T",
  nottaken: "N"
};

/* 08 章：四組鎖定的存取序列（位元組位址） */
var CACHE_SEQ = (function () {
  var conflict = [], stride = [], loop = [], mixed = [], i, j;
  var ca = [0, 256, 4, 260, 8, 264, 12, 268, 16, 272, 20, 276, 24, 280, 28, 284];
  for (i = 0; i < ca.length; i += 1) { conflict.push({ op: "R", addr: ca[i] }); }
  for (i = 0; i < 32; i += 1) { stride.push({ op: "R", addr: 4 * i }); }
  var lb = [0, 32, 64, 96, 128, 160];
  for (j = 0; j < 3; j += 1) {
    for (i = 0; i < lb.length; i += 1) { loop.push({ op: "R", addr: lb[i] }); }
  }
  var mx = [["R", 0], ["W", 4], ["R", 32], ["W", 36], ["R", 0], ["W", 64], ["R", 96], ["W", 100],
            ["R", 32], ["W", 128], ["R", 160], ["W", 164], ["R", 0], ["W", 4], ["R", 192],
            ["W", 196], ["R", 224], ["W", 228], ["R", 0], ["W", 32]];
  for (i = 0; i < mx.length; i += 1) { mixed.push({ op: mx[i][0], addr: mx[i][1] }); }
  return { conflict: conflict, stride: stride, loop: loop, mixed: mixed };
}());
var CACHE_SEQ_NAME = {
  conflict: "兩陣列交錯（相距 256 位元組，16 筆讀）",
  stride: "順序掃描（步長 4，32 筆讀）",
  loop: "循環走訪 6 個區塊 3 遍（18 筆讀）",
  mixed: "讀寫混合（20 筆）"
};

/* 09 章：MESI 八步鎖定表。cost 為成本代號：mem／rem／upg／loc */
var MESI_SEQ = {
  pingpong: {
    name: "兩核心交替寫同一行",
    steps: [
      { act: "P0 讀 X", tx: "BusRd（主記憶體供應）", p0: "I → E", p1: "I", cost: "mem" },
      { act: "P0 寫 X", tx: "無（E 可直接升級）", p0: "E → M", p1: "I", cost: "loc" },
      { act: "P1 讀 X", tx: "BusRd（P0 供應並回寫）", p0: "M → S", p1: "I → S", cost: "rem" },
      { act: "P1 寫 X", tx: "BusUpgr", p0: "S → I", p1: "S → M", cost: "upg" },
      { act: "P0 讀 X", tx: "BusRd（P1 供應並回寫）", p0: "I → S", p1: "M → S", cost: "rem" },
      { act: "P0 寫 X", tx: "BusUpgr", p0: "S → M", p1: "S → I", cost: "upg" },
      { act: "P1 讀 X", tx: "BusRd（P0 供應並回寫）", p0: "M → S", p1: "I → S", cost: "rem" },
      { act: "P1 寫 X", tx: "BusUpgr", p0: "S → I", p1: "S → M", cost: "upg" }
    ]
  },
  share: {
    name: "兩核心只讀同一行",
    steps: [
      { act: "P0 讀 X", tx: "BusRd（主記憶體供應）", p0: "I → E", p1: "I", cost: "mem" },
      { act: "P1 讀 X", tx: "BusRd（P0 供應）", p0: "E → S", p1: "I → S", cost: "rem" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "S", p1: "S", cost: "loc" },
      { act: "P1 讀 X", tx: "無（本地命中）", p0: "S", p1: "S", cost: "loc" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "S", p1: "S", cost: "loc" },
      { act: "P1 讀 X", tx: "無（本地命中）", p0: "S", p1: "S", cost: "loc" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "S", p1: "S", cost: "loc" },
      { act: "P1 讀 X", tx: "無（本地命中）", p0: "S", p1: "S", cost: "loc" }
    ]
  },
  upgrade: {
    name: "先共享，再由 P0 獨占寫",
    steps: [
      { act: "P0 讀 X", tx: "BusRd（主記憶體供應）", p0: "I → E", p1: "I", cost: "mem" },
      { act: "P1 讀 X", tx: "BusRd（P0 供應）", p0: "E → S", p1: "I → S", cost: "rem" },
      { act: "P0 寫 X", tx: "BusUpgr", p0: "S → M", p1: "S → I", cost: "upg" },
      { act: "P0 寫 X", tx: "無（已獨占）", p0: "M", p1: "I", cost: "loc" },
      { act: "P1 讀 X", tx: "BusRd（P0 供應並回寫）", p0: "M → S", p1: "I → S", cost: "rem" },
      { act: "P0 寫 X", tx: "BusUpgr", p0: "S → M", p1: "S → I", cost: "upg" },
      { act: "P0 寫 X", tx: "無（已獨占）", p0: "M", p1: "I", cost: "loc" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" }
    ]
  },
  "private": {
    name: "只有 P0 讀寫",
    steps: [
      { act: "P0 讀 X", tx: "BusRd（主記憶體供應）", p0: "I → E", p1: "I", cost: "mem" },
      { act: "P0 寫 X", tx: "無（E 可直接升級）", p0: "E → M", p1: "I", cost: "loc" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" },
      { act: "P0 寫 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" },
      { act: "P0 寫 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" },
      { act: "P0 讀 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" },
      { act: "P0 寫 X", tx: "無（本地命中）", p0: "M", p1: "I", cost: "loc" }
    ]
  }
};

/* 10 章：頁缺失服務裝置的服務時間（秒） */
var PF_DEV = { ssd: 50e-6, hdd: 10e-3, comp: 2e-6 };
var PF_DEV_NAME = { ssd: "NVMe SSD：50 µs", hdd: "機械硬碟：10 ms", comp: "壓縮記憶體：2 µs" };

/* 12 章：匯流排家族表（BUILD-SPEC 第 4 節 12 章鎖定，不得自行推算）
   raw：原始位元率（bit/s）；eff：線路編碼效率；lines：訊號線數（null 表示 3 ＋ 從機數）；
   dist：典型最長距離（公尺）；nodes：可掛裝置數 */
var BUS = {
  spi:  { name: "SPI 50 MHz", rawText: "50 Mbit/s", raw: 50e6, eff: 1, effText: "100 %",
          lines: null, topo: "單主多從", dist: 0.3, nodes: 8 },
  i2c:  { name: "I²C 400 kHz", rawText: "400 kbit/s", raw: 400e3, eff: 8 / 9, effText: "8/9 ＝ 88.888889 %",
          lines: 2, topo: "多主多從共用", dist: 1, nodes: 112 },
  uart: { name: "UART 115200", rawText: "115.2 kbit/s", raw: 115200, eff: 0.8, effText: "8/10 ＝ 80.000000 %",
          lines: 2, topo: "點對點", dist: 15, nodes: 1 },
  can:  { name: "CAN 2.0B 500 kbit/s", rawText: "500 kbit/s", raw: 500e3, eff: 64 / 111,
          effText: "64/111 ＝ 57.657658 %", lines: 2, topo: "多主匯流排＋仲裁", dist: 40, nodes: 110 },
  usb:  { name: "USB 3.2 Gen 1", rawText: "5 Gbit/s", raw: 5e9, eff: 0.8, effText: "8b/10b ＝ 80.000000 %",
          lines: 9, topo: "階層星狀（hub）", dist: 3, nodes: 127 },
  pcie: { name: "PCIe 4.0 ×4", rawText: "64 Gbit/s（16 GT/s × 4 lane）", raw: 64e9, eff: 128 / 130,
          effText: "128/130 ＝ 98.461538 %", lines: 18, topo: "點對點（多裝置要 switch）",
          dist: 0.3, nodes: 1 }
};
var BUS_ORDER = ["spi", "i2c", "uart", "can", "usb", "pcie"];

/* 13 章：處理器家族表與效率係數（BUILD-SPEC 第 4 節 13 章鎖定，不得自行推算） */
var CHIP = {
  cpu:  { name: "通用 CPU", peak: 100,   power: 65,   price: 300,  nre: 0,     det: false },
  mcu:  { name: "MCU",      peak: 0.5,   power: 0.05, price: 3,    nre: 0,     det: true },
  dsp:  { name: "DSP",      peak: 20,    power: 2,    price: 15,   nre: 0,     det: true },
  gpu:  { name: "GPU",      peak: 20000, power: 300,  price: 1500, nre: 0,     det: false },
  npu:  { name: "NPU",      peak: 4000,  power: 5,    price: 40,   nre: 0,     det: false },
  fpga: { name: "FPGA",     peak: 500,   power: 25,   price: 200,  nre: 50000, det: true }
};
var CHIP_ORDER = ["cpu", "mcu", "dsp", "gpu", "npu", "fpga"];
var CHIP_EFF = {
  control: { cpu: 0.80, mcu: 0.80, dsp: 0.30, gpu: 0.05, npu: 0.02, fpga: 0.30 },
  mac:     { cpu: 0.30, mcu: 0.20, dsp: 0.90, gpu: 0.50, npu: 0.40, fpga: 0.80 },
  matrix:  { cpu: 0.25, mcu: 0.10, dsp: 0.40, gpu: 0.85, npu: 0.95, fpga: 0.60 },
  stream:  { cpu: 0.20, mcu: 0.10, dsp: 0.50, gpu: 0.40, npu: 0.30, fpga: 0.95 }
};
var CHIP_WORK_NAME = {
  matrix: "矩陣乘法／推論", control: "控制流密集（分支多）",
  mac: "MAC 密集（FIR 濾波）", stream: "固定管線串流"
};

/* ---------- 3. 各章 widget ---------- */

/* 00 效能公式 */
function perfeq() {
  if (!$("pf-ic")) { return; }
  var ids = ["pf-ic", "pf-cpi", "pf-freq", "pf-opt"];
  var OPT = {
    none: "不做最佳化", ic: "指令數減 20 %", cpi: "CPI 減 20 %",
    clock: "時脈加 20 %", all: "三項各改 20 %"
  };
  var draw = function () {
    var ic = val("pf-ic"), cpi = val("pf-cpi"), f = val("pf-freq"), opt = pick("pf-opt");
    var Tc = 1 / f;                       /* ns */
    var base = ic * cpi * Tc;             /* ic 單位百萬條，10⁶ × ns ＝ ms */
    var mips = f * 1000 / cpi;
    var ic2 = ic, cpi2 = cpi, f2 = f;
    if (opt === "ic" || opt === "all") { ic2 = ic * 0.8; }
    if (opt === "cpi" || opt === "all") { cpi2 = cpi * 0.8; }
    if (opt === "clock" || opt === "all") { f2 = f * 1.2; }
    var Tc2 = 1 / f2;
    var opti = ic2 * cpi2 * Tc2;
    var sp = base / opti;
    var h = "<p><strong>目前設定</strong>：IC ＝ " + int0(ic) + " × 10<sup>6</sup> 條、CPI ＝ "
      + num6(cpi) + "、時脈 ＝ " + num6(f) + " GHz。</p>";
    h += "<p>時脈週期 T<sub>c</sub> ＝ 1 / " + num6(f) + " GHz ＝ <strong>" + num6(Tc)
      + " ns</strong>；執行時間 ＝ IC × CPI × T<sub>c</sub> ＝ <strong>" + num6(base)
      + " ms</strong>；MIPS ＝ f / (CPI × 10<sup>6</sup>) ＝ <strong>" + num6(mips) + "</strong>。</p>";
    h += "<p><strong>" + OPT[opt] + "</strong> 之後：執行時間 <strong>" + num6(opti)
      + " ms</strong>，加速比 <strong>" + num6(sp) + " 倍</strong>。</p>";
    if (opt === "clock") {
      h += "<p>注意這裡的加速比是 <strong>" + num6(sp)
        + "</strong> 而不是 1.250000，因為時間與時脈成反比：時脈乘 1.2，時間是<strong>除以</strong> 1.2，"
        + "等於乘 0.833333，而不是像 CPI 那樣直接乘 0.8。</p>";
    } else if (opt === "all") {
      h += "<p>三個係數是<strong>相乘</strong>不是相加：0.8 × 0.8 ÷ 1.2 的倒數 ＝ <strong>"
        + num6(sp) + "</strong>（預設值下就是 1.875000），不是 1.25 ＋ 1.25 ＋ 1.2。</p>";
    } else if (opt === "none") {
      h += "<p>還沒有動任何一項，所以加速比是 1.000000。把上面那格切到別的選項就會看到差別。</p>";
    }
    h += "<p><strong>為什麼</strong>：三個因子相乘，所以只改一個永遠只拿到那一個的份。"
      + "編譯器與 ISA 決定 IC、微架構決定 CPI、製程與電路決定 T<sub>c</sub>，三邊各自為政。</p>";
    if (cpi >= 4) {
      h += "<p><strong>邊界</strong>：CPI 到這個量級，瓶頸幾乎一定在記憶體而不在時脈，見第 08 章。</p>";
    } else if (f === 5 && cpi === 0.25) {
      h += "<p><strong>邊界</strong>：這是超純量機器的理想值，實際上 IPC 4 已經很難維持，見第 06 章。</p>";
    } else if (ic === 1) {
      h += "<p><strong>邊界</strong>：指令太少時管線填充與快取冷啟動會主導，這條式子的平均值意義變弱。</p>";
    }
    put("perfeq-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 01 ISA 契約與定址模式 */
function isa() {
  if (!$("is-mode")) { return; }
  var ids = ["is-style", "is-mode", "is-base", "is-disp", "is-index", "is-scale"];
  var draw = function () {
    var style = pick("is-style"), mode = pick("is-mode");
    var base = val("is-base"), disp = val("is-disp"), idx = val("is-index"), scale = val("is-scale");
    var c = ISA_COST[mode];
    var risc = c.risc.slice(0), cisc = c.cisc.slice(0);
    var wide = (disp < -128 || disp > 127);
    if (wide && (mode === "disp" || mode === "indexed")) { cisc[1] = cisc[1] + 3; }
    var density = risc[1] / cisc[1];
    var ea = null, eaText = "";
    if (mode === "disp" || mode === "indirect") { ea = base + disp; }
    else if (mode === "indexed") { ea = base + idx * scale + disp; }
    else if (mode === "pcrel") { ea = ISA_PC + disp; }
    var h = "";
    if (style !== "both") {
      h += "<p>這個模式只顯示 <strong>" + (style === "risc" ? "RISC" : "CISC")
        + "</strong> 那一側，另一側的數字仍在計算但不列出。</p>";
    }
    h += "<p><strong>定址模式</strong>：" + c.name + "。</p>";
    if (ea === null) {
      eaText = "這個模式沒有有效位址，運算元不在記憶體裡";
      h += "<p><strong>有效位址</strong>：" + eaText + "。</p>";
    } else {
      var hx = (ea < 0) ? ("−0x" + hex(-ea, 1)) : ("0x" + hex(ea, 1));
      h += "<p><strong>有效位址</strong>：" + int0(ea) + "（<code>" + hx + "</code>）";
      if (mode === "indexed") {
        h += "，算式 " + int0(base) + " ＋ " + int0(idx) + " × " + int0(scale) + " ＋ " + int0(disp);
      } else if (mode === "disp" || mode === "indirect") {
        h += "，算式 " + int0(base) + " ＋ " + int0(disp);
      } else {
        h += "，算式 PC " + int0(ISA_PC) + " ＋ " + int0(disp);
      }
      h += "。</p>";
    }
    h += "<p><strong>資料記憶體存取</strong>：" + int0(c.mem) + " 次。</p>";
    h += "<table><caption>同一件事的兩種風格</caption>"
      + row(["風格", "指令數", "位元組", "micro-op"], true);
    if (style !== "cisc") { h += row(["RISC", int0(risc[0]), int0(risc[1]), int0(risc[2])]); }
    if (style !== "risc") { h += row(["CISC", int0(cisc[0]), int0(cisc[1]), int0(cisc[2])]); }
    h += "</table>";
    h += "<p><strong>碼密度比</strong>（RISC 位元組 / CISC 位元組）＝ " + int0(risc[1]) + " / "
      + int0(cisc[1]) + " ＝ <strong>" + num6(density) + "</strong>。</p>";
    if (mode === "indirect") {
      h += "<p><strong>兩次資料記憶體存取</strong>，而且第二次要等第一次的結果，"
        + "這是現代 RISC 拿掉它的原因：這條相依塞不進單一管線階段。</p>";
    }
    if (scale !== 1 && mode !== "indexed") {
      h += "<p><strong>邊界</strong>：縮放倍率只有索引定址用得到，這個模式忽略它。</p>";
    }
    if (wide) {
      h += "<p><strong>邊界</strong>：位移 " + int0(disp)
        + " 超出 1 個位元組能表示的 −128 到 127，CISC 這條指令要多花 3 個位元組。</p>";
    }
    if (ea !== null && ea < 0) {
      h += "<p><strong>邊界</strong>：有效位址算成負值，真實機器會依位元寬度回繞，"
        + "本課直接顯示負值並提醒這是設定不合理。</p>";
    }
    h += "<p><strong>為什麼</strong>：碼密度比講的是體積，micro-op 數講的才是拍數，"
      + "兩個指標會給你相反的結論。</p>";
    put("isa-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 02 IEEE 754 與端序 */
function fp754() {
  if (!$("fp-value")) { return; }
  var ids = ["fp-value", "fp-format", "fp-special", "fp-endian"];
  var SPECIAL32 = {
    zero: [0x00000000], denorm: [0x00000001], minnorm: [0x00800000],
    maxnorm: [0x7F7FFFFF], inf: [0x7F800000], nan: [0x7FC00000]
  };
  var SPECIAL64 = {
    zero: [0x00000000, 0x00000000], denorm: [0x00000000, 0x00000001],
    minnorm: [0x00100000, 0x00000000], maxnorm: [0x7FEFFFFF, 0xFFFFFFFF],
    inf: [0x7FF00000, 0x00000000], nan: [0x7FF80000, 0x00000000]
  };
  var SPECIAL_NAME = {
    normal: "用上面輸入的值", zero: "正零", denorm: "最小非正規數", minnorm: "最小正規數",
    maxnorm: "最大有限值", inf: "正無限大", nan: "quiet NaN"
  };
  var draw = function () {
    var node = $("fp-value");
    var raw = node ? node.value : "";
    var fmt = pick("fp-format"), sp = pick("fp-special"), endian = pick("fp-endian");
    var f64 = (fmt === "f64");
    var expBits = f64 ? 11 : 8, mantBits = f64 ? 52 : 23, bias = f64 ? 1023 : 127;
    var nbytes = f64 ? 8 : 4;
    var buf = new ArrayBuffer(8), dv = new DataView(buf), i;
    var h = "";
    var want = Number(raw);
    if (sp === "normal" && (raw === "" || raw === null || isNaN(want))) {
      put("fp754-output", "<p>先填一個數字。上面那格空白或不是數字時無法拆解欄位。</p>");
      return;
    }
    if (sp === "normal") {
      if (f64) { dv.setFloat64(0, want); } else { dv.setFloat32(0, want); }
    } else {
      h += "<p>這個特例（" + SPECIAL_NAME[sp] + "）<strong>忽略上面輸入的值</strong>，直接用規格定義的位元樣式。</p>";
      if (f64) {
        dv.setUint32(0, SPECIAL64[sp][0]); dv.setUint32(4, SPECIAL64[sp][1]);
      } else {
        dv.setUint32(0, SPECIAL32[sp][0]);
      }
    }
    var stored = f64 ? dv.getFloat64(0) : dv.getFloat32(0);
    var bits = f64 ? (b32(dv.getUint32(0)) + b32(dv.getUint32(4))) : b32(dv.getUint32(0));
    var sign = bits.slice(0, 1);
    var expStr = bits.slice(1, 1 + expBits);
    var mantStr = bits.slice(1 + expBits);
    var expField = parseInt(expStr, 2);
    var hexStr = f64
      ? ("0x" + hex(dv.getUint32(0), 8) + hex(dv.getUint32(4), 8))
      : ("0x" + hex(dv.getUint32(0), 8));
    var bytes = [];
    for (i = 0; i < nbytes; i += 1) { bytes.push(hex(dv.getUint8(i), 2)); }
    var ordered = (endian === "little") ? bytes.slice(0).reverse() : bytes.slice(0);
    h += "<p><strong>格式</strong>：" + (f64 ? "binary64（1 ＋ 11 ＋ 52，偏移量 1023）"
      : "binary32（1 ＋ 8 ＋ 23，偏移量 127）") + "。</p>";
    h += "<p><strong>位元分段</strong>（符號 ／ 指數 ／ 尾數）：<code>" + sign + " "
      + group4(expStr) + " " + group4(mantStr) + "</code></p>";
    h += "<p><strong>指數欄位</strong>：" + int0(expField) + "（十進位）";
    if (expField === 0) {
      h += "，全 0 表示這是零或非正規數，<strong>沒有隱含前導 1</strong>";
    } else if (expField === (f64 ? 2047 : 255)) {
      h += "，全 1 表示無限大或 NaN";
    } else {
      h += "，去偏移後 " + int0(expField) + " − " + int0(bias) + " ＝ <strong>"
        + int0(expField - bias) + "</strong>";
    }
    h += "。</p>";
    h += "<p><strong>十六進位</strong>：<code>" + hexStr + "</code></p>";
    if (isNaN(stored)) {
      h += "<p><strong>實際儲存值</strong>：NaN。NaN 不等於任何東西，包括它自己；"
        + "比較運算在這裡會全部回傳假。</p>";
    } else if (!isFinite(stored)) {
      h += "<p><strong>實際儲存值</strong>：正無限大。這不是錯誤，是規格定義的行為。</p>";
    } else {
      h += "<p><strong>實際儲存值</strong>：" + fmtPrec(stored) + "</p>";
    }
    if (sp === "normal" && isFinite(stored)) {
      var err = Math.abs(stored - want);
      h += "<p><strong>絕對誤差</strong>：" + (zc(err) === 0 ? "0" : sci(err)) + "。";
      if (zc(err) === 0) {
        h += "這個值剛好可以精確表示，因為它是 2 的次方的有限和。</p>";
      } else {
        h += "差這麼多，來源是<strong>尾數位元不夠</strong>，跟運算次數無關——"
          + "這個格式一開始就存不下那個數。</p>";
      }
    } else if (sp === "normal" && !isFinite(stored) && !isNaN(stored)) {
      h += "<p><strong>溢位成無限大</strong>，這不是錯誤是規格定義的行為。</p>";
    }
    if (isFinite(stored) && stored !== 0) {
      var e = (expField === 0) ? (1 - bias) : (expField - bias);
      var ulp = Math.pow(2, e - mantBits);
      h += "<p><strong>ULP（這個量級下相鄰兩數的間隔）</strong>：2<sup>" + supNum(e) + " − "
        + supNum(mantBits) + "</sup> ＝ 2<sup>" + supNum(e - mantBits) + "</sup> ＝ "
        + sci(ulp) + "</p>";
    } else if (stored === 0) {
      h += "<p><strong>ULP</strong>：零本身沒有量級，最靠近它的可表示數是最小非正規數。</p>";
    }
    h += "<p><strong>記憶體位元組序列</strong>（"
      + (endian === "little" ? "小端序，低位元組放低位址" : "大端序，高位元組放低位址")
      + "）：<code>" + ordered.join(" ") + "</code></p>";
    if (sp === "normal" && isFinite(want) && want !== 0 && stored === 0) {
      h += "<p><strong>邊界</strong>：下溢成零，中間那些數在這個格式裡不存在。</p>";
    }
    h += "<p><strong>為什麼</strong>：浮點的精度是相對的——同樣 " + int0(mantBits)
      + " 個尾數位元，在 12 附近可分辨到 10<sup>−7</sup>，在 10<sup>7</sup> 附近就只剩個位數。</p>";
    put("fp754-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 03 五階段管線與吞吐量 */
function pipe5() {
  if (!$("pp-n")) { return; }
  var ids = ["pp-n", "pp-stages", "pp-tcomb", "pp-latch"];
  var draw = function () {
    var N = val("pp-n"), k = val("pp-stages"), tcomb = val("pp-tcomb"), tlatch = val("pp-latch");
    if (k < 1) { k = 1; }
    if (tcomb <= 0) { tcomb = 1; }
    var T1 = tcomb + tlatch, Tp = tcomb / k + tlatch;
    var tSingle = N * T1, tPipe = (N + k - 1) * Tp;
    var speedup = tSingle / tPipe, ideal = T1 / Tp;
    var fill = (k - 1) * Tp, thr = N / tPipe, share = tlatch / Tp * 100;
    var h = "<table><caption>同一堆工作量，單週期與 " + int0(k) + " 級管線</caption>"
      + row(["量", "結果"], true)
      + row(["單週期時脈週期 T<sub>1</sub>", num6(T1) + " ns"])
      + row(["管線時脈週期 T<sub>p</sub>", num6(Tp) + " ns"])
      + row(["單週期總時間", num6(tSingle) + " ns"])
      + row(["管線總時間", num6(tPipe) + " ns"])
      + row(["實際加速比", num6(speedup) + " 倍"])
      + row(["理想加速上限 T<sub>1</sub> / T<sub>p</sub>", num6(ideal) + " 倍"])
      + row(["填充損失", num6(fill) + " ns（佔 " + num6(fill / tPipe * 100) + " %）"])
      + row(["吞吐量", num6(thr) + " 指令/ns"])
      + row(["暫存器負擔佔 T<sub>p</sub>", num6(share) + " %"])
      + "</table>";
    if (speedup < 1) {
      h += "<p><strong>這個設定下管線比單週期慢</strong>：管線改善的是吞吐量不是單條指令的延遲，"
        + "只跑 " + int0(N) + " 條指令時，" + int0(k - 1) + " 拍的填充成本全部裸露。</p>";
    }
    if (k === 1) {
      h += "<p>級數 1 就是沒有管線，加速比必然是 1.000000。</p>";
    }
    if (share >= 15) {
      h += "<p>每級暫存器已經吃掉 T<sub>p</sub> 的 15 % 以上（目前 " + num6(share)
        + " %），再加級數只是多付功耗，而且第 05 章的分支誤判懲罰會同步變大。</p>";
    }
    if (tlatch === 0) {
      h += "<p><strong>邊界</strong>：理想化的零負擔，此時加速上限剛好等於級數；真實電路做不到。</p>";
    }
    if (N === 1) {
      h += "<p><strong>邊界</strong>：只跑一條指令，填充成本全部裸露。</p>";
    }
    if (k === 12 && tcomb === 1) {
      h += "<p><strong>邊界</strong>：每級只剩 " + num6(tcomb / k)
        + " ns 的邏輯卻要付 t<sub>latch</sub>，這是切太細的典型。</p>";
    }
    h += "<p><strong>為什麼</strong>：加速比追不上級數，因為 t<sub>latch</sub> 不會被切分——"
      + "T<sub>p</sub> ＝ t<sub>comb</sub> / k ＋ t<sub>latch</sub> 裡的第二項是常數。</p>";
    put("pipe5-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 04 管線冒險、旁路與插泡 */
function pipehaz() {
  if (!$("ph-n")) { return; }
  var ids = ["ph-n", "ph-dep", "ph-forward", "ph-struct"];
  var SEQ = ["lw   x2, 0(x1)", "add  x3, x2, x4", "sub  x5, x3, x6", "and  x7, x5, x8", "or   x9, x7, x2"];
  var draw = function () {
    var N = val("ph-n"), d = Number(pick("ph-dep"));
    var fwd = chk("ph-forward"), st = chk("ph-struct");
    var pairs = Math.max(0, N - d);
    var loadUse = (1 + d <= N) ? 1 : 0;
    var per = fwd ? Math.max(0, 2 - d) : Math.max(0, 3 - d);
    var stallAt = [], i;
    for (i = 0; i <= N + 1; i += 1) { stallAt.push(0); }
    if (fwd) {
      if (loadUse && per > 0) { stallAt[1 + d] += per; }
    } else {
      for (i = d + 1; i <= N; i += 1) { stallAt[i] += per; }
    }
    if (st) { stallAt[Math.min(4, N)] += 1; }
    var stalls = 0;
    for (i = 1; i <= N; i += 1) { stalls += stallAt[i]; }
    var C = [];
    C[0] = 0;
    for (i = 1; i <= N; i += 1) { C[i] = C[i - 1] + stallAt[i]; }
    var cum = function (j) { return (j <= 0) ? 0 : C[Math.min(j, N)]; };
    var cycles = N + 4 + stalls;
    var cpi = cycles / N, steady = 1 + stalls / N;
    var span = function (a, b) { return (a === b) ? int0(a) : (int0(a) + "–" + int0(b)); };
    var shown = Math.min(N, 5);
    var h = "<table><caption>逐拍表（前 " + int0(shown) + " 條指令，拍號）</caption>"
      + row(["指令", "IF", "ID", "泡", "EX", "MEM", "WB"], true);
    for (i = 1; i <= shown; i += 1) {
      var ex = i + 2 + cum(i);
      var ifA = i + cum(i - 3), ifB = i + cum(i - 2);
      var idA = i + 1 + cum(i - 2), idB = ex - 1 - stallAt[i];
      var bub = "—";
      if (stallAt[i] > 0) { bub = "<strong>" + span(ex - stallAt[i], ex - 1) + "</strong>"; }
      h += row(["<code>" + esc(String(i) + "  " + SEQ[i - 1]) + "</code>",
        span(ifA, ifB), span(idA, Math.max(idA, idB)), bub, int0(ex), int0(ex + 1), int0(ex + 2)]);
    }
    h += "</table>";
    if (N > 5) { h += "<p>其餘依同一節奏延伸。</p>"; }
    h += "<p><strong>泡數</strong> " + int0(stalls) + " 拍｜<strong>總拍數</strong> " + int0(cycles)
      + " 拍｜<strong>CPI</strong> " + num6(cpi) + "｜<strong>穩態 CPI</strong> " + num6(steady) + "</p>";
    var noFwdStalls = Math.max(0, N - d) * Math.max(0, 3 - d) + (st ? 1 : 0);
    var fwdStalls = ((1 + d <= N) ? 1 : 0) * Math.max(0, 2 - d) + (st ? 1 : 0);
    var gain = (N + 4 + noFwdStalls) / (N + 4 + fwdStalls);
    h += "<p><strong>旁路帶來的加速</strong>（同樣 " + int0(N) + " 條、距離 " + int0(d) + "）＝ "
      + int0(N + 4 + noFwdStalls) + " / " + int0(N + 4 + fwdStalls) + " ＝ <strong>"
      + num6(gain) + " 倍</strong>。</p>";
    if (fwd && d === 1) {
      h += "<p>啟用旁路之後<strong>還是有 1 拍泡</strong>，因為載入的資料要到 MEM 結束才拿得到，"
        + "比下一條的 EX 需要的時間晚一拍——這就是載入使用冒險。</p>";
    }
    if (d === 3) {
      h += "<p>這個距離下有沒有旁路都一樣，相依已經被自然拉開。</p>";
    }
    if (st) {
      h += "<p>多出來的那一拍不是資料等不到，是 IF 與 MEM 搶同一個記憶體埠——"
        + "現代機器把指令快取與資料快取分開之後就沒有這一拍。</p>";
    }
    if (pairs === 0) {
      h += "<p><strong>邊界</strong>：這個距離下不存在相依對，此時 CPI 高是填充造成的，不是冒險。</p>";
    }
    if (N === 12 && !fwd && d === 1) {
      h += "<p><strong>邊界</strong>：" + int0(stalls) + " 拍泡，超過一半的拍數在空轉。</p>";
    }
    h += "<p><strong>為什麼</strong>：泡不是硬體壞掉，是硬體選擇等，等比算錯便宜。</p>";
    put("pipehaz-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 05 分支預測（逐筆走訪，不得用公式估算） */
function branchSim(pattern, rep, kind, init) {
  var base = PATTERN[pattern] || PATTERN.loop;
  var seq = "", i, c, a, p, s, mis = 0;
  var trace = [];
  for (i = 0; i < rep; i += 1) { seq += base; }
  if (kind === "static_t" || kind === "static_n") {
    p = (kind === "static_t") ? 1 : 0;
    for (i = 0; i < seq.length; i += 1) {
      c = seq.charAt(i);
      a = (c === "T") ? 1 : 0;
      if (p !== a) { mis += 1; }
      trace.push({ act: c, pred: p ? "T" : "N", ok: (p === a), st: "—" });
    }
  } else if (kind === "bit1") {
    s = (init === "10" || init === "11") ? 1 : 0;
    for (i = 0; i < seq.length; i += 1) {
      c = seq.charAt(i);
      a = (c === "T") ? 1 : 0;
      p = s;
      if (s !== a) { mis += 1; }
      s = a;
      trace.push({ act: c, pred: p ? "T" : "N", ok: (p === a), st: s ? "記住 T" : "記住 N" });
    }
  } else {
    s = parseInt(init, 2);
    if (isNaN(s)) { s = 1; }
    for (i = 0; i < seq.length; i += 1) {
      c = seq.charAt(i);
      a = (c === "T") ? 1 : 0;
      p = (s >= 2) ? 1 : 0;
      if (p !== a) { mis += 1; }
      s = a ? Math.min(3, s + 1) : Math.max(0, s - 1);
      trace.push({ act: c, pred: p ? "T" : "N", ok: (p === a), st: ("0" + s.toString(2)).slice(-2) });
    }
  }
  return { mis: mis, n: seq.length, trace: trace, seq: seq };
}
function branch() {
  if (!$("br-pattern")) { return; }
  var ids = ["br-pattern", "br-predictor", "br-init", "br-rep", "br-penalty", "br-freq"];
  var PNAME = {
    bit2: "2 位元飽和計數器", bit1: "1 位元預測器",
    static_t: "靜態：永遠猜跳", static_n: "靜態：永遠猜不跳"
  };
  var SNAME = { loop: "迴圈 T T T T T T T N", alt: "交替 T N", ttnn: "T T N N", taken: "全部跳", nottaken: "全部不跳" };
  var draw = function () {
    var pat = pick("br-pattern"), kind = pick("br-predictor"), init = pick("br-init");
    var rep = val("br-rep"), pen = val("br-penalty"), freq = val("br-freq");
    var r = branchSim(pat, rep, kind, init);
    var rate = r.mis / r.n, acc = 1 - rate;
    var contrib = (freq / 100) * rate * pen;
    var cpi = 1 + contrib;
    var stat = (kind === "static_t" || kind === "static_n");
    var h = "";
    if (stat) {
      h += "<p>這個預測器不看歷史，<strong>初始狀態那一格不影響結果</strong>。</p>";
    }
    h += "<p><strong>樣式</strong> " + SNAME[pat] + "（重複 " + int0(rep) + " 次，共 " + int0(r.n)
      + " 個分支）｜<strong>預測器</strong> " + PNAME[kind] + "</p>";
    var lim = Math.min(8, r.trace.length), i, t;
    h += "<table><caption>前 " + int0(lim) + " 個分支的逐筆軌跡</caption>"
      + row(["第幾個", "實際", "預測", "對錯", "更新後狀態"], true);
    for (i = 0; i < lim; i += 1) {
      t = r.trace[i];
      h += row([int0(i + 1), t.act, t.pred, t.ok ? "對" : "<strong>誤判</strong>", t.st]);
    }
    h += "</table>";
    h += "<p><strong>誤判</strong> " + int0(r.mis) + " / " + int0(r.n) + " 個分支｜<strong>誤判率</strong> "
      + num6(rate * 100) + " %｜<strong>準確率</strong> " + num6(acc * 100) + " %</p>";
    h += "<p>CPI ＝ CPI<sub>base</sub> ＋ 分支比例 × 誤判率 × 懲罰拍數 ＝ 1 ＋ " + num6(freq / 100)
      + " × " + num6(rate) + " × " + int0(pen) + " ＝ 1 ＋ <strong>" + num6(contrib)
      + "</strong> ＝ <strong>" + num6(cpi) + "</strong></p>";
    if (r.mis === r.n) {
      h += "<p><strong>這是預測器的盲區</strong>：它猜的永遠跟實際相反，誤判率 100.000000 %。"
        + "實務上靠更長的歷史（gshare、TAGE）解決，本課不展開。</p>";
    }
    if (kind === "static_t") {
      var b2 = branchSim(pat, rep, "bit2", init);
      if (r.mis < b2.mis) {
        h += "<p><strong>靜態預測在這個樣式上贏</strong>（" + int0(r.mis) + " 對 " + int0(b2.mis)
          + " 次誤判），因為計數器要付暖機成本：第一輪會為了把狀態推到飽和而多錯幾次。</p>";
      }
    }
    if (pen === 20) {
      h += "<p><strong>邊界</strong>：這是 20 級深管線的量級，此時 1 % 的誤判率就等於 0.2 拍的 CPI。</p>";
    }
    if (pat === "taken" && kind === "static_t") {
      h += "<p><strong>邊界</strong>：誤判 0 次，這是靜態預測最好的情況。</p>";
    }
    if (rep === 1) {
      h += "<p><strong>邊界</strong>：只跑一輪時暖機成本全部裸露，統計意義很弱。</p>";
    }
    h += "<p><strong>為什麼</strong>：誤判率乘上懲罰拍數才是代價，兩個數字都要看——"
      + "誤判率再低，深管線也會把它放大。</p>";
    put("branch-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 06 超純量、亂序與推測執行 */
function ooo() {
  if (!$("oo-width")) { return; }
  var ids = ["oo-width", "oo-window", "oo-lat", "oo-ilp", "oo-rename", "oo-spec", "oo-phys", "oo-arch"];
  var draw = function () {
    var w = val("oo-width"), win = val("oo-window"), lat = val("oo-lat"), ilp0 = val("oo-ilp");
    var rename = chk("oo-rename"), spec = chk("oo-spec");
    var phys = val("oo-phys"), arch = val("oo-arch");
    var space = phys - arch;
    if (space <= 0) {
      put("ooo-output", "<p><strong>沒有任何重新命名空間，機器完全停住。</strong>"
        + "實體暫存器 " + int0(phys) + " 減架構暫存器 " + int0(arch) + " ＝ " + int0(space)
        + "，在飛的指令沒有地方放結果，視窗一條都填不進去。</p>"
        + "<p><strong>為什麼</strong>：重新命名空間 ＝ 實體暫存器數 − 架構暫存器數，這個數字小於指令視窗時，"
        + "視窗買大了也填不滿。</p>");
      return;
    }
    var ilp = ilp0;
    if (!rename) { ilp = Math.min(ilp, 1.5); }
    if (!spec) { ilp = Math.min(ilp, 1.8); }
    var eff = Math.min(win, space);
    var wl = eff / lat;
    var ipc = Math.min(w, Math.min(ilp, wl));
    var cpi = 1 / ipc;
    var cand = [{ k: "發射寬度", v: w }, { k: "程式本身的 ILP", v: ilp }, { k: "視窗上限", v: wl }];
    var bn = cand[0], i;
    for (i = 1; i < cand.length; i += 1) { if (cand[i].v < bn.v) { bn = cand[i]; } }
    var rest = [];
    for (i = 0; i < cand.length; i += 1) { if (cand[i].k !== bn.k) { rest.push(cand[i].v); } }
    var next = Math.min(rest[0], rest[1]);
    var h = "<table><caption>四個限制放在同一個天平上</caption>" + row(["量", "結果"], true)
      + row(["可取平行度", num6(ilp)])
      + row(["重新命名空間（實體 − 架構）", int0(space) + " 個"])
      + row(["有效視窗 min(視窗, 命名空間)", int0(eff)])
      + row(["視窗上限（有效視窗 / 平均停留）", num6(wl)])
      + row(["有效 IPC", num6(ipc)])
      + row(["CPI ＝ 1 / IPC", num6(cpi)])
      + "</table>";
    h += "<p><strong>瓶頸</strong>：" + bn.k + "（" + num6(bn.v) + "）。"
      + "把它改善之後，IPC 會被下一個限制擋在 <strong>" + num6(next) + "</strong>。</p>";
    if (bn.k === "程式本身的 ILP") {
      h += "<p>加寬發射或加大視窗都不會有效果，瓶頸在程式本身：機器已經比程式能餵給它的還寬。</p>";
    }
    if (bn.k === "視窗上限" && space < win) {
      h += "<p>視窗買大了也填不滿，先加實體暫存器——目前命名空間只有 " + int0(space)
        + "，而視窗設在 " + int0(win) + "。</p>";
    }
    if (!rename) {
      h += "<p>取消重新命名之後，<strong>假相依（WAR 與 WAW）回來了</strong>，"
        + "可取平行度被壓到 1.500000。它們不是資料要傳過去，只是兩條指令剛好用了同一個名字。</p>";
    }
    if (!spec) {
      h += "<p>取消推測執行之後，分支把視窗切斷，可取平行度被壓到 1.800000。</p>";
    }
    if (w === 1) {
      h += "<p><strong>邊界</strong>：寬度 1 就是純量機器，IPC 不可能超過 1。</p>";
    }
    if (lat === 64) {
      h += "<p><strong>邊界</strong>：平均停留 64 拍是記憶體密集程式的量級，這時視窗才是真正的限制。</p>";
    }
    h += "<p><strong>為什麼</strong>：四個限制取最小值，所以只改非瓶頸的那一項不會有任何改變。</p>";
    put("ooo-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 07 SIMD 與 Amdahl 上限 */
function amdahl() {
  if (!$("am-p")) { return; }
  var ids = ["am-p", "am-s", "am-level", "am-width", "am-n", "am-overhead"];
  var LNAME = { dlp: "資料級 DLP（SIMD、GPU）", ilp: "指令級 ILP（超純量、亂序）", tlp: "執行緒級 TLP（多核、SMT）" };
  var draw = function () {
    var pPct = val("am-p"), s = val("am-s"), level = pick("am-level");
    var W = val("am-width"), N = val("am-n"), ov = val("am-overhead");
    var p = pPct / 100;
    var iters = Math.ceil(N / W);
    var simd = N / iters;
    var effi = simd / W * 100;
    var tail = N - (iters - 1) * W;
    var sEff = (level === "dlp") ? simd : s;
    var denomS = (1 - p) + p / sEff + ov / 100;
    var S = 1 / denomS;
    var capDen = (1 - p) + ov / 100;
    var h = "";
    if (level === "dlp") {
      h += "<p>這個層級用<strong>向量寬度與資料量</strong>算出的實際加速，上面的 s 滑桿不影響結果。</p>";
    } else {
      h += "<p>這個層級<strong>直接用 s</strong>，向量寬度與資料量那兩格不影響結果。</p>";
    }
    h += "<p><strong>層級</strong>：" + LNAME[level] + "｜可平行化比例 p ＝ " + num6(p * 100)
      + " %｜固定開銷 " + num6(ov) + " %</p>";
    h += "<table><caption>SIMD 那一段與整體加速</caption>" + row(["量", "結果"], true)
      + row(["向量迴圈次數 ⌈N / W⌉", int0(iters) + " 次"])
      + row(["SIMD 有效加速 N / ⌈N / W⌉", num6(simd) + " 倍"])
      + row(["通道使用效率", num6(effi) + " %"])
      + row(["尾數元素", int0(tail) + " 筆"])
      + row(["這一段實際用的 s", num6(sEff) + " 倍"])
      + row(["Amdahl 總加速 S", num6(S) + " 倍"])
      + "</table>";
    if (capDen <= 0) {
      h += "<p><strong>加速上限</strong>：這段程式沒有序列部分，理論上沒有上限——"
        + "真實程式不存在這種情形。</p>";
    } else {
      h += "<p><strong>加速上限（s → ∞）</strong>＝ 1 / ((1 − p) ＋ 開銷) ＝ <strong>"
        + num6(1 / capDen) + " 倍</strong>。</p>";
    }
    if (level === "dlp" && effi < 80) {
      h += "<p><strong>尾數迴圈吃掉了 " + num6(100 - effi)
        + " %</strong>：資料量不是寬度的整數倍時一定會發生，最後一次只用到 "
        + int0(tail) + " / " + int0(W) + " 條通道。</p>";
    }
    if (pPct === 0) {
      h += "<p><strong>邊界</strong>：完全不能平行，加速永遠是 1.000000。</p>";
    }
    if (N < W) {
      h += "<p><strong>邊界</strong>：資料比一個向量還少，等於只用了一部分通道。</p>";
    }
    if (W === 1) {
      h += "<p><strong>邊界</strong>：寬度 1 就是純量，這一段的加速必然 1.000000。</p>";
    }
    h += "<p><strong>為什麼</strong>：不能平行的那一段完全不受 s 影響，所以它遲早會主導。"
      + "固定開銷跟 (1 − p) 一樣會壓住天花板。</p>";
    put("amdahl-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 08 快取設計四維度（唯一實作規範，不得偏離） */
function cacheSim(seq, size, line, ways, repl, write) {
  if (!(size > 0) || !(line > 0) || !(ways >= 1)) { return { invalid: true }; }
  if (size / (line * ways) < 1) { return { invalid: true }; }
  var nsets = Math.floor(size / (line * ways));
  if (!isFinite(nsets) || nsets < 1) { return { invalid: true }; }
  var sets = [], i, j;
  for (i = 0; i < nsets; i += 1) { sets.push([]); }
  var clock = 0, hits = 0, miss = 0, memReadBytes = 0, wbBytes = 0, wtBytes = 0;
  for (i = 0; i < seq.length; i += 1) {
    clock += 1;
    var op = seq[i].op, addr = seq[i].addr;
    var blk = Math.floor(addr / line);
    var st = blk % nsets;
    var s = sets[st];
    var e = null;
    for (j = 0; j < s.length; j += 1) { if (s[j].tag === blk) { e = s[j]; break; } }
    if (e) {
      hits += 1;
      e.use = clock;
      if (op === "W") {
        if (write === "wb") { e.dirty = true; } else { wtBytes += 4; }
      }
    } else {
      miss += 1;
      var allocate = true;
      if (op === "W" && write === "wt") { allocate = false; wtBytes += 4; }
      if (allocate) {
        memReadBytes += line;
        if (s.length >= ways) {
          var vic = s[0];
          for (j = 1; j < s.length; j += 1) {
            if (repl === "lru") { if (s[j].use < vic.use) { vic = s[j]; } }
            else if (repl === "fifo") { if (s[j].ins < vic.ins) { vic = s[j]; } }
            else { if (s[j].use > vic.use) { vic = s[j]; } }
          }
          if (vic.dirty) { wbBytes += line; }
          s.splice(s.indexOf(vic), 1);
        }
        s.push({ tag: blk, dirty: (op === "W" && write === "wb"), ins: clock, use: clock });
      }
    }
  }
  for (i = 0; i < sets.length; i += 1) {
    for (j = 0; j < sets[i].length; j += 1) {
      if (sets[i][j].dirty) { wbBytes += line; }
    }
  }
  return {
    hits: hits, miss: miss, n: seq.length,
    memReadBytes: memReadBytes, wbBytes: wbBytes, wtBytes: wtBytes, nsets: nsets
  };
}
function cache() {
  if (!$("ca-seq")) { return; }
  var ids = ["ca-seq", "ca-mapping", "ca-replace", "ca-write", "ca-line", "ca-size", "ca-thit", "ca-penalty"];
  var MNAME = { direct: "直接對映", set2: "二路組相聯", set4: "四路組相聯", full: "全相聯" };
  var RNAME = { lru: "LRU 最近最少使用", fifo: "FIFO 先進先出", mru: "MRU 最近使用" };
  var WNAME = { wb: "寫回 ＋ 寫配置", wt: "寫穿 ＋ 不配置" };
  var draw = function () {
    var sq = pick("ca-seq"), mapping = pick("ca-mapping"), repl = pick("ca-replace");
    var write = pick("ca-write");
    var line = Number(pick("ca-line")), size = Number(pick("ca-size"));
    var thit = val("ca-thit"), pen = val("ca-penalty");
    var seq = CACHE_SEQ[sq] || CACHE_SEQ.conflict;
    var ways = (mapping === "direct") ? 1 : (mapping === "set2") ? 2
      : (mapping === "set4") ? 4 : Math.floor(size / line);
    var r = cacheSim(seq, size, line, ways, repl, write);
    if (r.invalid || !(ways >= 1) || !(line > 0) || !(size > 0)) {
      put("cache-output", "<p><strong>這個組合下組數不足 1</strong>：容量 " + int0(size)
        + " 位元組 ÷ (區塊 " + int0(line) + " 位元組 × " + int0(ways)
        + " 路) 小於 1。把容量調大或路數調小。</p>");
      return;
    }
    var i, blkset = {}, comp = 0;
    for (i = 0; i < seq.length; i += 1) {
      var b = Math.floor(seq[i].addr / line);
      if (!blkset[b]) { blkset[b] = 1; comp += 1; }
    }
    var fullR = cacheSim(seq, size, line, Math.floor(size / line), repl, write);
    var fullMiss = fullR.invalid ? r.miss : fullR.miss;
    var capacity = fullMiss - comp;
    var conflictRaw = r.miss - fullMiss;
    var conflictShown = Math.max(0, conflictRaw);
    var rate = r.hits / r.n * 100;
    var amat = thit + (r.miss / r.n) * pen;
    var h = "<p><strong>序列</strong> " + CACHE_SEQ_NAME[sq] + "｜<strong>設計</strong> "
      + MNAME[mapping] + "、" + RNAME[repl] + "、" + WNAME[write] + "、區塊 " + int0(line)
      + " 位元組、容量 " + int0(size) + " 位元組</p>";
    h += "<p>組數 ＝ 容量 / (區塊大小 × 路數) ＝ " + int0(size) + " / (" + int0(line) + " × "
      + int0(ways) + ") ＝ <strong>" + int0(r.nsets) + " 組</strong>，每組 " + int0(ways) + " 路。</p>";
    h += "<table><caption>模擬結果（" + int0(r.n) + " 筆存取）</caption>" + row(["量", "結果"], true)
      + row(["命中", int0(r.hits) + " 次"])
      + row(["失誤", int0(r.miss) + " 次"])
      + row(["命中率", num6(rate) + " %"])
      + row(["強制失誤（不同區塊個數）", int0(comp) + " 次"])
      + row(["容量失誤（同容量全相聯失誤 − 強制）", int0(Math.max(0, capacity)) + " 次"])
      + row(["衝突失誤（實際失誤 − 全相聯失誤）", int0(conflictShown) + " 次"])
      + row(["主記憶體讀取流量", int0(r.memReadBytes) + " 位元組"])
      + row([(write === "wb" ? "寫回流量" : "寫穿流量"),
             int0(write === "wb" ? r.wbBytes : r.wtBytes) + " 位元組"])
      + row(["AMAT ＝ t<sub>hit</sub> ＋ 失誤率 × t<sub>penalty</sub>", num6(amat) + " 拍"])
      + "</table>";
    if (conflictRaw > 0) {
      h += "<p>這 <strong>" + int0(conflictRaw) + " 次失誤在同容量全相聯下不會發生</strong>，"
        + "換成組相聯就能消掉——它們是兩個區塊搶同一組造成的，不是容量不夠。</p>";
    } else if (conflictRaw < 0) {
      h += "<p><strong>直接對映在這個序列上反而勝過同容量全相聯 LRU</strong>："
        + "全相聯配 LRU 在循環走訪超過容量時是最壞情形，每次都剛好把下一個要用的踢掉。"
        + "三分類法在這裡失效，衝突失誤顯示為 0（原始算式得到 " + int0(conflictRaw)
        + "），這是分析工具本身的破口，不是計算錯誤。</p>";
    }
    if (sq !== "mixed") {
      h += "<p>這個序列全部是讀取，<strong>寫策略那一格不影響結果</strong>。</p>";
    } else {
      h += "<p>總流量 ＝ 主記憶體讀取 " + int0(r.memReadBytes) + " ＋ "
        + (write === "wb" ? ("寫回 " + int0(r.wbBytes)) : ("寫穿 " + int0(r.wtBytes)))
        + " ＝ <strong>" + int0(r.memReadBytes + (write === "wb" ? r.wbBytes : r.wtBytes))
        + " 位元組</strong>。寫回把多次寫合併成一次整行回寫，寫穿每次只送 4 個位元組但省下逐出時的整行搬移。</p>";
    }
    if (mapping === "direct") {
      h += "<p>直接對映每組只有一路，<strong>替換策略那一格不影響結果</strong>。</p>";
    }
    if (pen === 200 && r.hits === 0) {
      h += "<p><strong>邊界</strong>：AMAT " + num6(amat) + " 拍，等於每次都直接去主記憶體，快取形同不存在。</p>";
    }
    if (line === 64 && sq === "conflict") {
      h += "<p><strong>邊界</strong>：區塊加大到 64 位元組之後，同容量下區塊數變少（"
        + int0(size / line) + " 個），兩個相距 256 位元組的陣列仍然落在同一組，"
        + "命中率<strong>沒有改善</strong>——空間區域性在這個交錯樣式上派不上用場。</p>";
    }
    h += "<p><strong>為什麼</strong>：命中率是設計與存取樣式的乘積，換一個序列同一個設計就可能從最好變最壞。</p>";
    put("cache-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 09 多核一致性 MESI */
function mesi() {
  if (!$("me-seq")) { return; }
  var ids = ["me-seq", "me-step", "me-line", "me-offset", "me-iter", "me-remote", "me-mem", "me-upg"];
  var draw = function () {
    var sq = pick("me-seq"), step = val("me-step");
    var lineSz = Number(pick("me-line")), offset = val("me-offset"), iter = val("me-iter");
    var rem = val("me-remote"), mem = val("me-mem"), upg = val("me-upg");
    var loc = 1;
    var COST = { mem: mem, rem: rem, upg: upg, loc: loc };
    var def = MESI_SEQ[sq] || MESI_SEQ.pingpong;
    var steps = def.steps;
    var total = 0, steady = 0, i;
    for (i = 0; i < 8; i += 1) { total += COST[steps[i].cost]; }
    for (i = 4; i < 8; i += 1) { steady += COST[steps[i].cost]; }
    var falseShare = (offset < lineSz);
    var steadyUse = falseShare ? steady : (4 * loc);
    var totalCycles = mem + iter * steadyUse;
    var privCycles = mem + iter * (4 * loc);
    var ratio = totalCycles / privCycles;
    var h = "<p><strong>存取樣式</strong>：" + def.name + "｜快取行 " + int0(lineSz)
      + " 位元組｜兩變數距離 " + int0(offset) + " 位元組</p>";
    if (step === 0) {
      h += "<p>還沒有任何存取：兩邊都是 I（Invalid 無效），主記憶體那一份是最新的。"
        + "把上面的滑桿往右拉就會一步一步看到狀態怎麼走。</p>";
      h += "<p><strong>為什麼</strong>：一致性的單位是快取行不是變數，所以問題出在資料佈局而不是演算法。</p>";
      put("mesi-output", h);
      return;
    }
    h += "<table><caption>MESI 狀態轉移（到第 " + int0(step) + " 步）</caption>"
      + row(["步", "動作", "匯流排交易", "P0 狀態", "P1 狀態", "成本"], true);
    for (i = 0; i < step && i < 8; i += 1) {
      h += row([int0(i + 1), steps[i].act, steps[i].tx, steps[i].p0, steps[i].p1,
        int0(COST[steps[i].cost]) + " 拍"]);
    }
    h += "</table>";
    h += "<p><strong>八步合計</strong> " + int0(total) + " 拍 / 8 次存取 ＝ <strong>"
      + num6(total / 8) + " 拍/存取</strong>｜<strong>穩態（第 5–8 步）</strong> " + int0(steady)
      + " 拍 / 4 次存取 ＝ " + num6(steady / 4) + " 拍/存取</p>";
    h += "<p>重複 " + int0(iter) + " 輪：總拍數 ＝ 冷啟動 " + int0(mem) + " ＋ " + int0(iter)
      + " × " + int0(steadyUse) + " ＝ <strong>" + int0(totalCycles)
      + " 拍</strong>；同樣次數但各寫各的行 ＝ " + int0(privCycles) + " 拍；比值 <strong>"
      + num6(ratio) + " 倍</strong>（多花 " + int0(totalCycles - privCycles) + " 拍）。</p>";
    if (falseShare && sq === "pingpong") {
      h += "<p><strong>這是偽共享</strong>：兩個核心寫的是不同變數（距離 " + int0(offset)
        + " 位元組），但硬體以整行 " + int0(lineSz) + " 位元組為單位，無法分辨，於是兩邊互相失效。</p>";
    }
    if (!falseShare) {
      h += "<p>兩個變數落在<strong>不同行</strong>（距離 " + int0(offset) + " ≥ 行大小 "
        + int0(lineSz) + "），各自維持 M，穩態回到 4 拍——加一點填充就解決了。</p>";
    }
    if (sq === "share") {
      h += "<p><strong>唯讀共享幾乎免費</strong>：S 狀態允許所有核心同時持有，之後每次都是本地命中。</p>";
    }
    if (sq === "upgrade") {
      h += "<p>E 狀態存在的意義就在第 1 到第 3 步：如果第一次讀進來就標成 S，"
        + "之後要寫時一定要發一次 BusUpgr，而實際上根本沒有別人持有它。</p>";
    }
    if (offset === 0) {
      h += "<p><strong>邊界</strong>：距離 0 表示兩個核心寫的根本是同一個變數，"
        + "這是<strong>真共享</strong>不是偽共享，要靠演算法解決而不是填充。</p>";
    }
    if (rem > mem) {
      h += "<p><strong>邊界</strong>：遠端快取比主記憶體還慢是不合理的設定，真實系統不會這樣，但公式照算。</p>";
    }
    if (iter === 1) {
      h += "<p><strong>邊界</strong>：只跑一輪時冷啟動的 " + int0(mem)
        + " 拍佔絕大部分，比值會被稀釋。</p>";
    }
    h += "<p><strong>為什麼</strong>：一致性的單位是快取行不是變數，所以問題出在資料佈局而不是演算法。</p>";
    put("mesi-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 10 TLB 與頁缺失的代價 */
function tlbcost() {
  if (!$("tl-tlbhit")) { return; }
  var ids = ["tl-tlbhit", "tl-tcost", "tl-walk", "tl-pfrate", "tl-pfdev", "tl-clock", "tl-l1hit", "tl-l1pen"];
  var draw = function () {
    var tlbhit = val("tl-tlbhit"), tcost = val("tl-tcost"), walk = val("tl-walk");
    var pfrate = val("tl-pfrate"), dev = pick("tl-pfdev"), clock = val("tl-clock");
    var l1hit = val("tl-l1hit"), l1pen = val("tl-l1pen");
    var svc = PF_DEV[dev];
    if (!svc) { svc = PF_DEV.ssd; }
    var pfCycles = svc * clock * 1e9;
    var missAmort = (1 - tlbhit / 100) * walk;
    var pfAmort = (pfrate * 1e-6) * pfCycles;
    var trans = tcost + missAmort + pfAmort;
    var data = 1 + (1 - l1hit / 100) * l1pen;
    var tot = trans + data;
    var ns = tot / clock;
    var h = "<p><strong>頁缺失服務裝置</strong>：" + PF_DEV_NAME[dev] + "，在 " + num6(clock)
      + " GHz 下換算成 <strong>" + int0(pfCycles) + " 拍</strong>——不換算就永遠沒有量級感。</p>";
    h += "<table><caption>每次記憶體存取的帳單</caption>" + row(["項目", "算式", "拍數"], true)
      + row(["TLB 查詢", "固定", num6(tcost)])
      + row(["TLB 失誤攤提", num6(1 - tlbhit / 100) + " × " + int0(walk), num6(missAmort)])
      + row(["頁缺失攤提", num6(pfrate) + " × 10<sup>−6</sup> × " + int0(pfCycles), num6(pfAmort)])
      + row(["<strong>平均轉譯成本</strong>", "三項相加", "<strong>" + num6(trans) + "</strong>"])
      + row(["資料存取成本", "1 ＋ " + num6(1 - l1hit / 100) + " × " + int0(l1pen), num6(data)])
      + row(["<strong>每次存取合計</strong>", "轉譯 ＋ 資料",
             "<strong>" + num6(tot) + " 拍（＝ " + num6(ns) + " ns）</strong>"])
      + "</table>";
    var shareTlb = missAmort / tot * 100, sharePf = pfAmort / tot * 100, shareData = data / tot * 100;
    h += "<p><strong>佔比</strong>：TLB 失誤 " + num6(shareTlb) + " %｜頁缺失 " + num6(sharePf)
      + " %｜資料存取 " + num6(shareData) + " %</p>";
    var bnName = "資料存取", bnVal = data;
    if (missAmort > bnVal) { bnName = "TLB 失誤"; bnVal = missAmort; }
    if (pfAmort > bnVal) { bnName = "頁缺失"; bnVal = pfAmort; }
    h += "<p><strong>瓶頸</strong>：" + bnName + "（" + num6(bnVal) + " 拍）。</p>";
    if (pfAmort > trans / 2) {
      h += "<p><strong>頁缺失已經主導</strong>，這時候調 TLB 或快取都沒用——"
        + "唯一的答案是不要缺頁：縮小工作集或加記憶體。</p>";
    }
    if (tlbhit === 100) {
      h += "<p>TLB 全中時轉譯只剩查詢成本，這是最好的情況。"
        + "對照組：假想完全沒有 TLB（每次都走頁表）＝ " + num6(walk + pfAmort + data) + " 拍。</p>";
    } else {
      h += "<p>對照組：假想<strong>完全沒有 TLB</strong>（每次存取都走頁表）＝ "
        + num6(walk + pfAmort + data) + " 拍，是現在的 " + num6((walk + pfAmort + data) / tot)
        + " 倍——TLB 是整個虛擬記憶體能被接受的唯一原因。</p>";
    }
    if (pfrate === 0) {
      h += "<p><strong>邊界</strong>：頁缺失率 0 是理想化假設，真實系統至少有冷啟動的強制缺頁。</p>";
    }
    if (dev === "hdd" && pfrate >= 50) {
      h += "<p><strong>邊界</strong>：這已經是顛簸的量級，唯一的解法是縮小工作集或加記憶體。</p>";
    }
    h += "<p><strong>為什麼</strong>：把時間換算成拍數才比得動——50 µs 在 2 GHz 下是十萬拍，"
      + "等於一萬條指令的機會成本。</p>";
    put("tlbcost-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 11 輪詢、中斷與 DMA */
function iomode() {
  if (!$("io-mode")) { return; }
  var ids = ["io-mode", "io-rate", "io-bytes", "io-pollc", "io-pollf", "io-isr", "io-dma",
             "io-clock", "io-perbyte"];
  var draw = function () {
    var mode = pick("io-mode"), rate = val("io-rate"), bytes = val("io-bytes");
    var pollc = val("io-pollc"), pollf = val("io-pollf"), isr = val("io-isr");
    var dma = val("io-dma"), clock = val("io-clock"), perbyte = val("io-perbyte");
    var hz = clock * 1e9;
    var cPoll = pollf * pollc + rate * bytes * perbyte;
    var cIrq = rate * (isr + bytes * perbyte);
    var cDma = rate * dma;
    var uPoll = cPoll / hz * 100, uIrq = cIrq / hz * 100, uDma = cDma / hz * 100;
    var thru = rate * bytes;
    var latPoll = 1 / pollf, latIrq = 200 / hz;
    var h = "";
    if (mode !== "all") {
      h += "<p>只顯示這一種方式，其餘兩列隱藏（計算照舊）。</p>";
    }
    h += "<table><caption>同一個事件率與資料量下的三張帳單</caption>"
      + row(["方式", "每秒拍數", "CPU 佔用率"], true);
    if (mode === "all" || mode === "poll") {
      h += row(["輪詢", int0(cPoll), num6(uPoll) + " %"]);
    }
    if (mode === "all" || mode === "irq") {
      h += row(["中斷", int0(cIrq), num6(uIrq) + " %"]);
    }
    if (mode === "all" || mode === "dma") {
      h += row(["DMA", int0(cDma), num6(uDma) + " %"]);
    }
    h += "</table>";
    h += "<p><strong>資料吞吐量</strong> ＝ " + int0(rate) + " × " + int0(bytes) + " ＝ "
      + int0(thru) + " 位元組/秒</p>";
    h += "<p><strong>輪詢的最壞事件延遲</strong> ＝ 1 / " + int0(pollf) + " ＝ "
      + num6(latPoll * 1e6) + " µs｜<strong>中斷延遲</strong>（200 拍 @ " + num6(clock)
      + " GHz）＝ " + num6(latIrq * 1e6) + " µs</p>";
    var best = "DMA", bv = uDma;
    if (uPoll < bv) { best = "輪詢"; bv = uPoll; }
    if (uIrq < bv) { best = "中斷"; bv = uIrq; }
    h += "<p><strong>目前設定下佔用最低的是</strong>：" + best + "（" + num6(bv) + " %）。</p>";
    if (pollf < rate) {
      h += "<p><strong>輪詢頻率低於事件率</strong>，兩次查詢之間會來不只一個事件，"
        + "裝置緩衝區溢位就會漏資料。輪詢頻率必須大於等於事件率。</p>";
    }
    if (uPoll > 100 || uIrq > 100 || uDma > 100) {
      h += "<p><strong>佔用率超過 100 %</strong>：這個設定下 CPU 已經被吃光，"
        + "實際會開始漏事件或延遲暴增。</p>";
    }
    if (rate === 1) {
      h += "<p><strong>邊界</strong>：事件率極低時輪詢幾乎全部白做，中斷明顯划算。</p>";
    }
    if (bytes === 4096 && rate === 100000) {
      h += "<p><strong>邊界</strong>：程式化搬移已經吃掉大半個 CPU，這是 DMA 存在的理由。</p>";
    }
    h += "<p><strong>為什麼</strong>：輪詢的成本看的是查詢頻率，中斷看的是事件率，"
      + "DMA 兩者都不看——所以答案會隨事件率翻轉，沒有哪一種永遠比較好。</p>";
    put("iomode-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 12 匯流排家族選型 */
function buspick() {
  if (!$("bs-family")) { return; }
  var ids = ["bs-family", "bs-payload", "bs-nodes", "bs-len", "bs-need"];
  var effRate = function (k) { return BUS[k].raw * BUS[k].eff / 8; };   /* 位元組/秒 */
  var draw = function () {
    var fam = pick("bs-family"), payload = val("bs-payload");
    var nodes = val("bs-nodes"), len = val("bs-len"), need = val("bs-need");
    var b = BUS[fam] || BUS.spi;
    var rateBps = effRate(fam);
    var bytes = payload * 1024;
    var t = bytes / rateBps;
    var lines = (b.lines === null) ? (3 + nodes) : b.lines;
    var okRate = (rateBps >= need * 1e6);
    var okNodes = (nodes <= b.nodes);
    var okLen = (len <= b.dist);
    var h = "<p><strong>家族</strong>：" + b.name + "｜原始位元率 " + b.rawText
      + "｜編碼效率 " + b.effText + "｜拓樸 " + b.topo + "</p>";
    h += "<p><strong>有效位元組率</strong> ＝ 原始位元率 × 編碼效率 / 8 ＝ <strong>"
      + num6(rateBps / 1e6) + " MB/s</strong>（MB 是 10<sup>6</sup> 位元組）</p>";
    h += "<p><strong>傳 " + int0(payload) + " KiB（" + int0(bytes) + " 位元組，KiB 是 2 的次方）要多久</strong>："
      + fmtTime(t) + "</p>";
    h += "<p><strong>訊號線數</strong>：" + int0(lines) + " 條"
      + (b.lines === null ? "（3 ＋ 從機數 " + int0(nodes) + "）" : "") + "</p>";
    h += "<table><caption>三項判定</caption>" + row(["項目", "判定", "差多少"], true)
      + row(["速率（需求 " + num6(need) + " MB/s）", okRate ? "通過" : "<strong>不通過</strong>",
             okRate ? ("多出 " + num6(rateBps / 1e6 - need) + " MB/s")
                    : ("還差 " + num6(need - rateBps / 1e6) + " MB/s")])
      + row(["裝置數（上限 " + int0(b.nodes) + "）", okNodes ? "通過" : "<strong>不通過</strong>",
             okNodes ? ("還可加 " + int0(b.nodes - nodes) + " 個")
                     : ("超出 " + int0(nodes - b.nodes) + " 個")])
      + row(["距離（典型 " + num6(b.dist) + " m）", okLen ? "通過" : "<strong>不通過</strong>",
             okLen ? ("還有 " + num6(b.dist - len) + " m") : ("超出 " + num6(len - b.dist) + " m")])
      + "</table>";
    var i, k;
    h += "<table><caption>同一筆 " + int0(payload) + " KiB 在六種介面上的傳輸時間</caption>"
      + row(["家族", "有效位元組率（MB/s）", "傳輸時間"], true);
    for (i = 0; i < BUS_ORDER.length; i += 1) {
      k = BUS_ORDER[i];
      h += row([BUS[k].name, num6(effRate(k) / 1e6), fmtTime(bytes / effRate(k))]);
    }
    h += "</table>";
    if (!okRate || !okNodes || !okLen) {
      var alt = "CAN 2.0B 500 kbit/s";
      if (!okRate) { alt = (need > 500) ? "PCIe 4.0 ×4" : "USB 3.2 Gen 1"; }
      else if (!okNodes) { alt = "I²C 400 kHz 或 CAN 2.0B"; }
      else if (!okLen) { alt = (len > 15) ? "CAN 2.0B（40 m）" : "UART 115200（15 m）"; }
      h += "<p><strong>這個組合不通過</strong>："
        + (!okRate ? "速率不足；" : "") + (!okNodes ? "裝置數超過；" : "")
        + (!okLen ? "距離超過；" : "") + "可以改看 <strong>" + alt + "</strong>。</p>";
    }
    if (fam === "spi") {
      h += "<p>SPI 的線數會<strong>隨從機數增加</strong>：每個從機要一條獨立的晶片選擇線，"
        + "線數 ＝ 3 ＋ 從機數，這是它擴充性的天花板；I²C 用位址取代選擇線，永遠只要 2 條。</p>";
    }
    if (fam === "can") {
      h += "<p>CAN 的效率只有 57.657658 %，換到的是<strong>位元級無破壞性仲裁與強健的錯誤偵測</strong>："
        + "識別碼、CRC、確認槽與訊框間隔都不是資料，但它們是可靠與多主共存的代價。</p>";
    }
    if (fam === "pcie" && nodes > 1) {
      h += "<p><strong>邊界</strong>：PCIe 是點對點，多裝置要靠 switch，本課的一階模型不計 switch 的延遲。</p>";
    }
    if (len > b.dist * 2) {
      h += "<p><strong>邊界</strong>：這個距離下訊號完整性才是主要問題，速率反而不是，見電磁學與 EMC 主題。</p>";
    }
    if (payload === 1 && fam === "pcie") {
      h += "<p><strong>邊界</strong>：傳輸時間進入 ns 量級，此時<strong>協定與軟體開銷遠大於傳輸本身</strong>，"
        + "這條算式量到的已經不是瓶頸。</p>";
    }
    h += "<p><strong>為什麼</strong>：有效位元組率不是原始位元率除以 8，"
      + "中間還要扣掉線路編碼與協定開銷。這些是教學用的代表值不是規格書，換世代數字就變，但算法一樣。</p>";
    put("buspick-output", h);
  };
  bind(ids, draw);
  draw();
}

/* 13 處理器家族選型 */
function chippick() {
  if (!$("cp-family")) { return; }
  var ids = ["cp-family", "cp-work", "cp-ops", "cp-power", "cp-volume", "cp-latency"];
  var draw = function () {
    var fam = pick("cp-family"), work = pick("cp-work");
    var ops = val("cp-ops"), power = val("cp-power");
    var vol = val("cp-volume"), lat = val("cp-latency");
    var eff = CHIP_EFF[work] || CHIP_EFF.matrix;
    var rows = [], i, k, c, ach, n, tp, tc, feas;
    for (i = 0; i < CHIP_ORDER.length; i += 1) {
      k = CHIP_ORDER[i];
      c = CHIP[k];
      ach = c.peak * eff[k];
      n = Math.ceil(ops / ach);
      tp = n * c.power;
      tc = c.price * n * vol + c.nre;
      feas = (tp <= power) && (lat >= 10 || c.det);
      rows.push({ k: k, name: c.name, ach: ach, n: n, tp: tp, tc: tc,
                  ee: ach / c.power, feas: feas, det: c.det });
    }
    var h = "<p><strong>工作負載</strong>：" + CHIP_WORK_NAME[work] + "｜需求 " + num6(ops)
      + " Gops/s｜功耗預算 " + num6(power) + " W｜產量 " + int0(vol) + " 顆｜可容忍延遲 "
      + num6(lat) + " µs</p>";
    if (fam !== "all") {
      h += "<p>只顯示這一個家族，<strong>建議欄位仍以全部六個家族比較的結果為準</strong>。</p>";
    }
    h += "<table><caption>六個家族的帳單</caption>"
      + row(["家族", "實際可達（Gops/s）", "顆數", "總功耗（W）", "總成本（美元）",
             "能效（Gops/W）", "可行"], true);
    for (i = 0; i < rows.length; i += 1) {
      if (fam !== "all" && fam !== rows[i].k) { continue; }
      h += row([rows[i].name, num6(rows[i].ach), int0(rows[i].n), num6(rows[i].tp),
        int0(rows[i].tc), num6(rows[i].ee),
        rows[i].feas ? "<strong>是</strong>" : "否"]);
    }
    h += "</table>";
    var ok = [];
    for (i = 0; i < rows.length; i += 1) { if (rows[i].feas) { ok.push(rows[i]); } }
    var best = null;
    for (i = 0; i < ok.length; i += 1) { if (!best || ok[i].tc < best.tc) { best = ok[i]; } }
    if (best) {
      h += "<p><strong>建議：" + best.name + "</strong>（" + int0(best.n) + " 顆、" + num6(best.tp)
        + " W、" + int0(best.tc) + " 美元）——在滿足功耗與延遲的家族裡總成本最低。</p>";
      if (ok.length >= 2) {
        var second = null;
        for (i = 0; i < ok.length; i += 1) {
          if (ok[i] !== best && (!second || ok[i].tc < second.tc)) { second = ok[i]; }
        }
        h += "<p>有 " + int0(ok.length) + " 個家族都可行，<strong>兩者都滿足需求時比的是總成本</strong>："
          + best.name + " 比 " + second.name + " 便宜 " + int0(second.tc - best.tc) + " 美元。</p>";
      }
      var bestEE = ok[0];
      for (i = 1; i < ok.length; i += 1) { if (ok[i].ee > bestEE.ee) { bestEE = ok[i]; } }
      if (bestEE !== best) {
        h += "<p>" + bestEE.name + " 的能效贏 <strong>" + num6(bestEE.ee / best.ee)
          + " 倍</strong>卻沒被選上，因為總成本較高（差 " + int0(bestEE.tc - best.tc) + " 美元）。</p>";
      }
    } else {
      var near = rows[0];
      for (i = 1; i < rows.length; i += 1) { if (rows[i].tp < near.tp) { near = rows[i]; } }
      h += "<p><strong>目前的功耗預算或延遲要求下沒有可行方案</strong>，最接近的是 " + near.name
        + "（" + num6(near.tp) + " W），還差 " + num6(near.tp - power) + " W"
        + ((lat < 10 && !near.det) ? "，而且它沒有確定性延遲" : "") + "。</p>";
    }
    if (lat < 10) {
      h += "<p>這個延遲要求<strong>排除了 CPU、GPU 與 NPU</strong>，它們沒有確定性延遲："
        + "有作業系統排程與批次處理，最壞情況沒有上界。只有 MCU、DSP、FPGA 給得起硬即時。</p>";
    }
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i].n >= 10) {
        h += "<p><strong>邊界</strong>：" + rows[i].name + " 需要 " + int0(rows[i].n)
          + " 顆——這個數字本身就是答案：這個家族不適合這種工作負載，"
          + "它的效率係數只有 " + num6(eff[rows[i].k]) + "。</p>";
        break;
      }
    }
    if (vol <= 100) {
      h += "<p><strong>邊界</strong>：產量只有 " + int0(vol) + " 顆時，FPGA 的一次性工程費用 50000 美元"
        + "攤到每顆是 " + num6(50000 / vol) + " 美元，<strong>NRE 在小量時完全主導</strong>；"
        + "產量一大它就可以忽略，這條交叉線就是選型決策的核心。</p>";
    }
    h += "<p><strong>為什麼</strong>：峰值只是入場券，效率係數、功耗與產量才決定誰真的能用。"
      + "Gops/s 的 ops 在不同家族指的不是同一種運算，跨家族比峰值本來就不公平。</p>";
    put("chippick-output", h);
  };
  bind(ids, draw);
  draw();
}

/* ---------- 4. 字典 ---------- */
function dictionary() {
  if (!$("term-search")) { return; }
  var draw = function () {
    var q = String(pick("term-search")).toLowerCase().trim();
    var cards = document.getElementsByClassName("term-card");
    var shown = 0, i, c, hay;
    for (i = 0; i < cards.length; i += 1) {
      c = cards[i];
      hay = ((c.getAttribute("data-search") || "") + " " + (c.textContent || "")).toLowerCase();
      if (q === "" || hay.indexOf(q) !== -1) {
        c.removeAttribute("hidden");
        shown += 1;
      } else {
        c.setAttribute("hidden", "hidden");
      }
    }
    put("term-count", "顯示 " + int0(shown) + " / " + int0(cards.length) + " 張卡");
  };
  bind(["term-search"], draw);
  draw();
}

/* ---------- 5. 自我檢核 ---------- */
var QUIZ_CH = {
  "00": ["00-微處理機世界觀與效能公式.html", "00 微處理機世界觀與效能公式"],
  "01": ["01-ISA契約與定址模式.html", "01 ISA 契約與定址模式"],
  "02": ["02-IEEE754與端序.html", "02 IEEE 754 與端序"],
  "03": ["03-五階段管線與吞吐量.html", "03 五階段管線與吞吐量"],
  "04": ["04-管線冒險旁路與插泡.html", "04 管線冒險、旁路與插泡"],
  "05": ["05-分支預測與管線清空.html", "05 分支預測與管線清空"],
  "06": ["06-超純量亂序與推測執行.html", "06 超純量、亂序與推測執行"],
  "07": ["07-SIMD與平行加速上限.html", "07 SIMD 與平行加速上限"],
  "08": ["08-快取設計四維度.html", "08 快取設計四維度"],
  "09": ["09-多核一致性MESI.html", "09 多核一致性 MESI"],
  "10": ["10-TLB與頁缺失的代價.html", "10 TLB 與頁缺失的代價"],
  "11": ["11-輪詢中斷與DMA.html", "11 輪詢、中斷與 DMA"],
  "12": ["12-匯流排家族PCIe到CAN.html", "12 匯流排家族：PCIe 到 CAN"],
  "13": ["13-處理器家族選型.html", "13 處理器家族選型"]
};
var QUIZ = [
  { id: "q00-1", t: "num", ans: 75, tol: 0.5,
    why: "IC × CPI × T_c ＝ 100 × 10⁶ × 1.5 × 0.5 ns ＝ 75.000000 ms。",
    err: "常見錯因：忘了把 T_c 從 GHz 換成 ns。" },
  { id: "q00-2", t: "num", ans: 1333.333333, tol: 1,
    why: "MIPS ＝ f / (CPI × 10⁶) ＝ 2 × 10⁹ / 1.5 / 10⁶ ＝ 1333.333333。",
    err: "常見錯因：把 IC 也乘進去了——MIPS 這個指標裡沒有指令數這一項。" },
  { id: "q00-3", t: "sel", ans: "a",
    why: "時間與時脈成反比，加 20 % 只等於乘 1 / 1.2 ≈ 0.833333，而 CPI 減 20 % 是乘 0.8。",
    err: "常見錯因：把「加 20 %」與「減 20 %」當成對稱。" },
  { id: "q01-1", t: "num", ans: 1060, tol: 0.5,
    why: "有效位址 ＝ 基底 ＋ 索引 × 縮放 ＋ 位移 ＝ 1024 ＋ 5 × 4 ＋ 16 ＝ 1060（0x424）。",
    err: "常見錯因：忘了乘縮放倍率。" },
  { id: "q01-2", t: "num", ans: 3, tol: 0.05,
    why: "碼密度比 ＝ RISC 位元組 / CISC 位元組 ＝ 12 / 4 ＝ 3.000000。",
    err: "常見錯因：把比值倒過來。" },
  { id: "q01-3", t: "sel", ans: "a",
    why: "外面是 CISC 編碼、裡面解碼成類 RISC 的 micro-op，兩件事是不同層次的敘述，同時成立。",
    err: "常見錯因：以為兩種說法互相反駁。" },
  { id: "q02-1", t: "sel", ans: "a",
    why: "12.375 ＝ 1.100011 × 2³，指數欄位 3 ＋ 127 ＝ 130 ＝ 1000 0010，合起來是 0x41460000。",
    err: "常見錯因：指數欄位忘了加偏移量 127。" },
  { id: "q02-2", t: "num", ans: 3, tol: 0.5,
    why: "指數欄位 130 減偏移量 127 ＝ 3。",
    err: "常見錯因：直接填了指數欄位的 130。" },
  { id: "q02-3", t: "sel", ans: "a",
    why: "0.1 在二進位是無限循環小數，截到 24 個有效位元一定有殘差，存進去變成 0.100000001490116…。",
    err: "常見錯因：以為誤差是運算造成的——這個格式一開始就存不下那個數。" },
  { id: "q03-1", t: "num", ans: 228.8, tol: 0.05,
    why: "T_p ＝ 10.0 / 5 ＋ 0.2 ＝ 2.2 ns；總時間 ＝ (100 ＋ 4) × 2.2 ＝ 228.800000 ns。",
    err: "常見錯因：忘了 k − 1 拍的填充。" },
  { id: "q03-2", t: "num", ans: 4.458042, tol: 0.005,
    why: "1020 / 228.8 ＝ 4.458042 倍，追不上級數 5，因為 t_latch 不會被切分。",
    err: "常見錯因：直接用級數 5 當答案。" },
  { id: "q03-3", t: "sel", ans: "a",
    why: "管線沒有縮短單條指令的延遲，反而多付了每級暫存器的負擔：k × T_p ＞ T_1。",
    err: "常見錯因：把吞吐量與延遲混為一談。" },
  { id: "q04-1", t: "num", ans: 10, tol: 0.5,
    why: "5 ＋ 4 ＋ 1 ＝ 10 拍：填充 4 拍加上載入使用那 1 拍泡。",
    err: "常見錯因：忘了載入使用那一拍泡。" },
  { id: "q04-2", t: "num", ans: 17, tol: 0.5,
    why: "沒有旁路時每一對相依要插 3 − 1 ＝ 2 拍，4 對共 8 拍，5 ＋ 4 ＋ 8 ＝ 17 拍。",
    err: "常見錯因：每對只算 1 拍泡而不是 2 拍。" },
  { id: "q04-3", t: "sel", ans: "a",
    why: "載入的資料要到 MEM 結束才拿得到，比下一條的 EX 需要的時間晚一拍，旁路只能接到再下一拍。",
    err: "常見錯因：以為旁路能把時間往前搬——它只是改走一條比較短的線。" },
  { id: "q05-1", t: "num", ans: 5, tol: 0.5,
    why: "第 1 輪誤判 2 次（初始弱不跳猜錯一次、每輪最後的 N 猜錯一次），第 2 到第 4 輪各 1 次，共 5 次。",
    err: "常見錯因：忘了第一輪的暖機那一次。" },
  { id: "q05-2", t: "num", ans: 8, tol: 0.5,
    why: "1 位元預測器在每輪的 N 錯一次、下一輪第一個 T 又錯一次，4 輪共 8 次。",
    err: "常見錯因：只算了每輪最後那個不跳。" },
  { id: "q05-3", t: "sel", ans: "a",
    why: "1 位元預測器永遠猜上一次的結果，而 T N 交替時每一次都跟上一次相反，所以全錯。",
    err: "常見錯因：以為換初始值就能救——換了只是把錯的位置整批平移。" },
  { id: "q06-1", t: "num", ans: 2.5, tol: 0.05,
    why: "IPC ＝ min(發射寬度 4, 可取 ILP 2.5, 視窗上限 64 / 16 ＝ 4) ＝ 2.500000，瓶頸是程式本身。",
    err: "常見錯因：直接填發射寬度 4。" },
  { id: "q06-2", t: "num", ans: 1.5, tol: 0.05,
    why: "沒有重新命名時假相依把可取平行度壓到 1.5，IPC 也跟著變成 1.500000。",
    err: "常見錯因：以為重新命名不影響——WAR 與 WAW 會回來。" },
  { id: "q06-3", t: "sel", ans: "a",
    why: "WAR 與 WAW 只是兩條指令剛好用了同一個名字，換個實體暫存器就沒了。",
    err: "常見錯因：以為它能消掉所有相依——RAW 真相依換不掉。" },
  { id: "q07-1", t: "num", ans: 3.333333, tol: 0.005,
    why: "S ＝ 1 / ((1 − 0.8) ＋ 0.8 / 8) ＝ 1 / 0.3 ＝ 3.333333 倍。",
    err: "常見錯因：直接填 s 的 8——那 20 % 不能平行的部分完全不受 s 影響。" },
  { id: "q07-2", t: "num", ans: 5, tol: 0.05,
    why: "上限 ＝ 1 / (1 − p) ＝ 1 / 0.2 ＝ 5.000000 倍，跟 s 無關。",
    err: "常見錯因：以為上限跟 s 有關。" },
  { id: "q07-3", t: "num", ans: 63, tol: 0.5,
    why: "⌈1000 / 16⌉ ＝ 63 次，最後一次只用了 8 條通道。",
    err: "常見錯因：忘了向上取整。" },
  { id: "q08-1", t: "num", ans: 0, tol: 0.5,
    why: "位址 0–28 在區塊 0、256–284 在區塊 8，8 mod 8 ＝ 0，兩者搶同一組，命中率 0.000000 %。",
    err: "常見錯因：以為兩個陣列會落在不同組。" },
  { id: "q08-2", t: "num", ans: 87.5, tol: 0.5,
    why: "二路組相聯讓兩個區塊各佔一路，只剩兩次強制失誤，命中 14 / 16 ＝ 87.500000 %。",
    err: "常見錯因：忘了兩次強制失誤——第一次碰到的區塊一定不在快取裡。" },
  { id: "q08-3", t: "sel", ans: "a",
    why: "同容量全相聯只失誤 2 次，所以 16 − 2 ＝ 14 次是衝突失誤，換成組相聯就能消掉。",
    err: "常見錯因：把「容量不夠」當成唯一解釋。" },
  { id: "q09-1", t: "num", ans: 100, tol: 0.5,
    why: "穩態每輪 ＝ 40 ＋ 10 ＋ 40 ＋ 10 ＝ 100 拍 / 4 次存取 ＝ 25.000000 拍/存取。",
    err: "常見錯因：只算了兩次遠端傳輸，忘了兩次失效廣播。" },
  { id: "q09-2", t: "num", ans: 4, tol: 0.5,
    why: "各自維持 M 狀態，四次都是本地命中，每次 1 拍，共 4 拍——差 25.000000 倍。",
    err: "常見錯因：以為多核一定要付一致性成本。" },
  { id: "q09-3", t: "sel", ans: "a",
    why: "E 讓「讀了之後接著寫」這個最常見的樣式省下一次 BusUpgr 廣播。",
    err: "常見錯因：把 E 跟 S 當成同一件事——S 表示可能有別人持有。" },
  { id: "q10-1", t: "num", ans: 2.1, tol: 0.02,
    why: "1 ＋ 0.01 × 100 ＋ 10⁻⁶ × 100000 ＝ 1 ＋ 1 ＋ 0.1 ＝ 2.100000 拍。",
    err: "常見錯因：忘了把 50 µs 換算成拍——在 2 GHz 下那是十萬拍。" },
  { id: "q10-2", t: "num", ans: 6.1, tol: 0.02,
    why: "轉譯 2.1 ＋ 資料 (1 ＋ 0.05 × 60 ＝ 4.0) ＝ 6.100000 拍。",
    err: "常見錯因：把兩項相乘而不是相加。" },
  { id: "q10-3", t: "sel", ans: "a",
    why: "一次頁缺失是十萬拍，攤下來仍佔總成本 1.639344 %，率再高一百倍就完全主導。",
    err: "常見錯因：只看機率不看懲罰量級。" },
  { id: "q11-1", t: "num", ans: 0.06, tol: 0.005,
    why: "DMA ＝ 1000 × 1200 ＝ 1200000 拍/秒，除以 2 × 10⁹ ＝ 0.060000 %。",
    err: "常見錯因：把資料搬移也算進 DMA——資料是由控制器搬的，CPU 只付設定與完成中斷。" },
  { id: "q11-2", t: "num", ans: 0.1424, tol: 0.005,
    why: "中斷 ＝ 1000 × (800 ＋ 512 × 4) ＝ 2848000 拍/秒，除以 2 × 10⁹ ＝ 0.142400 %。",
    err: "常見錯因：忘了每位元組 4 拍的搬移成本。" },
  { id: "q11-3", t: "sel", ans: "a",
    why: "輪詢的成本只看輪詢頻率不看事件率，事件率低時大部分查詢都白查。",
    err: "常見錯因：以為輪詢一定比較省——它在高事件率下才划算。" },
  { id: "q12-1", t: "num", ans: 8.32, tol: 0.05,
    why: "有效位元組率 ＝ 64 × 10⁹ × 128/130 / 8 ＝ 7876.923077 MB/s，65536 / 該值 ＝ 8.320000 µs。",
    err: "常見錯因：忘了乘 128/130 的編碼效率。" },
  { id: "q12-2", t: "num", ans: 5.688889, tol: 0.01,
    why: "8N1 每個位元組要 10 個位元，有效位元組率 ＝ 115200 × 0.8 / 8 ＝ 11520 位元組/秒，"
      + "65536 / 11520 ＝ 5.688889 秒。",
    err: "常見錯因：用 8 個位元而不是 10 個位元算一個位元組。" },
  { id: "q12-3", t: "sel", ans: "a",
    why: "一個標準訊框要 111 個位元才送 64 位元資料，仲裁、CRC 與確認都吃頻寬，效率只有 57.657658 %。",
    err: "常見錯因：把原始位元率當成資料率。" },
  { id: "q13-1", t: "num", ans: 2, tol: 0.5,
    why: "實際可達 ＝ 20 × 0.40 ＝ 8 Gops/s，⌈10 / 8⌉ ＝ 2 顆。",
    err: "常見錯因：忘了乘效率係數就直接除峰值。" },
  { id: "q13-2", t: "num", ans: 4, tol: 0.05,
    why: "2 顆 × 2 W ＝ 4.000000 W，剛好在 5 W 的預算內。",
    err: "常見錯因：只算一顆的功耗。" },
  { id: "q13-3", t: "sel", ans: "a",
    why: "兩者都滿足需求時比的是總成本，NPU 單價高、產量 10000 顆時總價貴 100000 美元。",
    err: "常見錯因：把能效當成唯一指標。" }
];
function selfcheck() {
  if (!$("quiz-reset")) { return; }
  var answered = {};
  var progress = function () {
    var n = 0, k;
    for (k in answered) { if (answered.hasOwnProperty(k) && answered[k]) { n += 1; } }
    put("quiz-progress", "已作答 " + int0(n) + " / " + int0(QUIZ.length) + " 題（僅供參考，不影響瀏覽）");
  };
  var link = function (id) {
    var ch = id.slice(1, 3);
    var t = QUIZ_CH[ch];
    if (!t) { return ""; }
    return "<p>回去看：<a href=\"" + t[0] + "\">" + t[1] + "</a></p>";
  };
  var makeCheck = function (q) {
    return function () {
      var node = $(q.id);
      if (!node) { return; }
      var raw = node.value;
      if (raw === "" || raw === null) {
        put(q.id + "-output", "<p>" + (q.t === "num" ? "先填一個數字。" : "先選一個選項。") + "</p>");
        answered[q.id] = false;
        progress();
        return;
      }
      var ok;
      if (q.t === "num") {
        var v = Number(raw);
        if (isNaN(v)) {
          put(q.id + "-output", "<p>先填一個數字。</p>");
          answered[q.id] = false;
          progress();
          return;
        }
        ok = (Math.abs(v - q.ans) <= q.tol);
      } else {
        ok = (String(raw) === q.ans);
      }
      answered[q.id] = true;
      if (ok) {
        put(q.id + "-output", "<p><strong>答對</strong>　" + q.why + "</p>" + link(q.id));
      } else {
        var right = (q.t === "num") ? ("正確答案是 " + num6(q.ans).replace(/\.?0+$/, "") + "。")
                                    : ("正確答案是選項 " + q.ans + "。");
        put(q.id + "-output", "<p><strong>再看一次</strong>　" + right + q.why + "　" + q.err
          + "</p>" + link(q.id));
      }
      progress();
    };
  };
  var i, q, btn;
  for (i = 0; i < QUIZ.length; i += 1) {
    q = QUIZ[i];
    btn = $(q.id + "-check");
    if (btn) { btn.addEventListener("click", makeCheck(q)); }
  }
  var reset = $("quiz-reset");
  if (reset) {
    reset.addEventListener("click", function () {
      var j, n;
      for (j = 0; j < QUIZ.length; j += 1) {
        n = $(QUIZ[j].id);
        if (n) { n.value = ""; }
        put(QUIZ[j].id + "-output", "");
        answered[QUIZ[j].id] = false;
      }
      progress();
    });
  }
  progress();
}

/* ---------- 6. 註冊 ---------- */
if (typeof document !== "undefined") {
  [perfeq, isa, fp754, pipe5, pipehaz, branch, ooo, amdahl, cache, mesi,
   tlbcost, iomode, buspick, chippick, dictionary, selfcheck].forEach(function (f) { f(); });
}

/* ---------- 7. Node 匯出（供人工驗算，不影響瀏覽器） ---------- */
if (typeof module !== "undefined") {
  module.exports = {
    num6: num6, int0: int0, hex: hex, fmtTime: fmtTime,
    cacheSim: cacheSim, branchSim: branchSim,
    ISA_COST: ISA_COST, CACHE_SEQ: CACHE_SEQ, MESI_SEQ: MESI_SEQ,
    BUS: BUS, CHIP: CHIP, CHIP_EFF: CHIP_EFF, PF_DEV: PF_DEV, PATTERN: PATTERN,
    QUIZ: QUIZ
  };
}

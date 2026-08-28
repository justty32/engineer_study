"use strict";

/* ============================================================
   邏輯設計（零基礎互動課）— 所有頁面的互動掛勾
   單一檔，唯一依據 BUILD-SPEC.md。
   規則：完全確定性，不用亂數、不讀系統時間、不存瀏覽器狀態、不連網。
   ============================================================ */

/* ---------- 1. helper ---------- */
const $=x=>document.getElementById(x);
const on = (x, e, f) => { const n = $(x); if (n) n.addEventListener(e, f); };
const bind = (ids, f) => ids.forEach(x => {
  const n = $(x);
  if (n) n.addEventListener(n.type === "checkbox" ? "change" : "input", f);
});
const val = x => Number($(x).value);
const pick = x => $(x).value;
const chk = x => $(x).checked;
const fmt = (x, n) => Number(x).toFixed(n === undefined ? 6 : n);

/* 物理量、金額量一律 6 位小數；負號一律 U+2212 */
const num6 = x => fmt(x, 6).replace("-", "−");
/* 整數量（位元數、閘數、狀態數、容量、顆數）不補小數 */
const int0 = x => String(Math.round(x)).replace("-", "−");

/* n 位元二進位字串，每 4 位元一個半形空格 */
const bits = (x, n) => {
  let s = "";
  for (let i = n - 1; i >= 0; i--) {
    s += ((x >> i) & 1);
    if (i % 4 === 0 && i > 0) s += " ";
  }
  return s;
};
const popcount = x => { let c = 0, v = x; while (v) { c += v & 1; v >>>= 1; } return c; };
/* 表示 n 個狀態最少需要幾個位元（不用 Math.log2，避免浮點邊界） */
const bitsNeeded = n => { let k = 1; while ((1 << k) < n) k++; return k; };

/* ---------- 2. 常數（唯一定義處，與 PROJECT-BRIEF 第 7 節一致） ---------- */
const FAMILY = {
  cmos33: { name: "3.3 V CMOS", voh: 3.10, vol: 0.20, vih: 2.31, vil: 0.99, vdd: 3.3 },
  cmos18: { name: "1.8 V CMOS", voh: 1.70, vol: 0.10, vih: 1.26, vil: 0.54, vdd: 1.8 },
  lvttl: { name: "3.3 V LVTTL", voh: 2.40, vol: 0.40, vih: 2.00, vil: 0.80, vdd: 3.3 },
  ttl5: { name: "5 V TTL", voh: 2.70, vol: 0.50, vih: 2.00, vil: 0.80, vdd: 5.0 }
};
const KLOAD = 1.0;            /* ns/pF */
const TFF = 0.40;             /* ns，正反器 t_cq */
const CPLD_MACROCELL = 512;
const PRICE = { asic: 2, fpga: 50, cpld: 5 };
const VARS = ["A", "B", "C", "D"];

/* ---------- 3. 每章一個守衛函式 ---------- */

/* 00 數位世界觀 —— 雜訊裕度 */
function nmargin() {
  if (!$("nm-family")) return;
  const ids = ["nm-family", "nm-vin", "nm-noise"];
  const draw = () => {
    const f = FAMILY[pick("nm-family")];
    const vin = val("nm-vin"), noise = val("nm-noise");
    const nmh = f.voh - f.vih, nml = f.vil - f.vol, gap = f.vih - f.vil;
    const lo = vin - noise, hi = vin + noise;
    let read, dist, distName;
    if (vin >= f.vih) { read = "邏輯 1"; dist = vin - f.vih; distName = "距禁區上緣 V<sub>IH</sub>"; }
    else if (vin <= f.vil) { read = "邏輯 0"; dist = f.vil - vin; distName = "距禁區下緣 V<sub>IL</sub>"; }
    else { read = "落在禁區"; dist = Math.min(f.vih - vin, vin - f.vil); distName = "距最近的門檻"; }

    let noiseLine;
    if (vin >= f.vih) {
      noiseLine = lo >= f.vih
        ? "疊加雜訊後最低點 " + num6(lo) + " V，仍 ≥ V<sub>IH</sub>，還是讀作 1，剩 " + num6(lo - f.vih) + " V 餘裕。"
        : "疊加雜訊後最低點 " + num6(lo) + " V，已經掉到 V<sub>IH</sub> 以下 " + num6(f.vih - lo) + " V：<strong>雜訊已經吃掉裕度</strong>，這一刻下游可能讀成任何值。";
    } else if (vin <= f.vil) {
      noiseLine = hi <= f.vil
        ? "疊加雜訊後最高點 " + num6(hi) + " V，仍 ≤ V<sub>IL</sub>，還是讀作 0，剩 " + num6(f.vil - hi) + " V 餘裕。"
        : "疊加雜訊後最高點 " + num6(hi) + " V，已經升到 V<sub>IL</sub> 以上 " + num6(hi - f.vil) + " V：<strong>雜訊已經吃掉裕度</strong>。";
    } else {
      noiseLine = "輸入本身就在禁區裡（" + num6(lo) + " V 到 " + num6(hi) + " V），還沒輪到雜訊，規格就已經沒有承諾了。";
    }

    let judge = "";
    if (read === "落在禁區") {
      judge = "<p><strong>判讀：落在禁區。</strong>下游可以合法地讀成 0 或 1，甚至兩個下游讀到不一樣的值——這不是壞掉，是規格沒承諾。</p>";
    } else {
      judge = "<p><strong>判讀：" + read + "。</strong>" + noiseLine + "</p>";
    }

    let edge = "";
    if (vin > f.vdd) {
      edge += "<p>輸入電壓 " + num6(vin) + " V 已超過這個家族的 V<sub>DD</sub> = " + num6(f.vdd) + " V，實際電路會經 ESD 保護二極體灌電流進電源——這不是判讀問題，而是<strong>可能燒毀</strong>。</p>";
    }
    if (noise === 0) {
      edge += "<p>雜訊振幅設成 0：這時裕度只是紙上數字。真實板子上電源紋波、地線彈跳、串音隨時在吃它。</p>";
    }
    if (Math.abs(nmh - nml) > 1e-9) {
      edge += "<p>這個家族的 NM<sub>H</sub>（" + num6(nmh) + " V）與 NM<sub>L</sub>（" + num6(nml) + " V）<strong>不相等</strong>，兩邊不對稱；比較小的那一側才是真正的瓶頸。</p>";
    }

    $("nmargin-output").innerHTML =
      "<p>目前家族：<strong>" + f.name + "</strong>（V<sub>OH</sub> = " + num6(f.voh) + " V、V<sub>OL</sub> = " + num6(f.vol) +
      " V、V<sub>IH</sub> = " + num6(f.vih) + " V、V<sub>IL</sub> = " + num6(f.vil) + " V、V<sub>DD</sub> = " + num6(f.vdd) + " V）</p>" +
      "<ul>" +
      "<li>高位雜訊裕度 NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub> = <strong>" + num6(nmh) + " V</strong></li>" +
      "<li>低位雜訊裕度 NM<sub>L</sub> = V<sub>IL</sub> − V<sub>OL</sub> = <strong>" + num6(nml) + " V</strong></li>" +
      "<li>禁區寬度 = V<sub>IH</sub> − V<sub>IL</sub> = <strong>" + num6(gap) + " V</strong></li>" +
      "<li>輸入電壓 = " + num6(vin) + " V，" + distName + " = <strong>" + num6(dist) + " V</strong></li>" +
      "<li>疊加雜訊 ±" + num6(noise) + " V 之後的範圍：" + num6(lo) + " V 到 " + num6(hi) + " V</li>" +
      "</ul>" + judge + edge +
      "<p><strong>為什麼：</strong>雜訊裕度是<em>上游的輸出承諾</em>減<em>下游的輸入要求</em>，中間那段差額才是可以被干擾吃掉的額度。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 01 數值系統與編碼 —— 進位與編碼互轉 */
function numbase() {
  if (!$("nb-value")) return;
  const ids = ["nb-value", "nb-delta", "nb-base"];
  const gray = v => v ^ (v >> 1);
  const bcd = v => {
    const d = [Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10];
    return d.map(x => bits(x, 4)).join(" ");
  };
  const ascii = v => {
    if (v >= 32 && v <= 126) return "字元 <code>" + String.fromCharCode(v) + "</code>";
    if (v === 127 || v < 32) return "控制碼（不可列印）";
    return "超出 ASCII 範圍（ASCII 只到 127）";
  };
  const divsteps = (v, b) => {
    if (v === 0) return "<li>0 ÷ " + b + " = 0 餘 0</li>";
    let q = v, out = "";
    while (q > 0) {
      const r = q % b, nq = Math.floor(q / b);
      out += "<li>" + int0(q) + " ÷ " + b + " = " + int0(nq) + " 餘 <strong>" + r.toString(b).toUpperCase() + "</strong></li>";
      q = nq;
    }
    return out;
  };
  const draw = () => {
    const v = val("nb-value"), delta = val("nb-delta"), base = Number(pick("nb-base"));
    const other = v + delta;
    const inRange = other >= 0 && other <= 255;
    const g = gray(v);

    let cmp;
    if (!inRange) {
      cmp = "<p>相鄰值 " + int0(other) + " 超出 8 位元範圍（0–255），這一段比較先停用。</p>";
    } else if (delta === 0) {
      cmp = "<p>位移量 0：跟自己比，二進位差 <strong>0</strong> 個位元、格雷碼也差 <strong>0</strong> 個位元。</p>";
    } else {
      const bd = popcount(v ^ other), gd = popcount(g ^ gray(other));
      let note = "";
      if (Math.abs(delta) === 1) {
        note = "格雷碼的定義就是這件事：<strong>相鄰值只差一個位元</strong>。";
      } else {
        note = "格雷碼只保證<strong>相鄰</strong>值差 1 個位元；位移量不是 ±1 時沒有這個保證。";
      }
      if (bd >= 4) {
        note += "二進位在這裡有 " + int0(bd) + " 個位元同時翻轉；真實電路做不到同時，中間會出現任意假值。";
      }
      cmp = "<p>與相鄰值 " + int0(other) + "（<code>" + bits(other, 8) + "</code>、格雷碼 " + int0(gray(other)) + "）比較：" +
        "二進位差 <strong>" + int0(bd) + "</strong> 個位元、格雷碼差 <strong>" + int0(gd) + "</strong> 個位元。" + note + "</p>";
    }

    let edge = "";
    if (v > 99) edge += "<p>這個值需要 3 個十進位數字，壓縮 BCD 要用掉 12 個位元，比二進位的 8 個位元還多——這就是 BCD 的代價，換到的是顯示時不必做二進位轉十進位。</p>";
    if (v === 0) edge += "<p>值為 0：二進位與格雷碼都是 <code>0000 0000</code>，這是唯一兩者相同又全為 0 的點。</p>";

    $("numbase-output").innerHTML =
      "<p>十進位 <strong>" + int0(v) + "</strong> 的六種寫法：</p>" +
      "<ul>" +
      "<li>二進位（8 位元）：<code>" + bits(v, 8) + "</code></li>" +
      "<li>十六進位：<code>0x" + (v < 16 ? "0" : "") + v.toString(16).toUpperCase() + "</code></li>" +
      "<li>八進位：<code>" + v.toString(8) + "<sub>8</sub></code></li>" +
      "<li>壓縮 BCD（3 個十進位數字、12 位元）：<code>" + bcd(v) + "</code></li>" +
      "<li>格雷碼 G = B ⊕ (B >> 1) = " + int0(v) + " ⊕ " + int0(v >> 1) + " = <strong>" + int0(g) + "</strong>（<code>" + bits(g, 8) + "</code>）</li>" +
      "<li>ASCII：" + ascii(v) + "</li>" +
      "</ul>" +
      "<p>逐步除法（除法取餘法，底數 " + int0(base) + "，由上而下剝掉最低位）：</p><ul>" + divsteps(v, base) + "</ul>" +
      cmp + edge +
      "<p><strong>為什麼：</strong>十六進位一個字元對齊 4 個位元，所以它是二進位的壓縮顯示，而不是另一種數。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 02 二補數與有號數運算 */
function twoscomp() {
  if (!$("tc-a")) return;
  const ids = ["tc-a", "tc-b", "tc-op", "tc-view"];
  const wrap = x => ((x % 256) + 256) % 256;
  const draw = () => {
    const a = val("tc-a"), b = val("tc-b"), op = pick("tc-op"), view = pick("tc-view");
    const ua = wrap(a), ub = wrap(b);
    const opnd = op === "sub" ? wrap(~ub) : ub;
    const cin = op === "sub" ? 1 : 0;
    /* 逐位加法取出第 7 位的進位 */
    let carry = cin, c7 = 0, res = 0;
    for (let i = 0; i < 8; i++) {
      const x = (ua >> i) & 1, y = (opnd >> i) & 1;
      const s = x + y + carry;
      res |= (s & 1) << i;
      if (i === 6) c7 = s >= 2 ? 1 : 0;
      carry = s >= 2 ? 1 : 0;
    }
    const C = carry, V = C ^ c7, N = res >= 128 ? 1 : 0, Z = res === 0 ? 1 : 0;
    const signed = res >= 128 ? res - 256 : res;
    const trueVal = op === "sub" ? a - b : a + b;

    let judge = "";
    if (V === 1) {
      judge += "<p><strong>V = 1，有號溢位。</strong>兩個同號數運算卻得到異號結果，超出 −128…127；真值應該是 " + int0(trueVal) + "，但 8 個位元裝不下。</p>";
    }
    if (C === 1 && op === "add") {
      judge += "<p><strong>C = 1。</strong>無號進位：結果超過 255，第 9 個位元掉出去了。</p>";
    }
    if (C === 1 && op === "sub") {
      judge += "<p><strong>C = 1。</strong>減法的 C = 1 代表<strong>不需要借位</strong>，也就是無號意義下 A ≥ B。</p>";
    }
    if (C === 0 && op === "sub") {
      judge += "<p><strong>C = 0。</strong>減法的 C = 0 代表需要借位，無號意義下 A &lt; B。</p>";
    }
    if (V === 0 && C === 0) {
      judge += "<p>兩種解讀都在範圍內：無號沒有進位、有號沒有溢位。</p>";
    }
    if (Z === 1) judge += "<p>Z = 1：結果的 8 個位元全是 0。</p>";

    const mainLine = view === "signed"
      ? "主要解讀（有號、二補數）：<strong>" + int0(signed) + "</strong>；另一種讀法（無號）是 " + int0(res) + "。"
      : "主要解讀（無號）：<strong>" + int0(res) + "</strong>；另一種讀法（有號、二補數）是 " + int0(signed) + "。";

    $("twoscomp-output").innerHTML =
      "<p>這個模式用到 A、B 兩個滑桿；解讀方式只改變下面哪一行被標成主要結果，<strong>不改變位元</strong>。</p>" +
      "<ul>" +
      "<li>A = " + int0(a) + " → <code>" + bits(ua, 8) + "</code>（無號 " + int0(ua) + "、有號 " + int0(ua >= 128 ? ua - 256 : ua) + "）</li>" +
      "<li>B = " + int0(b) + " → <code>" + bits(ub, 8) + "</code>（無號 " + int0(ub) + "、有號 " + int0(ub >= 128 ? ub - 256 : ub) + "）</li>" +
      "<li>運算：" + (op === "sub"
        ? "A − B = A + ¬B + 1 = <code>" + bits(ua, 8) + "</code> + <code>" + bits(opnd, 8) + "</code> + 1"
        : "A + B = <code>" + bits(ua, 8) + "</code> + <code>" + bits(ub, 8) + "</code>") + "</li>" +
      "<li>結果位元：<strong><code>" + bits(res, 8) + "</code></strong></li>" +
      "<li>" + mainLine + "</li>" +
      "<li>旗標：C（carry）= <strong>" + int0(C) + "</strong>、V（overflow）= <strong>" + int0(V) + "</strong>、N（negative）= <strong>" + int0(N) + "</strong>、Z（zero）= <strong>" + int0(Z) + "</strong>（第 7 位進位 C<sub>7</sub> = " + int0(c7) + "，V = C<sub>8</sub> ⊕ C<sub>7</sub>）</li>" +
      "</ul>" + judge +
      "<p><strong>為什麼：</strong>位元就是那一組位元。C 問的是無號有沒有超過 255，V 問的是有號有沒有跑出 −128…127——兩個問題可以有不同答案。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 03 布林代數與邏輯閘 */
function boolgate() {
  if (!$("bg-gate")) return;
  const ids = ["bg-gate", "bg-a", "bg-b", "bg-c", "bg-law"];
  const GATE = {
    and: { name: "AND（及閘）", f: (a, b) => a && b, one: false },
    or: { name: "OR（或閘）", f: (a, b) => a || b, one: false },
    not: { name: "NOT（反相器）", f: a => !a, one: true },
    nand: { name: "NAND（反及閘）", f: (a, b) => !(a && b), one: false },
    nor: { name: "NOR（反或閘）", f: (a, b) => !(a || b), one: false },
    xor: { name: "XOR（互斥或閘）", f: (a, b) => a !== b, one: false },
    xnor: { name: "XNOR（反互斥或閘）", f: (a, b) => a === b, one: false }
  };
  const NANDFORM = {
    and: "A · B = (A NAND B) NAND (A NAND B)",
    or: "A + B = (A NAND A) NAND (B NAND B)",
    not: "¬A = A NAND A",
    xor: "A ⊕ B = (A NAND (A NAND B)) NAND (B NAND (A NAND B))"
  };
  const LAW = {
    demorgan1: { text: "¬(A + B) = ¬A · ¬B", n: 2, l: (a, b) => !(a || b), r: (a, b) => (!a) && (!b) },
    demorgan2: { text: "¬(A · B) = ¬A + ¬B", n: 2, l: (a, b) => !(a && b), r: (a, b) => (!a) || (!b) },
    absorb1: { text: "A + A · B = A", n: 2, l: (a, b) => a || (a && b), r: a => a },
    absorb2: { text: "A · (A + B) = A", n: 2, l: (a, b) => a && (a || b), r: a => a },
    consensus: { text: "A + ¬A · B = A + B", n: 2, l: (a, b) => a || ((!a) && b), r: (a, b) => a || b },
    distrib: { text: "A · (B + C) = A · B + A · C", n: 3, l: (a, b, c) => a && (b || c), r: (a, b, c) => (a && b) || (a && c) }
  };
  const bit = x => x ? "1" : "0";
  const draw = () => {
    const gk = pick("bg-gate"), g = GATE[gk];
    const a = chk("bg-a"), b = chk("bg-b"), c = chk("bg-c");
    const lk = pick("bg-law"), law = LAW[lk];

    /* 第一區：閘的真值表 */
    let t1 = "<table><thead><tr><th>A</th>" + (g.one ? "" : "<th>B</th>") + "<th>" + g.name + "</th></tr></thead><tbody>";
    if (g.one) {
      for (let i = 0; i < 2; i++) {
        const cur = (a ? 1 : 0) === i;
        t1 += "<tr><td>" + i + "</td><td>" + bit(g.f(i === 1)) + (cur ? "　← 目前這一列" : "") + "</td></tr>";
      }
    } else {
      for (let i = 0; i < 4; i++) {
        const x = (i >> 1) & 1, y = i & 1;
        const cur = (a ? 1 : 0) === x && (b ? 1 : 0) === y;
        t1 += "<tr><td>" + x + "</td><td>" + y + "</td><td>" + bit(g.f(x === 1, y === 1)) + (cur ? "　← 目前這一列" : "") + "</td></tr>";
      }
    }
    t1 += "</tbody></table>";
    const out = g.one ? g.f(a) : g.f(a, b);

    /* 第二區：恆等式逐列驗證 */
    const rows = 1 << law.n;
    let same = true, t2 = "<table><thead><tr><th>" + (law.n === 3 ? "A B C" : "A B") + "</th><th>左式</th><th>右式</th></tr></thead><tbody>";
    for (let i = 0; i < rows; i++) {
      const x = law.n === 3 ? (i >> 2) & 1 : (i >> 1) & 1;
      const y = law.n === 3 ? (i >> 1) & 1 : i & 1;
      const z = law.n === 3 ? i & 1 : 0;
      const lv = law.n === 3 ? law.l(x === 1, y === 1, z === 1) : law.l(x === 1, y === 1);
      const rv = law.n === 3 ? law.r(x === 1, y === 1, z === 1) : law.r(x === 1, y === 1);
      if (lv !== rv) same = false;
      t2 += "<tr><td>" + x + " " + y + (law.n === 3 ? " " + z : "") + "</td><td>" + bit(lv) + "</td><td>" + bit(rv) + "</td></tr>";
    }
    t2 += "</tbody></table>";

    /* 第三區：NAND 構造 */
    const nandLine = NANDFORM[gk] || "先組出對應的正邏輯閘，再加一個 X NAND X 把它反相。";

    let extra = "";
    if (g.one) extra += "<p>NOT 只有一個輸入，<strong>B 的勾選不影響上面那一區</strong>。</p>";
    if (law.n === 2) extra += "<p>這條恆等式只用 A 與 B，<strong>C 的勾選對它沒有影響</strong>。</p>";
    if (!a && !b && !c) extra += "<p>三個輸入全不勾，看的是第 0 列——全 0 這一列常常是化簡時最容易漏掉的一列。</p>";
    if (gk === "xor") extra += "<p>XOR 不是基本閘，它是 <code>A · ¬B + ¬A · B</code>，用 4 個 NAND 可以組出來。</p>";

    $("boolgate-output").innerHTML =
      "<p>這個 widget 有兩區：上面看閘（用到 A、B，NOT 只用 A），下面驗恆等式（狄摩根／吸收／共識用 A、B，分配律才會用到 C）。</p>" +
      "<p><strong>一、" + g.name + "</strong>：目前輸入 A = " + bit(a) + (g.one ? "" : "、B = " + bit(b)) +
      " → 輸出 <strong>" + bit(out) + "</strong></p>" + t1 +
      "<p><strong>二、驗證恆等式 <code>" + law.text + "</code></strong>（" + int0(rows) + " 列全展開）</p>" + t2 +
      "<p>" + (same
        ? "逐列比對<strong>全部相同</strong>——這條恆等式在全部 " + int0(rows) + " 種輸入下都成立。布林代數的「證明」就是把全部情況窮舉一遍，因為只有有限多種。"
        : "逐列比對出現不同，這條式子不是恆等式。") + "</p>" +
      "<p><strong>三、用 NAND 組出它</strong>：<code>" + nandLine + "</code></p>" + extra +
      "<p><strong>為什麼：</strong>真值表與代數式是同一個函數的兩種寫法；能互相轉換，是後面所有化簡的前提。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 04 標準型 SOP 與 POS */
function canonical() {
  if (!$("cn-form")) return;
  const ids = ["cn-m0", "cn-m1", "cn-m2", "cn-m3", "cn-m4", "cn-m5", "cn-m6", "cn-m7", "cn-form"];
  const V3 = ["A", "B", "C"];
  const sopTerm = i => V3.map((v, k) => (((i >> (2 - k)) & 1) ? v : "¬" + v)).join(" · ");
  const posTerm = i => "(" + V3.map((v, k) => (((i >> (2 - k)) & 1) ? "¬" + v : v)).join(" + ") + ")";
  /* 閘數：每個 ≥2 字面的項一個閘、項數 ≥2 時輸出一個閘、每個用到的反相變數一個 NOT */
  const gateCount = (idxs, isSop) => {
    if (idxs.length === 0 || idxs.length === 8) return 0;
    const inv = {};
    idxs.forEach(i => V3.forEach((v, k) => {
      const one = ((i >> (2 - k)) & 1) === 1;
      if (isSop ? !one : one) inv[v] = 1;
    }));
    return Object.keys(inv).length + idxs.length + (idxs.length >= 2 ? 1 : 0);
  };
  const draw = () => {
    const ones = [], zeros = [];
    for (let i = 0; i < 8; i++) (chk("cn-m" + i) ? ones : zeros).push(i);
    const form = pick("cn-form");

    let body = "";
    if (ones.length === 8) {
      body = "<p>八列全部為 1 → <strong>F = 1（常數），不需要任何閘。</strong>SOP 寫得出 8 個乘積項，但它們的和恆為 1；POS 沒有任何最大項。</p>";
    } else if (ones.length === 0) {
      body = "<p>八列全部為 0 → <strong>F = 0（常數），不需要任何閘。</strong>SOP 沒有任何最小項；POS 寫得出 8 個和項，但它們的積恆為 0。</p>";
    } else {
      const sop = ones.map(sopTerm).join(" + ");
      const pos = zeros.map(posTerm).join(" · ");
      let s = "";
      if (form === "sop" || form === "both") {
        s += "<p><strong>標準 SOP：</strong><code>F = " + sop + "</code><br>字面數 = " + int0(ones.length) + " × 3 = <strong>" + int0(ones.length * 3) +
          "</strong>，閘數 = <strong>" + int0(gateCount(ones, true)) + "</strong>" + (ones.length === 1 ? "（只有一項，不需要 OR 閘）" : "") + "</p>";
      }
      if (form === "pos" || form === "both") {
        s += "<p><strong>標準 POS：</strong><code>F = " + pos + "</code><br>字面數 = " + int0(zeros.length) + " × 3 = <strong>" + int0(zeros.length * 3) +
          "</strong>，閘數 = <strong>" + int0(gateCount(zeros, false)) + "</strong>" + (zeros.length === 1 ? "（只有一項，不需要 AND 閘）" : "") + "</p>";
      }
      body = s;
    }

    let judge = "";
    if (ones.length >= 5 && ones.length < 8) {
      judge += "<p>為 1 的列（" + int0(ones.length) + "）比為 0 的列（" + int0(zeros.length) + "）多，這時 <strong>POS 反而比較短</strong>——標準型要挑短的那一種當起點。</p>";
    }
    if (ones.length === 1) judge += "<p>只有一項時不需要 OR 閘，SOP 特別划算。</p>";

    $("canonical-output").innerHTML =
      "<p>這個模式顯示哪幾種標準型；<strong>8 個勾選格永遠都在用</strong>。</p>" +
      "<p>最小項集合 <code>Σm(" + ones.join(", ") + ")</code>，共 " + int0(ones.length) + " 項；" +
      "最大項集合 <code>ΠM(" + zeros.join(", ") + ")</code>，共 " + int0(zeros.length) + " 項。" +
      "兩個索引集合的元素個數相加 " + int0(ones.length) + " + " + int0(zeros.length) + " = <strong>8</strong>，必定等於列數。</p>" +
      body + judge +
      "<p><strong>為什麼：</strong>標準型是機械產生的，所以一定寫得出來；但它把每一列都當成獨立的一項，所以一定不是最省。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 05 卡諾圖與不關心項 —— Quine–McCluskey（BUILD-SPEC 7.3，確定性） */
function kmapSolve(cells) {
  const onSet = [], dcSet = [];
  for (let i = 0; i < 16; i++) {
    if (cells[i] === "1") onSet.push(i);
    else if (cells[i] === "x") dcSet.push(i);
  }
  if (onSet.length === 0) {
    return { onSet: onSet, dcSet: dcSet, pis: [], essential: [], chosen: [], literals: 0, gates: 0, expr: "F = 0", constant: 0 };
  }
  const pat = i => { let s = ""; for (let k = 3; k >= 0; k--) s += ((i >> k) & 1); return s; };
  let cur = onSet.concat(dcSet).map(pat);
  /* 去重 */
  const uniq = arr => { const m = {}, o = []; arr.forEach(p => { if (!m[p]) { m[p] = 1; o.push(p); } }); return o; };
  cur = uniq(cur);
  const primes = [];
  while (cur.length > 0) {
    const used = {};
    const next = [];
    for (let i = 0; i < cur.length; i++) {
      for (let j = i + 1; j < cur.length; j++) {
        let diff = -1, ok = true;
        for (let k = 0; k < 4; k++) {
          if (cur[i][k] !== cur[j][k]) {
            if (cur[i][k] === "-" || cur[j][k] === "-") { ok = false; break; }
            if (diff >= 0) { ok = false; break; }
            diff = k;
          }
        }
        if (ok && diff >= 0) {
          used[cur[i]] = 1; used[cur[j]] = 1;
          next.push(cur[i].substring(0, diff) + "-" + cur[i].substring(diff + 1));
        }
      }
    }
    cur.forEach(p => { if (!used[p]) primes.push(p); });
    cur = uniq(next);
  }
  const litCount = p => { let c = 0; for (let k = 0; k < 4; k++) if (p[k] !== "-") c++; return c; };
  const covers = (p, i) => { for (let k = 0; k < 4; k++) if (p[k] !== "-" && p[k] !== String((i >> (3 - k)) & 1)) return false; return true; };
  const sortPis = arr => arr.slice().sort((x, y) => {
    const d = litCount(x) - litCount(y);
    if (d !== 0) return d;
    return x < y ? -1 : (x > y ? 1 : 0);
  });
  const pis = sortPis(primes);

  /* 覆蓋表：只算 onSet */
  const essential = [];
  const covered = {};
  onSet.forEach(m => {
    const hit = pis.filter(p => covers(p, m));
    if (hit.length === 1 && essential.indexOf(hit[0]) < 0) essential.push(hit[0]);
  });
  essential.forEach(p => onSet.forEach(m => { if (covers(p, m)) covered[m] = 1; }));
  const chosen = essential.slice();
  /* 貪婪補齊 */
  let remain = onSet.filter(m => !covered[m]);
  while (remain.length > 0) {
    let best = null, bestN = -1;
    pis.forEach(p => {
      if (chosen.indexOf(p) >= 0) return;
      const n = remain.filter(m => covers(p, m)).length;
      if (n === 0) return;
      if (n > bestN) { best = p; bestN = n; return; }
      if (n === bestN && best !== null) {
        const dl = litCount(p) - litCount(best);
        if (dl < 0 || (dl === 0 && p < best)) best = p;
      }
    });
    if (best === null) break;
    chosen.push(best);
    remain = remain.filter(m => !covers(best, m));
  }
  const finalPis = sortPis(chosen);
  const toAlg = p => {
    const parts = [];
    for (let k = 0; k < 4; k++) {
      if (p[k] === "1") parts.push(VARS[k]);
      else if (p[k] === "0") parts.push("¬" + VARS[k]);
    }
    return parts.length === 0 ? "1" : parts.join(" · ");
  };
  const constant = finalPis.length === 1 && finalPis[0] === "----" ? 1 : -1;
  const literals = finalPis.reduce((s, p) => s + litCount(p), 0);
  let gates = 0;
  if (constant !== 1) {
    const inv = {};
    finalPis.forEach(p => {
      for (let k = 0; k < 4; k++) if (p[k] === "0") inv[VARS[k]] = 1;
      if (litCount(p) >= 2) gates++;
    });
    gates += Object.keys(inv).length;
    if (finalPis.length >= 2) gates++;
  }
  return {
    onSet: onSet, dcSet: dcSet, pis: pis, essential: sortPis(essential), chosen: finalPis,
    literals: literals, gates: gates, constant: constant,
    expr: constant === 1 ? "F = 1" : "F = " + finalPis.map(toAlg).join(" + "),
    alg: toAlg, lit: litCount, cov: covers
  };
}

function kmap() {
  if (!$("km-c0")) return;
  const ids = [];
  for (let i = 0; i < 16; i++) ids.push("km-c" + i);
  const draw = () => {
    const cells = ids.map(x => pick(x));
    const r = kmapSolve(cells);
    const onSet = r.onSet, dcSet = r.dcSet;

    if (onSet.length === 0) {
      $("kmap-output").innerHTML =
        "<p><code>Σm()</code> 是空集合" + (dcSet.length > 0 ? "，不關心項 <code>d(" + dcSet.join(", ") + ")</code>" : "") + "。</p>" +
        "<p><strong>" + (dcSet.length === 16
          ? "16 格全部是不關心項：F 可以是任何函數，本課取最省的 F = 0。"
          : "沒有任何最小項為 1 → F = 0（常數）。") + "不需要任何閘。</strong></p>" +
        "<p><strong>為什麼：</strong>圈變大一倍就消掉一個變數，因為那個變數在圈內取遍了 0 與 1；沒有 1 可以圈時，答案就是常數。</p>";
      return;
    }

    /* 標準 SOP 的成本 */
    const stdLit = onSet.length * 4;
    let stdGates = 0;
    if (onSet.length === 16) { stdGates = 0; }
    else {
      const inv = {};
      onSet.forEach(m => { for (let k = 0; k < 4; k++) if (((m >> (3 - k)) & 1) === 0) inv[VARS[k]] = 1; });
      stdGates = Object.keys(inv).length + onSet.length + (onSet.length >= 2 ? 1 : 0);
    }

    let piList = "<ul>";
    r.pis.forEach(p => {
      const isEss = r.essential.indexOf(p) >= 0;
      const isUsed = r.chosen.indexOf(p) >= 0;
      let why = "";
      if (isEss) {
        const only = onSet.filter(m => r.cov(p, m) && r.pis.filter(q => r.cov(q, m)).length === 1);
        why = "<strong>必要</strong>（m" + int0(only[0]) + " 只被它覆蓋）";
      } else {
        why = isUsed ? "非必要，由貪婪步驟選入" : "非必要，這次沒有用到";
      }
      const usedDc = dcSet.filter(m => r.cov(p, m));
      piList += "<li><code>" + p + "</code> → <code>" + r.alg(p) + "</code>（" + int0(r.lit(p)) + " 字面）——" + why +
        (usedDc.length > 0 ? "；這個圈用到了不關心項 " + usedDc.map(m => "m" + m).join("、") + "，它們不會出現在真實輸入，所以免費" : "") + "</li>";
    });
    piList += "</ul>";

    let judge = "";
    if (r.constant === 1) {
      judge += "<p><strong>唯一的質蘊涵項是 <code>----</code>，F = 1（常數），0 個閘。</strong>16 格取遍全部組合，四個變數全部被消掉。</p>";
    } else if (r.essential.length === r.pis.length && r.pis.length === r.chosen.length) {
      judge += "<p><strong>" + int0(r.pis.length) + " 個質蘊涵項全部必要，沒有再化簡的空間。</strong></p>";
    } else if (r.chosen.length > r.essential.length) {
      judge += "<p>必要質蘊涵項不足以覆蓋全部最小項，第三步做了<strong>貪婪挑選</strong>——這一步有選擇，不同的選法會得到不同的式子。<strong>本課用的是規格鎖定的貪婪規則，它保證覆蓋正確，但不保證項數或字面數最少</strong>：在 cyclic（循環覆蓋）的情形下，貪婪解可能比真正的最小覆蓋多出項次。要確定最小解必須另解覆蓋問題（例如 Petrick 法或窮舉最小覆蓋），那超出本課範圍。</p>";
    }
    if (r.pis.length === 8 && r.literals === 32) {
      judge += "<p>8 個質蘊涵項全是單格，完全化簡不掉——<strong>這是卡諾圖的最壞情形</strong>：相鄰格永遠一個 1 一個 0，沒有任何兩格可以合併。</p>";
    }

    const save = stdGates > 0 ? "閘數 " + int0(stdGates) + " → " + int0(r.gates) + "，字面數 " + int0(stdLit) + " → " + int0(r.literals) : "標準型本身就不需要閘";

    $("kmap-output").innerHTML =
      "<p>目前規格：<code>Σm(" + onSet.join(", ") + ")</code>" +
      (dcSet.length > 0 ? " + <code>d(" + dcSet.join(", ") + ")</code>" : "（沒有不關心項）") + "</p>" +
      "<p><strong>質蘊涵項（" + int0(r.pis.length) + " 個，依字面數與位元樣式排序）：</strong></p>" + piList +
      "<p><strong>化簡後的 SOP：</strong><code>" + r.expr + "</code>；字面數 <strong>" + int0(r.literals) + "</strong>、閘數 <strong>" + int0(r.gates) + "</strong></p>" +
      "<p>對比不化簡的標準 SOP：字面數 " + int0(stdLit) + "、閘數 " + int0(stdGates) + "。省下：" + save + "。</p>" +
      judge +
      "<p><strong>為什麼：</strong>圈變大一倍就消掉一個變數，因為那個變數在圈內取遍了 0 與 1。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 06 多工器、解碼器與編碼器 */
function muxdec() {
  if (!$("md-block")) return;
  const ids = ["md-block", "md-sel", "md-en"];
  for (let i = 0; i < 8; i++) ids.push("md-d" + i);
  const draw = () => {
    const block = pick("md-block"), sel = val("md-sel"), en = chk("md-en");
    const d = [];
    for (let i = 0; i < 8; i++) d.push(chk("md-d" + i) ? 1 : 0);
    const selBits = bits(sel, 3);

    let head = "", body = "", judge = "";
    if (block === "mux") {
      head = "這個元件用到<strong>選擇線、全部 8 條資料線與 EN</strong>。";
      const y = en ? d[sel] : 0;
      body = "<p>選擇線 S<sub>2</sub>S<sub>1</sub>S<sub>0</sub> = <code>" + selBits + "</code>（十進位 " + int0(sel) + "）→ Y = D<sub>" + int0(sel) + "</sub> = <strong>" + int0(y) + "</strong></p>" +
        "<p>資料線 D<sub>0</sub>–D<sub>7</sub> = " + d.join(", ") + "</p>";
      judge = "<p>選擇線指到 D<sub>" + int0(sel) + "</sub>，所以 Y 就是它的值；<strong>其他七條完全不影響輸出</strong>。</p>";
      if (d.join("") === "00010111") {
        judge += "<p>你剛剛用一顆多工器實作了第 04 章的多數決 <code>Σm(3, 5, 6, 7)</code>——<strong>完全不用化簡、不用任何閘</strong>。</p>";
      }
    } else if (block === "demux" || block === "dec") {
      const src = block === "demux" ? d[0] : 1;
      head = block === "demux"
        ? "這個元件用到<strong>選擇線、D0（其餘 7 條不影響）與 EN</strong>。"
        : "這個元件用到<strong>選擇線與 EN</strong>（8 條資料線完全不影響）。";
      const outs = [];
      for (let i = 0; i < 8; i++) outs.push((en && i === sel) ? src : 0);
      body = "<p>選擇線 = <code>" + selBits + "</code>；" + (block === "demux" ? "資料端取 D<sub>0</sub> = " + int0(d[0]) : "資料端固定接 1") + "</p>" +
        "<p>八條輸出 Y<sub>0</sub>–Y<sub>7</sub> = <strong>" + outs.join(", ") + "</strong></p>";
      judge = "<p>解多工器與解碼器的輸出在這組設定下一模一樣，因為<strong>解碼器就是資料端固定接 1 的解多工器</strong>；差別只在資料端接什麼。</p>";
    } else {
      head = "這個元件用到<strong>8 條資料線與 EN</strong>（選擇線完全不影響）。";
      let idx = -1;
      if (en) for (let i = 7; i >= 0; i--) { if (d[i]) { idx = i; break; } }
      const code = idx >= 0 ? bits(idx, 3) : "000";
      const gs = idx >= 0 ? 1 : 0;
      const ones = [];
      for (let i = 0; i < 8; i++) if (d[i]) ones.push("D" + i);
      body = "<p>為 1 的輸入：" + (ones.length ? ones.join("、") : "（沒有）") + "</p>" +
        "<p>輸出碼 = <code>" + code + "</code>、GS（group select）= <strong>" + int0(gs) + "</strong></p>";
      if (ones.length > 1) {
        judge = "<p>有 " + int0(ones.length) + " 條輸入同時為 1，優先編碼器只回報<strong>索引最大</strong>的那一條（D<sub>" + int0(idx) + "</sub>），其餘被忽略。</p>";
      }
      if (code === "000") {
        judge += "<p>輸出是 <code>000</code>，但 GS = " + int0(gs) + "：" + (gs === 1
          ? "GS = 1 表示<strong>真的選中 D<sub>0</sub></strong>。"
          : "GS = 0 表示<strong>根本沒有任何輸入為 1</strong>（或沒致能）。") + "沒有 GS 就分不出這兩種情況——這正是 GS 存在的理由。</p>";
      }
    }

    let edge = "";
    if (!en) edge += "<p>EN 未致能：全部輸出為 0。<strong>這時的 <code>000</code> 不是「選中 0」，是根本沒致能。</strong></p>";

    $("muxdec-output").innerHTML =
      "<p>" + head + "</p>" + body + judge + edge +
      "<p><strong>為什麼：</strong>多工器的布林式就是一個標準 SOP，只是乘積項的係數變成可設定的資料線——所以它是一張查表。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 07 加法器、比較器與 ALU */
function adder() {
  if (!$("ad-op")) return;
  const ids = ["ad-op", "ad-a", "ad-b", "ad-cin", "ad-style", "ad-tpd"];
  const s4 = x => x >= 8 ? x - 16 : x;
  const draw = () => {
    const op = pick("ad-op"), a = val("ad-a"), b = val("ad-b");
    const style = pick("ad-style"), tpd = val("ad-tpd");
    const cinBox = chk("ad-cin");
    const arith = op === "add" || op === "sub";
    const opnd = op === "sub" ? (15 - b) : b;
    const cin = op === "sub" ? 1 : (cinBox ? 1 : 0);

    /* 逐位進位鏈 */
    const carries = [cin];
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      const x = (a >> i) & 1, y = (opnd >> i) & 1, ci = carries[i];
      const t = x + y + ci;
      sum |= (t & 1) << i;
      carries.push(t >= 2 ? 1 : 0);
    }
    const c4 = carries[4], c3 = carries[3];
    const C = c4, V = c4 ^ c3, N = (sum >> 3) & 1, Z = sum === 0 ? 1 : 0;

    let chain = "<table><thead><tr><th>位元 i</th><th>A<sub>i</sub></th><th>B<sub>i</sub></th><th>C<sub>i</sub></th><th>S<sub>i</sub></th><th>C<sub>i+1</sub></th></tr></thead><tbody>";
    for (let i = 0; i < 4; i++) {
      chain += "<tr><td>" + i + "</td><td>" + ((a >> i) & 1) + "</td><td>" + ((opnd >> i) & 1) + "</td><td>" + carries[i] +
        "</td><td>" + ((sum >> i) & 1) + "</td><td>" + carries[i + 1] + "</td></tr>";
    }
    chain += "</tbody></table>";

    const delay = style === "cla" ? 4 * tpd : (2 * 4 + 1) * tpd;
    const other = style === "cla" ? (2 * 4 + 1) * tpd : 4 * tpd;
    const gates = style === "cla" ? 26 : 20;
    const fmax = 1000 / delay;
    const otherFmax = 1000 / other;

    let head = "", body = "", judge = "";
    if (op === "add") {
      head = "這個運算用到 <strong>A、B 與 C_in</strong>。";
      body = chain + "<p>和 = <strong><code>" + bits(sum, 4) + "</code></strong>；無號解讀 " + int0(sum) + "、有號解讀 " + int0(s4(sum)) + "</p>";
    } else if (op === "sub") {
      head = "這個運算用到 <strong>A 與 B</strong>（A − B = A + ¬B + 1，所以 C_in 被強制為 1，那個核取方塊在這裡不影響結果）。";
      body = "<p>¬B = <code>" + bits(opnd, 4) + "</code>，再加 1。</p>" + chain +
        "<p>差 = <strong><code>" + bits(sum, 4) + "</code></strong>；無號解讀 " + int0(sum) + "、有號解讀 " + int0(s4(sum)) + "</p>";
    } else if (op === "cmp") {
      head = "這個運算只用 <strong>A 與 B</strong>（C_in、架構與延遲那三項只影響下面的成本比較）。";
      const su = s4(a), sb = s4(b);
      const uRel = a > b ? "A &gt; B" : (a < b ? "A &lt; B" : "A = B");
      const sRel = su > sb ? "A &gt; B" : (su < sb ? "A &lt; B" : "A = B");
      body = "<p>無號解讀：" + int0(a) + " 與 " + int0(b) + " → <strong>" + uRel + "</strong></p>" +
        "<p>有號解讀（二補數）：" + int0(su) + " 與 " + int0(sb) + " → <strong>" + sRel + "</strong></p>";
      if (uRel !== sRel) judge += "<p><strong>同一組位元，兩種解讀給相反的答案。</strong>比較器必須先講清楚要比的是無號還是有號。</p>";
    } else {
      head = "這個運算只用 <strong>A 與 B</strong>（C_in、架構與延遲那三項只影響下面的成本比較）。";
      const r = op === "and" ? (a & b) : (op === "or" ? (a | b) : (a ^ b));
      const sym = op === "and" ? " · " : (op === "or" ? " + " : " ⊕ ");
      body = "<p><code>" + bits(a, 4) + "</code>" + sym + "<code>" + bits(b, 4) + "</code> = <strong><code>" + bits(r, 4) + "</code></strong>（逐位運算，沒有進位鏈）</p>";
    }

    if (arith) {
      const allProp = carries[1] === 1 && carries[2] === 1 && carries[3] === 1 && carries[4] === 1;
      judge += allProp
        ? "<p>進位從第 0 位一路走到第 3 位，<strong>這是漣波架構的最壞情形</strong>：四級全部串起來。</p>"
        : "<p>進位鏈在中途就停了，實際延遲比最壞情形短——<strong>但電路必須照最壞情形設計</strong>，因為你不能挑輸入。</p>";
      judge += "<p>旗標：C = <strong>" + int0(C) + "</strong>、V = <strong>" + int0(V) + "</strong>、N = <strong>" + int0(N) + "</strong>、Z = <strong>" + int0(Z) + "</strong>（V = C<sub>4</sub> ⊕ C<sub>3</sub> = " + int0(c4) + " ⊕ " + int0(c3) + "）</p>";
      if (V === 1) {
        const t = op === "sub" ? s4(a) - s4(b) : s4(a) + s4(b);
        judge += "<p><strong>V = 1，有號溢位</strong>：真值應該是 " + int0(t) + "，超出 4 位元有號的 −8…7，所以 <code>" + bits(sum, 4) + "</code> 這個結果以有號來讀是錯的。</p>";
      }
      if (C === 1 && op === "add") judge += "<p>C = 1：無號意義下 " + int0(a) + " + " + int0(b) + " 超過 15，第 5 個位元掉出去了。</p>";
      if (C === 1 && op === "sub") judge += "<p>C = 1：減法時代表<strong>不需要借位</strong>，無號意義下 A ≥ B。</p>";
    }

    let edge = "";
    if (tpd <= 0.1) edge += "<p>單閘延遲拉到最小：真實製程的閘延遲不會全部相同，這個模型是<strong>教學用的一階近似</strong>。</p>";
    if (tpd >= 5) edge += "<p>單閘延遲 " + num6(tpd) + " ns：漣波已經慢到 " + num6((2 * 4 + 1) * tpd) + " ns，只剩 " + num6(1000 / ((2 * 4 + 1) * tpd)) + " MHz。</p>";

    $("adder-output").innerHTML =
      "<p>" + head + "</p>" +
      "<p>A = " + int0(a) + " → <code>" + bits(a, 4) + "</code>（有號 " + int0(s4(a)) + "）；B = " + int0(b) + " → <code>" + bits(b, 4) + "</code>（有號 " + int0(s4(b)) + "）</p>" +
      body + judge +
      "<p><strong>成本比較</strong>（單閘 t<sub>pd</sub> = " + num6(tpd) + " ns）：目前架構 <strong>" +
      (style === "cla" ? "超前進位" : "漣波進位") + "</strong> 延遲 <strong>" + num6(delay) + " ns</strong>（f<sub>max</sub> = " + num6(fmax) + " MHz）、" + int0(gates) + " 個閘；" +
      "另一種架構 " + (style === "cla" ? "漣波進位" : "超前進位") + " 延遲 " + num6(other) + " ns（" + num6(otherFmax) + " MHz）、" + int0(style === "cla" ? 20 : 26) + " 個閘。" +
      "加速比 " + num6(((2 * 4 + 1) * tpd) / (4 * tpd)) + " 倍，閘數多 30 %。</p>" + edge +
      "<p><strong>為什麼：</strong>CLA 把每一位的進位都直接從 A、B 算出來，不等前一位，所以延遲不隨位元數成長——代價是進位邏輯的閘數隨位元數平方成長。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 08 延遲、功耗與險境 */
function hazard() {
  if (!$("hz-tinv")) return;
  const ids = ["hz-tinv", "hz-tgate", "hz-fix", "hz-fanout", "hz-cload", "hz-vdd", "hz-freq"];
  const power = w => {
    if (w < 1e-6) return num6(w * 1e9) + " nW";
    if (w < 1e-3) return num6(w * 1e6) + " µW";
    if (w < 1) return num6(w * 1e3) + " mW";
    return num6(w) + " W";
  };
  const draw = () => {
    const tinv = val("hz-tinv"), tgate = val("hz-tgate"), fix = chk("hz-fix");
    const fanout = val("hz-fanout"), cload = val("hz-cload"), vdd = val("hz-vdd"), freq = val("hz-freq");
    const start = 2 * tgate, end = tinv + 2 * tgate, width = fix ? 0 : tinv;
    const ctot = fanout * cload;                 /* pF */
    const ctotSI = ctot * 1e-12;                 /* F */
    const freqSI = freq * 1e6;                   /* Hz */
    const tload = KLOAD * ctot;                  /* ns */
    const ttotal = tgate + tload;
    const p = ctotSI * vdd * vdd * freqSI;       /* W，α = 1 */

    let axis = "<table><thead><tr><th>時刻（ns）</th><th>發生什麼</th></tr></thead><tbody>" +
      "<tr><td>0.000000</td><td>A 由 1 變 0（B = C = 1 固定不動）</td></tr>";
    if (fix) {
      axis += "<tr><td>—</td><td>冗餘項 B · C 恆為 1，撐住輸出，F 全程保持 1</td></tr>";
    } else {
      axis += "<tr><td>" + num6(start) + "</td><td>F 掉到 0（A · B 已經落下，¬A · C 還沒升起）</td></tr>" +
        "<tr><td>" + num6(end) + "</td><td>F 回到 1（¬A 終於升起，第二條路徑接手）</td></tr>";
    }
    axis += "</tbody></table>";

    let judge;
    if (fix) {
      judge = "<p>加了冗餘項之後突波寬度 <strong>0.000000 ns（已消除）</strong>。<code>B · C</code> 這一項在 B = C = 1 時<strong>恆為 1，與 A 完全無關</strong>，所以 A 怎麼變它都撐住輸出。代價：多 1 個 AND 閘，OR 閘從 2 輸入變 3 輸入。</p>";
    } else {
      judge = "<p>輸出出現一個 <strong>" + num6(width) + " ns</strong> 的突波。F 在數學上不該變（B = C = 1 時 F 恆為 1），變的原因是<strong>兩條路徑的延遲不一樣</strong>：<code>A · B</code> 只走一個閘就落下，<code>¬A · C</code> 要先等反相器。突波寬度恰好等於 t<sub>inv</sub>。</p>";
    }

    let edge = "";
    if (!fix && tinv <= 0.1) edge += "<p>窄突波不代表沒事——它一樣可能被非同步清除腳吃進去。</p>";
    if (tload >= 5) edge += "<p>負載延遲已經 " + num6(tload) + " ns：<strong>這時候延遲由負載主導，不是閘本身</strong>。</p>";

    $("hazard-output").innerHTML =
      "<p>這個 widget 有兩區：<strong>險境那一區用 t_inv、t_gate 與冗餘項核取；功耗那一區用扇出、負載電容、電壓與頻率。兩區互不影響。</strong></p>" +
      "<p><strong>一、險境時間軸</strong>（電路 <code>F = A · B + ¬A · C</code>，t<sub>inv</sub> = " + num6(tinv) + " ns、t<sub>gate</sub> = " + num6(tgate) + " ns）</p>" + axis +
      "<p>突波寬度 = <strong>" + num6(width) + " ns</strong></p>" + judge +
      "<p><strong>二、扇出、負載與功耗</strong></p><ul>" +
      "<li>總負載電容 C<sub>total</sub> = " + int0(fanout) + " × " + num6(cload) + " pF = <strong>" + num6(ctot) + " pF</strong></li>" +
      "<li>負載延遲 = k<sub>load</sub> × C<sub>total</sub> = 1.0 ns/pF × " + num6(ctot) + " pF = <strong>" + num6(tload) + " ns</strong></li>" +
      "<li>輸出總延遲 = t<sub>gate</sub> + 負載延遲 = <strong>" + num6(ttotal) + " ns</strong></li>" +
      "<li>動態功耗 P = α · C · V<sub>DD</sub>² · f（α = 1）= " + num6(ctot) + " pF × " + num6(vdd) + "² V² × " + int0(freq) + " MHz = <strong>" + power(p) + "</strong></li>" +
      "</ul>" +
      "<p>量級對照：217.800000 µW 大約是一顆 LED 亮度的千分之一；但一顆晶片上有<strong>幾億個</strong>這種節點。</p>" + edge +
      "<p><strong>為什麼：</strong>功耗與電壓成平方關係，所以降壓是最有效的省電手段——這就是製程一路從 5 V 降到 0.8 V 的原因。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 09 閂鎖與正反器 —— 8 拍波形 */
function ffwave() {
  if (!$("ff-type")) return;
  const ids = ["ff-type", "ff-q0"];
  for (let i = 0; i < 8; i++) ids.push("ff-a" + i);
  for (let i = 0; i < 8; i++) ids.push("ff-b" + i);
  const INFO = {
    dff: { name: "D 正反器（正緣觸發）", a: "D", b: "—", use: "只用第一排（第二排完全不影響）", eq: "Q<sup>+</sup> = D" },
    tff: { name: "T 正反器（正緣觸發）", a: "T", b: "—", use: "只用第一排（第二排完全不影響）", eq: "Q<sup>+</sup> = T ⊕ Q" },
    jkff: { name: "JK 正反器（正緣觸發）", a: "J", b: "K", use: "用 J、K 兩排", eq: "Q<sup>+</sup> = J · ¬Q + ¬K · Q" },
    dlatch: { name: "D 閂鎖（位準觸發）", a: "D", b: "EN", use: "用 D 與 EN 兩排", eq: "EN = 1 時 Q = D，EN = 0 時保持" },
    srlatch: { name: "SR 閂鎖（位準觸發）", a: "S", b: "R", use: "用 S、R 兩排", eq: "Q<sup>+</sup> = S + ¬R · Q（限制 S · R = 0）" }
  };
  const draw = () => {
    const t = pick("ff-type"), info = INFO[t];
    let q = chk("ff-q0") ? 1 : 0;
    const a = [], b = [];
    for (let i = 0; i < 8; i++) { a.push(chk("ff-a" + i) ? 1 : 0); b.push(chk("ff-b" + i) ? 1 : 0); }
    const qs = [], reasons = [], forbidden = [];
    for (let i = 0; i < 8; i++) {
      const prev = q;
      if (t === "dff") { q = a[i]; }
      else if (t === "tff") { q = a[i] ? (prev ? 0 : 1) : prev; }
      else if (t === "jkff") { q = ((a[i] === 1 && prev === 0) || (b[i] === 0 && prev === 1)) ? 1 : 0; }
      else if (t === "dlatch") { q = b[i] === 1 ? a[i] : prev; }
      else { /* srlatch */
        if (a[i] === 1 && b[i] === 1) { forbidden.push(i); q = prev; }
        else q = (a[i] === 1) ? 1 : (b[i] === 1 ? 0 : prev);
      }
      qs.push(q);
      let why = "";
      if (t === "dff") why = "D = " + a[i] + " → Q 直接複製，變成 " + q;
      else if (t === "tff") why = a[i] ? "T = 1 → 翻轉，Q 由 " + prev + " 變 " + q : "T = 0 → 保持 " + q;
      else if (t === "jkff") {
        why = (a[i] === 1 && b[i] === 1) ? "J = 1、K = 1 → 翻轉，Q 由 " + prev + " 變 " + q
          : (a[i] === 1 ? "J = 1、K = 0 → 設定，Q = 1"
            : (b[i] === 1 ? "J = 0、K = 1 → 清除，Q = 0" : "J = K = 0 → 保持 " + q));
      } else if (t === "dlatch") {
        why = b[i] ? "EN = 1 → 透通，Q 直接等於 D = " + a[i] : "EN = 0 → 鎖住，保持前一拍的 " + q;
      } else {
        why = (a[i] === 1 && b[i] === 1) ? "S = R = 1 → <strong>禁止組合</strong>，本課約定保持前一個值（" + q + "）；真實電路在這裡的行為不保證"
          : (a[i] === 1 ? "S = 1 → 設定，Q = 1" : (b[i] === 1 ? "R = 1 → 清除，Q = 0" : "S = R = 0 → 保持 " + q));
      }
      reasons.push("<li>第 " + i + " 拍：" + why + "</li>");
    }

    let head = "<tr><th>訊號</th>";
    for (let i = 0; i < 8; i++) head += "<th>第 " + i + " 拍</th>";
    head += "</tr>";
    let rowA = "<tr><td>" + info.a + "（第一輸入）</td>", rowB = "<tr><td>" + info.b + "（第二輸入）</td>", rowQ = "<tr><td>Q</td>";
    for (let i = 0; i < 8; i++) {
      rowA += "<td>" + a[i] + "</td>";
      rowB += "<td>" + (info.b === "—" ? "—" : b[i]) + "</td>";
      rowQ += "<td><strong>" + qs[i] + "</strong>" + (forbidden.indexOf(i) >= 0 ? "（禁止）" : "") + "</td>";
    }
    rowA += "</tr>"; rowB += "</tr>"; rowQ += "</tr>";

    let judge = "";
    if (t === "dff") judge += "<p>Q 完全複製第一排——<strong>D 正反器不做任何運算，它只把資料延後到時脈邊緣。</strong></p>";
    if (t === "tff" || t === "jkff") judge += "<p>有些拍的輸出取決於<strong>上一拍的 Q</strong>，這就是「有狀態」：同樣的輸入，來的時機不同，結果就不同。</p>";
    if (t === "dlatch") judge += "<p>EN = 1 的那幾拍，Q 直接跟著 D 跑——<strong>閂鎖是透通的</strong>：EN = 1 時輸入的任何變化（包含第 08 章的突波）都會直接穿過去。這就是同步設計不用閂鎖的原因。</p>";
    if (t === "srlatch" && forbidden.length > 0) {
      judge += "<p><strong>第 " + forbidden.join("、") + " 拍出現 S = R = 1 的禁止組合。</strong>兩個輸出被同時強制成同一個值，Q 與 ¬Q 不再互補；兩者同時放開時停在哪一邊取決於路徑延遲差，<strong>真實電路的行為不保證</strong>。</p>";
    }

    let edge = "";
    if (chk("ff-q0")) {
      edge += "<p>初始 Q = 1：<strong>D 正反器完全不受它影響</strong>（輸出只看最新的 D），<strong>T 正反器整列反相</strong>（輸出看的是初始值加上翻轉次數的奇偶）。</p>";
    }
    if (t === "dff" && a.indexOf(1) < 0) edge += "<p>第一排全不勾：D 恆為 0，Q 從第 0 拍起就恆為 0。</p>";
    if (t === "dlatch" && b.indexOf(1) < 0) edge += "<p>EN 一直是 0，<strong>閂鎖從頭鎖到尾</strong>，Q 恆為初始值。</p>";

    $("ffwave-output").innerHTML =
      "<p>目前元件：<strong>" + info.name + "</strong>，" + info.use + "。特性方程 <code>" + info.eq + "</code>，初始 Q = " + (chk("ff-q0") ? "1" : "0") + "。</p>" +
      "<table><thead>" + head + "</thead><tbody>" + rowA + rowB + rowQ + "</tbody></table>" +
      "<p><strong>逐拍理由：</strong></p><ul>" + reasons.join("") + "</ul>" + judge + edge +
      "<p><strong>為什麼：</strong>正反器只在時脈邊緣看一次資料，所以邊緣之間發生什麼都不重要——第 08 章的突波就是這樣被同步設計吃掉的。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 10 時脈與時序限制 */
function timing() {
  if (!$("tm-tcq")) return;
  const ids = ["tm-tcq", "tm-tlogic", "tm-tsu", "tm-th", "tm-skew", "tm-jitter", "tm-tmin", "tm-freq"];
  const draw = () => {
    const tcq = val("tm-tcq"), tlogic = val("tm-tlogic"), tsu = val("tm-tsu"), th = val("tm-th");
    const skew = val("tm-skew"), jitter = val("tm-jitter"), tmin = val("tm-tmin"), freq = val("tm-freq");
    const need = tcq + tlogic + tsu + jitter - skew;
    const T = 1000 / freq;
    const setupSlack = T - need;
    const holdNeed = th + skew;
    const holdHave = tcq + tmin;
    const holdSlack = holdHave - holdNeed;

    const fmaxLine = need > 0
      ? "<li>最大時脈頻率 f<sub>max</sub> = 1000 / " + num6(need) + " = <strong>" + num6(1000 / need) + " MHz</strong></li>"
      : "<li>在這組參數下建立時間限制不成立（偏斜大於其他項總和），<strong>f<sub>max</sub> 不受它限制</strong>——實際會被別的路徑限制住。</li>";

    let judge = "";
    if (setupSlack >= 0 && holdSlack >= 0) {
      judge += "<p><strong>時序收斂：</strong>在這個頻率下資料來得及、也不會太早。</p>";
    }
    if (setupSlack < 0) {
      const okFreq = need > 0 ? 1000 / need : 0;
      judge += "<p><strong>建立時間違規（餘裕 " + num6(setupSlack) + " ns）：</strong>資料還沒到就被取樣。<strong>降頻可以救</strong>——" +
        (need > 0 ? "降到 " + num6(okFreq) + " MHz 以下就過了" : "但這組參數下限制式本身不成立") + "，或者把組合邏輯切成兩級（管線）。</p>";
    }
    if (holdSlack < 0) {
      judge += "<p><strong>保持時間違規（餘裕 " + num6(holdSlack) + " ns）：</strong>資料太早到，把前一拍的值蓋掉了。<strong>降頻完全沒有用</strong>，因為這條式子裡根本沒有 T<sub>clk</sub>。救法是在短路徑上插延遲緩衝器（增加 t<sub>min</sub>），或修時脈樹減少偏斜。</p>";
    }
    if (skew > 0) {
      judge += "<p>t<sub>skew</sub> = " + num6(skew) + " ns（正）：<strong>放寬了建立、收緊了保持</strong>——這是時序收斂最常見的兩難。</p>";
    }
    if (holdNeed <= 0) {
      judge += "<p>保持需求為 0 或負，這條限制<strong>自動成立</strong>。</p>";
    }

    let edge = "";
    if (tlogic >= 20) edge += "<p>組合邏輯最長路徑 " + num6(tlogic) + " ns：<strong>組合邏輯太深是頻率上不去最常見的原因</strong>，解法是把它切成兩級。</p>";
    if (freq >= 1000) edge += "<p>頻率拉到 " + int0(freq) + " MHz，週期只剩 " + num6(T) + " ns，建立餘裕大幅為負。</p>";

    $("timing-output").innerHTML =
      "<ul>" +
      "<li>最小時脈週期 = t<sub>cq</sub> + t<sub>logic</sub> + t<sub>su</sub> + t<sub>jitter</sub> − t<sub>skew</sub> = " +
      num6(tcq) + " + " + num6(tlogic) + " + " + num6(tsu) + " + " + num6(jitter) + " − " + num6(skew) + " = <strong>" + num6(need) + " ns</strong></li>" +
      fmaxLine +
      "<li>目前週期 = 1000 / " + int0(freq) + " = <strong>" + num6(T) + " ns</strong></li>" +
      "<li>建立餘裕 = " + num6(T) + " − " + num6(need) + " = <strong>" + num6(setupSlack) + " ns（" + (setupSlack >= 0 ? "通過" : "違規") + "）</strong></li>" +
      "<li>保持需求 = t<sub>h</sub> + t<sub>skew</sub> = <strong>" + num6(holdNeed) + " ns</strong></li>" +
      "<li>保持實際 = t<sub>cq</sub> + t<sub>min</sub> = <strong>" + num6(holdHave) + " ns</strong></li>" +
      "<li>保持餘裕 = <strong>" + num6(holdSlack) + " ns（" + (holdSlack >= 0 ? "通過" : "違規") + "）</strong></li>" +
      "</ul>" + judge + edge +
      "<p><strong>為什麼：</strong>時脈的唯一作用是規定大家什麼時候一起看資料；一個週期必須裝得下 t<sub>cq</sub> + 組合邏輯 + t<sub>su</sub>。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 11 有限狀態機 —— 偵測 1101（允許重疊） */
function fsm() {
  if (!$("fs-model")) return;
  const ids = ["fs-model", "fs-encode"];
  for (let i = 0; i < 12; i++) ids.push("fs-b" + i);
  /* Mealy：4 狀態；Moore：5 狀態 */
  const MEALY = { T0: ["T0", "T1"], T1: ["T0", "T2"], T2: ["T3", "T2"], T3: ["T0", "T1"] };
  const MEALY_OUT = { T0: [0, 0], T1: [0, 0], T2: [0, 0], T3: [0, 1] };
  const MOORE = { S0: ["S0", "S1"], S1: ["S0", "S2"], S2: ["S3", "S2"], S3: ["S0", "S4"], S4: ["S0", "S2"] };
  const MOORE_OUT = { S0: 0, S1: 0, S2: 0, S3: 0, S4: 1 };
  const draw = () => {
    const model = pick("fs-model"), enc = pick("fs-encode");
    const seq = [];
    for (let i = 0; i < 12; i++) seq.push(chk("fs-b" + i) ? 1 : 0);

    let ms = "T0"; const mStates = [], mOut = [];
    let os = "S0"; const oStates = [], oOut = [];
    for (let i = 0; i < 12; i++) {
      mStates.push(ms); mOut.push(MEALY_OUT[ms][seq[i]]); ms = MEALY[ms][seq[i]];
      oStates.push(os); oOut.push(MOORE_OUT[os]); os = MOORE[os][seq[i]];
    }
    const hits = [];
    mOut.forEach((v, i) => { if (v === 1) hits.push(i); });
    const mooreHits = [];
    oOut.forEach((v, i) => { if (v === 1) mooreHits.push(i); });

    const row = (label, arr) => {
      let r = "<tr><td>" + label + "</td>";
      arr.forEach(v => { r += "<td>" + v + "</td>"; });
      return r + "</tr>";
    };
    let head = "<tr><th>拍</th>";
    for (let i = 0; i < 12; i++) head += "<th>" + i + "</th>";
    head += "</tr>";

    const nStates = model === "mealy" ? 4 : 5;
    const ffs = enc === "onehot" ? nStates : bitsNeeded(nStates);
    const unused = Math.pow(2, ffs) - nStates;

    /* 詳細狀態表 */
    let detail = "<table><thead><tr><th>拍</th><th>輸入</th><th>消化前的狀態</th><th>輸出</th><th>消化後的狀態</th></tr></thead><tbody>";
    for (let i = 0; i < 12; i++) {
      const st = model === "mealy" ? mStates[i] : oStates[i];
      const nx = model === "mealy" ? MEALY[st][seq[i]] : MOORE[st][seq[i]];
      const ov = model === "mealy" ? mOut[i] : oOut[i];
      detail += "<tr><td>" + i + "</td><td>" + seq[i] + "</td><td>" + st + "</td><td>" + (ov === 1 ? "<strong>1</strong>" : "0") + "</td><td>" + nx + "</td></tr>";
    }
    detail += "</tbody></table>";

    let judge = "";
    if (hits.length === 0) {
      judge += "<p>這段輸入裡沒有 <code>1101</code>，一次都沒偵測到。試試把某幾拍改成 1。</p>";
      if (seq.indexOf(0) < 0) judge += "<p>12 拍全是 1：Mealy 走 T0 → T1 → T2 → T2 …，<strong>連續的 1 停在 T2 不動</strong>，因為沒有 0 就永遠走不到 T3。</p>";
    } else {
      judge += "<p>Mealy 在第 " + hits.join("、") + " 拍宣告偵測到（共 <strong>" + int0(hits.length) + "</strong> 次）；Moore 在第 " +
        (mooreHits.length ? mooreHits.join("、") : "（窗內沒有）") + " 拍宣告。<strong>Moore 慢一拍</strong>——因為 Moore 的輸出是狀態的函數，得等時脈邊緣把狀態推進去。</p>";
      for (let k = 1; k < hits.length; k++) {
        if (hits[k] - hits[k - 1] === 3) {
          judge += "<p>第 " + hits[k - 1] + " 拍與第 " + hits[k] + " 拍這兩次<strong>共用了中間那個 1</strong>，這就是「允許重疊」的意思。</p>";
          break;
        }
      }
      if (hits.length > mooreHits.length) {
        judge += "<p>Moore 少宣告 " + int0(hits.length - mooreHits.length) + " 次，是因為最後一次的輸出落在第 12 拍——<strong>超出這 12 格的窗</strong>，不是沒偵測到。</p>";
      }
    }
    if (enc === "onehot") {
      judge += "<p>one-hot 用最多正反器，但<strong>下一狀態邏輯最淺</strong>（每個狀態只要看幾條線），FPGA 上通常反而最快；代價是未使用狀態多達 " + int0(unused) + " 個，<strong>自恢復邏輯不能省</strong>。</p>";
    }

    $("fsm-output").innerHTML =
      "<p>輸入那 12 格<strong>永遠都在用</strong>；機器選項只決定下面的詳細狀態表，編碼選項只影響正反器數量的那三行。</p>" +
      "<p>輸入序列：<code>" + seq.join("") + "</code></p>" +
      "<table><thead>" + head + "</thead><tbody>" +
      row("輸入", seq) + row("Mealy 輸出", mOut) + row("Moore 輸出", oOut) +
      "</tbody></table>" +
      "<p><strong>" + (model === "mealy" ? "Mealy" : "Moore") + " 機的逐拍狀態表</strong>（輸出定義：Mealy 看「消化前的狀態 + 目前輸入」，Moore 只看「消化前的狀態」）</p>" + detail +
      "<ul>" +
      "<li>狀態數：<strong>" + int0(nStates) + "</strong>（Mealy 4、Moore 5）</li>" +
      "<li>" + (enc === "binary" ? "二進位" : (enc === "gray" ? "格雷碼" : "one-hot")) + "編碼需要 <strong>" + int0(ffs) + "</strong> 個正反器</li>" +
      "<li>未使用狀態 = 2<sup>" + int0(ffs) + "</sup> − " + int0(nStates) + " = <strong>" + int0(unused) + "</strong> 個</li>" +
      "<li>Mealy 偵測到 <strong>" + int0(hits.length) + "</strong> 次；Moore 在這 12 格窗內宣告 <strong>" + int0(mooreHits.length) + "</strong> 次</li>" +
      "</ul>" + judge +
      "<p><strong>為什麼：</strong>狀態的意義就是「已經對上了規格的哪一段前綴」——想清楚這句話，狀態表就自己寫出來了。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 12 暫存器、計數器與記憶體 */
function regmem() {
  if (!$("rm-mode")) return;
  const ids = ["rm-mode"];
  for (let i = 0; i < 8; i++) ids.push("rm-sin" + i);
  ids.push("rm-mod", "rm-tech", "rm-addr", "rm-word");
  const TECH = {
    sram: "SRAM（6T）", dram: "DRAM（1T1C）", rom: "ROM / Flash（非揮發）", cam: "CAM（內容定址）"
  };
  const draw = () => {
    const mode = pick("rm-mode");
    let head = "", body = "", judge = "";

    if (mode === "shift") {
      head = "這個模式只用 <strong>8 個串列輸入格</strong>（模數滑桿、記憶體種類、位址線與字寬都不影響）。";
      let reg = 0;
      let rows = "<table><thead><tr><th>拍</th><th>串列輸入</th><th>移位後內容 Q<sub>3</sub>Q<sub>2</sub>Q<sub>1</sub>Q<sub>0</sub></th><th>十進位</th></tr></thead><tbody>";
      let hit1101 = -1;
      for (let i = 0; i < 8; i++) {
        const sin = chk("rm-sin" + i) ? 1 : 0;
        reg = ((reg >> 1) | (sin << 3)) & 15;
        if (reg === 13 && hit1101 < 0) hit1101 = i;
        rows += "<tr><td>" + i + "</td><td>" + sin + "</td><td><strong><code>" + bits(reg, 4) + "</code></strong></td><td>" + int0(reg) + "</td></tr>";
      }
      rows += "</tbody></table>";
      body = rows;
      judge = "<p>每一拍：新的位元從 Q<sub>3</sub> 進來，其餘全部往右挪一格——<strong>這四件事在同一個時脈邊緣同時發生</strong>，所以不會像軟體迴圈那樣互相覆蓋。這是硬體「併發思維」的第一個例子。</p>";
      if (hit1101 >= 0) {
        judge += "<p>第 " + int0(hit1101) + " 拍的內容正是 <code>1101</code>——<strong>第 11 章那台狀態機在找的樣式</strong>。序列偵測器可以用「移位暫存器 + 一個 4 輸入 AND 閘」實作：多用 4 個正反器，換到完全不用想狀態表。</p>";
      }
      let allZero = true;
      for (let i = 0; i < 8; i++) if (chk("rm-sin" + i)) allZero = false;
      if (allZero) judge += "<p>串列輸入全不勾：內容一直是 <code>0000</code>，進去什麼就存什麼，暫存器本身不做任何判斷。</p>";

    } else if (mode === "counter") {
      head = "這個模式只用 <strong>模數滑桿</strong>（串列輸入格、記憶體那三項都不影響）。";
      const mod = val("rm-mod");
      const ffs = bitsNeeded(mod);
      const unused = Math.pow(2, ffs) - mod;
      const delay = ffs * TFF;
      body = "<ul>" +
        "<li>模 " + int0(mod) + " 計數器的正反器數 = ⌈log<sub>2</sub>" + int0(mod) + "⌉ = <strong>" + int0(ffs) + "</strong></li>" +
        "<li>未使用狀態 = 2<sup>" + int0(ffs) + "</sup> − " + int0(mod) + " = <strong>" + int0(unused) + "</strong> 個</li>" +
        "<li>漣波計數器最壞延遲 = " + int0(ffs) + " × " + num6(TFF) + " ns = <strong>" + num6(delay) + " ns</strong>（" + num6(1000 / delay) + " MHz）</li>" +
        "<li>同步計數器：所有正反器同時收到時脈，<strong>延遲不隨位元數成長</strong>，代價是要多一組進位邏輯</li>" +
        "</ul>";
      judge = "<p>" + int0(mod) + " 個計數值要 " + int0(ffs) + " 個正反器，多出來的 " + int0(unused) +
        " 個狀態上電時可能掉進去——<strong>安全的計數器必須讓它們都能回到 0</strong>。</p>";
      if (unused === 0) judge += "<p>未使用狀態 0：<strong>剛好用滿是最省的模數</strong>，這就是二進位計數器最常見的原因。</p>";

    } else {
      head = "這個模式只用 <strong>記憶體種類、位址線條數與字寬</strong>三項（串列輸入格與模數滑桿都不影響）。";
      const tech = pick("rm-tech"), addr = val("rm-addr"), word = val("rm-word");
      const cells = Math.pow(2, addr) * word;
      const bytes = cells / 8;
      const rowBits = Math.ceil(addr / 2), colBits = addr - rowBits;
      const rows = Math.pow(2, rowBits), cols = Math.pow(2, colBits);
      const unit = bytes >= 1048576 ? 1048576 : 1024;
      const capVal = bytes / unit;
      const cap = (capVal === Math.floor(capVal) ? int0(capVal) : num6(capVal)) + (unit === 1048576 ? " MiB" : " KiB");
      let cellLine;
      if (tech === "sram") cellLine = "<li>SRAM 位元胞 6 顆電晶體（6T）→ 共 <strong>" + int0(cells * 6) + " 顆電晶體</strong></li>";
      else if (tech === "dram") cellLine = "<li>DRAM 位元胞 1 顆電晶體 + 1 顆電容（1T1C）→ 共 <strong>" + int0(cells) + " 顆電晶體 ＋ " + int0(cells) + " 顆電容</strong></li>" +
        "<li>更新（refresh）：" + int0(rows) + " 列必須在 64 ms 內全刷完 → 每 <strong>" + num6(64000 / rows) + " µs</strong> 刷一列</li>";
      else if (tech === "rom") cellLine = "<li>非揮發，斷電不掉資料、<strong>不需要更新</strong>；但 Flash 的寫入次數有限（典型 10<sup>4</sup>–10<sup>5</sup> 次），而且是整塊擦除</li>";
      else cellLine = "<li>CAM 以 SRAM 6T 為底（等效 " + int0(cells * 6) + " 顆電晶體），<strong>每個位元再多一組比較電路，面積至少是 SRAM 的兩倍</strong>；換到的是一個週期內比對整片內容</li>";
      body = "<ul>" +
        "<li>種類：<strong>" + TECH[tech] + "</strong>；位址線 " + int0(addr) + " 條、字寬 " + int0(word) + " 位元</li>" +
        "<li>容量 = 2<sup>" + int0(addr) + "</sup> × " + int0(word) + " = <strong>" + int0(cells) + " 位元</strong> = <strong>" + int0(bytes) + " 位元組</strong> = <strong>" + cap + "</strong></li>" +
        cellLine +
        "<li>位址解碼拆成 <strong>" + int0(rowBits) + " 對 " + int0(rows) + " 列解碼 ＋ " + int0(colBits) + " 對 " + int0(cols) + " 行解碼</strong>（單層要 " + int0(Math.pow(2, addr)) + " 個 " + int0(addr) + " 輸入 AND 閘，拆開之後只要 " + int0(rows + cols) + " 個）</li>" +
        "</ul>";
      if (tech === "sram" && cells * 6 > 1e9) {
        judge = "<p>這個規模的 SRAM 要 " + int0(cells * 6) + " 顆電晶體——<strong>只能用 DRAM</strong>。這就是主記憶體一定是 DRAM 的原因。</p>";
      }
    }

    $("regmem-output").innerHTML =
      "<p>" + head + "</p>" + body + judge +
      "<p><strong>為什麼：</strong>位址解碼拆成列與行之後，閘數從 2<sup>n</sup> 降到 2 × 2<sup>n/2</sup>，這是所有大型記憶體的共通結構。</p>";
  };
  bind(ids, draw);
  draw();
}

/* 13 可程式邏輯與 HDL */
function pld() {
  if (!$("pl-tech")) return;
  const ids = ["pl-tech", "pl-lut", "pl-nin", "pl-volexp", "pl-nre"];
  const NAME = { cpld: "CPLD", fpga: "FPGA", asic: "ASIC" };
  const draw = () => {
    const tech = pick("pl-tech"), lut = val("pl-lut"), nin = val("pl-nin");
    const volexp = val("pl-volexp"), plnre = val("pl-nre");
    const cfgBits = Math.pow(2, lut);
    const nlut = nin <= lut ? 1 : Math.pow(2, nin - lut + 1) - 1;
    const totalCfg = nlut * cfgBits;
    const vol = Math.pow(10, volexp);
    const nre = plnre * 1e6;
    const costAsic = nre + PRICE.asic * vol;
    const costFpga = PRICE.fpga * vol;
    const costCpld = PRICE.cpld * vol;
    const cpldOk = nlut <= CPLD_MACROCELL;
    const crossFpga = nre / (PRICE.fpga - PRICE.asic);
    const crossCpld = nre / (PRICE.cpld - PRICE.asic);
    const mark = k => tech === k ? "　← 你選的方案" : "";

    let judge = "";
    if (vol < crossFpga) {
      judge += "<p>產量 " + int0(vol) + " 顆<strong>還沒到 " + num6(crossFpga) + " 顆</strong>，NRE 攤不掉，FPGA 或 CPLD 比較划算。</p>";
    } else {
      judge += "<p>產量 " + int0(vol) + " 顆<strong>已經過了 " + num6(crossFpga) + " 顆</strong>，ASIC 的單顆成本優勢開始壓過 NRE。</p>";
    }
    if (!cpldOk) {
      judge += "<p>需要 " + int0(nlut) + " 個 LUT，<strong>超過 CPLD 的 " + int0(CPLD_MACROCELL) + " 個巨集單元</strong>，只剩 FPGA 或 ASIC。</p>";
    }
    if (nin <= lut) {
      judge += "<p>函數的輸入數 " + int0(nin) + " 不超過 LUT 的輸入數 " + int0(lut) + "，<strong>一個 LUT 就夠了</strong>；剩下的組態位元都浪費掉——FPGA 的資源利用率天生就不會滿。</p>";
    }
    if (volexp === 0) {
      judge += "<p>產量只有 1 顆：ASIC 的單顆成本等於整筆 NRE 加 2 美元，<strong>單顆原型絕對不會用 ASIC</strong>。</p>";
    }

    $("pld-output").innerHTML =
      "<p>方案選項只決定下面哪一行被標成你的選擇；<strong>k 與 n 決定 LUT 數，產量與 NRE 決定成本</strong>。</p>" +
      "<ul>" +
      "<li>一個 " + int0(lut) + " 輸入 LUT 的組態位元 = 2<sup>" + int0(lut) + "</sup> = <strong>" + int0(cfgBits) + "</strong></li>" +
      "<li>實作 " + int0(nin) + " 輸入函數最壞需要的 LUT = " + (nin <= lut ? "1（n ≤ k）" : "2<sup>" + int0(nin) + "−" + int0(lut) + "+1</sup> − 1") + " = <strong>" + int0(nlut) + "</strong></li>" +
      "<li>總組態位元 = " + int0(nlut) + " × " + int0(cfgBits) + " = <strong>" + int0(totalCfg) + "</strong></li>" +
      "<li>CPLD 可行性：" + int0(nlut) + (cpldOk ? " ≤ " : " &gt; ") + int0(CPLD_MACROCELL) + " 個巨集單元 → <strong>" + (cpldOk ? "可行" : "不可行") + "</strong></li>" +
      "</ul>" +
      "<p><strong>成本</strong>（產量 " + int0(vol) + " 顆、ASIC 的 NRE " + num6(plnre) + " 百萬美元）</p>" +
      "<ul>" +
      "<li>ASIC：總成本 " + num6(costAsic) + " 美元 → <strong>" + num6(costAsic / vol) + " 美元/顆</strong>" + mark("asic") + "</li>" +
      "<li>FPGA：總成本 " + num6(costFpga) + " 美元 → <strong>" + num6(costFpga / vol) + " 美元/顆</strong>" + mark("fpga") + "</li>" +
      "<li>CPLD：總成本 " + num6(costCpld) + " 美元 → <strong>" + num6(costCpld / vol) + " 美元/顆</strong>" +
      (cpldOk ? "" : "（但這個設計裝不進 CPLD）") + mark("cpld") + "</li>" +
      "<li>ASIC 與 FPGA 的交叉點產量 = " + num6(nre) + " / (50 − 2) = <strong>" + num6(crossFpga) + " 顆</strong></li>" +
      "<li>ASIC 與 CPLD 的交叉點產量 = " + num6(nre) + " / (5 − 2) = <strong>" + num6(crossCpld) + " 顆</strong></li>" +
      "</ul>" + judge +
      "<p><strong>為什麼：</strong>LUT 就是一顆可寫入的多工器（第 06 章），k 個輸入需要 2<sup>k</sup> 個組態位元，所以 k 每加 1 成本就加倍——這就是主流 FPGA 停在 4 到 6 輸入的原因。</p>";
  };
  bind(ids, draw);
  draw();
}

/* ---------- 4. 名詞與概念字典 ---------- */
function dictionary() {
  if (!$("term-search")) return;
  const cards = document.querySelectorAll(".term-card");
  const draw = () => {
    const q = $("term-search").value.toLocaleLowerCase("zh-Hant").trim();
    let n = 0;
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const hay = (c.textContent + " " + (c.dataset.search || "")).toLocaleLowerCase("zh-Hant");
      const show = q === "" || hay.indexOf(q) >= 0;
      c.hidden = !show;
      if (show) n++;
    }
    $("term-count").textContent = "顯示 " + n + " 個條目";
  };
  on("term-search", "input", draw);
  draw();
}

/* ---------- 5. 自我檢核（42 題，答案的單一事實來源） ---------- */
function selfcheck() {
  if (!$("quiz-reset")) return;
  const R = {
    "00": ["00-數位世界觀.html", "00 數位世界觀"],
    "01": ["01-數值系統與編碼.html", "01 數值系統與編碼"],
    "02": ["02-二補數與有號數運算.html", "02 二補數與有號數運算"],
    "03": ["03-布林代數與邏輯閘.html", "03 布林代數與邏輯閘"],
    "04": ["04-標準型SOP與POS.html", "04 標準型 SOP 與 POS"],
    "05": ["05-卡諾圖與不關心項.html", "05 卡諾圖與不關心項"],
    "06": ["06-多工器解碼器與編碼器.html", "06 多工器、解碼器與編碼器"],
    "07": ["07-加法器比較器與ALU.html", "07 加法器、比較器與 ALU"],
    "08": ["08-延遲功耗與險境.html", "08 延遲、功耗與險境"],
    "09": ["09-閂鎖與正反器.html", "09 閂鎖與正反器"],
    "10": ["10-時脈與時序限制.html", "10 時脈與時序限制"],
    "11": ["11-有限狀態機.html", "11 有限狀態機"],
    "12": ["12-暫存器計數器與記憶體.html", "12 暫存器、計數器與記憶體"],
    "13": ["13-可程式邏輯與HDL.html", "13 可程式邏輯與 HDL"]
  };
  const q = (id, t, ans, tol, why, fix) => {
    const ch = id.substring(1, 3);
    return { t: t, ans: ans, tol: tol, why: why, fix: fix, ref: R[ch][0], refName: R[ch][1] };
  };
  const Q = {
    "q00-1": q("q00-1", "sel", "a", 0,
      "數位的價值不在「只有兩個電壓」，而在只需判斷高於或低於門檻：小雜訊在每一級都被重新拉回 V_OH 或 V_OL，不會累積。",
      "電晶體其實可以工作在連續區（那就是類比放大器）；省電與好算都是結果，不是原因。"),
    "q00-2": q("q00-2", "num", 0.79, 0.005,
      "NM_H = V_OH − V_IH = 3.10 − 2.31 = 0.790000 V：上游的輸出保證減下游的輸入要求。",
      "常見的錯是拿兩個輸入門檻相減（那是禁區寬度 1.32 V），或把 V_OH 減 V_IL。"),
    "q00-3": q("q00-3", "num", 1.32, 0.005,
      "禁區寬度 = V_IH − V_IL = 2.31 − 0.99 = 1.320000 V，這段電壓沒有人承諾行為。",
      "禁區不是「壞掉的區域」，也不是兩個雜訊裕度相加。"),
    "q01-1": q("q01-1", "num", 100, 0.5,
      "0110 0100 = 64 + 32 + 4 = 100，也就是 0x64、144（八進位）。",
      "位置記數法由右往左是 1、2、4、8…；容易錯在把最高位算成 128。"),
    "q01-2": q("q01-2", "num", 4, 0.5,
      "G = B ⊕ (B >> 1) = 7 ⊕ 3 = 0000 0111 ⊕ 0000 0011 = 0000 0100，十進位 4。",
      "格雷碼不是「另一個數的算術值」，它是編碼；要算數必須先轉回二進位。"),
    "q01-3": q("q01-3", "sel", "a", 0,
      "7 → 8 時二進位 0000 0111 → 0000 1000 有 4 個位元同時翻轉；格雷碼 4 → 12 只差 1 個位元。",
      "格雷碼的定義就是相鄰值只差一個位元，這正是旋轉編碼器不用純二進位的原因。"),
    "q02-1": q("q02-1", "num", -111, 0.5,
      "1001 0001 最高位是 1，有號值 = 145 − 256 = −111；同一組位元以無號讀是 145。",
      "二補數不是「符號位加大小」；1001 0001 在符號＋大小法會讀成 −17，那是另一種編碼。"),
    "q02-2": q("q02-2", "num", 55, 0.5,
      "100 − 45 = 100 + 211 = 311，311 − 256 = 55（0011 0111），進位掉出去所以 C = 1，代表不需要借位。",
      "減法的 C = 1 不代表出了問題，它代表無號意義下 A ≥ B。"),
    "q02-3": q("q02-3", "sel", "a", 0,
      "100 與 45 都是正數，相加卻得到最高位為 1 的 1001 0001（有號 −111），超出 −128…127，所以 V = 1。",
      "這一次 C = 0：以無號看 145 < 256 完全沒事。C 與 V 問的是不同問題。"),
    "q03-1": q("q03-1", "sel", "b", 0,
      "狄摩根第二式：¬(A · B) = ¬A + ¬B。四列全展開兩邊都是 1 / 1 / 1 / 0。",
      "選 a 是把兩條狄摩根定律記反了：¬(A + B) 才等於 ¬A · ¬B。"),
    "q03-2": q("q03-2", "num", 2, 0.5,
      "XOR 的真值表只有 01 與 10 兩列輸出 1；1 ⊕ 1 = 0，這正是它與 OR 的差別。",
      "答 3 通常是把 XOR 當成 OR；答 1 則是把它當成 AND。"),
    "q03-3": q("q03-3", "sel", "a", 0,
      "NAND 是通用閘：¬A = A NAND A、A · B = (A NAND B) NAND (A NAND B)、A + B = (A NAND A) NAND (B NAND B)，三個構造齊全就能組出任何函數。",
      "「通用」是說能組出所有函數，不是說最省；接成序向邏輯只要再加回授即可。"),
    "q04-1": q("q04-1", "num", 4, 0.5,
      "Σm(3, 5, 6, 7) 有 4 個為 1 的列，標準 SOP 就是 4 個乘積項、12 個字面、8 個閘。",
      "標準型是機械產生的：為 1 的列有幾個，乘積項就有幾個。"),
    "q04-2": q("q04-2", "num", 4, 0.5,
      "ΠM(0, 1, 2, 4) 有 4 個為 0 的列，所以標準 POS 是 4 個和項。兩個索引集合相加必定等於 8。",
      "最大項對應的是函數為 0 的列，不是為 1 的列。"),
    "q04-3": q("q04-3", "sel", "a", 0,
      "多數決的最簡 SOP 是 A · B + B · C + A · C：6 個字面、4 個閘，而且不再需要任何反相器（標準型要 8 個閘）。",
      "逐列驗證：000–010 全 0，011、101、110、111 各有一項為 1，與真值表完全相同。"),
    "q05-1": q("q05-1", "num", 3, 0.5,
      "on-set {5,6,7,8,9} 加上不關心 {10…15}，Quine–McCluskey 合併後剩 3 個質蘊涵項：1---（A）、-1-1（B · D）、-11-（B · C）。",
      "不關心項會讓圈變大、質蘊涵項變少；把它們當成必須覆蓋的 1 會多算。"),
    "q05-2": q("q05-2", "num", 5, 0.5,
      "F = A + B · D + B · C 的字面數 = 1 + 2 + 2 = 5，閘數 3；不化簡的標準 SOP 是 20 個字面、10 個閘。",
      "字面數數的是變數出現次數（含反相），不是乘積項個數。"),
    "q05-3": q("q05-3", "sel", "a", 0,
      "不關心項代表那個輸入組合不會發生，所以圈的時候可以當 1 把圈畫大，但不必特地去覆蓋它。",
      "風險在於：假設錯了的話，化簡後的電路會在那些輸入上做出你沒設計過的行為。"),
    "q06-1": q("q06-1", "num", 8, 0.5,
      "n 對 2^n 解碼器：3 條選擇線對應 2³ = 8 條輸出，每一條就是一個最小項。",
      "解碼器的輸出線數是 2 的選擇線次方，不是選擇線數。"),
    "q06-2": q("q06-2", "num", 5, 0.5,
      "S_2 S_1 S_0 = 101 是二進位的 5，所以選中 D_5；其他七條資料線完全不影響輸出。",
      "位元索引由 0 起、右邊為最低位：101 = 4 + 0 + 1 = 5。"),
    "q06-3": q("q06-3", "sel", "a", 0,
      "輸入全 0 與「只有 D_0 是 1」都會輸出 000，GS 是唯一能區分這兩種情況的訊號。",
      "致能與 GS 是兩回事：EN 決定要不要工作，GS 回報「到底有沒有輸入為 1」。"),
    "q07-1": q("q07-1", "num", 9, 0.05,
      "4 位元漣波：每個全加器從 C_in 到 C_out 是 2 個閘延遲，最後的和再 1 個 → 4 × 2 + 1 = 9 個閘延遲 = 9.000000 ns（111.111111 MHz）。",
      "進位必須一級一級傳，這就是漣波的名字由來；位元數加倍延遲就加倍。"),
    "q07-2": q("q07-2", "num", 4, 0.05,
      "CLA：P、G 各 1 個閘延遲、展開的進位邏輯 2 個、和的 XOR 1 個 = 4 個閘延遲 = 4.000000 ns（250.000000 MHz），加速 2.25 倍。",
      "CLA 不是「不用進位」，它只是不等前一位算完；代價是閘數 20 → 26。"),
    "q07-3": q("q07-3", "sel", "a", 0,
      "1001 + 0111：四位全部產生進位，和 0000、C_4 = 1、C_3 = 1 → V = 1 ⊕ 1 = 0。無號 9 + 7 = 16 溢出，有號 −7 + 7 = 0 完全正確。",
      "這一組正是漣波的最壞情形：進位從第 0 位一路走到第 3 位。"),
    "q08-1": q("q08-1", "num", 1, 0.02,
      "F 在 2 × t_gate = 1.000000 ns 掉到 0、在 t_inv + 2 × t_gate = 2.000000 ns 回到 1，寬度恰好等於 t_inv = 1.000000 ns。",
      "突波寬度只由反相器延遲決定，因為它就是兩條路徑的時間差。"),
    "q08-2": q("q08-2", "num", 217.8, 0.5,
      "C_total = 4 × 0.05 = 0.200000 pF，P = 1 × 0.2 pF × 3.3² V² × 100 MHz = 217.800000 µW。",
      "功耗與電壓成平方關係；單位換算 pF 乘 1e−12、MHz 乘 1e6 不能漏。"),
    "q08-3": q("q08-3", "sel", "a", 0,
      "加入冗餘項 B · C：這一項在 B = C = 1 時恆為 1、與 A 無關，所以 A 怎麼變它都撐住輸出。",
      "代價是多 1 個 AND 閘、OR 從 2 輸入變 3 輸入；最簡 SOP 反而會把這一項刪掉。"),
    "q09-1": q("q09-1", "sel", "a", 0,
      "閂鎖是位準觸發（EN = 1 時透通），正反器是邊緣觸發（只在時脈邊緣取樣一次）。",
      "閂鎖其實更小更快；差別不在速度，而在時序能不能被標準工具分析。"),
    "q09-2": q("q09-2", "sel", "a", 0,
      "S = 1、R = 1 時兩個輸出被同時強制成同一個值，Q 與 ¬Q 不再互補；同時放開會進入不可預測的競賽。",
      "JK 的 11 是翻轉不是禁止——JK 正是為了解決 SR 的這個問題而來。"),
    "q09-3": q("q09-3", "num", 0, 0.1,
      "T 正反器 Q 序列是 0,1,0,0,1,1,1,0：第 7 拍 T = 1 由 1 翻回 0，所以走完 8 拍後 Q = 0。",
      "T 正反器看的是初始值加上翻轉次數的奇偶；輸入有 4 個 1，偶數次翻轉回到初始的 0。"),
    "q10-1": q("q10-1", "num", 4.65, 0.02,
      "T_clk ≥ t_cq + t_logic + t_su + t_jitter − t_skew = 0.40 + 4.00 + 0.20 + 0.05 − 0.00 = 4.650000 ns。",
      "抖動是加項（下一個邊緣可能提早到），偏斜是減項（接收端晚到等於多給時間）。"),
    "q10-2": q("q10-2", "num", 215.053763, 0.5,
      "f_max = 1000 / 4.65 = 215.053763 MHz（週期用 ns 時，頻率 MHz = 1000 / T）。",
      "f_max 不是「這顆晶片的速度」，它是這一條路徑的上限。"),
    "q10-3": q("q10-3", "sel", "a", 0,
      "保持限制是 t_cq + t_min ≥ t_h + t_skew，整條式子裡完全沒有 T_clk，所以降頻一點用都沒有。",
      "救法只有兩種：在短路徑上插延遲緩衝器（增加 t_min），或修時脈樹減少偏斜。"),
    "q11-1": q("q11-1", "num", 4, 0.5,
      "Mealy 的 4 個狀態 T0–T3 分別代表「已對上 0 / 1 / 11 / 110 個字元」，偵測成功掛在轉移上。",
      "狀態的意義就是「已經對上了規格的哪一段前綴」。"),
    "q11-2": q("q11-2", "num", 5, 0.5,
      "Moore 需要 5 個狀態：「已經對上 1101」這件事必須自己佔一個狀態 S4 才能當輸出。",
      "這也是 Moore 慢一拍的原因——要等時脈邊緣把狀態推進去才看得到輸出。"),
    "q11-3": q("q11-3", "num", 3, 0.5,
      "110110101101 送進 Mealy 偵測器，在第 3、6、11 拍各宣告一次，共 3 次；第 3 與第 6 次共用了中間那個 1（允許重疊）。",
      "Moore 在這 12 格窗內只看得到 2 次，第三次的輸出落在第 12 拍，窗外。"),
    "q12-1": q("q12-1", "num", 4, 0.5,
      "⌈log_2 10⌉ = 4 個正反器，並且有 2⁴ − 10 = 6 個未使用狀態（10–15）。",
      "未使用狀態不是「不會發生」：上電時正反器的值不確定，安全的計數器必須讓它們都能回到 0。"),
    "q12-2": q("q12-2", "num", 65536, 1,
      "2¹⁶ × 8 = 524288 位元 = 65536 位元組 = 64 KiB；用 SRAM 6T 就是 3145728 顆電晶體。",
      "位址線給的是「有幾格」，字寬給的是「每格幾位元」，兩者相乘才是容量。"),
    "q12-3": q("q12-3", "sel", "a", 0,
      "DRAM 用一顆電容儲存電荷，電荷會經漏電流流失，所以 64 ms 內必須把每一列讀出再寫回（256 列就是每 250 µs 刷一列）。",
      "更新與「斷電失憶」是兩件事：DRAM 通電時就得一直刷，那才是 refresh。"),
    "q13-1": q("q13-1", "num", 16, 0.5,
      "k 輸入 LUT 需要 2^k 個組態位元才能實作任何 k 輸入函數，4-LUT 就是 2⁴ = 16 個。",
      "k 每加 1 組態位元就加倍，這就是主流 FPGA 停在 4 到 6 輸入的原因。"),
    "q13-2": q("q13-2", "num", 7, 0.5,
      "用夏農展開遞迴，n > k 時最壞需要 2^(n−k+1) − 1 = 2³ − 1 = 7 個 LUT，總組態位元 7 × 16 = 112。",
      "這是最壞上界；實際函數常常用得更少，合成工具會做共用。"),
    "q13-3": q("q13-3", "num", 104166.666667, 1,
      "交叉點 = NRE / (FPGA 單價 − ASIC 單價) = 5000000 / (50 − 2) = 104166.666667 顆。",
      "低於這個產量 NRE 攤不掉；ASIC 與 CPLD 的交叉點則是 5000000 / 3 = 1666666.666667 顆。")
  };
  const ids = Object.keys(Q);
  const progress = () => {
    const n = ids.filter(i => $(i) && String($(i).value).trim() !== "").length;
    if ($("quiz-progress")) $("quiz-progress").textContent = "已作答 " + n + " / " + ids.length + " 題（僅供參考，不影響瀏覽）";
  };
  const refLink = item => "回去看：<a href=\"" + item.ref + "\">" + item.refName + "</a>";
  const check = id => {
    const item = Q[id], node = $(id), out = $(id + "-output");
    if (!node || !out) return;
    const raw = String(node.value).trim();
    if (raw === "") {
      out.innerHTML = "<p>" + (item.t === "sel" ? "先選一個選項再對答案。" : "先填一個數字再對答案。") + "</p>";
      progress();
      return;
    }
    let ok;
    if (item.t === "sel") ok = raw === item.ans;
    else {
      const v = Number(raw.replace("−", "-"));
      ok = isFinite(v) && Math.abs(v - item.ans) <= item.tol;
    }
    const shown = String(item.ans).replace("-", "−");
    out.innerHTML = ok
      ? "<p><strong>答對</strong>　" + item.why + "</p><p>" + refLink(item) + "</p>"
      : "<p><strong>再看一次</strong>　正確答案是 <strong>" + shown + "</strong>。" + item.why + "</p><p>" + item.fix + "</p><p>" + refLink(item) + "</p>";
    progress();
  };
  ids.forEach(id => {
    on(id + "-check", "click", () => check(id));
    on(id, "input", progress);
    on(id, "change", progress);
  });
  on("quiz-reset", "click", () => {
    ids.forEach(id => {
      if ($(id)) $(id).value = "";
      if ($(id + "-output")) $(id + "-output").innerHTML = "";
    });
    progress();
  });
  progress();
}

/* ---------- 6. 註冊 ---------- */
if (typeof document !== "undefined") {
  [nmargin, numbase, twoscomp, boolgate, canonical, kmap, muxdec, adder,
    hazard, ffwave, timing, fsm, regmem, pld, dictionary, selfcheck].forEach(f => f());
}

/* ---------- 7. 匯出（供 node 語法檢查與人工交叉驗算） ---------- */
if (typeof module !== "undefined") {
  module.exports = {
    fmt: fmt, num6: num6, int0: int0, bits: bits, popcount: popcount, bitsNeeded: bitsNeeded,
    FAMILY: FAMILY, KLOAD: KLOAD, TFF: TFF, PRICE: PRICE, CPLD_MACROCELL: CPLD_MACROCELL,
    kmapSolve: kmapSolve
  };
}


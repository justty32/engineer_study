'use strict';
/* 教學模型：每次只計算一次，再把同一份結果交給數值、圖與文字。 */
const VT = 0.02585;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const fmt = (v, digits = 5) => {
  if (!Number.isFinite(v)) return '不適用';
  if (v === 0) return '0';
  if (Math.abs(v) < 0.0001 || Math.abs(v) >= 1e7) return v.toExponential(4);
  return Number(v.toPrecision(digits)).toLocaleString('en-US', {maximumFractionDigits: 8});
};
const curve = (name, fn, lo, hi, count = 120, log = false) => ({name, points: Array.from({length: count + 1}, (_, i) => {
  const x = log ? Math.exp(Math.log(lo) + i / count * Math.log(hi / lo)) : lo + i / count * (hi - lo);
  return [x, fn(x)];
})});
const graph = (xLabel, yLabel, curves, marker, opts = {}) => ({xLabel, yLabel, curves, marker, ...opts});
const result = (metrics, steps, why, plot, valid = true) => ({metrics, steps, why, plot, valid});
function diodeExponential(vs, rk) {
  let lo = 0, hi = vs;
  for (let j = 0; j < 100; j++) {
    const mid = (lo + hi) / 2;
    const i = 1e-12 * Math.expm1(mid / VT);
    if (mid + rk * 1000 * i > vs) hi = mid; else lo = mid;
  }
  const vd = (lo + hi) / 2;
  return {vd, i: (vs - vd) / rk};
}
function feedbackPoint(a, beta) {
  const l = a * beta, sum = 100 ** 2 + 10000 ** 2;
  const rhs = 100 ** 2 * 10000 ** 2 * (l * l - 1);
  const y = l > 1 ? 2 * rhs / (Math.sqrt(sum * sum + 4 * rhs) + sum) : 0;
  const fc = Math.sqrt(y);
  return {fc, pm: l > 1 ? 180 - (Math.atan(fc / 100) + Math.atan(fc / 10000)) * 180 / Math.PI : null};
}
function calculate(id, p) {
  const a = Number(p.a), b = Number(p.b);
  switch (id) {
    case '00': {
      const i = a / b, power = a * i;
      return result([['電流 I', i, 'mA'], ['電阻耗散 P', power, 'mW']],
        [`I = ${fmt(a)} V ÷ ${fmt(b)} kΩ = ${fmt(i)} mA`, `KVL：${fmt(a)} V − (${fmt(i)} mA) × (${fmt(b)} kΩ) = 0 V`, `電源供應 = 電阻耗散 = ${fmt(power)} mW`],
        'R 固定時，電源越高，電流與斜率圖上的位置一起上升。電荷沿閉合回路流動；能量在電阻轉成熱。',
        graph('電壓 VS（V）', '電流 I（mA）', [curve('I = VS / R', x => x / b, 0, 12)], [a, i]));
    }
    case '01': {
      const nd = 10 ** a, holes = 2.25e20 / nd, sigma = 1.602e-19 * 1350 * nd, j = sigma * b;
      return result([['電子 n ≈ ND', nd, 'cm⁻³'], ['電洞 p', holes, 'cm⁻³'], ['導電率 σ', sigma, 'S/cm'], ['漂移電流密度 J', j, 'A/cm²']],
        [`p = (1.5 × 10¹⁰ cm⁻³)² ÷ (10^${a} cm⁻³) = ${fmt(holes)} cm⁻³`, `σ = q μn n = ${fmt(sigma)} S/cm`, `J = σ E = (${fmt(sigma)} S/cm) × (${fmt(b)} V/cm) = ${fmt(j)} A/cm²`],
        '摻雜提高多數電子濃度，熱平衡下的少數電洞反而減少。此圖固定遷移率；高摻雜或強電場時，真實材料不再遵守這條固定斜率。',
        graph('電場 E（V/cm）', 'J（A/cm²）', [curve('固定 μ 的漂移模型', x => sigma * x, 0, 100)], [b, j]));
    }
    case '02': {
      const i = Math.max(0, (a - .7) / b), vd = i > 0 ? .7 : a, exact = diodeExponential(a, b), vr = i * b;
      return result([['恆壓降電流 I', i, 'mA'], ['二極體 VD', vd, 'V'], ['指數模型電流', exact.i, 'mA'], ['指數模型 VD', exact.vd, 'V'], ['理想開關電流', a / b, 'mA'], ['分段線性電流', Math.max(0, (a - .7) / (b + .02)), 'mA']],
        [`I = max(0, (${fmt(a)} V − 0.7 V) ÷ ${fmt(b)} kΩ) = ${fmt(i)} mA`, `重驗：VS = VR + VD = (${fmt(vr)} + ${fmt(vd)}) V = ${fmt(a)} V`, `源功率 ${fmt(a * i)} mW = R耗散 ${fmt(i * i * b)} mW + 二極體耗散 ${fmt(vd * i)} mW`],
        i > 0 ? '先從電源扣掉模型指定的 0.7 V，剩餘電壓才加在電阻上。綠點是恆壓降模型與負載線的交點；指數模型會得到不同工作點。' : '電源不足以達到此恆壓降模型的導通門檻，因此電流是零，全部電源電壓落在二極體上；不能算出負向的順偏電流。',
        graph('二極體 VD（V）', '電流 I（mA）', [curve('電阻負載線', x => (a - x) / b, 0, a), {name: '恆壓降模型', points: [[0, 0], [.7, 0], [.7, Math.max(a / b, 1)]]}], [vd, i], {xMin: 0, xMax: Math.max(a, 1)}));
    }
    case '03': {
      const fr = 2 * a, ripple = .01 / (fr * b * 1e-6), dc = 10.6 - ripple / 2, period = 1000 / fr;
      return result([['充電重複頻率 fr', fr, 'Hz'], ['漣波 ΔV', ripple, 'V'], ['近似平均 VDC', dc, 'V']],
        [`Δt = 1 / (2f) = ${fmt(1000 / fr)} ms`, `ΔV ≈ IL / (fr C) = (0.01 A) / (${fr} Hz × ${b} μF) = ${fmt(ripple)} V`, `VDC ≈ (12 V − 2×0.7 V) − ΔV/2 = ${fmt(dc)} V`],
        `每半週峰頂附近補充一次電荷；兩次補充之間，負載從電容取走電荷。${ripple / 10.6 > .1 ? '此組漣波已占峰值 ' + fmt(ripple / 10.6 * 100) + '%，小漣波近似偏粗，只宜看趨勢。' : '圖用瞬間充電、線性放電的小漣波近似。'}並非精確導通角模擬。`,
        graph('時間（ms）', '電容電壓（V）', [curve('小漣波近似', t => 10.6 - ripple * ((t % period) / period), 0, period * 3, 360)], [period / 2, dc], {yMin: 0, yMax: 12}), ripple / 10.6 <= .1);
    }
    case '04': {
      const peak = Math.min(a, b), current = Math.max(0, a - b);
      return result([['正峰輸出', peak, 'V'], ['正峰二極體電流', current, 'mA'], ['負峰輸出', -a, 'V']],
        [`vout = min(vin, ${fmt(b)} V)`, `正峰：iD = max(0, (${fmt(a)} − ${fmt(b)}) V / (1 kΩ)) = ${fmt(current)} mA`, `負峰：二極體關閉，vout = −${fmt(a)} V`],
        a > b ? '超過位準的那一段電壓落在串聯電阻上；輸出停在位準，電流隨超出量增加。負半週沒有此導通路徑。' : '整段輸入都未超過限幅位準，因此二極體不承擔限幅電流，輸出完整跟隨輸入。',
        graph('相位 θ（度）', '電壓（V）', [curve('輸入', x => a * Math.sin(x * Math.PI / 180), 0, 360), curve('限幅輸出', x => Math.min(a * Math.sin(x * Math.PI / 180), b), 0, 360)], [90, peak]));
    }
    case '05': {
      const ib = 1.46 / (14.76 + a + 1), ic = a * ib, ie = (a + 1) * ib, ve = ie, vb = ve + .7, vc = 12 - ic * b, vce = vc - ve, valid = vc > vb;
      return result([['候選 IB', ib * 1000, 'μA'], ['候選 IC', ic, 'mA'], ['候選 VCE', vce, 'V'], ['VC − VB', vc - vb, 'V']],
        [`IB = (1.46 V) / (14.76 kΩ + (${a}+1)×1 kΩ) = ${fmt(ib * 1000)} μA`, `VE = ${fmt(ve)} V；VB = ${fmt(vb)} V；VC = ${fmt(vc)} V`, `工作區重驗：VC ${valid ? '>' : '≤'} VB → ${valid ? '符合順向作用區' : '候選模型失效，需重新解飽和區'}`],
        valid ? '射極電阻把電流增加轉成 VE 增加，壓低可用的 VBE；有限分壓內阻也消耗一部分基極驅動。候選解通過 VC > VB，才可接受為此模型的 Q 點。' : '不能再沿用 IC = βIB：候選值已使集基接面不再反偏。表與點特別保留「候選」名稱，真實電流必須換區域模型重算。',
        graph('VCE（V）', 'IC（mA）', [curve('含 RE 的作用區負載線', x => (12 - x) / (b + (a + 1) / a), 0, 12)], [vce, ic]), valid);
    }
    case '06': {
      const ov = a - 1;
      const fn = x => ov <= 0 ? 0 : x < ov ? 2 * (ov * x - x * x / 2) : ov * ov;
      const idc = fn(b), region = ov <= 0 ? '截止區' : b < ov ? '三極區' : '飽和區';
      return result([['超驅動 VOV', ov, 'V'], ['汲極電流 ID', idc, 'mA']],
        [`VOV = VGS − Vth = (${fmt(a)} − 1) V = ${fmt(ov)} V`, `判別：${region}；ID = ${fmt(idc)} mA`, ov <= 0 ? 'VGS 未超過門檻，此強反轉模型令 ID = 0。' : b < ov ? `ID = (2 mA/V²) × [(${fmt(ov)} V)(${fmt(b)} V) − (${fmt(b)} V)²/2] = ${fmt(idc)} mA` : `ID = (2 mA/V²)/2 × (${fmt(ov)} V)² = ${fmt(idc)} mA`],
        `${region}。這裡 K = 2 mA/V² 不含 1/2；λ = 0、源極與基板相接。曲線在 VDS = VOV 連續，進入飽和後只是此理想模型的斜率為零。`,
        graph('VDS（V）', 'ID（mA）', [curve(`VGS = ${fmt(a)} V`, fn, 0, 5)], [b, idc], {vertical: ov > 0 ? [{x: ov, label: 'VDS = VOV'}] : []}));
    }
    case '07': {
      const power = .2 * a * 1e-12 * 3.3 ** 2 * b * 1e6 * 1e3, energy = .5 * a * 3.3 ** 2, delay = Math.LN2 * a;
      return result([['動態功率', power, 'mW'], ['滿充電容能量', energy, 'pJ'], ['估計 t50', delay, 'ns']],
        [`Pdyn = α C VDD² f = 0.2 × ${a} pF × (3.3 V)² × ${b} MHz = ${fmt(power)} mW`, `EC = C VDD² / 2 = ${fmt(energy)} pJ`, `t50 = ln(2) × 1 kΩ × ${a} pF = ${fmt(delay)} ns`],
        b === 0 ? '停止切換後，此模型的動態功率歸零；真實晶片仍可能有漏電。不是任何時刻都只有一顆管導通。' : `這裡 α 是每週期 0→1 的平均次數；Pdyn假設每次完成0到3.3 V擺幅。${delay > 500 / b ? '估計t50已大於半週期，真實輸出可能來不及完成擺幅，功率值僅代表條件估計。' : '頻率或負載電容增加，完整充放電的次數或能量也增加。'}`,
        graph('頻率（MHz）', '動態功率（mW）', [curve('α C VDD² f', x => .2 * a * 3.3 ** 2 * x * .001, 0, 100)], [b, power]));
    }
    case '08': {
      const gm = a / VT, lin = gm * b / 1000, exact = a * Math.expm1(b / 1000 / VT);
      return result([['跨導 gm', gm, 'mS'], ['rπ', 100 / gm, 'kΩ'], ['線性增量 ic', lin, 'mA'], ['指數增量', exact, 'mA']],
        [`gm = ICQ / VT = (${fmt(a)} mA) / (0.02585 V) = ${fmt(gm)} mS`, `ic ≈ gm vbe = ${fmt(lin)} mA；總 IC ≈ ${fmt(a + lin)} mA`, `指數模型總 IC = ICQ exp(vbe/VT) = ${fmt(a + exact)} mA`],
        '小寫 ic 是工作點附近增加或減少的量。圖刻意畫總電流 ICQ + ic；綠點位於指數曲線，另一條線是 Q 點切線，兩者的差顯示近似誤差。',
        graph('vbe 增量（mV）', '總 IC（mA）', [curve('指數總電流', x => a * Math.exp(x / 1000 / VT), -10, 10), curve('Q 點切線', x => a + gm * x / 1000, -10, 10)], [b, a + exact]));
    }
    case '09': {
      const gm = 1 / VT, gain = -gm * b / (1 + gm * a), out = gain * .005, vbe = .005 / (1 + gm * a);
      return result([['中頻增益 Av', gain, 'V/V'], ['輸出峰值幅度', Math.abs(out), 'V'], ['vbe 峰值', vbe * 1000, 'mV']],
        [`Av = −gm RC / (1 + gm RE) = −(${fmt(gm)} mS)(${fmt(b)} kΩ) / [1+(${fmt(gm)} mS)(${fmt(a)} kΩ)] = ${fmt(gain)}`, `輸入正峰 +5 mV → 輸出增量 ${fmt(out)} V`, `vin = vbe + ie RE；vbe = ${fmt(vbe * 1000)} mV`],
        '退化電阻把部分輸入電壓分走，真正控制集極電流的 vbe 變小；所以增益下降。負號代表反相，並不代表輸出總電壓是負的。',
        graph('相位 θ（度）', '輸出增量（V）', [curve('vout = Av × 5 mV sinθ', x => out * Math.sin(x * Math.PI / 180), 0, 360)], [90, out]));
    }
    case '10': {
      const cap = 10 + b * (1 + a), fh = 1 / (2 * Math.PI * 1e4 * cap * 1e-12), knee = a / Math.sqrt(2);
      return result([['等效 Cin', cap, 'pF'], ['高頻 −3 dB 點 fH', fh / 1000, 'kHz'], ['fH 處增益幅值', knee, 'V/V']],
        [`Cin = Cπ + Cμ (1 − Av) = 10 pF + (${b} pF) × (1+${a}) = ${fmt(cap)} pF`, `fH ≈ 1 / (2π × 10 kΩ × ${fmt(cap)} pF) = ${fmt(fh / 1000)} kHz`, `在 fH，|H| = ${a}/√2 = ${fmt(knee)}`],
        '跨接電容兩端以相反方向擺動，因此兩端電壓變化比輸入本身更大；從輸入端看，等效要搬動更多電荷。這是一極近似，未包含所有高頻極點。',
        graph('頻率（kHz，對數）', '增益幅值（V/V）', [curve('一極近似', x => a / Math.sqrt(1 + (x * 1000 / fh) ** 2), .1, 10000, 150, true)], [fh / 1000, knee], {xLog: true}));
    }
    case '11': {
      const g1 = -20 * a / (10 + a), g2 = -5 * b / (1 + b), total = g1 * g2, vo = total * .01, power = vo * vo / (2 * b);
      return result([['含負載第一級', g1, 'V/V'], ['含負載第二級', g2, 'V/V'], ['總增益', total, 'V/V'], ['負載正弦平均功率', power, 'mW']],
        [`A1 = −20 × (${a} kΩ)/[(10+${a}) kΩ] = ${fmt(g1)}`, `A2 = −5 × (${b} kΩ)/[(1+${b}) kΩ] = ${fmt(g2)}；A總 = ${fmt(total)}`, `vout峰值 = ${fmt(vo)} V；PL = Vpk²/(2RL) = ${fmt(power)} mW`],
        '每次接線都形成輸出電阻與下一級輸入電阻的分壓；必須先算含負載增益再相乘。輸出能量來自兩級電源，不是把輸入訊號的能量憑空放大。',
        graph('相位 θ（度）', '增量電壓（V）', [curve('第一級', x => g1 * .01 * Math.sin(x * Math.PI / 180), 0, 360), curve('末級', x => vo * Math.sin(x * Math.PI / 180), 0, 360)], [90, vo]));
    }
    case '12': {
      const fn = x => a / (1 + Math.exp(-x / 1000 / VT)), i1 = fn(b), i2 = a - i1, vo1 = 10 - 5 * i1, vo2 = 10 - 5 * i2, ad = -5 * a / (2 * VT), vb1 = b / 2000, vb2 = -vb1;
      return result([['左支 I1', i1, 'mA'], ['右支 I2', i2, 'mA'], ['差動輸出 vod', vo1 - vo2, 'V'], ['局部差動增益', ad, 'V/V']],
        [`I1 = IT/(1+exp(−vid/VT)) = ${fmt(i1)} mA`, `I2 = IT − I1 = ${fmt(i2)} mA；重驗 I1+I2 = ${fmt(a)} mA`, `Vo1 = ${fmt(vo1)} V；Vo2 = ${fmt(vo2)} V；vod = Vo1−Vo2 = ${fmt(vo1 - vo2)} V`, `0 V 共模：VB1=${fmt(vb1)} V、VB2=${fmt(vb2)} V；VC1−VB1=${fmt(vo1 - vb1)} V、VC2−VB2=${fmt(vo2 - vb2)} V，均為正`],
        '差動輸入改變左右分配，而理想尾電流保持固定。大差動輸入時一邊接近吃下全部電流，增益不再等於中心的切線斜率。圖是理想配對模型，基極共模固定0V、尾源接−5V且假定合規；本組兩管集基接面皆反偏。',
        graph('vid（mV）', '支路電流（mA）', [curve('I1', fn, -100, 100), curve('I2', x => a - fn(x), -100, 100)], [b, i1]));
    }
    case '13': {
      const ref = 4.3 / a, io = ref / 1.02, ib = io / 100, valid = b > .7;
      return result([['參考 Iref', ref, 'mA'], ['候選 Iout', io, 'mA'], ['每顆 IB', ib * 1000, 'μA']],
        [`Iref = [(5−0.7) V]/(${a} kΩ) = ${fmt(ref)} mA`, `Iout = Iref/(1+2/100) = ${fmt(io)} mA`, `KCL：(${fmt(io)} + 2×${fmt(ib)}) mA = ${fmt(ref)} mA；Vout ${valid ? '>' : '≤'} 0.7 V`],
        valid ? '參考電阻電流還要供給兩個基極，因此可複製的集極電流略少。輸出電壓通過集基接面反偏檢查，才可接受候選值。' : '輸出電壓不足以維持作用區；水平線是理想作用區的候選，不可把該電流宣稱為此偏壓下的真實值。',
        graph('輸出電壓（V）', '候選 Iout（mA）', [{name: '作用區電流（>0.7 V）', points: [[.7, io], [10, io]]}], [b, io], {vertical: [{x: .7, label: '合規邊界'}], xMin: 0, xMax: 10, yMin: 0}), valid);
    }
    case '14': {
      const gain = a / (1 + a * b), fp = feedbackPoint(a, b);
      return result([['閉迴路直流增益 Af', gain, 'V/V'], ['迴路直流增益 L0', a * b, ''], ['交越頻率', fp.pm === null ? null : fp.fc, 'Hz'], ['相位裕度', fp.pm, '°']],
        [`Af = A0/(1+A0βf) = ${a}/(1+${fmt(a * b)}) = ${fmt(gain)}`, `誤差靈敏度 = 1/(1+A0βf) = ${fmt(1 / (1 + a * b))}`, fp.pm === null ? '直流迴路增益未超過1，沒有正頻率的0 dB交越點；此處不定義該PM。' : `|L|=1 於 ${fmt(fp.fc)} Hz；PM = 180°−atan(fc/(100 Hz))−atan(fc/(10000 Hz)) = ${fmt(fp.pm)}°`],
        '更大的直流迴路增益讓閉迴路更接近電阻設定值，也把交越頻率推向第二極點，可能減少相位裕度。此圖指定兩個左半平面極點、無延遲且負回授，整個正迴路增益範圍仍穩定；較低相位裕度不代表本頁已失穩。',
        graph('頻率（Hz，對數）', '迴路相位（度）', [curve('arg L', x => -(Math.atan(x / 100) + Math.atan(x / 10000)) * 180 / Math.PI, 1, 1e6, 180, true)], fp.pm === null ? null : [fp.fc, fp.pm - 180], {xLog: true, yMin: -180, yMax: 0, vertical: fp.fc > 0 ? [{x: fp.fc, label: '|L|=1'}] : []}));
    }
    case '15': {
      const g = 1 + b / 10, candidate = g * a, vo = clamp(candidate, -12, 12), valid = Math.abs(candidate) < 12;
      return result([['設定增益', g, 'V/V'], ['模型輸出 vo', vo, 'V'], ['回授 v−', vo / g, 'V']],
        [`G = 1+Rf/Rg = 1+(${b} kΩ)/(10 kΩ) = ${fmt(g)}`, `vo = G vin = ${fmt(g)}×(${fmt(a)} V) = ${fmt(candidate)} V`, `v− = vo/G = ${fmt(vo / g)} V；${valid ? '與 v+ 相等，且未達電源限幅' : '已受 ±12 V 理想電源限制，虛短不再成立'}`],
        '在負回授、線性工作與足夠動態餘裕時，放大器調整輸出使兩輸入近乎等電位。圖中的理想供電限幅不是實際器件可達軌電壓的保證。',
        graph('輸入 vin（V）', '輸出 vo（V）', [curve('理想非反相', x => clamp(g * x, -12, 12), -1.5, 1.5)], [a, vo]), valid);
    }
    case '16': {
      const f = b * 1000, fb = 1e6 / a, vlin = 1 / Math.sqrt(1 + (f / fb) ** 2), srTarget = 2 * Math.PI * f / 1e6, srLin = srTarget * vlin, limit = .5e6 / (2 * Math.PI * f), valid = srLin <= .5;
      return result([['一極幅值 Vlin', vlin, 'V'], ['頻寬 fB', fb / 1000, 'kHz'], ['1 V 目標所需 SR', srTarget, 'V/μs'], ['Vlin 所需 SR', srLin, 'V/μs'], ['同步輸入峰值 1/G', 1 / a, 'V']],
        [`fB = GBW/G = (1000 kHz)/${a} = ${fmt(fb / 1000)} kHz`, `Vlin = (1 V)/√(1+(f/fB)²) = ${fmt(vlin)} V`, `速率可容許的正弦峰值 = SR/(2πf) = ${fmt(limit)} V；Vlin ${valid ? '≤' : '>'} 此上限`],
        valid ? `一極預測波形的最大斜率 ${fmt(srLin)} V/μs 未超過 0.5 V/μs，波形近似自洽。${srTarget > .5 ? '1 V 目標本身仍超速率能力；不能將目標失敗誤說成較小的預測波形失效。' : '1 V 目標的速率需求也在範圍內，但頻寬仍會衰減振幅。'}` : '一極預測的輸出本身已超過轉換速率；圖上 Vlin 是失效的線性候選，真實波形會失真，不能用一條正弦或簡單取小值當精確輸出。',
        graph('頻率（kHz，對數）', '正弦峰值（V）', [curve('一極線性候選', x => 1 / Math.sqrt(1 + (x * 1000 / fb) ** 2), .1, 200, 150, true), curve('速率上限（裁至2V）', x => Math.min(2, .5e6 / (2 * Math.PI * x * 1000)), .1, 200, 150, true)], [b, vlin], {xLog: true, yMin: 0, yMax: 2}), valid);
    }
    case '17': {
      const fc = 1 / (2 * Math.PI * b * 1000 * 1e-8), ratio = a / fc, mag = 2 / Math.sqrt(1 + ratio ** 2), phase = -Math.atan(ratio) * 180 / Math.PI;
      return result([['截止頻率 fc', fc, 'Hz'], ['振幅增益', mag, 'V/V'], ['相位', phase, '°']],
        [`fc = 1/(2πRC) = 1/(2π×${b}kΩ×10nF) = ${fmt(fc)} Hz`, `f/fc = ${fmt(ratio)}；|H| = 2/√(1+(f/fc)²) = ${fmt(mag)}`, `φ = −atan(f/fc) = ${fmt(phase)}°；輸入1 V峰值 → ${fmt(mag)} V峰值`],
        '低通先由 RC 分壓決定頻率衰減，再由理想運放提供兩倍增益。圖畫完整幅頻曲線；元件、頻率和相位都由同一個 RC 時常數決定。',
        graph('頻率（Hz，對數）', '增益幅值（V/V）', [curve('|H|', x => 2 / Math.sqrt(1 + (x / fc) ** 2), 10, 1e6, 150, true)], [a, mag], {xLog: true, vertical: [{x: fc, label: 'fc'}]}));
    }
    case '18': {
      const hi = b * 5 + (1 - b) * 2.5, lo = (1 - b) * 2.5, rising = p.c === 'rising', vo = rising ? (a >= hi ? 0 : 5) : (a <= lo ? 5 : 0);
      return result([['上門檻 VH', hi, 'V'], ['下門檻 VL', lo, 'V'], ['目前輸出', vo, 'V'], ['遲滯寬度', hi - lo, 'V']],
        [`VH = βf×(5 V)+(1−βf)×(2.5 V) = ${fmt(hi)} V`, `VL = βf×(0 V)+(1−βf)×(2.5 V) = ${fmt(lo)} V`, `${rising ? '由低輸入上升，輸出原為高' : '由高輸入下降，輸出原為低'}；vin=${fmt(a)} V → vo=${vo} V`],
        '輸入在兩門檻之間時，輸出取決於從哪邊走來。方向選項代表完整的單向掃描歷史，不是假裝同一輸入永遠只有一個結果。等號在本模型定為切換時刻。',
        graph('輸入 vin（V）', '輸出 vo（V）', [{name: '上升路徑', points: [[0, 5], [hi, 5], [hi, 0], [5, 0]]}, {name: '下降路徑', points: [[0, 5], [lo, 5], [lo, 0], [5, 0]]}], [a, vo], {yMin: -.5, yMax: 5.5}));
    }
    case '19': {
      const gain = Number(p.c), f0 = 1 / (2 * Math.PI * a * 1e3 * b * 1e-9), loop = gain / 3;
      return result([['選頻 f0', f0, 'Hz'], ['f0 處回授比例', 1 / 3, ''], ['小訊號迴路增益', loop, '']],
        [`f0 = 1/(2πRC) = ${fmt(f0)} Hz`, `β(f0)=1/3 且相位=0°；L0=A/3=${fmt(loop)}`, loop > 1 ? '微小擾動可成長；之後仍需非線性幅度控制使有效增益回到1。' : loop < 1 ? '微小擾動衰減；此模型不能自行起振。' : '線性臨界值不保證可靠起振，也不決定振幅。'],
        '曲線是選頻網路的迴路增益大小，不是已產生的輸出振幅。起振與穩態分開判：增益略大於一啟動，穩幅機制決定最後幅度。',
        graph('頻率 / f0（對數）', '|Aβ|', [curve('|Aβ|', x => gain * x / Math.sqrt((1 - x * x) ** 2 + 9 * x * x), .1, 10, 150, true)], [1, loop], {xLog: true, horizontal: [{y: 1, label: '迴路增益 = 1'}]}));
    }
    case '20': {
      const vo = Math.min(3.3, Math.max(0, a - .3)), pout = vo * b, loss = (a - vo) * b, efficiency = vo / a * 100, temp = 25 + 50 * loss, valid = a >= 3.6;
      return result([['模型輸出', vo, 'V'], ['負載功率', pout, 'W'], ['穩壓器耗散', loss, 'W'], ['估計接面溫度', temp, '°C']],
        [`Pin = (${a} V)×(${b} A) = ${fmt(a * b)} W；Pout = ${fmt(pout)} W；Ploss = ${fmt(loss)} W`, `能量重驗：(${fmt(pout)} + ${fmt(loss)}) W = ${fmt(a * b)} W`, b === 0 ? '無負載且忽略靜態電流時 Pin=Pout=0，功率效率比不定義；電壓比仍可計算。' : `η = Pout/Pin = Vout/Vin ≈ ${fmt(efficiency)}%；Tj ≈ 25°C+(50°C/W)Ploss = ${fmt(temp)}°C`],
        valid ? '線性調整管承受輸入與輸出的壓差，通過相同負載電流，因此把壓差乘電流的功率轉成熱。熱阻只對假設的封裝與板條件成立。' : '壓差不足，已進入 dropout；這裡用 Vout≈Vin−0.3 V 的教學近似。實際壓差依電流與溫度改變，不能宣稱保持3.3 V。',
        graph('輸入 Vin（V）', '功率（W）', [curve('負載', x => Math.min(3.3, Math.max(0, x - .3)) * b, 3, 12), curve('耗散', x => (x - Math.min(3.3, Math.max(0, x - .3))) * b, 3, 12)], [a, loss]), valid);
    }
    case '21': {
      const vo = a * b, il = vo / 10, ripple = (a - vo) * b / 10, lo = il - ripple / 2, hi = il + ripple / 2, ton = 10 * b;
      const current = t => {const phase = t % 10; return phase <= ton ? lo + ripple * phase / ton : hi - ripple * (phase - ton) / (10 - ton);};
      return result([['平均輸出', vo, 'V'], ['平均電感電流', il, 'A'], ['峰對峰 ΔIL', ripple, 'A'], ['最小電感電流', lo, 'A']],
        [`Vo = D Vin = ${b}×(${a} V) = ${fmt(vo)} V`, `ΔIL = (Vin−Vo)D/(Lfs) = ${fmt(ripple)} A`, `伏秒重驗：(${fmt(a - vo)} V)×(${fmt(ton)} μs) + (−${fmt(vo)} V)×(${fmt(10 - ton)} μs) = 0 V·μs；Imin=${fmt(lo)} A`],
        '導通時電源增加電感能量，關斷後電感沿續流路徑供應負載。此控制範圍配固定10Ω、100μH、100kHz均為連續導通；較小占空比仍未等同斷續導通。',
        graph('時間（μs）', '電感電流（A）', [curve('CCM 三角電流', current, 0, 20, 400)], [ton, hi]), lo > 0);
    }
    case '22': {
      const n = a, max = 2 ** n - 1, code = clamp(Math.round(b), 0, max), q = 3.3 / 2 ** n, vo = code * q;
      return result([['最小步階 q', q, 'V'], ['有效碼 D', code, ''], ['理想輸出', vo, 'V'], ['最大碼輸出', max * q, 'V']],
        [`q = Vref/2^N = (3.3 V)/${2 ** n} = ${fmt(q)} V`, `D = ${code} = ${code.toString(2).padStart(n, '0')}₂；Vo = Dq = ${fmt(vo)} V`, `最大碼 ${max}：Vmax = Vref−q = ${fmt(max * q)} V`],
        'N 位元有 2^N 個碼，但最後一碼的編號只有 2^N−1。此 DAC 約定每步是 Vref/2^N，所以最大碼不等於參考電壓。',
        graph('輸入碼 D', '輸出（V）', [{name: '理想 DAC 階梯', points: Array.from({length: max + 1}, (_, d) => d ? [[d, (d - 1) * q], [d, d * q]] : [[0, 0]]).flat()}], [code, vo], {xMin: 0, xMax: max, yMin: 0, yMax: 3.3}));
    }
    case '23': {
      const n = b, threshold = k => (33 * k) / (10 * 2 ** n), q = threshold(1), max = 2 ** n - 1;
      // 3.3=33/10；整數分子與分母只除一次，避免 k*q 或 (k*q)/q 的多次捨入。
      let code = 0;
      for (let k = 1; k <= max && a >= threshold(k); k++) code = k;
      const edge = threshold(code), mid = threshold(code + .5), err = a - mid;
      return result([['碼 D', code, ''], ['DAC 下緣重建', edge, 'V'], ['中心重建', mid, 'V'], ['中心量化誤差', err, 'V']],
        [`q = (3.3 V)/${2 ** n} = ${fmt(q)} V；D = min(${max}, floor(Vin/q)) = ${code}`, `箱範圍：[${fmt(edge)}, ${fmt(threshold(code + 1))}${code === max ? ']' : ')'} V`, `e = Vin−(D+0.5)q = ${fmt(err)} V；q/2 = ${fmt(q / 2)} V`],
        '本課用下緣分箱：剛到內部邊界就進入下一碼，最上端3.3 V則截至最大碼。±q/2界線適用箱中心重建；用DAC下緣重建時是另一種誤差定義。',
        graph('輸入 Vin（V）', '輸出碼 D', [{name: '下緣分箱', points: [...Array.from({length: max + 1}, (_, d) => d ? [[threshold(d), d - 1], [threshold(d), d]] : [[0, 0]]).flat(), [3.3, max]]}], [a, code], {yMin: 0, yMax: max}));
    }
    default: throw new Error('未定義的章節模型：' + id);
  }
}

const SPECS = [{"id":"00","file":"00-circuit-bridge.html","title":"5 V 接上電阻，電流和熱從哪裡來？","params":[{"key":"a","id":"c00-a","type":"number","label":"電源 VS（V）","min":0,"max":12,"step":0.5,"default":5,"options":[]},{"key":"b","id":"c00-b","type":"number","label":"電阻 R（kΩ）","min":0.1,"max":10,"step":0.1,"default":1,"options":[]}],"presets":[{"a":5,"b":1},{"a":0,"b":1},{"a":9,"b":3}]},{"id":"01","file":"01-semiconductor.html","title":"摻入更多施體，少數電洞會剩多少？","params":[{"key":"a","id":"c01-a","type":"number","label":"施體濃度 ND 的10次方指數（cm⁻³）","min":14,"max":18,"step":1,"default":16,"options":[]},{"key":"b","id":"c01-b","type":"number","label":"電場 E（V/cm）","min":0,"max":100,"step":10,"default":10,"options":[]}],"presets":[{"a":16,"b":10},{"a":18,"b":0},{"a":15,"b":20}]},{"id":"02","file":"02-diode-models.html","title":"5 V 與 1 kΩ 串聯二極體，為何不是5 mA？","params":[{"key":"a","id":"c02-a","type":"number","label":"電源 VS（V）","min":0,"max":10,"step":0.1,"default":5,"options":[]},{"key":"b","id":"c02-b","type":"number","label":"串聯電阻 R（kΩ）","min":0.1,"max":5,"step":0.01,"default":1,"options":[]}],"presets":[{"a":5,"b":1},{"a":0.5,"b":1},{"a":3.3,"b":0.68}]},{"id":"03","file":"03-rectifier.html","title":"橋式整流後，電容要多久補一次電？","params":[{"key":"a","id":"c03-a","type":"number","label":"交流頻率 f（Hz）","min":20,"max":100,"step":10,"default":50,"options":[]},{"key":"b","id":"c03-b","type":"number","label":"濾波電容 C（μF）","min":100,"max":2200,"step":10,"default":1000,"options":[]}],"presets":[{"a":50,"b":1000},{"a":20,"b":100},{"a":60,"b":470}]},{"id":"04","file":"04-diode-tools.html","title":"超過 2 V 的訊號，如何限制在同一條線？","params":[{"key":"a","id":"c04-a","type":"number","label":"輸入正弦峰值 A（V）","min":0.5,"max":5,"step":0.5,"default":3,"options":[]},{"key":"b","id":"c04-b","type":"number","label":"理想限幅位準 L（V）","min":0.5,"max":4,"step":0.5,"default":2,"options":[]}],"presets":[{"a":3,"b":2},{"a":1,"b":2},{"a":4,"b":1.5}]},{"id":"05","file":"05-bjt-bias.html","title":"基極分壓 2.16 V，集極真的有 1.46 mA 嗎？","params":[{"key":"a","id":"c05-a","type":"number","label":"電流增益 β","min":50,"max":200,"step":10,"default":100,"options":[]},{"key":"b","id":"c05-b","type":"number","label":"集極電阻 RC（kΩ）","min":1,"max":10,"step":0.1,"default":3.3,"options":[]}],"presets":[{"a":100,"b":3.3},{"a":200,"b":10},{"a":50,"b":3.3}]},{"id":"06","file":"06-mos-bias.html","title":"閘極 2.5 V，汲極 1 V：該用哪條電流式？","params":[{"key":"a","id":"c06-a","type":"number","label":"VGS（V）","min":0,"max":4,"step":0.1,"default":2.5,"options":[]},{"key":"b","id":"c06-b","type":"number","label":"VDS（V）","min":0,"max":5,"step":0.1,"default":1,"options":[]}],"presets":[{"a":2.5,"b":1},{"a":0.8,"b":5},{"a":3,"b":3}]},{"id":"07","file":"07-cmos.html","title":"反相器不切換時省電，為何頻率加倍功耗也加倍？","params":[{"key":"a","id":"c07-a","type":"number","label":"負載電容 C（pF）","min":10,"max":100,"step":10,"default":20,"options":[]},{"key":"b","id":"c07-b","type":"number","label":"頻率 f（MHz）","min":0,"max":100,"step":10,"default":10,"options":[]}],"presets":[{"a":20,"b":10},{"a":100,"b":0},{"a":50,"b":20}]},{"id":"08","file":"08-small-signal.html","title":"1 mA 工作點旁的 5 mV，真的只增加 0.193 mA？","params":[{"key":"a","id":"c08-a","type":"number","label":"ICQ（mA）","min":0.1,"max":3,"step":0.1,"default":1,"options":[]},{"key":"b","id":"c08-b","type":"number","label":"vbe 增量（mV）","min":-10,"max":10,"step":1,"default":5,"options":[]}],"presets":[{"a":1,"b":5},{"a":1,"b":10},{"a":2,"b":2}]},{"id":"09","file":"09-single-stage.html","title":"射極加 100 Ω，為何增益從 −193 降到 −40？","params":[{"key":"a","id":"c09-a","type":"number","label":"退化電阻 RE（kΩ）","min":0,"max":1,"step":0.05,"default":0.1,"options":[]},{"key":"b","id":"c09-b","type":"number","label":"集極電阻 RC（kΩ）","min":1,"max":10,"step":0.5,"default":5,"options":[]}],"presets":[{"a":0.1,"b":5},{"a":0,"b":5},{"a":0.2,"b":3}]},{"id":"10","file":"10-frequency.html","title":"只有 2 pF 的跨接電容，怎麼變成 102 pF？","params":[{"key":"a","id":"c10-a","type":"number","label":"反相增益幅值 |Av|","min":1,"max":100,"step":1,"default":50,"options":[]},{"key":"b","id":"c10-b","type":"number","label":"跨接電容 Cμ（pF）","min":1,"max":10,"step":1,"default":2,"options":[]}],"presets":[{"a":50,"b":2},{"a":100,"b":10},{"a":20,"b":3}]},{"id":"11","file":"11-multistage-power.html","title":"兩級空載增益 −20、−5，接上負載怎麼只剩 40？","params":[{"key":"a","id":"c11-a","type":"number","label":"第二級輸入 Rin2（kΩ）","min":1,"max":100,"step":1,"default":10,"options":[]},{"key":"b","id":"c11-b","type":"number","label":"末級負載 RL（kΩ）","min":0.1,"max":10,"step":0.1,"default":4,"options":[]}],"presets":[{"a":10,"b":4},{"a":1,"b":0.1},{"a":40,"b":1}]},{"id":"12","file":"12-differential.html","title":"相差 10 mV，尾電流會怎麼分到兩邊？","params":[{"key":"a","id":"c12-a","type":"number","label":"尾電流 IT（mA）","min":0.2,"max":2,"step":0.2,"default":1,"options":[]},{"key":"b","id":"c12-b","type":"number","label":"差動電壓 vid（mV）","min":-100,"max":100,"step":5,"default":10,"options":[]}],"presets":[{"a":1,"b":10},{"a":1,"b":100},{"a":2,"b":5}]},{"id":"13","file":"13-current-mirror.html","title":"參考支路 0.86 mA，為何鏡出的電流略小？","params":[{"key":"a","id":"c13-a","type":"number","label":"參考電阻 R（kΩ）","min":1,"max":20,"step":0.5,"default":5,"options":[]},{"key":"b","id":"c13-b","type":"number","label":"輸出電壓 Vout（V）","min":0,"max":10,"step":0.5,"default":2,"options":[]}],"presets":[{"a":5,"b":2},{"a":5,"b":0.5},{"a":10,"b":3}]},{"id":"14","file":"14-feedback.html","title":"開迴路 1000 倍，回授後為何穩定接近 10 倍？","params":[{"key":"a","id":"c14-a","type":"number","label":"直流開迴路增益 A0","min":10,"max":10000,"step":10,"default":1000,"options":[]},{"key":"b","id":"c14-b","type":"number","label":"回授比例 βf","min":0.01,"max":0.1,"step":0.01,"default":0.1,"options":[]}],"presets":[{"a":1000,"b":0.1},{"a":10000,"b":0.1},{"a":100,"b":0.1}]},{"id":"15","file":"15-opamp.html","title":"0.1 V 感測訊號，怎麼用兩顆電阻放大到 1 V？","params":[{"key":"a","id":"c15-a","type":"number","label":"輸入 vin（V）","min":0,"max":1,"step":0.05,"default":0.1,"options":[]},{"key":"b","id":"c15-b","type":"number","label":"回授電阻 Rf（kΩ）","min":0,"max":100,"step":10,"default":90,"options":[]}],"presets":[{"a":0.1,"b":90},{"a":1,"b":100},{"a":0.2,"b":40}]},{"id":"16","file":"16-opamp-limits.html","title":"算出 1 V 輸出，為何高頻時卻跟不上？","params":[{"key":"a","id":"c16-a","type":"number","label":"閉迴路低頻增益 G","min":1,"max":100,"step":1,"default":10,"options":[]},{"key":"b","id":"c16-b","type":"number","label":"訊號頻率 f（kHz）","min":0.1,"max":200,"step":0.1,"default":10,"options":[]}],"presets":[{"a":10,"b":10},{"a":10,"b":150},{"a":20,"b":50}]},{"id":"17","file":"17-active-filter.html","title":"1 kHz 訊號通過主動低通後，還有多少振幅？","params":[{"key":"a","id":"c17-a","type":"number","label":"輸入頻率 f（Hz）","min":100,"max":100000,"step":100,"default":1000,"options":[]},{"key":"b","id":"c17-b","type":"number","label":"濾波電阻 R（kΩ）","min":1,"max":100,"step":1,"default":10,"options":[]}],"presets":[{"a":1000,"b":10},{"a":100000,"b":10},{"a":2000,"b":5}]},{"id":"18","file":"18-comparator.html","title":"訊號在門檻附近抖動，為何加兩個門檻就安定？","params":[{"key":"a","id":"c18-a","type":"number","label":"輸入 vin（V）","min":0,"max":5,"step":0.1,"default":3.2,"options":[]},{"key":"b","id":"c18-b","type":"number","label":"正回授比例 βf","min":0.1,"max":0.4,"step":0.1,"default":0.2,"options":[]},{"key":"c","id":"c18-c","type":"select","label":"訊號掃描方向","min":null,"max":null,"step":null,"default":"rising","options":[{"value":"rising","label":"從0 V上升"},{"value":"falling","label":"從5 V下降"}]}],"presets":[{"a":3.2,"b":0.2,"c":"rising"},{"a":2.5,"b":0.2,"c":"falling"},{"a":3,"b":0.4,"c":"rising"}]},{"id":"19","file":"19-oscillator.html","title":"10 kΩ 與 10 nF 的 Wien 橋，為何選出 1.59 kHz？","params":[{"key":"a","id":"c19-a","type":"number","label":"相等電阻 R（kΩ）","min":1,"max":100,"step":1,"default":10,"options":[]},{"key":"b","id":"c19-b","type":"number","label":"相等電容 C（nF）","min":1,"max":100,"step":1,"default":10,"options":[]},{"key":"c","id":"c19-c","type":"number","label":"放大器增益 A","min":2.8,"max":3.2,"step":0.05,"default":3.05,"options":[]}],"presets":[{"a":10,"b":10,"c":3.05},{"a":10,"b":10,"c":3},{"a":20,"b":10,"c":2.95}]},{"id":"20","file":"20-linear-power.html","title":"5 V 降成 3.3 V，少掉的功率去哪裡？","params":[{"key":"a","id":"c20-a","type":"number","label":"輸入 Vin（V）","min":3,"max":12,"step":0.5,"default":5,"options":[]},{"key":"b","id":"c20-b","type":"number","label":"負載電流 Iout（A）","min":0,"max":1,"step":0.1,"default":0.2,"options":[]}],"presets":[{"a":5,"b":0.2},{"a":3,"b":0.2},{"a":9,"b":0.3}]},{"id":"21","file":"21-switching-power.html","title":"12 V 以 40% 時間接通，為何平均是 4.8 V？","params":[{"key":"a","id":"c21-a","type":"number","label":"輸入 Vin（V）","min":5,"max":24,"step":1,"default":12,"options":[]},{"key":"b","id":"c21-b","type":"number","label":"導通占空比 D","min":0.1,"max":0.9,"step":0.1,"default":0.4,"options":[]}],"presets":[{"a":12,"b":0.4},{"a":5,"b":0.1},{"a":20,"b":0.5}]},{"id":"22","file":"22-dac.html","title":"4 位元碼 1001，能輸出剛好 3.3 V 嗎？","params":[{"key":"a","id":"c22-a","type":"select","label":"解析度 N（bit）","min":null,"max":null,"step":null,"default":4,"options":[{"value":2,"label":"2 bit"},{"value":4,"label":"4 bit"},{"value":8,"label":"8 bit"}]},{"key":"b","id":"c22-b","type":"number","label":"輸入十進位碼 D","min":0,"max":255,"step":1,"default":9,"options":[]}],"presets":[{"a":4,"b":9},{"a":4,"b":15},{"a":8,"b":128}]},{"id":"23","file":"23-adc.html","title":"1.9 V 進入 4 位元 ADC，為何只得到碼 9？","params":[{"key":"a","id":"c23-a","type":"number","label":"輸入 Vin（V）","min":0,"max":3.3,"step":0.05,"default":1.9,"options":[]},{"key":"b","id":"c23-b","type":"select","label":"解析度 N（bit）","min":null,"max":null,"step":null,"default":4,"options":[{"value":2,"label":"2 bit"},{"value":4,"label":"4 bit"},{"value":8,"label":"8 bit"}]}],"presets":[{"a":1.9,"b":4},{"a":3.3,"b":4},{"a":1.65,"b":8}]}];

function svgElement(tag, attrs = {}, content = '') {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (content) node.textContent = content;
  return node;
}
function renderGraph(svg, data, valid) {
  if (!svg) return;
  svg.replaceChildren();
  svg.append(svgElement('title', {}, `${data.yLabel} 隨 ${data.xLabel} 改變`));
  svg.append(svgElement('desc', {}, `曲線：${data.curves.map(x => x.name).join('、')}。圓點為目前輸入；精確數值與有效條件在上方文字。`));
  const all = data.curves.flatMap(c => c.points).filter(p => p.every(Number.isFinite));
  if (data.marker?.every(Number.isFinite)) all.push(data.marker);
  let xmin = data.xMin ?? Math.min(...all.map(p => p[0]));
  let xmax = data.xMax ?? Math.max(...all.map(p => p[0]));
  let ymin = data.yMin ?? Math.min(0, ...all.map(p => p[1]));
  let ymax = data.yMax ?? Math.max(0, ...all.map(p => p[1]));
  if (xmin === xmax) xmax = xmin + 1;
  if (ymin === ymax) ymax = ymin + 1;
  const pad = (ymax - ymin) * .08;
  if (data.yMin == null && ymin < 0) ymin -= pad;
  if (data.yMax == null) ymax += pad;
  const fx = data.xLog ? x => (Math.log(x) - Math.log(xmin)) / Math.log(xmax / xmin) : x => (x - xmin) / (xmax - xmin);
  const px = x => 82 + fx(x) * 610, py = y => 252 - (y - ymin) / (ymax - ymin) * 200;
  const add = (tag, attrs, content) => {const n = svgElement(tag, attrs, content); svg.append(n); return n;};
  add('text', {x: 82, y: 22, class: 'plot-title'}, data.yLabel);
  add('text', {x: 692, y: 309, 'text-anchor': 'end'}, data.xLabel);
  for (let i = 0; i <= 4; i++) {
    const x = data.xLog ? xmin * (xmax / xmin) ** (i / 4) : xmin + (xmax - xmin) * i / 4;
    const y = ymin + (ymax - ymin) * i / 4;
    add('path', {d: `M82 ${py(y)}H692`, class: 'grid-line'});
    add('text', {x: 73, y: py(y) + 5, 'text-anchor': 'end'}, fmt(y, 3));
    add('path', {d: `M${px(x)} 252v5`, class: 'wire'});
    add('text', {x: px(x), y: 280, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}, fmt(x, 3));
  }
  add('path', {d: 'M82 48V252H692', class: 'wire', fill: 'none'});
  if (ymin < 0 && ymax > 0) add('path', {d: `M82 ${py(0)}H692`, class: 'zero-line'});
  const verticalLabels = [];
  (data.vertical || []).forEach(v => {
    if (v.x < xmin || v.x > xmax) return;
    add('path', {d: `M${px(v.x)} 48V252`, class: 'reference-line'});
    verticalLabels.push({x: clamp(px(v.x) + 5, 85, 565), y: 94, label: v.label});
  });
  (data.horizontal || []).forEach(v => {
    add('path', {d: `M82 ${py(v.y)}H692`, class: 'reference-line'});
    add('text', {x: 90, y: py(v.y) < 85 ? py(v.y) + 22 : py(v.y) - 7}, v.label);
  });
  data.curves.forEach((c, i) => {
    const points = c.points.filter(p => p.every(Number.isFinite));
    const d = points.map((p, j) => `${j ? 'L' : 'M'}${px(p[0]).toFixed(3)},${py(p[1]).toFixed(3)}`).join(' ');
    add('path', {d, class: `plot-curve curve-${i % 3}`, fill: 'none'});
    add('path', {d: `M${85 + i * 230} 34h24`, class: `plot-curve curve-${i % 3}`});
    add('text', {x: 115 + i * 230, y: 39, class: 'plot-legend'}, c.name);
  });
  verticalLabels.forEach(v => {
    const label = add('text', {x: v.x, y: v.y}, v.label);
    const box = label.getBBox();
    const background = add('rect', {x: box.x - 3, y: box.y - 2, width: box.width + 6, height: box.height + 4, rx: 3, fill: 'var(--diagram-bg)'});
    svg.insertBefore(background, label);
  });
  if (data.marker?.every(Number.isFinite)) {
    const [x, y] = data.marker;
    add('circle', {cx: px(x), cy: py(y), r: 6, class: valid ? 'plot-point' : 'plot-point invalid'});
  }
}
function renderOutput(target, data, warning) {
  if (!target) return;
  target.replaceChildren();
  const metrics = document.createElement('div'); metrics.className = 'metric-grid';
  for (const [label, value, unit] of data.metrics) {
    const box = document.createElement('div'); box.className = 'metric';
    const name = document.createElement('span'); name.textContent = label;
    const val = document.createElement('strong'); val.textContent = `${value == null ? '不適用' : fmt(value)} ${unit}`.trim();
    box.append(name, val); metrics.append(box);
  }
  target.append(metrics);
  data.steps.forEach(line => {const p = document.createElement('p'); p.className = 'live-step'; p.textContent = line; target.append(p);});
  const why = document.createElement('p'); why.className = data.valid ? 'why' : 'why model-warning'; why.textContent = data.why; target.append(why);
  if (warning) {const p = document.createElement('p'); p.className = 'input-note'; p.textContent = warning; target.append(p);}
}
function startPage() {
  document.querySelectorAll('[data-model]').forEach(workspace => {
    const id = workspace.dataset.model, spec = SPECS.find(s => s.id === id);
    if (!spec) return;
    const controls = spec.params.map(def => ({def, node: document.getElementById(def.id)}));
    if (controls.some(x => !x.node)) return;
    controls.forEach(({def, node}) => {
      if (def.type === 'number') {node.min = def.min; node.max = def.max; node.step = def.step;}
    });
    const update = (normalise = false) => {
      const state = {}, notes = [];
      controls.forEach(({def, node}) => {
        if (def.type === 'select') {
          const allowed = def.options.map(o => String(o.value));
          state[def.key] = allowed.includes(node.value) ? node.value : String(def.default);
          if (normalise) node.value = state[def.key];
        } else {
          const raw = node.value.trim(), n = Number(raw);
          let value = raw && Number.isFinite(n) ? n : def.default;
          if (!raw || !Number.isFinite(n)) notes.push(`${def.label} 暫以預設 ${def.default} 計算。`);
          const bounded = clamp(value, def.min, def.max);
          if (bounded !== value) notes.push(`${def.label} 已按範圍 ${def.min}–${def.max} 限制計算。`);
          value = bounded;
          const snapped = clamp(Number((def.min + Math.round((value - def.min) / def.step) * def.step).toPrecision(12)), def.min, def.max);
          if (Math.abs(snapped - value) > Math.max(1e-10, def.step * 1e-8)) {
            notes.push(`${def.label} 依步階 ${def.step} 取為 ${fmt(snapped)}。`);
            value = snapped;
          }
          if (id === '22' && def.key === 'b') value = Math.round(value);
          state[def.key] = value;
          if (normalise) node.value = String(value);
        }
      });
      if (id === '22') {
        const max = 2 ** Number(state.a) - 1, codeInput = document.getElementById('c22-b');
        if (state.b > max) notes.push(`N=${state.a} 的最大碼為 ${max}，已限制輸入碼。`);
        state.b = clamp(Math.round(state.b), 0, max); codeInput.max = max; codeInput.value = state.b;
      }
      const data = calculate(id, state);
      renderOutput(document.getElementById(`c${id}-output`), data, notes.join(' '));
      const primaryPlot = document.getElementById(`c${id}-plot`);
      renderGraph(primaryPlot, data.plot, data.valid);
      if (id === '14' && primaryPlot) {
        let magnitude = document.getElementById('c14-magnitude');
        if (!magnitude) {magnitude = svgElement('svg', {id:'c14-magnitude',viewBox:'0 0 720 320',role:'img','aria-label':'迴路增益幅值與零分貝交越'}); primaryPlot.before(magnitude);}
        const fp = feedbackPoint(Number(state.a), Number(state.b));
        const l0 = Number(state.a) * Number(state.b);
        const db = x => 20 * Math.log10(l0 / Math.sqrt((1+(x/100)**2)*(1+(x/10000)**2)));
        renderGraph(magnitude, graph('頻率（Hz，對數）','迴路增益（dB）',[curve('20 log₁₀ |L|',db,1,1e6,180,true)],fp.pm===null?null:[fp.fc,0],{xLog:true,horizontal:[{y:0,label:'|L|=1 → 0 dB'}]}),true);
      }
    };
    controls.forEach(({node}) => {node.addEventListener('input', () => update(false)); node.addEventListener('change', () => update(true));});
    function setState(state) {controls.forEach(({def, node}) => {node.value = String(state[def.key] ?? def.default);}); update(true);}
    workspace.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => setState(spec.presets[Number(button.dataset.preset)] || spec.presets[0])));
    workspace.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => setState(spec.presets[0])));
    update(false);
  });
  const search = document.getElementById('dictionary-search');
  if (search) search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase(); let count = 0;
    document.querySelectorAll('.term-card').forEach(card => {const show = card.textContent.toLocaleLowerCase().includes(query); card.hidden = !show; if (show) count++;});
    const status = document.getElementById('dictionary-status'); if (status) status.textContent = `顯示 ${count} 個名詞；清空可還原全部。`;
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPage); else startPage();
}
if (typeof module !== 'undefined') module.exports = {calculate, SPECS, feedbackPoint, diodeExponential};

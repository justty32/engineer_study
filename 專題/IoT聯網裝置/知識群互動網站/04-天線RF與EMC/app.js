(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else if (root) {
    root.IotRfAntennaLogic = api;
    if (root.document && typeof api.init === "function") api.init(root.document, root);
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var C = 299792458;
  var MODULE_KEYS = ["wave-region", "link-budget", "impedance-match", "rf-layout", "antenna-choice", "detuning", "edge-emi", "compliance"];
  var STORAGE_KEY = "engineerStudy.iotRfAntenna.v1";
  var DEFAULTS = {
    "wave-region": { "wave-frequency-mhz": 2400, "wave-epsilon-eff": 4, "wave-trace-mm": 50, "wave-size-mm": 80, "wave-distance-mm": 1000 },
    "link-budget": { "link-tx-dbm": 10, "link-tx-gain-dbi": 2, "link-rx-gain-dbi": 2, "link-loss-db": 2, "link-frequency-mhz": 2400, "link-distance-km": 0.1, "link-sensitivity-dbm": -95, "link-required-margin-db": 10 },
    "impedance-match": { "match-z0": 50, "match-r": 75, "match-x": 0 },
    "rf-layout": { "layout-case": "pcb", "layout-impedance": true, "layout-ground": true, "layout-short": true, "layout-vias": true, "layout-pi": false, "layout-keepout": false, "layout-guideline": false },
    "antenna-choice": { "antenna-enclosure": "plastic", "antenna-space": "tiny", "antenna-cert": "reuse", "antenna-tuning": "limited", "antenna-cost": "low" },
    detuning: { "detune-frequency-mhz": 2400, "detune-epsilon-before": 2.5, "detune-epsilon-after": 3.2, "detune-bandwidth-mhz": 100 },
    "edge-emi": { "edge-rise-ns": 2, "edge-epsilon-eff": 3.5, "edge-trace-mm": 80 },
    compliance: { "compliance-case": "same-integration", "compliance-near-body": "no", "compliance-market": true, "compliance-module-scope": true, "compliance-antenna-list": true, "compliance-rf-prescan": false, "compliance-emc-prescan": false, "compliance-sar": false, "compliance-docs": false }
  };
  var OUTPUTS = {
    "wave-region": ["wave-free-wavelength", "wave-guided-wavelength", "wave-phase", "wave-far-boundary", "wave-region-verdict", "wave-status", "wave-feedback"],
    "link-budget": ["link-fspl", "link-received", "link-margin", "link-headroom", "link-status", "link-feedback"],
    "impedance-match": ["match-gamma", "match-return-loss", "match-vswr", "match-reflected-power", "match-loss", "match-status", "match-feedback"],
    "rf-layout": ["layout-first", "layout-second", "layout-count", "layout-blocker", "layout-status", "layout-feedback"],
    "antenna-choice": ["antenna-verdict", "antenna-runner-up", "antenna-tradeoff", "antenna-status", "antenna-feedback"],
    detuning: ["detune-new-frequency", "detune-shift-mhz", "detune-shift-percent", "detune-band-edge", "detune-status", "detune-feedback"],
    "edge-emi": ["edge-knee-frequency", "edge-guided-wavelength", "edge-critical-length", "edge-length-ratio", "edge-verdict", "edge-status", "edge-feedback"],
    compliance: ["compliance-first", "compliance-second", "compliance-count", "compliance-blocker", "compliance-status", "compliance-feedback"]
  };
  var STATUS_IDS = {
    "wave-region": "wave-status", "link-budget": "link-status", "impedance-match": "match-status",
    "rf-layout": "layout-status", "antenna-choice": "antenna-status", detuning: "detune-status",
    "edge-emi": "edge-status", compliance: "compliance-status"
  };
  var FEEDBACK_IDS = {
    "wave-region": "wave-feedback", "link-budget": "link-feedback", "impedance-match": "match-feedback",
    "rf-layout": "layout-feedback", "antenna-choice": "antenna-feedback", detuning: "detune-feedback",
    "edge-emi": "edge-feedback", compliance: "compliance-feedback"
  };

  function finite(value) { return typeof value === "number" && Number.isFinite(value); }
  function finiteResult(result) {
    Object.keys(result || {}).forEach(function (key) {
      if (typeof result[key] === "number" && !finite(result[key])) throw new Error("計算結果不是有限數值");
    });
    return result;
  }
  function number(values, id, label, rule) {
    if (!values || values[id] === undefined || values[id] === null || String(values[id]).trim() === "") throw new Error(label + "不可為空白");
    var value = Number(values[id]);
    if (!finite(value)) throw new Error(label + "必須是有限數值");
    if (rule === "positive" && value <= 0) throw new Error(label + "必須大於 0");
    if (rule === "nonnegative" && value < 0) throw new Error(label + "不可小於 0");
    return value;
  }
  function choice(values, id, label, allowed) {
    var value = values && values[id];
    if (allowed.indexOf(value) < 0) throw new Error(label + "選項無效");
    return value;
  }

  function calculateWaveRegion(values) {
    var frequency = number(values, "wave-frequency-mhz", "頻率", "positive");
    var epsilon = number(values, "wave-epsilon-eff", "有效介電常數", "positive");
    var trace = number(values, "wave-trace-mm", "走線長度", "nonnegative");
    var size = number(values, "wave-size-mm", "最大尺寸", "nonnegative");
    var distance = number(values, "wave-distance-mm", "觀測距離", "nonnegative");
    var freeWavelength = C / (frequency * 1000);
    var guidedWavelength = freeWavelength / Math.sqrt(epsilon);
    var phase = 360 * trace / guidedWavelength;
    var farBoundary = 2 * size * size / freeWavelength;
    var far = distance >= farBoundary;
    return finiteResult({ frequency: frequency, epsilon: epsilon, trace: trace, size: size, distance: distance, freeWavelength: freeWavelength, guidedWavelength: guidedWavelength, phase: phase, farBoundary: farBoundary, far: far, verdict: far ? "遠場" : "近場／過渡區", status: far ? "ok" : "warn" });
  }

  function calculateLinkBudget(values) {
    var tx = number(values, "link-tx-dbm", "發射功率", "finite");
    var txGain = number(values, "link-tx-gain-dbi", "發射天線增益", "finite");
    var rxGain = number(values, "link-rx-gain-dbi", "接收天線增益", "finite");
    var loss = number(values, "link-loss-db", "損耗", "nonnegative");
    var frequency = number(values, "link-frequency-mhz", "頻率", "positive");
    var distance = number(values, "link-distance-km", "距離", "positive");
    var sensitivity = number(values, "link-sensitivity-dbm", "接收靈敏度", "finite");
    var required = number(values, "link-required-margin-db", "需求餘裕", "nonnegative");
    var fspl = 32.44 + 20 * Math.log10(frequency) + 20 * Math.log10(distance);
    var received = tx + txGain + rxGain - loss - fspl;
    var margin = received - sensitivity;
    var headroom = margin - required;
    var status = headroom < 0 ? "error" : headroom <= 3 ? "warn" : "ok";
    return finiteResult({ tx: tx, txGain: txGain, rxGain: rxGain, loss: loss, frequency: frequency, distance: distance, sensitivity: sensitivity, requiredMargin: required, fspl: fspl, received: received, margin: margin, headroom: headroom, blocked: headroom < 0, warning: headroom >= 0 && headroom <= 3, status: status });
  }

  function calculateImpedanceMatch(values) {
    var z0 = number(values, "match-z0", "參考阻抗 Z0", "positive");
    var r = number(values, "match-r", "負載電阻 R", "nonnegative");
    var x = number(values, "match-x", "負載電抗 X", "finite");
    var real = r - z0;
    var imag = x;
    var denominator = Math.sqrt(Math.pow(r + z0, 2) + Math.pow(x, 2));
    var gamma = Math.sqrt(real * real + imag * imag) / denominator;
    var perfect = gamma === 0;
    var fullReflection = gamma === 1;
    var returnLoss = perfect ? null : -20 * Math.log10(gamma);
    var vswr = fullReflection ? null : (1 + gamma) / (1 - gamma);
    var reflectedPower = gamma * gamma;
    var mismatchLoss = fullReflection ? null : -10 * Math.log10(1 - reflectedPower);
    var status = fullReflection || (vswr !== null && vswr > 3) ? "error" : vswr !== null && vswr > 2 ? "warn" : "ok";
    return finiteResult({ z0: z0, r: r, x: x, gamma: gamma, returnLoss: returnLoss, vswr: vswr, reflectedPower: reflectedPower, mismatchLoss: mismatchLoss, perfectMatch: perfect, completeReflection: fullReflection, infiniteReturnLoss: perfect, infiniteVswr: fullReflection, infiniteLoss: fullReflection, blocked: status === "error", warning: status === "warn", status: status });
  }

  var LAYOUT_LABELS = {
    "layout-impedance": "controlled impedance", "layout-ground": "continuous ground", "layout-short": "short/no stub", "layout-vias": "ground vias/connector launch", "layout-pi": "π match", "layout-keepout": "antenna keep-out", "layout-guideline": "vendor/module guideline"
  };
  var LAYOUT_ORDER = Object.keys(LAYOUT_LABELS);
  function checkMap(checks, id) { return checks && checks[id] === true; }
  function calculateRfLayout(values, checks) {
    var situation = choice(values, "layout-case", "layout 情境", ["pcb", "chip", "external"]);
    var count = LAYOUT_ORDER.filter(function (id) { return checkMap(checks, id); }).length;
    var required = situation === "external" ? LAYOUT_ORDER.filter(function (id) { return id !== "layout-keepout"; }) : LAYOUT_ORDER.slice();
    var missing = required.filter(function (id) { return !checkMap(checks, id); });
    var first = missing.length ? LAYOUT_LABELS[missing[0]] : "所有必要 gate 已完成";
    var second = missing.length > 1 ? LAYOUT_LABELS[missing[1]] : "無";
    return finiteResult({ situation: situation, count: count, total: LAYOUT_ORDER.length, required: required.length, first: first, second: second, blocker: missing.length ? first : "無必要缺口", missing: missing, complete: missing.length === 0, blocked: missing.length !== 0, status: missing.length ? "error" : "ok" });
  }

  function calculateAntennaChoice(values) {
    var enclosure = choice(values, "antenna-enclosure", "外殼", ["plastic", "metal"]);
    var space = choice(values, "antenna-space", "空間", ["tiny", "roomy"]);
    var cert = choice(values, "antenna-cert", "認證", ["reuse", "custom"]);
    var tuning = choice(values, "antenna-tuning", "調諧", ["limited", "vna"]);
    var cost = choice(values, "antenna-cost", "成本", ["low", "flexible"]);
    var verdict;
    if (enclosure === "metal") verdict = "認證清單內的外接天線";
    else if (cert === "reuse" && tuning === "limited") verdict = "認證清單內的外接天線";
    else if (space === "tiny" && tuning === "vna") verdict = "晶片天線";
    else if (space === "roomy" && tuning === "vna" && cost === "low") verdict = "PCB 天線";
    else if (tuning === "limited") verdict = "外接天線";
    else if (space === "tiny") verdict = "晶片天線";
    else verdict = "PCB 天線";
    var runnerUp = verdict === "PCB 天線" ? "晶片天線" : verdict === "晶片天線" ? "PCB 天線" : "晶片天線";
    return { enclosure: enclosure, space: space, cert: cert, tuning: tuning, cost: cost, verdict: verdict, runnerUp: runnerUp, tradeoff: verdict === "認證清單內的外接天線" ? "優先保留認證清單與有限調諧能力，代價是外接連接器、線纜、成本與機構空間。" : verdict === "晶片天線" ? "以小體積換取對 keep-out、匹配、板材與機構環境的敏感度；需要 VNA 調諧。" : verdict === "PCB 天線" ? "以低元件成本換取板面、keep-out、調諧與重板風險；需要依疊層實測。" : "以較穩定的機構整合換取連接器、線纜與成本代價。", status: "初篩", blocked: false };
  }

  function calculateDetuning(values) {
    var frequency = number(values, "detune-frequency-mhz", "原始頻率", "positive");
    var before = number(values, "detune-epsilon-before", "變化前介電常數", "positive");
    var after = number(values, "detune-epsilon-after", "變化後介電常數", "positive");
    var bandwidth = number(values, "detune-bandwidth-mhz", "頻寬", "positive");
    var newFrequency = frequency * Math.sqrt(before / after);
    var shift = newFrequency - frequency;
    var shiftPercent = shift / frequency * 100;
    var lower = frequency - bandwidth / 2;
    var upper = frequency + bandwidth / 2;
    var inBand = newFrequency >= lower && newFrequency <= upper;
    return finiteResult({ frequency: frequency, epsilonBefore: before, epsilonAfter: after, bandwidth: bandwidth, newFrequency: newFrequency, shift: shift, shiftPercent: shiftPercent, bandLow: lower, bandHigh: upper, bandEdge: { lower: lower, upper: upper }, inBand: inBand, blocked: !inBand, status: inBand ? "ok" : "error" });
  }

  function calculateEdgeEmi(values) {
    var rise = number(values, "edge-rise-ns", "上升時間", "positive");
    var epsilon = number(values, "edge-epsilon-eff", "有效介電常數", "positive");
    var trace = number(values, "edge-trace-mm", "走線長度", "nonnegative");
    var knee = 0.5 / (rise * 1e-9) / 1e6;
    var guided = C / (knee * 1e6 * Math.sqrt(epsilon)) * 1000;
    var critical = guided / 10;
    var ratio = trace / critical;
    var status = ratio >= 2 ? "error" : ratio >= 1 ? "warn" : "ok";
    return finiteResult({ rise: rise, epsilon: epsilon, trace: trace, kneeFrequency: knee, guidedWavelength: guided, criticalLength: critical, lengthRatio: ratio, ratio: ratio, blocked: status === "error", warning: status === "warn", verdict: ratio >= 2 ? "需進行傳輸線／EMI 分析" : ratio >= 1 ? "需以傳輸線／回流觀點處理" : "可先用集中參數直覺估算", status: status });
  }

  var COMPLIANCE_LABELS = { "compliance-market": "market", "compliance-module-scope": "module scope", "compliance-antenna-list": "antenna list", "compliance-rf-prescan": "RF prescan", "compliance-emc-prescan": "EMC prescan", "compliance-sar": "SAR／暴露評估", "compliance-docs": "文件／標示" };
  var COMPLIANCE_ORDER = Object.keys(COMPLIANCE_LABELS);
  function calculateCompliance(values, checks) {
    var situation = choice(values, "compliance-case", "法規情境", ["same-integration", "antenna-change", "enclosure-change", "new-market"]);
    var nearBody = choice(values, "compliance-near-body", "近人體", ["no", "yes"]);
    var required = ["compliance-market", "compliance-module-scope", "compliance-antenna-list", "compliance-emc-prescan", "compliance-docs"];
    if (situation !== "same-integration") required.splice(3, 0, "compliance-rf-prescan");
    if (nearBody === "yes") required.splice(required.indexOf("compliance-docs"), 0, "compliance-sar");
    var count = COMPLIANCE_ORDER.filter(function (id) { return checkMap(checks, id); }).length;
    var missing = required.filter(function (id) { return !checkMap(checks, id); });
    var first = missing.length ? COMPLIANCE_LABELS[missing[0]] : "所有必要 gate 已完成";
    var second = missing.length > 1 ? COMPLIANCE_LABELS[missing[1]] : "無";
    return finiteResult({ situation: situation, nearBody: nearBody, count: count, total: COMPLIANCE_ORDER.length, required: required.length, first: first, second: second, blocker: missing.length ? first : "無必要缺口", missing: missing, complete: missing.length === 0, blocked: missing.length !== 0, status: missing.length ? "error" : "ok" });
  }

  function get(doc, id) { return doc && typeof doc.getElementById === "function" ? doc.getElementById(id) : null; }
  function all(doc, selector) { return doc && typeof doc.querySelectorAll === "function" ? Array.prototype.slice.call(doc.querySelectorAll(selector)) : []; }
  function setText(doc, id, value) { var element = get(doc, id); if (element) element.textContent = String(value); }
  function state(doc, id, value, name) {
    var element = get(doc, id); if (!element) return;
    element.textContent = String(value);
    if (element.classList) { ["status-ok", "status-warn", "status-error", "status-neutral"].forEach(function (x) { element.classList.remove(x); }); element.classList.add("status-" + name); }
    if (element.dataset) element.dataset.state = name;
    if (element.setAttribute) { element.setAttribute("role", "status"); element.setAttribute("aria-live", "polite"); }
  }
  function format(value, digits, unit) { return value === null ? "∞" : finite(value) ? value.toFixed(digits) + (unit ? " " + unit : "") : "—"; }
  function clearModule(doc, key, message) {
    var detail = message || "輸入錯誤";
    (OUTPUTS[key] || []).forEach(function (id) { setText(doc, id, "—"); });
    state(doc, STATUS_IDS[key], detail, "error");
    state(doc, FEEDBACK_IDS[key], "輸入或計算無效：「" + detail + "」。請修正後再判讀結果。", "error");
  }
  function read(doc, ids) { var values = {}; for (var i = 0; i < ids.length; i += 1) { var input = get(doc, ids[i]); if (!input || String(input.value).trim() === "") return { ok: false, error: ids[i] + "不可為空白" }; var value = Number(input.value); if (!finite(value)) return { ok: false, error: ids[i] + "必須是有限數值" }; values[ids[i]] = value; } return { ok: true, value: values }; }
  function selects(doc, ids) { var values = {}; for (var i = 0; i < ids.length; i += 1) { var input = get(doc, ids[i]); if (!input || !String(input.value).trim()) return { ok: false, error: ids[i] + "選項無效" }; values[ids[i]] = input.value; } return { ok: true, value: values }; }
  function checks(doc, selector) { var values = {}; all(doc, selector).forEach(function (input) { if (input.id) values[input.id] = input.checked === true; }); return values; }
  function run(doc, key) {
    var numeric = { "wave-region": ["wave-frequency-mhz", "wave-epsilon-eff", "wave-trace-mm", "wave-size-mm", "wave-distance-mm"], "link-budget": ["link-tx-dbm", "link-tx-gain-dbi", "link-rx-gain-dbi", "link-loss-db", "link-frequency-mhz", "link-distance-km", "link-sensitivity-dbm", "link-required-margin-db"], "impedance-match": ["match-z0", "match-r", "match-x"], detuning: ["detune-frequency-mhz", "detune-epsilon-before", "detune-epsilon-after", "detune-bandwidth-mhz"], "edge-emi": ["edge-rise-ns", "edge-epsilon-eff", "edge-trace-mm"] };
    var selectIds = { "rf-layout": ["layout-case"], "antenna-choice": ["antenna-enclosure", "antenna-space", "antenna-cert", "antenna-tuning", "antenna-cost"], compliance: ["compliance-case", "compliance-near-body"] };
    var input = numeric[key] ? read(doc, numeric[key]) : selects(doc, selectIds[key] || []);
    var result;
    try {
      if (!input.ok) throw new Error(input.error);
      if (key === "wave-region") result = calculateWaveRegion(input.value);
      if (key === "link-budget") result = calculateLinkBudget(input.value);
      if (key === "impedance-match") result = calculateImpedanceMatch(input.value);
      if (key === "rf-layout") result = calculateRfLayout(input.value, checks(doc, "[data-layout-check]"));
      if (key === "antenna-choice") result = calculateAntennaChoice(input.value);
      if (key === "detuning") result = calculateDetuning(input.value);
      if (key === "edge-emi") result = calculateEdgeEmi(input.value);
      if (key === "compliance") result = calculateCompliance(input.value, checks(doc, "[data-compliance-check]"));
    } catch (error) { clearModule(doc, key, error.message); return; }
    if (key === "wave-region") { setText(doc, "wave-free-wavelength", format(result.freeWavelength, 2, "mm")); setText(doc, "wave-guided-wavelength", format(result.guidedWavelength, 2, "mm")); setText(doc, "wave-phase", format(result.phase, 1, "°")); setText(doc, "wave-far-boundary", format(result.farBoundary, 2, "mm")); setText(doc, "wave-region-verdict", result.verdict); state(doc, "wave-status", result.far ? "遠場粗分區域" : "近場／過渡區警告", result.status); state(doc, "wave-feedback", "有效介電常數會縮短導波波長；遠場公式只用最大尺寸 D 粗分區域，不代表量測場地符合標準。", result.status); }
    if (key === "link-budget") { setText(doc, "link-fspl", format(result.fspl, 2, "dB")); setText(doc, "link-received", format(result.received, 2, "dBm")); setText(doc, "link-margin", format(result.margin, 2, "dB")); setText(doc, "link-headroom", format(result.headroom, 2, "dB")); state(doc, "link-status", result.blocked ? "鏈路預算不足" : result.warning ? "餘裕偏低" : "教學預算通過", result.status); state(doc, "link-feedback", (result.blocked ? "鏈路預算不足；" : result.warning ? "餘裕偏低；" : "目前有足夠 headroom，但") + "Friis 模型不含多徑、遮蔽、干擾、封包重送與實際天線效率。", result.status); }
    if (key === "impedance-match") { setText(doc, "match-gamma", format(result.gamma, 3, "")); setText(doc, "match-return-loss", format(result.returnLoss, 2, "dB")); setText(doc, "match-vswr", format(result.vswr, 2, "")); setText(doc, "match-reflected-power", format(result.reflectedPower * 100, 2, "%")); setText(doc, "match-loss", format(result.mismatchLoss, 2, "dB")); state(doc, "match-status", result.perfectMatch ? "完美匹配模型" : result.completeReflection ? "完全反射阻擋" : result.status === "error" ? "VSWR 阻擋" : result.status === "warn" ? "VSWR 警告" : "匹配通過", result.status); state(doc, "match-feedback", "良好 S11／低失配不等於高輻射效率；仍需確認天線效率、頻寬、方向圖與整機安裝。", result.status); }
    if (key === "rf-layout") { setText(doc, "layout-first", result.first); setText(doc, "layout-second", result.second); setText(doc, "layout-count", result.count + " / " + result.total); setText(doc, "layout-blocker", result.blocker); state(doc, "layout-status", result.complete ? "layout gate 通過" : "layout gate 阻擋", result.status); state(doc, "layout-feedback", result.complete ? "必要 gate 已閉合；線寬、間距與 via 仍須依板廠疊層及模組 guideline 驗證。" : "第一缺口為「" + result.blocker + "」；不能用後項勾選抵銷，實際幾何仍需依板廠與模組規範確認。", result.status); }
    if (key === "antenna-choice") { setText(doc, "antenna-verdict", result.verdict); setText(doc, "antenna-runner-up", result.runnerUp); setText(doc, "antenna-tradeoff", result.tradeoff); state(doc, "antenna-status", "初篩結果", "warn"); state(doc, "antenna-feedback", "所有結果只是初篩；仍須核對頻段、效率、機構、線纜損耗、天線清單與實測。", "warn"); }
    if (key === "detuning") { setText(doc, "detune-new-frequency", format(result.newFrequency, 2, "MHz")); setText(doc, "detune-shift-mhz", format(result.shift, 2, "MHz")); setText(doc, "detune-shift-percent", format(result.shiftPercent, 2, "%")); setText(doc, "detune-band-edge", format(result.bandLow, 2, "–") + " " + format(result.bandHigh, 2, "MHz")); state(doc, "detune-status", result.inBand ? "仍在原頻帶內" : "落在原頻帶外，阻擋", result.status); state(doc, "detune-feedback", (result.inBand ? "目前估算仍在原頻帶內；" : "簡化模型預測共振移到原頻帶外；") + "介質負載只呈現方向與敏感度，不能取代 VNA、暗室、OTA 或整機調諧。", result.status); }
    if (key === "edge-emi") { setText(doc, "edge-knee-frequency", format(result.kneeFrequency, 1, "MHz")); setText(doc, "edge-guided-wavelength", format(result.guidedWavelength, 1, "mm")); setText(doc, "edge-critical-length", format(result.criticalLength, 1, "mm")); setText(doc, "edge-length-ratio", format(result.lengthRatio, 2, "")); setText(doc, "edge-verdict", result.verdict); state(doc, "edge-status", result.blocked ? "長度比阻擋" : result.warning ? "長度比警告" : "教學 gate 通過", result.status); state(doc, "edge-feedback", "關鍵是 edge rate，不是標稱 clock；分割地、迴路面積與外接線仍須另查。", result.status); }
    if (key === "compliance") { setText(doc, "compliance-first", result.first); setText(doc, "compliance-second", result.second); setText(doc, "compliance-count", result.count + " / " + result.total); setText(doc, "compliance-blocker", result.blocker); state(doc, "compliance-status", result.complete ? "送測前 gate 閉合" : "法規 gate 阻擋", result.status); state(doc, "compliance-feedback", result.complete ? "送測前 gate 已閉合；這不是認證、法律意見或主管機關核准。" : "第一個情境必要缺口為「" + result.blocker + "」；勾選總數不能抵銷前項。", result.status); }
  }

  function store(root) { try { return root && root.localStorage ? root.localStorage : null; } catch (error) { return null; } }
  function loadProgress(root) { var s = store(root); if (!s) return {}; try { var parsed = JSON.parse(s.getItem(STORAGE_KEY) || "{}"); return parsed && parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {}; } catch (error) { return {}; } }
  function saveProgress(root, completed) { var s = store(root); if (!s) return; try { s.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: completed })); } catch (error) {} }
  function updateProgress(doc, completed) { var count = MODULE_KEYS.filter(function (key) { return completed[key] === true; }).length; setText(doc, "progress-label", "已完成 " + count + " / " + MODULE_KEYS.length + " 個模組（" + Math.round(count / MODULE_KEYS.length * 100) + "%）"); var fill = get(doc, "progress-fill"); if (fill && fill.style) fill.style.width = (count / MODULE_KEYS.length * 100).toFixed(2) + "%"; all(doc, ".progress-track").forEach(function (track) { if (track.setAttribute) { track.setAttribute("aria-valuemin", "0"); track.setAttribute("aria-valuemax", String(MODULE_KEYS.length)); track.setAttribute("aria-valuenow", String(count)); track.setAttribute("aria-valuetext", count + " / " + MODULE_KEYS.length + " 個模組完成"); } }); all(doc, "[data-complete]").forEach(function (button) { var done = completed[button.getAttribute("data-complete")] === true; if (button.classList) button.classList.toggle("is-complete", done); if (button.setAttribute) button.setAttribute("aria-pressed", done ? "true" : "false"); var label = button.querySelector ? button.querySelector("[data-complete-label], .complete-label") : null; if (label) label.textContent = done ? "已完成" : "標記完成"; else button.textContent = done ? "已完成" : "標記完成"; }); all(doc, "[data-nav]").forEach(function (button) { var done = completed[button.getAttribute("data-nav")] === true; if (button.classList) button.classList.toggle("is-complete", done); var mark = button.querySelector ? button.querySelector("[data-nav-mark], .nav-mark") : null; if (mark) mark.textContent = done ? "●" : "○"; }); }
  function activate(doc, key) { if (MODULE_KEYS.indexOf(key) < 0) return; all(doc, "[data-module]").forEach(function (section) { var active = section.getAttribute("data-module") === key; section.hidden = !active; if (section.setAttribute) section.setAttribute("aria-hidden", active ? "false" : "true"); if (section.classList) section.classList.toggle("is-active", active); }); all(doc, "[data-nav]").forEach(function (button) { var active = button.getAttribute("data-nav") === key; if (button.classList) button.classList.toggle("is-active", active); if (button.setAttribute) { if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); } }); }
  function bind(element, handler) { if (!element || typeof element.addEventListener !== "function") return; element.addEventListener("click", handler); }
  function applyDefaults(doc, key) { var defaults = DEFAULTS[key]; if (!defaults) return; Object.keys(defaults).forEach(function (id) { var input = get(doc, id); if (!input) return; input.checked = input.type === "checkbox" ? defaults[id] === true : input.checked; if (input.type !== "checkbox") input.value = String(defaults[id]); }); }
  function init(doc, browserRoot) {
    if (!doc) return;
    var rootObject = browserRoot || (typeof window !== "undefined" ? window : null);
    var completed = loadProgress(rootObject);
    var sections = all(doc, "[data-module]");
    activate(doc, sections.length ? sections[0].getAttribute("data-module") : MODULE_KEYS[0]);
    all(doc, "form").forEach(function (form) {
      if (form && typeof form.addEventListener === "function") form.addEventListener("submit", function (event) { event.preventDefault(); });
    });
    all(doc, "[data-nav]").forEach(function (button) { bind(button, function () { activate(doc, button.getAttribute("data-nav")); }); });
    all(doc, "[data-complete]").forEach(function (button) { bind(button, function () { var key = button.getAttribute("data-complete"); if (MODULE_KEYS.indexOf(key) < 0) return; completed[key] = completed[key] !== true; saveProgress(rootObject, completed); updateProgress(doc, completed); }); });
    var reset = get(doc, "reset-progress"); bind(reset, function () { completed = {}; saveProgress(rootObject, completed); updateProgress(doc, completed); });
    all(doc, "[data-reset-module]").forEach(function (button) { bind(button, function () { var key = button.getAttribute("data-reset-module"); applyDefaults(doc, key); run(doc, key); }); });
    var inputToModule = {};
    Object.keys(DEFAULTS).forEach(function (key) { Object.keys(DEFAULTS[key]).forEach(function (id) { inputToModule[id] = key; }); });
    Object.keys(inputToModule).forEach(function (id) { var input = get(doc, id); if (!input) return; ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { run(doc, inputToModule[id]); }); }); });
    all(doc, "[data-layout-check]").forEach(function (input) { ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { run(doc, "rf-layout"); }); }); });
    all(doc, "[data-compliance-check]").forEach(function (input) { ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { run(doc, "compliance"); }); }); });
    updateProgress(doc, completed);
    MODULE_KEYS.forEach(function (key) { run(doc, key); });
  }

  return { C: C, MODULE_KEYS: MODULE_KEYS.slice(), STORAGE_KEY: STORAGE_KEY, defaults: DEFAULTS, calculateWaveRegion: calculateWaveRegion, calculateLinkBudget: calculateLinkBudget, calculateImpedanceMatch: calculateImpedanceMatch, calculateRfLayout: calculateRfLayout, calculateAntennaChoice: calculateAntennaChoice, calculateDetuning: calculateDetuning, calculateEdgeEmi: calculateEdgeEmi, calculateCompliance: calculateCompliance, init: init };
}));

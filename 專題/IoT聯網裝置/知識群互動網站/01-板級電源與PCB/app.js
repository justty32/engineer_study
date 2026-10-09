(function (root, factory) {
  "use strict";

  var api = factory();
  var isCommonJs = typeof module !== "undefined" && module.exports;
  if (isCommonJs) {
    module.exports = api;
  }
  if (!isCommonJs && root) {
    root.IotPowerPcbLogic = api;
    if (root.document && typeof api.init === "function") {
      api.init(root.document, root);
    }
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var MODULE_KEYS = [
    "power-tree", "regulator", "battery", "decoupling",
    "schematic", "stackup", "rf-layout", "release"
  ];
  var STORAGE_KEY = "engineerStudy.iotPowerPcb.v1";
  var SELF_CHECKS = {
    "power-tree": {
      question: "某 3.3 V 數位 rail 的預估負載為 75 mA，設計裕度取 20%。設計電流應抓多少？",
      answer: "90.0 mA（容差 ±0.1 mA）。",
      explanation: "依 I_design = I × (1 + 裕度／100)，75 × 1.20 = 90 mA。這只處理連續負載裕度，不能拿來取代 Radio 峰值檢查。"
    },
    regulator: {
      question: "LDO 的 dropout 裕度足夠，但最壞接面溫度估成 132 °C，應優先判定可用還是阻擋？",
      answer: "阻擋，不能只看 dropout。",
      explanation: "電氣壓差足夠不代表熱安全；接面溫度超過教材的 125 °C 門檻時，應改用較低損耗方案或改善散熱。"
    },
    battery: {
      question: "裝置 99.9% 時間睡眠時，為何仍要把穩壓器 Iq 與板級漏電列入平均電流？",
      answer: "因為它們在睡眠期間仍持續耗電，可能反而主導壽命。",
      explanation: "低 duty cycle 會壓低主功能的平均電流，卻不會自動消除常駐漏電；應以整板量測驗證所有隱性負載。"
    },
    decoupling: {
      question: "若瞬態壓降主要來自 ESR 項，單純把同類電容容量加倍，能否保證壓降減半？",
      answer: "不能。",
      explanation: "容量加倍只直接降低 ΔI×Δt／C 項；若 ΔI×ESR 主導，還要降低 ESR、縮短路徑或改變並聯配置。"
    },
    schematic: {
      question: "ERC 零錯誤是否足以證明 RESET 上電時序、封裝與替代料都正確？",
      answer: "不足。",
      explanation: "ERC 只檢查它能理解的電氣規則；產品意圖、時序、封裝映射與供應鏈證據仍需獨立審查。"
    },
    stackup: {
      question: "低時脈訊號若邊緣很快且跨越參考平面裂縫，是否仍可能有高 SI／EMI 風險？",
      answer: "是。",
      explanation: "風險主要受邊緣速度與回流迴路影響；裂縫迫使回流繞路，會放大迴路面積與輻射。"
    },
    "rf-layout": {
      question: "預留 π 匹配焊墊且饋線標稱 50 Ω，是否就能宣告整機天線效率合格？",
      answer: "不能。",
      explanation: "這些只建立可調與傳輸條件；外殼、電池、人手與實際天線仍須靠 VNA 與整機無線量測驗證。"
    },
    release: {
      question: "新板第一次上電就接齊所有外設並燒完整韌體，為何不利於 bring-up？",
      answer: "故障變數同時增加，難以定位第一個失敗環節。",
      explanation: "應從目視、短路與限流供電開始，再逐軌確認電源、reset、clock 與除錯介面，一次只引入一類未知數。"
    }
  };
  var DEFAULTS = {
    "power-tree": {
      "tree-margin": 30, "load-digital": 60, "load-radio-average": 100,
      "load-radio-peak": 2000, "load-clean": 20, "load-core": 10
    },
    regulator: {
      "reg-vin": 5, "reg-vin-min": 4.5, "reg-vin-max": 5, "reg-vout": 3.3,
      "reg-current": 0.2, "reg-dropout": 0.2, "reg-theta": 50,
      "reg-ta": 25, "buck-efficiency": 90, "noise-priority": "balanced"
    },
    battery: {
      "sleep-current": 0.01, "sleep-share": 99, "active-current": 30,
      "active-share": 0.9, "tx-current": 200, "tx-share": 0.1,
      "regulator-iq": 0.005, "board-leakage": 0.002,
      "battery-capacity": 2000, "battery-derating": 0.8
    },
    decoupling: {
      "pulse-step": 0.5, "pulse-duration": 0.2, "pulse-esr": 0.05,
      "pulse-capacitance": 470, "pulse-allowable": 0.3
    },
    schematic: {
      "check-decoupling": true, "check-reset-boot": true,
      "check-package-part": true, "check-testpoints": false,
      "check-interface-protection": false, "check-erc": false
    },
    stackup: {
      "stackup-layers": "4", "signal-edge": "fast", "route-length": "long",
      "reference-plane": "continuous", "crosses-split": "no",
      "controlled-impedance": "yes"
    },
    "rf-layout": {
      "antenna-type": "chip", "rf-50ohm": true, "rf-short-route": true,
      "rf-ground-reference": true, "rf-pi-match": true, "rf-keepout": true,
      "rf-vendor-guide": true, "rf-metal-clear": true
    },
    release: {
      "failure-case": "tx-reset", "esd-location": "connector",
      "esd-path": "protected-first", "release-testpoints": true,
      "release-dfm-rules": true, "release-manufacturing-files": true,
      "release-bringup-plan": true, "release-reflow-review": true
    }
  };

  var OUTPUTS = {
    "power-tree": [
      "rail-digital-design", "rail-radio-design", "rail-radio-peak",
      "rail-clean-design", "rail-core-design", "tree-continuous-power",
      "tree-peak-power", "tree-status"
    ],
    regulator: [
      "ldo-loss", "ldo-efficiency", "ldo-junction", "dropout-headroom",
      "buck-loss", "buck-junction", "regulator-verdict", "regulator-status"
    ],
    battery: [
      "duty-average", "hidden-current", "total-average", "battery-hours",
      "battery-days", "leakage-share", "battery-status"
    ],
    decoupling: [
      "esr-drop", "capacitive-drop", "total-drop", "target-impedance",
      "effective-impedance", "minimum-capacitance", "decoupling-status"
    ],
    schematic: ["schematic-count", "schematic-next", "schematic-status"],
    stackup: ["return-risk", "si-risk", "stackup-score", "stackup-status"],
    "rf-layout": ["rf-count", "rf-blocker", "rf-status"],
    release: ["diagnosis-first", "diagnosis-second", "release-count", "release-status"]
  };

  var FIELD_SPECS = {
    "power-tree": [
      ["tree-margin", "設計裕度", "percent-margin"],
      ["load-digital", "數位負載", "nonnegative"],
      ["load-radio-average", "Radio 平均負載", "nonnegative"],
      ["load-radio-peak", "Radio 峰值負載", "nonnegative"],
      ["load-clean", "Clean rail 負載", "nonnegative"],
      ["load-core", "Core 負載", "nonnegative"]
    ],
    regulator: [
      ["reg-vin", "標稱輸入電壓", "positive"], ["reg-vin-min", "最低輸入電壓", "positive"],
      ["reg-vin-max", "最高輸入電壓", "positive"],
      ["reg-vout", "輸出電壓", "positive"], ["reg-current", "輸出電流", "positive"],
      ["reg-dropout", "Dropout 電壓", "nonnegative"], ["reg-theta", "熱阻", "positive"],
      ["reg-ta", "環境溫度", "finite"], ["buck-efficiency", "Buck 效率", "efficiency"],
      ["noise-priority", "雜訊取捨", "select"]
    ],
    battery: [
      ["sleep-current", "Sleep 電流", "nonnegative"], ["sleep-share", "Sleep 佔比", "share"],
      ["active-current", "Active 電流", "nonnegative"], ["active-share", "Active 佔比", "share"],
      ["tx-current", "Tx 電流", "nonnegative"], ["tx-share", "Tx 佔比", "share"],
      ["regulator-iq", "穩壓器 Iq", "nonnegative"], ["board-leakage", "板級漏電", "nonnegative"],
      ["battery-capacity", "電池容量", "positive"], ["battery-derating", "電池折扣", "derating"]
    ],
    decoupling: [
      ["pulse-step", "電流步階", "positive"], ["pulse-duration", "脈衝時間", "nonnegative"],
      ["pulse-esr", "ESR", "nonnegative"], ["pulse-capacitance", "電容量", "positive"],
      ["pulse-allowable", "允許壓降", "positive"]
    ],
    stackup: [
      ["stackup-layers", "板層數", "stackup-layers"], ["signal-edge", "邊緣速度", "edge"],
      ["route-length", "走線長度", "length"], ["reference-plane", "參考平面", "plane"],
      ["crosses-split", "跨越平面裂縫", "split"], ["controlled-impedance", "受控阻抗", "controlled"]
    ],
    "rf-layout": [["antenna-type", "天線類型", "antenna"]],
    release: [
      ["failure-case", "故障情境", "failure"], ["esd-location", "ESD 位置", "esd-location"],
      ["esd-path", "ESD 路徑", "esd-path"]
    ]
  };

  var SCHEMATIC_LABELS = {
    "check-decoupling": "電源腳去耦",
    "check-reset-boot": "RESET／BOOT",
    "check-package-part": "封裝與料號",
    "check-testpoints": "測試點／SWD",
    "check-interface-protection": "接口保護",
    "check-erc": "ERC"
  };
  var RF_LABELS = {
    "rf-50ohm": "50 Ω 饋線",
    "rf-short-route": "短路徑",
    "rf-ground-reference": "連續參考地",
    "rf-pi-match": "π 匹配位置",
    "rf-keepout": "天線 keep-out",
    "rf-vendor-guide": "模組廠商 guideline",
    "rf-metal-clear": "電池／金屬淨空"
  };
  var RELEASE_DIAGNOSIS = {
    "tx-reset": ["先量 radio rail 與發射電流脈衝", "再查 bulk 電容、ESR 與供電走線"],
    "poor-range": ["先查天線 keep-out 與 vendor guideline", "再查 50 Ω 饋線與 π 匹配"],
    emissions: ["先查高頻迴路與回流路徑", "再查 slew rate、濾波與屏蔽"],
    "no-program": ["先查 SWD／JTAG 可達性與 BOOT／RESET", "再查供電與焊接品質"]
  };

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function assertNumber(value, label, rule) {
    if (!isFiniteNumber(value)) throw new Error(label + " 必須是有限數值");
    if (rule === "positive" && value <= 0) throw new Error(label + " 必須大於 0");
    if (rule === "nonnegative" && value < 0) throw new Error(label + " 不可小於 0");
    if (rule === "percent-margin" && (value < 0 || value > 200)) throw new Error(label + " 必須介於 0% 與 200%");
    if (rule === "share" && (value < 0 || value > 100)) throw new Error(label + " 必須介於 0% 與 100%");
    if (rule === "efficiency" && (value <= 0 || value > 100)) throw new Error(label + " 必須大於 0% 且不超過 100%");
    if (rule === "derating" && (value <= 0 || value > 1)) throw new Error(label + " 必須大於 0 且不超過 1");
    return value;
  }

  function valueOf(values, id, label, rule) {
    return assertNumber(values && values[id], label, rule);
  }

  function calculatePowerTree(values) {
    var margin = valueOf(values, "tree-margin", "設計裕度", "percent-margin");
    var digital = valueOf(values, "load-digital", "數位負載", "nonnegative");
    var radioAverage = valueOf(values, "load-radio-average", "Radio 平均負載", "nonnegative");
    var radioPeak = valueOf(values, "load-radio-peak", "Radio 峰值負載", "nonnegative");
    var clean = valueOf(values, "load-clean", "Clean rail 負載", "nonnegative");
    var core = valueOf(values, "load-core", "Core 負載", "nonnegative");
    if (radioPeak < radioAverage) throw new Error("Radio 峰值負載不可低於平均負載");
    var factor = 1 + margin / 100;
    var design = {
      digital: digital * factor, radio: radioAverage * factor,
      radioPeak: radioPeak * factor, clean: clean * factor, core: core * factor
    };
    var continuous = (3.3 * design.digital + 3.8 * design.radio + 3.3 * design.clean + 1.8 * design.core) / 1000;
    var peak = (3.3 * design.digital + 3.8 * design.radioPeak + 3.3 * design.clean + 1.8 * design.core) / 1000;
    if (!isFiniteNumber(continuous) || !isFiniteNumber(peak)) throw new Error("電源樹功率計算結果無效");
    return {
      digital: design.digital, radio: design.radio, radioPeak: design.radioPeak,
      clean: design.clean, core: design.core, continuousPower: continuous,
      peakPower: peak, margin: margin, radioPeakDelta: design.radioPeak - design.radio
    };
  }

  function calculateRegulator(values) {
    var vin = valueOf(values, "reg-vin", "輸入電壓", "positive");
    var vinMin = valueOf(values, "reg-vin-min", "最低輸入電壓", "positive");
    var vinMax = valueOf(values, "reg-vin-max", "最高輸入電壓", "positive");
    var vout = valueOf(values, "reg-vout", "輸出電壓", "positive");
    var current = valueOf(values, "reg-current", "輸出電流", "positive");
    var dropout = valueOf(values, "reg-dropout", "Dropout 電壓", "nonnegative");
    var theta = valueOf(values, "reg-theta", "熱阻", "positive");
    var ta = valueOf(values, "reg-ta", "環境溫度", "finite");
    var efficiency = valueOf(values, "buck-efficiency", "Buck 效率", "efficiency") / 100;
    var priority = values && values["noise-priority"];
    if (["balanced", "quiet", "efficiency"].indexOf(priority) < 0) throw new Error("雜訊取捨選項無效");
    if (vinMin > vin) throw new Error("最低輸入電壓不可高於標稱輸入電壓");
    if (vin > vinMax) throw new Error("標稱輸入電壓不可高於最高輸入電壓");
    if (vin <= vout || vinMax <= vout) throw new Error("標稱與最高輸入電壓必須高於輸出電壓");
    var ldoLoss = (vinMax - vout) * current;
    var ldoEfficiency = vout / vin * 100;
    var ldoJunction = ta + theta * ldoLoss;
    var headroom = vinMin - vout - dropout;
    var buckLoss = vout * current * (1 / efficiency - 1);
    var buckJunction = ta + theta * buckLoss;
    return {
      ldoLoss: ldoLoss, ldoEfficiency: ldoEfficiency, ldoJunction: ldoJunction,
      headroom: headroom, buckLoss: buckLoss, buckJunction: buckJunction,
      priority: priority, dropoutRisk: headroom < 0,
      ldoThermalState: ldoJunction > 125 ? "error" : ldoJunction > 100 ? "warn" : "ok"
    };
  }

  function calculateBattery(values) {
    var sleepCurrent = valueOf(values, "sleep-current", "Sleep 電流", "nonnegative");
    var sleepShare = valueOf(values, "sleep-share", "Sleep 佔比", "share");
    var activeCurrent = valueOf(values, "active-current", "Active 電流", "nonnegative");
    var activeShare = valueOf(values, "active-share", "Active 佔比", "share");
    var txCurrent = valueOf(values, "tx-current", "Tx 電流", "nonnegative");
    var txShare = valueOf(values, "tx-share", "Tx 佔比", "share");
    var iq = valueOf(values, "regulator-iq", "穩壓器 Iq", "nonnegative");
    var leakage = valueOf(values, "board-leakage", "板級漏電", "nonnegative");
    var capacity = valueOf(values, "battery-capacity", "電池容量", "positive");
    var derating = valueOf(values, "battery-derating", "電池折扣", "derating");
    var shareTotal = sleepShare + activeShare + txShare;
    if (Math.abs(shareTotal - 100) > 0.01) throw new Error("三種狀態佔比必須合計 100%（目前為 " + shareTotal.toFixed(2) + "%）");
    var duty = sleepCurrent * sleepShare / 100 + activeCurrent * activeShare / 100 + txCurrent * txShare / 100;
    var hidden = iq + leakage;
    var total = duty + hidden;
    if (total <= 0) throw new Error("平均電流不可為 0，否則無法估算壽命");
    var hours = capacity * derating / total;
    return {
      dutyAverage: duty, hiddenCurrent: hidden, totalAverage: total,
      batteryHours: hours, batteryDays: hours / 24,
      leakageShare: hidden / total * 100, shareTotal: shareTotal
    };
  }

  function calculateDecoupling(values) {
    var current = valueOf(values, "pulse-step", "電流步階", "positive");
    var duration = valueOf(values, "pulse-duration", "脈衝時間", "nonnegative");
    var esr = valueOf(values, "pulse-esr", "ESR", "nonnegative");
    var capacitance = valueOf(values, "pulse-capacitance", "電容量", "positive");
    var allowable = valueOf(values, "pulse-allowable", "允許壓降", "positive");
    if (current <= 0) throw new Error("電流步階必須大於 0，否則 target impedance 會除以 0");
    var esrDrop = current * esr;
    var capacitiveDrop = current * (duration / 1000) / (capacitance / 1000000);
    var totalDrop = esrDrop + capacitiveDrop;
    var denominator = allowable - esrDrop;
    var minimumCapacitance = denominator > 0 ? current * (duration / 1000) / denominator * 1000000 : null;
    return {
      esrDrop: esrDrop, capacitiveDrop: capacitiveDrop, totalDrop: totalDrop,
      targetImpedance: allowable / current, effectiveImpedance: totalDrop / current,
      minimumCapacitance: minimumCapacitance, solvable: denominator > 0,
      pass: totalDrop <= allowable + 1e-12
    };
  }

  function calculateSchematic(checks) {
    var ids = Object.keys(SCHEMATIC_LABELS);
    var count = 0;
    var next = null;
    ids.forEach(function (id) {
      if (checks && checks[id] === true) count += 1;
      else if (!next) next = SCHEMATIC_LABELS[id];
    });
    return { count: count, total: ids.length, complete: count === ids.length, next: next };
  }

  function calculateStackup(values) {
    var layers = values && values["stackup-layers"];
    var edge = values && values["signal-edge"];
    var length = values && values["route-length"];
    var plane = values && values["reference-plane"];
    var crosses = values && values["crosses-split"];
    var controlled = values && values["controlled-impedance"];
    if (["2", "4"].indexOf(String(layers)) < 0) throw new Error("板層數只能是 2 或 4 層");
    if (["fast", "slow"].indexOf(edge) < 0) throw new Error("邊緣速度選項無效");
    if (["long", "short"].indexOf(length) < 0) throw new Error("走線長度選項無效");
    if (["continuous", "broken"].indexOf(plane) < 0) throw new Error("參考平面選項無效");
    if (["yes", "no"].indexOf(crosses) < 0) throw new Error("跨裂縫選項無效");
    if (["yes", "no"].indexOf(controlled) < 0) throw new Error("受控阻抗選項無效");
    var score = 0;
    if (crosses === "yes") score += 4;
    if (plane === "broken") score += 3;
    if (edge === "fast" && layers === "2") score += 2;
    if (edge === "fast" && length === "long" && controlled === "no") score += 2;
    if (layers === "2") score += 1;
    var level = score >= 5 ? "blocked" : score >= 2 ? "review" : "low";
    return {
      score: score, level: level,
      returnRisk: crosses === "yes" || plane === "broken" ? "回流可能被迫繞路，迴路面積變大" : "回流參考平面連續",
      siRisk: score >= 5 ? "邊緣速度、走線與阻抗條件需要先修正" : score >= 2 ? "需進行 SI／layout review" : "目前教學條件風險低",
      message: "此分數是教材規則，不是阻抗計算或 sign-off；邊緣速度比時脈頻率更能決定 SI 風險。"
    };
  }

  function calculateRf(values, checks) {
    var type = values && values["antenna-type"];
    if (["chip", "pcb", "external"].indexOf(type) < 0) throw new Error("天線類型無效");
    var required = ["rf-50ohm", "rf-short-route", "rf-ground-reference", "rf-pi-match", "rf-vendor-guide"];
    if (type === "chip" || type === "pcb") required.push("rf-keepout", "rf-metal-clear");
    var count = 0;
    Object.keys(RF_LABELS).forEach(function (id) { if (checks && checks[id] === true) count += 1; });
    var missing = required.filter(function (id) { return !checks || checks[id] !== true; });
    return {
      type: type, count: count, total: Object.keys(RF_LABELS).length,
      complete: missing.length === 0, blocker: missing.length ? RF_LABELS[missing[0]] : null,
      required: required, missing: missing
    };
  }

  function calculateRelease(values, checks) {
    var failure = values && values["failure-case"];
    var location = values && values["esd-location"];
    var path = values && values["esd-path"];
    if (!RELEASE_DIAGNOSIS[failure]) throw new Error("故障情境無效");
    if (["connector", "ic", "none"].indexOf(location) < 0) throw new Error("ESD 位置無效");
    if (["protected-first", "bypass"].indexOf(path) < 0) throw new Error("ESD 路徑無效");
    var ids = ["release-testpoints", "release-dfm-rules", "release-manufacturing-files", "release-bringup-plan", "release-reflow-review"];
    var count = ids.filter(function (id) { return checks && checks[id] === true; }).length;
    var esdOk = location === "connector" && path === "protected-first";
    return {
      first: RELEASE_DIAGNOSIS[failure][0], second: RELEASE_DIAGNOSIS[failure][1],
      count: count, total: ids.length, esdOk: esdOk,
      complete: count === ids.length && esdOk,
      esdMessage: esdOk ? "ESD 由介面端先經保護再進 IC" :
        location === "ic" ? "ESD 保護放在 IC 旁過晚，介面到保護元件的走線已先承受衝擊" :
          location === "none" ? "尚未配置 ESD 保護，敏感 IC 可能直接承受衝擊" :
            "ESD 路徑繞過保護元件後才進 IC，保護配置無法截流"
    };
  }

  function safeGet(doc, id) {
    return doc && typeof doc.getElementById === "function" ? doc.getElementById(id) : null;
  }

  function safeAll(doc, selector) {
    if (!doc || typeof doc.querySelectorAll !== "function") return [];
    try { return Array.prototype.slice.call(doc.querySelectorAll(selector)); } catch (error) { return []; }
  }

  function setText(doc, id, value) {
    var element = safeGet(doc, id);
    if (!element) return;
    var target = safeAll(element, ".status-text, [data-status-text], .output-text")[0];
    if (!target && element.classList && element.classList.contains("status-box") && element.firstElementChild) target = element.firstElementChild;
    if (target) target.textContent = String(value);
    else element.textContent = String(value);
  }

  function setState(doc, id, state) {
    var element = safeGet(doc, id);
    if (!element) return;
    var classes = ["status-ok", "status-warn", "status-error", "status-neutral"];
    if (element.classList) {
      classes.forEach(function (name) { element.classList.remove(name); });
      element.classList.add("status-" + (state === "ok" ? "ok" : state === "warn" ? "warn" : state === "error" ? "error" : "neutral"));
    }
    if (element.dataset) element.dataset.state = state;
    var symbol = safeAll(element, ".status-symbol, [data-status-symbol]")[0];
    if (symbol) symbol.textContent = state === "ok" ? "✓" : state === "warn" ? "!" : state === "error" ? "×" : "•";
    if (typeof element.setAttribute === "function") {
      element.setAttribute("aria-live", "polite");
      element.setAttribute("role", "status");
    }
  }

  function setFeedback(doc, id, message, state) {
    setText(doc, id, String(message).replace(/^[✓!×]\s*/, ""));
    setState(doc, id, state);
  }

  function clearOutputs(doc, ids) {
    ids.forEach(function (id) { setText(doc, id, "—"); });
  }

  function format(value, digits, unit) {
    if (!isFiniteNumber(value)) return "—";
    return value.toFixed(digits) + (unit ? " " + unit : "");
  }

  function readFields(doc, specs) {
    var values = {};
    for (var i = 0; i < specs.length; i += 1) {
      var spec = specs[i];
      var input = safeGet(doc, spec[0]);
      if (!input) return { ok: false, error: "找不到輸入欄位：" + spec[0] };
      if (spec[2] === "select" || spec[2] === "stackup-layers" || spec[2] === "edge" || spec[2] === "length" || spec[2] === "plane" || spec[2] === "split" || spec[2] === "controlled" || spec[2] === "antenna" || spec[2] === "failure" || spec[2] === "esd-location" || spec[2] === "esd-path") {
        if (typeof input.value !== "string" || !input.value.trim()) return { ok: false, error: spec[1] + " 不可為空白" };
        values[spec[0]] = input.value;
      } else {
        if (input.value === null || input.value === undefined || String(input.value).trim() === "") return { ok: false, error: spec[1] + " 不可為空白" };
        var number = Number(input.value);
        if (!isFiniteNumber(number)) return { ok: false, error: spec[1] + " 必須是有限數值" };
        values[spec[0]] = number;
      }
    }
    return { ok: true, value: values };
  }

  function checked(fn, values, extra) {
    try {
      var result = fn(values, extra);
      Object.keys(result || {}).forEach(function (key) {
        if (typeof result[key] === "number" && !isFiniteNumber(result[key])) throw new Error("計算結果不是有限數值");
      });
      return { ok: true, value: result };
    } catch (error) {
      return { ok: false, error: error && error.message ? error.message : "輸入或計算無效" };
    }
  }

  function readChecks(doc, selector) {
    var checks = {};
    safeAll(doc, selector).forEach(function (input) {
      var id = input.id || input.getAttribute("data-check-id");
      if (id) checks[id] = input.checked === true;
    });
    return checks;
  }

  function renderPowerTree(doc, result) {
    setText(doc, "rail-digital-design", format(result.digital, 1, "mA"));
    setText(doc, "rail-radio-design", format(result.radio, 1, "mA"));
    setText(doc, "rail-radio-peak", format(result.radioPeak, 1, "mA"));
    setText(doc, "rail-clean-design", format(result.clean, 1, "mA"));
    setText(doc, "rail-core-design", format(result.core, 1, "mA"));
    setText(doc, "tree-continuous-power", format(result.continuousPower, 3, "W"));
    setText(doc, "tree-peak-power", format(result.peakPower, 3, "W"));
    var barValues = {
      digital: result.digital, radio: result.radio, "radio-peak": result.radioPeak,
      clean: result.clean, core: result.core
    };
    var barMaximum = Math.max(result.digital, result.radio, result.radioPeak, result.clean, result.core, 1);
    Object.keys(barValues).forEach(function (key) {
      var bar = safeAll(doc, '[data-rail-bar="' + key + '"]')[0];
      if (bar && bar.style) bar.style.width = (barValues[key] / barMaximum * 100).toFixed(2) + "%";
    });
    setText(doc, "tree-status", "電源樹可作初步配置");
    setState(doc, "tree-status", "ok");
    setFeedback(doc, "tree-feedback", "✓ Clean rail 與 radio 高電流域應分開；radio 峰值不可用平均值取代，還要在電源能力與局部儲能上留出驗證空間。", "ok");
  }

  function renderRegulator(doc, result) {
    setText(doc, "ldo-loss", format(result.ldoLoss, 3, "W"));
    setText(doc, "ldo-efficiency", format(result.ldoEfficiency, 1, "%"));
    setText(doc, "ldo-junction", format(result.ldoJunction, 1, "°C"));
    setText(doc, "dropout-headroom", format(result.headroom, 3, "V"));
    setText(doc, "buck-loss", format(result.buckLoss, 3, "W"));
    setText(doc, "buck-junction", format(result.buckJunction, 1, "°C"));
    var thermalRisk = result.ldoThermalState !== "ok";
    var verdict = result.ldoThermalState === "error" ? "LDO 過熱，優先改用 buck 或重做熱設計" :
      result.ldoThermalState === "warn" ? "LDO 熱裕度偏低，需重做熱設計" :
        result.dropoutRisk ? "LDO 壓差不足，請改電源條件或架構" :
          result.priority === "quiet" ? "熱與 dropout 通過，可偏向 LDO" : result.priority === "efficiency" ? "偏向 buck" : "吵雜域用 buck，低雜訊電源軌再評估 LDO";
    var state = result.ldoThermalState === "error" ? "error" : result.dropoutRisk || thermalRisk ? "warn" : "ok";
    setText(doc, "regulator-verdict", verdict);
    setState(doc, "regulator-verdict", state);
    setText(doc, "regulator-status", result.ldoThermalState === "error" ? "LDO 接面溫度超過 125 °C" : result.ldoThermalState === "warn" ? "LDO 接面溫度超過 100 °C" : result.dropoutRisk ? "Dropout 風險" : "熱與壓差初步通過");
    setState(doc, "regulator-status", state);
    setFeedback(doc, "regulator-feedback", result.ldoThermalState === "error" ? "LDO 最壞情況接面溫度已超過 125 °C，不可因低雜訊優先而繼續採用。" : result.ldoThermalState === "warn" ? "LDO 最壞情況接面溫度已超過 100 °C，需查 datasheet 上限、降額與實際 PCB 熱阻。" : result.dropoutRisk ? "Vin,min − Vout − dropout < 0，可能無法穩壓；請提高輸入或改用低壓差方案。" : "LDO 損耗以最高輸入電壓估算；LDO 效率為忽略 Iq 的理想值。Buck 沿用同一 θJA 且損耗只以輸出功率與效率估算，僅供比較。", state);
  }

  function renderBattery(doc, result) {
    setText(doc, "duty-average", format(result.dutyAverage, 4, "mA"));
    setText(doc, "hidden-current", format(result.hiddenCurrent, 4, "mA"));
    setText(doc, "total-average", format(result.totalAverage, 4, "mA"));
    setText(doc, "battery-hours", format(result.batteryHours, 1, "h"));
    setText(doc, "battery-days", format(result.batteryDays, 1, "日"));
    setText(doc, "leakage-share", format(result.leakageShare, 2, "%"));
    setText(doc, "battery-status", "平均功耗與壽命可估算");
    setState(doc, "battery-status", "ok");
    setFeedback(doc, "battery-feedback", "✓ 先看 sleep 與漏電大戶：Iq、LED、上拉與未關閉周邊可能在待機時主導結果；此壽命模型忽略溫度、老化、截止電壓與脈衝能力。", "ok");
  }

  function renderDecoupling(doc, result) {
    setText(doc, "esr-drop", format(result.esrDrop, 3, "V"));
    setText(doc, "capacitive-drop", format(result.capacitiveDrop, 3, "V"));
    setText(doc, "total-drop", format(result.totalDrop, 3, "V"));
    setText(doc, "target-impedance", format(result.targetImpedance, 3, "Ω"));
    setText(doc, "effective-impedance", format(result.effectiveImpedance, 3, "Ω"));
    setText(doc, "minimum-capacitance", result.minimumCapacitance === null ? "無解" : format(result.minimumCapacitance, 1, "µF"));
    var state = result.solvable && result.pass ? "ok" : "warn";
    setText(doc, "decoupling-status", result.solvable ? (result.pass ? "壓降在允許值內" : "壓降超過允許值") : "ESR 已吃掉允許壓降");
    setState(doc, "decoupling-status", state);
    setFeedback(doc, "decoupling-feedback", !result.solvable ? "! 允許壓降 ≤ ESR 壓降，因此最低電容無解；先降低 ESR 或放寬允許壓降。電容要靠近模組、用短粗回路降低 ESL，並以穩壓器動態響應與實測確認。" : result.pass ? "✓ 局部電容提供瞬態電流的教學估算通過；電容要靠近模組、用短粗回路降低 ESL，正式設計仍要看穩壓器動態響應。" : "! 目前總壓降超過允許值；不能只加大遠端電容，還要檢查峰值供電能力、ESR、走線與模組附近 bulk。", state);
  }

  function renderSchematic(doc, result) {
    setText(doc, "schematic-count", result.count + " / " + result.total);
    setText(doc, "schematic-next", result.next || "可進入 layout review");
    setText(doc, "schematic-status", result.complete ? "可進入 layout review" : "仍有原理圖／release 缺口");
    setState(doc, "schematic-status", result.complete ? "ok" : "warn");
    setFeedback(doc, "schematic-feedback", result.complete ? "✓ 六項檢查已勾選，可進入 layout review；這不代表設計正確、可製造或可量產。" : "! 第一個缺口是「" + result.next + "」；依固定順序補齊去耦、RESET／BOOT、封裝料號、測試點、接口保護與 ERC。", result.complete ? "ok" : "warn");
  }

  function renderStackup(doc, result) {
    setText(doc, "return-risk", result.returnRisk);
    setText(doc, "si-risk", result.siRisk);
    setText(doc, "stackup-score", String(result.score));
    var state = result.level === "low" ? "ok" : result.level === "review" ? "warn" : "error";
    setText(doc, "stackup-status", result.level === "low" ? "低風險" : result.level === "review" ? "需 review" : "阻擋");
    setState(doc, "stackup-status", state);
    setFeedback(doc, "stackup-feedback", "✓ " + result.message + " 先處理跨裂縫與回流連續性，再談線寬；此分數不是阻抗計算或 sign-off。", state);
  }

  function renderRf(doc, result) {
    setText(doc, "rf-count", result.count + " / " + result.total);
    setText(doc, "rf-blocker", result.blocker || "無必要缺口");
    setText(doc, "rf-status", result.complete ? "RF layout gate 通過" : "RF layout gate 阻擋");
    setState(doc, "rf-status", result.complete ? "ok" : "error");
    setFeedback(doc, "rf-feedback", result.complete ? "✓ 所需條件已勾選：50 Ω、短路徑、完整參考地、π 匹配與 vendor guideline；PCB／晶片天線另需淨空。線寬必須依板廠疊層確認，網站不自行給幾何尺寸。" : "× 必要項缺失：「" + result.blocker + "」。關鍵缺口不可用其他項目抵銷；請按模組／天線廠商 guideline 修正。", result.complete ? "ok" : "error");
  }

  function renderRelease(doc, result) {
    setText(doc, "diagnosis-first", result.first);
    setText(doc, "diagnosis-second", result.second);
    setText(doc, "release-count", result.count + " / " + result.total);
    var state = result.complete ? "ok" : "warn";
    setText(doc, "release-status", result.complete ? "release gate 通過" : "release gate 未閉合");
    setState(doc, "release-status", state);
    setFeedback(doc, "release-feedback", result.complete ? "✓ 五項 release checks 完成，且 " + result.esdMessage + "；仍不代表 EMC、ESD、DFM 或量產驗證完成。" : "! " + result.esdMessage + "；release checks 為 " + result.count + " / " + result.total + "，通過前先保留可量測的 bring-up 證據。", state);
  }

  function readModuleChecks(doc, key) {
    if (key === "schematic") return readChecks(doc, "[data-schematic-check]");
    if (key === "rf-layout") return readChecks(doc, "[data-rf-check]");
    if (key === "release") return readChecks(doc, "[data-release-check]");
    return {};
  }

  function runModule(doc, key) {
    var calculation;
    var fields;
    if (key === "power-tree") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "regulator") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "battery") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "decoupling") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "stackup") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "rf-layout") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "release") calculation = readFields(doc, FIELD_SPECS[key]);
    if (key === "schematic") calculation = { ok: true, value: readModuleChecks(doc, key) };
    if (calculation && calculation.ok && key === "power-tree") calculation = checked(calculatePowerTree, calculation.value);
    if (calculation && calculation.ok && key === "regulator") calculation = checked(calculateRegulator, calculation.value);
    if (calculation && calculation.ok && key === "battery") calculation = checked(calculateBattery, calculation.value);
    if (calculation && calculation.ok && key === "decoupling") calculation = checked(calculateDecoupling, calculation.value);
    if (calculation && calculation.ok && key === "schematic") calculation = checked(calculateSchematic, calculation.value);
    if (calculation && calculation.ok && key === "stackup") calculation = checked(calculateStackup, calculation.value);
    if (calculation && calculation.ok && key === "rf-layout") calculation = checked(calculateRf, calculation.value, readModuleChecks(doc, key));
    if (calculation && calculation.ok && key === "release") calculation = checked(calculateRelease, calculation.value, readModuleChecks(doc, key));
    if (!calculation) return;
    var feedbackId = key === "power-tree" ? "tree-feedback" : key === "regulator" ? "regulator-feedback" : key === "battery" ? "battery-feedback" : key === "decoupling" ? "decoupling-feedback" : key === "schematic" ? "schematic-feedback" : key === "stackup" ? "stackup-feedback" : key === "rf-layout" ? "rf-feedback" : "release-feedback";
    if (!calculation.ok) {
      clearOutputs(doc, OUTPUTS[key] || []);
      if (key === "power-tree") {
        safeAll(doc, "[data-rail-bar]").forEach(function (bar) { if (bar.style) bar.style.width = "0"; });
      }
      setFeedback(doc, feedbackId, "× 輸入錯誤：" + calculation.error, "error");
      var statusId = key === "power-tree" ? "tree-status" : key === "regulator" ? "regulator-status" : key === "battery" ? "battery-status" : key === "decoupling" ? "decoupling-status" : key === "schematic" ? "schematic-status" : key === "stackup" ? "stackup-status" : key === "rf-layout" ? "rf-status" : "release-status";
      setState(doc, statusId, "error");
      return;
    }
    if (key === "power-tree") renderPowerTree(doc, calculation.value);
    if (key === "regulator") renderRegulator(doc, calculation.value);
    if (key === "battery") renderBattery(doc, calculation.value);
    if (key === "decoupling") renderDecoupling(doc, calculation.value);
    if (key === "schematic") renderSchematic(doc, calculation.value);
    if (key === "stackup") renderStackup(doc, calculation.value);
    if (key === "rf-layout") renderRf(doc, calculation.value);
    if (key === "release") renderRelease(doc, calculation.value);
  }

  function storage(root) {
    try { return root && root.localStorage ? root.localStorage : null; } catch (error) { return null; }
  }

  function readProgress(root) {
    var store = storage(root);
    if (!store) return {};
    try {
      var parsed = JSON.parse(store.getItem(STORAGE_KEY) || "{}");
      return parsed && parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {};
    } catch (error) { return {}; }
  }

  function saveProgress(root, completed) {
    var store = storage(root);
    if (!store) return;
    try { store.setItem(STORAGE_KEY, JSON.stringify({ completed: completed })); } catch (error) { /* localStorage 失敗時維持頁面操作 */ }
  }

  function updateProgress(doc, root, completed) {
    var count = MODULE_KEYS.filter(function (key) { return completed[key] === true; }).length;
    var label = safeGet(doc, "progress-label");
    var fill = safeGet(doc, "progress-fill");
    var track = safeAll(doc, ".progress-track")[0];
    if (label) label.textContent = count + " / " + MODULE_KEYS.length + " 個模組完成";
    if (fill && fill.style) fill.style.width = (count / MODULE_KEYS.length * 100).toFixed(2) + "%";
    if (track && typeof track.setAttribute === "function") {
      track.setAttribute("aria-valuemin", "0"); track.setAttribute("aria-valuemax", String(MODULE_KEYS.length));
      track.setAttribute("aria-valuenow", String(count)); track.setAttribute("aria-valuetext", count + " / " + MODULE_KEYS.length + " 個模組完成");
    }
    safeAll(doc, "[data-complete]").forEach(function (button) {
      var done = completed[button.getAttribute("data-complete")] === true;
      if (button.classList) button.classList.toggle("is-complete", done);
      if (button.dataset) button.dataset.state = done ? "complete" : "incomplete";
      if (typeof button.setAttribute === "function") button.setAttribute("aria-pressed", done ? "true" : "false");
      var labelNode = safeAll(button, ".complete-label, [data-complete-label]")[0];
      if (labelNode) labelNode.textContent = done ? "已完成" : "標記完成";
      else button.textContent = done ? "已完成" : "標記完成";
    });
    safeAll(doc, "[data-nav]").forEach(function (button) {
      var done = completed[button.getAttribute("data-nav")] === true;
      if (button.classList) button.classList.toggle("is-complete", done);
      var mark = safeAll(button, ".nav-mark, [data-nav-mark]")[0];
      if (mark) mark.textContent = done ? "●" : "○";
      if (typeof button.setAttribute === "function") {
        var title = safeAll(button, "span")[1];
        button.setAttribute("aria-label", (title ? title.textContent : "學習模組") + (done ? "（已完成）" : "（未完成）"));
      }
    });
  }

  function activateModule(doc, key, moveFocus) {
    if (MODULE_KEYS.indexOf(key) < 0) return;
    safeAll(doc, "[data-module]").forEach(function (section) {
      var active = section.getAttribute("data-module") === key;
      section.hidden = !active;
      if (section.classList) section.classList.toggle("is-current", active);
      if (typeof section.setAttribute === "function") section.setAttribute("aria-hidden", active ? "false" : "true");
    });
    safeAll(doc, "[data-nav]").forEach(function (button) {
      var active = button.getAttribute("data-nav") === key;
      if (button.classList) button.classList.toggle("is-active", active);
      if (typeof button.setAttribute === "function") {
        if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
      }
      if (button.dataset) button.dataset.active = active ? "true" : "false";
    });
    if (moveFocus) {
      var activeSection = safeGet(doc, "module-" + key);
      if (activeSection && typeof activeSection.scrollIntoView === "function") activeSection.scrollIntoView({ block: "start" });
      var headingId = activeSection && activeSection.getAttribute("aria-labelledby");
      var heading = headingId ? safeGet(doc, headingId) : null;
      if (heading && typeof heading.focus === "function") {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
  }

  function bindActivatable(element, handler) {
    if (!element || typeof element.addEventListener !== "function") return;
    element.addEventListener("click", handler);
    var tag = String(element.tagName || "").toLowerCase();
    if (tag !== "button" && tag !== "a") {
      if (typeof element.setAttribute === "function") element.setAttribute("role", "button");
      element.tabIndex = 0;
      element.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handler(event); }
      });
    }
  }

  function applyDefaults(doc, key) {
    var defaults = DEFAULTS[key];
    if (!defaults) return;
    Object.keys(defaults).forEach(function (id) {
      var input = safeGet(doc, id);
      if (!input) return;
      if (input.type === "checkbox") input.checked = defaults[id] === true;
      else input.value = String(defaults[id]);
    });
    if (key === "schematic") safeAll(doc, "[data-schematic-check]").forEach(function (input) { if (Object.prototype.hasOwnProperty.call(defaults, input.id)) input.checked = defaults[input.id] === true; });
    if (key === "rf-layout") safeAll(doc, "[data-rf-check]").forEach(function (input) { if (Object.prototype.hasOwnProperty.call(defaults, input.id)) input.checked = defaults[input.id] === true; });
    if (key === "release") safeAll(doc, "[data-release-check]").forEach(function (input) { if (Object.prototype.hasOwnProperty.call(defaults, input.id)) input.checked = defaults[input.id] === true; });
  }

  function renderSelfChecks(doc) {
    MODULE_KEYS.forEach(function (key) {
      var section = safeAll(doc, '[data-module="' + key + '"]')[0];
      var item = SELF_CHECKS[key];
      if (!section || !item || safeAll(section, ".self-check").length) return;
      var details = doc.createElement("details");
      var summary = doc.createElement("summary");
      var answer = doc.createElement("p");
      var answerLabel = doc.createElement("strong");
      var explanation = doc.createElement("p");
      var explanationLabel = doc.createElement("strong");
      details.className = "self-check";
      summary.textContent = "自我檢核：" + item.question;
      answerLabel.textContent = "答案鍵：";
      answer.appendChild(answerLabel);
      answer.appendChild(doc.createTextNode(item.answer));
      explanationLabel.textContent = "解析：";
      explanation.appendChild(explanationLabel);
      explanation.appendChild(doc.createTextNode(item.explanation));
      details.appendChild(summary);
      details.appendChild(answer);
      details.appendChild(explanation);
      section.appendChild(details);
    });
  }

  function init(doc, root) {
    if (!doc) return;
    var browserRoot = root || (typeof window !== "undefined" ? window : null);
    renderSelfChecks(doc);
    safeAll(doc, ".eyebrow, .section-kicker, .panel-tag").forEach(function (element) {
      if (/^[\x00-\x7F\s]+$/.test(element.textContent || "")) element.setAttribute("lang", "en");
    });
    function syncTopbarHeight() {
      var topbar = safeAll(doc, ".topbar")[0];
      if (topbar && doc.documentElement && typeof topbar.getBoundingClientRect === "function") {
        doc.documentElement.style.setProperty("--topbar-height", Math.ceil(topbar.getBoundingClientRect().height) + "px");
      }
    }
    syncTopbarHeight();
    if (browserRoot && typeof browserRoot.addEventListener === "function") browserRoot.addEventListener("resize", syncTopbarHeight);
    var completed = readProgress(browserRoot);
    var sections = safeAll(doc, "[data-module]");
    var initial = sections.length ? sections[0].getAttribute("data-module") : MODULE_KEYS[0];
    if (MODULE_KEYS.indexOf(initial) >= 0) activateModule(doc, initial);
    safeAll(doc, "[data-nav]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () { activateModule(doc, button.getAttribute("data-nav"), true); });
    });
    safeAll(doc, "[data-complete]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () {
        var key = button.getAttribute("data-complete");
        if (MODULE_KEYS.indexOf(key) < 0) return;
        completed[key] = completed[key] !== true;
        saveProgress(browserRoot, completed); updateProgress(doc, browserRoot, completed);
      });
    });
    var resetProgress = safeGet(doc, "reset-progress");
    if (resetProgress) bindActivatable(resetProgress, function () { completed = {}; saveProgress(browserRoot, completed); updateProgress(doc, browserRoot, completed); });
    safeAll(doc, "[data-reset-module]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () {
        var key = button.getAttribute("data-reset-module");
        applyDefaults(doc, key); runModule(doc, key);
      });
    });
    var inputToModule = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      Object.keys(DEFAULTS[key]).forEach(function (id) { inputToModule[id] = key; });
    });
    Object.keys(inputToModule).forEach(function (id) {
      var input = safeGet(doc, id);
      if (!input || typeof input.addEventListener !== "function") return;
      var eventName = input.type === "checkbox" || String(input.tagName || "").toLowerCase() === "select" ? "change" : "input";
      input.addEventListener(eventName, function () { runModule(doc, inputToModule[id]); });
    });
    [
      ["[data-schematic-check]", "schematic"], ["[data-rf-check]", "rf-layout"], ["[data-release-check]", "release"]
    ].forEach(function (entry) {
      safeAll(doc, entry[0]).forEach(function (input) {
        if (!Object.prototype.hasOwnProperty.call(inputToModule, input.id)) input.addEventListener("change", function () { runModule(doc, entry[1]); });
      });
    });
    updateProgress(doc, browserRoot, completed);
    MODULE_KEYS.forEach(function (key) { runModule(doc, key); });
  }

  return {
    MODULE_KEYS: MODULE_KEYS.slice(),
    STORAGE_KEY: STORAGE_KEY,
    defaults: DEFAULTS,
    calculatePowerTree: calculatePowerTree,
    calculateRegulator: calculateRegulator,
    calculateBattery: calculateBattery,
    calculateDecoupling: calculateDecoupling,
    calculateSchematic: calculateSchematic,
    calculateStackup: calculateStackup,
    calculateRf: calculateRf,
    calculateRelease: calculateRelease,
    init: init
  };
}));

(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.PowerSystemsLogic = api;
    if (root.document && typeof api.init === "function") {
      api.init(root.document, root);
    }
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var MODULE_KEYS = [
    "transmission", "perunit", "threephase", "flow",
    "fault", "protection", "stability", "dispatch"
  ];
  var STORAGE_KEY = "engineerStudy.powerSystems.v1";
  var SQRT3 = Math.sqrt(3);
  var DT = 0.0005;

  var DEFAULTS = {
    transmission: {
      "transmit-power": 100, "transmit-pf": 1, "transmit-resistance": 2,
      "voltage-low": 69, "voltage-high": 345
    },
    perunit: {
      "base-power": 100, "base-voltage": 161, "actual-voltage": 154,
      "actual-impedance": 12, "old-zpu": 0.1, "old-base-power": 50,
      "old-base-voltage": 161, "new-base-power": 100, "new-base-voltage": 161
    },
    threephase: {
      "pf-voltage": 11.4, "pf-real-power": 1000, "pf-initial": 0.75,
      "pf-target": 0.95
    },
    flow: { "flow-generation": 40, "flow-load": 100, contingency: "none" },
    fault: {
      "fault-type": "three-phase", "fault-voltage": 1, "z-positive": 0.2,
      "z-negative": 0.2, "z-zero": 0.5, "fault-base-power": 100,
      "fault-base-voltage": 161
    },
    protection: {
      "relay-fault-current": 1200, "relay-main-pickup": 200,
      "relay-main-tms": 0.15, "relay-backup-pickup": 300,
      "relay-backup-tms": 0.9, "relay-margin-target": 0.2
    },
    stability: {
      "stability-pm": 0.8, "stability-pre-max": 1.2,
      "stability-fault-max": 0.2, "stability-post-max": 1,
      "stability-h": 5, "clearing-time": 0.1,
      "frequency-nominal": 60, "frequency-h": 5, "frequency-step": 0.1,
      "frequency-droop": 0.05, "frequency-damping": 1
    },
    dispatch: {
      "dispatch-load": 190, "dispatch-renewable": 30,
      "dispatch-storage": 10, "dispatch-reserve": 20,
      "g1-a": 0.01, "g1-b": 10, "g1-min": 20, "g1-max": 120,
      "g2-a": 0.02, "g2-b": 8, "g2-min": 10, "g2-max": 100
    }
  };

  var FIELD_SPECS = {
    transmission: [
      ["transmit-power", "輸電功率", "positive"], ["transmit-pf", "功率因數", "pf"],
      ["transmit-resistance", "每相電阻", "positive"], ["voltage-low", "低壓", "positive"],
      ["voltage-high", "高壓", "positive"]
    ],
    perunit: [
      ["base-power", "基準功率", "positive"], ["base-voltage", "基準電壓", "positive"],
      ["actual-voltage", "實際電壓", "positive"], ["actual-impedance", "實際阻抗", "nonnegative"],
      ["old-zpu", "舊標么阻抗", "nonnegative"], ["old-base-power", "舊基準功率", "positive"],
      ["old-base-voltage", "舊基準電壓", "positive"], ["new-base-power", "新基準功率", "positive"],
      ["new-base-voltage", "新基準電壓", "positive"]
    ],
    threephase: [
      ["pf-voltage", "線電壓", "positive"], ["pf-real-power", "實功率", "positive"],
      ["pf-initial", "初始功因", "pf"], ["pf-target", "目標功因", "pf"]
    ],
    flow: [["flow-generation", "Bus 2 發電", "nonnegative"], ["flow-load", "Bus 3 負載", "nonnegative"]],
    fault: [
      ["fault-voltage", "故障電壓", "positive"], ["z-positive", "正序阻抗", "nonnegative"],
      ["z-negative", "負序阻抗", "nonnegative"], ["z-zero", "零序阻抗", "nonnegative"],
      ["fault-base-power", "故障基準功率", "positive"], ["fault-base-voltage", "故障基準電壓", "positive"]
    ],
    protection: [
      ["relay-fault-current", "故障電流", "positive"], ["relay-main-pickup", "主保護拾取", "positive"],
      ["relay-main-tms", "主保護 TMS", "positive"], ["relay-backup-pickup", "後備保護拾取", "positive"],
      ["relay-backup-tms", "後備保護 TMS", "positive"], ["relay-margin-target", "目標裕度", "nonnegative"]
    ],
    stabilityAngle: [
      ["stability-pm", "機械輸入功率", "nonnegative"], ["stability-pre-max", "故障前最大功率", "positive"],
      ["stability-fault-max", "故障期間最大功率", "nonnegative"], ["stability-post-max", "故障後最大功率", "positive"],
      ["stability-h", "慣性常數", "positive"], ["clearing-time", "清除時間", "nonnegative"]
    ],
    stabilityFrequency: [
      ["frequency-nominal", "額定頻率", "positive"], ["frequency-h", "頻率慣性常數", "positive"],
      ["frequency-step", "功率階躍", "nonnegative"], ["frequency-droop", "下垂係數 R", "positive"],
      ["frequency-damping", "負載阻尼 D", "nonnegative"]
    ],
    dispatch: [
      ["dispatch-load", "系統負載", "positive"], ["dispatch-renewable", "再生能源", "nonnegative"],
      ["dispatch-storage", "儲能出力", "finite"], ["dispatch-reserve", "備轉要求", "nonnegative"],
      ["g1-a", "G1 二次成本係數", "positive"], ["g1-b", "G1 一次成本係數", "finite"],
      ["g1-min", "G1 最小出力", "nonnegative"], ["g1-max", "G1 最大出力", "positive"],
      ["g2-a", "G2 二次成本係數", "positive"], ["g2-b", "G2 一次成本係數", "finite"],
      ["g2-min", "G2 最小出力", "nonnegative"], ["g2-max", "G2 最大出力", "positive"]
    ]
  };

  var OUTPUTS = {
    transmission: ["current-low", "current-high", "loss-low", "loss-high", "loss-ratio"],
    perunit: ["base-current", "base-impedance", "voltage-pu", "impedance-pu", "converted-zpu"],
    threephase: ["current-initial", "current-target", "reactive-initial", "reactive-target", "capacitor-kvar", "loss-reduction"],
    flow: ["slack-power", "angle-bus-2", "angle-bus-3", "flow-12", "flow-13", "flow-23", "flow-status"],
    fault: ["sequence-positive", "sequence-negative", "sequence-zero", "fault-current-pu", "fault-current-ka"],
    protection: ["relay-main-time", "relay-backup-time", "relay-margin", "relay-status"],
    stabilityAngle: ["initial-angle", "clearing-angle", "accelerating-area", "decelerating-area"],
    stabilityFrequency: ["frequency-rocof", "frequency-steady"],
    dispatch: ["net-load", "g1-output", "g2-output", "dispatch-lambda", "dispatch-cost", "reserve-headroom", "dispatch-status"]
  };

  function finite(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function assertNumber(value, label, rule) {
    if (!finite(value)) {
      throw new Error(label + " 必須是有限數值");
    }
    if (rule === "positive" && value <= 0) {
      throw new Error(label + " 必須大於 0");
    }
    if (rule === "nonnegative" && value < 0) {
      throw new Error(label + " 不可小於 0");
    }
    if (rule === "pf" && (value <= 0 || value > 1)) {
      throw new Error(label + " 必須介於 0 與 1 之間");
    }
    return value;
  }

  function checked(fn, values) {
    try {
      var result = fn(values);
      Object.keys(result).forEach(function (key) {
        if (typeof result[key] === "number" && !finite(result[key])) {
          throw new Error("計算結果不是有限數值");
        }
      });
      return { ok: true, value: result };
    } catch (error) {
      return { ok: false, error: error && error.message ? error.message : "輸入或計算無效" };
    }
  }

  function calculateTransmission(v) {
    var p = assertNumber(v["transmit-power"], "輸電功率", "positive");
    var pf = assertNumber(v["transmit-pf"], "功率因數", "pf");
    var r = assertNumber(v["transmit-resistance"], "每相電阻", "positive");
    var low = assertNumber(v["voltage-low"], "低壓", "positive");
    var high = assertNumber(v["voltage-high"], "高壓", "positive");
    var currentLow = p * 1000 / (SQRT3 * low * pf);
    var currentHigh = p * 1000 / (SQRT3 * high * pf);
    var lossLow = 3 * currentLow * currentLow * r / 1000000;
    var lossHigh = 3 * currentHigh * currentHigh * r / 1000000;
    if (!finite(currentLow) || !finite(currentHigh) || !finite(lossLow) || !finite(lossHigh) || lossHigh <= 0) {
      throw new Error("輸電計算結果無效");
    }
    return { currentLow: currentLow, currentHigh: currentHigh, lossLow: lossLow, lossHigh: lossHigh, lossRatio: lossLow / lossHigh, voltageRatio: high / low };
  }

  function calculatePerUnit(v) {
    var sb = assertNumber(v["base-power"], "基準功率", "positive");
    var vb = assertNumber(v["base-voltage"], "基準電壓", "positive");
    var va = assertNumber(v["actual-voltage"], "實際電壓", "positive");
    var za = assertNumber(v["actual-impedance"], "實際阻抗", "nonnegative");
    var oldZ = assertNumber(v["old-zpu"], "舊標么阻抗", "nonnegative");
    var oldS = assertNumber(v["old-base-power"], "舊基準功率", "positive");
    var oldV = assertNumber(v["old-base-voltage"], "舊基準電壓", "positive");
    var newS = assertNumber(v["new-base-power"], "新基準功率", "positive");
    var newV = assertNumber(v["new-base-voltage"], "新基準電壓", "positive");
    var baseCurrent = sb * 1000 / (SQRT3 * vb);
    var baseZ = vb * vb / sb;
    return {
      baseCurrent: baseCurrent, baseImpedance: baseZ, voltagePu: va / vb,
      impedancePu: za / baseZ, convertedZpu: oldZ * (newS / oldS) * Math.pow(oldV / newV, 2)
    };
  }

  function calculateThreePhase(v) {
    var voltage = assertNumber(v["pf-voltage"], "線電壓", "positive");
    var power = assertNumber(v["pf-real-power"], "實功率", "positive");
    var initial = assertNumber(v["pf-initial"], "初始功因", "pf");
    var target = assertNumber(v["pf-target"], "目標功因", "pf");
    if (target < initial) {
      throw new Error("目標功因不可低於初始功因");
    }
    var currentInitial = power / (SQRT3 * voltage * initial);
    var currentTarget = power / (SQRT3 * voltage * target);
    var reactiveInitial = power * Math.tan(Math.acos(initial));
    var reactiveTarget = power * Math.tan(Math.acos(target));
    var capacitor = reactiveInitial - reactiveTarget;
    var reduction = (1 - Math.pow(currentTarget / currentInitial, 2)) * 100;
    if (capacitor < -1e-9 || !finite(reduction)) {
      throw new Error("補償結果無效");
    }
    return { currentInitial: currentInitial, currentTarget: currentTarget, reactiveInitial: reactiveInitial, reactiveTarget: reactiveTarget, capacitor: Math.max(0, capacitor), lossReduction: reduction };
  }

  function calculateFlow(v) {
    var generation = assertNumber(v["flow-generation"], "Bus 2 發電", "nonnegative");
    var load = assertNumber(v["flow-load"], "Bus 3 負載", "nonnegative");
    var contingency = typeof v.contingency === "string" ? v.contingency : "";
    var lines = [
      { id: "line-12", name: "1–2", i: 1, k: 2, x: 0.20, limit: 80 },
      { id: "line-13", name: "1–3", i: 1, k: 3, x: 0.25, limit: 80 },
      { id: "line-23", name: "2–3", i: 2, k: 3, x: 0.40, limit: 70 }
    ];
    lines.forEach(function (line) { line.active = contingency !== line.id; });
    var b22 = 0;
    var b33 = 0;
    var b23 = 0;
    lines.forEach(function (line) {
      if (!line.active) return;
      var b = 1 / line.x;
      if (line.i === 2) b22 += b;
      if (line.k === 2) b22 += b;
      if (line.i === 3) b33 += b;
      if (line.k === 3) b33 += b;
      if ((line.i === 2 && line.k === 3) || (line.i === 3 && line.k === 2)) b23 -= b;
    });
    var determinant = b22 * b33 - b23 * b23;
    if (!finite(determinant) || Math.abs(determinant) < 1e-10) {
      throw new Error("線路跳脫造成孤島，2×2 潮流矩陣不可解");
    }
    var p2 = generation / 100;
    var p3 = -load / 100;
    var theta2 = (p2 * b33 - b23 * p3) / determinant;
    var theta3 = (b22 * p3 - b23 * p2) / determinant;
    var theta = { 1: 0, 2: theta2, 3: theta3 };
    var flows = {};
    lines.forEach(function (line) {
      flows[line.id] = line.active ? (theta[line.i] - theta[line.k]) / line.x * 100 : 0;
    });
    var states = lines.map(function (line) {
      var state = !line.active ? "out" : Math.abs(flows[line.id]) > line.limit + 1e-9 ? "over" : "ok";
      return { id: line.id, name: line.name, flow: flows[line.id], limit: line.limit, state: state };
    });
    return { slack: load - generation, theta2: theta2 * 180 / Math.PI, theta3: theta3 * 180 / Math.PI, flows: flows, states: states, contingency: contingency };
  }

  function calculateFault(v) {
    var type = typeof v["fault-type"] === "string" ? v["fault-type"] : "";
    if (["three-phase", "slg", "line-line"].indexOf(type) < 0) throw new Error("故障類型無效");
    var vf = assertNumber(v["fault-voltage"], "故障電壓", "positive");
    var z1 = assertNumber(v["z-positive"], "正序阻抗", "nonnegative");
    var z2 = assertNumber(v["z-negative"], "負序阻抗", "nonnegative");
    var z0 = assertNumber(v["z-zero"], "零序阻抗", "nonnegative");
    var sb = assertNumber(v["fault-base-power"], "故障基準功率", "positive");
    var vb = assertNumber(v["fault-base-voltage"], "故障基準電壓", "positive");
    var usedSum;
    var current;
    var sequence;
    if (type === "three-phase") {
      usedSum = z1; current = vf / usedSum;
      sequence = ["使用：正序", "不使用", "不使用"]; 
    } else if (type === "slg") {
      usedSum = z1 + z2 + z0; current = 3 * vf / usedSum;
      sequence = ["使用：正序串聯", "使用：負序串聯", "使用：零序串聯"];
    } else {
      usedSum = z1 + z2; current = SQRT3 * vf / usedSum;
      sequence = ["使用：正序", "使用：負序", "不使用"]; 
    }
    if (!finite(usedSum) || usedSum <= 0 || !finite(current)) throw new Error("使用中的序網阻抗和必須大於 0");
    var baseCurrentKa = sb / (SQRT3 * vb);
    return { sequence: sequence, currentPu: current, currentKa: current * baseCurrentKa, baseCurrentKa: baseCurrentKa, type: type };
  }

  function relayTime(current, pickup, tms) {
    if (current <= pickup) return null;
    var denominator = current / pickup - 1;
    if (!finite(denominator) || denominator <= 0) throw new Error("反時限分母無效");
    return tms / denominator;
  }

  function calculateProtection(v) {
    var current = assertNumber(v["relay-fault-current"], "故障電流", "positive");
    var mainPickup = assertNumber(v["relay-main-pickup"], "主保護拾取", "positive");
    var mainTms = assertNumber(v["relay-main-tms"], "主保護 TMS", "positive");
    var backupPickup = assertNumber(v["relay-backup-pickup"], "後備保護拾取", "positive");
    var backupTms = assertNumber(v["relay-backup-tms"], "後備保護 TMS", "positive");
    var target = assertNumber(v["relay-margin-target"], "目標裕度", "nonnegative");
    var mainTime = relayTime(current, mainPickup, mainTms);
    var backupTime = relayTime(current, backupPickup, backupTms);
    if (mainTime === null || backupTime === null) {
      return { mainTime: mainTime, backupTime: backupTime, margin: null, ok: false, reason: "至少一個電驛未拾取", target: target };
    }
    var margin = backupTime - mainTime;
    var ok = backupTime > mainTime && margin >= target;
    return { mainTime: mainTime, backupTime: backupTime, margin: margin, ok: ok, reason: ok ? "協調通過" : "後備延遲或裕度不足", target: target };
  }

  function calculateStabilityAngle(v) {
    var pm = assertNumber(v["stability-pm"], "機械輸入功率", "nonnegative");
    var pre = assertNumber(v["stability-pre-max"], "故障前最大功率", "positive");
    var fault = assertNumber(v["stability-fault-max"], "故障期間最大功率", "nonnegative");
    var post = assertNumber(v["stability-post-max"], "故障後最大功率", "positive");
    var h = assertNumber(v["stability-h"], "慣性常數", "positive");
    var clearingTime = assertNumber(v["clearing-time"], "清除時間", "nonnegative");
    if (clearingTime > 5) throw new Error("清除時間須介於 0 與 5 秒之間");
    if (pm >= pre || pm >= post) throw new Error("故障前或故障後沒有穩定平衡點");
    var delta0 = Math.asin(pm / pre);
    var deltaU = Math.PI - Math.asin(pm / post);
    var delta = delta0;
    var speed = 0;
    var elapsed = 0;
    var omegaS = 2 * Math.PI * 60;
    while (elapsed < clearingTime - 1e-12) {
      var step = Math.min(DT, clearingTime - elapsed);
      var acceleration = omegaS * (pm - fault * Math.sin(delta)) / (2 * h);
      if (!finite(acceleration)) throw new Error("擺動方程積分失敗");
      speed += acceleration * step;
      delta += speed * step;
      elapsed += step;
    }
    var acceleratingArea = pm * (delta - delta0) + fault * (Math.cos(delta) - Math.cos(delta0));
    var deceleratingArea = post * (Math.cos(delta) - Math.cos(deltaU)) - pm * (deltaU - delta);
    var stable = deceleratingArea >= acceleratingArea && delta < deltaU;
    return { initialAngle: delta0 * 180 / Math.PI, clearingAngle: delta * 180 / Math.PI, acceleratingArea: acceleratingArea, deceleratingArea: deceleratingArea, stable: stable, deltaU: deltaU };
  }

  function calculateFrequency(v) {
    var f0 = assertNumber(v["frequency-nominal"], "額定頻率", "positive");
    var h = assertNumber(v["frequency-h"], "頻率慣性常數", "positive");
    var step = assertNumber(v["frequency-step"], "功率階躍", "nonnegative");
    var droop = assertNumber(v["frequency-droop"], "下垂係數 R", "positive");
    var damping = assertNumber(v["frequency-damping"], "負載阻尼 D", "nonnegative");
    var rocof = -f0 * step / (2 * h);
    var denominator = damping + 1 / droop;
    if (!finite(denominator) || denominator <= 0) throw new Error("下垂與阻尼分母無效");
    var deltaPu = -step / denominator;
    var steady = f0 * (1 + deltaPu);
    return { rocof: rocof, steady: steady, deltaPu: deltaPu };
  }

  function calculateDispatch(v) {
    var load = assertNumber(v["dispatch-load"], "系統負載", "positive");
    var renewable = assertNumber(v["dispatch-renewable"], "再生能源", "nonnegative");
    var storage = assertNumber(v["dispatch-storage"], "儲能出力", "finite");
    var reserve = assertNumber(v["dispatch-reserve"], "備轉要求", "nonnegative");
    var g1 = makeGenerator(v, "1");
    var g2 = makeGenerator(v, "2");
    var net = load - renewable - storage;
    var minSum = g1.min + g2.min;
    var maxSum = g1.max + g2.max;
    var p1;
    var p2;
    var lambda = null;
    var mode;
    if (net < minSum) {
      p1 = g1.min; p2 = g2.min; mode = "surplus";
    } else if (net > maxSum) {
      p1 = g1.max; p2 = g2.max; mode = "shortage";
    } else {
      var solution = activeSet(g1, g2, net);
      if (!solution) throw new Error("無法找到符合上下限的經濟調度解");
      p1 = solution.p1; p2 = solution.p2; lambda = solution.lambda; mode = "ok";
    }
    var cost = g1.a * p1 * p1 + g1.b * p1 + g2.a * p2 * p2 + g2.b * p2;
    var headroom = g1.max + g2.max - p1 - p2;
    var reserveOk = mode === "ok" && headroom >= reserve;
    return { net: net, p1: p1, p2: p2, lambda: lambda, cost: cost, headroom: headroom, reserveOk: reserveOk, mode: mode, reserve: reserve };
  }

  function makeGenerator(v, suffix) {
    var a = assertNumber(v["g" + suffix + "-a"], "G" + suffix + " 二次成本係數", "positive");
    var b = assertNumber(v["g" + suffix + "-b"], "G" + suffix + " 一次成本係數", "finite");
    var min = assertNumber(v["g" + suffix + "-min"], "G" + suffix + " 最小出力", "nonnegative");
    var max = assertNumber(v["g" + suffix + "-max"], "G" + suffix + " 最大出力", "positive");
    if (max < min) throw new Error("G" + suffix + " 最大出力不可小於最小出力");
    return { a: a, b: b, min: min, max: max };
  }

  function activeSet(g1, g2, load) {
    var generators = [g1, g2];
    var states = ["min", "free", "max"];
    var candidates = [];
    states.forEach(function (s1) {
      states.forEach(function (s2) {
        var state = [s1, s2];
        var free = state.map(function (s) { return s === "free"; });
        var fixed = state.map(function (s, i) { return s === "min" ? generators[i].min : s === "max" ? generators[i].max : null; });
        var p = [fixed[0], fixed[1]];
        var lambda = null;
        if (free[0] && free[1]) {
          var denominator = 1 / (2 * g1.a) + 1 / (2 * g2.a);
          lambda = (load + g1.b / (2 * g1.a) + g2.b / (2 * g2.a)) / denominator;
          p[0] = (lambda - g1.b) / (2 * g1.a);
          p[1] = (lambda - g2.b) / (2 * g2.a);
        } else if (free[0] || free[1]) {
          var i = free[0] ? 0 : 1;
          var j = 1 - i;
          p[i] = load - p[j];
          lambda = 2 * generators[i].a * p[i] + generators[i].b;
        } else if (Math.abs(p[0] + p[1] - load) > 1e-8) {
          return;
        }
        if (!finite(p[0]) || !finite(p[1]) || p[0] < g1.min - 1e-8 || p[0] > g1.max + 1e-8 || p[1] < g2.min - 1e-8 || p[1] > g2.max + 1e-8) return;
        if (lambda !== null) {
          for (var i = 0; i < 2; i += 1) {
            var marginal = 2 * generators[i].a * p[i] + generators[i].b;
            if (state[i] === "min" && marginal < lambda - 1e-7) return;
            if (state[i] === "max" && marginal > lambda + 1e-7) return;
            if (state[i] === "free" && Math.abs(marginal - lambda) > 1e-6) return;
          }
        }
        candidates.push({ p1: p[0], p2: p[1], lambda: lambda });
      });
    });
    if (!candidates.length) return null;
    candidates.sort(function (left, right) {
      var leftCost = g1.a * left.p1 * left.p1 + g1.b * left.p1 + g2.a * left.p2 * left.p2 + g2.b * left.p2;
      var rightCost = g1.a * right.p1 * right.p1 + g1.b * right.p1 + g2.a * right.p2 * right.p2 + g2.b * right.p2;
      return leftCost - rightCost;
    });
    return candidates[0];
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
    if (element) element.textContent = String(value);
  }

  function setState(doc, id, state) {
    var element = safeGet(doc, id);
    if (!element) return;
    var colors = { ok: "#26734d", warn: "#9a6700", error: "#a33a3a", neutral: "#56616b" };
    if (element.dataset) element.dataset.state = state;
    if (element.classList && element.classList.contains("status-box")) {
      ["status-ok", "status-warn", "status-error"].forEach(function (name) {
        element.classList.remove(name);
      });
      if (state === "ok") element.classList.add("status-ok");
      if (state === "warn") element.classList.add("status-warn");
      if (state === "error") element.classList.add("status-error");
    }
    if (element.style) {
      element.style.borderLeftColor = colors[state] || colors.neutral;
      element.style.color = colors[state] || colors.neutral;
    }
    if (typeof element.setAttribute === "function") element.setAttribute("aria-live", "polite");
  }

  function clearOutputs(doc, ids) {
    ids.forEach(function (id) { setText(doc, id, "—"); });
  }

  function setFeedback(doc, id, message, state) {
    setText(doc, id, message);
    setState(doc, id, state);
  }

  function readFields(doc, specs) {
    var values = {};
    for (var i = 0; i < specs.length; i += 1) {
      var spec = specs[i];
      var element = safeGet(doc, spec[0]);
      if (!element) return { ok: false, error: "找不到輸入欄位：" + spec[0] };
      var raw = element.value;
      if (spec[2] === "select") {
        if (typeof raw !== "string" || !raw.trim()) return { ok: false, error: spec[1] + " 不可為空白" };
        values[spec[0]] = raw;
        continue;
      }
      if (raw === null || raw === undefined || String(raw).trim() === "") return { ok: false, error: spec[1] + " 不可為空白" };
      var number = Number(raw);
      if (!finite(number)) return { ok: false, error: spec[1] + " 必須是有限數值" };
      values[spec[0]] = number;
    }
    return { ok: true, value: values };
  }

  function calculateFromDom(doc, specs, calculator) {
    var fields = readFields(doc, specs);
    if (!fields.ok) return fields;
    return checked(calculator, fields.value);
  }

  function format(value, digits, unit) {
    if (!finite(value)) return "—";
    return value.toFixed(digits) + (unit ? " " + unit : "");
  }

  function renderTransmission(doc, result) {
    setText(doc, "current-low", format(result.currentLow, 1, "A"));
    setText(doc, "current-high", format(result.currentHigh, 1, "A"));
    setText(doc, "loss-low", format(result.lossLow, 3, "MW"));
    setText(doc, "loss-high", format(result.lossHigh, 3, "MW"));
    setText(doc, "loss-ratio", format(result.lossRatio, 1, "倍"));
    setFeedback(doc, "transmission-feedback", "✓ 電壓比為 " + format(result.voltageRatio, 2, "倍") + "；同功率下電流按電壓反比、電阻線損按電流平方下降。此簡化模型不含電暈、無功、穩定與設備成本。", "ok");
  }

  function renderPerUnit(doc, result) {
    setText(doc, "base-current", format(result.baseCurrent, 1, "A"));
    setText(doc, "base-impedance", format(result.baseImpedance, 2, "Ω"));
    setText(doc, "voltage-pu", format(result.voltagePu, 4, "p.u."));
    setText(doc, "impedance-pu", format(result.impedancePu, 4, "p.u."));
    setText(doc, "converted-zpu", format(result.convertedZpu, 4, "p.u."));
    setFeedback(doc, "perunit-feedback", "✓ 基準電流與基準阻抗先由基準 MVA/kV 建立，再將實際量除以基準量；換基準時阻抗按功率比與電壓比平方換算。", "ok");
  }

  function renderThreePhase(doc, result) {
    setText(doc, "current-initial", format(result.currentInitial, 2, "A"));
    setText(doc, "current-target", format(result.currentTarget, 2, "A"));
    setText(doc, "reactive-initial", format(result.reactiveInitial, 2, "kvar"));
    setText(doc, "reactive-target", format(result.reactiveTarget, 2, "kvar"));
    setText(doc, "capacitor-kvar", format(result.capacitor, 2, "kvar"));
    setText(doc, "loss-reduction", format(result.lossReduction, 2, "%"));
    var initialBar = safeAll(doc, ".bar-fill-warm")[0];
    var targetBar = safeAll(doc, ".bar-fill-cool")[0];
    if (initialBar && initialBar.style) initialBar.style.width = "100%";
    if (targetBar && targetBar.style) targetBar.style.width = Math.max(0, Math.min(100, result.currentTarget / result.currentInitial * 100)).toFixed(1) + "%";
    setFeedback(doc, "threephase-feedback", "✓ kW 是負載真正消耗的實功率；功因改善降低 kvar 與 kVA，使同電阻下電流平方線損下降，但不降低負載本身的 kW。", "ok");
  }

  function renderFlow(doc, result) {
    setText(doc, "slack-power", format(result.slack, 1, "MW"));
    setText(doc, "angle-bus-2", format(result.theta2, 4, "°"));
    setText(doc, "angle-bus-3", format(result.theta3, 4, "°"));
    result.states.forEach(function (line) {
      var outputId = "flow-" + line.id.slice(-2);
      var output = safeGet(doc, outputId);
      var direction = line.flow < -1e-9 ? "←" : line.flow > 1e-9 ? "→" : "";
      setText(doc, outputId, line.state === "out" ? "跳脫" : format(Math.abs(line.flow), 2, "MW") + (direction ? " " + direction : ""));
      var row = output && typeof output.closest === "function" ? output.closest(".line-row") : null;
      if (!row) return;
      var utilizationBar = safeAll(row, ".utilization i")[0];
      var utilizationText = safeAll(row, ".utilization em")[0];
      var stateElement = safeAll(row, ".state")[0];
      var utilization = line.state === "out" ? 0 : Math.abs(line.flow) / line.limit * 100;
      if (utilizationBar && utilizationBar.style) utilizationBar.style.width = Math.min(100, utilization).toFixed(1) + "%";
      if (utilizationText) utilizationText.textContent = line.state === "out" ? "—" : utilization.toFixed(1) + "%";
      if (stateElement) {
        stateElement.textContent = line.state === "ok" ? "● 正常" : line.state === "out" ? "⊘ 跳脫" : "⚠ 過載";
        if (stateElement.classList) {
          stateElement.classList.toggle("state-ok", line.state === "ok");
          stateElement.classList.toggle("state-warn", line.state !== "ok");
        }
      }
    });
    var hasOverload = result.states.some(function (line) { return line.state === "over"; });
    var status = result.states.map(function (line) {
      var label = line.state === "ok" ? "正常" : line.state === "out" ? "跳脫" : "過載";
      return line.name + " " + label;
    }).join("；");
    setText(doc, "flow-status", status);
    setState(doc, "flow-status", hasOverload ? "warn" : "ok");
    setFeedback(doc, "flow-feedback", hasOverload ? "⚠ N-1 不通過：至少一條在線路限額上超載。DC 潮流忽略電阻、損失、無功與電壓幅值變化，Slack 自動補平衡。" : "✓ 所有在線路均未超過限額；Slack 自動補足發電與負載差額。", hasOverload ? "warn" : "ok");
  }

  function renderFault(doc, result) {
    ["sequence-positive", "sequence-negative", "sequence-zero"].forEach(function (id, index) {
      var element = safeGet(doc, id);
      var used = result.sequence[index].indexOf("不使用") !== 0;
      setText(doc, id, result.sequence[index]);
      if (element && element.classList) {
        element.classList.toggle("sequence-used", used);
        element.classList.toggle("sequence-unused", !used);
      }
    });
    setText(doc, "fault-current-pu", format(result.currentPu, 3, "p.u."));
    setText(doc, "fault-current-ka", format(result.currentKa, 4, "kA"));
    setFeedback(doc, "fault-feedback", "✓ 故障型態決定序網的使用與串接；故障電流標么值再乘以基準電流，得到 kA。", "ok");
  }

  function renderProtection(doc, result) {
    setText(doc, "relay-main-time", result.mainTime === null ? "不拾取" : format(result.mainTime, 3, "s"));
    setText(doc, "relay-backup-time", result.backupTime === null ? "不拾取" : format(result.backupTime, 3, "s"));
    setText(doc, "relay-margin", result.margin === null ? "—" : format(result.margin, 3, "s"));
    var relayBars = safeAll(doc, ".relay-ladder .time-track i");
    var maximum = Math.max(result.mainTime || 0, result.backupTime || 0);
    [result.mainTime, result.backupTime].forEach(function (time, index) {
      if (relayBars[index] && relayBars[index].style) relayBars[index].style.width = maximum > 0 && time !== null ? Math.max(4, time / maximum * 100).toFixed(1) + "%" : "0%";
    });
    setText(doc, "relay-status", result.ok ? "協調通過" : result.reason);
    setState(doc, "relay-status", result.ok ? "ok" : "warn");
    setFeedback(doc, "relay-feedback", result.ok ? "✓ 主保護先動作，後備保護延遲 " + format(result.margin, 3, "s") + "，達到目標裕度；這是無量綱反時限教學曲線，不是 IEC/IEEE 實際曲線。" : "⚠ " + result.reason + "；保護協調需同時滿足選擇性與後備關係。這是無量綱反時限教學曲線，不是 IEC/IEEE 實際曲線。", result.ok ? "ok" : "warn");
  }

  function renderStabilityAngle(doc, result) {
    setText(doc, "initial-angle", format(result.initialAngle, 2, "°"));
    setText(doc, "clearing-angle", format(result.clearingAngle, 2, "°"));
    setText(doc, "accelerating-area", format(result.acceleratingArea, 4, "p.u.·rad"));
    setText(doc, "decelerating-area", format(result.deceleratingArea, 4, "p.u.·rad"));
    setText(doc, "stability-status", result.stable ? "暫態穩定" : "暫態不穩定");
    setState(doc, "stability-status", result.stable ? "ok" : "warn");
    return result.stable ? "✓ 清除角小於不穩定平衡角，最大減速面積大於加速面積，因此此教學案例穩定。" : "⚠ 最大減速面積不足或清除角超過不穩定平衡角，因此此教學案例不穩定。";
  }

  function renderFrequency(doc, result) {
    setText(doc, "frequency-rocof", format(result.rocof, 3, "Hz/s"));
    setText(doc, "frequency-steady", format(result.steady, 3, "Hz"));
    return "✓ RoCoF 由慣性與功率階躍決定；一次調頻後頻率由下垂與負載阻尼共同決定。本模型不含 governor 時間常數、AGC、限幅與負載卸除。";
  }

  function renderDispatch(doc, result) {
    setText(doc, "net-load", format(result.net, 2, "MW"));
    setText(doc, "g1-output", format(result.p1, 2, "MW"));
    setText(doc, "g2-output", format(result.p2, 2, "MW"));
    setText(doc, "dispatch-lambda", result.lambda === null ? "—" : format(result.lambda, 3, "成本/MW"));
    setText(doc, "dispatch-cost", format(result.cost, 2, "教學單位/小時"));
    setText(doc, "reserve-headroom", format(result.headroom, 2, "MW"));
    var state;
    var message;
    if (result.mode === "surplus") {
      state = "warn"; message = "淨負載低於機組最小出力總和，需削減再生能源或停機；目前顯示機組最小出力。";
    } else if (result.mode === "shortage") {
      state = "error"; message = "淨負載高於機組最大出力總和，容量不足。";
    } else if (!result.reserveOk) {
      state = "warn"; message = "調度解可滿足淨負載，但向上餘裕低於備轉要求。";
    } else {
      state = "ok"; message = "兩機以等增量成本解並以 active-set 處理上下限；向上餘裕高於備轉要求。";
    }
    setText(doc, "dispatch-status", state === "ok" ? "可行且備轉足夠" : message);
    setState(doc, "dispatch-status", state);
    setFeedback(doc, "dispatch-feedback", message + " 此模型不含 UC、網損與真實市場出清。", state);
  }

  function renderError(doc, outputIds, feedbackId, error) {
    clearOutputs(doc, outputIds);
    setFeedback(doc, feedbackId, "✕ 輸入錯誤：" + error, "error");
  }

  function runModule(doc, key) {
    var calculation;
    if (key === "transmission") calculation = calculateFromDom(doc, FIELD_SPECS.transmission, calculateTransmission);
    if (key === "perunit") calculation = calculateFromDom(doc, FIELD_SPECS.perunit, calculatePerUnit);
    if (key === "threephase") calculation = calculateFromDom(doc, FIELD_SPECS.threephase, calculateThreePhase);
    if (key === "flow") {
      var flowFields = readFields(doc, FIELD_SPECS.flow);
      if (flowFields.ok) {
        var contingency = safeGet(doc, "contingency");
        if (!contingency || typeof contingency.value !== "string" || !contingency.value.trim()) flowFields = { ok: false, error: "跳脫情境不可為空白" };
        else flowFields.value.contingency = contingency.value;
      }
      calculation = flowFields.ok ? checked(calculateFlow, flowFields.value) : flowFields;
    }
    if (key === "fault") {
      var faultFields = readFields(doc, FIELD_SPECS.fault);
      var faultType = safeGet(doc, "fault-type");
      if (faultFields.ok && faultType && typeof faultType.value === "string" && faultType.value.trim()) faultFields.value["fault-type"] = faultType.value;
      else if (faultFields.ok) faultFields = { ok: false, error: "故障類型不可為空白" };
      calculation = faultFields.ok ? checked(calculateFault, faultFields.value) : faultFields;
    }
    if (key === "protection") calculation = calculateFromDom(doc, FIELD_SPECS.protection, calculateProtection);
    if (key === "dispatch") calculation = calculateFromDom(doc, FIELD_SPECS.dispatch, calculateDispatch);
    if (!calculation) return;
    if (!calculation.ok) {
      var ids = OUTPUTS[key] || [];
      renderError(doc, ids, key === "transmission" ? "transmission-feedback" : key === "perunit" ? "perunit-feedback" : key === "threephase" ? "threephase-feedback" : key === "flow" ? "flow-feedback" : key === "fault" ? "fault-feedback" : key === "protection" ? "relay-feedback" : "dispatch-feedback", calculation.error);
      var statusId = key === "flow" ? "flow-status" : key === "protection" ? "relay-status" : key === "dispatch" ? "dispatch-status" : null;
      if (statusId) setState(doc, statusId, "error");
      return;
    }
    if (key === "transmission") renderTransmission(doc, calculation.value);
    if (key === "perunit") renderPerUnit(doc, calculation.value);
    if (key === "threephase") renderThreePhase(doc, calculation.value);
    if (key === "flow") renderFlow(doc, calculation.value);
    if (key === "fault") renderFault(doc, calculation.value);
    if (key === "protection") renderProtection(doc, calculation.value);
    if (key === "dispatch") renderDispatch(doc, calculation.value);
  }

  function runStability(doc) {
    var angle = calculateFromDom(doc, FIELD_SPECS.stabilityAngle, calculateStabilityAngle);
    var frequency = calculateFromDom(doc, FIELD_SPECS.stabilityFrequency, calculateFrequency);
    if (angle.ok) {
      var angleFeedback = renderStabilityAngle(doc, angle.value);
      setFeedback(doc, "stability-feedback", angleFeedback, angle.value.stable ? "ok" : "warn");
    } else {
      clearOutputs(doc, OUTPUTS.stabilityAngle);
      setText(doc, "stability-status", "✕ 無法判定");
      setState(doc, "stability-status", "error");
      setFeedback(doc, "stability-feedback", "✕ 輸入錯誤：" + angle.error, "error");
    }
    if (frequency.ok) {
      var frequencyFeedback = renderFrequency(doc, frequency.value);
      setFeedback(doc, "frequency-feedback", frequencyFeedback, "ok");
    } else {
      clearOutputs(doc, OUTPUTS.stabilityFrequency);
      setFeedback(doc, "frequency-feedback", "✕ 輸入錯誤：" + frequency.error, "error");
    }
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
    try { store.setItem(STORAGE_KEY, JSON.stringify({ completed: completed })); } catch (error) { /* 儲存失敗不阻斷操作 */ }
  }

  function updateProgress(doc, root, completed) {
    var count = MODULE_KEYS.filter(function (key) { return completed[key] === true; }).length;
    var total = MODULE_KEYS.length;
    var fill = safeGet(doc, "progress-fill");
    var track = safeAll(doc, ".progress-track")[0];
    var label = safeGet(doc, "progress-label");
    if (label) label.textContent = count + " / " + total + " 個模組完成";
    if (fill) {
      if (fill.style) fill.style.width = (count / total * 100).toFixed(2) + "%";
    }
    if (track && typeof track.setAttribute === "function") {
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", String(total));
      track.setAttribute("aria-valuenow", String(count));
      track.setAttribute("aria-valuetext", count + " / " + total + " 個模組完成");
    }
    safeAll(doc, "[data-complete]").forEach(function (button) {
      var key = button.getAttribute("data-complete");
      var done = completed[key] === true;
      if (typeof button.setAttribute === "function") button.setAttribute("aria-pressed", done ? "true" : "false");
      if (button.dataset) button.dataset.state = done ? "complete" : "incomplete";
      if (button.classList) button.classList.toggle("is-complete", done);
      button.textContent = done ? "已完成" : "標記完成";
    });
    safeAll(doc, "[data-nav]").forEach(function (button) {
      var done = completed[button.getAttribute("data-nav")] === true;
      if (button.classList) button.classList.toggle("is-complete", done);
      var mark = safeAll(button, ".nav-mark")[0];
      if (mark) mark.textContent = done ? "●" : "○";
    });
    return completed;
  }

  function activateModule(doc, key) {
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
  }

  function setStabilityMode(doc, mode) {
    mode = mode === "frequency" ? "frequency" : "angle";
    safeAll(doc, "[data-stability-mode]").forEach(function (button) {
      var active = button.getAttribute("data-stability-mode") === mode;
      if (button.classList) button.classList.toggle("is-selected", active);
      if (typeof button.setAttribute === "function") button.setAttribute("aria-pressed", active ? "true" : "false");
      if (button.dataset) button.dataset.active = active ? "true" : "false";
    });
    safeAll(doc, "[data-stability-panel]").forEach(function (panel) {
      var active = panel.getAttribute("data-stability-panel") === mode;
      panel.hidden = !active;
      if (panel.classList) panel.classList.toggle("is-hidden", !active);
      if (typeof panel.setAttribute === "function") panel.setAttribute("aria-hidden", active ? "false" : "true");
    });
    var section = safeAll(doc, '[data-module="stability"]')[0];
    if (section && section.dataset) section.dataset.stabilityMode = mode;
    runStability(doc);
  }

  function bindActivatable(element, handler) {
    if (!element || typeof element.addEventListener !== "function") return;
    element.addEventListener("click", handler);
    var tag = String(element.tagName || "").toLowerCase();
    if (tag !== "button" && tag !== "a") {
      if (typeof element.setAttribute === "function") element.setAttribute("role", "button");
      element.tabIndex = 0;
      element.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault(); handler(event);
        }
      });
    }
  }

  function init(doc, root) {
    if (!doc) return;
    var completed = readProgress(root || (typeof window !== "undefined" ? window : null));
    var activeModule = safeAll(doc, "[data-module]").map(function (section) { return section.getAttribute("data-module"); }).filter(function (key) { return MODULE_KEYS.indexOf(key) >= 0; })[0];
    if (activeModule) activateModule(doc, activeModule);
    safeAll(doc, "[data-nav]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () { activateModule(doc, button.getAttribute("data-nav")); });
    });
    safeAll(doc, "[data-complete]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () {
        var key = button.getAttribute("data-complete");
        if (MODULE_KEYS.indexOf(key) < 0) return;
        completed[key] = completed[key] !== true;
        saveProgress(root || (typeof window !== "undefined" ? window : null), completed);
        updateProgress(doc, root, completed);
      });
    });
    var resetProgress = safeGet(doc, "reset-progress");
    if (resetProgress) {
      bindActivatable(resetProgress, function () {
        completed = {};
        saveProgress(root || (typeof window !== "undefined" ? window : null), completed);
        updateProgress(doc, root, completed);
      });
    }
    safeAll(doc, "[data-reset-module]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () {
        var key = button.getAttribute("data-reset-module");
        var defaults = DEFAULTS[key];
        if (!defaults) return;
        Object.keys(defaults).forEach(function (id) { var input = safeGet(doc, id); if (input) input.value = String(defaults[id]); });
        if (key === "stability") setStabilityMode(doc, "angle");
        else runModule(doc, key);
      });
    });
    safeAll(doc, "[data-stability-mode]").forEach(function (button) {
      if (String(button.tagName || "").toLowerCase() === "button") button.setAttribute("type", "button");
      bindActivatable(button, function () { setStabilityMode(doc, button.getAttribute("data-stability-mode")); });
    });
    var inputToModule = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      var ids = Object.keys(DEFAULTS[key]);
      ids.forEach(function (id) { inputToModule[id] = key; });
    });
    Object.keys(inputToModule).forEach(function (id) {
      var input = safeGet(doc, id);
      if (!input || typeof input.addEventListener !== "function") return;
      ["input", "change"].forEach(function (eventName) {
        input.addEventListener(eventName, function () {
          var key = inputToModule[id];
          if (key === "stability") runStability(doc); else runModule(doc, key);
        });
      });
    });
    updateProgress(doc, root || (typeof window !== "undefined" ? window : null), completed);
    MODULE_KEYS.forEach(function (key) {
      if (key === "stability") runStability(doc); else runModule(doc, key);
    });
    setStabilityMode(doc, "angle");
  }

  return {
    defaults: DEFAULTS,
    calculateTransmission: function (values) { return checked(calculateTransmission, values).value; },
    calculatePerUnit: function (values) { return checked(calculatePerUnit, values).value; },
    calculateThreePhase: function (values) { return checked(calculateThreePhase, values).value; },
    calculateFlow: function (values) { return checked(calculateFlow, values).value; },
    calculateFault: function (values) { return checked(calculateFault, values).value; },
    calculateProtection: function (values) { return checked(calculateProtection, values).value; },
    calculateStabilityAngle: function (values) { return checked(calculateStabilityAngle, values).value; },
    calculateFrequency: function (values) { return checked(calculateFrequency, values).value; },
    calculateDispatch: function (values) { return checked(calculateDispatch, values).value; },
    init: init
  };
}));

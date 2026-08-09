(function (root, factory) {
  "use strict";

  var api = factory();
  var isCommonJs = typeof module !== "undefined" && module.exports;
  if (isCommonJs) {
    module.exports = api;
  } else if (root) {
    root.IotFirmwareRtosLogic = api;
    if (root.document && typeof api.init === "function") {
      api.init(root.document, root);
    }
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var MODULE_KEYS = [
    "architecture", "event-loop", "interrupts", "driver-io",
    "scheduler", "synchronization", "low-power", "reliability"
  ];
  var STORAGE_KEY = "engineerStudy.iotFirmwareRtos.v1";
  var RM_BOUND = 3 * (Math.pow(2, 1 / 3) - 1);

  var DEFAULTS = {
    architecture: {
      "arch-task-count": 3, "arch-deadline-count": 2,
      "arch-blocking-flows": 2, "arch-ram-kb": 64, "arch-team-size": 2
    },
    "event-loop": {
      "loop-sensor-ms": 2, "loop-protocol-ms": 3, "loop-log-ms": 1,
      "loop-busy-ms": 0, "loop-deadline-ms": 10
    },
    interrupts: {
      "irq-disabled-us": 12, "irq-higher-duration-us": 18,
      "irq-higher-count": 2, "irq-entry-us": 2, "irq-handler-us": 15,
      "irq-rate-hz": 1000, "irq-deadline-us": 100
    },
    "driver-io": {
      "io-bytes": 256, "io-rate": 500, "io-cycles-byte": 80,
      "io-dma-setup-cycles": 800, "io-cpu-mhz": 80
    },
    scheduler: {
      "task1-c": 1, "task1-t": 5, "task1-stack": 512,
      "task2-c": 1, "task2-t": 10, "task2-stack": 768,
      "task3-c": 2, "task3-t": 20, "task3-stack": 1024,
      "kernel-ram": 2048, "ram-budget": 16384
    },
    synchronization: {
      "sync-kind": "data", "sync-producer": "isr", "sync-consumers": "one",
      "sync-primitive": "queue", "sync-priority-inheritance": "yes",
      "sync-lock-order": "fixed"
    },
    "low-power": {
      "power-run-ma": 15, "power-sleep-ua": 20, "power-wake-ma": 10,
      "power-wake-ms": 5, "power-active-ms": 50, "power-period-s": 10
    },
    reliability: {
      "reliability-case": "hang", "reliability-watchdog": true,
      "reliability-bor": true, "reliability-safe-state": true,
      "reliability-stack-monitor": true, "reliability-atomic-write": false,
      "reliability-ab-slot": false, "reliability-rollback": false
    }
  };

  var OUTPUTS = {
    architecture: ["arch-rtos-score", "arch-bare-score", "arch-verdict"],
    "event-loop": ["loop-cycle-ms", "loop-worst-response-ms", "loop-slack-ms", "loop-busy-share"],
    interrupts: ["irq-start-latency", "irq-response-time", "irq-headroom", "irq-cpu-load", "irq-line-disabled", "irq-line-higher", "irq-line-entry", "irq-line-handler"],
    "driver-io": ["io-throughput", "io-polling-load", "io-dma-load", "io-cpu-saved", "io-verdict"],
    scheduler: ["sched-utilization", "sched-rm-bound", "sched-rm-result", "sched-edf-result", "sched-ram-used", "sched-ram-headroom"],
    synchronization: ["sync-verdict", "sync-blocker"],
    "low-power": ["power-sleep-time", "power-average-current", "power-sleep-share", "power-saving", "power-break-even"],
    reliability: ["reliability-first", "reliability-second", "reliability-count", "reliability-next"]
  };

  var STATUS_IDS = {
    architecture: "arch-status", "event-loop": "loop-status", interrupts: "irq-status",
    "driver-io": "io-status", scheduler: "scheduler-status",
    synchronization: "sync-status", "low-power": "low-power-status",
    reliability: "reliability-status"
  };

  var FEEDBACK_IDS = {
    architecture: "arch-feedback", "event-loop": "loop-feedback", interrupts: "irq-feedback",
    "driver-io": "io-feedback", scheduler: "scheduler-feedback",
    synchronization: "sync-feedback", "low-power": "low-power-feedback",
    reliability: "reliability-feedback"
  };

  var RELIABILITY_LABELS = {
    "reliability-watchdog": "Watchdog 與 reset cause／fault log",
    "reliability-bor": "BOR 與 brownout safe state",
    "reliability-safe-state": "安全狀態",
    "reliability-stack-monitor": "Stack watermark／guard",
    "reliability-atomic-write": "原子設定寫入（雙區、CRC 或 journal）",
    "reliability-ab-slot": "A/B 備援映像 slot",
    "reliability-rollback": "啟動失敗 rollback"
  };
  var RELIABILITY_ORDER = Object.keys(RELIABILITY_LABELS);

  function finite(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function requireNumber(values, id, label, rule) {
    if (!values || values[id] === undefined || values[id] === null || String(values[id]).trim() === "") {
      throw new Error(label + "不可為空白");
    }
    var value = Number(values[id]);
    if (!finite(value)) throw new Error(label + "必須是有限數值");
    if (rule === "nonnegative" && value < 0) throw new Error(label + "不可小於 0");
    if (rule === "positive" && value <= 0) throw new Error(label + "必須大於 0");
    if (rule === "integer" && (!Number.isInteger(value) || value < 0)) throw new Error(label + "必須是非負整數");
    return value;
  }

  function resultNumbersAreFinite(result) {
    Object.keys(result || {}).forEach(function (key) {
      if (typeof result[key] === "number" && !finite(result[key])) {
        throw new Error("計算結果不是有限數值");
      }
    });
    return result;
  }

  function calculateArchitecture(values) {
    var taskCount = requireNumber(values, "arch-task-count", "任務數", "integer");
    var deadlineCount = requireNumber(values, "arch-deadline-count", "Deadline 數", "integer");
    var blockingFlows = requireNumber(values, "arch-blocking-flows", "阻塞流程數", "integer");
    var ramKb = requireNumber(values, "arch-ram-kb", "RAM", "positive");
    var teamSize = requireNumber(values, "arch-team-size", "團隊人數", "integer");
    if (teamSize < 1) throw new Error("團隊人數至少為 1");
    if (deadlineCount > taskCount) throw new Error("Deadline 數不可大於任務數");
    var rtosScore = (taskCount >= 3 ? 2 : 0) + (deadlineCount >= 2 ? 2 : 0) +
      (blockingFlows >= 2 ? 2 : 0) + (teamSize >= 2 ? 1 : 0);
    var bareScore = (taskCount <= 2 ? 2 : 0) + (deadlineCount === 0 ? 1 : 0) +
      (blockingFlows === 0 ? 1 : 0) + (ramKb < 16 ? 2 : 0);
    var verdict = rtosScore > bareScore ? "建議 RTOS" : bareScore > rtosScore ?
      "建議 non-blocking superloop" : "需要原型量測";
    return resultNumbersAreFinite({
      taskCount: taskCount, deadlineCount: deadlineCount, blockingFlows: blockingFlows,
      ramKb: ramKb, teamSize: teamSize, rtosScore: rtosScore, bareScore: bareScore,
      verdict: verdict, status: rtosScore === bareScore ? "warn" : "ok"
    });
  }

  function calculateEventLoop(values) {
    var sensor = requireNumber(values, "loop-sensor-ms", "Sensor 時間", "nonnegative");
    var protocol = requireNumber(values, "loop-protocol-ms", "Protocol 時間", "nonnegative");
    var log = requireNumber(values, "loop-log-ms", "Log 時間", "nonnegative");
    var busy = requireNumber(values, "loop-busy-ms", "Busy 時間", "nonnegative");
    var deadline = requireNumber(values, "loop-deadline-ms", "Deadline", "positive");
    var cycle = sensor + protocol + log + busy;
    var slack = deadline - cycle;
    var busyShare = cycle === 0 ? 0 : busy / cycle * 100;
    var blocked = cycle > deadline;
    var warning = !blocked && busy > 0;
    return resultNumbersAreFinite({
      sensor: sensor, protocol: protocol, log: log, busy: busy,
      cycle: cycle, worstResponse: cycle, slack: slack, busyShare: busyShare,
      blocked: blocked, warning: warning, status: blocked ? "error" : warning ? "warn" : "ok"
    });
  }

  function calculateInterrupts(values) {
    var disabled = requireNumber(values, "irq-disabled-us", "關中斷時間", "nonnegative");
    var higherDuration = requireNumber(values, "irq-higher-duration-us", "高優先 ISR 時間", "nonnegative");
    var higherCount = requireNumber(values, "irq-higher-count", "高優先 ISR 數", "integer");
    var entry = requireNumber(values, "irq-entry-us", "ISR 進入時間", "nonnegative");
    var handler = requireNumber(values, "irq-handler-us", "ISR handler 時間", "nonnegative");
    var rate = requireNumber(values, "irq-rate-hz", "ISR 頻率", "nonnegative");
    var deadline = requireNumber(values, "irq-deadline-us", "ISR Deadline", "positive");
    var start = disabled + higherCount * higherDuration + entry;
    var response = start + handler;
    var headroom = deadline - response;
    var cpuLoad = handler * rate / 1000000 * 100;
    var blocked = response > deadline || cpuLoad > 100;
    var warning = !blocked && cpuLoad > 20;
    return resultNumbersAreFinite({
      disabled: disabled, higherTotal: higherCount * higherDuration, entry: entry, handler: handler,
      startLatency: start, responseTime: response, headroom: headroom, cpuLoad: cpuLoad,
      blocked: blocked, warning: warning, status: blocked ? "error" : warning ? "warn" : "ok"
    });
  }

  function calculateDriverIo(values) {
    var bytes = requireNumber(values, "io-bytes", "資料量", "nonnegative");
    var rate = requireNumber(values, "io-rate", "資料率", "nonnegative");
    var cyclesByte = requireNumber(values, "io-cycles-byte", "每 byte CPU cycles", "nonnegative");
    var dmaSetup = requireNumber(values, "io-dma-setup-cycles", "DMA setup cycles", "nonnegative");
    var cpuMhz = requireNumber(values, "io-cpu-mhz", "CPU 頻率", "positive");
    var cpuHz = cpuMhz * 1000000;
    var throughput = bytes * rate / 1024;
    var pollingLoad = bytes * rate * cyclesByte / cpuHz * 100;
    var dmaLoad = rate * dmaSetup / cpuHz * 100;
    var cpuSaved = pollingLoad === 0 ? 0 : (pollingLoad - dmaLoad) / pollingLoad * 100;
    var blocked = pollingLoad > 100;
    var pollingEnough = !blocked && pollingLoad <= 2 && bytes < 64;
    var verdict = blocked ? "Polling CPU 超過 100%" : pollingEnough ?
      "Polling 足夠" : dmaLoad < pollingLoad ? "建議 DMA／interrupt-driven" : "可先評估 polling";
    return resultNumbersAreFinite({
      throughput: throughput, pollingLoad: pollingLoad, dmaLoad: dmaLoad, cpuSaved: cpuSaved,
      blocked: blocked, pollingEnough: pollingEnough, verdict: verdict,
      status: blocked ? "error" : pollingEnough ? "ok" : "warn"
    });
  }

  function calculateScheduler(values) {
    var utilization = 0;
    var stackUsed = requireNumber(values, "kernel-ram", "Kernel RAM", "nonnegative");
    [1, 2, 3].forEach(function (index) {
      var c = requireNumber(values, "task" + index + "-c", "Task " + index + " 執行時間", "nonnegative");
      var t = requireNumber(values, "task" + index + "-t", "Task " + index + " 週期", "positive");
      var stack = requireNumber(values, "task" + index + "-stack", "Task " + index + " stack", "nonnegative");
      if (c > t) throw new Error("Task " + index + " 執行時間不可大於週期");
      utilization += c / t;
      stackUsed += stack;
    });
    var ramBudget = requireNumber(values, "ram-budget", "RAM 預算", "positive");
    var ramHeadroom = ramBudget - stackUsed;
    var rmPass = utilization <= RM_BOUND;
    var edfPass = utilization <= 1;
    var ramBlocked = ramHeadroom < 0;
    var blocked = ramBlocked || !edfPass;
    var status = blocked ? "error" : !rmPass ? "warn" : "ok";
    return resultNumbersAreFinite({
      utilization: utilization, utilizationRatio: utilization, utilizationPercent: utilization * 100,
      rmBound: RM_BOUND, rmBoundRatio: RM_BOUND, rmBoundPercent: RM_BOUND * 100,
      rmPass: rmPass, edfPass: edfPass, ramUsed: stackUsed, ramHeadroom: ramHeadroom,
      ramBlocked: ramBlocked, blocked: blocked, status: status
    });
  }

  function calculateSynchronization(values) {
    var kind = values && values["sync-kind"];
    var producer = values && values["sync-producer"];
    var consumers = values && values["sync-consumers"];
    var primitive = values && values["sync-primitive"];
    var inheritance = values && values["sync-priority-inheritance"];
    var lockOrder = values && values["sync-lock-order"];
    if (["event", "data", "shared-resource"].indexOf(kind) < 0) throw new Error("同步情境無效");
    if (["isr", "task"].indexOf(producer) < 0) throw new Error("生產者無效");
    if (["one", "many"].indexOf(consumers) < 0) throw new Error("消費者數量無效");
    if (["notification", "binary-semaphore", "queue", "mutex"].indexOf(primitive) < 0) throw new Error("同步原語無效");
    if (["yes", "no"].indexOf(inheritance) < 0) throw new Error("Priority inheritance 選項無效");
    if (["fixed", "unordered", "none"].indexOf(lockOrder) < 0) throw new Error("Lock order 選項無效");
    var blocker = null;
    if (lockOrder === "unordered") blocker = "Lock order 不固定，可能形成 deadlock";
    else if (producer === "isr" && primitive === "mutex") blocker = "ISR 不可使用 mutex 或阻塞路徑";
    else if (kind === "data" && primitive !== "queue") blocker = "data 情境必須使用 queue";
    else if (kind === "shared-resource" && primitive !== "mutex") blocker = "shared-resource 情境必須使用 mutex";
    else if (kind === "shared-resource" && inheritance !== "yes") blocker = "shared-resource 的 mutex 必須啟用 priority inheritance";
    else if (kind === "event" && consumers === "many" && primitive !== "binary-semaphore") blocker = "多 consumer event 在本教材簡化為 binary semaphore";
    else if (kind === "event" && consumers === "one" && ["notification", "binary-semaphore"].indexOf(primitive) < 0) blocker = "單一 consumer event 應使用 notification 或 binary semaphore";
    var verdict = blocker ? "阻擋" : "同步配置可用";
    return {
      kind: kind, producer: producer, consumers: consumers, primitive: primitive,
      priorityInheritance: inheritance, lockOrder: lockOrder, blocker: blocker,
      verdict: verdict, blocked: Boolean(blocker), status: blocker ? "error" : "ok"
    };
  }

  function calculateLowPower(values) {
    var run = requireNumber(values, "power-run-ma", "Run 電流", "positive");
    var sleepUa = requireNumber(values, "power-sleep-ua", "Sleep 電流", "nonnegative");
    var wake = requireNumber(values, "power-wake-ma", "Wake 電流", "nonnegative");
    var wakeMs = requireNumber(values, "power-wake-ms", "Wake 時間", "nonnegative");
    var activeMs = requireNumber(values, "power-active-ms", "Active 時間", "nonnegative");
    var periodS = requireNumber(values, "power-period-s", "週期", "positive");
    var periodMs = periodS * 1000;
    if (activeMs + wakeMs > periodMs) throw new Error("Active 時間加 Wake 時間不可超過週期");
    var sleepMs = periodMs - activeMs - wakeMs;
    var sleep = sleepUa / 1000;
    var average = (run * activeMs + sleep * sleepMs + wake * wakeMs) / periodMs;
    var sleepShare = sleepMs / periodMs * 100;
    var saving = (1 - average / run) * 100;
    var breakEven = run > sleep ? wake * wakeMs / (run - sleep) : null;
    var noBreakEven = breakEven === null;
    var worthwhile = !noBreakEven && sleepMs >= breakEven && saving > 0;
    return resultNumbersAreFinite({
      sleepTime: sleepMs, averageCurrent: average, sleepShare: sleepShare, saving: saving,
      breakEven: breakEven, noBreakEven: noBreakEven, worthwhile: worthwhile,
      activeTime: activeMs, wakeTime: wakeMs, periodTime: periodMs,
      status: noBreakEven || !worthwhile ? "warn" : "ok"
    });
  }

  function calculateReliability(values, checks) {
    var situation = values && values["reliability-case"];
    if (["hang", "brownout-write", "update-loss", "stack-overflow"].indexOf(situation) < 0) throw new Error("復原情境無效");
    var count = RELIABILITY_ORDER.filter(function (id) { return checks && checks[id] === true; }).length;
    var nextId = RELIABILITY_ORDER.filter(function (id) { return !checks || checks[id] !== true; })[0] || null;
    var scenario = {
      hang: ["先保留 watchdog reset cause／fault log", "再查最後 heartbeat、ISR 與死結"],
      "brownout-write": ["先確認 BOR 與 safe state", "再用雙區＋CRC／journal 做原子設定寫入"],
      "update-loss": ["先寫備援 slot 並驗證", "再原子切換；啟動失敗 rollback"],
      "stack-overflow": ["先看 watermark／guard", "再調整 stack 或移除不受控配置"]
    }[situation];
    return {
      situation: situation, first: scenario[0], second: scenario[1], count: count,
      total: RELIABILITY_ORDER.length, complete: count === RELIABILITY_ORDER.length,
      next: nextId ? RELIABILITY_LABELS[nextId] : null, nextId: nextId,
      blocked: count !== RELIABILITY_ORDER.length, status: count === RELIABILITY_ORDER.length ? "ok" : "warn"
    };
  }

  function get(doc, id) {
    return doc && typeof doc.getElementById === "function" ? doc.getElementById(id) : null;
  }

  function all(doc, selector) {
    if (!doc || typeof doc.querySelectorAll !== "function") return [];
    return Array.prototype.slice.call(doc.querySelectorAll(selector));
  }

  function text(doc, id, value) {
    var element = get(doc, id);
    if (!element) return;
    var target = element.querySelector ? element.querySelector("[data-value], .output-value, .status-text") : null;
    if (target) target.textContent = String(value);
    else element.textContent = String(value);
  }

  function state(doc, id, value, stateName) {
    var element = get(doc, id);
    if (!element) return;
    var textNode = element.querySelector ? element.querySelector("[data-status-text], .status-text, .output-value") : null;
    if (textNode) textNode.textContent = String(value);
    else if (!element.querySelector || !element.querySelector("[data-status-symbol], .status-symbol")) element.textContent = String(value);
    var symbol = element.querySelector ? element.querySelector("[data-status-symbol], .status-symbol") : null;
    if (symbol) symbol.textContent = stateName === "ok" ? "✓" : stateName === "warn" ? "!" : stateName === "error" ? "×" : "•";
    if (element.classList) {
      ["status-ok", "status-warn", "status-error", "status-neutral"].forEach(function (name) { element.classList.remove(name); });
      element.classList.add("status-" + (stateName === "ok" ? "ok" : stateName === "warn" ? "warn" : stateName === "error" ? "error" : "neutral"));
    }
    if (element.dataset) element.dataset.state = stateName;
    if (element.setAttribute) {
      element.setAttribute("role", "status");
      element.setAttribute("aria-live", "polite");
    }
  }

  function feedback(doc, id, message, stateName) {
    state(doc, id, message, stateName);
  }

  function clearModule(doc, key, message) {
    (OUTPUTS[key] || []).forEach(function (id) { text(doc, id, "—"); });
    if (key === "reliability") {
      text(doc, "reliability-status", "輸入錯誤");
    }
    state(doc, STATUS_IDS[key], message || "輸入錯誤", "error");
    feedback(doc, FEEDBACK_IDS[key], "× " + (message || "輸入或計算無效"), "error");
  }

  function format(value, digits, unit) {
    if (!finite(value)) return "—";
    return value.toFixed(digits) + (unit ? " " + unit : "");
  }

  function setBar(doc, selector, percent) {
    var bar = all(doc, selector)[0];
    if (!bar || !bar.style) return;
    var safePercent = finite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
    bar.style.width = safePercent.toFixed(2) + "%";
  }

  function clearVisuals(doc, key) {
    var selectors = {
      "event-loop": ["[data-loop-segment]"],
      "driver-io": ["[data-io-bar]"],
      "low-power": ["[data-power-bar]"]
    }[key] || [];
    selectors.forEach(function (selector) {
      all(doc, selector).forEach(function (bar) { if (bar.style) bar.style.width = "0"; });
    });
  }

  function readNumbers(doc, ids) {
    var values = {};
    for (var i = 0; i < ids.length; i += 1) {
      var id = ids[i];
      var input = get(doc, id);
      if (!input) return { ok: false, error: "找不到輸入欄位：「" + id + "」" };
      if (String(input.value).trim() === "") return { ok: false, error: id + "不可為空白" };
      var value = Number(input.value);
      if (!finite(value)) return { ok: false, error: id + "必須是有限數值" };
      values[id] = value;
    }
    return { ok: true, value: values };
  }

  function readSelects(doc, ids) {
    var values = {};
    for (var i = 0; i < ids.length; i += 1) {
      var id = ids[i];
      var input = get(doc, id);
      if (!input || !String(input.value).trim()) return { ok: false, error: id + "不可為空白" };
      values[id] = input.value;
    }
    return { ok: true, value: values };
  }

  function checks(doc, selector) {
    var values = {};
    all(doc, selector).forEach(function (input) { if (input.id) values[input.id] = input.checked === true; });
    return values;
  }

  function safeRun(fn, values, extra) {
    try { return { ok: true, value: resultNumbersAreFinite(fn(values, extra)) }; }
    catch (error) { return { ok: false, error: error && error.message ? error.message : "輸入或計算無效" }; }
  }

  function renderArchitecture(doc, result) {
    text(doc, "arch-rtos-score", String(result.rtosScore));
    text(doc, "arch-bare-score", String(result.bareScore));
    state(doc, "arch-verdict", result.verdict, result.status);
    state(doc, "arch-status", result.verdict, result.status);
    feedback(doc, "arch-feedback", "這是架構提示，不是功能多就必須使用 RTOS；仍要量測每任務堆疊、時序與阻塞行為。", result.status);
  }

  function renderEventLoop(doc, result) {
    text(doc, "loop-cycle-ms", format(result.cycle, 3, "ms"));
    text(doc, "loop-worst-response-ms", format(result.worstResponse, 3, "ms"));
    text(doc, "loop-slack-ms", format(result.slack, 3, "ms"));
    text(doc, "loop-busy-share", format(result.busyShare, 1, "%"));
    var total = result.cycle || 1;
    setBar(doc, '[data-loop-segment="sensor"]', result.sensor / total * 100);
    setBar(doc, '[data-loop-segment="protocol"]', result.protocol / total * 100);
    setBar(doc, '[data-loop-segment="log"]', result.log / total * 100);
    setBar(doc, '[data-loop-segment="busy"]', result.busy / total * 100);
    var message = result.blocked ? "迴圈超過 deadline，需拆分工作或改用事件／RTOS 模型。" : result.warning ? "期限目前通過，但 busy-wait 會侵蝕回應能力；可改用狀態機、timer、ISR、DMA 或阻塞式 RTOS API。" : "非阻塞迴圈期限通過，仍應以最壞執行時間量測。";
    state(doc, "loop-status", result.blocked ? "Deadline 超限" : result.warning ? "期限通過但有 busy 警告" : "Deadline 通過", result.status);
    feedback(doc, "loop-feedback", message, result.status);
  }

  function renderInterrupts(doc, result) {
    text(doc, "irq-start-latency", format(result.startLatency, 1, "µs"));
    text(doc, "irq-response-time", format(result.responseTime, 1, "µs"));
    text(doc, "irq-headroom", format(result.headroom, 1, "µs"));
    text(doc, "irq-cpu-load", format(result.cpuLoad, 2, "%"));
    text(doc, "irq-line-disabled", format(result.disabled, 1, "µs"));
    text(doc, "irq-line-higher", format(result.higherTotal, 1, "µs"));
    text(doc, "irq-line-entry", format(result.entry, 1, "µs"));
    text(doc, "irq-line-handler", format(result.handler, 1, "µs"));
    var message = result.blocked ? "ISR 延遲或 CPU load 超過阻擋門檻。" : result.warning ? "ISR CPU load 偏高，應縮短 handler 或降低觸發成本。" : "ISR 預算通過。ISR 不可阻塞，只清旗標／取最少資料，再用 queue、semaphore 或 notification 交棒。";
    state(doc, "irq-status", result.blocked ? "ISR 預算阻擋" : result.warning ? "ISR 負載警告" : "ISR 預算通過", result.status);
    feedback(doc, "irq-feedback", message, result.status);
  }

  function renderDriverIo(doc, result) {
    text(doc, "io-throughput", format(result.throughput, 1, "KiB/s"));
    text(doc, "io-polling-load", format(result.pollingLoad, 2, "%"));
    text(doc, "io-dma-load", format(result.dmaLoad, 2, "%"));
    text(doc, "io-cpu-saved", format(result.cpuSaved, 2, "%"));
    setBar(doc, '[data-io-bar="polling"]', result.pollingLoad);
    setBar(doc, '[data-io-bar="dma"]', result.dmaLoad);
    state(doc, "io-verdict", result.verdict, result.status);
    state(doc, "io-status", result.blocked ? "Polling 超載" : "I/O 成本已估算", result.status);
    feedback(doc, "io-feedback", "教材估算未計 bus contention、DMA 記憶體限制、cache coherency 與 driver setup latency；實際驅動仍需檢查緩衝區與同步。", result.status);
  }

  function renderScheduler(doc, result) {
    text(doc, "sched-utilization", format(result.utilizationPercent, 2, "%"));
    text(doc, "sched-rm-bound", format(result.rmBoundPercent, 2, "%"));
    text(doc, "sched-rm-result", result.rmPass ? "RMS 充分條件通過" : "RMS 未由充分條件保證");
    text(doc, "sched-edf-result", result.edfPass ? "EDF 利用率條件通過" : "EDF 利用率超過 100% ");
    text(doc, "sched-ram-used", format(result.ramUsed, 0, "B"));
    text(doc, "sched-ram-headroom", format(result.ramHeadroom, 0, "B"));
    var message = result.ramBlocked ? "RAM 預算不足，先調整 stack、kernel 或 RAM budget。" : result.edfPass ? "RMS bound 是充分條件，不是必要條件；仍需 RTA／量測確認 blocking、jitter、context switch、優先權與 stack watermark。" : "EDF 利用率已超過 100%，目前條件不可由 EDF 利用率檢查通過。";
    state(doc, "scheduler-status", result.ramBlocked ? "RAM 不足" : result.edfPass ? (result.rmPass ? "初步排程通過" : "RM 未保證") : "利用率阻擋", result.status);
    feedback(doc, "scheduler-feedback", message, result.status);
  }

  function renderSynchronization(doc, result) {
    state(doc, "sync-verdict", result.verdict, result.status);
    text(doc, "sync-blocker", result.blocker || "無阻擋條件");
    state(doc, "sync-status", result.blocked ? "同步配置阻擋" : "同步配置通過", result.status);
    feedback(doc, "sync-feedback", result.blocker ? result.blocker + "。" : "ISR 使用 FromISR API 並在必要時喚醒較高優先任務；primitive 不能取代固定 lock order 與 timeout 策略。", result.status);
  }

  function renderLowPower(doc, result) {
    text(doc, "power-sleep-time", format(result.sleepTime, 1, "ms"));
    text(doc, "power-average-current", format(result.averageCurrent, 3, "mA"));
    text(doc, "power-sleep-share", format(result.sleepShare, 2, "%"));
    text(doc, "power-saving", format(result.saving, 2, "%"));
    text(doc, "power-break-even", result.noBreakEven ? "無解" : format(result.breakEven, 2, "ms"));
    setBar(doc, '[data-power-bar="run"]', result.activeTime / result.periodTime * 100);
    setBar(doc, '[data-power-bar="wake"]', result.wakeTime / result.periodTime * 100);
    setBar(doc, '[data-power-bar="sleep"]', result.sleepTime / result.periodTime * 100);
    state(doc, "low-power-status", result.noBreakEven ? "Break-even 無解" : result.worthwhile ? "睡眠區間超過 break-even" : "睡眠成本尚未回收", result.status);
    feedback(doc, "low-power-feedback", result.noBreakEven ? "Run 電流不高於 sleep 電流，break-even 無解；仍需量測完整電流剖面。" : result.worthwhile ? "Tickless 只移除 tick 喚醒，還需關閉周邊時脈、處理 GPIO 漏電並量測完整電流剖面。" : "目前 sleep interval 短於 break-even 或沒有節省；先降低喚醒成本或延長睡眠，再以電流剖面驗證。", result.status);
  }

  function renderReliability(doc, result) {
    text(doc, "reliability-first", result.first);
    text(doc, "reliability-second", result.second);
    text(doc, "reliability-count", result.count + " / " + result.total);
    text(doc, "reliability-next", result.next || "所有復原 gate 已完成");
    state(doc, "reliability-status", result.complete ? "復原 gate 通過" : "復原 gate 未閉合", result.status);
    feedback(doc, "reliability-feedback", result.complete ? "復原 gate 已通過；這不代表 secure boot、安全更新或量產驗證完成。" : "第一個未完成 gate：「" + result.next + "」。固定順序不可用其他檢查項的分數抵銷。", result.status);
  }

  function readModule(doc, key) {
    var numeric = {
      architecture: ["arch-task-count", "arch-deadline-count", "arch-blocking-flows", "arch-ram-kb", "arch-team-size"],
      "event-loop": ["loop-sensor-ms", "loop-protocol-ms", "loop-log-ms", "loop-busy-ms", "loop-deadline-ms"],
      interrupts: ["irq-disabled-us", "irq-higher-duration-us", "irq-higher-count", "irq-entry-us", "irq-handler-us", "irq-rate-hz", "irq-deadline-us"],
      "driver-io": ["io-bytes", "io-rate", "io-cycles-byte", "io-dma-setup-cycles", "io-cpu-mhz"],
      scheduler: ["task1-c", "task1-t", "task1-stack", "task2-c", "task2-t", "task2-stack", "task3-c", "task3-t", "task3-stack", "kernel-ram", "ram-budget"],
      "low-power": ["power-run-ma", "power-sleep-ua", "power-wake-ma", "power-wake-ms", "power-active-ms", "power-period-s"]
    };
    if (numeric[key]) return readNumbers(doc, numeric[key]);
    if (key === "synchronization") return readSelects(doc, ["sync-kind", "sync-producer", "sync-consumers", "sync-primitive", "sync-priority-inheritance", "sync-lock-order"]);
    if (key === "reliability") return readSelects(doc, ["reliability-case"]);
    return { ok: false, error: "未知模組" };
  }

  function runModule(doc, key) {
    var input = readModule(doc, key);
    if (!input.ok) { clearVisuals(doc, key); clearModule(doc, key, input.error); return; }
    var checked = key === "architecture" ? safeRun(calculateArchitecture, input.value) :
      key === "event-loop" ? safeRun(calculateEventLoop, input.value) :
      key === "interrupts" ? safeRun(calculateInterrupts, input.value) :
      key === "driver-io" ? safeRun(calculateDriverIo, input.value) :
      key === "scheduler" ? safeRun(calculateScheduler, input.value) :
      key === "synchronization" ? safeRun(calculateSynchronization, input.value) :
      key === "low-power" ? safeRun(calculateLowPower, input.value) :
      safeRun(calculateReliability, input.value, checks(doc, "[data-reliability-check]"));
    if (!checked.ok) { clearVisuals(doc, key); clearModule(doc, key, checked.error); return; }
    if (key === "architecture") renderArchitecture(doc, checked.value);
    if (key === "event-loop") renderEventLoop(doc, checked.value);
    if (key === "interrupts") renderInterrupts(doc, checked.value);
    if (key === "driver-io") renderDriverIo(doc, checked.value);
    if (key === "scheduler") renderScheduler(doc, checked.value);
    if (key === "synchronization") renderSynchronization(doc, checked.value);
    if (key === "low-power") renderLowPower(doc, checked.value);
    if (key === "reliability") renderReliability(doc, checked.value);
  }

  function storage(browserRoot) {
    try { return browserRoot && browserRoot.localStorage ? browserRoot.localStorage : null; }
    catch (error) { return null; }
  }

  function loadProgress(browserRoot) {
    var store = storage(browserRoot);
    if (!store) return {};
    try {
      var data = JSON.parse(store.getItem(STORAGE_KEY) || "{}");
      return data && data.completed && typeof data.completed === "object" ? data.completed : {};
    } catch (error) { return {}; }
  }

  function saveProgress(browserRoot, completed) {
    var store = storage(browserRoot);
    if (!store) return;
    try { store.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: completed })); } catch (error) { /* 儲存失敗不阻擋頁面操作 */ }
  }

  function updateProgress(doc, completed) {
    var count = MODULE_KEYS.filter(function (key) { return completed[key] === true; }).length;
    var label = get(doc, "progress-label");
    var fill = get(doc, "progress-fill");
    var track = all(doc, ".progress-track")[0];
    if (label) label.textContent = "已完成 " + count + " / " + MODULE_KEYS.length + " 個模組（" + Math.round(count / MODULE_KEYS.length * 100) + "%）";
    if (fill && fill.style) fill.style.width = (count / MODULE_KEYS.length * 100).toFixed(2) + "%";
    if (track && track.setAttribute) {
      track.setAttribute("aria-valuemin", "0"); track.setAttribute("aria-valuemax", String(MODULE_KEYS.length));
      track.setAttribute("aria-valuenow", String(count)); track.setAttribute("aria-valuetext", count + " / " + MODULE_KEYS.length + " 個模組完成");
    }
    all(doc, "[data-complete]").forEach(function (button) {
      var done = completed[button.getAttribute("data-complete")] === true;
      if (button.classList) button.classList.toggle("is-complete", done);
      if (button.setAttribute) button.setAttribute("aria-pressed", done ? "true" : "false");
      var labelNode = button.querySelector ? button.querySelector("[data-complete-label], .complete-label") : null;
      if (labelNode) labelNode.textContent = done ? "已完成" : "標記完成";
      else button.textContent = done ? "已完成" : "標記完成";
    });
    all(doc, "[data-nav]").forEach(function (button) {
      var done = completed[button.getAttribute("data-nav")] === true;
      if (button.classList) button.classList.toggle("is-complete", done);
      var mark = button.querySelector ? button.querySelector(".nav-mark, [data-nav-mark]") : null;
      if (mark) mark.textContent = done ? "●" : "○";
    });
  }

  function activate(doc, key) {
    if (MODULE_KEYS.indexOf(key) < 0) return;
    all(doc, "[data-module]").forEach(function (section) {
      var active = section.getAttribute("data-module") === key;
      section.hidden = !active;
      if (section.classList) { section.classList.toggle("is-active", active); section.classList.toggle("is-current", active); }
      if (section.setAttribute) section.setAttribute("aria-hidden", active ? "false" : "true");
    });
    all(doc, "[data-nav]").forEach(function (button) {
      var active = button.getAttribute("data-nav") === key;
      if (button.classList) button.classList.toggle("is-active", active);
      if (button.setAttribute) { if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); }
    });
  }

  function setDefaults(doc, key) {
    var defaults = DEFAULTS[key];
    if (!defaults) return;
    Object.keys(defaults).forEach(function (id) {
      var input = get(doc, id);
      if (!input) return;
      if (input.type === "checkbox") input.checked = defaults[id] === true;
      else input.value = String(defaults[id]);
    });
    if (key === "reliability") all(doc, "[data-reliability-check]").forEach(function (input) {
      if (Object.prototype.hasOwnProperty.call(defaults, input.id)) input.checked = defaults[input.id] === true;
    });
  }

  function init(doc, browserRoot) {
    if (!doc) return;
    var rootObject = browserRoot || (typeof window !== "undefined" ? window : null);
    var completed = loadProgress(rootObject);
    var sections = all(doc, "[data-module]");
    var initial = sections.length ? sections[0].getAttribute("data-module") : MODULE_KEYS[0];
    activate(doc, MODULE_KEYS.indexOf(initial) >= 0 ? initial : MODULE_KEYS[0]);
    all(doc, "[data-nav]").forEach(function (button) {
      if (String(button.tagName).toLowerCase() === "button") button.setAttribute("type", "button");
      button.addEventListener("click", function () { activate(doc, button.getAttribute("data-nav")); });
    });
    all(doc, "[data-complete]").forEach(function (button) {
      if (String(button.tagName).toLowerCase() === "button") button.setAttribute("type", "button");
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-complete");
        if (MODULE_KEYS.indexOf(key) < 0) return;
        completed[key] = completed[key] !== true;
        saveProgress(rootObject, completed); updateProgress(doc, completed);
      });
    });
    var resetProgress = get(doc, "reset-progress");
    if (resetProgress) resetProgress.addEventListener("click", function () {
      completed = {}; saveProgress(rootObject, completed); updateProgress(doc, completed);
    });
    all(doc, "[data-reset-module]").forEach(function (button) {
      if (String(button.tagName).toLowerCase() === "button") button.setAttribute("type", "button");
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-reset-module");
        setDefaults(doc, key); runModule(doc, key);
      });
    });
    var fieldToModule = {};
    Object.keys(DEFAULTS).forEach(function (key) { Object.keys(DEFAULTS[key]).forEach(function (id) { fieldToModule[id] = key; }); });
    Object.keys(fieldToModule).forEach(function (id) {
      var input = get(doc, id);
      if (!input) return;
      ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { runModule(doc, fieldToModule[id]); }); });
    });
    all(doc, "[data-reliability-check]").forEach(function (input) {
      ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { runModule(doc, "reliability"); }); });
    });
    updateProgress(doc, completed);
    MODULE_KEYS.forEach(function (key) { runModule(doc, key); });
  }

  return {
    MODULE_KEYS: MODULE_KEYS.slice(),
    STORAGE_KEY: STORAGE_KEY,
    defaults: DEFAULTS,
    calculateArchitecture: calculateArchitecture,
    calculateEventLoop: calculateEventLoop,
    calculateInterrupts: calculateInterrupts,
    calculateDriverIo: calculateDriverIo,
    calculateScheduler: calculateScheduler,
    calculateSynchronization: calculateSynchronization,
    calculateLowPower: calculateLowPower,
    calculateReliability: calculateReliability,
    init: init
  };
}));

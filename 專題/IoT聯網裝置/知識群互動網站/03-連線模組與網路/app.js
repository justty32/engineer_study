(function (root, factory) {
  "use strict";

  var api = factory();
  var isCommonJs = typeof module !== "undefined" && module.exports;
  if (isCommonJs) {
    module.exports = api;
  } else if (root) {
    root.IotConnectivityLogic = api;
    if (root.document && typeof api.init === "function") api.init(root.document, root);
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var MODULE_KEYS = [
    "bearer-choice", "host-link", "at-engine", "backoff",
    "session", "data-budget", "keepalive", "supervisor"
  ];
  var STORAGE_KEY = "engineerStudy.iotConnectivity.v1";

  var DEFAULTS = {
    "bearer-choice": {
      "bearer-range": "wide", "bearer-payload": "small", "bearer-power": "coin",
      "bearer-infrastructure": "operator", "bearer-downlink": "rare"
    },
    "host-link": {
      "host-baud": 115200, "host-bits-byte": 10, "host-payload-bytes": 512,
      "host-message-rate": 10, "host-burst-rate": 20000, "host-burst-ms": 100,
      "host-buffer-bytes": 2048
    },
    "at-engine": {
      "at-state": "wait", "at-line": "urc", "at-command-pending": "yes",
      "at-urc-handler": "yes", "at-transparent-guard": "yes"
    },
    backoff: {
      "backoff-base": 2, "backoff-attempt": 4, "backoff-cap": 60,
      "backoff-jitter": 20, "backoff-max-retries": 6
    },
    session: {
      "session-case": "network-drop", "session-registration": true,
      "session-ip": true, "session-time-dns": true, "session-socket": false,
      "session-tls": false, "session-app": false
    },
    "data-budget": {
      "data-payload": 100, "data-encoding-ratio": 0.6, "data-overhead": 40,
      "data-messages-day": 24, "data-delivery-factor": 1.1, "data-days": 30
    },
    keepalive: {
      "keepalive-seconds": 300, "keepalive-session-hours": 24,
      "keepalive-roundtrip-bytes": 100, "keepalive-reports": 24,
      "keepalive-reconnect-bytes": 5000, "keepalive-reachability": "frequent"
    },
    supervisor: {
      "supervisor-case": "no-response", "supervisor-log": true,
      "supervisor-timeout": true, "supervisor-backoff": true,
      "supervisor-soft-reset": false, "supervisor-hard-reset": false,
      "supervisor-flow-control": false, "supervisor-watchdog": false
    }
  };

  var OUTPUTS = {
    "bearer-choice": ["bearer-verdict", "bearer-runner-up", "bearer-tradeoff", "bearer-status"],
    "host-link": ["host-capacity", "host-steady-rate", "host-utilization", "host-burst-excess", "host-buffer-headroom", "host-status"],
    "at-engine": ["at-classification", "at-action", "at-next-state", "at-status"],
    backoff: ["backoff-nominal", "backoff-min", "backoff-max", "backoff-cumulative", "backoff-status"],
    session: ["session-first", "session-second", "session-count", "session-next", "session-status"],
    "data-budget": ["data-wire-message", "data-daily", "data-period", "data-baseline", "data-saving", "data-status"],
    keepalive: ["keepalive-wakes", "keepalive-bytes", "reconnect-bytes", "keepalive-byte-winner", "keepalive-verdict", "keepalive-status"],
    supervisor: ["supervisor-first", "supervisor-second", "supervisor-count", "supervisor-blocker", "supervisor-status"]
  };

  var STATUS_IDS = {
    "bearer-choice": "bearer-status", "host-link": "host-status", "at-engine": "at-status",
    backoff: "backoff-status", session: "session-status", "data-budget": "data-status",
    keepalive: "keepalive-status", supervisor: "supervisor-status"
  };

  var FEEDBACK_IDS = {
    "bearer-choice": "bearer-feedback", "host-link": "host-feedback", "at-engine": "at-feedback",
    backoff: "backoff-feedback", session: "session-feedback", "data-budget": "data-feedback",
    keepalive: "keepalive-feedback", supervisor: "supervisor-feedback"
  };

  var SESSION_LABELS = {
    "session-registration": "Registration",
    "session-ip": "IP",
    "session-time-dns": "Time / DNS",
    "session-socket": "Socket",
    "session-tls": "TLS",
    "session-app": "App session"
  };
  var SESSION_ORDER = Object.keys(SESSION_LABELS);

  var SUPERVISOR_LABELS = {
    "supervisor-log": "保存 log／reset cause",
    "supervisor-timeout": "Timeout 與最後命令",
    "supervisor-backoff": "有上限的 backoff",
    "supervisor-soft-reset": "Soft reset",
    "supervisor-hard-reset": "Hard reset／power cycle",
    "supervisor-flow-control": "RTS/CTS 或環形緩衝",
    "supervisor-watchdog": "Watchdog"
  };
  var SUPERVISOR_ORDER = Object.keys(SUPERVISOR_LABELS);

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
    if (rule === "integer" && (!Number.isSafeInteger(value) || value < 0)) throw new Error(label + "必須是非負整數");
    return value;
  }

  function requireChoice(values, id, label, allowed) {
    var value = values && values[id];
    if (allowed.indexOf(value) < 0) throw new Error(label + "選項無效");
    return value;
  }

  function finiteResult(result) {
    Object.keys(result || {}).forEach(function (key) {
      if (typeof result[key] === "number" && !finite(result[key])) throw new Error("計算結果不是有限數值");
    });
    return result;
  }

  function calculateBearer(values) {
    var range = requireChoice(values, "bearer-range", "距離", ["room", "campus", "wide"]);
    var payload = requireChoice(values, "bearer-payload", "資料量", ["small", "medium", "high"]);
    var power = requireChoice(values, "bearer-power", "供電", ["coin", "battery", "mains"]);
    var infrastructure = requireChoice(values, "bearer-infrastructure", "基礎設施", ["private", "operator"]);
    var downlink = requireChoice(values, "bearer-downlink", "下行需求", ["rare", "frequent"]);
    var verdict;
    if (payload === "high" && range === "wide") verdict = "LTE-M";
    else if (payload === "high") verdict = "Wi-Fi";
    else if (range === "wide" && infrastructure === "operator" && downlink === "frequent") verdict = "LTE-M";
    else if (range === "wide" && infrastructure === "operator") verdict = "NB-IoT";
    else if (range === "wide" && infrastructure === "private") verdict = "LoRaWAN";
    else if (range === "campus" && payload === "small" && infrastructure === "private" && downlink === "rare") verdict = "LoRaWAN";
    else if (range === "campus" && infrastructure === "private") verdict = "Thread";
    else if (range === "room" && power === "coin") verdict = "BLE";
    else verdict = "Wi-Fi";
    var runnerMap = { "NB-IoT": "LTE-M", "LTE-M": "NB-IoT", "LoRaWAN": "Thread", Thread: "LoRaWAN", BLE: "Thread", "Wi-Fi": "LTE-M" };
    var tradeoffs = {
      "BLE": "以低功耗與短距離換取有限覆蓋；需確認 gateway 與下行需求。",
      "Thread": "以私有網狀覆蓋換取部署與 border router 成本；需確認節點密度。",
      "LoRaWAN": "以廣域與低功耗換取低資料率與私有 gateway／服務部署成本。",
      "NB-IoT": "以電信商廣域與低下行需求換取吞吐、月租與網路依賴。",
      "LTE-M": "以廣域、較高吞吐與下行能力換取電信商服務與功耗成本。",
      "Wi-Fi": "以高吞吐與現成 IP 網路換取較高功耗、覆蓋與 AP 依賴。"
    };
    return {
      range: range, payload: payload, power: power, infrastructure: infrastructure, downlink: downlink,
      verdict: verdict, runnerUp: runnerMap[verdict], tradeoff: tradeoffs[verdict],
      status: "ok", blocked: false
    };
  }

  function calculateHostLink(values) {
    var baud = requireNumber(values, "host-baud", "baud", "positive");
    var bits = requireNumber(values, "host-bits-byte", "每 byte bits", "positive");
    var payload = requireNumber(values, "host-payload-bytes", "payload", "nonnegative");
    var messageRate = requireNumber(values, "host-message-rate", "message rate", "nonnegative");
    var burstRate = requireNumber(values, "host-burst-rate", "burst rate", "nonnegative");
    var burstMs = requireNumber(values, "host-burst-ms", "burst duration", "nonnegative");
    var buffer = requireNumber(values, "host-buffer-bytes", "buffer", "positive");
    var capacity = baud / bits;
    var steady = payload * messageRate;
    var utilization = steady / capacity;
    var burstExcess = Math.max(0, (burstRate - capacity) * (burstMs / 1000));
    var headroom = buffer - burstExcess;
    var blocked = steady > capacity || headroom < 0;
    var warning = !blocked && burstRate > capacity;
    return finiteResult({
      baud: baud, bits: bits, capacity: capacity, steadyRate: steady, utilization: utilization,
      burstExcess: burstExcess, bufferHeadroom: headroom, blocked: blocked, warning: warning,
      status: blocked ? "error" : warning ? "warn" : "ok"
    });
  }

  function calculateAtEngine(values) {
    var state = requireChoice(values, "at-state", "AT state", ["idle", "wait", "data"]);
    var line = requireChoice(values, "at-line", "AT line", ["ok", "error", "urc", "payload", "prompt"]);
    var pending = requireChoice(values, "at-command-pending", "pending command", ["yes", "no"]);
    var handler = requireChoice(values, "at-urc-handler", "URC handler", ["yes", "no"]);
    var guard = requireChoice(values, "at-transparent-guard", "transparent guard", ["yes", "no"]);
    var classification = "";
    var action = "";
    var nextState = state;
    var blocked = false;
    var warning = false;
    var status = "ok";
    if (state === "data" && guard === "no") {
      classification = line === "payload" ? "透明資料" : line === "urc" ? "資料模式中的 URC" : "資料模式中的控制行";
      action = "缺少 transparent guard，阻擋資料路徑";
      blocked = true;
      status = "error";
    } else if (line === "urc") {
      classification = "URC";
      if (handler === "no") {
        action = "缺少 URC handler，阻擋並保留事件";
        blocked = true;
        status = "error";
      } else {
        action = "分流至 URC handler；pending command 維持等待";
      }
    } else if (line === "ok" || line === "error") {
      classification = line === "ok" ? "OK 回覆" : "ERROR 回覆";
      if (state === "wait" && pending === "yes") {
        action = line === "ok" ? "完成 pending command" : "以 ERROR 結束 pending command";
        nextState = "idle";
      } else {
        action = "記錄 unsolicited line；不可完成命令";
        warning = true;
        status = "warn";
      }
    } else if (line === "prompt") {
      classification = "Prompt";
      if (state === "wait" && pending === "yes") {
        action = "送出 payload，切換資料路徑";
        nextState = "data";
      } else {
        action = "不可送出 payload，維持狀態並記錄異常";
        blocked = true;
        status = "error";
      }
    } else {
      classification = "Payload";
      if (state === "data") action = "送入透明資料管道";
      else {
        action = "非 data state 不可送入資料管道";
        blocked = true;
        status = "error";
      }
    }
    return {
      state: state, line: line, pending: pending, handler: handler, guard: guard,
      classification: classification, action: action, nextState: nextState,
      blocked: blocked, warning: warning, status: status
    };
  }

  function cappedDelay(base, attempt, cap) {
    if (base >= cap || attempt >= 1024) return cap;
    var threshold = Math.ceil(Math.log(cap / base) / Math.LN2);
    return attempt >= threshold ? cap : Math.min(cap, base * Math.pow(2, attempt));
  }

  function calculateBackoff(values) {
    var base = requireNumber(values, "backoff-base", "base delay", "positive");
    var attempt = requireNumber(values, "backoff-attempt", "attempt", "integer");
    var cap = requireNumber(values, "backoff-cap", "cap", "positive");
    var jitter = requireNumber(values, "backoff-jitter", "jitter", "nonnegative");
    var maxRetries = requireNumber(values, "backoff-max-retries", "max retries", "integer");
    if (jitter > 100) throw new Error("jitter 必須介於 0–100%");
    var nominal = cappedDelay(base, attempt, cap);
    var minimum = nominal * (1 - jitter / 100);
    var maximum = nominal * (1 + jitter / 100);
    var cumulative = 0;
    var threshold = base >= cap ? 0 : Math.ceil(Math.log(cap / base) / Math.LN2);
    var uncappedCount = threshold > 0 ? Math.min(attempt + 1, threshold) : 0;
    for (var index = 0; index < uncappedCount; index += 1) cumulative += cappedDelay(base, index, cap);
    if (attempt >= threshold) cumulative += (attempt - threshold + 1) * cap;
    var exhausted = attempt > maxRetries;
    return finiteResult({
      base: base, attempt: attempt, cap: cap, jitter: jitter, maxRetries: maxRetries,
      nominal: nominal, minimum: minimum, maximum: maximum, cumulative: cumulative,
      exhausted: exhausted, blocked: exhausted, status: exhausted ? "error" : "ok"
    });
  }

  function calculateSession(values, checks) {
    var situation = requireChoice(values, "session-case", "會話情境", ["network-drop", "dns-time", "tls-fail", "app-session"]);
    var count = SESSION_ORDER.filter(function (id) { return checks && checks[id] === true; }).length;
    var nextId = SESSION_ORDER.filter(function (id) { return !checks || checks[id] !== true; })[0] || null;
    var scenario = {
      "network-drop": ["先查 registration／URC", "再查 IP／socket"],
      "dns-time": ["先確認時間源與 DNS", "再檢查 TLS 前置條件"],
      "tls-fail": ["先查時間與憑證設定", "再看 socket／TLS log"],
      "app-session": ["先確認 transport 已恢復", "再恢復訂閱、QoS 與 sequence"]
    }[situation];
    return {
      situation: situation, first: scenario[0], second: scenario[1], count: count,
      total: SESSION_ORDER.length, next: nextId ? SESSION_LABELS[nextId] : "所有會話 gate 已完成",
      nextId: nextId, complete: !nextId, blocked: Boolean(nextId), status: nextId ? "error" : "ok"
    };
  }

  function calculateDataBudget(values) {
    var payload = requireNumber(values, "data-payload", "payload", "nonnegative");
    var ratio = requireNumber(values, "data-encoding-ratio", "encoding ratio", "positive");
    var overhead = requireNumber(values, "data-overhead", "overhead", "nonnegative");
    var messages = requireNumber(values, "data-messages-day", "每日訊息數", "nonnegative");
    var factor = requireNumber(values, "data-delivery-factor", "delivery factor", "positive");
    var days = requireNumber(values, "data-days", "天數", "positive");
    if (ratio > 2) throw new Error("encoding ratio 不可大於 2");
    if (factor < 1) throw new Error("delivery factor 必須大於或等於 1");
    var wireMessage = payload * ratio + overhead;
    var daily = wireMessage * messages * factor;
    var period = daily * days;
    var baseline = (payload + overhead) * messages * factor * days;
    if (baseline === 0) throw new Error("baseline 為 0，saving 無法比較");
    var saving = (1 - period / baseline) * 100;
    return finiteResult({
      payload: payload, ratio: ratio, overhead: overhead, messages: messages, factor: factor, days: days,
      wireMessage: wireMessage, daily: daily, period: period, baseline: baseline, saving: saving,
      warning: ratio > 1, status: ratio > 1 ? "warn" : "ok"
    });
  }

  function calculateKeepalive(values) {
    var seconds = requireNumber(values, "keepalive-seconds", "keepalive interval", "positive");
    var hours = requireNumber(values, "keepalive-session-hours", "session hours", "positive");
    var roundtrip = requireNumber(values, "keepalive-roundtrip-bytes", "keepalive bytes", "nonnegative");
    var reports = requireNumber(values, "keepalive-reports", "reports", "positive");
    var reconnect = requireNumber(values, "keepalive-reconnect-bytes", "reconnect bytes", "nonnegative");
    var reachability = requireChoice(values, "keepalive-reachability", "可達性", ["frequent", "rare"]);
    var wakes = Math.ceil(hours * 3600 / seconds);
    var keepaliveBytes = wakes * roundtrip;
    var reconnectBytes = reports * reconnect;
    var byteWinner = keepaliveBytes < reconnectBytes ? "keepalive" : keepaliveBytes > reconnectBytes ? "reconnect" : "tie";
    return finiteResult({
      seconds: seconds, hours: hours, roundtripBytes: roundtrip, reports: reports,
      reconnectBytesPerReport: reconnect, reachability: reachability, wakes: wakes,
      keepaliveBytes: keepaliveBytes, reconnectBytes: reconnectBytes, byteWinner: byteWinner,
      verdict: reachability === "rare" ? "評估 PSM／eDRX／批次上傳" : "評估持續會話",
      status: reachability === "rare" ? "warn" : "ok"
    });
  }

  function calculateSupervisor(values, checks) {
    var situation = requireChoice(values, "supervisor-case", "Supervisor 情境", ["no-response", "deregister", "socket-drop", "buffer-overflow"]);
    var required = {
      "no-response": ["supervisor-log", "supervisor-timeout", "supervisor-soft-reset", "supervisor-hard-reset", "supervisor-watchdog"],
      deregister: ["supervisor-log", "supervisor-timeout", "supervisor-backoff"],
      "socket-drop": ["supervisor-log", "supervisor-timeout", "supervisor-backoff"],
      "buffer-overflow": ["supervisor-log", "supervisor-flow-control"]
    }[situation];
    var count = SUPERVISOR_ORDER.filter(function (id) { return checks && checks[id] === true; }).length;
    var missing = required.filter(function (id) { return !checks || checks[id] !== true; });
    var scenarios = {
      "no-response": ["保存 AT log 與最後命令", "soft reset，再視情況 hard reset／power cycle"],
      deregister: ["查看 URC、訊號與註冊原因", "採用有上限的 backoff"],
      "socket-drop": ["區分 bearer、IP 與 socket 層", "重建上層會話"],
      "buffer-overflow": ["查看 RTS/CTS 與環形緩衝高水位", "降低 burst 或升級介面"]
    }[situation];
    return {
      situation: situation, first: scenarios[0], second: scenarios[1], count: count,
      total: SUPERVISOR_ORDER.length, blocker: missing.length ? SUPERVISOR_LABELS[missing[0]] : "必要 supervisor gate 已完成",
      missing: missing, complete: missing.length === 0, blocked: missing.length !== 0,
      status: missing.length ? "error" : "ok"
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
    var target = element.querySelector ? element.querySelector("[data-value], .output-value, .status-text, [data-status-text]") : null;
    if (target) target.textContent = String(value);
    else element.textContent = String(value);
  }

  function state(doc, id, value, stateName) {
    var element = get(doc, id);
    if (!element) return;
    var target = element.querySelector ? element.querySelector("[data-status-text], .status-text, [data-value], .output-value") : null;
    var symbol = element.querySelector ? element.querySelector("[data-status-symbol], .status-symbol") : null;
    if (target) target.textContent = String(value);
    else if (!symbol) element.textContent = String(value);
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

  function format(value, digits, unit) {
    if (!finite(value)) return "—";
    return value.toFixed(digits) + (unit ? " " + unit : "");
  }

  function clearModule(doc, key, message) {
    (OUTPUTS[key] || []).forEach(function (id) { text(doc, id, "—"); });
    state(doc, STATUS_IDS[key], message || "輸入錯誤", "error");
    feedback(doc, FEEDBACK_IDS[key], "× " + (message || "輸入或計算無效"), "error");
  }

  function readNumbers(doc, ids) {
    var values = {};
    for (var index = 0; index < ids.length; index += 1) {
      var id = ids[index];
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
    for (var index = 0; index < ids.length; index += 1) {
      var id = ids[index];
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
    try { return { ok: true, value: finiteResult(fn(values, extra)) }; }
    catch (error) { return { ok: false, error: error && error.message ? error.message : "輸入或計算無效" }; }
  }

  function renderBearer(doc, result) {
    state(doc, "bearer-verdict", result.verdict, result.status);
    text(doc, "bearer-runner-up", result.runnerUp);
    text(doc, "bearer-tradeoff", result.tradeoff);
    state(doc, "bearer-status", "初篩完成", result.status);
    feedback(doc, "bearer-feedback", "這是初篩；仍需確認覆蓋、月租／部署、認證與實測，不能直接當成採購結論。", result.status);
  }

  function renderHost(doc, result) {
    text(doc, "host-capacity", format(result.capacity, 2, "B/s"));
    text(doc, "host-steady-rate", format(result.steadyRate, 2, "B/s"));
    text(doc, "host-utilization", format(result.utilization * 100, 2, "%"));
    text(doc, "host-burst-excess", format(result.burstExcess, 2, "B"));
    text(doc, "host-buffer-headroom", format(result.bufferHeadroom, 2, "B"));
    state(doc, "host-status", result.blocked ? "容量或緩衝阻擋" : result.warning ? "Burst 警告" : "介面預算通過", result.status);
    feedback(doc, "host-feedback", result.blocked ? "先提高介面容量或 buffer，並檢查 RTS/CTS、DMA／環形緩衝；平均速率通過不代表 burst 安全。" : result.warning ? "Burst 超過 UART 容量但 buffer 尚足，建議 RTS/CTS、DMA／環形緩衝或更快介面。" : "steady 與 burst 預算目前通過，仍需以 driver 與模組 FIFO 實測。", result.status);
  }

  function renderAt(doc, result) {
    text(doc, "at-classification", result.classification);
    text(doc, "at-action", result.action);
    text(doc, "at-next-state", result.nextState);
    state(doc, "at-status", result.blocked ? "解析阻擋" : result.warning ? "非預期回覆" : "狀態通過", result.status);
    feedback(doc, "at-feedback", result.line === "urc" && !result.blocked ? "URC 已獨立分流；不可因 URC 到達而完成 pending command。" : result.action, result.status);
  }

  function renderBackoff(doc, result) {
    text(doc, "backoff-nominal", format(result.nominal, 1, "s"));
    text(doc, "backoff-min", format(result.minimum, 1, "s"));
    text(doc, "backoff-max", format(result.maximum, 1, "s"));
    text(doc, "backoff-cumulative", format(result.cumulative, 1, "s"));
    state(doc, "backoff-status", result.exhausted ? "Retry 已耗盡" : "Backoff 通過", result.status);
    feedback(doc, "backoff-feedback", result.exhausted ? "attempt 已超過 max retries，停止無限重試並交給 supervisor。" : "每次 delay 有 cap，jitter 用來分散同時重連；仍需記錄 attempt、原因與最後一次錯誤。", result.status);
  }

  function renderSession(doc, result) {
    text(doc, "session-first", result.first);
    text(doc, "session-second", result.second);
    text(doc, "session-count", result.count + " / " + result.total);
    text(doc, "session-next", result.next);
    state(doc, "session-status", result.complete ? "會話 gate 通過" : "第一缺口未完成", result.status);
    feedback(doc, "session-feedback", result.complete ? "六層 gate 已依序補齊；這仍不取代封包、TLS 與實機重連驗證。" : "第一缺口不可被後段勾選抵銷：「" + result.next + "」。", result.status);
  }

  function renderData(doc, result) {
    text(doc, "data-wire-message", format(result.wireMessage, 1, "B/message"));
    text(doc, "data-daily", format(result.daily, 1, "B/day"));
    text(doc, "data-period", format(result.period, 1, "B"));
    text(doc, "data-baseline", format(result.baseline, 1, "B"));
    text(doc, "data-saving", format(result.saving, 2, "%"));
    state(doc, "data-status", result.warning ? "編碼膨脹警告" : "預算完成", result.status);
    feedback(doc, "data-feedback", "這是簡化資料預算；實際仍可能包含 IP／TCP／TLS、握手、重送與營運商計量。", result.status);
  }

  function renderKeepalive(doc, result) {
    text(doc, "keepalive-wakes", format(result.wakes, 0, "次"));
    text(doc, "keepalive-bytes", format(result.keepaliveBytes, 0, "B"));
    text(doc, "reconnect-bytes", format(result.reconnectBytes, 0, "B"));
    text(doc, "keepalive-byte-winner", result.byteWinner);
    state(doc, "keepalive-verdict", result.verdict, result.status);
    state(doc, "keepalive-status", result.reachability === "rare" ? "低可達性需評估睡眠" : "可達性策略完成", result.status);
    feedback(doc, "keepalive-feedback", "Bytes 比較不等於能耗比較；radio 喚醒、PSM／eDRX、批次上傳與實際電流剖面仍需另行驗證。" + (result.reachability === "rare" ? " 目前是 rare，請評估 PSM、eDRX 或批次上傳。" : " frequent 可先評估持續會話。"), result.status);
  }

  function renderSupervisor(doc, result) {
    text(doc, "supervisor-first", result.first);
    text(doc, "supervisor-second", result.second);
    text(doc, "supervisor-count", result.count + " / " + result.total);
    text(doc, "supervisor-blocker", result.blocker);
    state(doc, "supervisor-status", result.complete ? "必要 gate 通過" : "必要 gate 未閉合", result.status);
    feedback(doc, "supervisor-feedback", result.complete ? "此故障情境的必要升級項目已完成；仍需以故障注入與量產 log 驗證。" : "第一個必要項目未完成：「" + result.blocker + "」。總勾選數不能抵銷情境 gate。", result.status);
  }

  function readModule(doc, key) {
    var numeric = {
      "host-link": ["host-baud", "host-bits-byte", "host-payload-bytes", "host-message-rate", "host-burst-rate", "host-burst-ms", "host-buffer-bytes"],
      backoff: ["backoff-base", "backoff-attempt", "backoff-cap", "backoff-jitter", "backoff-max-retries"],
      "data-budget": ["data-payload", "data-encoding-ratio", "data-overhead", "data-messages-day", "data-delivery-factor", "data-days"],
      keepalive: ["keepalive-seconds", "keepalive-session-hours", "keepalive-roundtrip-bytes", "keepalive-reports", "keepalive-reconnect-bytes"]
    };
    var selects = {
      "bearer-choice": ["bearer-range", "bearer-payload", "bearer-power", "bearer-infrastructure", "bearer-downlink"],
      "at-engine": ["at-state", "at-line", "at-command-pending", "at-urc-handler", "at-transparent-guard"],
      session: ["session-case"], keepalive: ["keepalive-reachability"], supervisor: ["supervisor-case"]
    };
    if (numeric[key]) return readNumbers(doc, numeric[key]);
    if (selects[key]) return readSelects(doc, selects[key]);
    return { ok: false, error: "未知模組" };
  }

  function runModule(doc, key) {
    var input = readModule(doc, key);
    if (!input.ok) { clearModule(doc, key, input.error); return; }
    var result;
    if (key === "bearer-choice") result = safeRun(calculateBearer, input.value);
    else if (key === "host-link") result = safeRun(calculateHostLink, input.value);
    else if (key === "at-engine") result = safeRun(calculateAtEngine, input.value);
    else if (key === "backoff") result = safeRun(calculateBackoff, input.value);
    else if (key === "session") result = safeRun(calculateSession, input.value, checks(doc, "[data-session-check]"));
    else if (key === "data-budget") result = safeRun(calculateDataBudget, input.value);
    else if (key === "keepalive") {
      var keepaliveInput = readModule(doc, key);
      if (keepaliveInput.ok) keepaliveInput.value["keepalive-reachability"] = get(doc, "keepalive-reachability").value;
      result = keepaliveInput.ok ? safeRun(calculateKeepalive, keepaliveInput.value) : keepaliveInput;
    } else result = safeRun(calculateSupervisor, input.value, checks(doc, "[data-supervisor-check]"));
    if (!result.ok) { clearModule(doc, key, result.error); return; }
    if (key === "bearer-choice") renderBearer(doc, result.value);
    if (key === "host-link") renderHost(doc, result.value);
    if (key === "at-engine") renderAt(doc, result.value);
    if (key === "backoff") renderBackoff(doc, result.value);
    if (key === "session") renderSession(doc, result.value);
    if (key === "data-budget") renderData(doc, result.value);
    if (key === "keepalive") renderKeepalive(doc, result.value);
    if (key === "supervisor") renderSupervisor(doc, result.value);
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
      if (section.classList) {
        section.classList.toggle("is-active", active);
        section.classList.toggle("is-current", active);
      }
      if (section.setAttribute) section.setAttribute("aria-hidden", active ? "false" : "true");
    });
    all(doc, "[data-nav]").forEach(function (button) {
      var active = button.getAttribute("data-nav") === key;
      if (button.classList) button.classList.toggle("is-active", active);
      if (button.setAttribute) {
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      }
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
    if (key === "session") all(doc, "[data-session-check]").forEach(function (input) {
      if (Object.prototype.hasOwnProperty.call(defaults, input.id)) input.checked = defaults[input.id] === true;
    });
    if (key === "supervisor") all(doc, "[data-supervisor-check]").forEach(function (input) {
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
    MODULE_KEYS.forEach(function (key) { setDefaults(doc, key); });
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
        saveProgress(rootObject, completed);
        updateProgress(doc, completed);
      });
    });
    var resetProgress = get(doc, "reset-progress");
    if (resetProgress) resetProgress.addEventListener("click", function () {
      completed = {};
      saveProgress(rootObject, completed);
      updateProgress(doc, completed);
    });
    all(doc, "[data-reset-module]").forEach(function (button) {
      if (String(button.tagName).toLowerCase() === "button") button.setAttribute("type", "button");
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-reset-module");
        setDefaults(doc, key);
        runModule(doc, key);
      });
    });
    var fieldToModule = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      Object.keys(DEFAULTS[key]).forEach(function (id) { fieldToModule[id] = key; });
    });
    Object.keys(fieldToModule).forEach(function (id) {
      var input = get(doc, id);
      if (!input) return;
      ["input", "change"].forEach(function (eventName) {
        input.addEventListener(eventName, function () { runModule(doc, fieldToModule[id]); });
      });
    });
    all(doc, "[data-session-check]").forEach(function (input) {
      ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { runModule(doc, "session"); }); });
    });
    all(doc, "[data-supervisor-check]").forEach(function (input) {
      ["input", "change"].forEach(function (eventName) { input.addEventListener(eventName, function () { runModule(doc, "supervisor"); }); });
    });
    updateProgress(doc, completed);
    MODULE_KEYS.forEach(function (key) { runModule(doc, key); });
  }

  return {
    MODULE_KEYS: MODULE_KEYS.slice(), STORAGE_KEY: STORAGE_KEY, defaults: DEFAULTS,
    calculateBearer: calculateBearer, calculateHostLink: calculateHostLink, calculateAtEngine: calculateAtEngine,
    calculateBackoff: calculateBackoff, calculateSession: calculateSession, calculateDataBudget: calculateDataBudget,
    calculateKeepalive: calculateKeepalive, calculateSupervisor: calculateSupervisor, init: init
  };
}));

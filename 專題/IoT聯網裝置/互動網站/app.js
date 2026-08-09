(function () {
  "use strict";

  var MODULES = [
    "mission",
    "architecture",
    "connectivity",
    "power",
    "pulse",
    "firmware",
    "diagnosis",
    "production"
  ];
  var STORAGE_KEY = "engineerStudy.iotInteractive.v1";
  var root = document;

  function $(selector, context) {
    return (context || root).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || root).querySelectorAll(selector));
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value;
    }
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-");
  }

  function normalizedControlValue(element) {
    if (!element) {
      return "";
    }
    var option = element.options && element.options[element.selectedIndex];
    return normalize((element.value || "") + " " + (option ? option.textContent : ""));
  }

  function setActive(elements, activeElement, className) {
    elements.forEach(function (element) {
      element.classList.toggle(className || "is-active", element === activeElement);
    });
  }

  function parseNumber(element) {
    if (!element || String(element.value).trim() === "") {
      return NaN;
    }
    var value = Number(element.value);
    return Number.isFinite(value) ? value : NaN;
  }

  function format(value, digits) {
    if (!Number.isFinite(value)) {
      return "無法計算";
    }
    return value.toFixed(digits);
  }

  function appendLog(container, message) {
    if (!container) {
      return;
    }
    var line = document.createElement(container.tagName === "UL" || container.tagName === "OL" ? "li" : "p");
    if (container.classList.contains("firmware-log")) {
      var time = document.createElement("time");
      time.textContent = new Date().toLocaleTimeString("zh-TW", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      var level = document.createElement("span");
      level.className = "log-event";
      level.textContent = "EVENT";
      var text = document.createElement("span");
      text.textContent = message;
      line.appendChild(time);
      line.appendChild(level);
      line.appendChild(text);
    } else {
      line.textContent = message;
    }
    container.appendChild(line);
    while (container.children.length > 24) {
      container.removeChild(container.firstElementChild);
    }
    container.scrollTop = container.scrollHeight;
  }

  function readProgress() {
    var blank = { completed: {} };
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return blank;
      }
      var saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object" || !saved.completed || typeof saved.completed !== "object") {
        return blank;
      }
      MODULES.forEach(function (module) {
        blank.completed[module] = saved.completed[module] === true;
      });
      return blank;
    } catch (error) {
      return blank;
    }
  }

  function initProgress() {
    var state = readProgress();
    var fill = $("#progress-fill");
    var track = $(".progress-track");
    var label = $("#progress-label");
    var reset = $("#reset-progress");
    var completeButtons = $$('[data-complete]');

    function save() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 1,
          completed: state.completed
        }));
      } catch (error) {
        setText(label, "進度暫時無法儲存");
      }
    }

    function render() {
      var completedCount = MODULES.filter(function (module) {
        return state.completed[module] === true;
      }).length;
      var percent = Math.round(completedCount / MODULES.length * 100);
      if (fill) {
        fill.style.width = percent + "%";
        fill.setAttribute("aria-valuenow", String(percent));
      }
      if (track) {
        track.setAttribute("aria-valuenow", String(percent));
      }
      setText(label, "已完成 " + completedCount + " / " + MODULES.length + " 個模組（" + percent + "%）");
      completeButtons.forEach(function (button) {
        var module = button.getAttribute("data-complete");
        var complete = state.completed[module] === true;
        button.classList.toggle("is-complete", complete);
        button.setAttribute("aria-pressed", String(complete));
        if (complete) {
          button.setAttribute("data-completed", "true");
        } else {
          button.removeAttribute("data-completed");
        }
      });
    }

    completeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var module = button.getAttribute("data-complete");
        if (MODULES.indexOf(module) === -1) {
          setText(label, "無效的模組完成標記：" + (module || "未指定"));
          return;
        }
        state.completed[module] = true;
        save();
        render();
      });
    });

    if (reset) {
      reset.addEventListener("click", function () {
        MODULES.forEach(function (module) {
          state.completed[module] = false;
        });
        save();
        render();
        setText(label, "進度已清除：0 / " + MODULES.length + " 個模組（0%）");
      });
    }
    render();
  }

  function initNavigation() {
    var buttons = $$('[data-nav]');
    var sections = $$(".learning-module[data-module]");

    function show(module) {
      if (MODULES.indexOf(module) === -1) {
        setText($("#progress-label"), "無效的模組導航：「" + (module || "未指定") + "」。");
        return;
      }
      buttons.forEach(function (button) {
        var active = button.getAttribute("data-nav") === module;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-current", active ? "page" : "false");
      });
      sections.forEach(function (section) {
        var active = section.getAttribute("data-module") === module;
        section.classList.toggle("is-active", active);
        section.hidden = !active;
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        show(button.getAttribute("data-nav"));
      });
    });

    var initial = buttons.map(function (button) {
      return button.getAttribute("data-nav");
    }).filter(function (module) {
      return MODULES.indexOf(module) !== -1;
    })[0] || "mission";
    show(initial);
  }

  var architectureDetails = {
    sensor: {
      responsibility: "感測器把物理量轉成可讀取的電壓或數位資料。",
      input: "溫度、壓力、光線或電池電壓等物理量。",
      output: "I2C、SPI、ADC 等介面上的樣本資料。",
      fault: "未上電、量測雜訊、位址衝突或取樣時序錯誤。"
    },
    power: {
      responsibility: "電源樹提供各電源域需要的電壓、電流與瞬態餘裕。",
      input: "電池或外部輸入，以及負載的平均與脈衝需求。",
      output: "MCU、感測器與通訊模組的穩定電源軌。",
      fault: "壓降、ESR 或走線造成的瞬態塌陷、雜訊與欠壓重置。"
    },
    mcu: {
      responsibility: "MCU 執行取樣、資料處理、電源管理與非阻塞控制流程。",
      input: "感測器資料、模組回應、URC、計時器與喚醒事件。",
      output: "資料封包、AT 命令、GPIO 控制與電源狀態切換。",
      fault: "阻塞等待、緩衝區溢位、看門狗觸發或狀態邏輯錯誤。"
    },
    module: {
      responsibility: "通訊模組處理無線註冊、TCP/IP、TLS 或主機介面協定。",
      input: "MCU 的 AT 命令、設定與待傳資料。",
      output: "URC、註冊結果、連線狀態與雲端方向的資料流。",
      fault: "註冊逾時、UART 流量失配、無回應、覆蓋不足或電流脈衝過大。"
    },
    antenna: {
      responsibility: "天線把模組的射頻訊號耦合到空間，並影響鏈路品質。",
      input: "模組射頻輸出與匹配網路。",
      output: "無線電磁能量與接收訊號。",
      fault: "匹配、布局、接地、外殼或天線配置不符，造成效率與覆蓋下降。"
    },
    network: {
      responsibility: "無線網路提供接取、覆蓋與到達雲端的傳輸路徑。",
      input: "裝置的無線訊號、註冊資訊與網路條件。",
      output: "可用的 IP 或廣域連線，以及延遲、重傳與拒絕結果。",
      fault: "訊號不足、基地台或 AP 不可用、資源限制與服務拒絕。"
    },
    cloud: {
      responsibility: "雲端端點接收、驗證、儲存或處理裝置資料。",
      input: "經過模組網路與 TLS 的應用層訊息。",
      output: "確認、回應、命令或應用層錯誤。",
      fault: "憑證或時間錯誤、端點拒絕、協定不符與服務逾時。"
    }
  };

  var flowDetails = {
    data: {
      title: "資料流",
      summary: "感測器樣本由 MCU 整理，再交給通訊模組送往網路與雲端。"
    },
    control: {
      title: "控制流",
      summary: "MCU 以命令與事件協調感測器、模組、電源狀態及雲端回應。"
    },
    energy: {
      title: "能量流",
      summary: "電池經電源樹供應各電源域；發射脈衝需要獨立檢查瞬態餘裕。"
    }
  };

  function renderArchitectureDetail(detail, flow) {
    var target = $("#architecture-detail");
    if (!target) {
      return;
    }
    if (!detail || !flow) {
      setText(target, "無效的系統圖選擇：請先選擇有效的資料、控制或能量模式，再選取節點。");
      return;
    }
    target.textContent = "";
    var title = document.createElement("strong");
    title.textContent = (detail.name || "節點") + "｜" + flow.title;
    target.appendChild(title);
    var summary = document.createElement("p");
    summary.textContent = flow.summary;
    target.appendChild(summary);
    [
      ["責任", detail.responsibility],
      ["輸入", detail.input],
      ["輸出", detail.output],
      ["常見故障", detail.fault]
    ].forEach(function (item) {
      var paragraph = document.createElement("p");
      paragraph.textContent = item[0] + "：" + item[1];
      target.appendChild(paragraph);
    });
  }

  function initArchitecture() {
    var flowButtons = $$('[data-flow]');
    var nodes = $$(".system-node[data-node]");
    var activeFlow = "data";
    var activeNode = "mcu";
    var flowLabels = { data: "資料流", control: "控制流", energy: "能量流" };
    var nodeLabels = {
      sensor: "感測器",
      power: "電源樹",
      mcu: "MCU",
      module: "通訊模組",
      antenna: "天線",
      network: "無線網路",
      cloud: "雲端"
    };

    function selectFlow(flow) {
      if (!flowDetails[flow]) {
        renderArchitectureDetail(null, null);
        return;
      }
      activeFlow = flow;
      setActive(flowButtons, flowButtons.filter(function (button) {
        return button.getAttribute("data-flow") === flow;
      })[0]);
      flowButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.getAttribute("data-flow") === flow));
      });
      renderArchitectureDetail(Object.assign({}, architectureDetails[activeNode], { name: nodeLabels[activeNode] }), flowDetails[activeFlow]);
    }

    function selectNode(nodeElement) {
      var node = nodeElement.getAttribute("data-node");
      if (!architectureDetails[node]) {
        renderArchitectureDetail(null, null);
        return;
      }
      activeNode = node;
      setActive(nodes, nodeElement);
      nodes.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === nodeElement));
      });
      renderArchitectureDetail(Object.assign({}, architectureDetails[activeNode], { name: nodeLabels[activeNode] }), flowDetails[activeFlow]);
    }

    flowButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectFlow(button.getAttribute("data-flow"));
      });
    });
    nodes.forEach(function (node) {
      node.addEventListener("click", function () {
        selectNode(node);
      });
      node.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node);
        }
      });
    });
    selectFlow(activeFlow);
    if (nodes.length) {
      selectNode(nodes.filter(function (node) {
        return node.getAttribute("data-node") === activeNode;
      })[0] || nodes[0]);
    } else {
      renderArchitectureDetail(null, null);
    }
    if (flowButtons.length && !flowLabels[activeFlow]) {
      setText($("#architecture-detail"), "無效的資料流模式。");
    }
  }

  var choiceAliases = {
    range: {
      short: ["short", "近距離", "短", "室內", "local"],
      medium: ["medium", "campus", "園區", "中距離", "中", "區域", "區域網路"],
      long: ["long", "長距離", "長", "廣域", "wide"]
    },
    payload: {
      tiny: ["tiny", "small", "少量", "小", "低", "數筆"],
      medium: ["medium", "中", "中量"],
      large: ["large", "大", "大量", "高", "ota"]
    },
    power: {
      battery: ["battery", "電池", "低功耗", "low", "低"],
      balanced: ["balanced", "平衡", "中", "medium"],
      mains: ["mains", "市電", "高功耗", "high", "高"]
    },
    infra: {
      local: ["local", "nearby", "近端", "ap", "wifi", "既有ap", "既有 ap"],
      private: ["private", "自建", "閘道", "gateway", "基地台"],
      cellular: ["cellular", "shared", "公共", "蜂巢", "電信", "operator", "廣域"],
      none: ["none", "無", "沒有", "no-infra", "不依賴"]
    }
  };

  function classifyChoice(value, category) {
    var text = normalize(value);
    var aliases = choiceAliases[category] || {};
    var keys = Object.keys(aliases);
    for (var i = 0; i < keys.length; i += 1) {
      if (aliases[keys[i]].some(function (alias) {
        return text.indexOf(normalize(alias)) !== -1;
      })) {
        return keys[i];
      }
    }
    return null;
  }

  function initConnectivity() {
    var range = $("#link-range");
    var payload = $("#link-payload");
    var power = $("#link-power");
    var infra = $("#link-infra");
    var results = $("#link-results");
    var technologies = [
      { key: "BLE", name: "BLE", ideal: { range: "short", payload: "tiny", power: "battery", infra: "local" }, base: 73 },
      { key: "Wi-Fi", name: "Wi-Fi", ideal: { range: "medium", payload: "large", power: "mains", infra: "local" }, base: 73 },
      { key: "LoRa", name: "LoRa", ideal: { range: "long", payload: "tiny", power: "battery", infra: "private" }, base: 73 },
      { key: "NB-IoT", name: "NB-IoT", ideal: { range: "long", payload: "medium", power: "balanced", infra: "cellular" }, base: 73 }
    ];

    function score(technology, values) {
      var total = technology.base;
      ["range", "payload", "power", "infra"].forEach(function (dimension) {
        if (technology.ideal[dimension] === values[dimension]) {
          total += 6;
        } else {
          total -= 4;
        }
      });
      return Math.max(0, Math.min(100, total));
    }

    function reasons(technology, values) {
      var reasonMap = {
        "BLE:range": "近距離與低資料量匹配",
        "BLE:power": "電池裝置的功耗取向較合適",
        "Wi-Fi:payload": "較大的資料量與吞吐量較合適",
        "Wi-Fi:infra": "可利用既有 AP，部署銜接直接",
        "LoRa:range": "長距離、低資料量的取向相符",
        "LoRa:power": "低功耗與低頻率上傳較合適",
        "NB-IoT:range": "廣域蜂巢覆蓋取向相符",
        "NB-IoT:infra": "適合已有電信網路覆蓋的部署"
      };
      var matched = [];
      ["range", "payload", "power", "infra"].forEach(function (dimension) {
        if (technology.ideal[dimension] === values[dimension]) {
          var reason = reasonMap[technology.key + ":" + dimension];
          if (reason) {
            matched.push(reason);
          }
        }
      });
      if (matched.length < 2) {
        matched.push("需再以現場覆蓋、法規、資費與實測確認");
      }
      if (matched.length < 2) {
        matched.push("評分是教學啟發式，不是工程保證");
      }
      return matched.slice(0, 2);
    }

    function render() {
      if (!results) {
        return;
      }
      var values = {
        range: classifyChoice(normalizedControlValue(range), "range"),
        payload: classifyChoice(normalizedControlValue(payload), "payload"),
        power: classifyChoice(normalizedControlValue(power), "power"),
        infra: classifyChoice(normalizedControlValue(infra), "infra")
      };
      var invalid = Object.keys(values).filter(function (key) {
        return !values[key];
      });
      if (invalid.length) {
        results.textContent = "無效選項：" + invalid.join("、") + "。請為所有連線條件選擇有效值後再比較。";
        return;
      }
      var ranked = technologies.map(function (technology) {
        return {
          technology: technology,
          score: score(technology, values),
          reasons: reasons(technology, values)
        };
      }).sort(function (left, right) {
        return right.score - left.score;
      });
      results.textContent = "";
      var note = document.createElement("p");
      note.textContent = "教學啟發式排序；不取代法規、涵蓋、資費或現場測試。";
      results.appendChild(note);
      ranked.forEach(function (item, index) {
        var row = document.createElement("div");
        row.className = "link-result";
        row.setAttribute("data-link-result", item.technology.key);
        var title = document.createElement("strong");
        title.textContent = (index + 1) + ". " + item.technology.name + "：" + item.score + " / 100";
        row.appendChild(title);
        var explanation = document.createElement("p");
        explanation.textContent = item.reasons.join("；") + "。";
        row.appendChild(explanation);
        results.appendChild(row);
      });
    }

    [range, payload, power, infra].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  function initPower() {
    var fields = {
      sleepCurrent: $("#sleep-current"),
      sleepTime: $("#sleep-time"),
      sampleCurrent: $("#sample-current"),
      sampleTime: $("#sample-time"),
      txCurrent: $("#tx-current"),
      txTime: $("#tx-time"),
      capacity: $("#battery-capacity"),
      derating: $("#battery-derating")
    };
    var defaults = {
      sleepCurrent: "0.01",
      sleepTime: "99",
      sampleCurrent: "30",
      sampleTime: "0.9",
      txCurrent: "200",
      txTime: "0.1",
      capacity: "2000",
      derating: "0.8"
    };
    Object.keys(fields).forEach(function (key) {
      if (fields[key] && String(fields[key].value).trim() === "") {
        fields[key].value = defaults[key];
      }
    });
    var outputs = {
      average: $("#average-current"),
      hours: $("#battery-life-hours"),
      days: $("#battery-life-days"),
      bars: $("#power-bars")
    };

    function render() {
      var values = {};
      var invalid = [];
      Object.keys(fields).forEach(function (key) {
        values[key] = parseNumber(fields[key]);
        if (!Number.isFinite(values[key]) || values[key] < 0) {
          invalid.push(key);
        }
      });
      var totalTime = values.sleepTime + values.sampleTime + values.txTime;
      if (!Number.isFinite(totalTime) || totalTime <= 0) {
        invalid.push("總時間");
      }
      if (invalid.length) {
        setText(outputs.average, "—");
        setText(outputs.hours, "—");
        setText(outputs.days, "—");
        setText(outputs.bars, "尚未產生功耗剖面");
        return;
      }
      var charge = values.sleepCurrent * values.sleepTime + values.sampleCurrent * values.sampleTime + values.txCurrent * values.txTime;
      var average = charge / totalTime;
      if (average === 0) {
        setText(outputs.average, "0.000");
        setText(outputs.hours, "∞");
        setText(outputs.days, "∞");
        setText(outputs.bars, "三種狀態皆為 0 mA；請仍以實測確認漏電與自放電。");
        return;
      }
      var hours = values.capacity * values.derating / average;
      var days = hours / 24;
      setText(outputs.average, format(average, 3));
      setText(outputs.hours, format(hours, 1));
      setText(outputs.days, format(days, 1));
      if (outputs.bars) {
        outputs.bars.dataset.averageCurrent = String(average);
        outputs.bars.dataset.peakCurrent = String(Math.max(values.sleepCurrent, values.sampleCurrent, values.txCurrent));
        var bars = $$('[data-power-bar]', outputs.bars);
        if (bars.length) {
          var maximum = Math.max(values.sleepCurrent, values.sampleCurrent, values.txCurrent, 1);
          bars.forEach(function (bar) {
            var state = normalize(bar.getAttribute("data-power-bar"));
            var current = state === "sleep" ? values.sleepCurrent : state === "sample" ? values.sampleCurrent : values.txCurrent;
            bar.style.width = Math.min(100, current / maximum * 100) + "%";
            bar.setAttribute("aria-valuenow", String(current));
            setText($('[data-power-value="' + state + '"]', outputs.bars), format(current, state === "sleep" ? 3 : state === "sample" ? 2 : 1) + " mA");
          });
        } else {
          setText(outputs.bars, "睡眠 " + format(values.sleepCurrent, 3) + " mA｜取樣 " + format(values.sampleCurrent, 2) + " mA｜發射 " + format(values.txCurrent, 1) + " mA；理想估算未含溫度、老化、自放電與脈衝能力。");
        }
      }
    }

    Object.keys(fields).forEach(function (key) {
      if (fields[key]) {
        fields[key].addEventListener("input", render);
        fields[key].addEventListener("change", render);
      }
    });
    render();
  }

  function initPulse() {
    var fields = {
      current: $("#pulse-delta-current"),
      duration: $("#pulse-duration"),
      esr: $("#pulse-esr"),
      capacitance: $("#pulse-capacitance"),
      allowable: $("#pulse-allowable-droop")
    };
    var outputs = {
      required: $("#pulse-cap-required"),
      esrDroop: $("#pulse-esr-droop"),
      totalDroop: $("#pulse-total-droop"),
      verdict: $("#pulse-verdict")
    };

    function render() {
      var current = parseNumber(fields.current);
      var duration = parseNumber(fields.duration);
      var esr = parseNumber(fields.esr);
      var capacitance = parseNumber(fields.capacitance);
      var allowable = parseNumber(fields.allowable);
      var values = [current, duration, esr, capacitance, allowable];
      if (!Number.isFinite(current) || current < 0 || !Number.isFinite(duration) || duration < 0 || !Number.isFinite(esr) || esr < 0 || !Number.isFinite(capacitance) || capacitance <= 0 || !Number.isFinite(allowable) || allowable <= 0) {
        setText(outputs.required, "—");
        setText(outputs.esrDroop, "—");
        setText(outputs.totalDroop, "—");
        setText(outputs.verdict, "請輸入大於 0 的電流、時間、ESR、電容量與允許壓降。");
        return;
      }
      var durationSeconds = duration / 1000;
      var esrDrop = current * esr;
      var capacitanceDrop = current * durationSeconds / (capacitance * 1e-6);
      var totalDrop = esrDrop + capacitanceDrop;
      var availableForCap = allowable - esrDrop;
      var requiredMicrofarads = availableForCap > 0 ? current * durationSeconds / availableForCap * 1e6 : Infinity;
      setText(outputs.required, Number.isFinite(requiredMicrofarads) ? format(requiredMicrofarads, 1) : "無有限值");
      setText(outputs.esrDroop, format(esrDrop, 3));
      setText(outputs.totalDroop, format(totalDrop, 3));
      if (esrDrop >= allowable) {
        setText(outputs.verdict, "不符合：ESR 壓降已達到或超過允許壓降；只增加電容量仍無法滿足條件，應先降低 ESR 或改善供電路徑。");
      } else if (totalDrop <= allowable) {
        setText(outputs.verdict, "符合教學近似：目前電容量的總壓降低於允許值；最低估算電容量為 " + format(requiredMicrofarads, 1) + " µF。這是電容獨力支撐短暫電流階躍的前期估算，仍需 datasheet、電源動態響應與佈局驗證。");
      } else {
        setText(outputs.verdict, "不足：目前電容量的總壓降超過允許值；至少需要約 " + format(requiredMicrofarads, 1) + " µF，且仍須驗證 ESR、電源動態響應與佈局。");
      }
    }

    Object.keys(fields).forEach(function (key) {
      if (fields[key]) {
        fields[key].addEventListener("input", render);
        fields[key].addEventListener("change", render);
      }
    });
    render();
  }

  var FIRMWARE_STATES = ["OFF", "BOOT", "INIT", "REGISTERING", "ONLINE", "BACKOFF", "HARD_RESET", "SLEEP"];
  var FIRMWARE_EVENT_LABELS = {
    power: "上電",
    "init-ok": "初始化成功",
    "register-ok": "註冊成功",
    timeout: "逾時",
    "link-drop": "連線掉線",
    retry: "重試",
    "no-response": "模組無回應",
    sleep: "睡眠",
    wake: "喚醒"
  };

  function initFirmware() {
    var stateElement = $("#firmware-state");
    var log = $("#firmware-log");
    var reset = $("#firmware-reset");
    var eventButtons = $$('[data-fw-event]');
    var state = "OFF";
    var noResponseCount = 0;

    function renderState() {
      setText(stateElement, state);
      if (stateElement) {
        stateElement.dataset.state = state;
      }
      $$(".state-step").forEach(function (step) {
        var label = $("span", step);
        step.classList.toggle("active", Boolean(label && label.textContent.trim().toUpperCase() === state));
      });
      $$(".state-secondary span").forEach(function (label) {
        label.classList.toggle("active", label.textContent.trim().toUpperCase() === state);
      });
    }

    function invalid(eventName, reason) {
      appendLog(log, "無效事件「" + (FIRMWARE_EVENT_LABELS[eventName] || eventName || "未指定") + "」：目前為 " + state + "，" + reason + "。");
    }

    function transition(eventName) {
      if (!FIRMWARE_EVENT_LABELS[eventName]) {
        invalid(eventName, "事件不在狀態機契約中");
        return;
      }
      var next = null;
      var reason = "此狀態不接受該事件";
      if (eventName === "no-response") {
        if (["BOOT", "INIT", "REGISTERING", "ONLINE", "BACKOFF"].indexOf(state) === -1) {
          invalid(eventName, reason);
          return;
        }
        noResponseCount += 1;
        if (noResponseCount >= 3) {
          next = "HARD_RESET";
          reason = "連續 3 次無回應，進入硬重啟";
        } else {
          appendLog(log, "模組無回應第 " + noResponseCount + " 次：保留 " + state + "，先等待或依策略重試。");
          return;
        }
      } else if (eventName === "power" && state === "OFF") {
        next = "BOOT";
      } else if (eventName === "power" && state === "HARD_RESET") {
        next = "BOOT";
        reason = "硬重啟完成並重新開機";
      } else if (eventName === "init-ok" && state === "BOOT") {
        next = "INIT";
      } else if (eventName === "init-ok" && state === "INIT") {
        next = "REGISTERING";
      } else if (eventName === "register-ok" && state === "REGISTERING") {
        next = "ONLINE";
        noResponseCount = 0;
        reason = "註冊成功，重設無回應計數";
      } else if (eventName === "timeout" && ["INIT", "REGISTERING", "ONLINE"].indexOf(state) !== -1) {
        next = "BACKOFF";
        reason = "逾時後進入有界退避，避免阻塞等待";
      } else if (eventName === "link-drop" && state === "ONLINE") {
        next = "BACKOFF";
        reason = "掉線後交由連線管理退避重連";
      } else if (eventName === "retry" && state === "BACKOFF") {
        next = "REGISTERING";
      } else if (eventName === "sleep" && state === "ONLINE") {
        next = "SLEEP";
      } else if (eventName === "wake" && state === "SLEEP") {
        next = "BOOT";
      } else {
        invalid(eventName, reason);
        return;
      }
      var previous = state;
      state = next;
      renderState();
      appendLog(log, previous + " → " + state + "（" + FIRMWARE_EVENT_LABELS[eventName] + "" + (reason !== "此狀態不接受該事件" ? "；" + reason : "") + "）");
    }

    eventButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        transition(normalize(button.getAttribute("data-fw-event")));
      });
    });
    if (reset) {
      reset.addEventListener("click", function () {
        state = "OFF";
        noResponseCount = 0;
        renderState();
        if (log) {
          log.textContent = "";
        }
        appendLog(log, "狀態機已重設為 OFF；可接受事件：上電。");
      });
    }
    if (FIRMWARE_STATES.indexOf(state) === -1) {
      state = "OFF";
    }
    renderState();
    appendLog(log, "初始狀態 OFF；請先上電。");
  }

  var diagnosisCases = {
    reset: {
      title: "偶發模組重啟",
      guide: "先量測模組電源軌與發射電流脈衝，再檢查 bulk cap、ESR、走線與欠壓紀錄。",
      checks: [
        ["rail", "模組電源軌與電流脈衝"],
        ["bulk-cap", "bulk cap、ESR 與供電走線"],
        ["brownout", "欠壓重置紀錄與重啟時間"]
      ]
    },
    drain: {
      title: "電池過快耗盡",
      guide: "先量測真實電流剖面，再找未睡周邊、LDO Iq、喚醒頻率與重連。",
      checks: [
        ["rail", "真實電流剖面"],
        ["bulk-cap", "未睡周邊與電源域"],
        ["brownout", "LDO 靜態電流 Iq"],
        ["at-log", "喚醒頻率與重連行為"]
      ]
    },
    storm: {
      title: "重連風暴",
      guide: "先看 URC/AT log 與 backoff，再確認覆蓋、逾時與 supervisor 門檻。",
      checks: [
        ["rail", "URC/AT log"],
        ["bulk-cap", "backoff 退避計時"],
        ["brownout", "覆蓋與註冊逾時"],
        ["at-log", "supervisor 重試門檻"]
      ]
    }
  };

  function initDiagnosis() {
    var caseButtons = $$('[data-case]');
    var checkButtons = $$('[data-diagnostic-check]');
    var feedback = $("#diagnosis-feedback");
    var evidence = $("#diagnosis-evidence");
    var counter = $(".checklist-panel .panel-state");
    var evidenceCount = $(".evidence-count");
    var currentCase = null;
    var completed = [];

    function checkKey(button) {
      return normalize(button.getAttribute("data-diagnostic-check") || button.getAttribute("data-check") || button.textContent);
    }

    function canonicalKey(value, checks) {
      var normalized = normalize(value);
      var exact = checks.filter(function (check) {
        return normalized === normalize(check[0]) || normalized.indexOf(normalize(check[0])) !== -1;
      })[0];
      if (exact) {
        return exact[0];
      }
      var aliases = {
        power: "rail",
        "power-rail": "rail",
        current: "profile",
        "current-profile": "profile",
        pulse: "rail",
        "current-pulse": "rail",
        cap: "bulk",
        "bulk-cap": "bulk",
        esr: "bulk",
        undervoltage: "uvlo",
        "undervoltage-log": "uvlo",
        sleep: "peripheral",
        "sleep-peripheral": "peripheral",
        "lto-iq": "ldo",
        "ldo-iq": "ldo",
        reconnect: "wake",
        "wake-reconnect": "wake",
        urc: "at",
        log: "at",
        "urc-at-log": "at",
        retry: "backoff",
        "backoff-retry": "backoff",
        timeout: "coverage",
        "coverage-timeout": "coverage",
        supervisor: "supervisor"
      };
      if (aliases[normalized]) {
        return aliases[normalized];
      }
      var aliasKey = Object.keys(aliases).filter(function (alias) {
        return normalized.indexOf(alias) !== -1;
      })[0];
      return aliasKey ? aliases[aliasKey] : "";
    }

    function renderEvidence() {
      if (!evidence) {
        return;
      }
      if (!currentCase) {
        setText(evidence, "尚未選擇診斷情境。");
        return;
      }
      var names = completed.map(function (key) {
        return diagnosisCases[currentCase].checks.filter(function (check) { return check[0] === key; })[0][1];
      });
      setText(evidence, names.length ? "已取得證據：" + names.join("；") : "尚未取得證據。第一項量測應依情境引導執行。");
      setText(counter, completed.length + " / " + diagnosisCases[currentCase].checks.length + " 已取得");
      setText(evidenceCount, completed.length ? names.length + " 件證據" : "尚無證據");
    }

    function selectCase(caseName) {
      if (!diagnosisCases[caseName]) {
        setText(feedback, "無效的診斷情境：" + (caseName || "未指定") + "。請選擇 reset、drain 或 storm。");
        return;
      }
      currentCase = caseName;
      completed = [];
      checkButtons.forEach(function (button) {
        button.checked = false;
        button.classList.remove("is-checked");
      });
      diagnosisCases[caseName].checks.forEach(function (check, index) {
        var button = checkButtons[index];
        if (!button) {
          return;
        }
        var row = button.closest("label") || button.parentElement;
        row.hidden = false;
        setText($("strong", row), check[1]);
        setText($("small", row), "依目前情境建立第 " + (index + 1) + " 項證據");
      });
      checkButtons.slice(diagnosisCases[caseName].checks.length).forEach(function (button) {
        var row = button.closest("label") || button.parentElement;
        row.hidden = true;
      });
      setActive(caseButtons, caseButtons.filter(function (button) {
        return button.getAttribute("data-case") === caseName;
      })[0]);
      setText(feedback, diagnosisCases[caseName].title + "：" + diagnosisCases[caseName].guide);
      renderEvidence();
    }

    caseButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectCase(normalize(button.getAttribute("data-case")));
      });
    });
    checkButtons.forEach(function (button) {
      button.addEventListener("change", function () {
        if (!currentCase) {
          button.checked = false;
          setText(feedback, "尚未選擇診斷情境，無法判定這項證據是否為目前的第一步。");
          return;
        }
        var checks = diagnosisCases[currentCase].checks;
        var key = canonicalKey(checkKey(button), checks);
        if (!key || !checks.some(function (check) { return check[0] === key; })) {
          button.checked = false;
          setText(feedback, "無效的診斷檢查：此項沒有對應到目前情境的證據鏈。");
          return;
        }
        if (completed.indexOf(key) !== -1) {
          button.checked = true;
          setText(feedback, "這項證據已取得；請依順序檢查下一個尚未完成的項目。");
          return;
        }
        var expected = checks[completed.length];
        if (!expected || expected[0] !== key) {
          button.checked = false;
          setText(feedback, "順序不足：目前應先檢查「" + (expected ? expected[1] : "完成交叉驗證") + "」，避免只憑症狀猜測根因。");
          return;
        }
        completed.push(key);
        button.classList.add("is-checked");
        if (completed.length === checks.length) {
          setText(feedback, "證據鏈完成：至少兩項互相呼應的量測支持「" + diagnosisCases[currentCase].title + "」判斷；請記錄修復後的回歸結果。");
        } else {
          var next = checks[completed.length];
          setText(feedback, "已取得「" + expected[1] + "」；下一步檢查「" + next[1] + "」，讓證據支持假設。");
        }
        renderEvidence();
      });
    });
    selectCase("reset");
  }

  var productionStages = {
    EVT: {
      entry: "需求、關鍵元件、原理圖與 PCB baseline",
      exit: "完成 bring-up、基本功能與主要 DFT 缺口盤點"
    },
    DVT: {
      entry: "EVT 問題關閉、設計趨於凍結、驗證治具可用",
      exit: "完成設計驗證、RF/EMC 前測與可靠度證據"
    },
    PVT: {
      entry: "DVT 通過、量產檔案與治具定版、產測流程可執行",
      exit: "試產良率、provisioning、追溯 log 與重測流程達標"
    },
    MP: {
      entry: "PVT 良率與品質穩定，BOM、流程及認證證據核准",
      exit: "量產放行，序號、韌體、測試與返修記錄完整可追溯"
    }
  };

  function taskStages(task) {
    var raw = task.getAttribute("data-stages") || task.getAttribute("data-stage") || task.getAttribute("data-applies-to") || task.getAttribute("data-production-stage") || "";
    if (!raw) {
      raw = task.getAttribute("data-production-task") || "";
    }
    var stages = String(raw).toUpperCase().match(/EVT|DVT|PVT|MP/g);
    return stages ? stages : ["EVT", "DVT", "PVT", "MP"];
  }

  function initProduction() {
    var stageButtons = $$('[data-stage]').filter(function (element) {
      return element.tagName === "BUTTON" || element.getAttribute("role") === "button";
    });
    var tasks = $$('[data-production-task]');
    var feedback = $("#production-feedback");
    var currentStage = "EVT";

    function taskLabel(task) {
      var label = task.closest("label");
      return (label || task.parentElement || task).textContent.trim().replace(/\s+/g, " ");
    }

    function taskApplies(task) {
      return taskStages(task).indexOf(currentStage) !== -1;
    }

    function render() {
      var stage = productionStages[currentStage];
      var applicable = tasks.filter(taskApplies);
      var missing = applicable.filter(function (task) { return !task.checked; });
      setText($(".production-checklist h3"), currentStage + " 進入 / 退出證據");
      setText($(".production-checklist .panel-state"), missing.length ? missing.length + " 項缺口" : "本階段已勾選");
      setText($(".stage-readout"), "CURRENT: " + currentStage);
      tasks.forEach(function (task) {
        var applies = taskApplies(task);
        var row = task.closest(".production-row") || task.closest("label") || task;
        row.hidden = !applies;
        task.setAttribute("aria-hidden", String(!applies));
      });
      if (!feedback) {
        return;
      }
      var lines = [
        "目前階段：" + currentStage,
        "進入證據：" + stage.entry,
        "退出證據：" + stage.exit
      ];
      if (missing.length) {
        lines.push("尚缺 " + missing.length + " 項適用任務：" + missing.map(taskLabel).join("；"));
      } else if (applicable.length) {
        lines.push("目前階段的任務清單已勾選完成；這不代表已取得 FCC、CE、NCC 或電信商認證。");
      } else {
        lines.push("目前沒有可判定的適用任務，無法建立進入／退出證據；請確認任務具有階段資料。");
      }
      setText(feedback, lines.join("\n"));
    }

    function selectStage(stage) {
      stage = String(stage || "").toUpperCase();
      if (!productionStages[stage]) {
        setText(feedback, "無效的量產階段：「" + (stage || "未指定") + "」。請選擇 EVT、DVT、PVT 或 MP。");
        return;
      }
      currentStage = stage;
      setActive(stageButtons, stageButtons.filter(function (button) {
        return String(button.getAttribute("data-stage")).toUpperCase() === stage;
      })[0]);
      stageButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(String(button.getAttribute("data-stage")).toUpperCase() === stage));
      });
      render();
    }

    stageButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectStage(button.getAttribute("data-stage"));
      });
    });
    tasks.forEach(function (task) {
      task.addEventListener("change", function () {
        if (!taskApplies(task)) {
          setText(feedback, "這項任務不適用於 " + currentStage + "；請切換到其適用階段後再檢查。");
          task.checked = false;
          return;
        }
        render();
      });
    });
    selectStage(currentStage);
  }

  function init() {
    initNavigation();
    initProgress();
    initArchitecture();
    initConnectivity();
    initPower();
    initPulse();
    initFirmware();
    initDiagnosis();
    initProduction();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());

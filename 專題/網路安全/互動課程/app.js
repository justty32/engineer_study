"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const requireReveal = (box) => {
  let gate = box.previousElementSibling;
  if (!gate || !gate.classList.contains("reveal-gate")) {
    gate = document.createElement("div");
    gate.className = "reveal-gate";
    const prompt = document.createElement("p");
    prompt.textContent = "先在心中預測：這組選項會如何改變狀態、控制或證據？";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "揭曉結果解讀";
    button.addEventListener("click", () => {
      box.hidden = false;
      button.textContent = "已揭曉；改變選項後可再預測";
      box.focus({ preventScroll: true });
    });
    gate.append(prompt, button);
    box.parentNode.insertBefore(gate, box);
  }
  const button = $("button", gate);
  box.hidden = true;
  box.tabIndex = -1;
  button.textContent = "揭曉結果解讀";
};

const setResult = (id, data) => {
  const box = document.getElementById(id);
  if (!box) return;
  box.dataset.tone = data.tone || "normal";
  const title = $("[data-result-title]", box);
  const why = $("[data-result-why]", box);
  if (title) title.textContent = data.title;
  if (why) why.textContent = data.why;
  Object.entries(data.fields || {}).forEach(([key, value]) => {
    const node = $(`[data-field="${key}"]`, box);
    if (node) node.textContent = value;
  });
  requireReveal(box);
};

const initWorld = () => {
  const role = $("#world-role");
  const event = $("#world-event");
  if (!role || !event) return;
  const update = () => {
    const key = `${role.value}:${event.value}`;
    const cases = {
      "customer:login": ["客戶帳號與訂單", "匿名連線變成已驗證工作階段", "限制嘗試、強式驗證、最小權限", "身分驗證日誌、來源位址、工作階段識別碼"],
      "customer:download": ["客戶可讀資料", "伺服器依身分與物件權限回傳內容", "每物件授權、傳輸加密、下載速率限制", "授權決策、物件識別碼、回應位元組數"],
      "operator:login": ["管理介面與高權限帳號", "操作者取得管理工作階段", "抗釣魚多因素驗證、受管裝置、短工作階段", "管理登入、裝置狀態、權限提升紀錄"],
      "operator:download": ["大量營運資料", "高權限程序讀取並匯出資料", "職責分離、匯出核准、異常量偵測", "查詢範圍、匯出量、目的位置、操作者身分"],
      "service:login": ["服務帳號與機器憑證", "服務以非人類身分建立通道", "工作負載身分、短效憑證、撤銷", "憑證主體、服務端點、驗證結果"],
      "service:download": ["服務間資料與介面", "後端服務依自己的權限呼叫另一服務", "雙向驗證、介面授權、網路分段", "兩端身分、介面路徑、延遲與結果碼"]
    };
    const [asset, change, control, evidence] = cases[key];
    setResult("world-result", { title: "由狀態改變開始思考", why: `安全不是產品清單。先問誰讓哪個資產發生什麼改變，再找阻止、偵測與還原它的機制。`, fields: { asset, change, control, evidence } });
  };
  role.addEventListener("change", update); event.addEventListener("change", update); update();
};

const initNetwork = () => {
  const transport = $("#net-transport");
  const port = $("#net-port");
  const address = $("#net-address");
  if (!transport || !port || !address) return;
  const update = () => {
    const tcp = transport.value === "tcp";
    const local = address.value === "private";
    const app = port.value === "443" ? "通常承載加密的網頁流量" : port.value === "53" ? "通常承載名稱查詢" : "是自訂服務，需由程序與設定確認";
    setResult("net-result", {
      title: `${tcp ? "有連線狀態" : "逐份資料報"}的傳輸`,
      why: `${local ? "私有位址通常只在受控網路內路由；跨網路常需位址轉換或閘道。" : "公開位址可被路由，不代表服務必然可達或可信。"} 連接埠只指出接收端程式入口，不能單獨證明應用身分。`,
      fields: {
        path: `應用資料 → ${tcp ? "傳輸控制協定區段" : "使用者資料包協定資料報"} → 網際網路協定封包 → 連結層訊框`,
        app,
        evidence: tcp ? "旗標、序號、確認號碼、來源／目的位址與連接埠" : "來源／目的位址、連接埠、長度與應用酬載",
        limit: "封包可見誰和誰通訊；若酬載已加密，不能直接看到應用內容。"
      }
    });
  };
  [transport, port, address].forEach(x => x.addEventListener("change", update)); update();
};

const initAccess = () => {
  const subject = $("#access-subject");
  const authenticated = $("#access-authenticated");
  const role = $("#access-role");
  const resource = $("#access-resource");
  if (!subject || !authenticated || !role || !resource) return;
  const update = () => {
    if (subject.value === "unknown") {
      authenticated.checked = false;
      authenticated.disabled = true;
    } else {
      authenticated.disabled = false;
    }
    let allow = authenticated.checked;
    let reason = allow ? "已建立主體身分，接著評估它是否有此動作的權限。" : "尚未驗證，系統不能把聲稱的名稱當成可信主體。";
    if (allow && resource.value === "admin" && role.value !== "administrator") { allow = false; reason = "已驗證不等於已授權；目前角色沒有管理設定的修改權。"; }
    if (allow && resource.value === "own-profile" && role.value === "service") { allow = false; reason = "服務角色沒有『自己的個人資料』；這是最小權限與目的限制。"; }
    if (allow && resource.value === "other-profile") { allow = false; reason = role.value === "administrator" ? "管理角色仍須提出業務目的或取得核准，不能僅憑角色讀取他人資料。" : "角色允許讀取個人資料仍不等於通過物件擁有者檢查。"; }
    setResult("access-result", { tone: allow ? "normal" : "warn", title: allow ? "允許這次動作" : "拒絕這次動作", why: reason, fields: {
      principal: `${subject.value}／${role.options[role.selectedIndex].text}`,
      decision: allow ? "允許並記錄" : "拒絕並記錄原因",
      audit: "時間、主體、驗證方法、資源、動作、決策、來源與關聯識別碼",
      boundary: "驗證證明目前持有某憑證；授權仍須逐資源與動作決定。"
    }});
  };
  [subject, role, resource].forEach(x => x.addEventListener("change", update)); authenticated.addEventListener("input", update); update();
};

const initCrypto = () => {
  const goal = $("#crypto-goal");
  if (!goal) return;
  const cases = {
    fingerprint: ["密碼雜湊函式", "不需要金鑰", "固定長度摘要與竄改線索", "不保密，也不能證明是誰產生"],
    secret: ["對稱式已驗證加密", "通訊雙方共享秘密金鑰", "內容機密性與完整性", "不自動解決金鑰如何安全交付"],
    origin: ["數位簽章", "簽署者私鑰與驗證者公鑰", "來源真實性與內容完整性", "不隱藏內容，也不保證簽署者意圖正確"],
    password: ["加鹽、刻意耗時的密碼推導函式", "每筆隨機鹽值；另可有伺服器秘密", "降低資料庫外洩後的離線猜測速度", "不能把弱密碼變成強密碼，仍需限制嘗試與多因素驗證"]
  };
  const update = () => { const [tool, key, gives, not] = cases[goal.value]; setResult("crypto-result", { title: tool, why: "先說安全目標，再選原語；『加密』不是所有密碼學工具的總稱。", fields: { key, gives, not, evidence: "演算法與參數、金鑰識別碼、驗證結果、失敗原因與時間；不要把秘密寫入日誌。" } }); };
  goal.addEventListener("change", update); update();
};

const initThreat = () => {
  const asset = $("#threat-asset"); const entry = $("#threat-entry"); const capability = $("#threat-capability"); const control = $("#threat-control");
  if (!asset || !entry || !capability || !control) return;
  const update = () => {
    const assets = { account: "帳號控制權", data: "敏感資料", service: "服務可用性" };
    const entries = { login: "公開登入入口", dependency: "第三方相依元件", internal: "內部服務介面" };
    const caps = { internet: "只能由網際網路送請求", credential: "持有一組遭竊憑證", foothold: "已控制一台內部主機" };
    const controls = { none: "尚無針對性控制", mfa: "多因素驗證與速率限制", segment: "網路分段與服務身分", supply: "簽章驗證與來源鎖定", monitor: "集中日誌與異常偵測" };
    const aligned = control.value === "none" || control.value === "monitor" || (entry.value === "login" && control.value === "mfa") || (entry.value === "internal" && control.value === "segment") || (entry.value === "dependency" && control.value === "supply");
    const high = (asset.value === "data" && capability.value === "foothold") || (asset.value === "account" && capability.value === "credential");
    const availabilityExposure = asset.value === "service" && capability.value === "internet";
    const tone = control.value === "none" ? "danger" : (!aligned || high || availabilityExposure) ? "warn" : "normal";
    setResult("threat-result", { tone, title: `${high ? "高影響情境" : availabilityExposure ? "可用性暴露需驗證" : "需驗證的威脅情境"}`, why: `若攻擊者${caps[capability.value]}，可經${entries[entry.value]}嘗試影響${assets[asset.value]}。控制只能降低可能性或影響，不會讓威脅憑空消失。`, fields: {
      boundary: `${entries[entry.value]}跨入受信任系統的位置`,
      control: controls[control.value],
      evidence: "入口請求、身分驗證、授權、程序、網路流量與資料存取的關聯紀錄",
      residual: control.value === "none" ? "缺少預防與偵測；事件可能直到使用者回報才被發現" : !aligned ? "此控制不在此路徑上；相依元件需簽章／來源鎖定等控制，監測只能協助偵測" : control.value === "monitor" ? "監測只能協助偵測，仍需對準入口的預防控制" : "仍需測試控制是否涵蓋繞過、失效、撤銷與復原"
    }});
  };
  [asset, entry, capability, control].forEach(x => x.addEventListener("change", update)); update();
};

const initAttack = () => {
  const type = $("#attack-type"); if (!type) return;
  const cases = {
    credential: ["使用者秘密已外洩或被誘騙交出", "攻擊者以看似正常的登入流程冒用身分", "建立攻擊者控制的工作階段", "抗釣魚多因素驗證、裝置／風險訊號、撤銷", "異常來源、裝置變更、失敗後成功、工作階段建立與後續存取"],
    injection: ["不受信任輸入進入命令或查詢解譯器", "資料被誤當成控制語法", "程序執行非預期動作或讀寫越權資料", "參數化介面、輸入邊界、低權限服務帳號", "異常輸入形狀、應用錯誤、子程序、資料庫查詢與回應差異"],
    interception: ["攻擊者能觀察或改寫通訊路徑", "端點沒有正確驗證對方身分或資料完整性", "秘密外洩、內容遭改寫或連到冒牌端點", "傳輸層安全性協定、憑證驗證、完整性保護", "握手失敗、憑證鏈、端點名稱、網路路徑變化與封包時序"],
    availability: ["攻擊者能大量消耗某個有限資源", "請求量或昂貴工作超過系統容量", "合法請求延遲、逾時或失敗", "限流、快取、排隊、隔離、容量與降級", "來源分布、請求率、佇列、中央處理器／記憶體、延遲與錯誤率"],
    supply: ["信任的建置、更新或相依元件遭改變", "惡意內容沿既有信任路徑進入產品", "多台系統執行被竄改的程式", "來源鎖定、可重現建置、簽章、審查與快速撤銷", "來源提交、建置身分、成品雜湊、簽章、部署批次與首次異常"]
  };
  const update = () => { const [pre, mechanism, change, defense, evidence] = cases[type.value]; setResult("attack-result", { tone: "warn", title: type.options[type.selectedIndex].text, why: "攻擊名稱只是索引；真正可診斷的是前置條件、機制、狀態改變與證據鏈。", fields: { pre, mechanism, change, defense, evidence } }); };
  type.addEventListener("change", update); update();
};

const initDefense = () => {
  const stage = $("#defense-stage"); if (!stage) return;
  const checks = $$('[data-defense-check]');
  const order = ["govern", "inventory", "protect", "detect", "respond", "recover"];
  const labels = { govern: "治理：責任人與風險接受", inventory: "資產與資料流清冊", protect: "最小權限與安全設定", detect: "集中且可關聯的遙測", respond: "隔離、撤銷與溝通程序", recover: "備份、重建與復原驗證" };
  const update = () => {
    const present = new Set(checks.filter(x => x.checked).map(x => x.value));
    const missing = order.find(x => !present.has(x));
    setResult("defense-result", { tone: missing ? "warn" : "normal", title: missing ? `第一個閉環缺口：${labels[missing]}` : "基本防禦閉環已形成", why: missing ? `目前事件階段是「${stage.options[stage.selectedIndex].text}」。後段控制不能抵銷較早的可見性或權限缺口。` : "控制需持續驗證；勾選代表設計存在，不代表實際有效。", fields: {
      next: missing ? `先建立並測試：${labels[missing]}` : "以演練、故障注入與事件回顧驗證控制",
      evidence: "控制設定版本、測試結果、告警、處置時間線、復原後完整性與服務指標",
      residual: "未知資產、第三方、內部濫用、零日弱點與控制本身失效仍需納入",
      lifecycle: "治理 → 識別 → 保護 → 偵測 → 回應 → 復原，六者持續並行"
    }});
  };
  stage.addEventListener("change", update); checks.forEach(x => x.addEventListener("input", update)); update();
};

const initEvidence = () => {
  const incident = $("#evidence-incident"); if (!incident) return;
  const checks = $$('[data-evidence-check]');
  const update = () => {
    const chosen = new Set(checks.filter(x => x.checked).map(x => x.value));
    const needs = incident.value === "account" ? ["identity", "app", "network", "data"] : incident.value === "injection" ? ["app", "process", "data"] : ["network", "app", "process"];
    const missing = needs.filter(x => !chosen.has(x));
    const names = { identity: "身分日誌", network: "網路封包／流量", app: "應用程式日誌", process: "程序與主機遙測", data: "資料存取稽核" };
    setResult("evidence-result", { tone: missing.length ? "warn" : "normal", title: missing.length ? "時間線仍有證據缺口" : "已具備最小交叉驗證來源", why: "單一日誌只能說明某元件聲稱看見什麼；跨來源以時間、主體、端點與關聯識別碼對齊，才較能區分事實與推論。", fields: {
      timeline: incident.value === "account" ? "登入嘗試 → 工作階段建立 → 資源存取 → 權限或資料變更" : incident.value === "injection" ? "外部輸入 → 應用處理 → 子程序／查詢 → 資料結果" : "流量升高 → 資源飽和 → 延遲／錯誤 → 限流或隔離",
      missing: missing.length ? missing.map(x => names[x]).join("、") : "無最小缺口；仍要檢查保留期、時鐘與完整性",
      correlate: "統一時區的時間戳、工作階段或追蹤識別碼、主體、來源／目的端點、動作與結果",
      limit: "缺少內容不等於事件沒發生；加密、取樣、時鐘漂移與日誌遭刪除都會限制結論。"
    }});
  };
  incident.addEventListener("change", update); checks.forEach(x => x.addEventListener("input", update)); update();
};

const initDictionary = () => {
  const search = $("#term-search"); const cards = $$(".term-card"); const empty = $("#term-empty");
  if (!search || !cards.length) return;
  const update = () => {
    const q = search.value.trim().toLocaleLowerCase("zh-Hant"); let shown = 0;
    cards.forEach(card => { const visible = card.textContent.toLocaleLowerCase("zh-Hant").includes(q); card.hidden = !visible; if (visible) shown += 1; });
    if (empty) { empty.hidden = shown !== 0; empty.textContent = `找不到「${search.value}」。可改用繁中、英文全名、縮寫或白話動作。`; }
  };
  search.addEventListener("input", update); update();
};

const quizzes = {
  "00": [
    {
      question: "下列哪個敘述最接近可測試的安全要求？",
      options: ["保護客戶資料", "系統應該很安全", "已驗證客戶只能讀取自己的訂單，拒絕也要留紀錄"],
      answer: 2,
      explanation: "第三項同時指定主體、資產、動作、邊界與證據，才能實作與驗證。"
    },
    {
      question: "一個未經授權的人修改庫存數量，最直接破壞哪項安全性質？",
      options: ["機密性", "完整性", "可用性"],
      answer: 1,
      explanation: "未授權修改讓狀態不再可信，首先影響完整性；若導致無法供貨，才可能連帶影響可用性。"
    },
    {
      question: "要調查管理員大量匯出訂單，哪組證據最有用？",
      options: ["只記錄匯出成功", "操作者身分、查詢範圍、匯出量與目的位置", "只保留網頁標題"],
      answer: 1,
      explanation: "調查需要把誰、讀了什麼、多少與去向關聯起來；單一「成功」無法界定影響。"
    }
  ],
  "01": [
    {
      question: "只看到目的連接埠是 443，最穩妥的結論是什麼？",
      options: ["對端一定是合法網站", "通常承載加密網頁流量，但應用與身分還要另行驗證", "封包內容一定可讀"],
      answer: 1,
      explanation: "連接埠是多工與慣例欄位，不是可信的應用身分證明。"
    },
    {
      question: "對使用者資料包協定（UDP）的描述，哪一項正確？",
      options: ["核心會維護與 TCP 相同的可靠位元組流", "應用程式不能自行實作確認與重送", "每份資料報獨立傳送，應用可另行實作可靠性"],
      answer: 2,
      explanation: "UDP 本身不提供 TCP 的可靠位元組流，但這不禁止應用層加上確認、重送或排序。"
    },
    {
      question: "觀測點只看到加密流量的來源、目的、大小與時序，不能單獨證明什麼？",
      options: ["通訊端點", "應用內容與使用者意圖", "封包的長度"],
      answer: 1,
      explanation: "加密後仍可觀察部分後設資料，但應用內容與人的意圖需要端點及應用證據。"
    }
  ],
  "02": [
    {
      question: "系統確認憑證屬於 alice，但拒絕她修改管理設定。這表示什麼？",
      options: ["驗證成功、授權失敗", "驗證失敗、授權成功", "稽核紀錄必定失效"],
      answer: 0,
      explanation: "驗證回答「是誰」，授權再依資源與動作決定「可不可以做」。"
    },
    {
      question: "一般讀者通過驗證後要讀取他人的個人資料，系統應如何處理？",
      options: ["因為已驗證所以允許", "再檢查物件擁有者，未通過就拒絕", "只要連接來自內網就允許"],
      answer: 1,
      explanation: "角色允許某類動作，不等於對所有物件都有權限；還要做物件層授權。"
    },
    {
      question: "主體是 unknown 時，最合理的驗證狀態是什麼？",
      options: ["可以任意勾選已驗證", "尚未建立可信主體，不能把聲稱名稱視為已驗證", "自動繼承管理者角色"],
      answer: 1,
      explanation: "不明主體不應只靠聲稱名稱取得已驗證狀態或角色。"
    }
  ],
  "03": [
    {
      question: "要把收到的檔案與一份可信摘要比對，應優先使用哪類工具？",
      options: ["密碼雜湊函式", "對稱式加密", "隨機刪除部分內容"],
      answer: 0,
      explanation: "可信摘要與重算摘要的比對能提供竄改線索；雜湊本身不提供保密或來源身分。"
    },
    {
      question: "通訊雙方已共享秘密金鑰，想同時保密並偵測竄改，應選什麼？",
      options: ["無金鑰雜湊", "對稱式已驗證加密", "只做 Base64 編碼"],
      answer: 1,
      explanation: "已驗證加密同時提供機密性與完整性驗證；編碼不是安全控制。"
    },
    {
      question: "TLS 使用臨時（EC）DHE 建立共享祕密的主要好處是什麼？",
      options: ["憑證私鑰直接加密所有應用資料", "日後長期私鑰外洩時，過去錄下的流量仍有前向保密性", "被動抓包一定看得到憑證驗證結果"],
      answer: 1,
      explanation: "臨時金鑰交換提供前向保密性；憑證私鑰用來簽署握手內容，不是把流量金鑰直接傳過去。"
    }
  ],
  "04": [
    {
      question: "入口是「第三方相依元件」時，下列哪項預防控制最對準路徑？",
      options: ["多因素驗證", "簽章驗證與來源鎖定", "僅增加密碼長度"],
      answer: 1,
      explanation: "相依供應鏈路徑要驗證成品與來源；登入用的多因素驗證不在這條路徑上。"
    },
    {
      question: "只部署集中日誌與異常偵測，對威脅模型代表什麼？",
      options: ["已阻止所有入口", "有助偵測，仍需對準入口的預防控制", "剩餘風險自動歸零"],
      answer: 1,
      explanation: "監測改善可見性，不會自動阻止入口或消除影響。"
    },
    {
      question: "評估「公開網際網路請求影響服務可用性」時，最先要補上哪種驗證？",
      options: ["容量、限流、排隊與延遲／錯誤率測試", "證明每個來源都是真人", "只檢查頁面顏色"],
      answer: 0,
      explanation: "可用性暴露要用請求率、佇列、資源、延遲與錯誤率驗證，並測試限流與降級。"
    }
  ],
  "05": [
    {
      question: "不受信任的輸入被當成查詢或命令語法，核心機制是什麼？",
      options: ["注入與解譯器混淆", "網路位址轉換", "備份還原"],
      answer: 0,
      explanation: "注入的核心是資料被解譯器誤當成控制語法，應用參數化介面與明確邊界。"
    },
    {
      question: "攻擊者用遭竊憑證建立工作階段後讀取資料，哪組證據最能串起因果鏈？",
      options: ["登入、工作階段、授權物件與後續存取", "只有一張系統畫面截圖", "只有網站名稱"],
      answer: 0,
      explanation: "憑證冒用的狀態變化橫跨身分、工作階段、授權與資料存取，需要共用識別碼關聯。"
    },
    {
      question: "一個已信任的建置成品在更新路徑中被替換，屬於哪類攻擊？",
      options: ["供應鏈竄改", "單純的密碼輸入錯誤", "時鐘漂移"],
      answer: 0,
      explanation: "惡意內容沿既有信任與更新路徑進入多台系統，是供應鏈竄改的典型狀態變化。"
    }
  ],
  "06": [
    {
      question: "組織已有治理、清冊與安全設定，但沒有集中且可關聯的遹測。第一個閉環缺口是什麼？",
      options: ["偵測", "復原", "宣稱風險為零"],
      answer: 0,
      explanation: "沒有可關聯遹測，組織難以發現控制被繞過或失效；後段回應無法補回可見性。"
    },
    {
      question: "哪項證據最能支持「某版本備份能在某環境恢復」？",
      options: ["備份作業曾顯示成功", "實際還原演練與完整性驗證結果", "備份檔名很完整"],
      answer: 1,
      explanation: "備份紀錄只支持作業曾執行；還原演練才能驗證特定版本與環境的可恢復性。"
    },
    {
      question: "為什麼「告警」不等於「安全事件」？",
      options: ["告警只是待驗證訊號，還要調查對資產與狀態的實際影響", "告警永遠是誤報", "安全事件不需要證據"],
      answer: 0,
      explanation: "規則或模型觸發只提供調查起點，要用證據確認狀態變化與影響範圍。"
    }
  ],
  "07": [
    {
      question: "日誌記錄工作階段 S 發出大量匯出，屬於什麼？",
      options: ["直接觀察到系統記錄的動作", "已證明鍵盤前的真人身分", "已證明對端永久保存所有資料"],
      answer: 0,
      explanation: "日誌直接支持「系統如此記錄」；真人歸屬與對端後續行為仍是受限的推論。"
    },
    {
      question: "兩個來源的事件時間很接近，但時鐘誤差區間重疊。應如何下結論？",
      options: ["直接以顯示時間排因果", "單靠時間戳不能可靠排序，要用序號、工作階段或協定因果補強", "把其中一筆刪除"],
      answer: 1,
      explanation: "誤差區間重疊時，顯示時間的先後不足以支持真實因果順序。"
    },
    {
      question: "要界定帳號遭冒用後實際讀了哪些資料，哪組來源不可少？",
      options: ["只有身分驗證日誌", "身分／工作階段、應用動作與資料存取稽核", "只有 DNS 快取"],
      answer: 1,
      explanation: "身分日誌說明登入，應用與資料稽核才能用工作階段界定後續讀取範圍。"
    }
  ]
};

const initQuizzes = () => {
  $$('[data-quiz]').forEach(section => {
    const chapter = section.dataset.quiz;
    const questions = quizzes[chapter];
    if (!questions) return;
    const form = document.createElement("form");
    form.className = "quiz-form";
    questions.forEach((item, questionIndex) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "quiz-question";
      const legend = document.createElement("legend");
      legend.textContent = `${questionIndex + 1}. ${item.question}`;
      fieldset.append(legend);
      item.options.forEach((option, optionIndex) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `quiz-${chapter}-${questionIndex}`;
        radio.value = String(optionIndex);
        label.append(radio, document.createTextNode(` ${option}`));
        fieldset.append(label);
      });
      const feedback = document.createElement("p");
      feedback.className = "quiz-feedback";
      feedback.hidden = true;
      feedback.setAttribute("aria-live", "polite");
      fieldset.append(feedback);
      form.append(fieldset);
    });
    const actions = document.createElement("div");
    actions.className = "quiz-actions";
    const check = document.createElement("button");
    check.type = "submit";
    check.textContent = "檢查作答";
    const reset = document.createElement("button");
    reset.type = "reset";
    reset.textContent = "重新作答";
    actions.append(check, reset);
    form.append(actions);
    form.addEventListener("submit", event => {
      event.preventDefault();
      questions.forEach((item, questionIndex) => {
        const selected = $(`input[name="quiz-${chapter}-${questionIndex}"]:checked`, form);
        const feedback = $$(".quiz-feedback", form)[questionIndex];
        feedback.hidden = false;
        if (!selected) {
          feedback.dataset.tone = "warn";
          feedback.textContent = "先選一個答案，再檢查。";
          return;
        }
        const correct = Number(selected.value) === item.answer;
        feedback.dataset.tone = correct ? "correct" : "incorrect";
        feedback.textContent = `${correct ? "答對。" : `答案：${item.options[item.answer]}。`} ${item.explanation}`;
      });
    });
    form.addEventListener("reset", () => {
      setTimeout(() => $$(".quiz-feedback", form).forEach(feedback => {
        feedback.hidden = true;
        feedback.textContent = "";
        delete feedback.dataset.tone;
      }), 0);
    });
    section.append(form);
  });
};

[initWorld, initNetwork, initAccess, initCrypto, initThreat, initAttack, initDefense, initEvidence, initDictionary, initQuizzes].forEach(init => init());

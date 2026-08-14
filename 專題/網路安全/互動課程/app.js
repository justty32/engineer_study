"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

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
    let allow = authenticated.checked;
    let reason = allow ? "已建立主體身分，接著評估它是否有此動作的權限。" : "尚未驗證，系統不能把聲稱的名稱當成可信主體。";
    if (allow && resource.value === "admin" && role.value !== "administrator") { allow = false; reason = "已驗證不等於已授權；目前角色沒有管理設定的修改權。"; }
    if (allow && resource.value === "profile" && role.value === "service") { allow = false; reason = "服務角色不應讀取任意個人資料；這是最小權限與目的限制。"; }
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
    const controls = { none: "尚無針對性控制", mfa: "多因素驗證與速率限制", segment: "網路分段與服務身分", monitor: "集中日誌與異常偵測" };
    const high = (asset.value === "data" && capability.value === "foothold") || (asset.value === "account" && capability.value === "credential");
    setResult("threat-result", { tone: control.value === "none" ? "danger" : high ? "warn" : "normal", title: `${high ? "高影響情境" : "需驗證的威脅情境"}`, why: `若攻擊者${caps[capability.value]}，可經${entries[entry.value]}嘗試影響${assets[asset.value]}。控制只能降低可能性或影響，不會讓威脅憑空消失。`, fields: {
      boundary: `${entries[entry.value]}跨入受信任系統的位置`,
      control: controls[control.value],
      evidence: "入口請求、身分驗證、授權、程序、網路流量與資料存取的關聯紀錄",
      residual: control.value === "none" ? "缺少預防與偵測；事件可能直到使用者回報才被發現" : "仍需測試控制是否涵蓋繞過、失效、撤銷與復原"
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
  const order = ["inventory", "protect", "detect", "respond", "recover"];
  const labels = { inventory: "資產與資料流清冊", protect: "最小權限與安全設定", detect: "集中且可關聯的遙測", respond: "隔離、撤銷與溝通程序", recover: "備份、重建與復原驗證" };
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
    const needs = incident.value === "account" ? ["identity", "app", "network"] : incident.value === "injection" ? ["app", "process", "data"] : ["network", "app", "process"];
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

[initWorld, initNetwork, initAccess, initCrypto, initThreat, initAttack, initDefense, initEvidence, initDictionary].forEach(init => init());

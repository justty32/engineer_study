"use strict";

const byId = (id) => document.getElementById(id);
const listen = (id, event, fn) => { const el = byId(id); if (el) el.addEventListener(event, fn); };
const number = (id) => Number(byId(id)?.value ?? 0);

const SYN_FRAME = Object.freeze({
  bytes: "02 00 00 00 00 02 02 00 00 00 00 01 08 00 45 00 00 3c 1a 2b 40 00 40 06 34 3f c0 00 02 0a c6 33 64 14 c0 00 01 bb 11 22 33 44 00 00 00 00 a0 02 fa f0 56 95 00 00 02 04 05 b4 04 02 08 0a 01 02 03 04 00 00 00 00 01 03 03 07".split(" ").map(value => Number.parseInt(value, 16)),
  fields: [
    ["eth-destination", "L2", "目的 MAC 位址", 0, 6, "02 00 00 00 00 02", "02:00:00:00:00:02", "指向這一段乙太網路的下一個介面；02 表示本地管理的單播位址。"],
    ["eth-source", "L2", "來源 MAC 位址", 6, 6, "02 00 00 00 00 01", "02:00:00:00:00:01", "記錄目前鏈路上送出訊框的介面，路由器轉送到新鏈路時會更換。"],
    ["eth-type", "L2", "EtherType", 12, 2, "08 00", "0x0800：IPv4", "告訴接收端乙太網路負載應交給 IPv4 解析。"],
    ["ip-version-ihl", "L3", "版本／標頭長度", 14, 1, "45", "IPv4；IHL 5 = 20 B", "高半位 4 是版本，低半位 5 表示五個 32 位元字，本例無 IPv4 選項。"],
    ["ip-dscp-ecn", "L3", "DSCP／ECN", 15, 1, "00", "預設轉送；未通知壅塞", "本例不要求差異化服務，也未設定明確壅塞通知。"],
    ["ip-total-length", "L3", "總長度", 16, 2, "00 3c", "60 B", "從 IPv4 標頭開始計算：20 B IPv4 加 40 B TCP，不含外層乙太網路 14 B。"],
    ["ip-identification", "L3", "識別碼", 18, 2, "1a 2b", "0x1a2b", "原本用來將 IPv4 分片關聯在一起；本訊框設定不可分片。"],
    ["ip-flags-offset", "L3", "旗標／分片位移", 20, 2, "40 00", "DF = 1；位移 0", "Don't Fragment 旗標已設，而且這不是某個分片。"],
    ["ip-ttl", "L3", "存活時間", 22, 1, "40", "64 跳", "每個路由器轉送前至少減一，歸零就丟棄，防止路由迴圈無限流動。"],
    ["ip-protocol", "L3", "上層協定", 23, 1, "06", "6：TCP", "告訴目的主機將 IPv4 負載交給 TCP。"],
    ["ip-checksum", "L3", "標頭檢查和", 24, 2, "34 3f", "0x343f（驗算通過）", "一的補數檢查和只覆蓋 IPv4 標頭；TTL 改變時中繼設備必須更新它。"],
    ["ip-source", "L3", "來源 IPv4 位址", 26, 4, "c0 00 02 0a", "192.0.2.10", "來源端點位址；192.0.2.0/24 是文件範例專用範圍。"],
    ["ip-destination", "L3", "目的 IPv4 位址", 30, 4, "c6 33 64 14", "198.51.100.20", "路由器依這個最終目的位址查轉送表；它也屬於文件範例專用範圍。"],
    ["tcp-source-port", "L4", "來源埠", 34, 2, "c0 00", "49152", "用戶端在本例選用的暫時埠，與位址、目的埠及協定共同辨認資料流。"],
    ["tcp-destination-port", "L4", "目的埠", 36, 2, "01 bb", "443", "指向伺服器的程式端點；443 常用於 HTTPS，但埠號本身不證明應用內容。"],
    ["tcp-sequence", "L4", "序號", 38, 4, "11 22 33 44", "0x11223344（287454020）", "SYN 攜帶這個初始序號，而 SYN 本身會佔用一個序號位置。"],
    ["tcp-acknowledgment", "L4", "確認號", 42, 4, "00 00 00 00", "0（ACK 未設定）", "這是連線發起端的第一個 SYN，尚無對方序號可確認。"],
    ["tcp-offset-reserved", "L4", "資料位移／保留位", 46, 1, "a0", "10 字 = 40 B；保留位 0", "資料位移指出 TCP 標頭結束位置；本例 20 B 基本標頭後還有 20 B 選項。"],
    ["tcp-flags", "L4", "旗標", 47, 1, "02", "SYN = 1；其餘為 0", "這是三次握手的第一步：發起同步序號要求，還不是 SYN-ACK。"],
    ["tcp-window", "L4", "接收視窗", 48, 2, "fa f0", "64240", "宣告接收端目前的流量控制容量；SYN 中的這個數值尚不套用視窗縮放。"],
    ["tcp-checksum", "L4", "檢查和", 50, 2, "56 95", "0x5695（驗算通過）", "檢查 TCP 標頭與負載，並把 IPv4 來源、目的、協定與 TCP 長度納入偽標頭計算。"],
    ["tcp-urgent", "L4", "緊急指標", 52, 2, "00 00", "0（URG 未設定）", "URG 旗標關閉時這個值不用來指示緊急資料邊界。"],
    ["tcp-option-mss", "L4", "選項：MSS", 54, 4, "02 04 05 b4", "類型 2；長度 4；1460 B", "發起端告知對方，希望接收的 TCP 負載上限為 1460 位元組。"],
    ["tcp-option-sack", "L4", "選項：SACK permitted", 58, 2, "04 02", "類型 4；長度 2", "表示發起端能處理選擇性確認，日後可告知對方哪些非連續區段已收到。"],
    ["tcp-option-timestamps", "L4", "選項：Timestamps", 60, 10, "08 0a 01 02 03 04 00 00 00 00", "TSval 0x01020304；TSecr 0", "攜帶本端時間戳值；第一個 SYN 尚無對方時間戳可回顯，所以 TSecr 為 0。"],
    ["tcp-option-nop", "L4", "選項：NOP", 70, 1, "01", "類型 1：無操作", "佔用一個位元組來對齊後續選項，沒有額外長度欄位。"],
    ["tcp-option-window-scale", "L4", "選項：Window scale", 71, 3, "03 03 07", "類型 3；長度 3；位移 7", "協商後的後續區段可將接收視窗左移 7 位，也就是乘以 128。"]
  ].map(([id, layer, name, offset, length, raw, interpreted, description]) => Object.freeze({id, layer, name, offset, length, raw, interpreted, description}))
});

function setupEnvelope() {
  const payload = byId("payload");
  if (!payload) return;
  const draw = () => {
    const n = number("payload");
    const transport = byId("layer-transport").checked ? 20 : 0;
    const network = byId("layer-network").checked ? 20 : 0;
    const link = byId("layer-link").checked ? 18 : 0;
    const total = n + transport + network + link;
    byId("payload-value").textContent = `${n} 位元組`;
    byId("envelope-output").innerHTML = `<strong>線上示意長度：${total} 位元組</strong><br>應用資料 ${n} + 傳輸標頭 ${transport} + 網路標頭 ${network} + 鏈路標頭／尾碼 ${link}。<br>${n === 0 ? "沒有應用內容時，控制封包仍可能只有標頭。" : `額外負擔約占 ${Math.round((total - n) / total * 100)}%。資料越小，固定標頭比例通常越高。`}`;
  };
  ["payload","layer-transport","layer-network","layer-link"].forEach(id => listen(id, "input", draw));
  listen("reset-envelope", "click", () => { payload.value = 100; byId("layer-transport").checked = true; byId("layer-network").checked = true; byId("layer-link").checked = true; draw(); });
  draw();
}

function setupArp() {
  if (!byId("arp-destination")) return;
  const draw = () => {
    const local = byId("arp-destination").value === "local";
    const cached = byId("arp-cache").checked;
    const target = local ? "目的主機" : "預設閘道";
    byId("arp-output").innerHTML = cached
      ? `<strong>直接使用快取中的${target}硬體位址。</strong><br>訊框的目的硬體位址指向${target}；網際網路協定封包的最終目的位址不因下一跳而改成閘道。`
      : `<strong>先在本地鏈路廣播詢問${target}的硬體位址。</strong><br>${target}回覆後寫入快取，再送單播訊框。廣播不會被一般路由器轉送到遠端網路。`;
  };
  listen("arp-destination", "change", draw); listen("arp-cache", "input", draw); draw();
}

function setupRoute() {
  if (!byId("route-destination")) return;
  const parseIpv4 = (text) => {
    const parts = text.trim().split(".");
    if (parts.length !== 4 || parts.some(x => !/^\d+$/.test(x) || (x.length > 1 && x.startsWith("0")) || Number(x) > 255)) return null;
    return parts.reduce((value, x) => ((value << 8) | Number(x)) >>> 0, 0);
  };
  const printIpv4 = (value) => [24, 16, 8, 0].map(shift => (value >>> shift) & 255).join(".");
  const draw = () => {
    const destination = byId("route-destination").value;
    const prefix = number("route-prefix");
    const hops = number("route-hops");
    const destinationValue = parseIpv4(destination);
    if (destinationValue === null) {
      byId("route-output").innerHTML = "<strong>格式尚不是四段有效的 IPv4 位址。</strong><br>每段必須是 0 到 255 且不帶前導 0 的十進位整數；例如請寫 10，不要寫 010。";
      return;
    }
    const sourceValue = parseIpv4("192.168.1.42");
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const networkValue = destinationValue & mask;
    const local = (sourceValue & mask) === networkValue;
    const ttl = Math.max(0, 64 - hops);
    const ttlText = hops >= 64
      ? "在第 64 跳將存活時間減為 0，封包當場被丟棄；該路由器通常回傳 ICMP 超時訊息，traceroute 就是利用這個機制。"
      : `經過 ${hops} 個路由器後，存活時間欄位由 64 變為 ${ttl}。每一跳只選下一站，不先規劃一條實體專線。`;
    byId("route-output").innerHTML = `<strong>${local ? "目的位址在示意本地前綴：直接交給本地鏈路。" : "目的位址不在示意本地前綴：交給預設閘道。"}</strong><br>示意本機是 192.168.1.42；前綴長度 /${prefix} 代表前 ${prefix} 位元辨認網路，目的網路位址是 ${printIpv4(networkValue)}/${prefix}。${ttlText}`;
  };
  ["route-destination","route-prefix","route-hops"].forEach(id => listen(id, "input", draw)); draw();
}

function setupTransport() {
  if (!byId("transport-kind")) return;
  const draw = () => {
    const tcp = byId("transport-kind").value === "tcp";
    const loss = number("loss");
    byId("loss-value").textContent = `${loss}%`;
    const need = byId("need-order").checked;
    const text = tcp
      ? `傳輸控制協定會用序號、確認與重傳恢復遺失，應用看到有序位元組流；代價是等待與額外狀態。${loss > 20 ? "高遺失下重傳很多，完成時間會顯著拉長。" : "低遺失下可靠性成本通常較小。"}`
      : `使用者資料包協定不替應用重傳或排序；約 ${loss}% 的資料包可能在此模型中缺席，但後續資料包不必等它恢復。${need ? "目前應用要求完整有序，因此必須自行補上序號、確認與重傳，或改用傳輸控制協定。" : "目前應用允許遺失，較適合以新鮮度優先。"}`;
    byId("transport-output").innerHTML = `<strong>${tcp ? "可靠、有序、連線狀態" : "保留資料包邊界、少量內建保證"}</strong><br>${text}`;
  };
  ["transport-kind","loss","need-order"].forEach(id => listen(id, "input", draw)); draw();
}

function setupDns() {
  if (!byId("dns-cache")) return;
  const draw = () => {
    const cached = byId("dns-cache").checked;
    const ttl = number("dns-ttl"); const elapsed = number("dns-elapsed");
    const hit = cached && elapsed < ttl;
    byId("dns-output").innerHTML = hit
      ? `<strong>快取命中：直接沿用答案。</strong><br>存活時間 ${ttl} 秒，已過 ${elapsed} 秒，尚餘 ${ttl - elapsed} 秒；不必再詢問遞迴解析器。這改善延遲，也可能暫時看不到剛更新的權威答案。`
      : `<strong>${cached ? "快取已過期" : "沒有快取"}：重新查詢。</strong><br>用戶端問遞迴解析器；若解析器也沒有答案，依根、頂級網域、權威名稱伺服器的委派鏈找到記錄。`;
  };
  ["dns-cache","dns-ttl","dns-elapsed"].forEach(id => listen(id, "input", draw)); draw();
}

function setupHttp() {
  if (!byId("http-method")) return;
  const draw = () => {
    const method = byId("http-method").value; const path = encodeURI(byId("http-path").value || "/"); const status = byId("http-status").value;
    const meanings = {"200":"伺服器成功回傳表示法","301":"資源有新的永久位置，客戶端可依 Location 標頭改送請求","404":"伺服器收到請求，但找不到此資源","500":"伺服器處理時發生內部錯誤"};
    const reasons = {"200":"OK","301":"Moved Permanently","404":"Not Found","500":"Internal Server Error"};
    const requestBody = method === "POST" ? "title=example" : "";
    const requestHeaders = method === "POST" ? "\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 13" : "";
    const responseHeaders = `Content-Type: text/plain${status === "301" ? "\nLocation: /articles/42-new" : ""}`;
    const responseBody = method === "HEAD" ? "" : "\n\n示意內容";
    const output = byId("http-output");
    const title = document.createElement("strong");
    const message = document.createElement("pre");
    title.textContent = "這是應用層訊息，不是連線本身。";
    message.textContent = `${method} ${path} HTTP/1.1\nHost: example.test${requestHeaders}\n\n${requestBody}\n\nHTTP/1.1 ${status} ${reasons[status]}\n${responseHeaders}${responseBody}`;
    output.replaceChildren(title, message, document.createTextNode(`${meanings[status]}。${method === "HEAD" ? "HEAD 要求只回傳與 GET 類似的標頭，不傳回應本文。" : method === "POST" ? "POST 把資料交給目標資源處理；重送是否安全取決於應用語意。" : "GET 讀取資源表示法，原則上不應用來改變伺服器狀態。"}`));
  };
  ["http-method","http-path","http-status"].forEach(id => listen(id, "input", draw)); draw();
}

function setupTls() {
  if (!byId("tls-name")) return;
  const draw = () => {
    const ok = byId("tls-name").checked && byId("tls-time").checked && byId("tls-trust").checked;
    const failed = [];
    if (!byId("tls-name").checked) failed.push("憑證名稱與要連線的主機名稱不相符");
    if (!byId("tls-time").checked) failed.push("憑證不在有效期間");
    if (!byId("tls-trust").checked) failed.push("無法建立到受信任根的簽章鏈");
    byId("tls-output").innerHTML = ok
      ? `<strong>伺服器身分檢查通過，可建立受保護通道。</strong><br>握手協商演算法與暫時金鑰材料，之後用共享工作金鑰保護應用紀錄的機密性與完整性。`
      : `<strong>停止：不能把通道當成已驗證的伺服器。</strong><br>${failed.join("；")}。加密演算法本身可正常運作，但若身分檢查失敗，仍可能把秘密交給錯誤端點。`;
  };
  ["tls-name","tls-time","tls-trust"].forEach(id => listen(id, "input", draw)); draw();
}

function setupTrace() {
  if (!byId("fault-layer")) return;
  const draw = () => {
    const data = {
      dns:["名稱解析失敗，尚未得到目的網際網路協定位址。","查看解析器回覆、快取與權威記錄；尚不必怪罪傳輸連線。"],
      route:["已知目的位址，但封包無法到達下一跳或遠端。","查看路由表、閘道、存活時間與控制錯誤訊息；封包擷取可確認送往哪個硬體位址。"],
      transport:["路徑可能可達，但連線逾時、被拒絕或反覆重傳。","查看埠、握手旗標、序號／確認與作業系統 socket 狀態。收到 RST 是對端或中間設備明確拒絕的證據；只有 SYN 無回應直到逾時，候選原因則仍包含丟棄與回程問題。"],
      tls:["傳輸連線成立，但加密握手因名稱、有效期或信任鏈失敗。","查看握手警示、伺服器名稱與憑證鏈；不要跳過驗證來掩蓋問題。"],
      http:["安全通道可用，但伺服器回傳重新導向、找不到或內部錯誤。","查看請求方法、路徑、Host 標頭、狀態碼與伺服器應用紀錄。"]
    };
    const [symptom,evidence] = data[byId("fault-layer").value];
    byId("trace-output").innerHTML = `<strong>可觀察現象：</strong>${symptom}<br><strong>下一份證據：</strong>${evidence}<br><span class="note">這是調查起點，不是單憑症狀定案；相鄰層錯誤可能造成相似表現。</span>`;
  };
  listen("fault-layer", "change", draw); draw();

  const scenario = byId("trace-scenario");
  const evidence = byId("trace-evidence");
  if (!scenario || !evidence) return;
  const reverseCases = {
    "syn-timeout": ["transport", "DNS 已有答案，但 SYN 沒有回應；先查伺服器監聽狀態與兩端封包，可區分未監聽、中途丟棄與回程問題。"],
    "http-404": ["http", "TCP 與 TLS 都成功，且收到 404；應查 HTTP 請求路徑、Host 標頭與服務存取紀錄。"],
    "dns-failure": ["dns", "尚未取得目的位址；應先查 DNS 回覆碼、查詢名稱與快取，而不是先查 TCP 連線。"]
  };
  const reveal = () => {
    const [answer, explanation] = reverseCases[scenario.value];
    const chosen = evidence.value;
    byId("trace-reverse-output").innerHTML = chosen
      ? `<strong>${chosen === answer ? "這份證據最有區別力。" : "這不是當下最先要取得的證據。"}</strong><br>${explanation}`
      : "<strong>先選擇下一份證據，再揭示理由。</strong>";
  };
  listen("trace-scenario", "change", reveal); listen("trace-evidence", "change", reveal); reveal();
}

function setupSynFrame() {
  const dump = byId("syn-frame-dump");
  const tableBody = byId("syn-field-body");
  if (!dump || !tableBody) return;

  const fieldAt = (offset) => SYN_FRAME.fields.find(field => offset >= field.offset && offset < field.offset + field.length);
  const hex = (value, width = 2) => value.toString(16).padStart(width, "0");
  const checksum = (bytes) => {
    let sum = 0;
    for (let index = 0; index < bytes.length; index += 2) sum += (bytes[index] << 8) | (bytes[index + 1] ?? 0);
    while (sum > 0xffff) sum = (sum & 0xffff) + (sum >>> 16);
    return (~sum) & 0xffff;
  };

  for (let start = 0; start < SYN_FRAME.bytes.length; start += 16) {
    const line = document.createElement("div");
    line.className = "packet-line";
    const offset = document.createElement("code");
    offset.className = "packet-offset";
    offset.textContent = hex(start, 4);
    line.append(offset);
    SYN_FRAME.bytes.slice(start, start + 16).forEach((value, relativeIndex) => {
      const byteOffset = start + relativeIndex;
      const field = fieldAt(byteOffset);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "packet-byte";
      button.dataset.field = field.id;
      button.dataset.layer = field.layer;
      button.textContent = hex(value);
      button.setAttribute("aria-label", `位移 0x${hex(byteOffset, 2)}，${field.name}，數值 0x${hex(value)}`);
      line.append(button);
    });
    dump.append(line);
  }

  SYN_FRAME.fields.forEach(field => {
    const row = document.createElement("tr");
    row.dataset.field = field.id;
    row.dataset.layer = field.layer;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", `高亮${field.layer} ${field.name}`);
    const end = field.offset + field.length - 1;
    const values = [field.layer, field.name, `${field.offset}–${end} (0x${hex(field.offset, 2)}–0x${hex(end, 2)})`, `${field.length} B`, field.raw, field.interpreted, field.description];
    values.forEach(value => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); });
    tableBody.append(row);
  });

  let lockedField = null;
  let activeLayer = "all";
  const items = () => document.querySelectorAll("[data-field]");
  const showField = (fieldId) => items().forEach(item => item.classList.toggle("is-active", item.dataset.field === fieldId));
  const preview = (fieldId) => showField(fieldId || lockedField);
  const toggleLock = (fieldId) => { lockedField = lockedField === fieldId ? null : fieldId; showField(lockedField); };

  items().forEach(item => {
    item.addEventListener("pointerenter", () => preview(item.dataset.field));
    item.addEventListener("pointerleave", () => preview(null));
    item.addEventListener("focus", () => preview(item.dataset.field));
    item.addEventListener("blur", () => preview(null));
    item.addEventListener("click", () => toggleLock(item.dataset.field));
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleLock(item.dataset.field); }
      if (event.key === "Escape") { lockedField = null; showField(null); item.blur(); }
    });
  });

  document.querySelectorAll("[data-packet-layer]").forEach(button => button.addEventListener("click", () => {
    activeLayer = button.dataset.packetLayer;
    document.querySelectorAll("[data-packet-layer]").forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === button)));
    tableBody.querySelectorAll("tr").forEach(row => { row.hidden = activeLayer !== "all" && row.dataset.layer !== activeLayer; });
    dump.querySelectorAll(".packet-byte").forEach(byte => byte.classList.toggle("is-filtered-out", activeLayer !== "all" && byte.dataset.layer !== activeLayer));
    const selected = SYN_FRAME.fields.find(field => field.id === lockedField);
    if (selected && activeLayer !== "all" && selected.layer !== activeLayer) lockedField = null;
    showField(lockedField);
  }));

  const ipv4Header = SYN_FRAME.bytes.slice(14, 34);
  const tcp = SYN_FRAME.bytes.slice(34);
  const pseudoHeader = [...SYN_FRAME.bytes.slice(26, 34), 0, SYN_FRAME.bytes[23], 0, tcp.length, ...tcp];
  const validIpv4 = checksum(ipv4Header) === 0;
  const validTcp = checksum(pseudoHeader) === 0;
  byId("syn-frame-verification").textContent = `長度 ${SYN_FRAME.bytes.length} B；IPv4 標頭檢查和 ${validIpv4 ? "通過" : "失敗"}；TCP 偽標頭檢查和 ${validTcp ? "通過" : "失敗"}。`;
}

function setupDictionary() {
  const search = byId("term-search"); if (!search) return;
  const count = byId("term-count");
  const draw = () => { const q = search.value.trim().toLocaleLowerCase("zh-Hant"); let shown = 0; document.querySelectorAll(".term-card").forEach(card => { const haystack = `${card.textContent} ${card.dataset.search || ""}`.toLocaleLowerCase("zh-Hant"); const hit = !q || haystack.includes(q); card.hidden = !hit; if (hit) shown++; }); count.textContent = `顯示 ${shown} 個條目`; };
  search.addEventListener("input", draw); draw();
}

[setupEnvelope, setupArp, setupRoute, setupTransport, setupDns, setupHttp, setupTls, setupTrace, setupSynFrame, setupDictionary].forEach(fn => fn());

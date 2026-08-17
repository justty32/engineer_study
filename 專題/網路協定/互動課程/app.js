"use strict";

const byId = (id) => document.getElementById(id);
const listen = (id, event, fn) => { const el = byId(id); if (el) el.addEventListener(event, fn); };
const number = (id) => Number(byId(id)?.value ?? 0);

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
    if (parts.length !== 4 || parts.some(x => !/^\d+$/.test(x) || Number(x) > 255)) return null;
    return parts.reduce((value, x) => ((value << 8) | Number(x)) >>> 0, 0);
  };
  const printIpv4 = (value) => [24, 16, 8, 0].map(shift => (value >>> shift) & 255).join(".");
  const draw = () => {
    const destination = byId("route-destination").value;
    const prefix = number("route-prefix");
    const hops = number("route-hops");
    const destinationValue = parseIpv4(destination);
    if (destinationValue === null) {
      byId("route-output").innerHTML = "<strong>格式尚不是四段有效的 IPv4 位址。</strong><br>每段必須是 0 到 255 的十進位整數；補完整後會立即重新判斷。";
      return;
    }
    const sourceValue = parseIpv4("192.168.1.42");
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const networkValue = destinationValue & mask;
    const local = (sourceValue & mask) === networkValue;
    const ttl = Math.max(0, 64 - hops);
    byId("route-output").innerHTML = `<strong>${local ? "目的位址在示意本地前綴：直接交給本地鏈路。" : "目的位址不在示意本地前綴：交給預設閘道。"}</strong><br>示意本機是 192.168.1.42；前綴長度 /${prefix} 代表前 ${prefix} 位元辨認網路，目的網路位址是 ${printIpv4(networkValue)}/${prefix}。經過 ${hops} 個路由器後，存活時間欄位由 64 變為 ${ttl}。${ttl === 0 ? " 欄位歸零，路由器會丟棄封包，防止路由迴圈永遠轉送。" : " 每一跳只選下一站，不先規劃一條實體專線。"}`;
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
    const method = byId("http-method").value; const path = byId("http-path").value || "/"; const status = byId("http-status").value;
    const meanings = {"200":"伺服器成功回傳表示法","301":"資源有新的永久位置，客戶端可依 Location 標頭改送請求","404":"伺服器收到請求，但找不到此資源","500":"伺服器處理時發生內部錯誤"};
    const output = byId("http-output");
    const title = document.createElement("strong");
    const message = document.createElement("pre");
    title.textContent = "這是應用層訊息，不是連線本身。";
    message.textContent = `${method} ${path} HTTP/1.1\nHost: example.test\n\n\nHTTP/1.1 ${status}\nContent-Type: text/plain\n\n示意內容`;
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
      transport:["路徑可能可達，但連線逾時、被拒絕或反覆重傳。","查看埠、握手旗標、序號／確認與作業系統 socket 狀態。"],
      tls:["傳輸連線成立，但加密握手因名稱、有效期或信任鏈失敗。","查看握手警示、伺服器名稱與憑證鏈；不要跳過驗證來掩蓋問題。"],
      http:["安全通道可用，但伺服器回傳重新導向、找不到或內部錯誤。","查看請求方法、路徑、Host 標頭、狀態碼與伺服器應用紀錄。"]
    };
    const [symptom,evidence] = data[byId("fault-layer").value];
    byId("trace-output").innerHTML = `<strong>可觀察現象：</strong>${symptom}<br><strong>下一份證據：</strong>${evidence}<br><span class="note">這是調查起點，不是單憑症狀定案；相鄰層錯誤可能造成相似表現。</span>`;
  };
  listen("fault-layer", "change", draw); draw();
}

function setupDictionary() {
  const search = byId("term-search"); if (!search) return;
  const count = byId("term-count");
  const draw = () => { const q = search.value.trim().toLocaleLowerCase("zh-Hant"); let shown = 0; document.querySelectorAll(".term-card").forEach(card => { const hit = !q || card.dataset.search.toLocaleLowerCase("zh-Hant").includes(q); card.hidden = !hit; if (hit) shown++; }); count.textContent = `顯示 ${shown} 個條目`; };
  search.addEventListener("input", draw); draw();
}

[setupEnvelope, setupArp, setupRoute, setupTransport, setupDns, setupHttp, setupTls, setupTrace, setupDictionary].forEach(fn => fn());

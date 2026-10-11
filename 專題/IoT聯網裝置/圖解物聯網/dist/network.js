(function () {
  'use strict';
  window.IOT = window.IOT || {};
  window.IOT.network = {
    title: '連上 Wi-Fi，就真的送到家了嗎？',
    intro: '小板子的訊息要走完好幾段路，服務才收得到。像寄包裹：走出家門，還不等於收件人已經拿到。',
    prerequisite: '先知道 MCU 是讀感測器、下命令的小隊長；連線模組是幫忙傳話的零件。',
    markup: `
      <div class="lab-grid">
        <section class="lab-panel" aria-label="訊息走過的路">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="network-title network-desc">
            <title id="network-title">從我們的電路板，走到網路服務</title>
            <desc id="network-desc">MCU 把訊息交給外購連線模組，再經天線、Wi-Fi 存取點或手機閘道、網路，最後抵達服務。三個開關可切斷不同路段。</desc>
            <defs><marker id="network-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="context-stroke"/></marker></defs>
            <g font-family="system-ui, sans-serif" fill="#183e37" font-size="22">
              <rect x="20" y="40" width="435" height="185" rx="24" fill="#eae9df" stroke="#183e37" stroke-width="2"/>
              <text x="40" y="76" font-weight="700">我們做：PCB 電路板＋MCU 韌體</text>
              <rect x="42" y="104" width="145" height="85" rx="14" fill="#183e37"/>
              <text x="114" y="140" text-anchor="middle" fill="#f8f7f2" font-weight="700">MCU</text>
              <text x="114" y="169" text-anchor="middle" fill="#f8f7f2">下命令</text>
              <path d="M192 146H254" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#network-arrow)"/>
              <rect x="272" y="104" width="161" height="85" rx="14" fill="#b8cc9a" stroke="#183e37" stroke-width="2"/>
              <text x="352" y="140" text-anchor="middle" font-weight="700" id="network-module">Wi-Fi 模組</text>
              <text x="352" y="169" text-anchor="middle">外購，幫忙傳</text>
              <text x="225" y="214" text-anchor="middle">板上介面，例如 UART</text>
              <path d="M437 146H502" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#network-arrow)"/>
              <path d="M538 150V98M518 104L538 128L558 104M521 153H555" fill="none" stroke="#183e37" stroke-width="5" stroke-linecap="round"/>
              <text x="538" y="188" text-anchor="middle">天線</text>
              <path id="network-local-path" d="M571 136H661" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#network-arrow)"/>
              <text id="network-radio" x="616" y="111" text-anchor="middle">Wi-Fi</text>
              <g id="network-gateway-node">
                <rect x="681" y="72" width="197" height="139" rx="24" fill="#b8cc9a" stroke="#183e37" stroke-width="2"/>
                <path d="M756 110Q780 85 804 110M764 119Q780 102 796 119" fill="none" stroke="#183e37" stroke-width="3"/>
                <circle cx="780" cy="127" r="4"/>
                <text id="network-gateway" x="780" y="161" text-anchor="middle" font-weight="700">Wi-Fi AP</text>
                <text id="network-gateway-note" x="780" y="190" text-anchor="middle">家裡的無線入口</text>
              </g>
              <text id="network-local-state" x="560" y="243" text-anchor="middle">① 區域連線：通</text>
              <path id="network-internet-path" d="M780 220V307" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#network-arrow)"/>
              <g id="network-internet-node">
                <rect x="678" y="322" width="202" height="95" rx="24" fill="#eae9df" stroke="#183e37" stroke-width="2"/>
                <text x="779" y="359" text-anchor="middle" font-weight="700">網際網路</text>
                <text x="779" y="390" text-anchor="middle">把訊息往外送</text>
              </g>
              <text id="network-internet-state" x="583" y="289" text-anchor="middle">② 上網：通</text>
              <path id="network-service-path" d="M666 369H480" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#network-arrow)"/>
              <text id="network-service-state" x="574" y="407" text-anchor="middle">③ 服務：通</text>
              <g id="network-service-node">
                <rect x="258" y="321" width="205" height="97" rx="24" fill="#b8cc9a" stroke="#183e37" stroke-width="2"/>
                <text x="360" y="358" text-anchor="middle" font-weight="700">服務</text>
                <text id="network-arrival" x="360" y="390" text-anchor="middle">收到刻度 20 / 100</text>
              </g>
              <g id="network-letter" transform="translate(306 281)">
                <rect width="50" height="31" rx="5" fill="#ed8154" stroke="#183e37" stroke-width="2"/>
                <path d="M2 3L25 19L48 3" fill="none" stroke="#183e37" stroke-width="2"/>
              </g>
              <text x="35" y="324" font-weight="700">沿箭頭找斷點</text>
              <text x="35" y="358">信封停在哪裡，</text>
              <text x="35" y="389">就先修那一段。</text>
              <text x="450" y="462" text-anchor="middle" id="network-map-status">三段都通：訊息可以送達。</text>
            </g>
          </svg>
          <p class="diagram-caption">本專題做電路板與 MCU 韌體；外購連線模組負責無線傳話。手機模式中，BLE 先到手機，再由手機幫忙上網。</p>
        </section>
        <section class="lab-controls" aria-label="切斷一段路看看">
          <div class="control"><label for="network-mode">用誰帶訊息出門？</label><select id="network-mode"><option value="wifi">Wi-Fi 模組 → 家中 AP</option><option value="ble">BLE 模組 → 手機閘道</option></select></div>
          <div class="control"><label for="network-local"><input type="checkbox" id="network-local" checked> ① 區域連線接通</label></div>
          <div class="control"><label for="network-internet"><input type="checkbox" id="network-internet" checked> ② AP／手機可以上網</label></div>
          <div class="control"><label for="network-service"><input type="checkbox" id="network-service" checked> ③ 目的地服務可用</label></div>
          <p class="reading" id="network-result">已送達服務</p>
          <p class="why" id="network-why" role="status" aria-live="polite"></p>
          <button class="button secondary" type="button" id="network-reset">重設實驗</button>
          <p class="small">試試只關掉「可以上網」：連上 AP，不等於已連到服務。這裡假設 MCU、模組與天線都正常；只示範三段路的可達性。</p>
        </section>
      </div>`,
    mount: function (root) {
      const get = id => root.querySelector('#network-' + id);
      const mode = get('mode');
      const local = get('local');
      const internet = get('internet');
      const service = get('service');
      function road(id, open) {
        get(id + '-path').setAttribute('stroke', open ? '#183e37' : '#ed8154');
        get(id + '-path').setAttribute('stroke-dasharray', open ? 'none' : '9 9');
      }
      function update() {
        const ble = mode.value === 'ble';
        const gateway = ble ? '手機閘道' : 'Wi-Fi AP';
        const sent = local.checked && internet.checked && service.checked;
        get('module').textContent = ble ? 'BLE 模組' : 'Wi-Fi 模組';
        get('radio').textContent = ble ? 'BLE' : 'Wi-Fi';
        get('gateway').textContent = gateway;
        get('gateway-note').textContent = ble ? '手機幫忙轉送' : '家裡的無線入口';
        road('local', local.checked);
        road('internet', internet.checked);
        road('service', service.checked);
        get('local-state').textContent = '① 區域連線：' + (local.checked ? '通' : '斷');
        get('internet-state').textContent = '② 上網：' + (internet.checked ? '通' : '斷');
        get('service-state').textContent = '③ 服務：' + (service.checked ? '通' : '斷');
        get('gateway-node').setAttribute('opacity', local.checked ? '1' : '.45');
        get('internet-node').setAttribute('opacity', local.checked && internet.checked ? '1' : '.45');
        get('service-node').setAttribute('opacity', sent ? '1' : '.45');
        get('arrival').textContent = sent ? '收到刻度 20 / 100' : '還沒收到訊息';
        let reason;
        let status;
        let letter;
        if (!local.checked) {
          status = '停在區域連線';
          letter = 'translate(516 203)';
          reason = '第一個斷點在天線與' + gateway + '之間。模組還送不到這個入口，後面的網路與服務即使正常，也接不到這封訊息。';
        } else if (!internet.checked) {
          status = '到入口，還不能上網';
          letter = 'translate(805 247)';
          reason = '訊息已到' + gateway + '，但它目前沒有往外的網路。' + (ble ? 'BLE 只負責這裡的裝置到手機；仍需要手機的網路與轉送程式。' : 'Wi-Fi 圖示亮起，只能說這一段已連上；家中的對外線路仍可能中斷。');
        } else if (!service.checked) {
          status = '有上網，服務還不可用';
          letter = 'translate(700 272)';
          reason = '區域連線與上網都通了，但目的地服務沒有正常接收。像路都通了，收件窗口卻關著；仍要處理服務故障或連線設定。';
        } else {
          status = '已送達服務';
          letter = 'translate(306 281)';
          reason = '三段都通，這封濕度訊息能走完整條路。' + (ble ? 'BLE 先把訊息交給手機，由手機程式透過自己的網路轉送；不是 BLE 直接連到網際網路。' : 'MCU 交出資料，Wi-Fi 模組經天線連到 AP，再透過網路到服務。');
        }
        get('result').textContent = status;
        get('why').textContent = reason;
        get('letter').setAttribute('transform', letter);
        get('map-status').textContent = sent ? '三段都通：訊息可以送達。' : '先看第一個斷點：' + status + '。';
        get('desc').textContent = 'MCU → 外購' + (ble ? 'BLE' : 'Wi-Fi') + '模組 → 天線 → ' + gateway + ' → 網際網路 → 服務。目前：' + status + '。';
      }
      [mode, local, internet, service].forEach(control => control.addEventListener('change', update));
      get('reset').addEventListener('click', function () {
        mode.value = 'wifi';
        local.checked = internet.checked = service.checked = true;
        update();
      });
      update();
    },
    sources: ['專題／IoT 聯網裝置：韌體－連線模組整合，第 1、5、6 章。', 'E5 IoT 與邊緣運算，第 1、3 章：裝置、閘道與網路的分工。'],
    limits: '這是可達性示意，沒有模擬射頻距離、封包延遲或真實上網。本例假設板上 MCU、外購模組與天線正常；Wi-Fi 路線示範模組內有網路功能的架構，實際分工要依模組文件。BLE 路線需要手機轉送程式及可用的對外網路。'
  };
}());

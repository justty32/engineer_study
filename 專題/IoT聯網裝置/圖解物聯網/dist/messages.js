(function () {
  'use strict';
  window.IOT = window.IOT || {};
  window.IOT.messages = {
    title: '小郵局怎麼知道，要把訊息交給誰？',
    intro: 'MQTT 像一間小郵局：裝置把訊息貼上主題，broker（訊息代理）轉交給訂閱這個主題的人。收據不見時，寄件人可能還留著一封等待確認的信。',
    prerequisite: '先讓裝置到服務的路通了，再看訊息怎麼分送。',
    markup: `
      <div class="lab-grid">
        <section class="lab-panel" aria-label="MQTT 小郵局">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="messages-title messages-desc">
            <title id="messages-title">MQTT 依主題分送訊息</title>
            <desc id="messages-desc">裝置寄出主題 plant/moisture、值為 20 的訊息。小郵局只把它交給訂閱相符主題的人。可測試 QoS 1 的確認遺失、斷線與恢復既有會話後重送。</desc>
            <defs><marker id="messages-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="context-stroke"/></marker></defs>
            <g font-family="system-ui, sans-serif" fill="#183e37" font-size="22">
              <text x="450" y="39" text-anchor="middle" font-weight="700">主題像信封上的分類標籤</text>
              <rect x="26" y="122" width="200" height="192" rx="24" fill="#b8cc9a" stroke="#183e37" stroke-width="2"/>
              <rect x="78" y="150" width="96" height="69" rx="10" fill="#183e37"/>
              <text x="126" y="193" text-anchor="middle" fill="#f8f7f2" font-weight="700">MCU</text>
              <text x="126" y="252" text-anchor="middle" font-weight="700">寄件裝置</text>
              <text x="126" y="285" text-anchor="middle">濕度數值：20</text>
              <path d="M331 140L450 70L569 140Z" fill="#ed8154" stroke="#183e37" stroke-width="3"/>
              <rect x="345" y="140" width="210" height="178" rx="8" fill="#eae9df" stroke="#183e37" stroke-width="3"/>
              <text x="450" y="185" text-anchor="middle" font-weight="700">小郵局</text>
              <text x="450" y="215" text-anchor="middle">broker</text>
              <rect x="418" y="240" width="64" height="78" rx="4" fill="#183e37"/>
              <path d="M430 256H470" stroke="#b8cc9a" stroke-width="5"/>
              <path id="messages-publish-path" d="M234 210H331" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#messages-arrow)"/>
              <text id="messages-publish-count" x="280" y="180" text-anchor="middle">未寄出</text>
              <path id="messages-delivery-path" d="M565 210H661" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#messages-arrow)"/>
              <text id="messages-routing" x="616" y="181" text-anchor="middle">主題相符</text>
              <g id="messages-subscriber-node">
                <rect x="677" y="122" width="197" height="192" rx="24" fill="#b8cc9a" stroke="#183e37" stroke-width="2"/>
                <rect x="716" y="144" width="120" height="67" rx="9" fill="#f8f7f2" stroke="#183e37" stroke-width="3"/>
                <text id="messages-screen-count" x="776" y="191" text-anchor="middle" font-size="32" font-weight="700">0 次</text>
                <text x="776" y="252" text-anchor="middle" font-weight="700">訂閱者</text>
                <text x="776" y="285" text-anchor="middle">本輪收到幾次？</text>
              </g>
              <path id="messages-ack-path" d="M341 273H241" fill="none" stroke="#183e37" stroke-width="3" stroke-dasharray="7 6" marker-end="url(#messages-arrow)"/>
              <g id="messages-ack-cross" visibility="hidden" stroke="#ed8154" stroke-width="6" stroke-linecap="round"><path d="M275 255L303 289M303 255L275 289"/></g>
              <text x="286" y="342" text-anchor="middle" id="messages-ack-label">PUBACK 收據</text>
              <text x="126" y="385" text-anchor="middle" font-weight="700">寄出主題</text>
              <text x="126" y="415" text-anchor="middle">plant/moisture</text>
              <text x="776" y="385" text-anchor="middle" font-weight="700">訂閱主題</text>
              <text x="776" y="415" text-anchor="middle" id="messages-topic-label">plant/moisture</text>
              <rect x="307" y="375" width="286" height="49" rx="24" fill="#eae9df"/>
              <text x="450" y="407" text-anchor="middle" id="messages-phase-label">準備寄出</text>
              <text x="450" y="463" text-anchor="middle" id="messages-map-note">只分送給訂閱同一個主題的人。</text>
            </g>
          </svg>
          <p class="diagram-caption">實線往右是寄信與分送；虛線往左是給寄件裝置的 PUBACK（接收確認）。確認不是「水泵已經動了」的證明。</p>
        </section>
        <section class="lab-controls" aria-label="寄一封測試信">
          <div class="control"><label for="messages-topic">收件人訂閱哪個主題？</label><select id="messages-topic"><option value="plant/moisture">plant/moisture（植物濕度）</option><option value="room/temp">room/temp（房間溫度）</option></select></div>
          <div class="control"><label for="messages-qos">寄件裝置到小郵局怎麼確認？</label><select id="messages-qos"><option value="1">QoS 1：要一張接收收據</option><option value="0">QoS 0：不索取接收收據</option></select></div>
          <div class="control"><label for="messages-loss"><input type="checkbox" id="messages-loss"> 讓第一次 PUBACK 遺失，接著斷線</label></div>
          <div class="segmented"><button class="button" type="button" id="messages-send">寄出測試信</button><button class="button secondary" type="button" id="messages-resume" aria-disabled="true">恢復既有會話並重送</button></div>
          <p class="reading">本輪收到 <output id="messages-count">0</output> 次</p>
          <p class="why" id="messages-why" role="status" aria-live="polite"></p>
          <button class="button secondary" type="button" id="messages-reset">重設實驗</button>
          <p class="small">每次「寄出」開始新的一輪；更改選項也會清空本輪。QoS 0 可能丟訊息；此例固定讓第一次訊息到達。訂閱只比較上面兩個完整主題，不示範萬用字元。</p>
        </section>
      </div>`,
    mount: function (root) {
      const get = id => root.querySelector('#messages-' + id);
      const topic = get('topic');
      const qos = get('qos');
      const loss = get('loss');
      let phase = 'ready';
      let deliveries = 0;
      function update() {
        const match = topic.value === 'plant/moisture';
        const q1 = qos.value === '1';
        const waiting = phase === 'waiting';
        const sent = phase !== 'ready';
        const repeated = phase === 'resent';
        get('topic-label').textContent = topic.value;
        get('count').textContent = String(deliveries);
        get('screen-count').textContent = deliveries + ' 次';
        get('routing').textContent = match ? '主題相符' : '主題不同';
        get('delivery-path').setAttribute('stroke', match ? '#183e37' : '#ed8154');
        get('delivery-path').setAttribute('stroke-dasharray', match ? 'none' : '8 7');
        get('delivery-path').setAttribute('opacity', sent ? '1' : '.4');
        get('subscriber-node').setAttribute('opacity', match ? '1' : '.5');
        get('publish-path').setAttribute('stroke-dasharray', waiting ? '8 7' : 'none');
        get('publish-path').setAttribute('stroke', waiting ? '#ed8154' : '#183e37');
        get('publish-count').textContent = repeated ? '寄了 2 次' : (sent ? '寄了 1 次' : '未寄出');
        get('ack-path').setAttribute('visibility', q1 ? 'visible' : 'hidden');
        get('ack-path').setAttribute('opacity', sent ? '1' : '.4');
        get('ack-cross').setAttribute('visibility', waiting ? 'visible' : 'hidden');
        get('ack-label').textContent = !q1 ? 'QoS 0 沒有這張收據' : (waiting ? '第一次收據遺失' : (sent ? '收到 PUBACK' : 'PUBACK 收據'));
        get('phase-label').textContent = waiting ? '已斷線，等待恢復' : (repeated ? '恢復後重送完成' : (sent ? '本輪寄送完成' : '準備寄出'));
        get('resume').setAttribute('aria-disabled', waiting ? 'false' : 'true');
        let why;
        let note;
        if (!sent) {
          why = match ? '收件人訂閱了植物濕度。按「寄出」後，小郵局會把 plant/moisture 的訊息分送給他。' : '收件人只想收房間溫度。植物濕度的主題不同，即使小郵局收到，也不會分送給他。';
          if (!q1) why += ' QoS 0 不使用 PUBACK，所以「確認遺失」開關不影響這次示例。';
          note = '只分送給訂閱同一個主題的人。';
        } else if (waiting) {
          why = '第一封訊息已到小郵局，' + (match ? '也已分送一次。' : '但主題不同，沒有分送。') + '給寄件人的 PUBACK 遺失，接著連線中斷；寄件人仍保留未確認的訊息。按「恢復既有會話並重送」看下一步。';
          note = '確認遺失 → 斷線 → 等待恢復既有會話。';
        } else if (repeated) {
          why = '恢復既有會話後，寄件人重送那封未確認的訊息，並收到了新的 PUBACK。' + (match ? '本例讓小郵局再次分送，所以訂閱者共收到 2 次；這是可能路徑，不是每次都必然重複。' : '收件人訂閱的主題仍不相符，所以收到 0 次。') + ' PUBACK 只確認這一段的協定接收，不保證水泵等實體動作已完成。';
          note = match ? '可能收到重複訊息：應用要能辨認同一筆工作。' : '主題不同：即使重送，也不分送給這個訂閱者。';
        } else {
          why = '本例的第一封訊息已到小郵局。' + (match ? '主題相符，訂閱者收到 1 次。' : '主題不同，訂閱者收到 0 次。') + (q1 ? ' 寄件人收到 PUBACK，知道小郵局已接收；它不代表水泵已動作。' : ' QoS 0 沒有 PUBACK，也不做這種確認與重送；真實網路仍可能丟訊息。「確認遺失」開關在此不生效。');
          note = q1 ? '有收據，代表協定接收；實體動作還要另外確認。' : 'QoS 0：本例送到了，並不是保證一定送到。';
        }
        get('why').textContent = why;
        get('map-note').textContent = note;
        get('desc').textContent = '裝置發布 plant/moisture:20；訂閱者選擇 ' + topic.value + '。QoS ' + qos.value + '。' + get('phase-label').textContent + '，本輪收到 ' + deliveries + ' 次。' + note;
      }
      function clearRound() {
        phase = 'ready';
        deliveries = 0;
        update();
      }
      [topic, qos, loss].forEach(control => control.addEventListener('change', clearRound));
      get('send').addEventListener('click', function () {
        deliveries = topic.value === 'plant/moisture' ? 1 : 0;
        phase = qos.value === '1' && loss.checked ? 'waiting' : 'sent';
        update();
      });
      get('resume').addEventListener('click', function () {
        if (phase !== 'waiting') return;
        if (topic.value === 'plant/moisture') deliveries += 1;
        phase = 'resent';
        update();
      });
      get('reset').addEventListener('click', function () {
        topic.value = 'plant/moisture';
        qos.value = '1';
        loss.checked = false;
        clearRound();
      });
      update();
    },
    sources: ['E5 IoT 與邊緣運算，第 4 章：MQTT 發布／訂閱與 QoS。', 'OASIS MQTT Version 5.0，§ 4.3.1、4.3.2、4.4：QoS 0、QoS 1，以及重新連線恢復會話後重送未確認訊息。'],
    limits: '小郵局是類比。本例只改變發布端到 broker 的 QoS，假設 broker 到訂閱者的傳遞正常。第一次 PUBLISH 固定到達；若第一次 PUBACK 遺失，示範接著斷線、保留會話、恢復同一會話並重送的路徑，不示範仍連線時逾時重送。重送後再次分送是可能情境，不是必然。未模擬真實網路、完整會話設定或實體致動器。'
  };
}());

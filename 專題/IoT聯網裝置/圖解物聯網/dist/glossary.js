'use strict';
(() => {
  const terms = [
    ['iot','物聯網','Internet of Things · IoT','讓實體裝置量測身邊的變化、交換資料，必要時做出動作。網路把消息連起來；裝置本機仍有自己的規則。','index'],
    ['sensor','感測器','Sensor','把溫度、光線、土壤狀態等變化換成電訊號。探棒先「感覺」，校正後才知道讀數代表什麼。','sensors'],
    ['adc','類比數位轉換器','Analog-to-Digital Converter · ADC','像一把有有限格子的電壓尺，把電壓轉成整數。本例有 256 個編號；格子多不等於量測一定準。','sensors'],
    ['calibration','校正','Calibration','拿已知狀態和讀數對照，才知道數字的意思。土壤探棒的乾、濕兩端只是起點；實際含水率還受土質和感測原理影響。','sensors'],
    ['mcu','微控制器','Microcontroller Unit · MCU','板上的小腦袋，裡面有運算、記憶體和周邊介面。它照程式比較讀數、控制燈，再交給模組傳送。','brain'],
    ['firmware','韌體','Firmware','跑在裝置上的程式。像「讀數低於 35 就提醒」這條規則，並不是晶片天生知道，而是人寫進去的。','brain'],
    ['pcb','印刷電路板','Printed Circuit Board · PCB','承載零件與銅線的板子。電源路徑讓零件有能量工作，訊號路徑讓零件交換資料；兩種角色都需要設計。','power'],
    ['current','電流與電量','mA / mAh','mA 描述電流大小；mAh 描述電荷量。若電池端持續流出 1 mA，理想上 1000 mAh 可供 1000 小時，實際可用容量還受條件影響。','power'],
    ['duty-cycle','工作週期','Duty Cycling','醒來做完量測與傳送，再回去睡。同樣一輪工作，回報間隔拉長，平均電流通常下降；但單次發射尖峰不會因此消失。','power'],
    ['module','連線模組','Connectivity Module','幫忙處理無線收發與部分網路協定的外購零件。它和主控 MCU 的工作分界，依產品與模組功能而定。','network'],
    ['uart','通用非同步收發器','Universal Asynchronous Receiver/Transmitter · UART','板上零件交換序列資料的介面。MCU 可以用它送命令給連線模組；它本身不是 Wi-Fi，也不會直接替你上網。','network'],
    ['gateway','閘道','Gateway','把一邊的連線接向另一邊的中繼角色。這裡的 BLE 裝置先找手機，由手機轉送到網際網路。','network'],
    ['mqtt','MQTT 訊息協定','MQTT','裝置把消息交給訊息代理伺服器，伺服器依主題分給訂閱的人。本實驗的小郵局，就是這個代理角色。','messages'],
    ['topic','主題','Topic','像信件分類名稱，例如 plant/moisture。訂閱者指定想聽的主題，代理伺服器才知道要把哪些消息分給它。','messages'],
    ['qos','服務品質等級','Quality of Service · QoS','MQTT 的交付約定：0 可能丟失；1 可能重複；2 在協定範圍處理同一次交付去重。收到協定收據不代表幫浦真的動過。','messages'],
    ['signature','數位簽章','Digital Signature','用受信任的公鑰檢查來源和內容是否匹配的數學證據。更新包附上一把陌生公鑰，不能自行證明它可信。','security'],
    ['tls','傳輸層安全協定','Transport Layer Security · TLS','在端點之間保護傳輸通道並驗證設定要求的身分。它不會代替更新檔簽章、裝置端安全或正確的權限設定。','security'],
    ['buffer','緩存與退避','Buffer / Backoff','緩存先留住送不出去的讀值；退避讓失敗後的重試隔一段時間。空間有限仍可能丟資料，實際重連通常再加入隨機錯開。','reliability']
  ];
  const input = document.getElementById('glossary-search');
  const results = document.getElementById('glossary-results');
  if (!input || !results) return;
  function update() {
    const query = input.value.trim().toLocaleLowerCase();
    const found = terms.filter(term=>term.slice(1,4).join(' ').toLocaleLowerCase().includes(query));
    document.getElementById('glossary-count').textContent = found.length ? `找到 ${found.length} 個小解釋。` : '暫時找不到這個詞。試試較短的關鍵字，或清空搜尋看全部。';
    results.innerHTML = found.map(t=>`<article class="glossary-entry" id="term-${t[0]}"><h2>${t[1]}</h2><span class="english">${t[2]}</span><p>${t[3]}</p><a href="${t[4]}.html">到圖裡看看 ↗</a></article>`).join('');
  }
  input.addEventListener('input',update);
  update();
})();

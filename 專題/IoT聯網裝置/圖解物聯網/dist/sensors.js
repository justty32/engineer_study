(function () {
  'use strict';
  window.IOT = window.IOT || {};
  window.IOT.sensors = {
    title: '一盆土，怎麼變成一個數字？',
    intro: '感測器像裝置的手指，把碰到的變化換成電訊號；ADC 再像一把有格子的尺，把電壓讀成數字。移動下方刻度，看看探棒、電壓和數字如何一起改變。',
    prerequisite: '先知道：物聯網裝置會把身邊的變化，交給晶片處理。',
    markup: `
      <div class="lab-grid">
        <div class="lab-panel">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="sensors-title sensors-desc">
            <title id="sensors-title">從土壤探棒到數字的三個步驟</title>
            <desc id="sensors-desc">教學刻度 40，探棒輸出 1.32 伏特，ADC 轉成 102。這是假設線性變化的教學模型。</desc>
            <defs>
              <marker id="sensors-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#183e37"/></marker>
              <clipPath id="sensors-pot-clip"><path d="M54 260H236L215 390Q145 420 75 390Z"/></clipPath>
            </defs>
            <rect x="8" y="8" width="884" height="464" rx="30" fill="#f0f1e7"/>
            <g font-family="system-ui, sans-serif" fill="#183e37" text-anchor="middle">
              <circle cx="75" cy="58" r="20" fill="#b8cc9a"/><text x="75" y="66" font-size="24" font-weight="700">1</text>
              <text x="174" y="67" font-size="26" font-weight="700">感覺變化</text>
              <circle cx="369" cy="58" r="20" fill="#b8cc9a"/><text x="369" y="66" font-size="24" font-weight="700">2</text>
              <text x="478" y="67" font-size="26" font-weight="700">切成格子</text>
              <circle cx="672" cy="58" r="20" fill="#b8cc9a"/><text x="672" y="66" font-size="24" font-weight="700">3</text>
              <text x="783" y="67" font-size="26" font-weight="700">交出數字</text>
              <path d="M142 260V171" fill="none" stroke="#48694c" stroke-width="9" stroke-linecap="round"/>
              <path d="M142 214C82 219 72 173 85 161C125 155 145 177 142 214Z" fill="#b8cc9a" stroke="#48694c" stroke-width="3"/>
              <path d="M143 191C138 151 178 127 204 141C200 177 179 191 143 191Z" fill="#8daa74" stroke="#48694c" stroke-width="3"/>
              <path d="M54 260H236L215 390Q145 420 75 390Z" fill="#c99b73" stroke="#183e37" stroke-width="3"/>
              <rect id="sensors-soil-fill" x="45" y="344" width="201" height="170" fill="#748d68" opacity=".65" clip-path="url(#sensors-pot-clip)"/>
              <path d="M61 283H228M74 320H221M86 360H209" fill="none" stroke="#183e37" stroke-opacity=".12" stroke-width="3" stroke-dasharray="4 14"/>
              <rect x="48" y="249" width="194" height="24" rx="10" fill="#ed8154" stroke="#183e37" stroke-width="3"/>
              <path d="M191 268V330M209 268V330" stroke="#183e37" stroke-width="8" stroke-linecap="round"/>
              <rect x="180" y="220" width="40" height="54" rx="9" fill="#f8f7f2" stroke="#183e37" stroke-width="4"/>
              <circle cx="200" cy="238" r="5" fill="#ed8154"/>
              <path id="sensors-wire" d="M220 238H279Q294 238 294 220V196H342" stroke="#183e37" stroke-width="5" fill="none" marker-end="url(#sensors-arrow)"/>
              <g id="sensors-broken" visibility="hidden"><circle cx="289" cy="227" r="20" fill="#f8f7f2"/><path d="m278 216 22 22m0-22-22 22" stroke="#b64c29" stroke-width="5"/></g>
              <text x="285" y="162" font-size="23">電壓</text>
              <text id="sensors-voltage-diagram" x="291" y="297" font-size="26" font-weight="700">1.32 V</text>
              <text x="145" y="441" font-size="24">土壤＋探棒</text>
              <rect x="366" y="122" width="224" height="250" rx="24" fill="#f8f7f2" stroke="#183e37" stroke-width="3"/>
              <text x="478" y="164" font-size="30" font-weight="750">ADC</text>
              <text x="478" y="199" font-size="22">電壓 → 格子編號</text>
              <g id="sensors-grid" fill="#eae9df" stroke="#f8f7f2" stroke-width="3">
                <rect x="392" y="222" width="40" height="40" rx="5"/><rect x="436" y="222" width="40" height="40" rx="5"/><rect x="480" y="222" width="40" height="40" rx="5"/><rect x="524" y="222" width="40" height="40" rx="5"/>
                <rect x="392" y="266" width="40" height="40" rx="5"/><rect x="436" y="266" width="40" height="40" rx="5"/><rect x="480" y="266" width="40" height="40" rx="5"/><rect x="524" y="266" width="40" height="40" rx="5"/>
              </g>
              <text x="478" y="346" font-size="22">256 格，編號 0–255</text>
              <path id="sensors-data-line" d="M591 240H660" stroke="#183e37" stroke-width="5" marker-end="url(#sensors-arrow)"/>
              <rect x="684" y="145" width="178" height="205" rx="25" fill="#183e37"/>
              <text x="773" y="187" font-size="23" fill="#d7e6c7">晶片拿到的數字</text>
              <text id="sensors-code-diagram" x="773" y="270" font-size="65" font-weight="750" fill="#f8f7f2">102</text>
              <text id="sensors-valid-diagram" x="773" y="319" font-size="22" fill="#d7e6c7">有效讀值</text>
              <text id="sensors-grid-caption" x="478" y="406" font-size="22">圖中以 8 格示意</text>
              <text x="753" y="404" font-size="22">下一站：交給規則</text>
            </g>
          </svg>
          <p class="diagram-caption">探棒先產生電訊號，ADC 才把它變成晶片能用的數字。</p>
        </div>
        <div class="lab-controls">
          <div class="control">
            <label for="sensors-moisture">濕潤程度（教學刻度）</label>
            <output id="sensors-moisture-output" for="sensors-moisture">40 / 100</output>
            <input id="sensors-moisture" type="range" min="0" max="100" step="5" value="40" aria-describedby="sensors-scale-note">
            <p class="small" id="sensors-scale-note">0 是乾、100 是濕，只是模型刻度，並非真實土壤含水率。</p>
          </div>
          <div class="control"><label for="sensors-connected"><input id="sensors-connected" type="checkbox" checked> 探棒接線完整</label></div>
          <div class="reading"><span class="small">探棒輸出 → ADC 讀數</span><p><strong id="sensors-reading">1.32 V → 102</strong></p></div>
          <p id="sensors-why" class="why" role="status" aria-live="polite" aria-atomic="true"></p>
          <button class="button secondary" id="sensors-reset" type="button">重設實驗</button>
        </div>
      </div>
      <p class="lesson-note">試一試：先滑到最乾與最濕，再取消接線。沒有有效讀值的意思是「不知道」，不能當作「乾到 0」。</p>`,
    mount: function (root) {
      const find = function (id) { return root.querySelector('#sensors-' + id); };
      const moisture = find('moisture');
      const connected = find('connected');
      const grid = root.querySelectorAll('#sensors-grid rect');
      function update() {
        const h = Number(moisture.value);
        const valid = connected.checked;
        const voltage = (3.3 * h / 100).toFixed(2);
        const code = Math.round(255 * h / 100);
        find('moisture-output').textContent = h + ' / 100';
        moisture.setAttribute('aria-valuetext', '教學刻度 ' + h + '，範圍 0 到 100');
        find('soil-fill').setAttribute('y', String(405 - 150 * h / 100));
        find('voltage-diagram').textContent = valid ? voltage + ' V' : '未知';
        find('code-diagram').textContent = valid ? String(code) : '—';
        find('valid-diagram').textContent = valid ? '有效讀值' : '無有效讀值';
        find('reading').textContent = valid ? voltage + ' V → ' + code : '無有效讀值';
        find('broken').setAttribute('visibility', valid ? 'hidden' : 'visible');
        find('wire').setAttribute('stroke-dasharray', valid ? 'none' : '8 8');
        find('data-line').setAttribute('opacity', valid ? '1' : '.2');
        find('grid-caption').textContent = valid ? '圖中以 8 格示意' : '不採用斷線訊號';
        grid.forEach(function (cell, i) { cell.setAttribute('fill', valid && i < Math.round(h * 8 / 100) ? '#b8cc9a' : '#eae9df'); });
        find('why').textContent = valid
          ? '在這個假設越濕電壓越高的模型裡，刻度 ' + h + ' 先變成 ' + voltage + ' V，再對應到 0–255 中的 ' + code + '。ADC 讀的是電壓，並不直接懂土壤。'
          : '接線斷了，這次讀值不能用。土壤設定仍是 ' + h + '，但晶片不能從失效的探棒得知它有多濕；先檢查接線，再恢復量測。';
        find('desc').textContent = valid
          ? '濕潤程度教學刻度 ' + h + '，探棒輸出 ' + voltage + ' 伏特，ADC 轉成數字 ' + code + '。圖中八格只是示意，模型實際有 256 種編號。'
          : '探棒接線斷開，電壓與 ADC 讀數皆無效。圖上顯示斷線記號，不能把它當成乾燥的零。';
      }
      moisture.addEventListener('input', update);
      connected.addEventListener('change', update);
      find('reset').addEventListener('click', function () { moisture.value = '40'; connected.checked = true; update(); });
      update();
    },
    sources: ['專題／IoT 聯網裝置／index.md：系統分層（感測器 → ADC → MCU）。', '電機／09-嵌入式特化／E1-嵌入式系統基礎.md：ADC 與周邊。'],
    limits: '線性教學模型：V = 3.3 × 刻度 ÷ 100，8-bit ADC 編號 = 四捨五入（255 × 刻度 ÷ 100）；8 格圖示只呈現大致位置，並非實際量化格數。真機必須做乾／濕校正，各感測器的增減方向（極性）可能不同，也可能使用數位介面。接線失效在本實驗由開關直接告知；真實 ADC 的浮接腳位仍可能跳出數字，韌體需要有效性檢查。'
  };
}());

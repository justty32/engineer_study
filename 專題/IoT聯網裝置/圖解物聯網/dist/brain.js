(function () {
  'use strict';
  window.IOT = window.IOT || {};
  window.IOT.brain = {
    title: '小晶片怎麼決定要不要提醒？',
    intro: '微控制器（MCU）是照著韌體指令做事的小晶片：先確認讀值能用，再拿它和你設定的界線比較。這裡的規則只有一句：「低於界線，就亮需水燈。」',
    prerequisite: '接續上一站：感測器提供讀值，無效的讀值不能當成 0。',
    markup: `
      <div class="lab-grid">
        <div class="lab-panel">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="brain-title brain-desc">
            <title id="brain-title">小晶片先檢查讀值，再比較提醒界線</title>
            <desc id="brain-desc">有效讀值 30，低於提醒界線 35，所以亮起需水燈。</desc>
            <defs><marker id="brain-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#183e37"/></marker></defs>
            <rect x="8" y="8" width="884" height="464" rx="30" fill="#f0f1e7"/>
            <g font-family="system-ui, sans-serif" fill="#183e37" text-anchor="middle">
              <text x="121" y="57" font-size="25" font-weight="700">讀值</text>
              <text x="324" y="57" font-size="25" font-weight="700">先確認能用</text>
              <text x="548" y="57" font-size="25" font-weight="700">再照規則比較</text>
              <text x="777" y="57" font-size="25" font-weight="700">決定提醒</text>
              <rect x="44" y="112" width="153" height="153" rx="22" fill="#f8f7f2" stroke="#183e37" stroke-width="3"/>
              <text id="brain-input-value" x="120" y="187" font-size="56" font-weight="750">30</text>
              <text id="brain-input-status" x="120" y="232" font-size="22">有效讀值</text>
              <path d="M200 186H233" stroke="#183e37" stroke-width="4" marker-end="url(#brain-arrow)"/>
              <g stroke="#183e37" stroke-width="5" stroke-linecap="round">
                <path d="M273 113V95M307 113V95M341 113V95M375 113V95M273 261V278M307 261V278M341 261V278M375 261V278M253 143H235M253 179H235M253 215H235M395 143H411M395 179H411M395 215H411"/>
              </g>
              <rect x="252" y="112" width="144" height="150" rx="19" fill="#183e37"/>
              <text x="324" y="155" font-size="29" font-weight="750" fill="#f8f7f2">MCU</text>
              <circle cx="300" cy="180" r="6" fill="#d7e6c7"/><circle cx="348" cy="180" r="6" fill="#d7e6c7"/>
              <path d="M305 198Q324 216 343 198" stroke="#d7e6c7" stroke-width="4" fill="none" stroke-linecap="round"/>
              <text id="brain-mcu-status" x="324" y="244" font-size="22" fill="#d7e6c7">可以比較</text>
              <path id="brain-compare-line" d="M414 186H441" stroke="#183e37" stroke-width="4" marker-end="url(#brain-arrow)"/>
              <path id="brain-diamond" d="M547 95 646 186 547 277 448 186Z" fill="#b8cc9a" stroke="#183e37" stroke-width="3"/>
              <text x="547" y="165" font-size="24">讀值低於</text>
              <text id="brain-rule-label" x="547" y="198" font-size="28" font-weight="750">35 嗎？</text>
              <text id="brain-comparison" x="547" y="235" font-size="23">30 &lt; 35</text>
              <path id="brain-yes-path" d="M646 186H675V141H717" fill="none" stroke="#ed8154" stroke-width="5" marker-end="url(#brain-arrow)"/>
              <text x="678" y="119" font-size="22">是</text>
              <path id="brain-no-path" d="M547 279V310H775V268" fill="none" stroke="#183e37" stroke-width="4" opacity=".25" stroke-dasharray="7 6"/>
              <text x="633" y="301" font-size="22">否</text>
              <circle id="brain-lamp-halo" cx="777" cy="177" r="67" fill="#ed8154" opacity=".18"/>
              <path id="brain-lamp" d="M738 166C738 114 816 114 816 166C816 190 798 193 798 215H756C756 193 738 190 738 166Z" fill="#ed8154" stroke="#183e37" stroke-width="4"/>
              <path d="M758 227H796M763 237H791" fill="none" stroke="#183e37" stroke-width="6" stroke-linecap="round"/>
              <path d="M765 173 777 185 789 173M777 185V209" fill="none" stroke="#183e37" stroke-width="3"/>
              <text id="brain-lamp-label" x="777" y="281" font-size="25" font-weight="700">亮燈・需水</text>
              <rect x="45" y="340" width="810" height="109" rx="18" fill="#f8f7f2"/>
              <text x="110" y="374" font-size="22">乾</text><text x="790" y="374" font-size="22">濕</text>
              <rect x="110" y="392" width="680" height="13" rx="6" fill="#d9e3cf"/>
              <rect id="brain-alert-zone" x="110" y="392" width="238" height="13" rx="6" fill="#ed8154" opacity=".65"/>
              <path id="brain-threshold-marker" d="M348 377V416" stroke="#183e37" stroke-width="3" stroke-dasharray="5 4"/>
              <text id="brain-threshold-label" x="348" y="439" font-size="22">界線 35</text>
              <circle id="brain-value-marker" cx="314" cy="398" r="12" fill="#183e37" stroke="#f8f7f2" stroke-width="3"/>
              <text id="brain-value-label" x="314" y="374" font-size="22" font-weight="700">讀值 30</text>
            </g>
          </svg>
          <p class="diagram-caption">亮燈只是執行比較規則；界線應由了解植物與感測器的人設定。</p>
        </div>
        <div class="lab-controls">
          <div class="control">
            <label for="brain-moisture">濕潤程度（教學刻度）</label>
            <output id="brain-moisture-output" for="brain-moisture">30 / 100</output>
            <input id="brain-moisture" type="range" min="0" max="100" step="5" value="30" aria-describedby="brain-scale-note">
            <p class="small" id="brain-scale-note">0 是乾、100 是濕；是假設已校正的教學刻度，並非真實含水率。</p>
          </div>
          <div class="control">
            <label for="brain-threshold">低於多少就提醒？</label>
            <output id="brain-threshold-output" for="brain-threshold">35 / 100</output>
            <input id="brain-threshold" type="range" min="10" max="80" step="5" value="35">
          </div>
          <div class="control"><label for="brain-valid"><input id="brain-valid" type="checkbox" checked> 感測讀值有效</label></div>
          <div class="reading"><span class="small">小晶片的決定</span><p><strong id="brain-result">亮起需水燈</strong></p></div>
          <p class="why" id="brain-why" role="status" aria-live="polite" aria-atomic="true"></p>
          <button class="button secondary" id="brain-reset" type="button">重設實驗</button>
        </div>
      </div>
      <p class="lesson-note">試一試：讓讀值剛好等於界線。規則寫「低於」，所以相等時不提醒；再取消有效讀值，看看晶片為何停止判斷。</p>`,
    mount: function (root) {
      const find = function (id) { return root.querySelector('#brain-' + id); };
      const moisture = find('moisture');
      const threshold = find('threshold');
      const validInput = find('valid');
      function update() {
        const h = Number(moisture.value);
        const t = Number(threshold.value);
        const valid = validInput.checked;
        const needsWater = valid && h < t;
        const relation = h < t ? ' < ' : h === t ? ' = ' : ' > ';
        find('moisture-output').textContent = h + ' / 100';
        find('threshold-output').textContent = t + ' / 100';
        moisture.setAttribute('aria-valuetext', '濕潤程度教學刻度 ' + h);
        threshold.setAttribute('aria-valuetext', '低於教學刻度 ' + t + ' 時提醒');
        find('input-value').textContent = valid ? String(h) : '—';
        find('input-status').textContent = valid ? '有效讀值' : '讀值無效';
        find('mcu-status').textContent = valid ? '可以比較' : '停止判斷';
        find('compare-line').setAttribute('opacity', valid ? '1' : '.2');
        find('diamond').setAttribute('fill', valid ? '#b8cc9a' : '#eae9df');
        find('rule-label').textContent = t + ' 嗎？';
        find('comparison').textContent = valid ? h + relation + t : '暫停';
        find('yes-path').setAttribute('opacity', needsWater ? '1' : '.2');
        find('yes-path').setAttribute('stroke-dasharray', needsWater ? 'none' : '7 6');
        find('no-path').setAttribute('opacity', valid && !needsWater ? '1' : '.2');
        find('no-path').setAttribute('stroke-dasharray', valid && !needsWater ? 'none' : '7 6');
        find('lamp').setAttribute('fill', needsWater ? '#ed8154' : '#eae9df');
        find('lamp-halo').setAttribute('opacity', needsWater ? '.22' : '0');
        find('lamp-label').textContent = !valid ? '暫停・先檢查' : needsWater ? '亮燈・需水' : '熄燈・不提醒';
        find('result').textContent = !valid ? '停止判斷，檢查感測器' : needsWater ? '亮起需水燈' : '沒有觸發需水提醒';
        const tx = 110 + t * 6.8;
        const hx = 110 + h * 6.8;
        find('alert-zone').setAttribute('width', String(t * 6.8));
        find('threshold-marker').setAttribute('d', 'M' + tx + ' 377V416');
        find('threshold-label').setAttribute('x', String(tx));
        find('threshold-label').textContent = '界線 ' + t;
        find('value-marker').setAttribute('cx', String(hx));
        find('value-marker').setAttribute('visibility', valid ? 'visible' : 'hidden');
        find('value-label').setAttribute('x', String(Math.max(190, Math.min(710, hx))));
        find('value-label').textContent = valid ? '讀值 ' + h : '無有效讀值';
        find('why').textContent = !valid
          ? '感測讀值無效，不能判斷乾濕，也不能把它當成 0 來亮需水燈。先檢查感測器，再繼續比較。'
          : needsWater
            ? '讀值 ' + h + ' 低於界線 ' + t + '，符合你寫的規則，所以亮起需水燈。小晶片執行規則，本身不懂植物。'
            : h === t
              ? '讀值 ' + h + ' 剛好等於界線 ' + t + '。規則是「低於」才提醒，相等不算低於，所以燈不亮。'
              : '讀值 ' + h + ' 高於界線 ' + t + '，沒有符合「低於才提醒」的規則，所以燈不亮；這不代表已證明植物水分剛好。';
        find('desc').textContent = !valid
          ? '感測讀值無效，MCU 停止比較，需水燈不亮，並提示檢查感測器。'
          : '有效讀值 ' + h + '，提醒界線 ' + t + '；' + (needsWater ? '讀值低於界線，因此亮起需水燈。' : '讀值沒有低於界線，因此不觸發需水提醒。');
      }
      moisture.addEventListener('input', update);
      threshold.addEventListener('input', update);
      validInput.addEventListener('change', update);
      find('reset').addEventListener('click', function () { moisture.value = '30'; threshold.value = '35'; validInput.checked = true; update(); });
      update();
    },
    sources: ['專題／IoT 聯網裝置／韌體-架構與電源管理.md：第 2 章「分層與狀態機」。', '專題／IoT 聯網裝置／index.md：MCU 內執行的韌體與系統分層。'],
    limits: '教學模型假設輸入已轉成 0–100 的濕潤程度刻度，並提供有效／無效旗標。判準只有「有效且讀值 < 界線」，不是種植建議，也不會直接啟動水泵。真機的土壤感測器需要乾／濕校正，極性依型號而異；實際提醒通常還需處理雜訊與界線附近反覆跳動。這裡的有效性由開關給定，不代表 MCU 能自動辨認所有感測器故障。'
  };
}());

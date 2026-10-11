(function () {
  'use strict';

  window.IOT = window.IOT || {};
  window.IOT.power = {
    title: '電池怎麼陪裝置撐久一點？',
    intro: '電要有一條繞回電池的路，裝置才能工作。少醒來傳訊息、多睡一會兒，通常就能省電。',
    prerequisite: '先知道感測器會量測、小腦袋會控制；這一站看它們怎麼一起用電。',
    markup: `
      <div class="lab-grid">
        <section class="lab-panel" aria-label="電流回路與一輪用電圖">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="power-title power-desc" xmlns="http://www.w3.org/2000/svg" fill="#183e37" font-family="inherit">
            <title id="power-title">接好一圈電路，再看裝置醒來與睡覺</title>
            <desc id="power-desc">電池供電給感測器、小腦袋與外購無線模組，再經回線回到電池。一輪依序量測零點二秒、傳送一秒，其餘時間睡眠。圖分段放大，不按時間比例。</desc>
            <defs>
              <marker id="power-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="#183e37" />
              </marker>
            </defs>
            <rect x="305" y="39" width="540" height="226" rx="24" fill="#eae9df" />
            <text x="577" y="29" text-anchor="middle" font-size="24" font-weight="700">板上裝置</text>
            <rect x="55" y="95" width="127" height="115" rx="20" fill="#b8cc9a" stroke="#183e37" stroke-width="3" />
            <rect x="182" y="110" width="12" height="22" rx="3" fill="#183e37" />
            <rect x="182" y="175" width="12" height="22" rx="3" fill="#183e37" />
            <text x="118" y="137" text-anchor="middle" font-size="27" font-weight="700">電池</text>
            <text id="power-battery-label" x="118" y="175" text-anchor="middle" font-size="22">2000 mAh</text>
            <text x="198" y="111" font-size="23">＋</text>
            <text x="198" y="179" font-size="23">−</text>
            <g id="power-wires" fill="none" stroke="#183e37" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 194 121 H 230 V 75 H 250 M 295 75 H 790 M 790 240 H 230 V 186 H 194" />
              <path d="M 380 75 V 116 M 380 184 V 240 M 555 75 V 116 M 555 184 V 240 M 740 75 V 116 M 740 184 V 240" />
              <path id="power-switch" d="M 250 75 L 295 75" />
            </g>
            <circle cx="250" cy="75" r="6" fill="#f8f7f2" stroke="#183e37" stroke-width="3" />
            <circle cx="295" cy="75" r="6" fill="#f8f7f2" stroke="#183e37" stroke-width="3" />
            <g id="power-flow" fill="none" stroke="#183e37" stroke-width="4" marker-end="url(#power-arrow)">
              <path d="M 420 75 H 463" />
              <path d="M 681 240 H 634" />
              <path d="M 322 240 H 274" />
            </g>
            <rect x="320" y="116" width="120" height="68" rx="16" fill="#b8cc9a" stroke="#183e37" stroke-width="2" />
            <text x="380" y="158" text-anchor="middle" font-size="25" font-weight="700">感測器</text>
            <rect x="495" y="116" width="120" height="68" rx="16" fill="#f8f7f2" stroke="#183e37" stroke-width="2" />
            <text x="555" y="158" text-anchor="middle" font-size="25" font-weight="700">小腦袋</text>
            <rect x="650" y="109" width="180" height="83" rx="16" fill="#ed8154" stroke="#183e37" stroke-width="2" />
            <text x="740" y="142" text-anchor="middle" font-size="24" font-weight="700">外購無線模組</text>
            <text x="740" y="175" text-anchor="middle" font-size="22">傳送時大口喝電</text>
            <text id="power-loop-label" x="119" y="250" text-anchor="middle" font-size="23" font-weight="700">接通成一圈</text>
            <text x="555" y="220" text-anchor="middle" font-size="22">回線也要接好</text>
            <text x="46" y="304" font-size="25" font-weight="700">每一輪：量一次 → 傳一次 → 睡一下</text>
            <g id="power-cycle">
              <rect x="45" y="320" width="205" height="126" rx="17" fill="#eae9df" />
              <rect x="275" y="320" width="245" height="126" rx="17" fill="#ed8154" />
              <rect x="545" y="320" width="310" height="126" rx="17" fill="#b8cc9a" />
              <text x="147" y="351" text-anchor="middle" font-size="24" font-weight="700">量測</text>
              <text x="397" y="351" text-anchor="middle" font-size="24" font-weight="700">傳送：用電峰值</text>
              <text x="700" y="351" text-anchor="middle" font-size="24" font-weight="700">睡眠</text>
              <text x="147" y="383" text-anchor="middle" font-size="25">15 mA</text>
              <text x="397" y="383" text-anchor="middle" font-size="25">120 mA</text>
              <text x="700" y="383" text-anchor="middle" font-size="25">0.02 mA</text>
              <text x="147" y="427" text-anchor="middle" font-size="24">0.2 秒</text>
              <text x="397" y="427" text-anchor="middle" font-size="24">1 秒</text>
              <text id="power-sleep-label" x="700" y="427" text-anchor="middle" font-size="24">58.8 秒</text>
              <path d="M 254 383 H 267 M 259 375 L 267 383 L 259 391 M 524 383 H 537 M 529 375 L 537 383 L 529 391" fill="none" stroke="#183e37" stroke-width="3" stroke-linecap="round" />
            </g>
            <text x="450" y="473" text-anchor="middle" font-size="22">分段放大，圖寬不代表秒數；電流皆為電池端教學值</text>
          </svg>
          <p id="power-caption" class="diagram-caption">睡眠占 98.0% 的時間；傳送卻占這一輪約 96.6% 的電量。</p>
        </section>
        <section class="lab-controls" aria-label="電池實驗控制台">
          <p class="small"><strong>mA（毫安培）</strong>像喝電快慢；<strong>mAh（毫安培小時）</strong>是電池的電量。</p>
          <div class="control">
            <label for="power-period">多久回報一次？ <output id="power-period-output" for="power-period">60 秒</output></label>
            <input id="power-period" type="range" min="10" max="300" step="10" value="60" />
          </div>
          <div class="control">
            <label for="power-capacity">電池裝多少電？ <output id="power-capacity-output" for="power-capacity">2000 mAh</output></label>
            <input id="power-capacity" type="range" min="500" max="3000" step="500" value="2000" />
          </div>
          <div class="control">
            <label for="power-wiring">接線試試看</label>
            <select id="power-wiring">
              <option value="closed">接通：電流有完整回路</option>
              <option value="open">斷開：缺一段線</option>
            </select>
          </div>
          <div class="reading"><span>平均電流</span><strong id="power-average">2.0696 mA</strong></div>
          <div class="reading"><span>理想續航</span><strong id="power-days">40.27 天</strong></div>
          <p id="power-why" class="why" role="status" aria-live="polite" aria-atomic="true"></p>
          <p class="lesson-note"><strong>平均</strong>用來估續航；<strong>峰值</strong>用來看供電能不能撐住。睡更久會拉低平均，但本例傳送時仍要 120 mA，兩者不能混用。</p>
          <button id="power-reset" class="button secondary" type="button">重設實驗</button>
        </section>
      </div>`,
    mount: function (root) {
      var find = function (id) { return root.querySelector('#power-' + id); };
      var period = find('period');
      var capacity = find('capacity');
      var wiring = find('wiring');

      function update() {
        var seconds = Number(period.value);
        var charge = Number(capacity.value);
        var sleep = seconds - 1.2;
        var cycleCharge = 0.2 * 15 + 1 * 120 + sleep * 0.02;
        var average = cycleCharge / seconds;
        var days = charge / average / 24;
        var connected = wiring.value === 'closed';
        find('period-output').textContent = seconds + ' 秒';
        find('capacity-output').textContent = charge + ' mAh';
        period.setAttribute('aria-valuetext', '每 ' + seconds + ' 秒回報一次');
        capacity.setAttribute('aria-valuetext', charge + ' 毫安培小時');
        find('battery-label').textContent = charge + ' mAh';
        find('sleep-label').textContent = sleep.toFixed(1) + ' 秒';
        find('switch').setAttribute('d', connected ? 'M 250 75 L 295 75' : 'M 250 75 L 287 48');
        find('wires').setAttribute('stroke', connected ? '#183e37' : '#77796f');
        find('flow').setAttribute('visibility', connected ? 'visible' : 'hidden');
        find('cycle').setAttribute('opacity', connected ? '1' : '0.35');
        find('loop-label').textContent = connected ? '接通成一圈' : '斷線，停工了';
        find('average').textContent = connected ? average.toFixed(4) + ' mA' : '未運作';
        find('days').textContent = connected ? days.toFixed(2) + ' 天' : '不估運轉壽命';
        find('caption').textContent = connected
          ? '睡眠占 ' + (sleep / seconds * 100).toFixed(1) + '% 的時間；傳送卻占這一輪約 ' + (120 / cycleCharge * 100).toFixed(1) + '% 的電量。'
          : '斷了一段線，這一輪就不會開始；淡色方塊只是接通後的用電計畫。';
        find('why').textContent = connected
          ? '每 ' + seconds + ' 秒醒來一次，量測與傳送共花 1.2 秒，再睡 ' + sleep.toFixed(1) + ' 秒。回報間隔拉長，每天傳送次數變少，所以平均用電降低；換大電池則增加可用電量。'
          : '電流需要繞回電池的完整路。斷線時裝置沒有工作，不能把它算成「可以用無限久」。';
        find('desc').textContent = connected
          ? '電池經完整回路供電給板上裝置。每 ' + seconds + ' 秒，量測零點二秒、傳送一秒、睡眠 ' + sleep.toFixed(1) + ' 秒。電池端教學平均電流 ' + average.toFixed(4) + ' 毫安培，理想續航 ' + days.toFixed(2) + ' 天。圖分段放大，不按時間比例。'
          : '電池與板上裝置之間的線斷開，沒有完整供電回路，裝置未運作。淡色區保留接通後的量測、傳送與睡眠計畫，不計算運轉壽命。';
      }

      period.addEventListener('input', update);
      capacity.addEventListener('input', update);
      wiring.addEventListener('change', update);
      find('reset').addEventListener('click', function () {
        period.value = '60';
        capacity.value = '2000';
        wiring.value = 'closed';
        update();
      });
      update();
    },
    sources: [
      '硬體-電源與電池.md｜第 1 章：電源樹',
      '硬體-電源與電池.md｜第 8 章：功耗與電量預算',
      '硬體-電源與電池.md｜第 9 章：量測'
    ],
    limits: '本圖把保護與穩壓電路省略，保留供電與回線的概念；並不是可直接照接的接線圖。量測、傳送、睡眠三段互不重疊，分別假設為 0.2 秒 × 15 mA、1 秒 × 120 mA、其餘時間 × 0.02 mA，全部是同一電池端的整台裝置電流，不是各零件的規格。平均電流 =（3 + 120 + 睡眠秒數 × 0.02）÷ 回報秒數；理想續航天數 = 容量 ÷ 平均電流 ÷ 24。假設標示容量全部可用，不含老化、自放電與溫度影響；不可再對已是電池端的電流重複扣轉換效率。本例 120 mA 只是傳送狀態的假設值；實際無線模組可能有更短、更高的尖峰。平均值與此教學峰值都不能證明實際供電安全，需依規格及量測檢查峰值、壓降與回復。'
  };
}());

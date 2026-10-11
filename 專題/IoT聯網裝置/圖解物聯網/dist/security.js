(function () {
  'use strict';
  window.IOT = window.IOT || {};
  window.IOT.security = {
    title: '裝新程式前，誰來看封印？',
    intro: '遠端更新就像把新食譜寄給裝置。晶片先用事先信任的公鑰檢查數位簽章，確認來源和內容，再決定要不要收下。',
    prerequisite: '先認識 MCU 是執行程式的小腦袋，連線模組負責把更新包送到它面前。',
    markup: `
      <div class="lab-grid">
        <div class="lab-panel">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="security-title security-desc">
            <title id="security-title">裝新程式前，先看封印</title>
            <desc id="security-desc">官方的完整更新包，通過以事先信任公鑰進行的簽章驗證，可以安裝。</desc>
            <defs>
              <marker id="security-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#183e37" /></marker>
            </defs>
            <rect x="16" y="18" width="868" height="444" rx="30" fill="#f8f7f2" />
            <rect x="323" y="34" width="286" height="87" rx="20" fill="#b8cc9a" />
            <circle cx="356" cy="76" r="12" fill="none" stroke="#183e37" stroke-width="5" />
            <path d="M368 76 H402 M390 76 V87 M400 76 V85" fill="none" stroke="#183e37" stroke-width="5" />
            <text x="421" y="70" font-size="24" fill="#183e37">可信公鑰</text>
            <text x="421" y="101" font-size="22" fill="#183e37">事先放進裝置</text>
            <path d="M467 124 V157" stroke="#183e37" stroke-width="4" marker-end="url(#security-arrow)" />
            <text x="156" y="165" text-anchor="middle" font-size="25" fill="#183e37">① 收到更新包</text>
            <path d="M70 213 L158 179 L246 213 L246 302 L158 337 L70 302 Z" fill="#eae9df" stroke="#183e37" stroke-width="3" />
            <path d="M70 213 L158 247 L246 213 M158 247 V337 M114 196 L204 230 V277" fill="none" stroke="#183e37" stroke-width="3" />
            <circle id="security-seal" cx="207" cy="291" r="31" fill="#b8cc9a" stroke="#183e37" stroke-width="3" />
            <text id="security-seal-mark" x="207" y="301" text-anchor="middle" font-size="30" font-weight="700" fill="#183e37">✓</text>
            <text id="security-package-source" x="155" y="379" text-anchor="middle" font-size="24" fill="#183e37">官方發布</text>
            <text id="security-package-state" x="155" y="413" text-anchor="middle" font-size="22" fill="#183e37">內容完整</text>
            <path d="M260 257 H327" stroke="#183e37" stroke-width="4" marker-end="url(#security-arrow)" />
            <rect id="security-gate" x="343" y="172" width="247" height="177" rx="24" fill="#b8cc9a" stroke="#183e37" stroke-width="3" />
            <path d="M444 201 H489 V226 C489 250 466 266 466 266 C466 266 444 250 444 226 Z" fill="#f8f7f2" stroke="#183e37" stroke-width="3" />
            <text id="security-gate-mark" x="466" y="241" text-anchor="middle" font-size="28" fill="#183e37">✓</text>
            <text x="466" y="298" text-anchor="middle" font-size="26" font-weight="700" fill="#183e37">② MCU 驗簽</text>
            <text id="security-gate-detail" x="466" y="329" text-anchor="middle" font-size="22" fill="#183e37">來源對・內容沒改</text>
            <path id="security-route" d="M600 257 H674" stroke="#183e37" stroke-width="4" marker-end="url(#security-arrow)" />
            <path id="security-stop" d="M623 239 L650 266 M650 239 L623 266" stroke="#183e37" stroke-width="6" visibility="hidden" />
            <rect x="700" y="192" width="134" height="131" rx="13" fill="#183e37" />
            <path d="M685 207 H700 M685 233 H700 M685 259 H700 M685 285 H700 M834 207 H849 M834 233 H849 M834 259 H849 M834 285 H849 M718 177 V192 M745 177 V192 M772 177 V192 M799 177 V192 M718 323 V338 M745 323 V338 M772 323 V338 M799 323 V338" stroke="#183e37" stroke-width="7" />
            <text x="767" y="248" text-anchor="middle" font-size="25" fill="#f8f7f2">新程式</text>
            <text id="security-install-state" x="767" y="286" text-anchor="middle" font-size="25" font-weight="700" fill="#b8cc9a">可安裝</text>
            <text x="767" y="379" text-anchor="middle" font-size="24" fill="#183e37">③ 決定收不收</text>
            <text x="466" y="410" text-anchor="middle" font-size="22" fill="#183e37">模組運送 → 晶片把關</text>
          </svg>
          <p class="diagram-caption">封印是類比：數位簽章不是一張貼紙，而是能由可信公鑰檢查的數學證據。</p>
          <div class="mini-legend"><span class="tag">CRC：找意外損壞</span><span class="tag">簽章：驗來源與內容</span><span class="tag">TLS：保護傳輸通道</span></div>
        </div>
        <div class="lab-controls">
          <div class="control"><label for="security-source">更新包從哪裡來？</label><select id="security-source"><option value="official">官方：金鑰已受信任</option><option value="unknown">陌生人：金鑰未受信任</option></select></div>
          <div class="control"><label for="security-integrity">寄送後，有沒有被改過？</label><select id="security-integrity"><option value="intact">完整，沒有修改</option><option value="changed">內容遭到修改</option></select></div>
          <div class="control"><label for="security-verify"><input type="checkbox" id="security-verify" checked /> 安裝前檢查數位簽章</label></div>
          <p class="reading" id="security-result">✓ 驗證通過，可安裝</p>
          <p class="why" id="security-why" role="status" aria-live="polite"></p>
          <button class="button secondary" id="security-reset" type="button">重設實驗</button>
          <p class="small">可信公鑰要事先妥善放進裝置。從陌生更新包一起拿來的公鑰，不能自己證明「我就是官方」。</p>
        </div>
      </div>
      <aside class="lesson-note"><strong>通過這一關，還不是整台都安全。</strong> HTTPS／TLS 保護下載通道；Secure Boot 在開機時檢查要執行的程式。安全更新還要考慮版本、防降版、斷電和失敗回復。CRC 只能幫忙找意外損壞，無法代替來源驗證。</aside>`,
    mount(root) {
      const find = (id) => root.querySelector('#security-' + id);
      const source = find('source');
      const integrity = find('integrity');
      const verify = find('verify');
      function render(reset) {
        const trusted = source.value === 'official';
        const intact = integrity.value === 'intact';
        const checking = verify.checked;
        const valid = trusted && intact;
        const admitted = !checking || valid;
        find('package-source').textContent = trusted ? '官方發布' : '陌生來源';
        find('package-state').textContent = intact ? '內容完整' : '內容遭修改';
        find('seal').setAttribute('fill', valid ? '#b8cc9a' : '#ed8154');
        find('seal-mark').textContent = valid ? '✓' : '?';
        find('gate').setAttribute('fill', checking && valid ? '#b8cc9a' : '#ed8154');
        find('gate-mark').textContent = !checking ? '?' : valid ? '✓' : '×';
        find('gate-detail').textContent = !checking ? '略過檢查・沒有保證' : valid ? '來源對・內容沒改' : '驗證失敗・擋下來';
        find('route').setAttribute('stroke-dasharray', admitted ? 'none' : '7 7');
        find('stop').setAttribute('visibility', admitted ? 'hidden' : 'visible');
        find('install-state').textContent = !checking ? '可能放行' : valid ? '可安裝' : '拒絕安裝';
        find('install-state').setAttribute('fill', checking && valid ? '#b8cc9a' : '#ed8154');
        let reason;
        if (!checking) {
          find('result').textContent = '? 可能放行，無信任保證';
          reason = '因為關掉驗簽，這個閘門可能讓更新包通過；裝置沒有建立來源與完整性的信任，不能把放行當成安全。';
        } else if (valid) {
          find('result').textContent = '✓ 驗證通過，可安裝';
          reason = '因為簽章對得上裝置事先信任的官方公鑰，而且內容沒有被改過，所以這個更新包通過安裝前檢查。';
        } else if (!trusted && !intact) {
          find('result').textContent = '× 驗證失敗，拒絕安裝';
          reason = '因為來源沒有受信任的金鑰，內容又遭到修改，所以裝置拒絕安裝；外觀看起來像更新包也不能通關。';
        } else if (!trusted) {
          find('result').textContent = '× 來源不受信任，拒絕安裝';
          reason = '即使內容完整，陌生人的簽章也對不上裝置事先信任的官方公鑰，所以裝置拒絕安裝。完整不代表可信。';
        } else {
          find('result').textContent = '× 內容遭修改，拒絕安裝';
          reason = '即使原本由官方發布，只要簽章完成後內容被改動，原來的簽章就不再符合這份內容，所以裝置拒絕安裝。';
        }
        find('why').textContent = (reset ? '已重設。' : '') + reason;
        find('desc').textContent = find('package-source').textContent + '的更新包，' + find('package-state').textContent + '。' + reason;
      }
      [source, integrity, verify].forEach((control) => control.addEventListener('change', () => render(false)));
      find('reset').addEventListener('click', () => {
        source.value = 'official';
        integrity.value = 'intact';
        verify.checked = true;
        render(true);
      });
      render(false);
    },
    sources: ['韌體：架構與電源管理，第 7 章「OTA 與版本」；第 5 章「可靠度」。'],
    limits: '這是安裝前驗簽的概念模型，沒有真正計算密碼學簽章。假設官方私鑰未洩漏，且裝置已安全保存受信任的公鑰；通過不代表整台裝置安全。'
  };
}());

(function () {
  'use strict';
  window.IOT = window.IOT || {};
  window.IOT.reliability = {
    title: '斷線時，小信箱能撐多久？',
    intro: '網路斷了，MCU 可以先把讀值放進信箱，等連線模組恢復再送出。可是信箱有容量，重試也要留一點喘息時間。',
    prerequisite: '先知道感測器產生讀值，MCU 處理資料，再由連線模組送到服務。',
    markup: `
      <div class="lab-grid">
        <div class="lab-panel">
          <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="reliability-title reliability-desc">
            <title id="reliability-title">斷線先排隊，恢復連線再送出</title>
            <desc id="reliability-desc">裝置連線中，容量三筆的信箱是空的，服務尚未收到讀值。</desc>
            <defs><marker id="reliability-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#183e37" /></marker></defs>
            <rect x="16" y="18" width="868" height="444" rx="30" fill="#f8f7f2" />
            <text x="141" y="65" text-anchor="middle" font-size="25" font-weight="700" fill="#183e37">① 裝置</text>
            <rect x="54" y="100" width="171" height="158" rx="21" fill="#b8cc9a" stroke="#183e37" stroke-width="3" />
            <rect x="75" y="124" width="77" height="72" rx="9" fill="#183e37" />
            <text x="113" y="168" text-anchor="middle" font-size="23" fill="#f8f7f2">MCU</text>
            <path d="M165 174 V139 M165 149 Q178 136 191 149 M160 135 Q178 119 198 135" fill="none" stroke="#183e37" stroke-width="4" stroke-linecap="round" />
            <text x="140" y="234" text-anchor="middle" font-size="22" fill="#183e37">感測 → 記錄</text>
            <text id="reliability-next" x="140" y="295" text-anchor="middle" font-size="23" fill="#183e37">下筆：20 °C</text>
            <path d="M239 179 H294" stroke="#183e37" stroke-width="4" marker-end="url(#reliability-arrow)" />
            <text x="467" y="65" text-anchor="middle" font-size="25" font-weight="700" fill="#183e37">② 只有 3 格的信箱</text>
            <rect x="312" y="112" width="308" height="136" rx="19" fill="#eae9df" stroke="#183e37" stroke-width="3" />
            <g id="reliability-slot-0"><rect x="326" y="132" width="88" height="91" rx="12" fill="#f8f7f2" stroke="#183e37" stroke-width="2" /><text id="reliability-value-0" x="370" y="173" text-anchor="middle" font-size="24" font-weight="700" fill="#183e37">空</text><text id="reliability-order-0" x="370" y="203" text-anchor="middle" font-size="22" fill="#183e37">第 1 格</text></g>
            <g id="reliability-slot-1"><rect x="422" y="132" width="88" height="91" rx="12" fill="#f8f7f2" stroke="#183e37" stroke-width="2" /><text id="reliability-value-1" x="466" y="173" text-anchor="middle" font-size="24" font-weight="700" fill="#183e37">空</text><text id="reliability-order-1" x="466" y="203" text-anchor="middle" font-size="22" fill="#183e37">第 2 格</text></g>
            <g id="reliability-slot-2"><rect x="518" y="132" width="88" height="91" rx="12" fill="#f8f7f2" stroke="#183e37" stroke-width="2" /><text id="reliability-value-2" x="562" y="173" text-anchor="middle" font-size="24" font-weight="700" fill="#183e37">空</text><text id="reliability-order-2" x="562" y="203" text-anchor="middle" font-size="22" fill="#183e37">第 3 格</text></g>
            <text id="reliability-queue-label" x="466" y="287" text-anchor="middle" font-size="23" fill="#183e37">0 / 3 筆，左邊最早</text>
            <path id="reliability-link" d="M632 179 H695" stroke="#183e37" stroke-width="4" marker-end="url(#reliability-arrow)" />
            <path id="reliability-disconnected" d="M651 165 L678 192 M678 165 L651 192" stroke="#183e37" stroke-width="6" visibility="hidden" />
            <text x="788" y="65" text-anchor="middle" font-size="25" font-weight="700" fill="#183e37">③ 服務</text>
            <rect x="717" y="110" width="142" height="138" rx="20" fill="#183e37" />
            <path d="M741 135 H835 M741 157 H835" stroke="#b8cc9a" stroke-width="6" stroke-linecap="round" />
            <text x="788" y="196" text-anchor="middle" font-size="22" fill="#f8f7f2">已收到</text>
            <text id="reliability-sent" x="788" y="230" text-anchor="middle" font-size="27" font-weight="700" fill="#b8cc9a">0 筆</text>
            <text id="reliability-link-label" x="752" y="288" text-anchor="middle" font-size="23" fill="#183e37">模組：連線中</text>
            <path d="M52 321 H850" stroke="#eae9df" stroke-width="3" />
            <text x="54" y="357" font-size="23" font-weight="700" fill="#183e37">重試失敗後，下一次多等一下</text>
            <g id="reliability-step-1"><rect x="53" y="379" width="115" height="49" rx="13" fill="#eae9df" /><text x="110" y="412" text-anchor="middle" font-size="25" fill="#183e37">2 秒</text></g>
            <g id="reliability-step-2"><rect x="190" y="379" width="115" height="49" rx="13" fill="#eae9df" /><text x="247" y="412" text-anchor="middle" font-size="25" fill="#183e37">4 秒</text></g>
            <g id="reliability-step-3"><rect x="327" y="379" width="115" height="49" rx="13" fill="#eae9df" /><text x="384" y="412" text-anchor="middle" font-size="25" fill="#183e37">8 秒</text></g>
            <g id="reliability-step-4"><rect x="464" y="379" width="115" height="49" rx="13" fill="#eae9df" /><text x="521" y="412" text-anchor="middle" font-size="25" fill="#183e37">16 秒</text></g>
            <g id="reliability-step-5"><rect x="601" y="379" width="115" height="49" rx="13" fill="#eae9df" /><text x="658" y="412" text-anchor="middle" font-size="25" fill="#183e37">32 秒</text></g>
            <g id="reliability-step-6"><rect x="738" y="379" width="115" height="49" rx="13" fill="#eae9df" /><text x="795" y="412" text-anchor="middle" font-size="25" fill="#183e37">60 秒</text></g>
          </svg>
          <p class="diagram-caption">信箱滿了，這個實驗會丟掉最舊一筆。恢復連線時，把留下的資料依序全部送出。</p>
          <div class="mini-legend"><span class="tag">緩存：暫時留下</span><span class="tag">退避：別一直猛試</span><span class="tag">丟資料：要明說</span></div>
        </div>
        <div class="lab-controls">
          <div class="control"><label for="reliability-online"><input type="checkbox" id="reliability-online" checked /> 網路保持連線</label></div>
          <button class="button" id="reliability-add" type="button">產生一筆讀值</button>
          <button class="button secondary" id="reliability-reconnect" type="button">恢復連線，送出全部</button>
          <button class="button secondary" id="reliability-retry" type="button" disabled>試著重連一次（仍失敗）</button>
          <p class="reading" id="reliability-counts">緩存 0 / 3 · 送出 0 · 丟棄 0</p>
          <p class="small" id="reliability-backoff">尚未重試；沒有等待時間。</p>
          <p class="why" id="reliability-why" role="status" aria-live="polite"></p>
          <button class="button secondary" id="reliability-reset" type="button">重設實驗</button>
          <p class="small">讀值依序為 20、25、30、35、40 °C，再重複。時間是教學數字，按鈕只走一步，不會真的等待。</p>
        </div>
      </div>
      <aside class="lesson-note"><strong>關掉頁面，信箱也會消失。</strong> 這裡模擬的是 RAM 緩存，不會在重載後保留。實機若要斷電不丟資料，需要妥善寫入非揮發性儲存，並考慮斷電安全與寫入壽命。大量裝置重連時通常還要加隨機錯開時間（jitter）；本實驗固定時間，方便看懂規律。</aside>`,
    mount(root) {
      const find = (id) => root.querySelector('#reliability-' + id);
      const sequence = [20, 25, 30, 35, 40];
      let state;
      function waitSeconds() { return state.attempts ? Math.min(2 * Math.pow(2, Math.min(state.attempts - 1, 5)), 60) : 0; }
      function render(reason) {
        find('online').checked = state.online;
        find('retry').disabled = state.online;
        find('next').textContent = '下筆：' + sequence[state.index % sequence.length] + ' °C';
        for (let i = 0; i < 3; i += 1) {
          const occupied = i < state.queue.length;
          find('slot-' + i).querySelector('rect').setAttribute('fill', occupied ? '#b8cc9a' : '#f8f7f2');
          find('value-' + i).textContent = occupied ? state.queue[i] + ' °C' : '空';
          find('order-' + i).textContent = occupied && i === 0 ? '最早' : '第 ' + (i + 1) + ' 格';
        }
        find('queue-label').textContent = state.queue.length + ' / 3 筆，左邊最早';
        find('sent').textContent = state.sent + ' 筆';
        find('link').setAttribute('stroke-dasharray', state.online ? 'none' : '7 7');
        find('disconnected').setAttribute('visibility', state.online ? 'hidden' : 'visible');
        find('link-label').textContent = state.online ? '模組：連線中' : '模組：已斷線';
        find('counts').textContent = '緩存 ' + state.queue.length + ' / 3 · 送出 ' + state.sent + ' · 丟棄 ' + state.dropped;
        find('backoff').textContent = state.attempts ? '已失敗 ' + state.attempts + ' 次；下次名義等待 ' + waitSeconds() + ' 秒。' : '尚未重試；沒有等待時間。';
        for (let n = 1; n <= 6; n += 1) {
          const rect = find('step-' + n).querySelector('rect');
          const active = n === Math.min(state.attempts, 6);
          rect.setAttribute('fill', active ? '#ed8154' : '#eae9df');
          rect.setAttribute('stroke', active ? '#183e37' : 'none');
          rect.setAttribute('stroke-width', active ? '3' : '0');
        }
        find('why').textContent = reason;
        find('desc').textContent = (state.online ? '連線中。' : '已斷線。') + '信箱 ' + state.queue.length + ' 筆，服務收到 ' + state.sent + ' 筆，丟棄 ' + state.dropped + ' 筆。' + find('backoff').textContent;
      }
      function connect() {
        const pending = state.queue.slice();
        state.online = true;
        state.sent += pending.length;
        state.queue = [];
        state.attempts = 0;
        render(pending.length ? '連線恢復，所以把信箱裡的 ' + pending.join('、') + ' °C 共 ' + pending.length + ' 筆依序全部送出。信箱清空，重試次數歸零；先前丟掉的資料無法補回。' : '現在連線正常，信箱沒有待送資料。下一筆讀值會直接送到服務，重試次數歸零。');
      }
      find('online').addEventListener('change', () => {
        if (find('online').checked) connect();
        else {
          state.online = false;
          render('連線中斷，所以接下來的讀值先留在信箱。可以產生四筆讀值，看看只有三格時會發生什麼事。');
        }
      });
      find('add').addEventListener('click', () => {
        const value = sequence[state.index % sequence.length];
        state.index += 1;
        if (state.online) {
          state.sent += 1;
          render('產生 ' + value + ' °C。因為連線正常，這筆資料直接送到服務，不需要留在信箱。');
        } else {
          let removed;
          if (state.queue.length === 3) {
            removed = state.queue.shift();
            state.dropped += 1;
          }
          state.queue.push(value);
          render(removed !== undefined ? '信箱已滿！為了留下新讀值 ' + value + ' °C，丟掉最舊的 ' + removed + ' °C。現在只留下 ' + state.queue.join('、') + ' °C；丟掉的那筆不會再送出。' : '產生 ' + value + ' °C。因為網路斷線，先存進信箱，現在用了 ' + state.queue.length + ' 格，共有 3 格。');
        }
      });
      find('reconnect').addEventListener('click', connect);
      find('retry').addEventListener('click', () => {
        if (state.online) return;
        state.attempts += 1;
        render('第 ' + state.attempts + ' 次重連仍失敗。為了避免一直占用電力和網路，下次名義等待 ' + waitSeconds() + ' 秒再試' + (state.attempts >= 6 ? '；這個例子的上限是 60 秒。' : '，每次加倍，最多 60 秒。') + '信箱中的資料仍保留。');
      });
      function reset(isClick) {
        state = { online: true, queue: [], sent: 0, dropped: 0, index: 0, attempts: 0 };
        render((isClick ? '已重設。' : '') + '連線正常，信箱是空的。先取消「網路保持連線」，再產生讀值，就能看見信箱開始排隊。');
      }
      find('reset').addEventListener('click', () => reset(true));
      reset(false);
    },
    sources: ['韌體：連線模組整合，第 6 章「韌性設計」。', '韌體：架構與電源管理，第 5 章「可靠度」與第 6 章「設定與資料持久化」。'],
    limits: '模擬 RAM queue，最多 3 筆，滿時丟最舊；重新載入頁面不持久化。假設連線恢復後服務全部接收成功，不模擬傳送中的斷線或重複。第 n 次重試失敗後的名義等待為 min(2 × 2^(n−1), 60) 秒，教學不加亂數；實機應加 jitter 並保留等待上限。'
  };
}());

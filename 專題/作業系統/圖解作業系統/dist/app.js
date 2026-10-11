/* 圖解作業系統：離線、確定性教學元件。所有完整例解留在 HTML。 */
(() => {
  'use strict';
  const lessons = [
    ['00-role', '作業系統在忙什麼', '從程式到行程'], ['01-process', '行程的三種狀態', '從程式到行程'],
    ['02-fork', '建立、換程式與等待', '從程式到行程'], ['03-scheduling', '先到先做，還是短的先做', '把 CPU 分給大家'],
    ['04-round-robin', '輪流使用 CPU', '把 CPU 分給大家'], ['05-feedback', '回饋佇列', '把 CPU 分給大家'],
    ['06-threads', '執行緒與共享資料', '一起做事不打架'], ['07-mutex', '互斥鎖與競態', '一起做事不打架'],
    ['08-condition', '條件變數與號誌', '一起做事不打架'], ['09-deadlock', '死結與等待關係', '一起做事不打架'],
    ['10-address-space', '每個行程的位址空間', '從位址找到資料'], ['11-paging', '把記憶體分成頁', '從位址找到資料'],
    ['12-translation', '追蹤一次位址轉換', '從位址找到資料'], ['13-page-fault', '遇到缺頁怎麼辦', '從位址找到資料'],
    ['14-replacement', '頁框滿了，換誰出去', '從位址找到資料'], ['15-file-descriptors', '檔案描述元與讀取位置', '資料如何留下來'],
    ['16-file-system', '路徑、索引節點與資料塊', '資料如何留下來'], ['17-durability', '斷電後還留下什麼', '資料如何留下來'],
    ['18-io', '裝置、驅動與中斷', '跨過軟硬體邊界'], ['19-system-call', '一次 read 的旅程', '跨過軟硬體邊界']
  ];
  const integer = (value, min, max, label, hex = false) => {
    const s = String(value).trim();
    const valid = hex ? /^(?:[0-9]+|0x[0-9a-f]+)$/i.test(s) : /^[0-9]+$/.test(s);
    const n = Number(s);
    if (!valid || !Number.isSafeInteger(n) || n < min || n > max) {
      throw new Error(`${label}請填 ${min}～${max} 的整數${hex ? '（可用 0x 開頭的十六進位）' : ''}。`);
    }
    return n;
  };
  function roundRobin(input, quantum) {
    const q = integer(quantum, 1, 10, '時間片');
    if (!Array.isArray(input) || input.length !== 3) throw new Error('本教具固定使用 A、B、C 三個行程。');
    const jobs = input.map((p, i) => ({id: 'ABC'[i], arrival: integer(p.arrival, 0, 20, `${'ABC'[i]} 到達時間`), burst: integer(p.burst, 1, 20, `${'ABC'[i]} CPU 時間`), first: null, finish: null}));
    const pending = [...jobs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
    const remaining = Object.fromEntries(jobs.map(p => [p.id, p.burst]));
    let time = 0;
    let cursor = 0;
    const queue = [];
    const admit = () => { while (cursor < pending.length && pending[cursor].arrival <= time) queue.push(pending[cursor++]); };
    admit();
    const steps = [{time: 0, start: 0, end: 0, id: null, before: [], after: queue.map(p => p.id), remaining: {...remaining}, why: queue.length ? '時間 0：已到達的行程依 A、B、C 順序進入就緒佇列；CPU 還沒取出第一個行程。' : '時間 0：還沒有人到達，CPU 先等候。'}];
    while (cursor < pending.length || queue.length) {
      if (!queue.length) {
        const start = time;
        time = pending[cursor].arrival;
        admit();
        steps.push({time, start, end: time, id: 'idle', before: [], after: queue.map(p => p.id), remaining: {...remaining}, why: `${start}～${time} ms 沒有就緒行程，CPU 閒置；到 ${time} ms 才有下一批工作。`});
        continue;
      }
      const before = queue.map(p => p.id);
      const p = queue.shift();
      if (p.first === null) p.first = time;
      const start = time;
      time += Math.min(q, remaining[p.id]);
      remaining[p.id] -= time - start;
      const oldCursor = cursor;
      admit();
      const arrivals = pending.slice(oldCursor, cursor).map(p => p.id);
      if (remaining[p.id]) queue.push(p); else p.finish = time;
      steps.push({time, start, end: time, id: p.id, before, after: queue.map(p => p.id), remaining: {...remaining}, why: `${p.id} 執行 ${start}～${time} ms，剩 ${remaining[p.id]} ms。${arrivals.length ? `片內／片末到達的 ${arrivals.join('、')} 先放到原佇列尾端。` : '這一片沒有新到達。'}${remaining[p.id] ? `${p.id} 再排回隊尾。` : `${p.id} 已完成，不再排回。`}`});
    }
    return {quantum: q, total: time, steps, jobs: jobs.map(p => ({...p, turnaround: p.finish - p.arrival, response: p.first - p.arrival, waiting: p.finish - p.arrival - p.burst}))};
  }
  function translate(input) {
    const va = integer(input.va, 0, 65535, '虛擬位址', true);
    const pfn = integer(input.pfn, 0, 63, '頁框號');
    if (!['hit', 'miss'].includes(input.tlb) || !['resident', 'nonresident', 'unmapped'].includes(input.state) || !['allow', 'deny'].includes(input.permission)) throw new Error('請選擇教具提供的頁面狀態與權限。');
    const vpn = Math.floor(va / 1024), offset = va % 1024;
    const hit = input.tlb === 'hit' && input.state === 'resident';
    let fault = null, why;
    if (input.state === 'unmapped') { fault = 'unmapped'; why = '查不到合法映射：這個虛擬頁不屬於可用範圍。不能據此讀取實體位址；核心通常回報錯誤，沒有必然的磁碟讀取。'; }
    else if (input.permission === 'deny') { fault = 'protection'; why = `${hit ? '有效快取條目' : '頁表資訊'}顯示這次存取沒有權限，產生保護錯誤；取得頁框號也不能越過權限。錯誤不保證會讀磁碟。`; }
    else if (input.state === 'nonresident') { fault = 'nonresident'; why = '頁表表示這頁目前不在 RAM，轉交核心處理；可能從後備儲存載入，也可能按需配置零頁。缺頁不必然讀磁碟，處理完成後才可能重試。'; }
    else why = `${hit ? '轉址快取命中：從有效條目取得頁框號與權限。' : '轉址快取未命中：這個單層模型查頁表，發現頁已在 RAM 且權限允許。'}以頁框起點加上原來的頁內位移，得到可存取的實體位址。`;
    return {va, pfn, vpn, offset, hit, fault, pa: fault ? null : pfn * 1024 + offset, why, state: input.state, permission: input.permission, requestedTlb: input.tlb};
  }
  const api = Object.freeze({roundRobin, translate});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  window.OSLab = api;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const hex = n => `0x${n.toString(16).toUpperCase().padStart(4, '0')}`;
  const queueText = q => q.length ? q.join(' → ') : '空';
  function setupSidebar() {
    const nav = document.querySelector('.sidebar nav');
    if (!nav) return;
    const current = document.body.dataset.page || location.pathname.split('/').pop().replace('.html', '');
    let group = '';
    nav.innerHTML = `<a href="index.html"${current === 'index' ? ' aria-current="page"' : ''}>課程地圖</a><a href="glossary.html"${current === 'glossary' ? ' aria-current="page"' : ''}>名詞字典</a>` + lessons.map(([slug, title, unit]) => {
      const heading = group !== unit ? `<p class="nav-group">${unit}</p>` : '';
      group = unit;
      return `${heading}<a href="${slug}.html"${current === slug ? ' aria-current="page"' : ''}><span class="nav-number">${slug.slice(0, 2)}</span>${title}</a>`;
    }).join('');
    nav.setAttribute('aria-label', '全部課程');
  }
  function enhanceScrollRegions(root = document) {
    root.querySelectorAll('.diagram,.table-scroll').forEach(box => {
      box.tabIndex = 0;
      box.setAttribute('role', 'region');
      if (!box.hasAttribute('aria-label')) box.setAttribute('aria-label', box.classList.contains('diagram') ? '圖解；若超出畫面，可用左右方向鍵捲動' : '資料表；若超出畫面，可用左右方向鍵捲動');
    });
  }
  function setupTrace(root) {
    const steps = [...root.querySelectorAll('[data-step]')];
    if (!steps.length) return;
    let index = 0;
    root.classList.add('is-enhanced');
    let status = root.querySelector('[data-trace-status]');
    if (!status) { status = document.createElement('p'); status.className = 'status'; root.append(status); }
    status.setAttribute('aria-live', 'polite');
    const render = () => {
      const token = steps[index].dataset.step;
      steps.forEach((step, i) => { step.classList.toggle('is-current', i === index); if (i === index) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current'); });
      root.querySelectorAll('[data-state]').forEach(state => state.classList.toggle('is-current', state.dataset.state.split(/\s+/).includes(token)));
      status.textContent = `步驟 ${index + 1}／${steps.length}：${steps[index].textContent.trim()}`;
      root.querySelectorAll('[data-action="prev"]').forEach(b => { b.disabled = index === 0; });
      root.querySelectorAll('[data-action="next"]').forEach(b => { b.disabled = index === steps.length - 1; });
    };
    root.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.action;
      index = action === 'reset' ? 0 : Math.max(0, Math.min(steps.length - 1, index + (action === 'next' ? 1 : -1)));
      render();
    }));
    render();
  }
  function mountRR(root) {
    const mount = root.querySelector('[data-lab-mount]');
    if (!mount) return;
    mount.innerHTML = `<form class="lab-form" novalidate><fieldset><legend>固定三個行程，自由調整到達與工作長度</legend><div class="job-inputs">${[['A',0,5],['B',1,3],['C',2,1]].map(([id,a,b]) => `<div class="job-input"><h3>行程 ${id}</h3><label>到達時間（ms）<input id="rr-${id}-arrival" name="${id}-arrival" type="number" min="0" max="20" step="1" value="${a}" required></label><label>所需 CPU 時間（ms）<input id="rr-${id}-burst" name="${id}-burst" type="number" min="1" max="20" step="1" value="${b}" required></label></div>`).join('')}</div><label class="quantum-label">每次最多執行的時間片（ms）<input id="rr-quantum" name="quantum" type="number" min="1" max="10" step="1" value="2" required></label></fieldset><p class="model-note">單 CPU、沒有阻塞 I/O、切換成本為 0；同時到達依 A → B → C。新到達先入隊，再放回本片未完成的行程。</p><div class="controls"><button type="button" data-rr-action="prev">上一步</button><button type="button" data-rr-action="next">下一步</button><button type="reset">重設範例</button></div></form><p class="status" data-rr-status aria-live="polite"></p><div data-rr-output></div>`;
    const form = mount.querySelector('form'), status = mount.querySelector('[data-rr-status]'), output = mount.querySelector('[data-rr-output]');
    let model, index = 0;
    const render = () => {
      const step = model.steps[index];
      status.textContent = `步驟 ${index}／${model.steps.length - 1} · t = ${step.time} ms。${step.why}`;
      mount.querySelector('[data-rr-action="prev"]').disabled = index === 0;
      mount.querySelector('[data-rr-action="next"]').disabled = index === model.steps.length - 1;
      const scale = 820 / Math.max(1, model.total);
      const segments = model.steps.slice(1).map((s, i) => {
        const width = (s.end - s.start) * scale;
        const label = s.id === 'idle' ? '閒置' : s.id;
        return `<g class="gantt-slot ${s.id === 'idle' ? 'idle' : 'job-' + s.id}${index === i + 1 ? ' is-current' : ''}"><title>${label}：${s.start}～${s.end} ms</title><rect x="${40 + s.start * scale}" y="30" width="${width}" height="42" rx="3"/>${width >= 25 ? `<text x="${40 + (s.start + s.end) / 2 * scale}" y="57" text-anchor="middle">${label}</text>` : ''}</g>`;
      }).join('');
      output.hidden = false;
      output.innerHTML = `<div class="rr-summary"><p><span>目前片末時間</span><strong>${step.time} ms</strong></p><p><span>就緒佇列（隊首先）</span><strong>${queueText(step.after)}</strong></p><p><span>尚需 CPU 時間</span><strong>A ${step.remaining.A} · B ${step.remaining.B} · C ${step.remaining.C} ms</strong></p></div><div class="diagram"><svg viewBox="0 0 900 118" role="img" aria-labelledby="rr-live-title rr-live-desc"><title id="rr-live-title">完整輪轉排程與目前時間位置</title><desc id="rr-live-desc">目前時間 ${step.time} 毫秒。各執行區間、取出前佇列及片末佇列均列於下方逐片表格。</desc>${segments}<line x1="${40 + step.time * scale}" y1="16" x2="${40 + step.time * scale}" y2="84" class="time-marker"/><text x="40" y="108">0 ms</text><text x="860" y="108" text-anchor="end">${model.total} ms</text><text x="450" y="16" text-anchor="middle">完整排程；深色直線標示目前走到哪裡</text></svg></div><h3>每一片怎麼排</h3><div class="table-scroll"><table><thead><tr><th scope="col">區間（ms）</th><th scope="col">CPU</th><th scope="col">取出前佇列</th><th scope="col">片末佇列</th></tr></thead><tbody>${model.steps.slice(1).map((s,i) => `<tr${index === i + 1 ? ' class="is-current" aria-current="step"' : ''}><td>${s.start}～${s.end}</td><td>${s.id === 'idle' ? '閒置' : s.id}</td><td>${queueText(s.before)}</td><td>${queueText(s.after)}</td></tr>`).join('')}</tbody></table></div><h3>把完整排程走完後的三種時間</h3><p>到達 A、所需 CPU 時間 B、第一次取得 CPU 的時間 S、完成時間 C。周轉 T = C − A；回應 R = S − A；本模型等待 W = T − B。A、B 在這裡是公式符號，不是行程名稱。</p><div class="table-scroll"><table><thead><tr><th scope="col">行程</th><th scope="col">完成 C（ms）</th><th scope="col">周轉 T（ms）</th><th scope="col">回應 R（ms）</th><th scope="col">等待 W（ms）</th></tr></thead><tbody>${model.jobs.map(p => `<tr><th scope="row">${p.id}</th><td>${p.finish}</td><td>${p.finish} − ${p.arrival} = ${p.turnaround}</td><td>${p.first} − ${p.arrival} = ${p.response}</td><td>${p.turnaround} − ${p.burst} = ${p.waiting}</td></tr>`).join('')}</tbody></table></div>`;
    };
    const update = () => {
      try {
        model = roundRobin('ABC'.split('').map(id => ({arrival: form.elements[`${id}-arrival`].value, burst: form.elements[`${id}-burst`].value})), form.elements.quantum.value);
        index = 0; render(); enhanceScrollRegions(output);
      } catch (error) {
        status.textContent = error.message; output.hidden = true;
        mount.querySelectorAll('[data-rr-action]').forEach(b => { b.disabled = true; });
      }
    };
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('input', update);
    form.addEventListener('reset', () => { setTimeout(update, 0); });
    mount.querySelectorAll('[data-rr-action]').forEach(button => button.addEventListener('click', () => { index += button.dataset.rrAction === 'next' ? 1 : -1; render(); enhanceScrollRegions(output); }));
    update();
  }
  function mountVA(root) {
    const mount = root.querySelector('[data-lab-mount]');
    if (!mount) return;
    mount.innerHTML = `<form class="lab-form" novalidate><fieldset><legend>一個位址，沿著規則找資料</legend><div class="input-grid"><label>虛擬位址（byte 編號）<input id="va-address" name="va" type="text" value="0x1234" spellcheck="false" autocomplete="off" aria-describedby="va-range"></label><label>映射到的頁框號（無單位）<input id="va-pfn" name="pfn" type="number" min="0" max="63" step="1" value="9" required></label><label>轉址快取（TLB）<select id="va-tlb" name="tlb"><option value="miss">未命中：查頁表</option><option value="hit">命中：已有有效條目</option></select></label><label>頁表中的頁面狀態<select id="va-state" name="state"><option value="resident">present = 1：已在 RAM</option><option value="nonresident">present = 0：合法但未駐留</option><option value="unmapped">未映射：沒有合法頁</option></select></label><label>這次存取的權限<select id="va-permission" name="permission"><option value="allow">允許</option><option value="deny">不允許</option></select></label></div><p id="va-range" class="model-note">固定 16 位元虛擬位址、1 KiB = 1024 B 頁面；可填 0～65535 的十進位或 0x 開頭的十六進位。此教具只看這個 VPN 的映射，PFN 範圍 0～63。</p></fieldset><div class="controls"><button type="reset">重設範例</button></div></form><p class="status" data-va-status aria-live="polite"></p><div data-va-output></div>`;
    const form = mount.querySelector('form'), status = mount.querySelector('[data-va-status]'), output = mount.querySelector('[data-va-output]');
    const render = () => {
      try {
        const r = translate(Object.fromEntries(['va','pfn','tlb','state','permission'].map(key => [key, form.elements[key].value])));
        status.textContent = `${r.requestedTlb === 'hit' && !r.hit ? '此頁沒有可用的有效 TLB 條目，改走未命中路徑。' : ''}${r.why}`;
        const finalTitle = r.fault ? '停止：交由核心處理' : '可存取的實體位址';
        const finalValue = r.fault ? ({unmapped:'未映射',protection:'保護錯誤',nonresident:'缺頁：頁未駐留'}[r.fault]) : `${r.pa} B = ${hex(r.pa)} B`;
        output.hidden = false;
        output.innerHTML = `<div class="bit-split"><div><span>虛擬頁號 VPN · 6 bits</span><strong>${r.vpn.toString(2).padStart(6,'0')}</strong><small>${r.vpn}（無單位）</small></div><div><span>頁內位移 · 10 bits</span><strong>${r.offset.toString(2).padStart(10,'0')}</strong><small>${r.offset} B</small></div></div><div class="diagram"><svg viewBox="0 0 860 258" role="img" aria-labelledby="va-live-title va-live-desc"><title id="va-live-title">位址轉換的路徑：${finalValue}</title><desc id="va-live-desc">位址拆解後查轉址快取，未命中才查頁表；通過存在與權限檢查後才能存取實體位址。本次：${r.why}</desc><defs><marker id="va-arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="currentColor"/></marker></defs><g class="node"><rect x="20" y="24" width="236" height="78" rx="10"/><text x="138" y="52" text-anchor="middle">虛擬位址 ${hex(r.va)}</text><text x="138" y="80" text-anchor="middle">VPN ${r.vpn} ＋位移 ${r.offset} B</text></g><path class="flow" d="M256 63H305" marker-end="url(#va-arrow)"/><g class="node is-current"><rect x="311" y="24" width="234" height="78" rx="10"/><text x="428" y="52" text-anchor="middle">轉址快取（TLB）</text><text x="428" y="80" text-anchor="middle">${r.hit ? '有效條目命中' : '未命中 → 查頁表'}</text></g><path class="flow" d="M545 63H590" marker-end="url(#va-arrow)"/><g class="node ${!r.hit ? 'is-current' : ''}"><rect x="598" y="24" width="242" height="78" rx="10"/><text x="719" y="52" text-anchor="middle">${r.hit ? '沿用快取條目' : '單層頁表'}</text><text x="719" y="80" text-anchor="middle">${r.state === 'unmapped' ? '無合法映射' : r.state === 'nonresident' ? 'present = 0' : `present = 1，PFN ${r.pfn}`}</text></g><path class="flow" d="M719 102V143H428V160" marker-end="url(#va-arrow)"/><g class="node ${r.fault ? 'fault' : 'success'}"><rect x="223" y="166" width="410" height="76" rx="10"/><text x="428" y="194" text-anchor="middle">${finalTitle}</text><text x="428" y="223" text-anchor="middle">${finalValue}</text></g></svg></div><div class="calculation"><h3>每一步的數字</h3><ol><li>${r.va} B = ${r.vpn} × 1024 B + ${r.offset} B；因此虛擬頁號 VPN = ${r.vpn}（無單位），頁內位移 = ${r.offset} B。</li><li>${r.hit ? `從有效 TLB 條目取得 PFN ${r.pfn} 與權限資訊，省去這次頁表走訪。` : `TLB 未命中，查 VPN ${r.vpn} 的頁表條目；未命中本身還不能判斷是否缺頁。`}</li><li>${r.fault ? `${finalValue}：不輸出可讀取的實體位址。${r.why}` : `頁存在且權限允許：PFN ${r.pfn} × 1024 B + ${r.offset} B = ${r.pa} B（${hex(r.pa)} B）。`}</li></ol></div><p class="model-note">6 + 10 = 16 bits；1024 = 2¹⁰，所以位移占 10 bits。頁號與頁框號是編號，沒有 byte 單位。真實處理器可能使用多層頁表與不同權限規則；此圖是已宣告的單層教學模型。</p>`;
        enhanceScrollRegions(output);
      } catch (error) { status.textContent = error.message; output.hidden = true; }
    };
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('reset', () => { setTimeout(render, 0); });
    render();
  }
  function setupGlossary() {
    const search = document.querySelector('[data-glossary-search]');
    if (!search) return;
    search.closest('.search-box').hidden = false;
    const entries = [...document.querySelectorAll('[data-term]')];
    const status = document.querySelector('[data-search-status]');
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;
      entries.forEach(entry => { const match = entry.textContent.toLocaleLowerCase().includes(query); entry.hidden = !match; if (match) count++; });
      status.textContent = `顯示 ${count}／${entries.length} 個詞條${count ? '。' : '；可試試中文、英文或縮寫。'}`;
    });
  }
  setupSidebar();
  document.querySelectorAll('[data-trace]').forEach(setupTrace);
  document.querySelectorAll('[data-rr]').forEach(mountRR);
  document.querySelectorAll('[data-va]').forEach(mountVA);
  setupGlossary();
  enhanceScrollRegions();
})();

/* 論文速覽：閱讀頁邏輯
 * 零依賴、原生 ES2018。資料來自 <script id="deck-data" type="application/json">。
 * 所有節點以 document.createElement + textContent 產生（內容含英文題名與符號，禁止 innerHTML）。
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- 常數 */

  var GH_SUMMARY_BASE = 'https://github.com/justty32/paper_readings/blob/main/summarize/';
  var ARXIV_ABS_BASE = 'https://arxiv.org/abs/';
  var TITLE_SUFFIX = '｜論文速覽';
  var NAV_LOCK_MS = 900;

  /* ------------------------------------------------------------ 全域狀態 */

  var state = {
    deck: null,          // 解析後的 deck 物件
    ready: false,        // 是否成功渲染
    keys: null,          // localStorage 鍵名
    read: [],            // 已讀 arxiv_id 陣列
    deep: [],            // 深讀 arxiv_id 陣列
    lanes: [],           // [{id, name, minutes, ids:[arxiv_id], planItem, planProgress}]
    highlightById: {},   // arxiv_id -> highlight
    glossaryByLane: {},  // lane_id -> [{term, plain}]
    cards: [],           // 依 data-nav-index 排序的 .card 節點
    current: -1,         // 目前卡 index
    navLockUntil: 0,     // 程式化捲動期間忽略 IntersectionObserver
    timerId: null,
    timerStart: null,
    observer: null
  };

  /* -------------------------------------------------------- localStorage */

  var memoryStore = {};   // localStorage 不可用時的降級容器

  function storeGet(key) {
    try {
      var v = window.localStorage.getItem(key);
      return v === null ? undefined : v;
    } catch (e) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : undefined;
    }
  }

  function storeSet(key, value) {
    memoryStore[key] = value;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) { /* 私密模式／配額滿：只保留記憶體 */ }
  }

  function storeRemove(key) {
    delete memoryStore[key];
    try {
      window.localStorage.removeItem(key);
    } catch (e) { /* 忽略 */ }
  }

  function loadIdList(key) {
    var raw = storeGet(key);
    if (typeof raw !== 'string' || raw === '') return [];
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    var out = [];
    for (var i = 0; i < parsed.length; i++) {
      if (typeof parsed[i] === 'string' && out.indexOf(parsed[i]) === -1) out.push(parsed[i]);
    }
    return out;
  }

  function saveIdList(key, list) {
    var payload;
    try {
      payload = JSON.stringify(list);
    } catch (e) {
      return;
    }
    storeSet(key, payload);
  }

  function keysFor(deckId) {
    var ns = 'pb:' + deckId + ':';
    return {
      theme: 'pb:theme',
      read: ns + 'read',
      deep: ns + 'deep',
      timer: ns + 'timer',
      pos: ns + 'pos'
    };
  }

  /* ------------------------------------------------------------ DOM 工具 */

  function byId(id) {
    return document.getElementById(id);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null && text !== '') node.textContent = String(text);
    return node;
  }

  function extLink(className, href, text) {
    var a = el('a', className, text);
    a.setAttribute('href', href);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
    return a;
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function setText(id, text) {
    var node = byId(id);
    if (node) node.textContent = text === undefined || text === null ? '' : String(text);
  }

  function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim() !== '';
  }

  function asArray(v) {
    return Array.isArray(v) ? v : [];
  }

  /* --------------------------------------------------- 行內名詞標記 */

  /** 由 lane.glossary 造出比對用的候選字串：完整 term，以及「（」之前的中文頭（長度 ≥ 2）。
   *  依長度由長到短排序，避免長詞被自己的子字串吃掉。 */
  function buildMatchers(glossary) {
    var list = [];
    for (var i = 0; i < glossary.length; i++) {
      var entry = glossary[i];
      if (!entry || !isNonEmptyString(entry.term)) continue;
      var term = entry.term;
      var seen = {};
      var candidates = [term];
      var cut = term.length;
      var full = term.indexOf('（');
      var half = term.indexOf('(');
      if (full !== -1) cut = Math.min(cut, full);
      if (half !== -1) cut = Math.min(cut, half);
      if (cut < term.length) {
        var head = term.slice(0, cut).trim();
        if (head.length >= 2) candidates.push(head);
      }
      for (var c = 0; c < candidates.length; c++) {
        var text = candidates[c];
        if (Object.prototype.hasOwnProperty.call(seen, text)) continue;
        seen[text] = true;
        list.push({ index: i, text: text });
      }
    }
    list.sort(function (a, b) {
      return b.text.length - a.text.length;
    });
    return list;
  }

  /** 行內名詞用 span[role=button] 而不是 <button>：Chrome 把 <button> 當 inline-block
   *  排版，長名詞會整塊掉到下一行留出缺口；span 才能像一般文字跨行折行。 */
  function makeTermButton(matcher) {
    var btn = el('span', 'term', matcher.text);
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('data-term', String(matcher.index));
    btn.setAttribute('aria-expanded', 'false');
    return btn;
  }

  /** 把 text 切成「純文字 + .term 按鈕」附加到 parent；同一段落同一詞只標第一次。
   *  完全用 createTextNode／createElement 組回去，不碰 innerHTML。 */
  function appendTextWithTerms(parent, text, matchers) {
    text = String(text);
    if (!matchers || matchers.length === 0) {
      parent.appendChild(document.createTextNode(text));
      return;
    }
    var used = {};
    var pos = 0;
    while (pos < text.length) {
      var best = null;
      for (var i = 0; i < matchers.length; i++) {
        var m = matchers[i];
        if (Object.prototype.hasOwnProperty.call(used, m.index)) continue;
        var at = text.indexOf(m.text, pos);
        if (at === -1) continue;
        // matchers 已由長到短排序，同一位置先取到的即最長者
        if (best === null || at < best.at) best = { at: at, m: m };
      }
      if (!best) break;
      if (best.at > pos) parent.appendChild(document.createTextNode(text.slice(pos, best.at)));
      parent.appendChild(makeTermButton(best.m));
      used[best.m.index] = true;
      pos = best.at + best.m.text.length;
    }
    if (pos < text.length) parent.appendChild(document.createTextNode(text.slice(pos)));
  }

  /** 產生 <p class="…">（可選前置 label span）＋ 標記過的文字。 */
  function para(className, text, matchers, labelClass, labelText) {
    var p = el('p', className);
    if (labelClass) p.appendChild(el('span', labelClass, labelText));
    appendTextWithTerms(p, text, matchers);
    return p;
  }

  /* --------------------------------------------------------- 純計算函式 */

  /** all_papers 一列的連結：有 summary_file 走 GitHub summarize，否則走 arXiv abs。
   *  summary_file 內含中文與 `.摘要.md`，直接串接不要 encodeURI。 */
  function summaryUrlFor(row) {
    if (row && isNonEmptyString(row.summary_file)) return GH_SUMMARY_BASE + row.summary_file;
    if (row && isNonEmptyString(row.arxiv_id)) return ARXIV_ABS_BASE + row.arxiv_id;
    return '';
  }

  /** 預估剩餘分鐘：Σ lane.minutes × (未讀卡數 / 卡數)，無條件進位。 */
  function computeRemainingMinutes(lanes, readList) {
    var total = 0;
    for (var i = 0; i < lanes.length; i++) {
      var lane = lanes[i];
      var n = lane.ids.length;
      if (!n) continue;
      var unread = 0;
      for (var j = 0; j < n; j++) {
        if (readList.indexOf(lane.ids[j]) === -1) unread++;
      }
      var minutes = typeof lane.minutes === 'number' && isFinite(lane.minutes) ? lane.minutes : 0;
      total += minutes * (unread / n);
    }
    return Math.ceil(total - 1e-9);
  }

  function totalCardCount(lanes) {
    var t = 0;
    for (var i = 0; i < lanes.length; i++) t += lanes[i].ids.length;
    return t;
  }

  function readCount(lanes, readList) {
    var c = 0;
    for (var i = 0; i < lanes.length; i++) {
      var ids = lanes[i].ids;
      for (var j = 0; j < ids.length; j++) {
        if (readList.indexOf(ids[j]) !== -1) c++;
      }
    }
    return c;
  }

  function pad2(n) {
    n = Math.floor(n);
    return n < 10 ? '0' + n : String(n);
  }

  function mmss(totalSeconds) {
    if (!isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    var m = Math.floor(totalSeconds / 60);
    var s = Math.floor(totalSeconds % 60);
    return pad2(m) + ':' + pad2(s);
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------------ 資料讀取 */

  function readDeckData() {
    var node = byId('deck-data');
    if (!node) return { error: '找不到資料區塊。' };
    var raw = node.textContent || '';
    if (raw.trim() === '') return { empty: true };
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return { error: '資料格式有誤，無法顯示這個 deck。' };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { empty: true };
    if (!Array.isArray(parsed.lanes) || parsed.lanes.length === 0) return { empty: true };
    return { deck: parsed };
  }

  function showMessage(text) {
    var lanes = byId('lanes');
    if (!lanes) return;
    clear(lanes);
    var p = el('p', 'lane-message', text);
    lanes.appendChild(p);
  }

  /* -------------------------------------------------------------- 頁首 */

  function renderHeader(deck) {
    setText('deck-title', deck.title || '');
    setText('deck-subtitle', deck.subtitle || '');
    setText('deck-intro', deck.intro || '');
    setText('deck-outro', deck.outro || '');
    if (isNonEmptyString(deck.title)) document.title = deck.title + TITLE_SUFFIX;
  }

  function renderPlanBar(deck) {
    var bar = byId('plan-bar');
    if (!bar) return;
    clear(bar);
    for (var i = 0; i < state.lanes.length; i++) {
      var info = state.lanes[i];
      var lane = deck.lanes[i];

      var a = el('a', 'plan-item');
      a.setAttribute('href', '#lane-' + info.id);
      a.setAttribute('data-lane', info.id);

      a.appendChild(el('span', 'plan-name', lane.name || info.id));

      var meta = el('span', 'plan-meta');
      meta.appendChild(el('span', 'plan-min', (lane.minutes === undefined ? 0 : lane.minutes) + ' 分'));
      meta.appendChild(el('span', 'plan-count', (lane.paper_count === undefined ? 0 : lane.paper_count) + ' 篇'));
      a.appendChild(meta);

      var progress = el('span', 'plan-progress', '');
      a.appendChild(progress);

      info.planItem = a;
      info.planProgress = progress;
      bar.appendChild(a);
    }
  }

  /* --------------------------------------------------------------- lane */

  function renderGistCard(lane, navIndex, matchers) {
    var card = el('article', 'card card-gist');
    card.id = 'gist-' + lane.id;
    card.setAttribute('data-nav-index', String(navIndex));
    card.setAttribute('tabindex', '-1');

    card.appendChild(el('p', 'card-kicker', '全景要點'));

    var gist = lane.gist && typeof lane.gist === 'object' ? lane.gist : {};

    if (isNonEmptyString(gist.summary)) {
      card.appendChild(para('gist-summary', gist.summary, matchers));
    }

    var points = asArray(gist.points);
    if (points.length) {
      var ul = el('ul', 'gist-points');
      for (var i = 0; i < points.length; i++) {
        var li = el('li');
        appendTextWithTerms(li, points[i], matchers);
        ul.appendChild(li);
      }
      card.appendChild(ul);
    }

    if (isNonEmptyString(gist.open)) {
      var open = el('p', 'gist-open');
      open.appendChild(el('span', 'tag tag-open', '還沒解決'));
      open.appendChild(document.createTextNode(' '));
      appendTextWithTerms(open, gist.open, matchers);   // 只標 open 文字，不動 tag
      card.appendChild(open);
    }

    return card;
  }

  function renderGlossary(lane, entries) {
    if (!entries || entries.length === 0) return null;

    var details = el('details', 'lane-glossary');
    details.appendChild(el('summary', null, '名詞白話（' + entries.length + ' 條）'));

    var dl = el('dl', 'glossary-list');
    for (var i = 0; i < entries.length; i++) {
      var item = el('div', 'glossary-item');
      item.id = 'gl-' + lane.id + '-' + i;
      item.appendChild(el('dt', 'glossary-term', entries[i].term));
      item.appendChild(el('dd', 'glossary-plain', entries[i].plain || ''));
      dl.appendChild(item);
    }
    details.appendChild(dl);
    return details;
  }

  function renderPaperCard(hl, seq, seqTotal, lane, navIndex, matchers) {
    var card = el('article', 'card card-paper');
    card.id = 'card-' + hl.arxiv_id;
    card.setAttribute('data-arxiv', hl.arxiv_id);
    card.setAttribute('data-lane', lane.id);
    card.setAttribute('data-nav-index', String(navIndex));
    card.setAttribute('tabindex', '-1');

    var head = el('header', 'card-head');
    head.appendChild(el('span', 'card-seq', seq + '/' + seqTotal));
    if (isNonEmptyString(hl.role)) head.appendChild(el('span', 'tag tag-role', hl.role));
    if (isNonEmptyString(hl.year)) head.appendChild(el('span', 'card-year', hl.year));
    card.appendChild(head);

    if (isNonEmptyString(hl.title_zh)) card.appendChild(el('h3', 'card-title-zh', hl.title_zh));
    if (isNonEmptyString(hl.title_en)) {
      var en = el('p', 'card-title-en', hl.title_en);
      en.setAttribute('lang', 'en');
      card.appendChild(en);
    }
    if (isNonEmptyString(hl.one_liner)) card.appendChild(para('card-oneliner', hl.one_liner, matchers));
    if (isNonEmptyString(hl.plain)) {
      card.appendChild(para('card-plain', hl.plain, matchers, 'card-plain-label', '白話'));
    }
    if (isNonEmptyString(hl.core)) card.appendChild(para('card-core', hl.core, matchers));

    var num = hl.number && typeof hl.number === 'object' ? hl.number : null;
    if (num && (isNonEmptyString(num.label) || isNonEmptyString(num.value))) {
      var pNum = el('p', 'card-number');
      var chip = el('span', 'chip');
      chip.appendChild(el('span', 'chip-label', num.label || ''));
      chip.appendChild(el('span', 'chip-value', num.value || ''));
      pNum.appendChild(chip);
      if (isNonEmptyString(num.note)) pNum.appendChild(el('span', 'chip-note', num.note));
      card.appendChild(pNum);
    }

    if (isNonEmptyString(hl.why)) {
      card.appendChild(para('card-why', hl.why, matchers, 'card-why-label', '為什麼必讀'));
    }

    var links = hl.links && typeof hl.links === 'object' ? hl.links : {};
    var linkSpec = [
      ['arxiv', 'arXiv ↗'],
      ['summary', '摘要 ↗'],
      ['translate', '翻譯 ↗']
    ];
    var pLinks = el('p', 'card-links');
    var linkCount = 0;
    for (var i = 0; i < linkSpec.length; i++) {
      var href = links[linkSpec[i][0]];
      if (!isNonEmptyString(href)) continue;
      pLinks.appendChild(extLink('link-btn', href, linkSpec[i][1]));
      linkCount++;
    }
    if (linkCount) card.appendChild(pLinks);

    var actions = el('div', 'card-actions');

    var label = el('label', 'check');
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'read-toggle';
    input.setAttribute('data-arxiv', hl.arxiv_id);
    label.appendChild(input);
    label.appendChild(document.createTextNode(' '));
    label.appendChild(el('span', 'check-text', '已讀'));
    actions.appendChild(label);

    var deepBtn = el('button', 'deep-toggle', '標記深讀');
    deepBtn.type = 'button';
    deepBtn.setAttribute('data-arxiv', hl.arxiv_id);
    deepBtn.setAttribute('aria-pressed', 'false');
    actions.appendChild(deepBtn);

    card.appendChild(actions);
    return card;
  }

  function renderLaneQuestion(lane, matchers) {
    var aside = el('aside', 'lane-question');
    aside.appendChild(el('p', 'card-kicker', '車上想一想'));
    aside.appendChild(para('lane-question-text', lane.question, matchers));
    return aside;
  }

  function renderLaneAll(lane) {
    var rows = asArray(lane.all_papers);
    var details = el('details', 'lane-all');
    details.appendChild(el('summary', null, '這條線全部 ' + rows.length + ' 篇'));

    var wrap = el('div', 'table-wrap');
    var table = el('table', 'all-table');

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    var heads = ['arXiv', '題名', '狀態'];
    for (var h = 0; h < heads.length; h++) {
      var th = el('th', null, heads[h]);
      th.setAttribute('scope', 'col');
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i] && typeof rows[i] === 'object' ? rows[i] : {};
      var tr = document.createElement('tr');

      var tdId = el('td', 'all-id');
      var href = summaryUrlFor(row);
      if (href) {
        tdId.appendChild(extLink(null, href, row.arxiv_id || ''));
      } else {
        tdId.textContent = row.arxiv_id || '';
      }
      tr.appendChild(tdId);

      tr.appendChild(el('td', 'all-title', row.title_zh || ''));
      tr.appendChild(el('td', 'all-status', row.status || ''));
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    wrap.appendChild(table);
    details.appendChild(wrap);
    return details;
  }

  function renderLane(lane, index, laneTotal, navCounter) {
    var section = el('section', 'lane');
    section.id = 'lane-' + lane.id;
    section.setAttribute('data-lane', lane.id);
    section.setAttribute('aria-labelledby', 'lane-' + lane.id + '-title');

    var head = el('header', 'lane-head');
    head.appendChild(el('p', 'lane-eyebrow', '主線 ' + (index + 1) + '／' + laneTotal));

    var h2 = el('h2', 'lane-title', lane.name || lane.id);
    h2.id = 'lane-' + lane.id + '-title';
    head.appendChild(h2);

    var meta = el('p', 'lane-meta');
    meta.appendChild(el('span', 'lane-minutes', (lane.minutes === undefined ? 0 : lane.minutes) + ' 分鐘'));
    meta.appendChild(el('span', 'lane-count', (lane.paper_count === undefined ? 0 : lane.paper_count) + ' 篇'));
    if (isNonEmptyString(lane.deep_doc)) {
      meta.appendChild(extLink('lane-deep', lane.deep_doc, '深讀綜述 ↗'));
    }
    head.appendChild(meta);
    section.appendChild(head);

    var glossary = state.glossaryByLane[lane.id] || [];
    var matchers = buildMatchers(glossary);

    section.appendChild(renderGistCard(lane, navCounter.n++, matchers));

    // 名詞白話：全景卡之後、第一張必讀卡之前；不是 nav 卡，不給 data-nav-index
    var glossaryBlock = renderGlossary(lane, glossary);
    if (glossaryBlock) section.appendChild(glossaryBlock);

    var highlights = asArray(lane.highlights);
    for (var i = 0; i < highlights.length; i++) {
      var hl = highlights[i];
      if (!hl || !isNonEmptyString(hl.arxiv_id)) continue;
      section.appendChild(renderPaperCard(hl, i + 1, highlights.length, lane, navCounter.n++, matchers));
    }

    if (isNonEmptyString(lane.question)) section.appendChild(renderLaneQuestion(lane, matchers));
    if (asArray(lane.all_papers).length) section.appendChild(renderLaneAll(lane));

    return section;
  }

  function renderLanes(deck) {
    var host = byId('lanes');
    if (!host) return;
    clear(host);
    var navCounter = { n: 0 };
    for (var i = 0; i < deck.lanes.length; i++) {
      host.appendChild(renderLane(deck.lanes[i], i, deck.lanes.length, navCounter));
    }
  }

  /* ------------------------------------------------------------ 跨線索 */

  function renderThreads(deck) {
    var host = byId('threads-list');
    if (!host) return;
    clear(host);

    var laneNameById = {};
    for (var i = 0; i < deck.lanes.length; i++) {
      laneNameById[deck.lanes[i].id] = deck.lanes[i].name || deck.lanes[i].id;
    }

    var threads = asArray(deck.threads);
    for (var t = 0; t < threads.length; t++) {
      var th = threads[t];
      if (!th || typeof th !== 'object') continue;

      var article = el('article', 'thread');
      if (isNonEmptyString(th.title)) article.appendChild(el('h3', 'thread-title', th.title));
      if (isNonEmptyString(th.text)) article.appendChild(el('p', 'thread-text', th.text));

      var refs = el('p', 'thread-refs');
      var refCount = 0;

      var laneIds = asArray(th.lane_ids);
      for (var li = 0; li < laneIds.length; li++) {
        var lid = laneIds[li];
        if (!Object.prototype.hasOwnProperty.call(laneNameById, lid)) continue;
        var laneRef = el('a', 'thread-ref', laneNameById[lid]);
        laneRef.setAttribute('href', '#lane-' + lid);
        refs.appendChild(laneRef);
        refCount++;
      }

      var paperIds = asArray(th.paper_ids);
      for (var pi = 0; pi < paperIds.length; pi++) {
        var pid = paperIds[pi];
        if (!Object.prototype.hasOwnProperty.call(state.highlightById, pid)) continue;
        var paperRef = el('a', 'thread-ref', pid);
        paperRef.setAttribute('href', '#card-' + pid);
        refs.appendChild(paperRef);
        refCount++;
      }

      if (refCount) article.appendChild(refs);
      host.appendChild(article);
    }
  }

  /* --------------------------------------------------------- 已讀／深讀 */

  function isRead(id) {
    return state.read.indexOf(id) !== -1;
  }

  function isDeep(id) {
    return state.deep.indexOf(id) !== -1;
  }

  function toggleInList(list, id, on) {
    var idx = list.indexOf(id);
    if (on && idx === -1) list.push(id);
    if (!on && idx !== -1) list.splice(idx, 1);
  }

  function applyReadToCard(id) {
    var card = byId('card-' + id);
    if (!card) return;
    var on = isRead(id);
    if (on) card.classList.add('is-read');
    else card.classList.remove('is-read');
    var input = card.querySelector('.read-toggle');
    if (input) input.checked = on;
    var text = card.querySelector('.check-text');
    if (text) text.textContent = on ? '已讀 ✓' : '已讀';
  }

  function applyDeepToCard(id) {
    var card = byId('card-' + id);
    if (!card) return;
    var on = isDeep(id);
    if (on) card.classList.add('is-deep');
    else card.classList.remove('is-deep');
    var btn = card.querySelector('.deep-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? '已標記深讀 ★' : '標記深讀';
    }
  }

  function applyAllCardStates() {
    for (var i = 0; i < state.lanes.length; i++) {
      var ids = state.lanes[i].ids;
      for (var j = 0; j < ids.length; j++) {
        applyReadToCard(ids[j]);
        applyDeepToCard(ids[j]);
      }
    }
  }

  function updatePlanBar() {
    for (var i = 0; i < state.lanes.length; i++) {
      var info = state.lanes[i];
      if (!info.planProgress) continue;
      var total = info.ids.length;
      var done = 0;
      for (var j = 0; j < total; j++) {
        if (isRead(info.ids[j])) done++;
      }
      var label = done + '/' + total;
      info.planProgress.textContent = label;
      info.planProgress.setAttribute('aria-label', '已讀 ' + label);
      if (info.planItem) {
        if (total > 0 && done === total) info.planItem.classList.add('is-done');
        else info.planItem.classList.remove('is-done');
      }
    }
  }

  function updateBottomStatus() {
    var total = totalCardCount(state.lanes);
    var done = readCount(state.lanes, state.read);
    setText('progress-text', '已讀 ' + done + '/' + total);

    var remaining = byId('remaining-text');
    if (!remaining) return;
    if (total > 0 && done === total) {
      remaining.textContent = '全部讀完 ✓';
    } else {
      remaining.textContent = '預估剩餘 ' + computeRemainingMinutes(state.lanes, state.read) + ' 分鐘';
    }
  }

  function renderDeepList() {
    var host = byId('deep-list-items');
    var empty = byId('deep-list-empty');
    if (host) clear(host);

    var shown = 0;
    if (host) {
      // 依 deck 內的卡片順序列出，而非點擊順序
      for (var i = 0; i < state.lanes.length; i++) {
        var ids = state.lanes[i].ids;
        for (var j = 0; j < ids.length; j++) {
          var id = ids[j];
          if (!isDeep(id)) continue;
          var hl = state.highlightById[id] || {};
          var li = el('li', 'deep-item');
          var a = document.createElement('a');
          a.setAttribute('href', '#card-' + id);
          a.appendChild(el('span', 'deep-item-title', hl.title_zh || id));
          a.appendChild(el('span', 'deep-item-id', id));
          li.appendChild(a);
          host.appendChild(li);
          shown++;
        }
      }
    }

    if (empty) {
      if (shown > 0) empty.setAttribute('hidden', '');
      else empty.removeAttribute('hidden');
    }
  }

  function setRead(id, on) {
    toggleInList(state.read, id, on);
    saveIdList(state.keys.read, state.read);
    applyReadToCard(id);
    updatePlanBar();
    updateBottomStatus();
  }

  function setDeep(id, on) {
    toggleInList(state.deep, id, on);
    saveIdList(state.keys.deep, state.deep);
    applyDeepToCard(id);
    renderDeepList();
  }

  /** 點行內名詞：已展開就收回，否則在按鈕之後插入 .term-pop。 */
  function toggleTermPop(btn) {
    var next = btn.nextSibling;
    if (next && next.classList && next.classList.contains('term-pop')) {
      if (next.parentNode) next.parentNode.removeChild(next);
      btn.setAttribute('aria-expanded', 'false');
      return;
    }

    var laneNode = btn.closest ? btn.closest('.lane') : null;
    var laneId = laneNode ? laneNode.getAttribute('data-lane') : null;
    var entries = laneId ? state.glossaryByLane[laneId] : null;
    var idx = Number(btn.getAttribute('data-term'));
    if (!entries || !isFinite(idx) || !entries[idx]) return;
    var entry = entries[idx];

    var pop = el('span', 'term-pop');
    pop.setAttribute('role', 'note');
    pop.appendChild(el('span', 'term-pop-term', entry.term));
    pop.appendChild(document.createTextNode(entry.plain || ''));

    if (btn.parentNode) btn.parentNode.insertBefore(pop, btn.nextSibling);
    btn.setAttribute('aria-expanded', 'true');
  }

  function bindCardActions() {
    var host = byId('lanes');
    if (!host) return;

    // 行內名詞是 span[role=button]，鍵盤 Enter／Space 要自己接。
    host.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      var target = ev.target;
      var termBtn = target && target.closest ? target.closest('.term') : null;
      if (!termBtn) return;
      ev.preventDefault();
      toggleTermPop(termBtn);
    });

    host.addEventListener('change', function (ev) {
      var target = ev.target;
      if (!target || !target.classList || !target.classList.contains('read-toggle')) return;
      var id = target.getAttribute('data-arxiv');
      if (!id) return;
      setRead(id, !!target.checked);
    });

    host.addEventListener('click', function (ev) {
      var target = ev.target;
      if (!target || !target.closest) return;

      var termBtn = target.closest('.term');
      if (termBtn && host.contains(termBtn)) {
        toggleTermPop(termBtn);
        return;
      }

      var btn = target.closest('.deep-toggle');
      if (!btn || !host.contains(btn)) return;
      var id = btn.getAttribute('data-arxiv');
      if (!id) return;
      setDeep(id, !isDeep(id));
    });

    var clearBtn = byId('deep-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (state.deep.length === 0) return;
        if (!window.confirm('確定要清空「回家想深讀」清單嗎？')) return;
        var ids = state.deep.slice();
        state.deep.length = 0;
        saveIdList(state.keys.deep, state.deep);
        for (var i = 0; i < ids.length; i++) applyDeepToCard(ids[i]);
        renderDeepList();
      });
    }
  }

  /* ------------------------------------------------------ 上一張／下一張 */

  function collectCards() {
    var nodes = document.querySelectorAll('.card[data-nav-index]');
    var list = [];
    for (var i = 0; i < nodes.length; i++) list.push(nodes[i]);
    list.sort(function (a, b) {
      return Number(a.getAttribute('data-nav-index')) - Number(b.getAttribute('data-nav-index'));
    });
    return list;
  }

  function updateNavButtons() {
    var prev = byId('nav-prev');
    var next = byId('nav-next');
    var last = state.cards.length - 1;
    if (prev) prev.disabled = state.cards.length === 0 || state.current <= 0;
    if (next) next.disabled = state.cards.length === 0 || state.current >= last;
  }

  function setCurrent(index, opts) {
    opts = opts || {};
    if (state.cards.length === 0) {
      state.current = -1;
      updateNavButtons();
      return;
    }
    if (index < 0) index = 0;
    if (index > state.cards.length - 1) index = state.cards.length - 1;

    if (state.current !== index) {
      var old = state.cards[state.current];
      if (old) old.classList.remove('is-current');
    }
    state.current = index;
    var card = state.cards[index];
    card.classList.add('is-current');

    storeSet(state.keys.pos, String(index));

    if (opts.scroll) {
      state.navLockUntil = Date.now() + NAV_LOCK_MS;
      try {
        card.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      } catch (e) {
        card.scrollIntoView(true);
      }
    }
    if (opts.focus) {
      try {
        card.focus({ preventScroll: true });
      } catch (e) {
        card.focus();
      }
    }
    updateNavButtons();
  }

  function navBy(delta) {
    if (state.cards.length === 0) return;
    var next = (state.current < 0 ? 0 : state.current) + delta;
    if (next < 0 || next > state.cards.length - 1) return;   // 首尾不循環
    setCurrent(next, { scroll: true, focus: true });
  }

  function indexOfCardId(id) {
    for (var i = 0; i < state.cards.length; i++) {
      if (state.cards[i].id === id) return i;
    }
    return -1;
  }

  function currentFromHash() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return -1;
    var id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (e) { /* 保留原字 */ }
    return indexOfCardId(id);
  }

  function bindNav() {
    var prev = byId('nav-prev');
    var next = byId('nav-next');
    if (prev) prev.addEventListener('click', function () { navBy(-1); });
    if (next) next.addEventListener('click', function () { navBy(1); });

    document.addEventListener('keydown', function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;
      var t = ev.target;
      if (t) {
        if (t.isContentEditable) return;
        var tag = t.tagName ? t.tagName.toUpperCase() : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      }
      var key = ev.key;
      if (key === 'ArrowLeft' || key === 'k' || key === 'K') {
        ev.preventDefault();
        navBy(-1);
      } else if (key === 'ArrowRight' || key === 'j' || key === 'J') {
        ev.preventDefault();
        navBy(1);
      }
    });

    window.addEventListener('hashchange', function () {
      var idx = currentFromHash();
      if (idx !== -1) {
        state.navLockUntil = Date.now() + NAV_LOCK_MS;
        setCurrent(idx, {});
      }
    });
  }

  function setupObserver() {
    if (typeof window.IntersectionObserver !== 'function') return;
    if (state.observer) state.observer.disconnect();

    // rootMargin 上偏：只讓「剛通過視口上緣」的卡進入這條窄帶
    var observer = new window.IntersectionObserver(function (entries) {
      if (Date.now() < state.navLockUntil) return;
      var best = null;
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var top = entries[i].boundingClientRect.top;
        if (best === null || top < best.top) best = { top: top, target: entries[i].target };
      }
      if (!best) return;
      var idx = Number(best.target.getAttribute('data-nav-index'));
      if (!isFinite(idx) || idx === state.current) return;
      setCurrent(idx, {});
    }, { rootMargin: '-12% 0px -76% 0px', threshold: 0 });

    for (var i = 0; i < state.cards.length; i++) observer.observe(state.cards[i]);
    state.observer = observer;
  }

  /* -------------------------------------------------------------- 計時器 */

  function timerTotalSeconds() {
    var m = state.deck && typeof state.deck.total_minutes === 'number' ? state.deck.total_minutes : 30;
    if (!isFinite(m) || m <= 0) m = 30;
    return m * 60;
  }

  function timerTotalLabel() {
    var m = Math.floor(timerTotalSeconds() / 60);
    return (m < 10 ? '0' + m : String(m)) + ':00';
  }

  function tickTimer() {
    var display = byId('timer-display');
    if (!display || state.timerStart === null) return;
    var elapsed = Math.floor((Date.now() - state.timerStart) / 1000);
    if (elapsed < 0) elapsed = 0;
    var total = timerTotalSeconds();
    if (elapsed > total) {
      display.classList.add('is-over');
      display.textContent = '已超過 ' + mmss(elapsed - total);
    } else {
      display.classList.remove('is-over');
      display.textContent = '已用 ' + mmss(elapsed) + '／' + timerTotalLabel();
    }
  }

  function startTimerLoop() {
    if (state.timerId !== null) return;
    state.timerId = window.setInterval(tickTimer, 1000);
  }

  function stopTimerLoop() {
    if (state.timerId === null) return;
    window.clearInterval(state.timerId);
    state.timerId = null;
  }

  function setTimerButton(running) {
    var btn = byId('timer-toggle');
    if (!btn) return;
    var m = Math.floor(timerTotalSeconds() / 60);
    btn.textContent = running ? '停止計時' : '開始 ' + m + ' 分鐘';
  }

  function startTimer(startedAt) {
    state.timerStart = startedAt;
    storeSet(state.keys.timer, String(startedAt));
    setTimerButton(true);
    tickTimer();
    startTimerLoop();
  }

  function stopTimer() {
    state.timerStart = null;
    stopTimerLoop();
    storeRemove(state.keys.timer);
    setTimerButton(false);
    var display = byId('timer-display');
    if (display) {
      display.textContent = '';
      display.classList.remove('is-over');
    }
  }

  function bindTimer() {
    var btn = byId('timer-toggle');
    setTimerButton(false);
    if (btn) {
      btn.addEventListener('click', function () {
        if (state.timerStart === null) startTimer(Date.now());
        else stopTimer();
      });
    }
    var saved = storeGet(state.keys.timer);
    if (typeof saved === 'string' && saved !== '') {
      var at = Number(saved);
      if (isFinite(at) && at > 0) startTimer(at);
    }
  }

  /* ---------------------------------------------------------------- 主題 */

  function currentIsDark() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  }

  function syncThemeButton() {
    var btn = byId('theme-toggle');
    if (!btn) return;
    var dark = currentIsDark();
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.textContent = dark ? '深色' : '淺色';
  }

  function bindTheme() {
    syncThemeButton();
    var btn = byId('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = currentIsDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      storeSet('pb:theme', next);
      syncThemeButton();
    });
  }

  /* -------------------------------------------------------------- 組裝 */

  function indexDeck(deck) {
    state.lanes = [];
    state.highlightById = {};
    state.glossaryByLane = {};
    for (var i = 0; i < deck.lanes.length; i++) {
      var lane = deck.lanes[i];
      if (!lane || typeof lane !== 'object' || !isNonEmptyString(lane.id)) continue;
      state.glossaryByLane[lane.id] = asArray(lane.glossary).filter(function (g) {
        return g && isNonEmptyString(g.term);
      });
      var ids = [];
      var highlights = asArray(lane.highlights);
      for (var j = 0; j < highlights.length; j++) {
        var hl = highlights[j];
        if (!hl || !isNonEmptyString(hl.arxiv_id)) continue;
        ids.push(hl.arxiv_id);
        state.highlightById[hl.arxiv_id] = hl;
      }
      state.lanes.push({
        id: lane.id,
        name: lane.name || lane.id,
        minutes: lane.minutes,
        ids: ids,
        planItem: null,
        planProgress: null
      });
    }
  }

  /** 依 state.deck 重畫整頁（狀態沿用 state.read／state.deep）。 */
  function renderAll() {
    var deck = state.deck;
    if (!deck) return;
    indexDeck(deck);
    renderHeader(deck);
    renderPlanBar(deck);
    renderLanes(deck);
    renderThreads(deck);

    state.cards = collectCards();
    applyAllCardStates();
    updatePlanBar();
    updateBottomStatus();
    renderDeepList();
    setupObserver();

    var idx = currentFromHash();
    if (idx === -1) {
      var saved = Number(storeGet(state.keys.pos));
      idx = isFinite(saved) && saved >= 0 ? saved : 0;
    }
    state.current = -1;
    setCurrent(idx, {});
    // 觀察器建立後的第一批回呼會在載入當下觸發，先鎖住以免覆蓋還原的位置
    state.navLockUntil = Date.now() + NAV_LOCK_MS;
  }

  function init() {
    var result = readDeckData();
    if (result.error) {
      showMessage(result.error);
      return;
    }
    if (result.empty) {
      showMessage('尚未載入資料');
      return;
    }

    state.deck = result.deck;
    state.keys = keysFor(isNonEmptyString(state.deck.deck_id) ? state.deck.deck_id : 'deck');
    state.read = loadIdList(state.keys.read);
    state.deep = loadIdList(state.keys.deep);

    renderAll();

    bindCardActions();
    bindNav();
    bindTimer();
    state.ready = true;
  }

  function boot() {
    try {
      bindTheme();
      init();
    } catch (e) {
      showMessage('頁面初始化失敗，請重新整理。');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 僅供開發／驗收在瀏覽器 console 檢查用。
  window.__pb = { state: state, renderAll: renderAll };
})();

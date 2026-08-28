# 論文速覽：手機優先的閱讀型靜態網站

直接以瀏覽器開啟 [index.html](index.html) 即可；所有資產都在本目錄，離線可用、零外部依賴。
線上版：<https://justty32.github.io/engineer_study/paper-briefs/>（slug `paper-briefs`）。

本站是「閱讀頁」不是課程頁：讓讀者在車上用手機、單手、30 分鐘讀完一個 deck（幾條主線 × 每線一張全景卡 + 4 張必讀卡）。資料來源是 [paper_readings](https://github.com/justty32/paper_readings) 的 `deep/`、`summarize/`、`translate/`；本站不重述論文，只給骨架與連結。

## 頁面地圖

| 檔案 | 責任 |
|------|------|
| `index.html` | deck 總覽：列出所有 deck 並連進去（目前 1 個） |
| `symbolic-arc-automata.html` | deck「ARC・符號・自動機 三十分鐘速覽」的閱讀頁；資料內嵌於 `<script id="deck-data">` |
| `styles.css` | 兩頁共用樣式（手機優先、深色模式、無動畫偏好） |
| `app.js` | 閱讀頁邏輯：讀 `#deck-data` 渲染、已讀／深讀狀態、上一張／下一張、計時器、主題切換 |
| `README.md` | 本檔：頁面地圖、資料契約摘要、DOM 契約、如何再加一個 deck |
| `驗收紀錄.md` | 已執行的檢查與證據；沒證據的項目不標通過 |

## 資料契約摘要（deck.json）

完整契約見 paper_readings 側的 `SCHEMA.md`；頁面只依賴下列欄位：

```text
deck: deck_id, title, subtitle, total_minutes, intro, lanes[], threads[], outro
lane: id, name, minutes, paper_count, deep_doc,
      gist{summary, points[], open}, highlights[4], question, all_papers[]
highlight: arxiv_id, title_zh, title_en, year, role, one_liner, plain?, core,
           number{label, value, note}, why, links{arxiv, summary, translate}
lane 另有可選 glossary?: [{term: "中文（English）", plain: "≤60 字"}] × 4～8
all_papers 列: arxiv_id, status, title_zh, cat, summary_file|null, translate_file|null
thread: title, text, lane_ids[], paper_ids[]
```

- `all_papers` 各列連到 `https://github.com/justty32/paper_readings/blob/main/summarize/<summary_file>`；`summary_file` 為 `null` 時只放 arXiv 連結 `https://arxiv.org/abs/<arxiv_id>`。
- `plain`（可選，≤80 字）：「用你的話說，這篇等於……」，渲染在 `one_liner` 之後、`core` 之前，視覺上是一句側註。
- `glossary`（可選，4～8 條）：該線生僻名詞的白話解釋，渲染成全景卡之後的「名詞白話」`<details>`（標題顯示條數）；卡片正文中出現的 `term` 會被標成可點的行內按鈕，點了在原地展開該條白話。
- 兩個欄位缺席時不渲染、不報錯（舊資料相容）。
- 頁面完全資料驅動：lane 數、卡數、all_papers 列數皆由 JSON 決定，不寫死 4 或 16。
- 灌資料：`python3 inline_deck.py <deck.json> [<html>]`（腳本放在 paper_readings 側的工作 scratchpad；作用是把 JSON 安全跳脫後寫進 `#deck-data`，可重複執行）。

## DOM 契約（Shell 與 JS 的唯一介面）

寫入範圍互斥：**Shell worker 只寫 `index.html`、`symbolic-arc-automata.html`、`styles.css`；JS worker 只寫 `app.js`。** 任何一方需要新增 id／class，先改本節再實作。

### 全域

- `<html lang="zh-Hant" data-theme="light|dark">`：`data-theme` 缺席＝跟隨系統。head 內有一段固定的內嵌腳本（Shell 負責放，內容如下）在 CSS 載入前套用 localStorage 的主題，避免閃白：

  ```html
  <script>(function(){try{var t=localStorage.getItem('pb:theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();</script>
  ```

- CSS 主題規則：`:root` 定義淺色 token；`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }`；`:root[data-theme="dark"] {...}`。
- `body` 底部要留 `padding-bottom` 給固定底列（實作為 `calc(110px + env(safe-area-inset-bottom))`）。
- localStorage 鍵（JS 擁有）：`pb:theme`＝`light|dark`；`pb:<deck_id>:read`＝已讀 arxiv_id 陣列；`pb:<deck_id>:deep`＝深讀 arxiv_id 陣列；`pb:<deck_id>:timer`＝計時開始的 epoch ms；`pb:<deck_id>:pos`＝目前卡片 nav index。

### `symbolic-arc-automata.html` 靜態骨架（Shell 寫，JS 只填內容）

```html
<a class="skip-link" href="#lanes">跳到內容</a>
<header class="deck-header">
  <nav class="topbar" aria-label="站內導覽">
    <a class="topbar-link" href="./index.html">← deck 總覽</a>
    <button type="button" id="theme-toggle" class="topbar-btn" aria-pressed="false">深色</button>
  </nav>
  <p class="eyebrow">論文速覽</p>
  <h1 id="deck-title"></h1>
  <p id="deck-subtitle" class="deck-subtitle"></p>
  <p id="deck-intro" class="deck-intro"></p>
  <nav id="plan-bar" class="plan-bar" aria-label="30 分鐘計畫"></nav>
  <div class="timer" role="group" aria-label="計時器">
    <button type="button" id="timer-toggle" class="timer-btn">開始 30 分鐘</button>
    <output id="timer-display" class="timer-display" aria-live="polite"></output>
  </div>
</header>
<main id="lanes" class="lanes"></main>
<footer class="deck-footer">
  <section class="threads" aria-labelledby="threads-title">
    <h2 id="threads-title">跨線索</h2>
    <div id="threads-list" class="threads-list"></div>
  </section>
  <p id="deck-outro" class="deck-outro"></p>
  <section class="deep-list" aria-labelledby="deep-list-title">
    <h2 id="deep-list-title">回家想深讀</h2>
    <p id="deep-list-empty" class="deep-list-empty">還沒有標記任何一張卡。</p>
    <ul id="deep-list-items" class="deep-list-items"></ul>
    <button type="button" id="deep-clear" class="btn-secondary">清空清單</button>
  </section>
  <p class="footer-note">純靜態・無外部資產・狀態只存在你的瀏覽器</p>
</footer>
<div id="bottom-bar" class="bottom-bar" role="region" aria-label="閱讀進度與翻頁">
  <p class="bottom-status"><span id="progress-text" aria-live="polite">已讀 0/0</span><span class="bottom-sep" aria-hidden="true">・</span><span id="remaining-text">預估剩餘 0 分鐘</span></p>
  <div class="bottom-nav">
    <button type="button" id="nav-prev" class="nav-btn" aria-label="上一張">← 上一張</button>
    <button type="button" id="nav-next" class="nav-btn" aria-label="下一張">下一張 →</button>
  </div>
</div>
<script id="deck-data" type="application/json">{}</script>
<script src="./app.js" defer></script>
```

錯誤／未載入訊息：JS 在 `#lanes` 內放一段 `p.lane-message`（資料為 `{}`、空 lanes 或 JSON 壞掉時），CSS 置中淡色顯示。

JS 行為：`#theme-toggle` 切換 `light/dark`，`aria-pressed="true"` 表示目前深色，文字顯示「深色」／「淺色」（顯示目前狀態）。`#timer-toggle` 按下後文字變「停止計時」，`#timer-display` 每秒更新「已用 mm:ss／30:00」，超時後加 class `is-over` 並顯示「已超過 mm:ss」。`#deep-list-empty` 在清單非空時加 `hidden` 屬性。

### JS 渲染進 `#plan-bar` 的結構

```html
<a class="plan-item" href="#lane-arc" data-lane="arc">
  <span class="plan-name">ARC-AGI 與測試時適應</span>
  <span class="plan-meta"><span class="plan-min">7 分</span><span class="plan-count">25 篇</span></span>
  <span class="plan-progress" aria-label="已讀 1/4">1/4</span>
</a>
```

`.plan-item` 一列一條 lane（手機上等寬 grid）；`.plan-item.is-done` 表示該 lane 4 張卡全讀完。

### JS 渲染進 `#lanes` 的結構（每 lane 一個 section）

```html
<section class="lane" id="lane-arc" data-lane="arc" aria-labelledby="lane-arc-title">
  <header class="lane-head">
    <p class="lane-eyebrow">主線 1／4</p>
    <h2 class="lane-title" id="lane-arc-title">ARC-AGI 與測試時適應</h2>
    <p class="lane-meta">
      <span class="lane-minutes">7 分鐘</span>
      <span class="lane-count">25 篇</span>
      <a class="lane-deep" href="…" target="_blank" rel="noopener">深讀綜述 ↗</a>
    </p>
  </header>

  <article class="card card-gist" id="gist-arc" data-nav-index="0" tabindex="-1">
    <p class="card-kicker">全景要點</p>
    <p class="gist-summary">…</p>
    <ul class="gist-points"><li>…</li></ul>
    <p class="gist-open"><span class="tag tag-open">還沒解決</span> …</p>
  </article>

  <details class="lane-glossary">   <!-- glossary 缺席或空陣列時整段不產生 -->
    <summary>名詞白話（6 條）</summary>
    <dl class="glossary-list">
      <div class="glossary-item" id="gl-arc-0">
        <dt class="glossary-term">測試時訓練（Test-Time Training）</dt>
        <dd class="glossary-plain">…</dd>
      </div>
    </dl>
  </details>

  <article class="card card-paper" id="card-1911.01547" data-arxiv="1911.01547" data-lane="arc" data-nav-index="1" tabindex="-1">
    <header class="card-head">
      <span class="card-seq">1/4</span>
      <span class="tag tag-role">原典</span>
      <span class="card-year">2019-11</span>
    </header>
    <h3 class="card-title-zh">…</h3>
    <p class="card-title-en" lang="en">…</p>
    <p class="card-oneliner">…</p>
    <p class="card-plain"><span class="card-plain-label">白話</span>…</p>   <!-- plain 缺席時整段不產生 -->
    <p class="card-core">…</p>
    <p class="card-number">
      <span class="chip"><span class="chip-label">…</span><span class="chip-value">…</span></span>
      <span class="chip-note">作者自報</span>
    </p>
    <p class="card-why"><span class="card-why-label">為什麼必讀</span>…</p>
    <p class="card-links">
      <a class="link-btn" href="…" target="_blank" rel="noopener">arXiv ↗</a>
      <a class="link-btn" href="…" target="_blank" rel="noopener">摘要 ↗</a>
      <a class="link-btn" href="…" target="_blank" rel="noopener">翻譯 ↗</a>
    </p>
    <div class="card-actions">
      <label class="check"><input type="checkbox" class="read-toggle" data-arxiv="1911.01547"> <span class="check-text">已讀</span></label>
      <button type="button" class="deep-toggle" data-arxiv="1911.01547" aria-pressed="false">標記深讀</button>
    </div>
  </article>
  <!-- …共 4 張 card-paper … -->

  <aside class="lane-question">
    <p class="card-kicker">車上想一想</p>
    <p class="lane-question-text">…</p>
  </aside>

  <details class="lane-all">
    <summary>這條線全部 25 篇</summary>
    <div class="table-wrap">
      <table class="all-table">
        <thead><tr><th scope="col">arXiv</th><th scope="col">題名</th><th scope="col">狀態</th></tr></thead>
        <tbody>
          <tr><td class="all-id"><a href="…summarize/…" target="_blank" rel="noopener">1911.01547</a></td><td class="all-title">…</td><td class="all-status">✅</td></tr>
          <tr><td class="all-id"><a href="https://arxiv.org/abs/…" target="_blank" rel="noopener">…</a></td><td class="all-title">…</td><td class="all-status">⏳</td></tr>
        </tbody>
      </table>
    </div>
  </details>
</section>
```

行內名詞標記（JS 在該 lane 的 `.gist-summary`、`.gist-points li`、`.gist-open`、`.card-oneliner`、`.card-plain`、`.card-core`、`.card-why`、`.lane-question-text` 文字中，把出現的 glossary `term`（完整字串，或「（」之前的中文部分、長度 ≥ 2）換成行內按鈕；同一段落同一詞只標第一次）：

```html
…把 <span class="term" role="button" tabindex="0" data-term="0" aria-expanded="false">測試時訓練</span> 當成…
<!-- 點擊後（再點收回）：在按鈕之後插入 -->
<span class="term-pop" role="note"><span class="term-pop-term">測試時訓練（Test-Time Training）</span>…白話…</span>
```

`.term` 是行內 `span[role=button][tabindex=0]`（不用 `<button>`，因為 Chrome 把它當 inline-block 排版、長名詞會整塊掉行）；JS 接 click 與 Enter／Space；底線虛線、繼承字級與顏色；`.term[aria-expanded="true"]` 有選取態；`.term-pop` 是行內區塊（`display:inline-block` 或 `display:block; margin:.35em 0`），淡底、左細線。

狀態 class（JS 切換，CSS 呈現，且文字同步變化、不只靠顏色）：

- `.card-paper.is-read`：已讀；checkbox 勾選，`.check-text` 文字「已讀 ✓」。
- `.card-paper.is-deep`：深讀；`.deep-toggle` `aria-pressed="true"`、文字「已標記深讀 ★」。
- `.card.is-current`：底列「上一張／下一張」目前停留的卡（gist 卡與 paper 卡同列一序，`data-nav-index` 從 0 起全頁連號）。
- `.lane-all` 表格在手機上以 `.table-wrap { overflow-x: auto }` 橫向捲動，任何情況不可讓頁面橫向溢出。

### JS 渲染進 `#threads-list` 與 `#deep-list-items`

```html
<article class="thread">
  <h3 class="thread-title">…</h3>
  <p class="thread-text">…</p>
  <p class="thread-refs"><a class="thread-ref" href="#lane-arc">ARC-AGI 與測試時適應</a><a class="thread-ref" href="#card-1911.01547">1911.01547</a></p>
</article>

<li class="deep-item"><a href="#card-1911.01547"><span class="deep-item-title">…</span><span class="deep-item-id">1911.01547</span></a></li>
```

### 鍵盤

- `←`／`k`：上一張；`→`／`j`：下一張（焦點在 input／textarea／button 內時不攔截）。
- 所有互動元素都是原生 `a`／`button`／`input`，`:focus-visible` 有可見外框。

## 如何再加一個 deck

1. 內容側依 `SCHEMA.md` 產出新的 `deck.json`（新的 `deck_id`）。
2. 複製 `symbolic-arc-automata.html` 為 `<deck_id>.html`，用 `inline_deck.py <deck.json> <deck_id>.html` 灌資料；`app.js` 與 `styles.css` 不用改（讀 `deck_id` 做 localStorage 命名空間）。
3. 在 `index.html` 的 `.deck-list` 加一列 `a.deck-row` 指向新頁。
4. `.github/workflows/pages.yml` 不必改（本目錄第一層 html/css/js 已整目錄登記）。

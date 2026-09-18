# deck.json 資料契約（SCHEMA）

一個 deck 一個 `data/<deck_id>.json`，用 `python3 data/inline_deck.py data/<deck_id>.json` 灌進 `<deck_id>.html` 的 `<script id="deck-data">`。頁面完全資料驅動：lane 數、卡數、all_papers 列數都由 JSON 決定。`app.js` 讀不到的欄位一律忽略；缺席的可選欄位不渲染、不報錯。本檔由既有 `symbolic-arc-automata.json` 與 `app.js` 反推而成，改欄位先改本檔再改 `app.js`。

## 頁面依賴的欄位（摘要）

頁面只依賴下列欄位（各欄細則見下方各表）：

```text
deck: deck_id, title, subtitle, total_minutes, intro, lanes[], threads[], outro
lane: id, name, minutes, paper_count, deep_doc,
      gist{summary, points[], open}, highlights[4], question, all_papers[]
highlight: arxiv_id, title_zh, title_en, year, role, one_liner, plain?, core,
           number{label, value, note}, why, links{arxiv?, summary, translate?, transcript?}
lane 另有可選 glossary?: [{term: "中文（English）", plain: "≤60 字"}] × 4～8
all_papers 列: arxiv_id, status, title_zh, cat, summary_file|null, translate_file|null, url?, label?
thread: title, text, lane_ids[], paper_ids[]
```

- `all_papers` 各列連到 `https://github.com/justty32/paper_readings/blob/main/summarize/<summary_file>`；`summary_file` 為 `null` 時只放 arXiv 連結 `https://arxiv.org/abs/<arxiv_id>`。可選 `url`（絕對網址）優先於前兩者、`label` 取代第一欄顯示的 id——給非 arXiv 條目（Ndea 訪談 `ndea-01`～`ndea-14`）用。
- `links.transcript`（可選）渲染成「逐字稿 ↗」；缺哪個連結就不渲染哪個按鈕。
- `plain`（可選，≤80 字）：「用你的話說，這篇等於……」，渲染在 `one_liner` 之後、`core` 之前，視覺上是一句側註。
- `glossary`（可選，4～8 條）：該線生僻名詞的白話解釋，渲染成全景卡之後的「名詞白話」`<details>`（標題顯示條數）；卡片正文中出現的 `term` 會被標成可點的行內按鈕，點了在原地展開該條白話。
- 兩個欄位缺席時不渲染、不報錯（舊資料相容）。
- 頁面完全資料驅動：lane 數、卡數、all_papers 列數皆由 JSON 決定，不寫死 4 或 16。
- 灌資料：`python3 data/inline_deck.py data/<deck_id>.json [<html>]`（把 JSON 安全跳脫後寫進 `#deck-data`，可重複執行，回讀比對）；`python3 data/validate_deck.py data/*.json` 做契約檢查。

## 頂層 deck

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `deck_id` | string | 是 | `[a-z0-9-]+`；同時是檔名 `<deck_id>.html`／`.json` 與 localStorage 命名空間 `pb:<deck_id>:*` |
| `title` | string | 是 | 頁面 `<h1>`；建議 ≤ 20 字，形如「○○・○○ 三十分鐘速覽」 |
| `subtitle` | string | 是 | 一句副標（涵蓋範圍＋「車上版」之類的定位） |
| `total_minutes` | int | 是 | 計時器上限（固定 30）；lane `minutes` 合計應 ≈ 30（29～31 可） |
| `intro` | string | 是 | 開場一段（≤ 160 字）：這幾條線共同在問什麼、建議讀的順序 |
| `lanes` | lane[] | 是 | 主線，至少 1 條；上限沒寫死，但一個 deck 30 分鐘建議 3～4 條 |
| `threads` | thread[] | 是 | 跨線索，建議 2～3 條 |
| `outro` | string | 是 | 收尾一段（≤ 120 字） |

## lane

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | 是 | `[a-z0-9-]+`，deck 內唯一；DOM id 用 `lane-<id>`、`gist-<id>` |
| `name` | string | 是 | 主線名（≤ 16 字） |
| `minutes` | int | 是 | 這條線的預估分鐘；底列「預估剩餘」按 `minutes × 未讀卡/卡數` 無條件進位 |
| `paper_count` | int | 是 | 必須等於 `all_papers.length` |
| `deep_doc` | string(URL) | 是 | 「深讀綜述 ↗」的連結。有對應 `deep/` 綜述 → 該綜述母檔或最貼切的章節檔；沒有 → 指向該 index 類別／子主題檔（例如 `https://github.com/justty32/paper_readings/blob/main/index/cat_i/10_world_models.md`） |
| `gist` | object | 是 | 全景卡：`summary`（≤ 150 字）、`points`（string[]，3～4 條，各 ≤ 60 字）、`open`（≤ 100 字；**不要**自帶「還沒解決」四字，頁面會加標籤） |
| `glossary` | {term, plain}[] | 否 | 名詞白話 4～8 條。`term` 形如「中文（English）」（≤ 30 字），`plain` ≤ 60 字。頁面會把卡片正文中出現的 `term`（或「（」前的中文部分，≥ 2 字）標成可點行內按鈕；所以 `term` 的中文部分要是正文真的會用到的寫法 |
| `highlights` | highlight[] | 是 | 必讀卡，固定 4 張；`arxiv_id` 必須出現在同一 lane 的 `all_papers` |
| `question` | string | 是 | 「車上想一想」一題開放問題（≤ 60 字） |
| `all_papers` | row[] | 是 | 這條線的全清單（摺疊表格） |

## highlight（必讀卡）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `arxiv_id` | string | 是 | DOM id `card-<arxiv_id>`、已讀／深讀狀態鍵；非 arXiv 條目用穩定代號（訪談用 `ndea-01`～`ndea-14`） |
| `title_zh` | string | 是 | 中文短題（≤ 18 字，可與 index 的長題不同，要白話） |
| `title_en` | string | 是 | 英文原題（arXiv 題名；訪談用影片題名） |
| `year` | string | 是 | `YYYY-MM`（arXiv id 前四碼即年月：`2505.22954` → `2025-05`）；非 arXiv 條目用發佈年月（Ndea 訪談卡取 YouTube 頁面 `publishDate`，查得的網址與日期記在 archive/驗收紀錄.md），查不到就給空字串 `""`（頁面不渲染），**不得猜** |
| `role` | string | 是 | 這張卡在該線的角色標籤（≤ 8 字），例：原典、範式代表作、誠實冷水、定位入口 |
| `one_liner` | string | 是 | 一句話（≤ 50 字）：誰做了什麼、得到什麼 |
| `plain` | string | 否（本專案一律要給） | 「用你的話說，這篇等於……」（≤ 80 字）；給完全外行的人 |
| `core` | string | 是 | 核心做法／結果（≤ 120 字），可含 1～2 個數字 |
| `number` | {label, value, note} | 是 | 一個關鍵數字：`label` ≤ 12 字、`value` ≤ 16 字、`note` 固定「作者自報」（訪談卡用「講者自述」；數字出自第三方複現時用「複現者自述」）；數字必須能在 `summarize/` 摘要裡找到，找不到就換一個能找到的數字 |
| `why` | string | 是 | 為什麼必讀（≤ 60 字） |
| `links` | object | 是 | `arxiv`（`https://arxiv.org/abs/<id>`）、`summary`（GitHub summarize 檔）、`translate`（GitHub translate 檔）；可選 `transcript`（訪談逐字稿）。缺哪個就不渲染哪個按鈕；訪談卡只給 `summary`＋`transcript` |

GitHub 連結基底：`https://github.com/justty32/paper_readings/blob/main/`＋相對路徑；`summarize/`、`translate/` 檔名含中文與全形句點，直接串接不 percent-encode（瀏覽器會處理）；`video/` 底下的檔名含空格與 `'`，**要** percent-encode（照 `index/video.md` 內既有的寫法）。

## row（all_papers 一列）

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `arxiv_id` | string | 是 | 同上；表格第一欄顯示文字（可被 `label` 覆蓋） |
| `label` | string | 否 | 第一欄顯示文字（非 arXiv 條目用，例：「第 3 集」） |
| `status` | string | 是 | index 的狀態圖示：`✅` 摘要+翻譯、`🔶` 已摘要、`⬜` 待處理 |
| `title_zh` | string | 是 | index 的中譯題名（原樣照抄，含括號） |
| `cat` | string | 是 | index 類別字母 `A`～`J`；訪談 `V` |
| `summary_file` | string\|null | 是 | `summarize/` 檔名；連結＝基底＋`summarize/`＋檔名。`null` 且無 `url` → 連 `https://arxiv.org/abs/<arxiv_id>` |
| `translate_file` | string\|null | 是 | `translate/` 檔名（頁面目前不用，留給資料完整性） |
| `url` | string | 否 | 絕對網址，優先於 `summary_file`（非 arXiv 條目用） |

不變式：每個 deck 內 `arxiv_id` 不重複；全站所有 deck 的 `all_papers` 聯集＝`paper_readings/index/` 全庫（627 條：A～J 613 ＋ 訪談 14），每條恰好出現在一個 deck。

## thread（跨線索）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `title` | string | ≤ 24 字 |
| `text` | string | ≤ 120 字 |
| `lane_ids` | string[] | 引用的 lane `id`（渲染成 `#lane-<id>` 膠囊） |
| `paper_ids` | string[] | 引用的 `arxiv_id`，渲染成 `#card-<id>` 膠囊；**不是本 deck 必讀卡的 id 會被頁面略過**（不渲染），所以只列必讀卡 |

## 內容規則（寫給產資料的線）

1. 繁體中文、白話優先；卡片正文避免未解釋的縮寫，生僻詞放進 `glossary` 並在正文用同樣寫法。
2. **數字只能來自 `summarize/`（或訪談 `video/summarize/`）**，`number.note` 一律「作者自報」；不得把自己的推論寫成作者自陳；不確定就不寫數字。
3. 標點：中文散文用全形；數學式、程式、英文題名內部用半形。
4. `gist.open` 不帶「還沒解決」前綴；`role` 不重複用同一個詞超過兩次。
5. 檔案：UTF-8、縮排 2、`ensure_ascii=False`。

## 工具

- `python3 data/inline_deck.py data/<deck_id>.json [<html>]`：灌入（可重複執行，回讀比對）。
- `python3 data/inline_deck.py --extract <html> <out.json>`：從頁面抽回 JSON。
- `python3 data/validate_deck.py data/<deck_id>.json`：契約檢查（欄位、長度、連結對應到 paper_readings 本機檔、highlights ⊂ all_papers、paper_count、threads 引用）。

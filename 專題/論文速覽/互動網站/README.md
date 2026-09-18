# 論文速覽：手機優先的閱讀型靜態網站

直接以瀏覽器開啟 [index.html](index.html) 即可；所有資產都在本目錄，離線可用、零外部依賴。
線上版：<https://justty32.github.io/engineer_study/paper-briefs/>（slug `paper-briefs`）。

本站是「閱讀頁」不是課程頁：讓讀者在車上用手機、單手、30 分鐘讀完一個 deck（幾條主線 × 每線一張全景卡 + 4 張必讀卡）。資料來源是 [paper_readings](https://github.com/justty32/paper_readings) 的 `deep/`、`summarize/`、`translate/`；本站不重述論文，只給骨架與連結。

## 頁面地圖

| 檔案 | 責任 |
|------|------|
| `index.html` | deck 總覽：列出所有 deck 並連進去（5 個） |
| `symbolic-arc-automata.html` | deck「ARC・符號・自動機」（A+B、C、E、F 類，4 線 151 篇）的閱讀頁；資料內嵌於 `<script id="deck-data">` |
| `evolution-program-synthesis.html` | deck「演化・程式合成・自我改進」（D、G、H、J 類，4 線 101 篇） |
| `agent-skills-cost-decoding.html` | deck「技能庫・成本・受限解碼」（I 類子主題 01、01z、02、03，3 線 128 篇） |
| `agent-loop-workflow-memory.html` | deck「自我改進・工作流・記憶」（I 類子主題 08、04、05+06、09，4 線 193 篇） |
| `nesy-binary-worldmodel-ndea.html` | deck「二值・世界模型・訪談」（I 類子主題 07、10 ＋ Ndea 訪談 14 集，3 線 54 條） |
| `data/SCHEMA.md` | deck.json 完整資料契約（頁面依賴欄位摘要、欄位、上限、連結規則、內容鐵律） |
| `data/<deck_id>.json` | 各 deck 的資料真相層；閱讀頁的 `#deck-data` 由它灌入 |
| `data/inline_deck.py` | 灌資料（`deck.json` → `<deck_id>.html`）／`--extract` 抽回 |
| `data/make_page.py` | 從 `symbolic-arc-automata.html` 複製出新 deck 頁（改 title／description）並灌資料 |
| `data/validate_deck.py` | 契約檢查：欄位、字數、連結對應 paper_readings 本機檔、必讀卡 ⊂ 全清單、paper_count |
| `styles.css` | 全站共用樣式（手機優先、深色模式、無動畫偏好） |
| `app.js` | 閱讀頁邏輯：讀 `#deck-data` 渲染、已讀／深讀狀態、上一張／下一張、計時器、主題切換 |
| `README.md` | 本檔：頁面地圖、如何再加一個 deck |
| `DOM-CONTRACT.md` | DOM 契約：Shell 與 JS 的唯一介面（骨架、id／class、localStorage 鍵、狀態 class、鍵盤） |
| `archive/驗收紀錄.md` | 已執行的檢查與證據；沒證據的項目不標通過（已封存） |

## 資料契約與 DOM 契約

- 資料契約（deck.json 欄位、上限、連結規則、頁面依賴欄位摘要）：[data/SCHEMA.md](data/SCHEMA.md)。
- DOM 契約（Shell 與 JS 的唯一介面；新增 id／class 先改契約再實作）：[DOM-CONTRACT.md](DOM-CONTRACT.md)。

## 如何再加一個 deck

1. 內容側依 [data/SCHEMA.md](data/SCHEMA.md) 產出 `data/<deck_id>.json`（新的 `deck_id`）；`python3 data/validate_deck.py data/<deck_id>.json` 到 errors=0。
2. `python3 data/make_page.py data/<deck_id>.json`：複製 `symbolic-arc-automata.html` 為 `<deck_id>.html`、改 title／description、灌資料；`app.js` 與 `styles.css` 不用改（讀 `deck_id` 做 localStorage 命名空間）。之後改資料只要重跑 `python3 data/inline_deck.py data/<deck_id>.json`。
3. 在 `index.html` 的 `.deck-list` 加一列 `a.deck-row` 指向新頁（標題、副標、「N 條主線・M 張必讀卡・30 分鐘」）。
4. `.github/workflows/pages.yml` 不必改（本目錄第一層 html/css/js 已整目錄登記；`data/` 不部署，只是來源）。
5. 全站不變式：所有 deck 的 `all_papers` 聯集＝paper_readings `index/` 全庫、每條恰好一次（目前 627＝151＋101＋128＋193＋54）。

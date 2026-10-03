# 審稿報告：GitHub Pages 站台組裝與跨課一致性（37 門，2026-09-26）

審稿範圍：`.github/workflows/pages.yml`、`互動學習網站/index.html`＋`styles.css`、根 `README.md`、37 門互動課的 `index.html`／`*.css`／`*.js`（只看組裝與一致性，不審課程內容）。方法：在 scratchpad 依 pages.yml 邏輯模擬組站（複製＋replacements 改寫），再對 `_site` 所有 html 的 href/src 相對路徑逐一比對檔案存在性。
**未完成註記**：因使用者提前關機而中止。已完成 (1)(2)(4)(5) 全量掃描與 (3) 的 37 門矩陣比對；(6) UX 只寫到入口與導航層，未及各課章節頁的行動端版面實測；(3) 的「進度儲存 key」只抓到直接呼叫 localStorage 的 12 門，未逐一解出以變數命名的 key 值。

## 總評

組裝面是健康的：課程表 37 條來源目錄全部存在、皆有 index.html；replacements 25 組規則全部命中、無多餘規則、slug 全在課程表內；模擬組站後 **0 個壞連結**；入口 37 連結、README 37 條線上 slug、課程表 37 slug 三者集合完全一致，無漏掛、無掛了不存在的。
主要弱點在跨課一致性：37 門有 4 套字型堆疊、4 套標題命名慣例、3 套 localStorage key 命名；深色模式只有 4 門有（入口本身沒有）；返回入口一律寫死線上絕對網址，本地開 index.html 時「回主站」會跳到網路；`攻擊手法細講` 沒有自己的 CSS、跨目錄依賴 `網路安全/互動課程/styles.css`；`AI理論白話` 6 頁從 cdnjs 載 mermaid，與入口頁尾「無外部資產」宣稱矛盾。
入口是 37 列無分組、無搜尋、無學習順序的扁平清單，README 反而有領域分組——兩者應對齊。

## 部署與課程表問題

- `.github/workflows/pages.yml:99-136` ｜低｜課程表 37 條與實際目錄全數對應，無漏掛、無不存在路徑；`find -maxdepth 1` 不遞迴，每門課的 `archive/`（37 門皆有）與論文速覽 `data/`（JSON＋build 用 py）不會發布，且無任何 html 引用這兩種子目錄，屬正確行為｜無需修，但把「archive/ 與 data/ 不發布」寫進第 76 行註解，避免日後有人在 html 引用。
- `.github/workflows/pages.yml:140-253` ｜低｜replacements 是純字串取代、對整份 html 全域套用；目前 25 組規則皆有命中且無多餘，但沒有任何「規則未命中」或「_site 內仍殘留 `../<中文>/`」的檢查，未來新增課程漏寫規則時會靜默壞鏈｜組站後加一步 `grep -rl '\.\./[^"]*[一-龥]' _site && exit 1`，並對每條規則統計命中數為 0 時發 `::warning`。
- `.github/workflows/pages.yml:15-43` ｜低｜觸發 paths 只列 html/css/js，論文速覽的 `data/*.json` 改動不會觸發（但 data 本來就不發布、內容已 inline 進 html，故僅在「改 data 沒重跑 make_page.py」時產生落差）｜在論文速覽 README 註明「改 data 後必須重新產 html 才會部署」。
- `.github/workflows/pages.yml:110` ＋ `專題/網路安全/攻擊手法細講/`（無 styles.css） ｜中｜`attack-techniques` 全部 14 頁 `<link href="../互動課程/styles.css">` 跨目錄依賴 `network-security` 的 CSS，靠 replacements 改成 `../network-security/styles.css` 才成立；若 `network-security` 改版或改 slug，攻擊手法細講會整站無樣式且組站不會報錯｜複製一份 styles.css 進攻擊手法細講目錄，或在組站後加「每個 slug 目錄至少有一個 css 或 index.html 內有 `<style>`」檢查。
- `.github/workflows/pages.yml:73-74` ｜低｜主站只複製 index.html 與 styles.css，若日後入口加 js（搜尋、篩選）會漏｜改成與課程相同的 `find -maxdepth 1 html/css/js` 複製。
- `互動學習網站/index.html:284` ｜中｜頁尾宣稱「純靜態部署 · 無外部資產」，但 `專題/AI理論白話/互動課程/` 有 6 頁自 `https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js` 載入，離線或封鎖 CDN 時流程圖不顯示｜把 mermaid.min.js 隨課程目錄 vendoring（pages.yml 會自動複製 `*.js`），或改頁尾文字。

## 入口與壞連結

- `互動學習網站/index.html:30-278` ｜低｜37 個 `href="./<slug>/"` 全部對應課程表 slug，模擬組站後每個目錄都有 index.html；第 26 行「目前 37 個可用主題」數字正確｜無需修。
- `_site/**/*.html`（模擬組站） ｜低｜相對路徑 href/src 掃描 0 個壞連結；跨課連結（共 24 門、約 500 處）全部被 replacements 改寫到正確 slug；無殘留 `.md` 相對連結（僅 AI 理論白話有 131 個指向 GitHub/arXiv 的外部連結，未逐一驗證可達性）｜無需修。
- `互動學習網站/index.html:30-278` ｜中｜入口每列文案由各課自帶，長度從 1 行（機器人視覺）到 4 行（作業系統、微處理機、電子學），且第 30-98 行的 IoT 條目用多行縮排、第 100 行起改成單行壓縮 HTML，兩種寫法混雜｜統一每列摘要 ≤ 60 字，多的移到課程首頁；HTML 排版擇一。
- `互動學習網站/index.html` vs `README.md:106,110` ｜低｜兩處課名不同步：入口「AI 理論白話」／README「AI 理論白話（閱讀型導讀）」；入口「論文速覽」／README「論文速覽（paper_readings 全庫 627 條、五個 30 分鐘手機閱讀 deck）」；其餘 35 門名稱完全一致｜以入口為準，README 括號說明移到行尾。
- `互動學習網站/index.html` vs 各課 `<title>` ｜低｜入口名稱與課程頁標題不一致的例：入口「板級介面與工業匯流排」→ 課頁 `<h1>30 分鐘搞懂板級通訊`／`<title>30 分鐘搞懂 I²C、SPI…`；「微控制器與韌體核心」→ title 加「資深 C++ 工程師課程」；「AI 理論白話」→ h1「參考理論・白話介紹 — 索引」；「網路安全零基礎課程」→ h1「先看懂系統，才談攻防」；「IoT 聯網裝置」→ title「IoT 聯網裝置工作台」｜課頁 `<title>` 統一為「<入口課名>｜互動課程」，h1 可保留自訂副標。
- `專題/論文速覽/互動網站/*.html`（5 個 deck 頁） ｜低｜只有 index.html 有「回到工程學習主站」，5 個 deck 頁只回 deck 總覽，是全站唯一章節頁無中央入口連結的課｜deck 頁 topbar 加同樣的 `main-site-link`。
- `README.md:49-110` ｜低｜README 的 37 條本地連結 `<目錄>/index.html` 全部存在，線上 slug 與課程表一致，「目前 37 門」正確｜無需修。

## 跨課一致性

- 返回入口（37/37 門） ｜中｜全站統一用 `<a class="main-site-link" href="https://justty32.github.io/engineer_study/">← 回到工程學習主站`，寫死線上絕對網址；README 第 47 行說「本地用瀏覽器直接開 index.html 即可」，但本地開課程時按「回主站」會離開本機跳到網路，且 fork／改 repo 名即全壞｜改成相對 `../`（組站後 `_site/<slug>/../` 就是入口），本地時再由 pages.yml 或各課自行處理；或至少入口頁改讀 `location` 動態決定。
- 字型堆疊（4 套） ｜中｜25 門 `"Microsoft JhengHei",system-ui,sans-serif`（Windows 優先）；5 門 IoT 家族 `"Noto Sans TC","PingFang TC"/"Microsoft JhengHei"`；4 門（入口、iot-rf-antenna、iot-security-production、network-security）`Inter, ui-sans-serif, system-ui…`（Inter 未載入，實際落到系統字）；4 門（iot-mcu-firmware、network-protocols、reverse-engineering、paper-briefs）`system-ui` 優先。跨課切換時字型會跳｜訂一條全站堆疊（建議 `system-ui, -apple-system, "Segoe UI", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`）寫進入口 styles.css 當範本。
- 深色模式（4/37） ｜中｜只有 network-protocols、reverse-engineering（`prefers-color-scheme` 自動）與 ai-theory-primer（toggle，key `ai-theory-theme`）、paper-briefs（toggle，key `pb:theme`）支援；入口 `styles.css:2` 寫死 `color-scheme: light`，其餘 33 門無。從入口（亮）進 network-protocols（暗）再進 linux（亮）體驗跳動；兩門有 toggle 的 key 名不同、互不記憶｜先決定全站要不要深色；若要，入口與各課至少加 `prefers-color-scheme` 媒體查詢，toggle 的 key 統一為 `engineerStudy.theme`。
- 進度／狀態儲存 key（3 套命名） ｜中｜IoT 家族與電力系統用 `engineerStudy.<camelCase>.v1`（8 門，有版本號）；ai-theory-primer 用 `ai-theory-theme`；paper-briefs 用 `pb:*`（12 處）；電磁學、微處理機各 1 處用變數 `KEY`／`key` 未解出；其餘 25 門完全不存進度（重整即歸零）｜統一前綴 `engineerStudy.<slug>.v1`，並考慮讓 25 門零基礎課至少存「已完成章節」。
- 標題命名（4 套） ｜低｜`<title>` 慣例：「課程地圖｜X」（物理、電路、電子、電磁、信號）、「X（零基礎互動課）」（邏輯、微處理機、控制、電機機械、通訊、電力電子、馬達、數位通訊、作業系統、Linux、工程數學）、「課程首頁｜X」（機器人路徑／視覺／學習）、「X｜互動學習」（IoT 知識群 4 門）、其餘自由發揮｜統一為「X｜互動課程」或「X（零基礎互動課）」二選一。
- viewport ｜低｜36 門 `width=device-width, initial-scale=1`（有無空格兩種寫法混用），paper-briefs 多 `viewport-fit=cover`；lang 全為 `zh-Hant`｜無實質問題；順手統一字串。
- CSS／JS 檔案佈局 ｜低｜35 門 `styles.css`＋`app.js` 單檔；iot-hardware-bus 拆 8 個 js（gpio/i2c/spi/rs485…）；iot-mcu-firmware 用 `course.js`＋`glossary.css`；attack-techniques 無 css（見上）；paper-briefs index 有 1 段 inline `<script>`｜非問題，但新課模板應固定 `styles.css`＋`app.js`。
- 導航元件 ｜低｜36 門 index 有 `<nav>`，paper-briefs 無；`<aside>` 只有 iot-device、iot-hardware-bus、ai-theory-primer 三門；上一章／下一章：8 門偵測不到（network-protocols、operating-systems、linux、robot-learning、robot-math、digital-communications 等），章節頁只能靠回 index 跳章｜零基礎主線課至少要有上一章／下一章。
- 最不一致的幾門（依上述維度偏離主流數） ｜—｜(1) `攻擊手法細講`：無自有 CSS、無字型宣告、無深色、跨目錄依賴；(2) `論文速覽`：無 nav、deck 頁無主站連結、獨有 `pb:` key、獨有 viewport-fit、獨有深色 toggle；(3) `AI理論白話`：外部 CDN、獨有 theme key、標題格式獨特；(4) `IoT 聯網裝置` 5 門與 `微控制器與韌體核心`：字型堆疊、檔案佈局、標題格式各自成一派｜優先處理 (1)(2)，其餘納入模板化一次收斂。

## UX 建議

- 入口太長：37 列扁平清單一頁滾到底，且順序是「加入時間」而非學習順序（IoT 排 01-09、共通基礎的工程數學／物理排到 17-18）｜依 README 現有分組（共通基礎／電機／IoT／資安／機器人／AI／論文）分區，區內依先修順序排；每區可摺疊。
- 缺學習順序引導：pages.yml 的 replacements 已隱含一張先修圖（電路→電子→邏輯→微處理機；數學→信號→控制→通訊→數位通訊；機器人數學→運動學→規劃／視覺／學習），入口完全沒呈現｜每列加「先修：xx」標籤，或頂部放一張純文字的建議路線（例：零基礎電機線＝數學→物理→電路→電子→信號→控制→通訊）。
- 缺搜尋／篩選：37 門無法依關鍵字或領域過濾｜入口加一個純前端 `<input>` 即時過濾（入口目前無 js，需同步改 pages.yml 第 73-74 行複製規則）。
- 缺全站進度：只有 8 門存 localStorage，入口「可開始」狀態 37 列全部相同、無資訊量｜統一 key 後入口可讀各課進度顯示「已完成 n/m 章」。
- 「回主站」語意：課程頁按鈕文字「回到工程學習主站」、aria-label「回到工程學習中央入口」、入口 h1「工程學習中央入口」，三個名稱｜統一用「中央入口」。
- 行動端：入口 `site-shell` 用 `min(100% - 40px, 980px)` 與 320px 最小寬，OK；但各課章節頁的行動端版面未在本次實測（未完成）。
- 外部資源與離線：入口宣稱無外部資產，是好的定位；建議把它變成組站檢查（`grep -rE 'https?://[^"]*\.(js|css)' _site` 非空即警告），目前會抓到 AI 理論白話的 mermaid。

# publish — 把課程發布到 GitHub Pages

[interactive-study-site](README.md)｜[WORKFLOWS](../../WORKFLOWS.md)｜驗收關卡 [QUALITY-GATES](QUALITY-GATES.md)

把驗收完的課程掛上 `https://justty32.github.io/engineer_study/`。這一步**只處理發布**，不改內容。部署設定在 `.github/workflows/pages.yml`，中央入口在 `互動學習網站/index.html`。

**何時用**：內容已過 [QUALITY-GATES](QUALITY-GATES.md)，要給別人看得到。
**何時不用**：課程只給自己或本機用；還沒驗收完 → 先驗收。

## Done when

- 每個公開檔案（總入口、各課的 HTML／CSS／JS）都回傳 HTTP 200。
- 部署頁面沒有外部執行期請求。
- 實際網址、commit、workflow run 與行動裝置驗證結果寫進該課 `驗收紀錄.md`。

## 契約

<!-- wf-nav -->
- **只發布成品**：HTML、CSS、JavaScript 與必要資產。`PROJECT-BRIEF.md`、`BUILD-SPEC.md`、`派工計畫.md`、`驗收紀錄.md`、工作流檔一律**不發布**。
- **單一入口**：整站一個總入口頁（`互動學習網站/index.html`），各課掛在自己的 slug 底下。
- **slug 表在 `pages.yml`**：組站步驟的 heredoc 課程表，一行一課 `<來源目錄>|<slug>`，由 `while IFS='|' read` 驅動 `copy_course`；slug 用穩定的 ASCII 路徑，別跟著課名改。列出的來源缺檔會以 `::error::` 中止建置，不會靜默跳過。
- **原始碼留在來源目錄**：GitHub Actions 只在 runner 上把成品組成 `_site/` artifact，不把產物複製回 repo，也不把整個筆記庫當站台根目錄。
- **不假設部署在網域根目錄**：課內資產一律相對路徑（`./styles.css`、`./app.js`）。跨課連結在組站時依 `replacements` 改寫。
- **HTML 不連 `.md`**：原始筆記若要公開，用 GitHub blob URL；只作開發來源的就不顯示成 Pages 內的失效相對連結。
- **Actions 限制**：runner 只用官方 `actions/checkout`、`configure-pages`、`upload-pages-artifact`、`deploy-pages`；不執行 `npm install`、不抓圖片、不建置框架，只做複製與組裝。觸發條件是萬用路徑且只列 `html/css/js`（改規劃用 Markdown 不觸發）；同一分支有 concurrency cancellation，不會重複部署。本地端不安裝任何套件。

| 新增一門課要動 | 動作 |
|---------------|------|
| slug 表 | `pages.yml` 課程表加一行 `<來源目錄>|<slug>` |
| 觸發路徑 | `on.push.paths` 已是萬用路徑，通常不必動；來源目錄若在新的頂層資料夾才要加 |
| 跨課連結改寫 | 該課若用 `../../<其他課>/互動課程/` 形式連別課，在 Python `replacements` 對應 slug 下加一條「來源相對路徑 → `../<slug>/`」（例：機器人四門課的 `../../機器人數學基礎/互動課程/` → `../robot-math/`）|
| 總入口 | `互動學習網站/index.html` 加一個連到新 slug 的入口；來源主題 README 加網站入口 |

## 流程

1. **發布前確認**（不可自作主張）：`origin` 是使用者指定的 GitHub repo、分支與預期發布分支一致、GitHub CLI 帳號與 repo visibility 正確、Pages 是否已有 source／custom domain／既有 deployment。**任何一項與現況衝突就停下來問**，不得覆蓋。守鐵律 3（授權來源）。
2. 確認工作樹只含本案與使用者已知的變更，commit 與 push 範圍列得出來；push 等使用者確認。
3. 部署，等 workflow 與 Pages deployment 跑完，**不重複觸發**。
4. **驗證**：逐一請求總入口與各課的 HTML／CSS／JS，確認全部 HTTP 200；檢查沒有外部請求；在行動寬度（約 `390px`）確認模組導航、數字輸入、狀態機、重設與進度保存可用。
5. 把網址、commit、workflow run 與驗證結果寫進 `驗收紀錄.md`；跑不了的（真人實機觸控）記 [WAIT_USER](../../WAIT_USER.md)。

## 交接

- 發布後才發現內容要補 → [ENRICH-EXISTING](ENRICH-EXISTING.md)（只加厚文字）或回 [interactive-study-site](README.md)。
- 部署設定與帳號權限要使用者動手 → [WAIT_USER](../../WAIT_USER.md) 一行；為什麼 `pages.yml` 改成表驅動、樣式為什麼不部署時共用 → [decisions](../decisions.md)。

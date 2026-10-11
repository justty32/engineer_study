# 微積分 ELI5 新站交接

使用者於 2026-10-11 compact 後指定「來做微積分」，延續新建網站、保留舊站、繁中 ELI5、大量圖解、可重排章節補內容、查證並修正原文錯誤、主要委派 agents、自由 push／部署的授權。線性代數為下一個題目，本輪不開工。

## 範圍與領地

新來源為 `共通基礎/數學/圖解微積分/`，成品只放 `dist/`，公開 slug 為 `calculus-little-lab`。既有 `共通基礎/數學/互動課程/` 不改。模型沿用本輪可用 Codex 模型；Claude 模型名稱不適用此執行環境，不虛報使用或成本。

- root：調度、工作流狀態、Sites 註冊與部署；不寫產品。
- calculus_builder：新站產品與規格，排除 `.openai/` 與 `驗收紀錄.md`；最多四個子作者，按檔案互斥，子線契約放新站派工資料檔。
- calculus_audit：只改 `共通基礎/數學/01-微積分.md` 的已查證錯誤；查核資料留 `/tmp/calculus-audit/`，統一外部研究。
- calculus_qa：只寫新站 `驗收紀錄.md`；測試與 headless 截圖留 `/tmp/calculus-qa/`。
- calculus_clarity：唯讀抽審五個代表頁的 ELI5 教學順序，報告留 `/tmp/calculus-clarity.txt`，無 repo 寫入權。
- calculus_publish：`.github/workflows/pages.yml`、`互動學習網站/index.html`、`共通基礎/README.md`；root 放行後精確 commit／push／驗證部署，最終收線檔再串行移交。

不得改使用者未追蹤 `nvim.log`，不得安裝依賴、開 GUI、搶焦點、操控鍵鼠或截桌面。QA 可使用現有 headless Chromium 與 Playwright。外部教材查證走 web 工具，每批至多四頁一手來源，root 審核後進下一批。引用連結允許；禁止外部執行期資源與點陣圖片。

## 驗收

1. 新站具首頁、零基礎起點、分章圖解與互動、可搜尋字典、來源；本地原文核心範圍可追溯，不只做導數單一展示。
2. 全部 HTML／CSS／JS 語法、UTF-8、相對連結與 fragment 通過，所有互動具預設／邊界／重設與因果回饋。
3. 全頁 PC 1440×900、手機 390×844 與首頁 320 寬檢查；鍵盤、離線、零執行期外部請求、零 console／JS／HTTP 失敗。
4. 數學獨立重算與原文查核完成；原文修正標示來源與條件，真人實機範圍如實列待人工。
5. GitHub Pages workflow 成功，所有新成品 HTTP 200 且與本地雜湊一致；舊工程數學與 IoT 站入口仍正常。Sites 另回報成功部署 URL。
6. `sync-styles.py --check` 通過；`wf-lint` 不增加基線缺陷。開工基線為 `broken=2`，兩筆歷史審稿引用死連結，詳 `/tmp/calculus-wf-baseline.txt`。

## 完成證據（2026-10-11）

六項驗收均有證據。新站含 16 HTML、16 JavaScript、1 CSS，共 33 個成品檔；首頁與 13 個章節提供 14 組可操作實驗，另有 32 詞搜尋字典與來源頁。立案與建置契約存在，全部語法、UTF-8、475 個相對連結與 fragment 通過。舊工程數學及 IoT 主站、圖解站與知識群網站相對開工版本 `ba7d537` 差異為零。

獨立 QA 的 1,547 項主驗證、26 項修正複驗及 4 項選項文寬複查均通過；16 頁 × PC／手機共 32 次載入，另驗首頁 320 px。數學結果以獨立差分、數值積分等方法重算，全部主實驗預設、邊界與重設通過，外部執行期請求及 console／JavaScript／HTTP 失敗為零。數學審稿與 ELI5 抽審無未決項。完整結果見 [新站驗收紀錄](../../../共通基礎/數學/圖解微積分/驗收紀錄.md)。

原文僅修改 `01-微積分.md`：5 處必要修正或條件補齊，以及 2 處教學澄清；沒有把全部改動稱為計算錯誤。查證依據及模型條件已交建置者，來源頁附 OpenStax 與 MIT 官方教材。共用樣式檢查 17 門一致、0 漂移、0 缺檔；工作流 lint 仍只有開工基線的 2 個歷史審稿引述斷鏈，新增為零。

[GitHub Pages 新站](https://justty32.github.io/engineer_study/calculus-little-lab/) 已發布，成品 commit 為 `776b9395c4ad994b405e3eb319a985801791ec8e`，[部署工作 38101276008](https://github.com/justty32/engineer_study/actions/runs/38101276008) 的 build 與 deploy 均成功。33 個新成品全部 HTTP 200，逐檔 SHA-256 與 QA 驗收版相同；中央入口及 CSS、舊工程數學與兩個 IoT 入口皆 HTTP 200。成品清單指紋為 `ae7b994ca261efea41ce97ba54531bcecd0514faf2c5a86df420851b3083c428`，遠端核對證據存於 `/tmp/calculus-eli5-publication/http-results.json`。

[Sites 版本](https://calculus-little-lab.bronzetern2.chatgpt.site) 維持擁有者私有 audience，部署成功；source 為 `b31a05e4d5d03de0d947816ba4aab0fb64f8c689`，完整 project／version／deployment 識別值記於驗收紀錄。公開分享入口使用上方 GitHub Pages。

builder、四位子作者、audit、qa 與 clarity 已完成停筆；QA 自有測試行程與 Sites 封裝行程均已退出，無本案桌面資源鎖。真人觸控、跨瀏覽器、螢幕閱讀器及教學閱讀效果仍待人工，已登記於 [共通基礎實機驗收](../../wait-user/實機驗收-共通通訊電力.md)。現役登記已收線，原有 `nvim.log` 未修改或加入版本控制。線性代數另留待使用者啟動，本輪未調查或修改。

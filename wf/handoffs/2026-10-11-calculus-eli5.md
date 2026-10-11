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

## 目前狀態

33 個成品檔已完成，全部產品作者停筆。獨立 QA 的 1,547 項主驗證、26 項修正複驗及 4 項選項文寬複查均通過；數學審稿與 ELI5 抽審無未決項。root 已明確放行 GitHub Pages 與 Sites 發布；發布識別值、HTTP 與雜湊證據於收線補入。

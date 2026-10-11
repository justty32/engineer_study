# 線性代數 ELI5 新站

使用者於 2026-10-11 明確指示「開始線性代數吧」。延續 [compact 前交接](2026-10-11-linear-algebra-after-compact.md) 的新站、圖解、ELI5、多 agent、查證與修正原文、自由 push／部署授權。初始 main 為 `5e698f290bdb51a695aa56feef8215934c377029`；原有未追蹤 `nvim.log` 禁讀改、禁提交。

## 領地與方法

root 只調度、審規格與 native Sites 身分／發布。builder 持有 `共通基礎/數學/圖解線性代數/`，但不含 `.openai/` 與 `驗收紀錄.md`；可再派最多四位章節作者，先鎖定互斥檔案。audit 持有 `共通基礎/數學/02-線性代數.md` 與必要的數學名詞表增補，只有 audit 能做教材網路查詢，每批最多四頁一手來源，後續批次由 root 放行。qa 只寫新站 `驗收紀錄.md` 與 `/tmp/linear-algebra-qa/`。publish 持有 `.github/workflows/pages.yml`、`互動學習網站/index.html`、`共通基礎/README.md`，放行後負責精確 commit／push 與 GitHub 部署查證。clarity 唯讀抽審 00-start、matrices、systems、projection、svd 五頁及對應 JS，報告僅寫 `/tmp/linear-algebra-clarity.txt`。工作流狀態先由 root 持有，收尾再轉交 publish。

本輪沿用環境實際可用模型，不宣稱使用舊模型表列出的 Claude。使用者授權覆蓋工作流預設的兩 agent 上限；不新增依賴。沿用原生 HTML／CSS／JavaScript 與 inline SVG，獨立 `lab.css`，不改舊課樣式。正文 ELI5 仍須保留數學條件。舊站唯讀；禁止 GUI、桌面截圖、鍵鼠與焦點操作。既有 headless Chromium 可驗課程，自有行程交付時關閉。所有產品檔一檔一作者；子作者不開後代。

## 發布準備

課名「線性代數小小實驗室」，GitHub slug 為 `linear-algebra-little-lab`。GitHub origin／main／PUBLIC／gh 帳號 justty32／Pages workflow 無自訂網域皆已核對符合既有狀態。新 Sites project `appgprj_6acaeba52be88191b1baa402a3ae277c` 已建立為 owner-private，身分持久化於新站 `.openai/hosting.json`，預期網址 `https://linear-algebra-little-lab.bronzetern2.chatgpt.site`（目前未部署）。隔離來源 checkout 為 `/tmp/linear-algebra-eli5-hosted`，已由原生 source helper 開啟，不包含整個筆記庫；憑證僅存 session memory。

## 驗收

1. 來源十組核心概念都有可追溯教學落點，零基礎入口、課程導航、字典與參考資料齊全。
2. BRIEF／SPEC 與互動契約齊備；每個實驗數學例子與邊界由獨立驗收者重算。
3. 桌面與手機 headless、鍵盤、離線、UTF-8、相對連結、外部執行請求、語法及流程 lint 全部有證據；既有兩筆歷史斷鏈基線分開列出。
4. GitHub Pages 每個新成品 HTTP 200 且內容對上受驗版本，保留既有網站。Sites 使用新身分發布，成功後留下網址／版本。
5. 所有子線停筆、行程清理、狀態與待人工事項落檔後收線。

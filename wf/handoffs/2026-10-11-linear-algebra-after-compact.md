# compact 後接續線性代數

## 啟動條件與目前狀態

使用者於 2026-10-11 指示：「我要 compact，compact 完成之後再來做線性代數。你準備一下。」本次只保存交接。**先讓使用者 compact；compact 後仍要等使用者叫開始，再啟動線性代數工作。** 不因讀到本檔就自動建站。

線性代數尚未調查、讀取、設計或修改，未建立新網站或 Sites project。前兩輪所有子線已停筆，自有測試／封裝行程已關閉。準備本交接前的 main 為 `359ac7f844125a6b146f20e408f6dad7a351d107`，與 origin 同步；原有未追蹤 `nvim.log` 保留，不讀改、不 commit。

## 延續的使用者要求與授權

另建繁體中文 ELI5 網站，保留舊網站。以大量原創 inline SVG／canvas 圖解與可操作實驗教學，可依圖面需求重排頁面、章節與布局，補入門、先備與必要細節。不抓外部圖片或新增點陣圖。先讓使用者看 PC 版。

不確定的內容可查權威教材、官方文件與開源教學專案，不靠猜測；製作中確證原文有錯，可一併修正並留下依據。工作主要委派 agents；使用者已授權自由 push 與部署。技術棧不限，原生 HTML／CSS／JavaScript、離線且無外部執行依賴是前兩站可行的延續，不是使用者強制指定的技術棧。依環境實際可用模型派工，不把專案舊文件的 Claude 模型名稱當成此次已使用模型。

## 下次開工入口

先照 [AGENTS.md](../../AGENTS.md) 做 session 入口檢查，讀 [PROJECT-GUIDE](../PROJECT-GUIDE.md) 與 [工作流派發](../WORKFLOWS.md)。建課依 [interactive-study-site](../workflows/interactive-study-site/README.md)、[FOUNDATIONS-FIRST](../workflows/interactive-study-site/FOUNDATIONS-FIRST.md)、[BUILD-WITH-AGENTS](../workflows/interactive-study-site/BUILD-WITH-AGENTS.md)；驗收與發布沿其連結，不省略獨立 QA。

來源起點為 [02-線性代數.md](../../共通基礎/數學/02-線性代數.md)、[數學名詞表](../../共通基礎/數學/中英名詞對照表.md)，以及唯讀的 [舊工程數學互動課](../../共通基礎/數學/互動課程/index.html)。建議另放 `共通基礎/數學/圖解線性代數/`，公開 slug 可用 `linear-algebra-little-lab`；兩者只是交接建議，尚未建立或定案。內容範圍與章節須在使用者啟動後讀來源再決定。

若下次也用 Sites，須為線性代數建立獨立 project／hosting 身分，不得沿用 IoT 或微積分的 project ID。GitHub Pages 保留原 slug 並新增課程接線，使用者授權持續有效。

## 已完成網站與可沿用證據

[物聯網小小實驗室](https://justty32.github.io/engineer_study/iot-little-lab/) 已發布，詳 [IoT 完成交接](done/2026-10-11-iot-eli5.md)。[微積分小小實驗室](https://justty32.github.io/engineer_study/calculus-little-lab/) 已發布，成品 `776b939`、收線 `359ac7f`；詳 [微積分完成交接](done/2026-10-11-calculus-eli5.md) 與 [獨立驗收紀錄](../../共通基礎/數學/圖解微積分/驗收紀錄.md)。微積分共 16 頁、14 個主實驗，1,547 項主驗證與 30 項局部複查通過；33 個公開成品與 QA 雜湊一致，舊站保留。真人閱讀、觸控與跨瀏覽器限制另列 [待人工清單](../wait-user/實機驗收-共通通訊電力.md)。

現有 headless 工具可直接使用：Playwright Core 位於 `/home/lorkhan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core`；Chromium 位於 `/home/lorkhan/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`。不需安裝工具；禁止 GUI、搶焦點或操作使用者桌面。可參考 `/tmp/calculus-qa/` 腳本，暫存證據可能被清除，持久結論以驗收紀錄為準。

工作流 lint 的既有基線為兩筆 2026-09-26 歷史審稿引述斷鏈，前兩輪均無新增；詳微積分驗收紀錄。不要改寫歷史引文以假造全綠，也不要將此基線當成跳過新站驗收的理由。

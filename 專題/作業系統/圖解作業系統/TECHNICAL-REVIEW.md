# 圖解作業系統：獨立技術驗收

2026-10-11 使用既有 Playwright Core、Chromium 153.0.8010.12 與 Node.js 24.14.1 驗證。公開範圍為 22 個 HTML、app.js、lab.css，共 24 檔。技術檢查通過；機制、教學與最後封版由各獨立報告及隊長聚合，這份報告不以 console 無錯代替教學正確性。

逐項觀測存於 [技術證據](evidence/technical-review.json)，問題與處置存於 [技術問題](evidence/technical-findings.json)。可重跑工具為 [靜態檢查](tools/check-static.py)、[瀏覽器驗證](tools/qa-site.mjs) 與 [公開清單](tools/final-manifest.py)。

22 頁分別在 1440×900、390×844、320×844，以 HTTP 與 `file://` 載入，共 132 次；07、14、15 完稿後另做 18 次局部複驗。合併保留同版的 1,982 項瀏覽器判準全部通過，並以逐檔 SHA-256 證明其餘 21 個公開檔未變。原始暫存證據在 `/tmp/os-visual-qa/browser.json` 與 `final-delta/browser.json`，持久結論已存入上述資料檔。

18 個固定重播元件全部驗證每一步、圖中當前狀態、往回、終點禁用與重設；RR 用獨立逐毫秒模型核對六組排程，包含同刻到達、閒置、最大工作量與 q=1/10。VA 驗證 0、65535、0x2ABC 的整除餘數及全部 12 種 TLB／駐留／權限組合。非法、空白、非整數與非有限值會顯示錯誤，不輸出 NaN 或可讀 PA。字典查詢、無結果及清空恢復 46 詞條均通過。

20 課在關閉 JavaScript 的本機檔案模式保留完整正文、例解及可展開練習詳解。所有頁面無 console error、pageerror 或外部執行期請求；官方來源超連結沒有被當成執行期資源。所有控制項有名稱，實際 Tab 可見焦點，窄螢幕圖表可用方向鍵橫向捲動，提示及圖說保留在可視範圍。段落錨點不被固定導覽遮住；SVG 文字無超出 viewBox，整頁無橫向溢出。

已實看首頁、04 排程、12 轉址、08 同步、17 持久性及 19 跨層整合等代表畫面。長元素截圖會把 sticky 導覽帶入圖內，因此版面判斷採實際 viewport 截圖。桌機代表為 `/tmp/os-visual-qa/12-translation-1440-widget-viewport.png`；手機左右端為 `04-round-robin-390-diagram-left.png` 及 `04-round-robin-390-diagram-right.png`。截圖只作 QA 證據，沒有加入 dist。

24 個公開檔的嚴格 UTF-8、BOM、替換字元、控制碼、私用區、LaTeX 殘留、相對／錨點連結、重複／缺少 ID、SVG 可及名稱及外部執行期掃描均通過。舊 OS 19 檔（含 archive）及共享樣式 18 份複本加正本 19 檔，bytes／SHA-256 與原始基準一致；樣式正本閘門通過。wf-lint 保留兩條歷史審稿引述斷鏈，未修改範圍外文件。

程序由單一 Node runner 持有，HTTP 只綁 `127.0.0.1` 的臨時 port，Chromium 僅用 headless。`try/finally` 會等待 `browser.close()` 與 `server.close()` callback；另做清理驗證，確認瀏覽器連線已斷、server 不再 listening、runner PID 已不存在且原 port 不接受連線。實際 PID／port 與觀測值收於技術證據的 `managed-process-cleanup`，沒有清除別人的程序。

本次是單一 Chromium 的自動與圖像審查，未聲稱真人觸控、螢幕閱讀器或其他瀏覽器已驗。2026-10-11 全部作者停筆、獨立審核通過後，依隊長授權正式綁定 [公開清單](公開資產manifest.json)，final digest 為 `4f590b6366fe086376adce858198f5020bebbb8da70db4135f9d7c22bb952e28`。發布仍由 root 另行放行。

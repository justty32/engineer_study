# 作業系統新圖解站完成交接

## 目標與領地

依使用者排程，舊11課完整保留下建立20課繁中圖解作業系統。使用者明確授權分層多agent、外部一手教材查證、commit/push/deploy；本線沒有git操作，發布由root放行後交visual_publish執行。

可寫領地僅 `專題/作業系統/圖解作業系統/` 與本handoff。舊站全部19檔（含archive）、Linux/RTOS、共享樣式均不動。中央／來源README／Pages／共享wf/git由publisher持有。未讀改nvim.log/prompt.md；無新增依賴、下載瀏覽器、桌面GUI或宿主process/device/disk實驗。

## 固定交付

新slug `operating-systems-little-lab`；只公開 `專題/作業系統/圖解作業系統/dist/`。24檔＝20課＋首頁＋字典＋app.js＋lab.css。52張原創靜態SVG，正文完整例題與遷移題，21元件（18trace共106步＋RR＋VA＋字典搜尋）。來源54主張覆蓋20課，舊11課對照齊全，13筆勘誤／精化記錄中的2筆真錯誤只在新站更正。

[產品README](../../../專題/作業系統/圖解作業系統/README.md)｜[立案](../../../專題/作業系統/圖解作業系統/PROJECT-BRIEF.md)｜[契約](../../../專題/作業系統/圖解作業系統/BUILD-SPEC.md)｜[交付scope](../../../專題/作業系統/圖解作業系統/evidence/delivery-scope.json)｜[public manifest](../../../專題/作業系統/圖解作業系統/公開資產manifest.json)

final asset digest：`4f590b6366fe086376adce858198f5020bebbb8da70db4135f9d7c22bb952e28`。

manifest 檔案 SHA-256：`8d4658886f2ba7d67cc64ccfa8403fe1f9f0e08b94a18c365698dc4d4cd975bf`。scope 檔案 SHA-256 由交付訊息提供，避免自我參照雜湊。

## 驗收（固定八條）

1. **通過**：舊11課完整覆蓋、20課先備合理，coverage及逐課教學實讀支持。
2. **通過**：各課原創圖對應完整計算／trace、檢查、遷移題提示與詳解；noJS可讀。
3. **通過**：54項主張有實讀一手來源，13項勘誤分類經獨立機制審核。
4. **通過**：全部例題／練習／邊界獨立核算，RR/VA 2498組獨立預期比對，21元件與106個trace狀態吻合。
5. **通過**：20課逐課教學實讀＋首頁／字典；04/12/08/17桌機手機圖獨立檢視，14教學問題全閉。
6. **通過**：靜態UTF-8／連結／ID／SVG／無外runtime；HTTP/file、320/390/1440寬、鍵盤／reset／noJS；同版1982個瀏覽器判準全過，console／pageerror／外請求／全頁溢出均0。
7. **通過**：舊OS19檔及既有styles基線不變，styles正本閘門exit0；獨立lab.css未動共享樣式。
8. **通過**：三審與公開manifest綁同一final digest；作者與builder停筆，審核程序均已關閉。封版時等待root發布放行，後續公開證據見下節。

[總驗收](../../../專題/作業系統/圖解作業系統/驗收紀錄.md)｜[機制審核](../../../專題/作業系統/圖解作業系統/MECHANISM-REVIEW.md)｜[教學審核](../../../專題/作業系統/圖解作業系統/TEACHING-REVIEW.md)｜[技術審核](../../../專題/作業系統/圖解作業系統/TECHNICAL-REVIEW.md)｜[來源勘誤](../../../專題/作業系統/圖解作業系統/SOURCE-NOTES.md)

## 程序與已知基線

所有產品作者、builder與來源員已final停筆。機制審核的Chromium均finally close、未啟server；教學審核未啟常駐程序；技術runner PID413591已退出，127.0.0.1:36507拒連，browser connected=false、server listening=false。截圖證據在 `/tmp/os-visual-qa/`，不列公開資產。

`wf-lint`保留2026-09-26兩筆歷史quote斷鏈及既有advisory；不是新增問題，不動範圍外文件湊綠。舊站基線由publisher保存於 `/tmp/operating-systems-visual-publication/`。發布前後校驗由publisher依既有45站784資產加本24檔，預期46站808資產；本線不自行push/deploy。

## 公開部署完成

[公開圖解作業系統](https://justty32.github.io/engineer_study/operating-systems-little-lab/) 已上線；產品 `21d815ce0f4006b814b45cdc8c846828d966ff0a`，[Pages 工作 38124119737](https://github.com/justty32/engineer_study/actions/runs/38124119737) 成功。24 個成品與中央 2 檔逐 SHA 一致，4 個既有入口正常，共 30 次公開請求全部 HTTP 200。最終 digest／manifest 與本檔封版值一致，未改 24 個成品。

精確交付 54 路徑，加 3 份接線及 4 份共享行政，共 61 檔入產品 commit。中央 45→46；舊 45 站 784 成品、舊 OS 19 檔含 archive 3 檔、正本及 18 個樣式複本保持不變。交付 scope 保留產品 commit 的歷史路徑與公開雜湊，部署證據與 handoff 歸檔另行收線；不循環重寫 manifest。

[完整驗收與部署證據](../../../專題/作業系統/圖解作業系統/驗收紀錄.md) 記錄公開核對、保護結果與實機限制；機器證據在 `/tmp/operating-systems-visual-publication/`。隊長、全部 10 名工人及其自有測試程序均已退出；發布者 watch、HTTP 及 headless 程序已結束。無新 Sites、依賴或 WAIT_USER。舊課錯誤只在新站更正，來源勘誤完整保留；不以圖數或判準數宣稱真人理解已驗。

[電磁學 → 作業系統程序](2026-10-11-em-os-program.md) 兩站皆完成發布與收線，整體 goal 由 root 結束。

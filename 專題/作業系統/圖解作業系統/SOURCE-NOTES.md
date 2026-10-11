# 圖解作業系統來源與勘誤說明

本次於 2026-10-11 實讀一手教材、API 文件原始稿與教學核心程式碼，並將原 11 課主文、數字實例、自我檢核及 `app.js` 對照到新 20 課。查證範圍也含舊站 README、archive/BUILD-SPEC 與新站 BUILD-SPEC。教材用來核對機制與邊界；新頁文字、例子與圖由本專案自行組織，未擷取外部圖片或大量搬運原文。

[逐項來源與適用條件](evidence/sources.json) 收錄 54 項主張，每項附一手網址、章節／頁碼或函式定位、自述結論、適用新課、版本與實讀日期。[舊 11 課覆蓋對照](evidence/coverage.json) 保留每個舊主題與工具的去向，並區分新增內容。[勘誤與精化判定](evidence/errata.json) 有 13 筆：2 筆真錯誤、4 筆不足、3 筆精化、4 筆已核正確。覆蓋表描述新課必須承接的要求，成稿是否完成另以教學及機制審核為準。

OSTEP 採作者網站單章 PDF；頁碼自單章第一頁起算，並非合訂本頁碼。已讀大部分章節標示 Version 1.10，`threads-bugs` 已為 Version 1.20，因此逐列記錄，未將所有檔案視為同一版。MIT xv6 使用 2025 課程的 RISC-V rev5 書與官方 `xv6-riscv` 儲存庫；`riscv` 分支會變動，原始碼列記函式名稱與讀取日，沒有冒稱固定 commit。該版程式包含 lazy allocation；書中的 COW 討論不表示此基準程式已實作 COW，`uvmcopy` 仍使用 eager copy。

Linux man7 HTML 在本次工具中逾時或無法開啟，因此 API 結論改核 Michael Kerrisk 作者儲存庫中可實讀的 man-pages 原始稿。這些是 2021 年時期稿件，不能當成 2026 年最新版 API 全集；來源表保留原稿網址、章名及限制。procps-ng 的 `ps` 狀態另讀上游 2025-04-23 稿。Open Group 頁面本次未能成功讀取，沒有把它列成已驗證的 POSIX 規範；condition variable 與 semaphore 教學以已讀 OSTEP 及 API 原稿支持，遇標準細節不得超出它們的範圍。C 的 data race 用 WG14 N3096 工作草案 §5.1.2.4 第 35 段（正文 p.18），C++ 用公開編輯草案 intro.races 第 17 段，均明示草案性質。

Dijkstra EWD 623 的大學典藏轉錄支持銀行家演算法的安全性定義及不變量，但轉錄頁明示標記不完整，部分公式有 OCR 誤植。因此新課以自訂變數名稱解釋單一類資源，使用 `Need = Max − Allocation`、`Need ≤ Work`、`Work ← Work + Allocation` 自行驗算；不照抄轉錄的程式。原文 `need` 指需求上限，對應新課 `Max`，不能與新課剩餘需求 `Need` 混淆。

來源支持原理，並不代替教學模型契約。RR 同刻到達及時間片結束的排隊順序、MLFQ 層級數與配額、虛擬位址位數、頁大小、置換參照字串、單實例鎖圖及 journal 的持久化前提，均須在新課明寫。無 I/O 的單 CPU 排程才直接使用 `waiting = turnaround − burst`；condition wait 必須原子解鎖並進入等待、返回時重新持鎖且以 while 重查 predicate；C/C++ data race 的實際執行不能套用玩具交錯模型的數值界限。TLB miss 不等於 page fault，fault 也不必讀磁碟。

持久性範例須區分 `write` 成功、`close`、檔案 `fsync`、名稱原子替換與父目錄同步；journal 只保證已說明的提交及儲存順序。`dup`／`fork` 複製的 fd 可指向同一 OFD 而共享 offset，重新 `open` 則通常得到另一 OFD。這些限制已列在對應來源列，作者與審核者應連同主張一起引用。

舊站的 TLB 區分、FIFO 的 Belady 實例、LRU 不必每個字串都勝 FIFO、inode 開啟參照生命週期及 syscall 不一定切換行程，均已核正確。兩筆真錯誤僅為記憶體工具的總量標籤與 Linux `R` 狀態釋義；其餘新增細節依不足或精化記錄，不宣稱推翻原內容。舊站檔案本次未修改。

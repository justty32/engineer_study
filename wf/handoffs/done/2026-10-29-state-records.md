# 任務：校正聽課活狀態與待驗收分工

2026-10-29，使用者接受現況紀錄校正並表示「可以先不做實質工作」；本輪僅維護紀錄，正常 commit／push main 已有本次對話授權。上游 root，行政協調 wf_review；同 repo 用內建 agent 通道。

## 範圍與領地

行政作者 wf_review 只寫 SESSION-LOG、WAIT_USER hub、ROSTER（含既有 ROSTER-EM 分頁）、CLAIMS 與本交接。課程紀錄作者 course_rules_state 只寫電路聽課產線狀態、電子聽課製作 STATE、電磁聽課產線狀態三檔。待驗收作者 knowledge_rules 只寫四份實機驗收分頁及 interactive-study-site/session-log.md；若同質記錄超過 1 KB，可新增同目錄 pending-checks.json 並用 tabledb 維護。

所有作者沿用現行模型。兩子線不可再派 agent；不得改其他檔案或同時寫共享行政檔，新增發現先回報。既有歷史交接、審稿報告、政策規範、git 換行設定及舊 worktree 均唯讀。

## 工作與限制

用已完成交接校正電子／電磁的活文件，不改歷史原文；原相位 13/19 段、56/84 chunks 暫停與另待使用者續跑條件維持。分出可由 agent 補驗的瀏覽器、結構與連結檢查，狀態一律待排程，真人觸控、聽感、輔助科技與理解驗證保留，不把未跑檢查標為已通過。

不做課程、審稿、對照表或音訊內容；不開 GPU、TTS、GUI、瀏覽器、server，不拿鎖、不新增依賴、不下載、不碰其他 repo、不刪檔或大規模搬移。作者不做 git 操作；協調者核驗後才提交推送，不強推。

## 驗收（僅四條）

1. 變更只有上述紀錄路徑；三科課程完成狀態與最新交接一致，歷史交接原文未改。
2. WAIT_USER 五類 14／10／9／8／7 的需求不被關閉；移出的機械檢查有可追溯來源、明確條件與未執行標記；原相位暫停條件保留。
3. 本輪文字 UTF-8、相對連結與錨點、差異空白檢查通過。以 /tmp LF 工具副本跑 wf-lint，既有 broken2／oversize2／biglist269／querycmd3／residue1 不新增；全庫掃描受 ignored 舊 worktree 影響，不宣稱全庫通過。
4. 確認子線與自有程序收完、CLAIMS 無現役，交接附證據入 done；提交前核 working tree／遠端，正常 commit／push main 後核同步。

## 完成證據

兩條子線均停止寫入，未啟 GPU、瀏覽器、預覽服務或背景程序，未取鎖。三科活狀態、四份真人頁及共享行政已對照原交接校正；電子暫停列歸入收線歷史，電磁原隊名冊歸回既有 ROSTER-EM 分頁。舊交接原文、課程產品、音訊、對照表及審稿報告未改。

變更文字 UTF-8／無 BOM、本地連結與 Markdown 錨點、git diff --check 通過；41 組真人需求維持 14／10／9／8，頁數與功能欄逐列對帳相同，核心六組聽課全文未改。另 7 組對照表決策原樣保留。11 組原有機械補驗保存條件與來源，全部待排程、未執行；7 組未載證據者只保留待查提醒，沒有新增任務。

以 /tmp LF 工具副本跑 wf-lint --strict wf，exit 1；broken2／oversize2／biglist269／biglist_links1／querycmd3／residue1 與本輪開始前的完整掃描相同，新增問題零。兩個 oversize 是未修改原檔的 CRLF 膨脹，HEAD 的 LF 原文為 8157／8116 bytes。新的主名冊為 8143 bytes，工作樹與 LF 尺寸相同。資料檔 tabledb 連結檢查 exit 0、空錯誤清單。本輪不重跑會進入 ignored 舊 worktree 的全庫包裝，不宣稱全庫通過。

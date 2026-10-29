# 任務：發布現有聽課教材到既有 GitHub Pages

2026-10-29 使用者要求「更新網頁」，沿用本次正常 commit／push 授權。發布既有驗收完成的內容，不做11組待補驗或新課程／音訊。

## 已確認的差異

既有 justty32/engineer_study 公開庫，main、workflow Pages、無自訂網域，CLI 帳號 justty32。末次成功部署為7f88179；組站只取課程目錄第一層 html/css/js，漏掉聽課子目錄與總覽，中央入口亦無聽課入口。

## 領地與限制

wf_review 協調、唯一寫共享 SESSION／CLAIMS／本交接、中央入口對應的 WAIT_USER 列與互動學習網站/驗收紀錄.md；所有原始驗收與歷史交接唯讀。course_rules_state 唯一寫 .github/workflows/pages.yml、wf/tools/publish_listening.py、互動學習網站/index.html，必要時只改電機/02-電機核心/聽課總覽.html 的導航。knowledge_rules 唯讀檢查產物與網站，證據僅寫 /tmp，再由協調者整理入驗收紀錄。

兩子線沿用現行模型，不再派子 agent。只發布明確白名單的 html/css/js 與 git 已追蹤且實際引用的音訊；不遞迴帶入 Markdown、來源稿、規格、Python、JSON狀態、隱藏檔或非網站資料。全部聽課仍維持已完成教材與缺音狀態，原相位暫停不變，不啟GPU／TTS。

不開GUI、不控制桌面、不安裝工具或依賴、不動其他CI／git設定／舊worktree，不強推、不刪既有課程。建置暫存放 /tmp，CPU headless 驗證 nice 19、disable-gpu。若需 HTTP server 僅本機臨時埠，先成功bind並登記自己的port鎖，用完釋放；不拿桌面鎖。

## 驗收（僅五條）

1. 既有46個入口保留，新增聽課入口；23門與總覽、必要資產在產物中，無內部紀錄或未追蹤音檔。改寫後本地連結／錨點及音訊引用可解析。
2. 與Actions同一組站邏輯可在暫存目錄執行；來源課程正文與既有播放功能不改。UTF-8／語法與wf-lint維持既有基線。
3. 使用已有瀏覽器做390px與桌面新入口／總覽及新課載入驗證；鍵盤導航、停靠／缺音狀態有證據。工具不可用則明示限制，不裝新工具或冒稱真人通過。
4. 正常提交推送，等待對應Actions與Pages成功；公開總入口、新總覽、23門及新資產HTTP檢查，回傳內容符合受驗產物；不重複觸發。
5. 記錄網站URL、commit、workflow run、手機寬度結果與限制；真人觸控／聽感沿用WAIT_USER。子線與自有程序／鎖全部收完，CLAIMS移歷史，交接入done。

## 完成證據（2026-10-29）

發布commit為43223140607781dd3584c7fcec778c7aedf060b9；[Actions 40820595472](https://github.com/justty32/engineer_study/actions/runs/40820595472)的build／deploy均success。網站[中央入口](https://justty32.github.io/engineer_study/)新增[聽課總覽](https://justty32.github.io/engineer_study/listening/)。既有46入口保留，23門與15個既有音檔共136個新成品，無內部資料。

完整結果見[中央與聽課發布驗收](../../../互動學習網站/驗收紀錄.md)：285條引用／錨點、74份JS語法、Python／YAML解析通過；兩視埠50載入及三科抽樣鍵盤／圖解／恢復停靠通過；141個公開成品HTTP200且雜湊相同，MP3 Range回206且片段一致。沒有實播音訊到尾或代替真人驗收，原相位暫停與其他課缺音狀態不變。

course_rules_state與knowledge_rules均已收線，Chrome／HTTP server及自有port鎖已清理。來源正文與播放器未改；未執行11組補驗。本輪五份紀錄UTF-8、65條本地連結、Markdown錨點與git diff --check通過，主名冊8153 bytes（LF與工作樹相同）。以/tmp LF工具副本跑wf-lint --strict wf，exit1；broken2／oversize2／biglist269／biglist_links1／querycmd3／residue1與開工基線相同，新增問題零。未跑會掃入ignored舊worktree的全庫包裝，不宣稱全庫通過。

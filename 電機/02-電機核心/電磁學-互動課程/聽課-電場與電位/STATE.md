# 電場與電位：關機前保存狀態

2026-10-14，使用者準備關機，依隊長指令停止製作。本課是草稿，不得掛成已完成教材。

已落 PROJECT-BRIEF.md、BUILD-SPEC.md、圖面規格.json（九圖，wf-table/1）、派工計畫.md、建置進度.md，以及完整口語稿.md。驗收紀錄.md 由獨立 QA 唯一維護，作者不寫。

三堂文字草稿均已寫完各九段：第一堂 4579、第二堂 4453、第三堂 4501 個正文漢字（只計各段正文，不含標題與前言）。第三堂寫入與字數檢查已在收到停工通知前完成。文字尚未做獨立成品驗收；圖號與觀察指示目前對應規格，不代表圖已存在。

獨立 QA em_field_qa 已通過九圖規格與主例數學預驗：單源 E=(60,80) V/m、雙源合場(0,160)、甲乙電位30/15 V、場積分15 V、正1 pC試驗電荷場功15 pJ、梯度(-60,-80)。這是規格預驗，不能冒充成品通過。

尚未製作 index.html、audio-course.css、audio-course.js、audio-manifest.js、lesson-data.js；九張 SVG 亦未製作。沒有正式音檔、沒有 sample、沒有啟動 TTS/GPU/GUI/browser、沒有新啟動服務，也沒有 git 操作。

續作第一步：讀 BUILD-SPEC.md 與圖面規格.json，確認完整口語稿.md 三堂草稿，再從既有電路暫態模板提取播放器，建立獨立 EMFIELD_AUDIO 命名空間與 emfield-listening-v1 storageKey；依九圖規格製作 SVG。將草稿各段抽為 lesson-data.js，往後以同一來源輸出 MD 並檢查逐字一致；圖與正文互核後，通知 em_field_qa 獨立驗收。CPU headless 仍須由隊長協調全樹串行。不要在未完成前移除草稿標記。

作者寫入範圍仍限本目錄、驗收紀錄.md 除外。共用 wf 與導航由隊長維護。此檔保存後作者停止寫入，等待下一次明確續作。

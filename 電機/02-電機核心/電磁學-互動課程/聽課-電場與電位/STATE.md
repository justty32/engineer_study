# 電場與電位：成品建置狀態

2026-10-15 續作：三堂 27 段已組裝成離線聽課頁，九張程式繪製 SVG 已完成；本輪製作與獨立 QA 已完成，允許交付。五類驗收結果以 [驗收紀錄.md](驗收紀錄.md) 為準。

正文漢字依序為 4579、4453、4501，維持原草稿原意與逐字正文。lesson-data.js 為唯一正文來源；build-course.py 從該來源重建完整口語稿.md、圖面及沿用的播放器。三堂均在第 3、6、9 段停靠，SVG 與停靠 ID 使用 emfield- 前綴。

前端包含 index.html、audio-course.css、audio-course.js、audio-manifest.js、lesson-data.js；九個 emfield-*.svg 與頁面內嵌圖同源生成。命名空間為 EMFIELD_AUDIO / EMFIELD_AUDIO_ASSETS，儲存鍵 emfield-listening-v1。正式音檔 0/27、沒有 sample、不自動發聲；有中文系統聲音時僅使用者操作後朗讀，否則保留講稿與圖解。

作者自檢：三支 JS 語法、嚴格 UTF-8、SVG XML、相對連結、播放器 DOM ID、27 段 MD 與 JS 逐字同源及字數均通過。場向量、空間座標依圖內同尺度，曲線由公式計算；圖二合場長 320 畫布單位，兩分場各長 200，符合 160/100 比例。獨立 QA 已完成桌機／手機視覺與播放器流程；圖七標籤修正亦已複驗通過。

作者未執行 TTS、音檔生成、GPU、GUI、瀏覽器、新服務、依賴、下載或 Git 操作；CPU 無頭瀏覽器驗證由獨立 QA 執行。作者只寫本目錄且不寫驗收紀錄。建置進度.md 保留為歷史紀錄，本輪未刪檔。

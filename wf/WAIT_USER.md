# WAIT_USER — 等待使用者的事

← [AGENTS.md](../AGENTS.md)｜[INDEX](INDEX.md)

需要**使用者親自做或驗證**才能繼續的事，例如外部服務登入、權限操作、需要帳號的下載，或請另一個 agent 優先處理信件。Agent 能先完成的結構性驗證應做到極限；剩餘事項才記在這裡。

**只列還沒做的**——做完即移除（不留已完成清單，歷史看 git log）。

> **膨脹就拆**：待使用者項堆多時，在 `wf/` 下建立 **`wait_todo/`** 並按類別拆檔，本檔退回只保留分類導航（照 [DEV-GUIDE「結構整理原則」](DEV-GUIDE.md)）。

## 待使用者項

- 以手機實際開啟 [IoT 聯網裝置互動站](https://justty32.github.io/engineer_study/iot-device/)，確認模組導覽、數字輸入、韌體狀態機、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊。
- 以手機實際開啟 [電力系統互動站](https://justty32.github.io/engineer_study/power-systems/)，確認模組導覽、功角／頻率切換、數字輸入、N-1 狀態、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊。
- 以手機實際開啟 [IoT 板級電源與 PCB 互動站](https://justty32.github.io/engineer_study/iot-power-pcb/)，確認頂部模組導覽、數字輸入、檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊。
- 以手機實際開啟 [IoT 嵌入式韌體與 RTOS 互動站](https://justty32.github.io/engineer_study/iot-firmware-rtos/)，確認模組導覽、任務輸入、同步選擇、復原檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊。
- 以手機實際開啟 [IoT 連線模組、協定與網路互動站](https://justty32.github.io/engineer_study/iot-connectivity/)，確認模組導覽、數值計算、gate 檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊。
- 以手機實際開啟 [IoT 天線、RF、EMC 與法規邊界互動站](https://justty32.github.io/engineer_study/iot-rf-antenna/)，確認模組導覽、數值與複數阻抗輸入、gate 檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊。

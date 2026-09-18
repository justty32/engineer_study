# 實機驗收 — 專題 IoT 聯網裝置主站與知識群七站

← [WAIT_USER](../WAIT_USER.md)｜[INDEX](../INDEX.md)｜同系列：[電機核心](實機驗收-電機核心.md)、[共通通訊電力](實機驗收-共通通訊電力.md)、[專題資安機器人AI](實機驗收-專題資安機器人AI.md)

## 說明：agent 可做的檢查 vs 仍需真人的檢查

Agent 具備靜態內容檢查、HTTP 導覽檢查，以及 headless Chrome（無真實觸控／實體鍵盤）自動化檢查的能力，可驗證頁面結構、連結有效性、首屏渲染與初始互動輸出是否正常。但 headless 環境**沒有**真實手機觸控、實體鍵盤輸入，也無法完全模擬使用者的真實裝置與瀏覽器版本，因此以下項目仍需真人在實機上操作驗證。

每列「待真人項」都預設**以桌面 `1440×900` 與手機 `390×844` 實際開啟**（只寫「手機」或「本機頁面」的列照該列寫法），列內只寫該課特有的重點；「左列各項」指「頁數與功能要點」欄。未特別標明尺寸的「桌面」「手機」分別指 `1440×900` 與 `390×844`。

驗完一列即刪該列；全部清空後在 [WAIT_USER](../WAIT_USER.md) 導航表把本類別的 open 數歸零。

## 待真人驗收清單

<!-- wf-nav -->
| 課程 | 本機路徑 | 線上網址 | 頁數與功能要點 | agent 已驗到哪 | 待真人項 |
|------|---------|---------|---------------|---------------|---------|
| IoT 聯網裝置互動站 | — | [`iot-device/`](https://justty32.github.io/engineer_study/iot-device/) | 模組導覽、數字輸入、韌體狀態機、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊 | — | 以手機實際開啟確認左列各項 |
| IoT 板級電源與 PCB 互動站 | — | [`iot-power-pcb/`](https://justty32.github.io/engineer_study/iot-power-pcb/) | 頂部模組導覽、數字輸入、檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊 | — | 以手機實際開啟確認左列各項 |
| IoT 嵌入式韌體與 RTOS 互動站 | — | [`iot-firmware-rtos/`](https://justty32.github.io/engineer_study/iot-firmware-rtos/) | 模組導覽、任務輸入、同步選擇、復原檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊 | — | 以手機實際開啟確認左列各項 |
| IoT 連線模組、協定與網路互動站 | — | [`iot-connectivity/`](https://justty32.github.io/engineer_study/iot-connectivity/) | 模組導覽、數值計算、gate 檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊 | — | 以手機實際開啟確認左列各項 |
| IoT 天線、RF、EMC 與法規邊界互動站 | — | [`iot-rf-antenna/`](https://justty32.github.io/engineer_study/iot-rf-antenna/) | 模組導覽、數值與複數阻抗輸入、gate 檢查表、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊 | — | 以手機實際開啟確認左列各項 |
| IoT 裝置安全、佈建、量產與生命週期互動站 | — | [`iot-security-production/`](https://justty32.github.io/engineer_study/iot-security-production/) | 模組導覽、OTA 數字輸入、情境 gate、重設與進度保存可操作，且沒有頁面水平溢位或文字重疊 | — | 以手機實際開啟確認左列各項 |
| 30 分鐘板級介面與工業匯流排網站 | [index](../../專題/IoT聯網裝置/知識群互動網站/06-板級介面與工業匯流排/index.html)、[硬體原理補課](../../專題/IoT聯網裝置/知識群互動網站/06-板級介面與工業匯流排/hardware-principles.html)，以及 GPIO／I²C／SPI／RS-485／讀電路圖／做電路設計六個獨立頁 | — | 導覽、自由實驗、按鈕與文字沒有重疊或水平溢位 | agent 目前僅完成靜態驗收，尚未取得實際瀏覽器渲染證據 | 開啟本機各頁，以桌面與手機確認左列各項 |
| 微控制器與韌體核心課程 | [index](../../專題/IoT聯網裝置/知識群互動網站/07-微控制器與韌體核心/index.html) | — | 九頁導覽、零基礎 bit／clock 實驗、字典搜尋、startup／memory、register、interrupt／DMA、timer／ADC、狀態機與 fault 互動沒有重疊或水平溢位 | agent 目前僅完成靜態驗收，尚未取得實際瀏覽器渲染證據 | 開啟本機頁面，以桌面與手機確認左列各項 |

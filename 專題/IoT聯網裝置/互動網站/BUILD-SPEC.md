# IoT 互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[派工計畫](派工計畫.md)｜[品質關卡](../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是 Shell Worker 與 Logic Worker 的共同契約。Worker 不得自行改名、增刪模組或改變公式。

## 檔案與所有權

| 檔案 | 所有者 | 內容 |
|------|--------|------|
| `index.html` | Shell Worker | 語意結構、所有可見教材文字、固定 DOM ID |
| `styles.css` | Shell Worker | 響應式版面、狀態視覺、CSS 系統圖與資料條 |
| `app.js` | Logic Worker | 導航、進度、計算、狀態機、診斷與即時回饋 |
| `README.md` | Lead | 啟動方式、來源、限制與驗證方式 |
| `驗收紀錄.md` | Lead | 最終證據與已知限制 |

不得新增套件、外部資產或其他執行期檔案。所有 script 使用 `defer`；網站在本機 HTTP server 下必須可完整運作。

## 全站結構

- `#app-shell`：固定側欄加主內容；手機改為頂部模組選單。
- `#module-nav`：按鈕具有 `data-nav="<module>"`。
- `#progress-fill`、`#progress-label`、`#reset-progress`：全站進度與重設。
- 每一節為 `.learning-module[data-module="<module>"]`，模組名稱固定為：
  `mission`、`architecture`、`connectivity`、`power`、`pulse`、`firmware`、`diagnosis`、`production`。
- 每節有一個 `[data-complete="<module>"]` 按鈕；完成狀態只影響進度，不鎖內容。
- localStorage key 固定為 `engineerStudy.iotInteractive.v1`。

## 模組契約

### 1. mission

- 第一個 viewport 直接呈現「IoT 聯網裝置工作台」、目前模組與一個可操作的系統摘要。
- 顯示讀者最後要完成的工程任務，不使用 hero、行銷文案或教學功能導覽卡。

### 2. architecture

- 模式按鈕：`[data-flow="data"]`、`[data-flow="control"]`、`[data-flow="energy"]`。
- 節點：`.system-node[data-node]`，至少包含 sensor、power、mcu、module、antenna、network、cloud。
- 說明區：`#architecture-detail`；點選模式或節點後，更新責任、輸入、輸出與常見故障。
- 系統圖以 HTML/CSS 節點與連線呈現，不使用圖片或手繪 SVG。

### 3. connectivity

- 控制：`#link-range`、`#link-payload`、`#link-power`、`#link-infra`，使用 select 或 segmented control。
- 結果：`#link-results`，固定列出 BLE、Wi-Fi、LoRa、NB-IoT 四個方案的分數與兩個主要理由。
- 排序是教學啟發式，不宣稱取代法規、涵蓋、資費或現場測試；每次控制改變立即更新。

### 4. power

- 三種狀態：sleep、sample、transmit；每種各有電流 mA 與時間秒的數字輸入。
- 固定 ID：`#sleep-current`、`#sleep-time`、`#sample-current`、`#sample-time`、`#tx-current`、`#tx-time`、`#battery-capacity`、`#battery-derating`。
- 輸出：`#average-current`、`#battery-life-hours`、`#battery-life-days`、`#power-bars`。
- 公式：

  $$I_{avg}=\frac{\sum I_i t_i}{\sum t_i},\qquad
  T_{life}=\frac{C_{batt}\eta}{I_{avg}}$$

- 預設值沿用來源例題：sleep `0.01 mA / 99 s`、sample `30 mA / 0.9 s`、transmit `200 mA / 0.1 s`、capacity `2000 mAh`、derating `0.8`。
- 結果標示為理想估算，未含溫度、老化、自放電與脈衝能力。

### 5. pulse

- 輸入：`#pulse-delta-current`（A）、`#pulse-duration`（ms）、`#pulse-esr`（ohm）、`#pulse-capacitance`（µF）、`#pulse-allowable-droop`（V）。
- 輸出：`#pulse-cap-required`、`#pulse-esr-droop`、`#pulse-total-droop`、`#pulse-verdict`。
- 教學近似：

  $$\Delta V_{ESR}=\Delta I\cdot ESR$$
  $$\Delta V_C=\frac{\Delta I\Delta t}{C}$$
  $$\Delta V_{total}=\Delta V_{ESR}+\Delta V_C$$

- 若 $\Delta V_{ESR}\geq\Delta V_{allow}$，顯示只增加電容量仍無法滿足條件；否則計算可用壓降下的最低電容量。
- 明示這是「電容獨力支撐短暫電流階躍」的前期估算，正式設計仍需模組 datasheet、電源動態響應與佈局驗證。

### 6. firmware

- 狀態顯示：`#firmware-state`；事件按鈕：`[data-fw-event]`；日誌：`#firmware-log`；重設：`#firmware-reset`。
- 狀態固定為 OFF、BOOT、INIT、REGISTERING、ONLINE、BACKOFF、HARD_RESET、SLEEP。
- 至少支援 power、init-ok、register-ok、timeout、link-drop、retry、no-response、sleep、wake 事件。
- 無效事件不靜默忽略，必須說明目前狀態為何不能執行。
- timeout 進 BACKOFF；多次 no-response 才進 HARD_RESET；成功重連後重設失敗計數。

### 7. diagnosis

- 情境按鈕：`[data-case="reset"]`、`[data-case="drain"]`、`[data-case="storm"]`。
- 可選檢查：`[data-diagnostic-check]`；回饋：`#diagnosis-feedback`；目前證據：`#diagnosis-evidence`。
- 三個情境分別引導：
  - 偶發模組重啟：先量模組電源軌與電流脈衝，再看 bulk cap、ESR、走線與欠壓紀錄。
  - 電池過快耗盡：先量真實電流剖面，再找未睡周邊、LDO $I_q$、喚醒頻率與重連。
  - 重連風暴：先看 URC/AT log 與 backoff，再確認覆蓋、逾時與 supervisor 門檻。

### 8. production

- 階段按鈕：`[data-stage="EVT"]`、DVT、PVT、MP。
- 任務核取方塊：`[data-production-task]`，每項具有適用階段資料。
- 回饋：`#production-feedback`；顯示當前階段缺少的進入/退出證據。
- 必須涵蓋測試點、SWD/JTAG、FCT、產測韌體、provisioning、RF/EMC 前測、模組預認證條件與可追溯 log。
- 明示完成清單不代表取得 FCC、CE、NCC 或電信商認證。

## 視覺與互動要求

- 工作型介面：淺色主畫布、深色側欄、青綠作主要動作、琥珀作警示、紅色只表示失敗。
- 不使用紫色主調、漸層背景、裝飾圓球、巨大 hero、巢狀卡片或外部圖片。
- 卡片圓角不超過 8px；按鈕與輸入有穩定高度，最長繁中標籤在 `390px` 寬度不得溢出。
- 數值結果使用 tabular numerals；所有圖表都要有文字值與單位。
- 動畫只用短暫狀態轉換；在 `prefers-reduced-motion` 下停用。

## 驗收樣例

1. 功耗預設值應得到約 `0.48–0.49 mA`；若折扣為 0.8，2000 mAh 壽命約 `136–139 天`。
2. pulse 中輸入 `ΔI=0.5 A`、`Δt=0.2 ms`、`ESR=0.05 Ω`、`C=470 µF`，總壓降約 `0.238 V`。
3. firmware 在 OFF 收到 link-drop 應回報無效；ONLINE 收到 link-drop 應進 BACKOFF。
4. 網路面板不得產生任何非 localhost 請求。

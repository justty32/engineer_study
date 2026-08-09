# IoT 嵌入式韌體、驅動與 RTOS 互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[通用品質關卡](../../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是唯一執行契約；內容盤點與題型草案只能補充，不得覆蓋本檔。

## 1. 全域

- 執行期只使用 `index.html`、`styles.css`、`app.js`，相對載入 `./styles.css`、`./app.js`，script 使用 `defer`。
- 模組鍵：`architecture`、`event-loop`、`interrupts`、`driver-io`、`scheduler`、`synchronization`、`low-power`、`reliability`。
- section 使用 `data-module`；導覽使用 `data-nav`；完成使用 `data-complete`；單模組重設使用 `data-reset-module`。
- 進度 key：`engineerStudy.iotFirmwareRtos.v1`；必備 `progress-label`、`progress-fill`、`reset-progress`。
- 純 HTML/CSS/JavaScript；無外部字型、圖片、SVG、Canvas、CDN、分析碼或遠端 API。
- 視覺為亮色工程工作區加深灰導覽，使用綠、藍、黃、紅多種功能色；卡片半徑不超過 8px，`letter-spacing: 0`，字級不用 `vw` 或 `clamp`。

## 2. 架構抉擇

### DOM

- 輸入：`arch-task-count`（3）、`arch-deadline-count`（2）、`arch-blocking-flows`（2）、`arch-ram-kb`（64）、`arch-team-size`（2）。
- 輸出：`arch-rtos-score`、`arch-bare-score`、`arch-verdict`、`arch-status`、`arch-feedback`。

### 判斷

- RTOS 分數：task ≥3 加 2；deadline ≥2 加 2；blocking flows ≥2 加 2；team ≥2 加 1。
- Bare-metal 分數：task ≤2 加 2；deadline =0 加 1；blocking flows =0 加 1；RAM <16 KiB 加 2。
- RTOS 高於 bare 選 RTOS；bare 高於 RTOS 選 non-blocking superloop；同分顯示需原型量測。
- 預設 RTOS `7`、bare `0`，建議 RTOS。
- task、deadline、blocking、team 必須是非負整數，team 至少 1；deadline 不可大於 task；RAM 必須大於 0。
- 回饋必須說明這是架構提示，不是功能多就必須使用 RTOS。

## 3. 非阻塞 event loop

### DOM

- 輸入：`loop-sensor-ms`（2）、`loop-protocol-ms`（3）、`loop-log-ms`（1）、`loop-busy-ms`（0）、`loop-deadline-ms`（10）。
- 輸出：`loop-cycle-ms`、`loop-worst-response-ms`、`loop-slack-ms`、`loop-busy-share`、`loop-status`、`loop-feedback`。

### 計算

$$T_{loop}=T_{sensor}+T_{protocol}+T_{log}+T_{busy},\quad T_{slack}=T_{deadline}-T_{loop}$$

- 假設事件剛好錯過一次服務，最壞回應以一圈 `T_loop` 近似；busy share = `T_busy / T_loop`。
- 預設 cycle／response `6.000 ms`、slack `4.000 ms`、busy share `0.0%`，通過。
- 四個步驟時間可為 0，deadline 必須大於 0；cycle 為 0 時 busy share 顯示 `0.0%`。
- cycle > deadline 為阻擋；busy > 0 即使期限通過仍為警告，回饋改用狀態機、timer、ISR、DMA 或阻塞式 RTOS API。

## 4. ISR 延遲預算

### DOM

- 輸入：`irq-disabled-us`（12）、`irq-higher-duration-us`（18）、`irq-higher-count`（2）、`irq-entry-us`（2）、`irq-handler-us`（15）、`irq-rate-hz`（1000）、`irq-deadline-us`（100）。
- 輸出：`irq-start-latency`、`irq-response-time`、`irq-headroom`、`irq-cpu-load`、`irq-status`、`irq-feedback`。

### 計算

$$T_{start}=T_{disabled}+N_{higher}T_{higher}+T_{entry},\quad T_{response}=T_{start}+T_{handler}$$
$$U_{ISR}=T_{handler}f_{IRQ}/10^6$$

- 預設 start `50.0 µs`、response `65.0 µs`、headroom `35.0 µs`、ISR CPU load `1.50%`，通過。
- 時間與 rate 可為 0；higher count 必須是非負整數；deadline 必須大於 0；CPU load 不得成為 Infinity。
- response > deadline 或 ISR load >100% 為阻擋；load >20% 為警告。
- 回饋必須提醒 ISR 不可阻塞，只做清旗標／取最少資料，再用 queue、semaphore 或 notification 交棒。

## 5. Polling / interrupt / DMA

### DOM

- 輸入：`io-bytes`（256）、`io-rate`（500）、`io-cycles-byte`（80）、`io-dma-setup-cycles`（800）、`io-cpu-mhz`（80）。
- 輸出：`io-throughput`、`io-polling-load`、`io-dma-load`、`io-cpu-saved`、`io-verdict`、`io-status`、`io-feedback`。

### 計算

$$U_{poll}=\frac{BfC_b}{F_{CPU}}\times100\%,\quad U_{DMA}=\frac{fC_{setup}}{F_{CPU}}\times100\%$$

- `F_CPU` 由 MHz 轉 Hz；throughput = bytes × rate / 1024（KiB/s）。
- 預設 throughput `125.0 KiB/s`、polling `12.80%`、DMA `0.50%`、CPU 節省 `96.09%`，建議 DMA。
- bytes、rate、cycles 可為 0；CPU MHz 必須大於 0。polling >100% 為阻擋；polling ≤2% 且 bytes <64 可顯示 polling 足夠；其餘若 DMA 較低建議 DMA／interrupt-driven。
- 教材不計 bus contention、DMA 記憶體限制、cache coherency 或 driver setup latency。

## 6. RMS / EDF 與堆疊 RAM

### DOM

- 三個 task 的執行時間／週期／stack：`task1-c`（1 ms）、`task1-t`（5 ms）、`task1-stack`（512 B）；`task2-c`（1）、`task2-t`（10）、`task2-stack`（768）；`task3-c`（2）、`task3-t`（20）、`task3-stack`（1024）。
- 其他輸入：`kernel-ram`（2048 B）、`ram-budget`（16384 B）。
- 輸出：`sched-utilization`、`sched-rm-bound`、`sched-rm-result`、`sched-edf-result`、`sched-ram-used`、`sched-ram-headroom`、`scheduler-status`、`scheduler-feedback`。

### 計算

$$U=\sum_i C_i/T_i,\quad U_{RM}=n(2^{1/n}-1)$$

- 固定 n=3。預設 utilization `40.00%`、RM bound `77.98%`，RMS 充分條件通過、EDF 條件通過；RAM used `4352 B`、headroom `12032 B`。
- C、T、stack、kernel RAM 非負，但 T 必須大於 0 且 C ≤ T；RAM budget 必須大於 0。
- U ≤ RM bound 顯示 RMS 充分條件通過；超過 bound 只顯示「未由充分條件保證」，不可直接宣稱不可排程。EDF 只有 U ≤100% 才通過。RAM headroom <0 阻擋。
- 回饋說明 blocking、jitter、context switch 與優先權仍需 RTA／量測；stack 需 watermark 驗證。

## 7. 同步與交棒

### DOM

- 選擇：`sync-kind`（`event`、`data` 預設、`shared-resource`）、`sync-producer`（`isr` 預設、`task`）、`sync-consumers`（`one` 預設、`many`）、`sync-primitive`（`notification`、`binary-semaphore`、`queue` 預設、`mutex`）、`sync-priority-inheritance`（`yes` 預設、`no`）、`sync-lock-order`（`fixed` 預設、`unordered`、`none`）。
- 輸出：`sync-verdict`、`sync-blocker`、`sync-status`、`sync-feedback`。

### 判斷

- ISR 不可使用 mutex 或任何會阻塞的路徑。
- `data` 必須使用 queue；`shared-resource` 必須使用 mutex，且 priority inheritance 必須為 yes。
- 單一 consumer 的 `event` 可用 notification 或 binary semaphore；多 consumer event 使用 binary semaphore（本教材簡化）。
- lock order = unordered 一律阻擋；無巢狀鎖可用 none。
- 通過回饋需指出 ISR 使用 FromISR API 並在必要時喚醒較高優先任務；primitive 不能取代固定 lock order 與 timeout 策略。

## 8. Tickless 與低功耗 break-even

### DOM

- 輸入：`power-run-ma`（15）、`power-sleep-ua`（20）、`power-wake-ma`（10）、`power-wake-ms`（5）、`power-active-ms`（50）、`power-period-s`（10）。
- 輸出：`power-sleep-time`、`power-average-current`、`power-sleep-share`、`power-saving`、`power-break-even`、`low-power-status`、`low-power-feedback`。

### 計算

- `I_sleep` 由 µA 轉 mA；`T_sleep = period×1000 − active − wake`。
- 每週期平均電流：$(I_{run}T_{active}+I_{sleep}T_{sleep}+I_{wake}T_{wake})/T_{period}$。
- 相對全程 run 節省率 `1 − I_avg/I_run`；break-even sleep interval = $I_{wake}T_{wake}/(I_{run}-I_{sleep})$。
- 預設 sleep `9945 ms`、average 約 `0.100 mA`、sleep share `99.45%`、saving 約 `99.33%`、break-even 約 `3.34 ms`。
- 電流與時間不可負，run、period 必須大於 0；active + wake 不可超過 period；若 run ≤ sleep，break-even 無解並警告。
- 回饋提醒 tickless 只移除 tick 喚醒，還需關周邊時脈、處理 GPIO 漏電並量測完整電流剖面。

## 9. Watchdog、持久化與更新復原

### DOM

- 情境：`reliability-case`（`hang` 預設、`brownout-write`、`update-loss`、`stack-overflow`）。
- 七個 checkbox：`reliability-watchdog`、`reliability-bor`、`reliability-safe-state`、`reliability-stack-monitor` 預設勾選；`reliability-atomic-write`、`reliability-ab-slot`、`reliability-rollback` 預設未勾選，皆使用 `data-reliability-check`。
- 輸出：`reliability-first`、`reliability-second`、`reliability-count`、`reliability-next`、`reliability-status`、`reliability-feedback`。

### 判斷

- hang：先保留 watchdog reset cause／fault log，再查最後 heartbeat、ISR 與死結。
- brownout-write：先確認 BOR 與 safe state，再用雙區＋CRC/journal 做原子設定寫入。
- update-loss：先寫備援 slot 並驗證，再原子切換；啟動失敗 rollback。
- stack-overflow：先看 watermark／guard，再調整 stack 或移除不受控配置。
- 固定順序回報第一個未勾項；七項全數完成才顯示復原 gate 通過，但不代表 secure boot、安全更新或量產驗證完成。

## 10. 錯誤、可及性與手機

- 數值輸入在 `input/change` 即時計算；空值、NaN、Infinity、除零與物理範圍錯誤要清除舊結果並顯示原因。
- 動態回饋使用 `aria-live="polite"`；狀態同時用固定符號、文字、邊框與顏色。
- 表單有 label；按鈕 `type="button"`；checkbox 與 select 可鍵盤操作。
- `700px` 以下改為頂部可橫向捲動導覽與單欄；`390px` 所有 metric、task table、timeline、checklist 在容器內換行，頁面不可水平溢位。
- 尊重 `prefers-reduced-motion`；動態文字不得裁切或用省略號隱藏。

## 11. 驗收

- 語法、HTML、唯一 ID、DOM 契約、外部請求、相對路徑與 Pages 組裝通過。
- 所有預設數值以獨立計算交叉驗證；至少測 deadline、CPU >100%、RM 未保證、RAM 不足、ISR mutex、低功耗無解與 update gate 缺口。
- 若既有瀏覽器可用，驗證 `1440×900` 與 `390×844`；不得為此下載工具。

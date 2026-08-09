# IoT 連線模組、協定與網路互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[通用品質關卡](../../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是唯一執行契約。

## 1. 全域

- runtime 只有 `index.html`、`styles.css`、`app.js`；相對載入 CSS 與 defer JS。
- 模組鍵：`bearer-choice`、`host-link`、`at-engine`、`backoff`、`session`、`data-budget`、`keepalive`、`supervisor`。
- 使用 `data-module`、`data-nav`、`data-complete`、`data-reset-module`。
- progress key：`engineerStudy.iotConnectivity.v1`；ID：`progress-label`、`progress-fill`、`reset-progress`。
- 無外部字型、圖片、SVG、Canvas、CDN、API 或分析碼；手機與可及性要求沿用品質關卡。

## 2. Bearer 選型

- 輸入：`bearer-range`（`room`、`campus`、`wide` 預設）、`bearer-payload`（`small` 預設、`medium`、`high`）、`bearer-power`（`coin` 預設、`battery`、`mains`）、`bearer-infrastructure`（`private`、`operator` 預設）、`bearer-downlink`（`rare` 預設、`frequent`）。
- 輸出：`bearer-verdict`、`bearer-runner-up`、`bearer-tradeoff`、`bearer-status`、`bearer-feedback`。
- 決策順序：high payload 且 wide → LTE-M；high payload 非 wide → Wi-Fi；wide+operator+frequent → LTE-M；wide+operator+rare/small → NB-IoT；wide+private → LoRaWAN；campus+small+private+rare → LoRaWAN；campus+private → Thread；room+coin → BLE；其餘 → Wi-Fi。
- 預設 NB-IoT，runner-up LTE-M。回饋必須指出這是初篩，還需覆蓋、月租/部署、認證與實測。

## 3. Host 介面容量與 flow control

- 輸入：`host-baud`（115200）、`host-bits-byte`（10）、`host-payload-bytes`（512）、`host-message-rate`（10/s）、`host-burst-rate`（20000 B/s）、`host-burst-ms`（100）、`host-buffer-bytes`（2048）。
- 輸出：`host-capacity`、`host-steady-rate`、`host-utilization`、`host-burst-excess`、`host-buffer-headroom`、`host-status`、`host-feedback`。
- $R_{UART}=baud/bits_{byte}$；steady = payload×rate；utilization = steady/capacity；burst excess = $max(0,(R_{burst}-R_{UART})T_{burst})$；headroom = buffer−excess。
- 預設 capacity `11520 B/s`、steady `5120 B/s`、utilization `44.44%`、burst excess `848 B`、headroom `1200 B`。
- baud、bits、buffer 必須 >0；其餘非負。steady > capacity 或 headroom <0 阻擋；burst > capacity 但 buffer 足夠為警告並建議 RTS/CTS、DMA/環形緩衝或更快介面。

## 4. AT / URC 解析狀態

- 輸入：`at-state`（`idle`、`wait` 預設、`data`）、`at-line`（`ok`、`error`、`urc` 預設、`payload`、`prompt`）、`at-command-pending`（`yes` 預設、`no`）、`at-urc-handler`（`yes` 預設、`no`）、`at-transparent-guard`（`yes` 預設、`no`）。
- 輸出：`at-classification`、`at-action`、`at-next-state`、`at-status`、`at-feedback`。
- URC 與 pending command 獨立分流；缺 URC handler 阻擋。OK/ERROR 只有 wait+pending 才完成命令，否則警告並記錄 unsolicited line。prompt 只有 wait+pending 才可送 payload。payload 只有 data state 才進資料管道。data state 缺 transparent guard 阻擋。
- 預設分類 URC、派送 handler、命令維持 wait，通過。

## 5. 指數退避

- 輸入：`backoff-base`（2 s）、`backoff-attempt`（4）、`backoff-cap`（60 s）、`backoff-jitter`（20%）、`backoff-max-retries`（6）。
- 輸出：`backoff-nominal`、`backoff-min`、`backoff-max`、`backoff-cumulative`、`backoff-status`、`backoff-feedback`。
- $d_n=min(cap,base\cdot2^n)$；jitter range = $d_n(1\pm j/100)$；cumulative 為 attempt 0 到目前 attempt 的 nominal delay 加總（每項套 cap）。
- 預設 `32.0 s`、`25.6–38.4 s`、cumulative `62.0 s`。base/cap >0；attempt/max retries 為非負整數；0≤jitter≤100；attempt > max retries 阻擋並轉 supervisor。

## 6. 分層會話重建

- `session-case`：`network-drop` 預設、`dns-time`、`tls-fail`、`app-session`。
- 六個 checkbox：`session-registration`、`session-ip`、`session-time-dns` 預設勾選；`session-socket`、`session-tls`、`session-app` 預設未勾，皆為 `data-session-check`。
- 輸出：`session-first`、`session-second`、`session-count`、`session-next`、`session-status`、`session-feedback`。
- 固定 gate 順序 registration→IP→time/DNS→socket→TLS→app session；回報第一缺口，不可抵銷。情境診斷：network drop 先查註冊/URC 再 IP/socket；dns-time 先確認時間源/DNS 再 TLS；tls-fail 先時間/憑證設定再 socket/TLS log；app-session 先 transport 再訂閱/QoS/sequence 恢復。

## 7. Payload 與資料預算

- 輸入：`data-payload`（100 B）、`data-encoding-ratio`（0.6）、`data-overhead`（40 B）、`data-messages-day`（24）、`data-delivery-factor`（1.1）、`data-days`（30）。
- 輸出：`data-wire-message`、`data-daily`、`data-period`、`data-baseline`、`data-saving`、`data-status`、`data-feedback`。
- wire/message = payload×ratio + overhead；daily = wire×messages×factor；period = daily×days；baseline 用 ratio=1；saving = 1−period/baseline。
- 預設 `100.0 B/message`、`2640 B/day`、`79200 B/30d`、baseline `110880 B`、saving `28.57%`。
- payload/overhead/messages/days 非負但 days >0；0<ratio≤2；factor≥1。提醒實際還有 IP/TCP/TLS、連線握手與營運商計量。

## 8. Keepalive、重連與 PSM

- 輸入：`keepalive-seconds`（300）、`keepalive-session-hours`（24）、`keepalive-roundtrip-bytes`（100）、`keepalive-reports`（24/day）、`keepalive-reconnect-bytes`（5000）、`keepalive-reachability`（`frequent` 預設、`rare`）。
- 輸出：`keepalive-wakes`、`keepalive-bytes`、`reconnect-bytes`、`keepalive-byte-winner`、`keepalive-verdict`、`keepalive-status`、`keepalive-feedback`。
- wakes = ceil(session seconds / keepalive)；keepalive bytes = wakes×roundtrip；reconnect bytes = reports×reconnect bytes。
- 預設 `288`、`28800 B`、`120000 B`，byte winner 為 keepalive；frequent 建議持續會話。rare 一律建議評估 PSM/eDRX/批次上傳，即使 reconnect bytes 較高，並說明 bytes 不等於能耗。
- keepalive/session/reports 必須 >0；byte 欄非負。

## 9. Supervisor 與故障升級

- `supervisor-case`：`no-response` 預設、`deregister`、`socket-drop`、`buffer-overflow`。
- 七項 checkbox：`supervisor-log`、`supervisor-timeout`、`supervisor-backoff` 預設勾；`supervisor-soft-reset`、`supervisor-hard-reset`、`supervisor-flow-control`、`supervisor-watchdog` 預設未勾，皆為 `data-supervisor-check`。
- 輸出：`supervisor-first`、`supervisor-second`、`supervisor-count`、`supervisor-blocker`、`supervisor-status`、`supervisor-feedback`。
- 必要項：no-response 需 log/timeout/soft/hard/watchdog；deregister 需 log/timeout/backoff；socket-drop 需 log/timeout/backoff；buffer-overflow 需 log/flow-control。缺一即阻擋，不以總分抵銷。
- 診斷：no-response 先保存 AT log/最後命令，再 soft reset→hard reset/power cycle；deregister 先看 URC/訊號與註冊原因，再 capped backoff；socket-drop 先區分 bearer/IP/socket，再重建上層會話；buffer-overflow 先看 RTS/CTS/環形緩衝高水位，再降低 burst 或升級介面。

## 10. 錯誤、手機與驗收

- 空值、NaN、Infinity、除零、負值與選項錯誤清除舊結果；所有控制即時更新。
- 狀態使用文字、固定符號、邊框與顏色；`aria-live="polite"`；表單 label、button type 與鍵盤操作完整。
- 700px 以下頂部橫向導覽與單欄；390px metrics、狀態機、gate、數值與長字串不可水平溢位。
- 驗收預設值、steady/burst overflow、URC interleave、retry exhaustion、session gate、ratio 錯誤、rare reachability 與四種 supervisor case。

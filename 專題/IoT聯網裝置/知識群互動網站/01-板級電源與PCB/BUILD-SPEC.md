# IoT 板級電源與 PCB 互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[通用品質關卡](../../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是唯一執行契約；內容盤點與題型草案只能補充，不得覆蓋本檔。

## 1. 全域

- 執行期只使用 `index.html`、`styles.css`、`app.js`，資源路徑為 `./styles.css`、`./app.js`，script 使用 `defer`。
- 模組鍵：`power-tree`、`regulator`、`battery`、`decoupling`、`schematic`、`stackup`、`rf-layout`、`release`。
- section 使用 `data-module`；導覽使用 `data-nav`；完成使用 `data-complete`；單模組重設使用 `data-reset-module`。
- 進度 key：`engineerStudy.iotPowerPcb.v1`；必備 `progress-label`、`progress-fill`、`reset-progress`。
- 純 HTML/CSS/JavaScript；無外部字型、圖片、SVG、Canvas、CDN、分析碼或遠端 API。
- 亮色中性工作區搭配深灰導覽，使用黃、藍、綠、紅多種功能色；不可由單一暗藍或米色主導。
- 所有 `letter-spacing: 0`；字級不用 `vw`、`clamp`；卡片圓角不超過 8px。

## 2. 電源樹與裕度

### DOM

- 輸入：`tree-margin`（% 30）、`load-digital`（mA 60）、`load-radio-average`（mA 100）、`load-radio-peak`（mA 2000）、`load-clean`（mA 20）、`load-core`（mA 10）。
- 固定電壓：數位 3.3 V、radio 3.8 V、clean 3.3 V、core 1.8 V。
- 輸出：`rail-digital-design`、`rail-radio-design`、`rail-radio-peak`、`rail-clean-design`、`rail-core-design`、`tree-continuous-power`、`tree-peak-power`、`tree-status`、`tree-feedback`。

### 計算

- 設計電流 $I_{design}=I(1+m/100)$；連續功率為各 rail 的 $VI$ 相加；峰值功率以 radio peak 取代 radio average 後相加，再套裕度。
- 預設：`78 mA`、`130 mA`、radio peak `2600 mA`、`26 mA`、`13 mA`；連續功率含裕度 `0.861 W`，峰值功率含裕度約 `10.247 W`。
- 所有負載與裕度不可小於 0；radio peak 不得低於 radio average；裕度上限 200%。
- 回饋必須說明 clean rail 與 radio 高電流域分開、峰值不能用平均值取代。

## 3. LDO / buck 熱效率

### DOM

- 輸入：`reg-vin`（V 5）、`reg-vin-min`（V 4.5）、`reg-vout`（V 3.3）、`reg-current`（A 0.2）、`reg-dropout`（V 0.2）、`reg-theta`（°C/W 50）、`reg-ta`（°C 25）、`buck-efficiency`（% 90）、`noise-priority`（`balanced`、`quiet`、`efficiency`）。
- 輸出：`ldo-loss`、`ldo-efficiency`、`ldo-junction`、`dropout-headroom`、`buck-loss`、`buck-junction`、`regulator-verdict`、`regulator-status`、`regulator-feedback`。

### 計算

$$P_{LDO}=(V_{in}-V_{out})I,\quad \eta_{LDO}=V_{out}/V_{in},\quad T_j=T_a+\theta_{JA}P_{loss}$$
$$P_{buck,loss}=V_{out}I(1/\eta-1)$$

- dropout headroom = $V_{in,min}-V_{out}-V_{dropout}$。
- 預設：LDO `0.340 W`、`66.0%`、`42.0°C`；headroom `1.000 V`；buck loss `0.073 W`、同熱阻近似 `28.7°C`。
- $V_{in}>V_{out}>0$、$V_{in,min}>0$、電流/熱阻正值、$0<\eta\le100%$；headroom < 0 顯示 dropout 風險。
- 判斷：quiet 偏 LDO、efficiency 偏 buck、balanced 建議吵雜域 buck 並只替 clean rail 使用 LDO；仍需顯示熱與 headroom 證據。

## 4. 睡眠漏電與電池

### DOM

- 輸入：`sleep-current`（mA 0.01）、`sleep-share`（% 99）、`active-current`（mA 30）、`active-share`（% 0.9）、`tx-current`（mA 200）、`tx-share`（% 0.1）、`regulator-iq`（mA 0.005）、`board-leakage`（mA 0.002）、`battery-capacity`（mAh 2000）、`battery-derating`（0.8）。
- 輸出：`duty-average`、`hidden-current`、`total-average`、`battery-hours`、`battery-days`、`leakage-share`、`battery-status`、`battery-feedback`。

### 計算

$$I_{duty}=\sum I_i p_i/100,\quad I_{total}=I_{duty}+I_q+I_{leak},\quad T=C\eta/I_{total}$$

- 三個 share 必須合計 100%，容許誤差 0.01%；電流不可負、容量正值、$0<\eta\le1$。
- 預設：duty `0.4799 mA`、hidden `0.0070 mA`、total `0.4869 mA`、約 `3286.1 h`／`136.9 d`、hidden 佔 `1.44%`。
- 回饋指出 $I_q$、LED、上拉與未關周邊在 sleep 時可能主導結果。

## 5. 瞬態與去耦

### DOM

- 輸入：`pulse-step`（A 0.5）、`pulse-duration`（ms 0.2）、`pulse-esr`（Ω 0.05）、`pulse-capacitance`（µF 470）、`pulse-allowable`（V 0.3）。
- 輸出：`esr-drop`、`capacitive-drop`、`total-drop`、`target-impedance`、`effective-impedance`、`minimum-capacitance`、`decoupling-status`、`decoupling-feedback`。

### 計算

$$\Delta V_{ESR}=\Delta I\,ESR,\quad \Delta V_C=\Delta I\Delta t/C,\quad Z_{target}=\Delta V_{allow}/\Delta I$$

- effective impedance 以 $\Delta V_{total}/\Delta I$ 作教學近似；$C_{min}=\Delta I\Delta t/(\Delta V_{allow}-\Delta V_{ESR})$。
- 預設：`0.025 V`、`0.213 V`、`0.238 V`、target `0.600 Ω`、effective `0.476 Ω`、minimum `363.6 µF`，通過。
- 電流步階、時間、ESR 可為 0；C 與 allowable 必須大於 0。若 allowable ≤ ESR drop，最低電容無解並明確回報。
- 回饋必須提到電容要靠近模組、短粗回路以降低 ESL，正式設計還要看 regulator 動態響應。

## 6. 原理圖 / ERC / BOM release

- 六個 checkbox：`check-decoupling`、`check-reset-boot`、`check-package-part`、`check-testpoints`、`check-interface-protection`、`check-erc`，均使用 `data-schematic-check`。
- 預設前三項勾選、後三項未勾選。
- 輸出：`schematic-count`、`schematic-next`、`schematic-status`、`schematic-feedback`。
- 依固定順序回報第一個缺口；全部完成才顯示「可進入 layout review」，但明示不代表設計正確或可量產。
- 重設必須恢復預設勾選狀態。

## 7. 疊層、回流與 SI

### DOM

- 輸入：`stackup-layers`（`4` 預設、`2`）、`signal-edge`（`fast` 預設、`slow`）、`route-length`（`long` 預設、`short`）、`reference-plane`（`continuous` 預設、`broken`）、`crosses-split`（`no` 預設、`yes`）、`controlled-impedance`（`yes` 預設、`no`）。
- 輸出：`return-risk`、`si-risk`、`stackup-score`、`stackup-status`、`stackup-feedback`。

### 判斷

- 跨 split +4；broken reference +3；fast + 2-layer +2；fast + long + 未受控阻抗 +2；2-layer 基礎風險 +1。
- 0–1 低風險、2–4 需 review、5 以上阻擋。預設 0 分。
- 回饋必須先處理跨裂縫與回流，再談線寬；說明邊緣速度比時脈頻率更能決定 SI 風險。
- 此分數只是教材規則，不是阻抗計算或 sign-off。

## 8. RF 饋線與天線

- 輸入：`antenna-type`（`chip`、`pcb`、`external`）。
- 七個 checkbox：`rf-50ohm`、`rf-short-route`、`rf-ground-reference`、`rf-pi-match`、`rf-keepout`、`rf-vendor-guide`、`rf-metal-clear`，均有 `data-rf-check`，預設全勾。
- 輸出：`rf-count`、`rf-blocker`、`rf-status`、`rf-feedback`。
- 所有類型都需 50 Ω、短路徑、完整參考地、π 位置及 vendor guideline；PCB/晶片天線另要求 keep-out 與電池/金屬淨空。
- 任何必要項缺失即阻擋；不可用分數抵銷關鍵缺口。
- 回饋說明 50 Ω 線寬依板廠疊層確認，網站不自行給幾何尺寸。

## 9. EMC / ESD / DFM bring-up

### DOM

- 選擇：`failure-case`（`tx-reset`、`poor-range`、`emissions`、`no-program`）、`esd-location`（`connector`、`ic`、`none`）、`esd-path`（`protected-first`、`bypass`）。
- 五個 checkbox：`release-testpoints`、`release-dfm-rules`、`release-manufacturing-files`、`release-bringup-plan`、`release-reflow-review`，使用 `data-release-check`，預設全勾。
- 輸出：`diagnosis-first`、`diagnosis-second`、`release-count`、`release-status`、`release-feedback`。

### 判斷

- tx-reset：先量 radio rail/電流脈衝，再查 bulk、ESR、走線。
- poor-range：先查 keep-out/vendor guideline，再查 50 Ω 饋線與匹配。
- emissions：先查高頻迴路/回流，再查 slew rate、濾波與屏蔽。
- no-program：先查 SWD/JTAG 可達與 BOOT/RESET，再查供電與焊接。
- ESD 必須在 connector 且訊號先過保護再進 IC；五項 release checks 全數完成才通過。
- 通過仍不代表 EMC、ESD、DFM 或量產驗證完成。

## 10. 錯誤、可及性與手機

- 所有數值輸入在 `input/change` 即時計算；空值、NaN、Infinity、除零與物理範圍錯誤要清除舊結果並顯示原因。
- 所有動態回饋 `aria-live="polite"`；狀態用固定符號、文字、邊框與顏色。
- 表單有 label；按鈕使用 `type="button"`；checkbox 必須可鍵盤切換。
- `700px` 以下改為頂部可橫向捲動導覽與單欄；`390px` 所有 rail、metric、checklist、診斷列在容器內換行，頁面不可水平溢位。
- 尊重 `prefers-reduced-motion`；動態文字不得裁切或用省略號隱藏。

## 11. 驗收

- 語法、HTML、唯一 ID、DOM 契約、外部請求、相對路徑與 Pages 組裝通過。
- 以上所有預設數值以獨立計算交叉驗證；至少測一個錯誤或阻擋案例。
- 若既有瀏覽器可用，驗證 `1440×900` 與 `390×844`；不得為此下載工具。

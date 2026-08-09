# 電力系統互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[品質關卡](../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是 HTML/CSS Worker 與 JavaScript Worker 的共同契約。若草案與本檔衝突，以本檔為準。

## 1. 執行期與全域契約

- 只發布 `index.html`、`styles.css`、`app.js`。
- `index.html` 使用 `./styles.css` 與 `./app.js`，script 必須 `defer`。
- 模組鍵固定為：`transmission`、`perunit`、`threephase`、`flow`、`fault`、`protection`、`stability`、`dispatch`。
- 每個 section 使用 `data-module="<鍵>"`；導覽按鈕使用 `data-nav="<鍵>"`。
- 每個模組有 `data-complete="<鍵>"` 完成按鈕。進度存於 `localStorage` 的 `engineerStudy.powerSystems.v1`；儲存失敗仍可使用網站。
- 必備全域 ID：`progress-label`、`progress-fill`、`reset-progress`。進度軌有 `role="progressbar"` 與完整 aria 數值。
- 介面風格是安靜、密實的控制室工作台；不可做 landing page、巨型 hero、裝飾卡片牆或漸層背景。
- 不使用 viewport 單位縮放字級；所有 `letter-spacing` 為 `0`。

## 2. 模組 01：高壓輸電

### DOM

- 輸入：`transmit-power`（MW，預設 100）、`transmit-pf`（預設 1）、`transmit-resistance`（每相 Ω，預設 2）、`voltage-low`（kV，預設 69）、`voltage-high`（kV，預設 345）。
- 輸出：`current-low`、`current-high`、`loss-low`、`loss-high`、`loss-ratio`、`transmission-feedback`。
- 用 CSS/HTML 畫出「發電 → 升壓 → 輸電 → 降壓 → 負載」文字節點，不使用圖片。

### 計算

$$I=\frac{P}{\sqrt3 V_L PF},\qquad P_{loss}=3I^2R$$

- 預設：低壓電流 `836.7 A`、高壓電流 `167.3 A`、低壓線損 `4.201 MW`、高壓線損 `0.168 MW`、低壓線損為高壓 `25.0` 倍。
- 所有值需為有限數；功率、電壓、PF、電阻皆須大於 0，且 PF 不得大於 1。
- 回饋說明電壓提高 5 倍會使同功率電流降為 1/5、電阻損降為 1/25；不含電暈、無功、穩定與設備成本。

## 3. 模組 02：標么制

### DOM

- 輸入：`base-power`（MVA 100）、`base-voltage`（kV 161）、`actual-voltage`（kV 154）、`actual-impedance`（Ω 12）、`old-zpu`（0.1）、`old-base-power`（MVA 50）、`old-base-voltage`（kV 161）、`new-base-power`（MVA 100）、`new-base-voltage`（kV 161）。
- 輸出：`base-current`、`base-impedance`、`voltage-pu`、`impedance-pu`、`converted-zpu`、`perunit-feedback`。

### 計算

$$I_B=\frac{S_B}{\sqrt3 V_B},\quad Z_B=\frac{V_B^2}{S_B},\quad x_{pu}=\frac{x}{x_B}$$
$$Z_{pu}^{new}=Z_{pu}^{old}\frac{S_B^{new}}{S_B^{old}}\left(\frac{V_B^{old}}{V_B^{new}}\right)^2$$

- 單位成對使用 MVA/kV 時，$Z_B=V_{kV}^2/S_{MVA}$ Ω；$I_B=S_{MVA}10^3/(\sqrt3V_{kV})$ A。
- 預設：`358.6 A`、`259.21 Ω`、`0.9565 p.u.`、`0.0463 p.u.`、換基準後 `0.2000 p.u.`。
- 所有基準量必須大於 0；實際阻抗與舊標么阻抗不可小於 0。

## 4. 模組 03：三相功率與功因改善

### DOM

- 輸入：`pf-voltage`（kV 11.4）、`pf-real-power`（kW 1000）、`pf-initial`（0.75）、`pf-target`（0.95）。
- 輸出：`current-initial`、`current-target`、`reactive-initial`、`reactive-target`、`capacitor-kvar`、`loss-reduction`、`threephase-feedback`。

### 計算

$$I=\frac{P}{\sqrt3 V_L PF},\quad Q=P\tan(\cos^{-1}PF),\quad Q_C=Q_{initial}-Q_{target}$$

- 預設：`67.53 A` → `53.31 A`、`881.92 kvar` → `328.68 kvar`、補償 `553.23 kvar`、同電阻線損下降 `37.67%`。
- $0<PF\le1$，且目標 PF 必須大於等於初始 PF；否則不得輸出負補償值。
- 回饋區分 kW、kvar、kVA，並說明補償不會降低負載真正消耗的 kW。

## 5. 模組 04：三母線 DC 潮流與 N-1

### 固定拓樸與 DOM

- Bus 1 為 slack，$\theta_1=0$；Bus 2 為發電注入；Bus 3 為負載。
- 線路：1–2 $x=0.20$ p.u./限額 80 MW；1–3 $x=0.25$ p.u./限額 80 MW；2–3 $x=0.40$ p.u./限額 70 MW；基準 100 MVA。
- 輸入：`flow-generation`（Bus 2 MW，40）、`flow-load`（Bus 3 MW，100）、`contingency`（`none`、`line-12`、`line-13`、`line-23`）。
- 輸出：`slack-power`、`angle-bus-2`、`angle-bus-3`、`flow-12`、`flow-13`、`flow-23`、`flow-status`、`flow-feedback`。
- 三條線以固定尺寸 HTML/CSS 列呈現 MW、方向、利用率與正常/跳脫/過載狀態；不得以顏色作唯一訊號。

### 計算

$$P_{ik}=\frac{\theta_i-\theta_k}{x_{ik}},\qquad B'\theta=P$$

- 只解 Bus 2、3 的 2×2 線性方程；任一跳脫線從矩陣移除。行列式接近 0 時回報孤島/不可解，不產生 Infinity 或 NaN。
- 預設無跳脫：slack `60.0 MW`、$\theta_2=0.1348°$、$\theta_3=-8.7629°$；$P_{12}=-1.18$、$P_{13}=61.18$、$P_{23}=38.82$ MW，全部未過載。
- 跳脫 1–3 時：$P_{12}=60$ MW、$P_{23}=100$ MW，2–3 超過 70 MW，N-1 不通過。
- DC 潮流忽略電阻、損失、無功與電壓幅值變化；slack 自動補平衡。

## 6. 模組 05：故障序網

### DOM

- 輸入：`fault-type`（`three-phase`、`slg`、`line-line`）、`fault-voltage`（p.u. 1）、`z-positive`（0.2）、`z-negative`（0.2）、`z-zero`（0.5）、`fault-base-power`（MVA 100）、`fault-base-voltage`（kV 161）。
- 輸出：`sequence-positive`、`sequence-negative`、`sequence-zero`、`fault-current-pu`、`fault-current-ka`、`fault-feedback`。
- 三序網以三個固定列顯示「使用 / 不使用」及串接方式。

### 計算

- 三相：$I_f=V_f/Z_1$，預設 `5.000 p.u.`，只使用正序。
- 單相接地：$I_a=3V_f/(Z_1+Z_2+Z_0)$，預設 `3.333 p.u.`，三序串聯。
- 線間：線電流幅值 $I_{LL}=\sqrt3V_f/(Z_1+Z_2)$，預設 `4.330 p.u.`，使用正、負序。
- $I_B=S_B10^3/(\sqrt3V_B)$ A；預設基準電流 `0.3586 kA`。kA 輸出為故障標么值乘基準電流。
- 電壓與基準量須大於 0；阻抗不可小於 0，且使用中的阻抗和必須大於 0。

## 7. 模組 06：保護協調

### DOM

- 輸入：`relay-fault-current`（A 1200）、`relay-main-pickup`（A 200）、`relay-main-tms`（0.15）、`relay-backup-pickup`（A 300）、`relay-backup-tms`（0.9）、`relay-margin-target`（s 0.2）。
- 輸出：`relay-main-time`、`relay-backup-time`、`relay-margin`、`relay-status`、`relay-feedback`。

### 教學曲線

$$t=\frac{TMS}{I/I_{pickup}-1}$$

- 這只是無量綱反時限教學曲線，不是 IEC/IEEE 實際曲線，介面必須明示。
- 若 $I\le I_{pickup}$，該電驛顯示「不拾取」，不可算出負時間。
- 預設主保護 `0.030 s`、後備 `0.300 s`、裕度 `0.270 s`，大於目標 `0.200 s`，協調通過。
- 後備時間必須晚於主保護，且差值達目標；回饋說明選擇性與後備關係。

## 8. 模組 07：穩定度與頻率

使用 `data-stability-mode="angle"` 與 `data-stability-mode="frequency"` 的 segmented controls 切換兩個面板。

### 功角 / 等面積 DOM 與算法

- 輸入：`stability-pm`（0.8 p.u.）、`stability-pre-max`（1.2）、`stability-fault-max`（0.2）、`stability-post-max`（1.0）、`stability-h`（s 5）、`clearing-time`（s 0.1）。
- 輸出：`initial-angle`、`clearing-angle`、`accelerating-area`、`decelerating-area`、`stability-status`、`stability-feedback`。
- 初始角：$\delta_0=\sin^{-1}(P_m/P_{max,pre})$。若 $P_m\ge P_{max,pre}$ 或 $P_m\ge P_{max,post}$，直接回報沒有穩定平衡點。
- 故障期間以固定 $dt=0.0005s$ 積分擺動方程，60 Hz：$\ddot\delta=\omega_s(P_m-P_{max,fault}\sin\delta)/(2H)$，求 $\delta_c$。
- 不穩定平衡角 $\delta_u=\pi-\sin^{-1}(P_m/P_{max,post})$。
- $A_{acc}=P_m(\delta_c-\delta_0)+P_{max,fault}(\cos\delta_c-\cos\delta_0)$。
- $A_{dec,max}=P_{max,post}(\cos\delta_c-\cos\delta_u)-P_m(\delta_u-\delta_c)$。
- $A_{dec,max}\ge A_{acc}$ 且 $\delta_c<\delta_u$ 才標示穩定。使用指定步長時，預設約為 $\delta_0=41.81°$、$\delta_c=49.01°$、$A_{acc}=0.0827$、$A_{dec}=0.1688$，穩定。

### 頻率 DOM 與算法

- 輸入：`frequency-nominal`（Hz 60）、`frequency-h`（s 5）、`frequency-step`（p.u. 0.1）、`frequency-droop`（R 0.05）、`frequency-damping`（D 1）。
- 輸出：`frequency-rocof`、`frequency-steady`、`frequency-feedback`。
- 初始 $df/dt=-f_0\Delta P/(2H)$；droop 教學穩態 $\Delta f_{pu}=-\Delta P/(D+1/R)$。
- 預設：RoCoF `-0.600 Hz/s`、一次調頻後 `59.714 Hz`。此模型不含 governor 時間常數、AGC、限幅與負載卸除。

## 9. 模組 08：經濟調度與現代電網

### DOM

- 系統輸入：`dispatch-load`（MW 190）、`dispatch-renewable`（MW 30）、`dispatch-storage`（MW 10，正值放電、負值充電）、`dispatch-reserve`（MW 20）。
- G1：`g1-a`（0.01）、`g1-b`（10）、`g1-min`（20）、`g1-max`（120）。
- G2：`g2-a`（0.02）、`g2-b`（8）、`g2-min`（10）、`g2-max`（100）。
- 輸出：`net-load`、`g1-output`、`g2-output`、`dispatch-lambda`、`dispatch-cost`、`reserve-headroom`、`dispatch-status`、`dispatch-feedback`。

### 計算

$$C_i=a_iP_i^2+b_iP_i,\qquad \lambda=2a_iP_i+b_i$$

- 淨傳統機組負載 = 負載 − 再生能源 − 儲能放電。
- 先用等增量成本解兩機，再以 active-set 方式處理上下限：超限機組固定於界限，剩餘負載交給另一機。
- 預設淨負載 `150 MW`：G1 `66.67 MW`、G2 `83.33 MW`、$\lambda=11.333$、總成本 `1516.67` 教學單位/小時、向上餘裕 `70 MW`，高於 20 MW 備轉要求。
- 淨負載低於最小出力總和時顯示過剩/需削減或停機；高於最大出力總和時顯示容量不足。這不是 UC、含網損 ED 或真實市場出清。

## 10. 互動與錯誤契約

- 所有數值輸入在 `input` 與 `change` 時即時計算；空值、非有限值、除以零與超出物理範圍都顯示繁中錯誤，不留舊結果冒充新結果。
- status 同時使用文字、符號/邊框與顏色；所有動態回饋使用 `aria-live="polite"`。
- 所有按鈕皆為 `<button type="button">`；表單輸入有 `<label for>`；自訂可點節點需有 role、tabindex、Enter/Space。
- 每個模組有一個重設案例按鈕 `data-reset-module="<鍵>"`，只重設該模組預設值。

## 11. 響應式契約

- 桌面側欄可 sticky；`700px` 以下改為頂部橫向捲動導覽，內容單欄。
- `390px` 下所有輸入列、結果列、三母線與序網列必須在容器內換行；禁止頁面水平溢位。
- 固定圖表以 `minmax(0,1fr)`、穩定高度及百分比條呈現；動態數字不得改變欄寬。
- 尊重 `prefers-reduced-motion`，無動畫也需完整可用。

## 12. 驗收

- `node --check app.js`、HTML 解析、ID 契約、外部請求掃描與 Pages 組裝必須通過。
- 以本檔所有預設案例人工交叉計算。
- 若既有瀏覽器可用，檢查 `1440×900`、`390×844`；不得為此下載工具。

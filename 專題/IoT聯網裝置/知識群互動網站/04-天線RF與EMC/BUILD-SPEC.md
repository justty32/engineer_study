# IoT 天線、RF、EMC 與法規邊界互動網站建置規格

← [專案簡報](PROJECT-BRIEF.md)｜[通用品質關卡](../../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

本檔是唯一執行契約；補充文件不得覆蓋本檔。

## 1. 全域

- runtime 只有 `index.html`、`styles.css`、`app.js`；相對載入 CSS 與 defer JS。
- 模組鍵：`wave-region`、`link-budget`、`impedance-match`、`rf-layout`、`antenna-choice`、`detuning`、`edge-emi`、`compliance`。
- 使用 `data-module`、`data-nav`、`data-complete`、`data-reset-module`。
- progress key：`engineerStudy.iotRfAntenna.v1`；ID：`progress-label`、`progress-fill`、`reset-progress`。
- 無外部字型、圖片、SVG、Canvas、CDN、API 或分析碼。亮色工程工作區搭配深灰導覽，多種功能色；卡片半徑不超過 8px，`letter-spacing: 0`，字級不用 viewport scaling。

## 2. 波長、電氣長度與遠場

- 輸入：`wave-frequency-mhz`（2400）、`wave-epsilon-eff`（4）、`wave-trace-mm`（50）、`wave-size-mm`（80）、`wave-distance-mm`（1000）。
- 輸出：`wave-free-wavelength`、`wave-guided-wavelength`、`wave-phase`、`wave-far-boundary`、`wave-region-verdict`、`wave-status`、`wave-feedback`。
- $\lambda_0=c/f$；$\lambda_g=\lambda_0/\sqrt{\varepsilon_{eff}}$；phase = $360\ell/\lambda_g$；遠場邊界 $r_F=2D^2/\lambda_0$。
- 預設約 `124.91 mm`、`62.46 mm`、`288.2°`、`102.47 mm`，觀測點為遠場。
- frequency、epsilon 必須 >0；其餘非負。遠場公式只適合以最大尺寸 D 粗分區域，不表示量測場地已符合標準。

## 3. 自由空間鏈路預算

- 輸入：`link-tx-dbm`（10）、`link-tx-gain-dbi`（2）、`link-rx-gain-dbi`（2）、`link-loss-db`（2）、`link-frequency-mhz`（2400）、`link-distance-km`（0.1）、`link-sensitivity-dbm`（-95）、`link-required-margin-db`（10）。
- 輸出：`link-fspl`、`link-received`、`link-margin`、`link-headroom`、`link-status`、`link-feedback`。
- $FSPL=32.44+20\log_{10}(f_{MHz})+20\log_{10}(d_{km})$；$P_R=P_T+G_T+G_R-L-FSPL$；margin = $P_R-sensitivity$；headroom = margin−required margin。
- 預設約 `80.04 dB`、`-68.04 dBm`、`26.96 dB`、`16.96 dB`，通過。
- frequency、distance >0；loss、required margin 非負；其餘為有限數。headroom <0 阻擋；0–3 dB 為警告。回饋必須提醒 Friis 不含多徑、遮蔽、干擾、封包重送與實際天線效率。

## 4. 阻抗失配

- 輸入：`match-z0`（50 Ω）、`match-r`（75 Ω）、`match-x`（0 Ω）。
- 輸出：`match-gamma`、`match-return-loss`、`match-vswr`、`match-reflected-power`、`match-loss`、`match-status`、`match-feedback`。
- 對 $Z_L=R+jX$：$|\Gamma|=|Z_L-Z_0|/|Z_L+Z_0|$；RL = $-20\log_{10}|\Gamma|$；VSWR = $(1+|\Gamma|)/(1-|\Gamma|)$；反射功率 = $|\Gamma|^2$；mismatch loss = $-10\log_{10}(1-|\Gamma|^2)$。
- 預設 `0.200`、`13.98 dB`、`1.50`、`4.00%`、`0.18 dB`。
- Z0 >0、R≥0、X 有限。完美匹配的 RL 顯示 `∞`；完全反射的 VSWR／loss 顯示 `∞`，不得把 Infinity 放進數值結果。VSWR ≤2 通過，2–3 警告，>3 阻擋；回饋說明良好 S11 不等於高輻射效率。

## 5. RF 饋線與 layout gate

- `layout-case`：`pcb` 預設、`chip`、`external`。
- 七個 checkbox：`layout-impedance`、`layout-ground`、`layout-short`、`layout-vias` 預設勾；`layout-pi`、`layout-keepout`、`layout-guideline` 預設未勾，皆為 `data-layout-check`。
- 輸出：`layout-first`、`layout-second`、`layout-count`、`layout-blocker`、`layout-status`、`layout-feedback`。
- 固定 gate 順序：controlled impedance→continuous ground→short/no stub→ground vias/connector launch→π match→antenna keep-out→vendor/module guideline。
- PCB／chip 天線七項皆必要；external 不要求天線 keep-out，但仍要求其餘六項。缺一即阻擋，不以總數抵銷。回饋指出實際線寬、間距與 via 由板廠疊層及模組 guideline 決定。

## 6. 天線型式初篩

- 輸入：`antenna-enclosure`（`plastic` 預設、`metal`）、`antenna-space`（`tiny` 預設、`roomy`）、`antenna-cert`（`reuse` 預設、`custom`）、`antenna-tuning`（`limited` 預設、`vna`）、`antenna-cost`（`low` 預設、`flexible`）。
- 輸出：`antenna-verdict`、`antenna-runner-up`、`antenna-tradeoff`、`antenna-status`、`antenna-feedback`。
- metal enclosure → 認證清單內的外接天線；reuse+limited → 認證清單內的外接天線；tiny+VNA → 晶片天線；roomy+VNA+low → PCB 天線；limited → 外接天線；tiny → 晶片天線；其餘 → PCB 天線。
- 預設選「認證清單內的外接天線」，備選晶片天線。所有結果均為初篩；必須核對頻段、效率、機構、線纜損耗、天線清單與實測。

## 7. 介質負載與失諧

- 輸入：`detune-frequency-mhz`（2400）、`detune-epsilon-before`（2.5）、`detune-epsilon-after`（3.2）、`detune-bandwidth-mhz`（100）。
- 輸出：`detune-new-frequency`、`detune-shift-mhz`、`detune-shift-percent`、`detune-band-edge`、`detune-status`、`detune-feedback`。
- 簡化固定幾何模型：$f_{new}=f_0\sqrt{\varepsilon_{before}/\varepsilon_{after}}$；shift = new−original；原可用頻帶以 $f_0\pm BW/2$ 表示。
- 預設約 `2121.32 MHz`、`-278.68 MHz`、`-11.61%`，落在原頻帶外並阻擋。
- frequency、epsilon、bandwidth >0。此模型只顯示介質負載方向與敏感度，不可用來取代 VNA、暗室、OTA 或整機調諧。

## 8. Edge rate 與 EMI 邊界

- 輸入：`edge-rise-ns`（2）、`edge-epsilon-eff`（3.5）、`edge-trace-mm`（80）。
- 輸出：`edge-knee-frequency`、`edge-guided-wavelength`、`edge-critical-length`、`edge-length-ratio`、`edge-verdict`、`edge-status`、`edge-feedback`。
- 教學判準：$f_{knee}=0.5/t_r$；$\lambda_g=c/(f_{knee}\sqrt{\varepsilon_{eff}})$；critical length = $\lambda_g/10$；ratio = trace/critical。
- 預設 `250.0 MHz`、約 `641.0 mm`、`64.1 mm`、ratio 約 `1.25`，需以傳輸線／回流觀點處理。
- rise、epsilon >0，trace 非負。ratio ≥1 警告，≥2 阻擋。回饋指出關鍵是 edge rate，不是標稱 clock；分割地、迴路面積與外接線仍須另查。

## 9. 預認證與整機法規 gate

- `compliance-case`：`same-integration` 預設、`antenna-change`、`enclosure-change`、`new-market`；`compliance-near-body`：`no` 預設、`yes`。
- 七個 checkbox：`compliance-market`、`compliance-module-scope`、`compliance-antenna-list` 預設勾；`compliance-rf-prescan`、`compliance-emc-prescan`、`compliance-sar`、`compliance-docs` 預設未勾，皆為 `data-compliance-check`。
- 輸出：`compliance-first`、`compliance-second`、`compliance-count`、`compliance-blocker`、`compliance-status`、`compliance-feedback`。
- same-integration 需 market/module scope/antenna list/EMC prescan/docs；antenna-change、enclosure-change、new-market 另需 RF prescan；near-body=yes 一律另需 SAR/暴露評估。
- 固定順序回報第一缺口，不以總數抵銷。通過只代表送測前 gate 閉合，不是認證、法律意見或主管機關核准。

## 10. 錯誤、手機與驗收

- 空值、NaN、Infinity、除零、負值與選項錯誤清除舊結果；所有控制即時更新。
- 狀態使用文字、固定符號、邊框與顏色；`aria-live="polite"`；label、button type 與鍵盤操作完整。
- 700px 以下頂部橫向導覽與單欄；390px metrics、複數阻抗、gate、長字串不可水平溢位。
- 驗收預設值、零反射／完全反射、link margin 不足、layout 三情境、天線決策、失諧、edge ratio 與四種 compliance case。

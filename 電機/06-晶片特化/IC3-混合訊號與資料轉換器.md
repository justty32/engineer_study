# IC3 混合訊號與資料轉換器（Mixed-Signal & Data Converters）概論

> 晶片特化第 3 科。
> 名詞對照見 [中英名詞對照表 → 混合訊號](../中英名詞對照表-3.md#混合訊號)。

## 這科在學什麼

類比與數位共存的 IC 設計，焦點是把訊號在兩個世界轉換的「橋」—— **ADC** 與 **DAC**。涵蓋取樣理論在 IC 端的實作、各種轉換器架構、混合訊號版圖、整合議題。

是電路 / 通訊 / 控制 / 感測 / 影像 / 量測各路工程的交會處。

## 第 1 章　取樣與量化的 IC 視角

### 1.1 採樣保持（S/H）
- **bottom-plate sampling**：把採樣電容下板接地，避免 charge injection。
- **bootstrap 開關**：給 MOSFET 閘 - 源差固定（不隨輸入變化），改善線性度。是高速 ADC 必備技巧。
- **採樣電容** $C_s$：太小 → kT/C 雜訊大；太大 → 驅動困難。

### 1.2 雜訊地板
- **kT/C 雜訊**：$\overline{v_n^2}=kT/C_s$。
- **量化雜訊**：$\sigma_q^2=\Delta^2/12$。
- **熱雜訊 + 1/f**：來自 AFE 元件。

### 1.3 ENOB（有效位元數）
$$\mathrm{ENOB}=\dfrac{\mathrm{SINAD}-1.76}{6.02}$$
- SINAD：訊號對雜訊與失真總和比。
- 衡量 ADC 真實解析度。

### 1.4 重要規格
- **SNR / SNDR / SINAD / SFDR / THD**
- **DNL / INL**：微分 / 積分非線性
- **取樣率 $f_s$、頻寬、延遲**
- **功耗 / FOM**：$P/(2^{\mathrm{ENOB}}\cdot f_s)$ → 越低越好。

## 第 2 章　DAC 架構

### 2.1 二進位加權型（Binary-Weighted）
- 二進位加權的電流 / 電容陣列。
- 簡單但元件失配導致非線性，N 較大時 DNL/INL 差。

### 2.2 R-2R 階梯
- 只用兩種電阻值即可實作 N-bit。
- 經典類比 IC 設計。

### 2.3 電流舵（Current-Steering）
- 電流源陣列 + 開關矩陣，輸出電流 → 電壓由 RL 轉換。
- 高速 DAC 主流（GHz 級，視訊、通訊）。
- 用 **segmentation**（粗 + 細，溫度計編碼 + 二進位）平衡面積與線性。

### 2.4 電容陣列（charge redistribution）
- SAR ADC 與部分 DAC 用。
- 製程上電容比比電阻比準確。

### 2.5 Sigma-Delta DAC
- 高度過取樣 + 雜訊整形 + 簡單低位元（1-bit）DAC + 重建濾波。
- 音訊 DAC（24 bit、192 kHz）主流。

## 第 3 章　ADC 架構

ADC 是「應用驅動架構選擇」的代表科目。下表是粗略對照：

| 架構 | 取樣率 | 解析度 | 功耗 | 典型應用 |
| --- | --- | --- | --- | --- |
| **Flash** | 極高 (GS/s) | 4–8 b | 大 | 通訊、雷達、SerDes |
| **Folding / Interpolating** | 高 | 6–10 b | 中 | 視訊 |
| **Pipeline** | 中高 | 10–14 b | 中 | 影像、無線基地台 |
| **SAR** | 中 (~MS/s, 近 GS/s) | 8–16 b | 低 | 感測器、生醫、IoT |
| **Sigma-Delta** | 低 | 14–24 b | 中 | 音訊、量測、感測 |
| **Time-Interleaved** | 極高 | 8–14 b | 中 | 光通訊、示波器 |
| **Integrating** | 很低 | 16–24 b | 低 | 數位電錶、儀器 |

### 3.1 Flash ADC
- $2^N-1$ 個比較器 + 編碼器。
- 一次採樣一個 cycle 完成。
- 受限：N > 8 後比較器數量爆炸。
- 變形：interpolating、folding 共用比較器減少數量。

### 3.2 Pipeline ADC
- 多階段，每階段量幾位元、放大殘餘訊號傳到下階段。
- 流水線吞吐量 = 1 cycle / sample，但延遲 N cycles。
- 設計重點：每階段 op-amp 增益準確、stage gain calibration。

### 3.3 SAR ADC（逐次逼近）
- 用一個 DAC + 一個比較器二分法逼近輸入。
- N-bit 需要 N + 1 cycles。
- 結構簡單、極低功耗、製程容易移植 → **過去 10 年最熱門 ADC 架構**。
- 速度提升技巧：非同步邏輯、冗餘位元、雙比較器交錯。
- 解析度提升：digital calibration、noise-shaping SAR。

### 3.4 Sigma-Delta ADC（ΣΔ）
- 高度過取樣（OSR = $f_s/(2 B)$）+ 雜訊整形 + 低解析量化器 + 數位降取樣濾波（CIC / FIR）。
- 量化雜訊被推到高頻 → 通帶內 SNR 大幅提升。
- 解析度高（16–24 bit）、頻寬有限（kHz–MHz）。
- 結構：CT-ΣΔ（連續時間，速度快）vs DT-ΣΔ（切換電容，精準）。

### 3.5 Time-Interleaved ADC
- 多個 ADC 並列輪流取樣，等效取樣率 × M。
- 校準必備：偏移失配、增益失配、時序偏差、頻寬失配。
- 高速光通訊 / 示波器（Keysight、Tektronix）核心技術。

## 第 4 章　雜訊整形與 CIC 濾波器

### 4.1 雜訊整形原理
ΣΔ 用 $H(z)=z^{-1}/(1-z^{-1})$（積分器）放在迴路中：
- 訊號通過增益接近 1。
- 量化雜訊乘上 $(1-z^{-1})$ → 高通整形。

二階以上整形可大幅提升 SNR（每階 +9 dB/octave）。

### 4.2 CIC 與多級降取樣
- CIC：cascaded integrator-comb，硬體最便宜的 decimation 濾波器。
- CIC 後加 FIR 校正落差 + 線性相位。

## 第 5 章　校準（Calibration）

### 5.1 為什麼必要
製程變異與失配讓「設計值」與「實際晶片」差距很大；先進高解析度 ADC 都靠校準。

### 5.2 校準類型
- **前景（foreground）**：開機時關閉訊號路徑做校準。
- **背景（background）**：跑時偷偷校，不中斷。
- **數位校準**：把校準參數存進記憶體 / 邏輯。

### 5.3 典型校準對象
- pipeline ADC：stage gain、capacitor mismatch。
- SAR ADC：DAC capacitor mismatch、offset。
- TI-ADC：四種失配。
- ΣΔ：DAC feedback mismatch（DEM 動態元件匹配）。

## 第 6 章　高速混合訊號電路

### 6.1 比較器（Comparator）
- **再生式（regenerative）latch**：強正回授閘鎖；快但有亞穩定。
- 偏移補償：input-referred offset cancellation（auto-zero、calibration）。

### 6.2 開關（Switch）
- bootstrap / dummy / nMOS+pMOS 並聯。
- 線性度由開關 ON 阻抗的訊號相依性決定。

### 6.3 高速時脈
- 由 PLL / DLL 產生 → 必須低 jitter。
- jitter $\sigma_t$ × 訊號斜率 → 等效輸入雜訊。

## 第 7 章　混合訊號版圖（Mixed-Signal Layout）

### 7.1 隔離策略
- 類比與數位放在不同 well / supply。
- 防護環（guard ring）隔離。
- 大 substrate 雜訊用 deep n-well。

### 7.2 對稱與匹配
- ADC 比較器與 DAC 陣列要 common-centroid。
- 重要時脈訊號要差動 + matched 走線。

### 7.3 接地
- Star ground、separate analog/digital ground。
- 兩 ground 通常在 ESD 二極體 / single point 連接。

### 7.4 寄生與布線
- 高速類比訊號最好走頂層金屬（最厚）。
- 屏蔽：兩側 ground 線、上下層接地夾。
- 走線盡量短、對稱。

## 第 8 章　常見系統內整合

### 8.1 SoC ADC
- 微控制器內建 SAR ADC（10–14 b、1 MS/s）。
- 取樣同步、DMA 進記憶體。

### 8.2 RF 通訊
- 高速 ADC（10–14 b、1–5 GS/s）採樣 IF / RF。
- DAC + 上變頻器 → 發射端。

### 8.3 影像感測器（CMOS Image Sensor）
- 每行 / 每列 column ADC。
- single-slope / SAR / Σ Δ；面積 vs 速度取捨。

### 8.4 音訊
- Σ Δ ADC + DAC 對：iPhone level → 117 dB SNR、24 bit。

### 8.5 量測儀器
- Keysight、Tektronix 示波器：12 b、100 GS/s TI-ADC。
- DMM、頻譜儀：高解析 Σ Δ。

## 第 9 章　趨勢

### 9.1 更高頻 / 更高解析
- 5G/6G、光通訊：100+ GS/s ADC。
- 量子計算讀出：超低噪 ADC。

### 9.2 內建 DSP / AI
- 在 ADC 後緊接做 DSP / 神經網路推論：在感測器晶片上完成部分推論。
- Always-on 喚醒詞偵測。

### 9.3 模擬計算（Analog Compute）
- 把神經網路的乘加運算用類比 / SRAM in-memory 計算實作 → 大幅省功。
- 是「混合訊號 + 數位」之外的第三類設計。

## 與其他科目的銜接

- 類比 IC（IC1）：DAC / ADC 內部模組。
- 數位 IC（IC2）：數位後處理、校準邏輯。
- 信號與系統、DSP：採樣理論、ΣΔ 雜訊整形。
- 通訊 / 影像 / 生醫：應用場景。

下一科：[半導體製程與元件物理 →](IC4-半導體製程與元件物理.md)

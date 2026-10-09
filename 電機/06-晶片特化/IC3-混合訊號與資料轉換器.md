# IC3 混合訊號與資料轉換器（Mixed-Signal & Data Converters）概論

> 晶片特化第 3 科。
> 名詞對照見 [中英名詞對照表 → 混合訊號](../中英名詞對照表-3.md#混合訊號)。

## 這科在學什麼

類比與數位共存的 IC 設計，焦點是把訊號在兩個世界轉換的「橋」—— **ADC** 與 **DAC**。涵蓋取樣理論在 IC 端的實作、各種轉換器架構、混合訊號版圖、整合議題。

是電路 / 通訊 / 控制 / 感測 / 影像 / 量測各路工程的交會處。

## 第 1 章　取樣與量化的 IC 視角

### 1.1 取樣保持（S/H）
- **bottom-plate sampling**：取樣結束時先斷開電容下板開關，讓開關注入電荷對輸入訊號不敏感，以降低輸入相依誤差。
- **bootstrap 開關**：給 MOSFET 閘 - 源差固定（不隨輸入變化），改善線性度。是高速 ADC 必備技巧。
- **取樣電容** $C_s$：太小 → kT/C 雜訊大；太大 → 驅動困難。

### 1.2 雜訊地板
- **kT/C 雜訊**：$\overline{v_n^2}=kT/C_s$。
- **量化雜訊**：$\sigma_q^2=\Delta^2/12$。
- **熱雜訊 + 1/f**：來自 AFE 元件。

### 1.3 ENOB（有效位元數）
對滿幅正弦波，訊號均方值與量化雜訊 $\Delta^2/12$ 相除，可得
$$\mathrm{SNR}_{ideal}=10\log_{10}\!\left(\frac{3}{2}2^{2N}\right)\approx6.02N+1.76\ \mathrm{dB}.$$
因此可將實測 SINAD 換算為：
$$\mathrm{ENOB}=\dfrac{\mathrm{SINAD}-1.76}{6.02}$$
- SINAD：訊號對雜訊與失真總和比。
- 衡量 ADC 真實解析度。

### 1.4 重要規格
- **SNR / SNDR / SINAD / SFDR / THD**
- **DNL / INL**：微分 / 積分非線性
- **取樣率 $f_s$、頻寬、延遲**
- **功耗 / FOM**：$P/(2^{\mathrm{ENOB}}\cdot f_s)$ → 越低越好。

**例：比較 kT/C、LSB 與理想 SQNR**
- 題目：300 K、$C_s=1\ \mathrm{pF}$、12 bit 且 1 V 全幅的 ADC，求 kT/C 雜訊、1 LSB 與滿幅正弦波理想 SQNR。
- 步驟：依序使用 $\sqrt{kT/C_s}$、$1/2^{12}$ 與 $6.02N+1.76$。
- 答案：$v_{n,\mathrm{rms}}\approx64.4\ \mathrm{\mu V}$、1 LSB $\approx244\ \mathrm{\mu V}$，理想 SQNR 為 $74.0\ \mathrm{dB}$。

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

**例：理想 DAC 輸出碼值**
- 題目：4 bit 理想單極性 DAC 的 $V_\text{ref}=1.0\ \mathrm{V}$，輸入碼為 10，以 $V_o=V_\text{ref}D/2^N$ 求輸出。
- 步驟：代入 $D=10$、$N=4$，得 $V_o=1.0\times10/16$。
- 答案：$V_o=0.625\ \mathrm{V}$；最大碼 15 對應 $0.9375\ \mathrm{V}$，不會達到 $V_\text{ref}$。

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
- 一次取樣一個 cycle 完成。
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

**例：Flash ADC 的比較器數量**
- 題目：6 bit Flash ADC 需要多少個比較器？
- 步驟：使用 $2^N-1$，代入 $N=6$。
- 答案：$2^6-1=63$ 個；若升為 10 bit 就需 1023 個，這是解析度難向上擴充的主因。

## 第 4 章　雜訊整形與 CIC 濾波器

### 4.1 雜訊整形原理
ΣΔ 用 $H(z)=z^{-1}/(1-z^{-1})$（積分器）放在迴路中：
將量化器線性化為加性雜訊 $E$，迴路代數為
$$Y=\frac{H}{1+H}X+\frac{1}{1+H}E,$$
- 訊號通過增益接近 1。
- 量化雜訊乘上 $(1-z^{-1})$ → 高通整形。

$L$ 階雜訊整形在 OSR 每倍增時，SNR 理想提升量為 $(6L+3)\ \mathrm{dB}$：一、二、三階分別約為 9、15、21 dB/octave，每增加一階多 6 dB/octave。

### 4.2 CIC 與多級降取樣
- CIC：cascaded integrator-comb，硬體最便宜的 decimation 濾波器。
- CIC 後加 FIR 校正落差 + 線性相位。

**例：二階雜訊整形的 OSR 收益**
- 題目：二階 $\Sigma\Delta$ 的 OSR 由 8 提高到 64，理想通帶 SNR 增加多少？
- 步驟：二階每倍增 OSR 約增加 $15\ \mathrm{dB}$；$64/8=8=2^3$，共三個 octave。
- 答案：理想 SNR 增加約 $45\ \mathrm{dB}$；實際結果會受熱雜訊、運算放大器與穩定性限制。

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

**例：校正通道增益與偏移**
- 題目：某 TI-ADC 子通道的量測關係為 $y=0.98x+6\ \mathrm{mV}$，參考通道為 $y_\text{ref}=x+2\ \mathrm{mV}$，求讓子通道對齊參考通道的簡單數位修正式。
- 步驟：先減去子通道偏移 $6\ \mathrm{mV}$、乘增益逆數 $1/0.98\approx1.0204$ 還原 $x$，再加回參考通道的 $2\ \mathrm{mV}$ 偏移。
- 答案：可用 $y_\text{cal}=1.0204\,(y-6\ \mathrm{mV})+2\ \mathrm{mV}$；校準後仍要用獨立樣本驗證線性。

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

**例：時脈抖動限制的 SNR**
- 題目：$f_{in}=100\ \mathrm{MHz}$、$\sigma_t=1\ \mathrm{ps}$，求只由時脈抖動限制的 SNR。
- 步驟：代入 $\mathrm{SNR}_{jit}=-20\log_{10}(2\pi f_{in}\sigma_t)$。
- 答案：$\mathrm{SNR}_{jit}\approx64.0\ \mathrm{dB}$；輸入頻率加倍時，此上限約降低 $6.02\ \mathrm{dB}$。

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

### 7.4 寄生與繞線
- 高速類比訊號最好走頂層金屬（最厚）。
- 屏蔽：兩側 ground 線、上下層接地夾。
- 走線盡量短、對稱。

**例：由碼寬估算 DNL**
- 題目：理想 1 LSB 為 $250\ \mathrm{\mu V}$，某碼的實測寬度為 $252\ \mathrm{\mu V}$，求該碼 DNL。
- 步驟：$\mathrm{DNL}=\text{code width}/\text{ideal LSB}-1=252/250-1$。
- 答案：$\mathrm{DNL}=+0.008\ \mathrm{LSB}$。INL 則要將轉換點對理想直線的偏差逐碼檢查，不能只看單一碼寬。

## 第 8 章　常見系統內整合

### 8.1 SoC ADC
- 微控制器內建 SAR ADC（10–14 b、1 MS/s）。
- 取樣同步、DMA 進記憶體。

### 8.2 RF 通訊
- 高速 ADC（10–14 b、1–5 GS/s）取樣 IF / RF。
- DAC + 上變頻器 → 發射端。

### 8.3 影像感測器（CMOS Image Sensor）
- 每行 / 每列 column ADC。
- single-slope / SAR / ΣΔ；面積 vs 速度取捨。

### 8.4 音訊
- ΣΔ ADC + DAC 對：高階行動音訊 codec 約 110–120 dB SNR、24 bit。

### 8.5 量測儀器
- Keysight、Tektronix 示波器：12 b、100 GS/s TI-ADC。
- DMM、頻譜儀：高解析 ΣΔ。

**例：SoC ADC 的原始資料率**
- 題目：12 bit ADC 以 $2\ \mathrm{MS/s}$ 連續取樣，不計封包開銷時的原始資料率為何？
- 步驟：$12\ \mathrm{bit/sample}\times2\times10^6\ \mathrm{sample/s}=24\ \mathrm{Mbit/s}$。
- 答案：$24\ \mathrm{Mbit/s}=3.0\ \mathrm{MB/s}$；實際 DMA 常用 16 bit 字儲存，所以記憶體頻寬需求可能是 $4\ \mathrm{MB/s}$。

## 第 9 章　趨勢

### 9.1 更高頻 / 更高解析
- 5G/6G、光通訊：100+ GS/s ADC。
- 量子計算讀出：超低雜訊 ADC。

### 9.2 內建 DSP / AI
- 在 ADC 後緊接做 DSP / 神經網路推論：在感測器晶片上完成部分推論。
- Always-on 喚醒詞偵測。

### 9.3 模擬計算（Analog Compute）
- 把神經網路的乘加運算用類比 / SRAM in-memory 計算實作 → 大幅省功。
- 是「混合訊號 + 數位」之外的第三類設計。

**例：Walden FOM 估算**
- 題目：ADC 功耗 $20\ \mathrm{mW}$、ENOB $=12$、$f_s=100\ \mathrm{MS/s}$，以 $P/(2^{\mathrm{ENOB}}f_s)$ 求 FOM。
- 步驟：代入 $0.02/(2^{12}\times10^8)$。
- 答案：FOM $\approx48.8\ \mathrm{fJ/conversion\mbox{-}step}$；比較不同 ADC 時還要注意頻寬、訊號條件與 FOM 定義是否一致。

## 與其他科目的銜接

- 類比 IC（IC1）：DAC / ADC 內部模組。
- 數位 IC（IC2）：數位後處理、校準邏輯。
- 信號與系統、DSP：取樣理論、ΣΔ 雜訊整形。
- 通訊 / 影像 / 生醫：應用場景。

## 碩士層級延伸（簡短）

- **資料轉換器設計（Data Converter Design）**：從系統雜訊預算一路落到取樣開關、比較器、DAC 與數位校準。
- **過取樣轉換器（Oversampling Data Converters）**：研究高階 $\Sigma\Delta$、穩定性、降取樣濾波與多位元回授。
- **高速混合訊號電路（High-Speed Mixed-Signal Circuits）**：處理 TI-ADC 時序失配、參考電壓分配與抖動限制。
- **混合訊號行為建模（Mixed-Signal Behavioral Modeling）**：用行為模型快速探索架構，再與電晶體層級模擬交叉驗證。
- **轉換器測試（Data Converter Testing）**：深入正弦波頻譜、histogram test、DNL / INL 與測試誤差預算。

## 博士研究方向（列表）

- 雜訊整形 SAR ADC（noise-shaping SAR ADC）：結合 SAR 能效與帶內雜訊抑制
- 時間域資料轉換（time-domain data conversion）：以延遲與時間放大適應低電壓製程
- 背景校準理論（background calibration theory）：在不中斷訊號下辨識並修正非理想
- 事件驅動資料轉換（event-driven data conversion）：只在訊號變化時觸發取樣，降低稀疏訊號的能耗
- 壓縮感知資料轉換器（compressive data converters）：將取樣與稀疏重建模型聯合設計
- 資料轉換器內建自測（data-converter built-in self-test）：以晶片內激勵與分析降低量產測試成本

下一科：[半導體製程與元件物理 →](IC4-半導體製程與元件物理.md)

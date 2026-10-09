# IC1 類比積體電路設計（下）：高階放大器、迴授與類比模組

> 類比 IC 設計第 2 部 / 共 2 部。
> - [上：MOSFET 物理與基本放大器](IC1-類比積體電路設計-上.md)
> - [下：高階放大器、迴授與類比模組](IC1-類比積體電路設計-下.md) ← 你在這裡
>
> 名詞對照見 [中英名詞對照表 → 類比IC](../中英名詞對照表-3.md#類比ic)。

## 第 7 章　多級放大器與運算放大器（Op-Amp）

### 7.1 兩級 op-amp 經典結構
1. **第一級**：差動對 + 主動負載（PMOS 電流鏡）→ 高差模增益、高 CMRR。
2. **第二級**：共源 + 電流源負載 → 再放大 + 轉單端 + 提供大輸出擺幅。
3. 加上補償電容 $C_C$（Miller 補償）。

整體增益 $A_v=A_1\cdot A_2$ 可達 60–80 dB。

### 7.2 Miller 補償與右半零點
- $C_C$ 跨在第二級兩端，被放大成等效電容 $\sim A_2 C_C$ 在第一級節點 → 主極點。
- 同時造成**右半零點（RHZ）** $\omega_z=g_{m2}/C_C$：相位下拉，傷穩定。
- 解法：串聯 $R_z=1/g_{m2}$ 抵消零點；或用「電流緩衝器」消除 RHZ。

### 7.3 摺疊疊接（Folded Cascode）op-amp
單級結構：差動對輸入 → 摺疊到對立極性電流源 + 疊接負載 → 高增益單級。
- 高擺幅、寬輸入共模範圍。
- 廣用於 ADC 取樣保持、視訊驅動。

### 7.4 全差動（Fully Differential）op-amp
輸出也是差動（兩端）：
- 抑制共模雜訊（電源、地雜訊）。
- 雙倍輸出擺幅。
- 改善失真（偶次諧波抵消）。
- **共模回授（CMFB）**：需要額外電路維持輸出共模電壓。
- 現代精密類比 / ADC / 開關電容濾波幾乎都用全差動。

### 7.5 Op-Amp 性能規格（記憶清單）
- **DC gain**（80–120 dB 為高精準度應用要求）
- **頻寬 / GBW**
- **相位裕度（PM）** $\ge 60°$ 為基本穩定指標
- **轉換速率（slew rate）**
- **輸入失調電壓 / 雜訊**
- **CMRR、PSRR**
- **輸入共模 / 輸出擺幅**
- **靜態功耗、效率**

### 7.6 軌至軌（Rail-to-Rail）放大器
低 $V_{DD}$ 製程下，輸入要能涵蓋 GND 到 $V_{DD}$ → 用 N + P 差動對並聯（複合輸入級），但 $g_m$ 隨共模變動，需要均流（gm-flat）技巧。

**例：估算 Miller 補償後的相位邊限**
- 題目：二階 op-amp 的單位增益頻率為 $10\ \mathrm{MHz}$，主極點遠低於此頻率，非主極點在 $20\ \mathrm{MHz}$，且 RHZ 已被消除，求近似相位邊限。
- 步驟：單位增益處主極點約貢獻 $-90^\circ$，第二極點貢獻 $-\tan^{-1}(10/20)=-26.6^\circ$。
- 答案：$\mathrm{PM}\approx180^\circ-90^\circ-26.6^\circ=63.4^\circ$，高於常用的 $60^\circ$ 目標。

## 第 8 章　迴授（複習 + 類比視角）

### 8.1 四種拓樸（電子學講過）
- 電壓 / 串聯：升 $R_\text{in}$、降 $R_\text{out}$。
- 電壓 / 並聯：降兩者。
- 電流 / 串聯：升兩者。
- 電流 / 並聯：降 $R_\text{in}$、升 $R_\text{out}$。

### 8.2 環路增益 $L=A\beta$
- 閉迴路增益 $\approx 1/\beta$（$L\gg 1$）。
- 失真與增益對元件變動的靈敏度會被除以 $(1+L)$；雜訊不能一律如此處理，須依注入點分析，迴授也不會自動改善輸入參照雜訊與 SNR。
- 頻寬被乘以 $(1+L)$（GBW 守恆）。
- 穩定性：在 $|L|=1$ 時相位裕度 $\ge 45°$、最好 $\ge 60°$。

### 8.3 頻率補償
- **單極補償**：把主極點推低，使 GBW 內只剩一個極點。
- **極點—零點抵消**：另外配置零點來抵消非主極點，但對製程與溫度變動敏感。
- **串聯零點電阻**：在 Miller 電容串聯 $R_z$，用來消除右半平面零點或將它移到左半平面。
- **Ahuja / cascoded Miller**：消除 RHZ + 提升 PSRR。
- 二階 / 多級放大器：**Nested Miller** 補償。

**例：有限環路增益造成的閉迴路誤差**
- 題目：開迴路增益 $A=1000$、回授係數 $\beta=0.1$，求閉迴路增益與相對於理想值 $1/\beta$ 的誤差。
- 步驟：$A_f=A/(1+A\beta)=1000/101=9.901$，理想值為 $10$。
- 答案：增益誤差約 $0.990\%$；增大環路增益可使結果更接近 $1/\beta$。

## 第 9 章　常見類比模組

### 9.1 切換電容電路（Switched-Capacitor, SC）
用 CMOS 開關 + 電容 + op-amp 做出**精準的「等效電阻」與「積分器」**：
$$R_\text{eq}=\dfrac{1}{f_s C}$$
- 兩相不重疊時脈 $\phi_1, \phi_2$ 控制開關。
- SC 積分器是 Sigma-Delta ADC 與開關電容濾波器的核心。
- 優點：精度主要由製程中準確的電容比決定，kT/C 雜訊則可依電容值進行預算。

### 9.2 連續時間濾波器
- **Gm-C**：跨導 + 電容；可調諧、適合 RF / 中頻。
- **Active RC**：op-amp + RC；高精準度但功耗大。
- **Tow–Thomas、Sallen-Key、Bi-quad**：經典拓樸。

### 9.3 低雜訊放大器（LNA）
- RF 接收前端第一級。
- 設計指標：NF（極低，< 1–2 dB）、增益、線性（IIP3）、輸入阻抗匹配（50 Ω）。
- 拓樸：CS + 源退化 + 輸入電感、CG、雜訊抵消。

### 9.4 混頻器（Mixer）
做頻率搬移：$\cos\omega_1 t\cdot\cos\omega_2 t\to \tfrac{1}{2}[\cos(\omega_1-\omega_2)+\cos(\omega_1+\omega_2)]$。
- 主動式（Gilbert cell）：增益 + 隔離度。
- 被動式：低功耗、低 1/f 雜訊。

### 9.5 壓控振盪器（VCO）與相位雜訊
- LC tank：$f_0=1/(2\pi\sqrt{LC})$；變容二極體調諧。
- 相位雜訊（Leeson 公式）：$L(\Delta\omega)\propto\dfrac{F\cdot kT}{P}\left(\dfrac{\omega_0}{2Q\Delta\omega}\right)^2$。
- 提升：高 Q tank、低 NF、足夠功率。

### 9.6 鎖相迴路（PLL）
PD + LF + VCO（複習通訊系統 [14 下](../03-通訊特化/14-通訊系統-下.md)）：
- 整數 N、分數 N（fractional-N，搭 ΣΔ 調變消除雜散）。
- ADPLL（全數位）：用 TDC + DCO 取代類比迴路濾波，先進製程友善。

### 9.7 ADC / DAC 前端
- **取樣保持**：bootstrap 開關固定 $V_{GS}$，使導通電阻對輸入訊號不敏感以改善線性度；電荷注入可用 dummy switch 或 bottom-plate sampling 抑制。
- **比較器**：再生式（latch-based）→ 一個強而快的正回授閘鎖。
- **DAC**：電流舵、R-2R、電容陣列（charge-redistribution）。
- 詳細留給 IC3 混合訊號。

### 9.8 LDO（低壓差線性穩壓器）
- 用 op-amp + pass MOSFET 做負迴授維持輸出穩定。
- 設計議題：**靜態電流 $I_Q$**、**壓差（dropout）**、**負載暫態**、**輸入到輸出 PSRR**與**穩定性**（負載電容、ESR）；啟動電路則是另一項設計。
- 嵌入式 SoC 內部子系統電源常用 LDO。

**例：切換電容的等效電阻**
- 題目：開關電容 $C=2\ \mathrm{pF}$，取樣頻率 $f_s=10\ \mathrm{MHz}$，求等效電阻。
- 步驟：代入 $R_\text{eq}=1/(f_sC)=1/(10^7\times2\times10^{-12})$。
- 答案：$R_\text{eq}=50\ \mathrm{k\Omega}$；若將時脈頻率加倍，等效電阻會減半。

## 第 10 章　類比線性化技術

### 10.1 負回授與源極退化

- **負回授（negative feedback）**以環路增益壓低增益對元件參數的敏感度，也能將放大器內生失真近似除以 $1+L$；可用線性化程度受穩定性、雜訊與輸出擺幅限制。
- **源極退化（source degeneration）**用 $R_S$ 產生局部負回授，將近似跨導降為 $g_m/(1+g_mR_S)$，藉由犧牲增益換取較寬的線性輸入範圍。MOS 電阻或電感也可擔任退化元件。

### 10.2 差動對的偶次諧波抵消

理想對稱的全差動電路對正負輸入有反對稱輸出，因此二階、四階等偶次非線性項會在差動取差時抵消。實際的元件失配、共模變動與負載不對稱會破壞抵消，所以電路與版圖都要保持對稱。

### 10.3 交越失真

Class B / AB 推挽輸出級在訊號過零時，若 NMOS 與 PMOS 一度都未導通，會形成死區並產生**交越失真（crossover distortion）**。Class AB 預偏壓讓兩管在靜態保留小電流，可縮小死區，但靜態功耗會上升；外加整體負回授則可再壓低殘餘交越失真。

### 10.4 IIP3、1 dB 壓縮點與 SFDR

- **輸入參考三階截點（IIP3）**：將基波與三階交調分量的小訊號趨勢線外推，交會點所對應的輸入功率。IIP3 越高，小訊號三階線性度越好，但它是外推指標，不是實際可長時間操作的功率。
- **1 dB 壓縮點（P1dB）**：實測增益比小訊號線性外推值低 $1\ \mathrm{dB}$ 的點，描述大訊號壓縮。
- **無雜散動態範圍（SFDR）**：可用訊號與最大雜散成分之間的動態範圍，須連同雜訊底與量測頻寬解讀。

**例：由雙音測試估算 IIP3**
- 題目：輸入功率 $P_{in}=-30\ \mathrm{dBm}$ 時，輸出基波比三階交調分量高 $50\ \mathrm{dB}$，估算 IIP3。
- 步驟：三階交調每增加 $1\ \mathrm{dB}$ 輸入會比基波多上升 $2\ \mathrm{dB}$，故 $\mathrm{IIP3}=P_{in}+\Delta/2=-30+50/2$。
- 答案：$\mathrm{IIP3}=-5\ \mathrm{dBm}$。P1dB 須由大訊號增益壓縮測試另行取得，不能由這組小訊號外推值精確推回。

### 10.5 延伸：RF 功率放大器的線性化

RF PA 系統常使用**預失真（predistortion）**在發射端加入反向非線性、以**包絡追蹤（envelope tracking）**動態調整 PA 供電，或以 **Doherty PA** 的載波與峰值放大路徑兼顧回退功率時的效率與線性。這些是系統層技術，與本章的電路層負回授、退化與對稱化方法互補；射頻前端的系統脈絡可銜接 [A4 雷達系統與射頻前端](../08-天線特化/A4-雷達系統與射頻前端.md)。

## 第 11 章　版圖與寄生

### 11.1 版圖規則
- DRC（design rule check）：間距、寬度、層數規則。
- LVS（layout vs schematic）。
- ERC（electrical rule check）。

### 11.2 寄生
- **寄生電容**：MOSFET 自身 $C_{gs}$、$C_{gd}$、互連線間 $C$。
- **寄生電阻**：金屬線 $R$、接觸電阻。
- **互感**：高頻 / RF 重要。
- post-layout sim 必做。

### 11.3 匹配版圖
- Common-centroid（共中心）、interdigitated（交錯）。
- Dummy 元件包邊。
- 全圖對稱（差動結構）。

### 11.4 ESD 保護
- 輸入 / 輸出 pad 加 ESD 二極體 / SCR。
- 設計目標常以人體模型（HBM）與充電裝置模型（CDM）訂定；機器模型（MM）已不建議作產品資格認證。

### 11.5 PSRR / 接地策略
- 高頻 / 高靈敏電路放在獨立 well + 自有 supply。
- 數位、類比區隔（star ground、Kelvin sensing）。

**例：互連寄生對時間常數的影響**
- 題目：一段金屬線的寄生電阻為 $200\ \Omega$、對地電容為 $50\ \mathrm{fF}$，求 RC 時間常數。
- 步驟：$\tau=RC=200\times50\times10^{-15}\ \mathrm{s}$。
- 答案：$\tau=10\ \mathrm{ps}$；高速節點中多段互連的累積寄生不可忽略。

## 第 12 章　典型類比 IC 案例

### 12.1 音訊放大器（耳機 / 揚聲器驅動）
- Class AB / Class D。
- 線性 vs 效率 trade-off。
- THD < 0.01% 是高階規格。

### 12.2 感測器讀出 IC
- 微弱電流 / 電壓感測：跨阻放大器（TIA）+ chopper + ADC。
- 光二極體（PD）、MEMS 加速度計、麥克風（電容 MEMS）讀出。

### 12.3 RF 收發 SoC
- LNA + Mixer + 通道濾波器 + VGA + ADC。
- 整合 PLL、PA、開關、digital control。
- Wi-Fi 6E、5G、藍牙 5.3 都是這種 SoC。

### 12.4 PMIC（電源管理 IC）
- 多路 LDO + DC-DC + BGR + 監控 + I²C。
- 手機 / 筆電必備，幾十路電源同時管理。

### 12.5 生醫前端（複習 [M2 生醫感測與儀器](../05-醫電特化/M2-生醫感測與儀器-上.md)）
- 多通道 LNA + chopper + Sigma-Delta ADC。

**例：光二極體跨阻放大器**
- 題目：光二極體電流為 $20\ \mathrm{\mu A}$，TIA 回授電阻為 $100\ \mathrm{k\Omega}$，求輸出電壓的量值。
- 步驟：反相 TIA 滿足 $V_o=-I_{PD}R_f$，代入 $20\ \mathrm{\mu A}\times100\ \mathrm{k\Omega}$。
- 答案：$V_o=-2.0\ \mathrm{V}$；若供電與擺幅不足，必須降低 $R_f$ 或分段放大。

## 第 13 章　驗證 / 量測（Bring-up）

### 13.1 模擬層次
- 元件層 / 電路層 / 系統層。
- TT / FF / SS / FNSP / SNFP corner。
- Monte Carlo（5000 點 +）。
- PVT（process、voltage、temperature）全掃。

### 13.2 流片後（Silicon Bring-up）
- 量測站架構：示波器、頻譜分析、訊號源、source meter、ATE。
- DC 工作點 → AC 響應 → 雜訊 → 線性 → 系統規格。
- 失效分析（FA）：FIB、TEM、emission microscopy。

**例：Monte Carlo 規格通過率**
- 題目：5000 次 Monte Carlo 模擬中有 4900 次通過所有規格，求樣本通過率。
- 步驟：以通過次數除以總次數：$4900/5000$。
- 答案：樣本通過率為 $98.0\%$；這是有限樣本估計，不等於已證明量產良率恰為 $98\%$。

## 與其他科目的銜接

- 電子學：本科基礎。
- 工程數學、信號與系統：補償器、迴授分析。
- 物理 / 半導體：元件物理。
- 數位 IC（IC2）：協同設計 mixed-signal SoC。
- 製程與元件（IC4）：細節元件模型。

## 碩士層級延伸（簡短）

- **電晶體層級類比設計（Transistor-Level Analog Design）**：以 $g_m/I_D$、雜訊與擺幅預算連結規格到元件尺寸，並納入 PVT 與失配。
- **資料轉換器類比前端（Data-Converter Analog Front End）**：深入取樣開關、放大器沉降、比較器再生與參考電壓緩衝。
- **射頻積體電路（RF Integrated Circuits）**：將雜訊係數、阻抗匹配、IIP3 與相位雜訊納入 LNA、mixer 與 VCO 設計。
- **電源管理積體電路（Power-Management Integrated Circuits）**：研究 LDO、切換式轉換器的穩定性、效率與負載暫態。
- **類比版圖與統計設計（Analog Layout and Statistical Design）**：以共中心版圖、寄生抽取與 Monte Carlo 分析收斂佈局後模擬規格。

## 博士研究方向（列表）

- 極低電壓類比電路（ultra-low-voltage analog circuits）：在窄擺幅與製程變異下維持增益與線性
- 雜訊—功耗協同最佳化（noise–power co-optimization）：面向生醫與常開感測的能效極限
- 數位輔助類比電路（digitally assisted analog circuits）：以校準與自適應演算法容忍元件不理想
- 類比電路自動合成（analog circuit synthesis）：結合電路知識、最佳化與機器學習
- 先進製程的射頻與毫米波電路（RF and millimeter-wave circuits）：處理低本徵增益、寄生與封裝損耗
- 類比記憶體內計算（analog in-memory computing）：探索陣列誤差、轉換器開銷與端到端精度

下一科：[數位積體電路設計（VLSI）→](IC2-數位積體電路設計-上.md)

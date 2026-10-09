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

## 第 10 章　高線性度技術

### 10.1 IIP3、P1dB、SFDR
- **IIP3**：將基波與三階交調分量的小訊號趨勢線向外延伸，兩者交會點所對應的輸入功率。
- **P1dB**：增益壓縮 1 dB 點。
- **SFDR**：基波與頻譜中最大雜散成分的振幅比，常以 dBc 表示。

### 10.2 線性化技術
- **預失真（predistortion）**：發射端反向補償。
- **回授線性化**。
- **包絡追蹤（envelope tracking）**：動態調 PA bias。
- **Doherty PA**：兩個 PA 並聯，效率與線性兼顧。

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

## 與其他科目的銜接

- 電子學：本科基礎。
- 工程數學、信號與系統：補償器、迴授分析。
- 物理 / 半導體：元件物理。
- 數位 IC（IC2）：協同設計 mixed-signal SoC。
- 製程與元件（IC4）：細節元件模型。

下一科：[數位積體電路設計（VLSI）→](IC2-數位積體電路設計-上.md)

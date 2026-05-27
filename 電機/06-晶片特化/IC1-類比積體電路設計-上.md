# IC1 類比積體電路設計（上）：MOSFET 物理與基本放大器

> 晶片特化第 1 科 / 類比 IC 設計第 1 部（共 2 部）。
> - [上：MOSFET 物理與基本放大器](IC1-類比積體電路設計-上.md) ← 你在這裡
> - [下：高階放大器、雜訊、迴授與類比模組](IC1-類比積體電路設計-下.md)
>
> 名詞對照見 [中英名詞對照表 → 類比IC](../中英名詞對照表-3.md#類比ic)。

## 這科在學什麼

在 CMOS 製程上設計類比訊號處理電路：電流偏壓、放大器、濾波器、ADC/DAC 前端、PLL、感測器讀出。這科把「電子學」深化到 IC 等級——電晶體不是塊狀模型，要在製程模型 + 統計變異 + 雜訊 + 寄生條件下做出規格穩定的電路。

對軟體背景者，這科最容易感到陌生；但骨架可從「電子學」一脈延伸。

## 第 1 章　現代 CMOS 製程速覽

### 1.1 製程節點
| 節點 | 年代 | 典型應用 |
| --- | --- | --- |
| 0.35 / 0.18 µm | 90s–2000s | 仍用於 RF、感測、汽車 / 高壓 IC |
| 65 / 40 nm | 2008–2014 | 通訊類比、MCU |
| 28 / 22 nm | 2012 起 | 手機 SoC、IoT |
| 16 / 7 nm FinFET | 2016 起 | 高效能 SoC、AI |
| 5 / 3 nm | 2020 起 | 旗艦 SoC、HPC |
| 2 nm GAA | 2025 起 | 新一代 HPC |

「類比 IC」常用較成熟的節點（28/40/65 nm）以兼顧 $V_{DD}$、雜訊與成本；最先進節點主要為數位用。

### 1.2 元件
- **NMOS / PMOS**：核心。
- **Native NMOS**：$V_{th}\approx 0$，深三極操作給 LDO 用。
- **高 $V_{th}$（HVT）、低 $V_{th}$（LVT）**：依需求選用。
- **電容**：MOS cap、MIM、MOM、變容（varactor）。
- **電阻**：多晶矽（poly-R）、N-well、金屬 metal-R。各有不同 TC、$1/f$、匹配。
- **電感**：螺旋金屬，主要 RF 用。

### 1.3 設計流程
```
規格 → 拓樸選擇 → 手算估計 → 模擬（SPICE/Spectre）→
版圖（layout）→ DRC / LVS → 寄生抽取 → post-layout sim →
矽前驗證（Monte Carlo / Corner）→ 流片 → 量測
```

EDA 工具：Cadence Virtuoso、Synopsys Custom Compiler、SPECTRE / FineSim。

## 第 2 章　MOSFET 模型回顧（從電子學深入）

### 2.1 飽和區 $I_D$（強反轉 / Strong Inversion）
$$I_D=\tfrac{1}{2}\mu_n C_{ox}\dfrac{W}{L}(V_{GS}-V_{th})^2(1+\lambda V_{DS})$$
- $g_m=\sqrt{2\mu_n C_{ox}(W/L)I_D}$
- $r_o=1/(\lambda I_D)$
- **本徵增益** $g_m r_o$：MOSFET 在某 bias 下能放多大電壓。先進製程因 $L\downarrow$ 與短通道 $r_o\downarrow$，$g_m r_o$ 從幾百降到幾十。

### 2.2 弱反轉（Subthreshold）
$$I_D=I_0\,e^{V_{GS}/(nV_T)}\,(1-e^{-V_{DS}/V_T})$$
像 BJT 指數律。
- $g_m=I_D/(nV_T)$，**$g_m/I_D\approx 1/(nV_T)$ 最大**（28 mS/V）。
- 低功耗類比 / 生醫前端 / 偏壓電路常用。

### 2.3 g_m/I_D 設計方法
把整個操作區間（弱 → 中 → 強反轉）連續看 $g_m/I_D$ vs $V_{OV}$ 或 vs $I_D/(W/L)$：
- 弱反轉：高 $g_m/I_D$（~25），低 $V_{DSAT}$。
- 強反轉：低 $g_m/I_D$（< 5），高 $f_T$。
- 中間：平衡。
這成為現代類比 IC 設計者選 bias 的主流方法。

### 2.4 短通道效應
- **通道長度調變**（$\lambda$）：$r_o$ 降。
- **DIBL**：高 $V_{DS}$ 時 $V_{th}$ 降。
- **速度飽和**：$I_D$ 對 $V_{OV}$ 不再是平方律，靠近線性。
- **熱載流子 / 閘極漏電**：可靠度議題。
- **變異性**：摻雜起伏、線寬粗糙（LER）。

### 2.5 製程變異與失配（Mismatch）
- **Pelgrom 失配定律**：$\sigma(\Delta V_{th})=\dfrac{A_{V_{th}}}{\sqrt{WL}}$。
- 設計上「要匹配的元件」要做大 + 緊鄰版圖 + interdigitated / common-centroid。
- 統計分析：Monte Carlo + Corner（FF / SS / TT 等）。

## 第 3 章　偏壓電路

### 3.1 電流鏡（Current Mirror）
最基本：兩個 MOSFET 共閘共源，輸出電流 ≈ 參考。
$$I_\text{out}\approx I_\text{ref}\cdot\dfrac{(W/L)_\text{out}}{(W/L)_\text{ref}}$$
不理想項：
- **輸出阻抗** $r_o$ 不夠高 → $V_{DS}$ 變化會改變 $I_\text{out}$。
- **$V_{DS}$ 失配** → 鏡像誤差。

### 3.2 疊接（Cascode）電流鏡
加一顆共閘電晶體：
- 輸出阻抗 $\sim g_m r_o^2$，大幅提升。
- 代價：壓降增加（要 $V_{DS}\ge V_{OV}$ × 2）。
- 變形：**摺疊疊接（folded cascode）**、**寬擺幅疊接（wide-swing cascode）**。

### 3.3 帶隙基準（Bandgap Reference, BGR）
產生與溫度 / 電源無關的固定電壓 ≈ 1.2 V（矽的能隙）。
- BJT 的 $V_{BE}$ 有負溫度係數（-2 mV/K）。
- 兩個不同電流密度 BJT 的 $\Delta V_{BE}=V_T\ln(N)$ 有正溫度係數。
- 線性組合抵消 → 0 階溫度補償。
- 進階：曲率補償、低壓（< 1 V）變形。
- 應用：類比 LDO、ADC / DAC 參考、感測器讀出。

### 3.4 PTAT / CTAT 電路
- **PTAT**（與絕對溫度成正比）：建立溫度感測 / 電流偏壓。
- **CTAT**：與絕對溫度成反比。
- 兩者組合 → BGR、溫度感測器、控制邏輯。

## 第 4 章　單級放大器（共源 / 共閘 / 共汲）

### 4.1 共源（CS, Common-Source）—— 主力
- **電阻負載**：增益 $A_v=-g_m R_D$。
- **電流源負載**（MOSFET）：增益 $A_v=-g_m(r_{on}\|r_{op})$，可達 $g_m r_o/2$。
- **疊接負載**：增益更大，達 $g_m r_o^2/2$。

### 4.2 共閘（CG）
低輸入阻抗、高輸出阻抗。常作為**疊接層**或**LNA 輸入級**（低入阻抗匹配天線）。

### 4.3 共汲（CD / Source Follower）
輸出阻抗 $\approx 1/g_m$，當 buffer / 推輸出。注意體效應使增益略小於 1。

### 4.4 源退化（Source Degeneration）
在源加電阻 $R_S$：
- 提高線性度、降低增益、提高輸出阻抗。
- 是 LNA 線性化常用技巧。

## 第 5 章　差動對（Diff-Pair）—— 類比 IC 的心臟

### 5.1 結構
兩顆對稱的 MOSFET 共連到一個尾電流源 $I_\text{bias}$。
輸入電壓差 $V_d=V_{1}-V_{2}$。

### 5.2 大訊號特性
$$I_{d1}-I_{d2}=\dfrac{\mu_n C_{ox}(W/L)}{2}V_d\sqrt{\dfrac{4I_\text{bias}}{\mu_n C_{ox}(W/L)}-V_d^2}$$
- 小 $V_d$ 時近似線性 ($g_m V_d$)。
- $V_d$ 大到某個值會「飽和」（一邊電晶體截止）。

### 5.3 小訊號
- **差模增益**：$A_d=g_m(r_o\|R_L)$。
- **共模增益**：$A_{cm}\approx -R_L/(2r_{o,\text{tail}})$。
- **CMRR**：$A_d/A_{cm}\approx 2g_m r_{o,\text{tail}}$。

### 5.4 主動負載
用 PMOS 電流鏡當負載，把差動輸出轉成單端：
- 增益增為 $g_m(r_{on}\|r_{op})$。
- 是 op-amp 第一級的標準結構。

### 5.5 失調（Offset）
差動對兩邊不完美匹配 → 輸入零時輸出非零。
- 隨機失調 $\sigma_{V_{OS}}\propto 1/\sqrt{WL}$。
- 大 W、L 改善；版圖 common-centroid。
- 進階：自動歸零（auto-zero）、chopper、digital trimming。

## 第 6 章　雜訊（Noise）

### 6.1 三種主要源
- **熱雜訊**：MOSFET 通道 $\overline{i_d^2}=4kT\gamma g_m\,\Delta f$，$\gamma=2/3$（長通道）→ 1+（短通道）。
- **1/f 雜訊**：$\overline{v_g^2}=K_f/(W L C_{ox}f)\,\Delta f$。隨頻率反比，低頻段主導。
- **散粒雜訊**：弱反轉 / 接面元件。

### 6.2 等效輸入雜訊
把所有源等效到輸入端：
$$\overline{v_{n,\text{in}}^2}=\dfrac{4kT\gamma}{g_m}+\dfrac{K_f}{WL C_{ox}f}$$
- 提升 $g_m$ → 降熱雜訊。
- 加大 $WL$ → 降 1/f。
- PMOS 1/f 通常比 NMOS 低 → 低雜訊放大器常用 PMOS 輸入。

### 6.3 雜訊角頻率（Corner Frequency）
熱雜訊與 1/f 雜訊相等的頻率 $f_c$；以下 1/f 主導。

### 6.4 Chopper 與 Auto-Zero
- **Chopper**：用方波調變把訊號搬到 1/f 雜訊之上的頻段放大，再解調回來。
- **Auto-Zero**：周期性「記住」失調 + 雜訊 → 下半週期減掉。
兩者都是低頻精密類比的必備技巧（生醫前端、感測讀出）。

下一部進入多級放大器、迴授、頻率補償，以及完整類比模組（運算放大器、轉換器前端等）。

下一部：[下：高階放大器、雜訊、迴授與類比模組 →](IC1-類比積體電路設計-下.md)

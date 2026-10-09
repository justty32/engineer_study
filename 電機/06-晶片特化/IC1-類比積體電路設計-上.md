# IC1 類比積體電路設計（上）：MOSFET 物理與基本放大器

> 晶片特化第 1 科 / 類比 IC 設計第 1 部（共 2 部）。
> - [上：MOSFET 物理與基本放大器](IC1-類比積體電路設計-上.md) ← 你在這裡
> - [下：高階放大器、迴授與類比模組](IC1-類比積體電路設計-下.md)
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
- **Native NMOS**：$V_{th}\approx 0$，可作 NMOS LDO 的通過元件（pass device）或低壓開關。
- **高 $V_{th}$（HVT）、低 $V_{th}$（LVT）**：依需求選用。
- **電容**：MOS cap、MIM、MOM、變容（varactor）。
- **電阻**：多晶矽（poly-R）、N-well、金屬 metal-R。各有不同 TC、$1/f$、匹配。
- **電感**：螺旋金屬，主要 RF 用。

### 1.3 設計流程
```
規格 → 拓樸選擇 → 手算估計 → 模擬（SPICE/Spectre）→
佈局（layout）→ DRC / LVS → 寄生抽取 → post-layout sim →
矽前驗證（Monte Carlo / Corner）→ 下線（tape-out）→ 量測
```

EDA 工具：Cadence Virtuoso、Synopsys Custom Compiler、SPECTRE / FineSim。

**例：從規格到佈局後模擬**
- 題目：某放大器的 schematic simulation 已通過，能否直接下線（tape-out）？
- 步驟：依設計流程檢查，尚須做佈局、DRC / LVS、寄生抽取、post-layout simulation 與 PVT / Monte Carlo 驗證。
- 答案：不能；schematic 通過只是佈局前模擬節點，還未納入佈局寄生與製程變異。

## 第 2 章　MOSFET 模型回顧（從電子學深入）

### 2.1 飽和區 $I_D$（強反轉 / Strong Inversion）
$$I_D=\tfrac{1}{2}\mu_n C_{ox}\dfrac{W}{L}(V_{GS}-V_{th})^2(1+\lambda V_{DS})$$
- $g_m=\sqrt{2\mu_n C_{ox}(W/L)I_D}$
- $r_o=1/(\lambda I_D)$
- **本徵增益** $g_m r_o$：MOSFET 在某 bias 下能放多大電壓。先進製程因 $L\downarrow$ 與短通道 $r_o\downarrow$，$g_m r_o$ 從幾百降到幾十。

### 2.2 弱反轉（Subthreshold）
$$I_D=I_0\,e^{V_{GS}/(nV_T)}\,(1-e^{-V_{DS}/V_T})$$
像 BJT 指數律。
- $g_m=I_D/(nV_T)$，**$g_m/I_D\approx 1/(nV_T)$ 最大**，單位為 $\mathrm{S/A}=\mathrm{V}^{-1}$；例如 300 K、$n\approx1.4$ 時約 $28\ \mathrm{V}^{-1}$。
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
- 設計上「要匹配的元件」要做大 + 緊鄰佈局 + interdigitated / common-centroid。
- 統計分析：Monte Carlo + Corner（FF / SS / TT 等）。

**例：MOSFET 跨導與本徵增益**
- 題目：強反轉 MOSFET 的 $I_D=100\ \mathrm{\mu A}$、$V_{OV}=0.2\ \mathrm{V}$、$\lambda=0.1\ \mathrm{V}^{-1}$，求 $g_m$、$r_o$ 與 $g_mr_o$。
- 步驟：用 $g_m=2I_D/V_{OV}$ 與 $r_o=1/(\lambda I_D)$，得 $g_m=1\ \mathrm{mS}$、$r_o=100\ \mathrm{k\Omega}$。
- 答案：本徵增益 $g_mr_o=100\ \mathrm{V/V}$，約 $40\ \mathrm{dB}$。另依 Pelgrom 定律，$A_{V_{th}}=3\ \mathrm{mV\cdot \mu m}$、$WL=10\ \mathrm{\mu m^2}$ 時，$\sigma(\Delta V_{th})\approx0.95\ \mathrm{mV}$。

## 第 3 章　偏壓電路

### 3.1 電流鏡（Current Mirror）
最基本：兩個 MOSFET 共閘共源，輸出電流 ≈ 參考。
$$I_\text{out}\approx I_\text{ref}\cdot\dfrac{(W/L)_\text{out}}{(W/L)_\text{ref}}$$
不理想項：
- **輸出阻抗** $r_o$ 不夠高 → $V_{DS}$ 變化會改變 $I_\text{out}$。
- **$V_{DS}$ 失配** → 鏡像誤差。
- 小算例：若通道長度調變參數 $\lambda=0.1\ \mathrm{V}^{-1}$、兩管 $\Delta V_{DS}=0.5\ \mathrm{V}$，一階近似的電流誤差為 $\lambda\Delta V_{DS}=0.05$，即 $5\%$。

### 3.2 疊接（Cascode）電流鏡
加一顆共閘電晶體：
- 輸出阻抗 $\sim g_m r_o^2$，大幅提升。
- 代價：壓降增加；一般疊接電流鏡的最低輸出電壓約為 $V_{th}+2V_{OV}$。
- 變形：**摺疊疊接（folded cascode）**、**寬擺幅疊接（wide-swing cascode）**；寬擺幅結構可將最低輸出電壓降至約 $2V_{OV}$。

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

**例：電流鏡的通道長度調變誤差**
- 題目：兩管的 $\lambda=0.1\ \mathrm{V}^{-1}$，$V_{DS}$ 相差 $0.5\ \mathrm{V}$，估算鏡像電流誤差。
- 步驟：一階近似為 $\Delta I/I\approx\lambda\Delta V_{DS}=0.1\times0.5=0.05$。
- 答案：電流誤差約 $5\%$；若規格更嚴，可用疊接電流鏡提高輸出阻抗。

## 第 4 章　單級放大器（共源 / 共閘 / 共汲）

### 4.1 共源（CS, Common-Source）—— 主力
- **電阻負載**：增益 $A_v=-g_m R_D$。
- **電流源負載**（MOSFET）：增益 $A_v=-g_m(r_{on}\|r_{op})$，可達 $g_m r_o/2$。
- **疊接負載**：共源＋共門疊接級搭配疊接負載時，增益量級可達 $(g_m r_o)^2/2$。

### 4.2 共閘（CG）
低輸入阻抗、高輸出阻抗。常作為**疊接層**或**LNA 輸入級**（低入阻抗匹配天線）。

### 4.3 共汲（CD / Source Follower）
輸出阻抗 $\approx 1/g_m$，當 buffer / 推輸出。注意體效應使增益略小於 1。

### 4.4 源退化（Source Degeneration）
在源加電阻 $R_S$：
- 提高線性度、降低增益、提高輸出阻抗。
- 是 LNA 線性化常用技巧。

**例：共源放大器增益**
- 題目：若 $g_m=2\ \mathrm{mS}$，NMOS 與 PMOS 的 $r_o$ 均為 $50\ \mathrm{k\Omega}$，求電流源負載的小訊號增益。
- 步驟：$r_{on}\parallel r_{op}=25\ \mathrm{k\Omega}$，代入 $A_v=-g_m(r_{on}\parallel r_{op})$。
- 答案：$A_v=-50\ \mathrm{V/V}$，負號表示輸出反相。

## 第 5 章　差動對（Diff-Pair）—— 類比 IC 的心臟

### 5.1 結構
兩顆對稱的 MOSFET 共連到一個尾電流源 $I_\text{bias}$。
輸入電壓差 $V_d=V_{1}-V_{2}$。

### 5.2 大訊號特性
$$I_{d1}-I_{d2}=\dfrac{\mu_n C_{ox}(W/L)}{2}V_d\sqrt{\dfrac{4I_\text{bias}}{\mu_n C_{ox}(W/L)}-V_d^2}$$
這個式子描述尾電流如何隨差動輸入 $V_d$ 在兩支電晶體間重新分配。
- 小 $V_d$ 時近似線性（$g_m V_d$）。
- 若 $V_{OV}$ 指平衡時每支電晶體的 overdrive，當 $|V_d|=\sqrt{2}\,V_{OV}$ 時一邊電晶體截止，電流差達尾電流上限。

### 5.3 小訊號
- **差模增益**：$A_d=g_m(r_o\|R_L)$。
- **共模增益**：對單端輸出，$A_{cm}\approx -R_L/(2r_{o,\text{tail}})$；理想全差動輸出的共模增益為 0。
- **CMRR**：$A_d/A_{cm}\approx 2g_m r_{o,\text{tail}}$。

### 5.4 主動負載
用 PMOS 電流鏡當負載，把差動輸出轉成單端：
- 增益增為 $g_m(r_{on}\|r_{op})$。
- 是 op-amp 第一級的標準結構。

### 5.5 失調（Offset）
差動對兩邊不完美匹配 → 輸入零時輸出非零。
- 隨機失調 $\sigma_{V_{OS}}\propto 1/\sqrt{WL}$。
- 大 W、L 改善；佈局 common-centroid。
- 進階：自動歸零（auto-zero）、chopper、digital trimming。

**例：差動增益與 CMRR**
- 題目：差動對每支 $g_m=1\ \mathrm{mS}$，$r_o=R_L=20\ \mathrm{k\Omega}$，尾電流源 $r_{o,\text{tail}}=1\ \mathrm{M\Omega}$，求 $A_d$ 與 CMRR。
- 步驟：$A_d=g_m(r_o\parallel R_L)=10$；$\mathrm{CMRR}\approx2g_mr_{o,\text{tail}}=2000$。
- 答案：$A_d=10\ \mathrm{V/V}$，CMRR 約 $2000$，即 $66.0\ \mathrm{dB}$。

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

**例：MOSFET 等效輸入熱雜訊**
- 題目：300 K、$\gamma=2/3$、$g_m=1\ \mathrm{mS}$ 時，估算輸入熱雜訊電壓密度。
- 步驟：以 $e_n=\sqrt{4kT\gamma/g_m}$ 代入 $k=1.380649\times10^{-23}\ \mathrm{J/K}$。
- 答案：$e_n\approx3.32\ \mathrm{nV}/\sqrt{\mathrm{Hz}}$；提高 $g_m$ 可降低此熱雜訊。

下一部進入多級放大器、迴授、頻率補償，以及完整類比模組（運算放大器、轉換器前端等）。

下一部：[下：高階放大器、迴授與類比模組 →](IC1-類比積體電路設計-下.md)

# IC4 半導體製程與元件物理（Semiconductor Process & Device Physics）概論

> 晶片特化第 4 科。
> 名詞對照見 [中英名詞對照表 → 半導體製程](../中英名詞對照表-3.md#半導體製程)。

## 這科在學什麼

把矽變成晶片的物理 / 化學 / 製程細節，以及這些細節怎麼回頭影響電路設計。
分成兩塊：
1. 元件物理（PN 接面、MOSFET、BJT、新元件）。
2. 製程（晶圓、微影、薄膜、摻雜、互連、封裝）。

對設計工程師而言，「製程」決定了 PDK 裡每個元件的特性與規則。

## 第 1 章　矽與其他半導體

### 1.1 元件級半導體
- **Si**：能隙 1.12 eV、IV 族；主流。
- **Ge**：0.66 eV；應變 SiGe channel 在先進 PMOS 用。
- **化合物**：
  - **GaAs**（1.42 eV）：高遷移率、RF / 光電。
  - **InP**（1.35 eV）：高速、光纖通訊。
  - **GaN**（3.4 eV）：寬能隙，高壓 / 高頻功率 IC。
  - **SiC**（3.3 eV）：寬能隙，高壓 / 高溫功率 IC（EV、太陽能逆變器）。
  - **InGaAs**：高速電晶體、感測器。
  - **MoS₂ / 2D 材料**：研究中下一代通道材料。

### 1.2 能帶與載子
- 能隙 $E_g$：導帶與價帶之間的禁區。
- 本徵載子濃度 $n_i$：純半導體中熱激發電子 / 電洞密度，溫度高速指數成長。
- **摻雜（doping）**：
  - **n 型**：V 族（P、As、Sb），多自由電子。
  - **p 型**：III 族（B、Ga、In），多電洞。
- 載子運動：漂移（drift, $J=\sigma E$）+ 擴散（diffusion, $J=qD dn/dx$）。

## 第 2 章　PN 接面（複習電子學上）

- 平衡：空乏區、內建電位 $V_0\approx 0.7$ V（Si）。
- 順偏：指數電流。
- 反偏：飽和電流 + 崩潰（Zener / Avalanche）。
- 動態：空乏電容 $C_j$ + 擴散電容 $C_d$。
- 應用：二極體、Schottky、光二極體（PD）、太陽能電池、LED、雷射二極體。

## 第 3 章　MOSFET 元件物理（更深入）

### 3.1 反轉與通道形成
- $V_{GS}<V_{th}$：弱反轉（subthreshold），通道載子稀疏。
- $V_{GS}>V_{th}$：強反轉，通道厚實，類似平行板。

### 3.2 $V_{th}$ 的構成
$$V_{th}=V_{FB}+2\phi_F+\dfrac{\sqrt{2q\varepsilon_s N_A(2\phi_F+V_{SB})}}{C_{ox}}$$
- $V_{FB}$：平帶電壓。
- $\phi_F$：Fermi 電位。
- 與摻雜、氧化層厚度、體偏壓有關。
- **體效應**：$V_{SB}$ 變化使 $V_{th}$ 變動。

### 3.3 三大區
- 截止、三極（線性）、飽和（在上[一節](../02-電機核心/07-電子學-中.md)、[IC1 上](IC1-類比積體電路設計-上.md)講過）。

### 3.4 短通道效應
製程縮小時：
- **DIBL（Drain-Induced Barrier Lowering）**：高 $V_{DS}$ 使 $V_{th}$ 降。
- **通道長度調變**：$\lambda$ 增大。
- **速度飽和**：$v_d$ 達上限 $v_\text{sat}\approx 10^7$ cm/s，電流飽和。
- **熱載子效應（hot carrier）**：高能量電子打斷鍵結 → 元件老化。
- **GIDL / GISL**：閘汲漏電。

### 3.5 對策
- **HKMG（High-K Metal Gate）**：用 HfO₂ 取代 SiO₂，閘極漏大減；金屬閘消除 poly depletion。
- **應變矽（strained Si）**：壓 / 拉應變提升 µ_p / µ_n。
- **SOI（Silicon on Insulator）**：基板換絕緣體，降寄生電容、抗輻射。
- **FinFET**：三維鰭結構，閘極包通道三面 → 更好控制。
- **GAA（Gate-All-Around）/ Nanosheet**：閘極包四面。3 nm 起主流。
- **CFET / 3D stacking**：N + P 垂直堆疊，下一代候選。

## 第 4 章　雙極性電晶體（BJT）

### 4.1 結構與運作
- 三層 npn 或 pnp，基極薄、輕摻雜。
- 順偏 BE、反偏 BC：作用區，集電流 $I_C\propto e^{V_{BE}/V_T}$。

### 4.2 在 IC 中的角色
- 主流 CMOS 製程中仍有 PNP / NPN 寄生 BJT（用於 BGR、ESD）。
- BiCMOS 製程：高速類比 / RF 結合 BJT 的低雜訊與高 $g_m$。
- SiGe HBT：射頻、毫米波應用（5G、衛星）。

## 第 5 章　光電與感測元件

### 5.1 光二極體（Photodiode, PD）
- 反偏 PN，光生載子產生光電流。
- 應用：光纖、影像 sensor、SpO₂、LiDAR（APD、SPAD）。

### 5.2 影像感測器
- **CCD**：電荷耦合移位輸出，老式但低雜訊。
- **CMOS Image Sensor（CIS）**：每像素內含放大器，主流（手機、汽車）。
  - BSI（背照式）：把佈線層挪到正面、光從背面進，提高量子效率。
  - 堆疊式（stacked）：感測層 + 邏輯層分晶圓 + TSV 連接。

### 5.3 SPAD（單光子雪崩二極體）
- 高反偏進入雪崩 → 單光子產生大電流。
- LiDAR、量子通訊、ToF 感測。

### 5.4 LED / 雷射二極體
- 直接能隙材料（GaAs、GaN、InGaN）順偏發光。
- 應用：照明、顯示、光纖通訊、雷射雷達。

### 5.5 太陽能電池
- 大面積 PN（多晶矽、單晶矽、薄膜、鈣鈦礦）。
- 結構與整流二極體類似但反向使用（光 → 電）。

## 第 6 章　矽製程基本步驟

### 6.1 晶圓
- 直拉法（Czochralski）拉出單晶矽棒 → 切成 8/12 吋圓盤。
- 摻雜（N 或 P 型）、晶向（100、110、111）。

### 6.2 氧化（Oxidation）
- 高溫氧化矽形成 SiO₂（閘氧、絕緣、保護層）。
- 厚薄控制到原子層級（先進製程用 ALD）。

### 6.3 微影（Photolithography）
- 旋塗光阻 → 曝光（透過光罩）→ 顯影 → 蝕刻。
- 解析度 ≈ $k_1\lambda/\mathrm{NA}$。
- 演進：
  - 365 / 248 / 193 nm KrF / ArF → 7 nm 以下。
  - **193 nm 浸潤 + 多重曝光**：曾撐到 7 nm 節點。
  - **EUV（13.5 nm）**：ASML 獨佔，7 nm 起逐步、5 nm 主用、3 nm 大量使用。
  - **High-NA EUV**：2 nm 級用。

### 6.4 蝕刻（Etching）
- 濕式（化學選擇性）vs 乾式（電漿）。
- 各向同性 vs 各向異性。
- DRIE：MEMS / TSV 深蝕刻。

### 6.5 摻雜（Doping）
- **離子佈植（ion implantation）**：精確控制劑量與深度。
- **退火（annealing）**：修復晶格損傷、活化雜質。
- **擴散**：高溫氣體擴散，舊式但仍部分用。

### 6.6 薄膜沉積（Deposition）
- **CVD**（化學氣相沉積）：覆蓋性好。
- **PVD / 濺鍍**：金屬沉積。
- **ALD（原子層沉積）**：每次一層原子，極薄極均勻；HKMG、3D 結構必備。
- **磊晶（epitaxy）**：在矽上長有序晶體（SiGe source/drain、應變層）。

### 6.7 互連（Back-End-of-Line, BEOL）
- 銅互連（取代鋁，2000 年起）。
- **雙鑲嵌（dual damascene）**：先蝕刻溝再填銅 + CMP 平坦化。
- **low-K 介電層**：減低互連電容。
- **TSV（穿矽通孔）**：用於 3D / 2.5D 封裝。
- 多層金屬：M1 細密邏輯，M10+ 粗大電源 / 全域時脈。

### 6.8 化學機械研磨（CMP）
- 每層完成後做平坦化，是次微米製程的關鍵。

### 6.9 缺陷與良率
- 顆粒、刮傷、晶格缺陷。
- **良率公式（Murphy）**：$Y=\left(\dfrac{1-e^{-DA}}{DA}\right)^2$，$D$ 為缺陷密度、$A$ 為晶片面積。
- 大晶片良率更難 → chiplet 動機之一。

## 第 7 章　可靠度（Reliability）

### 7.1 主要劣化機制
- **電移（EM）**：金屬線載流密度過高 → 原子遷移 → 斷線。
- **TDDB（Time-Dependent Dielectric Breakdown）**：氧化層長期承壓 → 漏電變大 / 崩潰。
- **HCI（Hot Carrier Injection）**：高能電子嵌入氧化層 → $V_{th}$ 漂移。
- **NBTI / PBTI（Bias Temperature Instability）**：PMOS / NMOS 長期 stress 下 $V_{th}$ 漂移。
- **ESD**：靜電脈衝瞬間損壞。

### 7.2 設計對策
- 遵守 EM 規則（每條線電流上限）。
- 加 ESD 保護電路（pad clamp、rail clamp）。
- 留 $V_{th}$ 餘裕。
- 溫度監控 + DVFS 降功耗。

### 7.3 FIT 與 MTBF
- **FIT（Failure In Time）**：每 $10^9$ 小時失效次數。
- 汽車 ASIL D 要求極低 FIT。

## 第 8 章　封裝（Packaging）

### 8.1 傳統封裝
- DIP、QFP、BGA、QFN、PGA。
- 引線（wire bond）或倒裝（flip-chip）。

### 8.2 先進封裝
- **WLP（Wafer-Level Packaging）**：晶圓上直接做封裝後切割。
- **fan-out WLP（FOWLP）**：把 RDL（重佈線層）擴出晶片之外。
- **CoWoS（Chip-on-Wafer-on-Substrate）**：TSMC 高階 SiP，2.5D 結合 HBM。
- **Foveros / EMIB**（Intel）：3D 堆疊 / 嵌入式橋接。
- **HBM**：High Bandwidth Memory，多層 DRAM 透過 TSV + 矽介層連到 SoC。

### 8.3 熱與機械
- 高功耗 chiplet 散熱：金屬蓋 + TIM + 冷板 / 水冷。
- CTE（熱膨脹係數）失配造成翹曲與裂縫。

## 第 9 章　PDK 與設計者的關聯

代工廠（TSMC、Samsung、Intel Foundry、UMC、GF…）提供 PDK：
- SPICE 模型（BSIM、BSIM-CMG、PSP）。
- 元件規則（DRC）。
- 標準元件庫、I/O 庫、SRAM compiler。
- 雜訊 / 失配 / 變異模型。
- ESD 模型與 cell。

設計者要熟讀 PDK 才能避免「合成模擬都過但流片不過」。

## 第 10 章　趨勢

- **GAA / nanosheet → CFET**：3D 整合電晶體本身。
- **HKMG → ferroelectric gate**：NCFET、Logic-in-Memory。
- **Cu → Co / Ru 互連**：先進節點低電阻。
- **EUV / High-NA EUV**：光刻持續演進。
- **2D 材料**：MoS₂、WSe₂ 通道。
- **量子點 / 自旋元件**：未來量子計算與感測。

## 與其他科目的銜接

- 物理 / 化學基礎。
- 類比 IC / 數位 IC：元件規則、模型。
- 電子學：PN 接面、MOSFET、BJT 基礎。
- 封裝 / 系統：與 PCB / 機構整合。

下一科：[晶片驗證與 EDA 工具 →](IC5-晶片驗證與EDA工具.md)

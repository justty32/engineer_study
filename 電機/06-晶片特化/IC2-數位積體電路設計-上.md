# IC2 數位積體電路設計（上）：CMOS 邏輯、時序與功耗

> 晶片特化第 2 科 / 數位 IC 設計第 1 部（共 2 部）。
> - [上：CMOS 邏輯、時序與功耗](IC2-數位積體電路設計-上.md) ← 你在這裡
> - [下：流程、低功耗、DFT 與物理實現](IC2-數位積體電路設計-下.md)
>
> 名詞對照見 [中英名詞對照表 → 數位IC](../中英名詞對照表-3.md#數位ic)。

## 這科在學什麼

把邏輯設計（[10](../02-電機核心/10-邏輯設計.md)）的位元世界落到實體 CMOS 製程：每個閘是怎麼用 MOSFET 做、訊號怎麼流、時序怎麼分析、功耗怎麼預算、晶片怎麼從 RTL 變成可流片的版圖。

對軟體背景者，這科有不少跟「跑得快但對的程式」雷同的取捨——只是這裡的程式是矽。

## 第 1 章　CMOS 反相器（Inverter）：所有邏輯的細胞

### 1.1 結構
PMOS（上拉）+ NMOS（下拉）共閘極、共汲極。
- $V_\text{in}=0$：PMOS 開、NMOS 關 → $V_\text{out}=V_{DD}$。
- $V_\text{in}=V_{DD}$：PMOS 關、NMOS 開 → $V_\text{out}=0$。

### 1.2 電壓轉移特性（VTC）
五個區域：
1. $V_\text{in}<V_{tn}$：NMOS 截止，PMOS 線性。
2. NMOS 飽和、PMOS 線性。
3. **兩者都飽和**：陡峭轉折區。
4. NMOS 線性、PMOS 飽和。
5. $V_\text{in}>V_{DD}-|V_{tp}|$：PMOS 截止。

**雜訊裕度（NM）**：$NM_H, NM_L$ 越大越穩。

### 1.3 切換閾值 $V_M$
PMOS 與 NMOS 都飽和區的工作點，常設計成 $V_{DD}/2$。
- 取決於 $(W/L)_p / (W/L)_n$。
- 一般 PMOS 比 NMOS 寬 2–3×（補償遷移率差）。

### 1.4 傳播延遲
$$t_p\approx 0.69\,R_\text{eq}C_L$$
- $R_\text{eq}$：MOSFET 等效電阻。
- $C_L$：負載電容（gate + drain 寄生 + wire）。
- 上升 / 下降可能不對稱（需要 PMOS / NMOS 比例設計）。

### 1.5 功耗
$$P=\alpha C_L V_{DD}^2 f + \text{leakage} + \text{shoot-through}$$
- **動態**（$\alpha CV^2 f$）：切換頻率 × 電容 × 電壓平方。
- **靜態（漏電）**：閘極漏 + 通道漏（subthreshold）+ 接面漏。先進製程下漏電占比可達 30–50%。
- **短路電流（shoot-through）**：切換瞬間 PMOS 與 NMOS 同時導通的瞬間。

降功耗主要手段：**降 $V_{DD}$**（平方項）→ 但延遲變慢，需 trade-off。

## 第 2 章　組合邏輯

### 2.1 靜態 CMOS（Static CMOS）
- 上拉網路（PMOS 串並聯）與下拉網路（NMOS）互為對偶。
- 任何邏輯函數可用 (P-up, N-down) 網路實作。
- 完全 rail-to-rail 輸出、低靜態功耗。
- 缺點：晶片面積大（$2N$ MOSFET）、扇入限制。

### 2.2 比例邏輯（Ratioed Logic）
- **偽 NMOS（pseudo-NMOS）**：用 PMOS 當 pull-up，NMOS 網路做邏輯。輸出非完整 rail-to-rail，且有靜態電流，現代少用。

### 2.3 動態邏輯（Dynamic Logic）
- 用時鐘控制預充 / 評估兩相位。
- 速度快、面積小。
- 缺點：對干擾敏感、不能級聯（要 Domino 技巧）。

### 2.4 Pass Transistor / Transmission Gate
- 用 MOSFET 當開關傳遞訊號。
- 可做 MUX、XOR、加法器等緊湊結構。
- 缺點：訊號電平退化（NMOS 傳「1」時掉 $V_{th}$，PMOS 傳「0」掉 $|V_{tp}|$）→ 用 Transmission Gate（N+P 並聯）解決。

## 第 3 章　序向邏輯：正反器與時序

### 3.1 鎖存器（Latch）vs 正反器（Flip-Flop）
- **Latch**：透明（位準觸發），時脈高時 D 直接傳給 Q。
- **Flip-Flop（FF）**：邊緣觸發，每個時脈邊緣才更新。
  - 通常用 **master-slave**（兩個 latch 反向時脈）實作。
  - 也用 TSPC（True Single-Phase Clock）等高效拓樸。

### 3.2 D-FF 的關鍵時序
- **建立時間** $t_\text{setup}$：時脈邊緣前 D 必須穩定的時間。
- **保持時間** $t_\text{hold}$：時脈邊緣後 D 必須維持的時間。
- **clk-to-Q 延遲** $t_\text{cq}$：時脈邊緣到 Q 輸出穩定的時間。

### 3.3 同步時序分析
最高時脈頻率：
$$T_\text{clk}\ge t_\text{cq}+t_\text{logic}+t_\text{setup}+t_\text{skew}$$
- 違反 setup → 資料還沒準備好 → 錯誤。
- 違反 hold → 資料太快變動 → 錯誤。

### 3.4 時脈偏斜（Clock Skew）與抖動（Jitter）
- **Skew**：不同地方時脈到達時間不一致。源於走線長度、緩衝器差異。
- **Jitter**：同一點時脈邊緣時間的隨機抖動。
- 設計：時脈樹（clock tree synthesis, CTS）目標讓 skew 最小化、平衡。

### 3.5 亞穩定（Metastability）
- 違反 setup / hold 時 FF 進入「不確定狀態」，需有限時間才會穩到 0 或 1。
- 跨時脈域同步要用**多級同步器**（2 級以上 FF 串接）。
- MTBF（mean time between failures）由時脈頻率 / 訊號頻率 / FF 解析時間決定。

## 第 4 章　時脈、重設、I/O

### 4.1 時脈分配
- **時脈樹**：H-tree、Mesh、Cluster。
- **多時脈域（CDC）**：跨域訊號要同步 + FIFO。
- **時脈閘控（clock gating）**：不用時關掉時脈以省功耗。

### 4.2 重設策略
- **同步 reset**：較容易時序收斂，但需要時脈才能 reset。
- **非同步 assert、同步 deassert**：折衷。
- **異步 reset**：上電可行，但 reset removal 仍要小心。

### 4.3 I/O 設計
- pad cell：含 ESD、level shifter、impedance control。
- 高速介面：DDR、SerDes、PCIe、USB；要與 PLL、CDR 結合。

## 第 5 章　高速數位電路

### 5.1 邏輯努力（Logical Effort）方法
給定路徑要在最短時間做邏輯計算，估計每階段最佳尺寸：
- 邏輯努力 $g$（依閘類型）
- 電氣努力 $h$（負載 / 自身電容比）
- 階段努力 $f=gh$，最佳每階段 $f\approx 4$。

工程上：把 fan-out 維持在 3–4，級聯緩衝器才能達最佳延遲。

### 5.2 加法器
- 漣波（ripple-carry）：簡單但慢，$O(N)$。
- 載前看（carry-lookahead, CLA）：$O(\log N)$。
- 載儲存（carry-save）：用於乘法陣列。
- 現代 ALU 常用混合：基本 4-bit CLA 串接。

### 5.3 乘法器
- 部分積（partial product）矩陣 → Wallace tree / Dadda tree 壓縮 → 最終加法器。
- Booth 編碼減半部分積。

### 5.4 記憶體：SRAM / DRAM cell
- **6T SRAM**：兩個交叉耦合反相器 + 兩個 access 電晶體。常用於 cache。
- **DRAM 1T1C**：一電晶體 + 一電容，需要週期 refresh（典型 64 ms）。
- 設計要點：讀寫 noise margin、寫干擾、軟錯誤（α / 中子粒子）。

### 5.5 SerDes 與 PHY
- 高速串列鏈路（PCIe Gen5 32 Gbps、Ethernet 112 Gbps PAM4）。
- 含：CDR、等化（CTLE、DFE）、編碼（8b/10b、64b/66b、PAM4）、FEC（Reed-Solomon、KP-FEC）。
- 設計挑戰：通道損耗、串擾、jitter budget。

## 第 6 章　功耗（深入）

### 6.1 動態功耗
$P_\text{dyn}=\alpha C V_{DD}^2 f$
- $\alpha$：切換活動因子（典型 0.1–0.3）。
- 降功耗：降電壓（最有效）、降頻率、減少切換（clock gating、power gating）。

### 6.2 漏電（Leakage）
- **次臨界**（subthreshold）：$I_\text{leak}\propto e^{-V_{th}/(nV_T)}$。$V_{th}$ 高 → 漏電低但速度慢。
- **閘極漏**：氧化層薄到 nm 級時 tunneling 嚴重 → 高 K 材料替換。
- **GIDL**：閘汲漏感應。

設計手段：
- **多 $V_{th}$**（LVT / SVT / HVT）並用：性能路徑用 LVT、其他用 HVT。
- **Power Gating**（電源閘控）：不用的模組整段斷電。
- **Body Biasing**：動態調 well 電壓改變 $V_{th}$。

### 6.3 動態電壓 / 頻率調整（DVFS）
依負載調整 $V$ 與 $f$。$P\propto V^2 f$，所以雙降可大幅省功耗。
手機 SoC、伺服器 CPU 標準功能。

### 6.4 近 / 次臨界（Near-/Sub-threshold）設計
極低 $V_{DD}$（< 0.4 V）工作，能效大幅提升，速度慢一個數量級。
IoT、醫療植入用。

## 第 7 章　訊號完整性與電源完整性

### 7.1 串擾（Crosstalk）
相鄰金屬線之間的耦合電容造成。
- 動態串擾：影響延遲（victim 慢或快下來）。
- 邏輯串擾：可能造成假切換。
解：間距 + 屏蔽線（shield） + 平行不超過某長度。

### 7.2 IR Drop
電源走線電阻造成電壓下降。
- 解：寬電源網（power grid）、decoupling cap、多個 BUMP 直接接 PCB。

### 7.3 dI/dt 與 L 振盪
電流瞬時變化 × 寄生電感 → 電源軌彈跳。
- 解：去耦電容階層配置（MIM on-die + package + PCB）。

### 7.4 EM / 自加熱
電流密度過高 → **電移**（electromigration）造成金屬線斷裂。要遵守 EM rule。

下一部進入流程、低功耗 / DFT、物理實現。

下一部：[下：流程、低功耗、DFT 與物理實現 →](IC2-數位積體電路設計-下.md)

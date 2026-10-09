# IC2 數位積體電路設計（下）：流程、低功耗、DFT 與物理實現

> 數位 IC 設計第 2 部 / 共 2 部。
> - [上：CMOS 邏輯、時序與功耗](IC2-數位積體電路設計-上.md)
> - [下：流程、低功耗、DFT 與物理實現](IC2-數位積體電路設計-下.md) ← 你在這裡
>
> 名詞對照見 [中英名詞對照表 → 數位IC](../中英名詞對照表-3.md#數位ic)。

## 第 8 章　數位 IC 設計流程（RTL-to-GDS）

### 8.1 全流程
```
規格 → 架構 → RTL（Verilog/SystemVerilog/VHDL）→
功能驗證（模擬 / 形式 / UVM）→ 邏輯合成 →
DFT 插入 → 邏輯等效檢查（LEC）→
平面規劃（floorplan）→ 擺置（placement）→
時脈樹合成（CTS）→ 繞線（routing）→
寄生抽取（RC extraction）→ 簽核（STA / Power / EMIR / Noise）→
DRC / LVS → GDSII → 流片
```

### 8.2 各階段工具與檢查
- **模擬**：VCS、Xcelium、QuestaSim。
- **合成**：Synopsys Design Compiler、Cadence Genus。
- **DFT**：Tessent、TestKompress、DFT Compiler。
- **物理實現（PnR）**：Synopsys ICC2、Cadence Innovus。
- **簽核 STA**：PrimeTime、Tempus。
- **電源 / EMIR**：Voltus、Redhawk。
- **物理驗證**：Calibre、PVS。
- **形式驗證**：Formality、Conformal LEC。
- **覆蓋率**：functional coverage、code coverage。

**例：RTL 通過模擬後的下一步**
- 題目：RTL regression 全數通過，是否可直接輸出 GDSII？
- 步驟：對照 RTL-to-GDS 流程，尚需邏輯合成、DFT、LEC、PnR、寄生抽取與多項 sign-off。
- 答案：不可；功能模擬只驗證 RTL 行為，並未驗證實體時序、供電網路與版圖規則。

## 第 9 章　RTL 與合成

### 9.1 RTL 設計準則
- **同步設計**：所有 FF 用同一時脈或明確跨域。
- **避免閂鎖**：不寫不完整 `if`，所有條件路徑要賦值。
- **可合成代碼**：避免延遲建模、initial 區塊（除模擬外）。
- **資料路徑與控制路徑分明**。

### 9.2 合成限制
- 時序：clock period、輸入/輸出延遲、false path、multicycle path。
- 面積：max area、cell list。
- 功耗：max power、switching activity。
- 規則：max fan-out、max transition、max capacitance。

### 9.3 標準元件庫（Standard Cell Library）
代工廠提供：
- 各種邏輯閘的 N 倍驅動強度。
- FF、latch、buffer、inverter、ICG（時脈閘）。
- 各種 $V_{th}$（LVT、SVT、HVT）以選效能 / 漏電。
- liberty 檔（.lib）含延遲、功率、雜訊查找表。

**例：合成前的 setup 約束預算**
- 題目：時脈週期 $2.0\ \mathrm{ns}$，$t_{cq}=0.15\ \mathrm{ns}$、組合邏輯延遲 $1.55\ \mathrm{ns}$、$t_{setup}=0.10\ \mathrm{ns}$，求 setup slack。
- 步驟：不考慮偏斜時，$\text{slack}=2.0-0.15-1.55-0.10\ \mathrm{ns}$。
- 答案：setup slack 為 $0.20\ \mathrm{ns}$，路徑在此簡化條件下通過。

## 第 10 章　驗證（Verification）

本章只保留數位 IC 流程中的驗證地圖；UVM、形式驗證、emulation 與工具實務詳見 [IC5 晶片驗證與 EDA 工具](IC5-晶片驗證與EDA工具.md)。

### 10.1 模擬驗證
- direct test 與 constrained-random 產生刺激，UVM 組織可重用的 testbench，SVA 與 coverage 分別檢查時序屬性與測試完整度。

### 10.2 形式驗證
- LEC 比對 RTL 與合成後網表，property checking 證明 SVA 屬性或找反例，CDC 則檢查跨時脈域同步。

### 10.3 模擬加速 / 模擬替代
- FPGA prototype 通常可以數十 MHz 執行軟體工作負載，速度一般高於 emulator；emulator（Palladium、Veloce、ZeBu）則保留較完整的除錯可見性。

### 10.4 軟硬體協同驗證
- 在 emulator 跑 Linux / Android boot 已是常態。
- 早期軟體開發於 virtual platform / RTL emulation。

**例：用 SVA 檢查請求回應**
- 題目：規格要求 `req` 拉高後 1–3 個時脈內 `ack` 必須拉高，如何寫成屬性？
- 步驟：以 `req` 為 antecedent，使用 overlapped implication `|->` 與 `##[1:3]` 時間範圍。
- 答案：`assert property (@(posedge clk) req |-> ##[1:3] ack);`；若回應過晚，模擬或形式工具會回報失敗軌跡。

## 第 11 章　低功耗設計

### 11.1 多電壓域（Multi-Voltage Domain）
- 不同模組用不同 $V_{DD}$（高效能 vs 低功耗）。
- 跨域訊號需要 **level shifter**。

### 11.2 電源閘控（Power Gating）
- 用 sleep 電晶體斷掉某模組電源。
- 需要：isolation cell（輸出 clamp）、retention FF（保留狀態）、power switch controller。

### 11.3 時脈閘控（Clock Gating）
- 用 ICG cell 在不用時關時脈，省動態功耗。
- 合成工具自動推導。

### 11.4 動態電壓 / 頻率調整（DVFS）
- 多個工作點（OPP / DVFS table）。
- 軟體決策 + 硬體 PMIC + 內部時脈 PLL 配合。

### 11.5 多 $V_{th}$ 與 Body Biasing
- 合成 / PnR 在時序餘裕大的地方用 HVT、緊路徑用 LVT。
- ABB（Adaptive Body Biasing）：依溫度 / 速度動態調整 $V_{th}$。

### 11.6 電源意圖格式（UPF / CPF）
UPF 是統一電源格式（Unified Power Format），CPF 是通用電源格式（Common Power Format）。
描述電源域、隔離、開關、保留：合成 / PnR / 驗證共用同一份規格。

**例：時脈閘控的動態功耗節省**
- 題目：某模組的動態功耗原為 $40\ \mathrm{mW}$，待機時間佔 $75\%$，且閘控能完全停止待機切換，理想平均動態功耗為何？
- 步驟：只在 $25\%$ 時間切換，故 $P_\text{avg}=40\times0.25\ \mathrm{mW}$。
- 答案：理想值為 $10\ \mathrm{mW}$，節省 $75\%$；實際還有 ICG 與漏電開銷。

## 第 12 章　可測試設計（DFT）

### 12.1 為什麼要 DFT
製造後測試每顆晶片是否良好；不加 DFT 幾乎無法測試大型邏輯。

### 12.2 主要技術
- **Scan Chain**：把所有 FF 串成移位暫存器，可從外部移入 / 移出 → 把序向電路變成組合電路測試。
- **ATPG（Automatic Test Pattern Generation）**：自動產生測試向量。
- **MBIST（記憶體內建自測）**：晶片內建演算法測 SRAM / DRAM。
- **BSCAN / Boundary Scan（JTAG）**：板級互連測試 + 內部診斷。
- **LBIST（邏輯 BIST）**：用內建隨機 / 偽隨機向量做自測。
- **IDDQ 測試**：量靜態電流偵測缺陷。

### 12.3 故障模型
- **stuck-at**：節點卡在 0 / 1。
- **transition**：延遲故障。
- **bridging**：相鄰節點短路。
- **cell-aware**：直接在元件層建模。

**例：ATPG 故障覆蓋率**
- 題目：故障清單有 10,000 個 stuck-at 故障，ATPG 偵測到 9900 個，求覆蓋率。
- 步驟：以已偵測故障數除以故障總數：$9900/10000$。
- 答案：覆蓋率為 $99.0\%$；未偵測故障還需區分不可測與 ATPG 未解出者。

## 第 13 章　物理實現（PnR）

### 13.1 平面規劃（Floorplan）
- 決定大模組（CPU、GPU、Cache、PHY、SRAM macro）位置。
- 預留 power straps、I/O ring。
- I/O 規劃會影響整顆晶片時序、面積、信號完整性。

### 13.2 擺置（Placement）
- 標準元件依連接性與時序約束放到 row 上。
- 全域擺置（global placement）+ 細節擺置（detailed placement）。

### 13.3 時脈樹合成（CTS）
- 從 root（PLL 輸出）建樹到所有 FF。
- 目標：min skew、min latency、控制功耗。
- 現代：使用 H-tree / Mesh / Hybrid + ICG 整合。

### 13.4 繞線（Routing）
- 全域繞線：規劃通道。
- 細節繞線：實際金屬段、via。
- DRC 規則繁多（min spacing、antenna effect、min density）。
- 多層金屬（M1 – M15+），不同層粗細不同。

### 13.5 ECO（Engineering Change Order）
晶片開發後期發現 bug，做小範圍補丁：
- pre-mask ECO：合成 / PnR 重做局部。
- post-mask（metal）ECO：只改金屬層 → 利用備援邏輯（spare cell）繞線改連。

**例：由利用率推回核心區面積**
- 題目：標準元件總面積為 $4.0\ \mathrm{mm^2}$，目標 placement utilization 為 $70\%$，不計 macro 時至少需多大核心區？
- 步驟：$A_\text{core}=A_\text{cell}/0.70$。
- 答案：$A_\text{core}\approx5.71\ \mathrm{mm^2}$；留白空間用於繞線、時脈與 ECO cell。

## 第 14 章　簽核（Sign-off）

### 14.1 靜態時序分析（STA）
不用模擬，用各路徑的 worst-case delay 檢查 setup / hold。
- 多 corner（PVT × mode × extraction）。
- OCV（On-Chip Variation）模型考慮局部變異。
- 進階：CPPR（Clock Path Pessimism Removal）、AOCV、POCV。

### 14.2 功耗分析
- 平均、瞬時、漏電分析。
- 訊號活動可從模擬 VCD/FSDB 抽取做更精準分析。

### 14.3 EMIR / IR Drop
- 模擬電源網路 IR drop + EM。
- 找尖峰 / 不夠的 power strap，調整。

### 14.4 物理驗證
- DRC（design rule check）
- LVS（layout vs schematic）
- ANT（antenna effect）
- ERC

### 14.5 形式 / 邏輯等效（LEC）
最後一次確認合成後或 ECO 後的 netlist 與 RTL 等價；GDS 對電路連線表的檢查屬於 LVS。

**例：含正時脈偏斜的 setup slack**
- 題目：$T=1.0\ \mathrm{ns}$、$t_{cq}=0.08\ \mathrm{ns}$、$t_\text{logic}=0.72\ \mathrm{ns}$、$t_\text{setup}=0.10\ \mathrm{ns}$，捕捉時脈比發射時脈晚 $0.03\ \mathrm{ns}$，求 setup slack。
- 步驟：依本科的有號偏斜定義，$\text{slack}=T-t_{cq}-t_\text{logic}-t_\text{setup}+t_\text{skew}$。
- 答案：slack $=0.13\ \mathrm{ns}$，正偏斜放寬了 setup，但會壓縮 hold 餘裕。

## 第 15 章　現代議題

### 15.1 FinFET / GAA / CFET
製程演進讓電晶體從 planar → FinFET → Gate-All-Around → 未來 CFET（N + P 堆疊）。
影響：設計規則複雜化、變異性管理、3D 設計風潮。

### 15.2 Chiplet 與 2.5D / 3D 封裝
- 把大 SoC 切成多個 chiplet 並用先進封裝（CoWoS、Foveros、EMIB）連起。
- chiplet 介面標準：UCIe、BoW。
- 常搭配的高頻寬記憶體：HBM3/3E。
- AMD、Intel、Apple、NVIDIA 主流伺服器 / AI 加速器均採用。

### 15.3 AI 加速器設計
- 大量 MAC / Systolic Array、SRAM 高頻寬、HBM。
- 量化（INT8、FP16、FP8）、稀疏性硬體加速。
- 設計挑戰：超高功耗密度、IR drop、冷卻。

### 15.4 EDA 中的 AI
- 合成 / PnR 中用機器學習快速估計時序、功耗、可行性 → 預測式優化。
- Cadence Cerebrus、Synopsys DSO.ai。

### 15.5 開源 EDA / 製程
- OpenROAD、Magic、KLayout、ngspice、Yosys。
- SkyWater 130nm、IHP 130nm 開源 PDK。
- 學習與小型專案門檻大幅降低。

**例：chiplet 切割與 Poisson 良率**
- 題目：缺陷密度 $D=0.2\ \mathrm{cm}^{-2}$，單顆 $4\ \mathrm{cm^2}$ 晶片依 $Y=e^{-DA}$ 的良率為何？切成四顆 $1\ \mathrm{cm^2}$ chiplet 且四顆都必須良好時呢？
- 步驟：單晶片為 $e^{-0.2\times4}$；四顆都良好為 $(e^{-0.2\times1})^4$。
- 答案：兩者皆約 $44.9\%$。純 Poisson 且總面積不變時切割不會自動提高「四顆全良」機率；chiplet 優勢來自可挑選良品組裝、避免整顆大晶片報廢與混合製程。

## 與其他科目的銜接

- 邏輯設計：本科基礎。
- 計算機組織：CPU / SoC 設計的功能規格。
- 類比 IC（IC1）：協同設計 mixed-signal SoC。
- 半導體 / 製程（IC4）：元件規則來源。
- 驗證 / EDA（IC5）：本科實作層。

## 碩士層級延伸（簡短）

- **進階數位超大型積體電路（Advanced Digital VLSI）**：將邏輯、時序、功耗與物理實現做聯合最佳化，並納入 OCV 與寄生效應。
- **低功耗 SoC 設計（Low-Power SoC Design）**：深入 power gating、DVFS、UPF 與電源狀態驗證。
- **高效能計算架構（High-Performance Computing Architecture）**：研究多核、加速器、快取與 HBM 間的資料移動。
- **可測試與可靠度設計（Design for Test and Reliability）**：將 scan、BIST、故障模型與老化監測整合到設計流程。
- **物理設計自動化（Physical Design Automation）**：學習 placement、routing、CTS 與時序收斂的演算法與工程取捨。

## 博士研究方向（列表）

- 近資料與記憶體內計算（near-data and in-memory computing）：降低資料搬移能耗
- 非同步電路（asynchronous circuits）：用握手取代全域時脈以改善能效與電磁特性
- 時序容錯與電路韌性（timing resilience）：以錯誤偵測與恢復壓縮 guardband
- 近似計算硬體（approximate computing hardware）：以可控誤差交換面積、延遲與功耗
- 後量子密碼硬體（post-quantum cryptographic hardware）：提升大整數與多項式運算效率
- 近臨界電壓計算（near-threshold computing）：研究極低能耗下的變異與故障容忍

下一科：[混合訊號與資料轉換器 →](IC3-混合訊號與資料轉換器.md)

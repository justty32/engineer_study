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

## 與其他科目的銜接

- 邏輯設計：本科基礎。
- 計算機組織：CPU / SoC 設計的功能規格。
- 類比 IC（IC1）：協同設計 mixed-signal SoC。
- 半導體 / 製程（IC4）：元件規則來源。
- 驗證 / EDA（IC5）：本科實作層。

下一科：[混合訊號與資料轉換器 →](IC3-混合訊號與資料轉換器.md)

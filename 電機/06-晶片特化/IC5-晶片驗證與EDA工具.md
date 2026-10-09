# IC5 晶片驗證與 EDA 工具（IC Verification & EDA）概論

> 晶片特化第 5 科。
> 名詞對照見 [中英名詞對照表 → 晶片驗證](../中英名詞對照表-3.md#晶片驗證)。

## 這科在學什麼

現代 SoC 動輒幾百億電晶體；設計人力中**驗證工程師往往多於設計工程師**。
本科把驗證視為「系統工程」：方法學（UVM、formal、emulation）、工具鏈、產出（覆蓋率、簽核報告）、與量產測試（DFT、ATE）的銜接。

對軟體背景者，本科最容易上手——大部分核心概念對應「軟體測試 / CI / SRE」的硬體版本。

## 第 1 章　驗證的全景

### 1.1 為什麼驗證重要
- **下線（tape-out）成本**：先進節點的光罩組可達數千萬美元，若連同設計、驗證與工程晶圓，整案開發成本可達上億美元；發現 bug 後重做極貴。
- **bug 影響**：晶片問世後修不太了，往往要 software workaround 或 stepping 重流。
- **覆蓋全部行為**：硬體並發、不可控外部、長啟動序列；測試不可窮舉。

### 1.2 V 字 / W 字模型
V 模型把開發層級與對應的驗證層級成對：規格 ↔ 驗收測試、系統架構 ↔ 系統測試、RTL 模組 ↔ 模組驗證、閨極／實體實現 ↔ 後矽量測；左側逐層細化，右側逐層整合驗收。

### 1.3 「驗證」三層
1. **功能驗證**：邏輯是否符合規格。
2. **時序驗證**：是否在頻率內工作（STA、SI、IR、CDC）。
3. **量產驗證**：每顆晶片是否符合規格（DFT + ATE）。

**例：為何無法窮舉數位輸入**
- 題目：一個模組有 20 個布林輸入，單一時間點共有多少種輸入組合？
- 步驟：每個輸入有 0、1 兩種值，因此組合數為 $2^{20}$。
- 答案：共 1,048,576 種；若還考慮時序序列，狀態空間會更快爆炸，因此要結合隨機、覆蓋率與形式方法。

## 第 2 章　功能驗證的層級

### 2.1 模組（block）級
驗證個別功能模組（FIFO、AXI Bridge、DMA）。
- testbench + driver + monitor + scoreboard + coverage。
- 用 UVM 寫 reusable VC（verification component）。

### 2.2 子系統 / cluster 級
多模組整合（CPU + Cache + Bus、GPU + Memory Controller）。
- 跨界面協同 + 性能 / 頻寬測試。

### 2.3 SoC / Top 級
全晶片整合，啟動 OS、跑 benchmark。
- 加上 firmware、driver；通常仰賴 emulation / FPGA prototype。

### 2.4 系統 / 軟硬體共同驗證
- 在 emulator 上跑 Linux / Android boot。
- 量測效能 / 功耗的初版指標。

**例：子系統資料通道頻寬**
- 題目：某內部 bus 寬 128 bit、每個 $500\ \mathrm{MHz}$ 時脈傳一筆資料，求理想單向頻寬。
- 步驟：$128\ \mathrm{bit}\times500\times10^6\ \mathrm{/s}=64\ \mathrm{Gbit/s}$，再除以 8。
- 答案：理想頻寬為 $8.0\ \mathrm{GB/s}$；驗證時還要檢查協定開銷、backpressure 與 burst 邊界。

## 第 3 章　UVM（Universal Verification Methodology）

### 3.1 為什麼是 UVM
業界事實標準（IEEE 1800.2）。
- 物件導向（SystemVerilog）。
- 提供 testbench 結構與函式庫，可重用。
- 支援 constrained-random、scoreboard、coverage、phasing。

### 3.2 UVM Testbench 基本結構
```
test
 └─ env
     ├─ agent (driver, monitor, sequencer)
     ├─ agent (...)
     └─ scoreboard, coverage collectors
```

- **sequence**：產生交易（transaction）。
- **driver**：把交易變實際訊號送進 DUT。
- **monitor**：觀察介面訊號、抽象成交易。
- **scoreboard**：比對預期 vs 實際。

最小骨架可先看出分工：sequence 產生項目，driver 取出後驅動介面；SVA 則直接寫成時序性質。
```systemverilog
assert property (@(posedge clk) req |-> ##[1:3] ack);
class req_seq extends uvm_sequence #(req_t); /* 產生 req_t */ endclass
class req_driver extends uvm_driver #(req_t); /* get_next_item 後驅動 DUT */ endclass
```

### 3.3 constrained-random + coverage
- 隨機產生大量場景，靠**覆蓋率**確定有夠廣度。
- coverpoint、cross coverage、bin。

**例：將時序規格寫成 assertion**
- 題目：`req` 在時脈邊緣為 1 後，`ack` 必須在 1–3 個 cycle 內出現，請寫 SVA。
- 步驟：用 `|->` 表示由當前取樣啟動後件，以 `##[1:3]` 表示容許區間。
- 答案：`assert property (@(posedge clk) req |-> ##[1:3] ack);`。這句屬性可交給模擬器或形式工具使用。

## 第 4 章　形式驗證（Formal Verification）

### 4.1 等效性檢查（LEC）
- RTL ↔ 合成 ↔ ECO 後 netlist 是否邏輯等價。
- 已是流程必經一步。

### 4.2 屬性檢查（Property / Model Checking）
- 用 SystemVerilog Assertion（SVA）或 PSL 寫**永遠成立的屬性**。
- 工具用 BMC、k-induction、IC3/PDR 或 interpolation 等演算法證明屬性，若不成立則給出反例。
- 適合：控制路徑、安全屬性、deadlock-free、protocol compliance。

### 4.3 連接性 / 暫存器檢查
- 自動證明 SoC 之 register / pin 連接正確。
- 自動 IP-XACT / 規格表 → 屬性 → 形式驗。

### 4.4 形式 vs 模擬
形式可保證「全狀態空間」覆蓋，但只適用於小範圍與良好結構的屬性；模擬適合大範圍粗略測試。實務組合使用。

**例：互斥授權屬性**
- 題目：兩個 master 的授權 `gnt0` 與 `gnt1` 不得同時為 1，如何用 SVA 表達？
- 步驟：將違規條件寫成 `gnt0 && gnt1`，再對整個條件取反。
- 答案：`assert property (@(posedge clk) !(gnt0 && gnt1));`；formal 若找到反例，會給出同時授權的狀態軌跡。

## 第 5 章　模擬加速與 Emulation

### 5.1 工具
- 模擬器：VCS、Xcelium、Questa。
- 加速器：Synopsys ZeBu、Cadence Palladium、Siemens Veloce。
- FPGA prototype：HAPS（Synopsys）、Protium（Cadence）、HES（Aldec）。

### 5.2 為什麼要
- 大型 SoC 跑 Linux boot 需要十億 cycles，模擬太慢（幾 Hz）。
- emulation 可達 MHz 級，遠快於純軟體 RTL 模擬。

### 5.3 部署
- 軟體團隊「Pre-Silicon」就能跑 firmware / driver / OS / 應用。
- 部分早期客戶體驗：把 emulator 接虛擬週邊（USB、PCIe）→ 軟體開發提前。

**例：十億 cycle 的執行時間**
- 題目：一個 Linux boot 工作負載需 $10^9$ cycles，比較 $100\ \mathrm{Hz}$ RTL 模擬與 $1\ \mathrm{MHz}$ emulator 的理想執行時間。
- 步驟：以 cycle 數除以執行頻率。
- 答案：模擬約需 2778 小時（116 日），emulator 約需 16.7 分鐘，未計編譯、I/O 與除錯開銷。

## 第 6 章　虛擬平台（Virtual Platform）

- 純軟體模型（SystemC TLM、QEMU、gem5）模擬整個 SoC。
- 跑速度 100 MHz–GHz 等級（但功能對應，不對應 cycle-accurate）。
- 主要服務：早期軟體開發、架構探索（performance）、AI 模型驗證。

**例：虛擬平台的功能執行時間**
- 題目：某 firmware 測試需執行 $5\times10^9$ 個功能指令，虛擬平台平均可執行 $500\ \mathrm{MIPS}$，理想時間為何？
- 步驟：以指令數除以每秒指令數：$5\times10^9/(500\times10^6)$。
- 答案：約 10 秒；這個結果只說明功能模型速度，不代表 RTL 的 cycle-accurate 時序。

## 第 7 章　時序與物理簽核（複習 IC2 下）

### 7.1 STA
- setup / hold check across PVT corners / modes。
- on-chip variation 模型（OCV、AOCV、POCV）。

### 7.2 CDC（跨時脈域）
- 工具自動檢查同步、控制訊號、reset、metastability。
- 確認 FIFO、handshake、gray code 正確使用。

### 7.3 RDC（Reset Domain Crossing）
- 多 reset 域之間訊號傳遞，避免 reset glitch。

### 7.4 物理驗證
- DRC / LVS / Antenna / ERC。
- EMIR、靜態電源完整性。

**例：STA setup slack**
- 題目：$T=1.0\ \mathrm{ns}$、$t_{cq}=0.08\ \mathrm{ns}$、資料路徑 $0.74\ \mathrm{ns}$、$t_{setup}=0.10\ \mathrm{ns}$，正時脈偏斜 $0.02\ \mathrm{ns}$，求 slack。
- 步驟：$\text{slack}=T-t_{cq}-t_\text{data}-t_{setup}+t_{skew}$。
- 答案：slack $=0.10\ \mathrm{ns}$，此 corner 的 setup 通過；hold 必須用最快路徑另行檢查。

## 第 8 章　可測試設計與 ATE

### 8.1 DFT 流程（複習 IC2 下）
- scan chain + ATPG。
- MBIST、BSCAN、LBIST、IDDQ。
- 故障覆蓋率：stuck-at > 99%、transition > 95%（典型目標）。

### 8.2 ATE（Automatic Test Equipment）
- 量產測試機台（Advantest、Teradyne）。
- 一台機可同時測十多顆晶片（multi-site）。
- pin electronics、PMU、AWG、digitizer。
- 測試時間 = 成本，要儘量縮短（test program 最佳化）。

### 8.3 探針卡 / 探針站
- 晶圓級測試（CP, chip probe）：在切割前先測。
- 封裝後最終測試（FT, final test）。

### 8.4 良率工程
- 製造 + 設計缺陷分析。
- 高功耗 / 高密度區的 bug：刷 wafer map 找熱點。
- 引入「**良率診斷（yield diagnosis）**」工具找系統性問題。

**例：量產故障覆蓋率**
- 題目：故障模型列出 100,000 個可測故障，ATPG pattern 偵測到 99,500 個，求覆蓋率。
- 步驟：$99{,}500/100{,}000\times100\%$。
- 答案：覆蓋率為 $99.5\%$，剩餘 500 個需分析是結構不可測或 pattern 仍不足。

## 第 9 章　功能安全 / 安全驗證

### 9.1 ISO 26262（車用功能安全）
- ASIL 等級 A–D，D 最嚴。
- 要求：FIT 量化、Safety Mechanism、SPFM / LFM 比例、DC（diagnostic coverage）與 DFA（dependent failure analysis，相依失效分析）。
- 工具：故障注入模擬、形式 SafetyScope、生成 FMEDA。

### 9.2 安全驗證
- 對抗側通道攻擊（power、EM、time、cache）。
- Secure boot、attestation。
- TRNG / PUF 的 entropy 驗證。

**例：單點故障度量**
- 題目：安全相關硬體的總故障率為 2000 FIT，其中單點故障與殘餘故障合計 20 FIT，以 $1-20/2000$ 估算 SPFM。
- 步驟：先求未覆蓋比例 $20/2000=0.01$，再由 1 減去。
- 答案：SPFM 為 $99.0\%$；實際 ISO 26262 計算還需依故障分類與正式定義處理。

## 第 10 章　EDA 主要工具廠商與生態

### 10.1 三大商業 EDA
- **Synopsys**：Design Compiler、PrimeTime、VCS、Formality、IC Validator、ICC2、DSO.ai。
- **Cadence**：Genus、Tempus、Innovus、Xcelium、JasperGold、Liberate、Cerebrus。
- **Siemens EDA（Mentor）**：Calibre（DRC/LVS）、Questa、Tessent、Veloce。

### 10.2 二線 / 專業工具
- Ansys（RedHawk、Totem 電源）。
- Magillem（IP 整合）。
- Concept Engineering、Real Intent、Onespin。

### 10.3 開源 EDA
- **Yosys**：Verilog 合成。
- **OpenROAD**：開源 PnR 流程。
- **ngspice / Xyce**：SPICE 模擬。
- **KLayout / Magic**：佈局編輯。
- **OpenLane**：整合腳本 + SkyWater 130 PDK，做出可下線的全開源流程。

**例：開源 RTL-to-GDS 流程時間**
- 題目：合成、floorplan / placement、CTS / routing、sign-off 與 DRC / LVS 分別花 3、12、18、25、15 分鐘，串行流程總時間為何？
- 步驟：加總各階段：$3+12+18+25+15$。
- 答案：共 73 分鐘；若中途 DRC 失敗而回到 routing，總週轉時間會不只是單次加總。

## 第 11 章　專案與工程實務

### 11.1 驗證計畫（Verification Plan）
- 把規格拆成可驗證的 feature → 對應 testbench、coverage、assertions、formal。
- 每個 feature 標：方法、負責人、優先級、覆蓋目標。

### 11.2 回歸 / CI
- 每天 / 每小時跑回歸（regression）→ 收集 pass/fail/coverage。
- 失敗自動分類、自動 bisect 定位引入問題的提交、自動分配給工程師。

### 11.3 Bug Tracking
- Jira、Bugzilla、Tracker tool。
- bug 等級：blocker / critical / major / minor。

### 11.4 簽核里程碑
- RTL freeze → Verification sign-off → Tapeout sign-off → Mask order → Wafer in fab → First silicon → Bring-up → Mass production。

### 11.5 跨團隊協作
- Design、Verif、Physical、DFT、SI/PI、Foundry、Package、Test、Software。
- 多平台 spec：架構 spec、micro-architecture spec、register spec、SDK spec、testbench spec。

**例：回歸測試通過率**
- 題目：夜間 regression 有 500 個測試，475 個通過，20 個因同一個 blocker 失敗，5 個是環境錯誤，求原始通過率。
- 步驟：原始通過率不排除任何失敗，以 $475/500$ 計算。
- 答案：原始通過率為 $95.0\%$；報告還應將 20 個共因失敗與 5 個 infrastructure failure 分群，避免單看比率誤判。

## 第 12 章　趨勢與新興議題

### 12.1 AI 輔助設計與驗證
- 自動產 SVA、生成 testbench、用 LLM 解釋 RTL、總結報告。
- ML 預測時序 / 功耗、加速 PnR 收斂。
- 案例：Synopsys DSO.ai、Cadence Cerebrus、學術界 ChatEDA。

### 12.2 雲端 EDA
- AWS、Azure、Google Cloud 跑大規模回歸。
- 工具按授權 + token 計費 → 雲端服務化。

### 12.3 開源 RISC-V 帶來的變動
- 大量開源 SoC（OpenTitan、CV32E、CVA6）。
- 也帶動開源驗證 IP 與方法學。

### 12.4 安全 / 功能安全的整合
- 更多應用要求 ISO 26262、IEC 61508、Common Criteria（CC）。
- 驗證工具加上 fault campaign 自動化。

**例：AI 輔助失敗分群的人工時間**
- 題目：一晚有 200 個失敗，人工初步分類每個需 4 分鐘，若完全人工處理需多少時間？
- 步驟：$200\times4=800$ 分鐘，再除以 60。
- 答案：約 13.3 小時。AI 分群的價值在縮小人工審閱集合，但最終根因與 waiver 仍需工程判斷。

## 碩士層級延伸（簡短）

- **進階功能驗證（Advanced Functional Verification）**：深入 UVM 架構、受限隨機激勵、覆蓋率收斂與驗證 IP 重用。
- **形式方法（Formal Methods）**：學習 model checking、等價檢查、定理證明與 assume–guarantee 分解。
- **系統層驗證（System-Level Verification）**：串接虛擬平台、emulation、FPGA prototype 與軟體工作負載。
- **半導體測試與良率（Semiconductor Test and Yield）**：將 ATPG、BIST、ATE 程式、晶圓圖與失效診斷連成量產回饋流程。
- **EDA 演算法（EDA Algorithms）**：研究 SAT / SMT、圖論、組合最佳化與數值方法如何驅動工具。

## 博士研究方向（列表）

- 可擴充形式驗證（scalable formal verification）：降低大型 SoC 的狀態空間與組成式證明成本
- 處理器與記憶體一致性驗證（processor and memory-consistency verification）：證明並行執行序列與一致性協定
- 安全屬性的資訊流驗證（information-flow security verification）：偵測跨權資料流與側通道
- 自動測試生成與規格挖掘（automatic test generation and specification mining）：由軌跡與文件建立可檢查屬性
- 晶片感知故障診斷（silicon-aware diagnosis）：結合 scan data、佈局特徵與製程資料找系統性缺陷
- 硬體模擬加速分割與排程（emulation partitioning and scheduling）：降低跨晶片連線與多使用者工作負載的執行成本
- 覆蓋率收斂度量（coverage-closure metrics）：研究覆蓋率與殘餘 bug 風險間的可解釋關係

---

## 第六階段　晶片（IC 設計）特化　完成

至此 5 科：
- IC1 類比 IC 設計（上 / 下）
- IC2 數位 IC 設計（上 / 下）
- IC3 混合訊號與資料轉換器
- IC4 半導體製程與元件物理
- IC5 晶片驗證與 EDA 工具

都已建立。下一階段：[第七階段　控制特化](../07-控制特化/C1-線性系統理論.md)

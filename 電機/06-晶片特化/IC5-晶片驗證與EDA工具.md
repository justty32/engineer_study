# IC5 晶片驗證與 EDA 工具（IC Verification & EDA）概論

> 晶片特化第 5 科。
> 名詞對照見 [中英名詞對照表 → 晶片驗證](../中英名詞對照表-3.md#晶片驗證)。

## 這科在學什麼

現代 SoC 動輒幾百億電晶體；設計人力中**驗證工程師往往多於設計工程師**。
本科把驗證視為「系統工程」：方法學（UVM、formal、emulation）、工具鏈、產出（覆蓋率、簽核報告）、與量產測試（DFT、ATE）的銜接。

對軟體背景者，本科最容易上手——大部分核心概念對應「軟體測試 / CI / SRE」的硬體版本。

## 第 1 章　驗證的全景

### 1.1 為什麼驗證重要
- **流片成本**：先進節點光罩組 + 工程晶圓上看 1 億美元；發現 bug 後重做極貴。
- **bug 影響**：晶片問世後修不太了，往往要 software workaround 或 stepping 重流。
- **覆蓋全部行為**：硬體並發、不可控外部、長啟動序列；測試不可窮舉。

### 1.2 V 字 / W 字模型
規格 ← → 驗證計畫；架構 ← → 系統測試；RTL ← → 模組測試；元件 ← → 後矽量測。

### 1.3 「驗證」三層
1. **功能驗證**：邏輯是否符合規格。
2. **時序驗證**：是否在頻率內工作（STA、SI、IR、CDC）。
3. **量產驗證**：每顆晶片是否符合規格（DFT + ATE）。

## 第 2 章　功能驗證的層級

### 2.1 模組（block）級
驗證個別功能模組（FIFO、AXI Bridge、DMA）。
- testbench + driver + monitor + scoreboard + coverage。
- 用 UVM 寫 reusable VC（verification component）。

### 2.2 子系統 / cluster 級
多模組整合（CPU + Cache + Bus、GPU + Memory Controller）。
- 跨界面協同 + 性能 / 帶寬測試。

### 2.3 SoC / Top 級
全晶片整合，啟動 OS、跑 benchmark。
- 加上 firmware、driver；通常仰賴 emulation / FPGA prototype。

### 2.4 系統 / 軟硬體共同驗證
- 在 emulator 上跑 Linux / Android boot。
- 量測效能 / 功耗的初版指標。

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

### 3.3 constrained-random + coverage
- 隨機產生大量場景，靠**覆蓋率**確定有夠廣度。
- coverpoint、cross coverage、bin。

## 第 4 章　形式驗證（Formal Verification）

### 4.1 等效性檢查（LEC）
- RTL ↔ 合成 ↔ ECO 後 netlist 是否邏輯等價。
- 已是流程必經一步。

### 4.2 屬性檢查（Property / Model Checking）
- 用 SystemVerilog Assertion（SVA）或 PSL 寫**永遠成立的屬性**。
- 工具用數學證明（BMC、IPS、k-induction）或反例。
- 適合：控制路徑、安全屬性、deadlock-free、protocol compliance。

### 4.3 連接性 / 暫存器檢查
- 自動證明 SoC 之 register / pin 連接正確。
- 自動 IP-XACT / 規格表 → 屬性 → 形式驗。

### 4.4 形式 vs 模擬
形式可保證「全狀態空間」覆蓋，但只適用於小範圍與良好結構的屬性；模擬適合大範圍粗略測試。實務組合使用。

## 第 5 章　模擬加速與 Emulation

### 5.1 工具
- 模擬器：VCS、Xcelium、Questa。
- 加速器：Synopsys ZeBu、Cadence Palladium、Siemens Veloce。
- FPGA prototype：HAPS、ProtoCluster、Aldec。

### 5.2 為什麼要
- 大型 SoC 跑 Linux boot 需要十億 cycles，模擬太慢（幾 Hz）。
- emulation 提速 1000–10,000 倍（達 MHz 級）。

### 5.3 部署
- 軟體團隊「Pre-Silicon」就能跑 firmware / driver / OS / 應用。
- 部分早期客戶體驗：把 emulator 接虛擬週邊（USB、PCIe）→ 軟體開發提前。

## 第 6 章　虛擬平台（Virtual Platform）

- 純軟體模型（SystemC TLM、QEMU、gem5）模擬整個 SoC。
- 跑速度 100 MHz–GHz 等級（但功能對應，不對應 cycle-accurate）。
- 主要服務：早期軟體開發、架構探索（performance）、AI 模型驗證。

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

## 第 9 章　功能安全 / 安全驗證

### 9.1 ISO 26262（車用功能安全）
- ASIL 等級 A–D，D 最嚴。
- 要求：FIT 量化、Safety Mechanism、SPFM / LFM 比例、DFA（diagnostic coverage）。
- 工具：故障注入模擬、形式 SafetyScope、生成 FMEDA。

### 9.2 安全驗證
- 對抗側通道攻擊（power、EM、time、cache）。
- Secure boot、attestation。
- TRNG / PUF 的 entropy 驗證。

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
- **KLayout / Magic**：版圖編輯。
- **OpenLane**：整合腳本 + SkyWater 130 PDK，做出可流片的全開源流程。

## 第 11 章　專案與工程實務

### 11.1 驗證計畫（Verification Plan）
- 把規格拆成可驗證的 feature → 對應 testbench、coverage、assertions、formal。
- 每個 feature 標：方法、負責人、優先級、覆蓋目標。

### 11.2 回歸 / CI
- 每天 / 每小時跑回歸（regression）→ 收集 pass/fail/coverage。
- 失敗自動分類、stop bisect、自動分配給工程師。

### 11.3 Bug Tracking
- Jira、Bugzilla、Tracker tool。
- bug 等級：blocker / critical / major / minor。

### 11.4 簽核里程碑
- RTL freeze → Verification sign-off → Tapeout sign-off → Mask order → Wafer in fab → First silicon → Bring-up → Mass production。

### 11.5 跨團隊協作
- Design、Verif、Physical、DFT、SI/PI、Foundry、Package、Test、Software。
- 多平台 spec：架構 spec、micro-architecture spec、register spec、SDK spec、testbench spec。

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
- 更多應用要求 ISO 26262、IEC 61508、CC、Common Criteria。
- 驗證工具加上 fault campaign 自動化。

---

# 第六階段　晶片（IC 設計）特化　完成

至此 5 科：
- IC1 類比 IC 設計（上 / 下）
- IC2 數位 IC 設計（上 / 下）
- IC3 混合訊號與資料轉換器
- IC4 半導體製程與元件物理
- IC5 晶片驗證與 EDA 工具

都已建立。下一階段：[第七階段　控制特化](../07-控制特化/C1-線性系統理論.md)

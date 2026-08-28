# engineer_study

跨領域工程學習筆記庫。目標是對各種工程學科建立廣泛、概論性的認識——以大學課綱為骨架，用文字筆記的形式熟悉各領域的核心知識點。

## 這個專案是什麼

這不是程式專案，而是一份持續累積的**學習筆記**。內容由 AI 依大學課綱研究、整理，再寫成概論式（概論）的筆記，讓讀者先對各學科有初步而扎實的認識；有興趣的主題再進一步深入。

## 學習方法與深度

- **大學層級**：主要重點，依標準課綱完整涵蓋、從基礎講起。
- **碩士層級**：各子領域只做簡短介紹，有興趣再深入。
- **博士層級**：以主題／研究方向的列表呈現。

## 慣例

- 筆記一律使用**繁體中文**。
- **以文字為主，不放圖**；目標是建立初步認識，而非完整參考資料。
- 公式與數學符號使用 **LaTeX**。
- 風格為**概論重點式**：每科一篇，抓核心觀念與直覺說明，公式適量。
- 每科附**中英名詞對照表**；少於 100 行的對照表合併於各領域的 `中英名詞對照表.md`，過大再獨立成檔。

## 涵蓋領域與進度

起始三領域為**電機 → 電子 → 機械**，目前已擴充至 16 個學科目錄（另有跨領域共用的 `共通基礎/` 與問題導向的 `專題/`）。各學科學習計畫：

- 電機工程：見 [`電機/學習計畫.md`](電機/學習計畫.md)
- 電子工程：見 [`電子/學習計畫.md`](電子/學習計畫.md)
- 機械工程：見 [`機械/學習計畫.md`](機械/學習計畫.md)
- 土木工程：見 [`土木/學習計畫.md`](土木/學習計畫.md)
- 化工：見 [`化工/學習計畫.md`](化工/學習計畫.md)
- 材料：見 [`材料/學習計畫.md`](材料/學習計畫.md)
- 工業工程：見 [`工業工程/學習計畫.md`](工業工程/學習計畫.md)
- 航太：見 [`航太/學習計畫.md`](航太/學習計畫.md)
- 核工：見 [`核工/學習計畫.md`](核工/學習計畫.md)
- 環境：見 [`環境/學習計畫.md`](環境/學習計畫.md)
- 生醫：見 [`生醫/學習計畫.md`](生醫/學習計畫.md)
- 食品加工：見 [`食品加工/學習計畫.md`](食品加工/學習計畫.md)
- 大氣科學：見 [`大氣科學/學習計畫.md`](大氣科學/學習計畫.md)
- 人文社會（地理學類）：見 [`人文社會/地理學類/學習計畫.md`](人文社會/地理學類/學習計畫.md)
- 人文社會（宗教學類）：見 [`人文社會/宗教學類/學習計畫.md`](人文社會/宗教學類/學習計畫.md)
- 歷史：見 [`歷史/學習計畫.md`](歷史/學習計畫.md)
- 共通基礎（數學、物理等跨領域基礎，無獨立學習計畫）：見 [`共通基礎/README.md`](共通基礎/README.md)

## 互動課程

除了純文字筆記，部分主題另外改寫成**可操作的互動網頁課程**：把筆記內容重排成分章的零基礎主線，每章配一個可以自己調參數、即時看結果的自由實驗，並附名詞字典與自我檢核題。原始碼就放在各主題自己的目錄下（`互動課程/`、`互動網站/`），本地用瀏覽器直接開 `index.html` 即可。

- **線上中央入口**：<https://justty32.github.io/engineer_study/>（GitHub Pages，目前 30 門）
- **本地中央入口**：[`互動學習網站/index.html`](互動學習網站/index.html)——課程簡介與最新清單以此頁為準

以下依所屬領域分組（每門：本地連結 · 線上 slug）：

### 共通基礎

- [工程數學先修（零基礎互動課）](共通基礎/數學/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/engineering-math/)
- [普通物理（零基礎互動課）](共通基礎/物理/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/general-physics/)

### 電機

- [電路學（零基礎互動課）](電機/02-電機核心/電路學-互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/circuit-analysis/)
- [電子學（零基礎互動課）](電機/02-電機核心/電子學-互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/electronics/)
- [電磁學（零基礎互動課）](電機/02-電機核心/電磁學-互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/electromagnetics/)
- [信號與系統（零基礎互動課）](電機/02-電機核心/信號與系統-互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/signals-systems/)
- [邏輯設計（零基礎互動課）](電機/02-電機核心/邏輯設計-互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/logic-design/)
- [電力系統](電機/04-電力特化/P1-電力系統-互動網站/index.html) · [線上](https://justty32.github.io/engineer_study/power-systems/)

### 專題 — IoT 聯網裝置

- [IoT 聯網裝置](專題/IoT聯網裝置/互動網站/index.html) · [線上](https://justty32.github.io/engineer_study/iot-device/)
- [IoT 板級電源與 PCB](專題/IoT聯網裝置/知識群互動網站/01-板級電源與PCB/index.html) · [線上](https://justty32.github.io/engineer_study/iot-power-pcb/)
- [IoT 嵌入式韌體與 RTOS](專題/IoT聯網裝置/知識群互動網站/02-嵌入式韌體與RTOS/index.html) · [線上](https://justty32.github.io/engineer_study/iot-firmware-rtos/)
- [IoT 連線模組與網路](專題/IoT聯網裝置/知識群互動網站/03-連線模組與網路/index.html) · [線上](https://justty32.github.io/engineer_study/iot-connectivity/)
- [IoT 天線、RF 與 EMC](專題/IoT聯網裝置/知識群互動網站/04-天線RF與EMC/index.html) · [線上](https://justty32.github.io/engineer_study/iot-rf-antenna/)
- [IoT 裝置安全與量產生命週期](專題/IoT聯網裝置/知識群互動網站/05-裝置安全與量產生命週期/index.html) · [線上](https://justty32.github.io/engineer_study/iot-security-production/)
- [板級介面與工業匯流排](專題/IoT聯網裝置/知識群互動網站/06-板級介面與工業匯流排/index.html) · [線上](https://justty32.github.io/engineer_study/iot-hardware-bus/)
- [微控制器與韌體核心](專題/IoT聯網裝置/知識群互動網站/07-微控制器與韌體核心/index.html) · [線上](https://justty32.github.io/engineer_study/iot-mcu-firmware/)

### 專題 — 資訊安全與系統

- [網路安全零基礎課程](專題/網路安全/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/network-security/)
- [進階攻擊手法細講](專題/網路安全/攻擊手法細講/index.html) · [線上](https://justty32.github.io/engineer_study/attack-techniques/)
- [網路協定細講](專題/網路協定/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/network-protocols/)
- [從電晶體到 C++ 執行](專題/計算機組織/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/computer-organization/)
- [作業系統（零基礎）](專題/作業系統/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/operating-systems/)
- [Linux（零基礎實務）](專題/Linux/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/linux/)
- [逆向工程](專題/逆向工程/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/reverse-engineering/)

### 專題 — 機器人

- [機器人數學基礎](專題/機器人數學基礎/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/robot-math/)
- [七軸機械手臂運動學](專題/機器人運動學/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/robot-arm-kinematics/)
- [機器人路徑與運動規劃](專題/機器人路徑規劃/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/robot-motion-planning/)
- [機器人視覺](專題/機器人視覺/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/robot-vision/)
- [機器人學習與訓練](專題/機器人學習/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/robot-learning/)

### 專題 — AI 理論

- [AI 理論白話（閱讀型導讀）](專題/AI理論白話/互動課程/index.html) · [線上](https://justty32.github.io/engineer_study/ai-theory-primer/)

### 專題 — 論文速覽

- [論文速覽（paper_readings 主線的 30 分鐘手機閱讀 deck）](專題/論文速覽/互動網站/index.html) · [線上](https://justty32.github.io/engineer_study/paper-briefs/)

## 目錄結構

每個學科一個頂層資料夾，內含學習計畫、分階段的筆記子資料夾，以及中英名詞對照表；`人文社會/` 較特殊，底下再分「地理學類」「宗教學類」兩個子領域，各自擁有一份學習計畫：

```
電機/
  學習計畫.md
  中英名詞對照表.md（索引）＋ 中英名詞對照表-1~4.md（分檔）
  <階段>/
    <科目>.md
歷史/
  學習計畫.md
  中英名詞對照表.md
  <階段>/
    <科目>.md
人文社會/
  地理學類/
    學習計畫.md
    <階段>/
  宗教學類/
    學習計畫.md
    <階段>/
共通基礎/        ← 跨領域共用的數理與科學基礎，無獨立學習計畫
  數學/
  物理/
專題/            ← 問題導向、實作驅動的跨領域學習
互動學習網站/    ← GitHub Pages 中央入口，彙整各專題互動課程
wf/              ← 工作流系統、專案規範與活狀態，見 wf/INDEX.md
```

## 給協作的 AI

AI agent 的工作入口見 [`AGENTS.md`](AGENTS.md)；Claude Code 亦可由 [`CLAUDE.md`](CLAUDE.md) 轉入。需要完整儲存庫地圖見 [`wf/INDEX.md`](wf/INDEX.md)。

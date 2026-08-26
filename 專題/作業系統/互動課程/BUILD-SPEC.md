# BUILD-SPEC — 作業系統（互動課程）

本檔是建置契約。實作者（codex）必須嚴格照此建出可離線運作的互動課程。這是給「只懂基本程式、其餘系統知識近乎零」的自學者的**作業系統零基礎課**，從「作業系統在解決什麼問題」一路建立直覺：行程、排程、執行緒與並行、同步與競態、記憶體與虛擬記憶體、檔案系統、輸入輸出與中斷、系統呼叫、死結。用**高中生能懂**的方式從頭教。

## 讀者與語氣

- 會寫基本程式（變數、迴圈、函式），但**不預設**懂組合語言、計算機組織、並行或記憶體管理。
- 每個新概念先用**生活化或軟體工程師熟悉**的白話點出「在解決什麼問題」，再回到真實機制與名詞。比喻後一定收回到精確定義與限制。
- 繁體中文為主、UTF-8。台灣工程用語（行程、執行緒、排程、分頁、系統呼叫、死結…）。首次出現的術語附英文全名與縮寫。

## 硬性技術契約（違反即失敗）

1. **純原生 HTML/CSS/JS，完全離線**。不得有圖片、外部字型、CDN、遠端 API、第三方腳本、分析碼。
2. **沿用已複製好的 `styles.css`（勿修改它）**；新內容一律用既有 class：`workspace`、`controls`、`label`、`output`、`grid`、`card`、`term-list`、`term-card`、`flow`、`prereq`、`note`、`warning`、`eyebrow`、`lead`、`pager`、`chapter-list`、`chapter-card`、`number`、`dictionary-tools`、`details`/`summary`、`table`、`topbar`、`main-site-link`、`site-footer`。
3. **公式一律純文字 HTML，嚴禁任何 LaTeX**（不得出現 `\(` `\)` `\[` `\]` `$` `$$`，不得引入 MathJax／KaTeX；本站無數學渲染器）。用 Unicode（× · ÷ √ ≈ ≤ ≥ ≠ → ⌈ ⌉ ⌊ ⌋ μ Σ Δ %）與 `<sub>`／`<sup>`（例：2<sup>12</sup>、t<sub>avg</sub>）。
4. **JavaScript 嚴禁 `Math.random()`、`Date.now()`、`new Date()`**（破壞可重現）。所有互動輸出必須是輸入的**確定性函式**。
5. 每頁 UTF-8；桌面與手機（≤720px）皆不得橫向溢出或重疊（styles.css 已含 RWD，照結構用就好）。

## app.js 慣例（照 robot-math 同款）

檔案開頭：
```js
"use strict";
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const num=(id,d=0)=>{const n=$(id);return n?(parseFloat(n.value)||d):d},val=id=>{const n=$(id);return n?n.value:""};
const fmt=(x,n=2)=>Number(x).toFixed(n),ceil=Math.ceil,floor=Math.floor;
```
每個互動用一個函式，**開頭必 guard**：`function sched(){if(!$('sch-b1'))return; const draw=()=>{...}; ['sch-b1','sch-b2','sch-b3','sch-q'].forEach(id=>on(id,'input',draw)); draw();}`。
檔案結尾把所有函式與 `dictionary` 一起註冊：`[svc,memlayout,sched,amdahl,race,addr,pager,fsblock,iocost,syscall,deadlock,dictionary].forEach(f=>f());` 最後一行 `if(typeof module!=="undefined")module.exports={};`。

## 頁面骨架（每個章節頁都照這個結構）

```html
<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NN 章名｜作業系統</title><link rel="stylesheet" href="styles.css"><script defer src="app.js"></script></head>
<body>
<a class="main-site-link" href="https://justty32.github.io/engineer_study/" aria-label="回到工程學習中央入口">← 回到工程學習主站</a>
<nav class="topbar" aria-label="主要導覽"><a href="index.html">課程地圖</a><a href="00-為什麼需要作業系統.html">00 起點</a><a href="名詞與概念字典.html">字典</a></nav>
<main>
<p class="eyebrow">NN・一句定位</p>
<h1>章名：一句話說清楚這章要幹嘛</h1>
<p class="lead">2–3 句白話導言：這章解決什麼問題、學完能做什麼。</p>
<p class="prereq"><strong>這章假設已懂：</strong>列出前置（通常是前一章）。</p>
<!-- 多個 <h2> 解說段：痛點→白話直覺→精確定義→具體數字實例→為什麼/易混→可觀察證據（在哪個指令/工具看得到，如 ps、top、free、/proc、vmstat、strace、ls -i；只描述輸出，不引外部資源） -->
<!-- 一個 <section class="workspace"> 互動實驗（見各章 widget 契約） -->
<nav class="pager" aria-label="章節導覽"><a href="上一頁.html">← 上一頁：X</a><a href="下一頁.html">下一頁：Y →</a></nav>
</main><footer class="site-footer"><span>NN 章名</span><a href="名詞與概念字典.html">查字典</a></footer></body></html>
```

workspace 互動區塊統一格式：
```html
<section class="workspace">
  <h2>動手玩：實驗名</h2>
  <p>一句話說明這個實驗在示範什麼、怎麼玩、看數字變化代表什麼。</p>
  <div class="controls">
    <label class="label">參數名 <input id="元素id" type="number" value="預設" step="..." min="..." max="..."></label>
    <!-- select 用 <select id="..."><option value="...">..</option></select> -->
  </div>
  <div class="output" id="xxx-output"></div>
</section>
```

## 章節與互動元件契約（元素 id 必須完全一致，app.js 靠它掛勾）

### 00-為什麼需要作業系統.html
主題：硬體只有一份、程式有很多個；OS 提供三件事——**抽象**（把硬體包成好用介面）、**多工共享**（讓多個程式輪流用 CPU/記憶體）、**保護與隔離**（一個程式當掉不拖垮別人）。
- Widget `svc`：`<select id="svc-pick">` 選情境（value: run=同時跑多個程式、file=把資料存到磁碟、net=連上網路、crash=某程式當掉、mem=程式要更多記憶體）。輸出 `svc-output`：說明「這件事背後是哪個 OS 抽象/服務在處理、對應本課哪一章」。純文字對照表，確定性。

### 01-行程是什麼.html（Process）
主題：程式（program，靜態檔案）vs 行程（process，執行中的實例）；行程的記憶體佈局（低位址→高位址：程式碼 code/text、資料 data、堆積 heap 往上長、堆疊 stack 往下長）；PID 與行程狀態（新建、就緒 ready、執行 running、等待 blocked、結束）。可觀察證據：`ps`、`/proc/<pid>`。
- Widget `memlayout`：輸入 `mem-code`、`mem-data`、`mem-heap`、`mem-stack`（單位 KB，number）。輸出 `mem-output`：總用量＝四者相加（KB）；用文字畫出由低到高的排列（code → data → heap ↑ … ↓ stack），並指出 heap 與 stack 相向成長、中間是未用空間；若四者總和 > 某示意上限（如 1024KB）提示「位址空間被填滿的風險」。確定性。

### 02-行程排程.html（CPU Scheduling）
主題：CPU 只有一顆、行程有很多個，排程器決定「下一個輪到誰、輪多久」。名詞：時間片 time slice/quantum、context switch、周轉時間 turnaround、等待時間 waiting。演算法：先到先服務 FCFS、時間片輪轉 RR。
- Widget `sched`：輸入三個行程的執行時間 `sch-b1`、`sch-b2`、`sch-b3`（單位 ms，number，整數，min 1）與時間片 `sch-q`（number，min 1）。三行程同時到達（t=0，順序 P1、P2、P3）。輸出 `sch-output` 需算並顯示：
  - **FCFS**：依序執行。完成時間 C1=b1、C2=b1+b2、C3=b1+b2+b3；等待時間 Wi=Ci−bi；周轉時間 Ti=Ci。給每個行程的 W、T 與平均等待、平均周轉。
  - **RR（quantum=q）**：以 q 為時間片輪轉模擬到全部做完，算出每個行程完成時間、平均等待、平均周轉。**用確定性模擬**（一個佇列、每輪扣 min(剩餘, q)、時間累加、剩餘>0 則重新入列尾）。
  - 一句話對比：RR 對短工作較公平、但 context switch 較多。
  演算法務必自行以純 JS 迴圈算，勿寫死數字。

### 03-執行緒與並行.html（Threads & Concurrency）
主題：同一行程內可有多條執行緒 thread，共享同一份記憶體（heap、全域），各自有自己的堆疊；多核心可真正平行。用 Amdahl 定律說明「為何加核心不一定變快」。
- Widget `amdahl`：輸入可平行比例 `amd-p`（number，0–1，step 0.05）與核心數 `amd-n`（number，min 1，整數）。輸出 `amd-output`：加速比 S = 1 ÷ ((1−p) + p ÷ N)；顯示 S、以及「就算 N→∞ 上限＝1÷(1−p)」。確定性。

### 04-同步與競態.html（Synchronization & Race Condition）
主題：多執行緒同時改同一份資料會出錯（競態 race condition）；臨界區 critical section 要用鎖 lock/互斥 mutex 保護；號誌 semaphore；死結預告（下移到第 10 章）。經典例：兩執行緒各對共用計數器 +1 共 n 次。
- Widget `race`：輸入每條執行緒加的次數 `race-n`（number，min 1，整數）與 `<select id="race-mode">`（value: lock=有鎖、nolock=無鎖最壞交錯）。輸出 `race-output`：
  - lock：最終值 = 2×n（正確）。
  - nolock 最壞情況：最終值 = n+1（兩執行緒最大重疊時，經典最少結果），並解釋「讀-改-寫非原子造成更新遺失 lost update」。確定性（用公式，不用亂數）。

### 05-記憶體與位址空間.html（Memory & Address Space）
主題：每個行程看到自己**連續的虛擬位址空間**，實際散在實體記憶體；以**分頁 paging** 對應。虛擬位址拆成「分頁號 page number + 頁內偏移 offset」。
- Widget `addr`：輸入虛擬位址 `va-addr`（number，整數 byte，min 0）與 `<select id="va-pagesize">` 頁大小（value 用 byte：1024、4096、16384，顯示成 1KB/4KB/16KB）。輸出 `va-output`：頁號 = ⌊va ÷ pagesize⌋、偏移 = va mod pagesize；並用「位址 = 頁號 × pagesize + 偏移」驗算顯示。確定性。

### 06-虛擬記憶體與分頁置換.html（Virtual Memory & Page Replacement）
主題：實體記憶體放不下時，把暫時不用的頁換到磁碟（swap）；存取到不在記憶體的頁＝**分頁錯失 page fault**，要換頁進來；框架 frame 滿了要挑一頁換出——置換演算法 FIFO、LRU。
- Widget `pager`：輸入參考字串 `pr-string`（text，如 `1 2 3 4 1 2 5 1 2 3 4 5`，以空白分隔的整數頁號）與框架數 `pr-frames`（number，min 1，整數）。輸出 `pr-output`：分別以 **FIFO** 與 **LRU** 模擬，算出各自的 page fault 次數與命中次數，並簡短說明兩者差異（LRU 用「最久沒被存取」當犧牲者）。**自行以 JS 迴圈模擬**（解析字串、維護框架陣列與 FIFO 佇列／LRU 最近使用時間）。確定性。

### 07-檔案系統.html（File System）
主題：檔案是位元組序列＋一份**中繼資料 metadata（inode）**；目錄是「名字→inode」的對照表；檔案內容切成固定大小**區塊 block**存放；inode 有數個直接指標，放不下改用間接指標 indirect。可觀察證據：`ls -i`、`stat`。
- Widget `fsblock`：輸入檔案大小 `fs-size`（number KB，min 0）與 `<select id="fs-block">` 區塊大小（value KB：1、4）。假設直接指標 12 個。輸出 `fs-output`：需要的區塊數 = ⌈size ÷ block⌉；判斷是否超過 12 個直接指標（超過就說明需要單層間接指標，並算間接指標區塊能再指多少塊＝block×1024 ÷ 4，假設每個指標 4 byte）。確定性。

### 08-輸入輸出與中斷.html（I/O & Interrupts）
主題：CPU 快、裝置慢；**輪詢 polling** 一直問很浪費、**中斷 interrupt** 讓裝置好了才通知；大量搬資料用 **DMA** 讓裝置直接寫記憶體。緩衝 buffering。
- Widget `iocost`：輸入資料量 `io-data`（number KB）、傳輸率 `io-rate`（number MB/s）、每次中斷處理成本 `io-irq`（number μs）、每個封包/區塊大小 `io-chunk`（number KB）。輸出 `io-output`：純傳輸時間 ≈ data ÷ rate（換算單位，用 1MB=1024KB）；中斷次數 ≈ ⌈data ÷ chunk⌉；中斷總開銷 = 次數 × io-irq；比較「中斷開銷相對傳輸時間的比例」，並說明 chunk 越大中斷越少但延遲越高。確定性。

### 09-系統呼叫與核心邊界.html（System Call & User/Kernel Boundary）
主題：一般程式跑在**使用者模式 user mode**，不能直接碰硬體；要請 OS 幫忙就走**系統呼叫 syscall** 進**核心模式 kernel mode**；模式切換有成本，所以頻繁小 syscall 很貴（例：一次讀 1 byte vs 一次讀一大塊）。可觀察證據：`strace`。
- Widget `syscall`：輸入總資料量 `sys-total`（number KB）、每次 syscall 搬的量 `sys-chunk`（number KB，min 1）、每次 syscall 固定成本 `sys-cost`（number μs）。輸出 `sys-output`：syscall 次數 = ⌈total ÷ chunk⌉；總固定成本 = 次數 × sys-cost；示範「把 chunk 從小改大，次數與總成本如何下降」（緩衝的價值）。確定性。

### 10-死結.html（Deadlock）
主題：多個行程互相等對方手上的資源，誰都動不了。死結四條件（同時成立才可能）：互斥 mutual exclusion、持有並等待 hold-and-wait、不可搶佔 no preemption、循環等待 circular wait。破解＝打破任一條件。
- Widget `deadlock`：四個 `<select>`：`dl-c1`、`dl-c2`、`dl-c3`、`dl-c4`（各 value: on/off，代表該條件成立與否）。輸出 `dl-output`：四者皆 on → 「可能發生死結」；任一 off → 「不會死結（該條件被打破）」，並指出打破的是哪一條、對應的實務手段（如一次要求全部資源＝破 hold-and-wait；資源可搶回＝破 no preemption；資源排序＝破 circular wait）。確定性布林。

### 名詞與概念字典.html
- 搜尋框 `<input id="term-search">`＋計數 `<span id="term-count">`；每個名詞一張 `<article class="term-card">`，可加 `data-search="中英別名"` 供搜尋。
- 涵蓋本課全部名詞：作業系統、核心 kernel、行程 process、程式 program、執行緒 thread、PID、行程狀態、context switch、排程 scheduling、時間片 quantum、FCFS、RR、周轉時間、等待時間、並行 concurrency、平行 parallelism、Amdahl、競態 race condition、臨界區 critical section、鎖 lock/mutex、號誌 semaphore、原子操作 atomic、虛擬記憶體、位址空間、分頁 paging、頁 page/框架 frame、page fault、置換演算法 FIFO/LRU、swap、檔案 file、inode、目錄 directory、區塊 block、間接指標 indirect、輪詢 polling、中斷 interrupt、DMA、緩衝 buffer、系統呼叫 syscall、使用者模式/核心模式、死結 deadlock（四條件）。
- 每個名詞給「白話／位置或層級／功能／機制／邊界（不能做什麼、常見誤解）」；概念類另給「角色／狀態或資料流／因果／可觀察證據」。
- app.js 的 `dictionary` 函式沿用 robot-math 版邏輯（搜尋過濾 term-card、更新 term-count）。

### index.html（課程地圖）
- 用 `chapter-list` / `chapter-card` / `number` 列出 00–10 各章＋字典，每張卡片一句話說明學到什麼。頁頂同款 `main-site-link` 與 `topbar`。標題「作業系統（零基礎互動課）」。

## 內容深度要求

- 每章解說要**足量、深入淺出**：每個關鍵概念都走「痛點 → 白話直覺（比喻收回精確定義）→ 具體數字實例（帶一組好算的數字，一行一行算）→ 為什麼／不要混淆（清單）→ 可觀察證據（哪個指令/檔案看得到）」。
- 互動小工具旁務必有「這個實驗在示範什麼、怎麼玩、數字變化代表什麼」的引導文字。
- 不灌水：每段要有新資訊。

## 收尾自檢（codex 用中文列出）

- 每頁互動元件 id 與 app.js 完全對得上（逐一列出各章 widget 的 id）。
- 全站 0 個 LaTeX 分隔符、0 個外部資源、app.js 內 0 個 `Math.random`/`Date`。
- `node --check app.js` 通過。
- 列出每章各做了什麼、各 widget 的計算邏輯與一組範例輸入輸出。

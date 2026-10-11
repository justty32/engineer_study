# 圖解作業系統：建置契約

[立案](PROJECT-BRIEF.md)｜[章節資料](evidence/chapter-contracts.json)｜[派工](派工計畫.md)

## 範圍與不變條件

公開檔案只放 dist。20 課 slug 與所有權固定於章節契約；builder 獨佔 app.js、lab.css、index.html、glossary.html；五位作者各四課。作者不得改共享程式／樣式，審核者不改產品。舊站不變；本線不 stage、不 commit、不 push。原生離線 HTML/CSS/JavaScript；無外部 runtime、fetch、隨機或時鐘依賴。來源可有非執行期官方超連結。不用 LaTeX runtime，純 HTML Unicode 算式。

## 頁面骨架

head 使用 UTF-8、viewport、title「NN 章名｜圖解作業系統」、lab.css、app.js defer。body 的 data-page 為檔名去 html。頁首 skip-link 到 #main；aside.sidebar 包 brand 連 index、課程導航、glossary，以及公開主站入口。main#main.lesson 包 lesson-header（eyebrow、h1、lead）、prerequisite（前置連結）、section-nav（#worked-example「完整演算」、#practice「自己試一題」）、解說、例題、自由互動、練習、sources 和 pager。每課至少兩張原創 inline SVG；例題章節 id=worked-example 常駐可讀，練習 id=practice 有獨立遷移題、分步提示、完整解；完整解可 details。

可用類別：concept、callout、warning、worked-example、formula、two-col、diagram、widget、controls、status、table-scroll、sources。表格包 table-scroll，正文不得造成頁面橫向溢出。SVG 用 viewBox／role=img／aria-labelledby／title與desc，不設硬性CSS寬度；文字與資料不能只靠色彩。320／390／1440寬與鍵盤、focus、reset、離線、noJS全部驗證。

## 共用 trace 契約

section.widget[data-trace] 有唯一 id，例如 trace-00。包含 SVG 的 g[data-state="0"]、g[data-state="1"]（可空白分隔多狀態）、controls 的 button[data-action=prev|next|reset]、p.status[data-trace-status][aria-live=polite]、ol.trace-steps 的 li[data-step="0"] 等。狀態是完整真操作後的快照；順序必與已寫的逐步解相同。所有步驟始終可見；JavaScript 只改當前 highlight 和 why，不能藏正文。

每課至少一個自由實驗。一般 trace 在正文完整教學後重播真實步驟，操作者可前後/重設，當前狀態有清楚機制原因及不變量。所有固定 trace 的初值、步數、狀態轉移、正確性判準及邊界由 builder 逐頁摘錄於[互動元件契約](evidence/widget-specs.json)；若需要額外參數，作者先與 builder 議定，不自行寫 script。

## 04、12 代表原型

04 放 section.widget#rr-lab[data-rr]，12 放 section.widget#va-lab[data-va]；兩者內有 h2、說明、div[data-lab-mount]、noscript 說明。builder 由掛點建完整 label/input/result 表。正文不依賴動態表。

RR 預設 A(到達0,CPU5)、B(1,3)、C(2,1)，單位 ms；q=2 ms。單 CPU、無阻塞 I/O、零切換成本、同時到達按 A/B/C。片內／片末新到達按到達時間與名稱排在原佇列後，再把未完成的當前行程放尾。A0–2,B2–4,C4–5,A5–7,B7–8,A8–9；完成9/8/5，周轉9/7/3，回應0/1/2，等待4/4/2 ms。控制 arrival=0..20、burst=1..20、q=1..10 整數；空值／非有限／非整數顯示錯誤不洩漏NaN。時間公式 W=C−A−B 僅此無 blocked 模型成立。exercise參數改動須獨立重算。

VA 固定16-bit與1KiB頁，VA 0..65535 byte可hex，PFN 0..63，Number安全整數且禁止bitwise依賴。VA0x1234=4660 byte，VPN4、offset564 byte，PFN9，PA9780=0x2634 byte。TLB hit/miss；PTE resident/nonresident/unmapped；權限 allow/deny。有效 TLB hit 的模型要與頁表/權限一致；非resident搭hit視為無有效快取再查頁表。missing/protection不輸出合法可讀PA。TLBmiss不等pagefault；pagefault不必diskIO；toy單層walk不冒充全部CPU。圖展示6-bit VPN與10-bitoffset。

## 來源、單位、驗收

每課關鍵claim至少有精確一手章節／頁或manpage支持；自行設計數值標為教學例，不冒稱教材原題。正確性審核必獨立重算全部例題／練習，檢查互動預設、正常／極端／無效輸入、原文勘誤，圖與文字同狀態。外部來源只作閱讀連結，離線不請求。

驗收固定八條見 handoff，報告保存於 evidence 與獨立驗收文件。headless 僅用現有 Playwright/Chromium，不下載、不操控桌面GUI，啟動的server／browser要清理。CSS獨立命名lab.css且舊shared styles正本閘門必查。wf-lint兩條歷史quote斷鏈保留基線，不修範圍外項目。

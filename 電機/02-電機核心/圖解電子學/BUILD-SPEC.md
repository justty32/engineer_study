# 圖解電子學建置規格

## 規格狀態與讀取

隊長已核可 24 章範圍。完整逐章規格是 [逐章互動契約](逐章互動契約.json)，作者用 tabledb 按 0-based 列號讀自己的 3–4 章。每列含控制量完整契約、公式、預設算例、圖解要求、近題、補充小節與前後頁；不得自行改公式或預設。共享程式與首頁由 builder 唯一寫入，章節作者只寫指派的 HTML。

## 每頁結構（所有作者共同必讀）

每頁使用 lang=zh-Hant、UTF-8 無 BOM。head 連 styles.css、site.css、app.js（defer）；title 必含「圖解電子學」。body data-chapter 為兩位數章號。頂部可跳主文的 skip link；header 使用 site-header，靜態 nav 連 index.html、00-circuit-bridge.html、名詞與概念字典.html、sources.html。main id=main-content。

開頭 eyebrow、具體問題 h1、lead 一句答覆、prereq 前置回連。接 figure.calc-figure，原創 SVG viewBox 約 0 0 720 300、role=img、title/desc；圖中量、節點、箭頭、工作點或波形必須對應算式，不畫無法解題的裝飾圖。可在首屏看見問題與算圖。正文 h2 依「已知、未知與選式」「為什麼這條式子成立」「把數字完整代入」「重驗與量測」鋪陳。主例每個中間步與單位直接可見，不藏在 details。每項數值代入都保留量綱；乘、除、平方與根號的各物理量附單位，同單位加減可用括號後共用單位。符號與單位要原地解釋，完整教學先於互動。

互動 section.workspace id=experiment，data-model 為兩位數章號。inputs 的 id 為 cXX-a/cXX-b/cXX-c，data-param=a/b/c；依資料列鎖定 type/min/max/step/value 或選項。每個 input 有 label for。按鈕 data-preset=0/1/2 顯示「預設／看邊界／另一組」，data-reset 顯示「重設」。輸出 div id=cXX-output class=output aria-live=polite 先寫預設數值與why；動態圖 svg id=cXX-plot viewBox="0 0 720 320" role=img aria-label 必有靜態預設折線與軸。JavaScript 同一計算模型同步產生圖、數值、文字。初始 controls 要與主文同一組值。無 JavaScript 時保留主文、首圖、主例、預設輸出與詳解。

互動後放條件／兩個極端與常見誤用；補充原課綱次要主題仍需合理解釋及至少該列指定小例。近題 section.practice 有另一組條件與問題；details 三段提示／完整詳解，完整詳解必須有代入、中間式、單位、重驗。章末 source-note 列原筆記冊章和 sources.html 連結，pager 上一頁/下一頁都使用契約檔名。

## 圖、文字與厚度

每章目標 1,800–2,600 漢字與全形標點，公式、SVG、表格外仍應有完整因果與限制；不靠重複句撐長。h1 用具體問題而非抽象課名。SVG 文字最小 16 px，短標籤；手機用可聚焦 figure-scroll 局部橫捲保留實際字級；長算式在圖下文字接續。方程使用 HTML sub/sup 或 Unicode，不使用需要渲染器的 LaTeX。svg 使用 class wire/curve/accent/fill-soft 與 text；不下載圖片。手機禁止固定頁寬，表格可包 table-wrap；內容不可靠水平捲動才能讀完整推導。

## 符號、模型與案例

所有數值為可重算的教學條件，不宣稱某真實器件典型值。固定 VT=25.85 mV（約 300 K 教學溫度）；BJT 恆壓降 VBE=0.7 V 僅是手算假設。NMOS K=μnCox W/L 不含 1/2；DC 主例 λ=0。主動區必檢 VC>VB；NMOS 飽和必檢 VDS≥VGS−Vth。圖中小訊號源是增量，不能當成總電流。DAC 使用 D/2^N Vref；ADC 使用 floor(Vin/q) 及最大碼截限，端點與重建值慣例必明寫。

## 驗證與所有權

作者交件只摘要檔名、篇幅、數值自檢、限制，不貼原文。builder 收件檢節點契約、UTF-8、相對連結、外部執行資產、JS 語法；獨立驗收者另重算與瀏覽器驗收。原三冊、舊站、共享行政、git、正本 CSS、同步工具均不可修改。styles.css 從正本位元組複製，site.css 附加產品樣式。CRLF 收尾時統一，styles.css 例外。

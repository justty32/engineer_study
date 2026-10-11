# 圖解電路學：建置契約

## 教材責任

20 頁順序、來源章節、參數範圍、預設、公式、算例與必要覆蓋已鎖在 [章節規格.json](章節規格.json)。每列以 id 對應教學頁；plot_output 鎖定靜態與動態曲線的同一觀察量。這是唯一互動數值契約。作者分波最多四頁，領地列在 [派工資料.json](派工資料.json)。

## 作者頁面契約

檔名為 slug.html。完整 HTML5、UTF-8 無 BOM、CRLF 行尾、lang=zh-Hant、viewport；title 為「章名｜圖解電路學」。只引用 lab.css 與 defer app.js。body 的 data-page 等於 slug。header.site-header 含回 index.html 的品牌；div.site-layout 內 aside.course-nav 放全課導航（可由程式增強，至少保留 index/字典靜態連結），main#main-content 內為完整主文。跳至主文連結 class=skip-link。footer.pager 靜態連到正確前後頁。不得連 Markdown。

主文依序：lesson-head（eyebrow、h1、lead、prereq、錨點理解/計算/練習/實驗）；section#understand 具體題目與圖；section#calculate 完整解析；section#practice 近題；section#experiment 互動。頁尾模型適用條件、兩種極端案例、儀器如何驗證，以及 sources.html 的來源連結。主文每頁建議漢字與全形標點 1800–2800，圖解完整與計算可跟做優先；不得以字數灌水。

主例解答不得藏 details。近題至少兩個獨立 details 提示和一個完整詳解；解答要列式、代值、單位、驗算。教學靜態 SVG 每頁至少一張；必要時三步畫同一圖的不同標示，圖不能只有方程卡。電流箭頭、電壓極性、節點名與圖例必須和正文公式一致。重要 SVG 有 role=img、title/desc/aria-labelledby 與圖外文字替代。圖框 .diagram 可鍵盤水平捲動，SVG viewBox 的字不小於 15；小螢幕容器內捲動不能撐寬頁面。用 .equation 包每步等式，用 .quantity-map 對應符號，用 .calculation-steps 列完整演算。

## 互動 DOM 與邊界

每頁僅一個主 widget：section.lab#experiment[data-lab="章id"]。包含 label[for="lab-input"]（用規格 control）、input#lab-input type=range（min/max/step/value 照規格）、output#lab-value、button#lab-reset type=button「重設主例」、div#lab-results[aria-live=polite]、p#lab-why、svg#lab-plot（viewBox="0 0 600 280", role=img, title/desc）、p#lab-description。結果、why、圖說初始要有靜態主例數字，不依賴 JS 才讀得到。程式用同一模型掃描輸入範圍繪輸出曲線，點出目前控制量；動態 desc/圖說必同步。所有互動位於完整教學與近題之後；輸入可鍵盤箭鍵改值，重設精確回主例。

Type 固定 range；選項順序不適用；每列 min/max/step/default 均完整。每次輸入只算規格模型，無網路、時間或亂數。判準：主例結果誤差 < 0.0001 相對值（圖顯示可四捨五入），守恆或方程殘差 < 1e-9；min/max 都有限數；空/非數值回復預設，超界夾限；UI 說明有效範圍。圖例：實線是掃描模型、圓點是現在輸入，兩軸明示量與單位。至少一條 why 說明參數改變如何透過方程影響物理量。

## 檔案所有權

建置指揮官：brief/spec/派工/README/建置進度、dist/lab.css、app.js、index.html、glossary.html、sources.html、test/。章節作者 A：00–09 教學 HTML，作者 B：10–19 教學 HTML，分波實際授權；不改共用 JS/CSS。來源員：教材查證.md、教材來源.json、原筆記修正候選.json。獨立驗收者：驗收紀錄與證據。禁止 git、外部查詢、下載依賴、GUI、原筆記、舊站、共享行政檔、nvim.log、prompt.md。真實模型為繼承的 Codex，不宣稱 Claude。

## 外觀與驗證

使用獨立 lab.css 視覺家族，不建立 styles.css，不動樣式正本或 FAMILY。白底深墨、青綠與琥珀標示、桌面窄側欄，內容閱讀寬度有節制；第一畫面能看見題目與解題圖。390 與 320 僅圖容器內可捲，頁面不得水平溢出。遵守 reduced-motion，focus可見。使用既有 headless 環境不新裝。

驗證：完整課綱、逐頁主例與近題重算；node --check；HTML id/相對連結/UTF-8/外部資源/LaTeX 殘留；20 widgets 正常/min/max/reset；1440/390/320 與關 JS 靜態教學；瀏覽器零 console error、零遠端請求；來源註記追溯。獨立驗收接管後，作者按缺陷修正自己的檔。

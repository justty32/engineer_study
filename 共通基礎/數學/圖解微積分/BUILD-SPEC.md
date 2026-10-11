# 圖解微積分 — 建置契約

## 結構與視覺

成品共 53 檔：26 HTML、26 JavaScript、1 CSS；26 頁包含 23 教學章、首頁、50 詞字典與來源頁。互動契約共 25 列，包含 24 個參數實驗及字典搜尋；教材與銜接索引共 25 列，後續電子／電路接線共 2 列。

26 個 HTML 頁面：完整順序、教學問題與圖解步驟見 [圖解改版計畫.json](圖解改版計畫.json)。既有 16 頁保留 URL，新增 elementary-functions、local-linear、charge-current、first-order、coordinates、line-integrals、potential、flux、div-curl、gauss-stokes。每個學習頁有同名 JS。共用 lab.css 與 shared.js；首頁另有 home.js、字典另有 glossary.js。

獨立數學實驗筆記視覺：米白紙面、深藍文字、鈷藍曲線、檸黃／珊瑚的觀察標記。桌面保留側邊課程路徑，主內容最大 1220px。先以逐步 SVG 分鏡建立同一例子的因果，再用主實驗圖與控制器開放操作。手機圖形可橫捲以保持字體，整頁不溢位；所有圖附標題／文字等價結果。

## 作者共用 DOM

HTML 宣告 zh-Hant、viewport、description、行內 SVG favicon，載入 lab.css、defer shared.js、defer 同名 JS。body 設 data-page 為檔名不含副檔名。固定殼層為 `<header id="site-header"></header><div class="site-layout"><aside id="course-nav"></aside><main id="main-content">…</main></div><footer id="site-footer"></footer>`。本地靜態導覽由 shared.js 渲染；頁尾以 `<nav class="pager">` 寫明前後頁。無 JS 時保留 `<noscript>` 返回首頁及實驗需啟用腳本說明。

頁首 `.lesson-head`：`.eyebrow` 編號、h1 白話問題、`.lead` 一句答案、`.prereq` 前置連結。先用 `.visual-story`／`.story-steps`／`.story-step` 建立具體問題與逐步圖；每一步寫出前後變化，完成可計算的小數值例後，才出現互動。首屏可為靜態圖解；圖數與滑桿數量不是教學驗收。主實驗 `<section class="experiment" id="experiment">` 含 `.experiment-top`、`.experiment-grid`；左 `.diagram-scroll` 包 `<svg class="lab-svg" viewBox="0 0 820 420" role="img" aria-labelledby="…">`，右 `.controls` 具明確 label/output、reset 按鈕。回饋 `.feedback` role=status aria-live=polite；結果 `.readouts` 中用 `.readout`。解說使用 `.story-grid`、`.concept`、`.formula`、`.caution`、`.worked-example`、`.source-note`，不要每段都框成卡。

`.diagram-scroll` tabindex=0 加 aria-label；手機提示 `.scroll-hint`。按鈕觸控至少44px。select、input 一律有 label。range 初值、step、範圍嚴格對照互動契約。所有操作即時更新圖、量與原因，有 reset。沒有 submit、分數、亂數、網路請求或儲存需求。模擬值若為教學任意值必須明示；不要聲稱為真實量測。

## shared.js API

`Calc.fmt(n,d=2)` 安全有限數格式；`Calc.path(fn,xmin,xmax,X,Y,steps=140)` 採樣成 SVG path，遇非有限值斷線；`Calc.plot({xmin,xmax,ymin,ymax,x=74,y=35,w=700,h=320,xticks,yticks,xlabel,ylabel})` 回傳 `{X,Y,axes}`，axes 是格線／軸／數字／標籤 SVG。`Calc.line(x1,y1,x2,y2,cls)`、`Calc.dot(x,y,cls,r=6)`、`Calc.text(x,y,label,cls)` 可用；所有實驗也可自行寫原生 SVG。

SVG 共用色類 `.curve` 藍、`.curve-alt` 珊瑚、`.tangent` 深藍虛線、`.area-fill` 淡藍、`.area-negative` 淡珊瑚、`.gridline` 細灰、`.axis` 深灰、`.svg-label` 16px、`.svg-small` 14px、`.marker` 黃。SVG文字禁止小於14px。動態文字只由受控數值或固定詞彙組成，不把搜尋輸入拼進HTML。

## 互動、來源與作者

逐章參數、計算、數值例與限制由 [互動契約.json](互動契約.json) 保存。每列均有 id/type/page/controls/equation/criterion/examples/boundary/source；章節作者只能依契約落地，需更動先回報指揮官。首頁、字典與共用檔由 builder；章節唯一作者見 [派工計畫.json](派工計畫.json)。QA 獨占驗收紀錄.md，root 獨占 .openai/。

## 驗收

語法、UTF-8、連結、id、零外部執行資源、無 LaTeX 分隔符。官方參考連結可放 sources 頁，與外部 script/font/image 明確區分。PC 1440×900、手機390×844/320寬，鍵盤可操作、reset完整、邊界不出現無效數值。獨立 QA 重算預設與極端數值。舊站 CSS 家族不得改，lab.css 是使用者授權的新圖解設計；共享舊站的 sync-styles 檢查仍要通過。

## 圖解改版契約

`.story-steps` 為二欄分鏡、手機一欄；每個 `.story-step` 依序含 `.step-number`、h3、inline SVG 與解釋。SVG 採約 400×240 的單一小步，不將長句硬塞進圖內；圖文共同可推回數值。每張 SVG 具唯一 title id，文字至少 14px；窄螢幕保留圖內字體尺度，分鏡容器可水平捲動並提供提示，正文與整頁不橫向溢出。

非核心證明與額外推廣可放 `details.extra`；完成本課算例必要的符號、代數、代入、單位及條件必須直接可見。原互動若另換例子須明確過渡，預設優先與故事一致。新工程例先畫完整回路／截面／方向，單位隨數值呈現。

新十章 DOM 共用 main-drawing／main-desc、feedback、reset；三項結果 readout-a/b/c，動態標籤 label-a/b/c。控制器 id／參數逐頁查互動契約。分鏡各包 story-figure-scroll，可鍵盤捲動且附小螢幕提示；400px 內文尺度保留最小14px，不以縮圖讓字低於可讀尺度。

新章共用掛載 `Calc.attach({controls, defaults, render})` 只在必要元素存在時執行。render 回傳 svg、values（三項結果）、labels（可選）、feedback 和 desc（可選）；range讀數值，select讀受控字串，重設先恢復所有預設再重畫。沒有額外網路或資料儲存。

## 收線與延續

概念圖解版本已完成作者與三審流程；其逐頁責任及受驗雜湊保存在圖解改版計畫.json／派工計畫.json，不因計算續輪覆寫舊證據。教材依據見教材與銜接索引.json，電子／電路後續責任見後續課程接線.json。獨立數學、教學與技術驗收的最終判定統一引用[驗收紀錄](驗收紀錄.md)，不以檔案數、圖數或測試數聲稱真人理解。

## 計算橋接契約

使用者能看懂概念卻尚不會選式與算題，因此全 23 課補齊計算橋接。導數原型經 root 確認後，全課已完成並另經獨立三審；部署狀態依驗收紀錄中的發布證據。每個教學頁要形成完整可執行路徑：題目 → 圖上量、方向與符號對應 → 選公式的理由與條件 → 每項及每步的由來 → 同題數值代入 → 含單位、正負號及中間值的逐行計算 → 合理性檢查 → 一道相似遷移題。題目與主實驗沿用同一系統；新值須交代是同規則的哪次變動。

頁面不必機械新增八張卡。原分鏡已有完整數值者，直接在圖旁補符號對應、行間運算及選式判斷；缺完整例題者用 `.calculation-bridge` 加入可見算例。`.calculation-problem` 寫題目與求什麼，`.quantity-map` 說明符號對應，`.calculation-steps` 依序包含 `.step-equation` 與 `.step-reason`，`.calculation-check` 回查答案，`.transfer-practice` 提供未改模型的相似問題。提示與完整解答可用 `details`，核心計算不能整段折疊。長算式局部橫捲且可鍵盤聚焦；正文不溢出，不縮小字體換取塞入畫面。

計畫、選式及計算缺口見[計算教學計畫](計算教學計畫.json)。導數原型以實際桌面圖確認了「四塊平方 → 去掉原項 → 重排長條 → 除高得寬」如何解釋式子的每項與每步，已取得 root 確認。其他章依公式性質使用面積拆合、剩餘差、法向投影、邊界抵消等適切圖解，不硬套拼塊，也不能只放一張符號對照圖後恢復整段文字代數。

各批由隊長自主預審，另由獨立數學、教學與技術審查逐課驗收。ready 批次保留精確 HTML／JS／CSS 雜湊與實際畫面；作者交批即停筆，修正按審查缺口進行。新的全課候選快照另存，不覆寫概念版 53 檔基線。獨立審查要確認每個等號成立、單位與方向一致、遷移題完整可算，以及讀者可從題目知道第一步；不能只確認公式或數值結果正確。互動程式未改者不無故重算全套舊數值，新 HTML／CSS 的畫面及教學內容仍須驗收。

頁面加長後，在各課頁首以當頁錨點提供「看圖理解 → 一起算 → 自己算」短路線，直接連到概念、可見算例與遷移題；使用 HTML 與現有樣式，不改共用導航程式，也不增加依賴。

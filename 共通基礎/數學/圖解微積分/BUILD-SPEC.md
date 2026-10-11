# 圖解微積分 — 建置契約

## 結構與視覺

16 個 HTML 頁面：index、00-start、limits、derivatives、rules、applications、integrals、fundamental、techniques、series、multivariable、multiple-integrals、vector-fields、engineering、glossary、sources。每個學習頁有同名 JS。共用 lab.css 與 shared.js；首頁另有 home.js、字典另有 glossary.js。

獨立數學實驗筆記視覺：米白紙面、深藍文字、鈷藍曲線、檸黃／珊瑚的觀察標記。桌面保留側邊課程路徑，主內容最大 1220px。巨幅 SVG 教學圖及旁列控制器為主，不做純文字卡片堆疊。手機圖形可橫捲以保持字體，整頁不溢位；所有圖附標題／文字等價結果。

## 作者共用 DOM

HTML 宣告 zh-Hant、viewport、description、行內 SVG favicon，載入 lab.css、defer shared.js、defer 同名 JS。body 設 data-page 為檔名不含副檔名。固定殼層為 `<header id="site-header"></header><div class="site-layout"><aside id="course-nav"></aside><main id="main-content">…</main></div><footer id="site-footer"></footer>`。本地靜態導覽由 shared.js 渲染；頁尾以 `<nav class="pager">` 寫明前後頁。無 JS 時保留 `<noscript>` 返回首頁及實驗需啟用腳本說明。

頁首 `.lesson-head`：`.eyebrow` 編號、h1 白話問題、`.lead` 一句答案、`.prereq` 前置連結。先教 2–3 句必要概念及數值例，再出現互動。主實驗 `<section class="experiment" id="experiment">` 含 `.experiment-top`、`.experiment-grid`；左 `.diagram-scroll` 包 `<svg class="lab-svg" viewBox="0 0 820 420" role="img" aria-labelledby="…">`，右 `.controls` 具明確 label/output、reset 按鈕。回饋 `.feedback` role=status aria-live=polite；結果 `.readouts` 中用 `.readout`。解說使用 `.story-grid`、`.concept`、`.formula`、`.caution`、`.worked-example`、`.source-note`，不要每段都框成卡。

`.diagram-scroll` tabindex=0 加 aria-label；手機提示 `.scroll-hint`。按鈕觸控至少44px。select、input 一律有 label。range 初值、step、範圍嚴格對照互動契約。所有操作即時更新圖、量與原因，有 reset。沒有 submit、分數、亂數、網路請求或儲存需求。模擬值若為教學任意值必須明示；不要聲稱為真實量測。

## shared.js API

`Calc.fmt(n,d=2)` 安全有限數格式；`Calc.path(fn,xmin,xmax,X,Y,steps=140)` 採樣成 SVG path，遇非有限值斷線；`Calc.plot({xmin,xmax,ymin,ymax,x=74,y=35,w=700,h=320,xticks,yticks,xlabel,ylabel})` 回傳 `{X,Y,axes}`，axes 是格線／軸／數字／標籤 SVG。`Calc.line(x1,y1,x2,y2,cls)`、`Calc.dot(x,y,cls,r=6)`、`Calc.text(x,y,label,cls)` 可用；所有實驗也可自行寫原生 SVG。

SVG 共用色類 `.curve` 藍、`.curve-alt` 珊瑚、`.tangent` 深藍虛線、`.area-fill` 淡藍、`.area-negative` 淡珊瑚、`.gridline` 細灰、`.axis` 深灰、`.svg-label` 16px、`.svg-small` 14px、`.marker` 黃。SVG文字禁止小於14px。動態文字只由受控數值或固定詞彙組成，不把搜尋輸入拼進HTML。

## 互動、來源與作者

逐章參數、計算、數值例與限制由 [互動契約.json](互動契約.json) 保存。每列均有 id/type/page/controls/equation/criterion/examples/boundary/source；章節作者只能依契約落地，需更動先回報指揮官。首頁、字典與共用檔由 builder；章節唯一作者見 [派工計畫.json](派工計畫.json)。QA 獨占驗收紀錄.md，root 獨占 .openai/。

## 驗收

語法、UTF-8、連結、id、零外部執行資源、無 LaTeX 分隔符。官方參考連結可放 sources 頁，與外部 script/font/image 明確區分。PC 1440×900、手機390×844/320寬，鍵盤可操作、reset完整、邊界不出現無效數值。獨立 QA 重算預設與極端數值。舊站 CSS 家族不得改，lab.css 是使用者授權的新圖解設計；共享舊站的 sync-styles 檢查仍要通過。

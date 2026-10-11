# 圖解線性代數 — 建置契約

## 產品與視覺

18 個 HTML：index、00-start、vectors、basis、matrices、composition、systems、rank、determinant、projection、least-squares、eigen、diagonalization、qr、svd、engineering、glossary、sources。15 章各有同名 JS；首頁 home.js，字典 glossary.js，共用 shared.js 與 lab.css。總計 37 個產品檔。

米白紙、深藍字、電光藍輸入箭頭、珊瑚輸出箭頭與萊姆黃面積；格紙、成對座標系、平行四邊形是線代的視覺主角。PC 左側為學習路徑、右側可操作圖面及控制器；首頁第一 viewport 就有能動的空間。禁止靠大量小卡片代替解釋。主 SVG 為 820×440，兩軸長度比例相同，圓與直角不能畫歪；圖文字至少 14px。小螢幕主圖可橫捲，整頁不可溢位，文字等價輸出完整。

## 作者共用 DOM（所有作者讀此段）

HTML zh-Hant、UTF-8、viewport、description、SVG data favicon。載入 lab.css、defer shared.js、defer 同名 JS。body data-page 是檔名不含副檔名。殼層 `<header id="site-header"></header><div class="site-layout"><aside id="course-nav"></aside><main id="main-content">…</main></div><footer id="site-footer"></footer>`。頁尾手寫 `.pager` 前後章連結，noscript 保留回首頁及需 JS 提示。

`.lesson-head` 含 `.eyebrow` 編號、h1 白話問題、`.lead` 一句答案、`.prereq` 連到已教先備。先寫 2–3 句概念與具體數值例，再上互動；把必要條件留正文，推導可放 details.extra。每章約 650–1100 字，內容足夠且不要把圖押到首屏之外。

主實驗固定 id=experiment；`.experiment-top`、`.experiment-grid`，左 `.diagram-scroll` tabindex=0 aria-label 包 `<svg class="lab-svg" viewBox="0 0 820 440" role="img" aria-labelledby="…">` 含 title/desc、動態 `<g id="drawing">`；右 `.controls` 具 label、output，reset 按鈕 id=reset。input/select id 照契約，output 使用 id 的 `-value`。結果 `.readouts .readout` 中固定至少 `result-primary`、`result-secondary`；`.feedback` id=feedback role=status aria-live=polite。每章至少一張補充原創小 SVG，不能只有控制項與主圖。

正文可用 `.story-grid .concept`、`.formula`、`.worked-example`、`.caution`、`.source-note`。主實驗不得抽籤、網路請求或持久化。所有控制即時更新圖／值／why；重設回契約值。英文縮寫須解說；不以術語取代因果。

## shared.js API

全域 `LA`：`fmt(n,d=2)` 有限數格式、`text(x,y,label,cls='svg-label',anchor='start')`、`line(x1,y1,x2,y2,cls='axis')`、`dot(x,y,cls='marker',r=5)`。`plane({cx=410,cy=225,scale=42,extent=4,xlabel='x',ylabel='y'})` 回傳 `{X,Y,axes}`，等比例軸含整數格線、刻度與原點。可傳 extentX/extentY 取代 extent，常見一張圖 cx410/cy225/scale42/extentX8/extentY4。`arrow(x1,y1,x2,y2,color='blue',label='')` 用像素座標、獨立箭頭多邊形，零長度畫圓；color可blue/coral/ink/yellow/green，文字由作者自行安排亦可。

`LA.mat(A,v)` 回傳 2D 乘積；`LA.mul(A,B)` 回傳 2×2 矩陣乘法；`LA.vec(v)` 字串 `(a, b)`；`LA.matrix(A)` 字串 `[a b; c d]`；`LA.bind(ids,update,defaults)` 綁 input/change、reset 並呼叫首次 update，defaults 為 id→值，沒有亂數。作者可自行原生 SVG，不修改共用檔。

顏色 class：curve 藍、curve-alt 珊瑚、tangent 深藍虛線、area-fill 透明藍、area-negative 透明珊瑚、gridline、axis、svg-label16px、svg-small14px、svg-title21px、marker 萊姆黃。共用 CSS 同時支援 existing calculus 樣式名稱，不能修改舊站任何資產。

## 參數與來源

[互動契約.json](互動契約.json) 16 列：id、type、page、controls、equation、criterion、examples、boundary、source、author 全部必填。預設值均是刻意選取的教學數值，沒有量測宣稱；量通常無物理單位，工程例另標離散步數。數值例與退化情況均須 QA 獨立驗算。章節以 `sources.html#foundations`、`#systems`、`#geometry`、`#decompositions`、`#engineering` 指向已查證來源分組。

## 四包作者的讀取段落與章序

A 基礎（契約 rows 1–4）：00-start → vectors → basis → matrices，接 composition。只持有這四章 HTML+JS。

B 變換與解（rows 5–8）：composition → systems → rank → determinant，前 matrices、後 projection。只持有這四章 HTML+JS。

C 投影與特徵（rows 9–11）：projection → least-squares → eigen，前 determinant、後 diagonalization。只持有這三章 HTML+JS。

D 分解與工程（rows 12–15）：diagonalization → qr → svd → engineering，前 eigen、後 glossary。只持有這四章 HTML+JS。

所有作者讀本契約 9–27 行共用 DOM/API，再用資料工具只讀自己契約列；可以讀本地來源相應章，禁止上網與另開 agents。共享框架、首頁、字典、來源頁由 builder；驗收紀錄.md 為 QA；.openai/ 為 root。完整唯一所有權與狀態記在 [派工計畫.json](派工計畫.json)。

## 驗收邊界

PC 1440×900、390×844 與 320px 手機；headless Chrome、鍵盤、重設、reduced-motion、file:// 離線；所有同站相對連結存在、HTML 無重複 id、UTF-8、JS 語法、零外部執行資源與 LaTeX 分隔符殘留。舊樣式同步閘門維持。獨立驗收者寫驗收紀錄；SVG 不剪重要數字、零向量／秩不足／無解不能出現 NaN。真實手機觸控、Safari/Firefox、讀屏使用另列待人工，不偽稱完成。

## 2026-10-11 逐步圖解改版契約

讀者實看認為首版不夠 ELI5、圖像推理不足。新版每頁先說一個具體小問題，以首屏三步分鏡把角色與動作教會；接著短段文字與原創圖交錯，先演小數字，再引導控制器。每圖必須解釋一個尚未建立的因果或反例。術語、符號和完整公式放在圖解之後，推導可折疊，關鍵適用條件不能藏起來。逐頁圖義與唯一作者見 [圖解改版計畫.json](圖解改版計畫.json)。

共用 `.visual-story` 為教學段、`.story-intro` 為首屏、`.story-figure` 為可水平捲動圖容器、`.story-caption` 是圖下注解、`.step-label` 為步數、`.try-this` 是先做／再看的操作提示。首屏 SVG 建議 viewBox 820×260–310，內文圖 820×250–360，分鏡數字/正文18px起、小字16px起，縮放後小於可讀字級時容器橫捲。每張圖有 title 與 desc，圖旁提供文字結論，不依賴顏色區分意義。

原16實驗數學模型保留；矩陣章因同例教學而增設份數選項並改預設，契約已同步。可重排章節與改提示；若改數值、範圍或計算則同步更新互動契約並重驗。先審00-start與matrices兩頁，再放行最多四位互斥章作者。

root 審閱 PC 首屏後批准 00-start 與首頁樣板。此次首屏優先讓讀者沿三幕追蹤同一物件，主互動移到完整分鏡與小數字例子後面，不為保留舊版首屏控制器而打斷教學。矩陣章故事與實驗改用同一組路線卡 [[2,−1],[1,1]]、預設兩藍一橘，新增份數選項並將改卡滑桿放入可選區；新 DOM 與預設已同步互動契約。

另兩項教學預設同步：least-squares 的 middle 由 2 改為 3，讓初次三點確實不共線、殘差比較有意義；slope=1、intercept=1 不變。SVD 的 phi 與 theta 都改 90 度，sigma2=1，四階段在同屏並列並追蹤同三個圓周點，stage 選單只指定要看的階段。這些改動與重設需依新版互動契約驗收，舊預設測試不可繼續當作期望值。

QR 的 height 預設由 1 改 2（tilt=1），讓「剩下長兩格，再縮成一格」這一步能直接看見，重設與來源數值例保持一致。矩陣主圖左側使用實際路線卡與份數、右側才畫路線；對角化中間兩步也使用份數卡，避免把同一向量換座標誤畫成物體真的搬動。

基底章再依教學審查把 a、b 預設改為 −1、2（mode 仍 independent），直接到達開場禮物 (1,2)。第一個引導只改第二張路線卡，保持份數不動，才能比較新增方向帶來的差異。reset 與互動契約同時更新。

行列式章 d 預設改 3，範圍擴為 −3～3（級距 0.5），a=2、b=1、c=0 不變：主圖與剪補故事全程同一面積 6 的平行四邊形。倒帶例也統一 (1,1)→(3,3)→(1,1)，避免剛懂面積 6 又被切換到沒有教學用途的高度 1。這是第六項互動契約變更。

共享 plane 新增可選 tickStep（預設 1）與 showOrigin（預設 true）；僅四個緊密小圖章傳 2／false，格線仍每格 1、文字每兩格標示。既有其他頁的預設渲染不變，數學計算不變；用來解開靠近原點的刻度文字重疊。

## 改版收線

18 頁已完成逐步圖解改版。四位作者均停止寫入；六項互動契約變更與重設全部通過獨立驗算。數學審查、全頁圖像教學審查與技術 QA 分開記錄，結論均通過；受驗版本與待真人檢視的範圍以 [驗收紀錄.md](驗收紀錄.md) 為準。不能以 SVG 件數或通過測試數字聲稱讀者已學會。

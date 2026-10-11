# 建置契約：物聯網小小實驗室

## 成品與外觀

只寫本目錄。成品放 dist/；index.html 是零基礎起點（等同 00 頁）。主線為 sensors.html、brain.html、power.html、network.html、messages.html、security.html、reliability.html；另有 glossary.html、sources.html。暖米白 #f8f7f2、墨綠 #183e37、草綠 #b8cc9a、橘色 #ed8154、淡米灰 #eae9df；自帶系統字型。圖比字大，頁面以一張大型機制圖＋可操作工作台為核心。

## 單一作者與載入契約

builder 擁有全部 HTML、lab.css、common.js、home.js、glossary.js、metadata.js 及文件。章節作者只寫其獨佔 dist/{id}.js：A=sensors/brain，B=power，C=network/messages，D=security/reliability。沒有作者再生子 agent。派工記錄在 [派工計畫.json](派工計畫.json)。

每個章節檔使用 IIFE 並登記 window.IOT = window.IOT || {}; window.IOT[id] = { title, intro, prerequisite, markup, mount(root), sources, limits }。title 是白話問句，intro 至多 2 句、先教因果；prerequisite 為一句說明。markup 是安全靜態 HTML 字串；mount(root) 在插入 markup 後呼叫，只查 root 內元素，操作同步更新圖、數值與 why。sources 是來源章節文字陣列，limits 是模型假設字串。共用 shell 負責頁首、標題、前置導航、課程導航、來源 details 與頁尾；章節作者不重複寫。

每個模組的主容器用 .lab-grid，左 .lab-panel 放 <svg class="diagram" viewBox="0 0 900 480" role="img" aria-labelledby="id-title id-desc"> 與短圖說，右 .lab-controls。SVG 標記 title/desc，圖中文字盡量至少 22px，不放太多細字。1000px 以下改為上下排列，圖固定至少 780px 並在可鍵盤聚焦的局部圖區橫移，非迫使整頁橫向捲動；首頁長圖固定至少 1000px。類比不是資料來源。

共用 class：.control（label/輸入群）、.reading（數字）、.why（因果回饋，role=status aria-live=polite）、.small、.button、.button.secondary、.segmented（按鈕群）、.mini-legend、.tag、.diagram-caption、.lesson-note。必須用原生 button/input/select；range 有 label 和 output；button 有 type=button；每實驗有「重設實驗」。不要 inline onclick，不建立 timer，不依賴 CDN、模組 import、fetch 或外部圖片。所有 id 以章節 id 前綴。狀態不只用顏色表達；操作後保留焦點。

## 教學與數學契約

完整欄位 id/type/範圍/預設/計算式/判準/數值實例/來源/作者存於 [互動契約.json](互動契約.json) 的 8 筆記錄；作者只讀自己的記錄。範圍內每次操作皆更新，不要求提交或答題；重設回到標準示例。所有教學假設在頁面可讀，不把模擬時間、距離或百分比當產品規格。電池例使用同一電池端電流；MQTT 確認不是實體動作證明；安全不把 CRC 當簽章；感測器斷線不是乾燥 0%。

## 驗收方法

每檔 node --check；逐頁相對連結存在、UTF-8、SVG title/desc、無外部資源、無 LaTeX 殘留。獨立 QA 用 headless 驗桌面與 390px 手機版、鍵盤、console error、全部互動、預設與極端例、重設、動態文字。確認舊站 diff 零；wf-lint 由 root 整合。lab.css 為本次自訂設計，不參與舊 styles.css 同步。sources.html 明示簡化模型和可核來源，不把模擬畫成量測結果。驗收紀錄由獨立 QA 單一作者負責。

# 建置契約

## 課程資料與教學計算

沿用 `window.CIRCUIT_AUDIO.lessons` 介面。lesson ID：`impedance-origin`、`rc-analysis`；segment ID：`z1-01` 起、`z2-01` 起。每堂 9 段，總計 4200–5000 漢字，估時採 240–280 漢字／分鐘，三次停靠。figure ID 依序：`derivative-wave`、`impedance-map`、`frequency-effect`、`rc-loop`、`rc-vectors`、`rc-wave`。講稿明說圖一至圖六與觀察目的，checkpoint=true 段末停止。

固定例：ω=1000 rad/s（f≈159.15Hz、T≈6.283ms）、R=100Ω、C=10μF、Vₛ=10∠0°V（峰值）。Zc=−j100Ω；Z=100−j100=141.421∠−45°Ω；I=0.05+j0.05=0.070711∠45°A；Vr=5+j5=7.0711∠45°V；Vc=5−j5=7.0711∠−45°V；Vr+Vc=10V。i(t)=0.070711cos(1000t+π/4)A；vc(t)=7.0711cos(1000t−π/4)V。時間零點由來源正峰值決定。

## 互動契約

- id `frequency-scale`；type range；範圍 0.25–4、step 0.25；預設 1；固定 R=100Ω、L=0.1H、C=10μF，ω=1000×scale，XL=ωL、XC=1/(ωC)；判準：頻率加倍，XL加倍、XC減半；實例scale=1各100Ω、scale=2分別200Ω與50Ω。頻率趨勢圖只用各阻抗的大小，不混成未定義RLC拓撲。
- 停靠、段落切換、朗讀與真音檔播放器沿用上一課契約；新storageKey獨立。音檔manifest初始segments={}、不借用上一課sample。真音檔可seek與0.75–2倍速；沒有檔時清楚提示，只有使用者按播放才browser TTS。
- 圖四畫閉合串聯RC與來源極性、順時針電流及被動元件電壓正負。圖五Vr/Vc等比例首尾相接，總向量10V；圖六共時間軸電壓以V真刻度，電流另歸一化或獨立刻度，不混用單位。

## 檔案所有權

script：lesson-data.js、完整口語稿.md。builder：index.html、audio-course.css、audio-course.js、audio-manifest.js。qa：驗收紀錄.md。lead：本檔、PROJECT-BRIEF.md、派工計畫.md、原課index.html及10頁的最小導航、wf行政。

## 驗收（五項）

1. 正文可說字數與估時、MD和JS正文完全一致。
2. 獨立重算數學、相位／峰值／餘弦慣例與固定RC範例。
3. SVG圖文、比例、手機可讀，必要概念不只藏補充。
4. 連結、UTF-8、JS語法、工作流lint；既有舊斷鏈獨立標記。
5. CPU headless（--disable-gpu）驗導航／折疊／無音檔降級／停靠，不搶桌面，關閉測試瀏覽器。既有預覽server保留。

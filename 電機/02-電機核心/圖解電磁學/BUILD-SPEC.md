# 圖解電磁學：建置契約

## 唯一契約與章節

固定28教學頁00–27，檔名、來源小節、必教知識點、控制量、min/max/step/default、公式、預期值及前後頁全部存 [章節規格.json](章節規格.json)。作者只查授權的列，不讀整份資料表。章節與來源員課綱映射互相核對，不漏三冊19章小節。介電與駐波代表例已經來源公式與獨立數學雙核。

## 頁面骨架

完整 HTML5，UTF-8 無 BOM，lang=zh-Hant，viewport；title「章名｜圖解電磁學」。只載 lab.css 與 defer app.js。body data-page=slug。第一個可 focus 元素是 .skip-link 指向 #main-content。header.site-header 有品牌 index、glossary、sources；div.site-layout 內 aside.course-nav（靜態首頁/字典可保留）與 main#main-content。footer.pager 靜態前後頁依規格。不得連 Markdown 或遠端。共用程式會增強完整側欄；no-JS仍能依pager走完整課。

main 依序：.lesson-head（eyebrow、h1、具體問題lead、這章假設已懂的.prereq與前置連結）；section#understand（先解釋物理圖）；section#calculate（直接可見主例）；section#practice（近題）；section.lab#experiment[data-lab=兩位id]；模型/儀器/來源；pager。每頁以1800–2800漢字為參考，數學短橋可更長，不灌水，不用字數代替教學完整性。第一屏應能進入學習，勿做大型封面。

## 每頁內容驗收

必有具體問題、已知/未知、選式理由、推導或適用條件、全部符號/單位、直接可見的中間步驟、帶單位代入、數值近似使用≈、單位與極限/守恆檢查。近題改一個條件，有兩個分開的details提示及完整details詳解（列式、代入、單位、檢查）。每個新增的重要公式亦說明從哪來、何時用、量代表什麼；主例不能藏details。核心物理要對接電荷/電流/能量與工程量測，說清儀器量到什麼、不能證明什麼。

每頁至少一張作者編寫的靜態 inline SVG，圖真正說明幾何、方向、面/路徑或波，不能只畫方程卡。SVG role=img、title、desc、aria-labelledby，外部圖說可獨立讀。全部圖中文字至少15，圖在.diagram[tabindex=0]內可局部水平捲動。軸向、箭頭、量值、正負方向用文字與符號，不能只靠顏色；同一物理量箭頭比較須同尺度或明確標非比例。若用投影/通量/叉積，圖上幾何要可辨認。公式用.equation加HTML sub/sup，不用LaTeX殘留或外部數學引擎。

## 互動 DOM 契約

每頁一主widget，id固定：input#lab-input type=range，其label for=lab-input，範圍與預設照該列control；output#lab-value；button#lab-reset type=button；div#lab-results aria-live=polite；p#lab-why；svg#lab-plot viewBox="0 0 640 300" role=img，含唯一title/desc；p#lab-description。所有id每頁唯一。結果、why、圖說與圖在HTML初始即有預設值；沒有JS仍有完整代表例。互動放在完整主例/近題之後，操作即時更新，不提交、不計分。裝置範圍以外的值不代表模型有效。

作者初始互動SVG可以手繪含預設結果的機制示意（不必生成全曲線）；app.js以同一calculate函式輸出數字、即時why及動態圖。08動態圖同尺度畫E1/E2與切向/法向；24動態圖畫沿z≤0的電壓包絡/駐波並標最大最小；19畫偏振軌跡與時序點；其他頁畫控制量→觀察量曲線，軸帶單位，現在值有點與文字，不能只有decor。各狀態數字必與公式一致。

輸入type固定range、選項不適用；缺值/非有限值回default，超界夾限，按step量化，reset回主例。min/max須有限，22全反射及26截止不硬算實根，24短路VSWR顯∞文字。default預期誤差1e−4相對值；可視數值四捨五入與≈；03/04/05/06用k=8.9875517923e9，ε0=8.8541878128e−12 F/m，μ0=1.25663706212e−6 H/m，c=299792458 m/s，η0≈376.7303137Ω。取教學精度，不宣稱μ0精確。

## 代表頁08與24

08：n=+z由介質1進2，介面z=0，εr1=2、εr2=4、E1=3x̂+4ẑ V/m、ρsf=0。Et連續→E2x=3，Dn連續→2ε0×4=4ε0×E2z→E2z=2。D1=ε0(6x̂+8ẑ)、D2=ε0(12x̂+8ẑ)，D切向會跳。P1=ε0(3x̂+4ẑ)，P2=ε0(9x̂+6ẑ)，σb=(P1−P2)·n=−2ε0≈−17.708pC/m²；均勻內部ρb=0。相對法線角θ1=atan(3/4)=36.87°，θ2=atan(3/2)=56.31°。近題可改εr2=8→E2z=1。

24：負載z=0、線z≤0，e^(jωt)，向+z入射V+=3Vpeak，Z0=50Ω、RL=100Ω。Γ=1/3、V−=1Vpeak，VL=4Vpeak、IL=(3−1)/50=.04Apeak，反射電流I−=−.02A相對+z。平均P+=3²/(2×50)=.09W、P−=1²/(2×50)=.01W、PL=4×.04/2=.08W，守恆。電壓包絡最大4、最小2V，VSWR2。波式V(z)=3e^(−jβz)+1e^(+jβz)，I(z)=[3e^(−jβz)−1e^(+jβz)]/50。教Zin與Smith概念，不能只教Γ。近題RL=25Ω→Γ=−1/3、VL2V、IL.08A、PL.08W。

## 分工與限制

建置指揮只寫本目錄 brief/spec/章節規格/派工資料/派工計畫/建置進度/README 與 dist/index、glossary、sources、app.js、lab.css。每位作者唯一寫自己3–4章HTML，首波代表頁例外2章；禁止再生agent。來源線唯一外查，作者禁止上網、下載、GUI、git、依賴、共享wf、原筆記、既有站、nvim.log、prompt.md。驗收者獨立寫驗收證據。獨立lab.css家族（明確授權）可參考圖解電路學，不修改styles.css正本。

## 交付驗證

先node --check、逐頁契約/連結/編碼/無外部資源/LaTeX殘留；獨立線再做28頁所有主例近題與widget的預設/min/max/reset，1440/390/320版面及no-JS、零console error/遠端請求。首次測頁斷言title。未做真人實機項不宣稱通過；build收件證據與最終獨立驗收分開。

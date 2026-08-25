# BUILD-SPEC — 機器人數學基礎（互動課程）

本檔是建置契約。實作者（codex）必須嚴格照此建出可離線運作的互動課程。這是給「只記得三角函數、其餘理工基礎近乎零」的自學者的**機器人數學先修課**，把三角函數 → 座標 → 向量 → 矩陣 → 旋轉 → 座標變換 → 解方程式 → 導數／梯度 → 一點點機率，用**高中生能懂**的方式從頭教，並在每章結尾連到它服務的四門機器人課（運動學、路徑規劃、視覺、學習）。

## 讀者與語氣

- 只記得三角函數（sin/cos/tan、角度）。不預設線性代數、微積分、機率。
- 每個新概念先用**生活化或軟體工程師熟悉**的白話點出「在解決什麼問題」，再回到真實定義。比喻後一定收回到精確定義與限制。
- 繁體中文為主、UTF-8。台灣工程用語（矩陣、向量、內積、外積、變數、函式…）。

## 硬性技術契約（違反即失敗）

1. **純原生 HTML/CSS/JS，完全離線**。不得有圖片、外部字型、CDN、遠端 API、第三方腳本、分析碼。
2. **沿用已複製好的 `styles.css`（勿修改它）**；新內容一律用既有 class：`workspace`、`controls`、`label`、`output`、`grid`、`card`、`term-list`、`term-card`、`flow`、`prereq`、`note`、`warning`、`eyebrow`、`lead`、`pager`、`chapter-list`、`chapter-card`、`number`、`dictionary-tools`、`details/summary`、`table`。
3. **公式一律純文字 HTML，嚴禁任何 LaTeX**（不得出現 `\(` `\)` `\[` `\]` `$` `$$`，不得引入 MathJax／KaTeX；本站無數學渲染器）。用 Unicode（θ × · √ ≈ ≤ ≥ ≠ ° π Σ Δ → ± ⁻¹）與 `<sub>`／`<sup>`（例：a<sub>x</sub>、2<sup>32</sup>、√(x²+y²)）。
4. 每頁 UTF-8；桌面與手機（≤720px）皆不得橫向溢出或重疊（styles.css 已含 RWD，照結構用就好）。

## 頁面骨架（每個章節頁都照這個結構）

```html
<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NN 章名</title><link rel="stylesheet" href="styles.css"><script defer src="app.js"></script></head>
<body>
<a class="main-site-link" href="https://justty32.github.io/engineer_study/" aria-label="回到工程學習中央入口">← 回到工程學習主站</a>
<nav class="topbar" aria-label="主要導覽"><a href="index.html">課程地圖</a><a href="00-為什麼機器人需要數學.html">00 起點</a><a href="名詞與概念字典.html">字典</a></nav>
<main>
<p class="eyebrow">NN・一句定位</p>
<h1>章名：一句話說清楚這章要幹嘛</h1>
<p class="lead">2–3 句白話導言：這章解決什麼問題、學完能做什麼。</p>
<p class="prereq"><strong>這章假設已懂：</strong>列出前置（通常是前一章）。</p>

<!-- 若干 <h2> 解說段落：白話直覺 → 精確定義 → 具體數字實例 → 為什麼／易混 -->
<!-- 一個 <section class="workspace"> 互動實驗（見各章 widget 契約） -->
<!-- <h2>連到機器人課</h2>：這章數學在四門機器人課的哪一章用到 -->

<nav class="pager" aria-label="章節導覽"><a href="上一頁.html">← 上一頁：X</a><a href="下一頁.html">下一頁：Y →</a></nav>
</main></body></html>
```

workspace 互動區塊統一格式：

```html
<section class="workspace"><h2>自由實驗：實驗名</h2>
<p>一句話說明這個實驗在示範什麼、怎麼玩。</p>
<div class="controls">
  <label for="ID">控制名（單位）<input id="ID" type="range" min=".." max=".." step=".." value=".."></label>
  ...更多控制...
</div>
<div id="OUT-output" class="output" aria-live="polite"></div>
</section>
```

## app.js 契約（完全比照機器人運動學課的寫法）

- 檔首放 helper：`const $=x=>document.getElementById(x), on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};` 以及 `rad/deg/clamp/fmt` 等小工具、必要的向量/矩陣函式（dot、norm、cross、2×2 乘法與解 2×2 等，直接內嵌）。
- **每個互動一個守衛函式**：`function name(){if(!$('主控制id'))return; const draw=()=>{ ...讀值、算、寫 $('..-output').innerHTML... }; [控制ids].forEach(x=>on(x,'input',draw)); draw();}`。控制值一改，output 立即更新，且回饋要說明「**為什麼**」，不只給數字。
- 字典頁搜尋函式 `dictionary()` 同運動學課：讀 `#term-search`，過濾 `.term-card`，更新 `#term-count`。
- 檔尾一次註冊：`[fn1,fn2,...,dictionary].forEach(f=>f());`。
- 檔尾可加 `if(typeof module!=="undefined")module.exports={...};` 供 `node --check`／測試。

---

## 章節與互動契約（逐章）

> 每章都要「白話直覺 → 精確定義（含符號/單位/假設）→ 一組具體數字實例 → 為什麼/易混清單 → 連到哪門機器人課」。以下列出檔名、學習目標、必談要點、互動 widget 的精確 DOM 與公式。

### index.html（課程地圖）
- topbar 標 `課程地圖` 為 current。h1「機器人數學基礎」，lead 說明這是機器人四門課的數學先修、從三角函數開始。
- `section.chapter-list` 內用 `a.chapter-card`（每張 `<h2><span class="number">NN</span> 章名</h2><p>一句白話</p>`）依序連到 00–12 與字典。
- 一段 `flow`：三角函數 → 向量 → 矩陣 → 旋轉 → 變換 → 微積分/機率。

### 00-為什麼機器人需要數學.html
- 目標：建立動機與學習地圖；消除「數學很可怕」的恐懼，說明只需從三角函數蓋起。
- 要點：機器人要回答「手臂末端在哪(座標/向量)」「怎麼轉(旋轉/矩陣)」「怎麼從A到B(變換/方程式)」「怎麼變好(導數/梯度)」「感測不準怎麼辦(機率)」。每個對應本課哪章、對應哪門機器人課。
- **Widget `taskmath`**：`<select id="task-pick">` 選項 value=`pose|rotate|path|see|learn`；`<div id="taskmath-output">`。draw：依選擇顯示「這個任務需要的數學＝本課第N章」與「對應機器人課的哪一章」。純文字對照，不需計算。

### 01-三角函數複習.html（角度、弧度、單位圓）
- 目標：把 sin/cos/tan 從「查表」升級成「單位圓上的座標」；角度↔弧度。
- 要點：弧度＝弧長/半徑；1 圈＝360°＝2π rad；單位圓上角度 θ 的點就是 (cosθ, sinθ)；cos²θ+sin²θ=1（畢氏）；tanθ=sinθ/cosθ 的意義與 cosθ=0 的未定義。
- **Widget `trig`**（可沿用運動學 angleBasics 概念）：control `angle-deg`（range −180..180 step 1 value 30）。out `trig-output`。公式：a=deg×π/180；顯示 `θ=..° = ..rad`、`(cosθ, sinθ)=(..,..)`、`cos²+sin²=..（≈1，代表旋轉不改變長度）`、`tanθ=..（cosθ≈0 時標示未定義）`。
- 連到：這是二維旋轉(第05章)與所有姿態的根。

### 02-座標與距離.html（在平面上定位一個點）
- 目標：座標系、象限、原點距離、方向角 atan2。
- 要點：(x,y) 的意義；距離 d=√(x²+y²)；方向 θ=atan2(y,x)（為何用 atan2 而非 atan：能分辨象限）；座標是「相對某個原點與軸」。
- **Widget `point`**：controls `pt-x`(range −5..5 step .5 value 3)、`pt-y`(range −5..5 step .5 value 4)。out `point-output`。公式：d=Math.hypot(x,y)；ang=deg(atan2(y,x))；顯示象限、d（實例 3,4→5）、方向角。說明「距離用畢氏、方向用 atan2」。
- 連到：末端位置、路徑上的點、影像像素座標。

### 03-向量.html（把位移變成可運算的物件）
- 目標：向量＝有方向有長度的量；長度、單位向量、方向角；向量相加＝把位移接起來；純量縮放。
- 要點：向量 v=(vx,vy)；|v|=√(vx²+vy²)；單位向量 v/|v|（方向不變、長度 1，|v|=0 不能除）；a+b＝分量相加（首尾相接）；k·v＝縮放（k<0 反向）。
- **Widget `vector`**：controls `ax`(−5..5,.5,3)、`ay`(−5..5,.5,1)、`bx`(−5..5,.5,-1)、`by`(−5..5,.5,2)、`k`(−2..2,.5,1)。out `vector-output`。顯示：|a|、a 的單位向量、a+b、k·a；並解釋幾何意義。
- 連到：位移、速度、力、影像特徵位移。

### 04-矩陣乘向量.html（一張表如何搬動一個點）
- 目標：矩陣是「線性搬動規則」；2×2 矩陣 × 向量的算法；單位、縮放、推移(shear)矩陣的效果。
- 要點：[[a,b],[c,d]]·(x,y)=(a x+b y, c x+d y)；逐列做內積；單位矩陣不動、對角>1 放大、剪切改變形狀但直線仍是直線（線性）。
- **Widget `matvec`**：controls `m-a`(-2..2,.5,1)、`m-b`(-2..2,.5,0)、`m-c`(-2..2,.5,0)、`m-d`(-2..2,.5,1)、`v-x`(-5..5,.5,2)、`v-y`(-5..5,.5,1)。out `matvec-output`。公式如上；顯示結果向量，並在 a=d=1,b=c=0 時說「這是單位矩陣，點沒動」等即時判讀。
- 連到：旋轉矩陣、齊次變換、影像座標轉換都是這個運算。

### 05-二維旋轉矩陣.html（從三角函數長出來）
- 目標：把「轉一個角度」寫成矩陣 R(θ)=[[cosθ,−sinθ],[sinθ,cosθ]]；旋轉保長度。
- 要點：推導直覺（基底向量 (1,0)→(cosθ,sinθ)、(0,1)→(−sinθ,cosθ)）；套到點 (x,y)→(x cosθ−y sinθ, x sinθ+y cosθ)；|R v|=|v|（旋轉不改長度，呼應 cos²+sin²=1）；θ 與 −θ 反向。
- **Widget `rot2d`**：controls `rot-angle`(−180..180,1,30)、`rot-x`(−5..5,.5,2)、`rot-y`(−5..5,.5,0)。out `rot2d-output`。公式如上；顯示轉後座標、轉前後長度（應相同）。實例 (2,0) 轉 90°→(0,2)。
- 連到：運動學二維旋轉、視覺影像旋轉、路徑方向。

### 06-內積.html（投影、夾角與垂直）
- 目標：內積(dot product)＝a·b＝ax bx+ay by；幾何＝|a||b|cosφ；用途：夾角、投影長、垂直判斷。
- 要點：φ=acos( a·b/(|a||b|) )；投影長＝a·b/|b|；a·b>0 同向、=0 垂直、<0 反向；|a||b|=0 時夾角未定義。
- **Widget `dot`**：controls `dax`(-5..5,.5,3)、`day`(-5..5,.5,0)、`dbx`(-5..5,.5,1)、`dby`(-5..5,.5,1)。out `dot-output`。顯示 a·b、夾角°、a 在 b 上投影長、以及「>0/=0/<0」的判讀。
- 連到：視覺姿態夾角、路徑轉角、相似度；學習中的相似度/梯度方向。

### 07-外積.html（法線、旋轉軸與面積，3D）
- 目標：外積(cross product)只在 3D；a×b 垂直於 a、b；|a×b|=平行四邊形面積=|a||b|sinφ；方向給旋轉軸/法線（右手定則）。
- 要點：a×b=(ay bz−az by, az bx−ax bz, ax by−ay bx)；與內積對比（內積給數、外積給向量）；平行時外積=0。
- **Widget `cross`**：controls `cax`(-3..3,.5,1)、`cay`(-3..3,.5,0)、`caz`(-3..3,.5,0)、`cbx`(-3..3,.5,0)、`cby`(-3..3,.5,1)、`cbz`(-3..3,.5,0)。out `cross-output`。顯示 a×b 向量、其長度(=面積)、並驗證與 a、b 皆垂直(內積≈0)。實例 x×y=z。
- 連到：運動學雅可比(軸×臂)、視覺法線、姿態。

### 08-合成變換.html（先轉再移 vs 先移再轉）
- 目標：平移＋旋轉合成，順序會改變結果；用 2D 齊次矩陣把兩者裝一起。
- 要點：齊次點 (x,y,1)；平移 T、旋轉 R 為 3×3；`旋轉後平移` 與 `平移後旋轉` 給不同終點；矩陣相乘不可交換（一般情形）。
- **Widget `compose`**：controls `cmp-angle`(−180..180,1,90)、`cmp-tx`(−5..5,.5,2)、`cmp-ty`(−5..5,.5,0)、`cmp-px`(−5..5,.5,1)、`cmp-py`(−5..5,.5,0)。out `compose-output`。計算兩種順序作用在點 (px,py) 的結果並並列，指出差異。
- 連到：運動學齊次變換與座標鏈、視覺相機外參、路徑座標轉換。

### 09-三維旋轉與座標鏈.html（繞 x/y/z 與不可交換）
- 目標：3D 繞單軸旋轉矩陣；三維旋轉一般不可交換；座標鏈＝連乘。
- 要點：Rx、Ry、Rz 的矩陣；同一點先 Rz 後 Ry ≠ 先 Ry 後 Rz；把多個座標系用連乘串起來。
- **Widget `rot3d`**：controls `r3-axis1`(select x/y/z)、`r3-a1`(−180..180,1,90)、`r3-axis2`(select x/y/z)、`r3-a2`(−180..180,1,90)、`r3-px`(-2..2,.5,1)、`r3-py`(-2..2,.5,0)、`r3-pz`(-2..2,.5,0)。out `rot3d-output`。計算「先軸1後軸2」與「先軸2後軸1」作用結果並比較，示範不可交換。
- 連到：運動學三維姿態、視覺相機朝向。

### 10-解方程式與逆.html（唯一解／無解／無限多解）
- 目標：解 2×2 線性方程組；行列式 det；det=0 代表奇異（無唯一解）；連到逆運動學「不可達/多解/奇異」。
- 要點：[[a,b],[c,d]](x,y)=(e,f)；det=ad−bc；det≠0 唯一解 (克拉瑪或消去)；det=0 時可能無解或無限多解；幾何＝兩直線相交/平行/重合。
- **Widget `solve2`**：controls `s-a`(-3..3,.5,1)、`s-b`(-3..3,.5,1)、`s-c`(-3..3,.5,1)、`s-d`(-3..3,.5,-1)、`s-e`(-5..5,.5,2)、`s-f`(-5..5,.5,0)。out `solve2-output`。算 det；det≠0 給解；det≈0 報「奇異：兩直線平行或重合，無唯一解」。
- 連到：逆運動學（第09/02章的不可達與多解）、最小平方。

### 11-變化率導數與梯度.html（往哪走會變好）
- 目標：斜率/導數＝「輸入動一點，輸出變多少」；用小 Δ 數值估斜率；多變數的梯度指向「上升最快」方向。
- 要點：f'(x)≈(f(x+h)−f(x−h))/(2h)；示範 x² 在 x 的斜率≈2x、sin 在 x 的斜率≈cos x；二變數 f(x,y)=x²+y² 的梯度=(2x,2y)，指向遠離原點；最佳化是沿 −梯度走。
- **Widget `deriv`**：controls `fn-pick`(select `sq`=x²、`sin`=sin x)、`fn-x`(−3..3,.1,1)。out `deriv-output`。用 h=1e-3 中央差估斜率，與解析值比對；再給 f=x²+y² 在 (fn-x, 1) 的梯度方向與 −梯度（下降）方向的白話說明。
- 連到：運動學雅可比（多變數斜率）、學習的梯度下降、路徑平滑。

### 12-機率一點點.html（不確定、期望值與雜訊）
- 目標：機率＝相信程度/長跑比例；期望值＝加權平均；多次平均使雜訊以 1/√N 縮小；連到感測不準與學習。
- 要點：擲公正骰子期望值=3.5；感測器讀值＝真值＋雜訊；平均 N 次，隨機誤差標準差×1/√N，但系統偏差不會消。
- **Widget `noise`**：controls `noise-true`(0..10,.5,5)、`noise-sigma`(0..2,.1,1)（單次標準差）、`noise-N`(range 1..100 step 1 value 10)。out `noise-output`。**不可用亂數**（本站環境禁用 Math.random，會破壞可重現）；改用**確定式公式**：顯示 `平均值的標準不確定度 = σ/√N`（實例 σ=1,N=10→≈0.316），並說明增大 N 只縮小隨機部分、不消除系統偏差。可加一個 `noise-bias`(0..2,.1,.3) 說明偏差不隨 N 變。
- 連到：視覺協方差/感測融合、學習的期望回報與探索。

### 名詞與概念字典.html
- 頂部 `div.dictionary-tools` 內 `<input id="term-search" type="search" placeholder="搜尋名詞或概念">` 與 `<span id="term-count"></span>`。
- `div.term-list` 內每個 `article.term-card`：名詞給「白話／定義／符號與單位／易混」；概念給「角色／算法或公式／為什麼有用／連到哪門課」。至少涵蓋：弧度、單位圓、座標系、象限、atan2、向量、長度(範數)、單位向量、矩陣、單位矩陣、內積、外積、旋轉矩陣、齊次座標、變換合成、行列式、奇異、線性方程組、導數、梯度、期望值、標準差、1/√N。
- 每個 term-card 可加 `data-search="中英關鍵字"` 幫助搜尋。

## 驗收（實作者自檢，收尾用中文列出）

- `node --check app.js` 通過；每個 widget 的控制 id 與 output id 都與本 spec 一致且存在於對應頁。
- grep 確認全資料夾無 `\(`/`\)`/`\[`/`\]`/`$`、無 MathJax/KaTeX、無任何 http(s) 外部資產（僅允許回主站連結）。
- 所有頁 topbar/pager 連結正確、無孤兒頁；index 章卡涵蓋 00–12＋字典。
- 每頁列出「連到哪門機器人課」。

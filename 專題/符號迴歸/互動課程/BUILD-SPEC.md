# BUILD-SPEC — 符號迴歸實驗室

← [立案](PROJECT-BRIEF.md)｜[品質關卡](../../../wf/workflows/interactive-study-site/QUALITY-GATES.md)

## 檔案與介面

獨立作者維護 `index.html`、`00-start.html`、`01-search.html`、`02-validation.html`、`app.js`、`styles.css`。四頁共用 header、橫向手機章節列、主站連結與 pager；教學完整說明在工作台前，延伸說明可摺疊。各頁初始化先檢查對應圖表 DOM 是否存在，避免跨頁空元素例外。資料與狀態不持久化，重載與重設可重現。

## 共用數值規則

真值 f(x)=x²+x+1。擾動序列固定為 `[.4,-.8,.6,-.2,1,-.7,.3,-1,.5,.8,-.4,.2,-.9,.7,-.1,.9,-.5]`，觀測 y=f(x)+幅度×序列；幅度為最大偏移尺度，不是標準差。前四實驗的量無單位；第五量綱實驗另有明示物理單位。MSE=Σ(預測−觀測)²/N。顯示小於 10⁻¹² 的數為 0；計算保留 double 原值。極大／極小數用科學記號。

`leastSquares(data,bases)` 以 Householder QR 對設計矩陣與 y 做相同反射，再回代，無 ridge 正則化。輸入皆保證完整列秩；若 QR 主軸 norm <10⁻¹³，明確拋錯。每個候選含係數、可執行 fn、未化簡節點數、訓練 MSE、示範分數與前緣旗標。

## 00 調係數

| id | type | 範圍／步進 | 預設 | 計算／判準 | 數值實例 |
|---|---|---|---|---|---|
| coef-a | range | −2..3 / .1 | 0 | 二次項 a | a=1,b=c=1,noise=0 → MSE=0 |
| coef-b | range | −2..3 / .1 | 1 | 一次項 b | a=0,b=c=1 → MSE=.3072916667 |
| coef-c | range | −2..3 / .1 | 1 | 常數 c | a=b=c=0 → MSE=2.5572916667 |
| fit-noise | range | 0..0.6 / .1 | 0 | y=f(x)+幅度×固定序列 | a=b=c=1,noise=.2 → MSE=.0179111111 |
| fit-target | button | 不適用 | 可按 | a=b=c=1，保留 noise | noise=0 → 9 點全吻合 |
| fit-reset | button | 不適用 | 可按 | [a,b,c,noise]=[0,1,1,0] | 逐點表重建 9 列 |

訓練 x 共 9 點，含端點 −1 與 1，間隔 .25。公式 ax²+bx+c。輸出 `fit-equation/fit-error/fit-why/fit-data`、SVG `fit-chart`；逐點表可獨立核對平方誤差。圖 x=[−1,1], y=[−2,6]。正常吻合、係數太大／太小、擾動造成失配都有即時 why。單頁重設不改其他頁。

## 01 有限搜尋

此段同質契約已抽到 [data/01-widgets.json](data/01-widgets.json)（9 列）。

欄位：

- id：元件唯一識別。
- type：控制型態。
- 範圍／步進：允許輸入與步進／單位。
- 預設：重設後的代表狀態。
- 計算／判準：狀態方程與判定條件。
- 數值實例：可重算的輸入與預期輸出。


17 點 x∈[−2,2]，等距含端點。每個非空基底子集合用 QR 調係數；k 項的加法成本 k−1。排序按分數，再按節點數處理 10⁻¹² 內的分數差。前緣：不存在節點不更多且誤差不更高（誤差容差10⁻¹²）、其中一項嚴格較佳的其他候選。基底全關是正常可恢復的空狀態，圖明示青線僅零值參考。

預設排名第一 y≈1+x+x²，11節點，訓練MSE≈0、score=.11。缺少原始規律基底時回饋搜尋空間限制；λ 增大說明成本取捨；擾動增大說明可能追逐擾動。輸出 `winner-formula/candidate-count/winner-error/search-why/candidates/search-selection`。圖 x=[−2,2], y=[−3,9]。

## 02 保留驗證與外插

| id | type | 範圍／步進 | 預設 | 計算／判準 | 數值實例 |
|---|---|---|---|---|---|
| degree | range | 0..8 / 1 | 2 | 基底 x⁰..xᵈ、QR擬合 | d=2、noise=0 → 三組MSE≈0 |
| validation-noise | range | 0..0.6 / .1 | .2 | 只改訓練觀測 | d=8、noise=.2 → 外插MSE≈8008384.224429 |
| test-end | range | 1..2 / .1 | 2 | 只改圖的 x 最大值 | 1與2的三組指標逐字相同 |
| validation-reset | button | 不適用 | 可按 | [d,noise,end]=[2,.2,2] | 擬合係數回預設 |
| data-case=clean | button | 不適用 | 可按 | [2,0,2] | 三組均顯示0 |
| data-case=overfit | button | 不適用 | 可按 | [8,.2,2] | 訓練0、驗證.2353722147 |
| data-case=underfit | button | 不適用 | 可按 | [1,.2,2] | 訓練非0、指出曲率限制 |
| download-data | button | 不適用 | 可按 | Blob CSV，無上傳 | 表頭+89列，三split共9/40/40 |

三組固定資料：train x=−1+i/4（i=0..8，帶擾動）；validation x=−1+(i+.5)/20（i=0..39）；extrapolation x=1+(i+1)/40（i=0..39）。後兩組 y 為無擾動真值，與訓練完全無重疊。三組分開算 MSE；視窗與裁切不改計分。圖 y=[−1,8]；若241個繪圖取樣有值超出，caption 明示裁切。線色與虛線、點型另有文字對照。

輸出 `train-error/validation-error/extrapolation-error/validation-why/validation-formula`，CSV 欄 `split,x,y,prediction,squared_error`，檔名帶 degree 與 noise。使用者改變次數、擾動或圖範圍會即時更新；無分數與答對解鎖。

## 03 取捨前緣

固定沿用第二章17乾淨點、前三基底與七候選，按mask1..7標A..G。`weightInterval`對每個候選解所有 `Eᵢ+λNᵢ≤Eⱼ+λNⱼ` 的半直線交集，λ≥0，不用抽樣掃描替代證明。區間含可平手端點；實際選擇時同分取較短者。

| id | type | 範圍／步進 | 預設 | 計算／判準 | 數值實例 |
|---|---|---|---|---|---|
| pareto-lambda | range | 0..0.6 / .005 | .3 | 最小化MSE+λ×節點 | .1→G、.25→F、.35→C、.4→A |
| pareto-budget | range | 1..11 / 1 | 7 | 節點≤上限，再最小化MSE | 1→A、5→C、7→E、9→F、11→G |
| pareto-select | select | mask1..7，依序A..G | 5(E) | 檢視支配與可行λ區間 | E在前緣、λ區間空 |
| pareto-pick-weight | button | 依檢視式 | E時停用 | 有界區間取中點；無上限取下限+.1 | C→λ約.355，實際選C |
| pareto-data按鈕 | button | A..G | E高亮 | 同步select與圖橘環 | D被C支配 |
| pareto-reset | button | 不適用 | 可按 | [.3,7,5] | 加權選F、預算選E |

精確MSE A..G依序105/32、257/32、57/32、167/86、3/2、19/43、0；節點1、3、5、5、7、9、11。前緣A/C/E/F/G。λ區間：G=[0,19/86]，F=[19/86,1843/5504]，C=[1843/5504,3/8]，A=[3/8,∞)；B/D/E無。E對C要求λ≤9/64=.140625，對F要求λ≥91/172≈.5290697674，故無交集。輸出三指標、why、完整表與SVG；所有點代表公式。圖軸x=[0,12]、y=[−.4,9]，同分線經當前加權勝出式，虛直線標預算。

## 04 量綱原理頁

獨立`units.js`。輸入使用一致SI單位，僅一維純量與固定a；量綱向量[L,T]。相乘指數相加、相除相減、平方乘二；加減先要求相同向量。每個子節點先求值，父節點再求；維度錯誤與數值定義域錯誤分開傳遞，禁止用數字0遮掉無定義除法。

此段同質契約已抽到 [data/04-widgets.json](data/04-widgets.json)（11 列）。

欄位：

- id：元件唯一識別。
- type：控制型態。
- 範圍／步進：允許輸入與步進／單位。
- 預設：重設後的代表狀態。
- 計算／判準：狀態方程與判定條件。
- 數值實例：可重算的輸入與預期輸出。


組成`k×(A op Bⁿ)`。葉v/a/t維度[1,−1]/[1,−2]/[0,1]；常數1、0.5、k無量綱。vt與at展開乘法；half_at2展開0.5×(a×t²)。物理目標分別v₀t+.5at²、v₀+at、a。模型與候選維度不同或數值無定義時，不算差值；維度一致卻數值不同時明示量綱不足以保證正確。

四案例按欄位[target,v₀,a,t,k,left,op,right,power]：motion=[distance,3,2,2,1,vt,add,half_at2,1]；bad-add=[distance,3,2,2,1,v,add,t,1]；double=[distance,3,0,2,2,v,multiply,t,1]；zero=[acceleration,3,2,0,1,v,divide,t,1]。對應10m吻合／加減量綱失敗／12m且差6m／量綱吻合但除以零。負向極端v₀=−5,a=−4,t=5→位移−75m。

輸出`units-expression/status/reference/why/prediction/difference/trace`。SVG`units-tree`顯示左支、右支與輸出，逐節點表完整列維度、單位與值；只靠量綱不能區分同維度不同種類，正文明記。量測用尺／位置感測器與計時器，本頁不假裝實機驗證。

## 驗收與重現

對照品質關卡做語法、ID、UTF-8、資源與相對連結檢查。數值 QA 另以 Python Lagrange 插值獨立重算八次式，避免只重跑同一 QR。Chrome CDP 驗1440×900／390×844、鍵盤箭頭、重設、空候選、正弦恢復、候選檢視、三個案例、固定驗證指標及CSV。樣式是獨立短課自訂家族；A 家族同步工具仍須 --check 無漂移。具體結果與證據路徑見驗收紀錄。

持久化獨立重算：`python3 tools/verify_math.py`（在課程目錄執行），以Fraction法方程／支配不等式與Lagrange插值核對，無外部套件。

量綱數值與失敗條件重現：`node tools/verify_units.cjs`，9個手算數值＋4個量綱／定義域條件，無新增依賴。

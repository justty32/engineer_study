# 計算機輔助工程：有限元素與 CFD 概論（CAE: FEM & CFD）

> 名詞對照見 ../中英名詞對照表.md

前面幾科建立了連續力學與熱流的「理論」：材料力學給你應力應變與彈性方程、流體力學給你 Navier–Stokes、傳熱學給你 Fourier 與對流。但這些控制方程是**偏微分方程（PDE）**，只有極少數理想幾何（平板、圓管、薄壁圓筒）能用紙筆解出封閉解。真實工程零件——引擎缸體、渦輪葉片、車身鈑金、散熱片、汽缸內的紊流——幾何複雜、邊界條件雜亂，沒有手算解。**計算機輔助工程（CAE）就是把這些 PDE「離散化」成電腦能解的大型線性代數方程組，求出整個場（位移場、應力場、溫度場、速度場）的數值近似解。** 本科是碩士進階主題的橋樑，重點不在推導，而在建立「FEM 與 CFD 在做什麼、流程怎麼走、能算什麼、哪裡會騙人」的工程直覺。對軟體背景者，可把它想成：CAE＝把連續的物理問題編譯成一個巨大的稀疏線性系統，再交給數值解算器跑。

## 0. 本科在本系的定位

- **是前面所有力學與熱流科目的「數值出口」**：[材料力學](../02-固體力學/04-材料力學.md) 的應力分析、[流體力學](../03-熱流科學/07-流體力學.md) 的流場、[傳熱學](../03-熱流科學/08-傳熱學.md) 的溫度場，當幾何一複雜，手算就投降，全部交給 CAE。CAE 不創造新物理，它只是用數值方法去解你已經學過的那些方程。
- **建立在 [數值方法與計算](16-數值方法與計算.md) 之上**：離散化、稀疏矩陣、迭代求解器、收斂與誤差分析，都是上一科的應用。FEM／CFD 本質上就是「把 PDE 變成一大堆代數方程，再用數值線代去解」。
- **核心心法（四步驟，全科都是這條主線的展開）**：
  1. **建模（Modeling）**：定幾何、定材料性質、定要解什麼物理（靜力？模態？流場？熱？），把問題抽象成一組 PDE 與邊界條件。最容易被忽略卻最決定成敗的一步——簡化是否合理、邊界條件是否真實。
  2. **網格（Meshing / Discretization）**：把連續區域切成有限多個小塊（元素／控制體積）。網格的好壞直接決定精度與能不能收斂。
  3. **求解（Solve）**：組裝並求解大型線性（或非線性、時變）方程組 $[K]\{u\}=\{F\}$（FEM）或離散化的守恆方程（CFD）。
  4. **驗證（Verify & Validate）**：算出來不等於算對。要做網格收斂、檢查殘差、與解析解／實驗比對。**「漂亮的彩色雲圖」最會騙人**——這一步是工程師與按鈕操作員的分水嶺。

---

## 1. CAE 總覽與工作流程

不論 FEM 或 CFD，商用流程都分三段：

- **前處理（pre-processing）**：匯入或建立幾何（常自 CAD）、清理與簡化幾何（去除小圓角、螺紋、不重要的特徵以省網格）、產生網格、指定材料性質、設定邊界條件與負載、選分析類型。**約八成的工時與八成的錯誤都在這裡。**
- **求解（solver）**：軟體組裝方程、呼叫線性／非線性解算器迭代到收斂。對使用者多半是「按下執行、看殘差曲線下降」。CPU／記憶體吃緊與否取決於自由度數與求解器（直接法 vs. 迭代法）。
- **後處理（post-processing）**：把數值結果視覺化——位移、von Mises 應力雲圖、流線、壓力場、溫度場；擷取關鍵量（最大應力、升阻力、壓降、流量）。

常見商用工具：結構／多物理用 **ANSYS Mechanical**、**Abaqus**、**COMSOL**；CFD 用 **ANSYS Fluent**、**STAR-CCM+**、開源 **OpenFOAM**。本科不教軟體操作，只談共通觀念。

---

## 2. 有限元素法（FEM）：基本觀念

### 2.1 核心思想：分而治之
把一個複雜形狀的連續體切成許多簡單的小塊——**元素（element）**，元素的角點（與邊上的點）叫**節點（node）**。在每個元素內，用簡單的多項式去近似未知場（如位移）。整體解＝把所有元素的局部解「拼起來」。複雜幾何因此被化約成許多形狀規則的小問題之和。

### 2.2 形狀函數（shape functions）
在元素內，場變數用節點值的內插表示：
$$u(x) \approx \sum_{i=1}^{n} N_i(x)\, u_i$$
其中 $u_i$ 是節點 $i$ 的未知值（要解的量），$N_i(x)$ 是**形狀函數**（又稱基底函數／內插函數）。形狀函數的關鍵性質：在自己的節點上值為 1、在其他節點上為 0（$N_i$ 在節點 $j$ 為 $\delta_{ij}$）。最簡單的線性元素用一次多項式，二次元素（邊中加節點）用二次多項式、能更貼近曲面與彎曲應力。**未知數從「連續函數」變成「有限個節點值」，這正是「有限」元素的由來。**

### 2.3 從 PDE 到 $[K]\{u\}=\{F\}$：加權殘值與變分
怎麼把 PDE 變成代數方程？兩條等價的主路：

- **加權殘值法（weighted residual method）／Galerkin 法**：把近似解代回 PDE 不會剛好為零，剩下的叫**殘值（residual）**。要求殘值對一組「加權函數」的積分為零。**Galerkin 法**選加權函數＝形狀函數本身，這是最常用也最穩健的做法。積分（弱形式）後降低了對解的可微性要求，並自然帶出邊界條件。
- **變分法（variational / 能量法）**：對結構問題，真實位移使系統的**總位能（total potential energy）最小**。把近似位移代入能量泛函再對節點值取極值，會得到同一組方程。物理直覺更清楚：FEM 在找「能量最低」的那組節點位移。

兩條路最後都導出元素層級的方程，組裝後成為全域系統：
$$[K]\{u\} = \{F\}$$
- $[K]$：**整體勁度矩陣（global stiffness matrix）**，描述結構「多硬」——每單位位移要多少力。對稱、稀疏（每個節點只跟相鄰元素耦合）。
- $\{u\}$：節點未知向量（位移）。
- $\{F\}$：節點等效負載向量。

這個方程是 FEM 的心臟。物理上就是把「彈簧」$F=ku$ 推廣到成千上萬個自由度的矩陣版本。

### 2.4 勁度矩陣組裝（assembly）概念
流程是「**局部算、整體拼**」：
1. 對每個元素，用形狀函數與材料性質算出該元素的**元素勁度矩陣** $[k]_e$（小矩陣，例如平面三角形元素 $6\times 6$）。
2. 元素的局部自由度對應到全域自由度的編號。
3. 把每個 $[k]_e$ 的元素「加進」全域 $[K]$ 對應的列與行——共享同一節點的元素，其貢獻在該節點的位置**相加**。
這就是 1950 年代波音 Turner 等人提出的**直接勁度法（direct stiffness method）**。組裝後的 $[K]$ 又大又稀疏（大部分元素為零），所以求解器專門針對稀疏結構最佳化。

### 2.5 邊界條件（boundary conditions）
原始的 $[K]$ 是**奇異（singular）**的——還沒固定的結構可以自由飄移（剛體運動），方程無唯一解。必須施加邊界條件才能求解：
- **位移邊界（Dirichlet，本質邊界）**：指定某些節點的位移（如固定支承 $u=0$）。施加後消除剛體運動，$[K]$ 變可逆。
- **負載邊界（Neumann，自然邊界）**：施加力、壓力、力矩，進入 $\{F\}$。
解出 $\{u\}=[K]^{-1}\{F\}$（實際上不真的求逆，而用 Cholesky／LU 分解或迭代法）後，再用元素內的位移梯度回算**應變與應力**（後處理）。

---

## 3. FEM 的主要分析類型與應用

| 分析類型 | 解什麼 | 方程形態 | 典型用途 |
| --- | --- | --- | --- |
| 線性靜力（static） | 穩態位移與應力 | $[K]\{u\}=\{F\}$ | 零件強度、安全係數、剛度 |
| 模態（modal） | 自然頻率與振型 | 廣義特徵值 $[K]\{\phi\}=\omega^2[M]\{\phi\}$ | 避開共振、振動設計 |
| 熱傳導（thermal） | 溫度場 | $[K_t]\{T\}=\{Q\}$（形式相同） | 散熱、熱分佈 |
| 熱應力（thermal stress） | 溫差造成的應力 | 先解 $T$，再當預載入解結構 | 引擎、電子封裝、焊接 |
| 暫態／非線性 | 隨時間或大變形 | 含 $[M],[C]$ 與迭代 | 衝擊、塑性、接觸 |

- **靜力分析**最常見：給負載與約束，看零件會不會壞、變形多大、安全係數夠不夠。輸出多看 **von Mises 應力**（與 [材料力學](../02-固體力學/04-材料力學.md) 的降伏準則對應）。
- **模態分析**求**特徵值問題** $[K]\{\phi\}=\omega^2[M]\{\phi\}$，得自然頻率 $\omega$ 與振型 $\{\phi\}$，用來避免外力頻率撞上共振（與 [機械振動](../05-動態系統與控制/) 直接呼應）。注意模態分析不需要負載，只看結構本身的質量與剛度。
- **熱應力分析**是典型的**順序耦合（sequentially coupled）**：先做熱傳導分析得溫度場 $T$，再把 $T$ 當成「預定義溫度場」載入同一個網格做結構分析，算出熱膨脹被約束而產生的應力。引擎缸體、PCB 與晶片封裝、焊點疲勞都靠這套。
- **同一套數學解多種物理**：注意傳導的 $[K_t]\{T\}=\{Q\}$ 與結構 $[K]\{u\}=\{F\}$ 形式完全相同——FEM 是通用框架，換物理只是換係數與自由度的意義，這也是 COMSOL 這類「多物理」軟體的基礎。

---

## 4. 網格收斂與品質（FEM 最關鍵的工程判斷）

### 4.1 為什麼要做網格收斂
網格越細、自由度越多，理論上越接近真解，但計算量暴增。**網格收斂研究（mesh convergence study）**：用一連串越來越細的網格各跑一次，追蹤關鍵量（如最大應力）。當再加密一倍、結果只變化幾個百分點以內，就視為**收斂**——這時的網格才可信。**沒做收斂研究的 FEM 結果是不可信的**：太粗的網格會嚴重低估應力。

加密的兩種策略：
- **h 加密（h-refinement）**：把元素變小（元素數變多）。最直觀常用。
- **p 加密（p-refinement）**：保持元素數，提高形狀函數的多項式階數（線性→二次）。

### 4.2 網格品質
- **長寬比（aspect ratio）**：元素不能太細長扁平，否則數值誤差大、可能不收斂。理想接近正三角形／正方形／正立方。
- **歪斜（skewness）、雅可比（Jacobian）、彎曲**：衡量元素是否變形過度。劣質元素會讓矩陣病態、解算器卡住或給出垃圾結果。
- **梯度大的地方要加密**：應力集中（圓角、孔洞、缺口）、邊界層附近自動或手動局部細化。

### 4.3 應力奇異點（stress singularity）——最常見的陷阱
在**尖銳內角、點負載、理想化的完全固定約束**處，理論應力會趨向**無限大**。表現是：**網格越加密，該點峰值應力越爬越高、永遠不收斂**。這不是真實物理（真實零件有圓角、約束有面積），而是幾何理想化造成的數學瑕疵。判別法：
- 若是**真實的應力集中**（如圓角、孔），加密後峰值會**穩定到一個有限值**——可信。
- 若加密後峰值**持續發散**，那是**奇異點**——該處的數字無意義，要嘛加上真實圓角、要嘛改用合理的約束面、要嘛忽略該局部峰值。

### 4.4 其他常見誤用
- 把所有約束設成「完全固定」，造成虛假的高應力與過硬的結構。
- 用線性元素卻網格太粗（線性元素描述彎曲應力很差），低估應力。
- 單位不一致（最惡名昭彰的隱形錯誤）。
- 忘了做收斂、直接相信第一次跑出的雲圖。

---

## 5. 計算流體力學（CFD）：統御方程

CFD 解的是流體的**守恆方程**（與 [流體力學](../03-熱流科學/07-流體力學.md) 完全同源，只是改用數值解）：

- **連續方程（質量守恆）**：$\dfrac{\partial \rho}{\partial t} + \nabla\!\cdot(\rho \mathbf{u}) = 0$
- **動量方程（Navier–Stokes）**：
$$\rho\!\left(\frac{\partial \mathbf{u}}{\partial t} + \mathbf{u}\!\cdot\!\nabla \mathbf{u}\right) = -\nabla p + \mu \nabla^2 \mathbf{u} + \rho \mathbf{g}$$
- **能量方程**（若涉及傳熱／可壓縮）：溫度／能量的對流—擴散平衡，把 [傳熱學](../03-熱流科學/08-傳熱學.md) 的對流項納入。

困難所在：動量方程裡的對流項 $\mathbf{u}\!\cdot\!\nabla\mathbf{u}$ **非線性**，且壓力與速度耦合（不可壓縮流沒有獨立的壓力方程），所以 CFD 要用特殊的**壓力—速度耦合演算法**（如 SIMPLE、PISO）迭代求解。這也是 CFD 比結構 FEM 難收斂得多的根源。

---

## 6. CFD 的離散化：有限體積法（FVM）

CFD 主流用**有限體積法（finite volume method, FVM）**而非 FEM。核心思想：把流場切成許多小的**控制體積（control volume / cell）**，對每個控制體積套用**守恆律的積分形式**——「流入－流出＝累積」。

- 物理量（質量、動量、能量）的變化，由通過各個面的**通量（flux）**決定。
- FVM 天生**嚴格守恆**（流出某格的量恰好流入鄰格），這對流體至關重要，是它比 FEM 更受 CFD 青睞的主因。
- 面上的通量要由格心值**內插**估計：**迎風差分（upwind）**穩定但較耗散（抹平梯度）、中央差分準但易震盪，常折衷使用高階格式。

離散後，每個控制體積得一條代數方程，組成大型稀疏方程組，迭代求解。

---

## 7. CFD 的網格與邊界條件

- **網格（mesh）**：結構化網格（規則排列、品質高、效率好，但難貼複雜幾何）vs. 非結構化網格（任意形狀、貼合複雜外型）。
- **邊界層網格（inflation / boundary layer mesh）**：貼壁面要拉出很薄的層狀網格，以解析速度從零（無滑移）急遽變化的邊界層。**$y^+$** 是衡量第一層網格離壁面遠近的無因次量，必須配合所選紊流模型落在適當範圍。
- **常見邊界條件**：入口（給速度或質量流率）、出口（給壓力）、壁面（無滑移 no-slip、絕熱或定溫）、對稱面、週期邊界。邊界條件設錯是 CFD 結果荒謬的頭號原因。

---

## 8. 紊流模型概觀（CFD 的核心難題）

大多數工程流動是**紊流（turbulence）**：充滿大小不一的渦旋、隨機脈動、跨尺度範圍極大。直接解析所有尺度（**DNS**，直接數值模擬）所需網格與算力天文數字，工程上不可行。於是用**模型**處理：

- **RANS（雷諾平均 Navier–Stokes）**：把流場拆成「平均＋脈動」，只解平均流，脈動的影響用**紊流模型**封閉（closure）。出現的額外未知項（雷諾應力）需用模型補上：
  - **$k$-$\varepsilon$ 模型**：穩健、便宜，適合自由剪切流，近壁面較弱。
  - **$k$-$\omega$ / SST $k$-$\omega$**：近壁面與逆壓梯度（分離）表現好，工業界最常用。
  RANS 便宜、適合穩態設計疊代，但只給「平均」結果、對強分離流不準。
- **LES（大渦模擬）**：直接解析大尺度渦旋，只對最小尺度建模。比 RANS 準很多（能抓非穩態結構、噪音），但網格與時間步要求高得多、貴得多。
- **混合法（hybrid RANS-LES，如 DES）**：近壁面用 RANS、遠離壁面的分離區用 LES，折衷精度與成本，是現代高保真模擬（如車輛氣動）的主力。

**選模型沒有萬靈丹**——是 CFD 最依賴經驗與判斷的環節。

---

## 9. 收斂與殘差（CFD 的「跑完了沒」）

CFD 是迭代求解，每一步把上一步的解代回方程，看**殘差（residual）**——方程兩邊不平衡的量——是否持續下降。

- **殘差曲線**：理想是各方程（連續、動量、能量、紊流量）的殘差隨迭代次數穩定下降數個數量級（常見要求降 3～5 個數量級）後拉平。
- **光看殘差不夠**：還要監測**有工程意義的量**（升力、阻力、出口流量、某點壓力）是否也達穩定值——殘差降了但關心的量還在飄，仍不算收斂。
- **發散**：殘差爆升常源於網格太差、時間步過大、邊界條件不當或初始條件太離譜。

---

## 10. 驗證與確認（V&V）

CAE 結果可信度的兩道關卡，務必分清：

- **驗證（Verification）—「方程解對了嗎？」**：檢查數值解是否正確逼近所選的數學模型，與物理無關。手段：網格收斂研究、與解析解或人工製造解（method of manufactured solutions）比對、檢查守恆與殘差。「Are we solving the equations right?」
- **確認（Validation）—「解對了正確的方程嗎？」**：拿模擬結果與**真實實驗／量測**比對，檢查所選的物理模型（紊流模型、材料模型、簡化假設）是否抓住真實現象。「Are we solving the right equations?」

兩者缺一不可：模型解得再精準（驗證過關），若物理假設錯誤（確認失敗），結果照樣與現實脫節。嚴謹的 CAE 流程還會做**不確定度量化（UQ）**，回報結果的誤差範圍而非單一數字。

---

## 11. CAE 的限制與工程判斷

- **「Garbage in, garbage out」**：輸入（幾何簡化、材料數據、邊界條件、紊流模型）錯，輸出再漂亮也錯。彩色雲圖具有強烈的「看起來很對」的欺騙性。
- **CAE 是輔助而非取代判斷**：它放大工程師的能力，但不能替工程師思考。要先用手算／量級估計（back-of-envelope）對答案有預期，再用 CAE 細算；若 CAE 結果與物理直覺差很多，先懷疑模型而非相信數字。
- **永遠問三件事**：網格收斂了嗎？殘差／結果穩定了嗎？跟解析解或實驗對得上嗎？答不出來，結果就只是「好看的猜測」。
- **適度才是美德**：模型不是越細越好，要match 問題的需求與可用算力；過度建模浪費時間又未必更準。

---

## 與其他科目的關聯

- [數值方法與計算](16-數值方法與計算.md)：FEM／CFD 全建立在離散化、稀疏線性系統、迭代解算器、收斂與誤差分析之上；本科是數值方法最大宗的工程應用。
- [材料力學](../02-固體力學/04-材料力學.md)：FEM 結構分析的輸入（彈性模數、降伏強度）與輸出（von Mises 應力、安全係數）全來自材力；應力集中與奇異點的判讀也需材力直覺。
- [流體力學](../03-熱流科學/07-流體力學.md)：CFD 解的正是 Navier–Stokes 與連續方程；雷諾數、邊界層、分離等概念是設定與判讀 CFD 的基礎。
- [傳熱學](../03-熱流科學/08-傳熱學.md)：CFD 的能量方程與 FEM 的熱傳導／熱應力分析，把傳導、對流的速率律搬進數值框架求解。

## 碩士層級延伸（簡短）

- **非線性 FEM**：大變形、塑性、超彈性、接觸與摩擦——方程變非線性，需 Newton–Raphson 迭代。
- **顯式動力學（explicit dynamics）**：碰撞、衝擊、衝壓成形（如 LS-DYNA），用顯式時間積分。
- **高保真紊流**：LES、DES、DNS 的數值方法與次格尺度模型。
- **多物理與耦合**：流固耦合（FSI）、熱—結構—流體耦合、電磁—熱耦合。
- **降階模型（ROM）與代理模型**：用少數模態或機器學習加速重複分析與最佳化。
- **自適應網格（adaptive mesh refinement）**：依誤差估計自動加密網格。
- **拓樸最佳化（topology optimization）**：以 FEM 為核心，自動演化出最省材料的結構形狀。

## 博士研究方向（列表）

- 高階／間斷 Galerkin 法與譜元素法（高精度 CFD/FEM 數值格式）
- 紊流封閉模型與資料驅動／機器學習紊流模型
- 大規模平行與 GPU 加速的隱式／顯式求解器
- 不確定度量化（UQ）與穩健設計、隨機有限元素
- 流固耦合與多物理多尺度耦合的數值穩定性
- 等幾何分析（isogeometric analysis, IGA，CAD 與 FEM 整合）
- 自適應網格與後驗誤差估計（a posteriori error estimation）
- 無網格法（meshfree / particle methods，如 SPH、PFEM）
- 拓樸最佳化與生成式設計
- 機器學習加速／取代 PDE 求解（physics-informed neural networks, PINN；神經算子）

## 參考來源

- [Introduction to the Finite Element Method — G. P. Nikishkov（IIT Guwahati, PDF）](https://www.iitg.ac.in/mech/documents/128/introfem.pdf)
- [Introduction to the Finite Element Method (FEM) Lecture 1 — Cambridge CCG（PDF）](https://www.ccg.msm.cam.ac.uk/system/files/documents/FEMOR_Lecture_1.pdf)
- [The (Galerkin) Finite Element Method — University of Auckland（Kelly, Solid Mechanics, PDF）](https://pkel015.connect.amazon.auckland.ac.nz/SolidMechanicsBooks/FEM/One_Dimensional/02_FE_Method.pdf)
- [Finite Element Method Complete Guide: Basics + Applications — CAE Assistant](https://caeassistant.com/blog/finite-element-method/)
- [What is Convergence in Finite Element Analysis? — SimScale](https://www.simscale.com/blog/convergence-finite-element-analysis/)
- [Avoiding Singularities in FEA Boundary Conditions — Engineering.com](https://www.engineering.com/avoiding-singularities-in-fea-boundary-conditions/)
- [Meshing in FEA: Element Types, Quality Criteria & Best Practices — SDC Verifier](https://sdcverifier.com/structural-engineering-101/meshing-in-finite-element-analysis/)
- [What is Finite Element Analysis (FEA)? — Ansys](https://www.ansys.com/simulation-topics/what-is-finite-element-analysis)
- [Modal and Thermal Stress Analysis — Ansys Innovation Space](https://innovationspace.ansys.com/courses/courses/structural-simulation-using-ansys-discovery/lessons/modal-and-thermal-stress-analysis-with-report-generation-lesson-3/)
- [Thermal Stress Analysis — ScienceDirect Topics](https://www.sciencedirect.com/topics/engineering/thermal-stress-analysis)
- [Comprehensive code verification techniques for finite volume CFD codes — Journal of Computers & Fluids (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0045793012001697)
- [DrivAerML: High-Fidelity CFD Dataset for Road-Car External Aerodynamics（含 RANS/Hybrid RANS-LES 說明, arXiv）](https://arxiv.org/pdf/2408.11969)

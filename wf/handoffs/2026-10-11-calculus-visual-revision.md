# 微積分圖解與計算教學：發布交接

使用者於 2026-10-11 要求由隊長自行組子團隊，回查微積分內容，查閱或下載官方開放教材，增加 ELI5 因果圖解並銜接電磁學、電子學、電路學；另明確要求「圖要講解公式、實際應用與計算過程」。使用者已授權修正查證後的原文問題、commit、push 與部署。本隊開工基線為 `05831b8fa7011004fa58d03be13e057676f116b4`。

## 完成範圍

產品為 `共通基礎/數學/圖解微積分/`，共 26 頁、53 個 HTML／JS／CSS 成品；保留原 16 個 URL，新增必要函數、局部線性化、電荷電流、一階方程、座標切片與拆開的向量微積分。23 個教學頁全部具備同題圖與符號、選公式的條件、式子由來、逐行代入與單位／中間值、答案檢查，以及相似遷移題的分步提示和完整解答。核心算例直接可見，分鏡與互動沿用同一數值故事。

銜接只教必要數學：理想 C／L、電荷電流、功率能量與 RC／RL；梯度、電位、線積分、通量、散度旋度與定理適用條件。電子元件、完整電路方法與電磁物理本體留給後續課；工程數學另接二階 ODE／RLC、複數相量、Laplace、Fourier、PDE。

可延續的課綱、逐課計算計畫、教材主張與條件、電子／電路接線，均在[課程 README](../../共通基礎/數學/圖解微積分/README.md)連到產品資料檔，包含 `教材與銜接索引.json` 的 25 列官方來源、`後續課程接線.json` 與 `計算教學計畫.json`。引用 MIT、OpenStax 與大學教材，原創 SVG／canvas，未引入外部圖片或依賴。

## 正式驗收

數學與幾何 23／23 PASS、未解缺陷 0：research_audit 審 19 課，advanced_math_audit 審 4 課，核對主例、全部遷移解、單位、方向、近似與定理條件；同版證據在 `/tmp/calculus-calculation-math/final-review.md`、`final-coverage23.json`、`final-manifest53.json`。25 列來源映射與產品逐 id／URL 相符。原概念版受驗紀錄保留，沒有拿它代替本輪新增計算驗收。

獨立圖解計算教學 23／23 PASS、未解阻塞 0：pedagogy 審 21 課，advanced_pedagogy 審 2 課，逐讀主例與展開解答、實看圖面，確認讀者能依圖選式並跟算。單位向量縮放、exp／ln 反向對應、球體 r／θ／φ 界限與功率時間切片四項缺口均已修正複驗。正式歸屬、實讀實看範圍及同版綁定在 `/tmp/calculus-calculation-pedagogy/review.md`、`page-review.json`、`manifest-binding.json`。

獨立瀏覽器 QA PASS、未解 0：[驗收紀錄](../../共通基礎/數學/圖解微積分/驗收紀錄.md)第三版保存結果。23 課共 69 組三尺寸渲染，PC 新內容逐頁實看、手機／320 窄版依圖形和練習版型抽查；全 26 頁另作 78 狀態導覽與溢出檢查。鍵盤、長式捲動、提示解答、離線、停用 JS、連結與 fragment、ARIA、UTF-8、console／runtime／外部請求皆通過。26 支 JS 和 3 個輔助 HTML 與概念基線一致，明確沿用已驗的數值模型。原始批次及 focused 修正證據在 `/tmp/calculus-calculation-qa/`，由 `final-coverage.json` 與 `final-manifest.json` 綁定。

舊工程數學與 IoT 等 56 個保護檔逐雜湊不變，17 門既有樣式同步無漂移。wf-lint 仍為 exit 1、TOTAL broken=2，僅原有兩條歷史審稿引用，沒有新增斷鏈。未做真人理解測試、真手機觸控、Safari／Firefox 或螢幕閱讀器實測，不宣稱這些已通過；後續沿用既有實機待驗項。

## 原文與發布界線

[01-微積分.md](../../共通基礎/數學/01-微積分.md)相對本輪 Git 基準僅一行替換：補理想定值 C／L、電流流入正端的被動符號、淨吸收能量與儲能變化，以及真實元件另需模型的條件，保留原公式。未證實原核心公式有 AI 幻覺，不把內容不足誇稱公式錯誤。該行直接附 Louisville 被動符號教材及 OpenStax RC／RL 來源；檔案 SHA-256 為 `2535dae69d68150f62b96765e35853eec43758c55c5253e20f948ab9481c1f3f`。

本次受驗 53 成品清單 digest 為 `3ae13bba0d0ed016acafda2f06e2387d19d7f259dfe3720b2613940fa198c1f1`，三審均獨立與實物對齊。概念版 digest `1c9315a0534db6c19f4a1f2fc95779c96aea4d5ee476795fccddfb6ad0d199fc` 與早期計算候選只作歷史證據，不用於本次部署。

正式 53 檔清單為 `/tmp/calculus-calculation-builder/final-53-manifest.json`，檔案自身 SHA-256 為 `a877485bdaf92bf0ad41f5f2f445b40cf4b034ded6c62c79a037b96ae40d83be`。產品與必要文件共 63 路徑在同目錄 `final-release-all-files.json`；另加上述原筆記與本交接檔，由隊長整合為 `/tmp/calculus-visual-team/final-publication-scope65.json`，供 publisher 精確取件，不含 `.openai/`、暫存或其他課程。

成品已停筆，builder、所有作者與獨立審者均完成並退出；自有 headless 瀏覽器與 QA 8767 伺服器已收妥。builder 已收妥資料檔狀態與精確發布清單、移除自有暫存建置進度，未改受驗成品。驗收紀錄寫權已交回隊長，本交接檔由隊長獨占。

正式 Git、中央入口與共享行政由 root／publisher 串行處理；Sites 由 hosting_operator 讀指定 commit blobs 同步既有站。本站沿用 [公開微積分網址](https://justty32.github.io/engineer_study/calculus-little-lab/)，目前新版尚未部署。GitHub 公開資產驗證成功後，root 會並行啟動電子學與電路學兩隊，直接接上述兩份來源／接線資料。不得讀改提交 `nvim.log`，不得覆蓋舊站、改其他課或碰本隊 `.openai/`。

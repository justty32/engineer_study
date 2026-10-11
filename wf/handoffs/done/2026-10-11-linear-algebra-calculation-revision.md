# 線性代數 v3：用圖說明公式與逐步計算

使用者實看已公開 v2 後指出：圖足夠理解概念，但不知道怎麼選公式、代入計算與實際應用。本輪完整授權 visual_builder 帶隊補全15章公式計算層，完成獨立數學／教學／QA才發布。保留 v2 歷史：product ca23227、closure 30d01eb；37檔受驗 manifest SHA256 9741dd8555deb071bd2bae4a19645d43d5d66c1d7ee9b8294a6eb64ccca24c3b。

## 領地與進度

本站 [圖解線性代數](../../../共通基礎/數學/圖解線性代數/README.md)（.openai除外）與本handoff由隊長持有；共享workflow／中央／git／部署由root和publisher。原始02-線性代數.md先唯讀，新確證錯誤另申領。nvim.log／prompt.md禁讀改。其他隊平行工作不得混入提交。

先做 matrices prototype，再以 systems／projection／eigen或SVD試驗有完整求解的例子；可用槽緊，先隊長做規格與樣板，後續滾動派作者／獨立審者，不一次喚四人。逐章規格與進度見 `共通基礎/數學/圖解線性代數/計算教學契約.json` 與建置期間的建置進度.md。

## 新驗收界線

每章要能從題目知道已知/所求與選式理由；圖上數字與公式逐項一致；包含合理推導/條件、代入、完整中間值、單位或維度、圖像或代回驗算，以及附分步提示詳解的相似新題。核心計算不得只藏details，也不能只把公式卡和概念圖並排。深度隨章節調整：入門算座標位移，進階真的求解一個可手算小矩陣。

圖形沿用v2逐步概念模型，加入計算標註，不為件數堆圖。新數值由獨立數學審者重算；既有7份MIT官方來源可復用，有不確定才補查。教學審查改問是否能依例獨立算相似題。完工交root最終manifest、三線證據和精確scope，再由兩發布專員更新既有雙站。

## 代表稿與獨立覆核進度

矩陣 prototype 位於 dist/matrices.html#worked-calculation：A=[[2,−1],[1,1]]、x=(2,1)，從兩欄加權到兩橫列算式得(3,3)，遷移輸入(1,2)得(0,3)。root實看圖式對照與PC計算區，確認符合本輪方向；後續擴章不等待逐頁批准。

兩位作者滾動接手，geometry完成投影／最小平方／QR後退出，matrix處理對角化／SVD／行列式／工程。隊長完成其餘8章、首頁與共用樣式。visual_math已獨立通過首13章，修復特徵值有號倍率與箭頭比例兩項；v3證據另存/tmp/linear-calculation-math，未覆v2。visual_pedagogy改按算題遷移審查，LS首次轉置的記法橋已補，正收全頁渲染。

正式發布仍待全部15章數學／教學與適當技術QA、產品37檔新manifest；root排程精確Git與既有Sites更新。產品未freeze前不得把v2manifest冒作v3。

## 內容封版與三線證據

15章計算層已全部完成；兩位章作者已停筆退出。數學正式PASS（15章＋3支持頁），報告在 `/tmp/linear-calculation-math/final-review.txt`，逐頁版本與教材對應分別在同目錄 `review-manifest.json`、`reference-check.txt`。本輪修正有號特徵值與長度倍率的區別、新圖箭頭比例；7份已實讀MIT沿用，不宣稱本輪重新網讀。

教學正式PASS，報告在 `/tmp/linear-calculation-pedagogy/final-review.txt`，逐頁能力範圍在 `coverage.csv`，候選37檔指紋在 `final-reviewed-hashes.json`。15章全文算例與全部提示詳解均已讀、完整渲染切片均已看。首次轉置、首屏手算入口、PCA為何選最大特徵值三項缺口已修復閉環。本結論是教材可跟算與遷移步驟的審查，沒有把學生學習結果當成已測得事實。

目前只剩visual_qa的受影響技術驗收；產品候選freeze不再加內容。獨立站產品仍是dist內37檔；精確發布準備範圍保存在 `/tmp/linear-calculation-prototype/release-scope.json`，最終SHA以QA產出為準。原v2公開版本與歷史驗收不改寫。

## 最終封版與發布交接

2026-10-11：v3三線正式PASS，未解產品缺陷0。QA完成18頁三寬度、638相對連結/片段、15章完整主例與展開詳解、5支變動JavaScript的67組獨立情境×PC/320，以及離線、無JS主文和鍵盤檢查。未重跑不受影響的舊數學全參數組合；舊v2/v1歷史完整保留於本站驗收紀錄。

正式產品manifest為 `/tmp/linear-calculation-qa/product-sha256.txt`，37行，檔名相對於dist；檔案本身SHA256為 `a38f27c3a67c69783f59540a4f25742daaee09ca21cd9570e4ae2686718521cc`。受驗起訖產品零變更；最後比較v2只變更預期23檔、14檔不變。正式技術範圍與結果已寫 `共通基礎/數學/圖解線性代數/驗收紀錄.md`。

可提交精確範圍為 `/tmp/linear-calculation-prototype/release-scope.json`：37產品檔、7份本地文件及本handoff，共45路徑；不含.openai、其他課程或共享行政檔。建置進度.md已刪除；兩章作者、數學/教學/QA皆已退出，QA自有server/headless亦關閉。隊長不commit/push，產品從此不再寫入。root排程publisher精確提交GitHub，再由hosting_operator從已push Git blob更新既有Sites，避免混入並行工作。

## 雙站部署完成與收線

[GitHub 公開版](https://justty32.github.io/engineer_study/linear-algebra-little-lab/) 已更新至 v3。產品 commit `e2c7c801c2aba39ac21d1ca1f23ee7218ed809b4`，[部署工作 38111886664](https://github.com/justty32/engineer_study/actions/runs/38111886664) 成功；2026-10-11T04:32:56Z 的 44 次 HTTP 核對全數 200，37 成品符合本輪受驗 manifest，中央 HTML／CSS 一致，5 個舊入口正常。45 條授權 scope 中實際 31 個變更入 commit，112 個受保護舊資產與基線相同；其他隊產品、原文及使用者檔案未入提交。

[既有 Sites 鏡像](https://linear-algebra-little-lab.bronzetern2.chatgpt.site) 於 2026-10-11T04:33:36.223894Z 回傳 succeeded，owner-private 不變。project `appgprj_6acaeba52be88191b1baa402a3ae277c`，source `e707210006bbacb3708e07a1cfbabcee9454abc6`，deployment `appgdep_6acb118fefc8819180c0797973325de2`。37 檔從已 push 產品 Git blobs 提取，與隔離 source、封包及 QA 逐檔相符；完整版本識別與封包 SHA 見 [驗收紀錄](../../../共通基礎/數學/圖解線性代數/驗收紀錄.md)。公開證據在 `/tmp/linear-calculation-publication/`，鏡像證據在 `/tmp/hosting-operator/linear-v3-deployment.json`。

v2／v1 歷史完整保留。已更新原線代真人待驗列，共通 9 課不增加；是否能依例自行算相似題仍需使用者驗，不將教學審查當成實測學習成果。作者、審查與 QA 已退出，自有瀏覽器／server／GitHub 核對／Sites 程序皆結束。微積分、工程數學仍現役，電子／電路仍待微積分正式部署，不結束整體目標。

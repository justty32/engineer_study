# 機器人數學圖解課程交接

2026-10-11，candidate-3 完成教材／數學／教學圖式與獨立技術驗收，正式凍結，可交發布。使用者已授權建立新站、委派子隊、參照正式教材、修正確證錯誤，並授權 commit、push 與部署；不需再問發布許可。目前尚未宣稱公開上線。

## 成品與精確版本

新領地為 `專題/機器人運動學/圖解機器人數學/`，slug `robotics-math-little-lab`。全新二十頁：十七課加首頁、字典、來源；十七個自由實驗，112個原創靜態SVG。數量僅描述資產，不當作學習效果。全部原生HTML/CSS/JS，零新增依賴、外部圖片或外部執行期請求，可離線閱讀及操作。舊站不覆蓋。

最終二十三個部署資產的精確路徑、大小與SHA-256保存在新領地 `成品清單.json`（wf-table/1）。該清單自身SHA-256為 `0f9c863a8b41724c0a7a53cf94211c4a0a8efefcc340883870e1fe03743b841f`；產品指紋為 `f38375bedfc3c3ffe763d55b5d6737d4fd4d4625764074975bcbf0baa7b7343e`。

作者原始候選清單另存 `/tmp/robotics-builder/candidate3/candidate-23-manifest.json`，自身SHA-256為 `137cece657ddea179bff97b2361e3de1793732e9a39d1a847a5522dfa3609ecd`，產品指紋相同。部署只複製 `dist/` 的二十個HTML與 `lab.css`、`site.js`、`experiments.js`，來源PDF、研究暫存、截圖及驗收JSON不部署。

## 範圍與教學結果

課程從位置、單位、角度／弧度、向量、座標框走到二維／三維旋轉、剛體變換與逆、座標鏈、二連桿正逆運動學、雅可比與奇異、三次時間軌跡、力矩、單軸動力學、PD與四元數橋接。沒有展開ROS、SLAM、視覺或硬體百科。先備與後續對應在PROJECT-BRIEF、課程契約及首頁；新工程數學等未發布站沒有預先產生404連結。

全十七課依使用者最新要求提供給定／求量、圖與公式逐項對照、式子由來與適用條件、可見逐行數值和單位、結果檢查、遷移題提示與詳解。核心算例與即時代入不藏折疊。forward主例30°／60°與遷移30°／30°已實看，後者兩段水平投影均非零。Jacobian真正從FK按弧度推第一欄兩個偏導，分開m/rad係數與m/s速度；四元數由w、z代入算出旋轉向量，沒有只斷言q與−q同姿態。

官方教材來源為Modern Robotics作者預印本及MIT三份課程材料；具體章節／頁碼、URL、適用條件與使用範圍在 `教材對照.json` 及 `dist/sources.html`。研究員實讀四份材料，以原創繁中解說和SVG重推，不部署教材PDF、原圖或長篇原文。修正了新站奇異章的位置／速度導數誤句，以及公式推導、圖上單位、四元數代入、近似等號與指數常數單位等缺口。本隊未修改原始筆記。

## 驗收證據與承接

耐久證據為新領地 `驗收紀錄.md`、330列 `驗收數據.json` 與23列 `成品清單.json`。教材／數學審查完整覆蓋十七課主文、主算例、遷移詳解、規約、單位及圖式；candidate-2修後R1–R7全部結案，另以獨立Hamilton乘積核八個四元數案例。詳證 `/tmp/robotics-math-research/candidate1-review.txt` 與 `candidate2-review.txt`，各輪hash快照俱在研究暫存。

獨立技術驗收覆蓋二十頁1440×900、390×844、320×800，120組獨立數值，修後39個受影響場景及17課預設。PD另由微分方程作RK4重算；不是複製產品解析式。鍵盤、focus、重設、邊界／退化、字典搜尋、reduced-motion、全頁離線、UTF-8、連結與錨點、JS、console、HTTP與外部執行期請求均核。實際截圖檢視涵蓋代表課與全部可疑碰字，不以bbox或測試數冒充真人閱讀。

candidate-3唯一產品差異是在Jacobian加兩個HTML換行，避免320px把q₂拆開。QA核移除兩插入能逐位元重建candidate-2、正規化全文相同，其餘22檔hash不變；三尺寸已實看，承接已通過的數學結論。隊長教學實看證據在 `/tmp/robotics-math-team/teaching-review-candidate2.txt`（含candidate-3結案）；最後技術詳證在 `/tmp/robotics-math-qa/`。真人理解、實機觸控及其他瀏覽器仍需人工回饋，不作自動通過宣稱。

舊三站63檔（數學基礎21、運動學23、路徑規劃19）與事前SHA-256基準相同；原17站樣式無漂移；wf-lint只保留原兩條2026-09-26歷史引文斷鏈，沒有新增。原 `nvim.log` 與使用者 `prompt.md` 未讀改提交。

## 停筆與發布接手

builder、其基礎作者、research_audit、qa均已final退出；全部自有headless瀏覽器／server／背景行程關閉。隊長完成此交接後停筆，保持可回覆。不增加覆查人手、不操作git。

可由root的visual_publish接手提交的新領地共32檔：23部署資產，加PROJECT-BRIEF、BUILD-SPEC、README、課程契約、派工計畫、教材對照、驗收紀錄、驗收數據、成品清單九個規劃／來源／驗收文件；暫存 `建置進度.md` 已依約移除。另包含本唯一handoff。所有檔案已停止寫入，產品dist位元組以最終清單為準。

root已指定GitHub Pages公開發布，無Sites project或.openai變動。僅visual_publish可接共享git、中央入口、Pages流程及共享行政；本handoff寫權隨正式ready移交其追加部署證據，本站README亦可由其補公開網址與驗收入口。不要夾帶其他隊尚在編輯的產品。發布後由publisher核公開23資產與頁面、記commit／workflow／公開URL；任何產品位元組變動須更新清單並補相應驗收。若有公開站問題，由root重新派定單檔writer，不直接多人改。

## 發布完成與收線

[公開課程](https://justty32.github.io/engineer_study/robotics-math-little-lab/) 已由 GitHub Pages 上線。產品 commit `7b565ec16be6866c940ea128ee053f1ccfe89f6d`，[部署工作 38111386682](https://github.com/justty32/engineer_study/actions/runs/38111386682) 成功。2026-10-11T04:23:40Z 的 30 次 HTTP 檢查全部 200：23 成品逐檔符合最終受驗雜湊，中央 HTML／CSS 一致，5 個舊入口 smoke 正常。舊三機器人站 63 檔在產品 commit 與基線相同；中央 40→41 課、既有 slug 全保留。

本次只提交 32 課程檔、中央、Pages、來源 README 與本 handoff 共 36 檔，其他隊產品及原筆記 dirty 留在工作樹。新站依政策只部署 GitHub，沒有 Sites/.openai，不將缺少私有鏡像視為未完成。精確 scope、公開核對與 run 證據在 `/tmp/robotics-math-publication/`；持久結論見 [驗收紀錄](../../../專題/機器人運動學/圖解機器人數學/驗收紀錄.md)。

已完成作者／研究／QA 及發布行程收束；真實 PC 能否照圖使用公式算相似題、手機觸控與其他瀏覽器仍列待驗。共享程序保留線代 v3、微積分與工程數學現役；電子／電路仍待微積分正式部署後啟動，整體目標尚未完成。

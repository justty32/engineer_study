# 多隊圖解課程程序

使用者要求大量原創圖解與 ELI5 教學，並在製作途中依網上官方教材核錯。多 agent、自選技術棧、另建網站及自由 commit／push／部署授權持續；舊互動課程保留，既有圖解站可更新。線代完成只是本程序其中一站，不代表整體目標完成。

## 總排程

線代隊長 `visual_builder` 統籌 [線代改版](done/2026-10-11-linear-algebra-visual-revision.md)，三線獨立驗收與雙站部署均完成，產品 commit `ca23227`，37 個公開成品對上受驗雜湊，作者與驗收者已退出。root 已據此啟動 `robotics_team`，由隊長自行組隊，建立 [機器人數學新站](2026-10-11-robotics-math-visual.md)；領地為 `專題/機器人運動學/圖解機器人數學/`，slug 為 `robotics-math-little-lab`，舊站保留。

微積分隊長 `calculus_team` 並行統籌 [微積分改版](2026-10-11-calculus-visual-revision.md)，查官方教材、增加逐步圖解，保留一階 RC／RL 與向量微積分，深度須銜接電磁、電子與電路。微積分正式凍結與部署完成後，由 root 同時啟動 `electronics_team` 與 `circuits_team`，兩位隊長各自組隊。

教材缺口已滿足另立工程數學隊的條件，`engineering_math_team` 現已啟動 [圖解工程數學新站](2026-10-11-engineering-math-visual.md)，領地為 `共通基礎/數學/圖解工程數學/`。此隊承接二階 ODE／RLC、複數相量、Laplace 初值／LTI、Fourier 與必要 PDE 邊界；既有工程數學站不改。

root 只負責派隊、依賴、資源與最終發布放行，不承擔逐頁實作。隊長自行收斂作者、查證與獨立 QA，將完整凍結證據直接交 `visual_publish`，由發布者回 root 短摘要。

## 領地與串行發布

root 只做發布放行，Sites 操作已委派 `hosting_operator`，僅寫隔離 checkout 與 `/tmp/`，不改工程 repo，等待各隊正式 freeze 後才部署。`visual_publish` 獨佔 `wf/SESSION-LOG.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/inbox/ROSTER.md` 與本檔，亦獨佔中央入口 `互動學習網站/index.html`、`.github/workflows/pages.yml`、`共通基礎/README.md` 等接線檔；新課就緒後串行接線，不需逐次轉移。產品驗收、WAIT_USER 等收尾檔仍由 root 明確轉移後才寫。

每隊自行建立 handoff 與互斥檔案領地，產品檔一檔一作者。不得寫其他隊、舊站、源筆記或 `.openai/`，除非該隊交接明列其範圍。`nvim.log` 全程禁讀、禁改、禁提交。所有隊共享 git，發布由 `visual_publish` 串行精確 staging；其他隊未完成的 dirty 檔可保留，不得夾帶進另一隊 commit。

使用者未限制 agent 數量；環境實際共 13 個併發槽。各隊按可用槽組隊，子線完成即退出釋放，保留可喚回身份。禁止 GUI、桌面截圖、焦點／鍵鼠操作與依賴安裝。教材以官方一手來源為準，允許下載官方開放教材至 `/tmp/` 參照；各隊隊長自行批准研究批次。產品不抓外部圖片，新圖使用原創 inline SVG／canvas。

## 固定交付與驗收

1. 隊長交代具體學習情境、逐步圖解如何補跳步，並保留公式、數字與模型適用條件；圖數和測試數不代表真人已看懂。
2. 官方教材查核有精確來源與結論；教學審查、數學查核及獨立技術 QA 分開記錄，已知缺陷修妥才凍結。
3. 凍結包含精確提交範圍、受驗產品 manifest 與自身 SHA256、作者停筆確認、PC／手機／鍵盤／離線結果及真人待驗限制。
4. root 明確放行後才精確 commit／push／部署；逐個公開新成品 HTTP 200 並對上受驗雜湊，中央入口與指定舊站僅做 smoke，不重測所有網站。
5. GitHub 與 Sites 的實際 URL、產品 commit、部署識別與結果落檔，各隊行程退出後更新現役／歷史及下一隊依賴；全程序仍有工作時不得標示整體完成。

`wf-lint` 已有兩筆 2026-09-26 歷史引文斷鏈，本程序不為全綠改寫歷史；本輪不得新增斷鏈。發布暫存及基線見 `/tmp/linear-visual-publication/`，持久證據由各隊驗收與完成 handoff 保存。

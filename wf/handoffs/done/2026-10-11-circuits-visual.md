# 圖解電路學交接

狀態：建置、三線獨立驗收與 GitHub 發布完成；2026-10-11。隊長 circuits_team；發布由 root 放行、visual_publish 唯一執行。產品與部署由發布者精確提交。

## 精確範圍

產品 `電機/02-電機核心/圖解電路學/` 共 43 檔，含 `dist/` 的 23 HTML＋app.js＋lab.css。20 教學章、3 支援頁，發布 slug `circuits-little-lab`。另僅兩冊原筆記 `電機/02-電機核心/06-電路學-上.md`、`06-電路學-下.md` 的八項限定小修，以及本交接文件；總範圍 46 檔。保留舊站，不含電子學或其他隊的未提交內容。共享行政、中央導航與 Pages workflow 另由發布線處理。

全範圍逐檔 SHA 清單：`/tmp/circuits-ready-manifest.json`；25 個發布資產清單：`/tmp/circuits-dist-manifest.json`。兩清單均為 wf-table/1，記錄 repo-relative 路徑、SHA-256、位元組數及彙整算法。

## 驗收證據

產品內 `數學驗收.md/json` 與 `原筆記修正複核.json`：20 章主例、近題、補充例、圖式及 60 個互動情境獨立核算；兩原筆記八項修訂逐行對照官方教材與反例，全部通過。

`教學驗收.md/json`：20 章逐文審讀、課綱映射閉合，必修缺口清零。圖中節點／箭頭／極性對應方程，完整代入、中間式、單位、驗算與近題詳解均保留正文。03 節點列式與 11 二階時間曲線曾由 root 抽看。

`驗收紀錄.md`、`技術驗收.json`：23 頁在 1440／390／320、鍵盤、重設、file 離線及無 JS 主文通過；零溢出、數值／單位錯誤、外部 runtime 請求及最終 console error。favicon 404 已以 head-only delta 修復。原筆記與舊站 SHA 一致。真人學習／實體觸控未執行，屬範圍限制，非新增交付門檻。

47 項官方逐主張來源見 `教材來源.json` 與 `教材查證.md`，包含附錄三定理的直接段落實讀及獨立複核。全域 wf-lint 保留兩條 2026-09-26 歷史斷鏈及既有告警；本課的連結、資料契約與 UTF-8 增量檢查通過，未修改歷史湊綠。

## 凍結指紋與程序

產品 43 檔彙整 SHA-256：`c4cb5d71a0ea0e361c77e7d595e16594461494d52814b3302cbf211f3eb2865f`。

發布 25 資產彙整 SHA-256：`1f21ce0df8b0ed2dccf63ca9171626acf2c4cbf08fb67aabf9d232a68dfbc1de`。

原筆記上冊：`c2af5cddda68429f4adc56e6d11e0eec8d9a468bd98629ad4c6e14da60ae588a`；下冊：`c465c460845eacc290306645ea3f1b0e21f17ce04e53aa3e466b119c7c53b127`。

舊電路學互動站 24 檔保持原樣，彙整 SHA-256：`fd46298f202913adb83af8ccb1ecdccf7e5887379728c9d342f09b271f309bb6`。

建置、來源、作者、數學、教學與技術代理均已停止寫入；本地 server PID 275860 已退出，8793 連線被拒，所有自有 headless 瀏覽器已關閉。root 放行後，發布線可依清單精確納入、部署並檢查公開網址；不需重跑已通過的全站驗收。

## 公開部署與收線

[公開課程](https://justty32.github.io/engineer_study/circuits-little-lab/) 已部署；產品 commit `aa2a8394a9dc1f4a3d9f6a59769843075bb82fe9`、[Pages 工作 38117831317](https://github.com/justty32/engineer_study/actions/runs/38117831317) 成功。25 成品與中央 2 檔逐 SHA-256 相符，4 個舊課入口正常，共 31 次 HTTP 全數 200。192 個已發布保護資產不變；中央 42→43，既有 slug 保留。

46 條凍結交付與 3 份接線共 49 檔入產品 commit；兩冊原文八項小修已獨立核對，其他隊與使用者檔未入提交。凍結 manifest 保留產品 commit 當時文件與原 handoff 路徑；後續部署記錄和本檔移至 done 不改 25 成品與兩冊原文。完整持久證據見 [驗收紀錄](../../../電機/02-電機核心/圖解電路學/驗收紀錄.md)，機器證據 `/tmp/circuits-visual-publication/`。

只用 GitHub，無 Sites；lab.css 獨立，正本與舊 FAMILY 複本保留。作者／驗收及自有發布程序已退出。真人理解與實體裝置未驗，不新增使用者待辦；電子學仍待串行發布，整體程序未結束。

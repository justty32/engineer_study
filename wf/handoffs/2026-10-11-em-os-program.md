# 電磁學 → 作業系統圖解課程排程

2026-10-11，使用者追加「電磁學結束後，換作業系統」。這是接續上一輪六門已完成課程的新排程；不把上一輪 done 紀錄改回現役。

## 順序與完成界線

[電磁學隊](done/2026-10-11-electromagnetics-visual.md) 已完成 28 課、四線獨立驗收、公開部署及行政收線：新領地 `電機/02-電機核心/圖解電磁學/`，預定 `dist/` → `electromagnetics-little-lab`；三冊 `08-電磁學-上.md`、`08-電磁學-中.md`、`08-電磁學-下.md` 僅容許官方查證後的最小修正與獨立複核。

電磁學已完成同版驗收、作者停筆、root 放行、GitHub Pages 部署與公開雜湊驗證。root 已啟動 `/root/operating_systems_team` 並核准 20 課範圍；隊長自行組隊，唯一新產品領地為 `專題/作業系統/圖解作業系統/`，預定 `dist/` → `operating-systems-little-lab`。[作業系統交接](2026-10-11-operating-systems-visual.md)已由隊長完成，24 個公開資產同版驗收通過；root 正式放行，由 publisher 串行發布。

作業系統舊 `專題/作業系統/互動課程/` 及其 archive 全部位元組保留，`operating-systems` 公開 slug 不變。本科沒有獨立原文 MD 修訂領地；查證發現的錯誤在新站修正，並於新產品領地記錄原站勘誤。20 課及支援頁已同版封版，作者與審核者均停筆；publisher 依 root 放行接中央／Pages／OS README，精確提交 54 路徑交付及必要行政接線。

本輪整體目標直到作業系統也完成受驗版本部署與收線才可標記完成；電磁學發布完成只解除後續開工依賴。不能以概念圖數量或自動測試數代替完整計算／演算教學與來源核對，也不把代理審查當作真人學習成效已驗。

## 授權與共享邊界

沿用使用者另建新站、多代理、官方教材查證、授權範圍內修文及自由 commit／push／部署的授權。教學以 ELI5 原創圖示、公式與符號對應、條件選擇、完整逐步計算／演算、檢查及附詳解相似題為標準。新站僅用 GitHub Pages，不另建 Sites；現有網站保留。

root 控制隊伍啟動、領地與正式發布放行；隊長唯一寫本課 handoff 與產品分工。visual_publish 唯一維護共享 SESSION／CLAIMS／ROSTER、本排程、中央／Pages 接線與精確 git staging；未封版產品不提交。原電磁學隊長連線中斷後，root 交由 electromagnetics_close 完成最後封版；正式放行後 handoff 的部署與收線交給 publisher。

電磁學發布準備與既有 44 站／舊電磁學保護基線在 `/tmp/electromagnetics-visual-publication/`。OS 啟動保護基線在 `/tmp/operating-systems-visual-publication/`：HEAD `7b863f8`、45 站 784 個部署資產、舊 OS 全部 19 檔（含 archive 3 檔）、18 個共用樣式複本及正本，工作位元組均與提交版一致。不得讀改提交 `nvim.log`、`prompt.md`，不新增依賴、不操作 GUI／桌面；既有 wf-lint 兩條歷史斷鏈不為湊綠而改。不新增 WAIT_USER。

OS 同版驗收、精確 freeze 與 root 正式放行後，publisher 才串行接中央第 46 站、Pages 與 `專題/作業系統/README.md` 新站／勘誤入口，精確 commit／push／部署及公開成品雜湊驗證。新課若採獨立樣式，不改 FAMILY；若使用正本複本，待正式交付再依契約登錄。

## 電磁學部署接點

產品 `95132ff`、Pages 工作 `38121773740` 成功，33 個最終受驗成品逐雜湊一致；行政收線 `7b863f8`，中央 45 課，原 44 站 751 個部署資產保留。原隊長連線中斷後由 electromagnetics_close 完成封版，作者、四線、接手者與發布程序均已退出。OS 已封版並進入發布；本排程保持 active，直到 OS 正式部署收線。

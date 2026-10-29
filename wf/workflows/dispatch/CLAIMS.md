# 派線領地與收線歷史

[dispatch 流程](README.md)｜每次派線與收線由調度者或受委派的共享行政作者更新。

### 現役


| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|

### 關機暫停，保留接續範圍（非現役）

| 線 | 保存範圍 | 接續條件 |
|----|---------|---------|
| phase-full-audio | 原相位音訊13/19段、56/84chunks；模型已停止 | 使用者要求續跑才啟GPU，先實聽p2-04 c003尾音再從p2-05續 |

### 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`wf/WORKFLOWS.md`、`wf/INDEX.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md` | 多條線同時動會互相打架；hub 與活狀態收線時由調度者統一更新 |
| `.github/workflows/pages.yml`、`互動學習網站/index.html` | 掛站接線屬 Lead 收尾，一次一課 |
| `專題/機器人運動學/互動課程/styles.css` | `styles.css` 正本，改它要走 sync 流程 |
| 本表既有內容、交接書目錄 | 線只能追加自己那一格 |

### 歷史（收線後移來，附完成證據）

| 線 | 完成證據 | 收線時間 |
|----|---------|---------|
| state-records-20261029 | [活狀態與真人／agent 分工校正證據](../../handoffs/done/2026-10-29-state-records.md) | 2026-10-29 |
| electronics-resume | [五門十四堂、獨立驗收與接線](../../handoffs/done/2026-10-15-electronics-listening.md) | 2026-10-15 |
| em-remaining | [六門十八堂五十四圖、獨立驗收與關閉證據](../../handoffs/done/2026-10-15-em-remaining.md) | 2026-10-15 |
| electromagnetics-resume | [兩門六堂、十八圖與獨立驗收](../../handoffs/done/2026-10-15-electromagnetics-listening.md) | 2026-10-15 |
| circuit-listening-production | [五門十三堂、行政交棒電子學](../../handoffs/done/2026-10-14-circuit-listening-production.md) | 2026-10-14 |
| listening-frequency | [三堂頻響、九圖與27段驗收](../../handoffs/done/2026-10-14-listening-frequency.md) | 2026-10-14 |
| listening-transformer | [兩堂變壓器三相、六圖與18段驗收](../../handoffs/done/2026-10-14-listening-transformer.md) | 2026-10-14 |
| listening-transient | [三堂暫態、九圖與27段驗收](../../handoffs/done/2026-10-14-listening-transient.md) | 2026-10-14 |
| listening-network（總產線續製頻響） | [三堂網路聽課、九圖與27段驗收](../../handoffs/done/2026-10-14-listening-network.md) | 2026-10-14 |
| listening-power（總產線續製暫態） | [兩堂功率聽課、六圖與18段驗收](../../handoffs/done/2026-10-14-listening-power.md) | 2026-10-14 |
| impedance-audio | [兩堂阻抗續篇、六圖與18段同源講稿驗收](../../handoffs/done/2026-10-14-impedance-audio.md) | 2026-10-14 |
| audio-course-player | [原生播放器、真實seek與Range預覽服務](../../handoffs/done/2026-10-14-audio-player.md) | 2026-10-14 |
| audio-course | [相位與複數聽課、39項狀態／互動及獨立驗收](../../handoffs/done/2026-10-14-audio-course.md) | 2026-10-14 |
| operating_systems_team | [完整圖解演算、來源勘誤及 GitHub 部署](../../handoffs/done/2026-10-11-operating-systems-visual.md) | 2026-10-11 |
| EM→OS 發布行政 | [電磁學與作業系統完整收線](../../handoffs/done/2026-10-11-em-os-program.md) | 2026-10-11 |
| electromagnetics-visual 團隊／close 接手線 | [同版封版、公開部署與單課收線](../../handoffs/done/2026-10-11-electromagnetics-visual.md) | 2026-10-11 |
| course-program 發布行政 | [六門圖解計算課程完整收線](../../handoffs/done/2026-10-11-course-program.md) | 2026-10-11 |
| electronics-visual 團隊 | [模型圖解、完整演算與 GitHub 部署](../../handoffs/done/2026-10-11-electronics-visual.md) | 2026-10-11 |
| circuits-visual 團隊 | [完整圖解演算、原文複核及 GitHub 部署](../../handoffs/done/2026-10-11-circuits-visual.md) | 2026-10-11 |
| calculus-visual 團隊 | [圖解公式、完整計算與雙站部署](../../handoffs/done/2026-10-11-calculus-visual-revision.md) | 2026-10-11 |
| engineering-math 團隊 | [公式圖解、三冊校正與 GitHub 部署](../../handoffs/done/2026-10-11-engineering-math-visual.md) | 2026-10-11 |
| linear-calculation v3 團隊 | [公式手算、三線驗收及雙站更新](../../handoffs/done/2026-10-11-linear-algebra-calculation-revision.md) | 2026-10-11 |
| robotics-math 團隊 | [公式圖解、獨立驗收與 GitHub 部署](../../handoffs/done/2026-10-11-robotics-math-visual.md) | 2026-10-11 |
| linear-visual 團隊 | [逐步圖解 v2 驗收與雙站部署](../../handoffs/done/2026-10-11-linear-algebra-visual-revision.md) | 2026-10-11 |
| iot-builder／iot-source-audit／iot-qa／iot-reference／iot-publish | [IoT ELI5 驗收與部署證據](../../handoffs/done/2026-10-11-iot-eli5.md) | 2026-10-11 |
| calculus-builder／calculus-audit／calculus-qa／calculus-clarity／calculus-publish | [微積分 ELI5 驗收與部署證據](../../handoffs/done/2026-10-11-calculus-eli5.md) | 2026-10-11 |
| linear-builder／linear-audit／linear-qa／linear-clarity／linear-publish | [線性代數 ELI5 驗收與部署證據](../../handoffs/done/2026-10-11-linear-algebra-eli5.md) | 2026-10-11 |

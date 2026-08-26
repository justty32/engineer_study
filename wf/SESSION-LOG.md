# SESSION-LOG — 進度日誌（hub）

← [AGENTS.md](../AGENTS.md)｜[INDEX](INDEX.md)

**只放「還沒完成」的活狀態**（in-flight / open）。完成的不留這裡——過程細節交給 git log（若有「已落地功能目錄」則濃縮一句進去）。待**使用者**親自驗證／做的另見 [WAIT_USER.md](WAIT_USER.md)。

> **膨脹就拆**：本檔若過大，就在 `wf/` 下建立 **`session_logs/`**，按工作流或類別拆檔，並建立 index 導航（照 [DEV-GUIDE「結構整理原則」](DEV-GUIDE.md)）。

本檔同時 ① 連到各工作流自己的 session-log（若該工作流已長出自己的），② 收**不屬任何工作流**的進度。

> **條目格式**：每條只留**一行 open 狀態 + 指向細節的連結**（設計決策/修了什麼落到該工作流的文件、待使用者驗的進 [WAIT_USER](WAIT_USER.md)）。完成即整條刪除。

## 最新進度

- （無）

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|
| interactive-study-site | [IoT 知識群互動網站路線圖](../專題/IoT聯網裝置/知識群互動網站-路線圖.md) | （無；五個知識群網站皆已發布） |

## 不屬任何工作流的進度

- （無）互動課程「加厚講解」全數完成並提交：網路協定、網路安全、攻擊手法細講、IoT 知識群（01–07）、電力系統皆 1x 加厚；逆向工程、計算機組織、機器人四門課皆 3x 深化；另新建三門互動課「機器人數學基礎（robot-math）」「作業系統（operating-systems）」「Linux（linux）」，皆上主站入口並接 pages.yml。細節見 git log。

# SESSION-LOG — 進度日誌（hub）

← [AGENTS.md](../AGENTS.md)｜[INDEX](INDEX.md)

**只放「還沒完成」的活狀態**（in-flight / open）。完成的不留這裡——過程細節交給 git log（若有「已落地功能目錄」則濃縮一句進去）。待**使用者**親自驗證／做的另見 [WAIT_USER.md](WAIT_USER.md)。

> **膨脹就拆**：本檔若過大，就在 `wf/` 下建立 **`session_logs/`**，按工作流或類別拆檔，並建立 index 導航（照 [DEV-GUIDE「結構整理原則」](DEV-GUIDE.md)）。

本檔同時 ① 連到各工作流自己的 session-log（若該工作流已長出自己的），② 收**不屬任何工作流**的進度。

> **條目格式**：每條只留**一行 open 狀態 + 指向細節的連結**（設計決策/修了什麼落到該工作流的文件、待使用者驗的進 [WAIT_USER](WAIT_USER.md)）。完成即整條刪除。

## 最新進度

- **互動學習網站**：正在以 IoT 聯網裝置建立首案，完成後接續電力系統；規格與派工見 [IoT 互動網站專案簡報](../專題/IoT聯網裝置/互動網站/PROJECT-BRIEF.md)。

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|
| interactive-study-site | [IoT 派工計畫](../專題/IoT聯網裝置/互動網站/派工計畫.md) | 首案規劃、實作與驗收；第二案為電力系統。 |

## 不屬任何工作流的進度

- （無）

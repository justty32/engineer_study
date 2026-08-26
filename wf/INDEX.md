# INDEX — engineer_study 專案地圖

← [AGENTS.md](../AGENTS.md)｜工作流派發 [WORKFLOWS.md](WORKFLOWS.md)｜專案規範 [PROJECT-GUIDE.md](PROJECT-GUIDE.md)

`engineer_study` 是以大學課綱為骨架、持續累積的跨領域工程學習筆記庫。本檔只描述頂層結構；各領域細節由其學習計畫與目錄承接。

## 儲存庫佈局

| 路徑 | 內容 |
|------|------|
| [README.md](../README.md) | 專案目的、學習深度、慣例與目前進度。 |
| [roadmap.md](../roadmap.md) | 共用基礎抽出、知識延伸、內容整合與專題式學習規範。 |
| `共通基礎/` | 多領域共用的數理、科學與工程基礎。 |
| `電機/`、`電子/`、`機械/` | 起始三領域；各自包含學習計畫、分階段筆記與名詞對照表。 |
| `土木/`、`化工/`、`材料/`、`工業工程/` | 其他工程領域筆記。 |
| `航太/`、`核工/`、`環境/`、`生醫/`、`食品加工/` | 其他專業工程與應用領域筆記。 |
| `大氣科學/`、`人文社會/`、`歷史/` | 自然科學、人文與社會背景知識。 |
| `專題/` | 跨領域或問題導向的專題式學習。 |
| `互動學習網站/` | GitHub Pages 中央入口，彙整各專題互動課程；由 `.github/workflows/pages.yml` 部署。 |
| `wf/` | 本工作流系統、專案規範與 open 活狀態。 |
| `.github/workflows/pages.yml` | GitHub Pages 部署設定：組裝中央入口與各互動課程的發布內容。 |

## 工作流系統

| 路徑 | 內容 |
|------|------|
| [WORKFLOWS.md](WORKFLOWS.md) | 依使用者意圖派發工作流。 |
| [PROJECT-GUIDE.md](PROJECT-GUIDE.md) | 本筆記庫的完整硬性要求與內容模型。 |
| [DEV-GUIDE.md](DEV-GUIDE.md) | 只在拆檔、分類或重整結構時使用的被動參考。 |
| [UPSTREAM.md](UPSTREAM.md) | 通用工作流模板的上游來源、非侵入式導入與人工同步政策。 |
| `workflows/` | 各知識工作、定期工作與共通規範的入口。 |
| `.claude/commands/` | 可選的工作流指令規格。 |
| `inbox/` | Agent 間非同步信件收件匣；使用方式見 [workflows/inbox/](workflows/inbox/README.md)。 |

## 活狀態

| 檔案 | 用途 |
|------|------|
| [SESSION-LOG.md](SESSION-LOG.md) | Agent 尚未完成的進度。 |
| [WAIT_USER.md](WAIT_USER.md) | 等待使用者親自處理或驗證的事項。 |
| `inbox/` | 尚未處理的 agent 信件；完成後移入 `inbox/done/`。 |

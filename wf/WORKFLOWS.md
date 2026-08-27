# WORKFLOWS — 工作流派發器

← [AGENTS.md](../AGENTS.md)｜專案地圖 [INDEX.md](INDEX.md)｜專案規範 [PROJECT-GUIDE.md](PROJECT-GUIDE.md)

依使用者意圖選擇對應工作流，再讀入口檔。各工作流的細節留在自己的入口，不堆回本檔。

## 知識工作

規劃、寫作、閱讀消化、學習、決策與整理共用同一套分層方式。凡產出給人讀的文字，另讀 [common/writing](workflows/common/writing.md)。

| 觸發（使用者要做的事） | 工作流 | 入口檔 |
|------------------------|--------|--------|
| 撰寫文章、筆記、文件或翻譯 | **write** | [workflows/write.md](workflows/write.md) |
| 閱讀長文、影片逐字稿或多份資料並摘要 | **digest** | [workflows/digest.md](workflows/digest.md) |
| 規劃活動、流程或非開發專案 | **plan-a-thing** | [workflows/plan-a-thing.md](workflows/plan-a-thing.md) |
| 在多個選項間做決定 | **decide** | [workflows/decide.md](workflows/decide.md) |
| 學習主題並建立可延續筆記 | **learn** | [workflows/learn.md](workflows/learn.md) |
| 整理資訊、檔案或筆記結構 | **organize** | [workflows/organize.md](workflows/organize.md) |
| 將一個知識面向做成可操作、可回饋的互動網站 | **interactive-study-site** | [workflows/interactive-study-site/](workflows/interactive-study-site/README.md) |
| 將陌生技術主題做成繁中為主、名詞有英文對照、可拆頁且能從零開始的互動課程 | **foundations-first** | [workflows/interactive-study-site/FOUNDATIONS-FIRST.md](workflows/interactive-study-site/FOUNDATIONS-FIRST.md) |
| 在零基礎課程上增加硬體／物理的回路、能量、公式與儀器量測 | **principles-first（硬體子工作流）** | [workflows/interactive-study-site/PRINCIPLES-FIRST.md](workflows/interactive-study-site/PRINCIPLES-FIRST.md) |
| 既有互動課程只是文字太精簡、要用 codex 批次加厚講解（不動互動與版面） | **enrich-existing（codex 子工作流）** | [workflows/interactive-study-site/ENRICH-EXISTING.md](workflows/interactive-study-site/ENRICH-EXISTING.md) |
| 把課綱式科目的筆記從零建成互動課，opus 指揮 codex 分層省 token | **build-with-codex（codex 子工作流）** | [workflows/interactive-study-site/BUILD-WITH-CODEX.md](workflows/interactive-study-site/BUILD-WITH-CODEX.md) |

記錄或查詢跨工作流踩坑時，使用 [common/gotchas](workflows/common/gotchas.md)。都不符合時，先看 [INDEX.md](INDEX.md) 定位內容。

本庫最常見的組合是：新領域或新主題先走 **learn** 建立課綱與主題地圖；材料很多時接 **digest**；要把研究結果寫成正式筆記時再走 **write**。同一個請求可依序使用多個工作流。

## 定期工作流

定期工作流是可選的；未登記任何項目時不執行。需要週期喚醒時，依 [wf-tick 指令規格](.claude/commands/wf-tick.md) 啟動循環；也可由使用者直接要求單次執行。

| 工作流 | 入口 | 用途 |
|--------|------|------|
| **tick** | [workflows/tick.md](workflows/tick.md) | 單次派發 routines 與 schedule。 |
| **routines** | [workflows/routines.md](workflows/routines.md) | 維護並執行固定例行事項。 |
| **schedule** | [workflows/schedule.md](workflows/schedule.md) | 維護並執行一次性定時請求。 |

## 統一形式

- README 是資料夾入口與導引；INDEX 描述該資料夾的頂層結構。小型資料夾可由 README 兼任兩者。
- 單檔工作流由一個 `.md` 同時承擔入口與內容；膨脹後依 [DEV-GUIDE.md](DEV-GUIDE.md) 升級成資料夾型。
- 工作流專屬的 durable 知識、踩坑與進度歸在該工作流，不複製到上層。
- 過時或被取代、但仍需保留脈絡的文件放入該工作流的 `archive/`。

## 跨工作流的活狀態

三種狀態都只列 open 項目，完成即移除：

- Agent 自己尚未完成的進度 → [SESSION-LOG.md](SESSION-LOG.md)
- 等待使用者親自處理或驗證 → [WAIT_USER.md](WAIT_USER.md)
- Agent 之間的非同步信件 → 放在 `inbox/`，使用方式見 [workflows/inbox/](workflows/inbox/README.md)

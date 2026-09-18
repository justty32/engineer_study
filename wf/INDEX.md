# INDEX — engineer_study 專案地圖

工作流派發 [WORKFLOWS.md](WORKFLOWS.md)｜結構整理 [STRUCTURE.md](STRUCTURE.md)｜專案規範 [PROJECT-GUIDE.md](PROJECT-GUIDE.md)

`engineer_study` = **以大學課綱為骨架、持續累積的跨領域工程學習筆記庫（繁中純文字筆記＋互動課程網站）**。本檔只描述頂層：每列一句話＋連結；目錄內部複雜就放它自己的 README / INDEX。

## Repo 佈局（專案根）

| 路徑 | 內容 |
|------|------|
| [README.md](../README.md) | 專案目的、學習深度、慣例與目前進度。 |
| [roadmap.md](../roadmap.md) | 共用基礎抽出、知識延伸、內容整合與專題式學習規範。 |
| `共通基礎/` | 多領域共用的數理、科學與工程基礎。 |
| `電機/`、`電子/`、`機械/` | 起始三領域；各自包含學習計畫、分階段筆記與名詞對照表。 |
| `土木/`、`化工/`、`材料/`、`工業工程/` | 其他工程領域筆記。 |
| `航太/`、`核工/`、`環境/`、`生醫/`、`食品加工/` | 其他專業工程與應用領域筆記。 |
| `大氣科學/`、`人文社會/`、`歷史/` | 自然科學、人文與社會背景知識。 |
| `專題/` | 跨領域或問題導向的專題式學習（含多門互動課程）。 |
| `互動學習網站/` | GitHub Pages 中央入口，彙整各專題互動課程；由 `.github/workflows/pages.yml` 部署。 |
| `.github/workflows/pages.yml` | GitHub Pages 部署設定：組裝中央入口與各互動課程的發布內容（slug 表在此）。 |
| `AGENTS.md`、`CLAUDE.md` | agent 入口（薄路由器）與 Claude Code 轉址檔；非侵入式佈局，其餘全在 `wf/`。 |
| `.claude/commands/` | slash 指令適配層（可選）：`/wf-lint`、`/wf-tick`。Claude Code 只讀專案根的這層；沒有 slash 機制的工具忽略本目錄，直接跑 `wf/tools/wf-lint.sh`。 |
| `wf/` | 工作流系統、專案規範、活狀態、工具與信箱（下表）。 |

## `wf/` 內部

| 路徑 | 內容 |
|------|------|
| [WORKFLOWS.md](WORKFLOWS.md) | 派發器：意圖 → 工作流入口。 |
| [STRUCTURE.md](STRUCTURE.md) | 結構整理參考（被動）：分層、膨脹即拆、四級成長、archive、工作流形式。 |
| [PROJECT-GUIDE.md](PROJECT-GUIDE.md) | 本筆記庫的完整硬性要求、擁有者背景與內容模型。 |
| [UPSTREAM.md](UPSTREAM.md) | 通用工作流模板的上游來源、版本、kernel／project-owned 政策與同步條款。 |
| [SESSION-LOG.md](SESSION-LOG.md) | 我的 open 進度。 |
| [WAIT_USER.md](WAIT_USER.md) | 等使用者親自做 / 驗證的事（hub）；分類清單在 `wait-user/`。 |
| `wait-user/` | WAIT_USER 的分頁：[實機驗收](wait-user/實機驗收.md)、[對照表缺詞](wait-user/對照表缺詞.md)。 |
| `workflows/` | 各工作流入口（派發見 [WORKFLOWS.md](WORKFLOWS.md)；共享區 [workflows/common/](workflows/common/README.md)）。 |
| [workflows/interactive-study-site/](workflows/interactive-study-site/README.md) | 互動課程產線：README／FOUNDATIONS-FIRST／PRINCIPLES-FIRST／QUALITY-GATES／BUILD-WITH-AGENTS（＋`build-with-agents/codex-notes.md`）／ENRICH-EXISTING／GITHUB-PAGES／TEMPLATE.*；`tools/sync-styles.py`；`archive/`（SHARED-ASSETS-EVAL、AGENT-TEAM 已封存）。 |
| [workflows/tidy/](workflows/tidy/README.md) | 整理工作流：封存、拆檔、抽資料檔。 |
| [workflows/planning.md](workflows/planning.md) | 想法成熟管線：idea → roadmap → 詳規 → 執行。 |
| [workflows/decisions.md](workflows/decisions.md) | 決策記錄：為什麼選 A 不選 B。 |
| [workflows/TEMPLATE.workflow.md](workflows/TEMPLATE.workflow.md) | 新工作流入口檔的骨架。 |
| `tools/` | kernel 工具＋inbox 腳本（實際路徑 `wf/tools/`）：`wf-lint.sh`、`tabledb.py`、`find_big_lists.py`、`fix_moved_links.py`、`check_anchors.py`；`inbox_send.sh`（原子投遞）、`inbox_read.sh`（唯讀輪詢）、`inbox_mail.sh`、`inbox_poll.sh`、`inbox_team.sh`、`notify_watch.sh`、`test_inbox.sh`、`hook-settings-snippet.json`（hook 範例，不自動啟用）。資料檔契約見 [workflows/common/data-files.md](workflows/common/data-files.md)。 |
| `inbox/` | agent 之間的信件收件匣（實際路徑 `wf/inbox/`，留在 `wf/` 內的理由見 [UPSTREAM](UPSTREAM.md)）：頂層／`new/`＝未處理、`done/`＝已處理，另有 `mail/`、`teams/`、`topics/`、`orders/` 五通道；使用方式 [workflows/inbox/](workflows/inbox/README.md)，身份簿 [workflows/inbox/ROSTER.md](workflows/inbox/ROSTER.md)。 |
| `skills/` | agent skill 包（實際路徑 `wf/skills/`）：effective-html 六支（`html` 為路由器，MIT，授權檔 `skills/LICENSES/`）＋ `markdown-html-slides`（CC0）；根 `.claude/skills/` 為逐支轉址檔，Claude Code 自動發現後跳回這裡。來源與授權見 [UPSTREAM](UPSTREAM.md)。 |
<!-- wf-insert:INDEX -->

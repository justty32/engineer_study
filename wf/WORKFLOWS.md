# WORKFLOWS — 工作流派發器

專案地圖 [INDEX.md](INDEX.md)｜結構整理 [STRUCTURE.md](STRUCTURE.md)｜專案規範 [PROJECT-GUIDE.md](PROJECT-GUIDE.md)

使用者要做事 → **從派發表選工作流 → 讀它的入口檔**；細節都在入口檔，不堆回本檔。

**可以跳流程**：單行或小範圍、低風險、不跨 session 的修正；純查詢或一次性回答，不留 durable 知識；使用者明確要求快速處理；既有工作流只會增加同步成本而不降低風險。跳流程不等於跳過工程規矩——仍要讀必要上下文、不破壞使用者改動、能驗就驗。

## 派發表

### 知識工作 flavor

規劃、寫作、閱讀消化、學習、決策與整理共用同一套分層方式。凡產出給人讀的文字，另讀 [common/writing](workflows/common/writing.md)。

| 觸發（你說…）| 工作流 | 入口檔（先讀這個）| 分辨 |
|--------------|--------|-------------------|------|
| 「寫一篇東西：文章 / 筆記 / 文件 / 翻譯」 | **write** | [workflows/write.md](workflows/write.md) | 產物是**給人讀的成品** |
| 「幫我讀懂這份材料」「做個摘要」 | **digest** | [workflows/digest.md](workflows/digest.md) | 材料有限、讀完即止；產物是**摘要＋出處索引** |
| 「規劃一件事：活動 / 流程 / 非開發專案」 | **plan-a-thing** | [workflows/plan-a-thing.md](workflows/plan-a-thing.md) | 產出**不是程式碼**；「要不要做」走 planning |
| 「在幾個選項間做決定」 | **decide** | [workflows/decide.md](workflows/decide.md) | 問的是「**選哪個**」；結論落 decisions |
| 「學一個主題，建立可延續的筆記」 | **learn** | [workflows/learn.md](workflows/learn.md) | 主題開放、會回訪；產物是**可回訪的筆記樹** |
| 「整理一堆資訊 / 檔案 / 筆記的結構」 | **organize** | [workflows/organize.md](workflows/organize.md) | 動的是**位置與分類**，不是內容 |

本庫最常見的組合：新領域或新主題先走 **learn** 建課綱與主題地圖；材料很多時接 **digest**；要寫成正式筆記再走 **write**。同一個請求可依序用多個工作流。

### 教學 flavor（互動課程）

| 觸發（你說…）| 工作流 | 入口檔（先讀這個）| 分辨 |
|--------------|--------|-------------------|------|
| 「這個我完全看不懂，用白話講」「不要一堆縮寫」「先講為什麼」 | **plain-explain** | [workflows/plain-explain.md](workflows/plain-explain.md) | 產物是**文字**；讀者只要「讀懂」 |
| 「把這個知識面向做成可操作、可回饋的互動網站」 | **interactive-study-site** | [workflows/interactive-study-site/README.md](workflows/interactive-study-site/README.md) | 產物是**可操作的網站**；讀者要「動手做出來」 |
| 「把陌生技術主題做成繁中為主、名詞有英文對照、可拆頁且能從零開始的互動課程」 | **foundations-first** | [workflows/interactive-study-site/FOUNDATIONS-FIRST.md](workflows/interactive-study-site/FOUNDATIONS-FIRST.md) | study-site 的零基礎剖面 |
| 「在零基礎課程上加硬體／物理的回路、能量、公式與儀器量測」 | **principles-first（硬體子工作流）** | [workflows/interactive-study-site/PRINCIPLES-FIRST.md](workflows/interactive-study-site/PRINCIPLES-FIRST.md) | 疊在 foundations-first 之上 |
| 「這門課的講解太薄」「幫既有的課加厚文字（不動互動與版面）」 | **enrich-existing** | [workflows/interactive-study-site/ENRICH-EXISTING.md](workflows/interactive-study-site/ENRICH-EXISTING.md) | 網站**已存在且互動能動**，只改文字 |
| 「把課綱式科目的筆記從零建成互動課」「頂層指揮工人分層省 token」 | **build-with-agents** | [workflows/interactive-study-site/BUILD-WITH-AGENTS.md](workflows/interactive-study-site/BUILD-WITH-AGENTS.md) | 多執行者建課產線（原 build-with-codex；codex 細節在 `build-with-agents/codex-notes.md`）|
| 「把做好的課掛上去給人看」 | **publish** | [workflows/interactive-study-site/GITHUB-PAGES.md](workflows/interactive-study-site/GITHUB-PAGES.md) | 內容已驗收完；只處理**發布**，不改內容 |

例：「幫我讀懂資料庫索引」——只要自己看懂 → digest；要寫成別人也讀得懂的講解 → plain-explain；要做成能改參數看結果的課 → interactive-study-site。plain-explain 的產物可直接當課程內容來源。

### 定期喚醒 flavor

定期工作流是可選的；未登記任何項目時不執行。需要週期喚醒時依 [wf-tick 指令規格](../.claude/commands/wf-tick.md) 啟動循環；也可由使用者直接要求單次執行。

| 觸發（你說…）| 工作流 | 入口檔（先讀這個）|
|--------------|--------|-------------------|
| 「跑一次心跳」（多半由排程／循環引擎定期喚醒）| **tick** | [workflows/tick.md](workflows/tick.md) |
| 「幫我加個常規事務」「每 N 天要做一次…」 | **routines** | [workflows/routines.md](workflows/routines.md) |
| 「幫我登記行程：17:00 做 X」「今晚 8 點提醒我 OO」 | **schedule** | [workflows/schedule.md](workflows/schedule.md) |

### multi-agent flavor

| 觸發（你說…）| 工作流 | 入口檔（先讀這個）|
|--------------|--------|-------------------|
| 「看看信箱」「處理 inbox」 | **inbox（收信）** | [workflows/inbox/README.md](workflows/inbox/README.md) |
| 「寄信給 X」「請別資料夾的 agent 做 Y」「回報做完了 / 卡住了」 | **inbox（寄信）** | [workflows/inbox/README.md](workflows/inbox/README.md) |
| 「我要用螢幕 / 鍵鼠 / 那台裝置」「誰在佔著資源」 | **resources** | [workflows/resources.md](workflows/resources.md) |
| 「把這件事切成幾條線派出去」「寫交接書」「收線」 | **dispatch** | [workflows/dispatch/README.md](workflows/dispatch/README.md) |
| 「要開團隊」「這層派哪級模型」「怎麼分角色」 | **team-model** | [workflows/team-model.md](workflows/team-model.md) |
<!-- wf-insert:WORKFLOWS -->

### kernel 內建（不分 flavor）

| 觸發（你說…）| 工作流 | 入口檔（先讀這個）|
|--------------|--------|-------------------|
| 「記 / 查踩坑」 | **gotchas** | [workflows/common/gotchas.md](workflows/common/gotchas.md) |
| 「整理 X」「封存過時的」「檔案太多／太雜」「太大要拆」 | **tidy** | [workflows/tidy/README.md](workflows/tidy/README.md) |
| 「記個想法」「以後要做」「排進 roadmap」「幫我規劃」 | **planning** | [workflows/planning.md](workflows/planning.md) |
| 「記個決定」「為什麼選 A 不選 B」 | **decisions** | [workflows/decisions.md](workflows/decisions.md) |
| 「我的偏好是…」「以後直接做 / 先問」 | **user** | [workflows/common/user.md](workflows/common/user.md) |

**都不符 → 看 [INDEX.md](INDEX.md)**。新開工作流 → 複製 [workflows/TEMPLATE.workflow.md](workflows/TEMPLATE.workflow.md) 並在上表加一列。

## 統一形式

工作流入口檔的固定段落、`Done when:` 的三類可觀察條件、單檔型／資料夾型與四級成長，都以 [STRUCTURE.md](STRUCTURE.md) 為唯一出處，本檔不重述。

## 活狀態記哪裡（只列 open，完成即刪）

| 在等誰 | 記哪裡 |
|--------|--------|
| 等**使用者**親自做 / 驗證 / 決定 | [WAIT_USER.md](WAIT_USER.md) |
| 等**同 repo 另一個 session / fork** | [SESSION-LOG.md](SESSION-LOG.md) 一行 open |
| 等**別資料夾的 agent** | 信件軸：`wf/inbox/`（頂層＝未處理、`done/`＝已處理），使用方式見 [workflows/inbox/](workflows/inbox/README.md) |

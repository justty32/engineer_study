# planning — 想法成熟管線（idea → roadmap → 詳規 → 執行）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

從萌芽到動工的四階段收在**同一條管線**，不拆成四個工作流——免得卡在「這算 idea 還是 roadmap」。本專案沒有程式碼，所有「詳規」都是非開發的：學習計畫、互動課程的 BUILD-SPEC、整理計畫。

**何時用**：使用者說「記個想法」「以後要做」「排進 roadmap」「幫我規劃」；或 agent 依 [roadmap.md](../../roadmap.md) 的擴充規範想**主動提建議**（先記一列，不直接動手）。
**何時不用**：三兩步的小事直接做；已有計畫且在動工 → 照該計畫做，進度記 [SESSION-LOG](../SESSION-LOG.md)；問的是「選哪個」→ [decide](decide.md)。

## Done when

- idea / roadmap：下方對應表多一列，或既有列的狀態欄更新。
- 詳規：計畫檔存在且有「目標 / 不做什麼 / 步驟表 / 收尾」四段（學習計畫＝該領域 `學習計畫.md` 有階段表；互動課＝該課 `BUILD-SPEC.md` 照 [TEMPLATE.build-spec](interactive-study-site/TEMPLATE.build-spec.md) 填滿）；執行完的計畫移該處 `archive/`。

## 階段

| 階段 | 回答的問題 | 落點 |
|------|-----------|------|
| **idea** | 要不要做？ | 下方「想法」表，一列一句 |
| **roadmap** | 會做，何時？ | 下方「roadmap」表；擴充的**規則**（共用基礎抽出、知識點延伸、段落擴充、extra 整合、專題式學習）在根 [roadmap.md](../../roadmap.md)，不重述 |
| **詳規** | 怎麼做？ | 領域學習計畫 → `<領域>/學習計畫.md`；互動課程 → 該課 `BUILD-SPEC.md`（[interactive-study-site](interactive-study-site/README.md)）；其他非開發計畫 → [plan-a-thing](plan-a-thing.md) |
| **執行** | — | 照計畫動手：筆記走 [learn](learn.md)／[write](write.md)，課程走 interactive-study-site；進行中寫 [SESSION-LOG](../SESSION-LOG.md) 一行，要使用者親自做的寫 [WAIT_USER](../WAIT_USER.md) |

## 想法（要不要做）

| 想法 | 一句話 | 狀態（想想 / 會做→搬進 roadmap / 不做＋原因）|
|------|--------|--------------------------------------------|
| 微處理機與匯流排互動課掛站 | 課已建好（14 章，2026-08-28），尚未登記進 `pages.yml` 與中央入口 | 想想（等實機驗收清單消化一批再掛，避免待驗項再堆）|

## roadmap（會做，何時）

| 事項 | 何時 / 順序 | 前提條件 |
|------|------------|---------|
| 補齊七份中英名詞對照表缺詞並統一庫倫／庫侖用語 | 使用者點頭啟動後一次做完 | 清單與「刻意保留誤寫勿誤刪」見 [wait-user/對照表缺詞](../wait-user/對照表缺詞.md) |

## 交接

- 決定「為什麼選 A 不選 B」 → [decisions](decisions.md)。卡在使用者 → [WAIT_USER](../WAIT_USER.md) 一行；跨 session → [SESSION-LOG](../SESSION-LOG.md) 一行。
- 大規模搬移、重命名或重整在 idea 階段就先問使用者（鐵律 3），得到同意才進 roadmap。

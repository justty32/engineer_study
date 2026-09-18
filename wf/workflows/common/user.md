# user — 使用者偏好與確認邊界

[common/README](README.md)｜擁有者背景（影響筆記深度）見 [PROJECT-GUIDE](../../PROJECT-GUIDE.md)

agent 不用重猜的事。always-on 鐵律在 AGENTS.md，這裡是**這位使用者**的偏好——改了改這裡，不改鐵律。

| 項目 | 設定 |
|------|------|
| 語言 | 回覆與文件一律繁中（台灣用字：庫侖、摺積、混疊）；名詞首次出現附英文；程式碼與指令保留原文 |
| 分支慣例 | 直接 commit `main`，不開 PR；commit 時機由使用者決定，訊息一行講清楚動了哪條線；**不 push**（鐵律 3） |
| 直接做、不用問 | 新增／修改筆記、補對照表詞條、加課程頁或加厚課程文字、更新 `wf/` 文檔與活狀態、唯讀指令、lint、headless 瀏覽器驗證 |
| 一定先問 | 大規模搬移／重命名／重整、刪筆記檔、push、新增依賴或安裝工具、改 `pages.yml` 以外的 CI 設定、推翻已定裁決（[decisions](../decisions.md)） |
| 回覆風格 | 通用風格見 [reply-style.md](reply-style.md)；這位使用者的例外：不要每段都 bullet；問「要不要」時附**可執行判準**（門檻數字，見下表）與後果，讓他能改數字 |
| 時區 | Asia/Taipei（日期一律 `YYYY-MM-DD`） |

## 本專案已定的門檻數字（問「要不要」時直接引用）

| 判準 | 數字 | 出處 |
|------|------|------|
| 單科對照表併入共用檔／獨立成檔 | < 100 行併、≥ 100 行獨立 | [PROJECT-GUIDE](../../PROJECT-GUIDE.md) |
| 共用對照表切編號分檔 | > 500 行 | [PROJECT-GUIDE](../../PROJECT-GUIDE.md) |
| 學習筆記拆檔檢視 | > 500 行 | [PROJECT-GUIDE](../../PROJECT-GUIDE.md) |
| 工作流文檔拆檔 | > 8192 bytes | [STRUCTURE](../../STRUCTURE.md) |
| 同質記錄表抽資料檔 | > 1 KB | [data-files](data-files.md) |

領域詞彙常猜錯 → 開 `glossary.md`（見 [common/README](README.md)）；本專案的名詞對照以各領域 `中英名詞對照表.md` 為準。

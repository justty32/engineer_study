# common — 跨工作流共享（入口）

[INDEX](../../INDEX.md)｜[WORKFLOWS](../../WORKFLOWS.md)

不專屬任一工作流、各工作流共用的東西。這是本區的**入口**。

<!-- wf-nav -->
| 路徑 | 內容 | 來源 |
|------|------|------|
| [gotchas.md](gotchas.md) | 共通踩坑（門檻：第二次撞到才記）| kernel |
| [user.md](user.md) | 使用者偏好、確認邊界、分支慣例、本專案已定的門檻數字 | kernel（project-owned）|
| `glossary.md`（長出來才建）| 領域詞彙：`詞 \| 意思 \| 別名`；本專案以各領域 `中英名詞對照表.md` 為準，agent 常猜錯的跨領域詞才建 | kernel |
| [data-files.md](data-files.md) | 資料檔契約 `wf-table/1`：給 AI 消化的條列 >1 KB 抽 `.json`／`.csv`、`tabledb.py` 讀寫；給人導航的連結表留 md | kernel |
| [data-files-fmt.md](data-files-fmt.md) | json 值裡跨層路徑用 `$fmt` 代號展開，省 `../../../` | kernel |
| [writing.md](writing.md) | 本筆記庫的共用寫作風格：兩種段落模式、AI 味自檢、標點條款 | knowledge 包（project-owned）|
| [../tidy/README.md](../tidy/README.md) | 整理工作流：封存、拆檔、抽資料檔（不在 common/，但各工作流都會用到）| kernel |
<!-- wf-insert:COMMON -->

> 過時的共通文件封存進 `common/archive/`（規則見 [STRUCTURE](../../STRUCTURE.md)）。

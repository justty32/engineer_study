# 工作流上游來源與同步政策

← [INDEX](INDEX.md)｜[專案規範](PROJECT-GUIDE.md)

本專案的分層工作流源自通用模板 `workflows`，採其「非侵入式導入」概念：repo 根只留薄入口，其餘集中於 `wf/`。必要說明已完整保存在本檔，不依賴 repo 外連結。

## 本機上游

- 上游工作目錄：`C:/code/mine/workflows`
- 上游入口：`C:/code/mine/workflows/README.md`
- 非侵入式說明：`C:/code/mine/workflows/non-invasive-import.md`
- 使用的 flavor：`C:/code/mine/workflows/flavors/knowledge/`

上述絕對路徑只記錄這台機器上的來源，不是執行期依賴。其他機器 clone 本 repo 後，應以版控內的 `wf/` 本地快照為準。

## 同步政策

- 不使用 symlink、junction 或執行期 include；避免工作流離開原機器就失效。
- 不整包覆寫 `wf/`；本專案已有 `PROJECT-GUIDE.md` 與自訂工作流。
- 要吸收上游更新時，先人工比較，再選擇性移植；專案規則優先於通用模板。
- 本專案新增的 `interactive-study-site` 與原理優先剖面不回寫共享上游，除非使用者另行要求。

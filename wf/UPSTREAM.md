# UPSTREAM — 工作流上游來源與同步政策

[INDEX](INDEX.md)｜[專案規範](PROJECT-GUIDE.md)｜結構 [STRUCTURE](STRUCTURE.md)

本專案的分層工作流源自通用模板 repo `workflows`，採其**非侵入式導入**：專案根只留 `AGENTS.md`、`CLAUDE.md`、`.claude/commands/`，其餘全收在 `wf/`。必要說明已完整保存在本檔，不依賴 repo 外連結。

## 本機上游與版本

| 項目 | 值 |
|------|----|
| 上游工作目錄 | `/home/lorkhan/repo/workflows` |
| 上游入口 | `/home/lorkhan/repo/workflows/README.md`；導入流程 `IMPORT.md`；變動記錄 `CHANGELOG.md` |
| 非侵入式說明 | `/home/lorkhan/repo/workflows/docs/non-invasive-import.md` |
| 本專案 kernel 版本 | **v0.6 (2026-09-02)**——版本戳在 `AGENTS.md` 尾端 `<!-- wf-kernel v0.6 (2026-09-02) -->`；`grep wf-kernel AGENTS.md` 可查。v0.5.1 的 `tools/` 拆檔修正已跟（`wf-lint*.sh` 三特徵齊）。**`skills/` 已裝**於 `wf/skills/`（`.claude/skills/` 逐支轉址）：effective-html 六支 html／design-artifact／html-wireframe／html-prototype／html-plan／html-diagram（MIT，`wf/skills/LICENSES/`）＋上游自有 markdown-html-slides（CC0）；html-slides-shared-assets、`external/` 未裝 |
| 使用的 flavor | **knowledge**＋**teaching**（以本專案版 `workflows/interactive-study-site/` 為主，只吸回上游新增）＋**heartbeat**＋**multi-agent** |

上述絕對路徑只記錄這台機器上的來源，不是執行期依賴。其他機器 clone 本 repo 後，以版控內的 `wf/` 本地快照為準。

## kernel-owned vs project-owned

**kernel-owned**（無佔位、可從上游新版整檔覆蓋，覆蓋後跑 lint）：`STRUCTURE.md`、`workflows/TEMPLATE.workflow.md`、`workflows/TEMPLATE.handoff.md`、`workflows/common/data-files.md`、`workflows/common/data-files-fmt.md`、`workflows/common/reply-style.md`、`workflows/tidy/`（整夾）、根 `.claude/commands/wf-lint.md`、`tools/wf-lint.sh`＋`tools/wf-lint-checks.sh`、`tools/*.py`、`tools/fmt-vars.json`、`tools/inbox_*.sh`、`tools/notify_watch.sh`、`tools/test_inbox.sh`、`workflows/inbox/PROTOCOL.md`、`workflows/inbox/wake-policy.md`、`workflows/dispatch/driving-cli-agents.md`、`workflows/dispatch/lessons.md`、`workflows/team-model.md` 入口與分頁骨架、teaching 的 `TEMPLATE.*`、`plain-explain.md`。

**project-owned**（填過佔位、貼過片段、含本專案事實；讀上游 `CHANGELOG.md` 該版那幾行人工套）：`AGENTS.md`、`INDEX.md`、`WORKFLOWS.md`、`SESSION-LOG.md`、`WAIT_USER.md`＋`wait-user/`、`PROJECT-GUIDE.md`、本檔、`workflows/common/{user,gotchas,README,writing}.md`、`workflows/{planning,decisions,routines,schedule}.md`＋`decisions.json`、`workflows/inbox/{README,ROSTER}.md`、`workflows/resources.md`、`workflows/dispatch/README.md` 活狀態表、`team-model/` 三張分級／速度／心得表、`workflows/interactive-study-site/` 整夾（本專案自有的 teaching 實作）。

專案自加的 `$fmt` 變數放 `tools/fmt-vars.local.json`（project-owned），不改 `fmt-vars.json`。

## 與上游標準佈局的偏離（刻意，升級時保留）

- **`inbox/` 與 `tools/` 都留在 `wf/` 內**（上游非侵入式標準是 `inbox/` 放專案根）。inbox 腳本的 root 由 `WF_INBOX_ROOT` 或 `<script>/../inbox` 推導，所以 `wf/tools/inbox_*.sh` 自然指到 `wf/inbox/`；外部 agent 投遞時路徑寫 `<專案根>/wf/inbox/`。
- **teaching flavor 用本專案版**：`workflows/interactive-study-site/` 是上游 `flavors/teaching/workflows/study-site/` 的來源專案，內容比上游多（codex 產線、硬體原理剖面、樣式正本閘門）；升級時只逐段吸回上游新增，不整包覆蓋。
- `PROJECT-GUIDE.md` 與 `wait-user/` 是本專案自有，上游沒有對應檔。

另兩點裁定（2026-09-18，見 [decisions](workflows/decisions.json)）：

- **lint 範圍另包一層 `wf/tools/lint.sh`（project-owned）**：`wf-lint.sh` 整庫 `--strict` 會誤報大量 `BIGLIST`（筆記正文與名詞對照表），已裁定視為誤報；正式驗收改跑 `lint.sh`（範圍：`wf/`＋根入口 strict，整庫只看 `BROKEN`）。
- **本專案一開始即採 inbox 五通道佈局**：`PROTOCOL.md`「未升級前不要預建五通道」的漸進式建議對本專案不適用，直接採五通道，不經過單通道過渡期。

## 同步政策

- 不使用 symlink、junction 或執行期 include；工作流離開原機器也不失效。
- 不整包覆寫 `wf/`；只按上節分類逐檔升級。升級後跑 `bash wf/tools/wf-lint.sh --strict wf`，並確認佔位符與模板段殘留為 0（lint 的 residue 三項）。
- 專案規則優先於通用模板：衝突時以 `PROJECT-GUIDE.md` 與 [decisions](workflows/decisions.md) 為準。
- **雙向同步由人工決定**：上游已回抽本專案的 study-site 做法成 teaching flavor；本專案再長出的通用做法要不要回寫上游、上游新做法要不要吸回來，都由使用者逐案決定，agent 不自行同步。

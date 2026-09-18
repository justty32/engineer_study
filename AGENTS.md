# engineer_study — AI agent 專案備忘

engineer_study = **以大學課綱為骨架的跨領域工程學習筆記庫（繁中純文字筆記＋互動課程網站）**。本檔是最頂層路由器，只指向下一層；細節不寫這裡（分層原則見 [wf/STRUCTURE.md](wf/STRUCTURE.md)）。

## 開場與入口

- 每個 session 先跑 `grep -c '^- \[' wf/SESSION-LOG.md` 與 `grep -c '^| .* | [1-9]' wf/WAIT_USER.md`：非 0 才開 [wf/SESSION-LOG.md](wf/SESSION-LOG.md)（進度）/ [wf/WAIT_USER.md](wf/WAIT_USER.md)（等使用者）；再跑 `bash wf/tools/inbox_read.sh` 與 `bash wf/tools/inbox_read.sh wf/inbox/new`（頂層與 `new/` 都是上呈格；沒信就靜默），有信先讀（見 [inbox](wf/workflows/inbox/README.md)）。
- **動手前先讀** [wf/PROJECT-GUIDE.md](wf/PROJECT-GUIDE.md)（硬性要求、擁有者背景、內容模型）。
- **要你動手做事** → [wf/WORKFLOWS.md](wf/WORKFLOWS.md) 依意圖派發，再讀該工作流入口檔。
- **想看專案結構** → [wf/INDEX.md](wf/INDEX.md)；大型擴充另參考 [roadmap.md](roadmap.md)。
- 使用者偏好與確認邊界 → [wf/workflows/common/user.md](wf/workflows/common/user.md)。
- 多 agent 協作：派哪級模型 → [team-model](wf/workflows/team-model.md)；派線／收線 → [dispatch](wf/workflows/dispatch/README.md)。

## 鐵律（always-on，隨時適用）

1. 筆記一律**繁體中文、UTF-8**、純文字為主：不抓取或生成圖片；公式可用 LaTeX。
2. 整理或改寫**不改原意**；驗收＝`bash wf/tools/wf-lint.sh wf`（Claude Code 可用 `/wf-lint`）＋內容／連結／UTF-8 檢查，並對照該工作流的 `Done when:`。
3. **不可逆或對外的動作**（push、刪除、大規模搬移或重命名、新增依賴）要有**授權來源**：使用者當場確認，或他親自登記在清單裡。都沒有就先問；未經明確要求不 push、不開範圍外的新工作。
4. **條列走資料檔、導航留 md**：給 AI 消化的表／清單 >1 KB 存 `.json`／`.csv`（契約 `wf-table/1`，見 [data-files](wf/workflows/common/data-files.md)），用 `wf/tools/tabledb.py` 讀寫、不整份讀進 context；給人點的導航連結留 md。
5. **具體流程**在各工作流入口檔，不在頂層。

<!-- wf-kernel v0.6 (2026-09-02) -->

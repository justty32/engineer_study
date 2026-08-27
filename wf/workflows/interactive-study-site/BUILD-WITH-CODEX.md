# build-with-codex — opus 指揮 codex 的建課產線

← [工作流入口](README.md)｜[零基礎課程](FOUNDATIONS-FIRST.md)｜[品質關卡](QUALITY-GATES.md)｜[codex 加厚子工作流](ENRICH-EXISTING.md)｜[agent 編組](AGENT-TEAM.md)

從零把一門課綱式科目建成互動網頁課，且把 token 成本分層到最便宜的執行者。與 [ENRICH-EXISTING](ENRICH-EXISTING.md)（只加厚既有課）互補；codex 呼叫方式、編碼地雷與驗收指令與該檔共用。2026-08-27 以「工程數學先修」（`共通基礎/數學/互動課程/`，slug `engineering-math`）試點定型，供電機等課綱科目量產沿用。

## Token 階梯（鐵律）

| 層 | 執行者 | 只做 | 不做 |
|----|--------|------|------|
| 1 | **Lead**（頂層主模型，貴） | 頂層決策、審規格、裁決上報、純字串修正（sed 級） | 不讀 codex 原始輸出、不讀 inbox 原文、不寫產品檔 |
| 2 | **建置指揮官**（opus agent） | 派 codex、驗證裁決、親手寫 `app.js`、代管 `wf/inbox/`、對 Lead 濃縮匯報 | 不寫章節 HTML |
| 3 | **雜工**（sonnet 子 agent，指揮官開） | 唯讀掃描：id 契約比對、LaTeX／外部資源／編碼掃描、行數統計、信件初讀摘要 | 無寫入權 |
| 4 | **codex CLI**（預設模型，額度大） | 全部章節 HTML 內容生成、focused 修正 pass | 不碰 app.js／styles.css／index 之外的檔 |

原文不上行：每層只向上交摘要。判斷權留 opus，寫入權集中（每檔單一作者）。

## 流程

1. **架構師**（opus agent）：讀來源筆記＋範本課，寫 `PROJECT-BRIEF.md` ＋ `BUILD-SPEC.md`。BUILD-SPEC 必須把每頁 widget 的 id/type/min/max/step/value、select value 順序、計算式、判準與數值實例**全部鎖死**（codex 照抄即零缺陷的前提），並附逐章行號表供下游 sed 抽節。Lead 審核後放行。
2. **建置指揮官**（opus agent）啟動：
   - codex 分包建 HTML（一波最多 2 job，`codex exec --sandbox workspace-write --cd <repo根> - < prompt檔`，prompt 用「指路」不內嵌；大檔生成有長靜默屬正常，勿設短超時）。
   - 同時親手寫 `app.js`（唯一依據 BUILD-SPEC；確定性、無 `Math.random`/`Date`、末端掛勾加 `typeof document!=="undefined"` 守衛），`node --check` ＋假 DOM 驅動驗算規格數值組。
   - `styles.css` 直接 `cp` 既有課的（位元組相同可驗）。
   - 每包收件即驗：檔案齊全與行數、id 契約逐一比對、LaTeX 分隔符 0、外部資源 0（僅允許回主站連結）、UTF-8 無 BOM 且 U+FFFD／U+0080–009F／U+E000–F8FF＝0、pager 相連、相對連結存在。缺陷→focused codex 修正 pass；編碼壞損→`git checkout` 還原重跑。
3. **獨立驗收員**（opus agent，未參與建置，唯一寫入 `驗收紀錄.md`）：不信任 builder 自報全部重驗，外加——內容正確性抽章（對照來源筆記親手重算數值）、widget 邊界抽測（NaN 不得洩漏）、**字元級錯字掃描**（簡體字、形近錯字如「收斂→收旂」；codex 生成會出這類錯，機械掃描抓不到，要 grep 高頻術語）、**拆檔量測**（固定項：各檔行數與位元組，超標列報告由 Lead 決定，參考線 HTML 1000 行、app.js 2000 行、spec 類 md 1200 行）、有 Playwright 就跑桌面 `1440×900` ＋手機 `390×844` 全頁載入。**注意規格本身也要抽驗：builder 照抄規格，規格的算術錯會原樣進產品。**
4. **Lead 收尾**：裁決驗收上報、純字串修正自己 sed（快且零下放成本）、掛站接線（`pages.yml` 三處＋主站入口＋來源 README，可回派指揮官）、SESSION-LOG／WAIT_USER、詢問使用者 commit。

## 試點踩過的雷（量產前必讀）

- **codex 寫檔是 LF**；Git Bash 的 `sed -i` 會把 CRLF 剝成 LF。工作區慣例 CRLF：收尾用 python 位元組級 `\r\n` 正規化課程目錄，別靠 sed／universal newline。**例外：從既有課 `cp` 來、且驗收靠「位元組相同」比對的檔（如 styles.css）不得轉**，轉了反而違規。
- 規格數值要獨立驗算：試點中 BUILD-SPEC 兩處算術筆誤被 builder 忠實照抄進正文，靠驗收員親手重算才抓到。
- codex 內容層錯字（收旂×35、簡體字）全部逃過 id／編碼／LaTeX 機械掃描——字元級錯字掃描是必要關卡。
- 各包字數門檻要一開始就統一，否則前後包厚薄不均，得追加加厚 pass（加厚後要位元組級比對 widget 區塊未被動到）。
- 其餘（`-m` 限制、PowerShell 寫檔亂碼、watchdog 門檻、pipe exit code 不可信）見 [ENRICH-EXISTING](ENRICH-EXISTING.md)。

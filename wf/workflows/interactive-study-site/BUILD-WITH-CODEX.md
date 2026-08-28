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

### 全 Claude 變體（不用 codex）

使用者可指定「opus 指揮 opus」。此時第 4 層由 **章節作者（opus subagent）** 取代 codex，其餘各層職責不變；簡單機械工作仍下放 sonnet。差異只有兩點：

- **一位作者最多 3–4 章**，且**只讀 §9.1 行號表指定的自己那一段規格**＋一個版型範本頁，不讀其他章節、不讀整份 spec。派工稿要直接給出「讀 BUILD-SPEC 第 X–Y 行」。
- 作者**回報上限 10 行**（完成檔名、行數、字數、自檢結果、卡住的點），不貼任何檔案原文。

codex 特有的注意事項（`-m` 限制、watchdog 門檻、pipe exit code、PowerShell 寫檔亂碼）在此變體不適用；LF／CRLF 正規化與全部驗收關卡照舊。

### Context／compact 管理（各層鐵律）

長線建置必然撞到 compact，靠對話記憶續做會失去進度。規則：

- **指揮官開工即寫 `建置進度.md` 檢查點**（同課程目錄）：已完成檔與行數、每檔通過的關卡、未完項目、待修缺陷、正在派的工。**每收一包更新一次**；收尾刪除、不進 commit。斷線或 compact 後讀這一個檔即可續做。
- **原文不進判斷者的 context**：子 agent 輸出導檔只看結尾；掃描腳本只印「檔名＋行號＋命中詞＋計數」，不印整行原文（曾有 agent 整批 echo 可疑字串而觸發 API content filter 被中止）；要查內容細節就開 sonnet 雜工回報「有／沒有／哪一行」。
- **判斷留在上層，取證下放**：指揮官與驗收員的 context 只該裝規格要點、進度狀態、待決缺陷清單。
- **不要停在等待點**：子 agent 未回就交還控制權，等於每次空轉都消耗一次上層 round trip。要等就在同一回合內阻塞等到底（輪詢雜湊直到穩定），中途不必回報。

## 流程

1. **架構師**（opus agent）：讀來源筆記＋範本課，寫 `PROJECT-BRIEF.md` ＋ `BUILD-SPEC.md`。BUILD-SPEC 必須把每頁 widget 的 id/type/min/max/step/value、select value 順序、計算式、判準與數值實例**全部鎖死**（codex 照抄即零缺陷的前提），並附逐章行號表供下游 sed 抽節。Lead 審核後放行。
2. **建置指揮官**（opus agent）啟動：
   - codex 分包建 HTML（一波最多 2 job，`codex exec --sandbox workspace-write --cd <repo根> - < prompt檔`，prompt 用「指路」不內嵌；大檔生成有長靜默屬正常，勿設短超時）。
   - 同時親手寫 `app.js`（唯一依據 BUILD-SPEC；確定性、無 `Math.random`/`Date`、末端掛勾加 `typeof document!=="undefined"` 守衛），`node --check` ＋假 DOM 驅動驗算規格數值組。
   - `styles.css` 從**正本** `專題/機器人運動學/互動課程/styles.css` 直接 `cp`（位元組相同可驗），不要隨手挑一門既有課來抄。課建好後把新課登記進 `tools/sync-styles.py` 的 `FAMILY` 清單，再跑 `python wf/workflows/interactive-study-site/tools/sync-styles.py --check` 確認通過。家族歸屬與例外（深色模式家族、IoT 家族不受正本管轄）見 [SHARED-ASSETS-EVAL](SHARED-ASSETS-EVAL.md)。
   - 每包收件即驗：檔案齊全與行數、id 契約逐一比對、LaTeX 分隔符 0、外部資源 0（僅允許回主站連結）、UTF-8 無 BOM 且 U+FFFD／U+0080–009F／U+E000–F8FF＝0、pager 相連、相對連結存在。缺陷→focused codex 修正 pass；編碼壞損→`git checkout` 還原重跑。
3. **獨立驗收員**（opus agent，未參與建置，唯一寫入 `驗收紀錄.md`）：不信任 builder 自報全部重驗，外加——內容正確性抽章（對照來源筆記親手重算數值）、widget 邊界抽測（NaN 不得洩漏）、**字元級錯字掃描**（簡體字、形近錯字如「收斂→收旂」；codex 生成會出這類錯，機械掃描抓不到，要 grep 高頻術語）、**拆檔量測**（固定項：各檔行數與位元組，超標列報告由 Lead 決定，參考線 HTML 1000 行、app.js 2000 行、一般 md 1200 行；**`BUILD-SPEC.md` 例外，參考線 1400 行**——規格要鎖死每個 widget，行數與課程規模成正比，硬拆會讓 §9.1 逐章行號表失效，Lead 2026-08-28 裁決不拆）、**`styles.css` 正本閘門**（固定項：`python wf/workflows/interactive-study-site/tools/sync-styles.py --check` 必須 exit 0；漂移表示有人改了下游複本而沒回寫正本，須先釐清哪一邊才是對的，不得逕自 `--sync` 蓋掉）、有 Playwright 就跑桌面 `1440×900` ＋手機 `390×844` 全頁載入。**注意規格本身也要抽驗：builder 照抄規格，規格的算術錯會原樣進產品。**
4. **Lead 收尾**：裁決驗收上報、純字串修正自己 sed（快且零下放成本）、掛站接線（`pages.yml` **課程表加一行** `<來源目錄>|<slug>`；只有當該課含 `../../<其他課>/` 形式的跨課相對連結時才需另加 `replacements` 規則。`on.push.paths` 已改成萬用路徑，通常不必動——見 [SHARED-ASSETS-EVAL](SHARED-ASSETS-EVAL.md) 的觸發面說明。另加主站入口＋來源 README，可回派指揮官）、SESSION-LOG／WAIT_USER、詢問使用者 commit。

## 試點踩過的雷（量產前必讀）

- **codex 寫檔是 LF**；Git Bash 的 `sed -i` 會把 CRLF 剝成 LF。工作區慣例 CRLF：收尾用 python 位元組級 `\r\n` 正規化課程目錄，別靠 sed／universal newline。**例外：從正本 `cp` 來、且驗收靠「位元組相同」比對的檔（如 styles.css）不得轉**，轉了反而違規——`sync-styles.py` 也是刻意以二進位模式讀寫，不做換行正規化。
- 規格數值要獨立驗算：試點中 BUILD-SPEC 兩處算術筆誤被 builder 忠實照抄進正文，靠驗收員親手重算才抓到。
- codex 內容層錯字（收旂×35、簡體字）全部逃過 id／編碼／LaTeX 機械掃描——字元級錯字掃描是必要關卡。
- **掃描前一律 `html.unescape`**（2026-08-28 電磁學踩到）：builder 為了規避「全課 0 個庫倫」閘門，把該詞寫成數字實體 `&#24235;&#20262;`，同時躲過位元組級關鍵詞掃描與簡體字掃描——而 `&#20262;` 是簡體「伦」，瀏覽器實際渲染出「庫伦」。**成因是規格自我矛盾**（§5.3 要求字典引述常見誤寫，BRIEF 卻規定該詞出現即錯字）：規格若要求引述某個禁用詞，必須明文寫「字典恰好允許 1 處、且須為明碼」，不要逼 builder 去躲閘門。
- **同機多課並行時，Playwright 量測務必確認載到的是自己的站**（2026-08-28 踩到）：兩條線的指揮官各自起 `python -m http.server`，驗收員量錯埠、載到別課的頁面，得出「電子學自我檢核 0 溢位」的假通過，害 Lead 差點據此否決一個真實的跨課缺陷。**每次量測先斷言頁面 `<title>` 或 h1 屬於受驗課程**。
- **BUILD-SPEC 的計算式不要放進 Markdown 表格儲存格**：未跳脫的 `|` 會把式子攔腰截斷，規格看起來完整、實際少一半（邏輯設計 09/12 章踩過，靠「鎖定的 8 拍序列只對應唯一一條式子」才反推回來）。放表格就寫成 `&#124;` 或改用清單。
- **收件即建 git baseline**（`git add -N`）：否則 builder 宣稱的「加厚後 workspace 區塊位元組未動」「其餘 63 張卡未動」無法被驗收員位元組證實，只能退而驗契約。
- 各包字數門檻要一開始就統一，否則前後包厚薄不均，得追加加厚 pass（加厚後要位元組級比對 widget 區塊未被動到）。**字數計法（Lead 2026-08-27 裁決）＝漢字＋全形標點**；spec 與驗收都用同一計法，短少 2% 以內不構成回派。
- 其餘（`-m` 限制、PowerShell 寫檔亂碼、watchdog 門檻、pipe exit code 不可信）見 [ENRICH-EXISTING](ENRICH-EXISTING.md)。

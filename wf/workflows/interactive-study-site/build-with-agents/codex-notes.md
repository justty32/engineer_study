# codex-notes — 本專案建課產線的固定項與 codex CLI 細節

[build-with-agents](../BUILD-WITH-AGENTS.md)｜[ENRICH-EXISTING](../ENRICH-EXISTING.md)｜[GITHUB-PAGES](../GITHUB-PAGES.md)｜裁決紀錄 [decisions](../../decisions.md)

通用產線在 [BUILD-WITH-AGENTS](../BUILD-WITH-AGENTS.md)；本檔只放**本專案才有的固定項**（換行、樣式正本、掃描項、參考線、計字法）與**用 codex CLI 當章節作者時**的注意事項。以 Claude 子 agent 當作者（目前預設）時，第一節照用、第二節不適用。

## 一、本專案固定項（不管作者是誰）

### 換行與編碼

- 工作區慣例 **CRLF**；作者（codex 或子 agent）寫檔多半是 LF，Git Bash 的 `sed -i` 也會把 CRLF 剝成 LF。收尾用 python **位元組級**把課程目錄的 `\n` 正規化成 `\r\n`，別靠 sed／universal newline。
- **例外：從正本 `cp` 來、靠「位元組相同」驗收的檔（`styles.css`）不得轉**，轉了反而違規。`sync-styles.py` 也刻意以二進位模式讀寫。
- 每頁 UTF-8 無 BOM，`<html lang="zh-Hant">`；U+FFFD／U+0080–009F／U+E000–F8FF 必須為 0。**嚴禁用 PowerShell 寫檔**（`Set-Content`／`Out-File`／`>` 都會產生編碼壞損）。

### `styles.css` 正本與閘門

- 正本：`專題/機器人運動學/互動課程/styles.css`。新課直接 `cp`，不要隨手挑一門既有課來抄，也不自己寫。
- 課建好後把新課登記進 `tools/sync-styles.py` 的 `FAMILY` 清單，再跑 `python wf/workflows/interactive-study-site/tools/sync-styles.py --check` 必須 exit 0。漂移表示有人改了下游複本而沒回寫正本，須先釐清哪一邊才是對的，**不得逕自 `--sync` 蓋掉**。
- 只有 A 家族（課綱課）受正本管轄；深色模式家族（逆向工程、網路協定）與 IoT 家族＋電力系統各自客製、凍結現狀。為什麼不抽 JS、不部署時共用 → [decisions](../../decisions.md)。
- 改樣式的流程：改正本 → `--sync` → 一個 commit 掃過 A 家族 → 抽 2 門課做桌機／手機視覺回歸。

### 收件即驗的固定掃描項

檔案齊全與行數、id 契約逐一比對、LaTeX 分隔符 0、外部資源 0（僅允許回主站 `https://justty32.github.io/engineer_study/` 的連結）、UTF-8 無 BOM 且上述碼位為 0、pager 相連、相對連結存在。**掃描前一律 `html.unescape`**（2026-08-28 電磁學：作者為了規避「全課 0 個庫倫」閘門，把該詞寫成 `&#24235;&#20262;`，而 `&#20262;` 是簡體「伦」——成因是 §5.3 要求字典引述常見誤寫、BRIEF 卻規定該詞出現即錯字）。

### 獨立驗收者的固定項與參考線

- **字元級錯字掃描**：簡體字、形近錯字（工程數學試點 codex 生成「收旂」×35），用高頻術語逐一 grep。
- **拆檔量測**：各檔行數與位元組；參考線 HTML 1000 行、`app.js` 2000 行、一般 md 1200 行，**`BUILD-SPEC.md` 例外 1400 行**（規格要鎖死每個 widget，行數與課程規模成正比，硬拆會讓逐章行號表失效；Lead 2026-08-28 裁決不拆）。超標列報告由 Lead 決定。
- **`styles.css` 正本閘門**：`sync-styles.py --check` exit 0。
- 有 Playwright／headless Chrome 就跑桌面 `1440×900` ＋手機 `390×844` 全頁載入；**同機多課並行時先斷言頁面 `<title>` 屬於受驗課程**（2026-08-28 電子學驗收員量錯埠、載到別課頁面，得出「0 溢位」的假通過）。
- 規格本身也要抽驗：工程數學試點 BUILD-SPEC 兩處算術筆誤被作者忠實照抄，靠驗收員親手重算才抓到。

### 字數計法

**漢字＋全形標點**（Lead 2026-08-27 裁決）；spec 與驗收都用同一計法，短少 2% 以內不構成回派。各包門檻在派工前統一寫進 BUILD-SPEC（例：邏輯設計每章正文 1800–2600）。

### 規格裡的表格

計算式含 `|` 時寫成 `&#124;` 或改用清單——邏輯設計 09／12 章曾被未跳脫的 `|` 攔腰截斷，靠「鎖定的 8 拍序列只對應唯一一條式子」才反推回來。

### 掛站接線（Lead 收尾）

`.github/workflows/pages.yml` 課程表加一行 `<來源目錄>|<slug>`；只有當該課含 `../../<其他課>/` 形式的跨課相對連結才需另加 `replacements`；`on.push.paths` 已是萬用路徑，通常不必動。另加主站入口＋來源 README。細節與 Done when 在 [GITHUB-PAGES](../GITHUB-PAGES.md)。

## 二、用 codex CLI 當章節作者時

- 呼叫：`codex exec --sandbox workspace-write --cd <repo根> - < prompt檔`，prompt 走 stdin、用「指路」不內嵌原文；大檔生成有長靜默屬正常，勿設短超時。
- 一波最多 2 job，寫入不同資料夾者才並行。
- 帳號限制：以 ChatGPT 帳號登入時**不能用 `-m gpt-5-codex`**（回 400）；不指定 `-m`，用預設模型。
- pipe 的 exit code 不可信、watchdog 門檻與 PowerShell 寫檔亂碼的處理，見 [ENRICH-EXISTING](../ENRICH-EXISTING.md)（同一套 codex 呼叫方式）。
- codex 產出的內容層錯字（簡體字、形近字）比 Claude 子 agent 多，字元級錯字掃描不可省。

### gpt-sol（`-m gpt-5.6-sol`）當作者的踩雷

- stdin prompt 走 `-` 時**不可再加 `< /dev/null`**（會把 stdin 清空，codex 收到空 prompt）；一道 `< prompt檔` 就夠。
- gpt-sol（`-m gpt-5.6-sol`）啟動時會先照 AGENTS.md 開場腳本跑 `grep`／`inbox_read` 與 `wf-lint`，log 前段一大堆與任務無關的輸出屬正常，不是卡住。
- gpt-sol 會把「絕不輸出 NaN」之類的禁令**字面寫進頁面正文**（如「本欄絕不顯示 NaN」），字面掃描（NaN／Infinity／undefined）要連正文一起看，不只看 app.js 輸出。
- gpt-sol 自報字數普遍偏低（少算全形標點或漏算表格外散文），一律以驗收計法（漢字＋全形標點）重數，不採信自報數字。
- 以 Claude 子 agent 當作者時本節整段不適用；LF／CRLF 正規化與全部驗收關卡照舊。

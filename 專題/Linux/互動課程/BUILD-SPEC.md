# 任務：建「Linux（零基礎實務）」互動課的 HTML 頁（app.js 已完成，勿動）

目標資料夾：專題/Linux/互動課程

該資料夾已有 **完成且測過的 `app.js`** 與 `styles.css`（皆勿修改，一個字都不動）。你只建 HTML，讓每頁互動元件 id 與既有 app.js 完全對上。風格與頁骨架比照同庫 `專題/作業系統/互動課程/` 與 `專題/機器人數學基礎/互動課程/`（main-site-link、topbar、eyebrow、h1、lead、prereq、workspace、pager、site-footer）。

讀者：會寫基本程式、但幾乎沒用過命令列的自學者。定位＝實務 Linux：能看懂、能操作、建立正確心智模型。每個概念走「痛點 → 白話直覺（比喻收回精確定義）→ 具體例子（指令與輸出，數字/路徑要和該章 widget 一致）→ 為什麼／不要混淆 → 可觀察證據（在哪個指令輸出看得到）」。互動小工具旁要有「示範什麼、怎麼玩、看什麼」引導。

## 要建的檔（12 個）

index.html、名詞與概念字典.html，以及：
00-什麼是Linux.html、01-檔案系統與路徑.html、02-檔案與目錄操作.html、03-權限與擁有者.html、04-使用者群組與存取.html、05-行程與訊號.html、06-管道與重導向.html、07-文字處理與grep.html、08-環境變數與shell.html、09-套件管理.html

## 每頁互動元件 id 與控制項（必須完全一致，app.js 靠這些掛勾）

- **00**：`<select id="layer-pick">` 選項 value＝kernel / shell / app / distro；輸出 `id="layer-output"`。
- **01**：`<input type="text" id="path-cwd">`（預設 `/home/alice`）、`<input type="text" id="path-in">`（預設 `../bob/./file`）；輸出 `id="path-output"`。
- **02**：`<input type="text" id="glob-pat">`（預設 `*.txt`）、`<input type="text" id="glob-files">`（預設 `report.txt notes.md a.txt image.png`）；輸出 `id="glob-output"`。
- **03**：三個 `<select>` id＝chmod-u、chmod-g、chmod-o，各選項 value＝0..7（預設 7/5/5）；輸出 `id="chmod-output"`。另一個 `<input type="text" id="perm-oct">`（預設 `644`）；輸出 `id="perm-output"`。
- **04**：`<input type="text">` id＝acc-perm（預設 `640`）、acc-owner（預設 `alice`）、acc-group（預設 `staff`）、acc-user（預設 `bob`）、acc-usergroups（預設 `staff,dev`，逗號或空白分隔）；輸出 `id="acc-output"`。
- **05**：`<select id="ps-pick">` 選項 value＝R / S / D / Z / T；輸出 `id="ps-output"`。`<select id="sig-pick">` 選項 value＝SIGINT / SIGTERM / SIGKILL / SIGHUP / SIGSTOP / SIGCONT；輸出 `id="sig-output"`。
- **06**：`<select id="redir-pick">` 選項 value＝out / app / err / both / pipe / in；輸出 `id="redir-output"`。
- **07**：`<input type="text" id="grep-pat">`（預設 `^ERROR`）、`<textarea id="grep-text">`（預設放 4–5 行範例日誌，每行一筆）、`<input type="checkbox" id="grep-ic">`（忽略大小寫）；輸出 `id="grep-output"`。
- **08**：`<input type="text">` id＝env-home（預設 `/home/alice`）、env-user（預設 `alice`）、env-tmpl（預設 `$HOME/projects 由 $USER 擁有`）；輸出 `id="env-output"`。
- **09**：`<select id="pkg-pick">` 選項 value＝install / remove / update / upgrade / search、`<input type="text" id="pkg-name">`（預設 `nginx`）；輸出 `id="pkg-output"`。
- **字典**：`<input id="term-search">`＋`<span id="term-count"></span>`；每個名詞一張 `<article class="term-card">`，可加 `data-search="中英別名"`。涵蓋：核心 kernel、殼層 shell/bash、發行版 distribution、終端 terminal、絕對/相對路徑、家目錄 ~、FHS、萬用字元 glob、權限 rwx、chmod、擁有者/群組、sudo、行程 process/PID、行程狀態 R/S/D/Z/T、訊號 signal、前景/背景與作業控制、標準輸入輸出錯誤 stdin/stdout/stderr、重導向、管道 pipe、grep/正規表達式、環境變數/PATH、套件管理器 apt/dnf。每個名詞給「白話／位置或角色／用途／機制／邊界或常見誤解」。

每個 workspace 用統一格式：`<section class="workspace"><h2>動手玩：…</h2><p>引導</p><div class="controls"><label class="label">說明 <input/select/textarea></label>…</div><div class="output" id="…-output"></div></section>`。checkbox 也用 `<label class="label"><input type="checkbox" id="grep-ic"> 忽略大小寫</label>`。

## 鐵律（違反即失敗）

1. 不得修改 app.js、styles.css。
2. id 與 select/checkbox 的 value 必須與上面完全一致（大小寫、連字號都不能差）。
3. 公式與符號一律純文字 HTML，嚴禁 LaTeX（不得出現 \( \) \[ \] $ $$）。權限用 rwx、八進位用一般數字、路徑用一般字元。
4. 不得加任何外部資源；純離線。
5. 繁體中文、UTF-8、台灣工程用語；桌面與手機（≤720px）皆不得溢出或重疊。
6. topbar 的 `00 起點` 連到 `00-什麼是Linux.html`；pager 依 00→09 順序前後相連；字典頁 pager 回 index。index.html 用 chapter-list/chapter-card/number 列 00–09＋字典，標題「Linux（零基礎實務互動課）」。

## 收尾自檢（用中文列出）

- 逐章列出你建的 widget id，對照上面清單確認一字不差。
- 確認沒有動到 app.js、styles.css。
- 確認 0 個 LaTeX 分隔符、0 個外部資源。
- 列出每頁做了什麼、各 widget 一組範例輸入。

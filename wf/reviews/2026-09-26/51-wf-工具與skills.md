# 51 wf 工具與 skills 審稿（緊急截稿版）

## 總評
- **未完成**：因使用者緊急關機，於 09:45 截稿。已審完：wf/tools/wf-lint.sh、wf-lint-checks.sh、lint.sh、tabledb.py、tabledb_table.py、tabledb_links.py、test_inbox.sh、hook-settings-snippet.json、.gitignore、檔案清單；並實跑 `wf-lint.sh wf` 與 tabledb 唯讀指令。
- **未審**：inbox_*.sh、notify_watch.sh、fix_moved_links*.py（三檔合併評估）、tabledb_fmt*.py、check_anchors.py、find_big_lists.py、wf/skills 各 SKILL.md 內容、.claude/commands 與 .claude/skills 逐檔對照、.github（除 pages.yml 外無其他檔）。test_inbox.sh 與 lint.sh 已啟動但未收到結果。
- 整體：語法層面乾淨（bash -n 與 py_compile 全過），主要問題是 tabledb 錯誤處理靠 traceback、wf-lint 把 tabledb 崩潰當「無壞連結」、以及 hook 片段路徑與非侵入式佈局不符。
- 所有 sh 都只 `set -u`（無 `set -e`），屬刻意設計（各處以 `|| exit` 處理），非 bug，但 lint_dir 內少數命令失敗會被靜默吞掉。

## 腳本 bug
- `wf/tools/wf-lint-checks.sh:128-131` ｜高｜`tabledb.py check` 崩潰（JSON 壞、檔不存在）時 stderr 被丟到 /dev/null、輸出為空，`n=0` → 該資料檔被當成通過，壞資料檔完全不報｜檢查 python 結束碼：rc≠0 且輸出非 JSON 陣列時印 `LINT-ERROR <檔>` 並計入 broken
- `wf/tools/tabledb.py:88,91,104-106` ｜中｜`get`/`--slice`/`update`/`delete` 缺參數或索引越界直接 IndexError traceback；非整數索引 ValueError traceback（實測 `get`、`get 99999`、`get abc`、`--slice 0` 皆 traceback）｜在 main 外包一層 try，轉成 `{"error": ...}` JSON＋結束碼 2，符合「所有輸出都是 JSON」契約
- `wf/tools/tabledb.py:80-81` ｜中｜第一個參數若非既有指令即當 FILE，`tabledb.py lint FILE` 報「No such file or directory: 'lint'」誤導使用者｜FILE 不存在且第一參數像指令名時提示 `unknown command`；Table.load 包 FileNotFoundError 轉 JSON error
- `wf/tools/tabledb_links.py:31-33` ｜低｜連結目標含 `%` 百分比編碼（中文路徑常見）不解碼即 `os.path.exists`，會誤報 broken；shell 端 `link_exists` 有解碼，兩端不一致｜在 `_entry` 加 `urllib.parse.unquote` 後再 exists
- `wf/tools/tabledb_links.py:22` ｜低｜`LINK` regex 目標為 `[^)\s]+`，路徑含空白或 `)` 的連結整條漏抓（靜默不報）｜改用與 check_anchors 一致的抽取或支援 `<...>` 包裹寫法
- `wf/tools/wf-lint-checks.sh:136-139` ｜低｜awk 以 `"` 切欄印 target，`$fmt` 展開失敗的項 `"target": null` 會印成 `BROKEN f[i.col] -> `（空目標）｜null 時改印 `error` 欄
- `wf/tools/wf-lint-checks.sh:80-81` ｜低｜`md_files` 為空時 `printf '%s\n'` 仍送一個空行進 check_links，`dirname ""` 與 `awk ""` 會在 stderr 噴錯｜`[[ ${#md_files[@]} -gt 0 ]] &&` 才呼叫
- `wf/tools/wf-lint-checks.sh:26` ｜低｜`case $l in ... '<'*) continue` 讓 `[x](<含 空白.md>)` 寫法整條跳過不驗｜去掉 `<>` 後照驗
- `wf/tools/tabledb_table.py:38-45` ｜低｜CSV save 直接覆寫、無 tmp＋os.replace（JSON 有），中途失敗會毀檔｜比照 JSON 走 tmp 檔
- `wf/tools/wf-lint.sh:30-63` ｜低｜`--self` 分支依賴本 repo 不存在的 `tools/wf-init.sh`、`flavors/`、`examples/`，在此佈局是死碼且執行會噴 `wf-init failed`｜移除或在開頭偵測缺檔即 exit 2
- `wf/tools/hook-settings-snippet.json:9` ｜中｜命令路徑寫 `<專案根絕對路徑>/tools/inbox_read.sh`，本 repo 為非侵入式佈局，實際在 `wf/tools/inbox_read.sh`；且 `.claude/settings.json` 不存在，hook 未實際掛上｜片段改 `<專案根>/wf/tools/inbox_read.sh`，並決定是否進 `.claude/settings.json`

## 測試與 lint 輸出
- `bash wf/tools/wf-lint.sh wf`：`TOTAL broken=0`；SUMMARY `oversize=0 biglist=13 biglist_links=0 querycmd=0 residue=0 inbox_pending=0`；13 條 BIGLIST 全在今日 `wf/reviews/2026-09-26/01/02/04-*.md`（審稿報告的條列，屬預期），非 strict 不算失敗
- `bash -n wf/tools/*.sh`：10 檔全通過；`python3 -m py_compile wf/tools/*.py wf/skills/markdown-html-slides/scripts/*.py`：通過；shellcheck 未安裝
- `tabledb.py wf/workflows/decisions.json`：count=20、columns 4 欄、contract wf-table/1；`check` 回 `[]` rc=0；`resolve 0` 回 `{"error": "no link in row 0"}`（該表無連結欄，行為符合契約）
- `test_inbox.sh`：確認只寫 `mktemp -d /tmp/inbox-test.*` 並以 trap 自刪、透過 `AGENT_INBOX_ROOT` 隔離，不碰 repo；已啟動但截稿前未收到結果
- `lint.sh`（整庫三段）：已啟動但截稿前未收到結果

## 重複／死碼
- `wf/tools/__pycache__/`：已在 `.gitignore`（`__pycache__/`、`*.pyc`），git 狀態為 `!!` 忽略，無需處理
- `wf/tools/wf-lint.sh:30-63`：`--self` 模板自檢分支在本 repo 為死碼（見上）
- `fix_moved_links.py`／`_fmt.py`／`_scan.py` 三檔合計 340 行、13.6 KB：**未及審閱**合併可行性
- `.claude/skills/*/SKILL.md` 7 檔皆 8 行 ~500 B，疑為指向 `wf/skills/*` 的薄轉接層；**未及逐檔比對**是否與 wf/skills 重複
- `inbox_send.sh` 與 `inbox_mail.sh` 是否重複：**未及審閱**

## 文件與腳本不同步
- `data-files.md` ④ QUERYCMD 免掃清單寫 `archive/`、`wf/`、`AGENTS.md`、本契約檔；腳本 `wf-lint-checks.sh:146-147` 另免掃 `workflows/tidy/*`、`skills/*`、`data-files-fmt.md`、`tidy.md`，文件漏列
- `data-files.md` ② 寫「掃 repo 內所有 .json/.csv（archive/ 除外）」；腳本 `list_owned_files` 另排除 `reference(s)/`、`vendor/`、`done/`、`superseded/`、`inbox/`、submodule，文件漏列
- `data-files.md` 工具契約表未列 `fmt FILE`／`fmt --vars` 指令（tabledb.py 檔頭有、契約表沒有；可能在 data-files-fmt.md，未及確認）
- `hook-settings-snippet.json` 路徑 `tools/inbox_read.sh` 與實際 `wf/tools/` 不符（見 bug 表）
- `.claude/commands/wf-lint.md`、`wf-tick.md` 參數是否與 `wf-lint.sh`／tick 腳本一致：**未及審閱**

## 精簡建議
- QUERYCMD 檢查在非侵入式佈局下整個 `wf/` 免掃，實際只掃根層與筆記區，等於形同虛設；若無用可移除該段（-10 行）或改成只免掃 `wf/workflows/common/`
- `wf-lint.sh` 移除 `--self` 分支（-34 行），本 repo 只用 `lint_dir` 路徑；`lint.sh` 檔頭 18 行說明可縮成 5 行並指向 decisions.json
- tabledb 家族 6 檔（tabledb／_table／_links／_fmt／_fmt_expand／_fmt_vars）為守 300 行門檻拆得偏細，`_fmt_expand`（76 行）與 `_fmt_vars`（105 行）可併回 `_fmt`（合計 319 行，略超但語意單一）
- wf-lint 每個資料檔各起一個 python3 行程；可改成一次呼叫 `tabledb.py check FILE...` 批次

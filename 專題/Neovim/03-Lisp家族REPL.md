# 03 Lisp 家族 REPL

這章說明這份設定幫幾種 Lisp 方言配好的 REPL 環境，以及要怎麼用。

核心工具有兩個：

- **Conjure**：在 nvim 裡直接跟 REPL 互動，把游標下的 form 送過去求值、看結果。
- **parinfer**：在你打字時自動維護括號平衡，讓你不用手動數括號。

---

## Conjure 的操作鍵

所有鍵都以 `<localleader>`（也就是 `,`）開頭。

| 按鍵（接在 `,` 後） | 功能 |
| --- | --- |
| `ee` | 求值游標所在的 form |
| `er` | 求值最外層的 root form |
| `ew` | 求值游標下的 word |
| `eb` | 求值整個 buffer |
| `ef` | 求值整個檔案（路徑送給 REPL） |
| `E` | 求值 visual 選取的區域 |
| `e!` | 求值並把結果替換成游標所在 form |
| `ec…` | 「求值並把結果寫成行內註解」的一系列變體 |
| `ls` | 水平開一個 REPL log buffer |
| `lv` | 垂直開一個 REPL log buffer |
| `lt` | 在新 tab 開 REPL log buffer |
| `lg` | toggle REPL log（開/關） |
| `lq` | 關閉 REPL log |
| `gd` | 跳到定義 |
| `K` | 查文件 |
| `cc` | 連線到 REPL（Common Lisp / Swank 用） |
| `cd` | 中斷連線 |

最常用的就是 `,ee`（求值游標下的 form）和 `,ls`（開 log 看結果）。

### 關於 log HUD

Conjure 預設會在右上角顯示一個浮動視窗（HUD）即時顯示求值結果。這份設定**把它關掉了**，因為容易擋到程式碼。要看結果，用 `,ls` 開 log buffer 來看。

---

## parinfer

parinfer 在這份設定用的是 `smart` 模式：根據你的縮排自動推算括號應該在哪裡，幫你補或移動括號。它是自動運作的，沒有鍵位，你只管打字就好。

安裝需要 `cargo`（Rust 的工具鏈），第一次安裝時 lazy.nvim 會幫你跑 `cargo build --release`。

### 沒有安裝結構編輯 plugin

這份設定**沒有**裝 vim-sexp 之類的結構編輯工具，所以沒有 slurp、barf、括號跳轉等操作。括號平衡完全交給 parinfer 自動處理。

---

## 彩虹括號

Lisp、Clojure、Scheme、Racket、Fennel、Hy、Janet 這幾個 filetype 會開彩虹括號（rainbow-delimiters），用不同顏色顯示不同層的括號。純視覺輔助，不影響操作。

---

## 為什麼 Lisp 不做 format-on-save

parinfer 在你打字時即時調整括號結構，整檔的 formatter 存檔時又會重排一次縮排。兩套同時跑會打架——括號位置可能被再次改寫、縮排跳動，結果不可預期。

所以 `formatting.lua` 把 `lisp` filetype 的 formatter 明確設為空清單，停用整檔格式化。parinfer 就是唯一的縮排管理者。

---

## 各方言的 REPL 設定

### Common Lisp（Swank / SBCL）

| 項目 | 說明 |
| --- | --- |
| filetype | `lisp` |
| 連線方式 | TCP，連到 `127.0.0.1:4005`（Swank 伺服器） |
| 自動連線 | 不會。開 `.lisp` 檔後要手動按 `,cc` |

Common Lisp 走的是 **connect 模式**：nvim 這邊連到外部已經在跑的 Swank 伺服器，而不是 nvim 自己起一個 REPL。

#### 在本機跑 Swank

這份設定的用法是把 Swank 設成 **systemd user service**，讓它開機就在背景跑。整個架構是：

```
systemd --user → SBCL → Quicklisp → Swank → 127.0.0.1:4005
```

相關的本機檔案（不在這份 repo 裡，要自己建）：

```
~/.config/common-lisp/swank-server.lisp
~/.config/systemd/user/swank.service
```

啟用 service：

```sh
systemctl --user enable --now swank.service
loginctl enable-linger "$USER"    # 讓 user service 在登入前就能啟動
```

常用管理指令：

```sh
systemctl --user status swank     # 看狀態
systemctl --user restart swank    # 重啟
journalctl --user -u swank -f     # 看 log
```

#### 工作流程

1. 確認 Swank 在跑（`systemctl --user status swank`）
2. 開 nvim，打開任何 `.lisp` 檔
3. `,cc` 連上 Swank
4. `,ee` 求值游標下的 form，`,ls` 開 log 看結果
5. 不用了就 `,cd` 中斷連線

這個「全域常駐 Lisp image」適合學習和個人工具快速驗證。正式專案通常建議各自起一個 SBCL、載入各自的 ASDF system、跑自己的 Swank，這樣不同專案的 package 和全域變數不會互相污染。同時跑多個專案要用不同 port。

#### C-Mera 關鍵字高亮

C-Mera 的 DSL 關鍵字（例如 `function`、`decl`、`int`）的語法高亮是透過 `queries/commonlisp/highlights.scm` 的 treesitter query 加上去的，在 `lisp` filetype 自動生效。

---

### Fennel

| 項目 | 說明 |
| --- | --- |
| filetype | `fennel` |
| 連線方式 | stdio，nvim 自己起一個 `fennel` 子行程 |
| 前置需求 | 系統 PATH 上要有 `fennel` 可執行檔 |

開 `.fnl` 檔後 REPL 自動起來。用 `,ee` 求值就好。

treesitter 的 `fennel` parser 會自動安裝，有語法高亮。

---

### Hy

| 項目 | 說明 |
| --- | --- |
| filetype | `hy` |
| 連線方式 | stdio，nvim 自己起 `hy -iu -c="Ready!"` |
| 前置需求 | 系統 PATH 上要有 `hy` 可執行檔 |

開 `.hy` 檔後 REPL 自動起來。

---

### Scheme（s7）

| 項目 | 說明 |
| --- | --- |
| filetype | `scheme` |
| 連線方式 | stdio，nvim 自己起 s7 子行程 |
| 前置需求 | 要自己編 s7 的 REPL 執行檔 |

Conjure 內建的 scheme client 預設指向 `mit-scheme`。這份設定把它換成 **s7**（一個輕量的 Scheme 實作，適合嵌入式腳本開發）。

#### 先編出 s7

s7 的執行檔不在任何 repo 裡，要自己編：

```sh
cd ~/repo/pas/derived/s7-playground
bash setup.sh    # 從 ccrma 抓 s7.c / s7.h 與相關程式庫
bash build.sh    # 編出 ./s7
```

#### 執行檔路徑的解析順序

1. 環境變數 `$S7_REPL`（如果有設的話）
2. `~/repo/pas/derived/s7-playground/s7`
3. PATH 上的 `s7`

換機器或把 s7 放在別的地方，設 `S7_REPL` 環境變數就好：

```sh
export S7_REPL=/你的/s7/路徑
```

#### 用法

先 `cd` 到你的專案目錄，再開 nvim——因為 Conjure 的 stdio client 是在 nvim 的 cwd 起 s7，`(load "llm.scm")` 這種相對路徑才對得上。

然後用 `,ee` 求值、`,ls` 開 log 看結果。

#### 注意：不要編 libc_s7.so

如果你在 s7-playground 裡把 `libc_s7.so` 也編出來了，s7 的 REPL 會進入「花俏模式」，輸出裡混入終端機控制碼（ANSI escape sequences）。這些控制碼會汙染 Conjure 的 stdio 管線，讓 Conjure 讀不到 REPL 的回應。

沒有 `libc_s7.so` 的話，s7 只會在啟動時印一行 `load ... failed` 的警告，然後退回純文字 REPL——**那正是要的**。看到那行警告不用擔心，是正常的。

#### 技術說明：為什麼要用 stdbuf -o0

這個是踩過的坑，紀錄一下。

Conjure 靠「看到 prompt 字串（`> `）」來判斷一次求值是否結束。s7 的 prompt 走 stdout，但 stdout 接到 pipe 時，libc 預設是**全緩衝**——prompt 只有 2 bytes，填不滿 4KB 緩衝區，所以一直卡在 libc 裡出不來。

症狀是：REPL 顯示啟動了，eval 也送出去了，但**結果一行都不會出現**。

解法是用 `stdbuf -o0` 把 s7 的 stdout 改成無緩衝，prompt 就能即時出來。這份設定在有 `stdbuf` 的環境（Linux 有，macOS 要裝 GNU coreutils）會自動加上這個包裝。

注意：必須是 `-o0`（無緩衝），不能是 `-oL`（行緩衝）——因為 prompt 結尾沒有換行，行緩衝同樣不會 flush。

---

### Janet

| 項目 | 說明 |
| --- | --- |
| filetype | `janet` |
| 連線方式 | stdio，nvim 自己起 `janet -n -s` 子行程 |
| 前置需求 | 系統 PATH 上要有 `janet` 可執行檔 |
| 語法高亮 | treesitter parser 名叫 `janet_simple`，會自動安裝 |

開 `.janet` 檔後 REPL 自動起來。

注意：Conjure 對 janet 的**預設** client 是 netrepl（需要另外跑一個 netrepl 伺服器）。這份設定把它改成 stdio client，開檔就自動帶一個 REPL，不需要額外設定。

treesitter 的 janet parser 名字比較特別，叫 `janet_simple`（不是 `janet`），這份設定已經把它加進 `ensure_installed` 清單了，第一次開 janet 檔時會自動編譯安裝。

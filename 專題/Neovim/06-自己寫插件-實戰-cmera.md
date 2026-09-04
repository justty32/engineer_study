# 06 自己寫插件——實戰：拆解 cmera.lua

上一章教了寫插件的基本零件：`local M = {}`、keymap、user command、autocmd。這章要把那些零件拼在一起，看一個「在這套設定裡真的有在用」的插件長什麼樣。

範例是 `lua/config/cmera.lua`。它包裝了一個外部工具 `cm`（C-Mera 的指令列程式），讓你在編輯 `.cmera` 原始碼的時候，按一個鍵就能把 `cm` 的產出預覽在側邊視窗、或者寫成檔案。

讀完這章你會看懂：如何呼叫外部程式、怎麼把輸出填進 buffer、怎麼讓 preview 視窗不會每按一次就疊出一個新窗。

---

## 這插件在幹嘛

C-Mera 是一個用 Common Lisp 語法寫 C/C++ 的工具——你寫的是 `.cmera` 檔，跑 `cm c++ foo.cmera` 就會把它轉成 C++ 原始碼印到 stdout。

這個插件讓你不用離開 Neovim 就能做這件事：

- **預覽**：跑 `cm`，把 stdout 丟進側邊視窗，即時看產出的 C/C++ 長什麼樣。
- **寫出**：跑 `cm`，把 stdout 存成 `.c`/`.cpp` 之類的實際檔案。
- **開啟**：寫出之後直接在 Neovim 開那個新檔案。

---

## 模組骨架

```lua
local M = {}

-- ... 私有 helper ...

function M.preview(opts) ... end
function M.write(opts) ... end
function M.open_output(opts) ... end

-- ... user command 與 autocmd 在最外層直接執行 ...

return M
```

跟上一章說的一樣：`local M = {}` 當容器，對外公開的函式掛在 `M` 上，私有的 helper 就用 `local function`。模組最後 `return M`，讓 `require` 呼叫端可以拿到那張表。

`keymaps.lua` 頂端只有一行 `require("config.cmera")`——光是 require 就會把整個模組跑一遍，所以 user command 和 autocmd 都在那個當下就註冊好了。不需要再去呼叫任何初始化函式。

---

## 私有的幾個小 helper

在看主要邏輯之前，先認識幾個貫穿整份檔案的私有函式。

### generators 表

```lua
local generators = {
  c   = { filetype = "c",       extension = "c"   },
  ["c++"] = { filetype = "cpp", extension = "cpp" },
  cxx = { filetype = "cpp",     extension = "cpp", cli = "c++" },
  cuda  = { filetype = "cuda",  extension = "cu"  },
  glsl  = { filetype = "glsl",  extension = "glsl" },
  ocl   = { filetype = "opencl", extension = "cl" },
  opencl = { filetype = "opencl", extension = "cl", cli = "ocl" },
}
```

這張表記錄每種 generator 對應的 Neovim filetype 和副檔名。有些 key 和傳給 `cm` 的 CLI 參數不同（例如 `cxx` 這個 key 對應的 CLI 是 `c++`），所以另外有個 `cli` 欄位。

### detect_lang

```lua
local function detect_lang(buf)
  local first = vim.api.nvim_buf_get_lines(buf, 0, 1, false)[1] or ""
  if first:match("cm:%s*c%+%+") or first:match("cm:%s*cxx") then
    return "c++"
  end
  local marker = first:match("cm:%s*([%w%+%-_]+)")
  if marker and generators[marker] then
    return marker
  end
  return "c"
end
```

讀 buffer 第一行，試著抓 `cm: c++` 或 `cm: cuda` 這類的標記，自動決定要用哪個 generator。如果找不到就預設 `c`。這樣使用者不傳參數的時候，插件還是能猜出正確的 generator。

### notify

```lua
local function notify(msg, level)
  if _G.Snacks and _G.Snacks.notify then
    -- 用 Snacks 的通知
  else
    vim.notify(msg, vim.log.levels[level:upper()] or vim.log.levels.INFO)
  end
end
```

包一層通知函式，有裝 Snacks 就用 Snacks，沒有就退回 `vim.notify`。這是很常見的「漸進降級」寫法，讓模組不強依賴特定插件。

### current_file

```lua
local function current_file()
  local buf = vim.api.nvim_get_current_buf()
  local file = vim.api.nvim_buf_get_name(buf)
  if file == "" then
    notify("目前 buffer 沒有檔名，請先存檔。", "warn")
    return nil
  end
  vim.cmd("silent! write")
  return buf, vim.fn.fnamemodify(file, ":p")
end
```

取得目前 buffer 的完整路徑，順便自動存檔（因為 `cm` 要讀磁碟上的檔案，還沒存的改動會被忽略）。沒有檔名就發警告、return nil，讓呼叫端提早放棄。

---

## 跑外部程式：vim.system

核心是 `run_cm`：

```lua
local function run_cm(generator, file, callback)
  local cmd = { "cm", generator_arg(generator), file }
  local cwd = vim.fn.fnamemodify(file, ":h")

  vim.system(cmd, { text = true, cwd = cwd }, function(obj)
    vim.schedule(function()
      if obj.code ~= 0 then
        local err = vim.trim(obj.stderr or obj.stdout or "")
        notify("C-Mera 編譯出錯 (Exit " .. obj.code .. "):\n" .. err, "error")
        return
      end
      callback(obj)
    end)
  end)
end
```

**`vim.system`** 是 Neovim 0.10 加入的 API，用來非同步跑外部程式。幾個重點：

- 第一個參數是 table `{ "cm", "c++", "/path/to/foo.cmera" }`，不是字串，所以不用擔心空格或特殊字元要怎麼跳脫。
- `{ text = true }` 讓 stdout/stderr 以字串形式傳回，不用自己處理位元組。
- `cwd` 設成原始碼所在目錄，這樣 `cm` 找相對路徑的時候才不會跑錯地方。
- 第三個參數是 callback，`cm` 結束後會在背景執行緒呼叫它。

**`vim.schedule`** 很重要——`vim.system` 的 callback 是在 luv 的執行緒裡跑的，不能直接呼叫大部分的 Neovim API。包一層 `vim.schedule` 就能排進主執行緒的下一個事件循環，讓你安全地操作 buffer、window。

錯誤處理：`obj.code ~= 0` 就代表 `cm` 出錯，把 stderr（或 stdout）丟給使用者看，然後 return。沒有問題才呼叫 `callback(obj)`。

---

## 操作 buffer 與 window：preview 視窗

這是整個插件最有料的部分。

### 不疊視窗的訣竅

模組層級有一個 `local preview = {}`，用來記住上次開的視窗和 buffer：

```lua
local preview = {}
```

每次 preview 的時候就看這張表，視窗還活著就不開新的：

```lua
local function preview_output(generator, content)
  -- ... 省略空內容的檢查 ...

  local buf = preview.buf
  if not (buf and vim.api.nvim_buf_is_valid(buf)) then
    buf = vim.api.nvim_create_buf(false, true)
    preview.buf = buf
  end
  vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
  -- 切換 filetype（例如從 c 切到 cuda）
  if vim.bo[buf].filetype ~= meta.filetype then
    vim.bo[buf].filetype = meta.filetype
  end

  if preview.win and vim.api.nvim_win_is_valid(preview.win) then
    return  -- 視窗還在，只要更新 buffer 內容就好，不用再開視窗
  end

  -- 開新視窗 ...
end
```

邏輯是：
1. 檢查 `preview.buf` 是否還有效，沒有才建新的 scratch buffer（`false, true` = 不列在 buffer list、scratchpad）。
2. 把內容寫進 buffer（`set_lines` 從第 0 行到最後一行全部替換）。
3. 檢查 `preview.win` 是否還有效，還活著就直接 return——buffer 內容已經更新了，視窗因為指向同一個 buffer，自然就顯示新內容。
4. 視窗不存在才開視窗。

這樣不管按幾次 `,cb`，畫面上最多只會有一個 preview 視窗。

### 開視窗：Snacks 優先，vsplit 備用

```lua
if _G.Snacks then
  local win = _G.Snacks.win({
    buf = buf,
    width = 0.45,
    position = "right",
    backdrop = false,
    bo = { buftype = "nofile", bufhidden = "hide" },
    wo = { cursorline = true, number = true },
    keys = { ["q"] = "close" },
  })
  preview.win = win and win.win
else
  vim.cmd("vsplit")
  preview.win = vim.api.nvim_get_current_win()
  vim.api.nvim_win_set_buf(preview.win, buf)
end
```

有 Snacks 就用它開一個佔右側 45% 寬的浮動視窗，按 `q` 可以關。沒有 Snacks 就退回手動 `vsplit`，然後把 buffer 塞進那個視窗。

幾個 buffer 選項值得注意：
- `buftype = "nofile"`：告訴 Neovim 這個 buffer 不對應任何檔案，不會被要求存檔。
- `bufhidden = "hide"`：關掉視窗的時候 buffer 不要砍掉，留著讓下次 preview 繼續重用。如果設成 `wipe`，下次就要重新建 buffer。

---

## 命令與 keymap

### 帶可選參數的 user command

```lua
vim.api.nvim_create_user_command("CmeraPreview", M.preview, {
  nargs = "?",
  complete = complete_generators,
})
```

- `nargs = "?"` 表示參數是選填的（0 或 1 個）。使用者可以 `:CmeraPreview c++` 強制指定，也可以 `:CmeraPreview` 讓插件自動偵測。
- `complete = complete_generators` 掛上一個函式當 Tab 補全的來源。`complete_generators` 回傳 `vim.tbl_keys(generators)`，也就是 `{ "c", "c++", "cxx", "cuda", ... }` 這個 table。

M.preview 收到的 `opts` 長這樣：`{ args = "c++" }` 或 `{ args = "" }`。所以裡面這樣判斷：

```lua
local generator = opts and opts.args ~= "" and opts.args or detect_lang(buf)
```

有傳參數就用傳進來的，空的就呼叫 `detect_lang` 自動猜。

### keymaps.lua 怎麼接

```lua
require("config.cmera")   -- 這行讓整個模組跑一遍，user command 就位

vim.keymap.set("n", "<localleader>cb", "<cmd>CmeraPreview<cr>", { desc = "C-Mera Preview" })
vim.keymap.set("n", "<localleader>cw", "<cmd>CmeraWrite<cr>",   { desc = "C-Mera Write Output" })
vim.keymap.set("n", "<localleader>co", "<cmd>CmeraOpen<cr>",    { desc = "C-Mera Write and Open Output" })
```

`<localleader>` 在這套設定裡通常是 `,`，所以實際按鍵就是 `,cb`、`,cw`、`,co`。

---

## autocmd：關掉 .cmera 的自動格式化

```lua
vim.filetype.add({ extension = { cmera = "lisp" } })

local group = vim.api.nvim_create_augroup("user_cmera", { clear = true })

vim.api.nvim_create_autocmd({ "BufReadPost", "BufNewFile" }, {
  group = group,
  pattern = "*.cmera",
  callback = function(args)
    vim.b[args.buf].autoformat = false
  end,
})
```

`.cmera` 檔的 filetype 設成 `lisp`（方便 treesitter 高亮），但 LazyVim 看到 lisp 就會想自動格式化。`vim.b[buf].autoformat = false` 針對單一 buffer 關掉它，不影響真正的 Lisp 檔案。

---

## codegen.lua 快速對照

`codegen.lua` 也是「包外部工具、開側窗顯示結果」的套路，骨架幾乎一樣：

```
run_cm(...)    ←→    run(...)
preview_output(...)  ←→    show_output(...)
```

### 相同的地方

- 都用 `vim.system` 非同步跑外部程式，callback 裡用 `vim.schedule` 切回主執行緒。
- 都有 `notify` 包一層通知，有 Snacks 用 Snacks，沒有退回 `vim.notify`。
- 都用 `vim.api.nvim_create_buf(false, true)` 建 scratch buffer，再用 Snacks 或 split 開視窗。

### 不同的地方

| 點 | cmera.lua | codegen.lua |
|---|---|---|
| 視窗方向 | 右側，`position = "right"` | 下方，`position = "bottom"` |
| buffer 重用 | 有 `preview = {}` 記住同一個視窗，反覆更新 | 每次跑都建新 buffer，`bufhidden = "wipe"` 用完就丟 |
| Python 路徑 | 不需要 | 先找 repo 裡的 `.venv/python`，找不到才用系統 `python3` |
| 額外功能 | 無 | 有 `dry_run`（試跑不寫檔）和 `rollback`（回復備份） |
| 找 cwd | 檔案所在目錄 | 往上找 `codegen.toml` 或 `.git`，確定 project root |

兩個模組都沒有在 plugins/ 裡設定 lazy spec——它們不是 Neovim 插件市集的套件，只是本地 Lua 模組，直接在 `keymaps.lua` 裡 `require` 就完成載入了。

---

## 你可以怎麼改造

看完 cmera.lua 之後，你應該有感覺這個套路很好複製。幾個你可以自己試的方向：

**包一個 formatter**：對目前檔案跑 `gofmt` 或 `black`，把格式化後的內容秀在側窗，確認沒問題再存檔。和 cmera 的 preview 邏輯幾乎一樣。

**跑測試、看結果**：用 `vim.system` 跑 `pytest` 或 `go test`，把 stdout/stderr 塞進下方分割視窗。可以參考 codegen 的 `show_output`，它的 `position = "bottom"` 更適合測試輸出。

**依 filetype 選工具**：在 `detect_lang` 的概念上延伸，根據 `vim.bo.filetype` 選擇要跑的外部指令，做成一個通用的「一鍵跑對應工具」快捷鍵。

**加 autocommand 自動刷新**：在 `BufWritePost` 觸發 `M.preview()`，每次存檔就自動更新 preview 視窗，不用手動按快捷鍵。

核心就是那個 `preview = {}` 的概念——用一個模組層級的 table 記住視窗狀態，然後每次操作前先檢查它還活著嗎。這個模式在寫任何需要「持續顯示某東西」的插件時都很好用。

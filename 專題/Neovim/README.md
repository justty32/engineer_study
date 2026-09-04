# 這套 LazyVim 設定怎麼用

這門課教的是一套**特定的個人 LazyVim 設定**（`my_lazyvim_settings`）有哪些功能、怎麼用。

不教 Vim 基礎，也不教 LazyVim 所有功能——只聚焦「這份設定改了什麼、加了什麼、你要怎麼操作」。

## 讀者基線

你已經：

- 知道 normal / insert mode 的切換
- 會用 `hjkl` 移動、`:w` 存檔、`:q` 離開
- 大致知道 Vim 的 buffer、window 是什麼

不需要事先用過 LazyVim 或任何 Neovim 發行版。

## 注意：這套設定只在 Linux 上跑

設定裡用了 Unix 路徑（`~/repo/...`）、symbolic link 安裝方式、systemd user service（跑 Swank）、`stdbuf` 等 GNU coreutils 工具。在 macOS 上大多能動，但沒有特別維護；在 Windows 上不能直接用。

## 章節導覽

- [01-安裝與基本概念](01-安裝與基本概念.md) — symbolic link 裝法、LazyVim 是什麼、leader 鍵是什麼
- [02-自訂快捷鍵與命令](02-自訂快捷鍵與命令.md) — jk 離開 insert、C-Mera 工具、codegen 工具的所有鍵與命令
- [03-Lisp家族REPL](03-Lisp家族REPL.md) — Conjure + parinfer 整套：Common Lisp、Fennel、Hy、Scheme(s7)、Janet
- [04-除錯與語言環境](04-除錯與語言環境.md) — nvim-dap 吃 launch.json、GDScript/Godot、已啟用的語言 extras、其他慣例
- [05-自己寫插件-基礎](05-自己寫插件-基礎.md) — 插件的本質、寫命令/keymap/autocmd、整理成模組、lazy.nvim spec
- [06-自己寫插件-實戰-cmera](06-自己寫插件-實戰-cmera.md) — 拿設定裡真的 C-Mera 插件當範例，拆解一個完整插件怎麼組起來

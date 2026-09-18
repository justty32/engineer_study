---
description: 跑 wf-lint 檢查文檔（壞連結 / 超標檔 / >1 KB 條列 / 資料檔壞連結 / 查詢指令殘留 / 佔位殘留 / inbox 堆積）
---

> 本檔是 **Claude Code 的 slash 指令適配層（可選）**：其他 agent 工具沒有對應機制就忽略 `.claude/`，直接跑 `tools/lint.sh`。

`wf-lint.sh` 是 kernel-owned（掃整庫對學習筆記正文條列與名詞對照表會誤報 800+ 條 `BIGLIST`，使用者已裁定視為誤報）。正式驗收改跑 project-owned 包裝 `wf/tools/lint.sh`（範圍裁定見 [decisions](../../wf/workflows/decisions.json)）：

```
bash wf/tools/lint.sh $ARGUMENTS
```

包裝分三段：**(1) `wf/` 跑 `--strict`**（連結／殘留／oversize／biglist／querycmd 全算失敗）；**(2) 根入口**（`AGENTS.md`、`CLAUDE.md`、`.claude/commands/*.md`）跑 `--strict` 並額外 grep 佔位殘留（雙大括號模板變數、模板說明段、導入判斷提示語三種，見 `lint.sh` 檔頭）；**(3) 整庫只看 `BROKEN`／`BROKEN-ANCHOR`／`TOTAL`**，`BIGLIST` 不印、不計入失敗。任一段失敗 exit 1；`--quiet` 只印總結行。

若要直接呼叫底層工具本身（例如只想看某個子目錄的完整輸出），可跑：

```
bash wf/tools/wf-lint.sh $ARGUMENTS .
```

回報 `BROKEN` 清單與各項計數。有 `BROKEN` 就修連結；殘留的佔位符與模板段表示導入未完成（`--strict` 會讓殘留算失敗）。`BIGLIST` 表示同質記錄表（非連結表）條列 >1 KB，抽成資料檔；`BIGLIST-LINKS` 只是連結表超過十條的提醒（永遠只 warning，不影響結束碼），該不該抽看是給人導航（留 md）還是給 AI 消化（抽資料檔），見 [data-files](../../wf/workflows/common/data-files.md)。`QUERYCMD` 表示 md 裡還留著資料檔查詢指令或工具路徑，照 [data-files](../../wf/workflows/common/data-files.md)「md 端留什麼」拿掉。`--strict` 時 oversize / biglist（同質記錄表）/ querycmd / 殘留都算失敗。
`BROKEN-ANCHOR` 表示 md 連結的 `#錨點`在目標檔找不到（拆檔／改標題最常斷這個），計入 `BROKEN`，一定要修。

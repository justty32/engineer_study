---
description: 循環跑 tick 定期心跳工作流（可指定週期，如 /wf-tick 5m）
---

讓 agent **循環**跑 tick 工作流（[workflows/tick.md](../../wf/workflows/tick.md)）——每隔指定週期喚醒、跑一次單次心跳。

- `$ARGUMENTS` = 喚醒週期（例 `5m`、`30m`）。
- **給了週期** → 用 `/loop` 機制每隔該週期跑一次 **tick 工作流**（loop 的目標是 tick 工作流本身，**不是本指令**，避免遞迴）。
- **沒給** → 讓模型自行決定節奏（self-pace）循環跑。

每次喚醒就照 [workflows/tick.md](../../wf/workflows/tick.md) 的「單次心跳做什麼」做一次、回一句摘要。要停就中止 loop。

本檔是 **Claude Code 的 slash 指令適配層（可選）**，非侵入式佈局下仍放專案根 `.claude/commands/`（Claude Code 只讀根的這層）。其他工具沒有對應機制就忽略 `.claude/`，直接照 [workflows/tick.md](../../wf/workflows/tick.md) 用自己的循環引擎跑。

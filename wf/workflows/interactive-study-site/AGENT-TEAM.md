# Agent 編組與派工規則

← [工作流入口](README.md)｜[品質關卡](QUALITY-GATES.md)

## 角色

| 角色 | 建議模型 | 責任 | 不可做的事 |
|------|----------|------|------------|
| **Lead / Architect** | 當前主模型 | 定範圍、建契約、分派、整合、事實與公式審核、最終驗收 | 不把未定義的需求丟給 worker 自行猜測 |
| **Content Mapper** | `gpt-5.6-luna` | 讀本地來源、切學習單元、建立來源對應 | 不改原始筆記、不上網補洞 |
| **Interaction Designer** | `gpt-5.6-luna` | 把概念改寫成操作、狀態與回饋規格 | 不寫無判準的裝飾互動 |
| **Shell Worker** | `gpt-5.6-luna` | 依契約實作 HTML 與 CSS | 不改 JavaScript、不下載 UI 套件 |
| **Logic Worker** | `gpt-5.6-luna` | 依契約實作狀態、公式、回饋與本地進度 | 不改 HTML/CSS、不自行增減 DOM ID |
| **Verifier** | `gpt-5.6-luna` | 執行既有工具可完成的測試，回報可重現問題 | 不以重寫掩蓋規格問題 |
| **Escalation Worker** | `gpt-5.6-terra` | 只處理 luna 連續失敗、且已縮小的單一技術問題 | 不接管整案、不擴大範圍 |

使用較輕量模型的前提是 Lead 先把工作縮成有清楚輸入、寫入範圍與驗收條件的任務卡。Worker 不負責產品方向。

## 編排

```text
Round 1: Content Mapper ─┐
                         ├─> Lead 整合成 BUILD-SPEC
         Interaction ───┘

Round 2: Shell Worker ───┐
                         ├─> Lead 整合與快速檢查
         Logic Worker ───┘

Round 3: Verifier ─────────> Lead 修正或精準回派
```

- 全案同時最多 2 個 worker，避免資源與網路連線一起放大。
- Worker 不得再生子 agent。
- 同一輪必須有互斥寫入範圍；有依賴就改成串行，不假裝可並行。
- 已完成的 agent 立即關閉，再啟動下一輪。
- 外部查詢只允許單一專責 worker，且不可與另一個外部查詢並行。

## 任務卡格式

```md
## <任務編號> <一句話名稱>
- 模型：
- 讀取範圍：
- 唯一寫入範圍：
- 禁止事項：不得上網、不得下載、不得修改範圍外檔案
- 輸出：
- Done when：
- 上游依賴：
- 下游交接：
```

## 失敗處理

1. Worker 第一次偏離：Lead 指出具體差異，沿用同一 agent 修正。
2. 第二次偏離：Lead 縮小任務，只保留一個可測問題。
3. 仍失敗：關閉原 agent，改派一個 `gpt-5.6-terra` Escalation Worker。
4. 只有規格本身矛盾時，才由 Lead 修改契約；不得把規格錯誤算成 worker 能力問題。

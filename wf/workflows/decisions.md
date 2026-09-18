# decisions — 決策記錄（為什麼選 A 不選 B）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

留下「為什麼」：git log 找得回改了什麼，找不回**為什麼放棄方案 C**。活狀態記「未完的」，這裡記「已定但要留理由的」。

**何時用**：在兩個以上可行方案裡選一個，且日後可能被問「當初為什麼」。
**何時不用**：只有一條路，或隨時可回頭的小事。決策過程要結構化評估 → [decide](decide.md)，結論再落到這裡。互動課程建課中的 Lead 裁決也記這裡（一列一裁決），不散在各課的 BUILD-SPEC。

## Done when

- 資料檔多一列，且「未選方案與原因」（`rejected`）「前提」（`premise`）兩欄非空。

## 記錄

記錄表已抽到 [decisions.json](decisions.json)（12 列，新的在上；讀寫走資料檔契約，見 [common/data-files](common/data-files.md)）。

| 欄位 | 內容 |
|------|------|
| `date` | 決定日期 `YYYY-MM-DD` |
| `decision` | 決定了什麼（一句） |
| `rejected` | 未選方案與原因 |
| `premise` | 前提（變了就重看） |

目前 12 列：專案級 7（繁中純文字、對照表分檔門檻、非侵入式佈局、kernel v0.5 升級的 inbox／lint／模型陣容／teaching 四項取捨）＋互動課程建課裁決 5（BUILD-WITH-AGENTS 改名與封存、BUILD-SPEC 不拆、字數計法、共用資產建置時複製、摺積／混疊譯名）。

> 條目多到資料檔難查（或要按主題分庫）就升級成 `decisions/` 資料夾（照 [STRUCTURE](../STRUCTURE.md)）。

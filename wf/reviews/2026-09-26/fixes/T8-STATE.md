# T8 續行點（收尾隊：調度者裁決 1–8 項）

- 開工前 wf-lint：broken=2 biglist=287 querycmd=3 residue 雙大括號=5（基準 268／1 之後新增 47、50、52、HANDOFF 與 STATE 檔）
- 狀態：全部完成；收尾 wf-lint 回到 broken=2 biglist=268 querycmd=3 residue 雙大括號=1
- 主站連結寫法：課程 html 用指向 `互動學習網站/index.html` 的相對路徑，pages.yml replacements 對該課 slug 改寫成 `../index.html`；本次只套 33、34，其餘課列入 [延後彙整](延後彙整.csv)
- machine_learning repo 另有 1 個 commit（AI理論白話 README 產生器）

## 第二輪（2026-10-09，跨課隊）

狀態：全部完成。延後彙整.csv 已加「狀態」欄，165 列皆結案（第一階段 135 列、T8 30 列）。主站連結已推廣到 pages.yml 課程表全部 37 門課，replacements 每個 slug 都有 →../index.html 規則，並補上 IoT 中央與七站互鏈等先前缺的改寫規則。共用樣式照「建置時複製」裁決：先改正本，再用 sync-styles.py --sync 同步 A 家族。驗收方式：用 python 模擬 pages.yml 在暫存目錄組 _site，436 個主站連結都指到站根 index.html。

# write — 內容產出（文章 / 筆記 / 文件 / 翻譯）

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

把一個題目寫成**給人讀的成品**：定對象、搭骨架、寫初稿、改稿、標來源。動筆前先過 [common/writing](common/writing.md)（文風）；寫本庫筆記同時遵守 [PROJECT-GUIDE](../PROJECT-GUIDE.md) 的繁體中文、內容深度與名詞對照規範。

**何時用**：使用者說「寫一篇 X」「把這段改順」「翻譯這篇」「把研究結果寫成正式筆記」。
**何時不用**：一兩句回覆或即時問答，直接寫。還不知道要寫什麼 → 先 [digest](digest.md)（讀懂材料）或 [plan-a-thing](plan-a-thing.md)（想清楚）。只是記一個「以後要寫」的題目 → [planning](planning.md)。

## Done when

- 成品檔存在（繁中、UTF-8），且含開稿時講好的每個小節。
- 每個數據、引言、事實後面有出處連結；筆記首次出現的專有名詞有「繁中（English）」對照，且該科對照表有對應詞條。
- `grep -nE '值得一提|眾所周知|總而言之|賦能|抓手|閉環' <成品檔>` 無輸出（AI 味自檢，表在 [common/writing](common/writing.md)）；`file <成品檔>` 回報 UTF-8。

## 流程

1. **定對象與目的**：寫給誰、他讀完要能做什麼——一句話寫下來，這句就是後面所有取捨的依據（本庫預設對象見 PROJECT-GUIDE「擁有者背景」）。
2. **outline**：先列小節骨架，跟使用者對過一次再動筆。
3. **draft**：先寫完整，不邊寫邊修。
4. **revise**：改結構、語氣、事實核對。要大改結構就回頭改 outline，不在初稿裡搬段落。
5. **標來源**：一手來源優先。翻譯 / 改寫保留原意，語氣調整不等於竄改內容。
6. **收尾自檢**：過一遍 [common/writing](common/writing.md) 的 AI 味表與標點條款，跑上面那行 grep 與 `file`。

## 交接

- 材料還沒讀懂 → [digest](digest.md)；成品累積到難找 → [organize](organize.md)。
- 卡在使用者（要他拍板深度、提供素材）→ [WAIT_USER](../WAIT_USER.md) 一行；對外送出守鐵律 3（授權來源）。
- 跨 session 的未完成段落與待查事實 → [SESSION-LOG](../SESSION-LOG.md) 一行。

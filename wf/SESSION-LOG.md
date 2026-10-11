# SESSION-LOG — 進度（只列 open）

[INDEX](INDEX.md)｜等使用者的另記 [WAIT_USER](WAIT_USER.md)

**寫入時機，固定三條**：
1. **開始**一件多步驟工作前先寫一行 open（不是做完才寫）——硬中斷時本檔至少反映「進行中」。
2. **每次 commit 後**更新或刪除該行。
3. 條目格式固定：`- [工作流] 一句 open 狀態 → 下一步 / 連結`。完成即整條刪除，歷史交給 git log；設計決策落到 [workflows/decisions.md](workflows/decisions.md)；待使用者驗的進 [WAIT_USER](WAIT_USER.md)。

> 膨脹就拆：本檔過大就在 `wf/` 下開 `session_logs/`，按工作流拆檔＋一個 index（照 [STRUCTURE](STRUCTURE.md)）。

## 最新進度

- [interactive-study-site] 2026-10-11 新建 IoT ELI5 圖解網站，保留所有舊站；使用者授權 push／部署及順手修正查證後的原文錯誤 → 多 agent 建置、獨立驗收與發布（`專題/IoT聯網裝置/圖解物聯網/`）。

- [interactive-study-site] 第二批三課（電力電子／馬達驅動與控制／數位通訊）已上線；第三批候選 DSP／IC1／A2 待派 → 立案前先看 [workflows/interactive-study-site/README.md](workflows/interactive-study-site/README.md) 與 [decisions](workflows/decisions.md) 的譯名裁決。
- [審稿] 2026-09-26 全站審稿 52 份齊；電機（01–05、23–35）＋專題（20–22、38–47）兩輪修整完成並 push（2026-10-09，延後 165 條已全數結案，見 [fixes/延後彙整.csv](reviews/2026-09-26/fixes/延後彙整.csv)）；其餘學科 md、共通基礎 36–37、wf 49–52 的報告尚未修 → 待使用者決定是否續修。
- [審稿] 下次：複審 10/09 第二輪新寫內容（新章節：電磁學 16、計組 10、電子學 14.5、通訊／電力新章；24 科碩博延伸；數百題新遷移題答案鍵獨立重算；新 SVG 與 TCP SYN 互動；通訊整併有無漏知識點；共用 styles.css 深色模式實機看）→ 依 [fixes/HANDOFF-2](reviews/2026-09-26/fixes/HANDOFF-2.md) 同分隊、審稿派 opus。

## 各工作流 session-log

| 工作流 | session-log | open 摘要 |
|--------|-------------|----------|

## 不屬任何工作流的進度

- [對照表] 七份中英名詞對照表缺詞未補、跨課用語（庫倫／庫侖等）未統一 → 清單與「刻意保留誤寫勿誤刪」注意事項見 [wait-user/對照表缺詞.md](wait-user/對照表缺詞.md)。

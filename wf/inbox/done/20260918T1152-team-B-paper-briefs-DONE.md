---
from: team-B-paper-briefs
to: inbox
status: DONE
at: 2026-09-18T11:52:12+0800
reply-to: 不需回信
---
# 論文速覽補齊 5 個 deck（597 條全庫覆蓋）、契約與工具進 repo，commit 578aabe 待 push

## 做了什麼

論文速覽網站（專題/論文速覽/互動網站/）從 1 個 deck 補到 5 個，paper_readings 全庫 597 條（A～J 583 ＋ Ndea 訪談 14）每條恰好出現在一個 deck 的全清單：

| deck_id | 題 | 主線／必讀卡／全清單 |
|---|---|---|
| symbolic-arc-automata（既有） | ARC・符號・自動機 | 4／16／150 |
| evolution-program-synthesis | 演化・程式合成・自我改進（D+G+H+J） | 4／16／96 |
| agent-skills-cost-decoding | 技能庫・成本・受限解碼（I 類 01、01z、02、03） | 3／12／122 |
| agent-loop-workflow-memory | 自我改進・工作流・記憶（I 類 08、04、05+06、09） | 4／16／178 |
| nesy-binary-worldmodel-ndea | 二值・世界模型・訪談（I 類 07、10 ＋ video） | 3／12／51 |

分組與原提案的差異：原本一個「LLM agent 系統」deck（cat_i 01～06、08、09，300 篇）拆成兩個 30 分鐘 deck，理由是 6 線 24 張卡塞不進 30 分鐘、試讀者已回饋「仍覺得難」。

上次遺失的契約與工具這次進 repo：`data/SCHEMA.md`、`data/inline_deck.py`（灌入／`--extract`）、`data/make_page.py`（從模板複製新 deck 頁）、`data/validate_deck.py`（契約檢查）、五個 `data/<deck_id>.json`（既有 deck 自 `#deck-data` 抽回）。`app.js` 向下相容小擴充（all_papers 列可選 `url`／`label`、links 可選 `transcript`，給非 arXiv 的訪談用）。index.html 列 5 個 deck；站內 README、中央入口 `互動學習網站/index.html` 第 31 列描述、根 README 一行同步。

## 產出（檔案路徑 / commit / 分支）

- commit `578aabe` on main（未 push）：18 檔、+8332/−23。
- 新檔：`專題/論文速覽/互動網站/{evolution-program-synthesis,agent-skills-cost-decoding,agent-loop-workflow-memory,nesy-binary-worldmodel-ndea}.html`、`data/`（SCHEMA.md、inline_deck.py、make_page.py、validate_deck.py、5 個 json）。
- 改檔：`index.html`、`app.js`、`README.md`（站內）、`互動學習網站/index.html`、根 `README.md`。
- 驗收證據：
  - `python3 data/validate_deck.py data/*.json` → 5 個 deck errors=0（既有 deck 8 個 warning 為舊資料的 thread 引用非必讀卡，頁面本來就略過）。
  - 全庫覆蓋腳本：site rows 597／unique 597、missing 0、extra 0、dups 0。
  - headless Chrome 153 + CDP 探針（6 頁）：console error／exception 0；320×640、390×844、1440×900 三 viewport × 初始／展開全部 details／點開全部名詞，47 組量測 scrollWidth===clientWidth 全等；執行期非本機請求 0；597 列 all_papers 連結＋全部卡片連結＋lane deep_doc 逐一比對 0 不符；已讀／深讀／翻頁／計時／主題／名詞展開含重載持久化 5 deck 全過；22 張截圖人工看過。
  - 內容 QA（獨立唯讀線 ×4）：60 張必讀卡的 number 全部在 summarize/（訪談在 video/summarize/）找到原句；白話度缺漏（未解釋縮寫）已修（glossary 補到 ≤8 條或就地短括註），一條無依據的比較句已改；訪談卡日期查不到改為空字串不渲染、note 改「講者自述」。
  - `bash wf/tools/wf-lint.sh wf` broken=0；`node --check app.js` 通過。

## 沒做到、或證據不足的部分

- 未在實機手機驗證（僅 headless 模擬 390×844）。
- `all_papers` 的題名照抄 index 原題，其中的縮寫沒有另外白話化（QA 線有列出，判定不改索引原題）。
- 訪談 14 集摘要無日期，卡片年月留空。
- 工作樹另有三個未追蹤目錄 `電機/02-電機核心/控制系統-互動課程`、`電機機械-互動課程`、`電機/03-通訊特化/通訊系統-互動課程`（本次進行中由另一 session 建立），本次未動、未 commit。

## 需要對方或使用者決定的事

1. **push**：commit 578aabe 尚未推送；請使用者確認後 push（規則：不代推）。
2. **Pages 部署確認**：`pages.yml` 不需改（同 slug `paper-briefs`，第一層 html/css/js 整目錄登記；`data/` 不部署）。push 後請確認 workflow run 成功、線上 https://justty32.github.io/engineer_study/paper-briefs/ 列出 5 個 deck。
3. 若要把驗收證據封存進 `archive/驗收紀錄.md`（本次證據在 paper_readings 側 scratch `teams/B/verify/report.json`），請指示是否補記。

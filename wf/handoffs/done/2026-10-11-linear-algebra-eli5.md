# 線性代數 ELI5 新站完成交接

使用者於 2026-10-11 compact 後指示「開始線性代數吧」。延續另建新站、保留舊站、繁中 ELI5、大量原創圖解、重排章節與補入門、查證並修正來源、主要委派 agents、自由 push／部署授權。compact 前背景見 [原交接](../2026-10-11-linear-algebra-after-compact.md)。開工 main 為 `5e698f290bdb51a695aa56feef8215934c377029`。

## 範圍與分工

新站為 `共通基礎/數學/圖解線性代數/`，只發布 `dist/` 的 HTML／CSS／JavaScript；slug 為 `linear-algebra-little-lab`。採原生程式與 inline SVG、獨立 `lab.css`，無外部執行依賴或點陣圖片。原有工程數學、微積分及 IoT 網站均保留。未追蹤 `nvim.log` 全程禁讀改與提交。

root 調度、審規格與 Sites 身分／發布；builder 管理新站與四位互斥章節作者；audit 唯一讀取外部教材並僅改 `02-線性代數.md`；QA 持有獨立驗收紀錄；clarity 唯讀抽審五頁；publish 持有 GitHub CI、中央入口及共通 README，root 驗收放行後負責 commit／push／部署核對，最後串行接手驗收與工作流收尾。模型沿用環境實際可用模型，不宣稱使用舊文件中的 Claude 模型。所有產品檔一檔一作者，來源查證由 root 每批至多四頁放行。

全輪禁止 GUI、桌面截圖、鍵鼠與焦點操作，不新增依賴。QA 使用已存在的 headless Chromium。舊站與非指定筆記唯讀；數學名詞表本輪沒有必要新增。

## 驗收

1. 原文十組核心概念、先備入口、導航、字典與來源可追溯。
2. 每個實驗的公式、預設、邊界與重設由獨立 QA 驗算。
3. UTF-8、語法、連結、桌機／手機、鍵盤與離線驗收通過。
4. GitHub 成品與 QA 雜湊相符，Sites 獨立部署成功，舊站保留。
5. 所有子線停筆與自有行程退出，人工待驗與完成證據落檔。

## 完成證據

來源十組核心概念都有教學落點，零基礎入口、分章導覽、字典與參考頁齊全。新站共 18 頁（15 章＋首頁／字典／來源），16 個主要實驗、36 張 inline SVG、48 詞搜尋字典；產品為 18 HTML、18 JavaScript、1 CSS，共 37 檔。BRIEF、SPEC、16 組互動契約與派工紀錄已完成。

獨立 QA 的 967 項頁面／連結檢查、2,740 項數值互動檢查、158 項導航／鍵盤／離線檢查全部通過，共 3,865 項主驗證；5 個 HTML 局部修正再通過 299 項檢查。涵蓋 18 頁 × PC／手機、592 條相對連結、198 組獨立數學情境 × 2 視窗，以及 320px 窄畫面。沒有未解產品缺陷、外部自動請求、console／JS／HTTP 錯誤或整頁溢出，18 頁可離線開啟。

audit 另以 9 份 MIT／Stanford 一手教材查核，完成 1,253 項規格代數斷言及全產品數學終審；不將此數字與產品互動測試混加。原文有 6 組必要修正或條件補齊、2 組精確化，未把全部描述為算術錯誤：向量空間公理、系統可解條件、連續／離散穩定性、振動角頻率模型、正交與統計不相關的區別、矩形 QR 條件，以及 PCA／SVD 的尺寸與定義。教學抽審、主互動與補圖數學問題皆已修妥。

UTF-8、18 個 JS 語法、相對連結與 fragment 均通過；17 門舊課共用樣式零漂移。`wf-lint` 保留兩筆開工即存在的 2026-09-26 歷史引用斷鏈，未增加新斷鏈，未改寫舊引文假造全綠。

GitHub Pages 與獨立 Sites 已部署成功；全部新成品對上 QA 受驗雜湊，舊站仍可開啟，詳下方。

完整結果見 [新站驗收紀錄](../../../共通基礎/數學/圖解線性代數/驗收紀錄.md)。QA 暫存 `/tmp/linear-algebra-qa/`、數學終審 `/tmp/linear-algebra-audit/final-review.txt`、教學抽審 `/tmp/linear-algebra-clarity.txt` 可能被環境清理；本交接與驗收紀錄保存持久結論。

## 發布證據

[GitHub Pages 公開版](https://justty32.github.io/engineer_study/linear-algebra-little-lab/) 已上線。產品 commit 為 `ab526e2cfb378fea4a44e2414d3cae99e26242da`；[部署工作 38104247309](https://github.com/justty32/engineer_study/actions/runs/38104247309) 的 build 與 deploy 均成功。43 次公開 HTTP 檢查全數 200：37 個新成品與中央入口 HTML／CSS 共 39 檔逐一 SHA256 相符；原有工程數學、微積分圖解、IoT 圖解、IoT 主站四入口正常。中央入口增加至 40 課，原 39 個 slug 未移除。四組舊站 89 個本機檔案與開工雜湊相同。

受驗產品 manifest 自身 SHA256 為 `4b583d97fd237a826abce11ff3c9e107bbe5030e349c4e6d09d02c54831ba1b4`；公開核對與工作流證據在 `/tmp/linear-algebra-publication/http-results.json`、`github-run.json`。第一個 commit 精確包含 52 個本案檔，未加入 `nvim.log` 或暫時建置進度。

[Sites 版本](https://linear-algebra-little-lab.bronzetern2.chatgpt.site) 於 2026-10-11T02:09:48Z 原生部署回傳 `succeeded`，維持 owner-private。獨立 project `appgprj_6acaeba52be88191b1baa402a3ae277c`，source commit `379b2db503821efdcfcca0f41f7383d72d32e65a`；完整 version／deployment 識別值保存在驗收紀錄。隔離 checkout `/tmp/linear-algebra-eli5-hosted` 的 37 檔在封裝前與 QA manifest 一致，沒有上傳整個筆記庫或沿用舊站身分。公開分享入口使用 GitHub Pages。

## 收線與人工待驗

builder、四位作者、audit、QA、clarity 已停筆；QA server／headless、root 的 Sites source helper 與 publish 的 workflow watch／HTTP 驗證行程均已退出，沒有本案 GUI 或桌面資源鎖。dispatch 已移歷史、ROSTER 已收線、SESSION 已移除本次 open；待真人項列於 [共通基礎實機驗收](../../wait-user/實機驗收-共通通訊電力.md)，該類別 open 由 8 增為 9。

真人 PC 字體／圖表與教學節奏、手機觸控與補圖閱讀、Safari／Firefox、螢幕閱讀器仍待人工；headless 結果不等於已做實機驗收。此線完成，不自動啟動其他科目。

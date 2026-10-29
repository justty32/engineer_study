# ROSTER — 誰在線上、各自是誰（身份聲明簿）

[inbox README](README.md)｜格式與 STATUS [PROTOCOL](PROTOCOL.md)

**動工前先在這裡追加自己那一格，並讀完別人的。** 不知道對方是誰，就不要假設它會做什麼、更不要替它做——猜錯的代價是兩條線寫同一份檔案。本檔同時是**通訊錄**（怎麼找到誰）和**邊界聲明**（誰可以寫哪裡）。

## 規則

1. 上線第一件事：在「現役成員」下**追加自己那格**（不要改別人的），再寄一封 `PROGRESS` 給上游（升級後佈局用 `inbox_mail.sh <我> --up PROGRESS '…'`）、正文貼上那格內容——這樣別人不必輪詢本檔也知道你上線了。
2. 收線**不要刪自己那格**，把「狀態」改成 `已收線（YYYY-MM-DD）`。歷史留著，別人才知道誰做過什麼。
3. 本檔是**快取，可能不全**。沒列到的對象問使用者，或直接去對方資料夾確認它有 `inbox/`、收什麼信——**權威永遠是對方資料夾自己**。
4. 已收線的格子堆多了就整段封存（照 [STRUCTURE](../../STRUCTURE.md) 的 archive 規則）；已收線的線不要再回填本檔，封存與整理歸調度者。

**地址規則**：inbox 路徑是**機器本地的**，換一台機器就不一樣，**每台機器各自維護這份簿子**。若所有對象都掛在同一個共同 root 底下，改成寫**相對那個 root 的路徑**，並在本檔頂端寫明 root 怎麼定（例：`$REPOS/`），換機只改 root 一處。

## 格式

```markdown
### `<名字>`
- **狀態**：現役 / 已收線（YYYY-MM-DD）
- **我是誰**：一句話。調度者、主線、子線，還是一次性的子 agent。
- **團隊**：`teams/<團隊名>`，或「無」。決定我的終局回報會被路由到哪一格。
- **上游**：我對誰回報（**有團隊就是該團隊 `members` 的第一行；沒團隊就是頂層**）。
- **領地**：我可寫哪些路徑（其他人別碰）。
- **答得出什麼**：別人可以拿什麼問題來問我。
- **答不出什麼**：明講邊界，省得別人白等。
- **怎麼找我**：我的 inbox 路徑。
- **訂閱主題**：列出你用 --topics 在追的 topics/<主題名>；沒訂閱就寫「無」。自己的團隊信箱會被自動發現，不必列在這裡。
```

## 現役成員

本表 **project-owned**（kernel 升級不覆蓋）。地址寫相對本 repo 根的路徑；跨 repo 的對象上線時自己追加一格。

### `engineer_study-lead`
- **狀態**：現役
- **我是誰**：本 repo 的頂層 agent（Claude Opus 5）：接使用者指令、開團隊、指揮／彙整／決策，不親自動手寫產品檔；工人層見 [team-model](../team-model.md)。
- **團隊**：無（開建課或整理批次時才用 `inbox_team.sh` 臨時開一格 `teams/<批次名>`）。
- **上游**：使用者本人。
- **領地**：本 repo 全部（`/home/lorkhan/repo/engineer_study/`）；派線時各線的領地登記在 [dispatch](../dispatch/README.md) 領地表。
- **答得出什麼**：本庫筆記結構與慣例（PROJECT-GUIDE）、互動課程產線與各課狀態、Pages 掛站、工作流骨架（wf/）。
- **答不出什麼**：實機瀏覽器／觸控驗收與 push（都要使用者）；其他 repo 的內容。
- **怎麼找我**：`wf/inbox/mail/engineer_study-lead/`（升級後佈局；單一收件匣佈局投 `wf/inbox/`）。
- **訂閱主題**：無。

已收線成員見 [2026-10-11 ELI5 團隊歷史](ROSTER-HISTORY-2026-10-11.md)及[計算課程續篇](ROSTER-HISTORY-2026-10-11-2.md)。

已收線聽課團隊見 [2026-10-14 聽課歷史](ROSTER-HISTORY-2026-10-14.md)。

### `circuit-listening-production`
- **狀態**：已收線（2026-10-14）
- **我是誰**：電路聽課總製作隊長，現行模型，帶分課隊與獨立驗收。
- **團隊**：circuit-listening-production（內建通道）
- **上游**：root
- **領地**：新課規格、wf 行政、聽課路線與原課最小導航；各子線互斥。
- **答得出什麼**：電路核心覆蓋、產線進度與驗收。
- **答不出什麼**：使用者聽感、角色聲線及發布。
- **怎麼找我**：內建 agent /root/curriculum_production_lead。
- **訂閱主題**：無。

### `power-team`
- **狀態**：已收線（2026-10-14；待上游新派工）
- **我是誰**：交流功率與功率因數分課隊長及其互斥講稿／前端子線，現行模型。
- **團隊**：circuit-listening-production（內建通道）
- **上游**：curriculum_production_lead
- **領地**：功率課已驗收收線；續製電路學-互動課程/聽課-暫態與微分方程/，驗收紀錄保留獨立 QA。
- **答得出什麼**：本課內容、建置與進度。
- **答不出什麼**：其他科目、語音生成、發布。
- **怎麼找我**：內建 agent /root/curriculum_production_lead/power_team。
- **訂閱主題**：無。

### `network-team`
- **狀態**：已收線（2026-10-14）
- **我是誰**：節點分析與等效電路分課隊長及其互斥講稿／前端子線，現行模型。
- **團隊**：circuit-listening-production（內建通道）
- **上游**：curriculum_production_lead
- **領地**：網路課已驗收收線；續製電路學-互動課程/聽課-頻率響應與共振/，驗收紀錄保留獨立 QA。
- **答得出什麼**：本課內容、建置與進度。
- **答不出什麼**：其他科目、語音生成、發布。
- **怎麼找我**：內建 agent /root/curriculum_production_lead/network_team。
- **訂閱主題**：無。

### `transformer-team`
- **狀態**：已收線（2026-10-14）
- **我是誰**：變壓器與三相分課隊長及互斥講稿／前端子線，現行模型。
- **團隊**：circuit-listening-production（內建通道）
- **上游**：curriculum_production_lead
- **領地**：電路學-互動課程/聽課-變壓器與三相/；驗收紀錄保留獨立 QA。
- **答得出什麼**：本課範圍、數學與建置。
- **答不出什麼**：語音生成、其他科目、發布。
- **怎麼找我**：內建 agent /root/curriculum_production_lead/transformer_team。
- **訂閱主題**：無。

### `electronics-listening-production`
- **狀態**：已收線，electronics-resume 已接續完成（2026-10-15）
- **我是誰**：電子學聽課製作隊長；diode_author／rectifier_author／bjt_author 三條互斥作者線，qa_power／qa_network 獨立驗收，現行模型。
- **團隊**：electronics-listening-production（內建通道）
- **上游**：root
- **領地**：當時負責電子學聽課與入口、共用 wf 行政及原相位音訊紀錄；現已釋放。
- **答得出什麼**：電子學核心路線、教學與建置。
- **答不出什麼**：語音生成、角色聲線與發布。
- **怎麼找我**：內建 agent /root/electronics_em_bridge。
- **訂閱主題**：無。

### `phase-full-audio`
- **狀態**：關機前暫停，已停止寫入；下次依使用者指示續作
- **我是誰**：原相位與複數十九段音訊生成及驗收線。
- **團隊**：無
- **上游**：root
- **領地**：原相位與複數音訊、manifest 與音訊驗收；不碰其他課或共用 wf。
- **答得出什麼**：原授權兩堂音檔的生成、速度與驗收。
- **答不出什麼**：新課產音、角色音色。
- **怎麼找我**：內建 agent /root/full_audio_generation。
- **訂閱主題**：無。

電磁原總製作隊與兩批續作隊均已收線（2026-10-15），詳見[電磁名冊與完成證據](ROSTER-EM.md)。

[電子續作收線名冊](ROSTER-ELECTRONICS-2026-10-15.md)


### `state-records-20261029`
- **狀態**：已收線（2026-10-29）
- **我是誰**：wf_review 協調；course_rules_state／knowledge_rules 寫紀錄，現行模型。
- **團隊**：內建通道。
- **上游**：root；子線回報 wf_review。
- **領地**：[限定檔案](../../handoffs/done/2026-10-29-state-records.md)。
- **答得出什麼**：紀錄校正與驗收分工。
- **答不出什麼**：未重驗的課程／音訊品質。
- **怎麼找我**：內建 /root/wf_review。
- **訂閱主題**：無。

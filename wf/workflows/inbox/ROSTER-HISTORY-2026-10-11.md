# 2026-10-11 ELI5 團隊收線名簿

[現役 ROSTER](ROSTER.md)｜各組完成證據沿用下列交接連結。

### `iot-eli5-root`
- **狀態**：已收線（2026-10-11）
- **我是誰**：本輪 Codex 調度與發布者；使用者授權多 agent、push／部署、新站自訂設計。
- **團隊**：IoT ELI5（collaboration 通道）。
- **上游**：使用者本人。
- **領地**：工作流狀態、部署 CI、總入口與來源 index；產品寫入另派。
- **答得出什麼**：本輪範圍、發布、驗收與 agent 邊界。
- **答不出什麼**：未查證硬體結論、真人觸控體驗。
- **怎麼找我**：collaboration `/root`。
- **訂閱主題**：無。

### `iot-eli5-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：builder 管理線、source-audit 原文查證、reference 教材查詢、qa 獨立驗收；均繼承本輪可用模型。
- **團隊**：IoT ELI5（collaboration 通道）。
- **上游**：`iot-eli5-root`。
- **領地**：依 [本輪交接書](../../handoffs/done/2026-10-11-iot-eli5.md) 與 [dispatch](../dispatch/README.md)；builder 子線依新站派工契約互斥。
- **答得出什麼**：各自範圍的建置、證據與待修缺陷。
- **答不出什麼**：發布授權與跨領地改動。
- **怎麼找我**：collaboration `/root/iot_builder`、`/root/iot_source_audit`、`/root/iot_reference`、`/root/iot_qa`。
- **訂閱主題**：無。

### `iot-publish`
- **狀態**：已收線（2026-10-11）
- **我是誰**：本輪發布與工作流收尾子 agent；root 明確放行後才 commit／push。
- **團隊**：IoT ELI5（collaboration 通道）。
- **上游**：`iot-eli5-root`。
- **領地**：root 授權的本輪工作流收尾檔；builder／qa 交接後的新站部署紀錄。
- **答得出什麼**：GitHub Pages 發布、遠端成品一致性與工作流收尾證據。
- **答不出什麼**：產品程式、原文判讀、真人觸控體驗與 Sites 發布。
- **怎麼找我**：collaboration `/root/iot_publish`。
- **訂閱主題**：無。

### `calculus-eli5-root`
- **狀態**：已收線（2026-10-11）
- **我是誰**：本輪 Codex 調度與 Sites 發布者；本輪模型沿用實際可用預設。
- **團隊**：微積分 ELI5（collaboration 通道）。
- **上游**：使用者本人。
- **領地**：工作流狀態、Sites 身分與發布；產品與 GitHub 接線另派。
- **答得出什麼**：範圍、授權、驗收、發布與各線邊界。
- **答不出什麼**：未查證數學結論與真人觸控體驗。
- **怎麼找我**：collaboration `/root`。
- **訂閱主題**：無。

### `calculus-eli5-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：builder 與四位子作者、audit 來源查核、qa 獨立驗收、clarity 教學抽審、publish GitHub 發布；沿用本輪可用模型。
- **團隊**：微積分 ELI5（collaboration 通道）。
- **上游**：`calculus-eli5-root`；子作者向 builder 回報。
- **領地**：依 [本輪交接書](../../handoffs/done/2026-10-11-calculus-eli5.md)；子作者依新站派工契約互斥。
- **答得出什麼**：各自範圍的建置、查證、測試與部署證據。
- **答不出什麼**：跨領地改動、真人體驗與新題目授權。
- **怎麼找我**：collaboration `/root/calculus_builder`、`/root/calculus_audit`、`/root/calculus_qa`、`/root/calculus_clarity`、`/root/calculus_publish`。
- **訂閱主題**：無。

### `linear-algebra-eli5-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：Codex root 調度／Sites；builder 與子作者建置、audit 查核、qa 獨立驗收、clarity 教學抽審、publish 接線發布；沿用實際可用模型。
- **團隊**：線性代數 ELI5（collaboration 通道）。
- **上游**：使用者 → root；各子線向 root，章節作者向 builder。
- **領地**：依 [本輪交接](../../handoffs/done/2026-10-11-linear-algebra-eli5.md)，產品檔單一作者。
- **答得出什麼**：各自範圍的建置、教材查證、驗收與部署證據。
- **答不出什麼**：真人體驗與未查證的數學結論。
- **怎麼找我**：collaboration `/root`、`/root/linear_builder`、`/root/linear_audit`、`/root/linear_qa`、`/root/linear_clarity`、`/root/linear_publish`。
- **訂閱主題**：無。

### `linear-visual-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：Codex root 調度與 Sites；visual_builder 為完整隊長，統籌章節作者、教學審查、圖像數學查核與獨立驗收；visual_publish 串行發布，沿用可用模型。
- **團隊**：線代逐步圖解改版。
- **上游**：root 對使用者；作者與審查驗收向 visual_builder 收斂；隊長向 root 回報，正式凍結證據直接交 visual_publish。
- **領地**：依 [本輪交接](../../handoffs/done/2026-10-11-linear-algebra-visual-revision.md)。
- **答得出什麼**：逐步圖解、教學門檻與驗收發布證據。
- **答不出什麼**：未查證的結論、真人是否看懂。
- **怎麼找我**：collaboration `/root` 與 `visual_builder`、`visual_pedagogy`、`visual_math`、`visual_qa`、`visual_publish`。
- **訂閱主題**：無。

### `robotics-math-visual-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：robotics_team 為機器人數學圖解新站隊長，自組作者及獨立審查／QA。
- **團隊**：機器人數學圖解新站。
- **上游**：隊長對 root；子線對隊長。
- **領地**：`專題/機器人運動學/圖解機器人數學/`，詳 [交接](../../handoffs/done/2026-10-11-robotics-math-visual.md)；舊站與其他隊唯讀。
- **答得出什麼**：機器人數學圖解公式、手算應用、詳解練習及查核。
- **答不出什麼**：真人體驗、共享行政與發布時機。
- **怎麼找我**：collaboration `/root/robotics_team`。
- **訂閱主題**：無。

### `linear-calculation-v3-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：visual_builder 重啟線代公式計算補強，統籌作者與獨立驗收。
- **團隊**：線代 v3。
- **上游**：隊長對 root；子線對隊長。
- **領地**：線代圖解站，排除 `.openai/`，詳 [交接](../../handoffs/done/2026-10-11-linear-algebra-calculation-revision.md)；v2 歷史不改。
- **答得出什麼**：題目、圖與公式對照、逐行手算、檢查與詳解練習。
- **答不出什麼**：真人是否會算、跨隊及發布時機。
- **怎麼找我**：collaboration `/root/visual_builder`。
- **訂閱主題**：無。

### `engineering-math-visual-team`
- **狀態**：已收線（2026-10-11）
- **我是誰**：engineering_math_team 為新圖解工程數學隊長，自組作者、教材查證及獨立 QA，沿用實際可用模型。
- **團隊**：工程數學圖解新站。
- **上游**：隊長對 root；子線對隊長。
- **領地**：`共通基礎/數學/圖解工程數學/` 及數學目錄的 `03-工程數學-上.md`／`03-工程數學-中.md`／`03-工程數學-下.md` 的 20 項官方確證修正（另一人覆核），詳 [交接](../../handoffs/done/2026-10-11-engineering-math-visual.md)；舊站與其他隊唯讀。
- **答得出什麼**：二階 ODE／RLC、相量、轉換及 PDE 的圖解公式、手算、詳解與查證。
- **答不出什麼**：真人體驗、共享行政與發布時機。
- **怎麼找我**：collaboration `/root/engineering_math_team`。
- **訂閱主題**：無。

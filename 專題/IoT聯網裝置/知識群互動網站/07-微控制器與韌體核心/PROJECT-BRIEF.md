# Project Brief

## 讀者與理解債

- 資深 C／C++ 工程師，不需語法或物件導向入門。
- 硬體與計算機組織基礎都薄弱；不得假設已懂 bit／hex、clock、CPU 取指令、address、bus、Flash／RAM 或兩種 register 的差別。
- 不以考題、名詞背誦、RTOS 排程公式或特定廠商 HAL API 作為主線。

## 學習成果

讀者能把 `reset → startup → main → MMIO → peripheral event → ISR/DMA → buffer/state machine → measurement/fault evidence` 說成同一條生命線，並能開始閱讀任一 Cortex-M 類 MCU 的 datasheet、reference manual、linker map 與原理圖。

## 教學模式

- 原理優先、術語首次白話翻譯、自由實驗即時回饋。
- 主線前新增零基礎章；另有可搜尋字典，每個詞提供中文／英文、白話功能與「不要混淆」。
- 所有模型都指出實體硬體、執行上下文、資料所有權或量測證據。
- 公式標示單位與簡化邊界；不把示意 CPU 負擔當作效能保證。

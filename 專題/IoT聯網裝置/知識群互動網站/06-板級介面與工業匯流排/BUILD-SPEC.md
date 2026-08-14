# 建置規格

## 資訊架構

六個模組鍵為 `basics`、`i2c`、`spi`、`rs485`、`modbus`、`debug`，預估時間依序為 3、6、6、7、5、3 分鐘。第一個 viewport 必須直接顯示學習路徑、當前任務與硬體詞翻譯器。

另有原理優先入口 `hardware-principles.html`＋`principles.js`，不載入主頁 `app.js`，避免兩頁 DOM 契約互相污染。章節依賴為 V／I／R → RC → 推挽／開漏 → 上拉 → 差動／共模 → 傳輸線 → 反射／終端 → 偏壓 → 量測。

單一介面深讀頁為 `gpio-principles.html`＋`gpio.js`、`i2c-principles.html`＋`i2c.js`、`spi-principles.html`＋`spi.js`、`rs485-principles.html`＋`rs485.js`。各頁只初始化自己的 DOM；共用 `styles.css` 與頁間導覽。

## 互動契約

- 名詞按鈕 `data-term`：更新 `term-title`、`term-plain`、`term-effect`。
- 上拉原理實驗：切換開漏電晶體「放手／接地」，顯示節點電壓、穩態電流與完整回路；調阻值時以 $I=V/R$ 更新。
- 終端原理實驗：調負載 $R_L$，以 $\Gamma=(R_L-Z_0)/(R_L+Z_0)$ 顯示反射方向、振幅與能量去向。
- I²C：以 $t_r \approx 0.8473R_pC_b$ 估算上升時間；100 kHz 與 400 kHz 教學門檻分別為 1000 ns 與 300 ns。
- SPI：選 mode 0～3，依 CPOL／CPHA 顯示閒置電位、取樣邊緣與錯誤症狀。
- RS-485：線型／星狀拓樸、兩端終端、閒置偏壓與 DE 切換共同決定診斷。

## 原理圖與設計延伸頁

- `schematic-reading.html` + `schematic-reading.js`：六步讀圖、符號情境翻譯、3.3 V／I²C／RS-485 三條網路追蹤，以及 datasheet 限制檢查。
- `circuit-design.html` + `circuit-design.js`：12 V IoT 板需求、LDO 熱損、瞬態儲能、30% 電流裕度、功能方塊與可切換設計審查。
- 兩頁均不得用計分或答對解鎖；所有互動都要直接說出電流、電壓、能量或可量測的失敗因果。
- Modbus RTU：產生 address、function、start、count、CRC-16；以 11 bits/字元估算 3.5 字元靜默時間。
- Debug：逐層展開物理、位元組、封包與韌體證據，不使用正誤題。
- 完成度由每段至少一次有效操作自動記錄至 localStorage；仍允許自由瀏覽與重設。

## 介面與技術

- 無圖片、SVG、Canvas、外部字型、CDN、遠端 API 或第三方套件。
- 單一 `aria-live` 摘要區；鍵盤可操作、focus 可見、狀態不只靠顏色。
- 760px 以下改為單欄；所有控制項至少 44px；不得水平溢位。

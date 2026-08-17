# 30 分鐘板級介面與工業匯流排

這是一個給熟悉 C／C++、但硬體基礎不穩的讀者使用的互動網站。主線用同一塊 IoT 控制板串起 I²C 感測器、SPI Flash，以及以 RS-485／Modbus RTU 連接的現場設備。

線上版本：[GitHub Pages／板級介面與工業匯流排](https://justty32.github.io/engineer_study/iot-hardware-bus/)

- [硬體原理補課](hardware-principles.html)：不計時、不考試；先從回路、電荷與行波理解「為什麼」。
- [GPIO 原理與實例](gpio-principles.html)：LED、按鈕、浮接、限流、去彈跳與外部 MOSFET。
- [I²C 原理與實例](i2c-principles.html)：開漏共線、上拉、交易步驟、位址與 RC 上升時間。
- [SPI 原理與實例](spi-principles.html)：移位暫存器、全雙工、CS、Mode 與有效吞吐。
- [RS-485 原理與實例](rs485-principles.html)：差動、共模、DE、拓樸、終端與偏壓。
- [怎麼看懂電路圖](schematic-reading.html)：用固定六步讀圖法拆電源、功能區塊、網路與回流路徑。
- [怎麼做電路設計](circuit-design.html)：以一塊 12 V IoT 控制板走過需求、電源、MCU、介面、保護與驗證。
- [30 分鐘介面主線](index.html)：學過必要原理後，用參數與情境建立實作速查。
- [下一大段：微控制器與韌體核心](../07-微控制器與韌體核心/index.html)：reset、記憶體、暫存器、中斷、DMA、timer、ADC/PWM、架構與除錯。

可直接開啟任一 HTML，或在本目錄啟動任一靜態 HTTP server。

主要來源：

- [E1 嵌入式系統基礎](../../../../電機/09-嵌入式特化/E1-嵌入式系統基礎.md)
- [E3 嵌入式韌體與驅動](../../../../電機/09-嵌入式特化/E3-嵌入式韌體與驅動.md)
- [微處理器與微控制器](../../../../電子/04-數位電路與系統/10-微處理器與微控制器.md)
- [IoT 聯網裝置總覽](../../index.md)
- [硬體：PCB 設計實務](../../硬體-PCB設計實務.md)
- [硬體：電源與電池](../../硬體-電源與電池.md)
- NXP《I²C-bus specification and user manual》UM10204
- TI《The RS-485 Design Guide》SLLA272B
- Modbus Organization《Serial Line Protocol and Implementation Guide》與《Application Protocol V1.1b3》

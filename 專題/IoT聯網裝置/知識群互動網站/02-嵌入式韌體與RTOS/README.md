# IoT 嵌入式韌體、驅動與 RTOS 互動學習網站

← [知識群路線圖](../../知識群互動網站-路線圖.md)｜[韌體架構與電源管理](../../韌體-架構與電源管理.md)｜[E1](../../../../電機/09-嵌入式特化/E1-嵌入式系統基礎.md)｜[E2](../../../../電機/09-嵌入式特化/E2-即時作業系統.md)｜[E3](../../../../電機/09-嵌入式特化/E3-嵌入式韌體與驅動.md)

本網站用八個互動模組串起架構選擇、非阻塞迴圈、ISR、驅動 I/O、RTOS 排程與同步、低功耗及故障復原。執行期只有 `index.html`、`styles.css`、`app.js`，不需安裝套件。

預定 GitHub Pages：<https://justty32.github.io/engineer_study/iot-firmware-rtos/>

## 本機啟動

```bash
python3 -m http.server 4176 --directory '專題/IoT聯網裝置/知識群互動網站/02-嵌入式韌體與RTOS'
```

瀏覽 `http://127.0.0.1:4176/`。

## 模型邊界

- event loop 與 ISR 是保守時序預算，不替代量測 WCET 或完整 RTA。
- RMS bound 是充分條件；超過 bound 不等於不可排程。
- DMA 模型不含匯流排競爭、cache 或周邊限制。
- 低功耗模型不含穩壓效率、電池曲線與各模式切換細節。
- 復原 gate 不代表 secure boot、安全更新、功能安全或量產驗證完成。

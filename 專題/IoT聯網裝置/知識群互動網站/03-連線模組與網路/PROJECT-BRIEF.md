# IoT 連線模組、協定與網路互動網站專案簡報

← [知識群路線圖](../../知識群互動網站-路線圖.md)｜[連線模組整合](../../韌體-連線模組整合.md)｜[E5](../../../../電機/09-嵌入式特化/E5-IoT與邊緣運算.md)｜[計算機網路](../../../../電機/03-通訊特化/19-計算機網路.md)

## 目標

把「選哪種連線」一路接到 host 介面、AT/URC 引擎、重連、socket/TLS 會話、資料量與低功耗可達性，形成可操作的裝置端連線工作台。

## 八個學習成果

1. 依距離、資料量、供電、基礎設施與下行需求篩選 bearer。
2. 用 UART 容量與 burst buffer 判斷是否需要 RTS/CTS、DMA 或更快介面。
3. 正確分流 AT 回應、URC、prompt 與透明資料。
4. 用有上限的指數退避避免斷線時狂重連。
5. 依固定層次重建註冊、IP、時間/DNS、socket、TLS 與應用會話。
6. 量化 payload 編碼、協定 overhead 與重送造成的資料預算。
7. 比較 keepalive 與每次重連的網路 bytes，並保留 PSM/eDRX 的能源取捨。
8. 依無回應、掉註冊、socket drop、buffer overflow 安排 supervisor 動作。

## 邊界

- 聚焦 host 與外購連線模組的接合；不實作 Wi-Fi、蜂巢式或 LPWAN PHY/MAC。
- MQTT/CoAP/TCP/TLS 只保留裝置端選擇與成本，不重述軟體本科內容。
- TLS 憑證信任、secure element、佈建與退役留給安全量產站。
- 天線匹配、link budget、EMC 與法規留給 RF 站。
- 純靜態、零外部資產、手機可操作，不抓取或生成圖片。

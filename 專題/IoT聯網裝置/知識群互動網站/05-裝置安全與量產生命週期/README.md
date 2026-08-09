# IoT 裝置安全、佈建、量產與生命週期互動學習網站

← [知識群路線圖](../../知識群互動網站-路線圖.md)｜[E5 IoT](../../../../電機/09-嵌入式特化/E5-IoT與邊緣運算.md)｜[E3 韌體](../../../../電機/09-嵌入式特化/E3-嵌入式韌體與驅動.md)｜[韌體架構](../../韌體-架構與電源管理.md)｜[量產與認證](../../量產-測試與法規認證.md)

八個模組涵蓋 threat model、device identity、secure boot、OTA 容量、更新復原、產線佈建、階段證據與機群退役。runtime 只有三個靜態檔案。

GitHub Pages：<https://justty32.github.io/engineer_study/iot-security-production/>

```bash
python3 -m http.server 4179 --directory '專題/IoT聯網裝置/知識群互動網站/05-裝置安全與量產生命週期'
```

所有決策與 gate 都是教學模型，不取代正式 threat model、滲透測試、密鑰管理、產線稽核、安全認證或法律判定。

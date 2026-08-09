# 電力系統互動學習網站

← [P1 上篇](../P1-電力系統-上.md)｜[P1 下篇](../P1-電力系統-下.md)｜[專案簡報](PROJECT-BRIEF.md)

本目錄將 P1 電力系統上下篇整理成零依賴的互動學習工作台。執行期只使用 `index.html`、`styles.css`、`app.js`，不需安裝套件。

線上版本：[GitHub Pages / 電力系統](https://justty32.github.io/engineer_study/power-systems/)

## 本機啟動

在 repo 根目錄執行：

```bash
python3 -m http.server 4174 --directory '電機/04-電力特化/P1-電力系統-互動網站'
```

完成後瀏覽 `http://127.0.0.1:4174/`。

## 模型邊界

- 高壓輸電只比較固定實功、功率因數與每相電阻下的 $I^2R$ 損失。
- DC 潮流忽略電阻、損失、無功與電壓幅值變化。
- 故障模型使用理想序網等效；不含故障阻抗、暫態衰減與 CT 飽和。
- 保護時間使用教學反時限式，不代表 IEC/IEEE 電驛曲線或正式整定。
- 穩定與頻率模型是單機等值與 aggregate droop 近似。
- 經濟調度為兩機、無網損、無啟停限制的教學模型，不是 UC 或市場出清。

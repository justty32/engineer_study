# IoT 板級電源與 PCB 互動學習網站

← [知識群路線圖](../../知識群互動網站-路線圖.md)｜[電源與電池](../../硬體-電源與電池.md)｜[PCB 設計實務](../../硬體-PCB設計實務.md)

本網站以電源樹、穩壓器、電池、去耦、原理圖、回流路徑、RF layout 與 bring-up 串起 IoT 板級硬體的主要設計證據。執行期只有 `index.html`、`styles.css`、`app.js`，不需安裝套件。

GitHub Pages：<https://justty32.github.io/engineer_study/iot-power-pcb/>

## 本機啟動

```bash
python3 -m http.server 4175 --directory '專題/IoT聯網裝置/知識群互動網站/01-板級電源與PCB'
```

瀏覽 `http://127.0.0.1:4175/`。

## 模型邊界

- 電源樹用固定 rail 電壓與加總裕度，不代替 regulator datasheet 或 worst-case analysis。
- buck 熱比較沿用相同 $\theta_{JA}$ 作教學近似；真實熱路徑與封裝不同。
- 電池壽命未含溫度、老化、脈衝能力與完整自放電模型。
- 去耦模型未含 ESL、頻率響應與 regulator control loop。
- SI、RF、EMC、ESD、DFM 模組是 review gate，不是阻抗、場模擬、認證或量產 sign-off。

# GitHub Pages 部署契約

← [工作流入口](README.md)｜[品質關卡](QUALITY-GATES.md)

## 目標結構

同一個 Pages 網站提供主題總入口，案例放在穩定的 ASCII 路徑：

```text
/
  index.html
  iot-device/
    index.html
    styles.css
    app.js
  power-systems/
    index.html
    styles.css
    app.js
  iot-power-pcb/
    index.html
    styles.css
    app.js
  iot-firmware-rtos/
    index.html
    styles.css
    app.js
  iot-connectivity/
    index.html
    styles.css
    app.js
  iot-rf-antenna/
    index.html
    styles.css
    app.js
  iot-security-production/
    index.html
    styles.css
    app.js
  iot-hardware-bus/
    index.html
    hardware-principles.html
    gpio-principles.html
    i2c-principles.html
    spi-principles.html
    rs485-principles.html
    schematic-reading.html
    circuit-design.html
    styles.css
    *.js
  iot-mcu-firmware/
    index.html
    00–06 課程頁
    名詞與概念字典.html
    styles.css
    app.js
```

原始碼仍留在各知識來源的 `互動網站/` 目錄；GitHub Actions 只在 runner 上組合 `_site/` artifact，不把產出複製回 repo，也不把整個筆記庫當 Pages 根目錄。

## 初次部署前檢查

1. `origin` 必須是使用者指定的 GitHub repo，且目前分支與預期發布分支一致。
2. 確認 GitHub CLI 使用正確帳號，repo visibility 符合使用者預期。
3. 查詢 Pages 是否已有 source、custom domain 或既有 deployment。
4. 若已有設定、現有網站、custom domain、分支來源或保護規則與本契約衝突，**停止並詢問使用者**，不得覆蓋。
5. 工作樹只包含本案與使用者已知的變更；commit 與 push 範圍必須可清楚列出。

## Actions 限制

- 本地端不安裝任何套件；只推送一次精簡 commit。
- GitHub runner 使用官方 `actions/checkout`、`actions/configure-pages`、`actions/upload-pages-artifact`、`actions/deploy-pages`。
- 組合步驟只複製每個案例必要的 HTML、CSS、JavaScript 與總入口檔案；規劃 Markdown 不發布。
- Action 不執行 npm install、不抓圖片、不建置框架。
- 只在網站來源、總入口或 Pages workflow 變更時觸發；同一分支使用 concurrency cancellation，避免重複部署。

## URL 與相對路徑

- 網站不得假設部署於 domain root；案例內部資產使用相對路徑，例如 `./styles.css`、`./app.js`。
- 總入口使用相對連結；IoT 路徑包含 `./iot-device/`、`./iot-power-pcb/`、`./iot-firmware-rtos/`、`./iot-connectivity/`、`./iot-rf-antenna/`、`./iot-security-production/`、`./iot-hardware-bus/` 與 `./iot-mcu-firmware/`；機器人叢集為 `./robot-math/`（數學先修）、`./robot-arm-kinematics/`、`./robot-motion-planning/`、`./robot-vision/`、`./robot-learning/`。
- **新增課程的部署步驟**（在 `.github/workflows/pages.yml`）：① `on.push.paths` 加該課來源 `*.html/*.css/*.js`；② 組站步驟加 `copy_course '<來源目錄>' '<slug>'`；③ 若該課有 `../../<其他課>/互動課程/` 形式的跨課相對連結，在 Python `replacements` 對應 slug 下加改寫規則（來源相對路徑 → 部署 `../<slug>/`）。例：機器人四門課連到先修課的 `../../機器人數學基礎/互動課程/` 改寫成 `../robot-math/`。
- 原始筆記的 repo 連結若要公開，使用 GitHub blob URL；若只作開發來源，則不顯示成 Pages 內的失效相對連結。

## 部署驗證

1. 等待 workflow 與 Pages deployment 完成，不重複觸發。
2. 檢查總入口、每個案例、CSS、JavaScript 的 HTTP 狀態。
3. 確認部署頁面沒有外部執行期請求。
4. 在手機實機或既有行動瀏覽器驗證 `390px` 左右寬度：模組導航、數字輸入、狀態機、重設與進度保存。
5. 將實際 URL、commit、workflow run 與手機驗證結果寫入各案 `驗收紀錄.md`。

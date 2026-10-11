# 圖解電子學新站交接

2026-10-11：24 章及首頁、字典、來源頁共 27 頁完成，產品已凍結；數學、教學、技術三線未決缺陷均為 0，待父線 `/root` 放行發布。全隊使用實際可用的繼承模型，同時上限 6 人；來源、建置者與兩位作者、三線獨立驗收均已完成，未自行操作 git。

## 精確交付

唯一產品領地 `電機/02-電機核心/圖解電子學/` 共 46 檔，其中 `dist/` 為 27 HTML、app.js、styles.css、site.css 共 30 資產。其餘 16 檔為 README、brief、spec、課綱與來源、互動與派工契約、字典資料及獨立審查；暫存建置進度已移除。

另交同層 `07-電子學-上.md`、`07-電子學-中.md`、`07-電子學-下.md` 三冊最小修正及本 handoff，共 50 檔。精確逐檔路徑、大小與 SHA256 在 `/tmp/electronics-release-manifest.json`（wf-table/1）；網站 30 資產見 `/tmp/electronics-technical-qa/證據/final-manifest.json`。未授權納入其他髒檔。

部署來源 `電機/02-電機核心/圖解電子學/dist/`，Pages slug `electronics-little-lab`。中央導航、Pages workflow、共享行政、styles FAMILY 登錄及一切 git 操作由 `/root/visual_publish` 唯一處理，依父線電路→電子順序。使用者已授權建立新課、多代理、查證修正、commit／push／部署；不得新建 Sites。

## 教材與原文

24 章依三冊完整骨架，從必要電路短橋到半導體、元件偏壓、小訊號、放大、回授、振盪、電源及 ADC／DAC。每章有問題、圖對式、完整帶單位主例、模型／工作區重驗、近題提示與詳解。手機圖可局部橫捲且有提示及鍵盤入口；主文不依賴 JavaScript。

`教材主張證據.json` 37 筆實讀一手來源主張；`課綱對照.json` 原 56 列全部有實質覆蓋判讀，區分完整主例與次類型概論。`原筆記修正提案.json` 12 項均經官方原文及獨立實際 diff 複核：4 真正錯誤、7 條件補充、1 文字澄清。原文證據在 `/tmp/electronics-sources/`。未擴成 IC 設計全科，亦不依賴未發布的電路站。

## 獨立驗收

產品內 `數學審查摘要.md`／`數學審查.json`、`教學審查摘要.md`／`教學審查.json`、`驗收紀錄.md` 是正式結果，按同版 SHA 封存。數學由獨立 KCL／KVL、守恆、複數阻抗及求根重算；技術比對 150 個量值，ADC 273 個內部邊界共 1365 例通過。教學逐章核實圖示操作、選式條件、計算及近題，沒有用圖數或測試數冒充理解。

27 頁於 headless Chromium 的 1440／390／320 尺寸、鍵盤、重設與控制邊界、離線、無 JS、HTML／相對連結／UTF-8 均通過。證據在 `/tmp/electronics-math-review/`、`/tmp/electronics-teaching-review/`、`/tmp/electronics-technical-qa/`。代表章 02 的 PC 圖解與完整計算已由父線目視抽驗。

舊電子學 25 資產與 `/tmp/electronics-old-baseline.json` 一致；styles.css 與正本 byte 相同，原 17 門 FAMILY 檢查通過。wf-lint 結束碼 1，僅兩條事前已知的 2026-09-26 歷史引用斷鏈，未改歷史湊綠燈。所有作者已停筆，自有 server／browser 退出；未宣稱真人理解、真機觸控或跨實體瀏覽器驗收。

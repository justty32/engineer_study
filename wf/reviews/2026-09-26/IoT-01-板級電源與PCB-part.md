# IoT 知識群互動網站 01-板級電源與PCB 審稿（未完成，緊急落檔）

狀態：**未完成**。三檔（index.html 275 行、app.js 728 行、styles.css 215 行）已全部讀完並以 node 驗算過核心公式；以下為已確認問題，尚未做的是：手機寬度實測、hub（../互動網站）是否回鏈本站、其他細節文字校對。

## 內容錯誤
- 01-板級電源與PCB/app.js:210-217 ｜中｜LDO 接面溫度只顯示不判斷：負載改 2 A 時 Tj = 195 °C，狀態仍顯示「Headroom 足夠」(ok)；學習者會誤以為 LDO 可行｜加 Tj 門檻（如 >125 °C error、>100 °C warn），並納入 verdict
- 01-板級電源與PCB/app.js:456 ｜中｜noise-priority=quiet 時無條件輸出「偏向 LDO」，不看熱／dropout 結果｜verdict 應結合 dropoutRisk 與 Tj 再給結論
- 01-板級電源與PCB/app.js:208,211 ｜低｜LDO 損耗用 Vin 標稱值，dropout 用 Vin,min；熱最壞情況應用 Vin,max，站內無此欄位｜加「最高輸入電壓」欄位或在教學文字註明損耗用標稱值為簡化
- 01-板級電源與PCB/index.html:125 ｜低｜metric 標籤「LDO 效率」實為 Vout/Vin 理想值（忽略 Iq），feedback 才寫「理想效率」｜標籤改「LDO 理想效率」
- 01-板級電源與PCB/index.html:61 ｜低｜文字說「拖曳 ESR、容量與脈衝時間」，但輸入是 number 欄位不是滑桿｜改「調整」
- 教學數值（0.34 W／17 °C／0.487 mA／137 日／0.238 V／2.6 A）經 node 驗算皆正確

## 題目錯誤
- 01-板級電源與PCB/app.js:114,252 ｜低｜pulse-step 規則寫 nonnegative、HTML min=0，但 0 會立刻丟「除以 0」錯誤｜規則改 positive、HTML min 改 0.01，訊息一致
- 01-板級電源與PCB/app.js:329,334 ｜低｜ESD 位置選「IC 旁」+「先經保護再進 IC」也回「未在 connector 端先保護」，訊息與選項組合不完全對應｜依 location 分別給訊息（IC 旁：保護太晚、走線先受衝擊）

## 程式互動 bug
- 01-板級電源與PCB/app.js:620-636 ｜中｜切換模組不捲動也不移焦點；讀前導讀 section 很長，手機上點 nav 後畫面仍停在原處，看不到模組已切換（styles.css:65 的 scroll-margin-top 從未被用到）｜activateModule 後 section.scrollIntoView() 或 focus 標題
- 01-板級電源與PCB/app.js:694-709 ｜低｜schematic／rf／release 的 checkbox 同時被 DEFAULTS 迴圈與 data-*-check 迴圈各綁 input+change，每次點擊 runModule 跑 4 次；number 欄位 input+change 也重複｜擇一綁定
- 01-板級電源與PCB/index.html:23 vs app.js:597 ｜低｜progress-label 初始「0 / 8 模組」，JS 改成「0 / 8 個模組完成」，載入時文字跳動｜HTML 初值與 JS 一致
- 01-板級電源與PCB/index.html:149 vs app.js:469 ｜低｜估算日數單位 HTML 寫「d」、JS 寫「日」｜統一
- 01-板級電源與PCB/app.js:362 ｜低｜會加 status-neutral class 但 CSS 未定義｜補 CSS 或移除
- 已驗證無 id 不存在、無 console error 風險；localStorage 讀寫皆 try/catch；重設進度閉包正確

## 教學設計
- 01-板級電源與PCB/index.html:55-67 ｜中｜八段導讀全放在每個模組上方且永遠顯示，每次切模組都要先滑過它｜改成隨模組顯示對應段落，或可收合
- 01-板級電源與PCB/index.html:85,186 ｜低｜各 rail 電壓（3.3/3.8/3.3/1.8）寫死在 JS 與 HTML，導讀未說明為何 Radio 是 3.8 V｜補一句（蜂巢模組常見 3.4–4.2 V）或開放輸入
- 01-板級電源與PCB/index.html:270 ｜低｜footer「來源：硬體：電源與電池、硬體：PCB 設計實務」純文字未連結｜連到 ../../硬體-電源與電池.md、../../硬體-PCB設計實務.md

## 網頁品質
- 01-板級電源與PCB/index.html:11-12 ｜低｜「回主站」連結排在 skip-link 之前，skip-link 不是第一個可聚焦元素｜skip-link 移到最前
- 01-板級電源與PCB/index.html:11 ｜低｜只有絕對網址回主站，無相對連結回知識群索引或 ../../互動網站/index.html（其他 02–07 子站亦同，可視為整體規範）｜補相對回鏈
- 01-板級電源與PCB/index.html:16,34,49,56,76 等 ｜低｜英文標籤殘留：IoT HARDWARE WORKSPACE、Modules、DESIGN EVIDENCE、READ FIRST、INPUTS、LIVE、GATE、Vendor guideline、RF layout checklist｜視規範改繁中或保留為裝飾
- 01-板級電源與PCB/index.html:60,139,149 ｜低｜「占比／占」與「佔比」混用｜統一「佔」
- 01-板級電源與PCB/styles.css:50 ｜低｜module-nav sticky top:92px 假設 topbar 固定 92px，701–1000px 寬時 topbar 可能換行變高，nav 頂部會被蓋住｜用 CSS 變數或 JS 量測 topbar 高度
- 01-板級電源與PCB/app.js:446,461,486 等 ｜低｜feedback 文字以「✓／!／×」字元開頭，螢幕閱讀器會念「乘號」｜改用 aria-hidden 圖示或去掉
- viewport、lang=zh-Hant、無簡體字（grep 已查）、無壞相對連結（本站僅 ./styles.css、./app.js 存在）

# IoT 知識群互動網站審稿：03-連線模組與網路（未完成——緊急中止，已讀完三檔，未逐項複驗）

狀態：**未完成**。index.html／app.js／styles.css 已全文讀完，下列為已確認的問題；壞連結檢查僅做到「本站只有絕對網址回主站，無相對連結」。

## 內容錯誤
- 03-連線模組與網路/app.js:174-179 ｜中｜Host link 模型把「模組 burst 速率 − UART 容量」的超額拿去扣 host 接收緩衝區。物理上 UART 線速已封頂在 capacity，host RX buffer 最多只會以 capacity 進資料；超額是塞在模組 TX FIFO（沒 RTS/CTS 就在模組端掉資料），而 host 溢位是「進速 capacity − 應用消耗速」。｜建議改成兩個模型：模組側 excess=(burst−capacity)×t 對模組 FIFO／流控；host 側 excess=(capacity−drain)×t 對 RX buffer。
- 03-連線模組與網路/app.js:325-327 ｜中｜「每日喚醒次數」用 session 小時數（預設 24 h）算，keepalive bytes 是整段 session 的量，reconnect bytes 卻是每日量；會話長度 ≠ 24 h 時兩邊單位不一致，Bytes winner 比錯。｜統一換算成每日（wakes×24/hours），或把 reports 也乘上 hours/24。
- 03-連線模組與網路/app.js:200-233 ｜中｜透傳（data）狀態且 guard 已建立時，收到 URC／OK／Prompt 仍走 URC handler／warn／error 分支（line 205 先於 state 判斷）。透傳模式下這些位元組就是 payload，guard 的意義正是不解析。｜state==="data" && guard==="yes" 時一律分類為透明資料。
- 03-連線模組與網路/app.js:141-149 ｜中｜Bearer 規則：園區＋電信商（任何供電）落到 else → Wi-Fi，鈕扣電池也推 Wi-Fi；「供電」只在 room+coin 用到一次，其餘被忽略，與 line 74 公式「距離 × 資料量 × 供電 × 部署 × 下行」不符。園區＋私有＋中資料量 → Thread（802.15.4，250 kbps）也不合理。｜加入 coin/battery 對 Wi-Fi 的降級、campus+operator → NB-IoT/LTE-M、campus 中資料量 → Wi-Fi。
- 03-連線模組與網路/index.html:50 ｜低｜「Wi-Fi 適合已有基地台」：Wi-Fi 是存取點（AP），基地台是蜂巢用語。｜改「存取點」。
- 03-連線模組與網路/app.js:150 ｜低｜runnerMap Wi-Fi → LTE-M：房間內高資料量的備選是 LTE-M 不合理。｜依 range 給備選（room → BLE/Thread）。

## 題目錯誤
- 03-連線模組與網路/app.js:95-101 vs index.html:280-281 ｜中｜阻擋原因顯示「保存 log／reset cause」「Timeout 與最後命令」，但清單文字是「保存 log / 最後命令」「Timeout」，學員對不上該勾哪項。｜兩邊文字統一。
- 03-連線模組與網路/index.html:200-203 ｜低｜「第一缺口」列顯示的是情境提示句（先查 registration／URC），真正的第一缺口在「下一步」列，標籤對調易誤解。｜「第一缺口」改「情境第一步」。
- 03-連線模組與網路/app.js:271 ｜低｜attempt 0 起算、exhausted = attempt > maxRetries，max 6 實際允許 7 次；attempt 是第幾次「重試」還是「嘗試」未定義。｜題面說明 attempt 0 = 第一次重試，或改 >=。
- 03-連線模組與網路/index.html:117 ｜低｜預設值會落在 warn（burst 20000 > 11520），但預設回饋寫「應能承受穩態流量與 burst」，與狀態框「Burst 警告」語氣不一致。

## 程式互動 bug
- 03-連線模組與網路/index.html:96,97,102,158,160,218,222,248,249,251 ｜高｜min="0.01"（或 0.0001）配 step="1"／"0.1"：HTML step base 取 min，預設值 115200、10、2048、2、60、0.6、30、300、24 全都 stepMismatch → :invalid，styles.css:88 把它們畫成紅框，一開站每個數字欄位都顯示錯誤，上下箭頭也會跳到 x.01。｜整數欄 min="1" step="1"；小數欄 step="any" 或 min 與 step 對齊。
- 03-連線模組與網路/app.js:450,508 ｜低｜state() 對 `<strong id=bearer-verdict>`／`keepalive-verdict` 加 role="status"、aria-live 與 status-ok 類別，metric 內出現彩色文字與巢狀 live region。｜這兩處改用 text()。
- 03-連線模組與網路/app.js:549-552 ｜低｜keepalive 分支重複呼叫 readModule，並直接 get(...).value 未判 null；無功能錯但 readModule 的 selects 表對 keepalive 永遠不會被用到。｜readModule 合併 numeric+selects。
- 03-連線模組與網路/app.js:704 ｜低｜init 一次跑 8 個模組，16 個 aria-live 區同時更新，讀屏器噴一串；另 reset-progress 無確認。
- 03-連線模組與網路/index.html:232 ｜低｜佔位「— B/30d」寫死 30 天，天數可調且渲染後變成「xxx B」。｜佔位改「— B」。

## 教學設計
- 03-連線模組與網路/app.js:224-241 ｜低｜AT 狀態機進了 data 後沒有離開路徑（+++／SEND OK／長度到），學員看不到透傳如何結束。｜加「payload 完成」行類型 → 回 wait。
- 03-連線模組與網路/app.js:292,358 ｜低｜Session／Supervisor 清單只要有未勾就是紅色 error，一開站兩模組即紅叉；缺「進行中」語氣。｜未完成用 warn。
- 03-連線模組與網路/app.js:328,470 ｜低｜Bytes winner 顯示 keepalive/reconnect/tie、下一狀態顯示 wait/idle/data 原始英文值。｜對照成中文標籤。

## 網頁品質
- 03-連線模組與網路/index.html:11-12 ｜低｜回主站連結排在 skip-link 前，Tab 第一個焦點不是「跳至主要內容」。｜skip-link 移到最前。
- 03-連線模組與網路/index.html:11 ｜低｜只有絕對網址回 GitHub Pages 主站，離線／本機開檔無法回上層；也沒有連到同群其他 6 站或 ../互動網站/index.html（該檔存在）。｜補相對連結。
- 03-連線模組與網路/index.html:16,29,43,65 等 ｜低｜Modules／READ FIRST／INPUTS／LIVE／Nominal delay／Bytes winner／Wire / message 等英文標籤殘留；未發現簡體字。
- 03-連線模組與網路/styles.css:34,49 ｜低｜topbar 高度以 92px 寫死給 nav sticky top，標題換行時側欄會被蓋住。｜用 CSS 變數或 top 由 JS 量測。

已核對正確：backoff 32.0 s／累積 62 s、資料預算 100 B／2640 B/day／28.57%、UART 11520 B/s、導讀 1440×92=132480 B≈129.4 KiB、61 s 範例。

# 互動課程審稿：IoT 聯網裝置（中央工作台＋七個知識群互動網站）

## 總評
- 範圍：`專題/IoT聯網裝置/互動網站/`（中央工作台）與 `知識群互動網站/01～07` 的 html/css/js，僅讀原始碼。**因時限提前結束，屬「未完成」**：01、03 逐行審完；中央工作台、02、04、05、06、07 只審了 JS 計算邏輯、數值範例、連結、CSS 斷點與抽樣的教學句子，未逐行讀完 HTML 內文與 CSS。
- 數值驗算大多正確（FSPL、Γ／VSWR、I²C 上升時間、SPI／RS-485 時序、RMS bound、CFSR 位元、功耗與脈衝估算）。最大問題不是算錯，而是**導航斷鏈**：中央工作台完全沒有連到七個知識群，知識群也不連回中央（只連 GitHub 主站絕對網址），只有 06↔07 互連。
- 七站架構三種模式並存（01–05 單頁八模組「計算器＋gate」、06 多頁＋30 分鐘倒數、07 多頁章節課），且與中央工作台在功耗、量產閘門、ISR/DMA 上重複卻互不引用；01–05 幾乎沒有檢核理解的題目，只有「輸入參數看判定」。
- 內容層面較嚴重者：01 的 LDO 接面溫度算出 195 °C 仍判「Headroom 足夠」；03 的 host link 溢位模型把超額流量記到錯的一端；02 同步 gate 把多 consumer 事件硬規定成 binary semaphore。
- 網頁品質：全站無簡體字；03 有一整排 `min/step` 導致載入即 `:invalid` 紅框；04、05 的判定輸出用英文標籤；多站 skip-link 排在「回主站」之後。

## 內容錯誤
- `01-板級電源與PCB/app.js:210-217` ｜高｜LDO／buck 接面溫度算出後不判斷：θJA=50、負載 2 A 時 Tj=195 °C 仍綠色「Headroom 足夠」，verdict 照樣「偏向 LDO」，違背同章「LDO 用熱付款」主旨｜加 Tj 門檻（>125 °C error、>100 °C warn）並讓 verdict 過熱時改口。
- `01-板級電源與PCB/app.js:196-208` ｜中｜熱損耗用 Vin 標稱、dropout 用 Vin,min，沒有 Vin,max；且 `reg-vin-min` > `reg-vin` 不報錯｜加 vinMin>vin 檢查，熱請用 Vin,max 重算並註明。
- `01-板級電源與PCB/app.js:213` ｜低｜buck 接面溫度沿用 LDO 的 θJA，且 buck 損耗未含 Iq／切換損，頁面未說明｜feedback 註明「buck 沿用同一 θJA，僅供比較」。
- `01-板級電源與PCB/index.html:125`、`app.js:209` ｜低｜指標「LDO 效率」實為 Vout/Vin 理想值（忽略 Iq）｜改名「LDO 理想效率」。
- `01-板級電源與PCB/index.html:61` ｜低｜「拖曳 ESR、容量與脈衝時間」但欄位是數字輸入框無滑桿｜改「調整」。
- `03-連線模組與網路/app.js:174-179` ｜高｜Host link 模型把「模組 burst 速率 − UART 容量」的超額扣到 host 接收緩衝區；UART 線上最多只跑 capacity，超額其實堆在模組端 TX FIFO（無 RTS/CTS 就在模組端丟），host 溢位真因是應用 drain 速率 < 到達速率｜拆成兩段模型：模組側 excess=(burst−capacity)×t 對模組 FIFO／CTS，host 側 excess=(capacity−drain)×t 對 host buffer。
- `03-連線模組與網路/app.js:325-327` ｜中｜Keepalive bytes 以「會話長度 h」累計、reconnect bytes 以「每日報告數」累計，單位不同直接比大小，且 `keepalive-wakes` 標籤寫「每日喚醒次數」｜統一換算成每日（wakes=86400/seconds）。
- `03-連線模組與網路/app.js:141-149` ｜中｜Bearer 規則幾乎忽略供電變數：「園區＋電信商＋鈕扣電池」落到 Wi-Fi、「房間內＋高資料量＋鈕扣電池」也給 Wi-Fi 無警告，formula-box 卻宣稱五變數初篩｜補 campus+operator→NB-IoT/LTE-M；coin+Wi-Fi 給 warn 並明示不適合。
- `03-連線模組與網路/app.js:147` ｜中｜「園區＋私有＋中資料量」推 Thread；Thread 是 802.15.4 250 kbps 單跳數十公尺的家庭／樓宇 mesh｜改 Wi-Fi（備選 Thread／LoRaWAN）。
- `03-連線模組與網路/app.js:205-233` ｜中｜state=data、guard 已建立時，URC 行仍被分流到 URC handler、Prompt 被判阻擋；透傳模式下這些就是 payload｜`state==="data"` 分支移到最前，guard=yes 時任何行都歸透明資料。
- `03-連線模組與網路/index.html:50` ｜低｜「Wi-Fi 適合已有基地台」：基地台是蜂巢術語｜改「已有 AP／存取點」。
- `03-連線模組與網路/app.js:150` ｜低｜Wi-Fi 備選固定為 LTE-M，室內高資料量情境不合理｜依 range 決定備選。
- `02-嵌入式韌體與RTOS/app.js:253` ｜中｜多 consumer 事件被硬規定「簡化為 binary semaphore」；binary semaphore 一次只喚醒一個等待者，多個 consumer 同收一事件應用 event group／broadcast｜改為 event group，或在阻擋訊息註明「每次只喚醒一個」。
- `02-嵌入式韌體與RTOS/app.js:250` ｜低｜「data 情境必須使用 queue」過嚴：stream/message buffer、帶值 notification 也可｜措辭改「通常」並列出替代原語。
- `02-嵌入式韌體與RTOS/app.js:22` ｜低｜RM bound 硬寫 n=3，與任務數欄位無關；若日後加任務欄會錯｜用 n×(2^(1/n)−1) 依任務數計算。
- `互動網站/app.js:741-743` ｜中｜韌體狀態機用同一事件「初始化成功」做 BOOT→INIT 與 INIT→REGISTERING（要連按兩次），BOOT→INIT 語意應是「開機完成」｜新增 boot-ok 事件或把 BOOT→INIT 改自動。
- `互動網站/app.js:759` ｜低｜SLEEP 喚醒直接回 BOOT 重跑初始化與註冊，與模組保留註冊（PSM/eDRX）的低功耗情境矛盾｜改 wake→ONLINE（或註明是模組斷電式睡眠）。
- `互動網站/index.html:248` vs `05-裝置安全與量產生命週期/app.js`（calculateProductionGate EVT:2）｜低｜中央把 FCT 標為 DVT 項目，05 站把 ICT/FCT 列為 EVT 必要項，兩站階段定義不一致｜對齊 EVT/DVT 清單。
- `07-微控制器與韌體核心/course.js:13` ｜低｜ADC 模擬 LSB=Vref/2^N，code 卻用 (2^N−1) 縮放，兩者不一致｜統一 code=floor(vin/vref×2^N) 並 clamp 到 2^N−1。

## 題目錯誤
- `01-板級電源與PCB/app.js:114,252` ｜低｜`pulse-step` 規則 nonnegative、HTML min=0，但計算對 0 丟「除以 0」錯｜規則改 positive、min 改 0.01。
- `01-板級電源與PCB/app.js:329-334` ｜低｜ESD 位置選「IC 旁」＋「先經保護再進 IC」仍判失敗，訊息卻說「未在 connector 端先保護」，像答案鍵與題幹不一致｜訊息依 location 分開說明。
- `01-板級電源與PCB/index.html:120` ｜低｜select 標籤「優先順序」與 JS 錯誤訊息／FIELD_SPECS「雜訊取捨」不一致｜統一「雜訊／效率取捨」。
- `03-連線模組與網路/app.js:95-96` vs `index.html:280-281` ｜中｜Supervisor 阻擋原因用「保存 log／reset cause」「Timeout 與最後命令」，清單卻寫「保存 log / 最後命令」「Timeout」，對不上該勾哪項｜兩邊文字統一。
- `03-連線模組與網路/index.html:200-203` ｜中｜Session 面板「第一缺口」列顯示的是情境固定提示，真正的第一個未勾 gate 在「下一步」列，標籤對調｜「第一缺口」改「情境提示」、「下一步」改「第一缺口」。
- `03-連線模組與網路/app.js:271` ｜低｜attempt 從 0 起算、`exhausted = attempt > maxRetries`，max=6 允許 7 次，「最大重試次數」定義含糊｜註明 attempt 0 是首次，或改 `>=`。
- `03-連線模組與網路/index.html:117` vs `app.js:180` ｜低｜預設值算出 warn（burst 超 UART 容量），HTML 預設回饋卻寫「應能承受穩態流量與 burst」｜預設文字改為「穩態通過但 burst 會亮警告」。
- `01–05 全站` ｜中｜八模組皆為「輸入參數→看 gate 判定」，沒有任何選擇題／自檢題與解析，無法檢核理解｜每模組加 1–2 題自我檢核並附解析。

## 程式／互動 bug
- `03-連線模組與網路/index.html:96,97,102,158,160,218,248,249,251,222` ｜高｜`min="0.01" step="1"`（或 `min="0.0001" step="0.1"`）讓 step 基準變 0.01：預設值 115200、10、2048、60、300、24、30、2、0.6 全部 stepMismatch→`:invalid`，一載入整排紅框（styles.css:88），箭頭也跳成 0.01 偏移｜改 `min="1"` 或加 `step="any"`。
- `01-板級電源與PCB/app.js:620-636` ｜中｜點導覽只切 `is-current`，不捲動不移焦點；導讀區很長，手機上點模組後畫面仍停在導讀，像沒反應；CSS `scroll-margin-top` 備而未用｜activateModule 後 scrollIntoView 並 focus 標題。
- `01-板級電源與PCB/app.js:694-709` ｜低｜schematic／rf／release 的 checkbox 被兩個迴圈各綁 input+change，每次點擊跑 4 次 runModule｜checkbox 只綁 change 一次，數字欄只綁 input。
- `01-板級電源與PCB/app.js:373-376`、`styles.css:106,112-114` ｜低｜feedback 同時掛 `.status-*` 覆蓋顏色，訊息自帶「✓／!／×」前綴，讀屏器會念「times」「exclamation」｜前綴用 aria-hidden span 或拿掉。
- `01-板級電源與PCB/index.html:23` vs `app.js:597` ｜低｜初始「0 / 8 模組」與 JS「0 / 8 個模組完成」不同，載入閃一下｜HTML 改同一字串。
- `01-板級電源與PCB/index.html:149` vs `app.js:469` ｜低｜日數單位 HTML「d」、JS「日」｜統一「日」。
- `01-板級電源與PCB/app.js:362` ｜低｜加 `status-neutral` class 但 CSS 未定義｜補一條或刪分支。
- `03-連線模組與網路/app.js:549-552` ｜低｜keepalive 分支重跑 readModule 又硬讀 select，繞過 readSelects｜readModule 合併 numeric+selects。
- `03-連線模組與網路/app.js:450,508` ｜低｜對 `<strong id="bearer-verdict">`、`keepalive-verdict` 呼叫 state()，多套 role="status"、aria-live 與 status class｜改用 text()。
- `03-連線模組與網路/app.js:704` ｜低｜init 一次跑 8 模組、16 個 aria-live 區同時更新，讀屏開頁即被轟炸｜初始化先算後設 aria-live，或只對當前模組設 live。
- `03-連線模組與網路/index.html:232` ｜低｜佔位「— B/30d」，天數可調、渲染後只剩「B」｜佔位改「— B」，label 動態顯示天數。
- `03-連線模組與網路/app.js:470,507` ｜低｜下一狀態、Bytes winner 直接輸出 `wait/idle/data`、`keepalive/reconnect/tie` 英文原值｜加對照表輸出繁中。
- `07-微控制器與韌體核心/course.js:14` ｜中｜韌體狀態機 `q("#state-event").textContent="事件 "+e+(state?" 已處理":"")`，state 永遠為真值，不合法事件（例如 sleep 狀態按 tx_done）也顯示「已處理」｜用 transition 是否成功的布林決定「已處理／此狀態不接受」。
- `07-微控制器與韌體核心/course.js:16` ｜低｜CFSR 解碼用 `Number(raw)`，輸入「8200」（無 0x）會被當十進位靜默解錯｜改 `parseInt(raw.replace(/^0x/i,""),16)` 並提示格式。
- `互動網站/app.js:647` ｜低｜脈衝計算的錯誤訊息說「請輸入大於 0 的電流、時間、ESR」，但檢查允許 0（只有電容與允許壓降 >0）｜訊息與檢查對齊。
- `06-板級介面與工業匯流排/app.js:2`（remaining=1800）｜低｜30 分鐘倒數只存在記憶體，從 index 跳到 i2c-principles.html 再回來就歸零，完成進度卻存 localStorage，兩者不一致｜倒數殘餘秒數一併存進 `engineerStudy.iotHardwareBus.v1`。
- `06-板級介面與工業匯流排/app.js` vs `i2c.js`、`rs485.js` ｜低｜RC 上升時間與反射係數計算在 app.js 與各 principles 頁的小 js 各有一份，日後修正易漏｜抽成共用 js。

## 教學設計
- `互動網站/index.html:12`、`互動網站/app.js`（全檔無 href）｜高｜中央工作台完全沒有連到七個知識群互動網站，知識群也不連回中央（01–07 唯一外連皆是 GitHub 主站絕對網址），只有 06↔07 互連；離線／本機開檔完全回不去｜中央加「深入七個知識群」入口卡；各知識群 topbar 加相對連結 `../../互動網站/index.html` 與兄弟站。
- `知識群互動網站/01～07` ｜中｜三種架構並存：01–05 單頁八模組計算器＋gate、06 多頁＋30 分鐘倒數計時、07 多頁章節課且 `<title>` 自稱「資深 C++ 工程師課程」；學習者跨站要重新適應｜統一版型（至少統一 topbar／進度列／回中央入口），07 標題改與其他站一致。
- `知識群互動網站` 順序 ｜中｜編號 01 電源 PCB→02 RTOS→…→06 匯流排→07 MCU；對基礎不扎實的擁有者，07「00 從零理解微控制器」與 06「硬體原理補課」才是起點，卻排最後｜在中央入口給建議學習順序（07-00 → 06 → 01 → 02 → 03 → 04 → 05）。
- 中央 功耗實驗室／01 sleep 與漏電／02 low-power；中央 量產閘門／05 production-gate；02 driver-io／07 03-中斷與DMA ｜中｜同一主題在多站重複計算器，彼此不引用也不分工，且量產階段定義不一致｜每處加「延伸：見 XX 站」並約定分工（中央做入門版、知識群做深入版）。
- `03-連線模組與網路/app.js:292,358` ｜中｜Session／Supervisor 預設就是紅色 error（gate 未全勾），與其他模組預設 ok 不一致，無法區分「還沒做」與「做錯」｜未勾滿用 warn/neutral，只有前段缺口才 error。
- `01-板級電源與PCB/index.html:55-67`、`03-連線模組與網路/index.html:47-59` ｜中｜八段導讀塞在同一 READ FIRST 面板常駐於所有模組之上，各模組本身沒有「本模組先讀什麼」與小結，學生得來回捲｜導讀拆到各模組頂端或預設收合，每模組加一句小結。
- `03-連線模組與網路/app.js:224-241` ｜低｜AT 狀態機進入 data 後沒有離開路徑（無 +++／傳完回 idle）｜加「Payload 送畢／逃逸序列」行類型。
- `01-板級電源與PCB/app.js:186-187`、`index.html:85` ｜低｜rail 電壓 3.3/3.8/3.3/1.8 寫死，導讀未解釋 Radio 為何 3.8 V（LTE 模組典型 3.4–4.2 V）｜補一句來源。
- `01-板級電源與PCB/index.html:169` ｜低｜feedback 提到 100 nF／1–10 µF／bulk 分工，模型只算單顆 bulk，概念與練習脫節｜註明「本模組只練 bulk 項」並連 PCB 實務筆記。
- `01-板級電源與PCB/index.html:270` ｜低｜頁尾「來源：硬體：電源與電池、PCB 設計實務」純文字，對應 md 存在卻沒連結｜改成連結。
- `05-裝置安全與量產生命週期/app.js`（status 字串）｜低｜判定用 emoji「⛔ 阻擋／✓ 通過／⚠ 警告」而非文字＋class，讀屏與無彩色字型環境不佳｜改文字並用 class 上色。

## 網頁品質
- `01-板級電源與PCB/index.html:11-12`、`03-連線模組與網路/index.html:11-12`（02、04、05 同型）｜中｜「回主站」絕對網址連結排在 skip-link 之前，Tab 第一站不是「跳至主要內容」；且無相對連結回 `../../互動網站/index.html`｜skip-link 移到 body 第一子元素；加相對回鏈。
- `04-天線RF與EMC/app.js:116`、`05-裝置安全與量產生命週期/app.js:12` ｜中｜LAYOUT_LABELS／LABELS 全英文（controlled impedance、non-exportable private key…）直接輸出到「第一缺口／阻擋原因」，違反全繁中｜改中文（英文括號附註）。
- `01-板級電源與PCB/index.html:16,34,49,56,76,90…`、`03-連線模組與網路/index.html:16,29,43,65,78` ｜低｜介面標籤英文殘留：「IoT HARDWARE WORKSPACE」「Modules」「READ FIRST」「INPUTS」「LIVE」「GATE」「Nominal delay」「Bytes winner」「Dropout headroom」「Release gate」等｜metric 標籤改繁中，裝飾 tag 加 `lang="en"`。
- `01-板級電源與PCB/index.html:60,139,149` ｜低｜「占」「佔」混用｜統一「佔」。
- `01-板級電源與PCB/styles.css:50`、`03-連線模組與網路/styles.css:34,49` ｜低｜sticky `top:92px` 寫死，700–1000px 寬 topbar 換行變高會蓋住側欄／nav｜用 CSS 變數或 JS 量 topbar 高度。
- `01-板級電源與PCB/index.html:85` ｜低｜`<div aria-label="電源域電壓">` 無 role，aria-label 不會被讀出｜加 `role="group"` 或改 fieldset／dl。
- `01-板級電源與PCB/index.html:35-42` ｜低｜導覽完成標記「●／○」在 aria-hidden span，nav button 無 aria-pressed，鍵盤／讀屏無法得知完成狀態｜updateProgress 時設 aria-label「…（已完成）」。
- `03-連線模組與網路/index.html:23`（其他站同型）｜低｜「重設全部進度」無確認即清 localStorage｜加 confirm()。
- `07-微控制器與韌體核心/index.html`（course-nav 9 個連結、每項 min-width 108px） ｜低｜手機寬度靠 overflow-x:auto 橫向捲動，無捲動提示，第 5 個以後的章節在 390px 看不到｜加折行或漸層提示／漢堡選單。
- 全部 8 個 styles.css ｜低｜均無 `prefers-color-scheme`；01/02/03/06 有 390/700/1000 斷點、04/05 3 個、07 3 個，手機基本可用但未實測｜可補深色模式（非必要）。
- 全站 ｜資訊｜未發現簡體字；viewport 與 `lang="zh-Hant"` 八站齊全；相對連結（含 06↔07、06 各 principles 頁、07 各章）全部存在，無壞連結。

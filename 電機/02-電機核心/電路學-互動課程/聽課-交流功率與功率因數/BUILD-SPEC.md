# 建置契約

## 內容與單一案例

兩堂各九段；lesson ID pwr-meaning、pwr-correction，segment ID pwr1-01 至 pwr1-09、pwr2-01 至 pwr2-09。第三、六、九段 checkpoint=true，對應圖 pwr-instant、pwr-rms、pwr-triangle、pwr-parallel、pwr-current、pwr-compensation。每堂 4200–5000 可說漢字；MD 與 JS text 逐字同源。正文所有數值需口語可讀；圖面可用符號。

固定單相正弦：f=60 Hz，ω=120π rad/s，V=120∠0° V（有效值），Z=12+j9 Ω，電流流入負載電壓正端。|Z|=15 Ω，θ=36.86989765°，I=6.4−j4.8=8∠−θ A（有效值）。峰值各乘√2。P=768 W，Q=576 var，S=960 VA，pf=0.8 落後。p(t)=768+960cos(2ωt−θ) W，範圍 −192 至 1728 W，平均 768 W。功率負值表能量返回；Q 不是瞬時功率本身亦不是浪費瓦數。

複功率用 S複=P+jQ=V I*；S（視在功率）=|S複|。共軛使相角相減且共同旋轉參考不改結果。P=Vrms Irms cosθ；Q=Vrms Irms sinθ；S=Vrms Irms。純正弦有效值=峰值/√2，來源是平方平均後開根號，不能把電流平均零當發熱零。

補償比例 k 對負載 Q：Qc=−576k var，C=k×576/(120π×120²) F=k×106.1032954 µF；Ic=j4.8k A；I來源=6.4+j4.8(k−1) A；Q總=576(1−k)，P=768。k=0：8 A，pf .8 落後；k=1：6.4 A，pf1，線損比 .64；k=1.5：6.835202996 A，Q總−288 var，pf .936329178 超前。負載支路始終 8 A；電容支路不得錯標為所有電流降低。

模型固定理想負載端電壓，不把線損加回本例電源守恆；線損比只在同一上游電阻且同電壓近似下比較。固定電容換負載可能補過頭，頻率及諧波／共振須另行分析；不教實機接線、不談費率。真功因=P/(Vrms Irms)，純正弦時等於位移功因 cosθ；非正弦不能只拿一個相角判真功因，不展開諧波課。

## 互動與版面

id pwr-comp-scale；range 0..1.5、step .05、default0；依上述 k 公式更新電流箭頭、P/Q/S/pf與補償電容。判準：k=1 來源電流最小；超過1開始超前且來源電流回升。圖形真比例，標有效值、單位與方向。圖一功率W及時間ms，不把V/A混軸；圖二平方平均根概念；圖三P/Q正交與S斜邊；圖四閉合並聯拓撲及支路/來源電流；圖五同尺度相量相加；圖六補償操作。

沿既有聽課-阻抗與交流分析播放器契約，data 結構 window.CIRCUIT_AUDIO.lessons；storageKey獨立。真檔可seek與0.75至2倍速；manifest segments={}，不得引用 sample。無檔明確提示，只有使用者手動播放才 browser TTS。每堂三圖停靠、按繼續才前進。index 不連MD，講稿透過頁面顯示。

## 所有權與驗收

講稿作者：lesson-data.js、完整口語稿.md；前端作者：index.html、audio-course.css、audio-course.js、audio-manifest.js；隊長：BRIEF、SPEC、派工計畫；獨立QA：驗收紀錄.md。共享導航與wf由上級管理。五項驗收：正文漢字時長同源；數學有效值慣例；圖文手機；連結UTF8JS；播放器停靠fallback。headless僅 --disable-gpu，不開server、不用GUI。

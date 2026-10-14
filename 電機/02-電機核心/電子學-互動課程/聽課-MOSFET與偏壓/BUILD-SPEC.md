# MOSFET與偏壓：建置契約

兩堂em-channel/em-bias，各九段em1-01..09、em2-01..09，03/06/09停靠六圖。CIRCUIT_AUDIO，正文4200–5000字/堂、MD逐字同源，storageKey electronics-mos-v1，空manifest不自動朗讀。符號k=μnCoxW/L=0.001 A/V²，Id,sat=(k/2)(VGS−Vth)²，勿把k與含1/2的K混用。長通道、λ0、無體效應、理想絕緣閘；截止模型電流0只是忽略次臨界近似。

圖一em-channel：NMOS源/汲極n+、p基體、閘極絕緣層；正VGS吸引電子成通道，電子S→D與傳統Id D→S分開標；閘極直流電流理想0，但有充電電容，不能說任何時刻不取電。圖二em-regions：固定Vth2V、VGS3V，Vov1V；VDS<1三極/線性區，VDS≥1飽和區，接近汲端夾止仍有電流不是斷路。Id=k[(Vov)VDS−VDS²/2]或kVov²/2；邊界連續.5mA。MOS飽和是此模型的受VGS控制近定電流區，BJT深飽和是另個器件工作狀態。圖三em-output：固定VGS=2/3/4V的Id對VDS0..5曲線，Vth2，三極與飽和交界標點，k固定。可固定圖不用滑桿；VGS2截止邊界理想0。

圖四em-load：VDD10V→RD2kΩ→D，S0，獨立Vg→G、共參考；Vth2、k1mA/V²，Vg3預設。直流閘極不耗流但汲極回路有電源。飽和候選Id.5mA、VDS9V，驗VDS≥Vov；若Vg5候選Id4.5mA、VDS1V<3V，不得用。圖五em-gate：Vg range0..5 step.1 default3；用單調負載方程(10−VDS)/2000=Id(Vg,VDS)，VDS0..10二分穩健求根，Vg≤2令Id0、VDS10。動態畫負載線與當前輸出曲線/交點，顯示Vov、Id、VDS、區域。快捷1/3/5，Vg5三極根由作者求，QA重算。圖四固定3V不隨圖五。

圖六em-source-bias：另一固定模型VDD10、RD2k、RS1k、VG3、Vth1V、k同上（必須露出Vth改為1V），假設飽和解I=.5k(3−I*1000−1)²，選Vov≥0的物理解，I=(3−sqrt5)mA≈.763932mA，VS=.763932V，VGS≈2.236068，VDS=10−I*(RD+RS)≈7.708204V，重驗。與無RS同VG/Vth/k比，Id2mA、VDS6V；源阻升高讓VGS下降，形成直流負向調節。該圖只固定兩電路/數值，不要求調RS。詳細二次式和另一不物理解折疊，必要的VGS=VG−VS與模型重驗留主線。不把電流降低本身叫放大，也不宣稱溫度永不漂。

深入連圖解電子學06及舊互動08。五類驗收與其他課相同，作者本目錄唯一寫前端與稿，禁改wf/舊課/dist；作者禁瀏覽器，QA協調CPU headless --disable-gpu。圖三/圖五相同k與Vth2，圖六Vth1差異必醒目避免稿圖混用。

# 小訊號與跨導：建置契約

三堂es-slope/es-bjt/es-mos，段es1/2/3-01..09，03/06/09停靠九圖。CIRCUIT_AUDIO，MD同源、每堂4200–5000漢字，storageKey electronics-smallsignal-v1，空manifest，不自動朗讀。用大寫或Q標直流、小寫增量，圖中文字明說總電壓=直流+變動，不混RMS；本課變動用瞬時值。

第一堂固定長通道MOS平方律示意I=.5k(V−Vth)²，k=.001A/V²、Vth1、VQ2，IQ=.5mA。圖一es-curve：完整曲線V1..3、IQ點，圖二es-tangent：工作點局部放大、切線Ilin=.5mA+(1mS)δv，δv正負.1V時真I=.605/.405mA，切線.6/.4mA，誤差都.005mA；導數斜率1mA/V，曲線並非整段直線。圖三es-error互動δv range−.5..+.5V step.01 default.1，更新真I、一次近似、絕對誤差及相對『增量』誤差（δv0須顯0或不適用不NaN）。完整展開ΔI=kVovδv+(k/2)δv²，二次項相對一次項|δv|/(2Vov)，.1為5%、.5為25%；別用總電流百分比掩蓋訊號失真。此堂先由兩點割線到極限斜率，再近似，不要求先懂泰勒；導數/泰勒首次附英文但少術語。

第二堂BJT假設作用區、VT=.02585V、ICQ1mA、β100、先忽略Early。圖四es-bjt-delta：Δic=ICQ[exp(vbe/VT)−1]與gm*vbe，gm=ICQ/VT≈.03868472S，vbe±1mV真/近似由作者算。輸入vbe是毫伏級增量不是固定0.7V；小訊號尺度由VT比較。圖五es-bjt-model：B-E rπ=β/gm=2585Ω、C→E相依源gm vbe、E共點，方向與被動標記；不把受控源關掉，直流電壓源在增量電路短路不是拆除實際電源。圖六es-bjt-output：加入近似ro=VA/ICQ，VA100V→100kΩ，圖畫C-E並聯ro，教有限輸出斜率使vce變也影響ic。此VA/IC為高VA近似而非精確某I(VCE)模型；兩個增量貢獻ic≈gm vbe+vce/ro，本課給vbe1mV、vce.1V→38.6847μA+1μA，不把gm vbe當總IC。可固定圖無控制。

第三堂MOS，長通道強反轉飽和區、Vov1V、k.001、IDQ.5mA，忽略gm的通道調變修正，gm=kVov=1mS=2ID/Vov。圖七es-mos-model：閘極理想無DC輸入電流，D→S受控源gm vgs，λ0先ro∞；『無閘電流』只指低頻理想電阻性模型，不抹掉閘電容。圖八es-mos-ro：λ=.02V^-1近似ro=1/(λIDQ)=100kΩ；固定vgs10mV、vds.2V→10μA+2μA；聲明沿Q點的一階參數模型、ro近似，不把IDQ=.5mA與完整含(1+λVDS)大訊號式假裝同時精確。圖九es-current互動IDQ .25..2mA step.25 default.5（以外部偏壓已調整且仍飽和為假設），k固定，Vov=sqrt(2ID/k)，gm=sqrt(2kID)、λ.02、ro=1/(λID)。顯gm隨sqrtI、ro隨1/I，圖對數不必要，gmro為無因次，勿稱實際已接負載的電壓增益。快捷.25/.5/2，QA重算；使用者只調IDQ不假裝由閘電壓直接做完整偏壓設計。

九圖名稱及腳本圖號一致。稿講有限近似、偏壓先定、兩個端口電壓的影響；實際電路增益留下一門。深入連圖解08及原10。唯一作者寫前端與稿、禁別課wf，五類QA同前，作者不開瀏覽器；QA --disable-gpu協調。

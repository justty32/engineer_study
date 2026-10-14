# 電流鏡與差動放大：建置契約

兩堂ei-mirror/ei-differential，各九段ei1/2-01..09、03/06/09停靠六圖。正文4200–5000漢字/堂、JSMD同源，storageKey electronics-mirror-diff-v1，空manifest、無自播。本課圖內DC大寫/訊號小寫可用文字區分，電流mA、電壓V。

圖一ei-reference：兩個匹配NMOS，k=.001A/V²、Vth1、λ0，Source皆0。Q1 gate/drain短接，理想參考源自+5V端向該節點注入Iref=.5mA（明說理想源且有順應範圍）；Q1解VGS2V，二極體連接MOS不是PN二極體0.7模型。圖二ei-copy：Q2 gate與Q1同接2V，汲極接輸出負載/測試電壓，Q2 VDS≥Vov1V時ID=.5mA；兩支電流各有自己的閉合供電回路，不是同一批電荷從Q1跨閘極流到Q2。受控源理想取電不從閘極輸入，Q2是電流下拉支路。圖三ei-compliance互動Vout=.2..4V、step.1、default2，Vov1固定，低於1V用ID=k(Vov VDS−VDS²/2)，≥1用.5mA，顯VDS/工作區/輸出電流；.2→.18mA、1/2/4→.5mA，邊界連續。曲線強調最低輸出電壓、實際λ與失配另影響精度；不保證真器件任何電壓都精準。只有Vout可動，不改Iref。

圖四ei-tail：匹配NPN差動對，理想尾電流It2mA、β∞、無Early、VT.02585V；VCC+5V，兩RC2k，尾源接−5V，輸入共模0V，vd=v1−v2，v1=vd/2、v2=−vd/2。vd0時IC1/IC2=1mA，VC1/VC2=3V，基極與尾源順應在例內有效。圖五ei-steering：精確匹配指數模型IC1=It/(1+exp(−vd/VT))、IC2=It−IC1，差為It*tanh(vd/(2VT))。畫尾流分流、兩集極電壓與『差動輸出vo=VC1−VC2=−RC(IC1−IC2)』；正vd讓左電流上升左電壓下降，所以vo負。小訊號差動增益Ad=−gmRC，gm=(It/2)/VT；單端輸出VC1增量相對vd則−gmRC/2，不能混用。泰勒局部導數沿前課，tanh細節可折疊，主線用電流重新分配。

圖六ei-difference互動vd range−50..50mV step1 default0，更新IC1/2、VC1/2、vo，曲線畫精確vo和局部直線，明示±50mV已非很小。快捷−50/0/1/50；vd1mV的精確vo與近似由作者算供QA重算，gm≈38.68472mS，差動Ad≈−77.36944。另固定共模示意把兩輸入同升.5V，在理想尾流且元件仍作用區的假設下，分流與集極電壓不變，射極電壓跟移；不宣稱所有共模輸入都能拒斥，供電/尾源順應限制仍存在。若無共模控制不得讓稿要求操作；真CMRR有限只是限制說明，詳細CMRR算例與主動負載不在此課。

來源深連圖解12/13。作者只本目錄前端四檔與兩稿，五類QA同前；不改wf/兄弟課/dist，不開瀏覽器，QA CPU headless串行。

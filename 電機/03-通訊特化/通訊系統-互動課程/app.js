"use strict";
/* 通訊系統（零基礎互動課）——全站互動邏輯 */

/* ---------- 1. helper ---------- */
var $=function(id){if(typeof document==="undefined")return null;return document.getElementById(id);};
var bind=function(ids,f){ids.forEach(function(x){var n=$(x);if(n){n.addEventListener(n.type==="checkbox"?"change":"input",f);}});};
var val=function(id){var n=$(id);return n?Number(n.value):0;};
var pick=function(id){var n=$(id);return n?n.value:"";};
var chk=function(id){var n=$(id);return n?!!n.checked:false;};
var zc=function(x){return Math.abs(x)<1e-12?0:x;};
var minus=function(s){return String(s).replace(/^-/,"−");};
var num6=function(x){var v=Number(x);if(!isFinite(v))return "不適用";return minus(zc(v).toFixed(6));};
var int0=function(x){var v=Number(x);if(!isFinite(v))return "不適用";return minus(String(Math.round(zc(v))));};
var supNum=function(x){var n=Math.round(Number(x));return n<0?"−"+String(Math.abs(n)):String(n);};
var sci=function(x){var v=Number(x),p;if(!isFinite(v))return "不適用";if(v===0||v<1e-300)return "小於 10<sup>−300</sup>";p=v.toExponential(6).split("e");return minus(p[0])+" × 10<sup>"+supNum(p[1])+"</sup>";};
var put=function(id,html){var n=$(id);if(n)n.innerHTML=html;};
var row=function(cells,th){var t=th?"th":"td";return "<tr><"+t+">"+cells.join("</"+t+"><"+t+">")+"</"+t+"></tr>";};
var esc=function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");};

/* ---------- 2. 數學 ---------- */
function erfc(x){
  var term,s,n,t,f,k;
  if(x<0)return 2-erfc(-x);
  if(x<2){
    term=x;s=0;n=0;
    while(true){t=term/(2*n+1);s+=t;if(Math.abs(t)<1e-17*Math.abs(s)||n>200)break;n+=1;term*=-x*x/n;}
    return 1-(2/Math.sqrt(Math.PI))*s;
  }
  f=x;
  for(k=100;k>=1;k-=1)f=x+(k/2)/f;
  return Math.exp(-x*x)/Math.sqrt(Math.PI)/f;
}
function Q(x){return 0.5*erfc(x/Math.sqrt(2));}
function sinc(x){return Math.abs(x)<1e-12?1:Math.sin(Math.PI*x)/(Math.PI*x);}
function rcPulse(x,a){var d=1-(2*a*x)*(2*a*x);if(Math.abs(d)<1e-9)return (Math.PI/4)*sinc(x);return sinc(x)*Math.cos(Math.PI*a*x)/d;}
function db10(x){return 10*Math.log10(x);}
function undb(d){return Math.pow(10,d/10);}

/* ---------- 3. 常數 ---------- */
var C_LIGHT=299792458;
var K_BOLTZ=1.380649e-23;
var T0=290;
var KT0_DBM_HZ=db10(K_BOLTZ*T0*1000);
var DB_F=[3,100,1000,100000,900000,2400000,28000000];
var CONSTEL={
  bpsk:{name:"BPSK",M:2,k:1,dmin:2,nn:1},
  qpsk:{name:"QPSK",M:4,k:2,dmin:Math.SQRT2,nn:2},
  psk8:{name:"8-PSK",M:8,k:3,dmin:2*Math.sin(Math.PI/8),nn:2},
  qam16:{name:"16-QAM",M:16,k:4,dmin:2/Math.sqrt(10),nn:3},
  qam64:{name:"64-QAM",M:64,k:6,dmin:2/Math.sqrt(42),nn:3.5}
};
var ETA={bpsk:1,qpsk:2,qam16:4,qam64:6};
var PENALTY={bipolar:0,onoff:6.020600,cfsk:3.010300};

var QUIZ_CH={
  "00":["00-通訊世界觀與分貝帳本.html","00 通訊世界觀與分貝帳本"],
  "01":["01-AM包絡與調變指數.html","01 AM 包絡與調變指數"],
  "02":["02-抑制載波單邊帶與同步解調.html","02 抑制載波、單邊帶與同步解調"],
  "03":["03-FM與Carson頻寬.html","03 FM 與 Carson 頻寬"],
  "04":["04-超外差接收機與影像頻率.html","04 超外差接收機與影像頻率"],
  "05":["05-雜訊訊雜比與雜訊指數.html","05 雜訊、訊雜比與雜訊指數"],
  "06":["06-取樣量化與PCM.html","06 取樣、量化與 PCM"],
  "07":["07-基頻傳輸ISI與升餘弦.html","07 基頻傳輸、ISI 與升餘弦"],
  "08":["08-匹配濾波器與位元錯誤率.html","08 匹配濾波器與位元錯誤率"],
  "09":["09-數位調變與星座圖.html","09 數位方案與星座圖"],
  "10":["10-頻譜效率與Shannon極限.html","10 頻譜效率與 Shannon 極限"],
  "11":["11-鏈路預算.html","11 鏈路預算"]
};
var QUIZ=[
  {id:"q00-1",t:"num",ans:20,tol:0.05,why:"100 mW 相對 1 mW 是 100 倍，因此是 20 dBm。",err:"用了 20 log（那是電壓比）。"},
  {id:"q00-2",t:"num",ans:0.749481,tol:0.001,why:"100 MHz 的波長是 2.997925 m，除以 4 得 0.749481 m。",err:"忘了除以 4，或 c 用錯量級。"},
  {id:"q00-3",t:"sel",ans:"a",why:"dBm 是絕對功率；dBm 只能和 dB 相加減。",err:"把 dBm 當成可以相加的比值（20 dBm 加 3.010300 dB 才是 23.010300 dBm）。"},
  {id:"q01-1",t:"num",ans:11.111111,tol:0.01,why:"μ² / (2 + μ²) 在 μ ＝ 0.5 時是 11.111111 %。",err:"用 μ² / 2，沒有除以 (2 + μ²)。"},
  {id:"q01-2",t:"num",ans:275.664448,tol:0.5,why:"代入 μ ＝ 0.5 與 1 kHz，RC 上限是 275.664448 µs。",err:"忘了 √(1 − μ²)，或 f_m 沒換成 Hz。"},
  {id:"q01-3",t:"sel",ans:"b",why:"μ 大於 1 時谷底變負，包絡翻折。",err:"以為過調變只是「調得更深」。"},
  {id:"q02-1",t:"num",ans:25,tol:0.5,why:"SSB 只占 4 kHz，所以 100 kHz 可排 25 路。",err:"用了 DSB 的 2W。"},
  {id:"q02-2",t:"num",ans:-6.020600,tol:0.05,why:"cos 60° ＝ 0.5，以 20 log 換算是 −6.020600 dB。",err:"用了 10 log；cos φ 是振幅比，要用 20 log。"},
  {id:"q02-3",t:"sel",ans:"c",why:"SSB 的相位誤差改變相位關係，但不縮小振幅。",err:"把 DSB-SC 的 cos φ 套到 SSB。"},
  {id:"q03-1",t:"num",ans:5,tol:0.01,why:"β ＝ 75 / 15 ＝ 5。",err:"把分子與分母倒過來。"},
  {id:"q03-2",t:"num",ans:180,tol:0.5,why:"Carson 法則給出 2 × (75 + 15) ＝ 180 kHz。",err:"只算 2Δf ＝ 150。"},
  {id:"q03-3",t:"sel",ans:"b",why:"β ＝ 0.5 時 3β² 只有 0.75，小於 1。",err:"以為 FM 在任何條件都較抗雜訊。"},
  {id:"q04-1",t:"num",ans:1910,tol:0.5,why:"高側影像是 1000 + 2 × 455 ＝ 1910 kHz。",err:"只加一個 f_IF；那是 f_LO。"},
  {id:"q04-2",t:"num",ans:118,tol:0.5,why:"兩端都算入，(1700 − 530) / 10 + 1 ＝ 118 台。",err:"忘了加 1。"},
  {id:"q04-3",t:"sel",ans:"c",why:"RF 與影像混頻後都落到同一個 IF，之後已分不開。",err:"以為 IF 濾波器可以擋影像。"},
  {id:"q05-1",t:"num",ans:-113.975187,tol:0.05,why:"1 MHz 比 1 Hz 多 60 dB，所以底是 −113.975187 dBm。",err:"用了 −174 速記後又多算一次，或 B 用成 kHz。"},
  {id:"q05-2",t:"num",ans:1.908120,tol:0.01,why:"Friis 線性相加後，總 NF 是 1.908120 dB。",err:"把 dB 直接相加，或忘了先換線性。"},
  {id:"q05-3",t:"sel",ans:"b",why:"損耗先出現會裸露後級，總 NF 升到 9.051478 dB。",err:"以為級聯 NF 與順序無關。"},
  {id:"q06-1",t:"num",ans:64,tol:0.5,why:"8 kHz × 8 位元 × 1 路 ＝ 64 kbit/s。",err:"忘了乘位元數。"},
  {id:"q06-2",t:"num",ans:49.925712,tol:0.05,why:"10 log10(1.5 × 4^8) ＝ 49.925712 dB。",err:"只算 6.02 × 8，沒加 1.76。"},
  {id:"q06-3",t:"sel",ans:"b",why:"階距減半使量化雜訊功率除以 4，因此多 6.020600 dB。",err:"把功率加倍的 3 dB 與階距減半的 6 dB 混在一起。"},
  {id:"q07-1",t:"num",ans:67.5,tol:0.05,why:"(1 + 0.35) × 100 / 2 ＝ 67.5 kHz。",err:"忘了除以 2，或忘了 (1 + α)。"},
  {id:"q07-2",t:"num",ans:72.958020,tol:0.1,why:"主瓣扣除兩側 20 個鄰居後，相對開度是 72.958020 %。",err:"只算了最近兩個鄰居。"},
  {id:"q07-3",t:"sel",ans:"c",why:"α ＝ 0 的尾巴只按 1/t 衰減，時序一偏，鄰居影響會持續累積。",err:"以為 α ＝ 0 在準確取樣點仍有 ISI。"},
  {id:"q08-1",t:"num",ans:3.872108,tol:0.01,why:"Q(√20) ＝ 3.872108 × 10^−6。",err:"用了 Q(√(E_b/N_0))；那是 FSK。"},
  {id:"q08-2",t:"num",ans:6.020600,tol:0.05,why:"ON-OFF 的 Q 引數少一半，要以 4 倍能量補回，即 6.020600 dB。",err:"答成 3 dB；那是平均功率相同的比法。"},
  {id:"q08-3",t:"sel",ans:"b",why:"最大取樣訊雜比是 2E / N_0，只由能量與 N_0 決定。",err:"以為波形越尖越好。"},
  {id:"q09-1",t:"num",ans:0.632456,tol:0.001,why:"16-QAM 歸一化後 d_min ＝ 2 / √10 ＝ 0.632456。",err:"忘了除以 √10。"},
  {id:"q09-2",t:"num",ans:6,tol:0.5,why:"log2(64) ＝ 6，所以每符元帶 6 位元。",err:"答成 64 或 8。"},
  {id:"q09-3",t:"sel",ans:"c",why:"QPSK 的 I、Q 各自等同一個 BPSK，所以位元錯誤機率相同。",err:"把符元錯誤機率約 2 倍當成位元錯誤機率。"},
  {id:"q10-1",t:"num",ans:6.658211,tol:0.01,why:"1 × log2(1 + 100) ＝ 6.658211 Mbit/s。",err:"用了 log10，或把 20 當成線性 SNR。"},
  {id:"q10-2",t:"num",ans:-1.591745,tol:0.01,why:"η 趨近 0 時，E_b/N_0 趨近 ln 2，也就是 −1.591745 dB。",err:"答成 0 dB。"},
  {id:"q10-3",t:"sel",ans:"b",why:"容量是可達天花板；未編碼的 64-QAM 仍有 0.85 % 的位元錯誤機率。",err:"把容量當成任何方案的錯誤機率保證。"},
  {id:"q11-1",t:"num",ans:80.052008,tol:0.05,why:"2400 MHz、100 m 代入自由空間公式是 80.052008 dB。",err:"用了 10 log，或 λ 算錯。"},
  {id:"q11-2",t:"num",ans:28.912879,tol:0.05,why:"接收功率扣掉含 NF 的雜訊底與所需 SNR，裕度是 28.912879 dB。",err:"雜訊底忘了加 NF。"},
  {id:"q11-3",t:"sel",ans:"b",why:"球面面積與距離平方成正比，距離加倍少 6.020600 dB。",err:"把距離平方的 20 log 當成 10 log。"}
];

/* ---------- 4. 十二章 widget ---------- */
function dbcalc(){
  if(!$("db-p1"))return;
  var ids=["db-p1","db-p2","db-f"];
  var draw=function(){
    var p1=val("db-p1"),p2=val("db-p2"),fk=val("db-f"),ratio,d,lamb,quarter,h,n;
    if(p1<=0||p2<=0||fk<=0){put("dbcalc-output","<p>功率與頻率都必須大於 0。</p>");return;}
    ratio=p1/p2;d=db10(ratio);lamb=C_LIGHT/(fk*1000);quarter=lamb/4;
    h="<table>"+row(["量","結果"],true)+row(["功率比",num6(ratio)])+row(["比值 dB",num6(d)+" dB"])+row(["P<sub>1</sub>",num6(db10(p1))+" dBm"])+row(["P<sub>2</sub>",num6(db10(p2))+" dBm"])+row(["λ",num6(lamb)+" m"])+row(["λ / 4",num6(quarter)+" m"])+row(["速記表","×2 ＝ 3.010300 dB；×10 ＝ 10 dB；×1000 ＝ 30 dB"])+"</table>";
    n=Math.log2(ratio);
    if(Math.abs(n-Math.round(n))<1e-9)h+="<p>每 ×2 加 3.010300 dB，這裡是 "+int0(n)+" 個 3.010300。</p>";
    if(d<0)h+="<p>負 dB 是衰減，不是負功率。</p>";
    if(p1===p2)h+="<p><strong>邊界</strong>：0 dB 就是一樣大。</p>";
    if(quarter>1000)h+="<p><strong>邊界</strong>：天線超過 1 km，直接發射不切實際——這就是調變的第一個理由。3 kHz 時 λ / 4 是 "+num6(quarter)+" m。</p>";
    if(quarter<0.1)h+="<p><strong>邊界</strong>：天線短到能藏進裝置。</p>";
    if(fk===28000000)h+="<p>毫米波天線只有幾毫米，但第 11 章會看到它的路徑損失也大。</p>";
    h+="<p><strong>為什麼</strong>：dB 是比值的對數，所以鏈路裡一串相乘變成一串相加。</p>";
    put("dbcalc-output",h);
  };
  bind(ids,draw);draw();
}

function amenv(){
  if(!$("am-mu"))return;
  var ids=["am-mu","am-fm","am-fc","am-rc"];
  var draw=function(){
    var mu=val("am-mu"),fm=val("am-fm")*1000,fc=val("am-fc")*1000,rc=val("am-rc"),emax=1+mu,emin=Math.abs(1-mu),eta=mu*mu/(2+mu*mu)*100,tc,lo,hi=null,ripple,h,i,v;
    if(fm<=0||fc<=0||rc<=0){put("amenv-output","<p>頻率與 RC 必須大於 0。</p>");return;}
    tc=1e6/fc;lo=10*tc;if(mu>0&&mu<1)hi=Math.sqrt(1-mu*mu)/(2*Math.PI*fm*mu)*1e6;else if(mu>=1)hi=0;
    ripple=(1-Math.exp(-tc/rc))*100;
    h="<table>"+row(["量","結果"],true)+row(["E<sub>max</sub>",num6(emax)+" V"])+row(["E<sub>min</sub>",num6(emin)+" V"])+row(["反推 μ",mu<=1?num6((emax-emin)/(emax+emin)):"不適用"])+row(["效率",num6(eta)+" %"])+row(["頻寬",num6(2*fm/1000)+" kHz"])+row(["T<sub>c</sub>",num6(tc)+" µs"])+row(["RC 下限",num6(lo)+" µs"])+row(["RC 上限",hi===null?"無上限":num6(hi)+" µs"])+row(["漣波比例",num6(ripple)+" %"])+"</table>";
    h+="<table>"+row(["t / T<sub>m</sub>","1 + μ cos","絕對值"],true);
    for(i=0;i<=8;i+=1){v=1+mu*Math.cos(2*Math.PI*i/8);h+=row([num6(i/8),num6(v),num6(Math.abs(v))]);}h+="</table>";
    if(mu>1)h+="<p>過調變：1 + μ cos 在谷底變負、包絡翻折，檢波輸出不再是訊息的形狀。</p>";
    if(rc<lo)h+="<p>RC 太小：每個載波週期電容放掉 "+num6(ripple)+" %，輸出有大漣波。</p>";
    if(hi!==null&&rc>hi&&mu<1)h+="<p>RC 太大：放電斜率追不上包絡下降，形成對角線截波。</p>";
    if(hi!==null&&lo>hi)h+="<p><strong>邊界</strong>：區間反轉，這組 f<sub>c</sub>、f<sub>m</sub>、μ 下包絡檢波器無解。</p>";
    if(hi!==null&&mu<1&&rc>=lo&&rc<=hi)h+="<p>RC 落在可用區間 ["+num6(lo)+", "+num6(hi)+"] µs。</p>";
    if(mu===0)h+="<p><strong>邊界</strong>：沒有調變，只剩載波，效率 0 %，上限無限大。</p>";
    if(mu===1)h+="<p><strong>邊界</strong>：100 % 調變，效率最高 33.333333 %，但上限為 0；谷底一定會截一點。</p>";
    h+="<p><strong>為什麼</strong>：包絡等於訊息，只成立在 1 + μ cos 恆正的時候；檢波器只是用電容記住峰值。</p>";
    put("amenv-output",h);
  };
  bind(ids,draw);draw();
}

function cohdem(){
  if(!$("cd-scheme"))return;
  var ids=["cd-scheme","cd-w","cd-phi","cd-df"];
  var draw=function(){
    var s=pick("cd-scheme"),w=val("cd-w"),phi=val("cd-phi"),df=val("cd-df"),mult={dsblc:2,dsbsc:2,ssb:1,vsb:1.25}[s],b,nch,c=Math.cos(phi*Math.PI/180),head,amp="不受影響",loss="不受影響",effect="不受影響",pwr=s==="dsblc"?"最高 33.333333 %（μ ＝ 1）":"100.000000 %",h;
    if(w<=0){put("cohdem-output","<p>W 必須大於 0。</p>");return;}b=mult*w;nch=Math.floor(100/b+1e-9);
    if(s==="dsblc")head="這個模式只用到 W，其餘控制不影響結果。";
    else if(s==="dsbsc"){head="這個模式只用到 W、φ、Δf，其餘控制不影響結果。";amp=num6(c);loss=c>1e-12?num6(20*Math.log10(c))+" dB":"完全消失";effect="輸出以 "+num6(df)+" Hz 起伏";}
    else{head="這個模式只用到 W、Δf；φ 只造成相位失真，其餘控制不影響結果。";amp="1.000000（相位失真 "+num6(phi)+"°）";loss="0.000000 dB";effect="頻譜平移 "+num6(df)+" Hz";}
    h="<p>"+head+"</p><table>"+row(["量","結果"],true)+row(["頻寬",num6(b)+" kHz"])+row(["100 kHz 可排路數",int0(nch)+" 路"])+row(["功率用於訊息",pwr])+row(["cos φ",s==="dsbsc"?num6(c):"不適用"])+row(["振幅",amp])+row(["振幅損失",loss])+row(["頻率誤差效應",effect])+"</table>";
    if(s==="dsbsc"&&phi===90)h+="<p><strong>邊界</strong>：正交零點，輸出完全消失。</p>";
    else if(s==="dsbsc"&&phi>=60)h+="<p>振幅只剩 "+num6(c)+"，損失至少 6.020600 dB，必須加鎖相迴路。</p>";
    if(s==="ssb")h+="<p>頻寬只有 DSB 的一半，路數加倍；相位誤差不掉振幅但會失真。</p>";
    if(df>0&&s==="ssb")h+="<p>所有頻率成分平移 "+num6(df)+" Hz，超過 50 Hz 語音就變調。</p>";
    if(df>0&&s==="dsbsc")h+="<p>輸出以 "+num6(df)+" Hz 起伏，每秒歸零 "+num6(2*df)+" 次。</p>";
    if(phi===0&&df===0)h+="<p><strong>邊界</strong>：理想同步，四種方案只差頻寬與功率。</p>";
    if(w===20)h+="<p><strong>邊界</strong>：高傳真音樂用 DSB 時只能排 2 路。</p>";
    if(s==="dsblc")h+="<p>包絡檢波不需要本地載波，φ 與 Δf 無意義；代價是功率大多在載波上。</p>";
    h+="<p><strong>為什麼</strong>：省掉載波，接收端就得自己造一個一模一樣的載波；造得不準，cos φ 就把訊息吃掉。</p>";
    put("cohdem-output",h);
  };
  bind(ids,draw);draw();
}

function fmcar(){
  if(!$("fm-df"))return;
  var ids=["fm-df","fm-w","fm-snr"];
  var draw=function(){
    var df=val("fm-df"),w=val("fm-w"),sr=val("fm-snr"),beta,bt,ra,g,gd,out,bwr,bwrd,cnr,h;
    if(w<=0){put("fmcar-output","<p>W 必須大於 0。</p>");return;}
    beta=df/w;bt=2*(df+w);ra=bt/(2*w);g=3*beta*beta;gd=db10(g);out=sr+gd;bwr=bt/w;bwrd=db10(bwr);cnr=sr-bwrd;
    h="<table>"+row(["量","結果"],true)+row(["β",num6(beta)])+row(["B<sub>T</sub>",num6(bt)+" kHz"])+row(["相對 AM 頻寬",num6(ra)+" 倍"])+row(["3β²",num6(g)])+row(["3β²",num6(gd)+" dB"])+row(["輸出訊雜比",num6(out)+" dB"])+row(["B<sub>T</sub> / W",num6(bwr)+"（"+num6(bwrd)+" dB）"])+row(["CNR",num6(cnr)+" dB"])+"</table>";
    if(cnr<10)h+="<p>CNR 低於 10 dB 門檻：3β² 公式失效，解調輸出出現雜訊尖峰，實際訊雜比遠低於表中數字。</p>";
    if(beta<=0.5)h+="<p>窄頻 FM：3β² ≤ 0.75，比 DSB-SC 還差，FM 的優勢只在 β 大。</p>";
    if(bt>200)h+="<p>頻寬超過 FM 廣播 200 kHz 的頻道間距，會干擾鄰台。</p>";
    if(cnr>=10&&beta>0.5)h+="<p>寬頻 FM 在門檻之上：用 "+num6(bwr)+" 倍頻寬換到 "+num6(gd)+" dB。</p>";
    if(sr===0)h+="<p><strong>邊界</strong>：載波已淹在雜訊裡。</p>";
    if(df===1&&w===20)h+="<p><strong>邊界</strong>：β ＝ 0.05，幾乎是 AM。</p>";
    if(df===150&&w===1)h+="<p><strong>邊界</strong>：β ＝ 150 看似增益很高，但 CNR 先撞門檻。</p>";
    h+="<p><strong>為什麼</strong>：FM 把訊息放進頻率，限幅器先移除振幅擾動，剩下的相位擾動被 β 稀釋；但 β 大也讓更多雜訊隨頻寬進來，所以有門檻。</p>";
    put("fmcar-output",h);
  };
  bind(ids,draw);draw();
}

function superhet(){
  if(!$("sh-frf"))return;
  var ids=["sh-frf","sh-fif","sh-side","sh-chan","sh-q"];
  var draw=function(){
    var frf=val("sh-frf"),fif=val("sh-fif"),side=pick("sh-side"),chan=val("sh-chan"),q=val("sh-q"),flo,fim,spacing=2*fif,nch,inband,rho=null,irr=null,idb=null,lolo,lohi,lor=null,h;
    if(frf<=0||chan<=0){put("superhet-output","<p>RF 與間距必須大於 0。</p>");return;}
    if(side==="high"){flo=frf+fif;fim=frf+2*fif;lolo=530+fif;lohi=1700+fif;}else{flo=frf-fif;fim=Math.abs(frf-2*fif);lolo=530-fif;lohi=1700-fif;}
    nch=Math.floor((1700-530)/chan+1e-9)+1;inband=fim>=530&&fim<=1700;
    if(fim>0){rho=fim/frf-frf/fim;irr=Math.sqrt(1+(q*rho)*(q*rho));idb=20*Math.log10(irr);}
    if(lolo>0)lor=lohi/lolo;
    h="<table>"+row(["量","結果"],true)+row(["f<sub>LO</sub>",flo>0?num6(flo)+" kHz":"LO 頻率為負，這組參數不成立"])+row(["影像頻率",fim>0?num6(fim)+" kHz":"不適用"])+row(["影像與 RF 間隔",num6(spacing)+" kHz"])+row(["影像在廣播頻段內",inband?"是":"否"])+row(["可排電台數",int0(nch)+" 台"])+row(["ρ",rho===null?"不適用":num6(rho)])+row(["影像抑制比",irr===null?"不適用":num6(irr)+"（"+num6(idb)+" dB）"])+row(["LO 調諧範圍",lolo>0?num6(lolo)+"–"+num6(lohi)+" kHz；比值 "+num6(lor):"頻段低端 LO 為負，低側注入不可行"])+"</table>";
    if(inband&&idb!==null)h+="<p>影像落在廣播頻段內，另一台電台會跟著進來，只能靠預選器壓 "+num6(idb)+" dB。</p>";
    if(idb!==null&&idb<30)h+="<p>抑制不到 30 dB，影像台會被聽見；提高 Q 或提高 IF。</p>";
    if(idb!==null&&idb>=40)h+="<p>影像抑制足夠。</p>";
    if(side==="low")h+="<p>低側的 LO 調諧比例大，可變電容難做，所以高側是常態。</p>";
    if(fim<=0)h+="<p><strong>邊界</strong>：影像頻率不為正，無法計算 ρ。</p>";
    if(fif===1000)h+="<p><strong>邊界</strong>：影像離 2 MHz，容易濾除；但 1 MHz 的 IF 濾波器要做 10 kHz 頻寬很難。</p>";
    if(q===200)h+="<p><strong>邊界</strong>：Q 這麼高的 LC 電路很難隨 RF 調諧，實務會用雙轉換。</p>";
    h+="<p><strong>為什麼</strong>：混頻只留差頻的絕對值，所以 RF 上下各 f<sub>IF</sub> 的兩個頻率都會落到 IF；混頻之後分不開，只能在混頻前濾。</p>";
    put("superhet-output",h);
  };
  bind(ids,draw);draw();
}

function friis(){
  if(!$("nf-b"))return;
  var ids=["nf-b","nf-pin","nf-g1","nf-f1","nf-g2","nf-f2","nf-f3","nf-swap"];
  var draw=function(){
    var b=val("nf-b")*1e6,pin=val("nf-pin"),g1=undb(val("nf-g1")),f1=undb(val("nf-f1")),g2=undb(val("nf-g2")),f2=undb(val("nf-f2")),f3=undb(val("nf-f3")),swap=chk("nf-swap"),nd,sin,t1,t2,t3,f,nf,te,sout,names,terms,di,base,baseNf,h;
    if(b<=0||g1<=0||g2<=0){put("friis-output","<p>頻寬與線性增益必須大於 0。</p>");return;}
    nd=KT0_DBM_HZ+db10(b);sin=pin-nd;
    if(!swap){t1=f1;t2=(f2-1)/g1;t3=(f3-1)/(g1*g2);names=["LNA","混頻器","IF 放大器"];}else{t1=f2;t2=(f1-1)/g2;t3=(f3-1)/(g2*g1);names=["混頻器","LNA","IF 放大器"];}
    terms=[t1,t2,t3];di=terms[1]>terms[0]?1:0;if(terms[2]>terms[di])di=2;f=t1+t2+t3;nf=db10(f);te=(f-1)*T0;sout=sin-nf;
    base=f1+(f2-1)/g1+(f3-1)/(g1*g2);baseNf=db10(base);
    h="<table>"+row(["量","結果"],true)+row(["雜訊底",num6(nd)+" dBm"])+row(["輸入訊雜比",num6(sin)+" dB"])+row(["第一項（"+names[0]+"）",num6(t1)])+row(["第二項（"+names[1]+"）",num6(t2)])+row(["第三項（"+names[2]+"）",num6(t3)])+row(["總 F",num6(f)])+row(["總 NF",num6(nf)+" dB"])+row(["T<sub>e</sub>",num6(te)+" K"])+row(["輸出訊雜比",num6(sout)+" dB"])+row(["主導項",names[di]])+"</table>";
    if(di===0)h+="<p>第一級決定整體：後面兩級被前級增益壓掉了。</p>";else h+="<p>後級裸露：第一級增益不夠或第一級是損耗。</p>";
    if(swap)h+="<p>損耗放前面，等於把後面的雜訊乘 1 / G<sub>2</sub>，總 NF 從 "+num6(baseNf)+" dB 跳到 "+num6(nf)+" dB。</p>";
    if(sout<0)h+="<p>訊號已淹在雜訊底下。</p>";else if(sout<10)h+="<p>訊雜比不到 10 dB，多數解調撐不住。</p>";
    if(val("nf-g1")===0)h+="<p><strong>邊界</strong>：LNA 沒有增益，後級全部裸露。</p>";
    if(val("nf-g1")===40)h+="<p><strong>邊界</strong>：LNA 增益很高，後級貢獻幾乎消失。</p>";
    if(val("nf-b")===100||val("nf-b")===0.01)h+="<p><strong>邊界</strong>：目前頻寬的熱雜訊底是 "+num6(nd)+" dBm；頻寬越窄，底越低。</p>";
    h+="<p><strong>為什麼</strong>：每一級加的雜訊換算回輸入端都要除以前面所有增益，所以第一級的增益是後面所有雜訊的除數。</p>";
    put("friis-output",h);
  };
  bind(ids,draw);draw();
}

function pcm(){
  if(!$("pc-w"))return;
  var ids=["pc-w","pc-fs","pc-bits","pc-ch"];
  var draw=function(){
    var w=val("pc-w"),fs=val("pc-fs"),n=val("pc-bits"),ch=val("pc-ch"),nyq=2*w,ok=fs>=nyq-1e-9,guard=fs/2-w,L=Math.pow(2,n),step=2000/L,sqnr=db10(1.5*Math.pow(4,n)),rb=n*fs*ch,bmin=rb/2,ratio=bmin/w,add=fs*ch,h;
    if(w<=0){put("pcm-output","<p>W 必須大於 0。</p>");return;}
    h="<table>"+row(["量","結果"],true)+row(["奈奎斯特率",num6(nyq)+" kHz"])+row(["是否滿足／防護頻帶",(ok?"是":"否")+"／"+num6(guard)+" kHz"])+row(["量化階數",int0(L)])+row(["階距",num6(step)+" mV"])+row(["SQNR",num6(sqnr)+" dB"])+row(["位元率",num6(rb)+" kbit/s"])+row(["最小基頻頻寬",num6(bmin)+" kHz"])+row(["頻寬放大倍數",num6(ratio)])+row(["再多 1 位元","+6.020600 dB；+"+num6(add)+" kbit/s"])+"</table>";
    if(!ok)h+="<p>取樣率低於奈奎斯特率：混疊，f<sub>s</sub> / 2 以上的成分會折回來冒充低頻，事後任何演算法都救不回。</p>";
    if(Math.abs(guard)<1e-9)h+="<p><strong>邊界</strong>：防護頻帶為零，抗混疊濾波器要無限陡。</p>";
    if(n<=4)h+="<p>SQNR 不到 26 dB，量化雜訊聽得見。</p>";
    if(n>=16)h+="<p>解析度已達 CD 等級以上。</p>";
    if(n>=20)h+="<p>超過實際 ADC 的熱雜訊底，多的位元是假的。</p>";
    if(ch===30)h+="<p><strong>邊界</strong>：E1 實際是 2048 kbit/s，多出的 128 是 2 個訊令時槽。</p>";
    if(ch===24)h+="<p><strong>邊界</strong>：T1 實際是 1544 kbit/s，多出的 8 是訊框位元。</p>";
    h+="<p><strong>為什麼</strong>：每多一個位元，階距減半、量化雜訊功率除以 4，所以 SQNR 加 6.020600 dB；代價是位元率加 f<sub>s</sub> × 路數。</p>";
    put("pcm-output",h);
  };
  bind(ids,draw);draw();
}

function isi(){
  if(!$("is-rs"))return;
  var ids=["is-rs","is-alpha","is-tau","is-k"];
  var draw=function(){
    var rs=val("is-rs"),a=val("is-alpha"),pct=val("is-tau"),K=val("is-k"),tau=pct/100,main=rcPulse(tau,a),sum=0,k,eye,rel=null,b=(1+a)*rs/2,eta=2/(1+a),xs=[0,0.25,0.5,0.75,1,1.5,2,3],h,i;
    for(k=1;k<=K;k+=1)sum+=Math.abs(rcPulse(k+tau,a))+Math.abs(rcPulse(-k+tau,a));eye=main-sum;if(main>0)rel=eye/main*100;
    h="<table>"+row(["量","結果"],true)+row(["頻寬",num6(b)+" kHz"])+row(["頻譜效率",num6(eta)+" bit/s/Hz"])+row(["主瓣",num6(main)])+row(["ISI 和",num6(sum)])+row(["眼開度",num6(eye)])+row(["相對開度",rel===null?"不適用":num6(rel)+" %"])+"</table><table>"+row(["x","升餘弦脈衝"],true);
    for(i=0;i<xs.length;i+=1)h+=row([num6(xs[i]),num6(rcPulse(xs[i],a))]);h+="</table>";
    if(eye<=0)h+="<p>眼睛閉合：最壞情況下鄰居的干擾比主瓣大，必然誤判。</p>";
    else if(rel!==null&&rel<50)h+="<p>眼開度不到一半，雜訊裕度只剩 "+num6(rel)+" %。</p>";
    if(a===0&&tau>0)h+="<p>磚牆濾波器的尾巴以 1 / t 衰減，把 K 拉大，眼睛會一直閉；這就是它不能用的證據。</p>";
    if(tau===0)h+="<p><strong>邊界</strong>：取樣點準確時任何 α 都無 ISI，α 買的是對時序誤差的耐受。</p>";
    if(a>=0.5)h+="<p>頻寬多付 "+num6(a*100)+" %，換到眼開度 "+(rel===null?"不適用":num6(rel)+" %")+"。</p>";
    if(K===1)h+="<p><strong>邊界</strong>：只算最近兩個鄰居，會低估 ISI。</p>";
    if(a===1&&tau===0)h+="<p><strong>邊界</strong>：α ＝ 1 時頻寬等於 R<sub>s</sub>。</p>";
    h+="<p><strong>為什麼</strong>：升餘弦的 α 越大，尾巴掉得越快，取樣點偏一點也踩不到多少鄰居；代價是頻寬乘 (1 + α)。</p>";
    put("isi-output",h);
  };
  bind(ids,draw);draw();
}

function ber(){
  if(!$("be-ebn0"))return;
  var ids=["be-ebn0","be-scheme","be-n"];
  var draw=function(){
    var ed=val("be-ebn0"),s=pick("be-scheme"),N=val("be-n"),g=undb(ed),args={bipolar:Math.sqrt(2*g),onoff:Math.sqrt(g/2),cfsk:Math.sqrt(g)},names={bipolar:"雙極基頻／BPSK",onoff:"ON-OFF 基頻／ASK",cfsk:"同調 FSK"},formula={bipolar:"Q(√(2E<sub>b</sub> / N<sub>0</sub>))",onoff:"Q(√(E<sub>b</sub> / 2N<sub>0</sub>))",cfsk:"Q(√(E<sub>b</sub> / N<sub>0</sub>))"},pe=Q(args[s]),errs=N*pe,h,k;
    h="<p>這個模式只用到 E<sub>b</sub>/N<sub>0</sub>、方案與傳送位元數；公式是 "+formula[s]+"。</p><table>"+row(["量","結果"],true)+row(["線性 E<sub>b</sub>/N<sub>0</sub>",num6(g)])+row(["匹配濾波器最大訊雜比",num6(2*g)+"（"+num6(db10(2*g))+" dB）"])+row(["Q 引數",num6(args[s])])+row(["P<sub>e</sub>",sci(pe)])+row(["期望錯誤數",num6(errs)])+row(["相對 BPSK 損失",num6(PENALTY[s])+" dB"])+"</table><table>"+row(["方案","P<sub>e</sub>"],true);
    for(k in args)if(args.hasOwnProperty(k))h+=row([names[k],sci(Q(args[k]))]);h+="</table>";
    if(pe<1e-5)h+="<p>良好：不加通道編碼也能用。</p>";else if(pe<1e-3)h+="<p>需要通道編碼（留給數位通訊課）。</p>";else h+="<p>目前設定不可用。</p>";
    if(errs<1)h+="<p>傳這麼多位元，期望連 1 個錯都不到。</p>";
    if(s==="onoff")h+="<p>同樣 E<sub>b</sub>，ON-OFF 的判決距離只有雙極的 1 / √2，Q 的引數少一半，等於多付 6.020600 dB。</p>";
    if(s==="cfsk")h+="<p>正交訊號的距離是 √(2E<sub>b</sub>)，介於兩者之間，差 3.010300 dB。</p>";
    if(ed===0)h+="<p><strong>邊界</strong>：E<sub>b</sub> ＝ N<sub>0</sub>，每 13 個位元約錯 1 個。</p>";
    if(ed===16&&s==="bipolar")h+="<p><strong>邊界</strong>：P<sub>e</sub> 為 2.267396 × 10<sup>−19</sup>，實務上量不到，系統會先受其他機制限制。</p>";
    h+="<p><strong>為什麼</strong>：錯誤機率只由判決距離除以雜訊標準差決定；匹配濾波器把這個比值推到最大，而距離只跟能量有關、跟波形無關。</p>";
    put("ber-output",h);
  };
  bind(ids,draw);draw();
}

function constellationResult(key,ed){
  var c=CONSTEL[key],g=undb(ed),es=c.k*g,sigma=Math.sqrt(1/(2*es)),arg=c.dmin/(2*sigma),q=Q(arg),raw=c.nn*q,ps=Math.min(1,raw),pb=Math.min(0.5,ps/c.k);
  return {c:c,g:g,es:es,sigma:sigma,arg:arg,q:q,raw:raw,ps:ps,pb:pb};
}
function coordinateTable(key){
  var h="<table>"+row(["星座座標說明","值"],true),i,levels;
  if(key==="bpsk")h+=row(["兩點","(−1, 0)、(1, 0)"]);
  else if(key==="qpsk")h+=row(["四點","(±1/√2, ±1/√2)"]);
  else if(key==="psk8"){for(i=0;i<8;i+=1)h+=row(["角度 "+int0(45*i)+"°","("+num6(Math.cos(2*Math.PI*i/8))+", "+num6(Math.sin(2*Math.PI*i/8))+")"]);}
  else{levels=key==="qam16"?["−3/√10","−1/√10","1/√10","3/√10"]:["−7/√42","−5/√42","−3/√42","−1/√42","1/√42","3/√42","5/√42","7/√42"];h+=row(["I、Q 各軸位準",levels.join("、")])+row(["組合",key==="qam16"?"16 點 ＝ 4 × 4 組合":"64 點 ＝ 8 × 8 組合"]);}
  return h+"</table>";
}
function constel(){
  if(!$("cs-scheme"))return;
  var ids=["cs-scheme","cs-ebn0","cs-rs"];
  var draw=function(){
    var key=pick("cs-scheme"),ed=val("cs-ebn0"),rs=val("cs-rs"),r=constellationResult(key,ed),rb=r.c.k*rs,keys=["bpsk","qpsk","psk8","qam16","qam64"],h,i;
    h="<table>"+row(["量","結果"],true)+row(["M",int0(r.c.M)])+row(["k",int0(r.c.k)+" 位元/符元"])+row(["R<sub>b</sub>",num6(rb)+" kbit/s"])+row(["頻寬（α ＝ 0）",num6(rs)+" kHz"])+row(["頻譜效率",num6(r.c.k)+" bit/s/Hz"])+row(["d<sub>min</sub>",num6(r.c.dmin)])+row(["E<sub>s</sub>/N<sub>0</sub>",num6(r.es)+"（"+num6(db10(r.es))+" dB）"])+row(["σ",num6(r.sigma)])+row(["d<sub>min</sub> / (2σ)",num6(r.arg)])+row(["Q",sci(r.q)])+row(["P<sub>s</sub>",sci(r.ps)])+row(["P<sub>b</sub>",sci(r.pb)])+"</table><table>"+row(["星座","P<sub>b</sub>"],true);
    for(i=0;i<keys.length;i+=1)h+=row([CONSTEL[keys[i]].name,sci(constellationResult(keys[i],ed).pb)]);h+="</table>"+coordinateTable(key);
    if(r.pb<1e-5)h+="<p>良好。</p>";else if(r.pb<1e-3)h+="<p>需要通道編碼。</p>";else h+="<p>這個 E<sub>b</sub>/N<sub>0</sub> 下，"+r.c.name+" 幾乎不可用。</p>";
    if(r.raw>1)h+="<p>最近鄰近似算出超過 1，已夾成 1；此近似只在高 E<sub>b</sub>/N<sub>0</sub> 準。</p>";
    if(key==="qpsk")h+="<p>與 BPSK 的位元錯誤機率相同，但頻譜效率加倍：I、Q 各跑一個 BPSK。</p>";
    if(key==="qam64")h+="<p>d<sub>min</sub> 只有 BPSK 的 0.154303 倍，要多付約 8 dB 才追得上。</p>";
    if(ed===0)h+="<p><strong>邊界</strong>：低能量區最近鄰近似可能失效，請留意夾限提示。</p>";
    if(ed===30)h+="<p><strong>邊界</strong>：極小機率以科學記號呈現；低於顯示下限則標示小於 10<sup>−300</sup>。</p>";
    if(rs===1000&&key==="qam64")h+="<p><strong>邊界</strong>：64-QAM 的 R<sub>b</sub> 是 6.000000 Mbit/s。</p>";
    h+="<p><strong>為什麼</strong>：符元帶越多位元，同樣的平均能量要分給越多點，點就越擠；誤判機率只看最近兩點的距離除以雜訊標準差。</p>";
    put("constel-output",h);
  };
  bind(ids,draw);draw();
}

function shannon(){
  if(!$("sc-b"))return;
  var ids=["sc-b","sc-snr","sc-scheme"];
  var draw=function(){
    var b=val("sc-b"),sd=val("sc-snr"),key=pick("sc-scheme"),s=undb(sd),cap=b*Math.log2(1+s),eta=ETA[key],rb=eta*b,ratio=cap/rb,eb=s/eta,ebd=db10(eb),pb=constellationResult(key,ebd).pb,mine=(Math.pow(2,eta)-1)/eta,mind=db10(mine),limit=db10(Math.LN2),over=rb>cap,h;
    h="<table>"+row(["量","結果"],true)+row(["C",num6(cap)+" Mbit/s"])+row(["C / B",num6(cap/b)+" bit/s/Hz"])+row(["R<sub>b</sub>",num6(rb)+" Mbit/s"])+row(["C / R<sub>b</sub>",num6(ratio)])+row(["E<sub>b</sub>/N<sub>0</sub>",num6(eb)+"（"+num6(ebd)+" dB）"])+row(["P<sub>b</sub>",sci(pb)])+row(["此 η 最低 E<sub>b</sub>/N<sub>0</sub>",num6(mine)+"（"+num6(mind)+" dB）"])+row(["Shannon 極限",num6(limit)+" dB"])+"</table>";
    if(over)h+="<p>R<sub>b</sub> 超過容量：任何編碼都做不到任意低的錯誤機率。</p>";
    else if(pb>=1e-5)h+="<p>在容量之內，但未編碼的 "+CONSTEL[key].name+" 錯誤機率為 "+sci(pb)+"；缺口要靠通道編碼填。</p>";
    else h+="<p>未編碼就可用，但只用了容量的 "+num6(rb/cap*100)+" %。</p>";
    if(sd>=30)h+="<p>高 SNR 區：每加 1 bit/s/Hz 要多約 3 dB。</p>";
    if(sd<=0)h+="<p>低 SNR 區：C 約為 1.442695 × B × SNR，功率受限，η 應該小。</p>";
    if(sd===-10)h+="<p><strong>邊界</strong>：SNR 很低，容量只剩 "+num6(cap)+" Mbit/s。</p>";
    if(sd===40)h+="<p><strong>邊界</strong>：C / B ＝ 13.287857 bit/s/Hz。</p>";
    h+="<p><strong>為什麼</strong>：Shannon 曲線是天花板；頻譜效率越高，每位元需要的能量以 (2<sup>η</sup> − 1) / η 上升。未編碼方案離天花板的距離，就是編碼增益可填的缺口。</p>";
    put("shannon-output",h);
  };
  bind(ids,draw);draw();
}

function link(){
  if(!$("lb-pt"))return;
  var ids=["lb-pt","lb-gt","lb-gr","lb-f","lb-d","lb-b","lb-nf","lb-req","lb-fade"];
  var draw=function(){
    var pt=val("lb-pt"),gt=val("lb-gt"),gr=val("lb-gr"),f=val("lb-f")*1e6,d=val("lb-d"),b=val("lb-b")*1e6,nf=val("lb-nf"),req=val("lb-req"),fade=val("lb-fade"),lambda,fspl,pr,blog,nd,snr,margin,dmax,h;
    if(f<=0||d<=0||b<=0){put("link-output","<p>頻率、距離與頻寬必須大於 0。</p>");return;}
    lambda=C_LIGHT/f;fspl=20*Math.log10(4*Math.PI*d/lambda);pr=pt+gt+gr-fspl;blog=db10(b);nd=KT0_DBM_HZ+blog+nf;snr=pr-nd;margin=snr-req-fade;dmax=d*Math.pow(10,margin/20);
    h="<table>"+row(["帳本項目","結果"],true)+row(["P<sub>t</sub>",num6(pt)+" dBm"])+row(["+ G<sub>t</sub>",num6(gt)+" dBi"])+row(["+ G<sub>r</sub>",num6(gr)+" dBi"])+row(["− FSPL",num6(fspl)+" dB"])+row(["＝ P<sub>r</sub>",num6(pr)+" dBm"])+row(["kT<sub>0</sub>",num6(KT0_DBM_HZ)+" dBm/Hz"])+row(["+ 10 log<sub>10</sub> B",num6(blog)+" dB"])+row(["+ NF",num6(nf)+" dB"])+row(["＝ N",num6(nd)+" dBm"])+row(["SNR",num6(snr)+" dB"])+row(["− 所需 SNR",num6(req)+" dB"])+row(["− 衰落裕度",num6(fade)+" dB"])+row(["＝ 裕度",num6(margin)+" dB"])+row(["最遠距離",num6(dmax)+" m"])+row(["λ",num6(lambda)+" m"])+row(["距離加倍的 FSPL",num6(fspl+6.020600)+" dB"])+"</table>";
    if(margin>=10)h+="<p>鏈路通，還有 "+num6(margin)+" dB 保險。</p>";else if(margin>=0)h+="<p>勉強通，任何遮蔽都可能中斷。</p>";else h+="<p>鏈路不通：缺 "+num6(-margin)+" dB，距離要縮到 "+num6(dmax)+" m 或功率加 "+num6(-margin)+" dB。</p>";
    if(pr<-100)h+="<p>接收功率低於 −100 dBm，已在多數接收機的靈敏度極限附近。</p>";
    if(dmax>20000)h+="<p><strong>邊界</strong>：最遠距離超過 20 km，自由空間模型已不可信，必須考慮地球曲率、視距與多徑。</p>";
    if(d===10)h+="<p><strong>邊界</strong>：目前自由空間路徑損失是 "+num6(fspl)+" dB。</p>";
    if(f===100e6)h+="<p><strong>邊界</strong>：100 MHz 的 λ / 4 是 "+num6(lambda/4)+" m。</p>";
    if(fade===30)h+="<p><strong>邊界</strong>：30 dB 衰落保險已從裕度完整扣除。</p>";
    h+="<p><strong>為什麼</strong>：FSPL 是能量攤在球面上，所以距離加倍掉 6.020600 dB；頻率加倍也掉 6.020600 dB，因為同樣 dBi 的接收天線有效面積少 4 倍。</p>";
    put("link-output",h);
  };
  bind(ids,draw);draw();
}

/* ---------- 5. 字典 ---------- */
function dictionary(){
  if(!$("term-search"))return;
  var draw=function(){var q=String(pick("term-search")).toLowerCase().trim(),cards=document.getElementsByClassName("term-card"),shown=0,i,c,hay;for(i=0;i<cards.length;i+=1){c=cards[i];hay=((c.getAttribute("data-search")||"")+" "+(c.textContent||"")).toLowerCase();if(q===""||hay.indexOf(q)!==-1){c.removeAttribute("hidden");shown+=1;}else c.setAttribute("hidden","hidden");}put("term-count","顯示 "+int0(shown)+" / "+int0(cards.length)+" 張卡");};
  bind(["term-search"],draw);draw();
}

/* ---------- 6. 自我檢核 ---------- */
function selfcheck(){
  if(!$("quiz-reset"))return;
  var answered={};
  var progress=function(){var n=0,k;for(k in answered)if(answered.hasOwnProperty(k)&&answered[k])n+=1;put("quiz-progress","已作答 "+int0(n)+" / "+int0(QUIZ.length)+" 題（僅供參考，不影響瀏覽）");};
  var chapterLink=function(id){var t=QUIZ_CH[id.slice(1,3)];return t?"<p>回去看：<a href=\""+t[0]+"\">"+t[1]+"</a></p>":"";};
  var makeCheck=function(q){return function(){var node=$(q.id),raw,ok,v,right;if(!node)return;raw=node.value;if(raw===""||raw===null){put(q.id+"-output","<p>"+(q.t==="num"?"先填一個數字。":"先選一個選項。")+"</p>");answered[q.id]=false;progress();return;}if(q.t==="num"){v=Number(raw);if(isNaN(v)){put(q.id+"-output","<p>先填一個數字。</p>");answered[q.id]=false;progress();return;}ok=Math.abs(v-q.ans)<=q.tol;}else ok=String(raw)===q.ans;answered[q.id]=true;if(ok)put(q.id+"-output","<p><strong>答對</strong>　"+q.why+"</p>"+chapterLink(q.id));else{right=q.t==="num"?"正確答案是 "+num6(q.ans).replace(/\.?0+$/," ").trim()+"。":"正確答案是選項 "+q.ans+"。";put(q.id+"-output","<p><strong>再看一次</strong>　"+right+q.err+"</p>"+chapterLink(q.id));}progress();};};
  var i,q,btn,reset;
  for(i=0;i<QUIZ.length;i+=1){q=QUIZ[i];btn=$(q.id+"-check");if(btn)btn.addEventListener("click",makeCheck(q));}
  reset=$("quiz-reset");if(reset)reset.addEventListener("click",function(){var j,n;for(j=0;j<QUIZ.length;j+=1){n=$(QUIZ[j].id);if(n)n.value="";put(QUIZ[j].id+"-output","");answered[QUIZ[j].id]=false;}progress();});
  progress();
}

/* ---------- 7. 註冊 ---------- */
if(typeof document!=="undefined"){
  [dbcalc,amenv,cohdem,fmcar,superhet,friis,pcm,isi,ber,constel,shannon,link,dictionary,selfcheck].forEach(function(f){f();});
}

/* ---------- 8. Node 匯出 ---------- */
if(typeof module!=="undefined")module.exports={erfc:erfc,Q:Q,sinc:sinc,rcPulse:rcPulse,num6:num6,sci:sci,CONSTEL:CONSTEL,KT0_DBM_HZ:KT0_DBM_HZ,QUIZ:QUIZ};

"use strict";
/* 馬達驅動與控制（零基礎互動課）——確定性、零外部資源、無持久儲存。 */

/* ---------- 1. helper ---------- */
var $ = function (id) {
  if (typeof document === "undefined") { return null; }
  return document.getElementById(id);
};
var bind = function (ids, f) {
  ids.forEach(function (id) {
    var n = $(id);
    if (n) { n.addEventListener("input", f); }
  });
};
var val = function (id) { var n = $(id); return n ? Number(n.value) : 0; };
var pick = function (id) { var n = $(id); return n ? String(n.value) : ""; };
var zc = function (x) { return Math.abs(x) < 1e-12 ? 0 : x; };
var minus = function (s) { return String(s).replace(/-/g, "−"); };
var num6 = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  return minus(zc(v).toFixed(6));
};
var int0 = function (x) {
  var v = Number(x);
  if (!isFinite(v)) { return "不適用"; }
  return minus(String(Math.round(zc(v))));
};
var esc = function (s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
var put = function (id, html) { var n = $(id); if (n) { n.innerHTML = html; } };
var row = function (cells, th) {
  var t = th ? "th" : "td";
  return "<tr><" + t + ">" + cells.join("</" + t + "><" + t + ">") + "</" + t + "></tr>";
};
var deg2rad = function (x) { return x * Math.PI / 180; };
var sinD = function (x) { return Math.sin(deg2rad(x)); };
var cosD = function (x) { return Math.cos(deg2rad(x)); };
var table = function (caption, rows) {
  var h = "<table><caption>" + caption + "</caption>" + row(["量", "結果"], true), i;
  for (i = 0; i < rows.length; i += 1) { h += row(rows[i]); }
  return h + "</table>";
};

/* ---------- 2. 常數 ---------- */
var BLDC_TABLE = [
  { start: 330, code: "100", phase: "B+ C−（A 浮接）", stator: 90, range: "330° ≤ θ < 30°" },
  { start: 30, code: "110", phase: "C+ A−（B 浮接）", stator: 150, range: "30° ≤ θ < 90°" },
  { start: 90, code: "010", phase: "B+ A−（C 浮接）", stator: 210, range: "90° ≤ θ < 150°" },
  { start: 150, code: "011", phase: "C+ B−（A 浮接）", stator: 270, range: "150° ≤ θ < 210°" },
  { start: 210, code: "001", phase: "A+ B−（C 浮接）", stator: 330, range: "210° ≤ θ < 270°" },
  { start: 270, code: "101", phase: "A+ C−（B 浮接）", stator: 30, range: "270° ≤ θ < 330°" }
];
var SV_VEC = ["100", "110", "010", "011", "001", "101"];
var SV_TABLE = [
  ["sum", "t2", "zero"], ["t1", "sum", "zero"], ["zero", "sum", "t2"],
  ["zero", "t1", "sum"], ["t2", "zero", "sum"], ["sum", "zero", "t1"]
];

var QUIZ_CH = {
  "00": ["00-驅動器世界觀與轉矩夾角.html", "00 驅動器世界觀與轉矩夾角"],
  "01": ["01-H橋與平均電壓.html", "01 H 橋與平均電壓"],
  "02": ["02-電流迴路PI設計.html", "02 電流迴路 PI 設計"],
  "03": ["03-速度與位置迴路串級.html", "03 速度與位置迴路串級"],
  "04": ["04-步進馬達與微步.html", "04 步進馬達與微步"],
  "05": ["05-BLDC六步換相與霍爾.html", "05 BLDC 六步換相與霍爾"],
  "06": ["06-感應機Vf純量控制.html", "06 感應機 V/f 純量控制"],
  "07": ["07-Clarke與Park轉換.html", "07 Clarke 與 Park 轉換"],
  "08": ["08-dq電壓方程與弱磁.html", "08 dq 電壓方程與弱磁"],
  "09": ["09-SVPWM扇區與作用時間.html", "09 SVPWM 扇區與作用時間"],
  "10": ["10-編碼器與速度估測.html", "10 編碼器與速度估測"],
  "11": ["11-再生煞車與能量.html", "11 再生煞車與能量"]
};
var quizWhy = {
  "00": ["T = K_t × I × sin 60°。", "六步窗的正弦平均為 3 / π。", "夾角為 0° 時兩磁場對齊，只有徑向拉力。"],
  "01": ["單極性平均電壓為 D × V_dc。", "穩態電流為 (V_avg − E) / R。", "電流反向代表機械能回到直流鏈。"],
  "02": ["K_p = L × 2πf_c。", "延遲相位為 ω_c × 1.5T_s。", "PI 零點抵消 RL 受控體極點。"],
  "03": ["ω_s = ω_c / N。", "速度 K_p = J × ω_s。", "內外迴路同頻寬時，內迴路落後不能忽略。"],
  "04": ["微步角為 360° / N_spr / m。", "增量轉矩為 T_h × sin(90° / m)。", "細分增加只改每格大小，不改同一負載下的機械偏移。"],
  "05": ["100° 落在第 3 扇區，霍爾碼為 010。", "平均係數為 (3 / π) × cos 30°。", "合法六步序列每次只變一個位元。"],
  "06": ["端電壓為 3 + (220 − 3) × 30 / 60。", "滑差轉速為 54 × 0.5 / 1.028102。", "電壓封頂後磁通與頻率成反比，拉出轉矩與頻率平方成反比。"],
  "07": ["i_q = 10 × cos 10°。", "轉矩損失為 1 − cos 45°。", "Park 使用同一轉子角旋轉座標，角度項因而消去。"],
  "08": ["線性區相電壓上限為 V_dc / √3。", "反電動勢為 ω_e × ψ_f。", "負 i_d 降低 d 軸總磁鏈，使相同電壓可容許更高速度。"],
  "09": ["T_1 由扇區內角 20° 的伏秒平衡求得。", "200° 位於第 4 扇區。", "兩個線性區上限相比為 (1/√3) / (1/2)。"],
  "10": ["M 法每一計數對應 60 / (4N × T_s) rpm。", "邊緣間隔 50 µs 乘 10 MHz 得 500 tick。", "300 rpm 低於 1500 rpm 交叉速度，T 法較準。"],
  "11": ["動能為 0.5 × J × ω²。", "電容增量能量為 0.5 × C × (V_trip² − V_dc²)。", "電阻可承受功率高於峰值再生功率，斬波器可撐住。"]
};
var QUIZ = (function () {
  var raw = [
    ["q00-1","num",4.330127,0.01],["q00-2","num",0.954930,0.001],["q00-3","sel","b",0],
    ["q01-1","num",18,0.01],["q01-2","num",7.528024,0.01],["q01-3","sel","c",0],
    ["q02-1","num",6.283185,0.01],["q02-2","num",13.5,0.1],["q02-3","sel","a",0],
    ["q03-1","num",314.159265,0.1],["q03-2","num",3.141593,0.01],["q03-3","sel","d",0],
    ["q04-1","num",0.1125,0.0001],["q04-2","num",0.039207,0.001],["q04-3","sel","b",0],
    ["q05-1","sel","c",0],["q05-2","num",0.826993,0.001],["q05-3","sel","a",0],
    ["q06-1","num",111.5,0.01],["q06-2","num",26.261994,0.01],["q06-3","sel","d",0],
    ["q07-1","num",9.848078,0.01],["q07-2","num",29.289322,0.01],["q07-3","sel","b",0],
    ["q08-1","num",173.205081,0.01],["q08-2","num",125.663706,0.01],["q08-3","sel","c",0],
    ["q09-1","num",37.11136,0.01],["q09-2","num",4,0],["q09-3","sel","a",0],
    ["q10-1","num",15,0.01],["q10-2","num",500,0.5],["q10-3","sel","b",0],
    ["q11-1","num",2467.4011,0.1],["q11-2","num",27.2,0.01],["q11-3","sel","d",0]
  ];
  return raw.map(function (x) {
    var ch = x[0].slice(1, 3), k = Number(x[0].slice(4)) - 1;
    return { id: x[0], t: x[1], ans: x[2], tol: x[3], why: quizWhy[ch][k] };
  });
}());

/* ---------- 3. widget ---------- */
function torqueangle() {
  if (!$('torqueangle-output')) { return; }
  var ids = ['ta-gamma', 'ta-i', 'ta-kt'];
  var draw = function () {
    var g = val('ta-gamma'), i = val('ta-i'), kt = val('ta-kt');
    var s = sinD(g), t = kt * i * s, ti = kt * s, tm = kt * i;
    var pct = tm === 0 ? 0 : t / tm * 100, avg = 3 / Math.PI * tm, low = Math.sqrt(3) / 2 * tm;
    var h = table('夾角與轉矩', [
      ['轉矩', num6(t) + ' N·m'], ['每安培轉矩', num6(ti) + ' N·m/A'],
      ['佔最大值', num6(pct) + ' %'], ['六步平均', num6(avg) + ' N·m'],
      ['六步最低', num6(low) + ' N·m'], ['六步漣波', '14.029787 %']
    ]);
    if (g === 90) { h += '<p><strong>判讀：夾角 90°，這個電流能給的轉矩全部拿到。</strong></p>'; }
    else if (g >= 60 && g <= 120) { h += '<p><strong>判讀：在六步換相的工作窗內，轉矩是最大值的 ' + num6(pct) + ' %。</strong></p>'; }
    else { h += '<p><strong>判讀：已超出六步換相的 ±30° 窗，電子換相應切到下一組相。</strong></p>'; }
    h += '<p>六步平均 = 3 / π = 95.493 % 的最大值。為什麼：轉矩取決於兩磁場向量外積的 sin γ。</p>';
    if (g === 0 || g === 180) { h += '<p>邊界：兩磁場對齊或反向，轉矩為零，只剩徑向力。</p>'; }
    if (i === 0) { h += '<p>邊界：沒有定子電流就沒有定子磁場。</p>'; }
    if (i === 20) { h += '<p>邊界：已到本課電流上限；線性關係只在鐵心未飽和時成立。</p>'; }
    put('torqueangle-output', h);
  };
  bind(ids, draw); draw();
}

function hbridge() {
  if (!$('hbridge-output')) { return; }
  var ids = ['hb-vdc','hb-d','hb-mode','hb-fsw','hb-l','hb-ke','hb-n'];
  var draw = function () {
    var vdc=val('hb-vdc'), d=val('hb-d'), mode=pick('hb-mode'), fs=val('hb-fsw'), l=val('hb-l');
    var ke=val('hb-ke'), n=val('hb-n'), bi=mode==='bipolar';
    var v=bi?(2*d-1)*vdc:d*vdc, w=n*2*Math.PI/60, e=ke*w, i=v-e, tq=ke*i;
    var rip=vdc*d*(1-d)/(fs*1000*l/1000)*(bi?2:1), rp=i===0?null:Math.abs(rip/i)*100;
    var ts=1000/fs, ratio=l/(ts/1000), pe=v*i, pm=e*i, pcu=i*i;
    var q=(v>=0&&i>=0)?'Q1 正轉電動':(v>=0&&i<0)?'Q2 正轉再生煞車':(v<0&&i<=0)?'Q3 反轉電動':'Q4 反轉再生煞車';
    var h='<p><strong>目前模式：'+(bi?'雙極性':'單極性')+'</strong></p>'+table('H 橋平均值模型',[
      ['平均電壓',num6(v)+' V'],['反電動勢',num6(e)+' V'],['穩態電流',num6(i)+' A'],['轉矩',num6(tq)+' N·m'],
      ['漣波（峰對峰）',num6(rip)+' A'],['漣波佔電流',rp===null?'不適用':num6(rp)+' %'],
      ['電氣時間常數',num6(l)+' ms（切換週期 '+num6(ts)+' µs 的 '+num6(ratio)+' 倍）'],
      ['電輸入功率',num6(pe)+' W'],['機械功率',num6(pm)+' W'],['銅損',num6(pcu)+' W'],['象限',q]
    ]);
    h+='<p><strong>判讀：'+q+'。</strong>電流方向由 V_avg 與 E 誰大決定，不是由開關決定。</p>';
    if(i<0){h+='<p>再生煞車：機械功率 '+num6(pm)+' W 流回直流鏈，見第 11 章。</p>';}
    h+='<p>為什麼：繞組電感濾掉快速通斷，穩態電流由平均電壓與反電動勢之差決定。</p>';
    if(rp!==null){h+='<p>'+(rp<=5?'平均值模型成立，漣波可忽略。':rp<=20?'漣波已影響轉矩平順度。':'漣波過大，平均值模型只剩示意。')+'</p>';}
    if(ratio<10){h+='<p>邊界：τ_e 不到切換週期 10 倍，電流呈三角波。</p>';}
    if(n===0){h+='<p>邊界：堵轉時反電動勢為 0，全部電輸入成為銅損。</p>';}
    if(d===0&&!bi){h+='<p>邊界：繞組被短路，反電動勢驅動負電流，形成動態煞車。</p>';}
    if(d===0.5&&bi){h+='<p>邊界：平均電壓為 0，馬達只剩煞車。</p>';}
    if(Math.abs(i)>20){h+='<p>邊界：超過本課 20 A 等級，實機會觸發過電流保護。</p>';}
    put('hbridge-output',h);
  };
  bind(ids,draw); draw();
}

function currentloop() {
  if (!$('currentloop-output')) { return; }
  var ids=['cl-r','cl-l','cl-fc','cl-fpwm','cl-step','cl-vdc'];
  var draw=function(){
    var r=val('cl-r'),lm=val('cl-l'),fc=val('cl-fc'),fp=val('cl-fpwm'),di=val('cl-step'),vdc=val('cl-vdc');
    var l=lm/1000,wc=2*Math.PI*fc,kp=l*wc,ki=r*wc,zero=r/l,te=lm/r,tau=1000/wc;
    var tr=2.197225*tau,settle=3.912023*tau,i1=(1-Math.exp(-wc*0.001))*100;
    var samp=1000/fp,delay=1.5*samp,lag=wc*delay*1e-6*180/Math.PI,pm=90-lag,ratio=fp*1000/fc;
    var v0=kp*di,imax=vdc/kp;
    var h=table('電流迴路 PI',[
      ['頻寬 ω_c',num6(wc)+' rad/s'],['K_p',num6(kp)+' V/A'],['K_i',num6(ki)+' V/(A·s)'],
      ['PI 零點 K_i / K_p',num6(zero)+' rad/s'],['受控體時間常數',num6(te)+' ms'],['閉迴路時間常數',num6(tau)+' ms'],
      ['10–90 % 上升時間',num6(tr)+' ms'],['2 % 整定時間',num6(settle)+' ms'],['1 ms 時達到',num6(i1)+' %'],
      ['取樣週期 T_s',num6(samp)+' µs'],['延遲 1.5 T_s',num6(delay)+' µs'],['延遲相位',num6(lag)+'°'],
      ['相位裕度',num6(pm)+'°'],['f_pwm / f_c',num6(ratio)],['第一拍要求電壓',num6(v0)+' V'],['不飽和最大步階',num6(imax)+' A']
    ]);
    h+='<p>零點 K_i / K_p = R / L = '+num6(zero)+' rad/s，剛好抵消受控體極點，閉迴路是一階。</p>';
    h+='<p><strong>判讀：'+(pm>=60?'相位裕度充足。':pm>=45?'相位裕度偏低，實機參數誤差可能引發振盪。':'相位裕度不足，頻寬要壓到 f_pwm 的 1 / 20 以下。')+'</strong></p>';
    h+='<p>'+(v0>vdc?'第一拍要 '+num6(v0)+' V 但只有 '+num6(vdc)+' V，電壓飽和，必須有反積分飽和。':'第一拍 '+num6(v0)+' V 在直流鏈電壓內，不飽和。')+'</p>';
    h+='<p>為什麼：頻寬提高會加快響應，也同時放大延遲相位與瞬間電壓需求。</p>';
    if(pm<=0){h+='<p>邊界：相位裕度為負，這個頻寬在目前取樣率下做不到。</p>';}
    if(fc<=100){h+='<p>邊界：頻寬太低，速度迴路會被拖慢。</p>';}
    put('currentloop-output',h);
  };
  bind(ids,draw); draw();
}

var cascadeSim=function(j,fc,nsep,tl){
  var wc=2*Math.PI*fc,ws=wc/nsep,kp=j*ws,ki=j*ws*ws/2,tf=kp/ki;
  var dt=1/(20*wc),steps=Math.round(1200*nsep),loadAt=30/ws;
  var y=[0,0,0,0],peak=0,tpeak=0,t10=null,t90=null,lastPre=0,wmin=1,tmin=loadAt,lastPost=loadAt;
  var curLoad=0;
  var deriv=function(state,time){
    var load=curLoad;
    return [(1-state[0])/tf,state[0]-state[3],wc*(kp*(state[0]-state[3])+ki*state[1]-state[2]),(state[2]-load)/j];
  };
  var add=function(a,b,scale){return [a[0]+b[0]*scale,a[1]+b[1]*scale,a[2]+b[2]*scale,a[3]+b[3]*scale];};
  var t=0,k1,k2,k3,k4,q;
  for(q=0;q<steps;q+=1){
    curLoad=(t>=loadAt)?tl:0;
    k1=deriv(y,t); k2=deriv(add(y,k1,dt/2),t+dt/2); k3=deriv(add(y,k2,dt/2),t+dt/2); k4=deriv(add(y,k3,dt),t+dt);
    y=[y[0]+dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,y[1]+dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6,
       y[2]+dt*(k1[2]+2*k2[2]+2*k3[2]+k4[2])/6,y[3]+dt*(k1[3]+2*k2[3]+2*k3[3]+k4[3])/6];
    t+=dt;
    if(t<loadAt){
      if(y[3]>peak){peak=y[3];tpeak=t;}
      if(t10===null&&y[3]>=0.1){t10=t;} if(t90===null&&y[3]>=0.9){t90=t;}
      if(Math.abs(y[3]-1)>0.02){lastPre=t;}
    }else{
      if(y[3]<wmin){wmin=y[3];tmin=t;}
      if(Math.abs(y[3]-1)>0.02){lastPost=t;}
    }
  }
  return {wc:wc,ws:ws,kp:kp,ki:ki,tf:tf,wp:ws/10,os:Math.max(0,peak-1)*100,
    tpeak:tpeak*1000,tr:(t90-t10)*1000,settle:lastPre*1000,dip:(1-wmin)*100,
    tdip:(tmin-loadAt)*1000,rec:(lastPost-loadAt)*1000};
};
function cascade() {
  if (!$('cascade-output')) { return; }
  var ids=['cs-j','cs-fc','cs-n','cs-tl'];
  var draw=function(){
    var j=val('cs-j'),fc=val('cs-fc'),n=val('cs-n'),tl=val('cs-tl'),r=cascadeSim(j,fc,n,tl);
    var h=table('串級響應',[
      ['電流迴路 ω_c',num6(r.wc)+' rad/s'],['速度迴路 ω_s',num6(r.ws)+' rad/s（'+num6(r.ws/(2*Math.PI))+' Hz）'],
      ['速度 K_p',num6(r.kp)+' N·m·s/rad'],['速度 K_i',num6(r.ki)+' N·m/rad'],['前置濾波 τ_f',num6(r.tf*1000)+' ms'],
      ['理想 ω_n、ζ',num6(r.ws/Math.SQRT2)+' rad/s、0.707107'],['超越量（模擬）',num6(r.os)+' %'],
      ['峰值時刻',num6(r.tpeak)+' ms'],['10–90 % 上升時間',num6(r.tr)+' ms'],['2 % 整定時間',num6(r.settle)+' ms'],
      ['負載最大掉速',num6(r.dip)+' %'],['掉速時刻',num6(r.tdip)+' ms'],['負載後回到 2 % 內',num6(r.rec)+' ms'],
      ['位置迴路 ω_p',num6(r.wp)+' rad/s（'+num6(r.wp/(2*Math.PI))+' Hz）'],['位置閉迴路時間常數',num6(1000/r.wp)+' ms']
    ]);
    h+='<table><caption>超越量對照表</caption>'+row(['N','超越量'],true);
    [1,2,5,10,20].forEach(function(x){h+=row([int0(x),num6(cascadeSim(j,fc,x,tl).os)+' %']);}); h+='</table>';
    h+='<p><strong>判讀：'+(n>=10?'分離足夠，內迴路可視為理想。':n>=5?'分離勉強，超越量開始偏離理想。':'分離不足，內迴路的落後滲進外迴路。')+'</strong></p>';
    h+='<p>穩態誤差 0：積分器把負載扛起來。位置迴路 ω_p = ω_s / 10 = '+num6(r.wp)+' rad/s，時間常數 '+num6(1000/r.wp)+' ms。</p>';
    h+='<p>為什麼：第三個內迴路極點越靠近速度迴路，外迴路越不能把它當成立即完成。</p>';
    if(r.dip>50){h+='<p>邊界：負載一加速度掉超過一半，速度迴路頻寬太低或慣量太小。</p>';}
    if(n===1){h+='<p>邊界：內外迴路同頻寬，這不是 PI 調錯，是結構錯。</p>';}
    if(tl===0){h+='<p>邊界：沒有負載擾動，掉速為 0。</p>';}
    put('cascade-output',h);
  };
  bind(ids,draw); draw();
}

function stepper() {
  if (!$('stepper-output')) { return; }
  var ids=['st-spr','st-m','st-f','st-v','st-l','st-i','st-tl'];
  var draw=function(){
    var spr=val('st-spr'),m=val('st-m'),f=val('st-f'),v=val('st-v'),lm=val('st-l'),i=val('st-i'),tl=val('st-tl');
    var full=360/spr,micro=full/m,mspr=spr*m,rps=f/mspr,n=rps*60,w=rps*2*Math.PI,fe=rps*spr/4,e=0.05*w;
    var corner=v*60/(spr*lm/1000*i+2*Math.PI*0.05),nmax=v/0.05*60/(2*Math.PI);
    var trise=e>=v?null:lm/1000*i/(v-e),tfull=m/f,frac=trise===null?0:Math.min(1,tfull/trise),avail=0.4*frac;
    var inc=0.4*sinD(90/m),errE=tl>=avail?90:Math.asin(tl/avail)*180/Math.PI,errM=errE*full/90,errU=errM/micro;
    var h='<p><strong>目前模式：N_spr = '+int0(spr)+'、m = '+int0(m)+'</strong></p>'+table('步進與微步',[
      ['全步步距角',num6(full)+'°'],['微步角',num6(micro)+'°'],['每圈微步數',int0(mspr)],
      ['轉速',num6(n)+' rpm（'+num6(w)+' rad/s）'],['電氣頻率',num6(fe)+' Hz'],['反電動勢',num6(e)+' V'],
      ['電流上升時間',trise===null?'不適用':num6(trise*1000)+' ms'],['全步週期',num6(tfull*1000)+' ms'],
      ['可用轉矩比例',num6(frac*100)+' %（T_avail = '+num6(avail)+' N·m）'],['轉折速度',num6(corner)+' rpm'],
      ['反電動勢 = V 的速度',num6(nmax)+' rpm'],['微步增量轉矩',num6(inc)+' N·m（'+num6(inc/0.4*100)+' %）'],
      ['負載造成的靜態誤差',num6(errE)+'°（電氣）= '+num6(errM)+'°（機械）= '+num6(errU)+' 個微步']
    ]);
    h+='<p><strong>判讀：'+(n<corner?'在轉折速度以下，電流每步都爬得到額定值，轉矩滿。':'已過轉折速度，可用轉矩只剩 '+num6(frac*100)+' %。')+'</strong></p>';
    if(tl>=avail){h+='<p>失步：負載超過可用轉矩，轉子跟不上脈衝，控制器完全不知道。</p>';}
    h+='<p>微步增量轉矩只有保持轉矩的 '+num6(inc/0.4*100)+' %：微步提高的是解析度，不是剛性。</p>';
    h+='<p>為什麼：高速時每步時間縮短，繞組電流來不及爬到命令值。</p>';
    if(errU>1){h+='<p>邊界：負載造成的偏移已超過 1 個微步，此時再提高細分沒有意義。</p>';}
    if(e>=v||n>nmax){h+='<p>邊界：反電動勢已等於電源電壓，電流推不進去，必然失步。</p>';}
    if(tl===0){h+='<p>邊界：無負載，靜態誤差為 0。</p>';}
    put('stepper-output',h);
  };
  bind(ids,draw); draw();
}

var bldcSector=function(theta){return Math.floor(((theta+30)%360)/60)+1;};
function bldc() {
  if (!$('bldc-output')) { return; }
  var ids=['bl-theta','bl-i','bl-offset','bl-kt'];
  var draw=function(){
    var th=val('bl-theta'),i=val('bl-i'),off=val('bl-offset'),kt=val('bl-kt'),th2=(th+off+360)%360;
    var sec=bldcSector(th2),d=BLDC_TABLE[sec-1],g=(d.stator-th+360)%360;if(g>180){g=360-g;}
    var tq=kt*i*sinD(g),ideal=kt*i,avg=3/Math.PI*cosD(off),tavg=avg*ideal;
    var upper=(sec*60-30-off+720)%360,next=upper;
    var h=table('六步換相',[
      ['霍爾碼',d.code],['扇區',int0(sec)],['通電相',d.phase],['定子磁場方向',int0(d.stator)+'°'],
      ['夾角 γ',num6(g)+'°'],['sin γ',num6(sinD(g))],['轉矩',num6(tq)+' N·m'],
      ['90° 時的轉矩',num6(ideal)+' N·m'],['六步平均係數',num6(avg)+'（平均 '+num6(tavg)+' N·m）'],
      ['下一次換相','θ 到 '+num6(next)+'°']
    ]);
    h+='<table><caption>鎖定換相表</caption>'+row(['扇區','範圍','霍爾碼','通電相','定子方向'],true);
    BLDC_TABLE.forEach(function(x,k){var cells=[int0(k+1),x.range,x.code,x.phase,int0(x.stator)+'°'];if(k+1===sec){cells[0]='<strong>'+cells[0]+'</strong>';}h+=row(cells);});h+='</table>';
    h+='<p><strong>判讀：霍爾碼 '+d.code+' → 扇區 '+int0(sec)+' → 通電 '+d.phase+'。</strong></p>';
    h+='<p>'+(g>=60&&g<=120?'γ 在六步窗內，轉矩是 90° 時的 '+num6(sinD(g)*100)+' %。':'霍爾偏移讓 γ 跑到窗外，轉矩掉到 '+num6(sinD(g)*100)+' %。')+'</p>';
    h+='<p>'+(off===0?'平均 95.493 %、最低 86.603 %。':'平均係數 (3 / π) × cos δ = '+num6(avg)+'。')+' 每步只變一個位元；若兩個位元同時變，就是接線錯。</p>';
    h+='<p>為什麼：霍爾碼只負責選出一組固定定子方向，轉矩仍由真實夾角決定。</p>';
    if(i===0){h+='<p>邊界：沒有電流沒有轉矩，霍爾碼仍會改變。</p>';}
    if(Math.abs(off)===30){h+='<p>邊界：偏移到窗邊，某些角度的轉矩只剩一半。</p>';}
    put('bldc-output',h);
  };
  bind(ids,draw); draw();
}

function vf() {
  if (!$('vf-output')) { return; }
  var ids=['vf-f','vf-boost','vf-tl','vf-rs'];
  var draw=function(){
    var f=val('vf-f'),boost=val('vf-boost'),tl=val('vf-tl'),rs=val('vf-rs');
    var v=f<=60?boost+(220-boost)*f/60:220,i=10*tl,e=v-i*rs;
    if(e<=0){put('vf-output','<p><strong>電壓不夠推電流，模型失效。</strong></p>');return;}
    var vf0=v/f,ef=e/f,phi=ef/(215/60),p2=phi*phi,ns=30*f,slip=54*tl/p2,n=Math.max(0,ns-slip),s=slip/ns,pull=2.5*p2;
    var h=table('V/f 純量控制',[
      ['端電壓',num6(v)+' V'],['V / f',num6(vf0)+' V/Hz'],['電流',num6(i)+' A'],['感應電勢',num6(e)+' V'],
      ['E / f',num6(ef)+' V/Hz'],['磁通比',num6(phi)+'（Φ² = '+num6(p2)+'）'],['同步速',num6(ns)+' rpm'],
      ['滑差轉速',num6(slip)+' rpm'],['實際轉速',num6(n)+' rpm'],['滑差',num6(s)+'（速度誤差 '+num6(s*100)+' %）'],
      ['拉出轉矩',num6(pull)+' 倍額定']
    ]);
    if(f>60){h+='<p><strong>判讀：弱磁區，電壓封頂，磁通 ∝ 1 / f，拉出轉矩只剩 '+num6(pull)+' 倍額定。</strong></p>';}
    else if(phi>=0.95&&phi<=1.05){h+='<p><strong>判讀：磁通維持在額定 ±5 % 內，V/f 目標達成。</strong></p>';}
    else if(phi<0.95){h+='<p><strong>判讀：磁通不足 '+num6((1-phi)*100)+' %，低頻壓降吃掉電壓。</strong></p>';}
    else if(phi>1.10){h+='<p><strong>判讀：過激磁，鐵心飽和，補償電壓太大。</strong></p>';}
    else{h+='<p><strong>判讀：磁通略高於額定，應檢查補償設定。</strong></p>';}
    if(tl>pull){h+='<p>負載超過拉出轉矩，馬達失速。</p>';}
    h+='<p>開迴路：滑差轉速 '+num6(slip)+' rpm 沒人補，速度誤差 '+num6(s*100)+' %。</p>';
    h+='<p>為什麼：真正維持磁通的是扣除定子電阻壓降後的 E / f。</p>';
    if(s>0.2){h+='<p>邊界：滑差已超出線性區，數字只剩示意。</p>';}
    if(tl===0){h+='<p>邊界：無負載，轉速等於同步速。</p>';}
    if(f===1){h+='<p>邊界：極低頻誤差 '+num6(s*100)+' %，純量控制沒有實用精度。</p>';}
    put('vf-output',h);
  };
  bind(ids,draw); draw();
}

var cpCalc=function(im,theta,phi,delta){
  var ia=im*cosD(theta+phi),ib=im*cosD(theta+phi-120),ic=im*cosD(theta+phi-240);
  var al=2/3*(ia-ib/2-ic/2),be=(ib-ic)/Math.sqrt(3),hat=theta+delta;
  var id=al*cosD(hat)+be*sinD(hat),iq=-al*sinD(hat)+be*cosD(hat);
  return {ia:ia,ib:ib,ic:ic,al:al,be:be,id:id,iq:iq,mag:Math.sqrt(al*al+be*be),t:0.6*iq};
};
function clarkepark() {
  if (!$('clarkepark-output')) { return; }
  var ids=['cp-im','cp-theta','cp-phi','cp-delta'];
  var draw=function(){
    var im=val('cp-im'),th=val('cp-theta'),phi=val('cp-phi'),delta=val('cp-delta'),r=cpCalc(im,th,phi,delta);
    var loss=(1-cosD(delta))*100;
    var h=table('Clarke–Park 結果',[
      ['i_a',num6(r.ia)+' A'],['i_b',num6(r.ib)+' A'],['i_c',num6(r.ic)+' A'],['i_α',num6(r.al)+' A'],
      ['i_β',num6(r.be)+' A'],['向量長度',num6(r.mag)+' A'],['i_d',num6(r.id)+' A'],['i_q',num6(r.iq)+' A'],['轉矩',num6(r.t)+' N·m']
    ]);
    h+='<table><caption>θ 取樣表</caption>'+row(['θ','i_a','i_b','i_c','i_d','i_q'],true);
    [0,60,120,180,240,300].forEach(function(x){var q=cpCalc(im,x,phi,delta);h+=row([int0(x)+'°',num6(q.ia),num6(q.ib),num6(q.ic),num6(q.id),num6(q.iq)]);});h+='</table>';
    h+='<p>三相與 αβ 隨 θ 變，i_d、i_q 不隨 θ 變：這就是把交流變直流。</p>';
    if(im===0){h+='<p><strong>判讀：沒有電流，任何座標都是 0。</strong></p>';}
    else if(Math.abs(r.id)<0.001*im){h+='<p><strong>判讀：i_d = 0，全部電流都在產生轉矩。</strong></p>';}
    else if(r.id>0){h+='<p><strong>判讀：正的 i_d 在加強永磁磁場，白白發熱。</strong></p>';}
    else{h+='<p><strong>判讀：負的 i_d 在削弱磁場，這是弱磁。</strong></p>';}
    if(delta!==0){h+='<p>角度錯 δ：i_q 少了 '+num6(loss)+' %，還多出假的 i_d = '+num6(r.id)+' A。</p>';}
    h+='<p>向量長度 '+num6(r.mag)+' A 不變；為什麼：轉換只改座標，不改電流向量本身。</p>';
    if(phi===0||phi===180){h+='<p>邊界：轉矩為 0，電流與磁場平行。</p>';}
    if(phi<0){h+='<p>邊界：負轉矩，代表再生煞車或反轉。</p>';}
    put('clarkepark-output',h);
  };
  bind(ids,draw); draw();
}

var baseSpeed=function(id,iq,vdc){
  var a=Math.pow(0.002*iq,2)+Math.pow(0.002*id+0.1,2);
  var b=2*(-0.5*id*0.002*iq+0.5*iq*(0.002*id+0.1));
  var c=0.25*(id*id+iq*iq)-vdc*vdc/3,disc=b*b-4*a*c;
  if(a===0||disc<0){return null;} return (-b+Math.sqrt(disc))/(2*a)/4*60/(2*Math.PI);
};
function focvolt() {
  if (!$('focvolt-output')) { return; }
  var ids=['fv-n','fv-iq','fv-id','fv-vdc'];
  var draw=function(){
    var n=val('fv-n'),iq=val('fv-iq'),id=val('fv-id'),vdc=val('fv-vdc'),wm=n*2*Math.PI/60,we=4*wm;
    var emf=we*0.1,xq=we*0.002*iq,xd=we*0.002*id,vd=0.5*id-xq,vq=0.5*iq+we*(0.002*id+0.1);
    var vm=Math.sqrt(vd*vd+vq*vq),vmax=vdc/Math.sqrt(3),use=vm/vmax*100,tq=0.6*iq,pm=tq*wm;
    var pcu=0.75*(id*id+iq*iq),im=Math.sqrt(id*id+iq*iq),base=baseSpeed(id,iq,vdc),flux=0.002*id+0.1;
    var h=table('dq 電壓與弱磁',[
      ['ω_m',num6(wm)+' rad/s'],['ω_e',num6(we)+' rad/s（'+num6(we/(2*Math.PI))+' Hz）'],['反電動勢',num6(emf)+' V'],
      ['交叉項 ω_e L i_q',num6(xq)+' V'],['v_d',num6(vd)+' V'],['v_q',num6(vq)+' V'],['電壓向量長度',num6(vm)+' V'],
      ['上限 V_dc / √3',num6(vmax)+' V（已用 '+num6(use)+' %）'],['轉矩',num6(tq)+' N·m'],['機械功率',num6(pm)+' W'],
      ['銅損',num6(pcu)+' W'],['電流向量長度',num6(im)+' A（上限 20）'],['基速',base===null?'不適用':num6(base)+' rpm']
    ]);
    h+='<p><strong>判讀：'+(use<=90?'電壓在線性區內有餘裕。':use<=100?'接近電壓上限，再快就飽和。':'電壓飽和，i_q 追不到命令；出路是弱磁或降速。')+'</strong></p>';
    if(id<0){h+='<p>弱磁生效：磁鏈從 0.100000 降到 '+num6(flux)+' Wb，基速推到 '+(base===null?'不適用':num6(base)+' rpm')+'，代價是銅損增加 '+num6(0.75*id*id)+' W。</p>';}
    if(im>20){h+='<p>邊界：超過電流極限 20 A，i_d 與 i_q 必須取捨。</p>';}
    h+='<p>交叉項 ω_e L i_q = '+num6(xq)+' V 是 d 軸耦合，控制器要用前饋補回。為什麼：旋轉座標的磁鏈會產生與速度成正比的電壓。</p>';
    if(n===0){h+='<p>邊界：零速時 v_q 只剩 R i_q = '+num6(0.5*iq)+' V，轉矩仍與 i_q 成正比。</p>';}
    if(vdc===48){h+='<p>邊界：48 V 直流鏈的基速只有 '+(base===null?'不適用':num6(base))+' rpm。</p>';}
    put('focvolt-output',h);
  };
  bind(ids,draw); draw();
}

var svTimes=function(vref,alpha,vdc,fs){
  var ts=1000/fs,vmax=vdc/Math.sqrt(3),m=vref/vmax,k=Math.floor(alpha/60)+1,th=alpha-(k-1)*60;
  var gain=Math.sqrt(3)*ts*vref/vdc,t1=gain*sinD(60-th),t2=gain*sinD(th),t0=ts-t1-t2,z=t0/2;
  var map=SV_TABLE[k-1],get=function(key){return key==='sum'?t1+t2+z:key==='t1'?t1+z:key==='t2'?t2+z:z;};
  var ta=get(map[0]),tb=get(map[1]),tc=get(map[2]),da=ta/ts,db=tb/ts,dc=tc/ts,mean=(da+db+dc)*vdc/3;
  return {ts:ts,vmax:vmax,m:m,k:k,th:th,t1:t1,t2:t2,t0:t0,da:da,db:db,dc:dc,
    va:da*vdc-mean,vb:db*vdc-mean,vc:dc*vdc-mean};
};
function svpwm() {
  if (!$('svpwm-output')) { return; }
  var ids=['sv-vref','sv-alpha','sv-vdc','sv-fsw'];
  var draw=function(){
    var vr=val('sv-vref'),a=val('sv-alpha'),vdc=val('sv-vdc'),fs=val('sv-fsw'),r=svTimes(vr,a,vdc,fs);
    var v1=SV_VEC[r.k-1],v2=SV_VEC[r.k%6],expect=vr*cosD(a);
    var h=table('SVPWM 作用時間',[
      ['上限 V_dc / √3',num6(r.vmax)+' V'],['調變指數 m',num6(r.m)],['扇區',int0(r.k)+'（V_1 = '+v1+'、V_2 = '+v2+'）'],
      ['扇區內角 θ',num6(r.th)+'°'],['T_1',num6(r.t1)+' µs'],['T_2',num6(r.t2)+' µs'],['T_0',num6(r.t0)+' µs'],
      ['d_a',num6(r.da)],['d_b',num6(r.db)],['d_c',num6(r.dc)],['v_a（驗證）',num6(r.va)+' V'],
      ['v_b（驗證）',num6(r.vb)+' V'],['v_c（驗證）',num6(r.vc)+' V'],['SVPWM 比 SPWM 多','15.470054 %']
    ]);
    h+='<p>本扇區的兩個向量與開關碼：'+v1+'、'+v2+'；扇區 '+int0(r.k)+'，θ = '+num6(r.th)+'°。</p>';
    h+='<p><strong>判讀：'+(r.m<=1?'線性區，T_0 = '+num6(r.t0)+' µs ≥ 0，工作週期可實現。':'過調變，T_0 = '+num6(r.t0)+' µs < 0，工作週期不可實現。')+'</strong></p>';
    h+='<p>驗證：三相平均電壓 v_a = '+num6(r.va)+' V 等於 V_ref cos α = '+num6(expect)+' V，伏秒平衡成立。</p>';
    h+='<p>為什麼：兩個相鄰基本向量的作用時間加權平均，正好重建參考向量。</p>';
    if(r.t0/2<1&&r.m<=1){h+='<p>邊界：半段零向量只剩 '+num6(r.t0/2)+' µs，已在線性區邊緣。</p>';}
    if(vr===0){h+='<p>邊界：零向量佔滿，三相都是 50 %，馬達看到 0 V。</p>';}
    if(r.th===0){h+='<p>邊界：剛好在扇區邊界，T_2 = 0，只用一個非零向量。</p>';}
    put('svpwm-output',h);
  };
  bind(ids,draw); draw();
}

function encoder() {
  if (!$('encoder-output')) { return; }
  var ids=['en-n','en-ts','en-rpm','en-fclk'];
  var draw=function(){
    var nline=val('en-n'),tsm=val('en-ts'),rpm=val('en-rpm'),mhz=val('en-fclk'),cpr=4*nline,ts=tsm/1000;
    var res=360/cpr,counts=cpr*rpm/60*ts,mstep=60/(cpr*ts),mrel=100/counts,tedge=60/(cpr*rpm);
    var ticks=mhz*1e6*tedge,trel=100/ticks,cross=60*Math.sqrt(mhz*1e6/ts)/cpr,chatter=Math.PI*2*Math.PI/(cpr*ts);
    var low=rpm<cross;
    var h='<p><strong>目前模式：N = '+int0(nline)+' 線</strong></p>'+table('編碼器速度估測',[
      ['計數/圈',int0(cpr)],['角度解析度',num6(res)+'°'],['T_s 內計數',num6(counts)],['M 法量化步距',num6(mstep)+' rpm'],
      ['M 法相對誤差',num6(mrel)+' %'],['邊緣間隔',num6(tedge*1e6)+' µs'],['T 法 tick 數',num6(ticks)],
      ['T 法相對誤差',num6(trel)+' %'],['交叉速度',num6(cross)+' rpm'],['建議',low?'T 法':'M 法'],
      ['轉矩抖動',num6(chatter)+' N·m']
    ]);
    h+='<p><strong>判讀：'+(low?'低於交叉速度，T 法誤差 '+num6(trel)+' % 比 M 法 '+num6(mrel)+' % 小。':'高於交叉速度，M 法誤差 '+num6(mrel)+' % 比 T 法 '+num6(trel)+' % 小。')+'</strong></p>';
    if(counts<1){h+='<p>邊界：取樣週期內平均不到 1 個脈衝，M 法會在 0 與 1 間交替。</p>';}
    h+='<p>1 個計數的量化經速度迴路 K_p = 3.141593 變成 '+num6(chatter)+' N·m 的轉矩命令跳動。</p>';
    h+='<p>為什麼：M 法量固定時間裡有幾格，T 法量相鄰兩格隔多久。</p>';
    if(chatter>1){h+='<p>邊界：抖動超過 1 N·m，要加濾波或觀測器，代價是延遲。</p>';}
    if(tsm>=5){h+='<p>邊界：取樣週期 '+num6(tsm)+' ms 已接近速度迴路時間尺度。</p>';}
    if(rpm===1){h+='<p>邊界：極低速時 M 法幾乎總是讀到 0。</p>';}
    if(nline===100){h+='<p>邊界：線數太少，M 法在實用低速下不夠細。</p>';}
    put('encoder-output',h);
  };
  bind(ids,draw); draw();
}

function regen() {
  if (!$('regen-output')) { return; }
  var ids=['rg-j','rg-n1','rg-n2','rg-t','rg-c','rg-vdc','rg-vtrip','rg-eta','rg-rb'];
  var draw=function(){
    var j=val('rg-j'),n1=val('rg-n1'),n2=val('rg-n2'),tm=val('rg-t'),cu=val('rg-c'),vdc=val('rg-vdc');
    var vt=val('rg-vtrip'),eta=val('rg-eta'),rb=val('rg-rb'),w1=n1*2*Math.PI/60,w2=n2*2*Math.PI/60;
    var ek=0.5*j*(w1*w1-w2*w2),pavg=ek/tm,tb=j*Math.abs(w1-w2)/tm,eb=eta*ek,wh=eb/3600;
    var ppeak=eta*tb*Math.max(w1,w2),c=cu/1e6,ecap=vt<=vdc?0:0.5*c*(vt*vt-vdc*vdc);
    var cap=eb>0?ecap/eb*100:null,vfree=eb>0?Math.sqrt(vdc*vdc+2*eb/c):vdc,ttrip=ppeak>0?ecap/ppeak:null,pr=vt*vt/rb;
    var h=table('再生能量',[
      ['ω_1',num6(w1)+' rad/s'],['動能',num6(ek)+' J'],['平均再生功率',num6(pavg)+' W'],['煞車轉矩',num6(tb)+' N·m'],
      ['回直流鏈的能量',num6(eb)+' J（'+num6(wh)+' Wh）'],['峰值再生功率',num6(ppeak)+' W'],
      ['電容能吸',num6(ecap)+' J（'+(cap===null?'不適用':num6(cap)+' %')+'）'],
      ['到跳脫的時間',ttrip===null?'不適用':num6(ttrip*1000)+' ms'],['沒有斬波器的終電壓',num6(vfree)+' V'],
      ['電阻在跳脫電壓的功率',num6(pr)+' W']
    ]);
    h+='<p><strong>判讀：'+(ek>0?'減速，'+num6(ek)+' J 動能有 '+num6(eb)+' J 回到直流鏈。':ek<0?'加速，能量從直流鏈流向馬達，這一段不是再生。':'等速，沒有能量交換。')+'</strong></p>';
    if(ek>0&&eb>ecap){h+='<p>電容只吃得下 '+num6(cap)+' %，'+num6(ttrip*1000)+' ms 後到跳脫值；沒有斬波器時會衝到 '+num6(vfree)+' V。</p>';}
    else if(eb>0){h+='<p>電容吃得下全部，不會到跳脫值。</p>';}
    h+='<p>'+(pr>=ppeak?'電阻 '+num6(pr)+' W ≥ 峰值 '+num6(ppeak)+' W，斬波器撐得住。':'電阻功率不足，需要更小的 R_b 或更長煞車時間。')+'</p>';
    h+='<p>若直流鏈是電池，這 '+num6(wh)+' Wh 可以真正回收。為什麼：電容只能接住電壓上升那一小段能量。</p>';
    if(n1===n2){h+='<p>邊界：起終速度相同，沒有動能交換。</p>';}
    if(vt<=vdc){h+='<p>邊界：跳脫電壓不高於直流鏈電壓，斬波器會一直導通。</p>';}
    put('regen-output',h);
  };
  bind(ids,draw); draw();
}

/* ---------- 4. 字典 ---------- */
function dictionary() {
  if (!$('term-search')) { return; }
  var draw=function(){
    var q=pick('term-search').toLowerCase().trim(),cards=document.getElementsByClassName('term-card');
    var shown=0,i,c,hay;
    for(i=0;i<cards.length;i+=1){c=cards[i];hay=((c.getAttribute('data-search')||'')+' '+((c.querySelector&&c.querySelector('h2'))?c.querySelector('h2').textContent:'')).toLowerCase();
      if(q===''||hay.indexOf(q)!==-1){c.removeAttribute('hidden');shown+=1;}else{c.setAttribute('hidden','hidden');}}
    put('term-count','顯示 '+int0(shown)+' / 50 張');
  };
  bind(['term-search'],draw);draw();
}

/* ---------- 5. 自我檢核 ---------- */
function selfcheck() {
  if (!$('quiz-reset')) { return; }
  var answered={},correct={};
  var progress=function(){var a=0,c=0,k;for(k in answered){if(answered.hasOwnProperty(k)&&answered[k]){a+=1;if(correct[k]){c+=1;}}}put('quiz-progress','已作答 '+int0(a)+' / 36 題，答對 '+int0(c)+' 題');};
  var link=function(id){var ch=id.slice(1,3),x=QUIZ_CH[ch];return x?'<p>回去看：<a href="'+x[0]+'">'+x[1]+'</a></p>':'';};
  var check=function(q){return function(){
    var n=$(q.id),raw=n?String(n.value):'';
    if(raw===''){put(q.id+'-output','<p>請先輸入數字或選擇答案。</p>');answered[q.id]=false;correct[q.id]=false;progress();return;}
    var ok=false,v;
    if(q.t==='num'){v=Number(raw);if(!isFinite(v)){put(q.id+'-output','<p>請先輸入數字。</p>');answered[q.id]=false;correct[q.id]=false;progress();return;}ok=Math.abs(v-q.ans)<=q.tol;}
    else{ok=raw===q.ans;}
    answered[q.id]=true;correct[q.id]=ok;
    var right=q.t==='num'?num6(q.ans):'選項 '+q.ans;
    put(q.id+'-output','<p><strong>'+(ok?'正確':'不正確')+'</strong>：'+q.why+' 正確值是 '+right+'。</p>'+link(q.id));progress();
  };};
  var i,q,b;
  for(i=0;i<QUIZ.length;i+=1){q=QUIZ[i];b=$(q.id+'-check');if(b){b.addEventListener('click',check(q));}}
  $('quiz-reset').addEventListener('click',function(){var j,n;for(j=0;j<QUIZ.length;j+=1){n=$(QUIZ[j].id);if(n){n.value='';}put(QUIZ[j].id+'-output','');answered[QUIZ[j].id]=false;correct[QUIZ[j].id]=false;}progress();});
  progress();
}

/* ---------- 6. 註冊 ---------- */
if (typeof document !== 'undefined') {
  [torqueangle,hbridge,currentloop,cascade,stepper,bldc,vf,clarkepark,focvolt,svpwm,encoder,regen,dictionary,selfcheck].forEach(function(f){f();});
}

/* ---------- 7. Node 驗算介面 ---------- */
if (typeof module !== 'undefined') {
  module.exports={num6:num6,int0:int0,cascadeSim:cascadeSim,baseSpeed:baseSpeed,svTimes:svTimes,cpCalc:cpCalc,
    BLDC_TABLE:BLDC_TABLE,SV_VEC:SV_VEC,SV_TABLE:SV_TABLE,QUIZ:QUIZ};
}

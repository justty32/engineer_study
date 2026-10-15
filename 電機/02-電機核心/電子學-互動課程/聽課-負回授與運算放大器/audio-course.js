(() => {
'use strict';
const $=id=>document.getElementById(id);
const txt=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
const line=(a,b,c,d,cls='axis')=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="${cls}"/>`;
const arrow=(a,b,c,d,cls='amber')=>{const q=Math.atan2(d-b,c-a);return line(a,b,c,d,cls)+`<path d="M${c-11*Math.cos(q-.5)} ${d-11*Math.sin(q-.5)}L${c} ${d}L${c-11*Math.cos(q+.5)} ${d-11*Math.sin(q+.5)}" class="${cls}"/>`;};
const svg=(id,title,body,h=440)=>`<svg viewBox="0 0 760 ${h}" role="img" aria-labelledby="${id}-title"><title id="${id}-title">${title}</title>${body}</svg>`;
const take=(label,value)=>`<div class="takeaway"><span>${label}</span><strong>${value}</strong></div>`;
const note=s=>`<p class="model-note">${s}</p>`;
const formula=s=>`<p class="formula-main">${s}</p>`;
const path=(fn,n=250)=>Array.from({length:n+1},(_,i)=>{const p=fn(i/n);return`${i?'L':'M'}${p[0].toFixed(3)} ${p[1].toFixed(3)}`;}).join(' ');
const curve=(d,cls='curve')=>`<path d="${d}" class="${cls}"/>`;
const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="6" class="work-point"/>`;
const A0=100000,fp=10,beta=.1,SR=.5;
const closed=(ng=10)=>({gain:A0/(1+A0/ng),bw:fp*(1+A0/ng),beta:1/ng});
const mag=(f,p2)=>A0*beta/Math.hypot(1,f/fp)/Math.hypot(1,f/p2);
function stability(p2){let lo=0,hi=1e8;for(let i=0;i<80;i++){const f=(lo+hi)/2;if(mag(f,p2)>1)lo=f;else hi=f;}const fu=(lo+hi)/2,phase=-(Math.atan(fu/fp)+Math.atan(fu/p2))*180/Math.PI;return{fu,phase,pm:180+phase};}
const demand=(f,v)=>2*Math.PI*f*v/1e6;
const gainData=a=>({a,af:a/(1+.1*a),error:1/(1+.1*a)});
const railData=v=>{const candidate=10*v,vo=Math.max(-10,Math.min(10,candidate));return{candidate,vo,minus:.1*vo,error:v-.1*vo};};
function loopDiagram(id,phase=false){
 let b=arrow(35,135,170,135)+`<circle cx="195" cy="135" r="25" class="blue"/>`+txt(181,135,'+')+txt(186,154,'−')+arrow(220,135,325,135)+`<rect x="325" y="98" width="145" height="74" rx="8" class="blue"/>`+txt(397,141,phase?'A(f)':'A = 1000','','middle')+arrow(470,135,700,135)+line(605,135,605,300,'wire')+arrow(605,300,470,300)+`<rect x="325" y="266" width="145" height="68" rx="8" class="blue"/>`+txt(397,309,'βf = 0.1','','middle')+line(325,300,195,300,'wire')+arrow(195,300,195,160);
 b+=txt(50,105,'輸入 x')+txt(265,100,'誤差 e','','middle')+txt(645,105,'輸出 y','','middle')+txt(100,340,'回傳 βf y','tiny-text')+txt(380,32,'電源 → 放大器 → 負載能量','amber-fill','middle')+arrow(397,45,397,94,'blue')+txt(380,385,'e = x − βf y；y = A e','mint-fill','middle');
 if(phase)b+=txt(380,430,'從 e 擾動繞經 A 與 βf 返回','tiny-text','middle')+txt(380,470,'A 的相位落後約 180° → 再相減可同向','amber-fill','middle')+txt(380,510,'還需大小條件：L 接近 −1','tiny-text','middle');
 else b+=txt(380,430,'訊號箭頭 ≠ 能量流向','tiny-text','middle');
 return svg(id,phase?'負端減號另計；迴路傳輸相位若接近負180度，回傳再相減可能同向，仍須檢查大小':'輸入減回傳得到誤差，經放大輸出，再取十分之一回傳；能量由電源供應',b,phase?540:460);
}
function algebra(){const scale=450/.1,x=150;let b=txt(35,40,'y = A(x − βf y)')+txt(35,82,'(1 + Aβf)y = Ax')+txt(35,124,'Af = A/(1 + Aβf) = 1000/101');
 const bar=(y,w,label,color)=>`<rect x="${x}" y="${y}" width="${w}" height="23" class="${color}" opacity=".8"/>`+txt(35,y+19,label,'tiny-text');
 b+=bar(170,.1*scale,'輸入 x','mint-fill')+txt(620,190,'0.1 V','tiny-text')+bar(227,.09900990099*scale,'回傳','blue-fill')+txt(620,247,'0.09901 V','tiny-text')+bar(305,.0009900990099*scale*100,'差額 e','amber-fill')+txt(150,370,'差額條另放大 100 倍；其餘同尺度','amber-fill')+txt(150,410,'e = 0.000990099 V ≈ 0.9901 mV','tiny-text');
 return svg('ef-algebra-svg','聯立式與電壓條形；輸入和回傳同尺度，誤差條放大100倍',b,440);}
function gainPlot(a=1000){const x=v=>90+580*(Math.log10(v)-2)/2,y=v=>310-(v-8.8)/1.3*230;
 let b=txt(45,35,'Af（V/V）');[9,9.5,10].forEach(v=>b+=line(90,y(v),670,y(v),'grid')+txt(70,y(v)+7,String(v),'tiny-text','end'));[100,1000,10000].forEach(v=>b+=line(x(v),70,x(v),310,'grid')+txt(x(v),348,String(v),'tiny-text','middle'));
 b+=curve(path(t=>{const q=100*100**t;return[x(q),y(gainData(q).af)];}))+line(90,y(10),670,y(10),'reference')+dot(x(a),y(gainData(a).af))+txt(660,62,'目標 10','blue-fill','end')+txt(380,394,'A：對數尺度；βf 固定 0.1','tiny-text','middle');return svg('ef-gain-svg','開迴路增益提高，閉迴路由九點零九接近十倍而不超過',b,430);}
function opamp(inverting=false){
 let b=`<path d="M310 95L490 205L310 315Z M490 205H690 M560 205V375H455 M370 375H245V260H310 M390 145V65 M390 265V318" class="wire"/><rect x="370" y="361" width="85" height="28" class="blue"/>`+txt(329,168,'+')+txt(329,270,'−')+txt(600,185,'vo')+txt(402,77,'+12 V','tiny-text')+txt(402,322,'−12 V','tiny-text')+txt(380,423,'Rf = 9 kΩ','tiny-text')+dot(245,260)+txt(255,238,'v−','tiny-text')+txt(402,217,'A','big-text');
 if(inverting){b+=`<path d="M25 260H95 M160 260H245 M310 160H225V90H180" class="wire"/><rect x="95" y="246" width="65" height="28" class="blue"/>`+txt(30,226,'vin','tiny-text')+txt(80,306,'Rin = 1 kΩ','tiny-text')+txt(40,95,'參考 0 V','tiny-text')+arrow(175,260,225,260)+arrow(290,375,345,375)+txt(380,470,'理想 vin = 0.1 V → vo = −0.9 V','mint-fill','middle')+txt(380,510,'iRin = iRf = 0.1 mA；i− = 0','tiny-text','middle');}
 else{b+=`<path d="M35 160H310 M245 260H150V300 M150 355V450H170" class="wire"/><rect x="137" y="300" width="26" height="55" class="blue"/>`+txt(35,130,'vin → +','tiny-text')+txt(120,338,'Rg = 1 kΩ','tiny-text','end')+txt(35,458,'參考 0 V','tiny-text')+txt(380,492,'βf = 1k/(9k + 1k) = 0.1','mint-fill','middle')+txt(380,532,'理想 10；A = 1000 時 9.900990','tiny-text','middle');}
 return svg(inverting?'ef-inverting-svg':'ef-noninverting-svg',inverting?'反相運放：正端接參考，輸入經1千歐姆到負端，輸出經9千歐姆回負端，理想輸出負九倍':'非反相運放：輸入接正端，輸出經9千歐姆回負端，負端經1千歐姆接共同參考，供電正負12伏特',b,inverting?545:565);
}
function railPlot(v=.5){const x=n=>380+n*175,y=n=>225-n*13,r=railData(v);let b=txt(40,35,'vo（V）');[-10,0,10].forEach(q=>b+=line(100,y(q),660,y(q),'grid')+txt(80,y(q)+7,String(q),'tiny-text','end'));[-1.5,-1,0,1,1.5].forEach(q=>b+=txt(x(q),403,String(q),'tiny-text','middle'));b+=line(100,y(0),660,y(0),'axis')+line(x(0),60,x(0),370,'axis')+curve(path(t=>{const q=-1.5+3*t;return[x(q),y(railData(q).vo)];}))+dot(x(v),y(r.vo))+txt(380,445,'vin（V）；準靜態轉移，不是時間波形','tiny-text','middle')+txt(380,485,'供電 ±12 V；示範輸出限制 ±10 V','amber-fill','middle');return svg('ef-rails-svg','十倍非反相轉移在正負10伏特限幅，橫軸為輸入電壓',b,515);}
function bodeSingle(id,ng=10,open=true,half=false){const q=closed(ng),x=f=>90+580*Math.log10(f)/7,y=d=>330-(d+40)/150*250;let b=txt(45,35,'電壓增益（dB）');[-40,0,20,60,100].forEach(d=>b+=line(90,y(d),670,y(d),'grid')+txt(75,y(d)+7,String(d),'tiny-text','end'));[1,100,10000,1e6,1e7].forEach(f=>b+=line(x(f),70,x(f),330,'grid')+txt(x(f),365,f===1?'1':f===100?'100':f===1e4?'10k':f===1e6?'1M':'10M','tiny-text','middle'));
 if(open)b+=curve(path(t=>{const f=10**(7*t);return[x(f),y(20*Math.log10(A0/Math.hypot(1,f/fp)))];}),'blue')+dot(x(10),y(20*Math.log10(A0/Math.sqrt(2))))+txt(90,435,'藍：開迴路，A0 = 100000，fp = 10 Hz','tiny-text');
 b+=curve(path(t=>{const f=10**(7*t);return[x(f),y(20*Math.log10(q.gain/Math.hypot(1,f/q.bw)))];}))+txt(90,470,`綠：閉迴路，Af0 = ${q.gain.toFixed(6)}`,'tiny-text')+txt(380,400,'f（Hz，對數）','tiny-text','middle');
 if(half){const base=20*Math.log10(q.gain),cut=base-10*Math.log10(2);b+=line(90,y(base),670,y(base),'reference')+line(90,y(cut),670,y(cut),'envelope')+line(x(q.bw),75,x(q.bw),330,'reference')+dot(x(q.bw),y(cut))+txt(120,510,`低頻 ${base.toFixed(3)} dB → ${cut.toFixed(3)} dB`,'amber-fill')+txt(120,550,`相對 −3.0103 dB；fcl = ${q.bw.toFixed(0)} Hz`,'tiny-text');}
 return svg(id,'單主極點開閉迴路電壓增益對數頻率圖；閉迴路負三分貝以自身低頻值為基準',b,half?580:505);}
function bodeLoop(id,p2=1e5){const r=stability(p2),x=f=>95+580*Math.log10(f)/7,ym=d=>290-(d+100)/180*220,yp=d=>385-d/180*180;let b=txt(40,32,'20 log₁₀ |L|（dB）');[-100,-40,0,40,80].forEach(d=>b+=line(95,ym(d),675,ym(d),'grid')+txt(78,ym(d)+7,String(d),'tiny-text','end'));[0,-90,-180].forEach(d=>b+=line(95,yp(d),675,yp(d),'grid')+txt(78,yp(d)+7,String(d),'tiny-text','end'));[1,100,1e4,1e6,1e7].forEach(f=>b+=line(x(f),65,x(f),565,'grid')+txt(x(f),606,f===1?'1':f===100?'100':f===1e4?'10k':f===1e6?'1M':'10M','tiny-text','middle'));
 b+=curve(path(t=>{const f=10**(7*t);return[x(f),ym(20*Math.log10(mag(f,p2)))];}))+curve(path(t=>{const f=10**(7*t);return[x(f),yp(-(Math.atan(f/fp)+Math.atan(f/p2))*180/Math.PI)];}),'blue')+line(95,ym(0),675,ym(0),'reference')+line(x(r.fu),65,x(r.fu),565,'envelope')+dot(x(r.fu),ym(0))+dot(x(r.fu),yp(r.phase))+line(x(r.fu)+18,yp(r.phase),x(r.fu)+18,yp(-180),'amber')+txt(95,344,`fu = ${(r.fu/1000).toFixed(3)} kHz；相位 ${r.phase.toFixed(3)}°`,'tiny-text')+txt(95,375,'迴路相位（°）','tiny-text')+txt(350,650,`PM = ${r.pm.toFixed(3)}°；f（Hz，對數）`,'amber-fill','middle');
 return svg(id,`兩極迴路幅相圖：第二極點${p2}赫茲，一倍交越${r.fu.toFixed(3)}赫茲，相位裕度${r.pm.toFixed(3)}度`,b,680);}
function sinePlot(id,f=10000,v=2){const T=1e6/f,x=t=>95+580*t,y=q=>205-q/v*105;let b=txt(35,35,'目標 vo（V）')+line(95,205,675,205,'axis')+line(95,85,95,325,'axis');[-v,0,v].forEach(q=>b+=txt(78,y(q)+7,q.toFixed(1),'tiny-text','end'));[0,.25,.5,.75,1].forEach(q=>b+=txt(x(q),354,(T*q).toFixed(1),'tiny-text','middle'));
 b+=curve(path(t=>[x(t),y(v*Math.sin(2*Math.PI*t))]))+line(x(0),y(0),x(.1),y(v*2*Math.PI*.1),'amber')+line(x(.5-.08),y(v*2*Math.PI*.08),x(.5+.08),y(-v*2*Math.PI*.08),'amber')+line(x(.25-.09),y(v),x(.25+.09),y(v),'blue')+line(x(.75-.09),y(-v),x(.75+.09),y(-v),'blue')+dot(x(0),y(0))+dot(x(.5),y(0))+txt(380,400,'t（μs）；只畫目標，未模擬失真輸出','tiny-text','middle')+txt(380,442,'橘：零交越最大斜率；藍：峰谷斜率 0','tiny-text','middle')+txt(380,484,`Vpk ${v.toFixed(1)} V；f ${(f/1000).toFixed(0)} kHz`,'tiny-text','middle');return svg(id,'目標正弦波在零交越處斜率最大、波峰波谷斜率為零；橫軸微秒',b,515);}
function slopeBars(id,need){const x=160,w=420/1.4;return svg(id,`最大斜率需求${need.toFixed(6)}伏特每微秒，與固定上限0.5比較`,txt(35,35,'最大斜率（V/μs）')+txt(35,101,'需求','tiny-text')+`<rect x="${x}" y="77" width="${need*w}" height="30" class="mint-fill"/>`+txt(x,143,need.toFixed(6),'tiny-text')+txt(35,206,'SR 上限','tiny-text')+`<rect x="${x}" y="182" width="${SR*w}" height="30" class="amber-fill"/>`+txt(x,248,'0.500000','tiny-text')+line(x+SR*w,55,x+SR*w,225,'reference')+txt(380,290,'兩條同尺度；虛線為 SR 上限','tiny-text','middle'),320);}
const controls=(id,label,min,max,step,value,presets)=>`<div class="phase-controls"><label for="${id}">${label} <output id="${id}-value"></output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><div class="preset-controls">${presets.map(([v,t])=>`<button type="button" data-control="${id}" data-value="${v}">${t}</button>`).join('')}</div><p id="${id}-result" role="status" aria-live="polite"></p></div>`;
const dynamic=(id,body)=>`<div id="${id}">${body}</div>`;
const takeDynamic=(id)=>`<div id="${id}" class="dynamic-values"></div>`;
const figures=[
{id:'ef-loop',short:'01 回授路徑',title:'圖一｜輸入、誤差與回傳',subtitle:'低頻、線性、穩定；A 為正實數。βf 專指回授比例。',look:'圖一：沿 x → e → A → y → βf 走一圈；訊號箭頭不是能量流，電源另外供能。',diagram:loopDiagram('ef-loop-svg'),extra:formula('e = x − βf y；y = Ae；βf = 0.1')+note('輸出提高 → 回傳提高 → 差額縮小。高頻是否仍能抵消，必須再看相位。'),takeaways:take('開迴路 A','輸出／誤差')+take('閉迴路 Af','輸出／外部輸入')},
{id:'ef-algebra',short:'02 有限誤差',title:'圖二｜差額小，並非等於零',subtitle:'A = 1000，βf = 0.1，x = 0.1 V；所有電壓使用共同參考。',look:'圖二：輸入與回傳同尺度，差額條放大100倍；用e×1000回驗輸出，勿把差額當零。',diagram:algebra(),extra:formula('Af = 1000/101 = 9.900990 V/V<br>y = 0.990099 V；βf y = 0.099009901 V<br>e = 0.000990099 V；A e = y')+note('相對十倍目標不足量：(10 − Af)/10 = 1/(1 + Aβf) ≈ 0.990099%。量兩個接近電壓的差，需足夠解析度與可靠參考。'),takeaways:take('理想目標','1/βf = 10')+take('殘留誤差','約 0.9901 mV')},
{id:'ef-gain',short:'03 調開迴路',title:'圖三｜提高 A，閉迴路靠近十倍',subtitle:'βf 固定0.1；滑桿是 log₁₀A，不是線性加法。',look:'圖三：依序按100、1000、10000，比較相對不足9.0909%、0.990099%、0.0999001%。',diagram:dynamic('ef-gain-plot',gainPlot()),extra:controls('ef-a','開迴路 A（log₁₀ 滑桿）',2,4,.1,3,[[2,'100'],[3,'1000／重設'],[4,'10000']])+formula('Af = A/(1 + 0.1A)；相對不足 = 1/(1 + 0.1A)')+note('降低對 A 的局部相對敏感度；不代表消除所有雜訊、偏移、失真或回授電阻容差。'),takeaways:takeDynamic('ef-gain-values')},
{id:'ef-noninverting',short:'04 非反相',title:'圖四｜虛短由回授形成',subtitle:'理想輸入電流零；Rf = 9 kΩ、Rg = 1 kΩ；供電端與訊號正負端分開。',look:'圖四：負端是分壓點，不是地。理想10倍；有限A1000為9.900990倍，兩輸入未用導線相接。',diagram:opamp(),extra:formula('v− = vo Rg/(Rf + Rg) = 0.1vo<br>vo = A(v+ − v−)；理想 Av = 1 + Rf/Rg = 10')+note('虛斷：理想輸入電流近零，非端電壓零。虛短：線性穩態、穩定負回授與足夠 A 下 v+ ≈ v−；輸入共模、負載與輸出範圍也須適當。')+note('理想 vin 0.1 V → vo 1 V，v− 0.1 V，兩電阻皆 0.1 mA；A1000時 vo 0.990099 V、誤差0.990099 mV。萬用表量分壓點，示波器看同相；探棒負載可能改變分壓。'),takeaways:take('虛斷','輸入電流近零')+take('虛短','兩端電壓差近零')},
{id:'ef-inverting',short:'05 反相',title:'圖五｜同樣電阻，訊號增益是負九',subtitle:'正端接參考；輸入經 Rin 到負端，以節點電流守恆求解。',look:'圖五：理想輸入0.1V、輸出−0.9V，兩電阻流0.1mA；有限增益的負端略正，雜訊增益仍10。',diagram:opamp(true),extra:formula('KCL：(vin − v−)/Rin + (vo − v−)/Rf = 0<br>理想：vo/vin = −Rf/Rin = −9<br>有限 A：vo/vin = −A Rf/[Rf + (A + 1)Rin]<br>A = 1000 → −8.910891；vin = 0.1 V → vo = −0.891089 V，v− = +0.891089 mV')+note('輸入源設零後 βf = 0.1，雜訊增益 1/βf = 10；訊號增益大小9不能代替頻寬估算中的10。虛地不是實體接地；KCL在飽和時仍成立。'),takeaways:take('理想訊號增益','−9 V/V')+take('雜訊增益','10 V/V')},
{id:'ef-rails',short:'06 限幅',title:'圖六｜輸出到頂，虛短停止適用',subtitle:'此圖改用理想閉迴路10倍＋準靜態限幅；供電±12V、示範輸出±10V。',look:'圖六：按0.5V看5V線性輸出，再按±1.5V看±10V平台與±0.5V殘留誤差；橫軸不是時間。',diagram:dynamic('ef-rails-plot',railPlot()),extra:controls('ef-vin','輸入 vin（V）',-1.5,1.5,.1,.5,[[-1.5,'−1.5 V'],[.5,'0.5 V／重設'],[1.5,'1.5 V']])+formula('vo = clip(10vin, −10, 10)；v− = 0.1vo；e = vin − v−')+note('不是所有真運放的輸出範圍。只描述準靜態候選與限幅，不能預測飽和恢復時間；輸入共模、電流限制未建模。'),takeaways:takeDynamic('ef-rails-values')},
{id:'ef-open-closed',short:'07 開閉迴路',title:'圖七｜用高低頻增益換取平坦範圍',subtitle:'單主極點：A0 = 100000，fp = 10 Hz，βf = 0.1；小訊號、線性、回授無延遲。',look:'圖七：藍色開迴路低頻100dB、10Hz轉折，綠色閉迴路約20dB但更平坦；不是十萬倍一路維持到1MHz。',diagram:bodeSingle('ef-open-closed-svg'),extra:formula('A(s) = A0/(1 + s/ωp)，ωp = 2πfp<br>|A(f)| = A0/√[1 + (f/fp)²]<br>Af0 = 100000/10001 = 9.9990001 V/V<br>開迴路 unity：fp√(A0² − 1) ≈ 1 MHz')+note('f用Hz，ω用rad/s；正弦穩態s=j2πf。圖上分貝為20log₁₀電壓比。掃頻需同時量實際輸入、輸出與負載條件，閉迴路曲線不等於迴路增益。'),takeaways:take('開迴路低頻','100 dB')+take('閉迴路低頻','約 20 dB')},
{id:'ef-bandwidth',short:'08 頻寬定義',title:'圖八｜負三分貝相對自己的低頻',subtitle:'相對下降3.0103dB，幅值剩1/√2；不是電壓剩一半。',look:'圖八：先找閉迴路低頻約20dB，再找約17dB的相對下降線；fcl=100010Hz。開迴路unity約1MHz是另一個定義。',diagram:bodeSingle('ef-bandwidth-svg',10,true,true),extra:formula('y = A(s)(x − βf y) → Af(s) = A(s)/(1 + A(s)βf)<br>代入 → A0/[1 + A0βf + s/ωp]<br>整理 → [A0/(1 + A0βf)] / [1 + s/{ωp(1 + A0βf)}]<br>fcl = fp(1 + A0βf) = 100010 Hz<br>|Af(fcl)| = Af0/√2 ≈ 7.070361 V/V')+note('低頻增益 × 閉迴路極點 = A0fp = 1MHz，在此精確單極點模型成立。實物GBW約固定需要單主極點電壓回授等前提。'),takeaways:take('閉迴路 fcl','100010 Hz')+take('開迴路一倍','約 1 MHz')},
{id:'ef-feedback-ratio',short:'09 調回授比例',title:'圖九｜目標增益提高，頻寬縮窄',subtitle:'只改雜訊增益 NG = 1/βf；開迴路A0與fp固定。',look:'圖九：按10與100，比較Af0約9.999與99.9001，fcl從100010降至10010Hz；反相−9例仍用NG10。',diagram:dynamic('ef-ng-plot',bodeSingle('ef-ng-svg',10,false,true)),extra:controls('ef-ng','雜訊增益 NG',10,100,10,10,[[10,'10／重設'],[50,'50'],[100,'100']])+formula('βf = 1/NG；Af0 = A0/(1 + A0/NG)<br>fcl = fp(1 + A0/NG) ≈ GBW/NG')+note('反相訊號增益−9的例子，NG仍10。此近似不直接套所有運放、所有回授型式或大訊號；頻寬內也有幅相變化。'),takeaways:takeDynamic('ef-ng-values')},
{id:'ef-phase-loop',short:'10 相位與減號',title:'圖十｜傳輸相位和負端減法分開算',subtitle:'L = Aβf，不包含比較點的負號；低頻L為正。',look:'圖十：傳輸落後接近180度，回來再相減可能同向；還須檢查大小接近一倍，不能把任何延遲都叫不穩。',diagram:loopDiagram('ef-phase-loop-svg',true),extra:formula('閉迴路分母：1 + L；關鍵位置 L = −1<br>即 |L| = 1 與 phase(L) = −180°，兩個條件一起看。')+note('訊號方向示意，不是計算出的暫態波形。相位裕度須有開迴路穩定與交越結構前提，高階或多交越回路需完整判準。'),takeaways:take('比較點','固定相減')+take('傳輸路徑','另計相位與大小')},
{id:'ef-phase-fixed',short:'11 固定兩極',title:'圖十一｜先找零分貝，再讀相位',subtitle:'A0 = 100000、βf = 0.1、fp1 = 10 Hz、fp2 = 100000 Hz；本圖固定不隨滑桿改變。',look:'圖十一：上圖一倍交越78615.137Hz；同頻下圖相位−128.165°，到−180°距離PM=51.835°。',diagram:bodeLoop('ef-phase-fixed-svg'),extra:formula('L(f) = 10000/[(1 + jf/10)(1 + jf/100000)]<br>|L(fu)| = 1；fu = 78615.137316 Hz<br>phase = −atan(fu/10) − atan(fu/100000) = −128.165419°<br>PM = 180° + phase = 51.834581°')+note('此開迴路穩定、單一單調交越的兩極模型才可如此讀裕度。實測需維持直流偏壓與負載，用合適的小交流注入量返回比；閉迴路階躍振鈴只是線索，不能直接代表一般系統PM。'),takeaways:take('一倍交越','78.615137 kHz')+take('相位裕度','51.834581°')},
{id:'ef-second-pole',short:'12 移第二極點',title:'圖十二｜第二極點更低，餘裕更少',subtitle:'fp2以log₁₀滑桿改變，其餘參數固定；數值二分求唯一正頻率交越。',look:'圖十二：按10k、100k、1M，PM約17.983°、51.835°、84.323°；交越與相位必須同組參數。此模型仍穩定。',diagram:dynamic('ef-p2-plot',bodeLoop('ef-p2-svg')),extra:controls('ef-p2','第二極點 fp2（log₁₀ Hz）',4,6,.1,5,[[4,'10 kHz'],[5,'100 kHz／重設'],[6,'1 MHz']])+formula('L = A0βf/[(1 + jf/fp1)(1 + jf/fp2)]<br>PM = 180° − atan(fu/fp1) − atan(fu/fp2)')+note('二階閉迴路分母：s² + (ω1 + ω2)s + ω1ω2(1 + A0βf)。有限正參數時係數正，二階極點實部為負，整個範圍仍穩定；低裕度不等於必發散。沒有時域模型，不畫假真振鈴。'),takeaways:takeDynamic('ef-p2-values')},
{id:'ef-slew-slope',short:'13 正弦斜率',title:'圖十三｜電壓最高時，斜率反而為零',subtitle:'目標峰值Vpk = 2 V、f = 10 kHz；SR示範上限0.5 V/μs。',look:'圖十三：正負零交越斜率絕對值最大，峰谷為零；需求0.125664V/μs低於0.5，但不是零失真保證。',diagram:sinePlot('ef-slew-slope-svg'),extra:formula('vo = Vpk sin(2πft)<br>dvo/dt = 2πfVpk cos(2πft)<br>max |dvo/dt| = 2πfVpk = 125663.706 V/s<br>= 0.125664 V/μs')+note('充電直覺：i = C dv/dt；有限可用電流讓內部補償電容電壓斜率有限，不指定未選定的實物器件。這是目標斜率，未計算失真輸出。'),takeaways:take('零交越','最大斜率')+take('波峰、波谷','斜率 0')},
{id:'ef-slew-frequency',short:'14 調頻率',title:'圖十四｜兩伏特要多快走完一週期',subtitle:'Vpk固定2V；頻率1–100kHz，步進1kHz，SR固定0.5V/μs。',look:'圖十四：10k需求0.125664、100k需求1.256637V/μs；理論fmax約39.789kHz。正弦時間軸隨頻率變。',diagram:dynamic('ef-f-plot',sinePlot('ef-f-sine',10000,2)+slopeBars('ef-f-bars',demand(10000,2))),extra:controls('ef-f','頻率 f（kHz）',1,100,1,10,[[10,'10 kHz／重設'],[39,'39 kHz'],[40,'40 kHz'],[100,'100 kHz']])+formula('需求 = 2πf × 2 / 10⁶（V/μs，f用Hz）<br>fmax = (0.5 × 10⁶)/(2π × 2) = 39788.735773 Hz')+note('只判斷目標斜率能否達成，不假造失真波形。等於限制只是理論邊界；真實器件需查條件與量測。示波器量ΔV/Δt時，來源、探棒、負載與儀器速度也須足夠。'),takeaways:takeDynamic('ef-f-values')},
{id:'ef-slew-amplitude',short:'15 調振幅',title:'圖十五｜同頻率，小振幅與大振幅分開驗',subtitle:'f固定50kHz；Vpk 0.1–4V，峰值不是峰對峰。目標振幅是需求值。',look:'圖十五：按1V看需求0.314159，按2V看0.628319V/μs；Vpk,max約1.591549V。三條件卡逐項看。',diagram:dynamic('ef-vpk-plot',sinePlot('ef-vpk-sine',50000,2)+slopeBars('ef-vpk-bars',demand(50000,2))),extra:controls('ef-vpk','輸出目標峰值 Vpk（V）',.1,4,.1,2,[[1,'1 V'],[2,'2 V／重設'],[4,'4 V']])+formula('Vpk,max = (0.5 × 10⁶)/(2π × 50000) = 1.591549 V<br>1 V → 0.314159 V/μs；2 V → 0.628319 V/μs')+`<div id="ef-check-card" class="check-card" aria-live="polite"></div>`+note('帶寬內仍有線性幅相變化；三項未超限也不保證零失真。負載、共模、輸出電流等未包含。使用實物需指定條件並量測，不能由需求側圖推恢復時間。'),takeaways:takeDynamic('ef-vpk-values')}
];
$('figures').innerHTML=figures.map((f,i)=>`<article id="${f.id}" class="figure-card"${i?' hidden':''}><header class="figure-head"><p class="figure-kicker">停靠圖 ${String(i+1).padStart(2,'0')}</p><h3>${f.title}</h3><p>${f.subtitle}</p></header><p id="${f.id}-scroll-hint" class="plot-note">窄螢幕可左右捲動圖框；鍵盤聚焦圖框後用方向鍵。核心公式與限制列於下方。</p><div class="diagram" tabindex="0" role="region" aria-label="${f.title}" aria-describedby="${f.id}-scroll-hint">${f.diagram}</div>${f.extra||''}<div class="figure-takeaway">${f.takeaways||''}</div></article>`).join('');
$('figure-tabs').innerHTML=figures.map((f,i)=>`<button type="button" data-figure="${f.id}" aria-pressed="${i===0}">${f.short}</button>`).join('');
function showFigure(id,scroll=false){if(!figures.some(f=>f.id===id))return;figures.forEach(f=>$(f.id).hidden=f.id!==id);$('figure-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.figure===id)));if(scroll)$(id).scrollIntoView({behavior:'smooth',block:'start'});}
$('figure-tabs').addEventListener('click',event=>{const b=event.target.closest('button');if(b)showFigure(b.dataset.figure);});
function inputNumber(id){const el=$(id),v=Number(el.value),min=Number(el.min),max=Number(el.max);return Number.isFinite(v)?Math.max(min,Math.min(max,v)):Number(el.defaultValue);}
function updateA(){const a=10**inputNumber('ef-a'),r=gainData(a);$('ef-a-value').value=a.toFixed(3);$('ef-gain-plot').innerHTML=gainPlot(a);$('ef-gain-values').innerHTML=take('Af',r.af.toFixed(6)+' V/V')+take('目標','10 V/V')+take('相對不足',(r.error*100).toFixed(6)+'%');$('ef-a-result').textContent=`Aβf = ${(a*.1).toFixed(3)}；1/(1 + Aβf) = ${(r.error*100).toFixed(6)}%。提高A使Af靠近10，但有限A仍需非零誤差。`;}
function updateRails(){const v=inputNumber('ef-vin'),r=railData(v);$('ef-vin-value').value=v.toFixed(1)+' V';$('ef-rails-plot').innerHTML=railPlot(v);$('ef-rails-values').innerHTML=take('候選 → 輸出',`${r.candidate.toFixed(1)} → ${r.vo.toFixed(1)} V`)+take('v−',r.minus.toFixed(3)+' V')+take('殘留 e',r.error.toFixed(3)+' V');$('ef-vin-result').textContent=Math.abs(r.candidate)>10?`超幅：候選${r.candidate.toFixed(1)} V超過±10 V，限幅後v−=${r.minus.toFixed(1)} V，不可繼續用虛短。`:Math.abs(r.candidate)===10?'正好碰到±10 V邊界；模型誤差0，不保證實物線性餘裕。':'線性範圍：候選在±10 V之內；此圖理想增益模型可用虛短。';}
function updateNg(){const ng=inputNumber('ef-ng'),q=closed(ng);$('ef-ng-value').value=ng.toFixed(0);$('ef-ng-plot').innerHTML=bodeSingle('ef-ng-svg',ng,false,true);$('ef-ng-values').innerHTML=take('βf',q.beta.toFixed(6))+take('Af0',q.gain.toFixed(6)+' V/V')+take('fcl',q.bw.toFixed(1)+' Hz');$('ef-ng-result').textContent=`NG增大 → βf減少 → 迴路增益減少，低頻增益提高、頻寬縮窄。本例Af0 × fcl = ${(q.gain*q.bw).toFixed(0)} Hz。`;}
function updateP2(){const p2=10**inputNumber('ef-p2'),r=stability(p2);$('ef-p2-value').value=(p2/1000).toFixed(3)+' kHz';$('ef-p2-plot').innerHTML=bodeLoop('ef-p2-svg',p2);$('ef-p2-values').innerHTML=take('fu',r.fu.toFixed(3)+' Hz')+take('phase',r.phase.toFixed(3)+'°')+take('PM',r.pm.toFixed(3)+'°');$('ef-p2-result').textContent=`|L(fu)| = ${mag(r.fu,p2).toFixed(8)}。第二極點降低時額外相位更早加入，PM減少；此有限正參數兩極模型仍穩定，未畫時域波形。`;}
const slopeReason=q=>Math.abs(q-SR)<1e-9?'等於模型邊界，不保證零失真。':q<SR?'需求低於SR；僅此項未超限，仍需其他檢查。':'需求超過SR；目標正弦不能原樣追隨，未推算真實失真波形。';
function updateF(){const f=inputNumber('ef-f')*1000,q=demand(f,2);$('ef-f-value').value=(f/1000).toFixed(0)+' kHz';$('ef-f-plot').innerHTML=sinePlot('ef-f-sine',f,2)+slopeBars('ef-f-bars',q);$('ef-f-values').innerHTML=take('最大需求',q.toFixed(6)+' V/μs')+take('fmax','39788.735773 Hz');$('ef-f-result').textContent=`固定Vpk2V，需求隨f線性增加。${slopeReason(q)}`;}
function updateVpk(){const v=inputNumber('ef-vpk'),q=demand(50000,v);$('ef-vpk-value').value=v.toFixed(1)+' V';$('ef-vpk-plot').innerHTML=sinePlot('ef-vpk-sine',50000,v)+slopeBars('ef-vpk-bars',q);$('ef-vpk-values').innerHTML=take('最大需求',q.toFixed(6)+' V/μs')+take('Vpk,max','1.591549 V');$('ef-vpk-result').textContent=`固定50kHz，需求隨Vpk線性增加。${slopeReason(q)}`;$('ef-check-card').innerHTML=`<h4>同一目標，三條件檢查</h4><p>目標：50 kHz、${v.toFixed(1)} V 峰值（${(v*2).toFixed(1)} V 峰對峰）。</p><ol><li>小訊號頻寬：50 kHz &lt; 100010 Hz；在帶寬內，仍有幅相變化。</li><li>靜態擺幅：±${v.toFixed(1)} V 在 ±10 V 內；此項未超限。</li><li>轉換速率：${q.toFixed(6)} ${q>SR?'&gt;':'&lt;'} 0.5 V/μs；${q>SR?'超過斜率上限':'此項未超限'}。</li></ol>`;}
const updates={'ef-a':updateA,'ef-vin':updateRails,'ef-ng':updateNg,'ef-p2':updateP2,'ef-f':updateF,'ef-vpk':updateVpk};
for(const[id,fn]of Object.entries(updates)){$(id).addEventListener('input',fn);fn();}
document.addEventListener('click',event=>{const b=event.target.closest('[data-control]');if(b&&updates[b.dataset.control]){$(b.dataset.control).value=b.dataset.value;updates[b.dataset.control]();}});
  const lessons=window.CIRCUIT_AUDIO?.lessons||[];
  if(!lessons.length){$('segment-title').textContent='講稿尚未載入';$('player-status').textContent='請確認同目錄的 lesson-data.js 可讀取；圖解仍可使用。';['play-button','pause-button','replay-button','next-button','copy-script'].forEach(id=>$(id).disabled=true);return;}
  const synth=window.speechSynthesis;
  const supported=Boolean(synth&&window.SpeechSynthesisUtterance);
  const storageKey='electronics-feedback-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  let lessonIndex=Math.max(0,lessons.findIndex(l=>l.id===saved.lesson));
  let segmentIndex=Math.min(Math.max(0,Number.isInteger(saved.segment)?saved.segment:0),lessons[lessonIndex].segments.length-1);
  let state=saved.state==='checkpoint'?'checkpoint':'idle';
  let voices=[],voiceURI=saved.voice||'',rate=Math.min(1.2,Math.max(.7,Number(saved.rate)||.9));
  let mediaRate=Math.min(2,Math.max(.75,Number(saved.mediaRate)||1));
  let generation=0,audio=null,utterance=null,chunks=[],chunkIndex=0,chunkStarted=false,chunkElapsed=0,chunkLimit=0;
  const courseAudio=$('course-audio');
  const assets=window.CIRCUIT_AUDIO_ASSETS||{segments:{}};
  const courseSegmentIds=new Set(lessons.flatMap(item=>item.segments.map(part=>part.id)));
  const generatedAudioCount=[...courseSegmentIds].filter(id=>{
    const src=assets.segments?.[id]?.src;
    return typeof src==='string'&&src.trim().length>0;
  }).length;
  $('audio-generation-count').textContent=`已生成 ${generatedAudioCount}／${courseSegmentIds.size} 段音檔`;
  $('audio-generation-note').textContent=generatedAudioCount===courseSegmentIds.size
    ?'整課音檔已齊全，可依課程段落播放；看圖停靠仍會等待你繼續。'
    :'尚未生成的段落可先讀講稿、看圖；有中文系統聲音時，按播放才會朗讀。正式音檔尚未製作。';
  let mediaKey='';
  const lesson=()=>lessons[lessonIndex];
  const segment=()=>lesson().segments[segmentIndex];
  const selectedVoice=()=>voices.find(v=>v.voiceURI===voiceURI)||voices[0];
  function save(){try{localStorage.setItem(storageKey,JSON.stringify({lesson:lesson().id,segment:segmentIndex,state,rate,mediaRate,voice:voiceURI}));}catch{}}
  const audioSrc=()=>assets.segments?.[segment().id]?.src||segment().audioSrc||'';
  function canPlay(){return Boolean(audioSrc() || (supported&&voices.length));}
  function sourceLabel(){return audioSrc()?`聲音來源：本段音檔 ${audioSrc()}`:selectedVoice()?`聲音來源：瀏覽器系統語音 · ${selectedVoice().name}（${selectedVoice().lang}）`:'聲音來源：尚無可用的中文系統語音。';}
  function renderControls(message){
    const names={idle:'準備就緒',playing:'聆聽中',paused:'已暫停',checkpoint:'看圖停靠',ended:'本堂完成',error:'播放中斷'};
    $('state-badge').textContent=names[state]||'準備就緒';
    $('play-button').textContent=state==='checkpoint'?'看完了，繼續':state==='paused'?'繼續播放':state==='ended'?'重聽本堂':'開始聽課';
    $('play-button').disabled=state==='playing'||!canPlay();
    $('pause-button').disabled=state!=='playing';
    $('replay-button').disabled=!canPlay();
    $('next-button').disabled=segmentIndex>=lesson().segments.length-1;
    $('voice-source').textContent=sourceLabel();
    $('voice-select').disabled=Boolean(audioSrc())||!voices.length;
    $('speech-rate').disabled=Boolean(audioSrc());
    $('checkpoint-notice').hidden=state!=='checkpoint';
    if(state==='checkpoint'){
      const f=figures.find(f=>f.id===segment().figure);
      $('checkpoint-text').textContent=f?f.look:'稍作回顧；準備好後再繼續。';
      $('show-figure').hidden=!f;
    }
    if(message!==undefined)$('player-status').textContent=message;
    else if(!canPlay())$('player-status').textContent=supported?'尚未找到中文聲音，或聲音清單仍在載入。可展開下方完整講稿閱讀；不會改用英文聲音。':'此瀏覽器不支援系統朗讀。請使用完整講稿與圖解。';
    save();
  }
  function stop(){
    generation++;
    detachMediaEvents();courseAudio.pause();audio=null;
    utterance=null;chunkStarted=false;chunkElapsed=0;
    if(supported)synth.cancel();
  }
  function detachMediaEvents(){
    courseAudio.onplay=null;courseAudio.onpause=null;courseAudio.onended=null;courseAudio.onerror=null;courseAudio.onseeked=null;
  }
  function formatTime(seconds,exact=false){
    if(!Number.isFinite(seconds)||seconds<0)return '—';
    const minutes=Math.floor(seconds/60),rest=seconds-minutes*60;
    return `${minutes}:${(exact?rest.toFixed(1):String(Math.floor(rest))).padStart(exact?4:2,'0')}`;
  }
  function updateMediaTime(element,output){
    $(output).textContent=`${formatTime(element.currentTime)} / ${formatTime(element.duration,true)}`;
  }
  function atMediaEnd(tolerance=.04){return Number.isFinite(courseAudio.duration)&&courseAudio.duration>0&&courseAudio.currentTime>=courseAudio.duration-tolerance;}
  function pauseCourse(message='已暫停；按繼續回到剛才的位置。'){
    if(state!=='playing')return;
    state='paused';
    if(audio)audio.pause();else if(utterance)synth.pause();
    renderControls(message);
  }
  function prepareMedia(){
    const src=audioSrc(),key=src?`${segment().id}|${src}`:'';
    $('course-audio-panel').hidden=!src;$('tts-seek-note').hidden=Boolean(src);
    if(!src){
      detachMediaEvents();courseAudio.pause();audio=null;
      if(mediaKey){courseAudio.removeAttribute('src');courseAudio.load();mediaKey='';}
      return;
    }
    audio=courseAudio;
    if(mediaKey!==key){
      detachMediaEvents();courseAudio.pause();mediaKey=key;
      courseAudio.src=src;courseAudio.load();
    }
    courseAudio.playbackRate=mediaRate;
    $('course-download').href=src;
    $('course-download').download=src.split('/').pop()||`${segment().id}.mp3`;
    updateMediaTime(courseAudio,'course-time');
    const token=generation,id=segment().id;
    const valid=()=>token===generation&&id===segment().id&&mediaKey===key;
    courseAudio.onplay=()=>{
      if(!valid()||courseAudio.paused)return;
      state='playing';
      renderControls('正在播放本段音檔；時間與進度只代表這一段。');
    };
    courseAudio.onpause=()=>{
      if(!valid()||!courseAudio.paused||courseAudio.ended||atMediaEnd())return;
      if(state==='playing'){state='paused';renderControls('音檔已暫停；拖曳可調整本段播放位置。');}
    };
    courseAudio.onended=()=>{if(valid()&&atMediaEnd())completeSegment(token);};
    courseAudio.onseeked=()=>{
      if(!valid())return;
      updateMediaTime(courseAudio,'course-time');
      if(segment().checkpoint&&atMediaEnd(.15)&&state!=='checkpoint'){
        // Only an explicit seek gets tolerance for MP3 duration corrections.
        // Normal playback still waits for the actual ended event.
        state='playing';completeSegment(token);courseAudio.pause();
      }
    };
    courseAudio.onerror=()=>{if(valid())fail(token,'本段音檔無法讀取。');};
  }
  function setRate(value){
    const numeric=Number(value);if(!Number.isFinite(numeric))return;
    rate=Math.round(Math.min(1.2,Math.max(.7,numeric))*100)/100;
    $('speech-rate').value=String(rate);$('rate-value').value=`${rate}×`;
    save();
  }
  function setMediaRate(value){
    const numeric=Number(value);if(!Number.isFinite(numeric))return;
    mediaRate=Math.round(Math.min(2,Math.max(.75,numeric))*100)/100;
    for(const id of ['course-rate']){
      if(!Array.from($(id).options).some(option=>Number(option.value)===mediaRate)){
        const option=document.createElement('option');option.value=String(mediaRate);option.textContent=`${mediaRate}×`;$(id).append(option);
      }
      $(id).value=String(mediaRate);
    }
    for(const element of [courseAudio]){
      element.preservesPitch=true;
      if(Math.abs(element.defaultPlaybackRate-mediaRate)>.001)element.defaultPlaybackRate=mediaRate;
      if(Math.abs(element.playbackRate-mediaRate)>.001)element.playbackRate=mediaRate;
    }
    save();
  }
  function renderLesson(){
    $('lesson-select').value=lesson().id;
    $('lesson-summary').textContent=lesson().summary||'';
    const spokenChars=lesson().segments.reduce((sum,s)=>sum+(String(s.text).match(/[\u3400-\u9fff]/g)||[]).length,0);
    $('duration-estimate').textContent=`本堂約 ${Math.round(spokenChars/280)}–${Math.round(spokenChars/240)} 分鐘（正文估算）`;
    $('duration-estimate').title='以每分鐘 240–280 個中文字估算；實際長度受語速、音色及數字讀法影響，人工停靠另計。';
    $('segment-list').replaceChildren();
    $('transcript-content').replaceChildren();
    lesson().segments.forEach((s,i)=>{
      const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.dataset.index=String(i);button.setAttribute('aria-current',String(i===segmentIndex));
      const n=document.createElement('span');n.className='segment-number';n.textContent=String(i+1).padStart(2,'0');
      const label=document.createElement('span');label.className='segment-label';label.textContent=s.title;
      button.append(n,label);if(s.checkpoint){const stopLabel=document.createElement('span');stopLabel.className='stop-dot';stopLabel.textContent='看圖';button.append(stopLabel);}li.append(button);$('segment-list').append(li);
      const section=document.createElement('section');section.className='transcript-section';const heading=document.createElement('h3');heading.textContent=`${i+1}. ${s.title}`;const p=document.createElement('p');p.textContent=s.text;section.append(heading,p);if(s.checkpoint){const note=document.createElement('span');note.className='transcript-stop';note.textContent=figures.find(f=>f.id===s.figure)?.look||'此處停靠，手動繼續。';section.append(note);}$('transcript-content').append(section);
    });
    renderSegment();
  }
  function renderSegment(){
    $('segment-title').textContent=segment().title;
    $('progress-label').textContent=`${String(segmentIndex+1).padStart(2,'0')} / ${String(lesson().segments.length).padStart(2,'0')}`;
    $('lesson-progress').max=lesson().segments.length;$('lesson-progress').value=segmentIndex;
    $('segment-list').querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.index)===segmentIndex)));
    if(segment().figure)showFigure(segment().figure);
    prepareMedia();
    renderControls(state==='checkpoint'?'已停靠在教材。看完後按「看完了，繼續」。':canPlay()?'準備好後按開始；切換段落不會自動播放。':undefined);
  }
  function navigate(index){stop();segmentIndex=index;state='idle';renderSegment();}
  function completeSegment(token){
    if(token!==generation||state!=='playing')return;
    utterance=null;chunkStarted=false;
    if(segment().checkpoint){state='checkpoint';renderControls('這裡先停下來看圖。看完後按「看完了，繼續」。');}
    else if(segmentIndex<lesson().segments.length-1){stop();segmentIndex++;state='idle';renderSegment();start();}
    else{state='ended';$('lesson-progress').value=lesson().segments.length;renderControls('本堂已完成。可重聽、讀講稿，或選擇下一堂。');}
  }
  function fail(token,message){if(token!==generation)return;stop();state='error';renderControls(message+' 可按重播本段，或閱讀完整講稿。');}
  function splitText(text){
    // Short punctuation-aware utterances avoid browsers silently dropping long input.
    const sentences=String(text).match(/[^。！？；\n]+[。！？；\n]?/g)||[];
    return sentences.flatMap(sentence=>{const output=[];let part='';for(const char of sentence){part+=char;if(part.length>=65||(/[，、：]/.test(char)&&part.length>=35)){output.push(part);part='';}}if(part.trim())output.push(part);return output;}).filter(s=>s.trim());
  }
  function speakChunk(token){
    if(token!==generation||state!=='playing'||utterance)return;
    if(chunkIndex>=chunks.length){completeSegment(token);return;}
    const voice=selectedVoice();
    if(!voice){fail(token,'中文系統語音目前無法使用，已停止播放；聲音恢復後可重播本段。');return;}
    const u=new SpeechSynthesisUtterance(chunks[chunkIndex]);utterance=u;
    u.voice=voice;u.lang=voice.lang;u.rate=rate;
    chunkStarted=false;chunkElapsed=0;chunkLimit=Math.max(35,chunks[chunkIndex].length/(2*rate)+20);
    u.onstart=()=>{if(token===generation&&utterance===u)chunkStarted=true;};
    u.onend=()=>{if(token!==generation||utterance!==u)return;chunkStarted=false;utterance=null;chunkIndex++;if(state==='playing')setTimeout(()=>speakChunk(token),100);};
    u.onerror=event=>{if(token!==generation||utterance!==u)return;fail(token,`系統朗讀中斷（${event.error||'未知錯誤'}）。`);};
    try{synth.speak(u);}catch{fail(token,'無法啟動中文系統朗讀。');}
  }
  function start(){
    if(state==='playing'||!canPlay())return;

    if(state==='checkpoint'){
      if(segmentIndex===lesson().segments.length-1){state='ended';$('lesson-progress').value=lesson().segments.length;renderControls('本堂已完成，可選擇下一堂。');return;}
      stop();segmentIndex++;state='idle';renderSegment();
      if(!canPlay()){renderControls();return;}
    }
    if(state==='ended'){stop();segmentIndex=0;state='idle';renderSegment();}
    if(state==='paused'){
      state='playing';renderControls('繼續播放。');const token=generation;
      if(audio){audio.play().catch(()=>{if(state==='playing')fail(token,'瀏覽器未允許音檔繼續播放。');});}
      else if(utterance){synth.resume();}
      else{speakChunk(token);}
      return;
    }
    stop();prepareMedia();state='playing';const token=generation;renderControls('正在播放本段；看圖停靠處會等待你繼續。');
    if(audioSrc()){
      audio.play().catch(()=>{if(state==='playing')fail(token,'音檔播放未成功啟動。');});
    }else{chunks=splitText(segment().text);chunkIndex=0;speakChunk(token);}
  }
  function loadVoices(){
    const hadVoice=voices.length>0;
    if(!supported){renderControls();return;}
    voices=synth.getVoices().filter(v=>/^(zh|cmn|yue)([-_]|$)/i.test(v.lang));
    voices.sort((a,b)=>Number(/^zh[-_]TW$/i.test(b.lang))-Number(/^zh[-_]TW$/i.test(a.lang)));
    if(!voices.some(v=>v.voiceURI===voiceURI))voiceURI=voices[0]?.voiceURI||'';
    $('voice-select').replaceChildren();
    if(!voices.length){const option=document.createElement('option');option.textContent='尚無中文語音';$('voice-select').append(option);}
    voices.forEach(v=>{const option=document.createElement('option');option.value=v.voiceURI;option.textContent=`${v.name} · ${v.lang}`;$('voice-select').append(option);});
    $('voice-select').value=voiceURI;renderControls(!hadVoice&&voices.length&&state==='idle'?'中文系統語音已準備好。請按開始聽課。':undefined);
  }
  lessons.forEach(l=>{const option=document.createElement('option');option.value=l.id;option.textContent=l.title;$('lesson-select').append(option);});
  $('lesson-select').addEventListener('change',()=>{stop();lessonIndex=lessons.findIndex(l=>l.id===$('lesson-select').value);segmentIndex=0;state='idle';$('copy-status').textContent='';renderLesson();});
  $('segment-list').addEventListener('click',event=>{const button=event.target.closest('button');if(button)navigate(Number(button.dataset.index));});
  $('play-button').addEventListener('click',start);
  $('pause-button').addEventListener('click',()=>pauseCourse());
  $('replay-button').addEventListener('click',()=>{stop();if(audioSrc())courseAudio.currentTime=0;state='idle';start();});
  $('next-button').addEventListener('click',()=>{if(segmentIndex<lesson().segments.length-1)navigate(segmentIndex+1);});
  $('show-figure').addEventListener('click',()=>showFigure(segment().figure,true));
  $('voice-select').addEventListener('change',()=>{const wasActive=state==='playing'||state==='paused';stop();voiceURI=$('voice-select').value;if(wasActive)state='idle';renderControls('已切換系統聲音。按開始會從本段開頭播放。');});
  for(const id of ['course-rate']){
    $(id).innerHTML=[.75,.9,1,1.1,1.25,1.5,1.75,2].map(r=>`<option value="${r}">${r}×</option>`).join('');
    $(id).addEventListener('change',()=>setMediaRate($(id).value));
  }
  $('speech-rate').addEventListener('input',()=>setRate($('speech-rate').value));
  [courseAudio].forEach(element=>element.addEventListener('ratechange',()=>setMediaRate(element.playbackRate)));
  setRate(rate);setMediaRate(mediaRate);
  $('speech-rate').addEventListener('change',()=>{if(!audio&&state==='playing')renderControls('語速將從下一個短句套用；實際時長會隨語速與音色改變。');});
  $('copy-script').addEventListener('click',async()=>{
    const text=lesson().title+'\n\n'+lesson().segments.map((s,i)=>`${i+1}. ${s.title}\n\n${s.text}${s.checkpoint?'\n\n〔看圖停靠〕'+(figures.find(f=>f.id===s.figure)?.look||''):''}`).join('\n\n');
    try{await navigator.clipboard.writeText(text);$('copy-status').textContent='已複製本堂完整講稿。';}catch{const range=document.createRange();range.selectNodeContents($('transcript-content'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='瀏覽器不允許自動複製，已選取講稿；請按 Ctrl+C／⌘C。';}
  });
  // Detect silence without treating background-tab throttling as missing content.
  setInterval(()=>{if(state!=='playing'||audio||!utterance||document.hidden)return;chunkElapsed++;if(chunkElapsed>chunkLimit)fail(generation,chunkStarted?'系統語音長時間未完成這個短句。':'系統語音未開始出聲。');},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state==='playing')renderControls('已回到教材；若背景朗讀被瀏覽器暫停，可暫停再繼續，或重播本段。');});
  window.addEventListener('pagehide',()=>{save();stop();});
  if(supported){synth.addEventListener?.('voiceschanged',loadVoices);}
  ['loadedmetadata','durationchange','timeupdate','seeked','emptied'].forEach(event=>{
    courseAudio.addEventListener(event,()=>updateMediaTime(courseAudio,'course-time'));
  });
  renderLesson();loadVoices();
  // Some browsers populate voices late without emitting voiceschanged.
  [500,1500,4000].forEach(delay=>setTimeout(loadVoices,delay));
})();

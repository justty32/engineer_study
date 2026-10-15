from pathlib import Path
import json,re,html,math
D=Path(__file__).resolve().parent
T=D.parent/'聽課-電場與電位'
P='emmaxwell'
escape=html.escape
source=(D/'完整口語稿.md').read_text()
lesson_ids=['charge','divergence','curl']
summaries=['電荷收支、同圈兩曲面與位移電流。','從左右面差異，建立散度與散度定理。','從小圈環流，讀懂史托克斯與四條場方程。']
figids=['balance','surfaces','ramp','box','local','cancellation','curl-loop','stokes','four']
lessons=[]
for i,block in enumerate(re.split(r'^## ',source,flags=re.M)[1:]):
 title=block.splitlines()[0];chunks=re.split(r'^### ',block,flags=re.M)[1:];segments=[]
 for j,part in enumerate(chunks):
  heading,text=part.split('\n',1);checkpoint=(j+1)%3==0
  segments.append(dict(id=f'{P}-{i+1}-{j+1:02d}',title=re.sub(r'^\d+\. ','',heading),text=text.strip(),figure=f'{P}-{figids[i*3+j//3]}' if checkpoint else None,checkpoint=checkpoint,audioSrc=''))
 lessons.append(dict(id=f'{P}-{lesson_ids[i]}',title=title,summary=summaries[i],segments=segments))
colors={'mint':'#78e2ca','amber':'#ffc67b','blue':'#8db8ff','pink':'#ef9dbb'}
def text(x,y,t,cls='',anchor='start'):
 return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(str(t))}</text>'
def line(x1,y1,x2,y2,cls='axis',arrow=False):
 return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{cls}"'+(' marker-end="url(#CURRENT-'+cls.split()[0]+'-arrow)"' if arrow else '')+'/>'
def rect(x,y,w,h,cls='blue',dash=False):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" class="{cls}{" dash" if dash else ""}"/>'
def svg(fid,title,desc,body,height=500):
 defs=''.join(f'<marker id="{fid}-{c}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="{v}"/></marker>' for c,v in colors.items())
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {height}" role="img" aria-labelledby="{fid}-title {fid}-desc"><title id="{fid}-title">{escape(title)}</title><desc id="{fid}-desc">{escape(desc)}</desc><defs>{defs}</defs><rect width="600" height="{height}" fill="#111f30"/>'+body.replace('CURRENT',fid)+'</svg>'
def controls(id,label,lo,hi,step,value,reset):
 return f'<div class="phase-controls"><label for="{id}">{label}</label><input id="{id}" type="range" min="{lo}" max="{hi}" step="{step}" value="{value}"><output id="{id}-value" for="{id}"></output><button id="{reset}" type="button">回到預設</button><p id="{id}-why" aria-live="polite"></p></div>'
figures=[]
def add(suffix,title,subtitle,body,height,readouts,detail,extra='',desc=None):
 fid=P+'-'+suffix;idx=len(figures);look=lessons[idx//3]['segments'][(idx%3+1)*3-1]['text'].split('\n\n')[-1]
 figures.append(dict(id=fid,short=f'{idx+1:02d} '+title,title=title,subtitle=subtitle,look=look,diagram=svg(fid,title,desc or subtitle,body,height) if body else '',takeaways=''.join(f'<div class="takeaway"><span>{a}</span><strong>{b}</strong></div>' for a,b in readouts),detail=detail,extra=extra))
# 1 — 電荷收支，單純示意方向，不暗示場值比例。
b=rect(175,100,250,220,'blue',True)+line(30,205,200,205,'mint',True)+line(400,205,565,205,'amber',True)
b+=text(40,160,'流入 2 mA','mint-fill')+text(395,160,'流出 0.5 mA','amber-fill')+text(300,255,'電荷累積','big-text','middle')+text(300,295,'+1.5 mC/s','','middle')
b+=line(175,115,120,115,'blue',True)+text(75,85,'外法向 ←')+line(425,115,480,115,'blue',True)+text(430,85,'→ 外法向')
b+=text(40,375,'淨向外：0.5 − 2 = −1.5 mA')+text(40,425,'兩毫秒後：增加 3 μC')+text(40,475,'虛線是觀察盒；箭頭只示方向','muted-text')
add('balance','流入多了，裡面就累積','外法向一律朝外；流入在向外電流帳上記負。',b,510,[('淨向外電流','−1.5 mA'),('盒內增加率','+1.5 mC/s'),('持續 2 ms','增加 3 μC')],'<p class="equation">dQ內/dt = −∮ Jf · n dA</p><p>本圖是一般收支盒，不是下一圖電容的支路配置。傳統電流按正電荷輸運定義；金屬電子漂移方向可相反。來源：電磁學（中）13.1–13.3；圖解電磁學 17。</p><p>自我檢核：有累積時還能強迫每瞬間流入等於流出嗎？不能，必須保留存量變化。</p>')
# 2 — 同C兩曲面的剖面。
b=text(30,35,'同一個 C；S₁ 與 S₂ 只換曲面','big-text')
b+='<ellipse cx="125" cy="220" rx="22" ry="125" class="amber dash"/>'+line(125,95,125,345,'amber')
b+='<path d="M125 95 C245 35 430 35 440 100 L440 340 C430 405 245 405 125 345" class="mint dash"/>'
b+=line(25,220,330,220,'blue',True)+line(330,135,330,305,'pink')+line(510,135,510,305,'blue')
b+=line(350,185,420,185,'mint',True)+line(350,255,420,255,'mint',True)+text(350,220,'E、D →')
b+=text(70,70,'C')+text(65,385,'S₁：切引線','amber-fill')+text(385,430,'S₂：穿板間','mint-fill')+text(300,120,'正板 +')+text(485,120,'負板 −')+text(30,265,'I →','blue-fill')
b+=line(125,310,185,310,'amber',True)+line(440,310,490,310,'mint',True)+text(30,480,'S₁ 主要數傳導；S₂ 主要數位移')+text(30,525,'兩張面都計 Jf + ∂D/∂t','big-text')+text(30,570,'剖面示意，非真實尺寸比例','muted-text')
add('surfaces','同一個邊界，兩張面','虛線曲面共用 C；正向法線在引線／間隙皆朝右。',b,610,[('電容量 C','88.541878 pF'),('導線電流','88.541878 μA'),('板間位移電流','88.541878 μA')],'<p class="equation">∮ H · dl = ∫ (Jf + ∂D/∂t) · n dA<br>C = ε0 A/d；Id = ε0 A(dV/dt)/d = C dV/dt</p><p>A = 0.010 m²，d = 0.001 m，dV/dt = 10⁶ V/s；Jd = 0.0088541878128 A/m²。完整方程兩張面都積分兩項；「主要」是本準靜態理想圖的近似。真空沒有普通傳導電荷跨過間隙。來源：電磁學（中）13.1–13.3；圖解電磁學 17。</p>')
# 3 — 斜率與電流的直線。
b=text(30,35,'位移電流 Id（μA）')+line(85,270,555,270)+line(320,455,320,70)
for x,label in [(100,'−2'),(320,'0'),(540,'+2')]:b+=text(x,495,label,anchor='middle')
for y,label in [(90,'+177.08'),(270,'0'),(450,'−177.08')]:b+=text(20,420 if y==450 else y+7,label)
b+=line(95,430,100,450,'grid')
b+=line(100,450,540,90,'mint')+'<circle id="emmaxwell-ramp-dot" cx="430" cy="180" r="7" fill="#ffc67b"/>'
b+=text(145,545,'dV/dt（MV/s）')+'<g id="emmaxwell-ramp-direction"><line x1="360" y1="595" x2="460" y2="595" class="amber" marker-end="url(#CURRENT-amber-arrow)"/></g>'+text(30,600,'正方向 →')+text(30,650,'零斜率 ≠ 零電壓／零儲能','muted-text')
add('ramp','場有多大，和場變多快','固定瞬間 V = 10 V；改的是局部電壓斜率，非拖曳的快慢。',b,690,[('位移電流','<span id="emmaxwell-id">88.541878 μA</span>'),('瞬間端口功率','<span id="emmaxwell-power">0.885419 mW</span>'),('十伏特時儲能','4.427094 nJ')],'<p class="equation">Id = 88.541878128 × s μA<br>∂E/∂t = 10⁹ × s V/(m·s)<br>P = V Id；U = CV²/2</p><p>s 是以 MV/s 表示的斜率。負功率表示電容向外返能，儲能本身仍非負。差動探棒量 V(t)，取樣電阻量端口 I；不從兩條曲線宣稱重建全空間場。來源：電磁學（中）13；圖解電磁學 17。</p>',controls('emmaxwell-slope','電壓斜率 dV/dt（MV/s）',-2,2,.1,1,'emmaxwell-ramp-reset'))
# 4 — 不均勻與均勻場兩盒，箭頭長度同比例。
b=text(30,35,'E = 100x x̂；x 用 m')+rect(145,85,330,140,'blue',True)
b+=text(80,80,'x = 0')+text(410,80,'x = .5')+text(90,155,'E = 0')+line(310,180,360,180,'mint',True)+line(420,180,520,180,'mint',True)+text(260,130,'25')+text(445,130,'50 V/m')
b+=line(145,205,95,205,'amber',True)+line(475,205,525,205,'amber',True)+text(35,270,'左 0 + 右 1 + 側面 0 = 1 V·m')
b+=text(30,330,'對照：均勻 E = 50 V/m')+rect(145,370,330,140,'blue',True)+line(95,425,195,425,'mint',True)+line(425,425,525,425,'mint',True)
b+=text(60,475,'−1 V·m')+text(415,475,'+1 V·m')+text(35,555,'均勻場非零，但淨通量 = 0')+text(35,605,'面積 A = .02 m²；方向／盒形示意','muted-text')
add('box','左右兩面，要一起算','上：場隨位置增加；下：均勻場。場箭頭共同比例，外法向朝外。',b,650,[('上盒淨通量','1 V·m'),('上盒體積','0.01 m³'),('通量 ÷ 體積','100 V/m²')],'<p class="equation">Φ = (E右 − E左)A = (50 − 0)×.02 = 1 V·m<br>𝒱 = AL = .01 m³；Φ/𝒱 = 100 V/m²</p><p>上盒中點 x=.25 m 的場為25 V/m；箭頭長度與右面的50為1:2。四側面與場切向，所以通量為零。下盒左右通量等大反號。來源：電磁學（上）1；圖解電磁學 02。</p>')
# 5 — 盒長線性圖。
b=text(30,35,'淨通量 Φ（V·m）')+line(80,400,550,400)+line(80,400,80,80)
for y,v in [(400,0),(250,1),(100,2)]:b+=line(80,y,540,y,'grid')+text(35,y+7,v)
for x,v in [(80,0),(310,.5),(540,1)]:b+=text(x,445,v,anchor='middle')
b+=line(80,400,540,100,'mint')+'<circle id="emmaxwell-local-dot" cx="310" cy="250" r="7" fill="#ffc67b"/>'+text(330,490,'盒長 L（m）')
b+=text(30,550,'左面 x=0；A=.02 m² 固定')+text(30,600,'改觀察範圍，沒有改場的規則','muted-text')
add('local','總量隨盒長變，局部斜率留下','線性場 E = 100x x̂；這個有限盒比值恆定，是本例特性。',b,640,[('右面電場','<span id="emmaxwell-right-field">50 V/m</span>'),('淨通量','<span id="emmaxwell-flux">1 V·m</span>'),('盒子體積','<span id="emmaxwell-volume">0.010 m³</span>'),('散度','100 V/m²')],'<p class="equation">E右=100L；Φ=2L V·m；𝒱=.02L m³<br>∇·E=∂Ex/∂x+∂Ey/∂y+∂Ez/∂z=100 V/m²</p><p>一般光滑場需要縮小觀察盒才得到特定位置的局部散度；大盒通量除體積只是區域平均。本控制不允許零體積，不能做0/0。來源：電磁學（上）1；圖解電磁學 02。</p>',controls('emmaxwell-length','盒長 L（m）',.1,1,.1,.5,'emmaxwell-local-reset'))
# 6 — 共用面取消。
b=text(30,35,'切兩半：每個盒子都向外記帳')+rect(90,110,420,230,'blue',True)+line(300,110,300,340,'pink')
b+=line(265,175,330,175,'mint',True)+text(110,165,'+0.5','mint-fill')+line(335,260,270,260,'amber',True)+text(365,270,'−0.5','amber-fill')
b+=text(95,385,'x=0')+text(300,385,'.25',anchor='middle')+text(500,385,'.50',anchor='middle')+text(145,305,'左盒')+text(385,305,'右盒')
b+=text(35,440,'左盒：0 + 0.5 = 0.5 V·m')+text(35,490,'右盒：1 − 0.5 = 0.5 V·m')+text(35,540,'合併：內部 +0.5 與 −0.5 抵消')+text(35,595,'只剩外殼：0 + 1 = 1 V·m','big-text')
add('cancellation','共用面消掉，外殼留下','中間面同一個場，對左右盒的外法向剛好相反。幾何示意。',b,640,[('散度 × 體積','100 × .01 = 1 V·m'),('真空電荷密度','0.885419 nC/m³'),('盒內總電荷','8.854188 pC')],'<p class="equation">∮∂𝒱 E·n dA = ∫𝒱 (∇·E)d𝒱<br>ρ=ε0×100；Q=ρ×.01；Q/ε0=1 V·m</p><p>散度定理利用內部共用面抵消；需要場足夠平滑，點電荷奇點不可直接當普通可微場。磁高斯的∇·B=0不代表B=0。來源：電磁學（上）1；電磁學（中）8.2；圖解電磁學 02。</p>')
# 7 — 四條邊與完整G的三個取樣向量。
b=text(30,35,'G = (−10y, 10x, 0) V/m')+text(30,80,'數學輔助場；不是前堂靜電場','muted-text')
b+=rect(145,160,300,300,'blue')+line(185,460,260,460,'amber',True)+line(445,410,445,335,'amber',True)+line(400,160,325,160,'amber',True)+line(145,220,145,295,'amber',True)
b+=text(300,130,'上：+10 V',anchor='middle')+text(300,510,'下：0 V',anchor='middle')+text(465,310,'右')+text(465,345,'+10 V')+text(30,310,'左')+text(30,345,'0 V')
b+='<circle cx="300" cy="310" r="17" class="pink"/><circle cx="300" cy="310" r="5" fill="#ef9dbb"/>'+text(300,365,'+z 紙外',anchor='middle')
b+=line(445,460,445,390,'mint',True)+line(445,160,375,90,'mint',True)+line(145,160,75,160,'mint',True)
b+=text(30,560,'橘箭頭：路徑；綠箭頭：G')+text(30,610,'旋度 +20 ẑ V/m²；散度 0')+text(30,655,'座標 x、y 各 0..1 m；向量同比例','muted-text')
add('curl-loop','沿路投影，四邊一起算','逆時針路徑配 +z 法向；上邊場向左，路徑也向左，所以記正。',b,700,[('四邊環流','0 + 10 + 10 + 0 = 20 V'),('面積','1 m²'),('局部旋度','+20 ẑ V/m²')],'<p class="equation">(∇×G)z=∂Gy/∂x−∂Gx/∂y=10−(−10)=20 V/m²</p><p>右上角G=(−10,+10)V/m，完整箭頭斜向左上；線積分每邊只收切向分量。旋度的另外兩分量為零。原點位於左下角。此例場平滑，不宣稱它是靜電場。來源：電磁學（上）1；圖解電磁學 02。</p>')
# 8 — 小格繞向 arrows never represent field.
b=text(30,35,'每格 .5 m × .5 m；各 +5 V')+rect(100,110,400,400,'blue')+line(300,110,300,510,'blue')+line(100,310,500,310,'blue')
for cx,cy in [(200,210),(400,210),(200,410),(400,410)]:
 b+=text(cx,cy+8,'5 V',anchor='middle')+f'<path d="M{cx-55} {cy+55} H{cx+55} V{cy-55}" class="amber" marker-end="url(#CURRENT-amber-arrow)"/>'
 b+=f'<path d="M{cx+55} {cy-55} H{cx-55} V{cy+45}" class="amber" marker-end="url(#CURRENT-amber-arrow)"/>'
b+=line(287,260,287,175,'pink',True)+line(313,175,313,260,'pink',True)
b+=text(30,555,'粉紅：共用邊成對反走、抵消')+text(30,600,'4 × 5 V = 20 V','big-text')+text(30,645,'繞行箭頭不是場向量；法向皆 +z','muted-text')
add('stokes','內部邊抵消，外圈留下','每個小圈都逆時針；外圈留下的環流，等於面內旋度通量。',b,690,[('各小面積','0.25 m²'),('每小圈','20 × .25 = 5 V'),('整個外圈','20 V')],'<p class="equation">∮∂S G·dl = ∫S (∇×G)·n dA</p><p>史托克斯定理：內部共用邊的方向相反，線積分抵消。反走外圈時法向也必須反向。前堂散度定理消的是內部面，本堂消的是內部邊。來源：電磁學（上）1；圖解電磁學 02。</p>')
# 9 — HTML公式卡片手機直式，不將長式縮成微字。
equations=[('電通量帳','∮ D · n dA = Qf','∇ · D = ρf','封閉面 → 體內電荷；單位 C'),('磁通量帳','∮ B · n dA = 0','∇ · B = 0','封閉面淨磁通零；單位 Wb'),('電場環流帳','∮ E · dl','= −d/dt ∫ B · n dA','∇ × E = −∂B/∂t'),('磁場環流帳','∮ H · dl = ∫ Jf · n dA','+ d/dt ∫ D · n dA','∇ × H = Jf + ∂D/∂t')]
cards='<div class="maxwell-equations" role="group" aria-label="四條方程的積分與局部版本">'
for title,a,b,c in equations:
 cards+=f'<section><h4>{title}</h4><p class="equation">{a}<br>{b}</p><p>{c}</p></section>'
cards+='</div><p class="formula-main">後兩式：固定面，右手配對走向與法向。<br>電場環流單位 V；磁場強度環流單位 A。</p>'
add('four','兩個通量帳，兩個環流帳','積分與局部版本靠散度／史托克斯定理連起來；各塊向下讀。','',0,[('材料關係（線性等向）','D = εE；B = μH'),('普通線性傳導','Jf = σE'),('局部電荷守恆','∇·Jf + ∂ρf/∂t = 0')],'<p>第三塊先列積分式，再列旋度局部式；第四塊第二行仍屬積分式。面固定，場足夠平滑；需要的材料關係、來源與邊界條件另給，力另用羅倫茲式。</p><p class="equation">∇·(∇×H)=0<br>→ ∇·Jf+∂(∇·D)/∂t=0<br>→ ∇·Jf+∂ρf/∂t=0</p><p>混合偏導在光滑場成對抵消，使旋度的散度為零。單點量測無法直接驗完整環流或散度。來源：電磁學（中）13.3；圖解電磁學 02、17。</p>',cards)
(D/'lesson-data.js').write_text('/* 正文由完整口語稿.md同源產生。 */\nwindow.EMMAXWELL_AUDIO = '+json.dumps(dict(lessons=lessons,figures=figures),ensure_ascii=False,indent=2)+';\n')
(D/'audio-manifest.js').write_text('// 0/27 段；本輪不生成音檔，不借用 sample。\nwindow.EMMAXWELL_AUDIO_ASSETS = { segments: {} };\n')
js=(T/'audio-course.js').read_text().replace('EMFIELD','EMMAXWELL').replace('emfield-listening-v1','emmaxwell-listening-v1')
widget='''
  // 各圖獨立控制；初始圖形使用相同公式。
  function bounded(id,lo,hi,fallback){const el=$(id);const parsed=Number(el.value);const v=Number.isFinite(parsed)?Math.min(hi,Math.max(lo,parsed)):fallback;el.value=String(v);return v;}
  function ramp(){
    const s=bounded('emmaxwell-slope',-2,2,1),id=88.541878128*s;
    $('emmaxwell-slope-value').textContent=s.toFixed(1)+' MV/s';
    $('emmaxwell-id').textContent=id.toFixed(6)+' μA';
    $('emmaxwell-power').textContent=(id*.01).toFixed(6)+' mW';
    $('emmaxwell-ramp-dot').setAttribute('cx',String(320+110*s));
    $('emmaxwell-ramp-dot').setAttribute('cy',String(270-90*s));
    $('emmaxwell-ramp-direction').innerHTML=s===0?'<text x="350" y="600">Id = 0</text>':`<line x1="${s>0?360:460}" y1="595" x2="${s>0?460:360}" y2="595" class="amber" marker-end="url(#emmaxwell-ramp-amber-arrow)"/>`;
    $('emmaxwell-slope-why').textContent=s===0?'電壓暫不變，位移電流為零；十伏特電壓與儲能仍非零。':`電場變化率 ${(s*1e9).toExponential(2)} V/(m·s)；斜率${s>0?'正向，電源供能':'反向，電容返能'}，C 固定。`;
  }
  function local(){
    const l=bounded('emmaxwell-length',.1,1,.5);
    $('emmaxwell-length-value').textContent=l.toFixed(1)+' m';
    $('emmaxwell-right-field').textContent=(100*l).toFixed(0)+' V/m';
    $('emmaxwell-flux').textContent=(2*l).toFixed(2)+' V·m';
    $('emmaxwell-volume').textContent=(.02*l).toFixed(3)+' m³';
    $('emmaxwell-local-dot').setAttribute('cx',String(80+460*l));
    $('emmaxwell-local-dot').setAttribute('cy',String(400-300*l));
    $('emmaxwell-length-why').textContent='通量與體積同乘盒長，相除仍為 100 V/m²；這是固定線性場的特性，一般場需取局部極限。';
  }
  $('emmaxwell-slope').addEventListener('input',ramp);
  $('emmaxwell-ramp-reset').addEventListener('click',()=>{$('emmaxwell-slope').value='1';ramp();});
  $('emmaxwell-length').addEventListener('input',local);
  $('emmaxwell-local-reset').addEventListener('click',()=>{$('emmaxwell-length').value='.5';local();});
  ramp();local();
'''
js=js.replace('  const lessons=window.EMMAXWELL_AUDIO?.lessons||[];',widget+'\n  const lessons=window.EMMAXWELL_AUDIO?.lessons||[];')
(D/'audio-course.js').write_text(js)
css=(T/'audio-course.css').read_text()+'''\n/* 長方程保持直式與正常文字字級，不縮成手機上的微字。 */
.maxwell-equations{padding:18px 24px;display:grid;grid-template-columns:1fr;gap:14px}.maxwell-equations section{border:1px solid var(--line);border-radius:12px;padding:16px;min-width:0}.maxwell-equations h4{margin:0 0 10px;color:var(--mint);font-size:18px}.maxwell-equations p{margin:8px 0;overflow-wrap:anywhere}.maxwell-equations .equation{font-size:18px;line-height:1.9}.phase-controls output{display:block;margin:6px 0}.phase-controls button{margin:8px 0}.diagram svg text{font-size:24px}.diagram svg .muted-text{font-size:22px}.diagram svg .big-text{font-size:27px}@media(max-width:760px){.maxwell-equations{padding:16px}.maxwell-equations section{padding:12px}.maxwell-equations .equation{font-size:16px}.diagram svg text{font-size:24px}}
'''
(D/'audio-course.css').write_text(css)
h=(T/'index.html').read_text().replace('電場與電位・電磁學聽課室','位移電流與馬克士威・電磁學聽課室').replace('電磁學 / 邊玩邊聽 · 01','電磁學 / 邊玩邊聽 · 05').replace('電場這支箭頭，<br class="mobile-break">怎麼連到電位？','板間沒有電子穿過，<br class="mobile-break">電流帳怎麼接起來？').replace('從空間分量與作功，走到等位線與梯度。','從電荷守恆、散度與旋度，走到四條場方程。')
h=re.sub(r'<section class="further-reading">.*?</section>','<section class="further-reading"><h3>想再深入時</h3><p>本地來源：電磁學（上）第 1 章、電磁學（中）第 13 章。圖解頁提供更完整推導。</p><a href="../../圖解電磁學/dist/02-calculus.html">場的微積分 ↗</a><a href="../../圖解電磁學/dist/17-maxwell.html">馬克士威圖解 ↗</a></section>',h)
h=re.sub(r'<footer>.*?</footer>','<footer>真空電容準靜態模型 · 三堂二十七段 · 九次看圖停靠 · 尚無正式音檔</footer>',h)
(D/'index.html').write_text(h)
(D/'講稿來源.txt').write_text('正文唯一來源：完整口語稿.md；build-course.py轉存至lesson-data.js，無摘要替換。\n物理來源：../../08-電磁學-上.md 第1章、../../08-電磁學-中.md 第13章。\n深入來源：../../圖解電磁學/dist/02-calculus.html、17-maxwell.html。\n前端模板：../聽課-電場與電位/，namespace與storageKey獨立。\n2026-10-15：不安裝TTS、不生成音訊；音訊manifest 0/27。\n')
(D/'STATE.md').write_text('# 位移電流與馬克士威：製作狀態\n\n2026-10-15：三堂二十七段與九圖完成作者組裝；待獨立QA驗收，不能視為已驗收。\n\n正文漢字約4558／4457／4429；按每分鐘240–280字估時，等待另計。圖三、圖五各有一個獨立滑桿；圖九四方程採直式可分行。音檔0/27，未安裝TTS、未生成音訊、未啟動瀏覽器／服務、未commit／push。\n')
print('lessons',len(lessons),'figures',len(figures),'Han',[sum(len(re.findall('[\\u4e00-\\u9fff]',s['text'])) for s in l['segments']) for l in lessons])

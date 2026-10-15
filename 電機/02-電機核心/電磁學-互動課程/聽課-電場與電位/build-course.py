"""重建程式繪製 SVG 與播放器；正文以 lesson-data.js 為唯一來源。"""
from pathlib import Path
import re,json,html,math
D=Path(__file__).resolve().parent
T=D.parents[1]/'電路學-互動課程/聽課-暫態與微分方程'
E=D.parents[1]/'電子學-互動課程/聽課-單級放大與頻寬'
if (D/'lesson-data.js').exists():
    data=json.loads((D/'lesson-data.js').read_text().split(' = ',1)[1].rstrip(';\n'))
    lessons=data['lessons']
else:
    raw=(D/'完整口語稿.md').read_text()
    lessons=[]
    summaries=['從分量、疊加與投影，讀懂同一位置的場。','由沿路作功建立電位差，分清電位、位能與參考。','從等位線、局部斜率與梯度，找回電場方向。']
    for li,block in enumerate(re.split(r'^## ',raw,flags=re.M)[1:]):
        title,body=block.split('\n',1)
        seg=[]
        for si,part in enumerate(re.split(r'^### ',body,flags=re.M)[1:]):
            heading,text=part.split('\n',1)
            seg.append(dict(id=f'emfield-{li+1}-{si+1:02}',title=re.sub(r'^\d+\. ','',heading),text=text.strip(),figure=None,checkpoint=(si+1)%3==0,audioSrc=''))
        lessons.append(dict(id=f'emfield-lesson-{li+1}',title=title,summary=summaries[li],segments=seg))
colors={'mint':'#78e2ca','amber':'#ffc67b','blue':'#8db8ff','pink':'#ef9dbb'}
def txt(x,y,s,c='',anchor='start'):
    return f'<text x="{x}" y="{y}" class="{c}" text-anchor="{anchor}">{html.escape(str(s))}</text>'
def line(x1,y1,x2,y2,c='axis',arrow=False):
    mark=f' marker-end="url(#CURRENT-{c.split()[0]}-arrow)"' if arrow else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{c}"{mark}/>'
def dot(x,y,c='amber'):
    return f'<circle cx="{x}" cy="{y}" r="5" fill="{colors[c]}"/>'
def svg(id,title,body,h):
    defs=''.join(f'<marker id="{id}-{k}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="{v}"/></marker>' for k,v in colors.items())
    style='text{font-family:system-ui,sans-serif;fill:#eef3f6;font-size:22px}.axis{stroke:#71889b;stroke-width:1.5}.grid{stroke:#2a3d51;stroke-width:1}.dash{stroke-dasharray:6 5}.muted-text{fill:#a8b7c6}.big-text{font-size:26px;font-weight:650}'+''.join('.'+k+'{stroke:'+v+';fill:none;stroke-width:3}.'+k+'-fill{fill:'+v+'}' for k,v in colors.items())
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {h}" role="img" aria-labelledby="{id}-title"><title id="{id}-title">{html.escape(title)}</title><defs>{defs}</defs><style>{style}</style><rect width="600" height="{h}" fill="#111f30"/>{body.replace("CURRENT",id)}</svg>'
def take(a,b):return f'<div class="takeaway"><span>{a}</span><strong>{b}</strong></div>'
figures=[]
def add(id,title,subtitle,body,h,values,detail):
    i=len(figures); image=svg(id,title,body,h)
    (D/(id+'.svg')).write_text(image+'\n')
    seg=lessons[i//3]['segments'][(i%3+1)*3-1];seg['figure']=id
    figures.append(dict(id=id,short=f'{i+1:02} '+title.split('，')[0],title=title,subtitle=subtitle,look=seg['text'].split('\n\n')[-1],diagram=image,takeaways=''.join(take(*v) for v in values),detail=detail))
# 圖一：位置圖與向量圖各自採等比例，縱向分開。
b=txt(30,35,'位置（m）：O → P','muted-text')+line(110,255,445,255)+line(110,255,110,65)+line(110,255,245,75,'mint',True)+line(110,255,245,255,'blue')+line(245,255,245,75,'blue dash')+dot(110,255)+dot(245,75)+txt(75,290,'O')+txt(265,75,'P (.18, .24)')+txt(160,287,'.18 m')+txt(265,180,'.24 m')+txt(70,150,'.30 m')+txt(30,345,'電場（V/m）：同一支箭頭的分量','muted-text')+line(110,575,445,575)+line(110,575,110,375)+line(110,575,254,383,'mint',True)+line(110,575,254,575,'blue',True)+line(254,575,254,383,'blue dash')+txt(140,615,'60')+txt(275,490,'80')+txt(280,405,'|E| = 100')
add('emfield-vector','位置與電場，分開讀','上圖是位置公尺，下圖是場分量；每張圖內水平與鉛直同尺度。',b,650,[('位置距離','r = 0.30 m'),('電場分量','(60, 80) V/m'),('電場大小','100 V/m')],'<p>真空固定點電荷 Q = +1 nC，k ≈ 9.00 × 10⁹ N m²/C²，故 kQ = 9 V m。P = (.18, .24) m，r = √(.18² + .24²) = .30 m。</p><p class="equation">r̂ = (.6, .8)<br>E = (9/r²)r̂ = (60, 80) V/m</p><p>座標長度和場大小有不同單位，兩圖不能拿同一把尺互比。來源：08-電磁學-上.md 第 1、2 章；圖解電磁學 01、03。</p><p>自我檢核：改放負試驗電荷，反向的是什麼？答案：受力，來源建立的場不變。</p>')
# 圖二
b=txt(30,35,'位置（m）：兩源看同一個 P','muted-text')+line(140,235,410,235)+line(140,235,275,55,'blue dash')+line(410,235,275,55,'blue dash')+dot(140,235)+dot(410,235)+dot(275,55)+txt(110,275,'Q₁：O')+txt(350,275,'Q₂：(.36, 0)')+txt(300,62,'P')+txt(130,140,'.30 m')+txt(340,140,'.30 m')+txt(30,310,'場（V/m）：斜箭頭各 100','muted-text')+line(300,650,420,490,'mint',True)+line(300,650,180,490,'blue',True)+line(300,650,300,330,'amber',True)+line(180,490,420,490,'axis')+txt(430,480,'E₁')+txt(130,480,'E₂')+txt(325,380,'合場 160')+txt(305,690,'P','muted-text')+txt(70,730,'水平：60 − 60 = 0')+txt(70,770,'鉛直：80 + 80 = 160')
add('emfield-superposition','水平相消，鉛直留下','兩個正來源各 +1 nC；下圖所有場箭頭每 1 V/m 畫 2 單位長。',b,810,[('第一來源','(60, 80) V/m'),('第二來源','(−60, 80) V/m'),('合場','(0, 160) V/m')],'<p>Q₂ = +1 nC 位於 (.36, 0) m，從 Q₂ 指向 P 的位移為 (−.18, .24) m。兩源距 P 都是 .30 m。</p><p class="equation">E₂ = (−60, 80) V/m<br>E₁ + E₂ = (0, 160) V/m</p><p>來源固定且不重新分布，才可直接沿用各自的原貢獻。圖一、三以及後兩堂皆只保留 Q₁。來源：08-電磁學-上.md 第 2 章；圖解電磁學 03。</p><p>自我檢核：為何不是 200？答案：水平分量相消，只有鉛直相加。</p>')
# 圖三左右面板與文字分區
b=txt(25,40,'沿 +x 讀 60','big-text')+txt(325,40,'沿 E 讀 100','big-text')
for ox in [55,345]:
    b+=line(ox,300,ox+200,300)+line(ox,300,ox+144,108,'mint',True)
b+=line(55,300,199,300,'amber',True)+line(199,300,199,108,'blue dash')+line(345,300,489,108,'amber dash',True)+txt(110,340,'60')+txt(365,125,'100')+txt(45,400,'同一個 E = (60, 80) V/m')+txt(45,455,'沿 −x：−60 V/m')+txt(45,500,'沿垂直 E 的方向：0 V/m')
add('emfield-projection','同一個場，換方向讀','已撤去第二來源；兩面板場箭頭同尺度。右圖橘色軸與綠色場箭頭重合。',b,545,[('沿 +x','60 V/m'),('沿場方向','100 V/m'),('垂直方向','0 V/m')],'<p class="equation">E · û = |E| cos θ<br>û = (.6, .8)：60 × .6 + 80 × .8 = 100<br>û = (−.8, .6)：−48 + 48 = 0</p><p>探測軸換向只改讀值，不改來源與場。圖中向量皆為 V/m，沒有粒子實際運動軌跡。來源：08-電磁學-上.md 第 1 章；圖解電磁學 01。</p><p>自我檢核：單軸讀到零能否判定無場？答案：不能，可能只選到垂直方向。</p>')
# 共用函數曲線
x=lambda r:80+(r-.25)/.4*440
def curve(fn,y,start=.25,end=.65):return ' '.join(('M' if i==0 else 'L')+f'{x(r):.3f},{y(fn(r)):.3f}' for i in range(161) for r in [start+(end-start)*i/160])
def axes(y,yticks,unit):
    b=txt(45,35,unit,'muted-text')+line(80,350,535,350)+line(80,350,80,55)
    for r in [.3,.45,.6]:b+=line(x(r),55,x(r),350,'grid')+txt(x(r),385,f'{r:.2f}',anchor='middle')
    for v in yticks:b+=line(80,y(v),520,y(v),'grid')+txt(68,y(v)+7,v,anchor='end')
    return b+txt(530,425,'半徑 r（m）',anchor='end')
y=lambda e:350-e*1.95
b=axes(y,[0,25,100],'電場 Eᵣ（V/m）')
area=curve(lambda r:9/r**2,y,.3,.6)+f' L{x(.6)},350 L{x(.3)},350 Z'
b+=f'<path d="{area}" fill="#78e2ca33"/><path d="{curve(lambda r:9/r**2,y)}" class="mint"/>'+dot(x(.3),y(100))+dot(x(.6),y(25))+txt(155,125,'A：100')+txt(380,275,'B：25')+txt(210,315,'面積 15 V','big-text')
add('emfield-work','沿路相加，面積是十五伏特','單源、沿徑向 A (.30 m) → B (.60 m)；曲線由 9/r² 計算。',b,460,[('場線積分','+15 V'),('正 1 pC 場功','+15 pJ'),('電位差 ΔV','−15 V')],'<p class="equation">∫₀.₃⁰.⁶ 9/r² dr = [−9/r]₀.₃⁰.⁶ = 15 V<br>W場 = qₜ ∫E · dl = +15 pJ<br>ΔV = −15 V；ΔU = qₜ ΔV = −15 pJ</p><p>準靜態、動能不變且沒有耗散時，外力功才等於 ΔU = −15 pJ。此圖橫軸是位置而非時間。來源：08-電磁學-上.md 第 4 章；圖解電磁學 02、06。</p><p>自我檢核：用起點 100 乘 .30 m 為何高估？答案：沿路場持續變弱。</p>')
# 路徑：1m=500畫布單位，順逆時針依 SVG y軸處理
b=txt(30,35,'甲 A → 乙 B：兩條路，同端點','muted-text')+line(110,420,490,420)+line(110,420,110,55)+dot(110,420)+txt(70,455,'O')
b+=f'<path d="M260 420 A150 150 0 0 0 110 270" class="blue" marker-end="url(#CURRENT-blue-arrow)"/>'+line(110,270,110,120,'blue',True)+f'<path d="M110 120 A300 300 0 0 1 410 420" class="blue" marker-end="url(#CURRENT-blue-arrow)"/>'+line(260,420,410,420,'mint',True)
for px,py in [(260,420),(410,420),(110,270),(110,120)]:b+=dot(px,py)
b+=txt(235,465,'甲 A')+txt(400,465,'乙 B')+txt(25,285,'丙 C')+txt(25,125,'丁 D')+txt(160,325,'0 V')+txt(335,200,'0 V')+txt(125,210,'+15 V')+txt(280,395,'+15 V')+txt(45,520,'A (.30, 0) → B (.60, 0)')+txt(45,560,'C (0, .30) → D (0, .60)')+txt(45,600,'座標單位 m；兩弧以 O 為圓心')
add('emfield-path','同端點，兩條路','綠色直路與藍色弧—徑—弧路徑方向都由甲到乙；空間座標等比例。',b,645,[('甲 → 乙直路','15 V'),('甲 → 丙 → 丁 → 乙','0 + 15 + 0 = 15 V')],'<p>圓弧小位移與徑向電場垂直，所以兩弧的 E · dl 均為零；中間徑向段與直路穿過同樣半徑範圍，積分均為 +15 V。</p><p>固定電荷的靜電場路徑無關；路徑不穿過源的奇異位置。時變磁場所生的感應電場不能直接套用這個結論。來源：08-電磁學-上.md 第 4 章；圖解電磁學 06。</p><p>自我檢核：繞遠有沒有多作功？答案：沒有，圓弧路長增加但沿場投影為零。</p>')
# 同尺度柱圖：每伏特 6 px，零線 300
b=txt(30,35,'電位 V（V）：兩組共用縱軸刻度','muted-text')
for v in [-5,0,15,30]:b+=line(65,300-6*v,550,300-6*v,'axis' if v==0 else 'grid')+txt(55,307-6*v,v,anchor='end')
for xx,v,c in [(110,30,'mint'),(205,15,'blue'),(355,10,'mint'),(450,-5,'blue')]:
    yy=min(300,300-6*v);b+=f'<rect x="{xx}" y="{yy}" width="55" height="{abs(v)*6}" fill="{colors[c]}" opacity=".65"/>'+txt(xx+27,yy-15 if v>=0 else 365,v,anchor='middle')+txt(xx+27,405,'甲 A' if c=='mint' else '乙 B',anchor='middle')
b+=txt(175,455,'V∞ = 0',anchor='middle')+txt(420,455,'全部減 20 V',anchor='middle')+txt(300,510,'ΔV：15 − 30 = −5 − 10 = −15 V',anchor='middle')
add('emfield-reference','換零點，差值不變','左組 30 / 15 V；右組 10 / −5 V。右側負柱從零線向下。',b,550,[('電位共同平移','V新 = V舊 − 20 V'),('電位差保留','ΔV = −15 V'),('正 1 pC 位能差','ΔU = −15 pJ')],'<p>共同加減常數不改電位差，也不改場。不能只改某一點；改變的是整張地圖的參考。</p><p>換成負 1 pC 試驗電荷，ΔV 仍為 −15 V，但 ΔU = +15 pJ、W場 = −15 pJ。電位不依賴試驗電荷，位能則依賴。來源：08-電磁學-上.md 第 4 章；圖解電磁學 06。</p><p>自我檢核：乙點變 −5 V，場是否反向？答案：不會，共同平移保留所有局部差異。</p>')
# 等位圓，角度分散標籤，半徑比例固定
b=txt(30,35,'等差電位，每跨一圈差 5 V','muted-text')
for rad,c in [(.3,'mint'),(.36,'blue'),(.45,'amber'),(.6,'pink')]:b+=f'<circle cx="300" cy="300" r="{rad*360}" class="{c}"/>'
b+=dot(300,300)+txt(300,335,'Q',anchor='middle')
for ang in [45,225]:
    a=math.radians(ang);b+=line(300+145*math.cos(a),300-145*math.sin(a),300+195*math.cos(a),300-195*math.sin(a),'mint',True)
for i,(c,v,r) in enumerate([('mint',30,'.30'),('blue',25,'.36'),('amber',20,'.45'),('pink',15,'.60')]):
    yy=575+i*42
    b+=line(45,yy-7,95,yy-7,c)+txt(115,yy,f'{v} V  →  r = {r} m',c+'-fill')
b+=txt(30,765,'由內向外；間距 .06 / .09 / .15 m')+txt(30,810,'箭頭只示方向；不代表場強大小')
add('emfield-contours','等差電位，間距透露場強','平面剖面的四個等位圓依真實半徑比例；空間中的等位面是球面。',b,850,[('近源 r = .30 m','E = 100 V/m'),('遠處 r = .60 m','E = 25 V/m')],'<p class="equation">V = 9/r → r = 9/V<br>30 / 25 / 20 / 15 V 對應 .30 / .36 / .45 / .60 m</p><p>三段平均徑向場為 5/.06 ≈ 83.3、5/.09 ≈ 55.6、5/.15 ≈ 33.3 V/m。有限間隔所得是區段平均，不是端點局部值；相鄰線電位差相同時，疏密才可比較。來源：08-電磁學-上.md 第 4 章；圖解電磁學 06。</p><p>自我檢核：沿圓走電位不變，為何仍有場？答案：切向分量為零，徑向分量仍存在。</p>')
# 電位曲線與由公式生成的切線割線
yp=lambda v:350-v*7.5
b=axes(yp,[0,15,30],'電位 V（V）')+f'<path d="{curve(lambda r:9/r,yp)}" class="mint"/>'+f'<path d="{curve(lambda r:30-50*(r-.3),yp,.3,.6)}" class="blue dash"/>'+f'<path d="{curve(lambda r:30-100*(r-.3),yp,.26,.43)}" class="amber"/>'+dot(x(.3),yp(30))+dot(x(.6),yp(15))+txt(145,90,'A')+txt(480,215,'B')+txt(55,475,'橘色切線：−100 V/m')+txt(55,515,'藍色割線：−50 V/m')
add('emfield-slope','平均斜率與局部斜率','綠線 V = 9/r；切線只在 A 附近畫出。電場是電位斜率的反號。',b,555,[('A → B 平均場','50 V/m'),('A → .33 m 平均場','90.909 V/m'),('A → .303 m 平均場','99.010 V/m')],'<p class="equation">割線：V = 30 − 50(r − .30)<br>A 點切線：V = 30 − 100(r − .30)<br>dV/dr = −9/r²；Eᵣ = −dV/dr = 9/r²</p><p>有限差分為 [V(.30) − V(.30+h)]/h。h=.03 得 90.909；h=.003 得 99.010 V/m，靠近 A 的局部值 100。切線是局部近似，不能延伸當真實全域電位。來源：08-電磁學-上.md 第 1、4 章；圖解電磁學 02、06。</p><p>自我檢核：用 A、B 電位差求出的 50 是否等於 A 的場？答案：不是，它是整段平均。</p>')
# 梯度向量：E/grad同尺度，切向(-.8,.6)，直角標誌。
b=txt(30,35,'P 附近的向量圖（V/m）','muted-text')+line(130,315,500,315)+line(300,510,300,100)+line(300,315,420,155,'mint',True)+line(300,315,180,475,'amber',True)+line(156,207,444,423,'blue dash')+line(300,315,420,315,'mint dash')+line(420,315,420,155,'mint dash')+line(300,315,180,315,'amber dash')+line(180,315,180,475,'amber dash')+dot(300,315)+txt(430,155,'E')+txt(135,500,'∇V')+txt(340,350,'+60')+txt(440,255,'+80')+txt(180,290,'−60')+txt(100,405,'−80')+txt(65,170,'切向')+txt(312,300,'P')
# u=(.6,-.8), t=(-.8,-.6), right-angle corner at P + u*18 + t*18
b+=f'<path d="M310.8 300.6 L296.4 289.8 L285.6 304.2" class="blue"/>'+txt(30,555,'E = (60, 80)；∇V = (−60, −80)')+txt(30,600,'切向 u = (−.8, .6)：∇V · u = 0')+txt(30,645,'P 是觀測點；不是來源位置 O')
add('emfield-gradient','梯度向高，電場向低','兩支向量等長反向；藍色短線是局部切向。向量圖不拿來量來源距離。',b,685,[('電位梯度','(−60, −80) V/m'),('電場','(60, 80) V/m'),('切向電位變化率','0 V/m')],'<p class="equation">V(x,y) = 9/√(x²+y²)<br>∂V/∂x = −9x/(x²+y²)^(3/2)<br>∂V/∂y = −9y/(x²+y²)^(3/2)<br>P=(.18,.24) m：∇V=(−60,−80) V/m<br>E = −∇V</p><p>沿單位方向 û 的電位變化率為 ∇V · û。沿梯度為 +100，沿電場為 −100 V/m；切向只在當地的一階變化率為零，沿直切線走遠後未必等位。場箭頭和梯度每 1 V/m 都畫 2 單位長。來源：08-電磁學-上.md 第 1、4 章；圖解電磁學 01、02、06。</p><p>自我檢核：電場為何朝低電位？答案：正試驗電荷沿場受力、場作正功，位能降低。</p>')
# 保持原正文，只有播放器與圖面補齊。
(D/'lesson-data.js').write_text('window.EMFIELD_AUDIO = '+json.dumps(dict(lessons=lessons,figures=figures),ensure_ascii=False,indent=2)+';\n')
md='# 電場與電位｜完整口語稿\n\n正文由 lesson-data.js 同源輸出。三堂各九段，每堂第三、六、九段看圖停靠；以每分鐘 240–280 可說漢字估算約 16–19 分鐘，等待另計。尚無正式音檔；成品驗收狀態見驗收紀錄.md。\n\n'
for lesson in lessons:
    md+='## '+lesson['title']+'\n\n'
    for i,s in enumerate(lesson['segments']):md+=f'### {i+1}. '+s['title']+'\n\n'+s['text']+'\n\n'
(D/'完整口語稿.md').write_text(md.rstrip()+'\n')
# 取成熟播放器通用渲染及狀態機。
src=(T/'audio-course.js').read_text();render=src[src.index("  $('figures').innerHTML"):src.index('  function updateInitial')];player=src[src.index('  const lessons='):]
js="(() => {\n  'use strict';\n  const $=id=>document.getElementById(id);\n  const figures=window.EMFIELD_AUDIO?.figures||[];\n"+render+player
js=js.replace("behavior:'smooth'","behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'")
js=js.replace('CIRCUIT_AUDIO','EMFIELD_AUDIO').replace('circuit-audio-transient-v1','emfield-listening-v1')
(D/'audio-course.js').write_text(js)
(D/'audio-manifest.js').write_text('// 正式音檔尚未製作；無 sample，不自動發聲。\nwindow.EMFIELD_AUDIO_ASSETS = { segments: {} };\n')
css=(T/'audio-course.css').read_text()+'\n/* 電磁圖使用各圖內統一刻度；標籤維持固定尺寸，手機等比例縮放。 */\n.diagram svg text{font-size:22px}.diagram svg .big-text{font-size:26px}.diagram svg .muted-text{font-size:22px}.figure-tabs button{overflow-wrap:anywhere}.diagram svg{overflow:hidden}.figure-head,.figure-details{overflow-wrap:anywhere}\n'
(D/'audio-course.css').write_text(css)
h=(E/'index.html').read_text().replace('單級放大與頻寬・電子學聽課室','電場與電位・電磁學聽課室').replace('← 電子學課程','← 電磁學課程').replace('電子學 / 邊玩邊聽 · 06','電磁學 / 邊玩邊聽 · 01').replace('小電流變動，<br class="mobile-break">怎麼放大成電壓？','電場這支箭頭，<br class="mobile-break">怎麼連到電位？').replace('從共源放大與負載，走到電容、頻寬與相位。','從空間分量與作功，走到等位線與梯度。')
h=re.sub(r'<section class="further-reading">.*?</section>','<section class="further-reading"><h3>想再深入時</h3><p>本課模型：真空固定點電荷，微小試驗電荷不擾動來源。內容對應本地筆記第 1、2、4 章。</p><a href="../../圖解電磁學/dist/01-vectors.html">向量圖解 ↗</a><a href="../../圖解電磁學/dist/02-calculus.html">場的微積分 ↗</a><a href="../../圖解電磁學/dist/03-coulomb.html">庫侖定律 ↗</a><a href="../../圖解電磁學/dist/06-potential.html">電位圖解 ↗</a><a href="../../08-電磁學-上.md">電磁學筆記（第 1、2、4 章）↗</a><a href="完整口語稿.md">完整口語稿 ↗</a></section>',h)
h=re.sub(r'<footer>.*?</footer>','<footer>真空固定點電荷 · k ≈ 9.00 × 10⁹ N m²/C² · 三堂二十七段 · 九次看圖停靠 · 尚無正式音檔</footer>',h)
(D/'index.html').write_text(h)
print('課程與正文漢字：',[(l['id'],sum(len(re.findall(r'[\u4e00-\u9fff]',s['text'])) for s in l['segments'])) for l in lessons]);print('SVG:',len(figures))

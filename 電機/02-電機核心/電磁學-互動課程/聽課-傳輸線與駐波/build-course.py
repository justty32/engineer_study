"""從講稿來源.txt 生成同源正文、SVG 與 lesson-data；播放器沿用本地成熟模板。"""
from pathlib import Path
import re,json,math,html
D=Path(__file__).resolve().parent
T=D.parent/'聽課-電場與電位'
raw=(D/'講稿來源.txt').read_text(encoding='utf-8')
lessons=[]
names=['distributed','reflection','impedance']
summaries=['保留位置與時間，從分佈儲能看速度、阻抗與延遲。','用負載邊界決定反射，分清包絡、瞬時值與功率。','移動參考面，從相位旋轉理解同一負載的不同輸入阻抗。']
for li,block in enumerate(re.split(r'^## ',raw,flags=re.M)[1:]):
    title,body=block.split('\n',1);segments=[]
    for si,part in enumerate(re.split(r'^### ',body,flags=re.M)[1:]):
        heading,body=part.split('\n',1)
        segments.append(dict(id=f'emline-{li+1}-{si+1:02}',title=re.sub(r'^\d+\. ','',heading),text=body.strip(),figure=None,checkpoint=(si+1)%3==0,audioSrc=''))
    lessons.append(dict(id='emline-'+names[li],title=title,summary=summaries[li],segments=segments))
C={'mint':'#78e2ca','amber':'#ffc67b','blue':'#8db8ff','pink':'#ef9dbb','axis':'#71889b'}
def txt(x,y,s,cl='',anchor='start'):
    return f'<text x="{x}" y="{y}" class="{cl}" text-anchor="{anchor}">{html.escape(str(s))}</text>'
def line(x1,y1,x2,y2,c='axis',arrow=False):
    mark=f' marker-end="url(#CURRENT-{c.split()[0]}-arrow)"' if arrow else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{c}"{mark}/>'
def path(d,c='mint',arrow=False):
    mark=f' marker-end="url(#CURRENT-{c.split()[0]}-arrow)"' if arrow else ''
    return f'<path d="{d}" class="{c}"{mark}/>'
def circ(x,y,r,c='mint'):
    return f'<circle cx="{x}" cy="{y}" r="{r}" class="{c}"/>'
def dot(x,y,c='amber'):
    return f'<circle cx="{x}" cy="{y}" r="5" fill="{C[c]}"/>'
def zsign(x,y,out=True,c='blue'):
    return circ(x,y,12,c)+(dot(x,y,c) if out else line(x-7,y-7,x+7,y+7,c)+line(x-7,y+7,x+7,y-7,c))
def svg(id,title,desc,b,h):
    defs=''.join(f'<marker id="{id}-{k}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="{v}"/></marker>' for k,v in C.items())
    style='text{font-family:system-ui,sans-serif;fill:#eef3f6;font-size:24px}.dash{stroke-dasharray:7 6}.muted-text{fill:#a8b7c6}.big-text{font-size:28px;font-weight:650}'+''.join('.'+k+'{stroke:'+v+';fill:none;stroke-width:3}.'+k+'-fill{fill:'+v+'}' for k,v in C.items())
    return f'<svg id="{id}-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {h}" role="img" aria-labelledby="{id}-title {id}-desc"><title id="{id}-title">{html.escape(title)}</title><desc id="{id}-desc">{html.escape(desc)}</desc><defs>{defs}</defs><style>{style}</style><rect width="600" height="{h}" fill="#111f30"/>{b.replace("CURRENT",id)}</svg>'
figures=[]
def add(id,title,subtitle,b,h,values,detail,extra=''):
    i=len(figures);id='emline-'+id;seg=lessons[i//3]['segments'][(i%3+1)*3-1];seg['figure']=id
    drawing=svg(id,title,subtitle,b,h);(D/(id+'.svg')).write_text(drawing+'\n',encoding='utf-8')
    take=''.join(f'<div class="takeaway"><span>{a}</span><strong>{b}</strong></div>' for a,b in values)
    figures.append(dict(id=id,short=f'{i+1:02} '+title.split('，')[0],title=title,subtitle=subtitle,look=seg['text'].split('\n\n')[-1],diagram=drawing,takeaways=take,detail=detail,extra=extra))
def detail(eq,body,check,chapter='17'):
    return f'<p class="equation">{eq}</p><p>{body}</p><p>來源：本地《電磁學（下）》第 {chapter} 章；圖解電磁學第 23／24 章。</p><p>自我檢核：{check}</p>'
# 共用數值曲線，軸與資料同一轉換。
def points(fn,x,y,start,end,n=180):
    return ' '.join(('M' if i==0 else 'L')+f'{x(v):.3f},{y(fn(v)):.3f}' for i in range(n+1) for v in [start+(end-start)*i/n])
def axes(x,y,xticks,yticks,xlabel,ylabel,left=90,right=540,top=100,bottom=400):
    b=txt(30,45,ylabel)+line(left,bottom,right+15,bottom)+line(left,bottom,left,top)
    for val,label in xticks:b+=line(x(val),top,x(val),bottom,'axis dash')+txt(x(val),bottom+40,label,anchor='middle')
    for val,label in yticks:b+=line(left,y(val),right,y(val),'axis dash')+txt(left-15,y(val)+8,label,anchor='end')
    return b+txt(right,bottom+85,xlabel,anchor='end')
# 1：完整去回兩線，微段等效儲能。
b=txt(30,40,'Δz = .10 m；分佈場的等效小段')+line(80,170,235,170,'mint')+line(305,170,520,170,'mint')+f'<rect x="235" y="150" width="70" height="40" class="amber"/>'+line(80,360,520,360,'blue')+path('M80 170 V360','axis dash')+path('M520 170 V360','axis dash')+line(380,170,380,245,'amber')+line(350,245,410,245,'amber')+line(350,270,410,270,'amber')+line(380,270,380,360,'amber')+line(110,170,185,170,'mint',True)+line(430,170,500,170,'mint',True)+line(440,360,130,360,'blue',True)+txt(100,115,'i(z) →')+txt(390,115,'i(z+Δz) →')+txt(215,220,'L = 25 nH')+txt(420,270,'C')+txt(420,310,'10 pF')+txt(100,260,'+ v(z)')+txt(100,310,'−')+txt(30,420,'上對下定義電壓；下導體完整回流')+txt(30,475,'右端電壓：v(z + Δz)，同極性')+txt(30,530,'L′ = 250 nH/m；C′ = 100 pF/m')+txt(30,585,'R′ = 0；G′ = 0（無損近似）')+txt(30,640,'虛線連至其餘回路；不是未知接地')
add('cell','每米參數乘小段長度','上導體向右為電流正向，下導體回流；電容跨兩導體。這是連續場儲能的等效切片，不是電纜內藏離散元件。',b,685,[('串聯回路電感','L′Δz = 25 nH'),('跨線電容','C′Δz = 10 pF')],detail('∂v/∂z = −L′ ∂i/∂t<br>∂i/∂z = −C′ ∂v/∂t','小段電感壓降與電容充電來自 KVL／KCL。虛線是外部回路延續示意，不是讓模型短路。H/m × m = H；F/m × m = F。','R′ = 0 是否代表沒有延遲？不是，L′、C′ 仍非零。'))
# 2：同相波正規化與能流。
x=lambda u:90+450*u;y=lambda v:230-100*v
b=axes(x,y,[(0,'0'),(.5,'½'),(1,'1')],[(-1,'−1'),(0,'0'),(1,'1')],'位置 z/λ','正規化瞬時 v/3 與 i/.060',top=110,bottom=350)
b+=path(points(lambda u:math.cos(2*math.pi*u),x,y,0,1),'mint')+path(points(lambda u:math.cos(2*math.pi*u),x,y,0,1),'blue dash')+txt(30,480,'綠 v/3；藍 i/.060（同相重合）')+line(100,535,480,535,'amber',True)+txt(150,580,'能流沿 +z；P⁺ = .090 W')+txt(30,640,'V⁺ = 3 V peak；I⁺ = .060 A peak')+txt(30,695,'平均電場能：225 pJ/m')+txt(30,740,'平均磁場能：225 pJ/m')+txt(30,795,'450 pJ/m × 2×10⁸ m/s = .090 W')
add('travel','五十歐姆是行波比例','僅向前波，兩曲線先各除自己的峰值後重合；縱軸無單位。能流箭頭只示方向。無損線仍有特性阻抗。',b,840,[('特性阻抗','Z₀ = √(L′/C′) = 50 Ω'),('速度','vp = 1/√(L′C′) = 2×10⁸ m/s')],detail('P⁺ = |V⁺|²/(2Z₀) = .090 W<br>⟨u′E⟩ = C′|V⁺|²/4 = 225 pJ/m<br>⟨u′H⟩ = L′|I⁺|²/4 = 225 pJ/m','用峰值相量；平均功率有 1/2，平均儲能有 1/4。規範化曲線不是宣稱伏特與安培同量綱。','50 Ω 是否是銅線直流電阻？不是，本例 R′ = 0。'))
# 3：長度的單程直線。
x=lambda length:90+45*length;y=lambda td:400-6*td
b=axes(x,y,[(0,'0'),(2,'2'),(4,'4'),(10,'10')],[(0,'0'),(10,'10'),(20,'20'),(50,'50')],'線長 ℓ（m）','單程延遲 td（ns）',top=100,bottom=400)+path(points(lambda length:5*length,x,y,0,10),'mint')+f'<circle id="emline-delay-dot" cx="180" cy="340" r="7" fill="#ffc67b"/>'+f'<text id="emline-delay-reading" x="30" y="545">2 m：單程 10 ns；往返 20 ns</text>'+txt(30,600,'Z₀ = 50 Ω；vp 不隨線長改變')+txt(30,655,'tr = 2 ns → 前緣長 .40 m')+txt(30,710,'20 ns 回波 → 距離 2 m（除以二）')
extra='<div class="line-lab"><label for="emline-length">線長 ℓ（m）</label><input id="emline-length" type="range" min="0" max="10" step="0.5" value="2"><output id="emline-length-output" for="emline-length"></output><button id="emline-delay-reset" type="button">重設線長</button><p id="emline-delay-why" role="status"></p></div>'
add('delay','每多一米，多等五奈秒','線長控制單程與往返時間，零長度只表示數學極限。曲線以 td = 5ℓ ns 計算，兩端量測與同端回波須分清。',b,755,[('單程','td = ℓ/vp = 5ℓ ns'),('往返','2td = 10ℓ ns')],detail('TDR 距離 = vp × 回波時間 / 2','兩奈秒前緣在本線佔 .4 m，小於預設兩米線；不能視處處同時。允許誤差與波形仍須個別判斷。','只量延遲能否證明線為 50 Ω？不能，速度看 L′C′，阻抗看 L′/C′。'),extra)
# 4：邊界與功率。
b=txt(30,40,'負載 z = 0；線在 z ≤ 0')+line(80,180,500,180,'axis')+line(80,330,500,330,'blue')+line(500,180,500,215)+f'<rect x="480" y="215" width="40" height="65" class="amber"/>'+line(500,280,500,330)+line(80,180,80,330,'axis dash')+line(130,120,390,120,'mint',True)+line(390,270,130,270,'pink',True)+txt(130,90,'V⁺ = 3 V；I⁺ = +.060 A')+txt(120,235,'V⁻ = 1 V；I⁻ = −.020 A')+txt(320,390,'負載 RL = 100 Ω')+txt(30,445,'VL = 4 V；IL = .040 A → +z')+txt(30,500,'箭頭：波傳播方向；I 參考固定 +z')
for row,(label,val,col) in enumerate([('入射 →',.09,'mint'),('反射 ←',.01,'pink'),('負載',.08,'amber')]):
 yy=560+row*80;b+=txt(30,yy+25,label)+f'<rect x="160" y="{yy}" width="{val/.09*300}" height="30" fill="{C[col]}"/>'+txt(470,yy+25,f'{val*1000:.0f} mW')
b+=txt(30,840,'9 : 1 : 8 功率條，同一尺度')
add('boundary','反射電流負號要保留','峰值相量：入射向 +z、反射向 −z；電流參考始終 +z。負載接回下導體，功率條長度共用比例。',b,880,[('負載比例','4 V / .040 A = 100 Ω'),('平均功率','90 − 10 = 80 mW')],detail('ΓL = (100−50)/(100+50) = 1/3<br>V− = 3ΓL = 1 V；I− = −V−/50 = −.020 A<br>PL = VL IL / 2 = .080 W','電壓反射比 1/3 對應功率反射比 1/9；反射功率大小 .010 W，有向功率沿 −z。','若漏電流負號會得到什麼？4 V/.080 A=50 Ω，不符負載。'))
# 5：負載滑桿；figure ID 與控制 ID 分開。
x=lambda q:90+(q+.5)*900;y=lambda v:400-v*50
b=axes(x,y,[(-.5,'−½'),(-.25,'−¼'),(0,'0')],[(0,'0'),(2,'2'),(4,'4'),(6,'6')],'位置 z/λ（負載在 0）','電壓峰值包絡 |V|（V）',top=100,bottom=400)+f'<path id="emline-load-curve" d="{points(lambda q:math.sqrt(10+6*math.cos(4*math.pi*q)),x,y,-.5,0)}" class="mint"/>'+txt(30,545,'每一點是時間峰值；不是瞬時波形')+f'<text id="emline-load-reading" x="30" y="595">RL = 100 Ω；Γ = .333；VSWR = 2</text>'+f'<text id="emline-load-limits" x="30" y="645">Vmax = 4 V；Vmin = 2 V</text>'
extra='<div class="line-lab"><label for="emline-load">負載電阻 RL（Ω）</label><input id="emline-load" type="range" min="0" max="200" step="5" value="100"><output id="emline-load-output" for="emline-load"></output><button id="emline-load-reset" type="button">重設負載</button><p id="emline-load-why" role="status"></p></div>'
add('load-figure','改負載，改變反射與包絡','固定 Z₀=50 Ω、V⁺=3 V peak、λ=2 m。滑桿 200 Ω 是有限電阻，不是開路；短路顯示 VSWR = ∞。',b,690,[('電壓包絡','3√[1+Γ²+2Γ cos(2βz)] V'),('電流包絡','0.06√[1+Γ²−2Γ cos(2βz)] A')],detail('VL = 3(1+Γ)；IL = .06(1−Γ)<br>P− = .09Γ²；PL = .09(1−Γ²)<br>VSWR = (1+|Γ|)/(1−|Γ|)','RL=0/25/50/100/200 Ω 對應 Γ=−1/−1/3/0/1/3/.6；VSWR=∞/2/1/2/4。包絡平方根的浮點負零會截回零。','25 Ω 和 100 Ω 的 VSWR 同為 2，哪裡不同？反射相位與峰谷位置。'),extra)
# 6：同尺度瞬時與包絡。
x=lambda q:90+(q+.5)*900;y=lambda v:340-v*45
b=axes(x,y,[(-.5,'−½'),(-.25,'−¼'),(0,'0')],[(-6,'−6'),(-4,'−4'),(0,'0'),(4,'4'),(6,'6')],'位置 z/λ','電壓（V）；本圖固定 RL = 100 Ω',top=70,bottom=610)
env=lambda q:math.sqrt(10+6*math.cos(4*math.pi*q))
b+=path(points(env,x,y,-.5,0),'amber dash')+path(points(lambda q:-env(q),x,y,-.5,0),'amber dash')+path(points(lambda q:4*math.cos(2*math.pi*q),x,y,-.5,0),'mint')+path(points(lambda q:2*math.sin(2*math.pi*q),x,y,-.5,0),'blue')+txt(30,750,'橘虛線：±包絡；最大 4、最小 2 V')+txt(30,800,'綠：t = 0；4 cos(βz) V')+txt(30,850,'藍：t = T/4；2 sin(βz) V')+txt(30,905,'峰到谷 λ/4 = .5 m')+txt(30,950,'相鄰峰 λ/2 = 1 m；淨功率 .08 W')
add('envelope','包絡與瞬時快照分開讀','兩條瞬時曲線與上下包絡共用伏特刻度，全部由公式採樣。圖固定 100 Ω，不跟前張負載滑桿連動。',b,995,[('包絡','|V| = √[10+6 cos(2βz)] V'),('部分反射','|Γ| = 1/3，谷值非零')],detail('V(z)=3e^(−jβz)+e^(jβz)<br>v(z,t)=Re{V(z)e^(jωt)}','包絡是每點各自的時間振幅；不是同一時刻全線快照。|Γ|<1 仍有淨平均功率，只有全反射的淨值為零。','t=T/4 負載電壓為零，是否包絡也零？不是，負載振幅仍 4 V。'))
# 7：等尺度反射比平面。
b=txt(30,40,'反射比平面：Re／Im 同尺度')+line(100,270,530,270)+line(300,470,300,65)+circ(300,270,140,'blue')+path('M440 270 A140 140 0 0 1 300 410','mint',True)+path('M300 410 A140 140 0 0 1 160 270','mint',True)+txt(530,310,'Re',anchor='end')+txt(325,80,'Im')
for px,py in [(440,270),(300,410),(160,270)]:b+=dot(px,py)
b+=txt(450,245,'+1/3')+txt(85,245,'−1/3')+txt(320,440,'−j/3')+txt(30,525,'d = 0 → +1/3')+txt(30,575,'d = λ/8 → −j/3（下方）')+txt(30,625,'d = λ/4 → −1/3（左側）')+txt(30,675,'d = λ/2 → +1/3（回到右側）')+txt(30,730,'Γin = ΓL e^(−j2βd)，順時針')
add('phase','量測面向源端，反射比轉兩倍角','d ≥ 0 向源端，位置 z = −d；ΓL=1/3。圓半徑固定 1/3，兩軸使用共同尺度。不是完整史密斯圖。',b,775,[('大小不變','|Γin| = 1/3，VSWR = 2'),('角度','−2βd；不是速度變兩倍')],detail('Γin = [V−e^(−jβd)]/[V+e^(+jβd)]','反向與正向波的相位相減，產生二倍角。無損線移面只轉相位；有損線還會改大小。','只有 |Γ| 能否確定 Zin？不能，還需要反射相位。'))
# 8：Re/Im共同軸，波式避免tan極點。
def zin(q):
 a=math.cos(4*math.pi*q)/3;b=-math.sin(4*math.pi*q)/3;den=(1-a)**2+b*b
 return 50*(1-a*a-b*b)/den,100*b/den
x=lambda q:90+900*q;y=lambda value:440-(value+40)/150*330
b=axes(x,y,[(0,'0'),(.25,'¼'),(.5,'½')],[(-40,'−40'),(0,'0'),(25,'25'),(50,'50'),(100,'100')],'向源端距離 d/λ','輸入阻抗（Ω）；RL 固定 100 Ω',top=110,bottom=440)+path(points(lambda q:zin(q)[0],x,y,0,.5),'mint')+path(points(lambda q:zin(q)[1],x,y,0,.5),'blue')+f'<circle id="emline-input-real-dot" cx="315" cy="{y(25)}" r="7" fill="#78e2ca"/>'+f'<circle id="emline-input-imag-dot" cx="315" cy="{y(0)}" r="7" fill="#8db8ff"/>'+txt(30,580,'綠：實部；藍：虛部，同一 Ω 軸')+f'<text id="emline-input-reading" x="30" y="635">d/λ = .250；Zin = 25 + j0 Ω</text>'+txt(30,690,'靜態算例 d/λ = .125：40 − j30 Ω')+txt(30,745,'四分之一波長：V = j2 V')+txt(30,790,'I = j.080 A；淨平均功率 .080 W')
extra='<div class="line-lab"><label for="emline-distance">向源端距離 d/λ</label><input id="emline-distance" type="range" min="0" max="0.5" step="0.025" value="0.25"><output id="emline-distance-output" for="emline-distance"></output><button id="emline-input-reset" type="button">重設量測位置</button><p id="emline-input-why" role="status"></p></div>'
add('input','四分之一波長，把一百看成二十五','圖固定 RL=100 Ω、ΓL=1/3，不連動負載滑桿。極小虛部只作數值清零；曲線真實計算，Ω 軸範圍 −40..110。',b,835,[('輸入波式','Zin = Z₀(1+Γin)/(1−Γin)'),('λ/4 處','Zin = Z₀²/RL = 25 Ω')],detail('a = cos(4πd/λ)/3；b = −sin(4πd/λ)/3<br>D=(1−a)²+b²<br>Re Zin=50(1−a²−b²)/D；Im Zin=100b/D','d/λ=.125 是五個 .025 步長，可直接操作，也保留靜態算例。此圖分母恆正；以波式避開 tan 在 λ/4 的發散。負載仍 100 Ω。','輸入變 25 Ω 是否多一顆耗能電阻？沒有，無損線淨功率仍 .08 W。'),extra)
# 9：三個真正邊界，無限直接文字表達。
b=txt(30,40,'同一線：Z₀ = 50 Ω；V⁺ = 3 V peak')
for i,(title,rows,col) in enumerate([
 ('匹配 RL = 50 Ω',['Γ = 0；VSWR = 1','任意 d：Zin = 50 Ω','VL = 3 V；IL = .060 A；PL = .09 W'],'mint'),
 ('短路 RL = 0 Ω',['Γ = −1；VSWR = ∞','VL = 0；IL = .120 A；PL = 0','d = λ/4：等效開路，Zin → ∞'],'blue'),
 ('理想開路 RL → ∞',['Γ = +1；VSWR = ∞','VL = 6 V；IL = 0；PL = 0','d = λ/4：等效短路，Zin = 0'],'amber')]):
 yy=85+i*250;b+=f'<rect x="25" y="{yy}" width="550" height="225" rx="15" class="{col}"/>'+txt(45,yy+45,title,col+'-fill')
 for j,row in enumerate(rows):b+=txt(45,yy+95+45*j,row)
b+=txt(30,885,'限理想正弦穩態；非暫態無窮電壓')+txt(30,935,'VNA：頻率與校正參考面一起記錄')
add('limits','開短、匹配，各有不同邊界','三卡同為理想無損線、固定入射峰值。開短的無限是阻抗極限，不以大有限電阻替代，也未模擬暫態。',b,980,[('開短全反射','淨平均負載功率 0'),('匹配','任意位置 Γ = 0')],detail('Zin = Z₀[ZL+jZ₀ tan(βd)]/[Z₀+jZL tan(βd)]','此式與行波比等價；tan 極點須取整式極限或回到波式。VNA 校正面決定 S11 相位與阻抗；探棒負載也可能改場。','短路的 λ/4 處等效開路，是否導線真的被切斷？沒有，只是該頻率輸入比例的極限。'))
# 同源輸出。
(D/'lesson-data.js').write_text('window.EMLINE_AUDIO = '+json.dumps(dict(lessons=lessons,figures=figures),ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
md=raw.replace('# 傳輸線與駐波｜完整口語稿','# 傳輸線與駐波｜完整口語稿\n\n正文與 lesson-data.js 由講稿來源.txt 同源生成。每堂九段，第三、六、九段看圖停靠；240–280 字／分鐘估算約 17–21 分鐘，實際音長與等待另計。尚無正式音檔。',1)
(D/'完整口語稿.md').write_text(md,encoding='utf-8')
js=(T/'audio-course.js').read_text(encoding='utf-8').replace('EMFIELD_AUDIO','EMLINE_AUDIO').replace('emfield-listening-v1','emline-listening-v1')+'\n'+(D/'figure-controls.js').read_text(encoding='utf-8')
(D/'audio-course.js').write_text(js,encoding='utf-8')
(D/'audio-manifest.js').write_text('// 正式音檔尚未製作；不借用試聽檔，不自動發聲。\nwindow.EMLINE_AUDIO_ASSETS = { segments: {} };\n',encoding='utf-8')
css=(T/'audio-course.css').read_text(encoding='utf-8')+'\n/* 本課數值圖與控制。 */\n.diagram svg text{font-size:24px}.diagram svg .big-text{font-size:28px}.line-lab{padding:1.2rem;border-top:1px solid var(--line,#314255)}.line-lab label,.line-lab output{display:block;margin:.6rem 0}.line-lab output{white-space:pre-line;overflow-wrap:anywhere}.line-lab input{width:100%;min-height:36px}.line-lab p{min-height:3em}.line-lab button{margin-top:.5rem}.takeaway{min-width:0}.takeaway strong{overflow-wrap:anywhere}\n'
(D/'audio-course.css').write_text(css,encoding='utf-8')
h=(T/'index.html').read_text(encoding='utf-8').replace('電場與電位・電磁學聽課室','傳輸線與駐波・電磁學聽課室').replace('電磁學 / 邊玩邊聽 · 01','電磁學 / 邊玩邊聽 · 08').replace('電場這支箭頭，<br class="mobile-break">怎麼連到電位？','同一條線，<br class="mobile-break">為何各處電壓不一樣？').replace('從空間分量與作功，走到等位線與梯度。','從分佈儲能、延遲與反射，走到駐波和輸入阻抗。')
h=re.sub(r'<section class="further-reading">.*?</section>','<section class="further-reading"><h3>想再深入時</h3><p>本課來源：本地《電磁學（下）》第 17.1–17.5 節。模型為均勻無損雙導體線與正弦穩態；時域只說明單程／回波距離，匹配設計與暫態反彈另課。</p><a href="../../圖解電磁學/dist/23-transmission-lines.html">分佈傳輸線與行波 ↗</a><a href="../../圖解電磁學/dist/24-standing-waves.html">反射、駐波與輸入阻抗 ↗</a></section>',h)
h=re.sub(r'<footer>.*?</footer>','<footer>均勻無損線 · Z₀ = 50 Ω · V⁺ = 3 V peak · 三堂二十七段 · 九次看圖停靠 · 尚無正式音檔</footer>',h)
(D/'index.html').write_text(h,encoding='utf-8')
print('正文漢字：',[(l['id'],sum(len(re.findall(r'[\u4e00-\u9fff]',s['text'])) for s in l['segments'])) for l in lessons]);print('圖數',len(figures))

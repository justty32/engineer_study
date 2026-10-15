"""從講稿來源.txt 產生同源正文與程式 SVG；不產生音訊。"""
from pathlib import Path
import re, json, html, math
D=Path(__file__).resolve().parent
T=D.parent/'聽課-電場與電位'
source=(D/'講稿來源.txt').read_text(encoding='utf-8')
lessons=[]
keys=['flux','motion','linkage']
summaries=['從法向投影到時間斜率，分清磁通、環路正向與冷次回應。','從移動桿的電荷分離，核對閉路電流、磁制動與外力供能。','從每匝磁通走到磁鏈、自感端電壓、磁能與互感開路量測。']
for li,block in enumerate(re.split(r'^## ',source,flags=re.M)[1:]):
    title=block.splitlines()[0]; segments=[]
    for si,p in enumerate(re.split(r'^### ',block,flags=re.M)[1:]):
        heading,body=p.split('\n',1)
        segments.append(dict(id=f'eminduct-{li+1}-{si+1:02}',title=heading,text=body.strip(),checkpoint=(si+1)%3==0,figure=None,audioSrc=''))
    lessons.append(dict(id='eminduct-'+keys[li],title=title,summary=summaries[li],segments=segments))
C={'mint':'#78e2ca','amber':'#ffc67b','blue':'#8db8ff','pink':'#ef9dbb','axis':'#71889b'}
def text(x,y,s,cls='',anchor='start',id=''):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"'+(f' id="{id}"' if id else '')+'>'+html.escape(str(s))+'</text>'
def line(x1,y1,x2,y2,cls='axis',arrow=False,id=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{cls}"'+(f' marker-end="url(#CURRENT-{cls.split()[0]}-arrow)"' if arrow else '')+(f' id="{id}"' if id else '')+'/>'
def circle(x,y,r=5,cls='amber-fill',id=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" class="{cls}"'+(f' id="{id}"' if id else '')+'/>'
def path(d,cls='mint',arrow=False,id=''):
    return f'<path d="{d}" class="{cls}"'+(f' marker-end="url(#CURRENT-{cls.split()[0]}-arrow)"' if arrow else '')+(f' id="{id}"' if id else '')+'/>'
def svg(id,title,desc,b,h):
    defs=''.join(f'<marker id="{id}-{k}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="{v}"/></marker>' for k,v in C.items())
    style='text{font-family:system-ui,sans-serif;fill:#eef3f6;font-size:23px}.muted-text{fill:#a8b7c6}.big-text{font-size:27px;font-weight:650}.grid{stroke:#2a3d51;stroke-width:1}.dash{stroke-dasharray:6 5}'+''.join('.'+k+'{stroke:'+v+';fill:none;stroke-width:3}.'+k+'-fill{fill:'+v+'}' for k,v in C.items())
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {h}" role="img" aria-labelledby="{id}-title {id}-desc"><title id="{id}-title">{html.escape(title)}</title><desc id="{id}-desc">{html.escape(desc)}</desc><defs>{defs}</defs><style>{style}</style><rect width="600" height="{h}" fill="#111f30"/>{b.replace("CURRENT",id)}</svg>'
def widget(id,label,min,max,step,value,reset):
    return f'<div class="parameter-box"><label for="{id}">{label}</label><output id="{id}-value" for="{id}"></output><input id="{id}" type="range" min="{min}" max="{max}" step="{step}" value="{value}"><button id="{reset}" type="button">重設此圖</button><p id="{id}-feedback" role="status" aria-live="polite"></p></div>'
figures=[]
def add(key,title,subtitle,b,h,takes,detail,extra=''):
    i=len(figures);id='eminduct-'+key
    seg=lessons[i//3]['segments'][(i%3+1)*3-1];seg['figure']=id
    diagram=svg(id,title,subtitle,b,h)
    (D/(id+'.svg')).write_text(diagram+'\n',encoding='utf-8')
    figures.append(dict(id=id,short=f'{i+1:02} '+title,title=title,subtitle=subtitle,look=seg['text'].split('\n\n')[-1],diagram=diagram,extra=extra,takeaways=''.join(f'<div class="takeaway"><span>{a}</span><strong>{v}</strong></div>' for a,v in takes),detail=detail))
# 一：箭頭只示方向，短線為面片側視，始終與法向垂直。
a=math.pi/3;nx=300+140*math.cos(a);ny=245-140*math.sin(a)
b=text(30,40,'側視幾何；所有箭頭為方向示意','muted-text')+line(300,245,500,245,'blue',True)+text(505,280,'B')
b+=line(300-100*math.sin(a),245-100*math.cos(a),300+100*math.sin(a),245+100*math.cos(a),'amber',False,'eminduct-plane')+line(300,245,nx,ny,'mint',True,'eminduct-normal')+circle(300,245)+text(nx+12,ny-10,'n̂','',id='eminduct-normal-label')+path('M350 245 A50 50 0 0 0 325 201.7','pink',id='eminduct-angle-arc')+text(360,205,'60°','',id='eminduct-angle-label')
b+=text(35,390,'橘線：面片側視；綠箭頭：面法向')+text(35,435,'B = 0.30 T；A = 0.02 m²')+text(35,485,'Φ = BA cos θ = +3.000 mWb','big-text',id='eminduct-flux-reading')+text(35,530,'滑桿比較靜態角度；未指定轉動時間','muted-text')
add('flux','面法向決定磁通正負','θ 是 B 與法向的夾角；面片與法向垂直。各角度只比較狀態，沒有把操作速度當作真實轉速。',b,570,[('均勻平面才可直接用','Φ = BA cos θ'),('四個角度','0 / 60 / 90 / 180°'),('對應磁通','6 / 3 / 0 / −6 mWb')],'<p>磁通 Φ = ∫B · n̂ dA；均勻平面 A = .02 m²、B = .30 T，因此 Φ = .006 cos θ Wb。磁通為零不代表磁場為零。</p><p>自我檢核：角度固定在零、磁通最大，是否一定有感應電動勢？答案：沒有；還要看磁通時間變化率。來源：08-電磁學-中第 12.1 節；圖解電磁學 15。</p>',widget('eminduct-theta','法向與磁場夾角 θ（度）',0,180,1,60,'eminduct-flux-reset'))
# 二：兩張真值曲線，各自帶單位；導數切換點不填值。
x=lambda t:85+145*t
b=text(30,35,'Bz（T）↑；法向出紙、正向逆時針','muted-text')+line(85,260,540,260)+line(85,260,85,55)
for v in [0,.1,.2,.3,.4]:
 y=260-v*500;b+=line(85,y,520,y,'grid')+text(70,y+7,f'{v:.1f}',anchor='end')
for t in range(4):b+=text(x(t),295,t,anchor='middle')
b+=text(540,325,'t（s）',anchor='end')+path(f'M{x(0)} 210 L{x(1)} 110 L{x(2)} 110 L{x(3)} 210')
b+=text(30,365,'ℰ（mV）↑','muted-text')+line(85,485,540,485)+line(85,580,85,385)
for v in [-4,0,4]:
 y=485-v*20;b+=line(85,y,520,y,'grid')+text(70,y+7,v,anchor='end')
for t in range(4):b+=text(x(t),615,t,anchor='middle')
for ta,tb,e in [(0,1,-4),(1,2,0),(2,3,4)]:
 y=485-e*20;b+=line(x(ta),y,x(tb),y,'amber')
 for tt in [ta,tb]:
  if tt in [1,2]:b+=f'<circle cx="{x(tt)}" cy="{y}" r="5" stroke="#ffc67b" fill="#111f30" stroke-width="2"/>'
b+=text(540,650,'t（s）',anchor='end')+text(30,695,'○ 理想斜率切換點不取單一值')+text(30,740,'R = 2 Ω：I = −2 / 0 / +2 mA')
add('slope','看斜率，不只看大小','固定單匝 A = .02 m²。正 Bz 朝紙外；電動勢取逆時針正向。兩個轉折點左右導數不同。',b,780,[('0–1 s：B 增加','ℰ = −4 mV'),('1–2 s：B 固定','ℰ = 0'),('2–3 s：B 減少','ℰ = +4 mV')],'<p>第一段 dB/dt = (.30 − .10)/1 = .20 T/s；ℰ = −A dB/dt = −.004 V。第二段斜率零；第三段斜率 −.20 T/s，ℰ = +.004 V。</p><p>Φ 依序為 2 → 6 → 6 → 2 mWb。電阻電流近似 I = ℰ/R，忽略自感暫態；不能把這個瞬時歐姆近似延伸到所有真實線圈頻率。來源：08-電磁學-中第 12.1–12.2 節。</p>')
# 三：順、逆時針頂部箭頭分別向右、向左。
b=text(150,40,'外場增加',anchor='middle')+text(450,40,'外場減少',anchor='middle')
for cx in [150,450]:
 b+=f'<circle cx="{cx}" cy="205" r="85" class="axis"/>'+text(cx,95,'外 B：⊙ 出紙',anchor='middle')
b+=path('M65 205 A85 85 0 0 1 235 205','amber',True)+path('M535 205 A85 85 0 0 0 365 205','mint',True)
b+=text(150,218,'⊗', 'big-text','middle')+text(450,218,'⊙','big-text','middle')+text(150,330,'電流順時針',anchor='middle')+text(450,330,'電流逆時針',anchor='middle')+text(150,375,'回應 B 入紙',anchor='middle')+text(450,375,'回應 B 出紙',anchor='middle')
b+=text(30,445,'⊙ 出紙；⊗ 入紙；箭頭為方向示意')+text(30,490,'回應反抗變化，不一定抵消外場')+text(30,535,'量測須控制探線所圍的面積')
add('lenz','外場同向，回應可反向','兩固定閉合電阻環，外加 B 均朝外。左 dB/dt > 0；右 dB/dt < 0。中央符號表示感應電流所生的回應場。',b,575,[('外場正在增加','回應反抗增加'),('外場正在減少','回應維持原方向')],'<p>固定環路 ∮E · dl = −dΦ/dt，時變感應電場可有非零閉路積分，不能只用單值靜電位差描述總 E。</p><p>搜尋線圈與示波器可量磁通變化訊號；探線也會形成迴路，量測須控制路徑。積分波形得到磁通變化，但不知道積分常數。來源：08-電磁學-中第 12.1–12.3 節。</p>')
# 四：回路極性與環流正向。
b=text(30,35,'xy 紙面；+z 出紙；方向示意','muted-text')+path('M115 130 H420 V370 H115 V280 M115 200 V130','blue')+f'<rect x="100" y="200" width="30" height="80" class="amber"/>'+text(35,250,'R')
for xx in [210,300]:
 for yy in [200,290]:b+=text(xx,yy,'⊙',anchor='middle')
b+=line(420,130,420,370,'amber')+line(445,175,445,300,'mint',True)+text(465,245,'I')+line(420,100,535,100,'mint',True)+text(480,75,'u = 3 m/s',anchor='middle')+text(435,145,'−')+text(435,380,'+')
b+=line(390,320,390,180,'pink',True)+text(310,255,'E開路')+text(235,410,'B = .20 T；ℓ = .50 m',anchor='middle')+text(30,465,'u × B 向下；開路 E 向上')+text(30,510,'逆時針為正：ℰ = −.30 V')+text(30,555,'開路：底端 − 頂端 = +.30 V')
add('rod','先鎖幾何，再讀極性','桿向右、磁場出紙；速度叉磁場向下。開路電場向上；閉路傳統電流沿右桿向下、整圈順時針。',b,595,[('環路正向','逆時針；右桿向上'),('動生環路電動勢','−Bℓu = −.30 V'),('開路端電壓','V底 − V頂 = +.30 V')],'<p>正電荷磁力 q u × B 向下，電子累積上端；開路橫向平衡 E = −u × B，故 E 向上，底端電位較高。圖中 E 箭頭屬開路狀態，I 箭頭屬閉路狀態，兩者用於對照。</p><p>閉路總電阻 .50 Ω 時 I = .60 A，忽略自感暫態。開路端電壓與環路電動勢的參考方向不同。來源：08-電磁學-中第 12.3 節。</p>')
# 五：力同尺度反向，功率曲線真值。
b=text(30,35,'定速閉路：磁力與外力等大反向','muted-text')+path('M90 100 H280 V260 H90 V210 M90 150 V100','blue')+f'<rect x="78" y="150" width="24" height="60" class="amber"/>'+text(30,300,'R = .50 Ω；B = .20 T；ℓ = .50 m')+line(280,120,280,245,'amber',True,'eminduct-power-current-arrow')+text(310,200,'I')+text(190,190,'⊙')
b+=line(440,155,485,155,'mint',True,'eminduct-force-external')+line(440,215,395,215,'pink',True,'eminduct-force-magnetic')+text(420,125,'外拉 →')+text(410,255,'← 磁力')
b+=text(30,350,'P（W）↑')+line(85,580,535,580)+line(85,580,85,375)
for u in [0,3,6]:b+=text(85+70*u,615,u,anchor='middle')
for p in [0,.18,.72]:
 y=580-260*p;b+=line(85,y,505,y,'grid')+text(72,y+7,f'{p:.2f}',anchor='end')
b+=path(' '.join(('M' if i==0 else 'L')+f'{85+70*(i/20):.3f} {580-260*.02*(i/20)**2:.3f}' for i in range(121)))+circle(295,533.2,id='eminduct-power-point')+text(540,655,'u（m/s）',anchor='end')
b+=text(30,700,'ℰ幅值 .300 V；I .600 A','',id='eminduct-power-reading')+text(30,745,'F外 .060 N；P .180 W','',id='eminduct-force-reading')
add('power','拉動者供給焦耳熱','u 是速率；電流閉環沿順時針。力箭頭每 .02 N 畫 15 單位長，兩力同尺度；下圖以速度作橫軸，不是位置隨時間動畫。',b,785,[('電動勢、電流與力','均與 u 成正比'),('外力功率與熱功率','P外 = I²R = .02u²'),('速度翻倍','功率四倍')],'<p>ℰ幅值 = Bℓu = .1u V；I = .2u A；Fx磁 = −IBℓ = −.02u N；F外 = +.02u N；P外 = F外u = I²R = .02u² W。</p><p>u = 3 得 .30 V / .60 A / .060 N / .180 W；u = 6 得 .60 / 1.20 / .120 / .720。忽略摩擦、桿軌電阻、自感暫態。</p><p>磁力對單電荷瞬時總速度作功為零；外力經材料約束與場傳能，與宏觀磁制動並不矛盾。來源：08-電磁學-中第 12.3 節及羅倫茲力。</p>',widget('eminduct-speed','桿速 u（m/s）',0,6,.5,3,'eminduct-power-reset'))
# 六：分兩層留足文字寬度，避免手機標籤擠壓。
b=text(30,40,'固定面：場在變','big-text')+f'<rect x="60" y="75" width="160" height="140" class="blue"/>'+text(140,155,'⊙',anchor='middle')+text(260,110,'A = .02 m²')+text(260,160,'dB/dt = .20 T/s')+text(260,210,'ℰ = −4 mV')+text(30,265,'邊界不動；局部磁場隨時間改變')
b+=text(30,340,'固定場：邊界在動','big-text')+path('M60 390 H220 V530 H60 Z','blue')+line(220,460,300,460,'mint',True)+text(140,470,'⊙',anchor='middle')+text(320,405,'B = .20 T')+text(320,455,'dA/dt = 1.5')+text(320,490,'m²/s')+text(320,535,'ℰ = −.30 V')+text(30,590,'本導軌理想滑接；逐段指定運動速度')+text(30,635,'正向皆逆時針；箭頭僅示方向')+text(30,680,'開路可有電壓，幾乎無負載制動')
add('two-cases','辨認真正改變的量','上：固定面中的 B 改變；下：固定 B 中的面積改變。數值與機制各有條件，不宣稱兩者可無條件互換。',b,720,[('固定面','ℰ = −A dB/dt'),('本移動桿幾何','ℰ = −B dA/dt'),('量測功率','還需速度、力與電流')],'<p>一般閉路需保留 ∮(E + u × B) · dl，並交代導體或相應邊界速度。隨物質移動的明確閉路適用磁通規則；本理想滑動接點幾何也可逐段套用，不假設整圈都是同一批物質點。</p><p>電壓表只證明端口讀值，力計、速度及電流量測才可交叉核對機械供能與負載熱功率。來源：08-電磁學-中第 12.1–12.3 節。</p>')
# 七：空心線圈磁通鏈結。
b=text(30,40,'長空心線圈；共同磁通方向示意','muted-text')+f'<rect x="70" y="95" width="450" height="130" class="axis dash"/>'
for xx in range(100,501,40):b+=f'<ellipse cx="{xx}" cy="160" rx="18" ry="80" class="blue"/>'
b+=line(55,160,550,160,'mint',True)+text(300,280,'N = 500；ℓ = .20 m',anchor='middle')+text(300,325,'A = 1 cm² = 10⁻⁴ m²',anchor='middle')+text(30,385,'I = 2 A → B = 6.283185 mT')+text(30,435,'單匝 Φ = .628319 μWb')+text(30,485,'磁鏈 λ = .314159 mWb·turn')+text(30,535,'L = .157080 mH')+text(30,595,'N × 2 → 場 × 2 → 磁鏈 × 4')+text(30,640,'磁鏈是逐匝加總，不是單截面磁通')
add('linkage','匝數為何出現平方','長空心線圈，忽略端部與外場，幾何固定。圖中圈數是示意；計算用 N = 500。下一圖改用另一個 20 mH 線圈。',b,680,[('第一個 N','同電流下，更多匝造更強場'),('第二個 N','更多匝各自鏈結磁通'),('固定幾何','L ∝ N²')],'<p>μ₀ = 4π × 10⁻⁷ H/m；B = μ₀NI/ℓ = .006283185 T；Φ = BA = .628318531 μWb；λ = NΦ = .314159265 mWb·turn。</p><p>L = λ/I = μ₀N²A/ℓ = .157079633 mH。λ 是磁通連結；單匝 Φ 不可直接寫成 LI。來源：08-電磁學-中第 12.4 節；圖解電磁學 16。</p>')
# 八：兩軸分開，按數值採樣。
b=text(30,35,'換線圈：固定 L = 20 mH','muted-text')+text(30,85,'λ（mWb·turn）↑')+line(85,290,535,290)+line(85,290,85,110)
for v in [0,40,80]:
 y=290-2*v;b+=line(85,y,505,y,'grid')+text(72,y+7,v,anchor='end')
for i in [0,2,4]:b+=text(85+105*i,325,i,anchor='middle')
b+=line(85,290,505,130,'mint')+circle(295,210,id='eminduct-linkage-point')+text(540,360,'I（A）',anchor='end')+text(30,415,'U（J）↑')+line(85,630,535,630)+line(85,630,85,445)
for v in [0,.04,.16]:
 y=630-1000*v;b+=line(85,y,505,y,'grid')+text(72,y+7,f'{v:.2f}',anchor='end')
for i in [0,2,4]:b+=text(85+105*i,665,i,anchor='middle')
b+=path(' '.join(('M' if j==0 else 'L')+f'{85+105*(j/40):.3f} {630-10*(j/40)**2:.3f}' for j in range(161)),'amber')+circle(295,590,id='eminduct-energy-point')+text(540,705,'I（A）',anchor='end')+text(30,755,'λ = 40.0 mWb·turn；U = .040 J','',id='eminduct-energy-reading')+text(30,800,'滑桿比較狀態，沒有指定 di/dt','muted-text')
add('energy','電流與能量不同次方','上圖磁鏈為直線，下圖磁能為拋物線；縱軸單位不同。假設 L 固定、線性、無磁滯，讀值不是大電流元件性能保證。',b,840,[('磁鏈','λ = .020 I Wb·turn'),('磁能','U = .010 I² J'),('I = 0 / 2 / 3 / 4 A','U = 0 / .040 / .090 / .160 J')],'<p>被動符號約定 v = dλ/dt = L di/dt；p = vi，從零建立電流：U = ∫₀ᴵ Li di = LI²/2。</p><p>線性無磁滯材料 uₘ = B · H/2；各向同性時 = B²/(2μ)。穩態理想 v = 0 仍可有儲能；電流下降時端口功率可負。小訊號 LCR 表讀值不能證明大電流仍線性。來源：08-電磁學-中第 12.4 節。</p>',widget('eminduct-current','電流 I（A）',0,4,.1,2,'eminduct-energy-reset'))
# 九：點端與電壓電流參考。
b=text(30,35,'兩側上端為點端；電流參考皆進點','muted-text')
for cx in [160,430]:
 b+=line(cx,85,cx,140,'blue')+line(cx,330,cx,390,'blue')+circle(cx+25,140,6,'amber-fill')+text(cx-45,140,'+')+text(cx-45,350,'−')
 coil='M'+str(cx)+' 140'
 for yy in range(140,330,38):coil+=f' C{cx+60} {yy} {cx+60} {yy+38} {cx} {yy+38}'
 b+=path(coil,'blue')+line(cx,70,cx,120,'mint',True)
b+=text(90,70,'i₁')+text(475,80,'i₂ = 0')+text(90,430,'L₁ = 20 mH')+text(350,430,'L₂ = 5 mH')+text(160,480,'v₁ = +2 V',anchor='middle')+text(430,480,'v₂ = +.50 V',anchor='middle')+text(30,540,'k = .5 → M = 5 mH')+text(30,585,'di₁/dt = 100 A/s；第二側開路')+text(30,630,'電表反接 → −.50 V，耦合不變')+text(30,675,'方向示意；開路電壓 ≠ 輸出功率')
add('mutual','開路也能量到感應電壓','兩線圈電壓均上正下負、電流參考均進點端。第二側開路，i₂ 與 di₂/dt 為零；線圈圖只示意繞組及點端。',b,715,[('互感','M = k√(L₁L₂) = 5 mH'),('第一側','v₁ = L₁ di₁/dt = +2 V'),('第二側開路','v₂ = M di₁/dt = +.50 V')],'<p>本點端約定：v₁ = L₁ di₁/dt + M di₂/dt；v₂ = M di₁/dt + L₂ di₂/dt。M² ≤ L₁L₂，0 ≤ k ≤ 1，適用被動線性互易模型。k = 0 時此互感電壓為零。</p><p>示波器配電流探棒，由 v₂/(di₁/dt) 估 M。電表反接只改讀值符號；開路有電壓不代表送出負載功率。本 k = .5 例不直接套理想變壓器匝比。來源：08-電磁學-中第 12.4–12.5 節。</p>')
# 所有衍生產物均來自同一正文來源。
(D/'lesson-data.js').write_text('window.EMINDUCT_AUDIO = '+json.dumps(dict(lessons=lessons,figures=figures),ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
md='# 感應與電感｜完整口語稿\n\n正文由講稿來源.txt 同源產生；三堂各九段，第 3、6、9 段停靠。每分鐘 240–280 漢字估算，等待另計。尚無正式音檔。\n\n'
for l in lessons:
 md+='## '+l['title']+'\n\n'
 for i,s in enumerate(l['segments']):md+=f'### {i+1}. '+s['title']+'\n\n'+s['text']+'\n\n'
(D/'完整口語稿.md').write_text(md.rstrip()+'\n',encoding='utf-8')
js=(T/'audio-course.js').read_text().replace('EMFIELD_AUDIO','EMINDUCT_AUDIO').replace('emfield-listening-v1','eminduct-listening-v1')
(D/'audio-course.js').write_text(js,encoding='utf-8')
(D/'audio-manifest.js').write_text('// 正式音檔尚未製作；沒有借用 sample，不自動發聲。\nwindow.EMINDUCT_AUDIO_ASSETS = { segments: {} };\n',encoding='utf-8')
css=(T/'audio-course.css').read_text()+'\n/* 本課參數與圖像 */\n.parameter-box{margin:0 24px 20px;padding:16px;border:1px solid var(--line);border-radius:12px}.parameter-box label{display:block;font-weight:600}.parameter-box output{display:block;color:var(--amber);font-variant-numeric:tabular-nums}.parameter-box p{font-size:14px;margin:12px 0 0;overflow-wrap:anywhere}.diagram svg text{font-size:23px}.diagram svg .big-text{font-size:27px}.diagram svg .muted-text{font-size:22px}.transcript-section p{white-space:pre-line}@media(max-width:760px){.parameter-box{margin-left:14px;margin-right:14px}}\n'
(D/'audio-course.css').write_text(css,encoding='utf-8')
h=(T/'index.html').read_text().replace('電場與電位・電磁學聽課室','感應與電感・電磁學聽課室').replace('邊玩邊聽 · 01','邊玩邊聽 · 04').replace('電場這支箭頭，<br class="mobile-break">怎麼連到電位？','磁通正在變，<br class="mobile-break">能量從哪裡來？').replace('從空間分量與作功，走到等位線與梯度。','從冷次方向與移動導體，走到自感、磁能與互感。')
h=h.replace('<script defer src="audio-course.js"></script>','<script defer src="audio-course.js"></script>\n  <script defer src="induction-widgets.js"></script>')
h=re.sub(r'<section class="further-reading">.*?</section>','<section class="further-reading"><h3>從這裡接回完整圖解</h3><p>本課第一堂由面法向與投影開始；先備只需基本電壓、電流與向量方向。模型與來源：08-電磁學-中第 12 章，固定幾何線性自感與互感；動生例採理想滑接、忽略自感暫態與摩擦。完整口語稿保存在同目錄「完整口語稿.md」，也可於上方直接閱讀及複製。</p><a href="../../圖解電磁學/dist/15-induction.html">電磁感應圖解 ↗</a><a href="../../圖解電磁學/dist/16-inductance.html">電感圖解 ↗</a><a href="../11-電磁感應.html">電磁感應原課 ↗</a></section>',h)
h=re.sub(r'<footer>.*?</footer>','<footer>三堂二十七段 · 九次看圖停靠 · 三個參數實驗 · 尚無正式音檔</footer>',h)
(D/'index.html').write_text(h,encoding='utf-8')
print('正文漢字：',[(l['id'],sum(len(re.findall(r'[\u4e00-\u9fff]',s['text'])) for s in l['segments'])) for l in lessons]);print('圖數：',len(figures))

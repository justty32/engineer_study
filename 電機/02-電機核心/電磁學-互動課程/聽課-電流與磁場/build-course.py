"""從講稿來源.txt 生成同源正文、SVG 與 lesson-data；播放器沿用本地成熟模板。"""
from pathlib import Path
import re,json,math,html
D=Path(__file__).resolve().parent
T=D.parent/'聽課-電場與電位'
raw=(D/'講稿來源.txt').read_text(encoding='utf-8')
lessons=[]
names=['force','biot','ampere']
summaries=['分開速度、場與力，從叉積方向走到導線受力和能量。','沿來源逐段累加，辨認長直線與圓環的不同衰減。','沿觀測路徑積分，分清局部場、淨穿面電流與幾何對稱。']
for li,block in enumerate(re.split(r'^## ',raw,flags=re.M)[1:]):
    title,body=block.split('\n',1);segments=[]
    for si,part in enumerate(re.split(r'^### ',body,flags=re.M)[1:]):
        heading,body=part.split('\n',1)
        segments.append(dict(id=f'emmagnet-{li+1}-{si+1:02}',title=re.sub(r'^\d+\. ','',heading),text=body.strip(),figure=None,checkpoint=(si+1)%3==0,audioSrc=''))
    lessons.append(dict(id='emmagnet-'+names[li],title=title,summary=summaries[li],segments=segments))
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
    i=len(figures);id='emmagnet-'+id;seg=lessons[i//3]['segments'][(i%3+1)*3-1];seg['figure']=id
    drawing=svg(id,title,subtitle,b,h);(D/(id+'.svg')).write_text(drawing+'\n',encoding='utf-8')
    take=''.join(f'<div class="takeaway"><span>{a}</span><strong>{b}</strong></div>' for a,b in values)
    figures.append(dict(id=id,short=f'{i+1:02} '+title.split('，')[0],title=title,subtitle=subtitle,look=seg['text'].split('\n\n')[-1],diagram=drawing,takeaways=take,detail=detail,extra=extra))
def detail(eq,body,check,chapter='8'):
    return f'<p class="equation">{eq}</p><p>{body}</p><p>來源：本地《電磁學（中）》第 {chapter} 章；圖解電磁學第 11／12 章。</p><p>自我檢核：{check}</p>'
# 1：右手三方向。
b=txt(30,40,'右手座標：x 右、y 上、z 出紙')+line(160,300,510,300)+line(160,300,160,90)+txt(515,330,'+x')+txt(120,80,'+y')+line(160,300,420,300,'mint',True)+line(160,300,160,125,'amber',True)+zsign(160,300,False)+txt(320,275,'v：+x','mint-fill')+txt(185,150,'F：+y','amber-fill')+txt(230,370,'B：−z，入紙','blue-fill')+txt(30,425,'q = +1 nC；v = 1000 m/s')+txt(30,470,'B = .20 T；F = .20 μN')+txt(30,520,'負 q：力改向下；場與速度不變')
add('cross','三方向分開看','正電荷：右向速度叉入紙磁場，力向上。箭頭皆為方向示意，不能跨單位比較長度。',b,565,[('磁力','F = q(v × B)'),('大小','2 × 10⁻⁷ N = .20 μN')],detail('E = 0；(+x) × (−z) = +y','圓點出紙、叉記號入紙。電量是算術試驗模型，不指定質量或真實粒子物性。','只將 q 反號會改什麼？力反向，B 不變。'))
# 2：動態圖預設theta90。
b=txt(30,40,'本圖改設：B 沿 +x，v 在 xy 面')+line(120,300,520,300)+line(300,350,300,80)+line(300,300,480,300,'blue',True)+txt(450,340,'B +x','blue-fill')+f'<line id="emmagnet-v-par" x1="300" y1="300" x2="300" y2="300" class="amber dash"/>'+f'<line id="emmagnet-v-perp" x1="300" y1="300" x2="300" y2="140" class="pink dash"/>'+f'<line id="emmagnet-v-arrow" x1="300" y1="300" x2="300" y2="140" class="mint" marker-end="url(#CURRENT-mint-arrow)"/>'+txt(30,410,'綠：速度；橘：平行分量')+txt(30,455,'粉：垂直分量（才產生磁力）')+f'<text id="emmagnet-angle-reading" x="30" y="510">θ = 90°；|F| = .200 μN</text>'+f'<text id="emmagnet-angle-direction" x="30" y="555">F 沿 −z，入紙</text>'
extra='<div class="magnet-lab"><label for="emmagnet-theta">速度與磁場夾角 θ（度）</label><input id="emmagnet-theta" type="range" min="0" max="180" step="1" value="90"><output id="emmagnet-theta-output" for="emmagnet-theta">90°；0.200 μN</output><button id="emmagnet-angle-reset" type="button">重設角度</button><p id="emmagnet-angle-why" role="status"></p></div>'
add('angle','垂直分量決定磁力','磁場改為向右；正電荷速度在紙面逆時針旋轉。0 到 180 度間力入紙，兩端為零；箭頭方向示意。',b,600,[('大小','|F| = .20 sin θ μN'),('方向','Fz = −.20 sin θ μN')],detail('v∥ = v cos θ；v⊥ = v sin θ','速度固定 1000 m/s，B 固定 .20 T，q 固定 +1 nC。0°、30°、90°、180° 的力為 0、.10、.20、0 μN。','30° 與 150°：垂直分量相同，力同向且同大小。'),extra)
# 3：上方圓軌跡，下方完整供電回路。
b=txt(30,40,'單粒子：只改方向，不增加動能')+circ(300,210,100,'blue')
for x,y in [(90,130),(90,290),(510,130),(510,290)]:b+=zsign(x,y,False,'blue')
for x,y,vx,vy,fx,fy in [(300,310,375,310,300,245),(400,210,400,135,335,210),(300,110,225,110,300,175)]:b+=dot(x,y)+line(x,y,vx,vy,'mint',True)+line(x,y,fx,fy,'amber',True)
b+=txt(30,380,'綠 v 切向；橘 F 朝心；逆時針')+txt(30,425,'F · v = 0；未指定質量與半徑')+line(30,455,570,455)+txt(30,500,'導線：回路完整，電源提供能量')+f'<rect x="145" y="555" width="310" height="115" rx="10" fill="#8db8ff18"/>'
for x in [180,280,380]:b+=zsign(x,645,False)
b+=path('M100 760 V595 H500 V760 H350','axis')+line(100,760,250,760)+line(280,730,280,790,'pink')+line(310,740,310,780,'pink')+line(250,760,280,760)+line(310,760,350,760)+line(180,595,420,595,'mint',True)+line(300,595,300,530,'amber',True)+txt(325,550,'F 向上')+txt(165,705,'有效段 ℓ = .10 m')+txt(190,825,'電源；回流位在場外')+txt(30,875,'I = 2 A；B = .20 T；F = .04 N')+txt(30,920,'霍爾探棒量 B；力感測器量 F')
add('work','垂直受力與完整回路','上方均勻場入紙，正電荷逆時針等速轉彎；下方只讓水平有效段處於顯著磁場。圖形不按尺度。',b,960,[('單粒子磁力','瞬時功率 F · v = 0'),('直段導線力','IℓB = 0.04 N')],detail('F = Iℓ × B；(+x) × (−z) = +y','v 與 F 為方向示意。導線移動可接受電源能量；回流與電源不能省略。真空自由粒子與受材料拘束的載子須分開描述。','探棒一點讀 .20 T 能否證明均勻？不能，須移動量測。'))
# 4：只畫正交微段，清楚表達單段來源。
b=txt(30,40,'xy 視圖：來源微段沿 +z 出紙')+line(130,300,500,300)+line(130,300,130,95)+zsign(130,300,True,'mint')+dot(420,300)+line(155,300,390,300,'amber',True)+line(420,300,420,135,'blue',True)+txt(60,355,'來源 dℓ')+txt(400,355,'觀測 P')+txt(240,275,'R →','amber-fill')+txt(445,165,'dB','blue-fill')+txt(30,420,'dℓ × R̂ = (+z) × (+x) = +y')+txt(30,470,'R 從來源指向 P；不能倒轉')+txt(30,520,'這只是一段；整條線還要向量相加')
add('element','來源指向觀測點','dℓ 出紙，R 往右，該微段的 dB 向上。箭頭方向示意；圖中未把單段當成長線總場。',b,560,[('畢歐—沙伐','dB = μ₀I(dℓ × R̂)/(4πR²)'),('教學近似','μ₀ ≈ 4π × 10⁻⁷ H/m')],detail('B = ∫ dB（先按分量累加）','只有穩恒真空來源。R 為來源到觀測點距離，R̂ 無單位；dℓ 單位 m。μ₀ 的教學近似不是現行精確定義。','R 畫反會怎樣？叉積變號，錯判 dB 方向。','9'))
# 5：動態長線。r .01–.10 的真實曲線。
xx=lambda r:90+(r-.01)/.09*450
yy=lambda B:790-B*1.1
curve=' '.join(('M' if i==0 else 'L')+f'{xx(r):.3f},{yy(2/r):.3f}' for i in range(181) for r in [.01+.09*i/180])
b=txt(30,40,'I = 10 A 出紙；P 保持在右側')+zsign(260,245,True,'amber')+f'<circle id="emmagnet-radius-ring" cx="260" cy="245" r="32" class="blue"/>'+f'<line id="emmagnet-radius-spoke" x1="260" y1="245" x2="292" y2="245" class="axis dash"/>'+f'<circle id="emmagnet-radius-point" cx="292" cy="245" r="5" fill="#ffc67b"/>'+f'<line id="emmagnet-radius-b" x1="292" y1="245" x2="292" y2="175" class="mint" marker-end="url(#CURRENT-mint-arrow)"/>'+txt(30,445,'逆時針環繞；P 點 B 朝 +y')+f'<text id="emmagnet-radius-reading" x="30" y="490">r = .02 m；B = 100 μT</text>'+txt(30,540,'B（μT）')+line(90,790,555,790)+line(90,790,90,555)+path(curve,'mint')
for val in [0,100,200]:b+=line(90,yy(val),540,yy(val),'axis dash')+txt(75,yy(val)+8,val,anchor='end')
for r in [.01,.02,.04,.1]:b+=txt(xx(r),830,f'{r:.2f}',anchor='middle')
b+=f'<circle id="emmagnet-wire-dot" cx="{xx(.02)}" cy="{yy(100)}" r="7" fill="#ffc67b"/>'+txt(540,875,'距離 r（m）',anchor='end')+txt(30,925,'實值曲線：B = 2/r μT（r 用 m）')
extra='<div class="magnet-lab"><label for="emmagnet-radius">到長直線軸的距離 r（m）</label><input id="emmagnet-radius" type="range" min="0.01" max="0.10" step="0.01" value="0.02"><output id="emmagnet-radius-output" for="emmagnet-radius">0.02 m；100 μT</output><button id="emmagnet-wire-reset" type="button">重設距離</button><p id="emmagnet-wire-why" role="status"></p></div>'
add('wire','距離加倍，磁場減半','上圖圓半徑按 r 成比例，場箭頭只示方向；下圖為公式採樣。僅適用理想細線外、遠端點且回流影響小。',b,965,[('長直線','B = μ₀I/(2πr)'),('距離 .01/.02/.04/.10 m','場 200/100/50/20 μT')],detail('I = 10 A；B（μT）= 2/r（r 用 m）','r = 0 不在操作範圍。真實線內須用電流分布；背景場與近回流須另疊加。','為何不是 1/r²？整條線的積分已將不同來源的距離與角度一起相加。','9'),extra)
# 6：軸向圓環；上方獨立正視＋分量圖，不混透視單位。
b=txt(30,40,'圓環正視：從 +z 看 xy 平面')+circ(300,175,85,'blue')+line(385,175,385,120,'mint',True)+line(215,175,215,230,'mint',True)+zsign(300,175,True,'amber')+txt(30,305,'逆時針 I；中心 B 朝 +z 出紙')+txt(30,360,'軸上 P 的成對貢獻（分量圖）')+line(300,530,180,410,'mint',True)+line(300,530,420,410,'blue',True)+line(300,530,300,350,'amber',True)+line(180,410,420,410,'axis dash')+txt(55,560,'橫向相消；軸向同向 → +z')+txt(30,610,'Bz（μT）；a = .05 m，I = 10 A')
xloop=lambda u:90+u*150
yloop=lambda val:885-val*1.65
b+=line(90,885,555,885)+line(90,885,90,650)
for v in [0,40,80,120]:b+=line(90,yloop(v),540,yloop(v),'axis dash')+txt(75,yloop(v)+8,v,anchor='end')
for u in [0,1,2,3]:b+=txt(xloop(u),925,u,anchor='middle')
b+=path(' '.join(('M' if i==0 else 'L')+f'{xloop(u):.3f},{yloop(125.6637061436/(1+u*u)**1.5):.3f}' for i in range(181) for u in [i/60]),'mint')+dot(xloop(0),yloop(125.6637061436))+dot(xloop(1),yloop(44.4288293816))+txt(540,965,'軸向位置 z/a',anchor='end')+txt(30,1010,'z = 0：125.664 μT')+txt(30,1055,'z = a：44.429 μT（0.354 倍）')
add('loop','繞成圓環，軸向留下','上方為圓環正視與獨立分量示意，箭頭不按力學比例；下方才是實值曲線。橫軸 z/a 無單位。',b,1095,[('環軸公式','Bz = μ₀Ia²<br>/[2(a²+z²)^(3/2)]'),('同一電流，不同幾何','長線 1/r；圓環遠軸 1/z³')],detail('Bz(0) = μ₀I/(2a)；Bz(a)/Bz(0) = 1/(2√2)','只限軸線；離軸後橫向分量不保證抵消。固定電流下比較半徑不能代替真實散熱與電阻設計。','霍爾探棒要如何擺？沿軸移動且敏感軸對準 z，先量背景。','9'))
# 7：同心圓切線全部一致。
b=txt(30,40,'虛線：安培路徑；非通電金屬')+circ(300,270,150,'axis dash')+zsign(300,270,True,'amber')
for x,y,ex,ey in [(450,270,450,185),(300,120,215,120),(150,270,150,355),(300,420,385,420)]:b+=line(x,y,ex,ey,'mint',True)
b+=txt(30,490,'逆時針路徑 ↔ 出紙正法向')+txt(30,535,'四處 B = 100 μT，皆沿切線')+txt(30,580,'r = .02 m；周長 .125664 m')+txt(30,635,'每個四分之一圓弧：')+txt(30,680,'100 × (.125664/4)')+txt(30,725,'= 3.141593 μT·m')+txt(30,780,'整圈：12.566371 μT·m')
add('circulation','每段投影乘上弧長','所有綠箭頭同時代表 B 與正走向 dℓ 的方向。等弧貢獻精確四等分，並非四個測點的大小直接相加。',b,820,[('環流','∮ B · dℓ = μ₀ I穿'),('此例可提 B','B(2πr) = 12.566371 μT·m')],detail('100 μT × 2π × .02 m = 12.566371 μT·m','以 μ₀ ≈ 4π×10⁻⁷ H/m 計算。方向箭頭不表示跨物理量的共同尺度。','繞向反轉？左側環流與右側帶號 I穿 一起反號。','9'))
# 8：兩線相反，中心同向；距離按比例。
b=txt(30,40,'左 +10 A 出紙；右 −10 A 入紙')+circ(300,270,180,'axis dash')+circ(255,270,65,'blue')+circ(345,270,65,'pink')+zsign(255,270,True,'blue')+zsign(345,270,False,'pink')+line(190,270,190,320,'blue',True)+line(410,270,410,320,'pink',True)+dot(300,270)+line(300,270,300,130,'mint',True)+txt(315,150,'總 B +y')+txt(80,505,'−.01 m')+txt(365,505,'+.01 m')+txt(30,550,'中央：兩線各 +200 μT')+txt(30,595,'向量和：+400 μT，向上')+txt(30,655,'圈半徑 .04 m；淨穿面電流 0')+txt(30,710,'∮ B · dℓ = 0，但 B(原點) ≠ 0')+txt(30,765,'虛線為路徑；彩色圓只示繞向')
add('enclosed','環流零，局部場仍存在','實際導線在 x = ±.01 m；虛線圓 r = .04 m。中央的兩個場同朝 +y；場環及箭頭只示方向。',b,805,[('淨穿面電流','+10 A − 10 A = 0'),('中央局部場','200 + 200 = 400 μT，+y')],detail('左線：B左(0) = +200 ŷ μT<br>右線：B右(0) = +200 ŷ μT','環流為零只約束沿閉路的帶號投影加總。不能假設圈上 B 處處相同或處處為零。','鉤表同夾去回線近零是否代表各線沒電流？不是，淨帶號和可為零。','9'))
# 9：長管中央近似；側視出入紙點與軸向一致。
b=txt(30,40,'長空心螺線管側視：軸 +x')
for x in range(110,511,50):b+=zsign(x,170,True,'blue')+zsign(x,330,False,'blue')
b+=line(80,170,540,170,'axis')+line(80,330,540,330,'axis')
for y in [215,250,285]:b+=line(100,y,510,y,'mint',True)
b+=path('M180 250 H430 V90 H180 Z','amber dash')+line(250,250,340,250,'amber',True)+line(380,90,280,90,'amber',True)+txt(200,410,'內段 ℓ = .10 m →')+txt(30,440,'上側出紙、下側入紙 → B 向右')+path('M520 215 C585 50 15 50 90 215','blue dash',True)+path('M520 285 C585 410 15 410 90 285','blue dash',True)+txt(30,495,'外部回返場：有限線圈不會截斷')+txt(30,550,'理想近似：中央外場小，短邊⊥B')+txt(30,605,'n = 1000 m⁻¹；I = 2 A')+txt(30,655,'nℓ = 100 匝；I穿 = 200 A')+txt(30,710,'B ≈ μ₀nI = 2.513274 mT')+txt(30,760,'Bℓ ≈ 251.3274 μT·m')+txt(30,815,'真空 H = B/μ₀；材料需另建模型')
add('solenoid','幾何條件要說完整','線圈與回返場線為方向示意，不按尺寸或匝數逐一繪製。長方形內段向右、外段向左；有限線圈外場仍回返。',b,860,[('中央近似','B ≈ μ₀nI = 2.513274 mT'),('不是總匝數單獨決定','固定 n = N/長度 才能比較')],detail('∮ B · dℓ ≈ Bℓ = μ₀(nℓ)I','內段沿場、短邊垂直理想軸向場，外段場可近似小。短管與端部不保證成立。真空 H = B/μ₀；磁化材料需更完整關係。','只增加總管長、n 和 I 不變，中央場會加倍嗎？不會。','9'))
# 同源輸出。
(D/'lesson-data.js').write_text('window.EMMAGNET_AUDIO = '+json.dumps(dict(lessons=lessons,figures=figures),ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
md=raw.replace('# 電流與磁場｜完整口語稿','# 電流與磁場｜完整口語稿\n\n正文與 lesson-data.js 由講稿來源.txt 同源生成。每堂九段，第三、六、九段看圖停靠；240–280 字／分鐘估算約 17–21 分鐘，實際音長與等待另計。尚無正式音檔。',1)
(D/'完整口語稿.md').write_text(md,encoding='utf-8')
js=(T/'audio-course.js').read_text(encoding='utf-8').replace('EMFIELD_AUDIO','EMMAGNET_AUDIO').replace('emfield-listening-v1','emmagnet-listening-v1')
# 獨立本課互動，保留成熟播放器的狀態機。
js+='\n'+(D/'figure-controls.js').read_text(encoding='utf-8')
(D/'audio-course.js').write_text(js,encoding='utf-8')
(D/'audio-manifest.js').write_text('// 正式音檔尚未製作；不借用試聽檔，不自動發聲。\nwindow.EMMAGNET_AUDIO_ASSETS = { segments: {} };\n',encoding='utf-8')
css=(T/'audio-course.css').read_text(encoding='utf-8')+'\n/* 本課圖與自由實驗：文字可縮排換行，range 鍵盤可操作。 */\n.diagram svg text{font-size:24px}.diagram svg .big-text{font-size:28px}.magnet-lab{padding:1.2rem;border-top:1px solid var(--line,#314255)}.magnet-lab label,.magnet-lab output{display:block;margin:.6rem 0}.magnet-lab input{width:100%;min-height:36px}.magnet-lab p{min-height:3em}.magnet-lab button{margin-top:.5rem}.takeaway{min-width:0}.takeaway strong{overflow-wrap:anywhere}\n'
(D/'audio-course.css').write_text(css,encoding='utf-8')
h=(T/'index.html').read_text(encoding='utf-8').replace('電場與電位・電磁學聽課室','電流與磁場・電磁學聽課室').replace('電磁學 / 邊玩邊聽 · 01','電磁學 / 邊玩邊聽 · 03').replace('電場這支箭頭，<br class="mobile-break">怎麼連到電位？','電流周圍的磁場，<br class="mobile-break">怎麼預測與量測？').replace('從空間分量與作功，走到等位線與梯度。','從磁力方向、電流元疊加，走到安培環流與螺線管。')
h=re.sub(r'<section class="further-reading">.*?</section>','<section class="further-reading"><h3>想再深入時</h3><p>本課來源：本地《電磁學（中）》第 8、9 章。磁力採 E = 0，磁場來源採真空穩恒電流；材料磁化與時變場留待後續。</p><a href="../../圖解電磁學/dist/11-lorentz.html">磁場與羅倫茲力 ↗</a><a href="../../圖解電磁學/dist/12-magnetostatics.html">畢歐—沙伐與安培定律 ↗</a></section>',h)
h=re.sub(r'<footer>.*?</footer>','<footer>真空穩恒電流 · μ₀ ≈ 4π × 10⁻⁷ H/m · 三堂二十七段 · 九次看圖停靠 · 尚無正式音檔</footer>',h)
(D/'index.html').write_text(h,encoding='utf-8')
print('正文漢字：',[(l['id'],sum(len(re.findall(r'[\u4e00-\u9fff]',s['text'])) for s in l['segments'])) for l in lessons]);print('圖數',len(figures))

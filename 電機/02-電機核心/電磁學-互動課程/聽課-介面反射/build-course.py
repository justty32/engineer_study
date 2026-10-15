#!/usr/bin/env python3
"""正文以講稿來源.txt為唯一來源；重建JS/MD及程式SVG。"""
from pathlib import Path
import json, re, math, html, shutil
D=Path(__file__).resolve().parent
T=D.parent/'聽課-電場與電位'
p=D/'講稿來源.txt'
s=p.read_text().replace('也就是三分之二的一個倒過來的量，一點五','也就是三個二分之一，也就是一點五')
p.write_text(s)
eta=376.730313564
C=['#78e2ca','#ffc67b','#8db8ff']
def text(x,y,s,cls='',anchor='start'):
 return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{html.escape(str(s))}</text>'
def line(x,y,x2,y2,color='#71889b',arrow=False,ident='',extra=''):
 return f'<line {f"id={chr(34)}{ident}{chr(34)}" if ident else ""} x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="3" {extra}'+ (' marker-end="url(#ARROW)"' if arrow else '')+'/>'
def svg(fid,title,desc,body,h=600):
 return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {h}" role="img" aria-labelledby="{fid}-title {fid}-desc"><title id="{fid}-title">{title}</title><desc id="{fid}-desc">{desc}</desc><defs><marker id="{fid}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#eef3f6"/></marker></defs><rect width="600" height="{h}" fill="#111f30"/>'+body+'</svg>').replace('#ARROW','#'+fid+'-arrow')
def box(y,lines):
 out=f'<rect x="24" y="{y}" width="552" height="{len(lines)*40+22}" rx="12" fill="#17283b"/>'
 return out+''.join(text(42,y+35+40*i,s) for i,s in enumerate(lines))
def fields(vals,hvals,prefix='',fixed=True):
 out=text(30,35,'E：V/m（同尺度；+x 向上）')
 for i,(v,h) in enumerate(zip(vals,hvals)):
  x=105+180*i; color=C[i]
  out+=line(x-35,240,x+35,240)+line(x,240,x,240-v*10,color,True,prefix+f'-e{i}' if prefix else '')
  out+=text(x,290,['入射','反射','透射'][i],anchor='middle')
  out+=text(x,330,f'{v:.4f}',anchor='middle') if fixed else ''
 out+=text(30,385,'H：mA/m（同尺度；⊙ +y／⊗ −y）')
 for i,h in enumerate(hvals):
  y=435+75*i
  out+=text(30,y,['入射','反射','透射'][i]+(' ⊙ ' if h>=0 else ' ⊗ ')+f'{h:.4f}')
  out+=line(290,y-8,290+abs(h)*6,y-8,C[i])
 out+=text(30,680,'E 與 H 單位不同，不共用尺度。')
 return out
figs=[]
def add(fid,short,title,subtitle,diagram,main,detail,extra=''):
 figs.append(dict(id=fid,short=short,title=title,subtitle=subtitle,look='',diagram=diagram,takeaways='<div class="takeaway"><span>核心關係</span><strong>'+main+'</strong></div>',detail=detail,extra=extra))
id='eminterface-geometry'
b=text(30,40,'介質 1：η₁ = η₀')+text(335,40,'介質 2：η₂ = η₀/2')
b+=line(310,70,310,440)+text(320,475,'z = 0')
for x,y,end,label in [(65,130,240,'入射 +z'),(240,240,65,'反射 −z'),(355,130,540,'透射 +z')]:
 b+=line(x,y,end,y,C[0] if label.startswith('入') else C[1] if label.startswith('反') else C[2],True)+text(min(x,end),y+35 if label.startswith('反') else y-22,label)
for x,y in [(125,210),(125,385),(445,210)]:b+=line(x,y,x,y-45,C[0],True)+text(x+15,y,'E 正向 +x')
b+=text(340,340,'⊙ +y 出紙面')+line(350,405,540,405,arrow=True)+text(440,435,'+z 向右')
b+=box(495,['μr₁ = μr₂ = 1','εr₁ = 1；εr₂ = 4','箭頭僅方向示意，尚未指定場振幅。'])
add(id,'01 三波方向','三個波共用同一套正方向','垂直入射；傳播垂直介面，電場與磁場平行介面。',svg(id,'三波方向','左側介質一，右側介質二；入射與透射向右，反射向左；固定正x向上、正y朝紙外。',b,660),'入射 +z；反射 −z；透射 +z','<p>半無限、線性、均勻、等向無損材料；所有電場以固定 +x 為正，磁場以固定 +y 為正。箭頭只示正方向，不代表實際振幅。來源：電磁學（下）16.1；圖解電磁學 21。</p><p>自我檢核：垂直入射的「垂直」指什麼？傳播方向垂直介面。</p>')
id='eminterface-magnetic'
add(id,'02 磁場負號','反射磁場多出的負號','介面參考相位 t = 0；主例 q = 0.5，反射能流向左。',svg(id,'反射磁場負號','電場按三比一比二，反射向下；磁場三個皆向紙外，大小按三比一比四。',fields([10,-10/3,20/3],[10000/eta,10000/(3*eta),40000/(3*eta)]),710),'Hᵣ = −Eᵣ/η₁；Eᵣ × Hᵣ 沿 −z','<p>E 依 10 SVG 單位／(V/m)，H 長條依 6 SVG 單位／(mA/m)。E 方向入射向上、反射向下、透射向上；H 方向皆 +y。兩種單位不共尺度。</p><p>即使 Hi、Hr 同向，Ei 與 Er 相反，故兩支波能流方向不同。來源：圖解電磁學 21。</p>')
id='eminterface-continuity'
b=text(30,40,'介面 z = 0；跨界環路（方向示意）')+line(300,70,300,390)
for y,label in [(110,'法拉第：切向 E'),(280,'安培—馬克士威：切向 H')]:
 b+=f'<rect x="275" y="{y}" width="50" height="90" fill="none" stroke="#78e2ca" stroke-width="3"/>'+text(35,y-20,label)+text(340,y+40,'跨界厚度 → 0')+text(340,y+80,'面通量項 → 0')
b+=box(405,['無自由表面電流 → 切向 H 連續','Eᵢ + Eᵣ = Eₜ','(Eᵢ − Eᵣ)/η₁ = Eₜ/η₂'])
b+=text(35,605,'10 − 3.333333 = 6.666667 V/m')+text(35,650,'26.544187 + 8.848062')+text(35,690,'= 35.392250 mA/m')
add(id,'03 總場連續','小環路夾出切向條件','每側接起來的是總場；左側包含入射與反射。',svg(id,'總場切向連續','兩個環路跨介面，分別對應法拉第和安培馬克士威定律；高度縮小得到兩個切向條件。',b,725),'Eᵢ + Eᵣ = Eₜ<br>(Eᵢ − Eᵣ)/η₁ = Eₜ/η₂','<p>高度縮小使有限磁通量／位移電流通量項趨零；磁場條件另須無自由表面電流。若有表面電流或奇異層，須改用相應邊界條件。</p><p>單邊 E 探棒不能證明兩條邊界同時成立，還需相位、位置、方向與 H 的資訊。來源：圖解電磁學 21。</p>')
id='eminterface-solve'
b=box(35,['① 把 Eₜ 換成 Eᵢ + Eᵣ','η₂(Eᵢ − Eᵣ) = η₁(Eᵢ + Eᵣ)'])+box(160,['② 收集反射項','(η₁ + η₂)Eᵣ = (η₂ − η₁)Eᵢ'])+box(285,['③ 除出比值（無單位）','Γ = Eᵣ/Eᵢ = (η₂ − η₁)/(η₂ + η₁)','τ = Eₜ/Eᵢ = 1 + Γ'])+box(455,['q = 0.5：Γ = −1/3；τ = 2/3','固定座標磁場反射比 Hᵣ/Hᵢ = −Γ'])
add(id,'04 聯立求解','先聯立再取振幅比','電場反射係數 Γ，和磁場反射比的符號不同。',svg(id,'聯立求反射係數','三步代數從總場邊界消去透射，解出反射電場比，再求透射電場比。',b,580),'Γ = (q − 1)/(q + 1)<br>τ = 2q/(q + 1)','<p>q = η₂/η₁，兩側正實波阻抗、非零入射，係數皆無單位。負 Γ 表示介面參考相位的電場反相，不代表負功率大小。來源：電磁學（下）16.1。</p>')
def controls(control,reset):
 return f'<div class="phase-controls"><label for="{control}">波阻抗比 q = η₂/η₁ <output id="{control}-value" for="{control}">0.50</output></label><input id="{control}" type="range" min="0.25" max="4" step="0.25" value="0.5"><button id="{reset}" type="button">重設本圖</button><p id="{control}-why" role="status" aria-live="polite"></p></div>'
id='eminterface-ratio-figure'
b=text(30,35,'電場 E（V/m）；共用尺度與正方向')
for i,v in enumerate([10,-10/3,20/3]):
 x=105+180*i
 b+=line(x-35,240,x+35,240)+line(x,240,x,240-v*8,C[i],True,f'eminterface-dynamic-e{i}')+text(x,320,['入射','反射','透射'][i],anchor='middle')
b+=text(30,365,'+x 向上；箭頭長度按場大小繪製。')+text(30,410,'反射波的傳播方向始終為 −z。')
b+='<text id="eminterface-zero" x="190" y="120" hidden="hidden">無反射</text>'
main='<span id="eminterface-ratio-result"></span><br><span id="eminterface-ratio-fields"></span><br><span id="eminterface-ratio-magnetic"></span>'
add(id,'05 調波阻抗','調阻抗，場怎樣分配','自由比較正實波阻抗；並非只調 εr ≥ 1 就能涵蓋全部 q。',svg(id,'波阻抗比與場分配','固定入射電場十，反射與透射場按波阻抗比變化，所有電場箭頭共尺度。',b,445),main,'<p>η₁ = 376.730313564 Ω，η₂ = qη₁，Ei = 10 V/m。Γ = (q−1)/(q+1)，τ = 2q/(q+1)。Hi = Ei/η₁，Hr = −Er/η₁，Ht = Et/η₂。</p><p>Γ = 0 時沒有反射箭頭。表中 H 帶號依固定 +y；正值紙外，負值紙內。來源：電磁學（下）16.1。</p>',controls('eminterface-ratio','eminterface-ratio-reset'))
id='eminterface-large-field'
add(id,'06 場大反例','透射場大，不等於生出能量','固定 q = 2；本圖不隨圖五滑桿連動。',svg(id,'大電場反例','電場按三比一比四皆向上，反射磁場向紙內；透射電場較大但磁場較小。',fields([10,10/3,40/3],[10000/eta,-10000/(3*eta),20000/(3*eta)]),710),'Eₜ = 13.3333 V/m<br>Hₜ = 17.6961 mA/m','<p>左側總 H：26.544187 − 8.848062 = 17.696125 mA/m。E 箭頭共尺度三比一比四；H 以帶號標示方向，長條長度表示大小。下一堂以平均能流核對功率。</p><p>無平均耗散，不表示沒有極化／場的暫存能量。來源：圖解電磁學 21。</p>')
id='eminterface-budget'
b=text(30,40,'平均能流：W/m²（箭頭共尺度）')
for y,a,z,label,value,color in [(140,60,510,'入射 →','0.1327209364',C[0]),(270,110,60,'← 反射','0.0147467707',C[1]),(400,60,460,'透射 →','0.1179741657',C[2])]:
 b+=text(35,y-35,label+' '+value)+line(a,y,z,y,color,True)
b+=box(450,['長度比：9 : 1 : 8','R = 1/9；T = 8/9','Sᵢ − |Sᵣ| = Sₜ'])+text(35,640,'反射有向分量為負；R 記正大小。')
add(id,'07 能量分帳','功率不是把振幅直接相加','固定 q = 0.5；入射十伏特每公尺，以峰值計平均。',svg(id,'平均能量帳','入射向右九份，反射向左一份，透射向右八份，三箭頭按同尺度。',b,680),'R = |Γ|² = 1/9<br>T = (η₁/η₂)|τ|² = 8/9','<p>Si = 100/(2η₀)，|Sr| = Si/9，St = 8Si/9，單位 W/m²。τ² = 4/9 還須乘 η₁/η₂ = 2，不可直接當功率透射率。</p><p>來源：電磁學（下）16.1；圖解電磁學 21。自我檢核：負 Γ 是否表示負的返回功率大小？否；R 是非負大小。</p>')
id='eminterface-power-ratio-figure'
b=text(30,35,'功率比（無單位）')+line(70,80,70,360)+line(70,360,550,360)
for v in [0,.5,1]:
 y=360-v*260;b+=line(70,y,550,y,'#2a3d51')+text(20,y+8,str(v))
for q in [.25,1,2,3,4]:
 x=70+(q-.25)/3.75*480;b+=text(x,395,str(q),anchor='middle')
b+=text(320,435,'q = η₂/η₁（無單位）')
for name,fn,color in [('R',lambda q:((q-1)/(q+1))**2,C[1]),('T',lambda q:4*q/(q+1)**2,C[0])]:
 pts=[]
 for i in range(151):
  q=.25+3.75*i/150;pts.append(f'{70+(q-.25)/3.75*480:.4f},{360-fn(q)*260:.4f}')
 b+=f'<polyline points="{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="3"/>'
 b+=f'<circle id="eminterface-point-{name}" cx="102" cy="{360-fn(.5)*260}" r="7" fill="{color}" stroke="#111f30" stroke-width="2"/>'
b+=line(40,480,100,480,C[1])+text(115,487,'R：返回的平均能量比例')+line(40,530,100,530,C[0])+text(115,537,'T：向前的平均能量比例')
main='<span id="eminterface-power-ratio-result"></span><br><span id="eminterface-power-ratio-flux"></span>'
add(id,'08 驗守恆','逐個比值檢查守恆','本圖獨立於圖五；兩曲線共用 0–1 縱軸，依公式取樣。',svg(id,'功率比曲線','橫軸波阻抗比零點二五到四，縱軸功率比零到一；反射率與透射率相加為一。',b,575),main,'<p>R = ((q−1)/(q+1))²，T = 4q/(q+1)²，R + T = 1。Ei 固定 10 V/m，η₁ = η₀。</p><p>q 與 1/q 的 R 相同但 Γ 符號相反；有限 0.25 或 4 並非理想導體／無限阻抗。來源：圖解電磁學 21。</p>',controls('eminterface-power-ratio','eminterface-power-reset'))
id='eminterface-measure'
b=text(35,35,'材料介面')+text(330,35,'傳輸線負載')+line(300,65,300,340)
b+=text(35,105,'η₁ → η₂')+text(330,105,'Z₀ → ZL')+text(35,170,'Eᵢ / Eᵣ')+text(330,170,'V⁺ / V⁻')+text(35,235,'η = E/H')+text(330,235,'Z₀ = V/I')+text(35,300,'材料行波比')+text(330,300,'線路行波比')
b+=box(360,['Γ = (η₂ − η₁)/(η₂ + η₁)','ΓL = (ZL − Z₀)/(ZL + Z₀)','都用 Ω，但物理量不可任意互換。'])
b+=box(525,['固定 q = 2：τ = 4/3','R = 1/9；T = 8/9','透射場較大，平均能量仍守恆。'])
b+=text(35,705,'VNA 的 S21 不直接等於 Eₜ/Eᵢ。')+text(35,750,'反射少，也可能是吸收或散射。')
add(id,'09 接傳輸線','同一代數，不同物理量','同樣的邊界匹配思路；別把材料波阻抗當成任意線路阻抗。',svg(id,'介面與傳輸線的對應','並排材料波阻抗與線路特性阻抗，再列固定q等於二的守恆結果與量測限制。',b,785),'η = E/H；Z₀ = V/I<br>兩者皆 Ω，定義不同','<p>VNA（向量網路分析儀）需配合天線、參考面與校正；S 參數依埠功率波定義，S21 不能直接當 Et/Ei。反射降低不排除吸收／散射。</p><p>有限厚度薄片有第二介面與多重反射，本課半無限模型未包含。來源：電磁學（下）16.5；圖解電磁學 21。</p>')
lessons=[]; md=['# 介面反射・完整口語稿','正文唯一來源：講稿來源.txt。每堂九段，第三、六、九段停靠；尚未生成正式音檔。']
for li,raw in enumerate(s.split('@@ ')[1:]):
 parts=raw.strip().split('## '); title=parts[0].strip(); segments=[]; md+=['## '+title]
 for si,part in enumerate(parts[1:]):
  st,body=part.split('\n',1);body=body.strip();checkpoint=(si+1)%3==0;fi=li*3+si//3
  seg=dict(id=f'eminterface-{li+1}-{si+1:02}',title=st.strip(),text=body,figure=figs[fi]['id'] if checkpoint else None,checkpoint=checkpoint,audioSrc='')
  segments.append(seg);md+=['### '+str(si+1)+'. '+st.strip(),body]
  if checkpoint:figs[fi]['look']=body.split('\n\n')[-1]
 count=sum(len(re.findall(r'[\u3400-\u9fff]',p['text'])) for p in segments)
 assert 4200<=count<=5000,(li,count)
 lessons.append(dict(id='eminterface-'+['boundary','amplitude','power'][li],title=title,summary=['固定方向，讓兩側總場同時滿足邊界。','從兩式聯立，讀懂場振幅的大小與相位。','補上波阻抗權重，分清振幅與平均能量。'][li],segments=segments))
 print(title,count,'漢字')
(D/'lesson-data.js').write_text('window.EMINTERFACE_AUDIO = '+json.dumps(dict(lessons=lessons,figures=figs),ensure_ascii=False,indent=2)+';\n')
(D/'完整口語稿.md').write_text('\n\n'.join(md)+'\n')
for f in figs:(D/(f['id']+'.svg')).write_text(f['diagram']+'\n')
shutil.copyfile(T/'audio-course.css',D/'audio-course.css')
player=(T/'audio-course.js').read_text().replace('EMFIELD_AUDIO','EMINTERFACE_AUDIO').replace('emfield-listening-v1','eminterface-listening-v1')
# 插在圖卡建成後，通用播放器之前；數值互動獨立於音訊狀態。
widgets=(D/'interface-widgets.js').read_text()
player=player.replace('  const lessons=window.EMINTERFACE_AUDIO?.lessons||[];',widgets+'\n  const lessons=window.EMINTERFACE_AUDIO?.lessons||[];')
(D/'audio-course.js').write_text(player)
(D/'audio-manifest.js').write_text('// 正式音檔尚未製作；無試聽檔，不自動發聲。\nwindow.EMINTERFACE_AUDIO_ASSETS = { segments: {} };\n')
index=(T/'index.html').read_text()
index=index.replace('電場與電位・電磁學聽課室','介面反射・電磁學聽課室').replace('電磁學 / 邊玩邊聽 · 01','電磁學 / 邊玩邊聽 · 07').replace('電場這支箭頭，<br class="mobile-break">怎麼連到電位？','波遇上介面，<br class="mobile-break">場與能量怎麼分？').replace('從空間分量與作功，走到等位線與梯度。','從總場邊界與反射相位，走到平均能量守恆。')
index=re.sub(r'<section class="further-reading">.*?</section>','<section class="further-reading"><h3>想再深入時</h3><p>均勻、線性、等向、無損、半無限材料，正實波阻抗、垂直入射，無自由表面電流。來源：電磁學（下）16.1、16.5。</p><a href="../../圖解電磁學/dist/21-normal-incidence.html">垂直入射與功率圖解 ↗</a><a href="../../圖解電磁學/dist/18-waves.html">電磁波與能流回顧 ↗</a></section>',index)
index=re.sub(r'<footer>.*?</footer>','<footer>固定峰值相量 exp(jωt) · η₀ ≈ 376.730313564 Ω · 三堂二十七段 · 九次看圖停靠 · 尚無正式音檔</footer>',index)
(D/'index.html').write_text(index)

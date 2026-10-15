"""由講稿來源.txt單源建立課程資料、Markdown與九張程式SVG。"""
from pathlib import Path
import re,json,math,html
D=Path(__file__).resolve().parent
EPS=8.8541878128e-12
MU=4*math.pi*1e-7
C=1/math.sqrt(MU*EPS)
ETA=math.sqrt(MU/EPS)
raw=(D/'講稿來源.txt').read_text()
lessons=[]
keys=['propagation','impedance','energy']
summaries=['分清時間與空間，從局部變化找到波速。','用右手方向與材料參數，配對 E、H 與 B。','從瞬時能流到平均功率，確認單位、面向與量測邊界。']
figids=['snapshot','equation','frequency-figure','triad','material','reverse','instant','average','area']
for li,block in enumerate(re.split(r'^# ',raw,flags=re.M)[1:]):
 title=block.split('\n',1)[0];segments=[]
 for si,part in enumerate(re.split(r'^## ',block,flags=re.M)[1:]):
  heading,body=part.split('\n',1); checkpoint=(si+1)%3==0
  segments.append(dict(id=f'emwave-{li+1}-{si+1:02}',title=heading,text=body.strip(),figure='emwave-'+figids[li*3+si//3] if checkpoint else None,checkpoint=checkpoint,audioSrc=''))
 assert len(segments)==9
 count=sum(len(re.findall(r'[\u3400-\u9fff]',s['text'])) for s in segments)
 assert 4200<=count<=5000,count
 lessons.append(dict(id='emwave-'+keys[li],title=title,summary=summaries[li],segments=segments))
colors={'mint':'#78e2ca','amber':'#ffc67b','blue':'#8db8ff','pink':'#ef9dbb','axis':'#8ba0b3'}
def txt(x,y,s,c='',anchor='start',id=''):
 return f'<text x="{x}" y="{y}" class="{c}" text-anchor="{anchor}"'+(f' id="{id}"' if id else '')+'>'+html.escape(str(s))+'</text>'
def line(x1,y1,x2,y2,c='axis',arrow=False):
 return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="{c}"'+(f' marker-end="url(#CURRENT-{c.split()[0]}-arrow)"' if arrow else '')+'/>'
def path(points,c='mint',id=''):
 return '<path'+(f' id="{id}"' if id else '')+' class="'+c+'" d="'+' '.join(('M' if i==0 else 'L')+f'{x:.3f},{y:.3f}' for i,(x,y) in enumerate(points))+'"/>'
def curve(fn,xmin,xmax,ymin,ymax,top=85,bottom=330,left=85,right=550,c='mint',id=''):
 return path([(left+(right-left)*i/240,bottom-(fn(xmin+(xmax-xmin)*i/240)-ymin)/(ymax-ymin)*(bottom-top)) for i in range(241)],c,id)
def axes(xmin,xmax,ymin,ymax,xticks,yticks,xlabel,ylabel,top=85,bottom=330,left=85,right=550):
 b=txt(30,top-35,ylabel,'small')+line(left,bottom,right,bottom)+line(left,top,left,bottom)
 for x in xticks:
  xx=left+(x-xmin)/(xmax-xmin)*(right-left);b+=line(xx,top,xx,bottom,'grid')+txt(xx,bottom+30,f'{x:g}','small','middle')
 for y in yticks:
  yy=bottom-(y-ymin)/(ymax-ymin)*(bottom-top);b+=line(left,yy,right,yy,'grid')+txt(left-12,yy+7,f'{y:g}','small','end')
 return b+txt(right,bottom+67,xlabel,'small','end')
def dot(x,y,c='amber',id=''):
 return f'<circle cx="{x}" cy="{y}" r="7" fill="{colors[c]}"'+(f' id="{id}"' if id else '')+'/>'
def svg(id,title,desc,body,h=470):
 defs=''.join(f'<marker id="{id}-{k}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="{v}"/></marker>' for k,v in colors.items())
 style='text{font-family:system-ui,sans-serif;fill:#eef3f6;font-size:24px}.small{font-size:21px}.big{font-size:27px;font-weight:650}.grid{stroke:#33465a;stroke-width:1}.axis{stroke:#8ba0b3;stroke-width:1.7}.dash{stroke-dasharray:7 6}'+''.join('.'+k+'{stroke:'+v+';fill:none;stroke-width:3}' for k,v in colors.items())
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {h}" role="img" aria-labelledby="{id}-title {id}-desc"><title id="{id}-title">{html.escape(title)}</title><desc id="{id}-desc">{html.escape(desc)}</desc><defs>{defs}</defs><style>{style}</style><rect width="600" height="'+str(h)+'" fill="#111f30"/>'+body.replace('CURRENT',id)+'</svg>'
figures=[]
def controls(inputid,label,low,high,step,value,reset):
 return f'<div class="wave-controls"><label for="{inputid}">{label}</label><input id="{inputid}" type="range" min="{low}" max="{high}" step="{step}" value="{value}"><output id="{inputid}-value" for="{inputid}"></output><button id="{reset}" type="button">恢復預設</button><div id="{inputid}-results" class="wave-results" aria-live="polite"></div><p id="{inputid}-why"></p></div>'
def add(key,title,subtitle,desc,b,h,values,detail,extra=''):
 id='emwave-'+('frequency-figure' if key=='frequency' else key);i=len(figures);im=svg(id,title,desc,b,h)
 (D/(id+'.svg')).write_text(im+'\n')
 seg=lessons[i//3]['segments'][(i%3+1)*3-1]
 figures.append(dict(id=id,short=f'{i+1:02} '+title.split('，')[0],title=title,subtitle=subtitle,look=seg['text'].split('\n\n')[-1],diagram=im,extra=extra,takeaways=''.join(f'<div class="takeaway"><span>{a}</span><strong>{v}</strong></div>' for a,v in values),detail=detail+'<p>來源：本地《電磁學（下）》第 14.1–14.3、15.1 節；圖解電磁學第 18、19 頁。</p>'))
# 1：真餘弦採樣，空間軸用波長。
b=axes(0,2,-100,100,[0,.5,1,1.5,2],[-100,0,100],'位置 z / λ（無單位）','Ex（V/m）；畫面高度代表 x 分量')
b+=curve(lambda u:100*math.cos(-2*math.pi*u),0,2,-100,100)
b+=curve(lambda u:100*math.cos(math.pi/2-2*math.pi*u),0,2,-100,100,c='amber')
b+=line(90,425,135,425,'mint')+txt(145,433,'t = 0','small')+line(300,425,345,425,'amber')+txt(355,433,'t = T / 4','small')
b+=line(317.5,63,375.625,63,'amber',True)+txt(35,570,'上方橘箭：峰向 +z 移 λ / 4','small')
b+=txt(35,485,'λ ≈ 2.997925 m；T = 10 ns','small')+txt(35,525,'E = 100 cos(ωt − βz) V/m','small')
add('snapshot','快照不是粒子路徑','真空、100 MHz、沿 +z 傳播；兩條是不同時間的空間快照。','橫軸為位置除波長，零到二。縱軸電場分量負一百到正一百。橘色波峰比綠色向右四分之一波長。',b,610,[('空間尺','λ ≈ 2.998 m'),('時間尺','T = 10 ns'),('固定相位','dz/dt = ω/β > 0')],'<p>ω = 2πf，β = 2π/λ。相位 ωt − βz 固定，t 增加時 z 必須增加。曲線高度是場分量，不是電子位置；箭頭只標移動方向。</p><p>自我檢核：負波峰是否表示粒子在下方？答案：不是，它表示當地 Ex 沿負 x。</p>')
# 2：兩張曲線都是實際座標，分上下以保留手機可讀性。
b=txt(28,38,'∂Ex/∂z = −μ ∂Hy/∂t','big')+txt(28,80,'∂Hy/∂z = −ε ∂Ex/∂t','big')+txt(28,130,'再對 z 微分，代入第二式：','small')+txt(28,175,'∂²Ex/∂z² = με ∂²Ex/∂t²','big')
b+=axes(-1,1,0,100,[-1,0,1],[0,100],'位置 z（m），t = 0','Ex（V/m）',top=255,bottom=415)
b+=curve(lambda z:100*math.cos(2*math.pi*z/(C/1e8)),-1,1,0,100,top=255,bottom=415)
# restrict plotted portion to +/- lambda/4? actual function below0 at +/-1; adjust plot y min -60
# replace prior plot panel with true y range accommodating all values
b=b[:b.index('<text x="30" y="220"')]+axes(-1,1,-60,100,[-1,0,1],[-50,0,100],'位置 z（m），t = 0','Ex（V/m）',top=255,bottom=415)+curve(lambda z:100*math.cos(2*math.pi*z/(C/1e8)),-1,1,-60,100,top=255,bottom=415)
b+=axes(-3,3,-60,100,[-3,0,3],[-50,0,100],'時間 t（ns），z = 0','Ex（V/m）',top=555,bottom=715)+curve(lambda t:100*math.cos(2*math.pi*t/10),-3,3,-60,100,top=555,bottom=715,c='amber')
b+=txt(30,820,'−β² E = με (−ω² E)','big')+txt(30,870,'vp = ω / β = 1 / √(με)','big')+txt(30,915,'同樣向下彎；橫軸單位不可混同。','small')
add('equation','二階變化怎樣配對','沒有自由源、均勻常 ε 與 μ、無損；兩次微分是看斜率如何再變。','上方列出兩條旋度式及波動方程。中間分別以公尺與奈秒作橫軸的真餘弦曲線，在波峰都向下彎。下方連到相位速度。',b,955,[('空間二階','−β² E'),('時間二階','−ω² E'),('相位速度','1 / √(με)')],'<p>對第一式求 z 偏導並交換平滑場的混合偏導，再代第二式。材料常數把每公尺平方的變化與每秒平方的變化連起來。波峰兩側曲率皆負；不能比較畫面斜率來求速度。</p><p>自我檢核：這裡無源是否表示沒有發射端？答案：不是，來源可在研究區域之外。</p>')
# 3
b=axes(0,6,-100,100,[0,2,4,6],[-100,0,100],'位置 z（m），t = 0','Ex（V/m）')+curve(lambda z:100*math.cos(2*math.pi*z/(C/1e8)),0,6,-100,100,id='emwave-frequency-curve')+txt(30,445,'固定六公尺；改頻率不改峰值與 c。','small')
add('frequency','頻率改變，波速未必變','先讀第一堂再自由調整；真空，電場峰值固定 100 V/m。','固定零到六公尺的空間快照。頻率升高時波長縮短，圖上起伏變密；速度與峰值固定。',b,485,[('時間觀察','固定位置量 T'),('空間觀察','比較兩位置相位'),('波速','vp = fλ = c')],'<p>λ = c/(f × 10⁶)，T = 1000/f ns，β = 2π/λ。50 / 100 / 200 MHz 對應 20 / 10 / 5 ns。單探棒不能獨自證明波向；雙通道須校正延遲與整週期模糊。</p><p>自我檢核：頻率加倍，速度加倍嗎？答案：此真空模型速度不變，波長減半。</p>',controls('emwave-frequency','頻率 f（MHz）',50,200,10,100,'emwave-frequency-reset'))
# 4
b=txt(30,42,'右手座標：x 向上、y 出紙、z 向右','small')
for oy,sgn,label in [(245,1,'正波峰'),(550,-1,'半週後')]:
 b+=txt(35,oy-150,label,'big')+line(160,oy,460,oy,'axis',True)+txt(470,oy+8,'+z','small')+line(160,oy,160,oy-120*sgn,'mint',True)+txt(190,oy-95*sgn,'E：'+('+x' if sgn==1 else '−x'),'small')
 b+=f'<circle cx="160" cy="{oy}" r="20" class="blue"/>'
 if sgn==1:b+=dot(160,oy,'blue')
 else:b+=line(148,oy-12,172,oy+12,'blue')+line(148,oy+12,172,oy-12,'blue')
 b+=txt(210,oy+47,'H：'+('+y 出紙' if sgn==1 else '−y 入紙'),'small')+line(330,oy+85,470,oy+85,'amber',True)+txt(310,oy+125,'E × H 沿 +z','small')
b+=txt(30,730,'E₀ = 100 V/m；H₀ ≈ 0.265442 A/m','small')+txt(30,770,'B₀ ≈ 0.333564 μT；方向示意','small')
add('triad','單一前進波的三方向','三個方向正交；不同物理量的箭長不比較大小，皆為方向示意。','正波峰電場向上、磁場出紙，半週後電場向下、磁場入紙，兩組叉積均向右。',b,810,[('電場／磁場強度','E₀ / H₀ = η₀'),('電場／磁通密度','E₀ / B₀ = c'),('半週後','兩場反向，波向不變')],'<p>H = (k̂ × E)/η，B = μH。k̂ 是傳播方向單位向量。x × y = z；(−x) × (−y) = z。同相描述時間，不表示向量平行。</p><p>自我檢核：H 的單位是特斯拉嗎？答案：H 是 A/m；B 才是 T。</p>')
# 5
b=axes(1,9,0,1,[1,4,9],[0,.5,1],'相對介電常數 εr（無單位）','vp/c 與 η/η₀（皆無單位）')+curve(lambda e:1/math.sqrt(e),1,9,0,1,c='mint')+curve(lambda e:1/math.sqrt(e),1,9,0,1,c='amber dash')+dot(85+465*3/8,330-245*.5,id='emwave-material-dot')+txt(30,440,'綠實線 vp/c；橘虛線 η/η₀（重合）','small')+txt(30,480,'每個介質各自指定 E₀ = 100 V/m。','small')
add('material','同一材料的兩種比值','固定 μr = 1、f = 100 MHz；各材料獨立比較，不是穿越介面。','速度與阻抗的相對比例都為相對介電常數平方根的倒數，兩曲線重合。圓點隨控制值移動。',b,525,[('速度','c / √εr'),('波阻抗','η₀ / √εr'),('固定 E₀','H₀ = 100 / η')],'<p>εr = 1 / 4 / 9 時，速度與阻抗各為真空的 1 / 1/2 / 1/3。若改的是 μr，速度與阻抗趨勢不同。沒有實作入射介面，不宣稱透射電場保持不變。</p><p>自我檢核：阻抗下降且指定 E₀ 不變，H₀ 如何變？答案：增加。</p>',controls('emwave-epsilon','相對介電常數 εr（無單位）',1,9,1,4,'emwave-material-reset'))
# 6 cards vertical so mobile text retains size
b=''
for oy,sgn,label in [(220,1,'前波 +z'),(530,-1,'反波 −z')]:
 b+=txt(30,oy-165,label,'big')+line(260,oy,260,oy-120,'mint',True)+txt(285,oy-100,'E 沿 +x','small')+line(260,oy,260+220*sgn,oy,'amber',True)+txt(330 if sgn==1 else 40,oy+42,'波向 '+('+z' if sgn==1 else '−z'),'small')
 b+=f'<circle cx="260" cy="{oy}" r="19" class="blue"/>'
 if sgn==1:b+=dot(260,oy,'blue')
 else:b+=line(248,oy-12,272,oy+12,'blue')+line(248,oy+12,272,oy-12,'blue')
 b+=txt(35,oy+93,'H'+('前 = +E前 / η₀；+y 出紙' if sgn==1 else '反 = −E反 / η₀；−y 入紙'),'small')
b+=txt(30,690,'總 E = E前 + E反','big')+txt(30,735,'總 H = (E前 − E反) / η₀','big')+txt(30,785,'總場比值未必是 η₀；箭頭為方向示意。','small')
add('reverse','波往回走，磁場方向也要重算','兩卡採相同右手座標：+x 上、+y 出紙、+z 右；真空 E₀ 均 100 V/m。','前波電場向上、磁場出紙、波向右。反波電場向上、磁場入紙、波向左。相加時磁場相減。',b,825,[('前波','H前 = +E前 / η₀'),('反波','H反 = −E反 / η₀'),('相量時間慣例','e^(jωt)')],'<p>前進空間因子 e^(−jβz)；反進 e^(+jβz)。總場須先向量相加，不能套單一行波比例。近場、駐波與損耗介質另需模型。單量 E 不足證明平面行波。</p><p>自我檢核：兩波同位置 E 相等時總 H 為何？答案：依上述方向相消為零。</p>')
# 7
b=axes(0,1,-1,1,[0,.25,.5,.75,1],[-1,0,1],'時間 t / T（固定位置）','E/E₀、H/H₀（無單位）',top=80,bottom=275)+curve(lambda u:math.cos(2*math.pi*u),0,1,-1,1,top=80,bottom=275)+curve(lambda u:math.cos(2*math.pi*u),0,1,-1,1,top=80,bottom=275,c='amber dash')
b+=txt(30,380,'綠實線 E/E₀；橘虛線 H/H₀（重合）','small')
b+=axes(0,1,0,30,[0,.25,.5,.75,1],[0,15,30],'時間 t / T','Sz（W/m²），始終沿 +z',top=465,bottom=670)+curve(lambda u:1e4/ETA*math.cos(2*math.pi*u)**2,0,1,0,30,top=465,bottom=670,c='blue')
b+=txt(30,785,'φ：0、π/2、π、3π/2','small')+txt(30,827,'Sz：26.5442、0、26.5442、0 W/m²','small')
add('instant','兩場反號，能流沒有倒退','固定位置，真空 E₀ = 100 V/m；正規化場與真正能流分軸。','上圖兩場同相的餘弦曲線重合，下圖為非負的餘弦平方能流。場的負半週依然具有正向能流。',b,870,[('瞬時能流','S = E × H'),('固定本例','Sz = E² / η₀ ≥ 0'),('最大瞬時值','26.544187 W/m²')],'<p>單一 +z 行波的兩場一起反號，叉積仍 +z。cos² 在一個場週期中出現兩次峰值。平均場為零，不等於平均能流為零。</p><p>自我檢核：能流負半週會倒流嗎？答案：本例沒有負能流半週。</p>')
# 8
b=axes(0,200,0,60,[0,50,100,150,200],[0,20,40,60],'電場峰值 E₀（V/m）','平均 S（W/m²）')+curve(lambda e:e*e/(2*ETA),0,200,0,60)+dot(317.5,330-1e4/(2*ETA)/60*245,id='emwave-average-dot')+txt(30,445,'真採樣拋物線；面積 A = 0.02 m²','small')
add('average','振幅兩倍，平均能流四倍','真空單一行波；面片正對波向。改振幅不改頻率與速度。','平均能流按電場峰值平方上升。圓點沿真採樣拋物線移動，零振幅對應零功率。',b,485,[('峰值公式','平均 S = E₀² / (2η₀)'),('有效值公式','平均 S = Erms² / η₀'),('穿面功率','P = 平均 S × A')],'<p>Erms = E₀/√2，Hrms = Erms/η₀。使用同相有效值相乘不再除 2。50 / 100 / 200 V/m 對應平均能流 3.3180 / 13.2721 / 53.0884 W/m²。</p><p>自我檢核：峰值從 100 降到 50，功率降幾倍？答案：變成四分之一。</p>',controls('emwave-amplitude','電場峰值 E₀（V/m）',0,200,10,100,'emwave-average-reset'))
# 9 all physical schematic plane perpendicular its normal in projected z/x plane
b=txt(25,35,'截面方向示意：面片垂直自己的法向','small')
for i,(theta,power) in enumerate([(0,.02*1e4/(2*ETA)),(60,.01*1e4/(2*ETA)),(90,0)]):
 cy=155+i*235;cx=300;a=math.radians(theta);nx=math.cos(a);ny=-math.sin(a);tx=math.sin(a);ty=math.cos(a)
 b+=line(50,cy,530,cy,'blue',True)+txt(45,cy-40,'S → +z','small')+line(cx-80*tx,cy-80*ty,cx+80*tx,cy+80*ty,'mint')+line(cx,cy,cx+120*nx,cy+120*ny,'amber',True)
 b+=txt(440,cy-88,f'θ = {theta}°','small')+txt(430 if theta==0 else 320,cy-25 if theta==0 else cy-110,'n̂','small')+txt(35,cy+110,f'P ≈ {power:.7f} W','small')
b+=txt(30,850,'P = 平均 S × A cosθ；A = 0.02 m²','small')+txt(30,900,'平均 u ≈ 4.427094 × 10⁻⁸ J/m³','small')+txt(30,945,'c × 平均 u ≈ 13.272094 W/m²','small')
add('area','方向與面積都要算','θ 是面法向與 +z 的夾角；綠線為面片截面、橘箭為法向、藍箭為能流。','三個面片法向依次與能流夾零、六十、九十度。每個面片垂直其法向。穿面功率依次為約零點二六五四四、零點一三二七二與零瓦。',b,990,[('正對面','P ≈ 0.2654419 W'),('法向 60°','P ≈ 0.1327209 W'),('法向 90°','P = 0 W')],'<p>幾何示意不是實體散射模型。平均 S ≈ 13.272094 W/m²；平均 u = ε₀E₀²/2，且本例平均 S = c 平均 u。功率計讀端口功率，還需天線有效面積、匹配及偏振資訊才能推回空間能流。</p><p>自我檢核：角度是對面片量，還是對法向量？答案：對面法向量。</p>')
data={'lessons':lessons,'figures':figures}
(D/'lesson-data.js').write_text('window.EMWAVE_AUDIO = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
total=sum(len(re.findall(r'[\u3400-\u9fff]',s['text'])) for l in lessons for s in l['segments'])
md=f'# 電磁波與能量：完整口語稿\n\n由講稿來源.txt單源生成；三堂二十七段、九次看圖停靠。正文共 {total} 漢字；實際音長未生成，按 240–280 字／分估算每堂約 16–20 分鐘，不含停靠。\n\n'
for lesson in lessons:
 md+='## '+lesson['title']+'\n\n'
 for i,s in enumerate(lesson['segments']):
  md+='### '+str(i+1)+'. '+s['title']+'\n\n'+s['text']+'\n\n'
  if s['figure']:md+='〔看圖停靠：'+s['figure']+'〕\n\n'
(D/'完整口語稿.md').write_text(md)
print('建立 3 堂、27 段、9 圖；漢字：',*[sum(len(re.findall(r'[\u3400-\u9fff]',s['text'])) for s in l['segments']) for l in lessons])

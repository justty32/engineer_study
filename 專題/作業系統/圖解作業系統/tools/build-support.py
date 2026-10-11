#!/usr/bin/env python3
"""重建 builder 所有的首頁、字典與互動規格；不寫章節 HTML。"""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
sys.path.insert(0, str(REPO / 'wf' / 'tools'))
from tabledb import Table
D = ROOT / 'dist'
LESSONS = [
 ('00-role','作業系統在忙什麼',0),('01-process','行程的三種狀態',0),('02-fork','建立、換程式與等待',0),
 ('03-scheduling','先到先做，還是短的先做',1),('04-round-robin','輪流使用 CPU',1),('05-feedback','回饋佇列',1),
 ('06-threads','執行緒與共享資料',2),('07-mutex','互斥鎖與競態',2),('08-condition','條件變數與號誌',2),('09-deadlock','死結與等待關係',2),
 ('10-address-space','每個行程的位址空間',3),('11-paging','把記憶體分成頁',3),('12-translation','追蹤一次位址轉換',3),('13-page-fault','遇到缺頁怎麼辦',3),('14-replacement','頁框滿了，換誰出去',3),
 ('15-file-descriptors','檔案描述元與讀取位置',4),('16-file-system','路徑、索引節點與資料塊',4),('17-durability','斷電後還留下什麼',4),
 ('18-io','裝置、驅動與中斷',5),('19-system-call','一次 read 的旅程',5)]
GROUPS = ['從程式到行程','把 CPU 分給大家','一起做事不打架','從位址找到資料','資料如何留下來','跨過軟硬體邊界']
# 詞條為產品文案；HTML 本身包含全文，沒有執行期資料請求。
TERMS = [
 ('os','作業系統','Operating system, OS','00-role','作業系統負責管理 CPU、記憶體與裝置，讓不同程式安全地共用它們。程式提出服務請求，核心檢查後操作受保護的資源；作業系統還包含核心之外的系統工具。'),
 ('kernel','核心','Kernel','00-role','核心是在較高權限下執行、管理資源的程式部分。它處理系統呼叫、中斷與排程；核心不是另一顆 CPU，也不是所有應用程式都能直接進入的函式庫。'),
 ('cpu','中央處理器','Central processing unit, CPU','00-role','CPU 依指令改變暫存器與記憶體狀態。這門課的排程範例固定一顆 CPU，一個時刻只執行一個行程；真實電腦可有多個核心。'),
 ('process','行程','Process','01-process','行程是正在執行的程式及其狀態，包括位址空間、暫存器與開啟檔案等。程式檔是靜態指令，行程則有自己的生命週期；同一份程式可以啟動多個行程。'),
 ('ready','就緒','Ready','01-process','行程已具備繼續執行所需條件，只差 CPU。排程器可以從就緒佇列選它；「正在等待」不一定是阻塞，也可能只是等 CPU。'),
 ('blocked','阻塞','Blocked','01-process','行程正在等某個事件，例如讀取資料完成，暫時不能只靠分到 CPU 繼續。事件完成後通常先回就緒，再等待排程；醒來不等於立刻執行。'),
 ('context-switch','情境切換（亦稱內容／上下文切換）','Context switch','01-process','核心保存舊執行者的必要 CPU 狀態，再載入下一位的狀態。這讓暫停的工作日後能接著走；本課排程計算設切換成本為零，真實系統需要成本。'),
 ('fork','建立子行程','fork','02-fork','在本課的類 Unix 模型中，fork 成功後父子行程都從呼叫之後繼續：父行程拿到子行程識別碼，子行程拿到 0。失敗只返回父行程，不會多出一個子行程。'),
 ('exec','替換行程程式映像','exec','02-fork','exec 把目前行程的程式映像換成新程式，保留行程身分。成功後執行新程式，不再返回舊呼叫點；失敗才回到原程式處理錯誤。'),
 ('wait','等待與回收子行程','wait','02-fork','父行程可用 wait 類呼叫取得子行程結束狀態並回收相關記錄。子行程還沒結束時可阻塞；排程順序不能只由父子程式碼的排版推斷。'),
 ('scheduler','排程器','Scheduler','03-scheduling','排程器決定下一個使用 CPU 的就緒行程。它依所選政策做決定，不能直接把仍在等 I/O 的阻塞行程排來執行。'),
 ('fcfs','先到先服務','First come, first served, FCFS','03-scheduling','就緒工作按到達次序執行，本課採非搶占模型。早到的長工作會讓後面的短工作等很久；規則簡單不代表回應時間一定短。'),
 ('sjf','最短工作優先','Shortest job first, SJF','03-scheduling','每次 CPU 空出時，在已到達的工作中選所需 CPU 時間最短者。本課知道工作長度且不搶占；它不會挑還沒到達的工作，也不是最短剩餘時間政策。'),
 ('round-robin','輪轉排程','Round robin, RR','04-round-robin','行程最多執行一個時間片，未完成就排回就緒佇列尾端。短時間片可讓大家較快輪到，但真實系統會承擔更多切換成本。'),
 ('quantum','時間片','Time quantum','04-round-robin','時間片是一次最多可連續使用 CPU 的時間上限，範例單位為毫秒（ms）。工作提早完成就讓出 CPU；時間片不是每個行程的總工作量。'),
 ('mlfq','多層回饋佇列','Multilevel feedback queue, MLFQ','05-feedback','排程器以多個優先級佇列，根據已觀察到的執行行為調整工作的位置。本課規則明列時間配額與降級條件；真實系統的升級、配額及防飢餓政策可以不同。'),
 ('thread','執行緒','Thread','06-threads','執行緒是可獨立被排程的一條執行路線。同一行程的執行緒通常共享位址空間與開啟檔案，但各有必要的暫存器狀態與堆疊。'),
 ('mutex','互斥鎖','Mutex','07-mutex','互斥鎖讓合作的執行緒一次只由一位進入受保護區段。只有所有相關存取都遵守同一鎖規則，才能保住共享狀態；鎖不會自動修正錯誤演算法。'),
 ('condition-variable','條件變數','Condition variable','08-condition','條件變數讓執行緒等待共享狀態改變。wait 會配合互斥鎖釋放與重新取得；醒來後用 while 重查條件，通知本身不是可累積的工作數。'),
 ('semaphore','號誌','Semaphore','08-condition','號誌維護可用許可的計數，取得許可時扣減，歸還或發布許可時增加。它可表示資源名額或事件數；不能直接把條件變數通知當成同樣的計數。'),
 ('deadlock','死結','Deadlock','09-deadlock','一群工作各自拿著資源，又等待另一位釋放資源，形成無法自行前進的等待關係。單一實例資源的等待環可作判據；多實例資源需要更多條件才能下結論。'),
 ('address-space','位址空間','Address space','10-address-space','位址空間是行程可以使用的位址與映射規則。不同程式中的同一虛擬位址可以指向不同實體位置；看見相同數字不代表共享同一份資料。'),
 ('virtual-address','虛擬位址','Virtual address, VA','10-address-space','虛擬位址是程式送出的位元組編號，需依目前行程的映射轉換。11–12 課範例用 16 位元位址，範圍 0～65535；這只是教學大小，不代表真實作業系統的位址寬度。'),
 ('physical-address','實體位址','Physical address, PA','12-translation','實體位址是位址轉換後用來存取實體記憶體的位置。本課先取得頁框號再加頁內位移；映射或權限檢查失敗時，不能把算出的數字當成可合法讀取的位置。'),
 ('page','頁','Page','11-paging','頁是虛擬位址空間中的固定大小區塊，11–12 課範例用 1 KiB = 1024 B。頁號標示第幾塊，頁內位移標示塊內的第幾個位元組；頁號本身沒有 byte 單位。'),
 ('frame','頁框','Page frame','11-paging','頁框是 RAM 中和頁一樣大的實體區塊。虛擬頁可映射到某個頁框；同一個 VPN 在不同行程不必映到同一 PFN。'),
 ('page-table','頁表','Page table','12-translation','頁表保存虛擬頁到實體頁框的映射和狀態、權限等資訊。頁表條目並非只存一個數字；有 PFN 不代表這次存取一定被允許。'),
 ('vpn','虛擬頁號','Virtual page number, VPN','12-translation','VPN 是虛擬位址除以頁面大小後的整數商。本例 4660 ÷ 1024 = 4 餘 564，因此 VPN = 4；VPN 是索引，不是 4 B。'),
 ('pfn','實體頁框號','Page frame number, PFN','12-translation','PFN 標示實體頁框的位置。本例 PFN = 9，頁框起點為 9 × 1024 = 9216 B；PFN 與 VPN 不必相等。'),
 ('offset','頁內偏移（亦稱頁內位移）','Page offset','12-translation','頁內位移是虛擬位址除以頁面大小後的餘數。頁與頁框同樣大，所以轉換時保留位移；1 KiB 頁的位移範圍為 0～1023 B。'),
 ('tlb','轉址快取（轉譯後備緩衝區）','Translation lookaside buffer, TLB','12-translation','TLB 是處理器快取近期位址轉換結果的地方。命中可省下頁表走訪；未命中只表示需要查映射，不能直接推出頁不在 RAM。'),
 ('page-fault','缺頁例外','Page fault','13-page-fault','位址轉換或存取檢查遇到需核心處理的狀態時會發生例外；不同架構的分類用語有差異。本課分開觀察未駐留、未映射與保護錯誤；處理不一定需要磁碟 I/O。'),
 ('replacement','分頁置換','Page replacement','14-replacement','需要頁框而可用頁框不足時，系統依政策選擇替換對象。被修改的髒頁可能需要寫回；本課 FIFO 與 LRU 例子只比較已明示的頁參考模型。'),
 ('fd','檔案描述元','File descriptor, fd','15-file-descriptors','fd 是行程檔案描述元表中的小整數索引。表格條目指向開啟檔案描述；同一個 fd 數字在不同行程未必指向同一檔案。'),
 ('open-file-description','開啟檔案描述','Open file description','15-file-descriptors','核心的開啟檔案描述保存目前偏移量與檔案狀態等資訊。dup 或 fork 可讓多個 fd 共享它；另一次 open 通常建立自己的開啟檔案描述。'),
 ('inode','索引節點','Index node, inode','16-file-system','inode 保存檔案的中繼資料與尋找資料塊所需資訊。目錄中的名稱連到 inode；名稱不是放在同一個 inode 中的唯一標籤，一個 inode 可有多個硬連結名稱。'),
 ('journal','日誌','Journal','17-durability','日誌先記錄一組更新及其提交狀態，讓崩潰復原知道哪些更新能重放。具體保證取決於日誌模式、寫入順序與裝置行為；不能僅憑有日誌就宣稱任何資料都不會遺失。'),
 ('fsync','同步檔案更新','fsync','17-durability','fsync 要求系統把指定檔案的必要更新同步到持久儲存，成功語意仍受系統與裝置契約影響。新建或重命名牽涉的目錄更新可能還需同步目錄。'),
 ('interrupt','中斷','Interrupt','18-io','中斷讓處理器轉去處理裝置或其他事件。裝置完成工作可通知核心，核心再讓等待行程回到就緒；中斷本身不代表該行程立即取得 CPU。'),
 ('dma','直接記憶體存取','Direct memory access, DMA','18-io','裝置可在核心安排的緩衝區與裝置之間搬資料，減少 CPU 逐個位元組搬運的工作。CPU 仍需設定、檢查完成與處理一致性及權限；DMA 不表示裝置可任意寫所有記憶體。'),
 ('system-call','系統呼叫','System call','19-system-call','程式透過受控入口請核心提供服務，例如讀檔。核心檢查參數、權限與狀態後執行；這次跨權限邊界不必然切換成另一個行程。'),
]
CONCEPTS = [
 ('time-metrics','回應、周轉與等待','Response / turnaround / waiting time','03-scheduling','到達時間為 A、首次開始為 S、完成為 C、CPU 工作量為 B，則 R = S − A、T = C − A。本課無阻塞 I/O 的模型才可直接以 W = T − B 算就緒等待；有 I/O 時需另拆阻塞時間。'),
 ('concurrency','並行與平行','Concurrency / parallelism','06-threads','並行是多條工作在同一段期間交錯前進，單 CPU 也能做到；平行是不同工作在同一時刻執行，需要多個執行資源。兩者都可能要處理共享狀態，但不能把交錯順序當成未同步 C/C++ 資料競態的執行保證。'),
 ('atomicity','不可分割的更新','Atomicity','07-mutex','讀出、加一、寫回是多個動作，另一條執行緒可在其間介入。保護整個必要區段才能維持不變量；單一行高階程式碼不必然是不可分割操作。'),
 ('miss-vs-fault','快取未命中與缺頁','TLB miss / page fault','12-translation','TLB 未命中後仍可在頁表找到 present = 1 且允許存取的頁，轉換便能繼續。頁不存在、未駐留或權限不符才走各自的處理分支；分支原因決定後續動作，不是所有錯誤都去磁碟找資料。'),
 ('persistence','可見與持久','Visibility / durability','17-durability','write 成功後其他讀取可能看得到資料，但斷電後能否保留是另一個條件。核心快取、裝置快取與持久儲存是不同位置；必須依同步契約與崩潰點推演，不能用 close 成功代替落盤證明。'),
]

def shell(page, title, content, klass='lesson'):
    return f'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(title)}｜圖解作業系統</title><meta name="description" content="繁體中文作業系統機制課：完整例解、原創狀態圖與可自由操作的教具。"><link rel="stylesheet" href="lab.css"><script src="app.js" defer></script></head>
<body data-page="{page}"><a class="skip-link" href="#main">跳到內容</a><aside class="sidebar"><a class="brand" href="index.html">圖解作業系統</a><p>從一段程式，到整台電腦。</p><nav aria-label="課程導覽"><a href="index.html">課程地圖</a><a href="00-role.html">00 零基礎起點</a><a href="glossary.html">名詞字典</a></nav><a class="site-link" href="https://justty32.github.io/engineer_study/">回工程學習主站 ↗</a></aside><main id="main" class="{klass}">{content}</main></body></html>\n'''

def build_index():
    groups = []
    for n, title in enumerate(GROUPS):
        links = ''.join(f'<li><a href="{slug}.html"><span class="nav-number">{slug[:2]}</span>{name}</a></li>' for slug,name,g in LESSONS if g == n)
        groups.append(f'<section class="course-group"><h2><span class="group-no">{n+1}</span>{title}</h2><ol>{links}</ol></section>')
    content = '''<header class="lesson-header"><p class="eyebrow">Operating systems · 20 個機制課</p><h1>程式跑起來之後，誰在安排一切？</h1><p class="lead">跟著一個行程，親手排一次 CPU、找一次記憶體，再追到資料落盤。每課都有圖、完整演算與可以重做的練習。</p></header>
<div class="workbench"><section class="start-panel"><p class="eyebrow">從這裡開始</p><h2>先分清楚三個角色</h2><p>程式提出需求、核心管理資源、硬體執行動作。第 00 課從這個最小模型出發，不要求先背名詞。</p><div class="start-links"><a href="00-role.html">開始第 00 課 →</a><a href="glossary.html">遇到名詞再查</a></div></section><section class="start-panel"><p class="eyebrow">先看一個完整例子</p><h2>把規則變成能檢查的步驟</h2><p>看完題目、圖與完整解，再改一個條件觀察原因。所有章節可直接瀏覽，沒有分數或解鎖門檻。</p><div class="start-links"><a href="04-round-robin.html#worked-example">排一輪 CPU</a><a href="12-translation.html#worked-example">拆一個位址</a></div></section></div>
<div class="course-map" aria-label="依概念順序排列的課程地圖">''' + ''.join(groups) + '''</div><p class="map-note">建議按 00 → 19 前進。00–02 是排程與同步的起點；10–11 是位址轉換的前置；15–18 最後在 19 課串成一次 read。各課開頭另有直接的前置連結。</p><p class="map-note">圖與完整解直接保存在頁面；離線或關閉 JavaScript 仍可閱讀。排程與位址的數字是教學模型，限制寫在各例題旁。</p>'''
    (D/'index.html').write_text(shell('index','課程地圖',content,'workspace'),encoding='utf-8')

def cards(rows, kind):
    return ''.join(f'<article class="term" id="{key}" data-term><p class="term-tag">{kind}</p><h2>{title}<span>{en}</span></h2><p>{text}</p><a href="{lesson}.html">回到第 {lesson[:2]} 課看完整例子 →</a></article>\n' for key,title,en,lesson,text in rows)

def build_glossary():
    content = '''<header class="lesson-header"><p class="eyebrow">不必背完，再往下學</p><h1>名詞與概念字典</h1><p class="lead">名詞用來認出角色；概念用來解釋角色之間怎麼互相影響。每個詞條都能回到實際例子。</p></header><nav class="section-nav" aria-label="字典分類"><a href="#terms">角色與名詞</a><a href="#concepts">因果與易混概念</a></nav><div class="search-box" hidden><label for="glossary-search">搜尋中文、英文或縮寫</label><input id="glossary-search" data-glossary-search type="search" placeholder="例如：頁框、TLB、等待" autocomplete="off"><p data-search-status aria-live="polite">輸入文字即可縮小詞條範圍，清空可看全部。</p></div><noscript><p class="callout">以下詞條已全部顯示；可使用瀏覽器的「在頁面中尋找」查字。</p></noscript><section id="terms"><h2>角色與名詞</h2><div class="glossary-grid">''' + cards(TERMS,'名詞') + '''</div></section><section id="concepts"><h2>因果與易混概念</h2><div class="glossary-grid">''' + cards(CONCEPTS,'概念') + '''</div></section><nav class="pager" aria-label="回課程"><a href="index.html">← 課程地圖</a><a href="00-role.html">從第 00 課開始 →</a></nav>'''
    (D/'glossary.html').write_text(shell('glossary','名詞與概念字典',content),encoding='utf-8')

class TraceParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.traces=[]; self.trace=None; self.level=0; self.step=None; self.title=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if self.trace is None and 'data-trace' in a:
            self.trace={'id':a.get('id',''),'title':'','steps':[],'states':[]}; self.level=1; return
        if self.trace is None: return
        if tag=='section': self.level+=1
        if tag in ('h2','h3') and not self.trace['title']: self.title=True
        if 'data-state' in a: self.trace['states'].extend(a['data-state'].split())
        if 'data-step' in a:
            self.step={'token':a['data-step'],'text':''}; self.trace['steps'].append(self.step)
    def handle_endtag(self,tag):
        if self.trace is None:return
        if tag in ('h2','h3'):self.title=False
        if tag=='li':self.step=None
        if tag=='section':
            self.level-=1
            if self.level==0:self.traces.append(self.trace);self.trace=None
    def handle_data(self,data):
        if self.trace is None:return
        if self.step is not None:self.step['text']+=data
        if self.title:self.trace['title']+=data

def build_specs():
    columns=['id','type','page_path','question','controls','default','formula','criterion','example','boundaries','steps']
    table=Table(str(ROOT/'evidence'/'widget-specs.json'),columns=columns,meta={'contract':'wf-table/1','source':'../BUILD-SPEC.md','extracted':'2026-10-11','link_columns':['page_path']})
    for slug,title,_ in LESSONS:
        path=D/f'{slug}.html'
        if not path.exists():continue
        parser=TraceParser();parser.feed(path.read_text(encoding='utf-8'))
        for trace in parser.traces:
            steps=[{'token':s['token'],'text':' '.join(s['text'].split())} for s in trace['steps']]
            count=len(steps)
            table.add({'id':trace['id'],'type':'state-trace','page_path':f'../dist/{slug}.html','question':trace['title'] or title,'controls':{'index':{'min':0,'max':max(0,count-1),'step':1},'actions':['prev','next','reset']},'default':{'index':0,'state':steps[0]['token'] if steps else ''},'formula':'next: i=min(N−1,i+1); prev: i=max(0,i−1); reset: i=0；高亮data-state包含data-step token的SVG群。逐步機制與狀態見steps。','criterion':'所有文字步驟和SVG始終可見；當前文字li具有aria-current=step；SVG僅高亮匹配狀態；首步prev及末步next停用；每步why等於該步完整文字，且應與本課靜態例解和不變量一致。','example':{'first':steps[0] if steps else {},'last':steps[-1] if steps else {}},'boundaries':{'first':'prev停用','last':'next停用','reset':'回第0步','no_javascript':'完整SVG、步驟、例題、練習解保留'},'steps':steps})
    table.add({'id':'rr-lab','type':'round-robin-simulation','page_path':'../dist/04-round-robin.html','question':'改到達時間、CPU工作量與時間片，如何改變就緒佇列和T/R/W？','controls':{'jobs':['A','B','C'],'arrival_ms':{'min':0,'max':20,'step':1},'burst_ms':{'min':1,'max':20,'step':1},'quantum_ms':{'min':1,'max':10,'step':1},'actions':['prev','next','reset']},'default':{'jobs':[{'id':'A','arrival':0,'burst':5},{'id':'B','arrival':1,'burst':3},{'id':'C','arrival':2,'burst':1}],'quantum':2,'index':0},'formula':'執行min(q,剩餘CPU時間)；片內和片末到達先依arrival/id加入原佇列尾，再把本片未完成行程排尾。空佇列跳到下次arrival且記錄idle。T=C−arrival，R=first−arrival，W=T−burst（僅本單CPU、無阻塞I/O、零切換成本模型）。','criterion':'CPU區間不重疊；執行總長等於burst總和；每片≤q；所有工作不早於到達執行；每步queue與remaining正確；sum(T)=sum(W)+sum(burst)。完整指標表明示為走完排程後的結果。','example':{'schedule':['A0–2','B2–4','C4–5','A5–7','B7–8','A8–9'],'queue_after':[['B','C','A'],['C','A','B'],['A','B'],['B','A'],['A'],[]],'completion':[9,8,5],'turnaround':[9,7,3],'response':[0,1,2],'waiting':[4,4,2]},'boundaries':{'min':'全部arrival0、burst1、q1 => A0–1,B1–2,C2–3','max':'arrival20、burst20、q10 => idle0–20，完成總時刻80','idle':'三者arrival5 => idle0–5後開始','invalid':'空白、非有限、非整數、越界顯示原因，隱藏舊結果，步進停用','reset':'三個預設行程+q2+index0'},'steps':'執行時依參數確定性生成，最多60個CPU區間及空檔，完整逐片表常駐。'})
    table.add({'id':'va-lab','type':'virtual-address-translation','page_path':'../dist/12-translation.html','question':'TLB是否命中、頁是否駐留與權限如何決定一次位址轉換？','controls':{'va':{'min':0,'max':65535,'step':1,'formats':['decimal','0x-hex']},'pfn':{'min':0,'max':63,'step':1},'tlb':['miss','hit'],'state':['resident','nonresident','unmapped'],'permission':['allow','deny'],'page_size_B':1024,'va_bits':16},'default':{'va':'0x1234','pfn':9,'tlb':'miss','state':'resident','permission':'allow'},'formula':'VPN=floor(VA/1024),offset=VA%1024；有效TLBhit需resident；未命中查單層頁表。unmapped先停止，否則deny停止，否則nonresident停止；其他情況PA=PFN×1024+offset。Number安全整數，無bitwise運算。','criterion':'0≤offset<1024，VA=VPN×1024+offset；有效映射且允許存取才輸出可讀PA；TLBmiss且resident仍成功；非resident搭requestedhit說明改走miss；fault不保證diskIO。','example':{'va_decimal':4660,'va_hex':'0x1234','vpn':4,'offset_B':564,'pfn':9,'pa_decimal_B':9780,'pa_hex':'0x2634','vpn_bits':'000100','offset_bits':'1000110100'},'boundaries':{'zero':'VA0/PFN0 => VPN0,offset0,PA0','maximum':'VA65535/PFN63 => VPN63,offset1023,PA65535','page_boundary':'VA1023=>VPN0/offset1023；VA1024=>VPN1/offset0','unmapped':'不輸出可存取PA；無必然磁碟I/O','protection':'不輸出可存取PA；有效TLBhit仍可能權限失敗','nonresident':'核心處理，可能讀後備儲存或配置零頁','invalid':'空白/負值/小數/Infinity/NaN/錯誤hex/越界顯示原因，隱藏舊結果','reset':'回0x1234,PFN9,miss,resident,allow'},'steps':['拆6-bit VPN與10-bit offset','查TLB','必要時查單層頁表','檢查存在與權限','算PA或呈現失敗原因']})
    table.add({'id':'glossary-search','type':'live-filter','page_path':'../dist/glossary.html','question':'用中文、英文或縮寫找回相關名詞與概念。','controls':{'query':{'type':'string','min_length':0,'max_length':'瀏覽器文字輸入限制'},'matching':'不分大小寫的子字串'},'default':{'query':'','visible_count':len(TERMS)+len(CONCEPTS)},'formula':'q=trim(input).toLocaleLowerCase(); match=entry.textContent.toLocaleLowerCase().includes(q)','criterion':'操作即更新可見詞條和計數；清空顯示全部；noJS全詞條可讀，搜尋框隱藏。','example':{'query':'TLB','matches':'包含TLB的全部詞條與易混概念'},'boundaries':{'empty':'顯示全部','unknown':'0條並顯示改用中文/英文/縮寫建議','case':'tlb與TLB相同','no_javascript':'詞條全部保留'},'steps':'輸入→逐項匹配→hidden屬性→更新aria-live計數'})
    table.save()
    print(f'生成 index / glossary ({len(TERMS)+len(CONCEPTS)} 詞條) / widget specs ({len(table.rows)} 列)')

if __name__=='__main__':
    build_index();build_glossary();build_specs()

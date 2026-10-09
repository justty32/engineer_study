"use strict";

const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const num=(id,d=0)=>{const n=$(id),raw=n?n.value.trim():"",x=Number(raw);return raw!==""&&Number.isFinite(x)?x:d};
const validNum=id=>{const n=$(id),raw=n?n.value.trim():"",x=Number(raw);return raw!==""&&Number.isFinite(x)};
const val=id=>{const n=$(id);return n?n.value:""};
const fmt=(x,n=2)=>Number(x).toFixed(n),ceil=Math.ceil,floor=Math.floor;

function svc(){
  if(!$('svc-pick'))return;
  const map={run:['行程抽象與 CPU 排程','第 01、02 章'],file:['檔案系統把位元組、名稱與磁碟區塊包成檔案','第 07、09 章'],net:['網路裝置驅動、中斷與系統呼叫共同工作','第 08、09 章'],crash:['使用者模式、位址空間與核心保護負責隔離故障','第 05、09 章'],mem:['虛擬記憶體以分頁配置、回收或換出記憶體','第 05、06 章']};
  const draw=()=>{const [service,chapter]=map[val('svc-pick')]||map.run;$('svc-output').innerHTML=`<strong>背後服務：${service}</strong><br>對應${chapter}。應用程式看到的是穩定介面；核心仍要仲裁真實硬體、記錄狀態並阻止越權。`};
  on('svc-pick','input',draw);draw();
}

function memlayout(){
  if(!$('mem-code'))return;
  const draw=()=>{const ids=['mem-code','mem-data','mem-heap','mem-stack'],raw=ids.map(id=>num(id)),parts=raw.map(x=>Math.max(0,x)),adjusted=ids.some(id=>!validNum(id))||raw.some((x,i)=>x!==parts[i]),total=parts.reduce((s,x)=>s+x,0),limit=1024;$('mem-output').innerHTML=`<strong>heap＋stack 預留區示意用量 = ${parts.join(' + ')} = ${fmt(total,0)} KB</strong>${adjusted?'<br>空白、非數值或負數已改用 0 KB。':''}<br>低位址 → code ${parts[0]} KB → data ${parts[1]} KB → heap ${parts[2]} KB ↑ … 未用預留區 … ↓ stack ${parts[3]} KB → 高位址<br>${total>limit?`總量超過本工具的 ${limit} KB 示意預留區，heap 與 stack 可能碰撞。`:`示意預留區尚有 ${fmt(limit-total,0)} KB；heap 與 stack 仍會相向成長。`}<br>真實 64 位元虛擬位址空間遠大於 1 MB；程式通常先碰到 stack 上限、可用記憶體或配置政策，而不是用完全部位址。`};
  ['mem-code','mem-data','mem-heap','mem-stack'].forEach(id=>on(id,'input',draw));draw();
}

function sched(){
  if(!$('sch-b1'))return;
  const draw=()=>{
    const rawB=['sch-b1','sch-b2','sch-b3'].map(id=>num(id,1));
    const rawQ=num('sch-q',1),b=rawB.map(x=>Math.min(10000,Math.max(1,floor(x)))),q=Math.min(10000,Math.max(1,floor(rawQ)));
    const adjusted=['sch-b1','sch-b2','sch-b3','sch-q'].some(id=>!validNum(id))||rawB.some((x,i)=>x!==b[i])||rawQ!==q;
    const fc=[],fw=[],rem=[...b],done=[0,0,0],queue=[0,1,2],timeline=[];
    let t=0,slices=0;
    for(let i=0;i<3;i++){t+=b[i];fc[i]=t;fw[i]=fc[i]-b[i]}
    t=0;
    while(queue.length){const i=queue.shift(),start=t,run=Math.min(rem[i],q);rem[i]-=run;t+=run;slices++;if(timeline.length<100)timeline.push(`<tr><td>${slices}</td><td>P${i+1}</td><td>${start}→${t} ms</td><td>${rem[i]} ms</td></tr>`);if(rem[i]>0)queue.push(i);else done[i]=t}
    const rw=done.map((c,i)=>c-b[i]),avg=a=>a.reduce((s,x)=>s+x,0)/a.length,rows=(c,w)=>c.map((x,i)=>`P${i+1}: W=${w[i]} ms、T=${x} ms`).join('；');
    $('sch-output').innerHTML=`<strong>實際採用：P1=${b[0]}、P2=${b[1]}、P3=${b[2]}、q=${q} ms</strong>${adjusted?'<br>輸入超出範圍或不是整數，已限制為 1～10000 的整數。':''}<br><strong>FCFS</strong><br>${rows(fc,fw)}<br>平均等待 ${fmt(avg(fw))} ms；平均周轉 ${fmt(avg(fc))} ms。<br><strong>RR（共 ${slices} 個執行片段）</strong><br>${rows(done,rw)}<br>平均等待 ${fmt(avg(rw))} ms；平均周轉 ${fmt(avg(done))} ms。<table><thead><tr><th>片段</th><th>行程</th><th>時間軸</th><th>執行後剩餘</th></tr></thead><tbody>${timeline.join('')}</tbody></table>${slices>100?`只列前 100 個片段；總片段數為 ${slices}。<br>`:''}RR 讓工作輪流取得 CPU，通常對短工作較公平，但執行片段越多，可能發生的 context switch 也越多。`;
  };
  ['sch-b1','sch-b2','sch-b3','sch-q'].forEach(id=>on(id,'input',draw));draw();
}

function amdahl(){
  if(!$('amd-p'))return;
  const draw=()=>{const p=Math.max(0,Math.min(1,num('amd-p'))),n=Math.max(1,floor(num('amd-n',1))),s=1/((1-p)+p/n),limit=p>=1?'無限大（教學模型假設全部可平行）':fmt(1/(1-p));$('amd-output').innerHTML=`<strong>加速比 S = 1 ÷ ((1−${fmt(p,2)}) + ${fmt(p,2)} ÷ ${n}) = ${fmt(s)} 倍</strong><br>N→∞ 時理論上限 = 1÷(1−p) = ${limit}。不能平行的比例仍要串行執行，所以核心增加的邊際收益會下降。`};
  ['amd-p','amd-n'].forEach(id=>on(id,'input',draw));draw();
}

function race(){
  if(!$('race-n'))return;
  const draw=()=>{const n=Math.max(1,floor(num('race-n',1))),lock=val('race-mode')==='lock',result=lock?2*n:n===1?1:2;$('race-output').innerHTML=`<strong>${lock?'有鎖':'無鎖最壞交錯'}：最終值 = ${result}</strong><br>${lock?`兩條執行緒各加 ${n} 次，臨界區一次只准一條進入，所以 2×${n}=${result}。`:`理想值是 2×${n}=${2*n}；${n===1?'兩者都讀到 0，再先後寫回 1，因此最壞值是 1。':`A、B 可把尚未寫回的舊值跨越多次更新，讓最後一次過期寫回把結果壓到 2。`}讀—改—寫不是原子操作，後寫會覆蓋較新的結果，形成更新遺失（lost update）。`}`};
  ['race-n','race-mode'].forEach(id=>on(id,'input',draw));draw();
}

function addr(){
  if(!$('va-addr'))return;
  const draw=()=>{const a=Math.max(0,floor(num('va-addr'))),size=Math.max(1,floor(num('va-pagesize',4096))),page=floor(a/size),offset=a%size;$('va-output').innerHTML=`<strong>頁號 = ⌊${a} ÷ ${size}⌋ = ${page}；頁內偏移 = ${a} mod ${size} = ${offset} byte</strong><br>驗算：${page} × ${size} + ${offset} = ${page*size+offset} byte。頁表只需轉換頁號；偏移在頁內保持不變。`};
  ['va-addr','va-pagesize'].forEach(id=>on(id,'input',draw));draw();
}

function pager(){
  if(!$('pr-string'))return;
  const draw=()=>{
    const source=val('pr-string').trim(),tokens=source?source.split(/[\s,]+/):[],invalid=tokens.map((x,i)=>/^\d+$/.test(x)&&Number.isSafeInteger(Number(x))?null:i+1).filter(Boolean);
    if(!tokens.length){$('pr-output').innerHTML='<strong>請輸入至少一個整數頁號。</strong>';return}
    if(invalid.length){$('pr-output').innerHTML=`<strong>第 ${invalid.join('、')} 項不是非負整數頁號。</strong><br>請用空白或逗號分隔；例如：1 2 3 或 1,2,3。`;return}
    const pages=tokens.map(Number),rawCapacity=num('pr-frames',1),capacity=Math.max(1,floor(rawCapacity)),adjusted=!validNum('pr-frames')||rawCapacity!==capacity;
    const simulate=kind=>{const frames=[],order=[],used=new Map(),rows=[];let faults=0,time=0;for(const p of pages){time++;let victim='—',result='命中';if(!frames.includes(p)){faults++;result='缺頁';if(frames.length>=capacity){if(kind==='FIFO')victim=order.shift();else{victim=frames[0];for(const f of frames)if(used.get(f)<used.get(victim))victim=f}frames.splice(frames.indexOf(victim),1)}frames.push(p);if(kind==='FIFO')order.push(p)}used.set(p,time);rows.push(`<tr><td>${time}</td><td>${p}</td><td>${result}</td><td>${frames.join('、')}</td><td>${victim}</td></tr>`)}return{faults,rows}};
    const fifo=simulate('FIFO'),lru=simulate('LRU'),table=(name,result)=>`<strong>${name}：page fault ${result.faults} 次，命中 ${pages.length-result.faults} 次</strong><table><thead><tr><th>步驟</th><th>頁</th><th>結果</th><th>框架內容</th><th>犧牲頁</th></tr></thead><tbody>${result.rows.join('')}</tbody></table>`;
    $('pr-output').innerHTML=`<strong>${pages.length} 次存取、${capacity} 個框架</strong>${adjusted?'<br>框架數不是正整數，已改用最小值或向下取整。':''}<br>${table('FIFO',fifo)}${table('LRU',lru)}FIFO 換掉最早進入者；LRU 換掉最久沒被存取者。`;
  };
  ['pr-string','pr-frames'].forEach(id=>on(id,'input',draw));draw();
}

function fsblock(){
  if(!$('fs-size'))return;
  const draw=()=>{const size=Math.max(0,num('fs-size')),block=Math.max(1,num('fs-block',4)),blocks=ceil(size/block),pointers=floor(block*1024/4),direct=blocks<=12;$('fs-output').innerHTML=`<strong>需要區塊數 = ⌈${fmt(size,2)} ÷ ${block}⌉ = ${blocks}</strong><br>${direct?`${blocks} ≤ 12，直接指標足夠，尚餘 ${12-blocks} 個。`:`${blocks} > 12，超出的 ${blocks-12} 塊需由間接指標描述。`}<br>一個 ${block} KB 間接指標區塊可放 ${block}×1024÷4 = ${pointers} 個 4-byte 指標${!direct&&blocks-12>pointers?'；本簡化模型的一層間接指標仍不夠。':'。'}`};
  ['fs-size','fs-block'].forEach(id=>on(id,'input',draw));draw();
}

function iocost(){
  if(!$('io-data'))return;
  const draw=()=>{const ids=['io-data','io-rate','io-irq','io-chunk'],rawData=num('io-data'),rawRate=num('io-rate'),rawIrq=num('io-irq'),rawChunk=num('io-chunk'),data=Math.max(0,rawData),rate=Math.max(0.000001,rawRate),irq=Math.max(0,rawIrq),chunk=Math.max(0.000001,rawChunk),adjusted=ids.some(id=>!validNum(id))||rawData!==data||rawRate!==rate||rawIrq!==irq||rawChunk!==chunk,seconds=data/(rate*1024),transfer=seconds*1000000,count=ceil(data/chunk),over=count*irq,ratio=transfer?over/transfer*100:0;$('io-output').innerHTML=`<strong>實際採用：data=${fmt(data,2)} KB、rate=${fmt(rate,6)} MB/s、irq=${fmt(irq,2)} μs、chunk=${fmt(chunk,6)} KB</strong>${adjusted?'<br>零以下或不合法的輸入已改用欄位允許的最小值。':''}<br>純傳輸時間 ≈ ${fmt(data,2)} ÷ (${fmt(rate,2)}×1024) = ${fmt(seconds,6)} s = ${fmt(transfer,2)} μs<br>中斷次數 ≈ ⌈${fmt(data,2)} ÷ ${fmt(chunk,2)}⌉ = ${count}；中斷總開銷 = ${count}×${fmt(irq,2)} = ${fmt(over,2)} μs。<br>中斷開銷相對純傳輸時間 = ${fmt(ratio)}%。chunk 越大，中斷通常越少，但資料湊成一塊後才處理的等待延遲可能更高。`};
  ['io-data','io-rate','io-irq','io-chunk'].forEach(id=>on(id,'input',draw));draw();
}

function syscall(){
  if(!$('sys-total'))return;
  const draw=()=>{const ids=['sys-total','sys-chunk','sys-cost'],rawTotal=num('sys-total'),rawChunk=num('sys-chunk',1),rawCost=num('sys-cost'),total=Math.max(0,rawTotal),chunk=Math.max(1,rawChunk),cost=Math.max(0,rawCost),adjusted=ids.some(id=>!validNum(id))||rawTotal!==total||rawChunk!==chunk||rawCost!==cost,count=ceil(total/chunk),over=count*cost;$('sys-output').innerHTML=`<strong>實際採用：total=${fmt(total,2)} KB、chunk=${fmt(chunk,2)} KB、cost=${fmt(cost,2)} μs</strong>${adjusted?'<br>輸入低於允許值或不是數值，已改用欄位允許的最小值。':''}<br>syscall 次數 = ⌈${fmt(total,2)} ÷ ${fmt(chunk,2)}⌉ = ${count}<br>總固定成本 = ${count}×${fmt(cost,2)} = ${fmt(over,2)} μs。<br>若每次改搬 ${fmt(chunk*2,2)} KB，次數會成為 ${ceil(total/(chunk*2))}，固定成本約 ${fmt(ceil(total/(chunk*2))*cost,2)} μs。緩衝把許多小操作合併，減少跨越核心邊界的次數。`};
  ['sys-total','sys-chunk','sys-cost'].forEach(id=>on(id,'input',draw));draw();
}

function deadlock(){
  if(!$('dl-c1'))return;
  const names=['互斥','持有並等待','不可搶佔','循環等待'],ways=['讓資源可共享','一次要求全部資源，或等待前先釋放已持有資源','允許系統搶回並稍後重試','規定所有工作依同一資源順序取得'],ids=['dl-c1','dl-c2','dl-c3','dl-c4'];
  const draw=()=>{const states=ids.map(id=>val(id)==='on'),broken=states.map((x,i)=>x?-1:i).filter(i=>i>=0);$('dl-output').innerHTML=broken.length===0?'<strong>四條件同時成立：可能發生死結。</strong><br>「可能」不是「必然」；還要真的形成互等資源的循環。':'<strong>不會死結：至少一個必要條件被打破。</strong><br>'+broken.map(i=>`${names[i]}已關閉；實務手段：${ways[i]}。`).join('<br>')};
  ids.forEach(id=>on(id,'input',draw));draw();
}

function dictionary(){
  const q=$('term-search');if(!q)return;
  const cards=[...document.querySelectorAll('.term-card')],draw=()=>{const s=q.value.trim().toLocaleLowerCase('zh-Hant');let n=0;cards.forEach(c=>{const hit=(c.textContent+' '+(c.dataset.search||'')).toLocaleLowerCase('zh-Hant').includes(s);c.hidden=!hit;if(hit)n++});$('term-count').textContent=`顯示 ${n} 個條目`};
  on('term-search','input',draw);draw();
}

[svc,memlayout,sched,amdahl,race,addr,pager,fsblock,iocost,syscall,deadlock,dictionary].forEach(f=>f());
if(typeof module!=="undefined")module.exports={};

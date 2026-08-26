"use strict";
const $=x=>document.getElementById(x),on=(x,e,f)=>{const n=$(x);if(n)n.addEventListener(e,f)};
const val=id=>{const n=$(id);return n?n.value:""},esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const rwx=d=>((d&4)?"r":"-")+((d&2)?"w":"-")+((d&1)?"x":"-");

// 00 Linux 的層次
function layer(){if(!$('layer-pick'))return;const map={
  kernel:["核心（kernel）","真正管理 CPU、記憶體、裝置與行程的那層程式；提供系統呼叫給上層。你平常不直接碰它，但每次讀檔、開行程都要經過它。"],
  shell:["殼層（shell，如 bash）","把你打的文字命令解讀成對核心的請求，再把結果印回來。它是『人 → 核心』的翻譯層，也是一種程式語言（可寫腳本）。"],
  app:["使用者程式（userland）","ls、grep、python 這些一般程式，跑在使用者模式，要靠系統呼叫請核心幫忙做 I/O 或開行程。"],
  distro:["發行版（distribution）","把 Linux 核心＋一堆 userland 工具＋套件管理器包成可安裝的整套系統，如 Ubuntu、Fedora。同一顆核心，不同發行版差在工具與慣例。"]};
  const draw=()=>{const [t,d]=map[val('layer-pick')]||map.shell;$('layer-output').innerHTML=`<strong>${t}</strong><br>${d}`};on('layer-pick','input',draw);draw()}

// 01 路徑解析
const splitPath=s=>s.split('/').filter(x=>x!==''&&x!=='.');
function resolvePath(cwd,p){cwd=(cwd||'/').trim();p=(p||'').trim();
  if(p.startsWith('~'))p='/home/user'+p.slice(1);
  let parts=p.startsWith('/')?[]:splitPath(cwd);
  for(const tok of p.split('/')){if(tok===''||tok==='.')continue;if(tok==='..'){if(parts.length)parts.pop();}else parts.push(tok);}
  return '/'+parts.join('/');}
function pathresolve(){if(!$('path-in'))return;const draw=()=>{const cwd=val('path-cwd')||'/',p=val('path-in'),abs=p.startsWith('/'),tilde=p.trim().startsWith('~');const r=resolvePath(cwd,p);
  $('path-output').innerHTML=`<strong>解析結果：${esc(r)}</strong><br>目前目錄 cwd＝${esc(cwd)}；輸入路徑＝${esc(p)||'（空）'}。<br>這是${abs?'絕對路徑（以 / 開頭，忽略 cwd）':tilde?'家目錄路徑（~ 展開為 /home/user）':'相對路徑（接在 cwd 後面）'}；. 代表本目錄、.. 往上一層、多餘的 / 會被摺疊。`};['path-cwd','path-in'].forEach(id=>on(id,'input',draw));draw()}

// 02 glob 萬用字元
function globToRe(g){let re='^';for(let i=0;i<g.length;i++){const c=g[i];
  if(c==='*')re+='[^/]*';else if(c==='?')re+='[^/]';
  else if(c==='['){let j=i+1,cls='[';if(g[j]==='!'){cls+='^';j++;}while(j<g.length&&g[j]!==']'){cls+=g[j];j++;}cls+=']';re+=cls;i=j;}
  else re+=c.replace(/[.+^${}()|\\/]/g,'\\$&');}
  return new RegExp(re+'$');}
function glob(){if(!$('glob-pat'))return;const draw=()=>{const pat=val('glob-pat').trim(),files=val('glob-files').split(/\s+/).filter(Boolean);let re;try{re=globToRe(pat);}catch(e){$('glob-output').innerHTML='<strong>樣式無法解析。</strong>';return;}
  const hit=files.filter(f=>re.test(f)),miss=files.filter(f=>!re.test(f));
  $('glob-output').innerHTML=`<strong>符合 ${hit.length} 個：${hit.map(esc).join(' , ')||'（無）'}</strong><br>不符合：${miss.map(esc).join(' , ')||'（無）'}<br>* 比對任意長度（不含 /）、? 比對單一字元、[abc] 比對其中一個字元。萬用字元由 shell 先展開成實際檔名，再交給命令。`};['glob-pat','glob-files'].forEach(id=>on(id,'input',draw));draw()}

// 03 chmod 計算機
function chmod(){if(!$('chmod-u'))return;const draw=()=>{const u=+val('chmod-u'),g=+val('chmod-g'),o=+val('chmod-o');
  $('chmod-output').innerHTML=`<strong>chmod ${u}${g}${o}  →  ${rwx(u)}${rwx(g)}${rwx(o)}</strong><br>擁有者(u)=${rwx(u)}、群組(g)=${rwx(g)}、其他(o)=${rwx(o)}。<br>每一位數是 r(4)+w(2)+x(1) 的和：例如 7=rwx、6=rw-、5=r-x、4=r--、0=---。`};['chmod-u','chmod-g','chmod-o'].forEach(id=>on(id,'input',draw));draw()}

// 03 權限解讀
function permparse(){if(!$('perm-oct'))return;const draw=()=>{let s=val('perm-oct').trim();const m=s.match(/([0-7])([0-7])([0-7])$/);
  if(!m){$('perm-output').innerHTML='<strong>請輸入 3 個 0–7 的八進位數字，如 644、755。</strong>';return;}
  const [,u,g,o]=m,mean=d=>[(d&4)?'讀':'',(d&2)?'寫':'',(d&1)?'執行/進入':''].filter(Boolean).join('、')||'無權限';
  $('perm-output').innerHTML=`<strong>${u}${g}${o}  →  ${rwx(+u)}${rwx(+g)}${rwx(+o)}</strong><br>擁有者可：${mean(+u)}；同群組可：${mean(+g)}；其他人可：${mean(+o)}。<br>對目錄而言 x 是「能不能進入(cd)並存取其中項目」，不是執行檔案。`};on('perm-oct','input',draw);draw()}

// 04 存取判定
function access(){if(!$('acc-perm'))return;const draw=()=>{const m=val('acc-perm').trim().match(/([0-7])([0-7])([0-7])$/);
  if(!m){$('acc-output').innerHTML='<strong>權限請輸入三位八進位（如 640）。</strong>';return;}
  const owner=val('acc-owner').trim()||'alice',group=val('acc-group').trim()||'staff',user=val('acc-user').trim()||'bob',
    ugroups=val('acc-usergroups').split(/[\s,]+/).filter(Boolean),
    cls=user===owner?0:ugroups.includes(group)?1:2,name=['擁有者','同群組','其他人'][cls],bits=+m[1+cls];
  $('acc-output').innerHTML=`<strong>使用者 ${esc(user)} 被歸類為「${name}」→ 套用第 ${cls+1} 段權限 ${rwx(bits)}</strong><br>讀 ${(bits&4)?'✔ 可':'✗ 不可'}、寫 ${(bits&2)?'✔ 可':'✗ 不可'}、執行/進入 ${(bits&1)?'✔ 可':'✗ 不可'}。<br>判定順序：先看是不是擁有者(${esc(owner)})，否則看是否屬於檔案群組(${esc(group)})，都不是就用其他人。只會套用第一個符合的那一段，不會疊加。`};['acc-perm','acc-owner','acc-group','acc-user','acc-usergroups'].forEach(id=>on(id,'input',draw));draw()}

// 05 行程狀態
function psstate(){if(!$('ps-pick'))return;const map={
  R:["R 執行中/可執行(Running/Runnable)","正在 CPU 上跑，或在就緒佇列等 CPU。"],
  S:["S 可中斷睡眠(Sleeping)","在等某件事（鍵盤、網路、計時器）；收到訊號可被喚醒。大多數閒置行程是這狀態。"],
  D:["D 不可中斷睡眠(Uninterruptible)","通常在等磁碟或驅動 I/O，連訊號都先不理；卡在 D 太久常代表 I/O 或硬體有問題。"],
  Z:["Z 殭屍(Zombie)","已結束但父行程還沒用 wait() 收回結束碼，佔一個項目不佔資源；父行程收回後就消失。"],
  T:["T 停止(Stopped)","被 SIGSTOP 或 Ctrl-Z 暫停，可用 fg/bg 或 SIGCONT 恢復。"]};
  const draw=()=>{const [t,d]=map[val('ps-pick')]||map.S;$('ps-output').innerHTML=`<strong>${t}</strong><br>${d}<br>在 ps 或 top 的 STAT 欄看得到；後面可能還有 +（前景）、s（工作階段領導）、l（多執行緒）等修飾字元。`};on('ps-pick','input',draw);draw()}

// 05 訊號
function signals(){if(!$('sig-pick'))return;const map={
  SIGINT:["SIGINT (2)","Ctrl-C 送出，請程式中止；程式可攔截做清理。","可攔截"],
  SIGTERM:["SIGTERM (15)","kill 預設送的『請你正常結束』；程式可攔截、優雅關閉。","可攔截"],
  SIGKILL:["SIGKILL (9)","立即強制終止，程式無法攔截或忽略；資料來不及存就沒了。","不可攔截"],
  SIGHUP:["SIGHUP (1)","終端斷線；許多常駐服務把它重新定義為『重新載入設定』。","可攔截"],
  SIGSTOP:["SIGSTOP (19)","暫停行程；不可攔截，之後用 SIGCONT 恢復。","不可攔截"],
  SIGCONT:["SIGCONT (18)","讓被停止的行程繼續執行。","可攔截"]};
  const draw=()=>{const [t,d,c]=map[val('sig-pick')]||map.SIGTERM;$('sig-output').innerHTML=`<strong>${t}　[${c}]</strong><br>${d}<br>送法：kill -${t.match(/\((\d+)\)/)[1]} <行程號>，或 kill -${t.replace(/ .*/,'').replace('SIG','')} <行程號>。`};on('sig-pick','input',draw);draw()}

// 06 重導向
function redir(){if(!$('redir-pick'))return;const map={
  out:["cmd > file","把標準輸出(stdout, fd 1)寫入 file，覆蓋原內容。stderr 仍印到螢幕。"],
  app:["cmd >> file","把 stdout 附加到 file 尾端，不覆蓋。"],
  err:["cmd 2> file","把標準錯誤(stderr, fd 2)導到 file；stdout 不受影響。"],
  both:["cmd > file 2>&1","先把 stdout 導到 file，再讓 stderr 指向『stdout 現在的位置』，於是兩者都進 file。順序很重要。"],
  pipe:["cmd1 | cmd2","把 cmd1 的 stdout 接成 cmd2 的 stdin，兩個行程同時跑、資料用管道流動。"],
  in:["cmd < file","把 file 當成 cmd 的標準輸入(stdin, fd 0)。"]};
  const draw=()=>{const [t,d]=map[val('redir-pick')]||map.out;$('redir-output').innerHTML=`<strong>${esc(t)}</strong><br>${d}<br>記住三條預設通道：stdin=0、stdout=1、stderr=2。重導向就是把這些檔案描述子接到別的地方。`};on('redir-pick','input',draw);draw()}

// 07 grep
function grepw(){if(!$('grep-pat'))return;const draw=()=>{const pat=val('grep-pat'),ic=$('grep-ic')&&$('grep-ic').checked,lines=val('grep-text').split(/\n/);let re;
  try{re=new RegExp(pat,ic?'i':'');}catch(e){$('grep-output').innerHTML='<strong>正規表達式無效。</strong>';return;}
  const hit=lines.filter(l=>l!==''&&re.test(l));
  $('grep-output').innerHTML=`<strong>符合 ${hit.length} 行：</strong><br>${hit.map(esc).join('<br>')||'（無）'}<br><span class="note">. 任一字元、* 前字重複、^ 行首、$ 行尾、[0-9] 數字。加 -i 可忽略大小寫。</span>`};['grep-pat','grep-text','grep-ic'].forEach(id=>on(id,'input',draw));on('grep-ic','change',()=>$('grep-pat').dispatchEvent(new Event('input')));draw()}

// 08 環境變數展開
function envexpand(){if(!$('env-tmpl'))return;const draw=()=>{const home=val('env-home')||'/home/user',user=val('env-user')||'user';
  const out=val('env-tmpl').replace(/\$\{?HOME\}?/g,home).replace(/\$\{?USER\}?/g,user);
  $('env-output').innerHTML=`<strong>展開後：${esc(out)}</strong><br>HOME=${esc(home)}、USER=${esc(user)}。<br>展開是 shell 在執行命令『之前』做的：$VAR 或 ${'${VAR}'} 會先被換成值，程式收到的是換好的字串。單引號 '...' 內不展開，雙引號 "..." 內會展開。`};['env-home','env-user','env-tmpl'].forEach(id=>on(id,'input',draw));draw()}

// 09 套件管理
function pkg(){if(!$('pkg-pick'))return;const name=()=>val('pkg-name').trim()||'nginx';const map={
  install:n=>[`sudo apt install ${n}`,`sudo dnf install ${n}`,"下載並安裝套件與其相依。"],
  remove:n=>[`sudo apt remove ${n}`,`sudo dnf remove ${n}`,"移除套件（設定檔可能保留；apt purge 連設定一起刪）。"],
  update:n=>[`sudo apt update`,`sudo dnf check-update`,"更新『可用套件清單/中繼資料』，不會升級已裝套件。"],
  upgrade:n=>[`sudo apt upgrade`,`sudo dnf upgrade`,"把已安裝套件升級到清單中的新版。"],
  search:n=>[`apt search ${n}`,`dnf search ${n}`,"在套件庫搜尋名稱或描述含關鍵字的套件。"]};
  const draw=()=>{const f=map[val('pkg-pick')]||map.install,[a,d,desc]=f(name());$('pkg-output').innerHTML=`<strong>Debian/Ubuntu：</strong>${esc(a)}<br><strong>Fedora/RHEL：</strong>${esc(d)}<br>${desc}<br><span class="note">套件管理器會自動處理相依與來自受信任套件庫的簽章；別直接 sudo 亂裝來路不明的套件。</span>`};['pkg-pick','pkg-name'].forEach(id=>on(id,'input',draw));draw()}

// 字典
function dictionary(){const q=$('term-search');if(!q)return;const cards=[...document.querySelectorAll('.term-card')],draw=()=>{const s=q.value.trim().toLocaleLowerCase('zh-Hant');let n=0;cards.forEach(c=>{const hit=(c.textContent+' '+(c.dataset.search||'')).toLocaleLowerCase('zh-Hant').includes(s);c.hidden=!hit;if(hit)n++});if($('term-count'))$('term-count').textContent=`顯示 ${n} 個條目`};on('term-search','input',draw);draw()}

if(typeof document!=="undefined")[layer,pathresolve,glob,chmod,permparse,access,psstate,signals,redir,grepw,envexpand,pkg,dictionary].forEach(f=>f());
if(typeof module!=="undefined")module.exports={resolvePath,globToRe,rwx};

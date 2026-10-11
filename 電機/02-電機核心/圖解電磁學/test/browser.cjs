/* 只使用既有 Playwright 與 Chromium；唯讀 dist。 */
'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),{spawnSync}=require('child_process');
const {chromium}=require('/home/lorkhan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const dist=path.resolve(__dirname,'../dist'),out='/tmp/electromagnetics-technical-qa';
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(dist,f))).digest('hex');
function write(name,rows,meta={}){const r=spawnSync('python3',[path.join(__dirname,'evidence.py'),`${out}/${name}.json`],{input:JSON.stringify({rows,meta}),encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
async function geometry(page){return page.evaluate(()=>{
 const clipped=[],overlaps=[],clippedHTML=[];
 for(const svg of document.querySelectorAll('svg')){
  const vb=svg.viewBox.baseVal;if(!vb.width)continue;
  const svgCTM=svg.getCTM(),inverse=svgCTM?.inverse();
  const ts=[...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox(),matrix=inverse?.multiply(t.getCTM());const corners=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>{const p=new DOMPoint(x,y);return matrix?p.matrixTransform(matrix):p});const xs=corners.map(p=>p.x),ys=corners.map(p=>p.y);return {text:t.textContent,x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};});
  for(const t of ts)if(t.x<vb.x-1||t.y<vb.y-1||t.x+t.w>vb.x+vb.width+1||t.y+t.h>vb.y+vb.height+1)clipped.push({svg:svg.id||svg.querySelector('title')?.textContent,...t});
  for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i],b=ts[j];if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>4&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>4)overlaps.push({svg:svg.id,a:a.text,b:b.text});}
 }
 for(const e of document.querySelectorAll('main *')){
  if(e.closest('svg')||!e.getClientRects().length||!e.textContent.trim())continue;
  const c=getComputedStyle(e);if((c.overflowX==='hidden'||c.overflowX==='clip')&&e.scrollWidth>e.clientWidth+2)clippedHTML.push({tag:e.tagName,id:e.id,class:e.className,excess:e.scrollWidth-e.clientWidth});
 }
 return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyFont:getComputedStyle(document.body).fontSize,clipped,overlaps,clippedHTML,scrollers:[...document.querySelectorAll('main *')].filter(e=>!e.closest('svg')&&['auto','scroll'].includes(getComputedStyle(e).overflowX)&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,id:e.id,class:e.className,tab:e.tabIndex,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth})),missingSVGNames:[...document.querySelectorAll('svg[role="img"]')].filter(e=>!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')&&!e.querySelector('title')).length};
 });}
async function runtime(batch){
 fs.mkdirSync(out,{recursive:true});fs.mkdirSync(`${out}/screenshots`,{recursive:true});
 const server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';}catch{res.writeHead(400);res.end();return;}const f=path.resolve(dist,name);if(!f.startsWith(dist+'/')){res.writeHead(403);res.end();return;}fs.readFile(f,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 let browser;
 try{browser=await chromium.launch({executablePath:'/home/lorkhan/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});}catch(e){server.close();throw e;}
 write(batch+'-runtime',[{pid:process.pid,port:server.address().port,base,browser:browser.version(),state:'running'}]);
 return {browser,base,close:async()=>{await browser.close();await new Promise(r=>server.close(r));write(batch+'-runtime',[{pid:process.pid,base,browser:browser.version(),browserClosed:true,serverClosed:true,state:'closed'}]);}};
}
async function main(){
 const batch=process.argv[2]||'layout',chosen=process.argv[3]?.split(','),files=fs.readdirSync(dist).filter(f=>f.endsWith('.html')&&(!chosen||chosen.some(c=>f===c||f.startsWith(c+'-')||f===c+'.html'))).sort();
 if(!files.length)throw Error('沒有可驗收的 HTML');
 const rows=[],issues=[];let active='',rt;
 try{
  rt=await runtime(batch);const {browser,base}=rt;
  const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),pg=await ctx.newPage();
  pg.on('pageerror',e=>issues.push({file:active,kind:'pageerror',detail:e.message}));pg.on('console',m=>{if(m.type()==='error')issues.push({file:active,kind:'console',detail:m.text()});});pg.on('request',r=>{if(!r.url().startsWith(base+'/')&&!r.url().startsWith('file:')&&!r.url().startsWith('data:'))issues.push({file:active,kind:'external',detail:r.url()});});pg.on('response',r=>{if(r.status()>=400)issues.push({file:active,kind:'http',detail:r.status()+' '+r.url()});});
  for(const file of files){active=file;const before=sha(file),deps=Object.fromEntries(fs.readdirSync(dist).filter(f=>/\.(css|js)$/.test(f)).map(f=>[f,sha(f)]));
   for(const width of [1440,390,320]){
    await pg.setViewportSize({width,height:width===1440?900:844});await pg.goto(base+'/'+encodeURIComponent(file));if(!(await pg.title()).includes('圖解電磁學'))throw Error('載錯課程 '+file);
    const g=await geometry(pg);if(g.scrollWidth>width+1)issues.push({file,kind:'page overflow',width,detail:g.scrollWidth});if(g.missingSVGNames)issues.push({file,kind:'unnamed SVG',width,detail:g.missingSVGNames});
    rows.push({file,sha256:before,deps,protocol:'http',js:true,width,geometry:g});
    await pg.screenshot({path:`${out}/screenshots/${batch}-${file}-${width}-entry.png`});
    if(width===1440){const svgs=pg.locator('svg');for(let i=0;i<await svgs.count();i++)await svgs.nth(i).screenshot({path:`${out}/screenshots/${batch}-${file}-svg-${i}.png`});for(const selector of ['figure','#calculate','#practice','#experiment']){const loc=pg.locator(selector);for(let i=0;i<await loc.count();i++)await loc.nth(i).screenshot({path:`${out}/screenshots/${batch}-${file}-${selector.replace('#','')}-${i}.png`});}}
    if(width!==1440){const loc=pg.locator('#calculate');if(await loc.count())await loc.screenshot({path:`${out}/screenshots/${batch}-${file}-${width}-calculate.png`});}
   }
   await pg.goto('file://'+path.join(dist,file));if(!(await pg.title()).includes('圖解電磁學'))throw Error('file 載錯課程');
   rows.push({file,sha256:before,deps,protocol:'file',js:true,mainLength:(await pg.locator('main').innerText()).length,geometry:await geometry(pg)});
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),np=await nojs.newPage();await np.goto('file://'+path.join(dist,file));
   const content={length:(await np.locator('main').innerText()).length,details:await np.locator('details').count(),svg:await np.locator('svg').count()};
   if(/^\d\d-/.test(file)&&(content.length<1000||content.details<2||content.svg<1))issues.push({file,kind:'noJS body insufficient',detail:content});
   for(let i=0;i<await np.locator('details summary').count();i++){const summary=np.locator('details summary').nth(i);await summary.focus();const open=await summary.evaluate(e=>e.parentElement.open);await np.keyboard.press('Enter');if(await summary.evaluate(e=>e.parentElement.open)===open)issues.push({file,kind:'noJS details keyboard',detail:i});}
   rows.push({file,sha256:before,deps,protocol:'file',js:false,width:390,content,geometry:await geometry(np)});await nojs.close();
   const motion=await pg.evaluate(()=>({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,animations:document.getAnimations().length,scroll:getComputedStyle(document.documentElement).scrollBehavior}));if(!motion.matches||motion.animations||motion.scroll==='smooth')issues.push({file,kind:'reduced motion',detail:motion});
   if(sha(file)!==before||Object.entries(deps).some(([f,hash])=>sha(f)!==hash))issues.push({file,kind:'changed during test',detail:'需依差異重驗'});
   write(batch+'-pages',rows);write(batch+'-issues',issues);console.log(file+' completed');
  }
 }catch(e){issues.push({file:active,kind:'fatal',detail:e.stack});console.error(e.message);}finally{write(batch+'-pages',rows);write(batch+'-issues',issues);if(rt)await rt.close();}
 console.log(JSON.stringify({batch,pages:files.length,checks:rows.length,issues:issues.length}));process.exitCode=issues.length?1:0;
}
module.exports={dist,out,sha,write,geometry,runtime};
if(require.main===module)main();

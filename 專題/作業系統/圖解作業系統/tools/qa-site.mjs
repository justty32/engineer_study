/* Independent observable browser QA. Uses the existing browser; never downloads. */
import { chromium } from '/home/lorkhan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(site, 'dist');
const output = process.env.OS_QA_OUTPUT || '/tmp/os-visual-qa';
const prototype = process.argv.includes('--prototype');
const selected = process.argv.find(a => a.startsWith('--pages='))?.split('=')[1].split(',');
const files = (await fs.readdir(dist)).filter(x => x.endsWith('.html')).sort();
const pages = process.argv.includes('--cleanup-only') ? [] : selected || (prototype ? ['04-round-robin.html', '12-translation.html'] : files);
await fs.mkdir(output, { recursive: true });
const result = { mode: prototype ? 'prototype' : 'full', started: new Date().toISOString(), runnerPid:process.pid, pages: [], checks: [], failures: [], screenshots: [], artifacts: [] };
function check(id, pass, detail = '') { const r = { id, status: pass ? 'pass' : 'fail', detail }; result.checks.push(r); if (!pass) result.failures.push(r); }
const server = http.createServer(async (request, response) => {
  const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html';
  if (name === 'favicon.ico') { response.writeHead(204); response.end(); return; }
  const target = path.resolve(dist, name);
  if (!target.startsWith(dist + path.sep)) { response.writeHead(403); response.end(); return; }
  try { const data = await fs.readFile(target); response.writeHead(200, {'content-type': ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'})[path.extname(target)] || 'application/octet-stream'}); response.end(data); }
  catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
result.localOrigin=origin;
let browser;
try {
  browser = await chromium.launch({ executablePath: '/home/lorkhan/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', headless: true, args: ['--no-sandbox'] });
  result.browser = browser.version();
  for (const name of (await fs.readdir(dist)).filter(name=>/\.(?:html|css|js)$/.test(name)).sort()) {
    const bytes = await fs.readFile(path.join(dist,name));
    result.artifacts.push({ file:name, sha256:crypto.createHash('sha256').update(bytes).digest('hex'), bytes:bytes.length });
  }
  for (const scheme of (prototype ? ['http'] : ['http','file'])) {
    for (const width of [1440, 390, 320]) {
      const context = await browser.newContext({ viewport:{ width,height:width === 1440 ? 900 : 844 }, reducedMotion:'reduce' });
      for (const name of pages) {
        const page = await context.newPage();
        const errors = [], external = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(origin + '/')) external.push(request.url()); });
        const url = scheme === 'http' ? `${origin}/${name}` : pathToFileURL(path.join(dist,name)).href;
        await page.goto(url, { waitUntil:'load' });
        const prefix = `${scheme}/${width}/${name}`;
        check(`${prefix}/title`, (await page.title()).includes('圖解作業系統'));
        const observed = await page.evaluate(() => {
          const bbox = e => { const b=e.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; };
          const svgText=[],svgNames=[];
          document.querySelectorAll('svg').forEach((svg,i) => {
            const named=(svg.getAttribute('aria-labelledby')||'').split(/\s+/).filter(Boolean);
            if(svg.getAttribute('role')!=='img'||!svg.querySelector('title')||!svg.querySelector('desc')||!named.length||named.some(id=>!document.getElementById(id)))svgNames.push(i);
            const box=svg.viewBox.baseVal;
            svg.querySelectorAll('text').forEach(text => {
              const b=text.getBBox();
              if (b.x < box.x-2 || b.y < box.y-2 || b.x+b.width > box.x+box.width+2 || b.y+b.height > box.y+box.height+2) svgText.push({svg:i,text:text.textContent,bounds:{x:b.x,y:b.y,width:b.width,height:b.height},viewBox:svg.getAttribute('viewBox')});
            });
          });
          const controls=[...document.querySelectorAll('input,select,textarea')].map(e => ({id:e.id,name:e.getAttribute('name'),label:!!(e.labels?.length || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby'))}));
          return {title:document.title, bodyWidth:document.documentElement.scrollWidth, viewport:innerWidth, controls,svgText,svgNames,paragraphs:document.querySelectorAll('main p').length, h1:[...document.querySelectorAll('h1')].map(e=>e.textContent), overflow:[...document.querySelectorAll('main *')].filter(e=> {const b=e.getBoundingClientRect();return b.right>innerWidth+2 && !e.closest('.table-scroll,.diagram');}).slice(0,8).map(e=>({tag:e.tagName,class:e.className,box:bbox(e)}))};
        });
        check(`${prefix}/horizontal-overflow`, observed.bodyWidth <= width+1, observed);
        check(`${prefix}/svg-text-bounds`, observed.svgText.length === 0, observed.svgText);
        check(`${prefix}/svg-names`,observed.svgNames.length===0,observed.svgNames);
        check(`${prefix}/labels`, observed.controls.every(c=>c.label), observed.controls);
        const anchor=page.locator('.section-nav a[href="#worked-example"]');
        if(await anchor.count()) {
          await anchor.click();
          const geometry=await page.evaluate(()=>({navBottom:document.querySelector('.section-nav').getBoundingClientRect().bottom,targetTop:document.querySelector('#worked-example').getBoundingClientRect().top}));
          check(`${prefix}/anchor-no-occlusion`,geometry.targetTop>=geometry.navBottom-1,geometry);
          await page.evaluate(()=>window.scrollTo(0,0));
        }
        if(width<500) {
          const regions=page.locator('.diagram,.table-scroll');
          for(let i=0;i<await regions.count();i++) {
            const region=regions.nth(i);
            await region.evaluate(e=>{for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open){p.open=true;p.dataset.qaOpened='true';}});
            const overflow=await region.evaluate(e=>e.scrollWidth>e.clientWidth+1);
            if(!overflow) {await page.locator('details[data-qa-opened]').evaluateAll(nodes=>nodes.forEach(e=>{e.open=false;delete e.dataset.qaOpened;}));continue;}
            await region.focus();const before=await region.evaluate(e=>e.scrollLeft);await page.keyboard.press('ArrowRight');await page.waitForTimeout(80);
            const detail=await region.evaluate(e=>({beforeStyle:getComputedStyle(e,'::before').content,after:e.scrollLeft,tabindex:e.tabIndex,role:e.getAttribute('role'),label:e.getAttribute('aria-label'),outline:getComputedStyle(e).outlineStyle}));
            check(`${prefix}/scroll-${i}/keyboard`,detail.after>before&&detail.tabindex===0&&detail.outline!=='none',detail);
            await region.evaluate(e=>e.scrollLeft=0);
            await page.locator('details[data-qa-opened]').evaluateAll(nodes=>nodes.forEach(e=>{e.open=false;delete e.dataset.qaOpened;}));
          }
          await page.evaluate(()=>window.scrollTo(0,0));
        }
        if (scheme === 'http' && (prototype || ['index.html','00-role.html','04-round-robin.html','07-mutex.html','08-condition.html','12-translation.html','17-durability.html','19-system-call.html'].includes(name))) {
          const base = `${name.replace('.html','')}-${width}`;
          const viewportShot=path.join(output,`${base}-viewport.png`);await page.screenshot({path:viewportShot});result.screenshots.push(viewportShot);
          const shot = path.join(output, `${base}-page.png`);
          await page.screenshot({path:shot,fullPage:true}); result.screenshots.push(shot);
          const widget=page.locator('[data-rr], [data-va], [data-trace]').first();
          if (await widget.count()) { const shot=path.join(output,`${base}-widget.png`); await widget.screenshot({path:shot}); result.screenshots.push(shot); await widget.evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-100));const viewportShot=path.join(output,`${base}-widget-viewport.png`);await page.screenshot({path:viewportShot});result.screenshots.push(viewportShot); }
          const diagram=page.locator('main .diagram').first();
          if(await diagram.count()) {await diagram.evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-100));const left=path.join(output,`${base}-diagram-left.png`);await page.screenshot({path:left});result.screenshots.push(left);await diagram.evaluate(e=>{e.scrollLeft=e.scrollWidth;});const right=path.join(output,`${base}-diagram-right.png`);await page.screenshot({path:right});result.screenshots.push(right);await diagram.evaluate(e=>{e.scrollLeft=0;});}
        }
        if (width === 1440) {
          for (let i=0;i<await page.locator('[data-trace]').count();i++) {
            const trace=page.locator('[data-trace]').nth(i);
            const total=await trace.locator('[data-step]').count();
            const status=trace.locator('[data-trace-status]');
            const initial=await status.textContent();
            check(`${prefix}/trace-${i}/initial`, await trace.locator('[data-action="prev"]').isDisabled() && (await trace.locator('[data-step].is-current').count())===1, initial);
            for (let j=1;j<total;j++) {
              const button=trace.locator('[data-action="next"]'); await button.focus(); await page.keyboard.press('Enter');
              const token=await trace.locator('[data-step]').nth(j).getAttribute('data-step');
              const current=await trace.locator('[data-step].is-current').getAttribute('data-step');
              check(`${prefix}/trace-${i}/next-${j}`,current===token && (await status.textContent())!==initial, await status.textContent());
              const matching=await trace.locator('[data-state]').evaluateAll((nodes,token)=>nodes.every(n=>n.classList.contains('is-current')===n.dataset.state.split(/\s+/).includes(token)),token);
              check(`${prefix}/trace-${i}/diagram-${j}`,matching);
            }
            check(`${prefix}/trace-${i}/end`, await trace.locator('[data-action="next"]').isDisabled());
            if(total>1) { await trace.locator('[data-action="prev"]').click(); check(`${prefix}/trace-${i}/prev`,await trace.locator('[data-step].is-current').getAttribute('data-step') === await trace.locator('[data-step]').nth(total-2).getAttribute('data-step')); }
            await trace.locator('[data-action="reset"]').click(); check(`${prefix}/trace-${i}/reset`,await status.textContent()===initial);
          }
          const focusable=page.locator('main button:not([disabled]), main summary, main a').first();
          if(await focusable.count()) { await focusable.focus();await page.keyboard.press('Tab'); const focus=await page.evaluate(()=>{const e=document.activeElement;return {active:e!==document.body,tag:e.tagName,outline:getComputedStyle(e).outlineStyle,outlineWidth:getComputedStyle(e).outlineWidth};});check(`${prefix}/focus-visible`,focus.active&&focus.outline!=='none'&&focus.outlineWidth!=='0px',focus); }
          if(await page.locator('[data-rr]').count()) await verifyRR(page,prefix);
          if(await page.locator('[data-va]').count()) await verifyVA(page,prefix);
          if(await page.locator('[data-glossary-search]').count()) {
            const input=page.locator('[data-glossary-search]'); const total=await page.locator('[data-term]').count();
            await input.fill('TLB'); const matching=await page.locator('[data-term]:visible').count();check(`${prefix}/glossary-match`,matching>0&&matching<total,{matching,total});
            await input.fill('zzzzzzzznonexistent');check(`${prefix}/glossary-empty`,await page.locator('[data-term]:visible').count()===0);
            await input.fill('');check(`${prefix}/glossary-clear`,await page.locator('[data-term]:visible').count()===total);
          }
        }
        check(`${prefix}/console`,errors.length===0,errors);check(`${prefix}/external-network`,external.length===0,external);
        result.pages.push({scheme,width,name,errors,external,paragraphs:observed.paragraphs});
        await page.close();
      }
      await context.close();
    }
  }
  if(!prototype) {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    for(const name of pages) {
      const page=await context.newPage();await page.goto(pathToFileURL(path.join(dist,name)).href);
      if(/^\d\d-/.test(name)) { const example=page.locator('#worked-example'), practice=page.locator('#practice'); check(`nojs/${name}/body`,await example.isVisible()&&await practice.isVisible()&&(await example.innerText()).length>250, {exampleChars:(await example.innerText()).length,practiceChars:(await practice.innerText()).length});
        const details=practice.locator('details');for(let i=0;i<await details.count();i++) await details.nth(i).locator('summary').click();check(`nojs/${name}/practice-solution`,(await practice.innerText()).length>200,await practice.innerText()); }
      await page.close();
    }
    await context.close();
  }
} catch(error) {check('runner',false,error.stack);}
finally {if(browser) await browser.close();await new Promise(resolve=>server.close(resolve));}
result.cleanup={browserConnectedAfterClose:browser?.isConnected()??false,httpListeningAfterClose:server.listening,management:'try/finally: await browser.close(); await server.close() callback; only this runner owns these handles'};
check('managed-process-cleanup',!result.cleanup.browserConnectedAfterClose&&!result.cleanup.httpListeningAfterClose,result.cleanup);
const changed=[];
for(const artifact of result.artifacts) {const raw=await fs.readFile(path.join(dist,artifact.file));const current=crypto.createHash('sha256').update(raw).digest('hex');if(current!==artifact.sha256)changed.push({file:artifact.file,before:artifact.sha256,after:current});}
result.changedDuringRun=changed;
check('input-stable',changed.length===0,changed);
result.finished=new Date().toISOString();
const report=path.join(output,prototype?'prototype.json':'browser.json');
await fs.writeFile(report,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({report,checks:result.checks.length,failures:result.failures,screenshots:result.screenshots},null,2));
process.exitCode=result.failures.length?1:0;

function tickReference(jobs,q) {
  const remaining=jobs.map(j=>j.burst), first=jobs.map(()=>null), finish=jobs.map(()=>null), ready=[];
  let time=0, used=0, current=null;const segments=[];
  const admit=t=>jobs.forEach((j,i)=>{if(j.arrival===t)ready.push(i);});
  admit(0);
  while(finish.some(x=>x===null)) {
    if(current===null&&ready.length) {current=ready.shift();used=0;if(first[current]===null)first[current]=time;segments.push({id:'ABC'[current],start:time,end:time});}
    if(current===null) {if(segments.at(-1)?.id!=='idle')segments.push({id:'idle',start:time,end:time});}
    else {remaining[current]--;used++;}
    time++;segments.at(-1).end=time;admit(time);
    if(current!==null&&(remaining[current]===0||used===q)) {if(remaining[current]===0)finish[current]=time;else ready.push(current);current=null;}
    if(time>200)throw new Error('reference runaway');
  }
  return {segments,jobs:jobs.map((j,i)=>({finish:finish[i],response:first[i]-j.arrival,turnaround:finish[i]-j.arrival,waiting:finish[i]-j.arrival-j.burst}))};
}

async function verifyRR(page,prefix) {
  const cases=[{jobs:[{arrival:0,burst:5},{arrival:1,burst:3},{arrival:2,burst:1}],q:2},{jobs:[{arrival:0,burst:3},{arrival:1,burst:2},{arrival:2,burst:1}],q:1},{jobs:[{arrival:20,burst:20},{arrival:20,burst:20},{arrival:20,burst:20}],q:1},{jobs:[{arrival:0,burst:1},{arrival:20,burst:1},{arrival:20,burst:1}],q:10},{jobs:[{arrival:2,burst:1},{arrival:1,burst:20},{arrival:0,burst:3}],q:3},{jobs:[{arrival:0,burst:5},{arrival:1,burst:3},{arrival:2,burst:1}],q:5}];
  for(let i=0;i<cases.length;i++) {
    const c=cases[i],expected=tickReference(c.jobs,c.q);
    const actual=await page.evaluate(({jobs,q})=>window.OSLab.roundRobin(jobs,q),c);
    check(`${prefix}/rr/reference-${i}`,JSON.stringify(actual.steps.slice(1).map(s=>({id:s.id,start:s.start,end:s.end})))===JSON.stringify(expected.segments)&&JSON.stringify(actual.jobs.map(j=>({finish:j.finish,response:j.response,turnaround:j.turnaround,waiting:j.waiting})))===JSON.stringify(expected.jobs),{input:c,expected,actual});
  }
  const invalid=await page.evaluate(()=>['','NaN','Infinity','-Infinity','1.5','9007199254740992'].map(value=>{try{window.OSLab.roundRobin([{arrival:0,burst:5},{arrival:1,burst:3},{arrival:2,burst:1}],value);return {value,rejected:false};}catch(e){return {value,rejected:true,message:e.message};}}));
  check(`${prefix}/rr/nonfinite-api`,invalid.every(x=>x.rejected&&!x.message.includes('NaN')),invalid);
  const widget=page.locator('[data-rr]'),output=page.locator('[data-rr-output]'),status=page.locator('[data-rr-status]');
  const initial=await status.textContent();await page.locator('[data-rr-action="next"]').focus();await page.keyboard.press('Enter');check(`${prefix}/rr/keyboard-step`,(await status.textContent()).includes('t = 2 ms')&&(await output.innerText()).includes('B → C → A'),await status.textContent());
  await page.locator('[data-rr-action="prev"]').click();check(`${prefix}/rr/prev`,await status.textContent()===initial);
  for(const [field,values] of [['#rr-quantum',['','0','11','1.5','-1']],['#rr-A-arrival',['','-1','21','0.5']],['#rr-A-burst',['','0','21','1.5']]]) {
    for(const value of values) {await widget.locator('button[type="reset"]').click();await waitReset(page,'rr');await page.locator(field).fill(value);check(`${prefix}/rr/invalid/${field}/${value}`,await output.isHidden()&&!(await status.innerText()).includes('NaN')&&(await status.innerText()).includes('整數'),await status.textContent());}
  }
  await widget.locator('button[type="reset"]').click();await waitReset(page,'rr');check(`${prefix}/rr/reset`,await status.textContent()===initial&&(await page.locator('#rr-quantum').inputValue())==='2');
  await page.locator('#rr-quantum').fill('5');check(`${prefix}/rr/update`,(await output.innerText()).includes('0～5')&&(await output.innerText()).includes('5～8'));
  await widget.locator('button[type="reset"]').click();await waitReset(page,'rr');
}

async function verifyVA(page,prefix) {
  const widget=page.locator('[data-va]'), output=page.locator('[data-va-output]'), status=page.locator('[data-va-status]');
  const reset=async()=>{await widget.locator('button[type="reset"]').click();await waitReset(page,'va');};
  check(`${prefix}/va/default`,(await output.innerText()).includes('9780')&&(await output.innerText()).includes('564')&&(await output.innerText()).includes('000100'));
  for(const c of [{va:'0',pfn:'0',vpn:0,offset:0,pa:0},{va:'65535',pfn:'63',vpn:63,offset:1023,pa:65535},{va:'0x2ABC',pfn:'3',vpn:10,offset:700,pa:3772}]) {
    await page.locator('#va-address').fill(c.va);await page.locator('#va-pfn').fill(c.pfn);
    const r=await page.evaluate(c=>window.OSLab.translate({...c,tlb:'miss',state:'resident',permission:'allow'}),c);
    check(`${prefix}/va/boundary-${c.va}`,r.vpn===c.vpn&&r.offset===c.offset&&r.pa===c.pa&&(await output.innerText()).includes(`${c.pa} B`),r);
  }
  for(const tlb of ['hit','miss']) for(const state of ['resident','nonresident','unmapped']) for(const permission of ['allow','deny']) {
    await reset();await page.locator('#va-tlb').selectOption(tlb);await page.locator('#va-state').selectOption(state);await page.locator('#va-permission').selectOption(permission);
    const r=await page.evaluate(c=>window.OSLab.translate({va:'0x1234',pfn:'9',...c}),{tlb,state,permission});
    const success=state==='resident'&&permission==='allow';const visible=await output.innerText();
    check(`${prefix}/va/branch-${tlb}-${state}-${permission}`,success?r.pa===9780&&visible.includes('9780'):r.pa===null&&!visible.includes('9780'),{model:r,visible});
  }
  for(const [field,values] of [['#va-address',['','65536','-1','1.5','NaN','Infinity','0x10000','0x','1e3']],['#va-pfn',['','64','-1','0.5']]])for(const value of values) {await reset();await page.locator(field).fill(value);check(`${prefix}/va/invalid/${field}/${value}`,await output.isHidden()&&!(await status.innerText()).includes('NaN')&&(await status.innerText()).includes('整數'),await status.textContent());}
  await reset();check(`${prefix}/va/reset`,(await page.locator('#va-address').inputValue())==='0x1234'&&(await output.innerText()).includes('9780'));
}

async function waitReset(page,kind) {
  await page.waitForFunction(kind=>{
    const s=document.querySelector(`[data-${kind}-status]`),o=document.querySelector(`[data-${kind}-output]`);
    return !o.hidden && (kind==='rr' ? s.textContent.startsWith('步驟 0／6') && document.querySelector('#rr-quantum').value==='2' : s.textContent.startsWith('轉址快取未命中') && document.querySelector('#va-address').value==='0x1234' && o.textContent.includes('9780'));
  },kind);
}

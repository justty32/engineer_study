'use strict';
const fs=require('fs'),path=require('path');
const {dist,out,sha,write,geometry,runtime}=require('./browser.cjs');
const batch=process.argv[2]||'interactions',chosen=process.argv[3]?.split(','),files=fs.readdirSync(dist).filter(f=>/^\d\d-.*\.html$/.test(f)&&(!chosen||chosen.some(c=>f.startsWith(c+'-')))).sort();
const rows=[],issues=[];let rt,active='';
function fail(kind,detail){issues.push({file:active,kind,detail});}
async function snapshot(pg,label,hash,deps){
 const r=await pg.evaluate(()=>{const q=s=>document.querySelector(s),el=q('#lab-input'),plot=q('#lab-plot');return {input:el.value,value:q('#lab-value').textContent,results:q('#lab-results').textContent,readouts:[...q('#lab-results').children].map(e=>({label:e.querySelector('small')?.textContent||'',value:e.querySelector('strong')?.textContent||e.textContent,key:e.dataset.key||'',raw:e.dataset.value||''})),why:q('#lab-why').textContent,description:q('#lab-description').textContent,svg:plot.outerHTML,plotData:{...plot.dataset},points:[...plot.querySelectorAll('[data-x],[data-y],.current-point')].map(e=>({tag:e.tagName,attrs:Object.fromEntries([...e.attributes].map(a=>[a.name,a.value]))})),model:window.EMLab?.calculate(q('[data-lab]').dataset.lab,Number(el.value)),graphMatches:(()=>{if(!window.EMLab)return false;const r=window.EMLab.calculate(q('[data-lab]').dataset.lab,Number(el.value)),copy=document.createElementNS('http://www.w3.org/2000/svg','svg');copy.innerHTML=window.EMLab.graph(q('[data-lab]').dataset.lab,Number(el.value),r);return copy.innerHTML===plot.innerHTML;})(),inputBox:el.getBoundingClientRect().toJSON(),plotBox:plot.getBoundingClientRect().toJSON()};});
 if(/NaN|Infinity|undefined/.test(r.results+r.why+r.description+r.svg))fail('nonfinite leakage',label);
 for(const p of r.points){const a=p.attrs;if(a.cx!==undefined&&(Number(a.cx)-Number(a.r)<0||Number(a.cx)+Number(a.r)>640||Number(a.cy)-Number(a.r)<0||Number(a.cy)+Number(a.r)>300))fail('marker clipped',{label,attrs:a});}
 if(!r.graphMatches)fail('graph stale',label);
 if(r.model){for(const [key,m] of Object.entries(r.model.metrics)){const got=r.readouts.find(x=>x.key===key);if(!got||String(m.value)!==got.raw)fail('metric stale',{label,key,want:m.value,got:got?.raw});}if(r.why!==r.model.why)fail('why stale',label);if(r.model.primary===null&&r.points.length)fail('invalid model has marker',label);if(r.model.primary!==null){const point=r.points.find(p=>p.attrs['data-x']===r.input&&Math.abs(Number(p.attrs['data-y'])-r.model.primary)<1e-8);if(!point)fail('marker state stale',label);}}
 if(!r.why.trim()||!r.description.trim())fail('missing explanation',label);
 rows.push({file:active,sha256:hash,deps,label,...r});return r;
}
(async()=>{try{
 if(!files.length)throw Error('no lesson pages');
 rt=await runtime(batch);const ctx=await rt.browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),pg=await ctx.newPage();
 pg.on('pageerror',e=>fail('pageerror',e.message));pg.on('request',r=>{if(!r.url().startsWith(rt.base+'/')&&!r.url().startsWith('data:'))fail('external request',r.url());});
 for(const file of files){active=file;const hash=sha(file),deps=Object.fromEntries(fs.readdirSync(dist).filter(f=>/\.(css|js)$/.test(f)).map(f=>[f,sha(f)]));await pg.goto(rt.base+'/'+encodeURIComponent(file));if(!(await pg.title()).includes('圖解電磁學'))throw Error('wrong course');
  const input=pg.locator('#lab-input'),reset=pg.locator('#lab-reset');const def=await input.evaluate(e=>({min:Number(e.min),max:Number(e.max),step:Number(e.step),value:Number(e.defaultValue)}));
  const initial=await snapshot(pg,'default',hash,deps);
  await pg.keyboard.press('Tab');if(await pg.locator(':focus').getAttribute('class')!=='skip-link')fail('skip link not first focus',await pg.locator(':focus').getAttribute('class'));await pg.keyboard.press('Enter');
  for(const mode of ['min','max']){await input.evaluate((el,m)=>{el.value=el[m];el.dispatchEvent(new Event('input',{bubbles:true}));},mode);const r=await snapshot(pg,mode,hash,deps);if(Number(r.input)!==def[mode])fail('endpoint mismatch',{mode,got:r.input});}
  for(const value of ({'01':[90],'04':[0],'08':[2],'11':[0,180],'19':[-90,0,45,90,180],'21':[1],'22':[41,42],'24':[0,25,50,100],'26':[6.5,6.6,6.7]}[file.slice(0,2)]||[])){await input.evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);await snapshot(pg,'boundary '+value,hash,deps);}
  for(const raw of ['', 'NaN','Infinity','-Infinity',String(def.min-100),String(def.max+100),String(def.min+def.step*.4)]){await input.evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},raw);await snapshot(pg,'DOM assigned '+JSON.stringify(raw),hash,deps);}
  for(const raw of ['', 'NaN','Infinity','-Infinity',String(def.min-100),String(def.max+100),String(def.min+def.step*.4)]){await input.evaluate((el,raw)=>{const native=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');Object.defineProperty(el,'value',{configurable:true,get(){return raw},set(v){delete this.value;native.set.call(this,v)}});el.dispatchEvent(new Event('input',{bubbles:true}));},raw);const r=await snapshot(pg,'handler injected '+JSON.stringify(raw),hash,deps);let expected=raw.trim()===''||!Number.isFinite(Number(raw))?def.value:Number(raw);expected=Math.max(def.min,Math.min(def.max,expected));expected=Math.max(def.min,Math.min(def.max,def.min+Math.round((expected-def.min)/def.step)*def.step));if(Math.abs(Number(r.input)-expected)>1e-8)fail('input normalization',{raw,expected,got:r.input});}
  await reset.click();
  for(const key of ['ArrowRight','Home','End']){await input.focus();await pg.keyboard.press(key);const focus=await input.evaluate(e=>({active:document.activeElement===e,outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));if(!focus.active||focus.outline==='none'||focus.width==='0px')fail('range focus invisible',focus);const r=await snapshot(pg,'keyboard '+key,hash,deps);if(key==='ArrowRight'&&Math.abs(Number(r.input)-Math.min(def.value+def.step,def.max))>1e-9)fail('range key step',r.input);if(key==='Home'&&Number(r.input)!==def.min)fail('range Home',r.input);if(key==='End'&&Number(r.input)!==def.max)fail('range End',r.input);}
  await reset.focus();await pg.keyboard.press('Space');const restored=await snapshot(pg,'reset keyboard',hash,deps);for(const k of ['input','value','results','why','description','svg'])if(restored[k]!==initial[k])fail('reset mismatch',k);
  for(let i=0;i<await pg.locator('details summary').count();i++){const s=pg.locator('details summary').nth(i);await s.focus();const before=await s.evaluate(e=>e.parentElement.open);await pg.keyboard.press('Enter');if(await s.evaluate(e=>e.parentElement.open)===before)fail('details keyboard',i);const focus=await s.evaluate(e=>getComputedStyle(e).outlineStyle);if(focus==='none')fail('summary focus invisible',i);}
  await pg.locator('#practice').screenshot({path:`${out}/screenshots/${batch}-${file}-practice-expanded.png`});
  const hook=await pg.evaluate(()=>({exists:!!window.EMLab,keys:Object.keys(window.EMLab||{})}));rows.push({file,sha256:hash,deps,label:'API contract',hook});
  const g=await geometry(pg);if(g.scrollWidth>1441)fail('expanded content overflow',g.scrollWidth);
  if(sha(file)!==hash||Object.entries(deps).some(([f,s])=>sha(f)!==s))fail('changed during test','需差異複驗');
  write(batch+'-states',rows);write(batch+'-issues',issues);console.log(file+' '+rows.filter(r=>r.file===file).length+' states');
 }
}catch(e){fail('fatal',e.stack);console.error(e.message);}finally{write(batch+'-states',rows);write(batch+'-issues',issues);if(rt)await rt.close();}
console.log(JSON.stringify({batch,pages:files.length,states:rows.length,issues:issues.length}));process.exitCode=issues.length?1:0;
})();

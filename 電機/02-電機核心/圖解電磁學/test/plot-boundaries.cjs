'use strict';
const {contracts,calculate,graph}=require('../dist/app.js'),{write,sha}=require('./browser.cjs');
const rows=[],issues=[];
const primaryKeys=['force','ax','flux','field','field','field','potential','potential','e2n','capacitance','power','force','field','field','potential','emf','energy','current','powerDensity','ey','depth','gamma','thetaT','delay','voltage','transformer','wavelength','length'];
for(const c of contracts){let count=0,invalid=0,clipped=0;
 for(let k=0;k<=Math.round((c.control.max-c.control.min)/c.control.step);k++){
  const x=Number((c.control.min+k*c.control.step).toPrecision(12)),r=calculate(c.id,x),s=graph(c.id,x,r),point=s.match(/<circle[^>]*class="current-point"[^>]*>/),attrs={};
  if(point)for(const m of point[0].matchAll(/([\w-]+)="([^"]*)"/g))attrs[m[1]]=m[2];
  const errs=[];if(r.primaryKey!==primaryKeys[Number(c.id)])errs.push('wrong primary quantity');if(!['08','19','24'].includes(c.id)&&!s.includes(r.metrics[r.primaryKey].label))errs.push('wrong y axis quantity');const shown=r.metrics[primaryKeys[Number(c.id)]]?.value;if(typeof shown==='number'&&shown!==r.primary)errs.push('primary differs from displayed raw metric');
  if(r.primary===null){invalid++;if(point)errs.push('invalid model has point');}
  else if(!point)errs.push('missing point');
  else {const cx=Number(attrs.cx),cy=Number(attrs.cy),rad=Number(attrs.r);if(![cx,cy,rad].every(Number.isFinite)||cx-rad<0||cx+rad>640||cy-rad<0||cy+rad>300){clipped++;errs.push('clipped point');}if(Math.abs(Number(attrs['data-x'])-x)>1e-9||Math.abs(Number(attrs['data-y'])-r.primary)>1e-9)errs.push('point state mismatch');}
  if(/NaN|Infinity|undefined/.test(s))errs.push('nonfinite SVG');
  if(errs.length)issues.push({id:c.id,x,primary:r.primary,attrs,errors:errs});count++;
 }
 rows.push({id:c.id,legalInputs:count,invalidModelInputs:invalid,clipped,status:clipped?'FAIL':'PASS'});
}
write('plot-boundaries',rows,{app_sha256:sha('app.js'),method:'掃描每個合法step；空間圖19、08及駐波24亦逐值驗目前點不被viewBox裁切'});write('plot-boundaries-issues',issues);
console.log(JSON.stringify({chapters:rows.length,legalInputs:rows.reduce((n,r)=>n+r.legalInputs,0),issues}));process.exitCode=issues.length?1:0;

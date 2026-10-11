'use strict';
const {calculate,graph}=require('../dist/app.js'),{write,sha}=require('./browser.cjs');
const rows=[];
function check(id,input,label,predicate){const r=calculate(id,input),pass=predicate(r);rows.push({id,input,label,status:pass?'PASS':'FAIL',result:r});}
check('01',90,'垂直投影嚴格為零',r=>r.metrics.ax.value===0&&r.primary===0);
check('08',2,'相同介質沒有淨束縛面電荷',r=>r.metrics.e2n.value===4&&r.metrics.sigma.value===0);
check('11',180,'反平行磁力嚴格為零',r=>r.metrics.force.value===0&&r.primary===0);
for(const [phase,status] of [[0,'線偏振'],[180,'線偏振'],[90,'圓偏振'],[-90,'圓偏振'],[45,'橢圓偏振']])check('19',phase,'偏振分類 '+phase,r=>r.status===status);
const critical=Math.asin(2/3)*180/Math.PI;
check('22',critical,'Snell臨界角掠射',r=>Math.abs(r.primary-90)<1e-6);
check('22',critical+1e-5,'超臨界無實數角',r=>r.primary===null&&r.status.includes('全反射')&&!graph('22',critical+1e-5,r).includes('current-point'));
check('24',50,'匹配功率守恆',r=>r.metrics.gamma.value===0&&r.metrics.reflected.value===0&&r.metrics.vswr.value===1&&r.metrics.voltage.value===3&&r.metrics.current.value===.06&&r.metrics.loadPower.value===.09);
check('24',25,'負反射係數與電流負號',r=>Math.abs(r.metrics.gamma.value+1/3)<1e-12&&r.metrics.reflected.value===-1&&r.metrics.voltage.value===2&&r.metrics.current.value===.08&&r.metrics.loadPower.value===.08);
const fc=299792458/(2*.02286)/1e9;
check('26',fc,'精確截止β=0、α=0、λg發散',r=>r.primary===null&&r.metrics.attenuation.value===0&&r.metrics.wavelength.value.includes('∞')&&r.status.includes('精確截止'));
check('26',fc*(1-1e-9),'低於截止為倏逝',r=>r.primary===null&&r.metrics.attenuation.value>0);
check('26',fc*(1+1e-9),'高於截止有實數導波波長',r=>Number.isFinite(r.primary)&&r.primary>0&&r.metrics.groupVelocity.value>0&&r.metrics.groupVelocity.value<299792458);
write('key-boundaries',rows,{app_sha256:sha('app.js'),method:'獨立物理端點／匹配／零量的固定期望；未由產品輸出建立期望'});console.log({cases:rows.length,failures:rows.filter(r=>r.status==='FAIL')});process.exitCode=rows.some(r=>r.status==='FAIL')?1:0;

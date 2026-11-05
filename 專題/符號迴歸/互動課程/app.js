/* Deterministic teaching model. No external calls, dependencies or persistent state. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const truth = x => x*x+x+1;
  const pattern = [0.4,-0.8,0.6,-0.2,1,-0.7,0.3,-1,0.5,0.8,-0.4,0.2,-0.9,0.7,-0.1,0.9,-0.5];
  const points = (n,a,b,fn,noise=0) => Array.from({length:n},(_,i)=>{ const x=a+(b-a)*i/(n-1); return {x,y:fn(x)+noise*pattern[i%pattern.length]}; });
  const mse = (data,fn) => data.reduce((s,p)=>s+(fn(p.x)-p.y)**2,0)/data.length;
  const fmt = n => Math.abs(n)<1e-12 ? '0' : Math.abs(n)>=10000 || Math.abs(n)<0.0001 ? n.toExponential(3) : n.toFixed(4).replace(/\.?0+$/,'');
  const read = id => Number($(id).value);
  // Householder QR: solve the full-rank overdetermined least-squares system A c ≈ y.
  function leastSquares(data,bases) {
    const a=data.map(p=>bases.map(f=>f(p.x))), y=data.map(p=>p.y), n=a.length, m=bases.length;
    for(let k=0;k<m;k++){
      let norm=0;for(let i=k;i<n;i++) norm=Math.hypot(norm,a[i][k]);
      if(norm<1e-13) throw new Error('候選基底不具獨立性');
      const alpha=a[k][k]>=0?-norm:norm;
      const v=Array.from({length:n-k},(_,j)=>a[k+j][k]);v[0]-=alpha;
      const vv=v.reduce((s,t)=>s+t*t,0);
      for(let j=k;j<m;j++){
        let dot=0;for(let i=k;i<n;i++)dot+=v[i-k]*a[i][j];
        for(let i=k;i<n;i++)a[i][j]-=2*v[i-k]*dot/vv;
      }
      let dot=0;for(let i=k;i<n;i++)dot+=v[i-k]*y[i];
      for(let i=k;i<n;i++)y[i]-=2*v[i-k]*dot/vv;
    }
    const c=Array(m).fill(0);
    for(let i=m-1;i>=0;i--){let v=y[i];for(let j=i+1;j<m;j++)v-=a[i][j]*c[j];c[i]=v/a[i][i];}
    return {coefficients:c,fn:x=>c.reduce((s,t,i)=>s+t*bases[i](x),0)};
  }
  function formula(coefs,labels){return coefs.map((c,i)=>`${c<0?'−':i?'＋':''}${fmt(Math.abs(c))}${labels[i]?'·'+labels[i]:''}`).join(' ');}
  function chart(id,{data,fn,reference,domain,range,description,training=false}) {
    const svg=$(id); const width=Math.max(280,svg.clientWidth),height=svg.clientHeight||300;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const margin={left:45,right:18,top:20,bottom:37}, w=width-margin.left-margin.right,h=height-margin.top-margin.bottom;
    const X=x=>margin.left+(x-domain[0])/(domain[1]-domain[0])*w;
    const Y=y=>margin.top+h-(y-range[0])/(range[1]-range[0])*h;
    const path=f=>Array.from({length:241},(_,i)=>{const x=domain[0]+(domain[1]-domain[0])*i/240;return `${i?'L':'M'}${X(x).toFixed(2)},${Y(f(x)).toFixed(2)}`;}).join(' ');
    let markup=`<title>${description}</title><desc>橘色圓點為訓練觀測，青色實線為目前公式。${reference?'灰藍虛線為已知的資料生成規律。':''}圖中所有值都沒有單位。</desc><defs><clipPath id="${id}-clip"><rect x="${margin.left}" y="${margin.top}" width="${w}" height="${h}"/></clipPath></defs>`;
    if(training && domain[1]>1)markup+=`<rect x="${X(1)}" y="${margin.top}" width="${X(domain[1])-X(1)}" height="${h}" fill="var(--teal-soft)"/><text x="${X(1)+8}" y="${margin.top+15}" fill="var(--muted)" font-size="11">外插區域</text>`;
    for(let i=0;i<=4;i++){
      const x=domain[0]+i*(domain[1]-domain[0])/4, y=range[0]+i*(range[1]-range[0])/4;
      markup+=`<path d="M${X(x)},${margin.top}V${margin.top+h} M${margin.left},${Y(y)}H${margin.left+w}" class="grid-line"/><text x="${X(x)}" y="${height-14}" text-anchor="middle" fill="var(--muted)" font-size="11">${fmt(x)}</text><text x="${margin.left-7}" y="${Y(y)+4}" text-anchor="end" fill="var(--muted)" font-size="11">${fmt(y)}</text>`;
    }
    markup+=`<text x="${width-12}" y="${height-14}" fill="var(--muted)" font-size="12">x</text><text x="14" y="15" fill="var(--muted)" font-size="12">y</text><g clip-path="url(#${id}-clip)">`;
    if(reference)markup+=`<path d="${path(reference)}" fill="none" stroke="var(--reference)" stroke-width="2" stroke-dasharray="5 5"/>`;
    markup+=`<path d="${path(fn)}" fill="none" stroke="var(--teal)" stroke-width="2.5"/>`;
    data.forEach(p=>{markup+=`<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" fill="var(--amber)" stroke="var(--paper)" stroke-width="1.2"/>`;});
    markup+='</g>';svg.innerHTML=markup;
    const outside=Array.from({length:241},(_,i)=>fn(domain[0]+i*(domain[1]-domain[0])/240)).some(y=>y<range[0]||y>range[1]);
    $(`${id}-caption`).textContent=`橘點：訓練觀測；青線：目前公式${reference?'；灰藍虛線：原始規律':''}。${outside?'部分曲線超出 y 視窗而裁切；誤差仍用完整數值計算。':'所有曲線均在 y 視窗內。'}`;
  }
  function hook(ids,fn){ids.forEach(id=>$(id).addEventListener('input',fn));}
  function fitPage(){
    if(!$('fit-chart'))return;
    const ids=['coef-a','coef-b','coef-c','fit-noise'];
    function update(){
      const [a,b,c,noise]=ids.map(read);const data=points(9,-1,1,truth,noise),fn=x=>a*x*x+b*x+c,err=mse(data,fn);
      ['a','b','c'].forEach((key,i)=>$(`${key}-value`).textContent=[a,b,c][i].toFixed(1));$('fit-noise-value').textContent=noise.toFixed(1);
      $('fit-equation').textContent=`y = ${formula([a,b,c],['x²','x',''])}`;$('fit-error').textContent=fmt(err);
      $('fit-why').textContent=err<1e-12?'九個點全部吻合：每一點的平方誤差都是 0。但這仍只是在這九個輸入上核對。':noise>0?`目前 MSE = ${fmt(err)}。觀測含固定擾動；原始規律也未必穿過每個偏移後的點。先區分規律與觀測。`:`目前 MSE = ${fmt(err)}。每次改係數都在改曲線；把 a、b、c 調成 1，會與這批無擾動資料重合。`;
      $('fit-data').innerHTML=data.map(p=>`<tr><td>${fmt(p.x)}</td><td>${fmt(p.y)}</td><td>${fmt(fn(p.x))}</td><td>${fmt((fn(p.x)-p.y)**2)}</td></tr>`).join('');
      chart('fit-chart',{data,fn,domain:[-1,1],range:[-2,6],description:`可調整二次式；九點均方誤差 ${fmt(err)}`});
    }
    hook(ids,update);$('fit-reset').onclick=()=>{[0,1,1,0].forEach((v,i)=>$(ids[i]).value=v);update();};$('fit-target').onclick=()=>{ids.slice(0,3).forEach(id=>$(id).value=1);update();};update();return update;
  }
  const termDefs=[{id:'constant',fn:()=>1,label:'',cost:1},{id:'linear',fn:x=>x,label:'x',cost:3},{id:'square',fn:x=>x*x,label:'x²',cost:5},{id:'sine',fn:Math.sin,label:'sin(x)',cost:4}];
  function enumerate(data,terms,lambda){
    const models=[];
    for(let mask=1;mask<(1<<terms.length);mask++){
      const selected=terms.filter((_,i)=>mask&(1<<i)),model=leastSquares(data,selected.map(t=>t.fn));
      const complexity=selected.reduce((s,t)=>s+t.cost,0)+selected.length-1,error=mse(data,model.fn);
      models.push({...model,mask,complexity,error,score:error+lambda*complexity,formula:formula(model.coefficients,selected.map(t=>t.label))});
    }
    models.forEach(m=>m.frontier=!models.some(b=>b!==m&&b.complexity<=m.complexity&&b.error<=m.error+1e-12&&(b.complexity<m.complexity||b.error<m.error-1e-12)));
    return models.sort((a,b)=>Math.abs(a.score-b.score)>1e-12?a.score-b.score:a.complexity-b.complexity);
  }
  function searchPage(){
    if(!$('search-chart'))return;
    const ids=['search-truth','complexity','search-noise',...termDefs.map(t=>'term-'+t.id)];let selectedMask=null,models=[],data=[],actual;
    function plot(model){
      $('search-selection').textContent=`目前檢視：y ≈ ${model.formula}；節點數 ${model.complexity}，MSE ${fmt(model.error)}。`;
      chart('search-chart',{data,fn:model.fn,reference:actual,domain:[-2,2],range:[-3,9],description:`列舉候選公式 ${model.formula}`});
      [...$('candidates').rows].forEach(row=>{const active=Number(row.dataset.mask)===model.mask;row.classList.toggle('selected',active);row.querySelector('button').setAttribute('aria-pressed',String(active));});
    }
    function update(){
      const enabled=termDefs.filter(t=>$('term-'+t.id).checked),lambda=read('complexity'),noise=read('search-noise');
      $('complexity-value').textContent=lambda.toFixed(3);$('search-noise-value').textContent=noise.toFixed(1);
      actual=$('search-truth').value==='sine'?x=>Math.sin(x)+1:truth;data=points(17,-2,2,actual,noise);
      // Empty selection is an explicit state, not an implicit fallback to a forbidden term.
      if(!enabled.length){$('candidates').innerHTML='';$('candidate-count').textContent='0 個';$('winner-formula').textContent='請選至少一種基底';$('winner-error').textContent='—';$('search-why').textContent='沒有可用零件，搜尋器就無法產生公式。勾選任一基底即可重來。';$('search-selection').textContent='目前沒有候選可檢視。';chart('search-chart',{data,fn:()=>0,reference:actual,domain:[-2,2],range:[-3,9],description:'沒有候選公式；青線為零值參考'});$('search-chart-caption').textContent='橘點：訓練觀測；灰藍虛線：原始規律。沒有候選公式，青色水平線僅為零值參考。';return;}
      models=enumerate(data,enabled,lambda);const best=models[0];
      $('winner-formula').textContent='y ≈ '+best.formula;$('candidate-count').textContent=models.length+' 個';$('winner-error').textContent=fmt(best.error);
      const missing=$('search-truth').value==='sine'?!$('term-sine').checked:!$('term-square').checked;
      $('search-why').textContent=missing?'原始規律需要的基底未開放。排名第一只代表在這盒零件與目前分數下較好，不能補回根本沒允許的表達。':`這次列舉 ${models.length} 個候選，依 MSE + ${lambda.toFixed(3)} × 節點數排序。${noise>0?'觀測含擾動，更多項可能同時擬合擾動。':'即使資料乾淨，較大的 λ 也可能讓短而不完全準確的公式勝出。'}`;
      $('candidates').innerHTML=models.map(m=>`<tr data-mask="${m.mask}"><td><button type="button" aria-pressed="false">${m.formula}</button></td><td>${m.complexity}</td><td>${fmt(m.error)}</td><td>${fmt(m.score)}</td><td>${m.frontier?'前緣':'有較佳取捨'}</td></tr>`).join('');
      [...$('candidates').rows].forEach(row=>row.querySelector('button').onclick=()=>{selectedMask=Number(row.dataset.mask);plot(models.find(m=>m.mask===selectedMask));});
      selectedMask=best.mask;plot(best);
    }
    hook(ids,update);$('search-reset').onclick=()=>{$('search-truth').value='quadratic';$('complexity').value=.01;$('search-noise').value=0;termDefs.forEach(t=>$('term-'+t.id).checked=t.id!=='sine');update();};update();return update;
  }
  function validationPage(){
    if(!$('validation-chart'))return;
    const ids=['degree','validation-noise','test-end'];let snapshot;
    // Midpoints never equal any of the nine training abscissae.
    const validation=Array.from({length:40},(_,i)=>{const x=-1+(i+.5)/20;return{x,y:truth(x)};});
    const extrapolation=Array.from({length:40},(_,i)=>{const x=1+(i+1)/40;return{x,y:truth(x)};});
    function update(){
      const degree=read('degree'),noise=read('validation-noise'),end=read('test-end'),data=points(9,-1,1,truth,noise);
      const model=leastSquares(data,Array.from({length:degree+1},(_,i)=>x=>x**i));
      const train=mse(data,model.fn),valid=mse(validation,model.fn),extra=mse(extrapolation,model.fn);
      $('degree-value').textContent=degree;$('validation-noise-value').textContent=noise.toFixed(1);$('test-end-value').textContent=end.toFixed(1);
      $('train-error').textContent=fmt(train);$('validation-error').textContent=fmt(valid);$('extrapolation-error').textContent=fmt(extra);
      $('validation-formula').textContent='y ≈ '+formula(model.coefficients,Array.from({length:degree+1},(_,i)=>i===0?'':i===1?'x':`x^${i}`));
      $('validation-why').textContent=train<1e-12&&extra<1e-10?'三組誤差均接近 0：目前無擾動，模型家族包含真正的二次規律。這是已知生成機制的人造示範，不保證其他資料也會如此。':degree<2?`公式最高只到 ${degree} 次，表達不出二次曲率；訓練 MSE ${fmt(train)}，外插 MSE ${fmt(extra)}。先修正模型限制。`:degree===8&&noise>0?`九個係數穿過九個帶擾動的點，訓練 MSE 幾乎為 0；區間內驗證 ${fmt(valid)}，外插 ${fmt(extra)}。資料上的零誤差，掩蓋了範圍外的失敗。`:`目前訓練 MSE ${fmt(train)}、區間內驗證 ${fmt(valid)}、外插 ${fmt(extra)}。三組分開計算；新點誤差讓你檢查曲線是否只追著訓練擾動走。`;
      chart('validation-chart',{data,fn:model.fn,reference:truth,domain:[-1,end],range:[-1,8],training:true,description:`${degree} 次多項式；訓練誤差 ${fmt(train)}，區間內驗證 ${fmt(valid)}，外插 ${fmt(extra)}`});
      snapshot={data,validation,extrapolation,model};
    }
    hook(ids,update);$('validation-reset').onclick=()=>{[2,.2,2].forEach((v,i)=>$(ids[i]).value=v);update();};
    document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>{const presets={clean:[2,0,2],overfit:[8,.2,2],underfit:[1,.2,2]};presets[b.dataset.case].forEach((v,i)=>$(ids[i]).value=v);update();});
    $('download-data').onclick=()=>{
      const rows=['split,x,y,prediction,squared_error'];
      for(const [label,data] of [['training',snapshot.data],['validation',snapshot.validation],['extrapolation',snapshot.extrapolation]])data.forEach(p=>{const y=snapshot.model.fn(p.x);rows.push([label,p.x,p.y,y,(y-p.y)**2].join(','));});
      const url=URL.createObjectURL(new Blob([rows.join('\n')+'\n'],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`symbolic-regression-degree-${read('degree')}-noise-${read('validation-noise')}.csv`;a.click();URL.revokeObjectURL(url);
    };update();return update;
  }
  // Intersect every pairwise score inequality; this covers all λ≥0 without a sampling grid.
  function weightInterval(model,models){
    let lo=0,hi=Infinity;
    for(const other of models){
      const delta=model.complexity-other.complexity,rhs=other.error-model.error;
      if(Math.abs(delta)<1e-12){if(rhs<-1e-12)return null;}
      else if(delta>0)hi=Math.min(hi,rhs/delta);
      else lo=Math.max(lo,rhs/delta);
    }
    return hi>=lo-1e-12&&hi>=-1e-12?{lo:Math.max(0,lo),hi:Math.max(0,hi)}:null;
  }
  function paretoPage(){
    if(!$('pareto-chart'))return;
    const models=enumerate(points(17,-2,2,truth),termDefs.slice(0,3),0).sort((a,b)=>a.mask-b.mask);
    models.forEach((m,i)=>{m.letter=String.fromCharCode(65+i);m.interval=weightInterval(m,models);m.dominatedBy=models.filter(o=>o!==m&&o.complexity<=m.complexity&&o.error<=m.error+1e-12&&(o.complexity<m.complexity||o.error<m.error-1e-12)).map(o=>String.fromCharCode(65+models.indexOf(o)));});
    $('pareto-select').innerHTML=models.map(m=>`<option value="${m.mask}">${m.letter} · ${m.complexity} 節點 · MSE ${fmt(m.error)}</option>`).join('');$('pareto-select').value=5;
    function intervalLabel(m){return m.interval?`${fmt(m.interval.lo)} ≤ λ${Number.isFinite(m.interval.hi)?' ≤ '+fmt(m.interval.hi):'，無上限'}`:'沒有這種 λ';}
    function scatter(selected,winner,budget,lambda){
      const svg=$('pareto-chart'),width=Math.max(280,svg.clientWidth),height=svg.clientHeight||300;
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const p={l:42,r:18,t:20,b:43},w=width-p.l-p.r,h=height-p.t-p.b;
      const X=x=>p.l+x/12*w,Y=y=>p.t+h-(y+.4)/9.4*h;
      let html=`<title>公式取捨圖；${winner.letter}依加權分數勝出，正檢視${selected.letter}</title><desc>橫軸為節點數，縱軸為訓練均方誤差；越左越短，越下越準。圓點是前緣，叉號是被支配式。完整數值列於下表。</desc><defs><clipPath id="pareto-clip"><rect x="${p.l}" y="${p.t}" width="${w}" height="${h}"/></clipPath></defs>`;
      for(let i=0;i<=4;i++){
        const xx=i*3,yy=i*2;
        html+=`<path d="M${X(xx)},${p.t}V${p.t+h} M${p.l},${Y(yy)}H${width-p.r}" class="grid-line"/><text x="${X(xx)}" y="${height-24}" text-anchor="middle" font-size="11" fill="var(--muted)">${xx}</text><text x="${p.l-8}" y="${Y(yy)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${yy}</text>`;
      }
      html+=`<text x="${width/2}" y="${height-5}" text-anchor="middle" font-size="11" fill="var(--muted)">節點數（向左更短）</text><text x="8" y="12" font-size="11" fill="var(--muted)">MSE</text><g clip-path="url(#pareto-clip)">`;
      const score=winner.error+lambda*winner.complexity;
      html+=`<path d="M${X(budget)},${p.t}V${p.t+h}" fill="none" stroke="var(--reference)" stroke-width="1.5" stroke-dasharray="4 4"/><path d="M${X(0)},${Y(score)}L${X(12)},${Y(score-lambda*12)}" fill="none" stroke="var(--teal)" stroke-width="1.5"/>`;
      for(const m of models){
        const x=X(m.complexity),y=Y(m.error),offset=m.mask===3?17:-11;
        html+=m.frontier?`<circle cx="${x}" cy="${y}" r="5" fill="var(--paper)" stroke="var(--teal)" stroke-width="2"/>`:`<path d="M${x-4},${y-4}L${x+4},${y+4}M${x-4},${y+4}L${x+4},${y-4}" stroke="var(--reference)" stroke-width="2"/>`;
        if(m===selected)html+=`<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="var(--amber)" stroke-width="2"/>`;
        if(m===winner)html+=`<path d="M${x},${y-8}L${x+8},${y}L${x},${y+8}L${x-8},${y}Z" fill="none" stroke="var(--teal)" stroke-width="2"/>`;
        html+=`<text x="${x+10}" y="${y+offset}" font-size="12" font-weight="700" fill="var(--ink)">${m.letter}</text>`;
      }
      html+='</g>';svg.innerHTML=html;
    }
    function update(){
      const lambda=read('pareto-lambda'),budget=read('pareto-budget'),selected=models.find(m=>m.mask===read('pareto-select'));
      const ranked=[...models].sort((a,b)=>{const delta=a.error+lambda*a.complexity-b.error-lambda*b.complexity;return Math.abs(delta)>1e-12?delta:a.complexity-b.complexity;});
      const winner=ranked[0],constrained=models.filter(m=>m.complexity<=budget).sort((a,b)=>Math.abs(a.error-b.error)>1e-12?a.error-b.error:a.complexity-b.complexity)[0];
      $('pareto-lambda-value').textContent=lambda.toFixed(3);$('pareto-budget-value').textContent=budget;
      $('pareto-weighted').textContent=`${winner.letter} · 分數 ${fmt(winner.error+lambda*winner.complexity)}`;
      $('pareto-constrained').textContent=`${constrained.letter} · MSE ${fmt(constrained.error)}`;
      $('pareto-status').textContent=selected.frontier?`${selected.letter} 在前緣`:`${selected.letter} 被 ${selected.dominatedBy.join('、')} 支配`;
      $('pareto-pick-weight').disabled=!selected.interval;
      $('pareto-why').textContent=!selected.frontier?`${selected.letter} 被 ${selected.dominatedBy.join('、')} 支配，已有不更長且不更差的替代式。λ 與預算只改選擇規則，七個擬合結果和支配關係不會跟著改。`:!selected.interval?`${selected.letter} 在前緣，但不存在能讓它排名第一的非負 λ。把節點上限設為 ${selected.complexity}，預算規則會選到它；加權與硬上限代表不同偏好。`:`${selected.letter} 在前緣，也能由某些權重選出：${intervalLabel(selected)}（端點可平手）。當前 λ 選到 ${winner.letter}，節點上限 ${budget} 則選到 ${constrained.letter}。`;
      $('pareto-data').innerHTML=models.map(m=>`<tr class="${m===selected?'selected':''}"><td><button type="button" data-pareto-mask="${m.mask}" aria-pressed="${m===selected}">${m.letter}: ${m.formula}</button></td><td>${m.complexity}</td><td>${fmt(m.error)}</td><td>${m.dominatedBy.join('、')||'無（前緣）'}</td><td>${intervalLabel(m)}</td></tr>`).join('');
      $('pareto-data').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('pareto-select').value=b.dataset.paretoMask;update();});
      scatter(selected,winner,budget,lambda);
    }
    hook(['pareto-lambda','pareto-budget','pareto-select'],update);
    $('pareto-pick-weight').onclick=()=>{const m=models.find(m=>m.mask===read('pareto-select'));if(!m.interval)return;const value=Number.isFinite(m.interval.hi)?(m.interval.lo+m.interval.hi)/2:m.interval.lo+.1;$('pareto-lambda').value=value;update();};
    $('pareto-reset').onclick=()=>{$('pareto-lambda').value=.3;$('pareto-budget').value=7;$('pareto-select').value=5;update();};update();return update;
  }

  const render=fitPage()||searchPage()||validationPage()||paretoPage();if(render)window.addEventListener('resize',render);
  // Expose numerical primitives only for local deterministic verification; no browser state is persisted.
  if(typeof module!=='undefined'&&module.exports)module.exports={leastSquares,mse,points,enumerate,termDefs,truth,weightInterval};
})();

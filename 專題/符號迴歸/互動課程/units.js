/* Two-dimensional (length/time) quantity algebra for an offline teaching experiment. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const fmt=n=>!Number.isFinite(n)?'未定義':Math.abs(n)<1e-12?'0':n.toFixed(4).replace(/\.?0+$/,'');
  const sup=n=>String(n).split('').map(c=>({'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[c])).join('');
  const equal=(a,b)=>Boolean(a&&b&&a.every((v,i)=>v===b[i]));
  function unit(dim){if(!dim)return'不相容';return dim.map((v,i)=>v?['m','s'][i]+(v===1?'':sup(v)):'').filter(Boolean).join('·')||'1（無量綱）';}
  const dimText=dim=>dim?`[${dim.join(', ')}]`:'無有效量綱';
  const leaf=name=>({kind:'leaf',name}),constant=value=>({kind:'constant',value}),binary=(op,left,right)=>({kind:op,left,right}),square=child=>({kind:'square',child});
  function term(name){
    const definitions={vt:()=>binary('multiply',leaf('v'),leaf('t')),at:()=>binary('multiply',leaf('a'),leaf('t')),half_at2:()=>binary('multiply',constant(.5),binary('multiply',leaf('a'),square(leaf('t'))))};
    return definitions[name]?definitions[name]():name==='one'?constant(1):leaf(name);
  }
  const names={v:'v₀',a:'a',t:'t',one:'1',vt:'v₀t',at:'at',half_at2:'0.5at²'};
  const symbols={add:'＋',subtract:'−',multiply:'×',divide:'÷'};
  function evaluate(node,env,trace=[]){
    let result;
    if(node.kind==='leaf'){
      const dims={v:[1,-1],a:[1,-2],t:[0,1]};result={dim:dims[node.name],value:env[node.name],label:names[node.name],dimensionError:'',domainError:''};
    }else if(node.kind==='constant')result={dim:[0,0],value:node.value,label:fmt(node.value),dimensionError:'',domainError:''};
    else if(node.kind==='square'){
      const child=evaluate(node.child,env,trace);result={dim:child.dim?.map(v=>2*v)||null,value:child.value**2,label:`(${child.label})²`,dimensionError:child.dimensionError,domainError:child.domainError};
    }else{
      const left=evaluate(node.left,env,trace),right=evaluate(node.right,env,trace),additive=node.kind==='add'||node.kind==='subtract';
      let dim=null,dimensionError=left.dimensionError||right.dimensionError,domainError=left.domainError||right.domainError;
      if(!dimensionError&&left.dim&&right.dim){
        if(additive){if(equal(left.dim,right.dim))dim=[...left.dim];else dimensionError=`${unit(left.dim)} 與 ${unit(right.dim)} 不能直接相加減`;}
        else dim=left.dim.map((v,i)=>v+(node.kind==='divide'?-1:1)*right.dim[i]);
      }
      if(node.kind==='divide'&&right.value===0)domainError='除數為 0，數值未定義';
      const operations={add:(a,b)=>a+b,subtract:(a,b)=>a-b,multiply:(a,b)=>a*b,divide:(a,b)=>a/b};
      const value=dimensionError||domainError?NaN:operations[node.kind](left.value,right.value);
      result={dim,value,label:`(${left.label} ${symbols[node.kind]} ${right.label})`,dimensionError,domainError};
    }
    trace.push(result);return result;
  }
  function build({left,op,right,power,coefficient}){
    const l=term(left),r=Number(power)===2?square(term(right)):term(right);
    return {left:l,right:r,root:binary('multiply',constant(Number(coefficient)),binary(op,l,r))};
  }
  const targets={distance:{dim:[1,0],label:'位移 Δx',fn:e=>e.v*e.t+.5*e.a*e.t*e.t},velocity:{dim:[1,-1],label:'末速度 v',fn:e=>e.v+e.a*e.t},acceleration:{dim:[1,-2],label:'加速度 a',fn:e=>e.a}};
  function start(){
    if(!$('units-tree'))return;
    const opts=Object.keys(names).map(key=>`<option value="${key}">${names[key]}</option>`).join('');$('units-left').innerHTML=opts;$('units-right').innerHTML=opts;
    const ids=['units-target','units-v','units-a','units-time','units-coef','units-left','units-op','units-right','units-power'];
    function draw(left,right,result,status,op,k){
      const svg=$('units-tree'),w=Math.max(280,svg.clientWidth),h=svg.clientHeight||300,box=(w-42)/2;
      svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
      const rect=(x,y,width,height)=>`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="var(--paper)" stroke="var(--line)"/>`;
      const text=(x,y,t,size=12,fill='var(--ink)')=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${fill}">${t}</text>`;
      let html=`<title>量綱沿運算樹傳遞；${status}</title><desc>左支 ${left.label} 的量綱 ${dimText(left.dim)}；右支 ${right.label} 的量綱 ${dimText(right.dim)}。${result.dimensionError||result.domainError||'各節點計算成功'}。完整節點值列在下方檢查表。</desc>`;
      const x1=14+box/2,x2=w-14-box/2;
      html+=`<path d="M${x1},102L${w/2},153L${x2},102 M${w/2},153V170" fill="none" stroke="var(--teal)" stroke-width="1.8"/>`;
      html+=rect(14,14,box,88)+rect(w-14-box,14,box,88);
      [[left,x1],[right,x2]].forEach(([node,x])=>{html+=text(x,36,node.label,13)+text(x,59,`${fmt(node.value)} ${unit(node.dim)}`,11)+text(x,81,dimText(node.dim),11,'var(--muted)');});
      html+=text(w/2,139,`先 ${symbols[op]}，再乘 k = ${fmt(k)}`,11);
      html+=rect(14,170,w-28,112)+text(w/2,194,'候選輸出',11,'var(--muted)')+text(w/2,220,status,13)+text(w/2,245,`${fmt(result.value)} ${unit(result.dim)}`,12,'var(--teal)')+text(w/2,266,dimText(result.dim),11,'var(--muted)');
      svg.innerHTML=html;
    }
    function update(){
      const env={v:Number($('units-v').value),a:Number($('units-a').value),t:Number($('units-time').value)};
      const config={left:$('units-left').value,op:$('units-op').value,right:$('units-right').value,power:Number($('units-power').value),coefficient:Number($('units-coef').value)};
      const ast=build(config),trace=[],result=evaluate(ast.root,env,trace),left=evaluate(ast.left,env),right=evaluate(ast.right,env),target=targets[$('units-target').value],reference=target.fn(env),match=equal(result.dim,target.dim);
      let status=result.dimensionError?'運算量綱不相容':!match?`輸出 ${unit(result.dim)}，目標 ${unit(target.dim)}`:result.domainError?'量綱吻合；數值未定義':'量綱吻合目標';
      [['v',env.v],['a',env.a],['time',env.t]].forEach(([name,value])=>$(`units-${name}-value`).textContent=fmt(value));$('units-coef-value').textContent=config.coefficient.toFixed(1);
      $('units-expression').textContent=result.label;$('units-status').textContent=status;$('units-reference').textContent=`${target.label} = ${fmt(reference)} ${unit(target.dim)}`;
      $('units-prediction').textContent=result.dimensionError?'略過：運算量綱不相容':result.domainError?'未定義：除數為 0':`${fmt(result.value)} ${unit(result.dim)}`;
      $('units-difference').textContent=match&&!result.dimensionError&&!result.domainError?`${fmt(result.value-reference)} ${unit(target.dim)}`:'不比較：量綱或定義域未通過';
      $('units-why').textContent=result.dimensionError?`${result.dimensionError}。數字即使能按出結果，也不能把不同量綱直接當同一個物理量。先修正運算結構。`:result.domainError?`${result.domainError}。${match?'量綱已吻合目標，但量綱檢查不負責保證除法有定義。':'而且輸出量綱也未吻合目標。'}請改變 t 或表達式。`:!match?`這條式可進行量綱運算，輸出卻是 ${unit(result.dim)}；目標 ${target.label} 需要 ${unit(target.dim)}。無量綱係數 k 只改數值，無法補回缺少的長度或時間。`:Math.abs(result.value-reference)>1e-10?`量綱正確，但候選與固定加速度模型差 ${fmt(result.value-reference)} ${unit(target.dim)}。單位檢查抓不到係數錯誤或漏項，仍須用運動機制與新資料驗證。`:`目前量綱吻合，數值也與這個輸入下的固定加速度模型一致。單點吻合仍不能證明公式對所有時間成立；試改速度、加速度與時間。`;
      $('units-trace').innerHTML=trace.map(n=>`<tr><td>${n.label}</td><td>${dimText(n.dim)}</td><td>${unit(n.dim)}</td><td>${n.dimensionError||n.domainError||fmt(n.value)}</td></tr>`).join('');
      draw(left,right,result,status,config.op,config.coefficient);
    }
    function preset(name){
      const defaults={motion:['distance',3,2,2,1,'vt','add','half_at2',1],'bad-add':['distance',3,2,2,1,'v','add','t',1],double:['distance',3,0,2,2,'v','multiply','t',1],zero:['acceleration',3,2,0,1,'v','divide','t',1]};
      defaults[name].forEach((v,i)=>$(ids[i]).value=v);update();
    }
    ids.forEach(id=>$(id).addEventListener('input',update));document.querySelectorAll('[data-unit-case]').forEach(b=>b.onclick=()=>preset(b.dataset.unitCase));$('units-reset').onclick=()=>preset('motion');window.addEventListener('resize',update);preset('motion');
  }
  start();
  if(typeof module!=='undefined'&&module.exports)module.exports={equal,unit,evaluate,build,targets,term};
})();

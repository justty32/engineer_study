(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const set = (id, values) => Object.entries(values).forEach(([key,value]) => $(id).setAttribute(key,String(value)));
  const put = (id, value) => { $(id).textContent=value; };
  const clean = (input, fallback) => {
    const raw=input.value.trim();
    const candidate=raw===''?NaN:Number(raw);
    const min=Number(input.min),max=Number(input.max),step=Number(input.step);
    const value=Number.isFinite(candidate)?candidate:fallback;
    const limited=Math.max(min,Math.min(max,value));
    const snapped=Math.max(min,Math.min(max,min+Math.round((limited-min)/step)*step));
    input.value=String(Number(snapped.toFixed(8)));
    return Number(input.value);
  };
  function bind(id, fallback, resetId, update) {
    const input=$(id);
    if(!input)return;
    const render=()=>update(clean(input,fallback));
    input.addEventListener('input',render);
    input.addEventListener('change',render);
    $(resetId).addEventListener('click',()=>{input.value=String(fallback);render();});
    render();
  }
  bind('eminduct-theta',60,'eminduct-flux-reset',theta=>{
    const r=theta*Math.PI/180,s=Math.sin(r),c=Math.cos(r);
    let flux=6*c;if(Math.abs(flux)<1e-10)flux=0;
    set('eminduct-normal',{x2:300+140*c,y2:245-140*s});
    set('eminduct-normal-label',{x:312+140*c,y:235-140*s});
    set('eminduct-plane',{x1:300-100*s,y1:245-100*c,x2:300+100*s,y2:245+100*c});
    set('eminduct-angle-arc',{d:theta===0?'M350 245':`M350 245 A50 50 0 0 0 ${300+50*c} ${245-50*s}`});
    put('eminduct-angle-label',`${theta}°`);
    put('eminduct-flux-reading',`Φ = BA cos θ = ${flux>0?'+':''}${flux.toFixed(3)} mWb`);
    put('eminduct-theta-value',`${theta}°；磁通 ${flux.toFixed(3)} mWb`);
    put('eminduct-theta-feedback',flux===0?'法向與場垂直，投影為零；B 仍是 .30 T，不能判定沒有磁場。':flux>0?'磁場朝所選法向的正面穿過，投影為正。只比較靜態角度，尚不能求電動勢。':'磁場由所選法向的反面穿過，投影為負。負號只記方向，沒有改變場大小。');
  });
  bind('eminduct-speed',3,'eminduct-power-reset',u=>{
    const emf=.1*u,current=.2*u,force=.02*u,power=.02*u*u;
    set('eminduct-force-external',{x1:440,x2:440+15*u});
    set('eminduct-force-magnetic',{x1:440,x2:440-15*u});
    for(const id of ['eminduct-force-external','eminduct-force-magnetic','eminduct-power-current-arrow'])set(id,{opacity:u===0?0:1});
    set('eminduct-power-point',{cx:85+70*u,cy:580-260*power});
    put('eminduct-power-reading',`ℰ幅值 ${emf.toFixed(3)} V；I ${current.toFixed(3)} A`);
    put('eminduct-force-reading',`F外 ${force.toFixed(3)} N；P ${power.toFixed(3)} W`);
    put('eminduct-speed-value',`${u.toFixed(1)} m/s；F磁 = −${force.toFixed(3)} N`);
    put('eminduct-speed-feedback',u===0?'桿停住且 B 固定：電動勢、電流、磁制動與輸出功率均為零。':`定速需外力 +${force.toFixed(3)} N 平衡向左磁力；P外 = I²R = ${power.toFixed(3)} W。速度翻倍，電流翻倍而功率四倍；能量由拉動者供給。`);
  });
  bind('eminduct-current',2,'eminduct-energy-reset',current=>{
    const linkage=20*current,energy=.01*current*current;
    set('eminduct-linkage-point',{cx:85+105*current,cy:290-2*linkage});
    set('eminduct-energy-point',{cx:85+105*current,cy:630-1000*energy});
    put('eminduct-energy-reading',`λ = ${linkage.toFixed(1)} mWb·turn；U = ${energy.toFixed(3)} J`);
    put('eminduct-current-value',`${current.toFixed(1)} A；儲能 ${energy.toFixed(3)} J`);
    put('eminduct-current-feedback',current===0?'零電流對應零磁鏈與零磁能；模型不含剩磁。':`磁鏈與電流成正比，磁能與電流平方成正比；電流翻倍，磁能四倍。穩態理想 v = 0 仍可存 ${energy.toFixed(3)} J，滑桿未指定 di/dt。`);
  });
})();

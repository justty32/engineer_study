(() => {
  'use strict';
  const epsilon0=8.8541878128e-12,mu0=4*Math.PI*1e-7;
  const c=1/Math.sqrt(mu0*epsilon0),eta0=Math.sqrt(mu0/epsilon0);
  const safe=(raw,min,max,step,fallback)=>{
    const n=typeof raw==='number'?raw:(String(raw).trim()===''?NaN:Number(raw));
    const value=Number.isFinite(n)?n:fallback;
    return Math.max(min,Math.min(max,min+Math.round((value-min)/step)*step));
  };
  const frequency=raw=>{const f=safe(raw,50,200,10,100),wavelength=c/(f*1e6);return {f,wavelength,period:1000/f,beta:2*Math.PI/wavelength,speed:c};};
  const material=raw=>{const epsilon=safe(raw,1,9,1,4),ratio=1/Math.sqrt(epsilon),speed=c*ratio,eta=eta0*ratio;return {epsilon,ratio,speed,eta,h:100/eta,wavelength:speed/1e8};};
  const amplitude=raw=>{const e=safe(raw,0,200,10,100),rms=e/Math.sqrt(2),s=e*e/(2*eta0);return {e,rms,hrms:rms/eta0,s,power:s*.02};};
  const model={epsilon0,mu0,c,eta0,safe,frequency,material,amplitude};
  if(typeof window!=='undefined')window.EMWAVE_MODEL=model;
  if(typeof module!=='undefined'&&module.exports)module.exports=model;
  if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id);
  const result=(label,value)=>`<div class="wave-result"><small>${label}</small><strong>${value}</strong></div>`;
  const fmt=(v,n=6)=>Number(v).toLocaleString('zh-TW',{maximumFractionDigits:n});
  function bind(id,reset,defaultValue,compute,render){
    const input=$(id),button=$(reset);if(!input||!button)return;
    function update(){const value=compute(input.value);input.value=String(value[Object.keys(value)[0]]);render(value);}
    input.addEventListener('input',update);
    button.addEventListener('click',()=>{input.value=String(defaultValue);update();});
    update();
  }
  bind('emwave-frequency','emwave-frequency-reset',100,frequency,m=>{
    $('emwave-frequency-value').textContent=`${m.f} MHz`;
    $('emwave-frequency-results').innerHTML=result('波長 λ',`${fmt(m.wavelength)} m`)+result('週期 T',`${fmt(m.period)} ns`)+result('相位常數 β',`${fmt(m.beta)} rad/m`)+result('相位速度 vp',`${fmt(m.speed,3)} m/s`);
    const points=Array.from({length:241},(_,i)=>{const z=6*i/240;return `${i?'L':'M'}${(85+465*i/240).toFixed(3)},${(330-(100*Math.cos(m.beta*z)+100)/200*245).toFixed(3)}`;});
    $('emwave-frequency-curve').setAttribute('d',points.join(' '));
    $('emwave-frequency-figure-desc').textContent=`目前 ${m.f} MHz，波長 ${fmt(m.wavelength)} 公尺；橫軸固定零到六公尺，峰值固定一百伏特每公尺。真空速度不變。`;
    $('emwave-frequency-why').textContent=`真空常數不變，因此速度固定。${m.f} MHz 的週期是 ${fmt(m.period)} ns，波長 ${fmt(m.wavelength)} m；頻率越高，同一把六公尺的尺容納越多起伏。`;
  });
  bind('emwave-epsilon','emwave-material-reset',4,material,m=>{
    $('emwave-epsilon-value').textContent=`εr = ${m.epsilon}（μr = 1）`;
    $('emwave-epsilon-results').innerHTML=result('相位速度 vp',`${fmt(m.speed,3)} m/s`)+result('波阻抗 η',`${fmt(m.eta)} Ω`)+result('磁場峰值 H₀',`${fmt(m.h)} A/m`)+result('波長 λ',`${fmt(m.wavelength)} m`);
    $('emwave-material-dot').setAttribute('cx',85+(m.epsilon-1)/8*465);
    $('emwave-material-dot').setAttribute('cy',330-m.ratio*245);
    $('emwave-material-desc').textContent=`相對介電常數 ${m.epsilon}，相對速度與相對阻抗皆 ${fmt(m.ratio)}。固定電場峰值一百伏特每公尺時磁場峰值為 ${fmt(m.h)} 安培每公尺。`;
    $('emwave-epsilon-why').textContent=`固定 μr = 1，速度與阻抗皆乘上 1/√εr = ${fmt(m.ratio)}。每個介質各自指定 E₀ = 100 V/m，所以阻抗降低時 H₀ 增加；這不是波穿界後保持相同振幅的模擬。`;
  });
  bind('emwave-amplitude','emwave-average-reset',100,amplitude,m=>{
    $('emwave-amplitude-value').textContent=`E₀ = ${m.e} V/m（峰值）`;
    $('emwave-amplitude-results').innerHTML=result('電場有效值 Erms',`${fmt(m.rms)} V/m`)+result('磁場有效值 Hrms',`${fmt(m.hrms)} A/m`)+result('平均能流',`${fmt(m.s)} W/m²`)+result('正對 0.02 m² 的平均功率',`${fmt(m.power)} W`);
    $('emwave-average-dot').setAttribute('cx',85+m.e/200*465);
    $('emwave-average-dot').setAttribute('cy',330-m.s/60*245);
    $('emwave-average-desc').textContent=`電場峰值 ${m.e} 伏特每公尺，平均能流 ${fmt(m.s)} 瓦特每平方公尺。圓點沿平方拋物線移動。`;
    $('emwave-amplitude-why').textContent=m.e===0?'電場峰值為零，磁場、平均能流與穿面功率皆為零；沒有固定背景功率。':`峰值公式 E₀²/(2η₀) 得 ${fmt(m.s)} W/m²；有效值公式 Erms²/η₀ 已包含平方平均，不再除二。振幅加倍會讓能流四倍，速度與頻率不變。`;
  });
})();

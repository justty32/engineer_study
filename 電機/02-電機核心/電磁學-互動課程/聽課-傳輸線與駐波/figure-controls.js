/* 本課三個實驗；由 build-course.py 併入播放器，不另載入。 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const length=$('emline-length'), load=$('emline-load'), distance=$('emline-distance');
  if(!length||!load||!distance)return;
  const clean=n=>Math.abs(n)<1e-10?0:n;
  const fmt=(n,d=3)=>clean(n).toFixed(d);
  function bound(el,fallback,min,max,step){
    const parsed=el.value.trim()===''?NaN:Number(el.value);
    const n=Number.isFinite(parsed)?parsed:fallback;
    const val=Math.min(max,Math.max(min,min+Math.round((n-min)/step)*step));
    el.value=String(Number(val.toFixed(6)));return val;
  }
  function curve(fn,x,y){return Array.from({length:201},(_,i)=>{const u=-.5+i/400;return `${i?'L':'M'}${x(u).toFixed(3)},${y(fn(u)).toFixed(3)}`}).join(' ');}
  function updateDelay(){
    const ell=bound(length,2,0,10,.5),td=5*ell;
    $('emline-delay-dot').setAttribute('cx',String(90+45*ell));
    $('emline-delay-dot').setAttribute('cy',String(400-6*td));
    const text=`${ell.toFixed(1)} m：單程 ${td.toFixed(1)} ns；往返 ${(2*td).toFixed(1)} ns`;
    $('emline-length-output').textContent=text;
    $('emline-delay-reading').textContent=text;
    $('emline-delay-why').textContent=ell===0?'零長度是數學極限，不是可量測的實體電纜；線型的 Z₀ 與 vp 定義保持不變。':`每公尺延遲 5 ns，所以單程為 ${td.toFixed(1)} ns。Z₀=50 Ω 與 vp=2×10⁸ m/s 不變；2 ns 前緣長 .4 m。`;
    $('emline-delay-desc').textContent=`線長 ${ell} 公尺，單程 ${td} 奈秒，往返 ${2*td} 奈秒。直線斜率每公尺五奈秒。`;
  }
  function updateLoad(){
    const r=bound(load,100,0,200,5),g=(r-50)/(r+50),gm=Math.abs(g);
    const vm=3*g,vl=3*(1+g),il=.06*(1-g),pr=.09*g*g,pl=.09-pr;
    const vswr=gm===1?'∞':fmt((1+gm)/(1-gm),3);
    const vmax=3*(1+gm),vmin=3*(1-gm);
    const env=q=>3*Math.sqrt(Math.max(0,1+g*g+2*g*Math.cos(4*Math.PI*q)));
    $('emline-load-curve').setAttribute('d',curve(env,q=>90+(q+.5)*900,v=>400-v*50));
    $('emline-load-reading').textContent=`RL=${r} Ω；Γ=${fmt(g)}；VSWR=${vswr}`;
    $('emline-load-limits').textContent=`Vmax=${fmt(vmax)} V；Vmin=${fmt(vmin)} V`;
    $('emline-load-output').textContent=`Γ = ${fmt(g)}；V− = ${fmt(vm)} V peak\nVL = ${fmt(vl)} V peak；IL = ${fmt(il,4)} A peak\nP+ = .090 W；P− = ${fmt(pr,4)} W；PL = ${fmt(pl,4)} W\nVSWR = ${vswr}；Vmax/Vmin = ${fmt(vmax)}/${fmt(vmin)} V\n電流包絡：負載 z=0 為 ${fmt(Math.abs(il),4)} A；z=−λ/4 為 ${fmt(.06*(1+g),4)} A`;
    $('emline-load-why').textContent=r===0?'理想短路要求 VL=0，反射電壓完全相消、電流相加；全反射使谷值為零，VSWR=∞，PL=0。':r===50?'負載與特性阻抗相同，不需反射；包絡為固定 3 V 峰值，仍隨時間正弦振盪，負載吸收 .090 W。':`${g>0?'負載大於 50 Ω，負載端電壓相長，是包絡峰。':'負載小於 50 Ω，反射電壓反相，負載端是包絡谷。'}反射功率看 Γ²，所以 Γ 負值不代表負的回波能量。${r===200?'200 Ω 是有限電阻，不能當開路。':''}`;
    $('emline-load-figure-desc').textContent=`負載 ${r} 歐姆，反射係數 ${fmt(g)}，電壓包絡最大 ${fmt(vmax)}、最小 ${fmt(vmin)} 伏特，駐波比 ${vswr}。橫軸 z 除波長從負二分之一到零。`;
  }
  function updateInput(){
    const q=bound(distance,.25,0,.5,.025);
    const a=clean(Math.cos(4*Math.PI*q)/3),b=clean(-Math.sin(4*Math.PI*q)/3),den=(1-a)**2+b*b;
    const re=clean(50*(1-a*a-b*b)/den),im=clean(100*b/den),d=2*q;
    const y=value=>440-(value+40)/150*330;
    for(const [id,value] of [['emline-input-real-dot',re],['emline-input-imag-dot',im]]){
      $(id).setAttribute('cx',String(90+q*900));$(id).setAttribute('cy',String(y(value)));
    }
    const ztext=`${fmt(re,2)} ${im<0?'−':'+'} j${fmt(Math.abs(im),2)} Ω`;
    $('emline-input-reading').textContent=`d/λ=${fmt(q)}；Zin=${ztext}`;
    $('emline-distance-output').textContent=`d/λ = ${fmt(q)}；實際 d = ${fmt(d)} m\nΓin = ${fmt(a,4)} ${b<0?'−':'+'} j${fmt(Math.abs(b),4)}\nZin = ${ztext}；負載仍 100 Ω\n淨平均功率 = .080 W，任意位置相同`;
    $('emline-input-why').textContent=q===.25?'相對相位轉半圈，Γin=−1/3；輸入 25 Ω，但原負載仍 100 Ω。V=j2 V、I=j.080 A，功率仍 .080 W。':q===0||q===.5?'反射比回到 +1/3；輸入為 100 Ω。半波長重複來自兩波相對相位轉滿一圈。':'只移動量測面，反射大小保持 1/3、相位轉 −2βd；電壓電流相加後的比值改變，虛部反映線段儲能而非新增離散元件。';
    $('emline-input-desc').textContent=`固定一百歐姆負載，距離 ${fmt(q)} 波長，即 ${fmt(d)} 公尺，輸入阻抗 ${ztext}。綠曲線為實部、藍曲線為虛部，同一歐姆刻度。`;
  }
  length.addEventListener('input',updateDelay);load.addEventListener('input',updateLoad);distance.addEventListener('input',updateInput);
  $('emline-delay-reset').addEventListener('click',()=>{length.value='2';updateDelay()});
  $('emline-load-reset').addEventListener('click',()=>{load.value='100';updateLoad()});
  $('emline-input-reset').addEventListener('click',()=>{distance.value='0.25';updateInput()});
  updateDelay();updateLoad();updateInput();
})();

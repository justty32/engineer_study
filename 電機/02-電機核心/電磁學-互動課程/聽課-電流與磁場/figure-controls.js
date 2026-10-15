/* 本課兩個自由實驗；此檔由 build-course.py 併入 audio-course.js。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const theta = $('emmagnet-theta');
  const radius = $('emmagnet-radius');
  if (!theta || !radius) return;
  function bounded(input, fallback, min, max, step) {
    const parsed = input.value.trim() === '' ? NaN : Number(input.value);
    const finite = Number.isFinite(parsed) ? parsed : fallback;
    const value = Math.min(max, Math.max(min, min + Math.round((finite-min)/step)*step));
    input.value = String(value);
    return value;
  }
  function setLine(id, values) {
    for (const [k,v] of Object.entries(values)) $(id).setAttribute(k, v.toFixed(3));
  }
  function updateAngle() {
    const degrees = bounded(theta,90,0,180,1);
    const radians = degrees*Math.PI/180;
    const sine = degrees===0 || degrees===180 ? 0 : Math.sin(radians);
    const cosine = degrees===90 ? 0 : Math.cos(radians);
    const vx=300+160*cosine, vy=300-160*sine, force=.2*sine;
    setLine('emmagnet-v-arrow',{x2:vx,y2:vy});
    setLine('emmagnet-v-par',{x2:vx,y2:300});
    setLine('emmagnet-v-perp',{x1:vx,x2:vx,y1:300,y2:vy});
    const reading=`θ = ${degrees}°；|F| = ${force.toFixed(3)} μN`;
    $('emmagnet-theta-output').textContent=reading;
    $('emmagnet-angle-reading').textContent=reading;
    $('emmagnet-angle-direction').textContent=force===0?'磁力為零，沒有力方向':'F 沿 −z，入紙';
    $('emmagnet-angle-why').textContent=force===0
      ?'速度與磁場共線，垂直速度分量為零，因此磁力為零；磁場仍存在。'
      :`垂直分量為 ${(1000*sine).toFixed(1)} m/s；只有這個分量參與磁力。平行分量改號不會使此範圍的力反向。`;
    $('emmagnet-angle-desc').textContent=`磁場改沿正橫軸，速度在紙面與磁場夾 ${degrees} 度。磁力大小 ${force.toFixed(3)} 微牛頓，${force===0?'為零':'朝紙內'}。箭頭方向示意。`;
  }
  function updateWire() {
    const r=bounded(radius,.02,.01,.10,.01), B=2/r, px=260+r*1600;
    $('emmagnet-radius-ring').setAttribute('r',(r*1600).toFixed(3));
    $('emmagnet-radius-point').setAttribute('cx',px.toFixed(3));
    setLine('emmagnet-radius-spoke',{x2:px});
    setLine('emmagnet-radius-b',{x1:px,x2:px,y1:245,y2:175});
    $('emmagnet-wire-dot').setAttribute('cx',(90+(r-.01)/.09*450).toFixed(3));
    $('emmagnet-wire-dot').setAttribute('cy',(790-B*1.1).toFixed(3));
    const reading=`r = ${r.toFixed(2)} m；B = ${B.toFixed(3)} μT`;
    $('emmagnet-radius-output').textContent=reading;
    $('emmagnet-radius-reading').textContent=reading;
    $('emmagnet-wire-why').textContent='固定 10 A 與觀測方位，B 與 r 成反比；距離加倍就減半。此圖不含近回流、端點或導線內部。';
    $('emmagnet-wire-desc').textContent=`出紙十安培長直線；右側觀測點距離 ${r.toFixed(2)} 公尺，磁場 ${B.toFixed(3)} 微特斯拉向上。上圖圓半徑按距離比例，下圖為反比曲線。`;
  }
  theta.addEventListener('input',updateAngle);
  radius.addEventListener('input',updateWire);
  $('emmagnet-angle-reset').addEventListener('click',()=>{theta.value='90';updateAngle();});
  $('emmagnet-wire-reset').addEventListener('click',()=>{radius.value='0.02';updateWire();});
  updateAngle();updateWire();
})();

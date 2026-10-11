(() => {
  'use strict';
  const cap = document.getElementById('capacitance'), time = document.getElementById('time');
  const fmt = (n, d = 2) => Number(n).toFixed(d).replace(/\.?0+$/, '') || '0';
  const text = (x, y, s, size = 16, anchor = 'middle') => `<text x="${x}" y="${y}" fill="#122b48" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  function update() {
    const C = Number(cap.value), t = Number(time.value), voltage = t * t, rate = 2 * t, current = C * rate, power = 2 * t, energy = t * t;
    document.getElementById('capacitance-value').textContent = `${C} µF`;
    document.getElementById('time-value').textContent = `${t.toFixed(1)} s`;
    document.getElementById('voltage-value').textContent = `${fmt(voltage)} V`;
    document.getElementById('voltage-rate').textContent = `${fmt(rate)} V/s`;
    document.getElementById('current-value').textContent = `${fmt(current)} µA`;
    document.getElementById('power-value').textContent = `${fmt(power)} W`;
    document.getElementById('energy-value').textContent = `${fmt(energy)} J`;
    document.getElementById('engineering-feedback').textContent = `在 ${t.toFixed(1)} s，電壓斜率是 ${fmt(rate)} V/s。乘上 ${C} µF，得到 ${fmt(current)} µA。${t === 0 ? '起點的電壓斜率為 0，所以電流也為 0。' : '同一時刻加大電容量，電壓曲線不變，所需電流按比例增加。'}`;
    document.getElementById('energy-feedback').textContent = `獨立功率例：在 ${t.toFixed(1)} s，瞬時功率是 ${fmt(power)} W；從起點累積的能量為 ½ × ${t.toFixed(1)} s × ${fmt(power)} W = ${fmt(energy)} J。改變上方 C 不會改變此例。`;
    const XL = n => 70 + n / 4 * 290, XR = n => 470 + n / 4 * 290, YV = n => 345 - n / 16 * 190, YI = n => 345 - n / 40 * 190;
    let svg = `<rect x="45" y="18" width="305" height="68" rx="12" fill="#edf2ff" stroke="#2c54c9"/><rect x="468" y="18" width="308" height="68" rx="12" fill="#fff2af" stroke="#122b48"/>${text(198, 48, '電壓曲線 → 看斜率', 19)}${text(198, 74, `${fmt(rate)} V/s`, 18)}${text(410, 49, `× ${C} µF`, 18)}${text(410, 77, '→', 26)}${text(622, 48, '電容需要的電流', 19)}${text(622, 74, `${fmt(current)} µA`, 18)}`;
    for (const n of [0, 4, 8, 12, 16]) svg += `<line x1="70" y1="${YV(n)}" x2="360" y2="${YV(n)}" stroke="#d5dddf"/>${text(58, YV(n) + 5, String(n), 14, 'end')}`;
    for (const n of [0, 10, 20, 30, 40]) svg += `<line x1="470" y1="${YI(n)}" x2="760" y2="${YI(n)}" stroke="#d5dddf"/>${text(458, YI(n) + 5, String(n), 14, 'end')}`;
    for (const n of [0, 1, 2, 3, 4]) svg += text(XL(n), 369, String(n), 14) + text(XR(n), 369, String(n), 14);
    svg += `<path d="M70 143V345H370M470 143V345H770" stroke="#677781" fill="none" stroke-width="1.5"/>${text(70, 128, '電壓 v（V）', 17, 'start')}${text(470, 128, '電流 i（µA）', 17, 'start')}${text(367, 391, 't（s）', 16)}${text(767, 391, 't（s）', 16)}`;
    let path = '';
    for (let i = 0; i <= 100; i++) { const tt = i / 25; path += `${i ? 'L' : 'M'}${XL(tt)},${YV(tt * tt)} `; }
    const a = Math.max(0, t - 0.42), b = Math.min(4, t + 0.42);
    svg += `<path d="${path}" fill="none" stroke="#2c54c9" stroke-width="4"/><line x1="${XL(a)}" y1="${YV(voltage + rate * (a - t))}" x2="${XL(b)}" y2="${YV(voltage + rate * (b - t))}" stroke="#122b48" stroke-width="3" stroke-dasharray="6 4"/><line x1="${XR(0)}" y1="${YI(0)}" x2="${XR(4)}" y2="${YI(8 * C)}" stroke="#e8795e" stroke-width="4"/><path d="M${XL(t)} 345V${YV(voltage)}M${XR(t)} 345V${YI(current)}" stroke="#122b48" stroke-dasharray="4 4"/><circle cx="${XL(t)}" cy="${YV(voltage)}" r="7" fill="#ffe76d" stroke="#122b48" stroke-width="2"/><circle cx="${XR(t)}" cy="${YI(current)}" r="7" fill="#ffe76d" stroke="#122b48" stroke-width="2"/>${text(410, 416, '理想定值電容；左圖固定 0–16 V，右圖固定 0–40 µA。', 14)}`;
    document.getElementById('engineering-plot').innerHTML = svg;
    const X = n => 85 + n / 4 * 365, Y = n => 220 - n / 8 * 175;
    let e = `<path d="M85 30V220H475" fill="none" stroke="#677781" stroke-width="1.5"/><path d="M85 220L${X(t)} ${Y(power)}L${X(t)} 220Z" fill="#dbe6ff"/><path d="M85 220L450 45" stroke="#2c54c9" stroke-width="4" fill="none"/><path d="M${X(t)} 220V${Y(power)}" stroke="#122b48" stroke-width="2" stroke-dasharray="5 4"/><circle cx="${X(t)}" cy="${Y(power)}" r="7" fill="#ffe76d" stroke="#122b48"/>`;
    for (const n of [0, 1, 2, 3, 4]) e += text(X(n), 246, String(n), 14);
    for (const n of [0, 4, 8]) e += text(70, Y(n) + 5, String(n), 14, 'end');
    e += text(95, 23, '功率 P（W）', 18, 'start') + text(475, 267, 't（s）', 16) + text(515, 58, '藍色面積 = 累積能量', 20, 'start') + text(515, 106, `底：${t.toFixed(1)} s`, 20, 'start') + text(515, 151, `高：${fmt(power)} W`, 20, 'start') + text(515, 205, `能量：${fmt(energy)} J`, 24, 'start');
    document.getElementById('energy-plot').innerHTML = e;
  }
  cap.addEventListener('input', update);
  time.addEventListener('input', update);
  document.getElementById('engineering-reset').addEventListener('click', () => { cap.value = '2'; time.value = '2'; update(); });
  update();
})();

(() => {
  'use strict';
  const shape = document.getElementById('shape'), point = document.getElementById('point');
  const fmt = (n, d = 2) => Number(n).toFixed(d).replace(/\.?0+$/, '') || '0';
  const text = (x, y, s, size = 16, anchor = 'middle') => `<text x="${x}" y="${y}" fill="#122b48" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  const models = {
    bowl: { f: x => (x - 1) ** 2, df: x => 2 * (x - 1), lo: -1, hi: 10, ticks: [0, 3, 6, 9], candidates: [-2, 1, 2], label: 'f(x) = (x − 1)²', min: '0（x = 1）', max: '9（x = −2）', candidateText: '比較候選點：f(−2) = 9；f(1) = 0；f(2) = 1。' },
    cube: { f: x => x ** 3, df: x => 3 * x * x, lo: -9, hi: 9, ticks: [-8, -4, 0, 4, 8], candidates: [-2, 0, 2], label: 'f(x) = x³', min: '−8（x = −2）', max: '8（x = 2）', candidateText: '比較候選點：f(−2) = −8；f(0) = 0；f(2) = 8。' },
    corner: { f: Math.abs, df: x => x === 0 ? null : Math.sign(x), lo: -0.3, hi: 2.5, ticks: [0, 1, 2], candidates: [-2, 0, 2], label: 'f(x) = |x|', min: '0（x = 0）', max: '2（x = −2、2）', candidateText: '比較候選點：f(−2) = 2；f(0) = 0；f(2) = 2。' }
  };
  function update() {
    const x = Number(point.value), m = models[shape.value], value = m.f(x), slope = m.df(x);
    document.getElementById('point-value').textContent = x.toFixed(1);
    document.getElementById('height-value').textContent = fmt(value);
    document.getElementById('slope-value').textContent = slope === null ? '不存在（尖角）' : fmt(slope);
    document.getElementById('minimum-value').textContent = m.min;
    document.getElementById('maximum-value').textContent = m.max;
    document.getElementById('applications-candidates').textContent = m.candidateText;
    let why;
    if (shape.value === 'bowl') why = x === 1 ? '這裡導數為 0，而且左邊下降、右邊上升，所以是最低點。還要比較兩端，才能確認全區間最大值在 x = −2。' : `現在斜率為 ${fmt(slope)}，向右走時曲線${slope < 0 ? '下降' : '上升'}。真正的碗底在 x = 1；最大值位於左端點 x = −2。`;
    else if (shape.value === 'cube') why = x === 0 ? '斜率雖然是 0，兩邊仍一路上升：左邊低、右邊高。這是駐點，卻不是極值；最大與最小都在區間端點。' : `現在斜率為 ${fmt(slope)}。移到 x = 0，會看到曲線短暫變平，卻沒有由升轉降或由降轉升，所以那裡不是極值。`;
    else why = x === 0 ? '在尖角，左邊斜率 −1、右邊斜率 ＋1，沒有同一個導數。但兩側都更高，所以這裡仍是最低點。' : `現在斜率為 ${fmt(slope)}。尖角 x = 0 不能套用「令導數等於 0」，仍要列入候選並比較高度。`;
    if (Math.abs(x) === 2) why += ' 你目前站在端點；此處顯示的是原函數公式的導數，找區間極值時端點本身就必須比較。';
    document.getElementById('applications-feedback').textContent = why;
    const X = n => 85 + (n + 2) / 4 * 650, Y = n => 355 - (n - m.lo) / (m.hi - m.lo) * 300;
    let out = text(85, 27, m.label, 20, 'start') + text(740, 27, '比較範圍：[−2, 2]', 16, 'end');
    for (const yy of m.ticks) out += `<line x1="85" y1="${Y(yy)}" x2="735" y2="${Y(yy)}" stroke="#d5dddf"/>${text(67, Y(yy) + 5, String(yy), 14, 'end')}`;
    for (const xx of [-2, -1, 0, 1, 2]) out += `<line x1="${X(xx)}" y1="55" x2="${X(xx)}" y2="355" stroke="#d5dddf"/>${text(X(xx), 382, String(xx), 14)}`;
    out += `<path d="M85 ${Y(0)}H748M${X(0)} 45V358" fill="none" stroke="#677781" stroke-width="1.5"/>${text(765, Y(0) + 5, 'x', 16)}${text(65, 49, 'f(x)', 16)}`;
    let path = '';
    for (let i = 0; i <= 160; i++) { const xx = -2 + i / 40; path += `${i ? 'L' : 'M'}${X(xx).toFixed(2)},${Y(m.f(xx)).toFixed(2)} `; }
    out += `<path d="${path}" fill="none" stroke="#2c54c9" stroke-width="4"/>`;
    for (const c of m.candidates) out += `<circle cx="${X(c)}" cy="${Y(m.f(c))}" r="10" fill="white" stroke="#c85b43" stroke-width="3"/>`;
    if (slope !== null) { const a = Math.max(-2, x - 0.28), b = Math.min(2, x + 0.28); out += `<line x1="${X(a)}" y1="${Y(value + slope * (a - x))}" x2="${X(b)}" y2="${Y(value + slope * (b - x))}" stroke="#122b48" stroke-width="3" stroke-dasharray="6 4"/>`; }
    out += `<circle cx="${X(x)}" cy="${Y(value)}" r="7" fill="#ffe76d" stroke="#122b48" stroke-width="2"/>${text(410, 410, `目前 x = ${x.toFixed(1)}，高度 ${fmt(value)}；${slope === null ? '尖角無唯一切線' : `斜率 ${fmt(slope)}`}`, 16)}`;
    document.getElementById('applications-plot').innerHTML = out;
  }
  shape.addEventListener('change', update);
  point.addEventListener('input', update);
  document.getElementById('applications-reset').addEventListener('click', () => { shape.value = 'bowl'; point.value = '0'; update(); });
  update();
})();

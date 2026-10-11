(() => {
  'use strict';
  const rule = document.getElementById('rule');
  const input = document.getElementById('input');
  const fmt = (n, d = 4) => Number(n).toFixed(d).replace(/\.?0+$/, '') || '0';
  const text = (x, y, s, size = 18, anchor = 'middle') => `<text x="${x}" y="${y}" fill="#122b48" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  const box = (x, width, label) => `<rect x="${x}" y="43" width="${width}" height="61" rx="11" fill="#edf2ff" stroke="#2c54c9" stroke-width="2"/>${text(x + width / 2, 81, label)}`;
  const models = {
    power: { f: x => x ** 3, df: x => 3 * x * x, label: 'f(x) = x³', formula: '(x³)′ = 3x²', max: 15 },
    product: { f: x => x * x * Math.sin(x), df: x => 2 * x * Math.sin(x) + x * x * Math.cos(x), label: 'f(x) = x² sin x', formula: '(x² sin x)′ = 2x sin x + x² cos x', max: 5 },
    chain: { f: x => Math.sin(x * x), df: x => Math.cos(x * x) * 2 * x, label: 'f(x) = sin(x²)', formula: '(sin(x²))′ = cos(x²) × 2x', max: 2 }
  };
  function update() {
    const x = Number(input.value), m = models[rule.value], value = m.f(x), slope = m.df(x);
    document.getElementById('input-value').textContent = x.toFixed(1);
    document.getElementById('function-value').textContent = fmt(value);
    document.getElementById('derivative-value').textContent = fmt(slope);
    document.getElementById('rules-formula').textContent = m.formula;
    let machine, why;
    if (rule.value === 'chain') {
      machine = box(40, 130, `x = ${x.toFixed(1)}`) + box(290, 230, `平方：u = ${fmt(x * x, 2)}`) + box(615, 170, `sin u = ${fmt(value, 3)}`) + text(230, 82, '→', 30) + text(565, 82, '→', 30) + text(290, 135, `第一段倍率：${fmt(2 * x)}`) + text(590, 135, `第二段倍率：${fmt(Math.cos(x * x))}`);
      why = `先平方，再取正弦。兩段變化率相乘：${fmt(2 * x)} × ${fmt(Math.cos(x * x))} = ${fmt(slope)}。${slope < 0 ? '第二段倍率為負，所以此處輸入增加，最後輸出反而下降。' : '此處總倍率為正，輸入增加時，最後輸出也增加。'}`;
    } else if (rule.value === 'product') {
      machine = box(40, 140, `x = ${x.toFixed(1)}`) + box(280, 250, '平方輸出 × 正弦輸出') + box(625, 160, `f = ${fmt(value, 3)}`) + text(230, 82, '→', 30) + text(575, 82, '→', 30) + text(405, 135, `兩條貢獻：${fmt(2 * x * Math.sin(x))} + ${fmt(x * x * Math.cos(x))}`);
      why = `兩個因子都會變。平方變動的貢獻是 ${fmt(2 * x * Math.sin(x))}，正弦變動的貢獻是 ${fmt(x * x * Math.cos(x))}，相加得到 ${fmt(slope)}。不能只把兩個導數相乘。`;
    } else {
      machine = box(40, 140, `x = ${x.toFixed(1)}`) + box(290, 230, '三次方機器：x³') + box(630, 155, `f = ${fmt(value, 3)}`) + text(235, 82, '→', 30) + text(575, 82, '→', 30) + text(410, 135, `冪次降一階：3 × ${x.toFixed(1)}² = ${fmt(slope)}`);
      why = `三次方的導數是 3x²。現在 x = ${x.toFixed(1)}，局部變化率為 ${fmt(slope)}；輸入增加很小的 Δx 時，輸出增加量約為 ${fmt(slope)} × Δx。`;
    }
    document.getElementById('rules-machine').innerHTML = text(35, 25, '跟著輸入，走過機器', 18, 'start') + machine;
    document.getElementById('rules-feedback').textContent = why;
    const X = n => 75 + n / 2.4 * 660, min = rule.value === 'chain' ? -2 : -1;
    const Y = n => 364 - (n - min) / (m.max - min) * 175;
    let path = '';
    for (let i = 0; i <= 150; i++) { const xx = i / 150 * 2.4; path += `${i ? 'L' : 'M'}${X(xx).toFixed(2)},${Y(m.f(xx)).toFixed(2)} `; }
    let axes = '';
    for (const xx of [0, 0.5, 1, 1.5, 2]) axes += `<line x1="${X(xx)}" y1="182" x2="${X(xx)}" y2="366" stroke="#d5dddf"/>` + text(X(xx), 389, String(xx), 14);
    axes += `<path d="M75 182V${Y(0)}H750" fill="none" stroke="#677781" stroke-width="1.5"/>` + text(755, 389, 'x', 16) + text(77, 172, m.label, 16, 'start');
    const half = 0.24;
    document.getElementById('rules-plot').innerHTML = `<defs><clipPath id="rules-clip"><rect x="72" y="182" width="680" height="186"/></clipPath></defs>${axes}<g clip-path="url(#rules-clip)"><path d="${path}" class="curve" fill="none" stroke="#2c54c9" stroke-width="3"/><line x1="${X(x - half)}" y1="${Y(value - slope * half)}" x2="${X(x + half)}" y2="${Y(value + slope * half)}" stroke="#122b48" stroke-width="3" stroke-dasharray="7 5"/><circle cx="${X(x)}" cy="${Y(value)}" r="7" fill="#ffe76d" stroke="#122b48" stroke-width="2"/></g>${text(780, 410, '各接法縱軸尺度不同；倍率請看數值。', 14, 'end')}`;
  }
  rule.addEventListener('change', update);
  input.addEventListener('input', update);
  document.getElementById('rules-reset').addEventListener('click', () => { rule.value = 'chain'; input.value = '1'; update(); });
  update();
})();

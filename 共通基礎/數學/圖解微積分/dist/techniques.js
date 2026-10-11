'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const method = $('method'), upper = $('upper');
  const fmt = (n, d = 6) => Calc.fmt(Math.abs(n) < 1e-12 ? 0 : n, d);
  function shade(fn, b, X, Y) {
    let paths = '';
    for (const sign of [1, -1]) {
      const points = [];
      for (let i = 0; i <= 180; i += 1) {
        const x = b * i / 180, y = fn(x);
        points.push(`${X(x)},${Y(sign > 0 ? Math.max(0, y) : Math.min(0, y))}`);
      }
      paths += `<path d="M${X(0)},${Y(0)} L${points.join(' L')} L${X(b)},${Y(0)} Z" class="${sign > 0 ? 'area-fill' : 'area-negative'}"/>`;
    }
    return paths;
  }
  function draw() {
    const b = Number(upper.value), sub = method.value === 'substitution';
    const fn = sub ? x => 2 * x * Math.cos(x * x) : x => x * Math.exp(x);
    const value = sub ? Math.sin(b * b) : (b - 1) * Math.exp(b) + 1;
    const { X, Y, axes } = Calc.plot({ xmin: -0.1, xmax: 2.2, ymin: sub ? -3.6 : -1, ymax: sub ? 2.3 : 16, x: 62, y: 67, w: 415, h: 275, xticks: [0, 1, 2], yticks: sub ? [-3, -1, 0, 1, 2] : [0, 5, 10, 15], xlabel: 'x', ylabel: 'f(x)' });
    const lines = sub ? [
      '① u = x²', 'du = 2x dx',
      `② x：0 → ${fmt(b, 1)}`, `u：0 → ${fmt(b * b, 2)}`,
      `③ sin(${fmt(b * b, 2)}) − sin(0)`, `= ${fmt(value)}`
    ] : [
      '① u = x，v = eˣ', 'du = dx，dv = eˣ dx',
      `② 邊界項：b eᵇ = ${fmt(b * Math.exp(b), 3)}`, `減去 eᵇ − 1 = ${fmt(Math.exp(b) - 1, 3)}`,
      '③ (b − 1)eᵇ + 1', `= ${fmt(value)}`
    ];
    $('technique-drawing').innerHTML = `${shade(fn, b, X, Y)}${axes}<path d="${Calc.path(fn, 0, 2, X, Y)}" class="curve"/><line x1="${X(b)}" y1="${Y(0)}" x2="${X(b)}" y2="${Y(fn(b))}" class="tangent"/><circle cx="${X(b)}" cy="${Y(fn(b))}" r="6" fill="#ffe274" stroke="#182643"/><text x="63" y="31" class="svg-label">${sub ? 'f(x) = 2x cos(x²)' : 'f(x) = x eˣ'}</text><rect x="518" y="60" width="291" height="286" rx="12" fill="#fff7dc"/>${lines.map((line, i) => `<text x="537" y="${94 + i * 43}" class="${i === 3 && !sub ? 'svg-small' : 'svg-label'}">${line}</text>`).join('')}<text x="71" y="388" class="svg-label">從 0 到 ${fmt(b, 1)} 的有號累積 = ${fmt(value)}</text>`;
    $('upper-value').textContent = fmt(b, 1);
    $('result-value').textContent = fmt(value);
    $('detail-label').firstChild.textContent = sub ? '新變數的上下限' : '分部的邊界項 b eᵇ';
    $('detail-value').textContent = sub ? `0 → ${fmt(b * b, 2)}` : fmt(b * Math.exp(b));
    $('equation').textContent = sub ? `sin(${fmt(b * b, 2)}) − sin(0)` : `(${fmt(b, 1)} − 1)e^${fmt(b, 1)} + 1`;
    $('technique-desc').textContent = `${sub ? '代換積分' : '分部積分'}，上限 ${fmt(b, 1)}，精確定積分 ${fmt(value)}。${sub ? `新變數 u 從 0 到 ${fmt(b * b, 2)}。` : `乘積邊界項 ${fmt(b * Math.exp(b))}，減去 ${fmt(Math.exp(b) - 1)}。`}`;
    $('why').textContent = b === 0 ? '上下限都是 0，區間沒有寬度，所以兩個例子的定積分都是 0。公式也必須給出相同結果；分部例子中的 −1 與下限帶來的 +1 正好抵消。' : sub ? `把 u 設成 x² 後，2x dx 整塊換成 du，上限也從 ${fmt(b, 1)} 換成 ${fmt(b * b, 2)}。${b > Math.sqrt(Math.PI / 2) ? '終點已越過曲線變負的位置，新增的負量會讓累積下降。' : '目前區間內曲線不為負，往右增加的量也不為負。'}結果為 ${fmt(value)}；角度按弧度計算。` : `u = x 微分成 1，剩下的 ∫ eˣ dx 很好算。乘積邊界項 ${fmt(b * Math.exp(b))}，減去 eᵇ − e⁰ = ${fmt(Math.exp(b) - 1)}，得到 ${fmt(value)}。最後的 +1 來自下限，不能漏掉。`;
  }
  method.addEventListener('change', draw);
  upper.addEventListener('input', draw);
  $('reset').addEventListener('click', () => { method.value = 'substitution'; upper.value = '1'; draw(); });
  draw();
})();

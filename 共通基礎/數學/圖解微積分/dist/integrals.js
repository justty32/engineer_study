'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const upper = $('upper'), strips = $('strips');
  const fmt = (n, d = 4) => Calc.fmt(Math.abs(n) < 1e-12 ? 0 : n, d);
  function draw() {
    const b = Number(upper.value), n = Number(strips.value), dx = (b + 1) / n;
    const signed = (b * b - 1) / 2;
    const geometric = b >= 0 ? (1 + b * b) / 2 : (1 - b * b) / 2;
    let sum = 0;
    const { X, Y, axes } = Calc.plot({ xmin: -1.3, xmax: 2.3, ymin: -1.35, ymax: 2.4, x: 74, y: 38, w: 680, h: 305, xticks: [-1, 0, 1, 2], yticks: [-1, 0, 1, 2], xlabel: 'x', ylabel: '' });
    let shapes = '';
    if (b > -1) {
      const end = Math.min(b, 0);
      shapes += `<path d="M${X(-1)},${Y(0)} L${X(-1)},${Y(-1)} L${X(end)},${Y(end)} L${X(end)},${Y(0)} Z" class="area-negative"/>`;
      if (b > 0) shapes += `<path d="M${X(0)},${Y(0)} L${X(b)},${Y(b)} L${X(b)},${Y(0)} Z" class="area-fill"/>`;
    }
    let rectangles = '';
    for (let k = 1; k <= n; k += 1) {
      const left = -1 + (k - 1) * dx, right = -1 + k * dx;
      sum += right * dx;
      if (dx > 0) rectangles += `<rect x="${X(left)}" y="${Math.min(Y(0), Y(right))}" width="${X(right) - X(left)}" height="${Math.abs(Y(right) - Y(0))}" fill="${right >= 0 ? '#2345b5' : '#b84435'}" fill-opacity="0.08" stroke="${right >= 0 ? '#2345b5' : '#b84435'}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    }
    $('area-drawing').innerHTML = `${shapes}${axes}${rectangles}<path d="${Calc.path(x => x, -1.15, 2.15, X, Y)}" class="curve"/><line x1="${X(b)}" y1="${Y(-1.25)}" x2="${X(b)}" y2="${Y(2.25)}" class="tangent"/><circle cx="${X(b)}" cy="${Y(b)}" r="7" fill="#ffe274" stroke="#182643"/><text x="95" y="28" class="svg-label">f(x) = x</text><text x="85" y="389" class="svg-label">實色：精確區域　／　虛線：右端點小長條</text>`;
    $('upper-value').textContent = fmt(b, 1);
    $('strips-value').textContent = n;
    $('sum-value').textContent = fmt(sum);
    $('signed-value').textContent = fmt(signed);
    $('geometric-value').textContent = fmt(geometric);
    $('width-value').textContent = fmt(dx);
    $('area-desc').textContent = `從 −1 到 ${fmt(b, 1)}，切成 ${n} 條，右端點和 ${fmt(sum)}，精確有號量 ${fmt(signed)}，幾何總面積 ${fmt(geometric)}。`;
    $('why').textContent = b === -1 ? '起點與終點重合，所以每條寬度為 0；累積量與幾何面積也都是 0。' : `這條線一路上升，右端點高度會高估每段的有號量；目前近似值比精確值多 ${fmt(sum - signed)}。${b <= 0 ? '區域在軸下，有號量為負，幾何面積仍為正。' : b === 1 ? '正、負各 0.5 恰好抵消；有號量為 0，幾何總面積為 1。' : '軸下的量要減掉，軸上的量才加上；幾何面積則兩邊都算正。'}試著只增加條數，觀察誤差縮小。`;
  }
  upper.addEventListener('input', draw);
  strips.addEventListener('input', draw);
  $('reset').addEventListener('click', () => { upper.value = '1'; strips.value = '8'; draw(); });
  draw();
})();

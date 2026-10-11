'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const upper = $('upper'), constant = $('constant');
  const fmt = (n, d = 3) => Calc.fmt(Math.abs(n) < 1e-12 ? 0 : n, d);
  function draw() {
    const x = Number(upper.value), c = Number(constant.value), a = x * x / 2;
    const l = Calc.plot({ xmin: -0.3, xmax: 4.3, ymin: -0.5, ymax: 4.6, x: 54, y: 60, w: 305, h: 280, xticks: [0, 2, 4], yticks: [0, 2, 4], xlabel: 't', ylabel: 'f(t)' });
    const r = Calc.plot({ xmin: -0.3, xmax: 4.3, ymin: -4, ymax: 12, x: 453, y: 60, w: 305, h: 280, xticks: [0, 2, 4], yticks: [-3, 0, 4, 8, 11], xlabel: 'x', ylabel: 'F(x)' });
    const lo = Math.max(0, x - 0.7), hi = Math.min(4, x + 0.7);
    $('ftc-drawing').innerHTML = `<path d="M${l.X(0)},${l.Y(0)} L${l.X(x)},${l.Y(x)} L${l.X(x)},${l.Y(0)} Z" class="area-fill"/>${l.axes}${r.axes}<path d="${Calc.path(t => t, 0, 4, l.X, l.Y)}" class="curve"/><line x1="${l.X(x)}" y1="${l.Y(0)}" x2="${l.X(x)}" y2="${l.Y(x)}" class="tangent"/><circle cx="${l.X(x)}" cy="${l.Y(x)}" r="6" fill="#ffe274" stroke="#182643"/><path d="${Calc.path(t => t * t / 2, 0, 4, r.X, r.Y)}" fill="none" stroke="#8793a5" stroke-width="2" stroke-dasharray="6 5"/><path d="${Calc.path(t => t * t / 2 + c, 0, 4, r.X, r.Y)}" class="curve"/><path d="${Calc.path(t => a + c + x * (t - x), lo, hi, r.X, r.Y, 2)}" class="tangent"/><circle cx="${r.X(0)}" cy="${r.Y(c)}" r="5" fill="#e3745c" stroke="#182643"/><circle cx="${r.X(x)}" cy="${r.Y(a + c)}" r="7" fill="#ffe274" stroke="#182643"/><line x1="${r.X(x)}" y1="${r.Y(c)}" x2="${r.X(x)}" y2="${r.Y(a + c)}" stroke="#b84435" stroke-width="3"/><text x="55" y="30" class="svg-label">速率 f(t) = t</text><text x="445" y="30" class="svg-label">原函數 F(x) = x² / 2 + C</text><text x="65" y="381" class="svg-label">著色累積量 A(x) = ${fmt(a)}</text><text x="442" y="381" class="svg-label">兩點高度差 = ${fmt(a)}</text><text x="442" y="406" class="svg-small">灰虛線：C = 0　黃點切線斜率：${fmt(x)}</text>`;
    $('upper-value').textContent = fmt(x, 1);
    $('constant-value').textContent = c;
    $('area-value').textContent = fmt(a);
    $('slope-value').textContent = fmt(x);
    $('difference-value').textContent = fmt((a + c) - c);
    $('endpoint-value').textContent = `${fmt(a + c)} − (${fmt(c)})`;
    $('ftc-desc').textContent = `累積到 ${fmt(x, 1)}，面積 ${fmt(a)}，累積曲線斜率 ${fmt(x)}。原函數平移 ${c}，兩端 ${fmt(a + c)} 與 ${fmt(c)} 相減仍為 ${fmt(a)}。`;
    $('why').textContent = x === 0 ? `還沒有走出起點，所以累積為 0；此時加入速率也是 0。C = ${c} 讓兩端一起移動，它們仍是同一點，相減為 0。` : `在 x = ${fmt(x, 1)}，左圖的速率是 ${fmt(x)}，也就是右圖的切線斜率。C = ${c} 把整條原函數平移，兩端分別是 ${fmt(a + c)} 與 ${fmt(c)}；共同位移抵消，差仍是 ${fmt(a)}，等於左圖的累積。`;
  }
  upper.addEventListener('input', draw);
  constant.addEventListener('input', draw);
  $('reset').addEventListener('click', () => { upper.value = '2'; constant.value = '0'; draw(); });
  draw();
})();

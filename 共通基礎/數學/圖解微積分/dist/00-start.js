'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const controls = ['slope', 'intercept', 'input'].map(byId);
  function render() {
    const [m, b, x] = controls.map(control => Number(control.value));
    const y = m * x + b;
    const next = m * (x + 1) + b;
    const { X, Y, axes } = Calc.plot({ xmin: -4.5, xmax: 4.5, ymin: -15, ymax: 15, x: 65, y: 35, w: 695, h: 315, xticks: [-4, -2, 0, 2, 4], yticks: [-12, -6, 0, 6, 12], xlabel: '輸入 x', ylabel: '輸出 y' });
    byId('coordinate-drawing').innerHTML = `${axes}<path d="${Calc.path(t => m * t + b, -4, 4, X, Y)}" class="curve"/><path d="M${X(x)},${Y(y)}H${X(x + 1)}V${Y(next)}" fill="none" stroke="#b88a13" stroke-width="4"/><circle cx="${X(0)}" cy="${Y(b)}" r="5" fill="#203957"/><circle cx="${X(x)}" cy="${Y(y)}" r="7" fill="#f4db66" stroke="#203957" stroke-width="2"/><circle cx="${X(x + 1)}" cy="${Y(next)}" r="6" fill="#db7e69" stroke="#203957" stroke-width="2"/><text x="80" y="391" class="svg-label">● 黃點 (${Calc.fmt(x)}, ${Calc.fmt(y)})</text><text x="355" y="391" class="svg-label">向右 Δx = 1；垂直 Δy = ${Calc.fmt(m)}</text>`;
    ['slope', 'intercept', 'input'].forEach((id, i) => { byId(`${id}-value`).textContent = Calc.fmt([m, b, x][i]); });
    byId('rule-value').textContent = `y = ${Calc.fmt(m)}x ${b < 0 ? '−' : '+'} ${Calc.fmt(Math.abs(b))}`;
    byId('output-y').textContent = Calc.fmt(y);
    byId('delta-y').textContent = Calc.fmt(m);
    const direction = m === 0 ? `輸入增加，輸出仍固定為 ${Calc.fmt(b)}；零斜率不代表輸出是零。` : `輸入增加 1，輸出${m > 0 ? '增加' : '減少'} ${Calc.fmt(Math.abs(m))}，所以斜率是 ${Calc.fmt(m)}。`;
    byId('coordinate-feedback').textContent = `因為 y = mx + b，輸入 ${Calc.fmt(x)} 得到 ${Calc.fmt(m)} × ${Calc.fmt(x)} + (${Calc.fmt(b)}) = ${Calc.fmt(y)}。${direction}`;
    byId('coordinate-desc').textContent = `直線 y = ${m}x + ${b}。目前點 (${x}, ${y})；向右一單位的點是 (${x + 1}, ${next})，垂直變化 ${m}。`;
  }
  controls.forEach(control => control.addEventListener('input', render));
  byId('reset').addEventListener('click', () => { controls.forEach((control, i) => { control.value = [1, 0, 2][i]; }); render(); });
  render();
})();

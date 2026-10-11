'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const mode = byId('mode');
  const distance = byId('distance');
  function render() {
    const h = Number(distance.value);
    const hole = mode.value === 'hole';
    const leftX = 1 - h;
    const rightX = 1 + h;
    const left = hole ? 2 - h : 1;
    const right = hole ? 2 + h : 3;
    const { X, Y, axes } = Calc.plot({ xmin: -0.15, xmax: 2.15, ymin: -0.25, ymax: 3.7, x: 65, y: 35, w: 695, h: 310, xticks: [0, 0.5, 1, 1.5, 2], yticks: [0, 1, 2, 3], xlabel: '輸入 x', ylabel: '高度 f(x)' });
    const graph = hole
      ? `<path d="${Calc.path(x => x + 1, 0, 2, X, Y)}" class="curve"/><circle cx="${X(1)}" cy="${Y(2)}" r="8" fill="#fbf8ed" stroke="#315ed5" stroke-width="3"/>`
      : `<path d="M${X(0)},${Y(1)}H${X(1)}" class="curve"/><path d="M${X(1)},${Y(3)}H${X(2)}" class="curve-alt"/><circle cx="${X(1)}" cy="${Y(1)}" r="8" fill="#fbf8ed" stroke="#315ed5" stroke-width="3"/>`;
    byId('limit-drawing').innerHTML = `${axes}<path d="M${X(1)},${Y(0)}V${Y(3.5)}" stroke="#9da9ba" stroke-dasharray="6 5"/>${graph}<circle cx="${X(1)}" cy="${Y(3)}" r="7" fill="#203957"/><path d="M${X(leftX)},${Y(0)}V${Y(left)}M${X(rightX)},${Y(0)}V${Y(right)}" stroke="#a0a9b7" stroke-dasharray="4 4"/><circle cx="${X(leftX)}" cy="${Y(left)}" r="6" fill="#315ed5" stroke="#fbf8ed" stroke-width="2"/><circle cx="${X(rightX)}" cy="${Y(right)}" r="6" fill="#db7e69" stroke="#fbf8ed" stroke-width="2"/><text x="80" y="391" class="svg-label">左 x = ${Calc.fmt(leftX)}，y = ${Calc.fmt(left)}</text><text x="429" y="391" class="svg-label">右 x = ${Calc.fmt(rightX)}，y = ${Calc.fmt(right)}</text><text x="${X(1) + 15}" y="${Y(3) - 17}" class="svg-label">f(1) = 3</text>`;
    byId('distance-value').textContent = Calc.fmt(h);
    byId('left-value').textContent = Calc.fmt(left);
    byId('right-value').textContent = Calc.fmt(right);
    byId('point-value').textContent = '3';
    byId('limit-value').textContent = hole ? '2' : '不存在';
    byId('limit-feedback').textContent = hole
      ? `左側 ${Calc.fmt(left)}、右側 ${Calc.fmt(right)}，各離 2 的距離都是 ${Calc.fmt(h)}。因為 x ≠ 1 時 f(x) = x + 1，距離 h 越小，兩側就越靠近 2；點值 3 不會改變這個極限。`
      : `距離雖縮到 h = ${Calc.fmt(h)}，左側仍是 1、右側仍是 3。兩側差距固定為 2，沒有共同靠近的高度，所以雙側極限不存在；不是取平均 2。`;
    byId('limit-desc').textContent = `${hole ? '挖洞直線' : '跳階函數'}：左點 (${Calc.fmt(leftX)}, ${Calc.fmt(left)})，右點 (${Calc.fmt(rightX)}, ${Calc.fmt(right)})。f(1) = 3；雙側極限${hole ? '等於2' : '不存在'}。`;
  }
  mode.addEventListener('change', render);
  distance.addEventListener('input', render);
  byId('reset').addEventListener('click', () => { mode.value = 'hole'; distance.value = '0.5'; render(); });
  render();
})();

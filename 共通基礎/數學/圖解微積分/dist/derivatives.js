'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const mode = byId('mode');
  const point = byId('point');
  const step = byId('step');
  function render() {
    const square = mode.value === 'square';
    const a = Number(point.value);
    const h = Number(step.value);
    const f = square ? x => x * x : Math.abs;
    const y = f(a);
    const left = (y - f(a - h)) / h;
    const right = (f(a + h) - y) / h;
    const derivative = square ? 2 * a : a === 0 ? null : Math.sign(a);
    const { X, Y, axes } = Calc.plot({ xmin: -3.3, xmax: 3.3, ymin: -3, ymax: 10, x: 65, y: 35, w: 695, h: 310, xticks: [-3, -2, -1, 0, 1, 2, 3], yticks: [-2, 0, 2, 4, 6, 8, 10], xlabel: '位置 x', ylabel: '高度 f(x)' });
    const tangent = derivative === null ? '' : `<path d="${Calc.path(x => y + derivative * (x - a), -3.3, 3.3, X, Y)}" class="tangent"/>`;
    byId('derivative-drawing').innerHTML = `${axes}<defs><clipPath id="derivative-clip"><rect x="65" y="35" width="695" height="310"/></clipPath></defs><g clip-path="url(#derivative-clip)"><path d="${Calc.path(f, -3.1, 3.1, X, Y, 240)}" fill="none" stroke="#8591aa" stroke-width="3"/>${tangent}<path d="M${X(a - h)},${Y(f(a - h))}L${X(a)},${Y(y)}" fill="none" stroke="#315ed5" stroke-width="5"/><path d="M${X(a)},${Y(y)}L${X(a + h)},${Y(f(a + h))}" fill="none" stroke="#db7e69" stroke-width="5"/><circle cx="${X(a - h)}" cy="${Y(f(a - h))}" r="6" fill="#315ed5"/><circle cx="${X(a + h)}" cy="${Y(f(a + h))}" r="6" fill="#db7e69"/><circle cx="${X(a)}" cy="${Y(y)}" r="7" fill="#f4db66" stroke="#203957" stroke-width="2"/></g><text x="78" y="391" class="svg-label">觀察點 (${Calc.fmt(a)}, ${Calc.fmt(y)})</text><text x="390" y="391" class="svg-label">${derivative === null ? '尖角：沒有共同切線斜率' : `切線斜率 = ${Calc.fmt(derivative)}`}</text>`;
    byId('point-value').textContent = Calc.fmt(a);
    byId('step-value').textContent = Calc.fmt(h);
    byId('left-slope').textContent = Calc.fmt(left);
    byId('right-slope').textContent = Calc.fmt(right);
    byId('true-derivative').textContent = derivative === null ? '不存在' : Calc.fmt(derivative);
    let explanation;
    if (square) {
      explanation = `平方函數的左割線是 2a − h = ${Calc.fmt(left)}，右割線是 2a + h = ${Calc.fmt(right)}。它們各離真正導數 ${Calc.fmt(derivative)} 達 ${Calc.fmt(h)}；h 越小，兩邊越靠近 2a。`;
    } else if (a === 0) {
      explanation = `觀察點正好在尖角。左割線斜率一直是 −1，右割線一直是 +1；即使 h = ${Calc.fmt(h)} 再縮小，兩邊仍不同，所以這裡的導數不存在。`;
    } else if (h > Math.abs(a)) {
      explanation = `觀察點 a = ${Calc.fmt(a)} 的真正導數是 ${Calc.fmt(derivative)}，但有一條割線跨過了 0 的尖角，所以兩段平均斜率分別是 ${Calc.fmt(left)}、${Calc.fmt(right)}。將 h 縮到不超過 ${Calc.fmt(Math.abs(a))}，兩側就會留在觀察點的同一條直線上。`;
    } else {
      explanation = `觀察點在尖角的${a < 0 ? '左' : '右'}邊，兩段都位於同一條直線上，因此左右割線斜率都等於 ${Calc.fmt(derivative)}，也等於這裡的導數。`;
    }
    byId('derivative-feedback').textContent = explanation;
    byId('derivative-desc').textContent = `${square ? '平方' : '絕對值'}函數，觀察位置 ${Calc.fmt(a)}，距離 ${Calc.fmt(h)}。左割線斜率 ${Calc.fmt(left)}，右割線斜率 ${Calc.fmt(right)}；導數${derivative === null ? '不存在' : `等於 ${Calc.fmt(derivative)}`}。`;
  }
  mode.addEventListener('change', render);
  [point, step].forEach(control => control.addEventListener('input', render));
  byId('reset').addEventListener('click', () => { mode.value = 'square'; point.value = '1'; step.value = '0.5'; render(); });
  render();
})();

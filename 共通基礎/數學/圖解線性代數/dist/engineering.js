"use strict";
(() => {
  const {fmt, text, line, dot, arrow, bind} = LA;
  const el = id => document.getElementById(id);
  const models = {
    decay: {name: '每步縮小', matrix: '[0.8 0; 0 0.5]', eigen: '0.8、0.5', point: k => [0.8 ** k, 0.5 ** k], why: '兩個特徵值的絕對值都小於 1，因此所有初始狀態都漸近回到原點。'},
    grow: {name: '一個方向放大', matrix: '[1.2 0; 0 0.5]', eigen: '1.2、0.5', point: k => [1.2 ** k, 0.5 ** k], why: '水平分量每步放大 1.2 倍，垂直分量雖然縮小，仍無法抵銷水平成長；原點不穩定。'},
    flip: {name: '翻向並縮小', matrix: '[-0.8 0; 0 0.5]', eigen: '−0.8、0.5', point: k => [(-0.8) ** k, 0.5 ** k], why: '水平分量每步翻向，但長度倍率仍只有 0.8；兩個特徵值的絕對值都小於 1，所以漸近穩定。'},
    shear: {name: '剪切：倍率都為 1', matrix: '[1 1; 0 1]', eigen: '1、1', point: k => [1 + k, 1], why: '每步把第二分量加進第一分量，因此 xₖ = (1 + k, 1)。特徵值都等於 1，仍會累積成長；邊界需檢查 Jordan 結構。'}
  };
  function update() {
    const mode = el('mode').value, k = Number(el('steps').value), model = models[mode];
    el('mode-value').textContent = model.name;
    el('steps-value').textContent = String(k);
    const points = Array.from({length: k + 1}, (_, i) => model.point(i));
    const point = points[k], lengths = points.map(v => Math.hypot(...v));
    const extent = Math.max(2, Math.ceil(Math.max(...points.flat().map(Math.abs))));
    const scale = 131 / extent, X = x => 208 + x * scale, Y = y => 234 - y * scale;
    const maxLength = Math.max(2, Math.ceil(Math.max(...lengths)));
    const TX = n => 469 + n / 8 * 308, TY = len => 360 - len / maxLength * 235;
    let svg = text(208, 34, '狀態走到哪裡？', 'svg-title', 'middle') + text(624, 34, '離原點多遠？', 'svg-title', 'middle');
    svg += text(208, 68, '兩軸等比例；顯示 0 到 ' + k + ' 步', 'svg-small', 'middle');
    svg += text(624, 68, '高度 = √(x² + y²)', 'svg-small', 'middle');
    svg += line(X(-extent), Y(0), X(extent), Y(0)) + line(X(0), Y(-extent), X(0), Y(extent));
    svg += text(X(extent), Y(0) - 10, 'x', 'svg-small', 'end') + text(X(0) + 10, Y(extent) + 4, 'y', 'svg-small');
    svg += text(X(extent), Y(0) + 23, fmt(extent), 'svg-small', 'middle') + text(X(0) - 10, Y(extent) + 4, fmt(extent), 'svg-small', 'end');
    svg += text(X(0) - 8, Y(0) + 20, '0', 'svg-small', 'end');
    points.forEach((v, i) => {
      if (i > 0) svg += line(X(points[i - 1][0]), Y(points[i - 1][1]), X(v[0]), Y(v[1]), 'curve');
      svg += '<circle cx="' + X(v[0]) + '" cy="' + Y(v[1]) + '" r="' + (i === k ? 6 : 3.5) + '" fill="' + (i === k ? '#d96650' : '#345ce8') + '"/>';
    });
    svg += arrow(X(0), Y(0), X(point[0]), Y(point[1]), 'coral');
    svg += text(X(points[0][0]) + 9, Y(points[0][1]) - 10, k === 0 ? '第 0 步' : '起點', 'svg-small');
    if (k > 0) svg += text(X(point[0]) - 10, Y(point[1]) + 24, '第 ' + k + ' 步', 'svg-small', 'end');
    svg += line(TX(0), TY(0), TX(8), TY(0)) + line(TX(0), TY(0), TX(0), TY(maxLength));
    [0, maxLength / 2, maxLength].forEach(y => {
      svg += line(TX(0), TY(y), TX(8), TY(y), 'gridline');
      svg += text(TX(0) - 12, TY(y) + 5, fmt(y), 'svg-small', 'end');
    });
    for (let i = 0; i <= 8; i++) svg += text(TX(i), 384, i, 'svg-small', 'middle');
    lengths.forEach((len, i) => {
      if (i > 0) svg += line(TX(i - 1), TY(lengths[i - 1]), TX(i), TY(len), 'curve-alt');
      svg += dot(TX(i), TY(len), 'marker', i === k ? 6 : 4);
    });
    svg += text(777, 412, '步數 k', 'svg-small', 'end');
    svg += text(208, 412, 'A = ' + model.matrix, 'svg-label', 'middle');
    el('drawing').innerHTML = svg;
    el('result-primary').textContent = '(' + point.map(v => fmt(v, 4)).join(', ') + ')';
    el('result-secondary').textContent = fmt(lengths[k], 4);
    el('feedback').textContent = 'A 的特徵值為 ' + model.eigen + '。' + model.why + (k === 0 ? ' 現在是第 0 步，各模式都從 (1, 1) 開始。' : '') + ' 本實驗是假設矩陣固定、沒有外力的離散模型。';
    el('plot-desc').textContent = model.name + '，第 ' + k + ' 步為 (' + point.map(v => fmt(v, 4)).join(', ') + ')，離原點 ' + fmt(lengths[k], 4) + '。左圖位置軌跡，右圖每一步的長度。';
  }
  bind(['mode', 'steps'], update, {mode: 'decay', steps: 4});
})();

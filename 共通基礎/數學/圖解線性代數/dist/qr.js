"use strict";
(() => {
  const {fmt, text, line, arrow, plane, matrix, bind} = LA;
  const el = id => document.getElementById(id);
  function update() {
    const t = Number(el('tilt').value), h = Number(el('height').value);
    el('tilt-value').textContent = fmt(t);
    el('height-value').textContent = fmt(h);
    const p = plane({cx: 273, cy: 245, scale: 70, extentX: 3, extentY: 2.2});
    let svg = text(273, 35, '圖只畫地板：第三個分量固定為 0', 'svg-label', 'middle') + p.axes;
    svg += '<line x1="' + p.X(0) + '" y1="' + p.Y(0) + '" x2="' + p.X(t) + '" y2="' + p.Y(0) + '" stroke="#e5ef68" stroke-width="13"/>';
    svg += arrow(p.X(0), p.Y(0), p.X(1), p.Y(0), 'ink');
    svg += arrow(p.X(t), p.Y(0), p.X(t), p.Y(h), 'coral');
    svg += arrow(p.X(0), p.Y(0), p.X(t), p.Y(h), 'blue');
    if (h > 0) {
      svg += '<path d="M' + p.X(t - (t >= 0 ? 0.16 : -0.16)) + ' ' + p.Y(0) + ' v-12 h' + (t >= 0 ? 12 : -12) + '" fill="none" stroke="#182849" stroke-width="1.5"/>';
      if (t !== 0) svg += arrow(p.X(0), p.Y(0), p.X(0), p.Y(1), 'green');
    }
    const endpointX = p.X(t), endpointY = p.Y(h);
    svg += text(endpointX, endpointY - 15, '第二支 (' + fmt(t) + ', ' + fmt(h) + ', 0)', 'svg-label', 'middle');
    svg += text(p.X(0.6), p.Y(0) + 47, '第一支：右 1', 'svg-label', 'middle');
    svg += text(548, 115, '① 水平影子', 'svg-label');
    svg += text(548, 144, '(' + fmt(t) + ', 0, 0)', 'svg-title');
    svg += text(548, 205, '② 扣掉後，還剩多少', 'svg-label');
    svg += text(548, 234, '(0, ' + fmt(h) + ', 0)', 'svg-title');
    svg += text(548, 294, h > 0 ? '③ 除以長度 ' + fmt(h) : '③ 殘差為零：先停下', 'svg-label');
    svg += text(548, 323, h > 0 ? '新的一格尺：(0, 1, 0)' : '不能用零向量定方向', 'svg-label');
    svg += text(410, 429, h > 0 ? '藍：第二支　黃：影子　橘：剩餘　綠：新的一格尺' : 'h = 0：兩欄相依；可以另補正交方向，QR 仍能存在。', 'svg-small', 'middle');
    el('drawing').innerHTML = svg;
    el('result-primary').textContent = h > 0 ? '第一把尺 (1, 0, 0)；新尺 (0, 1, 0)' : '剩下 (0, 0, 0)；無法由它找新方向';
    el('result-secondary').textContent = 'R = ' + matrix([[1, t], [0, h]]) + (h === 0 ? '（另補 q₂ 後）' : '');
    el('feedback').textContent = h > 0 ? '第二支扣掉 ' + fmt(t) + ' 份第一把尺，留下 (0, ' + fmt(h) + ', 0)。除以長度 ' + fmt(h) + ' 得到新的一格尺。留下的新方向和第一支成直角，兩支都長一格；記住份數，就能拼回原箭頭。' :
      '高度為 0，第二支沒有新增方向。不能把剩下的零箭頭除以長度 0；但仍能另補向上一格等垂直方向完成 QR，補法不唯一。';
    el('plot-desc').textContent = '第二支 (' + fmt(t) + ', ' + fmt(h) + ', 0)，水平影子 (' + fmt(t) + ', 0, 0)，垂直殘差 (0, ' + fmt(h) + ', 0)。' + (h > 0 ? 'q₂ = (0, 1, 0)。' : '殘差為零，不能單位化。');
  }
  bind(['tilt', 'height'], update, {tilt: 1, height: 2});
})();

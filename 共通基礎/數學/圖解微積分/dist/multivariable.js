(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 3) => new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: d }).format(Math.abs(v) < 1e-10 ? 0 : v);
  const xControl = $('x'), yControl = $('y'), angleControl = $('angle');
  function update() {
    const x = Number(xControl.value), y = Number(yControl.value), angle = Number(angleControl.value);
    const theta = angle * Math.PI / 180, ux = Math.cos(theta), uy = Math.sin(theta);
    const f = x * x + y * y, gx = 2 * x, gy = 2 * y, rate = gx * ux + gy * uy;
    const magnitude = Math.hypot(gx, gy);
    $('x-output').textContent = x.toFixed(1); $('y-output').textContent = y.toFixed(1); $('angle-output').textContent = `${angle}°`;
    const X = v => 70 + (v + 3.2) / 6.4 * 340, Y = v => 375 - (v + 3.2) / 6.4 * 340;
    let graph = '<defs><marker id="direction-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#255bd9"/></marker><marker id="gradient-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ef765e"/></marker></defs>';
    for (let k = -3; k <= 3; k += 1) {
      graph += `<line x1="${X(k)}" y1="35" x2="${X(k)}" y2="375" class="gridline"/><line x1="70" y1="${Y(k)}" x2="410" y2="${Y(k)}" class="gridline"/>`;
      if (k !== 0) graph += `<text x="${X(k)}" y="${Y(0) + 20}" text-anchor="middle" class="svg-small">${k}</text><text x="${X(0) - 10}" y="${Y(k) + 5}" text-anchor="end" class="svg-small">${k}</text>`;
    }
    for (const h of [1, 2, 4, 8]) {
      const r = Math.sqrt(h) * 340 / 6.4;
      graph += `<circle cx="${X(0)}" cy="${Y(0)}" r="${r}" fill="none" stroke="#9eb7e8" stroke-width="2"/><text x="${X(0) + 8}" y="${Y(Math.sqrt(h)) - 3}" class="svg-small">高 ${h}</text>`;
    }
    graph += `<path d="M70 ${Y(0)}H423M${X(0)} 386V25" class="axis" fill="none"/><text x="427" y="${Y(0) + 5}" class="svg-label">x</text><text x="${X(0) + 8}" y="26" class="svg-label">y</text>`;
    if (magnitude > 0) graph += `<line x1="${X(x)}" y1="${Y(y)}" x2="${X(x + 0.3 * gx)}" y2="${Y(y + 0.3 * gy)}" stroke="#ef765e" stroke-width="6" marker-end="url(#gradient-head)"/>`;
    graph += `<line x1="${X(x)}" y1="${Y(y)}" x2="${X(x + 0.7 * ux)}" y2="${Y(y + 0.7 * uy)}" stroke="#255bd9" stroke-width="3.5" marker-end="url(#direction-head)"/><circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="#f6d65f" stroke="#172b4d" stroke-width="2"/>`;
    graph += '<text x="72" y="408" class="svg-small">等高線：藍箭頭固定長；珊瑚箭頭 = 0.3∇f</text>';
    const SX = t => 508 + (t + 1) / 2 * 260, SY = h => 331 - h / 18 * 240;
    graph += '<text x="500" y="36" class="svg-label">沿藍箭頭切一條路</text><text x="501" y="62" class="svg-small">高度 g(t)，腳下 t = 0</text>';
    for (const h of [0, 4, 8, 12, 16]) graph += `<line x1="508" y1="${SY(h)}" x2="768" y2="${SY(h)}" class="gridline"/><text x="499" y="${SY(h) + 5}" text-anchor="end" class="svg-small">${h}</text>`;
    graph += `<path d="M508 85V331H778M${SX(0)} 85V331" class="axis" fill="none"/>`;
    for (const t of [-1, 0, 1]) graph += `<text x="${SX(t)}" y="352" text-anchor="middle" class="svg-small">${t}</text>`;
    let path = '';
    for (let i = 0; i <= 80; i += 1) {
      const t = -1 + i / 40, h = (x + t * ux) ** 2 + (y + t * uy) ** 2;
      path += `${i ? 'L' : 'M'}${SX(t)},${SY(h)}`;
    }
    graph += `<path d="${path}" class="curve" fill="none"/><path d="M${SX(-0.6)} ${SY(f - 0.6 * rate)}L${SX(0.6)} ${SY(f + 0.6 * rate)}" class="tangent" fill="none"/><circle cx="${SX(0)}" cy="${SY(f)}" r="6" fill="#f6d65f" stroke="#172b4d"/><text x="509" y="384" class="svg-label">腳下斜率：${fmt(rate)}</text><text x="508" y="408" class="svg-small">橫軸是走過的有號距離 t</text>`;
    $('plot-content').innerHTML = graph;
    $('height-value').textContent = fmt(f); $('gradient-value').textContent = `(${fmt(gx)}, ${fmt(gy)})`; $('direction-value').textContent = fmt(rate, 6);
    let why = `在 (${fmt(x, 1)}, ${fmt(y, 1)})，高度為 ${fmt(f)}，梯度為 (${fmt(gx)}, ${fmt(gy)})。朝 ${angle}° 的單位方向走，瞬間變化率為 ${fmt(rate, 6)}。`;
    if (magnitude === 0) why += '碗底的梯度為零；所有方向的一階變化率都為 0，沒有唯一最快上升方向。這不代表離開碗底仍保持同一高度。';
    else why += `${Math.abs(rate) < 1e-10 ? '這方向當下與梯度垂直，一階變化為 0' : rate > 0 ? '正值表示剛開始走會上升' : '負值表示剛開始走會下降'}；所有單位方向中的最大上升率為梯度長度 ${fmt(magnitude, 6)}。`;
    $('feedback').textContent = why; $('main-desc').textContent = why;
  }
  [xControl, yControl, angleControl].forEach(el => el.addEventListener('input', update));
  $('reset').addEventListener('click', () => { xControl.value = '1'; yControl.value = '1'; angleControl.value = '0'; update(); });
  update();
})();

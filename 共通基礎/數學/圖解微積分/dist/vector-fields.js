(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 4) => new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: d }).format(Math.abs(v) < 1e-12 ? 0 : v);
  const field = $('field'), radius = $('radius');
  function update() {
    const kind = field.value, r = Number(radius.value), source = kind === 'source', rotation = kind === 'rotation';
    const div = source ? 2 : 0, curl = rotation ? 2 : 0, area = Math.PI * r * r;
    const flux = div * area, circulation = curl * area;
    $('radius-output').textContent = r.toFixed(2);
    const X = v => 78 + (v + 2.75) / 5.5 * 330, Y = v => 370 - (v + 2.75) / 5.5 * 330;
    let graph = '<defs><marker id="field-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#172b4d"/></marker><marker id="normal-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ef765e"/></marker><marker id="travel-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#255bd9"/></marker></defs>';
    for (let k = -2; k <= 2; k += 1) {
      graph += `<line x1="${X(k)}" y1="40" x2="${X(k)}" y2="370" class="gridline"/><line x1="78" y1="${Y(k)}" x2="408" y2="${Y(k)}" class="gridline"/>`;
      if (k !== 0) graph += `<text x="${X(k)}" y="${Y(0) + 19}" text-anchor="middle" class="svg-small">${k}</text><text x="${X(0) - 9}" y="${Y(k) + 5}" text-anchor="end" class="svg-small">${k}</text>`;
    }
    graph += `<circle cx="${X(0)}" cy="${Y(0)}" r="${r * 60}" fill="#e3ecfc" fill-opacity="0.65" stroke="#255bd9" stroke-width="2.5"/><path d="M78 ${Y(0)}H421M${X(0)} 382V28" class="axis" fill="none"/><text x="426" y="${Y(0) + 5}" class="svg-label">x</text><text x="${X(0) + 8}" y="30" class="svg-label">y</text>`;
    for (let x = -2; x <= 2; x += 1) {
      for (let y = -2; y <= 2; y += 1) {
        const fx = source ? x : rotation ? -y : 1, fy = source ? y : rotation ? x : 0;
        if (fx === 0 && fy === 0) graph += `<circle cx="${X(x)}" cy="${Y(y)}" r="2.5" fill="#172b4d"/>`;
        else graph += `<line x1="${X(x)}" y1="${Y(y)}" x2="${X(x + 0.28 * fx)}" y2="${Y(y + 0.28 * fy)}" stroke="#172b4d" stroke-width="2" marker-end="url(#field-head)"/>`;
      }
    }
    for (const theta of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
      const nx = Math.cos(theta), ny = Math.sin(theta);
      graph += `<line x1="${X(r * nx)}" y1="${Y(r * ny)}" x2="${X((r + 0.35) * nx)}" y2="${Y((r + 0.35) * ny)}" stroke="#ef765e" stroke-width="2.5" marker-end="url(#normal-head)"/>`;
    }
    const begin = -Math.PI / 5, end = Math.PI / 5;
    graph += `<path d="M${X(r * Math.cos(begin))},${Y(r * Math.sin(begin))}A${r * 60},${r * 60} 0 0 0 ${X(r * Math.cos(end))},${Y(r * Math.sin(end))}" stroke="#255bd9" stroke-width="4" fill="none" marker-end="url(#travel-head)"/><text x="77" y="408" class="svg-small">黑：場　珊瑚：向外法向　藍：逆時針方向</text>`;
    const title = source ? '箭頭沿半徑向外散開' : rotation ? '箭頭繞原點逆時針旋轉' : '箭頭大小相同、都朝右';
    graph += `<text x="481" y="45" class="svg-label">${title}</text><text x="481" y="83" class="svg-label">包住的面積：${fmt(area)} </text><text x="481" y="126" class="svg-label">散度 ${div} × 面積</text><text x="481" y="163" class="svg-label">→ 通量 ${fmt(flux, 6)}</text><text x="481" y="212" class="svg-label">旋度 z 分量 ${curl} × 面積</text><text x="481" y="249" class="svg-label">→ 環流 ${fmt(circulation, 6)}</text><line x1="482" y1="293" x2="${482 + 16.8}" y2="293" stroke="#172b4d" stroke-width="2" marker-end="url(#field-head)"/><text x="514" y="298" class="svg-small">黑箭頭：1 場單位</text><text x="481" y="335" class="svg-small">同一比例縮畫，箭長沒有逐支正規化</text><text x="481" y="367" class="svg-small">方向參考箭頭長度不代表場強</text>`;
    $('plot-content').innerHTML = graph;
    $('flux-value').textContent = fmt(flux, 6); $('circulation-value').textContent = fmt(circulation, 6); $('local-value').textContent = `${div} ／ ${curl}`;
    let why = `半徑 ${fmt(r, 2)} 的圓，面積為 ${fmt(area, 6)}。`;
    if (source) why += `F = (x,y) 的散度是 2，每處都局部向外散開，向外通量為 2πr² = ${fmt(flux, 6)}；箭頭沿半徑，沒有切向分量，因此環流為 0。`;
    else if (rotation) why += `F = (−y,x) 的旋度 z 分量是 2，箭頭沿圓逆時針轉，環流為 2πr² = ${fmt(circulation, 6)}；箭頭與半徑垂直，因此向外通量為 0。`;
    else why += 'F = (1,0) 處處非零，但從左側流入與右側流出抵消，上下兩半圈的環流也抵消；散度、旋度與兩個淨總量都為 0。零淨值不等於沒有流動。';
    $('feedback').textContent = why; $('main-desc').textContent = why;
  }
  [field, radius].forEach(el => el.addEventListener('input', update));
  $('reset').addEventListener('click', () => { field.value = 'source'; radius.value = '1'; update(); });
  update();
})();

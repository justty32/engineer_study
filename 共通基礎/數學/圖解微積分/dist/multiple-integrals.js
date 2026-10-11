(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 4) => new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: d }).format(Math.abs(v) < 1e-12 ? 0 : v);
  const width = $('width'), height = $('height'), cells = $('cells');
  function update() {
    const a = Number(width.value), b = Number(height.value), n = Number(cells.value);
    const dx = a / n, dy = b / n, area = dx * dy;
    let sum = 0;
    const exact = a * b * (a + b) / 2;
    const sampleX = a - dx / 2, sampleY = b - dy / 2, lastDensity = sampleX + sampleY;
    const lastMass = lastDensity * area;
    $('width-output').textContent = a.toFixed(2); $('height-output').textContent = b.toFixed(2); $('cells-output').textContent = n;
    const X = v => 76 + v / 3 * 372, Y = v => 356 - v / 3 * 300;
    let graph = '<defs><linearGradient id="density-color"><stop offset="0%" stop-color="hsl(220,75%,96%)"/><stop offset="100%" stop-color="hsl(220,75%,48%)"/></linearGradient></defs>';
    for (let k = 0; k <= 3; k += 1) graph += `<line x1="${X(k)}" y1="56" x2="${X(k)}" y2="356" class="gridline"/><line x1="76" y1="${Y(k)}" x2="448" y2="${Y(k)}" class="gridline"/><text x="${X(k)}" y="381" text-anchor="middle" class="svg-label">${k}</text><text x="59" y="${Y(k) + 5}" text-anchor="end" class="svg-label">${k}</text>`;
    if (a > 0 && b > 0) {
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
          const mx = (i + 0.5) * dx, my = (j + 0.5) * dy, density = mx + my;
          sum += density * area;
          graph += `<rect x="${X(i * dx)}" y="${Y((j + 1) * dy)}" width="${dx * 124}" height="${dy * 100}" fill="hsl(220,75%,${96 - density * 8}%)" stroke="#536b95" stroke-width="0.9"/>`;
          graph += `<circle cx="${X(mx)}" cy="${Y(my)}" r="${n > 8 ? 1.8 : 2.8}" fill="#ed674f"/>`;
        }
      }
      graph += `<rect x="${X(a - dx)}" y="${Y(b)}" width="${dx * 124}" height="${dy * 100}" fill="none" stroke="#172b4d" stroke-width="3"/>`;
    }
    graph += `<path d="M76 42V356H465" class="axis" fill="none"/><text x="469" y="363" class="svg-label">x (m)</text><text x="59" y="31" class="svg-label">y (m)</text><text x="77" y="410" class="svg-small">紅點：中點取樣　深框：最右上格</text>`;
    graph += '<text x="525" y="46" class="svg-label">色深代表面密度 ρ</text><rect x="527" y="69" width="236" height="24" rx="4" fill="url(#density-color)"/><text x="527" y="118" class="svg-small">0</text><text x="763" y="118" text-anchor="end" class="svg-small">6 kg/m²</text>';
    graph += `<text x="526" y="162" class="svg-label">總面積：${fmt(a * b)} m²</text><text x="526" y="200" class="svg-label">切成 ${n} × ${n} = ${n * n} 格</text><text x="526" y="238" class="svg-label">小格面積：${fmt(area, 6)} m²</text><text x="526" y="280" class="svg-small">最右上格中點 (${fmt(sampleX, 3)}, ${fmt(sampleY, 3)})</text><text x="526" y="310" class="svg-small">密度 ${fmt(lastDensity, 4)} × 面積 ${fmt(area, 6)}</text><text x="526" y="345" class="svg-label">= ${fmt(lastMass, 6)} kg</text>`;
    if (a === 0 || b === 0) graph += '<text x="110" y="189" class="svg-label">寬或高為 0</text><text x="110" y="222" class="svg-label">沒有面積，也沒有質量</text>';
    $('plot-content').innerHTML = graph;
    $('mass-value').textContent = `${fmt(sum, 6)} kg`; $('cell-area-value').textContent = `${fmt(area, 6)} m²`; $('cell-mass-value').textContent = `${fmt(lastMass, 6)} kg`;
    const why = a === 0 || b === 0
      ? `寬 ${fmt(a)} m、高 ${fmt(b)} m，區域退化成線段或點，面積為 0；每格面積與總質量也都是 0。畫面沒有色塊並非計算失敗。`
      : `每邊分成 ${n} 格，共 ${n * n} 格；每小格 ${fmt(area, 6)} m²。把中點密度乘上小格面積再加總，得到 ${fmt(sum, 6)} kg，與積分公式 ab(a+b)/2 = ${fmt(exact, 6)} kg 相同。因為本例密度為線性函數，中點和已恰好精確；切細只改每格，不改總量，其他密度函數未必如此。`;
    $('feedback').textContent = why; $('main-desc').textContent = why;
  }
  [width, height, cells].forEach(el => el.addEventListener('input', update));
  $('reset').addEventListener('click', () => { width.value = '2'; height.value = '2'; cells.value = '4'; update(); });
  update();
})();

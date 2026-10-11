(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 6) => new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: d }).format(Math.abs(v) < 1e-12 ? 0 : v);
  const mode = $('mode'), terms = $('terms'), input = $('input');
  function update() {
    const geometric = mode.value === 'geometric', n = Number(terms.value), x = Number(input.value);
    $('terms-output').textContent = n;
    $('input-output').textContent = x.toFixed(1);
    $('input-label').textContent = geometric ? '每一步的倍率 r' : '代入 x';
    const sums = [];
    let term = 1, sum = 0;
    for (let k = 0; k < 12; k += 1) {
      if (k > 0) term *= geometric ? x : x / k;
      sum += term;
      sums.push(sum);
    }
    const current = sums[n - 1];
    const converges = !geometric || Math.abs(x) < 1;
    const target = converges ? (geometric ? 1 / (1 - x) : Math.exp(x)) : null;
    const displayed = [0, ...sums.slice(0, n)];
    if (target !== null) displayed.push(target);
    let low = Math.min(...displayed), high = Math.max(...displayed);
    const span = Math.max(1, high - low);
    low -= span * 0.14; high += span * 0.16;
    const X = k => 76 + k / 12.5 * 670;
    const Y = v => 345 - (v - low) / (high - low) * 286;
    let graph = '';
    for (let j = 0; j <= 4; j += 1) {
      const value = low + (high - low) * j / 4;
      graph += `<line x1="76" y1="${Y(value)}" x2="746" y2="${Y(value)}" class="gridline"/><text x="65" y="${Y(value) + 5}" text-anchor="end" class="svg-small">${fmt(value, 2)}</text>`;
    }
    graph += '<path d="M76 50V345H754" class="axis" fill="none"/>';
    for (const k of [1, 3, 6, 9, 12]) graph += `<text x="${X(k)}" y="370" text-anchor="middle" class="svg-label">${k}</text>`;
    graph += '<text x="79" y="29" class="svg-label">部分和的高度</text><text x="594" y="400" class="svg-label">已加項數 n →</text>';
    if (target !== null) graph += `<line x1="76" y1="${Y(target)}" x2="746" y2="${Y(target)}" stroke="#ef765e" stroke-width="2.5" stroke-dasharray="8 6"/><text x="752" y="${Y(target) + 5}" class="svg-small">目標</text>`;
    let path = '';
    for (let i = 0; i < n; i += 1) path += `${i ? ' L' : 'M'}${X(i + 1)},${Y(sums[i])}`;
    graph += `<path d="${path}" class="curve" fill="none"/>`;
    for (let i = 0; i < n; i += 1) graph += `<circle cx="${X(i + 1)}" cy="${Y(sums[i])}" r="${i === n - 1 ? 8 : 4}" fill="${i === n - 1 ? '#f6d65f' : '#255bd9'}" stroke="#172b4d" stroke-width="1.5"/>`;
    graph += `<text x="${Math.min(X(n) + 12, 635)}" y="${Math.max(50, Y(current) - 16)}" class="svg-label">S${n} = ${fmt(current, 4)}</text>`;
    $('plot-content').innerHTML = graph;
    $('sum-value').textContent = fmt(current);
    $('target-value').textContent = target === null ? '沒有有限的無限和' : fmt(target);
    $('error-value').textContent = target === null ? '無收斂目標可比較' : fmt(Math.abs(target - current), 9);
    let why;
    if (!geometric) why = `前 ${n} 項組成最高 ${n - 1} 次多項式，在 x = ${fmt(x, 1)} 得到 ${fmt(current)}。eˣ = ${fmt(target)}；絕對誤差是 ${fmt(Math.abs(target - current), 9)}。這個函數的泰勒級數對所有實數 x 都收斂到 eˣ；有限項仍須看誤差。`;
    else if (Math.abs(x) < 1) why = `|r| = ${fmt(Math.abs(x), 1)} < 1，因此部分和會靠近 ${fmt(target)}。目前 ${n} 項為 ${fmt(current)}${x < 0 ? '；負倍率讓加數正負交替，總和在目標兩側靠近' : '；每次補上的量逐漸縮小'}。有限項數的圖只是觀察，收斂依據是 |r| < 1。`;
    else if (x === 1) why = `r = 1，每項都是 1，前 ${n} 項的和就是 ${n}。每個有限和都能算，但 n 越大總和越大，沒有有限的無限和。`;
    else if (x === -1) why = `r = −1，部分和在 1、0、1、0 之間跳動。前 ${n} 項為 ${fmt(current)}；加再多項也不會靠近單一數值，因此不收斂。`;
    else why = `|r| = ${fmt(Math.abs(x), 1)} > 1，加數沒有趨近 0，因此幾何級數不收斂。前 ${n} 項仍可算得 ${fmt(current)}，但這個有限數字不是無限和。`;
    $('feedback').textContent = why;
    $('main-desc').textContent = why;
  }
  [mode, terms, input].forEach(el => el.addEventListener('input', update));
  $('reset').addEventListener('click', () => { mode.value = 'taylor'; terms.value = '5'; input.value = '1'; update(); });
  update();
})();

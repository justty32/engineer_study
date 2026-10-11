"use strict";
(() => {
  const {fmt, text, line, arrow, vec, matrix, bind} = LA;
  const el = id => document.getElementById(id);
  function update() {
    const l1 = Number(el('lambda1').value), l2 = Number(el('lambda2').value);
    const k = Number(el('power').value);
    const d1 = k === 0 ? 1 : l1 ** k, d2 = k === 0 ? 1 : l2 ** k;
    const result = [d1 + d2, d2], A = [[l1, l2 - l1], [0, l2]];
    ['lambda1', 'lambda2', 'power'].forEach(id => el(id + '-value').textContent = fmt(Number(el(id).value)));
    const vectors = [[2, 1], [1, 1], [d1, d2], result];
    const titles = ['① 原座標', '② 特徵座標', '③ 各自倍乘', '④ 換回原座標'];
    const labels = ['v', 'P⁻¹v', 'DᵏP⁻¹v', 'Aᵏv'];
    const extent = Math.max(2, Math.ceil(Math.max(...vectors.flat().map(Math.abs))));
    const scale = 73 / extent;
    let svg = text(410, 30, '每格同一比例；座標數字屬於各格標示的基底', 'svg-small', 'middle');
    vectors.forEach((v, i) => {
      const cx = 106 + 202 * i, cy = 233;
      svg += text(cx, 76, titles[i], 'svg-label', 'middle');
      svg += text(cx, 106, labels[i], 'svg-title', 'middle');
      svg += line(cx - 80, cy, cx + 80, cy) + line(cx, cy - 80, cx, cy + 80);
      svg += line(cx + 73, cy - 4, cx + 73, cy + 4) + line(cx - 4, cy - 73, cx + 4, cy - 73);
      svg += text(cx + 73, cy + 23, fmt(extent), 'svg-small', 'middle');
      svg += text(cx - 9, cy - 68, fmt(extent), 'svg-small', 'end');
      svg += text(cx - 8, cy + 20, '0', 'svg-small', 'end');
      svg += arrow(cx, cy, cx + v[0] * scale, cy - v[1] * scale, i < 2 ? 'blue' : 'coral');
      svg += text(cx, 357, vec(v), 'svg-title', 'middle');
      if (i < 3) svg += text(cx + 101, 155, '→', 'svg-title', 'middle');
    });
    svg += text(410, 407, 'P 的兩欄：p₁ = (1, 0)，p₂ = (1, 1)', 'svg-label', 'middle');
    el('drawing').innerHTML = svg;
    el('result-primary').textContent = vec(result);
    el('result-secondary').textContent = 'A = ' + matrix(A) + '；倍乘後份數 ' + vec([d1, d2]);
    let why = k === 0 ? 'k = 0：還沒有做任何變換，A⁰ = I，因此保留原向量 (2, 1)，即使倍率為 0 也一樣。' :
      '兩個特徵方向各自乘 ' + fmt(l1) + ' 與 ' + fmt(l2) + '，做 ' + k + ' 次後的份數是 ' + vec([d1, d2]) + '。換回時，第一分量把兩份數相加，第二分量保留第二份數。';
    if (l1 === l2) why += ' 兩個特徵值相等，但 P 的兩欄仍獨立；此時 A = ' + fmt(l1) + 'I，仍可對角化。';
    else if ((l1 < 0 || l2 < 0) && k > 0) why += ' 負倍率每做一次翻向；偶數次會翻回原來的方向。';
    el('feedback').textContent = why;
    el('plot-desc').textContent = '原向量 (2, 1)，特徵座標 (1, 1)，倍乘後 ' + vec([d1, d2]) + '，最後輸出 ' + vec(result) + '。四格座標單位的畫面比例相同。';
  }
  bind(['lambda1', 'lambda2', 'power'], update, {lambda1: 2, lambda2: 0.5, power: 2});
})();

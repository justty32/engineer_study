"use strict";
(() => {
  const {fmt, text, arrow, plane, mat, mul, vec, bind} = LA;
  const el = id => document.getElementById(id);
  const rotation = degrees => {
    const a = degrees * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [[c, -s], [s, c]];
  };
  const stageNames = {input: '① 原始輸入', right: '② Vᵀ：轉輸入座標', stretch: '③ Σ：分別拉伸', output: '④ U：轉到輸出方向'};
  function update() {
    const phi = Number(el('phi').value), s = Number(el('sigma2').value), theta = Number(el('theta').value), stage = el('stage').value;
    el('phi-value').textContent = fmt(phi) + '°';
    el('sigma2-value').textContent = fmt(s);
    el('theta-value').textContent = fmt(theta) + '°';
    el('stage-value').textContent = stageNames[stage];
    const right = rotation(-phi), stretch = mul([[2, 0], [0, s]], right), A = mul(rotation(theta), stretch);
    const matrices = {input: [[1, 0], [0, 1]], right, stretch, output: A};
    const M = matrices[stage], v = [1, 1], current = mat(M, v), out = mat(A, v);
    const p = plane({cx: 209, cy: 236, scale: 48, extent: 3});
    const q = plane({cx: 613, cy: 236, scale: 48, extent: 3});
    let svg = text(209, 36, '原始輸入', 'svg-title', 'middle') + text(613, 36, stageNames[stage], 'svg-label', 'middle');
    svg += p.axes + q.axes;
    svg += '<circle cx="' + p.X(0) + '" cy="' + p.Y(0) + '" r="48" fill="#e5ebff" fill-opacity=".45" stroke="#345ce8" stroke-width="2.5"/>';
    let path = '';
    for (let i = 0; i <= 128; i++) {
      const a = i / 128 * Math.PI * 2, w = mat(M, [Math.cos(a), Math.sin(a)]);
      path += (i === 0 ? 'M' : 'L') + q.X(w[0]) + ' ' + q.Y(w[1]) + ' ';
    }
    svg += '<path d="' + path + 'Z" fill="#f6c9be" fill-opacity=".4" stroke="#d96650" stroke-width="2.5"/>';
    svg += arrow(p.X(0), p.Y(0), p.X(1), p.Y(1), 'blue');
    svg += arrow(q.X(0), q.Y(0), q.X(current[0]), q.Y(current[1]), 'coral');
    svg += text(410, 236, '→', 'svg-title', 'middle');
    svg += text(209, 416, 'v = (1, 1)', 'svg-label', 'middle');
    svg += text(613, 416, vec(current), 'svg-label', 'middle');
    el('drawing').innerHTML = svg;
    el('result-primary').textContent = stageNames[stage] + '：' + vec(current);
    el('result-secondary').textContent = 'Av = ' + vec(out) + '；σ = (2, ' + fmt(s) + ')；秩 ' + (s === 0 ? '1' : '2');
    const actions = {
      input: '目前停在輸入端，還沒變換。接著先做 Vᵀ，方向角是 −φ = ' + fmt(-phi) + '°。',
      right: '先做 Vᵀ，旋轉 −φ = ' + fmt(-phi) + '°。圓還是圓，但指定箭頭的方向已隨角度改變。',
      stretch: '接著由 Σ 把水平分量乘 2、垂直分量乘 ' + fmt(s) + '。這一步才改變圓的形狀。',
      output: '最後由 U 旋轉 θ = ' + fmt(theta) + '°。旋轉保留長度與形狀，只改變輸出朝向。'
    };
    el('feedback').textContent = actions[stage] + (s === 0 ? ' σ₂ = 0：整個第二奇異方向消失，最終圖形塌成線段；此矩陣不可逆。' : s === 2 ? ' 兩個奇異值都是 2，最後仍是圓，半徑變為 2。' : ' 奇異值 2 與 ' + fmt(s) + ' 是最終橢圓的半軸長；兩軸的畫面比例相同。');
    el('plot-desc').textContent = stageNames[stage] + '得到向量 ' + vec(current) + '；最終輸出 ' + vec(out) + '。最終奇異值是 2 與 ' + fmt(s) + '。';
  }
  bind(['phi', 'sigma2', 'theta', 'stage'], update, {phi: 30, sigma2: 1, theta: -30, stage: 'output'});
})();

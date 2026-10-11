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
    const titles = ['① 原本的位置', '② 讀成各幾份', '③ 算新的份數', '④ 拼回新位置'];
    const labels = ['左右／上下', '水平份／斜向份', '水平份／斜向份', '左右／上下'];
    const extent = Math.max(2, Math.ceil(Math.max(...vectors.flat().map(Math.abs))));
    const scale = 73 / extent;
    let svg = text(410, 30, '中間只記份數；最左、最右才畫實際位置，兩圖同一比例', 'svg-small', 'middle');
    vectors.forEach((v, i) => {
      const cx = 106 + 202 * i, cy = 233;
      svg += text(cx, 76, titles[i], 'svg-label', 'middle');
      svg += text(cx, 106, labels[i], 'svg-title', 'middle');
      if(i===1||i===2){
        const directionNames=['水平','斜向'];
        v.forEach((count,row)=>{
          const y=143+row*95;
          svg+='<rect x="'+(cx-82)+'" y="'+y+'" width="164" height="78" rx="10" fill="'+(row===0?'#e5ebff':'#fbe1d8')+'"/>';
          svg+=text(cx,y+27,directionNames[row], 'svg-label','middle');
          svg+=text(cx,y+57,fmt(count)+' 份'+(count<0?'（反向）':''), 'svg-title','middle');
        });
        svg+=text(cx,357,'這裡記配方份數','svg-small','middle');
      }else{
      svg += line(cx - 80, cy, cx + 80, cy) + line(cx, cy - 80, cx, cy + 80);
      svg += line(cx + 73, cy - 4, cx + 73, cy + 4) + line(cx - 4, cy - 73, cx + 4, cy - 73);
      svg += text(cx + 73, cy + 23, fmt(extent), 'svg-small', 'middle');
      svg += text(cx - 9, cy - 68, fmt(extent), 'svg-small', 'end');
      svg += text(cx - 8, cy + 20, '0', 'svg-small', 'end');
      svg += arrow(cx, cy, cx + v[0] * scale, cy - v[1] * scale, i < 2 ? 'blue' : 'coral');
      svg += text(cx, 357, vec(v), 'svg-title', 'middle');
      }
      if (i < 3) svg += text(cx + 101, 155, '→', 'svg-title', 'middle');
    });
    svg += text(410, 407, '兩個方向：水平一步 (1, 0)，右上斜一步 (1, 1)', 'svg-label', 'middle');
    el('drawing').innerHTML = svg;
    el('result-primary').textContent = vec(result);
    el('result-secondary').textContent = 'A = ' + matrix(A) + '；倍乘後份數 ' + vec([d1, d2]);
    let why = k === 0 ? 'k = 0：還沒有做任何變換，A⁰ = I，因此保留原向量 (2, 1)，即使倍率為 0 也一樣。' :
      '兩個特徵方向各自乘 ' + fmt(l1) + ' 與 ' + fmt(l2) + '，做 ' + k + ' 次後的份數是 ' + vec([d1, d2]) + '。換回時，第一分量把兩份數相加，第二分量保留第二份數。';
    if (l1 === l2) why += ' 兩個特徵值相等，但 P 的兩欄仍獨立；此時 A = ' + fmt(l1) + 'I，仍可對角化。';
    else if ((l1 < 0 || l2 < 0) && k > 0) why += ' 負倍率每做一次翻向；偶數次會翻回原來的方向。';
    el('feedback').textContent = why;
    el('plot-desc').textContent = '原向量 (2, 1)，特徵座標 (1, 1)，倍乘後 ' + vec([d1, d2]) + '，最後輸出 ' + vec(result) + '。中間兩格用份數卡表示配方，最左與最右的實際位置圖比例相同。';
  }
  bind(['lambda1', 'lambda2', 'power'], update, {lambda1: 2, lambda2: 0.5, power: 2});
})();

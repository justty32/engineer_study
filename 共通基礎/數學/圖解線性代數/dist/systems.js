"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const epsilon = 1e-9;
  function matrix(x, y, rows) {
    let html = '<path d="M' + (x + 8) + ' ' + y + 'h-8v64h8M' + (x + 203) + ' ' + y + 'h8v64h-8" class="axis"/>';
    html += LA.line(x + 125, y + 3, x + 125, y + 61);
    rows.forEach((row, i) => row.forEach((n, j) => {
      html += LA.text(x + [34, 85, 166][j], y + 24 + i * 29, LA.fmt(n), "svg-label", "middle");
    }));
    return html;
  }
  function equation(k, b) {
    const term = Math.abs(k) < epsilon ? "" : (k < 0 ? " − " : " + ") + (Math.abs(k) === 1 ? "" : LA.fmt(Math.abs(k))) + "y";
    return "x" + term + " = " + LA.fmt(b);
  }
  function update() {
    const k = Number($("k").value), b = Number($("rhs").value), step = Number($("step").value);
    const coefficient = k - 1, right = b - 3;
    const unique = Math.abs(coefficient) >= epsilon;
    const coincident = !unique && Math.abs(right) < epsilon;
    const y = unique ? right / coefficient : null;
    const x = unique ? 3 - y : null;
    const visible = unique && Math.abs(x) <= 5 + epsilon && Math.abs(y) <= 5 + epsilon;
    $("k-value").textContent = LA.fmt(k);
    $("rhs-value").textContent = LA.fmt(b);
    $("step-value").textContent = ["0 · 原始條件", "1 · 消去 x", "2 · 判斷並回代"][step];
    const answer = unique ? "唯一解 " + LA.vec([x, y]) : coincident ? "無限多解 (3 − t, t)" : "無解";
    const key = unique ? LA.fmt(coefficient) + "y = " + LA.fmt(right) : "0 = " + LA.fmt(right);
    $("result-primary").textContent = answer;
    $("result-secondary").textContent = key;
    let explanation;
    if (unique) explanation = "兩線方向不同。相減後 " + key + "，可除以 " + LA.fmt(coefficient) + " 得 y = " + LA.fmt(y) + "；回代 x = 3 − y = " + LA.fmt(x) + "。" + (visible ? "黃色點同時滿足兩條原方程。" : "交點超出 −5 到 5 的圖窗，圖中不另造交點；完整答案保留在上方。");
    else if (coincident) explanation = "兩條線重疊，第二式沒有新限制。消去得到 0 = 0，所以 y 可以是任意實數 t，x = 3 − t。不能除以 k − 1 = 0；這裡有無限多解。";
    else explanation = "兩條線平行且不同。消去竟要求 " + key + "，這是不可能成立的條件，所以無解；不能除以 k − 1 = 0。";
    $("feedback").textContent = explanation;
    const q = LA.plane({ cx: 225, cy: 232, scale: 32, extent: 5, tickStep: 2, showOrigin: false });
    let html = '<defs><clipPath id="system-clip"><rect x="65" y="72" width="320" height="320"/></clipPath></defs>';
    html += LA.text(22, 28, "藍：x + y = 3", "svg-label") + LA.text(22, 51, "珊瑚：" + equation(k, b), "svg-label");
    html += q.axes;
    html += '<g clip-path="url(#system-clip)">';
    html += '<line x1="' + q.X(8) + '" y1="' + q.Y(-5) + '" x2="' + q.X(-2) + '" y2="' + q.Y(5) + '" stroke="#345ce8" stroke-width="' + (coincident ? 6 : 3.5) + '"/>';
    html += '<line x1="' + q.X(b + 5 * k) + '" y1="' + q.Y(-5) + '" x2="' + q.X(b - 5 * k) + '" y2="' + q.Y(5) + '" stroke="#d96650" stroke-width="3"' + (coincident ? ' stroke-dasharray="10 8"' : '') + '/></g>';
    if (visible) html += LA.dot(q.X(x), q.Y(y), "marker", 6);
    html += LA.text(225, 421, unique ? (visible ? "交點 " : "圖窗外的交點 ") + LA.vec([x, y]) : coincident ? "重疊：每一點都是共同答案" : "平行且不同：沒有共同答案", "svg-label", "middle");
    html += LA.line(426, 20, 426, 422);
    html += LA.text(457, 30, "把兩張條件卡一起算", "svg-title");
    html += LA.text(466, 72, "① 原來的兩條條件", "svg-label");
    html += LA.text(486, 112, "x + y = 3", "svg-title");
    html += LA.text(486, 151, equation(k, b), "svg-title");
    if (step >= 1) {
      html += LA.text(466, 203, "② 第二條減第一條", "svg-label");
      html += LA.text(466, 237, "相同的 x 抵消；第一條保留。", "svg-label");
      html += LA.text(486, 274, key, "svg-title");
    } else {
      html += LA.text(466, 217, "下一步：第二條減第一條", "svg-label");
      html += LA.text(466, 251, "左右兩邊，都要一起減。", "svg-label");
      html += LA.text(466, 302, "把消去階段移到 1，看看。", "svg-label");
    }
    if (step === 2) {
      if (unique) {
        html += LA.text(466, 321, "③ 兩邊同除 " + LA.fmt(coefficient) + "，得 y = " + LA.fmt(y), "svg-label");
        html += LA.text(466, 358, "代回保留的 x + y = 3", "svg-label");
        html += LA.text(466, 400, "x = 3 − (" + LA.fmt(y) + ") = " + LA.fmt(x), "svg-title");
      } else {
        html += LA.text(466, 325, "③ 此時不能除以 0", "svg-label");
        html += LA.text(466, 365, coincident ? "0 = 0：第二條沒有新限制。" : "0 不等於 " + LA.fmt(right) + "：條件互相矛盾。", "svg-label");
        html += LA.text(466, 405, coincident ? "只要兩數相加是 3 就行。" : "沒有任何一對數做得到。", "svg-label");
      }
    }
    $("drawing").innerHTML = html;
  }
  LA.bind(["k", "rhs", "step"], update, { k: -1, rhs: 1, step: 0 });
})();

"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const machines = {
    shear: { name: "剪切 S", A: [[1, 1], [0, 1]] },
    rotate: { name: "旋轉 R", A: [[0, -1], [1, 0]] },
    scale: { name: "拉伸 D", A: [[2, 0], [0, 1]] }
  };
  function update() {
    const first = machines[$("first").value];
    const second = machines[$("second").value];
    const forward = $("order").value === "BA";
    const start = [1, 1];
    const early = forward ? first : second;
    const late = forward ? second : first;
    const middle = LA.mat(early.A, start);
    const end = LA.mat(late.A, middle);
    const combined = LA.mul(late.A, early.A);
    const reversed = LA.mul(early.A, late.A);
    const sameMatrix = combined.every((row, i) => row.every((n, j) => n === reversed[i][j]));
    $("first-value").textContent = first.name;
    $("second-value").textContent = second.name;
    $("order-value").textContent = forward ? "先 A，後 B" : "先 B，後 A";
    $("result-primary").textContent = LA.vec(end);
    $("result-secondary").textContent = (forward ? "BA = " : "AB = ") + LA.matrix(combined);
    $("feedback").textContent = "輸入 " + LA.vec(start) + " → 先做" + early.name + "得到 " + LA.vec(middle) + " → 再做" + late.name + "得到 " + LA.vec(end) + "。" + (sameMatrix ? "這一組操作可交換；比較兩個合成矩陣，結果相同。" : "這一組操作不能交換；把執行順序反過來，兩個合成矩陣不同。") + "連乘式中，最靠右、緊鄰向量的矩陣先做。";
    const panels = [
      { cx: 140, v: start, title: "起點 v", color: "blue", note: "輸入 " + LA.vec(start) },
      { cx: 410, v: middle, title: "先做 " + (forward ? "A" : "B"), color: "ink", note: early.name + " → " + LA.vec(middle) },
      { cx: 680, v: end, title: "再做 " + (forward ? "B" : "A"), color: "coral", note: late.name + " → " + LA.vec(end) }
    ];
    let html = LA.text(410, 31, "右邊的矩陣先做：" + (forward ? "B(Av)" : "A(Bv)"), "svg-title", "middle");
    panels.forEach(p => {
      const q = LA.plane({ cx: p.cx, cy: 235, scale: 25, extent: 4 });
      html += LA.text(p.cx, 84, p.title, "svg-label", "middle") + q.axes;
      html += LA.arrow(q.X(0), q.Y(0), q.X(p.v[0]), q.Y(p.v[1]), p.color);
      html += LA.text(p.cx, 378, p.note, "svg-label", "middle");
    });
    html += LA.arrow(253, 97, 286, 97, "ink") + LA.arrow(523, 97, 556, 97, "ink");
    html += LA.text(410, 418, "三張圖使用相同比例；箭頭長度與方向可直接比較。", "svg-small", "middle");
    $("drawing").innerHTML = html;
  }
  LA.bind(["first", "second", "order"], update, { first: "shear", second: "rotate", order: "BA" });
})();

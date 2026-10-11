"use strict";
(() => {
  const $ = id => document.getElementById(id);
  function update() {
    const a = Number($("a").value), b = Number($("b").value), c = Number($("c").value), d = Number($("d").value);
    const A = [[a, b], [c, d]], det = a * d - b * c;
    const area = Math.abs(det), singular = area < 1e-9;
    const v = [1, 1], out = LA.mat(A, v);
    ["a", "b", "c", "d"].forEach(id => { $(id + "-value").textContent = LA.fmt(Number($(id).value)); });
    $("result-primary").textContent = "det = " + LA.fmt(det) + "；面積 × " + LA.fmt(area);
    $("result-secondary").textContent = "Av = " + LA.vec(out);
    let inverseText;
    if (singular) {
      inverseText = "det(A) = 0：反矩陣不存在，不能唯一倒帶。";
      $("feedback").textContent = "ad − bc = " + LA.fmt(a * d) + " − (" + LA.fmt(b * c) + ") = 0。單位正方形被壓成線或點，面積為零。不同輸入會重疊到同一輸出，因此無法只靠 " + LA.vec(out) + " 唯一找回 (1, 1)。此時不能使用含 1/det(A) 的反矩陣公式。";
    } else {
      const inverse = [[d / det, -b / det], [-c / det, a / det]];
      const recovered = LA.mat(inverse, out);
      inverseText = "A⁻¹ = " + LA.matrix(inverse) + "；A⁻¹" + LA.vec(out) + " = " + LA.vec(recovered);
      $("feedback").textContent = "ad − bc = " + LA.fmt(a * d) + " − (" + LA.fmt(b * c) + ") = " + LA.fmt(det) + "。面積倍率是絕對值 " + LA.fmt(area) + "；" + (det > 0 ? "正號表示保留定向。" : "負號表示翻轉定向，面積仍是正的。") + "因為行列式不為零，反矩陣存在，可把輸出 " + LA.vec(out) + " 唯一送回 " + LA.vec(recovered) + "。";
    }
    $("inverse-value").textContent = inverseText;
    const left = LA.plane({ cx: 205, cy: 235, scale: 35, extent: 4 });
    const right = LA.plane({ cx: 615, cy: 235, scale: 35, extent: 4 });
    const polygon = (p, vertices) => '<polygon points="' + vertices.map(vt => p.X(vt[0]) + ',' + p.Y(vt[1])).join(' ') + '" fill="#e5ef6870" stroke="#9ba532" stroke-width="2"/>';
    let html = LA.text(205, 35, "原本：面積 1", "svg-title", "middle") + LA.text(615, 35, "後來：面積 " + LA.fmt(area), "svg-title", "middle");
    html += LA.text(410, 69, "A = " + LA.matrix(A), "svg-label", "middle");
    html += left.axes + right.axes;
    html += polygon(left, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    html += polygon(right, [[0, 0], [a, c], out, [b, d]]);
    html += LA.line(left.X(0), left.Y(0), left.X(1), left.Y(1), "tangent");
    html += LA.line(right.X(0), right.Y(0), right.X(out[0]), right.Y(out[1]), "tangent");
    html += LA.arrow(left.X(0), left.Y(0), left.X(1), left.Y(0), "blue");
    html += LA.arrow(left.X(0), left.Y(0), left.X(0), left.Y(1), "coral");
    html += LA.arrow(right.X(0), right.Y(0), right.X(a), right.Y(c), "blue");
    html += LA.arrow(right.X(0), right.Y(0), right.X(b), right.Y(d), "coral");
    html += LA.dot(left.X(1), left.Y(1), "marker", 5) + LA.dot(right.X(out[0]), right.Y(out[1]), "marker", 5);
    html += LA.arrow(392, 235, 428, 235, "ink");
    html += LA.text(205, 407, "黃點：輸入 v = (1, 1)", "svg-label", "middle");
    html += LA.text(615, 407, "黃點：Av = " + LA.vec(out), "svg-label", "middle");
    html += LA.text(410, 432, singular ? "面積為零：失去方向，不能唯一倒帶。" : det > 0 ? "正行列式：保留定向；非零面積：可以倒帶。" : "負行列式：翻轉定向；非零面積：可以倒帶。", "svg-small", "middle");
    $("drawing").innerHTML = html;
  }
  LA.bind(["a", "b", "c", "d"], update, { a: 2, b: 1, c: 0, d: 1 });
})();

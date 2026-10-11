"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const modes = {
    full: { A: [[1, 1], [0, 1]], rank: 2, name: "完整", nullText: "零空間只有 {0}", reach: "可到達整個平面" },
    flat: { A: [[1, 1], [0, 0]], rank: 1, name: "壓扁", nullText: "零空間 = {(t, −t)}", reach: "只能到達水平線" },
    zero: { A: [[0, 0], [0, 0]], rank: 0, name: "歸零", nullText: "零空間是整個輸入平面", reach: "只能到達原點" }
  };
  function update() {
    const mode = $("mode").value, model = modes[mode];
    const v = [Number($("x").value), Number($("y").value)];
    const out = LA.mat(model.A, v), nullity = 2 - model.rank;
    $("mode-value").textContent = model.name;
    $("x-value").textContent = LA.fmt(v[0]);
    $("y-value").textContent = LA.fmt(v[1]);
    $("result-primary").textContent = "A" + LA.vec(v) + " = " + LA.vec(out);
    $("result-secondary").textContent = model.rank + " + " + nullity + " = 2";
    const vanished = Math.hypot(...out) < 1e-9;
    $("feedback").textContent = "A = " + LA.matrix(model.A) + "。" + model.reach + "，所以秩是 " + model.rank + "。" + model.nullText + "，零化度是 " + nullity + "。目前輸入 " + LA.vec(v) + (vanished ? " 在零空間內，輸出為零。" : " 不在零空間內，輸出不為零。") + "秩數的是可達方向，零化度數的是消失方向；相加等於輸入維度 2。";
    const input = LA.plane({ cx: 205, cy: 235, scale: 24, extentX: 7, extentY: 6 });
    const output = LA.plane({ cx: 615, cy: 235, scale: 24, extentX: 7, extentY: 6 });
    let html = LA.text(410, 31, "A = " + LA.matrix(model.A), "svg-title", "middle");
    html += LA.text(205, 64, "輸入平面", "svg-label", "middle") + LA.text(615, 64, "可到達的輸出", "svg-label", "middle");
    if (mode === "zero") html += '<rect x="37" y="91" width="336" height="288" fill="#e5ef6860"/>';
    if (mode === "full") html += '<rect x="447" y="91" width="336" height="288" fill="#345ce821"/>';
    html += input.axes + output.axes;
    if (mode === "flat") {
      html += '<line x1="' + input.X(-6) + '" y1="' + input.Y(6) + '" x2="' + input.X(6) + '" y2="' + input.Y(-6) + '" stroke="#a5b116" stroke-width="7" opacity=".65"/>';
      html += '<line x1="447" y1="235" x2="783" y2="235" stroke="#d96650" stroke-width="7" opacity=".38"/>';
    } else if (mode === "full") html += LA.dot(input.X(0), input.Y(0), "marker", 8);
    if (mode === "zero") html += LA.dot(output.X(0), output.Y(0), "marker", 10);
    html += LA.arrow(input.X(0), input.Y(0), input.X(v[0]), input.Y(v[1]), "blue");
    html += LA.arrow(output.X(0), output.Y(0), output.X(out[0]), output.Y(out[1]), "coral");
    html += LA.arrow(389, 215, 421, 215, "ink");
    html += LA.text(205, 405, "輸入 " + LA.vec(v), "svg-label", "middle");
    html += LA.text(615, 405, "輸出 " + LA.vec(out), "svg-label", "middle");
    html += LA.text(205, 429, model.nullText, "svg-small", "middle");
    html += LA.text(615, 429, model.reach + "（秩 " + model.rank + "）", "svg-small", "middle");
    $("drawing").innerHTML = html;
  }
  LA.bind(["mode", "x", "y"], update, { mode: "flat", x: 1, y: 1 });
})();

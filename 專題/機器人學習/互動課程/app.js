"use strict";

const $ = id => document.getElementById(id);
const on = (id, event, handler) => {
  const node = $(id);
  if (node) node.addEventListener(event, handler);
};
const num = id => {
  const raw = $(id)?.value;
  if (raw === undefined || raw.trim() === "") return NaN;
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
};
const fmt = (value, digits = 3) => Number(value).toFixed(digits);

function rangeValues() {
  document.querySelectorAll('input[type="range"]').forEach(input => {
    const output = document.createElement("output");
    output.className = "range-value";
    output.htmlFor = input.id;
    input.insertAdjacentElement("afterend", output);
    const draw = () => {
      const unit = input.dataset.unit ? ` ${input.dataset.unit}` : "";
      output.value = `${input.value}${unit}`;
      input.setAttribute("aria-valuetext", output.value);
    };
    input.addEventListener("input", draw);
    draw();
  });
}

function policyStep() {
  if (!$("policy-x")) return;
  const draw = () => {
    const x = num("policy-x");
    const theta = num("policy-theta");
    const limit = num("policy-limit");
    const proposal = theta * x;
    const command = Math.max(-limit, Math.min(limit, proposal));
    const next = Math.max(0, x - command * 0.25);
    $("policy-output").innerHTML = `<strong>策略提議 ${fmt(proposal, 3)} m/s，安全層送出 ${fmt(command, 3)} m/s。</strong><br>以 0.25 s 常速近似，新距離為 ${fmt(next, 3)} m。log 應同時保存提議與裁切後命令。`;
  };
  ["policy-x", "policy-theta", "policy-limit"].forEach(id => on(id, "input", draw));
  draw();
}

function gradientStep() {
  if (!$("gd-theta")) return;
  let theta = num("gd-theta");
  const draw = () => {
    const gradient = 2 * (theta - 3);
    const loss = (theta - 3) ** 2;
    $("gd-output").innerHTML = `<strong>目前 θ=${fmt(theta, 4)}，L=${fmt(loss, 4)}，梯度=${fmt(gradient, 4)}。</strong><br>按「更新一步」會套用 θ ← θ − η·2(θ−3)。η=0.5 會一步到 θ=3；η&gt;1 才會在這個二次函數上振盪發散。`;
  };
  on("gd-theta", "input", () => {
    theta = num("gd-theta");
    draw();
  });
  on("gd-rate", "input", draw);
  on("gd-step", "click", () => {
    theta -= num("gd-rate") * 2 * (theta - 3);
    draw();
  });
  on("gd-reset", "click", () => {
    theta = num("gd-theta");
    draw();
  });
  draw();
}

function split() {
  if (!$("split-scenes")) return;
  const draw = () => {
    const scenes = num("split-scenes");
    const random = $("split-mode").value === "random";
    let msg;
    if (random) msg = "高洩漏風險：隨機切單幀會讓相鄰 frame 跨越訓練與測試。";
    else if (scenes < 5) msg = "已按回合／場景切分，但獨立測試單位過少。";
    else msg = "較能測量跨場景泛化，但仍要檢查操作者、物件與環境是否重複。";
    const testScenes = Math.max(1, Math.round(scenes * 0.2));
    $("split-output").innerHTML = `<strong>${msg}</strong><br>共有 ${scenes} 個獨立場景，若保留約 20%，測試集約有 ${testScenes} 個獨立場景。機器人資料應優先按 episode、場景或時間區段切分。`;
  };
  ["split-scenes", "split-mode"].forEach(id => on(id, "input", draw));
  draw();
}

function bc() {
  if (!$("bc-error")) return;
  const draw = () => {
    const error = num("bc-error");
    const horizon = num("bc-horizon");
    const probability = 1 - Math.pow(1 - error, horizon);
    $("bc-output").innerHTML = `<strong>e=${fmt(error, 3)}、T=${horizon} 時，至少一次錯誤的示意機率為 ${fmt(100 * probability, 1)}%。</strong><br>1−(1−e)<sup>T</sup>只建立誤差累積直覺；真實錯誤會改變後續觀測分布，常比獨立模型更糟。`;
  };
  ["bc-error", "bc-horizon"].forEach(id => on(id, "input", draw));
  draw();
}

function returns() {
  if (!$("ret-gamma")) return;
  const draw = () => {
    const gamma = num("ret-gamma");
    const normalized = $("ret-seq").value.replaceAll("−", "-").replaceAll("，", ",");
    const parts = normalized.split(",").map(value => value.trim());
    const bad = parts.findIndex(value => value === "" || !Number.isFinite(Number(value)));
    if (bad !== -1) {
      $("ret-output").innerHTML = `<strong>第 ${bad + 1} 項無法解析。</strong><br>請以逗號分隔每筆獎勵；可使用半形或全形逗號、半形負號或數學減號。`;
      return;
    }
    const rewards = parts.map(Number);
    let total = 0;
    let discount = 1;
    rewards.forEach(reward => {
      total += discount * reward;
      discount *= gamma;
    });
    $("ret-output").innerHTML = `<strong>折扣回報 G=${fmt(total, 3)}。</strong><br>實際使用序列：[${rewards.join(", ")}]；γ=${fmt(gamma, 2)}。較小 γ 更重視近期獎勵。`;
  };
  ["ret-gamma", "ret-seq"].forEach(id => on(id, "input", draw));
  draw();
}

function explore() {
  if (!$("exp-rate")) return;
  const draw = () => {
    const rate = num("exp-rate");
    const unsafe = num("exp-unsafe");
    const episodes = num("exp-episodes");
    const risky = rate * unsafe * episodes;
    const msg = risky < 1 ? "示意風險暴露低，但仍非零" : risky < 10 ? "需要安全層與模擬先行" : "不可直接用於無保護實機探索";
    $("exp-output").innerHTML = `<strong>探索率 ${fmt(rate, 2)}、危險比例 ${fmt(unsafe, 2)}、回合數 ${episodes}，預期危險探索事件指標約 ${fmt(risky, 1)}：${msg}。</strong><br>這不是機率保證，只提醒探索成本不能從演算法公式中消失。`;
  };
  ["exp-rate", "exp-unsafe", "exp-episodes"].forEach(id => on(id, "input", draw));
  draw();
}

function sim() {
  if (!$("sim-range")) return;
  const draw = () => {
    const range = num("sim-range");
    const real = num("sim-real");
    if (range === 0) {
      $("sim-output").innerHTML = `<strong>未隨機化，只有名目點；真實相對偏差 ${fmt(real, 2)}。</strong><br>偏差恰為 0 才位於這個單點上；單點吻合也不代表其他參數與動態吻合。`;
      return;
    }
    const inside = Math.abs(real) <= range;
    const width = 2 * range;
    const why = inside ? "真實值落在訓練範圍，但組合分布與動態仍可能失配。" : "真實值落在訓練支撐之外，策略正在外插。";
    $("sim-output").innerHTML = `<strong>${inside ? "有覆蓋" : "未覆蓋"}；範圍 ±${fmt(range, 2)}，真實相對偏差 ${fmt(real, 2)}，隨機化寬度 ${fmt(width, 2)}。</strong><br>${why} 範圍越寬不一定越好。`;
  };
  ["sim-range", "sim-real"].forEach(id => on(id, "input", draw));
  draw();
}

function gate() {
  if (!$("gate-baseline")) return;
  const draw = () => {
    const baseline = $("gate-baseline").value === "yes";
    const ood = $("gate-ood").value === "yes";
    const stop = $("gate-stop").value === "yes";
    const shadow = $("gate-shadow").value === "yes";
    let title;
    let why;
    if (!baseline) [title, why] = ["不可部署", "沒有非學習基線，無法判斷模型是否真的改善。"]; 
    else if (!ood) [title, why] = ["不可擴大場景", "尚未測試分布外與失敗案例。"]; 
    else if (!stop) [title, why] = ["不可接管致動", "沒有獨立安全限制與停止路徑。"]; 
    else if (!shadow) [title, why] = ["先做 shadow mode", "讓策略只輸出建議，與現行控制並行比對。"]; 
    else [title, why] = ["可進低風險分階段試驗", "仍須限制速度、工作區與回退條件，並持續監測。"]; 
    $("gate-output").innerHTML = `<strong>${title}</strong><br>${why}`;
  };
  ["gate-baseline", "gate-ood", "gate-stop", "gate-shadow"].forEach(id => on(id, "input", draw));
  draw();
}

function offline() {
  if (!$("offline-min")) return;
  const draw = () => {
    const lo = num("offline-min");
    const hi = num("offline-max");
    const action = num("offline-action");
    const penaltyRate = num("offline-penalty");
    if (![lo, hi, action, penaltyRate].every(Number.isFinite)) {
      $("offline-output").innerHTML = "<strong>請輸入數值。</strong><br>上下界、候選動作與懲罰率都必須是有限數值。";
      return;
    }
    if (lo > hi) {
      $("offline-output").innerHTML = `<strong>上下界相反：資料契約錯誤。</strong><br>目前下界 ${fmt(lo, 2)} 大於上界 ${fmt(hi, 2)}；請修正後再計算，不會自動對調。`;
      return;
    }
    const distance = action < lo ? lo - action : action > hi ? action - hi : 0;
    const penalty = distance / 0.1 * penaltyRate;
    const inside = distance === 0;
    $("offline-output").innerHTML = `<strong>提議 ${fmt(action, 2)} rad/s；${inside ? "候選位於一維資料區間內" : "候選位於一維資料區間外"}；外插距離 ${fmt(distance, 3)} rad/s，示意保守懲罰 ${fmt(penalty, 2)}。</strong><br>資料區間 [${fmt(lo, 2)}, ${fmt(hi, 2)}] 只看單一動作軸；在區間內不代表目前狀態有足夠資料。`;
  };
  ["offline-min", "offline-max", "offline-action", "offline-penalty"].forEach(id => on(id, "input", draw));
  draw();
}

function modelBased() {
  if (!$("model-error")) return;
  const draw = () => {
    const epsilon = num("model-error");
    const L = num("model-lipschitz");
    const horizon = num("model-horizon");
    const replan = Math.min(horizon, num("model-replan"));
    const series = steps => Math.abs(L - 1) < 1e-9 ? steps : (1 - Math.pow(L, steps)) / (1 - L);
    const open = epsilon * series(horizon);
    const rolling = epsilon * series(replan);
    const ratio = open ? rolling / open : 0;
    $("model-output").innerHTML = `<strong>ε=${fmt(epsilon, 1)} mm、L=${fmt(L, 2)}、H=${horizon}：開迴路誤差上界示意 ${fmt(open, 1)} mm；每 ${replan} 步重規劃的一段上界 ${fmt(rolling, 1)} mm。</strong><br>單段約為全地平線的 ${fmt(ratio * 100, 1)}%。L 是描述誤差如何被動態放大的 Lipschitz 型敏感度界，不是穩定保證。`;
  };
  ["model-error", "model-lipschitz", "model-horizon", "model-replan"].forEach(id => on(id, "input", draw));
  draw();
}

function dictionary() {
  const query = $("term-search");
  if (!query) return;
  const cards = [...document.querySelectorAll(".term-card")];
  const draw = () => {
    const search = query.value.trim().toLocaleLowerCase("zh-Hant");
    let count = 0;
    cards.forEach(card => {
      const hit = card.textContent.toLocaleLowerCase("zh-Hant").includes(search);
      card.hidden = !hit;
      if (hit) count += 1;
    });
    $("term-count").textContent = `顯示 ${count} 個條目`;
  };
  on("term-search", "input", draw);
  draw();
}

rangeValues();
[policyStep, gradientStep, split, bc, returns, explore, sim, gate, offline, modelBased, dictionary].forEach(run => run());

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

const courseNav = [
  ["index.html", "首頁"],
  ["00-從控制程式到可學習策略.html", "00 世界觀"],
  ["00A-機器學習數學先修.html", "00A 數學先修"],
  ["03-MDP回報價值與策略.html", "03 強化學習"],
  ["06-安全評估與C++部署.html", "06 部署"],
  ["07-離線強化學習資料支撐與分布外動作.html", "07 離線學習"],
  ["08-模型式學習世界模型與滾動規劃.html", "08 模型式學習"],
  ["名詞與概念字典.html", "字典"]
];

function navigation() {
  const nav = document.querySelector("nav.topbar");
  if (!nav) return;
  const current = decodeURIComponent(location.pathname.split("/").pop() || "index.html");
  courseNav.forEach(([href, label]) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (current === href) link.setAttribute("aria-current", "page");
    nav.append(link);
  });
}

const quizzes = {
  "00": [
    ["策略提議 0.12 m/s，安全上限為 0.07 m/s，實際命令是多少？", ["0.05 m/s", "0.07 m/s", "0.12 m/s"], 1, "安全層會把提議裁到 0.07 m/s。這是精確裁切題，答案容差為 ±0.001 m/s。"],
    ["哪一項最適合保留為可稽核的硬限制？", ["透明杯的像素特徵", "關節速度上限", "抓取姿態的影像修正"], 1, "速度上限明確、可檢查，應由獨立安全層保護；學習元件可處理難以列舉的感知變化。"],
    ["為何 log 要同時保存模型提議與實際命令？", ["辨認安全層是否經常介入", "讓模型參數自動增加", "取代實機回授"], 0, "兩者能區分模型越界與真機真正執行的命令，但仍不能取代狀態回授。"]
  ],
  "00A": [
    ["L(θ)=(θ−3)²，θ=1 時的梯度是多少？", ["−4", "−2", "4"], 0, "dL/dθ=2(θ−3)=−4。答案容差為 ±0.001。"],
    ["同一題取學習率 η=0.25，更新一步後 θ 是多少？", ["1.5", "2", "2.5"], 1, "θ←1−0.25×(−4)=2。答案容差為 ±0.001。"],
    ["驗證集的主要用途是什麼？", ["直接更新參數", "檢查未參與更新資料上的表現", "保證真機安全"], 1, "驗證集用來觀察泛化與調整決策，不直接保證閉迴路或實機安全。"]
  ],
  "01": [
    ["速度 0.30 m/s、時間對齊誤差 50 ms，位移尺度約多少？", ["1.5 mm", "15 mm", "150 mm"], 1, "0.30×0.050=0.015 m=15 mm。答案容差為 ±0.1 mm。"],
    ["哪種切分最容易造成相鄰影格洩漏？", ["按場景切分", "按回合切分", "隨機切單幀"], 2, "相鄰影格高度相似，隨機切單幀會讓同一段序列跨進訓練與測試。"],
    ["資料契約為何要記座標系？", ["同一組數值在不同座標系代表不同方向", "可讓時間戳省略", "可保證沒有缺值"], 0, "向量數字離開座標系便沒有完整幾何意義；座標系不能取代時間與缺值契約。"]
  ],
  "02": [
    ["若每步獨立錯誤率 3%，20 步至少錯一次約為多少？", ["3.0%", "45.6%", "60.0%"], 1, "1−0.97²⁰≈0.4562，即 45.6%。答案容差為 ±0.1 個百分點。"],
    ["DAgger 最關鍵的新資料來自哪裡？", ["目前策略真正造訪、需要恢復的狀態", "重複原本成功示範", "只挑最短軌跡"], 0, "DAgger 讓專家標註目前策略會遇到的狀態，補回閉迴路偏離後的資料。"],
    ["離線動作誤差很低能直接證明什麼？", ["閉迴路一定穩定", "在指定資料上較像專家", "真機不會碰撞"], 1, "它只直接支持固定資料上的模仿程度，閉迴路恢復與安全要另測。"]
  ],
  "03": [
    ["獎勵為 2、−1、4，γ=0.5 時 G₀ 是多少？", ["2.5", "3.0", "5.0"], 0, "G₀=2+0.5×(−1)+0.25×4=2.5。答案容差為 ±0.001。"],
    ["標準 MDP 五元組中的第五項是什麼？", ["策略", "折扣因子", "神經網路"], 1, "MDP 為 (S,A,P,R,γ)；策略是要在此模型上評估或尋找的決策規則。"],
    ["為何高回報不等於安全？", ["回報永遠是負數", "平均目標可能漏掉尾端風險與硬限制", "價值函數沒有單位"], 1, "獎勵是人寫下的代理規格，可能被鑽漏洞，也可能掩蓋低機率重大損害。"]
  ],
  "04": [
    ["ε=0.08、危險候選比例 0.25、共 200 次決策，粗略暴露量是多少？", ["2", "4", "16"], 1, "B=0.08×0.25×200=4。答案容差為 ±0.001 次；這是期望計數，不是事故機率。"],
    ["優勢 A 為負時，樣本更新的直覺是什麼？", ["提高該動作傾向", "降低該動作傾向", "刪除安全層"], 1, "負優勢表示結果低於基準，更新會降低類似狀態下再選該動作的傾向。"],
    ["訓練曲線平坦可直接證明 Lyapunov 穩定嗎？", ["可以", "不可以", "只要探索率為零就可以"], 1, "最佳化指標不再變化，與受擾動後狀態是否維持有界或回到平衡是不同命題。"]
  ],
  "05": [
    ["速度 0.6 m/s，額外延遲 30 ms，位移尺度約多少？", ["1.8 mm", "18 mm", "180 mm"], 1, "0.6×0.030=0.018 m=18 mm。答案容差為 ±0.1 mm。"],
    ["領域隨機化範圍包住真值，能證明什麼？", ["該一維真值有被範圍涵蓋", "所有聯合參數都被充分取樣", "真機一定成功"], 0, "一維涵蓋只是支撐線索，不能證明模型形式、聯合組合或任務結果。"],
    ["系統辨識主要在做什麼？", ["用真機輸入輸出估模型參數", "隨機放大所有參數", "取消實機驗證"], 0, "它用量測讓模擬參數更貼近特定系統，但仍受模型形式與資料範圍限制。"]
  ],
  "06": [
    ["週期 25 ms，感知 7 ms、推論 6 ms、安全檢查 4 ms，剩餘裕量多少？", ["8 ms", "11 ms", "17 ms"], 0, "25−7−6−4=8 ms。答案容差為 ±0.001 ms。"],
    ["影子模式（shadow mode）的特徵是什麼？", ["策略提議會直接致動", "策略只輸出提議並與現行控制比較", "不記錄輸入"], 1, "影子模式保留真實輸入與提議證據，但不讓新策略直接接管致動。"],
    ["哪一項是部署前不可省的獨立機制？", ["逾時與安全回退", "只看平均成功率", "只保存模型檔名"], 0, "模型不負責完整系統安全；逾時、限制、停止與回退必須獨立存在並可測。"]
  ],
  "07": [
    ["π(a|s)=0.6、μ(a|s)=0.4，單步重要性比率是多少？", ["0.67", "1.0", "1.5"], 2, "w=π÷μ=0.6÷0.4=1.5。答案容差為 ±0.001。"],
    ["每軸都落在最小最大值內，為何仍可能 OOD？", ["聯合組合可能從未出現", "最小值一定記錯", "離線資料沒有動作"], 0, "高維支撐取決於狀態條件與欄位聯合分布，逐軸範圍不足以證明有資料。"],
    ["保守價值估計能取代物理安全層嗎？", ["能", "不能", "只有資料很多時能"], 1, "保守方法抑制證據不足的高估，不會自動理解速度、碰撞或人員安全限制。"]
  ],
  "08": [
    ["ε=3 mm、L=1、H=4 時誤差上界示意是多少？", ["7 mm", "12 mm", "81 mm"], 1, "L=1 時 E=Hε=4×3=12 mm。答案容差為 ±0.001 mm。"],
    ["每步 4 個候選動作、地平線 5，完整序列共有幾條？", ["20", "256", "1024"], 2, "候選數為 4⁵=1024。答案為整數，容差 0。"],
    ["MPC 為何通常只執行第一小段？", ["取得新量測後可重新規劃", "世界模型永遠精確", "可省略底層控制器"], 0, "滾動重規劃用新量測截短開迴路誤差，但仍需要估測、安全層與底層控制器。"]
  ]
};

function selfChecks() {
  document.querySelectorAll("[data-quiz]").forEach(section => {
    const chapter = section.dataset.quiz;
    const questions = quizzes[chapter] || [];
    const form = document.createElement("form");
    form.innerHTML = `<h2>不計分自我檢核</h2><p class="note">先作答，再展開答案與解析。按「清除作答」即可重做；本區不計分，也不儲存進度。</p>`;
    questions.forEach(([prompt, options, answer, explanation], index) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "quiz-question";
      const legend = document.createElement("legend");
      legend.textContent = `${index + 1}. ${prompt}`;
      fieldset.append(legend);
      options.forEach((option, optionIndex) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `quiz-${chapter}-${index}`;
        input.value = String(optionIndex);
        label.append(input, ` ${option}`);
        fieldset.append(label);
      });
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "查看答案與解析";
      const answerText = document.createElement("p");
      answerText.innerHTML = `<strong>答案：${String.fromCharCode(65 + answer)}。</strong> ${explanation}`;
      details.append(summary, answerText);
      fieldset.append(details);
      form.append(fieldset);
    });
    const reset = document.createElement("button");
    reset.type = "reset";
    reset.textContent = "清除作答，重新練習";
    form.append(reset);
    form.addEventListener("reset", () => form.querySelectorAll("details").forEach(details => {
      details.open = false;
    }));
    section.append(form);
  });
}

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

navigation();
rangeValues();
[policyStep, gradientStep, split, bc, returns, explore, sim, gate, offline, modelBased, dictionary].forEach(run => run());
selfChecks();

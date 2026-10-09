"use strict";

const scenario = document.getElementById("attack-scenario");
const detail = document.getElementById("attack-detail");
if (scenario && detail) {
  const update = () => {
    const option = scenario.selectedOptions[0];
    detail.querySelector("[data-title]").textContent = option.textContent;
    ["pre", "mechanism", "change", "impact", "control", "evidence", "limit"].forEach(key => {
      const node = detail.querySelector(`[data-field="${key}"]`);
      if (node) node.textContent = option.dataset[key] || "—";
    });
  };
  scenario.addEventListener("change", update);
  update();
}

const search = document.getElementById("term-search");
if (search) {
  const cards = [...document.querySelectorAll(".term-card")];
  const count = document.getElementById("term-count");
  const empty = document.getElementById("term-empty");
  const filterTerms = () => {
    const query = search.value.trim().toLocaleLowerCase("zh-Hant");
    let visible = 0;
    cards.forEach(card => {
      const match = card.textContent.toLocaleLowerCase("zh-Hant").includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (count) count.textContent = `顯示 ${visible} 個進階條目`;
    if (empty) {
      empty.hidden = visible !== 0;
      empty.textContent = `找不到「${search.value}」。可改用繁中、英文全名、縮寫或白話動作。`;
    }
  };
  search.addEventListener("input", filterTerms);
  filterTerms();
}

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
  const filterTerms = () => {
    const query = search.value.trim().toLocaleLowerCase("zh-Hant");
    let visible = 0;
    cards.forEach(card => {
      const match = card.textContent.toLocaleLowerCase("zh-Hant").includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (count) count.textContent = `顯示 ${visible} 個進階條目`;
  };
  search.addEventListener("input", filterTerms);
  filterTerms();
}

const navigation = document.querySelector(".top-nav-inner");
if (navigation) {
  const advancedLinks = [
    ["05 Web", "05-瀏覽器與Web邊界.html"],
    ["06–07 身分", "06-聯合身分與權杖.html"],
    ["08 原生程式", "08-原生程式利用概念.html"],
    ["09 密碼", "09-密碼協定與側通道.html"],
    ["10 雲端", "10-雲端容器與控制平面.html"],
    ["11 網路", "11-網路基礎設施.html"],
    ["12 供應鏈", "12-供應鏈與失陷後活動.html"],
    ["進階字典", "進階名詞字典.html"]
  ];
  advancedLinks.forEach(([label, href]) => {
    if (!navigation.querySelector(`a[href="${href}"]`)) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      navigation.append(link);
    }
  });
}

if (document.title.startsWith("04 ")) {
  const next = document.querySelector(".pager a:last-child");
  if (next) {
    next.href = "05-瀏覽器與Web邊界.html";
    next.textContent = "下一章：瀏覽器與 Web 邊界 →";
  }
}

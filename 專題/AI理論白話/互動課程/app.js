"use strict";
(function () {
  var id = function (x) { return document.getElementById(x); };

  // 主題切換：讀寫 localStorage，全包 try/catch，預設跟系統
  function theme() {
    var KEY = "ai-theory-theme";
    function get() {
      try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function set(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
    }
    function apply(v) {
      var root = document.documentElement;
      if (v === "dark" || v === "light") {
        root.setAttribute("data-theme", v);
      } else {
        root.removeAttribute("data-theme");
      }
    }
    var saved = get();
    apply(saved);

    var topbar = document.querySelector(".topbar");
    if (!topbar) return;
    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    function label() {
      var cur = document.documentElement.getAttribute("data-theme");
      if (cur === "dark") return "深色";
      if (cur === "light") return "淺色";
      return "自動";
    }
    btn.textContent = "主題：" + label();
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : cur === "light" ? "" : "dark";
      if (next) { apply(next); set(next); } else { apply(null); set(""); }
      btn.textContent = "主題：" + label();
      rerenderMermaid();
    });
    topbar.appendChild(btn);
  }

  // 目錄使用原生 <details>；此段只處理當前段落高亮
  function tocHighlight() {
    var toc = document.querySelector(".toc");
    if (!toc || typeof IntersectionObserver === "undefined") return;
    var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    if (!links.length) return;
    var map = {};
    links.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec) map[a.getAttribute("href").slice(1)] = a;
    });
    try {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var a = map[entry.target.id];
            if (!a) return;
            if (entry.isIntersecting) {
              links.forEach(function (l) { l.classList.remove("active"); });
              a.classList.add("active");
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      Object.keys(map).forEach(function (secId) {
        var el = document.getElementById(secId);
        if (el) obs.observe(el);
      });
    } catch (e) {}
  }

  // 桌面預設展開、窄螢幕預設收合；使用者在同一 viewport 的選擇不會被覆寫。
  function responsiveToc() {
    var details = document.querySelector(".toc details");
    if (!details || !window.matchMedia) return;
    var mq = window.matchMedia("(max-width: 900px)");
    function applyDefault() { details.open = !mq.matches; }
    applyDefault();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", applyDefault);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(applyDefault);
    }
  }

  // 字典搜尋過濾
  function dictionarySearch() {
    var q = id("term-search");
    if (!q) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll(".term-card"));
    var count = id("term-count");
    var empty = id("term-empty");
    function draw() {
      var s = q.value.trim().toLocaleLowerCase("zh-Hant");
      var n = 0;
      cards.forEach(function (c) {
        var hit = s === "" || c.textContent.toLocaleLowerCase("zh-Hant").indexOf(s) !== -1;
        c.hidden = !hit;
        if (hit) n++;
      });
      document.querySelectorAll(".term-groups > h2").forEach(function (h) {
        var next = h.nextElementSibling;
        if (!next) return;
        var visible = Array.prototype.slice.call(next.querySelectorAll(".term-card")).some(function (c) { return !c.hidden; });
        h.hidden = !visible;
        next.hidden = !visible;
      });
      if (count) count.textContent = "顯示 " + n + " 個詞條";
      if (empty) empty.hidden = n !== 0;
    }
    q.addEventListener("input", draw);
    draw();
  }

  // Mermaid：可選、失敗不影響閱讀
  var mermaidLoaded = false;
  var mermaidLoading = false;

  // pre.mermaid 的原始碼可能含 <br/> 這類行內 HTML，瀏覽器解析 <pre> 內容時
  // 會把它當成真正的標籤而不是文字；用 data-src（HTML 屬性值不會被當標籤解析）
  // 還原成正確的原始文字，失敗（未渲染）時畫面上看到的才是可讀的原文。
  function restoreMermaidSource() {
    try {
      document.querySelectorAll("pre.mermaid[data-src]").forEach(function (n) {
        var src = n.getAttribute("data-src");
        if (src != null && n.textContent !== src) n.textContent = src;
      });
    } catch (e) {}
  }

  function mermaidTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (cur === "dark") return "dark";
    if (cur === "light") return "default";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
  }

  function runMermaid() {
    try {
      if (!window.mermaid) return;
      window.mermaid.initialize({ startOnLoad: false, theme: mermaidTheme() });
      var nodes = document.querySelectorAll("pre.mermaid");
      nodes.forEach(function (n) {
        if (!n.getAttribute("data-src")) n.setAttribute("data-src", n.textContent);
      });
      if (typeof window.mermaid.run === "function") {
        window.mermaid.run({ nodes: nodes });
      }
    } catch (e) {}
  }

  function rerenderMermaid() {
    if (!mermaidLoaded) return;
    try {
      var nodes = document.querySelectorAll("pre.mermaid");
      nodes.forEach(function (n) {
        var src = n.getAttribute("data-src");
        if (src != null) {
          n.removeAttribute("data-processed");
          n.innerHTML = src;
        }
      });
      runMermaid();
    } catch (e) {}
  }

  function mermaid() {
    var nodes = document.querySelectorAll("pre.mermaid");
    if (!nodes.length || mermaidLoading) return;
    mermaidLoading = true;
    try {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js";
      s.onload = function () {
        mermaidLoaded = true;
        runMermaid();
      };
      s.onerror = function () {};
      document.head.appendChild(s);
    } catch (e) {}
  }

  function boot() {
    restoreMermaidSource();
    theme();
    responsiveToc();
    tocHighlight();
    dictionarySearch();
    mermaid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

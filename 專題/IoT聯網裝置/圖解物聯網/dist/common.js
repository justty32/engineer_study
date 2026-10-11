'use strict';
(() => {
  const courses = window.IOT_COURSES || [];
  const header = document.querySelector('[data-site-header]');
  if (header) header.innerHTML = `<a class="skip-link" href="#main">跳到主要內容</a><header class="site-header wrap"><a class="brand" href="index.html" aria-label="物聯網小小實驗室，回首頁"><svg class="brand-icon" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 23V10M14 16C5 17 4 8 5 6c8 0 11 5 9 10Zm0-4c-1-7 5-11 10-9 0 7-5 10-10 9Z" fill="none" stroke-width="1.6"/><path d="M9 24h10" stroke-width="1.6"/></svg><span>物聯網小小實驗室<small>THE LITTLE IoT LAB</small></span></a><nav class="site-nav" aria-label="主要導覽"><a href="index.html#explore">探索實驗</a><a href="glossary.html">小字典</a><a class="nav-about" href="sources.html">關於這裡</a><span class="nav-note">用圖，慢慢弄懂。</span></nav></header>`;
  const footer = document.querySelector('[data-site-footer]');
  if (footer) footer.innerHTML = `<footer class="site-footer wrap"><p><strong>小小裝置，大大的連結。</strong>　從一張電路板，看懂物聯網。</p><p><a href="sources.html">來源與模型限制</a>　·　原創 SVG 圖解　·　可離線探索</p></footer>`;
  const id = document.body.dataset.lesson;
  if (id) {
    const data = window.IOT && window.IOT[id];
    const main = document.getElementById('main');
    if (!data || !main) return;
    const index = courses.findIndex(x => x.id === id);
    const course = courses[index];
    const prev = courses[index-1];
    const next = courses[index+1];
    const nav = courses.map((c,i) => `<a href="${c.id}.html"${c.id===id?' aria-current="page"':''}><span class="route-number">0${i+1}</span>${c.short}</a>`).join('');
    main.innerHTML = `<nav class="lesson-route" aria-label="實驗章節"><a href="index.html">起點</a>${nav}</nav><header class="lesson-header"><p class="eyebrow">EXPERIMENT 0${index+1} / ${course.tag}</p><h1>${data.title}</h1><p class="lesson-intro">${data.intro}</p><p class="prerequisite">這章假設已懂：${data.prerequisite}　<a href="${prev?prev.id+'.html':'index.html'}">${prev?'回看「'+prev.short+'」':'回到零基礎起點'}</a> · <a href="glossary.html">隨時查小字典</a></p></header><section class="lesson-workbench" aria-label="${course.short}互動實驗">${data.markup}</section><details class="source-details"><summary>這張圖省略了什麼？看看模型與來源</summary><div><p>${data.limits}</p><ul>${(data.sources||[]).map(s=>`<li>${s}</li>`).join('')}</ul><a href="sources.html">全部來源與閱讀路線 ↗</a></div></details><nav class="pager" aria-label="上一課與下一課"><a href="${prev?prev.id+'.html':'index.html'}"><small>← ${prev?'上一個實驗':'回到起點'}</small>${prev?prev.name:'一盆會說話的植物'}</a><a href="${next?next.id+'.html':'index.html#explore'}"><small>${next?'下一個實驗':'自由探索'} →</small>${next?next.name:'回到實驗地圖'}</a></nav>`;
    data.mount(main.querySelector('.lesson-workbench'));
    main.querySelectorAll('.lab-panel').forEach(panel=>{panel.tabIndex=0;panel.id=id+'-diagram-region';panel.setAttribute('role','region');panel.setAttribute('aria-label',course.short+'路線圖，窄螢幕可左右滑動');});
    const workbench=main.querySelector('.lesson-workbench');
    const controls=workbench.querySelector('.lab-controls');
    if(controls){
      controls.id=id+'-controls';
      controls.tabIndex=-1;
      const guide=document.createElement('div');
      guide.className='workbench-guide';
      guide.innerHTML='<span>↔ 大圖可左右滑動</span><button type="button" class="button secondary" data-jump="diagram">看圖解</button><button type="button" class="button" data-jump="controls">動手試 ↓</button>';
      guide.addEventListener('click',event=>{const button=event.target.closest('[data-jump]');if(!button)return;const target=button.dataset.jump==='controls'?controls:workbench.querySelector('.lab-panel');target.scrollIntoView({block:'start'});target.focus({preventScroll:true});});
      workbench.prepend(guide);
    }
    const active = main.querySelector('.lesson-route [aria-current]');
    if (active) { const route = active.parentElement; route.scrollLeft = Math.max(0, active.offsetLeft - route.offsetLeft - 50); }
  }
  const cards = document.getElementById('course-cards');
  if (cards) cards.innerHTML = courses.map((c,i)=>`<a class="course-card" href="${c.id}.html"><div class="course-art"><span class="course-number">EXPERIMENT 0${i+1}</span><svg viewBox="0 0 180 135" aria-hidden="true">${window.IOT_ART[c.icon]}</svg></div><div class="course-card-copy"><h3>${c.name}<span aria-hidden="true">↗</span></h3><p>${c.desc}</p><span class="course-tag">${c.tag}</span></div></a>`).join('') + `<aside class="course-about"><p class="eyebrow">FOLLOW YOUR CURIOSITY</p><h3>沒有考試，<br>只有「原來如此」。</h3><p>每個實驗都可以自由調整、重新開始。先玩一遍，再回頭看原因。</p><a href="sources.html">認識這份圖解 ↗</a></aside>`;
})();

/* Reading routes reuse the lessons' verified experiments; no new numerical model. */
(function(){
  'use strict';
  const routes={
    first:{title:'從看得見的曲線開始',reason:'先分開係數與公式形狀，再把訓練貼合與新資料驗證分開。沿著這條路線，不需要預先懂最佳化。',pages:[['00-start.html','01 手調公式'],['01-search.html','02 列舉候選'],['02-validation.html','03 新資料驗證']],action:'動手順序：先把 a、b、c 都設成 1；再加觀測擾動；到第三章切換「乾淨資料」與「有擾動／八次式」，比較三組 MSE。',question:'帶回論文：候選公式能用哪些零件？作者在已看過的資料與未看過的資料上，分別報了什麼？'},
    choice:{title:'把評分與前緣拆開檢查',reason:'先看候選有哪些，再看用什麼成本挑第一名。公式突然換掉，可能是偏好改了，資料本身沒有改。',pages:[['01-search.html','02 搜尋與評分'],['03-pareto.html','04 取捨前緣']],action:'動手順序：到取捨頁把 λ 設為 0.25，再設為 0.4，加權勝出式會由 F 換成 A。把節點上限設為 7，則能選到任何非負 λ 都選不到的 E。',question:'帶回論文：複雜度怎麼計？懲罰權重從哪裡來？是否只保留一次評分第一名，還是保留多個有不同取捨的候選？'},
    physical:{title:'先檢查公式能否描述這個物理量',reason:'先核對量綱、定義域與物理假設，再拿新資料驗證。單位正確與訓練準確，都是各自有限的證據。',pages:[['04-units.html','05 量綱與定義域'],['02-validation.html','03 新資料驗證']],action:'動手順序：依次看「速度加時間」「係數錯一倍」「除以零」。辨認失敗發生在哪一層，再回第三章把公式帶出訓練範圍。',question:'帶回論文：變數與係數有沒有單位？在哪個輸入範圍和物理假設下成立？外插與真實量測資料有沒有另外驗證？'}
  };
  const $=id=>document.getElementById(id);
  function start(){
    if(!$('reading-goal'))return;
    function update(){
      const route=routes[$('reading-goal').value]||routes.first;
      $('route-title').textContent=route.title;$('route-reason').textContent=route.reason;$('route-action').textContent=route.action;$('route-question').textContent=route.question;
      const nav=$('route-links');nav.replaceChildren();
      route.pages.forEach(([file,title])=>{const a=document.createElement('a');a.className='button';a.href='./'+file;a.textContent=title;nav.appendChild(a);});
    }
    $('reading-goal').addEventListener('input',update);update();
  }
  start();if(typeof module!=='undefined'&&module.exports)module.exports={routes};
})();

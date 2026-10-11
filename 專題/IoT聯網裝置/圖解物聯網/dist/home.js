'use strict';
(() => {
  const q = id => document.getElementById('home-'+id);
  if (!q('send')) return;
  let moisture = 20;
  let received = null;
  let needsUpdate = true;
  function render(message) {
    const power = q('power').checked;
    const network = q('network').checked;
    const thirsty = moisture < 35;
    q('dry').setAttribute('aria-pressed',String(moisture===20));
    q('water').setAttribute('aria-pressed',String(moisture===60));
    q('world-value').textContent = moisture+' / 100';
    q('soil').setAttribute('fill', thirsty?'#987854':'#62553e');
    q('plant-mouth').setAttribute('d',thirsty?'M142 258q8-7 15 0':'M142 255q8 8 15 0');
    q('board').classList.toggle('dimmed',!power);
    q('battery').classList.toggle('dimmed',!power);
    q('router').classList.toggle('dimmed',!network);
    q('board-value').textContent = power?`${moisture} ${thirsty?'＜':'≥'} 35`:'尚未供電';
    q('board-status').textContent = power?`規則說：${thirsty?'需要澆水':'暫時不需水'}`:'感測與判斷停止';
    q('board-led').setAttribute('fill', power?(thirsty?'#ed8154':'#7c9f60'):'#78916d');
    ['route-board','route-cloud','route-phone'].forEach(id=>q(id).classList.toggle('is-live',power&&network));
    q('phone-value').textContent = received===null?'—':received;
    q('phone-message').textContent = received===null?'等你寄消息':received<35?'我渴了，請澆水':'水分剛好，謝謝你';
    q('phone-freshness').textContent = received===null?'尚無資料':!power?'電源已斷 · 舊資料':!network?'網路中斷 · 舊資料':needsUpdate?'未傳送 · 舊資料':'已收到這次讀值';
    q('local-summary').textContent=power?`${moisture} · ${thirsty?'需要澆水':'暫時不需水'}`:'電源中斷 · 未量測';
    q('phone-summary').textContent=received===null?'尚無資料':`${received} · ${(!power||!network||needsUpdate)?'上次收到的舊資料':'這次讀值已收到'}`;
    q('why').textContent = message;
  }
  function change(value) {
    moisture=value;needsUpdate=true;
    const power=q('power').checked;
    render(!power?`土壤已改成 ${moisture}，但電池沒接上，電路板無法讀取。手機也不會自己知道環境改變。`:`土壤改成 ${moisture}。MCU（微控制器）依 ${moisture} ${moisture<35?'低於':'不低於'} 35 的規則，判斷「${moisture<35?'需要澆水':'暫時不需水'}」。手機要等新消息送達才更新。`);
  }
  q('dry').addEventListener('click',()=>change(20));
  q('water').addEventListener('click',()=>change(60));
  q('power').addEventListener('change',()=>{needsUpdate=true;render(q('power').checked?'電池接好了，感測器與 MCU 又能工作。新的讀值仍要透過模組與網路送出，手機才會更新。':'電源切斷了。感測器、MCU 和連線模組都停止工作；手機保留之前收到的資料，不代表現在的土壤。');});
  q('network').addEventListener('change',()=>{needsUpdate=true;render(q('network').checked?'路又通了。本機可以再把消息交給網路，但連線恢復不等於新資料已送達；按「送一則消息」試試看。':q('power').checked?'網路斷了，板上的 MCU 仍能讀取和判斷，只是消息送不到手機。手機保留的舊資料不會自動變新。':'網路與電源都中斷：本機不能工作，手機也收不到新消息。');});
  q('send').addEventListener('click',()=>{
    if (!q('power').checked) {render('這次沒寄出去：電池沒有接上，感測器、MCU 與連線模組都不能工作。先接回電池，才能讀取並傳送。');return;}
    if (!q('network').checked) {render(`這次沒寄出去：本機讀到 ${moisture}，但網路中斷了。手機仍顯示最後收到的資料；恢復網路後，再傳一次。`);return;}
    received=moisture;needsUpdate=false;
    render(`消息送達！感測器 → MCU 的韌體判斷 → 外購連線模組 → 路由器與網路 → MQTT 服務 → 手機。這次收到 ${received}，所以顯示「${received<35?'我渴了':'水分剛好'}」。`);
  });
  q('reset').addEventListener('click',()=>{moisture=20;received=null;needsUpdate=true;q('power').checked=true;q('network').checked=true;render('土壤是乾的。電路板讀到 20，低於提醒線 35，所以判斷「需要澆水」。按下「送一則消息」，讓手機也知道。');});
  render(q('why').textContent);
})();

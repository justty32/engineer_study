'use strict';
window.IOT = window.IOT || {};
window.IOT_COURSES = [
  {id:'sensors',name:'世界，變成數字',short:'感測',desc:'土是乾是濕，晶片怎麼知道？',tag:'SENSOR · 感測與讀數',icon:'sensor'},
  {id:'brain',name:'給小腦袋一條規則',short:'判斷',desc:'設定一條線，讓裝置自己提醒。',tag:'MCU · 晶片與韌體',icon:'chip'},
  {id:'power',name:'讓電池多睡一下',short:'電力',desc:'少傳幾次，電池能多用多久？',tag:'POWER · 電源與睡眠',icon:'battery'},
  {id:'network',name:'消息怎麼走出去？',short:'連線',desc:'走過電路板，再走向網際網路。',tag:'NETWORK · 模組與網路',icon:'wifi'},
  {id:'messages',name:'找對收信的人',short:'訊息',desc:'把消息交給會分送的小郵局。',tag:'MQTT · 主題與交付',icon:'mail'},
  {id:'security',name:'先認封印，再開門',short:'安全',desc:'裝新程式前，先確認值得信任。',tag:'SECURITY · 簽章與更新',icon:'lock'},
  {id:'reliability',name:'斷線了，也有辦法',short:'恢復',desc:'先存起來，等路通了再送。',tag:'RELIABILITY · 緩存與重連',icon:'repair'}
];
window.IOT_ART = {
sensor:'<path d="M64 84h38l-5 28H69z" fill="#ed8154"/><path d="M83 84V43" stroke="#183e37" stroke-width="3"/><path d="M83 65C53 69 44 43 52 35c23-3 36 12 31 30zm0-8c-2-29 20-39 35-30 1 23-19 31-35 30" fill="#88a774"/><path d="M103 79l8-29" stroke="#183e37" stroke-width="4"/><rect x="106" y="38" width="12" height="17" rx="4" fill="#183e37"/><path d="M118 44h21v42h-28" fill="none" stroke="#183e37" stroke-width="2" stroke-dasharray="4 4"/><circle cx="140" cy="87" r="9" fill="#f8f7f2" stroke="#183e37" stroke-width="2"/>',
chip:'<rect x="61" y="36" width="64" height="64" rx="12" fill="#183e37"/><rect x="75" y="50" width="36" height="36" rx="5" fill="#b8cc9a"/><path d="M70 24v12m15-12v12m15-12v12m15-12v12M70 100v12m15-12v12m15-12v12m15-12v12M49 46h12m-12 15h12m-12 15h12m-12 15h12m64-45h12m-12 15h12m-12 15h12m-12 15h12" stroke="#183e37" stroke-width="3"/><circle cx="87" cy="65" r="3" fill="#183e37"/><circle cx="101" cy="65" r="3" fill="#183e37"/><path d="M87 76q7 6 14 0" fill="none" stroke="#183e37" stroke-width="2"/>',
battery:'<rect x="39" y="44" width="103" height="51" rx="11" fill="#f8f7f2" stroke="#183e37" stroke-width="3"/><rect x="142" y="58" width="8" height="23" rx="3" fill="#183e37"/><rect x="47" y="52" width="47" height="35" rx="5" fill="#88a774"/><path d="M107 28h12m-6-6v12" stroke="#183e37" stroke-width="2"/><path d="M106 61l-8 11h8l-4 11 15-17h-10z" fill="#ed8154"/><path d="M59 111h-9m18 0h-3m-29-8h-8" stroke="#183e37" stroke-width="2"/>',
wifi:'<rect x="42" y="84" width="101" height="23" rx="9" fill="#183e37"/><path d="M52 84V67m81 17V67M61 49q31-29 63 0M75 61q18-17 36 0" fill="none" stroke="#183e37" stroke-width="4" stroke-linecap="round"/><circle cx="93" cy="73" r="5" fill="#ed8154"/><circle cx="123" cy="96" r="3" fill="#b8cc9a"/>',
mail:'<rect x="38" y="39" width="102" height="71" rx="9" fill="#f8f7f2" stroke="#183e37" stroke-width="3"/><path d="M42 45l47 37 47-37" fill="none" stroke="#183e37" stroke-width="3"/><circle cx="138" cy="35" r="18" fill="#ed8154"/><path d="M130 35h16m-8-8v16" stroke="#183e37" stroke-width="2"/>',
lock:'<path d="M68 59V43c0-35 47-35 47 0v16" fill="none" stroke="#183e37" stroke-width="5"/><rect x="53" y="57" width="77" height="60" rx="13" fill="#88a774" stroke="#183e37" stroke-width="3"/><circle cx="92" cy="79" r="7" fill="#183e37"/><path d="M92 84v12" stroke="#183e37" stroke-width="5"/><path d="M146 34l5 6 11-14" fill="none" stroke="#ed8154" stroke-width="3"/>',
repair:'<rect x="51" y="41" width="85" height="65" rx="12" fill="#f8f7f2" stroke="#183e37" stroke-width="3"/><rect x="60" y="54" width="18" height="39" rx="4" fill="#b8cc9a"/><rect x="84" y="54" width="18" height="39" rx="4" fill="#b8cc9a"/><rect x="108" y="54" width="18" height="39" rx="4" fill="#ed8154"/><path d="M45 79q-21-38 7-58m-9 0h10v11M143 75q21 38-7 47m9 0h-10v-11" fill="none" stroke="#183e37" stroke-width="2"/>'
};

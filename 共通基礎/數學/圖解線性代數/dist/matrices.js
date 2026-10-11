"use strict";
(() => {
 const el=id=>document.getElementById(id);
 const presets={'two-blue':[2,1],'one-blue':[1,1],zero:[0,0]};
 function update(){
  const a=Number(el('a').value),b=Number(el('b').value),c=Number(el('c').value),d=Number(el('d').value);
  const first=[a,c],second=[b,d],v=presets[el('input-preset').value],w=[a*v[0]+b*v[1],c*v[0]+d*v[1]];
  ['a','b','c','d'].forEach(id=>{el(id+'-value').textContent=LA.fmt(Number(el(id).value));});
  const steps=[],points=[[0,0]];
  for(let n=0;n<v[0];n++)steps.push({route:first,color:'blue'});
  for(let n=0;n<v[1];n++)steps.push({route:second,color:'coral'});
  steps.forEach(step=>{const p=points[points.length-1];points.push([p[0]+step.route[0],p[1]+step.route[1]]);});
  const extent=Math.max(4,Math.ceil(Math.max(...points.flat().map(Math.abs)))+1),scale=140/extent;
  const right=LA.plane({cx:620,cy:222,scale,extent,tickStep:2,showOrigin:false,xlabel:"左右",ylabel:"上下"});
  let svg=LA.text(190,30,'輸入：藍 '+v[0]+' 份、橘 '+v[1]+' 份','svg-title','middle');
  svg+=LA.text(620,30,'照卡接起來，走到黃點','svg-title','middle');
  svg+=right.axes;
  steps.forEach((step,i)=>{
   const y=80+i*94,isBlue=step.color==='blue';
   svg+='<rect x="42" y="'+y+'" width="296" height="78" rx="10" fill="'+(isBlue?'#e5ebff':'#fbe1d8')+'"/>';
   svg+=LA.text(58,y+27,(isBlue?'藍卡':'橘卡')+'第 '+(isBlue?i+1:i-v[0]+1)+' 份','svg-label');
   svg+=LA.text(58,y+59,'每份走 '+LA.vec(step.route),'svg-label');
   svg+=LA.arrow(283,y+44,283+step.route[0]*15,y+44-step.route[1]*15,step.color);
  });
  if(!steps.length){
   svg+='<rect x="52" y="119" width="276" height="202" rx="10" fill="none" stroke="#b5bfd4" stroke-width="2" stroke-dasharray="8 5"/>';
   svg+=LA.text(190,207,'0 份路線卡','svg-title','middle')+LA.text(190,246,'什麼都沒拿，就不走','svg-label','middle');
  }
  svg+=LA.arrow(369,216,425,216,'ink')+LA.text(397,193,'照卡走','svg-label','middle');
  steps.forEach((step,i)=>{
   const start=points[i],end=points[i+1];
   svg+=LA.arrow(right.X(start[0]),right.Y(start[1]),right.X(end[0]),right.Y(end[1]),step.color);
   if(i<steps.length-1)svg+='<circle cx="'+right.X(end[0])+'" cy="'+right.Y(end[1])+'" r="3" fill="#182849"/>';
  });
  svg+=LA.dot(right.X(w[0]),right.Y(w[1]));
  svg+=LA.text(190,394,'藍卡 '+v[0]+' 張 ＋ 橘卡 '+v[1]+' 張','svg-label','middle');
  svg+=LA.text(190,422,'同一張卡，每次做同一段移動','svg-label','middle');
  svg+=LA.text(620,394,'藍卡 '+LA.vec(first)+' ／ 橘卡 '+LA.vec(second),'svg-label','middle');
  svg+=LA.text(620,422,'終點 '+LA.vec(w),'svg-title','middle');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent='A'+LA.vec(v)+' = '+LA.vec(w);
  el('result-secondary').textContent=v[0]+' × '+LA.vec(first)+' + '+v[1]+' × '+LA.vec(second);
  let why=steps.length?'從家出發，每份藍走 '+LA.vec(first)+'，每份橘走 '+LA.vec(second)+'。這次依序到 '+points.slice(1).map(LA.vec).join(' → ')+'。':'兩張路線卡都拿 0 份，所以不論卡片寫什麼，都留在原點 (0, 0)。';
  if(a===2&&b===-1&&c===1&&d===1){
   if(el('input-preset').value==='one-blue')why+='和故事相比，少了一份藍，所以從 (3, 3) 向左 2、下 1，退到 (1, 2)。';
   if(el('input-preset').value==='two-blue')why+='和上面的故事一樣：藍、藍、橘，最後是右 3、上 3。';
  }else why+='你已改過路線卡；這組規則與上方故事不同。重設可回到故事。';
  if(a===1&&b===0&&c===0&&d===1)why+='這是單位矩陣：輸入的兩個份數就是輸出座標。';
  else if(a===0&&b===0&&c===0&&d===0)why+='兩張卡都不移動，所以所有輸入都到原點。';
  else if(a*d-b*c===0)why+='兩張卡提供不了兩個獨立方向，部分輸入資訊會被壓掉。';
  if(w[0]===0&&w[1]===0)why+='目前輸出長度為 0，沒有指定方向。';
  el('feedback').textContent=why;
 }
 LA.bind(['a','b','c','d','input-preset'],update,{a:2,b:-1,c:1,d:1,'input-preset':'two-blue'});
})();

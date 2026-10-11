"use strict";
(() => {
 const {fmt,text,line,arrow,mat,mul,vec,bind}=LA;
 const el=id=>document.getElementById(id);
 const rotation=degrees=>{const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[[c,-s],[s,c]];};
 const stages=['input','right','stretch','output'];
 const names={input:'① 原始輸入',right:'② 先換方向',stretch:'③ 各方向拉伸',output:'④ 再換方向'};
 const tracked=[{name:'甲',v:[1,0],color:'#345ce8'},{name:'乙',v:[0,1],color:'#d96650'},{name:'丙',v:[-1,0],color:'#3b8a74'}];
 function update(){
  const phi=Number(el('phi').value),s=Number(el('sigma2').value),theta=Number(el('theta').value),stage=el('stage').value;
  el('phi-value').textContent=fmt(phi)+'°';el('sigma2-value').textContent=fmt(s);el('theta-value').textContent=fmt(theta)+'°';el('stage-value').textContent=names[stage];
  const right=rotation(-phi),stretch=mul([[2,0],[0,s]],right),A=mul(rotation(theta),stretch);
  const matrices={input:[[1,0],[0,1]],right,stretch,output:A},v=[1,1],current=mat(matrices[stage],v),out=mat(A,v);
  const actions=['還沒變換','轉 '+fmt(-phi)+'°','左右 × 2，上下 × '+fmt(s),'轉 '+fmt(theta)+'°'];
  let svg='';
  stages.forEach((key,i)=>{
   const cx=102+i*205,cy=195,scale=30,M=matrices[key],X=x=>cx+x*scale,Y=y=>cy-y*scale;
   const selected=key===stage;
   svg+='<rect x="'+(i*205+6)+'" y="8" width="193" height="387" rx="10" fill="'+(selected?'#fff8e3':'#ffffff70')+'" stroke="'+(selected?'#d96650':'#dce0e8')+'" stroke-width="'+(selected?2.5:1)+'"/>';
   svg+=text(cx,39,names[key],'svg-label','middle')+text(cx,68,actions[i],'svg-small','middle');
   svg+=line(X(-2.6),cy,X(2.6),cy)+line(cx,Y(-2.6),cx,Y(2.6));
   [1,2].forEach(t=>{svg+=line(X(t),cy-3,X(t),cy+3)+line(cx-3,Y(t),cx+3,Y(t));svg+=text(X(t),cy+19,t,'svg-small','middle');});
   let path='';for(let j=0;j<=128;j++){const a=j/128*Math.PI*2,w=mat(M,[Math.cos(a),Math.sin(a)]);path+=(j?'L':'M')+X(w[0])+' '+Y(w[1])+' ';}
   svg+='<path d="'+path+'Z" fill="#e5ebff" fill-opacity=".42" stroke="#61708a" stroke-width="2"/>';
   const w=mat(M,v);svg+=arrow(cx,cy,X(w[0]),Y(w[1]),'ink');
   const groups=[];
   tracked.forEach(t=>{const w=mat(M,t.v),match=groups.find(g=>Math.hypot(g.w[0]-w[0],g.w[1]-w[1])<1e-8);if(match)match.names.push(t.name);else groups.push({w,names:[t.name],color:t.color});});
   groups.forEach(g=>{const px=X(g.w[0]),py=Y(g.w[1]);svg+='<circle cx="'+px+'" cy="'+py+'" r="5" fill="'+(g.names.length>1?'#e5ef68':g.color)+'" stroke="#182849" stroke-width="1.2"/>';svg+=text(px,py-12,g.names.join('／'),'svg-label','middle');});
   tracked.forEach((t,j)=>{svg+=text(cx,310+j*23,t.name+' '+vec(mat(M,t.v)),'svg-small','middle');});
   svg+=text(cx,383,'黑箭頭 '+vec(w),'svg-label','middle');
  });
  svg+=text(410,424,'甲、乙、丙追原始圓周；黑箭頭另追 (1, 1)，起初在圓外。','svg-small','middle');
  el('drawing').innerHTML=svg;
  el('result-primary').textContent=names[stage]+'：'+vec(current);
  el('result-secondary').textContent='Av = '+vec(out)+'；長度倍率 (2, '+fmt(s)+')；秩 '+(s===0?'1':'2');
  const why={input:'高亮原始輸入。圓周上每一支箭頭長 1；黑箭頭 (1, 1) 比它們長，端點在圓外。',right:'高亮第一步：轉 '+fmt(-phi)+'°。圓外框沒變，但同一個甲、乙、丙已換位置。',stretch:'高亮中間：左右乘 2，上下乘 '+fmt(s)+'。這一步改變長度；請逐一比較同名的點。',output:'高亮最後一步：再轉 '+fmt(theta)+'°。這次保留長度，只改朝向。'};
  el('feedback').textContent=why[stage]+(s===0?' 上下乘 0，會把不同輸入壓到同一輸出；這個方向的資訊失去，不能唯一倒回去。':s===2?' 兩個倍率都是 2，所以最後仍是圓，半徑變成 2。':' 最後橢圓兩條半軸的長度是 2 與 '+fmt(s)+'。')+' 四格始終同時顯示；下拉選單只改高亮。';
  el('plot-desc').textContent=stages.map(key=>names[key]+'：'+tracked.map(t=>t.name+vec(mat(matrices[key],t.v))).join('、')+'；黑箭頭'+vec(mat(matrices[key],v))).join('。')+'。四格比例相同。';
 }
 bind(['phi','sigma2','theta','stage'],update,{phi:90,sigma2:1,theta:90,stage:'output'});
})();

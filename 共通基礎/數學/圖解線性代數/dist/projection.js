"use strict";
(() => {
  const $ = id => document.getElementById(id);
  function update() {
    const theta = Number($('theta').value), x = Number($('x').value), y = Number($('y').value);
    const a = theta * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], v = [x, y];
    const coefficient = x * u[0] + y * u[1], p = u.map(t => coefficient * t), r = v.map((t, i) => t - p[i]);
    const orthogonal = r[0] * u[0] + r[1] * u[1];
    $('theta-value').textContent = theta + '°';
    $('x-value').textContent = LA.fmt(x); $('y-value').textContent = LA.fmt(y);
    const {X, Y, axes} = LA.plane({cx:410, cy:235, scale:43, extent:4});
    let g = axes;
    g += LA.line(X(-4.2*u[0]),Y(-4.2*u[1]),X(4.2*u[0]),Y(4.2*u[1]),'tangent');
    g += LA.arrow(X(0),Y(0),X(v[0]),Y(v[1]),'blue');
    g += LA.arrow(X(0),Y(0),X(p[0]),Y(p[1]),'coral');
    g += LA.line(X(p[0]),Y(p[1]),X(v[0]),Y(v[1]),'tangent');
    g += `<circle cx="${X(v[0])}" cy="${Y(v[1])}" r="6" fill="#345ce8"/>`;
    g += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5" fill="#d96650" stroke="#fff" stroke-width="1.5"/>`;
    if (Math.hypot(...r) > .01 && Math.abs(coefficient) > .01) {
      const n = [-u[1],u[0]], along = coefficient > 0 ? -.25 : .25;
      const away = r[0]*n[0]+r[1]*n[1] > 0 ? .25 : -.25;
      const q1 = p.map((t,i)=>t+along*u[i]), q2=p.map((t,i)=>t+along*u[i]+away*n[i]), q3=p.map((t,i)=>t+away*n[i]);
      g += `<path d="M${X(q1[0])} ${Y(q1[1])}L${X(q2[0])} ${Y(q2[1])}L${X(q3[0])} ${Y(q3[1])}" fill="none" stroke="#182849" stroke-width="2"/>`;
    }
    g += LA.text(28,28,'藍色：原向量 v','svg-label') + LA.text(287,28,'珊瑚：投影 p','svg-label') + LA.text(557,28,'虛線：路與殘差 r','svg-label');
    g += LA.text(34,76,'u = ' + LA.vec(u),'svg-label') + LA.text(34,102,'綠箭頭：u 的正向','svg-small');
    g += LA.arrow(85,148,85+42*u[0],148-42*u[1],'green');
    g += LA.text(610,100,'v = ' + LA.vec(v),'svg-label') + LA.text(610,132,'p = ' + LA.vec(p),'svg-label') + LA.text(610,164,'r = ' + LA.vec(r),'svg-label');
    g += LA.text(410,431,'兩軸等比例；投影終點到 v 的殘差與路垂直。','svg-small','middle');
    $('drawing').innerHTML=g;
    $('result-primary').textContent='p = '+LA.vec(p)+'；v · u = '+LA.fmt(coefficient,3);
    $('result-secondary').textContent='r = '+LA.vec(r)+'；r · u = '+LA.fmt(orthogonal,6);
    let why = Math.hypot(x,y) < .001 ? '原向量是零：投影與殘差也都是零；此時不談零箭頭的夾角。' : Math.abs(coefficient) < .000001 ? '原向量與路正交，所以沿路係數為零，投影落在原點。' : Math.hypot(...r) < .000001 ? '原向量就在路上，所以投影等於原向量，沒有剩餘殘差。' : 'r · u = 0：拿掉沿路的部分，剩下的殘差與路垂直。';
    if(coefficient < -.000001) why += ' 係數為負，表示投影朝 u 的反方向；投影長度仍非負。';
    if(theta === 180) why += ' 這與 0° 是同一條投影直線，只是單位箭頭 u 反向。';
    $('feedback').textContent=why;
    $('plot-desc').textContent='路的方向 '+theta+' 度，單位向量 u = '+LA.vec(u)+'。原向量 v = '+LA.vec(v)+'，有號投影係數 '+LA.fmt(coefficient,3)+'，投影 p = '+LA.vec(p)+'，殘差 r = '+LA.vec(r)+'。'+why;
  }
  LA.bind(['theta','x','y'], update, {theta:0,x:3,y:2});
})();

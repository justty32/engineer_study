  // 本檔為 build-course.py 的互動來源；正式頁面由 audio-course.js 載入。
  const interfaceEta=376.730313564;
  function interfaceCalculate(q){
    const gamma=(q-1)/(q+1),tau=2*q/(q+1),er=10*gamma,et=10*tau;
    const hi=10/interfaceEta,hr=-er/interfaceEta,ht=et/(q*interfaceEta);
    const R=gamma*gamma,T=4*q/((q+1)*(q+1)),Si=100/(2*interfaceEta);
    return {q,gamma,tau,er,et,hi,hr,ht,R,T,Si,Sr:Si*R,St:Si*T};
  }
  function interfaceInput(id){
    const input=$(id),parsed=Number(input.value);
    const q=Number.isFinite(parsed)&&input.value.trim()!==''?Math.max(.25,Math.min(4,Math.round(parsed/.25)*.25)):.5;
    input.value=String(q);$(id+'-value').textContent=q.toFixed(2);return q;
  }
  const interfaceSigned=n=>Math.abs(n)<1e-12?'0.0000':n.toFixed(4);
  function interfaceAmplitude(){
    const d=interfaceCalculate(interfaceInput('eminterface-ratio'));
    [10,d.er,d.et].forEach((v,i)=>{
      const arrow=$('eminterface-dynamic-e'+i);arrow.setAttribute('y2',String(240-v*8));
      arrow.style.display=Math.abs(v)<1e-12?'none':'';
    });
    $('eminterface-zero').style.display=d.gamma===0?'':'none';
    $('eminterface-zero').removeAttribute('hidden');
    $('eminterface-ratio-result').textContent=`Γ = ${interfaceSigned(d.gamma)}；τ = ${d.tau.toFixed(4)}（無單位）`;
    $('eminterface-ratio-fields').textContent=`E 入／反／透：10.0000／${interfaceSigned(d.er)}／${d.et.toFixed(4)} V/m`;
    $('eminterface-ratio-magnetic').textContent=`H 入／反／透：${(1000*d.hi).toFixed(4)}／${interfaceSigned(1000*d.hr)}／${(1000*d.ht).toFixed(4)} mA/m`;
    const phase=d.gamma===0?'阻抗匹配，沒有反射。':d.gamma<0?'反射電場反相，H 反射分量為正。':'反射電場同相，H 反射分量為負。';
    $('eminterface-ratio-why').textContent=phase+`兩條邊界同時成立：10 + (${interfaceSigned(d.er)}) = ${d.et.toFixed(4)} V/m；Hᵢ + Hᵣ = Hₜ = ${(1000*d.ht).toFixed(4)} mA/m。`;
  }
  function interfacePower(){
    const d=interfaceCalculate(interfaceInput('eminterface-power-ratio'));
    ['R','T'].forEach(name=>{
      $('eminterface-point-'+name).setAttribute('cx',String(70+(d.q-.25)/3.75*480));
      $('eminterface-point-'+name).setAttribute('cy',String(360-d[name]*260));
    });
    $('eminterface-power-ratio-result').textContent=`R = ${d.R.toFixed(6)}；T = ${d.T.toFixed(6)}；和 = ${(d.R+d.T).toFixed(6)}`;
    $('eminterface-power-ratio-flux').textContent=`Sᵢ = ${d.Si.toFixed(8)}；|Sᵣ| = ${d.Sr.toFixed(8)}；Sₜ = ${d.St.toFixed(8)} W/m²`;
    $('eminterface-power-ratio-why').textContent=`入射減返回大小 = 透射：${(d.Si-d.Sr).toFixed(8)} W/m²。無損且只有反射／透射通道，因此 R + T = 1；此刻 Γ = ${interfaceSigned(d.gamma)}，功率比例沒有保留其相位正負。`;
  }
  $('eminterface-ratio').addEventListener('input',interfaceAmplitude);
  $('eminterface-ratio-reset').addEventListener('click',()=>{$('eminterface-ratio').value='.5';interfaceAmplitude();});
  $('eminterface-power-ratio').addEventListener('input',interfacePower);
  $('eminterface-power-reset').addEventListener('click',()=>{$('eminterface-power-ratio').value='.5';interfacePower();});
  interfaceAmplitude();interfacePower();

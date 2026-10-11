#!/usr/bin/env python3
"""以獨立數學線固定 oracle 驗產品輸出；不以 calculate 生成期望值。"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
import hashlib,json,re,subprocess,sys,math
from evidence import load,save
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';OUT=Path('/tmp/electromagnetics-technical-qa')
# 只對照量名／單位，不在本腳本重新實作產品算法。
MAP={
'00':{'force':('F_μN','μN')},
'01':{'ax':('Ax_N','N'),'ay':('Ay_N','N'),'magnitude':('原向量大小_N','N')},
'02':{'flux':('通量_Vm','V·m'),'divergence':('散度_V_m2','V/m²'),'endfield':('右端Ex_V_m','V/m')},
'03':{'field':('E_V_m','V/m'),'force':('對正1nC力_μN','μN')},
'04':{'field':('Ez_V_m','V/m'),'distance':('R_m','m')},
'05':{'field':('E_V_m','V/m'),'flux':('每米高圓柱通量_Vm','V·m')},
'06':{'potential':('V_V','V'),'field':('E_V_m','V/m')},
'07':{'potential':('V_V','V'),'field':('Ex_V_m','V/m')},
'08':{'e2t':('E2x_V_m','V/m'),'e2n':('E2z_V_m','V/m'),'dnormal':('D1n_D2n_pC_m2','pC/m²'),'sigma':('σb_pC_m2','pC/m²'),'angle':('θ2_度','°')},
'09':{'capacitance':('C_pF','pF'),'charge':('Q_nC','nC'),'energy':('U_nJ','nJ')},
'10':{'resistance':('R_Ω','Ω'),'voltage':('V_V','V'),'power':('P_W','W'),'density':('J_A_m2','A/m²')},
'11':{'force':('F_μN','μN'),'magneticPower':('磁力功率_W','W')},
'12':{'field':('B_μT','μT'),'hfield':('H_A_m','A/m')},
'13':{'hfield':('H_A_m','A/m'),'field':('B_T','T'),'flux':('Φ_μWb','μWb')},
'14':{'potential':('Ay_Wb_m','Wb/m'),'field':('Bz_T','T')},
'15':{'emf':('ε_V','V'),'current':('I_A','A'),'force':('F_制動力大小_N','N'),'power':('P_W','W')},
'16':{'linkage':('λ_Wb_turn','Wb·turn'),'energy':('U_J','J')},
'17':{'capacitance':('C_pF','pF'),'current':('Id_μA','μA')},
'18':{'hfield':('H0_A_m','A/m'),'powerDensity':('Savg_W_m2','W/m²')},
'19':{'ex':('Ex_V_m','V/m'),'ey':('Ey_V_m','V/m'),'phase':('δ_度','°')},
'20':{'depth':('δ_μm','μm'),'alpha':('α_Np_m','1/m'),'ratio':('σ除以ωε0','')},
'21':{'gamma':('Γ',''),'transmitted':('Et_V_m','V/m'),'reflectance':('R',''),'transmittance':('T','')},
'22':{'critical':('θc_度','°'),'snell':('sinθt',''),'thetaT':('θt_度','°')},
'23':{'impedance':('Z0_Ω','Ω'),'velocity':('vp_m_s','m/s'),'delay':('td_ns','ns')},
'24':{'gamma':('Γ',''),'reflected':('V−_Vpeak','V'),'voltage':('VL_Vpeak','V'),'current':('IL_Apeak','A'),'incidentPower':('Pinc_W','W'),'reflectedPower':('Pref_W','W'),'loadPower':('Pload_W','W'),'vswr':('VSWR','')},
'25':{'transformer':('Zt_Ω','Ω'),'input':('Zin_Ω','Ω')},
'26':{'cutoff':('fc_GHz','GHz'),'wavelength':('λg_mm','mm'),'groupVelocity':('vg_m_s','m/s'),'attenuation':('α_Np_m','1/m')},
'27':{'wavelength':('λ_m','m'),'length':('ℓ_m','m')}
}
oracle=load(str(ROOT/'數學驗收.json'));fixtures={r['id']:r['獨立重算'] for r in oracle.rows if r.get('id','').isdigit()};checks=[]
def compare(cid,mode,metrics,origin,file='',rendered=False):
 expected=fixtures[cid][mode]['expected'];errs=[];quantities=[]
 for key,value in metrics.items():
  if key not in MAP[cid]:errs.append('unmapped metric '+key);continue
  oraclekey,unit=MAP[cid][key]
  if oraclekey not in expected:errs.append('missing independent oracle '+oraclekey);continue
  want=expected[oraclekey];got=value['value']
  if isinstance(want,(int,float)):
   try:valid=math.isfinite(float(got)) and abs(float(got)-want)<=max(1e-9,abs(want)*(1e-4 if rendered else 1e-7))
   except (ValueError,TypeError):valid=False
  elif want=='∞':valid=got=='∞'
  elif cid=='22':valid='無實數角' in str(got)
  elif cid=='26':valid='不適用' in str(got)
  else:valid=got==want
  expectedunit=unit if isinstance(want,(int,float)) else ''
  if value['unit']!=expectedunit:errs.append(f'{key}: unit {value["unit"]!r} != {expectedunit!r}')
  if not valid:errs.append(f'{key}: {got} != {want}')
  quantities.append({'key':key,'oracle':oraclekey,'expected':want,'actual':got,'unit':value['unit'],'pass':valid})
 checks.append({'id':cid,'mode':mode,'origin':origin,'file':file,'status':'FAIL' if errs else 'PASS','quantities':quantities,'errors':errs})
requests=[{'id':cid,'mode':mode,'input':f['input']} for cid,fs in fixtures.items() for mode,f in fs.items() if mode in ('default','min','max')]
script="const fs=require('fs'),a=require(process.argv[1]);const req=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(req.map(r=>({...r,result:a.calculate(r.id,r.input)}))));"
models=json.loads(subprocess.run(['node','-e',script,str(DIST/'app.js')],input=json.dumps(requests),capture_output=True,text=True,check=True).stdout)
for r in models:compare(r['id'],r['mode'],r['result']['metrics'],'API')
for batch in sys.argv[1:]:
 for r in load(str(OUT/(batch+'-states.json'))).rows:
  if r.get('label') not in ('default','min','max'):continue
  cid=r['file'][:2];metrics={}
  for v in r['readouts']:
   key=v['key'];unit=r['model']['metrics'][key]['unit'];text=v['value'].strip()
   # 顯示值與 raw data-value 分開驗；單位須真正出現在strong內。
   if unit and not text.endswith(unit):metrics[key]={'value':'MISSING UNIT','unit':unit};continue
   text=text[:-len(unit)].strip() if unit else text
   try:value=float(text.replace('−','-'))
   except ValueError:value=text
   metrics[key]={'value':value,'unit':unit}
  compare(cid,r['label'],metrics,'DOM '+batch,r['file'],True)
appsha=hashlib.sha256((DIST/'app.js').read_bytes()).hexdigest()
save(OUT/'numeric.json',checks,{'app_sha256':appsha,'oracle_sha256':hashlib.sha256((ROOT/'數學驗收.json').read_bytes()).hexdigest(),'method':'獨立數學固定default/min/max；API原值與DOM可見值各自比對'})
failed=[r for r in checks if r['status']=='FAIL']
print({'states':len(checks),'quantities':sum(len(r['quantities']) for r in checks),'failed':len(failed),'app_sha256':appsha})
for r in failed:print(r['id'],r['mode'],r['origin'],r['errors'])
sys.exit(bool(failed))

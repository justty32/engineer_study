const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const context={document:{getElementById:()=>null},module:{exports:{}}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../units.js'),'utf8'),context);const e=context.module.exports;
const evaluate=(left,op,right,power=1,coefficient=1,env={v:3,a:2,t:2})=>e.evaluate(e.build({left,op,right,power,coefficient}).root,env);
const fixtures=[
 ['constant acceleration displacement',evaluate('vt','add','half_at2'),[1,0],10],
 ['constant acceleration velocity',evaluate('v','add','at'),[1,-1],7],
 ['half acceleration time squared',evaluate('a','multiply','t',2,.5),[1,0],4],
 ['incorrect dimensionless coefficient',evaluate('v','multiply','t',1,2,{v:3,a:0,t:2}),[1,0],12],
 ['division gives acceleration',evaluate('v','divide','t'),[1,-2],1.5],
 ['negative signed motion',evaluate('vt','add','half_at2',1,1,{v:-5,a:-4,t:5}),[1,0],-75],
 ['zero time motion',evaluate('vt','add','half_at2',1,1,{v:3,a:2,t:0}),[1,0],0],
 ['dimensionless quotient',evaluate('v','divide','v'),[0,0],1],
 ['squaring a branch',evaluate('one','multiply','t',2),[0,2],4],
];
for(const [name,result,dim,value] of fixtures){assert.deepStrictEqual(Array.from(result.dim),dim,name);assert(Math.abs(result.value-value)<1e-12,name);assert(!result.dimensionError&&!result.domainError,name);}
const bad=evaluate('v','add','t');assert.strictEqual(bad.dim,null);assert(bad.dimensionError);assert(Number.isNaN(bad.value));
const zero=evaluate('v','divide','t',1,1,{v:3,a:2,t:0});assert.deepStrictEqual(Array.from(zero.dim),[1,-2]);assert(zero.domainError);assert(Number.isNaN(zero.value));
const wrong=evaluate('v','multiply','t');assert(!e.equal(wrong.dim,e.targets.velocity.dim));
const finite=evaluate('v','divide','a',1,1,{v:3,a:0,t:2});assert(finite.domainError);
console.log(JSON.stringify({numericFixtures:fixtures.length,invalidCases:4,status:'passed'},null,2));

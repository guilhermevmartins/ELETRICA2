const assert=require('node:assert/strict');
const D=require('../assets/digital-logica.js');
// Tabelas esperadas independentes das expressões usadas pelo simulador: AB=00,01,10,11.
const truth={AND:[0,0,0,1],OR:[0,1,1,1],NAND:[1,1,1,0],NOR:[1,0,0,0],XOR:[0,1,1,0],XNOR:[1,0,0,1]};
for(const [gate,rows] of Object.entries(truth))for(let i=0;i<4;i++)assert.equal(D.gates[gate](i>>1,i&1),rows[i],gate+' '+i);
assert.deepEqual([D.gates.NOT(0),D.gates.NOT(1)],[1,0]);assert.deepEqual([D.gates.BUF(0),D.gates.BUF(1)],[0,1]);
for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++){
 const result=D.adder(a,b,c);assert.equal(2*result.carry+result.sum,a+b+c);
 assert.equal(D.mux(a,b,c),[a,b][c]);
}
for(let i=0;i<4;i++){const out=D.decoder(i>>1,i&1);assert.equal(out.reduce((a,b)=>a+b),1);assert.equal(out.indexOf(1),i);}
for(let i=0;i<16;i++){const result=D.priority([0,1,2,3].map(b=>(i>>b)&1));assert.equal(result.valid,Number(i>0));if(i)assert.equal(result.code,Math.floor(Math.log2(i)));}
for(const q of [0,1])for(const a of [0,1])for(const b of [0,1]){
 for(const type of ['d','jk','t'])assert.equal(D.memory(type,q,{a,b,en:1},false),q,'sem borda: '+type);
 assert.equal(D.memory('d',q,{a,b,en:1},true),a);
 assert.equal(D.memory('jk',q,{a,b,en:1},true),[[q,0],[1,1-q]][a][b]);
 assert.equal(D.memory('t',q,{a,b,en:1},true),a?1-q:q);
 assert.equal(D.memory('latch',q,{a,b,en:0},false),q);assert.equal(D.memory('latch',q,{a,b,en:1},false),a);
 assert.equal(D.memory('sr',q,{a,b},false),[[q,0],[1,null]][a][b]);
}
assert.equal(D.memory('sr',null,{a:0,b:0},false),null);assert.equal(D.memory('sr',null,{a:1,b:0},false),1);
assert.equal(D.system('counter',15,{enable:1},true),0);assert.equal(D.system('counter',15,{enable:0},true),15);
let value=0;for(const serial of [1,0,1,1])value=D.system('shift',value,{enable:1,serial},true);assert.equal(value,11);
assert.equal(D.system('shift',15,{enable:1,serial:0},true),14);
for(const type of ['counter','shift','fsm'])assert.equal(D.system(type,2,{enable:1,serial:0},false),2);
assert.deepEqual([0,1,2].map(v=>D.system('fsm',v,{enable:1},true)),[1,2,0]);
console.log('OK: tabelas completas, aritmética, seleção, prioridade, memória por nível/borda, estado proibido, contagem, deslocamento e estados.');

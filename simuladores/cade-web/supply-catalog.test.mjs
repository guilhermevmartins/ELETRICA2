import assert from 'node:assert/strict';
import {simulate} from './engine.mjs';
import {topology} from './topology.mjs';
const w=(a,p,b,q)=>({from:{id:a,port:p},to:{id:b,port:q}});
const load={id:'h',type:'lamp'};
for(const [type,ports] of Object.entries({native32872:[0,1],native32906:[0,1],native32870:[0,1],native32879:[0,1],native32869:[0,3],native32882:[0,3],native32875:[0,1],native33046:[0,1]})){
 const c={components:[{id:'s',type},load],wires:[w('s',ports[0],'h',0),w('s',ports[1],'h',1)]};
 assert.equal(simulate(c).active.h,true,type);
 const rails=topology(c.components[0]).rails,pe=rails.indexOf('PE');
 if(pe>=0){c.wires[1]=w('s',pe,'h',1);assert.equal(simulate(c).active.h,false,type+' PE não é retorno');}
 c.wires.push(w('h',0,'h',1));assert.equal(simulate(c).shortCircuit,true,type+' curto');
}
for(const types of [['native32873','native32874'],['native32876','native32877']]){
 assert.equal(simulate({components:[{id:'a',type:types[0]},{id:'b',type:types[1]},load],wires:[w('a',0,'h',0),w('b',0,'h',1)]}).active.h,true);
}
const cascade={components:[load,{id:'r',type:'native32997'},{id:'t',type:'native32995'},{id:'s',type:'phaseN'}],wires:[w('s',0,'t',0),w('s',1,'t',1),w('t',2,'r',2),w('t',3,'r',3),w('r',0,'h',0),w('r',1,'h',1)]};
assert.equal(simulate(cascade).active.h,true,'transformador e retificador em ordem inversa');
const mixed=structuredClone(cascade);mixed.wires[5]=w('s',1,'h',1);assert.equal(simulate(mixed).active.h,false,'isolamento AC/DC');
const missing=structuredClone(cascade);missing.wires.shift();assert.equal(simulate(missing).active.h,false,'primário incompleto');
const same=structuredClone(cascade);same.wires[1].from.port=0;assert.equal(simulate(same).active.h,false,'mesmo potencial');
const ac={components:[{id:'s',type:'phase3'},{id:'t',type:'native33045'},{id:'m',type:'motor3'}],wires:[0,1,2].flatMap(p=>[w('s',p,'t',p),w('t',p+3,'m',p)])};
assert.equal(simulate(ac).active.m,true);assert.equal(simulate(ac).motorDirections.m,1);
[ac.wires[0].from.port,ac.wires[2].from.port]=[1,0];assert.equal(simulate(ac).motorDirections.m,-1);
const legacy={components:[{id:'a',type:'phase',nativeCommand:32876},{id:'b',type:'neutral',nativeCommand:32877},load],wires:[w('a',0,'h',0),w('b',0,'h',1)]};
assert.equal(simulate(legacy).active.h,true,'DC legado');
legacy.components[1].nativeCommand=32874;assert.equal(simulate(legacy).active.h,false,'DC não usa neutro AC');
for(const type of ['native32883','native33042'])assert.deepEqual(topology({type}).rails,['PE']);
console.log('OK: alimentação AC/DC, bateria, PE, curto, transformadores, retificador em cascata, isolamento, falta de alimentação e compatibilidade.');

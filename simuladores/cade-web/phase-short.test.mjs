import assert from 'node:assert/strict';
import {simulate} from './engine.mjs';
const w=(a,p,b,q)=>({from:{id:a,port:p},to:{id:b,port:q}});
const circuit={components:[{id:'s',type:'phase3N'},{id:'m',type:'motor3'},
 ...[1,2].flatMap(i=>[{id:'k'+i,type:'coil',tag:'KM'+i},{id:'c'+i,type:'contactor3',ref:'KM'+i},{id:'b'+i,type:'buttonNO'},{id:'hold'+i,type:'contactNO',ref:'KM'+i}])],wires:[
 ...[1,2].flatMap(i=>[w('s',0,'b'+i,0),w('b'+i,1,'k'+i,0),w('s',0,'hold'+i,0),w('hold'+i,1,'k'+i,0),w('k'+i,1,'s',3)]),
 ...[0,1,2].flatMap(p=>[w('s',p,'c1',p),w('c1',p+3,'m',p),w('s',p,'c2',p),w('c2',p+3,'m',2-p)])]};
let state=simulate(circuit,{}, {b1:true});assert.equal(state.active.m,true);assert.equal(state.shortCircuit,false);
state=simulate(circuit,state,{});assert.equal(state.relays.KM1,true);
state=simulate(circuit,state,{b2:true});
assert.equal(state.shortCircuit,true);assert.equal(state.shortBetweenPhases,true);assert.equal(state.faultMessage,'Curto entre fases');
assert.equal(state.active.c1,true);assert.equal(state.active.c2,true);assert.equal(state.active.k1,true);assert.equal(state.active.k2,true);assert.equal(state.active.m,false);
assert.equal(simulate(circuit,state,{}),state,'curto permanece após soltar o botão');
assert.equal(simulate(circuit).shortCircuit,false,'reinício limpa a falha');
assert.equal(simulate(circuit,{}, {b1:true,b2:true}).shortBetweenPhases,true,'fechamento simultâneo');
const safe=structuredClone(circuit);
for(const i of [1,2]){safe.components.push({id:'inter'+i,type:'contactNC',ref:'KM'+(3-i)});for(const wire of safe.wires)if(wire.to.id==='k'+i&&wire.to.port===0)wire.to={id:'inter'+i,port:0};safe.wires.push(w('inter'+i,1,'k'+i,0));}
state=simulate(safe,{}, {b1:true});state=simulate(safe,state,{b2:true});assert.equal(state.shortCircuit,false);assert.equal(state.relays.KM1,true);assert.equal(state.relays.KM2,false);
const direct={components:[{id:'s',type:'phaseN'}],wires:[w('s',0,'s',1)]};state=simulate(direct);assert.equal(state.shortCircuit,true);assert.equal(state.shortBetweenPhases,false);
console.log('OK: reversão sem intertravamento registra curto entre fases, preserva os dois contatores, exige reinício e respeita intertravamento.');

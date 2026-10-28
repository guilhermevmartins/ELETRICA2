import assert from 'node:assert/strict';
import {simulate} from './engine.mjs';
import {topology} from './topology.mjs';
import {removeSelection} from './circuit-edit.mjs';
import {definition,terminalLabel} from './components.mjs';
const wire=(id,a,p,b,q)=>({id,from:{id:a,port:p},to:{id:b,port:q}});
const circuit={components:[
 {id:'s',type:'phase3'},{id:'n',type:'neutral'},
 {id:'f',type:'native32865',tag:'F1'},
 {id:'nc',type:'contactNC',ref:'F1'}, {id:'no',type:'contactNO',ref:'F1'},
 {id:'k',type:'coil',tag:'KM1'}, {id:'km',type:'contactor3',ref:'KM1'},
 {id:'m',type:'motor3'}, {id:'h',type:'lamp'},
 ],wires:[wire('a','s',0,'nc',0),wire('b','nc',1,'k',0),wire('c','k',1,'n',0),
 wire('d','s',0,'no',0),wire('e','no',1,'h',0),wire('g','h',1,'n',0),
 ...[0,1,2].flatMap(p=>[wire('in'+p,'s',p,'km',p),wire('out'+p,'km',p+3,'f',p),wire('motor'+p,'f',p+3,'m',p)])]};
let state=simulate(circuit);
assert.equal(state.active.m,true); assert.equal(state.active.h,false); assert.equal(state.shortCircuit,false);
state=simulate(circuit,state,{f:true});
assert.equal(state.relays.F1,true); assert.equal(state.active.nc,false);assert.equal(state.active.no,true);
assert.equal(state.active.k,false);assert.equal(state.active.m,false);assert.equal(state.active.h,true);
state=simulate(circuit,state,{f:false});
assert.equal(state.active.m,true); assert.equal(state.active.h,false);
assert.deepEqual(topology({type:'native32865'}).ports.map(p=>[p.x,p.y]),topology({type:'contactor3'}).ports.map(p=>[p.x,p.y]));
assert.equal(definition('native32865').prefix,'F');
assert.equal(terminalLabel({type:'contactNC',nativeCommand:32928},0),'95');
const edit={components:[{id:'j',type:'junction'},{id:'orphan',type:'junction'},{id:'k',type:'coil'}],wires:[wire('a','j',0,'k',0),wire('b','j',0,'k',1)]};
const before=structuredClone(edit);
removeSelection(edit,'a');assert(edit.components.some(c=>c.id==='j'));assert(!edit.components.some(c=>c.id==='orphan'));
removeSelection(edit,'b');assert.deepEqual(edit.components.map(c=>c.id),['k']);
removeSelection(before,'j');assert.equal(before.wires.length,0);assert.deepEqual(before.components.map(c=>c.id),['k']);
console.log('OK: térmico conduz, dispara NF/NA, desliga contator/motor, rearma; terminais alinhados; exclusão de fios/junções.');

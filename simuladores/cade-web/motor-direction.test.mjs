import assert from 'node:assert/strict';
import {simulate} from './engine.mjs';
const run=order=>simulate({components:[{id:'s',type:'phase3'},{id:'m',type:'motor3'}],wires:order.map((port,i)=>({from:{id:'s',port},to:{id:'m',port:i}}))});
for(const order of [[0,1,2],[1,2,0],[2,0,1]])assert.equal(run(order).motorDirections.m,1);
for(const order of [[0,2,1],[2,1,0],[1,0,2]])assert.equal(run(order).motorDirections.m,-1);
for(const order of [[],[0,1],[0,0,2]]){assert.equal(run(order).active.m,false);assert.equal(run(order).motorDirections.m,undefined);}
console.log('OK: seis sequências de fases, motor desligado, falta de fase e fases repetidas.');

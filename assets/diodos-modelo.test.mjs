import test from 'node:test';
import assert from 'node:assert/strict';
import {seriesDiode,zenerCircuit,rectified,diodeTypes} from './diodos-modelo.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} ≠ ${b}`);
test('Circuito em série conserva tensão e limita corrente, inclusive LED e reversa',()=>{
 for(const voltage of [0,.3,.7,2,5,12])for(const resistance of [100,330,1000,2200])for(const drop of [.7,2]){
  const m=seriesDiode(voltage,resistance,drop);near(m.diodeVoltage+m.resistorVoltage,voltage);assert.ok(m.current>=0);
  const reverse=seriesDiode(voltage,resistance,drop,true);near(reverse.current,0);near(reverse.diodeVoltage,-voltage);
 }
 near(seriesDiode(5,1000,2).current,.003);
});
test('Zener abaixo e acima da ruptura: leis de Kirchhoff e dissipação',()=>{
 for(const v of [0,3,5.1,6,9,12])for(const r of [100,330,2200]){
  const m=zenerCircuit(v,r);near(m.sourceCurrent,m.loadCurrent+m.zenerCurrent);near(v,m.output+m.sourceCurrent*r);assert.ok(m.output<=v&&m.output<=5.1);near(m.power,m.output*m.zenerCurrent);
 }
 assert.equal(zenerCircuit(3).regulating,false);near(zenerCircuit(9).output,5.1);assert.ok(zenerCircuit(12,100).power<.5);
});
test('Retificação corta o semiciclo negativo e desconta a queda no pico',()=>{
 near(rectified(0),0);near(rectified(Math.PI/2),7.3);near(rectified(3*Math.PI/2),0);near(rectified(Math.PI/2,.4),0);
});
test('Catálogo identifica famílias sem duplicar entradas e usa experiências existentes',()=>{
 assert.equal(diodeTypes.length,21);assert.equal(new Set(diodeTypes.map(t=>t.id)).size,21);
 for(const t of diodeTypes){assert.ok(t.how&&t.use&&t.detail);if(t.lab)assert.ok(['common','led','zener','rectifier'].includes(t.lab));}
});

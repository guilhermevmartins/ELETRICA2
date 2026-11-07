import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Mega2560,PINS,parseHex} from './mega-core.mjs';
const hex=name=>fs.readFileSync(new URL(`examples/${name}.hex`,import.meta.url),'utf8');
function run(mega,seconds){for(let i=0;i<Math.round(seconds*20000);i++)mega.advance(800);}
assert.equal(PINS.length,70);assert.equal(new Set(PINS.map(p=>p.port+p.bit)).size,70);
assert.throws(()=>parseHex(':00000001FF'));assert.throws(()=>parseHex(hex('blink').replace(':10000000',':11000000')));
const blink=new Mega2560(hex('blink'));assert.equal(blink.cpu.data.length,0x2200);assert.equal(blink.cpu.pc22Bits,true);
run(blink,.02);assert.equal(blink.state(13),1);run(blink,.5);assert.equal(blink.state(13),0);run(blink,.5);assert.equal(blink.state(13),1);
console.log('PASS: Mega RAM, 22-bit PC, real Arduino delay()/timer0, D13 toggles');
let input=0,serial='';const button=new Mega2560(hex('button'),{read:p=>p.id===22?input:undefined,serial:(_,s)=>serial+=s});
run(button,.15);assert.equal(button.state(13),0);input=5;run(button,.15);assert.equal(button.state(13),1);assert.match(serial,/0\r?\n/);assert.match(serial,/1\r?\n/);
console.log('PASS: actual digitalRead(D22), digitalWrite(D13), Serial');
let voltage=2.5,high=0,low=0;serial='';const analog=new Mega2560(hex('analog'),{read:p=>p.id===69?voltage:undefined,serial:(_,s)=>serial+=s});
run(analog,.15);for(let i=0;i<2000;i++){analog.advance(80);if(analog.state(44)===1)high++;else low++;}
assert.ok(high>500&&low>500,`PWM high=${high} low=${low}`);assert.match(serial,/512/);
voltage=5;run(analog,.2);assert.equal(analog.state(44),1);voltage=0;run(analog,.2);assert.equal(analog.state(44),0);
console.log('PASS: actual analogRead(A15)/MUX5, PWM timer5 D44 and 0/100% duty');

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{console.log('DIALOG',d.message());await d.accept();});
 await page.goto(process.env.CHIP_QA_URL||'http://127.0.0.1:8034/simuladores/falstad-web/index.html?lang=pt');
 await page.waitForFunction(()=>window.CircuitJS1&&document.querySelector('#lab-menu-chip'));
 const loaded=await page.evaluate(async()=>{
  const {buildChip,functionalCodes}=await import('./mega/chip-models.mjs');
  window.chipTest={buildChip,functionalCodes};
  const results=[];
  for(const code of functionalCodes){const model=buildChip(code);CircuitJS1.importCircuit('$ 1 0.000005 10 50 5 50\n'+model.dump(),false);CircuitJS1.importCircuit(CircuitJS1.exportCircuit(),false);const elements=CircuitJS1.getElements();if(elements[0]?.getPostCount()!==model.pins.length)throw Error(code+' terminals lost');results.push([code,elements.map(e=>[e.getType(),e.getPostCount()])]);}
  return results;
 });
 for(const [code,elements] of loaded)assert.equal(elements[0]?.[0],'CustomCompositeElm',code);
 console.log('PASS: 31 native chips load and roundtrip with all terminals');
 assert.deepEqual(errors,[]);
 await page.evaluate(()=>{
  chipTest.load=(code,values={},extras='')=>{
   const m=chipTest.buildChip(code),counts={2:0,3:0},coords={};
   m.pins.forEach(p=>coords[p.n]=[p.side===2?192:416,128+32*counts[p.side]++]);
   let text='$ 1 0.000005 10 50 5 50\n'+m.dump();
   for(const [n,v] of Object.entries(values)){const [x,y]=coords[n];text+=`418 ${x} ${y} ${x-48} ${y} 0 1 40 ${v} 0 0 0.5 TEST_${n}\n`;}
   CircuitJS1.importCircuit(text+extras,false);chipTest.model=m;CircuitJS1.setSimRunning(true);
   chipTest.values=values;
  };
  chipTest.step=async(values={})=>{
   Object.assign(chipTest.values,values);
   for(const [n,v] of Object.entries(chipTest.values))CircuitJS1.setExtVoltage('TEST_'+n,v);
   CircuitJS1.setSimRunning(true);
   await new Promise(r=>setTimeout(r,80));
   CircuitJS1.setSimRunning(false);
   const e=CircuitJS1.getElements().find(e=>e.getType()==='CustomCompositeElm');
   return Object.fromEntries(chipTest.model.pins.map((p,i)=>[p.n,e.getVoltage(i)]));
  };
 });
 const load=(code,values,extras)=>page.evaluate(([c,v,e])=>chipTest.load(c,v,e),[code,values,extras]);
 const step=v=>page.evaluate(v=>chipTest.step(v),v);
 const high=(v,label)=>assert.ok(v>4.5,label+' HIGH: '+v),low=(v,label)=>assert.ok(v<.2,label+' LOW: '+v);
 for(const [code,op,num,channels] of [['4011','nand',2,4],['4081','and',2,4],['4082','and',4,2],['4071','or',2,4],['4001','nor',2,4],['4070','xor',2,4],['4030','xor',2,4],['4069','not',1,6],['4009','not',1,6],['4093','nand',2,4]]){
  const names=Array.from({length:channels},(_,g)=>Array.from({length:num},(_,i)=>(g+1)+String.fromCharCode(65+i))).flat();
  await load(code,Object.fromEntries(names.map(n=>[n,0])));
  for(let mask=0;mask<2**num;mask++){const values=Object.fromEntries(names.map((n,i)=>[n,(mask>>(i%num)&1)*5])),r=await step(values),ones=Array.from({length:num},(_,i)=>mask>>i&1).filter(Boolean).length;
   const expected=op==='nand'?ones<num:op==='and'?ones===num:op==='nor'?ones===0:op==='or'?ones>0:op==='not'?ones===0:ones===1;
   for(let g=1;g<=channels;g++)(expected?high:low)(r[g+'Y'],code+' '+g+'Y');
  }
 }
 console.log('PASS: every gate in 10 packages, exhaustive truth tables');
 for(const code of ['4013','4027']){
  const inp=code==='4013'?{D:5}:{J:5,K:5};const vals={};for(let g=1;g<=2;g++)for(const [n,v] of Object.entries({...inp,CLK:0,SET:0,RST:5}))vals[g+n]=v;
  await load(code,vals);let r=await step();low(r['1Q'],code+' reset');high(r['1nQ'],code+' reset nQ');
  await step({'1RST':0,'2RST':0});r=await step({'1CLK':5});high(r['1Q'],code+' clock');low(r['2Q'],code+' other section');
  await step({'1CLK':0});r=await step({'1CLK':5,...(code==='4013'?{'1D':0}:{})});low(r['1Q'],code+' second edge');
 }
 console.log('PASS: dual D/JK capture, toggle, independent sections');
 for(const code of ['4017','4026','4040','4518','4029']){
  const prefix=code==='4518'?'1':'';const vals=code==='4029'?{CLK:0,nCE:0,UP:5,BIN:0,LOAD:5,P0:0,P1:0,P2:0,P3:0}:code==='4518'?{'1CLK':0,'1EN':5,'1RST':5,'2CLK':0,'2EN':5,'2RST':5}: {CLK:0,RST:5,...(code==='4040'?{}:{INH:0}),...(code==='4026'?{DE:5}:{})};
  await load(code,vals);await step();await step(code==='4029'?{LOAD:0}:{[prefix+'RST']:0});
  for(let n=1;n<=11;n++){let r=await step({[prefix+'CLK']:5});r=await step({[prefix+'CLK']:0});const expected=code==='4040'?n:n%10;
   if(code==='4017')for(let q=0;q<10;q++)(q===expected?high:low)(r['Q'+q],code+' count '+n);
   else if(code==='4026'){const digits=['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];[...'abcdefg'].forEach((s,i)=>(digits[expected][i]==='1'?high:low)(r[s],code+' digit '+expected));}
   else for(let i=0;i<(code==='4040'?12:4);i++)(expected>>i&1?high:low)(r[prefix+'Q'+(code==='4040'?i+1:i)],code+' count '+n);
  }
 }
 console.log('PASS: all counters and 4026 decode, decade rollover');
 for(const code of ['4021','74HC95']){
  const w=code==='4021'?8:4,vals=code==='4021'?{DS:0,CLK:0,LOAD:5}:{DS:0,CS:0,CP:5,MODE:5};for(let i=0;i<w;i++)vals['P'+i]=5;
  await load(code,vals);await step();let r=await step(code==='4021'?{}:{CP:0});high(r['Q'+(w-1)],code+' parallel load');
  await step(code==='4021'?{LOAD:0}:{MODE:0});
  for(let i=0;i<w;i++){await step(code==='4021'?{CLK:5}:{CS:5});r=await step(code==='4021'?{CLK:0}:{CS:0});}
  low(r['Q'+(w-1)],code+' serial zeros');
 }
 console.log('PASS: parallel load and serial shifting');
 await load('LM7809',{IN:12,GND:0});let r=await step();assert.ok(Math.abs(r.OUT-9)<.02,'7809 9V');r=await step({IN:8});assert.ok(Math.abs(r.OUT-6)<.02,'7809 dropout');
 for(const code of ['LM741','LM324','LM392']){await load(code,{'1PLUS':2},'w 416 128 192 160 0\n');const r=await step();assert.ok(Math.abs(r['1OUT']-2)<.02,code+' follower '+r['1OUT']);}
 console.log('PASS: regulator and operational amplifier feedback');
 await load('4093',{'1A':0,'1B':5});await step();r=await step({'1A':2.5});high(r['1Y'],'Schmitt rising deadband');await step({'1A':5});r=await step({'1A':2.5});low(r['1Y'],'Schmitt falling deadband');
 await load('4028',{A:0,B:0,C:0,D:0});
 for(let n=0;n<16;n++){const r=await step(Object.fromEntries(['A','B','C','D'].map((s,i)=>[s,(n>>i&1)*5])));for(let i=0;i<10;i++)(n===i?high:low)(r['Q'+i],'4028 '+n);}
 await load('4511',{A:5,B:0,C:0,D:0,LE:0,nLT:5,nBI:5});r=await step();high(r.b,'4511 one');low(r.a,'4511 one');await step({LE:5});r=await step({A:0});low(r.a,'4511 latch');r=await step({nBI:0});low(r.b,'4511 blank');r=await step({nLT:0});for(const n of 'abcdefg')high(r[n],'4511 test');
 await load('4019',{KA:0,KB:0,'1A':5,'1B':0});r=await step({KA:5});high(r['1Y'],'4019 A');r=await step({KA:0,KB:5});low(r['1Y'],'4019 B');
 const loadOut='r 416 128 416 192 0 10000\ng 416 192 416 224 0 0\n';
 await load('4066',{'1A':3,'1EN':0},loadOut);r=await step();low(r['1B'],'4066 off');r=await step({'1EN':5});assert.ok(r['1B']>2.9,'4066 on');
 for(const code of ['4051','4052']){await load(code,{A:0,B:0,...(code==='4051'?{C:0}:{}),INH:0,X0:1,X1:3},loadOut);r=await step();assert.ok(Math.abs(r.XCOM-1)<.1,code+' channel0');r=await step({A:5});assert.ok(Math.abs(r.XCOM-3)<.1,code+' channel1');r=await step({INH:5});low(r.XCOM,code+' inhibit');}
 for(const code of ['LM339','LM392']){
  const group=code==='LM339'?1:2,y=128+(group-1)*32;
  await load(code,{[group+'PLUS']:1,[group+'MINUS']:2},`r 416 ${y} 480 ${y} 0 10000\nR 480 ${y} 528 ${y} 0 0 40 5 0 0 0.5\n`);r=await step();low(r[group+'OUT'],code+' sinking');r=await step({[group+'PLUS']:3});high(r[group+'OUT'],code+' released');
 }
 await load('555',{VCC:5,GND:0,nRST:5,TRIG:0,THR:0});r=await step();high(r.OUT,'555 trigger');r=await step({TRIG:5,THR:5});low(r.OUT,'555 threshold');r=await step({TRIG:0,THR:0});high(r.OUT,'555 retrigger');r=await step({nRST:0});low(r.OUT,'555 reset');
 console.log('PASS: hysteresis, decoders, latch, selectors, analog switches, comparators, 555');
 await load('4011',{'1A':5,'1B':0});await step();
 const saved=await page.evaluate(()=>CircuitJS1.exportCircuit());
 await page.evaluate(s=>CircuitJS1.importCircuit(s,false),saved);r=await step();high(r['1Y'],'save/reopen');
 await page.getByText('Desenhar',{exact:true}).click();await page.locator('[data-chip-menu]').hover();await page.locator('#lab-menu-chip button').filter({hasText:'4011 ·'}).click();
 assert.equal(await page.evaluate(()=>CircuitJS1.getElements().filter(e=>e.getType()==='CustomCompositeElm').length),2);
 console.log('PASS: native persistence and menu insertion preserves existing circuit');
 assert.deepEqual(errors,[]);
 await page.screenshot({path:process.env.CHIP_SCREENSHOT||'chip-qa.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

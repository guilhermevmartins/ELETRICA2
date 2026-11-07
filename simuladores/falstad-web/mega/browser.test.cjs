const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const url=process.env.MEGA_QA_URL||'http://127.0.0.1:8030/simuladores/falstad-web/index.html?lang=pt';
  await page.goto(url);await page.getByRole('button',{name:'Arduino Mega',exact:true}).click();
  await page.locator('[data-load-demo]').click();await page.getByText('Exemplo montado. Clique em Iniciar e observe o circuito.',{exact:true}).waitFor();
  await page.locator('[data-start]').click();
  await page.waitForFunction(()=>Number(document.querySelector('[data-clock]').textContent.split(' ')[0])>.03);
  await page.locator('[data-pause]').click();
  assert.match(await page.locator('[data-pin-state]').innerText(),/SAÍDA/);
  assert.ok(await page.evaluate(()=>CircuitJS1.getElements().some(e=>e.getType()==='LEDElm'&&e.getCurrent()>.001)),'LED must carry current from the emulated Mega');
  console.log('PASS: real Falstad LED receives current');
  const snapshot=await page.evaluate(()=>labMega.snapshot());assert.equal(snapshot.format,'falstad-mega');
  await page.evaluate(()=>labMega.restore(window.labMega.snapshot()));assert.equal(await page.locator('[data-file-name]').innerText(),'blink.hex');
  // Malformed uploads must keep the loaded program.
  await page.locator('[data-file]').setInputFiles({name:'broken.hex',mimeType:'text/plain',buffer:Buffer.from(':00000001FF')});
  await page.getByText(/HEX incompleto/).waitFor();assert.equal(await page.locator('[data-file-name]').innerText(),'blink.hex');
  await page.locator('[data-demo]').selectOption('button');await page.locator('[data-load-demo]').click();await page.getByText('Exemplo montado. Clique em Iniciar e observe o circuito.',{exact:true}).waitFor();
  await page.locator('[data-start]').click();await page.waitForFunction(()=>Number(document.querySelector('[data-clock]').textContent.split(' ')[0])>.15);await page.locator('[data-pause]').click();
  assert.match(await page.locator('[data-pin-state]').innerText(),/0.00 V/);
  // Close the example's switch through CircuitJS text import (same circuit remains linked).
  await page.evaluate(()=>CircuitJS1.importCircuit(CircuitJS1.exportCircuit().replace(/(s 128 128 224 128 0 )1 false/,'$10 false'),false));
  await page.locator('[data-start]').click();await page.waitForFunction(()=>document.querySelector('[data-pin-state]').textContent.includes('5.00 V'));await page.locator('[data-pause]').click();
  console.log('PASS: Falstad switch D22 drives emulated digitalRead and LED D13');
  await page.locator('[data-demo]').selectOption('analog');await page.locator('[data-load-demo]').click();await page.getByText('Exemplo montado. Clique em Iniciar e observe o circuito.',{exact:true}).waitFor();
  await page.locator('[data-pin="44"]').click();await page.locator('[data-start]').click();await page.waitForFunction(()=>document.querySelector('[data-serial]').textContent.includes('512'));await page.locator('[data-pause]').click();
  console.log('PASS: Falstad voltage reads as ADC 512 on A15');
  await page.locator('[data-pin="53"]').click();await page.locator('[data-output]').click();assert.match(await page.evaluate(()=>CircuitJS1.exportCircuit()),/MEGA.D53/);
  const before=await page.evaluate(()=>CircuitJS1.exportCircuit());await page.locator('[data-hide]').click();await page.getByRole('button',{name:'Arduino Mega',exact:true}).click();assert.equal(await page.evaluate(()=>CircuitJS1.exportCircuit()),before);
  await page.locator('[data-pin="44"]').click();
  if(process.env.MEGA_SCREENSHOT)await page.screenshot({path:process.env.MEGA_SCREENSHOT});
  const exported=await page.evaluate(()=>labMega.snapshot());
  // Use a fresh API session to confirm visitors cannot publish Mega projects.
  const context=await browser.newContext();const apiUrl=new URL('library-api.php',url).href;
  let data=await(await context.request.get(apiUrl)).json();assert.equal(data.admin,false);
  const denied=await context.request.post(apiUrl,{headers:{'X-CSRF-Token':data.csrf},data:{action:'save',name:'Mega QA',category:'Mega',project:exported}});assert.equal(denied.status(),403);
  // Admin test is opt-in and must target an isolated QA copy.
  if(process.env.MEGA_QA_PASSWORD){
   let response=await context.request.post(apiUrl,{headers:{'X-CSRF-Token':data.csrf},data:{action:'login',password:process.env.MEGA_QA_PASSWORD}});assert.equal(response.status(),200);
   response=await context.request.post(apiUrl,{headers:{'X-CSRF-Token':data.csrf},data:{action:'save',name:'Mega QA',category:'Mega',project:exported}});const saved=await response.json();assert.equal(response.status(),200,JSON.stringify(saved));
   const item=saved.items.find(i=>i.id===saved.id);assert.equal(item.project.mega.hex,exported.mega.hex);
   const visitor=await browser.newContext();const publicData=await(await visitor.request.get(apiUrl)).json();assert.equal(publicData.admin,false);assert.ok(publicData.items.some(i=>i.id===item.id));
   response=await context.request.post(apiUrl,{headers:{'X-CSRF-Token':data.csrf},data:{action:'delete',id:item.id,revision:item.revision}});assert.equal(response.status(),200);
  }
  assert.deepEqual(errors,[]);console.log('PASS: upload validation, terminal insertion, project roundtrip, public read/admin write');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

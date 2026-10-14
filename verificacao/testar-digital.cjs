const {chromium}=require('C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure().errorText));
  await page.goto(pathToFileURL(process.cwd()+'/index.html').href+'#area-digital');
  assert.equal(await page.locator('.module-card:visible').count(),1);
  await page.screenshot({path:'verificacao/digital-area.png',fullPage:true});
  await page.locator('[data-open="digital"]').click();
  const f=await (await page.waitForSelector('#frame-digital')).contentFrame();
  await f.locator('#binaryValue').waitFor();await f.waitForFunction(()=>window.labActive);
  assert.equal(await f.locator('#decimalValue').textContent(),'5');
  for(let i=0;i<4;i++)await f.locator('#binary-'+i).click();
  assert.equal(await f.locator('#decimalValue').textContent(),'10');
  await page.screenshot({path:'verificacao/digital-fundamentos.png',fullPage:true});
  await f.locator('#lesson-1').click();
  const expected={BUF:[0,1],NOT:[1,0],AND:[0,0,0,1],OR:[0,1,1,1],NAND:[1,1,1,0],NOR:[1,0,0,0],XOR:[0,1,1,0],XNOR:[1,0,0,1]};
  for(const [gate,rows] of Object.entries(expected)){
   await f.locator('#gate').selectOption(gate);
   for(let i=0;i<rows.length;i++){
    await f.locator('#row-'+i).click();assert.equal(await f.locator('[data-output="Y"]').textContent(),'Y = '+rows[i]);
    assert.equal(await f.locator('tbody tr.active').count(),1);
   }
  }
  await f.locator('#gate').selectOption('AND');
  await f.locator('#workspace').screenshot({path:'verificacao/digital-portas.png'});
  await f.locator('#lesson-2').click();
  for(const opt of ['demorgan','demorgan2','absorption','xor']){
   await f.locator('#boolean').selectOption(opt);
   for(const row of await f.locator('tbody').first().locator('tr').all()){
    const values=await row.locator('td').allTextContents();assert.equal(values[2],values[3]);
   }
  }
  // Exercita os 16 mapas e compara a expressão exibida com cada mintermo.
  const mapResults=await f.evaluate(()=>{
   const results=[];
   for(let mask=0;mask<16;mask++){
    s.map=[0,1,2,3].map(i=>(mask>>i)&1);render();
    const expression=document.getElementById('mapExpression').textContent.slice(4);
    const actual=[0,1,2,3].map(i=>{
     const a=i>>1,b=i&1;
     return Number(expression.split(' + ').some(term=>term.split(' · ').every(x=>({'A':a,'B':b,'¬A':1-a,'¬B':1-b,'0':0,'1':1})[x]===1)));
    });
    results.push([s.map.slice(),actual]);
   }
   return results;
  });
  for(const [want,actual] of mapResults)assert.deepEqual(actual,want);
  await f.locator('#lesson-3').click();
  for(const opt of ['half','adder','mux','demux','decoder','encoder','compare','display']){
   await f.locator('#combin').selectOption(opt);
   assert.ok(await f.locator('.board svg').count());
   for(const input of await f.locator('.controls button').all())await input.click();
   if(opt==='decoder')await f.locator('#workspace').screenshot({path:'verificacao/digital-combinacionais.png'});
  }
  await f.locator('#combin').selectOption('adder');await f.locator('#resetLesson').click();
  await f.locator('#bit-b').click();await f.locator('#bit-c').click();
  assert.equal(await f.locator('[data-output="Cout"]').textContent(),'Cout = 1');assert.equal(await f.locator('[data-output="Soma"]').textContent(),'Soma = 1');
  await f.locator('#lesson-4').click();
  await f.locator('#bit-ma').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 0');
  await f.locator('#clock').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 1');
  await f.locator('#bit-ma').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 1');
  await f.locator('#clock').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 1');
  await f.locator('#clock').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 0');
  await f.locator('#workspace').screenshot({path:'verificacao/digital-memoria.png'});
  await f.locator('#memoryType').selectOption('latch');await f.locator('#bit-ma').click();
  assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 1');
  await f.locator('#bit-en').click();await f.locator('#bit-ma').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 1');
  await f.locator('#memoryType').selectOption('sr');await f.locator('#bit-ma').click();await f.locator('#bit-mb').click();
  assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 0');assert.equal(await f.locator('[data-output="Q̅"]').textContent(),'Q̅ = 0');
  await f.locator('#release').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = X');
  await f.locator('#bit-mb').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 0');
  for(const type of ['jk','t']){
   await f.locator('#memoryType').selectOption(type);await f.locator('#bit-ma').click();if(type==='jk')await f.locator('#bit-mb').click();
   await f.locator('#pulse').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 1');
   await f.locator('#pulse').click();assert.equal(await f.locator('[data-output="Q"]').textContent(),'Q = 0');
  }
  await f.locator('#lesson-5').click();
  for(let i=0;i<16;i++)await f.locator('#pulse').click();assert.match(await f.locator('#systemValue').textContent(),/0000/);
  await f.locator('#bit-enable').click();await f.locator('#pulse').click();assert.match(await f.locator('#systemValue').textContent(),/0000/);
  await f.locator('#bit-enable').click();await f.locator('#systemType').selectOption('shift');
  for(const v of [1,0,1,1]){if(await f.locator('#bit-serial').getAttribute('aria-pressed')!==String(!!v))await f.locator('#bit-serial').click();await f.locator('#pulse').click();}
  assert.match(await f.locator('#systemValue').textContent(),/1011/);
  await f.locator('#workspace').screenshot({path:'verificacao/digital-registrador.png'});
  await f.locator('#systemType').selectOption('fsm');
  for(const state of ['Amarelo','Vermelho','Verde']){await f.locator('#pulse').click();assert.equal(await f.locator('#systemValue').textContent(),'Estado: '+state);}
  await f.locator('#auto').click();await f.waitForFunction(()=>s.sclk===1);
  await page.locator('#backAreas').click();await f.waitForFunction(()=>!window.labActive&&!auto);
  const stopped=await f.evaluate(()=>[s.value,s.sclk]);await page.waitForTimeout(800);assert.deepEqual(await f.evaluate(()=>[s.value,s.sclk]),stopped);
  await page.locator('a[href="#area-digital"]').click();await page.locator('[data-open="digital"]').click();
  assert.deepEqual(await f.evaluate(()=>[s.value,s.sclk]),stopped);
  await f.locator('#lesson-6').click();
  for(let i=0;i<8;i++){
   assert.equal(await f.locator('#nextQuiz').isDisabled(),true);
   await f.locator('#answer-'+[1,0,2,2,0,1,1,0][i]).click();assert.equal(await f.locator('.feedback.good').count(),1);await f.locator('#nextQuiz').click();
  }
  await f.locator('#lesson-1').click();await f.locator('#bit-a').focus();const before=await f.locator('#bit-a').getAttribute('aria-pressed');await page.keyboard.press('Space');assert.notEqual(await f.locator('#bit-a').getAttribute('aria-pressed'),before);
  await page.setViewportSize({width:390,height:844});
  for(let i=0;i<7;i++){
   await f.locator('#lesson-'+i).click();
   assert.equal(await f.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow mobile lesson '+i);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow portal');
  }
  await f.locator('#lesson-1').click();await page.screenshot({path:'verificacao/digital-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('OK: integração no portal, 8 portas, 16 mapas, 8 combinacionais, 5 memórias, contador, registrador, estados, quiz, teclado, pausa e celular.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

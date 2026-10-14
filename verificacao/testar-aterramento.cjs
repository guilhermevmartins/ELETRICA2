const {chromium}=require('C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(process.cwd()+'/index.html').href+'#aterramento');
  const ui=page.frameLocator('#frame-aterramento');
  await ui.locator('#schemeTabs').waitFor();
  const f=page.frames().find(f=>f.url().endsWith('/aterramento.html'));
  await f.waitForFunction(()=>window.labActive);
  assert.equal(await ui.getByRole('tab').count(),5);
  for(const id of ['tt','tns','tnc','tncs','it']){
   await ui.locator('#scheme-'+id).click();
   await ui.locator('#normalMode').click();
   assert.equal(await ui.locator('#normalMode').getAttribute('aria-pressed'),'true');
   for(const component of ['sourceTransformer','utilityPole','meterStandard','distributionBoard','equipmentMass'])assert.equal(await ui.locator('#'+component).count(),1);
   const layout=await f.evaluate(()=>{
    const box=id=>document.getElementById(id).getBBox();
    const meter=box('meterStandard'),board=box('distributionBoard');
    const earth=document.querySelector('#entranceEarthConductor path');
    const p=earth?.getPointAtLength(0);
    return {separate:board.x>meter.x+meter.width,earthAtEntrance:!p||(p.x>=meter.x&&p.x<=meter.x+meter.width&&p.y>=meter.y&&p.y<=meter.y+meter.height)};
   });
   assert.equal(layout.separate,true,'Medição e quadro de distribuição ocupam espaços distintos');
   assert.equal(layout.earthAtEntrance,true,'A haste está conectada junto ao padrão de entrada');
   if(id!=='it'){
    assert.equal(await ui.locator('#entranceElectrode').count(),1);
    assert.equal(await ui.locator('#sourceEarthConductor').count(),0);
    const startsOnPE=await ui.locator('#entranceEarthConductor path').first().getAttribute('d');
    assert.ok(startsOnPE.startsWith(id==='tns'?'M550 480':'M550 455'),'TN-S aterra o PE sem unir novamente N e PE');
   }
   const normal=await ui.locator('#diagramDesc').textContent();
   await ui.locator('#faultMode').click();
   assert.notEqual(await ui.locator('#diagramDesc').textContent(),normal);
   assert.equal(await ui.locator('.fault-glow').count(),1);
   assert.equal(await ui.locator('.current-flow').count(),1);
   await page.screenshot({path:`verificacao/aterramento-${id}.png`,fullPage:true});
   await ui.locator('.visual').screenshot({path:`verificacao/aterramento-cena-${id}.png`});
  }
  await ui.locator('#itZ').click();
  assert.ok((await ui.locator('#diagram').textContent()).includes('Z alta'));
  await ui.locator('#itIsolated').click();
  assert.ok((await ui.locator('#diagram').textContent()).includes('equivalente distribuído'));
  await ui.locator('#motion').click();
  assert.equal(await ui.locator('body').evaluate(el=>el.classList.contains('paused')),true);
  await ui.locator('#motion').click();
  await page.locator('#backAreas').click();
  await f.waitForFunction(()=>document.body.classList.contains('paused'));
  await page.locator('a[href="#area-predial"]').click();
  await page.locator('[data-open="aterramento"]').click();
  await f.waitForFunction(()=>!document.body.classList.contains('paused'));
  assert.equal(await ui.locator('#scheme-it').getAttribute('aria-selected'),'true');
  await ui.locator('#scheme-it').focus();await page.keyboard.press('Home');
  assert.equal(await ui.locator('#scheme-tt').getAttribute('aria-selected'),'true');
  await ui.locator('[data-part="bep"]').click();
  assert.ok((await ui.locator('#partInfo').textContent()).includes('equipotencialização'));
  for(const [i,correct] of [0,1,1,1,1].entries()){
   await ui.locator('[data-answer="'+(correct===0?1:0)+'"]').click();
   assert.equal(await ui.locator('#nextQuestion').isDisabled(),true);
   await ui.locator('[data-answer="'+correct+'"]').click();
   assert.equal(await ui.locator('#nextQuestion').isDisabled(),false);
   await ui.locator('#nextQuestion').click();
  }
  assert.ok((await ui.locator('#quizCount').textContent()).includes('1 de 5'));
  await page.setViewportSize({width:390,height:844});
  for(const id of ['tt','tncs','it']){
   await ui.locator('#scheme-'+id).click();
   assert.equal(await f.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.screenshot({path:'verificacao/aterramento-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('OK: 5 esquemas, normal/falta, variantes IT, teclado, questionário, pausa do portal, persistência e layout móvel.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

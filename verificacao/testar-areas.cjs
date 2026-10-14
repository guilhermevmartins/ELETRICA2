const {chromium}=require('C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(process.cwd()+'/index.html').href;
  await page.goto(url);
  assert.equal(await page.locator('.area-card:visible').count(),5);
  assert.equal(await page.locator('iframe').count(),0);
  await page.screenshot({path:'verificacao/areas-desktop.png',fullPage:true});
  for(const [area,count] of [['predial',5],['comandos',1],['digital',1],['analogica',0],['automacao',0]]){
   await page.locator(`a[href="#area-${area}"]`).click();
   await page.waitForFunction(id=>active==='area-'+id,area);
   assert.equal(await page.locator('.module-card:visible').count(),count,area);
   assert.equal(await page.locator('#areaEmpty').isVisible(),count===0);
   await page.locator('#backAreas').click();
  }
  await page.locator('a[href="#area-predial"]').click();
  await page.locator('[data-open="din"]').click();
  await page.frameLocator('#frame-din').locator('#current').waitFor();
  const frame=page.frames().find(f=>f.url().endsWith('/disjuntor-din.html'));
  await frame.waitForFunction(()=>window.labActive===true);
  await page.locator('#backAreas').click();
  await frame.waitForFunction(()=>window.labActive===false);
  await page.locator('a[href="#area-comandos"]').click();
  assert.equal(await page.locator('#tab-din').isVisible(),false);
  await page.locator('[data-open="motor"]').click();
  await page.frameLocator('#frame-motor').locator('canvas').first().waitFor();
  await page.locator('#backAreas').click();
  await page.locator('a[href="#area-predial"]').click();
  await page.locator('[data-open="din"]').click();
  assert.equal(await page.locator('#frame-din').count(),1);
  await frame.waitForFunction(()=>window.labActive===true);
  await page.locator('#tab-din').focus();
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#tab-inicio').evaluate(el=>document.activeElement===el),true);
  await page.goto(url+'#dr');
  await page.frameLocator('#frame-dr').locator('canvas').first().waitFor();
  assert.equal(await page.locator('#tab-motor').isVisible(),false);
  await page.goto(url+'#inicio');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:'verificacao/areas-mobile.png',fullPage:true});
  await page.locator('a[href="#area-predial"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:'verificacao/areas-predial-mobile.png',fullPage:true});
  await page.goBack();
  await page.locator('#areasHome').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);
  console.log('OK: cinco áreas, distribuição de módulos, navegação, teclado, links diretos, pausa e retomada, desktop e celular.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

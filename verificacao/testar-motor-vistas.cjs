const {chromium}=require('C:/Users/Gui Martins/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:1440,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(process.cwd()+'/index.html').href+'#area-comandos');await page.locator('.motor-photo-link').click();const f=page.frameLocator('#frame-motor-vistas');await f.locator('#motorScene').waitFor();
await page.screenshot({path:'verificacao/motor-vistas-fechado.png',fullPage:true});
const start=await f.locator('[data-part="front"]').getAttribute('transform');
await f.locator('[data-value="100"]').click();await page.waitForTimeout(1300);
if(start===await f.locator('[data-part="front"]').getAttribute('transform'))throw Error('Peças não se moveram');
if(await f.locator('#expansion').inputValue()!=='100')throw Error('Explosão incompleta');
await page.screenshot({path:'verificacao/motor-vistas-expandido.png',fullPage:true});
await f.locator('[data-part="front"]').focus();await page.keyboard.press('Enter');if(await f.locator('#partTitle').innerText()!=='Tampa dianteira')throw Error('Seleção de peça');
await f.locator('#expansion').fill('50');await page.waitForTimeout(1100);const middle=await f.locator('[data-part="front"]').getAttribute('transform');if(!middle.includes('-220'))throw Error('Posição intermediária');
await f.locator('#expansion').focus();await page.keyboard.press('Home');await page.waitForTimeout(1100);if(await f.locator('#expansion').inputValue()!=='0')throw Error('Teclado');
await f.locator('#demo').click();await page.waitForTimeout(400);await f.locator('#demo').click();await page.waitForTimeout(100);const paused=await f.locator('[data-part="front"]').getAttribute('transform');await page.waitForTimeout(200);if(paused!==await f.locator('[data-part="front"]').getAttribute('transform'))throw Error('Pausa');
await f.locator('[data-value="100"]').click();await page.waitForTimeout(1200);await page.setViewportSize({width:390,height:844});await page.screenshot({path:'verificacao/motor-vistas-mobile.png',fullPage:true});for(const frame of page.frames())if(await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');if(errors.length)throw Error(errors.join('\n'));console.log('OK: peças móveis, abertura completa e intermediária, seleção, teclado, pausa e layout móvel.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

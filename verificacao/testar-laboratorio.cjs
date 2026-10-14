const {chromium}=require('C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url');const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1040},deviceScaleFactor:1});const errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(process.cwd()+'/index.html').href);
 await page.getByRole('heading',{name:'O que vamos estudar hoje?'}).waitFor();
 await page.screenshot({path:'verificacao/portal.png',fullPage:true});
 await page.getByRole('button',{name:'Abrir simulador de Disjuntor-motor',exact:true}).click();
 const motor=page.frameLocator('#frame-motor');await motor.locator('#ir').waitFor();
 await page.waitForTimeout(300);
 const motorFrame=page.frames().find(f=>f.url().includes('disjuntor-motor.html'));
 results.push(...await motorFrame.evaluate(()=>{
  const result=[];const assert=(ok,name,detail)=>{result.push({ok,name,detail});if(!ok)throw Error(name)};
  state.speed=1;state.ir=28;window.labActive=true;
  preset('normal');for(let i=0;i<1500;i++)update(.05);assert(state.closed,'Motor 28 A em regime permanece fechado');
  for(const ir of [24,28,32]){state.ir=ir;preset('start');for(let i=0;i<60;i++)update(.05);assert(state.closed,'Partida permitida em Ir '+ir,{temps:state.temps});}
  const tripTimes=[];
  for(const ir of [24,28,32]){state.ir=ir;preset('overload');while(state.closed&&state.time<90)update(.01);assert(state.tripped&&state.cause==='thermal','Sobrecarga dispara em Ir '+ir,{time:state.tripTime});tripTimes.push(state.tripTime)}
  assert(tripTimes[0]<tripTimes[1]&&tripTimes[1]<tripTimes[2],'Ajuste térmico altera o tempo de disparo');
  state.ir=28;preset('phase');while(state.closed&&state.time<90)update(.01);assert(state.tripped&&state.cause==='phase','Diferencial atua por falta de fase',{temps:state.temps,time:state.time});assert(currents().every(i=>i===0),'Falta de fase abre os três polos');
  preset('short');assert(state.tripped&&state.cause==='magnetic'&&state.arc>0,'Curto gera disparo magnético e arco');
  startMotor();assert(state.tripped&&!state.closed,'START não ignora trava disparada');resetMotor();assert(!state.tripped&&!state.closed,'Rearme mantém contatos abertos');startMotor();assert(state.tripped,'START com falta persistente desarma novamente');
  resetMotor();state.mode='normal';state.demand=28;startMotor();assert(state.closed,'START fecha após eliminar a falta');
  stopMotor();const before=state.temps[0];update(.3);assert(!state.closed&&state.temps[0]<=before,'STOP abre e permite resfriamento');
  preset('overload');state.paused=true;const frozen=state.time;update(1);assert(state.time===frozen,'Pausa preserva tempo');state.paused=false;window.labActive=false;update(1);assert(state.time===frozen,'Aba inativa congela modelo');window.labActive=true;
  preset('normal');state.ir=28;state.speed=3;return result;
 }));
 await page.screenshot({path:'verificacao/motor-corte.png',fullPage:true});
 await motor.getByRole('button',{name:'Vista frontal',exact:true}).click();await page.waitForTimeout(200);await page.screenshot({path:'verificacao/motor-frontal.png',fullPage:true});
 const canvasBox=await motor.locator('#scene').boundingBox();
 await motor.locator('#scene').click({position:{x:540/1000*canvasBox.width,y:270/660*canvasBox.height}});
 if(await motorFrame.evaluate(()=>state.closed))throw Error('STOP no desenho não abriu');
 await motor.locator('#scene').click({position:{x:610/1000*canvasBox.width,y:270/660*canvasBox.height}});
 if(!await motorFrame.evaluate(()=>state.closed))throw Error('START no desenho não fechou');
 results.push({ok:true,name:'Botões START e STOP clicáveis na vista frontal'});
 await motor.locator('#ir').fill('30');await motor.locator('#ir').dispatchEvent('input');
 if((await motorFrame.evaluate(()=>state.ir))!==30)throw Error('Slider de ajuste');
 await motor.locator('#ir').fill('28');await motor.locator('#ir').dispatchEvent('input');
 await motor.getByRole('button',{name:'04 · Curto-circuito 450 A'}).click();
 await motor.getByRole('button',{name:'Pausar',exact:true}).click();
 await motor.getByRole('button',{name:'Corte interno',exact:true}).click();await page.screenshot({path:'verificacao/motor-curto.png',fullPage:true});
 if(!await motorFrame.evaluate(()=>state.tripped&&state.arc>0))throw Error('Preset magnético na interface');
 await motor.getByRole('button',{name:'01 · Funcionamento normal 28 A'}).click();
 await motor.getByRole('button',{name:'Vista explodida',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:'verificacao/motor-explodida.png',fullPage:true});
 await motor.getByRole('button',{name:'05 · Bimetais',exact:true}).click();if(!(await motor.locator('#partTitle').innerText()).includes('Bimetais'))throw Error('Seleção anatômica');
 await page.getByRole('tab',{name:'01 Disjuntor DIN'}).click();await page.frameLocator('#frame-din').locator('#scene').waitFor();await page.waitForTimeout(300);
 const saved=await motorFrame.evaluate(()=>({time:state.time,view:state.view}));await page.waitForTimeout(150);if((await motorFrame.evaluate(()=>state.time))!==saved.time)throw Error('Motor avançou na aba inativa');
 const dinFrame=page.frames().find(f=>f.url().includes('disjuntor-din.html'));
 results.push(...await dinFrame.evaluate(()=>{const result=[];const assert=(ok,name)=>{result.push({ok,name});if(!ok)throw Error(name)};preset(15);while(state.closed&&state.time<60)update(.01);assert(!state.closed&&state.cause==='thermal','Regressão DIN: térmico');preset(80);assert(!state.closed&&state.cause==='magnetic','Regressão DIN: magnético');preset(5);return result}));
 await page.screenshot({path:'verificacao/din-vermelho.png',fullPage:true});
 await page.getByRole('tab',{name:'02 Disjuntor-motor'}).click();if((await motorFrame.evaluate(()=>state.view))!==saved.view)throw Error('Vista do motor não foi preservada');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:'verificacao/motor-mobile.png',fullPage:true});
 for(const frame of [page.mainFrame(),motorFrame]){const overflow=await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Overflow horizontal '+frame.url());}
 await page.getByRole('tab',{name:'Selecionar equipamento'}).click();await page.screenshot({path:'verificacao/portal-mobile.png',fullPage:true});
 // Keyboard tab navigation follows the ARIA tab pattern.
 await page.getByRole('tab',{name:'Selecionar equipamento'}).focus();await page.keyboard.press('ArrowRight');if(await page.getByRole('tab',{name:'01 Disjuntor DIN'}).getAttribute('aria-selected')!=='true')throw Error('Navegação por teclado');
 const report={results,errors};fs.writeFileSync('verificacao/resultado-laboratorio.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

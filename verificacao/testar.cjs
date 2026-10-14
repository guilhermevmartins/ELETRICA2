const {chromium}=require('C:/Users/Senai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('url');
(async()=>{const browser=await chromium.launch({headless:true,channel:"msedge"});const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(process.cwd()+'/simuladores/disjuntor-din.html').href);await page.screenshot({path:'verificacao/normal.png',fullPage:true});
const result=await page.evaluate(()=>{const out=[];function assert(ok,name){out.push({name,ok});if(!ok)throw Error(name)}
preset(5);for(let k=0;k<1000;k++)update(.05);assert(state.closed&&state.temp<100,'5 A permanece fechado');
preset(15);while(state.closed&&state.time<60)update(.01);assert(!state.closed&&state.cause==='thermal'&&state.time>10&&state.time<20,'15 A desarma termicamente');out.push({thermalTime:state.time});const hot=state.temp;update(1);assert(state.temp<hot,'Resfria depois de abrir');
preset(80);assert(!state.closed&&state.cause==='magnetic'&&state.arc>0,'80 A desarma imediatamente e gera arco');reclose();assert(!state.closed,'Religamento com falta volta a desarmar');update(2);assert(state.arc===0&&actual()===0,'Arco se extingue e corrente zera');
preset(160);assert(state.severe&&!state.closed,'160 A inicia dramatizacao');demand(5);reclose();assert(state.closed,'Religa apos remover falta');
preset(15);state.paused=true;const before=state.temp;update(10);assert(state.temp===before,'Pausa congela modelo');state.paused=false;
preset(0);assert(actual()===0&&state.closed,'Zero ampere com contatos fechados');preset(5);return out;});
await page.getByRole('button',{name:'Vista explodida',exact:true}).click();await page.waitForTimeout(800);await page.screenshot({path:'verificacao/explodida.png',fullPage:true});
await page.getByRole('button',{name:'04 · Bimetal',exact:true}).click();if(!(await page.locator('#partTitle').innerText()).includes('bimetálica'))throw Error('Selecao de componente');
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'verificacao/mobile.png',fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);console.log(JSON.stringify({result,errors,overflow},null,2));await browser.close();if(errors.length||overflow)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1)});

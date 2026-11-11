import {Mega2560,PINS,FREQUENCY,parseHex} from './mega-core.mjs';
import {compileSketch} from './compiler/client.mjs';

export function installMega(sim){
  let hex='',filename='',runner=null,running=false,selected=13,previousTime=0,targetCycles=0,lastRefresh=0;
  let inputs=new Set(),outputs=new Set(),manual={},serialText='',busy=false;
  let inoName='sketch.ino',compiledSource=null,sourceTouched=false;
  const panel=document.createElement('aside');panel.id='mega-panel';panel.hidden=true;
  panel.innerHTML=`<header><div><small>BANCADA PROGRAMÁVEL</small><h2>Arduino Mega <span>2560</span></h2></div><button data-hide title="Minimizar painel" aria-label="Minimizar Arduino Mega">−</button></header>
    <div class="mega-body"><p class="mega-intro">Carregue seu programa e conecte os pinos ao circuito.</p>
    <section class="mega-editor"><label for="mega-code">Programa Arduino · .ino</label><textarea id="mega-code" data-code spellcheck="false" autocomplete="off" aria-label="Código Arduino" rows="15"></textarea><div class="mega-actions"><button data-compile>Compilar e iniciar</button><label class="mega-upload">Abrir .ino<input data-ino type="file" accept=".ino,.cpp,text/plain"></label><button data-download-ino>Baixar .ino</button></div><p data-compile-status role="status">Cole seu código ou abra um arquivo .ino.</p><pre data-build-log hidden aria-label="Resultado da compilação"></pre><small>Compilação no navegador. Inclui funções Arduino e LiquidCrystal (LCD paralelo). A primeira compilação carrega aproximadamente 20 MB. Bibliotecas externas e projetos com várias abas ainda não estão incluídos.</small></section>
    <details><summary>Programa já compilado (.hex)</summary><label class="mega-upload">Carregar programa .hex<input data-file type="file" accept=".hex"></label></details><p data-file-name>Nenhum programa carregado</p>
    <div class="mega-actions"><button data-start>▶ Iniciar</button><button data-pause disabled>Ⅱ Pausar</button><button data-reset disabled>↺ Reiniciar</button></div>
    <p data-status role="status">Pronto para receber um programa do Mega 2560.</p>
    <details><summary>Como programar?</summary><ol><li>Cole o código no editor ou abra seu arquivo <b>.ino</b>.</li><li>Insira os terminais abaixo e conecte os fios no CircuitLab.</li><li>Clique em <b>Compilar e iniciar</b>. Os erros aparecem abaixo do editor.</li></ol><p>O alvo é sempre Arduino Mega 2560. A compilação e a simulação acontecem no navegador; o código não é enviado para serviços externos nem gravado numa placa física. Como alternativa, exporte o .hex sem bootloader na IDE Arduino e abra em Programa já compilado.</p></details>
    <div class="mega-example"><label>Experiência pronta<select data-demo><option value="blink">LED piscando · D13</option><option value="button">Botão D22 → LED D13</option><option value="analog">Entrada A15 → PWM D44</option></select></label><button data-load-demo>Montar exemplo</button><a data-source href="mega/examples/blink.ino" download>Baixar código .ino</a></div>
    <section class="mega-board"><div class="mega-chip">ATmega2560 <small>16 MHz · 5 V</small><span data-clock>0,000 s</span></div><h3>Digitais · D0–D53</h3><div class="mega-pin-grid" data-digital></div><h3>Analógicos · A0–A15</h3><div class="mega-pin-grid" data-analog></div><p class="mega-legend"><span>● HIGH / 5 V</span> · ○ LOW / 0 V · ~ PWM</p></section>
    <section class="mega-pin-detail"><h3 data-pin-title></h3><p data-pin-state></p><div class="mega-actions"><button data-input>Inserir entrada no circuito</button><button data-output>Inserir saída no circuito</button></div><label data-manual-label>Entrada de teste, sem fio: <output data-voltage>0 V</output><input data-manual type="range" min="0" max="5" step="0.01" value="0"></label><button data-release>Liberar entrada de teste</button><small>Entradas conectadas usam a tensão do CircuitLab. INPUT_PULLUP conectado precisa de resistor de pull-up no circuito. Saídas fornecem 0 ou 5 V; ligue-as a uma carga, nunca a outra fonte.</small></section>
    <details><summary>Monitor serial · Serial a Serial3</summary><pre data-serial aria-label="Monitor serial"></pre><button data-clear>Limpar monitor</button></details>
    <div class="mega-actions"><button data-save>Baixar projeto completo</button><label class="mega-upload">Abrir projeto<input data-project type="file" accept=".json"></label></div>
    <p class="mega-note">PWM aparece em pulsos de 0/5 V. A velocidade acompanha o tempo da simulação. SPI, I²C, USB, EEPROM e bibliotecas que dependem desses periféricos ainda não são simulados nesta integração.</p></div>`;
  document.body.append(panel);const $=s=>panel.querySelector(s);const status=s=>$('[data-status]').textContent=s;
  const editor=$('[data-code]');editor.value='void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}\n';
  const button=document.createElement('button');button.className='lab-examples-button';button.type='button';button.textContent='Arduino Mega';button.setAttribute('aria-controls','mega-panel');button.setAttribute('aria-expanded','false');
  const row=document.querySelector('.gwt-MenuBar-horizontal tr');if(row){const cell=document.createElement('td');cell.append(button);row.append(cell);}else{document.body.append(button);button.classList.add('mega-launch-floating');}
  function show(value){panel.hidden=!value;button.setAttribute('aria-expanded',String(value));if(value)refresh();}
  button.onclick=()=>show(panel.hidden);$('[data-hide]').onclick=()=>show(false);
  // Keep simulator shortcuts from deleting/moving circuit elements while typing in this panel.
  for(const name of ['keydown','keyup','keypress'])panel.addEventListener(name,e=>e.stopPropagation());
  for(const pin of PINS){const b=document.createElement('button');b.type='button';b.textContent=pin.name+(pin.pwm?' ~':'');b.dataset.pin=pin.id;b.title=`${pin.name} · porta P${pin.port}${pin.bit}`;b.onclick=()=>{selected=pin.id;refresh();};$(pin.id<54?'[data-digital]':'[data-analog]').append(b);}
  const pinName=pin=>`MEGA.${pin.name}`;
  function scan(){
    inputs=new Set();outputs=new Set();
    for(const line of sim.exportCircuit().split('\n')){const fields=line.trim().split(/\s+/);if(fields[0]==='207'&&/^MEGA\./.test(fields[6]??''))inputs.add(fields[6]);if(fields[0]==='418'&&/^MEGA\./.test(fields.at(-1)??''))outputs.add(fields.at(-1));}
  }
  function read(pin){if(inputs.has(pinName(pin))){const v=sim.getNodeVoltage(pinName(pin));return Number.isFinite(v)?v:0;}return manual[pin.id];}
  function controls(){
    const dirty=compiledSource!==null?editor.value!==compiledSource:!!editor.value.trim();
    $('[data-start]').disabled=!hex||dirty||(running&&sim.isRunning())||busy;$('[data-pause]').disabled=!running||!sim.isRunning();$('[data-reset]').disabled=!hex||dirty||busy;
    $('[data-compile]').disabled=busy;editor.disabled=busy;$('[data-ino]').disabled=busy;$('[data-project]').disabled=busy;
    $('[data-load-demo]').disabled=busy;$('[data-file]').disabled=busy;
    $('[data-file-name]').textContent=filename||'Nenhum programa carregado';
  }
  function createRunner(){
    serialText='';targetCycles=0;scan();
    runner=new Mega2560(hex,{read,write:(pin,v)=>{if(outputs.has(pinName(pin)))sim.setExtVoltage(pinName(pin),v??0);},serial:(index,text)=>{serialText=(serialText+(index?`[Serial${index}] `:'')+text).slice(-8000);}});
    previousTime=sim.getTime();
  }
  function pause(){running=false;sim.setSimRunning(false);controls();refresh();}
  function stop(){running=false;runner=null;targetCycles=0;for(const name of outputs)sim.setExtVoltage(name,0);controls();}
  function load(text,name){parseHex(text);stop();hex=text;filename=name;manual={};createRunner();controls();refresh();status('Programa carregado. Clique em Iniciar.');}
  function start(){if(!hex)return;try{if(!runner)createRunner();scan();previousTime=sim.getTime();running=true;sim.setSimRunning(true);controls();status('Executando junto com o Falstad.');}catch(e){status(e.message);}}
  $('[data-start]').onclick=start;$('[data-pause]').onclick=()=>{pause();status('Arduino e circuito pausados.');};
  $('[data-reset]').onclick=()=>{pause();try{createRunner();start();}catch(e){status(e.message);}};
  $('[data-file]').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>800000)throw Error('Arquivo muito grande para o Mega.');const text=await file.text();parseHex(text);pause();editor.value='';compiledSource=null;load(text,file.name);}catch(e){status(e.message);}finally{e.target.value='';}};
  editor.oninput=()=>{sourceTouched=true;pause();$('[data-compile-status]').textContent='Código alterado. Compile novamente para executar.';};
  editor.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();editor.setRangeText('  ',editor.selectionStart,editor.selectionEnd,'end');editor.dispatchEvent(new Event('input'));}});
  $('[data-ino]').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>200000)throw Error('Código muito grande (máximo 200 KB).');const source=await f.text();pause();sourceTouched=true;editor.value=source;inoName=f.name.replace(/\.[^.]+$/,'.ino');$('[data-compile-status]').textContent=inoName+' aberto. Clique em Compilar e iniciar.';controls();}catch(err){status(err.message);}finally{e.target.value='';}};
  $('[data-download-ino]').onclick=()=>{const url=URL.createObjectURL(new Blob([editor.value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=inoName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('[data-compile]').onclick=async()=>{
    pause();sourceTouched=true;busy=true;controls();const source=editor.value,log=$('[data-build-log]');log.hidden=true;log.textContent='';
    try{const result=await compileSketch(source,s=>$('[data-compile-status]').textContent=s);parseHex(result.hex);load(result.hex,inoName.replace(/\.ino$/i,'.hex'));compiledSource=source;log.textContent=result.log||'Compilado com sucesso para Arduino Mega 2560.';log.hidden=false;$('[data-compile-status]').textContent='Compilado! Código pronto para o Mega.';busy=false;start();}
    catch(e){log.textContent=e.message;log.hidden=false;$('[data-compile-status]').textContent='Não foi possível compilar. Confira as mensagens abaixo.';}
    finally{busy=false;controls();}
  };
  const previousStep=sim.ontimestep;
  sim.ontimestep=()=>{
    previousStep?.(sim);if(!running||!runner)return;
    const now=sim.getTime(),delta=now-previousTime;previousTime=now;
    if(delta<0){targetCycles=runner.cpu.cycles;return;}
    targetCycles+=delta*FREQUENCY;
    if(targetCycles-runner.cpu.cycles>200000){pause();status('Passo de tempo muito grande. Reduza o passo máximo do CircuitLab para 50 µs ou menos.');return;}
    try{runner.advance(Math.max(0,Math.floor(targetCycles-runner.cpu.cycles)));}catch(e){pause();status(e.message);}
  };
  const previousAnalyze=sim.onanalyze;
  sim.onanalyze=()=>{previousAnalyze?.(sim);scan();if(runner){runner.lastOutputs.clear();runner.syncOutputs();}refresh();};
  function refresh(){
    controls();
    for(const pin of PINS){const b=$(`[data-pin="${pin.id}"]`);const s=runner?.sample(pin.id);b.classList.toggle('high',s?s.voltage>=2.5:false);b.classList.toggle('selected',pin.id===selected);b.classList.toggle('wired',inputs.has(pinName(pin))||outputs.has(pinName(pin)));b.setAttribute('aria-pressed',String(pin.id===selected));}
    const pin=PINS[selected],s=runner?.sample(selected),connected=inputs.has(pinName(pin));
    $('[data-pin-title]').textContent=`${pin.name} · ${pinName(pin)}${pin.pwm?' · PWM':''}`;
    $('[data-pin-state]').textContent=s?`${s.output?'SAÍDA':s.state===3?'ENTRADA com pull-up':'ENTRADA'} · ${s.voltage.toFixed(2)} V${outputs.has(pinName(pin))&&!s.output?' · Atenção: terminal de saída exige pinMode OUTPUT.':''}`:'Carregue um programa para acompanhar este pino.';
    $('[data-manual]').disabled=connected||!!s?.output;$('[data-manual]').value=manual[selected]??(s?.state===3?5:0);
    $('[data-voltage]').textContent=connected?'ligada ao circuito':`${Number($('[data-manual]').value).toFixed(2)} V`;
    $('[data-input]').disabled=inputs.has(pinName(pin))||outputs.has(pinName(pin));$('[data-output]').disabled=$('[data-input]').disabled;
    $('[data-clock]').textContent=`${((runner?.cpu.cycles??0)/FREQUENCY).toFixed(3)} s`;
    const serial=$('[data-serial]');if(serial.textContent!==serialText){serial.textContent=serialText;serial.scrollTop=serial.scrollHeight;}
  }
  const previousUpdate=sim.onupdate;
  sim.onupdate=()=>{previousUpdate?.(sim);if(!panel.hidden&&performance.now()-lastRefresh>150){lastRefresh=performance.now();refresh();}};
  $('[data-manual]').oninput=e=>{manual[selected]=Number(e.target.value);runner?.syncInputs();refresh();};
  $('[data-release]').onclick=()=>{delete manual[selected];runner?.syncInputs();refresh();};
  $('[data-clear]').onclick=()=>{serialText='';refresh();};
  function insert(output){
    scan();const pin=PINS[selected],name=pinName(pin);if(inputs.has(name)||outputs.has(name))return;
    const y=96+((inputs.size+outputs.size)%12)*48,x=208+Math.floor((inputs.size+outputs.size)/12)*240;
    const line=output?`418 ${x} ${y} ${x-48} ${y} 0 1 40 5 0 0 0.5 ${name}\n`:`207 ${x} ${y} ${x-48} ${y} 4 ${name}\n`;
    // CircuitJS's second argument means "subcircuits only", not "append".
    const wasRunning=sim.isRunning();
    sim.importCircuit(sim.exportCircuit()+line,false);sim.setSimRunning(wasRunning);
    previousTime=sim.getTime();if(runner)targetCycles=runner.cpu.cycles;
    scan();if(runner){runner.lastOutputs.clear();runner.syncOutputs();}refresh();
    status(`${pin.name}: terminal inserido. Conecte o fio à ponta do terminal; use a ferramenta de seleção para movê-lo.`);
  }
  $('[data-input]').onclick=()=>insert(false);$('[data-output]').onclick=()=>insert(true);
  $('[data-demo]').onchange=()=>{$('[data-source]').href=`mega/examples/${$('[data-demo]').value}.ino`;};
  $('[data-load-demo]').onclick=async()=>{
    if(!confirm('Montar o exemplo substituirá o circuito e o programa atuais. Continuar?'))return;
    busy=true;controls();try{const name=$('[data-demo]').value;const [h,c,source]=await Promise.all(['hex','txt','ino'].map(async ext=>{const r=await fetch(`mega/examples/${name}.${ext}`);if(!r.ok)throw Error('Não foi possível carregar o exemplo.');return r.text();}));parseHex(h);pause();stop();editor.value=source;compiledSource=source;inoName=name+'.ino';sim.importCircuit(c,false);load(h,`${name}.hex`);status('Exemplo montado. Clique em Iniciar e observe o circuito.');}catch(e){status(e.message);}finally{busy=false;controls();}
  };
  function snapshot(){return hex||(sourceTouched&&editor.value.trim())?{format:'falstad-mega',version:1,circuit:sim.exportCircuit(),mega:{hex,name:filename,manual,source:editor.value,inoName,compiledSource}}:sim.exportCircuit();}
  function restore(project){
    if(busy)throw Error('Aguarde a compilação terminar antes de abrir outro projeto.');
    if(typeof project==='string'){stop();hex='';filename='';manual={};editor.value='';compiledSource=null;sim.importCircuit(project,false);controls();refresh();return;}
    if(project?.format!=='falstad-mega'||project.version!==1||typeof project.circuit!=='string'||typeof project.mega?.name!=='string')throw Error('Projeto Arduino Mega inválido.');
    const saved=project.mega;
    if(typeof saved.hex!=='string'||(saved.source!==undefined&&(typeof saved.source!=='string'||saved.source.length>200000))||(saved.compiledSource!=null&&(typeof saved.compiledSource!=='string'||saved.compiledSource.length>200000)))throw Error('Código do projeto inválido.');
    if(saved.hex)parseHex(saved.hex);else if(!saved.source?.trim())throw Error('Projeto sem programa.');
    pause();stop();sourceTouched=true;editor.value=saved.source||'';compiledSource=saved.compiledSource??null;inoName=typeof saved.inoName==='string'?saved.inoName.slice(0,160):'sketch.ino';sim.importCircuit(project.circuit,false);
    if(saved.hex)load(saved.hex,saved.name.slice(0,160));else{hex='';filename='';manual={};controls();refresh();}
    for(const [id,v] of Object.entries(project.mega.manual??{})){if(/^\d+$/.test(id)&&Number(id)<70&&typeof v==='number'&&v>=0&&v<=5)manual[id]=v;}
    runner?.syncInputs();show(true);status(editor.value&&editor.value!==compiledSource?'Projeto restaurado. Clique em Compilar e iniciar.':'Circuito e programa restaurados. Clique em Iniciar.');
  }
  window.labMega={snapshot,restore};
  $('[data-save]').onclick=()=>{const blob=new Blob([JSON.stringify({format:'falstad-mega-project',version:1,project:snapshot()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='projeto-mega-circuitlab.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('[data-project]').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Projeto muito grande.');const data=JSON.parse(await file.text());if(data.format!=='falstad-mega-project'||data.version!==1)throw Error('Escolha um projeto Mega + Falstad.');if(confirm('Substituir o circuito e o programa atuais?'))restore(data.project);}catch(e){status(e.message);}finally{e.target.value='';}};
  scan();controls();refresh();
}

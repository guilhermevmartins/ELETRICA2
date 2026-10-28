import {diodeTypes,seriesDiode,zenerCircuit,rectified} from './diodos-modelo.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=(n,d=1)=>n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const steps=['Conhecer','Olhar por dentro','Experimentar','Tipos de diodo','Desafiar a turma'];
let step=0,junctionState='equilibrium',paused=false,experiment='common',reversed=false,selectedType='rectifier',questionIndex=0,answered=false;
function showStep(index){
 step=Math.max(0,Math.min(4,index));
 $$('[data-panel]').forEach(p=>p.hidden=Number(p.dataset.panel)!==step);
 $$('[data-step]').forEach(b=>Number(b.dataset.step)===step?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
 $('#previousStep').disabled=step===0;$('#nextStep').hidden=step===4;
 $('#nextStep').textContent=(steps[step+1]||'')+' →';$('#stepLabel').textContent=`${step+1} de 5 · ${steps[step]}`;
}
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.step))));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.go))));
$('#previousStep').onclick=()=>showStep(step-1);$('#nextStep').onclick=()=>showStep(step+1);
const terminals={
 anode:['Ânodo: o lado P na junção P–N.','Para polarizar diretamente um diodo P–N, conectamos o ânodo ao potencial mais positivo e o cátodo ao mais negativo.'],
 cathode:['Cátodo: procure a faixa.','Neste diodo axial, a faixa clara identifica K. No símbolo elétrico, a barra também identifica o cátodo. LEDs e outros encapsulamentos podem ter marcações diferentes.'],
 symbol:['A barra do símbolo é o cátodo.','Na condução direta, a corrente convencional vai de A para K. Os elétrons se deslocam no sentido oposto. As setas pequenas de LED e fotodiodo representam luz, não corrente.']
};
$('#terminalChoices').onclick=e=>{const b=e.target.closest('[data-terminal]');if(!b)return;const [title,text]=terminals[b.dataset.terminal];$('#terminalTitle').textContent=title;$('#terminalText').textContent=text;$$('[data-terminal]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));};

// All diagrams are original SVG. The diode bar is always the cathode.
function glyph(kind='normal'){
 const body='<path d="M5 30H45M45 10V50L85 30Z M85 30H135"/>';
 const bar=kind==='zener'?'<path d="M75 10H85V50H95"/>':kind==='schottky'?'<path d="M75 18V10H85V50H95V42"/>':kind==='tunnel'?'<path d="M75 10H85V50H75"/>':kind==='varicap'?'<path d="M85 10V50 M94 10V50"/>':'<path d="M85 10V50"/>';
 const rays=kind==='led'?'<path d="M55 4L72 -13m-9 1 9-1-1 9 M80 4L97 -13m-9 1 9-1-1 9"/>':kind==='photo'?'<path d="M48 -14L65 3m-9-1 9 1-1-9 M73 -14L90 3m-9-1 9 1-1-9"/>':'';
 if(kind==='block')return '<path d="M5 30H40M100 30H135"/><rect x="40" y="10" width="60" height="40"/><text x="70" y="34" text-anchor="middle">RF</text>';
 return body+bar+rays;
}
function symbolSvg(kind){return `<svg class="type-symbol" viewBox="0 -20 140 80" aria-hidden="true">${glyph(kind)}</svg>`;}
function particle(x,y,kind,delay=0){return `<g class="mobile-charge ${kind}" style="animation-delay:${delay}s"><circle cx="${x}" cy="${y}" r="8" fill="${kind==='h'?'none':'#65b6fa'}" stroke="${kind==='h'?'#efb874':'#65b6fa'}" stroke-width="2"/><text x="${x}" y="${y+4}" text-anchor="middle" fill="${kind==='h'?'#efb874':'#0d2438'}" font-size="13" font-family="sans-serif">${kind==='h'?'+':'−'}</text></g>`;}
function renderJunction(){
 const v=Number($('#bias').value),separate=junctionState==='separate';
 const width=separate?0:v<0?104+Math.sqrt(-v)*44:Math.max(54,104-v*70);
 const left=320-width/2,right=320+width/2;
 const mode=separate?'separate':v>0?'forward':v<0?'reverse':'equilibrium';
 junctionState=mode;
 $$('[data-junction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.junction===mode)));
 $('#bias').disabled=separate;$('#biasValue').textContent=separate?'Sem junção':`${v>0?'+':''}${fmt(v,2)} V`;
 const text={
  separate:['ANTES DO CONTATO','P e N: dois materiais, dois portadores majoritários.','No lado P, predominam lacunas móveis: a ausência de um elétron se comporta como carga positiva. No lado N, predominam elétrons livres. Ambos os materiais são eletricamente neutros no conjunto.','P não significa “bloco positivo”.','N também não significa que o material inteiro seja negativo. As cargas dos portadores e da rede cristalina se compensam.'],
  equilibrium:['SEM TENSÃO EXTERNA','O encontro cria uma barreira.','Elétrons difundem de N para P e lacunas de P para N. Perto da interface, ocorre recombinação. Sobram íons fixos que criam o campo interno e dificultam mais difusão.','Depleção = poucos portadores livres.','A faixa central contém íons: negativos no lado P e positivos no lado N. No equilíbrio, deriva e difusão se compensam; a corrente líquida é zero.'],
  forward:['A POSITIVO EM RELAÇÃO A K','A barreira diminui.','A fonte se opõe ao campo interno. A região de depleção fica mais estreita e facilita a injeção de portadores através da junção. A corrente cresce de forma contínua e acentuada com a tensão.','Não existe um interruptor exato em 0,7 V.','Esse valor é uma aproximação útil para certas correntes em silício. A curva real depende do dispositivo e da temperatura.'],
  reverse:['A NEGATIVO EM RELAÇÃO A K','A barreira aumenta.','A fonte afasta os portadores majoritários da interface. A região de depleção se alarga e o campo interno fica mais intenso, dificultando a passagem desses portadores.','Bloqueio não é corrente perfeitamente zero.','Existe uma pequena fuga. Em tensão reversa suficientemente alta pode haver ruptura: o Zener usa essa região de propósito, com corrente limitada.']
 }[mode];
 ['#junctionTag','#junctionHeading','#junctionText','#junctionKey','#junctionDetail'].forEach((id,i)=>$(id).textContent=text[i]);
 let charges='';
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const xP=70+col*((separate?270:left-22)-70)/3,xN=(separate?370:right+22)+col*(570-(separate?370:right+22))/3;
  charges+=particle(xP,110+row*48,'h',-(row+col)*.35)+particle(xN,110+row*48,'e',-(row+col)*.4);
 }
 const ionColumns=width<130?1:2;
 let ions='';if(!separate)for(let row=0;row<3;row++)for(let col=0;col<ionColumns;col++){
  const offset=(col+1)*width/(2*(ionColumns+1));
  ions+=`<text x="${left+offset}" y="${118+row*48}" text-anchor="middle" fill="#e8af72" font-size="20">⊖</text><text x="${320+offset}" y="${118+row*48}" text-anchor="middle" fill="#77bdfa" font-size="20">⊕</text>`;
 }
 const voltageLabel=separate?'Materiais separados':v===0?'Sem fonte externa':v>0?'Fonte: + no P  /  − no N':'Fonte: − no P  /  + no N';
 $('#junction').innerHTML=`<text x="150" y="34" text-anchor="middle" class="svg-label">P · lacunas</text><text x="490" y="34" text-anchor="middle" class="svg-label">N · elétrons</text><rect x="35" y="65" width="${separate?255:285}" height="185" rx="8" fill="#b76e2926" stroke="#af885e"/><rect x="${separate?350:320}" y="65" width="${separate?255:285}" height="185" rx="8" fill="#2586c126" stroke="#5286ac"/>${!separate?`<rect x="${left}" y="65" width="${width}" height="185" fill="#8395ab26" stroke="#9baec1" stroke-dasharray="4 4"/><path d="M${right} 53H${left}m8 -5-8 5 8 5" fill="none" stroke="#adbfd0" stroke-width="2"/>`:''}${charges}${ions}${mode==='forward'?'<g class="junction-cross"><circle cx="320" cy="157" r="6" fill="#65b6fa"/></g>':''}${!separate?`<path d="M${left} 263v8H${right}v-8" class="callout"/><text x="320" y="294" text-anchor="middle" class="svg-label">Depleção ${mode==='forward'?'mais estreita':mode==='reverse'?'mais larga':''}</text>`:''}<text x="320" y="326" text-anchor="middle" class="svg-small">${voltageLabel}</text>`;
 $('#junction').setAttribute('aria-label',text[1]+' '+text[2]);
}
$('#junctionStates').onclick=e=>{const b=e.target.closest('[data-junction]');if(!b)return;junctionState=b.dataset.junction;$('#bias').value=({separate:0,equilibrium:0,forward:.65,reverse:-3})[junctionState];renderJunction();};
$('#bias').oninput=renderJunction;
$('#motion').onclick=()=>{paused=!paused;document.body.classList.toggle('paused',paused);$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').textContent=paused?'Retomar movimento':'Pausar movimento';};
function syncVisibility(){document.body.classList.toggle('inactive',document.hidden||window.labActive===false);}
document.addEventListener('visibilitychange',syncVisibility);window.addEventListener('lab-visibility-change',syncVisibility);syncVisibility();

const benchInfo={
 common:['Uma direção conduz. A outra bloqueia.','O que acontece com a corrente se invertermos o diodo?','Silício · queda direta aproximada de 0,7 V'],
 led:['A corrente controla o brilho.','Se diminuir o resistor, a corrente aumenta ou diminui?','LED vermelho · queda direta aproximada de 2 V'],
 zener:['A entrada sobe. A saída se estabiliza.','Será que o Zener mantém 5,1 V com qualquer tensão de entrada?','Zener reverso de 5,1 V · carga de 1 kΩ'],
 rectifier:['Só um semiciclo chega à carga.','A tensão depois de um diodo já é uma linha contínua?','Retificação de meia onda · carga de 1 kΩ']
};
function chooseExperiment(id){experiment=id;reversed=false;$('#supply').value=id==='zener'?9:id==='rectifier'?8:5;$('#resistance').value=id==='zener'?330:1000;renderBench();}
$('#experiments').onclick=e=>{const b=e.target.closest('[data-experiment]');if(b)chooseExperiment(b.dataset.experiment);};
$('#resetBench').onclick=()=>chooseExperiment(experiment);
$('#supply').oninput=renderBench;$('#resistance').oninput=renderBench;
$('#reverse').onclick=()=>{reversed=!reversed;renderBench();};
function reading(label,value){return `<div><span>${label}</span><strong>${value}</strong></div>`;}
function circuitDrawing({v,r,flow=false,zener=false,led=false,reverse=false,output=0,rectifier=false}){
 const x=zener?440:510,angle=reverse||zener?-90:90;
 const loop=`M100 150V80H210 M310 80H${x}V125 M${x} 235V280H100V210`;
 let svg=`<path class="wire" d="${loop}"/><circle cx="100" cy="180" r="30" class="device"/><text x="100" y="185" text-anchor="middle" class="svg-label">${rectifier?'~':'±'}</text><text x="100" y="237" text-anchor="middle" class="svg-small">${fmt(v)} V${rectifier?'p':''}</text><rect x="210" y="69" width="100" height="22" class="device"/><text x="260" y="51" text-anchor="middle" class="svg-label">${fmt(r,0)} Ω</text><text x="76" y="143" class="svg-small">${rectifier?'':'+'}</text><text x="76" y="222" class="svg-small">${rectifier?'':'−'}</text>`;
 if(led)svg+=`<circle cx="${x}" cy="180" r="47" fill="${flow?'#ff5c5c':'#404958'}" opacity="${flow?Math.min(.65,.15+output*10):.16}"/>`;
 svg+=`<g transform="translate(${x} 180) rotate(${angle}) scale(.85) translate(-70 -30)" class="device">${glyph(zener?'zener':led?'led':'normal')}</g><text x="${x+22}" y="128" class="svg-small">${reverse||zener?'K':'A'}</text><text x="${x+22}" y="242" class="svg-small">${reverse||zener?'A':'K'}</text>`;
 if(flow)svg+=`<path class="flow" d="M100 150V80H210 M310 80H${x}V125 M${x} 235V280H100V210"/>`;
 if(zener)svg+=`<path class="wire" d="M440 80H570V150 M570 210V280H440"/><rect x="558" y="150" width="24" height="60" class="device"/><circle cx="440" cy="80" r="4" fill="currentColor"/><text x="554" y="54" text-anchor="middle" class="svg-label">Saída</text><text x="555" y="316" text-anchor="middle" class="svg-small">Carga · 1 kΩ</text><text x="390" y="184" text-anchor="end" class="svg-label">5,1 V</text>`;
 else svg+=`<text x="300" y="180" text-anchor="middle" class="svg-label">${flow?'Corrente convencional ↻':rectifier?'Conduz no semiciclo +':'Sem corrente no modelo'}</text><text x="300" y="208" text-anchor="middle" class="svg-small">${reverse?'Diodo invertido':led?'A luz sai da junção':rectifier?'O outro semiciclo é bloqueado':'Corrente direta: A → K'}</text>`;
 svg+=`<text x="320" y="337" text-anchor="middle" class="svg-small">${zener?'O resistor limita a corrente; o Zener fica em paralelo com a carga.':rectifier?'O resistor representa a carga.':'Modelo didático com resistor limitador em série.'}</text>`;
 return svg;
}
function renderBench(){
 const v=Number($('#supply').value),r=Number($('#resistance').value),z=experiment==='zener',led=experiment==='led',rect=experiment==='rectifier';
 $$('[data-experiment]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.experiment===experiment)));
 $('#experimentTitle').textContent=benchInfo[experiment][0];$('#prediction').textContent=benchInfo[experiment][1];$('#circuitCaption').textContent=benchInfo[experiment][2];
 $('#supplyLabel').textContent=rect?'Pico da entrada alternada':'Tensão da fonte';$('#supplyValue').textContent=fmt(v)+' V';$('#resistanceValue').textContent=fmt(r,0)+' Ω';
 $('#resistanceControl').hidden=rect;$('#wavePanel').hidden=!rect;$('#reverse').hidden=z||rect;$('#reverse').setAttribute('aria-pressed',String(reversed));$('#reverse').textContent=reversed?'Voltar à polarização direta':'Inverter o diodo';
 let feedback='',note='',svg='';
 if(z){
  const model=zenerCircuit(v,r);
  svg=circuitDrawing({v,r,flow:model.regulating,zener:true});
  $('#readings').innerHTML=reading('Tensão de saída',fmt(model.output,2)+' V')+reading('Corrente no Zener',fmt(model.zenerCurrent*1000,1)+' mA')+reading('Corrente na carga',fmt(model.loadCurrent*1000,1)+' mA');
  feedback=model.regulating?`<strong>Em regulação no modelo: ${fmt(model.output,1)} V.</strong><p>O resistor recebe ${fmt(v-model.output,1)} V. Dos ${fmt(model.sourceCurrent*1000,1)} mA da fonte, ${fmt(model.loadCurrent*1000,1)} mA vão para a carga e ${fmt(model.zenerCurrent*1000,1)} mA para o Zener.</p>`:'<strong>Ainda não regula.</strong><p>A entrada não fornece corrente suficiente para manter a ruptura. A saída segue o divisor formado pelo resistor em série e pela carga.</p>';
  if(model.power>.5)feedback+=`<p>Atenção ao modelo de 0,5 W: a dissipação calculada no Zener chegou a ${fmt(model.power,2)} W.</p>`;
  note='Zener ideal: a regulação começa assim que sobra corrente para ele. Na prática é preciso uma corrente mínima, e a tensão varia. PZ = VZ × IZ. Referência térmica desta aula: 0,5 W.';
 }else{
  const m=seriesDiode(v,rect?1000:r,led?2:.7,reversed),current=m.current;
  svg=circuitDrawing({v,r:rect?1000:r,flow:!rect&&current>0,led,reverse:reversed,output:current,rectifier:rect});
  $('#readings').innerHTML=rect?reading('Pico de entrada',fmt(v)+' V')+reading('Pico de saída',fmt(Math.max(0,v-.7))+' V')+reading('Pico de corrente',fmt(current*1000)+' mA'):reading('Corrente',fmt(current*1000)+' mA')+reading('Tensão A − K',fmt(m.diodeVoltage)+' V')+reading('Queda no resistor',fmt(m.resistorVoltage)+' V');
  feedback=rect?'<strong>A saída é contínua pulsante.</strong><p>O diodo permite o semiciclo positivo, descontando a queda direta aproximada. Não há filtro: a tensão volta a zero a cada período.</p>':reversed?'<strong>Polarização reversa: bloqueado neste modelo.</strong><p>A corrente calculada é zero porque omitimos a fuga. A tensão A − K é negativa.</p>':current>0?`<strong>${led?'O LED está aceso.':'O diodo conduz.'}</strong><p>I ≈ (Vfonte − ${led?'2':'0,7'} V) / R = ${fmt(current*1000)} mA. A tensão que sobra fica no resistor.</p>`:`<strong>${led?'O LED está apagado.':'Sem condução no modelo.'}</strong><p>A fonte não supera a queda constante adotada: ${led?'2':'0,7'} V. O diodo real tem uma curva gradual, não um degrau.</p>`;
  if(led&&!reversed&&current>.02)feedback+='<p>Acima de 20 mA, a referência desta aula. Aumente o resistor para reduzir a corrente; o limite real vem da folha de dados.</p>';
  if(led&&reversed&&v>5)feedback+='<p>Muitos LEDs suportam pouca tensão reversa. Este modelo não representa dano.</p>';
  note=rect?'Fonte senoidal ideal e diodo com queda fixa de 0,7 V. Valores mostrados são de pico, não valores eficazes nem médios.':'Modelo de queda constante: não calcula aquecimento, fuga ou ruptura reversa. O brilho ilustrado não é uma medida fotométrica.';
 }
 $('#circuit').innerHTML=svg;$('#benchFeedback').innerHTML=feedback;$('#modelNote').textContent=note;
 if(rect)renderWave(v);
}
function renderWave(peak){
 const axis=110,scale=6.4;
 const curve=fn=>Array.from({length:241},(_,i)=>`${i?'L':'M'}${50+i*2.3} ${axis-fn(i/240*Math.PI*4)*scale}`).join(' ');
 $('#wave').innerHTML=`<path d="M50 22V189H610 M50 110H610" class="callout"/><text x="10" y="24" class="svg-small">V</text><text x="25" y="115" class="svg-small">0</text><text x="50" y="206" class="svg-small">0</text><text x="315" y="206" class="svg-small">T</text><text x="560" y="206" class="svg-small">2T · tempo</text><path d="${curve(t=>peak*Math.sin(t))}" fill="none" stroke="#66b7f4" stroke-width="2"/><path d="${curve(t=>rectified(t,peak))}" fill="none" stroke="var(--d-accent)" stroke-width="3" stroke-dasharray="6 3"/>`;
}

const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderTypes(){
 const q=normalize($('#typeSearch').value.trim()),group=$('#typeGroup').value;
 const items=diodeTypes.filter(t=>(group==='Todos'||group===t.group)&&normalize(`${t.name} ${t.phrase} ${t.use} ${t.example}`).includes(q));
 $('#typeCount').textContent=`${items.length} de ${diodeTypes.length} itens`;
 if(!items.some(t=>t.id===selectedType))selectedType=items[0]?.id;
 $('#typeList').innerHTML=items.map(t=>`<button class="type-card" data-type="${t.id}" aria-pressed="${t.id===selectedType}">${symbolSvg(t.symbol)}<span>${t.name}</span></button>`).join('')||'<p>Nenhum tipo encontrado. Tente outra palavra ou escolha “Todos”.</p>';
 const t=diodeTypes.find(t=>t.id===selectedType);
 $('#typeDetail').hidden=!t;if(!t)return;
 $('#typeDetail').innerHTML=`<span class="eyebrow">${t.group}</span><h3>${t.name}</h3>${symbolSvg(t.symbol)}<p class="phrase">${t.phrase}</p><h4>Como funciona</h4><p>${t.how}</p><h4>Onde aparece</h4><p>${t.use}</p><h4>Exemplo / identificação</h4><p>${t.example}</p><div class="takeaway"><strong>Não confunda</strong><p>${t.detail}</p></div>${t.lab?`<button class="primary" id="openExperiment">Experimentar na bancada →</button>`:''}`;
 if(t.lab)$('#openExperiment').onclick=()=>{chooseExperiment(t.lab);showStep(2);};
}
$('#typeList').onclick=e=>{const b=e.target.closest('[data-type]');if(b){selectedType=b.dataset.type;renderTypes();$(`[data-type="${selectedType}"]`)?.focus({preventScroll:true});}};
$('#typeSearch').oninput=renderTypes;$('#typeGroup').onchange=renderTypes;
const questions=[
 {q:'Na polarização reversa de uma junção P–N, o que acontece com a camada de depleção?',options:['Fica mais larga.','Desaparece completamente.','Transforma-se em metal.'],correct:0,why:'A fonte afasta os portadores majoritários da interface. A região com poucos portadores livres aumenta.'},
 {q:'O que permanece na camada de depleção?',options:['Somente elétrons livres.','Íons fixos da rede cristalina.','Nada: ela é um espaço vazio.'],correct:1,why:'Há cargas fixas: aceitadores negativos no lado P e doadores positivos no lado N. “Depleção” se refere à falta de portadores móveis.'},
 {q:'Um Zener nominal de 5,1 V recebe apenas 3 V pela resistência em série. A saída fica em 5,1 V?',options:['Sim, ele cria a tensão que falta.','Não. Ele não consegue elevar essa tensão.','Sim, se for invertido.'],correct:1,why:'Um regulador em derivação com Zener não eleva tensão. É preciso entrada suficiente e corrente disponível para a região de ruptura.'},
 {q:'Por que colocar um resistor em série com um LED?',options:['Para transformar o LED em diodo Zener.','Para inverter a cor automaticamente.','Para limitar a corrente.'],correct:2,why:'Uma pequena variação de tensão pode provocar grande variação de corrente no LED. O resistor absorve a tensão restante e limita a corrente.'},
 {q:'Qual componente é apropriado para variar uma capacitância com tensão reversa?',options:['Varicap.','Retificador de rede, por definição.','LED branco.'],correct:0,why:'O varicap explora a capacitância da junção: maior tensão reversa geralmente significa depleção mais larga e menor capacitância.'},
 {q:'Todo dispositivo chamado diodo contém uma junção P–N?',options:['Sim, sem exceção.','Não. Schottky e Gunn são exemplos diferentes.','Somente os que emitem luz.'],correct:1,why:'Schottky usa uma barreira metal–semicondutor. Gunn usa o efeito de elétrons transferidos. A aula da junção P–N não descreve todos os tipos.'},
 {q:'Após retificar uma senoide com apenas um diodo e uma carga, o que aparece na saída?',options:['Uma tensão constante e perfeitamente lisa.','Uma tensão alternada idêntica à entrada.','Uma tensão pulsante, com um semiciclo bloqueado.'],correct:2,why:'A retificação seleciona um sentido. Filtragem e regulação são outras etapas do circuito.'}
];
function renderQuestion(){
 answered=false;const q=questions[questionIndex];$('#quizProgress').textContent=`DESAFIO ${questionIndex+1} DE ${questions.length}`;$('#question').textContent=q.q;
 $('#answers').innerHTML=q.options.map((option,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)} · ${option}</button>`).join('');$('#quizFeedback').textContent='';$('#nextQuestion').disabled=true;$('#nextQuestion').textContent=questionIndex===questions.length-1?'Concluir desafios ✓':'Próximo desafio →';
}
$('#answers').onclick=e=>{const b=e.target.closest('[data-answer]');if(!b||answered)return;answered=true;const q=questions[questionIndex],answer=Number(b.dataset.answer);$$('[data-answer]').forEach(button=>{button.disabled=true;button.classList.toggle('correct',Number(button.dataset.answer)===q.correct);});b.classList.add('chosen');$('#quizFeedback').textContent=(answer===q.correct?'Isso mesmo! ':'Vamos rever: ')+q.why;$('#nextQuestion').disabled=false;};
$('#nextQuestion').onclick=()=>{if(questionIndex<questions.length-1){questionIndex++;renderQuestion();}else{$('#quizFeedback').textContent='Trilha concluída! Agora escolha um tipo de diodo e explique à turma o que ele faz, como é polarizado e onde pode ser usado.';$('#nextQuestion').disabled=true;}};
$('#restartQuiz').onclick=()=>{questionIndex=0;renderQuestion();};
renderJunction();renderBench();renderTypes();renderQuestion();showStep(0);

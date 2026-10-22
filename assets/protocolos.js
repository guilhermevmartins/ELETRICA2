(() => {
 'use strict';
 const $=id=>document.getElementById(id),protocols=window.NETWORK_PROTOCOLS;
 let selected=0,step=0,playing=false,elapsed=0,last=0,frame=0;
 const positions={star:[[130,200],[470,200],[800,100],[800,300]],bus:[[120,120],[360,120],[600,120],[840,120]],line:[[120,205],[360,205],[600,205],[840,205]]};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const active=()=>window.labActive!==false&&!document.hidden;
 const text=(id,value)=>{$(id).textContent=value;};
 const current=()=>protocols[selected];
 function routePoints(from,to){
  const p=current(),pos=positions[p.layout],a=pos[from],b=pos[to];
  return p.layout==='bus'?[a,[a[0],280],[b[0],280],b]:[a,b];
 }
 function nodeInfo(index){
  const node=current().nodes[index];text('nodeTitle',node[0]+' · '+node[1]);text('nodeDescription',node[2]);
  document.querySelectorAll('.network-node').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 }
 function draw(){
  const p=current(),pos=positions[p.layout];
  const pairs=p.layout==='star'?[[0,1],[1,2],[1,3]]:p.layout==='line'?[[0,1],[1,2],[2,3]]:[];
  let lines=pairs.map(([a,b])=>`<path class="net-wire" d="M${pos[a].join(',')}L${pos[b].join(',')}"/>`).join('');
  if(p.layout==='bus')lines=`<path class="net-wire" d="M70 280H890"/>`+pos.map(([x,y])=>`<path class="net-wire" d="M${x} ${y}V280"/><circle cx="${x}" cy="280" r="5" fill="#8ea9c3"/>`).join('')+'<path d="M70 262V298M890 262V298" stroke="#edbd7e" stroke-width="6"/><text x="70" y="325" class="net-label">Terminação</text><text x="800" y="325" class="net-label">Terminação</text>';
  $('networkLines').innerHTML=lines+'<path id="activeRoute" class="net-route"/><circle id="packet" r="8" fill="#74f1cc" stroke="#0d2631" stroke-width="3"/>';
  $('networkNodes').innerHTML=p.nodes.map((node,i)=>`<button type="button" class="network-node" data-node="${i}" aria-pressed="false" style="left:${pos[i][0]/9.6}%;top:${pos[i][1]/4.1}%"><span class="node-number">${String(i+1).padStart(2,'0')}<i aria-hidden="true"></i></span><strong>${node[0]}</strong><small>${node[1]}</small></button>`).join('');
  document.querySelectorAll('[data-node]').forEach(button=>button.onclick=()=>nodeInfo(Number(button.dataset.node)));
  text('stageCaption',p.layout==='bus'?'Barramento compartilhado · derivações ampliadas no desenho':p.id==='mqtt'?'Conexões lógicas com o broker · infraestrutura física omitida':p.id==='iolink'?'CLP ↔ master: rede superior · master ↔ dispositivos: IO-Link':p.layout==='line'?'Quadro em passagem · o retorno usa os mesmos enlaces':'Cada equipamento possui seu enlace com o switch');
  nodeInfo(0);showStep();
 }
 function showStep(){
  const p=current(),s=p.steps[step],ids=s[2];elapsed=0;
  text('stepCount',String(step+1).padStart(2,'0')+' / '+p.steps.length);text('stepTitle',s[0]);text('stepText',s[1]);
  const branches=p.id==='mqtt'&&step===3?[[1,2],[1,3]]:[ids];
  const paths=branches.filter(branch=>branch.length>1).map(branch=>'M'+branch.slice(1).flatMap((id,i)=>routePoints(branch[i],id)).map(point=>point.join(',')).join('L'));
  $('activeRoute').setAttribute('d',paths.join(' '));
  $('packet').style.display=paths.length&&!reduced.matches?'':'none';
  document.querySelectorAll('.network-node').forEach((button,i)=>button.dataset.active=String(ids.includes(i)));
  $('stepDots').innerHTML=p.steps.map((s,i)=>`<button type="button" data-step="${i}" aria-current="${i===step?'step':'false'}" aria-label="Etapa">${i+1}. ${s[0]}</button>`).join('');
  document.querySelectorAll('[data-step]').forEach(button=>{button.setAttribute('aria-label','Etapa '+(Number(button.dataset.step)+1));button.onclick=()=>{playing=false;step=Number(button.dataset.step);showStep();updatePlay();};});
  placePacket(0);
 }
 function placePacket(t){const path=$('activeRoute');if(!path.getAttribute('d')||reduced.matches)return;const point=path.getPointAtLength(path.getTotalLength()*t);$('packet').setAttribute('cx',point.x);$('packet').setAttribute('cy',point.y);}
 function updatePlay(){text('play',playing?'Pausar animação':'Reproduzir troca de dados');$('play').setAttribute('aria-pressed',String(playing));schedule();}
 function select(index){
  selected=index;step=0;playing=false;const p=current();
  document.querySelectorAll('[data-protocol]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  text('family',p.family);text('protocolTitle',p.name);text('summary',p.summary);text('topology',p.topology);text('application',p.application);text('caution',p.caution);
  $('facts').innerHTML=[['Meio / base',p.medium],['Identificação',p.address],['Comunicação',p.conversation]].map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  draw();updatePlay();
 }
 function tick(now){frame=0;if(!playing||!active()){last=0;return;}if(last)elapsed+=Math.min(now-last,100);last=now;
  if(elapsed>=3400){step=(step+1)%current().steps.length;showStep();}
  placePacket(Math.min(elapsed/2800,1));schedule();
 }
 function schedule(){if(playing&&active()&&!frame)frame=requestAnimationFrame(tick);if(!playing||!active()){if(frame)cancelAnimationFrame(frame);frame=0;last=0;}}
 $('protocolPicker').innerHTML=protocols.map((p,i)=>`<button type="button" data-protocol="${i}" aria-pressed="false"><span>${String(i+1).padStart(2,'0')}</span>${p.name}</button>`).join('');
 document.querySelectorAll('[data-protocol]').forEach(button=>button.onclick=()=>select(Number(button.dataset.protocol)));
 $('play').onclick=()=>{playing=!playing;updatePlay();};$('next').onclick=()=>{playing=false;step=(step+1)%current().steps.length;showStep();updatePlay();};$('restart').onclick=()=>{playing=false;step=0;showStep();updatePlay();};
 window.addEventListener('lab-visibility-change',schedule);document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{showStep();});
 $('comparison').innerHTML=protocols.map(p=>`<tr><th scope="row">${p.name}</th><td>${p.medium}</td><td>${p.topology}</td><td>${p.conversation}</td></tr>`).join('');
 $('references').innerHTML=protocols.map(p=>`<li><a href="${p.source[1]}" target="_blank" rel="noopener noreferrer">${p.source[0]}</a></li>`).join('');
 const questions=[
  ['Dois equipamentos têm RJ45. Eles necessariamente conversam?',['Sim, o conector garante','Não, o protocolo também precisa ser compatível'],1,'Correto: o conector não define o protocolo nem a compatibilidade da aplicação.'],
  ['Qual arquitetura entrega mensagens por tópicos?',['MQTT com broker','Modbus RTU'],0,'O broker MQTT entrega publicações aos clientes que assinam os tópicos correspondentes.'],
  ['No IO-Link, dois sensores compartilham a mesma porta?',['Sim, em barramento','Não, cada porta conecta um device'],1,'IO-Link conecta um device a cada porta do master, por um enlace ponto a ponto.'],
  ['Qual exemplo usa processamento do quadro em passagem?',['EtherCAT','Modbus TCP'],0,'Os SubDevices EtherCAT processam os dados enquanto o quadro passa pelo hardware.'],
  ['Como integrar um dispositivo Modbus RTU a uma rede Modbus TCP?',['Só trocar o conector','Usar um gateway apropriado'],1,'O gateway faz a ponte entre os protocolos e interfaces. Um adaptador de conector não basta.']
 ];let question=0;
 function quiz(){const q=questions[question];text('quizQuestion',q[0]);text('quizFeedback','');$('quizChoices').innerHTML=q[1].map((choice,i)=>`<button type="button" data-answer="${i}">${choice}</button>`).join('');document.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{const correct=Number(button.dataset.answer)===q[2];text('quizFeedback',correct?q[3]:'Ainda não. Pense no papel da rede e tente a outra alternativa.');$('quizFeedback').dataset.correct=String(correct);});}
 $('quizNext').onclick=()=>{question=(question+1)%questions.length;quiz();};
 select(0);quiz();
})();

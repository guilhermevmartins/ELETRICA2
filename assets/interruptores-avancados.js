/* Bancadas de contatos ideais. Cargas resistivas de resistência constante.
   Dimmer: corte simétrico no início de cada semiciclo, com ângulo alpha.
   Tomada: circuito próprio; não se compartilha o neutro a jusante com iluminação. */
(()=>{'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',type=document.body.dataset.activity;
const state={q1:true,q2:true,s:[type==='dimmer',false,false],count:2,plug:false,level:65,paused:false,phase:0,inspection:null,lesson:-1};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let frame=0,last=0,flows=[],layer,inspectionPaths=[];
const names={multiplo:'Interruptor duplo e triplo',tomada:'Interruptor com tomada',bipolar:'Interruptor bipolar',dimmer:'Dimmer'};
const f=n=>n.toFixed(2).replace('.',','),yn=v=>v?'Ligado':'Desligado';
const voltage=()=>type==='bipolar'?220:127;
const alpha=()=>Math.PI*(1-state.level/100);
const fraction=()=>{const a=alpha();return Math.max(0,1-a/Math.PI+Math.sin(2*a)/(2*Math.PI))};
function values(){
 if(type==='multiplo')return Array.from({length:state.count},(_,i)=>state.q1&&state.s[i]?60:0);
 if(type==='tomada')return [state.q1&&state.s[0]?60:0,state.q2&&state.plug?100:0];
 if(type==='bipolar')return [state.q1&&state.s[0]?60:0];
 return [state.q1&&state.s[0]?60*fraction():0];
}
const active=()=>values().some(p=>p>1e-8);
const txt=(x,y,t,c='minor',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${c}${t.includes('RETORNO')?' wire-name':''}">${t}</text>`;
const terminal=(x,y)=>`<circle class="terminal" cx="${x}" cy="${y}" r="5"/>`;
const wire=(d,c)=>`<path class="wire ${c}" data-wire="${c}" d="${d}"/>`;
const dot=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="5" style="fill:var(--${c})"/>`;
const bridge=(x,from,to,at)=>`M${x} ${from}V${at-13}Q${x+24} ${at} ${x} ${at+13}V${to}`;
function control(key,label,content,x,y,w,h){return `<g class="diagram-control" role="button" tabindex="0" data-action="${key}" aria-label="${label}"><rect class="hit-area" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>${content}</g>`}
function contact(x,y,on,key,label,c='phase'){
 const end=x+80;return control(key,label,wire(`M${x} ${y}L${on?end:x+66} ${on?y:y-40}`,c)+terminal(x,y)+terminal(end,y),x-16,y-58,112,85);
}
function breaker(x,y,on,key,label){return control(key,label,`<path class="device-arch" d="M${x} ${y}Q${x+40} ${y-55} ${x+80} ${y}"/><path class="breaker-blade" d="M${x} ${y}L${on?x+80:x+67} ${on?y:y-38}"/>${terminal(x,y)+terminal(x+80,y)+txt(x+40,Math.max(24,y-67),label,'device-label')}`,x-15,y-58,110,85)}
function lamp(x,y,on,label,brightness=1,horizontal=false,returnColor='return'){return `<g class="${on?'load-on':'load-off'}" data-lamp="${label}"><circle class="light-halo" cx="${x}" cy="${y}" r="82" fill="url(#lampGlow)" style="opacity:${on?.25+.75*brightness:0}"/><rect class="luminaire-body" x="${x-50}" y="${y-55}" width="100" height="110" rx="10"/><circle class="earth-lug" cx="${x+40}" cy="${y-55}" r="5"/><circle class="lamp-bulb" cx="${x}" cy="${y}" r="35" style="${on?'fill:rgb('+Math.round(60+195*brightness)+','+Math.round(55+164*brightness)+','+Math.round(40+92*brightness)+')':''}"/><path class="lamp-cross" d="M${x-24} ${y-24}L${x+24} ${y+24}M${x-24} ${y+24}L${x+24} ${y-24}"/>${horizontal?wire(`M${x-50} ${y}H${x-35}`,returnColor)+wire(`M${x+35} ${y}H${x+50}`,'neutral'):wire(`M${x} ${y-55}V${y-35}`,'return')+wire(`M${x} ${y+35}V${y+55}`,type==='bipolar'?'v2':'neutral')}${txt(horizontal?x:x-90,y+84,label,'device-label',horizontal?'middle':'end')}</g>`}
const filament=(x,y)=>`L${x-13} ${y-22}L${x+13} ${y-9}L${x-13} ${y+4}L${x+13} ${y+17}L${x} ${y+35}`;
function defs(){return '<defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#51667b" opacity=".17"/></pattern><radialGradient id="lampGlow"><stop stop-color="#ffe396" stop-opacity=".48"/><stop offset="1" stop-color="#ffce68" stop-opacity="0"/></radialGradient></defs>'}
function source(x,y1,y2,label){const cy=(y1+y2)/2,r=Math.min(32,(y2-y1)/2);return `<g class="source"><path d="M${x} ${y1}V${cy-r}M${x} ${cy+r}V${y2}"/><circle cx="${x}" cy="${cy}" r="${r}"/><path d="M${x-15} ${cy}q8 -17 15 0t15 0"/>${txt(x+45,cy+5,label,'minor','start')}</g>`}
function multiple(){const rows=state.count===2?[285,500]:[290,470,650],lastY=rows.at(-1),h=lastY+125;
 let s=source(75,70,130,'127 V')+txt(75,48,'L · FASE','phase-text')+txt(75,157,'N','neutral-text')+txt(75,178,'PE','pe-text');
 s+=wire('M75 70H145M225 70H270','phase')+breaker(145,70,state.q1,'q1','QF1 · 1P');
 const phase=`M270 70V117Q294 130 270 143V177Q294 190 270 203V${lastY}`;

 s+=wire(`M75 130H1060V${lastY}`,'neutral')+wire(`M75 190H1140V${lastY-55}`,'pe')+`<path class="pe-yellow" d="M75 190H1140V${lastY-55}"/>`;
 s+=`<path class="crossing-underlay" d="${phase}"/>`+wire(phase,'phase');
 let routes=[];
 rows.forEach((y,i)=>{const c=['return','v1','v2'][i],on=state.q1&&state.s[i],pe=`M1140 ${y-55}H1073Q1060 ${y-79} 1047 ${y-55}H890`;
 s+=wire(`M270 ${y}H400`,'phase')+dot(270,y,'phase')+contact(400,y,state.s[i],'s'+i,`Acionar S${i+1}`,c)+wire(`M480 ${y}H815`,c)+wire(`M885 ${y}H1060`,'neutral')+dot(1060,y,'neutral')+`<path class="crossing-underlay" d="${pe}"/>`+wire(pe,'pe')+`<path class="pe-yellow" d="${pe}"/>`+lamp(850,y,on,`L${i+1} · 60 W`,1,true,c);
 s+=txt(440,y+43,`S${i+1} · TECLA ${i+1}`,'device-label')+`<g class="wire-name">${txt(640,y-18,`R${i+1} · RETORNO`,c==='return'?'return-text':c+'-text')}</g>`;
 routes.push({on,d:`M75 70H145H225H270V117Q294 130 270 143V177Q294 190 270 203V${y}H400H480H815L828 ${y-13}L841 ${y+13}L854 ${y-13}L867 ${y+13}L885 ${y}H1060V130H75V70`});
 });
 s+=txt(690,80,'UMA FASE · RETORNOS INDEPENDENTES','device-label');
 return {s,routes,h};
}
function socket(){let s='',routes=[];
 s+=txt(100,50,'DOIS CIRCUITOS NO QUADRO','device-label','start')+txt(100,80,'Mesma placa na parede; alimentações independentes.','minor','start');
 for(const [i,top,bottom] of [[0,190,310],[1,460,740]]){const q=i?state.q2:state.q1;s+=source(90,top,bottom,'127 V')+txt(55,top-14,'L','phase-text')+txt(55,bottom+28,'N','neutral-text');s+=wire(`M90 ${top}H250M330 ${top}H400`,'phase')+breaker(250,top,q,'q'+(i+1),'QF'+(i+1)+' · 1P');}
 s+=contact(400,190,state.s[0],'s0','Acionar interruptor S1')+wire('M480 190H850V215','return')+wire('M90 310H850V285','neutral');
 s+=wire('M90 370H1000V195H890','pe')+'<path class="pe-yellow" d="M90 370H1000V195H890"/>'+lamp(850,250,state.q1&&state.s[0],'L1 · 60 W')+txt(440,235,'S1 · ILUMINAÇÃO','device-label')+txt(655,168,'R · RETORNO','return-text');
 s+=wire('M400 460H700V540H785','phase')+wire('M90 740H950V540H855','neutral');
 const pe='M90 820H820V753Q844 740 820 727V600';
 s+='<path class="crossing-underlay" d="'+pe+'"/>'+wire(pe,'pe')+'<path class="pe-yellow" d="'+pe+'"/>';
 s+='<g><rect class="device-box" x="750" y="505" width="150" height="130" rx="18"/>'+wire('M750 540H785','phase')+wire('M855 540H900','neutral')+wire('M820 635V600','pe')+'<path class="pe-yellow" d="M820 635V600"/>'+terminal(785,540)+terminal(855,540)+terminal(820,600)+txt(764,565,'L','phase-text')+txt(877,565,'N','neutral-text')+txt(793,610,'PE','pe-text','end')+'</g>';
 s+=txt(650,610,'T1 · TOMADA','device-label','end')+txt(650,638,'2P+T','minor','end')+txt(530,427,'ALIMENTAÇÃO DIRETA · SEM PASSAR POR S1','device-label');
 const load=state.q2&&state.plug,cord='M785 540V400H1080V485M855 540V650H937Q950 626 963 650H1080V565';
 s+='<path class="crossing-underlay" d="'+cord+'"/><path d="'+cord+'" fill="none" stroke="'+(state.plug?'#c5d1db':'#657a8a')+'" stroke-width="5" stroke-dasharray="'+(state.plug?'none':'8 8')+'"/>';
 s+=terminal(785,540)+terminal(855,540);
 s+=control('plug','Conectar ou retirar carga da tomada','<rect class="device-box" x="1035" y="480" width="90" height="90" rx="8"/><path class="lamp-cross" d="M1080 485l-15 12 30 12-30 12 30 12-15 32"/>'+txt(1080,700,'CARGA · 100 W','device-label')+txt(1080,726,state.plug?'CONECTADA':'DESCONECTADA'),1020,470,120,110);
 s+=txt(90,800,'PE','pe-text')+txt(340,875,'PE não conduz corrente normal. Pontes e cruzamentos sem ponto não representam emendas.','minor','start');
 routes.push({on:state.q1&&state.s[0],d:`M90 190H250H330H400H480H850V215${filament(850,250)}V310H90V190`},{on:load,d:'M90 460H250H330H400H700V540H785V400H1080V485L1065 497L1095 509L1065 521L1095 533L1080 565V650H963Q950 626 937 650H855V540H950V740H90V460'});
 return {s,routes,h:920};
}
function bipolar(){const on=state.q1&&state.s[0];let s=source(90,210,430,'220 V entre fases');
 s+=txt(75,175,'L1 · FASE','phase-text')+txt(75,473,'L2 · FASE','v1-text')+txt(75,540,'PE','pe-text');
 s+=wire('M90 210H250M330 210H450','phase')+wire('M90 430H250M330 430H450','v1');
 const q=breaker(250,210,state.q1,'q1','QF1 · 2P')+breaker(250,430,state.q1,'q1','QF1 · 2P');s+=q+`<path class="coupling" d="M290 210V340M290 385V430"/>`;
 s+=contact(450,210,state.s[0],'s0','Acionar os dois polos de S1','phase')+contact(450,430,state.s[0],'s0','Acionar os dois polos de S1','v1')+`<path class="coupling" d="M490 210V280M490 370V430"/>`;
 s+=txt(490,322,'S1 · BIPOLAR','device-label')+txt(490,346,'UMA TECLA / DOIS CONTATOS')+wire('M530 210H850V285','return')+wire('M530 430H850V355','v2');
 s+=wire('M90 520H1000V265H890','pe')+'<path class="pe-yellow" d="M90 520H1000V265H890"/>'+lamp(850,320,on,'LÂMPADA · 220 V / 60 W');
 s+=txt(850,150,'SEM NEUTRO NESTA LIGAÇÃO','device-label')+txt(680,190,'R1 · RETORNO','return-text')+txt(680,458,'R2 · RETORNO','v2-text')+txt(690,490,'Dois polos abrem e fecham juntos.');
 return {s,h:600,routes:[{on,d:`M90 210H250H330H450H530H850V285${filament(850,320)}V430H530H450H330H250H90V210`}]};
}
function dimmer(){const p=values()[0],brightness=Math.pow(p/60,.55),on=p>1e-8;let s=source(90,180,420,'127 V');
 s+=txt(90,143,'L · FASE','phase-text')+txt(90,451,'N · NEUTRO','neutral-text');
 s+=wire('M90 180H250M330 180H410','phase')+breaker(250,180,state.q1,'q1','QF1 · 1P');
 s+=control('s0','Ligar ou desligar o dimmer',`<rect class="device-box" x="410" y="130" width="150" height="100" rx="12"/><path d="M436 202l35-49v49zm-5 12 92-70m-19 1 19-1-3 19" stroke="#b9d8e8" stroke-width="3" fill="none"/>${txt(485,254,'D1 · DIMMER','device-label')+txt(485,275,state.s[0]?'HABILITADO':'DESLIGADO')}`,400,120,170,120);
 s+=wire('M560 180H850V265','return')+wire('M90 420H850V335','neutral')+wire('M90 500H1000V245H890','pe')+'<path class="pe-yellow" d="M90 500H1000V245H890"/>'+lamp(850,300,on,'L1 · RESISTIVA / 60 W',brightness);
 s+=txt(755,150,'R · RETORNO CONTROLADO','return-text')+txt(650,465,'Carga de resistência constante no modelo.');
 return {s,h:580,routes:[{on,d:`M90 180H250H330H410H560H850V265${filament(850,300)}V420H90V180`}]};
}
function buildDiagram(){const data=({multiplo:multiple,tomada:socket,bipolar,dimmer}[type])(),svg=$('circuit');svg.setAttribute('viewBox',`0 0 1200 ${data.h}`);
 svg.innerHTML=defs()+`<rect width="1200" height="${data.h}" fill="url(#grid)"/>`+data.s+'<g id="currentPaths" fill="none" stroke="none">'+data.routes.map((r,i)=>`<path id="flow${i}" d="${r.d}"/>`).join('')+'</g><g id="currentParticles" class="current-layer" aria-hidden="true"></g>';
 svg.dataset.closed=String(active());layer=$('currentParticles');flows=data.routes.map((r,i)=>{const path=$('flow'+i),length=path.getTotalLength(),group=document.createElementNS(NS,'g');group.dataset.branch=i;layer.append(group);const dots=Array.from({length:Math.ceil(length/32)},()=>{const d=document.createElementNS(NS,'circle');d.setAttribute('r',3.5);group.append(d);return d});return {...r,path,length,group,dots}});
 for(const el of svg.querySelectorAll('[data-action]')){el.onclick=()=>manual(el.dataset.action);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();manual(el.dataset.action)}};const k=el.dataset.action;el.setAttribute('aria-pressed',k==='q1'?state.q1:k==='q2'?state.q2:k==='plug'?state.plug:state.s[+k.slice(1)])}
 inspectionPaths=[...svg.querySelectorAll('[data-wire]')];renderInspection();
 svg.querySelectorAll('.wire-name').forEach(e=>e.toggleAttribute('hidden',$('toggleLabels').getAttribute('aria-pressed')==='false'));
}
function conducting(){if(type!=='dimmer')return true;const a=((state.phase%Math.PI)+Math.PI)%Math.PI;return a>=alpha()&&state.level>0}
function positionDots(){for(const flow of flows){flow.group.toggleAttribute('hidden',!flow.on||!conducting());if(!flow.on)continue;flow.dots.forEach((d,i)=>{const p=flow.path.getPointAtLength((i*flow.length/flow.dots.length+(type==='dimmer'?-Math.cos(state.phase):Math.sin(state.phase))*36+flow.length)%flow.length);d.setAttribute('cx',p.x);d.setAttribute('cy',p.y)})}}
function caption(){const t=!active()?'Sem corrente de funcionamento nas cargas.':!$('showCurrent').checked?'Há carga alimentada; movimento da corrente oculto.':state.paused?'Movimento pausado; os estados elétricos são mantidos.':type==='dimmer'?`CA recortada · ${conducting()?'condução neste trecho do semiciclo':'intervalo bloqueado pelo dimmer'}.`:`CA · ${Math.cos(state.phase)>=0?'da fase para as cargas':'sentido oposto, das cargas para a fonte'}.`;$('motionCaption').textContent=t}
function mayAnimate(){return active()&&$('showCurrent').checked&&!state.paused&&!reduced.matches&&!document.hidden&&window.labActive!==false}
function animate(now){frame=0;if(!mayAnimate())return;state.phase+=(last?Math.min((now-last)/1000,.05):0)*Math.PI/2;last=now;positionDots();caption();frame=requestAnimationFrame(animate)}
function sync(){cancelAnimationFrame(frame);frame=0;last=0;layer.toggleAttribute('hidden',!$('showCurrent').checked||!active());positionDots();caption();if(mayAnimate())frame=requestAnimationFrame(animate)}
function button(key,title,label,on){return `<button data-control="${key}" aria-pressed="${!!on}"><span><b>${title}</b><small>${label}</small></span><em>${on?'● Ligado':'○ Desligado'}</em></button>`}
function controls(){let s='';if(type==='multiplo')s=Array.from({length:state.count},(_,i)=>button('s'+i,'Tecla '+(i+1),`S${i+1} → L${i+1} · retorno R${i+1}`,state.s[i])).join('');else if(type==='tomada')s=button('s0','Interruptor S1','Controla somente a iluminação',state.s[0])+button('plug','Carga da tomada',state.plug?'100 W conectados em T1':'Conectar carga resistiva de 100 W',state.plug);else s=button('s0',type==='bipolar'?'Tecla bipolar S1':'Liga/desliga D1',type==='bipolar'?'Comanda os dois contatos simultaneamente':'Mantém o ajuste escolhido ao desligar',state.s[0]);
 s+=button('q1',type==='bipolar'?'Disjuntor QF1 · 2P':'Disjuntor QF1 · 1P',type==='tomada'?'Circuito de iluminação':'Alimentação do circuito',state.q1);if(type==='tomada')s+=button('q2','Disjuntor QF2 · 1P','Circuito da tomada',state.q2);
 $('experimentControls').innerHTML=s;for(const b of $('experimentControls').children)b.onclick=()=>manual(b.dataset.control);
}
function explanation(){const v=values();if(type==='multiplo')return `A fase alimenta as ${state.count} entradas por uma derivação. ${v.filter(Boolean).length} de ${state.count} lâmpadas acesas: cada tecla interrompe somente seu retorno. ${!state.q1?'QF1 aberto interrompe todas as cargas.':v.every(Boolean)?'As correntes dos ramos se somam na alimentação.':'Uma tecla aberta não impede o funcionamento das demais.'} Neutro e proteção seguem às luminárias.`;
 if(type==='tomada')return `Lâmpada ${v[0]?'acesa':'apagada'}. Tomada ${state.q2?'energizada':'sem alimentação por QF2'}. ${state.q2&&!state.plug?'Sem carga conectada: tensão disponível, mas corrente de carga igual a zero.':state.plug?`Carga ${v[1]?'alimentada':'sem alimentação'}.`:''} S1 e QF1 controlam a iluminação; QF2 controla a tomada. O neutro de cada circuito acompanha sua própria fase.`;
 if(type==='bipolar')return `Os dois contatos de S1 estão ${state.s[0]?'fechados':'abertos'} por uma única tecla. ${!state.q1?'QF1 de dois polos também está aberto.':state.s[0]?'L1 → polo superior → lâmpada → polo inferior → L2: circuito fechado, 220 V na lâmpada.':'As duas fases ficam interrompidas por S1; com QF1 ligado, os dois bornes de entrada de S1 continuam energizados.'} Não há neutro nesta ligação entre fases; PE protege a carcaça.`;
 return `Ajuste de condução: ${state.level}% de cada semiciclo; disparo em ${Math.round(alpha()*180/Math.PI)}°. ${!state.q1?'QF1 aberto: carga sem alimentação.':!state.s[0]?'Dimmer desligado; ajuste preservado.':state.level===0?'Sem condução neste modelo ideal.':`O dimmer libera a parte final de cada semiciclo. Potência média na carga: ${f(v[0])} W.`} O percentual do controle não é uma medida de luminosidade. Neutro vai diretamente à lâmpada.`;
}
function readings(){const p=values(),total=p.reduce((a,b)=>a+b,0);$('powerValue').innerHTML=f(total)+' <small>W</small>';
 const current=type==='dimmer'?(state.q1&&state.s[0]?60/127*Math.sqrt(fraction()):0):total/voltage();$('currentValue').innerHTML=f(current)+' <small>A</small>';
 $('lampState').textContent=type==='tomada'?`${p[0]?'Luz acesa':'Luz apagada'} · tomada ${state.q2?'energizada':'desligada'}`:type==='multiplo'?`${p.filter(Boolean).length} de ${state.count} acesas`:p[0]>1e-8?'Lâmpada acesa':'Lâmpada apagada';$('lampStatus').classList.toggle('on',active());
 let rows=p.map((w,i)=>{const name=type==='tomada'?(i?'Tomada · carga 100 W':'L1 · 60 W'):type==='multiplo'?`L${i+1} · retorno R${i+1}`:'Lâmpada · 60 W';return `<div class="branch-reading ${w>0?'on':''}"><span>${name}</span><b>${f(w)} W · ${f(type==='dimmer'?current:w/voltage())} A</b></div>`}).join('');
 if(type==='tomada')rows+=`<div class="branch-reading"><span>Tensão disponível em T1</span><b>${state.q2?'127':'0'} V</b></div>`;
 if(type==='bipolar')rows+=`<div class="branch-reading"><span>Tensão na lâmpada</span><b>${p[0]?'220':'0'} V</b></div>`;
 if(type==='dimmer'){const vrms=127*(state.q1&&state.s[0]?Math.sqrt(fraction()):0);rows+=`<div class="branch-reading"><span>Tensão eficaz na carga</span><b>${f(vrms)} V</b></div><div class="branch-reading"><span>Ângulo de disparo α</span><b>${Math.round(alpha()*180/Math.PI)}°</b></div>`}
 $('branchReadings').innerHTML=rows;
}
const descriptions={phase:'Fase em vermelho neste exemplo. A entrada dos interruptores pode permanecer energizada mesmo quando a lâmpada está apagada. A cor identifica a função, não a presença de corrente.',return:'Retorno em cinza. Sai do interruptor ou dimmer e alimenta a lâmpada. Não use azul-claro nem verde/verde-amarelo para essa função.',v1:()=>type==='bipolar'?'L2 em violeta é uma segunda fase, não é neutro. O segundo polo abre e fecha ao mesmo tempo que o primeiro.':'Retorno R2 em violeta. É independente de R1; somente sua própria tecla comanda a lâmpada correspondente.',v2:()=>type==='bipolar'?'Saída do segundo polo em laranja. Liga a lâmpada à fase L2 através do contato comandado.':'Retorno R3 em laranja. Existe no interruptor triplo e comanda a terceira lâmpada.',neutral:'Neutro em azul-claro. Vai diretamente às cargas. Na atividade com tomada, cada circuito tem seu neutro próprio a jusante do quadro.',pe:'Proteção em verde-amarelo. Conecta as carcaças das luminárias classe I e o contato de proteção da tomada. Não participa da corrente normal de funcionamento.'};
function renderInspection(){for(const path of inspectionPaths)path.classList.toggle('selected-wire',path.dataset.wire===state.inspection);for(const b of document.querySelectorAll('[data-inspect]'))b.setAttribute('aria-pressed',b.dataset.inspect===state.inspection);const d=descriptions[state.inspection];$('wireDescription').textContent=d?(typeof d==='function'?d():d):'Toque em uma função para destacar seus condutores. As cores permanecem iguais em todos os estados.'}
function waveform(){if(type!=='dimmer')return;const input=[],out=[],enabled=state.q1&&state.s[0];for(let i=0;i<=480;i++){const t=i/480*4*Math.PI,x=45+i*1.08,a=t%Math.PI,u=Math.sin(t),cut=enabled&&a>=alpha()?u:0;input.push(`${i?'L':'M'}${x.toFixed(1)} ${(90-u*58).toFixed(1)}`);out.push(`${i?'L':'M'}${x.toFixed(1)} ${(90-cut*58).toFixed(1)}`)}$('waveform').innerHTML=`<path d="M45 22V160M45 90H580" fill="none" stroke="#526c81"/><path d="${input.join('')}" fill="none" stroke="#79cffa" stroke-width="2" opacity=".65"/><path d="${out.join('')}" fill="none" stroke="#ffb44f" stroke-width="3"/><g fill="#b1c7d8" font-size="11" font-family="Segoe UI"><text x="12" y="32">+V</text><text x="20" y="94">0</text><text x="12" y="154">−V</text><text x="490" y="178">tempo →</text></g>`;$('levelOutput').textContent=state.level+'%';$('level').value=state.level;$('level').setAttribute('aria-valuetext',`${state.level}% do semiciclo, disparo em ${Math.round(alpha()*180/Math.PI)} graus`)}
function render(){const focus=document.activeElement?.dataset?.control,svgFocus=document.activeElement?.dataset?.action;buildDiagram();controls();readings();waveform();$('explanation').textContent=explanation();$('explanationIcon').textContent=active()?'●':'○';$('circuitBadge').textContent=type==='tomada'?(state.q2?'TOMADA ENERGIZADA':'TOMADA DESLIGADA'):active()?'CARGA ALIMENTADA':!state.q1?'QF1 ABERTO':'SEM CORRENTE NA CARGA';$('circuitBadge').classList.toggle('on',active());$('pause').textContent=state.paused?'Retomar movimento':'Pausar movimento';$('pause').setAttribute('aria-pressed',state.paused);
 for(const b of document.querySelectorAll('[data-count]'))b.setAttribute('aria-pressed',+b.dataset.count===state.count);
 sync();if(focus)$('experimentControls').querySelector(`[data-control="${focus}"]`)?.focus({preventScroll:true});if(svgFocus)$('circuit').querySelector(`[data-action="${svgFocus}"]`)?.focus({preventScroll:true});
}
function manual(k){state.lesson=-1;if(k==='q1'||k==='q2'||k==='plug')state[k]=!state[k];else state.s[+k.slice(1)]=!state.s[+k.slice(1)];updateLesson();render()}
for(const b of document.querySelectorAll('[data-count]'))b.onclick=()=>{state.count=+b.dataset.count;state.lesson=-1;updateLesson();render()};
if(type==='dimmer'){$('level').oninput=e=>{state.level=+e.target.value;state.lesson=-1;updateLesson();render()};for(const b of document.querySelectorAll('[data-level]'))b.onclick=()=>{state.level=+b.dataset.level;state.s[0]=true;state.lesson=-1;updateLesson();render()}}
$('showCurrent').onchange=sync;$('pause').onclick=()=>{state.paused=!state.paused;render()};$('toggleLabels').onclick=()=>{const on=$('toggleLabels').getAttribute('aria-pressed')!=='true';$('toggleLabels').setAttribute('aria-pressed',on);$('circuit').querySelectorAll('.wire-name').forEach(e=>e.toggleAttribute('hidden',!on));$('wireDescription').textContent=on?'Identificações de retorno visíveis.':'Identificações de retorno ocultas; as cores dos condutores permanecem visíveis.'};
for(const b of document.querySelectorAll('[data-inspect]'))b.onclick=()=>{state.inspection=state.inspection===b.dataset.inspect?null:b.dataset.inspect;renderInspection()};
const lessons={multiplo:[['1. Uma fase alimenta duas teclas.','Com as duas teclas abertas, nenhuma lâmpada recebe corrente. A derivação distribui a fase para as entradas dos dois comandos.',{count:2,s:[false,false,false],q1:true}],['2. Acione apenas a primeira.','S1 fecha o retorno R1. L1 acende; L2 continua apagada porque seu próprio retorno está interrompido.',{s:[true,false,false]}],['3. Feche os dois retornos.','As duas lâmpadas recebem 127 V em paralelo. Cada uma consome aproximadamente 0,47 A; a alimentação conduz a soma.',{s:[true,true,false]}],['4. Acrescente uma terceira tecla.','No triplo, R3 controla uma terceira lâmpada. Aqui L2 está apagada, enquanto L1 e L3 funcionam de forma independente.',{count:3,s:[true,false,true]}]],tomada:[['1. Tensão disponível não significa corrente.','QF2 ligado mantém a tomada energizada. Sem carga conectada, não há corrente de funcionamento na tomada.',{q1:true,q2:true,s:[false,false,false],plug:false}],['2. Conecte a carga na tomada.','A carga de 100 W recebe 127 V por QF2. A lâmpada continua apagada: o interruptor não está em série com a tomada.',{plug:true}],['3. Acenda a lâmpada.','Os dois circuitos funcionam juntos. QF1 alimenta iluminação e QF2 alimenta tomada. As correntes são mostradas separadamente.',{s:[true,false,false]}],['4. Abra QF1. A tomada continua alimentada.','O disjuntor da iluminação não interrompe o circuito de tomada. Experimente abrir QF2 para desligar somente a carga conectada.',{q1:false}]],bipolar:[['1. Duas fases chegam ao comando.','A alimentação é de 220 V entre L1 e L2. Com S1 aberto, os bornes de entrada continuam energizados quando QF1 está ligado.',{q1:true,s:[false,false,false]}],['2. Uma tecla fecha os dois polos.','Os contatos estão mecanicamente acoplados. O circuito se fecha de L1, pela lâmpada, até L2. Não há neutro neste exemplo.',{s:[true,false,false]}],['3. Uma tecla abre as duas fases.','Abertura simultânea dos dois polos de S1. A linha tracejada representa o acoplamento mecânico, não um fio.',{s:[false,false,false]}],['4. QF1 também possui dois polos.','O disjuntor de dois polos interrompe a alimentação das duas linhas juntas. Acione os comandos e compare suas funções.',{q1:false,s:[true,false,false]}]],dimmer:[['1. Condução completa.','Em 100%, o modelo deixa passar todo o semiciclo. A carga resistiva ideal de 60 W recebe a tensão eficaz nominal.',{q1:true,s:[true,false,false],level:100}],['2. Corte a primeira metade de cada semiciclo.','Com condução de 50%, o disparo ocorre em 90°. Neste modelo, a potência cai à metade; a tensão eficaz não cai à metade.',{level:50}],['3. Atrase mais o disparo.','Com apenas 25% de condução, passa somente o trecho final de cada semiciclo. Compare a forma de onda e a potência eficaz.',{level:25}],['4. Desligue preservando o ajuste.','O comando liga/desliga interrompe o funcionamento. Religue e ajuste o controle. LEDs precisam ser dimerizáveis e compatíveis com o dimmer.',{s:[false,false,false]}]]};
function updateLesson(){const l=lessons[type][state.lesson];$('lessonTitle').textContent=l?l[0]:'Uma explicação em quatro etapas.';$('lessonText').textContent=l?l[1]:'Explore os controles livremente ou comece o roteiro. Cada etapa configura o circuito para acompanhar o raciocínio.';$('lessonProgress').textContent=l?`${state.lesson+1} / 4`:'4 ETAPAS';$('previousStep').hidden=state.lesson<1;$('nextStep').textContent=state.lesson===3?'Recomeçar →':state.lesson<0?'Começar explicação →':'Próxima etapa →'}
function showLesson(i){if(i===0)Object.assign(state,{q1:true,q2:true,s:[false,false,false],plug:false,count:2});Object.assign(state,lessons[type][i][2],{lesson:i});state.s=[...state.s];updateLesson();render()}
$('nextStep').onclick=()=>showLesson((state.lesson+1)%4);$('previousStep').onclick=()=>{const target=state.lesson-1;if(target>=0){showLesson(0);for(let i=1;i<=target;i++)showLesson(i)}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.lighting-lab').requestFullscreen()}catch{$('explanation').textContent='Use F11 para ampliar a janela do navegador.'}};document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'⛶ Sair da tela cheia':'⛶ Ampliar'});
window.addEventListener('lab-visibility-change',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);updateLesson();render();
})();

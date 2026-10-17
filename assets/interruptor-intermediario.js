/* Cada intermediário permuta os dois retornos. A continuidade depende da
   composição dessas permutações, seguida do contato escolhido por S2. */
(()=>{'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const state={breaker:true,s1:0,s2:1,middle:[0],paused:false,phase:0,lesson:-1};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let frame=0,last=0,flows=[],layer,trace=[];
const output=()=>state.middle.reduce((r,v)=>r^v,state.s1);
const closed=()=>state.breaker&&output()===state.s2;
const y=r=>r?430:330;
const wire=(d,c)=>`<path class="wire ${c}" data-wire="${c}" d="${d}"/>`;
const text=(x,y,t,c='minor')=>`<text x="${x}" y="${y}" text-anchor="middle" class="${c}">${t}</text>`;
const terminal=(x,y)=>`<circle class="terminal" cx="${x}" cy="${y}" r="5"/>`;
function makeDiagram(){
 const n=state.middle.length,end=400+n*190,l1=end+220,l2=end+380,w=l2+140;
 const svg=$('circuit');svg.setAttribute('viewBox',`0 0 ${w} 620`);
 let s=`<defs><pattern id="diagramGrid" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#51667b" opacity=".17"/></pattern><radialGradient id="lampGlow"><stop stop-color="#ffe396" stop-opacity=".45"/><stop offset="1" stop-color="#ffce68" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="620" fill="url(#diagramGrid)"/>`;
 s+=text(80,52,'FASE · L','phase-text')+text(80,137,'NEUTRO · N','neutral-text')+text(80,197,'PROTEÇÃO · PE','pe-text');
 s+=`<g class="source"><circle cx="70" cy="115" r="35"/><path d="M47 115Q58 88 70 115T93 115"/></g>`;
 s+=wire(`M70 80H140M200 80H${w-40}`,'phase')+wire(`M70 150H${w-40}M${w-60} 150V196Q${w-34} 210 ${w-60} 224V520H${l1}M${l1} 425V520M${l2} 425V520`,'neutral');
 const pe=`M70 210H${w-30}M${w-30} 210V245H${l1+40}V286Q${l1+66} 300 ${l1+40} 314V335M${l2+40} 245V286Q${l2+66} 300 ${l2+40} 314V335`;
 s+=wire(pe,'pe')+`<path class="pe-yellow" d="${pe}"/>`;
 const start='M240 80V136Q266 150 240 164V196Q266 210 240 224V380H270';s+=`<path class="crossing-underlay" d="${start}"/>`+wire(start,'phase');
 s+=`<g role="button" tabindex="0" data-action="breaker" class="diagram-control"><rect class="hit-area" x="130" y="40" width="85" height="65"/><path class="device-arch" d="M140 80Q170 35 200 80"/><path class="breaker-blade" d="${state.breaker?'M140 80H200':'M140 80L190 48'}"/>${terminal(140,80)+terminal(200,80)+text(170,28,'QF1','device-label')}</g>`;
 function parallel(x,right,key,name){const cx=right?x+65:x,tx=right?x:x+65;
 return `<g role="button" tabindex="0" data-action="${key}" class="diagram-control"><rect class="switch-box" x="${x-18}" y="300" width="103" height="155" rx="7"/>${right?wire(`M${x-18} 330H${x}`,'v1')+wire(`M${x-18} 430H${x}`,'v2'):wire(`M${x-18} 380H${cx}`,'phase')}<path class="switch-blade" d="M${cx} 380L${tx} ${y(state[key])}"/>${terminal(cx,380)+terminal(tx,330)+terminal(tx,430)+text(cx,365,'C','terminal-label')+text(tx,316,'1','terminal-label')+text(tx,449,'2','terminal-label')+text(x+32,485,name+' · PARALELO','device-label')+text(x+32,506,'C → '+(state[key]+1))}</g>`;
 }
 s+=parallel(270,false,'s1','S1');
 let prev=335,r=state.s1,route=`M70 80H140H200H240V136Q266 150 240 164V196Q266 210 240 224V380H270L335 ${y(r)}`;trace=[`S1: comum → retorno ${r+1}`];
 state.middle.forEach((cross,i)=>{const x=420+i*190,out=x+90;
 s+=wire(`M${prev} 330H${x}`,'v1')+wire(`M${prev} 430H${x}`,'v2');
 route+=`H${x}L${out} ${y(r^cross)}`;
 s+=`<g class="intermediate-control" role="button" tabindex="0" data-action="i${i}" aria-pressed="${!!cross}" aria-label="I${i+1}, ${cross?'cruzado':'direto'}, trocar contatos"><rect class="switch-box" x="${x-12}" y="300" width="114" height="155" rx="7"/>`;
 // Underlay at the crossing makes the two isolated contacts distinguishable.
 s+=wire(`M${x-12} 330H${x}`,'v1')+wire(`M${x-12} 430H${x}`,'v2');
 const a=`M${x} 330L${out} ${y(cross)}`,b=`M${x} 430L${out} ${y(1^cross)}`;
 s+=`<path class="intermediate-contact" d="${a}"/><path d="${b}" fill="none" stroke="#122333" stroke-width="13"/><path class="intermediate-contact" d="${b}"/>`;
 s+=terminal(x,330)+terminal(x,430)+terminal(out,330)+terminal(out,430)+text(x-2,316,'1','terminal-label')+text(x-2,449,'2','terminal-label')+text(out+2,316,'3','terminal-label')+text(out+2,449,'4','terminal-label')+text(x+45,485,`I${i+1} · INTERMEDIÁRIO`,'device-label')+text(x+45,506,cross?'CRUZADO · 1↔4 / 2↔3':'DIRETO · 1↔3 / 2↔4')+'</g>';
 trace.push(`I${i+1} ${cross?'cruzado':'direto'}: ${r+1} → ${(r^cross)+3}`);r^=cross;prev=out;
 });
 s+=wire(`M${prev} 330H${end}`,'v1')+wire(`M${prev} 430H${end}`,'v2')+parallel(end,true,'s2','S2');
 route+=`H${end}L${end+65} 380H${end+120}V300H${l1}`;
 s+=wire(`M${end+65} 380H${end+120}V300H${l2}M${l1} 300V355M${l2} 300V355`,'return');
 const peBranches=pe.slice(pe.indexOf('M',1));s+=`<path class="crossing-underlay" d="${peBranches}"/>`+wire(peBranches,'pe')+`<path class="pe-yellow" d="${peBranches}"/>`;
 for(const [i,x] of [l1,l2].entries())s+=`<g><circle class="light-halo" cx="${x}" cy="390" r="80" fill="url(#lampGlow)"/><rect class="luminaire-body" x="${x-50}" y="335" width="100" height="110" rx="10"/><circle class="earth-lug" cx="${x+40}" cy="335" r="5"/><circle class="lamp-bulb" cx="${x}" cy="390" r="35"/><path class="lamp-cross" d="M${x-25} 365L${x+25} 415M${x-25} 415L${x+25} 365"/>${text(x,560,`L${i+1} · 60 W`,'device-label')}</g>`;
 s+=`<g id="wireLabels">${text(375,293,'R1','v1-text')+text(375,466,'R2','v2-text')+text(l1-20,280,'R · RETORNO','return-text')}</g>`;
 s+=`<g fill="none" stroke="none"><path id="flow0" d="${route}"/><path id="flow1" d="M${l1} 300V355L${l1-13} 368L${l1+13} 381L${l1-13} 394L${l1+13} 407L${l1} 425V520H${l2}"/><path id="flow2" d="M${l1} 300H${l2}V355L${l2-13} 368L${l2+13} 381L${l2-13} 394L${l2+13} 407L${l2} 425V520"/><path id="flow3" d="M${l2} 520H${w-60}V224Q${w-34} 210 ${w-60} 196V150H70V80"/></g><g id="currentParticles" class="current-layer" aria-hidden="true"></g>`;
 svg.innerHTML=s;svg.dataset.closed=String(closed());layer=$('currentParticles');
 flows=[0,1,2,3].map(i=>{const path=$('flow'+i),length=path.getTotalLength(),g=document.createElementNS(NS,'g');layer.append(g);const dots=Array.from({length:Math.ceil(length/(i===1||i===2?45:25))},()=>{const d=document.createElementNS(NS,'circle');d.setAttribute('r',3.6);g.append(d);return d});return {path,length,dots,branch:i===1||i===2}});
 for(const el of svg.querySelectorAll('[data-action]')){el.onclick=()=>change(el.dataset.action);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();change(el.dataset.action)}};el.setAttribute('aria-label',el.getAttribute('aria-label')||`Trocar ${el.dataset.action.toUpperCase()}`)}
 $('wireLabels').toggleAttribute('hidden',$('toggleLabels').getAttribute('aria-pressed')==='false');
}
function place(){for(const f of flows)f.dots.forEach((d,i)=>{const p=f.path.getPointAtLength((i*f.length/f.dots.length+Math.sin(state.phase)*(f.branch?17.5:35)+f.length)%f.length);d.setAttribute('cx',p.x);d.setAttribute('cy',p.y)})}
function caption(){ $('motionCaption').textContent=!closed()?'Sem corrente nas lâmpadas: caminho interrompido.':state.paused?'Movimento pausado; lâmpadas acesas.':!$('showCurrent').checked?'Lâmpadas acesas; corrente oculta.':Math.cos(state.phase)>=0?'CA · fase → S1 → intermediários → S2 → lâmpadas → neutro.':'CA · sentido oposto: neutro → lâmpadas → S2 → intermediários → S1 → fase.'; }
const mayAnimate=()=>closed()&&$('showCurrent').checked&&!state.paused&&!reduced.matches&&!document.hidden&&window.labActive!==false;
function animate(now){frame=0;if(!mayAnimate())return;state.phase+=(last?Math.min((now-last)/1000,.05):0)*Math.PI/2;last=now;place();caption();frame=requestAnimationFrame(animate)}
function sync(){cancelAnimationFrame(frame);frame=0;last=0;layer.toggleAttribute('hidden',!closed()||!$('showCurrent').checked);place();caption();if(mayAnimate())frame=requestAnimationFrame(animate)}
function render(){makeDiagram();const on=closed(),n=state.middle.length;document.body.classList.toggle('lamp-on',on);$('pointCount').textContent=String(n+2).padStart(2,'0');$('intermediateCount').textContent=n+' intermediário'+(n>1?'s':'');$('removeIntermediate').disabled=n===1;$('addIntermediate').disabled=n===6;
 const controls=[['s1','S1 · Paralelo',state.s1?'C → 2':'C → 1',state.s1],...state.middle.map((v,i)=>['i'+i,'I'+(i+1)+' · Intermediário',v?'Cruzado':'Direto',v]),['s2','S2 · Paralelo',state.s2?'C → 2':'C → 1',state.s2]];
 $('switchControls').innerHTML=controls.map(([key,name,label,v])=>`<button class="point-control" data-key="${key}" aria-pressed="${!!v}"><span><b>${name}</b><small>${label}</small></span><em>Acionar ↔</em></button>`).join('');for(const b of $('switchControls').children)b.onclick=()=>change(b.dataset.key);
 $('circuitBadge').textContent=on?'CAMINHO FECHADO':state.breaker?'CAMINHO INTERROMPIDO':'QF1 ABERTO';$('circuitBadge').classList.toggle('on',on);$('lampStatus').classList.toggle('on',on);$('lampState').textContent=on?'Acesas':'Apagadas';$('currentValue').innerHTML=(on?'0,94':'0,00')+' <small>A</small>';$('branchValue').innerHTML=(on?'0,47':'0,00')+' <small>A</small>';$('breakerButton').setAttribute('aria-pressed',state.breaker);$('breakerButtonText').textContent=state.breaker?'QF1 ligado · desligar':'QF1 desligado · ligar';$('pause').textContent=state.paused?'Retomar movimento':'Pausar movimento';$('pause').setAttribute('aria-pressed',state.paused);
 $('explanationIcon').textContent=on?'●':'○';$('explanation').textContent=!state.breaker?'QF1 aberto: não há corrente nas lâmpadas. A entrada do disjuntor permanece energizada.':`S1 seleciona R${state.s1+1}. Após ${n} intermediário${n>1?'s':''}, o caminho chega ao borne ${output()+1} de S2. S2 seleciona o borne ${state.s2+1}: ${on?'o circuito fecha e as duas lâmpadas acendem':'o circuito fica interrompido e as lâmpadas apagam'}. Acione qualquer ponto para inverter essa condição.`;
 $('pathTrace').innerHTML=trace.map(t=>`<li>${t}</li>`).join('')+`<li>S2: chega em ${output()+1}; comum conectado a ${state.s2+1} → ${on?'lâmpadas acesas':'lâmpadas apagadas'}</li>`;$('combinationNote').textContent=`${state.middle.filter(Boolean).length} intermediário(s) em cruzado. ${state.breaker?'QF1 ligado.':'QF1 aberto: alimentação interrompida.'}`;sync();
}
function change(key){const focus=document.activeElement?.dataset?.key,diagramFocus=document.activeElement?.dataset?.action;state.lesson=-1;if(key==='breaker')state.breaker=!state.breaker;else if(key[0]==='i')state.middle[+key.slice(1)]^=1;else state[key]^=1;lesson();render();if(focus)$('switchControls').querySelector(`[data-key="${focus}"]`)?.focus({preventScroll:true});if(diagramFocus)$('circuit').querySelector(`[data-action="${diagramFocus}"]`)?.focus({preventScroll:true})}
$('addIntermediate').onclick=()=>{if(state.middle.length<6){state.middle.push(0);state.lesson=-1;lesson();render()}};$('removeIntermediate').onclick=()=>{if(state.middle.length>1){state.middle.pop();state.lesson=-1;lesson();render()}};
$('breakerButton').onclick=()=>change('breaker');$('showCurrent').onchange=sync;$('pause').onclick=()=>{state.paused=!state.paused;render()};$('toggleLabels').onclick=()=>{const show=$('toggleLabels').getAttribute('aria-pressed')!=='true';$('toggleLabels').setAttribute('aria-pressed',show);$('wireLabels').toggleAttribute('hidden',!show)};
const descriptions={phase:'Fase vermelha alimenta o comum de S1. A cor permanece a mesma com ou sem corrente.',v1:'Retorno R1 em violeta entre os aparelhos. Os contatos internos do intermediário podem encaminhá-lo à outra saída; o fio não muda de cor.',v2:'Retorno R2 em laranja entre os aparelhos. No modo cruzado, entrada 2 conecta à saída 3; entrada 1 conecta à saída 4.',return:'Retorno cinza sai do comum de S2 e alimenta as duas lâmpadas em paralelo.',neutral:'Neutro azul-claro segue diretamente às lâmpadas e não passa pelos interruptores.',pe:'Proteção verde-amarelo liga as carcaças das luminárias classe I. Não conduz corrente normal.'};
for(const b of document.querySelectorAll('[data-inspect]'))b.onclick=()=>{const active=b.getAttribute('aria-pressed')!=='true';for(const c of document.querySelectorAll('[data-inspect]')){c.setAttribute('aria-pressed',c===b&&active);document.body.classList.toggle('inspecting-'+c.dataset.inspect,c===b&&active)}$('wireDescription').textContent=active?descriptions[b.dataset.inspect]:'Selecione um condutor para explorar sua função.'};
const lessons=[['1. Dois paralelos e um intermediário.','I1 direto mantém os caminhos separados: 1 → 3 e 2 → 4. S1 e S2 em 1 fecham o circuito.',[0],0,0],['2. Cruze os contatos de I1.','A entrada superior chega à saída inferior. S2 continua no borne superior e a luz apaga. Os dois contatos cruzados não se ligam entre si.',[1],0,0],['3. Acione o paralelo da saída.','S2 passa ao borne 2 e encontra o caminho vindo de I1. A luz acende novamente.',[1],0,1],['4. Dois cruzamentos se compensam.','I1 e I2 cruzados trocam o caminho duas vezes. S1 e S2 no borne 1 voltam a fechar o circuito. Experimente adicionar mais intermediários.',[1,1],0,0]];
function lesson(){const l=lessons[state.lesson];$('lessonTitle').textContent=l?l[0]:'Como os intermediários mudam o caminho.';$('lessonText').textContent=l?l[1]:'Explore livremente ou siga quatro etapas. A explicação configura os interruptores para cada exemplo.';$('lessonProgress').textContent=l?`${state.lesson+1} / 4`:'4 ETAPAS';$('previousStep').hidden=state.lesson<1;$('nextStep').textContent=state.lesson===3?'Recomeçar →':state.lesson<0?'Começar explicação →':'Próxima etapa →'}
function showLesson(i){const l=lessons[i];Object.assign(state,{lesson:i,breaker:true,middle:[...l[2]],s1:l[3],s2:l[4]});lesson();render()}
$('nextStep').onclick=()=>showLesson((state.lesson+1)%4);$('previousStep').onclick=()=>showLesson(Math.max(0,state.lesson-1));
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.lighting-lab').requestFullscreen()}catch{$('explanation').textContent='Use F11 para ampliar o navegador.'}};document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'⛶ Sair da tela cheia':'⛶ Ampliar'});
window.addEventListener('lab-visibility-change',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);lesson();render();
})();

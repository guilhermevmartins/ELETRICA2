/* Circuito ideal F–N, lâmpada resistiva: QF1 e S1 em série com a carga.
   Os pontos animados indicam corrente convencional CA em câmera lenta.
   PE é uma ligação independente à carcaça; nunca integra a rota de funcionamento. */
(()=>{'use strict';
const $=id=>document.getElementById(id),svgNS='http://www.w3.org/2000/svg';
const state={breaker:true,switch:false,paused:false,phase:0,inspection:null,lesson:-1};
const voltage=127,power=60,reduced=matchMedia('(prefers-reduced-motion: reduce)');
const closed=()=>state.breaker&&state.switch;
const route=$('currentRoute'),layer=$('currentParticles'),routeLength=route.getTotalLength();
const dots=Array.from({length:Math.ceil(routeLength/37)},()=>{const c=document.createElementNS(svgNS,'circle');c.setAttribute('r','3.8');layer.append(c);return c});
let frame=0,previousTime=0,lastDirection='';
function placeDots(){const displacement=Math.sin(state.phase)*35;dots.forEach((dot,i)=>{const p=route.getPointAtLength((i*routeLength/dots.length+displacement+routeLength)%routeLength);dot.setAttribute('cx',p.x.toFixed(2));dot.setAttribute('cy',p.y.toFixed(2))})}
function directionCaption(){if(!closed())return !state.breaker?'Sem corrente: QF1 interrompeu a alimentação.':'Sem corrente: o contato S1 está aberto.';if(!$('showCurrent').checked)return 'Há corrente na lâmpada; a representação do movimento está oculta.';if(state.paused)return 'Movimento pausado para observação. O circuito continua fechado.';if(reduced.matches)return 'Circuito fechado. Movimento reduzido conforme a preferência do dispositivo.';return Math.cos(state.phase)>=0?'CA · um sentido: L → S1 → lâmpada → N.':'CA · sentido oposto: N → lâmpada → S1 → L.'}
function updateCaption(){const caption=directionCaption();if(caption!==lastDirection){lastDirection=caption;$('motionCaption').textContent=caption}}
function mayAnimate(){return closed()&&$('showCurrent').checked&&!state.paused&&!reduced.matches&&window.labActive!==false&&!document.hidden}
function animate(now){frame=0;if(!mayAnimate())return;const dt=previousTime?Math.min((now-previousTime)/1000,.05):0;previousTime=now;state.phase=(state.phase+dt*Math.PI/2)%(Math.PI*2);placeDots();updateCaption();frame=requestAnimationFrame(animate)}
function syncAnimation(){if(frame)cancelAnimationFrame(frame);frame=0;previousTime=0;layer.toggleAttribute('hidden',!closed()||!$('showCurrent').checked);placeDots();updateCaption();if(mayAnimate())frame=requestAnimationFrame(animate)}
const descriptions={
 phase:()=>state.breaker?'Fase · vermelho neste exemplo. Sai de QF1 e chega ao borne de entrada de S1. Com S1 aberto há tensão nesse trecho, mas não há corrente de funcionamento.':'Fase · vermelho neste exemplo. O trecho da rede até a entrada de QF1 continua energizado. QF1 aberto interrompe a alimentação do circuito a jusante.',
 return:()=>state.switch&&state.breaker?'Retorno · cinza neste exemplo. S1 fechado conecta a fase à lâmpada por este condutor. É uma fase comandada, não é neutro.':'Retorno · cinza neste exemplo. Liga a saída de S1 à lâmpada. O caminho de alimentação está interrompido; a corrente de funcionamento é zero.',
 neutral:()=>'Neutro · azul-claro. Liga a lâmpada diretamente ao neutro da alimentação, sem passar pelo interruptor. Participa do circuito de funcionamento; não se confunde com o PE.',
 pe:()=>'Proteção · verde-amarelo. Conecta-se à carcaça metálica da luminária classe I. Não conduz corrente em funcionamento normal e não substitui o neutro. A cor verde também é admitida para essa função.'
};
function inspectWire(kind){state.inspection=state.inspection===kind?null:kind;renderInspection()}
function renderInspection(){for(const kind of Object.keys(descriptions)){document.body.classList.toggle('inspecting-'+kind,state.inspection===kind);const b=document.querySelector(`[data-inspect="${kind}"]`);b.setAttribute('aria-pressed',state.inspection===kind)}$('wireDescription').textContent=state.inspection?descriptions[state.inspection]():'Selecione um condutor para entender sua função. As cores dos fios permanecem iguais com a lâmpada acesa ou apagada.'}
function render(){const on=closed();document.body.classList.toggle('lamp-on',on);$('circuit').dataset.closed=String(on);$('circuit').dataset.breaker=String(state.breaker);$('circuit').dataset.switch=String(state.switch);$('circuit').dataset.flowing=String(on);$('circuitBadge').textContent=on?'CIRCUITO FECHADO':!state.breaker?'QF1 ABERTO':'CIRCUITO ABERTO';$('circuitBadge').classList.toggle('on',on);
 $('switchBlade').setAttribute('d',state.switch?'M510 430L575 430':'M510 430L568 400');$('breakerBlade').setAttribute('d',state.breaker?'M150 114L218 114':'M150 114L207 80');
 $('switchControl').setAttribute('aria-pressed',state.switch);$('switchControl').setAttribute('aria-label',`Interruptor S1 ${state.switch?'fechado; pressione para abrir':'aberto; pressione para fechar'}`);$('breakerControl').setAttribute('aria-pressed',state.breaker);$('breakerControl').setAttribute('aria-label',`Disjuntor QF1 ${state.breaker?'ligado; pressione para desligar':'desligado; pressione para ligar'}`);
 $('wallSwitch').setAttribute('aria-pressed',state.switch);$('wallSwitch').setAttribute('aria-label',state.switch?'Abrir o interruptor S1':'Fechar o interruptor S1');$('switchState').textContent=state.switch?'Ligado · contato fechado':'Desligado · contato aberto';$('switchDiagramState').textContent=state.switch?'CONTATO FECHADO':'CONTATO ABERTO';$('lampState').textContent=on?'Acesa':'Apagada';$('lampStatus').classList.toggle('on',on);
 $('currentValue').innerHTML=(on?(power/voltage).toFixed(2).replace('.',','):'0,00')+' <small>A</small>';$('lampVoltage').innerHTML=(on?voltage:0)+' <small>V</small>';$('breakerButton').setAttribute('aria-pressed',state.breaker);$('breakerButtonText').textContent=state.breaker?'QF1 ligado · desligar':'QF1 desligado · ligar';
 $('pause').setAttribute('aria-pressed',state.paused);$('pause').textContent=state.paused?'Retomar movimento':'Pausar movimento';
 $('explanationIcon').textContent=on?'●':'○';$('explanation').textContent=on?'S1 fechou o caminho: fase → disjuntor → interruptor → retorno → lâmpada → neutro → fonte. Há corrente e a lâmpada acende. O PE continua sem corrente de funcionamento.':!state.breaker?(state.switch?'S1 está fechado, mas QF1 está aberto: falta um caminho completo e a lâmpada permanece apagada. O trecho da rede antes de QF1 continua energizado.':'QF1 e S1 estão abertos. Não há corrente na lâmpada. O trecho da rede antes de QF1 continua energizado.'):'S1 está aberto: não há caminho completo nem corrente na lâmpada. A fase continua chegando ao interruptor; abrir S1 não desliga a alimentação desse trecho.';
 renderInspection();syncAnimation();
}
function manualChange(kind){state[kind]=!state[kind];state.lesson=-1;updateLesson();render()}
function activateWithKeyboard(element,action){element.addEventListener('click',action);element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action()}})}
activateWithKeyboard($('switchControl'),()=>manualChange('switch'));activateWithKeyboard($('breakerControl'),()=>manualChange('breaker'));
$('wallSwitch').onclick=()=>manualChange('switch');$('breakerButton').onclick=()=>manualChange('breaker');
$('showCurrent').onchange=syncAnimation;$('pause').onclick=()=>{state.paused=!state.paused;render()};
$('toggleLabels').onclick=()=>{const show=$('wireLabels').hasAttribute('hidden');$('wireLabels').toggleAttribute('hidden',!show);$('toggleLabels').setAttribute('aria-pressed',show)};
for(const button of document.querySelectorAll('[data-inspect]'))button.onclick=()=>inspectWire(button.dataset.inspect);
const lessons=[
 {title:'1. A fase chega ao interruptor.',text:'QF1 está ligado e S1 está aberto. Siga o condutor vermelho até a entrada de S1. Há tensão nesse trecho, mas a abertura do contato impede a corrente na lâmpada.',switch:false,wire:'phase'},
 {title:'2. O contato conecta fase e retorno.',text:'Fechamos S1. O retorno cinza passa a ligar a fase à lâmpada. A corrente surge no circuito completo; o destaque do retorno é apenas um recurso para a explicação.',switch:true,wire:'return'},
 {title:'3. O neutro completa o circuito.',text:'A corrente atravessa a lâmpada e o neutro azul-claro, fechando o circuito na fonte. Em corrente alternada o sentido se inverte. O PE não participa desse caminho normal.',switch:true,wire:'neutral'},
 {title:'4. Abrir S1 interrompe a corrente.',text:'A lâmpada apaga porque S1 abriu o circuito. O neutro e o PE continuam ligados à luminária. A fase antes do interruptor continua energizada enquanto QF1 estiver ligado.',switch:false,wire:'phase'}
];
function updateLesson(){const lesson=lessons[state.lesson];$('lessonTitle').textContent=lesson?lesson.title:'Do contato aberto à lâmpada acesa.';$('lessonText').textContent=lesson?lesson.text:'Explore livremente ou percorra quatro etapas de uma explicação guiada.';$('lessonProgress').textContent=lesson?`${state.lesson+1} / 4`:'4 ETAPAS';$('previousStep').hidden=state.lesson<1;$('nextStep').textContent=state.lesson===3?'Recomeçar →':state.lesson<0?'Começar explicação →':'Próxima etapa →'}
function showLesson(index){state.lesson=index;state.breaker=true;state.switch=lessons[index].switch;state.inspection=lessons[index].wire;updateLesson();render()}
$('nextStep').onclick=()=>showLesson((state.lesson+1)%lessons.length);$('previousStep').onclick=()=>{if(state.lesson>0)showLesson(state.lesson-1)};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.lighting-lab').requestFullscreen()}catch{$('explanation').textContent='Para ampliar, use a opção de tela cheia do navegador (F11).'}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'⛶ Sair da tela cheia':'⛶ Ampliar'});
window.addEventListener('lab-visibility-change',syncAnimation);document.addEventListener('visibilitychange',syncAnimation);reduced.addEventListener('change',syncAnimation);
render();
})();

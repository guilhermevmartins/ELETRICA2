'use strict';
// Curvas representativas para ensino: não usar os tempos para dimensionamento.
const $=id=>document.getElementById(id),canvas=$('chart'),ctx=canvas.getContext('2d');
const CURVES=[{id:'B',low:3,high:5,pickup:4,color:'#ffc46c'},{id:'C',low:5,high:10,pickup:7.5,color:'#81d5ed'},{id:'D',low:10,high:20,pickup:15,color:'#c9a5ff'}];
const state={nominal:10,amps:20,time:0,speed:10,running:false,focus:'all',trips:[null,null,null]};
const plot={left:88,top:70,width:846,height:482,minX:.5,maxX:30,minY:.01,maxY:10000};
const fmt=(v,d=2)=>v.toLocaleString('pt-BR',{maximumFractionDigits:d});
function ratio(){return state.amps/state.nominal}
function thermalTime(m){return m>1.13?120/(m*m-1.13**2):Infinity}
function prediction(curve,m=ratio()){return m>=curve.pickup?{time:.02,kind:'Magnético'}:{time:thermalTime(m),kind:m>1.13?'Térmico':'Sem disparo'}}
function formatTime(t){if(!Number.isFinite(t))return 'Sem disparo';if(t<1)return fmt(t*1000,1)+' ms';return fmt(t,t<10?2:1)+' s'}
CURVES.forEach(c=>{const el=document.createElement('article');el.className='card breaker';el.id='card'+c.id;el.style.setProperty('--curve',c.color);el.innerHTML=`<div class="breaker-head"><div class="curve-info"><h2>Curva ${c.id} · <span id="rating${c.id}">10 A</span></h2><p>Faixa magnética: ${c.low}–${c.high} × Iₙ</p></div><span class="curve-letter">${c.id}</span></div><div class="breaker-status" id="status${c.id}"></div><div class="breaker-data"><div><small>TEMPO PREVISTO / MODELO</small><strong id="time${c.id}"></strong></div><div><small>CORRENTE EFETIVA</small><strong id="amps${c.id}"></strong></div></div><progress max="100" value="0" id="progress${c.id}" aria-label="Avanço até o disparo da curva ${c.id}"></progress><p class="hint" id="hint${c.id}"></p>`;$('breakers').append(el)});
function feedback(){const m=ratio(),mag=CURVES.filter(c=>m>=c.pickup).map(c=>c.id);let title,text;
 if(m<=1){title='Operação abaixo ou na nominal';text='Nenhuma das três curvas dispara neste modelo. Observe que o relógio pode avançar sem abrir os contatos. A letra da curva não aumenta a corrente nominal do disjuntor.'}
 else if(m<=1.13){title='Pequena sobrecorrente';text='O modelo mantém os três disjuntores fechados até 1,13 × Iₙ. Esse limite simplificado não substitui os ensaios e condições especificados pelo fabricante.'}
 else if(!mag.length){title='Região térmica · tempo inverso';text='As três curvas usam o mesmo ramo térmico ilustrativo. Quanto maior a corrente, menor o tempo de disparo. Compare 1,5 × com 2 × Iₙ e observe a mudança da altura do ponto previsto.'}
 else{title='Atuação magnética: '+mag.join(', ');text=mag.length===3?'Os três limiares magnéticos adotados foram ultrapassados. Todos os circuitos abrem em 20 ms no modelo. Isso não significa que os tempos reais sejam idênticos.':'Neste modelo, '+mag.join(' e ')+' abre(m) em 20 ms; as outras curvas aguardam o aquecimento térmico. A faixa colorida representa a variação do limiar magnético, não uma corrente de disparo universal.'}
 $('eventTitle').textContent=title;$('eventText').textContent=text;
}
// Ao alterar a corrente, inicia-se uma nova condição constante e fria.
function reset(run=false){state.time=0;state.trips=[null,null,null];state.running=run;$('eventLog').replaceChildren();$('logEmpty').hidden=false;feedback();ui()}
function setCurrent(amps){const run=state.running;state.amps=Math.max(0,Math.min(state.nominal*30,Number.isFinite(amps)?amps:0));$('ampsInput').value=Number(state.amps.toFixed(2));$('current').value=ratio();reset(run)}
function setNominal(value){const previous=state.amps;state.nominal=value;$('ampsInput').max=value*30;setCurrent(previous);$('constraintNote').textContent=previous>value*30?'Corrente limitada a '+fmt(value*30)+' A (30 × Iₙ).':''}
function preset(m){state.amps=m*state.nominal;$('current').value=m;$('ampsInput').value=state.amps;$('constraintNote').textContent='';reset(true)}
$('current').oninput=e=>{setCurrent(+e.target.value*state.nominal);$('constraintNote').textContent=''};
$('ampsInput').onchange=e=>{const n=Number(e.target.value);setCurrent(n);$('constraintNote').textContent=Number.isFinite(n)&&n>=0&&n<=state.nominal*30?'':'Valor ajustado ao intervalo de 0 a 30 × Iₙ.'};
$('nominal').onchange=e=>setNominal(+e.target.value);$('speed').onchange=e=>{state.speed=+e.target.value;ui()};
document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>preset(+b.dataset.ratio));
document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{state.focus=b.dataset.focus;document.querySelectorAll('[data-focus]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));ui()});
$('play').onclick=()=>{if(state.trips.every(t=>t!==null))reset(true);else{state.running=!state.running;ui()}};$('reset').onclick=()=>reset(false);
// Os instantes de disparo são calculados exatamente, mesmo com o relógio em 1000×.
function update(dt){if(!state.running||!window.labActive)return;state.time+=dt*state.speed;let changed=false;
 CURVES.forEach((c,i)=>{const p=prediction(c);if(state.trips[i]===null&&state.time>=p.time){state.trips[i]=p.time;changed=true;const li=document.createElement('li');li.textContent=`${formatTime(p.time)} · Curva ${c.id}: ${p.kind.toLowerCase()} · corrente interrompida.`;$('eventLog').append(li);$('logEmpty').hidden=true}});
 // Ordenação garante leitura cronológica quando um quadro contém vários disparos.
 const ordered=CURVES.map((c,i)=>({c,time:state.trips[i]})).filter(x=>x.time!==null).sort((a,b)=>a.time-b.time);
 if(changed){[...$('eventLog').children].forEach((li,i)=>li.textContent=`${formatTime(ordered[i].time)} · Curva ${ordered[i].c.id}: ${prediction(ordered[i].c).kind.toLowerCase()} · corrente interrompida.`)}
 if(state.trips.every(t=>t!==null)){state.time=Math.max(...state.trips);state.running=false}
}
function px(m){return plot.left+Math.log10(m/plot.minX)/Math.log10(plot.maxX/plot.minX)*plot.width}
function py(t){return plot.top+plot.height-Math.log10(t/plot.minY)/Math.log10(plot.maxY/plot.minY)*plot.height}
function unpx(x){return plot.minX*(plot.maxX/plot.minX)**((x-plot.left)/plot.width)}
function text(s,x,y,color='#bdb0c5',size=12,align='left'){ctx.font=`${size}px Segoe UI`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);ctx.textAlign='left'}
function line(points,color,width=1,dash=[]){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([])}
function circle(x,y,r,color,fill=false){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.lineWidth=2;ctx.strokeStyle=color;if(fill){ctx.fillStyle=color;ctx.fill()}else ctx.stroke()}
function draw(){ctx.clearRect(0,0,1000,650);const right=plot.left+plot.width,bottom=plot.top+plot.height,m=ratio();
 text('TEMPO DE DISPARO · SEGUNDOS',plot.left,31,'#d6becd',12);text('Curvas ilustrativas / disjuntores frios',right,31,'#9f8ea9',11,'right');
 ctx.fillStyle='#1d1b23';ctx.fillRect(plot.left,plot.top,plot.width,plot.height);
 const xs=[.5,1,1.5,2,3,5,10,20,30],ys=[.01,.1,1,10,100,1000,10000];
 for(const value of xs){const x=px(value);line([[x,plot.top],[x,bottom]],'#3c3343');text(fmt(value),x,bottom+24,'#bfb1c6',12,'center')}
 for(const value of ys){const y=py(value);line([[plot.left,y],[right,y]],'#45384a');text(fmt(value),plot.left-14,y+4,'#bfb1c6',12,'right')}
 text('CORRENTE RELATIVA · I / Iₙ',right,623,'#d6becd',12,'right');text('Ex.: '+fmt(state.nominal)+' A = 1 × Iₙ',plot.left,623,'#b7a1bd',11);
 const shown=CURVES.filter(c=>state.focus==='all'||state.focus===c.id);
 ctx.save();ctx.beginPath();ctx.rect(plot.left,plot.top,plot.width,plot.height);ctx.clip();
 // Faixas magnéticas são guias. Não são envelopes completos de certificação.
 for(const c of shown){ctx.fillStyle=c.color;ctx.globalAlpha=.13;ctx.fillRect(px(c.low),py(.1),px(c.high)-px(c.low),py(.01)-py(.1));ctx.globalAlpha=1;line([[px(c.low),py(.1)],[px(c.low),bottom]],c.color,1,[3,4]);line([[px(c.high),py(.1)],[px(c.high),bottom]],c.color,1,[3,4])}
 const limit=Math.max(...shown.map(c=>c.pickup)),thermal=[];for(let i=0;i<=240;i++){const r=1.13001*(limit/1.13001)**(i/240);thermal.push([px(r),py(thermalTime(r))])}line(thermal,'#d8cbdc',2.7);
 for(const c of shown){line([[px(c.pickup),py(thermalTime(c.pickup))],[px(c.pickup),py(.02)],[right,py(.02)]],c.color,2.2,[c.id==='C'?8:3,c.id==='D'?7:3]);}
 const x=px(Math.max(.5,m));line([[x,plot.top],[x,bottom]],'#ff7382',1.4,[6,5]);
 for(let i=CURVES.length-1;i>=0;i--){const c=CURVES[i];if(!shown.includes(c))continue;const p=prediction(c);if(Number.isFinite(p.time)){const y=py(Math.min(plot.maxY,Math.max(plot.minY,p.time)));circle(x,y,5+i*3,c.color);}
  const t=state.trips[i]!==null?state.trips[i]:state.time;const y=py(Math.min(plot.maxY,Math.max(plot.minY,t)));if(state.time>0||state.trips[i]!==null){circle(x,y,7+i*4,c.color);if(state.trips[i]!==null){line([[x-3,y],[x,y+3],[x+5,y-4]],c.color,2)}}
 }
 ctx.restore();
 for(const c of shown){text(`${c.id} · ${c.low}–${c.high} ×`,px(Math.sqrt(c.low*c.high)),py(.1)-10,c.color,11,'center')}
 text('TÉRMICO · tempo inverso',px(1.45),py(500),'#d8cbdc',12);
 const caption=m<.5?'I = '+fmt(m)+' × (fora da escala)':fmt(m)+' × Iₙ · '+fmt(state.amps)+' A';text(caption,Math.min(right-3,Math.max(plot.left+90,px(Math.max(.5,m)))),plot.top-16,'#ff929f',12,'center');
 if(Number.isFinite(thermalTime(m))&&thermalTime(m)>plot.maxY&&!CURVES.every(c=>prediction(c).kind==='Magnético'))text('Previsão térmica acima de 10.000 s',plot.left+14,plot.top+23,'#f0c6a7',11);
 if(state.time>plot.maxY)text('Relógio acima da escala vertical',plot.left+14,plot.top+43,'#f0c6a7',11);
 text('FAIXAS MAGNÉTICAS',plot.left+12,py(.04),'#a896b2',10);text('○ Previsão    ◉ Ensaio / disparo',plot.left,bottom+51,'#bfabc8',11);
}
function ui(){const m=ratio(),count=state.trips.filter(t=>t!==null).length;$('multiple').value=fmt(m)+' ×';$('metricI').textContent=fmt(state.amps)+' A';$('metricRatio').textContent=fmt(m)+' × Iₙ';$('elapsed').textContent=formatTime(state.time);$('speedLabel').textContent='relógio acelerado em '+state.speed+'×';$('tripCount').textContent=count+' / 3';$('runStatus').textContent=count===3?'● ENSAIO CONCLUÍDO':state.running?'● ENSAIO EM ANDAMENTO':state.time>0?'● ENSAIO PAUSADO':'● PRONTO PARA O ENSAIO';$('play').textContent=count===3?'↻ Repetir ensaio':state.running?'Ⅱ Pausar':state.time>0?'▶ Continuar':'▶ Iniciar ensaio';
 CURVES.forEach((c,i)=>{const p=prediction(c),trip=state.trips[i]!==null;$('rating'+c.id).textContent=fmt(state.nominal)+' A';$('time'+c.id).textContent=formatTime(p.time);$('amps'+c.id).textContent=fmt(trip?0:state.amps)+' A';$('status'+c.id).textContent=trip?'● ABERTO · '+p.kind.toUpperCase():'● FECHADO · '+(state.running?'EM ENSAIO':'ARMADO');$('status'+c.id).className='breaker-status'+(trip?' tripped':'');$('progress'+c.id).value=Number.isFinite(p.time)?Math.min(100,state.time/p.time*100):0;$('hint'+c.id).textContent=(m>=c.low&&m<=c.high?'Dentro da faixa magnética de referência. ':'')+'Limiar magnético adotado: '+fmt(c.pickup*state.nominal)+' A ('+fmt(c.pickup)+' ×).';$('card'+c.id).classList.toggle('focused',state.focus===c.id)});
}
canvas.onclick=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*1000/r.width,y=(e.clientY-r.top)*650/r.height;if(x>=plot.left&&x<=plot.left+plot.width&&y>=plot.top&&y<=plot.top+plot.height)setCurrent(Math.round(unpx(x)*state.nominal*10)/10)};
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=1000*dpr;canvas.height=650*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}window.addEventListener('resize',resize);resize();
let last=performance.now();function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);draw();ui();requestAnimationFrame(frame)}reset();requestAnimationFrame(frame);

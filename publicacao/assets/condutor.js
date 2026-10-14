/* Condutores: cálculo tabulado independente da animação térmica.
 * Todos os parâmetros de aquecimento são pedagógicos, descritos na interface.
 * Os dados normativos estão isolados em condutor-dados.js para auditoria. */
'use strict';
const D=window.CABLE_DATA,$=id=>document.getElementById(id);
const initial={section:2.5,insulation:'pvc',method:'b1',loaded:2,groups:1,ambient:30,arrangement:'bunch',current:20};
const state={...initial,temperature:30,time:0,phase:0,paused:false,view:'lab',history:[{t:0,T:30,limit:70,ambient:30}],historyClock:0};
const fmt=(n,d=1)=>n.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
function values(section=state.section){
 const m=D.methods[state.method],row=D.sections.indexOf(section);
 const base=D[state.insulation][row][m.column+state.loaded-2];
 const fT=D.temperature[state.insulation][D.ambient.indexOf(state.ambient)];
 const arrangement=m.code==='C'?state.arrangement:'bunch';
 const fG=D.group[arrangement][state.groups-1],iz=base*fT*fG;
 const limit=state.insulation==='pvc'?70:90,ratio=state.current/iz;
 const target=Math.min(160,state.ambient+(limit-state.ambient)*ratio*ratio);
 return {base,fT,fG,iz,limit,ratio,target,method:m,arrangement};
}
// Constante de 8 s de tela, sem equivalência com a constante térmica real.
function advance(dt){
 if(state.paused||!window.labActive||dt<=0)return;
 const v=values();state.temperature+=(v.target-state.temperature)*(1-Math.exp(-dt/8));
 state.time+=dt;state.phase+=dt*state.current/15;state.historyClock+=dt;
 if(state.historyClock>=.25){state.historyClock=0;state.history.push({t:state.time,T:state.temperature,limit:v.limit,ambient:state.ambient});if(state.history.length>241)state.history.shift();}
}
function fresh(settings){Object.assign(state,initial,settings,{time:0,phase:0,paused:false,historyClock:0});state.temperature=state.ambient;state.history=[{t:0,T:state.temperature,limit:values().limit,ambient:state.ambient}];refresh();}
function preset(name){const scenarios={normal:{},group:{groups:3},hot:{groups:3,ambient:40},larger:{groups:3,ambient:40,section:6}};fresh(scenarios[name]||{});}
function explain(v){
 if(state.current===0)return ['Sem corrente · resfriamento',`Sem efeito Joule nos circuitos modelados, a temperatura se aproxima de ${fmt(state.ambient,0)} °C. O calor acumulado não desaparece instantaneamente.`];
 if(state.temperature>v.limit+.1)return ['Temperatura acima do limite contínuo',`O modelo térmico ultrapassou ${v.limit} °C, referência de regime permanente da isolação selecionada. ${v.ratio>1?'A corrente também excede Iz.':'A corrente já está dentro de Iz, mas o condutor ainda está resfriando.'} Não há disjuntor atuando nesta experiência.`];
 if(v.ratio>1)return ['Corrente acima da capacidade corrigida',`${fmt(state.current,0)} A supera Iz = ${fmt(v.iz,2)} A. A temperatura demora a subir; estar frio neste instante não torna admissível manter essa corrente em regime permanente.`];
 return ['Dentro da capacidade de condução',`I ≤ Iz nas condições selecionadas. Mesmo assim, há aquecimento por efeito Joule. A temperatura animada tende a ${fmt(v.target)} °C neste modelo, sem representar uma previsão de campo.`];
}
function refresh(){
 const v=values();for(const key of ['section','insulation','method','loaded','groups','ambient','arrangement','current'])$(key).value=state[key];
 $('arrangement').disabled=v.method.code!=='C';$('arrangement').options[1].disabled=v.method.code!=='C';
 $('currentOut').textContent=fmt(state.current,0)+' A';$('methodNote').textContent=v.method.code+' · '+v.method.description;
 $('formula').textContent=`${fmt(v.base)} A × ${fmt(v.fT,2)} × ${fmt(v.fG,2)} = ${fmt(v.iz,2)} A`;
 $('factorNote').textContent=`I tabela: tab. ${state.insulation==='pvc'?36:37} · fT: tab. 40 · fG: tab. 42 / linha ${v.arrangement==='layer'?2:1} · NBR 5410:2004`;
 $('tableContext').textContent=`${v.method.code} · ${state.insulation==='pvc'?'PVC 70 °C':'EPR/XLPE 90 °C'} · ${state.loaded} carregados/circuito · ${state.groups} circuito(s) · ${state.ambient} °C · ${v.arrangement==='layer'?'camada única sobre parede':'em feixe / conduto fechado'}.`;
 $('tableBody').innerHTML=D.sections.map(s=>{const x=values(s);return `<tr class="${s===state.section?'selected':''}"><th scope="row">${fmt(s,1)}</th><td>${fmt(x.base)}</td><td>${fmt(x.fT,2)}</td><td>${fmt(x.fG,2)}</td><td>${fmt(x.iz,2)}</td><td class="${state.current<=x.iz?'ok':'over'}">${state.current<=x.iz?'Sim':'Não'}</td></tr>`;}).join('');
 $('pause').textContent=state.paused?'Continuar':'Pausar';$('pause').setAttribute('aria-pressed',state.paused);
 for(const view of ['lab','graph','table'])$(view+'Panel').hidden=state.view!==view;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===state.view));updateReadouts();draw();drawGraph();
}
function updateReadouts(){const v=values(),[title,body]=explain(v);$('eventTitle').textContent=title;$('eventText').textContent=body;
 $('status').textContent=state.paused?'Ⅱ EXPERIÊNCIA PAUSADA':state.current===0?'● SEM CORRENTE':v.ratio>1?'● I > Iz · SOBRECARGA TÉRMICA':'● I ≤ Iz · CAPACIDADE ATENDIDA';$('status').classList.toggle('open',v.ratio>1||state.temperature>v.limit+.1);
 $('substatus').textContent=`${fmt(state.section)} mm² · ${v.method.code} · ${state.groups} circuito(s) · temperatura ilustrativa`;
 $('iMetric').textContent=fmt(state.current,0)+' A';$('izMetric').textContent=fmt(v.iz,2)+' A';$('tMetric').textContent=(state.temperature>=159.9?'≥160':fmt(state.temperature))+' °C';$('ratioMetric').textContent=fmt(v.ratio*100,0)+' %';
 $('usageFill').style.width=Math.min(100,v.ratio*100)+'%';$('usageFill').style.background=v.ratio>1?'#ff6976':'#71dcb0';
 $('thermalNote').textContent=`Limite contínuo da isolação: ${v.limit} °C · tempo de tela: ${fmt(state.time,0)} s · dinâmica térmica ilustrativa.`;
 const candidate=D.sections.find(s=>values(s).iz>=state.current);$('suggestion').textContent=state.current===0?'Use o controle para voltar a aplicar corrente.':candidate?`Primeira seção deste recorte que atende somente I ≤ Iz: ${fmt(candidate)} mm². Outros critérios de dimensionamento ainda precisam ser verificados.`:'Nenhuma seção deste recorte atende I ≤ Iz. O limite do recorte é 35 mm².';
}
const canvas=$('scene'),g=canvas.getContext('2d');
function label(ctx,x,y,text,size=16,color='#e4d7e4',align='left'){ctx.font=`${size}px "Segoe UI",sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(text,x,y);}
function rect(ctx,x,y,w,h,color,r=10){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function circle(ctx,x,y,r,color,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();}}
function wireCore(x,y,r){circle(g,x,y,r,'#b46b42','#ebad72');circle(g,x,y,r*.21,'#ffcf8b');for(let i=0;i<6;i++){const a=i*Math.PI/3;circle(g,x+Math.cos(a)*r*.48,y+Math.sin(a)*r*.48,r*.21,'#f5b975');}}
function draw(){const v=values(),heat=Math.max(0,Math.min(1,(state.temperature-state.ambient)/(v.limit-state.ambient)));g.clearRect(0,0,1000,620);
 for(let x=20;x<1000;x+=25)for(let y=20;y<620;y+=25){g.fillStyle='#ffffff08';g.fillRect(x,y,1,1);}
 label(g,38,40,'01 / CORTE DO CONDUTOR · O CALOR SE ACUMULA',13,'#bcaaba');
 const r=21+Math.sqrt(state.section)*8,cy=176;
 const insulation=g.createLinearGradient(0,cy-r,0,cy+r);insulation.addColorStop(0,'#ed6274');insulation.addColorStop(.5,'#b52d48');insulation.addColorStop(1,'#4e2537');
 g.shadowColor=`rgba(255,${Math.round(150-heat*95)},45,${heat*.6})`;g.shadowBlur=heat*40;rect(g,95,cy-r,485,r*2,insulation,8);g.shadowBlur=0;
 rect(g,545,cy-r*.55,151,r*1.1,'#c38652',6);for(let i=-2;i<=2;i++){g.strokeStyle='#f5c38b';g.lineWidth=2;g.beginPath();g.moveTo(549,cy+i*r*.18);g.lineTo(690,cy+i*r*.18);g.stroke();}
 circle(g,97,cy,r,'#bd314d','#f97687');wireCore(97,cy,r*.62);
 if(state.current>0){g.fillStyle='#ffe19e';for(let i=0;i<12;i++){const x=150+((i*48+state.phase*80)%526);circle(g,x,cy,3.5,'#ffe19e');}}
 label(g,299,cy+6,`${fmt(state.section)} mm² · Cu`,22,'#fff4ee','center');
 // Mapa térmico explícito: azul -> âmbar -> vermelho sem sugerir incandescência.
 const thermalColor=`hsl(${210-heat*210},85%,65%)`;
 circle(g,844,174,68,thermalColor);wireCore(844,174,38);label(g,844,276,'CORTE + MAPA TÉRMICO',12,'#bda9bc','center');
 label(g,93,283,'Isolação '+(state.insulation==='pvc'?'PVC · 70 °C':'EPR/XLPE · 90 °C'),15,'#ddbcc7');label(g,548,283,'Cobre → I²R → calor',15,'#efc492');
 rect(g,32,310,936,1,'#50414e',0);label(g,38,346,`02 / ${v.method.code} · ${v.method.code==='C'?'SOBRE PAREDE':'ELETRODUTO'} · ${state.groups} CIRCUITO(S)`,13,'#bcaaba');
 // Corte esquemático: círculos coloridos = condutores carregados; PE omitido.
 const cx=226,cy2=465,layer=v.arrangement==='layer';
 if(v.method.code==='A1'){rect(g,81,363,290,209,'#665642',5);for(let i=0;i<14;i++){g.strokeStyle='#d3bc792b';g.beginPath();g.moveTo(86+i*22,366);g.lineTo(140+i*22,568);g.stroke();}}
 else if(v.method.code!=='C'){rect(g,81,363,290,209,'#413b41',5);for(let i=0;i<4;i++){g.strokeStyle='#65505c';g.beginPath();g.moveTo(81,390+i*46);g.lineTo(371,390+i*46);g.stroke();}}
 if(v.method.code!=='C'){circle(g,cx,cy2,94,'#22242b','#9d929f');circle(g,cx,cy2,84,'#17191f');}else rect(g,66,552,338,17,'#6b5660',4);
 for(let n=0;n<state.groups;n++){
 let x,y;if(layer){x=87+n*(278/Math.max(1,state.groups-1));y=504;}else if(state.groups===1){x=cx;y=cy2;}else {const a=-Math.PI/2+n*2*Math.PI/state.groups;x=cx+Math.cos(a)*53;y=cy2+Math.sin(a)*53;}
 const cr=state.groups===1?36:state.groups<=3?27:21;
 if(state.method==='b2')circle(g,x,y,cr,'#4a414c',n===0?'#f3d59b':'#7b6b7c');else {g.strokeStyle=n===0?'#ffe6ae':'#736579';g.lineWidth=1;g.setLineDash([3,4]);g.beginPath();g.arc(x,y,cr,0,Math.PI*2);g.stroke();g.setLineDash([]);}
 for(let k=0;k<state.loaded;k++){const a=-Math.PI/2+k*2*Math.PI/state.loaded;const wx=x+Math.cos(a)*cr*.43,wy=y+Math.sin(a)*cr*.43;circle(g,wx,wy,cr*.34,['#e75066','#599ed1','#b999d2'][k]);circle(g,wx,wy,cr*.18,'#ebb876');}
 }
 label(g,226,597,`${state.groups} × ${state.loaded} = ${state.groups*state.loaded} carregados · PE omitido`,13,'#baa9ba','center');
 label(g,445,394,`AMBIENTE ${state.ambient} °C`,13,'#d3bcab');label(g,445,430,`fT ${fmt(v.fT,2)}  ×  fG ${fmt(v.fG,2)}`,27,'#ffb5ac');
 label(g,445,466,v.arrangement==='layer'?'Camada única sobre parede':'Circuitos homogêneos agrupados',16,'#e0c7d7');
 label(g,445,496,`Iz: ${fmt(v.base)} A → ${fmt(v.iz,2)} A`,20,'#f5dbad');
 label(g,445,533,`Temperatura ilustrativa: ${state.temperature>=159.9?'≥160':fmt(state.temperature)} °C`,19,thermalColor);
 label(g,445,566,'Mais corrente → mais calor. Menos dissipação → menor Iz.',13,'#b9aab9');
}
function drawGraph(){const c=$('graph'),ctx=c.getContext('2d'),v=values();ctx.clearRect(0,0,1000,620);label(ctx,42,36,'TEMPERATURA DIDÁTICA · °C',15);const left=70,width=870,top=65,height=230;
 for(let t=0;t<=160;t+=40){const y=top+height-t/180*height;ctx.strokeStyle='#423741';ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+width,y);ctx.stroke();label(ctx,52,y+5,String(t),12,'#b9aab9','right');}
 const end=Math.max(30,state.time),start=Math.max(0,end-60),span=end-start;
 for(let i=0;i<=4;i++)label(ctx,left+width*i/4,319,fmt(start+span*i/4,0)+' s',12,'#b9aab9','center');
 for(const [key,color,dash] of [['ambient','#6eafd9',[4,5]],['limit','#f5d386',[7,5]],['T','#ff7a88',[]]]){ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.setLineDash(dash);ctx.beginPath();let first=true;for(const p of state.history){if(p.t<start)continue;const x=left+(p.t-start)/span*width,y=top+height-p[key]/180*height;first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}ctx.stroke();ctx.setLineDash([]);}
 label(ctx,70,351,'Rosa: condutor   ·   Âmbar: limite contínuo   ·   Azul: ambiente',13,'#b9aab9');
 label(ctx,42,396,'CAPACIDADE CORRIGIDA POR SEÇÃO · A',15);const bottom=561,bheight=130,max=Math.max(state.current,...D.sections.map(s=>values(s).iz))*1.15;
 for(let i=0;i<D.sections.length;i++){const s=D.sections[i],z=values(s).iz,x=91+i*109,h=z/max*bheight;rect(ctx,x,bottom-h,55,h,s===state.section?'#ef586d':'#6f9e98',4);label(ctx,x+27,bottom-h-9,fmt(z,1),12,'#e0d4e0','center');label(ctx,x+27,bottom+24,fmt(s,1),12,'#b9aab9','center');}
 const y=bottom-state.current/max*bheight;ctx.strokeStyle='#ff8495';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(65,y);ctx.lineTo(966,y);ctx.stroke();ctx.setLineDash([]);label(ctx,953,y-8,`I = ${state.current} A`,12,'#ffadb6','right');label(ctx,956,610,'Seção nominal · mm²',12,'#b9aab9','right');
}
function option(select,value,label){const o=document.createElement('option');o.value=value;o.textContent=label;$(select).append(o);}
D.sections.forEach(s=>option('section',s,fmt(s)+' mm²'));Object.entries(D.methods).forEach(([key,m])=>option('method',key,m.code+' · '+m.label));for(let n=1;n<=6;n++)option('groups',n,n+' circuito'+(n>1?'s':''));D.ambient.forEach(t=>option('ambient',t,t+' °C'));
for(const key of ['section','insulation','method','loaded','groups','ambient','arrangement'])$(key).onchange=e=>{state[key]=['section','loaded','groups','ambient'].includes(key)?Number(e.target.value):e.target.value;if(D.methods[state.method].code!=='C')state.arrangement='bunch';refresh();};
$('current').oninput=e=>{state.current=Number(e.target.value);refresh();};$('pause').onclick=()=>{state.paused=!state.paused;refresh();};$('off').onclick=()=>{state.current=0;refresh();};$('reset').onclick=()=>fresh({});document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>preset(b.dataset.preset));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;refresh();});
const concepts=[['Seção não é diâmetro','A bitola nominal é a área de cobre em mm². Em um círculo maciço, área = π·d²/4; em um condutor encordoado, considera-se a seção metálica nominal. O diâmetro externo inclui isolação e cobertura.'],['Toda corrente produz calor','O efeito Joule segue P = I²R. A capacidade Iz não significa que abaixo dela o cabo fique frio: ela considera um regime térmico admissível sob determinadas condições.'],['Vizinhos também aquecem','No agrupamento, cada circuito contribui com calor. O fator usado aqui supõe circuitos homogêneos e uniformemente carregados. Três circuitos de dois carregados não são seis circuitos.'],['A temperatura ambiente consome margem térmica','Quanto maior a temperatura ao redor do cabo, menor a diferença disponível até o limite contínuo da isolação. O fator fT corrige a capacidade tabulada para essa condição.']];
function concept(i){$('conceptTitle').textContent=concepts[i][0];$('conceptText').textContent=concepts[i][1];document.querySelectorAll('[data-concept]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.concept)===i));}document.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>concept(Number(b.dataset.concept)));
document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{$('answer').textContent=b.dataset.answer==='right'?'Correto: fG usa 3 circuitos; a capacidade base usa a coluna de 2 condutores carregados.':'São 6 condutores carregados, mas o fator de agrupamento usa os 3 circuitos. Cada circuito tem 2 carregados.';});
let previous=performance.now(),paint=0;function frame(now){advance(Math.min(.1,(now-previous)/1000));previous=now;if(now-paint>90&&window.labActive){updateReadouts();if(state.view==='lab')draw();else if(state.view==='graph')drawGraph();paint=now;}requestAnimationFrame(frame);}concept(0);refresh();requestAnimationFrame(frame);

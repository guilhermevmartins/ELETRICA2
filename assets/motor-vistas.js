'use strict';
const scene=document.getElementById('motorScene'),expansion=document.getElementById('expansion');
const defs=`<defs><clipPath id="rotorOcclusion"><rect id="rotorWindow" x="0" y="0" width="690" height="670"/></clipPath><clipPath id="fanOcclusion"><rect id="fanWindow" x="0" y="0" width="926" height="670"/></clipPath>
<linearGradient id="blue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#75d4ff"/><stop offset=".23" stop-color="#258bc6"/><stop offset=".58" stop-color="#13619a"/><stop offset="1" stop-color="#082d55"/></linearGradient>
<linearGradient id="face"><stop stop-color="#126297"/><stop offset=".48" stop-color="#388fb9"/><stop offset="1" stop-color="#0a385d"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f0f7fc"/><stop offset=".22" stop-color="#9baec1"/><stop offset=".45" stop-color="#d7e5ee"/><stop offset=".55" stop-color="#738a9d"/><stop offset="1" stop-color="#344554"/></linearGradient>
<linearGradient id="copper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffdb91"/><stop offset=".4" stop-color="#d1843b"/><stop offset=".7" stop-color="#7b381b"/><stop offset="1" stop-color="#e3a453"/></linearGradient>
<radialGradient id="hole"><stop stop-color="#070e18"/><stop offset=".8" stop-color="#101c2b"/><stop offset="1" stop-color="#354759"/></radialGradient>
<radialGradient id="shadow"><stop stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>`;
function cylinder(x,y,l,r,material='blue',front='face'){
 const rx=r*.43,bx=x+l,by=y-l*.25;
 return `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${r}" fill="url(#${material})" stroke="#81bbd344"/><path d="M${x},${y-r} L${bx},${by-r} A${rx},${r} 0 0 1 ${bx},${by+r} L${x},${y+r} A${rx},${r} 0 0 0 ${x},${y-r}" fill="url(#${material})" stroke="#91d4f944"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${r}" fill="url(#${front})" stroke="#81b4d4" stroke-width="1.5"/>`;
}
function ring(x,y,r,inner,material='steel') {return `<ellipse cx="${x}" cy="${y}" rx="${r*.43}" ry="${r}" fill="url(#${material})" stroke="#a6cad977"/><ellipse cx="${x}" cy="${y}" rx="${inner*.43}" ry="${inner}" fill="url(#hole)" stroke="#050e19"/>`}
function bolts(x,y,r){return Array.from({length:6},(_,i)=>{let a=i*Math.PI/3;return `<ellipse cx="${x+Math.cos(a)*r*.43}" cy="${y+Math.sin(a)*r}" rx="3.2" ry="5" fill="#102337" stroke="#a0c4d2"/>`}).join('')}
const parts=[
 {id:'hood',name:'Tampa defletora',description:'Protege o ventilador e direciona o ar sobre as aletas da carcaça.',dx:350,dy:-70,label:[1160,145],anchor:[1009,268],geometry:cylinder(992,287,66,101)+Array.from({length:12},(_,i)=>`<path d="M${1015+i*3},${210+i*.7} l0,115" stroke="#081d30" stroke-width="2" opacity=".8"/>`).join('')},
 {id:'fan',name:'Ventilador',description:'Gira com o eixo e movimenta o ar para ajudar a retirar o calor do motor.',dx:260,dy:-52,label:[1150,515],anchor:[980,339],geometry: Array.from({length:9},(_,i)=>{const a=i*40;return `<g transform="translate(978 292) scale(.43 1) rotate(${a})"><path d="M-8,-12 Q-30,-51 -17,-85 Q19,-91 24,-61 L13,-12Z" fill="url(#steel)" stroke="#c6e0eb66"/></g>`}).join('')+ring(978,292,22,8)},
 {id:'rear',name:'Tampa traseira',description:'Fecha a parte traseira da carcaça e aloja o apoio do eixo nesse lado do motor.',dx:170,dy:-34,label:[1015,120],anchor:[935,185],geometry:cylinder(926,305,23,109)+ring(925,305,35,15)+bolts(924,305,91)},
 {id:'body',name:'Carcaça e estator',description:'A carcaça sustenta o conjunto. Dentro dela, o estator e seus enrolamentos produzem o campo magnético girante.',dx:0,dy:0,label:[755,555],anchor:[810,450],geometry:
 `<path d="M760 417l-25 65 75 0 32-44M907 384l-14 57 74-7 13-31" fill="url(#blue)" stroke="#70b7d4"/><path d="M729 480l88 0 23 15-110 0ZM887 440l89-7 14 13-105 10Z" fill="#1c719f" stroke="#5d9ec2"/>`+
 cylinder(710,360,215,112)+
 Array.from({length:15},(_,i)=>{const a=(-80+i*11)*Math.PI/180;const y=360+Math.sin(a)*108,x=710+Math.cos(a)*45;return `<path d="M${x},${y} L${x+207},${y-51.75}" stroke="#06385c" stroke-width="7"/><path d="M${x},${y-2} L${x+207},${y-53.75}" stroke="#57b2dc" stroke-width="2.5"/>`}).join('')+
 ring(709,360,104,76,'steel')+
 Array.from({length:28},(_,i)=>{const a=i*Math.PI/14,x=709+Math.cos(a)*38,y=360+Math.sin(a)*89;return `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="8" fill="url(#copper)" stroke="#edba7166"/>`}).join('')+
 `<ellipse cx="709" cy="360" rx="29" ry="69" fill="url(#hole)"/><path d="M754 239l90-22 47 20-94 24Z" fill="#4ca7d0" stroke="#9fdcfa"/><path d="M754 239v-45l90-22v45M754 194l47 19 90-23v47l-94 24-43-22" fill="url(#blue)" stroke="#82cbed"/><path d="M754 194l90-22 47 18-90 23Z" fill="#6dc3eb" stroke="#a7dfff"/><path d="M867 209q-6-34 8-37q22-4 13 32" fill="none" stroke="#adcad9" stroke-width="8"/><path d="M845 306l49-12v28l-49 12Z" fill="#b7c5c8"/><path d="M851 313l34-8m-34 13l25-6m-25 12l34-8" stroke="#456078" stroke-width="2"/>`},
 {id:'rotor',name:'Rotor e eixo',description:'O rotor ocupa o interior do estator. O torque produzido nele é transmitido à carga pelo eixo.',dx:-235,dy:47,label:[478,170],anchor:[732,297],geometry:cylinder(642,377,310,14,'steel','steel')+cylinder(715,359,151,66,'steel','steel')+Array.from({length:13},(_,i)=>{const a=(-80+i*13)*Math.PI/180,y=359+Math.sin(a)*62,x=715+Math.cos(a)*26;return `<path d="M${x},${y}l146,-31" stroke="#435769" stroke-width="3"/><path d="M${x},${y-2}l146,-31" stroke="#d1dce266"/>`}).join('')+ring(714,359,59,16)+cylinder(603,387,112,13,'steel','steel')+`<path d="M615 375l51-13 0 6-51 13Z" fill="#dae4e8" stroke="#596d7c"/>`},
 {id:'bearing',name:'Rolamento dianteiro',description:'Sustenta o eixo, reduz o atrito e permite que o rotor gire com alinhamento.',dx:-302,dy:60,label:[354,545],anchor:[686,410],geometry:cylinder(690,365,15,32,'steel','steel')+ring(689,365,31,15)+Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9;return `<ellipse cx="${689+Math.cos(a)*10}" cy="${365+Math.sin(a)*23}" rx="3" ry="4" fill="#c5d6e2" stroke="#344759"/>`}).join('')},
 {id:'front',name:'Tampa dianteira',description:'Fecha o motor no lado de acionamento e mantém o rolamento dianteiro posicionado.',dx:-440,dy:88,label:[173,247],anchor:[688,265],geometry:cylinder(678,368,25,109)+cylinder(666,371,12,77)+ring(665,371,34,15)+bolts(677,368,91)+`<path d="M677 271q-25 3-31 74m33 116q-27-9-32-57" fill="none" stroke="#7cc6e7" stroke-width="3" opacity=".5"/>`}
];
scene.innerHTML=defs+`<ellipse cx="790" cy="515" rx="370" ry="62" fill="url(#shadow)" id="groundShadow"/><g id="camera"><path id="axis" d="M145 502L1390 191" stroke="#80bfe4" stroke-dasharray="5 9" opacity="0"/>${parts.map((p,i)=>`<g class="component" data-part="${p.id}" tabindex="0" role="button" aria-label="${p.name}"><g class="part-geometry" ${p.id==="rotor"?'clip-path="url(#rotorOcclusion)"':p.id==="fan"?'clip-path="url(#fanOcclusion)"':''}>${p.geometry}</g></g>`).join('')}<g id="labels">${parts.map((p,i)=>`<g class="part-label" id="label-${p.id}"><path class="leader"/><circle r="2.5" fill="#8ccded"/><text x="${p.label[0]}" y="${p.label[1]}" text-anchor="middle"><tspan class="part-number" x="${p.label[0]}" dy="0">0${i+1}</tspan><tspan x="${p.label[0]}" dy="19">${p.name}</tspan></text></g>`).join('')}</g></g>`;
let current=0,target=0,raf=0,last=0,demo=false,selected='';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function render(t){
 const zoom=1.7-.74*t; document.getElementById("rotorWindow").setAttribute("width",690+300*t); document.getElementById("fanWindow").setAttribute("width",926+190*t);
 document.getElementById('camera').setAttribute('transform',`translate(720 340) scale(${zoom}) translate(${-805+70*t} -340)`);
 parts.forEach(p=>{const node=scene.querySelector(`[data-part="${p.id}"]`);node.setAttribute('transform',`translate(${p.dx*t+(p.id==="hood"?-66*(1-t):0)} ${p.dy*t+(p.id==="hood"?16.5*(1-t):0)})`);const label=document.getElementById('label-'+p.id),x=p.anchor[0]+p.dx*t,y=p.anchor[1]+p.dy*t;label.querySelector('path').setAttribute('d',`M${x} ${y}L${p.label[0]} ${p.label[1]+(p.label[1]>400?-20:33)}`);label.querySelector('circle').setAttribute('cx',x);label.querySelector('circle').setAttribute('cy',y);});
 document.getElementById('labels').style.opacity=Math.max(0,(t-.48)/.52);
 document.getElementById('axis').style.opacity=t*.28;
 document.getElementById('groundShadow').setAttribute('rx',330+280*t);
 const percent=Math.round(t*100);document.getElementById('percentage').innerHTML=percent+'<span>%</span>';
 document.getElementById('viewState').textContent=percent===0?'Conjunto montado':percent===100?'Conjunto expandido':'Explorando o conjunto';
 expansion.style.setProperty('--progress',percent+'%');expansion.value=String(percent);expansion.setAttribute('aria-valuetext',percent+'% — '+(percent===0?'Conjunto montado':'Explosão do motor'));
}
function tick(now){const dt=last?Math.min(now-last,50):16;last=now;current+=(target-current)*(reduced?1:1-Math.exp(-dt/(demo?680:95)));if(Math.abs(current-target)<.0005)current=target;render(current);if(current!==target){raf=requestAnimationFrame(tick)}else{raf=0;last=0;if(demo){demo=false;document.getElementById('demo').textContent='▷ Explorar automaticamente'}}}
function move(value,automatic=false){target=Math.max(0,Math.min(1,value));demo=automatic;document.getElementById('demo').textContent=demo?'Ⅱ Pausar exploração':'▷ Explorar automaticamente';if(!raf)raf=requestAnimationFrame(tick)}
expansion.addEventListener('input',()=>move(Number(expansion.value)/100));
expansion.addEventListener('keydown',event=>{let v=target;if(event.key==='ArrowRight'||event.key==='ArrowUp')v+=.01;else if(event.key==='ArrowLeft'||event.key==='ArrowDown')v-=.01;else if(event.key==='Home')v=0;else if(event.key==='End')v=1;else return;event.preventDefault();move(v)});
 document.querySelectorAll('[data-value]').forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.value)/100)));
document.getElementById('demo').addEventListener('click',()=>{if(demo)move(current);else move(current>.98?0:1,true)});
function selectPart(id){const p=parts.find(p=>p.id===id);selected=id;scene.querySelectorAll('.component').forEach(n=>n.classList.toggle('selected',n.dataset.part===id));document.getElementById('partIndex').textContent=String(parts.indexOf(p)+1).padStart(2,'0');document.getElementById('partTitle').textContent=p.name;document.getElementById('partDescription').textContent=p.description;}
scene.querySelectorAll('.component').forEach(node=>{node.addEventListener('click',()=>{if(!dragged)selectPart(node.dataset.part)});node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPart(node.dataset.part)}})});
let dragStart=null,dragged=false;
scene.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragStart={x:e.clientX,value:current};dragged=false});
scene.addEventListener('pointermove',e=>{if(!dragStart)return;const delta=e.clientX-dragStart.x;if(Math.abs(delta)>5){dragged=true;scene.setPointerCapture(e.pointerId);move(dragStart.value+delta/(scene.getBoundingClientRect().width*.65))}});
scene.addEventListener('pointerup',()=>{dragStart=null});scene.addEventListener('pointercancel',()=>{dragStart=null});
window.addEventListener('lab-visibility-change',e=>{if(!e.detail.active)move(current)});
render(0);

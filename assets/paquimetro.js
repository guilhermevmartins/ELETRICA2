/* Desenho próprio em SVG. Escalas na mesma coordenada física, sem imagens externas.
   0,05: 20 intervalos em 39 mm (nônio longo); 0,02: 50 em 49 mm.
   Coincidência: abertura + índice × passo = inteiro + índice × base. */
(()=>{'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',PX=4.5,ORIGIN=180,JAW=110;
let resolution=.05,ticks=173,zoomed=false,zoomStart=null,parts=false,hidden=false,drag=null;
const fmt=v=>Number(v).toFixed(2).replace('.',','),value=()=>Math.round(ticks*resolution*100)/100;
const config=()=>{const n=Math.round(1/resolution),base=n===20?2:1;return {n,base,pitch:base-resolution,span:n*base-1,whole:Math.floor(ticks/n),index:ticks%n}};
const node=(tag,attrs={},content)=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(content!==undefined)e.textContent=content;return e};
function add(parent,tag,attrs,content){const e=node(tag,attrs,content);parent.append(e);return e}
const line=(parent,x1,y1,x2,y2,color='#29343b',width=.85,attrs={})=>add(parent,'line',{x1,y1,x2,y2,stroke:color,'stroke-width':width,...attrs});
const text=(parent,x,y,content,size=12,color='#26333b',attrs={})=>add(parent,'text',{x,y,'font-size':size,fill:color,'text-anchor':'middle',...attrs},content);
const path=(parent,d,fill='url(#metal)',extra={})=>add(parent,'path',{d,fill,stroke:'#47545e','stroke-width':1.35,'stroke-linejoin':'round',...extra});
function label(parent,x,y,caption,tx,ty){text(parent,x,y,caption,11,'#3e6076');add(parent,'path',{d:`M${x} ${y+6}V${(y+ty)/2}H${tx}V${ty}`,fill:'none',stroke:'#829cad','stroke-width':.8})}
function setValue(v){if(!Number.isFinite(v))return;ticks=Math.max(0,Math.min(Math.round(150/resolution),Math.round(v/resolution)));render()}
function makeDefs(svg){const defs=add(svg,'defs');const g=add(defs,'linearGradient',{id:'metal',x1:'0%',y1:'0%',x2:'100%',y2:'15%'});[['0%','#d8dfe3'],['23%','#f5f7f8'],['70%','#dce3e7'],['100%','#c2ccd2']].forEach(([offset,color])=>add(g,'stop',{offset,'stop-color':color}));const edge=add(defs,'linearGradient',{id:'bevel',x2:'0%',y2:'100%'});[['0%','#f9fbfc'],['50%','#9baab5'],['100%','#edf2f5']].forEach(([offset,color])=>add(edge,'stop',{offset,'stop-color':color}));const screw=add(defs,'linearGradient',{id:'screw'});[['0%','#5c6d78'],['30%','#e8eef2'],['65%','#b6c3cb'],['100%','#4c5c67']].forEach(([offset,color])=>add(screw,'stop',{offset,'stop-color':color}));const grip=add(defs,'pattern',{id:'knurl',width:4,height:4,patternUnits:'userSpaceOnUse'});add(grip,'rect',{width:4,height:4,fill:'#81929e'});line(grip,0,0,4,4,'#bac7cf',.6);line(grip,0,4,4,0,'#485c69',.4)}
function draw(){const svg=$('caliper'),v=value(),{n,base,pitch,span,whole,index}=config(),z=ORIGIN+v*PX,j=JAW+v*PX,end=z+span*PX+37,guide=$('guides').checked&&!hidden;svg.replaceChildren();makeDefs(svg);
 const jawShift=40,innerX=JAW-jawShift;
 // Haste e faces de medição se deslocam na mesma escala física.
 add(svg,'rect',{x:1135,y:236,width:v*PX,height:9,fill:'#c0cdd5',stroke:'#647883','stroke-width':1,'data-part':'depth-rod'});
 path(svg,'M33 276H110V493Q82 493 67 469L33 312Z');
 path(svg,`M${innerX} 199V67Q108 87 110 126V199Z`);
 path(svg,'M33 198H1135V282H110V276H33Z');
 add(svg,'rect',{x:34,y:199,width:1100,height:7,fill:'#f9fbfc',opacity:.8});
 line(svg,36,281,1133,281,'#7b8b95',1);line(svg,110,286,110,491,'#192b37',1.7);
 path(svg,`M${innerX} 67V159H${innerX+7}V181H110V126Q108 87 ${innerX} 67Z`,'#71828d',{'stroke-width':.7});
 add(svg,'path',{d:'M81 432H109V490Q94 489 83 479Z',fill:'#71828d',opacity:.9});
 text(svg,74,240,'SENAI',11,'#4e626f',{'font-weight':750});text(svg,74,254,'JAÚ',8,'#6f7e88',{'letter-spacing':1.2});
 // Escala fixa: números em centímetros e um traço por milímetro.
 const fixed=add(svg,'g',{'data-scale':'fixed'});
 for(let i=0;i<=210;i++){const x=ORIGIN+i*PX;if(x>1126)break;const big=i%10===0,half=i%5===0;line(fixed,x,264,x,big?222:half?238:250,'#29343b',big?.9:.65,{'data-mm':i});if(big)text(fixed,x+3,221,i/10,17,'#1c2c37',{'text-anchor':'start'})}
 text(svg,1116,218,'cm',9,'#71828e');
 const cursor=add(svg,'g',{class:'cursor',role:'slider',tabindex:0,'aria-label':'Cursor móvel do paquímetro','aria-valuemin':0,'aria-valuemax':150,'aria-valuenow':v,'aria-valuetext':hidden?'Leitura oculta':fmt(v)+' milímetros'});
 // Orelha, bico e quadro do cursor; a face externa está exatamente em j.
 path(cursor,`M${j-40} 67Q${j-80} 90 ${j-80} 128V166H${j+27}V199H${j-40}Z`,'#899aa5');
 path(cursor,`M${j} 300H${j+88}L${j+43} 468Q${j+33} 493 ${j} 493Z`);
 add(cursor,'path',{d:`M${j+1} 432H${j+36}L${j+27} 482Q${j+15} 491 ${j+1} 491Z`,fill:'#71828d'});
 line(cursor,j,305,j,491,'#192b37',1.7);
 path(cursor,`M${j} 166H${end}V209H${z-43}V264H${end}V315H${j}V300H${j+10}V282H${j}Z`);
 // Janela vazada: mantém os traços fixos visíveis entre o quadro e o nônio.
 add(cursor,'rect',{x:z-43,y:210,width:end-z+43,height:53,fill:'#e2e9ed'});
 // Reproduz apenas a porção visível da escala fixa na janela do cursor.
 const windowScale=add(cursor,'g',{'data-scale':'window'});
 for(let i=0;i<=210;i++){const x=ORIGIN+i*PX;if(x<z-42||x>end-1)continue;const big=i%10===0,half=i%5===0;line(windowScale,x,264,x,big?222:half?238:250,'#29343b',big?.9:.65);if(big)text(windowScale,x+3,221,i/10,17,'#1c2c37',{'text-anchor':'start'})}
 add(cursor,'rect',{x:z-43,y:167,width:end-z+43,height:5,fill:'url(#bevel)'});
 line(cursor,z-42,208,end-1,208,'#6c7f8a',.8);
 add(cursor,'rect',{x:z-43,y:265,width:end-z+43,height:43,fill:'#edf1f3'});
 line(cursor,z-43,264,end,264,'#263c49',.8);line(cursor,z-43,310,end,310,'#7a8e9c',.8);
 const nonius=add(cursor,'g',{'data-scale':'vernier'});
 for(let i=0;i<=n;i++){const x=z+i*pitch*PX,labelled=i%(n===20?2:5)===0;line(nonius,x,264,x,labelled?291:282,'#29343b',labelled?.8:.65,{'data-index':i});if(labelled)text(nonius,x+2,304,i/(n/10),11,'#26333b',{'text-anchor':'start'})}
 const screwX=(z-43+end)/2;
 add(cursor,'rect',{x:screwX-7,y:157,width:14,height:9,fill:'#71828d',stroke:'#485d6b','stroke-width':1});
 path(cursor,`M${screwX-18} 142L${screwX-12} 137H${screwX+12}L${screwX+18} 142V156H${screwX-18}Z`,'url(#screw)',{'stroke-width':.8});line(cursor,screwX-16,144,screwX+16,144,'#f5f8fa',.6);
 // Roldana de ajuste sob o cursor, com recartilhado.
 add(cursor,'path',{d:`M${end-57} 315A27 27 0 0 0 ${end-3} 315Z`,fill:'url(#knurl)',stroke:'#647c8b','stroke-width':1.3});
 add(cursor,'path',{d:`M${end-53} 315A23 23 0 0 0 ${end-7} 315`,fill:'none',stroke:'#d5e0e7','stroke-width':1.5});
 add(cursor,'rect',{x:j-3,y:132,width:end-j+7,height:190,rx:5,fill:'transparent',stroke:'transparent','data-focus-ring':'','data-drag-handle':''});
 if(guide){const match=z+index*pitch*PX;line(svg,ORIGIN+whole*PX,224,ORIGIN+whole*PX,264,'#007a9b',1.4,{'data-guide':'whole'});line(svg,z,253,z,294,'#ce1830',1.2,{'data-guide':'zero'});line(svg,match,235,match,291,'#b76a00',1.4,{'data-guide':'match','data-matching-mm':whole+base*index,'data-matching-index':index});add(svg,'circle',{cx:match,cy:259,r:2.4,fill:'#e0a33b'})}
 if(!zoomed){const y=523;line(svg,JAW,y,j,y,'#4f758f',.8);line(svg,JAW,499,JAW,y+5,'#829baa',.7);line(svg,j,499,j,y+5,'#829baa',.7);if(v>6){add(svg,'path',{d:`M${JAW} ${y}l7-3v6Z M${j} ${y}l-7-3v6Z`,fill:'#4f758f'})}text(svg,Math.max(155,(JAW+j)/2),552,hidden?'Leitura oculta':fmt(v)+' mm',22,'#304f63',{'font-weight':500});
  if(parts){label(svg,195,87,'Orelhas · medidas internas',j-41,117);label(svg,71,374,'Bico fixo',91,413);label(svg,Math.min(1030,j+170),400,'Bico móvel',j+30,426);label(svg,725,101,'Escala fixa',727,224);label(svg,Math.min(960,screwX+115),83,'Parafuso de fixação',screwX,137);label(svg,Math.min(1035,z+155),378,'Nônio',z+45,285);label(svg,1110,360,'Haste de profundidade',1135+Math.min(40,v*PX),242)}
 }
 const width=$('stage').clientWidth;
 if(zoomed){
  if(zoomStart===null)zoomStart=Math.floor(v)-5;
  // Mantém a régua parada durante o arraste; acompanha apenas ao alcançar a borda.
  if(v<zoomStart+1.5)zoomStart=v-1.5;
  if(v>zoomStart+11.5)zoomStart=v-11.5;
  const w=(span+13)*PX,h=w*570/1300,x=ORIGIN+zoomStart*PX,y=260-h/2;
  svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);
  const clip=add(svg.querySelector('defs'),'clipPath',{id:'loupeClip'});add(clip,'rect',{x,y,width:w,height:h});
  const scene=node('g',{'clip-path':'url(#loupeClip)'});
  for(const child of [...svg.children])if(child.tagName!=='defs')scene.append(child);
  svg.append(scene);
 }
 else if(width<600){const w=Math.max(650,(v+span+55)*PX);svg.setAttribute('viewBox',`22 35 ${w} ${w*325/Math.max(1,width)}`)}
 else svg.setAttribute('viewBox','0 0 1300 570');
 // O limite de abertura é independente da extensão graduada da régua.
 svg.setAttribute('aria-label',hidden?'Paquímetro, leitura oculta':`Paquímetro universal aberto em ${fmt(v)} milímetros`);
 cursor.addEventListener('pointerdown',startDrag);
 cursor.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowUp')next=v+resolution;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')next=v-resolution;else if(e.key==='Home')next=0;else if(e.key==='End')next=150;else return;e.preventDefault();setValue(next);svg.querySelector('.cursor').focus({preventScroll:true})});
}
function startDrag(e){if(e.button!==0)return;if(drag)return;const matrix=$('caliper').getScreenCTM();drag={id:e.pointerId,start:e.clientX,initial:value(),scale:matrix.a};$('caliper').setPointerCapture(e.pointerId);e.preventDefault()}
function render(){const v=value(),{n,span,whole,index,pitch}=config();$('opening').step=resolution;$('opening').value=v;if(document.activeElement!==$('exact'))$('exact').value=hidden?'':fmt(v);$('reading').innerHTML=hidden?'Leitura oculta':`${fmt(v)} <small>mm</small>`;$('mainRead').textContent=whole+' mm';$('vernierCaption').textContent='Nônio · traço '+index;$('vernierRead').textContent=`${index} × ${fmt(resolution)} = ${fmt(index*resolution)} mm`;$('totalRead').textContent=fmt(v)+' mm';$('stepLabel').textContent=`1 toque = ${fmt(resolution)} mm`;$('scaleLabel').textContent=`Escala fixa: 1 mm · Nônio: ${fmt(resolution)} mm`;$('resolutionSummary').textContent=`${n} divisões · ${fmt(resolution)} mm`;$('vernierExplanation').textContent=`Procure o traço do nônio que coincide com um traço da escala fixa. Conte os intervalos a partir do zero: cada intervalo acrescenta ${fmt(resolution)} mm. Os números de 0 a 10 no nônio marcam os décimos de milímetro.`;$('resolutionNote').textContent=`Neste desenho, ${n} intervalos do nônio ocupam ${span} mm. Cada intervalo tem ${fmt(pitch)} mm; a diferença para ${n===20?'2':'1'} mm é ${fmt(resolution)} mm. A leitura é a parte inteira mais o número do intervalo coincidente multiplicado pela resolução.`;document.body.classList.toggle('answers-hidden',hidden);document.body.classList.toggle('zoomed',zoomed);$('viewLabel').textContent=zoomed?'LUPA / ESCALA FIXA + NÔNIO':'INSTRUMENTO COMPLETO';$('zoom').setAttribute('aria-pressed',zoomed);$('zoomBack').hidden=!zoomed;$('toggleParts').setAttribute('aria-pressed',parts);$('hideAnswer').setAttribute('aria-pressed',hidden);$('hideAnswer').querySelector('span').textContent=hidden?'Mostrar leitura':'Ocultar leitura';$('hideAnswer').setAttribute('aria-label',hidden?'Mostrar leitura':'Ocultar leitura');for(const b of document.querySelectorAll('[data-resolution]'))b.setAttribute('aria-pressed',Number(b.dataset.resolution)===resolution);draw()}
$('caliper').addEventListener('pointerdown',e=>{if(zoomed)startDrag(e)});
$('caliper').addEventListener('pointermove',e=>{if(drag?.id===e.pointerId)setValue(drag.initial+(e.clientX-drag.start)/(PX*drag.scale))});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('caliper').addEventListener(type,()=>drag=null);
$('opening').oninput=e=>setValue(Number(e.target.value));
for(const b of document.querySelectorAll('[data-resolution]'))b.onclick=()=>{const old=value();resolution=Number(b.dataset.resolution);$('inputHint').textContent='';setValue(old)};
$('minus').onclick=()=>setValue(value()-resolution);$('plus').onclick=()=>setValue(value()+resolution);$('reset').onclick=()=>{setValue(0);$('inputHint').textContent=''};
function toggleZoom(){zoomed=!zoomed;zoomStart=null;render()}$('zoom').onclick=toggleZoom;$('zoomBack').onclick=toggleZoom;
$('toggleParts').onclick=()=>{parts=!parts;if(parts)zoomed=false;render()};$('hideAnswer').onclick=()=>{hidden=!hidden;$('exact').value=hidden?'':fmt(value());render()};$('guides').onchange=render;
$('exactForm').onsubmit=e=>{e.preventDefault();const raw=$('exact').value.trim().replace(',','.');if(!/^\d+(\.\d+)?$/.test(raw)||Number(raw)>150){$('exact').setAttribute('aria-invalid','true');$('inputHint').textContent='Digite um valor de 0 a 150 mm. Exemplo: 24,36.';return}const requested=Number(raw);$('exact').removeAttribute('aria-invalid');setValue(requested);$('exact').value=hidden?'':fmt(value());$('inputHint').textContent=Math.abs(requested-value())>1e-7?`Abertura ajustada para ${fmt(value())} mm, em passos de ${fmt(resolution)} mm.`:''};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.caliper-lab').requestFullscreen()}catch{$('inputHint').textContent='Use F11 para ampliar a janela do navegador.'}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Sair da tela cheia':'Tela cheia');render()});
let resizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(draw)});render();
})();

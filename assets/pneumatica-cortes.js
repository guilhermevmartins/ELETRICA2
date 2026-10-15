/* Cortes funcionais próprios: percurso contínuo, sede fixa e peça móvel separada. */
window.PneumaticCutaway = (() => {
 'use strict';
 const AIR='#4de0c3',VENT='#7da6ff',METAL='#b8ccdb',GOLD='#f4c574',OFF='#425b70';
 const p=(d,c=METAL,w=3,attrs='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
 const label=(x,y,t,small=false)=>`<text x="${x}" y="${y}" text-anchor="middle" class="${small?'pf-cut-small':'pf-cut-label'}">${t}</text>`;
 const pressure=(d,on)=>p(d,on?AIR:OFF,12);
 const route=(d,id,allowed,c=AIR)=>`<g data-flow-route="${id}" data-open="${allowed}">${allowed?p(d,c,6)+p(d,'#eafff8',2,`class="pf-flow pf-particles" data-flow-route="${id}" stroke-dasharray="3 13"`):''}</g>`;
 const housing=(x=480,y=180,w=340,h=145)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#pfBodyHatch)" stroke="#657f94" stroke-width="3"/><rect x="${x+12}" y="${y+12}" width="${w-24}" height="${h-24}" rx="9" fill="#0a1723" stroke="#344f64" stroke-width="1.5"/>`;
 const sphere=(x,y,r=24,closed=false)=>`<circle data-moving-part="obturador" data-seal-state="${closed?'closed':'open'}" cx="${x}" cy="${y}" r="${r}" fill="url(#pfPoppetMetal)" stroke="${closed?GOLD:METAL}" stroke-width="3"/>`;
 const note=t=>label(650,466,t,true);
 function logic(kind,r,m,settled){
  let h=housing()+pressure('M440 250H500',r.a>0)+pressure('M800 250H860',r.b>0)+pressure('M650 192V120',r.open);
  h+=label(462,360,`A · ${r.a} bar`)+label(838,360,`B · ${r.b} bar`)+label(650,100,`S · ${r.output} bar`);
  if(kind==='or'){
   const x=532+m*236;
   h+=p('M500 205L520 229M520 271L500 295M800 205L780 229M780 271L800 295',METAL,5);
   h+=`<g data-fixed-seat="left">${p('M520 229V271',r.open&&r.selected==='B'?GOLD:OFF,2)}</g><g data-fixed-seat="right">${p('M780 229V271',r.open&&r.selected==='A'?GOLD:OFF,2)}</g>`;
   h+=route('M440 250H650V120','A-S',settled&&r.open&&r.selected==='A');
   h+=route('M860 250H650V120','B-S',settled&&r.open&&r.selected==='B');
   h+=sphere(x,250,24,r.open)+p(`M${x} 278V396`,OFF,1)+label(x,416,'esfera seletora',true);
   h+=note(r.open?`A esfera veda ${r.selected==='A'?'B':'A'}; ${r.selected} comunica com S.`:'Sem sinal: a esfera conserva a última seleção.');
  }else{
   const shift=(m-.5)*64,left=548+shift,right=742+shift;
   // A maior desloca a peça à direita e fecha A; a menor B pode alimentar S.
   h+=p('M590 193V215M590 285V313M710 193V215M710 285V313',METAL,6);
   const source=r.a<r.b?'A':r.b<r.a?'B':r.open?'A':null;
   h+=route('M440 250H500V202H580V250H650V120','A-S',settled&&r.open&&(source==='A'||r.a===r.b));
   h+=route('M860 250H800V202H720V250H650V120','B-S',settled&&r.open&&(source==='B'||r.a===r.b));
   h+=`<g data-moving-part="obturador-duplo" transform="translate(${shift},0)"><path d="M558 275H742" stroke="${METAL}" stroke-width="6"/><rect x="548" y="215" width="10" height="70" rx="3" fill="url(#pfPoppetMetal)" stroke="${r.a>r.b?GOLD:METAL}" stroke-width="2"/><rect x="742" y="215" width="10" height="70" rx="3" fill="url(#pfPoppetMetal)" stroke="${r.b>r.a?GOLD:METAL}" stroke-width="2"/></g>`;
   h+=p(`M${left+5} 287V396`,OFF,1)+label(left+5,416,'obturador duplo',true);
   h+=note(r.open?(r.a===r.b?'Pressões iguais: a peça fica equilibrada e S recebe sinal.':`A maior pressão fecha seu caminho; ${source} alimenta S.`):'Uma entrada isolada desloca a peça e fecha seu acesso a S.');
  }
  return h;
 }
 function retention(kind,r,m,settled,options){
  const x=620+m*72;
  let h=housing()+pressure('M440 250H594',r.a>0)+pressure('M742 250H860',r.b>0);
  h+=p('M600 193V236.73M600 263.27V313',METAL,5)+label(465,145,`1 · ${r.a} bar`)+label(837,145,`2 · ${r.b} bar`);
  // Sede anular: esfera R24 em (620,250), tangente às duas bordas da abertura.
  // O ar cruza o mesmo gargalo nos dois sentidos e passa acima da haste do piloto.
  h+=route('M440 250H560Q580 250 580 240H620Q640 207 674 207H730Q750 207 750 250H860','1-2',settled&&r.flow&&!r.reverse);
  h+=route('M860 250H750Q750 207 730 207H674Q640 207 620 240H580Q580 250 560 250H440','2-1',settled&&r.flow&&r.reverse);
  if(kind==='pilot'){
   const pinEnd=r.pilot?x-24:584;
   h+=`<g data-moving-part="pistao-piloto"><rect x="${pinEnd-84}" y="239" width="16" height="22" rx="3" fill="${GOLD}"/><path d="M${pinEnd-68} 250H${pinEnd}" stroke="${GOLD}" stroke-width="7"/></g>`;
   h+=p(`M525 430V355H${pinEnd-76}V265`,r.pilot?AIR:OFF,3,'stroke-dasharray="7 6"');
   h+=label(525,453,'X · sinal de piloto',true)+label(650,396,r.pilot?'O pino mantém a esfera fora da sede.':'Sem piloto, a retenção bloqueia o retorno.',true);
  }else if(options.spring){
   const start=x+24,end=800;let d=`M${start} 250`;
   for(let i=1;i<=10;i++)d+=`L${start+(end-start)*i/10} ${i===10?250:i%2?238:262}`;
   h+=p(d,GOLD,3)+label(750,396,'mola de fechamento',true);
  }
  h+=sphere(x,250,24,!r.open)+p('M600 282V357',OFF,1)+label(600,377,'sede fixa',true);
  h+=note(r.flow?(r.reverse?'O retorno passa pela abertura e contorna o obturador.':'O ar afasta a esfera e passa ao redor dela.'):r.open?'Passagem aberta, mas pressões iguais não geram fluxo.':'Esfera encostada: pressão pode existir sem passagem de ar.');
  return h;
 }
 function flow(r,m,settled,options){
  const tip=276-m*67,bypassOpen=r.bypass,ballX=648-options.bypassMover*32;
  let h=housing(480,150,340,260)+pressure('M440 250H510',!r.reverse)+pressure('M790 250H860',r.reverse);
  h+=p('M510 250H620M680 250H790',OFF,16)+p('M620 290L650 276L680 290',METAL,6);
  const gapY=(tip+276)/2;
  const forward=`M440 250H620Q635 250 642 ${gapY}Q650 ${gapY} 658 ${gapY}Q666 250 680 250H860`;
  const reverse=`M860 250H680Q666 250 658 ${gapY}Q650 ${gapY} 642 ${gapY}Q635 250 620 250H440`;
  h+=route(r.reverse?reverse:forward,r.reverse?'2-1-restriction':'1-2',settled&&!bypassOpen&&r.ratio>0);
  h+=`<g data-moving-part="agulha" data-seal-state="${r.opening===0?'closed':'open'}"><path d="M650 105V${tip-32}" stroke="${GOLD}" stroke-width="9"/><path d="M627 ${tip-38}H673L650 ${tip}Z" fill="url(#pfPoppetMetal)" stroke="${GOLD}" stroke-width="3"/><path d="M628 112H672" stroke="${GOLD}" stroke-width="7"/></g>`;
  if(options.oneway){
   h+=p('M520 250V365H790V250',OFF,14)+p('M690 343L666 365L690 387',METAL,5);
   h+=route('M860 250H790V365H650Q644 332 616 332H580Q560 332 560 365H520V250H440','2-1-bypass',settled&&bypassOpen&&options.bypassMover>.985);
   h+=sphere(ballX,365,18,!bypassOpen);
  }
  h+=label(463,139,'1')+label(837,139,'2')+label(650,434,bypassOpen?'Retenção aberta: retorno pelo desvio.':r.opening>0?'Agulha levantada: passagem regulada.':'Agulha encostada: passagem fechada.',true);
  return h+note(`Abertura da agulha: ${Math.round(r.opening*100)}%.`);
 }
 function exhaust(r,m,settled,options){
  const x=532+m*236,charge=options.charge;
  let h=housing()+pressure('M440 250H500',r.open)+pressure('M650 192V140',charge>.005)+p('M800 250H860',VENT,10);
  h+=p('M500 205L520 229M520 271L500 295M800 205L780 229M780 271L800 295',METAL,5);
  h+=`<rect x="575" y="65" width="150" height="75" rx="14" fill="${AIR}" fill-opacity="${.04+charge*.3}" stroke="${METAL}" stroke-width="3"/>`+label(650,110,`Câmara · ${Math.round(charge*100)}%`);
  h+=route('M440 250H650V140','1-2',settled&&r.open&&charge<.999);
  h+=route('M650 140V250H860','2-3',settled&&!r.open&&charge>.005,VENT);
  h+=sphere(x,250,24,true)+p('M860 238V262L880 250Z',VENT,3)+label(463,357,'1 · alimentação')+label(650,168,'2',true)+label(838,357,'3 · escape');
  h+=note(r.open?'O obturador fecha 3 e permite encher a câmara.':charge>.005?'A câmara empurra o obturador: 1 fecha e 3 abre.':'Câmara descarregada: não há partículas no escape.');
  if(options.compare)h+=p('M530 397H770',OFF,8)+p(`M530 397H${530+options.longCharge*240}`,VENT,8)+label(650,428,`Caminho longo ilustrativo: ${Math.round(options.longCharge*100)}%`,true);
  return h;
 }
 function render(kind,r,m,phase,options={}){
  const settled=Math.abs(m-r.target)<.015;
  let h=label(650,45,'CORTE FUNCIONAL · PEÇA MÓVEL E PASSAGENS',true);
  if(kind==='and'||kind==='or')h+=logic(kind,r,m,settled);
  else if(kind==='check'||kind==='pilot')h+=retention(kind,r,m,settled,options);
  else if(kind==='flow')h+=flow(r,m,settled,options);
  else h+=exhaust(r,m,settled,options);
  if(!settled)h+=label(650,500,'Comutando · aguarde a peça liberar a passagem.',true);
  return h;
 }
 return {render};
})();

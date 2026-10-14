'use strict';
const modules=window.LAB_MODULES,areas=window.LAB_AREAS,frames=new Map();
const tabs=document.getElementById('tabs'),cards=document.getElementById('cards'),panels=document.getElementById('panels');
let active='';
const areaFor=id=>areas.find(a=>a.modules.includes(id));
const icon=a=>`<span class="area-icon"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="${a.icon}"/></svg></span>`;
document.getElementById('areaCards').innerHTML=areas.map((a,i)=>`<a class="area-card" href="#area-${a.id}"><div class="area-card-top">${icon(a)}<span class="area-status ${a.modules.length?'available':''}">${a.modules.length?`${a.modules.length} ${a.modules.length===1?'simulador disponível':'simuladores disponíveis'}`:'Em preparação'}</span></div><h2>${a.title}</h2><span class="area-subtitle">${a.subtitle}</span><p>${a.description}</p><div class="area-topics">${a.topics}</div><div class="area-action"><span>0${i+1} · Explorar área</span><span aria-hidden="true">↗</span></div></a>`).join('');
modules.forEach(item=>{
 const tab=document.createElement('button');tab.className='tab';tab.id='tab-'+item.id;tab.setAttribute('role','tab');tab.setAttribute('aria-selected','false');tab.setAttribute('aria-controls','panel-'+item.id);tab.tabIndex=-1;tab.dataset.module=item.id;tab.innerHTML=`<span>${item.number}</span>${item.short}`;tabs.append(tab);
 const card=document.createElement('article');card.className='module-card';card.dataset.module=item.id;card.innerHTML=`<div class="module-visual"><span class="module-number">MÓDULO ${item.number}</span>${item.id==="motor-vistas"?`<a class="motor-photo-link" href="#${item.id}" aria-label="Explorar ${item.title}">`:""}<img class="${item.imageClass}" src="${item.image}" alt="Referência visual: ${item.title}">${item.id==="motor-vistas"?"</a>":""}</div><div class="module-info"><div class="eyebrow">${item.category}</div><h3>${item.title}</h3><p>${item.description}</p><div class="tags">${item.tags.map(t=>`<span>${t}</span>`).join('')}</div><button class="open-module" data-open="${item.id}" aria-label="Abrir simulador de ${item.title}">Abrir simulador <span aria-hidden="true">↗</span></button></div>`;cards.append(card);
 const panel=document.createElement('section');panel.className='frame-panel';panel.id='panel-'+item.id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-'+item.id);panel.hidden=true;panels.append(panel);
});
function selectModule(id,focus=false){
 const previous=active;
 let item=modules.find(m=>m.id===id),area=areas.find(a=>'area-'+a.id===id)||areaFor(id);
 if(!area){id='inicio';item=null;}
 active=id;
 const landing=id==='inicio',catalog=!!area&&!item;
 document.getElementById('areasHome').hidden=!landing;
 document.getElementById('home').hidden=!catalog;
 document.getElementById('backAreas').hidden=landing;
 document.getElementById('workspaceNote').hidden=!item;
 tabs.hidden=landing||!area.modules.length;
 document.getElementById('tab-inicio').dataset.module=area?'area-'+area.id:'inicio';
 for(const tab of tabs.children){const target=tab.dataset.module,on=target===id;tab.hidden=!area||(target!=='area-'+area.id&&!area.modules.includes(target));tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;if(on&&focus)tab.focus();}
 if(area){
  document.getElementById('areaTitle').textContent=area.title;
  document.getElementById('areaDescription').textContent=area.description;
  document.getElementById('areaBreadcrumb').textContent='Áreas de estudo / '+area.title;
  document.getElementById('moduleCount').textContent=String(area.modules.length).padStart(2,'0');
  document.getElementById('areaEmpty').hidden=!!area.modules.length;
  document.getElementById('equipmentHeading').hidden=!area.modules.length;
  document.getElementById('learningStrip').hidden=!area.modules.length;
  document.getElementById('emptyTopics').textContent=area.topics;
  document.getElementById('tab-inicio').innerHTML='<span>⌂</span>Selecionar módulo';
  const firstStep=document.querySelector('#learningStrip article');
  firstStep.querySelector('h3').textContent=area.id==='digital'?'Explore a lógica':area.id==='comandos'?'Entre no motor':'Explore a anatomia';
  firstStep.querySelector('p').textContent=area.id==='digital'?'Altere os bits e acompanhe as saídas, as tabelas e a memória dos circuitos.':area.id==='comandos'?'Observe o campo girante, acompanhe as bobinas e experimente os fechamentos.':'Abra a vista explodida e descubra a função de cada componente.';
  for(const card of cards.children)card.hidden=!area.modules.includes(card.dataset.module);
  document.getElementById('home').setAttribute('aria-labelledby',area.modules.length?'tab-inicio':'areaTitle');
  document.getElementById('home').setAttribute('role',area.modules.length?'tabpanel':'region');
 }
 for(const module of modules){const panel=document.getElementById('panel-'+module.id);panel.hidden=module.id!==id;
  if(module.id===id&&!frames.has(id)){const frame=document.createElement('iframe');frame.title='Simulador de '+module.title;frame.src=module.file;frame.id='frame-'+id;frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'lab-visibility',active:active===module.id},'*'));panel.append(frame);frames.set(id,frame);}
 }
 for(const [key,frame] of frames)frame.contentWindow.postMessage({type:'lab-visibility',active:key===id},'*');
 document.title=(item?item.title:area?area.title:'Áreas de estudo')+' · EletroLab';
 if(location.hash!=='#'+id)location.hash=id;
 if(catalog&&!focus)document.getElementById('areaTitle').focus({preventScroll:true});
 if(landing&&previous)document.getElementById('brandHome').focus({preventScroll:true});
 window.scrollTo({top:0,behavior:'instant'});
}
tabs.addEventListener('click',e=>{const tab=e.target.closest('[data-module]');if(tab)selectModule(tab.dataset.module);});
tabs.addEventListener('keydown',e=>{const list=[...tabs.children].filter(t=>!t.hidden),index=list.indexOf(document.activeElement);let next;if(e.key==='ArrowRight')next=(index+1)%list.length;else if(e.key==='ArrowLeft')next=(index+list.length-1)%list.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=list.length-1;else return;e.preventDefault();selectModule(list[next].dataset.module,true);});
cards.addEventListener('click',e=>{const button=e.target.closest('[data-open]');if(button)selectModule(button.dataset.open,true);});
document.getElementById('brandHome').onclick=()=>selectModule('inicio');
document.getElementById('backAreas').onclick=()=>selectModule('inicio');
document.getElementById('emptyBack').onclick=()=>selectModule('inicio');
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1)||'inicio';if(id!==active)selectModule(id);});
window.addEventListener('message',e=>{const entry=[...frames].find(([,frame])=>frame.contentWindow===e.source);if(!entry||!e.data)return;const [id,frame]=entry;
 if(e.data.type==='lab-height'&&Number.isFinite(e.data.height)&&e.data.height>100&&e.data.height<20000)frame.style.height=Math.ceil(e.data.height)+2+'px';
 if(e.data.type==='lab-ready')frame.contentWindow.postMessage({type:'lab-visibility',active:active===id},'*');
});
selectModule(location.hash.slice(1)||'inicio');

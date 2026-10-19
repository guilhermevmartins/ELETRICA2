'use strict';
const modules=window.LAB_MODULES,areas=window.LAB_AREAS,frames=new Map();
const tabs=document.getElementById('tabs'),cards=document.getElementById('cards'),panels=document.getElementById('panels');
let active='';
const areaFor=id=>areas.find(a=>a.modules.includes(id));
const groupList=(groups=[],parents=[])=>groups.flatMap(g=>[{group:g,parents},...groupList(g.groups||[],[...parents,g])]);
const groupsFor=area=>groupList(area?.groups||[]);
const groupPath=(area,id)=>{const found=groupsFor(area).find(x=>x.group.id===id)||groupsFor(area).filter(x=>x.group.modules.includes(id)).at(-1);return found?[...found.parents,found.group]:[];};
// Navegação nativa em lista: áreas > grupos > atividades.
const moduleLinks=ids=>ids.map(id=>{const item=modules.find(m=>m.id===id);return item?'<a class="study-leaf" href="#'+item.id+'" data-open="'+item.id+'"><span class="leaf-mark" aria-hidden="true">↗</span><span class="leaf-title">'+item.short+'</span><span class="leaf-action">Abrir simulador</span></a>':'';}).join('');
const branchContents=node=>(node.groups||[]).map(groupBranch).join('')+moduleLinks((node.modules||[]).filter(id=>!(node.groups||[]).some(g=>g.modules.includes(id))));
function groupBranch(group){return '<details class="study-group" data-group="'+group.id+'"><summary><span class="tree-chevron" aria-hidden="true"></span><span class="tree-name">'+group.title+'</span><span class="tree-count">'+group.modules.length+' '+(group.modules.length===1?'simulador':'simuladores')+'</span></summary><div class="tree-children">'+branchContents(group)+'</div></details>';}
const areaTree=document.getElementById('areaCards');
areaTree.innerHTML=areas.map(area=>'<details class="study-area" data-area="'+area.id+'"><summary><span class="tree-chevron" aria-hidden="true"></span><span class="tree-name">'+area.title+'</span><span class="tree-count">'+(area.modules.length?area.modules.length+' '+(area.modules.length===1?'simulador':'simuladores'):'Em preparação')+'</span></summary><div class="tree-children"><p class="tree-description">'+area.description+'</p>'+branchContents(area)+'</div></details>').join('');
document.getElementById('areaTotals').textContent=String(areas.length).padStart(2,'0')+' ÁREAS · '+new Set(areas.flatMap(a=>a.modules)).size+' SIMULADORES';
areaTree.addEventListener('click',e=>{const link=e.target.closest('[data-open]');if(link){e.preventDefault();selectModule(link.dataset.open,true);}});
document.getElementById('collapseGroups').onclick=()=>{areaTree.querySelectorAll('details[open]').forEach(d=>d.open=false);};
modules.forEach(item=>{
 const tab=document.createElement('button');tab.className='tab';tab.id='tab-'+item.id;tab.setAttribute('role','tab');tab.setAttribute('aria-selected','false');tab.setAttribute('aria-controls','panel-'+item.id);tab.tabIndex=-1;tab.dataset.module=item.id;tab.innerHTML=`<span>${item.number}</span>${item.short}`;tabs.append(tab);
 const panel=document.createElement('section');panel.className='frame-panel';panel.id='panel-'+item.id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','tab-'+item.id);panel.hidden=true;panels.append(panel);
});
function selectModule(id,focus=false){
 if(id==='grupo-pneumatica')id='area-pneumatica';
 const previous=active;
 let item=modules.find(m=>m.id===id),area=areas.find(a=>'area-'+a.id===id||groupsFor(a).some(x=>x.group.id===id))||areaFor(id);
 const path=groupPath(area,id),group=path.at(-1),childGroups=(group||area)?.groups||[];
 const groupLanding=!!childGroups.length;
 const visibleModules=(group?.modules||area?.modules||[]).filter(id=>!childGroups.some(g=>g.modules.includes(id)));
 const catalogTarget=group?group.id:area?'area-'+area.id:'inicio';
 if(!area){id='inicio';item=null;}
 active=id;
 const landing=id==='inicio',catalog=!!area&&!item;
 document.getElementById('areasHome').hidden=!landing;
 document.getElementById('home').hidden=!catalog;
 document.getElementById('backAreas').hidden=landing;
 document.getElementById('backAreas').textContent=group?(item?'← '+group.title:'← '+(path.at(-2)?.title||area.title)):'← Áreas de estudo';
 document.getElementById('workspaceNote').hidden=!item;
 tabs.hidden=landing||!visibleModules.length;
 document.getElementById('tab-inicio').dataset.module=catalogTarget;
 for(const tab of tabs.children){const target=tab.dataset.module,on=target===id;tab.hidden=!area||(target!==catalogTarget&&!visibleModules.includes(target));tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;if(on&&focus)tab.focus();}
 if(area){
  document.getElementById('areaTitle').textContent=group?group.title:area.title;
  document.getElementById('areaDescription').textContent=group?group.description:area.description;
  const breadcrumb=document.getElementById('areaBreadcrumb');breadcrumb.replaceChildren();
  const addCrumb=(label,target)=>{const link=document.createElement('a');link.textContent=label;link.href='#'+target;breadcrumb.append(link,document.createTextNode(' / '));};
  addCrumb('Áreas de estudo','inicio');if(group)addCrumb(area.title,'area-'+area.id);for(const ancestor of path.slice(0,-1))addCrumb(ancestor.title,ancestor.id);breadcrumb.append(document.createTextNode(group?group.title:area.title));
  document.getElementById('moduleCount').textContent=String((group||area).modules.length).padStart(2,'0');
  document.querySelector('.hero-side p').textContent=group?'simuladores disponíveis neste grupo':'simuladores disponíveis nesta área';
  document.querySelector('#equipmentHeading h2').textContent=groupLanding?'Abra um grupo para escolher a atividade':group?'Escolha uma atividade para demonstrar':'O que vamos estudar hoje?';
  document.querySelector('#equipmentHeading span').textContent=groupLanding?'CLIQUE PARA EXPANDIR':'ESCOLHA UM SIMULADOR';
  document.getElementById('areaEmpty').hidden=!!area.modules.length;
  document.getElementById('equipmentHeading').hidden=!area.modules.length;
  document.getElementById('learningStrip').hidden=!area.modules.length||!!area.groups;
  document.getElementById('emptyTopics').textContent=area.topics;
  document.getElementById('tab-inicio').innerHTML='<span>⌂</span>'+(group?group.title:'Selecionar módulo');
  const firstStep=document.querySelector('#learningStrip article');
  firstStep.querySelector('h3').textContent=area.id==='digital'?'Explore a lógica':area.id==='comandos'?'Entre no motor':'Explore a anatomia';
  firstStep.querySelector('p').textContent=area.id==='digital'?'Altere os bits e acompanhe as saídas, as tabelas e a memória dos circuitos.':area.id==='comandos'?'Observe o campo girante, acompanhe as bobinas e experimente os fechamentos.':'Abra a vista explodida e descubra a função de cada componente.';
  cards.innerHTML=branchContents(group||area);
  document.getElementById('home').setAttribute('aria-labelledby',visibleModules.length?'tab-inicio':'areaTitle');
  document.getElementById('home').setAttribute('role',visibleModules.length?'tabpanel':'region');
 }
 for(const module of modules){const panel=document.getElementById('panel-'+module.id);panel.hidden=module.id!==id;
  if(module.id===id&&!frames.has(id)){const frame=document.createElement('iframe');frame.title='Simulador de '+module.title;frame.allowFullscreen=true;frame.src=module.file;frame.id='frame-'+id;frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'lab-visibility',active:active===module.id},'*'));panel.append(frame);frames.set(id,frame);}
 }
 for(const [key,frame] of frames)frame.contentWindow.postMessage({type:'lab-visibility',active:key===id},'*');
 document.title=landing?'Laboratório de Lousa Digital do SENAI':(item?item.title:group?group.title:area?area.title:'Áreas de estudo')+' · SENAI';
 if(location.hash!=='#'+id)location.hash=id;
 if(catalog&&!focus)document.getElementById('areaTitle').focus({preventScroll:true});
 if(landing&&previous)document.getElementById('brandHome').focus({preventScroll:true});
 window.scrollTo({top:0,behavior:'instant'});
}
tabs.addEventListener('click',e=>{const tab=e.target.closest('[data-module]');if(tab)selectModule(tab.dataset.module);});
tabs.addEventListener('keydown',e=>{const list=[...tabs.children].filter(t=>!t.hidden),index=list.indexOf(document.activeElement);let next;if(e.key==='ArrowRight')next=(index+1)%list.length;else if(e.key==='ArrowLeft')next=(index+list.length-1)%list.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=list.length-1;else return;e.preventDefault();selectModule(list[next].dataset.module,true);});
cards.addEventListener('click',e=>{const button=e.target.closest('[data-open]');if(button){e.preventDefault();selectModule(button.dataset.open,true);}});
document.getElementById('brandHome').onclick=()=>selectModule('inicio');
document.getElementById('backAreas').onclick=()=>{const area=areaFor(active)||areas.find(a=>groupsFor(a).some(x=>x.group.id===active));const path=groupPath(area,active);selectModule(path.length?(modules.some(m=>m.id===active)?path.at(-1).id:path.at(-2)?.id||'area-'+area.id):'inicio');};
document.getElementById('emptyBack').onclick=()=>selectModule('inicio');
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1)||'inicio';if(id!==active)selectModule(id);});
window.addEventListener('message',e=>{const entry=[...frames].find(([,frame])=>frame.contentWindow===e.source);if(!entry||!e.data)return;const [id,frame]=entry;
 if(e.data.type==='lab-height'&&Number.isFinite(e.data.height)&&e.data.height>100&&e.data.height<20000)frame.style.height=Math.ceil(e.data.height)+2+'px';
 if(e.data.type==='lab-ready')frame.contentWindow.postMessage({type:'lab-visibility',active:active===id},'*');
});
selectModule(location.hash.slice(1)||'inicio');

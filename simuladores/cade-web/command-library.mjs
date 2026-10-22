/* Biblioteca local de circuitos completos; não compartilha dados com servidores. */
export function initCommandLibrary({storageKey,getProject,validateProject,notify,openProject}){
 const $=id=>document.getElementById(id);let selectedId=null;
 const read=()=>{
  const raw=localStorage.getItem(storageKey);if(raw===null)return [];
  const data=JSON.parse(raw);
  if(!Array.isArray(data)||data.some(e=>!e||typeof e.id!=='string'||typeof e.name!=='string'||typeof e.category!=='string'||!e.project))throw Error('Biblioteca inválida. Os dados existentes foram preservados.');
  return data;
 };
 const status=message=>{$('library-status').textContent=message;};
 function write(items){localStorage.setItem(storageKey,JSON.stringify(items));}
 const clean=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;return b;}
 function render(){
  const list=$('library-list');list.replaceChildren();
  try{
   const all=read(),search=clean($('library-search').value);
   $('library-update').disabled=!all.some(e=>e.id===selectedId);
   $('library-types').replaceChildren(...[...new Set(all.map(e=>e.category))].sort().map(type=>{const o=document.createElement('option');o.value=type;return o;}));
   const items=all.filter(e=>clean(e.name+' '+e.category).includes(search));
   if(!items.length){const p=document.createElement('p');p.textContent=all.length?'Nenhum comando encontrado.':'Sua biblioteca está vazia. Monte um circuito e clique em Adicionar circuito atual.';list.append(p);}
   for(const category of [...new Set(items.map(e=>e.category))].sort((a,b)=>a.localeCompare(b,'pt-BR'))){
    const heading=document.createElement('h3');heading.className='library-group';heading.textContent=category;list.append(heading);
    for(const entry of items.filter(e=>e.category===category)){
     const card=document.createElement('article');card.className='library-entry';card.dataset.selected=String(entry.id===selectedId);
     const title=document.createElement('strong');title.textContent=entry.name;
     const meta=document.createElement('small');meta.textContent=`${entry.project.components?.length||0} componentes · ${entry.project.wires?.length||0} conexões`;
     const actions=document.createElement('div');actions.className='library-entry-actions';
     const open=button('Abrir',async()=>{try{const data=validateProject(JSON.parse(JSON.stringify(entry.project)));if(!await openProject(data))return;selectedId=entry.id;$('library-name').value=entry.name;$('library-category').value=entry.category;render();status('Comando aberto. Edite a folha e use Atualizar selecionado para salvar as mudanças.');}catch(error){status(error.message);}});open.className='library-open';
     const download=button('Baixar JSON',()=>{const blob=new Blob([JSON.stringify(entry.project,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=entry.name.replace(/[^\p{L}\p{N}_-]/gu,'_')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
     const remove=button('Excluir',()=>{if(!window.confirm(`Excluir “${entry.name}” da biblioteca? A folha aberta não será alterada.`))return;try{write(read().filter(e=>e.id!==entry.id));if(selectedId===entry.id)selectedId=null;render();status('Comando removido da biblioteca.');}catch{status('Não foi possível excluir. Os dados foram preservados.');}});
     actions.append(open,download,remove);card.append(title,meta,actions);list.append(card);
    }
   }
  }catch(error){status(error.message||'Não foi possível acessar o armazenamento deste navegador.');$('library-update').disabled=true;}
 }
 function store(update){
  const name=$('library-name').value.trim(),category=$('library-category').value.trim()||'Meus comandos';
  if(!name){status('Digite um nome para o comando.');$('library-name').focus();return;}
  try{
   const project=validateProject(JSON.parse(JSON.stringify(getProject())));
   if(!project.components.length&&!project.drawings?.length){status('Adicione componentes ou desenhos antes de guardar o comando.');return;}
   const items=read(),index=items.findIndex(e=>e.id===selectedId);
   if(update&&index<0){status('Abra um comando da biblioteca antes de atualizá-lo.');return;}
   if(update&&!window.confirm('Atualizar a cópia selecionada com o circuito atual?'))return;
   project.name=name;const entry={id:update?selectedId:crypto.randomUUID(),name,category,project};
   if(update)items[index]=entry;else items.push(entry);
   write(items);selectedId=entry.id;render();status(update?'Comando atualizado.':'Comando adicionado à biblioteca.');notify(update?'Biblioteca atualizada.':'Comando salvo na biblioteca.');
  }catch(error){status('Não foi possível salvar: '+(error.message||'armazenamento indisponível')+'. Baixe o projeto pelo botão Salvar da barra superior.');}
 }
 $('library-save').onclick=()=>store(false);$('library-update').onclick=()=>store(true);$('library-search').oninput=render;
 window.addEventListener('storage',event=>{if(event.key===storageKey||event.key===null)render();});render();
}

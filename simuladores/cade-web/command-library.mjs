export function initCommandLibrary({storageKey,getProject,validateProject,notify,openProject}){
 const $=id=>document.getElementById(id);let items=[],admin=false,csrf='',selected=null,busy=false;
 const status=text=>$('library-status').textContent=text;
 const button=(text,action)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;return b;};
 const reveal=()=>{if($('command-sidebar').hidden)$('toggle-sidebar').click();$('tab-library').click();};
 const menu=document.createElement('details'),summary=document.createElement('summary'),drop=document.createElement('div');summary.textContent='Exemplos de comandos';drop.className='dropdown shared-examples';menu.append(summary,drop);$('native-menu').append(menu);
 menu.addEventListener('toggle',()=>{if(menu.open){document.querySelectorAll('#native-menu details').forEach(d=>{if(d!==menu)d.open=false;});refresh();}});
 const auth=document.createElement('form');auth.className='library-auth';auth.innerHTML='<label>Senha do administrador<input type="password" autocomplete="current-password" required maxlength="200"></label><button type="submit">Entrar para editar</button>';
 const logout=button('Sair da administração',async()=>{try{await request({action:'logout'});admin=false;render();}catch(e){status(e.message);}});
 $('command-library').insertBefore(auth,$('command-library').children[2]);auth.after(logout);
 const fields=[$('library-name').parentElement,$('library-category').parentElement,$('library-save').parentElement];
 const localBox=document.createElement('div');$('library-list').after(localBox);
 $('tab-library').textContent='Exemplos';$('command-library').querySelector('h2').textContent='Exemplos de comandos';$('command-library').querySelector('p').textContent='Biblioteca compartilhada. Todos podem abrir; somente o administrador pode publicar.';
 document.querySelector('.library-note').textContent='Os exemplos são salvos neste servidor e ficam disponíveis em todos os computadores. Alterações na folha só são publicadas pelo administrador.';
 $('library-save').textContent='Publicar circuito atual';
 async function request(body){const res=await fetch('library-api.php',{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});let data;try{data=await res.json();}catch{throw Error('Biblioteca indisponível. Abra pelo servidor PHP.');}if(!res.ok)throw Error(data.error||'Não foi possível acessar a biblioteca.');return data;}
 async function refresh(){try{const data=await request();items=data.items;admin=data.admin;csrf=data.csrf;render();}catch(e){status(e.message);drop.replaceChildren(button('Biblioteca indisponível — tentar novamente',()=>{reveal();refresh();}));}}
 auth.onsubmit=async e=>{e.preventDefault();try{await request({action:'login',password:auth.querySelector('input').value});auth.reset();admin=true;render();status('Administração liberada por 2 horas.');}catch(e){status(e.message);}};
 async function open(entry){try{if(!await openProject(validateProject(structuredClone(entry.project))))return;selected={id:entry.id,revision:entry.revision};$('library-name').value=entry.name;$('library-category').value=entry.category;menu.open=false;render();status('Exemplo aberto.');}catch(e){status(e.message);reveal();}}
 async function mutate(body){if(busy)return;busy=true;try{const data=await request(body);items=data.items;const entry=items.find(e=>e.id===data.id);selected=entry?{id:entry.id,revision:entry.revision}:null;render();status('Biblioteca compartilhada atualizada.');notify('Exemplos atualizados para todos.');}catch(e){status(e.message);}finally{busy=false;}}
 function render(){
  auth.hidden=admin;logout.hidden=!admin;fields.forEach(e=>e.hidden=!admin);$('library-update').disabled=!selected;
  drop.replaceChildren(button('Abrir biblioteca / administrar',()=>{menu.open=false;reveal();}));
  const list=$('library-list');list.replaceChildren();const query=$('library-search').value.toLocaleLowerCase('pt-BR');
  for(const entry of items){drop.append(button(entry.category+' · '+entry.name,()=>open(entry)));if(!(entry.name+' '+entry.category).toLocaleLowerCase('pt-BR').includes(query))continue;
   const card=document.createElement('article');card.className='library-entry';card.dataset.selected=String(selected?.id===entry.id);const title=document.createElement('strong');title.textContent=entry.name;const meta=document.createElement('small');meta.textContent=entry.category;const actions=document.createElement('div');actions.className='library-entry-actions';actions.append(button('Abrir',()=>open(entry)));
   if(admin)actions.append(button('Excluir',()=>{if(confirm('Excluir “'+entry.name+'” para todos?'))mutate({action:'delete',id:entry.id,revision:entry.revision});}));card.append(title,meta,actions);list.append(card);
  }
  if(!items.length){const p=document.createElement('p');p.textContent='Nenhum exemplo publicado ainda.';list.append(p);}
  $('library-types').replaceChildren(...[...new Set(items.map(e=>e.category))].map(c=>{const o=document.createElement('option');o.value=c;return o;}));
  localBox.replaceChildren();if(admin){try{const old=JSON.parse(localStorage.getItem(storageKey)||'[]');if(old.length){const heading=document.createElement('h3');heading.textContent='Comandos antigos deste navegador';localBox.append(heading);for(const entry of old)localBox.append(button('Publicar: '+entry.name,()=>{try{const project=validateProject(structuredClone(entry.project));if(confirm('Publicar “'+entry.name+'” para todos?'))mutate({action:'save',name:entry.name,category:entry.category,project});}catch(e){status(e.message);}}));}}catch{status('Não foi possível ler os comandos antigos deste navegador.');}}
 }
 function save(update){try{const name=$('library-name').value.trim();if(!name)throw Error('Digite o nome do comando.');const project=validateProject(structuredClone(getProject()));project.name=name;if(update&&!selected)throw Error('Abra um exemplo antes de atualizar.');if(!confirm(update?'Publicar as alterações deste exemplo para todos?':'Publicar este circuito para todos?'))return;mutate({action:'save',...(update?selected:{}),name,category:$('library-category').value.trim()||'Comandos',project});}catch(e){status(e.message);}}
 $('library-save').onclick=()=>save(false);$('library-update').onclick=()=>save(true);$('library-search').oninput=render;
 $('tab-library').addEventListener('click',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(()=>{if(!document.hidden&&!busy)refresh();},60000);render();refresh();
}

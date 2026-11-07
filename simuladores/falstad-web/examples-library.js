(() => {
  let sim, csrf='', admin=false, items=[];
  const dialog=document.createElement('dialog');
  dialog.id='lab-examples';
  dialog.innerHTML=`<header><h2>Exemplos da turma</h2><button type="button" data-close aria-label="Fechar">✕</button></header>
    <p>Projetos compartilhados com todos. Use a senha do CAD para administrar.</p>
    <p role="status" data-status></p>
    <form data-login><label>Senha do desenvolvedor <input type="password" autocomplete="current-password" required></label><button>Entrar</button></form>
    <section data-admin hidden><form data-save><label>Nome do projeto <input name="name" maxlength="100" required></label><label>Categoria <input name="category" maxlength="60" value="Eletrônica"></label><button>Salvar circuito atual como novo exemplo</button></form><button type="button" data-logout>Sair do acesso de desenvolvedor</button></section>
    <button type="button" data-refresh>Atualizar lista</button><div data-list></div>`;
  const $=s=>dialog.querySelector(s);
  function status(message){$('[data-status]').textContent=message;}
  async function api(payload){
    const response=await fetch('library-api.php',{method:payload?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:payload?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:payload?JSON.stringify(payload):undefined});
    let data;try{data=await response.json();}catch{throw Error('Biblioteca indisponível. Abra o site pelo servidor PHP.');}
    if(!response.ok)throw Error(data.error||'Não foi possível acessar os exemplos.');
    return data;
  }
  async function run(task){
    if(dialog.dataset.busy)return;
    dialog.dataset.busy='true';dialog.setAttribute('aria-busy','true');
    try{await task();}catch(error){status(error.message);}finally{delete dialog.dataset.busy;dialog.removeAttribute('aria-busy');}
  }
  function render(){
    $('[data-login]').hidden=admin;$('[data-admin]').hidden=!admin;
    const list=$('[data-list]');list.replaceChildren();
    if(!items.length){const p=document.createElement('p');p.textContent='Nenhum exemplo publicado ainda.';list.append(p);}
    for(const item of items){
      const row=document.createElement('article'),title=document.createElement('strong'),category=document.createElement('small');
      title.textContent=item.name;category.textContent=item.category;row.append(title,category);
      const button=(label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>run(action);row.append(b);};
      button('Abrir',async()=>{
        if(!confirm('Abrir este exemplo substituirá o circuito na tela. Continuar?'))return;
        if(window.labMega)window.labMega.restore(item.project);
        else if(typeof item.project==='string')sim.importCircuit(item.project,false);
        else throw Error('Aguarde o painel Arduino Mega carregar e tente novamente.');
        dialog.close();
      });
      if(admin){
        button('Substituir pelo circuito atual',async()=>{
          if(!confirm(`Substituir o exemplo “${item.name}” pelo circuito atual?`))return;
          const result=await api({action:'save',id:item.id,revision:item.revision,name:item.name,category:item.category,project:window.labMega?.snapshot()??sim.exportCircuit()});
          items=result.items;render();status('Exemplo atualizado para todos.');
        });
        button('Excluir',async()=>{
          if(!confirm(`Excluir o exemplo “${item.name}” da biblioteca compartilhada?`))return;
          const result=await api({action:'delete',id:item.id,revision:item.revision});items=result.items;render();status('Exemplo excluído.');
        });
      }
      list.append(row);
    }
  }
  async function refresh(){const result=await api();csrf=result.csrf;admin=result.admin;items=result.items;render();status('');}
  $('[data-close]').onclick=()=>dialog.close();
  $('[data-refresh]').onclick=()=>run(refresh);
  $('[data-login]').onsubmit=event=>{event.preventDefault();run(async()=>{await api({action:'login',password:$('[data-login] input').value});$('[data-login]').reset();await refresh();status('Acesso de desenvolvedor liberado.');});};
  $('[data-logout]').onclick=()=>run(async()=>{await api({action:'logout'});await refresh();});
  $('[data-save]').onsubmit=event=>{event.preventDefault();run(async()=>{
    const form=$('[data-save]');const result=await api({action:'save',name:form.elements.name.value,category:form.elements.category.value,project:window.labMega?.snapshot()??sim.exportCircuit()});
    items=result.items;form.elements.name.value='';render();status('Exemplo salvo e disponível para todos.');
  });};
  window.installFalstadExamples=simulator=>{
    if(sim)return;sim=simulator;document.body.append(dialog);
    const button=document.createElement('button');button.type='button';button.textContent='Exemplos da turma';button.className='lab-examples-button';
    button.onclick=()=>{dialog.showModal();run(refresh);};
    const row=document.querySelector('.gwt-MenuBar-horizontal tr');
    if(row){const cell=document.createElement('td');cell.append(button);row.append(cell);}else{document.body.append(button);button.classList.add('lab-examples-floating');}
  };
})();

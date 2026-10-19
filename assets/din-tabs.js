/* Subabas do mesmo equipamento. Conservam os modelos e propagam a pausa
   quando o usuário muda de subaba ou sai do disjuntor DIN no portal. */
(()=>{
 const buttons=[...document.querySelectorAll('[data-din-tab]')];
 const mechanism=document.getElementById('din-mechanism-panel'),curves=document.getElementById('din-curves-panel');
 const badge=document.querySelector('header .badge'),originalBadge=badge.textContent;
 let selected='mechanism',parentActive=window.labActive,child=null;
 function sync(){window.labActive=parentActive&&selected==='mechanism';if(child)child.contentWindow.postMessage({type:'lab-visibility',active:parentActive&&selected==='curves'},'*');publishHeight()}
 function choose(id,focus=false){selected=id;mechanism.hidden=id!=='mechanism';curves.hidden=id!=='curves';buttons.forEach(b=>{const on=b.dataset.dinTab===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus()});badge.textContent=id==='curves'?'Comparação B · C · D · Iₙ ajustável':originalBadge;
  if(id==='curves'&&!child){child=document.createElement('iframe');child.id='din-curves-frame';child.title='Curvas B, C e D do disjuntor monopolar';child.src='curvas.php';child.onload=sync;curves.append(child)}sync();
 }
 buttons.forEach(b=>b.onclick=()=>choose(b.dataset.dinTab));
 document.querySelector('.din-tabs').onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();choose(e.key==='Home'?'mechanism':e.key==='End'?'curves':selected==='mechanism'?'curves':'mechanism',true)};
 window.addEventListener('lab-visibility-change',e=>{parentActive=e.detail.active;sync()});
 window.addEventListener('message',e=>{if(!child||e.source!==child.contentWindow||!e.data)return;if(e.data.type==='lab-ready')sync();if(e.data.type==='lab-height'&&Number.isFinite(e.data.height)&&e.data.height>100&&e.data.height<20000){child.style.height=Math.ceil(e.data.height)+2+'px';publishHeight()}});
 choose('mechanism');
})();

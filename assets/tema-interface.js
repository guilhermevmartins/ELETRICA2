/* Preferência de aparência: escuro por padrão, persistência local e sincronização dos módulos. */
(() => {
 const key='senai-lousa-theme';
 let theme='dark';
 try{if(localStorage.getItem(key)==='light')theme='light';}catch{}
 document.documentElement.dataset.theme=theme;
 function apply(value,save=false){
  theme=value==='light'?'light':'dark';
  document.documentElement.dataset.theme=theme;
  if(save){try{localStorage.setItem(key,theme);}catch{}}
  const button=document.getElementById('themeToggle');
  if(button){button.textContent=theme==='dark'?'☀ Tema claro':'☾ Tema escuro';button.setAttribute('aria-label',theme==='dark'?'Ativar tema claro':'Ativar tema escuro');button.setAttribute('aria-pressed',String(theme==='light'));}
  document.querySelectorAll('iframe').forEach(frame=>frame.contentWindow?.postMessage({type:'senai-theme',theme},'*'));
 }
 window.addEventListener('message',event=>{
  if(event.source===window.parent&&event.data?.type==='senai-theme')apply(event.data.theme);
  if(event.data?.type==='senai-theme-ready'&&[...document.querySelectorAll('iframe')].some(frame=>frame.contentWindow===event.source))event.source.postMessage({type:'senai-theme',theme},'*');
 });
 window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue);});
 document.addEventListener('DOMContentLoaded',()=>{
  let button=document.getElementById('themeToggle');
  if(!button&&window.parent===window){const banner=document.querySelector('.senai-module-banner');if(banner){button=document.createElement('button');button.id='themeToggle';button.type='button';button.className='theme-toggle';banner.append(button);}}
  if(button)button.addEventListener('click',()=>apply(theme==='dark'?'light':'dark',true));
  apply(theme);
  if(window.parent!==window)window.parent.postMessage({type:'senai-theme-ready'},'*');
 });
})();

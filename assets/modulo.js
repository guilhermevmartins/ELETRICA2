/* Ponte de navegação local: mantém o estado e congela ensaios fora da aba ativa.
   postMessage também funciona ao abrir index.html por file://, sem servidor. */
window.labActive = window.parent === window;
function publishHeight(){if(parent!==window)parent.postMessage({type:'lab-height',height:Math.ceil(document.body.getBoundingClientRect().height)},'*')}
window.addEventListener('message',event=>{
  if(event.source!==parent || !event.data || event.data.type!=='lab-visibility')return;
  window.labActive=!!event.data.active;
  window.dispatchEvent(new CustomEvent('lab-visibility-change',{detail:{active:window.labActive}}));
  if(window.labActive)publishHeight();
});
window.addEventListener('load',()=>{
  if(parent!==window){parent.postMessage({type:'lab-ready'},'*');new ResizeObserver(publishHeight).observe(document.body);publishHeight()}
});
window.addEventListener('resize',publishHeight);

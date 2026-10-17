/* SVG viewBox mantém proporção e acompanha automaticamente a largura do painel.
   O modo de detalhe usa a largura natural, com rolagem apenas dentro do diagrama. */
(()=>{'use strict';
const svg=document.getElementById('circuit'),button=document.getElementById('diagramZoom'),viewport=svg.closest('.diagram-scroll');
function measure(){viewport.style.setProperty('--diagram-natural-width',svg.viewBox.baseVal.width+'px')}
measure();new MutationObserver(measure).observe(svg,{attributes:true,attributeFilter:['viewBox']});
button.onclick=()=>{const zoom=viewport.classList.toggle('diagram-zoomed');button.setAttribute('aria-pressed',zoom);button.textContent=zoom?'Ajustar à tela':'Ampliar diagrama';if(!zoom)viewport.scrollTo({left:0,top:0,behavior:'instant'})};
})();

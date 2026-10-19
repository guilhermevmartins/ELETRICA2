/* Ferramentas de leitura apenas no celular. Sem clonar desenhos ou alterar o modelo físico. */
(() => {
 'use strict';
 const media=matchMedia('(max-width:700px), (max-width:1100px) and (hover:none) and (pointer:coarse)'),mounted=new Map();let pending=0,caliperPaint=null;
 const ignore=new Set(['caliper','circuit','motorScene','partLeaderLines']);
 function mount(target){
  if(mounted.has(target)||target.closest('.mobile-diagram-viewport'))return;
  const parent=target.parentNode,next=target.nextSibling,originalStyle=target.getAttribute('style');
  const tools=document.createElement('div');tools.className='mobile-diagram-tools';
  tools.innerHTML='<button type="button" aria-pressed="true">Ajustar à tela</button><button type="button" aria-pressed="false">＋ Ampliar desenho</button><small>Veja o conjunto ou amplie para ler os detalhes.</small>';
  const viewport=document.createElement('div');viewport.className='mobile-diagram-viewport';viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Desenho interativo; quando ampliado, deslize para explorar');viewport.tabIndex=0;
  parent.insertBefore(tools,target);parent.insertBefore(viewport,target);viewport.append(target);target.classList.add('mobile-diagram-target');
  let enlarged=false;
  const existingZoom=target.id==='machine'?document.getElementById('zoom'):null;
  const existingState=existingZoom?{click:existingZoom.onclick,text:existingZoom.textContent,pressed:existingZoom.getAttribute('aria-pressed')}:null;
  const buttons=tools.querySelectorAll('button'),hint=tools.querySelector('small');
  function size(){
   const natural=target.viewBox?.baseVal?.width||Number(target.getAttribute('width'))||900;
   target.style.setProperty('width',enlarged?Math.max(viewport.clientWidth*1.8,Math.min(1100,Math.max(650,natural)))+'px':'100%','important');
   target.style.setProperty('min-width','0','important');
   if(target.tagName.toLowerCase()==='canvas'){const w=Number(target.getAttribute('width')),h=Number(target.getAttribute('height'));if(w&&h)target.style.aspectRatio=w+'/'+h;}
   viewport.classList.toggle('is-enlarged',enlarged);buttons[0].setAttribute('aria-pressed',String(!enlarged));buttons[1].setAttribute('aria-pressed',String(enlarged));
   hint.textContent=enlarged?'Deslize para os lados e para baixo para explorar o desenho.':'Veja o conjunto ou amplie para ler os detalhes.';
   if(existingZoom){existingZoom.setAttribute('aria-pressed',String(enlarged));existingZoom.textContent=enlarged?'− Ajustar à tela':'＋ Ampliar desenho';}
   if(!enlarged)viewport.scrollTo(0,0);
  }
  buttons[0].onclick=()=>{enlarged=false;size()};buttons[1].onclick=()=>{enlarged=true;size()};
  if(existingZoom)existingZoom.onclick=()=>{enlarged=!enlarged;size()};
  mounted.set(target,{size,remove(){parent.insertBefore(target,next?.parentNode===parent?next:viewport);viewport.remove();tools.remove();target.classList.remove('mobile-diagram-target');if(originalStyle===null)target.removeAttribute('style');else target.setAttribute('style',originalStyle);if(existingZoom){existingZoom.onclick=existingState.click;existingZoom.textContent=existingState.text;existingZoom.setAttribute('aria-pressed',existingState.pressed)}}});size();
 }
 // Canvas de apresentação preserva as cores até em navegadores que ignoram color-scheme.
 // O SVG original continua recebendo toque, arraste, teclado e fornecendo sua descrição acessível.
 function protectCaliper(svg){
  const originalStyle=svg.getAttribute('style'),canvas=document.createElement('canvas');canvas.className='mobile-caliper-paint';canvas.setAttribute('aria-hidden','true');svg.after(canvas);
  let frame=0,busy=false,again=false,removed=false;
  function schedulePaint(){if(removed)return;if(busy){again=true;return}if(!frame)frame=requestAnimationFrame(paint)}
  function paint(){frame=0;if(removed||!media.matches)return;busy=true;again=false;
   const width=svg.clientWidth,height=svg.clientHeight,clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',width);clone.setAttribute('height',height);clone.style.cssText='width:'+width+'px;height:'+height+'px;opacity:1';clone.querySelectorAll('text').forEach(t=>t.style.fontFamily="'Segoe UI',sans-serif");
   const img=new Image();img.onload=()=>{busy=false;if(removed)return;const scale=Math.min(devicePixelRatio||1,3);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);canvas.style.width=width+'px';canvas.style.height=height+'px';const rect=svg.getBoundingClientRect(),parent=svg.parentElement.getBoundingClientRect();canvas.style.top=(rect.top-parent.top)+'px';canvas.style.left=(rect.left-parent.left)+'px';const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#f5f8fa';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);svg.style.opacity='0';if(again)schedulePaint()};img.onerror=()=>{busy=false;if(!removed){canvas.hidden=true;svg.style.opacity='1'}};
   img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(clone));
  }
  const observer=new MutationObserver(schedulePaint);observer.observe(svg,{subtree:true,childList:true,attributes:true,attributeFilter:['viewBox']});schedulePaint();
  return {size:schedulePaint,remove(){removed=true;observer.disconnect();cancelAnimationFrame(frame);canvas.remove();if(originalStyle===null)svg.removeAttribute('style');else svg.setAttribute('style',originalStyle)}};
 }
 function refresh(){pending=0;if(!media.matches){for(const entry of mounted.values())entry.remove();mounted.clear();caliperPaint?.remove();caliperPaint=null;document.querySelector('.mobile-view-tip')?.remove();return;}
  const motor=document.querySelector('#motorViewport')?.closest('#stage');if(motor)mount(motor);
  for(const target of document.querySelectorAll('svg[id],canvas[id]')){
   if(ignore.has(target.id)||target.closest('#motorViewport,.motor-labels')||target.closest('foreignObject'))continue;
   const rect=target.getBoundingClientRect();if(rect.width>150&&rect.height>70&&!target.closest('[hidden]'))mount(target);
  }
  for(const [target,entry] of mounted)if(target.isConnected)entry.size();else mounted.delete(target);
  const stage=document.querySelector('.caliper-lab #stage');if(stage){if(!caliperPaint)caliperPaint=protectCaliper(document.getElementById('caliper'));else caliperPaint.size();if(!document.querySelector('.mobile-view-tip')){const tip=document.createElement('p');tip.className='mobile-view-tip';tip.textContent='Para ler os traços, toque em Lupa do nônio. Use + e − para ajustar uma divisão por vez.';stage.after(tip)}}
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(refresh)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
 document.addEventListener('click',schedule);window.addEventListener('resize',schedule);media.addEventListener('change',schedule);
})();

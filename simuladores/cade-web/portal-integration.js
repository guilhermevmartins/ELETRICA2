/* Integração com as abas do laboratório, sem substituir o projeto aberto. */
window.labActive = parent === window;
let expanded = false;
let expandedHost = null;
function setExpanded(value) {
  expanded = value;
  const button = document.getElementById('lab-fullscreen');
  // Expansão por CSS: o Esc permanece disponível para cancelar ferramentas.
  if (parent !== window) {
    try {
      const host = parent.document;
      if (!host.getElementById('cade-expanded-style')) {
        const style = host.createElement('style');
        style.id = 'cade-expanded-style';
        style.textContent = 'html.cade-expanded-host,html.cade-expanded-host body{overflow:hidden!important} iframe.cade-expanded-frame{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;z-index:2147483647!important;background:#fff}';
        host.head.append(style);
      }
      window.frameElement.classList.toggle('cade-expanded-frame', expanded);
      host.documentElement.classList.toggle('cade-expanded-host', expanded);
      expandedHost = host;
    } catch {
      expanded = false;
      button.textContent = 'Abra o CAD diretamente para expandir';
      return;
    }
  }
  button.textContent = expanded ? 'Sair da tela cheia' : 'Tela cheia';
  button.setAttribute('aria-pressed', String(expanded));
  button.title = 'Expandir o CAD na janela. Esc continua cancelando comandos.';
  window.dispatchEvent(new Event('resize'));
}
window.addEventListener('pagehide', () => {
  expandedHost?.documentElement.classList.remove('cade-expanded-host');
  window.frameElement?.classList.remove('cade-expanded-frame');
});
function publishSize() {
  if (parent === window) return;
  let height = 780;
  try { height = Math.max(600, parent.innerHeight - 160); } catch {}
  parent.postMessage({type: 'lab-height', height}, '*');
}
window.addEventListener('message', event => {
  if (event.source !== parent || event.data?.type !== 'lab-visibility') return;
  window.labActive = !!event.data.active;
  if (!window.labActive && expanded) setExpanded(false);
  if (window.labActive) publishSize();
});
window.addEventListener('resize', publishSize);
window.addEventListener('load', () => {
  if (parent !== window) parent.postMessage({type: 'lab-ready'}, '*');
  publishSize();
  const button = document.getElementById('lab-fullscreen');
  button.setAttribute('aria-pressed', 'false');
  button.title = 'Expandir o CAD na janela. Esc continua cancelando comandos.';
  button.addEventListener('click', () => setExpanded(!expanded));
});

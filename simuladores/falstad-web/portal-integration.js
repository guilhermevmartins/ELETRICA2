// Mantém o circuito aberto e pausa a simulação ao trocar de aba no portal.
(() => {
  let active = parent === window;
  let resume = true;
  let sim;
  let expanded = false;
  let expandedHost;
  let fullscreenButton;
  function updateFullscreenButton() {
    if (!fullscreenButton) return;
    fullscreenButton.textContent = expanded ? 'Sair da tela cheia' : 'Tela cheia';
    fullscreenButton.setAttribute('aria-pressed', String(expanded));
  }
  async function setExpanded(value) {
    if (parent === window) {
      try {
        if (value) await document.documentElement.requestFullscreen();
        else if (document.fullscreenElement) await document.exitFullscreen();
      } catch { fullscreenButton.title = 'O navegador não permitiu a tela cheia.'; }
      return;
    }
    try {
      const host = parent.document;
      if (!host.getElementById('falstad-expanded-style')) {
        const style = host.createElement('style');
        style.id = 'falstad-expanded-style';
        style.textContent = 'html.falstad-expanded-host,html.falstad-expanded-host body{overflow:hidden!important}iframe.falstad-expanded-frame{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;z-index:2147483647!important;background:#fff}';
        host.head.append(style);
      }
      expanded = value;
      expandedHost = host;
      window.frameElement.classList.toggle('falstad-expanded-frame', expanded);
      host.documentElement.classList.toggle('falstad-expanded-host', expanded);
      updateFullscreenButton();
      window.dispatchEvent(new Event('resize'));
    } catch { fullscreenButton.title = 'Abra o Falstad diretamente para usar tela cheia.'; }
  }
  document.addEventListener('fullscreenchange', () => {
    if (parent !== window) return;
    expanded = !!document.fullscreenElement;
    updateFullscreenButton();
    window.dispatchEvent(new Event('resize'));
  });
  window.addEventListener('pagehide', () => {
    expandedHost?.documentElement.classList.remove('falstad-expanded-host');
    window.frameElement?.classList.remove('falstad-expanded-frame');
  });
  const publishSize = () => {
    if (parent === window) return;
    let height = 760;
    try { height = Math.max(560, parent.innerHeight - 160); } catch {}
    parent.postMessage({type:'lab-height', height}, location.origin);
  };
  window.oncircuitjsloaded = () => {
    const tools = document.querySelector('.cirjsicon-ccw')?.closest('table');
    tools?.classList.add('lab-tools');
    tools?.parentElement?.classList.add('lab-toolstrip');
    document.querySelector('#painel')?.parentElement?.classList.add('lab-side');
    sim = window.CircuitJS1;
    window.installFalstadExamples?.(sim);
    import('./mega/mega-panel.mjs?v=1').then(({installMega}) => installMega(sim)).catch(error => console.error('Arduino Mega:', error));
    if (!fullscreenButton) {
      fullscreenButton = document.createElement('button');
      fullscreenButton.id = 'lab-fullscreen';
      fullscreenButton.type = 'button';
      fullscreenButton.className = 'lab-examples-button';
      fullscreenButton.title = 'Expandir o simulador sem fechar o circuito';
      fullscreenButton.onclick = () => setExpanded(!expanded);
      updateFullscreenButton();
      const row = document.querySelector('.gwt-MenuBar-horizontal tr');
      if (row) { const cell = document.createElement('td'); cell.append(fullscreenButton); row.append(cell); }
      else { document.body.append(fullscreenButton); fullscreenButton.classList.add('lab-fullscreen-floating'); }
    }
    resume = sim.isRunning();
    if (!active) sim.setSimRunning(false);
  };
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'lab-visibility') return;
    const next = !!event.data.active;
    if (sim && next !== active) {
      if (!next) { resume = sim.isRunning(); sim.setSimRunning(false); }
      else sim.setSimRunning(resume);
    }
    active = next;
    if (!active && expanded) setExpanded(false);
    if (active) publishSize();
  });
  window.addEventListener('load', () => {
    if (parent !== window) parent.postMessage({type:'lab-ready'}, location.origin);
    publishSize();
  });
  window.addEventListener('resize', publishSize);
})();

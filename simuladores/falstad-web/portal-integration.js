// Mantém o circuito aberto e pausa a simulação ao trocar de aba no portal.
(() => {
  let active = parent === window;
  let resume = true;
  let sim;
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
    if (active) publishSize();
  });
  window.addEventListener('load', () => {
    if (parent !== window) parent.postMessage({type:'lab-ready'}, location.origin);
    publishSize();
  });
  window.addEventListener('resize', publishSize);
})();

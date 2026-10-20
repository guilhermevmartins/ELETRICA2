/* Integração com as abas do laboratório, sem substituir o projeto aberto. */
window.labActive = parent === window;
function publishSize() {
  if (parent === window) return;
  let height = 780;
  try { height = Math.max(600, parent.innerHeight - 160); } catch {}
  parent.postMessage({type: 'lab-height', height}, '*');
}
window.addEventListener('message', event => {
  if (event.source !== parent || event.data?.type !== 'lab-visibility') return;
  window.labActive = !!event.data.active;
  if (window.labActive) publishSize();
});
window.addEventListener('resize', publishSize);
window.addEventListener('load', () => {
  if (parent !== window) parent.postMessage({type: 'lab-ready'}, '*');
  publishSize();
  const button = document.getElementById('lab-fullscreen');
  if (!document.fullscreenEnabled) button.hidden = true;
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { button.textContent = 'Tela cheia indisponível'; }
  });
  document.addEventListener('fullscreenchange', () => {
    button.textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia';
  });
});

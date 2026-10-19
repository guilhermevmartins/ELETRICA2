/* Cabeçalho para abertura direta dos simuladores; o portal já fornece sua marca. */
(() => {
 const embedded=window.parent!==window;
 document.documentElement.classList.toggle('senai-embedded',embedded);
 document.body.classList.add('senai-module');
 const banner=document.createElement('div');
 banner.className='senai-module-banner';
 banner.innerHTML='<a href="../index.php" aria-label="SENAI: voltar às áreas de estudo"><img src="../assets/images/SENAI_S%C3%A3o_Paulo_logo.png" alt="SENAI São Paulo" width="160" height="41"></a><div><strong>Laboratório de Lousa Digital</strong><span>SENAI São Paulo · Elétrica e automação</span><span class="module-author">Desenvolvido por: Guilherme Vicente Martins</span></div>';
 document.body.prepend(banner);
 if(!document.title.includes('SENAI'))document.title+=' · SENAI';
})();

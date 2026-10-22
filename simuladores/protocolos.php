<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redes e protocolos industriais · SENAI</title><script src="../assets/tema-interface.js"></script>
<link rel="stylesheet" href="../assets/base.css"><link rel="stylesheet" href="../assets/senai.css"><link rel="stylesheet" href="../assets/protocolos.css?v=<?= filemtime(__DIR__.'/../assets/protocolos.css') ?>">
<script defer src="../assets/modulo.js"></script><script defer src="../assets/senai.js"></script><script defer src="../assets/protocolos-dados.js?v=<?= filemtime(__DIR__.'/../assets/protocolos-dados.js') ?>"></script><script defer src="../assets/protocolos.js?v=<?= filemtime(__DIR__.'/../assets/protocolos.js') ?>"></script></head>
<body><header><div><span class="eyebrow">AUTOMAÇÃO / COMUNICAÇÃO INDUSTRIAL</span><h1>Uma fábrica. Muitas conversas.</h1><p>Descubra quem conversa com quem, por onde o dado passa e qual é o papel de cada equipamento.</p></div><span class="badge">REDES EM MOVIMENTO</span></header>
<main class="network-main">
<section class="network-intro"><strong>Antes de conectar: meio, rede e protocolo são coisas diferentes.</strong><p>RS-485 define características elétricas. Ethernet define tecnologias de rede nas camadas física e de enlace. Modbus TCP, PROFINET e EtherNet/IP definem formas de comunicação industrial. Um conector parecido não garante compatibilidade.</p></section>
<nav id="protocolPicker" class="protocol-picker" aria-label="Escolher tecnologia de comunicação"></nav>
<section class="network-workbench card">
<div class="network-head"><div><span id="family" class="eyebrow"></span><h2 id="protocolTitle"></h2><p id="summary"></p></div><span id="topology" class="network-tag"></span></div>
<div class="network-facts" id="facts"></div>
<div class="network-scroll"><div class="network-stage" id="stage"><svg id="networkLines" viewBox="0 0 960 410" aria-hidden="true"></svg><div id="networkNodes"></div><span id="stageCaption" class="stage-caption"></span></div></div>
<div class="network-toolbar"><button type="button" id="play">Reproduzir troca de dados</button><button type="button" id="next">Próxima etapa</button><button type="button" id="restart">Reiniciar</button><span>Tempo ampliado para aula · não representa velocidade real</span></div>
<div class="network-step" aria-live="polite"><span id="stepCount"></span><div><h3 id="stepTitle"></h3><p id="stepText"></p></div></div>
<div id="stepDots" class="step-dots" aria-label="Etapas da comunicação"></div>
</section>
<div class="network-details"><section class="card"><span class="eyebrow">TOQUE EM UM EQUIPAMENTO NO DESENHO</span><h2 id="nodeTitle"></h2><p id="nodeDescription"></p></section><section class="card"><h2>Onde usar?</h2><p id="application"></p><h3>Não confunda</h3><p id="caution"></p></section></div>
<section class="card"><div class="network-head"><div><span class="eyebrow">DA FIAÇÃO AO DADO</span><h2>Compare as arquiteturas</h2></div></div><div class="comparison-scroll"><table><caption>Exemplos típicos: cada tecnologia pode permitir outras topologias e recursos.</caption><thead><tr><th>Tecnologia</th><th>Meio / base</th><th>Organização mostrada</th><th>Como conversa</th></tr></thead><tbody id="comparison"></tbody></table></div></section>
<section class="card"><span class="eyebrow">DESAFIO PARA A TURMA</span><h2 id="quizQuestion"></h2><div id="quizChoices" class="quiz-choices"></div><p id="quizFeedback" aria-live="polite"></p><button type="button" id="quizNext">Outro desafio</button></section>
<details class="card"><summary>Glossário e referências</summary><p><b>CLP:</b> controlador lógico programável. <b>IHM:</b> interface homem-máquina. <b>E/S:</b> entradas e saídas. <b>Switch:</b> encaminha quadros Ethernet. <b>Gateway:</b> interliga redes e pode converter protocolos. <b>Broker:</b> recebe e distribui mensagens por tópicos. <b>Topologia:</b> forma de organizar as conexões.</p><p>Diagramas e mensagens ilustrativos. Não são ferramentas de configuração nem simulam tempos, segurança, todas as camadas ou todas as falhas de uma rede real.</p><ul id="references"></ul></details>
</main><footer class="foot">SENAI · Laboratório de Lousa Digital · Redes e protocolos industriais</footer></body></html>

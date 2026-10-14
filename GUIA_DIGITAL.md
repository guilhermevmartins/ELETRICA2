# Eletrônica digital

Abra `index.html`, entre em **Eletrônica digital** e abra **Do bit à memória**. Tudo funciona localmente, sem instalação nem conexão. A navegação do portal preserva a experiência e interrompe o clock automático ao sair. O clock também para ao trocar de etapa ou ocultar a página; a retomada é manual.

## Trilha

1. **Fundamentos:** quatro bits com pesos, conversão simultânea entre binário, decimal e hexadecimal, distinção entre lógica combinacional e sequencial.
2. **Portas:** BUFFER, NOT, AND, OR, NAND, NOR, XOR e XNOR, símbolos, entradas acionáveis, indicação numérica/colorida da saída e tabela-verdade aplicável por linha.
3. **Álgebra:** duas leis de De Morgan, absorção, expansão de XOR e mapa de Karnaugh de duas variáveis com simplificação para as 16 funções possíveis. Introdução à universalidade de NAND e NOR.
4. **Combinacionais:** meio somador, somador completo, MUX 2:1, DEMUX 1:2, decodificador 2:4, codificador com prioridade D3 > D2 > D1 > D0 e sinal válido, comparador de duas palavras de dois bits e display BCD.
5. **Memória:** latch SR com NOR e entradas ativas em 1, latch D com habilitação, flip-flops D, JK e T. Controles separados para subir e descer o clock, pulso completo e clock automático. Histórico e diagrama temporal de eventos.
6. **Sistemas:** contador síncrono módulo 16, registrador de deslocamento de quatro bits e exemplo de máquina de estados de Moore. Todos têm habilitação. A entrada serial entra em Q0; o Q3 anterior é descartado.
7. **Desafios:** oito perguntas com feedback explicativo.

## Convenções didáticas

- Os valores são lógicos ideais; não são uma simulação elétrica de uma família de circuitos integrados.
- Os flip-flops simulados capturam na borda de subida. Alterações das entradas durante nível alto e bordas de descida não alteram Q.
- O reset da interface inicializa Q em zero para a aula. Não representa uma entrada física. Preset/clear, setup/hold, atrasos, metastabilidade e repique são explicados, mas não simulados.
- No latch SR NOR, S=R=1 impõe Q=Q̅=0 e é proibido. Ao liberar simultaneamente para 00, o modelo marca Q como desconhecido (X), até uma entrada definir o estado.
- O display apaga códigos de 10 a 15; esse comportamento é uma escolha do modelo, não uma regra universal de decodificadores BCD.
- O semáforo é um exemplo de sequência sem tempos de trânsito ou projeto de controle real.
- O histórico usa eventos, não segundos. Cores são acompanhadas por números e legendas.

## Verificação

`node verificacao/testar-digital-logica.cjs` verifica a lógica sem navegador. `node verificacao/testar-digital.cjs` usa Playwright/Edge da instalação local para conferir os controles, navegação, estados, acessibilidade por teclado e layout móvel. Os scripts guardam capturas em `verificacao/`.

Fontes técnicas estão no rodapé do módulo: catálogo de lógica da Texas Instruments e folha de dados do SN74HC74 como referência de flip-flop D de borda de subida. Os desenhos são vetoriais originais do projeto.

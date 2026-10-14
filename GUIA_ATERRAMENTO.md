# Aterramento — roteiro de exploração

Abra `index.html` → **Instalação predial** → **Aterramento · TT, TN e IT**. O endereço `index.html#aterramento` abre diretamente o módulo.

## Proposta de aula

1. Comece por TT e acompanhe a leitura numerada ao lado do desenho.
2. Selecione **Ver falta na carcaça**. Peça aos alunos que descrevam todo o percurso de volta à fonte.
3. Alterne para TN-S e identifique o que mudou no trajeto de proteção.
4. Compare TN-C e TN-C-S, observando PEN, N, PE e o ponto de separação.
5. Em IT, compare fonte isolada e ligação por alta impedância. Discuta a indicação do DSI e a necessidade de localizar a primeira falta.
6. Use as explicações dos componentes, a tabela comparativa e as cinco perguntas com feedback.

## Referências e recorte

O material fornecido `00_Definicao_Tipos_Aterramento.pptx` orientou a sequência didática: fonte, massas, condutores, nomenclatura e caminho da falta. Os desenhos do site são SVG originais; não são reproduções das figuras da norma.

Base adotada: ABNT NBR 5410:2004, versão corrigida 2008; itens 4.2.2.2, 5.1.2.2.4 e 6.4. As fontes de consulta estão no rodapé do módulo, incluindo o material original e o guia da Schneider Electric. A data identifica a edição utilizada, sem afirmar a vigência de qualquer revisão posterior.

O explorador ilustra conexões e percursos. Não calcula corrente, resistência de aterramento, tensão de contato, tempo de disparo ou conformidade de uma instalação. A representação omite detalhes construtivos e outras fases. O percurso de falta aparece antes da interrupção; no IT, o primeiro defeito é apresentado de forma qualitativa. As condições reais de proteção dependem do projeto e das verificações normativas.

## Arquivos e verificação

- `simuladores/aterramento.html`: aula, estrutura acessível e referências.
- `assets/aterramento.js`: troca de esquema, explicações, variantes IT e questionário.
- `assets/aterramento-cena.js`: cena vetorial com cinco elementos identificados: fonte/transformador no poste da rede, poste da rede, padrão de medição em suporte próprio, quadro de distribuição separado e massa do equipamento. A haste destacada foi posicionada junto ao padrão de entrada: ligada ao N no TT, ao PEN nos trechos TN-C e TN-C-S e ao PE no TN-S, preservando a separação N–PE. O eletrodo das massas é identificado separadamente. Os percursos TN e TT respeitam essa distinção. Em IT, a fonte não recebe ligação direta à terra.
- `assets/aterramento-slide-tt.png` e `assets/aterramento-slide-tncs.png`: imagens originais extraídas do material de aula, com créditos preservados, disponíveis na comparação recolhível.
- `assets/aterramento.css`: tema, cores e adaptação a telas pequenas.
- `assets/aterramento-capa.svg`: capa do cartão.
- `verificacao/testar-aterramento.cjs`: navegação dos cinco esquemas, estados normal/falta, variantes IT, teclado, respostas do questionário, pausa/retomada no portal e overflow no celular.

Em telas pequenas, o desenho e a tabela têm rolagem horizontal para manter os rótulos legíveis. A animação pode ser pausada e respeita a preferência de movimento reduzido. Sair do módulo pausa o movimento e preserva as escolhas.

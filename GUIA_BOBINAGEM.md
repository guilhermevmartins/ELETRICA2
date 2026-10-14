# Oficina de bobinagem · montagem do enrolamento

Abra index.html → Comandos elétricos → Motor trifásico → **03 · Montar o enrolamento**.

## O que a tela faz
Parte do estator vazio. O botão Montar automaticamente coloca o cobre bobina por bobina, conecta as emendas internas e monta os grupos do fechamento na caixa. É possível pausar, avançar um passo, concluir apenas a etapa atual ou recomeçar. A montagem congela ao sair da aba ou do módulo.

Clique em bobinas, ranhuras ou linhas da tabela para inspecionar o percurso. Destaque U, V, W ou todas. Em telas pequenas, o desenho pode ser rolado horizontalmente.

## Exemplos usados

| Polos P | Ranhuras S | Bobinas (dupla camada) | Passo pleno S/P | q = S/(3P) | Velocidade do campo a 60 Hz |
|---|---|---|---|---|---|
| 2 | 24 | 24 | 12 intervalos | 4 | 3.600 rpm |
| 4 | 24 | 24 | 6 intervalos | 2 | 1.800 rpm |
| 6 | 36 | 36 | 6 intervalos | 2 | 1.200 rpm |
| 8 | 24 | 24 | 3 intervalos | 1 | 900 rpm |

O exemplo de 6 polos usa outro estator, de 36 ranhuras, para manter uma distribuição integral. Os exemplos de 2, 4 e 8 polos mantêm 24 ranhuras. A quantidade de polos altera a distribuição; não é um fechamento Dahlander.

## Como ler
- Cada bobina Cnn inicia na camada superior de uma ranhura e termina na camada inferior, um passo pleno adiante. A numeração volta para 1 depois da última ranhura.
- Cada ranhura recebe dois lados de bobinas diferentes. O ponto externo indica a camada superior; o interno indica a inferior.
- As cabeças de bobina são desenhadas em cobre. As cores U/V/W identificam as fases; o dourado indica uma emenda.
- I e F são referências de início e fim da bobina. I→F e F→I mostram seu sentido no circuito da fase.
- Os grupos opostos são percorridos com orientação invertida. Entre eles aparecem F–F ou I–I; dentro de um grupo aparecem F–I (ou I–F quando percorrido inversamente). Não aplicar uma regra universal de união fim–início a todas as bobinas.
- Pontos preenchidos indicam junções. Cruzamentos de linhas sem ponto não são conexões.

## Roteiro sugerido para 4 polos
1. Escolha 4 polos e 6 pontas. Há 24 ranhuras, passo 6 e duas bobinas por grupo.
2. Coloque C01: I na ranhura 1, camada superior; F na ranhura 7, camada inferior.
3. Coloque C02: ranhuras 2 e 8. As duas pertencem ao primeiro grupo U.
4. Compare C07 (ranhuras 7 e 13): ela pertence ao grupo U seguinte e é percorrida de F para I.
5. Na etapa de emendas, acompanhe F(C01)–I(C02) e depois F(C02)–F(C07). A segunda ligação produz a orientação correta do grupo oposto no modelo.
6. Termine as emendas e observe as saídas 1–4, 2–5, 3–6. Monte estrela ou triângulo. O enrolamento continua com 4 polos.
7. Repita com 12 pontas: cada fase se divide em duas seções equivalentes e as uniões entre elas passam para a caixa. Experimente série/paralelo.
8. Use Ver este campo girando para levar o número de polos à primeira aba.

## Modelo e limites
Trifásico equilibrado, distribuído de dupla camada, passo pleno e ranhuras por polo/fase inteiras. As faixas seguem U+, W−, V+, U−, W+, V−, repetidas conforme os pares de polos. Cada bobina usa a mesma referência de início e fim; a inversão de percurso nos grupos opostos produz as polaridades aditivas das fases. Em 12 pontas, cada fase é separada em duas metades com a mesma amplitude e fase elétrica fundamental.

Esta é uma construção didática de conectividade e distribuição. Não é uma ficha de rebobinamento de um motor específico: não define espiras, bitola, tensão nominal, passo encurtado, isolação, geometria, arranjo de cabeças ou ensaios. O desenho afasta cabos para leitura. Os polos finais representam um instante do campo fundamental idealizado; harmônicos espaciais não são desenhados. A velocidade indicada é síncrona, não a velocidade mecânica em carga.

Referência de dupla camada, ocupação das ranhuras e passo polar: NIMI, Electrician Trade Theory, Volume 2, lição sobre enrolamento distribuído.
https://nimi.co.in/cits_ebooks1/Electrician/Electrician_Trade_Theory_(Volume_2)/files/basic-html/page187.html

## Verificação
verificacao/testar-bobinagem.cjs valida ocupação única das camadas, passos, equilíbrio de amplitudes, defasagem de 120 graus entre fases, equivalência das seções, continuidade de todas as emendas, animação, pausa entre abas e interface móvel.

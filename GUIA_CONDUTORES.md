# Condutores — bitolas, corrente e aquecimento

Abra `index.html` e selecione **Condutores · Bitolas**. O módulo também funciona diretamente em `simuladores/condutor.html`, sem internet.

## Roteiro de aula — 15 a 20 minutos

1. **Referência:** cobre de 2,5 mm², PVC, método B1, dois condutores carregados, um circuito e 30 °C. A capacidade tabulada é 24 A. Aplique 20 A e observe que o cabo aquece mesmo abaixo de sua capacidade.
2. **Agrupamento:** selecione três circuitos. O fator 0,70 reduz a capacidade para 16,80 A. A corrente permanece em 20 A; a condição excede a capacidade antes mesmo de a temperatura animada alcançar seu limite.
3. **Ambiente:** mantenha o grupo e altere para 40 °C. O fator de temperatura 0,87 resulta em `24 × 0,87 × 0,70 = 14,616 A`. Discuta por que multiplicamos os fatores.
4. **Seção:** selecione 6 mm². Nas mesmas condições, `41 × 0,87 × 0,70 = 24,969 A`. As temperaturas se ajustam gradualmente ao trocar os seletores.
5. **Instalação:** compare A1, B1, B2 e C, mantendo os demais parâmetros. B1 para condutores isolados/unipolares e B2 para cabo multipolar usam colunas distintas. Parede de alvenaria não é parede termicamente isolante.
6. **Isolação:** compare PVC e EPR/XLPE. A tabela base, o fator de temperatura e o limite contínuo da isolação mudam.
7. **Resfriamento:** pressione Zerar corrente. O calor acumulado não desaparece imediatamente.
8. **Desafio:** três circuitos fase + neutro correspondem a três circuitos agrupados, cada um com dois condutores carregados. PE não conta como carregado, embora ocupe espaço físico.

## Controles e vistas

- **Aquecimento:** corte do cabo, mapa de temperatura e desenho do agrupamento.
- **Gráficos:** histórico térmico e comparação de Iz para as oito seções disponíveis.
- **Tabela e cálculo:** capacidade de referência, fatores e capacidade corrigida para cada seção.
- Presets iniciam experiências novas à temperatura ambiente; mudanças individuais preservam o calor acumulado.
- Pausar congela o tempo. Alternar para outro módulo também congela o ensaio. Reiniciar restaura o exemplo inicial.

## Base técnica rastreável

Recorte da **ABNT NBR 5410:2004**, consultado no [Guia de dimensionamento Prysmian, revisão 10](https://br.prysmian.com/sites/br.prysmian.com/files/media/documents/Guia_de_Dimensionamento-Baixa_Tensao_Rev10.pdf):

| Conteúdo | Referência NBR 5410 | Página do guia |
|---|---|---|
| Métodos A1, B1, B2 e C | Tabela 33 | 7 |
| Capacidade, cobre/PVC | Tabela 36 | 9 |
| Capacidade, cobre/EPR ou XLPE | Tabela 37 | 10 |
| Temperatura ambiente do ar | Tabela 40 | 14 |
| Agrupamento em feixe | Tabela 42, linha 1 | 15 |
| Camada única sobre parede, método C | Tabela 42, linha 2 | 15 |

O recorte cobre seções de 1,5 a 35 mm², dois ou três condutores carregados, um a seis circuitos homogêneos, uniformemente carregados, e ambiente de 20 a 60 °C. A temperatura de referência ao ar é 30 °C. Os dados ficam separados em `assets/condutor-dados.js`.

O agrupamento em camada única fica disponível somente no método C. Ao selecionar eletroduto, o programa retorna ao agrupamento em feixe/conduto fechado. Não há fatores de solo, bandeja perfurada, cabos espaçados, circuitos heterogêneos ou harmônicas neste recorte. O módulo declara a edição usada e não afirma incorporar revisões posteriores.

## Modelo térmico didático

`Iz = I tabela × fT × fG`

`T alvo = T ambiente + (T limite − T ambiente) × (I/Iz)²`

O modelo faz uma aproximação exponencial ao alvo com constante de **8 segundos de tela**. Esse valor foi escolhido para observação em aula e não é um tempo normativo ou previsão térmica real. A temperatura alvo é limitada a 160 °C apenas para a visualização; a indicação final é ≥160 °C. PVC usa referência de 70 °C e EPR/XLPE de 90 °C para regime permanente.

Iz vem de valores tabulados; a temperatura animada é uma construção pedagógica. O modelo não calcula massa térmica real, resistência variável, ventilação, incêndio, envelhecimento ou atuação de disjuntor. O desenho do eletroduto não dimensiona ocupação ou diâmetro. As cores térmicas não são cores de identificação dos condutores nem indicam incandescência.

Atender a capacidade de corrente não conclui um projeto: ainda são necessários seção mínima, queda de tensão, coordenação com proteção, curto-circuito, proteção contra choque e outras condições aplicáveis.

## Verificação

`verificacao/testar-condutor.cjs` verifica pontos de referência das tabelas e fatores, mudanças de método/isolação, aquecimento e resfriamento, pausa, preservação de temperatura, controles, integração ao portal e ausência de transbordamento horizontal em tela de 390 px. O resultado fica em `verificacao/resultado-condutor.json`.

# Curvas B, C e D — gráficos dinâmicos

Abra `index.html`, escolha **Disjuntor DIN** e depois a aba interna **Gráficos · Curvas B, C e D**. A aba vizinha **Funcionamento e anatomia** retorna ao mecanismo do mesmo equipamento. As duas abas preservam o ensaio e congelam a simulação que não está visível.

## Objetivo da aula

Relacionar corrente e tempo de atuação e distinguir o ramo térmico, de tempo inverso, da atuação magnética. B, C e D são curvas de disparo de disjuntores DIN. Não devem ser confundidas com classes térmicas 10/20/30 de proteção de motores ou com capacidade de interrupção em kA.

## Controles

- **Iₙ:** corrente nominal, entre as opções de 6 a 63 A.
- **Corrente aplicada:** entrada em amperes ou slider de 0 a 30 × Iₙ. O gráfico também aceita clique na posição horizontal desejada.
- **Iniciar/Pausar/Continuar:** controla o relógio. Ao concluir os três disparos, o botão permite repetir o ensaio.
- **Reiniciar:** zera o tempo e rearma os três circuitos, aguardando um novo início.
- **Presets:** iniciam automaticamente o ensaio no múltiplo indicado.
- **1×/10×/100×/1000×:** aceleração de apresentação. O eixo e o relógio continuam mostrando o tempo calculado pelo modelo.
- **Comparar/B/C/D:** destaca uma curva no gráfico; os três circuitos continuam sendo simulados e seus resultados aparecem nos cartões.

Alterar corrente ou Iₙ reinicia um ensaio frio. Se ele já estava rodando, recomeça automaticamente; caso estivesse parado, aguarda Iniciar. Alterar Iₙ mantém a corrente em amperes, até o limite de 30 × da nova corrente nominal. A limitação, quando necessária, é indicada no painel.

## Roteiro de comparação

Use Iₙ = 10 A e siga a sequência:

| Corrente | Múltiplo | Curva B | Curva C | Curva D |
| --- | --- | --- | --- | --- |
| 5 A | 0,5 × | Sem disparo | Sem disparo | Sem disparo |
| 15 A | 1,5 × | Térmico, ~123,3 s | Térmico, ~123,3 s | Térmico, ~123,3 s |
| 40 A | 4 × | Magnético, 20 ms | Térmico, ~8,15 s | Térmico, ~8,15 s |
| 80 A | 8 × | Magnético, 20 ms | Magnético, 20 ms | Térmico, ~1,91 s |
| 160 A | 16 × | Magnético, 20 ms | Magnético, 20 ms | Magnético, 20 ms |

**Os valores dessa tabela são resultados do modelo didático, não tempos garantidos de produtos reais.**

Para a sobrecarga de 15 A, use 10× ou 100× para reduzir a espera em sala. Para comparar 40 A ou 80 A, use 1× e pause depois dos primeiros desarmes. Os pontos magnéticos permanecem registrados mesmo quando o intervalo de 20 ms é rápido demais para acompanhamento a olho nu.

Depois, com 80 A aplicados, altere Iₙ de 10 para 20 A. A relação cai de 8 × para 4 ×. Observe que B permanece na atuação magnética ilustrativa, mas C passa ao ramo térmico.

## Leitura do gráfico

O eixo horizontal é I/Iₙ. O eixo vertical é tempo em segundos. Ambos são logarítmicos: o intervalo entre 0,01 e 0,1 s ocupa o mesmo espaço que o intervalo entre 10 e 100 s.

O ramo térmico branco é comum às três curvas no modelo. As linhas coloridas indicam a transição no limiar magnético escolhido e a atuação de 20 ms. Os círculos menores indicam a previsão; os maiores acompanham o tempo e ficam marcados ao ocorrer o disparo. Círculos concêntricos representam resultados coincidentes.

Os disjuntores são tratados como três circuitos independentes, recebendo a mesma corrente constante. Quando B abre, a corrente de B zera, mas C e D continuam recebendo a corrente do ensaio. Os cartões mostram essa diferença. Não são três disjuntores em série.

As faixas coloridas indicam as regiões magnéticas de referência:

- B: 3–5 × Iₙ; ponto ilustrativo adotado: 4 ×.
- C: 5–10 × Iₙ; ponto ilustrativo adotado: 7,5 ×.
- D: 10–20 × Iₙ; ponto ilustrativo adotado: 15 ×.

Dentro de cada faixa, não existe um limiar universal exato. O desenho dessas faixas entre 0,01 e 0,1 s serve como orientação visual e não constitui um envelope normativo completo. A [documentação ABB Smissline TP](https://library.e.abb.com/public/d3c1700516cd4f6fb936092c0bd5c0ec/Catalogo%20Smissline%20TP%20%282016%29.pdf) é a referência técnica para as características B/C/D indicadas.

## Modelo do programa

Para m = I/Iₙ:

```
Se m ultrapassa o limiar magnético adotado: t = 0,02 s
Caso contrário, para m > 1,13: t = 120 / (m² − 1,13²) s
Até m = 1,13: sem disparo neste modelo
```

O ramo térmico é uma função pedagógica de tempo inverso. Não reproduz uma curva certificada, tolerâncias, temperatura ambiente, memória térmica, tensão de arco ou capacidade de interrupção. As outras abas usam modelos próprios para visualizar mecanismos; seus segundos didáticos não são uma calibração comum com esta aba.

A escala horizontal vai de 0,5 a 30 × e a vertical de 0,01 a 10.000 s. Valores fora desses limites recebem indicação; o cálculo de tempo não é truncado. O avanço em 1000× preserva os instantes calculados de disparo, mesmo se vários eventos ocorrerem em um único quadro de animação.

## Perguntas para os alunos

1. Por que um aumento da corrente reduz o tempo de atuação térmica?
2. A curva D possui corrente nominal maior que B quando ambas são de 10 A?
3. Por que a mesma corrente de 80 A representa múltiplos diferentes para Iₙ de 10 e 20 A?
4. O resultado magnético em 4 × seria garantido para qualquer disjuntor real de curva B?
5. Qual a diferença entre corrente nominal, curva de disparo e capacidade de interrupção?

As respostas devem destacar tempo inverso, distinção entre nominal e limiar magnético, relação I/Iₙ e a necessidade de consultar a curva específica do fabricante para aplicações reais.

# DR — a corrente que não voltou

Abra `index.html` e escolha **DR · Diferencial**. O módulo foi criado a partir das imagens `dps.png` e `dps_por_dentro.png`, que, apesar dos nomes dos arquivos, mostram um DR. Os arquivos originais foram preservados.

## O que explorar

O modelo padrão representa um **IDR de quatro polos, 63 A e 300 mA**, conforme as inscrições da imagem externa. O seletor permite trocar para uma variante didática de 30 mA. Isso representa trocar de aparelho: a sensibilidade do produto fotografado não é ajustável.

- **Circuito:** corrente de fase, retorno por neutro, carga e fuga por fora do toroide. O botão T também é clicável no desenho.
- **Por dentro:** quatro condutores ativos, toroide, enrolamento secundário, relé sensível, trava, mola, contatos e circuito de teste.
- **Explodida:** carcaça e tampa se afastam; os conjuntos se separam. Selecione as peças ou os botões de anatomia para ler sua função.
- **Sinais:** formas de onda das correntes instantâneas e sua soma. Após o disparo, o gráfico guarda a captura anterior à abertura, enquanto as métricas mostram zero no circuito interrompido.

O desenho é funcional e simplificado, não uma reprodução dimensional nem um esquema de instalação.

## Roteiro para a turma — 15 a 20 minutos

1. **Equilíbrio.** Escolha “Tudo o que vai, volta”. Com 10 A na carga e fuga zero, 10 A atravessam L1 e 10 A retornam por N. A soma magnética é nula.
2. **Fuga externa.** Escolha “Falha de isolação”. O preset aplica 1,5 × IΔn, ou 450 mA no modelo de 300 mA. A corrente de fase passa a 10,450 A, enquanto N retorna 10,000 A. A diferença de 450 mA libera a trava e abre os quatro polos.
3. **Persistência da falha.** Pressione Rearmar sem retirar a fuga. O aparelho volta a atuar. Depois pressione Eliminar fuga e Rearmar: o equilíbrio é restabelecido.
4. **Comparação de sensibilidades.** Aplique o preset de 40 mA. O modelo de 300 mA permanece fechado. Troque para a variante de 30 mA: a mesma fuga provoca desarme. O seletor mantém a fuga aplicada e começa um novo ensaio.
5. **Teste interno.** Retorne ao preset normal e pressione T. O resistor e o botão criam um caminho entre lados opostos do sensor. O teste não utiliza o PE; não comprova a resistência do aterramento nem todas as condições da instalação.
6. **Contraste com o disjuntor.** Aplique 70 A sem fuga. Este IDR permanece fechado porque não possui disparadores de sobrecorrente. Discuta a necessidade da proteção associada. O ensaio não autoriza operar o dispositivo acima de seus 63 A nominais.
7. **Desafios.** Peça que os alunos respondam antes de clicar: qualquer fuga faz disparar? 63 A e 300 mA significam a mesma coisa? O teste depende do terra? O DR protege contra qualquer contato elétrico?

## Controles

- **Corrente útil da carga:** 0–80 A. Muda a parcela que retorna normalmente pelo neutro.
- **Fuga:** 0–600 mA. Preserva a posição dos contatos; alterar o slider não rearma o DR.
- **Presets:** começam um ensaio novo, rearme incluído, e retiram a pausa.
- **30/300 mA:** muda a variante, mantém carga e fuga e começa outro ensaio.
- **T:** simula o botão de teste quando os contatos estão fechados. Não fecha um DR aberto.
- **Rearmar:** fecha novamente, preservando a fuga escolhida. Pode ocorrer novo disparo.
- **Eliminar fuga:** zera apenas a fuga externa; não fecha contatos que já abriram.
- **Pausar:** congela corrente animada e tempo de atuação. Os comandos continuam disponíveis, assim como a escolha das vistas.
- **Troca de equipamento:** congela a simulação inativa e preserva o estado da aula.

## Modelo elétrico

A experiência usa uma carga monofásica em L1–N de um aparelho tetrapolar; L2 e L3 estão sem carga. Todos os condutores ativos são monitorados. O PE fica fora do toroide.

```
I(L1) = I(carga) + [I(fuga) + I(teste)] / 1000   [A]
I(N)  = I(carga)                               [A]
IΔ    = I(fuga) + I(teste)                      [mA]

Teste T: I(teste) = 1,5 × IΔn
Disparo ilustrativo: IΔ ≥ IΔn
Atraso ilustrativo: max(0,040 s, 0,120 s / (IΔ/IΔn))
Tempo na tela: oito vezes o atraso ilustrativo
```

O contador de atuação volta a zero quando o residual cai abaixo do limiar. Na abertura, o circuito idealizado interrompe todas as correntes. Os valores são eficazes senoidais prescritos e em fase. Por isso a diferença aritmética usada neste caso é válida.

Em um sistema trifásico geral, o sensor percebe a **soma instantânea** das correntes dos condutores ativos. Não se devem somar ou subtrair simplesmente seus valores eficazes. Na vista Sinais, o neutro aparece com sinal oposto ao da fase; o residual é desenhado em uma escala independente de mA. O tracejado é o pico equivalente a uma senoide de valor eficaz IΔn, não um limiar instantâneo de disparo.

Os tempos e o limiar pontual são pedagógicos, não uma curva certificada do fabricante. Não são modelados corpo humano, tensão de contato, impedância do solo, defeitos do aparelho, correntes contínuas ou formas de onda residuais de outros tipos. O sinal mostrado é AC senoidal.

## Distinções importantes

- **IDR:** detecta residual; o aparelho desta aula não protege contra sobrecorrente.
- **Disjuntor termomagnético:** protege contra sobrecarga e curto-circuito, conforme suas características.
- **DPS:** limita sobretensões transitórias; é outro dispositivo.
- **63 A:** corrente nominal de condução do IDR representado.
- **300 mA ou 30 mA:** corrente diferencial residual nominal de atuação da variante escolhida.

Mesmo um DR de alta sensibilidade não garante proteção em qualquer contato. Se a corrente retornar integralmente por outro condutor ativo monitorado, pode não haver residual detectável. O recurso é destinado exclusivamente a ensaios virtuais.

## Referências e verificação

Referências visuais: os dois arquivos fornecidos pelo usuário, preservados na raiz. Documentação de apoio: [STECK SDR 4P 300 mA](https://loja.steck.com.br/interruptor-diferencial-4p-25a-300ma-steck-sdr425300-1/p), [STECK SDR 4P 63 A 30 mA](https://loja.steck.com.br/interruptor-diferencial-residual-4p-63a-30ma-steck-sdr46330-1/p) e [Schneider Electric — verificações de DR](https://www.se.com/us/en/download/document/CA9UG000E/).

O teste `verificacao/testar-dr.cjs` verifica equilíbrio, comparação 30/300 mA, teste T sem PE, corrente alta sem fuga, rearme com falta persistente, corrente zero após abertura, pausa, navegação, desafios e layout móvel. As capturas e o relatório ficam na pasta `verificacao`.

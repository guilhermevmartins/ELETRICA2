# Motor trifásico · Campo e bobinas

Abra index.html → Comandos elétricos → Motor trifásico. Acesso direto: index.html#trifasico. Funciona offline.

## Sequência de indução
O módulo agora abre desligado: sem correntes, sem campos N/S e sem movimento.
Clique em **Iniciar sequência** para revelar quatro etapas: desligado, campo do estator, indução no rotor e torque/movimento. As etapas também podem ser selecionadas manualmente; nesse caso a cena pausa para discussão. O botão Continuar animação anima a etapa selecionada. Reiniciar experiência retorna ao estado desligado.

- Círculos N/S no entreferro: campo do estator.
- Losangos N/S dentro do rotor: campo induzido.
- Símbolos ⊙ e ⊗ nas barras: sentidos ilustrativos das correntes induzidas, saindo e entrando na tela.
- Seta branca: somente a posição mecânica do eixo; não é um polo.
- Os padrões de campo acompanham a velocidade síncrona, mas as barras e o eixo giram mais devagar em regime motor.
- Com escorregamento zero, após a aceleração ilustrativa, o modelo retira as correntes e o campo induzido: não há torque motor sustentado nesse estado ideal.

As camadas são reveladas em momentos separados apenas para ensino. No motor real os fenômenos eletromagnéticos aparecem juntos após a energização. O crescimento visual do campo, a defasagem dos polos induzidos e a aceleração não são uma solução do transitório real. Remanência não é modelada.

## Campo girante e polos
- Compare 2, 4, 6 e 8 polos; ajuste frequência e escorregamento.
- Pause e avance 30 graus elétricos. Arraste o instante ou troque V e W para inverter o sentido.
- O círculo mostra os grupos magnéticos equivalentes fixos e os polos N/S girantes. As ondas mostram as correntes. O diagrama vetorial ao lado usa espaço elétrico, inclusive para motores multipolares.
- Os filtros de fase apenas ocultam contribuições; não simulam falta de fase.
- Velocidade síncrona: ns = 120 f / P. Velocidade imposta do rotor: n = ns (1 − s/100).
- Ângulo elétrico = número de pares de polos × ângulo mecânico.
- Modelo senoidal equilibrado: iU = cos θ, iV = cos(θ − 120°), iW = cos(θ − 240°). A sequência inversa troca V e W. A resultante no espaço elétrico tem módulo 1,5 vezes o campo de pico de uma fase.
- A 60 Hz, o campo de 4 polos tem 1.800 rpm; com 4% de escorregamento, o rotor tem 1.728 rpm. A animação usa 0,3 ciclo elétrico por segundo para facilitar a observação.

## Siga os cabos no estator
A nova vista mostra um caminho contínuo: extremidade da seção → cabo → borne. Comece destacando a fase U e avance pelas etapas de localização dos inícios/fins, emenda interna e cabos de saída.

No exemplo de **6 pontas**, siga: ponta 1 → I-UA → seção UA → F-UA → emenda dourada → I-UB → seção UB → F-UB → ponta 4. A mesma organização vale para V (2–5) e W (3–6). A e B são seções de polaridade compatível; a união fim A/início B é série aditiva neste modelo.

No exemplo de **12 pontas**, não há essa emenda interna: cada extremidade chega separada à caixa. Na fase U, os cabos são I-UA→1, F-UA→4, I-UB→7 e F-UB→10. No triângulo série, selecione a união externa U (4+7) para enxergar os cabos verdes fechando a série na caixa.

Use “Inspecionar uma ponte externa” para destacar um grupo do fechamento selecionado. As conexões nessa caixa acompanham o esquema elétrico e os grupos numéricos da seção seguinte. Pontos preenchidos indicam junção elétrica; cruzamentos sem ponto não unem fios. É possível selecionar a fase tocando nas seções ou nos terminais; em telas pequenas, role horizontalmente o desenho.

Esta vista é topológica: não determina ranhuras, passo, quantidade de bobinas, sentido de enrolamento, espiras, bitola ou isolamento de um motor real. Esses dados e a identificação das polaridades vêm do projeto de bobinagem do motor; não podem ser inferidos apenas das cores ou da quantidade de pontas.

## Bobinas e fechamentos
Os desenhos são topológicos e idealizados, não esquemas de rebobinamento. Uma seção pode conter várias bobinas distribuídas. O esboço de estator desta aba é de 2 polos e independe da seleção da primeira aba.

Em 6 pontas, as duas seções de cada fase já estão unidas em série dentro do motor. Só as extremidades do conjunto ficam disponíveis: U = 1–4 (U1–U2), V = 2–5 (V1–V2), W = 3–6 (W1–W2). Exemplo de placa: 220/380 V; cada conjunto completo de fase é de 220 V (duas seções de 110 V em série).

Em 12 pontas, existem seis seções acessíveis: U = 1–4 e 7–10, V = 2–5 e 8–11, W = 3–6 e 9–12. Neste segundo exemplo, cada seção é de 220 V a 60 Hz. Trocar o exemplo na tela não significa cortar ou transformar fisicamente o primeiro motor.

### Grupos de ligação do exemplo
- 6 pontas, Δ: L1 = 1+6; L2 = 2+4; L3 = 3+5.
- 6 pontas, Y: L1 = 1; L2 = 2; L3 = 3; unir 4+5+6.
- 12 pontas, Δ paralelo: L1 = 1+7+6+12; L2 = 2+8+4+10; L3 = 3+9+5+11.
- 12 pontas, Y paralelo: L1 = 1+7; L2 = 2+8; L3 = 3+9; unir 4+5+6 e 10+11+12. Unir os dois pontos estrela também é aceito neste modelo equilibrado.
- 12 pontas, Δ série: L1 = 1+12; L2 = 2+10; L3 = 3+11; pontes 4+7, 5+8 e 6+9.
- 12 pontas, Y série: L1 = 1; L2 = 2; L3 = 3; pontes 4+7, 5+8, 6+9 e estrela 10+11+12.

A relação de tensão da estrela série corresponde a aproximadamente 760 V, mas não autoriza operação nessa tensão: a placa e a isolação precisam permitir. No exemplo 220/380/440 V, a estrela série também ilustra a ligação de partida na rede de 440 V, com tensão reduzida por seção. Não há simulação do transitório de partida.

## Roteiro de aula
1. Inicie a sequência, selecione a etapa de indução e pause em 0° elétricos: U está no pico; V e W estão em −0,5. Observe a soma.
2. Avance 180° elétricos em 4 polos: o padrão desloca-se 90° mecânicos. Complete 360° elétricos: meia volta mecânica.
3. Troque duas fases e compare o sentido do movimento.
4. Ajuste escorregamento para zero: discuta por que o motor de indução ideal não mantém torque em sincronismo exato.
5. Na segunda aba, isole a fase U. Siga as duas seções até a caixa de terminais. Compare acesso interno e externo.
6. Experimente Δ paralelo/220 V, Y paralelo/380 V e Δ série/440 V: aproximadamente 220 V por seção nos três casos.
7. Limpe a montagem e peça que os alunos unam os grupos de cada fechamento; confira na tela.
8. Pergunte: “12 pontas significa 12 polos?” A resposta é não.

Referência: Guia de Especificação de Motores Elétricos WEG, seções de campo girante, velocidade e ligações.
https://static.weg.net/medias/downloadcenter/h32/hc5/WEG-motores-eletricos-guia-de-especificacao-50032749-brochure-portuguese-web.pdf

## Verificação
verificacao/testar-trifasico.cjs testa velocidades, resultante, inversão da sequência, tensões, grupos de ligação, comandos da interface, pausa entre áreas e layout móvel. Relatório: verificacao/resultado-trifasico.json. Capturas: verificacao/trifasico-*.png.

## Terceira aba: Montar o enrolamento
A oficina de bobinagem mostra ranhuras numeradas, cobre em dupla camada, passo polar, emendas e fechamento de 6/12 pontas. Consulte GUIA_BOBINAGEM.md para o roteiro e as convenções do modelo.

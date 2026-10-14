# Disjuntor-motor — roteiro de aula

Abra `index.html` e selecione **Disjuntor-motor**. A referência visual é a foto `disjuntor motor.webp`: equipamento tripolar com START preto, STOP vermelho e seletor de 24–32 A. O interior é uma representação funcional genérica, pois a foto não mostra os mecanismos internos.

## Exploração em sala

1. **Vista frontal:** identifique entradas 1L1/3L2/5L3 e saídas 2T1/4T2/6T3. Use STOP e START no desenho ou no painel. O seletor mostrado acompanha o slider de ajuste térmico.
2. **Corte interno:** siga os três caminhos elétricos. Selecione os oito conjuntos pelo desenho ou pelos botões de anatomia. Diferencie fios de cobre e vínculos mecânicos cinza pontilhados.
3. **Regime:** escolha 28 A, com Iᵣ em 28 A. Todos os polos conduzem e os bimetais aquecem sem atingir o limiar do modelo.
4. **Partida:** observe a corrente inicialmente em 168 A e sua redução para 28 A. O perfil é curto e permanece abaixo do limiar magnético ilustrativo. Não representa uma partida calculada de um motor específico.
5. **Sobrecarga:** escolha 42 A. Repita com Iᵣ em 24, 28 e 32 A. O ensaio frio preserva o ajuste escolhido. Compare os tempos didáticos na tabela abaixo.
6. **Curto-circuito:** escolha 450 A. Observe a atuação magnética, a liberação da trava, os três contatos abertos e os arcos nas câmaras. Tente START: é necessário rearmar. Depois de Rearmar, START com o curto mantido desarma novamente.
7. **Falta de fase:** escolha o preset 40/0/40 A. Observe L2 frio e L1/L3 mais quentes. O diferencial atua e os três polos abrem. Essas correntes são prescritas, não calculadas a partir de ligação, carga ou impedância reais.
8. **Vista explodida:** separe carcaça, tampa frontal e conjuntos internos. Os caminhos pontilhados representam vínculos de montagem; as partes separadas não são um equipamento realmente energizado.

## Comparação da sobrecarga de 42 A

Valores obtidos por verificação do modelo, partindo de 25 °C:

| Ajuste Iᵣ | Tempo didático até abrir | Aproximação de tempo na tela em 3× |
| --- | ---: | ---: |
| 24 A | 9,45 s | 3,15 s |
| 28 A | 14,60 s | 4,87 s |
| 32 A | 23,28 s | 7,76 s |

O ajuste adequado na situação proposta é o da corrente de placa do motor, 28 A. Elevar o ajuste apenas para impedir desarmes não é o objetivo da atividade. Os tempos da tabela não são valores normativos nem previsões do produto fotografado.

## Controles e memória

- Presets reiniciam a temperatura, restauram a execução e iniciam um ensaio novo, preservando Iᵣ e a vista.
- O slider de corrente passa ao modo manual, com as três fases iguais; isso remove o cenário prescrito de falta de fase ou partida. O estado aberto/fechado e as temperaturas permanecem.
- STOP abre os contatos; START fecha se a trava estiver rearmada. START não reinicia automaticamente o perfil de partida — use o preset Partida para repetir esse experimento.
- Rearmar libera a trava e deixa os contatos abertos. Não remove a falta nem o calor. Use START em seguida.
- Pausar congela o ensaio; os comandos manuais ainda podem alterar seu estado. É possível explorar as vistas e peças durante a pausa.
- Tempo térmico 1×/3×/6× modifica o ritmo do modelo. A partida usa 1× enquanto o perfil inicial está em andamento. Arco e núcleo têm duração visual própria de cerca de 1,8 s.
- Ao trocar de aba do laboratório, o ensaio fica congelado. Ao voltar, ele retoma, exceto se já estava pausado manualmente. Recarregar a página reinicia os módulos.

## Modelo e código

O código comentado fica em `assets/motor.js`; a interface em `simuladores/disjuntor-motor.html`.

```
Para cada fase:
  I = contatos fechados ? corrente prescrita : 0
  T_equilíbrio = 25 + 60 × (I / Iᵣ)²
  T_nova = T_equilíbrio + (T_anterior − T_equilíbrio) × exp(−dt / 18)

Desarme térmico: qualquer T ≥ 100 °C
Desarme magnético: qualquer I ≥ 416 A, independentemente de Iᵣ
Falta de fase: no preset correspondente, diferença entre temperaturas ≥ 35 °C
Todos os disparos abrem os três polos.
```

Os tempos são didáticos. A rotação é ilustrativa, sem cálculo de torque ou velocidade nominal. Não há solução de circuito trifásico, cálculo de corrente de arco, energia passante ou capacidade de interrupção. A corrente exibida zera na abertura idealizada, enquanto o arco residual explica visualmente a extinção.

A [ficha Maxge SGV2](https://www.maxge.eu/en_GB/shop/motor-circuit-breakers-from-0-06-to-15kw-400v-sgv2-1079) apresenta 24–32 A / 416 A para sua variante. Esse valor é uma referência ilustrativa; não foi atribuído como calibração confirmada do STRAHL da foto. A [documentação WEG MPW](https://www.weg.net/catalog/weg/BR/pt/Automa%C3%A7%C3%A3o-e-Controle-Industrial/Controls/Partida-e-Prote%C3%A7%C3%A3o-de-Motores/Disjuntores-motores/Disjuntores-Motores-MPW/DISJUNTOR-MOTOR-AZ-MPW40-3-D025-1%2C6-2%2C5-A-Parafuso/p/12428110) foi consultada para as funções gerais de ajuste térmico, diferencial e proteção magnética.

## Perguntas para discussão

- Por que uma partida breve pode ser tolerada e uma sobrecarga prolongada não?
- O seletor Iᵣ altera a corrente que a carga solicita?
- Por que os três polos abrem se o problema começa em apenas uma fase?
- Por que Rearmar não equivale a remover a causa do desarme?
- Quais características diferenciam este módulo do disjuntor DIN C10 da outra aba?

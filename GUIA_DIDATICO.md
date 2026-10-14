# Laboratório do disjuntor termomagnético DIN

## Abrir o programa

Abra `index.html` com dois cliques e escolha Edge, Chrome ou Firefox. Na tela de seleção, escolha **Disjuntor termomagnético**. O laboratório também tem uma aba de **Disjuntor-motor**. Ao trocar de aba, o ensaio anterior fica congelado e seu estado é preservado; ao voltar, ele continua, respeitando a pausa manual. A recarga da página reinicia os ensaios.

O projeto foi organizado em módulos para receber novos equipamentos. Mantenha as pastas `assets` e `simuladores` e as imagens junto de `index.html`. Funciona sem internet, instalação, bibliotecas ou servidor. Para projetar em sala, use F11. O simulador DIN está em `simuladores/disjuntor-din.html`; seu código e as imagens de referência incorporadas foram preservados, com o tema vermelho compartilhado. Consulte `README.md` para a estrutura e `GUIA_DISJUNTOR_MOTOR.md` para o novo módulo.

## Roteiro de aula — 15 a 20 minutos

1. **Reconhecer as partes (4 min).** Ative **Vista explodida**. Selecione os rótulos do desenho ou os sete botões de anatomia. Localize manopla, trava e mola, contatos, bimetal, bobina, câmara de arco e bornes. A tampa se afasta e os conjuntos se separam. Retorne à vista normal para relacionar cada parte à montagem.
2. **Condução normal (2 min).** Escolha **5 A**. Siga o percurso convencional: entrada → bobina → bimetal → contatos → saída. Discuta por que o bimetal pode aquecer sem desarmar. Ajuste para 0 A: contatos fechados não garantem corrente circulando.
3. **Sobrecarga (4 min).** Escolha **15 A**. Observe temperatura, cor e deformação da lâmina. Neste modelo, partindo de 25 °C, o desarme ocorre em aproximadamente 14,3 segundos didáticos. A trava se libera, o contato móvel se afasta e a corrente zera. Observe que o bimetal continua quente. Remova a sobrecarga no slider antes do religamento.
4. **Curto-circuito (3 min).** Escolha **80 A**. O disparo ocorre imediatamente no modelo; núcleo, gatilho e arco permanecem visíveis numa sequência explicativa alongada. Use **Pausar** logo após o preset para discutir o arco. Compare com a espera pelo aquecimento no ensaio anterior. Tente religar com 80 A mantidos: a proteção volta a desarmar.
5. **Falha severa (2 min).** Escolha **160 A / explosão**. Explique que as faíscas, o clarão e o choque no invólucro são uma dramatização de uma falha hipotética, não uma previsão de explosão nessa corrente. Relacione a discussão à capacidade de interrupção indicada em kA.

Perguntas para a turma: os disparadores térmico e magnético abrem contatos diferentes? Por que a proteção térmica tem memória? Por que ainda pode existir um arco enquanto os contatos se afastam? Corrente nominal e capacidade de interrupção são a mesma grandeza funcional?

Respostas esperadas: os dois mecanismos liberam a mesma trava; a temperatura não retorna instantaneamente ao ambiente; o meio ionizado pode continuar conduzindo; corrente nominal de serviço e capacidade de interromper um curto são características distintas.

## Comportamento dos controles

- **Slider 0–200 A:** altera a corrente solicitada, preservando a temperatura e o estado aberto/fechado. Um circuito aberto continua com corrente efetiva zero mesmo se houver corrente solicitada.
- **Presets:** começam um novo ensaio com 25 °C e mecanismo armado; os presets de curto desarmam imediatamente. Também retiram a pausa.
- **Religamento:** rearma e tenta fechar, preservando corrente e calor. Com falta magnética persistente ou bimetal ainda no limiar, ocorre novo desarme.
- **Desligar/Ligar:** comando manual dos contatos. A proteção sempre tem prioridade sobre o fechamento.
- **Pausar/Continuar:** congela/retoma o tempo e os efeitos. É possível explorar as peças e alternar a vista enquanto pausado. Um comando explícito de preset, slider ou religamento ainda pode alterar o estado.
- **Vista explodida:** separação anatômica, não uma montagem energizada real. Os conectores pontilhados e as partículas nessa vista apenas ajudam a acompanhar as relações elétricas.
- **Reduzir efeitos:** reduz clarão e remove tremor; respeita inicialmente a preferência de redução de movimento do sistema.

## Como o programa funciona

`state` guarda corrente solicitada, temperatura, posição dos contatos, causa do desarme, tempo, arco e modo de visualização. `update(dt)` integra o modelo. `check()` avalia o disparo e `trip()` abre o circuito. `draw()` desenha os componentes e os efeitos no Canvas; `requestAnimationFrame` coordena a animação. `select()` atualiza a explicação anatômica.

O bimetal usa o modelo térmico de primeira ordem:

```
I = contatos fechados ? corrente solicitada : 0
T_equilíbrio = 25 + 40 × (I / 10)²
T_nova = T_equilíbrio + (T_anterior − T_equilíbrio) × exp(−dt / 8)
Desarme térmico: T ≥ 100 °C
Força relativa: Fm = (I / 80)²
Desarme magnético: I ≥ 80 A
```

As constantes estão no início do script. A força é mostrada em **unidades relativas (u.r.)**, não em newtons. Temperatura, constante térmica e limiares são pedagógicos. O modelo não representa saturação magnética, frequência, impedância da fonte, resistência de contato, tensão de arco ou energia passante I²t. A integração usa o tempo entre quadros com limite de 50 ms para evitar saltos quando a aba fica inativa.

O térmico foi acelerado e o arco/magnético foi desacelerado visualmente. O relógio marca tempo didático, sem conversão universal para segundos reais. Após o desarme, o display representa a corrente do circuito idealmente interrompido, enquanto a animação residual de arco explica sua extinção. Não há cálculo elétrico dessa fase transitória.

## Fidelidade e limites das referências

- **11.PNG:** orienta a silhueta aberta, manopla azul superior, trava articulada, bobina central de cobre, câmara inferior e terminais laterais.
- **Captura de tela 2026-10-02 073513.png:** orienta a identificação externa DIN C10. A foto apresenta capacidade indicada de 3000 A.
- **02_Dia_dois.pptx, slides 4, 6 e 7:** explica bimetal, proteção termomagnética e faixa magnética da curva C.

O desenho preserva a organização visual geral, com trajetos e articulações simplificados para ensino. Não é uma reprodução dimensional, um esquema interno certificado do produto fotografado ou um guia de desmontagem.

A faixa de 5–10 vezes a corrente nominal de um exemplo de curva C pode ser consultada na [ficha Schneider Electric C10](https://eshop.se.com/eg/miniature-circuit-breaker-a9k24210.html). A escolha pontual de 8 In neste programa não representa uma garantia para todos os disjuntores C10. A foto fornecida indica 3 kA; portanto, não se pode afirmar que 160 A exceda sua capacidade. O preset severo não associa numericamente corrente selecionada a ruptura real.

Use os ensaios somente no ambiente virtual. O programa não serve para dimensionamento de instalações nem para provocar faltas em equipamentos reais.

## Verificação

O simulador foi executado localmente no Edge por automação de navegador: condução normal, desarme térmico, resfriamento, desarme magnético, religamento com falta, extinção visual do arco, preset severo, pausa, corrente zero e seleção de peças foram verificados. A interface foi capturada em 1440 px e 390 px. O script técnico de verificação e as capturas ficam na pasta `verificacao`; não são necessários para executar o simulador.

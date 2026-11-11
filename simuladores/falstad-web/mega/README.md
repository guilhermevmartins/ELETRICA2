# Arduino Mega 2560 no Falstad

Abra **Arduino Mega** na barra superior. O painel pode ser minimizado sem desligar o programa.

## Carregar o próprio programa

1. Cole o programa no editor ou use **Abrir .ino**.
2. Selecione um pino na placa e insira seu terminal como entrada ou saída. Use fios normais do Falstad para ligar o terminal.
3. Clique em **Compilar e iniciar**. Erros aparecem abaixo do editor, sem substituir o programa anterior. Alterar o código pausa a execução e exige recompilação.
4. **Pausar** pausa o programa e o circuito. **Reiniciar** reinicia a CPU; para zerar também capacitores/indutores, use o reset do Falstad.

A compilação roda no navegador, com alvo Mega 2560, sem envio do código a terceiros. Inclui as funções Arduino e LiquidCrystal para LCD paralelo. Bibliotecas externas e múltiplas abas não estão incluídas. Veja [compilador, fontes e limites](compiler/README.md). O `.hex` sem bootloader continua disponível como alternativa em **Programa já compilado**.

Os exemplos LED, botão e entrada analógica já incluem código compilado, código-fonte `.ino` e circuito. Montar um exemplo pede confirmação porque substitui o trabalho atual.

## Ligações

- Saída: uma fonte de tensão externa (JavaScript) chamada `MEGA.D13`, por exemplo. O programa deve configurar o pino como `OUTPUT`. O terminal fornece níveis ideais 0/5 V. Use resistor em série com LEDs. Não conecte outra fonte a essa saída.
- Entrada digital: um nó rotulado `MEGA.D22`, por exemplo. Use 0/5 V. O limiar didático é 2,5 V.
- Entrada analógica: nó rotulado `MEGA.A0` até `MEGA.A15`; faixa 0–5 V, conversor de 10 bits. Tensões fora dessa faixa são limitadas pelo modelo, não representam proteção física da placa.
- Os nomes são sensíveis a maiúsculas. Os botões geram os nomes corretos automaticamente.
- Um pino deve ter somente um papel no circuito. Para mudar de entrada para saída ou vice-versa, apague o terminal anterior e insira o adequado. Fontes externas não têm estado de alta impedância.
- Para `INPUT_PULLUP` conectado ao Falstad, monte um pull-up externo (por exemplo 10k para 5 V). Sem terminal de entrada, o pull-up é aplicado internamente no modelo.
- O controle **Entrada de teste** permite variar um pino sem circuito conectado. Um terminal de entrada conectado tem prioridade sobre esse controle. **Liberar entrada de teste** devolve o estado padrão (pull-up se habilitado; senão 0).
- PWM é uma sequência de níveis 0/5 V, não uma fonte de tensão analógica. Observe com o osciloscópio; use filtro RC para converter em tensão média.

## Salvar e compartilhar

**Baixar projeto completo** guarda circuito, código .ino, HEX quando disponível, nomes e entradas de teste em um JSON. Também guarda rascunhos ainda não compilados. **Abrir projeto** restaura tudo em pausa. Os arquivos não incluem o estado de execução da CPU. O código-fonte também acompanha os exemplos da turma, com a proteção de publicação já existente.

**Exemplos da turma** também guarda o programa junto do circuito. A publicação continua protegida pela mesma senha dos exemplos do CAD. Exemplos antigos, contendo apenas circuitos, continuam compatíveis e descarregam o programa anterior ao abrir.

## Escopo do modelo

Executa instruções AVR do HEX em flash de 256 KiB, SRAM de 8 KiB começando em `0x200`, PC de 22 bits e clock de 16 MHz. Portas A–L (sem I) seguem a variante oficial do Mega; A0–A15 também podem operar como digitais 54–69.

Configurados: GPIO, interrupções externas INT0–INT7, temporizadores 0–5/PWM, ADC de 16 entradas simples e Serial/Serial1/Serial2/Serial3 (transmissão no monitor). O modelo não é uma réplica completa da placa: não integra SPI, I²C, USB, EEPROM, watchdog, ADC diferencial, captura externa de timers ou recepção serial por fios. Bibliotecas que exigem esses recursos não são garantidas. O `.hex` não identifica a placa-alvo; é responsabilidade do usuário selecionar Mega na IDE.

A CPU avança pelo tempo do Falstad, não por um relógio independente. PWM é amostrado no passo do circuito; use passo máximo de 5 µs nos exemplos. Passos maiores que 12,5 ms pausam a execução, evitando travar o navegador. Uma máquina lenta pode simular mais devagar que o tempo real. Trocar de aba do portal pausa ambos.

## Hospedagem e manutenção

Publique a pasta `mega` completa (incluindo `compiler`), `index.html`, `portal-integration.js`, `examples-library.js` e `library-api.php` atualizados. O motor fica local em `vendor/avr8js`; o compilador WebAssembly fica em `compiler`. Não depende de CDN, Node ou processos de compilação no HostGator. A biblioteca pública continua usando PHP e os arquivos protegidos de `config`.

AVR8js **0.21.1**, licença MIT preservada em `vendor/avr8js/LICENSE`. Distribuição ESM do pacote npm, somente com extensões `.js` acrescentadas aos imports para funcionar diretamente no navegador. Os adaptadores estão em `mega-core.mjs`; não alteram o motor.

Fontes: [Arduino Mega 2560](https://docs.arduino.cc/hardware/mega-2560), [mapa oficial de pinos](https://github.com/arduino/ArduinoCore-avr/blob/master/variants/mega/pins_arduino.h), [AVR8js](https://github.com/wokwi/avr8js). Registradores e vetores conferidos em `avr-libc/iomxx0_1.h` da ferramenta oficial Arduino AVR GCC.

## Verificação

- `node mega-core.test.mjs`: executa os HEX reais; verifica temporização de `delay`, entrada D22, saída D13, Serial, ADC A15 e PWM D44.
- `build-examples.mjs`: utilitário de desenvolvimento para recompilar os exemplos usando Arduino AVR Core 1.8.6 e AVR GCC 7.3.0. Define-se `ARDUINO_PACKAGES` para a pasta `packages/arduino` local. Não é executado pelo site.
- `browser.test.cjs`: teste com Edge/Playwright, contra cópia isolada do site em `MEGA_QA_URL`; `MEGA_QA_PASSWORD` habilita o teste de publicação e exclusão do próprio exemplo de teste. Nunca apontar esse teste para a biblioteca de produção.

## Componentes Arduino no menu Desenhar
Abaixo de Arrastar, Componentes Arduino abre os módulos didáticos LCD 16×2 (paralelo 4 bits), HC-SR04 (TRIG/ECHO), infravermelho digital ativo em LOW, fonte analógica ajustável, botão com pull-down e LED com resistor. Os terminais ARD_* são inseridos abaixo do circuito e devem ser ligados por fios aos terminais MEGA.*. Alimentação dos módulos é idealizada em 5 V. LCD suporta inicialização em 4 bits, escrita de caracteres ASCII, limpeza, retorno e endereço DDRAM; caracteres customizados, deslocamento e I²C não são implementados. Distância e tensão de teste são controles da sessão; ao reabrir voltam aos padrões. O LCD pode ser observado na janela Componentes Arduino enquanto a simulação executa.

## CIs usados nas aulas

Em **Desenhar → CIs usados nas aulas**, pesquise e clique em **Inserir CI**. O bloco é acrescentado abaixo da montagem existente, com todas as suas seções. Ligue seus terminais com fios normais. Os modelos e ligações acompanham o arquivo exportado e os exemplos da turma; não dependem de um painel aberto para funcionar. Inserir um bloco reanalisa o circuito e reinicia o tempo da simulação, preservando a opção de executar ou pausar.

São 31 modelos: 4027, 4093, 4082, 4066, 4011, 4081, 4026, 4069, 4052, 4051, 4021, 4013, 4071, LM324, LM339, 4040, 4029, 4001, 4028, 4511, 4009, LM392, LM741, 4070, 555, 4030, 74HC95, 4518, LM7809, 4017 e 4019. KK0952 permanece sem inserção até ser identificado.

Os blocos utilizam lógica e subcircuitos nativos do CircuitJS. São modelos didáticos por função, **não pinagens físicas DIP nem modelos elétricos completos do fabricante**:

- Lógica em 0/5 V com limiar de 2,5 V e alimentação interna ideal; 4093 usa histerese de 1,66/3,33 V. Sem atrasos reais de propagação, consumo ou limite de corrente. O 4009 não simula conversão de nível entre alimentações.
- Prefixos 1, 2 etc. identificam seções independentes. Q0/P0 e A representam os bits menos significativos. `n` indica controle ativo em LOW. Inicialize flip-flops e contadores usando RST; instruções específicas aparecem em cada cartão.
- 4021: Q5/Q6/Q7 representam as saídas dos estágios 6/7/8. 74HC95: quatro bits, CS para deslocamento e CP para carga paralela, na borda de descida, conforme [datasheet da Renesas](https://www.renesas.com/en/document/dst/hd74hc95-datasheet). 4026 implementa a–g, DEO e CARRY; a saída C não condicionada pelo display não é exposta.
- 4051/4052/4066: chaves bilaterais, resistência ligada de 120 Ω e desligada de 1 GΩ. Referências fracas de 1 GΩ ao terra evitam matriz singular nos canais desconectados.
- LM324 e seção operacional do LM392: alimentação interna ideal 0/5 V. LM741: ±15 V. LM339 e seção comparadora do LM392: coletor aberto, exige pull-up externo. Não modelam todas as limitações de faixa de entrada, frequência, offset ou saturação dos componentes reais.
- 555: temporizador nativo com VCC/GND externos, controle, descarga e reset. LM7809: regulador aproximado, saída `max(0, min(9, VIN−GND−2))` relativa a GND, sem aquecimento ou limite de corrente.

`node chip-browser.test.cjs` verifica os 31 modelos no Edge: importação/exportação, tabelas-verdade de todas as portas, flip-flops, contagem e retorno de década, deslocamento, latch, histerese, chaves, comparadores, realimentação, regulador e 555. Inicie o servidor local na porta 8034 ou defina `CHIP_QA_URL`. `PLAYWRIGHT_MODULE` permite informar a instalação local do Playwright. O teste não publica exemplos nem altera a biblioteca compartilhada.

# Arduino Mega 2560 no Falstad

Abra **Arduino Mega** na barra superior. O painel pode ser minimizado sem desligar o programa.

## Carregar o próprio programa

1. Na IDE Arduino, selecione **Arduino Mega or Mega 2560 / ATmega2560**.
2. Use **Sketch → Exportar Binário Compilado**.
3. No painel, carregue o `.hex` do programa, **sem bootloader**. O `.ino` precisa ser compilado na IDE; não existe compilador no servidor.
4. Selecione um pino na placa e insira seu terminal como entrada ou saída. Use fios normais do Falstad para ligar o terminal.
5. Clique em **Iniciar**. **Pausar** pausa o programa e o circuito. **Reiniciar** reinicia a CPU; para zerar também capacitores/indutores, use o reset do Falstad.

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

**Baixar projeto completo** guarda circuito, HEX, nome e entradas de teste em um JSON. **Abrir projeto** restaura tudo em pausa. Os arquivos não incluem o estado de execução da CPU.

**Exemplos da turma** também guarda o programa junto do circuito. A publicação continua protegida pela mesma senha dos exemplos do CAD. Exemplos antigos, contendo apenas circuitos, continuam compatíveis e descarregam o programa anterior ao abrir.

## Escopo do modelo

Executa instruções AVR do HEX em flash de 256 KiB, SRAM de 8 KiB começando em `0x200`, PC de 22 bits e clock de 16 MHz. Portas A–L (sem I) seguem a variante oficial do Mega; A0–A15 também podem operar como digitais 54–69.

Configurados: GPIO, interrupções externas INT0–INT7, temporizadores 0–5/PWM, ADC de 16 entradas simples e Serial/Serial1/Serial2/Serial3 (transmissão no monitor). O modelo não é uma réplica completa da placa: não integra SPI, I²C, USB, EEPROM, watchdog, ADC diferencial, captura externa de timers ou recepção serial por fios. Bibliotecas que exigem esses recursos não são garantidas. O `.hex` não identifica a placa-alvo; é responsabilidade do usuário selecionar Mega na IDE.

A CPU avança pelo tempo do Falstad, não por um relógio independente. PWM é amostrado no passo do circuito; use passo máximo de 5 µs nos exemplos. Passos maiores que 12,5 ms pausam a execução, evitando travar o navegador. Uma máquina lenta pode simular mais devagar que o tempo real. Trocar de aba do portal pausa ambos.

## Hospedagem e manutenção

Publique a pasta `mega`, `index.html`, `portal-integration.js`, `examples-library.js` e `library-api.php` atualizados. O motor fica local em `vendor/avr8js`; não depende de CDN, Node ou compilador no HostGator. A biblioteca pública continua usando PHP e os arquivos protegidos de `config`.

AVR8js **0.21.1**, licença MIT preservada em `vendor/avr8js/LICENSE`. Distribuição ESM do pacote npm, somente com extensões `.js` acrescentadas aos imports para funcionar diretamente no navegador. Os adaptadores estão em `mega-core.mjs`; não alteram o motor.

Fontes: [Arduino Mega 2560](https://docs.arduino.cc/hardware/mega-2560), [mapa oficial de pinos](https://github.com/arduino/ArduinoCore-avr/blob/master/variants/mega/pins_arduino.h), [AVR8js](https://github.com/wokwi/avr8js). Registradores e vetores conferidos em `avr-libc/iomxx0_1.h` da ferramenta oficial Arduino AVR GCC.

## Verificação

- `node mega-core.test.mjs`: executa os HEX reais; verifica temporização de `delay`, entrada D22, saída D13, Serial, ADC A15 e PWM D44.
- `build-examples.mjs`: utilitário de desenvolvimento para recompilar os exemplos usando Arduino AVR Core 1.8.6 e AVR GCC 7.3.0. Define-se `ARDUINO_PACKAGES` para a pasta `packages/arduino` local. Não é executado pelo site.
- `browser.test.cjs`: teste com Edge/Playwright, contra cópia isolada do site em `MEGA_QA_URL`; `MEGA_QA_PASSWORD` habilita o teste de publicação e exclusão do próprio exemplo de teste. Nunca apontar esse teste para a biblioteca de produção.

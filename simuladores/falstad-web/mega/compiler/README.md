# Compilador Arduino Mega no navegador

O editor usa AVR GCC e binutils em WebAssembly, em um Worker descartado ao terminar. Nenhum código do aluno sai do navegador. O site serve apenas arquivos estáticos; não precisa executar Node, Arduino CLI ou processos no HostGator. O firmware Intel HEX resultante continua sendo executado pelo emulador Mega existente.

Alvo fixo: ATmega2560, 16 MHz, 256 KiB de flash e 8 KiB de SRAM. Compila uma aba `.ino` em C++11, com inclusão automática de Arduino.h e protótipos para funções simples. Funções com assinaturas C++ complexas podem precisar de declaração explícita antes do uso. Não aceita upload de bibliotecas ou projetos com várias abas. Inclui Arduino AVR Core 1.8.6 e LiquidCrystal 1.0.7 (LCD paralelo); não inclui LiquidCrystal_I2C. As limitações dos periféricos da simulação continuam as descritas no README do Mega.

## Arquivos e origem

- `tools/`: módulos Emscripten e WASM inalterados de `@horang-corp/avr-gcc-wasm` **0.2.0**, [pacote fixado](https://registry.npmjs.org/@horang-corp/avr-gcc-wasm/-/avr-gcc-wasm-0.2.0.tgz), [repositório e avisos](https://github.com/horang-corp/avr-gcc-wasm). GCC AVR 7.3.0 e binutils, GPLv3 ou posterior. `THIRD_PARTY_NOTICES.md` preserva os avisos originais. [Fonte GCC 7.3.0](https://ftp.gnu.org/gnu/gcc/gcc-7.3.0/), [fontes e receitas do toolchain Arduino AVR](https://github.com/arduino/toolchain-avr). As adaptações dos binários WASM pertencem ao projeto de origem; os wrappers e binários não foram modificados aqui.
- `mega-assets.json`: headers e arquivos AVR6 preparados com o toolchain Arduino `7.3.0-atmel3.6.1-arduino7`. Bibliotecas de outros MCUs e informações de depuração foram removidas para reduzir o download. Cabeçalhos mantêm seus avisos de licença. [avr-libc](https://github.com/avrdudes/avr-libc), [licença/exceção da biblioteca de runtime GCC](https://www.gnu.org/licenses/gcc-exception-3.1.html).
- `arduino-sources.json`: fontes correspondentes aos objetos Arduino e LiquidCrystal, com os cabeçalhos distribuídos em `mega-assets.json`. [ArduinoCore-avr 1.8.6](https://github.com/arduino/ArduinoCore-avr/tree/1.8.6), [LiquidCrystal 1.0.7](https://github.com/arduino-libraries/LiquidCrystal/tree/1.0.7). LGPL 2.1 ou posterior, conforme avisos nas fontes. Textos GPL/LGPL acompanham esta pasta.
- `prepare-assets.mjs`: receita local para regenerar os headers, arquivo do core/LCD e bibliotecas AVR6. `ARDUINO_PACKAGES` aponta para `packages/arduino`; `LIQUIDCRYSTAL_PATH` aponta para `LiquidCrystal/src`. Rodar só no desenvolvimento; publicar os resultados estáticos.
- `worker.mjs`, `client.mjs` e `preprocess.mjs`: integração do CircuitLab. Compilação tem limite de 120 segundos e 200 mil caracteres. Falha de compilação não substitui o firmware anterior e o editor alterado exige recompilação antes de executar.

Publique **toda a pasta compiler**, incluindo WASM, assets e avisos, junto do painel, CSS, integração e `library-api.php` atualizados. O download inicial é aproximadamente 20 MB sem compressão. A compilação é feita sob demanda, não ao abrir a página. O navegador deve suportar módulos Worker e WebAssembly; use HTTP/HTTPS, não `file://`.

## Verificação

`node browser.test.cjs`, com servidor local em `127.0.0.1:8034`, compila .ino reais e verifica LED, Serial, ADC A15/PWM, upload .ino, protótipos, LCD paralelo, erro de sintaxe e restauração de código. Não publica exemplos nem usa contas externas.

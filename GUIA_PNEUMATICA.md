# Grupo Pneumática

Abra index.html e selecione Automação → Grupo Pneumática. Funciona offline.

- Simples ação: pressão no avanço e retorno por mola de força constante idealizada.
- Dupla ação: pressão nos dois sentidos; a haste reduz a área útil de retorno.
- Altere diâmetro, haste, curso, pressão, frequência e rendimento. A mola é configurável no modo simples ação e seu valor também é usado na tabela comparativa.
- Comande avanço, retorno e ciclo automático. Ao sair da área, o movimento é congelado.

## Cálculos
A = π D² / 4; A anular = π (D² − d²) / 4, em mm².
F teórica [kgf] = pressão manométrica [bar] × área [mm²] / 98,0665.
F útil = F teórica × rendimento; no avanço simples ação, desconta-se a mola, com resultado mínimo zero.
V [L] = área [mm²] × curso [mm] / 1.000.000.
Ar livre por ciclo = volume alimentado × (p + 1,01325) / 1,01325.
Simples ação alimenta apenas o avanço; dupla ação soma avanço e retorno. Um ciclo é uma ida e uma volta. L/min = L/ciclo × ciclos/min.

Mesma temperatura na conversão de ar livre. Não inclui volumes mortos, vazamentos, tubulações ou contrapressão. O retorno por mola é idealizado sem atrito. A velocidade da animação é didática, independente da frequência informada.
Referência: https://www.festo.com/ca/en/s/air-consumption

## Roteiro de aula
1. Com D = 50 mm, haste = 20 mm, curso = 200 mm, pressão = 6 bar e rendimento = 90%, observe 108,12 kgf no avanço, 90,82 kgf no retorno e 5,001 L/ciclo em dupla ação.
2. Passe para simples ação: com mola de 5 kgf, o avanço oferece 103,12 kgf e o consumo cai para 2,718 L/ciclo.
3. Dobre o diâmetro e discuta por que a força teórica quadruplica.
4. Resolva a missão de 100 kgf úteis com menos de 3 L/ciclo. Exemplo: mantenha as medidas iniciais, mas reduza o curso para 100 mm.
5. Zere a pressão: o cilindro não avança. No modo simples, a mola ainda permite retorno.

Verificação automatizada: verificacao/testar-pneumatica.cjs. Relatório e capturas na mesma pasta.

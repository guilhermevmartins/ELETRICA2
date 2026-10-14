# DPS — Um caminho para o surto

Abra `index.html` e selecione **DPS · Proteção contra surtos**, ou abra `simuladores/dps.html` diretamente. Funciona offline, com identidade vermelha e cartucho ilustrado sem marca comercial.

## Experiência em sala

1. Mostre a ligação em paralelo na vista Circuito. A alimentação da carga segue por L e N.
2. Aplique o preset de 4 kV. Observe o impulso e o ramo que conduz pelo MOV.
3. Abra Gráficos: compare a tensão sem proteção, a tensão na carga e a corrente desviada. A tensão residual não é zero.
4. Retire o DPS pelo seletor e aplique o mesmo impulso. Compare os picos.
5. Explore Por dentro e Explodida; selecione carcaça, varistor, desconector térmico, indicador e terminais.
6. Demonstre fim de vida. A alimentação permanece, mas o ramo de proteção fica desconectado. Aplique outro surto e depois substitua o cartucho virtual.
7. Use o desafio para distinguir a limitação do DPS da interrupção de um disjuntor e da detecção diferencial do DR.

O botão Pausar congela a experiência. A troca de módulo também congela o ensaio. Reiniciar restaura as condições iniciais. As métricas e os gráficos conservam o último impulso aplicado; mudanças nos controles só entram no próximo ensaio.

## Modelo didático

Rede de 230 V eficaz, representada durante o impulso por 0,325 kV, perto do pico senoidal. Fonte com impedância resistiva de 2 Ω. Pulso positivo `f(t)=(t/8)*exp(1-t/8)` em microssegundos, sem pretensão de reproduzir a forma normativa 8/20.

O MOV usa a aproximação `U = 0,75 + 0,12*I`, com U em kV e I em kA. A corrente é `max(0,(Ufonte-0,75)/2,12)`, e `Ucarga=Ufonte-2*I`. Sem DPS, I no ramo é zero. A carga é idealizada como alta impedância durante o impulso. A energia não desaparece: há dissipação no MOV e participação da fonte e do circuito de retorno.

Fim de vida é um cenário didático independente; não se infere durabilidade a partir do número de surtos ou da amplitude selecionada. Não há previsão de falha da carga, tensão de contato, parâmetros de instalação ou garantia de proteção. As ligações L–PE são conceituais e dependem do esquema real de aterramento. Uc, Up, In e Imax são explicados na própria tela; os parâmetros da equação não são dados certificados de um fabricante.

Referências técnicas: [DPS em paralelo — Schneider Electric](https://www.se.com/us/en/download/document/SPD-WP-SVPSPD/) e [degradação e proteção térmica — Schneider Electric](https://blog.se.com/energy-management-energy-efficiency/electrical-safety/2022/08/10/common-causes-of-spd-degradation/).

Código: `assets/dps.js`, `assets/dps.css`, `simuladores/dps.html`. Capa vetorial: `assets/dps-capa.svg`. Registro no menu: `assets/catalogo.js`. Verificação automatizada: `verificacao/testar-dps.cjs`.

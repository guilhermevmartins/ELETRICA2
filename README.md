# EletroLab — laboratório didático interativo

Abra **index.html** no navegador. A nova página inicial apresenta cinco áreas: **Instalação predial**, **Comandos elétricos**, **Eletrônica digital**, **Eletrônica analógica** e **Automação**. Instalação predial reúne Disjuntor DIN, DR, DPS, Condutores e Aterramento; Comandos elétricos reúne Motor trifásico e Disjuntor-motor; Eletrônica digital tem seu laboratório; Automação contém o Grupo Pneumática. Eletrônica analógica permanece em preparação. Use **Áreas de estudo** para voltar à página inicial. Os ensaios ficam pausados ao sair, e seus estados são preservados até recarregar a página. Links diretos como `index.html#din` continuam funcionando.

O projeto usa HTML, CSS, JavaScript e Canvas, sem dependências de execução, rede ou servidor. O tema vermelho é inspirado no SENAI, mantendo a composição escura do primeiro simulador.

**Ao copiar para outro computador, leve a pasta completa.** Agora o projeto é modular; não basta copiar somente `index.html`.

## Organização

```
index.html                         Tela inicial e áreas dos módulos
assets/
  areas.js / areas.css             Áreas de estudo e visual da página inicial
  catalogo.js                       Registro dos equipamentos e cartões
  portal.js                        Abas, navegação e preservação das sessões
  portal.css                       Estilo da tela de seleção
  base.css                         Base visual dos simuladores
  tema.css                         Tema vermelho compartilhado
  modulo.js                        Altura automática e pausa ao sair da aba
  motor.js                         Modelo e desenho do disjuntor-motor
  motor.css                        Ajustes visuais desse módulo
  dr.js / dr.css                   Modelo e vistas do DR, sinais e desafios
  dps.js / dps.css                 DPS vermelho, surto, anatomia e comparação
  dps-capa.svg                     Ilustração vetorial do cartucho
  condutor.js / condutor.css       Aquecimento, agrupamento e gráficos de bitolas
  condutor-dados.js                Dados do recorte NBR 5410:2004 e fontes
  condutor-capa.svg                Ilustração do condutor de cobre
  curvas.js                        Curvas tempo-corrente e comparação dinâmica
  curvas.css                       Estilo dos gráficos e cartões de resultado
  din-tabs.js / din-tabs.css        Abas internas de funcionamento e gráficos do DIN
simuladores/
  disjuntor-din.html                Simulador anterior preservado
  disjuntor-motor.html              Novo simulador tripolar
  dr.html                          DR / IDR tetrapolar, 30 e 300 mA
  dps.html                         DPS com varistor e ramo em paralelo
  condutor.html                    Condutores: instalação, fatores e capacidade
  curvas.html                      Conteúdo da aba interna de gráficos do DIN
GUIA_DIDATICO.md                    Roteiro do módulo DIN
GUIA_DISJUNTOR_MOTOR.md             Roteiro do módulo motor
GUIA_CURVAS.md                      Roteiro dos gráficos B, C e D
GUIA_DR.md                          Roteiro do DR e desafios para a turma
GUIA_DPS.md                         Roteiro do DPS e limites do modelo
GUIA_CONDUTORES.md                  Roteiro, fontes das tabelas e modelo térmico
verificacao/                       Testes e capturas; dispensáveis para executar
```

As imagens originais continuam na raiz, sem alterações. O PowerPoint também foi preservado. Os documentos e o PowerPoint não são necessários à execução; as imagens utilizadas pelo portal e pelo módulo motor devem acompanhar o projeto.

## Acrescentar novos equipamentos

1. Crie uma página em `simuladores`, por exemplo `contator.html`, e seu código próprio em `assets`.
2. Use `../assets/base.css` e `../assets/tema.css` para manter a identidade visual.
3. Carregue `../assets/modulo.js` antes do script do módulo, ambos com `defer`. Esse script funciona também ao abrir a página diretamente.
4. No avanço do modelo, interrompa a integração quando `!window.labActive` ou quando a pausa manual estiver ativa. Mantenha o estado em memória na página; o portal preserva a mesma instância ao trocar de aba.
5. Adicione um objeto a `window.LAB_MODULES` em `assets/catalogo.js`, com os campos do exemplo:

```javascript
{
  id: 'contator',
  title: 'Contator',
  short: 'Contator',
  category: 'COMANDOS ELÉTRICOS',
  number: '04',
  file: 'simuladores/contator.html',
  image: 'contator.png',
  imageClass: 'motor',
  description: 'Descrição curta do que o aluno poderá explorar.',
  tags: ['Bobina', 'Contatos', 'Acionamento']
}
```

O portal gerará o cartão, a aba e a área do módulo. `id` deve ser único; ajuste a classe da imagem se a referência exigir outra proporção. O exemplo não cria um módulo pronto de contator.

## Navegação

Os endereços `index.html#inicio`, `index.html#din`, `index.html#motor` e `index.html#dr` abrem cada seção diretamente. Voltar/avançar do navegador funciona. As setas esquerda/direita, Home e End navegam pelas abas quando uma delas está focada. No celular, a barra de abas permite rolagem horizontal.

Cada ensaio congela quando sua aba fica inativa e retoma ao voltar, mantendo a pausa manual. Não há gravação permanente: recarregar a página reinicia as sessões. Nenhum dado é enviado a serviços externos.

## Verificação

`verificacao/testar-laboratorio.cjs` exercita os dois modelos no Edge com Playwright: partida, ajuste térmico, sobrecarga, curto, falta de fase, abertura conjunta, rearme, pausa e troca de abas; verifica também seleção anatômica, navegação por teclado e largura de tela móvel. O caminho do Playwright no script corresponde ao ambiente de desenvolvimento e pode ser adaptado em outro computador. Essa ferramenta é necessária apenas para rodar os testes, não para usar o laboratório.

Os relatórios em `verificacao/resultado-laboratorio.json` e as capturas registram a verificação. Modelos destinados a ensino, sem finalidade de dimensionamento ou reprodução de ensaios reais.

O módulo de gráficos possui testes adicionais em `verificacao/testar-curvas.cjs`, com relatório `verificacao/resultado-curvas.json`: comparação de tempos, pontos magnéticos, corrente zero, entrada limitada, mudança de corrente nominal, pausa, aceleração e troca de abas.

O DR tem verificação própria em verificacao/testar-dr.cjs, com capturas das quatro vistas e relatório resultado-dr.json. Os arquivos dps.png e dps_por_dentro.png são as referências de DR fornecidas pelo usuário e permanecem com seus nomes originais.

## Aterramento

O módulo **Aterramento · TT, TN e IT** compara TT, TN-S, TN-C, TN-C-S e IT por meio de desenhos coloridos, percursos animados e um questionário. Consulte GUIA_ATERRAMENTO.md para o roteiro e as referências. Abra index.html#aterramento para acesso direto.

## Grupo Pneumática
Automação agora inclui o Grupo Pneumática: cilindros de simples e dupla ação, força em kgf, consumo de ar livre em L/ciclo e L/min, animação e desafios. Consulte GUIA_PNEUMATICA.md. Acesso direto: index.html#pneumatica.

## Motor trifásico
Comandos elétricos inclui Motor trifásico · Campo e bobinas, com duas abas: campo girante/polos e bobinas/fechamentos. Há controles de frequência, sequência, escorregamento, 6/12 pontas, tensão e exercícios de montagem. Consulte GUIA_MOTOR_TRIFASICO.md. Acesso direto: index.html#trifasico.

### Oficina de bobinagem
O Motor trifásico possui uma terceira aba, Montar o enrolamento: exemplos de 2/4/6/8 polos, colocação progressiva do cobre, emendas internas, fechamento e tabela de ranhuras. Consulte GUIA_BOBINAGEM.md.

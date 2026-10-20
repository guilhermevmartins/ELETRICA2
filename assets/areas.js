window.LAB_AREAS = [
  {
    "id": "predial",
    "title": "Instalação predial",
    "subtitle": "Energia em cada ambiente",
    "description": "Explore a iluminação, a proteção dos circuitos, os condutores e a distribuição de energia nas edificações.",
    "topics": "Tipos de interruptores · Disjuntores · DR · DPS · Condutores · Aterramento",
    "modules": [
      "interruptor-simples",
      "interruptor-paralelo",
      "interruptor-intermediario",
      "interruptor-duplo-triplo",
      "interruptor-tomada",
      "interruptor-bipolar",
      "interruptor-dimmer",
      "din",
      "dr",
      "dps",
      "condutor",
      "aterramento"
    ],
    "groups": [
      {
        "id": "grupo-interruptores",
        "title": "Tipos de interruptores",
        "description": "Escolha o circuito que deseja demonstrar. Acione os interruptores e acompanhe o caminho da corrente até as lâmpadas.",
        "image": "assets/images/interruptores-grupo.png?v=2",
        "imageAlt": "Interruptor de parede",
        "tags": [
          "7 atividades",
          "Circuitos interativos",
          "Comando e iluminação"
        ],
        "modules": [
          "interruptor-simples",
          "interruptor-paralelo",
          "interruptor-intermediario",
          "interruptor-duplo-triplo",
          "interruptor-tomada",
          "interruptor-bipolar",
          "interruptor-dimmer"
        ]
      }
    ],
    "icon": "M8 29 24 15 40 29M12 26v19h24V26M21 45V33h7v12M29 15V9h7v12"
  },
  {
    "id": "comandos",
    "title": "Comandos elétricos",
    "subtitle": "Controle e proteção de motores",
    "description": "Explore o motor trifásico por dentro, identifique os dados da placa e calcule suas grandezas. Estude campos, bobinas, fechamentos e proteção.",
    "topics": "Motor trifásico · Placa de identificação · Cálculos · Fechamentos · Proteção",
    "modules": [
      "cade-web",
      "motor-vistas",
      "trifasico",
      "placa-motor",
      "placa-motor-atividade",
      "motor"
    ],
    "icon": "M9 20h27v20H9zM36 25h8v10h-8M14 15v5M21 15v5M28 15v5M15 40v5M30 40v5M15 26v8M22 26v8M29 26v8"
  },
  {
    "id": "digital",
    "title": "Eletrônica digital",
    "subtitle": "Da lógica aos circuitos",
    "description": "Comece pelos bits e avance até circuitos que calculam, guardam informações e controlam sequências. Experimente cada etapa.",
    "topics": "Portas lógicas · Somadores · Flip-flops · Contadores",
    "modules": [
      "digital"
    ],
    "icon": "M17 15h14v26H17zM10 20h7M10 28h7M10 36h7M31 20h7M31 28h7M31 36h7M22 9v6M27 9v6M22 41v6M27 41v6"
  },
  {
    "id": "analogica",
    "title": "Eletrônica analógica",
    "subtitle": "Sinais, componentes e circuitos",
    "description": "Investigue os materiais condutores: altere dimensões e temperatura, compare resultados e conecte a experiência às fórmulas.",
    "topics": "Resistência · Resistividade · Condutividade · Coeficiente térmico",
    "modules": [
      "materiais-condutores"
    ],
    "icon": "M6 28h7l3-9 5 18 6-18 5 18 3-9h7M9 44h30M9 11h30"
  },
  {
    "id": "pneumatica",
    "title": "Pneumática",
    "subtitle": "Do ar comprimido ao movimento",
    "description": "Explore os compressores, os atuadores e as válvulas. Abra um grupo e escolha a experiência para demonstrar na lousa.",
    "topics": "Compressores · Atuadores · Válvulas · Lógica pneumática",
    "modules": [
      "pneumatica",
      "valvulas",
      "valvula-e",
      "valvula-ou",
      "retencao",
      "retencao-pilotada",
      "reguladora-fluxo",
      "escape-rapido",
      "compressor-pistao",
      "compressor-membrana",
      "compressor-rolo",
      "compressor-palhetas",
      "compressor-parafuso",
      "compressor-scroll",
      "compressor-roots",
      "compressor-anel-liquido",
      "compressor-centrifugo",
      "compressor-axial",
      "compressor-pistoes-axiais"
    ],
    "groups": [
      {
        "id": "grupo-compressores",
        "title": "Compressores",
        "description": "Descubra 11 mecanismos em corte: movimente as peças, acompanhe o gás e compare os princípios de compressão.",
        "image": "assets/images/compressor-rolo-capa.svg",
        "imageAlt": "Compressor rotativo em corte",
        "tags": [
          "11 mecanismos",
          "Cortes animados",
          "Aula passo a passo"
        ],
        "modules": [
          "compressor-pistao",
          "compressor-membrana",
          "compressor-rolo",
          "compressor-palhetas",
          "compressor-parafuso",
          "compressor-scroll",
          "compressor-roots",
          "compressor-anel-liquido",
          "compressor-centrifugo",
          "compressor-axial",
          "compressor-pistoes-axiais"
        ]
      },
      {
        "id": "grupo-atuadores",
        "title": "Atuadores pneumáticos",
        "description": "Estude cilindros de simples e dupla ação, movimento, força e consumo de ar.",
        "modules": [
          "pneumatica"
        ]
      },
      {
        "id": "grupo-valvulas",
        "title": "Válvulas pneumáticas",
        "description": "Explore as válvulas direcionais, as funções lógicas e o controle do ar comprimido.",
        "modules": [
          "valvulas",
          "valvula-e",
          "valvula-ou",
          "retencao",
          "retencao-pilotada",
          "reguladora-fluxo",
          "escape-rapido"
        ]
      }
    ],
    "icon": "M17 8h14v12H17zM5 36h14v12H5zM29 36h14v12H29zM24 20v8M12 36v-8h24v8M20 14h8"
  },
  {
    "id": "automacao",
    "title": "Automação",
    "subtitle": "Sistemas que medem e atuam",
    "description": "Uma área para estudar sensores, controle e integração de sistemas automatizados.",
    "topics": "Sensores · Controle · Sistemas automatizados",
    "modules": [],
    "icon": "M17 8h14v12H17zM5 36h14v12H5zM29 36h14v12H29zM24 20v8M12 36v-8h24v8M20 14h8"
  },
  {
    "id": "metrologia",
    "title": "Metrologia",
    "subtitle": "Aprenda a medir com precisão",
    "description": "Explore instrumentos de medição e aprenda a ler as escalas. Movimente o paquímetro e descubra como o nônio revela as frações do milímetro.",
    "topics": "Paquímetro · Nônio · Milímetros e polegadas",
    "modules": [
      "paquimetro"
    ],
    "icon": "M8 23h34v9H8zM13 12v34h-5V23M26 12v34h5V32M18 25v5M23 25v5M33 25v5M38 25v5"
  }
];

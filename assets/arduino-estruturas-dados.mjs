// Exemplos fechados e rastros didáticos; não interpreta código arbitrário nem usa eval.
export const lessons=[];
const setup=`setup|void setup() {
mode|  pinMode(13, OUTPUT);
pwmMode|  pinMode(9, OUTPUT);
inputMode|  pinMode(2, INPUT_PULLUP);
serial|  Serial.begin(9600);
setupEnd|}`;
function add(id,title,goal,tip,body,run,extra={}){
 const source=[extra.globals||'',extra.functions||'',setup,'loop|void loop() {',body,'loopEnd|}'].filter(Boolean).join('\n');
 const lines=[],map={};for(const row of source.split('\n')){const cut=row.indexOf('|');if(cut<0)throw Error('Linha sem identificador');const key=row.slice(0,cut);if(map[key])throw Error('Identificador repetido');map[key]=lines.length+1;lines.push(row.slice(cut+1));}
 lessons.push({id,title,goal,tip,lines,map,run,...extra});
}
class Trace{
 constructor(lesson,input){this.lesson=lesson;this.input=input;this.frames=[];this.state={vars:{},led:false,pwm:0,time:0,serial:[],stack:['inicialização'],cycle:0};}
 step(key,text,patch={}){Object.assign(this.state,patch);const line=this.lesson.map[key];if(!line)throw Error('Linha inexistente: '+key);this.frames.push({...structuredClone(this.state),line,text,condition:null});if(this.frames.length>600)throw Error('Limite didático excedido');}
 set(key,name,value,text){this.state.vars[name]=value;this.step(key,text);}
 test(key,expression,value){this.step(key,expression+' → '+(value?'VERDADEIRO: siga pelo caminho indicado.':'FALSO: o caminho será desviado.'));this.frames.at(-1).condition={expression,value:!!value};return value;}
 print(key,value){this.state.serial.push(String(value));this.step(key,'Serial.println envia '+JSON.stringify(String(value))+' ao monitor serial.');}
 led(key,value){this.step(key,'digitalWrite(13, '+(value?'HIGH':'LOW')+'): o LED do pino 13 '+(value?'acende.':'apaga.'),{led:!!value});}
 wait(key,ms){this.step(key,'delay('+ms+'): o fluxo principal espera '+ms+' ms. Aqui avançamos o relógio virtual, sem esperar esse tempo real.',{time:this.state.time+ms});}
 drop(key,names,text){names.forEach(n=>delete this.state.vars[n]);this.step(key,text);}
}
export function buildTrace(lesson,input={analog:600,pressed:false,mode:1}){
 const t=new Trace(lesson,input);lesson.init?.(t);
 t.step('setup','setup() é chamado uma única vez após iniciar ou reiniciar.',{stack:['setup()']});
 t.step('mode','Configura o pino 13 como saída. Configurar não é acender.');t.step('pwmMode','Configura o pino 9 como saída PWM neste exemplo de Arduino Uno.');t.step('inputMode','INPUT_PULLUP: botão aberto é HIGH; pressionado, ligado ao GND, é LOW.');t.step('serial','Inicializa a comunicação serial em 9600 bits/s.');t.step('setupEnd','setup() terminou. O Arduino passa a chamar loop().');
 for(let cycle=1;cycle<=(lesson.cycles||2);cycle++){t.step('loop','Início da passagem '+cycle+' por loop(). setup() não é chamado novamente.',{cycle,stack:['loop()']});lesson.run(t);t.step('loopEnd','Fim desta passagem: o Arduino chamará loop() novamente. Variáveis locais deixam de existir.',{vars:Object.fromEntries(Object.entries(t.state.vars).filter(([k])=>(lesson.persistent||[]).includes(k)))});if(lesson.tick)t.state.time+=lesson.tick;}
 return t.frames;
}
add('estrutura','01 · setup() e loop()','Entenda por que configurar acontece uma vez, mas piscar se repete.','As chaves delimitam blocos. O ponto e vírgula encerra uma instrução. O fim de loop() não desliga o Arduino.',`on|  digitalWrite(13, HIGH);
wait1|  delay(500);
off|  digitalWrite(13, LOW);
wait2|  delay(500);`,t=>{t.led('on',true);t.wait('wait1',500);t.led('off',false);t.wait('wait2',500);});
add('variaveis','02 · Variáveis e contas','Veja cada atribuição substituir o valor anterior.','int guarda inteiros: 5 / 2 resulta em 2. O sinal = atribui; == compara. ++ soma um.',`a|  int contador = 0;
b|  contador = contador + 2;
c|  contador++;
d|  int metade = 5 / 2;
e|  float media = 5.0 / 2.0;
f|  Serial.println(contador);
g|  Serial.println(media);`,t=>{t.set('a','contador',0,'Cria contador e guarda 0.');t.set('b','contador',2,'Lê 0, calcula 0 + 2 e guarda 2.');t.set('c','contador',3,'contador++ altera 2 para 3.');t.set('d','metade',2,'Divisão de dois inteiros: a parte fracionária é descartada.');t.set('e','media',2.5,'Divisão em ponto flutuante: resultado 2,5.');t.print('f',3);t.print('g','2.50');});
add('if','03 · if / else','A leitura do sensor escolhe um de dois caminhos.','Somente um ramo é executado. Mudar o controle A0 reinicia a demonstração com a nova entrada.',`read|  int leitura = analogRead(A0);
check|  if (leitura >= 512) {
on|    digitalWrite(13, HIGH);
else|  } else {
off|    digitalWrite(13, LOW);
end|  }
print|  Serial.println(leitura);`,t=>{t.set('read','leitura',t.input.analog,'analogRead(A0) copia a entrada atual para leitura.');if(t.test('check',t.input.analog+' >= 512',t.input.analog>=512))t.led('on',true);else{t.step('else','A condição foi falsa: entre no bloco else.');t.led('off',false);}t.step('end','Os dois caminhos se reencontram após o if.');t.print('print',t.input.analog);});
add('elseif','04 · else if','Classifique a entrada em três faixas, na ordem dos testes.','Ao encontrar uma condição verdadeira, os demais ramos são ignorados.',`read|  int leitura = analogRead(A0);
low|  if (leitura < 341) {
p1|    Serial.println("Baixo");
mid|  } else if (leitura < 682) {
p2|    Serial.println("Medio");
else|  } else {
p3|    Serial.println("Alto");
end|  }`,t=>{const n=t.input.analog;t.set('read','leitura',n,'Guarda a entrada A0.');if(t.test('low',n+' < 341',n<341))t.print('p1','Baixo');else if(t.test('mid',n+' < 682',n<682))t.print('p2','Medio');else{t.step('else','Nenhuma condição anterior foi verdadeira.');t.print('p3','Alto');}t.step('end','Fim da escolha; nenhum outro ramo é executado.');});
add('logica','05 · Comparações e lógica','Combine o botão com o sensor usando &&, || e !.','&& exige ambas verdadeiras; || aceita pelo menos uma; ! inverte. O botão usa INPUT_PULLUP, por isso pressionado corresponde a LOW.',`read|  int leitura = analogRead(A0);
button|  bool pressionado = digitalRead(2) == LOW;
and|  bool habilitado = pressionado && leitura > 500;
or|  bool alerta = leitura < 100 || leitura > 900;
not|  bool bloqueado = !habilitado;
out|  digitalWrite(13, habilitado);
print|  Serial.println(alerta);`,t=>{const n=t.input.analog,p=t.input.pressed;t.set('read','leitura',n,'Captura A0.');t.set('button','pressionado',p,'digitalRead(2) retorna '+(p?'LOW':'HIGH')+'; comparar com LOW resulta em '+p+'.');t.set('and','habilitado',p&&n>500,p?'true && ('+n+' > 500) → '+(n>500):'false && ... → false; a segunda expressão não precisa ser avaliada (curto-circuito).');t.set('or','alerta',n<100||n>900,n<100?'A primeira comparação é true: || não avalia a segunda.':n+' < 100 é false; testa '+n+' > 900.');t.set('not','bloqueado',!(p&&n>500),'! inverte o valor de habilitado.');t.led('out',p&&n>500);t.print('print',Number(n<100||n>900));});
add('ternario','06 · Operador ternário','Escolha um valor com condição ? valorA : valorB.','O operador ternário escolhe uma expressão. Aqui 255 e 0 controlam o PWM do pino 9.',`read|  int leitura = analogRead(A0);
choose|  int brilho = leitura >= 512 ? 255 : 0;
write|  analogWrite(9, brilho);`,t=>{const n=t.input.analog,b=n>=512?255:0;t.set('read','leitura',n,'Lê o sensor.');t.set('choose','brilho',b,n+' >= 512 é '+(n>=512)+': escolhe '+b+'.');t.step('write','PWM em D9: '+b+'/255. Não é uma tensão analógica contínua num Uno.',{pwm:b});});
for(const fall of [false,true])add(fall?'switch-fall':'switch',fall?'08 · switch sem break':'07 · switch / case','Selecione o modo e acompanhe a entrada no case correspondente.',fall?'Sem break, o fluxo continua no próximo case, sem testar novamente o valor.':'break sai do switch. default atende valores que não correspondem a nenhum case.',`read|  int modo = ${'MODE'};
switch|  switch (modo) {
case0|    case 0:
off|      digitalWrite(13, LOW);
break0|      break;
case1|    case 1:
on|      digitalWrite(13, HIGH);
break1|      ${fall?'// sem break: continua no case 2':'break;'}
case2|    case 2:
print2|      Serial.println("Modo 2");
break2|      break;
default|    default:
printDefault|      Serial.println("Modo invalido");
end|  }`,t=>{const n=t.input.mode;t.set('read','modo',n,'O modo escolhido na entrada é '+n+'.');t.step('switch','switch procura o case com valor '+n+'.');if(n===0){t.step('case0','Encontrou case 0.');t.led('off',false);t.step('break0','break: salta para depois do switch.');}else if(n===1){t.step('case1','Encontrou case 1.');t.led('on',true);if(!fall)t.step('break1','break: case 2 será ignorado.');else{t.step('case2','Não há break: continua no case 2 mesmo com modo = 1.');t.print('print2','Modo 2');t.step('break2','Sai do switch.');}}else if(n===2){t.step('case2','Encontrou case 2.');t.print('print2','Modo 2');t.step('break2','Sai do switch.');}else{t.step('default','Nenhum case corresponde: executa default.');t.print('printDefault','Modo invalido');}t.step('end','Continua após o switch.');});
add('for','09 · for','Leia o cabeçalho em três momentos: iniciar, testar e incrementar.','i começa em 0. Com i < 3, o corpo executa para 0, 1 e 2, nunca para 3.',`for|  for (int i = 0; i < 3; i++) {
print|    Serial.println(i);
on|    digitalWrite(13, HIGH);
wait1|    delay(200);
off|    digitalWrite(13, LOW);
wait2|    delay(200);
end|  }`,t=>{t.set('for','i',0,'INICIALIZAÇÃO: int i = 0 acontece uma vez.');while(t.test('for',t.state.vars.i+' < 3',t.state.vars.i<3)){t.print('print',t.state.vars.i);t.led('on',true);t.wait('wait1',200);t.led('off',false);t.wait('wait2',200);t.step('end','Fim do corpo: vai ao incremento do for.');t.set('for','i',t.state.vars.i+1,'INCREMENTO: i++ ocorre antes do próximo teste.');}t.drop('end',['i'],'Teste falso: sai do for; i era local ao laço e deixa de existir.');});
for(const post of [false,true])add(post?'do':'while',post?'11 · do…while':'10 · while',post?'Observe o corpo executar antes do primeiro teste.':'Observe o teste acontecer antes de cada repetição.',post?'Mesmo se a condição for falsa, do…while executa pelo menos uma vez. Compare com while usando contador inicial 3.':'Se o contador começar em 3, o corpo não executará nenhuma vez. Sem alterar a condição, um while pode nunca terminar.',`init|  int contador = MODE;
start|  ${post?'do {':'while (contador < 3) {'}
print|    Serial.println(contador);
inc|    contador++;
end|  ${post?'} while (contador < 3);':'}'}`,t=>{t.set('init','contador',t.input.mode,'Começa com o valor escolhido: '+t.input.mode+'.');if(post){t.step('start','do: entra no corpo sem testar.');do{t.print('print',t.state.vars.contador);t.set('inc','contador',t.state.vars.contador+1,'Incrementa o contador.');}while(t.test('end',t.state.vars.contador+' < 3',t.state.vars.contador<3));}else{while(t.test('start',t.state.vars.contador+' < 3',t.state.vars.contador<3)){t.print('print',t.state.vars.contador);t.set('inc','contador',t.state.vars.contador+1,'Incrementa para aproximar o fim do laço.');t.step('end','Retorna ao teste do while.');}}});
for(const skip of [false,true])add(skip?'continue':'break',skip?'13 · continue':'12 · break',skip?'Pule uma repetição, sem encerrar o laço.':'Encerre o laço antes do limite do for.',skip?'No for, continue leva ao incremento e depois ao teste.':'break encerra somente o laço ou switch mais interno.',`for|  for (int i = 0; i < 5; i++) {
check|    if (i == 2) {
jump|      ${skip?'continue':'break'};
endif|    }
print|    Serial.println(i);
endfor|  }
after|  Serial.println("Depois do for");`,t=>{t.set('for','i',0,'Inicializa i.');while(t.test('for',t.state.vars.i+' < 5',t.state.vars.i<5)){if(t.test('check',t.state.vars.i+' == 2',t.state.vars.i===2)){t.step('jump',skip?'continue: pula Serial.println(i) nesta repetição.':'break: sai do for, sem fazer i++ de novo.');if(!skip)break;}else{t.step('endif','Condição falsa: não executa o salto.');t.print('print',t.state.vars.i);t.step('endfor','Fim do corpo.');}t.set('for','i',t.state.vars.i+1,'Incrementa i e volta a testar.');}t.drop('after',['i'],'Agora está fora do laço; i deixa de existir.');t.print('after','Depois do for');});
add('funcoes','14 · Funções e return','Entre na função, veja o parâmetro e retorne para quem chamou.','return encerra a função atual e devolve um valor. A definição da função não executa só por estar escrita antes de setup().',`call|  int resultado = dobro(3);
print|  Serial.println(resultado);`,t=>{t.step('call','Antes de atribuir resultado, chama dobro(3).');t.step('fn','Entra em dobro; o argumento 3 é copiado para o parâmetro valor.',{stack:['loop()','dobro(3)']});t.set('fn','valor',3,'Na entrada da função, o parâmetro local valor recebe 3.');t.step('return','return valor * 2 calcula 6 e devolve ao ponto da chamada.');delete t.state.vars.valor;t.step('call','Retorna para loop(); o parâmetro local deixa de existir.',{stack:['loop()']});t.set('call','resultado',6,'A chamada vale 6; guarda 6 em resultado.');t.print('print',6);},{functions:`fn|int dobro(int valor) {
param|  // valor é um parâmetro local
return|  return valor * 2;
fnEnd|}`});
add('vetores','15 · Vetores e laços aninhados','Percorra um vetor; cada repetição externa executa todo o laço interno.','Índices começam em 0. Um vetor de 3 posições tem índices 0, 1 e 2. O laço interno reinicia a cada nova rodada externa.',`array|  int niveis[3] = {0, 128, 255};
outer|  for (int rodada = 0; rodada < 2; rodada++) {
inner|    for (int i = 0; i < 3; i++) {
value|      int brilho = niveis[i];
write|      analogWrite(9, brilho);
wait|      delay(300);
endInner|    }
endOuter|  }`,t=>{t.set('array','niveis',[0,128,255],'Cria o vetor com três posições.');t.set('outer','rodada',0,'Inicializa o laço externo.');while(t.test('outer',t.state.vars.rodada+' < 2',t.state.vars.rodada<2)){t.set('inner','i',0,'A cada rodada, o laço interno começa com i = 0.');while(t.test('inner',t.state.vars.i+' < 3',t.state.vars.i<3)){const b=t.state.vars.niveis[t.state.vars.i];t.set('value','brilho',b,'niveis['+t.state.vars.i+'] contém '+b+'.');t.step('write','PWM muda para '+b+'/255.',{pwm:b});t.wait('wait',300);t.drop('endInner',['brilho'],'Fim deste corpo interno: brilho deixa de existir.');t.set('inner','i',t.state.vars.i+1,'Incremento do laço interno.');}t.drop('endOuter',['i'],'Terminou o laço interno.');t.set('outer','rodada',t.state.vars.rodada+1,'Incrementa o laço externo.');}t.drop('endOuter',['rodada'],'Sai do laço externo.');});
add('millis','16 · millis() sem bloquear','Compare um teste de tempo com a espera de delay().','O relógio é virtual. Entre passagens desta aula avançamos 100 ms; um Arduino real não limita loop() a esse intervalo. A subtração unsigned preserva o padrão de comparação após a volta do contador.',`now|  unsigned long agora = millis();
check|  if (agora - anterior >= 200UL) {
store|    anterior = agora;
toggle|    estado = !estado;
write|    digitalWrite(13, estado);
end|  }
print|  Serial.println("Continuo trabalhando");`,t=>{const now=t.state.time;t.set('now','agora',now,'millis() lê '+now+' ms desde o início virtual.');if(t.test('check',now+' - '+t.state.vars.anterior+' >= 200',now-t.state.vars.anterior>=200)){t.set('store','anterior',now,'Guarda o instante desta troca.');t.set('toggle','estado',!t.state.vars.estado,'Inverte o estado do LED.');t.led('write',t.state.vars.estado);}t.step('end','O teste terminou sem bloquear o restante do programa.');t.print('print','Continuo trabalhando');},{globals:`globalTime|unsigned long anterior = 0;
globalState|bool estado = false;`,persistent:['anterior','estado'],cycles:6,tick:100,init:t=>{t.set('globalTime','anterior',0,'Inicializa a variável global anterior antes de setup().');t.set('globalState','estado',false,'Inicializa estado; globais persistem entre chamadas de loop().');}});
add('goto','17 · goto e rótulos','Conheça o salto direto para um rótulo dentro da mesma função.','goto existe em C++, mas costuma dificultar a leitura. Prefira if, laços e funções. Aqui ele aparece apenas para reconhecer a sintaxe.',`read|  int leitura = analogRead(A0);
check|  if (leitura < 512) {
goto|    goto fim;
end|  }
print|  Serial.println("Entrada alta");
label|fim:
after|  Serial.println("Fim da passagem");`,t=>{t.set('read','leitura',t.input.analog,'Lê A0.');if(t.test('check',t.input.analog+' < 512',t.input.analog<512))t.step('goto','Salta diretamente para o rótulo fim; a impressão intermediária é ignorada.');else{t.step('end','Não há salto: continua em sequência.');t.print('print','Entrada alta');}t.step('label','Rótulo fim: é um destino de salto, não uma função.');t.print('after','Fim da passagem');});
export function codeFor(lesson,input){return lesson.lines.map(line=>line.replace(/\bMODE\b/g,String(input.mode)));}

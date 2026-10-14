'use strict';
const D=window.DigitalLogic,$=id=>document.getElementById(id);
const lessons=[
 ['Fundamentos','PRIMEIROS PASSOS','Um bit, duas possibilidades.','Acione cada bit e descubra como quatro posições representam os números de 0 a 15.'],
 ['Portas lógicas','DECISÕES ELEMENTARES','O que faz uma porta lógica?','Mude as entradas e acompanhe a saída. A tabela-verdade mostra todas as combinações possíveis.'],
 ['Álgebra e mapas','COMBINE E SIMPLIFIQUE','A mesma função, caminhos diferentes.','Compare expressões equivalentes e monte uma função no mapa de Karnaugh de duas variáveis.'],
 ['Combinacionais','CIRCUITOS QUE PROCESSAM','Selecionar, somar, comparar e mostrar.','Aqui a saída depende das entradas atuais. Escolha um circuito e experimente suas combinações.'],
 ['Latches e flip-flops','CIRCUITOS QUE LEMBRAM','Como guardar um único bit?','Altere as entradas, controle o clock e compare a resposta imediata com a memória acionada por borda.'],
 ['Registradores e controle','COMBINAÇÕES MAIS AVANÇADAS','De um bit a uma sequência.','Junte memórias para contar, deslocar informações e percorrer os estados de um controlador.'],
 ['Desafios','APLIQUE O QUE APRENDEU','Preveja antes de acionar.','Resolva situações curtas e confira a explicação. Volte às experiências sempre que precisar.']
];
const gateInfo={
 BUF:['BUFFER · Repetidor','Y = A','Repete o estado da entrada. Não inverte o sinal.','Observe: ao mudar A, Y acompanha. Em componentes reais, buffers também ajudam a acionar cargas lógicas.'],
 NOT:['NOT · NÃO','Y = ¬A','Inverte o estado: 0 vira 1 e 1 vira 0.','A bolinha no símbolo indica inversão. Experimente os dois estados de A.'],
 AND:['AND · E','Y = A · B','A saída só é 1 quando as duas entradas são 1.','Analogia: uma máquina recebe permissão quando a proteção está fechada E o comando está ativo.'],
 OR:['OR · OU','Y = A + B','A saída é 1 quando pelo menos uma entrada é 1.','Analogia: uma indicação acende se o sensor A OU o sensor B detectar uma condição.'],
 NAND:['NAND · NÃO E','Y = ¬(A · B)','É a inversão de AND. A saída só é 0 quando as duas entradas são 1.','Porta universal: combinações de NAND podem construir qualquer função booleana. NAND(A, A) funciona como NOT.'],
 NOR:['NOR · NÃO OU','Y = ¬(A + B)','É a inversão de OR. A saída só é 1 quando as duas entradas são 0.','Também é universal. NOR(A, A) inverte A; a realimentação entre duas NOR pode formar um latch SR.'],
 XOR:['XOR · OU exclusivo','Y = A ⊕ B','Com duas entradas, a saída é 1 quando elas são diferentes.','No meio somador, XOR calcula o bit da soma: 1 + 1 produz soma 0 e transporte 1.'],
 XNOR:['XNOR · Equivalência','Y = ¬(A ⊕ B)','Com duas entradas, a saída é 1 quando elas são iguais.','Funciona como um comparador de igualdade de um bit. Compare as linhas 00 e 11.']
};
const fresh=()=>({bits:5,gate:'AND',a:1,b:0,c:0,select:0,combin:'adder',boolean:'demorgan',map:[0,1,1,1],memoryType:'d',ma:0,mb:0,en:1,q:0,clk:0,hist:[],systemType:'counter',value:0,serial:1,enable:1,sclk:0,shist:[],question:0,answer:null});
let s=fresh(),lesson=0,auto=false,timer=null;
const bit=(key,label,value=s[key])=>`<button class="bit" id="bit-${key}" data-bit="${key}" aria-pressed="${!!value}" aria-label="${label}: ${value}. Alternar">${label}<strong>${value}</strong></button>`;
const lamp=(label,value)=>`<span class="lamp ${value===1?'on':''}" data-output="${label}">${label} = ${value===null?'X':value}</span>`;
const select=(id,label,options,value)=>`<label for="${id}">${label}</label><select id="${id}" data-select="${id}">${options.map(([v,t])=>`<option value="${v}" ${v===value?'selected':''}>${t}</option>`).join('')}</select>`;
const cards=items=>`<div class="cards">${items.map(([title,body])=>`<article><h3>${title}</h3><p>${body}</p></article>`).join('')}</div>`;
function wire(path,value){return `<path class="wire ${value?'high':'low'}" d="${path}"/>`;}
function svg(content,desc){return `<svg viewBox="0 0 640 280" role="img" aria-label="${desc}">${content}</svg>`;}
function valueCircle(x,y,label,value){return `<circle cx="${x}" cy="${y}" r="24" fill="${value?'#16845d':'#52667f'}"/><text x="${x}" y="${y+6}" text-anchor="middle" style="fill:white;font-weight:700">${value===null?'X':value}</text><text x="${x}" y="${y-38}" text-anchor="middle" class="small">${label}</text>`;}
function gateShape(type){
 const invert=['NOT','NAND','NOR','XNOR'].includes(type),base=['BUF','NOT'].includes(type)?'tri':['AND','NAND'].includes(type)?'and':'or';
 let shape=base==='tri'?'<path class="chip" d="M255 70L390 140L255 210Z"/>':base==='and'?'<path class="chip" d="M250 65H320A75 75 0 0 1 320 215H250Z"/>':'<path class="chip" d="M247 65Q343 60 402 140Q343 220 247 215Q289 140 247 65Z"/>';
 if(type==='XOR'||type==='XNOR')shape+='<path d="M232 65Q274 140 232 215" fill="none" stroke="#344d6c" stroke-width="3"/>';
 if(invert)shape+=`<circle class="bubble" cx="${base==='tri'?400:base==='and'?405:412}" cy="140" r="10"/>`;
 return shape;
}
function gateDrawing(){
 const unary=['BUF','NOT'].includes(s.gate),y=D.gates[s.gate](s.a,s.b);
 return svg(`${wire(unary?'M105 140H260':'M105 100H265',s.a)}${unary?'':wire('M105 180H265',s.b)}${wire('M390 140H538',y)}${gateShape(s.gate)}<text x="320" y="146" class="gate-label" text-anchor="middle">${s.gate}</text>${valueCircle(80,unary?140:100,'A',s.a)}${unary?'':valueCircle(80,180,'B',s.b)}${valueCircle(565,140,'Y · saída',y)}<text x="320" y="256" text-anchor="middle" class="small">Cinza: 0 · Verde: 1 · A bolinha significa inversão</text>`,`${s.gate}: A ${s.a}${unary?'':`, B ${s.b}`}, saída ${y}`);
}
function bitsView(){
 const bits=[3,2,1,0].map(i=>(s.bits>>i)&1);
 return `<div class="grid"><section class="panel"><span class="badge">CLIQUE NOS BITS PARA MUDAR O NÚMERO</span><div class="binary">${bits.map((v,j)=>`<button id="binary-${3-j}" data-binary="${3-j}" aria-pressed="${!!v}" aria-label="Bit ${3-j}, peso ${2**(3-j)}: ${v}. Alternar"><b>${v}</b><small>peso ${2**(3-j)}</small></button>`).join('')}</div><div class="sum">${bits.map((v,j)=>`${v} × ${2**(3-j)}`).join(' + ')} = ${s.bits}</div><div class="metrics"><div><strong id="binaryValue">${s.bits.toString(2).padStart(4,'0')}</strong><span>Binário · base 2</span></div><div><strong id="decimalValue">${s.bits}</strong><span>Decimal · base 10</span></div><div><strong>${s.bits.toString(16).toUpperCase()}</strong><span>Hexadecimal · base 16</span></div></div><p class="hint">Experimente formar o número 10. Ligue os pesos 8 e 2: <b>1010₂ = 10₁₀</b>.</p></section><aside class="panel"><h3>Como interpretar</h3><ol class="steps"><li>Cada posição guarda um <b>bit</b>: 0 ou 1.</li><li>Da direita para a esquerda, os pesos dobram: 1, 2, 4, 8…</li><li>Some apenas os pesos dos bits que estão em 1.</li><li>Com 4 bits, existem 2⁴ = 16 combinações.</li></ol><p class="tip">Aqui usamos números sem sinal. Um byte tem 8 bits e pode representar 0 a 255 nesse formato.</p></aside></div>${cards([['0 e 1 são estados','Chamamos 0 de nível baixo e 1 de nível alto. A tensão que representa cada nível depende do componente e da sua alimentação.'],['Combinacional','A saída depende das entradas atuais. Exemplos: portas lógicas, somadores e multiplexadores.'],['Sequencial','A saída também depende do estado guardado. Exemplos: flip-flops, registradores e contadores.']])}`;
}
function gatesView(){
 const unary=['BUF','NOT'].includes(s.gate),info=gateInfo[s.gate],y=D.gates[s.gate](s.a,s.b);
 let rows='';for(let i=0;i<(unary?2:4);i++){const a=unary?i:i>>1,b=i&1,out=D.gates[s.gate](a,b);rows+=`<tr class="${a===s.a&&(unary||b===s.b)?'active':''}"><td>${a}</td>${unary?'':`<td>${b}</td>`}<td><b>${out}</b></td><td><button data-row="${i}" id="row-${i}" aria-label="Aplicar entradas A ${a}${unary?'':`, B ${b}`}">Aplicar</button></td></tr>`;}
 return `<div class="grid"><section class="panel"><div class="toolbar">${select('gate','Escolha uma porta',Object.entries(gateInfo).map(([id,v])=>[id,v[0]]),s.gate)}</div><div class="controls">${bit('a','A')}${unary?'':bit('b','B')}</div><div class="board">${gateDrawing()}</div><div class="output">${lamp('Y',y)}<span>${y?'Saída em nível alto':'Saída em nível baixo'}</span></div><p>${info[2]}</p><p class="hint">${info[3]}</p></section><aside class="panel"><h3>Tabela-verdade</h3><div class="table-scroll"><table><caption>A linha verde é a combinação atual.</caption><thead><tr><th>A</th>${unary?'':'<th>B</th>'}<th>Y</th><th>Experimentar</th></tr></thead><tbody>${rows}</tbody></table></div><div class="formula">${info[1]}</div><p class="table-note">¬ significa NÃO; · significa E; + significa OU, não soma aritmética; ⊕ significa OU exclusivo.</p><p class="tip">As portas não têm uma hierarquia de “melhor” ou “mais potente”: cada uma realiza uma operação. A complexidade cresce ao combiná-las.</p></aside></div>`;
}
const expressions={
 demorgan:['De Morgan · negar AND','¬(A · B)','¬A + ¬B',(a,b)=>1-(a&b),(a,b)=>(1-a)|(1-b),'Ao negar uma expressão, troque E por OU e negue cada entrada.'],
 demorgan2:['De Morgan · negar OR','¬(A + B)','¬A · ¬B',(a,b)=>1-(a|b),(a,b)=>(1-a)&(1-b),'Ao negar OU, obtemos E entre as entradas negadas.'],
 absorption:['Absorção','A + A · B','A',(a,b)=>a|(a&b),a=>a,'A já cobre todas as situações em que A · B vale 1.'],
 xor:['OU exclusivo','¬A · B + A · ¬B','A ⊕ B',(a,b)=>((1-a)&b)|(a&(1-b)),(a,b)=>a^b,'A saída é 1 nas duas combinações em que as entradas diferem.']
};
// Índice: m0 + 2m1 + 4m2 + 8m3, com mintermos na ordem AB = 00, 01, 10, 11.
const simplified=['0','¬A · ¬B','¬A · B','¬A','A · ¬B','¬B','¬A · B + A · ¬B','¬A + ¬B','A · B','¬A · ¬B + A · B','B','¬A + B','A','A + ¬B','A + B','1'];
function booleanView(){
 const e=expressions[s.boolean],l=e[3](s.a,s.b),r=e[4](s.a,s.b),mask=s.map.reduce((n,v,i)=>n+v*(2**i),0);
 return `<div class="grid"><section class="panel"><div class="toolbar">${select('boolean','Uma regra por vez',Object.entries(expressions).map(([id,e])=>[id,e[0]]),s.boolean)}</div><div class="controls">${bit('a','A')}${bit('b','B')}</div><div class="formula">${e[1]} = ${e[2]}</div><div class="output">${lamp('Esquerda',l)}${lamp('Direita',r)}</div><p>${e[5]}</p><div class="table-scroll"><table><caption>Compare em todas as entradas, não apenas na atual.</caption><thead><tr><th>A</th><th>B</th><th>${e[1]}</th><th>${e[2]}</th></tr></thead><tbody>${[0,1,2,3].map(i=>`<tr class="${s.a===(i>>1)&&s.b===(i&1)?'active':''}"><td>${i>>1}</td><td>${i&1}</td><td>${e[3](i>>1,i&1)}</td><td>${e[4](i>>1,i&1)}</td></tr>`).join('')}</tbody></table></div><p class="hint">Duas expressões são equivalentes quando suas saídas coincidem em <b>todas</b> as linhas da tabela-verdade.</p></section><section class="panel"><h3>Seu primeiro mapa de Karnaugh</h3><p>Escolha em quais combinações Y deve valer 1. Cada célula corresponde a uma linha da tabela-verdade.</p><table class="kmap"><thead><tr><th>A ↓ / B →</th><th>B = 0</th><th>B = 1</th></tr></thead><tbody>${[0,1].map(a=>`<tr><th>A = ${a}</th>${[0,1].map(b=>{const i=2*a+b;return `<td><button data-map="${i}" id="map-${i}" aria-pressed="${!!s.map[i]}" aria-label="A ${a}, B ${b}, saída ${s.map[i]}. Alternar">${s.map[i]}</button></td>`;}).join('')}</tr>`).join('')}</tbody></table><span class="badge">EXPRESSÃO SIMPLIFICADA EM SOMA DE PRODUTOS</span><div class="formula" id="mapExpression">Y = ${simplified[mask]}</div><p class="tip">Agrupe 1s vizinhos em retângulos de 1, 2 ou 4 células. A variável que muda dentro do grupo desaparece. Diagonais não são vizinhas.</p><p class="hint">Experimente ligar apenas a linha A = 1: B muda, mas Y depende só de A. A expressão será <b>Y = A</b>.</p></section></div>${cards([['NAND é universal','NOT A = NAND(A,A). Para obter AND, inverta a saída de NAND com outra NAND de entradas unidas.'],['NOR também é universal','NOT A = NOR(A,A). Para obter OR, inverta a saída de NOR usando outra NOR de entradas unidas.'],['Por que simplificar?','Uma função equivalente pode usar menos portas. Em circuitos reais, atrasos, consumo e tecnologia também influenciam a escolha.']])}`;
}
const combinNames=[['half','Meio somador'],['adder','Somador completo'],['mux','Multiplexador 2 → 1'],['demux','Demultiplexador 1 → 2'],['decoder','Decodificador 2 → 4'],['encoder','Codificador de prioridade 4 → 2'],['compare','Comparador de 2 bits'],['display','BCD → Display de 7 segmentos']];
function blockDrawing(name,inputs,outputs){
 const inputY=i=>58+i*56,outputY=i=>58+i*56;
 return svg(`<rect class="chip" x="238" y="25" width="170" height="235" rx="14"/><text x="323" y="134" text-anchor="middle" class="gate-label">${name}</text><text x="323" y="157" text-anchor="middle" class="small">Lógica combinacional</text>${inputs.map(([label,v],i)=>`${wire(`M101 ${inputY(i)}H238`,v)}${valueCircle(77,inputY(i),'',v)}<text x="150" y="${inputY(i)-12}" text-anchor="middle">${label}</text>`).join('')}${outputs.map(([label,v],i)=>`${wire(`M408 ${outputY(i)}H539`,v)}${valueCircle(565,outputY(i),'',v)}<text x="475" y="${outputY(i)-12}" text-anchor="middle">${label}</text>`).join('')}`,`${name}. Entradas: ${inputs.map(x=>x.join('=')).join(', ')}. Saídas: ${outputs.map(x=>x.join('=')).join(', ')}`);
}
const segmentMasks=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];
function displayDrawing(n){
 const positions={a:'28,10 92,10 84,18 36,18',b:'94,14 94,78 86,70 86,22',c:'94,86 94,150 86,142 86,94',d:'28,154 92,154 84,146 36,146',e:'18,86 26,94 26,142 18,150',f:'18,14 26,22 26,70 18,78',g:'28,82 36,74 84,74 92,82 84,90 36,90'};
 return `<svg viewBox="0 0 116 175" role="img" aria-label="Display: ${n<10?n:'apagado, código BCD inválido'}"><rect width="116" height="175" rx="12" fill="#152236"/>${Object.entries(positions).map(([id,pts])=>`<polygon points="${pts}" fill="${(segmentMasks[n]||'').includes(id)?'#6bffd0':'#304159'}"/>`).join('')}</svg>`;
}
function combinView(){
 let controls='',inputs=[],outputs=[],formula='',explanation='',tryIt='',extra='';
 const bits=[(s.bits>>3)&1,(s.bits>>2)&1,(s.bits>>1)&1,s.bits&1],t=s.combin;
 if(t==='half'||t==='adder'){
  const cin=t==='half'?0:s.c,o=D.adder(s.a,s.b,cin);controls=bit('a','A')+bit('b','B')+(t==='adder'?bit('c','Cin'): '');inputs=[['A',s.a],['B',s.b],...(t==='adder'?[['Cin',cin]]:[])];outputs=[['Soma',o.sum],['Cout',o.carry]];
  formula=`${s.a} + ${s.b}${t==='adder'?' + '+cin:''} = ${2*o.carry+o.sum}₁₀ = ${o.carry}${o.sum}₂`;
  explanation=t==='half'?'O meio somador soma dois bits. A soma é A ⊕ B; o transporte (Cout) é A · B.':'O somador completo inclui o transporte de entrada (Cin). Soma = A ⊕ B ⊕ Cin; Cout = A·B + Cin·(A ⊕ B).';
  tryIt='Coloque todas as entradas em 1. Cout é o bit de peso 2; Soma é o bit de peso 1. Vários somadores completos podem formar um somador de vários bits.';
 }else if(t==='mux'){
  controls=bit('a','D0')+bit('b','D1')+bit('select','Seletor S');inputs=[['D0',s.a],['D1',s.b],['S',s.select]];outputs=[['Y',D.mux(s.a,s.b,s.select)]];formula='Y = ¬S · D0 + S · D1';explanation=`S = ${s.select}: a saída copia D${s.select}. A outra entrada não altera Y enquanto não for selecionada.`;tryIt='Deixe D0 = 0 e D1 = 1. Alterne somente S para trocar o caminho.';
 }else if(t==='demux'){
  controls=bit('a','Dado D')+bit('select','Seletor S');inputs=[['D',s.a],['S',s.select]];outputs=[['Y0',s.select?0:s.a],['Y1',s.select?s.a:0]];formula='Y0 = D · ¬S; Y1 = D · S';explanation=`O dado segue para Y${s.select}. A saída não selecionada fica em 0.`;tryIt='Ligue D e alterne S. Depois desligue D: as duas saídas ficam em 0.';
 }else if(t==='decoder'){
  controls=bit('a','A · peso 2')+bit('b','B · peso 1');inputs=[['A',s.a],['B',s.b]];outputs=D.decoder(s.a,s.b).map((v,i)=>['Y'+i,v]);formula=`AB = ${s.a}${s.b}₂ → Y${2*s.a+s.b} = 1`;explanation='O código de dois bits seleciona exatamente uma de quatro saídas, ativas em 1 neste modelo.';tryIt='Passe por 00, 01, 10 e 11. Observe que só uma saída fica ativa por vez.';
 }else if(t==='encoder'){
  controls=[0,1,2,3].map(i=>`<button class="bit" id="enc-${i}" data-binary="${i}" aria-pressed="${!!((s.bits>>i)&1)}">D${i}<strong>${(s.bits>>i)&1}</strong></button>`).join('');inputs=[0,1,2,3].map(i=>['D'+i,(s.bits>>i)&1]);const o=D.priority(inputs.map(x=>x[1]));outputs=[['A1',o.code>>1],['A0',o.code&1],['Válido',o.valid]];formula=o.valid?`Maior prioridade ativa: D${o.code} → ${o.code.toString(2).padStart(2,'0')}`:'Nenhuma entrada ativa → Válido = 0';explanation='D3 tem prioridade sobre D2, D1 e D0. A saída informa o índice da entrada ativa de maior prioridade.';tryIt='Ligue D1 e D3 juntos: o código é 11. Desligue tudo: Válido = 0 distingue essa situação de D0 ativo.';
 }else if(t==='compare'){
  controls=[3,2,1,0].map((i,j)=>`<button class="bit" id="cmp-${i}" data-binary="${i}" aria-pressed="${!!bits[j]}">${['A1','A0','B1','B0'][j]}<strong>${bits[j]}</strong></button>`).join('');const a=s.bits>>2,b=s.bits&3;inputs=bits.map((v,i)=>[['A1','A0','B1','B0'][i],v]);outputs=[['A > B',Number(a>b)],['A = B',Number(a===b)],['A < B',Number(a<b)]];formula=`A = ${a} e B = ${b} → A ${a>b?'>':a<b?'<':'='} B`;explanation='Cada número tem dois bits e varia de 0 a 3. Exatamente uma das três relações é verdadeira.';tryIt='Comece com A = 10₂ e B = 01₂. Depois iguale os números e observe a saída A = B.';
 }else{
  controls=[3,2,1,0].map((i,j)=>`<button class="bit" id="bcd-${i}" data-binary="${i}" aria-pressed="${!!bits[j]}">Peso ${2**i}<strong>${bits[j]}</strong></button>`).join('');formula=`Entrada ${s.bits.toString(2).padStart(4,'0')}₂ → ${s.bits<10?s.bits:'fora do BCD decimal'}`;explanation='BCD representa cada dígito decimal com quatro bits, usando apenas 0000 a 1001. Um decodificador aciona os segmentos para desenhar o dígito.';tryIt='Forme 9 (1001). Depois forme 10 (1010): o display apaga neste modelo, pois não é um dígito BCD válido.';extra=`<div class="board seven-display">${displayDrawing(s.bits)}</div>`;
 }
 return `<div class="grid"><section class="panel"><div class="toolbar">${select('combin','Escolha o circuito',combinNames,t)}</div><div class="controls">${controls}</div>${extra||`<div class="board">${blockDrawing(t==='half'?'½ SOMADOR':t==='adder'?'SOMADOR':t.toUpperCase(),inputs,outputs)}<p class="caption">Diagrama funcional: as ligações mostram os estados de entrada e saída.</p></div>`}<div class="output">${outputs.map(x=>lamp(...x)).join('')}</div></section><aside class="panel"><h3>O que o circuito faz?</h3><p>${explanation}</p><div class="formula">${formula}</div><h3>Experimente</h3><p class="hint">${tryIt}</p><p class="tip">As saídas mudam ao alterar as entradas, sem esperar clock. Esta simulação omite os pequenos atrasos reais de propagação.</p></aside></div>`;
}
const memoryNames=[['sr','Latch SR · NOR'],['latch','Latch D · Habilitação'],['d','Flip-flop D'],['jk','Flip-flop JK'],['t','Flip-flop T']];
const memoryInfo={
 sr:['Sem clock: S ativa Q; R desativa Q. S = R = 0 conserva a memória.','Ligue S, depois desligue S: Q continua em 1. Ligue R para limpar.','S R','0 0 → mantém; 1 0 → Q = 1; 0 1 → Q = 0; 1 1 → proibido.'],
 latch:['Enquanto EN = 1, Q acompanha D. Quando EN = 0, Q conserva o último valor.','Deixe EN = 1 e mude D. Feche EN em 0; altere D de novo e observe Q parado.','EN D','EN = 0 → mantém; EN = 1 → Q = D.'],
 d:['Q copia D somente na borda de subida do clock (0 → 1).','Com clock em 0, coloque D = 1. Suba o clock: Q vira 1. Mude D com clock ainda alto: Q não muda.','D','Na subida: D = 0 → Q = 0; D = 1 → Q = 1.'],
 jk:['J ativa, K limpa. Se J = K = 1, Q alterna em cada borda de subida.','Coloque J = K = 1 e dê vários pulsos. Q troca de estado uma vez por pulso.','J K','Na subida: 0 0 → mantém; 1 0 → Q = 1; 0 1 → Q = 0; 1 1 → inverte Q.'],
 t:['T = 1 faz Q alternar na borda de subida; T = 0 conserva o estado.','Ligue T e avance o clock. Q precisa de dois ciclos do clock para completar um ciclo: divisão por 2.','T','Na subida: T = 0 → mantém; T = 1 → inverte Q.']
};
function trace(history,names){
 if(!history.length)return '<p class="tip">O diagrama temporal aparecerá ao acionar as entradas ou o clock.</p>';
 const data=history.slice(-12),width=700,height=names.length*54+35,step=48;
 return `<div class="trace"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagrama temporal dos últimos ${data.length} eventos. Valores também estão no histórico abaixo.">${data.map((_,i)=>`<path class="sample-line" d="M${110+i*step} 15V${height-20}"/><text x="${112+i*step}" y="${height-5}">${i+1}</text>`).join('')}${names.map(([key,title],j)=>{const base=28+j*54;let path='',prev;data.forEach((d,i)=>{const x=110+i*step,v=d[key],y=base+(v===1?0:24);if(v===null){prev=undefined;return;}path+=(prev===undefined?'M'+x+' '+y:'H'+x+'V'+y)+'H'+(x+step);prev=v;});return `<text x="12" y="${base+18}">${title}</text><path class="signal" stroke="${['#f9c976','#8acaff','#71e4ba','#e8a2f2'][j%4]}" d="${path}"/>${data.map((d,i)=>`<text x="${122+i*step}" y="${base+16}">${d[key]===null?'X':d[key]}</text>`).join('')}`;}).join('')}</svg></div><details><summary>Histórico dos eventos (do mais antigo ao mais recente)</summary><div class="table-scroll"><table><thead><tr><th>Evento</th>${names.map(x=>`<th>${x[1]}</th>`).join('')}</tr></thead><tbody>${data.map(d=>`<tr><td>${d.event}</td>${names.map(([k])=>`<td>${d[k]===null?'X':d[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details><p class="table-note">Eixo horizontal: eventos discretos, sem escala de tempo real. X deixa uma lacuna na curva.</p>`;
}
function memoryDrawing(){
 const type=s.memoryType,ff=!['sr','latch'].includes(type),both=type==='sr'&&s.ma&&s.mb,q=both?0:s.q,qb=both?0:D.invert(s.q),name=memoryNames.find(x=>x[0]===type)[1];
 const a=type==='sr'?'S':type==='jk'?'J':type==='t'?'T':'D',b=type==='sr'?'R':'K';
 return svg(`<rect class="chip" x="240" y="30" width="160" height="215" rx="12"/>${wire('M104 78H240',s.ma)}${valueCircle(80,78,a,s.ma)}${type==='sr'||type==='jk'?wire('M104 145H240',s.mb)+valueCircle(80,145,b,s.mb):''}${type!=='sr'?wire('M104 215H240',ff?s.clk:s.en)+valueCircle(80,215,ff?'CLK':'EN',ff?s.clk:s.en):''}${ff?'<path d="M240 204L254 215L240 226" fill="none" stroke="#344d6c" stroke-width="2"/>':''}<text x="320" y="110" text-anchor="middle" class="gate-label">${type.toUpperCase()}</text><text x="320" y="137" text-anchor="middle" class="small">${ff?'Captura na subida':'Sensível a nível'}</text>${wire('M400 82H536',q===1)}${valueCircle(560,82,'Q',q)}${wire('M400 196H536',qb===1)}${valueCircle(560,196,'Q̅',qb)}`,`${name}; Q ${q===null?'desconhecido':q}; Q complementar ${qb===null?'desconhecido':qb}`);
}
function clockControls(system=false){const v=system?s.sclk:s.clk;return `<div class="controls"><button class="clock" id="clock" data-action="clock" aria-pressed="${!!v}">CLK = ${v} · ${v?'Descer ↓':'Subir ↑'}</button><button id="pulse" data-action="pulse">Dar 1 pulso ↑↓</button><button id="auto" data-action="auto" aria-pressed="${auto}">${auto?'Pausar clock':'Clock automático'}</button></div>`;}
function memoryView(){
 const t=s.memoryType,info=memoryInfo[t],ff=!['sr','latch'].includes(t),both=t==='sr'&&s.ma&&s.mb;
 return `<div class="grid"><section class="panel"><div class="toolbar">${select('memoryType','Escolha a memória',memoryNames,t)}</div><div class="controls">${bit('ma',t==='sr'?'S':t==='jk'?'J':t==='t'?'T':'D')}${t==='sr'||t==='jk'?bit('mb',t==='sr'?'R':'K'):''}${t==='latch'?bit('en','EN'):''}</div>${ff?clockControls():''}<div class="board">${memoryDrawing()}</div><div class="memory-output">${lamp('Q',both?0:s.q)}${lamp('Q̅',both?0:D.invert(s.q))}</div>${both?'<p class="feedback retry" role="status">S = R = 1 é proibido no latch NOR: Q e Q̅ ficam em 0. Se ambos forem liberados juntos, o estado final é indeterminado.</p>':s.q===null?'<p class="feedback retry">Estado desconhecido (X). Aplique apenas S ou apenas R para definir a memória.</p>':''}${t==='sr'?'<button data-action="release" id="release">Liberar S e R juntos → 00</button>':''}</section><aside class="panel"><h3>Observe quando Q muda</h3><p>${info[0]}</p><div class="formula">${info[3]}</div><p class="hint">${info[1]}</p><p class="tip">${ff?'O triângulo marca a entrada de clock. Com clock parado, até em 1, as entradas não são copiadas. A descida também não captura neste modelo.':'Latches são sensíveis a nível. O latch D fica transparente enquanto habilitado; não precisa de uma borda de clock.'}</p><p class="tip">Reiniciar experiência coloca Q = 0 como condição inicial didática; isso não representa uma entrada física de reset.</p></aside></div><section class="panel" style="margin-top:20px"><h3>Veja os sinais ao longo dos eventos</h3>${trace(s.hist,t==='sr'?[['a','S'],['b','R'],['q','Q']]:t==='latch'?[['en','EN'],['a','D'],['q','Q']]:t==='jk'?[['clk','CLK'],['a','J'],['b','K'],['q','Q']]:[['clk','CLK'],['a',t==='t'?'T':'D'],['q','Q']])}</section>${cards([['Latch ≠ flip-flop','O latch responde ao nível de habilitação. O flip-flop responde a uma transição específica do clock.'],['Setup e hold','Em circuitos reais, a entrada deve estar estável antes e depois da borda. Violar esses tempos pode causar metastabilidade.'],['Preset e clear','Alguns componentes possuem entradas assíncronas que forçam Q sem esperar clock. Elas não são simuladas aqui; consulte a folha de dados.']])}`;
}
function systemsView(){
 const t=s.systemType,bits=s.value.toString(2).padStart(4,'0'),names=['Verde','Amarelo','Vermelho'];
 const drawing=t==='fsm'?`<div class="state-row">${names.map((name,i)=>`<div class="state ${i===s.value?'current':''}"><i class="traffic-dot" style="--color:${['#17ac78','#ecc742','#ec6a78'][i]}"></i><b>${name}</b><br><small>${['00','01','10'][i]}</small></div>${i<2?'<span>→</span>':''}`).join('')}</div><p class="caption">Verde → Amarelo → Vermelho → Verde. A borda avança um estado.</p>`:`<div class="register">${bits.split('').map((v,i)=>`<div class="cell ${v==='1'?'on':''}"><small>Q${3-i}</small><strong>${v}</strong></div>${i<3&&t==='shift'?'<span>←</span>':''}`).join('')}</div><p class="caption">${t==='shift'?'Deslocamento: Q3 ← Q2 ← Q1 ← Q0 ← entrada serial. O Q3 antigo sai.':'Quatro flip-flops recebem o mesmo clock. Q3 tem peso 8; Q0 tem peso 1.'}</p>`;
 const explanation=t==='counter'?'Um contador síncrono de 4 bits soma 1 a cada subida do clock quando EN = 1. Depois de 15, volta a 0.':t==='shift'?'Cada subida desloca os bits uma posição à esquerda e insere a entrada serial em Q0. O bit que estava em Q3 é descartado.':'Uma máquina de estados combina memória, lógica de próximo estado e lógica de saída. Neste exemplo de Moore, a luz acesa depende apenas do estado atual.';
 return `<div class="grid"><section class="panel"><div class="toolbar">${select('systemType','Escolha o sistema',[['counter','Contador síncrono · 4 bits'],['shift','Registrador de deslocamento · 4 bits'],['fsm','Máquina de estados · Semáforo']],t)}</div><div class="controls">${bit('enable','EN')}${t==='shift'?bit('serial','Entrada serial'):''}</div>${clockControls(true)}<div class="board">${drawing}</div><div class="formula" id="systemValue">${t==='fsm'?'Estado: '+names[s.value]:`Q3 Q2 Q1 Q0 = ${bits}₂ = ${s.value}₁₀`}</div><p class="tip">EN = 0 conserva o estado mesmo com o clock funcionando.</p></section><aside class="panel"><h3>${t==='counter'?'Memória que conta':t==='shift'?'Informação em movimento':'Memória que controla'}</h3><p>${explanation}</p><p class="hint">${t==='counter'?'Dê 16 pulsos e observe o retorno a 0000. Q0 alterna em toda subida; os demais bits dividem a frequência sucessivamente.':t==='shift'?'Entre com 1, 0, 1, 1, dando um pulso após cada escolha. Partindo de 0000, o resultado será 1011.':'Avance três pulsos para completar a sequência. Depois desligue EN: a máquina fica no mesmo estado.'}</p>${t==='fsm'?'<p class="tip">Modelo conceitual de sequência, sem temporização de trânsito. Aqui cada pulso é uma ordem para avançar.</p>':'<p class="tip">Registradores guardam palavras binárias. Contadores acrescentam lógica para calcular o próximo valor da palavra.</p>'}</aside></div><section class="panel" style="margin-top:20px"><h3>Histórico das transições</h3>${s.shist.length?`<div class="table-scroll"><table><thead><tr><th>Evento</th><th>CLK</th><th>EN</th>${t==='shift'?'<th>Serial</th>':''}<th>Antes</th><th>Depois</th></tr></thead><tbody>${s.shist.slice(-10).map(h=>`<tr><td>${h.event}</td><td>${h.clk}</td><td>${h.enable}</td>${t==='shift'?`<td>${h.serial}</td>`:''}<td>${t==='fsm'?names[h.before]:h.before.toString(2).padStart(4,'0')}</td><td>${t==='fsm'?names[h.after]:h.after.toString(2).padStart(4,'0')}</td></tr>`).join('')}</tbody></table></div>`:'<p>Acione o clock para acompanhar cada transição.</p>'}</section>${cards([['Contador assíncrono','No contador em cascata, a saída de um flip-flop aciona o clock do seguinte. Os atrasos se acumulam. O contador simulado acima é síncrono.'],['Do registrador à memória','Agrupar bits permite guardar palavras. Memórias maiores acrescentam endereçamento e controle de leitura e escrita.'],['Próximo passo: sistemas programáveis','Processadores, CLPs e FPGAs combinam lógica, memória e controle. As ideias desta trilha são a base para estudá-los.']])}`;
}
const questions=[
 ['Qual número decimal é representado por 1010₂?',['8','10','12'],1,'Os bits ligados têm pesos 8 e 2: 8 + 2 = 10.'],
 ['AND recebe A = 1 e B = 0. Qual é Y?',['0','1'],0,'AND exige que todas as entradas estejam em 1.'],
 ['Qual porta de duas entradas indica que os bits são diferentes?',['OR','XNOR','XOR'],2,'XOR vale 1 em 01 e 10; XNOR indica igualdade.'],
 ['Um somador completo recebe A = B = Cin = 1. Quais são Cout e Soma?',['Cout = 0, Soma = 1','Cout = 1, Soma = 0','Cout = 1, Soma = 1'],2,'1 + 1 + 1 = 3 = 11₂: o transporte e a soma valem 1.'],
 ['No latch D, EN = 1 e D muda de 0 para 1. O que ocorre?',['Q acompanha D','Q espera uma borda','Q sempre fica em 0'],0,'O latch D é transparente enquanto EN = 1.'],
 ['No flip-flop D desta aula, Q = 0 e CLK está parado em 1. D muda para 1. Qual é Q?',['1 imediatamente','0 até a próxima subida do clock'],1,'Nível alto não é uma nova borda. O flip-flop captura D na transição 0 → 1.'],
 ['Com J = K = 1, o flip-flop JK faz o quê a cada subida?',['Entra em estado proibido','Alterna Q','Mantém Q'],1,'JK alterna com 11. A condição proibida 11 discutida na aula pertence ao latch SR com NOR.'],
 ['Um contador de 4 bits está em 1111 e EN = 1. Após uma subida, qual é o estado?',['0000','1111','10000'],0,'O contador de 4 bits retorna a zero após 15. Um quinto bit seria necessário para guardar 16.']
];
function quizView(){
 const q=questions[s.question],answered=s.answer!==null,correct=s.answer===q[2];
 return `<div class="grid"><section class="panel"><span class="badge">DESAFIO ${s.question+1} DE ${questions.length}</span><h3 style="margin-top:15px">${q[0]}</h3><div class="quiz-options">${q[1].map((answer,i)=>`<button id="answer-${i}" data-answer="${i}" aria-pressed="${s.answer===i}">${answer}</button>`).join('')}</div>${answered?`<div class="feedback ${correct?'good':'retry'}" role="status"><b>${correct?'Acertou!':'Vamos rever.'}</b> ${q[3]}</div>`:''}<button id="nextQuiz" data-action="nextQuiz" ${answered?'':'disabled'}>${s.question===questions.length-1?'Recomeçar os desafios ↺':'Próximo desafio →'}</button></section><aside class="panel"><h3>Aprender é experimentar</h3><p>Antes de responder, desenhe as entradas e preveja a saída. Depois confira no simulador.</p><ol class="steps"><li>Identifique se o circuito tem memória.</li><li>Se tiver, anote o estado anterior.</li><li>Verifique se há habilitação ou borda ativa.</li><li>Calcule o próximo estado.</li></ol><p class="hint">Você pode trocar a resposta e reler a explicação. Use as etapas acima para testar sua hipótese.</p></aside></div>`;
}
const views=[bitsView,gatesView,booleanView,combinView,memoryView,systemsView,quizView];
function render(){
 const focused=document.activeElement?.id;
 $('workspace').innerHTML=views[lesson]();
 if(focused&&$(focused))$(focused).focus({preventScroll:true});
 if(typeof publishHeight==='function')requestAnimationFrame(publishHeight);
}
function stopAuto(){clearInterval(timer);timer=null;auto=false;}
function go(index,focus=false){
 stopAuto();lesson=index;
 $('lessons').innerHTML=lessons.map((l,i)=>`<button id="lesson-${i}" data-lesson="${i}" ${i===lesson?'aria-current="step"':''}><b>0${i+1}</b>${l[0]}</button>`).join('');
 $('level').textContent=lessons[lesson][1];$('lessonTitle').textContent=lessons[lesson][2];$('lessonIntro').textContent=lessons[lesson][3];
 $('previous').disabled=lesson===0;$('next').disabled=lesson===lessons.length-1;$('position').textContent=`Etapa ${lesson+1} de ${lessons.length}`;
 render();if(focus)$('lesson-'+lesson).focus({preventScroll:true});
}
function recordMemory(event){s.hist.push({event,clk:s.clk,a:s.ma,b:s.mb,en:s.en,q:s.memoryType==='sr'&&s.ma&&s.mb?0:s.q});s.hist=s.hist.slice(-12);}
function updateMemory(rising,event){s.q=D.memory(s.memoryType,s.q,{a:s.ma,b:s.mb,en:s.en},rising);recordMemory(event);}
function setClock(value){
 if(lesson===4){const rising=!s.clk&&!!value;s.clk=value;updateMemory(rising,rising?'Subida ↑':'Descida ↓');}
 else{const rising=!s.sclk&&!!value,before=s.value;s.sclk=value;s.value=D.system(s.systemType,s.value,{enable:s.enable,serial:s.serial},rising);s.shist.push({event:rising?'Subida ↑':'Descida ↓',clk:s.sclk,enable:s.enable,serial:s.serial,before,after:s.value});s.shist=s.shist.slice(-10);}
}
function announce(){
 $('announcement').textContent=lesson===4?`Q = ${s.q===null?'desconhecido':s.q}; clock ${s.clk}.`:lesson===5?`Estado ${s.value}; clock ${s.sclk}.`:lesson===1?`Saída Y = ${D.gates[s.gate](s.a,s.b)}.`:lesson===0?`Valor decimal ${s.bits}.`:'Experiência atualizada.';
}
$('lessons').addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b)go(Number(b.dataset.lesson),true);});
$('previous').onclick=()=>go(Math.max(0,lesson-1),true);$('next').onclick=()=>go(Math.min(lessons.length-1,lesson+1),true);
$('resetLesson').onclick=()=>{
 stopAuto();const f=fresh(),keys=[['bits'],['a','b'],['a','b','map'],['a','b','c','select','bits'],['ma','mb','en','q','clk','hist'],['value','serial','enable','sclk','shist'],['question','answer']][lesson];
 keys.forEach(k=>s[k]=f[k]);render();$('announcement').textContent='Experiência reiniciada.';
};
$('workspace').addEventListener('change',e=>{
 const key=e.target.dataset.select;if(!key)return;s[key]=e.target.value;
 if(key==='memoryType'){stopAuto();Object.assign(s,{ma:0,mb:0,en:1,q:0,clk:0,hist:[]});}
 if(key==='systemType'){stopAuto();Object.assign(s,{value:0,sclk:0,shist:[]});}
 render();announce();
});
$('workspace').addEventListener('click',e=>{
 const target=e.target.closest('button');if(!target)return;const d=target.dataset;
 if(d.bit){s[d.bit]=1-s[d.bit];if(lesson===4)updateMemory(false,'Entrada alterada');}
 else if(d.binary!==undefined)s.bits^=1<<Number(d.binary);
 else if(d.row!==undefined){const i=Number(d.row),unary=['BUF','NOT'].includes(s.gate);s.a=unary?i:i>>1;s.b=unary?s.b:i&1;}
 else if(d.map!==undefined)s.map[Number(d.map)]^=1;
 else if(d.answer!==undefined)s.answer=Number(d.answer);
 else if(d.action==='clock'){stopAuto();setClock(1-(lesson===4?s.clk:s.sclk));}
 else if(d.action==='pulse'){stopAuto();if(lesson===4?s.clk:s.sclk)setClock(0);setClock(1);setClock(0);}
 else if(d.action==='release'){s.ma=s.mb=0;updateMemory(false,'Liberação simultânea');}
 else if(d.action==='nextQuiz'){s.question=(s.question+1)%questions.length;s.answer=null;}
 else if(d.action==='auto'){
  if(auto)stopAuto();else{auto=true;timer=setInterval(()=>{if(!window.labActive||document.hidden){stopAuto();render();return;}setClock(1-(lesson===4?s.clk:s.sclk));render();},650);}
 }else return;
 render();if(!auto)announce();
});
window.addEventListener('lab-visibility-change',()=>{if(!window.labActive){stopAuto();render();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();render();}});
go(0);

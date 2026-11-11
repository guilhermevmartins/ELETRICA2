import {installDrawSubmenu,componentNotice} from './draw-submenu.mjs';
import {buildChip} from './chip-models.mjs?v=1';
export const chips=[
['4027','Flip-flop JK duplo','Dois flip-flops JK com set e reset assíncronos. Armazenam estados e dividem frequência.','jkff'],
['4093','Quatro NAND Schmitt de 2 entradas','Histerese nas entradas para sinais lentos, osciladores e tratamento de botões.','schmitt'],
['4082','Duas AND de 4 entradas','Cada saída fica HIGH somente quando suas quatro entradas estão HIGH.','and'],
['4066','Quatro chaves analógicas bilaterais','Quatro caminhos analógicos independentes, habilitados por controles digitais.','switch'],
['4011','Quatro NAND de 2 entradas','Saída LOW apenas quando ambas as entradas estão HIGH.','nand'],
['4081','Quatro AND de 2 entradas','Saída HIGH quando ambas as entradas estão HIGH.','and'],
['4026','Contador de década com decodificador','Conta pulsos de 0 a 9 e aciona display de sete segmentos de cátodo comum.','7segdecoder'],
['4069','Seis inversores','Cada saída é a negação lógica da entrada.','invert'],
['4052','Multiplexador analógico duplo 4:1','Seleciona um de quatro canais em cada uma de duas seções. Pode operar como demultiplexador.','mux'],
['4051','Multiplexador analógico 8:1','Seleciona um de oito canais por três bits de endereço; possui inhibit.','mux'],
['4021','Registrador de deslocamento de 8 bits','Entrada paralela ou serial e saída serial; útil para expandir entradas.','shift'],
['4013','Flip-flop D duplo','Dois flip-flops D com set e reset assíncronos. Capturam D na borda de subida.','edgedff'],
['4071','Quatro OR de 2 entradas','Saída HIGH se pelo menos uma entrada estiver HIGH.','or'],
['LM324','Quatro amplificadores operacionais','Quatro amplificadores para condicionamento, realimentação e filtros.','amp-follower'],
['LM339','Quatro comparadores','Compara tensões. Saídas de coletor aberto precisam de resistor de pull-up.','opamp'],
['4040','Contador binário de 12 estágios','Contador ripple com reset. Divide a frequência por potências de dois.','counter'],
['4029','Contador crescente/decrescente','Contador pré-ajustável de 4 bits, com seleção binário/década e sentido de contagem.','counter'],
['4001','Quatro NOR de 2 entradas','Saída HIGH somente quando ambas as entradas estão LOW.','nor'],
['4028','Decodificador BCD para decimal','Converte quatro bits BCD em uma de dez saídas ativas. Não é contador.','decoder'],
['4511','Latch e decodificador BCD para 7 segmentos','Armazena BCD e aciona display de cátodo comum; inclui teste e apagamento.','7segdecoder'],
['4009','Seis inversores/buffers','Seis inversores com função de buffer e uso em conversão de níveis conforme alimentação.','invert'],
['KK0952','Identificação pendente','O código da pasta não permite identificar com segurança o CI. É necessário conferir a marcação ou o datasheet.',null],
['LM392','Amplificador operacional + comparador','Um amplificador operacional e um comparador no mesmo encapsulamento; não são dois amplificadores iguais.','opamp'],
['LM741','Amplificador operacional','Amplificador operacional único, usado em circuitos inversores, somadores e realimentação.','amp-invert'],
['4070','Quatro XOR de 2 entradas','Saída HIGH quando as duas entradas são diferentes.','xor'],
['555','Temporizador','Modos astável e monoestável para oscilação, atrasos e geração de pulsos.','555square'],
['4030','Quatro XOR de 2 entradas','Quatro portas OU exclusivo; características elétricas diferem das do 4070.','xor'],
['74HC95','Registrador de 4 bits','Registrador com entrada paralela/serial e saída paralela, com controle de modo e clocks. Não confundir com 74HC595 de 8 bits.','shift'],
['4518','Dois contadores BCD de década','Dois contadores de 0 a 9 com saídas BCD, clock, enable e reset. Não é contador binário livre de 0 a 15.','deccounter'],
['LM7809','Regulador linear positivo de 9 V','Regulador fixo de 9 V. Exige tensão de entrada superior à saída e dissipação adequada.',null],
['4017','Contador Johnson de década','Avança uma entre dez saídas a cada pulso. Possui reset, inibição de clock e carry.','johnsonctr'],
['4019','Quatro seletores AND/OR','Cada saída implementa (A e KA) ou (B e KB), com dois controles comuns.','and']
];
export function installChipLibrary(sim){
 function add(chip){
 const model=buildChip(chip[0]);if(!model)return;
 const before=sim.exportCircuit();let bottom=64;
 for(const line of before.split('\n')){const t=line.trim().split(/\s+/);if(!/^(?:[a-zA-Z]|[0-9]+)$/.test(t[0])||t.length<6)continue;const y=Math.max(Number(t[2]),Number(t[4]));if(Number.isFinite(y))bottom=Math.max(bottom,y);if(t[0]==='410'&&/^CL_/.test(t[6]||'')){const old=buildChip(t[6].split('_')[1]);if(old)bottom=Math.max(bottom,Number(t[2])+32*Math.max(old.pins.filter(p=>p.side===2).length,old.pins.filter(p=>p.side===3).length));}}
 const y=Math.ceil((bottom+96)/16)*16;const running=sim.isRunning();
 sim.importCircuit(before+'\n'+model.dump(192,y)+'x 208 '+(y-24)+' 400 '+(y-24)+' 4 16 CI\\s'+chip[0]+'\n',false);
 sim.setSimRunning(running);componentNotice(chip[0]+' inserido. Conecte os fios aos terminais do bloco.');
 }
 installDrawSubmenu({key:'chip',label:'CIs usados nas aulas',afterKey:'arduino',items:chips.map(chip=>({label:chip[0]+' · '+chip[1],help:chip[2]+' '+chipHelp(chip[0]),disabled:chip[0]==='KK0952',action:()=>{try{add(chip);}catch(e){componentNotice(e.message);}}}))});
}

function chipHelp(code){
 const help={
 KK0952:'Aguardando identificação; inserção indisponível.',
 LM324:'4 operacionais, alimentação interna ideal 0/5 V. Ligue PLUS e MINUS; use realimentação.',
 LM741:'Operacional com alimentação interna ideal ±15 V. Sem ajuste de offset.',
 LM339:'4 comparadores de coletor aberto; coloque pull-up externo em cada OUT.',
 LM392:'Seção 1: operacional 0/5 V. Seção 2: comparador de coletor aberto, exige pull-up.',
 LM7809:'IN, GND e OUT: aproximação de 9 V com queda mínima de 2 V, sem limites térmicos ou de corrente.',
 '555':'Ligue VCC e GND. nRST deve estar alto para funcionar. TRIG, THR, CTRL e DIS permitem astável e monoestável.',
 '4027':'Dois JK na borda de subida. SET e RST ativos em HIGH. Inicialize usando RST.',
 '4013':'Dois D na borda de subida. SET e RST ativos em HIGH. Inicialize usando RST.',
 '4040':'Conta na descida de CLK; RST alto zera os 12 bits. Atrasos ripple idealizados.',
 '4017':'CLK avança Q0–Q9; INH baixo habilita, RST alto zera. CARRY para cascata.',
 '4026':'CLK, INH, RST e DE (alto habilita display). Saídas a–g, CARRY e DEO.',
 '4511':'A é o bit menos significativo. LE alto mantém o valor; nLT e nBI ficam altos no uso normal.',
 '4029':'nCE baixo habilita; UP alto sobe; BIN alto conta binário. LOAD alto carrega P0–P3.',
 '4021':'LOAD alto carrega P0–P7; LOAD baixo desloca DS na subida de CLK. Saídas Q5–Q7.',
 '74HC95':'MODE baixo: serial DS/CS. MODE alto: paralelo P0–P3/CP. Captura na descida do clock selecionado.',
 '4518':'Cada seção conta na subida de CLK com EN alto ou descida de EN com CLK baixo. RST alto zera.',
 '4051':'A é o bit menos significativo; INH alto desliga todos os canais. XCOM bidirecional.',
 '4052':'A/B selecionam o mesmo canal nos grupos X e Y. INH alto desliga ambos.',
 '4066':'EN alto fecha a chave correspondente. A e B são bidirecionais.',
 '4093':'NAND com histerese: limiares didáticos 1,66 V e 3,33 V.',
 '4009':'Seis inversores a 5 V; conversão entre diferentes alimentações não é modelada.'
 };
 return help[code]||'Ligue entradas e saídas identificadas por seção. Níveis ideais 0/5 V, sem limites reais de corrente ou atrasos de propagação.';
}

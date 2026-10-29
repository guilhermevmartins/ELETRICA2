import {sswSettings,sswSymbol} from './ssw05.mjs';
import {topology,portCount,sourceType} from './topology.mjs';
import {nativeSymbols,nativeSymbol} from './symbol-library.mjs';
export {portCount};
export const catalog = [
 {type:'ssw05',name:'WEG SSW-05 Plus',short:'Soft-starter com trimpots',group:'Potência',prefix:'SSW',code:'SSW'},
 {type:'junction',name:'Junção elétrica',short:'',group:'Conexões',prefix:'J',code:'J'},
 {type:'phase',name:'Fase / positivo',short:'Alimentação',group:'Alimentação',prefix:'L',code:'L'},
 {type:'neutral',name:'Neutro / retorno',short:'Retorno',group:'Alimentação',prefix:'N',code:'N'},
 {type:'breaker',name:'Disjuntor',short:'Proteção',group:'Proteção',prefix:'Q',code:'Q'},
 {type:'fuse',name:'Fusível',short:'Proteção',group:'Proteção',prefix:'F',code:'F'},
 {type:'switch',name:'Interruptor',short:'Chave mantida',group:'Comando',prefix:'S',code:'S'},
 {type:'buttonNO',name:'Botoeira NA',short:'Pulsador de partida',group:'Comando',prefix:'S',code:'NA'},
 {type:'buttonNC',name:'Botoeira NF',short:'Pulsador de parada',group:'Comando',prefix:'S',code:'NF'},
 {type:'contactNO',name:'Contato NA',short:'Contato auxiliar',group:'Contatos',prefix:'K',code:'13/14'},
 {type:'contactNC',name:'Contato NF',short:'Contato auxiliar',group:'Contatos',prefix:'K',code:'21/22'},
 {type:'coil',name:'Bobina / relé',short:'Contator',group:'Saídas',prefix:'KM',code:'A1/A2'},
 {type:'lamp',name:'Sinalizador',short:'Lâmpada piloto',group:'Saídas',prefix:'H',code:'H'},
 {type:'motor',name:'Motor',short:'Acionamento lógico',group:'Saídas',prefix:'M',code:'M'},
 {type:'timerOn',name:'Temporizador TON',short:'Retardo ao ligar',group:'Temporização',prefix:'KT',code:'TON'},
 {type:'timerOff',name:'Temporizador TOF',short:'Retardo ao desligar',group:'Temporização',prefix:'KT',code:'TOF'},
 {type:'counter',name:'Contador',short:'Contagem de pulsos',group:'Temporização',prefix:'C',code:'CTU'},
 ...[
 ['earth','Terra de proteção','Alimentação','PE'],['phaseN','Fase + neutro','Alimentação','X'],['phase3','Alimentação trifásica','Alimentação','X'],['phase3N','Trifásica + neutro','Alimentação','X'],
 ['fuse2','Fusível bipolar','Proteção','F'],['fuse3','Fusível tripolar','Proteção','F'],['fuse4','Fusível tetrapolar','Proteção','F'],
 ['breaker2','Disjuntor bipolar','Proteção','Q'],['breaker3','Disjuntor tripolar','Proteção','Q'],['breaker4','Disjuntor tetrapolar','Proteção','Q'],
 ['contactor2','Contator bipolar','Contatos','KM'],['contactor3','Contator tripolar','Contatos','KM'],['contactor4','Contator tetrapolar','Contatos','KM'],
 ['switchNC','Interruptor NF','Comando','S'],['switchChange','Chave comutadora','Comando','S'],['contactChange','Contato reversível','Contatos','K'],['buttonChange','Botoeira comutadora','Comando','S'],
 ['motor3','Motor trifásico','Saídas','M'],['buzzer','Sinalizador sonoro','Saídas','H'],['resistor','Resistência','Saídas','R'],['timerPulse','Relé intermitente','Temporização','KT'],['relayLatch','Relé de impulso','Saídas','K']
 ].map(([type,name,group,prefix])=>({type,name,short:name,group,prefix,code:prefix})),
];
catalog.push(...nativeSymbols.map(s=>({...s,short:s.name,prefix:s.command===32865?'F':'X',code:String(s.command)})));
export const definition = type => catalog.find(c=>c.type===type);
export function getSymbolBounds(c){
 if(c.type==='ssw05')return {x:-110,y:-110,width:220,height:220};
 const s=nativeSymbol(c.type),ports=topology(c).ports;
 const width=s?.width||(/^(fuse|breaker|contactor)[234]$/.test(c.type)?90:70),height=s?.height||90;
 const points=[{x:-width/2,y:-height/2},{x:width/2,y:-height/2},{x:width/2,y:height/2},{x:-width/2,y:height/2},...ports];
 const rad=(c.rotation||0)*Math.PI/180,rotated=points.map(p=>({x:p.x*Math.cos(rad)-p.y*Math.sin(rad),y:p.x*Math.sin(rad)+p.y*Math.cos(rad)}));
 const x=Math.min(...rotated.map(p=>p.x)),y=Math.min(...rotated.map(p=>p.y));
 return {x,y,width:Math.max(...rotated.map(p=>p.x))-x,height:Math.max(...rotated.map(p=>p.y))-y};
}
export const isSource = sourceType;
export const isInteractive = c => c.type==='native32865'||/^(switch|breaker|fuse|button)/.test(c.type);
export const isLoad = c => ['coil','lamp','motor','motor3','buzzer','resistor','timerOn','timerOff','timerPulse','relayLatch','counter'].includes(c.type);
export const escapeHTML = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function terminal(c,p){const q=topology(c).ports[p];if(!q)return {x:c.x,y:c.y};const rad=(c.rotation||0)*Math.PI/180;return {x:c.x+q.x*Math.cos(rad)-q.y*Math.sin(rad),y:c.y+q.x*Math.sin(rad)+q.y*Math.cos(rad)};}
export function symbol(type,active=false,color='#20ad86',input=false,variant=null){
 if(type==='ssw05')return sswSymbol();
 const native=nativeSymbol(type);if(native)return `<g class="symbol-line">${native.svg}</g>`;
 if(type==='junction')return '<circle r="3" fill="currentColor"/>';
 const stem='<path d="M0 -40V-16 M0 16V40"/>';
 let shape='';
 const multi=/^(fuse|breaker|contactor)([234])$/.exec(type);
 if(multi&&multi[1]==='breaker'){const n=Number(multi[2]),xx=Array.from({length:n},(_,i)=>(i-(n-1)/2)*20);return '<g class="symbol-line">'+xx.map(x=>`<path d="M${x} -40V-23 M${x} -5L${x+(active?0:-12)} -23 M${x} -5V6h5v7h-5v27 M${x-4} 23l8 3 -8 3"/>`).join('')+`<rect x="${xx[0]-9}" y="3" width="${(n-1)*20+18}" height="29" fill="none"/><path d="M${xx[0]-20} -15H${xx.at(-1)}" stroke-dasharray="3 3"/><rect x="${xx[0]-26}" y="-23" width="12" height="16" fill="none"/></g>`;}
 if(multi){const n=Number(multi[2]);return Array.from({length:n},(_,i)=>`<g transform="translate(${(i-(n-1)/2)*20} 0)">${symbol(multi[1]==='contactor'?'contactNO':multi[1],active,color,input)}</g>`).join('')+(multi[1]==='fuse'?'':`<path class="symbol-line" d="M${-(n-1)*10} 0H${(n-1)*10}" stroke-dasharray="3 3"/>`);}
 switch(type){
 case 'phaseN':case 'phase3':case 'phase3N':{const ports=topology({type}).ports,rails=topology({type}).rails;shape=ports.map((p,i)=>`<path d="M${p.x} -20V0 m-3 -6l3 6 3 -6"/><text x="${p.x}" y="-25" text-anchor="middle" fill="black" stroke="none" font-size="9">${rails[i]}</text>`).join('');break;}
 case 'earth':shape='<path d="M0 -15V0 M-12 0H12 M-8 5H8 M-4 10H4"/>';break;
 case 'phase':shape='<circle r="5"/><path d="M0 -5V-15 M-7 -15H7"/>';break;
 case 'neutral':shape='<circle r="5"/><path d="M0 5V15 M-7 15H7"/>';break;
 case 'fuse':shape='<path d="M0 -40V40"/><rect x="-7" y="-17" width="14" height="34" fill="white"/><path d="M0 -17V17"/>';break;
 case 'breaker':shape=`<path d="M0 -40V-14 M0 14V40 M0 -14L${active?'0':'-15'} 14 M-5 -22L5 -16 M-5 -16L5 -22 M-14 -7h-7v16h7"/>`;break;
 case 'switch':case 'switchNC':shape=`<path d="M0 -40V-14 M0 14V40 M0 14L${active?'0':'-18'} -14 M-26 -8h8"/><circle cy="-14" r="2" fill="white"/>`;break;
 case 'contactChange':case 'switchChange':case 'buttonChange':shape=`<path d="M0 40V10 L${active?20:-20} -15 M-20 -40V-15 M20 -40V-15"/>`+(type==='contactChange'?'':`<path d="M-32 -3h20 m-20 -6v12"/>`);break;
 case 'buttonNO':case 'buttonNC':case 'contactNO':case 'contactNC':{
 const closed=active; shape=closed?'<path d="M0 -40V-12H14L0 12V40"/>':'<path d="M0 -40V-12 M0 40V12L14 -6"/>';
 if(type.startsWith('button')){
  const y=input?0:-8;
  if([32914,32915].includes(variant))shape+=`<path d="M-20 ${y}h9 M-20 ${y-10}q-16 10 0 20Z"/>`;
  else if([32923,32924].includes(variant))shape+=`<circle cx="-27" cy="${y}" r="5"/><path d="M-22 ${y}H7" stroke-dasharray="3 2"/>`;
  else if([33253,33254].includes(variant))shape+='<text x="-30" y="3" font-size="11" fill="currentColor" stroke="none">P</text><path d="M-20 0H7 M-5 -5l5 5 -5 5" stroke-dasharray="3 2"/>';
  else if([33032,33020,33021,33022,33023,33024,33253,33254,33346,33347].includes(variant))shape+=`<rect x="-32" y="-12" width="15" height="18"/><text x="-25" y="1" font-size="11" text-anchor="middle" fill="currentColor" stroke="none">${[33346,33347].includes(variant)?'ϑ':[33253,33254].includes(variant)?'P':[33021,33022].includes(variant)?'C':'S'}</text><path d="M-17 -3h6"/>`;
  else shape+=`<path d="M-27 ${y-10}h10 M-27 ${y-10}v20h10"/><path d="M-27 ${y}H7" stroke-dasharray="4 3"/>`;
 }
 if([32933,32934,32941,32942].includes(variant))shape+=`<path d="M-29 -5h14 m-10 -5l-5 5 5 5 M-29 -12v14"/>`;
 break;}
 case 'coil':shape='<path d="M0 -40V-12 M0 12V40"/><rect x="-20" y="-12" width="40" height="24" fill="'+(active?'#d8f6e9':'white')+'"/>';break;
 case 'lamp':shape=stem+`<circle r="16" fill="${active?color:'white'}"/><path d="M-11 -11L11 11 M-11 11L11 -11"/>`;break;
 case 'motor':shape=stem+`<circle r="19" fill="${active?'#def5eb':'white'}"/><path d="M-8 8V-8L0 2L8 -8V8"/>`+(active?'<path d="M-25 -5A26 26 0 0 1 15 -21 M15 -21h-7 M15 -21v7" stroke="#18a481"/>':'');break;
 case 'motor3':shape=`<path d="M-20 -40V-22 M0 -40V-29 M20 -40V-22"/><circle r="29" fill="${active?'#fee':'white'}"/><text y="2" text-anchor="middle" font-size="22" fill="currentColor" stroke="none">M</text><text y="20" text-anchor="middle" font-size="13" fill="currentColor" stroke="none">3~</text>`;break;
 case 'buzzer':shape=stem+'<path d="M-14 -16v32l28 8v-48z M20 -11q12 11 0 22 M25 -16q18 16 0 32"/>';break;
 case 'resistor':shape=stem+'<rect x="-8" y="-16" width="16" height="32" fill="white"/>';break;
 case 'relayLatch':shape=stem+'<rect x="-13" y="-16" width="26" height="32" fill="white"/><path d="M-9 7l9 -14v14l9 -14"/>';break;
 case 'timerPulse':shape=stem+'<rect x="-18" y="-16" width="36" height="32" fill="white"/><path d="M-12 8v-16h8v16h8v-16h8v16"/>';break;
 case 'timerOn':case 'timerOff':shape=stem+'<rect x="-33" y="-16" width="66" height="32" fill="white"/>'+(type==='timerOn'?'<path d="M-15 -16V16 M-33 -16L-15 16 M-33 16L-15 -16"/>':'<rect x="-33" y="-16" width="18" height="32" fill="currentColor"/>');break;
 case 'counter':shape=stem+'<rect x="-30" y="-16" width="60" height="32" fill="white"/><path d="M-8 -16V16"/><circle cx="-19" cy="0" r="7"/>';break;
 }
 return `<g class="symbol-line">${shape}</g>`;
}
export const symbolSVG=(type)=>{const b=getSymbolBounds({type});return `<svg viewBox="${b.x-3} ${b.y-3} ${b.width+6} ${b.height+6}" aria-hidden="true">${symbol(type,['fuse','breaker','contactNC','buttonNC'].includes(type))}</svg>`;};
export function terminalLabel(c,p){if(c.terminalNames?.[p]!==undefined)return c.terminalNames[p];if(c.nativeCommand===32928)return ['95','96'][p];if(c.nativeCommand===32927)return ['97','98'][p];const t=topology(c);if(c.type==='ssw05')return t.ports[p].label;if(t.kind==='dcSupply')return t.ports[p].label;if(t.kind==='source')return '';if(c.type==='motor3')return ['U1','V1','W1'][p];if(['coil','timerOn','timerOff','timerPulse','relayLatch','counter'].includes(c.type))return ['A1','A2'][p];if(c.type.endsWith('Change'))return ['11','12','14'][p];if(t.ports.length>2){const n=t.ports.length/2;return p<n?String(p*2+1):String((p-n)*2+2);}if(c.type.endsWith('NC'))return ['21','22'][p];if(/^(contact|button|switch)/.test(c.type))return ['13','14'][p];return ['1','2'][p];}
function c(id,type,x,y,tag,label,extra={}){return {id,type,x,y,tag,label,ref:'',rotation:0,delay:3,preset:3,color:'#27bd90',...extra};}
function w(id,a,ap,b,bp,points=[]){return {id,from:{id:a,port:ap},to:{id:b,port:bp},points};}
export function example(name='starter'){
 const base={format:'cade-web',version:1,name:'Partida direta com selo',components:[],wires:[],annotations:[]};
 if(name==='power')return {...base,name:'Partida direta trifásica',components:[c('l3','phase3N',230,140,'X1','L1 / L2 / L3 / N'),c('q3','breaker3',220,260,'Q1','Proteção tripolar'),c('k3','contactor3',220,440,'KM1','Contator de potência',{ref:'KM1'}),c('m3','motor3',220,640,'M1','Motor trifásico'),c('stop3','buttonNC',660,280,'S0','PARAR'),c('start3','buttonNO',660,440,'S1','LIGAR'),c('seal3','contactNO',860,440,'KM1','Selo',{ref:'KM1'}),c('coil3','coil',660,620,'KM1','Bobina'),c('lamp3','lamp',1000,620,'H1','Ligado')],wires:[...Array.from({length:3},(_,i)=>[w('p'+i,'l3',i,'q3',i),w('k'+i,'q3',i+3,'k3',i),w('m'+i,'k3',i+3,'m3',i)]).flat(),w('a','q3',3,'stop3',0,[{x:500,y:300},{x:500,y:200},{x:660,y:200}]),w('b','stop3',1,'start3',0),w('c','stop3',1,'seal3',0,[{x:660,y:360},{x:860,y:360}]),w('d','start3',1,'coil3',0),w('e','seal3',1,'coil3',0,[{x:860,y:540},{x:660,y:540}]),w('f','coil3',1,'l3',3,[{x:660,y:700},{x:1100,y:700},{x:1100,y:100},{x:260,y:100}]),w('g','coil3',0,'lamp3',0,[{x:660,y:540},{x:1000,y:540}]),w('h','lamp3',1,'coil3',1,[{x:1000,y:700},{x:660,y:700}])],annotations:[{x:170,y:80,text:'POTÊNCIA TRIFÁSICA'},{x:610,y:80,text:'COMANDO · PARTIDA / PARADA COM SELO'}]};
 if(name==='starter')return {...base,components:[c('l','phase',260,140,'L','Alimentação'),c('n','neutral',260,680,'N','Retorno'),c('q','breaker',260,230,'Q1','Proteção geral'),c('stop','buttonNC',260,340,'S0','PARAR'),c('start','buttonNO',260,460,'S1','LIGAR'),c('hold','contactNO',440,460,'KM1','Selo',{ref:'KM1'}),c('relay','coil',260,600,'KM1','Contator'),c('cl','contactNO',650,340,'KM1','Auxiliar',{ref:'KM1'}),c('lamp','lamp',650,600,'H1','Ligado'),c('cm','contactNO',910,340,'KM1','Acionamento',{ref:'KM1'}),c('motor','motor',910,600,'M1','Motor lógico')],wires:[w('w1','l',0,'q',0),w('w2','q',1,'stop',0),w('w3','stop',1,'start',0),w('w4','start',1,'relay',0),w('w5','stop',1,'hold',0,[{x:260,y:400},{x:440,y:400}]),w('w6','hold',1,'relay',0,[{x:440,y:540},{x:260,y:540}]),w('w7','relay',1,'n',0),w('w8','q',1,'cl',0,[{x:260,y:280},{x:650,y:280}]),w('w9','cl',1,'lamp',0),w('w10','lamp',1,'n',0,[{x:650,y:680}]),w('w11','q',1,'cm',0,[{x:260,y:280},{x:910,y:280}]),w('w12','cm',1,'motor',0),w('w13','motor',1,'n',0,[{x:910,y:680}])],annotations:[{x:230,y:100,text:'01 / COMANDO E SELO'},{x:610,y:100,text:'02 / SINALIZAÇÃO'},{x:850,y:100,text:'03 / ACIONAMENTO'}]};
 if(name==='lamp')return {...base,name:'Interruptor e lâmpada',components:[c('l','phase',440,180,'L','Alimentação'),c('s','switch',440,340,'S1','Interruptor'),c('h','lamp',440,520,'H1','Sinalizador'),c('n','neutral',440,660,'N','Retorno')],wires:[w('a','l',0,'s',0),w('b','s',1,'h',0),w('c','h',1,'n',0)],annotations:[{x:380,y:100,text:'CIRCUITO BÁSICO / LIGAR E DESLIGAR'}]};
 if(name==='timer')return {...base,name:'Acionamento temporizado',components:[c('l','phase',340,180,'L','Alimentação'),c('s','switch',340,340,'S1','Habilitar'),c('t','timerOn',340,540,'KT1','Retardo de 3 s',{delay:3}),c('n','neutral',340,680,'N','Retorno'),c('ct','contactNO',740,340,'KT1','Contato temporizado',{ref:'KT1'}),c('h','lamp',740,540,'H1','Saída temporizada')],wires:[w('a','l',0,'s',0),w('b','s',1,'t',0),w('c','t',1,'n',0),w('d','l',0,'ct',0,[{x:740,y:180}]),w('e','ct',1,'h',0),w('f','h',1,'n',0,[{x:740,y:680}])],annotations:[{x:290,y:100,text:'01 / TEMPORIZADOR TON'},{x:680,y:100,text:'02 / SAÍDA TEMPORIZADA'}]};
 if(name==='counter')return {...base,name:'Contador de pulsos',components:[c('l','phase',340,180,'L','Alimentação'),c('s','buttonNO',340,340,'S1','Contar pulso'),c('t','counter',340,540,'C1','Contar até 3',{preset:3}),c('n','neutral',340,680,'N','Retorno'),c('ct','contactNO',740,340,'C1','Limite atingido',{ref:'C1'}),c('h','lamp',740,540,'H1','Contagem concluída')],wires:[w('a','l',0,'s',0),w('b','s',1,'t',0),w('c','t',1,'n',0),w('d','l',0,'ct',0,[{x:740,y:180}]),w('e','ct',1,'h',0),w('f','h',1,'n',0,[{x:740,y:680}])],annotations:[{x:290,y:100,text:'01 / ENTRADA DE PULSOS'},{x:680,y:100,text:'02 / SAÍDA DO CONTADOR'}]};
 return {...base,name:'Novo circuito'};
}
export function validateProject(value){
 if(!value||value.format!=='cade-web'||value.version!==1||!Array.isArray(value.components)||!Array.isArray(value.wires))throw new Error('Formato não suportado. Abra um projeto JSON exportado pelo CADe Web.');
 if(value.components.length>500||value.wires.length>1500)throw new Error('Limite de 500 componentes e 1.500 conexões por projeto.');
 const ids=new Set();const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 const components=value.components.map(c=>{if(!c||typeof c.id!=='string'||c.id.length>100||ids.has(c.id)||!definition(c.type)||!finite(c.x,0,1200)||!finite(c.y,0,840))throw new Error('Componente inválido no projeto.');ids.add(c.id);return {...(c.type==='ssw05'?{ssw:sswSettings(c)}:{}),id:c.id,type:c.type,x:c.x,y:c.y,rotation:[0,90,180,270].includes(c.rotation)?c.rotation:0,tag:String(c.tag||c.id).slice(0,30),ref:String(c.ref||'').slice(0,30),label:String(c.label||'').slice(0,60),delay:finite(c.delay,0,3600)?c.delay:3,preset:finite(c.preset,1,99999)?Math.round(c.preset):3,color:/^#[0-9a-f]{6}$/i.test(c.color)?c.color:'#27bd90',...(Number.isInteger(c.nativeCommand)?{nativeCommand:c.nativeCommand}:{}),...(Array.isArray(c.terminalNames)?{terminalNames:c.terminalNames.slice(0,portCount(c)).map(x=>String(x).slice(0,10))}:{})};});
 const byId=new Map(components.map(c=>[c.id,c]));const wireIds=new Set();
 const wires=value.wires.map(w=>{const valid=e=>e&&byId.has(e.id)&&Number.isInteger(e.port)&&e.port>=0&&e.port<portCount(byId.get(e.id));if(!w||typeof w.id!=='string'||wireIds.has(w.id)||!valid(w.from)||!valid(w.to))throw new Error('Conexão inválida no projeto.');wireIds.add(w.id);const points=Array.isArray(w.points)?w.points:[];if(points.length>100||points.some(p=>!finite(p.x,0,1200)||!finite(p.y,0,840)))throw new Error('Trajeto de conexão inválido.');return {id:w.id,from:{id:w.from.id,port:w.from.port},to:{id:w.to.id,port:w.to.port},...(/^#[0-9a-f]{6}$/i.test(w.color)?{color:w.color}:{}),points:points.map(p=>({x:p.x,y:p.y}))};});
 const annotations=(Array.isArray(value.annotations)?value.annotations:[]).slice(0,30).filter(a=>finite(a.x,0,1200)&&finite(a.y,0,840)).map(a=>({x:a.x,y:a.y,text:String(a.text||'').slice(0,80)}));
 const drawings=(Array.isArray(value.drawings)?value.drawings:[]).slice(0,500).filter(d=>d&&['line','rect','ellipse','text'].includes(d.kind)&&finite(d.x,0,1200)&&finite(d.y,0,840)&&(d.kind==='text'||finite(d.x2,0,1200)&&finite(d.y2,0,840))).map(d=>({id:String(d.id).slice(0,100),kind:d.kind,x:d.x,y:d.y,...(d.kind==='text'?{text:String(d.text||'').slice(0,150),fontSize:16}:{x2:d.x2,y2:d.y2,fill:!!d.fill}),color:/^#[0-9a-f]{6}$/i.test(d.color)?d.color:'#000000'}));
 return {...(drawings.length?{drawings}:{}),format:'cade-web',version:1,name:String(value.name||'Circuito importado').slice(0,80),components,wires,annotations};
}

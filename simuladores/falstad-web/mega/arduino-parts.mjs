import {installDrawSubmenu,componentNotice} from './draw-submenu.mjs';
import {LCD_MODEL,LCD_PINS,lcdCircuit,lcdState,stepLcd,lcdText,installLcdDrawing} from './lcd-display.mjs';

export function installArduinoParts(sim){
 const specs=[['LCD','Display LCD 16 × 2','Tela com RS, E, D4–D7. Modo paralelo de 4 bits; alimentação ideal e RW em escrita.'],['US','Sensor ultrassônico HC-SR04','TRIG na saída do Mega e ECHO na entrada.'],['IR','Sensor infravermelho de obstáculo','LOW com obstáculo, HIGH livre.'],['POT','Potenciômetro / entrada analógica','Tensão ajustável de 0 a 5 V.'],['BTN','Botão com pull-down','Botão e resistor de 10 kΩ.'],['LED','LED com resistor','LED com resistor de 1 kΩ.']];
 let distance=100,obstacle=false,voltage=2.5,trigger=false,triggerAt=0,echoStart=0,echoEnd=0,lastTime=0;
 let legacy=lcdState(),lcds=[],present=new Set();const states=new WeakMap();
 const output=document.createElement('output');output.id='arduino-lcd-text';output.setAttribute('aria-label','Texto do display LCD');output.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';document.body.append(output);
 const controls=document.createElement('div');const title=document.createElement('strong');title.textContent='Ajustes de sensores';controls.append(title);
 function range(label,min,max,value,step,change){const l=document.createElement('label'),out=document.createElement('output'),r=document.createElement('input');l.append(label+' ');out.textContent=value;r.type='range';Object.assign(r,{min,max,value,step});r.setAttribute('aria-label',label);r.oninput=()=>{out.textContent=r.value;change(Number(r.value));};l.append(out,r);controls.append(l);}
 range('Distância (cm)',2,400,100,1,v=>distance=v);range('Tensão (V)',0,5,2.5,.01,v=>voltage=v);
 const ir=document.createElement('label');ir.innerHTML='<input type="checkbox"> Obstáculo detectado';ir.querySelector('input').onchange=e=>obstacle=e.target.checked;controls.append(ir);
 installDrawSubmenu({key:'arduino',label:'Componentes Arduino',items:specs.map(([id,label,help])=>({label,help,action:()=>insert(id)})),controls});
 function scan(){const text=sim.exportCircuit();present=new Set(specs.filter(([id])=>text.includes('ARD_'+id)).map(([id])=>id));lcds=[];for(const elm of sim.getElements()){if(elm.getType()!=='CustomCompositeElm'||!String(elm.getInfo()[0]).includes(LCD_MODEL))continue;if(!states.has(elm))states.set(elm,lcdState());lcds.push({elm,state:states.get(elm)});}}
 function insert(id){scan();if(present.has(id)){componentNotice(id==='LCD'?'O LCD já está no circuito.':'Este módulo já está no circuito. Os ajustes ficam no submenu Componentes Arduino.');return;}
  const text=sim.exportCircuit();let maxY=64;for(const line of text.split('\n')){const f=line.split(' ');if(/^(?:[a-zA-Z]|[0-9]+)$/.test(f[0])&&f.length>=6)maxY=Math.max(maxY,Number(f[2])||0,Number(f[4])||0);}
  const x=192,y=Math.ceil((maxY+96)/16)*16;let lines=id==='LCD'?lcdCircuit(x,y):`x ${x-64} ${y-32} ${x+200} ${y-29} 4 16 ARD_${id}\n`;
  const label=(name,px,py)=>`207 ${px} ${py} ${px+64} ${py} 4 ${name}\n`;
  const source=(name,px,py)=>`418 ${px} ${py} ${px-48} ${py} 0 1 40 5 0 0 0.5 ${name}\n`;
  if(id==='US')lines+=label('ARD_US_TRIG',x,y)+source('ARD_US_ECHO',x,y+64);
  if(id==='IR'||id==='POT')lines+=source('ARD_'+id+'_OUT',x,y);
  if(id==='BTN')lines+=`R ${x} ${y} ${x-32} ${y} 0 0 40 5 0 0 0.5\ns ${x} ${y} ${x+80} ${y} 0 1 false\nr ${x+80} ${y} ${x+80} ${y+64} 0 10000\ng ${x+80} ${y+64} ${x+80} ${y+80} 0 0\n`+label('ARD_BTN_OUT',x+80,y);
  if(id==='LED')lines+=label('ARD_LED_IN',x,y)+`162 ${x} ${y} ${x+80} ${y} 2 default-led 1 0 0 0.01\nr ${x+80} ${y} ${x+160} ${y} 0 1000\ng ${x+160} ${y} ${x+160} ${y+32} 0 0\n`;
  const running=sim.isRunning();sim.importCircuit(text+lines,false);sim.setSimRunning(running);scan();componentNotice(id==='LCD'?'LCD inserido: ligue RS, E e D4–D7 às saídas do Mega.':'Componente inserido abaixo do circuito.');
 }
 function reset(){trigger=false;echoStart=echoEnd=0;legacy=lcdState();for(const entry of lcds)Object.assign(entry.state,lcdState());}
 const read=n=>(sim.getNodeVoltage(n)||0)>=2.5;
 const previous=sim.ontimestep;sim.ontimestep=()=>{previous?.(sim);const t=sim.getTime();if(t<lastTime)reset();lastTime=t;
  if(present.has('IR'))sim.setExtVoltage('ARD_IR_OUT',obstacle?0:5);if(present.has('POT'))sim.setExtVoltage('ARD_POT_OUT',voltage);
  if(present.has('US')){const high=read('ARD_US_TRIG');if(high&&!trigger)triggerAt=t;if(!high&&trigger&&t-triggerAt>=.000009){echoStart=t+.0002;echoEnd=echoStart+distance*.000058;}trigger=high;sim.setExtVoltage('ARD_US_ECHO',t>=echoStart&&t<echoEnd?5:0);}
  if(present.has('LCD'))stepLcd(legacy,p=>read('ARD_LCD_'+p));
  for(const {elm,state} of lcds)stepLcd(state,p=>elm.getVoltage(LCD_PINS.indexOf(p))>=2.5);
 };
 const update=sim.onupdate;sim.onupdate=()=>{update?.(sim);const text=lcds.length?lcds.map(({state})=>lcdText(state)).join('\n\n'):lcdText(legacy);if(output.textContent!==text)output.textContent=text;};
 installLcdDrawing(()=>lcds.map(({state})=>state),()=>legacy);
 const analyze=sim.onanalyze;sim.onanalyze=()=>{analyze?.(sim);scan();};scan();
}

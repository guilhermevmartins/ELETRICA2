import {rampChart} from './ssw-chart.mjs';
// Modelo didático baseado no manual WEG SSW-05 Plus, seções 4, 11–13 e 16.
// Keep terminal indices stable: saved wires and the engine refer to these indices.
export const sswPorts=[[-100,-100,'R/1L1'],[-60,-100,'S/3L2'],[-20,-100,'T/5L3'],[-100,100,'U/2T1'],[-60,100,'V/4T2'],[-20,100,'W/6T3'],[60,-100,'A1'],[100,-100,'A2'],[140,-20,'DI1'],[140,0,'DI2'],[100,100,'13'],[60,100,'14/23'],[20,100,'24']].map(([x,y,label])=>({x,y,label}));
export const sswControls=[['initial','Tensão inicial',30,80,1, '%',30],['accel','Aceleração',1,20,1,'s',10],['decel','Desaceleração',0,20,1,'s',0],['current','Corrente do motor',30,100,1,'%',100]];
export function sswSettings(c){const s={};for(const [key,,min,max,,,fallback] of sswControls)s[key]=Math.max(min,Math.min(max,Number.isFinite(Number(c.ssw?.[key]))?Number(c.ssw[key]):fallback));s.voltage=Math.max(100,Math.min(690,Number.isFinite(Number(c.ssw?.voltage))?Number(c.ssw.voltage):380));s.rated=[3,10,16,23,30,45,60,85].includes(Number(c.ssw?.rated))?Number(c.ssw.rated):30;return s;}
export function advanceSSW(c,prior={},signal,dt){
 const cfg=sswSettings(c),p={voltage:0,phase:'off',...prior};
 const resetTime=signal.reset?(p.resetTime||0)+dt:0;
 if(!signal.control)return {voltage:0,phase:'off',fault:'',resetTime:0,operation:false,full:false,ready:false};
 let fault=p.fault||'';if(signal.frontReset||resetTime>=.5)fault='';
 if(signal.enable&&!signal.power)fault='Falta de fase na entrada';
 if(fault)return {voltage:0,phase:'fault',fault,resetTime,operation:false,full:false,ready:false};
 let voltage=p.voltage,phase=p.phase;
 if(signal.enable&&signal.power){
  if(!p.operation)voltage=cfg.initial;
  voltage=Math.min(100,voltage+dt*(100-cfg.initial)/cfg.accel);phase=voltage>=100?'full':'accel';
 }else if(p.operation&&signal.power&&cfg.decel>0){voltage=Math.max(0,voltage-dt*100/cfg.decel);phase=voltage>0?'decel':'ready';}
 else{voltage=0;phase='ready';}
 return {voltage,phase,fault:'',resetTime,operation:voltage>0,full:phase==='full',ready:true};
}
export function sswSymbol(){
 const labels=['L1','L2','L3','U','V','W','A1','A2','DI1','DI2','13','14/23','24'];
 const text=(x,y,label,size=12)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none" font-family="Arial,sans-serif" font-size="${size}">${label}</text>`;
 return `<g class="symbol-line ssw-symbol"><rect x="-120" y="-70" width="240" height="140" fill="white"/>
 ${sswPorts.map((p,i)=>{
  const side=i===8||i===9,top=p.y===-100;
  const edgeX=side?120:p.x,edgeY=side?p.y:top?-70:70;
  const labelX=side?100:p.x,labelY=side?p.y:top?-58:58;
  const cell=i>=6?`<rect x="${side?80:p.x-20}" y="${side?p.y-10:top?-70:46}" width="40" height="${side?20:24}" fill="none"/>`:'';
  return `<path d="M${p.x} ${p.y}L${edgeX} ${edgeY}"/>${cell}${text(labelX,labelY,labels[i],i===11?10:12)}`;
 }).join('')}
 ${text(-30,-8,'Soft-starter',18)}${text(-30,17,'SSW-05',17)}</g>`;
}
export function sswPanel(c){const cfg=sswSettings(c);return `<section class="ssw-panel"><h3>WEG · SSW-05 Plus</h3><div id="ssw-status" aria-live="polite"></div><section class="ssw-chart"><strong id="ssw-chart-title">Prévia das rampas</strong><div id="ssw-chart"></div><div id="ssw-voltage"></div><small id="ssw-chart-note"></small></section><label class="ssw-voltage-setting">Tensão nominal de linha (V)<input type="number" data-ssw="voltage" min="100" max="690" step="1" value="${cfg.voltage}" aria-label="Tensão nominal de linha em volts"></label><div class="ssw-trimpots">${sswControls.map(([key,label,min,max,step,unit])=>`<label class="ssw-trimpot"><span>${label}</span><span class="ssw-dial" data-dial="${key}" style="--angle:${-135+270*(cfg[key]-min)/(max-min)}deg"></span><input type="range" data-ssw="${key}" min="${min}" max="${max}" step="${step}" value="${cfg[key]}" aria-label="${label}"><output data-ssw-output="${key}">${key==='decel'&&cfg[key]===0?'OFF':cfg[key]+' '+unit}</output></label>`).join('')}</div><label>Corrente nominal da SSW <select data-ssw="rated">${[3,10,16,23,30,45,60,85].map(v=>`<option ${cfg.rated===v?'selected':''} value="${v}">${v} A</option>`).join('')}</select></label><p id="ssw-current"></p><button type="button" id="ssw-reset">Reset de falha</button><p class="monitor-note">A1/A2: alimentação de comando CA. DI1 recebe A1 através da chave de partida; DI2 recebe A1 para reset (0,5 s). 13–14/23: operação. 14/23–24: tensão plena.</p><p class="monitor-note">Modelo didático de ligações e rampa de tensão. A corrente ajusta a referência nominal; correntes RMS, torque e proteções térmicas não são calculados. Faixas de tensão em volts não são verificadas pelo CAD.</p></section>`;}
export function updateSSWPanel(c,state={},history=[],live=false){const cfg=sswSettings(c),el=document.getElementById('ssw-status');if(!el)return;const names={off:'Sem alimentação de comando',ready:'Pronta · aguardando DI1',accel:'Rampa de aceleração',full:'Tensão plena · bypass',decel:'Rampa de desaceleração',fault:'Falha'};el.textContent=(state.fault||names[state.phase]||names.off)+' · '+Math.round(state.voltage||0)+'% de tensão';el.className=state.fault?'ssw-fault':'';document.getElementById('ssw-chart-title').textContent=live?'Tensão do motor · ao vivo':'Prévia das rampas';document.getElementById('ssw-chart').innerHTML=rampChart(cfg,history,live);document.getElementById('ssw-voltage').textContent=live?`${(cfg.voltage*(state.voltage||0)/100).toFixed(1)} V · ${Math.round(state.voltage||0)}%`:`Inicial: ${(cfg.voltage*cfg.initial/100).toFixed(1)} V → ${cfg.voltage} V`;document.getElementById('ssw-chart-note').textContent=live?'Últimos 60 s de simulação. Tensão calculada pelo percentual da rampa, não uma medição RMS.':'Subida '+cfg.accel+' s · patamar ilustrativo de 2 s · '+(cfg.decel?'descida '+cfg.decel+' s.':'parada sem rampa.')+' A SSW varia a tensão; a rotação real não é calculada.';document.getElementById('ssw-current').textContent=`Referência do motor: ${(cfg.rated*cfg.current/100).toFixed(1)} A (${cfg.current}% de ${cfg.rated} A)`;}

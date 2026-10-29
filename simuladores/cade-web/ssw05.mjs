// Modelo didático baseado no manual WEG SSW-05 Plus, seções 4, 11–13 e 16.
export const sswPorts=[[-40,-100,'R/1L1'],[0,-100,'S/3L2'],[40,-100,'T/5L3'],[-40,100,'U/2T1'],[0,100,'V/4T2'],[40,100,'W/6T3'],[-100,-60,'A1'],[-100,-20,'A2'],[-100,20,'DI1'],[-100,60,'DI2'],[100,-40,'13'],[100,0,'14/23'],[100,40,'24']].map(([x,y,label])=>({x,y,label}));
export const sswControls=[['initial','Tensão inicial',30,80,1, '%',30],['accel','Aceleração',1,20,1,'s',10],['decel','Desaceleração',0,20,1,'s',0],['current','Corrente do motor',30,100,1,'%',100]];
export function sswSettings(c){const s={};for(const [key,,min,max,,,fallback] of sswControls)s[key]=Math.max(min,Math.min(max,Number.isFinite(Number(c.ssw?.[key]))?Number(c.ssw[key]):fallback));s.rated=[3,10,16,23,30,45,60,85].includes(Number(c.ssw?.rated))?Number(c.ssw.rated):30;return s;}
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
export function sswSymbol(){return `<g class="symbol-line"><rect x="-75" y="-80" width="150" height="160" rx="5" fill="#f5f7fa"/>${sswPorts.map(p=>`<path d="M${p.x} ${p.y}L${Math.abs(p.x)===100?Math.sign(p.x)*75:p.x} ${Math.abs(p.y)===100?Math.sign(p.y)*80:p.y}"/>`).join('')}<text x="0" y="-48" text-anchor="middle" fill="currentColor" stroke="none" font-size="15">WEG SSW-05</text><path d="M-48 18h18l35 -35h38"/><text x="0" y="55" text-anchor="middle" fill="currentColor" stroke="none" font-size="10">SOFT-STARTER</text></g>`;}
export function sswPanel(c){const cfg=sswSettings(c);return `<section class="ssw-panel"><h3>WEG · SSW-05 Plus</h3><div id="ssw-status" aria-live="polite"></div><div class="ssw-trimpots">${sswControls.map(([key,label,min,max,step,unit])=>`<label class="ssw-trimpot"><span>${label}</span><span class="ssw-dial" data-dial="${key}" style="--angle:${-135+270*(cfg[key]-min)/(max-min)}deg"></span><input type="range" data-ssw="${key}" min="${min}" max="${max}" step="${step}" value="${cfg[key]}" aria-label="${label}"><output data-ssw-output="${key}">${key==='decel'&&cfg[key]===0?'OFF':cfg[key]+' '+unit}</output></label>`).join('')}</div><label>Corrente nominal da SSW <select data-ssw="rated">${[3,10,16,23,30,45,60,85].map(v=>`<option ${cfg.rated===v?'selected':''} value="${v}">${v} A</option>`).join('')}</select></label><p id="ssw-current"></p><button type="button" id="ssw-reset">Reset de falha</button><p class="monitor-note">A1/A2: alimentação de comando CA. DI1 recebe A1 através da chave de partida; DI2 recebe A1 para reset (0,5 s). 13–14/23: operação. 14/23–24: tensão plena.</p><p class="monitor-note">Modelo didático de ligações e rampa de tensão. A corrente ajusta a referência nominal; correntes RMS, torque e proteções térmicas não são calculados. Faixas de tensão em volts não são verificadas pelo CAD.</p></section>`;}
export function updateSSWPanel(c,state={}){const cfg=sswSettings(c),el=document.getElementById('ssw-status');if(!el)return;const names={off:'Sem alimentação de comando',ready:'Pronta · aguardando DI1',accel:'Rampa de aceleração',full:'Tensão plena · bypass',decel:'Rampa de desaceleração',fault:'Falha'};el.textContent=(state.fault||names[state.phase]||names.off)+' · '+Math.round(state.voltage||0)+'% de tensão';el.className=state.fault?'ssw-fault':'';document.getElementById('ssw-current').textContent=`Referência do motor: ${(cfg.rated*cfg.current/100).toFixed(1)} A (${cfg.current}% de ${cfg.rated} A)`;}

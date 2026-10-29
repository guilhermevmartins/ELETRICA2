// Voltage envelope only: this is not a motor speed or waveform/RMS solver.
export function rampPreview(cfg){
 const hold=2,end=cfg.accel+hold;
 return [{t:0,v:0},{t:0,v:cfg.initial},{t:cfg.accel,v:100},{t:end,v:100},{t:end+cfg.decel,v:0},{t:end+cfg.decel+1,v:0}];
}
export function recordRamp(history,time,state={}){
 const point={t:time,v:Math.max(0,Math.min(100,state.voltage||0)),phase:state.phase||'off'};
 // Keep phase transitions and instantaneous changes even at the same time.
 const last=history.at(-1);
 if(last&&point.t===last.t&&point.v===last.v&&point.phase===last.phase)return;
 if(last&&point.t>last.t&&point.t-last.t<.1&&point.phase===last.phase)return;
 history.push(point);
 while(history.length>1200||(history.length>2&&history[1].t<time-60))history.shift();
}
export function rampChart(cfg,history=[],live=false){
 const data=live?history:rampPreview(cfg),first=live?Math.max(0,(data.at(-1)?.t||0)-60):0;
 const end=live?Math.max(first+10,data.at(-1)?.t||0):data.at(-1).t;
 const x=t=>42+(t-first)/(end-first)*214,y=v=>124-v*.94;
 const points=data.filter(p=>p.t>=first),path=points.map((p,i)=>`${i?'L':'M'}${x(p.t).toFixed(2)} ${y(p.v).toFixed(2)}`).join(' ');
 const number=n=>Number(n.toFixed(1)).toLocaleString('pt-BR');
 const dot=points.at(-1);
 return `<svg viewBox="0 0 280 155" role="img" aria-label="${live?'Histórico simulado':'Prévia das rampas'} de tensão do motor em função do tempo"><text x="8" y="14">V (modelo)</text>${[0,50,100].map(v=>`<path class="ssw-grid" d="M42 ${y(v)}H256"/><text x="36" y="${y(v)+4}" text-anchor="end">${number(cfg.voltage*v/100)}</text>`).join('')}<path class="ssw-axis" d="M42 25V124H256"/>${[first,(first+end)/2,end].map(t=>`<text x="${x(t)}" y="141" text-anchor="middle">${number(t)}</text>`).join('')}<text x="275" y="153" text-anchor="end">tempo (s)</text><path class="ssw-curve ${live?'':'ssw-preview'}" d="${path}"/>${live&&dot?`<circle cx="${x(dot.t)}" cy="${y(dot.v)}" r="3" fill="#007d90"/>`:''}</svg>`;
}

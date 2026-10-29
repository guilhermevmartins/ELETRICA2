import {advanceSSW} from './ssw05.mjs';
import {topology,portCount,sourceType} from './topology.mjs';
/** Digital continuity/relay simulator with distinct phase rails. No analog calculations. */
export function simulate(circuit, previousState = {}, inputs = {}, dt = 0.05) {
  // Uma falha não pode desaparecer ao recalcular e abrir os próprios contatores.
  // Parar/reiniciar a simulação fornece um estado novo e libera o diagnóstico.
  if (previousState.shortCircuit) return previousState;
  const components = circuit.components || [];
  const byId = new Map(components.map(c => [c.id, c]));
  const errors = [];
  const source = sourceType;
  const key = (id, port) => `${id}:${port}`;
  const valid = end => end && byId.has(end.id) && Number.isInteger(end.port) && end.port >= 0 && end.port < portCount(byId.get(end.id));
  const wires = (circuit.wires || []).filter(w => {
    if (valid(w.from) && valid(w.to)) return true;
    errors.push(`Ligação ${w.id || '?'} possui terminal inexistente.`);
    return false;
  });
  const delta = Number.isFinite(dt) ? Math.max(0, dt) : 0;
  const tag = c => c.tag || c.id;
  let relays = { ...(previousState.relays || {}) };
  let result;
  let softGuess=previousState.softstarters||{};
  const seen = new Set();
  const signature = r => components.map(c => `${tag(c)}=${!!r[tag(c)]}`).join('|');
  seen.add(signature(relays));
  for (let iteration = 0; iteration < 64; iteration++) {
    const parent = new Map();
    for (const c of components) for (let p = 0; p < portCount(c); p++) parent.set(key(c.id, p), key(c.id, p));
    const find = a => { let b = a; while (parent.get(b) !== b) b = parent.get(b); while (a !== b) { const n = parent.get(a); parent.set(a, b); a = n; } return b; };
    const join = (a, b) => parent.set(find(a), find(b));
    for (const w of wires) join(key(w.from.id, w.from.port), key(w.to.id, w.to.port));
    const active = {};
    for (const c of components) {
      let closed;
      const model=topology(c);
      switch (model.kind) {
        // O térmico conduz nas três fases; o disparo atua nos contatos auxiliares.
        case 'thermal': closed = true; break;
        case 'fuse': case 'breaker': closed = inputs[c.id] === undefined ? true : !!inputs[c.id]; break;
        case 'switch': case 'switchChange': case 'buttonNO': case 'buttonChange': closed = !!inputs[c.id]; break;
        case 'switchNC': closed = inputs[c.id] === undefined ? true : !!inputs[c.id]; break;
        case 'buttonNC': closed = !inputs[c.id]; break;
        case 'contactNO': case 'contactor': case 'contactChange': closed = !!relays[c.ref]; break;
        case 'contactNC': closed = !relays[c.ref]; break;
      }
      if (closed !== undefined) { active[c.id] = closed;if(model.kind.endsWith('Change'))join(key(c.id,0),key(c.id,closed?2:1));else if(closed)for(const [a,b] of model.pairs)join(key(c.id,a),key(c.id,b)); }
    }
    for(const c of components.filter(c=>c.type==='ssw05')){
      const s=softGuess[c.id]||{};
      join(key(c.id,2),key(c.id,5)); // SSW-05 controla duas fases; a terceira é direta.
      if(s.operation){join(key(c.id,0),key(c.id,3));join(key(c.id,1),key(c.id,4));join(key(c.id,10),key(c.id,11));}
      if(s.full)join(key(c.id,11),key(c.id,12));
    }
    const rails=new Map();
    for(const c of components.filter(source)){const model=topology(c);model.rails.forEach((rail,p)=>{const root=find(key(c.id,p));if(!rails.has(root))rails.set(root,new Set());rails.get(root).add(rail);});}
    // Conversores ideais: secundários isolados, inclusive em cascata.
    const acInfo=r=>/^L[123]$|^N$/.test(r||'')?{domain:'grid',phase:r}:r?.startsWith('AC:')?{domain:r.slice(0,r.lastIndexOf(':')),phase:r.slice(r.lastIndexOf(':')+1)}:null;
    const converters=components.filter(c=>['dcSupply','transformer'].includes(topology(c).kind));
    for(const c of converters)active[c.id]=false;
    for(let pass=0;pass<converters.length;pass++){
      let progress=false;
      for(const c of converters){
        if(active[c.id])continue;
        const model=topology(c),input=model.inputs.map(p=>{const r=rails.get(find(key(c.id,p)));return r?.size===1?acInfo([...r][0]):null;});
        const powered=input.every(Boolean)&&input.every(r=>r.domain===input[0].domain)&&new Set(input.map(r=>r.phase)).size===input.length&&(input.length===2||input.every(r=>r.phase.startsWith('L')));
        if(!powered)continue;
        active[c.id]=true;progress=true;
        model.outputs.forEach((p,i)=>{const root=find(key(c.id,p));if(!rails.has(root))rails.set(root,new Set());const rail=model.kind==='dcSupply'?'DC:'+c.id+':'+(i===0?'+':'-'):'AC:'+c.id+':'+(model.outputs.length===2?(i===0?'L1':'N'):input[i].phase);rails.get(root).add(rail);});
      }
      if(!progress)break;
    }
    const softstarters={};
    const railAt=(c,p)=>{const r=rails.get(find(key(c.id,p)));return r?.size===1?[...r][0]:null;};
    for(const c of components.filter(c=>c.type==='ssw05')){
      const a=acInfo(railAt(c,6)),b=acInfo(railAt(c,7)),power=[0,1,2].map(p=>acInfo(railAt(c,p)));
      const control=!!a&&!!b&&a.domain===b.domain&&a.phase!==b.phase;
      const signal={control,power:power.every(r=>r?.phase.startsWith('L'))&&power.every(r=>r.domain===power[0].domain)&&new Set(power.map(r=>r?.phase)).size===3,enable:control&&railAt(c,8)===railAt(c,6),reset:control&&railAt(c,9)===railAt(c,6),frontReset:!!inputs[c.id]};
      softstarters[c.id]=advanceSSW(c,previousState.softstarters?.[c.id],signal,delta);
      active[c.id]=softstarters[c.id].operation;
    }
    const phaseRoots = new Set([...rails].filter(([,r])=>[...r].some(x=>acInfo(x)?.phase.startsWith('L')||x.endsWith(':+'))).map(([root])=>root));
    const neutralRoots = new Set([...rails].filter(([,r])=>[...r].some(x=>acInfo(x)?.phase==='N'||x.endsWith(':-'))).map(([root])=>root));
    const shortCircuit = [...rails.values()].some(r=>r.size>1);
    const faultRails = [...rails.values()].filter(r=>r.size>1).map(r=>[...r]);
    const shortBetweenPhases = faultRails.some(group=>group.filter(r=>acInfo(r)?.phase.startsWith('L')).length>1);
    const energized = [...parent.keys()].filter(k => phaseRoots.has(find(k)));
    const neutral = [...parent.keys()].filter(k => neutralRoots.has(find(k)));
    const nextRelays = {}, timers = {}, counters = {}, motorDirections = {};
    for (const c of components) {
      if (source(c)) { active[c.id] = true; continue; }
      if (['drawing-only','junction'].includes(topology(c).kind)) { active[c.id]=false; continue; }
      if (active[c.id] !== undefined) {
        if (topology(c).kind === 'thermal') nextRelays[tag(c)] = !!inputs[c.id];
        // Auxiliary contacts follow the device's mechanical state even without supply.
        if (/^(breaker|fuse|switch)/.test(c.type)) nextRelays[tag(c)] = !!nextRelays[tag(c)] || active[c.id];
        continue;
      }
      const a = find(key(c.id, 0)), b = find(key(c.id, 1));
      const ar=rails.get(a),br=rails.get(b);
      let powered = !shortCircuit && !!ar && !!br && !ar.has('PE')&&!br.has('PE')&&[...ar][0]!==[...br][0];
      if(powered){const av=[...ar][0],bv=[...br][0];if(av.startsWith('DC:')||bv.startsWith('DC:'))powered=av.startsWith('DC:')&&bv.startsWith('DC:')&&av.slice(0,-1)===bv.slice(0,-1);}
      if(powered){const av=acInfo([...ar][0]),bv=acInfo([...br][0]);if(av||bv)powered=!!av&&!!bv&&av.domain===bv.domain;}
      if(c.type==='motor3'){const motorRails=[0,1,2].map(p=>[...(rails.get(find(key(c.id,p)))||[])][0]);const phases=motorRails.map(acInfo);powered=!shortCircuit&&phases.every(r=>r?.phase.startsWith('L'))&&phases.every(r=>r.domain===phases[0].domain)&&new Set(motorRails).size===3;if(powered){const sequence=phases.map(r=>Number(r.phase.slice(1)));let inversions=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(sequence[i]>sequence[j])inversions++;motorDirections[c.id]=inversions%2?-1:1;}}
      active[c.id] = powered;
      if (c.type === 'coil') nextRelays[tag(c)] = !!nextRelays[tag(c)] || powered;
      if (c.type === 'timerOn' || c.type === 'timerOff' || c.type === 'timerPulse') {
        const prior = previousState.timers?.[c.id] || { elapsed: 0, input: false, output: false };
        const delay = Math.max(0, Number(c.delay) || 0);
        let elapsed, output;
        if (c.type === 'timerPulse') {elapsed=powered?(prior.input?prior.elapsed:0)+delta:0;output=powered&&Math.floor(elapsed/Math.max(.1,delay))%2===0;}
        else if (c.type === 'timerOn') {
          elapsed = powered ? (prior.input ? prior.elapsed : 0) + delta : 0;
          output = powered && elapsed + 1e-9 >= delay;
        } else {
          elapsed = powered ? 0 : (prior.input ? 0 : prior.elapsed) + delta;
          output = powered || (prior.output && elapsed + 1e-9 < delay);
        }
        timers[c.id] = { elapsed, input: powered, output };
        nextRelays[tag(c)] = !!nextRelays[tag(c)] || output;
      }
      if (c.type === 'counter') {
        const prior = previousState.counters?.[c.id] || { count: 0, input: false };
        const count = prior.count + (powered && !prior.input ? 1 : 0);
        const output = count >= Math.max(1, Number(c.preset) || 1);
        counters[c.id] = { count, input: powered, output };
        nextRelays[tag(c)] = !!nextRelays[tag(c)] || output;
      }
      if(c.type==='relayLatch'){const prior=previousState.latches?.[c.id]||{input:false,output:false};const output=powered&&!prior.input?!prior.output:prior.output;nextRelays[tag(c)]=!!nextRelays[tag(c)]||output;}
    }
    const latches=Object.fromEntries(components.filter(c=>c.type==='relayLatch').map(c=>[c.id,{input:active[c.id],output:!!nextRelays[tag(c)]}]));
    result = { active, relays: nextRelays, energized, neutral, shortCircuit, unstable: false, softstarters, timers, counters, latches, motorDirections, errors };
    if(shortCircuit){
      // Preserva o instante do fechamento que provocou o curto, antes da próxima iteração.
      result.relays={...relays};
      for(const c of components)if(c.type==='coil')result.active[c.id]=!!relays[tag(c)];
      result.faultRails=faultRails;
      result.shortBetweenPhases=shortBetweenPhases;
      result.faultMessage=shortBetweenPhases?'Curto entre fases':'Curto-circuito entre potenciais diferentes';
      return result;
    }
    const softStable=components.filter(c=>c.type==='ssw05').every(c=>!!softGuess[c.id]?.operation===!!softstarters[c.id]?.operation&&!!softGuess[c.id]?.full===!!softstarters[c.id]?.full);
    if(!softStable){softGuess=softstarters;relays=nextRelays;continue;}
    const next = signature(nextRelays);
    if (next === signature(relays)) return result;
    if (seen.has(next)) { result.unstable = true; errors.push('Realimentação oscilante: o circuito não atingiu um estado estável.'); return result; }
    seen.add(next);
    relays = nextRelays;
  }
  result.unstable = true;
  errors.push('Limite de estabilização do circuito atingido.');
  return result;
}

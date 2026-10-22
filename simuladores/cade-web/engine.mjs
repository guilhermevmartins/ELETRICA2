import {topology,portCount,sourceType} from './topology.mjs';
/** Digital continuity/relay simulator with distinct phase rails. No analog calculations. */
export function simulate(circuit, previousState = {}, inputs = {}, dt = 0.05) {
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
        case 'fuse': case 'breaker': closed = inputs[c.id] === undefined ? true : !!inputs[c.id]; break;
        case 'switch': case 'switchChange': case 'buttonNO': case 'buttonChange': closed = !!inputs[c.id]; break;
        case 'switchNC': closed = inputs[c.id] === undefined ? true : !!inputs[c.id]; break;
        case 'buttonNC': closed = !inputs[c.id]; break;
        case 'contactNO': case 'contactor': case 'contactChange': closed = !!relays[c.ref]; break;
        case 'contactNC': closed = !relays[c.ref]; break;
      }
      if (closed !== undefined) { active[c.id] = closed;if(model.kind.endsWith('Change'))join(key(c.id,0),key(c.id,closed?2:1));else if(closed)for(const [a,b] of model.pairs)join(key(c.id,a),key(c.id,b)); }
    }
    const rails=new Map();
    for(const c of components.filter(source)){const model=topology(c);model.rails.forEach((rail,p)=>{const root=find(key(c.id,p));if(!rails.has(root))rails.set(root,new Set());rails.get(root).add(rail);});}
    // Isolated ideal DC supplies: input AC rails never join the secondary.
    const acShort=[...rails.values()].some(r=>r.size>1);
    for(const c of components){
      const model=topology(c);if(model.kind!=='dcSupply')continue;
      const input=model.inputs.map(p=>[...(rails.get(find(key(c.id,p)))||[])][0]);
      const powered=!acShort&&input.every(r=>/^L[123]$|^N$/.test(r||''))&&new Set(input).size===input.length&&(input.length===2||input.every(r=>r.startsWith('L')));
      active[c.id]=powered;
      if(powered)model.outputs.forEach((p,i)=>{const root=find(key(c.id,p));if(!rails.has(root))rails.set(root,new Set());rails.get(root).add('DC:'+c.id+':'+(i===0?'+':'-'));});
    }
    const phaseRoots = new Set([...rails].filter(([,r])=>[...r].some(x=>(x.startsWith('L')||x.endsWith(':+')))).map(([root])=>root));
    const neutralRoots = new Set([...rails].filter(([,r])=>(r.has('N')||[...r].some(x=>x.endsWith(':-')))).map(([root])=>root));
    const shortCircuit = [...rails.values()].some(r=>r.size>1);
    const energized = [...parent.keys()].filter(k => phaseRoots.has(find(k)));
    const neutral = [...parent.keys()].filter(k => neutralRoots.has(find(k)));
    const nextRelays = {}, timers = {}, counters = {}, motorDirections = {};
    for (const c of components) {
      if (source(c)) { active[c.id] = true; continue; }
      if (['drawing-only','junction'].includes(topology(c).kind)) { active[c.id]=false; continue; }
      if (active[c.id] !== undefined) {
        // Auxiliary contacts follow the device's mechanical state even without supply.
        if (/^(breaker|fuse|switch)/.test(c.type)) nextRelays[tag(c)] = !!nextRelays[tag(c)] || active[c.id];
        continue;
      }
      const a = find(key(c.id, 0)), b = find(key(c.id, 1));
      const ar=rails.get(a),br=rails.get(b);
      let powered = !shortCircuit && !!ar && !!br && !ar.has('PE')&&!br.has('PE')&&[...ar][0]!==[...br][0];
      if(powered){const av=[...ar][0],bv=[...br][0];if(av.startsWith('DC:')||bv.startsWith('DC:'))powered=av.startsWith('DC:')&&bv.startsWith('DC:')&&av.slice(0,-1)===bv.slice(0,-1);}
      if(c.type==='motor3'){const motorRails=[0,1,2].map(p=>[...(rails.get(find(key(c.id,p)))||[])][0]);powered=!shortCircuit&&motorRails.every(r=>r?.startsWith('L'))&&new Set(motorRails).size===3;if(powered){const sequence=motorRails.map(r=>Number(r.slice(1)));let inversions=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(sequence[i]>sequence[j])inversions++;motorDirections[c.id]=inversions%2?-1:1;}}
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
    result = { active, relays: nextRelays, energized, neutral, shortCircuit, unstable: false, timers, counters, latches, motorDirections, errors };
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

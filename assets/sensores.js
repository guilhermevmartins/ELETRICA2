/* Bancada compartilhada pelas duas entradas do catálogo. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const initialKind=new URLSearchParams(location.search).get('tipo')==='capacitivo'?'capacitivo':'indutivo';
  const defaults=()=>({kind:initialKind,material:'aco',distance:12,sensitivity:70,outputType:'PNP',contact:'NA'});
  let state=defaults(),challenge=null;
  const {materials,calculate}=window.SensorModel;
  const ids=['kind','material','distance','sensitivity','outputType','contact'];
  const decimal=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:1});
  const setText=(id,text)=>{$(id).textContent=text;};
  function sync(){ids.forEach(id=>{$(id).value=state[id];});render();}
  function diagram(result){
    const pnp=state.outputType==='PNP',com=state.outputType==='PNP'?0:24,on=result.conducting;
    // Disposição da referência: alimentação à esquerda, carga à esquerda do sensor.
    // Na ligação correta, PNP põe a carga abaixo da saída; NPN, acima.
    const loadTop=com===24,loadY=loadTop?109:221;
    const supply='M65 66H300V130H430';
    const ground='M65 326H300V258H430';
    const signal=loadTop?'M430 194H182V169':'M430 194H182V221';
    const common=loadTop?'M182 109V66':'M182 281V326';
    const flow=pnp?'M65 66H300V130H430H458V194H182V326H65':'M65 66H182V194H430H458V258H430H300V326H65';
    $('wiring').setAttribute('viewBox','0 0 760 410');
    $('wiring').innerHTML=`<title id="wiringTitle">Sensor saída ${state.outputType}, à direita. Carga à esquerda, entre saída e ${com} V. ${result.loadOn?'Corrente circulando; carga ligada.':'Sem corrente na carga.'}</title>
      <defs><pattern id="wiringGrid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#223447"/></pattern></defs>
      <rect width="760" height="410" fill="url(#wiringGrid)"/>
      <text x="32" y="35" class="wire-kicker">LIGAÇÃO DE 3 FIOS · 24 V CC</text>
      <path d="${supply}" class="wire-positive"/><path d="${ground}" class="wire-negative"/>
      <path d="${signal}" class="wire-signal-halo"/><path d="${signal}" class="wire-signal"/>
      <path d="${common}" class="${loadTop?'wire-positive':'wire-negative'}"/>
      <circle cx="182" cy="${loadTop?66:326}" r="5" fill="${loadTop?'#d28d6e':'#62c8eb'}"/>
      <circle cx="65" cy="66" r="17" fill="#352924" stroke="#d28d6e"/><text x="65" y="73" text-anchor="middle" class="wire-polarity">+</text>
      <circle cx="65" cy="326" r="17" fill="#183445" stroke="#62c8eb"/><text x="65" y="333" text-anchor="middle" class="wire-polarity">−</text>
      <text x="92" y="55" class="wire-small">+24 V</text><text x="92" y="352" class="wire-small">0 V</text>
      <rect x="148" y="${loadY}" width="68" height="60" rx="9" class="wire-load" data-on="${result.loadOn}"/>
      <text x="182" y="${loadY+35}" text-anchor="middle" class="wire-load-label">Carga</text>
      <text x="320" y="115" class="wire-small">Marrom · BN</text>
      <text x="320" y="179" class="wire-small">Preto · BK</text>
      <text x="320" y="283" class="wire-small">Azul · BU</text>
      <rect x="430" y="96" width="280" height="198" rx="16" fill="#1b3043" stroke="#5a778d" stroke-width="2"/>
      <rect x="430" y="118" width="5" height="30" rx="2" fill="#d28d6e"/><rect x="430" y="180" width="5" height="28" rx="2" fill="#b9cad8"/><rect x="430" y="243" width="5" height="30" rx="2" fill="#62c8eb"/>
      ${result.loadOn?`<path d="${flow}" class="flow wire-current"/>`:''}
      <text x="490" y="145" class="wire-small">${state.kind.toUpperCase()}</text>
      <text x="490" y="181" class="wire-title">Sensor saída</text>
      <text x="490" y="221" class="wire-type">${state.outputType}</text>
      <circle cx="665" cy="213" r="8" fill="${on?'#7df4bc':'#536a7f'}"/>
      <text x="490" y="263" class="wire-small">${state.contact} · saída ${on?'ativa':'inativa'}</text>
      <text x="242" y="204" class="wire-polarity" style="fill:${pnp?'#efb59c':'#80dbf5'}">${on?(pnp?'+':'−'):'Q'}</text>
      <text x="380" y="386" text-anchor="middle" class="wire-caption">${pnp?'PNP: o sensor fornece o positivo para a carga.':'NPN: o sensor fecha o caminho da carga para o negativo.'}</text>`;
  }
  function render(){
    const r=calculate(state),m=materials[state.material];
    setText('distanceValue',decimal(state.distance)+' mm');setText('sensitivityValue',state.sensitivity+'%');
    $('sensitivityControl').hidden=state.kind!=='capacitivo';
    $('detection').dataset.detected=String(r.detected);
    $('target').setAttribute('transform',`translate(${310+state.distance*16},0)`);
    $('target').querySelector('rect').setAttribute('fill',m.color);
    setText('targetLabel',m.label);setText('gapLabel','Distância: '+decimal(state.distance)+' mm');
    $('sensorLed').setAttribute('fill',r.conducting?'#7df4bc':'#71899a');
    setText('detectionTitle',`${state.kind}: ${m.label} a ${decimal(state.distance)} mm. ${r.detected?'Alvo detectado':'Alvo não detectado'}. LED indica saída ${r.conducting?'ativa':'inativa'}.`);
    setText('detectedBadge',r.detected?'ALVO DETECTADO':'SEM DETECÇÃO');$('detectedBadge').dataset.on=String(r.detected);
    setText('loadBadge',r.loadOn?'CARGA LIGADA':'CARGA DESLIGADA');$('loadBadge').dataset.on=String(r.loadOn);
    setText('principle',state.kind==='indutivo'?'INDUTIVO · A bobina cria um campo magnético alternado. Aproximar metal altera esse campo; plástico, madeira e água não acionam este modelo.':'CAPACITIVO · O campo elétrico percebe a alteração de capacitância causada pelo alvo. Experimente materiais diferentes e ajuste a sensibilidade.');
    setText('detectionReason',r.range===0?`${m.label} não é um alvo metálico: aproximá-lo não aciona o indutivo.`:`${m.label}: alcance ilustrativo de ${decimal(r.range)} mm nesta configuração. ${r.detected?'O alvo está dentro da zona de detecção.':'Aproxime o objeto até essa zona.'} O LED no corpo indica condução da saída.`);
    setText('detectedValue',r.detected?'Sim':'Não');setText('switchValue',r.conducting?'Conduzindo':'Desligado');setText('voltageValue','≈ '+r.voltage+' V');setText('loadValue',r.loadOn?'Ligada':'Desligada');
    setText('currentExplanation',!r.conducting?`${state.contact}: a saída está em alta impedância. Não circula corrente pela carga; o fio preto fica próximo de ${state.outputType==='PNP'?0:24} V.`:state.outputType==='PNP'?'PNP fornece corrente: +24 V → sensor → fio preto → carga → 0 V. Carga ligada.':'NPN drena corrente: +24 V → carga → fio preto → sensor → 0 V. Mesmo com preto em 0 V, a carga está ligada.');
    $('truth').innerHTML=[false,true].flatMap(d=>['NA','NF'].map(c=>{
      const conducting=c==='NA'?d:!d;
      return `<tr data-active="${d===r.detected&&c===state.contact}"><td>${d?'Sim':'Não'}</td><td>${c}</td><td>${conducting?'Conduz':'Desligado'}</td><td>≈ ${conducting?24:0} V</td><td>≈ ${conducting?0:24} V</td><td>${conducting?'Ligada':'Desligada'}</td></tr>`;
    })).join('');
    diagram(r);
    document.title=`Sensor ${state.kind} · ${state.outputType} / ${state.contact} · SENAI`;
  }
  ids.forEach(id=>{
    const control=$(id);
    const update=()=>{
      state[id]=['distance','sensitivity'].includes(id)?Number(control.value):control.value;
      render();
    };
    // Seletores também podem confirmar a escolha apenas pelo evento change.
    control.addEventListener('input',update);
    control.addEventListener('change',update);
  });
  $('near').onclick=()=>{state.distance=1;sync();};$('far').onclick=()=>{state.distance=20;sync();};
  const challenges={
    plastic:{values:{kind:'indutivo',material:'plastico',distance:1,outputType:'PNP',contact:'NA'},question:'O plástico está próximo. Por que não há detecção? Troque apenas o princípio para capacitivo e compare.',answer:'O indutivo responde a metais. O capacitivo pode responder ao plástico pela alteração de capacitância. PNP/NPN não muda quais materiais são detectados.'},
    npn:{values:{kind:'indutivo',material:'aco',distance:1,outputType:'NPN',contact:'NA'},question:'O fio preto está em 0 V, mas a carga está ligada. Explique o percurso da corrente. Depois afaste o alvo.',answer:'O NPN fecha o caminho até 0 V. A corrente vem de +24 V, atravessa a carga e retorna pelo sensor. Ao afastar o alvo, a saída NA interrompe esse caminho e a carga desliga.'},
    nf:{values:{kind:'capacitivo',material:'agua',distance:20,outputType:'PNP',contact:'NF'},question:'Sem detectar o alvo, a saída NF conduz? Aproxime a água e observe o que muda.',answer:'Sim. NF conduz na ausência de detecção. Quando o alvo entra na zona de detecção, a saída desliga. Essa inversão de lógica é independente de ser PNP ou NPN.'}
  };
  document.querySelectorAll('[data-challenge]').forEach(button=>button.onclick=()=>{
    challenge=challenges[button.dataset.challenge];state={...defaults(),...challenge.values};sync();setText('challengeQuestion',challenge.question);$('challengeAnswer').hidden=true;$('reveal').hidden=false;
  });
  $('reveal').onclick=()=>{if(challenge){setText('challengeAnswer',challenge.answer);$('challengeAnswer').hidden=false;}};
  $('reset').onclick=()=>{state=defaults();challenge=null;sync();$('reveal').hidden=true;$('challengeAnswer').hidden=true;setText('challengeQuestion','Escolha uma experiência, faça sua previsão e observe a bancada.');};
  const pause=()=>document.body.classList.toggle('sensor-paused',window.labActive===false||document.hidden);
  window.addEventListener('lab-visibility-change',pause);document.addEventListener('visibilitychange',pause);
  sync();pause();
})();

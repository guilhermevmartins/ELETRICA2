/* Ensaio ideal de resistência: unidades internas m, mm², °C e Ω·mm²/m.
   Dados a 20 °C: OpenStax University Physics 2, tabela 9.1. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),fmt=(n,d=4)=>n.toLocaleString('pt-BR',{maximumFractionDigits:d,minimumFractionDigits:0});
 const materials=[
  {id:'cobre',name:'Cobre',rho:.0168,alpha:.0039,color:'#d78b59',use:'Fios e enrolamentos combinam boa condução com facilidade de fabricação.'},
  {id:'prata',name:'Prata',rho:.0159,alpha:.0038,color:'#d7e4ee',use:'Entre os materiais desta bancada, a prata tem a menor resistividade a 20 °C.'},
  {id:'ouro',name:'Ouro',rho:.0244,alpha:.0034,color:'#ebbf54',use:'Usado em revestimentos de contatos: além da condução, a resistência à corrosão importa.'},
  {id:'aluminio',name:'Alumínio',rho:.0265,alpha:.0039,color:'#b8c9d2',use:'Para a mesma resistência e comprimento, precisa de uma seção maior que o cobre.'},
  {id:'ferro',name:'Ferro',rho:.0971,alpha:.0065,color:'#93a6b5',use:'Sua resistência é mais sensível à temperatura que a do cobre neste modelo.'},
  {id:'tungstenio',name:'Tungstênio',rho:.056,alpha:.0045,color:'#a29c90',use:'Conhecido pelos filamentos. Aqui estudamos somente a faixa de −20 a 120 °C.'},
  {id:'niquel-cromo',name:'Níquel-cromo',rho:1,alpha:.0004,color:'#bc9bd2',use:'Liga resistiva: oferece resistência alta e menor variação relativa com a temperatura que o cobre.'},
  {id:'constantan',name:'Constantan',rho:.49,alpha:.00003,color:'#c3a993',use:'Liga de cobre e níquel, útil quando se deseja pequena variação da resistência com a temperatura.'}
 ];
 const state={material:0,length:1,area:1,temp:20,reveal:true,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches};
 const compute=(m,L,A,T)=>{const factor=1+m.alpha*(T-20),rho=m.rho*factor,R=rho*L/A;return {factor,rho,R,sigma:1/rho,G:1/R,R20:m.rho*L/A}};
 let reference={material:0,length:1,area:1,temp:20},activeExperiment=-1,quiz=0,phase=0,raf=0,last=0;
 const m=()=>materials[state.material],value=()=>compute(m(),state.length,state.area,state.temp);
 const shown=(n,d=4)=>state.reveal?fmt(n,d):'•••';
 const svgText=(x,y,text,size=15,color='#c3d9e8',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${text}</text>`;
 function selectMaterial(i){state.material=i;activeExperiment=-1;render()}
 $('materials').innerHTML=materials.map((x,i)=>`<button data-material="${i}" aria-pressed="${i===0}" style="--metal:${x.color}"><i></i>${x.name}</button>`).join('');
 $('materials').addEventListener('click',e=>{const b=e.target.closest('[data-material]');if(b)selectMaterial(+b.dataset.material)});
 $('materialTable').addEventListener('click',e=>{const b=e.target.closest('[data-material]');if(b){selectMaterial(+b.dataset.material);$('bancada').scrollIntoView({behavior:'auto'})}});
 for(const [key,min,max,step] of [['length',.5,20,.5],['area',.25,10,.25],['temp',-20,120,1]]){
  const number=$(key),range=$(key+'Range');
  range.addEventListener('input',()=>{state[key]=+range.value;number.value=range.value;activeExperiment=-1;$('inputNotice').textContent='';render()});
  number.addEventListener('input',()=>{const n=number.valueAsNumber;if(Number.isFinite(n)&&n>=min&&n<=max&&number.validity.valid){state[key]=n;range.value=n;activeExperiment=-1;$('inputNotice').textContent='';render()}else $('inputNotice').textContent=`Use ${fmt(min)} a ${fmt(max)}, em passos de ${fmt(step)}.`});
  number.addEventListener('change',()=>{if(!number.validity.valid||!Number.isFinite(number.valueAsNumber)){number.value=state[key];$('inputNotice').textContent='Valor anterior mantido. Confira os limites do controle.'}});
 }
 function sync(){for(const key of ['length','area','temp']){$(key).value=state[key];$(key+'Range').value=state[key]}}
 document.querySelectorAll('[data-temp]').forEach(b=>b.addEventListener('click',()=>{state.temp=+b.dataset.temp;activeExperiment=-1;sync();render()}));
 $('reset').addEventListener('click',()=>{Object.assign(state,{material:0,length:1,area:1,temp:20});activeExperiment=-1;sync();$('inputNotice').textContent='';render()});
 $('save').addEventListener('click',()=>{reference={...state};render()});
 $('reveal').addEventListener('change',()=>{state.reveal=$('reveal').checked;render()});
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('bancada').requestFullscreen()}catch{$('inputNotice').textContent='Use a opção de tela cheia do navegador para ampliar a aula.'}});
 document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'⛶ Sair da tela cheia':'⛶ Ampliar aula'});
 const experiments=[
  {name:'1 · Referência',values:{material:0,length:1,area:1,temp:20},text:'Este é o ponto de partida: cobre, 1 m, 1 mm² e 20 °C. A resistência é pequena, mas não é zero. Guarde esta amostra para comparar.'},
  {name:'2 · Dobrar L',values:{material:0,length:2,area:1,temp:20},text:'Somente o comprimento dobrou. R também dobra, enquanto ρ e σ continuam iguais. Agora tente 4 m: o que espera encontrar?'},
  {name:'3 · Dobrar A',values:{material:0,length:1,area:2,temp:20},text:'Somente a área dobrou: R cai à metade. Dobrar a área não é dobrar o diâmetro; em um fio circular, A = πd²/4.'},
  {name:'4 · Aquecer',values:{material:0,length:1,area:1,temp:80},text:'O cobre passou de 20 para 80 °C. Com α = 0,0039 °C⁻¹, a variação relativa é 0,0039 × 60 = 23,4%. Compare a agitação da rede e o gráfico.'},
  {name:'5 · Trocar a liga',values:{material:6,length:1,area:1,temp:20},text:'Agora é níquel-cromo, com as mesmas dimensões e temperatura. A resistência sobe bastante. Aumente a temperatura: sua variação relativa é menor que a do cobre.'}
 ];
 $('experiments').innerHTML=experiments.map((e,i)=>`<button data-experiment="${i}" aria-pressed="false">${e.name}</button>`).join('');
 $('experiments').addEventListener('click',e=>{const b=e.target.closest('[data-experiment]');if(!b)return;activeExperiment=+b.dataset.experiment;Object.assign(state,experiments[activeExperiment].values);sync();render()});
 function drawSample(){
  const v=value(),metal=m();$('sampleName').textContent=metal.name+' · amostra uniforme';
  $('meter').textContent=shown(v.R,5)+' Ω';
  $('metalTop').setAttribute('stop-color',metal.color);$('metalMid').setAttribute('stop-color',metal.color);$('metalBottom').setAttribute('stop-color',metal.color);
  const width=240+state.length/20*340,x=100+(580-width)/2,end=x+width,ry=9+Math.sqrt(state.area)*9,y=212;
  $('leadLeft').setAttribute('d',`M360 127V155H${x}V${y}`);$('leadRight').setAttribute('d',`M540 127V150H${end}V${y}`);
  $('wire').innerHTML=`<ellipse cx="${x}" cy="${y}" rx="12" ry="${ry}" fill="#657685"/><rect x="${x}" y="${y-ry}" width="${width}" height="${2*ry}" fill="url(#wireMetal)"/><path d="M${x+10} ${y-ry+4}H${end-8}" stroke="#ffffff" opacity=".4" stroke-width="3"/><ellipse cx="${end}" cy="${y}" rx="12" ry="${ry}" fill="${metal.color}" stroke="#fff" stroke-opacity=".4"/><circle cx="${x}" cy="${y}" r="5" fill="#f69ca7"/><circle cx="${end}" cy="${y}" r="5" fill="#d4e9f7"/>`;
  $('dimensions').innerHTML=`<path d="M${x} 253V285M${end} 253V285M${x+4} 274H${end-4}" stroke="#91b3ca" fill="none"/><path d="M${x+5} 274H${end-5}" stroke="#91b3ca" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)"/>${svgText((x+end)/2,267,`L = ${fmt(state.length)} m`,17,'#dbedf8','text-anchor="middle"')}`;
  const radius=18+Math.sqrt(state.area)*7;
  $('crossSection').innerHTML=`${svgText(755,174,'CORTE TRANSVERSAL',12,'#9cb9ce','text-anchor="middle"')}<circle cx="755" cy="216" r="${radius}" fill="${metal.color}" stroke="#f0dfc8" stroke-width="2"/><path d="M${755-radius} 216H${755+radius}" stroke="#0b1b2b" stroke-dasharray="4 3"/>${svgText(755,283,`A = ${fmt(state.area)} mm²`,17,'#dbedf8','text-anchor="middle"')}`;
  const height=(state.temp+20)/140*80,heat=state.temp>20?'#ff8291':'#6bd5ef';
  $('temperature').innerHTML=`<rect x="639" y="346" width="22" height="87" rx="11" stroke="#8daabe" fill="#1a3447"/><rect x="644" y="${428-height}" width="12" height="${height+2}" rx="5" fill="${heat}"/><circle cx="650" cy="433" r="15" fill="${heat}"/>${svgText(689,378,`${fmt(state.temp)} °C`,27,heat)}${svgText(689,406,state.temp>20?'Acima de 20 °C':state.temp<20?'Abaixo de 20 °C':'Referência',14)}${svgText(620,476,`α₂₀ = ${fmt(metal.alpha,5)} °C⁻¹`,14)}`;
  $('microCaption').textContent=state.temp>20?'Maior temperatura → maior agitação da rede.':state.temp<20?'Menor temperatura → menor agitação da rede.':'20 °C: condição de referência para os coeficientes.';
  drawMicro();
 }
 // Mesma deriva ilustrativa em todos os metais; não associa animação a uma corrente calculada.
 function drawMicro(){const amp=1.4+(state.temp+20)/140*6.5;let s='';for(let j=0;j<3;j++)for(let i=0;i<11;i++){const k=j*11+i,x=100+i*43+Math.sin(phase*2+k*2.4)*amp,y=351+j*38+Math.cos(phase*2.3+k*1.8)*amp;s+=`<circle cx="${x}" cy="${y}" r="12" fill="${m().color}" opacity=".75"/><circle cx="${x-3}" cy="${y-4}" r="3" fill="#fff" opacity=".25"/>`}for(let i=0;i<14;i++){const x=87+((i*37+phase*17)%465),y=347+(i%3)*36+Math.sin(phase*2+i)*6;s+=`<circle cx="${x}" cy="${y}" r="3" fill="#6bdbff"/>`}$('micro').innerHTML=s}
 function render(){
  const v=value(),metal=m();drawSample();
  $('alphaMeaning').textContent=`O que α significa? Perto de 20 °C, cada +1 °C acrescenta aproximadamente ${fmt(metal.alpha*100,3)}% da resistência de referência deste fio.`;
  document.querySelectorAll('#materials button').forEach((b,i)=>b.setAttribute('aria-pressed',i===state.material));
  $('metrics').innerHTML=[['Resistência · R',shown(v.R,5)+' Ω','Deste fio, nesta temperatura'],['Resistividade · ρ(T)',shown(v.rho,5),'Ω·mm²/m'],['Condutividade · σ(T)',shown(v.sigma,3),'MS/m'],['Condutância · G',shown(v.G,3)+' S','Inverso da resistência do fio']].map(([title,note,unit])=>`<div class="metric"><span>${title}</span><strong>${note}</strong><small>${unit}</small></div>`).join('');
  const change=(v.factor-1)*100;
  $('insight').textContent=`${metal.use} ${state.temp===20?'Temperatura de referência: R = R₂₀.':`Em relação a este mesmo fio a 20 °C, R ${change>0?'aumentou':'diminuiu'} ${state.reveal?fmt(Math.abs(change),2)+'%':'(revele a leitura para conferir)'}.`}`;
  const sub=state.reveal;
  $('equations').innerHTML=[
   ['01 · Corrigir pela temperatura','ρ(T) ≈ ρ₂₀[1 + α(T − 20)]',sub?`${fmt(metal.rho,5)} × [1 + ${fmt(metal.alpha,5)} × (${fmt(state.temp)} − 20)]<br><b>≈ ${fmt(v.rho,6)} Ω·mm²/m</b>`:'Faça sua previsão antes de revelar.',`ρ₂₀ = ${fmt(metal.rho,5)} Ω·mm²/m; α₂₀ = ${fmt(metal.alpha,5)} °C⁻¹.`],
   ['02 · Considerar o tamanho','R = ρ(T) · L / A',sub?`${fmt(v.rho,6)} × ${fmt(state.length)} / ${fmt(state.area)}<br><b>≈ ${fmt(v.R,6)} Ω</b>`:'O comprimento multiplica; a área divide.','L é o comprimento de uma amostra, não um percurso de ida e volta.'],
   ['03 · Calcular os inversos','σ = 1/ρ  e  G = 1/R',sub?`σ ≈ <b>${fmt(v.sigma,3)} MS/m</b><br>G ≈ <b>${fmt(v.G,3)} S</b>`:'Menor resistividade → maior condutividade.','σ caracteriza o material. G caracteriza esta amostra.']
  ].map(([a,b,c,d])=>`<div class="equation"><b>${a}</b><div class="formula">${b}</div><div class="substitution">${c}</div><small>${d}</small></div>`).join('');
  $('materialTable').innerHTML=materials.map((mat,i)=>`<tr class="${i===state.material?'selected':''}"><td><button data-material="${i}" aria-pressed="${i===state.material}">${mat.name}</button></td><td>${fmt(mat.rho,4)}</td><td>${fmt(mat.alpha,5)}</td><td>${shown(compute(mat,state.length,state.area,state.temp).R,5)}</td></tr>`).join('');
  const r=compute(materials[reference.material],reference.length,reference.area,reference.temp).R,max=Math.max(r,v.R),ratio=v.R/r;
  $('reference').innerHTML=`<p class="saved-title">GUARDADA: ${materials[reference.material].name} · ${fmt(reference.length)} m · ${fmt(reference.area)} mm² · ${fmt(reference.temp)} °C</p><div class="compare-row"><span>Guardada</span><i><b style="width:${r/max*100}%"></b></i><b>${shown(r,5)} Ω</b></div><div class="compare-row"><span>Atual</span><i><b style="width:${v.R/max*100}%"></b></i><b>${shown(v.R,5)} Ω</b></div><p>${sub?`A amostra atual tem ${fmt(ratio,3)}× a resistência da guardada.`:'Compare as barras e preveja a razão entre as resistências.'}</p>`;
  document.querySelectorAll('[data-experiment]').forEach((b,i)=>b.setAttribute('aria-pressed',i===activeExperiment));
  $('experimentText').textContent=activeExperiment<0?'Experimento livre. Guarde uma amostra e altere apenas uma variável para descobrir a relação de causa e efeito.':experiments[activeExperiment].text;
  drawChart();
 }
 function drawChart(){
  const mat=m(),calc=t=>compute(mat,state.length,state.area,t).R,top=calc(120)*1.12,y=r=>250-r/top*210,x=t=>65+(t+20)/140*410;
  let s='';for(let i=0;i<=4;i++){const r=top*i/4,yy=y(r);s+=`<path d="M65 ${yy}H475" stroke="var(--line)"/>${svgText(55,yy+4,state.reveal?fmt(r,4):'?',11,'var(--muted)','text-anchor="end"')}`}
  for(const t of [-20,0,20,40,60,80,100,120])s+=svgText(x(t),273,fmt(t),11,'var(--muted)','text-anchor="middle"');
  s+=`<path d="M65 35V250H480" fill="none" stroke="var(--muted)"/><path d="M${x(20)} 35V250" stroke="var(--muted)" stroke-dasharray="4 5"/><path d="M65 ${y(calc(-20))}L475 ${y(calc(120))}" stroke="var(--cyan)" stroke-width="3"/><circle cx="${x(state.temp)}" cy="${y(calc(state.temp))}" r="7" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/>${svgText(65,22,'R (Ω)',13,'var(--text)')}${svgText(475,295,'T (°C)',12,'var(--muted)','text-anchor="end"')}`;
  $('chart').innerHTML=s;$('chartCaption').textContent=`${mat.name} · ${fmt(state.length)} m · ${fmt(state.area)} mm² · modelo linear. α₂₀ = ${fmt(mat.alpha,5)} °C⁻¹.`;
 }
 const quizzes=[
  ['Comprimento','Mantendo material, seção e temperatura, dobrar o comprimento faz R…',['Dobrar.','Cair à metade.','Continuar igual.'],0,'O dobro do comprimento dá R = ρ · 2L/A = 2R. A resistividade permanece igual.'],
  ['Seção','Se o diâmetro de um fio circular dobrar, a resistência fica…',['Duas vezes maior.','Quatro vezes menor.','Duas vezes menor.'],1,'A área é proporcional ao quadrado do diâmetro: A = πd²/4. Dobrar d quadruplica A, e R cai para um quarto.'],
  ['Temperatura','Cobre com R₂₀ = 1 Ω é aquecido a 80 °C. Com α = 0,0039 °C⁻¹, R vale aproximadamente…',['0,766 Ω.','1,234 Ω.','1,0039 Ω.'],1,'ΔT = 80 − 20 = 60 °C. R = 1 × [1 + 0,0039 × 60] = 1,234 Ω.'],
  ['Material','Dois fios de cobre à mesma temperatura têm comprimentos diferentes. Qual propriedade permanece igual?',['Resistência R.','Condutância G.','Resistividade ρ.'],2,'ρ é propriedade do material àquela temperatura. R e G também dependem da geometria do fio.'],
  ['Escolha','Por que uma liga de níquel-cromo pode ser adequada para uma resistência de aquecimento?',['Sua resistividade é relativamente alta.','Ela tem resistência zero.','Ela é sempre melhor para transmitir energia.'],0,'Uma resistividade maior permite obter resistência significativa em um comprimento menor. Para a mesma corrente, a potência dissipada é P = I²R.']
 ];
 function showQuiz(){const q=quizzes[quiz];$('quizTabs').innerHTML=quizzes.map((x,i)=>`<button data-quiz="${i}" aria-pressed="${i===quiz}">${i+1} · ${x[0]}</button>`).join('');$('question').textContent=q[1];$('answers').innerHTML=q[2].map((x,i)=>`<button data-answer="${i}">${x}</button>`).join('');$('feedback').textContent='Peça uma justificativa antes de escolher a resposta.'}
 $('quizTabs').addEventListener('click',e=>{const b=e.target.closest('[data-quiz]');if(b){quiz=+b.dataset.quiz;showQuiz()}});
 $('answers').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(!b)return;const q=quizzes[quiz],correct=+b.dataset.answer===q[3];document.querySelectorAll('[data-answer]').forEach(x=>x.classList.remove('correct','wrong'));b.classList.add(correct?'correct':'wrong');$('feedback').textContent=(correct?'Isso mesmo. ':'Vamos conferir: ')+q[4]});
 function animate(t){raf=0;phase+=Math.min((t-last)/1000,.06);last=t;drawMicro();raf=requestAnimationFrame(animate)}
 function updateMotion(){const allowed=state.motion&&window.labActive&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches;$('motion').textContent=state.motion?'Ⅱ Pausar agitação':'▶ Animar agitação';$('motion').setAttribute('aria-pressed',String(state.motion));if(allowed&&!raf){last=performance.now();raf=requestAnimationFrame(animate)}else if(!allowed&&raf){cancelAnimationFrame(raf);raf=0}}
 $('motion').addEventListener('click',()=>{state.motion=!state.motion;updateMotion()});
 document.addEventListener('visibilitychange',updateMotion);window.addEventListener('lab-visibility-change',updateMotion);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',updateMotion);
 render();showQuiz();updateMotion();
})();

/* Fonte no poste da rede, medição na entrada e quadro de distribuição são elementos distintos. */
function drawEarthingScene(){
 const s=schemes[scheme],it=scheme==='it',c=scheme==='tnc',cs=scheme==='tncs',tn=scheme.startsWith('tn');
 const L='M240 240H310V335H410V405H565V370H1120';
 const returnIncoming='M240 300H290V455H650';
 const normalReturn=cs?'M650 455H680V480H810V420H1120':'M650 455H690V420H1120';
 const pePath=scheme==='tns'?'M240 300H278V480H1060V545H1120':cs?'M810 480H1060V545H1120':c?'M810 420V480H1060V545H1120':'M810 480H1060V545H1120';
 const label=(x,y,t,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${t}</text>`;
 const cable=(d,type,id='')=>`<g ${id?`id="${id}"`:''} data-conductor="${type}"><path d="${d}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>${wire(d,type)}</g>`;
 const screw=(x,y)=>`<circle cx="${x}" cy="${y}" r="4" fill="#d3b75a" stroke="#74622b"/><path d="M${x-2} ${y-2}l4 4" stroke="#6c5824"/>`;
 const rod=(x,name,id)=>`<g id="${id}" data-component="eletrodo"><ellipse cx="${x}" cy="658" rx="35" ry="9" fill="#473326" opacity=".3"/><rect x="${x-6}" y="630" width="12" height="99" rx="4" fill="url(#copper)"/><rect x="${x-15}" y="641" width="30" height="14" rx="3" fill="#b99c55" stroke="#736131"/>${screw(x,648)}${label(x-86,761,name,'soil-label')}</g>`;
 let out=`<title id="diagramTitle">${s.name}: fonte, poste da rede, medição, quadro de distribuição e massa</title><desc id="diagramDesc">${s.summary} ${fault?s.fault:s.normal} ${it?'A fonte não tem aterramento direto.':`O eletrodo está junto ao padrão de entrada, ligado ao ${scheme==='tns'?'PE separado':c||cs?'PEN':'neutro da alimentação'}.`} O padrão de medição é um elemento separado.</desc>
 <defs>
 <linearGradient id="cabinet"><stop stop-color="#d7dde0"/><stop offset=".15" stop-color="#f5f7f8"/><stop offset=".82" stop-color="#b3bdc3"/><stop offset="1" stop-color="#89979f"/></linearGradient>
 <linearGradient id="pole"><stop stop-color="#909d9c"/><stop offset=".45" stop-color="#d5ddda"/><stop offset=".68" stop-color="#aab6b5"/><stop offset="1" stop-color="#75888b"/></linearGradient>
 <linearGradient id="washer"><stop stop-color="#e8edf0"/><stop offset=".45" stop-color="#b8c2c8"/><stop offset="1" stop-color="#88969f"/></linearGradient>
 <linearGradient id="copper"><stop stop-color="#8f3d16"/><stop offset=".35" stop-color="#ffb56b"/><stop offset=".65" stop-color="#d87530"/><stop offset="1" stop-color="#984319"/></linearGradient>
 <radialGradient id="glass"><stop stop-color="#536578"/><stop offset=".65" stop-color="#24313e"/><stop offset="1" stop-color="#101a27"/></radialGradient>
 <pattern id="bricks" width="128" height="58" patternUnits="userSpaceOnUse"><rect width="128" height="58" fill="#f1f2ee"/><path d="M0 0h128M0 29h128M0 58h128M64 0v29M0 29v29M128 29v29" stroke="#fff" stroke-width="3"/></pattern>
 <pattern id="dirt" width="34" height="28" patternUnits="userSpaceOnUse"><rect width="34" height="28" fill="#806047"/><path d="M2 5l6 3m10 7 5-3M9 24l5-4" stroke="#b28d67" stroke-width="3"/><circle cx="27" cy="25" r="2" fill="#513c2e"/><circle cx="10" cy="11" r="2" fill="#664832"/></pattern>
 </defs>
 <rect width="1440" height="790" fill="#fbfcfb"/>
 <rect x="710" y="210" width="315" height="440" fill="url(#bricks)"/>
 <rect y="651" width="1440" height="139" fill="url(#dirt)"/><rect y="643" width="1440" height="8" fill="#bbad92"/><path d="M0 643h1440" stroke="#99ad82" stroke-width="4"/>
 <g id="utilityPole" data-component="poste-rede"><rect x="130" y="102" width="52" height="594" rx="5" fill="url(#pole)" stroke="#849692"/><rect x="47" y="153" width="205" height="16" rx="3" fill="#879795"/><path d="M80 125v29m74-29v29m73-29v29" stroke="#667278" stroke-width="8"/><path d="M67 129h26m-26 8h26m48-8h26m-26 8h26m48-8h26m-26 8h26" stroke="#b6a287" stroke-width="5"/><path d="M0 115H275" stroke="#696b70" stroke-width="3"/>
 ${label(35,67,'02 · POSTE DA REDE','scene-heading')}${label(35,87,'Suporte da rede e do transformador','scene-small')}</g>
 <g id="sourceTransformer" data-component="fonte"><rect x="83" y="193" width="183" height="154" rx="12" fill="#000" opacity=".12" transform="translate(6 5)"/><rect x="83" y="193" width="183" height="154" rx="12" fill="url(#cabinet)" stroke="#78898d" stroke-width="3"/><path d="M95 206v125m10-125v125m10-125v125" stroke="#97a9ae" stroke-width="4"/>
 <rect x="123" y="212" width="130" height="118" rx="6" fill="#edf4f5" stroke="#90a7ad"/><path id="sourceWinding" d="M240 240H190q-22 8 0 15q-22 8 0 15q-22 8 0 15q-22 8 0 15H240" fill="none" stroke="#586473" stroke-width="3"/>
 ${label(18,379,'01 · FONTE','scene-heading')}${label(18,399,it?'Transformador dedicado':'Transformador','scene-small')}${label(18,419,it?'Exemplo IT':'no poste da rede','scene-small')}${label(134,228,'Secundário','scene-small')}</g>
 <g id="meterStandard" data-component="medicao"><rect x="428" y="198" width="55" height="497" rx="5" fill="url(#pole)" stroke="#849692"/><rect x="367" y="267" width="192" height="240" rx="8" fill="url(#cabinet)" stroke="#798a92" stroke-width="3"/><rect x="382" y="283" width="161" height="207" rx="4" fill="#858e91" stroke="#e4ebee" stroke-width="4"/>
 ${label(365,67,'03 · PADRÃO DE MEDIÇÃO','scene-heading')}${label(365,87,'Entrada da residência','scene-small')}${label(365,117,'Mede a energia consumida','scene-small')}${label(340,594,'Suporte do medidor','scene-small')}</g>
 <g id="distributionBoard" data-component="quadro"><rect x="738" y="278" width="260" height="294" rx="9" fill="#000" opacity=".1" transform="translate(6 6)"/><rect x="738" y="278" width="260" height="294" rx="9" fill="url(#cabinet)" stroke="#798a92" stroke-width="3"/><rect x="755" y="296" width="225" height="257" rx="5" fill="#d7e0e4" stroke="#f7fafb" stroke-width="4"/>
 ${label(723,67,'04 · QUADRO DE DISTRIBUIÇÃO','scene-heading')}${label(723,87,'Dentro da instalação','scene-small')}${label(723,117,'Proteções e barras identificadas','scene-small')}</g>
 <g id="equipmentMass" data-component="massa"><ellipse cx="1216" cy="638" rx="129" ry="12" fill="#000" opacity=".12"/><rect x="1100" y="630" width="254" height="17" fill="#b4bbc0"/><path d="M1120 332l19-14h196v307l-19 11H1120Z" fill="#64717b"/><rect x="1120" y="332" width="196" height="298" rx="6" fill="url(#washer)" stroke="${fault?'#d63845':'#75818a'}" stroke-width="${fault?4:2}"/>
 <rect x="1128" y="343" width="179" height="51" rx="4" fill="#d8dfe2" stroke="#929ea5"/><rect x="1138" y="353" width="46" height="24" fill="#bec8cc" stroke="#8f9ca4"/><circle cx="1207" cy="366" r="13" fill="#d6dde1" stroke="#667782" stroke-width="3"/><path d="M1207 355v8" stroke="#596974" stroke-width="3"/><rect x="1231" y="352" width="62" height="22" rx="2" fill="#1e2e37"/>${label(1239,368,'0:45','display-text')}
 <circle cx="1218" cy="499" r="77" fill="#26303b" stroke="#788995" stroke-width="7"/><circle cx="1218" cy="499" r="62" fill="url(#glass)" stroke="#151f2a" stroke-width="7"/><path d="M1170 488q28-26 54 0t40 17q-23 20-46 8t-47 7" fill="#84959e" opacity=".33"/><path d="M1179 456q39-28 70 2" stroke="#ced9e0" stroke-width="5" fill="none" opacity=".55"/>
 ${label(1120,245,'05 · MASSA','scene-heading')}${label(1120,267,'Carcaça metálica do equipamento','scene-small')}${label(1152,610,c?'Carga fixa (ilustração)':'Máquina de lavar','scene-small')}</g>
 ${cable(L,'L','phaseConductor')}${cable(returnIncoming,c||cs?'PEN':it?'L2':'N','incomingReturn')}${cs?cable('M650 455H680V480H810','PEN','incomingPEN')+cable('M810 480V420H1120','N','neutralAfterSplit'):cable(normalReturn,c?'PEN':it?'L2':'N','outgoingReturn')}${cable(pePath,c?'PEN':'PE','massProtection')}
 ${cable(`M810 ${c?420:480}V660`,'PE','installationEarthConductor')}${rod(810,'Eletrodo da instalação','installationElectrode')}`;
 if(it){
  out+=`<g id="sourceEarthEquivalent"><path d="M190 270H70V548H240V571m0 42v47" stroke="#8867a8" stroke-width="3" stroke-dasharray="5 5" fill="none"/>${node(190,270,'#8867a8')}`;
  out+=itImpedance?`<rect x="228" y="571" width="24" height="42" rx="3" fill="#e1d4ee" stroke="#8867a8"/>${label(256,598,'Z alta','scene-small')}${rod(240,'Fonte via impedância','sourceElectrode')}`:`<path d="M225 581h30m-30 12h30M240 571v10m0 12v20" stroke="#8867a8" stroke-width="3" fill="none"/><path d="M240 660v15m-20 0h40m-34 9h28m-21 9h14" stroke="#e8d5ff" stroke-width="3" fill="none"/>${label(90,510,'Capacitâncias e isolação','scene-small')}${label(90,530,'equivalente distribuído','scene-small')}${label(130,761,'Sem ligação direta à terra','soil-label')}`;
  out+='</g>';
  out+=`<rect x="895" y="488" width="69" height="46" rx="4" fill="#f8f6ee" stroke="#9b8e72"/><circle cx="907" cy="501" r="4" fill="${fault?'#f0802f':'#40a46a'}"/>${label(921,510,'DSI','scene-small')}${label(891,552,fault?'Primeira falta: sinaliza':'Supervisão da isolação','scene-small')}`;
 }else{
  const entryY=scheme==='tns'?480:455;
  out+=cable(`M550 ${entryY}V660`,'PE','entranceEarthConductor')+rod(550,'Eletrodo do padrão','entranceElectrode')+node(550,entryY,'#176e45');
  out+=`<path d="M506 546h34" stroke="#188d52" stroke-width="2"/>${label(315,535,'Terra do padrão','pe-label')}${label(315,555,scheme==='tns'?'Ligado ao PE':c||cs?'Ligado ao PEN':'Ligado ao neutro','scene-small')}`;
 }
 // O medidor permanece na entrada. Os dispositivos do circuito e as barras ficam no quadro.
 out+=`<g id="energyMeter"><rect x="390" y="310" width="81" height="101" rx="4" fill="#d2d7d6" stroke="#303b43" stroke-width="3"/><rect x="403" y="322" width="55" height="46" fill="#b4c3b0" stroke="#748472"/>${label(407,350,'01245','meter-display')}<rect x="400" y="383" width="60" height="17" fill="#323c42"/><rect x="407" y="387" width="7" height="9" fill="#eee"/><rect x="424" y="387" width="7" height="9" fill="#eee"/><rect x="441" y="387" width="7" height="9" fill="#eee"/>${label(391,437,'MEDIDOR','scene-small')}</g>
 <rect x="485" y="318" width="46" height="93" rx="4" fill="#edf0eb" stroke="#374047" stroke-width="2"/><rect x="497" y="351" width="20" height="28" rx="3" fill="#30383f"/>${screw(508,331)}${screw(508,399)}${label(478,435,'Geral','scene-small')}
 <rect x="837" y="341" width="117" height="111" rx="6" fill="#f1f4ef" fill-opacity=".5" stroke="#8f9a9f"/><path d="M855 370h33" stroke="#364b55" stroke-width="4"/>${c?'':'<path d="M855 420h33" stroke="#364b55" stroke-width="4"/>'}${label(854,397,(c||it)?'DJ':'DR + DJ','scene-heading')}
 ${label(608,357,it?'L1':'F','wire-label')}${label(609,443,c||cs?'PEN':it?'L2':'N','neutral-label')}${label(1026,357,it?'L1':'F','wire-label')}${label(1026,411,c?'PEN':it?'L2':'N','neutral-label')}${label(1008,504,c?'PEN':'PE','pe-label')}
 <rect id="protectionBar" x="798" y="464" width="25" height="37" rx="3" fill="#c0a459" stroke="#756129"/>${screw(810,472)}${screw(810,490)}${label(762,531,c?'Barra PEN':'Barra PE / BEP','scene-small')}`;
 if(!c)out+=`<rect id="neutralBar" x="798" y="406" width="25" height="28" rx="3" fill="${it?'#bea2d2':'#78c1e3'}" stroke="#537891"/>${screw(810,414)}${screw(810,426)}${label(765,401,it?'L2':'Barra N','scene-small')}`;
 if(cs)out+=`<g id="penSeparation">${node(810,480,'#efdb77')}${node(810,420,'#169dd2')}<rect x="708" y="163" width="298" height="44" rx="6" fill="#293137"/>${label(722,190,'Separação PEN → PE + N neste quadro','callout-white')}<path d="M790 207H704V480H791" fill="none" stroke="#cf3a49" stroke-width="2"/><path d="M782 475l9 5-9 5" fill="none" stroke="#cf3a49" stroke-width="2"/></g>`;
 if(c||cs)out+=`<path d="M301 455h19M630 455h19" stroke="#169dd2" stroke-width="8"/>`;
 if(scheme==='tt')out+=`<rect x="727" y="168" width="262" height="41" rx="6" fill="#fff" stroke="#b9cbd2"/>${label(741,195,'TT: barra N isolada da barra PE','scene-heading')}`;
 if(scheme==='tns')out+=`<rect x="703" y="168" width="303" height="41" rx="6" fill="#fff" stroke="#b9cbd2"/>${label(719,195,'TN-S: PE vem separado desde a fonte','scene-heading')}`;
 // Pequeno detalhe da carga isolado da carcaça; o PE é ligado diretamente à massa.
 out+=`<rect x="1115" y="346" width="61" height="96" rx="5" fill="#f6fafb" fill-opacity=".9" stroke="#9daeb7"/><path d="M1120 370h25v12l15-6v25h-15v19h-25" stroke="#545a5c" stroke-width="3" fill="none"/>${label(1124,459,'Carga','scene-small')}${node(1120,545,'#d7c36a')}`;
 if(fault)out+=`<circle cx="1128" cy="522" r="23" class="fault-glow"/><path d="M1120 370l15 130-9 15 17-4-11 19" stroke="#d13e41" stroke-width="4" fill="none"/>${label(1170,586,'Falta na carcaça','fault-label')}`;
 let flow;
 if(!fault)flow=L+'H1145V382L1160 376V401H1145V420H1120'+(cs?'H810V480H680V455H290V300H240':'H690V455H290V300H240')+'H190V240H240';
 else if(scheme==='tt')flow=L+'L1135 500L1120 545H1060V480H810V690H550V455H290V300H240H190V240H240';
 else if(scheme==='tns')flow=L+'L1135 500L1120 545H1060V480H278V300H240H190V240H240';
 else if(cs)flow=L+'L1135 500L1120 545H1060V480H680V455H290V300H240H190V240H240';
 else if(c)flow=L+'L1135 500L1120 545H1060V480H810V420H690V455H290V300H240H190V240H240';
 else flow=L+'L1135 500L1120 545H1060V480H810V690H240V548H70V270H190V240H240';
 out+=`<path d="${flow}" fill="none" stroke="#253741" stroke-width="5" opacity=".26"/><path class="current-flow" d="${flow}"/>`;
 if(fault&&(scheme==='tt'||it))out+=label(355,717,'Percurso pelo solo de volta à fonte','soil-label');
 out+=`<path d="M640 90V300m0 235v77" stroke="#bac6cb" stroke-width="1" stroke-dasharray="6 8"/>${label(362,225,'Medição não é distribuição','scene-small')}`;
 $('diagram').setAttribute('viewBox','0 0 1440 790');$('diagram').innerHTML=out;
 $('diagramNote').textContent=(fault?'Percurso de falta destacado antes do seccionamento. ':'Fonte no poste da rede → padrão de medição → quadro de distribuição → equipamento. ')+(it?'IT representado sem neutro distribuído; a fonte pode ser um transformador dedicado. ':'Uma fase representada. ')+'Ligações conceituais: detalhes do padrão de entrada e a posição do BEP dependem do projeto e da distribuidora. A animação indica o caminho, não o sentido real da corrente alternada.';
 $('slideReference').hidden=!['tt','tncs'].includes(scheme);
 if(['tt','tncs'].includes(scheme)){$('slideImage').src='../assets/aterramento-slide-'+scheme+'.png';$('slideImage').alt='Imagem do material de aula: '+s.name+' com padrão de entrada, máquina de lavar e eletrodos';}
}

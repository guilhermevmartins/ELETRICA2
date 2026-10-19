/* Animações vetoriais locais, sem dependências ou requisições externas. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), TAU=Math.PI*2, C={in:'#35caf0',compression:'#f2be56',out:'#ff7180',liquid:'#4dd9aa'};
 const types=window.COMPRESSORES;
 let type=types.find(t=>t.id===new URLSearchParams(location.search).get('tipo'))||types[0];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let phase=0,playing=!reduced.matches,speed=1,raf=0,last=0,drawTime=0,lastStage=-1,selected=0;
 const mod=x=>(x%TAU+TAU)%TAU, point=(x,y,r,a)=>[x+r*Math.cos(a),y+r*Math.sin(a)];
 const n=v=>Number(v.toFixed(2)), xy=p=>p.map(n).join(','), line=(a,b,stroke='#b1c9d8',w=6)=>`<path d="M${xy(a)}L${xy(b)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;
 const circle=(x,y,r,fill,extra='')=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" ${extra}/>`;
 const text=(x,y,t,cls='',anchor='middle')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${t}</text>`;
 const rect=(x,y,w,h,fill,extra='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" ${extra}/>`;
 const poly=(pts,fill,extra='')=>`<path d="M${pts.map(xy).join('L')}Z" fill="${fill}" ${extra}/>`;
 const piece=(id,content)=>`<g class="piece ${selected===id?'selected':''}" data-piece="${id}">${content}</g>`;
 const arcPoints=(x,y,r,a,b,count=40)=>Array.from({length:count+1},(_,i)=>point(x,y,r,a+(b-a)*i/count));
 const annulus=(x,y,r1,r2,a,b,color)=>poly([...arcPoints(x,y,r2,a,b),...arcPoints(x,y,r1,b,a)],color);
 function arrow(a,b,color){return `<path d="M${xy(a)}L${xy(b)}" stroke="${color}" stroke-width="4" fill="none" marker-end="url(#arrow)"/>`;}
 function ports(input=[205,210],output=[695,210]){
  return line([95,input[1]],input,C.in,24)+arrow([105,input[1]], [input[0]-12,input[1]],C.in)+text(95,input[1]-30,'ENTRADA','', 'start')+
  line(output,[805,output[1]],C.out,24)+arrow([output[0]+12,output[1]],[800,output[1]],C.out)+text(805,output[1]-30,'SAÍDA','', 'end');
 }
 function particlesPath(points,color,count=8,offset=phase){
  if(!$('air').checked)return '';
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);
  return Array.from({length:count},(_,i)=>{let d=((i/count+offset)%1)*total,j=0;while(j<lengths.length-1&&d>lengths[j])d-=lengths[j++];const f=d/lengths[j],p=points[j],q=points[j+1];return circle(p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f,3.5,color,'stroke="#0a1a28" stroke-width="1"')}).join('');
 }
 function gasDots(x,y,r,cx,cy,inner){
  if(!$('air').checked)return '';let s='';for(let i=0;i<42;i++){const a=i*2.399963+phase*.3,d=r*Math.sqrt((i+.5)/42),px=x+d*Math.cos(a),py=y+d*Math.sin(a);if(Math.hypot(px-cx,py-cy)>inner+7)s+=circle(px,py,2.5,'#e8faff','opacity=".75"');}return s;
 }
 function label(x,y,px,py,name){return `<path class="leader" d="M${x} ${y+6}V${y+18}L${n(px)} ${n(py)}"/>`+text(x,y,name,'part-label');}
 function labels(list){$('labels').innerHTML=$('names').checked?list.map(a=>label(...a)).join(''):'';}
 function cycleState(){
  if(type.id==='pistoes-axiais')return window.AxialPistonView.state(phase,Number($('axialCylinder').value));
  if(type.id==='pistao'||type.id==='membrana'){
   const a=TAU*phase, hydraulic=type.id==='membrana';
   const top=hydraulic?diaphragmPose().top:462-75*Math.cos(a)-Math.sqrt(200**2-(75*Math.sin(a))**2)-25;
   const v=.08+(hydraulic?(top-270)/104:(top-162)/150), ratio=4,k=1.3,expandEnd=.08*Math.pow(ratio,1/k);
   const p=phase<.5?Math.max(1,ratio*Math.pow(.08/v,k)):Math.min(ratio,Math.pow(1.08/v,k));
   const stage=phase<.5?(v<expandEnd?0:1):(p<ratio?2:3);
   return {stage,v,p,color:[C.compression,C.in,C.compression,C.out][stage]};
  }
  return {stage:(type.id==='palhetas'||type.id==='anel-liquido')?(phase<.125?0:phase<.5?1:phase<.875?2:3):Math.min(3,Math.floor(phase*4)),v:1-phase*.85,p:1+phase*3,color:phase<.25?C.in:phase<.75?C.compression:C.out};
 }
 function piston(s){
  const a=TAU*phase, crank=[450+75*Math.sin(a),462-75*Math.cos(a)];
  const pin=[450,crank[1]-Math.sqrt(200**2-(crank[0]-450)**2)],py=pin[1]-25;
  const intake=s.stage===1,exhaust=s.stage===3,liftIn=intake?12:0,liftOut=exhaust?-12:0;
  const angle=0;
  const world=(x,y)=>[470+(x-450)*Math.cos(angle)-(y-335)*Math.sin(angle),335+(x-450)*Math.sin(angle)+(y-335)*Math.cos(angle)];
  const inlet=world(385,100),outlet=world(515,100);
  let out=`<defs>
   <linearGradient id="p-case"><stop stop-color="#607f8d"/><stop offset=".45" stop-color="#456270"/><stop offset="1" stop-color="#263f4b"/></linearGradient>
   <linearGradient id="p-wall"><stop stop-color="#a6bec9"/><stop offset=".3" stop-color="#688996"/><stop offset="1" stop-color="#3c5967"/></linearGradient>
   <linearGradient id="p-piston"><stop stop-color="#8cabb9"/><stop offset=".22" stop-color="#e4eef2"/><stop offset=".66" stop-color="#c4d5de"/><stop offset="1" stop-color="#7796a6"/></linearGradient>
   <linearGradient id="p-rod"><stop stop-color="#718e9c"/><stop offset=".4" stop-color="#d8e7ed"/><stop offset=".7" stop-color="#a6c0cc"/><stop offset="1" stop-color="#688895"/></linearGradient>
   <linearGradient id="p-gas" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${s.color}" stop-opacity=".95"/><stop offset="1" stop-color="${s.stage===1?'#0589c1':s.stage===3?'#b94466':'#a97928'}" stop-opacity=".75"/></linearGradient>
   <radialGradient id="p-crank"><stop stop-color="#526f80"/><stop offset=".85" stop-color="#344f60"/><stop offset="1" stop-color="#233d4e"/></radialGradient>
  </defs>`;
  // Tubulações conectadas aos canais do cabeçote, antes das válvulas.
  const pipe=(d,color)=>`<path d="${d}" fill="none" stroke="#263f4b" stroke-width="38" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#81a5b5" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/>`;
  out+=pipe(`M92 70H${n(inlet[0]-30)}Q${n(inlet[0])} 70 ${n(inlet[0])} 95L${xy(inlet)}`,C.in);
  out+=pipe(`M${xy(outlet)}V60Q${n(outlet[0])} 30 ${n(outlet[0]+30)} 30H800`,C.out);
  out+=text(105,38,'ADMISSÃO','caption','start')+text(798,73,'DESCARGA','caption','end');
  if($('air').checked){
   if(intake)out+=arrow([105,70],[175,70],'#d3f7ff');
   if(exhaust)out+=arrow([705,30],[780,30],'#ffdae0');
   if(intake)out+=particlesPath([[100,70],[inlet[0],70],inlet], '#dcfaff',9);
   if(exhaust)out+=particlesPath([outlet,[outlet[0],30],[800,30]], '#ffe2e7',12);
  }
  let core='';
  // Corpo e cárter fixos; o conjunto mantém o alinhamento do mecanismo.
  core+=piece(0,
   rect(322,123,256,293,'url(#p-case)','rx="19" stroke="#8da9b8" stroke-width="2"')+
   circle(450,462,109,'url(#p-case)','stroke="#8da9b8" stroke-width="2"')+
   rect(340,150,220,250,'#152e3a','rx="2"')+circle(450,462,91,'#142c39','stroke="#6b8797" stroke-width="2"'));
  // Aletas laterais, camisa do cilindro e parafusos do cabeçote.
  for(let i=0;i<7;i++)core+=rect(311,174+i*27,17,8,'#698a99','rx="3"')+rect(572,174+i*27,17,8,'#698a99','rx="3"');
  core+=rect(329,151,11,233,'url(#p-wall)')+rect(560,151,11,233,'url(#p-wall)');
  core+=rect(340,150,220,Math.max(0,py-150),'url(#p-gas)');
  if($('air').checked){
   for(let i=0;i<24;i++)core+=circle(354+(i%6)*38,154+Math.floor(i/6)*Math.max(1,(py-158)/4),2,'#e7faff','opacity=".52"');
   if(intake)core+=arrow([385,159],[385,Math.min(py-5,203)],'#c6f7ff');
   if(exhaust)core+=arrow([515,Math.min(py-3,205)],[515,158],'#ffe0e7');
  }
  // Volante e contrapeso atrás da biela, preservando a articulação visível.
  let rotating=circle(450,462,81,'url(#p-crank)','stroke="#90aeba" stroke-width="2"');
  for(let i=0;i<4;i++){
   const h=point(450,462,53,a+i*Math.PI/2);
   rotating+=circle(...h,15,'#17313f','stroke="#5b7b8d" stroke-width="2"');
  }
  const weightAngle=a+Math.PI/2;
  rotating+=poly([point(450,462,29,weightAngle-.75),...arcPoints(450,462,76,weightAngle-.75,weightAngle+.75),point(450,462,29,weightAngle+.75)],'#7d98a6','stroke="#afc4ce" stroke-width="1.5"');
  rotating+=line([450,462],crank,'#aec3cd',22)+circle(450,462,19,'url(#p-piston)','stroke="#d2e1e8" stroke-width="2"');
  core+=piece(3,rotating);
  const dx=crank[0]-pin[0],dy=crank[1]-pin[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  const offset=(p,d)=>[p[0]+nx*d,p[1]+ny*d];
  let rod=poly([offset(pin,10),offset(crank,16),offset(crank,-16),offset(pin,-10)],'url(#p-rod)','stroke="#7f9dab" stroke-width="1.5"');
  rod+=line(offset(pin,0),offset(crank,0),'#e8f2f6',3);
  rod+=circle(...crank,24,'url(#p-rod)','stroke="#c1d3dc" stroke-width="2"')+circle(...crank,12,'#294859','stroke="#83a4b6" stroke-width="2"');
  core+=piece(2,rod);
  let head=rect(341,py,218,59,'url(#p-piston)','rx="3" stroke="#bcd0db" stroke-width="1.5"');
  head+=rect(342,py,216,5,'#e4eff5')+line([342,py+11],[558,py+11],'#3d5969',3)+line([342,py+18],[558,py+18],'#3d5969',3)+line([342,py+24],[558,py+24],'#6a8695',2);
  head+=rect(356,py+32,29,21,'#849fac','rx="3" opacity=".55"')+rect(515,py+32,29,21,'#849fac','rx="3" opacity=".55"');
  head+=circle(450,pin[1],13,'#456777','stroke="#dbe7ed" stroke-width="3"')+circle(450,pin[1],6,'#1d3b4c');
  core+=piece(1,head);
  // Cabeçote em corte e válvulas de sede sincronizadas com a fase ativa.
  core+=rect(320,102,260,48,'url(#p-wall)','rx="12" stroke="#9ab6c4" stroke-width="2"');
  for(const [x,color] of [[385,C.in],[515,C.out]]){
   core+=rect(x-15,98,30,53,color)+rect(x-24,145,10,8,'#d0dee5')+rect(x+14,145,10,8,'#d0dee5');
   core+=circle(x-43,122,5,'#1d3e50','stroke="#9ab8c8" stroke-width="2"')+circle(x+43,122,5,'#1d3e50','stroke="#9ab8c8" stroke-width="2"');
  }
  function valve(x,lift,id){
   return piece(id,`<g transform="translate(0 ${lift})">`+
    rect(x-3,85,6,65,'#f2ce72','rx="2"')+rect(x-11,81,22,5,'#ffe5a1','rx="2"')+
    poly([[x-5,142],[x+5,142],[x+22,150],[x+22,154],[x-22,154],[x-22,150]],'#e8bd54','stroke="#ffe29b" stroke-width="1.2"')+`</g>`+
    `<path d="M${x-8} 105L${x+8} 110L${x-8} 115L${x+8} 120L${x-8} 125L${x+8} 130" fill="none" stroke="#ffe8af" stroke-width="1.7"/>`);
  }
  core+=valve(385,liftIn,4)+valve(515,liftOut,5);
  out+=`<g class="piston-cut" transform="translate(20 0)">${core}</g>`;
  const inSeat=world(385,150+liftIn),outSeat=world(515,150+liftOut),pist=world(350,py+25),rodMid=world((pin[0]+crank[0])/2,(pin[1]+crank[1])/2),shaft=world(450,462),cyl=world(573,238);
  labels([[113,223,...inSeat,'Válvula de admissão'],[636,113,...outSeat,'Válvula de descarga'],[126,370,...pist,'Pistão e anéis'],[775,283,...cyl,'Cilindro'],[775,400,...rodMid,'Biela'],[748,530,...shaft,'Virabrequim']]);
  return out;
 }
 function diaphragmPose(){
  const a=TAU*phase,crank=[450+52*Math.sin(a),480-52*Math.cos(a)];
  const pin=[450,crank[1]-Math.sqrt(130**2-(crank[0]-450)**2)],top=pin[1]-28;
  const travel=(top-270)/104;
  // Área do pistão × curso = área deslocada pela curva da membrana neste corte.
  const flex=39,membrane=175+.08*flex+flex*travel;
  return {a,crank,pin,top,travel,membrane};
 }
 function diaphragm(s){
  const pose=diaphragmPose(),{a,crank,pin,top,travel,membrane}=pose;
  const intake=s.stage===1,exhaust=s.stage===3,control=2*membrane-205;
  const membranePath=`M290 205Q450 ${n(control)} 610 205`;
  const gasPath=`M290 205Q450 145 610 205Q450 ${n(control)} 290 205Z`;
  const oilPath=`${membranePath}V252H490V${n(top)}H410V252H290Z`;
  let out=`<defs>
   <linearGradient id="d-blue"><stop stop-color="#165c83"/><stop offset=".48" stop-color="#287da4"/><stop offset="1" stop-color="#104566"/></linearGradient>
   <linearGradient id="d-side"><stop stop-color="#124663"/><stop offset="1" stop-color="#0a2d43"/></linearGradient>
   <linearGradient id="d-metal"><stop stop-color="#849eac"/><stop offset=".25" stop-color="#e1eaef"/><stop offset=".6" stop-color="#b6cad5"/><stop offset="1" stop-color="#6f8a9b"/></linearGradient>
   <linearGradient id="d-oil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e5b856"/><stop offset="1" stop-color="#9d641e"/></linearGradient>
   <linearGradient id="d-gas" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${s.color}"/><stop offset="1" stop-color="${s.color}" stop-opacity=".55"/></linearGradient>
   <clipPath id="d-gas-clip"><path d="${gasPath}"/></clipPath>
   <clipPath id="d-oil-clip"><path d="${oilPath}"/></clipPath>
  </defs>`;
  const pipe=(d,color)=>`<path d="${d}" stroke="#344f60" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" stroke="#9bb6c5" stroke-width="24" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" stroke="${color}" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  out+=pipe('M100 80H326Q350 80 350 104V160',C.in)+pipe('M550 160V69Q550 45 574 45H800',C.out);
  out+=text(100,47,'ENTRADA DO GÁS','caption','start')+text(800,83,'GÁS COMPRIMIDO','caption','end');
  // Volume externo com faces laterais e uma janela de corte no acionamento.
  out+=poly([[338,392],[361,377],[585,377],[562,392],[562,552],[585,537],[585,377]],'url(#d-side)','stroke="#337c9e" stroke-width="1.5"');
  out+=rect(338,392,224,163,'url(#d-blue)','rx="13" stroke="#78a8c0" stroke-width="2"');
  out+=rect(356,408,188,134,'#112b3c','rx="8" stroke="#a6c0cd" stroke-width="3"');
  out+=poly([[382,252],[404,238],[538,238],[516,252],[516,429],[538,415],[538,238]],'url(#d-side)');
  out+=rect(382,250,134,179,'url(#d-blue)','rx="5" stroke="#6f9cb3" stroke-width="2"')+rect(410,250,80,180,'#142e3e');
  out+=rect(320,553,260,18,'url(#d-blue)','rx="4" stroke="#75a1b6" stroke-width="2"')+poly([[320,553],[340,541],[599,541],[580,553]],'#397f9f');
  for(const [x,y] of [[347,403],[553,403],[347,540],[553,540],[335,562],[565,562]])out+=circle(x,y,4,'#1b425c','stroke="#94b2c4" stroke-width="1.5"');
  // Cabeçote largo com tampa metálica arqueada, como no corte da referência.
  out+=poly([[265,165],[286,150],[656,150],[635,165],[635,263],[656,248],[656,150]],'url(#d-side)','stroke="#4388a8" stroke-width="1.5"');
  out+=piece(0,`<path d="M265 165Q450 105 635 165V263H265Z" fill="url(#d-blue)" stroke="#8aabba" stroke-width="2"/>`+
   `<path d="M265 165Q450 105 635 165V194Q450 134 265 194Z" fill="url(#d-metal)" stroke="#c3d2da" stroke-width="1.5"/>`);
  out+=`<path d="M290 205Q450 145 610 205V252H290Z" fill="#183747"/>`;
  out+=piece(2,`<path class="hydraulic-oil" d="${oilPath}" fill="url(#d-oil)"/>`);
  out+=`<path class="diaphragm-gas" d="${gasPath}" fill="url(#d-gas)"/>`;
  if($('air').checked){
   // O recorte mantém o gás acima da membrana em todo o ciclo.
   out+='<g clip-path="url(#d-gas-clip)">';
   for(let i=0;i<32;i++)out+=circle(305+(i%8)*41,180+Math.floor(i/8)*12,1.8,'#eaffff','opacity=".65"');
   if(intake)out+=particlesPath([[350,185],[365,197],[425,membrane-3],[505,membrane-5]],'#d9fbff',6);
   if(exhaust)out+=particlesPath([[400,membrane-3],[490,membrane-4],[550,186]],'#ffe0e6',6);
   out+='</g>';
   if(intake)out+=arrow([150,80],[220,80],'#e3faff')+particlesPath([[105,80],[350,80],[350,184]],'#e3faff',10);
   if(exhaust)out+=arrow([710,45],[780,45],'#ffe7ec')+particlesPath([[550,185],[550,45],[795,45]],'#ffe7ec',12);
   // O óleo transmite o deslocamento; o gás fica no circuito superior.
   out+='<g clip-path="url(#d-oil-clip)">';
   out+=phase<.5?arrow([450,244],[450,Math.min(top-5,295)],'#ffecad'):arrow([450,Math.min(top-5,290)],[450,240],'#ffecad');
   out+='</g>';
  }
  out+=piece(1,`<path class="diaphragm-surface" d="${membranePath}" data-center-y="${n(membrane)}" fill="none" stroke="#425e70" stroke-width="8"/><path d="${membranePath}" fill="none" stroke="#e5eff5" stroke-width="4"/>`);
  // Serrage périphérique: la membrane ne peut se déplacer qu'au centre.
  for(const x of [285,610])out+=rect(x,199,6,13,'#bdcdd7','rx="1"');
  for(const x of [282,318,394,450,506,582,618]){
   const y=176-27*(1-((x-450)/185)**2);
   out+=circle(x,y,4.5,'#647f91','stroke="#e0e9ee" stroke-width="1.5"');
  }
  for(const [x,id,open,isIn] of [[350,5,intake,true],[550,6,exhaust,false]]){
   const cy=173+(open?(isIn?4:-4):0);
   out+=piece(id,rect(x-16,145,32,40,'url(#d-metal)','rx="4" stroke="#d0dfe7" stroke-width="1.5"')+
    rect(x-8,145,16,42,isIn?C.in:C.out)+
    line([x-10,isIn?169:177],[x-4,isIn?173:173],'#d3e0e8',3)+line([x+4,173],[x+10,isIn?169:177],'#d3e0e8',3)+
    circle(x,cy,5,'#f3d386','stroke="#fff0bd" stroke-width="1"'));
  }
  // Acionamento biela-manivela e pistão hidráulico separados da câmara do gás.
  let drive=circle(450,480,67,'#345365','stroke="#90aebf" stroke-width="2"');
  for(let i=0;i<3;i++)drive+=circle(...point(450,480,42,a+i*TAU/3),12,'#122d3e','stroke="#7696aa" stroke-width="1.5"');
  drive+=line([450,480],crank,'#adc6d3',18)+circle(450,480,15,'url(#d-metal)','stroke="#cfdee6" stroke-width="1.5"');
  const dx=crank[0]-pin[0],dy=crank[1]-pin[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  drive+=poly([[pin[0]+nx*7,pin[1]+ny*7],[crank[0]+nx*12,crank[1]+ny*12],[crank[0]-nx*12,crank[1]-ny*12],[pin[0]-nx*7,pin[1]-ny*7]],'url(#d-metal)','stroke="#86a6b8" stroke-width="1.5"');
  drive+=circle(...crank,17,'url(#d-metal)','stroke="#cedde6" stroke-width="1.5"')+circle(...crank,8,'#24485e');
  out+=piece(4,drive);
  out+=piece(3,rect(411,top,78,54,'url(#d-metal)','rx="3" stroke="#d8e5ec" stroke-width="1.5"')+
   line([412,top+9],[488,top+9],'#4b6d80',3)+line([412,top+16],[488,top+16],'#4b6d80',3)+
   circle(...pin,8,'#456777','stroke="#d9e5ec" stroke-width="2"'));
  labels([[139,149,350,173,'Admissão'],[757,133,550,173,'Descarga'],[139,300,321,205+4*(31/320)*(1-31/320)*(membrane-205),'Diafragma metálico'],[750,290,565,239,'Óleo hidráulico'],[744,379,485,top+28,'Pistão hidráulico'],[148,474,433,454,'Biela e virabrequim']]);
  return `<g class="diaphragm-cut" data-piston-y="${n(top)}" data-travel="${n(travel)}">${out}</g>`;
 }
 function rolling(){
  const x=450,y=310,R=170,r=118,e=R-r,a=-Math.PI/2+TAU*phase,cx=x+e*Math.cos(a),cy=y+e*Math.sin(a),vy=cy-Math.sqrt(r*r-(x-cx)**2);
  const va=Math.atan2(vy-cy,x-cx),inside=mod(a-va),gas=[...arcPoints(x,y,R,-Math.PI/2,a),...arcPoints(cx,cy,r,a,a-inside)];
  let out=line([805,190],[562,190],C.in,22)+arrow([760,190],[590,190],C.in)+text(805,155,'ENTRADA','', 'end')+line([338,190],[95,190],C.out,22)+arrow([300,190],[110,190],C.out)+text(95,155,'SAÍDA','', 'start');
  out+=piece(0,circle(x,y,R+15,'url(#hatch)','stroke="#8eacbf" stroke-width="4"'))+circle(x,y,R,'#173143')+circle(x,y,R,C.compression,'opacity=".65"')+poly(gas,C.in,'opacity=".85"');
  out+=gasDots(x,y,R,cx,cy,r);
  out+=piece(1,circle(cx,cy,r,'url(#metal)','stroke="#bed2df" stroke-width="3"'));
  out+=piece(2,circle(cx,cy,50,'#314e63','stroke="#b2cbdc" stroke-width="3"')+line([x,y],[cx,cy],'#f2be56',8)+circle(x,y,14,'#c7dbe8'));
  out+=piece(3,rect(x-8,112,16,vy-112,'#f5d16c','stroke="#d0ac49" stroke-width="2"'));
  out+=piece(4,`<path d="M442 50L458 58L442 66L458 74L442 82L458 90L450 100V112" fill="none" stroke="#c5d6df" stroke-width="3"/>`);
  out+=piece(5,line([322,160],[345,180],C.out,6));
  out+=circle(...point(x,y,R,a),6,'#fff');
  if($('air').checked)out+=particlesPath([[785,190],[585,190]],C.in)+particlesPath([[315,190],[105,190]],C.out);
  labels([[230,95,330,180,'Descarga'],[690,95,575,190,'Admissão'],[200,425,cx-90,cy+40,'Rolo'],[700,425,cx+30,cy+30,'Excêntrico'],[600,65,450,120,'Palheta + mola']]);
  return out+text(450,545,'A palheta desliza, mas não acompanha o giro.','caption');
 }
 function slidingVanes(){
  const p=window.VaneView?.render(phase,{selected,air:$('air').checked,showHousing:$('vaneShell').checked,showSprings:$('vaneSprings').checked,view:$('vaneView').value});
  if(!p)return vanes(false);
  $('vane3dLayer').style.display='block';
  if($('vaneView').value==='closed'){labels([[180,75,...p.body,'Carcaça com tampa'],[715,470,...p.shaft,'Eixo de acionamento']]);return '';}
  const notes=[[185,60,...p.body,'Estator / carcaça'],[705,66,...p.vane,'Pastilha deslizante'],[160,365,...p.inlet,'Admissão'],[745,365,...p.outlet,'Descarga'],[200,535,...p.rotor,'Rotor excêntrico'],[715,535,...p.shaft,'Eixo de acionamento']];
  $('labels').innerHTML=$('names').checked?notes.map(([x,y,px,py,name])=>{const dir=y>450?-1:1;return '<path class="leader" d="M'+x+' '+(y+dir*6)+'V'+(y+dir*18)+'L'+n(px)+' '+n(py)+'"/>'+text(x,y,name,'part-label');}).join(''):'';
  return '';
 }
 function vanes(liquid=false){
  const x=450,y=310,R=175,cx=liquid?420:405,cy=310,r=liquid?45:100,edge=liquid?110:R;
  let out=ports([310,190],[310,430]);
  // A saída está à esquerda inferior; o tubo é separado da admissão.
  out= line([95,190],[320,190],C.in,22)+arrow([140,190],[275,190],C.in)+text(95,155,'ENTRADA','', 'start')+
   line([315,430],[185,430],C.out,22)+arrow([280,430],[190,430],C.out)+text(185,475,'SAÍDA');
  out+=piece(0,circle(x,y,R+13,'url(#hatch)','stroke="#8eacbf" stroke-width="4"'))+circle(x,y,R,'#132c3c');
  if(liquid)out+=piece(2,annulus(x,y,edge,R,0,TAU,C.liquid));
  const count=liquid?12:8;
  for(let i=0;i<count;i++){
   const a=Math.PI+TAU*phase+i*TAU/count,b=a+TAU/count;
   const hit=t=>{const dx=cx-x,dy=cy-y,dot=dx*Math.cos(t)+dy*Math.sin(t);return -dot+Math.sqrt(dot*dot+edge*edge-dx*dx-dy*dy);};
   const boundary=Array.from({length:14},(_,j)=>{let t=a+(b-a)*j/13;return point(cx,cy,hit(t),t)}),mid=mod((a+b)/2),color=mid>Math.PI?C.in:mid<2.55?C.compression:C.out;
   out+=poly([point(cx,cy,r,a),...boundary,point(cx,cy,r,b)],color,i===0?'opacity=".8" stroke="#f5faff" stroke-width="2.5"':'opacity=".48"');
   out+=piece(liquid?1:2,line(point(cx,cy,r-10,a),point(cx,cy,liquid?142:hit(a),a),liquid?'#92b3c8':'#c2d9e8',liquid?8:6));
   if($('air').checked){let d=(r+hit((a+b)/2))/2;out+=circle(...point(cx,cy,d,(a+b)/2),3.5,'#fff','opacity=".8"');}
  }
  if(liquid){ // O líquido cobre parcialmente as pontas das pás.
   out+=annulus(x,y,edge,R,0,TAU,C.liquid+'bb');
   for(let i=0;i<16;i++)out+=circle(...point(x,y,158,i*TAU/16+phase*TAU),2,'#caffef');
  }
  out+=piece(1,circle(cx,cy,r,'url(#metal)','stroke="#c2d9e8" stroke-width="3"'))+circle(cx,cy,18,'#a7c6db')+circle(x,y,4,'#f5cc65');
  labels([[685,110,555,170,liquid?'Anel líquido':'Estator'],[690,360,500,330,liquid?'Pás do rotor':'Palhetas móveis'],[225,545,cx,cy,'Rotor excêntrico'],[660,545,555,400,'Células de gás']]);
  return out+text(450,80,'Acompanhe a célula contornada em branco durante a volta.','caption');
 }
 function screw(){
  const front=$('screwFront').getAttribute('aria-pressed')==='true';
  const points=window.ScrewView?.render(phase,{selected,air:$('air').checked,showHousing:$('screwShell').checked,frontView:front});
  $('screwControls').hidden=!points;
  if(!points)return screwFallback();
  $('screw3dLayer').style.display='block';
  const mapping=front?[[150,140,...points.male,'Rotor macho'],[750,140,...points.female,'Rotor fêmea'],[750,475,...points.housing,'Carcaça em corte']]:[[170,115,...points.male,'Rotor macho'],[715,115,...points.female,'Rotor fêmea'],[170,425,...points.housing,'Carcaça em corte'],[740,370,...points.gas,'Bolsas em destaque'],[145,520,...points.input,'Admissão'],[765,520,...points.output,'Descarga']];
  labels(mapping.filter(row=>(row.at(-1)!=='Carcaça em corte'||$('screwShell').checked)&&(row.at(-1)!=='Bolsas em destaque'||$('air').checked)));
  return text(450,570,front?'Vista frontal • os perfis giram em sentidos opostos':'Gás avança ao longo dos eixos → bolsas diminuem → descarga','caption');
 }
 function screwFallback(){
  let out=ports([245,225],[655,385]);
  out+=piece(0,rect(225,150,450,320,'url(#hatch)','rx="70" stroke="#92adbf" stroke-width="4"')+rect(242,172,416,276,'#142c3d','rx="55"'));
  const axes=[255,365];
  axes.forEach((y,rotor)=>{
   out+=line([205,y],[695,y],'#829eb2',15);
   out+=piece(rotor+1,rect(250,y-47,400,94,'url(#metal)','rx="35" stroke="#9cb6c9" stroke-width="2"'));
   let ribs='';
   for(let i=-1;i<8;i++){
    const x=250+i*62+(rotor?-1:1)*phase*62;
    if(x>240&&x<640)ribs+=`<path d="M${n(x)} ${y-42}Q${n(x+55)} ${y} ${n(x+12)} ${y+42}" fill="none" stroke="${rotor?'#7fa8be':'#c0d5e1'}" stroke-width="12"/>`;
   }
   out+=ribs;
  });
  // Bolsas representadas na faixa entre os rotores: avançam e ficam menores.
  for(let i=0;i<5;i++){
   const f=(i/5+phase)%1,x=260+f*365,w=49*(1-f)+9,color=f<.25?C.in:f<.8?C.compression:C.out;
   out+=piece(3,rect(x,298,w,24,color,'rx="10" stroke="#0b1b28" stroke-width="2"'));
   if($('air').checked)out+=circle(x+w/2,310,3,'white');
  }
  out+=arrow([275,505],[630,505],C.compression)+text(450,540,'Bolsas avançam axialmente → volume diminui','caption');
  labels([[325,110,350,220,'Rotor macho'],[595,110,580,225,'Hélices'],[310,585,350,375,'Rotor fêmea'],[690,540,600,310,'Bolsa de gás']]);
  return out;
 }
 function spiral(x,y,offset=0){let pts=[];for(let t=.5;t<5.2*Math.PI;t+=.035){let r=9.7*t;pts.push([x+r*Math.cos(t+offset),y+r*Math.sin(t+offset)]);}return `M${pts.map(xy).join('L')}`;}
 function scroll(){
  const x=450,y=305,ox=15*Math.cos(TAU*phase),oy=15*Math.sin(TAU*phase);
  let out=circle(x,y,198,'url(#hatch)','stroke="#92adbf" stroke-width="4"')+circle(x,y,182,'#163143');
  out+=line([100,220],[285,220],C.in,22)+arrow([140,220],[265,220],C.in)+text(100,180,'ENTRADA','', 'start');
  out+=piece(0,`<path d="${spiral(x,y)}" fill="none" stroke="#7e9caf" stroke-width="14" stroke-linecap="round"/>`);
  out+=piece(1,`<path d="${spiral(x+ox,y+oy,Math.PI)}" fill="none" stroke="#d8e6ed" stroke-width="12" stroke-linecap="round"/>`);
  out+=piece(2,circle(x+ox,y+oy,7,'#f6d471'));
  if($('air').checked)for(let i=0;i<12;i++){
   const f=(i/12+phase/3)%1,r=164*(1-f),a=TAU*3*f;
   out+=circle(x+r*Math.cos(a),y+r*Math.sin(a),8-5*f,f<.25?C.in:f<.8?C.compression:C.out,'opacity=".85"');
  }
  out+=piece(5,circle(x,y,14,'#ff7180','stroke="#fff" stroke-width="2"'));
  out+=arrow([470,305],[665,305],C.out)+text(690,300,'SAÍDA CENTRAL','', 'start')+text(690,323,'fora do plano','caption','start');
  // Marcador com a mesma orientação durante toda a órbita.
  out+=line([x+ox-40,y+oy+55],[x+ox+5,y+oy+55],'#f6d471',5)+line([x+ox-40,y+oy+55],[x+ox-40,y+oy+30],'#f6d471',5);
  labels([[240,90,370,190,'Espiral fixa'],[650,90,525+ox,180+oy,'Espiral orbitante'],[250,530,410+ox,360+oy,'Marcador de orientação']]);
  return out+text(450,575,'A orientação do marcador não muda durante a órbita.','caption');
 }
 function roots(){
  const view=$('rootsView').value;
  const points=window.RootsView?.render(phase,{selected,air:$('air').checked,showHousing:$('rootsShell').checked,view});
  if(!points)return rootsFallback();
  $('roots3dLayer').style.display='block';
  const map=view==='gears'?[[155,130,...points.gears,'Engrenagens de sincronização']]:[[155,125,...points.upper,'Rotor superior'],[750,445,...points.lower,'Rotor inferior'],[110,340,...points.input,'Admissão'],[800,285,...points.output,'Descarga']];
  if($('rootsShell').checked)map.push([735,125,...points.body,'Carcaça em corte']);
  labels(map);
  return text(450,580,view==='gears'?'Engrenagens mantêm a fase dos rotores • sentidos opostos':'Gás pela periferia → volume quase constante → equalização na saída','caption');
 }
 function rootsFallback(){
  const outline=R=>{const pts=[];for(let x=385-R;x<=515+R;x+=2){const dx=Math.min(Math.abs(x-385),Math.abs(x-515));pts.push([x,310-Math.sqrt(Math.max(0,R*R-dx*dx))]);}return [...pts,...pts.map(([x,y])=>[x,620-y]).reverse()];};
  let out=line([450,65],[450,248],C.in,27)+arrow([450,75],[450,160],C.in)+text(560,100,'ENTRADA')+
   line([450,375],[450,535],C.out,27)+arrow([450,480],[450,530],C.out)+text(570,525,'SAÍDA');
  out+=piece(0,poly(outline(108),'url(#hatch)','stroke="#92adbf" stroke-width="4"'))+poly(outline(100),'#173144');
  out+=annulus(385,310,85,99,Math.PI/2,Math.PI*1.5,C.in+'99')+annulus(515,310,85,99,-Math.PI/2,Math.PI/2,C.compression+'99');
  out+=particlesPath([[450,90],[450,230]],C.in,5)+particlesPath([[450,395],[450,520]],C.out,5)+particlesPath([[420,235],[385,222],[290,310],[385,398],[450,390]],C.in,10)+particlesPath([[480,235],[515,222],[610,310],[515,398],[450,390]],C.in,10);
  for(let j=0;j<2;j++){
   const x=j?515:385,a=(j?-1:1)*TAU*phase,pts=[],R=65,r=R/4;
   // Segmentos epicicloidais e hipocicloidais conjugados, com folga ilustrativa.
   for(let t=0;t<=TAU+.001;t+=.012){
    const epi=Math.floor((t+1e-7)/(Math.PI/2))%2===0;
    const px=epi?(R+r)*Math.cos(t)-r*Math.cos(5*t):(R-r)*Math.cos(t)+r*Math.cos(3*t);
    const py=epi?(R+r)*Math.sin(t)-r*Math.sin(5*t):(R-r)*Math.sin(t)-r*Math.sin(3*t);
    pts.push([x+.992*(px*Math.cos(a)-py*Math.sin(a)),310+.992*(px*Math.sin(a)+py*Math.cos(a))]);
   }
   out+=piece(j+1,poly(pts,'url(#metal)','stroke="#b7d0df" stroke-width="2"'))+circle(x,310,16,'#a8c7da');
   out+=line(point(x,310,18,a),point(x,310,50,a),'#f2be56',5);
  }
  out+=rect(416,388,68,18,C.out,'rx="8" opacity=".6"');

  labels([[200,90,330,250,'Rotação oposta'],[710,90,570,250,'Rotores sincronizados'],[180,530,290,350,'Bolsa periférica'],[705,530,480,400,'Equalização na saída']]);
  return out;
 }
 function centrifugal(){
  const x=450,y=310;
  let out=piece(0,circle(x,y,195,'url(#hatch)','stroke="#92adbf" stroke-width="4"'))+circle(x,y,175,'#264253');
  out+=piece(3,annulus(x,y,120,168,0,TAU,C.compression+'77'));
  for(let i=0;i<16;i++){let a=i*TAU/16;out+=line(point(x,y,127,a),point(x,y,168,a+.12),'#b09e64',4);}
  let imp=circle(x,y,114,'url(#metal)','stroke="#c5d8e5" stroke-width="3"');
  for(let i=0;i<10;i++){let a=i*TAU/10+phase*TAU;let a0=point(x,y,43,a),a1=point(x,y,100,a-.38),a2=point(x,y,111,a+.05);imp+=`<path d="M${xy(a0)}Q${xy(a1)} ${xy(a2)}" fill="none" stroke="#cae0ec" stroke-width="7"/>`;}
  out+=piece(1,imp)+piece(4,circle(x,y,38,C.in,'stroke="#98e5f5" stroke-width="3"'))+text(x,y+6,'⊗');
  out+=line([600,180],[785,180],C.out,28)+arrow([650,180],[780,180],C.out)+text(775,140,'SAÍDA TANGENCIAL');
  if($('air').checked)for(let i=0;i<28;i++){
   let f=(i/28+phase)%1,a=i*TAU/7+f*.8,r=30+f*139;
   out+=circle(...point(x,y,r,a),3.5,f<.5?C.in:C.compression);
  }
  out+=particlesPath([[610,310],[620,250],[595,180],[790,180]],C.out,8);
  labels([[200,90,375,230,'Impulsor móvel'],[680,90,590,240,'Difusor fixo'],[200,530,450,310,'Entrada axial (⊗)'],[685,530,600,420,'Voluta coletora']]);
  return out+text(450,575,'⊗ Entrada perpendicular à tela • Escoamento contínuo','caption');
 }
 function axial(){
  let out=piece(0,poly([[175,155],[715,215],[715,405],[175,465]],'url(#hatch)','stroke="#92adbf" stroke-width="4"'));
  out+=poly([[190,172],[700,230],[700,390],[190,448]],'#102b3e')+poly([[190,172],[700,230],[700,390],[190,448]],'url(#gas)','opacity=".26"');
  out+=piece(3,rect(145,295,610,30,'url(#metal)','rx="12" stroke="#adc7d7" stroke-width="2"'));
  for(let j=0;j<4;j++){
   const x=250+j*115,half=113-j*13,angle=TAU*phase+j*.55;
   for(let k=0;k<3;k++){
    let h=Math.cos(angle+k*TAU/3)*half;
    out+=piece(1,poly([[x-9,310],[x+9,310],[x+19,310+h],[x-2,310+h-12]],'#b8d7e8','stroke="#607e94" stroke-width="2"'));
   }
   const sx=x+52,sh=half-8;
   out+=piece(2,poly([[sx-7,310-sh],[sx+12,310-sh+3],[sx+2,282],[sx-12,282]],'#e7c579')+poly([[sx-12,338],[sx+2,338],[sx+12,310+sh-3],[sx-7,310+sh]],'#e7c579'));
   out+=text(x+25,500,'ESTÁGIO '+(j+1),'caption');
  }
  out+=arrow([75,250],[185,250],C.in)+text(85,210,'ENTRADA')+arrow([710,260],[815,260],C.out)+text(805,215,'SAÍDA');
  if($('air').checked)for(let i=0;i<24;i++){let f=(i/24+phase)%1,x=190+f*510,yy=310+(i%2?1:-1)*(60+(i%3)*15)*(1-f*.4);out+=circle(x,yy,3.5,f<.3?C.in:f<.75?C.compression:C.out);}
  labels([[280,100,250,235,'Rotor: pás móveis'],[570,100,532,235,'Estator: pás fixas'],[450,565,450,310,'Eixo comum dos rotores']]);
  return out;
 }
 function axialPistons(s){
  const cylinder=Number($('axialCylinder').value),side=$('axialSide').getAttribute('aria-pressed')==='true';
  const points=window.AxialPistonView.render(phase,{selected,cylinder,air:$('air').checked,showHousing:$('axialShell').checked,sideView:side});
  if(points){
   $('axialPiston3dLayer').style.display='block';
   const map=[[160,110,...points.piston,'Pistão P'+(cylinder+1)],[150,390,...points.rod,'Biela articulada'],[685,115,...points.plate,'Placa oscilante'],[755,390,...points.pulley,'Polia motora'],[145,520,...points.valves,'Admissão / descarga']];
   if($('axialShell').checked)map.push([710,520,...points.housing,'Carcaça em corte']);
   labels(map);
   return text(450,575,'7 cilindros fixos • pistões paralelos ao eixo • placa em movimento oscilante','caption');
  }
  // Alternativa local sem WebGL: corte do cilindro escolhido e mecanismo equivalente.
  const pinX=350+(s.face-window.AxialPistonView.head)*190,plateX=650+(s.attachment[0]-.95)*80;
  let out=rect(320,190,230,160,'#25495f','rx="10" stroke="#9bb6c8" stroke-width="3"');
  out+=rect(335,210,200,120,'#112d3e')+rect(335,210,pinX-335,120,s.color===0x35caf0?C.in:s.stage===3?C.out:C.compression,'opacity=".65"');
  out+=piece(1,rect(pinX,212,40,116,'url(#metal)','stroke="#d6e7ef" stroke-width="2"'));
  out+=piece(2,line([pinX+25,270],[plateX,270],'#bcd3df',14));
  out+=piece(3,`<ellipse cx="650" cy="270" rx="24" ry="115" transform="rotate(${n(14*Math.cos(TAU*phase))} 650 270)" fill="#2777bd" stroke="#a3ccdf" stroke-width="4"/>`);
  out+=piece(5,circle(760,270,70,'url(#metal)','stroke="#95b3c7" stroke-width="4"'))+line([760,270],point(760,270,52,TAU*phase),'#efc970',7);
  labels([[220,150,350,220,'Câmara do gás'],[455,410,pinX+15,310,'Pistão P'+(cylinder+1)],[650,465,650,350,'Placa oscilante'],[770,150,760,220,'Polia']]);
  return out+text(450,550,'Corte didático do cilindro escolhido • visualização vetorial','caption');
 }
 const renderers={pistao:piston,membrana:diaphragm,rolo:rolling,palhetas:slidingVanes,parafuso:screw,scroll,roots,'anel-liquido':()=>vanes(true),centrifugo:centrifugal,axial,'pistoes-axiais':axialPistons};
 const phaseNames=()=>type.id==='rolo'?['Novo ciclo','Admissão','Compressão','Descarga']:type.id==='palhetas'?['Novo ciclo','Admissão','Compressão','Descarga']:type.id==='anel-liquido'?['Anel de vedação','Admissão','Compressão','Descarga']:type.id==='pistao'||type.id==='membrana'||type.id==='pistoes-axiais'?['Reexpansão','Admissão','Compressão','Descarga']:type.id==='roots'?['Admissão','Aprisionamento','Transporte','Equalização e saída']:['Admissão','Aprisionamento','Compressão','Descarga'];
 function draw(){
  const s=cycleState(),dynamic=type.id==='axial'||type.id==='centrifugo';
  $('screw3dLayer').style.display='none';$('vane3dLayer').style.display='none';
  $('axialPiston3dLayer').style.display='none';$('roots3dLayer').style.display='none';
  $('scene').innerHTML=renderers[type.id](s);
  $('degrees').value=Math.round(phase*360)+'°';$('cycle').value=phase*360;
  if(lastStage!==s.stage){
   lastStage=s.stage;
   $('fase').textContent=(dynamic?'Região: ':'')+(dynamic?(type.id==='axial'?['Entrada','Rotor','Estator','Saída']:['Entrada axial','Impulsor','Difusor','Voluta'])[s.stage]:phaseNames()[s.stage]);
   $('faseTexto').textContent=type.passos[s.stage];
   [...$('phases').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===s.stage)));
  }
  if(type.id==='pistao'||type.id==='membrana'||type.id==='pistoes-axiais'){
   $('meters').innerHTML=meter('Volume da câmara',Math.round(s.v/1.08*100)+'%',s.v/1.08)+meter('Pressão absoluta ideal',s.p.toFixed(2).replace('.',',')+' × p₁',s.p/4);
  }else if(type.id==='palhetas'&&window.VaneView){const v=window.VaneView.cell(phase).area,max=window.VaneView.cell(.5).area;$('meters').innerHTML=meter('Volume da célula em destaque',Math.round(v/max*100)+'% do máximo',v/max)+'<p>As demais células trabalham em outras etapas simultaneamente. Cor é indicação didática, sem cálculo de pressão.</p>';}else $('meters').innerHTML=`<p class="continuous">${dynamic?'As regiões trabalham simultaneamente. Os botões abaixo destacam a explicação de cada região.':type.id==='roots'?'Bolsas de volume quase constante. Observe a abertura para a saída.':'Várias câmaras podem estar em etapas diferentes ao mesmo tempo.'}</p>`;
  if(type.id==='pistoes-axiais'){
   const choice=Number($('axialCylinder').value),names=['Reexpansão','Admissão','Compressão','Descarga'];
   for(const b of $('axialSequence').querySelectorAll('[data-cylinder]')){const i=Number(b.dataset.cylinder),state=window.AxialPistonView.state(phase,i);b.setAttribute('aria-pressed',String(i===choice));b.querySelector('span').textContent=names[state.stage];b.style.borderBottomColor='#'+state.color.toString(16).padStart(6,'0');}
  }
 }
 function meter(name,value,f){return `<div class="meter"><span>${name}<strong>${value}</strong></span><i><b style="width:${n(f*100)}%"></b></i></div>`;}
 function active(){return playing&&!document.hidden&&window.labActive!==false;}
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function tick(t){raf=0;if(!active())return;if(last){phase=(phase+Math.min(t-last,80)/7000*speed)%1;}last=t;if(t-drawTime>33){draw();drawTime=t;}raf=requestAnimationFrame(tick);}
 function sync(){stop();$('play').textContent=playing?'Ⅱ Pausar':'▶ Reproduzir';$('play').setAttribute('aria-pressed',String(playing));if(active())raf=requestAnimationFrame(tick);}
 function pause(){playing=false;sync();}
 function choosePart(){selected=Number($('part').value);$('partInfo').textContent=type.funcoes[selected]||'Selecione uma peça para destacá-la no corte e descobrir sua função.';draw();}
 function init(next,changeUrl=false){
  stop();type=next;phase=0;lastStage=-1;selected=['pistao','membrana','parafuso','pistoes-axiais','roots','palhetas'].includes(type.id)?-1:0;
  if(changeUrl){const u=new URL(location.href);u.searchParams.set('tipo',type.id);history.replaceState(null,'',u);}
  document.title='Compressor · '+type.nome+' · SENAI';$('titulo').textContent='Compressor · '+type.nome;$('resumo').textContent=type.resumo;$('familia').textContent=type.familia;
  $('svgTitle').textContent='Compressor '+type.nome+' em corte';$('svgDesc').textContent=type.resumo+' Use os controles abaixo para pausar e avançar.';
  $('tipos').innerHTML=types.map(t=>`<button data-type="${t.id}" aria-pressed="${t.id===type.id}">${t.nome}</button>`).join('');
  $('part').innerHTML=(['pistao','membrana','parafuso','pistoes-axiais','roots','palhetas'].includes(type.id)?'<option value="-1">Selecione uma peça…</option>':'')+type.pecas.map((p,i)=>`<option value="${i}">${i+1}. ${p}</option>`).join('');$('partInfo').textContent=selected<0?'Selecione uma peça para destacá-la no corte e descobrir sua função.':type.funcoes[0];
  const dyn=type.id==='axial'||type.id==='centrifugo';
  const names=dyn?(type.id==='axial'?['Entrada','Rotor','Estator','Saída']:['Entrada','Impulsor','Difusor','Voluta']):phaseNames();
  $('phases').innerHTML=names.map((p,i)=>`<button data-stage="${i}" aria-pressed="false"><b>0${i+1}</b>${p}</button>`).join('');
  $('application').textContent=type.aplicacao;$('attention').textContent=type.atencao;
  $('modelNote').textContent=type.id==='membrana'?'Corte hidráulico inspirado na referência Howden. Deformação ampliada para ensino; óleo tratado como incompressível. Circuitos auxiliares de reposição, alívio e detecção de vazamento omitidos. Modelo ideal do gás: p₂/p₁ = 4 (pressões absolutas), expoente 1,3 e volume morto de 8%.':type.id==='pistao'?'Modelo ideal ilustrativo: p₂/p₁ = 4 (pressões absolutas), expoente politrópico 1,3 e volume morto de 8% do volume deslocado. As válvulas respondem à diferença de pressão. As barras não são medições de um equipamento real.':type.atencao;
  $('vaneControls').hidden=type.id!=='palhetas';$('liquidLegend').hidden=type.id!=='anel-liquido';$('oilLegend').hidden=type.id!=='membrana';$('screwControls').hidden=type.id!=='parafuso';
  $('axialPistonControls').hidden=type.id!=='pistoes-axiais';$('axialSequence').hidden=type.id!=='pistoes-axiais';$('rootsControls').hidden=type.id!=='roots';$('energyLegend').lastChild.textContent=type.id==='roots'?'Transporte de volume':'Compressão / energia';
  $('question').textContent=type.pergunta;$('answers').innerHTML=type.opcoes.map((x,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)}. ${x}</button>`).join('');$('feedback').textContent='Converse com a turma e escolha uma alternativa.';
  draw();sync();
 }
 $('tipos').onclick=e=>{let b=e.target.closest('[data-type]');if(b)init(types.find(t=>t.id===b.dataset.type),true);};
 $('zoom').onclick=()=>{const on=document.querySelector('.drawing').classList.toggle('zoomed');$('zoom').setAttribute('aria-pressed',String(on));$('zoom').textContent=on?'− Ajustar à tela':'＋ Ampliar desenho';};
 $('screwFront').onclick=()=>{const front=$('screwFront').getAttribute('aria-pressed')!=='true';$('screwFront').setAttribute('aria-pressed',String(front));$('screwFront').textContent=front?'Voltar à perspectiva':'Ver engrenamento';draw();};
 $('screwShell').onchange=draw;
 $('vaneView').onchange=draw;$('vaneShell').onchange=draw;$('vaneSprings').onchange=draw;
 $('rootsView').onchange=draw;$('rootsShell').onchange=draw;
 $('axialSide').onclick=()=>{const side=$('axialSide').getAttribute('aria-pressed')!=='true';$('axialSide').setAttribute('aria-pressed',String(side));$('axialSide').textContent=side?'Voltar à perspectiva':'Vista lateral';draw();};
 $('axialShell').onchange=draw;
 $('axialCylinder').onchange=()=>{lastStage=-1;draw();};
 $('axialSequence').onclick=e=>{const b=e.target.closest('[data-cylinder]');if(b){$('axialCylinder').value=b.dataset.cylinder;lastStage=-1;draw();}};
 $('play').onclick=()=>{playing=!playing;sync();};
 $('step').onclick=()=>{pause();phase=(phase+1/24)%1;draw();};
 $('reset').onclick=()=>{pause();phase=0;draw();};
 $('speed').onchange=()=>{speed=Number($('speed').value);};
 $('cycle').oninput=()=>{pause();phase=Number($('cycle').value)/360;draw();};
 $('names').onchange=draw;$('air').onchange=draw;$('part').onchange=choosePart;
 $('phases').onclick=e=>{
  const b=e.target.closest('[data-stage]');if(!b)return;pause();const i=Number(b.dataset.stage);
  // Escolhe pontos interiores de cada fase do ciclo alternativo (inclui volume morto).
  phase=(type.id==='pistao'||type.id==='membrana'||type.id==='pistoes-axiais'?[.04,.3,.65,.94]:[.06,.31,.66,.94])[i];
  if(type.id==='pistoes-axiais')phase=(phase+Number($('axialCylinder').value)/7)%1;
  draw();
 };
 $('answers').onclick=e=>{const b=e.target.closest('[data-answer]');if(!b)return;const correct=Number(b.dataset.answer)===type.correta;[...$('answers').children].forEach(x=>{x.className='';x.removeAttribute('aria-pressed');});b.className=correct?'correct':'wrong';b.setAttribute('aria-pressed','true');$('feedback').textContent=(correct?'Correto! ':'Vamos rever: ')+type.explica;};
 $('tela').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.bench').requestFullscreen();}catch{$('tela').textContent='Use a ampliação do navegador';}};
 document.addEventListener('fullscreenchange',()=>{$('tela').textContent=document.fullscreenElement?'⛶ Sair da ampliação':'⛶ Ampliar aula';});
 window.addEventListener('lab-visibility-change',sync);document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{if(reduced.matches)pause();});
 init(type);
})();

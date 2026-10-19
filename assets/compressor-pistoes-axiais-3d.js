/* Compressor de refrigeração: pistões paralelos ao eixo e placa oscilante.
   Modelo próprio, com articulações esféricas e bielas de comprimento constante. */
(() => {
 'use strict';
 const T=window.THREE,TAU=Math.PI*2,N=7,R=1.02,beta=Math.PI/10,rodLength=2.2;
 const host=document.getElementById('axialPistonCanvasHost');
 const rotateX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];
 function pose(phase,index=0){
  const a=phase*TAU,phi=index*TAU/N;
  // Rx(a) Rz(beta) Rx(-a): a placa oscila, mantendo seus pontos associados às bielas.
  let p=rotateX([-.09,R*Math.cos(phi),R*Math.sin(phi)],-a);
  p=[p[0]*Math.cos(beta)-p[1]*Math.sin(beta),p[0]*Math.sin(beta)+p[1]*Math.cos(beta),p[2]];
  p=rotateX(p,a);p[0]+=.95;
  const y=R*Math.cos(phi),z=R*Math.sin(phi),dx=Math.sqrt(rodLength**2-(p[1]-y)**2-(p[2]-z)**2);
  const pin=[p[0]-dx,y,z],face=pin[0]-.23;
  return {attachment:p,pin,face,y,z,phi,a};
 }
 // Limites geométricos obtidos de uma volta; a folga mínima representa 8% do curso.
 let minimum=Infinity,maximum=-Infinity;
 for(let i=0;i<1440;i++){const x=pose(i/1440).face;minimum=Math.min(minimum,x);maximum=Math.max(maximum,x);}
 const stroke=maximum-minimum,head=minimum-.08*stroke;
 function state(phase,index){
  const p=pose(phase,index),v=.08+(p.face-minimum)/stroke,delta=((phase-index/N)%1+1)%1;
  const pressure=delta<.5?Math.max(1,4*Math.pow(.08/v,1.3)):Math.min(4,Math.pow(1.08/v,1.3));
  const stage=delta<.5?(pressure>1.0001?0:1):(pressure<3.9999?2:3);
  return {...p,v,p:pressure,stage,delta,color:[0xf2be56,0x35caf0,0xf2be56,0xff7180][stage]};
 }
 let renderer,scene,camera,housing,plate,drive,pulley,pistons=[],rods=[],gas=[],valves=[],parts=[],ready=false,failed=false;
 const axis=T?new T.Vector3(1,0,0):null;
 function cyl(r,len,material,x=0,y=0,z=0,segments=48){const m=new T.Mesh(new T.CylinderGeometry(r,r,len,segments),material);m.rotation.z=-Math.PI/2;m.position.set(x,y,z);return m;}
 function ring(outer,inner,len,material,x,y=0,z=0){
  const shape=new T.Shape();shape.absarc(0,0,outer,0,TAU,false);const hole=new T.Path();hole.absarc(0,0,inner,0,TAU,true);shape.holes.push(hole);
  const g=new T.ExtrudeGeometry(shape,{depth:len,bevelEnabled:true,bevelSegments:2,bevelThickness:.015,bevelSize:.015,steps:1,curveSegments:48});g.rotateY(Math.PI/2);
  const m=new T.Mesh(g,material);m.position.set(x,y,z);return m;
 }
 function init(){
  if(ready)return true;if(failed||!T||!host)return false;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{failed=true;return false;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(900,600);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.style.cssText='width:100%;height:100%;display:block';renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
  scene=new T.Scene();camera=new T.OrthographicCamera(-5.7,5.7,3.8,-3.8,.1,80);
  scene.add(new T.HemisphereLight(0xe7f3ff,0x2b4152,2.2));
  for(const [color,power,x,y,z] of [[0xffffff,3,-3,6,8],[0xa4ccff,2,4,2,-6],[0xffedcc,1.4,7,4,5]]){const light=new T.DirectionalLight(color,power);light.position.set(x,y,z);scene.add(light);}
  const studio=new T.Scene();studio.background=new T.Color(0x8196a6);
  for(const [x,y,z,w,h,color] of [[0,7,0,12,7,0xffffff],[-7,2,0,6,10,0xffffff],[7,2,0,4,8,0x50728c],[0,0,8,12,6,0xd9eaff]]){const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);}
  const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(studio,.13).texture;pmrem.dispose();
  const metal=new T.MeshStandardMaterial({color:0xb9cedb,metalness:.9,roughness:.27});
  const dark=new T.MeshStandardMaterial({color:0x344b5c,metalness:.75,roughness:.36});
  const blue=new T.MeshStandardMaterial({color:0x165da9,metalness:.6,roughness:.28});
  const gold=new T.MeshStandardMaterial({color:0xe2bb68,metalness:.75,roughness:.3});
  housing=new T.Group();scene.add(housing);
  const shellMaterial=metal.clone();shellMaterial.side=T.DoubleSide;
  const shell=new T.Mesh(new T.CylinderGeometry(1.55,1.55,4.05,64,1,true,Math.PI/2,Math.PI),shellMaterial);shell.rotation.z=Math.PI/2;shell.position.x=-.15;housing.add(shell);
  housing.add(ring(1.61,1.45,.12,metal,-2.22),ring(1.61,1.45,.12,metal,1.78));
  // Bloco fixo: os sete cilindros permanecem parados enquanto a polia gira.
  const block=new T.Shape();block.absarc(0,0,1.48,0,TAU,false);
  for(let i=0;i<N;i++){const phi=i*TAU/N,hole=new T.Path();hole.absarc(R*Math.cos(phi),R*Math.sin(phi),.30,0,TAU,true);block.holes.push(hole);}
  const centerHole=new T.Path();centerHole.absarc(0,0,.19,0,TAU,true);block.holes.push(centerHole);
  const blockGeometry=new T.ExtrudeGeometry(block,{depth:.13,bevelEnabled:false,curveSegments:32});
  blockGeometry.applyMatrix4(new T.Matrix4().set(0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1));
  const fixedBlock=new T.Mesh(blockGeometry,metal);fixedBlock.position.x=head-.13;housing.add(fixedBlock);
  for(let i=0;i<N;i++){
   const phi=i*TAU/N,y=R*Math.cos(phi),z=R*Math.sin(phi);
   const linerMaterial=dark.clone();linerMaterial.side=T.DoubleSide;const liner=new T.Mesh(new T.CylinderGeometry(.3,.3,1.15,40,1,true,Math.PI/2,Math.PI),linerMaterial);liner.rotation.z=Math.PI/2;liner.position.set(head+.57,y,z);housing.add(liner);
   housing.add(ring(.335,.30,.07,metal,head,y,z));
   const piston=new T.Group();piston.add(cyl(.278,.46,metal.clone(),.23),cyl(.284,.035,gold.clone(),.055),cyl(.284,.035,gold.clone(),.13));scene.add(piston);pistons.push(piston);
   const rod=cyl(.055,1,metal.clone());scene.add(rod);rods.push(rod);
   const ball1=new T.Mesh(new T.SphereGeometry(.10,20,12),metal.clone()),ball2=ball1.clone();scene.add(ball1,ball2);rod.userData.balls=[ball1,ball2];
   const volume=cyl(.265,1,new T.MeshBasicMaterial({color:0x35caf0,transparent:true,opacity:.45,depthWrite:false}));scene.add(volume);gas.push(volume);
   const inlet=cyl(.052,.06,new T.MeshStandardMaterial({color:0x35caf0,emissive:0x064a65,roughness:.3}),head-.06,y-.12,z);
   const outlet=cyl(.052,.06,new T.MeshStandardMaterial({color:0xff7180,emissive:0x651c31,roughness:.3}),head-.06,y+.12,z);scene.add(inlet,outlet);valves.push([inlet,outlet]);
  }
  plate=new T.Group();plate.position.x=.95;plate.add(cyl(1.24,.16,blue));plate.add(ring(1.26,1.14,.045,metal,-.11));
  const hub=cyl(.27,.35,dark,-.05);plate.add(hub);scene.add(plate);
  for(let i=0;i<N;i++){const phi=i*TAU/N;plate.add(new T.Mesh(new T.SphereGeometry(.09,16,12),gold));plate.children.at(-1).position.set(-.09,R*Math.cos(phi),R*Math.sin(phi));}
  // O marcador mantém o seu vínculo com a placa oscilante e não acompanha a rotação da polia.
  const marker=new T.Mesh(new T.BoxGeometry(.02,.1,.21),new T.MeshBasicMaterial({color:0xffd966}));marker.position.set(-.12,.87,0);plate.add(marker);
  drive=new T.Group();drive.position.x=1.04;const tilted=new T.Group();tilted.rotation.z=beta;tilted.add(cyl(1.23,.14,metal));drive.add(tilted);scene.add(drive);
  const shaft=cyl(.17,2.0,metal,1.85);scene.add(shaft);
  pulley=new T.Group();pulley.position.x=2.5;
  pulley.add(cyl(1.02,.38,dark));
  for(let i=0;i<6;i++)pulley.add(ring(1.06,.98,.025,metal,-.20+i*.065));
  pulley.add(cyl(.48,.10,metal,.24));
  for(let i=0;i<3;i++){const a=i*TAU/3;pulley.add(cyl(.07,.12,gold,.27,.32*Math.cos(a),.32*Math.sin(a)));}scene.add(pulley);
  // Anéis e parafusos externos completam a vista em corte, sem esconder as bielas.
  for(const x of [-2.1,1.9])for(let i=0;i<8;i++){const phi=i*TAU/8;housing.add(cyl(.055,.16,dark,x,1.51*Math.cos(phi),1.51*Math.sin(phi)));}
  const groups=[housing,...pistons,...rods,plate,drive,shaft,pulley];
  for(const group of groups)group.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.userData.originalColor=m.material.color.clone();}});
  parts=[housing,pistons,rods,plate,[drive,shaft],pulley,valves.flat()];ready=true;return true;
 }
 function project(x,y,z){const p=new T.Vector3(x,y,z).project(camera);return [(p.x+1)*450,(1-p.y)*300];}
 function highlight(group,on){
  if(Array.isArray(group)){for(const g of group)highlight(g,on);return;}
  group.traverse(m=>{if(m.isMesh&&m.material.emissive)m.material.emissive.setHex(on?0x174d7a:0);});
 }
 window.AxialPistonView={pose,state,stroke,head,
  render(phase,{selected=-1,cylinder=1,air=true,showHousing=true,sideView=false}={}){
   if(!init())return false;
   camera.position.set(...(sideView?[0,0,14]:[5,3,12]));camera.up.set(0,1,0);camera.lookAt(.15,0,0);camera.zoom=1.2;camera.updateProjectionMatrix();camera.updateMatrixWorld();
   const a=phase*TAU;plate.quaternion.setFromEuler(new T.Euler(0,0,0));
   const qx=new T.Quaternion().setFromAxisAngle(axis,a),qz=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),beta),qi=new T.Quaternion().setFromAxisAngle(axis,-a);
   plate.quaternion.copy(qx).multiply(qz).multiply(qi);drive.rotation.x=a;pulley.rotation.x=a;housing.visible=showHousing;
   for(let i=0;i<N;i++){
    const p=state(phase,i);pistons[i].position.set(p.face,p.y,p.z);
    const v=new T.Vector3(...p.attachment).sub(new T.Vector3(...p.pin));
    rods[i].position.copy(new T.Vector3(...p.pin).add(new T.Vector3(...p.attachment)).multiplyScalar(.5));
    rods[i].scale.y=v.length();rods[i].quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
    rods[i].userData.balls[0].position.set(...p.pin);rods[i].userData.balls[1].position.set(...p.attachment);
    gas[i].position.set((head+p.face)/2,p.y,p.z);gas[i].scale.y=p.face-head;gas[i].material.color.setHex(p.color);gas[i].visible=air;
    gas[i].material.opacity=i===cylinder?.8:.22;
    valves[i][0].position.x=head-.06+(p.stage===1?.04:0);valves[i][1].position.x=head-.06-(p.stage===3?.04:0);
    for(const m of pistons[i].children)m.material.color.copy(m.userData.originalColor);
    if(i===cylinder)pistons[i].children[0].material.color.setHex(0xe9c26a);
   }
   parts.forEach((part,i)=>highlight(part,selected===i));renderer.render(scene,camera);
   const p=pose(phase,cylinder);
   return {piston:project(p.face+.2,p.y,p.z),rod:project((p.pin[0]+p.attachment[0])/2,(p.y+p.attachment[1])/2,(p.z+p.attachment[2])/2),plate:project(.95,.85,.7),shaft:project(1.9,0,0),pulley:project(2.7,.9,0),housing:project(-.5,-1.5,-.2),valves:project(head,p.y,p.z)};
  },available:()=>ready&&!failed
 };
})();

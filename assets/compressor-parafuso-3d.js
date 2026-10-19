/* Modelo didático próprio: geometria helicoidal local e carcaça em corte.
   O perfil fêmea é obtido pelo envelope do rotor macho, com folga ilustrativa.
   Os perfis não são especificações de fabricação de um equipamento comercial. */
(() => {
 'use strict';
 const T=window.THREE,host=document.getElementById('screwCanvasHost');
 let renderer,scene,camera,male,female,housing,gas,parts,inletArrow,outletArrow,ready=false,failed=false,front=false;
 const TAU=Math.PI*2,L=4.4,D=1.55,ratio=4/6,twist=1.5*Math.PI;
 const maleRadius=t=>.62+.38*Math.pow((1+Math.cos(4*t))/2,.72);
 const femaleRadii=[];
 // Envelope no referencial do rotor fêmea durante um período de engrenamento.
 function profile(){
  const count=384;
  for(let i=0;i<count;i++){
   const t=i*TAU/count;let limit=.94;
   for(let j=0;j<100;j++){
    const a=j*Math.PI/200,b=-ratio*a,ct=Math.cos(t+b),st=Math.sin(t+b);
    const collision=r=>{const y=D+r*ct,z=r*st;return Math.hypot(y,z)<maleRadius(Math.atan2(z,y)-a)+.012;};
    let previous=0;
    for(let k=1;k<=20;k++){
     const r=limit*k/20;
     if(collision(r)){let lo=previous,hi=r;for(let n=0;n<9;n++){const mid=(lo+hi)/2;if(collision(mid))hi=mid;else lo=mid;}limit=lo;break;}
     previous=r;
    }
   }
   femaleRadii.push(limit);
  }
  // Impõe simetria de seis canais; reduz pequenos erros de amostragem do envelope.
  const period=count/6;
  for(let i=0;i<period;i++){let r=1;for(let j=0;j<6;j++)r=Math.min(r,femaleRadii[i+j*period]);for(let j=0;j<6;j++)femaleRadii[i+j*period]=r;}
 }
 const femaleRadius=t=>{const f=((t/TAU%1+1)%1)*femaleRadii.length,i=Math.floor(f);return femaleRadii[i]*(1-f+i)+femaleRadii[(i+1)%femaleRadii.length]*(f-i);};
 function rotorGeometry(radius,turn){
  const rings=64,segments=192,positions=[],indices=[];
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
   const t=i*TAU/segments,a=t+turn*j/rings,r=radius(t);
   positions.push((j/rings-.5)*L,r*Math.cos(a),r*Math.sin(a));
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
   const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);
  }
  for(const end of [0,rings]){
   const center=positions.length/3;positions.push((end/rings-.5)*L,0,0);
   for(let i=0;i<segments;i++){const v=end*(segments+1)+i;if(end===0)indices.push(center,v+1,v);else indices.push(center,v,v+1);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 function cylinder(radius,length,material,x,y,z){const m=new T.Mesh(new T.CylinderGeometry(radius,radius,length,48),material);m.rotation.z=Math.PI/2;m.position.set(x,y,z);return m;}
 function union(radius){
  const theta=Math.acos(D/(2*radius)),points=[];
  for(let i=0;i<=80;i++){const a=theta+(TAU-2*theta)*i/80;points.push(new T.Vector2(-D/2+radius*Math.cos(a),radius*Math.sin(a)));}
  for(let i=0;i<=80;i++){const a=Math.PI+theta+(TAU-2*theta)*i/80;points.push(new T.Vector2(D/2+radius*Math.cos(a),radius*Math.sin(a)));}return points;
 }
 function plate(x,material){
  const shape=new T.Shape(union(1.16)),hole=new T.Path(union(1.045).reverse());shape.holes.push(hole);
  const g=new T.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025});
  g.applyMatrix4(new T.Matrix4().set(0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1));
  const m=new T.Mesh(g,material);m.position.x=x;return m;
 }
 function init(){
  if(ready)return true;if(failed||!T||!host)return false;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{failed=true;return false;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(900,600);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.domElement.style.cssText='width:100%;height:100%;display:block';renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
  scene=new T.Scene();camera=new T.OrthographicCamera(-5.8,5.8,3.8667,-3.8667,.1,80);
  scene.add(new T.HemisphereLight(0xe5f3ff,0x243c50,2.4));
  for(const [color,power,x,y,z] of [[0xffffff,3,0,7,8],[0xa6d3ff,2,-6,2,-5],[0xffe4bc,1.5,7,3,0]]){let l=new T.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l);}
  const studio=new T.Scene();studio.background=new T.Color(0x7f95a7);
  for(const [x,y,z,w,h,color] of [[0,7,1,12,7,0xffffff],[-7,1,0,6,9,0xffffff],[7,2,0,4,9,0x4b6f8e],[0,0,8,12,5,0xe4f1ff]]){const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);}
  const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.1);scene.environment=env.texture;pmrem.dispose();
  const steel=new T.MeshStandardMaterial({color:0xd8e3eb,metalness:.94,roughness:.22,envMapIntensity:1.1});
  const steelDark=new T.MeshStandardMaterial({color:0x94b5c9,metalness:.9,roughness:.25,envMapIntensity:1.1});
  const blue=new T.MeshStandardMaterial({color:0x276b94,metalness:.65,roughness:.33});
  const dark=new T.MeshStandardMaterial({color:0x243c50,metalness:.6,roughness:.4});
  profile();male=new T.Group();male.position.y=-D/2;female=new T.Group();female.position.y=D/2;
  male.add(new T.Mesh(rotorGeometry(maleRadius,twist),steel));female.add(new T.Mesh(rotorGeometry(femaleRadius,-ratio*twist),steelDark));
  for(const group of [male,female])for(const sign of [-1,1]){
   group.add(cylinder(.22,.85,steel,sign*(L/2+.3),0,0));
   const bearing=cylinder(.3,.12,dark,sign*(L/2+.14),0,0);group.add(bearing);
   const mark=new T.Mesh(new T.BoxGeometry(.04,.05,.24),new T.MeshStandardMaterial({color:0xf5ca6c,metalness:.5,roughness:.3}));mark.position.set(sign*(L/2+.74),.12,0);group.add(mark);
  }
  scene.add(male,female);housing=new T.Group();scene.add(housing);
  for(const cy of [-D/2,D/2]){
   const shell=new T.Mesh(new T.CylinderGeometry(1.055,1.055,L,64,1,true,Math.PI/2,Math.PI),blue);shell.rotation.z=Math.PI/2;shell.position.y=cy;housing.add(shell);
  }
  for(const x of [-L/2-.12,L/2]){
   housing.add(plate(x,blue));
   for(const cy of [-D/2,D/2])for(const a of [Math.PI*.2,Math.PI*.8,Math.PI*1.2,Math.PI*1.8])housing.add(cylinder(.055,.19,steel,x+.075,cy+1.12*Math.cos(a),1.12*Math.sin(a)));
  }
  // Pés e base sustentam o conjunto da carcaça aberta.
  const base=new T.Mesh(new T.BoxGeometry(4.95,.16,2.5),blue);base.position.set(0,-2.08,-.25);housing.add(base);
  for(const x of [-1.75,1.75]){const foot=new T.Mesh(new T.BoxGeometry(.35,.45,1.6),blue);foot.position.set(x,-1.85,-.25);housing.add(foot);}
  gas=new T.Group();scene.add(gas);
  for(let i=0;i<4;i++){
   const material=new T.MeshBasicMaterial({color:0x35caf0,transparent:true,opacity:.65,depthTest:false,depthWrite:false});
   const curve=new T.CatmullRomCurve3(Array.from({length:20},(_,j)=>{const u=(j/19-.5)*.65,a=twist*u/L+Math.PI/4;return new T.Vector3(u,.82*Math.cos(a),.82*Math.sin(a));}));
   const pocket=new T.Mesh(new T.TubeGeometry(curve,24,.12,8,false),material);pocket.renderOrder=20;gas.add(pocket);
  }
  function flowArrow(x,color){const g=new T.Group(),m=new T.MeshStandardMaterial({color,metalness:.1,roughness:.35,emissive:color,emissiveIntensity:.12});g.add(cylinder(.065,.5,m,x,0,0));const tip=new T.Mesh(new T.ConeGeometry(.17,.3,24),m);tip.rotation.z=-Math.PI/2;tip.position.set(x+.35,0,0);g.add(tip);scene.add(g);return g;}
  inletArrow=flowArrow(-3.25,0x35caf0);outletArrow=flowArrow(3.1,0xff7180);
  parts=[housing,male,female,gas,inletArrow,outletArrow];for(const part of parts)part.traverse(m=>{if(m.isMesh)m.material=m.material.clone();});ready=true;return true;
 }
 function project(x,y,z){const v=new T.Vector3(x,y,z).project(camera);return [(v.x+1)*450,(1-v.y)*300];}
 window.ScrewView={
  render(phase,{selected=-1,air=true,showHousing=true,frontView=false}={}){
   if(!init())return false;front=frontView;
   camera.position.set(...(front?[10,0,0]:[6,4.5,11]));camera.up.set(0,1,0);camera.lookAt(0,-.05,0);camera.zoom=front?1.65:1.2;camera.updateProjectionMatrix();camera.updateMatrixWorld();
   male.rotation.x=phase*TAU;female.rotation.x=-ratio*phase*TAU;housing.visible=showHousing;gas.visible=air&&!front;inletArrow.visible=air&&!front;outletArrow.visible=air&&!front;
   for(let i=0;i<gas.children.length;i++){
    const f=(i/4+phase)%1,mesh=gas.children[i],a=phase*TAU+twist*f;
    mesh.rotation.x=a;mesh.position.set((f-.5)*L,-D/2,0);mesh.scale.set(1-f*.72,1,1);
    const c=f<.25?0x35caf0:f<.8?0xf2be56:0xff7180;mesh.material.color.setHex(c);
   }
   parts.forEach((part,i)=>part.traverse(m=>{if(!m.isMesh||!m.material.emissive||i===3)return;m.material.emissive.setHex(i===selected?0x173c5a:0);}));
   renderer.render(scene,camera);
   return {male:project(-.2,-D/2,.7),female:project(.2,D/2,.7),housing:project(.9,-1.85,-.2),gas:project(.1,-.35,.8),input:project(-3.15,0,0),output:project(3.3,0,0)};
  },
  available:()=>ready&&!failed
 };
})();

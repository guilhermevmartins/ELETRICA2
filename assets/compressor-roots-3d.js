/* Soprador Roots de dois lóbulos: modelo didático próprio.
   Perfis conjugados por segmentos cicloidais, com folgas ilustrativas. */
(() => {
 'use strict';
 const T=window.THREE,TAU=Math.PI*2,R=.8,D=2*R,host=document.getElementById('rootsCanvasHost');
 function profilePoint(t){
  const r=R/4,epi=Math.floor((t+1e-8)/(Math.PI/2))%2===0;
  return epi?[(R+r)*Math.cos(t)-r*Math.cos(5*t),(R+r)*Math.sin(t)-r*Math.sin(5*t)]:[(R-r)*Math.cos(t)+r*Math.cos(3*t),(R-r)*Math.sin(t)-r*Math.sin(3*t)];
 }
 function rotorPoint(t,phase,upper=false){const [x,y]=profilePoint(t),a=Math.PI/2+(upper?-1:1)*TAU*phase;return [.99*(x*Math.cos(a)-y*Math.sin(a)),(upper?R:-R)+.99*(x*Math.sin(a)+y*Math.cos(a))];}
 function outline(radius){
  const theta=Math.acos(D/(2*radius)),p=[];
  // União de duas câmaras circulares, com centros alinhados na vertical.
  for(let i=0;i<=96;i++){const a=theta+(TAU-2*theta)*i/96;p.push(new T.Vector2(radius*Math.sin(a),-R+radius*Math.cos(a)));}
  for(let i=0;i<=96;i++){const a=Math.PI+theta+(TAU-2*theta)*i/96;p.push(new T.Vector2(radius*Math.sin(a),R+radius*Math.cos(a)));}return p;
 }
 let renderer,scene,camera,body,lower,upper,gas,particles,gears,gearLower,gearUpper,input,output,parts,ready=false,failed=false;
 function extrude(shape,depth,material,z,bevel=.025){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,bevelSize:bevel,bevelThickness:.025,steps:1,curveSegments:64});const m=new T.Mesh(g,material);m.position.z=z;return m;}
 function ring(r1,r0,depth,material,x,y,z){const shape=new T.Shape();shape.absarc(0,0,r1,0,TAU,false);const h=new T.Path();h.absarc(0,0,r0,0,TAU,true);shape.holes.push(h);const m=extrude(shape,depth,material,z);m.position.x=x;m.position.y=y;return m;}
 function cyl(r,len,material,x,y,z,axis='z'){
  const m=new T.Mesh(new T.CylinderGeometry(r,r,len,48),material);if(axis==='z')m.rotation.x=Math.PI/2;else m.rotation.z=-Math.PI/2;m.position.set(x,y,z);return m;
 }
 function init(){
  if(ready)return true;if(failed||!T||!host)return false;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{failed=true;return false;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(900,600);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.style.cssText='width:100%;height:100%;display:block';renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
  scene=new T.Scene();camera=new T.OrthographicCamera(-4.65,4.65,3.1,-3.1,.1,70);
  scene.add(new T.HemisphereLight(0xe3f5ff,0x22374a,2.3));
  for(const [color,intensity,x,y,z] of [[0xffffff,3,-4,6,8],[0xa4d4ff,2,6,1,-4],[0xffeacb,1.7,3,6,4]]){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
  const studio=new T.Scene();studio.background=new T.Color(0x7e96a9);
  for(const [x,y,z,w,h,color] of [[0,7,0,10,7,0xffffff],[-7,1,0,6,9,0xffffff],[7,2,0,4,10,0x47718e],[0,0,8,10,5,0xd7edff]]){const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);}
  const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(studio,.12).texture;pmrem.dispose();
  const steel=new T.MeshStandardMaterial({color:0xd5e4ed,metalness:.95,roughness:.22});
  const iron=new T.MeshStandardMaterial({color:0x304959,metalness:.78,roughness:.34});
  const edge=new T.MeshStandardMaterial({color:0x7593a7,metalness:.85,roughness:.28});
  const brass=new T.MeshStandardMaterial({color:0xd0ab59,metalness:.85,roughness:.3});
  body=new T.Group();scene.add(body);
  const casingShape=new T.Shape(outline(1.43));casingShape.holes.push(new T.Path(outline(1.23).reverse()));
  body.add(extrude(casingShape,1.55,iron,-.8));
  const rimShape=new T.Shape(outline(1.46));rimShape.holes.push(new T.Path(outline(1.235).reverse()));body.add(extrude(rimShape,.08,edge,.76));
  body.add(extrude(new T.Shape(outline(1.43)),.13,iron,-.98));
  for(const cy of [-R,R])for(const a of [Math.PI*.2,Math.PI*.8,Math.PI*1.2,Math.PI*1.8]){
   const x=1.34*Math.cos(a),y=cy+1.34*Math.sin(a);body.add(cyl(.07,.15,steel,x,y,.92));
  }
  // Rotores prismáticos conjugados, montados sobre eixos paralelos.
  const points=Array.from({length:480},(_,i)=>{const p=profilePoint(i*TAU/480);return new T.Vector2(p[0]*.99,p[1]*.99);});
  const rotorShape=new T.Shape(points);
  function rotor(cy){
   const group=new T.Group();group.position.y=cy;group.add(extrude(rotorShape,1.38,steel,-.69,.004));
   group.add(cyl(.16,2.85,edge,0,0,0));group.add(ring(.29,.165,.07,iron,0,0,.79));group.add(cyl(.18,.10,steel,0,0,.95));
   const slot=new T.Mesh(new T.BoxGeometry(.16,.035,.012),brass);slot.position.set(0,0,1.01);group.add(slot);scene.add(group);return group;
  }
  lower=rotor(-R);upper=rotor(R);
  function port(x,color){const g=new T.Group(),fluid=new T.MeshBasicMaterial({color,transparent:true,opacity:.8}),tube=edge.clone();tube.transparent=true;tube.opacity=.3;tube.depthWrite=false;g.add(cyl(.255,1.9,tube,x,0,-.05,'x'));g.add(cyl(.205,1.93,fluid,x,0,-.05,'x'));
   const flange=ring(.40,.22,.14,iron,0,0,0);flange.rotation.y=Math.PI/2;flange.position.set(x<0?-1.65:1.65,0,-.05);g.add(flange);scene.add(g);return g;}
  input=port(-2.15,0x35caf0);output=port(2.15,0xff7180);
  // Gás atrás das faces dos rotores: o metal oculta a região que ele ocupa.
  const volumeGeometry=new T.ExtrudeGeometry(new T.Shape(outline(1.225)),{depth:1.34,bevelEnabled:false,steps:1});
  gas=new T.Mesh(volumeGeometry,new T.MeshBasicMaterial({color:0x21c6ec,transparent:true,opacity:.50,depthWrite:false}));gas.position.z=-.66;scene.add(gas);
  const particleGeometry=new T.BufferGeometry();particleGeometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(48*3),3));particleGeometry.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(48*3),3));
  particles=new T.Points(particleGeometry,new T.PointsMaterial({size:.045,vertexColors:true,transparent:true,opacity:.85,depthWrite:false}));scene.add(particles);
  gears=new T.Group();scene.add(gears);
  function gear(cy){const pts=[];for(let i=0;i<20;i++)for(const [f,r] of [[-.5,.70],[-.25,.865],[.25,.865],[.5,.70]]){const a=(i+f)*TAU/20;pts.push(new T.Vector2(r*Math.cos(a),r*Math.sin(a)));}const g=new T.Group();g.position.set(0,cy,-1.18);g.add(extrude(new T.Shape(pts),.18,brass,-.08),cyl(.20,.25,edge,0,0,0));gears.add(g);return g;}
  gearLower=gear(-R);gearUpper=gear(R);
  const base=new T.Mesh(new T.BoxGeometry(2.8,.13,2.1),iron);base.position.set(0,-2.35,-.15);body.add(base);
  for(const x of [-.85,.85]){const foot=new T.Mesh(new T.BoxGeometry(.3,.4,1.4),iron);foot.position.set(x,-2.12,-.15);body.add(foot);}
  parts=[body,lower,upper,gas,input,output,gears];
  for(const part of parts)part.traverse(m=>{if(m.isMesh)m.material=m.material.clone();});ready=true;return true;
 }
 let maskPhase=-1,maskPolygons=[];
 function blocked(x,y,phase){
  if(maskPhase!==phase){maskPhase=phase;maskPolygons=[false,true].map(upper=>Array.from({length:240},(_,i)=>rotorPoint(i*TAU/240,phase,upper)));}
  for(const polygon of maskPolygons){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
   const p=polygon[i],q=polygon[j];if((p[1]>y)!==(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])inside=!inside;
  }if(inside)return true;}return false;
 }
 function project(x,y,z){const p=new T.Vector3(x,y,z).project(camera);return [(p.x+1)*450,(1-p.y)*300];}
 window.RootsView={rotorPoint,
  render(phase,{selected=-1,air=true,showHousing=true,view='perspective'}={}){
   if(!init())return false;
   camera.position.set(...(view==='front'?[0,0,12]:view==='gears'?[3,1,-12]:[3,1.7,11]));camera.up.set(0,1,0);camera.lookAt(0,-.12,0);camera.zoom=1.05;camera.updateProjectionMatrix();camera.updateMatrixWorld();
   lower.rotation.z=Math.PI/2+TAU*phase;upper.rotation.z=Math.PI/2-TAU*phase;gearLower.rotation.z=TAU*phase;gearUpper.rotation.z=-TAU*phase+Math.PI/20;
   body.visible=showHousing;gas.visible=air&&view!=='gears';particles.visible=gas.visible;
   const pos=particles.geometry.attributes.position,col=particles.geometry.attributes.color;
   for(let i=0;i<48;i++){
    const f=(i/24+phase)%1,sign=i<24?1:-1;let x,y;
    if(f<.2){x=-3.05+2.15*f/.2;y=0;}else if(f>.8){x=.9+2.15*(f-.8)/.2;y=0;}else{const a=Math.PI+Math.asin(R/1.2)-(Math.PI+2*Math.asin(R/1.2))*(f-.2)/.6;x=1.2*Math.cos(a);y=sign*(R+1.2*Math.sin(a));}
    const hidden=Math.abs(x)<1.3&&blocked(x,y,phase);pos.setXYZ(i,hidden?100:x,y,.705);
    const c=new T.Color(x>.83?0xffc7d0:0xd6fcff);col.setXYZ(i,c.r,c.g,c.b);
   }
   pos.needsUpdate=true;col.needsUpdate=true;
   parts.forEach((part,i)=>part.traverse(m=>{if(m.isMesh&&m.material.emissive)m.material.emissive.setHex(i===selected?0x214e72:0);}));renderer.render(scene,camera);
   return {lower:project(-.4,-R,.8),upper:project(.4,R,.8),body:project(1.3,-1.1,.75),gas:project(-.5,1.8,.72),input:project(-2.7,0,.2),output:project(2.7,0,.2),gears:project(.4,.1,-1.3)};
  },available:()=>ready&&!failed
 };
})();

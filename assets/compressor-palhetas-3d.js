/* Compressor de pastilhas / palhetas deslizantes. Geometria própria em corte.
   A ponta de cada palheta segue a interseção exata do raio com o estator. */
(() => {
 'use strict';
 const T=window.THREE,TAU=Math.PI*2,N=8,R=1.8,r=1.32,cy=-.4,host=document.getElementById('vaneCanvasHost');
 const mod=x=>(x%TAU+TAU)%TAU;
 function reach(a){const dot=cy*Math.sin(a);return -dot+Math.sqrt(dot*dot+R*R-cy*cy)}
 function pose(phase,i=0){const a=-Math.PI/2-TAU*phase+Math.PI/N-i*TAU/N;return {a,d:reach(a),x:reach(a)*Math.cos(a),y:cy+reach(a)*Math.sin(a)}}
 function cell(phase,i=0){const a=pose(phase,i).a,b=a-TAU/N,points=[],steps=32;let area=0;
  for(let j=0;j<=steps;j++){const t=a+(b-a)*j/steps,d=reach(t);points.push([d*Math.cos(t),cy+d*Math.sin(t)])}
  for(let j=0;j<=steps;j++){const t=b+(a-b)*j/steps;points.push([r*Math.cos(t),cy+r*Math.sin(t)])}
  for(let j=0;j<points.length;j++){const p=points[j],q=points[(j+1)%points.length];area+=p[0]*q[1]-q[0]*p[1]}return {points,area:Math.abs(area)/2,progress:mod(-(a-Math.PI/N+Math.PI/2))/TAU};
 }
 function stage(progress){return progress<.125?0:progress<.5?1:progress<.875?2:3}
 let renderer,scene,camera,housing,cover,rotor,shaft,vanes=[],springs=[],cells=[],inlet,outlet,arrows,parts,ready=false,failed=false;
 function cylinder(radius,length,mat,x,y,z){const obj=new T.Mesh(new T.CylinderGeometry(radius,radius,length,72),mat);obj.rotation.x=Math.PI/2;obj.position.set(x,y,z);return obj}
 function ring(ro,ri,depth,mat,z=0){const s=new T.Shape();s.absarc(0,0,ro,0,TAU,false);const h=new T.Path();h.absarc(0,0,ri,0,TAU,true);s.holes.push(h);const mesh=new T.Mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,curveSegments:96}),mat);mesh.position.z=z;return mesh}
 function box(w,h,d,mat,x,y,z){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);return mesh}
 function init(){if(ready)return true;if(failed||!T||!host)return false;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{failed=true;return false}
  renderer.setSize(900,600);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.domElement.style.cssText='width:100%;height:100%;display:block';renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
  scene=new T.Scene();camera=new T.OrthographicCamera(-4.5,4.5,3,-3,.1,80);scene.add(new T.HemisphereLight(0xe3f2ff,0x1a2d3e,2.5));
  for(const [intensity,x,y,z] of [[3,-5,6,8],[2,5,2,-4],[1.5,4,5,6]]){const l=new T.DirectionalLight(0xffffff,intensity);l.position.set(x,y,z);scene.add(l)}
  const studio=new T.Scene();studio.background=new T.Color(0x869dad);for(const [x,y,z,w,h,color] of [[0,7,0,10,8,0xffffff],[-7,1,0,6,9,0xffffff],[7,2,0,4,10,0x456b87],[0,0,8,10,6,0xd7edff]]){const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p)}const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(studio,.12).texture;pmrem.dispose();
  const blue=new T.MeshStandardMaterial({color:0x367b9f,metalness:.65,roughness:.35}),steel=new T.MeshStandardMaterial({color:0xc8d6df,metalness:.94,roughness:.23}),dark=new T.MeshStandardMaterial({color:0x253541,metalness:.7,roughness:.32}),edge=new T.MeshStandardMaterial({color:0x92b1c4,metalness:.82,roughness:.3}),copper=new T.MeshStandardMaterial({color:0xa86d43,metalness:.75,roughness:.3});
  housing=new T.Group();scene.add(housing);housing.add(ring(2.02,R,1.5,blue,-.76),ring(2.05,R+.006,.09,edge,.76),cylinder(2.02,.13,blue,0,0,-.9));
  for(let i=0;i<8;i++){const a=TAU*i/8;housing.add(cylinder(.07,.09,steel,1.93*Math.cos(a),1.93*Math.sin(a),.9))}
  housing.add(box(3.1,.16,2.1,blue,0,-2.45,-.15));for(const x of [-1,1])housing.add(box(.3,.5,1.6,blue,x,-2.2,-.15));
  cover=new T.Group();scene.add(cover);cover.add(cylinder(2.01,.16,blue,0,0,.98),cylinder(.6,.16,edge,0,cy,1.12));
  for(let i=0;i<8;i++){const a=TAU*i/8;cover.add(cylinder(.065,.055,steel,1.88*Math.cos(a),1.88*Math.sin(a),1.09))}
  rotor=new T.Group();rotor.position.y=cy;scene.add(rotor);rotor.add(cylinder(r,1.4,steel,0,0,0));
  for(let i=0;i<N;i++){const a=Math.PI/N-i*TAU/N,slot=box(1.16,.115,.012,dark,.76*Math.cos(a),.76*Math.sin(a),.711);slot.rotation.z=a;rotor.add(slot)}
  shaft=new T.Group();shaft.position.y=cy;scene.add(shaft);shaft.add(cylinder(.17,2.55,edge,0,0,.1),cylinder(.27,.08,dark,0,0,.84),box(.06,.20,.025,copper,.1,0,1.39));
  for(let i=0;i<N;i++){
   const vane=new T.Group();vane.position.y=cy;const blade=box(1.10,.075,1.52,steel,0,0,0);vane.add(blade);scene.add(vane);vanes.push(vane);
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(81*3),3));const spring=new T.Line(geometry,new T.LineBasicMaterial({color:0xb87e55}));spring.position.y=cy;scene.add(spring);springs.push(spring);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(32*6*3),3));g.setIndex(Array.from({length:32*6},(_,j)=>j));const gas=new T.Mesh(g,new T.MeshBasicMaterial({color:0x35caf0,transparent:true,opacity:.55,side:T.DoubleSide,depthWrite:false}));scene.add(gas);cells.push(gas);
  }
  function port(a,color){const group=new T.Group(),len=1.4,mid=R+.7;const tube=ring(.28,.195,len,blue,-len/2);tube.rotation.y=Math.PI/2;tube.position.set(-len/2,0,0);group.add(tube);const fluid=new T.Mesh(new T.CylinderGeometry(.19,.19,len+.01,40),new T.MeshBasicMaterial({color,transparent:true,opacity:.8}));fluid.rotation.z=Math.PI/2;group.add(fluid);const flange=ring(.40,.2,.13,edge,0);flange.rotation.y=Math.PI/2;flange.position.x=.28;group.add(flange);group.position.set(mid*Math.cos(a),mid*Math.sin(a),-.1);group.rotation.z=a;scene.add(group);return group}
  inlet=port(-2.7,0x35caf0);outlet=port(-.45,0xff7180);
  arrows=new T.Group();scene.add(arrows);for(const [a,color,direction] of [[-2.7,0x35caf0,-1],[-.45,0xff7180,1]]){const dir=new T.Vector3(direction*Math.cos(a),direction*Math.sin(a),0),start=new T.Vector3((direction<0?3.3:2.1)*Math.cos(a),(direction<0?3.3:2.1)*Math.sin(a),.3);arrows.add(new T.ArrowHelper(dir,start,.95,color,.22,.12))}
  parts=[housing,rotor,new T.Group(),new T.Group(),inlet,outlet,shaft];
  // Clones por peça permitem realce sem colorir componentes vizinhos.
  for(const group of [housing,rotor,shaft,...vanes])group.traverse(obj=>{if(obj.isMesh)obj.material=obj.material.clone()});ready=true;return true;
 }
 function project(x,y,z){const p=new T.Vector3(x,y,z).project(camera);return [(p.x+1)*450,(1-p.y)*300]}
 window.VaneView={pose,cell,reach,stage,
  render(phase,{selected=-1,air=true,showHousing=true,view='perspective',showSprings=true}={}){
   if(!init())return false;camera.position.set(...(view==='front'?[0,0,13]:[2.5,1.5,12]));camera.lookAt(0,-.12,0);camera.zoom=1.08;camera.updateProjectionMatrix();camera.updateMatrixWorld();
   housing.visible=showHousing;cover.visible=view==='closed';rotor.rotation.z=shaft.rotation.z=-Math.PI/2-TAU*phase;
   vanes.forEach((vane,i)=>{
    const p=pose(phase,i);vane.rotation.z=p.a;vane.children[0].position.x=p.d-.55-.014;
    const positions=springs[i].geometry.attributes.position,start=.20,end=p.d-1.11;
    for(let j=0;j<=80;j++){const f=j/80,rad=start+Math.max(.015,end-start)*f,wiggle=Math.sin(f*TAU*9)*.032,z=.78+Math.cos(f*TAU*9)*.032;positions.setXYZ(j,rad*Math.cos(p.a)-wiggle*Math.sin(p.a),rad*Math.sin(p.a)+wiggle*Math.cos(p.a),z)}positions.needsUpdate=true;springs[i].visible=showSprings;
    const c=cell(phase,i),color=[0x5c93b0,0x35caf0,0xf2be56,0xff7180][stage(c.progress)];cells[i].material.color.setHex(color);cells[i].material.opacity=i===0?.75:.22;cells[i].visible=air&&view!=='closed';
    const a=p.a,b=a-TAU/N,attr=cells[i].geometry.attributes.position;let idx=0;
    for(let j=0;j<32;j++){const t=a+(b-a)*j/32,u=a+(b-a)*(j+1)/32,P=[reach(t)*Math.cos(t),cy+reach(t)*Math.sin(t)],Q=[reach(u)*Math.cos(u),cy+reach(u)*Math.sin(u)],S=[r*Math.cos(t),cy+r*Math.sin(t)],V=[r*Math.cos(u),cy+r*Math.sin(u)];for(const point of [P,Q,S,Q,V,S])attr.setXYZ(idx++,point[0],point[1],.73)}attr.needsUpdate=true;cells[i].geometry.computeBoundingSphere();
    vane.traverse(o=>{if(o.isMesh)o.material.emissive.setHex(selected===2?0x214e72:i===0?0x16160b:0)});
   });
   for(const [group,id] of [[housing,0],[rotor,1],[shaft,6],[inlet,4],[outlet,5]])group.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(selected===id?0x214e72:0)});
   springs.forEach(s=>s.material.color.setHex(selected===3?0xffd17c:0xb87e55));arrows.visible=air&&view!=='closed';renderer.render(scene,camera);
   const representative=Array.from({length:N},(_,i)=>pose(phase,i)).sort((a,b)=>Math.abs(Math.atan2(Math.sin(a.a-Math.PI/4),Math.cos(a.a-Math.PI/4)))-Math.abs(Math.atan2(Math.sin(b.a-Math.PI/4),Math.cos(b.a-Math.PI/4))))[0];
   const p=representative,c=cell(phase,0),mid=p.a-Math.PI/N,d=(reach(mid)+r)/2;
   return {body:project(-1.65,1.1,.8),rotor:project(-.5,cy,.75),vane:project((p.d-.2)*Math.cos(p.a),cy+(p.d-.2)*Math.sin(p.a),.8),spring:project((p.d-1.2)*Math.cos(p.a),cy+(p.d-1.2)*Math.sin(p.a),.8),inlet:project(-2.6,-1.2,.2),outlet:project(2.6,-1.2,.2),shaft:project(0,cy,1.35),cell:project(d*Math.cos(mid),cy+d*Math.sin(mid),.76),volume:c.area};
  },available:()=>ready&&!failed
 };
})();

import {terminal,portCount} from './components.mjs';
// Somente terminais sobre fios criam conexão; cruzar dois fios não cria junção.
export function connectOverlappingTerminals(project,uid){
 const parents=new Map(),key=e=>e.id+':'+e.port;
 const find=k=>{if(!parents.has(k))parents.set(k,k);let r=k;while(parents.get(r)!==r)r=parents.get(r);return r;};
 const join=(a,b)=>parents.set(find(key(a)),find(key(b)));
 for(const w of project.wires)join(w.from,w.to);
 let count=0;
 for(const c of project.components)for(let p=0;p<portCount(c);p++){
  const end={id:c.id,port:p},point=terminal(c,p);
  for(const wire of [...project.wires]){
   if(project.wires.length>=1500)return count;
   if(find(key(end))===find(key(wire.from)))continue;
   const points=circuitWirePoints(project,wire);
   for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1],dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;if(!len)continue;
    const t=((point.x-a.x)*dx+(point.y-a.y)*dy)/len;
    if(t<0||t>1||Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy)>.1)continue;
    const oldTo=wire.to;
    wire.to=end;wire.points=points.slice(1,i+1);
    project.wires.push({id:uid(),from:end,to:oldTo,points:points.slice(i+1,-1),color:wire.color});
    join(wire.from,end);join(end,oldTo);count++;break;
   }
  }
 }
 return count;
}
export function circuitWirePoints(project,w){const a=project.components.find(c=>c.id===w.from.id),b=project.components.find(c=>c.id===w.to.id);if(!a||!b)return[];const start=terminal(a,w.from.port),end=terminal(b,w.to.port);if(w.points?.length){const points=[start];for(const p of [...w.points,end]){const prev=points.at(-1);if(Math.abs(p.x-prev.x)>.1&&Math.abs(p.y-prev.y)>.1)points.push({x:prev.x,y:p.y});points.push(p);}return points;}if(Math.abs(start.x-end.x)<.1||Math.abs(start.y-end.y)<.1)return[start,end];const middle=Math.round((start.y+end.y)/40)*20;return[start,{x:start.x,y:middle},{x:end.x,y:middle},end];}

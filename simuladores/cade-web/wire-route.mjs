// One routing rule for the preview and the saved wire. Keep each chosen bend.
export function wireRoute(start,end,waypoints=[]){
 const points=[{...start}];
 for(const p of [...waypoints,end]){
  const previous=points.at(-1);
  if(Math.abs(previous.x-p.x)>.001&&Math.abs(previous.y-p.y)>.001)
   points.push({x:previous.x,y:p.y});
  if(Math.hypot(points.at(-1).x-p.x,points.at(-1).y-p.y)>.001)points.push({...p});
 }
 return points;
}

import {portCount,terminal} from './components.mjs';
// Pick in screen pixels so zoom never makes a terminal harder to reach.
export function nearestTerminal(components,point,scale,radius=12){
 let best=null,distance=radius;
 for(const c of components)for(let port=0;port<portCount(c);port++){
  const position=terminal(c,port),d=Math.hypot(position.x-point.x,position.y-point.y)*scale;
  if(d<=distance){distance=d;best={id:c.id,port,position};}
 }
 return best;
}

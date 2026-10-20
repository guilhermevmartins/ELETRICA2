/** Digital conductor topology. Phase identity is preserved; no analog solver. */
import {nativeSymbol} from './symbol-library.mjs';
export function topology(c){
 const type=c.type;
 if(type==='junction')return {kind:'junction',ports:[{x:0,y:0}],pairs:[]};
 const graphic=nativeSymbol(type);if(graphic)return {kind:'drawing-only',ports:graphic.ports,pairs:[]};
 const sources={phase:['L1'],neutral:['N'],earth:['PE'],phaseN:['L1','N'],phase3:['L1','L2','L3'],phase3N:['L1','L2','L3','N']};
 if(sources[type]){const rails=sources[type];return {kind:'source',rails,ports:rails.map((_,i)=>({x:(i-(rails.length-1)/2)*20,y:0})),pairs:[]};}
 if(type==='motor3')return {kind:'motor3',ports:[{x:-20,y:-40},{x:0,y:-40},{x:20,y:-40}],pairs:[]};
 if(['contactChange','switchChange','buttonChange'].includes(type))return {kind:type,ports:[{x:0,y:40},{x:-20,y:-40},{x:20,y:-40}],pairs:[]};
 const m=/^(fuse|breaker|contactor)([234])$/.exec(type),n=m?Number(m[2]):1;
 return {kind:m?m[1]:type,ports:[...Array.from({length:n},(_,i)=>({x:(i-(n-1)/2)*20,y:-40})),...Array.from({length:n},(_,i)=>({x:(i-(n-1)/2)*20,y:40}))],pairs:Array.from({length:n},(_,i)=>[i,n+i])};
}
export const portCount=c=>topology(c).ports.length;
export const sourceType=c=>topology(c).kind==='source';

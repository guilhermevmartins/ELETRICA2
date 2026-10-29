import {sswPorts} from './ssw05.mjs';
/** Digital conductor topology. Phase identity is preserved; no analog solver. */
import {nativeSymbol} from './symbol-library.mjs';
export function topology(c){
 const type=c.type;
 if(type==='ssw05')return {kind:'ssw05',ports:sswPorts,pairs:[]};
 if(type==='junction')return {kind:'junction',ports:[{x:0,y:0}],pairs:[]};
 const graphic=nativeSymbol(type);
 const nativeRails={native32873:['L1'],native32874:['N'],native32883:['PE'],native33042:['PE'],native32872:['L1','N'],native32906:['L1','N','PE'],native32870:['L1','L2','L3'],native32879:['L1','L2','L3','PE'],native32869:['L1','L2','L3','N'],native32882:['L1','L2','L3','N','PE'],native32876:['DC:manual:+'],native32877:['DC:manual:-'],native32875:['DC:manual:+','DC:manual:-'],native33046:[`DC:${c.id}:+`,`DC:${c.id}:-`]};
 if(nativeRails[type])return {kind:'source',rails:nativeRails[type],ports:graphic.ports,pairs:[]};
 // Compatibilidade com projetos anteriores que usavam fase/neutro para + e −.
 if((type==='phase'&&c.nativeCommand===32876)||(type==='neutral'&&c.nativeCommand===32877))return {kind:'source',rails:[c.nativeCommand===32876?'DC:manual:+':'DC:manual:-'],ports:[{x:0,y:0}],pairs:[]};
 if(type==='native32997')return {kind:'dcSupply',ports:graphic.ports,pairs:[],inputs:[2,3],outputs:[0,1]};
 if(['native32995','native33045'].includes(type)){const n=type==='native33045'?3:2;return {kind:'transformer',ports:graphic.ports,pairs:[],inputs:Array.from({length:n},(_,i)=>i),outputs:Array.from({length:n},(_,i)=>n+i)};}
 if(type==='native32865')return {kind:'thermal',ports:graphic.ports,pairs:[[0,3],[1,4],[2,5]]};
 if(['native32998','native33044'].includes(type))return {kind:'dcSupply',ports:graphic.ports,pairs:[],inputs:type==='native32998'?[0,1]:[0,1,2],outputs:type==='native32998'?[2,3]:[3,4]};
 if(graphic)return {kind:'drawing-only',ports:graphic.ports,pairs:[]};
 const sources={phase:['L1'],neutral:['N'],earth:['PE'],phaseN:['L1','N'],phase3:['L1','L2','L3'],phase3N:['L1','L2','L3','N']};
 if(sources[type]){const rails=sources[type];return {kind:'source',rails,ports:rails.map((_,i)=>({x:(i-(rails.length-1)/2)*20,y:0})),pairs:[]};}
 if(type==='motor3')return {kind:'motor3',ports:[{x:-20,y:-40},{x:0,y:-40},{x:20,y:-40}],pairs:[]};
 if(['contactChange','switchChange','buttonChange'].includes(type))return {kind:type,ports:[{x:0,y:40},{x:-20,y:-40},{x:20,y:-40}],pairs:[]};
 const m=/^(fuse|breaker|contactor)([234])$/.exec(type),n=m?Number(m[2]):1;
 return {kind:m?m[1]:type,ports:[...Array.from({length:n},(_,i)=>({x:(i-(n-1)/2)*20,y:-40})),...Array.from({length:n},(_,i)=>({x:(i-(n-1)/2)*20,y:40}))],pairs:Array.from({length:n},(_,i)=>[i,n+i])};
}
export const portCount=c=>topology(c).ports.length;
export const sourceType=c=>topology(c).kind==='source';

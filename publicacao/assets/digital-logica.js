/* Funções puras: convenções explícitas, independentes da interface. */
(function(root){
 'use strict';
 const gates={BUF:a=>a,NOT:a=>1-a,AND:(a,b)=>a&b,OR:(a,b)=>a|b,NAND:(a,b)=>1-(a&b),NOR:(a,b)=>1-(a|b),XOR:(a,b)=>a^b,XNOR:(a,b)=>1-(a^b)};
 const adder=(a,b,cin=0)=>({sum:(a+b+cin)%2,carry:Number(a+b+cin>=2)});
 const mux=(a,b,s)=>s?b:a;
 const decoder=(a,b)=>Array.from({length:4},(_,i)=>Number(i===2*a+b));
 const priority=inputs=>{const i=inputs.lastIndexOf(1);return {valid:Number(i>=0),code:Math.max(i,0)};};
 const invert=q=>q===null?null:1-q;
 function memory(type,q,input,rising){
  const {a,b,en}=input;
  if(type==='sr')return a&&b?null:a?1:b?0:q;
  if(type==='latch')return en?a:q;
  if(!rising)return q;
  if(type==='d')return a;
  if(type==='jk')return a&&b?invert(q):a?1:b?0:q;
  if(type==='t')return a?invert(q):q;
  return q;
 }
 function system(type,value,{enable,serial},rising){
  if(!rising||!enable)return value;
  return type==='counter'?(value+1)%16:type==='shift'?((value<<1)|serial)&15:(value+1)%3;
 }
 const api={gates,adder,mux,decoder,priority,memory,system,invert};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DigitalLogic=api;
})(typeof window!=='undefined'?window:globalThis);

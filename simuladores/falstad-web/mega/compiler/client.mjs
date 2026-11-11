export function compileSketch(source,onProgress=()=>{}){
 const worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});
 let timer,finished=false;
 const promise=new Promise((resolve,reject)=>{
  const finish=(fn,value)=>{if(finished)return;finished=true;clearTimeout(timer);worker.terminate();fn(value);};
  worker.onmessage=({data})=>{if(data.progress)onProgress(data.progress);else if(data.error)finish(reject,Error(data.error));else finish(resolve,data);};
  worker.onerror=e=>finish(reject,Error(e.message||'Não foi possível iniciar o compilador.'));
  timer=setTimeout(()=>finish(reject,Error('A compilação demorou demais. Tente novamente.')),120000);
  worker.postMessage({source});
 });
 return promise;
}

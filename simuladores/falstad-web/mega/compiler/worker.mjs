import cc from './tools/cc1plus.mjs';
import assembler from './tools/avr-as.mjs';
import linker from './tools/avr-ld.mjs';
import objcopy from './tools/avr-objcopy.mjs';
import {prepareSketch} from './preprocess.mjs';
const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function write(fs,name,data){const parts=name.split('/');let dir='';for(const part of parts.slice(1,-1)){dir+='/'+part;try{fs.mkdir(dir);}catch{}}fs.writeFile(name,data);}
async function run(factory,name,args,files,output,log){
 const mod=await factory({noInitialRun:true,locateFile:p=>new URL('./tools/'+(p.endsWith('.wasm')?name+'.wasm':p),import.meta.url).href,print:s=>log.push(s),printErr:s=>log.push(s)});
 for(const [path,data] of Object.entries(files))write(mod.FS,path,data);
 let exit=0;try{exit=mod.callMain(args)||0;}catch(e){if(e.status!==0)throw Error(log.slice(-50).join('\n')||e.message);}
 if(exit!==0)throw Error(log.slice(-50).join('\n')||'Falha de compilação.');
 try{return mod.FS.readFile(output);}catch{throw Error(log.slice(-50).join('\n')||'O compilador não gerou o programa.');}
}
self.onmessage=async({data})=>{const log=[];try{
 const source=prepareSketch(data.source);
 self.postMessage({progress:'Carregando o compilador do Mega…'});
 const response=await fetch(new URL('./mega-assets.json',import.meta.url));if(!response.ok)throw Error('Não foi possível carregar o compilador.');
 const bundle=await response.json(),headers=Object.fromEntries(Object.entries(bundle.headers).map(([n,v])=>[n,decode(v)]));
 self.postMessage({progress:'Compilando o código…'});
 const assembly=await run(cc,'cc1plus',['-quiet','-imultilib','avr6','-D__AVR_ATmega2560__','-D__AVR_DEVICE_NAME__=atmega2560','-DF_CPU=16000000L','-DARDUINO=10819','-DARDUINO_AVR_MEGA2560','-DARDUINO_ARCH_AVR','-isystem','/sysroot/gcc/include','-isystem','/sysroot/avr/include','-I','/arduino/core','-I','/arduino/variant','-I','/libraries/LiquidCrystal','/build/sketch.cpp','-mn-flash=4','-mno-skip-bug','-mmcu=avr6','-Os','-std=gnu++11','-fpermissive','-fno-exceptions','-fno-threadsafe-statics','-fno-rtti','-ffunction-sections','-fdata-sections','-o','/build/sketch.s'],{...headers,'/build/sketch.cpp':source},'/build/sketch.s',log);
 const object=await run(assembler,'avr-as',['-mmcu=atmega2560','-o','/build/sketch.o','/build/sketch.s'],{'/build/sketch.s':assembly},'/build/sketch.o',log);
 const links=Object.fromEntries(Object.entries(bundle.links).map(([n,v])=>[n,decode(v)]));
 const elf=await run(linker,'avr-ld',['-m','avr6','-Tdata=0x800200','--defsym=__DATA_REGION_ORIGIN__=0x800200','--defsym=__DATA_REGION_LENGTH__=0x2000','--defsym=__TEXT_REGION_LENGTH__=0x40000','--gc-sections','-o','/build/sketch.elf','/libs/crtatmega2560.o','/build/sketch.o','-L/libs','--start-group','/libs/core.a','-lm','-lc','-lgcc','-latmega2560','--end-group'],{...links,'/build/sketch.o':object},'/build/sketch.elf',log);
 const hex=new TextDecoder().decode(await run(objcopy,'avr-objcopy',['-O','ihex','-R','.eeprom','/build/sketch.elf','/build/sketch.hex'],{'/build/sketch.elf':elf},'/build/sketch.hex',log));
 self.postMessage({hex,log:log.join('\n')});
 }catch(e){self.postMessage({error:e.message||String(e)});}};


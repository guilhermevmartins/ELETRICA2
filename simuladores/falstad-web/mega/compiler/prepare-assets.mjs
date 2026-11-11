// Development utility; the deployed site only serves the generated static files.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const packages=process.env.ARDUINO_PACKAGES||'C:/Users/Senai/AppData/Local/Arduino15/packages/arduino';
const avr=path.join(packages,'hardware/avr/1.8.6'),gcc=path.join(packages,'tools/avr-gcc/7.3.0-atmel3.6.1-arduino7');
const lcd=process.env.LIQUIDCRYSTAL_PATH||'C:/Users/Senai/Documents/Arduino/libraries/LiquidCrystal/src';
const build=path.join(here,'.build');fs.mkdirSync(build,{recursive:true});
const files={},sources={};
function tree(dir,virtual){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name),v=virtual+'/'+e.name;if(e.isDirectory())tree(f,v);else if(/\.(h|hpp)$/.test(e.name)||e.name==='new')files[v]=fs.readFileSync(f).toString('base64');}}
tree(path.join(gcc,'avr/include'),'/sysroot/avr/include');
tree(path.join(gcc,'lib/gcc/avr/7.3.0/include'),'/sysroot/gcc/include');
tree(path.join(avr,'cores/arduino'),'/arduino/core');tree(path.join(avr,'variants/mega'),'/arduino/variant');tree(lcd,'/libraries/LiquidCrystal');
// Other device register maps account for most of avr-libc's headers; only Mega is targeted.
for(const name of Object.keys(files))if(/^\/sysroot\/avr\/include\/avr\/io/.test(name)&&!['io.h','iom2560.h','iomxx0_1.h','portpins.h'].includes(path.posix.basename(name)))delete files[name];
const common=['-mmcu=atmega2560','-DF_CPU=16000000L','-DARDUINO=10819','-DARDUINO_AVR_MEGA2560','-DARDUINO_ARCH_AVR','-Os','-ffunction-sections','-fdata-sections','-I'+path.join(avr,'cores/arduino'),'-I'+path.join(avr,'variants/mega'),'-I'+lcd];
const run=(tool,args)=>execFileSync(path.join(gcc,'bin',tool+(process.platform==='win32'?'.exe':'')),args,{stdio:'pipe'});
const objects=[];
for(const dir of [path.join(avr,'cores/arduino'),lcd])for(const name of fs.readdirSync(dir).filter(n=>/\.(cpp|c|S)$/.test(n))){const input=path.join(dir,name),object=path.join(build,name+'.o');run(name.endsWith('.cpp')?'avr-g++':'avr-gcc',[...common,...(name.endsWith('.cpp')?['-std=gnu++11','-fno-exceptions','-fno-threadsafe-statics']:[]),'-c',input,'-o',object]);objects.push(object);sources[(dir===lcd?'LiquidCrystal/':'core/')+name]=fs.readFileSync(input,'utf8');}
run('avr-ar',['rcs',path.join(build,'core.a'),...objects]);
const links={};
for(const [v,f] of Object.entries({'/libs/core.a':path.join(build,'core.a'),'/libs/crtatmega2560.o':path.join(gcc,'avr/lib/avr6/crtatmega2560.o'),'/libs/libc.a':path.join(gcc,'avr/lib/avr6/libc.a'),'/libs/libm.a':path.join(gcc,'avr/lib/avr6/libm.a'),'/libs/libgcc.a':path.join(gcc,'lib/gcc/avr/7.3.0/avr6/libgcc.a'),'/libs/libatmega2560.a':path.join(gcc,'avr/lib/avr6/libatmega2560.a'),'/ldscripts/avr6.xn':path.join(gcc,'avr/lib/ldscripts/avr6.xn')}))links[v]=fs.readFileSync(f).toString('base64');
for(const [v,encoded] of Object.entries(links)){if(!/\.(a|o)$/.test(v))continue;const f=path.join(build,path.basename(v));fs.writeFileSync(f,Buffer.from(encoded,'base64'));run('avr-strip',['--strip-debug',f]);links[v]=fs.readFileSync(f).toString('base64');}
fs.writeFileSync(path.join(here,'mega-assets.json'),JSON.stringify({headers:files,links}));
fs.writeFileSync(path.join(here,'arduino-sources.json'),JSON.stringify(sources));
for(const e of fs.readdirSync(build))fs.unlinkSync(path.join(build,e));fs.rmdirSync(build);
console.log('Mega 2560 headers and native archives ready.');

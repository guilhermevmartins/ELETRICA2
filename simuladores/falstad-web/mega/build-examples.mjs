// Developer utility only. HostGator serves the generated .hex files; it never runs a compiler.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const arduino=process.env.ARDUINO_PACKAGES||'C:/Users/Senai/AppData/Local/Arduino15/packages/arduino';
const core=path.join(arduino,'hardware/avr/1.8.6/cores/arduino'),variant=path.join(arduino,'hardware/avr/1.8.6/variants/mega');
const bin=path.join(arduino,'tools/avr-gcc/7.3.0-atmel3.6.1-arduino7/bin');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'senai-mega-build-'));
const run=(exe,args)=>execFileSync(path.join(bin,exe+(process.platform==='win32'?'.exe':'')),args,{stdio:'pipe'});
const common=['-mmcu=atmega2560','-DF_CPU=16000000L','-DARDUINO=10819','-DARDUINO_AVR_MEGA2560','-DARDUINO_ARCH_AVR','-Os','-ffunction-sections','-fdata-sections','-I'+core,'-I'+variant];
try{
  const objects=[];
  for(const name of fs.readdirSync(core).filter(n=>/\.(c|cpp|S)$/.test(n))){
    const output=path.join(tmp,name+'.o'),cpp=name.endsWith('.cpp');
    run(cpp?'avr-g++':'avr-gcc',[...common,...(cpp?['-std=gnu++11','-fno-exceptions','-fno-threadsafe-statics']:[]),'-c',path.join(core,name),'-o',output]);objects.push(output);
  }
  const archive=path.join(tmp,'core.a');run('avr-ar',['rcs',archive,...objects]);
  const sketches=process.argv.slice(2);if(!sketches.length)sketches.push(...['blink','button','analog'].map(n=>path.join(here,'examples',n+'.ino')));
  for(const sketch of sketches){const source=path.join(tmp,'sketch.cpp'),object=path.join(tmp,'sketch.o'),elf=path.join(tmp,'sketch.elf');
    fs.writeFileSync(source,'#include <Arduino.h>\n'+fs.readFileSync(sketch,'utf8'));
    run('avr-g++',[...common,'-std=gnu++11','-fno-exceptions','-fno-threadsafe-statics','-c',source,'-o',object]);
    run('avr-g++',['-mmcu=atmega2560','-Wl,--gc-sections','-o',elf,object,archive,'-lm']);
    run('avr-objcopy',['-O','ihex','-R','.eeprom',elf,sketch.replace(/\.ino$/,'.hex')]);
    console.log('Compiled Mega 2560:',path.basename(sketch));
  }
}finally{
  const resolved=fs.realpathSync(tmp),parent=fs.realpathSync(os.tmpdir());
  if(path.dirname(resolved)===parent&&path.basename(resolved).startsWith('senai-mega-build-'))fs.rmSync(resolved,{recursive:true,force:true});
}

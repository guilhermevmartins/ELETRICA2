// Arduino's single-sketch convenience: Arduino.h and forward declarations.
// Complex C++ signatures can use explicit prototypes, as in a regular .cpp file.
export function prepareSketch(source){
 if(typeof source!=='string'||source.length>200000)throw Error('O código deve ter até 200 mil caracteres.');
 if(!source.trim())throw Error('Cole um programa ou abra um arquivo .ino.');
 const masked=source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,s=>s.replace(/[^\n]/g,' '));
 const pattern=/^[ \t]*((?:(?:static|inline|const|unsigned|signed|long|short)\s+)*[A-Za-z_]\w*(?:\s*[*&])?\s+[A-Za-z_]\w*\s*\([^;{}]*\))\s*\{/gm;
 const declarations=[];let first=null;
 for(const match of masked.matchAll(pattern)){const signature=source.slice(match.index,match.index+match[0].lastIndexOf('{')).trim();if(/^(?:if|for|while|switch)\b/.test(signature)||signature.includes('='))continue;declarations.push(signature+';');first??=match.index;}
 if(first!==null){const line=source.slice(0,first).split('\n').length;source=source.slice(0,first)+declarations.join('\n')+`\n#line ${line} "sketch.ino"\n`+source.slice(first);}
 return '#include <Arduino.h>\n#line 1 "sketch.ino"\n'+source;
}

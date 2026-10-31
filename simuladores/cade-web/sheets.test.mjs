import assert from 'node:assert/strict';
import {prepareSheets,allSheets,addSheet,removeSheet,moveToSheet,sheetSize,formats} from './sheets.mjs';
import {example,validateProject} from './components.mjs';
import {simulate} from './engine.mjs';
let p=prepareSheets(validateProject(example('lamp')));assert.equal(p.sheets.length,1);const original=JSON.stringify(p);const id=p.activeSheetId;
addSheet(p,'second');assert.equal(p.components.length,0);p.components.push({id:'coil',type:'coil',x:100,y:100,tag:'K1'});assert.equal(allSheets(p).components.length,5);
p=prepareSheets(validateProject(JSON.parse(JSON.stringify(p))));assert.equal(p.sheets.length,2);assert.equal(p.components.length,1);p.activeSheetId=id;assert.equal(p.components.length,4);
assert.throws(()=>moveToSheet(p,new Set(['s']),'second'),/Selecione/);
moveToSheet(p,new Set(p.components.map(c=>c.id)),'second');assert.equal(p.components.length,0);p.activeSheetId='second';assert.equal(p.components.length,5);assert.equal(p.wires.length,3);
removeSheet(p,'second');assert.equal(p.sheets.length,1);assert.equal(p.components.length,0);
p=prepareSheets(JSON.parse(original));assert.equal(p.components.length,4);assert.equal(simulate(allSheets(p),{}, {s:true}).active.h,true);
for(const [format,mm] of Object.entries(formats)){assert.deepEqual(sheetSize({format,orientation:'landscape'}).mm,mm);assert.deepEqual(sheetSize({format,orientation:'portrait'}).mm,[...mm].reverse());}
const large=JSON.parse(original);large.sheets[0].format='A0';large.components[0].x=4500;assert.equal(validateProject(large).components[0].x,4500);
console.log('OK: legado, folhas persistentes, itens isolados, movimento de seleção, remoção, tamanhos e simulação global.');

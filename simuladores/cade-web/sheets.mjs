export const formats={A4:[297,210],A3:[420,297],A2:[594,420],A1:[841,594],A0:[1189,841]};
const stores=new WeakMap();
export function sheetSize(sheet){const mm=[...(formats[sheet.format]||formats.A4)];if(sheet.orientation==='portrait')mm.reverse();return {mm,width:mm[0]*1200/297,height:mm[1]*1200/297};}
export function prepareSheets(raw){
 if(stores.has(raw))return raw;
 const sheets=raw.sheets?.length?raw.sheets.map(s=>({...s})): [{id:'sheet-1',name:'Folha 1',format:'A4',orientation:'landscape'}];
 const data={...raw,sheets,activeSheetId:sheets.some(s=>s.id===raw.activeSheetId)?raw.activeSheetId:sheets[0].id};
 const arrays=['components','wires','drawings','annotations'];
 const pages=new Map(sheets.map(s=>[s.id,Object.fromEntries(arrays.map(k=>[k,[]]))]));
 for(const k of arrays)for(const item of raw[k]||[])pages.get(pages.has(item.sheetId)?item.sheetId:sheets[0].id)[k].push({...item});
 for(const k of arrays)Object.defineProperty(data,k,{enumerable:true,configurable:true,get(){return pages.get(data.activeSheetId)[k];},set(v){pages.get(data.activeSheetId)[k]=v;}});
 Object.defineProperty(data,'toJSON',{value:()=>({format:'cade-web',version:1,name:data.name,sheets:data.sheets,activeSheetId:data.activeSheetId,...Object.fromEntries(arrays.map(k=>[k,data.sheets.flatMap(s=>(pages.get(s.id)?.[k]||[]).map(item=>({...item,sheetId:s.id})))]))})});
 stores.set(data,pages);return data;
}
export const allSheets=p=>({...p.toJSON(),...Object.fromEntries(['components','wires','drawings','annotations'].map(k=>[k,p.sheets.flatMap(s=>stores.get(p).get(s.id)[k])]))});
export const activeSheet=p=>p.sheets.find(s=>s.id===p.activeSheetId);
export function addSheet(p,id){const s={id,name:'Folha '+(p.sheets.length+1),format:'A4',orientation:'landscape'};p.sheets.push(s);stores.get(p).set(id,{components:[],wires:[],drawings:[],annotations:[]});p.activeSheetId=id;return s;}
export function removeSheet(p,id){if(p.sheets.length===1)throw Error('Mantenha pelo menos uma folha.');p.sheets=p.sheets.filter(s=>s.id!==id);stores.get(p).delete(id);if(p.activeSheetId===id)p.activeSheetId=p.sheets[0].id;}
export function moveToSheet(p,ids,target){
 const from=stores.get(p).get(p.activeSheetId),to=stores.get(p).get(target);if(!to||from===to)return;
 if(from.wires.some(w=>ids.has(w.from.id)!==ids.has(w.to.id)))throw Error('Selecione também os componentes ligados por fios. Entre folhas, associe bobinas e contatos pela mesma referência.');
 const size=sheetSize(p.sheets.find(s=>s.id===target));if(from.components.some(c=>ids.has(c.id)&&(c.x>size.width-40||c.y>size.height-40)))throw Error('A seleção não cabe na folha de destino. Escolha um formato maior.');
 to.components.push(...from.components.filter(c=>ids.has(c.id)));to.wires.push(...from.wires.filter(w=>ids.has(w.from.id)));
 from.components=from.components.filter(c=>!ids.has(c.id));from.wires=from.wires.filter(w=>!ids.has(w.from.id));
}
export function printDocument(p,pages){return '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Imprimir circuito</title><style>html,body{margin:0;padding:0}*{box-sizing:border-box}svg{display:block;width:100%;height:100%}.sheet{break-after:page;overflow:hidden}.sheet:last-child{break-after:auto}.symbol-line{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:square;stroke-linejoin:miter}.symbol-fill{fill:currentColor;stroke:none}.wire{fill:none;stroke:#000;stroke-width:1.4}.component-label{font:14px Arial;fill:#000}.component-description{font:11px Arial;fill:#444}.terminal-label{font:9px Arial;fill:#555;text-anchor:end}.port{fill:white;stroke:#000;stroke-width:1}.paper-text{font-family:Arial;fill:#008000}'+p.sheets.map((s,i)=>{const {mm}=sheetSize(s);return `@page sheet${i}{size:${mm[0]}mm ${mm[1]}mm;margin:0}.sheet${i}{page:sheet${i};width:${mm[0]}mm;height:${mm[1]}mm}`;}).join('')+'</style><body>'+pages.map((svg,i)=>`<section class="sheet sheet${i}">${svg}</section>`).join('')+'</body></html>';}

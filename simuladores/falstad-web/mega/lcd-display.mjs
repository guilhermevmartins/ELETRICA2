import {esc} from './chip-models.mjs';
export const LCD_MODEL='ARD_LCD16x2_v1';
export const LCD_PINS=['RS','E','D4','D5','D6','D7'];
export function lcdCircuit(x,y){
 const pins=LCD_PINS.map((p,i)=>`LCD:${p} ${i+1} ${i} 2`).join(' '),nodes=LCD_PINS.map((_,i)=>`ResistorElm ${i+1} 0`).join('\r'),data=LCD_PINS.map(()=>esc('0 1000000000')).join(' ');
 return `. ${LCD_MODEL} 0 16 6 6 ${pins} ${esc(nodes)} ${esc(data)}\n410 ${x} ${y} ${x+512} ${y+192} 1 ${LCD_MODEL} ${data}\n`;
}
export function lcdState(){return {e:false,half:null,rs:false,address:0,display:true,fourBit:false,memory:Array(128).fill(' ')};}
export function stepLcd(s,read){const e=read('E');if(s.e&&!e){const rs=read('RS'),n=[4,5,6,7].reduce((v,b)=>v|(Number(read('D'+b))<<(b-4)),0);if(!s.fourBit){if(!rs&&n===2)s.fourBit=true;}else if(s.half===null){s.half=n;s.rs=rs;}else{const byte=s.half*16+n;s.half=null;if(rs&&s.rs){s.memory[s.address]=byte>=32&&byte<127?String.fromCharCode(byte):' ';s.address=(s.address+1)&127;}else if(!rs&&!s.rs){if(byte===1){s.memory.fill(' ');s.address=0;}else if(byte===2)s.address=0;else if(byte&128)s.address=byte&127;else if((byte&248)===8)s.display=!!(byte&4);}}}s.e=e;}
export const lcdText=s=>s.display?s.memory.slice(0,16).join('')+'\n'+s.memory.slice(64,80).join(''):'                \n                ';
// Render in the same canvas transform as the native chip's final pin label.
// This keeps the display attached while the chip is moved, zoomed, saved or copied.
export function installLcdDrawing(states,legacyState){
 const attached=new WeakSet();
 function attach(){for(const canvas of document.querySelectorAll('canvas')){const ctx=canvas.getContext('2d');if(!ctx||attached.has(ctx))continue;attached.add(ctx);const fill=ctx.fillText,clear=ctx.clearRect,rect=ctx.fillRect;let index=0;
  ctx.clearRect=function(...args){index=0;return clear.apply(this,args);};
  ctx.fillRect=function(x,y,w,h){if(x===0&&y===0&&w>300&&h>300)index=0;return rect.call(this,x,y,w,h);};
  ctx.fillText=function(text,x,y,...rest){const result=fill.call(this,text,x,y,...rest);if(text!=='LCD:D7'&&text!=='ARD_LCD_D7')return result;const screens=states();const state=text==='ARD_LCD_D7'?legacyState?.():screens.length?screens[index++%screens.length]:null;if(!state)return result;const left=x+116,top=y-172;
   this.save();this.fillStyle='#074e55';this.fillRect(left-10,top-10,364,176);this.fillStyle='#b6ce79';this.fillRect(left,top,344,152);this.strokeStyle='#082e35';this.lineWidth=3;this.strokeRect(left,top,344,152);this.textAlign='left';this.textBaseline='alphabetic';this.font='12px monospace';this.fillStyle='#385e38';fill.call(this,'LCD 16 × 2 · 4 bits',left+12,top+24);this.font='24px monospace';this.fillStyle='#183923';const lines=lcdText(state).split('\n');for(let row=0;row<2;row++){for(let col=0;col<16;col++){this.fillStyle='#a8c46c';this.fillRect(left+12+col*20,top+39+row*45,17,32);this.fillStyle='#183923';fill.call(this,lines[row][col],left+13+col*20,top+65+row*45);}}this.restore();return result;
  };
 }}
 new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});attach();
}

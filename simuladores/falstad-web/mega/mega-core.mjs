import {CPU, avrInstruction, AVRIOPort, AVRTimer, timer0Config, timer1Config, timer2Config, AVRADC, adcConfig, ADCMuxInputType, ADCReference, AVRUSART, usart0Config, PinState} from './vendor/avr8js/index.js';

export const FREQUENCY=16000000;
// ArduinoCore-avr/variants/mega/pins_arduino.h; addresses/vectors: avr-libc iomxx0_1.h.
const mapping='E0 E1 E4 E5 G5 E3 H3 H4 H5 H6 B4 B5 B6 B7 J1 J0 H1 H0 D3 D2 D1 D0 A0 A1 A2 A3 A4 A5 A6 A7 C7 C6 C5 C4 C3 C2 C1 C0 D7 G2 G1 G0 L7 L6 L5 L4 L3 L2 L1 L0 B3 B2 B1 B0 F0 F1 F2 F3 F4 F5 F6 F7 K0 K1 K2 K3 K4 K5 K6 K7'.split(' ');
export const PINS=mapping.map((s,id)=>({id,name:id<54?`D${id}`:`A${id-54}`,port:s[0],bit:Number(s[1]),pwm:(id>=2&&id<=13)||(id>=44&&id<=46)}));
export const portAddresses={A:0x22,B:0x25,C:0x28,D:0x2b,E:0x2e,F:0x31,G:0x34,H:0x102,J:0x105,K:0x108,L:0x10b};

export function parseHex(text){
  if(typeof text!=='string'||text.length>800000)throw Error('Arquivo HEX inválido ou maior que a memória do Mega.');
  const bytes=new Uint8Array(262144);bytes.fill(0xff);
  let base=0,eof=false,count=0;const used=new Set();
  for(const [i,raw] of text.trim().split(/\r?\n/).entries()){
    const line=raw.trim();if(!line)continue;
    if(eof||!/^:[\da-f]+$/i.test(line)||line.length%2!==1)throw Error(`HEX inválido na linha ${i+1}.`);
    const data=Uint8Array.from(line.slice(1).match(/../g),s=>parseInt(s,16));
    if(data.length<5||data.length!==data[0]+5||data.reduce((a,b)=>a+b,0)%256)throw Error(`Checksum ou tamanho incorreto na linha ${i+1}.`);
    const length=data[0],address=data[1]*256+data[2],type=data[3];
    if(type===0){for(let j=0;j<length;j++){const pos=base+address+j;if(pos>=bytes.length||used.has(pos))throw Error('HEX fora da memória do Mega ou com endereços repetidos.');bytes[pos]=data[4+j];used.add(pos);count++;}}
    else if(type===1){if(length||address)throw Error('Final de HEX inválido.');eof=true;}
    else if(type===2||type===4){if(length!==2||address)throw Error('Endereço estendido inválido.');base=(data[4]*256+data[5])*(type===2?16:65536);}
    else if(type===3||type===5){if(length!==4||address)throw Error('Endereço inicial inválido.');}
    else throw Error(`Registro HEX ${type} não suportado.`);
  }
  if(!eof||!count||!used.has(0)||!used.has(1))throw Error('HEX incompleto. Exporte o programa para Mega 2560, sem bootloader.');
  return {program:new Uint16Array(bytes.buffer),bytes:count};
}

const external=n=>({EICR:n<4?0x69:0x6a,EIMSK:0x3d,EIFR:0x3c,index:n,iscOffset:(n%4)*2,interrupt:(n+1)*2});
function timer16(base,tifr,timsk,vector,port,bits,externalPort=0,externalPin=0){
  return {...timer1Config,TCCRA:base,TCCRB:base+1,TCCRC:base+2,TCNT:base+4,ICR:base+6,OCRA:base+8,OCRB:base+10,OCRC:base+12,TIFR:tifr,TIMSK:timsk,
    captureInterrupt:vector*2,compAInterrupt:(vector+1)*2,compBInterrupt:(vector+2)*2,compCInterrupt:(vector+3)*2,ovfInterrupt:(vector+4)*2,
    OCFC:8,OCIEC:8,compPortA:port,compPinA:bits[0],compPortB:port,compPinB:bits[1],compPortC:port,compPinC:bits[2],externalClockPort:externalPort,externalClockPin:externalPin};
}
export class Mega2560 {
  constructor(hex,{read=()=>undefined,write=()=>{},serial=()=>{}}={}){
    const parsed=parseHex(hex);this.byteLength=parsed.bytes;
    // 0x200 register space + 8192 SRAM; AVR8js already reserves the first 0x100.
    this.cpu=new CPU(parsed.program,0x2100);this.read=read;this.write=write;this.ports={};this.lastOutputs=new Map();
    for(const [name,PORT] of Object.entries(portAddresses)){
      const config={PIN:PORT-2,DDR:PORT-1,PORT,externalInterrupts:[]};
      if(name==='D')config.externalInterrupts=[0,1,2,3].map(external);
      if(name==='E')config.externalInterrupts=[null,null,null,null,...[4,5,6,7].map(external)];
      if(name==='B'||name==='J'||name==='K'){
        const n={B:0,J:1,K:2}[name];config.pinChange={PCIE:n,PCICR:0x68,PCIFR:0x3b,PCMSK:0x6b+n,pinChangeInterrupt:(9+n)*2,mask:name==='J'?0x7f:0xff,offset:name==='J'?1:0};
      }
      this.ports[name]=new AVRIOPort(this.cpu,config);
    }
    this.timers=[
      new AVRTimer(this.cpu,{...timer0Config,compAInterrupt:42,compBInterrupt:44,ovfInterrupt:46,compPortA:0x25,compPinA:7,compPortB:0x34,compPinB:5,externalClockPort:0x2b,externalClockPin:7}),
      new AVRTimer(this.cpu,timer16(0x80,0x36,0x6f,16,0x25,[5,6,7],0x2b,6)),
      new AVRTimer(this.cpu,{...timer2Config,compAInterrupt:26,compBInterrupt:28,ovfInterrupt:30,compPortA:0x25,compPinA:4,compPortB:0x102,compPinB:6}),
      new AVRTimer(this.cpu,timer16(0x90,0x38,0x71,31,0x2e,[3,4,5],0x2e,6)),
      new AVRTimer(this.cpu,timer16(0xa0,0x39,0x72,41,0x102,[3,4,5],0x102,7)),
      new AVRTimer(this.cpu,timer16(0x120,0x3a,0x73,46,0x10b,[3,4,5],0x10b,2))
    ];
    const muxChannels={30:{type:ADCMuxInputType.Constant,voltage:1.1},31:{type:ADCMuxInputType.Constant,voltage:0}};
    for(let i=0;i<16;i++)muxChannels[i<8?i:32+i-8]={type:ADCMuxInputType.SingleEnded,channel:i};
    this.adc=new AVRADC(this.cpu,{...adcConfig,numChannels:16,adcInterrupt:58,muxInputMask:0x3f,muxChannels,adcReferences:[ADCReference.AREF,ADCReference.AVCC,ADCReference.Internal1V1,ADCReference.Internal2V56]});
    this.serials=[0xc0,0xc8,0xd0,0x130].map((base,i)=>{
      const v=[25,36,51,54][i];const uart=new AVRUSART(this.cpu,{...usart0Config,UCSRA:base,UCSRB:base+1,UCSRC:base+2,UBRRL:base+4,UBRRH:base+5,UDR:base+6,rxCompleteInterrupt:v*2,dataRegisterEmptyInterrupt:(v+1)*2,txCompleteInterrupt:(v+2)*2},FREQUENCY);
      uart.onByteTransmit=value=>serial(i,String.fromCharCode(value));return uart;
    });
    this.syncInputs();this.syncOutputs();
  }
  state(id){const p=PINS[id];return this.ports[p.port].pinState(p.bit);}
  syncInputs(){
    for(const pin of PINS){const state=this.state(pin.id);const voltage=this.read(pin);
      if(state===PinState.Input||state===PinState.InputPullUp)this.ports[pin.port].setPin(pin.bit,voltage===undefined?state===PinState.InputPullUp:voltage>=2.5);
      if(pin.id>=54)this.adc.channelValues[pin.id-54]=Math.max(0,Math.min(5,voltage??0));
    }
  }
  syncOutputs(){
    for(const pin of PINS){const s=this.state(pin.id),value=s===PinState.High?5:s===PinState.Low?0:null;
      if(this.lastOutputs.get(pin.id)!==value){this.lastOutputs.set(pin.id,value);this.write(pin,value);}
    }
  }
  advance(cycles){
    this.syncInputs();const end=this.cpu.cycles+cycles;
    while(this.cpu.cycles<end){if(this.cpu.pc>=this.cpu.progMem.length)throw Error('Programa saiu da memória. Confirme que o HEX é do Mega 2560.');avrInstruction(this.cpu);this.cpu.tick();}
    this.syncOutputs();
  }
  sample(id){const p=PINS[id],state=this.state(id);return {state,output:state<2,high:state===1,voltage:state<2?(state===1?5:0):(this.read(p)??(state===3?5:0))};}
}

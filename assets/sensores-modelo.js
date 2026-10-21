/* Modelo didático idealizado, independente da interface. Alcances em mm ilustrativos. */
(() => {
  const materials = {
    aco: {label:'Aço', metal:true, inductive:8, capacitive:12, color:'#afbdca'},
    aluminio: {label:'Alumínio', metal:true, inductive:4, capacitive:12, color:'#cbd8e1'},
    plastico: {label:'Plástico', metal:false, inductive:0, capacitive:7, color:'#f5b76b'},
    madeira: {label:'Madeira', metal:false, inductive:0, capacitive:6, color:'#d2a176'},
    agua: {label:'Água', metal:false, inductive:0, capacitive:14, color:'#63cfe5'}
  };
  function calculate(state) {
    const material=materials[state.material];
    const range=state.kind==='indutivo'?material.inductive:material.capacitive*state.sensitivity/100;
    const detected=range>0 && state.distance<=range;
    const conducting=state.contact==='NA'?detected:!detected;
    const loadOn=conducting;
    const voltage=conducting?(state.outputType==='PNP'?24:0):(state.outputType==='PNP'?0:24);
    return {range,detected,conducting,loadOn,voltage};
  }
  window.SensorModel={materials,calculate};
})();

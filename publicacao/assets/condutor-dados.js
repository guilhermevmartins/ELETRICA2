/* Recorte de dados de cobre: NBR 5410:2004, tabelas 36/37, 40 e 42.
 * Conferido no Guia Prysmian, revisão 10, pp. 9, 10, 14 e 15.
 * https://br.prysmian.com/sites/br.prysmian.com/files/media/documents/Guia_de_Dimensionamento-Baixa_Tensao_Rev10.pdf
 * Cada linha: A1(2,3), B1(2,3), B2(2,3), C(2,3) condutores carregados.
 * Dados de referência ao ar a 30°C; não extrapolar para solo ou outros arranjos.
 */
'use strict';
window.CABLE_DATA={
sections:[1.5,2.5,4,6,10,16,25,35],
pvc:[
[14.5,13.5,17.5,15.5,16.5,15,19.5,17.5],
[19.5,18,24,21,23,20,27,24],
[26,24,32,28,30,27,36,32],
[34,31,41,36,38,34,46,41],
[46,42,57,50,52,46,63,57],
[61,56,76,68,69,62,85,76],
[80,73,101,89,90,80,112,96],
[99,89,125,110,111,99,138,119]],
xlpe:[
[19,17,23,20,22,19.5,24,22],
[26,23,31,28,30,26,33,30],
[35,31,42,37,40,35,45,40],
[45,40,54,48,51,44,58,52],
[61,54,75,66,69,60,80,71],
[81,73,100,88,91,80,107,96],
[106,95,133,117,119,105,138,119],
[131,117,164,144,146,128,171,147]],
ambient:[20,25,30,35,40,45,50,55,60],
temperature:{pvc:[1.12,1.06,1,.94,.87,.79,.71,.61,.5],xlpe:[1.08,1.04,1,.96,.91,.87,.82,.76,.71]},
group:{bunch:[1,.8,.7,.65,.6,.57],layer:[1,.85,.79,.75,.73,.72]},
methods:{
a1:{code:'A1',column:0,label:'Eletroduto em parede termicamente isolante',description:'Condutores isolados ou cabos unipolares em eletroduto na parede termicamente isolante. A dissipação de calor é mais restrita.'},
b1:{code:'B1',column:2,label:'Eletroduto embutido em alvenaria',description:'Condutores isolados ou cabos unipolares em eletroduto embutido em alvenaria. Não confundir alvenaria com parede termicamente isolante.'},
b1a:{code:'B1',column:2,label:'Eletroduto aparente sobre parede',description:'Condutores isolados ou cabos unipolares em eletroduto aparente. Neste recorte, usa a mesma coluna B1 da alvenaria.'},
b2:{code:'B2',column:4,label:'Cabo multipolar em eletroduto',description:'Cabo multipolar em eletroduto aparente ou embutido em alvenaria. Suas veias compartilham a cobertura do cabo.'},
c:{code:'C',column:6,label:'Cabos fixados diretamente sobre parede',description:'Cabos unipolares ou multipolares sobre parede, sem eletroduto. Aqui o grupo pode estar em feixe ou em camada única sobre a parede; não representa cabos espaçados ao ar livre.'}
}};

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'publicacao');
fs.mkdirSync(out, {recursive:true});
for (const name of ['index.html', 'assets', 'simuladores', '00_Definicao_Tipos_Aterramento.pptx']) {
  fs.cpSync(path.join(root,name), path.join(out,name), {recursive:true});
}
for (const name of fs.readdirSync(root)) {
  if (/\.(png|jpe?g|webp)$/i.test(name)) fs.copyFileSync(path.join(root,name),path.join(out,name));
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
const missing=[];
function check(base, ref) {
  if (!ref || /^(?:[a-z]+:|#|\/\/)/i.test(ref)) return;
  const clean=decodeURIComponent(ref.split(/[?#]/)[0]);
  if (clean && !fs.existsSync(path.resolve(base,clean))) missing.push(ref);
}
for(const file of ['index.html', ...fs.readdirSync(path.join(out,'simuladores')).map(n=>'simuladores/'+n)]) {
  const html=fs.readFileSync(path.join(out,file),'utf8');
  for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) check(path.dirname(path.join(out,file)),m[1]);
}
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(out,'assets/catalogo.js'),'utf8'),context);
for(const mod of context.window.LAB_MODULES) {check(out,mod.file);check(out,mod.image);}
if(missing.length) throw new Error('Referências ausentes: '+missing.join(', '));
console.log(JSON.stringify({directory:out,modules:context.window.LAB_MODULES.length,missingReferences:missing},null,2));

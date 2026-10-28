// Mantém as junções utilizadas e remove os pontos que ficaram sem fios.
export function removeSelection(project, id) {
 if(project.drawings)project.drawings=project.drawings.filter(d=>d.id!==id);
 project.components=project.components.filter(c=>c.id!==id);
 project.wires=project.wires.filter(w=>w.id!==id&&w.from.id!==id&&w.to.id!==id);
 const connected=new Set(project.wires.flatMap(w=>[w.from.id,w.to.id]));
 project.components=project.components.filter(c=>c.type!=='junction'||connected.has(c.id));
}

// Día 1 · Tema 2 — Hoisting y scope
// Ejecutar: node 02-hoisting-scope.js

// 1) Función declarada: se "eleva" completa, puede llamarse antes de su declaración.
console.log('Función declarada:', crearTarea('Revisar entregas'));

function crearTarea(titulo) {
  return { titulo, completada: false };
}

// 2) const + función flecha: existe pero está en la zona muerta temporal (TDZ).
try {
  console.log(crearTareaFlecha('Revisar entregas'));
} catch (error) {
  console.log(`Función flecha antes de declarar -> ${error.name}: ${error.message}`);
}
const crearTareaFlecha = (titulo) => ({ titulo, completada: false });

// 3) var vs let al generar IDs dentro de setTimeout.
//    var tiene scope de función: las tres callbacks comparten la misma i.
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`var -> ID generado: T-${i}`), 0);
}

//    let tiene scope de bloque: cada iteración tiene su propia j.
for (let j = 1; j <= 3; j++) {
  setTimeout(() => console.log(`let -> ID generado: T-${j}`), 0);
}

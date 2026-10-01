// Día 2 · Tema 3 — Desestructuración, spread y rest
// Ejecutar: node 03-desestructuracion-spread-rest.js

// Desestructuración de parámetro con valor por defecto.
function resumen({ titulo, prioridad = 'media' }) {
  return `${titulo} (${prioridad})`;
}
console.log(resumen({ titulo: 'Corregir tareas' }));
console.log(resumen({ titulo: 'Subir calificaciones', prioridad: 'alta' }));

// Spread de objetos: actualización inmutable.
const original = { id: 'T-1', titulo: 'Planear sesión', completada: false };
const actualizada = { ...original, completada: true };
console.log('original:', original);
console.log('actualizada:', actualizada);

// Rest: recoge los argumentos restantes en un arreglo.
function agregarEtiquetas(tarea, ...etiquetas) {
  return { ...tarea, etiquetas: [...(tarea.etiquetas ?? []), ...etiquetas] };
}
console.log(agregarEtiquetas(original, 'clase', 'urgente'));

// Desestructuración de arreglos con rest.
const [primera, ...resto] = ['T-1', 'T-2', 'T-3'];
console.log('primera:', primera, '| resto:', resto);

// Copia superficial: el spread NO clona objetos anidados.
const tareas = [{ id: 'T-1', titulo: 'Original' }];
const copia = [...tareas];
copia[0].titulo = 'Modificada desde la copia';
console.log('El arreglo es otro:', copia !== tareas);
console.log('Pero el objeto es el mismo:', tareas[0].titulo);

// Copia profunda cuando hace falta (structuredClone).
const clon = structuredClone(tareas);
clon[0].titulo = 'Solo en el clon';
console.log('Tras structuredClone, el original sigue:', tareas[0].titulo);

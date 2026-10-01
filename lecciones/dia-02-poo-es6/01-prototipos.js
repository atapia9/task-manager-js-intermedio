// Día 2 · Tema 1 — Prototipos
// Ejecutar: node 01-prototipos.js

function Tarea(titulo) {
  this.titulo = titulo;
  this.completada = false;
}

// El método vive una sola vez en el prototipo y lo comparten todas las instancias.
Tarea.prototype.completar = function () {
  this.completada = true;
  return this;
};

const a = new Tarea('Escribir README');
const b = new Tarea('Revisar pruebas');
a.completar();

console.log('a:', a);
console.log('b:', b);
console.log('¿Prototipo de a es Tarea.prototype?', Object.getPrototypeOf(a) === Tarea.prototype);
console.log('¿Comparten el mismo método?', a.completar === b.completar);
console.log('¿"completar" es propiedad propia de a?', Object.hasOwn(a, 'completar'));
console.log('¿"titulo" es propiedad propia de a?', Object.hasOwn(a, 'titulo'));
console.log('Cadena: a -> Tarea.prototype -> Object.prototype ->',
  Object.getPrototypeOf(Object.getPrototypeOf(Tarea.prototype)));

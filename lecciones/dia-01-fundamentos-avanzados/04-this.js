// Día 1 · Tema 4 — this
// Ejecutar: node 04-this.js
// Los módulos ESM corren en modo estricto: un método suelto tiene this === undefined.

const gestor = {
  nombre: 'Gestor',
  tareas: [{ id: 1, completada: false }],
  completar(id) {
    const tarea = this.tareas.find((t) => t.id === id);
    tarea.completada = true;
    return `${this.nombre} completó la tarea ${id}`;
  },
};

console.log('Llamada normal:', gestor.completar(1));

// El problema: al pasar el método como callback se pierde el objeto.
function ejecutar(callback, id) {
  return callback(id);
}
try {
  ejecutar(gestor.completar, 1);
} catch (error) {
  console.log(`Método perdido -> ${error.name}: ${error.message}`);
}

// Corrección 1: bind fija this.
console.log('bind:', ejecutar(gestor.completar.bind(gestor), 1));

// Corrección 2: función flecha que conserva la llamada gestor.completar(...).
console.log('flecha:', ejecutar((id) => gestor.completar(id), 1));

// Corrección 3: método de clase con campo flecha (this queda fijo en la instancia).
class GestorClase {
  nombre = 'GestorClase';
  tareas = [{ id: 1, completada: false }];
  completar = (id) => {
    const tarea = this.tareas.find((t) => t.id === id);
    tarea.completada = true;
    return `${this.nombre} completó la tarea ${id}`;
  };
}
const gc = new GestorClase();
console.log('campo flecha:', ejecutar(gc.completar, 1));

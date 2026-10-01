// Día 2 · Tema 2 — Clases
// Ejecutar: node 02-clases.js

class Tarea {
  #completada = false; // campo privado: solo accesible dentro de la clase

  constructor(titulo) {
    this.titulo = titulo;
  }

  get completada() {
    return this.#completada;
  }

  completar() {
    this.#completada = true;
    return this;
  }

  // Método estático: pertenece a la clase, no a las instancias.
  static desdeJSON({ titulo, completada = false }) {
    const tarea = new Tarea(titulo);
    if (completada) tarea.completar();
    return tarea;
  }
}

class TareaConVencimiento extends Tarea {
  constructor(titulo, fechaLimite) {
    super(titulo);
    this.fechaLimite = new Date(fechaLimite);
  }

  estaVencida(ahora = new Date()) {
    return !this.completada && this.fechaLimite < ahora;
  }
}

console.log('typeof Tarea:', typeof Tarea); // "function": class es azúcar sobre funciones

const t = Tarea.desdeJSON({ titulo: 'Preparar demo', completada: true });
console.log('desdeJSON ->', t.titulo, '| completada:', t.completada);

// El campo privado no se puede leer ni escribir desde fuera.
try {
  t.completada = false; // el getter no tiene setter
} catch (error) {
  console.log(`Asignar sin setter -> ${error.name}`);
}
console.log('Sigue completada:', t.completada);

const v = new TareaConVencimiento('Entregar reporte', '2020-01-01');
console.log('¿instanceof Tarea?', v instanceof Tarea);
console.log('¿Vencida?', v.estaVencida());
v.completar();
console.log('¿Vencida tras completar?', v.estaVencida());

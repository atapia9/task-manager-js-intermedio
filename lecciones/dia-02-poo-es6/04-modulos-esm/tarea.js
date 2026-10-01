// Export nombrado y export por defecto.
export const PRIORIDADES = ['baja', 'media', 'alta'];

export function crearTarea(titulo, prioridad = 'media') {
  if (!PRIORIDADES.includes(prioridad)) {
    throw new RangeError(`Prioridad inválida: ${prioridad}`);
  }
  return { titulo, prioridad, completada: false };
}

export default class GestorTareas {
  #tareas = [];

  agregar(tarea) {
    this.#tareas.push(tarea);
    return this;
  }

  get todas() {
    return [...this.#tareas];
  }
}

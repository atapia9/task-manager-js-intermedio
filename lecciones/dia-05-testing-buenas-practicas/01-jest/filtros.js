// Funciones puras: mismo resultado para los mismos argumentos y sin mutar la entrada.
// Una tarea tiene la forma { id, titulo, prioridad, completada, fechaLimite? } con fechaLimite "AAAA-MM-DD".

export function porEstado(tareas, estado) {
  switch (estado) {
    case 'todas':
      return [...tareas];
    case 'pendientes':
      return tareas.filter((t) => !t.completada);
    case 'completadas':
      return tareas.filter((t) => t.completada);
    default:
      throw new RangeError(`Estado desconocido: ${estado}`);
  }
}

export function porPrioridad(tareas, prioridad) {
  return tareas.filter((t) => t.prioridad === prioridad);
}

// Orden ascendente por fecha límite; las tareas sin fecha van al final.
// Array.prototype.sort es estable, así que las fechas iguales conservan su orden original.
export function ordenarPorFecha(tareas) {
  return [...tareas].sort((a, b) => {
    if (!a.fechaLimite && !b.fechaLimite) return 0;
    if (!a.fechaLimite) return 1;
    if (!b.fechaLimite) return -1;
    return a.fechaLimite.localeCompare(b.fechaLimite);
  });
}

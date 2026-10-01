// Funciones puras de filtrado y ordenamiento: no mutan sus argumentos.
export const FILTROS = ['todas', 'pendientes', 'completadas'];

export function porEstado(tareas, estado) {
  switch (estado) {
    case 'todas':
      return [...tareas];
    case 'pendientes':
      return tareas.filter((t) => !t.completada);
    case 'completadas':
      return tareas.filter((t) => t.completada);
    default:
      throw new RangeError(`Filtro desconocido: ${estado}`);
  }
}

export function contarPendientes(tareas) {
  return tareas.filter((t) => !t.completada).length;
}

const PESO_PRIORIDAD = { alta: 0, media: 1, baja: 2 };

// Patrón Strategy: cada criterio es una función de comparación intercambiable.
export const estrategiasDeOrden = {
  manual: () => 0, // conserva el orden de creación
  fecha: (a, b) => {
    if (!a.fechaLimite && !b.fechaLimite) return 0;
    if (!a.fechaLimite) return 1; // sin fecha, al final
    if (!b.fechaLimite) return -1;
    return a.fechaLimite.localeCompare(b.fechaLimite);
  },
  prioridad: (a, b) => PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad],
};

export const CRITERIOS_ORDEN = Object.keys(estrategiasDeOrden);

export function ordenar(tareas, criterio) {
  const estrategia = estrategiasDeOrden[criterio];
  if (!estrategia) throw new RangeError(`Criterio de orden desconocido: ${criterio}`);
  return [...tareas].sort(estrategia); // sort es estable: los empates conservan su orden
}

// Lo que muestra la lista: filtra y luego ordena.
export function tareasVisibles({ tareas, filtro, orden }) {
  return ordenar(porEstado(tareas, filtro), orden);
}

// Patrón Strategy: cada criterio de orden es una estrategia intercambiable por nombre.
const PESO_PRIORIDAD = { alta: 0, media: 1, baja: 2 };

export const estrategiasDeOrden = {
  titulo: (a, b) => a.titulo.localeCompare(b.titulo),
  prioridad: (a, b) => PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad],
  fecha: (a, b) => (a.fechaLimite ?? '9999-12-31').localeCompare(b.fechaLimite ?? '9999-12-31'),
};

export function ordenar(tareas, criterio) {
  const estrategia = estrategiasDeOrden[criterio];
  if (!estrategia) throw new RangeError(`Criterio de orden desconocido: ${criterio}`);
  return [...tareas].sort(estrategia);
}

import { crearTarea, crearGeneradorIds, numeroDeId } from '../modelo/Tarea.js';
import { FILTROS, CRITERIOS_ORDEN } from '../modelo/filtros.js';

// Patrón Observer: la vista y el guardado se suscriben y reciben el estado en cada cambio.
// El estado es inmutable: cada acción crea un objeto nuevo.
export function crearStore({ tareas = [], filtro = 'todas', orden = 'manual' } = {}) {
  let estado = { tareas: [...tareas], filtro, orden };
  const suscriptores = new Set();
  const generarId = crearGeneradorIds('T', Math.max(0, ...tareas.map((t) => numeroDeId(t.id))));

  function actualizar(cambios) {
    estado = { ...estado, ...cambios };
    for (const suscriptor of [...suscriptores]) suscriptor(estado);
  }

  const reemplazar = (id, transformar) => estado.tareas.map((t) => (t.id === id ? transformar(t) : t));
  const existe = (id) => estado.tareas.some((t) => t.id === id);

  return {
    obtenerEstado: () => estado,

    // Devuelve la función para cancelar la suscripción.
    suscribir(funcion) {
      suscriptores.add(funcion);
      return () => suscriptores.delete(funcion);
    },

    agregar({ titulo, prioridad, fechaLimite }) {
      const tarea = crearTarea({ id: generarId(), titulo, prioridad, fechaLimite });
      actualizar({ tareas: [...estado.tareas, tarea] });
    },

    alternar(id) {
      if (!existe(id)) return;
      actualizar({ tareas: reemplazar(id, (t) => t.conCambios({ completada: !t.completada })) });
    },

    editarTitulo(id, titulo) {
      if (!existe(id)) return;
      // conCambios valida el título y lanza TypeError si está vacío.
      actualizar({ tareas: reemplazar(id, (t) => t.conCambios({ titulo })) });
    },

    eliminar(id) {
      if (!existe(id)) return;
      actualizar({ tareas: estado.tareas.filter((t) => t.id !== id) });
    },

    limpiarCompletadas() {
      if (!estado.tareas.some((t) => t.completada)) return;
      actualizar({ tareas: estado.tareas.filter((t) => !t.completada) });
    },

    establecerFiltro(nuevo) {
      if (!FILTROS.includes(nuevo)) throw new RangeError(`Filtro desconocido: ${nuevo}`);
      actualizar({ filtro: nuevo });
    },

    establecerOrden(nuevo) {
      if (!CRITERIOS_ORDEN.includes(nuevo)) throw new RangeError(`Criterio de orden desconocido: ${nuevo}`);
      actualizar({ orden: nuevo });
    },
  };
}

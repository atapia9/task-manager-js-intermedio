// Carga de las tareas iniciales con fetch + async/await, con arreglo de respaldo.

// La ruta se resuelve respecto a este módulo, así funciona igual en localhost
// y en GitHub Pages (que publica bajo /<repositorio>/).
const URL_TAREAS_INICIALES = new URL('../../data/tareas-iniciales.json', import.meta.url);

export const TAREAS_RESPALDO = [
  { id: 'T-1', titulo: 'Crear tu primera tarea', prioridad: 'media', completada: false },
  { id: 'T-2', titulo: 'Marcar una tarea como completada', prioridad: 'baja', completada: true },
];

export async function cargarTareasIniciales({
  url = URL_TAREAS_INICIALES,
  limiteMs = 3000,
  fetchFn = globalThis.fetch,
} = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), limiteMs);

  try {
    const respuesta = await fetchFn(url, { signal: controlador.signal });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) throw new Error('El archivo no contiene una lista de tareas');
    return datos;
  } finally {
    clearTimeout(temporizador);
  }
}

// Nunca rechaza: si la carga falla, devuelve el respaldo e indica el motivo.
export async function obtenerTareasIniciales(opciones) {
  try {
    return { datos: await cargarTareasIniciales(opciones), origen: 'archivo' };
  } catch (error) {
    return { datos: structuredClone(TAREAS_RESPALDO), origen: 'respaldo', motivo: error.message };
  }
}

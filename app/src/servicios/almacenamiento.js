import { tareasDesdeLista } from '../modelo/Tarea.js';

// Closure: la clave queda encapsulada y no se puede leer ni cambiar desde fuera.
// `obtenerStorage` permite inyectar un doble de prueba en lugar de localStorage.
export function crearAlmacenamiento(clave, obtenerStorage = () => globalThis.localStorage) {
  return {
    // Devuelve las tareas guardadas, o null si no hay datos válidos (primer arranque,
    // JSON dañado o almacenamiento no disponible).
    leer() {
      try {
        const crudo = obtenerStorage().getItem(clave);
        if (crudo === null) return null;
        const datos = JSON.parse(crudo);
        if (!Array.isArray(datos)) return null;
        return tareasDesdeLista(datos).tareas;
      } catch {
        return null;
      }
    },

    // Devuelve true si pudo guardar (puede fallar por cuota o almacenamiento bloqueado).
    guardar(tareas) {
      try {
        obtenerStorage().setItem(clave, JSON.stringify(tareas));
        return true;
      } catch {
        return false;
      }
    },

    limpiar() {
      try {
        obtenerStorage().removeItem(clave);
      } catch {
        // Sin almacenamiento no hay nada que limpiar.
      }
    },
  };
}

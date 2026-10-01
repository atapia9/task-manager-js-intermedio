// Patrón Módulo: una IIFE devuelve una API pública y mantiene el estado privado en un closure.
export const ModuloTareas = (() => {
  const tareas = []; // privado
  let siguienteId = 1;

  return {
    agregar(titulo) {
      const tarea = { id: `T-${siguienteId++}`, titulo, completada: false };
      tareas.push(tarea);
      return { ...tarea };
    },
    completar(id) {
      const tarea = tareas.find((t) => t.id === id);
      if (!tarea) throw new Error(`No existe la tarea ${id}`);
      tarea.completada = true;
    },
    listar() {
      return tareas.map((t) => ({ ...t })); // copias: el exterior no puede mutar el estado
    },
  };
})();

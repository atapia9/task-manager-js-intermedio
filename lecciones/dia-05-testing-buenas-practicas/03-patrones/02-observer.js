// Patrón Observer: el store notifica a sus suscriptores cada vez que cambia el estado.
export function crearStore(tareasIniciales = []) {
  let tareas = [...tareasIniciales];
  const suscriptores = new Set();

  function notificar() {
    for (const suscriptor of suscriptores) suscriptor(tareas);
  }

  return {
    obtener: () => tareas,
    // Devuelve una función para cancelar la suscripción.
    suscribir(funcion) {
      suscriptores.add(funcion);
      return () => suscriptores.delete(funcion);
    },
    agregar(tarea) {
      tareas = [...tareas, tarea];
      notificar();
    },
    eliminar(id) {
      tareas = tareas.filter((t) => t.id !== id);
      notificar();
    },
  };
}

// Uso típico en el navegador: la vista se suscribe y se redibuja con cada cambio.
//   const store = crearStore();
//   store.suscribir((tareas) => pintarLista(tareas));

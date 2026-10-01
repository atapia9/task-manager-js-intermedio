// Día 3 · Tema 1 — Callbacks
// Ejecutar: node 01-callbacks.js

// Convención de Node: el callback recibe (error, datos). Si hay error, datos no se usa.
function cargarTareas(callback) {
  setTimeout(() => {
    callback(null, [
      { id: 'T-1', titulo: 'Preparar clase', usuarioId: 7, etiquetaIds: [1, 2] },
      { id: 'T-2', titulo: 'Corregir ejercicios', usuarioId: 7, etiquetaIds: [2] },
    ]);
  }, 100);
}

function cargarUsuario(usuarioId, callback) {
  setTimeout(() => {
    if (usuarioId !== 7) return callback(new Error(`Usuario ${usuarioId} no existe`));
    callback(null, { id: 7, nombre: 'Ana' });
  }, 100);
}

function cargarEtiquetas(ids, callback) {
  setTimeout(() => {
    const catalogo = { 1: 'clase', 2: 'urgente' };
    callback(null, ids.map((id) => catalogo[id]));
  }, 100);
}

// Tres cargas encadenadas: cada paso depende del anterior y el código se anida
// hacia la derecha ("callback hell" o pirámide de la perdición).
cargarTareas((errTareas, tareas) => {
  if (errTareas) return console.error('Error al cargar tareas:', errTareas.message);

  cargarUsuario(tareas[0].usuarioId, (errUsuario, usuario) => {
    if (errUsuario) return console.error('Error al cargar usuario:', errUsuario.message);

    cargarEtiquetas(tareas[0].etiquetaIds, (errEtiquetas, etiquetas) => {
      if (errEtiquetas) return console.error('Error al cargar etiquetas:', errEtiquetas.message);

      console.log(`Tarea "${tareas[0].titulo}" de ${usuario.nombre}, etiquetas: ${etiquetas.join(', ')}`);
    });
  });
});

// Caso de error: el manejo se repite en cada nivel.
cargarUsuario(99, (error, usuario) => {
  if (error) return console.error('Error esperado:', error.message);
  console.log(usuario);
});

// Día 3 · Tema 2 — Promesas
// Ejecutar: node 02-promesas.js

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Las mismas cargas del ejemplo anterior, ahora devuelven promesas.
function cargarTareas() {
  return esperar(100).then(() => [
    { id: 'T-1', titulo: 'Preparar clase', usuarioId: 7, etiquetaIds: [1, 2] },
  ]);
}

function cargarUsuario(usuarioId) {
  return esperar(100).then(() => {
    if (usuarioId !== 7) throw new Error(`Usuario ${usuarioId} no existe`);
    return { id: 7, nombre: 'Ana' };
  });
}

function cargarEtiquetas(ids) {
  const catalogo = { 1: 'clase', 2: 'urgente' };
  return esperar(100).then(() => ids.map((id) => catalogo[id]));
}

function cargarEtiquetasFallida() {
  return esperar(50).then(() => {
    throw new Error('Servicio de etiquetas caído');
  });
}

// 1) Encadenamiento plano y un único catch.
cargarTareas()
  .then((tareas) => cargarUsuario(tareas[0].usuarioId))
  .then((usuario) => console.log('Encadenado -> usuario:', usuario.nombre))
  .catch((error) => console.error('Error:', error.message))
  .finally(() => console.log('Fin de la cadena'))
  // 2) Siguiente demostración, tras terminar la cadena.
  .then(async () => {
    // Promise.all: en paralelo; falla si UNA falla.
    const [tareas, etiquetas] = await Promise.all([cargarTareas(), cargarEtiquetas([1, 2])]);
    console.log('all ->', tareas.length, 'tarea(s),', etiquetas.join(', '));

    try {
      await Promise.all([cargarTareas(), cargarEtiquetasFallida()]);
    } catch (error) {
      console.log('all con fallo ->', error.message);
    }

    // Promise.allSettled: espera a todas y reporta el estado de cada una.
    const resultados = await Promise.allSettled([cargarTareas(), cargarEtiquetasFallida()]);
    for (const r of resultados) {
      console.log('allSettled ->', r.status, r.status === 'fulfilled' ? '' : r.reason.message);
    }

    // Promise.race: la primera en terminar gana; sirve para un tiempo límite.
    const conLimite = (promesa, ms) =>
      Promise.race([
        promesa,
        esperar(ms).then(() => {
          throw new Error(`Tiempo límite de ${ms} ms excedido`);
        }),
      ]);

    try {
      await conLimite(cargarEtiquetas([1]), 30); // tarda 100 ms, el límite es 30 ms
    } catch (error) {
      console.log('race ->', error.message);
    }
  });

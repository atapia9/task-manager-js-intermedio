// Día 1 · Tema 1 — Call stack y event loop
// Simula "guardar tarea" mezclando código síncrono, microtareas y macrotareas.
// Ejecutar: node 01-call-stack-event-loop.js

function guardarTarea(titulo) {
  console.log(`1. [síncrono] Inicia guardarTarea("${titulo}")`);

  // Macrotarea: se encola en la cola de temporizadores.
  setTimeout(() => {
    console.log('5. [macrotarea] setTimeout(…, 0): aviso "Tarea guardada"');
  }, 0);

  // Microtarea: se encola en la cola de microtareas.
  Promise.resolve().then(() => {
    console.log('3. [microtarea] Promise.then: validación terminada');
  });

  // Otra microtarea, encolada después de la anterior.
  queueMicrotask(() => {
    console.log('4. [microtarea] queueMicrotask: registro en historial');
  });

  console.log('2. [síncrono] Termina guardarTarea (la pila queda vacía)');
}

console.log('0. [síncrono] Inicio del programa');
guardarTarea('Preparar clase de JavaScript');
console.log('2b. [síncrono] Fin del script principal');

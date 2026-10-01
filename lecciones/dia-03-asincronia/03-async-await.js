// Día 3 · Tema 3 — async/await
// Ejecutar: node 03-async-await.js
// performance.now() es global en Node (también en navegadores).

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const cargarTareas = async () => { await esperar(100); return [{ id: 'T-1', titulo: 'Preparar clase' }]; };
const cargarUsuario = async () => { await esperar(100); return { nombre: 'Ana' }; };
const cargarEtiquetas = async () => { await esperar(100); return ['clase', 'urgente']; };
const cargarFallida = async () => { await esperar(50); throw new Error('Servicio caído'); };

// try/catch/finally se comporta como con código síncrono.
async function cargarConManejoDeErrores() {
  try {
    const datos = await cargarFallida();
    console.log(datos);
  } catch (error) {
    console.log('catch ->', error.message);
  } finally {
    console.log('finally -> siempre se ejecuta (p. ej. ocultar el indicador de carga)');
  }
}

// Secuencial: cada await espera al anterior (suma de tiempos).
async function secuencial() {
  const tareas = await cargarTareas();
  const usuario = await cargarUsuario();
  const etiquetas = await cargarEtiquetas();
  return { tareas, usuario, etiquetas };
}

// Paralelo: las tres se inician a la vez (tiempo de la más lenta).
async function paralelo() {
  const [tareas, usuario, etiquetas] = await Promise.all([
    cargarTareas(),
    cargarUsuario(),
    cargarEtiquetas(),
  ]);
  return { tareas, usuario, etiquetas };
}

async function medir(nombre, funcion) {
  const inicio = performance.now();
  await funcion();
  const ms = Math.round(performance.now() - inicio);
  console.log(`${nombre}: ~${ms} ms`);
}

await cargarConManejoDeErrores();
await medir('Secuencial', secuencial); // ≈ 300 ms
await medir('Paralelo  ', paralelo);   // ≈ 100 ms

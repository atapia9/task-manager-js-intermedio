// Día 4 · Tema 2 — Web Storage
// localStorage persiste entre sesiones; sessionStorage vive mientras dure la pestaña.
// El evento "storage" avisa a las OTRAS pestañas del mismo origen cuando cambia localStorage.
import { TAREAS_BASE } from './datos.js';

const CLAVE = 'dia04-tareas';
const salidaLocal = document.querySelector('#salida-local');
const salidaSesion = document.querySelector('#salida-sesion');
const registro = document.querySelector('#registro-storage');

function leer(almacen) {
  try {
    const crudo = almacen.getItem(CLAVE);
    return crudo === null ? [] : JSON.parse(crudo);
  } catch (error) {
    // JSON dañado o almacenamiento bloqueado (modo privado, política del navegador).
    registro.prepend(item(`No se pudo leer: ${error.name}`));
    return [];
  }
}

function guardar(almacen, tareas) {
  try {
    almacen.setItem(CLAVE, JSON.stringify(tareas));
  } catch (error) {
    // Cuota excedida o almacenamiento no disponible.
    registro.prepend(item(`No se pudo guardar: ${error.name}`));
  }
}

function item(texto) {
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString()} — ${texto}`;
  return li;
}

function pintar() {
  salidaLocal.textContent = JSON.stringify(leer(localStorage), null, 2);
  salidaSesion.textContent = JSON.stringify(leer(sessionStorage), null, 2);
}

function agregarEn(almacen) {
  const tareas = leer(almacen);
  const base = TAREAS_BASE[tareas.length % TAREAS_BASE.length];
  guardar(almacen, [...tareas, { ...base, id: `T-${tareas.length + 1}` }]);
  pintar();
}

document.querySelector('#storage-controles').addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-storage]');
  if (!boton) return;
  const accion = boton.dataset.storage;
  if (accion === 'agregar-local') agregarEn(localStorage);
  if (accion === 'agregar-sesion') agregarEn(sessionStorage);
  if (accion === 'limpiar') {
    localStorage.removeItem(CLAVE);
    sessionStorage.removeItem(CLAVE);
    pintar();
  }
});

// Solo se dispara en otras pestañas/ventanas del mismo origen, no en la que hizo el cambio.
window.addEventListener('storage', (evento) => {
  if (evento.storageArea !== localStorage || evento.key !== CLAVE) return;
  registro.prepend(item('Evento "storage": otra pestaña modificó las tareas'));
  pintar();
});

pintar();

// Día 4 · Tema 1 — Delegación de eventos
// Un único listener en el <ul> atiende a todos los botones, incluso a los que
// se agreguen después de registrar el listener.
import { TAREAS_BASE } from './datos.js';

const lista = document.querySelector('#lista-delegacion');
const botonAgregar = document.querySelector('#agregar-delegacion');
const mensaje = document.querySelector('#mensaje-delegacion');
let tareas = structuredClone(TAREAS_BASE);
let siguiente = tareas.length + 1;

function crearBoton(texto, accion) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = texto;
  boton.dataset.accion = accion;
  return boton;
}

function pintar() {
  const items = tareas.map((tarea) => {
    const li = document.createElement('li');
    li.dataset.id = tarea.id;
    if (tarea.completada) li.classList.add('completada');
    const titulo = document.createElement('span');
    titulo.textContent = tarea.titulo;
    li.append(titulo, ' ', crearBoton(tarea.completada ? 'Reabrir' : 'Completar', 'completar'), ' ', crearBoton('Eliminar', 'eliminar'));
    return li;
  });
  lista.replaceChildren(...items);
}

// El único listener. event.target puede ser el botón o un nodo interno de él;
// closest() sube hasta el elemento con data-accion.
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton || !lista.contains(boton)) return;

  const id = boton.closest('li').dataset.id;
  if (boton.dataset.accion === 'completar') {
    tareas = tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t));
    mensaje.textContent = `Acción "completar" sobre ${id}`;
  } else if (boton.dataset.accion === 'eliminar') {
    tareas = tareas.filter((t) => t.id !== id);
    mensaje.textContent = `Acción "eliminar" sobre ${id}`;
  }
  pintar();
});

botonAgregar.addEventListener('click', () => {
  tareas = [...tareas, { id: `T-${siguiente}`, titulo: `Tarea nueva ${siguiente}`, completada: false }];
  siguiente += 1;
  mensaje.textContent = 'Tarea agregada: sus botones funcionan sin registrar listeners nuevos';
  pintar();
});

pintar();

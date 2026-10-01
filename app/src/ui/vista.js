import { tareasVisibles, contarPendientes } from '../modelo/filtros.js';

// Todo texto del usuario se pinta con textContent o createElement: nunca con innerHTML.
function crear(documento, etiqueta, { clase, texto, atributos = {}, datos = {} } = {}) {
  const elemento = documento.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
  for (const [nombre, valor] of Object.entries(datos)) elemento.dataset[nombre] = valor;
  return elemento;
}

function formatearFecha(fechaISO) {
  // Se fuerza la hora local para que "2026-03-10" no retroceda un día por la zona horaria.
  return new Date(`${fechaISO}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function montarVista(store, documento = document) {
  const q = (selector) => documento.querySelector(selector);
  const el = {
    aviso: q('#aviso'),
    formulario: q('#formulario-tarea'),
    errorFormulario: q('#error-formulario'),
    errorLista: q('#error-lista'),
    filtros: q('#filtros'),
    orden: q('#orden'),
    lista: q('#lista-tareas'),
    vacio: q('#estado-vacio'),
    contador: q('#contador'),
    limpiar: q('#limpiar-completadas'),
  };

  let editandoId = null; // estado de interfaz: qué tarea se está editando
  let enfocarEdicion = false;

  function crearFila(tarea) {
    const clases = ['tarea', tarea.completada && 'completada', tarea.estaVencida() && 'vencida'].filter(Boolean);
    const fila = crear(documento, 'li', { clase: clases.join(' '), datos: { id: tarea.id } });

    if (editandoId === tarea.id) {
      const formulario = crear(documento, 'form', { clase: 'edicion', atributos: { novalidate: '' } });
      const etiqueta = crear(documento, 'label', { clase: 'solo-lectores', texto: 'Nuevo título', atributos: { for: `editar-${tarea.id}` } });
      const campo = crear(documento, 'input', { atributos: { id: `editar-${tarea.id}`, name: 'titulo', type: 'text', autocomplete: 'off' } });
      campo.value = tarea.titulo;
      // type="submit": al pulsar Enter en el campo, el navegador genera un clic sobre este botón,
      // y el listener delegado de la lista lo atiende.
      const guardar = crear(documento, 'button', { texto: 'Guardar', clase: 'primario', atributos: { type: 'submit' }, datos: { accion: 'guardar' } });
      const cancelar = crear(documento, 'button', { texto: 'Cancelar', atributos: { type: 'button' }, datos: { accion: 'cancelar' } });
      formulario.append(etiqueta, campo, guardar, cancelar);
      fila.append(formulario);
      return fila;
    }

    const casilla = crear(documento, 'input', {
      atributos: { type: 'checkbox', 'aria-label': `Completada: ${tarea.titulo}` },
      datos: { accion: 'completar' },
    });
    casilla.checked = tarea.completada;

    const meta = crear(documento, 'div', { clase: 'meta' });
    meta.append(crear(documento, 'span', { clase: `insignia ${tarea.prioridad}`, texto: tarea.prioridad }));
    if (tarea.fechaLimite) {
      const textoFecha = `${tarea.estaVencida() ? 'Venció' : 'Vence'}: ${formatearFecha(tarea.fechaLimite)}`;
      meta.append(crear(documento, 'span', { clase: 'fecha', texto: textoFecha }));
    }

    const acciones = crear(documento, 'div', { clase: 'acciones' });
    acciones.append(
      crear(documento, 'button', { texto: 'Editar', atributos: { type: 'button', 'aria-label': `Editar: ${tarea.titulo}` }, datos: { accion: 'editar' } }),
      crear(documento, 'button', { texto: 'Eliminar', clase: 'peligro', atributos: { type: 'button', 'aria-label': `Eliminar: ${tarea.titulo}` }, datos: { accion: 'eliminar' } }),
    );

    fila.append(casilla, crear(documento, 'span', { clase: 'titulo', texto: tarea.titulo }), meta, acciones);
    return fila;
  }

  const filaPorId = (id) => Array.from(el.lista.children).find((fila) => fila.dataset.id === id);

  function render(estado) {
    // Recuerda qué control tenía el foco para devolvérselo tras redibujar.
    const activo = documento.activeElement;
    const filaActiva = activo?.closest?.('li[data-id]');
    const foco = filaActiva && el.lista.contains(activo) ? { id: filaActiva.dataset.id, accion: activo.dataset.accion } : null;

    const visibles = tareasVisibles(estado);
    el.lista.replaceChildren(...visibles.map(crearFila));
    el.vacio.hidden = visibles.length > 0;

    const pendientes = contarPendientes(estado.tareas);
    el.contador.textContent = `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'}`;
    el.limpiar.disabled = !estado.tareas.some((t) => t.completada);

    el.orden.value = estado.orden;
    for (const radio of el.filtros.querySelectorAll('input[name="filtro"]')) radio.checked = radio.value === estado.filtro;

    if (enfocarEdicion && editandoId) {
      filaPorId(editandoId)?.querySelector('input[name="titulo"]')?.focus();
      enfocarEdicion = false;
    } else if (foco) {
      const objetivo = filaPorId(foco.id)?.querySelector(`[data-accion="${foco.accion}"]`);
      (objetivo ?? q('#titulo')).focus();
    }
  }

  // Único listener de la lista: delegación por data-accion.
  el.lista.addEventListener('click', (evento) => {
    const control = evento.target.closest('[data-accion]');
    if (!control || !el.lista.contains(control)) return;

    const fila = control.closest('li');
    const id = fila.dataset.id;
    el.errorLista.textContent = '';

    switch (control.dataset.accion) {
      case 'completar':
        store.alternar(id);
        break;
      case 'eliminar':
        store.eliminar(id);
        break;
      case 'editar':
        editandoId = id;
        enfocarEdicion = true;
        render(store.obtenerEstado());
        break;
      case 'cancelar':
        editandoId = null;
        render(store.obtenerEstado());
        break;
      case 'guardar': {
        evento.preventDefault(); // el botón es type="submit": evita enviar el formulario
        try {
          const campo = fila.querySelector('input[name="titulo"]');
          editandoId = null;
          store.editarTitulo(id, campo.value);
        } catch {
          editandoId = id;
          enfocarEdicion = true;
          el.errorLista.textContent = 'El título no puede estar vacío.';
          render(store.obtenerEstado());
        }
        break;
      }
    }
  });

  el.formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(el.formulario));
    try {
      store.agregar({
        titulo: datos.titulo,
        prioridad: datos.prioridad,
        fechaLimite: datos.fechaLimite || null,
      });
      el.errorFormulario.textContent = '';
      el.formulario.reset();
    } catch {
      el.errorFormulario.textContent = 'Escribe un título para la tarea.';
    }
    q('#titulo').focus();
  });

  el.filtros.addEventListener('change', (evento) => {
    if (evento.target.name === 'filtro') store.establecerFiltro(evento.target.value);
  });
  el.orden.addEventListener('change', () => store.establecerOrden(el.orden.value));
  el.limpiar.addEventListener('click', () => store.limpiarCompletadas());

  store.suscribir(render); // Observer: la vista se redibuja en cada cambio
  render(store.obtenerEstado());

  return {
    mostrarAviso(texto) {
      el.aviso.textContent = texto;
      el.aviso.hidden = false;
    },
  };
}

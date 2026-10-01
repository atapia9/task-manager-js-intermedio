import { describe, test, expect, jest } from '@jest/globals';
import { crearStore } from '../app/src/estado/store.js';
import { crearTarea } from '../app/src/modelo/Tarea.js';

const base = () => [
  crearTarea({ id: 'T-1', titulo: 'Uno' }),
  crearTarea({ id: 'T-2', titulo: 'Dos', completada: true }),
];

describe('store: Observer', () => {
  test('notifica a los suscriptores con el estado nuevo', () => {
    const store = crearStore();
    const suscriptor = jest.fn();
    store.suscribir(suscriptor);

    store.agregar({ titulo: 'Nueva', prioridad: 'alta' });

    expect(suscriptor).toHaveBeenCalledTimes(1);
    expect(suscriptor.mock.calls[0][0].tareas).toHaveLength(1);
    expect(suscriptor.mock.calls[0][0]).toBe(store.obtenerEstado());
  });

  test('notifica a todos y deja de notificar tras cancelar', () => {
    const store = crearStore(({ tareas: base() }));
    const a = jest.fn();
    const b = jest.fn();
    const cancelarA = store.suscribir(a);
    store.suscribir(b);

    store.alternar('T-1');
    cancelarA();
    store.alternar('T-1');

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(2);
  });

  test('acciones sobre un id inexistente no notifican', () => {
    const store = crearStore({ tareas: base() });
    const suscriptor = jest.fn();
    store.suscribir(suscriptor);
    store.alternar('T-99');
    store.eliminar('T-99');
    store.editarTitulo('T-99', 'X');
    expect(suscriptor).not.toHaveBeenCalled();
  });
});

describe('store: acciones', () => {
  test('agregar genera ids que continúan tras los existentes', () => {
    const store = crearStore({ tareas: base() });
    store.agregar({ titulo: 'Tres' });
    store.agregar({ titulo: 'Cuatro', fechaLimite: '2026-05-01' });
    expect(store.obtenerEstado().tareas.map((t) => t.id)).toEqual(['T-1', 'T-2', 'T-3', 'T-4']);
    expect(store.obtenerEstado().tareas[3].fechaLimite).toBe('2026-05-01');
  });

  test('agregar con título vacío lanza error y no cambia el estado', () => {
    const store = crearStore();
    const antes = store.obtenerEstado();
    expect(() => store.agregar({ titulo: '   ' })).toThrow(TypeError);
    expect(store.obtenerEstado()).toBe(antes);
  });

  test('alternar completa y reabre', () => {
    const store = crearStore({ tareas: base() });
    store.alternar('T-1');
    expect(store.obtenerEstado().tareas[0].completada).toBe(true);
    store.alternar('T-1');
    expect(store.obtenerEstado().tareas[0].completada).toBe(false);
  });

  test('editarTitulo cambia el título y valida', () => {
    const store = crearStore({ tareas: base() });
    store.editarTitulo('T-1', '  Renombrada ');
    expect(store.obtenerEstado().tareas[0].titulo).toBe('Renombrada');
    expect(() => store.editarTitulo('T-1', '')).toThrow(TypeError);
    expect(store.obtenerEstado().tareas[0].titulo).toBe('Renombrada');
  });

  test('eliminar quita la tarea', () => {
    const store = crearStore({ tareas: base() });
    store.eliminar('T-1');
    expect(store.obtenerEstado().tareas.map((t) => t.id)).toEqual(['T-2']);
  });

  test('limpiarCompletadas quita solo las completadas y no notifica si no hay', () => {
    const store = crearStore({ tareas: base() });
    const suscriptor = jest.fn();
    store.suscribir(suscriptor);
    store.limpiarCompletadas();
    expect(store.obtenerEstado().tareas.map((t) => t.id)).toEqual(['T-1']);
    store.limpiarCompletadas();
    expect(suscriptor).toHaveBeenCalledTimes(1);
  });

  test('establecerFiltro y establecerOrden validan su argumento', () => {
    const store = crearStore();
    store.establecerFiltro('pendientes');
    store.establecerOrden('fecha');
    expect(store.obtenerEstado()).toMatchObject({ filtro: 'pendientes', orden: 'fecha' });
    expect(() => store.establecerFiltro('x')).toThrow(RangeError);
    expect(() => store.establecerOrden('x')).toThrow(RangeError);
  });

  test('es inmutable: el estado anterior no cambia', () => {
    const store = crearStore({ tareas: base() });
    const anterior = store.obtenerEstado();
    store.alternar('T-1');
    expect(anterior.tareas[0].completada).toBe(false);
    expect(store.obtenerEstado()).not.toBe(anterior);
  });
});

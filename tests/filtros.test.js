import { describe, test, expect } from '@jest/globals';
import { crearTarea, tipoDeDatos } from '../app/src/modelo/Tarea.js';
import {
  porEstado, contarPendientes, ordenar, tareasVisibles, estrategiasDeOrden, CRITERIOS_ORDEN, FILTROS,
} from '../app/src/modelo/filtros.js';

const t = (id, extra = {}) => {
  const datos = { id, titulo: `Tarea ${id}`, ...extra };
  return crearTarea(tipoDeDatos(datos), datos);
};
const tareas = [
  t('T-1', { prioridad: 'baja', fechaLimite: '2026-03-01' }),
  t('T-2', { prioridad: 'alta', completada: true }),
  t('T-3', { prioridad: 'media', fechaLimite: '2026-01-01' }),
  t('T-4', { prioridad: 'alta', fechaLimite: '2026-01-01', completada: true }),
];
const ids = (lista) => lista.map((x) => x.id);

describe('porEstado', () => {
  test.each([
    ['todas', ['T-1', 'T-2', 'T-3', 'T-4']],
    ['pendientes', ['T-1', 'T-3']],
    ['completadas', ['T-2', 'T-4']],
  ])('%s', (estado, esperado) => {
    expect(ids(porEstado(tareas, estado))).toEqual(esperado);
  });

  test('"todas" devuelve una copia', () => {
    expect(porEstado(tareas, 'todas')).not.toBe(tareas);
  });

  test('estado desconocido lanza RangeError y lista vacía da vacía', () => {
    expect(() => porEstado(tareas, 'archivadas')).toThrow(RangeError);
    expect(porEstado([], 'pendientes')).toEqual([]);
  });

  test('FILTROS lista los tres estados', () => {
    expect(FILTROS).toEqual(['todas', 'pendientes', 'completadas']);
  });
});

describe('contarPendientes', () => {
  test('cuenta solo las no completadas', () => {
    expect(contarPendientes(tareas)).toBe(2);
  });
  test('lista vacía y todas completadas dan 0', () => {
    expect(contarPendientes([])).toBe(0);
    expect(contarPendientes([t('T-9', { completada: true })])).toBe(0);
  });
});

describe('ordenar (Strategy)', () => {
  test('manual conserva el orden', () => {
    expect(ids(ordenar(tareas, 'manual'))).toEqual(['T-1', 'T-2', 'T-3', 'T-4']);
  });

  test('prioridad: alta primero y empates en su orden original', () => {
    expect(ids(ordenar(tareas, 'prioridad'))).toEqual(['T-2', 'T-4', 'T-3', 'T-1']);
  });

  test('fecha: ascendente, sin fecha al final, empates estables', () => {
    expect(ids(ordenar(tareas, 'fecha'))).toEqual(['T-3', 'T-4', 'T-1', 'T-2']);
  });

  test('no muta el arreglo original', () => {
    const antes = ids(tareas);
    ordenar(tareas, 'fecha');
    expect(ids(tareas)).toEqual(antes);
  });

  test('criterio desconocido lanza RangeError y lista vacía da vacía', () => {
    expect(() => ordenar(tareas, 'color')).toThrow(RangeError);
    expect(ordenar([], 'fecha')).toEqual([]);
  });

  test('CRITERIOS_ORDEN coincide con las estrategias', () => {
    expect(CRITERIOS_ORDEN).toEqual(Object.keys(estrategiasDeOrden));
  });
});

describe('tareasVisibles', () => {
  test('filtra y luego ordena', () => {
    const visibles = tareasVisibles({ tareas, filtro: 'completadas', orden: 'fecha' });
    expect(ids(visibles)).toEqual(['T-4', 'T-2']);
  });
});

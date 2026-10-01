import { describe, test, expect } from '@jest/globals';
import { porEstado, porPrioridad, ordenarPorFecha } from './filtros.js';

const tareas = [
  { id: 'T-1', titulo: 'A', prioridad: 'alta', completada: false, fechaLimite: '2026-03-10' },
  { id: 'T-2', titulo: 'B', prioridad: 'media', completada: true, fechaLimite: '2026-01-05' },
  { id: 'T-3', titulo: 'C', prioridad: 'alta', completada: true },
];

describe('porEstado', () => {
  test('devuelve solo las pendientes', () => {
    expect(porEstado(tareas, 'pendientes').map((t) => t.id)).toEqual(['T-1']);
  });

  test('devuelve solo las completadas', () => {
    expect(porEstado(tareas, 'completadas').map((t) => t.id)).toEqual(['T-2', 'T-3']);
  });

  test('"todas" devuelve una copia, no el mismo arreglo', () => {
    const resultado = porEstado(tareas, 'todas');
    expect(resultado).toEqual(tareas);
    expect(resultado).not.toBe(tareas);
  });

  test('lista vacía devuelve lista vacía', () => {
    expect(porEstado([], 'pendientes')).toEqual([]);
  });

  test('un estado desconocido lanza RangeError', () => {
    expect(() => porEstado(tareas, 'archivadas')).toThrow(RangeError);
  });
});

describe('porPrioridad', () => {
  test.each([
    ['alta', ['T-1', 'T-3']],
    ['media', ['T-2']],
    ['baja', []],
  ])('prioridad "%s" devuelve %j', (prioridad, idsEsperados) => {
    expect(porPrioridad(tareas, prioridad).map((t) => t.id)).toEqual(idsEsperados);
  });

  test('lista vacía devuelve lista vacía', () => {
    expect(porPrioridad([], 'alta')).toEqual([]);
  });
});

describe('ordenarPorFecha', () => {
  test('ordena ascendente y deja las tareas sin fecha al final', () => {
    expect(ordenarPorFecha(tareas).map((t) => t.id)).toEqual(['T-2', 'T-1', 'T-3']);
  });

  test('no muta el arreglo original', () => {
    const copia = structuredClone(tareas);
    ordenarPorFecha(tareas);
    expect(tareas).toEqual(copia);
  });

  test('fechas iguales conservan el orden original (orden estable)', () => {
    const iguales = [
      { id: 'X', fechaLimite: '2026-05-01' },
      { id: 'Y', fechaLimite: '2026-05-01' },
      { id: 'Z', fechaLimite: '2026-05-01' },
    ];
    expect(ordenarPorFecha(iguales).map((t) => t.id)).toEqual(['X', 'Y', 'Z']);
  });

  test('lista vacía devuelve lista vacía', () => {
    expect(ordenarPorFecha([])).toEqual([]);
  });
});

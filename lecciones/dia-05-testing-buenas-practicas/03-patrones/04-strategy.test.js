import { describe, test, expect } from '@jest/globals';
import { ordenar, estrategiasDeOrden } from './04-strategy.js';

const tareas = [
  { id: 1, titulo: 'Beta', prioridad: 'baja', fechaLimite: '2026-02-01' },
  { id: 2, titulo: 'Alfa', prioridad: 'alta' },
  { id: 3, titulo: 'Gamma', prioridad: 'media', fechaLimite: '2026-01-01' },
];

describe('Patrón Strategy (orden)', () => {
  test.each([
    ['titulo', [2, 1, 3]],
    ['prioridad', [2, 3, 1]],
    ['fecha', [3, 1, 2]], // la tarea sin fecha va al final
  ])('ordena por %s', (criterio, idsEsperados) => {
    expect(ordenar(tareas, criterio).map((t) => t.id)).toEqual(idsEsperados);
  });

  test('no muta el arreglo original', () => {
    const antes = tareas.map((t) => t.id);
    ordenar(tareas, 'titulo');
    expect(tareas.map((t) => t.id)).toEqual(antes);
  });

  test('un criterio desconocido lanza RangeError', () => {
    expect(() => ordenar(tareas, 'color')).toThrow(RangeError);
  });

  test('agregar una estrategia no requiere cambiar ordenar()', () => {
    estrategiasDeOrden.id = (a, b) => b.id - a.id;
    expect(ordenar(tareas, 'id').map((t) => t.id)).toEqual([3, 2, 1]);
    delete estrategiasDeOrden.id;
  });
});

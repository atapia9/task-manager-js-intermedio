import { describe, test, expect } from '@jest/globals';
import { crearTarea, Tarea, TareaConVencimiento } from './03-factory.js';

describe('Patrón Factory', () => {
  test('"simple" devuelve una Tarea con prioridad por defecto', () => {
    const tarea = crearTarea('simple', { titulo: 'Leer' });
    expect(tarea).toBeInstanceOf(Tarea);
    expect(tarea).not.toBeInstanceOf(TareaConVencimiento);
    expect(tarea.prioridad).toBe('media');
  });

  test('"conVencimiento" devuelve TareaConVencimiento', () => {
    const tarea = crearTarea('conVencimiento', { titulo: 'Entregar', fechaLimite: '2026-01-01' });
    expect(tarea).toBeInstanceOf(TareaConVencimiento);
    expect(tarea).toBeInstanceOf(Tarea);
    expect(tarea.fechaLimite).toBe('2026-01-01');
  });

  test('estaVencida compara contra la fecha recibida', () => {
    const tarea = crearTarea('conVencimiento', { titulo: 'Entregar', fechaLimite: '2026-01-01' });
    expect(tarea.estaVencida(new Date('2026-02-01'))).toBe(true);
    expect(tarea.estaVencida(new Date('2025-12-01'))).toBe(false);
  });

  test('"conVencimiento" sin fechaLimite lanza error', () => {
    expect(() => crearTarea('conVencimiento', { titulo: 'X' })).toThrow('fechaLimite');
  });

  test('un tipo desconocido lanza RangeError', () => {
    expect(() => crearTarea('recurrente', { titulo: 'X' })).toThrow(RangeError);
  });
});

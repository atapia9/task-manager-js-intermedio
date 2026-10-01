import { describe, test, expect } from '@jest/globals';
import { ModuloTareas } from './01-modulo.js';

describe('Patrón Módulo', () => {
  test('el estado es privado: no hay acceso directo al arreglo', () => {
    expect(ModuloTareas.tareas).toBeUndefined();
  });

  test('agregar y completar modifican el estado interno', () => {
    const { id } = ModuloTareas.agregar('Escribir pruebas');
    ModuloTareas.completar(id);
    expect(ModuloTareas.listar()).toEqual([{ id, titulo: 'Escribir pruebas', completada: true }]);
  });

  test('mutar lo devuelto por listar() no afecta el estado', () => {
    ModuloTareas.listar()[0].titulo = 'Hackeado';
    expect(ModuloTareas.listar()[0].titulo).toBe('Escribir pruebas');
  });

  test('completar un id inexistente lanza error', () => {
    expect(() => ModuloTareas.completar('T-999')).toThrow('No existe la tarea T-999');
  });
});

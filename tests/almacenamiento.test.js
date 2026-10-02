import { describe, test, expect } from '@jest/globals';
import { crearAlmacenamiento } from '../app/src/servicios/almacenamiento.js';
import { crearTarea } from '../app/src/modelo/Tarea.js';

// Doble de prueba con la interfaz de Storage que usa el servicio.
function crearStorageFalso({ falla = false } = {}) {
  const datos = new Map();
  const revisar = () => { if (falla) throw new Error('Almacenamiento no disponible'); };
  return {
    datos,
    getItem: (clave) => { revisar(); return datos.has(clave) ? datos.get(clave) : null; },
    setItem: (clave, valor) => { revisar(); datos.set(clave, String(valor)); },
    removeItem: (clave) => { revisar(); datos.delete(clave); },
  };
}

const tareas = [
  crearTarea('simple', { id: 'T-1', titulo: 'Uno', prioridad: 'alta' }),
  crearTarea('conVencimiento', { id: 'T-2', titulo: 'Dos', completada: true, fechaLimite: '2026-02-01' }),
];

describe('almacenamiento', () => {
  test('guarda y lee las tareas con ida y vuelta', () => {
    const storage = crearStorageFalso();
    const almacen = crearAlmacenamiento('clave', () => storage);

    expect(almacen.guardar(tareas)).toBe(true);
    const leidas = almacen.leer();

    expect(leidas.map((t) => t.toJSON())).toEqual(tareas.map((t) => t.toJSON()));
    expect(leidas[1].fechaLimite).toBe('2026-02-01');
  });

  test('usa la clave encapsulada y no la expone', () => {
    const storage = crearStorageFalso();
    const almacen = crearAlmacenamiento('mi-clave', () => storage);
    almacen.guardar(tareas);
    expect([...storage.datos.keys()]).toEqual(['mi-clave']);
    expect(almacen.clave).toBeUndefined();
  });

  test('leer devuelve null cuando no hay datos (primer arranque)', () => {
    expect(crearAlmacenamiento('c', () => crearStorageFalso()).leer()).toBeNull();
  });

  test('una lista vacía guardada se distingue de "sin datos"', () => {
    const storage = crearStorageFalso();
    const almacen = crearAlmacenamiento('c', () => storage);
    almacen.guardar([]);
    expect(almacen.leer()).toEqual([]);
  });

  test.each([
    ['JSON dañado', '{ no es json'],
    ['no es una lista', '{"a":1}'],
  ])('leer devuelve null con %s', (_nombre, crudo) => {
    const storage = crearStorageFalso();
    storage.datos.set('c', crudo);
    expect(crearAlmacenamiento('c', () => storage).leer()).toBeNull();
  });

  test('descarta elementos inválidos pero conserva los válidos', () => {
    const storage = crearStorageFalso();
    storage.datos.set('c', JSON.stringify([{ id: 'T-1', titulo: 'Ok' }, { id: 'T-2', titulo: '' }]));
    expect(crearAlmacenamiento('c', () => storage).leer().map((t) => t.id)).toEqual(['T-1']);
  });

  test('si el almacenamiento falla, no lanza: leer da null y guardar da false', () => {
    const almacen = crearAlmacenamiento('c', () => crearStorageFalso({ falla: true }));
    expect(almacen.leer()).toBeNull();
    expect(almacen.guardar(tareas)).toBe(false);
    expect(() => almacen.limpiar()).not.toThrow();
  });

  test('si no existe storage (obtenerStorage devuelve undefined), tampoco lanza', () => {
    const almacen = crearAlmacenamiento('c', () => undefined);
    expect(almacen.leer()).toBeNull();
    expect(almacen.guardar(tareas)).toBe(false);
  });

  test('limpiar borra la clave', () => {
    const storage = crearStorageFalso();
    const almacen = crearAlmacenamiento('c', () => storage);
    almacen.guardar(tareas);
    almacen.limpiar();
    expect(almacen.leer()).toBeNull();
  });
});

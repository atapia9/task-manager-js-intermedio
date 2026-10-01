import { describe, test, expect, jest } from '@jest/globals';
import { crearStore } from './02-observer.js';

describe('Patrón Observer (store)', () => {
  test('notifica a los suscriptores con el estado nuevo', () => {
    const store = crearStore();
    const redibujar = jest.fn();
    store.suscribir(redibujar);

    store.agregar({ id: 'T-1', titulo: 'Probar observer' });

    expect(redibujar).toHaveBeenCalledTimes(1);
    expect(redibujar).toHaveBeenCalledWith([{ id: 'T-1', titulo: 'Probar observer' }]);
  });

  test('notifica a todos los suscriptores', () => {
    const store = crearStore();
    const a = jest.fn();
    const b = jest.fn();
    store.suscribir(a);
    store.suscribir(b);
    store.agregar({ id: 'T-1' });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  test('tras cancelar la suscripción ya no se notifica', () => {
    const store = crearStore([{ id: 'T-1' }]);
    const redibujar = jest.fn();
    const cancelar = store.suscribir(redibujar);

    cancelar();
    store.eliminar('T-1');

    expect(redibujar).not.toHaveBeenCalled();
    expect(store.obtener()).toEqual([]);
  });

  test('no muta el arreglo anterior al cambiar el estado', () => {
    const store = crearStore();
    const antes = store.obtener();
    store.agregar({ id: 'T-1' });
    expect(antes).toEqual([]);
  });
});

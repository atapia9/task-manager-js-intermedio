import { describe, test, expect, jest } from '@jest/globals';
import { cargarTareasIniciales, obtenerTareasIniciales, TAREAS_RESPALDO } from '../app/src/servicios/api.js';

const respuesta = (cuerpo, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => {
    if (cuerpo instanceof Error) throw cuerpo;
    return cuerpo;
  },
});

describe('cargarTareasIniciales', () => {
  test('devuelve la lista cuando la respuesta es correcta', async () => {
    const fetchFn = jest.fn().mockResolvedValue(respuesta([{ id: 'T-1', titulo: 'A' }]));
    await expect(cargarTareasIniciales({ fetchFn, url: 'x.json' })).resolves.toEqual([{ id: 'T-1', titulo: 'A' }]);
    expect(fetchFn).toHaveBeenCalledWith('x.json', expect.objectContaining({ signal: expect.anything() }));
  });

  test('rechaza si response.ok es false', async () => {
    const fetchFn = async () => respuesta(null, { ok: false, status: 404 });
    await expect(cargarTareasIniciales({ fetchFn })).rejects.toThrow('HTTP 404');
  });

  test('rechaza si el contenido no es una lista', async () => {
    const fetchFn = async () => respuesta({ no: 'lista' });
    await expect(cargarTareasIniciales({ fetchFn })).rejects.toThrow('lista de tareas');
  });

  test('rechaza si el JSON es inválido', async () => {
    const fetchFn = async () => respuesta(new SyntaxError('JSON inválido'));
    await expect(cargarTareasIniciales({ fetchFn })).rejects.toThrow(SyntaxError);
  });

  test('cancela la petición si tarda más que el límite', async () => {
    const fetchFn = (_url, { signal }) =>
      new Promise((_resolver, rechazar) => {
        signal.addEventListener('abort', () => rechazar(Object.assign(new Error('abortada'), { name: 'AbortError' })));
      });
    await expect(cargarTareasIniciales({ fetchFn, limiteMs: 10 })).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('obtenerTareasIniciales', () => {
  test('origen "archivo" cuando la carga funciona', async () => {
    const fetchFn = async () => respuesta([{ id: 'T-1', titulo: 'A' }]);
    expect(await obtenerTareasIniciales({ fetchFn })).toEqual({ datos: [{ id: 'T-1', titulo: 'A' }], origen: 'archivo' });
  });

  test('usa el respaldo (una copia) cuando falla, e indica el motivo', async () => {
    const fetchFn = async () => { throw new TypeError('Failed to fetch'); };
    const resultado = await obtenerTareasIniciales({ fetchFn });
    expect(resultado.origen).toBe('respaldo');
    expect(resultado.motivo).toBe('Failed to fetch');
    expect(resultado.datos).toEqual(TAREAS_RESPALDO);
    expect(resultado.datos).not.toBe(TAREAS_RESPALDO);
  });
});

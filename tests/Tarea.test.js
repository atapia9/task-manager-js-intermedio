import { describe, test, expect } from '@jest/globals';
import {
  Tarea, TareaConVencimiento, crearTarea, tareasDesdeLista,
  crearGeneradorIds, numeroDeId, esFechaISO, hoyISO, PRIORIDADES,
} from '../app/src/modelo/Tarea.js';

describe('esFechaISO', () => {
  test.each([
    ['2026-02-28', true],
    ['2024-02-29', true], // año bisiesto
    ['2026-02-30', false], // no existe
    ['2026-13-01', false],
    ['26-01-01', false],
    ['', false],
    [null, false],
    [20260101, false],
  ])('%j -> %s', (valor, esperado) => {
    expect(esFechaISO(valor)).toBe(esperado);
  });
});

describe('hoyISO', () => {
  test('da la fecha local con ceros a la izquierda', () => {
    expect(hoyISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('crearGeneradorIds / numeroDeId', () => {
  test('cada generador lleva su propio contador', () => {
    const a = crearGeneradorIds('T');
    const b = crearGeneradorIds('E');
    expect([a(), a(), b()]).toEqual(['T-1', 'T-2', 'E-1']);
  });

  test('puede continuar desde un número', () => {
    expect(crearGeneradorIds('T', 7)()).toBe('T-8');
  });

  test.each([
    ['T-12', 12],
    ['T-0', 0],
    ['X-3', 0],
    ['T-abc', 0],
    [undefined, 0],
  ])('numeroDeId(%j) = %i', (id, esperado) => {
    expect(numeroDeId(id)).toBe(esperado);
  });
});

describe('Tarea', () => {
  test('aplica valores por defecto y recorta el título', () => {
    const t = new Tarea({ id: 'T-1', titulo: '  Leer  ' });
    expect(t.titulo).toBe('Leer');
    expect(t.prioridad).toBe('media');
    expect(t.completada).toBe(false);
    expect(t.fechaLimite).toBeNull();
    expect(t.estaVencida()).toBe(false);
  });

  test('"completada" es de solo lectura (campo privado + getter)', () => {
    const t = new Tarea({ id: 'T-1', titulo: 'X' });
    expect(() => { t.completada = true; }).toThrow(TypeError);
    expect(t.completada).toBe(false);
  });

  test.each([
    [{ id: '', titulo: 'X' }, TypeError],
    [{ id: 'T-1', titulo: '   ' }, TypeError],
    [{ id: 'T-1', titulo: 5 }, TypeError],
    [{ id: 'T-1', titulo: 'X', prioridad: 'urgente' }, RangeError],
    [{ id: 'T-1', titulo: 'X', completada: 'si' }, TypeError],
  ])('datos inválidos %j lanzan error', (datos, tipoError) => {
    expect(() => new Tarea(datos)).toThrow(tipoError);
  });

  test('conCambios devuelve otra tarea y no muta la original', () => {
    const original = new Tarea({ id: 'T-1', titulo: 'A' });
    const cambiada = original.conCambios({ completada: true, titulo: 'B' });
    expect(cambiada).not.toBe(original);
    expect(original.completada).toBe(false);
    expect(original.titulo).toBe('A');
    expect(cambiada.completada).toBe(true);
    expect(cambiada.titulo).toBe('B');
  });

  test('toJSON / desdeJSON hacen ida y vuelta', () => {
    const t = new Tarea({ id: 'T-1', titulo: 'A', prioridad: 'alta', completada: true });
    const copia = Tarea.desdeJSON(JSON.parse(JSON.stringify(t)));
    expect(copia.toJSON()).toEqual(t.toJSON());
  });

  test('las prioridades válidas son baja, media y alta', () => {
    expect(PRIORIDADES).toEqual(['baja', 'media', 'alta']);
  });
});

describe('TareaConVencimiento', () => {
  const datos = { id: 'T-1', titulo: 'Entregar', fechaLimite: '2026-03-10' };

  test('hereda de Tarea y expone fechaLimite', () => {
    const t = new TareaConVencimiento(datos);
    expect(t).toBeInstanceOf(Tarea);
    expect(t.fechaLimite).toBe('2026-03-10');
  });

  test('estaVencida compara contra hoy (el día del vencimiento aún no vence)', () => {
    const t = new TareaConVencimiento(datos);
    expect(t.estaVencida(new Date(2026, 2, 9))).toBe(false);
    expect(t.estaVencida(new Date(2026, 2, 10, 23, 59))).toBe(false);
    expect(t.estaVencida(new Date(2026, 2, 11))).toBe(true);
  });

  test('una tarea completada nunca está vencida', () => {
    const t = new TareaConVencimiento({ ...datos, completada: true });
    expect(t.estaVencida(new Date(2030, 0, 1))).toBe(false);
  });

  test('rechaza fechas inválidas', () => {
    expect(() => new TareaConVencimiento({ ...datos, fechaLimite: '2026-02-30' })).toThrow(RangeError);
  });

  test('toJSON incluye la fecha y conCambios conserva la subclase', () => {
    const t = new TareaConVencimiento(datos);
    expect(t.toJSON().fechaLimite).toBe('2026-03-10');
    expect(t.conCambios({ completada: true })).toBeInstanceOf(TareaConVencimiento);
  });
});

describe('crearTarea (factory)', () => {
  test('sin fecha crea Tarea; con fecha, TareaConVencimiento', () => {
    expect(crearTarea({ id: 'T-1', titulo: 'A' })).not.toBeInstanceOf(TareaConVencimiento);
    expect(crearTarea({ id: 'T-1', titulo: 'A', fechaLimite: '2026-01-01' })).toBeInstanceOf(TareaConVencimiento);
  });

  test('fecha vacía o null cuenta como sin fecha', () => {
    expect(crearTarea({ id: 'T-1', titulo: 'A', fechaLimite: '' })).toBeInstanceOf(Tarea);
    expect(crearTarea({ id: 'T-1', titulo: 'A', fechaLimite: null }).fechaLimite).toBeNull();
  });

  test.each([[null], ['texto'], [42]])('rechaza %j', (valor) => {
    expect(() => crearTarea(valor)).toThrow(TypeError);
  });
});

describe('tareasDesdeLista', () => {
  test('descarta y cuenta los datos inválidos', () => {
    const { tareas, descartadas } = tareasDesdeLista([
      { id: 'T-1', titulo: 'Válida' },
      { id: 'T-2', titulo: '' },
      null,
      { id: 'T-3', titulo: 'Otra', prioridad: 'alta' },
    ]);
    expect(tareas.map((t) => t.id)).toEqual(['T-1', 'T-3']);
    expect(descartadas).toBe(2);
  });

  test('lista vacía', () => {
    expect(tareasDesdeLista([])).toEqual({ tareas: [], descartadas: 0 });
  });
});

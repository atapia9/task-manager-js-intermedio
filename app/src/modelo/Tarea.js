// Modelo de tarea. Las instancias se tratan como inmutables: los cambios devuelven una tarea nueva.
export const PRIORIDADES = ['baja', 'media', 'alta'];

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

// Acepta "AAAA-MM-DD" y rechaza fechas que no existen (por ejemplo 2026-02-30).
export function esFechaISO(valor) {
  if (typeof valor !== 'string' || !FECHA_ISO.test(valor)) return false;
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

// Fecha local de hoy como "AAAA-MM-DD" (comparable como texto con fechaLimite).
export function hoyISO(ahora = new Date()) {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Closure: el contador es privado y cada generador lleva el suyo (T-1, T-2, …).
export function crearGeneradorIds(prefijo = 'T', desde = 0) {
  let contador = desde;
  return () => `${prefijo}-${++contador}`;
}

// Extrae el número de un id como "T-12" (0 si no tiene ese formato).
export function numeroDeId(id, prefijo = 'T') {
  const coincidencia = new RegExp(`^${prefijo}-(\\d+)$`).exec(String(id));
  return coincidencia ? Number(coincidencia[1]) : 0;
}

export class Tarea {
  #completada;

  constructor({ id, titulo, prioridad = 'media', completada = false }) {
    if (typeof id !== 'string' || id === '') throw new TypeError('La tarea necesita un id de texto');
    if (typeof titulo !== 'string' || titulo.trim() === '') throw new TypeError('El título no puede estar vacío');
    if (!PRIORIDADES.includes(prioridad)) throw new RangeError(`Prioridad inválida: ${prioridad}`);
    if (typeof completada !== 'boolean') throw new TypeError('"completada" debe ser booleano');

    this.id = id;
    this.titulo = titulo.trim();
    this.prioridad = prioridad;
    this.#completada = completada;
  }

  get completada() {
    return this.#completada;
  }

  // Las tareas simples no tienen fecha límite ni vencen.
  get fechaLimite() {
    return null;
  }

  estaVencida() {
    return false;
  }

  // Devuelve una tarea nueva con los cambios aplicados (conserva la subclase).
  conCambios(cambios) {
    return crearTarea({ ...this.toJSON(), ...cambios });
  }

  toJSON() {
    return { id: this.id, titulo: this.titulo, prioridad: this.prioridad, completada: this.#completada };
  }

  static desdeJSON(objeto) {
    return crearTarea(objeto);
  }
}

export class TareaConVencimiento extends Tarea {
  #fechaLimite;

  constructor({ fechaLimite, ...resto }) {
    super(resto);
    if (!esFechaISO(fechaLimite)) throw new RangeError(`Fecha límite inválida: ${fechaLimite}`);
    this.#fechaLimite = fechaLimite;
  }

  get fechaLimite() {
    return this.#fechaLimite;
  }

  // Vence si no está completada y su fecha es anterior a hoy.
  estaVencida(ahora = new Date()) {
    return !this.completada && this.#fechaLimite < hoyISO(ahora);
  }

  toJSON() {
    return { ...super.toJSON(), fechaLimite: this.#fechaLimite };
  }
}

// Factory: decide qué clase instanciar según los datos recibidos.
export function crearTarea(datos) {
  if (datos === null || typeof datos !== 'object') throw new TypeError('Los datos de la tarea deben ser un objeto');
  return datos.fechaLimite ? new TareaConVencimiento(datos) : new Tarea(datos);
}

// Convierte una lista de objetos en tareas; descarta (y cuenta) los datos inválidos.
export function tareasDesdeLista(lista) {
  const tareas = [];
  let descartadas = 0;
  for (const elemento of lista) {
    try {
      tareas.push(crearTarea(elemento));
    } catch {
      descartadas += 1;
    }
  }
  return { tareas, descartadas };
}

// Patrón Factory: una función decide qué clase instanciar según el tipo pedido.
export class Tarea {
  constructor({ titulo, prioridad = 'media' }) {
    this.titulo = titulo;
    this.prioridad = prioridad;
    this.completada = false;
  }
}

export class TareaConVencimiento extends Tarea {
  constructor({ fechaLimite, ...resto }) {
    super(resto);
    this.fechaLimite = fechaLimite;
  }

  estaVencida(ahora = new Date()) {
    return !this.completada && new Date(this.fechaLimite) < ahora;
  }
}

export function crearTarea(tipo, datos) {
  switch (tipo) {
    case 'simple':
      return new Tarea(datos);
    case 'conVencimiento':
      if (!datos.fechaLimite) throw new Error('conVencimiento requiere fechaLimite');
      return new TareaConVencimiento(datos);
    default:
      throw new RangeError(`Tipo de tarea desconocido: ${tipo}`);
  }
}

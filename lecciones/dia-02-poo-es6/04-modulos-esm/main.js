// Ejecutar: node main.js  (desde esta carpeta)
import GestorTareas, { crearTarea, PRIORIDADES } from './tarea.js';
import { mayusculaInicial, contarPor } from './utilidades.js';

console.log('Prioridades válidas:', PRIORIDADES.map(mayusculaInicial).join(', '));

const gestor = new GestorTareas()
  .agregar(crearTarea('Preparar clase', 'alta'))
  .agregar(crearTarea('Corregir ejercicios'))
  .agregar(crearTarea('Actualizar diapositivas', 'alta'));

console.log('Por prioridad:', contarPor(gestor.todas, 'prioridad'));

// import() dinámico: el módulo solo se descarga y evalúa cuando se necesita.
console.log('Antes de pedir estadísticas...');
const { porcentajeCompletadas } = await import('./estadisticas.js');
console.log('Completadas:', porcentajeCompletadas(gestor.todas), '%');

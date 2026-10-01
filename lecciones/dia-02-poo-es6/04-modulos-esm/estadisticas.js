// Se carga bajo demanda con import() desde main.js.
console.log('   (estadisticas.js evaluado)');

export function porcentajeCompletadas(tareas) {
  if (tareas.length === 0) return 0;
  return Math.round((tareas.filter((t) => t.completada).length / tareas.length) * 100);
}

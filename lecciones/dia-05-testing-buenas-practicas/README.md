# Día 5 — Testing y buenas prácticas

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

## Objetivos

Al terminar el día, el participante podrá:

1. Escribir pruebas unitarias con Jest (`describe`, `test`, `expect`, `test.each`) para funciones puras, incluyendo casos frontera.
2. Ejecutar la suite de pruebas con módulos ESM nativos y leer su resultado.
3. Usar DevTools para poner breakpoints, inspeccionar `localStorage`, simular fallos de red y mostrar datos con `console.table`.
4. Reconocer e implementar cuatro patrones: Módulo, Observer, Factory y Strategy.
5. Probar código que notifica (Observer) con funciones simuladas (`jest.fn`).

## Temas

| Ruta | Tema | Qué demuestra |
|---|---|---|
| [`01-jest/`](01-jest/) | Pruebas unitarias con Jest | `filtros.js` y `filtros.test.js` con casos frontera y `test.each` |
| [`02-devtools.md`](02-devtools.md) | DevTools | Guía práctica sobre la app final |
| [`03-patrones/`](03-patrones/) | Patrones de diseño | Módulo, Observer, Factory y Strategy, cada uno con su prueba |

## Cómo ejecutar

Desde la raíz del repo:

```bash
npm install
npm test
```

El script ejecuta Jest con `node --experimental-vm-modules`, como indica la guía de ECMAScript Modules de jestjs.io; esa función es experimental y Node avisaría de ello, así que el script añade `--disable-warning=ExperimentalWarning` (Node 20.11 o superior) para ocultar ese aviso. `jest.config.js` desactiva las transformaciones (`transform: {}`) para que los archivos se ejecuten como ESM nativo. Para una sola carpeta:

```bash
npm test -- lecciones/dia-05-testing-buenas-practicas/01-jest
```

Resultado de la suite completa del repositorio (lecciones del día 5 y pruebas de la app): **10 suites, 113 pruebas, todas pasan**.

---

## 1. Pruebas unitarias con Jest

Una prueba unitaria llama a una función con entradas conocidas y comprueba la salida. Las **funciones puras** (misma salida para la misma entrada, sin mutar argumentos ni depender del entorno) son las más fáciles de probar. [`filtros.js`](01-jest/filtros.js) expone `porEstado`, `porPrioridad` y `ordenarPorFecha`.

```js
test('devuelve solo las pendientes', () => {
  expect(porEstado(tareas, 'pendientes').map((t) => t.id)).toEqual(['T-1']);
});

test.each([
  ['alta', ['T-1', 'T-3']],
  ['media', ['T-2']],
  ['baja', []],
])('prioridad "%s" devuelve %j', (prioridad, idsEsperados) => { /* … */ });
```

Casos frontera cubiertos en [`filtros.test.js`](01-jest/filtros.test.js): lista vacía, fechas iguales (el orden debe ser estable), tareas sin fecha, estado desconocido y que la función no mute su entrada.

Los archivos de prueba importan `describe`, `test`, `expect` y `jest` desde `@jest/globals`, necesario al usar ESM nativo.

**Errores comunes**
- Probar la implementación en lugar del comportamiento.
- Usar `toBe` para comparar objetos o arreglos (compara referencia; usa `toEqual`).
- Pruebas que dependen de la fecha actual: pasa la fecha como parámetro.
- Pruebas que dependen unas de otras o de un estado compartido.

**Ejercicio:** escribe `contarPendientes(tareas)` con sus pruebas primero (lista vacía, todas completadas, mezcla).

## 2. DevTools

Ver la guía completa en [`02-devtools.md`](02-devtools.md): breakpoint en el listener delegado, inspección de `localStorage`, red lenta y bloqueo de la petición inicial para ver el respaldo de datos, y `console.table(tareas)`.

**Ejercicio:** incluido al final de la guía.

## 3. Patrones de diseño

| Patrón | Archivo | Idea | Dónde se usa en la app |
|---|---|---|---|
| Módulo | [`01-modulo.js`](03-patrones/01-modulo.js) | IIFE con estado privado y API pública (ya visto con closures en el día 1) | `servicios/almacenamiento.js` |
| Observer | [`02-observer.js`](03-patrones/02-observer.js) | El store notifica a sus suscriptores cuando cambia | `estado/store.js` y `ui/vista.js` |
| Factory | [`03-factory.js`](03-patrones/03-factory.js) | `crearTarea(tipo, datos)` decide qué clase instanciar | `modelo/Tarea.js` |
| Strategy | [`04-strategy.js`](03-patrones/04-strategy.js) | Criterios de orden intercambiables por nombre | `modelo/filtros.js` |

Cada archivo tiene su prueba al lado (`*.test.js`). Puntos que se prueban:

- **Módulo:** el estado no es accesible desde fuera y `listar()` devuelve copias.
- **Observer:** el suscriptor recibe el estado nuevo (con `jest.fn`), se puede cancelar la suscripción y el estado anterior no se muta.
- **Factory:** devuelve la clase correcta, valida datos requeridos y rechaza tipos desconocidos.
- **Strategy:** ordena por título, prioridad y fecha, y admite una estrategia nueva sin cambiar `ordenar()`.

**Errores comunes**
- Observer: olvidar cancelar la suscripción (fugas de memoria y redibujados de más).
- Factory: crecer con `if` anidados cuando bastaría una tabla de constructores.
- Strategy: comparar con `a - b` strings o fechas sin convertir.
- Módulo: devolver el arreglo interno en vez de una copia.

**Ejercicio (uno por patrón):** (Módulo) agrega `eliminar(id)`; (Observer) haz que `suscribir` llame de inmediato al suscriptor con el estado actual; (Factory) agrega el tipo `recurrente`; (Strategy) agrega el criterio `completada`.

---

## Dónde aterriza en la app final

| Tema | Archivo | Función o fragmento |
|---|---|---|
| Pruebas con Jest | `tests/` | `Tarea.test.js`, `filtros.test.js`, `store.test.js`, `almacenamiento.test.js` (con doble de prueba del storage) y `api.test.js` (con `fetch` simulado) |
| Funciones puras | `app/src/modelo/filtros.js` | `porEstado`, `contarPendientes`, `ordenar`, `tareasVisibles` |
| Módulo (closure) | `app/src/servicios/almacenamiento.js` | `crearAlmacenamiento(clave)` |
| Observer | `app/src/estado/store.js` | `crearStore()`: `suscribir` devuelve la función para cancelar; `actualizar` notifica. La vista (`montarVista`) y el guardado (`main.js`) se suscriben |
| Strategy | `app/src/modelo/filtros.js` | `estrategiasDeOrden` (`manual`, `fecha`, `prioridad`) y `ordenar()` |
| Factory | `app/src/modelo/Tarea.js` | `crearTarea(tipo, datos)`: `'simple'` devuelve `Tarea` y `'conVencimiento'` devuelve `TareaConVencimiento`. `tipoDeDatos(datos)` deduce el tipo para datos externos (JSON, `localStorage`, formulario) |
| DevTools | `ui/vista.js`, `servicios/almacenamiento.js` | Puntos de práctica de la guía |

## Referencias

- [Jest: primeros pasos](https://jestjs.io/docs/getting-started)
- [Jest: matchers comunes](https://jestjs.io/docs/using-matchers)
- [Jest: referencia de la API global](https://jestjs.io/docs/api)
- [Jest: funciones simuladas](https://jestjs.io/docs/mock-functions)
- [Jest: ECMAScript Modules](https://jestjs.io/docs/ecmascript-modules)
- [IIFE (MDN)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
- [`Set` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [`Array.prototype.sort` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- Guía de DevTools: ver las referencias de [`02-devtools.md`](02-devtools.md)

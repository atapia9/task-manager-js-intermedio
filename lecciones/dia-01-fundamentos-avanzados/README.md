# Día 1 — Fundamentos avanzados

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

## Objetivos

Al terminar el día, el participante podrá:

1. Predecir el orden de salida de código que mezcla instrucciones síncronas, microtareas y temporizadores.
2. Explicar por qué una función declarada puede usarse antes de su declaración y una `const` no (TDZ).
3. Elegir entre `var` y `let` según el scope que necesite, y justificarlo con un caso real.
4. Construir closures que encapsulen estado privado (contador de IDs, clave de almacenamiento).
5. Diagnosticar la pérdida de `this` en un callback y aplicar tres correcciones.

## Temas

| Archivo | Tema | Qué demuestra |
|---|---|---|
| [`01-call-stack-event-loop.js`](01-call-stack-event-loop.js) | Call stack y event loop | Las microtareas se ejecutan antes que los temporizadores |
| [`02-hoisting-scope.js`](02-hoisting-scope.js) | Hoisting y scope | Función declarada vs `const`, y `var` vs `let` en un `for` |
| [`03-closures.js`](03-closures.js) | Closures | Generador de IDs y almacén con clave encapsulada |
| [`04-this.js`](04-this.js) | `this` | Pérdida de `this` y tres correcciones |

Todos corren con Node (sin DOM). Desde esta carpeta: `node 0X-nombre.js`.

---

## 1. Call stack y event loop

JavaScript ejecuta una sola cosa a la vez en la **pila de llamadas**. Cuando la pila queda vacía, el event loop toma primero **todas las microtareas** pendientes (`Promise.then`, `queueMicrotask`) y solo después la siguiente **macrotarea** (por ejemplo, un `setTimeout`).

Fragmento clave:

```js
setTimeout(() => console.log('macrotarea'), 0);
Promise.resolve().then(() => console.log('microtarea'));
console.log('síncrono');
```

Ejecutar: `node 01-call-stack-event-loop.js`

Salida real:

```
0. [síncrono] Inicio del programa
1. [síncrono] Inicia guardarTarea("Preparar clase de JavaScript")
2. [síncrono] Termina guardarTarea (la pila queda vacía)
2b. [síncrono] Fin del script principal
3. [microtarea] Promise.then: validación terminada
4. [microtarea] queueMicrotask: registro en historial
5. [macrotarea] setTimeout(…, 0): aviso "Tarea guardada"
```

**Por qué:** el `setTimeout(…, 0)` no significa "ahora", sino "en una macrotarea futura". Al vaciarse la pila, las microtareas se drenan por completo antes de volver a la cola de temporizadores. Las dos microtareas salen en el orden en que se encolaron.

**Errores comunes**
- Creer que `setTimeout(fn, 0)` ejecuta `fn` de inmediato.
- Pensar que `Promise.then` es "asíncrono como un temporizador": es una microtarea y adelanta a los temporizadores.
- Encolar microtareas en bucle infinito: bloquea el event loop igual que un `while(true)`.

**Ejercicio:** agrega un segundo `setTimeout(…, 0)` y una microtarea que, al ejecutarse, encole otra microtarea. Predice el orden completo antes de correrlo.

## 2. Hoisting y scope

- Una **función declarada** (`function crearTarea() {}`) se eleva con su cuerpo.
- Una `const` o `let` se eleva, pero no se puede leer antes de su línea de declaración: está en la **zona muerta temporal** (TDZ) y lanza `ReferenceError`.
- `var` tiene scope de función; `let` tiene scope de bloque, con un binding nuevo por iteración del `for`.

Ejecutar: `node 02-hoisting-scope.js`

Salida real:

```
Función declarada: { titulo: 'Revisar entregas', completada: false }
Función flecha antes de declarar -> ReferenceError: Cannot access 'crearTareaFlecha' before initialization
var -> ID generado: T-4
var -> ID generado: T-4
var -> ID generado: T-4
let -> ID generado: T-1
let -> ID generado: T-2
let -> ID generado: T-3
```

**Por qué `T-4` tres veces:** los callbacks de `setTimeout` corren cuando el bucle ya terminó; los tres comparten la misma `i`, que vale 4.

**Errores comunes**
- Asumir que una función flecha asignada a `const` se comporta como una función declarada.
- Usar `var` dentro de bucles con callbacks asíncronos.
- Confundir "elevada" con "inicializada".

**Ejercicio:** reescribe el bucle con `var` para que imprima `T-1`, `T-2`, `T-3` sin cambiar `var` por `let` (pista: necesitas un closure).

## 3. Closures

Un closure es una función que **recuerda las variables del scope donde nació**, aunque ese scope ya haya terminado.

```js
function crearGeneradorIds(prefijo) {
  let contador = 0;
  return () => `${prefijo}-${++contador}`;
}
```

Ejecutar: `node 03-closures.js`

Salida real:

```
T-1 T-2 T-3
E-1
[ { id: 'T-1', titulo: 'Practicar closures' } ]
¿Se expone la clave? undefined
```

Cada llamada a `crearGeneradorIds` crea su propio `contador`. `crearAlmacen` usa el mismo principio para ocultar la clave de almacenamiento. En el ejemplo usa un `Map` para correr en Node; en la app final usará `localStorage`.

**Errores comunes**
- Pensar que dos generadores comparten el contador.
- Guardar en un closure objetos enormes que ya no se necesitan (retiene memoria).
- Exponer el estado "por comodidad" y perder la encapsulación.

**Ejercicio:** agrega a `crearGeneradorIds` un método `reiniciar()` sin exponer `contador` como propiedad.

## 4. `this`

En un método, `this` depende de **cómo se llama**, no de dónde se define. Al pasar `gestor.completar` como callback se separa del objeto.

Ejecutar: `node 04-this.js`

Salida real:

```
Llamada normal: Gestor completó la tarea 1
Método perdido -> TypeError: Cannot read properties of undefined (reading 'tareas')
bind: Gestor completó la tarea 1
flecha: Gestor completó la tarea 1
campo flecha: GestorClase completó la tarea 1
```

Nota: los archivos son módulos ESM (`"type": "module"`), que se ejecutan en modo estricto; por eso el método suelto recibe `this === undefined` y no el objeto global.

| Corrección | Cuándo conviene |
|---|---|
| `bind` | Fijar `this` en un método existente sin tocar su definición |
| Función flecha envolvente | Callbacks puntuales, la forma más legible |
| Campo flecha en clase | Métodos que siempre se pasarán como callback (p. ej. manejadores de eventos) |

**Errores comunes**
- Usar función flecha como método de un objeto literal esperando `this` del objeto (hereda el `this` externo).
- Olvidar que `bind` devuelve una función nueva.
- Usar campo flecha en todos los métodos: crea una copia por instancia y no queda en el prototipo.

**Ejercicio:** cambia `completar` por una función flecha dentro del objeto literal `gestor` y explica por qué deja de funcionar incluso en la llamada normal.

---

## Dónde aterriza en la app final

| Tema | Archivo en `app/src/` | Función o fragmento |
|---|---|---|
| Event loop | `main.js` | `iniciar()` espera con `await obtenerTareasIniciales()`; el resto del script no se bloquea |
| Scope (`let`/`const`) | todos | No hay `var` en la app |
| Closures | `servicios/almacenamiento.js` | `crearAlmacenamiento(clave)`: la clave queda encapsulada |
| Closures | `modelo/Tarea.js` | `crearGeneradorIds(prefijo, desde)`: contador privado por generador |
| `this` | `modelo/Tarea.js` | `Tarea.conCambios()` usa `this.toJSON()`; los manejadores de `ui/vista.js` son funciones flecha, por lo que no pierden contexto |

## Referencias

- [Modelo de concurrencia y event loop (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- [`queueMicrotask` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask)
- [Guía de microtareas (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
- [Event loop, timers y `nextTick` (nodejs.org)](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Hoisting (MDN)](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [`let` y zona muerta temporal (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [Closures (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [`this` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [`Function.prototype.bind` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

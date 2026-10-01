# Día 2 — POO y ES6+

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

## Objetivos

Al terminar el día, el participante podrá:

1. Inspeccionar la cadena de prototipos de un objeto y demostrar que sus instancias comparten métodos.
2. Definir clases con campos privados, getters, métodos estáticos y herencia con `extends`.
3. Usar desestructuración, spread y rest para actualizar datos sin mutarlos.
4. Distinguir copia superficial de copia profunda y elegir la adecuada.
5. Organizar código en módulos ESM con exports nombrados, por defecto y carga dinámica con `import()`.

## Temas

| Archivo | Tema | Qué demuestra |
|---|---|---|
| [`01-prototipos.js`](01-prototipos.js) | Prototipos | Un método en `Tarea.prototype` compartido por todas las instancias |
| [`02-clases.js`](02-clases.js) | Clases | Campo privado, getter, `static`, `extends` |
| [`03-desestructuracion-spread-rest.js`](03-desestructuracion-spread-rest.js) | Desestructuración, spread y rest | Actualización inmutable y límite de la copia superficial |
| [`04-modulos-esm/`](04-modulos-esm/) | Módulos ESM | Export nombrado y por defecto, `import()` dinámico |

Todos corren con Node (sin DOM). Desde esta carpeta: `node 0X-nombre.js`; el tema 4 se ejecuta dentro de su carpeta con `node main.js`.

---

## 1. Prototipos

Cada objeto tiene un enlace interno a otro objeto, su **prototipo**. Si una propiedad no está en el objeto, JavaScript la busca siguiendo esa cadena. Al poner `completar` en `Tarea.prototype`, existe una sola copia de la función.

```js
Tarea.prototype.completar = function () { this.completada = true; return this; };
```

Ejecutar: `node 01-prototipos.js`

Salida real:

```
a: Tarea { titulo: 'Escribir README', completada: true }
b: Tarea { titulo: 'Revisar pruebas', completada: false }
¿Prototipo de a es Tarea.prototype? true
¿Comparten el mismo método? true
¿"completar" es propiedad propia de a? false
¿"titulo" es propiedad propia de a? true
Cadena: a -> Tarea.prototype -> Object.prototype -> null
```

**Errores comunes**
- Olvidar `new` al llamar al constructor (`this` deja de apuntar a la instancia nueva).
- Definir los métodos dentro del constructor: crea una función por instancia.
- Confundir `Tarea.prototype` (prototipo de las instancias) con `Object.getPrototypeOf(Tarea)` (prototipo de la función).

**Ejercicio:** agrega `Tarea.prototype.reabrir` después de crear `a` y comprueba que `a` ya puede usarlo.

## 2. Clases

`class` es una sintaxis más clara sobre el mismo mecanismo de prototipos (`typeof Tarea` sigue siendo `"function"`). Aporta campos privados con `#`, getters, métodos `static` y herencia con `extends`/`super`.

```js
class Tarea {
  #completada = false;
  get completada() { return this.#completada; }
  static desdeJSON({ titulo, completada = false }) { /* … */ }
}
class TareaConVencimiento extends Tarea { /* fechaLimite, estaVencida() */ }
```

Ejecutar: `node 02-clases.js`

Salida real:

```
typeof Tarea: function
desdeJSON -> Preparar demo | completada: true
Asignar sin setter -> TypeError
Sigue completada: true
¿instanceof Tarea? true
¿Vencida? true
¿Vencida tras completar? false
```

El `TypeError` aparece porque el módulo corre en modo estricto y `completada` solo tiene getter.

**Errores comunes**
- Olvidar llamar a `super(...)` antes de usar `this` en una subclase.
- Creer que `#campo` es solo una convención: es privacidad real, impuesta por el lenguaje.
- Usar `static` y esperar acceder al método desde una instancia.

**Ejercicio:** agrega a `TareaConVencimiento` un getter `diasRestantes` que devuelva un número (negativo si ya venció).

## 3. Desestructuración, spread y rest

- **Desestructuración:** extrae valores de objetos o arreglos y permite valores por defecto.
- **Spread (`...`) al construir:** copia propiedades o elementos en un objeto/arreglo nuevo.
- **Rest (`...`) al recibir:** recoge el resto de argumentos o elementos.

```js
const actualizada = { ...tarea, completada: true };   // no muta `tarea`
function agregarEtiquetas(tarea, ...etiquetas) { /* … */ }
```

Ejecutar: `node 03-desestructuracion-spread-rest.js`

Salida real (fragmento final):

```
El arreglo es otro: true
Pero el objeto es el mismo: Modificada desde la copia
Tras structuredClone, el original sigue: Modificada desde la copia
```

El spread hace una **copia superficial**: el arreglo nuevo contiene las mismas referencias. `structuredClone` hace una copia profunda (ver advertencias en MDN sobre qué tipos no soporta, por ejemplo funciones).

**Errores comunes**
- Creer que `[...tareas]` clona los objetos internos.
- Poner el spread después de la propiedad que se quiere sobrescribir (`{ completada: true, ...tarea }` deja ganar a `tarea`).
- Usar rest en medio de los parámetros: solo puede ser el último.

**Ejercicio:** escribe `moverAlFinal(tareas, id)` que devuelva un arreglo nuevo sin mutar el original ni sus objetos.

## 4. Módulos ESM

Cada archivo es un módulo con su propio scope. Se comparte con `export` y se consume con `import`. Un módulo puede tener varios exports nombrados y un único `default`. `import()` carga un módulo solo cuando se necesita y devuelve una promesa.

Estructura de [`04-modulos-esm/`](04-modulos-esm/):

| Archivo | Papel |
|---|---|
| `tarea.js` | Export nombrado (`crearTarea`, `PRIORIDADES`) y por defecto (`GestorTareas`) |
| `utilidades.js` | Funciones puras reutilizables |
| `estadisticas.js` | Se carga bajo demanda |
| `main.js` | Importa los demás |

Ejecutar: `cd 04-modulos-esm && node main.js`

Salida real:

```
Prioridades válidas: Baja, Media, Alta
Por prioridad: { alta: 2, media: 1 }
Antes de pedir estadísticas...
   (estadisticas.js evaluado)
Completadas: 0 %
```

Observa que `estadisticas.js` no se evalúa hasta que `main.js` ejecuta `await import(...)`.

**Errores comunes**
- Omitir la extensión `.js` en el especificador (en ESM nativo es obligatoria).
- Importar con llaves un `export default` (o al revés).
- Esperar que un módulo se evalúe más de una vez: se evalúa una sola vez y se comparte.

**Ejercicio:** crea `exportar.js` con una función `aTexto(tareas)` y cárgala con `import()` solo cuando haya al menos una tarea.

---

## Dónde aterriza en la app final

Las rutas son el plan de la Fase 6; la app aún no existe y esta tabla se actualizará con funciones concretas al construirla.

| Tema | Archivo en `app/src/` | Uso previsto |
|---|---|---|
| Clases | `modelo/Tarea.js` | `Tarea` con campo privado y `static desdeJSON` |
| Spread | `estado/store.js` | Actualizaciones inmutables del estado |
| Desestructuración | `modelo/filtros.js` | Parámetros desestructurados en funciones puras |
| Módulos ESM | `main.js` y todo `src/` | `<script type="module">` con imports entre archivos |

## Referencias

- [Herencia y cadena de prototipos (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [`Object.hasOwn` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
- [Clases (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [Elementos privados (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [`static` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)
- [`extends` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends)
- [Desestructuración (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)
- [Sintaxis spread (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [Parámetros rest (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [`structuredClone` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
- [Módulos JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [`export` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
- [`import()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Módulos ECMAScript en Node.js (nodejs.org)](https://nodejs.org/api/esm.html)

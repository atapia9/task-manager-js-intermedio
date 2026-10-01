# Día 3 — Programación asíncrona

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

## Objetivos

Al terminar el día, el participante podrá:

1. Escribir y leer código con callbacks usando la convención `(error, datos)` e identificar el anidamiento excesivo.
2. Encadenar promesas y combinar varias con `Promise.all`, `Promise.allSettled` y `Promise.race`.
3. Reescribir flujos asíncronos con `async/await` y manejar errores con `try/catch/finally`.
4. Decidir cuándo cargar en secuencia y cuándo en paralelo, y medir la diferencia.
5. Consumir un recurso con `fetch`: revisar `response.ok`, manejar errores de red y de JSON, y cancelar con `AbortController`.

## Temas

| Archivo | Tema | Qué demuestra |
|---|---|---|
| [`01-callbacks.js`](01-callbacks.js) | Callbacks | Tres cargas encadenadas y su anidamiento |
| [`02-promesas.js`](02-promesas.js) | Promesas | `all`, `allSettled`, `race` con tiempo límite |
| [`03-async-await.js`](03-async-await.js) | async/await | `try/catch/finally` y carga secuencial vs paralela |
| [`04-fetch/`](04-fetch/) | Fetch API | Éxito, 404, red, JSON inválido y cancelación |

Los temas 1 a 3 corren con Node. El tema 4 necesita navegador y servidor local.

---

## 1. Callbacks

Un callback es una función que se pasa a otra para que la llame cuando termine el trabajo. En Node, la convención es que reciba `(error, datos)`.

```js
cargarTareas((err, tareas) => {
  if (err) return console.error(err.message);
  cargarUsuario(tareas[0].usuarioId, (err, usuario) => { /* y así sucesivamente */ });
});
```

Ejecutar: `node 01-callbacks.js`

Salida real:

```
Error esperado: Usuario 99 no existe
Tarea "Preparar clase" de Ana, etiquetas: clase, urgente
```

El error del usuario 99 aparece primero porque solo espera una carga (≈100 ms), mientras que la cadena de tres espera ≈300 ms.

**Errores comunes**
- Olvidar el `return` tras manejar el error y seguir ejecutando el callback con datos inexistentes.
- Llamar al callback dos veces.
- Repetir el manejo de errores en cada nivel de anidamiento.

**Ejercicio:** agrega una cuarta carga dependiente (comentarios de la tarea) y observa cuánto crece la indentación.

## 2. Promesas

Una promesa representa un resultado futuro: pendiente, cumplida o rechazada. `.then` encadena pasos en un nivel plano y un único `.catch` atrapa errores de toda la cadena.

| Combinador | Se cumple cuando… | Se rechaza cuando… |
|---|---|---|
| `Promise.all` | todas se cumplen | una se rechaza |
| `Promise.allSettled` | todas terminan (nunca se rechaza) | — |
| `Promise.race` | la primera termina | la primera en terminar se rechaza |

Ejecutar: `node 02-promesas.js`

Salida real:

```
Encadenado -> usuario: Ana
Fin de la cadena
all -> 1 tarea(s), clase, urgente
all con fallo -> Servicio de etiquetas caído
allSettled -> fulfilled 
allSettled -> rejected Servicio de etiquetas caído
race -> Tiempo límite de 30 ms excedido
```

**Errores comunes**
- Olvidar el `return` dentro de un `.then`: el siguiente paso recibe `undefined`.
- Usar `Promise.all` cuando se quiere resultado parcial (para eso, `allSettled`).
- Creer que `race` cancela la promesa perdedora: solo ignora su resultado.

**Ejercicio:** implementa `reintentar(fn, veces)` que vuelva a llamar una función que devuelve promesa si esta se rechaza.

## 3. async/await

`async` hace que una función devuelva una promesa; `await` pausa esa función hasta que la promesa se resuelva, sin bloquear el resto del programa. Los errores se manejan con `try/catch/finally`.

```js
const [tareas, usuario, etiquetas] = await Promise.all([cargarTareas(), cargarUsuario(), cargarEtiquetas()]);
```

Ejecutar: `node 03-async-await.js`

Salida real (los milisegundos varían ligeramente en cada ejecución):

```
catch -> Servicio caído
finally -> siempre se ejecuta (p. ej. ocultar el indicador de carga)
Secuencial: ~302 ms
Paralelo  : ~101 ms
```

`performance.now()` está disponible como global en Node (se ejecutó en Node 24) y en navegadores. Con tres cargas independientes de 100 ms, la secuencial suma y la paralela tarda lo de la más lenta.

**Errores comunes**
- Usar `await` en secuencia para tareas independientes.
- Olvidar `await` y trabajar con una promesa en lugar de su valor.
- Usar `await` dentro de `forEach`: no espera. Usa `for…of` o `Promise.all` con `map`.

**Ejercicio:** convierte `conLimite` del tema 2 en una función `async` y úsala con `await`.

## 4. Fetch API

`fetch(url)` devuelve una promesa que se cumple con un `Response`. Puntos clave que demuestra [`04-fetch/fetch.js`](04-fetch/fetch.js):

| Situación | Cómo se manifiesta |
|---|---|
| HTTP 404 o 500 | `fetch` **no** rechaza; hay que revisar `response.ok` |
| Sin red o servidor caído | La promesa se rechaza con `TypeError` |
| Cuerpo que no es JSON válido | `response.json()` se rechaza con `SyntaxError` |
| Tarda demasiado | `controlador.abort()` rechaza con `AbortError` |

### Por qué hace falta un servidor local

Abrir `demo.html` con doble clic lo carga con una URL `file://`. Los navegadores tratan esos orígenes de forma restrictiva: la petición a `./tareas.json` y la carga de módulos (`type="module"`) pueden bloquearse (MDN describe el error de CORS `CORSRequestNotHttp`, que aparece cuando una petición no usa HTTP). El comportamiento exacto depende del navegador. Con un servidor local, la página y `tareas.json` comparten origen `http://localhost:8080`.

Desde la raíz del repo:

```bash
npm run serve
```

Abre <http://localhost:8080/lecciones/dia-03-asincronia/04-fetch/demo.html>. El servidor (`scripts/servidor.js`) es un archivo de Node sin dependencias.

Resultado esperado al pulsar cada botón (verificado en el navegador integrado de la app de escritorio):

| Botón | Mensaje |
|---|---|
| Carga correcta | `OK: 3 tareas` y el JSON |
| Archivo inexistente (404) | `Error: HTTP 404 Not Found` |
| JSON inválido | `Error: La respuesta no es JSON válido` |
| Error de red | `Error: Error de red: no se pudo contactar al servidor` |
| Tiempo límite (1 ms) | `Error: La petición tardó más de 1 ms y se canceló` |

El escenario "Error de red" pide a `localhost:1`, un puerto sin servidor. El de tiempo límite usa 1 ms para forzar la cancelación; con un límite razonable (3 s por defecto) la carga correcta termina sin cancelarse.

**Errores comunes**
- Asumir que `fetch` rechaza ante un 404.
- Llamar a `response.json()` dos veces (el cuerpo solo se puede leer una vez).
- No limpiar el temporizador de cancelación (`clearTimeout`).
- Probar desde `file://` y concluir que "fetch no funciona".

**Ejercicio:** agrega un botón "Reintentar" que repita la última petición fallida hasta 3 veces.

---

## Dónde aterriza en la app final

Las rutas son el plan de la Fase 6; la app aún no existe y esta tabla se actualizará con funciones concretas al construirla.

| Tema | Archivo en `app/src/` | Uso previsto |
|---|---|---|
| Fetch + `async/await` | `servicios/api.js` | Carga de `data/tareas-iniciales.json` con arreglo de respaldo si falla |
| `AbortController` | `servicios/api.js` | Cancelación si la carga tarda demasiado |
| `try/catch/finally` | `main.js` | Arranque que muestra un aviso discreto si se usa el respaldo |
| Promesas | `servicios/api.js` | Funciones que devuelven promesas, consumibles con `await` |

## Referencias

- [Usar promesas (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [`Promise` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`Promise.all` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [`Promise.allSettled` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [`Promise.race` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [`async function` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [`await` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [`Performance.now()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
- [`perf_hooks` (nodejs.org)](https://nodejs.org/api/perf_hooks.html)
- [Usar Fetch (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [`Response.ok` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)
- [`AbortController` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Error CORS `CORSRequestNotHttp` (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSRequestNotHttp)

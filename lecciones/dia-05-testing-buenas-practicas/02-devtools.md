# DevTools aplicadas al Task Manager

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

Guía práctica para usar las herramientas de desarrollo del navegador sobre la app final. Los nombres de pestañas y menús pueden variar según navegador y versión; aquí se usa Chrome como referencia y se indica el equivalente en Firefox. Los nombres de Chrome para breakpoints y Network se contrastaron con su documentación oficial; los de la pestaña Application de Chrome y todos los de Firefox (Debugger, Storage, Network Monitor) **no se contrastaron ni se probaron**; confírmalos en tu versión.

> Los archivos y funciones que se mencionan existen en `app/src/`. También puedes practicar con la demo del día 4.

## Preparación

1. Desde la raíz del repo: `npm run serve`.
2. Abre la app en `http://localhost:8080/app/` (o la demo del día 4: `http://localhost:8080/lecciones/dia-04-dom-eventos/demo.html`).
3. Abre DevTools con `F12`, o con `Cmd+Option+I` (macOS) / `Ctrl+Shift+I` (Windows y Linux).

## 1. Breakpoint en el listener delegado

Objetivo: detener la ejecución cuando se pulsa un botón de la lista y ver qué valor tiene `event.target`.

| Paso | Chrome | Firefox |
|---|---|---|
| Abrir el código | Pestaña **Sources**, busca `src/ui/vista.js` y la línea del `el.lista.addEventListener('click', …)` (o `01-delegacion-eventos.js` en la demo) | Pestaña **Debugger** |
| Poner el breakpoint | Clic en el número de línea de la primera línea dentro del listener | Igual |
| Disparar | Pulsa "Completar" en una tarea | Igual |
| Inspeccionar | Panel **Scope** y **Watch**: revisa `evento.target`, `boton`, `boton.dataset.accion` | Panel de variables |
| Avanzar | **Step over** (`F10`), **Resume** (`F8`) | Controles equivalentes |

Experimento: pulsa sobre el texto del botón y observa que `evento.target` puede ser un nodo interno, mientras que `closest('[data-accion]')` devuelve siempre el botón. Esto justifica el uso de `closest()`.

Chrome también ofrece breakpoints por tipo de evento (panel **Event Listener Breakpoints** en Sources; busca la categoría de eventos de ratón y el evento `click`), útiles cuando no sabes dónde está el listener. Puedes además escribir `debugger;` en el código para forzar una pausa mientras DevTools está abierto. Retíralo antes de hacer commit.

## 2. Inspeccionar `localStorage`

| Paso | Chrome | Firefox |
|---|---|---|
| Abrir | Pestaña **Application** › **Storage** › **Local storage** › origen `http://localhost:8080` | Pestaña **Storage** › Local Storage |
| Ver | La clave de tareas (`dia04-tareas` en la demo; la de la app es `task-manager-js-intermedio:tareas`, definida en `main.js`) y su valor JSON | Igual |
| Editar | Doble clic en el valor, cámbialo y recarga la página | Igual |
| Borrar | Selecciona la fila y elimina, o usa la opción de limpiar todo | Igual |

Experimentos:
- Cambia el JSON a algo inválido (por ejemplo, borra una llave) y recarga. La app debe seguir funcionando gracias al `try/catch` del servicio de almacenamiento.
- Borra la clave y recarga: debe volver a cargar los datos iniciales.

## 3. Red lenta o sin conexión: ver el respaldo de datos

La app, en el primer arranque sin datos guardados, pide `data/tareas-iniciales.json`; si falla, usa un arreglo de respaldo y muestra un aviso discreto.

Pasos en Chrome:

1. Pestaña **Application** › borra el `localStorage` del origen (la clave `task-manager-js-intermedio:tareas`), para simular un primer arranque.
2. Pestaña **Network**:
   - **Red lenta:** en el menú de **Throttling** elige un preset (por ejemplo, slow 4G) y recarga. Observa en la cascada cuánto tarda la petición.
   - **Fallo de la petición:** bloquea solo `tareas-iniciales.json` con **Request blocking** (clic derecho sobre la petición en la tabla, o la pestaña "Network request blocking" del cajón), y recarga.
3. Resultado esperado: aparece el aviso de respaldo y la lista se llena con el arreglo embebido. En Network, la petición bloqueada aparece como fallida.

Nota: si eliges **Offline** en el menú de throttling y recargas, el navegador tampoco podrá cargar la propia página. Para ver el respaldo, bloquea solo el JSON, o pon Offline *después* de que la página haya cargado y fuerza la petición de otro modo.

Firefox: el **Network Monitor** también tiene un selector de throttling y puede bloquear URLs desde el menú contextual de una petición (según versión).

## 4. `console.table` y el resto de la consola

En la pestaña **Console**, con la app abierta y el estado accesible (por ejemplo, al pausar con un breakpoint dentro del `render(estado)` de `ui/vista.js`, donde `estado.tareas` es la lista), ejecuta:

```js
console.table(estado.tareas);
console.table(estado.tareas, ['titulo', 'prioridad']); // solo algunas columnas
```

Verás una tabla con una fila por tarea. Otros métodos útiles: `console.group` / `console.groupEnd`, `console.time` / `console.timeEnd`, `console.error` y `console.dir`.

Desde la consola también puedes leer el almacenamiento directamente:

```js
JSON.parse(localStorage.getItem('task-manager-js-intermedio:tareas'))
```

## Ejercicio

Con la demo del día 4 abierta, usa un breakpoint de tipo **Event Listener Breakpoints** (click) y responde: ¿cuántas veces se ejecuta el listener al pulsar "Eliminar" una sola vez? ¿Por qué?

## Referencias

- [Documentación de Chrome DevTools](https://developer.chrome.com/docs/devtools)
- [Breakpoints en Chrome DevTools](https://developer.chrome.com/docs/devtools/javascript/breakpoints)
- [Referencia del panel Network (Chrome)](https://developer.chrome.com/docs/devtools/network/reference)
- [Local storage en DevTools (Chrome)](https://developer.chrome.com/docs/devtools/storage/localstorage)
- [Firefox DevTools User Docs](https://firefox-source-docs.mozilla.org/devtools-user/)
- [`console.table()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/console/table_static)
- [`debugger` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger)

# Día 4 — DOM avanzado y eventos

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

## Objetivos

Al terminar el día, el participante podrá:

1. Atender muchos elementos con un único listener usando delegación y `closest()`.
2. Guardar y leer datos con `localStorage` y `sessionStorage`, con manejo de errores, y sincronizar pestañas con el evento `storage`.
3. Leer un formulario con `FormData`, validarlo con atributos HTML y mostrar mensajes propios.
4. Explicar por qué `innerHTML` con texto del usuario es peligroso y usar `textContent` o `createElement` en su lugar.

## Temas

| Archivo | Tema | Qué demuestra |
|---|---|---|
| [`01-delegacion-eventos.js`](01-delegacion-eventos.js) | Delegación de eventos | Un listener en el `<ul>` y acciones por `data-accion` |
| [`02-web-storage.js`](02-web-storage.js) | Web Storage | `localStorage` vs `sessionStorage` y evento `storage` |
| [`03-formularios-formdata.js`](03-formularios-formdata.js) | Formularios y FormData | `FormData` + `Object.fromEntries`, validación y `preventDefault` |
| [`04-textcontent-vs-innerhtml.js`](04-textcontent-vs-innerhtml.js) | Inserción segura | `textContent` (seguro) frente a `innerHTML` (vulnerable) |
| [`demo.html`](demo.html) | — | Reúne los cuatro temas; `datos.js` aporta la lista base |

## Cómo ejecutar

Estos ejemplos usan el DOM y módulos ESM, así que necesitan HTTP (ver el día 3). Desde la raíz del repo:

```bash
npm run serve
```

Abre <http://localhost:8080/lecciones/dia-04-dom-eventos/demo.html>.

---

## 1. Delegación de eventos

Los eventos de clic **burbujean** desde el elemento hasta sus ancestros. Un solo listener en el `<ul>` recibe los clics de todos los botones, incluidos los creados después.

```js
lista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton || !lista.contains(boton)) return;
  // boton.dataset.accion vale "completar" o "eliminar"
});
```

`closest()` sube desde `event.target` hasta el elemento que coincide con el selector, útil cuando se pulsa un nodo interno del botón.

| | Un listener por botón | Delegación |
|---|---|---|
| Listeners | uno por elemento | uno en el contenedor |
| Elementos creados después | hay que registrarles listener | funcionan sin hacer nada |
| Al repintar la lista | hay que volver a registrar | no cambia |

**Salida esperada:** al pulsar "Completar" la fila se tacha y aparece `Acción "completar" sobre T-1`. Al agregar una tarea nueva, sus botones funcionan de inmediato.

**Errores comunes**
- Usar `event.target` sin `closest()`: falla si el clic cae en un hijo del botón.
- Delegar en `document` para todo: más difícil de razonar y de depurar.
- Eventos que no burbujean (por ejemplo `focus`; existe `focusin` como alternativa).

**Ejercicio:** agrega la acción `editar` con `data-accion="editar"` sin registrar ningún listener nuevo.

## 2. Web Storage

| | `localStorage` | `sessionStorage` |
|---|---|---|
| Duración | persiste tras cerrar el navegador | dura mientras viva la pestaña |
| Alcance | todas las pestañas del mismo origen | una sola pestaña |
| Valores | solo cadenas | solo cadenas |

Como solo guardan cadenas, se usa `JSON.stringify` al guardar y `JSON.parse` al leer. Ambos pueden fallar (JSON dañado, cuota excedida, almacenamiento bloqueado), por eso van dentro de `try/catch`.

El evento `storage` se dispara en **las otras pestañas** del mismo origen cuando cambia `localStorage`, no en la que hizo el cambio.

**Salida esperada (verificada con dos pestañas):** al agregar en `localStorage` desde la pestaña B, la pestaña A registra `Evento "storage": otra pestaña modificó las tareas` y actualiza su lista. El `sessionStorage` de A no cambia.

**Errores comunes**
- Guardar un objeto sin `JSON.stringify` (queda `"[object Object]"`).
- Llamar a `JSON.parse` sin `try/catch` sobre datos que pueden estar dañados.
- Guardar datos sensibles: Web Storage es legible por cualquier script de la página.
- Esperar el evento `storage` en la misma pestaña que escribió.

**Ejercicio:** agrega un botón que borre solo la clave de tareas y observa qué ve la otra pestaña.

## 3. Formularios y FormData

`new FormData(formulario)` lee los campos que tienen atributo `name`; `Object.fromEntries` lo convierte en un objeto. `event.preventDefault()` evita el comportamiento por defecto del envío (recargar la página).

```js
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  if (!formulario.checkValidity()) { /* mensaje propio según formulario.elements.titulo.validity */ return; }
  const datos = Object.fromEntries(new FormData(formulario));
});
```

La validación usa atributos HTML (`required`, `minlength`) y el objeto `validity` para saber qué regla falló. El formulario lleva `novalidate` para mostrar mensajes propios en lugar de los del navegador.

**Salida esperada**
- Título vacío: `Escribe un título para la tarea.`
- Título de 2 caracteres: `El título necesita al menos 3 caracteres.`
- Datos válidos: `{ "titulo": "Tarea válida", "prioridad": "alta", "fechaLimite": "2026-12-01", "completada": false }`

Nota: `minlength` solo se evalúa sobre texto escrito por una persona; si pruebas desde código asignando `input.value`, `validity.tooShort` no se activa. Teclea el valor para verlo.

**Errores comunes**
- Olvidar `name` en un campo: no aparece en `FormData`.
- Olvidar `preventDefault()`: la página se recarga.
- Confiar solo en la validación del navegador para datos que irán a un servidor.
- Asociar mal `<label for>` con el `id` del campo (afecta la accesibilidad).

**Ejercicio:** valida que la fecha límite, si se indica, no sea anterior a hoy y muestra un mensaje propio.

## 4. Inserción segura: `textContent` vs `innerHTML`

`innerHTML` interpreta su valor como HTML. Si el texto viene del usuario, puede ejecutar código (XSS). `textContent` lo inserta siempre como texto.

El título hostil de la demo es `<img src=x onerror=alert(1)>`:

| Método | Resultado |
|---|---|
| `textContent` | Se ve el texto literal; no se crea ningún `<img>` |
| `innerHTML` | Se crea un `<img>`, falla la carga y se ejecuta `alert(1)` |

**La versión vulnerable está desactivada.** Su botón permanece deshabilitado hasta marcar la casilla "Entiendo que esto ejecutará código del texto".

**Salida esperada (verificada):** con `textContent`, `0` elementos `<img>` en la salida y el texto idéntico al original. Con `innerHTML`, `1` elemento `<img>` y una llamada a `alert`.

**Regla para la app final:** todo texto del usuario se pinta con `textContent` o `createElement`, nunca con `innerHTML` concatenado.

**Errores comunes**
- Pensar que "es solo un título" y no sanitizar.
- Usar plantillas de cadena con `innerHTML` mezclando datos del usuario.
- Creer que `textContent` sirve para insertar HTML intencional: para eso se construye con `createElement`.

**Ejercicio:** reescribe una fila de tarea que use `innerHTML` con `` `<li>${titulo}</li>` `` usando `createElement` y `textContent`.

---

## Dónde aterriza en la app final

Las rutas son el plan de la Fase 6; la app aún no existe y esta tabla se actualizará con funciones concretas al construirla.

| Tema | Archivo en `app/src/` | Uso previsto |
|---|---|---|
| Delegación | `ui/vista.js` | Un listener en la lista que distingue `completar`, `editar` y `eliminar` |
| Web Storage | `servicios/almacenamiento.js` | Guardado en `localStorage` con `try/catch` |
| Formularios y FormData | `ui/vista.js` | Formulario de nueva tarea |
| `textContent` | `ui/vista.js` | Todo texto del usuario se pinta con `textContent`/`createElement` |

## Referencias

- [Eventos en el DOM (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events)
- [`Event.target` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)
- [`Event.currentTarget` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)
- [`Element.closest()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
- [`Element.replaceChildren()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren)
- [Web Storage API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Usar la Web Storage API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [Evento `storage` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
- [`StorageEvent` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)
- [`FormData` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Usar objetos FormData (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)
- [`Object.fromEntries` (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)
- [Validación de restricciones (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)
- [`ValidityState` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
- [`HTMLFormElement.checkValidity()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/checkValidity)
- [`Event.preventDefault()` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
- [`Node.textContent` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
- [`Element.innerHTML` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [Cross-site scripting, XSS (MDN)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS)

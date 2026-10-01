# Task Manager didáctico — JavaScript Intermedio

Ejemplo paralelo del curso **JavaScript Intermedio** (REDEC-UNAM / Educación Continua FES Cuautitlán, 5 sesiones de 4 horas). Reúne ejemplos pequeños por tema, todos en el dominio de un gestor de tareas, y un **Task Manager completo** que integra los temas de los cinco días.

**Demo en línea:** <https://atapia9.github.io/task-manager-js-intermedio/>
**Índice de lecciones en línea:** <https://atapia9.github.io/task-manager-js-intermedio/lecciones/>

> **Nota de divulgación:** Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.

## Cómo está organizado

| Carpeta | Contenido |
|---|---|
| [`lecciones/`](lecciones/) | Un directorio por día con ejemplos autónomos (no importan de `app/`) y un README con explicación, salida esperada, errores comunes y ejercicios |
| [`app/`](app/) | El producto final: HTML + CSS + JavaScript con módulos ESM nativos, sin frameworks ni bundlers |
| [`tests/`](tests/) | Pruebas Jest de `app/src/` |
| [`scripts/`](scripts/) | Servidor estático local sin dependencias |

Sin frameworks ni bundlers. La única dependencia de desarrollo es Jest.

## Cómo navegarlo

1. Empieza por el README de cada día, en orden: [día 1](lecciones/dia-01-fundamentos-avanzados/README.md), [día 2](lecciones/dia-02-poo-es6/README.md), [día 3](lecciones/dia-03-asincronia/README.md), [día 4](lecciones/dia-04-dom-eventos/README.md) y [día 5](lecciones/dia-05-testing-buenas-practicas/README.md).
2. Ejecuta cada ejemplo y compara con la salida esperada del README.
3. Resuelve el ejercicio de cada tema (no incluye solución en el repositorio).
4. Al final, recorre la app y localiza dónde aterriza cada tema (la última tabla de cada README apunta a funciones concretas de `app/src/`).

## Mapa día ↔ tema ↔ archivo

| Día | Tema | Ejemplo en `lecciones/` | Dónde aterriza en `app/src/` |
|---|---|---|---|
| 1 | Call stack y event loop | [`01-call-stack-event-loop.js`](lecciones/dia-01-fundamentos-avanzados/01-call-stack-event-loop.js) | `main.js` (`iniciar`) |
| 1 | Hoisting y scope | [`02-hoisting-scope.js`](lecciones/dia-01-fundamentos-avanzados/02-hoisting-scope.js) | todo el código (`let`/`const`) |
| 1 | Closures | [`03-closures.js`](lecciones/dia-01-fundamentos-avanzados/03-closures.js) | `servicios/almacenamiento.js`, `modelo/Tarea.js` |
| 1 | `this` | [`04-this.js`](lecciones/dia-01-fundamentos-avanzados/04-this.js) | `modelo/Tarea.js` (`conCambios`) |
| 2 | Prototipos | [`01-prototipos.js`](lecciones/dia-02-poo-es6/01-prototipos.js) | base de las clases de `modelo/Tarea.js` |
| 2 | Clases | [`02-clases.js`](lecciones/dia-02-poo-es6/02-clases.js) | `modelo/Tarea.js` |
| 2 | Desestructuración, spread y rest | [`03-desestructuracion-spread-rest.js`](lecciones/dia-02-poo-es6/03-desestructuracion-spread-rest.js) | `estado/store.js`, `modelo/filtros.js` |
| 2 | Módulos ESM | [`04-modulos-esm/`](lecciones/dia-02-poo-es6/04-modulos-esm/) | `index.html` y todo `src/` |
| 3 | Callbacks | [`01-callbacks.js`](lecciones/dia-03-asincronia/01-callbacks.js) | (contraste: la app usa promesas) |
| 3 | Promesas | [`02-promesas.js`](lecciones/dia-03-asincronia/02-promesas.js) | `servicios/api.js` |
| 3 | async/await | [`03-async-await.js`](lecciones/dia-03-asincronia/03-async-await.js) | `main.js`, `servicios/api.js` |
| 3 | Fetch API | [`04-fetch/`](lecciones/dia-03-asincronia/04-fetch/) | `servicios/api.js` |
| 4 | Delegación de eventos | [`01-delegacion-eventos.js`](lecciones/dia-04-dom-eventos/01-delegacion-eventos.js) | `ui/vista.js` (`montarVista`) |
| 4 | Web Storage | [`02-web-storage.js`](lecciones/dia-04-dom-eventos/02-web-storage.js) | `servicios/almacenamiento.js` |
| 4 | Formularios y FormData | [`03-formularios-formdata.js`](lecciones/dia-04-dom-eventos/03-formularios-formdata.js) | `ui/vista.js` |
| 4 | `textContent` vs `innerHTML` | [`04-textcontent-vs-innerhtml.js`](lecciones/dia-04-dom-eventos/04-textcontent-vs-innerhtml.js) | `ui/vista.js` (`crear`) |
| 5 | Pruebas con Jest | [`01-jest/`](lecciones/dia-05-testing-buenas-practicas/01-jest/) | [`tests/`](tests/) |
| 5 | DevTools | [`02-devtools.md`](lecciones/dia-05-testing-buenas-practicas/02-devtools.md) | `ui/vista.js`, `servicios/almacenamiento.js` |
| 5 | Patrones: Módulo, Observer, Factory, Strategy | [`03-patrones/`](lecciones/dia-05-testing-buenas-practicas/03-patrones/) | `almacenamiento.js`, `estado/store.js`, `modelo/Tarea.js`, `modelo/filtros.js` |

## Cómo usarlo en tu equipo

Requisitos: Node.js 20 o superior (el CI usa Node 24) y npm.

```bash
npm install     # instala Jest
npm test        # ejecuta todas las pruebas (app y lecciones)
npm run serve   # servidor local en http://localhost:8080/
```

Con el servidor activo:

- App: <http://localhost:8080/app/>
- Demo de Fetch: <http://localhost:8080/lecciones/dia-03-asincronia/04-fetch/demo.html>
- Demo del día 4: <http://localhost:8080/lecciones/dia-04-dom-eventos/demo.html>

Las demos del navegador necesitan HTTP (no funcionan con doble clic sobre el archivo); el README del día 3 explica por qué. Los ejemplos sin DOM se ejecutan con `node`, por ejemplo `node lecciones/dia-01-fundamentos-avanzados/03-closures.js`.

`npm test` muestra un aviso de Node sobre "VM Modules": Jest necesita `--experimental-vm-modules` para ejecutar módulos ESM nativos, según su guía oficial.

## Publicación y CI

- `.github/workflows/ci.yml`: ejecuta `npm ci` y `npm test` en cada push y pull request.
- `.github/workflows/pages.yml`: en cada push a `main`, ejecuta las pruebas, ensambla `_site/` (la app en la raíz y `lecciones/` en `/lecciones/`) y publica en GitHub Pages.

## Licencia

[MIT](LICENSE) © 2026 Jesús Armando Tapia Gallegos.

## Autoría

Jesús Armando Tapia Gallegos. Curso de referencia: [`js-intermedio-unam-fesc`](https://github.com/atapia9/js-intermedio-unam-fesc).

// Día 4 · Tema 4 — Inserción segura: textContent vs innerHTML
// La versión vulnerable está desactivada hasta marcar la casilla de confirmación.
const entrada = document.querySelector('#titulo-hostil');
const salidaSegura = document.querySelector('#salida-segura');
const salidaVulnerable = document.querySelector('#salida-vulnerable');
const confirmar = document.querySelector('#confirmar-vulnerable');
const botonVulnerable = document.querySelector('#pintar-vulnerable');
const botonSeguro = document.querySelector('#pintar-seguro');

botonSeguro.addEventListener('click', () => {
  // El texto se inserta como texto: las etiquetas se ven, no se interpretan.
  salidaSegura.textContent = entrada.value;
});

confirmar.addEventListener('change', () => {
  botonVulnerable.disabled = !confirmar.checked;
});

botonVulnerable.addEventListener('click', () => {
  // VULNERABLE: el navegador interpreta el HTML; <img onerror=…> ejecuta código.
  salidaVulnerable.innerHTML = entrada.value;
});

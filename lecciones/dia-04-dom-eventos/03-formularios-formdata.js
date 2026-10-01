// Día 4 · Tema 3 — Formularios y FormData
const formulario = document.querySelector('#formulario-tarea');
const error = document.querySelector('#error-formulario');
const resultado = document.querySelector('#resultado-formulario');
const titulo = formulario.elements.titulo;

// Mensajes propios para las reglas que el navegador valida con atributos HTML
// (required, minlength). validity indica cuál regla falló.
function mensajeDeTitulo() {
  if (titulo.validity.valueMissing) return 'Escribe un título para la tarea.';
  if (titulo.validity.tooShort) return `El título necesita al menos ${titulo.minLength} caracteres.`;
  return '';
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault(); // evita la recarga de la página y el envío al servidor

  if (!formulario.checkValidity()) {
    error.textContent = mensajeDeTitulo() || 'Revisa los campos del formulario.';
    titulo.focus();
    return;
  }
  error.textContent = '';

  // FormData lee los campos por su atributo name; Object.fromEntries lo vuelve objeto.
  const datos = Object.fromEntries(new FormData(formulario));
  resultado.textContent = JSON.stringify({ ...datos, completada: false }, null, 2);
  formulario.reset();
});

// Día 3 · Tema 4 — Fetch API
// Se usa desde demo.html. Requiere servidor local (ver README).

export async function cargarJSON(url, { limiteMs = 3000 } = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), limiteMs);

  try {
    const respuesta = await fetch(url, { signal: controlador.signal });

    // fetch NO rechaza ante 404 o 500: hay que revisar response.ok.
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} ${respuesta.statusText}`);
    }

    return await respuesta.json(); // rechaza con SyntaxError si el JSON es inválido
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`La petición tardó más de ${limiteMs} ms y se canceló`);
    }
    if (error instanceof SyntaxError) {
      throw new Error('La respuesta no es JSON válido');
    }
    if (error instanceof TypeError) {
      throw new Error('Error de red: no se pudo contactar al servidor');
    }
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}

// Día 1 · Tema 3 — Closures
// Ejecutar: node 03-closures.js

// El contador vive en el scope de crearGeneradorIds y no es accesible desde fuera.
function crearGeneradorIds(prefijo) {
  let contador = 0;
  return function siguienteId() {
    contador += 1;
    return `${prefijo}-${contador}`;
  };
}

const idTarea = crearGeneradorIds('T');
const idEtiqueta = crearGeneradorIds('E');
console.log(idTarea(), idTarea(), idTarea()); // T-1 T-2 T-3
console.log(idEtiqueta());                    // E-1 (contador independiente)

// crearAlmacen encapsula la clave: quien lo usa no la ve ni puede cambiarla.
function crearAlmacen(clave) {
  const memoria = new Map(); // simula localStorage para poder correr en Node
  return {
    guardar(valor) {
      memoria.set(clave, JSON.stringify(valor));
    },
    leer() {
      const crudo = memoria.get(clave);
      return crudo === undefined ? [] : JSON.parse(crudo);
    },
  };
}

const almacen = crearAlmacen('tareas-v1');
almacen.guardar([{ id: 'T-1', titulo: 'Practicar closures' }]);
console.log(almacen.leer());
console.log('¿Se expone la clave?', almacen.clave); // undefined

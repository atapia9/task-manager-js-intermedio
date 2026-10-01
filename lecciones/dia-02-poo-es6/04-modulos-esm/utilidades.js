export const mayusculaInicial = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

export const contarPor = (lista, clave) =>
  lista.reduce((acc, item) => ({ ...acc, [item[clave]]: (acc[item[clave]] ?? 0) + 1 }), {});

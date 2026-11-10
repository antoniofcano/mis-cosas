// Qué secciones de una titulación existen (#/<tit>/<sección>) en esta versión de la app, para enlazar una pantalla solo
// si está. app.js las publica al arrancar (fijarRutasTit(Object.keys(TIT_ROUTES))); una vista pregunta con hayRuta().
// Así una pantalla puede ofrecer un enlace a otra que se construye aparte (p. ej. «Estrategia de examen» en
// #/<tit>/estrategia) sin depender de ella: en cuanto la ruta se registre en TIT_ROUTES, el enlace aparece solo.

let secciones = new Set();

/** Lo llama app.js con las claves de TIT_ROUTES. */
export function fijarRutasTit(claves) {
  secciones = new Set(claves);
}

/** ¿Existe la sección #/<tit>/<seccion>? */
export const hayRuta = (seccion) => secciones.has(seccion);

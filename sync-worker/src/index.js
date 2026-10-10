// Punto de entrada del Worker patron-sync: toda la lógica está en servidor.js (el módulo principal de un Worker solo
// puede exportar manejadores).
import { manejar } from './servidor.js';

export default {
  fetch: (req, env) => manejar(req, env),
};

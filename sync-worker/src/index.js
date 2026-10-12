// Punto de entrada del Worker patron-sync: toda la lógica está en servidor.js y avisos.js (el módulo principal de un
// Worker solo puede exportar manejadores).
import { manejar } from './servidor.js';
import { cron } from './avisos.js';

export default {
  fetch: (req, env) => manejar(req, env),
  // Recordatorio diario (wrangler.toml, [triggers]): una vez por hora. En el registro, solo un resumen sin datos.
  scheduled: (ev, env, ctx) => ctx.waitUntil(cron(env, { ahora: ev.scheduledTime }).then(
    (r) => { if (r.candidatas || r.borrados || r.fallidos) console.log('avisos', JSON.stringify(r)); },
    (e) => console.error('avisos', e?.message),
  )),
};

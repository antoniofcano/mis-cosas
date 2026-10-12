// patron-sync: el servidor de sincronización del progreso de la app Patrón (docs/SYNC.md en nautica/).
// Cloudflare Worker + D1. El servidor es tonto a propósito: no fusiona nada; guarda las operaciones de cada alumno
// (sin duplicados, con un número de orden `seq` creciente por alumno) y devuelve las que el aparato aún no tiene. La
// fusión la hace cada aparato con el pliegue (nautica/src/store/sync/plegar.js).
//
//   POST /v1/sync   Authorization: Bearer <código>   { v: 1, cursor, ops: [...], crear? }
//                   → { v: 1, cursor, ops: [...], mas, aceptadas, duplicadas, rechazadas: [{ i, motivo }], total }
//   GET  /v1/salud  → { ok: true, version }
//   POST /v1/avisos       Authorization: Bearer <código>   { v: 1, sus: { endpoint, keys }, zona, hora, anterior? }
//                         → { ok: true, hora, zona }   (recordatorio diario: alta o cambio de hora; ver avisos.js)
//   POST /v1/avisos/baja  { v: 1, endpoint } → { ok: true, borradas }
//
// Identidad: el código del alumno (12 símbolos) viaja en la cabecera Authorization y aquí solo se guarda su hash
// SHA-256 con un «pepper» secreto (env.PEPPER). El código nunca se guarda ni se escribe en los registros.

import { validarOperacion } from '../../nautica/src/store/sync/operaciones.js';
import { validarCodigo } from '../../nautica/src/store/sync/codigo.js';
import { HORAS, zonaValida, validarSuscripcion, MAX_ENDPOINT } from '../../nautica/src/store/sync/avisos.js';
import { LIMITES_AVISOS, pushActivo, vapidConfigurado } from './avisos.js';
import { importarPublicaEcdh, deB64u } from './webpush.js';

export const VERSION = '1.1.0';

export const LIMITES = {
  cuerpoBytes: 256 * 1024, // por petición
  opsPorLote: 500, // operaciones por petición
  opsPorAlumno: 100000, // tope total de operaciones guardadas de un alumno
  respuestaOps: 1000, // operaciones por respuesta como mucho (con `mas: true` si quedan)
  respuestaBytes: 2 * 1024 * 1024, // bytes de operaciones por respuesta como mucho
  porIpMinuto: 120, // peticiones por IP y minuto
  porAlumnoMinuto: 60, // peticiones por alumno y minuto
  fallosIpHora: 20, // códigos inexistentes o mal formados por IP y hora (contra quien pruebe códigos al azar)
  altasIpDia: 20, // alumnos nuevos por IP y día
};

const MIN = 60e3;
const HORA = 3600e3;
const DIA = 864e5;

/** Orígenes permitidos: la app publicada y localhost/127.0.0.1 (desarrollo), más los de env.ORIGENES_EXTRA. */
export function origenPermitido(origen, env = {}) {
  if (!origen) return false;
  if (origen === 'https://antoniofcano.github.io') return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(origen)) return true;
  return String(env.ORIGENES_EXTRA ?? '').split(',').map((s) => s.trim()).filter(Boolean).includes(origen);
}

function cabecerasCors(req, env) {
  const origen = req.headers.get('origin');
  if (!origenPermitido(origen, env)) return {};
  return {
    'access-control-allow-origin': origen,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

const json = (cuerpo, estado = 200, extra = {}) => new Response(JSON.stringify(cuerpo), {
  status: estado,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra },
});
const fallo = (estado, error, motivo, extra = {}) => json({ error, motivo }, estado, extra);

async function sha256(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash del código que se guarda (con el pepper secreto). */
export const hashCodigo = (codigo, pepper) => sha256(`patron-sync:v1:${pepper}:${codigo}`);

/** Suma uno al contador `clave` en su ventana (ms) y devuelve el total de la ventana. */
export async function contar(db, clave, ventana, ahora) {
  const fin = (Math.floor(ahora / ventana) + 1) * ventana;
  const r = await db.prepare(`INSERT INTO limites (clave, ventana, n) VALUES (?1, ?2, 1)
    ON CONFLICT(clave) DO UPDATE SET n = CASE WHEN limites.ventana = ?2 THEN limites.n + 1 ELSE 1 END, ventana = ?2
    RETURNING n`).bind(clave, fin).first();
  return r?.n ?? 1;
}
async function leer(db, clave, ventana, ahora) {
  const fin = (Math.floor(ahora / ventana) + 1) * ventana;
  const r = await db.prepare('SELECT n FROM limites WHERE clave = ?1 AND ventana = ?2').bind(clave, fin).first();
  return r?.n ?? 0;
}

/** Maneja una petición. `ahora` se puede inyectar en pruebas. */
export async function manejar(req, env, { ahora = Date.now() } = {}) {
  const url = new URL(req.url);
  const cors = cabecerasCors(req, env);
  const origen = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    if (!origenPermitido(origen, env)) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: cors });
  }
  // Un navegador desde otra web no puede usar el servidor (las peticiones sin Origin, como curl, sí: CORS no es
  // identidad; la identidad es el código).
  if (origen && !origenPermitido(origen, env)) return fallo(403, 'origen', 'Origen no permitido.');

  if (url.pathname === '/v1/salud' && req.method === 'GET') {
    let db = false;
    try { db = (await env.DB.prepare('SELECT 1 AS uno').first())?.uno === 1; } catch { db = false; }
    return json({ ok: db, version: VERSION }, db ? 200 : 503, cors);
  }
  const ruta = { '/v1/sync': sincronizar, '/v1/avisos': avisosAlta, '/v1/avisos/baja': avisosBaja }[url.pathname];
  if (!ruta) return fallo(404, 'ruta', 'No existe.', cors);
  if (req.method !== 'POST') return fallo(405, 'metodo', 'Usa POST.', { ...cors, allow: 'POST, OPTIONS' });
  if (!env.PEPPER || String(env.PEPPER).length < 16) return fallo(500, 'configuracion', 'Falta configurar el servidor.', cors);

  try {
    return await ruta(req, env, ahora, cors);
  } catch (e) {
    console.error(url.pathname, e?.message);
    return fallo(500, 'servidor', 'Error interno.', cors);
  }
}

/** Hash de la IP (ni la IP se guarda tal cual) y el límite por IP y minuto. null si se puede seguir. */
async function limiteIp(req, env, db, ahora, cors) {
  const ip = req.headers.get('cf-connecting-ip') ?? 'sin-ip';
  const ipH = (await sha256(`ip:${env.PEPPER}:${ip}`)).slice(0, 24);
  if (await contar(db, `ip:${ipH}`, MIN, ahora) > LIMITES.porIpMinuto) return { ipH, corte: fallo(429, 'limite', 'Demasiadas peticiones.', { ...cors, 'retry-after': '60' }) };
  return { ipH, corte: null };
}

/** Lee un cuerpo JSON de `max` bytes como mucho: { cuerpo } o { corte } con el error. */
async function leerJson(req, max, cors) {
  if (Number(req.headers.get('content-length') ?? 0) > max) return { corte: fallo(413, 'demasiado-grande', 'Petición demasiado grande.', cors) };
  const texto = await req.text();
  if (new TextEncoder().encode(texto).length > max) return { corte: fallo(413, 'demasiado-grande', 'Petición demasiado grande.', cors) };
  try { return { cuerpo: JSON.parse(texto) }; } catch { return { corte: fallo(400, 'json', 'JSON no válido.', cors) }; }
}

const esObjeto = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

/**
 * Alta o cambio del recordatorio diario de un aparato: guarda (o actualiza, por endpoint) su suscripción de push con
 * la zona horaria y la hora elegida. Topes: 3 por alumno (se sustituye la más antigua) y 500 en total (409).
 */
async function avisosAlta(req, env, ahora, cors) {
  if (!pushActivo(env)) return fallo(503, 'avisos-apagados', 'Los avisos diarios están desactivados por ahora. Prueba más adelante.', cors);
  if (!vapidConfigurado(env)) return fallo(503, 'avisos-sin-configurar', 'Los avisos diarios aún no están disponibles.', cors);
  const db = env.DB;
  const { ipH, corte } = await limiteIp(req, env, db, ahora, cors);
  if (corte) return corte;
  if (await leer(db, `fallo:${ipH}`, HORA, ahora) >= LIMITES.fallosIpHora) return fallo(429, 'limite', 'Demasiados intentos con códigos que no existen.', { ...cors, 'retry-after': '3600' });
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.get('authorization') ?? '');
  const v = m ? validarCodigo(m[1]) : { ok: false };
  if (!v.ok) {
    await contar(db, `fallo:${ipH}`, HORA, ahora);
    return fallo(401, 'codigo-invalido', 'Código no válido.', cors);
  }
  const { cuerpo, corte: malo } = await leerJson(req, LIMITES_AVISOS.cuerpoBytes, cors);
  if (malo) return malo;
  if (!esObjeto(cuerpo) || cuerpo.v !== 1 || Object.keys(cuerpo).some((k) => !['v', 'sus', 'zona', 'hora', 'anterior'].includes(k))
    || (cuerpo.anterior !== undefined && (typeof cuerpo.anterior !== 'string' || cuerpo.anterior.length > MAX_ENDPOINT))) {
    return fallo(400, 'esquema', 'Petición mal formada.', cors);
  }
  if (!HORAS.includes(cuerpo.hora)) return fallo(400, 'hora', 'Hora no válida.', cors);
  if (!zonaValida(cuerpo.zona)) return fallo(400, 'zona', 'Zona horaria no admitida.', cors);
  const sus = cuerpo.sus;
  if (validarSuscripcion(sus) || Object.keys(sus).some((k) => !['endpoint', 'keys', 'expirationTime'].includes(k))
    || Object.keys(sus.keys).some((k) => !['p256dh', 'auth'].includes(k))) {
    return fallo(400, 'suscripcion', 'Suscripción no válida.', cors);
  }
  try { await importarPublicaEcdh(deB64u(sus.keys.p256dh)); } catch { return fallo(400, 'suscripcion', 'Suscripción no válida.', cors); }

  const alumno = await db.prepare('SELECT id FROM alumnos WHERE hash = ?1').bind(await hashCodigo(v.codigo, env.PEPPER)).first();
  if (!alumno) {
    await contar(db, `fallo:${ipH}`, HORA, ahora);
    return fallo(404, 'codigo-desconocido', 'Ese código no existe.', cors);
  }
  if (await contar(db, `al:${alumno.id}`, MIN, ahora) > LIMITES.porAlumnoMinuto) return fallo(429, 'limite', 'Demasiadas peticiones.', { ...cors, 'retry-after': '60' });

  const { endpoint } = sus;
  const ya = await db.prepare('SELECT (SELECT COUNT(*) FROM avisos) AS total, (SELECT 1 FROM avisos WHERE endpoint = ?1) AS existe').bind(endpoint).first();
  if (!ya?.existe && (ya?.total ?? 0) >= LIMITES_AVISOS.total) return fallo(409, 'tope-avisos', 'El servidor ha llegado al máximo de avisos. Prueba más adelante.', cors);

  const pasos = [];
  // El navegador cambió la suscripción: la anterior de este alumno sobra.
  if (cuerpo.anterior && cuerpo.anterior !== endpoint) pasos.push(db.prepare('DELETE FROM avisos WHERE endpoint = ?1 AND alumno = ?2').bind(cuerpo.anterior, alumno.id));
  pasos.push(
    // Alta o cambio (por endpoint). Cambiar de hora o volver a darse de alta reanuda los avisos (seguidos = 0); el día
    // del último aviso se conserva: nunca dos el mismo día.
    db.prepare(`INSERT INTO avisos (alumno, endpoint, p256dh, auth, zona, hora, renovado) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(endpoint) DO UPDATE SET alumno = excluded.alumno, p256dh = excluded.p256dh, auth = excluded.auth, zona = excluded.zona,
        hora = excluded.hora, renovado = excluded.renovado, seguidos = 0`)
      .bind(alumno.id, endpoint, sus.keys.p256dh, sus.keys.auth, cuerpo.zona, cuerpo.hora, ahora),
    // Como mucho porAlumno por alumno: se quedan las más recientes.
    db.prepare(`DELETE FROM avisos WHERE alumno = ?1 AND id NOT IN (SELECT id FROM avisos WHERE alumno = ?1 ORDER BY renovado DESC, id DESC LIMIT ?2)`)
      .bind(alumno.id, LIMITES_AVISOS.porAlumno),
  );
  await db.batch(pasos);
  return json({ ok: true, hora: cuerpo.hora, zona: cuerpo.zona }, 200, cors);
}

/** Baja del recordatorio de un aparato: borra su suscripción (el endpoint, secreto y al azar, basta como prueba). */
async function avisosBaja(req, env, ahora, cors) {
  const db = env.DB;
  const { corte } = await limiteIp(req, env, db, ahora, cors);
  if (corte) return corte;
  const { cuerpo, corte: malo } = await leerJson(req, LIMITES_AVISOS.cuerpoBytes, cors);
  if (malo) return malo;
  if (!esObjeto(cuerpo) || cuerpo.v !== 1 || typeof cuerpo.endpoint !== 'string' || cuerpo.endpoint.length > MAX_ENDPOINT
    || Object.keys(cuerpo).some((k) => !['v', 'endpoint'].includes(k))) {
    return fallo(400, 'esquema', 'Petición mal formada.', cors);
  }
  const r = await db.prepare('DELETE FROM avisos WHERE endpoint = ?1').bind(cuerpo.endpoint).run();
  return json({ ok: true, borradas: r?.meta?.changes ?? 0 }, 200, cors);
}

async function sincronizar(req, env, ahora, cors) {
  const db = env.DB;
  const ip = req.headers.get('cf-connecting-ip') ?? 'sin-ip';
  const ipH = (await sha256(`ip:${env.PEPPER}:${ip}`)).slice(0, 24); // ni la IP se guarda tal cual
  // Mantenimiento de la tabla de límites: de vez en cuando se borran las ventanas pasadas.
  if (Math.random() < 0.02) await db.prepare('DELETE FROM limites WHERE ventana < ?1').bind(ahora).run();

  if (await contar(db, `ip:${ipH}`, MIN, ahora) > LIMITES.porIpMinuto) return fallo(429, 'limite', 'Demasiadas peticiones.', { ...cors, 'retry-after': '60' });
  if (await leer(db, `fallo:${ipH}`, HORA, ahora) >= LIMITES.fallosIpHora) return fallo(429, 'limite', 'Demasiados intentos con códigos que no existen.', { ...cors, 'retry-after': '3600' });

  const auth = req.headers.get('authorization') ?? '';
  const m = /^Bearer\s+(\S+)$/i.exec(auth);
  const v = m ? validarCodigo(m[1]) : { ok: false };
  if (!v.ok) {
    await contar(db, `fallo:${ipH}`, HORA, ahora);
    return fallo(401, 'codigo-invalido', 'Código no válido.', cors);
  }

  // Cuerpo: tamaño y forma.
  const largo = Number(req.headers.get('content-length') ?? 0);
  if (largo > LIMITES.cuerpoBytes) return fallo(413, 'demasiado-grande', 'Petición demasiado grande.', cors);
  const texto = await req.text();
  if (new TextEncoder().encode(texto).length > LIMITES.cuerpoBytes) return fallo(413, 'demasiado-grande', 'Petición demasiado grande.', cors);
  let cuerpo;
  try { cuerpo = JSON.parse(texto); } catch { return fallo(400, 'json', 'JSON no válido.', cors); }
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo) || cuerpo.v !== 1 || !Number.isSafeInteger(cuerpo.cursor) || cuerpo.cursor < 0
    || !Array.isArray(cuerpo.ops) || (cuerpo.crear !== undefined && typeof cuerpo.crear !== 'boolean')
    || Object.keys(cuerpo).some((k) => !['v', 'cursor', 'ops', 'crear'].includes(k))) {
    return fallo(400, 'esquema', 'Petición mal formada.', cors);
  }
  if (cuerpo.ops.length > LIMITES.opsPorLote) return fallo(413, 'demasiado-grande', 'Demasiadas operaciones en un lote.', cors);

  // Alumno: por el hash del código. Crear = primera subida de un código nuevo (crear: true).
  const hash = await hashCodigo(v.codigo, env.PEPPER);
  let alumno = await db.prepare('SELECT id, seq FROM alumnos WHERE hash = ?1').bind(hash).first();
  if (!alumno) {
    if (!cuerpo.crear) {
      await contar(db, `fallo:${ipH}`, HORA, ahora);
      return fallo(404, 'codigo-desconocido', 'Ese código no existe.', cors);
    }
    if (await contar(db, `alta:${ipH}`, DIA, ahora) > LIMITES.altasIpDia) return fallo(429, 'limite', 'Demasiados alumnos nuevos.', { ...cors, 'retry-after': '3600' });
    await db.prepare('INSERT INTO alumnos (hash, creado, ultimo, seq) VALUES (?1, ?2, ?2, 0) ON CONFLICT(hash) DO NOTHING').bind(hash, ahora).run();
    alumno = await db.prepare('SELECT id, seq FROM alumnos WHERE hash = ?1').bind(hash).first();
  }
  if (await contar(db, `al:${alumno.id}`, MIN, ahora) > LIMITES.porAlumnoMinuto) return fallo(429, 'limite', 'Demasiadas peticiones.', { ...cors, 'retry-after': '60' });

  // Validación de cada operación: las que no valen se rechazan una a una (el resto entra).
  const rechazadas = [];
  const validas = [];
  const vistas = new Set();
  for (const op of cuerpo.ops) {
    const motivo = validarOperacion(op, ahora);
    if (motivo) { rechazadas.push({ i: typeof op?.i === 'string' ? op.i.slice(0, 40) : null, motivo }); continue; }
    if (vistas.has(op.i)) continue;
    vistas.add(op.i);
    validas.push(op);
  }
  if (validas.length && alumno.seq + validas.length > LIMITES.opsPorAlumno) {
    return fallo(409, 'tope', 'Este alumno ha llegado al máximo de operaciones guardadas.', cors);
  }

  let aceptadas = 0;
  if (validas.length) {
    // Un solo INSERT para todo el lote (json_each), con seq consecutivo a partir del último; los ids que ya estaban
    // se saltan. Va en un batch (transacción) con la actualización del contador del alumno.
    const [ins] = await db.batch([
      db.prepare(`INSERT INTO operaciones (alumno, seq, op_id, tipo, instante, json, recibido)
        SELECT ?1, (SELECT seq FROM alumnos WHERE id = ?1) + row_number() OVER (ORDER BY j.key),
               json_extract(j.value, '$.i'), json_extract(j.value, '$.k'), json_extract(j.value, '$.t'), j.value, ?2
        FROM json_each(?3) AS j
        WHERE NOT EXISTS (SELECT 1 FROM operaciones o WHERE o.alumno = ?1 AND o.op_id = json_extract(j.value, '$.i'))`)
        .bind(alumno.id, ahora, JSON.stringify(validas)),
      db.prepare('UPDATE alumnos SET seq = COALESCE((SELECT MAX(seq) FROM operaciones WHERE alumno = ?1), 0), ultimo = ?2 WHERE id = ?1').bind(alumno.id, ahora),
    ]);
    aceptadas = ins?.meta?.changes ?? 0;
  }

  // Lo que el aparato no tiene: las de seq > cursor, menos las que acaba de mandar él (el cursor sí pasa por encima).
  const filas = (await db.prepare('SELECT seq, op_id, json FROM operaciones WHERE alumno = ?1 AND seq > ?2 ORDER BY seq LIMIT ?3')
    .bind(alumno.id, cuerpo.cursor, LIMITES.respuestaOps + 1).all()).results ?? [];
  const mandadas = new Set(cuerpo.ops.map((o) => o?.i));
  const ops = [];
  let bytes = 0;
  let cursor = cuerpo.cursor;
  let mas = false;
  for (const [n, f] of filas.entries()) {
    if (n >= LIMITES.respuestaOps || (ops.length && bytes + f.json.length > LIMITES.respuestaBytes)) { mas = true; break; }
    cursor = f.seq;
    if (mandadas.has(f.op_id)) continue;
    ops.push(JSON.parse(f.json));
    bytes += f.json.length;
  }
  const total = (await db.prepare('SELECT seq FROM alumnos WHERE id = ?1').bind(alumno.id).first())?.seq ?? 0;
  return json({ v: 1, cursor, ops, mas, aceptadas, duplicadas: validas.length - aceptadas, rechazadas, total }, 200, cors);
}

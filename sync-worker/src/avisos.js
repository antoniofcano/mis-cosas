// El recordatorio diario por push (nautica/docs/AVISOS.md): la tarea programada (cron, una vez por hora) y su lógica
// pura. Pensado para gastar lo mínimo:
//   - Si los avisos están apagados (PUSH_ACTIVO = "0") o sin claves VAPID: ni una consulta.
//   - Si no: UNA consulta indexada (avisos_franja) con las parejas (hora, zona) cuya hora local coincide ahora con
//     una de las horas que se pueden elegir. Sin suscripciones en esa franja, se acaba ahí.
//   - Si hay: como mucho `filasPorEjecucion` filas, se descartan las de quien ya ha estudiado hoy, las ya avisadas hoy
//     y las pausadas (5 avisos seguidos sin estudiar); se lee el contador del día, se envía como mucho
//     `enviosPorEjecucion` (4 a la vez, un solo intento cada uno) y se escribe todo en un único batch (3 sentencias).
//   - Una vez al día (a las 3:00 UTC) ese mismo batch limpia las ventanas de límites pasadas y las suscripciones
//     caducadas.

import { HORAS, ZONAS } from '../../nautica/src/store/sync/avisos.js';
import { importarVapid, jwtVapid, enviar } from './webpush.js';

export const LIMITES_AVISOS = {
  porAlumno: 3, // suscripciones por alumno (la más antigua se sustituye)
  total: 500, // suscripciones en todo el servidor (409 al pasar)
  cuerpoBytes: 2048, // alta o baja
  filasPorEjecucion: 100, // filas que lee una ejecución como mucho
  enviosPorEjecucion: 40, // por debajo de las 50 subpeticiones por invocación del plan gratuito
  enviosPorDia: 400, // contador en D1 (limites, clave avisos:dia)
  concurrencia: 4,
  pausaTras: 5, // avisos seguidos sin estudiar → pausa hasta que vuelva
  caducaDias: 120, // suscripción sin renovar y alumno sin actividad en tantos días → se borra
  horaLimpieza: 3, // hora UTC en que el cron limpia
  ttl: 4 * 3600, // si el móvil está apagado más de 4 h, el aviso de hoy ya no se entrega
};

/** Sujeto VAPID: la dirección pública de la app (sin correo). */
export const SUJETO = 'https://antoniofcano.github.io/mis-cosas/nautica/';
/** El mensaje es mínimo: el texto, el icono y la etiqueta los pone el service worker. */
export const CARGA = '{"v":1}';
/** Un aviso aún sin entregar se sustituye por el siguiente con el mismo topic (no se apilan). */
export const TOPIC = 'recordatorio';

const DIA = 864e5;

/** ¿Están encendidos los avisos? Interruptor de emergencia: PUSH_ACTIVO = "0" lo apaga todo. */
export const pushActivo = (env) => String(env?.PUSH_ACTIVO ?? '1').trim() !== '0';
/** ¿Hay claves VAPID? (la pública en wrangler.toml, la privada como secreto). */
export const vapidConfigurado = (env) => !!(env?.VAPID_PUBLIC && env?.VAPID_PRIVATE);

const formato = (zona) => new Intl.DateTimeFormat('en-CA', { timeZone: zona, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' });
// Los formateadores de las zonas admitidas se crean al cargar el módulo (arranque del Worker, que tiene su propio
// límite) y no dentro de la tarea: la primera vez que se usa Intl se cargan los datos de zonas horarias (~15-25 ms en
// Node), y eso no debe contar en los 10 ms de CPU por ejecución del plan gratuito.
const formatos = new Map(ZONAS.map((z) => [z, formato(z)]));

/** Día (AAAA-MM-DD) y hora (0–23) locales de `zona` en el instante `ms`, con Intl (cambios de hora incluidos). */
export function local(zona, ms) {
  let f = formatos.get(zona);
  if (!f) { f = formato(zona); formatos.set(zona, f); }
  const p = {};
  for (const x of f.formatToParts(ms)) p[x.type] = x.value;
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: Number(p.hour) % 24 };
}

/** Parejas [hora, zona] cuya hora local en `ahora` es una de las que se pueden elegir. */
export const parejas = (ahora) => ZONAS.flatMap((z) => { const { hora } = local(z, ahora); return HORAS.includes(hora) ? [[hora, z]] : []; });

/**
 * ¿Se avisa a esta suscripción? Pura.
 * @param {{ zona: string, dia: string, aviso: number, seguidos: number, ultimo: number }} f  fila (ultimo = última
 *   subida con operaciones del alumno; aviso = instante del último aviso; dia = día local del último aviso)
 * @returns {{ enviar: true, hoy: string, seguidos: number } | { enviar: false, motivo: string }}
 */
export function decidir(f, ahora) {
  const hoy = local(f.zona, ahora).dia;
  if (f.dia === hoy) return { enviar: false, motivo: 'ya-avisado' };
  if (f.ultimo && local(f.zona, f.ultimo).dia === hoy) return { enviar: false, motivo: 'activo-hoy' };
  const seguidos = f.ultimo > f.aviso ? 0 : f.seguidos; // ha estudiado desde el último aviso: vuelve a empezar
  if (seguidos >= LIMITES_AVISOS.pausaTras) return { enviar: false, motivo: 'pausado' };
  return { enviar: true, hoy, seguidos: seguidos + 1 };
}

const finDiaUtc = (ms) => (Math.floor(ms / DIA) + 1) * DIA;

/** Ejecuta `fn` sobre `xs` con `n` a la vez como mucho. */
async function enParalelo(xs, n, fn) {
  let i = 0;
  const hilo = async () => { while (i < xs.length) { const x = xs[i]; i += 1; await fn(x); } };
  await Promise.all(Array.from({ length: Math.min(n, xs.length) }, hilo));
}

/**
 * La tarea programada. `ahora` y `fetch` se inyectan en las pruebas. Nunca lanza por un envío fallido.
 * @returns {Promise<{ consultas: number, filas: number, candidatas: number, enviados: number, borrados: number, fallidos: number, motivo: string|null }>}
 */
export async function cron(env, { ahora = Date.now(), fetch: f = globalThis.fetch?.bind(globalThis) } = {}) {
  const L = LIMITES_AVISOS;
  const res = { consultas: 0, filas: 0, candidatas: 0, enviados: 0, borrados: 0, fallidos: 0, motivo: null };
  if (!pushActivo(env)) return { ...res, motivo: 'apagado' };
  if (!vapidConfigurado(env)) return { ...res, motivo: 'sin-vapid' };
  const db = env.DB;
  const escrituras = [];

  // Limpieza, una vez al día y dentro del mismo batch final: ventanas de límites pasadas y suscripciones caducadas
  // (sin renovar y con el alumno sin actividad en caducaDias).
  if (new Date(ahora).getUTCHours() === L.horaLimpieza) {
    const corte = ahora - L.caducaDias * DIA;
    escrituras.push(
      db.prepare('DELETE FROM limites WHERE ventana < ?1').bind(ahora),
      db.prepare('DELETE FROM avisos WHERE renovado < ?1 AND alumno IN (SELECT id FROM alumnos WHERE ultimo < ?1)').bind(corte),
    );
  }

  const pares = parejas(ahora);
  if (pares.length) {
    // Una consulta, por el índice (hora, zona); las pausadas que no han vuelto ni se leen.
    const r = await db.prepare(`SELECT s.id, s.endpoint, s.p256dh, s.auth, s.zona, s.dia, s.aviso, s.seguidos, a.ultimo
      FROM avisos s JOIN alumnos a ON a.id = s.alumno
      WHERE (s.hora, s.zona) IN (SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]') FROM json_each(?1))
        AND (s.seguidos < ?2 OR a.ultimo > s.aviso)
      LIMIT ?3`).bind(JSON.stringify(pares), L.pausaTras, L.filasPorEjecucion).all();
    res.consultas += 1;
    const filas = r.results ?? [];
    res.filas = filas.length;
    const tocan = [];
    for (const x of filas) { const d = decidir(x, ahora); if (d.enviar) tocan.push({ ...x, hoy: d.hoy, seguidosNuevo: d.seguidos }); }
    res.candidatas = tocan.length;

    if (tocan.length) {
      const fin = finDiaUtc(ahora);
      const llevados = (await db.prepare('SELECT n FROM limites WHERE clave = ?1 AND ventana = ?2').bind('avisos:dia', fin).first())?.n ?? 0;
      res.consultas += 1;
      const cupo = Math.max(0, Math.min(L.enviosPorEjecucion, L.enviosPorDia - llevados));
      const lote = tocan.slice(0, cupo);
      if (tocan.length > lote.length) res.motivo = 'tope';
      if (lote.length) {
        const clave = await importarVapid(env.VAPID_PUBLIC, env.VAPID_PRIVATE);
        const exp = Math.floor(ahora / 1000) + 12 * 3600;
        const jwts = new Map(); // un JWT por servicio de push en cada ejecución
        const hechos = [];
        const borrar = [];
        await enParalelo(lote, L.concurrencia, async (s) => {
          const aud = new URL(s.endpoint).origin;
          if (!jwts.has(aud)) jwts.set(aud, jwtVapid(clave, { aud, exp, sub: SUJETO }));
          let estado = 0;
          try { estado = await enviar(s, CARGA, { jwt: await jwts.get(aud), publica: env.VAPID_PUBLIC, fetch: f, ttl: L.ttl, topic: TOPIC }); } catch { estado = 0; }
          if (estado >= 200 && estado < 300) hechos.push([s.id, s.hoy, s.seguidosNuevo]);
          else if (estado === 404 || estado === 410) borrar.push(s.id); // el servicio de push ya no la conoce
          else res.fallidos += 1; // sin reintentos: mañana será otro día
        });
        res.enviados = hechos.length;
        res.borrados = borrar.length;
        if (hechos.length) {
          escrituras.push(db.prepare(`UPDATE avisos SET aviso = ?1, dia = json_extract(j.value, '$[1]'), seguidos = json_extract(j.value, '$[2]')
            FROM json_each(?2) AS j WHERE avisos.id = json_extract(j.value, '$[0]')`).bind(ahora, JSON.stringify(hechos)));
        }
        if (borrar.length) escrituras.push(db.prepare('DELETE FROM avisos WHERE id IN (SELECT value FROM json_each(?1))').bind(JSON.stringify(borrar)));
        escrituras.push(db.prepare(`INSERT INTO limites (clave, ventana, n) VALUES (?1, ?2, ?3)
          ON CONFLICT(clave) DO UPDATE SET n = CASE WHEN limites.ventana = ?2 THEN limites.n + ?3 ELSE ?3 END, ventana = ?2`).bind('avisos:dia', fin, lote.length));
      }
    }
  }
  if (escrituras.length) {
    await db.batch(escrituras);
    res.consultas += 1;
  }
  return res;
}

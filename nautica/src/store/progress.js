// Base de datos local del alumno (localStorage): intentos, aciertos y errores típicos por tipo de ejercicio,
// respuestas a preguntas de examen, clases, minutos estudiados por día y el examen a medias. Los campos nuevos son
// opcionales: un progreso antiguo (version 1) carga sin migración (lo que falta se completa al cargar: el eje, p. ej.).
//
// Sincronización (docs/SYNC.md): cada escritura se apunta como una OPERACIÓN en un registro aparte (src/store/sync/,
// clave `nautica.sync.v1`) y el progreso que devuelve get() sale de plegar ese registro (plegar.js), con exactamente
// la forma de siempre. El registro se sube al servidor y trae lo de los otros aparatos del alumno (motor.js), sin que
// el alumno haga nada; sin conexión todo sigue igual en local. El progreso plegado se sigue guardando en
// `nautica.progress.v1` (como siempre), y la primera vez que arranca esta versión ese progreso se convierte en una
// operación «base» (la migración: nada que hacer a mano y nada se pierde).

import { diaISO } from '../texto.js';
import { EJE_POR_DEFECTO } from '../bancos/registro.js';
import { crearRegistro, CLAVE_SYNC } from './sync/registro.js';
import { plegarConEstado, aplicar, compararOps } from './sync/plegar.js';
import { separar, crearBase } from './sync/fusion.js';
import { esAjusteCompartido } from './sync/operaciones.js';
const KEY = 'nautica.progress.v1';
const VERSION_TRAVESIA_GUARDADA = 1; // versión del campo `travesia` (v:1 = { v, bancos: { 'eje/tit': { rango, insignias: { id: ISO } } } })

const empty = () => ({ version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1 } });

/** Fecha local 'YYYY-MM-DD' de un instante. */
export const diaLocal = diaISO;
const DIA = 864e5;

function safeStorage() {
  try {
    const s = globalThis.localStorage;
    const k = '__t';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null; // modo privado, Node, etc.: el progreso vive solo en memoria
  }
}

/** ¿Hay progreso previo (de antes de la bienvenida)? */
export const tieneProgreso = (d) => Object.keys(d.exams ?? {}).length > 0 || Object.keys(d.lecciones ?? {}).length > 0;

/** ¿Hay algo que llevar a una base? (un progreso recién creado y sin tocar no la necesita) */
const hayAlgo = (c) => Object.entries(c).some(([k, v]) => k !== 'version' && (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : v != null));

export function createProgressStore(storage = safeStorage()) {
  const reg = crearRegistro(storage);
  if (!reg.existia()) {
    // Migración automática: el progreso de antes (si lo hay) pasa a ser la base de este aparato.
    let antiguo = null;
    try {
      const raw = storage?.getItem(KEY);
      if (raw) antiguo = { ...empty(), ...JSON.parse(raw) };
    } catch { /* datos corruptos: empezamos de cero */ }
    if (antiguo) {
      const { compartido, local } = separar(antiguo);
      reg.cambiarLocal((l) => { Object.assign(l, local); });
      if (hayAlgo(compartido)) reg.agregar(crearBase(compartido, { siguienteId: reg.siguienteId }));
    }
    reg.guardar();
  }
  let data;
  let est;
  const normaliza = () => {
    data.settings ??= {};
    // Usuarios de antes de la bienvenida: no se les muestra.
    if (data.settings.onboarded == null && tieneProgreso(data)) data.settings.onboarded = true;
    // Eje (banco de la administración examinadora): lo de antes de que hubiera ejes es del eje por defecto.
    data.settings.eje ??= EJE_POR_DEFECTO;
    // Sonidos y vibración (src/ui/efectos.js): opcionales y apagados por defecto. Un progreso de antes (sin ellos) o con
    // un valor raro se queda con todo apagado; nada más cambia.
    for (const k of ['sonidos', 'vibracion']) if (typeof data.settings[k] !== 'boolean') data.settings[k] = false;
    if (Array.isArray(data.tests)) data.tests = data.tests.map((t) => (t?.eje ? t : { ...t, eje: EJE_POR_DEFECTO }));
    if (data.testEnCurso && !data.testEnCurso.eje) data.testEnCurso = { ...data.testEnCurso, eje: EJE_POR_DEFECTO };
    // Travesía (src/course/travesia.js): campo opcional con su propia versión. Sin él (progreso de antes) no hay nada que
    // migrar: se crea al guardar el primer rango; uno mal formado se descarta (se recalcula solo desde los datos).
    if (data.travesia != null) {
      const t = data.travesia;
      if (typeof t !== 'object' || Array.isArray(t) || typeof t.bancos !== 'object' || t.bancos == null) delete data.travesia;
      else t.v ??= VERSION_TRAVESIA_GUARDADA;
    }
  };

  const save = () => { try { storage?.setItem(KEY, JSON.stringify(data)); } catch { /* sin espacio o bloqueado */ } };
  /** Vuelve a plegar el registro entero (al cargar, al llegar operaciones de otros aparatos o de otra pestaña). */
  const repliega = () => {
    const r = plegarConEstado(reg.ops, reg.local);
    est = r.est;
    data = r.prog;
    normaliza();
  };
  repliega();
  /** Apunta una operación y la aplica al progreso (sin volver a plegar todo si va detrás de la última). */
  const registra = (campos) => {
    const op = JSON.parse(JSON.stringify({ i: reg.siguienteId(), ...campos }));
    reg.agregar([op]);
    if (est.ultimo && compararOps(op, est.ultimo) < 0) repliega();
    else aplicar(est, op);
    save();
    return op;
  };
  // Lo que llega de los otros aparatos (motor.js) se pliega en cuanto llega.
  reg.on('nuevas', () => { repliega(); save(); });
  // Con la app abierta en dos pestañas, cada una guardaba su copia entera y la última pisaba las respuestas de la
  // otra. Ahora las operaciones de la otra pestaña se unen (por id) a las de esta en cuanto se guardan.
  if (storage && typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('storage', (ev) => { if (ev.key === CLAVE_SYNC && ev.newValue && reg.deFuera(ev.newValue)) repliega(); });
  }

  const store = {
    get: () => data,
    settings: () => data.settings,
    setSetting(k, v) {
      // Los ajustes de estudio se comparten entre aparatos; los del aparato (letra, sonidos, voz, avisos…) no salen de él.
      if (esAjusteCompartido(k)) { registra({ k: 'v', t: Date.now(), c: 'settings', p: [k], v }); return; }
      reg.cambiarLocal((l) => { l.settings[k] = v; });
      data.settings[k] = v;
      save();
    },

    /** Registra el resultado de un intento de ejercicio generado. */
    recordAttempt(typeId, { ok, seed, mistakes = [] }) {
      registra({ k: 'e', t: Date.now(), y: typeId, o: !!ok, s: seed, m: [...mistakes] });
    },

    /** Registra la respuesta a una pregunta de examen real (choice null = «No la sé»). */
    recordExam(questionId, { choice = null, ok, nivel = false }) {
      // n: veces respondida; ok1: si se acertó la primera vez (lo que mejor predice una pregunta que no has memorizado).
      // rep: repaso espaciado de fallos (src/course/repaso.js); null = fuera de la cola. Una respuesta del test de nivel
      // (src/course/nivel.js) cuenta como cualquier otra para el dominio, pero no toca la cola: lo que falla un alumno
      // que aún no ha estudiado no es un fallo que repasar mañana (se lo enseña su clase), y lo que ya estaba en la cola
      // sigue igual. Todo eso lo calcula el pliegue (src/store/sync/plegar.js) a partir de la respuesta y su día local.
      const t = Date.now();
      registra({ k: 'r', t, q: questionId, c: choice, o: !!ok, d: diaLocal(t), ...(nivel ? { n: true } : {}) });
    },

    /**
     * Test de nivel (src/course/nivel.js) de un eje y una titulación: el resultado guardado (o null) y el test a medias.
     * Uno por banco; repetirlo lo sustituye.
     */
    nivel: (eje, tit) => data.niveles?.[`${eje}/${tit}`] ?? null,
    recordNivel(eje, tit, r) { registra({ k: 'v', t: Date.now(), c: 'niveles', p: [`${eje}/${tit}`], v: r }); },

    /** Fichas de idea abiertas (src/course/ficha.js): { [concepto]: ISO } por eje y titulación. */
    fichasVistas: (eje, tit) => data.fichas?.[`${eje}/${tit}`] ?? {},
    recordFichaVista(eje, tit, concepto, t = new Date().toISOString()) {
      // Entre aparatos gana la vista más reciente (lo mismo que hacía este almacén al volver a abrirla).
      registra({ k: 'v', t: Date.now(), c: 'fichas', p: [`${eje}/${tit}`, concepto], v: t });
    },

    /**
     * Repaso por concepto (src/course/repaso.js): estado de cada concepto en el banco de un eje y una titulación,
     * { [concepto]: { racha, prox, t } | { fuera: true, t } }. Va aparte de las respuestas (que no cambian): un progreso
     * sin este campo se lee igual y sus fallos se repasan con la fecha de cada pregunta.
     */
    repasoConceptos: (eje, tit) => data.repConceptos?.[`${eje}/${tit}`] ?? {},
    recordRepasoConcepto(eje, tit, concepto, estado) {
      registra({ k: 'v', t: Date.now(), c: 'repConceptos', p: [`${eje}/${tit}`, concepto], v: estado });
    },

    /**
     * Travesía (src/course/travesia.js) de un eje y una titulación: { rango, insignias: { [id]: ISO } }. El rango es el
     * máximo alcanzado (nunca baja) y las insignias, una vez ganadas, se quedan. Un progreso sin este campo se lee igual.
     */
    travesia: (eje, tit) => data.travesia?.bancos?.[`${eje}/${tit}`] ?? { rango: null, insignias: {} },
    guardarTravesia(eje, tit, r) {
      // Entre aparatos: el rango más alto y las insignias de todos (con la fecha más antigua de cada una).
      registra({ k: 'g', t: Date.now(), b: `${eje}/${tit}`, r: r.rango ?? null, s: { ...(r.insignias ?? {}) } });
    },
    /** Apunta una insignia que no sale de ningún otro dato (la «Guardia de 5 minutos»). Idempotente. */
    ganarInsignia(eje, tit, id, t = new Date().toISOString()) {
      const r = store.travesia(eje, tit);
      if (r.insignias[id]) return false;
      store.guardarTravesia(eje, tit, { rango: r.rango, insignias: { ...r.insignias, [id]: t } });
      return true;
    },

    /** Registra un test completo (simulacro o examen real). */
    recordTest(entry) {
      const t = Date.now();
      registra({ k: 'x', t, e: { ...entry, t: new Date(t).toISOString() } });
    },
    tests: () => data.tests ?? [],

    /** Curso: registro por lección { visto, caja, proximo, ultimo, ultimoAcierto, paso }. */
    leccion: (id) => data.lecciones?.[id],
    lecciones: () => data.lecciones ?? {},
    /** Plan de estudio con fecha (calendario base de src/course/calendario.js), por titulación. Opcional. */
    planEstudio: (tit) => data.planes?.[tit] ?? null,
    setPlanEstudio(tit, plan) { registra({ k: 'v', t: Date.now(), c: 'planes', p: [tit], v: plan }); },
    saveLeccion(id, r) { registra({ k: 'v', t: Date.now(), c: 'lecciones', p: [id], v: r }); },

    /** Suma minutos de estudio al día de hoy (y una actividad); conserva los últimos 60 días. */
    logActividad(minutos, ahora = Date.now()) {
      // Cada aparato suma sus minutos; el pliegue suma los de todos y se queda con los últimos 60 días.
      registra({ k: 'a', t: ahora, d: diaLocal(ahora), m: Math.min(1440, Math.max(0, Math.round(minutos || 0))) });
    },
    minutosHoy: (ahora = Date.now()) => data.dias?.[diaLocal(ahora)]?.min ?? 0,
    /** Días seguidos con actividad, contando hoy o ayer como el último. */
    racha(ahora = Date.now()) {
      const activo = (ms) => (data.dias?.[diaLocal(ms)]?.act ?? 0) > 0;
      let t = activo(ahora) ? ahora : activo(ahora - DIA) ? ahora - DIA : null;
      let n = 0;
      while (t != null && activo(t)) { n += 1; t -= DIA; }
      return n;
    },
    /** Días con actividad posteriores al día de `ms` (0 o undefined = desde siempre). */
    diasConActividadDesde(ms) {
      const desde = ms ? diaLocal(ms) : '';
      return Object.entries(data.dias ?? {}).filter(([k, v]) => k > desde && v.act > 0).length;
    },

    /**
     * Examen a medias (solo uno): { tit, eje, tipo, conv, seed, ids, respuestas, i, consumidoMs, guardado }.
     * `ids`: las preguntas en su orden, para rehacerlo igual aunque cambie el banco (sin ids, con la semilla).
     */
    testEnCurso: () => data.testEnCurso ?? null,
    saveTestEnCurso(obj) {
      // Del aparato: no se sincroniza (un examen a medias se termina donde se empezó).
      if (obj) data.testEnCurso = { ...obj, guardado: Date.now() };
      else delete data.testEnCurso;
      reg.cambiarLocal((l) => { if (data.testEnCurso) l.testEnCurso = data.testEnCurso; else delete l.testEnCurso; });
      save();
    },

    stats(typeId) {
      const e = data.exercises[typeId];
      if (!e) return { attempts: 0, correct: 0, rate: null, streak: 0 };
      return { attempts: e.attempts, correct: e.correct, rate: e.correct / e.attempts, streak: e.streak, mistakes: e.mistakes };
    },

    // Herramientas internas (Ajustes → Avanzado). Con la sincronización:
    //   import  SUMA la copia al progreso (entra como una base más: se fusiona, no sustituye) y la parte del aparato
    //           (ajustes del aparato, examen a medias) se toma de la copia.
    //   reset   borra el progreso de ESTE aparato y lo desune de los otros (código nuevo en la próxima subida): los
    //           otros aparatos y el servidor conservan lo suyo, y nadie más pierde nada por un toque equivocado.
    export: () => JSON.stringify(data, null, 2),
    import(json) {
      const d = JSON.parse(json);
      if (d?.version !== 1) throw new Error('Formato no válido');
      const { compartido, local } = separar({ ...empty(), ...d });
      reg.cambiarLocal((l) => { Object.assign(l.settings, local.settings); if (local.testEnCurso) l.testEnCurso = local.testEnCurso; });
      reg.agregar(crearBase(compartido, { siguienteId: reg.siguienteId }));
      repliega();
      save();
    },
    reset() {
      reg.reiniciar();
      repliega();
      save();
    },
    /** El registro de operaciones (para el motor de sincronización, src/store/sync/motor.js). */
    registro: reg,
  };
  return store;
}

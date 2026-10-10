// Copia LITERAL del almacén de progreso de antes de la sincronización (solo cambian las rutas de los import). Las
// pruebas de equivalencia (tests/sync-plegar.test.js) comprueban que el almacén nuevo da el mismo progress.get().

// Base de datos local del alumno (localStorage): intentos, aciertos y errores típicos por tipo de ejercicio,
// respuestas a preguntas de examen, clases, minutos estudiados por día y el examen a medias.
// Exportable/importable en JSON para no perder el progreso. Los campos nuevos son opcionales: un progreso
// antiguo (version 1) carga sin migración (lo que falta se completa al cargar: el eje, p. ej.).

import { siguienteRepaso, repasoDe } from '../../src/course/repaso.js';
import { diaISO } from '../../src/texto.js';
import { EJE_POR_DEFECTO } from '../../src/bancos/registro.js';
const KEY = 'nautica.progress.v1';
const DIA = 864e5;
const DIAS_GUARDADOS = 60;
const VERSION_TRAVESIA_GUARDADA = 1; // versión del campo `travesia` (v:1 = { v, bancos: { 'eje/tit': { rango, insignias: { id: ISO } } } })

const empty = () => ({ version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1 } });

/** Fecha local 'YYYY-MM-DD' de un instante. */
export const diaLocal = diaISO;

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

export function createProgressStore(storage = safeStorage()) {
  let data = empty();
  try {
    const raw = storage?.getItem(KEY);
    if (raw) data = { ...empty(), ...JSON.parse(raw) };
  } catch { /* datos corruptos: empezamos de cero */ }
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
  normaliza();

  const save = () => { try { storage?.setItem(KEY, JSON.stringify(data)); } catch { /* sin espacio o bloqueado */ } };
  // Con la app abierta en dos pestañas, cada una guardaba su copia entera y la última pisaba las respuestas de la
  // otra. Ahora, cuando otra pestaña guarda, esta se pone al día antes de su próximo cambio.
  const alDia = (raw) => { try { if (raw) { data = { ...empty(), ...JSON.parse(raw) }; normaliza(); } } catch { /* ignorar */ } };
  if (storage && typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('storage', (ev) => { if (ev.key === KEY && ev.newValue) alDia(ev.newValue); });
  }

  const store = {
    get: () => data,
    settings: () => data.settings,
    setSetting(k, v) { data.settings[k] = v; save(); },

    /** Registra el resultado de un intento de ejercicio generado. */
    recordAttempt(typeId, { ok, seed, mistakes = [] }) {
      const e = (data.exercises[typeId] ??= { attempts: 0, correct: 0, streak: 0, mistakes: {}, last: null, history: [] });
      e.attempts += 1;
      if (ok) { e.correct += 1; e.streak += 1; } else { e.streak = 0; }
      for (const m of mistakes) e.mistakes[m] = (e.mistakes[m] ?? 0) + 1;
      e.last = new Date().toISOString();
      e.history = [...e.history, { t: e.last, ok, seed }].slice(-30);
      save();
    },

    /** Registra la respuesta a una pregunta de examen real (choice null = «No la sé»). */
    recordExam(questionId, { choice = null, ok, nivel = false }) {
      const prev = data.exams[questionId];
      // n: veces respondida; ok1: si se acertó la primera vez (lo que mejor predice una pregunta que no has memorizado).
      const n = (prev?.n ?? (prev ? 1 : 0)) + 1;
      const ok1 = prev ? (prev.ok1 ?? prev.ok) : ok;
      // rep: repaso espaciado de fallos (src/course/repaso.js); null = fuera de la cola. Una respuesta del test de nivel
      // (src/course/nivel.js) cuenta como cualquier otra para el dominio, pero no toca la cola: lo que falla un alumno
      // que aún no ha estudiado no es un fallo que repasar mañana (se lo enseña su clase), y lo que ya estaba en la cola
      // sigue igual.
      const rep = nivel ? (prev ? repasoDe(prev, diaLocal()) : null) : siguienteRepaso(prev, ok, diaLocal());
      data.exams[questionId] = { choice, ok, t: new Date().toISOString(), n, ok1, rep, ...(nivel ? { nivel: true } : {}) };
      save();
    },

    /**
     * Test de nivel (src/course/nivel.js) de un eje y una titulación: el resultado guardado (o null) y el test a medias.
     * Uno por banco; repetirlo lo sustituye.
     */
    nivel: (eje, tit) => data.niveles?.[`${eje}/${tit}`] ?? null,
    recordNivel(eje, tit, r) {
      data.niveles = { ...(data.niveles ?? {}), [`${eje}/${tit}`]: r };
      save();
    },

    /** Fichas de idea abiertas (src/course/ficha.js): { [concepto]: ISO } por eje y titulación. */
    fichasVistas: (eje, tit) => data.fichas?.[`${eje}/${tit}`] ?? {},
    recordFichaVista(eje, tit, concepto, t = new Date().toISOString()) {
      const k = `${eje}/${tit}`;
      data.fichas = { ...(data.fichas ?? {}), [k]: { ...(data.fichas?.[k] ?? {}), [concepto]: t } };
      save();
    },

    /**
     * Repaso por concepto (src/course/repaso.js): estado de cada concepto en el banco de un eje y una titulación,
     * { [concepto]: { racha, prox, t } | { fuera: true, t } }. Va aparte de las respuestas (que no cambian): un progreso
     * sin este campo se lee igual y sus fallos se repasan con la fecha de cada pregunta.
     */
    repasoConceptos: (eje, tit) => data.repConceptos?.[`${eje}/${tit}`] ?? {},
    recordRepasoConcepto(eje, tit, concepto, estado) {
      const k = `${eje}/${tit}`;
      data.repConceptos = { ...(data.repConceptos ?? {}), [k]: { ...(data.repConceptos?.[k] ?? {}), [concepto]: estado } };
      save();
    },

    /**
     * Travesía (src/course/travesia.js) de un eje y una titulación: { rango, insignias: { [id]: ISO } }. El rango es el
     * máximo alcanzado (nunca baja) y las insignias, una vez ganadas, se quedan. Un progreso sin este campo se lee igual.
     */
    travesia: (eje, tit) => data.travesia?.bancos?.[`${eje}/${tit}`] ?? { rango: null, insignias: {} },
    guardarTravesia(eje, tit, reg) {
      const antes = data.travesia ?? { v: VERSION_TRAVESIA_GUARDADA, bancos: {} };
      data.travesia = { ...antes, v: antes.v ?? VERSION_TRAVESIA_GUARDADA, bancos: { ...antes.bancos, [`${eje}/${tit}`]: { rango: reg.rango ?? null, insignias: { ...(reg.insignias ?? {}) } } } };
      save();
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
      data.tests = [...(data.tests ?? []), { ...entry, t: new Date().toISOString() }].slice(-50);
      save();
    },
    tests: () => data.tests ?? [],

    /** Curso: registro por lección { visto, caja, proximo, ultimo, ultimoAcierto, paso }. */
    leccion: (id) => data.lecciones?.[id],
    lecciones: () => data.lecciones ?? {},
    /** Plan de estudio con fecha (calendario base de src/course/calendario.js), por titulación. Opcional. */
    planEstudio: (tit) => data.planes?.[tit] ?? null,
    setPlanEstudio(tit, plan) { data.planes = { ...(data.planes ?? {}), [tit]: plan }; save(); },
    saveLeccion(id, reg) {
      data.lecciones = { ...(data.lecciones ?? {}), [id]: reg };
      save();
    },

    /** Suma minutos de estudio al día de hoy (y una actividad); conserva los últimos 60 días. */
    logActividad(minutos, ahora = Date.now()) {
      const hoy = diaLocal(ahora);
      const dias = { ...(data.dias ?? {}) };
      const d = dias[hoy] ?? { min: 0, act: 0 };
      dias[hoy] = { min: d.min + Math.max(0, Math.round(minutos || 0)), act: d.act + 1 };
      const limite = diaLocal(ahora - (DIAS_GUARDADOS - 1) * DIA);
      data.dias = Object.fromEntries(Object.entries(dias).filter(([k]) => k >= limite));
      save();
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
      if (obj) data.testEnCurso = { ...obj, guardado: Date.now() };
      else delete data.testEnCurso;
      save();
    },

    stats(typeId) {
      const e = data.exercises[typeId];
      if (!e) return { attempts: 0, correct: 0, rate: null, streak: 0 };
      return { attempts: e.attempts, correct: e.correct, rate: e.correct / e.attempts, streak: e.streak, mistakes: e.mistakes };
    },

    export: () => JSON.stringify(data, null, 2),
    import(json) { const d = JSON.parse(json); if (d?.version !== 1) throw new Error('Formato no válido'); data = { ...empty(), ...d }; normaliza(); save(); },
    reset() { data = empty(); normaliza(); save(); },
  };
  return store;
}

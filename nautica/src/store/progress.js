// Base de datos local del alumno (localStorage): intentos, aciertos y errores típicos por tipo de ejercicio,
// respuestas a preguntas de examen, clases, minutos estudiados por día y el examen a medias.
// Exportable/importable en JSON para no perder el progreso. Los campos nuevos son opcionales: un progreso
// antiguo (version 1) carga sin migración.

const KEY = 'nautica.progress.v1';
const DIA = 864e5;
const DIAS_GUARDADOS = 60;

const empty = () => ({ version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1 } });

/** Fecha local 'YYYY-MM-DD' de un instante. */
export const diaLocal = (ms = Date.now()) => new Date(ms).toLocaleDateString('sv-SE');

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
  // Usuarios de antes de la bienvenida: no se les muestra.
  const normaliza = () => {
    data.settings ??= {};
    if (data.settings.onboarded == null && tieneProgreso(data)) data.settings.onboarded = true;
  };
  normaliza();

  const save = () => { try { storage?.setItem(KEY, JSON.stringify(data)); } catch { /* sin espacio o bloqueado */ } };

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
    recordExam(questionId, { choice = null, ok }) {
      const prev = data.exams[questionId];
      // n: veces respondida; ok1: si se acertó la primera vez (lo que mejor predice una pregunta que no has memorizado).
      const n = (prev?.n ?? (prev ? 1 : 0)) + 1;
      const ok1 = prev ? (prev.ok1 ?? prev.ok) : ok;
      data.exams[questionId] = { choice, ok, t: new Date().toISOString(), n, ok1 };
      save();
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

    /** Examen a medias (solo uno): { tit, tipo, conv, seed, respuestas, i, consumidoMs, guardado }. */
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
    reset() { data = empty(); save(); },
  };
  return store;
}

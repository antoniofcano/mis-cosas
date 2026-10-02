// Base de datos local del alumno (localStorage): intentos, aciertos y errores típicos por tipo de ejercicio,
// y respuestas a preguntas de examen. Exportable/importable en JSON para no perder el progreso.

const KEY = 'nautica.progress.v1';

const empty = () => ({ version: 1, exercises: {}, exams: {}, settings: { level: 'PER', toleranceFactor: 1 } });

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

export function createProgressStore(storage = safeStorage()) {
  let data = empty();
  try {
    const raw = storage?.getItem(KEY);
    if (raw) data = { ...empty(), ...JSON.parse(raw) };
  } catch { /* datos corruptos: empezamos de cero */ }

  const save = () => { try { storage?.setItem(KEY, JSON.stringify(data)); } catch { /* sin espacio o bloqueado */ } };

  return {
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

    /** Registra la respuesta a una pregunta de examen real. */
    recordExam(questionId, { choice, ok }) {
      data.exams[questionId] = { choice, ok, t: new Date().toISOString() };
      save();
    },

    /** Registra un test completo (simulacro o examen real). */
    recordTest(entry) {
      data.tests = [...(data.tests ?? []), { ...entry, t: new Date().toISOString() }].slice(-50);
      save();
    },
    tests: () => data.tests ?? [],

    /** Curso: registro por lección { visto, caja, proximo, ultimo, ultimoAcierto }. */
    leccion: (id) => data.lecciones?.[id],
    lecciones: () => data.lecciones ?? {},
    saveLeccion(id, reg) {
      data.lecciones = { ...(data.lecciones ?? {}), [id]: reg };
      save();
    },

    stats(typeId) {
      const e = data.exercises[typeId];
      if (!e) return { attempts: 0, correct: 0, rate: null, streak: 0 };
      return { attempts: e.attempts, correct: e.correct, rate: e.correct / e.attempts, streak: e.streak, mistakes: e.mistakes };
    },

    export: () => JSON.stringify(data, null, 2),
    import(json) { const d = JSON.parse(json); if (d?.version !== 1) throw new Error('Formato no válido'); data = { ...empty(), ...d }; save(); },
    reset() { data = empty(); save(); },
  };
}

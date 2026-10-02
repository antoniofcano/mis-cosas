// Acceso a los datos estáticos (carta, exámenes). En el navegador se cargan con fetch y se cachean.
// Los datos viven en /data como JSON: legibles por personas, por la app y por agentes de IA.

const cache = new Map();

async function loadJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(new URL(`../../${path}`, import.meta.url)).then((r) => {
      if (!r.ok) throw new Error(`No se pudo cargar ${path} (${r.status})`);
      return r.json();
    }));
  }
  return cache.get(path);
}

export const loadChartData = () => loadJSON('data/chart-105.json');

/** Índice de bancos de preguntas de examen. */
export const loadExamIndex = () => loadJSON('data/exams/index.json');
export const loadExamBank = (file) => loadJSON(`data/exams/${file}`);

/**
 * Banco completo de teoría PER: preguntas 1–41 (teoría) + 42–45 (carta, UT 11) + explicaciones del profe.
 * Si algún fichero no existe todavía, se devuelve lo que haya.
 */
export async function loadTheoryBank() {
  const opt = (p) => loadJSON(p).catch(() => null);
  const [teoria, carta, expl] = await Promise.all([
    opt('data/exams/andalucia-per-teoria.json'),
    opt('data/exams/andalucia-per.json'),
    opt('data/exams/andalucia-per-teoria-explicaciones.json'),
  ]);
  const preguntas = [...(teoria?.preguntas ?? []), ...(carta?.preguntas ?? []).map((q) => ({ ...q, ut: 11, ut_titulo: 'Carta de navegación' }))];
  return { preguntas, explicaciones: expl ?? {} };
}

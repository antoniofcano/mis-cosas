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

export const loadChartData = () => loadJSON('data/chart-102.json');

/** Índice de bancos de preguntas de examen. */
export const loadExamIndex = () => loadJSON('data/exams/index.json');
export const loadExamBank = (file) => loadJSON(`data/exams/${file}`);

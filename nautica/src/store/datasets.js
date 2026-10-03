// Acceso a los datos estáticos (carta, exámenes). En el navegador se cargan con fetch y se cachean.
// Los datos viven en /data como JSON: legibles por personas, por la app y por agentes de IA.

import { TITULACIONES } from '../theory/blocks.js';
import { compilarVocabulario } from '../theory/vocabulario.js';

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
 * Banco completo de teoría de una titulación (preguntas + explicaciones del profe).
 * PER: preguntas 1–41 (teoría) + 42–45 (carta, UT 11). PY: las 40 de los dos módulos.
 * Si algún fichero no existe todavía, se devuelve lo que haya.
 */
export async function loadTheoryBank(tit = 'per') {
  const d = TITULACIONES[tit]?.datos ?? TITULACIONES.per.datos;
  const opt = (f) => (f ? loadJSON(`data/exams/${f}`).catch(() => null) : null);
  const [teoria, carta, expl, mnemo, vocab] = await Promise.all([opt(d.teoria), opt(d.carta), opt(d.explicaciones), loadMnemonics(), loadVocabulario(tit)]);
  const preguntas = [...(teoria?.preguntas ?? []), ...(carta?.preguntas ?? []).map((q) => ({ ...q, ut: 11, ut_titulo: 'Carta de navegación' }))];
  return { preguntas, explicaciones: expl ?? {}, reglasDe: mnemo.reglasDe, vocab };
}

/** Vocabulario para tocar en las preguntas. El de Yate incluye el del PER (se da por sabido); su matiz manda. */
export async function loadVocabulario(tit = 'per') {
  const listas = await Promise.all((tit === 'py' ? ['per', 'py'] : ['per']).map((t) => loadJSON(`data/exams/vocabulario-${t}.json`).then((d) => d.terminos ?? []).catch(() => [])));
  const porId = new Map();
  for (const t of listas.flat()) porId.set(t.id, t);
  return compilarVocabulario([...porId.values()]);
}

/** Curso de una titulación (módulos y lecciones); null si aún no existe. */
export const loadCourse = (tit) => loadJSON(`data/curso/${tit}.json`).catch(() => null);

/** Reglas nemotécnicas validadas y, para cada pregunta, las que le ayudan. */
export async function loadMnemonics() {
  const d = await loadJSON('data/exams/mnemotecnias.json').catch(() => ({ reglas: [] }));
  const byQ = new Map();
  for (const r of d.reglas) for (const id of r.preguntas ?? []) byQ.set(id, [...(byQ.get(id) ?? []), r]);
  return { reglas: d.reglas, reglasDe: (id) => byQ.get(id) ?? [] };
}

/** Podcasts de una titulación: temas, episodios con su ficha y si ya tienen audio (sale de tools/podcast.mjs). */
export const loadPodcast = (tit) => loadJSON(`data/podcast-${tit}.json`);
/** Línea de tiempo de un episodio: cuándo empieza cada intervención y las pausas del minijuego. */
export const loadPodcastLinea = (id) => loadJSON(`data/podcast/${id}.json`);

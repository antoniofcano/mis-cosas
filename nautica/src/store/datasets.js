// Acceso a los datos estáticos (carta, exámenes). En el navegador se cargan con fetch y se cachean.
// Los datos viven en /data como JSON: legibles por personas, por la app y por agentes de IA.

import { TITULACIONES } from '../theory/blocks.js';

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
  const [teoria, carta, expl, mnemo] = await Promise.all([opt(d.teoria), opt(d.carta), opt(d.explicaciones), loadMnemonics()]);
  const preguntas = [...(teoria?.preguntas ?? []), ...(carta?.preguntas ?? []).map((q) => ({ ...q, ut: 11, ut_titulo: 'Carta de navegación' }))];
  return { preguntas, explicaciones: expl ?? {}, reglasDe: mnemo.reglasDe };
}

/** Reglas nemotécnicas validadas y, para cada pregunta, las que le ayudan. */
export async function loadMnemonics() {
  const d = await loadJSON('data/exams/mnemotecnias.json').catch(() => ({ reglas: [] }));
  const byQ = new Map();
  for (const r of d.reglas) for (const id of r.preguntas ?? []) byQ.set(id, [...(byQ.get(id) ?? []), r]);
  return { reglas: d.reglas, reglasDe: (id) => byQ.get(id) ?? [] };
}

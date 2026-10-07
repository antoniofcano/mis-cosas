// Acceso a los datos estáticos (carta, curso, podcasts). En el navegador se cargan con fetch y se cachean.
// Los datos viven en /data como JSON: legibles por personas, por la app y por agentes de IA.
// Las preguntas de examen (bancos por eje) se piden al motor de bancos: src/bancos.

import { cargarCursoBase, cargarMnemotecnias, cargarVocabulario } from '../bancos/index.js';

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

/** Vocabulario para tocar en las preguntas (comunes a todos los ejes). */
export const loadVocabulario = cargarVocabulario;

/** Curso nacional de una titulación (módulos y lecciones, sin la práctica del eje); null si aún no existe. */
export const loadCourse = cargarCursoBase;

/** Reglas nemotécnicas validadas y, para cada pregunta, las que le ayudan. */
export const loadMnemonics = cargarMnemotecnias;

/** Chuleta de la práctica: fórmulas, signos y conversiones por tema y por tipo de ejercicio. */
export const loadChuletario = () => loadJSON('data/comun/chuletario.json');

/** Siglas y abreviaturas con su significado (se explican al tocarlas). */
export const loadAbreviaturas = () => loadJSON('data/comun/abreviaturas.json');

/** Podcasts de una titulación: temas, episodios con su ficha y si ya tienen audio (sale de tools/podcast.mjs). */
export const loadPodcast = (tit) => loadJSON(`data/podcast-${tit}.json`);
/** Línea de tiempo de un episodio: cuándo empieza cada intervención y las pausas del minijuego. */
export const loadPodcastLinea = (id) => loadJSON(`data/podcast/${id}.json`);

/** Apéndice «Las cuentas del patrón» (clases de matemáticas; fuera del temario del examen). */
export const loadApendice = () => loadJSON('data/curso/apendice-matematicas.json');

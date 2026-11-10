// Interfaz del «Simulacro de tus errores» (R-43). La lógica (qué errores, qué preguntas, cuánto tiempo, corrección)
// está en src/course/simulacro-errores.js; el índice, en data/ejes/<eje>/<tit>/distractores.json; los errores del
// alumno, en src/store/errores.js. El examen en marcha es el de siempre (testView de src/ui/views/theory.js, ruta
// #/<tit>/test/errores?s=<semilla>): reloj, sin ayudas y corrección al final. Aquí van las piezas propias: la entrada
// (Examen y Mi progreso), lo que se dice antes de empezar, lo que se apunta al corregir y el aviso de cada fallada.

import { h } from './dom.js';
import { link } from './router.js';
import { tlink } from './titulacion.js';
import { conIcono } from './iconos.js';
import { randomSeed, createRng } from '../math/rng.js';
import { cuenta } from '../texto.js';
import { ERRORES, fraseOtraVez } from '../exams/taxonomia.js';
import { erroresAlumno } from '../store/errores.js';
import { armarSimulacroErrores, minutosSimulacro, corregirErrores, textoMotivo, estructuraErrores, TITULO } from '../course/simulacro-errores.js';

export { estructuraErrores };

const nombre = (id) => ERRORES[id]?.nombre ?? id;
// «Signo de la Ct» → «signo de la Ct» (solo la inicial: las siglas se quedan).
const enFrase = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const lista = (ids) => ids.map((id) => enFrase(nombre(id))).join(', ');

/** «Simulacro de tus errores»: enlace con una línea de qué lleva. `donde`: 'examen' | 'progreso'. */
export function entradaSimulacroErrores(tit, { donde = 'examen' } = {}) {
  const r = erroresAlumno().resumen();
  const vivos = r.errores.slice(0, 3).map((e) => e.id);
  const linea = vivos.length
    ? `Preguntas cuyas opciones falsas son tus errores (${lista(vivos)}): para que no vuelvas a caer. No cuenta como simulacro aprobado.`
    : 'Aún no tienes errores registrados: te pongo las trampas que más ponen los tribunales (el signo de la Ct, del desvío o de la declinación, el abatimiento al revés…). No cuenta como simulacro aprobado.';
  return h('div.sim-errores-entrada', { class: donde },
    h('a.btn.secondary', { href: tlink(tit, ['test', 'errores'], { s: randomSeed() }) }, conIcono('diana', TITULO)),
    h('p.small.muted', linea));
}

/**
 * Arma el simulacro para el examen: { test, estructura, guardar } o null si no hay índice para el banco.
 * `guardar`: lo que va en el examen a medias (testEnCurso.errores) para corregirlo igual aunque cambien tus errores.
 */
export function armarParaTest({ banco, indice, respuestas, seed, T }) {
  const test = armarSimulacroErrores({ indice, estudio: banco.estudio, resumen: erroresAlumno().resumen(), respuestas, rng: createRng(seed) });
  const min = minutosSimulacro(test.preguntas, T);
  return { test, estructura: estructuraErrores(T.estructura, min), guardar: { modo: test.modo, motivo: test.motivo, min, objetivos: test.objetivos, tuyos: test.tuyos, errores: test.errores.map((e) => e.id) } };
}


/** Lo que se dice antes de empezar: con qué errores y por qué (o por qué no con los tuyos). */
export function introErrores(test) {
  const motivo = textoMotivo(test.motivo, { n: test.veces });
  return h('div.sim-errores-intro',
    motivo ? h('p.aviso-sim-errores', motivo, ' En su lugar, ', h('strong', 'las trampas que más ponen los tribunales'), ' en tus preguntas:') : h('p', 'Cada pregunta tiene entre sus opciones falsas uno de tus errores más repetidos:'),
    h('ul.sim-errores-lista', test.errores.filter((e) => e.puestas).map((e) => h('li', h('span.error-nombre', nombre(e.id)), h('span.error-n', cuenta(e.puestas, 'pregunta'))))),
    h('p.small.muted', 'Sin ayudas, con reloj (el ritmo de tu estrategia). No es un examen con el reparto oficial: no cuenta como simulacro aprobado. Si aciertas una pregunta cuya trampa era tu error, ese error baja uno en «Tus errores más repetidos».'));
}

/**
 * Al terminar: corrige y apunta en tus errores lo que pasó (src/store/errores.js): caer en un error típico lo apunta
 * (una vez por pregunta y día); acertar una pregunta cuya trampa era tu error lo da por superado una vez.
 */
export function registrarErrores({ test, respuestas, indice, guardado }) {
  const c = corregirErrores({ preguntas: test.preguntas, respuestas, indice, objetivos: guardado?.objetivos ?? {}, tuyos: guardado?.tuyos ?? [] });
  const almacen = erroresAlumno();
  for (const q of test.preguntas) {
    const x = c.porPregunta[q.id];
    if (x.cayo) almacen.error(q.id, x.cayo);
    for (const e of x.esquivados) almacen.superado(q.id, e);
  }
  return c;
}

/** Bloque del resultado: cuántas trampas esquivaste de cada error y la advertencia de que no da apto. */
export function resultadoErrores(c) {
  const filas = c.balance.filter((b) => b.puestas).sort((a, b) => b.puestas - a.puestas);
  return h('section.sim-errores-resultado',
    h('p.muted', 'Simulacro de tus errores: no es un examen con el reparto oficial y no cuenta como simulacro aprobado.'),
    filas.length ? h('ul.sim-errores-lista', filas.map((b) => h('li', { class: b.caidas ? 'caido' : b.esquivadas === b.puestas ? 'esquivado' : '' },
      h('span.error-nombre', nombre(b.id)),
      h('span.error-n', `${b.esquivadas} de ${b.puestas} acertadas`),
      b.caidas ? h('span.error-si.small', `Caíste ${cuenta(b.caidas, 'vez', 'veces')} en él.`) : null))) : null,
    h('p.small.muted', 'Lo acertado baja ese error en «Tus errores más repetidos» (Mi progreso); lo que vuelves a fallar lo sube.'));
}

/** Aviso de una pregunta fallada en la revisión: «Has vuelto a…» (o el error típico en que caíste) y «Resolver paso a paso». */
export function avisoFallada(q, x) {
  if (!x || x.ok) return null;
  const texto = x.cayo ? (x.otraVez ? fraseOtraVez(x.cayo) : `Has caído en «${nombre(x.cayo)}»: es lo que sale si ${ERRORES[x.cayo].si}.`) : null;
  return h('div.vuelta-error', { role: 'note' },
    texto ? h('p', conIcono('lupa', texto)) : null,
    h('p', h('a.btn.secondary', { href: link(['q', q.id], { guiado: '1' }) }, conIcono('diana', 'Resolver paso a paso'))));
}

/** Línea para el resumen de IA del resultado. */
export function textoErrores(c) {
  const caidas = Object.entries(c.porPregunta).filter(([, x]) => x.cayo).map(([id, x]) => `${id}: ${x.cayo}${x.otraVez ? ' (otra vez)' : ''}`);
  return `SIMULACRO DE TUS ERRORES (no cuenta como aprobado) · ${c.balance.map((b) => `${b.id} ${b.esquivadas}/${b.puestas}`).join(', ')}${caidas.length ? ` · CAYÓ: ${caidas.join(', ')}` : ''}`;
}

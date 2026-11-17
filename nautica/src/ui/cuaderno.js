// Cuaderno de fallos en la interfaz (R-55, R-56): anotar los fallos con nombre desde donde se diagnostican (paso a paso,
// opción marcada, ejercicios generados, simulacros, exámenes y tu examen oficial), la tarjeta de Hoy y lo que se dice en
// el resultado de un examen. La lógica está en src/course/cuaderno.js; las tarjetas de la dosis, en src/course/dosis.js;
// la pantalla, en src/ui/views/fallos.js. Se guarda en el progreso como ajuste compartido `fallo_<id>` (docs/SYNC.md).

import { h } from './dom.js';
import { conIcono } from './iconos.js';
import { tlink } from './titulacion.js';
import { anotar, dosisHecha, comprobacionHecha, claveFallo, idFallo, nombreFallo, cuadernoDe, falloValido } from '../course/cuaderno.js';
import { diagnosticar } from '../exams/diagnostico.js';
import { SOLUCIONES } from '../bancos/soluciones.js';
import { tipoDePregunta } from '../course/velocidad.js';
import { cuenta, fechaLarga } from '../texto.js';

let progreso = null;
/** app.js lo fija al arrancar: el almacén del progreso donde se guardan los fallos. */
export function fijarProgresoCuaderno(p) { progreso = p; }
const ahora = () => Date.now();

/** Tipo de problema de una pregunta real: el ejercicio de su resolución o «carta». */
export const tipoDeFallo = (q) => tipoDePregunta(q, SOLUCIONES[q?.id], { deCarta: true });

/**
 * Anota una vez de un fallo en el cuaderno. Devuelve { id, nuevo, reabierto, contado, nombre } o null (sin almacén, o un
 * error que no es de la taxonomía).
 */
export function anotarFallo({ error, tipo, origen, q = null }, progress = progreso) {
  if (!progress) return null;
  const s = progress.settings();
  const r0 = anotar(null, { error, tipo, origen, q }, ahora());
  if (!r0) return null;
  const id = idFallo(r0.f.e, r0.f.y);
  const r = anotar(s[claveFallo(id)] ?? null, { error, tipo, origen, q }, ahora());
  if (r.contado) progress.setSetting(claveFallo(id), r.f);
  return { id, nuevo: r.nuevo, reabierto: r.reabierto, contado: r.contado, nombre: nombreFallo(r.f) };
}

/** El fallo guardado (o null). */
export function falloDe(id, progress = progreso) {
  const f = progress?.settings()[claveFallo(id)];
  return falloValido(f) ? f : null;
}

export function registrarDosis(id, { aciertos, total }, progress = progreso) {
  const f = falloDe(id, progress);
  if (!f) return null;
  const g = dosisHecha(f, { aciertos, total }, ahora());
  progress.setSetting(claveFallo(id), g);
  return g;
}

export function registrarComprobacion(id, { ok, q = null }, progress = progreso) {
  const f = falloDe(id, progress);
  if (!f) return null;
  const g = comprobacionHecha(f, { ok, q }, ahora());
  progress.setSetting(claveFallo(id), g);
  return g;
}

/** La opción falsa marcada en una pregunta real, con diagnóstico único, al cuaderno. null si no hay diagnóstico seguro. */
export function anotarOpcion(q, marcada, { chart, origen = 'pregunta' } = {}, progress = progreso) {
  const sol = SOLUCIONES[q?.id];
  if (!sol || !marcada || !chart) return null;
  let d;
  try { d = diagnosticar(q, marcada, { sol, chart }); } catch { return null; }
  if (d.estado !== 'unico') return null;
  return anotarFallo({ error: d.tipos[0], tipo: tipoDeFallo(q), origen, q: q.id }, progress);
}

/**
 * Los fallos diagnosticados de un examen corregido (simulacro, convocatoria, examen final, ensayo, tu examen oficial),
 * al cuaderno. Uno por fallo distinto, con las veces de este examen: [{ id, nombre, nuevo, reabierto, veces }].
 */
export function anotarFallosDeExamen({ preguntas, detalle, chart, origen }, progress = progreso) {
  const out = new Map();
  preguntas.forEach((q, j) => {
    const d = detalle[j];
    if (!d || d.ok || !d.respuesta || d.retirada) return;
    const r = anotarOpcion(q, d.respuesta, { chart, origen }, progress);
    if (!r) return;
    const x = out.get(r.id) ?? { ...r, veces: 0 };
    x.veces += 1;
    x.nuevo ||= r.nuevo; x.reabierto ||= r.reabierto;
    out.set(r.id, x);
  });
  return [...out.values()];
}

/** Lo que se dice en el resultado de un examen: qué fallos con nombre han entrado y cuál se abre. null si ninguno. */
export function seccionCuadernoExamen(tit, anotados) {
  if (!anotados?.length) return null;
  const abiertos = anotados.filter((x) => x.nuevo || x.reabierto);
  return h('section.cuaderno-examen', { 'aria-labelledby': 'cuaderno-examen-t' },
    h('h2#cuaderno-examen-t', conIcono('diana', 'A tu cuaderno de fallos')),
    abiertos.length ? h('p', `Se ${abiertos.length === 1 ? 'abre' : 'abren'}: `, abiertos.map((x, i) => [i ? ', ' : '', h('strong', `«${x.nombre.titulo}»`)]), '. Te toca una dosis de 2 minutos.') : null,
    h('ul.cuaderno-examen-lista', anotados.map((x) => h('li', h('span.cx-nombre', x.nombre.titulo), h('span.small.muted', ` · ${x.nombre.donde} · ${cuenta(x.veces, 'vez')} en este examen`)))),
    h('p', h('a.btn.secondary', { href: tlink(tit, ['fallos']) }, 'Ver tu cuaderno de fallos')));
}

/** Texto para el resumen de IA de un resultado. */
export const textoCuadernoExamen = (anotados) => (anotados?.length ? `\nCUADERNO DE FALLOS: ${anotados.map((x) => `${x.id}${x.nuevo ? ' (nuevo)' : x.reabierto ? ' (reabierto)' : ''} ×${x.veces}`).join(', ')}` : '');

/** Tarjeta breve de Hoy: dosis y comprobaciones pendientes. null si no hay nada que hacer hoy. */
export function tarjetaCuaderno(tit, cuad) {
  if (!cuad || (!cuad.dosis.length && !cuad.comprobar.length)) return null;
  const filas = [...cuad.comprobar.map((f) => ({ f, que: 'comprobar' })), ...cuad.dosis.map((f) => ({ f, que: 'dosis' }))].slice(0, 1); // Hoy: una sola (H-74); el resto, en el cuaderno
  const resto = cuad.comprobar.length + cuad.dosis.length - filas.length;
  return h('section.tarjeta-cuaderno', { 'aria-labelledby': 'tarjeta-cuaderno-t' },
    h('h2#tarjeta-cuaderno-t', conIcono('diana', 'Tu cuaderno de fallos')),
    h('ul.tc-lista', filas.map(({ f, que }) => {
      const n = nombreFallo(f);
      return h('li.tc-fila',
        h('span.tc-tx', h('strong', n.titulo), h('span.small.muted', que === 'comprobar' ? ' · toca comprobarlo' : ` · ${cuenta(f.n, 'vez')}`)),
        h('a.btn.small', { class: que === 'comprobar' ? '' : 'secondary', href: tlink(tit, ['fallos', que, f.id]) }, que === 'comprobar' ? 'Comprobar' : 'Dosis de 2 min'));
    })),
    h('p.small', h('a', { href: tlink(tit, ['fallos']) }, resto > 0 ? `Ver el cuaderno (${resto} más) →` : 'Ver el cuaderno →')));
}

/** «Te lo compruebo el jueves 19 de noviembre…» */
export const fraseProxima = (prox, t = ahora()) => (prox ? fechaLarga(prox, { ahora: t }) : null);

/** El cuaderno desde el progreso. */
export const cuadernoActual = (progress = progreso, t = ahora()) => cuadernoDe(progress?.settings() ?? {}, t);

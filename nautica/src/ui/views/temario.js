// Temario: #/<tit>/temario (lista de temas) y #/<tit>/temario/<ut> (página de un tema: clases,
// preguntas de examen y material de apoyo). Une lo que antes eran «Curso» y «Teoría».

import { chuletaView } from './chuleta.js';
import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { estadoLeccion } from '../../course/engine.js';
import { estadoTema, parteTema, TANDA } from '../../course/plan.js';
import { bloque, bloquesEnOrden } from '../../theory/blocks.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { calcularPlan } from '../cierre.js';
import { cargarMapas } from './mapas.js';
import { mapasDeClases } from '../../course/mapas.js';
import { episodiosDeTema, enlaceEpisodio } from './podcast.js';
import { estadoEpisodio } from '../radio.js';

const ESTADO_TXT = { nueva: 'sin empezar', empezada: 'a medias', vista: 'vista · falta practicarla', repasar: 'toca repasar', dominada: 'aprendida' };
const ESTADO_CLS = { dominada: 'ok', vista: 'ok', repasar: 'warn', empezada: 'close' };

/** Línea de estado de un tema (§4.2): cuántas clases lleva y, con datos suficientes, cuánto acierta (no es el avance). */
export function lineaEstado(e) {
  const clases = e.clases.total ? `${e.clases.terminadas} de ${e.clases.total} clases` : null;
  const juntar = (...xs) => xs.filter(Boolean).join(' · ');
  switch (e.estado) {
    case 'sin-empezar': return 'Sin empezar';
    case 'bien': return juntar('Vas bien', clases, `aciertas el ${e.pct} %`);
    case 'repasar': return juntar('Conviene repasar', clases, `aciertas el ${e.pct} %`);
    default: return juntar('En marcha', clases, e.hechas ? `${e.hechas} preguntas hechas` : null);
  }
}
const ESTADO_TEMA_CLS = { bien: 'ok', repasar: 'warn' };

// ---------------------------------------------------------------------------
// #/<tit>/temario

export function temarioView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.temario', h('h1', `Temario del ${T.sigla}`), h('p.muted', 'Cargando…'));
  let summaryText = `VISTA temario ${T.sigla} (cargando)`;
  calcularPlan(progress, tit).then((d) => {
    const hoyUt = d.plan[0]?.ut ?? null;
    const filas = bloquesEnOrden(T.estructura).map((b) => ({ b, e: estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora) }));
    summaryText = `VISTA temario ${T.sigla}\n${filas.map(({ b, e }) => `${b.ut} ${b.titulo}: examen ${b.n}${b.maxErrores != null ? ` (máx ${b.maxErrores} err)` : ''} · ${e.estado} · hechas ${e.hechas}/${e.total} · acierto ${e.pct ?? '—'}${e.clases.total ? ` · clases ${e.clases.vistas}/${e.clases.total}` : ''}${b.ut === hoyUt ? ' · HOY TOCA' : ''}`).join('\n')}` +
      `\nRUTAS: #/${tit}/temario/<n> tema · #/${tit}/teoria/ut/<n>?s=<semilla>[&f=1] tanda de ${TANDA} preguntas`;
    setChildren(el,
      h('h1', `Temario del ${T.sigla}`),
      h('p.muted', 'En el orden en que te recomendamos estudiarlo: primero lo que más pesa en el examen y más práctica pide.'),
      h('div.lista-temas', filas.map(({ b, e }) => h('a.card.tema-card', { href: tlink(tit, ['temario', String(b.ut)]) },
        b.ut === hoyUt ? h('span.badge.hoy-toca', 'Hoy toca') : null,
        h('h3', `${b.icon} ${b.titulo}`),
        h('p', `Tema ${b.ut} del temario oficial · ${b.n} preguntas en el examen${b.maxErrores != null ? ` · ¡ojo!, solo se pueden fallar ${b.maxErrores}` : ''}`),
        h('p.estado-linea', { class: ESTADO_TEMA_CLS[e.estado] ?? '' }, lineaEstado(e)),
        e.estado !== 'sin-empezar' ? h('div.bar', { title: 'Camino hasta tener el tema al día' }, h('span', { style: `width:${Math.round(100 * parteTema(e))}%` })) : null))),
      h('details', h('summary', 'Reglas del examen'), h('ul', T.reglas.map((r) => h('li', r)))),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// #/<tit>/temario/<ut>

const lista = (xs) => (xs.length > 4 ? `${xs.slice(0, 3).join(', ')} y ${xs.length - 3} conceptos más` : xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`);

export function temaView({ progress, params: route, tit }) {
  if (route.parts[2] === 'chuleta') return chuletaView({ tit, params: route, progress });
  const T = TITULACIONES[tit];
  const ut = Number(route.parts[1]);
  const b = bloque(T.estructura, ut);
  if (!b) return { el: h('div.tema', volver('Temario', tlink(tit, ['temario'])), h('p', 'Este tema no existe.')), summary: () => 'ERROR tema no encontrado' };
  const el = h('div.tema', volver('Temario', tlink(tit, ['temario'])), h('h1', `${b.icon} ${b.titulo}`), h('p.muted', 'Cargando…'));
  let summaryText = `VISTA tema ${T.sigla} ${b.titulo} (cargando)`;
  calcularPlan(progress, tit).then((d) => {
    const m = d.curso?.modulos?.find((x) => x.ut === ut);
    const clases = (m?.lecciones ?? []).map((l) => ({ l, e: estadoLeccion(l, d.regs[l.id], d.respuestas, d.ahora) }));
    const e = estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora);
    const aMedias = clases.find((c) => c.e.estado === 'empezada');
    const nueva = clases.find((c) => c.e.estado === 'nueva');
    const tanda = tlink(tit, ['teoria', 'ut', String(ut)], { s: randomSeed() });
    const principal = aMedias ? h('a.btn.grande', { href: tlink(tit, ['curso', aMedias.l.id]) }, `Continuar: ${aMedias.l.titulo}`)
      : nueva ? h('a.btn.grande', { href: tlink(tit, ['curso', nueva.l.id]) }, `Empezar: ${nueva.l.titulo}`)
        : h('a.btn.grande', { href: tanda }, `Hacer ${TANDA} preguntas`);
    summaryText = `VISTA tema ${T.sigla} ${b.titulo} · examen ${b.n}${b.maxErrores != null ? ` (máx ${b.maxErrores} err)` : ''} · ${e.estado} · hechas ${e.hechas}/${e.total} · fallos pendientes ${e.fallos}\n` +
      clases.map(({ l, e: x }) => `CLASE ${l.id} ${l.titulo}: ${x.estado} → #/${tit}/curso/${l.id}`).join('\n');
    // Los mapas de conceptos con nodos en las clases del tema (llegan cuando cargan).
    const mapasTema = h('div.cards', { hidden: true });
    cargarMapas().then((mapas) => {
      const xs = mapasDeClases(mapas, clases.map((c) => c.l.id), tit);
      if (!xs.length) return;
      setChildren(mapasTema, xs.map(({ mapa, nodos }) => h('a.card', { href: tlink(tit, ['mapas', mapa.id], { v: 'mapa', n: nodos[0].id }) },
        h('h3', `🕸️ Mapa del tema: ${mapa.titulo}`), h('p', `Cómo se relacionan ${lista(nodos.map((n) => n.nombre))} con lo demás.`))));
      mapasTema.hidden = false;
      summaryText += `\nMAPAS: ${xs.map((x) => x.mapa.titulo).join('; ')}`;
    }).catch(() => {});
    // Los podcasts del tema: el panorama primero y los que profundizan (los que ya tienen audio).
    const radioTema = h('section.radio-tema', { hidden: true });
    episodiosDeTema(tit, ut).then((eps) => {
      const conAudio = eps.filter((e) => e.audio);
      if (!conAudio.length) return;
      const pan = conAudio.find((e) => e.tipo === 'panorama');
      const resto = conAudio.filter((e) => e !== pan);
      const fila = (e) => h('a.radio-tema-ep', { href: enlaceEpisodio(tit, e, `temario/${ut}`) },
        h('span', { 'aria-hidden': 'true' }, estadoEpisodio(e.id).oido ? '✓' : e.tipo === 'panorama' ? '🗼' : '🛟'),
        h('span', h('strong', `${e.n} · ${e.titulo}`), h('span.muted.small', ` · ${Math.round(e.duracion / 60)} min`)));
      // En la lista de clases, unos auriculares en las que tienen su episodio.
      for (const e of conAudio.filter((x) => x.tipo === 'profundiza')) {
        for (const lid of e.lecciones) { const m = el.querySelector(`.clase-podcast[data-clase="${lid}"]`); if (m) m.hidden = false; }
      }
      setChildren(radioTema, h('h2', '🎧 Escúchalo'),
        h('p.muted.small', pan ? 'Empieza por el panorama para situarte; luego, cada episodio va con sus clases.' : 'Cada episodio va con sus clases.'),
        pan ? fila(pan) : null, resto.map(fila),
        conAudio.length < eps.length ? h('p.muted.small', `${eps.length - conAudio.length} episodios más de este tema en el astillero.`) : null);
      radioTema.hidden = false;
      summaryText += `\nPODCASTS: ${conAudio.map((e) => `${e.n} ${e.titulo}`).join('; ')}`;
    }).catch(() => {});
    setChildren(el,
      volver('Temario', tlink(tit, ['temario'])),
      h('h1', `${b.icon} ${b.titulo}`),
      m?.intro ? h('p', m.intro) : null,
      principal,
      clases.length ? h('section', h('h2', 'Clases'), h('ol.clases', clases.map(({ l, e: x }) => h('li', h('a.clase', { href: tlink(tit, ['curso', l.id]) },
        h('span.clase-titulo', l.titulo),
        h('span.clase-meta', h('span.muted', `${l.minutos ?? 10} min`), h('span.clase-podcast', { 'data-clase': l.id, hidden: true, title: 'Tiene podcast' }, '🎧'),
          h('span.estado', { class: ESTADO_CLS[x.estado] ?? '' }, ESTADO_TXT[x.estado]))))))) : null,
      h('section', h('h2', 'Preguntas de examen'),
        e.hechas ? h('p', `${e.hechas} de ${e.total} hechas`) : null,
        h('div.actions',
          h('a.btn.secondary', { href: tanda }, `Hacer ${TANDA} preguntas`),
          e.fallos ? h('a.btn.secondary', { href: tlink(tit, ['teoria', 'ut', String(ut)], { s: randomSeed(), f: '1' }) }, `Repasar mis fallos (${e.fallos})`) : null)),
      radioTema,
      h('p', h('a.btn.secondary', { href: tlink(tit, ['temario', String(ut), 'chuleta']) }, '🖨️ Chuleta del tema para imprimir')),
      mapasTema,
      ut === T.cartaUt ? h('a.card', { href: tlink(tit, ['carta']) }, h('h3', '🗺️ Ejercicios de carta'), h('p', 'Practica cada tipo de ejercicio sobre la carta del Estrecho.')) : null,
      h('section', h('h2', 'Para ayudarte'),
        h('div.cards',
          h('a.card', { href: tlink(tit, ['laminas']) }, h('h3', '🎞️ Láminas')),
          h('a.card', { href: link(['reglas']) }, h('h3', '🧠 Reglas para recordar')),
          ut === T.cartaUt ? h('a.card', { href: link(['conceptos']) }, h('h3', '📘 Conceptos de carta')) : null)),
    );
  }).catch((err) => setChildren(el, h('p.warn', `No se pudo cargar el tema: ${err.message}`)));
  return { el, summary: () => summaryText };
}

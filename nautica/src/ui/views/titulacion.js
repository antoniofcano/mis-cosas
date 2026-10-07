// Ejercicios de carta de una titulación (#/<tit>/carta).

import { h } from '../dom.js';
import { link } from '../router.js';
import { exercisesByCategory } from '../../exercises/registry.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink, volver, currentEje } from '../titulacion.js';
import { cargarBanco } from '../../bancos/index.js';

// ---------------------------------------------------------------------------
// #/<tit>/carta — ejercicios prácticos de carta por tipo

export function cartaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const cats = exercisesByCategory(T.nivel);
  const lines = [];
  // Preguntas reales de carta: la lista de carta del eje si la tiene (PER); si no, la tanda del tema de carta.
  const tandaCarta = () => h('a.card', { href: tlink(T.id, ['teoria', 'ut', String(T.cartaUt)], { s: randomSeed() }) }, h('h3', '📄 Preguntas reales de carta'), h('p', 'Las preguntas 11–20 del módulo de navegación (carta, mareas y loxodrómica) de los exámenes del PY.'));
  const reales = h('span.reales-carta', { style: 'display:contents' });
  cargarBanco(currentEje(progress), T.id).then((banco) => {
    const l = banco.lista('carta');
    reales.replaceChildren(l
      ? h('a.card', { href: tlink(T.id, ['examenes', l.id]) }, h('h3', '📄 Preguntas reales de carta'), h('p', (l.tarjeta ?? l.descripcion ?? '').replace('{n}', String(l.preguntas.length))))
      : tandaCarta());
  }).catch(() => reales.replaceChildren(tandaCarta()));
  const el = h('div.home',
    volver('Biblioteca', tlink(T.id, ['biblioteca'])),
    h('h1', `🗺️ Carta de navegación · ${T.sigla}`),
    h('p', 'Cada tipo de ejercicio con datos nuevos cada vez sobre la carta del Estrecho (L105). Compruebas tus respuestas, pides pistas, ves la construcción en la carta y el tutorial te lo resuelve como en el examen, con el profe explicándolo.'),
    h('div.cards',
      h('a.card', { href: link(['mesa']) }, h('h3', '🧰 Mesa de cartas libre'), h('p', 'La carta con todos los instrumentos para trazar a tu aire.')),
      reales),
    cats.map((c) => h('section.category',
      h('h2', `${c.icon} ${c.title}`),
      h('p.muted', c.blurb),
      h('div.cards', c.exercises.map((e) => {
        const st = progress.stats(e.id);
        lines.push(`${e.id}: ${e.title} [${e.levels.join('/')}] intentos=${st.attempts} aciertos=${st.correct}`);
        return h('a.card', { href: link(['ej', e.id]) },
          h('h3', e.title),
          h('p', e.summary),
          h('div.meta',
            h('span.diff', { title: 'Dificultad' }, '●'.repeat(e.difficulty) + '○'.repeat(3 - e.difficulty)),
            st.attempts ? h('span.stat', `${st.correct}/${st.attempts} ✓`) : null));
      })))),
  );
  return { el, summary: () => `VISTA carta ${T.sigla}\nTIPOS DE EJERCICIO:\n${lines.join('\n')}\nRUTAS: #/ej/<id>?s=<semilla> · #/mesa` };
}

import { h } from '../dom.js';
import { exercisesByCategory } from '../../exercises/registry.js';
import { link } from '../router.js';

export function homeView({ progress }) {
  const level = progress.settings().level;
  const cats = exercisesByCategory(level);
  const lines = [];
  const view = h('div.home',
    h('section.intro',
      h('h1', 'Ejercicios de carta náutica'),
      h('p', 'Practica cada tipo de ejercicio con datos nuevos cada vez, sobre la zona del Estrecho (carta L105). Comprueba tus respuestas, pide pistas paso a paso y mira la construcción gráfica. Después, entrénate con las preguntas reales de examen de Andalucía.'),
      h('p', h('a.btn', { href: link(['examenes']) }, '📝 Preguntas de examen reales'), ' ', h('a.btn.secondary', { href: link(['carta']) }, '🗺️ Carta y medición')),
    ),
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
            st.attempts ? h('span.stat', `${st.correct}/${st.attempts} ✓`) : h('span.stat.muted', 'sin intentos'),
          ),
        );
      })),
    )),
  );
  return { el: view, summary: () => `VISTA inicio · nivel=${level}\nTIPOS DE EJERCICIO:\n${lines.join('\n')}\nRUTAS: #/ej/<id>?s=<semilla> · #/examenes · #/teoria · #/progreso · #/carta` };
}

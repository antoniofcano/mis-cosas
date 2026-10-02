// #/mas — Más: biblioteca de apoyo, tu estudio (fecha del examen y minutos al día), titulación,
// voz del profe y copia de seguridad. Es la única pantalla con el pie de página.

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { voice, spanishVoices } from '../voice.js';
import { botonesMinutos } from './bienvenida.js';
import { guardarCopia, botonRecuperar } from '../copia.js';
import { puedeInstalar, alCambiarInstalable, instalar } from '../pwa.js';

export function masView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();

  const minutos = h('div');
  const pintaMinutos = () => setChildren(minutos, botonesMinutos(progress.settings().minutosDia ?? 20, (m) => { progress.setSetting('minutosDia', m); pintaMinutos(); }));
  pintaMinutos();
  const fecha = h('input', { type: 'date', id: 'fecha-examen', value: s[`examen_${tit}`] ?? '', onchange: (ev) => progress.setSetting(`examen_${tit}`, ev.target.value) });

  const copiaHecha = h('p.muted', s.ultimaCopia ? `Última copia: ${new Date(s.ultimaCopia).toLocaleDateString('es-ES')}.` : '');

  // Instalar la app (Android/Chrome): solo aparece si el navegador lo ofrece y no está ya instalada.
  const instalarEl = h('section.instalar', { hidden: !puedeInstalar() }, h('h2', '📲 Instalar la app'),
    h('p', 'Ponla en la pantalla de inicio: abre como una app y funciona sin conexión.'),
    h('button.grande', { type: 'button', onclick: () => instalar() }, 'Instalar la app'));
  alCambiarInstalable((si) => { instalarEl.hidden = !si; });

  const el = h('div.mas',
    h('h1', 'Más'),
    h('section', h('h2', 'Biblioteca'),
      h('div.cards',
        h('a.card', { href: tlink(tit, ['laminas']) }, h('h3', '🎞️ Láminas animadas'), h('p', 'Boyas con su luz, luces y marcas de buques, reglas de rumbo, señales acústicas, meteorología…')),
        h('a.card', { href: link(['reglas']) }, h('h3', '🧠 Reglas para recordar'), h('p', 'Las que de verdad funcionan, con su explicación.')),
        h('a.card', { href: link(['conceptos']) }, h('h3', '📘 Conceptos de carta'), h('p', 'Signos, glosario y el método de cada ejercicio.')),
        h('a.card', { href: link(['mesa']) }, h('h3', '🗺️ Mesa de cartas'), h('p', 'La carta del Estrecho con regla, compás y transportador.')))),
    h('section', h('h2', 'Tu estudio'),
      h('div.cards', h('a.card', { href: link(['progreso']) }, h('h3', '📈 Mi progreso'), h('p', 'Cómo vas en cada tema y tus exámenes.'))),
      h('h3.ajuste', h('label', { for: 'fecha-examen' }, `📅 Fecha del examen de ${T.sigla}`)),
      fecha,
      h('h3.ajuste', '⏱ Minutos al día'),
      minutos),
    h('section', h('h2', 'Titulación'),
      h('div.titulaciones', Object.values(TITULACIONES).map((X) => h('a.btn.grande', { href: tlink(X.id), class: X.id === tit ? '' : 'secondary', 'aria-current': X.id === tit ? 'true' : null },
        `${X.id === tit ? '✓ ' : ''}${X.id === 'per' ? 'PER' : X.nombre}`)))),
    voice.supported ? h('section', h('h2', '👨‍🏫 Voz del profe'),
      h('p.muted', 'Usa las voces de tu navegador o sistema (gratis). En Chrome y en Android suelen estar las de Google; en iPhone/Mac, las de Apple. Si no oyes nada, revisa que haya una voz en español instalada.'),
      h('label.check', h('input', { type: 'checkbox', checked: voice.enabled, onchange: (ev) => voice.setEnabled(ev.target.checked) }), 'Voz activada'),
      h('label.check', h('input', { type: 'checkbox', checked: s.vozAuto === true, onchange: (ev) => progress.setSetting('vozAuto', ev.target.checked) }), 'Leer las tarjetas en voz alta automáticamente'),
      (() => {
        const sel = h('select', { onchange: (ev) => voice.setVoiceName(ev.target.value) }, h('option', 'Cargando voces…'));
        spanishVoices().then((list) => {
          sel.replaceChildren(...(list.length ? list.map((v) => h('option', { value: v.name, selected: v.name === s.vozNombre }, `${v.name} (${v.lang})`)) : [h('option', 'No hay voces en español en este dispositivo')]));
        });
        return h('label.field', h('span.lbl', 'Voz'), sel);
      })(),
      h('label.field', h('span.lbl', 'Velocidad'), h('select', { onchange: (ev) => voice.setRate(Number(ev.target.value)) },
        [[0.85, 'Lenta'], [1, 'Normal'], [1.15, 'Rápida']].map(([v, t]) => h('option', { value: v, selected: voice.rate === v }, t)))),
      h('div.actions', h('button.secondary', { type: 'button', onclick: () => voice.speak('Hola, soy tu profe de navegación. Recuerda: corrección total igual a declinación más desvío. Este suma, oeste resta.') }, '▶ Probar la voz')),
    ) : null,
    instalarEl,
    h('section', h('h2', '💾 Copia de seguridad'),
      h('p', 'Lo que has estudiado se guarda solo en este aparato. Si cambias de móvil o borras los datos del navegador, se pierde. Guarda una copia de vez en cuando.'),
      copiaHecha,
      h('div.actions',
        h('button', { type: 'button', onclick: () => { guardarCopia(progress); copiaHecha.textContent = `Última copia: ${new Date().toLocaleDateString('es-ES')}.`; } }, 'Guardar una copia'),
        botonRecuperar(progress)),
      h('details.empezar-de-cero', h('summary', 'Empezar de cero'),
        h('p', 'Se borrará todo lo que has estudiado. No se puede deshacer.'),
        h('button.peligro', { type: 'button', onclick: () => { if (confirm('¿Borrar todo lo que has estudiado? No se puede deshacer.')) { progress.reset(); location.hash = '#/'; location.reload(); } } }, 'Borrar todo'))),
  );
  return {
    el,
    summary: () => `VISTA más · titulación activa ${T.sigla} · examen ${progress.settings()[`examen_${tit}`] || 'sin fecha'} · ${progress.settings().minutosDia ?? 20} min al día\nRUTAS: #/${tit}/laminas · #/reglas · #/conceptos · #/mesa · #/progreso`,
  };
}

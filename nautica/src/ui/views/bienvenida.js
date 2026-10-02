// #/bienvenida — tres preguntas, una por pantalla: titulación, fecha del examen y minutos al día.

import { h, setChildren } from '../dom.js';
import { navigate } from '../router.js';
import { TITULACIONES } from '../titulacion.js';

/** Control de minutos al día (también se usa en «Más»). */
export function botonesMinutos(actual, onElegir) {
  return h('div.opciones-grandes', [10, 20, 30].map((m) => h('button.grande', { type: 'button', class: actual === m ? '' : 'secondary', 'aria-pressed': actual === m ? 'true' : 'false', onclick: () => onElegir(m) }, `${m} minutos`)));
}

export function bienvenidaView({ progress }) {
  const el = h('div.bienvenida');
  let paso = 1;
  let tit = 'per';

  const fin = (min) => {
    progress.setSetting('minutosDia', min);
    progress.setSetting('onboarded', true);
    navigate([tit]);
  };

  function render() {
    const cab = h('p.paso', `Paso ${paso} de 3`);
    if (paso === 1) {
      setChildren(el, cab, h('h1', '¿Qué título vas a sacarte?'),
        h('div.opciones-grandes',
          Object.values(TITULACIONES).map((T) => h('button.tarjeta-opcion', { type: 'button', onclick: () => { tit = T.id; progress.setSetting('level', T.nivel); paso = 2; render(); } },
            h('span.op-icono', { 'aria-hidden': 'true' }, T.icon), h('span.op-texto', T.id === 'per' ? `PER — ${T.nombre}` : T.nombre)))));
    } else if (paso === 2) {
      const input = h('input', { type: 'date', 'aria-label': 'Fecha del examen', value: progress.settings()[`examen_${tit}`] ?? '' });
      setChildren(el, cab, h('h1', '¿Cuándo es tu examen?'),
        h('div.campo-fecha', input),
        h('button.grande', { type: 'button', onclick: () => { if (input.value) progress.setSetting(`examen_${tit}`, input.value); paso = 3; render(); } }, 'Continuar'),
        h('p.centrado', h('a', { href: '#/bienvenida', onclick: (ev) => { ev.preventDefault(); paso = 3; render(); } }, 'Todavía no lo sé')));
    } else {
      setChildren(el, cab, h('h1', '¿Cuánto tiempo tienes al día?'), botonesMinutos(null, fin));
    }
    window.scrollTo(0, 0);
  }
  render();
  return { el, summary: () => `VISTA bienvenida · paso ${paso} de 3 (titulación, fecha del examen, minutos al día)` };
}

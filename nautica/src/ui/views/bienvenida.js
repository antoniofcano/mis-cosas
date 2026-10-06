// #/bienvenida — tres preguntas, una por pantalla: titulación, fecha del examen y minutos al día.

import { h, setChildren } from '../dom.js';
import { navigate } from '../router.js';
import { TITULACIONES } from '../titulacion.js';

/** Control de minutos al día (también se usa en Ajustes). */
export function botonesMinutos(actual, onElegir) {
  // En la bienvenida (sin valor aún): tres botones grandes. En Ajustes: − / + de 5 en 5 (de 5 a 180) y atajos, para
  // poder poner justo los minutos que pide el plan (35, 40, 45…).
  if (actual == null) {
    return h('div.opciones-grandes', [10, 20, 30].map((m) => h('button.grande.secondary', { type: 'button', 'aria-pressed': 'false', onclick: () => onElegir(m) }, `${m} minutos`)));
  }
  const paso = (d) => Math.min(180, Math.max(5, actual + d));
  return h('div.minutos-ajuste',
    h('div.stepper', { role: 'group', 'aria-label': 'Minutos al día' },
      h('button.grande.secondary', { type: 'button', 'aria-label': 'Cinco minutos menos', disabled: actual <= 5, onclick: () => onElegir(paso(-5)) }, '−'),
      h('output', { 'aria-live': 'polite' }, `${actual} minutos`),
      h('button.grande.secondary', { type: 'button', 'aria-label': 'Cinco minutos más', disabled: actual >= 180, onclick: () => onElegir(paso(5)) }, '+')),
    h('div.atajos', [15, 20, 30, 45, 60].map((m) => h('button.secondary', { type: 'button', 'aria-pressed': actual === m ? 'true' : 'false', class: actual === m ? 'activo' : '', onclick: () => onElegir(m) }, `${m}`))));
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
        h('button.grande', { type: 'button', onclick: () => { if (input.value) { progress.setSetting(`examen_${tit}`, input.value); progress.setSetting(`examenOrientativo_${tit}`, false); } paso = 3; render(); } }, 'Continuar'),
        // Sin fecha no hay plan ni cuenta atrás: se pone una orientativa (dentro de 3 meses) que se cambia cuando se sepa.
        h('button.secondary.grande', { type: 'button', onclick: () => {
          const f = new Date(Date.now() + 91 * 864e5).toLocaleDateString('sv-SE');
          progress.setSetting(`examen_${tit}`, f); progress.setSetting(`examenOrientativo_${tit}`, true); paso = 3; render();
        } }, 'Todavía no lo sé (pon una orientativa)'));
    } else {
      setChildren(el, cab, h('h1', '¿Cuánto tiempo tienes al día?'), botonesMinutos(null, fin));
    }
    window.scrollTo(0, 0);
  }
  render();
  return { el, summary: () => `VISTA bienvenida · paso ${paso} de 3 (titulación, fecha del examen, minutos al día)` };
}

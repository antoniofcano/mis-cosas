// #/bienvenida — la titulación; dónde te examinas (solo si hay más de un banco publicado); y la fecha del examen con los
// minutos al día. Luego, la primera clase.

import { h, setChildren } from '../dom.js';
import { navigate } from '../router.js';
import { TITULACIONES } from '../titulacion.js';
import { cuenta, diaISO } from '../../texto.js';
import { loadCourse } from '../../store/datasets.js';
import { bloquesEnOrden } from '../../theory/blocks.js';
import { ejesElegibles, selectorEje } from '../eje.js';
import { icono } from '../iconos.js';

/** Control de minutos al día (también se usa en Ajustes). */
export function botonesMinutos(actual, onElegir) {
  // En la bienvenida (sin valor aún): tres botones grandes. En Ajustes: − / + de 5 en 5 (de 5 a 180) y atajos, para
  // poder poner justo los minutos que pide el plan (35, 40, 45…).
  if (actual == null) {
    return h('div.opciones-grandes', [10, 20, 30].map((m) => h('button.grande.secondary', { type: 'button', 'aria-pressed': 'false', onclick: () => onElegir(m) }, `${cuenta(m, 'minuto')}`)));
  }
  const paso = (d) => Math.min(180, Math.max(5, actual + d));
  return h('div.minutos-ajuste',
    h('div.stepper', { role: 'group', 'aria-label': 'Minutos al día' },
      h('button.grande.secondary', { type: 'button', 'aria-label': 'Cinco minutos menos', disabled: actual <= 5, onclick: () => onElegir(paso(-5)) }, '−'),
      h('output', { 'aria-live': 'polite' }, `${cuenta(actual, 'minuto')}`),
      h('button.grande.secondary', { type: 'button', 'aria-label': 'Cinco minutos más', disabled: actual >= 180, onclick: () => onElegir(paso(5)) }, '+')),
    h('div.atajos', [15, 20, 30, 45, 60].map((m) => h('button.secondary', { type: 'button', 'aria-pressed': actual === m ? 'true' : 'false', class: actual === m ? 'activo' : '', onclick: () => onElegir(m) }, `${m}`))));
}

export function bienvenidaView({ progress }) {
  const el = h('div.bienvenida');
  let paso = 1;
  let tit = 'per';
  // Ejes entre los que elegir ([] si hay uno solo: entonces el paso no existe).
  let ejes = [];
  const total = () => (ejes.length ? 3 : 2);
  ejesElegibles().then((l) => { ejes = l; if (paso === 1) render(); }).catch(() => {});

  // Al terminar, directo a la primera clase del orden de estudio (si el curso no carga, a Hoy).
  const empezar = (fecha, orientativa, min) => {
    progress.setSetting(`examen_${tit}`, fecha);
    progress.setSetting(`examenOrientativo_${tit}`, orientativa);
    progress.setSetting('minutosDia', min);
    progress.setSetting('onboarded', true);
    const T = TITULACIONES[tit];
    loadCourse(tit).then((curso) => {
      const ut = bloquesEnOrden(T.estructura).find((b) => curso?.modulos.some((m) => m.ut === b.ut && m.lecciones.length))?.ut;
      const primera = curso?.modulos.find((m) => m.ut === ut)?.lecciones[0];
      navigate(primera ? [tit, 'curso', primera.id] : [tit]);
    }).catch(() => navigate([tit]));
  };

  function render() {
    const cab = h('p.paso', `Paso ${paso} de ${total()}`);
    const pasoFecha = ejes.length ? 3 : 2;
    if (paso === 1) {
      setChildren(el, cab, h('h1', '¿Qué título vas a sacarte?'),
        h('div.opciones-grandes',
          Object.values(TITULACIONES).map((T) => h('button.tarjeta-opcion', { type: 'button', onclick: () => { tit = T.id; progress.setSetting('level', T.nivel); paso = 2; render(); } },
            h('span.op-icono', icono(T.ico)), h('span.op-texto', T.id === 'per' ? `PER — ${T.nombre}` : T.nombre)))));
    } else if (paso < pasoFecha) {
      // Dónde te examinas: cada tribunal tiene su banco de preguntas (los exámenes reales de ese tribunal).
      setChildren(el, cab, h('h1', '¿Dónde te examinas?'),
        h('p.muted', 'Cada tribunal pone sus propias preguntas. Estudiarás con los exámenes reales del tuyo. Lo puedes cambiar en Ajustes.'),
        selectorEje(progress, ejes, () => { paso = pasoFecha; render(); }, { marcar: false }));
    } else {
      // Una sola pantalla: fecha del examen y minutos al día, y a la primera clase.
      let orientativa = false;
      let min = 20;
      const input = h('input#fecha-examen', { type: 'date', value: progress.settings()[`examen_${tit}`] ?? '', oninput: () => { orientativa = false; nota.hidden = true; } });
      const nota = h('p.muted.small', { hidden: true }, 'Fecha orientativa, dentro de tres meses: la cambias en Ajustes cuando la sepas.');
      const noSe = h('button.secondary', { type: 'button', onclick: () => { input.value = diaISO(Date.now() + 91 * 864e5); orientativa = true; nota.hidden = false; } }, 'Todavía no lo sé');
      const opciones = [10, 20, 30].map((m) => h('button.grande.secondary', { type: 'button', 'aria-pressed': String(m === min), onclick: () => {
        min = m; for (const b of opciones) b.setAttribute('aria-pressed', String(b === opciones[[10, 20, 30].indexOf(m)]));
      } }, cuenta(m, 'minuto')));
      const aviso = h('p.warn', { hidden: true, role: 'alert' }, 'Pon la fecha del examen o pulsa «Todavía no lo sé».');
      setChildren(el, cab, h('h1', 'Tu examen y tu tiempo'),
        h('label.pregunta-bienvenida', { for: 'fecha-examen' }, '¿Cuándo es tu examen?'),
        h('div.campo-fecha', input, noSe), nota,
        h('p.pregunta-bienvenida', '¿Cuántos minutos al día puedes estudiar?'),
        h('div.opciones-grandes.minutos-bienvenida', { role: 'group', 'aria-label': 'Minutos al día' }, opciones),
        aviso,
        h('button.grande', { type: 'button', onclick: () => { if (!input.value) { aviso.hidden = false; return; } empezar(input.value, orientativa, min); } }, 'Empezar la primera clase'));
    }
    window.scrollTo(0, 0);
  }
  render();
  return { el, summary: () => `VISTA bienvenida · paso ${paso} de ${total()} (titulación;${ejes.length ? ' dónde te examinas;' : ''} fecha del examen y minutos al día)` };
}

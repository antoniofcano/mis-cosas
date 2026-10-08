// #/<tit>/sesion — el ejecutor de la sesión de estudio. Mientras quedan pasos, app.js reenvía al paso actual (cada uno
// es la vista de siempre: clase, repaso de fallos, mezclado, simulacro) antes de llegar aquí; esta vista solo se ve al
// terminar: el resumen (lo trabajado, los aciertos y qué toca mañana) y la vuelta a Hoy.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, currentEje } from '../titulacion.js';
import { cargarBanco } from '../../bancos/index.js';
import { bloque } from '../../theory/blocks.js';
import { calcularPlan } from '../cierre.js';
import { deducirFase, componerSesion, lineaManana, resumenSesion } from '../../course/sesion.js';
import { leerSesion } from '../sesion.js';
import { cuenta } from '../../texto.js';

const DIA = 864e5;

/** Marca de «hecho» (círculo verde con el visto), como en los cierres. */
function marcaHecho() {
  const d = document.createElement('div');
  d.className = 'fin-tick';
  d.setAttribute('aria-hidden', 'true');
  d.innerHTML = '<svg width="52" height="52" viewBox="0 0 52 52"><path d="M13 27l9 9 17-19"/></svg>';
  return d;
}

export function sesionView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = leerSesion(progress, tit);
  const el = h('div.resumen-sesion');
  let summaryText = `VISTA resumen de la sesión ${T.sigla}`;
  if (!s) {
    setChildren(el, h('h1', 'No hay ninguna sesión hoy'), h('a.btn.grande', { href: tlink(tit) }, 'Ir a Hoy'));
    return { el, summary: () => `${summaryText}: no hay sesión` };
  }
  const linea = h('p.resumen-linea', '…');
  const trabajado = h('ul.trabajado');
  const manana = h('p.manana-texto', 'Calculando…');
  setChildren(el,
    marcaHecho(),
    h('h1', 'Sesión hecha'),
    linea,
    h('section.caja-trabajado', h('h2.eti', 'Lo que has trabajado'), trabajado),
    h('section.caja-manana', h('h2.eti', 'Mañana'), manana),
    h('a.btn.grande', { href: tlink(tit) }, 'Volver a Hoy'));

  const pasos = s.pasos.map((p) => h('li', { class: p.estado === 'hecho' ? 'ok' : 'neutro' },
    h('span.punto', { 'aria-hidden': 'true' }),
    h('span.tx', h('strong', p.titulo), h('span.muted.small', p.estado === 'hecho' ? p.sub : `Saltado · ${p.sub}`))));
  setChildren(trabajado, pasos);

  cargarBanco(currentEje(progress), tit).then((banco) => {
    const r = resumenSesion(s, { respuestas: progress.get().exams, porId: banco.porId, temaDe: (ut) => bloque(T.estructura, ut)?.titulo ?? `Tema ${ut}`, minutosHoy: progress.minutosHoy() });
    const tiempo = r.minutos ? `, en ${cuenta(r.minutos, 'minuto')}` : '';
    linea.textContent = r.total ? `${r.aciertos} de ${cuenta(r.total, 'pregunta')} bien${tiempo}.` : `${r.hechos} de ${cuenta(r.pasos, 'paso')} hechos${tiempo}.`;
    // Por tema (o por concepto, cuando haya etiquetas): lo que sale bien y lo que vuelve mañana.
    if (r.grupos.length) {
      setChildren(trabajado, r.grupos.map((g) => {
        const todo = g.bien === g.total;
        return h('li', { class: todo ? 'ok' : 'mal' }, h('span.punto', { 'aria-hidden': 'true' }),
          h('span.tx', h('strong', g.nombre), h('span.muted.small', todo ? `${g.bien} de ${g.total} bien` : `${g.bien} de ${g.total} bien · las falladas vuelven mañana con su repaso`)));
      }), h('li.pasos-hechos', h('span.muted.small', `Pasos: ${r.hechos} de ${r.pasos} hechos${r.saltados ? ` (${r.saltados} saltado${r.saltados > 1 ? 's' : ''})` : ''}.`)));
    }
    summaryText = `VISTA resumen de la sesión ${T.sigla}: ${linea.textContent} · ${r.grupos.map((g) => `${g.nombre} ${g.bien}/${g.total}`).join(', ')}`;
  }).catch(() => { linea.textContent = `${s.pasos.filter((p) => p.estado === 'hecho').length} de ${cuenta(s.pasos.length, 'paso')} hechos.`; });

  // Mañana: la sesión que tocaría mañana con lo hecho hasta ahora (sin guardar nada del plan).
  const hoy = calcularPlan(progress, tit);
  const man = calcularPlan(progress, tit, Date.now() + DIA, { guardar: false });
  Promise.all([hoy, man]).then(([dh, dm]) => {
    const st = dm.st;
    manana.textContent = lineaManana(componerSesion(st, deducirFase(st).id), { fallosManana: dh.st.repaso.manana });
    summaryText += `\nMAÑANA: ${manana.textContent}`;
  }).catch(() => { manana.textContent = 'Lo que proponga tu plan.'; });

  return { el, summary: () => summaryText };
}

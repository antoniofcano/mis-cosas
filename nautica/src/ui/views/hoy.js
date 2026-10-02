// #/ y #/<tit> — Hoy: saludo, la actividad que toca (una sola acción principal), el avance y lo que viene después.

import { h, setChildren } from '../dom.js';
import { avance, diasHasta, lineaAvance, ritmoEstudio } from '../../course/plan.js';
import { estoyListo, lineaListo } from '../../course/listo.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { calcularPlan, hrefActividad, TIPO_TXT } from '../cierre.js';
import { avisoCopia } from '../copia.js';

export function saludo(fecha = new Date()) {
  const hora = fecha.getHours();
  return hora < 13 ? 'Buenos días' : hora < 21 ? 'Buenas tardes' : 'Buenas noches';
}

export function lineaExamen(sigla, dias) {
  if (dias == null || dias < 0) return `Preparando el ${sigla}.`;
  if (dias === 0) return `Tu examen de ${sigla} es hoy.`;
  if (dias === 1) return `Tu examen de ${sigla} es mañana.`;
  return `Tu examen de ${sigla} es en ${dias} días.`;
}

const fechaLarga = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }); };

/** ¿Llego a tiempo? En palabras, para la pantalla Hoy. */
export function lineaRitmo(r, minutosDia, fechaExamen) {
  if (!r.minutosPendientes) return 'Has hecho todo el plan: ahora, simulacros y repasar tus fallos.';
  const base = `A ${minutosDia} minutos al día terminas el plan el ${fechaLarga(r.fechaFin)}`;
  if (!fechaExamen || r.llega == null) return `${base}. Pon la fecha de tu examen en «Más» y te digo si llegas.`;
  if (r.llega) return `${base}, antes de tu examen (${fechaLarga(fechaExamen)}).`;
  return `${base}, pero tu examen es el ${fechaLarga(fechaExamen)}. Para llegar necesitas unos ${r.minutosNecesarios} minutos al día.`;
}

export function hoyView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();
  const fecha = s[`examen_${tit}`] || null;
  const cabecera = [h('h1', saludo()), h('p.muted', lineaExamen(T.sigla, fecha ? diasHasta(fecha) : null))];
  const el = h('div.hoy', cabecera, h('p.muted', 'Preparando tu plan…'));
  let summaryText = `VISTA hoy ${T.sigla} (cargando)`;

  calcularPlan(progress, tit).then((d) => {
    const { plan } = d;
    const a = avance(T.estructura, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora);
    const minutos = progress.minutosHoy();
    const objetivo = s.minutosDia ?? 20;
    const racha = progress.racha();
    const principal = plan[0];
    const r = ritmoEstudio({ ...d, minutosDia: objetivo });
    const listo = estoyListo(T.estructura, d.preguntas, d.respuestas, d.tests);
    const ritmo = h('p.ritmo', { class: r.llega === false ? 'warn' : '' }, r.llega === false ? '⚠️ ' : '', lineaRitmo(r, objetivo, fecha),
      ' ', h('a', { href: '#/mas' }, 'Cambiar'));

    const tarjeta = () => {
      const [icono, tipo] = TIPO_TXT[principal.tipo] ?? ['', ''];
      return h('section.tarjeta-hoy',
        h('p.rotulo', 'Hoy toca'),
        h('h2', principal.titulo),
        h('p.linea', `${icono} ${tipo} · unos ${principal.minutos} minutos`),
        h('a.btn.grande', { href: hrefActividad(tit, principal) }, `${principal.verbo} →`));
    };
    const hueco = h('div');
    if (minutos >= objetivo) {
      setChildren(hueco, h('section.tarjeta-hoy.hecho',
        h('div.icono-grande', { 'aria-hidden': 'true' }, '✅'),
        h('h2', 'Hecho por hoy'),
        h('p', `Has estudiado ${minutos} minutos. Mañana toca: ${principal.titulo}.`),
        h('button.secondary.grande', { type: 'button', onclick: () => setChildren(hueco, tarjeta()) }, 'Seguir un poco más')));
    } else {
      setChildren(hueco, tarjeta());
    }

    const resto = plan.slice(1);
    summaryText = `VISTA hoy ${T.sigla}\n${plan.map((x, i) => `${i ? 'DESPUÉS' : 'HOY TOCA'}: ${x.tipo} «${x.titulo}» ~${x.minutos} min → ${hrefActividad(tit, x)}`).join('\n')}` +
      `\nRITMO: ${lineaRitmo(r, objetivo, fecha)} (pendiente ${r.minutosPendientes} min: clases ${r.desglose.clases}, preguntas ${r.desglose.preguntas}, simulacros ${r.desglose.simulacros})` +
      `\nLISTO: ${lineaListo(listo)}${listo.prob != null ? ` (p=${listo.prob.toFixed(2)})` : ''}` +
      `\nAVANCE: ${a.temasAlDia}/${a.temasTotal} temas al día · ${Math.round(a.fraccion * 100)} % · hoy ${minutos}/${objetivo} min · racha ${racha} días`;

    setChildren(el,
      cabecera,
      ritmo,
      hueco,
      h('section.avance',
        h('div.bar', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(a.fraccion * 100) }, h('span', { style: `width:${Math.round(a.fraccion * 100)}%` })),
        h('p', lineaAvance(a, racha))),
      h('section.listo', { class: `listo-${listo.estado}` }, h('h2', '¿Estás listo para el examen?'), h('p', lineaListo(listo))),
      avisoCopia(progress),
      resto.length ? [h('h2', 'Después'), h('div.despues', resto.map((x) => h('a.card.compacta', { href: hrefActividad(tit, x) },
        h('h3', x.titulo), h('p', `${(TIPO_TXT[x.tipo] ?? [''])[0]} unos ${x.minutos} minutos`))))] : null,
      h('p.ver-todo', h('a', { href: tlink(tit, ['temario']) }, 'Ver todo el temario →')),
    );
  }).catch((e) => setChildren(el, cabecera, h('p.warn', `No se pudo preparar el plan: ${e.message}`)));

  return { el, summary: () => summaryText };
}

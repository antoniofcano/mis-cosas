// #/<tit>/plan — Mi plan hasta el examen: qué toca cada día, lo que hay que recuperar y si llegas.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { calcularPlan, hrefActividad } from '../cierre.js';
import { planConSeguimiento, rehacerPlan } from '../plan-estudio.js';
import { lineaSeguimiento, sumaDiasISO } from '../../course/calendario.js';
import { diaLocal } from '../../store/progress.js';

const fecha = (iso, o = { weekday: 'long', day: 'numeric', month: 'long' }) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-ES', o); };
const ICONO = { clase: '🎓', tanda: '✏️', simulacro: '📝' };
const lunes = (iso) => { const [y, m, d] = iso.split('-').map(Number); const dow = (new Date(y, m - 1, d).getDay() + 6) % 7; return sumaDiasISO(iso, -dow); };

export function planView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.plan-estudio', h('h1', 'Mi plan hasta el examen'), h('p.muted', 'Preparando tu plan…'));
  let summaryText = `VISTA plan ${T.sigla} (cargando)`;

  const pinta = () => calcularPlan(progress, tit).then((d) => {
    const ps = planConSeguimiento(progress, tit, d);
    if (!ps) {
      summaryText = `VISTA plan ${T.sigla}: sin fecha de examen`;
      setChildren(el, h('h1', 'Mi plan hasta el examen'),
        h('p', 'Pon la fecha de tu examen y los minutos que puedes estudiar al día, y la app te reparte el temario día a día para que te dé tiempo.'),
        h('a.btn.grande', { href: '#/ajustes' }, 'Poner la fecha del examen →'));
      return;
    }
    const { plan, seg } = ps;
    const hoy = diaLocal(d.ahora);
    const unidad = (u, enlace) => h('li', { class: u.hecha ? 'hecha' : '' },
      enlace && !u.hecha ? h('a', { href: hrefActividad(tit, u) }, `${ICONO[u.tipo] ?? ''} ${u.titulo}`) : `${ICONO[u.tipo] ?? ''} ${u.titulo}`,
      h('span.muted.small', ` · ${u.minutos} min`), u.hecha ? ' ✓' : null);

    // Futuro (desde hoy), por semanas.
    const semanas = new Map();
    for (const dia of seg.futuro.dias) {
      const k = lunes(dia.fecha);
      if (!semanas.has(k)) semanas.set(k, []);
      semanas.get(k).push(dia);
    }
    // Días pasados del plan base: lo hecho y lo que se quedó sin hacer.
    const atrasadas = new Set(seg.atrasadas.map((u) => u.id));
    const pasados = Object.entries(plan.dias).filter(([f]) => f < hoy);

    summaryText = `VISTA plan ${T.sigla} · examen ${plan.fechaExamen} · ${plan.minutosDia} min/día\nESTADO: ${lineaSeguimiento(seg)}\n` +
      `RECUPERAR: ${seg.atrasadas.map((u) => u.titulo).join('; ') || '—'}\n` +
      seg.futuro.dias.map((dia) => `${dia.fecha}: ${dia.unidades.map((u) => u.titulo).join('; ') || 'libre'}`).join('\n');

    setChildren(el,
      h('h1', 'Mi plan hasta el examen'),
      h('p.muted', `Examen: ${fecha(plan.fechaExamen)} · ${plan.minutosDia} minutos al día · `, h('a', { href: '#/ajustes' }, 'cambiar')),
      h('p.ritmo', { class: seg.estado === 'al-dia' || seg.estado === 'terminado' ? '' : 'warn' }, lineaSeguimiento(seg)),
      h('div.bar', { role: 'progressbar', 'aria-label': 'Plan hecho', 'aria-valuemin': 0, 'aria-valuemax': seg.totalDelPlan, 'aria-valuenow': seg.hechasDelPlan },
        h('span', { style: `width:${seg.totalDelPlan ? Math.round((100 * seg.hechasDelPlan) / seg.totalDelPlan) : 100}%` })),
      h('p.muted.small', `Llevas ${seg.hechasDelPlan} de ${seg.totalDelPlan} cosas del plan.`),
      seg.atrasadas.length ? h('section.plan-recuperar', h('h2', 'Para recuperar'),
        h('ul.plan-unidades', seg.atrasadas.map((u) => h('li', h('a', { href: hrefActividad(tit, u) }, `${ICONO[u.tipo] ?? ''} ${u.titulo}`),
          h('span.muted.small', ` · tocaba el ${fecha(u.fecha, { weekday: 'long', day: 'numeric' })}`)))),
        h('p.muted.small', 'Ya están puestas al principio de los próximos días.')) : null,
      [...semanas].map(([k, dias], i) => {
        const titulo = k <= hoy ? 'Esta semana' : `Semana del ${fecha(k, { day: 'numeric', month: 'long' })}`;
        const diasEl = dias.map((dia) => h('div.plan-dia', { class: dia.fecha === hoy ? 'hoy' : '' },
          h('h3', dia.fecha === hoy ? `Hoy, ${fecha(dia.fecha, { day: 'numeric', month: 'long' })}` : fecha(dia.fecha),
            dia.minutos ? h('span.muted.small', ` · ${dia.minutos} min`) : null),
          dia.unidades.length ? h('ul.plan-unidades', dia.unidades.map((u) => unidad(u, dia.fecha === hoy))) : h('p.muted.small', 'Libre: repasa tus fallos o descansa.')));
        // Las dos primeras semanas, abiertas; las demás, plegadas con su resumen.
        if (i < 2) return h('section.plan-semana', h('h2', titulo), diasEl);
        const n = dias.reduce((t, d) => t + d.unidades.length, 0);
        const min = dias.reduce((t, d) => t + d.minutos, 0);
        return h('details.plan-semana', h('summary', h('span', titulo), h('span.muted.small', ` · ${n} cosas, unos ${String(Math.round(min / 6) / 10).replace('.', ',')} h`)), diasEl);
      }),
      h('div.plan-dia.examen', h('h3', `🏁 Examen: ${fecha(plan.fechaExamen)}`)),
      pasados.length ? h('details.plan-pasados', h('summary', `Días pasados (${pasados.length})`),
        pasados.map(([f, xs]) => h('div.plan-dia', h('h3', fecha(f)),
          h('ul.plan-unidades', xs.map((x) => h('li', { class: atrasadas.has(x.id) ? 'saltada' : 'hecha' }, `${x.titulo}${atrasadas.has(x.id) ? ' — sin hacer' : ' ✓'}`)))))) : null,
      h('section.plan-acciones',
        h('p.muted.small', 'El plan se recalcula solo: lo que adelantas sale del calendario y lo que se queda atrás pasa a los días siguientes. Si prefieres empezar de cero desde hoy:'),
        h('button.secondary', { type: 'button', onclick: () => { rehacerPlan(progress, tit, d); pinta(); } }, 'Rehacer el plan desde hoy')),
    );
  }).catch((e) => setChildren(el, h('h1', 'Mi plan hasta el examen'), h('p.warn', `No se pudo preparar el plan: ${e.message}`)));
  pinta();

  return { el, summary: () => summaryText };
}

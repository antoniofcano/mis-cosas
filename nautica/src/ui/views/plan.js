// #/<tit>/plan — Mi plan hasta el examen: qué toca cada día, lo que hay que recuperar y si llegas.

import { h, setChildren } from '../dom.js';
import { icono } from '../iconos.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { calcularPlan, hrefActividad } from '../cierre.js';
import { planConSeguimiento, rehacerPlan, botonSubirMinutos, marcaEstado, avisoEsencial } from '../plan-estudio.js';
import { sumaDiasISO, describir, duracion, DIAS_ESTUDIO, avanceCamino } from '../../course/calendario.js';
import { lineaAvance } from '../../course/plan.js';
import { diaLocal } from '../../store/progress.js';
import { cargarMapas } from './mapas.js';
import { mapasEliminatorios } from '../../course/mapas.js';
import { cuenta, fechaLarga } from '../../texto.js';

const DIAS_MAPAS = 14; // en la recta final, repaso de los temas eliminatorios con los mapas

/** «🕸️ Repaso con los mapas»: en las dos últimas semanas, una ronda del juego de los mapas de los temas eliminatorios. */
function repasoMapas(tit, estructura, quedan) {
  const el = h('section.plan-mapas', { hidden: true });
  cargarMapas().then((mapas) => {
    const xs = mapasEliminatorios(mapas, tit, estructura);
    if (!xs.length) return;
    const temas = [...new Map(xs.flatMap((x) => x.temas).map((b) => [b.ut, b])).values()].sort((a, b) => a.ut - b.ut);
    setChildren(el, h('h2', '🕸️ Repaso con los mapas'),
      h('p', `${quedan === 1 ? 'Queda 1 día' : `Quedan ${cuenta(quedan, 'día')}`}. En los temas eliminatorios (${temas.map((b) => b.titulo).join(', ')}) se suspende por confundir conceptos: haz cada día una ronda del juego de uno de estos mapas.`),
      h('div.cards', xs.map(({ mapa, temas: ts }) => h('a.card', { href: tlink(tit, ['mapas', mapa.id], { v: 'jugar' }) },
        h('h3', `🎯 ${mapa.titulo}`), h('p.muted.small', ts.map((b) => b.titulo).join(' · '))))));
    el.hidden = false;
  }).catch(() => {});
  return el;
}

const ICONO = { clase: '🎓', chuleta: '📌', tanda: '✏️', simulacro: '📝' };
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

    summaryText = `VISTA plan ${T.sigla} · examen ${plan.fechaExamen} · ${plan.minutosDia} min/día\nESTADO: ${d.st.mensaje.texto}\n` +
      `RECUPERAR: ${seg.atrasadas.map((u) => u.titulo).join('; ') || '—'}\n` +
      seg.futuro.dias.map((dia) => `${dia.fecha}: ${dia.unidades.map((u) => u.titulo).join('; ') || 'libre'}`).join('\n');

    setChildren(el,
      h('h1', 'Mi plan hasta el examen'),
      h('p.muted', `Examen: ${fechaLarga(plan.fechaExamen)} · ${cuenta(plan.minutosDia, 'minuto')} al día, ${DIAS_ESTUDIO[plan.diasEstudio ?? 'todos']} · `, h('a', { href: '#/ajustes' }, 'cambiar')),
      // El mismo mensaje del día que en Hoy (motor): con la meta cumplida, no pide más.
      h('div.ritmo', { class: d.st.mensaje.aviso ? 'warn' : '' }, h('p', marcaEstado(d.st.mensaje.tipo === 'toca' ? seg.estado : 'al-dia')[0], d.st.mensaje.texto),
        d.st.mensaje.detalle ? h('p.muted.small', d.st.mensaje.detalle) : null,
        d.st.mensaje.aviso ? botonSubirMinutos(progress, ps, () => pinta(), tit) : null),
      avisoEsencial(progress, tit, T.estructura, () => pinta()),
      // Los días de simulacro pasan del tope diario: se avisa al principio para reservarlos.
      (() => { const sims = seg.futuro.dias.filter((dia) => dia.unidades.some((u) => u.tipo === 'simulacro') && dia.minutos > plan.minutosDia);
        return sims.length ? h('p.aviso-simulacros', icono('reloj'), ` ${sims.length === 1 ? 'Un día' : `${cuenta(sims.length, 'día')}`} del final ${sims.length === 1 ? 'es' : 'son'} de simulacro (${duracion(T.estructura.duracionMin)} cada uno, más que tus ${cuenta(plan.minutosDia, 'minuto')}): resérvalos. Son ${sims.map((dia) => fechaLarga(dia.fecha)).join(', ')}.`) : null; })(),
      (() => { const quedan = Math.round((new Date(`${plan.fechaExamen}T12:00`) - new Date(`${hoy}T12:00`)) / 864e5); return quedan > 0 && quedan <= DIAS_MAPAS ? repasoMapas(tit, T.estructura, quedan) : null; })(),
      // El mismo avance que en Hoy y Progreso.
      (() => { const c = d.st.camino; return [
        h('div.bar', { role: 'progressbar', 'aria-label': 'Camino hecho', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(c.fraccion * 100) },
          h('span', { style: `width:${Math.round(c.fraccion * 100)}%` })),
        h('p.muted.small', lineaAvance(c))]; })(),
      seg.atrasadas.length ? h('section.plan-recuperar', h('h2', 'Para recuperar'),
        h('ul.plan-unidades', seg.atrasadas.map((u) => h('li', h('a', { href: hrefActividad(tit, u) }, `${ICONO[u.tipo] ?? ''} ${u.titulo}`),
          h('span.muted.small', ` · tocaba el ${fechaLarga(u.fecha)}`)))),
        h('p.muted.small', 'Ya están puestas al principio de los próximos días.')) : null,
      [...semanas].map(([k, dias], i) => {
        const titulo = k <= hoy ? 'Esta semana' : `Semana del ${fechaLarga(k)}`;
        const diasEl = dias.map((dia) => h('div.plan-dia', { class: dia.fecha === hoy ? 'hoy' : '' },
          h('h3', dia.fecha === hoy ? `Hoy · ${fechaLarga(dia.fecha)}` : fechaLarga(dia.fecha),
            dia.minutos ? h('span.muted.small', ` · ${dia.minutos} min`) : null),
          dia.unidades.length ? h('ul.plan-unidades', dia.unidades.map((u) => unidad(u, dia.fecha === hoy))) : h('p.muted.small', 'Libre: repasa tus fallos o descansa.')));
        // Las dos primeras semanas, abiertas; las demás, plegadas con su resumen.
        if (i < 2) return h('section.plan-semana', h('h2', titulo), diasEl);
        const min = dias.reduce((t, d) => t + d.minutos, 0);
        return h('details.plan-semana', h('summary', h('span', titulo), h('span.muted.small', ` · ${describir(dias.flatMap((d) => d.unidades))}, ${duracion(min)}`)), diasEl);
      }),
      seg.futuro.fuera.length ? h('details.plan-fuera', h('summary', `Sin hueco antes del examen: ${describir(seg.futuro.fuera)}`),
        h('ul.plan-unidades', seg.futuro.fuera.map((u) => h('li', `${ICONO[u.tipo] ?? ''} ${u.titulo}`, h('span.muted.small', ` · ${u.minutos} min`))))) : null,
      h('div.plan-dia.examen', h('h3', `🏁 Examen: ${fechaLarga(plan.fechaExamen)}`)),
      pasados.length ? h('details.plan-pasados', h('summary', `Días pasados (${pasados.length})`),
        pasados.map(([f, xs]) => h('div.plan-dia', h('h3', fechaLarga(f)),
          h('ul.plan-unidades', xs.map((x) => h('li', { class: atrasadas.has(x.id) ? 'saltada' : 'hecha' }, `${x.titulo}${atrasadas.has(x.id) ? ' — sin hacer' : ' ✓'}`)))))) : null,
      h('section.plan-acciones',
        h('p.muted.small', 'El plan se recalcula solo: lo que adelantas sale del calendario y lo que se queda atrás pasa a los días siguientes. Si prefieres empezar de cero desde hoy:'),
        h('button.secondary', { type: 'button', onclick: () => { rehacerPlan(progress, tit, d); pinta(); } }, 'Rehacer el plan desde hoy')),
    );
  }).catch((e) => setChildren(el, h('h1', 'Mi plan hasta el examen'), h('p.warn', `No se pudo preparar el plan: ${e.message}`)));
  pinta();

  return { el, summary: () => summaryText };
}

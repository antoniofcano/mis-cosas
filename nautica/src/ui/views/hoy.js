// #/ y #/<tit> — Hoy: saludo, la actividad que toca (una sola acción principal), el avance y lo que viene después.

import { h, setChildren } from '../dom.js';
import { avance, diasHasta, lineaAvance, ritmoEstudio } from '../../course/plan.js';
import { estoyListo, lineaListo } from '../../course/listo.js';
import { colaRepaso } from '../../course/repaso.js';
import { mazos, tarjetasPorRepasar } from '../../course/tarjetas.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { icono } from '../iconos.js';
import { calcularPlan, hrefActividad, TIPO_TXT } from '../cierre.js';
import { avisoCopia } from '../copia.js';
import { planConSeguimiento, botonSubirMinutos, marcaEstado } from '../plan-estudio.js';
import { lineaSeguimiento, temasDePocoPeso, unidades } from '../../course/calendario.js';
import { renderIllustration } from '../../illustrations/index.js';
import { interactivaDe, dibujoFijo } from '../../illustrations/interactivas.js';
import { quieto } from '../movimiento.js';

const CIRC = 2 * Math.PI * 32; // perímetro del anillo de la meta (r = 32)

/** Anillo de la meta del día (como en la maqueta): se rellena hasta los minutos de hoy, con la cifra en el centro. */
export function anilloMeta(minutos, objetivo) {
  const f = Math.min(1, minutos / Math.max(1, objetivo));
  const d = document.createElement('div');
  d.className = 'anillo';
  d.setAttribute('role', 'img');
  d.setAttribute('aria-label', `${minutos} de ${objetivo} minutos hoy`);
  d.innerHTML = `<svg width="76" height="76" viewBox="0 0 76 76"><circle class="fondo" cx="38" cy="38" r="32"/>`
    + `<circle class="valor${f > 0 ? '' : ' vacio'}" cx="38" cy="38" r="32" stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="${CIRC.toFixed(1)}"/></svg><b>${minutos}′</b>`;
  const v = d.querySelector('.valor');
  const pon = () => { v.style.strokeDashoffset = String(CIRC * (1 - f)); };
  if (quieto() || typeof requestAnimationFrame !== 'function') pon(); else requestAnimationFrame(() => requestAnimationFrame(pon));
  return d;
}

/** Dibujo de la actividad de hoy: la primera lámina de la clase (fija), o el icono del tipo de actividad. */
function dibujoDe(principal, curso) {
  const id = principal.tipo === 'clase' || principal.tipo === 'repaso' ? principal.ruta?.[1] : null;
  const L = id ? curso?.modulos?.flatMap((m) => m.lecciones).find((l) => l.id === id) : null;
  const spec = L?.pasos.find((p) => p.tipo === 'ilustracion' && !p.extra)?.spec;
  let svg = null;
  if (spec) {
    try { const def = interactivaDe(spec); svg = def ? dibujoFijo(def, spec).svg : renderIllustration(spec)?.svg; } catch { svg = null; }
    // Una lámina con varias vistas (planta y perfil…) trae varios <svg>: en la tarjeta va solo la primera.
    if (svg) svg = svg.match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? svg;
  }
  if (svg) return h('div.pic', { 'aria-hidden': 'true', html: svg });
  return h('div.pic.pic-icono', icono((TIPO_TXT[principal.tipo] ?? ['brujula'])[0]));
}

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
  if (!fechaExamen || r.llega == null) return `${base}. Pon la fecha de tu examen en Ajustes y te digo si llegas.`;
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
    let principal = plan[0];
    const r = ritmoEstudio({ ...d, minutosDia: objetivo });
    const listo = estoyListo(T.estructura, d.preguntas, d.respuestas, d.tests);
    // Con fecha de examen manda el calendario (¿vas al día con tu plan?); sin ella, el ritmo general.
    const ps = planConSeguimiento(progress, tit, d);
    // Plan esencial: en los temas de poco peso, en vez de la clase toca su chuleta (la unidad del plan).
    if (ps?.plan.esencial && principal.tipo === 'clase' && temasDePocoPeso(T.estructura).includes(principal.ut)) {
      const u = unidades({ ...d, esencial: true, chuletasLeidas: s[`chuletasLeidas_${tit}`] ?? [] }).find((x) => x.id === `chuleta:${principal.ut}`);
      if (u && !u.hecha) principal = { tipo: 'chuleta', titulo: u.titulo, verbo: 'Leer', minutos: u.minutos, ruta: u.ruta, query: undefined, ut: u.ut };
    }
    const ritmo = ps
      ? h('div.ritmo', { class: marcaEstado(ps.seg.estado)[1] },
        h('p', marcaEstado(ps.seg.estado)[0], lineaSeguimiento(ps.seg, ps.plan.minutosDia), ' ', h('a', { href: tlink(tit, ['plan']) }, 'Ver mi plan')),
        botonSubirMinutos(progress, ps, () => window.dispatchEvent(new HashChangeEvent('hashchange')), tit))
      : h('p.ritmo', { class: r.llega === false ? 'warn' : '' }, r.llega === false ? '⚠️ ' : '', lineaRitmo(r, objetivo, fecha),
        ' ', h('a', { href: '#/ajustes' }, 'Cambiar'));

    const tarjeta = () => {
      const [ico, tipo] = TIPO_TXT[principal.tipo] ?? ['', ''];
      return h('section.hoy-toca',
        dibujoDe(principal, d.curso),
        h('div.tx',
          h('p.eti', 'Hoy toca'),
          h('h2', principal.titulo),
          h('p.linea', ico ? icono(ico) : null, ` ${tipo}${principal.tramo ? ` · tramo ${principal.tramo.i} de ${principal.tramo.de}` : ''} · unos ${principal.minutos} minutos`),
          h('a.btn.grande', { href: hrefActividad(tit, principal) }, principal.verbo)));
    };
    // La meta del día, con su anillo: cuánto llevas y qué te queda (en tramos como el de hoy, si es una clase).
    const quedan = Math.max(0, objetivo - minutos);
    const nTramos = principal.tipo === 'clase' && principal.minutos ? Math.ceil(quedan / principal.minutos) : null;
    const meta = h('section.meta-hoy', { class: minutos >= objetivo ? 'hecho' : '' },
      anilloMeta(minutos, objetivo),
      h('p', h('strong', minutos >= objetivo ? 'Meta de hoy cumplida' : minutos ? `Llevas ${minutos} de ${objetivo} minutos` : `Hoy: ${objetivo} minutos`),
        minutos >= objetivo ? `Has estudiado ${minutos} minutos.` : nTramos ? `${nTramos === 1 ? 'Te queda un tramo' : `Te quedan unos ${nTramos} tramos`} como el de hoy.`
          : `Te quedan ${quedan} minutos.`,
        racha >= 2 ? h('span.racha', icono('racha'), ` ${racha} días seguidos`) : null));
    const hueco = h('div');
    if (minutos >= objetivo) {
      setChildren(hueco, h('section.hoy-toca.hecho', h('div.tx',
        h('p.eti', 'Hecho por hoy'),
        h('h2', `Mañana toca: ${principal.titulo}`),
        h('button.secondary.grande', { type: 'button', onclick: () => setChildren(hueco, tarjeta()) }, 'Seguir un poco más'))));
    } else {
      setChildren(hueco, tarjeta());
    }

    const resto = plan.slice(1);
    const cola = colaRepaso(d.preguntas, d.respuestas);
    const tarjetasHoy = tarjetasPorRepasar(mazos(tit), d.respuestas).length;
    summaryText = `VISTA hoy ${T.sigla}\n${plan.map((x, i) => `${i ? 'DESPUÉS' : 'HOY TOCA'}: ${x.tipo} «${x.titulo}» ~${x.minutos} min → ${hrefActividad(tit, x)}`).join('\n')}` +
      `\nRITMO: ${lineaRitmo(r, objetivo, fecha)} (pendiente ${r.minutosPendientes} min: clases ${r.desglose.clases}, preguntas ${r.desglose.preguntas}, simulacros ${r.desglose.simulacros})` +
      (ps ? `\nPLAN: ${lineaSeguimiento(ps.seg, ps.plan.minutosDia)} → ${tlink(tit, ['plan'])}` : '') +
      `\nLISTO: ${lineaListo(listo)}${listo.prob != null ? ` (p=${listo.prob.toFixed(2)})` : ''}` +
      `\nREPASO: ${cola.hoy.length} preguntas tocan hoy (${cola.total} en la cola) → ${tlink(tit, ['teoria', 'repaso'])} · 5 minutos → ${tlink(tit, ['teoria', 'rapido'])}` +
      `\nAVANCE: ${a.temasAlDia}/${a.temasTotal} temas al día · ${Math.round(a.fraccion * 100)} % · hoy ${minutos}/${objetivo} min · racha ${racha} días`;

    // Repaso de fallos y «5 minutos»: una línea discreta bajo la actividad del día, sin competir con «Empezar».
    const enPlan = plan.some((x) => x.tipo === 'fallos');
    const lineaRepaso = h('p.linea-repaso',
      cola.hoy.length && !enPlan ? [h('a', { href: tlink(tit, ['teoria', 'repaso']) }, `🔁 Tienes ${cola.hoy.length} ${cola.hoy.length === 1 ? 'pregunta' : 'preguntas'} por repasar`), ' · '] : null,
      tarjetasHoy ? [h('a', { href: tlink(tit, ['tarjetas', 'repaso']) }, `🃏 ${tarjetasHoy} ${tarjetasHoy === 1 ? 'tarjeta' : 'tarjetas'}`), ' · '] : null,
      h('a.btn.secondary.boton-icono', { href: tlink(tit, ['teoria', 'rapido'], { s: randomSeed() }) }, icono('reloj'), 'Tengo 5 minutos'));
    setChildren(el,
      cabecera,
      meta,
      hueco,
      ritmo,
      lineaRepaso,
      h('section.avance',
        h('div.bar', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(a.fraccion * 100) }, h('span', { style: `width:${Math.round(a.fraccion * 100)}%` })),
        h('p', lineaAvance(a, racha))),
      h('section.listo', { class: `listo-${listo.estado}` }, h('h2', '¿Estás listo para el examen?'), h('p', lineaListo(listo)),
        h('p.ver-progreso', h('a.btn.secondary.boton-icono', { href: '#/progreso' }, icono('progreso'), 'Ver mi progreso por temas'))),
      avisoCopia(progress),
      resto.length ? [h('h2', 'Después'), h('div.despues', resto.map((x) => h('a.card.compacta', { href: hrefActividad(tit, x) },
        h('h3', x.titulo), h('p', TIPO_TXT[x.tipo] ? icono(TIPO_TXT[x.tipo][0]) : null, ` unos ${x.minutos} minutos`))))] : null,
      h('p.ver-todo', h('a', { href: tlink(tit, ['temario']) }, 'Ver todo el temario →')),
    );
  }).catch((e) => setChildren(el, cabecera, h('p.warn', `No se pudo preparar el plan: ${e.message}`)));

  return { el, summary: () => summaryText };
}

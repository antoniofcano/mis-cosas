// #/ y #/<tit> — Hoy: saludo, la actividad que toca (una sola acción principal), el avance y lo que viene después.

import { h, setChildren } from '../dom.js';
import { diasHasta, lineaAvance } from '../../course/plan.js';
import { lineaListo } from '../../course/listo.js';
import { mazos, tarjetasPorRepasar } from '../../course/tarjetas.js';
import { randomSeed } from '../../math/rng.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { icono } from '../iconos.js';
import { calcularPlan, hrefActividad, TIPO_TXT } from '../cierre.js';
import { avisoCopia } from '../copia.js';
import { planConSeguimiento, botonSubirMinutos, marcaEstado } from '../plan-estudio.js';
import { renderIllustration } from '../../illustrations/index.js';
import { interactivaDe, dibujoFijo } from '../../illustrations/interactivas.js';
import { quieto } from '../movimiento.js';
import { cuenta } from '../../texto.js';
import { ejesElegibles, indicadorEje } from '../eje.js';

const CIRC = 2 * Math.PI * 32; // perímetro del anillo de la meta (r = 32)

/** Anillo de la meta del día (como en la maqueta): se rellena hasta los minutos de hoy, con la cifra en el centro. */
export function anilloMeta(minutos, objetivo) {
  const f = Math.min(1, minutos / Math.max(1, objetivo));
  const d = document.createElement('div');
  d.className = 'anillo';
  d.setAttribute('role', 'img');
  d.setAttribute('aria-label', `${minutos} de ${cuenta(objetivo, 'minuto')} hoy`);
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

export function lineaExamen(sigla, dias, orientativa = false) {
  if (dias == null || dias < 0) return `Preparando el ${sigla}.`;
  if (orientativa) return `Fecha orientativa del examen de ${sigla}: dentro de ${cuenta(dias, 'día')}.`;
  if (dias === 0) return `Tu examen de ${sigla} es hoy.`;
  if (dias === 1) return `Tu examen de ${sigla} es mañana.`;
  return `Tu examen de ${sigla} es en ${cuenta(dias, 'día')}.`;
}

export function hoyView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();
  const fecha = s[`examen_${tit}`] || null;
  // Si hay más de un banco publicado, un indicador discreto de con qué exámenes se estudia (lleva a Ajustes).
  const indicador = h('p.indicador-eje-linea', { hidden: true });
  ejesElegibles().then((ejes) => { const i = indicadorEje(progress, ejes); if (i) { setChildren(indicador, i); indicador.hidden = false; } }).catch(() => {});
  const cabecera = [h('h1', saludo()), h('p.muted', lineaExamen(T.sigla, fecha ? diasHasta(fecha) : null, !!s[`examenOrientativo_${tit}`])), indicador];
  const el = h('div.hoy', cabecera, h('p.muted', 'Preparando tu plan…'));
  let summaryText = `VISTA hoy ${T.sigla} (cargando)`;

  calcularPlan(progress, tit).then((d) => {
    // Todo sale del motor de seguimiento (st): esta pantalla solo pinta.
    const { st } = d;
    const plan = st.actividades;
    const principal = st.principal;
    const { minutos, objetivo, racha, cumplida } = st.dia;
    const a = st.camino;
    const r = st.ritmo;
    const listo = st.listo;
    const ps = planConSeguimiento(progress, tit, d);
    const m = st.mensaje;
    // Cómo vas (un solo mensaje, ya decidido por el motor) y, si hace falta, cómo arreglarlo de un toque.
    const ritmo = h('div.ritmo', { class: m.aviso ? 'warn' : '' },
      h('p', marcaEstado(m.tipo === 'toca' && ps ? ps.seg.estado : 'al-dia')[0], m.texto, ps && m.tipo === 'toca' ? [' ', h('a', { href: tlink(tit, ['plan']) }, 'Ver mi plan')] : null),
      m.detalle ? h('p.muted.small', m.detalle) : null,
      m.aviso && ps ? botonSubirMinutos(progress, ps, () => window.dispatchEvent(new HashChangeEvent('hashchange')), tit) : null,
      !ps ? h('div.botones-ritmo',
        fecha ? null : h('a.btn.boton-icono', { href: '#/ajustes?campo=fecha' }, icono('reloj'), 'Poner fecha de examen'),
        h('a.btn.secondary', { href: '#/ajustes?campo=minutos' }, 'Cambiar minutos al día')) : null);

    const tarjeta = () => {
      const [ico, tipo] = TIPO_TXT[principal.tipo] ?? ['', ''];
      return h('section.hoy-toca',
        dibujoDe(principal, d.curso),
        h('div.tx',
          h('p.eti', 'Hoy toca'),
          h('h2', principal.titulo),
          h('p.linea', ico ? icono(ico) : null, ` ${tipo}${principal.tramo ? ` · tramo ${principal.tramo.i} de ${principal.tramo.de}` : ''} · unos ${cuenta(principal.minutos, 'minuto')}`),
          h('a.btn.grande', { href: hrefActividad(tit, principal) }, principal.verbo),
          // Un examen empezado por error no puede quedarse anclado en Hoy: se descarta de un toque (con confirmación).
          principal.tipo === 'examen-en-curso' ? h('button.secondary.descartar-examen', { type: 'button', onclick: () => {
            if (confirm('¿Descartar el examen que tienes a medias? Se perderán sus respuestas.')) { progress.saveTestEnCurso(null); dispatchEvent(new HashChangeEvent('hashchange')); }
          } }, 'Descartar este examen') : null));
    };
    // La meta del día, con su anillo: cuánto llevas y cuánto te queda (los mismos minutos que suma el motor).
    const meta = h('section.meta-hoy', { class: cumplida ? 'hecho' : '' },
      anilloMeta(minutos, objetivo),
      h('p', h('strong', cumplida ? 'Meta de hoy cumplida' : minutos ? `Llevas ${minutos} de ${cuenta(objetivo, 'minuto')}` : `Hoy: ${cuenta(objetivo, 'minuto')}`),
        cumplida ? `Has estudiado ${cuenta(minutos, 'minuto')}.` : `Te ${st.dia.quedan === 1 ? 'queda 1 minuto' : `quedan ${cuenta(st.dia.quedan, 'minuto')}`}.`,
        racha >= 2 ? h('span.racha', icono('racha'), ` ${cuenta(racha, 'día seguido', 'días seguidos')}`) : null));
    const hueco = h('div');
    if (cumplida) {
      setChildren(hueco, h('section.hoy-toca.hecho', h('div.tx',
        h('p.eti', 'Hecho por hoy'),
        h('h2', principal.tipo === 'clase' && principal.verbo === 'Continuar'
          ? `Mañana sigues con: ${principal.titulo}${principal.tramo ? ` (tramo ${principal.tramo.i} de ${principal.tramo.de})` : ''}`
          : `Mañana toca: ${principal.titulo}`),
        h('button.secondary.grande', { type: 'button', onclick: () => setChildren(hueco, tarjeta()) }, 'Seguir un poco más'))));
    } else {
      setChildren(hueco, tarjeta());
    }

    const resto = plan.slice(1);
    const cola = st.repaso; // del motor
    const tarjetasHoy = tarjetasPorRepasar(mazos(tit), d.respuestas).length;
    summaryText = `VISTA hoy ${T.sigla}\n${plan.map((x, i) => `${i ? 'DESPUÉS' : 'HOY TOCA'}: ${x.tipo} «${x.titulo}» ~${x.minutos} min → ${hrefActividad(tit, x)}`).join('\n')}` +
      `\nDÍA: ${m.tipo} · ${m.texto}${m.detalle ? ` ${m.detalle}` : ''} (pendiente ${r.minutosPendientes} min: clases ${r.desglose.clases}, preguntas ${r.desglose.preguntas}, simulacros ${r.desglose.simulacros})` +
      `\nLISTO: ${lineaListo(listo)}${listo.prob != null ? ` (p=${listo.prob.toFixed(2)})` : ''}` +
      `\nREPASO: ${cuenta(cola.hoy, 'pregunta toca', 'preguntas tocan')} hoy (${cola.total} en la cola) → ${tlink(tit, ['teoria', 'repaso'])} · 5 minutos → ${tlink(tit, ['teoria', 'rapido'])}` +
      `\nAVANCE: ${a.temasAlDia}/${cuenta(a.temasTotal, 'tema')} al día · ${Math.round(a.fraccion * 100)} % · hoy ${minutos}/${objetivo} min · racha ${cuenta(racha, 'día')}`;

    // Repaso de fallos y «5 minutos»: una línea discreta bajo la actividad del día, sin competir con «Empezar».
    const enPlan = plan.some((x) => x.tipo === 'fallos');
    const lineaRepaso = h('p.linea-repaso',
      cola.hoy && !enPlan ? [h('a', { href: tlink(tit, ['teoria', 'repaso']) }, `🔁 Tienes ${cuenta(cola.hoy, 'pregunta')} por repasar`), ' · '] : null,
      tarjetasHoy ? [h('a', { href: tlink(tit, ['tarjetas', 'repaso']) }, `🃏 ${cuenta(tarjetasHoy, 'tarjeta', 'tarjetas')}`), ' · '] : null,
      h('a.btn.secondary.boton-icono', { href: tlink(tit, ['teoria', 'rapido'], { s: randomSeed() }) }, icono('reloj'), 'Tengo 5 minutos'));
    setChildren(el,
      cabecera,
      hueco,
      meta,
      // La guía de bienvenida se ofrece hasta que se abre o se descarta (luego queda en Biblioteca y Ajustes).
      progress.settings()[`guiaVista_${tit}`] ? null : (() => {
        const oferta = h('section.guia-oferta',
          h('p', h('strong', '¿Primera vez?'), ' Te cuento en 3 minutos cómo funciona el curso y cómo aprobar.'),
          h('div.guia-oferta-botones',
            h('a.btn', { href: tlink(tit, ['guia']) }, 'Ver cómo funciona'),
            h('button.secondary', { type: 'button', onclick: () => { progress.setSetting(`guiaVista_${tit}`, true); oferta.remove(); } }, 'Ahora no')));
        return oferta;
      })(),
      ritmo,
      lineaRepaso,
      // Lo demás, plegado: la portada dice qué toca, cuánto llevas hoy y cómo vas; nada más.
      h('details.mas-progreso', h('summary', 'Ver mi progreso'),
        h('section.avance',
          h('div.bar', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(a.fraccion * 100) }, h('span', { style: `width:${Math.round(a.fraccion * 100)}%` })),
          h('p', lineaAvance(a, racha))),
        h('section.listo', { class: `listo-${listo.estado}` }, h('h2', '¿Estás listo para el examen?'), h('p', lineaListo(listo)),
          h('p.ver-progreso', h('a.btn.secondary.boton-icono', { href: '#/progreso' }, icono('progreso'), 'Ver mi progreso por temas'))),
        resto.length ? [h('h2', 'Después'), h('div.despues', resto.map((x) => h('a.card.compacta', { href: hrefActividad(tit, x) },
        h('h3', x.titulo), h('p', TIPO_TXT[x.tipo] ? icono(TIPO_TXT[x.tipo][0]) : null, ` unos ${cuenta(x.minutos, 'minuto')}`))))] : null),
      avisoCopia(progress),
      h('p.ver-todo', h('a', { href: tlink(tit, ['temario']) }, 'Ver todo el temario →')),
    );
  }).catch((e) => setChildren(el, cabecera, h('p.warn', `No se pudo preparar el plan: ${e.message}`)));

  return { el, summary: () => summaryText };
}

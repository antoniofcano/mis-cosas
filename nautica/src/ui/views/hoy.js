// #/ y #/<tit> — Hoy: la fase en la que estás (Aprender · Mezclar · Comprobar) y por qué, la sesión de hoy con un solo
// botón («Empezar la sesión») y sus pasos, y la sugerencia del podcast del tema que estudias. Lo demás (avance, ¿estás
// listo?, lo que viene después) va plegado. La fase y los pasos salen del motor (src/course/motor.js) y de
// src/course/sesion.js; el ejecutor de la sesión es #/<tit>/sesion (src/ui/sesion.js).

import { h, setChildren } from '../dom.js';
import { marcaConfig } from '../config-profe.js';
import { lineaAvance } from '../../course/plan.js';
import { lineaListo, conceptosPorTema } from '../../course/listo.js';
import { FASES, deducirFase, textoFase, componerSesion, nuevaSesion, indiceActual, terminada, pausar, resumenSesion, lineaTeCuesta } from '../../course/sesion.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { icono } from '../iconos.js';
import { calcularPlan, hrefActividad, TIPO_TXT } from '../cierre.js';
import { avisoCopia } from '../copia.js';
import { planConSeguimiento, botonSubirMinutos, marcaEstado } from '../plan-estudio.js';
import { quieto } from '../movimiento.js';
import { cuenta } from '../../texto.js';
import { ejesElegibles, indicadorEje } from '../eje.js';
import { leerSesion, guardarSesion } from '../sesion.js';
import { episodiosDeClase, episodiosDeTema, enlaceEpisodio } from './podcast.js';
import { poner, estadoEpisodio } from '../radio.js';

const CIRC = 2 * Math.PI * 32; // perímetro del anillo de la meta (r = 32)

/** Anillo de la meta del día: se rellena hasta los minutos de hoy, con la cifra en el centro. */
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

/** La píldora de la cabecera: «PER · examen en 38 días» (lleva a poner o cambiar la fecha). */
function pildoraExamen(T, dias) {
  const txt = dias == null || dias < 0 ? `${T.sigla} · sin fecha` : dias === 0 ? `${T.sigla} · examen hoy` : dias === 1 ? `${T.sigla} · examen mañana` : `${T.sigla} · examen en ${cuenta(dias, 'día')}`;
  return h('a.pildora-examen', { href: '#/ajustes?campo=fecha', title: 'Fecha del examen' }, txt);
}

/** Lista de pasos de la sesión (número, título, subtítulo y minutos); con estado si la sesión está en marcha. */
function listaPasos(pasos, actual = -1) {
  return h('ol.pasos-sesion', pasos.map((p, i) => {
    const est = p.estado === 'hecho' ? 'hecho' : p.estado === 'saltado' ? 'saltado' : i === actual ? 'actual' : '';
    return h('li.paso-sesion', { class: est },
      h('span.ps-num', { 'aria-hidden': 'true' }, est === 'hecho' ? '✓' : est === 'saltado' ? '–' : String(i + 1)),
      h('span.ps-tx', h('span.ps-titulo', p.titulo), h('span.ps-sub', p.sub)),
      h('span.ps-min', { 'aria-label': cuenta(p.minutos, 'minuto') }, `${p.minutos}′`),
      est === 'hecho' || est === 'saltado' ? h('span.visualmente-oculto', est === 'hecho' ? ' (hecho)' : ' (saltado)') : null);
  }));
}

/** Tema que se está estudiando: el del primer paso con tema (la clase o las preguntas). */
const pasoConTema = (pasos) => pasos.find((p) => p.ut != null) ?? null;

/** «¿Vas en el coche?»: el episodio con audio de la clase o del tema que toca. Se rellena cuando carga el podcast. */
function tarjetaPodcast(tit, p) {
  const el = h('section.podcast-hoy', { hidden: true });
  if (!p) return el;
  const clase = p.ruta[0] === 'curso' ? p.ruta[1] : null;
  (clase ? episodiosDeClase(tit, clase) : Promise.resolve([]))
    .then((xs) => (xs.some((e) => e.audio) ? xs : episodiosDeTema(tit, p.ut)))
    .then((xs) => {
      const conAudio = xs.filter((e) => e.audio);
      const ep = conAudio.find((e) => !estadoEpisodio(e.id).oido) ?? conAudio[0];
      if (!ep) return;
      setChildren(el,
        h('span.podcast-hoy-ico', icono('podcast')),
        h('a.podcast-hoy-tx', { href: enlaceEpisodio(tit, ep, '') },
          h('span.muted.small', '¿Vas en el coche?'),
          h('span.podcast-hoy-titulo', `Podcast del tema que estudias: «${ep.titulo}»`)),
        h('button.podcast-hoy-play', { type: 'button', 'aria-label': `Escuchar «${ep.titulo}»`, title: 'Escuchar', onclick: () => poner(tit, ep) },
          h('span.ico', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' })));
      el.hidden = false;
    }).catch(() => {});
  return el;
}

/**
 * Apoyo por concepto bajo «¿Estás listo?» (no cambia la probabilidad): cuántas ideas lleva sabidas y cuántas faltan.
 * null sin etiquetas.
 */
function lineaIdeas(temas) {
  if (!temas?.length) return null;
  const total = temas.reduce((x, t) => x + t.total, 0);
  const sabidas = temas.reduce((x, t) => x + t.sabidas, 0);
  const flojas = temas.reduce((x, t) => x + t.flojas.length, 0);
  const sinVer = total - sabidas - flojas;
  const peor = [...temas].sort((a, b) => b.flojas.length - a.flojas.length || (b.maxErrores != null) - (a.maxErrores != null))[0];
  const faltan = [flojas ? cuenta(flojas, 'floja', 'flojas') : null, sinVer ? `${sinVer} sin ver` : null].filter(Boolean).join(' y ');
  return h('p.listo-ideas', `Por ideas: llevas ${sabidas} de ${cuenta(total, 'idea')} sabidas${faltan ? `; te faltan ${faltan}` : ''}.`,
    peor?.flojas.length ? ` Las flojas, sobre todo en ${peor.titulo}.` : '');
}

export function hoyView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();
  // Una sesión en marcha que se deja para venir a Hoy queda parada (se sigue desde aquí).
  const enMarcha = leerSesion(progress, tit);
  if (enMarcha?.estado === 'en-curso') guardarSesion(progress, tit, pausar(enMarcha));

  // Si hay más de un banco publicado, un indicador discreto de con qué exámenes se estudia (lleva a Ajustes).
  const indicador = h('p.indicador-eje-linea', { hidden: true });
  ejesElegibles().then((ejes) => { const i = indicadorEje(progress, ejes); if (i) { setChildren(indicador, i); indicador.hidden = false; } }).catch(() => {});
  const pildora = h('span.pildora-hueco');
  const cabecera = h('header.hoy-cab',
    h('div', h('p.hoy-saludo', saludo()), h('h1', 'Lo de hoy')),
    pildora);
  const el = h('div.hoy', cabecera, indicador, h('p.muted', 'Preparando tu sesión…'));
  let summaryText = `VISTA hoy ${T.sigla} (cargando)`;

  calcularPlan(progress, tit).then((d) => {
    // Todo sale del motor de seguimiento (st) y de la sesión (course/sesion.js): esta pantalla solo pinta.
    const { st } = d;
    const { minutos, objetivo, racha } = st.dia;
    const a = st.camino;
    const listo = st.listo;
    const ps = planConSeguimiento(progress, tit, d);
    const m = st.mensaje;
    const real = deducirFase(st);
    let mirando = real.id; // la fase que se enseña (el alumno puede mirar otra; su plan no cambia)
    setChildren(pildora, pildoraExamen(T, st.diasAlExamen));

    // --- la fase
    const faseEl = h('section.fase-hoy', { 'aria-labelledby': 'fase-titulo' });
    // --- la sesión
    const sesionEl = h('section.sesion-hoy', { 'aria-labelledby': 'sesion-titulo' });
    const podcastHueco = h('div');

    const pintaFase = () => {
      const f = textoFase(mirando, real);
      setChildren(faseEl,
        h('div.fase-cab', h('h2#fase-titulo.eti', 'Tu fase'), h('span.muted.small', f.detalle)),
        h('div.fases', { role: 'group', 'aria-label': 'Fases del estudio' }, FASES.map((x, i) => h('button.fase', {
          type: 'button', 'aria-pressed': String(x.id === mirando), class: x.id === real.id ? 'real' : '',
          onclick: () => { mirando = x.id; pintaFase(); pintaSesion(); },
        }, h('span.fase-num', `Fase ${i + 1}`), h('span.fase-nombre', x.nombre)))),
        h('p.fase-porque', f.porque),
        mirando !== real.id ? h('p.fase-mirando', 'Solo estás mirando: tu plan sigue en ', h('strong', FASES.find((x) => x.id === real.id).nombre), '. ',
          h('button.linklike', { type: 'button', onclick: () => { mirando = real.id; pintaFase(); pintaSesion(); } }, 'Volver a mi fase')) : null);
    };

    const empezar = (comp) => {
      const hrefs = comp.pasos.map((p) => hrefActividad(tit, p));
      guardarSesion(progress, tit, nuevaSesion(tit, comp, { hrefs, minutosAntes: progress.minutosHoy() }));
      location.hash = tlink(tit, ['sesion']);
    };
    const descartarExamen = () => h('button.linklike.descartar-examen', { type: 'button', onclick: () => {
      if (confirm('¿Descartar el examen que tienes a medias? Se perderán sus respuestas.')) { progress.saveTestEnCurso(null); dispatchEvent(new HashChangeEvent('hashchange')); }
    } }, 'Descartar el examen a medias');

    // Diagnóstico por concepto (solo con etiquetas y si hay ideas flojas): «Te cuesta: …».
    const cuesta = lineaTeCuesta(st);
    const lineaCuesta = () => (cuesta ? h('p.sesion-cuesta', cuesta) : null);
    const pintaSesion = () => {
      const guardada = leerSesion(progress, tit);
      const comp = componerSesion(st, mirando);
      let tema = pasoConTema(comp.pasos);
      if (mirando !== real.id) {
        // Mirando otra fase: así sería la sesión, sin botón de empezar (el plan es el de su fase).
        setChildren(sesionEl,
          h('div.sesion-cab', h('h2#sesion-titulo', `Sesión en «${FASES.find((x) => x.id === mirando).nombre}»`), h('span.sesion-min', cuenta(comp.minutos, 'min', 'min'))),
          listaPasos(comp.pasos),
          h('p.sesion-nota', 'Así sería tu sesión en esta fase. La de hoy es la de tu fase.'),
          h('button.boton-sesion.secundario', { type: 'button', onclick: () => { mirando = real.id; pintaFase(); pintaSesion(); } }, 'Volver a mi sesión'));
      } else if (guardada && guardada.estado === 'hecha') {
        const r = resumenSesion(guardada, { respuestas: progress.get().exams, porId: d.banco.porId, minutosHoy: progress.minutosHoy() });
        tema = pasoConTema(guardada.pasos);
        setChildren(sesionEl,
          h('div.sesion-cab', h('h2#sesion-titulo', 'Sesión de hoy hecha'), h('span.sesion-min', icono('ok'))),
          h('p.sesion-linea', r.total ? `${r.aciertos} de ${cuenta(r.total, 'pregunta')} bien${r.minutos ? `, en ${cuenta(r.minutos, 'minuto')}` : ''}.` : `${r.hechos} de ${cuenta(r.pasos, 'paso')} hechos.`),
          listaPasos(guardada.pasos),
          h('a.boton-sesion', { href: tlink(tit, ['sesion']) }, 'Ver el resumen'),
          h('button.boton-sesion.secundario', { type: 'button', onclick: () => empezar(comp) }, 'Hacer otra sesión'));
      } else if (guardada && !terminada(guardada)) {
        const i = indiceActual(guardada);
        tema = pasoConTema(guardada.pasos.slice(i)) ?? tema;
        const min = guardada.pasos.filter((p) => p.estado === 'pendiente').reduce((x, p) => x + p.minutos, 0);
        setChildren(sesionEl,
          h('div.sesion-cab', h('h2#sesion-titulo', 'Sesión a medias'), h('span.sesion-min', `quedan ${min} min`)),
          lineaCuesta(),
          listaPasos(guardada.pasos, i),
          h('a.boton-sesion', { href: tlink(tit, ['sesion']) }, `Seguir: ${guardada.pasos[i].titulo}`),
          h('p.sesion-nota', 'Se guardó por dónde ibas.'),
          h('button.linklike.otra-sesion', { type: 'button', onclick: () => { if (confirm('¿Dejar esta sesión y empezar una nueva con lo que toca ahora?')) empezar(comp); } }, 'Empezar una sesión nueva'));
      } else {
        setChildren(sesionEl,
          h('div.sesion-cab', h('h2#sesion-titulo', comp.titulo), h('span.sesion-min', `${comp.minutos} min`)),
          lineaCuesta(),
          listaPasos(comp.pasos),
          h('button.boton-sesion', { type: 'button', onclick: () => empezar(comp) }, 'Empezar la sesión'),
          h('p.sesion-nota', 'Puedes parar cuando quieras: se guarda por dónde vas.'),
          comp.pasos[0]?.tipo === 'examen-en-curso' ? descartarExamen() : null);
      }
      setChildren(podcastHueco, tarjetaPodcast(tit, tema));
      summaryText = `VISTA hoy ${T.sigla} · FASE ${real.id}${mirando !== real.id ? ` (mirando ${mirando})` : ''}: ${real.detalle}. ${real.porque}\n` +
        `SESIÓN${guardada ? ` (${guardada.estado})` : ''}: ${(guardada?.pasos ?? comp.pasos).map((p, j) => `${j + 1}. ${p.titulo} — ${p.sub} (${p.minutos} min)${p.estado && p.estado !== 'pendiente' ? ` [${p.estado}]` : ''} → ${p.href ?? hrefActividad(tit, p)}`).join(' · ')}\n` +
        `EMPEZAR: #/${tit}/sesion (ejecutor) · DÍA: ${m.tipo} · ${m.texto}${m.detalle ? ` ${m.detalle}` : ''}\nLISTO: ${lineaListo(listo)}\n` +
        (cuesta ? `DIAGNÓSTICO: ${cuesta}\n` : '') +
        `AVANCE: ${a.temasAlDia}/${cuenta(a.temasTotal, 'tema')} al día · ${Math.round(a.fraccion * 100)} % · hoy ${minutos}/${objetivo} min · racha ${cuenta(racha, 'día')}`;
    };
    pintaFase();
    pintaSesion();

    // Cómo vas: solo si hay algo que decidir (no llegas a tiempo) o un plan que seguir.
    const ritmo = m.aviso || (ps && m.tipo === 'toca') ? h('div.ritmo', { class: m.aviso ? 'warn' : '' },
      h('p', marcaEstado(m.tipo === 'toca' && ps ? ps.seg.estado : 'al-dia')[0], m.texto, ps && m.tipo === 'toca' ? [' ', h('a', { href: tlink(tit, ['plan']) }, 'Ver mi plan')] : null),
      m.detalle ? h('p.muted.small', m.detalle) : null,
      m.aviso && ps ? botonSubirMinutos(progress, ps, () => window.dispatchEvent(new HashChangeEvent('hashchange')), tit) : null) : null;

    const meta = h('p.meta-linea', icono('reloj'), ' ', st.dia.cumplida ? `Meta de hoy cumplida: ${cuenta(minutos, 'minuto')}` : `Hoy llevas ${minutos} de ${cuenta(objetivo, 'minuto')}`,
      racha >= 2 ? [' · ', h('span.racha', icono('racha'), ` ${cuenta(racha, 'día seguido', 'días seguidos')}`)] : null);

    const resto = st.actividades.slice(1);
    setChildren(el,
      cabecera,
      indicador,
      faseEl,
      sesionEl,
      ritmo,
      podcastHueco,
      meta,
      // La guía de bienvenida se ofrece hasta que se abre o se descarta (luego queda en Más y Ajustes).
      progress.settings()[`guiaVista_${tit}`] ? null : (() => {
        const oferta = h('section.guia-oferta',
          h('p', h('strong', '¿Primera vez?'), ' Te cuento en 3 minutos cómo funciona el curso y cómo aprobar.'),
          h('div.guia-oferta-botones',
            h('a.btn', { href: tlink(tit, ['guia']) }, 'Ver cómo funciona'),
            h('button.secondary', { type: 'button', onclick: () => { progress.setSetting(`guiaVista_${tit}`, true); oferta.remove(); } }, 'Ahora no')));
        return oferta;
      })(),
      // Lo demás, plegado: la portada dice en qué fase estás y qué haces hoy; nada más.
      h('details.mas-progreso', h('summary', 'Ver mi progreso'),
        h('div.meta-hoy', { class: st.dia.cumplida ? 'hecho' : '' }, anilloMeta(minutos, objetivo),
          h('p', h('strong', st.dia.cumplida ? 'Meta de hoy cumplida' : `Hoy: ${cuenta(objetivo, 'minuto')}`), st.dia.cumplida ? `Has estudiado ${cuenta(minutos, 'minuto')}.` : `Te ${st.dia.quedan === 1 ? 'queda 1 minuto' : `quedan ${cuenta(st.dia.quedan, 'minuto')}`}.`)),
        h('section.avance',
          h('div.bar', { role: 'progressbar', 'aria-label': 'Avance del camino', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(a.fraccion * 100) }, h('span', { style: `width:${Math.round(a.fraccion * 100)}%` })),
          h('p', lineaAvance(a, racha))),
        !ritmo ? h('p.muted', m.texto, m.detalle ? ` ${m.detalle}` : '') : null,
        h('section.listo', { class: `listo-${listo.estado}` }, h('h2', '¿Estás listo para el examen?'), h('p', lineaListo(listo)),
          lineaIdeas(conceptosPorTema(T.estructura, d.indiceConceptos, d.respuestas)),
          h('p.ver-progreso', h('a.btn.secondary.boton-icono', { href: '#/progreso' }, icono('progreso'), 'Ver mi progreso por temas'))),
        resto.length ? [h('h2', 'Si te sobra tiempo'), h('div.despues', resto.map((x) => h('a.card.compacta', { href: hrefActividad(tit, x) },
          h('h3', x.titulo), h('p', TIPO_TXT[x.tipo] ? icono(TIPO_TXT[x.tipo][0]) : null, ` unos ${cuenta(x.minutos, 'minuto')}`))))] : null,
        h('p', h('a.btn.secondary.boton-icono', { href: tlink(tit, ['teoria', 'rapido']) }, icono('reloj'), 'Tengo 5 minutos'))),
      avisoCopia(progress),
      h('p.ver-todo', h('a', { href: tlink(tit, ['temario']) }, 'Ver todo el temario →')),
      marcaConfig(),
    );
  }).catch((e) => setChildren(el, cabecera, h('p.warn', `No se pudo preparar el plan: ${e.message}`)));

  return { el, summary: () => summaryText };
}

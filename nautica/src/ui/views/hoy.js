// #/ y #/<tit> — Hoy, la entrada única (docs/ENTRADA.md): en un vistazo, dónde estás en tu derrota (la carta de la
// Travesía en compacto, con el marcador «estás aquí»), qué toca ahora (la tarjeta «Siguiente parada») y un solo botón
// para seguir. Debajo, una fila de estado (rango, semana, ¿estás listo?) y lo secundario (test de nivel, podcast,
// progreso, minutos de hoy). La fase y los pasos salen del motor (src/course/motor.js) y de src/course/sesion.js; la
// composición, de src/course/entrada.js; el ejecutor de la sesión es #/<tit>/sesion (src/ui/sesion.js).

import { h, setChildren } from '../dom.js';
import { marcaConfig } from '../config-profe.js';
import { lineaAvance } from '../../course/plan.js';
import { lineaListo, conceptosPorTema } from '../../course/listo.js';
import { FASES, deducirFase, textoFase, componerSesion, indiceActual, terminada, pausar, resumenSesion, lineaTeCuesta, lineaManana } from '../../course/sesion.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { icono } from '../iconos.js';
import { calcularPlan, hrefActividad, TIPO_TXT } from '../cierre.js';
import { avisoCopia } from '../copia.js';
import { tarjetaInstalar } from '../instalar.js';
import { tarjetaAvisos } from '../recordatorio.js';
import { planConSeguimiento, botonSubirMinutos, marcaEstado } from '../plan-estudio.js';
import { quieto } from '../movimiento.js';
import { cuenta } from '../../texto.js';
import { ejesElegibles, indicadorEje } from '../eje.js';
import { leerSesion, guardarSesion } from '../sesion.js';
import { episodiosDeClase, episodiosDeTema, enlaceEpisodio } from './podcast.js';
import { poner, estadoEpisodio } from '../radio.js';
import { clasesQueSabes, puntoDePartida } from '../../course/nivel.js';
import { nivelEnCurso, claveNoNivel, saltarClases, empiezaPor } from './nivel.js';
import { semanaDe } from '../../course/travesia.js';
import { sincronizarTravesia } from '../travesia.js';
import { cartaDerrota } from './travesia.js';
import { esNuevo, estadoEntrada, siguienteParada, paradaDeSesion, resumenPasos, lineaContexto, listoCorto, textoCarta } from '../../course/entrada.js';
import { empezarSesion, marcaDerrota, pasosQueTocan } from '../entrada.js';
import { calcularSemana, apuntarSemana, botonSalir, botonVolver, tarjetaComoFue, enlaceSemana } from '../semana.js';
import { rotuloSemana } from '../../course/semana.js';
import { momentoExamen, recordatorioAdmitidos, claveConvocatoria } from '../../course/convocatoria.js';
import { convocatoriaDe, tarjetaExamenCerca, tarjetaAdmitidos, lineaConvocatoria } from '../convocatoria.js';

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

const DIA = 864e5;
const MARCA_DIA = { estudio: 'estudiaste', descanso: 'día de descanso', hoy: 'hoy', libre: 'sin estudiar', futuro: 'aún no ha llegado' };

/** La semana en siete puntos (con el día de descanso), para la fila de estado. */
const puntosSemana = (sem) => h('span.entrada-dias', { 'aria-hidden': 'true' }, sem.dias.map((x) => h('span.entrada-dia', { class: x.estado, title: `${x.nombre}: ${MARCA_DIA[x.estado]}` })));

/** Barra fina (rango o camino) con su nombre accesible. */
const barraFina = (fraccion, etiqueta) => h('span.barra-fina', { role: 'progressbar', 'aria-label': etiqueta, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(fraccion * 100)) },
  h('span', { style: `width:${Math.round(fraccion * 100)}%` }));

export function hoyView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const s = progress.settings();
  // Una sesión en marcha que se deja para venir a Hoy queda parada (se sigue desde aquí).
  const enMarcha = leerSesion(progress, tit);
  if (enMarcha?.estado === 'en-curso') guardarSesion(progress, tit, pausar(enMarcha));

  // Cabecera mínima: saludo y una línea de contexto (titulación y examen; lleva a poner o cambiar la fecha). Si hay más
  // de un banco publicado, el indicador discreto de con qué exámenes se estudia (lleva a Ajustes).
  const indicador = h('span.indicador-eje-linea', { hidden: true });
  ejesElegibles().then((ejes) => { const i = indicadorEje(progress, ejes); if (i) { setChildren(indicador, i); indicador.hidden = false; } }).catch(() => {});
  const contexto = h('span.entrada-contexto-hueco');
  const cabecera = h('header.hoy-cab.entrada-cab',
    h('h1.entrada-saludo', saludo()),
    h('p.entrada-contexto', contexto, indicador));
  const el = h('div.hoy.entrada', cabecera, h('p.muted', 'Preparando tu sesión…'));
  let summaryText = `VISTA hoy ${T.sigla} (cargando)`;
  let travesiaTexto = '';
  let convTexto = '';

  calcularPlan(progress, tit).then((d) => {
    // Todo sale del motor de seguimiento (st), de la sesión (course/sesion.js) y de la entrada (course/entrada.js):
    // esta pantalla solo pinta.
    const { st } = d;
    const { minutos, objetivo, racha } = st.dia;
    const a = st.camino;
    const listo = st.listo;
    const ps = planConSeguimiento(progress, tit, d);
    const m = st.mensaje;
    const real = deducirFase(st);
    // «La semana antes» (src/course/semana.js, src/ui/semana.js): con el examen a 7 días o menos (o el modo activado a
    // mano), la sesión de hoy es la del plan de la semana. Un examen a medias va antes: se termina primero.
    apuntarSemana(progress, tit);
    const sx = calcularSemana(progress, tit, d);
    const enSemana = sx.estado.activo && st.principal?.tipo !== 'examen-en-curso';
    let mirando = real.id; // la fase que se enseña (el alumno puede mirar otra en la ayuda; su plan no cambia)
    setChildren(contexto, h('a.pildora-examen', { href: '#/ajustes?campo=fecha', title: 'Fecha del examen' }, lineaContexto(T.sigla, st.diasAlExamen)));

    // Test de nivel (solo con etiquetas): la oferta al alumno nuevo, su punto de partida y las clases que ya sabe.
    const ic = d.indiceConceptos;
    const eje = d.banco.eje.id;
    const nivel = ic ? progress.nivel(eje, tit) : null;
    const nivelMedias = ic ? nivelEnCurso(progress, eje, tit) : null;
    const respondidas = d.banco.estudio.filter((q) => d.respuestas[q.id]).length;
    const terminadas = st.temas.reduce((x, t) => x + t.e.clases.terminadas, 0);
    const nuevo = respondidas < 40 && terminadas < 5; // para ofrecer el test de nivel (criterio de siempre)
    const recien = esNuevo({ respondidas, terminadas }); // para el botón «Empezar» y el marcador en el inicio
    const saltables = ic ? clasesQueSabes({ curso: d.curso, ic, respuestas: d.respuestas, regs: d.regs, nivel, tit, ahora: d.ahora }) : [];

    // La travesía (solo con etiquetas de conceptos): la carta del héroe y el rango de la fila de estado.
    const sy = ic ? sincronizarTravesia(progress, eje, tit, ic, { respuestas: d.respuestas, ahora: d.ahora }) : null;
    const hrefTrav = tlink(tit, ['travesia']);

    // --- la fase: una etiqueta pequeña sobre la tarjeta; su explicación (y mirar otra fase) va plegada
    const faseEl = h('details.entrada-fase');
    // --- la tarjeta principal
    const sesionEl = h('section.sesion-hoy.entrada-cta', { 'aria-labelledby': 'sesion-titulo' });
    const podcastHueco = h('div');
    const heroeEl = h('div.entrada-heroe-hueco');
    let entrada = null;
    let parada = null;
    let pasosMarca = []; // lo que toca (para poner el marcador en su faro)

    const pintaFase = () => {
      const f = textoFase(mirando, real);
      const i = FASES.findIndex((x) => x.id === real.id);
      const abierto = faseEl.open;
      setChildren(faseEl,
        h('summary', h('span.entrada-fase-eti', `Fase ${i + 1} · ${FASES[i].nombre}`), h('span.entrada-fase-ayuda', '¿Qué es esto?')),
        h('div.entrada-fase-cuerpo',
          h('p.fase-porque', f.porque),
          h('p.muted.small', `${f.detalle}. Hay tres fases: aprender el temario, mezclar los temas y comprobarlo con simulacros. La elige tu avance, no tú; puedes mirar cómo sería tu sesión en otra.`),
          h('div.fases', { role: 'group', 'aria-label': 'Mirar otra fase' }, FASES.map((x, k) => h('button.fase', {
            type: 'button', 'aria-pressed': String(x.id === mirando), class: x.id === real.id ? 'real' : '',
            onclick: () => { mirando = x.id; pintaFase(); pintaSesion(); },
          }, h('span.fase-num', `Fase ${k + 1}`), h('span.fase-nombre', x.nombre)))),
          mirando !== real.id ? h('p.fase-mirando', 'Solo estás mirando: tu plan sigue en ', h('strong', FASES[i].nombre), '. ',
            h('button.linklike', { type: 'button', onclick: () => { mirando = real.id; pintaFase(); pintaSesion(); } }, 'Volver a mi fase')) : null));
      faseEl.open = abierto;
    };

    const empezar = (comp) => empezarSesion(progress, tit, d, comp);
    const descartarExamen = () => h('button.linklike.descartar-examen', { type: 'button', onclick: () => {
      if (confirm('¿Descartar el examen que tienes a medias? Se perderán sus respuestas.')) { progress.saveTestEnCurso(null); dispatchEvent(new HashChangeEvent('hashchange')); }
    } }, 'Descartar el examen a medias');

    const ofertaNivel = () => {
      if (!ic || nivel || (!nivelMedias && (!nuevo || s[claveNoNivel(eje, tit)]))) return null;
      // Secundaria frente a la sesión del día: superficie normal, icono, una línea, botón secundario y «Ahora no» como enlace.
      const caja = h('section.nivel-oferta', { 'aria-label': 'Test de nivel' },
        h('div.nivel-oferta-fila', h('span.nivel-oferta-ico', icono('diana')),
          h('p', h('strong', nivelMedias ? 'Test de nivel a medias.' : '¿Ya sabes algo?'),
            nivelMedias ? ' Sigue donde lo dejaste.' : ' Test de nivel: 20 preguntas, 8 min; te saltas las clases que ya sabes.')),
        h('div.nivel-oferta-botones',
          h('a.btn.secondary', { href: tlink(tit, ['nivel']) }, nivelMedias ? 'Seguir el test' : 'Hacer el test'),
          nivelMedias ? null : h('button.linklike.nivel-ahora-no', { type: 'button', onclick: () => { progress.setSetting(claveNoNivel(eje, tit), true); caja.remove(); } }, 'Ahora no')));
      return caja;
    };
    const lineaPartida = () => {
      if (!nivel || real.id !== 'aprender') return null;
      const p = puntoDePartida(nivel, ic, d.respuestas);
      const primera = empiezaPor(d.curso, d.regs, d.respuestas, saltables);
      return h('p.punto-partida', h('strong', 'Tu punto de partida: '), `dominas ${p.sabidas} de ${cuenta(p.total, 'idea')} del test`,
        primera ? ['; empiezas por ', h('strong', `«${primera.titulo}»`)] : '', '. ', h('a', { href: tlink(tit, ['nivel']) }, 'Ver el resultado'));
    };
    // «Ya lo sabes: saltar» en la clase con que empieza la sesión, si ya sabe lo que enseña.
    const ofertaSaltar = (pasos) => {
      const p = pasos.find((x) => x.tipo === 'clase');
      const x = p && saltables.find((y) => y.l.id === p.ruta[1]);
      if (!x) return null;
      return h('p.saltar-clase', `«${x.l.titulo}» ya la sabes${x.porTest ? ' (test de nivel)' : ''}. `,
        h('button.linklike', { type: 'button', onclick: () => { saltarClases(progress, [x.l.id]); dispatchEvent(new HashChangeEvent('hashchange')); } }, 'Ya lo sabes: saltar'));
    };

    // Diagnóstico por concepto (solo con etiquetas y si hay ideas flojas): «Te cuesta: …».
    const cuesta = lineaTeCuesta(st);
    const lineaCuesta = () => (cuesta ? h('p.sesion-cuesta', h('strong', 'Te cuesta: '), cuesta.replace(/^Te cuesta: /, '')) : null);
    /** Los pasos, plegados bajo su línea resumen («3 pasos · 21 min»). */
    const plegarPasos = (pasos, ...dentro) => h('details.entrada-pasos', h('summary', h('span', resumenPasos(pasos)), h('span.entrada-pasos-ver', 'Ver los pasos')), h('div.entrada-pasos-cuerpo', ...dentro));
    const cabTarjeta = (eti, derecha) => h('div.entrada-cta-cab', h('span.entrada-cta-eti', eti), derecha ? h('span.sesion-min', derecha) : null);
    const nombreParada = (p) => [h('h2#sesion-titulo.entrada-parada', p?.nombre ?? 'Lo que proponga tu plan'), p?.tipo ? h('p.entrada-parada-tipo', p.tipo) : null];

    const pintaSesion = () => {
      const guardada = leerSesion(progress, tit);
      const normal = componerSesion(st, mirando);
      const comp = enSemana && mirando === real.id && sx.comp ? sx.comp : normal;
      let tema = pasoConTema(comp.pasos);
      entrada = estadoEntrada({ sesion: guardada, terminada: terminada(guardada), nuevo: recien, carta: !!sy });
      if (mirando !== real.id) {
        // Mirando otra fase: así sería la sesión, sin botón de empezar (el plan es el de su fase).
        parada = paradaDeSesion(comp.pasos);
        setChildren(sesionEl,
          cabTarjeta(`Así sería en «${FASES.find((x) => x.id === mirando).nombre}»`, `${comp.minutos} min`),
          nombreParada(parada),
          listaPasos(comp.pasos),
          h('p.sesion-nota', 'Así sería tu sesión en esta fase. La de hoy es la de tu fase.'),
          h('button.boton-sesion.secundario', { type: 'button', onclick: () => { mirando = real.id; pintaFase(); pintaSesion(); } }, 'Volver a mi sesión'));
      } else if (entrada.estado === 'hecho-hoy') {
        const r = resumenSesion(guardada, { respuestas: progress.get().exams, porId: d.banco.porId, minutosHoy: progress.minutosHoy() });
        tema = pasoConTema(guardada.pasos);
        parada = null;
        const manana = h('p.entrada-manana', h('strong', 'Mañana: '), 'calculando…');
        // Lo que toca mañana: la sesión que se compondría mañana con lo hecho hasta ahora (como el resumen de la sesión).
        if (enSemana && sx.plan.dias[1]) { const x = sx.plan.dias[1]; const t = `${x.titulo}${x.minutos ? ` (${x.minutos} min)` : ''}.`; setChildren(manana, h('strong', 'Mañana: '), t); summaryText += `\nMAÑANA: ${t}`; } else calcularPlan(progress, tit, Date.now() + DIA, { guardar: false })
          .then((dm) => { const t = lineaManana(componerSesion(dm.st, deducirFase(dm.st).id), { fallosManana: st.repaso.manana }); setChildren(manana, h('strong', 'Mañana: '), t); summaryText += `\nMAÑANA: ${t}`; })
          .catch(() => setChildren(manana, h('strong', 'Mañana: '), 'lo que proponga tu plan.'));
        setChildren(sesionEl,
          cabTarjeta('Sesión de hoy hecha', icono('ok', '', 'Hecha')),
          h('h2#sesion-titulo.entrada-parada', 'Hoy ya has navegado'),
          h('p.sesion-linea', r.total ? `${r.aciertos} de ${cuenta(r.total, 'pregunta')} bien${r.minutos ? `, en ${cuenta(r.minutos, 'minuto')}` : ''}.` : `${r.hechos} de ${cuenta(r.pasos, 'paso')} hechos.`),
          manana,
          h('div.entrada-acciones',
            h('a.boton-sesion', { href: tlink(tit, ['sesion']) }, 'Ver el parte de hoy'),
            h('button.boton-sesion.secundario', { type: 'button', onclick: () => empezar(normal) }, 'Repaso extra')),
          enSemana ? h('div.semana-enlaces', enlaceSemana(tit)) : null,
          plegarPasos(guardada.pasos, listaPasos(guardada.pasos)));
      } else if (entrada.estado === 'a-medias') {
        const i = indiceActual(guardada);
        tema = pasoConTema(guardada.pasos.slice(i)) ?? tema;
        parada = paradaDeSesion(guardada.pasos.slice(i), { actual: true });
        const min = guardada.pasos.filter((p) => p.estado === 'pendiente').reduce((x, p) => x + p.minutos, 0);
        setChildren(sesionEl,
          cabTarjeta(guardada.semana && enSemana ? `${rotuloSemana(sx.estado.dias)} · a medias` : 'Sesión a medias', `quedan ${min} min`),
          nombreParada(parada),
          h('a.boton-sesion.entrada-seguir', { href: tlink(tit, ['sesion']) }, 'Seguir'),
          plegarPasos(guardada.pasos, lineaCuesta(), listaPasos(guardada.pasos, i), h('p.sesion-nota', 'Se guardó por dónde ibas.')),
          h('button.linklike.otra-sesion', { type: 'button', onclick: () => { if (confirm('¿Dejar esta sesión y empezar una nueva con lo que toca ahora?')) empezar(comp); } }, 'Empezar una sesión nueva'));
      } else if (enSemana) {
        // La tarjeta de la semana: lo de hoy (o, el día del examen, solo ánimo), su botón, ver la semana y salir del modo.
        const dia = sx.plan.dias[0];
        parada = sx.comp ? paradaDeSesion(sx.comp.pasos) : null;
        setChildren(sesionEl,
          cabTarjeta(rotuloSemana(sx.estado.dias), dia.minutos ? `${dia.minutos} min` : null),
          h('h2#sesion-titulo.entrada-parada', dia.titulo),
          h('p.sesion-linea', dia.texto),
          sx.comp ? h('button.boton-sesion.entrada-seguir', { type: 'button', onclick: () => empezar(sx.comp) }, 'Empezar') : null,
          sx.comp ? plegarPasos(sx.comp.pasos, listaPasos(sx.comp.pasos), h('p.sesion-nota', 'Puedes parar cuando quieras: se guarda por dónde vas.')) : null,
          h('div.semana-enlaces', enlaceSemana(tit), botonSalir(progress, tit, sx.estado)));
      } else {
        parada = paradaDeSesion(comp.pasos);
        setChildren(sesionEl,
          cabTarjeta('Siguiente parada', `${comp.minutos} min`),
          nombreParada(parada),
          h('button.boton-sesion.entrada-seguir', { type: 'button', onclick: () => empezar(comp) }, entrada.estado === 'nuevo' ? 'Empezar' : 'Seguir'),
          plegarPasos(comp.pasos, lineaPartida(), lineaCuesta(), listaPasos(comp.pasos), ofertaSaltar(comp.pasos),
            h('p.sesion-nota', 'Puedes parar cuando quieras: se guarda por dónde vas.')),
          comp.pasos[0]?.tipo === 'examen-en-curso' ? descartarExamen() : null);
      }
      setChildren(podcastHueco, tarjetaPodcast(tit, tema));
      pasosMarca = pasosQueTocan(mirando === real.id ? guardada : null, enSemana && sx.comp ? sx.comp : componerSesion(st, real.id));
      pintaHeroe();
      summaryText = `VISTA hoy ${T.sigla} · ENTRADA ${entrada.modo}${parada ? ` · SIGUIENTE PARADA: ${parada.nombre}${parada.tipo ? ` (${parada.tipo})` : ''}` : ''}\n` +
        `FASE ${real.id}${mirando !== real.id ? ` (mirando ${mirando})` : ''}: ${real.detalle}. ${real.porque}\n` +
        `SESIÓN${guardada ? ` (${guardada.estado})` : ''}: ${(guardada?.pasos ?? comp.pasos).map((p, j) => `${j + 1}. ${p.titulo} — ${p.sub} (${p.minutos} min)${p.estado && p.estado !== 'pendiente' ? ` [${p.estado}]` : ''} → ${p.href ?? hrefActividad(tit, p)}`).join(' · ')}\n` +
        `SEGUIR: #/${tit}/sesion (ejecutor) · DÍA: ${m.tipo} · ${m.texto}${m.detalle ? ` ${m.detalle}` : ''}\nLISTO: ${lineaListo(listo)}\n` +
        (cuesta ? `DIAGNÓSTICO: ${cuesta}\n` : '') +
        (nivel ? `NIVEL: ${nivel.aciertos}/${nivel.total} bien · saltables ${saltables.map((x) => x.l.id).join(', ') || '—'}\n` : ic && nuevo ? `NIVEL: sin hacer (oferta${s[claveNoNivel(eje, tit)] ? ' descartada' : ''}) → #/${tit}/nivel\n` : '') +
        (enSemana ? `SEMANA: ${rotuloSemana(sx.estado.dias)} · hoy ${sx.plan.dias[0].tipo} (${sx.plan.dias[0].titulo}) → #/${tit}/semana\n` : '') +
        `AVANCE: ${a.temasAlDia}/${cuenta(a.temasTotal, 'tema')} al día · ${Math.round(a.fraccion * 100)} % · hoy ${minutos}/${objetivo} min · racha ${cuenta(racha, 'día')}`;
    };

    // --- el héroe: la carta de la derrota en compacto, con el marcador en la siguiente parada; toda ella abre la Travesía
    function pintaHeroe() {
      if (!sy) { setChildren(heroeEl); return; }
      const faros = sy.est.faros;
      const sig = siguienteParada(faros);
      const hecho = entrada?.estado === 'hecho-hoy';
      const marca = marcaDerrota(sy, pasosMarca);
      const alt = `${textoCarta({ faros, parada: hecho ? null : parada?.nombre, nuevo: recien, marca })}${hecho ? ' Hoy ya has navegado.' : ''} Abre tu derrota completa.`;
      const { carta } = cartaDerrota(faros, { marca, compacta: true });
      setChildren(heroeEl, h('section.entrada-heroe', { 'aria-label': 'Tu derrota' },
        h('div.entrada-heroe-cab', h('span.entrada-cta-eti', 'Tu derrota'),
          h('span.muted.small', `${sig.encendidos} de ${cuenta(sig.total, 'faro encendido', 'faros encendidos')}`)),
        h('a.entrada-carta', { href: hrefTrav, 'aria-label': alt }, carta),
        h('a.entrada-ver-derrota', { href: hrefTrav }, 'Ver mi derrota', h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›'))));
      travesiaTexto = `\nTRAVESÍA: rango ${sy.rango.actual.nombre} · ${sy.est.dominadas}/${sy.est.total} ideas dominadas · ${sig.encendidos}/${sig.total} faros · marcador en ${faros[marca]?.nombre ?? 'el examen'} → #/${tit}/travesia\nCARTA (texto alternativo): ${alt}`;
    }

    pintaFase();
    faseEl.hidden = enSemana; // en la semana del examen no hay fases: manda el plan de la semana
    pintaSesion();

    // --- tu convocatoria (R-44): la semana del examen, hora y sede con el acceso a la lista del día del examen (y, la víspera,
    // al repaso exprés); y, desde unas semanas antes, el recordatorio de comprobar la lista de admitidos.
    const momento = momentoExamen({ fechaExamen: st.fechaExamen, orientativa: st.orientativa, ahora: d.ahora });
    const aviso = recordatorioAdmitidos({ fechaExamen: st.fechaExamen, orientativa: st.orientativa, convocatoria: s[claveConvocatoria(tit)], ahora: d.ahora });
    const conv = convocatoriaDe(progress, tit, d.ahora);
    const ficha = d.banco.eje;
    if (momento || aviso.mostrar) {
      convTexto = `\nEXAMEN: ${lineaConvocatoria({ fecha: st.fechaExamen, conv, ahora: d.ahora })} · faltan ${cuenta(st.diasAlExamen, 'día')} → lista #/${tit}/dia-examen${momento === 'vispera' ? ` · repaso exprés #/${tit}/vispera` : ''}${aviso.mostrar ? '\nRECORDATORIO: ¿Ya has comprobado que estás en la lista de admitidos y el lugar del examen? (la app no puede consultar el boletín: lo mira el alumno en su convocatoria)' : ''}`;
    }

    // --- la fila de estado: rango (o camino), semana y «¿Estás listo?» en una línea; cada una lleva a su detalle
    const progresoEl = h('details.mas-progreso');
    const sem = sy?.est.semana ?? semanaDe(progress.get().dias ?? {}, d.ahora);
    const pctCamino = Math.round(a.fraccion * 100);
    const flecha = () => h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›');
    const estadoEl = h('section.entrada-estado', { 'aria-label': 'Cómo vas' },
      sy ? h('a.entrada-dato', { href: hrefTrav },
        h('span.entrada-dato-eti', 'Rango'), h('strong', sy.rango.actual.nombre),
        barraFina(sy.rango.fraccion, sy.rango.siguiente ? `Camino hacia ${sy.rango.siguiente.nombre}` : 'Camino completado'))
        : h('a.entrada-dato', { href: '#/progreso' },
          h('span.entrada-dato-eti', 'Tu camino'), h('strong', `${pctCamino} %`), barraFina(a.fraccion, 'Avance del camino')),
      h('a.entrada-dato', { href: sy ? hrefTrav : '#/progreso', 'aria-label': `Esta semana: ${sem.texto}` },
        h('span.entrada-dato-eti', 'Semana'), puntosSemana(sem), h('span.entrada-dato-pie', sem.texto)),
      sy ? h('a.entrada-dato.entrada-listo', { href: hrefTrav, class: `listo-${listo.estado}` }, h('span.entrada-dato-eti', '¿Estás listo?'), h('span.entrada-listo-tx', listoCorto(listo)), flecha())
        : h('button.entrada-dato.entrada-listo', { type: 'button', class: `listo-${listo.estado}`, onclick: () => { progresoEl.open = true; progresoEl.scrollIntoView({ block: 'start' }); } },
          h('span.entrada-dato-eti', '¿Estás listo?'), h('span.entrada-listo-tx', listoCorto(listo)), flecha()));

    // Cómo vas con el plan: solo si hay algo que decidir (no llegas a tiempo) o un plan que seguir.
    // En la semana del examen no se habla del ritmo del plan largo (no hay tiempo de recuperarlo): manda la semana.
    const ritmo = !enSemana && (m.aviso || (ps && m.tipo === 'toca')) ? h('div.ritmo', { class: m.aviso ? 'warn' : '' },
      h('p', marcaEstado(m.tipo === 'toca' && ps ? ps.seg.estado : 'al-dia')[0], m.texto, ps && m.tipo === 'toca' ? [' ', h('a', { href: tlink(tit, ['plan']) }, 'Ver mi plan')] : null),
      m.detalle ? h('p.muted.small', m.detalle) : null,
      m.aviso && ps ? botonSubirMinutos(progress, ps, () => window.dispatchEvent(new HashChangeEvent('hashchange')), tit) : null) : null;

    const meta = h('p.meta-linea', icono('reloj'), ' ', st.dia.cumplida ? `Meta de hoy cumplida: ${cuenta(minutos, 'minuto')}` : `Hoy llevas ${minutos} de ${cuenta(objetivo, 'minuto')}`,
      racha >= 2 ? [' · ', h('span.racha', icono('racha'), ` ${cuenta(racha, 'día seguido', 'días seguidos')}`)] : null);

    const resto = st.actividades.slice(1);
    setChildren(progresoEl, h('summary', 'Ver mi progreso'),
      h('div.meta-hoy', { class: st.dia.cumplida ? 'hecho' : '' }, anilloMeta(minutos, objetivo),
        h('p', h('strong', st.dia.cumplida ? 'Meta de hoy cumplida' : `Hoy: ${cuenta(objetivo, 'minuto')}`), st.dia.cumplida ? `Has estudiado ${cuenta(minutos, 'minuto')}.` : `Te ${st.dia.quedan === 1 ? 'queda 1 minuto' : `quedan ${cuenta(st.dia.quedan, 'minuto')}`}.`)),
      h('section.avance',
        h('div.bar', { role: 'progressbar', 'aria-label': 'Avance del camino', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pctCamino }, h('span', { style: `width:${pctCamino}%` })),
        h('p', lineaAvance(a, racha))),
      !ritmo ? h('p.muted', m.texto, m.detalle ? ` ${m.detalle}` : '') : null,
      h('section.listo', { class: `listo-${listo.estado}` }, h('h2', '¿Estás listo para el examen?'), h('p', listo.estado === 'listo' ? icono('ok', 'ico-t') : null, lineaListo(listo)),
        lineaIdeas(conceptosPorTema(T.estructura, d.indiceConceptos, d.respuestas)),
        h('p.ver-progreso', h('a.btn.secondary.boton-icono', { href: '#/progreso' }, icono('progreso'), 'Ver mi progreso por temas'))),
      resto.length ? [h('h2', 'Si te sobra tiempo'), h('div.despues', resto.map((x) => h('a.card.compacta', { href: hrefActividad(tit, x) },
        h('h3', x.titulo), h('p', TIPO_TXT[x.tipo] ? icono(TIPO_TXT[x.tipo][0]) : null, ` unos ${cuenta(x.minutos, 'minuto')}`))))] : null,
      h('p', h('a.btn.secondary.boton-icono', { href: tlink(tit, ['teoria', 'rapido']) }, icono('reloj'), 'Tengo 5 minutos')));

    setChildren(el,
      cabecera,
      // Lo principal: dónde estás (la carta), qué toca y el botón para seguir.
      h('div.entrada-arriba', { class: sy ? '' : 'sin-carta' },
        heroeEl,
        h('div.entrada-principal', faseEl, sesionEl)),
      // Pasado el examen, cómo fue (sin obligar); si salió del modo semana, volver a él.
      sx.estado.preguntar ? tarjetaComoFue(progress, tit, sx.estado.preguntar) : null,
      sx.estado.salido ? h('p.semana-volver', 'Tu examen está cerca. ', botonVolver(progress, tit)) : null,
      momento ? tarjetaExamenCerca(progress, tit, { momento, dias: st.diasAlExamen, fecha: st.fechaExamen, conv, ficha, ahora: d.ahora }) : null,
      aviso.mostrar ? tarjetaAdmitidos(progress, tit, { dias: aviso.dias, conv, ficha, ahora: d.ahora }) : null,
      estadoEl,
      // Lo secundario, debajo: nada compite con «Seguir».
      ofertaNivel(),
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
      progresoEl,
      avisoCopia(progress),
      // Una sola invitación a la vez: instalar la app y, si no toca, el aviso diario (src/ui/recordatorio.js).
      tarjetaInstalar(progress) ?? tarjetaAvisos(progress),
      h('p.ver-todo', h('a', { href: tlink(tit, ['temario']) }, 'Ver todo el temario →')),
      marcaConfig(),
    );
  }).catch((e) => setChildren(el, cabecera, h('p.warn', `No se pudo preparar el plan: ${e.message}`)));

  return { el, summary: () => summaryText + travesiaTexto + convTexto };
}


// #/<tit>/podcast — «Radio de a bordo»: los podcasts de Elena y Andrés como una travesía. Cada tema es un puerto
// y cada episodio una tarjeta (número, título, duración, estado y el arranque del guion plegado en «Ver el guion»).
// #/<tit>/podcast/<id> — el episodio: reproductor grande, el guion al hilo (se ilumina lo que suena y se toca para
// saltar), las preguntas del minijuego para contestar en la pausa, y su ficha con las clases.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver, currentEje } from '../titulacion.js';
import { bloque } from '../../theory/blocks.js';
import { loadPodcast, loadPodcastLinea } from '../../store/datasets.js';
import { equivalente, reservadaDe } from '../../bancos/index.js';
import {
  poner, alternar, saltar, ir, cambiarVelocidad, velocidad, suscribir, radio, fmt, estadoEpisodio, ultimoEpisodio,
  enVistaEpisodio, pararEnPreguntas, setPararEnPreguntas, marcarRespondida,
} from '../radio.js';
import { cuenta } from '../../texto.js';
import { icono, conIcono } from '../iconos.js';

const MARCA = { bienvenida: 'ancla', panorama: 'faro', profundiza: 'salvavidas' };
const TIPO = { bienvenida: 'Bienvenida', panorama: 'Panorama del tema', profundiza: 'Profundiza' };
const minutos = (s) => `${Math.round(s / 60)} min`;

/** Episodios en una lista plana, con su tema. */
export const episodiosDe = (podcast) => podcast.temas.flatMap((t) => t.episodios.map((e) => ({ ...e, tema: t.tema })));

/** Lo siguiente que conviene escuchar: el primero con audio sin oír, siguiendo el orden de estudio de los temas. */
export function siguienteRecomendado(podcast, estructura) {
  const orden = [0, ...(estructura.ordenEstudio ?? estructura.bloques.map((b) => b.ut))];
  for (const ut of orden) {
    const t = podcast.temas.find((x) => x.tema === ut);
    const e = t?.episodios.find((x) => x.audio && !estadoEpisodio(x.id).oido);
    if (e) return e;
  }
  return null;
}

/** Estado de un episodio para pintar su tarjeta: 'oido', 'medias' (con %), 'nuevo' o 'astillero' (sin audio). */
function estado(ep) {
  if (!ep.audio) return { clase: 'astillero', pct: 0 };
  const e = estadoEpisodio(ep.id);
  if (e.oido) return { clase: 'oido', pct: 100 };
  if (e.t > 5 && ep.duracion) return { clase: 'medias', pct: Math.min(99, Math.round((100 * e.t) / ep.duracion)) };
  return { clase: 'nuevo', pct: 0 };
}

export function podcastView({ progress, tit, params: route }) {
  const T = TITULACIONES[tit];
  const [, id] = route.parts;
  const el = h('div.podcast', h('p.muted', 'Sintonizando…'));
  let summaryText = `VISTA podcast ${T.sigla} (cargando)`;
  const vista = { el, summary: () => summaryText };

  loadPodcast(tit).then((pod) => {
    if (id) { summaryText = episodioView(el, tit, pod, id, route.query?.de, progress ? currentEje(progress) : null, finalHechoDe(progress)) ?? summaryText; return; }
    summaryText = travesia(el, tit, pod);
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar la radio: ${e.message}`)));
  if (!id) enVistaEpisodio(false);
  return vista;
}

/**
 * ¿Ha hecho ya el alumno el examen final de ese eje y titulación? Hasta entonces, lo reservado para él no se enseña
 * en las pausas y los episodios que lo leen lo avisan (docs/BANCOS.md, «Cuarentena»).
 */
export const finalHechoDe = (progress) => (eje, tit) => Boolean(progress?.tests?.().some((t) => t.tipo === 'final' && t.eje === eje && (t.tit ?? 'per') === tit));

/** Aviso suave (no bloquea) de un episodio cuyo audio lee una pregunta reservada para el examen final del alumno. */
export const AVISO_RESERVADA = 'Este episodio comenta una pregunta del examen final; mejor escúchalo después de hacerlo.';

/** ¿Lee el episodio alguna pregunta reservada para el examen final del alumno (que aún no ha hecho)? */
export async function leeReservada(ep, eje, finalHecho = () => false) {
  const rs = await Promise.all((ep.preguntas ?? []).map((id) => reservadaDe(id, eje).catch(() => null)));
  return rs.some((r) => r && !finalHecho(r.eje, r.tit));
}

// ---------------------------------------------------------------------------------------------------------------
// La travesía

function travesia(el, tit, pod) {
  const T = TITULACIONES[tit];
  const eps = episodiosDe(pod);
  const conAudio = eps.filter((e) => e.audio);
  const oidos = conAudio.filter((e) => estadoEpisodio(e.id).oido);
  const ult = ultimoEpisodio();
  const seguir = ult?.tit === tit ? eps.find((e) => e.id === ult.id && e.audio && !estadoEpisodio(e.id).oido && estadoEpisodio(e.id).t > 5) : null;
  const sig = siguienteRecomendado(pod, T.estructura);

  // El recomendado: la misma tarjeta, destacada pero compacta, con su tema.
  const destacado = (ep0, rotulo) => {
    const ep = eps.find((e) => e.id === ep0.id) ?? ep0; // con su tema (siguienteRecomendado da el episodio sin él)
    const b = ep.tema ? bloque(T.estructura, ep.tema) : null;
    return h('section.radio-destacado', { 'aria-label': rotulo },
      h('p.radio-rotulo', rotulo),
      tarjetaEpisodio(tit, ep, { tema: b ? [icono(b.ico ?? 'ancla', 'ico-t'), `Tema ${ep.tema} · ${b.titulo}`] : [icono('velero', 'ico-t'), 'Zarpamos'], etiqueta: 'div' }));
  };

  const puertos = pod.temas.map((t) => {
    const b = t.tema ? bloque(T.estructura, t.tema) : null;
    const hechos = t.episodios.filter((e) => e.audio && estadoEpisodio(e.id).oido).length;
    const listos = t.episodios.filter((e) => e.audio).length;
    const dur = t.episodios.reduce((s, e) => s + (e.duracion ?? 0), 0);
    return h('section.puerto', { id: `tema-${t.tema}` },
      h('header.puerto-cab',
        h('span.puerto-icono', icono(t.tema ? b?.ico ?? 'ancla' : 'velero')),
        h('div',
          h('h2', t.tema ? `Tema ${t.tema} · ${t.titulo}` : 'Zarpamos'),
          h('p.muted.small', listos
            ? `${hechos} de ${listos} escuchados · ${minutos(dur)}${listos < t.episodios.length ? ` · ${t.episodios.length - listos} en preparación` : ''}`
            : `${cuenta(t.episodios.length, 'episodio')} en preparación`))),
      // Un tema sin ningún episodio grabado se queda en una línea plegada: la lista no se llena de lo que aún no se oye.
      listos ? h('ol.ep-lista', t.episodios.map((ep) => tarjetaEpisodio(tit, ep)))
        : h('details.puerto-astillero', h('summary', `Próximamente: ver sus ${cuenta(t.episodios.length, 'episodio')}`), h('ol.ep-lista', t.episodios.map((ep) => tarjetaEpisodio(tit, ep)))));
  });

  setChildren(el,
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('header.radio-cab',
      h('h1', conIcono('podcast', 'Radio de a bordo')),
      h('p', `${T.sigla === 'PY' ? 'Patrón de Yate' : 'PER'} en voz alta: Elena, patrona y profesora, y Andrés, que tiene un velero y una duda para cada cosa. Episodios de diez a quince minutos para escuchar donde quieras.`),
      conAudio.length ? h('p.muted.small', `${oidos.length} de ${cuenta(conAudio.length, 'episodio escuchado', 'episodios escuchados')}`) : null),
    seguir ? destacado(seguir, 'Sigue escuchando') : sig ? destacado(sig, oidos.length ? 'Siguiente parada' : 'Para empezar') : null,
    h('div.travesia', puertos),
    h('p.muted.small.radio-pie', icono('faro', 'ico-t'), 'Panorama: el tema entero, para situarte antes de estudiarlo y para repasarlo. ', icono('salvavidas', 'ico-t'), 'Profundiza: un epígrafe, con sus trampas. Próximamente: episodios que aún se están grabando.'));

  return `VISTA podcast ${T.sigla}: ${cuenta(conAudio.length, 'episodio')} con audio de ${eps.length}, ${oidos.length} escuchados\n` +
    eps.map((e) => `${e.n} ${e.titulo} [${estado(e).clase}]${e.audio ? ` → ${tlink(tit, ['podcast', e.id])}` : ''}`).join('\n');
}

const ESTADO_TXT = { oido: 'Escuchado', nuevo: 'Sin escuchar', astillero: 'Próximamente' };

/**
 * Tarjeta de un episodio: botón de reproducir (44 px), número y título (enlace al episodio), tipo o tema con su icono,
 * duración y estado (sin escuchar, escuchado, en curso con barra). El arranque del guion y la sinopsis, plegados en
 * «Ver el guion». `tema` sustituye al tipo en la meta (en el destacado).
 */
function tarjetaEpisodio(tit, ep, { tema = null, etiqueta = 'li' } = {}) {
  const est = estado(ep);
  const href = tlink(tit, ['podcast', ep.id]);
  const estadoTxt = est.clase === 'medias' ? `En curso · ${est.pct} %` : ESTADO_TXT[est.clase];
  const play = ep.audio
    ? h('button.ep-play', { type: 'button', 'aria-label': `${est.clase === 'medias' ? 'Seguir escuchando' : 'Escuchar'} «${ep.titulo}»`, onclick: () => { poner(tit, ep); location.hash = href; } }, icono('play'))
    : h('span.ep-play.ep-sin-audio', { 'aria-hidden': 'true' }, icono('reloj'));
  const guion = ep.sinopsis || ep.gancho ? h('details.ep-guion',
    h('summary', 'Ver el guion'),
    ep.sinopsis ? h('p', ep.sinopsis) : null,
    ep.gancho ? h('p.radio-gancho', ep.gancho) : null,
    h('a.ep-abrir', { href }, ep.audio ? 'Abrir el episodio con el guion entero →' : 'Ver la ficha →')) : null;
  return h(`${etiqueta}.ep-card`, { class: `${est.clase} ${ep.tipo}` },
    h('div.ep-fila', play,
      h('div.ep-tx',
        h('a.ep-titulo', { href }, h('span.ep-n', ep.n), ' ', ep.titulo),
        h('span.ep-meta',
          tema ?? [icono(MARCA[ep.tipo], 'ico-t'), TIPO[ep.tipo]],
          ep.audio ? ` · ${minutos(ep.duracion)}` : '',
          ' · ', h('span.ep-estado', est.clase === 'oido' ? icono('ok', 'ico-t') : null, estadoTxt)))),
    est.clase === 'medias' ? h('div.barra-trav.ep-barra', { role: 'progressbar', 'aria-label': `Escuchado de «${ep.titulo}»`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(est.pct) },
      h('span', { style: `width:${est.pct}%` })) : null,
    guion);
}

// ---------------------------------------------------------------------------------------------------------------
// El episodio

/** Adónde vuelve la flecha: a la clase o al tema desde los que se abrió el episodio (?de=…), o a la radio. */
function vuelta(tit, de) {
  const m = /^(curso\/[a-z0-9-]+|temario\/\d+)$/.exec(de ?? '');
  if (!m) return volver('Radio de a bordo', tlink(tit, ['podcast']));
  return volver(de.startsWith('curso/') ? 'Volver a la clase' : 'Volver al tema', tlink(tit, de.split('/')));
}

/** Enlace a un episodio recordando desde dónde se abre (para que la flecha vuelva allí). */
export const enlaceEpisodio = (tit, ep, de) => tlink(tit, ['podcast', ep.id], de ? { de } : undefined);

function episodioView(el, tit, pod, id, de, eje, finalHecho = () => false) {
  const T = TITULACIONES[tit];
  const eps = episodiosDe(pod);
  const ep = eps.find((e) => e.id === id);
  if (!ep) { setChildren(el, vuelta(tit, de), h('p', 'Este episodio no existe.')); return 'ERROR episodio no encontrado'; }
  const i = eps.indexOf(ep);
  const anterior = eps.slice(0, i).reverse().find((e) => e.audio);
  const posterior = eps.slice(i + 1).find((e) => e.audio);
  const b = ep.tema ? bloque(T.estructura, ep.tema) : null;

  const ficha = h('section.radio-ficha',
    ep.claves?.length ? h('details', { open: !ep.audio }, h('summary', conIcono('lista', 'Para llevarse')), h('ul', ep.claves.map((c) => h('li', c)))) : null,
    ep.trampas?.length ? h('details', h('summary', conIcono('aviso', 'Trampas del examen')), h('ul', ep.trampas.map((c) => h('li', c)))) : null,
    ep.lecciones?.length ? h('details', h('summary', conIcono('clase', ep.lecciones.length === 1 ? 'Su clase' : 'Sus clases')),
      h('ul', ep.lecciones.map((l) => h('li', h('a', { href: tlink(tit, ['curso', l]) }, `Clase ${l.replace(/^[a-z]+-/, '')}`))))) : null,
    ep.relacionados?.length ? h('p.small', icono('enlace', 'ico-t'), 'Escucha también: ', ep.relacionados.map((n, k) => {
      const r = eps.find((e) => e.n === n);
      return r ? [k ? ' · ' : '', h('a', { href: tlink(tit, ['podcast', r.id]) }, `${r.n} ${r.titulo}`)] : null;
    })) : null);

  const cabecera = [
    vuelta(tit, de),
    h('p.radio-rotulo', conIcono(MARCA[ep.tipo], `${TIPO[ep.tipo]}${b ? ` · Tema ${ep.tema} · ${b.titulo}` : ''}`)),
    h('h1', `${ep.n} · ${ep.titulo}`),
  ];
  const sinopsis = ep.sinopsis ? h('p.radio-sinopsis', ep.sinopsis) : null;

  if (!ep.audio) {
    enVistaEpisodio(false);
    setChildren(el, cabecera, sinopsis, h('p.aviso-astillero', 'Próximamente: este episodio aún se está grabando. Aquí tienes su ficha.'), ficha);
    return `VISTA episodio ${ep.n} ${ep.titulo} (sin audio)`;
  }

  enVistaEpisodio(true);
  // Si el audio lee una pregunta reservada para su examen final, se avisa antes de escuchar (sin bloquear).
  const aviso = h('div.aviso-reservada-hueco');
  leeReservada(ep, eje, finalHecho).then((si) => { if (si) setChildren(aviso, h('p.aviso-reservada', { role: 'note' }, conIcono('candado', AVISO_RESERVADA))); });
  const suena = () => radio().actual?.ep.id === ep.id;
  const btnPlay = h('button.radio-play', { type: 'button', onclick: () => (suena() ? alternar() : poner(tit, ep)) });
  const slider = h('input.radio-slider', { type: 'range', min: 0, max: Math.round(ep.duracion), step: 1, value: estadoEpisodio(ep.id).t ?? 0, 'aria-label': 'Posición' });
  slider.addEventListener('input', () => { if (suena()) ir(Number(slider.value)); else poner(tit, ep, { desde: Number(slider.value) }); });
  const tiempo = h('span.radio-tiempo');
  const btnVel = h('button.secondary.radio-vel', { type: 'button', onclick: () => { cambiarVelocidad(); pinta(); } });
  const parar = h('input', { type: 'checkbox', checked: pararEnPreguntas() });
  parar.addEventListener('change', () => setPararEnPreguntas(parar.checked));
  const seguirGuion = h('input', { type: 'checkbox', checked: true });

  const guion = h('ol.guion', { 'aria-label': 'Guion' }, h('li.muted', 'Cargando el guion…'));
  let tramos = [];
  let filas = [];
  let activa = -1;
  const preguntas = new Map();

  function pinta() {
    const { audio } = radio();
    const t = suena() ? audio.currentTime : estadoEpisodio(ep.id).t ?? 0;
    const sonando = suena() && !audio.paused;
    btnPlay.replaceChildren(icono(sonando ? 'pausa' : 'play'));
    btnPlay.setAttribute('aria-label', sonando ? 'Pausa' : 'Reproducir');
    if (document.activeElement !== slider) slider.value = String(Math.round(t));
    tiempo.textContent = `${fmt(t)} / ${fmt(ep.duracion)}`;
    btnVel.textContent = `${String(velocidad()).replace('.', ',')}×`;
    // La intervención que suena, iluminada (y a la vista, si se sigue el guion).
    let k = -1;
    for (let j = 0; j < tramos.length; j += 1) if (tramos[j].t <= t + 0.05 && tramos[j].x) k = j;
    if (k !== activa) {
      filas[activa]?.classList.remove('activa');
      activa = k;
      const f = filas[activa];
      if (f) { f.classList.add('activa'); if (seguirGuion.checked && sonando) f.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
  }

  loadPodcastLinea(ep.id).then(async (linea) => {
    tramos = linea.tramos;
    const ids = tramos.filter((x) => x.p).map((x) => x.p);
    const banco = ids.length ? await bancoDe(ids, eje, finalHecho) : new Map();
    filas = tramos.map((x) => {
      if (x.x) {
        return h('li.guion-linea', { class: x.q === 'E' ? 'elena' : 'andres', onclick: () => (suena() ? ir(x.t) : poner(tit, ep, { desde: x.t })) },
          h('span.guion-quien', x.q === 'E' ? 'Elena' : 'Andrés'), h('span.guion-txt', x.x));
      }
      if (x.p && banco.has(x.p)) { const card = preguntaCard(x.p, banco.get(x.p)); preguntas.set(x.p, card); return h('li.guion-pregunta', card); }
      // Reservada para el examen final y sin equivalente que no lo sea: la pausa se queda sin pregunta, con un aviso.
      if (x.p) return h('li.guion-pausa.guion-apartada', 'Esta pregunta es del examen final: aquí no se enseña.');
      return h('li.guion-pausa', { 'aria-hidden': 'true' }, '· · ·');
    });
    setChildren(guion, filas);
    activa = -1;
    pinta();
  }).catch(() => setChildren(guion, h('li.muted', 'No se pudo cargar el guion.')));

  // La pregunta de la pausa es la del guion (de un eje concreto) o, si el alumno estudia otro eje, su equivalente en
  // él; si no la hay, la del guion con el rótulo de su tribunal. La pausa se marca por el id del guion.
  function preguntaCard(idGuion, { q, propia, ficha }) {
    const fb = h('div', { 'aria-live': 'polite' });
    const ops = Object.entries(q.opciones).map(([k, txt]) => h('button.secondary.radio-opcion', { type: 'button', onclick: () => {
      ops.forEach((b) => { b.disabled = true; if (b.dataset.k === q.correcta) b.classList.add('correcta'); else if (b.dataset.k === k) b.classList.add('fallada'); });
      marcarRespondida(idGuion);
      setChildren(fb, h('p', { class: k === q.correcta ? 'ok' : 'warn' }, conIcono(k === q.correcta ? 'ok' : 'no', k === q.correcta ? '¡Bien! Ahora escucha cómo lo razona Andrés.' : `Era la ${q.correcta}). Escucha por qué.`)),
        h('button', { type: 'button', onclick: () => { if (suena()) radio().audio.play(); } }, conIcono('play', 'Seguir escuchando')));
    }, 'data-k': k }, `${k}) ${txt}`));
    const rotulo = conIcono('pregunta', propia ? '¿Y tú qué dices?' : `¿Y tú qué dices? · Pregunta del examen de ${ficha?.nombre ?? 'otro tribunal'}`);
    return h('div.radio-pregunta', h('p.radio-rotulo', rotulo), h('p.qtext', q.enunciado), h('div.radio-opciones', ops), fb);
  }

  const off = suscribir((tipo, act, extra) => {
    if (!el.isConnected) { off(); enVistaEpisodio(false); return; }
    if (tipo === 'pregunta' && act?.ep.id === ep.id && extra?.parado) preguntas.get(extra.id)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    pinta();
  });

  setChildren(el,
    cabecera,
    aviso,
    h('section.radio-reproductor',
      h('div.radio-fila', h('button.secondary.radio-salto', { type: 'button', 'aria-label': 'Atrás 15 segundos', onclick: () => saltar(-15) }, conIcono('retroceder', '15')),
        btnPlay,
        h('button.secondary.radio-salto', { type: 'button', 'aria-label': 'Adelante 15 segundos', onclick: () => saltar(15) }, conIcono('avanzar', '15'))),
      slider,
      h('div.radio-fila.radio-pie-rep', tiempo, btnVel)),
    // El reproductor va justo bajo el título (el botón de reproducir se ve sin desplazar); de qué va, debajo.
    sinopsis,
    h('section.radio-guion',
      h('div.radio-guion-cab', h('h2', conIcono('documento', 'El guion, al hilo')),
        h('label.small', seguirGuion, ' Seguir lo que suena'),
        h('label.small', parar, ' Pararse en las preguntas')),
      h('p.muted.small', 'Toca cualquier frase para ir a ella. En el minijuego, contesta tú antes que Andrés.'),
      guion),
    ficha,
    h('nav.radio-vecinos',
      anterior ? h('a.btn.secondary', { href: enlaceEpisodio(tit, anterior, de) }, `← ${anterior.n}`) : h('span'),
      posterior ? h('a.btn.secondary', { href: enlaceEpisodio(tit, posterior, de) }, `${posterior.n} →`) : h('span')));
  pinta();
  return `VISTA episodio ${ep.n} «${ep.titulo}» (${minutos(ep.duracion)}) · ${suena() ? 'sonando' : 'parado'}\nSINOPSIS: ${ep.sinopsis ?? ''}\nCLASES: ${(ep.lecciones ?? []).join(', ')}`;
}

/** Las preguntas reales que cita el guion, para el minijuego: id del guion → { q, propia, ficha } en el eje del alumno. */
async function bancoDe(ids, eje, finalHecho) {
  const r = await Promise.all(ids.map((id) => equivalente(id, eje, { finalHecho }).then((x) => x && [id, x]).catch(() => null)));
  return new Map(r.filter(Boolean));
}

/** Episodios que tratan una clase (para enlazar desde la clase y desde su tema). */
export async function episodiosDeClase(tit, claseId) {
  const pod = await loadPodcast(tit);
  return episodiosDe(pod).filter((e) => e.tipo === 'profundiza' && e.lecciones?.includes(claseId));
}
export async function episodiosDeTema(tit, ut) {
  const pod = await loadPodcast(tit);
  return pod.temas.find((t) => t.tema === ut)?.episodios ?? [];
}

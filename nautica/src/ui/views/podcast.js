// #/<tit>/podcast — «Radio de a bordo»: los podcasts de Elena y Andrés como una travesía. Cada tema es un puerto
// y cada episodio una boya en la ruta: el faro es el panorama del tema; las boyas, los que profundizan.
// #/<tit>/podcast/<id> — el episodio: reproductor grande, el guion al hilo (se ilumina lo que suena y se toca para
// saltar), las preguntas del minijuego para contestar en la pausa, y su ficha con las clases.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { bloque } from '../../theory/blocks.js';
import { loadPodcast, loadPodcastLinea, loadTheoryBank, loadExamBank } from '../../store/datasets.js';
import {
  poner, alternar, saltar, ir, cambiarVelocidad, velocidad, suscribir, radio, fmt, estadoEpisodio, ultimoEpisodio,
  enVistaEpisodio, pararEnPreguntas, setPararEnPreguntas, marcarRespondida,
} from '../radio.js';
import { cuenta } from '../../texto.js';

const MARCA = { bienvenida: '⚓', panorama: '🗼', profundiza: '🛟' };
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

/** Estado de un episodio para pintar su boya: 'oido', 'medias' (con %), 'nuevo' o 'astillero' (sin audio). */
function estado(ep) {
  if (!ep.audio) return { clase: 'astillero', pct: 0 };
  const e = estadoEpisodio(ep.id);
  if (e.oido) return { clase: 'oido', pct: 100 };
  if (e.t > 5 && ep.duracion) return { clase: 'medias', pct: Math.min(99, Math.round((100 * e.t) / ep.duracion)) };
  return { clase: 'nuevo', pct: 0 };
}

export function podcastView({ tit, params: route }) {
  const T = TITULACIONES[tit];
  const [, id] = route.parts;
  const el = h('div.podcast', h('p.muted', 'Sintonizando…'));
  let summaryText = `VISTA podcast ${T.sigla} (cargando)`;
  const vista = { el, summary: () => summaryText };

  loadPodcast(tit).then((pod) => {
    if (id) { summaryText = episodioView(el, tit, pod, id, route.query?.de) ?? summaryText; return; }
    summaryText = travesia(el, tit, pod);
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar la radio: ${e.message}`)));
  if (!id) enVistaEpisodio(false);
  return vista;
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

  const destacado = (ep, rotulo) => {
    const est = estado(ep);
    return h('div.radio-destacado',
      h('p.radio-rotulo', rotulo),
      h('h2', `${MARCA[ep.tipo]} ${ep.titulo}`),
      ep.gancho ? h('p.radio-gancho', ep.gancho) : null,
      h('div.actions',
        h('button.grande', { type: 'button', onclick: () => { poner(tit, ep); location.hash = tlink(tit, ['podcast', ep.id]); } },
          est.clase === 'medias' ? `▶ Seguir (${fmt(estadoEpisodio(ep.id).t)})` : `▶ Escuchar · ${minutos(ep.duracion)}`)));
  };

  const puertos = pod.temas.map((t) => {
    const b = t.tema ? bloque(T.estructura, t.tema) : null;
    const hechos = t.episodios.filter((e) => e.audio && estadoEpisodio(e.id).oido).length;
    const listos = t.episodios.filter((e) => e.audio).length;
    const dur = t.episodios.reduce((s, e) => s + (e.duracion ?? 0), 0);
    return h('section.puerto', { id: `tema-${t.tema}` },
      h('header.puerto-cab',
        h('span.puerto-icono', { 'aria-hidden': 'true' }, t.tema ? b?.icon ?? '⚓' : '⛵'),
        h('div',
          h('h2', t.tema ? `Tema ${t.tema} · ${t.titulo}` : 'Zarpamos'),
          h('p.muted.small', listos
            ? `${hechos} de ${listos} escuchados · ${minutos(dur)}${listos < t.episodios.length ? ` · ${t.episodios.length - listos} en el astillero` : ''}`
            : `${cuenta(t.episodios.length, 'episodio')} en el astillero`))),
      h('ol.ruta', t.episodios.map((ep) => boya(tit, ep))));
  });

  setChildren(el,
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('header.radio-cab',
      h('h1', '🎧 Radio de a bordo'),
      h('p', `${T.sigla === 'PY' ? 'Patrón de Yate' : 'PER'} en voz alta: Elena, patrona y profesora, y Andrés, que tiene un velero y una duda para cada cosa. Episodios de diez a quince minutos para escuchar donde quieras.`),
      conAudio.length ? h('p.muted.small', `${oidos.length} de ${cuenta(conAudio.length, 'episodio escuchado', 'episodios escuchados')}`) : null),
    seguir ? destacado(seguir, 'Sigue escuchando') : sig ? destacado(sig, oidos.length ? 'Siguiente parada' : 'Para empezar') : null,
    h('div.travesia', puertos),
    h('p.muted.small.radio-pie', '🗼 Panorama: el tema entero, para situarte antes de estudiarlo y para repasarlo. 🛟 Profundiza: un epígrafe, con sus trampas. 🛠 En el astillero: aún se está grabando.'));

  return `VISTA podcast ${T.sigla}: ${cuenta(conAudio.length, 'episodio')} con audio de ${eps.length}, ${oidos.length} escuchados\n` +
    eps.map((e) => `${e.n} ${e.titulo} [${estado(e).clase}]${e.audio ? ` → ${tlink(tit, ['podcast', e.id])}` : ''}`).join('\n');
}

function boya(tit, ep) {
  const est = estado(ep);
  const abierto = h('details.boya-ficha',
    h('summary',
      h('span.boya-n', ep.n),
      h('span.boya-titulo', ep.titulo),
      h('span.boya-meta', ep.audio ? (est.clase === 'medias' ? `${est.pct} % · ${minutos(ep.duracion)}` : minutos(ep.duracion)) : '🛠')),
    ep.sinopsis ? h('p', ep.sinopsis) : null,
    ep.gancho ? h('p.radio-gancho', ep.gancho) : null,
    ep.audio
      ? h('div.actions',
        h('button', { type: 'button', onclick: () => { poner(tit, ep); location.hash = tlink(tit, ['podcast', ep.id]); } }, est.clase === 'medias' ? '▶ Seguir' : '▶ Escuchar'),
        h('a.btn.secondary', { href: tlink(tit, ['podcast', ep.id]) }, '📜 Ver el guion'))
      : h('p.muted.small', '🛠 En el astillero: este episodio aún se está grabando. Mientras, tienes su ficha.', h('br'), h('a', { href: tlink(tit, ['podcast', ep.id]) }, 'Ver la ficha →')));
  return h('li.boya', { class: `${est.clase} ${ep.tipo}`, style: est.clase === 'medias' ? `--pct:${est.pct}` : null },
    h('span.boya-marca', { 'aria-hidden': 'true' }, est.clase === 'oido' ? '✓' : MARCA[ep.tipo]),
    abierto);
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

function episodioView(el, tit, pod, id, de) {
  const T = TITULACIONES[tit];
  const eps = episodiosDe(pod);
  const ep = eps.find((e) => e.id === id);
  if (!ep) { setChildren(el, vuelta(tit, de), h('p', 'Este episodio no existe.')); return 'ERROR episodio no encontrado'; }
  const i = eps.indexOf(ep);
  const anterior = eps.slice(0, i).reverse().find((e) => e.audio);
  const posterior = eps.slice(i + 1).find((e) => e.audio);
  const b = ep.tema ? bloque(T.estructura, ep.tema) : null;

  const ficha = h('section.radio-ficha',
    ep.claves?.length ? h('details', { open: !ep.audio }, h('summary', '🎒 Para llevarse'), h('ul', ep.claves.map((c) => h('li', c)))) : null,
    ep.trampas?.length ? h('details', h('summary', '⚠️ Trampas del examen'), h('ul', ep.trampas.map((c) => h('li', c)))) : null,
    ep.lecciones?.length ? h('details', h('summary', `📚 ${ep.lecciones.length === 1 ? 'Su clase' : 'Sus clases'}`),
      h('ul', ep.lecciones.map((l) => h('li', h('a', { href: tlink(tit, ['curso', l]) }, `Clase ${l.replace(/^[a-z]+-/, '')}`))))) : null,
    ep.relacionados?.length ? h('p.small', '🔗 Escucha también: ', ep.relacionados.map((n, k) => {
      const r = eps.find((e) => e.n === n);
      return r ? [k ? ' · ' : '', h('a', { href: tlink(tit, ['podcast', r.id]) }, `${r.n} ${r.titulo}`)] : null;
    })) : null);

  const cabecera = [
    vuelta(tit, de),
    h('p.radio-rotulo', `${MARCA[ep.tipo]} ${TIPO[ep.tipo]}${b ? ` · ${b.icon} Tema ${ep.tema} · ${b.titulo}` : ''}`),
    h('h1', `${ep.n} · ${ep.titulo}`),
    ep.sinopsis ? h('p', ep.sinopsis) : null,
  ];

  if (!ep.audio) {
    enVistaEpisodio(false);
    setChildren(el, cabecera, h('p.aviso-astillero', '🛠 En el astillero: este episodio aún se está grabando. Aquí tienes su ficha.'), ficha);
    return `VISTA episodio ${ep.n} ${ep.titulo} (sin audio)`;
  }

  enVistaEpisodio(true);
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
    btnPlay.textContent = sonando ? '⏸' : '▶';
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
    const banco = ids.length ? await bancoDe(tit) : new Map();
    filas = tramos.map((x) => {
      if (x.x) {
        return h('li.guion-linea', { class: x.q === 'E' ? 'elena' : 'andres', onclick: () => (suena() ? ir(x.t) : poner(tit, ep, { desde: x.t })) },
          h('span.guion-quien', x.q === 'E' ? 'Elena' : 'Andrés'), h('span.guion-txt', x.x));
      }
      if (x.p && banco.has(x.p)) { const card = preguntaCard(banco.get(x.p)); preguntas.set(x.p, card); return h('li.guion-pregunta', card); }
      return h('li.guion-pausa', { 'aria-hidden': 'true' }, '· · ·');
    });
    setChildren(guion, filas);
    activa = -1;
    pinta();
  }).catch(() => setChildren(guion, h('li.muted', 'No se pudo cargar el guion.')));

  function preguntaCard(q) {
    const fb = h('div', { 'aria-live': 'polite' });
    const ops = Object.entries(q.opciones).map(([k, txt]) => h('button.secondary.radio-opcion', { type: 'button', onclick: () => {
      ops.forEach((b) => { b.disabled = true; if (b.dataset.k === q.correcta) b.classList.add('correcta'); else if (b.dataset.k === k) b.classList.add('fallada'); });
      marcarRespondida(q.id);
      setChildren(fb, h('p', { class: k === q.correcta ? 'ok' : 'warn' }, k === q.correcta ? '✅ ¡Bien! Ahora escucha cómo lo razona Andrés.' : `❌ Era la ${q.correcta}). Escucha por qué.`),
        h('button', { type: 'button', onclick: () => { if (suena()) radio().audio.play(); } }, '▶ Seguir escuchando'));
    }, 'data-k': k }, `${k}) ${txt}`));
    return h('div.radio-pregunta', h('p.radio-rotulo', '🎯 ¿Y tú qué dices?'), h('p.qtext', q.enunciado), h('div.radio-opciones', ops), fb);
  }

  const off = suscribir((tipo, act, extra) => {
    if (!el.isConnected) { off(); enVistaEpisodio(false); return; }
    if (tipo === 'pregunta' && act?.ep.id === ep.id && extra?.parado) preguntas.get(extra.id)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    pinta();
  });

  setChildren(el,
    cabecera,
    h('section.radio-reproductor',
      h('div.radio-fila', h('button.secondary.radio-salto', { type: 'button', 'aria-label': 'Atrás 15 segundos', onclick: () => saltar(-15) }, '↺ 15'),
        btnPlay,
        h('button.secondary.radio-salto', { type: 'button', 'aria-label': 'Adelante 15 segundos', onclick: () => saltar(15) }, '15 ↻')),
      slider,
      h('div.radio-fila.radio-pie-rep', tiempo, btnVel)),
    h('section.radio-guion',
      h('div.radio-guion-cab', h('h2', '📜 El guion, al hilo'),
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

/** Preguntas reales por id (teoría y, en el PER, carta), para el minijuego. */
async function bancoDe(tit) {
  const { preguntas } = await loadTheoryBank(tit);
  const extra = tit === 'per' ? (await loadExamBank('andalucia-per.json').catch(() => ({ preguntas: [] }))).preguntas : [];
  return new Map([...preguntas, ...extra].map((q) => [q.id, q]));
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

// La radio de a bordo: un único reproductor para toda la app, para seguir escuchando mientras se navega.
// Guarda por episodio dónde te quedaste y si ya lo has oído; una barra pequeña encima de las pestañas
// enseña lo que suena. La vista del episodio (#/<tit>/podcast/<id>) se suscribe para el guion y las preguntas.

import { h, setChildren } from './dom.js';
import { tlink } from './titulacion.js';
import { loadPodcastLinea } from '../store/datasets.js';
import { icono } from './iconos.js';

export const VELOCIDADES = [0.8, 1, 1.15, 1.3, 1.5];
const OIDO = 0.9; // a partir del 90 % cuenta como escuchado

let progress = null;
let audio = null;
let actual = null; // { tit, ep, linea }
let barra = null;
const oyentes = new Set();
let guardado = 0;

const ajustes = () => progress?.settings() ?? {};
const mapa = () => ajustes().podcasts ?? {};
/** Estado guardado de un episodio: { t (segundos), oido (bool) }. */
export const estadoEpisodio = (id) => mapa()[id] ?? { t: 0, oido: false };
export const ultimoEpisodio = () => ajustes().podcastUltimo ?? null;
export const velocidad = () => ajustes().podcastVel ?? 1;
export const pararEnPreguntas = () => ajustes().podcastPreguntas !== false;
export const setPararEnPreguntas = (v) => progress.setSetting('podcastPreguntas', !!v);

function guarda(cambios) {
  if (!actual) return;
  const id = actual.ep.id;
  progress.setSetting('podcasts', { ...mapa(), [id]: { ...estadoEpisodio(id), ...cambios } });
}

const avisa = (tipo) => { for (const f of oyentes) f(tipo, actual); pintaBarra(); };
/** Escucha los cambios del reproductor (tipo: 'carga', 'estado', 'tiempo', 'pregunta'); devuelve cómo dejar de escuchar. */
export function suscribir(f) { oyentes.add(f); return () => oyentes.delete(f); }

export const radio = () => ({ actual, audio });
export const fmt = (s) => { s = Math.max(0, Math.round(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export function iniciarRadio(p) {
  progress = p;
  audio = new Audio();
  audio.preload = 'metadata';
  audio.addEventListener('timeupdate', () => {
    if (!actual) return;
    const t = audio.currentTime;
    const d = audio.duration || actual.ep.duracion || 0;
    if (Date.now() - guardado > 5000) { guardado = Date.now(); guarda({ t, oido: estadoEpisodio(actual.ep.id).oido || (d > 0 && t / d >= OIDO) }); }
    revisaPregunta(t);
    avisa('tiempo');
  });
  for (const ev of ['play', 'pause', 'ratechange', 'loadedmetadata', 'waiting', 'playing']) audio.addEventListener(ev, () => avisa('estado'));
  audio.addEventListener('ended', () => { guarda({ t: 0, oido: true }); avisa('estado'); });
  barra = h('div.radio-barra', { hidden: true, role: 'region', 'aria-label': 'Reproductor' });
  document.body.append(barra);
  pintaBarra();
}

/** Pone un episodio (con audio) a sonar desde donde se quedó, o desde `desde` segundos. */
export async function poner(tit, ep, { desde = null, sonar = true } = {}) {
  if (!ep?.audio) return;
  if (actual?.ep.id !== ep.id) {
    const linea = await loadPodcastLinea(ep.id).catch(() => null);
    actual = { tit, ep, linea, respondidas: new Set() };
    audio.src = ep.audio;
    audio.playbackRate = velocidad();
    const e = estadoEpisodio(ep.id);
    const t0 = desde ?? (e.oido ? 0 : e.t);
    if (t0) audio.addEventListener('loadedmetadata', () => { audio.currentTime = t0; }, { once: true });
    progress.setSetting('podcastUltimo', { tit, id: ep.id });
    sesionMultimedia();
    avisa('carga');
  } else if (desde != null) audio.currentTime = desde;
  audio.playbackRate = velocidad();
  if (sonar) await audio.play().catch(() => {});
}

export const alternar = () => { if (!audio?.src) return; if (audio.paused) audio.play().catch(() => {}); else audio.pause(); };
export const saltar = (s) => { if (audio?.src) audio.currentTime = Math.max(0, Math.min((audio.duration || 0) - 0.5, audio.currentTime + s)); };
export const ir = (t) => { if (audio?.src) audio.currentTime = t; };
export function cambiarVelocidad() {
  const i = VELOCIDADES.indexOf(velocidad());
  const v = VELOCIDADES[(i + 1) % VELOCIDADES.length];
  progress.setSetting('podcastVel', v);
  if (audio) audio.playbackRate = v;
  avisa('estado');
  return v;
}
export function cerrar() {
  if (!audio) return;
  if (actual) guarda({ t: audio.currentTime });
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  actual = null;
  avisa('carga');
}

// --- Preguntas del minijuego: al llegar a la pausa de una pregunta, si se está viendo el episodio, se para.
let ultimaPausa = null;
function revisaPregunta(t) {
  const tramos = actual?.linea?.tramos;
  if (!tramos) return;
  const k = tramos.findIndex((x) => x.p && t >= x.t && t < x.t + 1.2);
  if (k < 0) { ultimaPausa = null; return; }
  const p = tramos[k].p;
  if (ultimaPausa === p || actual.respondidas.has(p)) return;
  ultimaPausa = p;
  const viendo = document.body.classList.contains('en-radio');
  if (viendo && pararEnPreguntas()) audio.pause();
  for (const f of oyentes) f('pregunta', actual, { id: p, parado: viendo && pararEnPreguntas() });
}
export const marcarRespondida = (id) => actual?.respondidas.add(id);

// --- Barra pequeña
function pintaBarra() {
  if (!barra) return;
  const visible = !!actual && !document.body.classList.contains('en-radio');
  barra.hidden = !visible;
  document.body.classList.toggle('con-radio', visible);
  if (!actual) return;
  const d = audio.duration || actual.ep.duracion || 0;
  const pct = d ? (100 * audio.currentTime) / d : 0;
  setChildren(barra,
    h('div.radio-barra-progreso', h('span', { style: `width:${pct.toFixed(1)}%` })),
    h('button.radio-barra-play', { type: 'button', 'aria-label': audio.paused ? 'Reproducir' : 'Pausa', onclick: alternar }, icono(audio.paused ? 'play' : 'pausa')),
    h('a.radio-barra-txt', { href: tlink(actual.tit, ['podcast', actual.ep.id]) },
      h('span.radio-barra-titulo', `${actual.ep.n} · ${actual.ep.titulo}`),
      h('span.radio-barra-tiempo', `${fmt(audio.currentTime)} / ${fmt(d)}`)),
    h('button.radio-barra-cerrar', { type: 'button', 'aria-label': 'Cerrar el reproductor', onclick: cerrar }, icono('salir')));
}
/** La vista del episodio esconde la barra (ya tiene el reproductor grande). */
export function enVistaEpisodio(si) { document.body.classList.toggle('en-radio', si); pintaBarra(); }

// --- Controles de la pantalla de bloqueo (iPhone, Android)
function sesionMultimedia() {
  if (!('mediaSession' in navigator) || !actual) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${actual.ep.n} · ${actual.ep.titulo}`,
      artist: actual.tit === 'py' ? 'Patrón de Yate en voz alta' : 'PER en voz alta',
      album: 'Radio de a bordo',
      artwork: [{ src: 'icons/icono-512.png', sizes: '512x512', type: 'image/png' }],
    });
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => saltar(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => saltar(15));
  } catch { /* navegador sin soporte completo */ }
}

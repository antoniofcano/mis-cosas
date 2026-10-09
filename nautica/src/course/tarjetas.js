// Tarjetas de memoria (B4): anverso y reverso para lo que solo se aprende repitiendo. Todo sale de los datos que ya
// usan las láminas (buques, boyas, señales, banderas, escalas, siglas, clases de fuego); no hay contenido nuevo.
// Las respuestas se guardan como las de las preguntas (progress.recordExam con id «tarjeta:<mazo>:<clave>»), así
// que las falladas entran en el repaso espaciado de B1 con sus mismos plazos.

import { SHIPS } from '../illustrations/ships.js';
import { BUOYS } from '../illustrations/buoys.js';
import { SENALES } from '../illustrations/situations.js';
import { SOCORRO } from '../illustrations/socorro.js';
import { FLAGS } from '../illustrations/misc.js';
import { BEAUFORT, DOUGLAS } from '../illustrations/meteo.js';
import { CLASES_FUEGO } from '../illustrations/seamanship.js';
import { SIGLAS_GNSS } from '../illustrations/lecciones/carta.js';
import { repasoDe, diaLocal } from './repaso.js';
import { marcoDe } from '../illustrations/marcos.js';

export const PREFIJO = 'tarjeta:';
const sinPrefijo = (t) => t.replace(/^[^:]+:\s*/, '');
/** «COG: rumbo sobre el fondo…» → «COG». La de la ETA es una fórmula sin prefijo: se pregunta por sus dos siglas. */
const sigla = (k, t) => (/^[A-Z][A-Z o]*:/.test(t) ? t.split(':')[0] : k === 'eta' ? 'ETA y TTG' : k.toUpperCase());
const puntos = (s) => s.replace(/\./g, '•').replace(/-/g, '▬');
const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/** «Entrando en puerto se deja por babor. Roja; …» → la respuesta (la primera frase) y la nota (el resto). */
const partirNota = (nota) => {
  const i = nota.indexOf('. ');
  return i < 0 ? { respuesta: nota } : { respuesta: nota.slice(0, i + 1), nota: nota.slice(i + 2) };
};
/** «Dos pitadas cortas: caigo a babor.» → nombre «Dos pitadas cortas» y respuesta «Caigo a babor.» */
const senal = (t) => {
  const i = t.indexOf(': ');
  return i < 0 ? {} : { nombre: t.slice(0, i), respuesta: mayus(t.slice(i + 2)) };
};

/**
 * Mazos de cada titulación. Anverso: una lámina (sin sus rótulos), un texto o un sonido. Reverso: título y texto (lo que se
 * guarda y se resume) y, para pintarlo (src/ui/views/tarjetas.js): nombre (versalitas), respuesta (serifa; si no hay,
 * el título), dato (monoespaciada) y nota.
 */
export function mazos(tit) {
  const todos = [
    { id: 'buques', titulo: 'Luces y marcas de buques', ico: 'barco', tits: ['per'], cartas: Object.entries(SHIPS).map(([k, b]) => ({
      id: k, anverso: { spec: { tipo: 'buque', clase: k, vista: 'todas', dia: true }, quitar: 'titulo', pregunta: '¿Qué buque es?' }, reverso: { titulo: b.nombre, nota: b.nota } })) },
    { id: 'balizamiento', titulo: 'Balizamiento', ico: 'boya', tits: ['per'], cartas: Object.entries(BUOYS).map(([k, b]) => ({
      id: k, anverso: { spec: { tipo: 'boya', clase: k, reloj: false }, pregunta: '¿Qué marca es y cómo se pasa?' }, reverso: { titulo: b.nombre, texto: [b.nota, b.ritmo ? `Luz: ${b.ritmo}.` : ''].filter(Boolean).join(' '), ...partirNota(b.nota), nombre: b.nombre, dato: b.ritmo } })) },
    { id: 'sonidos', titulo: 'Señales acústicas', ico: 'campana', tits: ['per'], cartas: Object.entries(SENALES).map(([k, t]) => ({
      id: k, anverso: { sonido: k, texto: /^[.-]+$/.test(k) ? puntos(k) : null, pregunta: '¿Qué significa esta señal?' }, reverso: { titulo: t, ...senal(t), dato: /^[.-]+$/.test(k) ? puntos(k) : null, nota: marcoDe({ tipo: 'sonido', senal: k })?.nota } })) },
    { id: 'socorro', titulo: 'Señales de peligro', ico: 'salvavidas', tits: ['per', 'py'], cartas: Object.entries(SOCORRO).map(([k, x]) => ({
      id: k, anverso: { spec: { tipo: 'socorro', resaltar: k, solo: true }, pregunta: '¿Qué señal es?' }, reverso: { titulo: x.t.replace('|', ' '), texto: x.nota, nombre: `Señal de peligro · Anexo IV`, dato: `${x.letra})`, nota: mayus(x.nota.replace(/^Anexo IV [^:]+:\s*/, '')) } })) },
    { id: 'banderas', titulo: 'Banderas', ico: 'bandera', tits: ['per'], cartas: Object.entries(FLAGS).map(([k, f]) => ({
      id: k, anverso: { spec: { tipo: 'bandera', codigo: k }, pregunta: '¿Qué significa esta bandera?' }, reverso: { titulo: f.nombre, texto: f.nota, nombre: marcoDe({ tipo: 'bandera', codigo: k })?.titulo ?? f.nombre, respuesta: f.nota, nota: marcoDe({ tipo: 'bandera', codigo: k })?.nota } })) },
    { id: 'beaufort', titulo: 'Escala Beaufort', ico: 'viento', tits: ['per', 'py'], cartas: BEAUFORT.map(([n, kn], i) => ({
      id: String(i), anverso: { texto: `Fuerza ${i}`, pregunta: '¿Cómo se llama y cuántos nudos son?' }, reverso: { titulo: n, texto: `${kn} nudos.`, nombre: `Fuerza ${i}`, dato: `${kn} nudos` } })) },
    { id: 'douglas', titulo: 'Escala Douglas', ico: 'ola', tits: ['per', 'py'], cartas: DOUGLAS.map(([n, m], i) => ({
      id: String(i), anverso: { texto: `Grado ${i}`, pregunta: '¿Cómo se llama el estado de la mar y qué altura de ola tiene?' }, reverso: { titulo: n, texto: `Olas de ${m} m.`, nombre: `Grado ${i}`, dato: `olas de ${m} m` } })) },
    { id: 'fuego', titulo: 'Clases de fuego', ico: 'racha', tits: ['per', 'py'], cartas: CLASES_FUEGO.map(([k, t]) => ({
      id: k, anverso: { texto: `Clase ${k}`, pregunta: '¿Qué arde?' }, reverso: { titulo: t, nombre: `Clase ${k}` } })) },
    { id: 'gnss', titulo: 'Siglas del GNSS', ico: 'satelite', tits: ['py'], cartas: Object.entries(SIGLAS_GNSS).map(([k, t]) => ({
      id: k, anverso: { texto: sigla(k, t), pregunta: '¿Qué significa?' }, reverso: { titulo: sinPrefijo(t), nombre: sigla(k, t) } })) },
  ];
  return todos.filter((m) => m.tits.includes(tit)).map((m) => ({ ...m, cartas: m.cartas.map((c) => ({ ...c, clave: `${PREFIJO}${m.id}:${c.id}`, mazo: m.id })) }));
}

/** Tarjetas que tocan hoy (repaso de B1) en estos mazos, las más atrasadas primero. */
export function tarjetasPorRepasar(listaMazos, respuestas = {}, hoy = diaLocal()) {
  return listaMazos.flatMap((m) => m.cartas)
    .map((c) => ({ c, rep: repasoDe(respuestas[c.clave], hoy) }))
    .filter((x) => x.rep && x.rep.prox <= hoy)
    .sort((a, b) => a.rep.prox.localeCompare(b.rep.prox))
    .map((x) => x.c);
}

/** Sesión de un mazo: primero las que tocan repasar, luego las que nunca has visto y luego el resto, barajadas. */
export function sesionMazo(mazo, respuestas, rng, { n = 10, hoy = diaLocal() } = {}) {
  const baraja = (xs) => xs.map((x) => [rng.real(0, 1), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
  const tocan = tarjetasPorRepasar([mazo], respuestas, hoy);
  const nuevas = baraja(mazo.cartas.filter((c) => !respuestas[c.clave]));
  const resto = baraja(mazo.cartas.filter((c) => respuestas[c.clave] && !tocan.includes(c)));
  return [...tocan, ...nuevas, ...resto].slice(0, n);
}

/** Quita los rótulos de una lámina para usarla de anverso (si no, el nombre del buque o de la marca se vería). */
export function sinRotulos(svg, quitar = 'todos') {
  // 'titulo': solo el rótulo principal (en los buques se dejan «Visto de proa», «De día»…, que ayudan a leerla).
  const patron = quitar === 'titulo' ? /<text\b[^>]*class="il-title[^"]*"[^>]*>[\s\S]*?<\/text>/g : /<text\b[^>]*>[\s\S]*?<\/text>/g;
  return svg.replace(patron, '').replace(/aria-label="[^"]*"/, 'aria-label="Tarjeta: ¿qué es?"');
}

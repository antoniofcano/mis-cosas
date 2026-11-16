// Prepara los podcasts para la app: data/podcast-<tit>.json (episodios, fichas y si ya hay audio) y, en cada línea de
// tiempo data/podcast/<id>.json, qué pregunta real del minijuego toca en cada pausa larga.
//   npm run podcast
// El audio (podcast/audio/<id>.mp3) y su línea de tiempo los genera podcast/audio.py. Un test comprueba que
// data/podcast-<tit>.json está al día.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './precache.mjs';
import { todasLasPreguntas } from './bancos/leer.mjs';

const leer = (p) => JSON.parse(readFileSync(join(RAIZ, p), 'utf8'));
export const idEpisodio = (tit, n) => `${tit}-${String(n).replace('.', '-')}`;
// Palabras de más de tres letras, sin cifras (en el guion las cifras van en letra).
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zñ ]/g, ' ').split(/\s+/).filter((w) => w.length > 3);

/**
 * Lo que se sintetiza de un guion, como lo lee podcast/audio.py (`piezas`): [{ q, x }] por intervención y { pausa: true }
 * por cada [pausa larga] suelta. [pausa] dentro de una intervención se lee «…»; las demás acotaciones no se leen.
 */
export function piezasGuion(md) {
  // Como md.split('\n---\n', 2)[-1] en Python: lo que queda tras el segundo separador (o tras el primero, si solo hay uno).
  const partes = md.split('\n---\n');
  const cuerpo = md.startsWith('---') ? (partes.length > 2 ? partes.slice(2).join('\n---\n') : partes.at(-1)) : md;
  const out = [];
  for (const bloque of cuerpo.split(/\n\s*\n/)) {
    const b = bloque.trim();
    const m = b.match(/^\*\*([A-ZÁÉÍÓÚÑ]+):\*\*\s*([\s\S]+)$/);
    if (m) {
      const x = m[2].replace(/\[pausa\]/g, '…').replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
      if (x) out.push({ q: m[1], x });
    } else if (b === '[pausa larga]') out.push({ pausa: true });
  }
  return out;
}

/** ¿Lo grabado (los tramos de la línea de tiempo) es lo que dice hoy el guion? Si no, hay que regenerar el audio. */
export const audioAlDia = (md, tramos) => {
  const a = piezasGuion(md).map((p) => (p.pausa ? '|' : p.x));
  const b = tramos.map((t) => (t.pausa ? '|' : t.x));
  return a.length === b.length && a.every((x, i) => x === b[i]);
};

/** Asigna a cada pausa larga la pregunta del minijuego cuyo enunciado se acaba de leer (o ninguna). */
export function preguntasEnPausas(tramos, preguntas, banco) {
  let i = 0;
  return tramos.map((x, k) => {
    if (!x.pausa) return x;
    const { p, ...resto } = x;
    // Lo que se ha dicho desde la pausa anterior.
    const antes = [];
    for (let j = k - 1; j >= 0 && !tramos[j].pausa; j -= 1) antes.push(tramos[j].x ?? '');
    const dicho = new Set(norm(antes.join(' ')));
    for (let q = i; q < preguntas.length; q += 1) {
      const pal = norm(banco.get(preguntas[q])?.enunciado ?? '');
      if (pal.length && pal.filter((w) => dicho.has(w)).length / pal.length >= 0.4) { i = q + 1; return { ...resto, p: preguntas[q] }; }
    }
    return resto;
  });
}

export function datosPodcast() {
  const E = leer('podcast/episodios.json');
  const banco = new Map(todasLasPreguntas().map((q) => [q.id, q]));
  const lineas = {};
  const out = {};
  for (const tit of ['py', 'per']) {
    const temas = [];
    let tema = { tema: 0, titulo: 'Bienvenida', episodios: [] };
    temas.push(tema);
    for (const x of E[tit]) {
      if (x.tema) { tema = { tema: x.tema, titulo: x.titulo, episodios: [] }; temas.push(tema); continue; }
      const id = idEpisodio(tit, x.n);
      const audio = `podcast/audio/${id}.mp3`;
      const lt = `data/podcast/${id}.json`;
      const hay = existsSync(join(RAIZ, audio)) && existsSync(join(RAIZ, lt));
      let duracion = null;
      if (hay) {
        const t = leer(lt);
        duracion = t.duracion;
        lineas[lt] = { ...t, tramos: preguntasEnPausas(t.tramos, x.preguntas ?? [], banco) };
      }
      const { archivo, nota, ...ficha } = x;
      tema.episodios.push({ id, ...ficha, audio: hay ? audio : null, duracion });
    }
    out[tit] = { serie: E.serie, temas: temas.filter((t) => t.episodios.length) };
  }
  return { indice: out, lineas };
}

export const textoIndice = (o) => `${JSON.stringify(o)}\n`;
export function escribir() {
  const { indice, lineas } = datosPodcast();
  for (const tit of ['py', 'per']) writeFileSync(join(RAIZ, `data/podcast-${tit}.json`), textoIndice(indice[tit]));
  for (const [p, t] of Object.entries(lineas)) writeFileSync(join(RAIZ, p), `${JSON.stringify(t)}\n`);
  return { indice, lineas };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const { indice, lineas } = escribir();
  for (const tit of ['py', 'per']) {
    const eps = indice[tit].temas.flatMap((t) => t.episodios);
    console.log(`${tit}: ${eps.length} episodios, ${eps.filter((e) => e.audio).length} con audio`);
  }
  for (const [p, t] of Object.entries(lineas)) console.log(p, 'preguntas en pausas:', t.tramos.filter((x) => x.p).map((x) => x.p).join(', ') || '—');
}

// Ruta del curso: genera o comprueba data/curso/ruta-<tit>.json (ver docs/RUTA.md).
//
//   node tools/ruta.mjs per                         propone una ruta (no escribe nada)
//   node tools/ruta.mjs py --ritmo 2 --ventana 4 --pesos 3:2,4:2
//   node tools/ruta.mjs py --escribir               la escribe en data/curso/ruta-py.json (pisa los retoques a mano)
//   node tools/ruta.mjs py --comprobar              comprueba la ruta guardada: todas las clases, sin repetir y con
//                                                   cada clase después de las que requiere
//
// La ruta generada es un punto de partida: después se retoca a mano en el JSON (mover un tramo, partir otro…) y se
// comprueba con --comprobar (tests/ruta.test.js comprueba lo mismo).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './bancos/leer.mjs';
import { TITULACIONES } from '../src/theory/blocks.js';
import { generarRuta, problemasGrafo, violacionesRuta, idsRuta } from '../src/course/ruta.js';

const args = process.argv.slice(2);
const tit = args[0];
const T = TITULACIONES[tit];
if (!T) { console.error('Uso: node tools/ruta.mjs <per|py> [--ritmo n] [--ventana n] [--pesos ut:peso,…] [--escribir | --comprobar]'); process.exit(1); }
const opt = (k, def) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : def; };
const curso = JSON.parse(readFileSync(join(RAIZ, `data/curso/${tit}.json`), 'utf8'));
const fichero = join(RAIZ, `data/curso/ruta-${tit}.json`);
const titulo = new Map(curso.modulos.flatMap((m) => m.lecciones.map((l) => [l.id, l.titulo])));
const tema = new Map(T.estructura.bloques.map((b) => [b.ut, b.titulo]));

const grafo = problemasGrafo(curso);
if (grafo.length) { console.error(`«requiere» con problemas:\n${grafo.join('\n')}`); process.exit(1); }

const pinta = (tramos) => tramos.forEach((t, i) => console.log(`${String(i + 1).padStart(2)}. ${tema.get(t.ut)}: ${t.lecciones.map((id) => `${id} ${titulo.get(id)}`).join(' · ')}`));

if (args.includes('--comprobar')) {
  const ruta = JSON.parse(readFileSync(fichero, 'utf8'));
  const ids = idsRuta(ruta.tramos);
  const todas = [...titulo.keys()];
  const mal = [
    ...todas.filter((id) => !ids.includes(id)).map((id) => `falta ${id}`),
    ...ids.filter((id) => !titulo.has(id)).map((id) => `${id} no existe`),
    ...ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `${id} repetida`),
    ...violacionesRuta(ids, curso).map((v) => `${v.id} va antes de ${v.faltan.join(', ')}`),
    ...ruta.tramos.filter((t) => t.lecciones.some((id) => titulo.has(id) && !id.startsWith(`${tit}-${t.ut}-`))).map((t) => `tramo de ${t.ut} con clases de otro tema`),
  ];
  pinta(ruta.tramos);
  console.log(mal.length ? `\n✗ ${mal.join('\n✗ ')}` : `\n✓ ${ids.length} clases en ${ruta.tramos.length} tramos; respeta «requiere».`);
  process.exit(mal.length ? 1 : 0);
}

const ritmo = Number(opt('ritmo', 3));
const ventana = Number(opt('ventana', 2));
const pesos = Object.fromEntries(String(opt('pesos', '')).split(',').filter(Boolean).map((x) => x.split(':').map(Number)));
const tramos = generarRuta(curso, T.estructura, { ritmo, ventana, pesos });
pinta(tramos);
if (args.includes('--escribir')) {
  const datos = {
    _: `Ruta por defecto del curso ${T.sigla}: tramos de clases en el orden en que se dan (Hoy, plan y calendario). Generada con tools/ruta.mjs y retocada a mano; ver docs/RUTA.md.`,
    tit,
    generada: { ritmo, ventana, pesos },
    retoques: [],
    tramos,
  };
  writeFileSync(fichero, `${JSON.stringify(datos, null, 1)}\n`);
  console.log(`\nEscrita en data/curso/ruta-${tit}.json`);
}

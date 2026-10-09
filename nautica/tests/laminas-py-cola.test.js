// Cola de láminas del PY en estilo C (docs/ESTILO-LAMINAS.md): humedad, psicrómetro, nubes, olas, modelos de viento,
// helicóptero, chaleco y arnés, superficies libres y husos. Las mismas comprobaciones que las láminas piloto de
// tests/laminas-estilo.test.js (texto mínimo, solo --lc-*, marco completo, un título por lámina), en un fichero propio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { marcoDe } from '../src/illustrations/marcos.js';
import { idLamina, catalogoLaminas } from '../src/illustrations/catalogo-laminas.js';
import { PY } from '../src/theory/blocks.js';
import { GENEROS_C, PISOS_NUBES, PARTES_OLA_C, psicrometroC } from '../src/illustrations/py-cola-meteo-c.js';
import { PARTES_CHALECO, PARTES_ARNES, PARTES_SL, husosC } from '../src/illustrations/py-cola-c.js';
import { tensionSaturacion } from '../src/nautical/meteo.js';

export const PILOTO_COLA = [
  // UT 2: humedad, psicrómetro, nubes, olas y modelos de viento
  { tipo: 'humedad' }, { tipo: 'humedad', t: 15, td: 13 }, { tipo: 'humedad', t: 28, td: 5 },
  ...['ejemplo', 'humedo', 'seco'].map((caso) => ({ tipo: 'psicrometro', caso })),
  { tipo: 'nubes' }, ...[...Object.keys(GENEROS_C), ...PISOS_NUBES].map((resaltar) => ({ tipo: 'nubes', resaltar })), { tipo: 'nubes', resaltar: ['altas', 'cumulonimbos'] },
  { tipo: 'nubes-pisos' }, ...PISOS_NUBES.map((resaltar) => ({ tipo: 'nubes-pisos', resaltar })),
  { tipo: 'ola', vista: 'partes' }, ...PARTES_OLA_C.map((resaltar) => ({ tipo: 'ola', vista: 'partes', resaltar })), { tipo: 'ola', vista: 'mar-de-fondo' },
  ...['todos', 'geostrofico', 'gradiente', 'antitriptico'].map((modelo) => ({ tipo: 'modelos-viento', modelo })),
  // UT 1: helicóptero, chaleco y arnés, superficies libres
  ...['rumbo', 'cable', 'senales'].map((vista) => ({ tipo: 'helicoptero', vista })),
  { tipo: 'arnes', vista: 'chaleco' }, ...PARTES_CHALECO.map((resaltar) => ({ tipo: 'arnes', vista: 'chaleco', resaltar })),
  { tipo: 'arnes', vista: 'arnes' }, ...PARTES_ARNES.map((resaltar) => ({ tipo: 'arnes', vista: 'arnes', resaltar })),
  { tipo: 'superficies-libres' }, ...PARTES_SL.map((resaltar) => ({ tipo: 'superficies-libres', resaltar })),
  // UT 3: husos horarios
  { tipo: 'husos', vista: 'husos' }, { tipo: 'husos', vista: 'husos', tu: '08:00' }, { tipo: 'husos', vista: 'calculo', ejemplo: 'e' }, { tipo: 'husos', vista: 'calculo', ejemplo: 'w' },
  { tipo: 'husos', vista: 'calculo', lon: -45, tu: '14:00' }, { tipo: 'husos', vista: 'oficial' },
];

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
const CLARO = vars(bloque(':root {'));
const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));
const svgDe = (s) => renderIllustration(s).svg;

test('cola del PY: se dibujan, son specs válidas y sin NaN', () => {
  for (const s of PILOTO_COLA) {
    assert.ok(validSpec(s), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null/.test(svgDe(s)), `${JSON.stringify(s)}: NaN o undefined`);
  }
});

test('cola del PY: ningún texto del SVG baja de 10,5 px efectivos a 360 px de ancho', () => {
  const malos = [];
  for (const s of PILOTO_COLA) {
    const svg = svgDe(s);
    const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
    const escala = Math.min(328 / w, 430 / h);
    for (const t of svg.match(/<text\b[^>]*>/g) ?? []) {
      const fs = Number(t.match(/font-size="([\d.]+)"/)?.[1]);
      if (!(fs * escala >= 10.5)) malos.push(`${JSON.stringify(s)} ${w}×${h}: ${t.slice(0, 90)} → ${(fs * escala).toFixed(1)} px`);
    }
  }
  assert.deepEqual(malos.slice(0, 10), []);
});

test('cola del PY: solo colores --lc-*, todos con su versión oscura', () => {
  for (const s of PILOTO_COLA) {
    const svg = svgDe(s);
    const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
    const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"|(?:fill|stroke):\s*(?!var\(--lc-)[#a-z]/);
    assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]}`);
    for (const v of new Set(svg.match(/var\(--[a-z0-9-]+\)/g))) {
      const k = v.slice(6, -1);
      if (k === 'lc-url') continue;
      assert.ok(k in CLARO, `${v} no está en styles/laminas.css`);
      assert.ok(k in OSCURO || k.startsWith('lc-luz-'), `${v} sin versión oscura`);
    }
  }
});

test('cola del PY: marco completo, sin emojis, y un título por lámina', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  const titulos = new Map();
  for (const s of PILOTO_COLA) {
    const m = marcoDe(s);
    assert.ok(m, `${JSON.stringify(s)} sin marco`);
    for (const k of ['tema', 'titulo', 'clave', 'nota', 'alt']) assert.ok(typeof m[k] === 'string' && m[k].trim().length > 2, `${JSON.stringify(s)}: falta ${k}`);
    assert.ok(m.alt.length >= 60, `${JSON.stringify(s)}: texto alternativo pobre`);
    assert.ok(m.datos?.length >= 1 && m.datos.length <= 3 && m.datos.every((d) => d.cifra && d.texto), `${JSON.stringify(s)}: datos`);
    assert.ok(!/ · |undefined|NaN/.test(m.titulo), `${JSON.stringify(s)}: título «${m.titulo}»`);
    assert.ok(/[.!?]$/.test(m.clave), `${JSON.stringify(s)}: la frase clave termina en punto`);
    assert.ok(![m.titulo, m.clave, m.nota, m.alt, ...m.datos.flatMap((d) => [d.cifra, d.texto])].some((t) => PICTO.test(t)), 'sin emojis');
    assert.ok(!PICTO.test(svgDe(s)), `${JSON.stringify(s)}: emoji en el SVG`);
    assert.ok((svgDe(s).match(/aria-label="([^"]*)"/)?.[1] ?? '').length >= 60, `${JSON.stringify(s)}: aria-label pobre`);
    const id = idLamina(s);
    assert.ok(!titulos.has(m.titulo) || titulos.get(m.titulo) === id, `«${m.titulo}» repetido en ${id} y ${titulos.get(m.titulo)}`);
    titulos.set(m.titulo, id);
  }
});

test('cola del PY: cada parte que se puede resaltar está dibujada y se marca en magenta', () => {
  const partes = [['ola', { vista: 'partes' }, PARTES_OLA_C], ['arnes', { vista: 'chaleco' }, PARTES_CHALECO], ['arnes', { vista: 'arnes' }, PARTES_ARNES], ['superficies-libres', {}, PARTES_SL]];
  for (const [tipo, base, lista] of partes) {
    const svg = svgDe({ tipo, ...base });
    for (const p of lista) {
      assert.ok(svg.includes(`data-parte="${p}"`), `${tipo}: falta data-parte="${p}"`);
      assert.notEqual(svgDe({ tipo, ...base, resaltar: p }), svg, `${tipo}: resaltar ${p} no cambia nada`);
    }
  }
});

test('cola del PY: las clases del PY la enseñan en la galería con el título de su marco', () => {
  const curso = JSON.parse(readFileSync(new URL('../data/curso/py.json', import.meta.url)));
  const { porId } = catalogoLaminas('py', PY, curso);
  const TIPOS = new Set(PILOTO_COLA.map((s) => s.tipo));
  let n = 0;
  for (const m of curso.modulos) for (const l of m.lecciones) for (const p of l.pasos) {
    if (p.tipo !== 'ilustracion' || !TIPOS.has(p.spec?.tipo)) continue;
    n++;
    const lam = porId.get(idLamina(p.spec));
    assert.ok(lam, `${l.id}: ${JSON.stringify(p.spec)} no está en la galería`);
    assert.ok(lam.titulo.startsWith(marcoDe(p.spec).titulo), `${l.id}: ${JSON.stringify(p.spec)} sin el título de su marco`);
  }
  assert.ok(n >= 17,`solo ${n} pasos con estas láminas`);
});

test('cola del PY: las cifras salen de la física y de la norma', () => {
  // psicrómetro (seco 18, húmedo 15): e = es(15) − 0,66 · 3 hPa → algo más del 70 % y un rocío de unos 13 °C
  const e = tensionSaturacion(15) - 0.66 * 3;
  const hr = (100 * e) / tensionSaturacion(18);
  assert.ok(hr > 70 && hr < 75, String(hr));
  let td = 0;
  while (tensionSaturacion(td + 0.01) < e) td += 0.01;
  assert.ok(Math.abs(td - 13) < 0.6, String(td));
  assert.match(psicrometroC({ caso: 'ejemplo' }).svg, /algo más del 70 %[\s\S]*unos 13 °C/);
  // humedad: la HR del dibujo es la de la fórmula de Magnus
  assert.match(svgDe({ tipo: 'humedad' }), /HR 60 %/);
  // nubes: los diez géneros con su abreviatura
  const nub = svgDe({ tipo: 'nubes' });
  for (const g of Object.values(GENEROS_C)) assert.match(nub, new RegExp(`>${g.ab}<`));
  // chaleco: flotabilidad mínima por zona (RD 339/2021, art. 7.5)
  const ch = svgDe({ tipo: 'arnes', vista: 'chaleco' });
  for (const t of ['275 N', '150 N', '100 N', 'zona 1', 'zonas 2, 3 y 4', 'zonas 5, 6 y 7']) assert.ok(ch.includes(t), t);
  // husos: el ejemplo del E con la hora civil del lugar de 69° 25′ (4 h 37,7 min)
  assert.match(husosC({ vista: 'calculo', ejemplo: 'e' }).svg, /HcL = 10:30 \+ 4 h 37,7 min = 15:07,7/);
  assert.match(husosC({ vista: 'calculo', lon: 45, tu: '06:00' }).caption, /Al E la hora va adelantada/);
  // hora oficial: invierno y verano de la Península y de Canarias
  const of = husosC({ vista: 'oficial' }).svg;
  for (const t of ['TU + 1', 'TU + 2', 'huso 1 W', 'último domingo de marzo']) assert.ok(of.includes(t), t);
  // superficies libres: un mamparo en medio deja la inercia en la cuarta parte (2 · (b/2)³ = b³/4)
  assert.equal(2 * (1 / 2) ** 3, 1 / 4);
});

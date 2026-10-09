// Láminas de sanidad a bordo del PER en estilo C (src/illustrations/sanidad-c.js): las mismas comprobaciones que las
// láminas de la tanda de cierre (texto mínimo, solo --lc-*, marco completo, un título por lámina, partes que se
// resaltan) y los hechos de cada una contra la Guía Sanitaria a Bordo (ISM, 2013) y el RD 339/2021. Lo que la Guía no
// dice, o lo que choca entre fuentes (aflojar el torniquete), no se dibuja.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { marcoDe } from '../src/illustrations/marcos.js';
import { idLamina, catalogoLaminas } from '../src/illustrations/catalogo-laminas.js';
import { PER } from '../src/theory/blocks.js';
import { PARTES_HEMO_TIPOS, PARTES_HEMO_PARAR, PARTES_TORNIQUETE, PARTES_GRADOS, PARTES_ENFRIAR, PARTES_GRAVEDAD, PARTES_CALOR, PARTES_RADIO, PARTES_BOTIQUIN } from '../src/illustrations/sanidad-c.js';

const CASOS = [
  [{ tipo: 'hemorragia', vista: 'tipos' }, PARTES_HEMO_TIPOS],
  [{ tipo: 'hemorragia', vista: 'parar' }, PARTES_HEMO_PARAR],
  [{ tipo: 'hemorragia', vista: 'torniquete' }, PARTES_TORNIQUETE],
  [{ tipo: 'quemadura', vista: 'grados' }, PARTES_GRADOS],
  [{ tipo: 'quemadura', vista: 'enfriar' }, PARTES_ENFRIAR],
  [{ tipo: 'quemadura', vista: 'gravedad' }, PARTES_GRAVEDAD],
  [{ tipo: 'golpe-calor' }, PARTES_CALOR],
  [{ tipo: 'radio-medico' }, PARTES_RADIO],
  [{ tipo: 'botiquin' }, PARTES_BOTIQUIN],
];
export const PILOTO_SANIDAD = [
  ...CASOS.flatMap(([s, partes]) => [s, ...partes.map((resaltar) => ({ ...s, resaltar }))]),
  { tipo: 'hemorragia', vista: 'parar', resaltar: ['presion', 'elevar'] },
  { tipo: 'hipotermia', postura: 'atender' },
];

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
const CLARO = vars(bloque(':root {'));
const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));
const svgDe = (s) => renderIllustration(s).svg;
/** Texto visible del SVG (sin etiquetas ni el texto alternativo). */
const textoDe = (s) => (svgDe(s).match(/<text\b[^>]*>[^<]*<\/text>/g) ?? []).map((t) => t.replace(/<[^>]*>/g, '')).join(' | ');
const curso = JSON.parse(readFileSync(new URL('../data/curso/per.json', import.meta.url)));

test('sanidad: se dibujan en estilo C, son specs válidas y sin NaN', () => {
  for (const s of PILOTO_SANIDAD) {
    assert.ok(validSpec(s), JSON.stringify(s));
    const svg = svgDe(s);
    assert.ok(svg.includes('class="il lc'), `${JSON.stringify(s)}: estilo C`);
    assert.ok(!/NaN|undefined|null|Infinity/.test(svg), `${JSON.stringify(s)}: NaN o undefined`);
    assert.ok(!/<[\s\d=]|&(?![a-z]+;|#\d+;)/.test(svg), `${JSON.stringify(s)}: «<» o «&» sin escapar`);
    assert.ok(renderIllustration(s).caption.length > 20, `${JSON.stringify(s)}: pie`);
  }
});

test('sanidad: ningún texto del SVG baja de 10,5 px efectivos a 360 px de ancho', () => {
  const malos = [];
  for (const s of PILOTO_SANIDAD) {
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

test('sanidad: solo colores --lc-*, todos con su versión oscura', () => {
  for (const s of PILOTO_SANIDAD) {
    const svg = svgDe(s);
    const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
    const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"|(?:fill|stroke):\s*(?!var\(--lc-)[#a-z]/);
    assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]}`);
    assert.ok(!/class="il-(panel|lbl|title)/.test(svg), `${JSON.stringify(s)}: clases del dibujo antiguo`);
    for (const v of new Set(svg.match(/var\(--[a-z0-9-]+\)/g))) {
      const k = v.slice(6, -1);
      if (k === 'lc-url') continue;
      assert.ok(k in CLARO, `${v} no está en styles/laminas.css`);
      assert.ok(k in OSCURO, `${v} sin versión oscura`);
    }
  }
});

test('sanidad: marco completo, sin emojis, y un título por lámina', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  const titulos = new Map();
  for (const s of PILOTO_SANIDAD) {
    const m = marcoDe(s);
    assert.ok(m, `${JSON.stringify(s)} sin marco`);
    for (const k of ['tema', 'titulo', 'clave', 'nota', 'alt']) assert.ok(typeof m[k] === 'string' && m[k].trim().length > 2, `${JSON.stringify(s)}: falta ${k}`);
    assert.ok(m.alt.length >= 60, `${JSON.stringify(s)}: texto alternativo pobre`);
    assert.ok(m.datos?.length >= 1 && m.datos.length <= 3 && m.datos.every((d) => d.cifra && d.texto), `${JSON.stringify(s)}: datos`);
    assert.ok(!/ · |undefined|NaN/.test(m.titulo), `${JSON.stringify(s)}: título «${m.titulo}»`);
    assert.ok(/[.!?]$/.test(m.clave), `${JSON.stringify(s)}: la frase clave termina en punto`);
    assert.ok(![m.titulo, m.clave, m.nota, m.alt, ...m.datos.flatMap((d) => [d.cifra, d.texto])].some((t) => PICTO.test(t)), 'sin emojis');
    assert.ok(!PICTO.test(svgDe(s)), `${JSON.stringify(s)}: emoji en el SVG`);
    const id = idLamina(s);
    assert.ok(!titulos.has(m.titulo) || titulos.get(m.titulo) === id, `«${m.titulo}» repetido en ${id} y ${titulos.get(m.titulo)}`);
    titulos.set(m.titulo, id);
  }
});

test('sanidad: cada parte que se puede resaltar está dibujada y cambia el dibujo', () => {
  for (const [s, partes] of CASOS) {
    const svg = svgDe(s);
    for (const p of partes) {
      assert.ok(svg.includes(`data-parte="${p}"`), `${s.tipo} ${s.vista ?? ''}: falta data-parte="${p}"`);
      assert.notEqual(svgDe({ ...s, resaltar: p }), svg, `${s.tipo}: resaltar ${p} no cambia nada`);
    }
    // una parte de otra vista no cambia nada (como antes)
    assert.equal(svgDe({ ...s, resaltar: 'no-existe' }), svg);
  }
});

test('sanidad: las clases per-8-1, 8-2, 8-3 y 8-9 enseñan estas láminas con el título de su marco', () => {
  const { porId } = catalogoLaminas('per', PER, curso);
  const TIPOS = new Set(['hemorragia', 'quemadura', 'golpe-calor', 'radio-medico', 'botiquin']);
  const vistas = new Set();
  for (const m of curso.modulos) for (const l of m.lecciones) for (const p of l.pasos) {
    if (p.tipo !== 'ilustracion' || !(TIPOS.has(p.spec?.tipo) || (p.spec.tipo === 'hipotermia' && p.spec.postura === 'atender'))) continue;
    vistas.add(`${p.spec.tipo}/${p.spec.vista ?? p.spec.postura ?? ''}`);
    const lam = porId.get(idLamina(p.spec));
    assert.ok(lam && lam.titulo.startsWith(marcoDe(p.spec).titulo), `${l.id}: ${JSON.stringify(p.spec)}`);
  }
  for (const v of ['hemorragia/tipos', 'hemorragia/parar', 'hemorragia/torniquete', 'quemadura/grados', 'quemadura/enfriar', 'quemadura/gravedad', 'golpe-calor/', 'radio-medico/', 'botiquin/', 'hipotermia/atender']) assert.ok(vistas.has(v), `${v} no sale en ninguna clase`);
});

test('sanidad: los hechos son los de la Guía Sanitaria a Bordo y el RD 339/2021', () => {
  // Hemorragias (cap. 1 V y cap. 7): presión 10 min como mínimo, más gasas sin retirar, elevar sobre el corazón
  const parar = textoDe({ tipo: 'hemorragia', vista: 'parar' });
  for (const t of ['10 min como', 'más gasas encima', 'corazón', 'ÚLTIMO RECURSO']) assert.ok(parar.includes(t), t);
  // Torniquete: lo que comparten la Guía y el curso, nunca la pauta de aflojarlo (divergencia anotada en ESTADO)
  const torn = svgDe({ tipo: 'hemorragia', vista: 'torniquete' }) + marcoDe({ tipo: 'hemorragia', vista: 'torniquete' }).nota + renderIllustration({ tipo: 'hemorragia', vista: 'torniquete' }).caption;
  for (const t of ['un hueso', 'entre la herida y el tronco', '14:35', 'consejo médico por radio']) assert.ok(torn.includes(t), t);
  assert.ok(!/afloj|15 minutos|cuarto de hora/i.test(torn), 'el torniquete no dice cuándo aflojarlo');
  // Quemaduras (cap. 2 y cap. 7): química 15–20 min; gravedad: palma 1 %, límites 20/10/1 %
  assert.ok(textoDe({ tipo: 'quemadura', vista: 'enfriar' }).includes('15–20 min'));
  const grav = textoDe({ tipo: 'quemadura', vista: 'gravedad' });
  for (const t of ['&lt; 20 %', '&lt; 10 %', '&lt; 1 %', 'su palma:', 'inhalación', '9 %', '18 %']) assert.ok(grav.includes(t), t);
  for (const t of ['capa superficial', 'capa profunda', 'todas las capas', 'líquido claro', 'negruzca', 'no duele']) assert.ok(textoDe({ tipo: 'quemadura', vista: 'grados' }).includes(t), t);
  // Golpe de calor (cap. 2): > 40 °C, agua a unos 20 °C, hasta 39 °C, control cada 10 min, parar a 38,5 °C
  const calor = textoDe({ tipo: 'golpe-calor' });
  for (const t of ['más de 40 °C', '20 °C', 'baja hasta 39 °C', '38,5 °C', 'cada 10 min', 'Ni alcohol ni estimulantes']) assert.ok(calor.includes(t), t);
  assert.ok(!calor.includes('37 °C'), 'no se enfría hasta 37 °C');
  // Radio-Médico (cap. 4): teléfono, costera con «consulta médica», 24 h gratis, en español, no urgentes de 9 a 15
  const rm = textoDe({ tipo: 'radio-medico' });
  for (const t of ['91 310 34 75', '«consulta médica»', '24 horas', 'gratis', 'en español', '9:00 a 15:00']) assert.ok(rm.includes(t), t);
  assert.ok(!/canal 16|Salvamento/.test(rm), 'lo que la Guía no dice no se dibuja');
  // Botiquín (RD 339/2021, arts. 13.2 y 24): zonas 1 a 4, tipo «Balsas de Salvamento», Guía si se lleva botiquín
  const bq = textoDe({ tipo: 'botiquin' });
  for (const t of ['OBLIGATORIO', 'Balsas de', 'RD 258/1999', 'Guía Sanitaria a Bordo', 'art. 24', 'más de 150 millas', 'hasta 60 millas']) assert.ok(bq.includes(t), t);
  // Hipotermia (cap. 2 y cap. 7): ni frotar ni alcohol ni café; bebidas calientes y azucaradas
  const hip = textoDe({ tipo: 'hipotermia', postura: 'atender' });
  for (const t of ['Ni frotarle ni sacudirle.', 'Ni alcohol, ni café, ni tabaco.', 'calientes', 'azucarados', 'abrazadas']) assert.ok(hip.includes(t), t);
});

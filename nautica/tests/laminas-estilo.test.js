// Estilo C de las láminas (docs/ESTILO-LAMINAS.md): tokens de color en claro y oscuro con contraste AA, y las piezas
// de dibujo comunes sin colores fijos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as C from '../src/illustrations/estilo-c.js';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { marcoDe } from '../src/illustrations/marcos.js';
import { BUOYS } from '../src/illustrations/buoys.js';
import { interactivaDe } from '../src/illustrations/interactivas.js';
import { controlador } from '../src/ui/lamina-estado.js';
import { idLamina } from '../src/illustrations/catalogo-laminas.js';
import { FLAGS } from '../src/illustrations/misc.js';
import { SENALES } from '../src/illustrations/situations.js';

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
/** Variables --lc-* de un bloque de CSS. */
const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
export const CLARO = vars(bloque(':root {'));
export const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));
const FORZADO = vars(bloque(':root[data-theme="dark"] {'));

const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('estilo C: cada color tiene su versión oscura, y el tema oscuro forzado es el mismo que el del sistema', () => {
  const colores = Object.keys(CLARO).filter((k) => CLARO[k].startsWith('#'));
  assert.ok(colores.length >= 25);
  // Las luces son iguales en los dos modos (siempre sobre la noche); el resto cambia.
  for (const k of colores.filter((x) => !x.startsWith('lc-luz-'))) assert.ok(OSCURO[k]?.startsWith('#'), `--${k} sin versión oscura`);
  assert.deepEqual(FORZADO, OSCURO);
  assert.match(CSS, /@media \(prefers-color-scheme: dark\)\s*{\s*:root:not\(\[data-theme="light"\]\)/);
});

test('estilo C: el texto tiene contraste AA (4,5:1) sobre el papel y el fondo, en claro y en oscuro', () => {
  for (const [modo, P] of [['claro', CLARO], ['oscuro', OSCURO]]) {
    for (const texto of ['lc-tinta', 'lc-apagado', 'lc-magenta', 'lc-verde-texto', 'lc-rojo-texto', 'lc-azul-texto']) {
      for (const fondo of ['lc-papel', 'lc-fondo']) {
        const c = contraste(P[texto], P[fondo]);
        assert.ok(c >= 4.5, `${modo}: --${texto} sobre --${fondo} = ${c.toFixed(2)}`);
      }
    }
    // tinta sobre el agua (rótulos sobre el mar) y el texto de noche sobre la noche
    assert.ok(contraste(P['lc-tinta'], P['lc-agua']) >= 4.5, `${modo}: tinta sobre agua`);
    assert.ok(contraste(P['lc-noche-texto'], P['lc-noche']) >= 4.5, `${modo}: texto de noche`);
    // el papel sobre el magenta (el disco «tú» de las luces)
    assert.ok(contraste(P['lc-papel'], P['lc-magenta']) >= 4.5, `${modo}: papel sobre magenta`);
  }
});

test('estilo C: las piezas de dibujo solo usan variables --lc-* y dan ids estables', () => {
  const { out, pt, ray, cierra } = C.lienzo(358, 300, 'Prueba');
  const piezas = [
    ...out, C.cartela(100, 100, 'VERDE', 'estribor', { color: C.T.verdeTxt }), C.etiqueta(50, 50, '112,5°'), C.cota(10, 10, 100, 10, '3 m'), C.cotaArco(179, 160, 141, 0, 112.5, '112,5°'),
    C.referencia(0, 0, 10, 10), C.flecha(0, 0, 50, 50), C.ondas(0, 358, 200), C.ondaCurva(0, 358, 220), C.tierra('M0,0 H10 V10Z', pt), C.reloj(50, 50, 25, 90), C.rosaNorte(30, 30),
    C.paso(20, 20, 1), C.barco(100, 100, 45), C.barquito(1), C.rotulo(10, 10, 'texto', { estilo: 'mono' }), `<rect fill="${ray}"/>`, cierra(),
  ].join('');
  assert.ok(!/#[0-9a-f]{3,8}\b(?![^"]*-(pt|ray)\))/i.test(piezas.replace(/url\(#[^)]*\)/g, '')), 'sin colores fijos');
  for (const v of piezas.match(/var\(--[a-z0-9-]+\)/g)) assert.ok(v.slice(6, -1) in CLARO, `${v} no está en styles/laminas.css`);
  assert.equal(C.lienzo(358, 300, 'Prueba').id, C.lienzo(358, 300, 'Prueba').id);
  assert.notEqual(C.lienzo(358, 300, 'Otra').id, C.lienzo(358, 300, 'Prueba').id);
});

// ---------------------------------------------------------------------------
// Las diez láminas piloto en estilo C: todas sus variantes.

const PILOTO = [
  { tipo: 'cardinales' }, ...Object.keys(BUOYS).filter((k) => k.startsWith('cardinal')).map((resaltar) => ({ tipo: 'cardinales', resaltar })),
  ...['n', 'e', 's', 'w'].map((marca) => ({ tipo: 'cardinales', marca })),
  ...Object.keys(BUOYS).map((clase) => ({ tipo: 'boya', clase })), { tipo: 'boya', clase: 'cardinal-e', reloj: false }, { tipo: 'boya', clase: 'cardinal-w', reloj: false },
  { tipo: 'canal', sentido: 'entrando' }, { tipo: 'canal', sentido: 'saliendo' },
  ...['canal-principal-estribor', 'canal-principal-babor'].flatMap((marca) => ['principal', 'secundario'].map((ruta) => ({ tipo: 'bifurcacion', marca, ruta }))),
  { tipo: 'sectores-luces' }, { tipo: 'sectores-luces', luz: 'todas' }, ...[0, 90, 180, 250, 300].map((aspecto) => ({ tipo: 'sectores-luces', aspecto })),
  ...['cruce', 'vuelta-encontrada', 'alcance', 'vela-amuras', 'vela-barlovento'].map((situacion) => ({ tipo: 'cruce', situacion })), { tipo: 'cruce', situacion: 'cruce', aspecto: 60 },
  { tipo: 'barco' }, { tipo: 'barco', resaltar: ['manga'] }, { tipo: 'barco', resaltar: ['calado', 'francobordo', 'puntal', 'linea-flotacion'] },
  { tipo: 'barco', resaltar: ['proa', 'popa', 'crujia', 'babor', 'estribor'], solo: ['proa', 'popa', 'crujia', 'babor', 'estribor'] }, { tipo: 'barco', modo: 'viento', viento: 'amura-er' }, { tipo: 'barco', modo: 'viento', viento: 'aleta-br' },
  { tipo: 'meteo', sistema: 'borrasca' }, { tipo: 'meteo', sistema: 'anticiclon' },
  ...['dextrogira', 'levogira'].flatMap((sentido) => ['avante', 'atras'].map((marcha) => ({ tipo: 'helice', sentido, marcha }))),
  ...['avante', 'atras'].flatMap((marcha) => ['er', 'br', 'via'].flatMap((timon) => ['dextrogira', 'levogira'].map((sentido) => ({ tipo: 'helice-timon', marcha, timon, sentido })))),
  { tipo: 'hombre-al-agua', maniobra: 'boutakow' }, { tipo: 'hombre-al-agua', maniobra: 'anderson' },
  ...['estable', 'indiferente', 'inestable'].map((caso) => ({ tipo: 'estabilidad', caso })), { tipo: 'estabilidad', caso: 'estable', traslado: 2 },
  ...['curva', 'duodecimos', 'sonda'].flatMap((modo) => [480, 600, 720, 840].map((hora) => ({ tipo: 'marea', modo, hora }))), { tipo: 'marea', modo: 'curva' },
  // PY, carta: nortes, rosa, abatimiento, corriente, enfilación, demoras y estima (con sus casos extremos)
  ...[[-4, 2], [3, -5], [15, 10], [-15, -10], [-15, 10], [0, 0], [0, 3]].map(([dm, desvio]) => ({ tipo: 'nortes', dm, desvio })),
  { tipo: 'rosa', rumbo: 170, demora: 80, marcacion: true, etiqueta: 'faro' }, { tipo: 'rosa', rumbo: 30, demora: 120, marcacion: true, etiqueta: 'faro' }, { tipo: 'rosa', rumbo: 0, demora: 240, marcacion: true, etiqueta: 'faro' },
  { tipo: 'rosa', rumbo: 225 }, { tipo: 'rosa', rumbo: 0 }, { tipo: 'rosa', demora: 60, etiqueta: 'faro' },
  ...['babor', 'estribor'].flatMap((banda) => [{ tipo: 'abatimiento', banda }, { tipo: 'abatimiento', banda, ab: 0 }, { tipo: 'abatimiento', banda, ab: 20, rv: 300 }]),
  { tipo: 'corriente', caso: 'efectivo' }, { tipo: 'corriente', caso: 'rumbo-a-dar' }, { tipo: 'corriente', caso: 'efectivo', rumbo: 200, rc: 300, ic: 3, ab: -8 },
  { tipo: 'corriente', caso: 'rumbo-a-dar', ab: 6, rc: 0, ic: 4 }, { tipo: 'corriente', caso: 'efectivo', ic: 0 },
  ...[[40, 44], [147, 152], [227, 238], [346, 338], [80, 78], [32, 26]].map(([dv, da]) => ({ tipo: 'enfilacion', dv, da })),
  { tipo: 'demoras' }, { tipo: 'demoras', d1: 320, d2: 20 }, { tipo: 'demoras', d1: 320, d2: 40 },
  { tipo: 'demoras', modo: 'traslado', d1: 30, d2: 118, rumbo: 75, millas: 7.5 }, { tipo: 'demoras', modo: 'traslado', d1: 30, d2: 118, rumbo: 75, millas: 7.5, linea: 'segunda' },
  { tipo: 'loxodromica' }, ...[[60, 100, 20], [0, 50, 40], [90, 60, 60], [225, 200, 70]].map(([rumbo, dist, lm]) => ({ tipo: 'loxodromica', modo: 'triangulo', rumbo, dist, lm })),
  { tipo: 'tangente-viento' }, { tipo: 'tangente-viento', banda: 'estribor', viento: 0, dv: 200, resaltar: 'rv' },
  { tipo: 'traves-derrota' }, { tipo: 'traves-derrota', banda: 'estribor', rv: 45, viento: 0, trampa: false },
  { tipo: 'corriente-desconocida' }, { tipo: 'corriente-desconocida', resaltar: 'corriente' }, { tipo: 'loxo-orto' }, { tipo: 'loxo-orto', resaltar: 'orto' },
  // PY, mareas y meteorología
  { tipo: 'marea', modo: 'fases' },
  ...['buys-ballot', 'isobaras', 'frentes', 'frente-frio-corte', 'frente-calido-corte', 'niebla-adveccion', 'niebla-radiacion', 'niebla-vapor', 'brisa-mar', 'brisa-tierra'].map((sistema) => ({ tipo: 'meteo', sistema })),
  { tipo: 'meteo', sistema: 'isobaras', centro: 'A', posicion: 300, separacion: 14 }, { tipo: 'meteo', sistema: 'isobaras', separacion: 34, posicion: 0 },
  ...[0, 10, 12, 22].flatMap((t) => ['niebla-adveccion', 'niebla-radiacion', 'niebla-vapor'].map((sistema) => ({ tipo: 'meteo', sistema, t }))),
  // PY, seguridad
  ...['balance', 'cabezada', 'guinada'].map((mov) => ({ tipo: 'movimiento', mov })), { tipo: 'busqueda', patron: 'cuadrado' }, { tipo: 'busqueda', patron: 'sectores' },
  { tipo: 'fuego', vista: 'tetraedro' }, { tipo: 'fuego', vista: 'clases' },
  { tipo: 'viento-aparente' }, ...['cenida', 'traves', 'aleta', 'popa'].map((rumbo) => ({ tipo: 'viento-aparente', rumbo })),
  // Señales: banderas del Código Internacional y señales acústicas
  ...Object.keys(FLAGS).map((codigo) => ({ tipo: 'bandera', codigo })), ...Object.keys(SENALES).map((senal) => ({ tipo: 'sonido', senal })),
];

/** Todos los SVG de una spec: el dibujo fijo y, si es interactiva, también en clase antes de responder. */
function svgsDe(spec) {
  const out = [renderIllustration(spec).svg];
  const def = interactivaDe(spec);
  if (def) {
    const v = controlador(def, spec, 'clase').vista();
    out.push(v.svg ?? v.vistas.map((x) => x.svg).join(''));
  }
  return out.flatMap((s) => s.split(/(?=<svg\b)/)).filter((s) => s.startsWith('<svg'));
}

test('láminas piloto: se dibujan y siguen siendo specs válidas, con los mismos identificadores', () => {
  for (const s of PILOTO) {
    assert.ok(validSpec(s), JSON.stringify(s));
    for (const svg of svgsDe(s)) assert.ok(!/NaN|undefined|null/.test(svg), `${JSON.stringify(s)}: NaN o undefined`);
  }
  // los identificadores de la galería no cambian (las direcciones #/<tit>/laminas/<id> siguen valiendo)
  assert.equal(idLamina({ tipo: 'cardinales' }), 'cardinales-f38ix9');
  assert.equal(idLamina({ tipo: 'sectores-luces' }), 'sectores-luces-1m2ncby');
  assert.equal(idLamina({ tipo: 'marea', modo: 'curva' }), 'marea-rpre3o');
});

test('láminas piloto: ningún texto del SVG baja de 10,5 px efectivos a 360 px de ancho', () => {
  const malos = [];
  for (const s of PILOTO) for (const svg of svgsDe(s)) {
    const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
    const escala = Math.min(328 / w, 430 / h);
    for (const t of svg.match(/<text\b[^>]*>/g) ?? []) {
      const fs = Number(t.match(/font-size="([\d.]+)"/)?.[1]);
      if (!(fs * escala >= 10.5)) malos.push(`${JSON.stringify(s)} ${w}×${h}: ${t.slice(0, 90)} → ${(fs * escala).toFixed(1)} px`);
    }
  }
  assert.deepEqual(malos.slice(0, 10), []);
});

test('láminas piloto: solo colores --lc-* (ninguno fijo) y todos definidos en claro y en oscuro', () => {
  for (const s of PILOTO) for (const svg of svgsDe(s)) {
    const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
    const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"|(?:fill|stroke):\s*(?!var\(--lc-)[#a-z]/);
    assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]} en …${sinUrl.slice(Math.max(0, (fijo?.index ?? 0) - 80), (fijo?.index ?? 0) + 20)}`);
    for (const v of new Set(svg.match(/var\(--[a-z0-9-]+\)/g))) {
      const k = v.slice(6, -1);
      assert.ok(k in CLARO || k === 'lc-url', `${v} no está en styles/laminas.css`);
      if (k === 'lc-url') continue;
      assert.ok(k in OSCURO || k.startsWith('lc-luz-') || !CLARO[k].startsWith('#'), `${v} sin versión oscura`);
    }
  }
});

test('láminas piloto: marco completo (título, frase clave, nota, datos, texto alternativo) y nombre accesible en el SVG', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  const titulos = new Map();
  for (const s of PILOTO) {
    const m = marcoDe(s);
    assert.ok(m, `${JSON.stringify(s)} sin marco`);
    for (const k of ['tema', 'titulo', 'clave', 'nota', 'alt']) assert.ok(typeof m[k] === 'string' && m[k].trim().length > 2, `${JSON.stringify(s)}: falta ${k}`);
    assert.ok(m.alt.length >= 60, `${JSON.stringify(s)}: texto alternativo demasiado pobre`);
    assert.ok(m.datos?.length >= 1 && m.datos.length <= 3 && m.datos.every((d) => d.cifra && d.texto), `${JSON.stringify(s)}: datos`);
    assert.ok(!/ · |undefined/.test(m.titulo), `${JSON.stringify(s)}: título torpe «${m.titulo}»`);
    assert.ok(![m.titulo, m.clave, m.nota, m.alt, ...m.datos.flatMap((d) => [d.cifra, d.texto])].some((t) => PICTO.test(t)), 'sin emojis');
    assert.ok(/[.!?]$/.test(m.clave), `${JSON.stringify(s)}: la frase clave termina en punto`);
    for (const svg of svgsDe(s)) assert.ok((svg.match(/aria-label="([^"]*)"/)?.[1] ?? '').length >= 30, `${JSON.stringify(s)}: aria-label pobre`);
    // una lámina, un título: dos láminas distintas de la galería no comparten título
    const id = idLamina(s);
    assert.ok(!titulos.has(m.titulo) || titulos.get(m.titulo) === id, `«${m.titulo}» repetido en ${id} y ${titulos.get(m.titulo)}`);
    titulos.set(m.titulo, id);
  }
});

test('láminas piloto interactivas: cada parte que se puede resaltar está dibujada (clases «toca en el dibujo»)', () => {
  for (const s of PILOTO) {
    const def = interactivaDe(s);
    if (!def?.partes) continue;
    const v = controlador(def, s, 'galeria').vista();
    const todo = v.svg ?? v.vistas.map((x) => x.svg).join('');
    for (const p of Object.keys(def.partes)) {
      if (p === 'timon' && s.timon === 'via') continue;
      if (p === 'corriente' && Number(s.ic) === 0) continue; // sin corriente no se dibuja su vector
      // la niebla solo aparece al saturarse el aire, y el agua templada es solo de la niebla de vapor
      if (s.tipo === 'meteo' && (p === 'niebla' || (p === 'agua' && s.sistema !== 'niebla-vapor') || (p === 'aire' && s.sistema === 'niebla-radiacion'))) continue;
      // una rosa solo de rumbo no tiene demora ni marcación (ni una de demora, rumbo)
      if (s.tipo === 'rosa' && ((p === 'demora' && s.demora == null) || (p === 'rumbo' && s.rumbo == null) || (p === 'marcacion' && (s.rumbo == null || s.demora == null)))) continue;
      assert.ok(todo.includes(`data-parte="${p}"`), `${JSON.stringify(s)}: falta data-parte="${p}"`);
    }
  }
});

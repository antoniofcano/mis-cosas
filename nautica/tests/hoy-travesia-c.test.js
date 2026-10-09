// Hoy y la Travesía en estilo C (docs/ENTRADA.md, docs/TRAVESIA.md, docs/ESTILO-LAMINAS.md): la carta de la derrota
// dibujada como una lámina de carta (solo tokens --lc-*, texto mínimo, estados por forma y no solo por color) y el CSS de
// la entrada con la paleta de la carta en claro y en oscuro, contraste AA, sin animaciones nuevas y sin texto pequeño.
// Solo presentación: la lógica (faros, marcador, sesión) la prueban tests/entrada.test.js y tests/travesia.test.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cartaDerrotaSvg, ladoNombre, escalaY, ANCHO, ALTO, ALTO_COMPACTA_SVG, ALTO_COMPACTA } from '../src/illustrations/derrota-c.js';
import { posicionesDerrota, BANDERA, PUNTOS_DERROTA } from '../src/course/travesia.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const LAM = leer('styles/laminas.css');
const APP = leer('styles/app.css');
const sinComentarios = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const trozo = (desde) => { const i = LAM.indexOf(desde); return LAM.slice(i, LAM.indexOf('}', i)); };
const CLARO = vars(trozo(':root {'));
const OSCURO = vars(trozo(':root:not([data-theme="light"]) {'));
const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const faros = (estados) => estados.map((estado) => ({ estado }));
const SEIS = faros(['on', 'on', 'parcial', 'parcial', 'off', 'off']);
const svgDe = (fs, o) => cartaDerrotaSvg(fs, posicionesDerrota(fs.length), BANDERA, o);

test('carta de la derrota: SVG decorativo, solo colores --lc-* y el marco graduado de las láminas', () => {
  for (const compacta of [false, true]) {
    const s = svgDe(SEIS, { compacta, rotulo: { titulo: 'DERROTA', sub: 'PER · 6 faros' } });
    assert.match(s, /^<svg class="carta-svg lc" viewBox="0 0 358 (320|232)" aria-hidden="true" focusable="false">/);
    assert.ok(!/#[0-9a-f]{3,8}\b(?!-)|rgba?\(|hsl/i.test(s.replace(/url\(#[^)]+\)/g, '')), 'sin colores fijos');
    for (const m of s.matchAll(/(?:fill|stroke)="([^"]+)"/g)) assert.match(m[1], /^(var\(--lc-[a-z0-9-]+\)|none|url\(#lc[a-z0-9]+-pt\))$/, m[1]);
    assert.ok(s.includes('stroke-width="1.7"'), 'graduación del marco');
    assert.equal((s.match(/class="pata /g) ?? []).length, 6, 'una pata por faro');
  }
});

test('carta de la derrota: el estado de cada pata se ve por el trazo, no solo por el color', () => {
  const s = svgDe(SEIS);
  const pata = (e) => s.match(new RegExp(`class="pata ${e}"[^>]*>`))[0];
  assert.match(pata('on'), /stroke="var\(--lc-magenta\)" stroke-width="2.4"/);
  assert.doesNotMatch(pata('on'), /dasharray/, 'la derrota hecha, continua');
  assert.match(pata('parcial'), /stroke-dasharray="7 5"/);
  assert.match(pata('off'), /stroke-dasharray="1.5 5"/);
});

test('carta de la derrota: texto mínimo (10,5 px efectivos a 360 px) y rosa y cartela solo en la grande', () => {
  const grande = svgDe(SEIS, { rotulo: { titulo: 'DERROTA', sub: 'PY · 3 faros' } });
  // A 360 px la carta mide 360 − 2 × 18 = 324 px de ancho (main con 1rem de margen y la raíz a 18 px).
  const escala = 324 / ANCHO;
  const tam = [...grande.matchAll(/<text[^>]*font-size="([\d.]+)"/g)].map((m) => Number(m[1]));
  assert.ok(tam.length >= 3, 'la N de la rosa y la cartela');
  for (const t of tam) assert.ok(t * escala >= 10.5, `texto de ${t} → ${(t * escala).toFixed(2)} px`);
  assert.match(grande, />N<\/text>/);
  assert.match(grande, />DERROTA<\/text>/);
  const compacta = svgDe(SEIS, { compacta: true, rotulo: { titulo: 'DERROTA' } });
  assert.doesNotMatch(compacta, /<text/, 'la compacta no lleva texto en el SVG (los nombres van en HTML)');
  assert.doesNotMatch(svgDe(SEIS), /DERROTA/, 'sin rotulo no hay cartela');
});

test('carta compacta: las y se escalan (no se estira el dibujo) y las patas caen bajo los faros HTML', () => {
  assert.equal(escalaY('M10 20 L30 40 C1 2 3 4 5 6 Z', 0.5), 'M10 10 L30 20 C1 1 3 2 5 3 Z');
  assert.equal(escalaY('M10 20', 1), 'M10 20');
  const pos = posicionesDerrota(6);
  const k = ALTO_COMPACTA_SVG / ALTO_COMPACTA;
  const s = svgDe(SEIS, { compacta: true });
  const primera = s.match(/class="pata on" x1="([\d.]+)" y1="([\d.]+)"/);
  assert.equal(Number(primera[1]), pos[0][0]);
  assert.ok(Math.abs(Number(primera[2]) - pos[0][1] * k) < 0.06, 'misma proporción que las capas HTML (top = y / 360)');
  assert.equal(ALTO, 320);
});

test('carta: vale para la PER, el PY y bancos con otro número de faros', () => {
  for (const n of [3, 5, 6, 7]) {
    const fs = faros(Array.from({ length: n }, (_, i) => ['on', 'parcial', 'off'][i % 3]));
    for (const compacta of [false, true]) assert.equal((svgDe(fs, { compacta }).match(/class="pata /g) ?? []).length, n);
  }
});

test('nombres de los faros: al lado cuando otro faro queda justo debajo (Carta sobre Balizamiento en la PER)', () => {
  assert.equal(ladoNombre(PUNTOS_DERROTA, 5, BANDERA), 'nombre-izq');
  assert.equal(ladoNombre(PUNTOS_DERROTA, 0, BANDERA), '');
  // Ningún nombre que se queda debajo de su faro tiene otro faro o la bandera justo debajo, con 3 a 7 faros.
  for (const n of [3, 4, 5, 6, 7]) {
    const pos = posicionesDerrota(n);
    pos.forEach(([x, y], i) => {
      if (ladoNombre(pos, i, BANDERA)) return;
      for (const [px, py] of [...pos, BANDERA].filter((_, j) => j !== i)) assert.ok(!(Math.abs(px - x) < 70 && py > y && py - y < 90), `${n} faros, faro ${i + 1}`);
    });
  }
});

// ---- CSS ----------------------------------------------------------------------------------------------------------------

const INI = '/* ---- Hoy y la Travesía en estilo C';
const FIN = '/* ---- fin Hoy y la Travesía en estilo C ---- */';
const BLOQUE = (() => { const i = LAM.indexOf(INI); const j = LAM.indexOf(FIN); assert.ok(i > 0 && j > i, 'bloque de Hoy y la Travesía en laminas.css'); return LAM.slice(i, j); })();

test('CSS de Hoy y la Travesía: sin colores fijos, cada variable existe (en claro y en oscuro) y sin animaciones nuevas', () => {
  const css = sinComentarios(BLOQUE);
  assert.ok(!/#[0-9a-f]{3,8}\b|rgba?\(|hsl/i.test(css), 'sin colores fijos');
  assert.doesNotMatch(css, /@keyframes|animation|transition/, 'las animaciones son las de siempre (docs/EFECTOS.md)');
  const oscuroApp = APP.slice(APP.indexOf('@media (prefers-color-scheme: dark)'));
  for (const v of new Set(css.match(/var\(--[a-z0-9-]+/g))) {
    const k = v.slice(4);
    if (k.startsWith('--lc-')) { const c = CLARO[k.slice(2)]; assert.ok(c, `${k} no definida`); if (c.startsWith('#')) assert.ok(OSCURO[k.slice(2)], `${k} sin oscuro`); continue; }
    assert.ok(['--fuente-texto', '--fuente-titulos', '--accent'].includes(k), `${k}: usa un --lc-*`);
    assert.ok(APP.includes(`${k}:`), `${k} no definida`);
  }
  assert.ok(oscuroApp.length > 0);
});

test('CSS de Hoy y la Travesía: los colores de la app se reasignan a la paleta de la carta dentro de la entrada', () => {
  const raiz = BLOQUE.slice(BLOQUE.indexOf('.entrada, .travesia-pantalla {'));
  const reasignadas = Object.fromEntries([...raiz.slice(0, raiz.indexOf('}')).matchAll(/(--[a-z0-9-]+):\s*var\((--lc-[a-z0-9-]+)\)/g)].map((m) => [m[1], m[2]]));
  for (const k of ['--surface', '--bg', '--text', '--muted', '--accent', '--ok', '--warn', '--sesion-bg', '--sesion-fg', '--sesion-boton', '--sesion-boton-fg',
    '--trav-bg', '--trav-fg', '--trav-oro', '--trav-disco', '--faro-on-bg', '--faro-on-borde', '--faro-luz', '--faro-off-bg', '--faro-off-borde', '--faro-off-texto', '--on-accent']) {
    assert.ok(reasignadas[k], `${k} sin reasignar a un --lc-*`);
  }
});

test('Hoy y la Travesía: contraste AA del texto y de los botones en claro y en oscuro', () => {
  for (const [modo, P] of [['claro', CLARO], ['oscuro', OSCURO]]) {
    for (const fondo of ['lc-fondo', 'lc-papel']) {
      for (const tx of ['lc-tinta', 'lc-apagado', 'lc-magenta', 'lc-azul-texto', 'lc-verde-texto', 'lc-rojo-texto']) {
        const c = contraste(P[tx], P[fondo]);
        assert.ok(c >= 4.5, `${modo}: ${tx} sobre ${fondo} = ${c.toFixed(2)}`);
      }
    }
    // Botón principal: papel sobre tinta. Bordes de los faros y de las cartelas (3:1 para lo que no es texto).
    assert.ok(contraste(P['lc-papel'], P['lc-tinta']) >= 4.5, `${modo}: botón`);
    for (const borde of ['lc-tinta', 'lc-magenta', 'lc-apagado']) assert.ok(contraste(P[borde], P['lc-papel']) >= 3, `${modo}: ${borde}`);
  }
});

test('Hoy y la Travesía: ningún texto por debajo de 12 px (.667rem con la raíz de 18 px)', () => {
  assert.match(APP, /html \{ font-size: 18px; \}/);
  const i = APP.indexOf('/* ---- Entrada única ---- ');
  const j = APP.indexOf('/* ---- fin Entrada única ---- */');
  const t = APP.indexOf('/* ---- Travesía (docs/TRAVESIA.md)');
  for (const css of [BLOQUE, APP.slice(i, j), APP.slice(t, APP.indexOf('/* Efectos de cambio', t))]) {
    for (const m of sinComentarios(css).matchAll(/font-size:\s*([^;}]+)/g)) {
      const v = m[1].trim();
      const px = v.endsWith('rem') ? parseFloat(v) * 18 : v.endsWith('px') ? parseFloat(v) : null;
      assert.ok(px == null || px >= 12, `font-size: ${v}`);
      assert.doesNotMatch(v, /vw/, `font-size: ${v} (puede bajar de 12 px en pantallas estrechas)`);
    }
  }
  assert.match(APP, /button\.fase \.fase-num \{ font-size: \.68rem;/, 'el número de fase no se encoge con la pantalla');
});

test('la carta de la Travesía y de Hoy usa los tokens de la carta y su dibujo C (no el fondo antiguo)', () => {
  const t = APP.slice(APP.indexOf('/* ---- Travesía (docs/TRAVESIA.md)'));
  const carta = t.slice(t.indexOf('.carta-trav {'), t.indexOf('.trav-detalle, .trav-semana'));
  assert.doesNotMatch(carta, /var\(--(sea|grid|land|land-stroke|c-effective)\)/);
  assert.match(carta, /\.carta-trav \{[^}]*background: var\(--lc-papel\)/);
  assert.match(carta, /:is\(button, span\)\.faro\.on \{ border: 4px double var\(--lc-magenta\)/, 'encendido: doble filete');
  assert.match(carta, /:is\(button, span\)\.faro\.parcial \{ border: 2px dashed/, 'en camino: a trazos');
  assert.doesNotMatch(APP, /\.carta-fondo|\.pata[ .{]/, 'las patas las pinta el SVG C (con atributos)');
  assert.match(APP, /\.marca-aqui \{[^}]*color: var\(--lc-magenta\)/);
  const trav = leer('src/ui/views/travesia.js');
  assert.match(trav, /from '\.\.\/\.\.\/illustrations\/derrota-c\.js'/);
  assert.doesNotMatch(trav, /const FONDO|<path class="costa"/);
});

test('Hoy y la Travesía: el foco se ve (contorno de 3 px) y los botones de la carta conservan sus 48 px', () => {
  assert.match(BLOQUE, /\.entrada :is\(button, a, summary\):focus-visible, \.travesia-pantalla :is\(button, a, summary\):focus-visible \{ outline: 3px solid/);
  assert.match(APP, /\.carta-trav button\.faro \{ width: 48px; min-width: 48px; height: 48px; min-height: 48px;/);
  assert.match(APP, /\.carta-trav button\.faro:focus-visible \{ outline: 3px solid/);
});

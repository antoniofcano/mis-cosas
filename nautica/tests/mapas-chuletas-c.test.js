// Mapas de conceptos y chuletas en estilo C (docs/ESTILO-LAMINAS.md, «Mapas de conceptos y chuletas»): el mapa entero
// se dibuja con las piezas del estilo C y solo colores --lc-*, su texto no baja de 10,5 px efectivos en un móvil de
// 360 px, cada concepto es un enlace con nombre accesible y las relaciones van escritas debajo; la chuleta imprime en
// A4, en blanco y negro, con la titulación y la fecha (y sin nombres de escuelas).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAPAS } from '../src/course/mapas.js';
import { mapaSvg, leyendaMapa, lineasNombre, MAPA_C } from '../src/illustrations/mapa-c.js';
import { anchoTexto } from '../src/illustrations/estilo-c.js';
import { cabeceraImpresion, fechaImpresion } from '../src/ui/views/chuleta.js';
import { fichasDeNodo } from '../src/ui/views/mapas.js';
import { volverDe } from '../src/ui/views/idea.js';
import { TITULACIONES } from '../src/theory/blocks.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const CSS = leer('styles/laminas.css');
const vars = (desde) => { const i = CSS.indexOf(desde); return Object.fromEntries([...CSS.slice(i, CSS.indexOf('}', i)).matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]])); };
const CLARO = vars(':root {');
const OSCURO = vars(':root:not([data-theme="light"]) {');
const mapas = MAPAS.map((id) => JSON.parse(leer(`data/mapas/${id}.json`)));
const PICTO = /\p{Extended_Pictographic}/u;

test('mapa entero: se dibuja a escala 1 y ningún texto baja de 10,5 px efectivos (ni de TXT.min)', () => {
  for (const m of mapas) {
    const { svg, W, H } = mapaSvg(m, { actual: m.nodos[0].id, href: (n) => `#/per/mapas/${m.id}?n=${n.id}` });
    assert.match(svg, new RegExp(`^<svg width="${W}" height="${H}" style="min-width: ${W}px; max-width: ${Math.round(W * 1.25)}px" viewBox="0 0 ${W} ${H}"`), m.id);
    assert.ok(!/NaN|undefined|null/.test(svg), `${m.id}: NaN o undefined`);
    // a escala 1 el tamaño efectivo es el font-size (el recuadro se desplaza; en el escritorio, solo se agranda)
    for (const t of svg.match(/<text\b[^>]*>/g)) {
      const fs = Number(t.match(/font-size="([\d.]+)"/)[1]);
      assert.ok(fs >= 11.5, `${m.id}: ${t.slice(0, 80)}`);
    }
  }
  // el CSS no puede encogerlo (el min-width va en línea) y el recuadro se desplaza
  assert.doesNotMatch(leer('styles/laminas.css'), /\.mc-lienzo svg \{[^}]*(min-width|max-width)/);
  assert.match(leer('styles/laminas.css'), /\.mc-lienzo \{ overflow: auto;/);
});

test('mapa entero: solo colores --lc-*, definidos en claro y en oscuro, y sin emojis', () => {
  for (const m of mapas) {
    const { svg } = mapaSvg(m, { actual: m.nodos[1].id, href: () => '#' });
    const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
    const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"/);
    assert.ok(!fijo, `${m.id}: color fijo ${fijo?.[0]}`);
    for (const v of new Set(svg.match(/var\(--lc-[a-z0-9-]+\)/g))) assert.ok(v.slice(6, -1) in CLARO && v.slice(6, -1) in OSCURO, `${m.id}: ${v}`);
    assert.ok(!PICTO.test(svg), `${m.id}: emoji en el dibujo`);
  }
});

test('mapa entero: las cartelas no se pisan y cada nombre cabe en la suya (4 líneas como mucho)', () => {
  for (const m of mapas) {
    const { cajas, W, H } = mapaSvg(m);
    const cs = [...cajas.entries()];
    for (const [id, c] of cs) {
      assert.ok(c.x0 >= 8 && c.y0 >= 8 && c.x1 <= W - 8 && c.y1 <= H - 8, `${m.id}/${id}: fuera del marco`);
      const n = m.nodos.find((x) => x.id === id);
      const ls = lineasNombre(n.nombre);
      assert.ok(ls.length <= 4, `${m.id}/${id}: ${ls.length} líneas`);
      assert.ok(ls.length * MAPA_C.linea <= c.y1 - c.y0 - 8, `${m.id}/${id}: no cabe en alto`);
      // una palabra sola más ancha que la cartela se saldría
      for (const l of ls) assert.ok(anchoTexto(l, MAPA_C.nombre, 'serif') <= MAPA_C.nw - 6, `${m.id}/${id}: «${l}» no cabe`);
    }
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const [a, b] = [cs[i][1], cs[j][1]];
      assert.ok(!(a.x0 < b.x1 + 2 && b.x0 < a.x1 + 2 && a.y0 < b.y1 + 2 && b.y0 < a.y1 + 2), `${m.id}: ${cs[i][0]} y ${cs[j][0]} se pisan`);
    }
  }
});

test('mapa entero: accesible (grupo con nombre, un enlace con nombre por concepto, el actual marcado) y con su leyenda', () => {
  for (const m of mapas) {
    const actual = m.nodos.at(-1);
    const { svg, relaciones, confusiones } = mapaSvg(m, { actual: actual.id, href: (n) => `#/x/mapas/${m.id}?n=${n.id}` });
    assert.match(svg, /^<svg [^>]*role="group"[^>]*aria-label="Mapa de conceptos «[^"]{40,}"/, m.id);
    const enlaces = svg.match(/<a class="mc-nodo" href="[^"]+"[^>]*aria-label="[^"]{10,}"/g) ?? [];
    assert.equal(enlaces.length, m.nodos.length, `${m.id}: un enlace por concepto`);
    assert.equal((svg.match(/aria-current="true"/g) ?? []).length, 1);
    assert.match(svg, new RegExp(`data-nodo="${actual.id}"[^>]*aria-current="true"`));
    // cada relación con su número y cada confusión con su letra, una vez en el dibujo
    const rels = m.aristas.filter((a) => a.tipo !== 'confunde');
    assert.equal(relaciones.length, rels.length);
    assert.equal(confusiones.length, m.aristas.length - rels.length);
    for (const x of [...relaciones, ...confusiones]) assert.equal((svg.match(new RegExp(`>${x.marca}</text>`, 'g')) ?? []).length, 1, `${m.id}: marca ${x.marca}`);
    // las relaciones van en el HTML, no en el SVG
    for (const a of rels) assert.ok(!svg.includes(`>${a.rel}<`), `${m.id}: relación escrita dentro del dibujo`);
    // sin enlaces, cartelas que no se pueden tocar
    assert.ok(!mapaSvg(m).svg.includes('<a '));
  }
});

test('leyenda: números para las relaciones (en el orden del mapa) y letras para las confusiones', () => {
  const l = leyendaMapa({ aristas: [{ de: 'a', a: 'b', rel: 'x' }, { de: 'a', a: 'c', rel: 'y', tipo: 'confunde' }, { de: 'b', a: 'c', rel: 'z' }, { de: 'b', a: 'a', rel: 'w', tipo: 'confunde' }] });
  assert.deepEqual(l.relaciones.map((x) => [x.marca, x.rel]), [['1', 'x'], ['2', 'z']]);
  assert.deepEqual(l.confusiones.map((x) => [x.marca, x.rel]), [['A', 'y'], ['B', 'w']]);
});

test('mapa entero: una relación y una confusión entre los mismos conceptos van en paralelo, no encima', () => {
  const m = mapas.find((x) => x.id === 'rumbos');
  const { svg } = mapaSvg(m);
  const lineaDe = (k) => svg.match(new RegExp(`<(?:g|line)[^>]*data-arista="${k}"[^>]*>(?:<line[^>]*>)?`))[0];
  const ys = (s) => [...s.matchAll(/y1="([\d.]+)"/g)].map((x) => Number(x[1]));
  const pares = m.aristas.filter((a) => m.aristas.some((b) => b !== a && [b.de, b.a].sort().join() === [a.de, a.a].sort().join()));
  assert.ok(pares.length >= 2, 'rumbos tiene Ra–Rv como relación y como confusión');
  const [a, b] = pares;
  assert.notDeepEqual(ys(lineaDe(`${a.de}-${a.a}`)), ys(lineaDe(`${b.de}-${b.a}`)));
});

test('explorar: la ficha de la idea de un concepto, solo si el banco tiene etiquetas y la idea tiene preguntas', () => {
  const conceptos = [
    { id: 'c1', tipo: 'concepto', tit: ['per'], clases: ['per-10-6'], etiqueta: 'Rumbo verdadero' },
    { id: 'c2', tipo: 'concepto', tit: ['py'], clases: ['per-10-6'], etiqueta: 'Del PY' },
    { id: 'c3', tipo: 'concepto', tit: ['per'], clases: ['per-10-6'], etiqueta: 'Sin preguntas' },
    { id: 'g', tipo: 'grupo', tit: ['per'], clases: ['per-10-6'], etiqueta: 'Grupo' },
  ];
  const ic = { catalogo: { conceptos }, preguntasDe: (id) => (id === 'c3' ? [] : ['q']) };
  assert.deepEqual(fichasDeNodo(ic, { clase: 'per-10-6' }, 'per').map((c) => c.id), ['c1']);
  assert.deepEqual(fichasDeNodo(null, { clase: 'per-10-6' }, 'per'), []);
  assert.deepEqual(fichasDeNodo(ic, { clase: 'otra' }, 'per'), []);
  // y la ficha vuelve al mapa
  assert.deepEqual(volverDe('per', 'mapas/rumbos'), ['El mapa de conceptos', '#/per/mapas/rumbos']);
  assert.deepEqual(volverDe('per', 'mapas/<x>'), ['Hoy', '#/per']);
  const vista = leer('src/ui/views/mapas.js');
  assert.match(vista, /hrefFicha\(tit, c\.id, `mapas\/\$\{id\}`\)/);
});

test('chuleta impresa: cabecera con la titulación y la fecha, sin nombres de escuelas ni academias', () => {
  const c = cabeceraImpresion(TITULACIONES.per, 5, new Date(2026, 9, 9));
  assert.deepEqual(c, { titulacion: 'Patrón de Embarcaciones de Recreo (PER)', hoja: 'Chuleta del tema 5', fecha: '9 de octubre de 2026' });
  assert.equal(cabeceraImpresion(TITULACIONES.py, 3, new Date(2027, 0, 2)).titulacion, 'Patrón de Yate (PY)');
  assert.equal(fechaImpresion(new Date(2027, 0, 2)), '2 de enero de 2027');
  for (const f of ['src/ui/views/chuleta.js', 'src/ui/views/mapas.js', 'src/illustrations/mapa-c.js']) {
    assert.doesNotMatch(leer(f), /academia|escuela|sirocodiez/i, f);
    assert.ok(!PICTO.test(leer(f)), `${f}: emoji`);
  }
  const vista = leer('src/ui/views/chuleta.js');
  assert.match(vista, /onclick: \(\) => window\.print\(\) \}, conIcono\('imprimir', 'Imprimir \/ guardar PDF'\)/);
});

test('chuleta impresa: A4, blanco y negro en cualquier tema y saltos de página limpios', () => {
  const css = leer('styles/laminas.css');
  const i = css.indexOf('/* Al imprimir: A4');
  assert.ok(i > 0);
  const print = css.slice(css.indexOf('@media print {', i));
  assert.match(print, /@page \{ size: A4;/);
  // los tokens --lc-* pasan a blanco y negro con el tema claro, el oscuro del sistema y el oscuro forzado
  assert.match(print, /^@media print \{\s*:root, :root\[data-theme="dark"\], :root:not\(\[data-theme="light"\]\) \{[^}]*--lc-fondo: white; --lc-papel: white; --lc-tinta: black;[^}]*--lc-magenta: black;/);
  assert.match(print, /\.mc-clase-tit \{[^}]*break-after: avoid/);
  assert.match(print, /\.mc-regla, \.mc-trampa \{[^}]*break-inside: avoid/);
  assert.match(print, /\.mc-claves li \{ break-inside: avoid/);
  assert.match(print, /\.mc-impresion \{ display: flex/);
  assert.match(css, /\.mc-impresion \{ display: none; \}/, 'la cabecera de papel no se ve en pantalla');
  // la app esconde su cabecera y su barra al imprimir y pone el papel blanco
  assert.match(leer('styles/app.css'), /@media print \{\s*header\.top, \.tabbar[^}]*\}\s*html, body \{ background: #fff !important; color: #000 !important; \}/);
  // y no quedan los estilos antiguos de los mapas (colores de la app en vez de --lc-*)
  assert.doesNotMatch(leer('styles/app.css'), /\.mapa-nodo|\.mapa-etiqueta|\.chuleta-clase \{/);
});

test('mapas y chuletas en pantalla: ningún texto por debajo de .72rem (13 px) en su CSS', () => {
  const css = leer('styles/laminas.css');
  const seccion = css.slice(css.indexOf('/* ---- Mapas de conceptos y chuletas'), css.indexOf('/* Al imprimir: A4'));
  for (const m of seccion.matchAll(/font-size: ([\d.]+)rem/g)) assert.ok(Number(m[1]) >= 0.72, m[0]);
});

// Un único sistema de iconos (docs/ICONOS.md): los SVG de línea de src/ui/iconos.js. Ni un emoji en la interfaz: se ven
// distinto en cada móvil y no siguen la paleta ni el modo oscuro. Estos tests impiden que vuelvan a entrar y comprueban
// que cada icono que se pide existe y está dibujado con las reglas del set.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONOS, svgIcono, existeIcono } from '../src/ui/iconos.js';
import { PER, PY, TITULACIONES } from '../src/theory/blocks.js';
import { CATEGORIES } from '../src/exercises/define.js';
import { mazos } from '../src/course/tarjetas.js';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const UI = join(RAIZ, 'src/ui');
const ficheros = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? ficheros(p) : p.endsWith('.js') ? [p] : []; });

// Lo que se considera «emoji o pictograma»: todo Extended_Pictographic, más flechas, signos técnicos (⏱ ⏸ ⌖…), formas
// geométricas (▶ ◀ ▢…), símbolos y dingbats (✋ ✎ ✕…) y el selector de variación de emoji (U+FE0F).
const PICTO = /[\p{Extended_Pictographic}←-⇿⌀-⏿■-◿☀-➿⬀-⯿️]/gu;
// Lista blanca: signos tipográficos que se leen como texto (no son iconos) y se ven igual en todas partes.
const PERMITIDOS = new Set([
  '→', '←', '↑', '↓', '↔', // flechas de texto: «Siguiente →», «← Volver», «Arrastra o usa ↑ ↓», «↔ Opuesta»
  '✓', '✗', // marcas de hecho / fallo en listas y en el resumen de un examen («✓ vista», «✓ / ✗ / ·»)
  '▾', // el desplegable de titulación de la cabecera («PER ▾»)
  '●', '○', // la dificultad de un ejercicio de carta («●●○»)
]);

test('no hay emojis en src/ui (fuera de la lista blanca de signos tipográficos)', () => {
  const malos = [];
  for (const f of ficheros(UI)) {
    readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
      for (const c of linea.match(PICTO) ?? []) if (!PERMITIDOS.has(c)) malos.push(`${f.slice(RAIZ.length)}:${i + 1} ${c} U+${c.codePointAt(0).toString(16).toUpperCase()}`);
    });
  }
  assert.deepEqual(malos, [], 'usa icono()/conIcono() de src/ui/iconos.js en vez de un emoji');
});

test('index.html: la cabecera lleva los SVG de la brújula y los ajustes (sin emoji que parpadee antes del JS)', () => {
  const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
  const cab = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  assert.deepEqual(cab.match(PICTO)?.filter((c) => !PERMITIDOS.has(c)) ?? [], []);
  assert.ok(cab.includes(svgIcono('brujula')), 'la marca lleva la brújula del set, igual que la dibuja el JS');
  assert.ok(cab.includes(svgIcono('ajustes')), 'el engranaje de ajustes');
  assert.match(cab, /class="brand"[^>]*><span class="ico" aria-hidden="true">/);
});

test('cada icono pedido por nombre en src/ui existe en el set', () => {
  const faltan = [];
  for (const f of ficheros(UI)) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/\b(?:icono|conIcono|icono_|discoFila)\(\s*'([a-z-]+)'/g)) if (!existeIcono(m[1])) faltan.push(`${f.slice(RAIZ.length)}: ${m[1]}`);
    for (const m of src.matchAll(/\bicon: '([a-z-]+)'/g)) if (!existeIcono(m[1])) faltan.push(`${f.slice(RAIZ.length)}: ${m[1]}`);
  }
  assert.deepEqual(faltan, []);
});

test('temas, titulaciones, categorías de ejercicios y mazos llevan un icono del set (ico), no un emoji', () => {
  const todos = [
    ...[PER, PY].flatMap((e) => e.bloques.map((b) => [`tema ${b.titulo}`, b])),
    ...Object.values(TITULACIONES).map((t) => [`titulación ${t.sigla}`, t]),
    ...CATEGORIES.map((c) => [`categoría ${c.title}`, c]),
    ...['per', 'py'].flatMap((tit) => mazos(tit).map((m) => [`mazo ${m.titulo}`, m])),
  ];
  assert.ok(todos.length > 20);
  for (const [que, x] of todos) {
    assert.ok(existeIcono(x.ico), `${que}: «${x.ico}» no está en el set`);
    assert.equal(x.icon, undefined, `${que}: queda el campo icon (emoji)`);
  }
});

test('reglas de dibujo: 24 × 24, trazo 1,75 redondeado, sin relleno y solo currentColor', () => {
  assert.ok(ICONOS.length >= 80);
  for (const n of ICONOS) {
    const svg = svgIcono(n);
    assert.match(svg, /^<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/, n);
    assert.doesNotMatch(svg, /#[0-9a-f]{3,6}\b|rgb\(|fill="(?!none)|stroke="(?!currentColor)/i, `${n}: sin colores fijos (los estados los pone el CSS)`);
    // Dentro del lienzo: ninguna coordenada absoluta de un M fuera de 0…24.
    for (const m of svg.matchAll(/M(-?[\d.]+)[ ,](-?[\d.]+)/g)) for (const v of [m[1], m[2]]) assert.ok(Number(v) >= 0 && Number(v) <= 24, `${n}: ${m[0]}`);
  }
  assert.equal(svgIcono('no-existe').includes('<path'), false);
});

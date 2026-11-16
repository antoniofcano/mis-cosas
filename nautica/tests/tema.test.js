// R-67: aspecto claro / oscuro / automático. La elección del tema, que el modo forzado sea igual que el automático, los
// contrastes AA calculados (no a ojo), que el ajuste no se sincronice y que las letras nuevas quepan en el presupuesto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { esAjusteCompartido } from '../src/store/sync/operaciones.js';
import { normalizaAspecto, temaForzado, colorBarra, aplicaAspecto, guardaAspecto, elegirAspecto, iniciarAspecto, COLOR_BARRA, CLAVE_ASPECTO, ASPECTOS } from '../src/ui/tema.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const APP = leer('styles/app.css');
const LAM = leer('styles/laminas.css');
const INDEX = leer('index.html');

// ---- la elección del tema ----
test('el aspecto: automático por defecto y solo claro u oscuro fuerzan', () => {
  assert.deepEqual(ASPECTOS.map((a) => a[0]), ['auto', 'claro', 'oscuro']);
  for (const v of [undefined, null, '', 'auto', 'raro', 3]) { assert.equal(normalizaAspecto(v), 'auto'); assert.equal(temaForzado(v), null); }
  assert.equal(temaForzado('claro'), 'light');
  assert.equal(temaForzado('oscuro'), 'dark');
});

test('el color de la barra del navegador sigue al aspecto o, en automático, al sistema', () => {
  assert.equal(colorBarra('claro', true), COLOR_BARRA.claro);
  assert.equal(colorBarra('oscuro', false), COLOR_BARRA.oscuro);
  assert.equal(colorBarra('auto', true), COLOR_BARRA.oscuro);
  assert.equal(colorBarra(undefined, false), COLOR_BARRA.claro);
});

const docFalso = () => {
  const metas = [{ media: '(prefers-color-scheme: light)', content: COLOR_BARRA.claro }, { media: '(prefers-color-scheme: dark)', content: COLOR_BARRA.oscuro }]
    .map((m) => ({ getAttribute: (k) => (k === 'media' ? m.media : m.content), setAttribute: (k, v) => { if (k === 'content') m.content = v; }, m }));
  const attrs = {};
  return { metas, attrs, documentElement: { setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } }, querySelectorAll: () => metas };
};

test('aplicaAspecto pone y quita data-theme y ajusta las dos metas theme-color', () => {
  const d = docFalso();
  aplicaAspecto('oscuro', d);
  assert.equal(d.attrs['data-theme'], 'dark');
  assert.deepEqual(d.metas.map((x) => x.m.content), [COLOR_BARRA.oscuro, COLOR_BARRA.oscuro]);
  aplicaAspecto('claro', d);
  assert.equal(d.attrs['data-theme'], 'light');
  assert.deepEqual(d.metas.map((x) => x.m.content), [COLOR_BARRA.claro, COLOR_BARRA.claro]);
  aplicaAspecto('auto', d);
  assert.equal(d.attrs['data-theme'], undefined);
  assert.deepEqual(d.metas.map((x) => x.m.content), [COLOR_BARRA.claro, COLOR_BARRA.oscuro], 'cada meta recupera el suyo');
});

test('el aspecto es un ajuste del aparato: no se sincroniza y se guarda en la clave del <head>', () => {
  assert.equal(esAjusteCompartido('aspecto'), false);
  const guardados = {};
  const storage = { setItem: (k, v) => { guardados[k] = v; }, removeItem: (k) => { delete guardados[k]; } };
  guardaAspecto('oscuro', storage); assert.equal(guardados[CLAVE_ASPECTO], 'oscuro');
  guardaAspecto('auto', storage); assert.equal(guardados[CLAVE_ASPECTO], undefined);
  guardaAspecto('oscuro', { setItem() { throw new Error('sin almacén'); }, removeItem() {} }); // no rompe
  const ajustes = {};
  const progress = { settings: () => ajustes, setSetting: (k, v) => { ajustes[k] = v; } };
  const d = docFalso();
  assert.equal(elegirAspecto(progress, 'claro', d), 'claro');
  assert.equal(ajustes.aspecto, 'claro');
  assert.equal(d.attrs['data-theme'], 'light');
  ajustes.aspecto = 'oscuro';
  assert.equal(iniciarAspecto(progress, d), 'oscuro');
  assert.equal(d.attrs['data-theme'], 'dark');
});

test('el script de <head> de index.html hace lo mismo que tema.js (sin parpadeo)', () => {
  const src = INDEX.match(/<script>(\(function[\s\S]*?)<\/script>/)[1];
  for (const aspecto of ['claro', 'oscuro', null, 'raro']) {
    const d = docFalso();
    const sandbox = { localStorage: { getItem: () => aspecto }, document: d };
    vm.runInNewContext(src, sandbox);
    const esperado = docFalso();
    aplicaAspecto(aspecto, esperado);
    assert.equal(d.attrs['data-theme'], esperado.attrs['data-theme'], `data-theme con ${aspecto}`);
    if (temaForzado(aspecto)) assert.deepEqual(d.metas.map((x) => x.m.content), esperado.metas.map((x) => x.m.content));
  }
  // Sin almacenamiento no rompe.
  assert.doesNotThrow(() => vm.runInNewContext(src, { localStorage: { getItem() { throw new Error('no'); } }, document: docFalso() }));
  // El script va antes de la hoja de estilos.
  assert.ok(INDEX.indexOf('nautica.aspecto') < INDEX.indexOf('styles/app.css'));
  // Las metas de index.html llevan los colores de fondo de cada tema.
  assert.match(INDEX, new RegExp(`content="${COLOR_BARRA.claro}" media="\\(prefers-color-scheme: light\\)"`));
  assert.match(INDEX, new RegExp(`content="${COLOR_BARRA.oscuro}" media="\\(prefers-color-scheme: dark\\)"`));
});

test('al arrancar, sin ajuste guardado vale la clave del <head> (no se pierde lo elegido)', () => {
  const claves = { [CLAVE_ASPECTO]: 'oscuro' };
  const storage = { getItem: (k) => claves[k] ?? null, setItem: (k, v) => { claves[k] = v; }, removeItem: (k) => { delete claves[k]; } };
  const d = docFalso();
  assert.equal(iniciarAspecto({ settings: () => ({}) }, d, storage), 'oscuro');
  assert.equal(d.attrs['data-theme'], 'dark');
  assert.equal(claves[CLAVE_ASPECTO], 'oscuro');
  assert.equal(iniciarAspecto({ settings: () => ({ aspecto: 'auto' }) }, d, storage), 'auto');
  assert.equal(claves[CLAVE_ASPECTO], undefined);
});

// ---- el CSS: forzado = automático ----
const decls = (bloque) => Object.fromEntries([...bloque.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const cuerpo = (css, ini) => { const i = css.indexOf(ini); assert.ok(i >= 0, ini); const j = css.indexOf('}', i); return css.slice(i + ini.length, j); };
const CLARO = decls(cuerpo(APP, ':root {'));
const AUTO = decls(cuerpo(APP, '@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {'));
const FORZADO = decls(cuerpo(APP, ':root[data-theme="dark"] {'));

test('el modo oscuro forzado define exactamente lo mismo que el automático (app.css)', () => {
  assert.ok(Object.keys(AUTO).length > 30);
  assert.deepEqual(FORZADO, AUTO);
  // Y todo lo que cambia de día a noche está en los dos sitios.
  for (const k of ['--bg', '--surface', '--text', '--muted', '--accent', '--boton', '--on-boton', '--retic', '--ok', '--warn', '--close', '--campo-borde']) assert.ok(AUTO[k] && CLARO[k], k);
  assert.equal(CLARO['--bg'].toLowerCase(), COLOR_BARRA.claro.toLowerCase());
  assert.equal(AUTO['--bg'].toLowerCase(), COLOR_BARRA.oscuro.toLowerCase());
});

test('no quedan reglas de color que solo funcionen con el tema automático', () => {
  for (const [nombre, css] of [['app.css', APP], ['laminas.css', LAM]]) {
    for (const m of css.matchAll(/@media \(prefers-color-scheme: dark\)\s*\{/g)) {
      const trozo = css.slice(m.index, css.indexOf('\n}\n', m.index));
      const reglas = [...trozo.matchAll(/:root:not\(\[data-theme="light"\]\)/g)].length;
      assert.ok(reglas >= 1, `${nombre}: un @media oscuro sin la guarda de data-theme`);
      // Cada @media oscuro tiene su gemelo [data-theme="dark"] para el modo forzado.
      assert.ok(css.includes(':root[data-theme="dark"]'), `${nombre}: falta el bloque forzado`);
    }
  }
  // La retícula no está en el modo concentración (lectura larga) ni al imprimir.
  assert.match(APP, /body\.focus \{ background-image: none; \}/);
});

// ---- contraste AA calculado ----
const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('contraste AA en los dos temas: texto 4,5:1 y bordes de controles 3:1', () => {
  for (const [modo, P] of [['claro', CLARO], ['oscuro', { ...CLARO, ...AUTO }]]) {
    const c = (a, b) => contraste(P[a], P[b]);
    for (const fondo of ['--bg', '--surface', '--panel', '--accent-2', '--aviso-bg']) {
      for (const tx of ['--text']) assert.ok(c(tx, fondo) >= 4.5, `${modo}: ${tx} sobre ${fondo} = ${c(tx, fondo).toFixed(2)}`);
    }
    for (const fondo of ['--bg', '--surface', '--panel']) {
      for (const tx of ['--muted', '--accent', '--ok', '--warn', '--close']) assert.ok(c(tx, fondo) >= 4.5, `${modo}: ${tx} sobre ${fondo} = ${c(tx, fondo).toFixed(2)}`);
    }
    assert.ok(c('--accent', '--accent-2') >= 4.5, `${modo}: acento sobre su fondo suave`);
    assert.ok(c('--muted', '--accent-2') >= 4.5, `${modo}: texto apagado sobre el fondo suave`);
    assert.ok(c('--on-boton', '--boton') >= 4.5, `${modo}: texto del botón = ${c('--on-boton', '--boton').toFixed(2)}`);
    assert.ok(c('--aviso-texto', '--aviso-bg') >= 4.5, `${modo}: aviso`);
    assert.ok(c('--profe-fg', '--profe-bg') >= 4.5, `${modo}: el profe`);
    assert.ok(c('--campo-texto', '--campo-bg') >= 4.5, `${modo}: texto de las entradas`);
    assert.ok(c('--on-accent', '--accent') >= 4.5, `${modo}: texto sobre el acento`);
    assert.ok(c('--borde-fuerte', '--bg') >= 3 && c('--borde-fuerte', '--surface') >= 3, `${modo}: borde de controles`);
    assert.ok(c('--campo-borde', '--campo-bg') >= 3, `${modo}: borde de las entradas`);
    assert.ok(c('--accent', '--bg') >= 3, `${modo}: foco visible (el contorno es el acento)`);
    // La retícula casi no se ve (nunca resta contraste al texto): con el texto, más de 10:1 también sobre las líneas.
    assert.ok(c('--text', '--retic') >= 10, `${modo}: texto sobre la retícula = ${c('--text', '--retic').toFixed(2)}`);
    assert.ok(c('--muted', '--retic') >= 4.5, `${modo}: texto apagado sobre la retícula`);
  }
});

// ---- letras ----
test('las letras nuevas: OFL, subconjunto y presupuesto de 60 KB para las dos nuevas', () => {
  const kb = (f) => statSync(new URL(`../fonts/${f}`, import.meta.url)).size / 1024;
  assert.ok(kb('patron-titulos.woff2') + kb('patron-mono.woff2') <= 60, 'presupuesto de fuentes nuevas');
  for (const f of ['OFL-BarlowCondensed.txt', 'OFL-IBMPlexMono.txt', 'OFL-SourceSans3.txt']) assert.match(leer(`fonts/${f}`), /SIL OPEN FONT LICENSE Version 1\.1/i);
  assert.match(APP, /font-family: "Patron Mono"; src: url\("\.\.\/fonts\/patron-mono\.woff2"\)/);
  assert.doesNotMatch(APP + LAM, /fonts\.googleapis|fonts\.gstatic/, 'sin Google Fonts');
  assert.match(leer('fonts/README.md'), /Barlow Condensed/);
  assert.match(leer('fonts/README.md'), /IBM Plex Mono/);
});

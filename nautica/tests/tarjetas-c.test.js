// Tarjetas de memoria en estilo C: cada mazo tiene anverso (con texto alternativo y sin la respuesta a la vista) y
// reverso; los dibujos nuevos solo usan --lc-* (claro y oscuro) y su texto no baja de 10,5 px efectivos; el CSS de las
// tarjetas no tiene colores fijos y el volteo solo se anima sin «reducir movimiento». La lógica de repaso no cambia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mazos, sesionMazo, tarjetasPorRepasar, PREFIJO } from '../src/course/tarjetas.js';
import { anversoTarjeta } from '../src/illustrations/tarjetas-c.js';
import { INTERVALOS, ACIERTOS_PARA_SALIR } from '../src/course/repaso.js';
import { createRng } from '../src/math/rng.js';
import { createProgressStore } from '../src/store/progress.js';

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const APP = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');
const VISTA = readFileSync(new URL('../src/ui/views/tarjetas.js', import.meta.url), 'utf8');
const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
const CLARO = vars(bloque(':root {'));
const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));

const todas = () => ['per', 'py'].flatMap((tit) => mazos(tit).flatMap((m) => m.cartas.map((c) => ({ tit, m, c }))));

test('tarjetas C: cada tarjeta de cada mazo tiene anverso con texto alternativo útil y reverso con su respuesta', () => {
  const vistos = new Set();
  for (const { m, c } of todas()) {
    vistos.add(m.id);
    const a = anversoTarjeta(m.id, c);
    assert.ok(a, `${c.clave}: sin anverso`);
    assert.ok(a.svg || a.texto, `${c.clave}: el anverso no dibuja nada`);
    assert.ok(typeof a.alt === 'string' && a.alt.length >= 15, `${c.clave}: texto alternativo pobre «${a.alt}»`);
    if (a.svg) {
      assert.match(a.svg, /^<svg\b[^>]*role="img"/, `${c.clave}: el dibujo no es una imagen accesible`);
      const label = a.svg.match(/aria-label="([^"]*)"/)?.[1] ?? '';
      assert.ok(label.length >= 15 && label !== 'Tarjeta: ¿qué es?', `${c.clave}: aria-label pobre «${label}»`);
    }
    const r = c.reverso;
    assert.ok(r.titulo && (r.respuesta ?? r.titulo).length > 1, `${c.clave}: reverso sin respuesta`);
    for (const k of ['nombre', 'respuesta', 'dato', 'nota']) assert.ok(r[k] == null || (typeof r[k] === 'string' && r[k].trim()), `${c.clave}: ${k} vacío`);
  }
  assert.deepEqual([...vistos].sort(), ['balizamiento', 'banderas', 'beaufort', 'buques', 'douglas', 'fuego', 'gnss', 'socorro', 'sonidos']);
});

test('tarjetas C: el anverso no enseña la respuesta (ni en el dibujo ni en su texto alternativo)', () => {
  const limpio = (t) => t.replace(/<[^>]*>/g, ' ').toLowerCase();
  for (const { m, c } of todas()) {
    const a = anversoTarjeta(m.id, c);
    const visible = limpio(`${a.svg ?? ''} ${a.texto?.grande ?? ''} ${a.texto?.eti ?? ''} ${a.alt}`);
    for (const t of [c.reverso.titulo, c.reverso.respuesta].filter(Boolean)) {
      assert.ok(!visible.includes(t.toLowerCase()), `${c.clave}: el anverso enseña «${t}»`);
    }
    // en los dibujos nuevos, ni siquiera el nombre (en las escalas y siglas el nombre ES el estímulo: «Fuerza 6», «COG»)
    if (a.svg && a.estiloC && c.reverso.nombre) assert.ok(!visible.includes(c.reverso.nombre.toLowerCase()), `${c.clave}: el dibujo enseña «${c.reverso.nombre}»`);
  }
});

test('tarjetas C: los dibujos nuevos solo usan --lc-* (definidas en claro y en oscuro) y su texto no baja de 10,5 px a 360 px', () => {
  const malos = [];
  for (const { m, c } of todas()) {
    const a = anversoTarjeta(m.id, c);
    if (!a.estiloC) continue;
    for (const svg of [a.svg, a.regla].filter(Boolean)) {
      const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
      const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"/);
      assert.ok(!fijo, `${c.clave}: color fijo ${fijo?.[0]}`);
      for (const v of new Set(svg.match(/var\(--lc-[a-z0-9-]+\)/g))) {
        const k = v.slice(6, -1);
        assert.ok(k in CLARO, `${c.clave}: ${v} no está en styles/laminas.css`);
        assert.ok(k in OSCURO || k.startsWith('lc-luz-'), `${c.clave}: ${v} sin versión oscura`);
      }
      const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
      const escala = Math.min(328 / w, 430 / h);
      for (const t of svg.match(/<text\b[^>]*>/g) ?? []) {
        const fs = Number(t.match(/font-size="([\d.]+)"/)?.[1]);
        if (!(fs * escala >= 10.5)) malos.push(`${c.clave}: ${t.slice(0, 80)} → ${(fs * escala).toFixed(1)} px`);
      }
    }
  }
  assert.deepEqual(malos.slice(0, 10), []);
});

test('tarjetas C: los dibujos antiguos que quedan son solo los de buques y señales de peligro (pendientes de migrar)', () => {
  const antiguos = new Set(todas().filter(({ m, c }) => !anversoTarjeta(m.id, c).estiloC).map(({ m }) => m.id));
  assert.deepEqual([...antiguos].sort(), ['buques']);
});

test('tarjetas C: el CSS de las tarjetas no tiene colores fijos y cada variable existe en claro y en oscuro', () => {
  const tc = CSS.slice(CSS.indexOf('/* ---- Tarjetas de memoria'));
  assert.ok(tc.length > 500, 'falta el bloque de las tarjetas en styles/laminas.css');
  assert.ok(!/#[0-9a-f]{3,8}\b|rgba?\(/i.test(tc), 'sin colores fijos en las tarjetas');
  const oscuroApp = APP.slice(APP.indexOf('@media (prefers-color-scheme: dark)'));
  for (const v of new Set(tc.match(/var\(--[a-z0-9-]+/g))) {
    const k = v.slice(4);
    if (k.startsWith('--lc-')) { assert.ok(k.slice(2) in CLARO, `${k} no definida`); continue; }
    if (k.startsWith('--dur-') || k.startsWith('--ease-')) { assert.ok(APP.includes(`${k}:`), `${k} no definida`); continue; }
    assert.ok(APP.includes(`${k}:`), `${k} no definida en app.css`);
    assert.ok(oscuroApp.includes(`${k}:`), `${k} sin versión oscura en app.css`);
  }
  // el volteo solo se anima si el sistema no pide reducir el movimiento
  const anima = [...tc.matchAll(/transition:[^;]*/g)];
  assert.ok(anima.length >= 1);
  assert.match(tc, /@media \(prefers-reduced-motion: no-preference\) \{ \.tc-caras \{ transition:/);
  assert.equal(anima.length, 1, 'ninguna otra transición en las tarjetas');
});

test('tarjetas C: accesibilidad de la sesión (resultado anunciado, volteo con foco, botones de respuesta)', () => {
  assert.match(VISTA, /'aria-live': 'polite'/);
  assert.match(VISTA, /'No la sabía'/);
  assert.match(VISTA, /'La sabía'/);
  assert.match(VISTA, /dorso\.focus\(/, 'al voltear, el foco va a la respuesta');
  assert.match(VISTA, /frente\.inert = true/, 'la cara de atrás no se puede tocar ni la lee el lector');
  assert.match(CSS, /\.tc-sesion \.fila-inferior \.grande \{ min-height: (4[4-9]|5\d)px; \}/, 'botones de respuesta de 44 px o más');
});

// ---------------------------------------------------------------------------
// La lógica de repaso y los datos de progreso no cambian con la nueva apariencia

test('tarjetas C: mismos mazos, mismas claves de progreso y mismos plazos de repaso', () => {
  const n = (tit) => Object.fromEntries(mazos(tit).map((m) => [m.id, m.cartas.length]));
  assert.deepEqual(n('per'), { buques: 32, balizamiento: 12, sonidos: 16, socorro: 18, banderas: 10, beaufort: 13, douglas: 10, fuego: 5 });
  assert.deepEqual(n('py'), { socorro: 18, beaufort: 13, douglas: 10, fuego: 5, gnss: 9 });
  for (const { m, c } of todas()) assert.equal(c.clave, `${PREFIJO}${m.id}:${c.id}`);
  assert.deepEqual(INTERVALOS, [1, 3, 7]);
  assert.equal(ACIERTOS_PARA_SALIR, 3);
  // una fallada vuelve mañana; acertada el día que toca, a los 3 días; luego a los 7; a la tercera sale
  const datos = new Map();
  const p = createProgressStore({ getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) });
  const [mazo] = mazos('per');
  const clave = mazo.cartas[0].clave;
  p.recordExam(clave, { choice: null, ok: false });
  const reg = p.get().exams[clave];
  assert.equal(reg.ok, false);
  assert.equal(reg.rep.racha, 0);
  assert.equal(tarjetasPorRepasar(mazos('per'), p.get().exams, '2099-01-01').map((c) => c.clave).join(), clave);
  // la sesión pone primero las que tocan, como siempre
  const s = sesionMazo(mazo, p.get().exams, createRng(5), { hoy: '2099-01-01' });
  assert.equal(s[0].clave, clave);
  assert.equal(s.length, 10);
});

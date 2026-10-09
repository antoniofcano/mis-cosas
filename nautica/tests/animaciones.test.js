// Láminas animadas (docs/ESTILO-LAMINAS.md, «Animaciones»): la física de cada pista, sus fotogramas y el reproductor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { curvaEvolucion, hombreAlAgua, andarHelice, enInstante, REGLA_HAA, YATE, difAng } from '../src/nautical/maniobra.js';
import { caidaPopa } from '../src/nautical/helice.js';
import { ANIMACIONES, animacionDe } from '../src/illustrations/animaciones/index.js';
import { hitoEn, ritmo, el } from '../src/illustrations/animaciones/pista.js';
import { particula } from '../src/illustrations/animaciones/circulacion.js';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { interactivaDe } from '../src/illustrations/interactivas.js';
import { horaDe, tiempoDe, alturaEn, MAREA_EJEMPLO } from '../src/illustrations/interactivas/marea.js';
import { cambiosCadena, horaNavegada, HITOS_CADENA } from '../src/illustrations/interactivas/cadena.js';
import { controlador } from '../src/ui/lamina-estado.js';
import { idLamina } from '../src/illustrations/catalogo-laminas.js';
import { marcoDe } from '../src/illustrations/marcos.js';
const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (desde) => { const i = CSS.indexOf(desde); return Object.fromEntries([...CSS.slice(i, CSS.indexOf('}', i)).matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])); };
const CLARO = vars(':root {');
const OSCURO = vars(':root:not([data-theme="light"]) {');

const L = YATE.eslora;

// Las láminas animadas sin mandos y las interactivas que se reproducen.
const ANIMADAS = [
  { tipo: 'evolucion' },
  ...['boutakow', 'anderson', 'scharnow'].map((maniobra) => ({ tipo: 'hombre-al-agua', maniobra })),
  ...['dextrogira', 'levogira'].flatMap((sentido) => ['avante', 'atras'].map((marcha) => ({ tipo: 'helice', sentido, marcha }))),
  { tipo: 'meteo', sistema: 'borrasca' }, { tipo: 'meteo', sistema: 'anticiclon' },
];
const INTERACTIVAS_ANIMADAS = [
  ...['curva', 'duodecimos', 'sonda'].map((modo) => ({ tipo: 'marea', modo })),
  { tipo: 'corriente', caso: 'efectivo' }, { tipo: 'corriente', caso: 'rumbo-a-dar' }, { tipo: 'corriente', caso: 'efectivo', ic: 0 },
  { tipo: 'abatimiento', banda: 'babor' }, { tipo: 'abatimiento', banda: 'estribor', ab: 0 },
];

/** La pista de cualquier spec animada (con mandos: la del estado inicial). */
function pistaDe(spec) {
  const def = interactivaDe(spec);
  if (def?.animacion) { const e = def.estado(spec); return def.animacion.pista(e, def.calcular(e)); }
  return animacionDe(spec).pista();
}
/** El SVG de una spec en el instante t. */
function svgEn(spec, t) {
  const def = interactivaDe(spec);
  if (def?.animacion) { const v = controlador(def, spec, 'galeria').vista({ t }); return v.svg ?? v.vistas.map((x) => x.svg).join(''); }
  return animacionDe(spec).pista().svg(t);
}
const instantes = (p) => [0, ...p.hitos.map((h) => h.t), p.duracion / 3, p.duracion / 2, p.duracion];

test('animaciones: las specs siguen siendo válidas, con su marco, y sus ids de la galería no cambian', () => {
  for (const s of [...ANIMADAS, ...INTERACTIVAS_ANIMADAS]) {
    assert.ok(validSpec(s), JSON.stringify(s));
    assert.ok(marcoDe(s)?.alt.length >= 60, `${JSON.stringify(s)}: marco con texto alternativo`);
  }
  assert.equal(idLamina({ tipo: 'marea', modo: 'curva' }), 'marea-rpre3o');
  assert.equal(idLamina({ tipo: 'evolucion' }), 'evolucion-ild7ez');
  assert.equal(idLamina({ tipo: 'hombre-al-agua', maniobra: 'boutakow' }), 'hombre-al-agua-8rk7in');
  // una maniobra desconocida se dibuja como Boutakow, como antes se dibujaba algo
  assert.ok(validSpec({ tipo: 'hombre-al-agua', maniobra: 'otra' }));
  assert.ok(Object.keys(ANIMACIONES).length >= 4);
});

test('animaciones: cada pista tiene hitos con nombre, ordenados, el primero en 0, y cambios sin NaN en todo instante', () => {
  for (const s of [...ANIMADAS, ...INTERACTIVAS_ANIMADAS]) {
    const p = pistaDe(s);
    assert.ok(p.duracion > 3 && p.duracion < 30, `${JSON.stringify(s)}: duración ${p.duracion}`);
    assert.equal(p.hitos[0].t, 0);
    assert.ok(p.hitos.length >= 3 && p.hitos.length <= 8);
    for (let i = 1; i < p.hitos.length; i++) assert.ok(p.hitos[i].t > p.hitos[i - 1].t && p.hitos[i].t <= p.duracion, `${JSON.stringify(s)}: hitos en orden`);
    for (const h of p.hitos) assert.ok(h.nombre.length > 3 && /[.!?]$/.test(h.texto), `${JSON.stringify(s)}: «${h.nombre}» con su frase`);
    for (let t = 0; t <= p.duracion + 1e-9; t += p.duracion / 40) {
      const c = p.cambios(t);
      assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(c)), `${JSON.stringify(s)} t=${t}: ${JSON.stringify(c).slice(0, 200)}`);
    }
    assert.ok(p.tFijo >= 0 && p.tFijo <= p.duracion);
  }
});

test('animaciones: los fotogramas (inicio, hitos y final) cumplen el estilo C: texto mínimo, solo --lc-*, sin NaN y con data-ani para todo lo que cambia', () => {
  for (const s of [...ANIMADAS, ...INTERACTIVAS_ANIMADAS]) {
    const p = pistaDe(s);
    for (const t of instantes(p)) {
      const todo = svgEn(s, t);
      assert.ok(!/NaN|undefined|Infinity/.test(todo), `${JSON.stringify(s)} t=${t}`);
      for (const svg of todo.split(/(?=<svg\b)/).filter((x) => x.startsWith('<svg'))) {
        const [w, hh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
        const escala = Math.min(328 / w, 430 / hh);
        for (const tx of svg.match(/<text\b[^>]*>/g) ?? []) {
          const fs = Number(tx.match(/font-size="([\d.]+)"/)?.[1]);
          assert.ok(fs * escala >= 10.5, `${JSON.stringify(s)} t=${t}: ${tx.slice(0, 80)} → ${(fs * escala).toFixed(1)} px`);
        }
        const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
        const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"/);
        assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]}`);
        for (const v of new Set(svg.match(/var\(--lc-[a-z0-9-]+\)/g))) {
          const k = v.slice(6, -1);
          if (k !== 'lc-url') assert.ok(k in CLARO && (k in OSCURO || k.startsWith('lc-luz-')), `${v} en claro y oscuro`);
        }
        assert.ok((svg.match(/aria-label="([^"]*)"/)?.[1] ?? '').length >= 40, `${JSON.stringify(s)}: aria-label`);
      }
      // todo lo que cambia está dibujado con su data-ani (el reproductor no rehace el SVG)
      for (const k of Object.keys(p.cambios(t))) assert.ok(todo.includes(`data-ani="${k}"`), `${JSON.stringify(s)}: falta data-ani="${k}"`);
    }
  }
});

test('animaciones: la imagen fija (galería, miniatura) es un fotograma con significado, con todos sus rótulos', () => {
  for (const s of ANIMADAS) {
    const p = pistaDe(s);
    const fija = renderIllustration(s).svg;
    assert.equal(fija, p.svg(p.tFijo));
    // en la imagen fija se ven todas las cotas y rótulos (los que aparecen en su hito tienen opacidad 1)
    const c = p.cambios(p.tFijo);
    for (const [k, v] of Object.entries(c)) if (/^(c-|cota|fin|cruce|centro|flecha|cartela)/.test(k)) assert.equal(String(v.opacity ?? 1), '1', `${JSON.stringify(s)}: ${k} visible`);
  }
});

test('pista: el elemento animado, los hitos y el ritmo por tramos', () => {
  assert.equal(el('b', 'circle', { r: 3 }, { b: { cx: '10' } }), '<circle data-ani="b" r="3" cx="10"></circle>');
  assert.equal(el('t', 'text', { x: 0 }, { t: { texto: 'hola' } }), '<text data-ani="t" x="0">hola</text>');
  const hs = [{ t: 0 }, { t: 2 }, { t: 5 }];
  assert.deepEqual([0, 1.9, 2, 4.99, 5, 9].map((t) => hitoEn(hs, t)), [0, 0, 1, 1, 2, 2]);
  const r = ritmo([[0, 0], [10, 2], [50, 6]]);
  assert.equal(r.duracion, 6);
  assert.equal(r.real(1), 5);
  assert.equal(r.real(4), 30);
  assert.equal(r.rep(30), 4);
  for (const t of [0, 0.7, 2, 3.3, 6]) assert.ok(Math.abs(r.rep(r.real(t)) - t) < 1e-9);
});

// ---------------------------------------------------------------------------
// Física

test('curva de evolución: avance, traslado y diámetros coherentes, y la popa abre hacia fuera', () => {
  const c = curvaEvolucion();
  const esl = (v) => v / L;
  // proporciones de un yate: diámetro final ≈ 2 radios de régimen (3 esloras), táctico algo mayor que el final
  assert.ok(Math.abs(esl(c.diametroFinal) - 2 * YATE.radio) < 0.15, `diámetro final ${esl(c.diametroFinal)}`);
  assert.ok(c.diametroTactico > c.diametroFinal, 'el táctico es mayor que el final');
  assert.ok(esl(c.diametroTactico) < 4, 'y no exagerado');
  assert.ok(c.traslado < c.diametroTactico / 2, 'traslado < medio diámetro táctico');
  assert.ok(c.avance > c.diametroFinal / 2 && c.avance < c.diametroTactico, `avance ${esl(c.avance)}`);
  // desplazamiento lateral inicial hacia la banda contraria: pequeño pero real
  assert.ok(c.kick > 0.02 * L && c.kick < 0.2 * L, `kick ${esl(c.kick)}`);
  assert.ok(c.t90 < c.t180 && c.t180 < c.t360);
  // la popa sale hacia babor (x < 0) al meter el timón a estribor
  const q = enInstante(c.muestras, c.t0 + 4);
  const popaX = q.x - Math.sin((q.rumbo * Math.PI) / 180) * (L / 2);
  assert.ok(popaX < -0.1 * L, `popa ${esl(popaX)}`);
  // a babor, simétrica
  const b = curvaEvolucion({ banda: 'babor' });
  assert.ok(Math.abs(b.diametroTactico - c.diametroTactico) < 0.01);
  // continuidad: entre muestras no hay saltos (0,02 s a 3 m/s → < 7 cm)
  for (let i = 1; i < c.muestras.length; i++) assert.ok(Math.hypot(c.muestras[i].x - c.muestras[i - 1].x, c.muestras[i].y - c.muestras[i - 1].y) < 0.08);
});

test('Boutakow: cambio a 60°, termina al rumbo opuesto sobre su estela y recoge a la persona', () => {
  const h = hombreAlAgua('boutakow');
  const M = h.momentos;
  assert.ok(M.cambio < M.via && M.via < M.opuesto && M.opuesto < M.recogida);
  const qc = enInstante(h.muestras, M.cambio);
  assert.ok(Math.abs(qc.rumbo - REGLA_HAA.boutakow) < 1, `cambio a ${qc.rumbo}°`);
  const qv = enInstante(h.muestras, M.via);
  assert.ok(Math.abs(difAng(qv.rumbo, 180) + REGLA_HAA.antes) < 2 || Math.abs(difAng(qv.rumbo, 180)) - REGLA_HAA.antes < 2, `a la vía a ${qv.rumbo}°`);
  // al rumbo opuesto y sobre la derrota inicial (x = 0): a menos de media eslora
  const qo = enInstante(h.muestras, M.opuesto);
  assert.ok(Math.abs(difAng(qo.rumbo, 180)) < 2, `rumbo ${qo.rumbo}`);
  assert.ok(Math.abs(qo.x) < 0.5 * L, `separado ${qo.x / L} esloras de su estela`);
  assert.ok(qo.y > 2 * L, 'vuelve por delante del punto de caída');
  // todo el regreso, sobre la estela; y acaba junto a la persona, despacio
  for (const q of h.muestras.filter((m) => m.t >= M.opuesto)) assert.ok(Math.abs(q.x) < 0.5 * L);
  const f = h.muestras[h.muestras.length - 1];
  assert.ok(Math.hypot(f.x - h.mob[0], f.y - h.mob[1]) < 0.5 * L, 'junto a la persona');
  assert.ok(f.v < 1.2, 'con poca arrancada');
  // la primera caída es a la banda de la persona (estribor): la popa se aparta de ella
  assert.ok(h.mob[0] > 0 && enInstante(h.muestras, 3).timon > 0.9);
});

test('Scharnow vuelve a la derrota al rumbo opuesto, más atrás que Boutakow; Anderson da una vuelta de unos 250° y llega a la persona', () => {
  const s = hombreAlAgua('scharnow');
  const qo = enInstante(s.muestras, s.momentos.opuesto);
  assert.ok(Math.abs(enInstante(s.muestras, s.momentos.cambio).rumbo - REGLA_HAA.scharnow) < 1);
  assert.ok(Math.abs(difAng(qo.rumbo, 180)) < 2 && Math.abs(qo.x) < 0.5 * L);
  const b = hombreAlAgua('boutakow');
  assert.ok(qo.y < enInstante(b.muestras, b.momentos.opuesto).y, 'Scharnow entra en la derrota más atrás');
  const fs = s.muestras[s.muestras.length - 1];
  assert.ok(Math.hypot(fs.x - s.mob[0], fs.y - s.mob[1]) < 0.5 * L);
  const a = hombreAlAgua('anderson');
  assert.ok(Math.abs(enInstante(a.muestras, a.momentos.via).rumbo - REGLA_HAA.anderson) < 1);
  const fa = a.muestras[a.muestras.length - 1];
  assert.ok(Math.hypot(fa.x - a.mob[0], fa.y - a.mob[1]) < 0.5 * L, 'Anderson llega a la persona');
  assert.ok(a.momentos.recogida < b.momentos.recogida, 'Anderson es la más rápida');
  // sin NaN y sin saltos
  for (const h of [a, b, s]) for (let i = 1; i < h.muestras.length; i++) assert.ok(Math.hypot(h.muestras[i].x - h.muestras[i - 1].x, h.muestras[i].y - h.muestras[i - 1].y) < 0.08);
});

test('hélice: la popa cae a la banda de la regla, y dando atrás mucho más que avante', () => {
  for (const sentido of ['dextrogira', 'levogira']) {
    const caida = {};
    for (const marcha of ['avante', 'atras']) {
      const { popa } = caidaPopa({ marcha, sentido, timon: 'via' });
      const f = andarHelice({ marcha, popa }).at(-1);
      // popa a babor → proa a estribor → el rumbo crece
      assert.equal(Math.sign(f.rumbo), popa === 'babor' ? 1 : -1, `${sentido} ${marcha}`);
      assert.equal(Math.sign(f.y), marcha === 'atras' ? -1 : 1, 'avanza o retrocede');
      caida[marcha] = Math.abs(f.rumbo);
      const p = pistaDe({ tipo: 'helice', sentido, marcha });
      assert.match(p.hitos[1].nombre, new RegExp(`popa cae a ${popa}`));
    }
    assert.ok(caida.atras > 3 * caida.avante, `atrás ${caida.atras}°, avante ${caida.avante}°`);
  }
});

test('circulación: en la borrasca el aire entra girando al revés que el reloj; en el anticiclón sale girando como el reloj', () => {
  const CX = 179;
  const CY = 172;
  for (const B of [true, false]) {
    for (let i = 0; i < 16; i += 5) {
      const a = particula(B, i, 1);
      const b = particula(B, i, 1.3);
      if (b.vida < a.vida) continue; // la vuelta a empezar
      const r = (p) => Math.hypot((p[0] - CX) / 1.32, p[1] - CY);
      assert.ok(B ? r(b.p) < r(a.p) : r(b.p) > r(a.p), 'converge o diverge');
      // producto vectorial (con y hacia abajo): negativo = antihorario a la vista
      const [ax, ay] = [a.p[0] - CX, a.p[1] - CY];
      const [bx, by] = [b.p[0] - CX, b.p[1] - CY];
      assert.ok(B ? ax * by - ay * bx < 0 : ax * by - ay * bx > 0, B ? 'antihorario' : 'horario');
    }
  }
});

test('marea animada: el tiempo es la hora; a la mitad, la mitad de la amplitud; el corte sigue a la curva', () => {
  const { bm, pm } = MAREA_EJEMPLO;
  assert.equal(horaDe(0), bm.hora);
  assert.equal(horaDe(12), pm.hora);
  assert.equal(tiempoDe(horaDe(5.5)), 5.5);
  assert.ok(Math.abs(alturaEn(horaDe(6)) - (bm.h + pm.h) / 2) < 1e-9);
  const p = pistaDe({ tipo: 'marea', modo: 'sonda' });
  assert.equal(p.hitos.length, 7);
  assert.equal(p.valor(p.hitos[3].t), bm.hora + 180);
  // el agua del corte sube de forma monótona, y con ella el barco
  let prev = Infinity;
  for (let t = 0; t <= 12; t += 0.5) {
    const y = Number(p.cambios(t)['c-agua'].y);
    assert.ok(y <= prev + 1e-9);
    prev = y;
  }
  // el mando y la animación van a la par
  const def = interactivaDe({ tipo: 'marea', modo: 'curva' });
  assert.equal(def.animacion.mando, 'hora');
});

test('corriente y abatimiento animados: el barco avanza a velocidad constante y acaba en el extremo del efectivo', () => {
  const def = interactivaDe({ tipo: 'corriente', caso: 'efectivo' });
  const e = def.estado({ tipo: 'corriente', caso: 'efectivo' });
  const r = def.calcular(e);
  assert.equal(horaNavegada(0), 0);
  assert.equal(horaNavegada(HITOS_CADENA.hora), 1);
  assert.ok(Math.abs(horaNavegada(HITOS_CADENA.media) - 0.5) < 1e-9);
  const pos = (t) => cambiosCadena(r, t)['a-barco'].transform.match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
  const [o, m, f] = [pos(0), pos(HITOS_CADENA.media), pos(HITOS_CADENA.hora)];
  // a media hora está a medio camino (velocidad constante) y la proa no apunta por donde va (va de lado)
  assert.ok(Math.abs(m[0] - (o[0] + f[0]) / 2) < 0.15 && Math.abs(m[1] - (o[1] + f[1]) / 2) < 0.15);
  const rumboTraza = (Math.atan2(f[0] - o[0], -(f[1] - o[1])) * 180) / Math.PI;
  assert.ok(Math.abs(difAng(rumboTraza, r.ref)) < 1.5, `traza ${rumboTraza} = Ref ${r.ref}`);
  assert.ok(Math.abs(difAng(r.rv, r.ref)) > 5);
  // al final aparece la construcción de la carta y se va lo que se movía
  const cf = cambiosCadena(r, 10);
  assert.equal(cf.fin.opacity, '1');
  assert.equal(cf.mov.opacity, '0');
});

// ---------------------------------------------------------------------------
// Reproductor (src/ui/animacion.js) con un DOM mínimo

function domFalso() {
  class Nodo {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = new Map(); this.children = []; this.parent = null; this.listeners = {}; this._text = ''; this.hidden = false; this.disabled = false; this.title = ''; this.value = ''; this.style = {};
      const yo = this;
      this.classList = { s: new Set(), add(...c) { c.forEach((x) => this.s.add(x)); }, toggle(c, v) { if (v ?? !this.s.has(c)) this.s.add(c); else this.s.delete(c); }, contains(c) { return this.s.has(c); } };
      this.dataset = new Proxy({}, { get: (_, k) => yo.attrs.get(`data-${String(k).replace(/[A-Z]/g, (x) => `-${x.toLowerCase()}`)}`), set: (_, k, v) => { yo.attrs.set(`data-${String(k)}`, String(v)); return true; } });
    }
    set className(v) { this.classList.s = new Set(String(v).split(/\s+/).filter(Boolean)); }
    get className() { return [...this.classList.s].join(' '); }
    setAttribute(k, v) { this.attrs.set(k, String(v)); if (k === 'value') this.value = String(v); }
    getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
    addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
    removeEventListener() {}
    dispara(t, ev = {}) { for (const f of this.listeners[t] ?? []) f({ target: this, ...ev }); }
    append(...cs) { for (const c of cs) { const n = typeof c === 'string' ? Object.assign(new Nodo('#text'), { _text: c }) : c; n.parent = this; this.children.push(n); } }
    after(n) { const p = this.parent; n.parent = p; p.children.splice(p.children.indexOf(this) + 1, 0, n); }
    replaceChildren(...cs) { this.children = []; this.append(...cs); }
    set innerHTML(v) { this._html = v; }
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    get isConnected() { let n = this; while (n.parent) n = n.parent; return n === documento.body; }
    todos() { return this.children.flatMap((c) => [c, ...c.todos()]); }
    querySelectorAll(sel) { const k = sel.match(/^\[([a-z-]+)\]$/)[1]; return this.todos().filter((n) => n.attrs.has(k)); }
  }
  const documento = { createElement: (t) => new Nodo(t), createTextNode: (t) => Object.assign(new Nodo('#text'), { _text: t }), hidden: false, addEventListener() {}, removeEventListener() {} };
  documento.body = new Nodo('body');
  return { documento, Nodo };
}

async function montaReproductor({ reducido = false, autoplay = true, conIO = false } = {}) {
  const { documento, Nodo } = domFalso();
  globalThis.document = documento;
  globalThis.Node = Nodo;
  globalThis.matchMedia = (q) => ({ matches: reducido && /reduce/.test(q) });
  let observado = null;
  if (conIO) globalThis.IntersectionObserver = class { constructor(f) { observado = f; } observe() {} disconnect() {} };
  else delete globalThis.IntersectionObserver;
  const fotogramas = [];
  globalThis.requestAnimationFrame = (f) => { fotogramas.push(f); return fotogramas.length; };
  globalThis.cancelAnimationFrame = () => {};
  const { reproductor } = await import('../src/ui/animacion.js');
  const p = animacionDe({ tipo: 'evolucion' }).pista();
  // el dibujo: un nodo por cada clave animada
  const dibujo = new Nodo('div');
  documento.body.append(dibujo);
  for (const k of Object.keys(p.cambios(0))) { const n = new Nodo('g'); n.setAttribute('data-ani', k); dibujo.append(n); }
  const r = reproductor(dibujo, p, { autoplay, tInicial: reducido ? p.tFijo : 0 });
  documento.body.append(r.el);
  return { r, p, dibujo, fotogramas, ve: (v) => observado?.([{ isIntersecting: v }]) };
}

const botones = (n) => n.todos().filter((x) => x.tagName === 'BUTTON');

test('reproductor: controles accesibles (nombres, aria-pressed, deslizador con aria-valuetext, aviso del paso)', async () => {
  const { r, p } = await montaReproductor({ autoplay: false });
  const bs = botones(r.el);
  assert.deepEqual(bs.slice(0, 3).map((b) => b.getAttribute('aria-label')), ['Paso anterior', 'Reproducir', 'Paso siguiente']);
  assert.deepEqual(bs.slice(3).map((b) => b.textContent), ['0,5×', '1×', '2×']);
  assert.deepEqual(bs.slice(3).map((b) => b.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.equal(r.el.getAttribute('role'), 'group');
  const slider = r.el.todos().find((x) => x.tagName === 'INPUT');
  assert.equal(slider.getAttribute('type'), 'range');
  assert.ok(slider.getAttribute('aria-label'));
  assert.match(slider.getAttribute('aria-valuetext'), /^Paso 1 de 6: Rumbo inicial, a los 0 s$/);
  const aviso = r.el.todos().find((x) => x.getAttribute('aria-live') === 'polite');
  assert.match(aviso.textContent, /1\/6 Rumbo inicial/);
  // siguiente: salta al hito 2, para y lo anuncia
  bs[2].dispara('click');
  assert.equal(r.t, p.hitos[1].t);
  assert.match(aviso.textContent, /2\/6 Todo el timón a estribor/);
  assert.match(slider.getAttribute('aria-valuetext'), /Paso 2 de 6/);
  bs[2].dispara('click');
  bs[0].dispara('click');
  assert.equal(r.t, p.hitos[1].t, 'anterior vuelve al paso 2');
  // el deslizador lleva a cualquier instante y aplica sus atributos
  slider.dispara('input', { target: { value: String(p.hitos[3].t + 0.1) } });
  assert.match(aviso.textContent, /4\/6 90°/);
  assert.equal(r.reproduciendo, false);
  // velocidad
  bs[5].dispara('click');
  assert.deepEqual(bs.slice(3).map((b) => b.getAttribute('aria-pressed')), ['false', 'false', 'true']);
  // los atributos que cambian se escriben en sus nodos
  const barco = r.el.parent.todos().find((x) => x.getAttribute('data-ani') === 'barco');
  assert.match(barco.getAttribute('transform'), /^translate\(/);
  // botones de 44 px como mínimo (CSS)
  const css = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
  assert.match(css, /\.ani-ctl button\.ani-boton \{[^}]*min-width: 44px; min-height: 44px/);
  assert.match(css, /\.ani-ctl button\.ani-vel \{[^}]*min-width: 44px; min-height: 44px/);
  assert.match(css, /\.ani-tiempo \{[^}]*height: 44px/);
});

test('reproductor: con «reducir movimiento» no arranca solo y enseña el último fotograma con su paso', async () => {
  const { r, p, fotogramas } = await montaReproductor({ reducido: true });
  assert.equal(r.reproduciendo, false);
  assert.equal(r.t, p.tFijo);
  assert.equal(fotogramas.length, 0, 'ningún fotograma pedido');
  assert.equal(r.el.dataset.estado, 'fin');
  assert.match(r.el.todos().find((x) => x.getAttribute('aria-live')).textContent, /6\/6/);
  // pero se puede reproducir a mano
  r.reproducir();
  assert.equal(r.reproduciendo, true);
  assert.equal(r.t, 0);
});

test('reproductor: arranca solo al verse, se para fuera de la pantalla y sigue al volver; al final se para', async () => {
  const { r, p, fotogramas, ve } = await montaReproductor({ conIO: true });
  assert.equal(r.el.dataset.estado, 'en-espera', 'no arranca hasta que se ve');
  assert.equal(fotogramas.length, 0);
  ve(true);
  assert.equal(r.reproduciendo, true);
  assert.equal(fotogramas.length, 1);
  fotogramas.shift()(1000);
  fotogramas.shift()(1050);
  assert.ok(Math.abs(r.t - 0.05) < 1e-9, `t = ${r.t}`);
  ve(false);
  assert.equal(r.reproduciendo, false);
  assert.equal(r.el.dataset.estado, 'en-espera');
  const n = fotogramas.length;
  fotogramas.splice(0).forEach((f) => f(1100)); // el fotograma pendiente ya no avanza
  assert.ok(Math.abs(r.t - 0.05) < 1e-9);
  assert.ok(fotogramas.length <= n - 1 || fotogramas.length === 0);
  ve(true);
  assert.equal(r.reproduciendo, true);
  // pausa a mano: no vuelve a arrancar aunque se vea
  r.pausar();
  ve(false);
  ve(true);
  assert.equal(r.reproduciendo, false);
  // reproducir hasta el final: se para en el último fotograma
  r.ir(p.duracion - 0.01);
  r.reproducir();
  let ts = 2000;
  while (fotogramas.length) fotogramas.shift()((ts += 50));
  assert.equal(r.t, p.duracion);
  assert.equal(r.el.dataset.estado, 'fin');
  assert.equal(botones(r.el)[1].getAttribute('aria-label'), 'Volver a reproducir');
});

test('reproductor: una pista en bucle vuelve a empezar', async () => {
  const { r, p, fotogramas } = await montaReproductor();
  r.cargar({ ...p, bucle: true }, p.duracion - 0.02);
  r.reproducir();
  fotogramas.shift()(1000);
  fotogramas.shift()(1050);
  assert.ok(r.t < 0.1, `t = ${r.t}`);
  assert.equal(r.reproduciendo, true);
});

test('animaciones: sin emojis ni colores fijos en el código del reproductor y de las pistas', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  for (const f of ['../src/ui/animacion.js', '../src/illustrations/animaciones/pista.js', '../src/illustrations/animaciones/evolucion.js', '../src/illustrations/animaciones/hombre-al-agua.js', '../src/illustrations/animaciones/helice.js', '../src/illustrations/animaciones/circulacion.js']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(!PICTO.test(src), f);
    assert.ok(!/#[0-9a-f]{3,6}\b/i.test(src.replace(/^\s*\/\/.*$/gm, '')), `${f}: color fijo`);
  }
});

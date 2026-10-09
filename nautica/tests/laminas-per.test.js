// Láminas del PER en estilo C (docs/ESTILO-LAMINAS.md): ritmos, regiones, amarras, riesgo de abordaje, jerarquía, DST,
// luces y marcas de los 32 tipos de buque (lámina y tarjeta), ciaboga y desatraque (animadas). Mismas comprobaciones que
// las láminas piloto de tests/laminas-estilo.test.js (texto mínimo, colores, marco, claro y oscuro) y, además, la física
// de las dos maniobras y los hechos del RIPA que dibujan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { marcoDe } from '../src/illustrations/marcos.js';
import { interactivaDe } from '../src/illustrations/interactivas.js';
import { controlador } from '../src/ui/lamina-estado.js';
import { idLamina, catalogoLaminas, LAMINAS } from '../src/illustrations/catalogo-laminas.js';
import { animacionDe } from '../src/illustrations/animaciones/index.js';
import { SHIPS } from '../src/illustrations/ships.js';
import { lucesVista } from '../src/illustrations/buques-c.js';
import { casoRiesgo, familiaRitmo, cifrasRitmo } from '../src/illustrations/per-c.js';
import { ciaboga, desatraqueMovimiento } from '../src/nautical/maniobra-puerto.js';
import { curvaEvolucion, enInstante, puntoCasco, YATE } from '../src/nautical/maniobra.js';
import { desatraque as calcDesatraque } from '../src/nautical/desatraque.js';
import { mazos } from '../src/course/tarjetas.js';
import { anversoTarjeta } from '../src/illustrations/tarjetas-c.js';
import { PER } from '../src/theory/blocks.js';

// Los mismos tokens que lee tests/laminas-estilo.test.js (styles/laminas.css, claro y oscuro).
const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (desde) => { const i = CSS.indexOf(desde); return Object.fromEntries([...CSS.slice(i, CSS.indexOf('}', i)).matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])); };
const CLARO = vars(':root {');
const OSCURO = vars(':root:not([data-theme="light"]) {');
const L = YATE.eslora;

const RITMOS = ['Fl(2) 5s', 'Q', 'Iso 4s', 'Oc 6s', 'LFl 10s', 'Mo(A) 6s', 'Q(6)+LFl 15s', 'VQ(6)+LFl 10s', 'Q(3) 10s', 'Q(9) 15s', 'Fl(3) 10s', 'Oc(3) 10s', 'Oc(2) 10s',
  'Oc 5s', 'Fl 5s', 'F W', 'Al.Bu/Y 3s', 'Fl(2+1) R 10s', 'Fl R 4s', 'Fl Y 5s'];
const DESATRAQUES = ['calma', 'tierra', 'mar'].flatMap((viento) => ['proa', 'popa'].flatMap((esprin) => ['avante', 'atras'].map((maquina) => ({ tipo: 'desatraque', viento, esprin, maquina }))));

/** Láminas del PER rehechas en esta tanda, con sus variantes. */
export const PILOTO_PER = [
  ...RITMOS.map((ritmo) => ({ tipo: 'ritmo', ritmo })), { tipo: 'ritmo', ritmo: 'Iso 4s', texto: 'Isofase: 2 s de luz y 2 s de oscuridad.' },
  { tipo: 'regiones' }, { tipo: 'amarras' }, ...['largo-proa', 'esprin-proa', 'traves', 'esprin-popa', 'largo-popa'].map((resaltar) => ({ tipo: 'amarras', resaltar })),
  ...['comparar', 'constante', 'variable'].map((caso) => ({ tipo: 'riesgo', caso })), { tipo: 'jerarquia' }, { tipo: 'dst' },
  ...Object.keys(SHIPS).map((clase) => ({ tipo: 'buque', clase, vista: 'todas', dia: true })),
  ...['proa', 'babor', 'estribor', 'popa'].map((vista) => ({ tipo: 'buque', clase: 'motor-50', vista })), { tipo: 'buque', clase: 'fondeado', vista: 'proa', dia: true },
  { tipo: 'buque', clase: 'restringido', vista: 'proa', arrancada: false }, { tipo: 'buque', clase: 'vela-tricolor', vista: 'todas' },
  ...['draga', 'pesquero-aparejo'].flatMap((clase) => ['babor', 'estribor'].map((b) => ({ tipo: 'buque', clase, vista: 'todas', dia: true, obstruccion: b, aparejo: b, arrancada: false }))),
  { tipo: 'ciaboga' }, { tipo: 'desatraque', abrir: 'popa' }, { tipo: 'desatraque', abrir: 'proa' }, ...DESATRAQUES,
];

function svgsDe(spec) {
  const out = [renderIllustration(spec).svg];
  const def = interactivaDe(spec);
  if (def) {
    const v = controlador(def, spec, 'clase').vista();
    out.push(v.svg ?? v.vistas.map((x) => x.svg).join(''));
  }
  return out.flatMap((s) => s.split(/(?=<svg\b)/)).filter((s) => s.startsWith('<svg'));
}
const textoMinimo = (svg) => {
  const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
  const escala = Math.min(328 / w, 430 / h);
  return (svg.match(/<text\b[^>]*>/g) ?? []).map((t) => ({ t, px: Number(t.match(/font-size="([\d.]+)"/)?.[1]) * escala })).filter((x) => !(x.px >= 10.5));
};
const colorFijo = (svg) => svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)').match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"|(?:fill|stroke):\s*(?!var\(--lc-)[#a-z]/);
const variablesBien = (svg) => [...new Set(svg.match(/var\(--[a-z0-9-]+\)/g) ?? [])].map((v) => v.slice(6, -1)).filter((k) => k !== 'lc-url' && !(k in CLARO && (k in OSCURO || k.startsWith('lc-luz-'))));

test('PER en estilo C: se dibujan, siguen siendo specs válidas y sus ids de la galería no cambian', () => {
  for (const s of PILOTO_PER) {
    assert.ok(validSpec(s), JSON.stringify(s));
    for (const svg of svgsDe(s)) assert.ok(!/NaN|undefined|Infinity|null/.test(svg) && / class="il lc/.test(svg), `${JSON.stringify(s)}: estilo C sin NaN`);
  }
  assert.equal(idLamina({ tipo: 'ritmo', ritmo: 'Q' }), 'ritmo-peeemt');
  assert.equal(idLamina({ tipo: 'buque', clase: 'motor', vista: 'todas', dia: true }), 'buque-b1rps1');
  assert.equal(idLamina({ tipo: 'ciaboga' }), 'ciaboga-1qtf0ed');
  assert.equal(idLamina({ tipo: 'desatraque', abrir: 'popa' }), 'desatraque-iu4ugl');
  assert.equal(idLamina({ tipo: 'riesgo', caso: 'comparar' }), 'riesgo-1w8nbbi');
  assert.equal(idLamina({ tipo: 'amarras' }), 'amarras-5s8yqi');
  // lo que antes no se dibujaba sigue sin dibujarse
  assert.equal(validSpec({ tipo: 'buque', clase: 'inventado' }), false);
  assert.equal(validSpec({ tipo: 'riesgo', caso: 'otro' }), false);
});

test('PER en estilo C: ningún texto baja de 10,5 px a 360 px; solo colores --lc-* definidos en claro y en oscuro', () => {
  const malos = [];
  for (const s of PILOTO_PER) for (const svg of svgsDe(s)) {
    for (const x of textoMinimo(svg)) malos.push(`${JSON.stringify(s)}: ${x.t.slice(0, 80)} → ${x.px.toFixed(1)} px`);
    const fijo = colorFijo(svg);
    assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]}`);
    assert.deepEqual(variablesBien(svg), [], `${JSON.stringify(s)}: variables sin definir`);
  }
  assert.deepEqual(malos.slice(0, 10), []);
});

test('PER en estilo C: marco completo, títulos únicos y nombre accesible en el SVG', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  const titulos = new Map();
  for (const s of PILOTO_PER) {
    const m = marcoDe(s);
    assert.ok(m, `${JSON.stringify(s)} sin marco`);
    for (const k of ['tema', 'titulo', 'clave', 'nota', 'alt']) assert.ok(typeof m[k] === 'string' && m[k].trim().length > 2, `${JSON.stringify(s)}: falta ${k}`);
    assert.ok(m.alt.length >= 60, `${JSON.stringify(s)}: texto alternativo pobre`);
    assert.ok(m.datos?.length >= 1 && m.datos.length <= 3 && m.datos.every((d) => d.cifra && d.texto), `${JSON.stringify(s)}: datos`);
    assert.ok(!/ · |undefined|NaN/.test(m.titulo) && /[.!?]$/.test(m.clave), `${JSON.stringify(s)}: «${m.titulo}» / «${m.clave}»`);
    assert.ok(![m.titulo, m.clave, m.nota, m.alt, ...m.datos.flatMap((d) => [d.cifra, d.texto])].some((t) => PICTO.test(t) || /undefined|NaN/.test(t)), JSON.stringify(s));
    for (const svg of svgsDe(s)) assert.ok((svg.match(/aria-label="([^"]*)"/)?.[1] ?? '').length >= 40, `${JSON.stringify(s)}: aria-label pobre`);
    const id = idLamina(s);
    assert.ok(!titulos.has(m.titulo) || titulos.get(m.titulo) === id, `«${m.titulo}» repetido en ${id} y ${titulos.get(m.titulo)}`);
    titulos.set(m.titulo, id);
  }
});

test('galería del PER: ninguna lámina sin migrar, y cada una con el título de su marco', () => {
  for (const [ut, specs] of Object.entries(LAMINAS.per)) for (const s of specs) assert.ok(marcoDe(s), `UT ${ut}: ${JSON.stringify(s)} sin marco`);
  const curso = JSON.parse(readFileSync(new URL('../data/curso/per.json', import.meta.url)));
  const { porId } = catalogoLaminas('per', PER, curso);
  for (const s of [{ tipo: 'ciaboga' }, { tipo: 'regiones' }, { tipo: 'jerarquia' }, { tipo: 'dst' }, { tipo: 'buque', clase: 'pesquero-arrastre', vista: 'todas', dia: true }]) {
    assert.equal(porId.get(idLamina(s))?.titulo, marcoDe(s).titulo, JSON.stringify(s));
  }
});

// ---------------------------------------------------------------------------
// Hechos dibujados

test('ritmos: nombre de la familia y cifras de cada periodo (IALA)', () => {
  assert.equal(familiaRitmo('Q(6)+LFl 15s').nombre, 'seis centelleos y uno largo');
  assert.equal(familiaRitmo('Fl(2+1) R 10s').nombre, 'grupos de dos destellos y uno');
  assert.equal(familiaRitmo('Mo(A) 6s').k, 'Mo');
  const iso = cifrasRitmo('Iso 4s');
  assert.equal(iso.luz, iso.oscuridad, 'isofase: tanta luz como oscuridad');
  const oc = cifrasRitmo('Oc 6s');
  assert.ok(oc.luz > oc.oscuridad, 'ocultación: más luz que oscuridad');
  const fl = cifrasRitmo('Fl(2) 5s');
  assert.ok(fl.luz < fl.oscuridad && fl.destellos === 2, 'destello: menos luz que oscuridad');
  assert.ok(cifrasRitmo('LFl 10s').luz >= 2, 'destello largo: 2 s o más');
  assert.equal(cifrasRitmo('Q').periodo, 1, 'centelleo: 60 por minuto');
  assert.deepEqual(cifrasRitmo('Al.Bu/Y 3s').colores, ['azul', 'amarilla']);
});

test('riesgo de abordaje: demora constante con la distancia que baja; si no, la demora abre', () => {
  const c = casoRiesgo(true).pos;
  assert.equal(new Set(c.map((q) => q.dem)).size, 1);
  for (let i = 1; i < 4; i++) assert.ok(c[i].dist < c[i - 1].dist);
  const v = casoRiesgo(false).pos;
  assert.equal(new Set(v.map((q) => q.dem)).size, 4);
  for (let i = 1; i < 4; i++) assert.ok(v[i].dem > v[i - 1].dem, 'la demora abre hacia popa: pasa por tu popa');
});

test('buques: el tope nunca se ve de popa, la amarilla de remolque solo de popa y, de proa, la verde a la izquierda de la roja', () => {
  for (const [clase, s] of Object.entries(SHIPS)) {
    assert.ok(!lucesVista(s, 'popa').some((l) => l.t === 'tope'), `${clase}: tope de popa`);
    for (const v of ['proa', 'babor', 'estribor']) assert.ok(!lucesVista(s, v).some((l) => l.t === 'remolque'), `${clase}: remolque de ${v}`);
    const svg = renderIllustration({ tipo: 'buque', clase, vista: 'proa' }).svg;
    const x = (c) => [...svg.matchAll(new RegExp(`data-luz="${c}"><circle cx="([\\d.]+)"`, 'g'))].map((m) => +m[1]);
    // costados de proa: su verde (estribor) a nuestra izquierda
    const costados = lucesVista(s, 'proa').filter((l) => l.t === 'costado');
    if (costados.length) assert.ok(Math.min(...x('verde')) < Math.max(...x('roja')), clase);
  }
  // por su babor solo se ve la roja; por su estribor, la verde
  assert.deepEqual(lucesVista(SHIPS.motor, 'babor').filter((l) => l.t === 'costado').map((l) => l.c), ['R']);
  assert.deepEqual(lucesVista(SHIPS.motor, 'estribor').filter((l) => l.t === 'costado').map((l) => l.c), ['G']);
  // el velero no lleva luz blanca de tope ni de proa; sin arrancada, el sin gobierno solo sus dos rojas
  assert.ok(!lucesVista(SHIPS.vela, 'proa').some((l) => l.c === 'W'));
  assert.deepEqual(lucesVista(SHIPS['sin-gobierno'], 'proa', { arrancada: false }).map((l) => l.c), ['R', 'R']);
  // motor de 50 m: la de tope de popa, más alta; fondeado de 50 m: la de proa, más alta
  const alto = (s, at) => Math.max(...s.luces.filter((l) => l[1] === at).map((l) => l[2]));
  assert.ok(alto(SHIPS['motor-50'], 'popa') > alto(SHIPS['motor-50'], 'proa'));
  assert.ok(alto(SHIPS['fondeado-50'], 'proa') > alto(SHIPS['fondeado-50'], 'popa'));
});

test('tarjetas de buques: dibujo en estilo C que no dice qué buque es', () => {
  const [m] = mazos('per').filter((x) => x.id === 'buques');
  assert.equal(m.cartas.length, 32);
  for (const c of m.cartas) {
    const a = anversoTarjeta('buques', c);
    assert.ok(a.estiloC && a.svg.startsWith('<svg') && /role="img"/.test(a.svg), c.id);
    const visible = `${a.svg.replace(/<[^>]*>/g, ' ')} ${a.alt}`.toLowerCase();
    assert.ok(!visible.includes(c.reverso.titulo.toLowerCase()), `${c.id}: enseña su nombre`);
    assert.deepEqual(textoMinimo(a.svg), [], c.id);
    assert.ok(!colorFijo(a.svg), c.id);
    assert.ok(a.descripcion.length > 20, c.id);
  }
});

// ---------------------------------------------------------------------------
// Ciaboga y desatraque: física, pistas y fotogramas

test('ciaboga: avante a estribor y atrás a babor, queda al rumbo opuesto en mucho menos sitio que la curva de evolución', () => {
  const c = ciaboga();
  const f = c.muestras.at(-1);
  assert.ok(Math.abs(f.rumbo - 180) < 10, `rumbo final ${f.rumbo}`);
  assert.ok(c.tramos[0].maquina === 1 && c.tramos[0].timon === 1 && c.tramos[1].maquina === -1 && c.tramos[1].timon === -1);
  // dando atrás la proa sigue cayendo a estribor (la presión lateral de la dextrógira lleva la popa a babor)
  for (const tr of c.tramos.filter((x) => x.maquina < 0)) {
    const ms = c.muestras.filter((q) => q.t >= tr.t + 2 && q.t <= tr.t + 6);
    assert.ok(ms.every((q) => q.r > 0), `atrás a los ${tr.t} s`);
  }
  // nunca coge mucha arrancada y todo el casco cabe en una dársena de dos esloras
  assert.ok(c.muestras.every((q) => Math.abs(q.u) < 1));
  const xs = c.muestras.flatMap((q) => [puntoCasco(q, 0.5)[0], puntoCasco(q, -0.5)[0]]);
  const ancho = Math.max(...xs) - Math.min(...xs);
  assert.ok(ancho < 2 * L, `ancho barrido ${ancho / L} esloras`);
  assert.ok(ancho < curvaEvolucion().diametroTactico / 1.5);
  for (let i = 1; i < c.muestras.length; i++) assert.ok(Math.hypot(c.muestras[i].x - c.muestras[i - 1].x, c.muestras[i].y - c.muestras[i - 1].y) < 0.05);
});

test('desatraque: gira alrededor de la defensa, se abre la popa (o la proa) y sale; sin esprín que trabaje, no se abre', () => {
  for (const e of DESATRAQUES) {
    const r = calcDesatraque(e);
    const m = desatraqueMovimiento({ resultado: r.resultado, esprin: e.esprin, maquina: e.maquina, viento: e.viento });
    const fin = m.muestras.at(-1);
    if (r.resultado === 'abre-popa' || r.resultado === 'abre-proa') {
      const q = enInstante(m.muestras, m.tAbierta);
      // mientras el esprín trabaja, la defensa no se mueve: el punto del casco que apoya sigue en el muelle
      const [px, py] = m.pivote;
      const a0 = (270 * Math.PI) / 180;
      const loc = [(px) * Math.sin(a0) + (py) * Math.cos(a0), px * Math.cos(a0) - py * Math.sin(a0)]; // en ejes del barco
      const ar = (q.rumbo * Math.PI) / 180;
      const ahora = [q.x + Math.sin(ar) * loc[0] + Math.cos(ar) * loc[1], q.y + Math.cos(ar) * loc[0] - Math.sin(ar) * loc[1]];
      assert.ok(Math.hypot(ahora[0] - px, ahora[1] - py) < 0.05, `${JSON.stringify(e)}: la defensa se ha movido`);
      // abre la popa: la proa cae hacia el muelle (rumbo < 270); abre la proa: rumbo > 270
      assert.ok(r.resultado === 'abre-popa' ? q.rumbo < 250 : q.rumbo > 285, `${JSON.stringify(e)}: ${q.rumbo}`);
      // y sale: atrás si abrió la popa, avante si abrió la proa
      const dir = [Math.sin((fin.rumbo * Math.PI) / 180), Math.cos((fin.rumbo * Math.PI) / 180)];
      const avance = (fin.x - q.x) * dir[0] + (fin.y - q.y) * dir[1];
      assert.ok(r.resultado === 'abre-popa' ? avance < -1 : avance > 1, `${JSON.stringify(e)}: sale ${avance}`);
    } else {
      assert.ok(Math.abs(fin.rumbo - 270) < 1, `${JSON.stringify(e)}: no se abre`);
      if (r.resultado === 'se-separa') assert.ok(fin.y > 1.5, 'el viento de tierra lo separa');
      else assert.ok(Math.abs(fin.y) < 0.01 && Math.abs(fin.x) < 1.6, 'se queda en el muelle');
    }
  }
});

const ANIMADAS_PER = [{ tipo: 'ciaboga' }, { tipo: 'desatraque', abrir: 'popa' }, { tipo: 'desatraque', abrir: 'proa' }, ...DESATRAQUES];
function pistaDe(spec) {
  const def = interactivaDe(spec);
  if (def?.animacion) { const e = def.estado(spec); return def.animacion.pista(e, def.calcular(e)); }
  return animacionDe(spec).pista();
}
function svgEn(spec, t) {
  const def = interactivaDe(spec);
  if (def?.animacion) { const v = controlador(def, spec, 'galeria').vista({ t }); return v.svg ?? v.vistas.map((x) => x.svg).join(''); }
  return animacionDe(spec).pista().svg(t);
}

test('ciaboga y desatraque animados: hitos con nombre y frase, cambios sin NaN y fotogramas en estilo C con su data-ani', () => {
  for (const s of ANIMADAS_PER) {
    const p = pistaDe(s);
    assert.ok(p.duracion > 3 && p.duracion < 30, `${JSON.stringify(s)}: duración ${p.duracion}`);
    assert.equal(p.hitos[0].t, 0);
    assert.ok(p.hitos.length >= 3 && p.hitos.length <= 8);
    for (let i = 1; i < p.hitos.length; i++) assert.ok(p.hitos[i].t > p.hitos[i - 1].t && p.hitos[i].t <= p.duracion, `${JSON.stringify(s)}: hitos en orden`);
    for (const h of p.hitos) assert.ok(h.nombre.length > 3 && /[.!?]$/.test(h.texto), `${JSON.stringify(s)}: «${h.nombre}»`);
    for (let t = 0; t <= p.duracion + 1e-9; t += p.duracion / 30) assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(p.cambios(t))), `${JSON.stringify(s)} t=${t}`);
    for (const t of [0, ...p.hitos.map((h) => h.t), p.duracion]) {
      const svg = svgEn(s, t);
      assert.ok(!/NaN|undefined|Infinity/.test(svg));
      assert.deepEqual(textoMinimo(svg), [], `${JSON.stringify(s)} t=${t}`);
      assert.ok(!colorFijo(svg), `${JSON.stringify(s)} t=${t}`);
      for (const k of Object.keys(p.cambios(t))) assert.ok(svg.includes(`data-ani="${k}"`), `${JSON.stringify(s)}: falta data-ani="${k}"`);
    }
  }
  // la imagen fija de la ciaboga es su fotograma final, con la cartela visible; la del desatraque, la popa ya abierta
  const p = pistaDe({ tipo: 'ciaboga' });
  assert.equal(renderIllustration({ tipo: 'ciaboga' }).svg, p.svg(p.tFijo));
  assert.equal(p.cambios(p.tFijo)['cartela-fin'].opacity, '1');
  const d = pistaDe({ tipo: 'desatraque', abrir: 'popa' });
  assert.ok(d.tFijo < d.duracion && d.cambios(d.tFijo).esprin.opacity === '1');
});

test('desatraque interactivo: en clase no enseña el resultado hasta responder, y cada parte está dibujada', () => {
  const def = interactivaDe({ tipo: 'desatraque', abrir: 'popa' });
  const e = def.estado({ abrir: 'popa' });
  const pend = def.dibujar(e, def.calcular(e), { pendiente: true });
  assert.ok(!/ABRE LA POPA/.test(pend.svg) && /Responde/.test(pend.lectura));
  for (const s of DESATRAQUES) {
    const v = controlador(def, s, 'galeria').vista();
    for (const p of Object.keys(def.partes)) assert.ok(v.svg.includes(`data-parte="${p}"`), `${JSON.stringify(s)}: falta ${p}`);
  }
});

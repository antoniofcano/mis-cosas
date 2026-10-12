// Tanda de cierre de las láminas (docs/ESTILO-LAMINAS.md): las láminas de lección del PER que aún tenían el dibujo
// antiguo, la interactiva del fuego «apagar», las miniaturas de los buques en los mapas, las luces con «reducir
// movimiento» y la cola del PY. Las mismas comprobaciones que las láminas piloto (texto mínimo, solo --lc-*, marco
// completo, un título por lámina), más los hechos de cada lámina.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { marcoDe } from '../src/illustrations/marcos.js';
import { idLamina, catalogoLaminas } from '../src/illustrations/catalogo-laminas.js';
import { LAMINAS_LECCIONES } from '../src/illustrations/lecciones/index.js';
import { PER, PY } from '../src/theory/blocks.js';
import { interactivaDe } from '../src/illustrations/interactivas.js';
import { animacionDe } from '../src/illustrations/animaciones/index.js';
import { caidaDos } from '../src/illustrations/animaciones/ciaboga-dos.js';
import { parseRhythm } from '../src/illustrations/lights.js';
import { SHIPS } from '../src/illustrations/ships.js';
import { miniaturaBuque, lucesVista } from '../src/illustrations/buques-c.js';
import { PARTES_CO2, PARTES_USO, AVISOS_PARTES, RADIO_PARTES } from '../src/illustrations/py-cierre-c.js';
import { PARTES_RIPA, PARTES_CAPEAR, PARTES_ANCLA, PARTES_LINEA, PARTES_ORINQUE, VOCES, ESTRUCTURA, PALABRAS_VIENTO, CABO } from '../src/illustrations/per-cola-c.js';
import { EQUIPOS, PARTES_TQ, PUNTOS_BANDERA, PABELLON } from '../src/illustrations/per-cola-normativa-c.js';
import { PARTES_PUERTO, RESPONSABLES } from '../src/illustrations/per-cola-normativa-b-c.js';
import { MARGENES_PARTES, ESTIMA_PARTES, TRASLADO_PARTES, TANGENTE_PARTES, FONDOS, OPOSICION_PARTES, tangenteC, estimaC } from '../src/illustrations/per-cola-carta-c.js';

export const PILOTO_CIERRE = [
  // carta (per-10-2, 10-3, 11-1, 11-3, 11-4, 11-8, 11-9)
  { tipo: 'carta-margenes' }, ...MARGENES_PARTES.map((resaltar) => ({ tipo: 'carta-margenes', resaltar })),
  { tipo: 'transportador', caso: 'rumbo' }, ...[0, 140, 230, 315].map((rv) => ({ tipo: 'transportador', caso: 'rumbo', rv })),
  { tipo: 'transportador', caso: 'faro' }, ...[45, 180].map((dv) => ({ tipo: 'transportador', caso: 'faro', dv })),
  ...['carta', 'minuto', 'definicion'].map((vista) => ({ tipo: 'milla', vista })),
  { tipo: 'rumbo-directo' },
  { tipo: 'estima' }, ...ESTIMA_PARTES.map((resaltar) => ({ tipo: 'estima', resaltar })), { tipo: 'estima', rv: 110, v: 7.2, hi: '08:00', hf: '10:30' }, { tipo: 'estima', ra: 45, ct: 4, v: 5, hi: '23:30', hf: '01:12' },
  { tipo: 'traslado-demora', caso: 'no-simultaneas' }, ...['primera', 'traslado', 'trasladada', 'segunda', 'situacion'].map((resaltar) => ({ tipo: 'traslado-demora', caso: 'no-simultaneas', resaltar })),
  { tipo: 'traslado-demora', caso: 'simultaneas' }, ...['rumbo', 'distancia', 'lineas', 'situacion'].map((resaltar) => ({ tipo: 'traslado-demora', caso: 'simultaneas', resaltar })),
  ...['babor', 'estribor', 'ambas'].map((banda) => ({ tipo: 'tangente', banda })), ...TANGENTE_PARTES.map((resaltar) => ({ tipo: 'tangente', banda: 'babor', resaltar })), { tipo: 'tangente', banda: 'estribor', dv: 300, D: 8, d: 3 },
  { tipo: 'veriles', vista: 'carta' }, ...['sondas', 'veriles', 'fondo'].map((resaltar) => ({ tipo: 'veriles', vista: 'carta', resaltar })), { tipo: 'veriles', vista: 'fondos' }, { tipo: 'veriles', vista: 'fondos', resaltar: 'G' },
  // reglamento, maniobra, casco, seguridad y meteorología (per-1-3, 1-6, 2-5, 2-6, 3-3, 3-8, 6-1, 7-1, 8-5, 8-9, 9-3)
  ...['vela-motor', 'categorias'].map((vista) => ({ tipo: 'ripa-definiciones', vista })), ...PARTES_RIPA.map((resaltar) => ({ tipo: 'ripa-definiciones', vista: resaltar === 'vela' || resaltar === 'motor' ? 'vela-motor' : 'categorias', resaltar })),
  ...['rumbos', 'costa'].map((vista) => ({ tipo: 'capear-correr', vista })), ...PARTES_CAPEAR.map((resaltar) => ({ tipo: 'capear-correr', vista: ['barlovento', 'sotavento'].includes(resaltar) ? 'costa' : 'rumbos', resaltar })),
  ...['ancla', 'linea', 'borneo', 'garreo', 'orinque', 'voces'].map((vista) => ({ tipo: 'fondeo', vista })), ...PARTES_ANCLA.map((resaltar) => ({ tipo: 'fondeo', vista: 'ancla', resaltar })),
  ...PARTES_LINEA.map((resaltar) => ({ tipo: 'fondeo', vista: 'linea', resaltar })), ...PARTES_ORINQUE.map((resaltar) => ({ tipo: 'fondeo', vista: 'orinque', resaltar })), ...VOCES.map((resaltar) => ({ tipo: 'fondeo', vista: 'voces', resaltar })),
  { tipo: 'estructura' }, ...ESTRUCTURA.map((resaltar) => ({ tipo: 'estructura', resaltar })), { tipo: 'estructura', vista: 'vias-agua' },
  ...['vocabulario', 'instrumentos'].map((vista) => ({ tipo: 'rolar', vista })), ...['rolar', ...Object.keys(PALABRAS_VIENTO)].map((resaltar) => ({ tipo: 'rolar', vista: 'vocabulario', resaltar })),
  ...['partes', 'cornamusa', 'por-seno', 'encapillar'].map((vista) => ({ tipo: 'cabo', vista })), ...CABO.map((resaltar) => ({ tipo: 'cabo', vista: 'partes', resaltar })),
  ...['largo', 'abarloado', 'naufrago'].map((vista) => ({ tipo: 'remolque', vista })), ...['help', 'saltar', 'grupo'].map((postura) => ({ tipo: 'hipotermia', postura })),
  // pendientes menores: el fuego «apagar» (per-8-7) y la ciaboga con dos hélices (per-7-5)
  { tipo: 'fuego', vista: 'tetraedro', modo: 'apagar' },
  { tipo: 'ciaboga-dos-helices', banda: 'er' }, { tipo: 'ciaboga-dos-helices', banda: 'br' }, ...['exterior', 'interior', 'ciaboga'].map((resaltar) => ({ tipo: 'ciaboga-dos-helices', banda: 'er', resaltar })),
  // cola del PY: el extintor (py-1-7) y los avisos a los navegantes (py-3-7)
  ...['ambas', 'co2', 'uso', 'norma'].map((vista) => ({ tipo: 'extintor', vista })), ...PARTES_CO2.map((resaltar) => ({ tipo: 'extintor', vista: 'co2', resaltar })), ...PARTES_USO.map((resaltar) => ({ tipo: 'extintor', vista: 'uso', resaltar })),
  ...['correccion', 'radioavisos'].map((vista) => ({ tipo: 'avisos-navegantes', vista })), ...AVISOS_PARTES.map((resaltar) => ({ tipo: 'avisos-navegantes', vista: 'correccion', resaltar })), ...RADIO_PARTES.map((resaltar) => ({ tipo: 'avisos-navegantes', vista: 'radioavisos', resaltar })),
  // legislación (per-3-5, 4-2, 4-4, 4-5, 4-7, 4-8)
  { tipo: 'zonas' }, ...[1, 4, 7].map((resaltar) => ({ tipo: 'zonas', resaltar })),
  { tipo: 'dotacion-zonas' }, ...EQUIPOS.map((resaltar) => ({ tipo: 'dotacion-zonas', resaltar })), { tipo: 'dotacion-zonas', zona: 4 },
  ...['balizada', 'no-balizada'].map((caso) => ({ tipo: 'playa', caso })), ...['aguas-sucias', 'basuras'].map((tema) => ({ tipo: 'vertidos', tema })),
  ...['puerto', 'mar'].map((vista) => ({ tipo: 'tanque-retencion', vista })), ...PARTES_TQ.map((resaltar) => ({ tipo: 'tanque-retencion', vista: 'puerto', resaltar })),
  { tipo: 'marpol-basuras' }, ...['atlantico', 'mediterraneo'].map((zona) => ({ tipo: 'marpol-basuras', zona })),
  ...['fondeo', 'planta'].map((vista) => ({ tipo: 'posidonia', vista })),
  { tipo: 'banderas-a-bordo' }, ...PUNTOS_BANDERA.map((resaltar) => ({ tipo: 'banderas-a-bordo', resaltar })),
  { tipo: 'pabellon-obligatorio' }, ...[...Object.keys(PABELLON), 'otras'].map((resaltar) => ({ tipo: 'pabellon-obligatorio', resaltar })),
  ...['oposicion', 'enfilacion'].flatMap((caso) => [{ tipo: 'oposicion', caso }, ...OPOSICION_PARTES.map((resaltar) => ({ tipo: 'oposicion', caso, resaltar }))]),
  { tipo: 'declinacion-anual', dm: -150, anio: 2016, variacion: 9, actual: 2026 }, { tipo: 'declinacion-anual', dm: 30, anio: 2010, variacion: -7, actual: 2026 },
  ...['N20E', 'S65E', 'S45W', 'N64W'].map((rumbo) => ({ tipo: 'rumbo-cuadrantal', rumbo })),
  { tipo: 'demora-marcacion', rumbo: 70, marcacion: -100 }, { tipo: 'demora-marcacion', rumbo: 200, marcacion: 120 }, ...['demora', 'marcacion'].map((resaltar) => ({ tipo: 'demora-marcacion', rumbo: 130, marcacion: -90, resaltar })),
  { tipo: 'calidad-corte' }, { tipo: 'calidad-corte', angulo: 12 }, ...['buena', 'mala'].map((resaltar) => ({ tipo: 'calidad-corte', resaltar })),
  { tipo: 'puerto-comercial' }, ...PARTES_PUERTO.map((resaltar) => ({ tipo: 'puerto-comercial', resaltar })), { tipo: 'seguro-rc' },
  ...['responsables', 'aviso'].map((vista) => ({ tipo: 'contaminacion', vista })), ...RESPONSABLES.map((resaltar) => ({ tipo: 'contaminacion', vista: 'responsables', resaltar })),
  { tipo: 'deber-auxilio' }, ...['acudir', 'no-acudir'].map((resaltar) => ({ tipo: 'deber-auxilio', resaltar })),
];

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (bloque) => Object.fromEntries([...bloque.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
const CLARO = vars(bloque(':root {'));
const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));
const svgDe = (s) => renderIllustration(s).svg;
const curso = (c) => JSON.parse(readFileSync(new URL(`../data/curso/${c}.json`, import.meta.url)));

test('cierre: se dibujan, son specs válidas y sin NaN', () => {
  for (const s of PILOTO_CIERRE) {
    assert.ok(validSpec(s), JSON.stringify(s));
    assert.ok(!/NaN|undefined|null|Infinity/.test(svgDe(s)), `${JSON.stringify(s)}: NaN o undefined`);
    assert.ok(!/<[\s\d=]|&(?![a-z]+;|#\d+;)/.test(svgDe(s)), `${JSON.stringify(s)}: «<» o «&» sin escapar`);
  }
});

test('cierre: ningún texto del SVG baja de 10,5 px efectivos a 360 px de ancho', () => {
  const malos = [];
  for (const s of PILOTO_CIERRE) {
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

test('cierre: solo colores --lc-*, todos con su versión oscura', () => {
  for (const s of PILOTO_CIERRE) {
    const svg = svgDe(s);
    const sinUrl = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)');
    const fijo = sinUrl.match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"|(?:fill|stroke):\s*(?!var\(--lc-)[#a-z]/);
    assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]}`);
    assert.ok(!/class="il-(panel|lbl|title)/.test(svg), `${JSON.stringify(s)}: clases del dibujo antiguo`);
    for (const v of new Set(svg.match(/var\(--[a-z0-9-]+\)/g))) {
      const k = v.slice(6, -1);
      if (k === 'lc-url') continue;
      assert.ok(k in CLARO, `${v} no está en styles/laminas.css`);
      assert.ok(k in OSCURO || k.startsWith('lc-luz-'), `${v} sin versión oscura`);
    }
  }
});

test('cierre: marco completo, sin emojis, y un título por lámina', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  const titulos = new Map();
  for (const s of PILOTO_CIERRE) {
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

test('cierre: cada parte que se puede resaltar está dibujada y cambia el dibujo', () => {
  const casos = [
    ['carta-margenes', {}, MARGENES_PARTES], ['estima', {}, ESTIMA_PARTES], ['tangente', { banda: 'babor' }, TANGENTE_PARTES],
    ['traslado-demora', { caso: 'no-simultaneas' }, ['primera', 'traslado', 'trasladada', 'segunda', 'situacion']],
    ['traslado-demora', { caso: 'simultaneas' }, ['rumbo', 'distancia', 'lineas', 'situacion']],
    ['veriles', { vista: 'carta' }, ['sondas', 'veriles', 'fondo']], ['veriles', { vista: 'fondos' }, FONDOS.map((f) => f[0])],
    ['ripa-definiciones', { vista: 'vela-motor' }, ['vela', 'motor']], ['ripa-definiciones', { vista: 'categorias' }, PARTES_RIPA.slice(2)],
    ['capear-correr', { vista: 'rumbos' }, ['capear', 'correr', 'traves']], ['capear-correr', { vista: 'costa' }, ['barlovento', 'sotavento']],
    ['fondeo', { vista: 'ancla' }, PARTES_ANCLA], ['fondeo', { vista: 'linea' }, PARTES_LINEA], ['fondeo', { vista: 'orinque' }, PARTES_ORINQUE], ['fondeo', { vista: 'voces' }, VOCES],
    ['estructura', {}, ESTRUCTURA], ['rolar', { vista: 'vocabulario' }, ['rolar', ...Object.keys(PALABRAS_VIENTO)]], ['cabo', { vista: 'partes' }, CABO],
    ['extintor', { vista: 'co2' }, PARTES_CO2], ['extintor', { vista: 'uso' }, PARTES_USO], ['avisos-navegantes', { vista: 'correccion' }, AVISOS_PARTES], ['avisos-navegantes', { vista: 'radioavisos' }, RADIO_PARTES],
    ['dotacion-zonas', {}, EQUIPOS], ['tanque-retencion', { vista: 'puerto' }, PARTES_TQ], ['banderas-a-bordo', {}, PUNTOS_BANDERA], ['pabellon-obligatorio', {}, [...Object.keys(PABELLON), 'otras']],
    ['oposicion', { caso: 'oposicion' }, OPOSICION_PARTES], ['oposicion', { caso: 'enfilacion' }, OPOSICION_PARTES],
    ['puerto-comercial', {}, PARTES_PUERTO], ['contaminacion', { vista: 'responsables' }, RESPONSABLES], ['deber-auxilio', {}, ['acudir', 'no-acudir']],
  ];
  for (const [tipo, base, lista] of casos) {
    const svg = svgDe({ tipo, ...base });
    for (const p of lista) {
      assert.ok(svg.includes(`data-parte="${p}"`), `${tipo}: falta data-parte="${p}"`);
      assert.notEqual(svgDe({ tipo, ...base, resaltar: p }), svg, `${tipo}: resaltar ${p} no cambia nada`);
    }
  }
  assert.ok(TRASLADO_PARTES.length === 8);
});

test('cierre: las clases del PER enseñan estas láminas en la galería con el título de su marco', () => {
  const c = curso('per');
  const { porId } = catalogoLaminas('per', PER, c);
  const TIPOS = new Set(PILOTO_CIERRE.map((s) => s.tipo));
  let n = 0;
  for (const m of c.modulos) for (const l of m.lecciones) for (const p of l.pasos) {
    if (p.tipo !== 'ilustracion' || !TIPOS.has(p.spec?.tipo)) continue;
    n++;
    const lam = porId.get(idLamina(p.spec));
    assert.ok(lam, `${l.id}: ${JSON.stringify(p.spec)} no está en la galería`);
    assert.ok(lam.titulo.startsWith(marcoDe(p.spec).titulo), `${l.id}: ${JSON.stringify(p.spec)} sin el título de su marco`);
  }
  assert.ok(n >= 15, `solo ${n} pasos con estas láminas`);
});

test('cierre: ninguna lámina de las clases del PER sigue con el dibujo antiguo (salvo las anotadas)', () => {
  // Ya no queda ninguna: las últimas se migraron en el cierre del PER (.trabajo-ux/ESTADO-per-cierre.md). Si vuelve a
  // aparecer un dibujo antiguo en una clase del PER, este test falla.
  const PENDIENTES = new Set([]);
  const viejas = [];
  for (const m of curso('per').modulos) for (const l of m.lecciones) for (const p of l.pasos) {
    if (p.tipo !== 'ilustracion' || !LAMINAS_LECCIONES[p.spec?.tipo]) continue;
    const svg = svgDe(p.spec);
    if (/class="il"[^>]*>|class="il-(panel|lbl|title)/.test(svg) && !/class="il lc/.test(svg) && !PENDIENTES.has(p.spec.tipo)) viejas.push(`${l.id} ${p.spec.tipo}`);
  }
  assert.deepEqual(viejas, []);
  // y ninguna de las anotadas se ha migrado sin quitarla de la lista
  const siguen = new Set();
  for (const m of curso('per').modulos) for (const l of m.lecciones) for (const p of l.pasos) {
    if (p.tipo === 'ilustracion' && PENDIENTES.has(p.spec?.tipo) && !/class="il lc/.test(svgDe(p.spec))) siguen.add(p.spec.tipo);
  }
  assert.deepEqual([...PENDIENTES].filter((t) => !siguen.has(t)), []);
});

test('cierre: las cifras de la carta salen de la matemática', () => {
  // estima: 297° − 3° = 294°; 18:20 → 20:35 = 2,25 h a 6 nudos = 13,5 millas
  const e = svgDe({ tipo: 'estima' });
  for (const t of ['294°', '2,25 h', '13,5 millas']) assert.ok(e.includes(t), t);
  assert.ok(estimaC({ rv: 110, v: 7.2, hi: '08:00', hf: '10:30' }).svg.includes('18,0 millas'));
  // tangente: sen α = 2,5 / 10 → α = 14,48° ≈ 14,5°; por babor Rv = 004° + 14,5° ≈ 019°
  assert.equal(Math.round((Math.asin(0.25) * 1800) / Math.PI) / 10, 14.5);
  assert.match(tangenteC({ banda: 'babor' }).svg, /α ≈ 14,5°.*Rv = Dv \+ α ≈ 019°/);
  assert.match(tangenteC({ banda: 'estribor', dv: 300, D: 8, d: 3 }).svg, /α ≈ 22°.*Rv = Dv − α ≈ 278°/);
  // demoras no simultáneas: 6 nudos durante 40 min = 4 millas
  assert.match(svgDe({ tipo: 'traslado-demora' }), /6 × 40\/60 = 4 millas/);
  // rumbo directo: −2° 50′ + 19 × 7′ = −37′ ≈ −1°; Ct = −1° + 6° = +5°; Ra = 190° − 5° = 185°
  assert.equal(-170 + 19 * 7, -37);
  assert.match(svgDe({ tipo: 'rumbo-directo' }), /Ra = Rv − Ct = 190° − 5° = 185°/);
  // márgenes: el punto de la lección; un minuto de longitud a 36° vale cos 36° ≈ 0,81 millas
  const cm = svgDe({ tipo: 'carta-margenes' });
  for (const t of ['36° 07,3′ N', '005° 58,6′ W', '0,2′', '07,3′']) assert.ok(cm.includes(t), t);
  assert.ok(Math.abs(Math.cos((36 * Math.PI) / 180) - 0.81) < 0.01);
  assert.match(svgDe({ tipo: 'milla', vista: 'carta' }), /unas 0,8 millas/);
  // transportador: «al faro» 310° → el barco al 130° del faro
  const f = svgDe({ tipo: 'transportador', caso: 'faro' });
  assert.ok(f.includes('310°') && f.includes('130°'));
  assert.match(svgDe({ tipo: 'milla', vista: 'definicion' }), /1852 m/);
});

test('cierre: el fuego «apagar» quita un elemento y la lámina lo dice', () => {
  const def = interactivaDe({ tipo: 'fuego', vista: 'tetraedro', modo: 'apagar' });
  assert.ok(def, 'sigue siendo interactiva');
  for (const [quita, metodo] of [['combustible', 'desalimentación'], ['comburente', 'sofocación'], ['calor', 'enfriamiento'], ['reaccion', 'inhibición']]) {
    const e = def.estado({ quita });
    const r = def.calcular(e);
    assert.equal(r.arde, false);
    const { svg, lectura } = def.dibujar(e, r);
    assert.ok(svg.includes(metodo) && lectura.includes(metodo), quita);
    assert.ok(svg.includes('class="il lc'), 'estilo C');
    for (const p of ['combustible', 'comburente', 'calor', 'reaccion']) assert.ok(svg.includes(`data-parte="${p}"`), p);
  }
  assert.equal(def.calcular(def.estado({})).arde, true);
});

test('cierre: la ciaboga con dos hélices gira hacia la banda del motor que va atrás y acaba al rumbo opuesto', () => {
  for (const banda of ['er', 'br']) {
    const s = { tipo: 'ciaboga-dos-helices', banda };
    const a = animacionDe(s);
    assert.ok(a, banda);
    const p = a.pista();
    assert.ok(p.hitos.length >= 4 && p.hitos.every((h) => h.nombre && h.texto), 'hitos con nombre y frase');
    const fin = p.cambios(p.duracion);
    const giro = Number(fin.barco.transform.match(/rotate\((-?[\d.]+)\)/)[1]);
    assert.equal(giro, banda === 'er' ? 180 : -180, 'rumbo opuesto, cayendo a su banda');
    const medio = Number(p.cambios(p.duracion / 2).barco.transform.match(/rotate\((-?[\d.]+)\)/)[1]);
    assert.ok(banda === 'er' ? medio > 0 && medio < 180 : medio < 0 && medio > -180, `${banda}: cae a su banda (${medio})`);
    assert.equal(renderIllustration(s).svg, p.svg(p.tFijo), 'imagen fija = fotograma final');
    const [B, O] = banda === 'er' ? ['estribor', 'babor'] : ['babor', 'estribor'];
    assert.ok(p.svg(0).includes(`${B} atrás`) && p.svg(0).includes(`${O} avante`));
    for (let t = 0; t <= p.duracion; t += 0.5) assert.ok(!/NaN|undefined/.test(JSON.stringify(p.cambios(t))), `t=${t}`);
  }
  assert.ok(caidaDos(0) === 0 && caidaDos(1000) === 180);
});

test('cierre: con «reducir movimiento» las luces se quedan encendidas y sin cursor', () => {
  const css = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce) {\n  .lc-destello'));
  assert.match(css, /\.lc-destello \{ opacity: 1 !important; \}/);
  assert.match(css, /\.lc-destello-otro \{ opacity: 0 !important; \}/);
  assert.match(css, /\.lc-cursor \{ display: none; \}/);
  // las luces que destellan llevan la clase; la primera fase de cada ritmo es de luz (lo que se ve quieto)
  for (const ritmo of ['Fl(2) 5s', 'Q', 'VQ(3) 5s', 'Q(6)+LFl 15s', 'Iso 4s', 'Oc 6s', 'LFl 10s', 'Mo(A) 6s', 'Al.Bu/Y 3s', 'Fl(2+1) R 10s']) {
    assert.equal(parseRhythm(ritmo).steps[0].on, true, ritmo);
    const svg = svgDe({ tipo: 'ritmo', ritmo });
    const animadas = svg.match(/<circle[^>]*>(?=<animate attributeName="opacity")/g) ?? [];
    assert.ok(animadas.length && animadas.every((c) => /class="lc-destello/.test(c)), ritmo);
    assert.match(svg, /<line class="lc-cursor"/);
  }
  assert.match(svgDe({ tipo: 'ritmo', ritmo: 'Al.Bu/Y 3s' }), /lc-destello lc-destello-otro/);
  assert.match(svgDe({ tipo: 'boya', clase: 'estribor' }), /class="lc-destello"/);
  assert.match(svgDe({ tipo: 'enfilacion' }), /class="lc-destello"/);
});

test('cierre: miniatura propia y legible de los buques en los mapas', () => {
  for (const clase of Object.keys(SHIPS)) {
    for (const spec of [{ clase, vista: 'todas' }, { clase, vista: 'proa', dia: true }]) {
      const svg = miniaturaBuque(spec);
      assert.ok(svg && svg.startsWith('<svg viewBox="0 0 88 60"') && svg.includes('aria-hidden="true"'), clase);
      assert.ok(!/NaN|undefined|<text/.test(svg), `${clase}: sin rótulos ni NaN`);
      // las luces de proa del buque, todas, y con el mismo color que en la lámina
      const luces = (svg.match(/data-luz="([a-z]+)"/g) ?? []).length;
      assert.equal(luces, lucesVista(SHIPS[clase], 'proa').length, clase);
      // radio de las luces: 3,4 en 88 de ancho (2,7 las del farol tricolor), el doble que la lámina entera a ese tamaño
      const radios = [...svg.matchAll(/<g data-luz="[a-z]+"><circle[^>]*\/><circle [^>]*r="([\d.]+)"/g)].map((m) => Number(m[1]));
      assert.ok(radios.length === luces && radios.every((r) => r >= 2.6), `${clase}: ${radios}`);
    }
  }
  assert.equal(miniaturaBuque({ clase: 'no-existe' }), null);
  const mapas = readFileSync(new URL('../src/ui/views/mapas.js', import.meta.url), 'utf8');
  assert.match(mapas, /miniaturaBuque\(spec\)/);
  assert.match(CSS, /\.mapa-mini\.mini-buque \{[^}]*width: 88px/);
});

test('cierre: el extintor y los avisos del PY, en la galería del PY y con las cifras de la norma', () => {
  const c = curso('py');
  const { porId } = catalogoLaminas('py', PY, c);
  let n = 0;
  for (const m of c.modulos) for (const l of m.lecciones) for (const p of l.pasos) {
    if (p.tipo !== 'ilustracion' || !['extintor', 'avisos-navegantes'].includes(p.spec?.tipo)) continue;
    n++;
    const lam = porId.get(idLamina(p.spec));
    assert.ok(lam && lam.titulo.startsWith(marcoDe(p.spec).titulo), `${l.id}: ${JSON.stringify(p.spec)}`);
  }
  assert.ok(n >= 5, `solo ${n}`);
  // RD 339/2021, art. 15: 34 B, 2 kg, tablas por eslora y por motor, 0,3 B por kW (250 kW: 75 B, tres de 34 B)
  const no = svgDe({ tipo: 'extintor', vista: 'norma' });
  for (const t of ['34 B', '2 kg', '10 ≤ L &lt; 15 m', '15 ≤ L &lt; 20 m', '20 ≤ L ≤ 24 m', 'P ≤ 25 kW', '25 &lt; P ≤ 220 kW', 'B = 0,3 · P', '250 kW → 75 B → tres de 34 B']) assert.ok(no.includes(t), t);
  assert.equal(Math.ceil((250 * 0.3) / 34), 3);
  // IHM, avisos generales 2(G) y 3(G); NAVTEX, MSC.1/Circ.1403
  const ra = svgDe({ tipo: 'avisos-navegantes', vista: 'radioavisos' });
  for (const t of ['21 zonas', 'la III', '518 kHz', '490 kHz', 'SÉCURITÉ', 'Salvamento Marítimo']) assert.ok(ra.includes(t), t);
  assert.ok(!ra.includes('Francia'), 'lo no comprobado no se dibuja');
  const co = svgDe({ tipo: 'avisos-navegantes', vista: 'correccion' });
  for (const t of ['tinta indeleble', 'A lápiz', 'No corrigen', 'margen inferior', '32/127(1)']) assert.ok(co.includes(t), t);
});

test('cierre: las láminas de cálculo y de oposición dicen lo que da la cuenta', () => {
  // oposición/enfilación: el tercer faro está a la demora dicha y se traza su opuesta
  assert.match(svgDe({ tipo: 'oposicion', caso: 'oposicion' }), /visto a 080°[^"]*opuesta, 260°/);
  assert.match(svgDe({ tipo: 'oposicion', caso: 'enfilacion' }), /visto a 205°[^"]*opuesta, 025°/);
  // declinación: 30′ E en 2010 con 7′ W al año → en 2026, 16 × 7′ = 112′ W y queda 1° 22′ W
  const d = svgDe({ tipo: 'declinacion-anual', dm: 30, anio: 2010, variacion: -7, actual: 2026 });
  for (const t of ['2026 − 2010 = 16', '16 × 7′ W = 112′ = 1° 52′ W', '+30′ − 1° 52′ = −1° 22′ → 1° 22′ W']) assert.ok(d.includes(t), t);
  // cuadrantal → circular, en los cuatro cuadrantes
  for (const [q, c] of [['N20E', '020°'], ['S65E', '115°'], ['S45W', '225°'], ['N64W', '296°']]) assert.ok(svgDe({ tipo: 'rumbo-cuadrantal', rumbo: q }).includes(`= ${c}`) || q === 'N20E', q);
  assert.ok(svgDe({ tipo: 'rumbo-cuadrantal', rumbo: 'N20E' }).includes('>020°<'));
  // demora = rumbo + marcación (estribor +, babor −), normalizada
  assert.match(svgDe({ tipo: 'demora-marcacion', rumbo: 350, marcacion: 30 }), /380° → 020°/);
  // calidad: la diagonal larga del rombo es 2e / sen(α/2); la del cuadrado de 90°, 2e·√2: razón 1 / (√2 · sen(α/2))
  assert.match(svgDe({ tipo: 'calidad-corte', angulo: 20 }), /unas 4 veces/);
  assert.equal(Math.round(1 / (Math.SQRT2 * Math.sin((10 * Math.PI) / 180))), 4);
});

export { PY };

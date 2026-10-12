// Cierre del PER (.trabajo-ux/ESTADO-per-cierre.md): las últimas láminas de lección con el dibujo antiguo, ya en estilo
// C (mismas comprobaciones que las láminas piloto: texto mínimo, solo --lc-*, marco completo, un título por lámina,
// data-parte de cada parte que se resalta), y la coherencia del PER de punta a punta: todas las láminas de las clases
// con marco y con su fila en el apéndice de la guía, ninguna clase sin lámina y la sanidad sin contradicciones entre
// la clase, las láminas, las fichas y las explicaciones de cada banco.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderIllustration, validSpec } from '../src/illustrations/index.js';
import { marcoDe } from '../src/illustrations/marcos.js';
import { idLamina, catalogoLaminas } from '../src/illustrations/catalogo-laminas.js';
import { LAMINAS_LECCIONES } from '../src/illustrations/lecciones/index.js';
import { PER } from '../src/theory/blocks.js';
import { PARTES_CUBIERTA, PARTES_TIMON, TIPOS_TIMON, PARTES_MB, NUDOS_PER, FACTORES_TENEDERO, FONDOS_TENEDERO, PASOS_FONDEO } from '../src/illustrations/per-final-c.js';
import { PARTES_REVISION, PARTES_VARADA, ACHIQUE, ZONAS_ACHIQUE, TENDENCIAS, PARTES_MAR, PARTES_PREVISION } from '../src/illustrations/per-final-b-c.js';

const PARTES_ACHIQUE = [...ACHIQUE.map((a) => a[0]), ...ZONAS_ACHIQUE.map((z) => z[0])];
const TEND = TENDENCIAS.map((t) => t[0]);
const RES_RESUMEN = ['tiempo', 'barco', 'personas', 'tierra'];
const RES_MOTOR = PARTES_REVISION.filter((k) => !RES_RESUMEN.includes(k));
const RES_VARADA = ['heridos', 'danos', 'sondar', 'marea', 'pleamar', 'pesos', 'ancla', 'escorar', 'remolque'];
const RES_ABORDAJE = ['danos', 'separar', 'despues', 'parte'];

/** [tipo, base, partes]: cada vista con las partes que se pueden resaltar en ella. */
const VISTAS = [
  ['cubierta', {}, PARTES_CUBIERTA],
  ['timon', {}, PARTES_TIMON], ['timon', { vista: 'tipos' }, TIPOS_TIMON], ['timon', { vista: 'cana', cana: 'babor' }, ['pala', 'cana']], ['timon', { vista: 'cana', cana: 'estribor' }, ['pala', 'rueda']],
  ['muerto-boya', {}, PARTES_MB],
  ['nudos', {}, []], ...NUDOS_PER.map((nudo) => ['nudos', { nudo }, []]),
  ['tenedero', { vista: 'elegir' }, FACTORES_TENEDERO], ['tenedero', { vista: 'fondos' }, FONDOS_TENEDERO],
  ['fondeo-gira', { vista: 'maniobra' }, PASOS_FONDEO], ['fondeo-gira', { vista: 'cadena' }, []],
  ['gobierno-rabeo', { vista: 'gobierno' }, ['gobierno', 'arrancada']], ['gobierno-rabeo', { vista: 'rabeo' }, []],
  ['atraque', { modo: 'costado', helice: 'dextrogira' }, []], ['atraque', { modo: 'costado', helice: 'levogira' }, []], ['atraque', { modo: 'punta' }, []], ['atraque', { modo: 'punta', viento: 'costado' }, []], ['atraque', { modo: 'abarloado' }, []], ['atraque', { modo: 'boya' }, []],
  ['revision-salida', { vista: 'resumen' }, RES_RESUMEN], ['revision-salida', { vista: 'motor' }, RES_MOTOR],
  ['reflector-tormenta', { vista: 'reflector' }, []], ['reflector-tormenta', { vista: 'tormenta' }, []],
  ['varada-abordaje', { vista: 'varada' }, RES_VARADA], ['varada-abordaje', { vista: 'abordaje' }, RES_ABORDAJE],
  ['achique-sentina', {}, PARTES_ACHIQUE],
  ['barometro-tendencia', { vista: 'instrumentos' }, ['mercurio', 'aneroide']], ['barometro-tendencia', { vista: 'tendencia' }, TEND],
  ['mar-crece', { vista: 'factores' }, PARTES_MAR], ['mar-crece', { vista: 'viento-fondo' }, []],
  ['prevision-salida', { vista: 'fuentes' }, PARTES_PREVISION], ['prevision-salida', { vista: 'decidir' }, []],
];
export const PILOTO_FINAL = VISTAS.flatMap(([tipo, base, partes]) => [{ tipo, ...base }, ...partes.map((resaltar) => ({ tipo, ...base, resaltar }))]);

const CSS = readFileSync(new URL('../styles/laminas.css', import.meta.url), 'utf8');
const vars = (b) => Object.fromEntries([...b.matchAll(/--(lc-[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const bloque = (desde) => { const i = CSS.indexOf(desde); return CSS.slice(i, CSS.indexOf('}', i)); };
const CLARO = vars(bloque(':root {'));
const OSCURO = vars(bloque(':root:not([data-theme="light"]) {'));
const svgDe = (s) => renderIllustration(s).svg;
const curso = JSON.parse(readFileSync(new URL('../data/curso/per.json', import.meta.url)));
const pasosPer = () => curso.modulos.flatMap((m) => m.lecciones.flatMap((l) => l.pasos.map((p) => ({ l, p }))));

test('cierre del PER: se dibujan, son specs válidas, sin NaN ni «<» o «&» sueltos', () => {
  for (const s of PILOTO_FINAL) {
    assert.ok(validSpec(s), JSON.stringify(s));
    const svg = svgDe(s);
    assert.ok(svg.includes('class="il lc'), `${JSON.stringify(s)}: no está en estilo C`);
    assert.ok(!/NaN|undefined|null|Infinity|__PT__/.test(svg), `${JSON.stringify(s)}: NaN, undefined o marcador sin sustituir`);
    assert.ok(!/<[\s\d=]|&(?![a-z]+;|#\d+;)/.test(svg), `${JSON.stringify(s)}: «<» o «&» sin escapar`);
  }
});

test('cierre del PER: ningún texto baja de 10,5 px efectivos a 360 px', () => {
  const malos = [];
  for (const s of PILOTO_FINAL) {
    const svg = svgDe(s);
    const [w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
    const escala = Math.min(328 / w, 430 / h);
    for (const t of svg.match(/<text\b[^>]*>/g) ?? []) {
      const fs = Number(t.match(/font-size="([\d.]+)"/)?.[1]);
      if (!(fs * escala >= 10.5)) malos.push(`${JSON.stringify(s)}: ${t.slice(0, 80)}`);
    }
    // ningún texto dentro de un grupo escalado (el tamaño efectivo no sería el que dice font-size)
    assert.ok(!/<g transform="[^"]*scale\([^"]*">(?:(?!<\/g>).)*<text/.test(svg.replace(/<g data-parte="[^"]*" transform="translate\([^)]*\) scale\([^)]*\)">/g, '')), `${JSON.stringify(s)}: texto escalado`);
  }
  assert.deepEqual(malos.slice(0, 10), []);
});

test('cierre del PER: solo colores --lc-*, con su versión oscura, y sin las clases del dibujo antiguo', () => {
  for (const s of PILOTO_FINAL) {
    const svg = svgDe(s);
    const fijo = svg.replace(/url\(#[^)]*\)/g, 'var(--lc-url)').match(/(?:fill|stroke|stop-color|color)="(?!none"|var\(--lc-)[^"]*"|(?:fill|stroke):\s*(?!var\(--lc-)[#a-z]/);
    assert.ok(!fijo, `${JSON.stringify(s)}: color fijo ${fijo?.[0]}`);
    assert.ok(!/class="il-|currentColor|var\(--l-|var\(--land|var\(--bg/.test(svg), `${JSON.stringify(s)}: restos del dibujo antiguo`);
    for (const v of new Set(svg.match(/var\(--[a-z0-9-]+\)/g))) {
      const k = v.slice(6, -1);
      if (k === 'lc-url') continue;
      assert.ok(k in CLARO && k in OSCURO, `${v} sin definir en claro y oscuro`);
    }
  }
});

test('cierre del PER: marco completo, sin emojis, y un título distinto por lámina', () => {
  const PICTO = /\p{Extended_Pictographic}/u;
  const titulos = new Map();
  for (const s of PILOTO_FINAL) {
    const m = marcoDe(s);
    assert.ok(m, `${JSON.stringify(s)} sin marco`);
    for (const k of ['tema', 'titulo', 'clave', 'nota', 'alt']) assert.ok(typeof m[k] === 'string' && m[k].trim().length > 2, `${JSON.stringify(s)}: falta ${k}`);
    assert.ok(m.alt.length >= 60 && (svgDe(s).match(/aria-label="([^"]*)"/)?.[1] ?? '').length >= 60, `${JSON.stringify(s)}: texto alternativo pobre`);
    assert.ok(m.datos?.length >= 1 && m.datos.length <= 3 && m.datos.every((d) => d.cifra && d.texto), `${JSON.stringify(s)}: datos`);
    assert.ok(/[.!?]$/.test(m.clave), `${JSON.stringify(s)}: la frase clave termina en punto`);
    assert.ok(![m.titulo, m.clave, m.nota, m.alt, ...m.datos.flatMap((d) => [d.cifra, d.texto])].some((t) => PICTO.test(t)) && !PICTO.test(svgDe(s)), `${JSON.stringify(s)}: emoji`);
    const id = idLamina({ ...s, resaltar: undefined });
    assert.ok(!titulos.has(m.titulo) || titulos.get(m.titulo) === id, `«${m.titulo}» repetido en ${id} y ${titulos.get(m.titulo)}`);
    titulos.set(m.titulo, id);
  }
});

test('cierre del PER: cada parte que se puede resaltar está dibujada y cambia el dibujo', () => {
  for (const [tipo, base, partes] of VISTAS) {
    const svg = svgDe({ tipo, ...base });
    for (const p of partes) {
      assert.ok(svg.includes(`data-parte="${p}"`), `${tipo} ${JSON.stringify(base)}: falta data-parte="${p}"`);
      assert.notEqual(svgDe({ tipo, ...base, resaltar: p }), svg, `${tipo}: resaltar ${p} no cambia nada`);
    }
  }
});

test('cierre del PER: siguen devolviendo null con una vista o una parte que no existen', () => {
  const nulas = [
    { tipo: 'muerto-boya', resaltar: 'ancla' }, { tipo: 'reflector-tormenta', vista: 'x' }, { tipo: 'gobierno-rabeo', vista: 'curva' },
    { tipo: 'achique-sentina', resaltar: 'helice' }, { tipo: 'barometro-tendencia', vista: 'instrumentos', resaltar: 'subida' },
    { tipo: 'mar-crece', resaltar: 'altura' }, { tipo: 'mar-crece', vista: 'otra' }, { tipo: 'mar-crece', vista: 'viento-fondo', resaltar: 'fetch' },
  ];
  for (const s of nulas) assert.equal(LAMINAS_LECCIONES[s.tipo].fn(s), null, JSON.stringify(s));
});

test('cierre del PER: los hechos de las láminas son los de su fuente', () => {
  // RD 339/2021, art. 20 (achique) y art. 12 (reflector de radar en todas las zonas, casco no metálico)
  const a = svgDe({ tipo: 'achique-sentina' });
  for (const t of ['RD 339/2021, art. 20', 'bomba de motor + manual + 2 baldes', 'bomba manual o eléctrica + 1 balde', '5 litros']) assert.ok(a.includes(t), t);
  const r = svgDe({ tipo: 'reflector-tormenta' });
  assert.ok(r.includes('RD 339/2021, art. 12') && r.includes('casco no es metálico'));
  assert.ok(svgDe({ tipo: 'reflector-tormenta', vista: 'tormenta' }).includes('desvío anómalo'));
  // Ley 14/2014, art. 186: comunicar de inmediato; declarar en las 24 horas hábiles siguientes a la llegada a puerto
  assert.match(svgDe({ tipo: 'varada-abordaje', vista: 'abordaje' }), /de inmediato; a declarar en las 24 h hábiles/);
  // lo no comprobado no se dibuja
  const fu = svgDe({ tipo: 'prevision-salida' });
  assert.ok(fu.includes('canal 16') && fu.includes('518 kHz') && fu.includes('490 kHz'));
  assert.ok(!/20 millas|canal 10|\(10, 74/.test(fu), 'el «hasta 20 millas» y los canales concretos no están comprobados');
  assert.ok(!/hPa en 3 h/.test(svgDe({ tipo: 'barometro-tendencia', vista: 'tendencia' })), 'sin umbral de bajada rápida');
  // barómetros (respuestas oficiales): 760 mm = 1013,25 hPa, fuerzas elásticas, cápsula con vacío, capilar en el de mercurio
  const b = svgDe({ tipo: 'barometro-tendencia' });
  for (const t of ['760', '1013,25 hPa', 'elásticas', 'con vacío', 'capilar']) assert.ok(b.includes(t), t);
  // timón con caña: la proa cae al lado contrario de la caña; hélice dextrógira: atrás, la popa a babor
  assert.match(renderIllustration({ tipo: 'timon', vista: 'cana', cana: 'babor' }).caption, /caña a babor → la pala va a estribor → la proa cae a estribor/);
  assert.ok(svgDe({ tipo: 'atraque', modo: 'costado', helice: 'dextrogira' }).includes('atraca por babor'));
  assert.ok(svgDe({ tipo: 'atraque', modo: 'costado', helice: 'levogira' }).includes('atraca por estribor'));
  // las partes del cabo y del amarre (RD 875/2014, anexo II, UT 2.1)
  const mb = svgDe({ tipo: 'muerto-boya' });
  for (const n of ['muerto', 'cadena', 'boya', 'gaza', 'firme', 'seno', 'chicote']) assert.ok(mb.includes(`>${n}<`), n);
});

test('cierre del PER: ninguna lámina de las clases del PER sin estilo C, sin marco o sin galería', () => {
  const { porId } = catalogoLaminas('per', PER, curso);
  const malas = [];
  for (const { l, p } of pasosPer()) {
    if (p.tipo !== 'ilustracion') continue;
    const svg = svgDe(p.spec);
    if (!/class="il lc/.test(svg)) malas.push(`${l.id} ${p.spec.tipo}: dibujo antiguo`);
    const m = marcoDe(p.spec);
    if (!m) { malas.push(`${l.id} ${JSON.stringify(p.spec)}: sin marco`); continue; }
    const lam = porId.get(idLamina(p.spec));
    if (!lam) malas.push(`${l.id} ${JSON.stringify(p.spec)}: fuera de la galería`);
    // socorro «solo» y sonido con «texto»: la galería las junta con la hoja o la señal general (anotado en ESTADO-per-cierre)
    else if (!['socorro', 'sonido'].includes(p.spec.tipo) && !lam.titulo.startsWith(m.titulo)) malas.push(`${l.id} ${JSON.stringify(p.spec)}: otro título en la galería`);
  }
  assert.deepEqual(malas, []);
});

test('cierre del PER: las láminas de este cierre tienen su fila en el apéndice de la guía', () => {
  const guia = readFileSync(new URL('../docs/ESTILO-LAMINAS.md', import.meta.url), 'utf8');
  const apendice = guia.slice(guia.indexOf('## Apéndice'));
  const sin = [...new Set(VISTAS.map(([t]) => t))].filter((t) => !apendice.includes(`\`${t}\``));
  assert.deepEqual(sin, [], 'tipos sin fila (con su `tipo`) en el apéndice');
});

test('cierre del PER: toda clase del PER tiene al menos una lámina', () => {
  const sin = curso.modulos.flatMap((m) => m.lecciones).filter((l) => !l.pasos.some((p) => p.tipo === 'ilustracion')).map((l) => l.id);
  assert.deepEqual(sin, []);
});

// ---------------------------------------------------------------------------
// Sanidad: la Guía Sanitaria a Bordo del ISM (2013), el examen de cada tribunal y la práctica actual, sin contradicciones.

const leccion = (id) => curso.modulos.flatMap((m) => m.lecciones).find((l) => l.id === id);
const textoDe = (id) => JSON.stringify(leccion(id));
const expl = (eje) => JSON.parse(readFileSync(new URL(`../data/ejes/${eje}/per/explicaciones.json`, import.meta.url)));

test('sanidad: el torniquete, como lo pide la Guía, como lo pregunta la DGMM y como se hace hoy', () => {
  const t = textoDe('per-8-1');
  assert.match(t, /aflojarlo cada 15 minutos/);
  assert.match(t, /dgmm-per-2021-04-75/);
  assert.match(t, /no aflojarlo salvo indicación médica/);
  assert.doesNotMatch(t, /consejo antiguo: hoy no se hace/, 'ya no se oculta la respuesta del examen');
  const d = expl('dgmm');
  assert.match(d['dgmm-per-2021-04-75'].explicacion, /Guía Sanitaria a Bordo/);
  assert.doesNotMatch(d['dgmm-per-2021-04-75'].explicacion, /sin aflojar, puede destruir/);
  assert.match(d['dgmm-per-2022-06-32'].explicacion, /15 minutos/);
  const c = JSON.parse(readFileSync(new URL('../data/conceptos/seguridad-legislacion.json', import.meta.url))).conceptos.find((x) => x.id === 'emergencia.auxilios.hemorragias-tratamiento');
  assert.match(c.nota, /Guía del ISM/);
});

test('sanidad: golpe de calor, nariz, tercer grado, radio y botiquín, con la cifra de la Guía', () => {
  const calor = textoDe('per-8-2');
  assert.match(calor, /38,5 °C/);
  assert.doesNotMatch(calor, /Es grave siempre/);
  assert.match(textoDe('per-8-1'), /cerca del hueso de la nariz/);
  const radio = textoDe('per-8-3');
  assert.doesNotMatch(radio, /\(en VHF, llamada por el canal 16\)/);
  assert.match(radio, /en español/);
  assert.doesNotMatch(radio, /Seguridad Social\)/);
  assert.doesNotMatch(radio, /muy recomendable/);
  assert.match(textoDe('per-8-9'), /ni café/);
  assert.match(expl('dgmm')['dgmm-per-2021-12-77'].explicacion, /39 °C/);
  assert.doesNotMatch(expl('dgmm')['dgmm-per-2021-02-75'].explicacion, /ni se limita a quien hable castellano/);
  assert.doesNotMatch(expl('baleares')['bal-per-2018-04-e-31'].explicacion, /en cualquier idioma/);
});

test('sanidad: la explicación de cada banco solo cita a su tribunal', () => {
  const OTROS = { andalucia: /DGMM|Baleares/, dgmm: /Andaluc|Baleares/, baleares: /Andaluc|DGMM/ };
  for (const eje of Object.keys(OTROS)) {
    const e = expl(eje);
    for (const [id, x] of Object.entries(e)) {
      if (!/torniquete|Guía Sanitaria|Radio.?Médico|golpe de calor|insolación|nasal/i.test(JSON.stringify(x))) continue;
      assert.doesNotMatch(`${x.explicacion} ${x.clave} ${x.trampa ?? ''}`, OTROS[eje], `${id} cita a otro tribunal`);
    }
  }
});

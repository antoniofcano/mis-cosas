import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGO, renderIllustration, validSpec } from '../src/illustrations/index.js';
import { BUOYS } from '../src/illustrations/buoys.js';
import { SHIPS } from '../src/illustrations/ships.js';
import { SENALES } from '../src/illustrations/situations.js';
import { parseRhythm } from '../src/illustrations/lights.js';

test('ritmos de luz: periodos y número de destellos', () => {
  const on = (r) => r.steps.filter((s) => s.on).length;
  assert.equal(on(parseRhythm('Fl(2) 5s')), 2); assert.equal(parseRhythm('Fl(2) 5s').period, 5);
  assert.equal(on(parseRhythm('Q(3) 10s')), 3);
  assert.equal(on(parseRhythm('Q(6)+LFl 15s')), 7);
  assert.equal(on(parseRhythm('Q(9) 15s')), 9);
  assert.equal(on(parseRhythm('Fl(2+1) R 10s')), 3);
  assert.equal(parseRhythm('Q').period, 1);
  for (const t of ['Fl R 4s', 'Iso 4s', 'Oc 6s', 'Oc(2) 8s', 'LFl 10s', 'Mo(A) 6s', 'Al.Bu/Y 3s', 'VQ(6)+LFl 10s', 'F']) {
    const r = parseRhythm(t);
    const total = r.steps.reduce((a, s) => a + s.d, 0);
    assert.ok(Math.abs(total - r.period) < 1e-6 && r.steps.every((s) => s.d >= 0), t);
  }
});

test('todo el catálogo se dibuja', () => {
  const specs = [
    ...Object.values(CATALOGO).map((c) => c.ejemplo),
    ...Object.keys(BUOYS).map((clase) => ({ tipo: 'boya', clase })),
    ...Object.keys(SHIPS).flatMap((clase) => ['proa', 'babor', 'estribor', 'popa', 'todas'].map((vista) => ({ tipo: 'buque', clase, vista, dia: true }))),
    ...Object.keys(SENALES).map((senal) => ({ tipo: 'sonido', senal })),
  ];
  for (const s of specs) {
    const r = renderIllustration(s);
    assert.ok(r?.svg?.startsWith('<svg') && !/NaN|undefined/.test(r.svg), JSON.stringify(s));
  }
  assert.equal(validSpec({ tipo: 'boya', clase: 'inventada' }), false);
});

test('ritmo de la cardinal Sur muy rápida: VQ(6)+LFl conserva el destello largo', async () => {
  const { parseRhythm } = await import('../src/illustrations/lights.js');
  const r = parseRhythm('VQ(6)+LFl 10s');
  assert.equal(r.period, 10);
  assert.equal(r.steps.filter((s) => s.on).length, 7);
  assert.equal(Math.max(...r.steps.filter((s) => s.on).map((s) => s.d)), 2);
});

test('láminas nuevas: todas sus variantes se dibujan', async () => {
  const { SOCORRO } = await import('../src/illustrations/socorro.js');
  const specs = [
    { tipo: 'socorro' }, ...Object.keys(SOCORRO).flatMap((resaltar) => [{ tipo: 'socorro', resaltar }, { tipo: 'socorro', resaltar, solo: true }]),
    ...['comparar', 'constante', 'variable'].map((caso) => ({ tipo: 'riesgo', caso })),
    ...['avante', 'atras'].flatMap((marcha) => ['er', 'br'].flatMap((timon) => ['dextrogira', 'levogira'].map((sentido) => ({ tipo: 'helice-timon', marcha, timon, sentido })))),
    { tipo: 'evolucion' }, { tipo: 'ciaboga' }, { tipo: 'desatraque', abrir: 'popa' }, { tipo: 'desatraque', abrir: 'proa' },
    ...['canal-principal-estribor', 'canal-principal-babor'].flatMap((marca) => ['principal', 'secundario'].map((ruta) => ({ tipo: 'bifurcacion', marca, ruta }))), { tipo: 'regiones' },
    ...['cenida', 'traves', 'aleta', 'popa'].map((rumbo) => ({ tipo: 'viento-aparente', rumbo })), { tipo: 'viento-aparente' },
    { tipo: 'beaufort' }, ...Array.from({ length: 13 }, (_, fuerza) => ({ tipo: 'beaufort', fuerza })), { tipo: 'marea', modo: 'fases' }, { tipo: 'demoras' },
    ...['draga', 'pesquero-aparejo'].flatMap((clase) => ['babor', 'estribor'].map((b) => ({ tipo: 'buque', clase, vista: 'todas', dia: true, obstruccion: b, aparejo: b, arrancada: false }))),
  ];
  for (const s of specs) {
    const r = renderIllustration(s);
    assert.ok(r?.svg?.startsWith('<svg') && !/NaN|undefined/.test(r.svg) && r.caption, JSON.stringify(s));
  }
  assert.equal(validSpec({ tipo: 'socorro', resaltar: 'alarma-radiotelefonica' }), false);
  assert.equal(validSpec({ tipo: 'viento-aparente', rumbo: 'inventado' }), false);
});

test('señales de peligro: solo las vigentes del Anexo IV', async () => {
  const { SOCORRO } = await import('../src/illustrations/socorro.js');
  const letras = Object.values(SOCORRO).map((s) => s.letra);
  for (const l of 'abcdefghijklmno') assert.ok(letras.includes(`1 ${l}`), `falta la 1 ${l}`);
  assert.ok(!Object.values(SOCORRO).some((s) => /alarma radiotele/i.test(s.nota)));
});

test('draga: dos rojas en la banda de la obstrucción y dos verdes en la otra (visto de proa)', () => {
  const svg = (obstruccion) => renderIllustration({ tipo: 'buque', clase: 'draga', vista: 'proa', obstruccion, arrancada: false }).svg;
  // de proa, la banda de babor del buque queda a nuestra derecha: con obstrucción a babor, las rojas a la derecha
  const xs = (s, color) => [...s.matchAll(new RegExp(`cx="([\\d.]+)" cy="[\\d.]+" r="4.6" fill="${color}"`, 'g'))].map((m) => +m[1]);
  const centro = 180; // lámina de 360 de ancho con una sola vista centrada
  assert.ok(xs(svg('babor'), '#22c55e').every((x) => x < centro));
  assert.ok(xs(svg('estribor'), '#22c55e').every((x) => x > centro));
});

test('hélice y timón: dextrógira atrás con timón a babor, la proa cae a estribor y suman', () => {
  const r = renderIllustration({ tipo: 'helice-timon', marcha: 'atras', timon: 'br', sentido: 'dextrogira' });
  assert.match(r.svg, /La proa cae a <b>estribor<\/b> con rapidez/);
  const a = renderIllustration({ tipo: 'helice-timon', marcha: 'avante', timon: 'er', sentido: 'dextrogira' });
  assert.match(a.svg, /La proa cae a <b>estribor<\/b>, algo más despacio/);
});

test('riesgo de abordaje: con demora constante las demoras sucesivas son iguales', () => {
  const dem = (caso) => renderIllustration({ tipo: 'riesgo', caso }).svg.match(/demoras: ([^<]+)/)[1].split(' · ');
  assert.equal(new Set(dem('constante')).size, 1);
  assert.equal(new Set(dem('variable')).size, 4);
});

// --- Láminas interactivas: mismas specs, tres modos ---------------------------------------------------------------
import { INTERACTIVAS, interactivaDe, pidePrediccion } from '../src/illustrations/interactivas.js';
import { controlador, MAX_MANDOS } from '../src/ui/lamina-estado.js';
import { ewTexto, marcacionBanda } from '../src/nautical/compass.js';
import { lucesVisibles, situacionPorLuces } from '../src/nautical/luces.js';
import { estabilidad as estabilidadCalc } from '../src/nautical/estabilidad.js';
import { readFileSync } from 'node:fs';

const leeJson = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
/** Todas las specs reales (lecciones y explicaciones) de un tipo. */
function specsReales(tipo) {
  const out = [];
  for (const c of ['per', 'py']) {
    for (const m of leeJson(`data/curso/${c}.json`).modulos) for (const l of m.lecciones) for (const p of l.pasos) if (p.tipo === 'ilustracion' && p.spec.tipo === tipo) out.push(p.spec);
    for (const e of Object.values(leeJson(`data/exams/andalucia-${c}-teoria-explicaciones.json`))) for (const s of e.ilustraciones ?? []) if (s.tipo === tipo) out.push(s);
  }
  return out;
}

test('láminas interactivas: specs válidas, como mucho tres mandos y lectura en texto', () => {
  for (const [tipo, def] of Object.entries(INTERACTIVAS)) {
    const specs = [CATALOGO[tipo].ejemplo, ...specsReales(tipo)];
    for (const spec of specs) {
      assert.ok(validSpec(spec), `${tipo} ${JSON.stringify(spec)}`);
      if (!interactivaDe(spec)) continue;
      for (const modo of ['clase', 'explicacion', 'galeria']) {
        const v = controlador(def, spec, modo).vista();
        assert.ok(v.mandos.length >= 1 && v.mandos.length <= MAX_MANDOS, `${tipo}: ${v.mandos.length} mandos`);
        const svg = v.svg ?? v.vistas.map((x) => x.svg).join('');
        assert.ok(svg.startsWith('<svg') && !/NaN|undefined/.test(svg), `${tipo} ${modo} ${JSON.stringify(spec)}`);
        assert.ok(v.lectura && !/NaN|undefined/.test(v.lectura), `${tipo}: lectura`);
      }
    }
  }
});

test('láminas interactivas: clase bloquea hasta responder, explicación abre en el estado de la pregunta, galería libre', () => {
  for (const [tipo, def] of Object.entries(INTERACTIVAS)) {
    const spec = specsReales(tipo).find((s) => pidePrediccion(s)) ?? CATALOGO[tipo].ejemplo;
    const primer = (c) => c.vista().mandos[0];

    // clase: predicción y mandos bloqueados
    const clase = controlador(def, spec, 'clase');
    assert.ok(pidePrediccion(spec));
    const v = clase.vista();
    assert.ok(v.prediccion && v.bloqueado && !clase.respondida, tipo);
    const m = primer(clase);
    const antes = clase.estado()[m.id];
    const otro = m.tipo === 'rango' ? (antes === m.max ? m.min : m.max) : m.opciones.find(([o]) => o !== antes)[0];
    assert.equal(clase.mover(m.id, otro), false, `${tipo}: no se mueve sin responder`);
    assert.equal(clase.estado()[m.id], antes);
    const k = Object.keys(v.prediccion.opciones).find((x) => x !== v.prediccion.correcta);
    assert.equal(clase.responder(k), false);
    assert.equal(clase.responder(v.prediccion.correcta), false, 'solo se responde una vez');
    assert.ok(!clase.vista().bloqueado && clase.respondida);
    assert.equal(clase.vista().prediccion.acierto, false);
    assert.ok(clase.mover(m.id, otro));
    assert.equal(clase.estado()[m.id], otro);

    // explicación: estado de la spec, sin predicción, mandos libres
    const expl = controlador(def, spec, 'explicacion');
    assert.deepEqual(expl.estado(), def.estado(spec));
    assert.equal(expl.vista().prediccion, null);
    assert.ok(!expl.vista().bloqueado && expl.mover(m.id, otro));

    // galería: libre
    const gal = controlador(def, CATALOGO[tipo].ejemplo, 'galeria');
    assert.equal(gal.vista().prediccion, null);
    assert.ok(gal.mover(m.id, otro));
  }
});

test('nortes y rosa: lo que se lee coincide con el cálculo', () => {
  const n = controlador(INTERACTIVAS.nortes, { tipo: 'nortes', dm: -4, desvio: 2 }, 'clase');
  const p = n.vista().prediccion;
  assert.match(p.enunciado, /4° W.*2° E/);
  assert.equal(p.opciones[p.correcta], 'Negativa');
  // antes de responder, la lámina no da la respuesta
  assert.doesNotMatch(n.vista().lectura + n.vista().svg, /negativa|−2°/);
  n.responder('b');
  assert.match(n.vista().lectura, /Ct = −4° \+ 2° = −2°, negativa/);
  const r = controlador(INTERACTIVAS.rosa, { tipo: 'rosa', rumbo: 30, demora: 120, marcacion: true, etiqueta: 'faro' }, 'clase');
  const pr = r.vista().prediccion;
  assert.match(pr.enunciado, /90° por estribor/);
  assert.equal(pr.opciones[pr.correcta], 'Baja'); // 120 − 50 = 70° Er
  // faro por babor: al caer a estribor su marcación sube
  const rb = controlador(INTERACTIVAS.rosa, { tipo: 'rosa', rumbo: 110, demora: 50, marcacion: true, etiqueta: 'faro' }, 'clase').vista().prediccion;
  assert.equal(rb.opciones[rb.correcta], 'Sube');
  // faro casi por la proa: se parte de un faro por el través para que la pregunta no sea ambigua
  const rp = controlador(INTERACTIVAS.rosa, { tipo: 'rosa', rumbo: 30, demora: 40, marcacion: true }, 'clase');
  assert.equal(rp.estado().demora, 120);
  // una rosa solo de rumbo (o solo de demora) tiene un único mando y no pide predicción
  const solo = controlador(INTERACTIVAS.rosa, { tipo: 'rosa', rumbo: 225 }, 'clase').vista();
  assert.deepEqual(solo.mandos.map((m) => m.id), ['rumbo']);
  assert.equal(solo.prediccion, null);
  assert.equal(pidePrediccion({ tipo: 'rosa', rumbo: 225 }), false);
  assert.deepEqual(controlador(INTERACTIVAS.rosa, { tipo: 'rosa', demora: 60, etiqueta: 'faro' }).vista().mandos.map((m) => m.id), ['demora']);
});

test('un solo dibujo por lámina: la imagen fija es el dibujo interactivo en su estado inicial', () => {
  for (const [tipo, def] of Object.entries(INTERACTIVAS)) {
    for (const spec of [CATALOGO[tipo].ejemplo, ...specsReales(tipo)]) {
      if (!interactivaDe(spec)) continue;
      const fija = renderIllustration(spec).svg;
      assert.equal(fija, controlador(def, spec, 'explicacion').vista().svg ?? controlador(def, spec, 'explicacion').vista().vistas.map((v) => v.svg).join(''), `${tipo} ${JSON.stringify(spec)}`);
    }
  }
});

/** Specs de las clases (donde hay predicción). */
function specsDeClase(tipo) {
  const out = [];
  for (const c of ['per', 'py']) for (const m of leeJson(`data/curso/${c}.json`).modulos) for (const l of m.lecciones) for (const p of l.pasos) if (p.tipo === 'ilustracion' && p.spec.tipo === tipo) out.push(p.spec);
  return out;
}
/** Para cada lámina: la respuesta que da por buena la predicción, deducida del estado con que se abre y de lo que pasa al mover. */
const ladoDeCorriente = (rc, rumbo) => { const d = ((rc - rumbo) % 360 + 540) % 360 - 180; return d === 0 || Math.abs(d) === 180 ? 'igual' : d > 0 ? 'estribor' : 'babor'; };
const COMPRUEBA = {
  estabilidad(c, p) {
    // subir peso: G sube, GM y GZ bajan → adriza peor
    const e = c.estado();
    const antes = estabilidadCalc({ altura: e.altura, traslado: e.traslado });
    const despues = estabilidadCalc({ altura: e.altura + 1, traslado: e.traslado });
    assert.ok(despues.GZ < antes.GZ);
    assert.equal(p.opciones[p.correcta], 'Peor');
  },
  'sectores-luces'(c, p) {
    // «una sola luz blanca»: solo desde el sector de alcance (por la popa)
    const solo = [0, 60, 112.5, 113, 180, 247, 247.5, 300].filter((a) => { const v = lucesVisibles(a); return v.alcance && !v.tope && !v.verde && !v.roja; });
    assert.ok(solo.length && solo.every((a) => a > 112.5 && a < 247.5));
    assert.equal(p.opciones[p.correcta], 'Por la popa');
  },
  cruce(c, p) {
    const v = lucesVisibles(c.estado().aspecto);
    assert.ok(v.alcance && !v.tope, 'la clase abre viendo solo una luz blanca');
    assert.equal(p.opciones[p.correcta], { tu: 'Tú', el: 'Él', 'los-dos': 'Los dos' }[situacionPorLuces(v).maniobra]);
  },
  abatimiento(c, p) {
    const e = c.estado();
    assert.ok(p.enunciado.includes(`Viento por ${e.banda}`), p.enunciado);
    assert.equal(p.opciones[p.correcta], e.ang === 0 ? 'Igual' : e.banda === 'babor' ? 'Mayor' : 'Menor');
  },
  corriente(c, p) {
    const e = c.estado();
    // Independiente del cálculo: el efectivo cae hacia donde va el agua; el rumbo a dar, hacia el lado contrario.
    const l = ladoDeCorriente(e.rc, e.rumbo);
    const esperado = e.modo === 'inversa' ? { estribor: 'A babor', babor: 'A estribor', igual: 'Igual que el del destino' }[l] : { estribor: 'A estribor', babor: 'A babor', igual: 'Igual que la proa' }[l];
    assert.equal(p.opciones[p.correcta], esperado, p.enunciado);
  },
  nortes(c, p) {
    const e = c.estado();
    const ct = e.dm + e.desvio;
    assert.equal(p.opciones[p.correcta], ct > 0 ? 'Positiva' : ct < 0 ? 'Negativa' : 'Cero');
    assert.ok(p.enunciado.includes(ewTexto(e.dm)) && p.enunciado.includes(ewTexto(e.desvio)), p.enunciado);
  },
  rosa(c, p) {
    const e = c.estado();
    const antes = marcacionBanda(e.demora, e.rumbo);
    assert.ok(p.enunciado.includes(`${antes.grados}° por ${antes.banda}`), p.enunciado);
    c.responder(p.correcta);
    c.mover('rumbo', (e.rumbo + 20) % 360);
    const despues = marcacionBanda(e.demora, c.estado().rumbo);
    assert.equal(despues.banda, antes.banda);
    assert.equal(p.opciones[p.correcta], despues.grados > antes.grados ? 'Sube' : despues.grados < antes.grados ? 'Baja' : 'No cambia');
  },
};

test('la predicción es coherente con el estado en que se abre la lámina (specs reales de las clases)', () => {
  for (const [tipo, def] of Object.entries(INTERACTIVAS)) {
    assert.ok(COMPRUEBA[tipo], `falta la comprobación de ${tipo}`);
    let n = 0;
    for (const spec of specsDeClase(tipo)) {
      if (!pidePrediccion(spec)) continue;
      const c = controlador(def, spec, 'clase');
      COMPRUEBA[tipo](c, c.vista().prediccion);
      n++;
    }
    assert.ok(n > 0, `${tipo}: ninguna clase con predicción`);
  }
});

test('modo explicación: «Volver al caso de la pregunta» restaura el estado de la spec', () => {
  for (const [tipo, def] of Object.entries(INTERACTIVAS)) {
    const spec = specsReales(tipo).find((s) => interactivaDe(s));
    const c = controlador(def, spec, 'explicacion');
    const m = c.vista().mandos[0];
    assert.equal(c.cambiado, false);
    c.mover(m.id, m.tipo === 'rango' ? (c.estado()[m.id] === m.max ? m.min : m.max) : m.opciones.find(([o]) => o !== c.estado()[m.id])[0]);
    assert.equal(c.cambiado, true);
    assert.ok(c.reiniciar());
    assert.deepEqual(c.estado(), def.estado(spec));
    assert.equal(c.cambiado, false);
  }
});

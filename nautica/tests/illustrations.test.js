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

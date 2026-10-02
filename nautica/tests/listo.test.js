// ¿Estoy listo? y repaso mezclado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PER, PY } from '../src/theory/blocks.js';
import { fallosBloque, probAprobar, estoyListo, lineaListo, aciertoPonderado, PESO_MODELO } from '../src/course/listo.js';
import { buildMezcla } from '../src/theory/engine.js';
import { planHoy } from '../src/course/plan.js';
import { createRng } from '../src/math/rng.js';

const banco = (E, porTema = 40) => E.bloques.flatMap((b) => Array.from({ length: porTema }, (_, i) => ({ id: `${b.ut}-${i}`, ut: b.ut, correcta: 'a' })));
/** Responde en cada tema `n` preguntas con un porcentaje de acierto (o uno por tema). */
function responder(qs, E, n, pct) {
  const r = {};
  for (const b of E.bloques) {
    const p = typeof pct === 'object' ? pct[b.ut] ?? pct.resto : pct;
    qs.filter((q) => q.ut === b.ut).slice(0, n).forEach((q, i) => { r[q.id] = { ok: i < Math.round(n * p), t: '2026-10-01T10:00:00Z' }; });
  }
  return r;
}

test('fallos de un bloque: suma 1 y se concentra según lo que aciertas', () => {
  const d = fallosBloque(5, 90, 10);
  assert.ok(Math.abs(d.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  assert.ok(d[0] > d[3]);
  const sinDatos = fallosBloque(4, 0, 0); // Beta(1,1): uniforme en el número de fallos
  assert.ok(sinDatos.every((p) => Math.abs(p - 0.2) < 1e-9));
});

test('probabilidad de aprobar con las reglas reales', () => {
  const perfecto = PER.bloques.map((b) => [1, ...Array(b.n).fill(0)]);
  assert.ok(Math.abs(probAprobar(PER, perfecto) - 1) < 1e-12);
  // un solo bloque con límite que se pasa seguro → suspenso aunque el resto sea perfecto
  const carta = PER.bloques.map((b) => (b.ut === 11 ? [0, 0, 0, 1, 0] : [1, ...Array(b.n).fill(0)]));
  assert.equal(probAprobar(PER, carta), 0);
  // 13 fallos repartidos sin tocar límites aprueba justo (45 − 32 = 13); 14 no
  const fallos = (k) => PER.bloques.map((b) => { const d = Array(b.n + 1).fill(0); d[k[b.ut] ?? 0] = 1; return d; });
  assert.equal(probAprobar(PER, fallos({ 1: 3, 2: 2, 3: 3, 4: 2, 7: 2, 9: 1 })), 1);
  assert.equal(probAprobar(PER, fallos({ 1: 3, 2: 2, 3: 3, 4: 2, 7: 2, 9: 2 })), 0);
});

test('estoy listo: sin datos, buen alumno, tema que tumba', () => {
  const qs = banco(PER);
  assert.equal(estoyListo(PER, qs, {}).estado, 'faltan-datos');
  assert.match(lineaListo(estoyListo(PER, qs, {})), /al menos 10 preguntas/);
  const bueno = estoyListo(PER, qs, responder(qs, PER, 30, 0.95));
  assert.equal(bueno.estado, 'listo');
  assert.ok(bueno.prob > 0.9);
  // aciertas 95 % en todo menos Carta (55 %): es Carta lo que te tumba
  const flojoCarta = estoyListo(PER, qs, responder(qs, PER, 30, { 11: 0.55, resto: 0.95 }));
  assert.equal(flojoCarta.limitante.ut, 11);
  assert.ok(flojoCarta.prob < bueno.prob);
  assert.match(lineaListo(flojoCarta), /Carta de navegación \(aciertas el 5[37] %, y solo se pueden fallar 2 de 4\)/);
  // Yate a la mitad: no aprueba
  const qy = banco(PY);
  assert.equal(estoyListo(PY, qy, responder(qy, PY, 30, 0.5)).estado, 'aun-no');
});

test('repaso mezclado: varios temas por turnos, más peso a los fallos y solo de lo empezado', () => {
  const qs = banco(PER);
  const r = responder(qs, PER, 10, 0.5);
  const m = buildMezcla(qs, [1, 5, 6], createRng(7), { respuestas: r, limite: 10 });
  assert.equal(m.preguntas.length, 10);
  assert.ok(m.preguntas.every((q) => [1, 5, 6].includes(q.ut)));
  assert.equal(new Set(m.preguntas.map((q) => q.id)).size, 10);
  for (let i = 1; i < m.preguntas.length; i++) assert.notEqual(m.preguntas[i].ut, m.preguntas[i - 1].ut, 'no salen dos seguidas del mismo tema');
  // las falladas pesan más que las acertadas y que las no vistas
  let falladas = 0;
  for (let s = 1; s <= 30; s++) falladas += buildMezcla(qs, [1, 5, 6], createRng(s), { respuestas: r, limite: 6 }).preguntas.filter((q) => r[q.id] && !r[q.id].ok).length;
  assert.ok(falladas / (30 * 6) > 0.5, `falladas ${falladas}`);
});

test('plan: el repaso mezclado aparece detrás de lo principal y una vez al día', () => {
  const qs = banco(PER);
  const respuestas = Object.fromEntries([...qs.filter((q) => q.ut === 1).slice(0, 5), ...qs.filter((q) => q.ut === 5).slice(0, 5)].map((q) => [q.id, { ok: true }]));
  const ahora = new Date(2026, 9, 2, 10).getTime();
  const p = planHoy({ estructura: PER, preguntas: qs, respuestas, ahora });
  assert.notEqual(p[0].tipo, 'mezclado');
  assert.ok(p.some((x) => x.tipo === 'mezclado'));
  const hecho = planHoy({ estructura: PER, preguntas: qs, respuestas, ahora, ultimoMezclado: new Date(ahora).toLocaleDateString('sv-SE') });
  assert.ok(!hecho.some((x) => x.tipo === 'mezclado'));
});

import { compilarVocabulario, segmentar } from '../src/theory/vocabulario.js';
test('vocabulario: palabra completa, sin distinguir mayúsculas, la primera vez y la forma más larga', () => {
  const voc = compilarVocabulario([
    { id: 'amura', termino: 'Amura', formas: ['amura', 'amuras'], definicion: 'x' },
    { id: 'marea-viva', termino: 'Marea viva', formas: ['marea viva', 'mareas vivas'], definicion: 'y' },
    { id: 'marea', termino: 'Marea', formas: ['marea'], definicion: 'z' },
    { id: 'lsd', termino: 'LSD', formas: ['LSD'], definicion: 'w' },
  ]);
  const t = (s, u) => segmentar(s, voc, u).filter((x) => x.tipo === 'termino').map((x) => `${x.id}:${x.texto}`);
  assert.deepEqual(t('Por la Amura de babor y la otra amura'), ['amura:Amura']);
  assert.deepEqual(t('En mareas vivas la marea sube más'), ['marea-viva:mareas vivas', 'marea:marea']);
  assert.deepEqual(t('amurado no es amura'), ['amura:amura']); // «amurado» no
  assert.deepEqual(t('equipo con LSD.'), ['lsd:LSD']);
  const usados = new Set();
  assert.deepEqual(t('la amura', usados), ['amura:amura']);
  assert.deepEqual(t('otra amura', usados), []); // ya marcada en el enunciado
  assert.equal(segmentar('Hola', voc).map((x) => x.texto).join(''), 'Hola');
  assert.equal(segmentar('Por la Amura de babor', voc).map((x) => x.texto).join(''), 'Por la Amura de babor');
});

test('vocabulario: los términos básicos no se subrayan salvo que se pida', () => {
  const lista = [{ id: 'proa', termino: 'Proa', formas: ['proa'], definicion: 'x', basico: true }, { id: 'amura', termino: 'Amura', formas: ['amura'], definicion: 'y' }];
  const marcados = (voc) => segmentar('proa y amura', voc).filter((x) => x.tipo === 'termino').map((x) => x.id);
  assert.deepEqual(marcados(compilarVocabulario(lista)), ['amura']);
  assert.deepEqual(marcados(compilarVocabulario(lista, { basicos: true })), ['proa', 'amura']);
});

import { readFileSync } from 'node:fs';
test('vocabulario publicado: ids únicos, definiciones breves y cada forma aparece en su banco', () => {
  const lee = (f) => JSON.parse(readFileSync(new URL(`../data/exams/${f}`, import.meta.url)));
  const textos = (qs) => qs.map((q) => `${q.enunciado} ${Object.values(q.opciones ?? {}).join(' ')}`);
  const bancos = {
    per: textos([...lee('andalucia-per-teoria.json').preguntas, ...lee('andalucia-per.json').preguntas]),
    py: textos(lee('andalucia-py-teoria.json').preguntas),
  };
  for (const tit of ['per', 'py']) {
    const { terminos } = lee(`vocabulario-${tit}.json`);
    assert.ok(terminos.length > 100, tit);
    const ids = new Set();
    for (const t of terminos) {
      assert.ok(!ids.has(t.id), `${tit}: id repetido ${t.id}`);
      ids.add(t.id);
      const palabras = t.definicion.split(/\s+/).length;
      assert.ok(t.termino && palabras >= 8 && palabras <= 45, `${tit} ${t.id}: ${palabras} palabras`);
      const voc = compilarVocabulario([t], { basicos: true });
      for (const f of t.formas) {
        const solo = compilarVocabulario([{ ...t, formas: [f] }], { basicos: true });
        assert.ok(bancos[tit].some((s) => segmentar(s, solo).some((x) => x.tipo === 'termino')), `${tit} ${t.id}: «${f}» no aparece en el banco`);
      }
      assert.ok(voc.re, t.id);
    }
  }
});

import { delata } from '../src/theory/vocabulario.js';
test('vocabulario: no se subraya lo que delataría la respuesta', () => {
  const imbornal = { id: 'imbornal', termino: 'Imbornal', formas: ['imbornal', 'imbornales'], definicion: 'Orificio en el costado, a la altura de la cubierta, por el que sale al mar el agua que embarca.' };
  assert.equal(delata(imbornal, 'Imbornales'), true); // es la propia respuesta
  const amura = { id: 'amura', termino: 'Amura', formas: ['amura'], definicion: 'Parte del costado cerca de la proa, a cada banda.' };
  assert.equal(delata(amura, 'La parte delantera del costado, junto a la proa'), true); // comparte «costado»
  assert.equal(delata(amura, 'Hacia popa'), false);
});

test('¿Estás listo?: una pregunta repetida cuenta mitad el primer intento y mitad el último', () => {
  assert.equal(aciertoPonderado({ ok: true }), 1); // datos antiguos, sin n: como antes
  assert.equal(aciertoPonderado({ ok: true, n: 1, ok1: true }), 1);
  assert.equal(aciertoPonderado({ ok: true, n: 3, ok1: false }), 0.5); // la fallaste y luego la aprendiste
  assert.equal(aciertoPonderado({ ok: false, n: 2, ok1: false }), 0);
  // Mismo número de aciertos «últimos», pero acertados tras fallar: la probabilidad baja.
  const qs = banco(PER);
  const deEntrada = responder(qs, PER, 30, 0.9);
  const aprendidas = Object.fromEntries(Object.entries(deEntrada).map(([id, r]) => [id, { ...r, n: 2, ok1: false }]));
  assert.ok(estoyListo(PER, qs, aprendidas).prob < estoyListo(PER, qs, deEntrada).prob);
});

test('¿Estás listo?: los simulacros completos recientes corrigen el resultado y lo dice', () => {
  const qs = banco(PER);
  const r = responder(qs, PER, 30, 0.95);
  const sin = estoyListo(PER, qs, r);
  const suspensos = [1, 2, 3].map(() => ({ tipo: 'simulacro', apto: false, aciertos: 28, total: 45 }));
  const con = estoyListo(PER, qs, r, [...suspensos, { tipo: 'bloque', apto: null }]);
  assert.equal(con.simulacros.hechos, 3); // el test de bloque (sin apto) no cuenta
  assert.ok(Math.abs(con.prob - (PESO_MODELO * sin.probModelo) / (PESO_MODELO + 3)) < 1e-12);
  assert.ok(con.prob < sin.prob);
  assert.match(lineaListo(con), /últimos 3 simulacros aprobaste 0/);
  assert.match(lineaListo(sin), /Haz un simulacro completo/);
});

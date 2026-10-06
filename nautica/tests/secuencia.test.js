// Secuencia del contenido: en una clase nunca se pregunta lo que aún no se ha explicado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cubierta, textoDePaso } from '../src/course/engine.js';

const leer = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url)));
const { revisadas } = leer('data/curso/revisadas.json');

test('las preguntas de cada clase solo usan lo explicado antes (o están revisadas a mano)', () => {
  const sinRevisar = [];
  const usadas = new Set();
  for (const tit of ['per', 'py']) {
    for (const m of leer(`data/curso/${tit}.json`).modulos) for (const l of m.lecciones) {
      let visto = '';
      for (const p of l.pasos) {
        if (p.tipo === 'check' && !cubierta(p, visto)) {
          const k = `${l.id} · ${p.enunciado}`;
          if (revisadas[k]) usadas.add(k); else sinRevisar.push(k);
        }
        visto += ` ${textoDePaso(p)}`;
      }
    }
  }
  assert.deepEqual(sinRevisar, [], 'revisa que la clase explica antes lo que preguntan y apúntalas en data/curso/revisadas.json');
  // Sin entradas huérfanas: si una pregunta cambia o ya pasa la comprobación, su entrada sobra.
  const sobran = Object.keys(revisadas).filter((k) => !usadas.has(k));
  assert.deepEqual(sobran, [], 'entradas de revisadas.json que ya no hacen falta');
});

test('toda clase del PY enlaza su «Base del PER», y los enlaces llevan a clases que existen', () => {
  const per = new Set(leer('data/curso/per.json').modulos.flatMap((m) => m.lecciones.map((l) => l.id)));
  for (const l of leer('data/curso/py.json').modulos.flatMap((m) => m.lecciones)) {
    assert.ok(l.refresco?.length, `${l.id} sin Base del PER`);
    for (const id of l.refresco) assert.ok(per.has(id), `${l.id} → ${id} no existe`);
  }
});

test('la lámina de la clase 1 solo nombra lo que la clase ya ha explicado', async () => {
  const { renderIllustration } = await import('../src/illustrations/index.js');
  const l = leer('data/curso/per.json').modulos[0].lecciones[0];
  for (const p of l.pasos.filter((x) => x.tipo === 'ilustracion' && x.spec.tipo === 'barco')) {
    const { svg } = renderIllustration(p.spec);
    for (const no of ['eslora', 'manga', 'obra viva', 'calado', 'francobordo', 'puntal']) assert.ok(!svg.includes(`>${no}<`), `${no} en la lámina de ${l.id}`);
  }
});

test('PER: al menos una lámina interactiva en cada tema (predice, manipula, explica)', async () => {
  const { interactivaDe } = await import('../src/illustrations/interactivas.js');
  for (const m of leer('data/curso/per.json').modulos) {
    const n = m.lecciones.flatMap((l) => l.pasos).filter((p) => p.tipo === 'ilustracion' && interactivaDe(p.spec)).length;
    assert.ok(n >= 1, `UT${m.ut} ${m.titulo}: ninguna lámina interactiva`);
  }
});

test('PY: cada clase de carta (tema 4) tiene su lámina interactiva', async () => {
  const { interactivaDe } = await import('../src/illustrations/interactivas.js');
  const m = leer('data/curso/py.json').modulos.find((x) => x.ut === 4);
  for (const l of m.lecciones) assert.ok(l.pasos.some((p) => p.tipo === 'ilustracion' && interactivaDe(p.spec)), `${l.id} ${l.titulo}: sin lámina interactiva`);
});

test('plantillas discutibles: la opción que defiende la nota no se llama «trampa» y la nota va arriba', async () => {
  const { narrateTheory, esDefendible } = await import('../src/teacher/theory.js');
  for (const t of ['per', 'py']) {
    const B = leer(`data/exams/andalucia-${t}-teoria.json`).preguntas;
    const E0 = leer(`data/exams/andalucia-${t}-teoria-explicaciones.json`); const E = E0.explicaciones ?? E0;
    for (const [id, e] of Object.entries(E)) {
      if (!e.defendible) continue;
      const q = B.find((x) => x.id === id);
      assert.ok(q && e.discrepancia && e.defendible !== q.correcta && q.opciones[e.defendible], `${id}: defendible mal puesta`);
      assert.ok(esDefendible(q, e, e.defendible));
      const d = narrateTheory(q, e, e.defendible).display;
      assert.match(d[0], /defendible/); assert.doesNotMatch(d[0], /trampa/); assert.match(d[1], /^📝/);
    }
  }
});

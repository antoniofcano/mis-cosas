import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Las fuentes que enseña la app son solo oficiales o institucionales: nada de academias, escuelas, foros ni blogs.
const OFICIALES = ['boe.es', 'armada.defensa.gob.es', 'aemet.es', 'salvamentomaritimo.es', 'fao.org', 'ilsf.org', 'unican.es', 'wikipedia.org',
  'cervantesvirtual.com', 'imo.org', 'iala-aism.org', 'puertos.es', 'mitma.gob.es', 'transportes.gob.es', 'juntadeandalucia.es'];

test('las reglas para recordar solo citan fuentes oficiales', () => {
  const { reglas } = JSON.parse(readFileSync(new URL('../data/exams/mnemotecnias.json', import.meta.url), 'utf8'));
  for (const r of reglas) {
    for (const u of r.fuentes ?? []) {
      const host = new URL(u).hostname.replace(/^www\./, '');
      assert.ok(OFICIALES.some((o) => host === o || host.endsWith(`.${o}`)), `${r.id}: fuente no oficial ${host}`);
    }
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { datosPodcast, preguntasEnPausas, textoIndice, idEpisodio, piezasGuion, audioAlDia } from '../tools/podcast.mjs';

const leer = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('data/podcast-<tit>.json y las líneas de tiempo están al día (si falla: npm run podcast)', () => {
  const { indice, lineas } = datosPodcast();
  for (const tit of ['py', 'per']) assert.equal(leer(`data/podcast-${tit}.json`), textoIndice(indice[tit]), tit);
  for (const [p, t] of Object.entries(lineas)) assert.deepEqual(JSON.parse(leer(p)), t, p);
});

// Episodios con audio cuyo guion se corrigió después de grabarlo (podcast/REVISION-PER.md, R-09): hasta regenerar su audio,
// la línea de tiempo es la de la grabación antigua y sus pausas no tienen por qué llevar las preguntas nuevas del minijuego.
// La lista solo puede menguar: al regenerar un episodio (podcast/audio.py), se quita de aquí.
const PENDIENTES_DE_REGENERAR = new Set([]);

test('cada episodio con audio tiene su guion, su línea de tiempo y las preguntas del minijuego en sus pausas', () => {
  const E = JSON.parse(leer('podcast/episodios.json'));
  for (const tit of ['py', 'per']) {
    for (const t of JSON.parse(leer(`data/podcast-${tit}.json`)).temas) {
      for (const e of t.episodios) {
        if (!e.audio) continue;
        const x = E[tit].find((y) => y.n === e.n);
        assert.ok(x.archivo && existsSync(new URL(`../podcast/${x.archivo}`, import.meta.url)), `${e.id}: sin guion`);
        assert.ok(e.duracion > 300 && e.duracion < 1200, `${e.id}: duración rara ${e.duracion}`);
        const linea = JSON.parse(leer(`data/podcast/${e.id}.json`));
        assert.ok(linea.tramos.every((y, i) => i === 0 || y.t >= linea.tramos[i - 1].t), `${e.id}: tiempos desordenados`);
        const alDia = audioAlDia(leer(`podcast/${x.archivo}`), linea.tramos);
        if (PENDIENTES_DE_REGENERAR.has(e.id)) {
          assert.ok(!alDia, `${e.id}: su audio ya sigue al guion; quítalo de PENDIENTES_DE_REGENERAR`);
          continue;
        }
        assert.ok(alDia, `${e.id}: el guion ha cambiado y el audio no (regenéralo con podcast/audio.py)`);
        const enPausas = linea.tramos.filter((y) => y.p).map((y) => y.p);
        // Las preguntas del minijuego, en orden, en las pausas (la bienvenida no tiene minijuego de examen).
        if (e.tipo !== 'bienvenida') assert.deepEqual(enPausas, e.preguntas, `${e.id}: preguntas del minijuego`);
      }
    }
  }
});

test('piezasGuion lee el guion como podcast/audio.py', () => {
  const md = '---\nserie: x\n---\n\n# Título\n\n> nota\n\n---\n\n**ELENA:** Hola. [ríe] Primera [pausa] pregunta.\n\n[pausa larga]\n\n**ANDRÉS:** La a.\n';
  assert.deepEqual(piezasGuion(md), [{ q: 'ELENA', x: 'Hola. Primera … pregunta.' }, { pausa: true }, { q: 'ANDRÉS', x: 'La a.' }]);
  assert.ok(audioAlDia(md, [{ t: 0, q: 'E', x: 'Hola. Primera … pregunta.' }, { t: 1, pausa: true }, { t: 2, q: 'A', x: 'La a.' }]));
  assert.ok(!audioAlDia(md, [{ t: 0, q: 'E', x: 'Hola. Primera … pregunta.' }, { t: 1, pausa: true }, { t: 2, q: 'A', x: 'La be.' }]));
});

test('preguntasEnPausas: la pregunta va en la pausa que sigue a su enunciado', () => {
  const banco = new Map([['q1', { enunciado: 'El centro de carena es el punto donde se aplica' }], ['q2', { enunciado: 'Cuando un buque se encuentra en equilibrio indiferente' }]]);
  const tramos = [{ t: 0, q: 'E', x: 'Hola' }, { t: 1, q: 'E', x: 'Primera: el centro de carena es el punto donde se aplica…' }, { t: 2, pausa: true },
    { t: 3, q: 'A', x: 'La a.' }, { t: 4, q: 'E', x: 'Y cuando un buque se encuentra en equilibrio indiferente…' }, { t: 5, pausa: true }, { t: 6, pausa: true }];
  assert.deepEqual(preguntasEnPausas(tramos, ['q1', 'q2'], banco).filter((x) => x.pausa).map((x) => x.p ?? null), ['q1', 'q2', null]);
  assert.equal(idEpisodio('py', '1.0'), 'py-1-0');
  assert.equal(idEpisodio('py', '0'), 'py-0');
});

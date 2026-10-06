// Textos con número y fechas: una sola función para cada cosa (src/texto.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cuenta, plural, fechaLarga } from '../src/texto.js';

const raiz = new URL('../', import.meta.url).pathname;
const ficheros = (d) => readdirSync(join(raiz, d)).flatMap((f) => (statSync(join(raiz, d, f)).isDirectory() ? ficheros(join(d, f)) : f.endsWith('.js') ? [join(d, f)] : []));
const codigo = ['src/ui', 'src/course', 'src/theory', 'src/store'].flatMap(ficheros);

test('cuenta y plural', () => {
  assert.equal(cuenta(1, 'pregunta'), '1 pregunta');
  assert.equal(cuenta(0, 'pregunta'), '0 preguntas');
  assert.equal(cuenta(3, 'error'), '3 errores');
  assert.equal(cuenta(1, 'pregunta hecha', 'preguntas hechas'), '1 pregunta hecha');
  assert.equal(cuenta(4.5, 'hora'), '4,5 horas');
  assert.equal(plural('vez'), 'veces');
  assert.throws(() => cuenta(2, 'pregunta hecha'));
});

test('fechas: siempre día de la semana, día y mes', () => {
  assert.equal(fechaLarga('2026-10-04', { ahora: Date.UTC(2026, 0, 1) }), 'domingo, 4 de octubre');
  assert.match(fechaLarga('2027-01-02', { ahora: Date.UTC(2026, 0, 1) }), /2027/);
});

test('ningún texto con número hecho a mano: todos pasan por cuenta()', () => {
  const NOMBRES = 'preguntas?|clases?|minutos?|tramos?|d[ií]as|tarjetas|temas|pasos|horas|fallos|aciertos|respondidas|episodios|conceptos|errores|simulacros|l[aá]minas|tandas|semanas';
  const re = new RegExp(`\\$\\{[^{}\`]+\\} (${NOMBRES})\\b`);
  const mal = codigo.filter((f) => !/views\/(titulacion|chuleta)\.js$/.test(f))
    .flatMap((f) => readFileSync(join(raiz, f), 'utf8').split('\n').map((l, i) => [f, i + 1, l]).filter(([, , l]) => re.test(l)))
    .map(([f, n, l]) => `${f}:${n} ${l.trim().slice(0, 90)}`);
  assert.deepEqual(mal, []);
});

test('ninguna fecha para el alumno se formatea fuera de fechaLarga()', () => {
  const mal = codigo.filter((f) => /toLocaleDateString\('es|weekday:/.test(readFileSync(join(raiz, f), 'utf8')));
  assert.deepEqual(mal, []);
});

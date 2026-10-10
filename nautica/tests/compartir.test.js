// «Compartir mi parte» (src/ui/compartir.js): el texto (breve, sin nada personal, singular y plural), la vía (menú de
// compartir, copiar o nada), la cancelación y que sin ninguna API no hay botón.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { textoParte, viaCompartir, compartirParte, botonCompartir, URL_APP } from '../src/ui/compartir.js';
import { RANGOS } from '../src/course/travesia.js';

const PICTO = /\p{Extended_Pictographic}/u;
const base = { titulacion: 'Patrón de Embarcaciones de Recreo', rango: 'Marinero', faros: { encendidos: 2, total: 6 }, racha: 3, minutosHoy: 25 };

test('el texto: rango, faros, racha, minutos de hoy y la dirección pública', () => {
  const t = textoParte(base);
  assert.equal(t.url, URL_APP);
  assert.equal(URL_APP, 'https://antoniofcano.github.io/mis-cosas/nautica/');
  assert.match(t.texto, /Patrón de Embarcaciones de Recreo/);
  assert.match(t.texto, /soy Marinero/);
  assert.match(t.texto, /2 de 6 faros encendidos/);
  assert.match(t.texto, /3 días seguidos/);
  assert.match(t.texto, /25 minutos/);
  assert.ok(!t.texto.includes(URL_APP), 'la dirección va aparte para el menú de compartir');
  assert.ok(t.completo.endsWith(URL_APP), 'y al copiar, al final');
  assert.ok(t.completo.length < 320, 'breve');
});

test('cada rango sale tal cual', () => {
  for (const r of RANGOS) assert.match(textoParte({ ...base, rango: r.nombre }).texto, new RegExp(`soy ${r.nombre}\\b`));
});

test('singular y plural, y lo que vale cero no se dice', () => {
  assert.match(textoParte({ ...base, faros: { encendidos: 1, total: 6 } }).texto, /1 de 6 faros encendido\b/);
  assert.match(textoParte({ ...base, faros: { encendidos: 0, total: 3 } }).texto, /3 faros por encender/);
  assert.match(textoParte({ ...base, minutosHoy: 1 }).texto, /1 minuto\./);
  assert.match(textoParte({ ...base, racha: 2 }).texto, /2 días seguidos/);
  const uno = textoParte({ ...base, racha: 1 }).texto;
  assert.doesNotMatch(uno, /seguid/, 'un solo día no es racha');
  assert.match(uno, /Hoy he estudiado 25 minutos\./);
  const nada = textoParte({ ...base, racha: 0, minutosHoy: 0 }).texto;
  assert.doesNotMatch(nada, /minuto|seguid/);
  assert.match(textoParte({ ...base, minutosHoy: 0 }).texto, /Llevo 3 días seguidos estudiando\./);
  assert.doesNotMatch(textoParte({ ...base, rango: '', faros: null }).texto, /travesía/, 'sin travesía no se habla de ella');
  assert.match(textoParte({ ...base, faros: { encendidos: 9, total: 6 } }).texto, /6 de 6/, 'nunca más que el total');
});

test('sin datos prohibidos: ni nombre, ni código de alumno, ni enlace de vinculación, ni emojis', () => {
  // Aunque lleguen por error, la función solo usa lo que conoce.
  const t = textoParte({ ...base, nombre: 'Lola Pérez', alumno: 'ALU-7731', codigo: 'X9Z-22', enlace: 'https://ejemplo.invalid/#vincular=secreto', email: 'a@b.c' });
  for (const malo of ['Lola', 'ALU-7731', 'X9Z-22', 'vincular', 'secreto', '@']) assert.ok(!t.completo.includes(malo), malo);
  assert.equal((t.completo.match(/https?:\/\//g) ?? []).length, 1, 'una sola dirección: la pública');
  for (const r of RANGOS) assert.doesNotMatch(textoParte({ ...base, rango: r.nombre }).completo, PICTO);
  // Ni en el código del módulo.
  assert.doesNotMatch(readFileSync(new URL('../src/ui/compartir.js', import.meta.url), 'utf8'), PICTO);
});

test('la vía: menú de compartir, copiar o ninguna', () => {
  assert.equal(viaCompartir({ share: async () => {}, clipboard: { writeText: async () => {} } }), 'share');
  assert.equal(viaCompartir({ clipboard: { writeText: async () => {} } }), 'copiar');
  assert.equal(viaCompartir({}), null);
  assert.equal(viaCompartir({ clipboard: {} }), null);
  assert.equal(viaCompartir(undefined), null);
});

test('compartir con el menú del sistema: título, texto y enlace', async () => {
  const llamadas = [];
  const r = await compartirParte(textoParte(base), { share: async (d) => { llamadas.push(d); } });
  assert.equal(r, 'compartido');
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, URL_APP);
  assert.match(llamadas[0].text, /Marinero/);
  assert.ok(llamadas[0].title);
});

test('cancelar el menú no es un error y no copia nada', async () => {
  let copiado = null;
  const abort = Object.assign(new Error('cancelado'), { name: 'AbortError' });
  const r = await compartirParte(textoParte(base), { share: async () => { throw abort; }, clipboard: { writeText: async (x) => { copiado = x; } } });
  assert.equal(r, 'cancelado');
  assert.equal(copiado, null);
});

test('si el menú falla por otra causa, se copia; sin portapapeles, «error» sin lanzar', async () => {
  let copiado = null;
  const fallo = Object.assign(new Error('no'), { name: 'NotAllowedError' });
  assert.equal(await compartirParte(textoParte(base), { share: async () => { throw fallo; }, clipboard: { writeText: async (x) => { copiado = x; } } }), 'copiado');
  assert.ok(copiado.endsWith(URL_APP));
  assert.equal(await compartirParte(textoParte(base), { share: async () => { throw fallo; } }), 'error');
});

test('copiar al portapapeles: texto y dirección; si falla, «error» sin lanzar', async () => {
  let copiado = null;
  assert.equal(await compartirParte(textoParte(base), { clipboard: { writeText: async (x) => { copiado = x; } } }), 'copiado');
  assert.equal(copiado, textoParte(base).completo);
  assert.equal(await compartirParte(textoParte(base), { clipboard: { writeText: async () => { throw new Error('denegado'); } } }), 'error');
  assert.equal(await compartirParte(textoParte(base), {}), 'error');
});

test('sin ninguna de las dos APIs el botón no aparece', () => {
  assert.equal(botonCompartir(() => base, { nav: {} }), null);
  assert.equal(botonCompartir(() => base, { nav: undefined }), null);
});

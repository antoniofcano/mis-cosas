// Lector de opciones (src/exams/options.js): los formatos con que los tribunales escriben las respuestas de carta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOption, chooseOption } from '../src/exams/options.js';

const cerca = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg}: ${a} ≠ ${b}`);
const lee = (texto, kinds, esperado) => {
  const v = parseOption(texto, kinds);
  assert.ok(v, `no lee «${texto}»`);
  esperado.forEach((e, i) => cerca(v[i], e, `«${texto}» [${i}]`));
};
const gm = (g, m) => g + m / 60;

test('signos: «(-)», «(+)», «(menos)», sueltos y babor/estribor', () => {
  lee('2º (-)', ['signed'], [-2]);
  lee('2º(-)', ['signed'], [-2]);
  lee('2º (+)', ['signed'], [2]);
  lee('7º (−)', ['signed'], [-7]);
  lee('–12º (menos)', ['signed'], [-12]);
  lee('+5º (más)', ['signed'], [5]);
  lee('Ct = 8º +', ['signed'], [8]);
  lee('- 9º', ['signed'], [-9]);
  lee('4º 40′ NW', ['signed'], [-gm(4, 40)]);
  lee('20 grados babor', ['signed'], [-20]);
  lee('20 grados estribor', ['signed'], [20]);
  lee("CT= 0º08' W", ['signed'], [-gm(0, 8)]); // grados y minutos con E/W
  lee("CT= 0º48' E", ['signed'], [gm(0, 48)]);
  lee("CT= 1º28' E", ['signed'], [gm(1, 28)]);
});

test('rumbos y demoras por su nombre, sin leer las aclaraciones entre paréntesis', () => {
  lee('Demora: Ev (Este verdadero) d: 12,0 millas.', ['bearing', 'distance'], [90, 12]);
  lee('Demora: 275º d: 12,0 millas.', ['bearing', 'distance'], [275, 12]);
  lee('Ra = 101,8º (Rv 100º)', ['bearing'], [101.8]);
});

test('latitudes y longitudes en los formatos de los cuadernillos', () => {
  lee("35º 53,9' N; 005º 32,2' W", ['lat', 'lon'], [gm(35, 53.9), -gm(5, 32.2)]);
  lee("35° 59'5 N 005° 27'9 W.", ['lat', 'lon'], [gm(35, 59.5), -gm(5, 27.9)]); // décima tras el apóstrofo
  lee("l= 35º 50'1 N; L= 006º 00'7 W.", ['lat', 'lon'], [gm(35, 50.1), -gm(6, 0.7)]);
  lee('5º 25’2 W', ['lon'], [-gm(5, 25.2)]);
  lee("l 36º 10',8 N y L 006º 8',4 W", ['lat', 'lon'], [gm(36, 10.8), -gm(6, 8.4)]); // apóstrofo y coma
  lee("l= 35ª 57,4' N y L= 005º 25' W", ['lat', 'lon'], [gm(35, 57.4), -gm(5, 25)]); // «ª» por «º»
  lee("36º-07,0' N Lo= 05-11,5' W", ['lat', 'lon'], [gm(36, 7), -gm(5, 11.5)]); // guion entre grados y minutos
  lee('l = 35º 57\u00922 N; L= 005º 40\u00923 W', ['lat', 'lon'], [gm(35, 57.2), -gm(5, 40.3)]); // U+0092
  lee("longitud estimada= 005º 24,0º' W", ['lon'], [-gm(5, 24)]); // errata «º'» tras los minutos
  lee('lo = 36º 00,6´N L = 05º 27,8¨W', ['lat', 'lon'], [gm(36, 0.6), -gm(5, 27.8)]); // diéresis como apóstrofo
});

test('horas: «21h 34m», «21:34», «13.45» y sin separador «0924»', () => {
  lee('HRB = 21h 34m', ['clock'], [21 * 60 + 34]);
  lee('Hrb= 13.45', ['clock'], [13 * 60 + 45]);
  lee('HRB=0924', ['clock'], [9 * 60 + 24]);
  lee('HRB=0927.', ['clock'], [9 * 60 + 27]); // con punto final
  lee('HRB= 2133.', ['clock'], [21 * 60 + 33]);
  lee('HRB= 1407 y d= 2,8 millas.', ['clock', 'distance'], [14 * 60 + 7, 2.8]);
});

test('chooseOption no elige ninguna por defecto, y avisa de empates y de opciones repetidas', () => {
  const ilegibles = chooseOption({ a: 'Ninguna', b: 'A ninguna hora' }, [{ kind: 'bearing', value: 10 }]);
  assert.equal(ilegibles.choice, null);
  const empate = chooseOption({ a: '3º', b: '3º+', c: '20º-' }, [{ kind: 'signed', value: 3 }]);
  assert.deepEqual([empate.choice, ...empate.empate].sort(), ['a', 'b']);
  const repetida = chooseOption({ a: 'Ref = 054º, 5,73 nudos', b: 'Ref = 054º, 11,45 nudos', c: 'Ref = 054º, 11,45 nudos.' },
    [{ kind: 'bearing', value: 54 }, { kind: 'speed', value: 11.4 }]);
  assert.equal(repetida.choice, 'b');
  assert.deepEqual(repetida.repetidas, ['c']);
  assert.deepEqual(repetida.empate, []);
});

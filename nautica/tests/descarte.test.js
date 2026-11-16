// Estimar y descartar (R-57, src/course/descarte.js): cada regla, por todas las preguntas reales del estudio (PER y PY;
// nunca las reservadas del examen final), sin descartar jamás la respuesta oficial; y la lectura de los datos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGLAS_DESCARTE, descartes, coordenadas, primerRumbo, primeraHora, rumboCorriente, intensidadCorriente, velocidadBarco, pistaEstimar } from '../src/course/descarte.js';
import { bancosNode, EJE_POR_DEFECTO } from '../tools/bancos/leer.mjs';

const BANCOS = { per: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'per'), py: await bancosNode().cargarBanco(EJE_POR_DEFECTO, 'py') };
const aceptadas = (q) => (q.aceptadas?.length ? q.aceptadas : [q.correcta]);

/** Por regla: en cuántas preguntas reales se aplica, en cuántas descarta algo y cuántas opciones. */
const cuentas = Object.fromEntries(REGLAS_DESCARTE.map((r) => [r.id, { aplica: 0, descarta: 0, opciones: 0 }]));

for (const r of REGLAS_DESCARTE) {
  test(`regla «${r.nombre}»: nunca descarta la respuesta oficial en ninguna pregunta real del estudio`, () => {
    for (const [tit, b] of Object.entries(BANCOS)) {
      for (const q of b.estudio) {
        assert.ok(!b.reservadas.has(q.id), `${q.id} es reservada`);
        const x = r.aplicar(q);
        if (!x) continue;
        cuentas[r.id].aplica += 1;
        if (x.descartadas.length) { cuentas[r.id].descarta += 1; cuentas[r.id].opciones += x.descartadas.length; }
        assert.ok(x.cota && typeof x.cota === 'string', `${q.id}: cada regla dice su cota con los números`);
        if (q.anulada) continue;
        for (const d of x.descartadas) {
          assert.ok(!aceptadas(q).includes(d.letra), `${tit} ${q.id}: «${r.id}» descarta la oficial ${d.letra} (${d.porque}; ${x.cota})`);
          assert.ok(d.porque, `${q.id}: cada opción descartada dice por qué`);
        }
      }
    }
    // Cada regla se justifica con preguntas de verdad: alguna la usa.
    assert.ok(cuentas[r.id].aplica >= 1, `${r.id} no se aplica a ninguna pregunta real`);
  });
}

test('en conjunto: muchas preguntas reales con algo que descartar, nunca la oficial y nunca todas las opciones', () => {
  let con = 0;
  let total = 0;
  for (const b of Object.values(BANCOS)) {
    for (const q of b.estudio) {
      total += 1;
      const x = descartes(q);
      if (!x) continue;
      con += 1;
      assert.ok(x.quedan.length >= 1);
      if (!q.anulada) for (const l of aceptadas(q)) assert.ok(x.quedan.includes(l), `${q.id}: la oficial ${l} debe quedar`);
      assert.deepEqual([...x.descartadas, ...x.quedan].sort(), Object.keys(q.opciones).sort());
    }
  }
  assert.ok(con >= 40, `solo ${con} preguntas con descarte`);
  assert.ok(total > 2000);
  // Las que más se aplican: las mareas, el cuadrante, la distancia entre puntos y lo que da tiempo a navegar.
  for (const id of ['marea-sonda', 'cuadrante', 'distancia-puntos', 'alcance']) assert.ok(cuentas[id].descarta >= 5, `${id}: ${JSON.stringify(cuentas[id])}`);
});

test('lectura de coordenadas: formatos del banco, hemisferios y meridiano 180°', () => {
  assert.deepEqual(coordenadas('situación 36º 04,0′ N, 006º 00,0′ W').map((p) => [p.lat.toFixed(4), p.lon.toFixed(4)]), [['36.0667', '-6.0000']]);
  assert.equal(coordenadas('l = 35º-53,0’ N, L = 005º-46,0’ W y l=35º50´N-L=06º50´W').length, 2);
  assert.equal(coordenadas('12º 20\'S, 177º 20\' W hasta 09º 10\' S, 178º 15\' E')[1].lon, 178.25);
  // Una declinación («3º NW») no es una coordenada.
  assert.deepEqual(coordenadas('Declinación magnética = 3º NW y desvío = +8º'), []);
});

test('rumbos, horas, corriente y velocidad', () => {
  assert.equal(primerRumbo('Rv= 260º'), 260);
  assert.equal(primerRumbo('145,5º'), 145.5);
  assert.equal(primerRumbo('S46,6ºW'), 226.6);
  assert.equal(primerRumbo('N 002º W'), 358);
  assert.equal(primerRumbo('N54W, 322 millas'), 306);
  assert.equal(primerRumbo('Ct = +6'), null, 'sin grados escritos no se adivina');
  assert.equal(primeraHora('09:40'), 580);
  assert.equal(primeraHora('HRB = 18h 00m'), 1080);
  assert.equal(rumboCorriente('corriente de Rc = NW e Ihc = 3′'), 315);
  assert.equal(rumboCorriente('Rc = 050º e Ih = 4′'), 50);
  assert.equal(rumboCorriente('corriente de dirección norte'), 0);
  assert.equal(intensidadCorriente('intensidad horaria = 3 millas'), 3);
  assert.equal(velocidadBarco('Navegamos a 6 nudos al rumbo de aguja 240º'), 6);
  assert.equal(velocidadBarco('velocidad del buque = 8 nudos'), 8);
});

test('ejemplos: la sonda imposible y el rumbo que no va a su cuadrante', () => {
  const marea = { id: 'x', opciones: { a: '2,88', b: '3,67', c: '5,01', d: '7,92' }, correcta: 'c',
    enunciado: 'Calcular la sonda en metros que tendremos a la hora oficial 17:58 del 04 de abril de 2024, en un bajo señalado en la carta con 1,82 metros. Adelanto vigente: +2 horas.',
    tabla_mareas: [{ dia: 4, hora: '02:11', altura_m: 0.8 }, { dia: 4, hora: '08:11', altura_m: 3.3 }, { dia: 4, hora: '14:33', altura_m: 0.7 }, { dia: 4, hora: '20:33', altura_m: 3.4 }] };
  const x = descartes(marea);
  assert.deepEqual(x.descartadas, ['d']);
  assert.match(x.reglas[0].cota, /entre 2,52 y 5,22 m/);
  const rumbo = { id: 'y', opciones: { a: 'Rv= 260º', b: 'Rv= 280º', c: 'Rv=100º', d: 'Rv= 080º' }, correcta: 'b',
    enunciado: 'En situación l= 36º-00,0´N L= 006º-20,0´W, Vhb= 6 nudos, ponemos rumbo a un punto de l= 36º-15,0´N L= 008º-00,0´W. Calcular el Rv.' };
  assert.deepEqual(descartes(rumbo).quedan, ['b']);
  // Sin datos suficientes en el enunciado, nada.
  assert.equal(descartes({ id: 'z', enunciado: 'Calcular la corrección total.', opciones: { a: '+6º', b: '–4º' }, correcta: 'a' }), null);
});

test('la pista general de estimar no mira la pregunta: vale para un examen en marcha', () => {
  assert.match(pistaEstimar('marea-sonda'), /bajamar/);
  assert.match(pistaEstimar('teoria'), /en blanco también cuenta como fallo/);
});

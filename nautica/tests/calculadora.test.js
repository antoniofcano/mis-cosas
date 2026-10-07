// Calculadora científica (src/calculadora/motor.js): prioridad de operaciones, sexagesimal, trigonometría en grados,
// errores, Ans encadenado y memoria, con las mismas teclas que la calculadora del examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoInicial, pulsar, pulsarTodas, pantalla, evaluar, formatoNumero, aSexagesimal, deSexagesimal, textoSexagesimal,
  textoExpresion, senoG, cosenoG, tangenteG, restaurar, guardable, teclaDeTeclado, MATH_ERROR, SYNTAX_ERROR, MAX_TECLAS,
} from '../src/calculadora/motor.js';
import { calculadoraPermitida } from '../src/calculadora/reglas.js';

/** Teclea una cadena: cifras y signos sueltos; las teclas con nombre entre corchetes: «[sin]30)=». */
const teclas = (s) => s.match(/\[[^\]]+\]|./g).map((t) => (t.startsWith('[') ? t.slice(1, -1) : t));
const tras = (s, e = estadoInicial()) => pulsarTodas(e, teclas(s));
const abajo = (s, e) => pantalla(tras(s, e)).abajo;
const cerca = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);

test('prioridad: × ÷ antes que + −, paréntesis, signo y x² como la calculadora', () => {
  assert.equal(abajo('2+3×4='), '14');
  assert.equal(abajo('(2+3)×4='), '20');
  assert.equal(abajo('10-4-3='), '3');
  assert.equal(abajo('8÷4÷2='), '1');
  assert.equal(abajo('2+3×4÷2-1='), '7');
  // (−)2² = −4: el cuadrado va antes que el signo
  assert.equal(abajo('[neg]2[sq]='), '−4');
  assert.equal(abajo('([neg]2)[sq]='), '4');
  // Multiplicación implícita antes que × ÷: 1÷2π = 1÷(2π)
  assert.equal(abajo('1÷2[pi]='), formatoNumero(1 / (2 * Math.PI)));
  assert.equal(abajo('2(3+4)='), '14');
  assert.equal(abajo('2[sin]30)='), '1');
  // Los paréntesis que faltan se cierran solos al pulsar =
  assert.equal(abajo('(2+3×(1+1='), '8');
  assert.equal(abajo('[sqrt]16='), '4');
  assert.equal(abajo('4[inv]='), '0.25');
  assert.equal(abajo('[pi]='), '3.141592654');
  // Un − donde se espera un número es el signo
  assert.equal(abajo('5×-3='), '−15');
  assert.equal(abajo('-5+2='), '−3');
});

test('formato de la pantalla: 10 cifras, punto decimal, sin «−0» y notación científica en los extremos', () => {
  assert.equal(formatoNumero(0.1 + 0.2), '0.3');
  assert.equal(formatoNumero(-0), '0');
  assert.equal(formatoNumero(2 / 3), '0.6666666667');
  assert.equal(formatoNumero(1234567.891234), '1234567.891');
  assert.equal(formatoNumero(123456789012), '1.23456789×10¹¹');
  assert.equal(formatoNumero(-0.5), '−0.5');
  assert.equal(abajo('0.1+0.2='), '0.3');
});

test('trigonometría en grados (DEG), exacta en los ángulos notables', () => {
  assert.equal(abajo('[sin]30='), '0.5');
  assert.equal(abajo('[cos]60='), '0.5');
  assert.equal(abajo('[cos]90='), '0');
  assert.equal(abajo('[sin]180='), '0');
  assert.equal(abajo('[tan]45='), '1');
  assert.equal(abajo('[tan]135='), '−1');
  assert.equal(abajo('[cos]20.13='), formatoNumero(Math.cos(20.13 * Math.PI / 180)));
  assert.equal(senoG(-30), -0.5);
  assert.equal(cosenoG(360), 1);
  assert.equal(tangenteG(-45), -1);
  // Ángulo sexagesimal dentro de una función: 30°0′ → sin = 0,5 (decimal, no sexagesimal)
  const e = tras('[sin]30[gms]0[gms])=');
  assert.equal(pantalla(e).abajo, '0.5');
  assert.equal(e.sexa, false);
});

test('inversas con SHIFT: devuelven grados', () => {
  assert.equal(abajo('[shift][sin]0.5='), '30');
  assert.equal(abajo('[shift][cos]0.5='), '60');
  assert.equal(abajo('[shift][tan]1='), '45');
  assert.equal(abajo('[shift][tan][neg]1='), '−45');
  assert.equal(abajo('[shift][sin][neg]1='), '−90');
  assert.equal(abajo('[shift][cos][neg]1='), '180');
  // Rumbo de la estima inversa: tan R = A / Δl = 367,5 / 305 → 50,3°
  cerca(tras('[shift][tan]367.5÷305=').resultado, 50.3, 0.05);
  // SHIFT se gasta en una tecla: la siguiente vuelve a ser normal
  const e = tras('[shift]');
  assert.equal(pantalla(e).indicadores.shift, true);
  assert.equal(pantalla(pulsar(e, '5')).indicadores.shift, false);
  assert.equal(abajo('[asin]1='), '90');
});

test('dominio de las inversas y demás errores: «Math ERROR»; lo que no se entiende: «Syntax ERROR»', () => {
  for (const s of ['[shift][sin]1.0001=', '[shift][sin][neg]2=', '[shift][cos]1.5=', '1÷0=', '[sqrt][neg]4=', '0[inv]=', '[tan]90=', '[tan]270=', '[tan][neg]90=']) {
    assert.equal(abajo(s), MATH_ERROR, s);
  }
  // En el límite exacto no hay error aunque la cuenta interna dé 1,0000000000000002
  assert.equal(abajo('[shift][sin](0.1+0.2)÷0.3='), '90');
  for (const s of ['5+=', '×3=', '2+3)=', '1..2=', '[gms]5=', '1[gms]2[gms]3[gms]4=', ')=']) {
    assert.equal(abajo(s), SYNTAX_ERROR, s);
  }
  // Tras un error: AC limpia; DEL vuelve a la expresión para corregirla; Ans no cambia
  const e = tras('7=1÷0=');
  assert.equal(e.ans, 7);
  const d = pulsar(e, 'del');
  assert.equal(d.error, null);
  assert.equal(pantalla(d).arriba, '1÷0');
  assert.equal(pantalla(pulsarTodas(d, ['del', '2', '='])).abajo, '0.5');
  assert.equal(pantalla(pulsar(e, 'ac')).abajo, '0');
  // Una cifra tras el error empieza de nuevo
  assert.equal(abajo('3=', e), '3');
});

test('sexagesimal: 12°30′ → 12,5 con °′″ y vuelta', () => {
  const e = tras('12[gms]30[gms]=');
  assert.equal(pantalla(e).arriba, '12°30′');
  assert.equal(pantalla(e).abajo, '12°30′0″');
  const dec = pulsar(e, 'gms');
  assert.equal(pantalla(dec).abajo, '12.5');
  assert.equal(pantalla(pulsar(dec, 'gms')).abajo, '12°30′0″');
  // SHIFT °′″ (←): siempre a decimal
  assert.equal(pantalla(pulsarTodas(e, ['shift', 'gms'])).abajo, '12.5');
  // Un decimal pasado a sexagesimal con la misma tecla
  assert.equal(pantalla(tras('12.5=[gms]')).abajo, '12°30′0″');
  assert.equal(pantalla(tras('36.0867=[gms]')).abajo, '36°5′12.12″');
  // Grados, minutos y segundos; y minutos de más de 60, como la calculadora
  cerca(tras('10[gms]20[gms]30[gms]=').resultado, 10 + 20 / 60 + 30 / 3600);
  assert.equal(pantalla(tras('12[gms]75[gms]=')).abajo, '13°15′0″');
  // Minutos con decimales (36°05,2′ de una latitud)
  assert.equal(pantalla(tras('36[gms]5.2[gms]=')).abajo, '36°5′12″');
  assert.equal(pantalla(tras('36[gms]5.2[gms]=[gms]')).abajo, '36.08666667');
});

test('sexagesimal: sumar, restar y multiplicar dan el resultado en sexagesimal', () => {
  assert.equal(abajo('12[gms]45[gms]+3[gms]30[gms]='), '16°15′0″');
  assert.equal(abajo('36[gms]10[gms]-2[gms]50[gms]='), '33°20′0″');
  assert.equal(abajo('2[gms]20[gms]×3='), '7°0′0″');
  // Declinación del año: −2°50′ + 19 × 7′ = −0°37′
  assert.equal(abajo('[neg]2[gms]50[gms]+19×0[gms]7[gms]='), '−0°37′0″');
  // Horas: 22 h 40 min + 3 h 35 min = 26 h 15 min (la calculadora no da la vuelta a las 24 h)
  assert.equal(abajo('22[gms]40[gms]+3[gms]35[gms]='), '26°15′0″');
  // Tiempo = d / V en horas, pasado a h, min, s con la misma tecla: 12,7 / 8 = 1,5875 h = 1 h 35 min 15 s
  assert.equal(abajo('12.7÷8=[gms]'), '1°35′15″');
  // Restar horas: 02:10 − 22:40 = −20 h 30 min (cruzar medianoche: se suma 24 h)
  assert.equal(abajo('2[gms]10[gms]-22[gms]40[gms]+24='), '3°30′0″');
});

test('sexagesimal: ángulos negativos y redondeo de los segundos con acarreo', () => {
  assert.equal(textoSexagesimal(-12.5), '−12°30′0″');
  assert.equal(textoSexagesimal(-0.125), '−0°7′30″');
  assert.deepEqual(aSexagesimal(12.999999999), { signo: 1, g: 13, m: 0, s: 0 });
  assert.deepEqual(aSexagesimal(12 + 59 / 60 + 59.996 / 3600), { signo: 1, g: 13, m: 0, s: 0 });
  assert.deepEqual(aSexagesimal(12 + 29 / 60 + 59.994 / 3600), { signo: 1, g: 12, m: 29, s: 59.99 });
  assert.deepEqual(aSexagesimal(-0.0000001), { signo: 1, g: 0, m: 0, s: 0 }); // nunca «−0°0′0″»
  assert.equal(deSexagesimal(-5, 36, 30), -(5 + 36 / 60 + 30 / 3600));
  assert.equal(deSexagesimal(0, 36, 0, -1), -0.6);
  // (−) delante de un valor sexagesimal: el signo es de todo el valor
  const e = tras('[neg]5[gms]36[gms]30[gms]=');
  cerca(e.resultado, -(5 + 36 / 60 + 30 / 3600));
  assert.equal(pantalla(e).abajo, '−5°36′30″');
  // Ida y vuelta de muchos valores: decimal → sexagesimal → decimal, dentro de medio centésimo de segundo
  for (let x = -400; x <= 400; x += 7.31) {
    const { signo, g, m, s } = aSexagesimal(x);
    cerca(deSexagesimal(g, m, s, signo), x, 0.005 / 3600 + 1e-12);
  }
});

test('Ans: tras «=», una operación sigue desde Ans y «=» repite la cuenta (Ans encadenado)', () => {
  let e = tras('5=');
  e = tras('×2=', e);
  assert.equal(pantalla(e).arriba, 'Ans×2');
  assert.equal(pantalla(e).abajo, '10');
  e = pulsar(e, '=');
  assert.equal(pantalla(e).abajo, '20');
  e = pulsar(e, '=');
  assert.equal(pantalla(e).abajo, '40');
  assert.equal(e.ans, 40);
  // Una cifra tras el resultado empieza una cuenta nueva (Ans se conserva para usarlo con la tecla)
  e = tras('3+[ans]=', e);
  assert.equal(pantalla(e).abajo, '43');
  // x² y x⁻¹ también siguen desde Ans
  assert.equal(abajo('[sq]=', tras('3=')), '9');
  assert.equal(abajo('[inv]=', tras('4=')), '0.25');
  // Cadena de la estima: Δl = D·cos R y luego lm con Ans
  e = tras('10[cos]60)=');
  assert.equal(pantalla(e).abajo, '5');
  assert.equal(abajo('÷2+36=', e), '38.5');
});

test('memoria: M+, M−, MR y borrar M (SHIFT MR)', () => {
  let e = tras('3+4[m+]');
  assert.equal(pantalla(e).abajo, '7'); // M+ calcula la cuenta
  assert.equal(e.m, 7);
  assert.equal(pantalla(e).indicadores.m, true);
  e = tras('2[m+]', e);
  assert.equal(e.m, 9);
  e = tras('5[shift][m+]', e); // SHIFT M+ = M−
  assert.equal(e.m, 4);
  e = tras('1[m-]', e);
  assert.equal(e.m, 3);
  assert.equal(abajo('[mr]×10=', e), '30');
  e = tras('10=[m+]', e); // con un resultado en pantalla, M+ lo suma tal cual
  assert.equal(e.m, 13);
  e = tras('[shift][mr]', e);
  assert.equal(e.m, 0);
  assert.equal(pantalla(e).indicadores.m, false);
  // AC no borra la memoria ni Ans
  e = tras('8[m+][ac]');
  assert.equal(e.m, 8);
  assert.equal(e.ans, 8);
});

test('DEL, AC, línea de arriba y límite de teclas', () => {
  assert.equal(textoExpresion(['1', '2', 'gms', '3', '0', 'gms', '1', '5', 'gms']), '12°30′15″');
  assert.equal(textoExpresion(['asin', '0', '.', '5', ')']), 'sin⁻¹(0.5)');
  assert.equal(textoExpresion(['neg', '2', 'sq', '-', 'ans', '×', 'mr', 'inv']), '(−)2²−Ans×M⁻¹');
  let e = tras('123');
  e = pulsar(e, 'del');
  assert.equal(pantalla(e).arriba, '12');
  assert.equal(pantalla(estadoInicial()).abajo, '0');
  e = tras('5+5=');
  e = pulsar(e, 'del'); // tras el resultado, DEL vuelve a la expresión y borra la última tecla
  assert.equal(pantalla(e).arriba, '5+');
  let largo = estadoInicial();
  for (let i = 0; i < MAX_TECLAS + 20; i++) largo = pulsar(largo, '1');
  assert.equal(largo.tokens.length, MAX_TECLAS);
  const e0 = estadoInicial();
  assert.equal(pulsar(e0, 'tecla-inventada'), e0);
});

test('guardar y recuperar: memoria, Ans y la cuenta; teclas raras fuera', () => {
  const e = tras('2[gms]30[gms]+1[m+]');
  const g = JSON.parse(JSON.stringify(guardable(e)));
  const r = restaurar(g);
  assert.equal(r.m, e.m);
  assert.equal(r.ans, e.ans);
  assert.equal(pantalla(r).arriba, '2°30′+1');
  assert.deepEqual(restaurar({ tokens: ['1', '<script>', '+'], ans: 'x' }).tokens, ['1', '+']);
  assert.equal(restaurar({ ans: 'x' }).ans, 0);
});

test('teclado físico', () => {
  const k = (key) => teclaDeTeclado({ key });
  assert.equal(k('7'), '7');
  assert.equal(k('*'), '×');
  assert.equal(k('/'), '÷');
  assert.equal(k('Enter'), '=');
  assert.equal(k('Backspace'), 'del');
  assert.equal(k('Escape'), 'ac');
  assert.equal(k(','), '.');
  assert.equal(k('S'), 'asin');
  assert.equal(k('°'), 'gms');
  assert.equal(k('F5'), null);
});

test('evaluar directamente, con Ans y M', () => {
  assert.deepEqual(evaluar(['ans', '+', 'mr'], { ans: 2, m: 3 }), { valor: 5, gms: false });
  assert.deepEqual(evaluar([]), { error: SYNTAX_ERROR });
  assert.equal(evaluar(['9', 'sq', 'sq', 'sq', 'sq', 'sq', 'sq', 'sq']).error, MATH_ERROR); // desbordamiento
});

test('dónde se permite la calculadora en un examen: la ficha del eje manda; si no dice nada, PY sí y PER no', () => {
  assert.equal(calculadoraPermitida('py', null), true);
  assert.equal(calculadoraPermitida('per', null), false);
  assert.equal(calculadoraPermitida('per', { examen: { per: {} } }), false);
  assert.equal(calculadoraPermitida('per', { examen: { per: { calculadora: true } } }), true);
  assert.equal(calculadoraPermitida('py', { examen: { py: { calculadora: false } } }), false);
  assert.equal(calculadoraPermitida('xx', null), false);
});

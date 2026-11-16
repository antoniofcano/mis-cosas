// Paso a paso que enseña (R-71): el primer paso «¿qué tipo es?», la ayuda por escalones y el ejemplo resuelto seguido de
// otro con huecos. Sobre preguntas reales del banco de práctica (nunca las reservadas: docs/CUARENTENA.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createKit } from '../src/exams/kit.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { pasosGuiados, resumenGuiado } from '../src/exams/guiado.js';
import { TIPOS, PISTAS, REGLAS, preguntaDeTipo, delator, escalones, cuentaSinResultado, ejemplosDelTipo, pasosRellenos, textoAyudas, resumenAyudas } from '../src/exams/ensena.js';
import { NOMBRES_TIPO, tipoDePregunta } from '../src/course/velocidad.js';
import { PASOS, ERRORES } from '../src/exams/taxonomia.js';
import { quantity } from '../src/analysis/quantities.js';
import { bancosNode, ejes, titsDeEje } from '../tools/bancos/leer.mjs';
import { chart } from './helpers.js';

const B = bancosNode();
const bancos = [];
const practica = [];
for (const eje of ejes()) {
  for (const tit of titsDeEje(eje.id ?? eje)) {
    const banco = await B.cargarBanco(eje.id ?? eje, tit);
    bancos.push(banco);
    for (const q of banco.practica) if (SOLUCIONES[q.id] && !banco.reservadas.has(q.id)) practica.push(q);
  }
}
const porId = new Map(practica.map((q) => [q.id, q]));
const MAREAS = 'and-py-2020-c1-n19';
const pasosDe = (id) => { const k = createKit(chart); SOLUCIONES[id].solve(k, porId.get(id)); return pasosGuiados(k.steps); };
const conPasos = (q) => { try { const k = createKit(chart); SOLUCIONES[q.id].solve(k, q); return k.steps.some((s) => s.pide); } catch { return false; } };

test('¿qué tipo es?: el tipo de la pregunta y tres de los que se le parecen, siempre en el mismo orden', () => {
  const q = porId.get(MAREAS);
  const t = preguntaDeTipo(q, tipoDePregunta(q, SOLUCIONES[MAREAS], { deCarta: true }));
  assert.equal(t.tipo, 'marea-sonda');
  assert.equal(t.opciones.length, 4);
  assert.deepEqual(t.opciones.filter((o) => o.ok).map((o) => o.texto), ['Marea y sonda']);
  assert.deepEqual(preguntaDeTipo(q, 'marea-sonda').opciones, t.opciones, 'estable');
  // Qué lo delata: la sonda del enunciado. Y, si eligió otro, cuándo sería ese otro.
  assert.match(t.dato, /^…sonda que tendremos a la hora oficial 22:50/);
  const otro = t.opciones.find((o) => !o.ok).id;
  const partes = t.partes(otro);
  assert.match(partes[0], /^Es «Marea y sonda»: /);
  assert.match(partes[1], /^Lo delata este dato del enunciado: «sonda/);
  assert.match(partes[2], new RegExp(`^«${NOMBRES_TIPO[otro]}» sería si `));
  assert.equal(t.explica(), partes.slice(0, 2).join(' '));
  // Sin tipo de carta conocido, no hay primer paso.
  assert.equal(preguntaDeTipo(q, 'teoria'), null);
  assert.equal(preguntaDeTipo(q, 'carta'), null);
});

test('¿qué tipo es?: todas las preguntas de práctica con paso a paso lo tienen, y casi todas con su dato delator', () => {
  let n = 0; let conDato = 0;
  for (const q of practica) {
    if (!conPasos(q)) continue;
    const tipo = tipoDePregunta(q, SOLUCIONES[q.id], { deCarta: true });
    const t = preguntaDeTipo(q, tipo);
    assert.ok(t, `${q.id}: ${tipo} sin «¿qué tipo es?»`);
    n += 1;
    assert.ok(t.opciones.length >= 3 && t.opciones.length <= 4, q.id);
    assert.equal(t.opciones.filter((o) => o.ok).length, 1, q.id);
    assert.equal(new Set(t.opciones.map((o) => o.id)).size, t.opciones.length, q.id);
    if (t.dato) {
      conDato += 1;
      // La cita sale del enunciado tal cual (sin los puntos suspensivos).
      assert.ok(q.enunciado.replace(/\s+/g, ' ').includes(t.dato.replace(/^…|…$/g, '').trim()), `${q.id}: cita ajena «${t.dato}»`);
    }
  }
  assert.ok(n > 1100, `solo ${n}`);
  assert.ok(conDato / n > 0.9, `${conDato} de ${n} con dato delator`);
});

test('¿qué tipo es?: los tipos que enseña son los del curso y no hay error de taxonomía para el tipo (no va al cuaderno)', () => {
  for (const id of Object.keys(TIPOS)) assert.ok(NOMBRES_TIPO[id], id);
  assert.ok(!Object.values(ERRORES).some((e) => /tipo de problema/i.test(e.nombre)));
  // Las demoras no simultáneas se delatan por la segunda hora.
  assert.match(delator('Navegamos al Rv 150º. A HRB = 09:00 tomamos demora al faro A = 070º. A HRB = 11:00 tomamos demora al faro B = 045º.', 'demoras-no-simultaneas'), /^…A HRB = 11:00 tomamos demora/);
  // La interfaz no apunta en el cuaderno el fallo del tipo.
  const ui = readFileSync(new URL('../src/ui/guiado.js', import.meta.url), 'utf8');
  const tipo = ui.slice(ui.indexOf('function pasoDeTipo'), ui.indexOf('function empezar'));
  assert.ok(tipo.length > 100);
  assert.doesNotMatch(tipo, /anotarFallo|almacen\.(error|paso)/);
});

test('escalones: pista (qué buscar), la fórmula con los datos sin el resultado y, al final, «Dímelo»', () => {
  const pasos = pasosDe(MAREAS).filter((p) => p.pide);
  const da = pasos.find((p) => p.title === 'Duración y amplitud');
  const e = escalones(da);
  assert.deepEqual(e.map((x) => x.id), ['pista', 'formula', 'valor']);
  assert.equal(e[2].titulo, 'Dímelo');
  assert.match(e[0].texto, /Buscas: Duración D y Amplitud A\.$/);
  assert.equal(e[1].titulo, 'La fórmula con tus datos');
  assert.deepEqual(e[1].lineas, ['D = 23:25 − 17:16 = …', 'A = 2,90 − 0,92 = …']);
  const sonda = escalones(pasos.find((p) => p.title === 'Sonda'));
  assert.deepEqual(sonda[1].lineas, ['1,70 + 1,23 = …']);
  // Para todos los tipos de paso hay pista y regla.
  for (const id of Object.keys(PASOS)) { assert.ok(PISTAS[id], `pista de ${id}`); assert.ok(REGLAS[id], `regla de ${id}`); }
});

test('escalones: en todas las preguntas reales, la fórmula con los datos nunca escribe el valor que se pide', () => {
  let n = 0; let conCuenta = 0;
  for (const q of practica) {
    let k;
    try { k = createKit(chart); SOLUCIONES[q.id].solve(k, q); } catch { continue; }
    for (const p of pasosGuiados(k.steps).filter((x) => x.pide)) {
      n += 1;
      const lineas = cuentaSinResultado(p);
      if (lineas.length) conCuenta += 1;
      for (const l of lineas) {
        for (const tramo of l.split('=').slice(1)) {
          for (const c of p.pide.campos) {
            const qn = quantity(c.kind);
            let v = NaN; try { v = qn.parse(tramo.trim()); } catch { /* no se lee */ }
            assert.ok(!(Number.isFinite(v) && qn.error(v, c.value) <= qn.tolerance), `${q.id} «${p.title}»: «${l}» da ${qn.format(c.value)}`);
          }
        }
        for (const c of p.pide.campos) assert.ok(!l.includes(quantity(c.kind).format(c.value)), `${q.id} «${p.title}»: «${l}»`);
      }
      const e = escalones(p);
      assert.equal(e.length, 3);
      assert.ok(e[0].texto && e[1].texto, `${q.id} «${p.title}» sin pista o sin regla`);
    }
  }
  assert.ok(n > 5000, `solo ${n} pasos`);
  assert.ok(conCuenta / n > 0.5, `${conCuenta} de ${n} con la cuenta`);
});

test('ayudas: usar un escalón no es fallar, pero queda apuntado', () => {
  const r = [{ resultado: 'ok', ayudas: 2 }, { resultado: 'ok', ayudas: 0 }, { resultado: 'mal', ayudas: 1 }, { resultado: 'dimelo', ayudas: 2 }];
  assert.deepEqual(resumenGuiado(r), { total: 4, aciertos: 2, dichos: 1, fallos: 1 });
  assert.deepEqual(resumenAyudas(r), { pasos: 2, ayudas: 3 });
  assert.equal(textoAyudas(2), 'con 2 ayudas');
  assert.equal(textoAyudas(1), 'con 1 ayuda');
  assert.equal(textoAyudas(0), '');
});

test('ejemplo resuelto y con huecos: dos preguntas reales del mismo tipo, de la práctica, nunca reservadas', () => {
  const q = porId.get(MAREAS);
  const banco = bancos.find((b) => b.practica.some((x) => x.id === MAREAS));
  const o = { q, tipo: 'marea-sonda', practica: banco.practica, reservadas: banco.reservadas, tipoDe: (x) => SOLUCIONES[x.id]?.ejercicio ?? null, sirve: conPasos };
  const { resuelto, huecos } = ejemplosDelTipo(o);
  assert.ok(resuelto && huecos);
  assert.notEqual(resuelto.id, q.id); assert.notEqual(huecos.id, q.id); assert.notEqual(resuelto.id, huecos.id);
  for (const x of [resuelto, huecos]) {
    assert.equal(SOLUCIONES[x.id].ejercicio, 'marea-sonda');
    assert.ok(!banco.reservadas.has(x.id));
    assert.ok(banco.practica.includes(x));
  }
  assert.deepEqual(ejemplosDelTipo(o), { resuelto, huecos }, 'siempre las mismas');
  // Una reservada nunca sale, aunque esté en la lista que se le pase.
  const sinElla = ejemplosDelTipo({ ...o, reservadas: new Set([resuelto.id, huecos.id]) });
  assert.ok(![sinElla.resuelto?.id, sinElla.huecos?.id].some((id) => id === resuelto.id || id === huecos.id));
  // Sin otra del mismo tipo, no hay ejemplo.
  assert.deepEqual(ejemplosDelTipo({ ...o, practica: [q] }), { resuelto: null, huecos: null });
  // En todos los bancos: cada pregunta con paso a paso tiene su ejemplo si hay otra del mismo tipo.
  for (const b of bancos) {
    const tipos = new Map();
    for (const x of b.practica) if (SOLUCIONES[x.id]?.ejercicio) tipos.set(SOLUCIONES[x.id].ejercicio, (tipos.get(SOLUCIONES[x.id].ejercicio) ?? 0) + 1);
    for (const x of b.practica.filter((y) => SOLUCIONES[y.id]?.ejercicio).slice(0, 40)) {
      const r = ejemplosDelTipo({ q: x, tipo: SOLUCIONES[x.id].ejercicio, practica: b.practica, reservadas: b.reservadas, tipoDe: (y) => SOLUCIONES[y.id]?.ejercicio ?? null, sirve: conPasos });
      if (r.resuelto) assert.ok(!b.reservadas.has(r.resuelto.id) && r.resuelto.id !== x.id);
    }
  }
});

test('huecos: la primera mitad de los pasos que se preguntan va rellena; el resto lo completa el alumno', () => {
  const pasos = pasosDe(MAREAS);
  const preguntados = pasos.filter((p) => p.pide).map((p) => p.i);
  const r = pasosRellenos(pasos);
  assert.equal(r.size, Math.floor(preguntados.length / 2));
  assert.deepEqual([...r], preguntados.slice(0, r.size));
  assert.ok(preguntados.length - r.size >= 1);
  // El paso a paso de la interfaz: modos, reloj solo en la pregunta del alumno y sin el primer paso en los ejemplos.
  const ui = readFileSync(new URL('../src/ui/guiado.js', import.meta.url), 'utf8');
  assert.match(ui, /const rp = normal \? relojPaso\(/);
  assert.match(ui, /const pasoTipo = normal && o\.tipo !== false \?/);
  assert.match(ui, /Ver un ejemplo resuelto/);
  assert.match(ui, /Ahora tú, con huecos/);
});

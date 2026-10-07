// Siglas y términos que se explican al tocarlos: búsqueda (src/theory/glosas.js) y datos (data/comun/abreviaturas.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { compilarGlosas, buscarGlosas, entradaGlosa, clavesTema } from '../src/theory/glosas.js';
import { compilarVocabulario } from '../src/theory/vocabulario.js';

const raiz = new URL('../', import.meta.url).pathname;
const leer = (f) => readFileSync(join(raiz, f), 'utf8');
const AB = JSON.parse(leer('data/comun/abreviaturas.json')).abreviaturas;
const vocab = (tit) => [...compilarVocabulario((tit === 'py' ? ['per', 'py'] : ['per']).flatMap((t) => JSON.parse(leer(`data/comun/vocabulario-${t}.json`)).terminos)).porId.values()];

/** Solo los trozos marcados: [texto, id]. */
const marcas = (texto, g, usados, o) => buscarGlosas(texto, g, usados, o).filter((t) => t.tipo === 'glosa').map((t) => [t.texto, t.id]);
const soloSiglas = (ctx = { tit: 'per', ut: 11 }) => compilarGlosas({ abreviaturas: AB }, ctx);

test('palabra completa: «Ct» sí, «Ctra», «CT» y «ct» no', () => {
  const g = soloSiglas();
  assert.deepEqual(marcas('Ct = dm + Δ', g), [['Ct', 'ab:Ct'], ['dm', 'ab:dm'], ['Δ', 'ab:Δ']]);
  assert.deepEqual(marcas('Por la Ctra. de Cádiz', g), []);
  assert.deepEqual(marcas('CT y ct no son la corrección total', g), []);
  assert.deepEqual(marcas('Rv2 y 2Rv no; (Rv) sí', g), [['Rv', 'ab:Rv']]);
  assert.deepEqual(marcas('HRB: 10:30', g), [['HRB', 'ab:HRB']]);
  assert.deepEqual(marcas('Ra=230º', g), [['Ra', 'ab:Ra']]);
});

test('tildes y letras griegas cuentan como letras: no se marca dentro de otra palabra', () => {
  const g = compilarGlosas({ abreviaturas: AB }, { tit: 'py', ut: 4 });
  assert.deepEqual(marcas('Dañado, Dá y DaÑ', g), []);
  assert.deepEqual(marcas('Δl = D · cos R', g), [['Δl', 'ab:Δl']]); // la Δ de «Δl» no es el desvío
  assert.deepEqual(marcas('ΔL y Δl, luego Δ', g), [['ΔL', 'ab:ΔL'], ['Δl', 'ab:Δl'], ['Δ', 'ab:Δ']]);
  assert.deepEqual(marcas('Δp = 4 hPa', g), []);
  assert.deepEqual(marcas('ÁRa y RaÚ', g), []);
});

test('mayúsculas: las siglas las distinguen; los términos, no', () => {
  const terminos = [{ id: 'demora', termino: 'Demora', formas: ['demora', 'demoras'], definicion: 'Ángulo del norte a la visual.' }];
  const g = compilarGlosas({ abreviaturas: AB, terminos }, { tit: 'per', ut: 11 });
  assert.deepEqual(marcas('Demora de aguja', g), [['Demora', 'vo:demora']]);
  assert.deepEqual(marcas('DEMORAS', g), [['DEMORAS', 'vo:demora']]);
  assert.deepEqual(marcas('Las demorasx no; demoraba tampoco', g), []);
  assert.deepEqual(marcas('Iso no es ISO', g), [['Iso', 'ab:Iso']]);
});

test('solo la primera vez en cada tarjeta (el conjunto de usados se comparte)', () => {
  const g = soloSiglas();
  assert.deepEqual(marcas('Rv = Ra + Ct. Después, Rv = 045° y Ct = +3°.', g), [['Rv', 'ab:Rv'], ['Ra', 'ab:Ra'], ['Ct', 'ab:Ct']]);
  const usados = new Set();
  assert.deepEqual(marcas('Primero el Rv.', g, usados), [['Rv', 'ab:Rv']]);
  assert.deepEqual(marcas('Otra vez el Rv y el Ra.', g, usados), [['Ra', 'ab:Ra']]);
  // El texto no se pierde: los trozos juntos dan el original.
  const t = 'Rv = Ra + Ct; Dv = Da + Ct y otra Rv.';
  assert.equal(buscarGlosas(t, g).map((x) => x.texto).join(''), t);
  assert.deepEqual(buscarGlosas('', g), [{ tipo: 'texto', texto: '' }]);
  assert.deepEqual(buscarGlosas('Sin nada que marcar', g), [{ tipo: 'texto', texto: 'Sin nada que marcar' }]);
});

test('excepciones: «Da igual» no es la demora de aguja', () => {
  const g = soloSiglas();
  assert.deepEqual(marcas('Da igual cómo te propulses. Da = 045°.', g), [['Da', 'ab:Da']]);
});

test('el sentido de cada sigla depende del tema: Ct es centelleante en balizamiento; las nubes, solo en meteorología del PY', () => {
  const nav = soloSiglas({ tit: 'per', ut: 11 });
  const bal = soloSiglas({ tit: 'per', ut: 5, leccion: 'per-5-5' });
  assert.equal(entradaGlosa(nav, 'ab:Ct').significado, 'Corrección total');
  assert.equal(entradaGlosa(bal, 'ab:Ct').significado, 'Centelleante (luz)');
  assert.equal(entradaGlosa(soloSiglas({ tit: 'per', ut: 10, leccion: 'per-10-4' }), 'ab:Ct').significado, 'Centelleante (luz)');
  assert.equal(entradaGlosa(soloSiglas({ tit: 'per', ut: 10, leccion: 'per-10-5' }), 'ab:Ct').significado, 'Corrección total');
  assert.deepEqual(marcas('As de guía', soloSiglas({ tit: 'per', ut: 2 })), []);
  assert.deepEqual(marcas('Frente cálido: Ci, Cs, As y Ns', soloSiglas({ tit: 'py', ut: 2 })), [['Ci', 'ab:Ci'], ['Cs', 'ab:Cs'], ['As', 'ab:As'], ['Ns', 'ab:Ns']]);
  // Lo que solo existe en el PY no se marca en el PER.
  assert.deepEqual(marcas('Ihc y Vef', soloSiglas({ tit: 'per', ut: 11 })), []);
  assert.deepEqual(marcas('Ihc y Vef', soloSiglas({ tit: 'py', ut: 4 })), [['Ihc', 'ab:Ihc'], ['Vef', 'ab:Vef']]);
  assert.deepEqual([...clavesTema({ tit: 'per', ut: 5, leccion: 'per-5-3' })], ['per-5', 'per-5-3']);
});

test('excluir: lo que delataría la respuesta no se marca (y no se marca otra cosa dentro)', () => {
  const g = soloSiglas({ tit: 'py', ut: 3 });
  assert.deepEqual(marcas('¿Qué es el COG y el SOG?', g, new Set(), { excluir: (e) => e.titulo === 'COG' }), [['SOG', 'ab:SOG']]);
});

test('con el vocabulario real: términos de varias palabras antes que los de una', () => {
  const g = compilarGlosas({ abreviaturas: AB, terminos: vocab('py') }, { tit: 'py', ut: 3 });
  const conVarias = vocab('py').flatMap((t) => (t.formas ?? []).map((f) => [f, t.id])).find(([f]) => f.includes(' '));
  assert.ok(conVarias, 'hay términos de varias palabras');
  const [forma, id] = conVarias;
  assert.deepEqual(marcas(`Aquí, ${forma}.`, g), [[forma, `vo:${id}`]]);
});

test('datos: cada sigla tiene significado, explicación y titulación; y aparece de verdad en las clases, ejercicios o preguntas', () => {
  const fuentes = [];
  const recorre = (d) => { for (const f of readdirSync(join(raiz, d))) { const p = join(d, f); if (statSync(join(raiz, p)).isDirectory()) recorre(p); else if (/\.(json|js)$/.test(f)) fuentes.push(leer(p)); } };
  for (const d of ['data/curso', 'data/ejes', 'src/exercises', 'src/teacher', 'src/exams']) recorre(d);
  fuentes.push(leer('data/comun/mnemotecnias.json'), leer('data/comun/vocabulario-per.json'), leer('data/comun/vocabulario-py.json'));
  const todo = fuentes.join('\n');
  const generales = new Map();
  for (const a of AB) {
    assert.ok(a.sigla && a.significado && a.explicacion, JSON.stringify(a));
    assert.ok(a.tit?.length && a.tit.every((t) => ['per', 'py'].includes(t)), a.sigla);
    for (const t of a.temas ?? []) assert.match(t, /^(per|py)-\d+(-\d+)?$/, `${a.sigla}: tema ${t}`);
    assert.doesNotMatch(`${a.significado} ${a.explicacion}`, /sirocodiez|academia|escuela/i);
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${a.sigla.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`, 'u');
    assert.match(todo, re, `«${a.sigla}» no aparece en ningún texto de la app`);
    if (!a.temas) {
      assert.ok(!generales.has(a.sigla), `«${a.sigla}» tiene dos sentidos generales`);
      generales.set(a.sigla, a);
    }
  }
  for (const s of ['Rv', 'Ra', 'Rs', 'Ct', 'dm', 'Δ', 'HRB', 'Da', 'Dv', 'Ih', 'Rc', 'Vm', 'HcL', 'TU', 'MMSI', 'VHF', 'DSC', 'EPIRB', 'IALA', 'RIPA', 'UTC', 'Ab']) {
    assert.ok(AB.some((a) => a.sigla === s), `falta ${s}`);
  }
});

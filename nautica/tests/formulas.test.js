// «Fórmulas y tablas en una hoja» (data/comun/formulas.json, src/course/formulas.js, src/ui/views/formulas.js):
// cada ejemplo se recalcula con los motores de la app y cada secuencia de teclas se pulsa en la calculadora; cada
// fórmula cita una clase (o la chuleta de la práctica) que la enseña igual; y la hoja nunca se enlaza desde un examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { CALCULOS, resultadoTeclas, pulsaciones, bloquesPara, temasConFormulas, encaja, porTit, formulasPermitidas, longitudNormal, grados, resumenFormulas } from '../src/course/formulas.js';
import { rhumbTo } from '../src/math/mercator.js';
import { BEAUFORT, DOUGLAS } from '../src/illustrations/meteo.js';
import { PER, PY } from '../src/theory/blocks.js';
import { existeIcono } from '../src/ui/iconos.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const F = JSON.parse(leer('data/comun/formulas.json'));
const CH = JSON.parse(leer('data/comun/chuletario.json'));
const curso = { per: JSON.parse(leer('data/curso/per.json')), py: JSON.parse(leer('data/curso/py.json')) };
const clases = new Map(Object.entries(curso).flatMap(([tit, c]) => c.modulos.flatMap((m) => m.lecciones.map((l) => [l.id, { tit, ut: l.ut ?? m.ut, texto: JSON.stringify(l) }]))));
const formulas = F.bloques.flatMap((b) => (b.formulas ?? []).map((f) => ({ ...f, bloque: b.id })));
const tablas = F.bloques.flatMap((b) => (b.tablas ?? []).map((t) => ({ ...t, bloque: b.id })));
const ESTRUCTURA = { per: PER, py: PY };

/** Para comparar notación: sin espacios, negritas ni grados; × y * como ·; ÷ como /. */
const plano = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '').replace(/[×*]/g, '·').replace(/÷/g, '/').replace(/°/g, '').toLowerCase();
/** Todo el texto que se le enseña al alumno en un ejemplo. */
const textoEjemplo = (e) => [e.enunciado, ...e.pasos, e.resultado].join('\n').replace(/\*\*/g, '');

test('estructura: bloques, fórmulas y tablas con todo lo que piden, ids únicos e iconos que existen', () => {
  const ids = new Set();
  for (const b of F.bloques) {
    assert.ok(b.id && b.titulo && existeIcono(b.ico), `bloque ${b.id}: icono ${b.ico}`);
    assert.ok(!ids.has(b.id)); ids.add(b.id);
  }
  for (const f of formulas) {
    assert.ok(!ids.has(f.id), `id repetido ${f.id}`); ids.add(f.id);
    assert.ok(f.titulo && f.expresion?.length && f.letras?.length, `${f.id}: título, expresión y letras`);
    assert.ok(f.tits?.length && f.tits.every((t) => ESTRUCTURA[t]), `${f.id}: titulaciones`);
    for (const tit of f.tits) {
      assert.ok(porTit(f.cuando, tit), `${f.id} (${tit}): cuándo se usa`);
      assert.ok(porTit(f.trampa, tit), `${f.id} (${tit}): la trampa`);
      const uts = f.temas?.[tit];
      assert.ok(uts?.length, `${f.id} (${tit}): temas`);
      for (const ut of uts) assert.ok(ESTRUCTURA[tit].bloques.some((x) => x.ut === ut), `${f.id}: ${tit} no tiene tema ${ut}`);
    }
    const e = f.ejemplo;
    assert.ok(e?.enunciado && e.pasos?.length && e.resultado && e.comprobar, `${f.id}: ejemplo resuelto completo`);
  }
  for (const t of tablas) {
    assert.ok(!ids.has(t.id), `id repetido ${t.id}`); ids.add(t.id);
    assert.ok(t.titulo && t.columnas?.length && t.tits?.length, t.id);
    for (const tit of t.tits) assert.ok(t.temas?.[tit]?.length, `${t.id} (${tit}): temas`);
    if (t.desde) assert.ok(['beaufort', 'douglas'].includes(t.desde), t.id);
    else for (const tit of t.tits) for (const fila of porTit(t.filas, tit)) assert.equal(fila.length, t.columnas.length, `${t.id}: ${fila}`);
  }
});

test('textos: signo menos «−», negritas cerradas y sin academias', () => {
  const textos = JSON.stringify(F.bloques);
  assert.doesNotMatch(textos, /academia|escuela/i);
  for (const f of formulas) {
    const todos = [...f.expresion, ...f.letras.flat(), ...f.tits.flatMap((t) => [porTit(f.signos, t), porTit(f.cuando, t), porTit(f.trampa, t)]), f.ejemplo.enunciado, ...f.ejemplo.pasos, f.ejemplo.resultado].filter(Boolean);
    for (const s of todos) {
      assert.equal((s.match(/\*\*/g) ?? []).length % 2, 0, `${f.id}: negrita sin cerrar en «${s}»`);
      assert.doesNotMatch(s, /[\p{L}\d)′°]\s-\s[\p{L}\d(]/u, `${f.id}: «-» en vez de «−» en «${s}»`);
      assert.doesNotMatch(s, /(^|[\s(])-\d/, `${f.id}: número negativo con guion en «${s}»`);
    }
  }
});

test('cada fórmula sale del curso: sus clases existen, son de su titulación, y una de ellas (o su ficha) la escribe igual', () => {
  for (const f of formulas) {
    const o = f.origen;
    assert.ok(o?.clases?.length || o?.chuletario, `${f.id}: sin origen`);
    for (const id of o.clases ?? []) {
      assert.ok(clases.has(id), `${f.id}: clase ${id} no existe`);
      assert.ok(f.tits.includes(clases.get(id).tit), `${f.id}: la clase ${id} no es de sus titulaciones`);
    }
    // Cada titulación de la fórmula la tiene en alguna de sus clases citadas.
    for (const tit of f.tits) assert.ok((o.clases ?? []).some((id) => clases.get(id).tit === tit) || f.fueraDelCurso, `${f.id}: ninguna clase del ${tit}`);
    if (o.chuletario) assert.ok(CH.fichas[o.chuletario], `${f.id}: ficha ${o.chuletario}`);
    // La cita está, con la misma notación, en una clase citada o en su ficha de la chuleta.
    assert.ok(f.cita, `${f.id}: falta la cita`);
    const fuentes = [...(o.clases ?? []).map((id) => clases.get(id).texto), o.chuletario ? JSON.stringify(CH.fichas[o.chuletario]) : ''];
    assert.ok(fuentes.some((t) => plano(t).includes(plano(f.cita))), `${f.id}: «${f.cita}» no está en sus clases ni en su ficha`);
    if (!o.clases?.length) assert.ok(f.fueraDelCurso, `${f.id}: sin clase y sin justificar`);
  }
});

test('la notación de la hoja es la de las clases y la chuleta (mismas fórmulas, mismos signos)', () => {
  const hoja = plano(JSON.stringify(formulas.map((f) => f.expresion)));
  for (const x of ['Ct = dm + Δ', 'Rv = Ra + Ct', 'Ra = Rv − Ct', 'Dv = Da + Ct', 'Dv = Rv + M', 'Ct = Dv − Da', 'Δ = Ct − dm', 'Rs = Rv + Ab', 'Rv = Rs − Ab',
    'Δl = D · cos R', 'A = D · sen R', 'lm = l salida + Δl / 2', 'ΔL = A / cos lm', 'D = √(Δl² + A²)', 'HcL = TU + L', 'GM = KM − KG', 'GZ = GM · sen θ', 'C = A · sen²(90° · I / D)']) {
    assert.ok(hoja.includes(plano(x)), `la hoja no escribe «${x}»`);
  }
  const signos = JSON.stringify(formulas.map((f) => f.signos));
  assert.match(signos, /E o NE \(\+\) · W o NW \(−\)/);
  assert.match(signos, /Viento por babor: Ab \(\+\) · por estribor: Ab \(−\)/);
  assert.match(signos, /N y E \(\+\) · S y W \(−\)/);
});

test('cada ejemplo se calcula con los motores y publica lo que sale', () => {
  for (const f of formulas) {
    const { calculo, datos, esperado } = f.ejemplo.comprobar;
    assert.ok(CALCULOS[calculo], `${f.id}: cálculo ${calculo} desconocido`);
    const r = CALCULOS[calculo](datos);
    const texto = textoEjemplo(f.ejemplo);
    assert.ok(Object.keys(esperado).length, f.id);
    for (const [k, { valor, tol = 0.5, texto: escrito }] of Object.entries(esperado)) {
      assert.ok(Number.isFinite(r[k]), `${f.id}: el cálculo no da «${k}»`);
      assert.ok(Math.abs(r[k] - valor) <= tol + 1e-9, `${f.id}: ${k} publicado ${valor}, calculado ${r[k]}`);
      assert.ok(escrito && texto.includes(escrito), `${f.id}: «${escrito}» (${k}) no está escrito en el ejemplo`);
    }
  }
});

test('las teclas de cada ejemplo, pulsadas en la calculadora de la app, dan lo que dice el ejemplo', () => {
  let n = 0;
  for (const f of formulas) {
    for (const c of f.ejemplo.calculadora ?? []) {
      assert.ok(pulsaciones(c.teclas), `${f.id}: tecla desconocida en «${c.teclas}»`);
      const r = resultadoTeclas(c.teclas);
      assert.equal(r.error, null, `${f.id}: «${c.teclas}» da ${r.error}`);
      assert.ok(Math.abs(r.valor - c.da) <= (c.tol ?? 1e-9) + 1e-9, `${f.id}: «${c.teclas}» da ${r.valor}, no ${c.da}`);
      n += 1;
    }
  }
  assert.ok(n >= 40, `solo ${n} secuencias de teclas`);
  // Solo el cambio de fecha (una regla sin cuenta) va sin calculadora.
  assert.deepEqual(formulas.filter((f) => !f.ejemplo.calculadora?.length).map((f) => f.id), ['cambio-fecha']);
});

test('la estima inversa por latitud media (la de la clase) coincide con la loxodrómica de la carta (Mercator)', () => {
  const f = formulas.find((x) => x.id === 'estima-inversa');
  const { salida, llegada } = f.ejemplo.comprobar.datos;
  const r = CALCULOS.estimaInversa({ salida, llegada });
  const m = rhumbTo({ lat: grados(salida.lat), lon: grados(salida.lon) }, { lat: grados(llegada.lat), lon: grados(llegada.lon) });
  assert.ok(Math.abs(r.rumbo - m.bearing) < 0.3, `${r.rumbo} frente a ${m.bearing}`);
  assert.ok(Math.abs(r.d - m.distance) < 0.3, `${r.d} frente a ${m.distance}`);
});

test('meridiano de 180°: la longitud se normaliza a (−180°, 180°]', () => {
  assert.equal(longitudNormal(180.5), -179.5);
  assert.equal(longitudNormal(-180.25), 179.75);
  assert.equal(longitudNormal(-180), 180);
  assert.equal(longitudNormal(-6), -6);
});

test('tablas: las cifras salen de sus clases (o de la misma tabla de las láminas)', () => {
  assert.equal(BEAUFORT.length, 13);
  assert.equal(DOUGLAS.length, 10);
  for (const t of tablas) {
    for (const id of t.origen?.clases ?? []) {
      assert.ok(clases.has(id), `${t.id}: clase ${id}`);
      assert.ok(t.tits.includes(clases.get(id).tit), `${t.id}: ${id} no es de sus titulaciones`);
    }
    if (t.desde) continue;
    for (const tit of t.tits) {
      const fuente = [...(t.origen.clases ?? []).filter((id) => clases.get(id).tit === tit).map((id) => clases.get(id).texto), ...[t.origen.chuletario ?? []].flat().map((id) => JSON.stringify(CH.fichas[id]))].join('\n');
      assert.ok(fuente, `${t.id}: sin fuente del ${tit}`);
      for (const fila of porTit(t.filas, tit)) {
        for (const cifra of fila.join(' ').match(/\d+(?:[.,]\d+)*/g) ?? []) {
          assert.ok(fuente.includes(cifra), `${t.id} (${tit}): la cifra ${cifra} de «${fila.join(' · ')}» no está en sus clases`);
        }
      }
    }
  }
});

test('selección: cada titulación ve solo lo suyo; el PER es un subconjunto sin estima analítica, hora ni estabilidad', () => {
  const per = bloquesPara(F, 'per');
  const py = bloquesPara(F, 'py');
  const ids = (bs) => bs.flatMap((b) => [...b.formulas, ...b.tablas].map((x) => x.id));
  assert.ok(ids(per).length >= 15 && ids(py).length >= 30, `${ids(per).length} / ${ids(py).length}`);
  for (const b of ['estima', 'hora', 'estabilidad']) assert.ok(!per.some((x) => x.id === b), b);
  for (const id of ['ct', 'polar', 'marea-altura', 'marea-hora', 'estima-directa', 'meridiano-180', 'hcl', 'hora-legal', 'gm', 'traslado-peso', 'beaufort']) assert.ok(ids(py).includes(id), id);
  for (const id of ['ct', 'rumbos', 'tangente', 'sonda-duodecimos', 'presion-marea', 'zonas', 'sonidos']) assert.ok(ids(per).includes(id), id);
  // Por tema: solo lo de ese tema.
  const t10 = bloquesPara(F, 'per', { ut: 10 });
  assert.ok(t10.length && t10.every((b) => [...b.formulas, ...b.tablas].every((x) => x.temas.per.includes(10))));
  assert.deepEqual(temasConFormulas(F, 'py'), [1, 2, 3, 4]);
  assert.ok(temasConFormulas(F, 'per').includes(11));
  assert.match(resumenFormulas(py, 'py'), /Ct = dm \+ Δ/);
});

test('búsqueda: sin tildes y con varias palabras', () => {
  const todas = bloquesPara(F, 'py').flatMap((b) => b.formulas);
  const busca = (q) => todas.filter((f) => encaja(f, 'py', q)).map((f) => f.id);
  assert.ok(busca('loxodromica').includes('estima-directa'));
  assert.ok(busca('marea hora').includes('marea-hora'));
  assert.ok(busca('Ct').includes('ct'));
  assert.ok(busca('polar').includes('polar'));
  assert.deepEqual(busca('zzz'), []);
  assert.equal(busca('').length, todas.length);
});

test('nunca en un examen: la hoja no se abre en modo examen ni se enlaza desde el examen', () => {
  assert.equal(formulasPermitidas({ hash: '#/py/formulas' }), true);
  assert.equal(formulasPermitidas({ hash: '#/py/formulas', modoExamen: 'examen' }), false);
  assert.equal(formulasPermitidas({ hash: '#/py/test/simulacro?s=1' }), false);
  // El examen (simulacro, real y final) no la enlaza.
  const theory = leer('src/ui/views/theory.js');
  const i = theory.indexOf('export function testView');
  const resto = theory.slice(i + 10);
  assert.doesNotMatch(resto.slice(0, resto.search(/\nexport |$/)), /formulas/);
  // Solo la enlazan la chuleta de la práctica, la Biblioteca, el Temario y las cuentas del patrón (y el router).
  const ui = ['src/ui', 'src/ui/views', 'src/ui/chart'].flatMap((d) => readdirSync(new URL(`../${d}`, import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => `${d}/${f}`));
  const enlazan = ui.filter((f) => /\['formulas'\]|'formulas'\]/.test(leer(f))).sort();
  assert.deepEqual(enlazan, ['src/ui/app.js', 'src/ui/ayudas.js', 'src/ui/views/biblioteca.js', 'src/ui/views/cuentas.js', 'src/ui/views/formulas.js', 'src/ui/views/temario.js']);
  // En la chuleta, el enlace está en la parte que solo existe en práctica (después de descartar los exámenes).
  const ay = leer('src/ui/ayudas.js');
  assert.ok(ay.indexOf("['formulas']") > ay.indexOf('if (!conChuleta)'));
  // La vista comprueba el modo examen.
  assert.match(leer('src/ui/views/formulas.js'), /formulasPermitidas\(/);
});

test('todas las chuletas en una hoja: por tema, en el orden del examen y con las mismas clases que la chuleta de cada tema', async () => {
  const { contenidoChuletas, contenidoChuleta } = await import('../src/ui/views/chuleta.js');
  const { TITULACIONES } = await import('../src/theory/blocks.js');
  const { readFileSync } = await import('node:fs');
  for (const tit of ['per', 'py']) {
    const curso = JSON.parse(readFileSync(new URL(`../data/curso/${tit}.json`, import.meta.url)));
    const E = TITULACIONES[tit].estructura;
    const temas = contenidoChuletas(curso, E);
    assert.ok(temas.length >= 4, tit);
    assert.deepEqual(temas.map((t) => t.ut), E.bloques.map((b) => b.ut).filter((ut) => contenidoChuleta(curso, ut).length));
    for (const t of temas) assert.deepEqual(t.clases, contenidoChuleta(curso, t.ut), `${tit} tema ${t.ut}`);
  }
});

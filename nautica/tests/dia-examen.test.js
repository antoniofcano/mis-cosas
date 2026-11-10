// La lista del día del examen y tu convocatoria (R-44): la lista por tribunal y titulación (cada elemento con su fuente y
// lo no comprobado como pendiente), la calculadora según las reglas del tribunal y la titulación, las casillas guardadas
// (y su reinicio con la convocatoria siguiente), hora, sede y enlace, el recordatorio de las listas de admitidos por
// fechas (el reloj entra por parámetro: nada depende de la hora de la máquina), la validación de la operación que se
// sincroniza y que la lista no se ve ni se enlaza durante un examen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TITULACIONES } from '../src/theory/blocks.js';
import { cifrasExamen } from '../src/course/estrategia.js';
import { calculadoraPermitida } from '../src/calculadora/reglas.js';
import {
  listaDiaExamen, idsMarcables, leerLista, marcadasVigentes, alternarMarca, vaciarLista, casillasHechas, resumenLista, claveLista, ID_ADMITIDOS,
} from '../src/course/dia-examen.js';
import {
  leerConvocatoria, convocatoriaVigente, cambiarConvocatoria, vigente, enlaceValido, horaValida, sedeValida, enlaceConvocatoria, hayDatos,
  recordatorioAdmitidos, momentoExamen, claveConvocatoria, DIAS_ADMITIDOS, MAX_SEDE,
} from '../src/course/convocatoria.js';
import { esAjusteCompartido, validarOperacion, idOperacion } from '../src/store/sync/operaciones.js';
import { sumaDiasISO } from '../src/course/calendario.js';

const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const DATOS = JSON.parse(leer('data/comun/dia-examen.json'));
const ESTRATEGIA = JSON.parse(leer('data/comun/estrategia.json'));
const EJES = JSON.parse(leer('data/ejes/index.json')).ejes.map((e) => e.id);
const ficha = (eje) => JSON.parse(leer(`data/ejes/${eje}/eje.json`));
const lista = (eje, tit) => listaDiaExamen({ datos: DATOS, fuentes: ESTRATEGIA.fuentes, tit, eje, calculadora: cifrasExamen(TITULACIONES[tit], ficha(eje)).calculadora });
const items = (l) => l.grupos.flatMap((g) => g.items);
const por = (l, id) => items(l).find((x) => x.id === id);
/** Mediodía local de un día 'AAAA-MM-DD': la fecha del alumno, no la de la máquina. */
const a = (iso, h = 12, m = 0) => { const [y, mo, d] = iso.split('-').map(Number); return new Date(y, mo - 1, d, h, m).getTime(); };
const EXAMEN = '2026-11-21';
const hoyK = (k) => sumaDiasISO(EXAMEN, -k);

// --- la lista por tribunal y titulación -------------------------------------------------------------------------------

test('cada tribunal y titulación publicados tienen su lista: ids únicos, fuentes que existen y lo no comprobado, como pendiente', () => {
  for (const eje of EJES) {
    assert.ok(DATOS.tribunales[eje], `${eje} tiene su lista (si no, saldría la genérica, toda pendiente)`);
    for (const tit of Object.keys(TITULACIONES)) {
      const l = lista(eje, tit);
      const ids = idsMarcables(l);
      assert.equal(new Set(ids).size, ids.length, `${eje}/${tit}: ids únicos`);
      assert.ok(!l.sinFicha);
      for (const x of items(l)) {
        // Una norma siempre dice su fuente; un pendiente dice qué comprobar y nunca se presenta como norma.
        if (x.tipo === 'norma') assert.ok(x.fuente?.corto, `${eje}/${tit}/${x.id}: una norma sin fuente`);
        if (x.tipo === 'pendiente') { assert.ok(x.comprobar, `${eje}/${tit}/${x.id}: pendiente sin «compruébalo»`); assert.match(x.comprobar, /ompru[eé]ba/); }
        if (x.fuente?.id) assert.ok(ESTRATEGIA.fuentes[x.fuente.id], `${eje}/${tit}/${x.id}: la fuente ${x.fuente.id} existe`);
      }
      for (const g of ['documentos', 'material', 'calculadora', 'horalugar']) assert.ok(l.grupos.some((x) => x.id === g), `${eje}/${tit}: grupo ${g}`);
      assert.equal(l.pendientes, items(l).filter((x) => x.tipo === 'pendiente').length);
    }
  }
  for (const f of Object.values(DATOS.tribunales).flatMap((t) => [...t.items, ...(t.avisos ?? [])])) if (f.fuente) assert.ok(ESTRATEGIA.fuentes[f.fuente], f.fuente);
});

test('Andalucía (BOJA 2025): documento en físico, material de la base quinta y calculadora; la tasa, pendiente', () => {
  const per = lista('andalucia', 'per');
  assert.equal(por(per, 'identidad').tipo, 'norma');
  assert.match(por(per, 'identidad').texto, /en físico/);
  assert.match(por(per, 'identidad').texto, /DNI, permiso de conducción o pasaporte/);
  assert.match(por(per, 'identidad').fuente.url, /^https:\/\/www\.juntadeandalucia\.es\/boja\//);
  assert.equal(por(per, 'identidad').fuente.ref, 'base séptima 2');
  assert.equal(por(per, 'tasa').tipo, 'pendiente', 'la convocatoria de la app no dice nada de la tasa');
  for (const id of ['lapiz', 'goma', 'boligrafo', 'transportador', 'compas', 'regla', 'escuadra']) assert.equal(por(per, id).fuente.ref, 'base quinta 5', id);
  assert.match(por(per, 'lapiz').texto, /2 HB/);
  assert.equal(por(per, 'calculadora').marcable, true);
  assert.match(por(per, 'calculadora').fuente.corto, /BOJA/);
  assert.ok(per.avisos.some((x) => /carta del Estrecho te la da el tribunal/.test(x.texto)));
  // En el PY el material de dibujo es del módulo de navegación.
  assert.match(por(lista('andalucia', 'py'), 'compas').texto, /módulo de navegación/);
});

test('Madrid (BOE-A-2026-510): la tasa es norma, el documento está pendiente y el material no inventa la goma', () => {
  for (const tit of ['per', 'py']) {
    const l = lista('dgmm', tit);
    assert.equal(por(l, 'tasa').tipo, 'norma');
    assert.equal(por(l, 'tasa').fuente.ref, 'apartado 5');
    assert.equal(por(l, 'identidad').tipo, 'pendiente', 'la convocatoria no detalla el documento');
    assert.ok(!por(l, 'goma'), 'la goma no está en la fuente');
    assert.match(por(l, 'dibujo').texto, /material de dibujo que necesites/);
    assert.match(por(l, 'horalugar').texto, /lista definitiva de admitidos/);
  }
});

test('Baleares (sin revisar): documento, tasa, material y hora y lugar, todo pendiente de verificar', () => {
  for (const tit of ['per', 'py']) {
    const l = lista('baleares', tit);
    for (const id of ['identidad', 'tasa', 'material', 'horalugar']) assert.equal(por(l, id).tipo, 'pendiente', `${tit}/${id}`);
    assert.ok(!items(l).some((x) => x.tipo === 'norma' && x.grupo !== 'calculadora'), 'ninguna norma fuera de la calculadora de la ficha');
    assert.ok(l.pendientes >= 4);
  }
});

test('la calculadora es una casilla solo si el tribunal y la titulación la permiten (reglas.js)', () => {
  for (const eje of EJES) {
    for (const tit of Object.keys(TITULACIONES)) {
      const permitida = calculadoraPermitida(tit, ficha(eje));
      const x = por(lista(eje, tit), 'calculadora');
      assert.equal(x.marcable, permitida, `${eje}/${tit}`);
      if (!permitida) assert.match(x.texto, /Sin calculadora/);
    }
  }
  assert.equal(por(lista('dgmm', 'per'), 'calculadora').marcable, false, 'Madrid: solo en el PY y el CY');
  assert.equal(por(lista('dgmm', 'py'), 'calculadora').marcable, true);
  assert.ok(!idsMarcables(lista('dgmm', 'per')).includes('calculadora'));
});

test('un tribunal sin ficha: lista genérica, todo pendiente de verificar, nada como norma', () => {
  const l = listaDiaExamen({ datos: DATOS, fuentes: ESTRATEGIA.fuentes, tit: 'per', eje: 'inventado', calculadora: { permitida: true, fuente: null } });
  assert.ok(l.sinFicha);
  assert.match(l.nota, /no tiene aún su ficha/);
  assert.ok(items(l).every((x) => x.tipo !== 'norma'));
  assert.equal(por(l, 'calculadora').tipo, 'pendiente', 'ni la calculadora se afirma sin fuente');
});

test('el resumen para asistentes marca lo pendiente y lo marcado', () => {
  const l = lista('baleares', 'per');
  const s = resumenLista(l, ['material'], {});
  assert.match(s, /LISTA DEL DÍA DEL EXAMEN: 1 de \d+ marcadas · \d+ pendientes de verificar/);
  assert.match(s, /\[x\] Material de escribir y de dibujo \(PENDIENTE DE VERIFICAR\)/);
  assert.match(s, /\[ \] Documento de identidad/);
});

// --- las casillas guardadas ------------------------------------------------------------------------------------------

test('casillas: se marcan, se desmarcan, se normalizan y cuentan de las que se pueden marcar', () => {
  const l = lista('andalucia', 'per');
  const ctx = { fechaExamen: EXAMEN, hoy: hoyK(5) };
  let aj = alternarMarca(null, 'lapiz', true, ctx);
  aj = alternarMarca(aj, 'goma', true, ctx);
  aj = alternarMarca(aj, 'lapiz', true, ctx);
  assert.deepEqual(aj, { para: EXAMEN, marcadas: ['goma', 'lapiz'] });
  assert.deepEqual(marcadasVigentes(aj, ctx), ['goma', 'lapiz']);
  assert.deepEqual(alternarMarca(aj, 'goma', false, ctx).marcadas, ['lapiz']);
  assert.deepEqual(leerLista({ para: 'ayer', marcadas: ['a', 'B C', 7, 'a', '../x'] }), { para: null, marcadas: ['a'] });
  assert.deepEqual(leerLista('basura'), { para: null, marcadas: [] });
  const av = casillasHechas(l, ['lapiz', 'goma', 'calculadora']);
  assert.equal(av.total, idsMarcables(l).length);
  assert.equal(av.hechas, 3);
  assert.equal(av.faltan.length, av.total - 3);
  assert.equal(casillasHechas(l, [], { admitidos: true }).hechas, 1, 'la de admitidos viene de la convocatoria');
  assert.ok(idsMarcables(l).includes(ID_ADMITIDOS));
  assert.deepEqual(vaciarLista({ fechaExamen: EXAMEN }), { para: EXAMEN, marcadas: [] });
});

test('casillas: una convocatoria nueva las reinicia; corregir la fecha antes del examen, no', () => {
  const aj = { para: EXAMEN, marcadas: ['lapiz', 'goma'] };
  // Misma fecha, ya pasado el examen: siguen (se ve lo que se llevó).
  assert.deepEqual(marcadasVigentes(aj, { fechaExamen: EXAMEN, hoy: sumaDiasISO(EXAMEN, 3) }), ['lapiz', 'goma']);
  // La fecha se movió o se corrigió antes del examen: se conservan.
  assert.deepEqual(marcadasVigentes(aj, { fechaExamen: '2026-11-28', hoy: hoyK(6) }), ['lapiz', 'goma']);
  assert.deepEqual(alternarMarca(aj, 'regla', true, { fechaExamen: '2026-11-28', hoy: hoyK(6) }), { para: '2026-11-28', marcadas: ['lapiz', 'goma', 'regla'] });
  // El examen pasó y hay otra fecha: convocatoria nueva, casillas vacías; al marcar, empieza de cero.
  const despues = { fechaExamen: '2027-02-20', hoy: sumaDiasISO(EXAMEN, 1) };
  assert.deepEqual(marcadasVigentes(aj, despues), []);
  assert.deepEqual(alternarMarca(aj, 'regla', true, despues), { para: '2027-02-20', marcadas: ['regla'] });
  // Sin fecha de examen ahora: lo guardado vale mientras el examen para el que se guardó no haya pasado.
  assert.deepEqual(marcadasVigentes(aj, { fechaExamen: null, hoy: hoyK(2) }), ['lapiz', 'goma']);
  assert.deepEqual(marcadasVigentes(aj, { fechaExamen: null, hoy: sumaDiasISO(EXAMEN, 1) }), []);
  assert.equal(vigente(null, EXAMEN, hoyK(1)), true);
});

// --- tu convocatoria: hora, sede y enlace ------------------------------------------------------------------------------

test('hora, sede y enlace: validados y normalizados; un enlace que no es http(s) no se guarda', () => {
  assert.equal(horaValida('09:30'), '09:30');
  for (const mala of ['9:30', '24:00', '10:60', '', null, 930]) assert.equal(horaValida(mala), null, String(mala));
  assert.equal(sedeValida('  Aula   3,\n  Facultad  '), 'Aula 3, Facultad');
  assert.equal(sedeValida('x'.repeat(500)).length, MAX_SEDE);
  assert.equal(sedeValida('   '), null);
  assert.equal(enlaceValido(' https://www.juntadeandalucia.es/ '), 'https://www.juntadeandalucia.es/');
  for (const malo of ['javascript:alert(1)', 'data:text/html,<b>', 'ftp://x.es', 'https://a b.es', 'www.x.es', '', null, `https://x.es/${'a'.repeat(400)}`]) assert.equal(enlaceValido(malo), null, String(malo).slice(0, 30));
  assert.deepEqual(leerConvocatoria({ hora: '25:00', sede: ' Sala ', enlace: 'javascript:1', admitidos: 'hoy', para: EXAMEN }), { para: EXAMEN, hora: null, sede: 'Sala', enlace: null, admitidos: null });
});

test('cambiar la convocatoria conserva lo no nombrado, borra con vacío y apunta para qué examen es', () => {
  const ctx = { fechaExamen: EXAMEN, hoy: hoyK(10) };
  let c = cambiarConvocatoria(null, { hora: '10:00', sede: 'Aula 3' }, ctx);
  assert.deepEqual(c, { para: EXAMEN, hora: '10:00', sede: 'Aula 3', enlace: null, admitidos: null });
  c = cambiarConvocatoria(c, { enlace: 'https://exemple.es/conv' }, ctx);
  assert.deepEqual([c.hora, c.sede, c.enlace], ['10:00', 'Aula 3', 'https://exemple.es/conv']);
  assert.equal(hayDatos(c), true);
  c = cambiarConvocatoria(c, { sede: '', hora: '' }, ctx);
  assert.deepEqual([c.hora, c.sede, c.enlace], [null, null, 'https://exemple.es/conv']);
  c = cambiarConvocatoria(c, { admitidos: hoyK(9) }, ctx);
  assert.equal(c.admitidos, hoyK(9));
  c = cambiarConvocatoria(c, { enlace: '', admitidos: '' }, ctx);
  assert.equal(hayDatos(c), false, 'todo se puede borrar');
});

test('una convocatoria nueva reinicia hora, sede y admitidos, pero conserva el enlace', () => {
  const guardada = { para: EXAMEN, hora: '10:00', sede: 'Aula 3', enlace: 'https://exemple.es/conv', admitidos: hoyK(9) };
  assert.deepEqual(convocatoriaVigente(guardada, { fechaExamen: EXAMEN, hoy: hoyK(1) }), guardada);
  assert.equal(convocatoriaVigente(guardada, { fechaExamen: '2026-11-28', hoy: hoyK(3) }).hora, '10:00', 'la fecha se movió antes del examen');
  const nueva = convocatoriaVigente(guardada, { fechaExamen: '2027-02-20', hoy: sumaDiasISO(EXAMEN, 2) });
  assert.deepEqual(nueva, { para: null, hora: null, sede: null, enlace: 'https://exemple.es/conv', admitidos: null });
  // Al guardar algo nuevo sobre una convocatoria pasada se empieza de cero (con el enlace).
  assert.deepEqual(cambiarConvocatoria(guardada, { hora: '09:00' }, { fechaExamen: '2027-02-20', hoy: sumaDiasISO(EXAMEN, 2) }),
    { para: '2027-02-20', hora: '09:00', sede: null, enlace: 'https://exemple.es/conv', admitidos: null });
});

test('el enlace: el del alumno y, si no hay, la página oficial de la ficha del eje', () => {
  for (const eje of EJES) {
    const e = enlaceConvocatoria({ enlace: null }, ficha(eje));
    assert.ok(e && e.oficial && !e.propio, eje);
    assert.equal(e.url, new URL(ficha(eje).fuente).href);
  }
  assert.deepEqual(enlaceConvocatoria({ enlace: 'https://exemple.es/c' }, ficha('andalucia')), { url: 'https://exemple.es/c', propio: true, oficial: false });
  assert.equal(enlaceConvocatoria({ enlace: null }, { fuente: 'no es una url' }), null);
  assert.equal(enlaceConvocatoria({ enlace: null }, null), null);
});

// --- el recordatorio de las listas de admitidos -----------------------------------------------------------------------

test('recordatorio de admitidos: desde 3 semanas antes hasta la víspera, mientras no se marque', () => {
  const r = (k, o = {}) => recordatorioAdmitidos({ fechaExamen: EXAMEN, ahora: a(hoyK(k)), ...o });
  assert.equal(DIAS_ADMITIDOS, 21);
  assert.equal(r(22).mostrar, false, 'aún muy lejos');
  assert.deepEqual([r(21).mostrar, r(21).dias], [true, 21]);
  assert.equal(r(10).mostrar, true);
  assert.equal(r(1).mostrar, true, 'la víspera aún sirve');
  assert.equal(r(0).mostrar, false, 'el día del examen ya no');
  assert.equal(recordatorioAdmitidos({ fechaExamen: EXAMEN, ahora: a(sumaDiasISO(EXAMEN, 2)) }).mostrar, false, 'pasado el examen, nada');
  assert.equal(r(10, { orientativa: true }).mostrar, false, 'una fecha orientativa no es una convocatoria');
  assert.equal(recordatorioAdmitidos({ fechaExamen: null, ahora: a(EXAMEN) }).mostrar, false);
  // Marcado como hecho: no vuelve; el de una convocatoria pasada no cuenta.
  const hecho = { para: EXAMEN, admitidos: hoyK(12) };
  assert.deepEqual([r(10, { convocatoria: hecho }).mostrar, r(10, { convocatoria: hecho }).hecho], [false, true]);
  assert.equal(recordatorioAdmitidos({ fechaExamen: '2027-02-20', ahora: a('2027-02-01'), convocatoria: hecho }).mostrar, true, 'otra convocatoria: otra vez');
});

test('recordatorio de admitidos: el cambio de día es el local (23:59 y 00:01 cuentan días distintos)', () => {
  const k = (n, h, m) => recordatorioAdmitidos({ fechaExamen: EXAMEN, ahora: a(hoyK(n), h, m) });
  assert.equal(k(22, 23, 59).mostrar, false);
  assert.equal(k(21, 0, 1).mostrar, true);
  assert.equal(k(1, 23, 59).mostrar, true);
  assert.equal(k(0, 0, 1).mostrar, false);
});

test('qué se ve en Hoy según los días que faltan: semana, víspera, día del examen', () => {
  const m = (k, o = {}) => momentoExamen({ fechaExamen: EXAMEN, ahora: a(hoyK(k)), ...o });
  assert.equal(m(8), null);
  assert.equal(m(7), 'semana');
  assert.equal(m(2), 'semana');
  assert.equal(m(1), 'vispera');
  assert.equal(m(0), 'dia');
  assert.equal(momentoExamen({ fechaExamen: EXAMEN, ahora: a(sumaDiasISO(EXAMEN, 1)) }), null);
  assert.equal(m(3, { orientativa: true }), null);
  assert.equal(momentoExamen({ fechaExamen: null, ahora: a(EXAMEN) }), null);
});

// --- se guarda y se sincroniza -------------------------------------------------------------------------------------------

test('lo guardado es un ajuste compartido y la operación pasa la validación (también la del Worker, que es la misma)', () => {
  for (const tit of ['per', 'py']) {
    for (const k of [claveConvocatoria(tit), claveLista(tit)]) {
      assert.ok(esAjusteCompartido(k), k);
      const op = { i: idOperacion('abcdefghij', 5, 'xy12'), k: 'v', t: a(EXAMEN), c: 'settings', p: [k], v: k.startsWith('convocatoria') ? { para: EXAMEN, hora: '10:00', sede: 'Aula 3', enlace: 'https://exemple.es/c', admitidos: null } : { para: EXAMEN, marcadas: ['lapiz', 'goma'] } };
      assert.equal(validarOperacion(op, a(EXAMEN)), null, k);
    }
  }
  assert.equal(claveConvocatoria('per'), 'convocatoria_per');
  assert.equal(claveLista('py'), 'listadia_py');
});

// --- nunca durante un examen -----------------------------------------------------------------------------------------------

test('la lista y el repaso exprés no se enseñan ni se enlazan con un examen en marcha', () => {
  for (const f of ['src/ui/views/dia-examen.js', 'src/ui/views/vispera.js']) assert.match(leer(f), /estrategiaPermitida\(\{ modo: modoExamen\(\)/, f);
  const src = leer('src/ui/views/theory.js');
  const cuerpo = src.slice(src.indexOf('export function testView'));
  const corre = cuerpo.indexOf('function correr(');
  const res = cuerpo.indexOf('function resultados(');
  assert.doesNotMatch(cuerpo.slice(corre, res), /dia-examen|vispera/, 'el examen en marcha no los enlaza');
  for (const f of ['src/ui/actividad.js', 'src/ui/modo-examen.js', 'src/ui/calculadora.js', 'src/ui/bloc.js']) assert.doesNotMatch(leer(f), /dia-examen|vispera/, f);
  const app = leer('src/ui/app.js');
  assert.match(app, /'dia-examen': diaExamenView/);
  assert.match(app, /vispera: visperaView/);
  assert.match(app, /b === 'dia-examen' \|\| b === 'vispera'\) return 'examen'/);
});

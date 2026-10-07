// Proceso de extracción de bancos (tools/bancos, docs/EXTRACCION.md): adaptadores hoja-optica (Andalucía), subrayado
// (Murcia) y ocr (esbozo), descubrimiento de documentos y verificación de las descargas manuales de Murcia.
// Los PDF de prueba son sintéticos (tests/fixtures/bancos/generar.py); nunca se suben PDF oficiales. Las pruebas que
// necesitan Python con PyMuPDF se saltan si no está; la de las muestras reales de Murcia, si no están en la máquina.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RAIZ } from '../tools/bancos/leer.mjs';
import { analizarCuestionario } from '../tools/bancos/lib/cuestionario.mjs';
import { REGLAS_ANDALUCIA, quitarRotulos, reponerGuiones, separarTabla, leerHojas } from '../tools/bancos/adaptadores/hoja-optica.mjs';
import { REGLAS_MURCIA, leerCuestionario as leerMurcia, leerSubrayados, mismoInicio, respuestaSubrayado } from '../tools/bancos/adaptadores/subrayado.mjs';
import * as ocr from '../tools/bancos/adaptadores/ocr.mjs';
import { clasificarNombre } from '../tools/bancos/descubrir/andalucia.mjs';
import { documento, leerCSV } from '../tools/bancos/descubrir/murcia.mjs';
import { esPaginaCaptcha, verificarArchivo } from '../tools/bancos/ejes/murcia/verificar.mjs';
import { respuestaFuente } from '../tools/bancos/etapas/correcciones.mjs';

const FIX = join(RAIZ, 'tests', 'fixtures', 'bancos');
const conPyMuPDF = spawnSync('python3', ['-I', '-c', 'import pymupdf, numpy'], { encoding: 'utf8' }).status === 0;
const conPdftotext = spawnSync('pdftotext', ['-v'], { encoding: 'utf8' }).status === 0;
const json = (ruta) => JSON.parse(readFileSync(join(RAIZ, ruta), 'utf8'));

test('hoja-optica: número «N.-», bloques de contexto en lista cerrada y ruido', () => {
  const texto = [
    'UNIDAD TEÓRICA 1. NOMENCLATURA',
    '1.- Cual de los siguientes NO es obligatorio:',
    'a) Uno', 'b) Dos', 'c) Tres', 'd) Todas las balsas llevan un ancla flotante en el paquete',
    'SOLAS',
    '2. Segunda:', 'a) x', 'b) y', 'c) z', 'd) w',
    '\u0012', '(',
    'MAREAS',
    'Puerto de prueba: pleamar 12:00',
    '3.- Calcular la sonda en el puerto de prueba a una hora dada', 'a) 1', 'b) 2', 'c) 3', 'd) 4',
  ].join('\n');
  const { examenes } = analizarCuestionario(texto, REGLAS_ANDALUCIA);
  const ps = examenes[0].preguntas;
  assert.deepEqual(ps.map((q) => q.numero), [1, 2, 3]);
  assert.equal(ps[0].enunciado, 'Cual de los siguientes NO es obligatorio:');
  assert.equal(ps[0].opciones.d, 'Todas las balsas llevan un ancla flotante en el paquete SOLAS');
  assert.equal(ps[1].opciones.d, 'w');
  assert.match(ps[2].contexto, /^MAREAS\nPuerto de prueba/);
});

test('hoja-optica: guiones de final de línea repuestos desde pdftotext -raw', () => {
  const crudo = 'oscilación en el sentido estribor-\nbabor, se denomina:\nb) Ct = 8º -\nc) Ct = 6º +\n(babor -\nestribor)\nal punto -P-\na) 10:30';
  const normal = 'oscilación en el sentido estriborbabor, se denomina:\nb) Ct = 8º c) Ct = 6º +\n(babor estribor)\nal punto -Pa) 10:30';
  const t = reponerGuiones(normal, crudo);
  assert.match(t, /estribor-babor, se denomina/);
  assert.match(t, /b\) Ct = 8º -\nc\) Ct = 6º \+/);
  assert.match(t, /\(babor -\nestribor\)/);
  assert.match(t, /punto -P-\na\) 10:30/);
  assert.equal(reponerGuiones('sin cambios', 'sin cambios'), 'sin cambios');
});

test('hoja-optica: rótulos de figura fuera y tabla de mareas fuera del enunciado', () => {
  const t = quitarRotulos('p1\nBlanco\f19. Bandera:\nb) Limpieza de\nBlanco\nAzul\nminas', [[2, 'Blanco'], [2, 'Azul']]);
  assert.equal(t, 'p1\nBlanco\f19. Bandera:\nb) Limpieza de\nminas');
  const q = separarTabla({ enunciado: 'Calcular la sonda si la Sc= 3.28m HORAS 1:48 7:48 14:03 20:19', contexto: null });
  assert.equal(q.enunciado, 'Calcular la sonda si la Sc= 3.28m');
  assert.equal(q.contexto, 'HORAS\n1:48\n7:48\n14:03\n20:19');
});

test('hoja-optica: lectura de una hoja sintética con los números más intensos que las burbujas', { skip: !conPyMuPDF && 'sin Python/PyMuPDF' }, () => {
  const pdf = join(FIX, 'hoja-optica-sintetica.pdf');
  const r = leerHojas([{ pdf, n: 20 }])[pdf];
  assert.equal(r.error, undefined);
  assert.equal(r.respuestas.map((x) => x.marca || '-').join(''), 'abcdabcdabdcba-abcda');
  assert.equal(r.respuestas[14].estado, 'vacia');
  assert.ok(r.respuestas.filter((x) => x.estado === 'ok').length === 19);
});

test('descubrir Andalucía: nombres de 2015–2019 (1TC/1TP, 3T-C, Modelo-A, PY A/B de 2018, reducido fuera)', () => {
  const c = (n) => clasificarNombre(n);
  assert.deepEqual(c('2015_1TC_PER_ExamenA.pdf'), { rol: 'cuestionario', tit: 'per', modelo: 'A', revisada: false });
  assert.deepEqual(c('2015_1TP_PER_Plantilla_ExamenA_Corregida.pdf'), { rol: 'plantilla', tit: 'per', modelo: 'A', revisada: true });
  assert.equal(c('2015-3P-PER-Examen-B.pdf').modelo, 'B');
  assert.equal(c('2016_3T-C_PER_ModeloA.pdf').rol, 'cuestionario');
  assert.equal(c('2017_2C_PER_Modelo-B.pdf').modelo, 'B');
  assert.equal(c('2018_1C_PY_Modulo_Generico-A.pdf').modelo, 'generico-A');
  assert.equal(c('2018_1P_PY_Modulo_Navegacion-B.pdf').modelo, 'navegacion-B');
  assert.equal(c('2015_2TC_PY_Modulo_Navegacion_2.pdf').modelo, 'navegacion');
  assert.equal(c('2015_2TP_PER_Reducido-Plantilla_2.pdf'), null);
});

test('Andalucía: configuración de 2015–2019 (16 convocatorias, 1ª de 2018 en su ruta propia, 3ª de 2018 sin PY)', () => {
  const cfg = json('tools/bancos/ejes/andalucia/config.json');
  const antiguas = cfg.convocatorias.filter((c) => c.clave < '2020' && c.pagina);
  assert.equal(antiguas.length, 16);
  assert.ok(antiguas.every((c) => !c.activa));
  assert.match(antiguas.find((c) => c.clave === '2018-c1').pagina, /investigacion-innovacion-deportiva/);
  assert.deepEqual(antiguas.find((c) => c.clave === '2018-c3').titulaciones, ['per']);
});

test('subrayado (Murcia): reglas del texto y lectura del subrayado de un PDF sintético', { skip: !(conPyMuPDF && conPdftotext) && 'sin Python/PyMuPDF o pdftotext' }, () => {
  const pdf = join(FIX, 'subrayado-sintetico.pdf');
  const ps = leerMurcia(pdf);
  assert.deepEqual(ps.map((q) => q.numero), [1, 2, 3, 4, 5, 6]);
  assert.equal(ps[1].opciones.c, 'Una opción larga que ocupa dos líneas justificadas y continúa en la segunda línea.');
  assert.equal(ps[2].enunciado, 'Tercera pregunta, con las cuatro opciones subrayadas:');
  assert.equal(ps[3].opciones.d, '1310');
  const s = leerSubrayados([pdf])[pdf].preguntas;
  assert.deepEqual(s.map((q) => q.subrayadas.join('')), ['b', 'c', 'abcd', 'd', '', 'a']);
  for (const [i, q] of s.entries()) assert.ok(mismoInicio(ps[i].enunciado, q.inicio), `P${q.n}`);
  // Respuesta de la aparición → la de la etapa correcciones.
  const r = s.map(respuestaSubrayado).map(respuestaFuente);
  assert.deepEqual(r[0], { anulada: false, aceptadas: ['b'], dudosa: false });
  assert.equal(r[2].anulada, true);
  assert.equal(r[4].dudosa, true);
});

test('subrayado (Murcia): número de pregunta y pies de página', () => {
  const t = ['Unidad teórica 1: Prueba', '1.- Una:', 'a) x', 'b) y', '1/10', 'P.Y. - Tipo 1', 'c) z', 'd) w', 'MÓDULO DE NAVEGACIÓN', '2.', 'Dos:', 'a) 1', 'b) 2', 'c) 3', 'd) 4', 'PY - TIPO 1'].join('\n');
  const ps = analizarCuestionario(t, REGLAS_MURCIA).examenes[0].preguntas;
  assert.deepEqual(ps.map((q) => [q.numero, q.enunciado, q.opciones.d]), [[1, 'Una:', 'w'], [2, 'Dos:', '4']]);
});

test('descubrir Murcia: inventario CSV → manifiesto (PER y PY, Tipo 1/2, dos días de PER)', () => {
  const filas = leerCSV('a,b,c\n1,"2,5 KB",x\n');
  assert.deepEqual(filas, [{ a: '1', b: '2,5 KB', c: 'x' }]);
  const cfg = json('tools/bancos/ejes/murcia/config.json');
  const csv = leerCSV(readFileSync(join(RAIZ, 'tools/bancos/ejes/murcia/manifiesto_murcia.csv'), 'utf8'));
  const docs = csv.map((r) => documento(r, cfg)).filter(Boolean);
  assert.equal(docs.length, 69);
  assert.equal(docs.filter((d) => d.tit === 'per').length, 36);
  const d09 = docs.find((d) => d.archivo === 'murcia_2020-10_PER_T1_d09.pdf');
  assert.equal(d09.modelo, 'T1-d09');
  assert.equal(d09.fecha, '2021-01-09');
  assert.equal(docs.find((d) => d.archivo === 'murcia_2026-06_PY_T2.pdf').fecha, '2026-06-13');
  assert.ok(docs.every((d) => cfg.convocatorias.some((c) => c.clave === d.claveConv)));
  const man = json('tools/bancos/ejes/murcia/manifiesto.json');
  assert.deepEqual(man.documentos.map((d) => d.archivo).sort(), docs.map((d) => d.archivo).sort());
  assert.equal(cfg.salida, 'cache');
  assert.equal(cfg.informeEnCache, true);
});

test('Murcia: no se sube nada de sus preguntas (ni banco ni informe con textos)', () => {
  assert.ok(!existsSync(join(RAIZ, 'data/ejes/murcia')), 'data/ejes/murcia no debe existir (licencia de uso personal)');
  if (existsSync(join(RAIZ, 'tools/bancos/informes/murcia.md'))) {
    const md = readFileSync(join(RAIZ, 'tools/bancos/informes/murcia.md'), 'utf8');
    assert.doesNotMatch(md, /\|\s*(Enunciado|Texto A)\s*\|/);
  }
  const ficheros = readdirSync(join(RAIZ, 'tools/bancos/ejes/murcia'));
  assert.ok(ficheros.every((f) => !/\.pdf$/i.test(f) && f !== 'preguntas.json'));
});

test('verificar (Murcia): falta, página del CAPTCHA guardada, tamaño y PDF correcto', () => {
  const dir = mkdtempSync(join(tmpdir(), 'murcia-'));
  try {
    const doc = { archivo: 'x.pdf', pagina: 'https://www.carm.es/…', tamanoPublicado: '5,00 KB' };
    assert.equal(verificarArchivo(join(dir, 'x.pdf'), doc).estado, 'FALTA');
    writeFileSync(join(dir, 'captcha.pdf'), '<!DOCTYPE html><html><title>Radware Captcha Page</title><script src="https://validate.perfdrive.com/"></script></html>');
    assert.equal(verificarArchivo(join(dir, 'captcha.pdf'), doc).estado, 'CAPTCHA');
    writeFileSync(join(dir, 'corto.pdf'), `%PDF-1.7\n${'x'.repeat(100)}`);
    assert.equal(verificarArchivo(join(dir, 'corto.pdf'), doc).estado, 'TAMAÑO');
    writeFileSync(join(dir, 'bueno.pdf'), `%PDF-1.7\n${'x'.repeat(5111)}`);
    assert.equal(verificarArchivo(join(dir, 'bueno.pdf'), doc).estado, 'OK');
    assert.ok(esPaginaCaptcha('<html>perfdrive</html>'));
    assert.ok(!esPaginaCaptcha('%PDF-1.7'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Muestras reales de Murcia (6 PDF descargados al investigar; no se suben). Ruta: MURCIA_MUESTRAS o la del scratchpad.
const MUESTRAS = process.env.MURCIA_MUESTRAS ?? '/tmp/claude-0/-home-user-mis-cosas/1ed25e87-cf04-586d-9dc7-3c5b3383751a/scratchpad/murcia/pdfs';
const hayMuestras = existsSync(join(MUESTRAS, 'PY_2026-06_T1.pdf'));

test('subrayado (Murcia): las 6 muestras reales (se salta si no están)', { skip: !(hayMuestras && conPyMuPDF && conPdftotext) && 'sin las muestras de Murcia' }, () => {
  const esperado = { 'PER_2026-06_T1.pdf': 45, 'PY_2026-06_T1.pdf': 40, 'PY_2026-06_T2.pdf': 40, 'PY_74751.pdf': 40, 'PY_74777.pdf': 40, 'PY_74779.pdf': 40 };
  const pdfs = Object.keys(esperado).map((f) => join(MUESTRAS, f));
  const sub = leerSubrayados(pdfs);
  for (const [f, n] of Object.entries(esperado)) {
    const pdf = join(MUESTRAS, f);
    const ps = leerMurcia(pdf);
    const s = sub[pdf].preguntas;
    assert.equal(ps.length, n, `${f}: preguntas en el texto`);
    assert.equal(s.length, n, `${f}: preguntas con subrayado`);
    const raras = s.filter((q) => q.subrayadas.length !== 1).map((q) => `${q.n}:${q.subrayadas.join('')}`);
    // PY de noviembre de 2015: la P31 tiene las cuatro opciones subrayadas (comprobado sobre la imagen).
    assert.deepEqual(raras, f === 'PY_74779.pdf' ? ['31:abcd'] : [], f);
  }
  // Tipo 1 y Tipo 2 de junio de 2026 (PY): mismo juego barajado → el texto de la opción subrayada coincide.
  const t1 = leerMurcia(join(MUESTRAS, 'PY_2026-06_T1.pdf'));
  const t2 = leerMurcia(join(MUESTRAS, 'PY_2026-06_T2.pdf'));
  const s1 = sub[join(MUESTRAS, 'PY_2026-06_T1.pdf')].preguntas;
  const s2 = sub[join(MUESTRAS, 'PY_2026-06_T2.pdf')].preguntas;
  const norm = (x) => String(x).replace(/[’´']/g, "'").replace(/\s+/g, ' ').trim();
  let iguales = 0;
  for (let i = 0; i < 40; i++) {
    const o1 = s1[i].textos[s1[i].subrayadas[0]] ?? t1[i].opciones[s1[i].subrayadas[0]];
    const o2 = s2[i].textos[s2[i].subrayadas[0]] ?? t2[i].opciones[s2[i].subrayadas[0]];
    if (norm(o1) === norm(o2)) iguales++;
  }
  assert.equal(iguales, 40);
});

test('ocr: esbozo con interfaz de adaptador que avisa de que no está implementado', () => {
  assert.equal(typeof ocr.extraer, 'function');
  assert.equal(typeof ocr.ocrPagina, 'function');
  const avisos = [];
  const ctx = { eje: 'dgmm', config: {}, documentos: [{ tit: 'per', archivo: 'x.pdf' }], avisos: { add: (t, m) => avisos.push(m) } };
  const r = ocr.extraer(ctx, 'per');
  assert.deepEqual(r.apariciones, []);
  assert.equal(r.resumen.pendientes, 1);
  assert.match(avisos[0], /ocr/i);
  assert.throws(() => ocr.ocrPagina('x.pdf', 1), /no implementado/i);
});

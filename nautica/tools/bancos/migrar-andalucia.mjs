// Migración única (fase F0): convierte los bancos antiguos de Andalucía (data/exams/andalucia-*.json) al formato
// normalizado por ejes de docs/BANCOS.md y saca la práctica de cada clase de data/curso/<tit>.json a
// data/ejes/andalucia/<tit>/practica.json.
//
//   node tools/bancos/migrar-andalucia.mjs            lee los bancos antiguos del commit BASE (git show)
//   node tools/bancos/migrar-andalucia.mjs --desde d  los lee de un directorio con los ficheros antiguos
//
// Es reproducible: el resultado no depende de nada más que de los ficheros de BASE. Escribe también
// tools/bancos/andalucia-huella.json, la huella de cada pregunta antigua (enunciado, opciones, correcta, anulada y
// tema), con la que tests/bancos.test.js comprueba que la migración no ha cambiado ninguna.
// Los ids y las claves de convocatoria no cambian: el progreso guardado de los alumnos los usa.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Último commit con los bancos antiguos (main antes de la fase F0). */
export const BASE = 'a51be5c486f6cd2a881df3aa8724a49a5188088e';
const EJE = 'andalucia';
const GENERADO = '2026-10-07';
const FUENTE = 'https://www.juntadeandalucia.es/organismos/culturapatrimoniohistoricoydeporte/areas/deporte/formacion-investigacion-innovacion/titulaciones-nauticas/paginas/cuestionarios-examenes.html';

/** Huella de lo que el alumno ve y se corrige de una pregunta: si cambia, cambia la pregunta. */
export function huella(q) {
  const datos = [q.enunciado, q.opciones, q.correcta ?? null, !!q.anulada, q.ut];
  return createHash('sha256').update(JSON.stringify(datos)).digest('hex').slice(0, 16);
}

/** Clave de convocatoria a partir del id antiguo (la misma que guardaba el progreso). */
const convDe = (id) => id.replace(/-[tqgn]\d+$/, '');

function lector(desde) {
  if (desde) return (f) => readFileSync(join(desde, f.split('/').pop()));
  return (f) => execFileSync('git', ['show', `${BASE}:nautica/${f}`], { cwd: RAIZ, maxBuffer: 1 << 28 });
}

/** Pregunta antigua → pregunta normalizada (todas las claves del contrato, en su orden). */
function normaliza(q, { tit, carta = false, paginas = {} }) {
  const conv = convDe(q.id);
  const correcta = q.anulada ? null : (q.correcta ?? null);
  const fuentes = q.fuentes
    ? { examen: q.fuentes.examen ?? null, plantilla: q.fuentes.plantilla ?? null, pagina: q.fuentes.pagina ?? null, correccion: null }
    : { examen: q.fuente_examen ?? null, plantilla: q.fuente_plantilla ?? null, pagina: q.pagina_convocatoria ?? paginas[conv] ?? null, correccion: null };
  const orden = q.orden ?? q.numero;
  const apareceEn = tit === 'py'
    ? [{ conv, modelo: null, numero: orden }]
    : [{ conv, modelo: 'A', numero: q.numero }, ...(q.numero_modelo_B != null ? [{ conv, modelo: 'B', numero: q.numero_modelo_B }] : [])];
  return {
    id: q.id,
    eje: EJE,
    tit,
    conv,
    convocatoria: q.convocatoria,
    fecha: q.fecha,
    numero: q.numero,
    orden,
    modulo: q.modulo ?? null,
    ut: carta ? 11 : q.ut,
    ut_titulo: carta ? 'Carta de navegación' : q.ut_titulo,
    bloque: q.bloque ?? null,
    enunciado: q.enunciado,
    opciones: q.opciones,
    correcta,
    aceptadas: correcta ? [correcta] : [],
    anulada: !!q.anulada,
    requiere: carta || q.bloque === 'carta' ? ['carta'] : [],
    figuras: q.figuras ?? [],
    contexto: q.contexto ?? null,
    tabla_mareas: q.tabla_mareas ?? null,
    apareceEn,
    fuentes,
    norma: { estado: 'vigente' },
    concepto: null,
    notas: q.notas ?? '',
  };
}

/** Una pregunta por línea: legible y con diferencias limpias en git. */
const textoBanco = (meta, preguntas) => `{"meta":${JSON.stringify(meta)},\n"preguntas":[\n${preguntas.map((q) => JSON.stringify(q)).join(',\n')}\n]}\n`;
const textoMapa = (o) => `{\n${Object.entries(o).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}\n`;

export function migrar({ desde = null } = {}) {
  const leer = lector(desde);
  const json = (f) => JSON.parse(leer(f).toString('utf8'));
  const antiguas = {
    per: [...json('data/exams/andalucia-per-teoria.json').preguntas.map((q) => ({ q, carta: false })),
      ...json('data/exams/andalucia-per.json').preguntas.map((q) => ({ q, carta: true }))],
    py: json('data/exams/andalucia-py-teoria.json').preguntas.map((q) => ({ q, carta: false })),
  };
  // La página de cada convocatoria del PER solo venía en las preguntas de carta: se da también a las de teoría.
  const paginas = {};
  for (const { q } of antiguas.per) if (q.pagina_convocatoria) paginas[convDe(q.id)] ??= q.pagina_convocatoria;

  const huellas = {};
  const out = {};
  for (const tit of ['per', 'py']) {
    const preguntas = antiguas[tit].map(({ q, carta }) => normaliza(q, { tit, carta, paginas }));
    for (const { q, carta } of antiguas[tit]) huellas[q.id] = huella({ ...q, ut: carta ? 11 : q.ut });
    for (const q of preguntas) if (huella(q) !== huellas[q.id]) throw new Error(`La migración cambia ${q.id}`);
    const sigla = tit.toUpperCase();
    const meta = { eje: EJE, tit, titulo: `${sigla} · Andalucía`, generado: GENERADO, fuente: FUENTE,
      descripcion: `Preguntas de los exámenes oficiales de ${tit === 'per' ? 'Patrón de Embarcaciones de Recreo' : 'Patrón de Yate'} de la Junta de Andalucía (2020–2026) con la respuesta de la plantilla oficial.` };
    out[`data/ejes/${EJE}/${tit}/preguntas.json`] = textoBanco(meta, preguntas);
    // Práctica de cada clase: sale del curso (la clase es nacional; sus preguntas, del eje).
    const curso = json(`data/curso/${tit}.json`);
    const practica = {};
    for (const m of curso.modulos) for (const l of m.lecciones) if (l.practica) practica[l.id] = l.practica;
    out[`data/ejes/${EJE}/${tit}/practica.json`] = textoMapa(practica);
  }
  out['tools/bancos/andalucia-huella.json'] = textoMapa(huellas);
  for (const [f, txt] of Object.entries(out)) {
    mkdirSync(dirname(join(RAIZ, f)), { recursive: true });
    writeFileSync(join(RAIZ, f), txt);
  }
  // El curso actual, sin la práctica (si aún la lleva): mismo formato que el fichero original.
  for (const tit of ['per', 'py']) {
    const f = join(RAIZ, `data/curso/${tit}.json`);
    if (!existsSync(f)) continue;
    const curso = JSON.parse(readFileSync(f, 'utf8'));
    let cambia = false;
    for (const m of curso.modulos) for (const l of m.lecciones) if ('practica' in l) { delete l.practica; cambia = true; }
    if (cambia) writeFileSync(f, JSON.stringify(curso, null, 1));
  }
  return Object.keys(out);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const i = process.argv.indexOf('--desde');
  const escritos = migrar({ desde: i > 0 ? process.argv[i + 1] : null });
  console.log(`Escritos:\n${escritos.join('\n')}`);
}

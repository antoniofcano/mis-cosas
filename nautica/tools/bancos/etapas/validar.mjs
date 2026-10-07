// Etapa 7 · validar
// Entrada: normativa-<tit>.json (y las salidas de las etapas anteriores, para el informe).
// Salida: validar-<tit>.json → { errores, avisos } y el informe tools/bancos/informes/<eje>.md (se sube).
// Puertas de calidad del contrato (un error impide escribir en data/ejes):
//   - 4 opciones a–d no vacías (o excepción documentada en config.excepciones[id]);
//   - correcta ∈ aceptadas ⊆ opciones, o anulada con correcta null y aceptadas [];
//   - ut dentro de la estructura de la titulación; conv, fecha y fuentes.examen presentes;
//   - ids únicos;
//   - cada examen (convocatoria + modelo) con 45 (PER) o 40 (PY) preguntas, salvo huecos documentados (config.huecos).
import { join } from 'node:path';
import { BANCOS, cacheEje, escribirJSON, escribirTexto, hoy, leerJSON, rutaEtapa } from '../lib/comun.mjs';

const N_UT = { per: 11, py: 4 };

export function validarPreguntas(preguntas, { tit, config = {} }) {
  const errores = [];
  const avisos = [];
  const exc = config.excepciones ?? {};
  const ids = new Set();
  for (const p of preguntas) {
    const e = (t) => (exc[p.id] ? avisos.push(`${p.id}: ${t} (excepción documentada: ${exc[p.id]})`) : errores.push(`${p.id}: ${t}`));
    if (ids.has(p.id)) errores.push(`${p.id}: id repetido`);
    ids.add(p.id);
    const letras = Object.keys(p.opciones ?? {});
    if (letras.join('') !== 'abcd' || letras.some((l) => !String(p.opciones[l] ?? '').trim())) e(`opciones ${letras.join('') || '—'} (se esperaban a–d no vacías)`);
    if (!String(p.enunciado ?? '').trim()) e('enunciado vacío');
    if (p.anulada) {
      if (p.correcta !== null || p.aceptadas.length) e('anulada con respuesta');
    } else {
      if (!p.correcta) e('sin respuesta correcta');
      else if (!p.aceptadas.includes(p.correcta)) e(`correcta ${p.correcta} fuera de aceptadas`);
      if (p.aceptadas.some((l) => !letras.includes(l))) e(`aceptadas ${p.aceptadas.join(',')} fuera de las opciones`);
    }
    if (!(p.ut >= 1 && p.ut <= N_UT[tit])) e(`ut ${p.ut} fuera de 1–${N_UT[tit]}`);
    if (!p.conv) e('sin conv');
    if (!p.fecha) avisos.push(`${p.id}: sin fecha`);
    if (!p.fuentes?.examen) e('sin fuentes.examen');
  }
  return { errores, avisos };
}

/** Recuento de preguntas por examen (convocatoria + modelo) a partir de las apariciones. */
export function recuentos(preguntas) {
  const c = new Map();
  for (const p of preguntas) for (const a of p.apareceEn) {
    const k = `${a.conv} · ${a.modelo ?? '—'}`;
    c.set(k, (c.get(k) ?? 0) + 1);
  }
  return [...c.entries()].sort(([a], [b]) => a.localeCompare(b));
}

const tabla = (cab, filas) => (filas.length ? [`| ${cab.join(' | ')} |`, `|${cab.map(() => '---').join('|')}|`, ...filas.map((f) => `| ${f.map((x) => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)].join('\n') : '_Ninguna._');

export async function validar(ctx) {
  const out = {};
  const secciones = [];
  const { config, eje } = ctx;
  const man = leerJSON(join(BANCOS, 'ejes', eje, 'manifiesto.json'), { documentos: [] });
  for (const tit of ctx.tits) {
    const d = leerJSON(rutaEtapa(eje, 'normativa', tit));
    const preguntas = d.preguntas;
    const { errores, avisos } = validarPreguntas(preguntas, { tit, config });
    const esperado = tit === 'per' ? 45 : 40;
    const porExamen = recuentos(preguntas);
    const huecos = config.huecos ?? {};
    // PY de Andalucía: dos cuadernillos de 20 → se cuentan por convocatoria.
    const cuenta = config.titulaciones[tit].disposicion === 'py-modulos'
      ? [...preguntas.reduce((m, p) => m.set(p.conv, (m.get(p.conv) ?? 0) + 1), new Map())].sort()
      : porExamen;
    for (const [k, n] of cuenta) {
      if (n === esperado) continue;
      const doc = huecos[k.split(' · ')[0]] ?? huecos[k];
      (doc ? avisos : errores).push(`${k}: ${n} preguntas (se esperaban ${esperado})${doc ? ` — hueco documentado: ${doc}` : ''}`);
    }
    escribirJSON(rutaEtapa(eje, 'validar', tit), { errores, avisos });
    const convs = [...new Set(preguntas.map((p) => p.conv))];
    const apariciones = preguntas.reduce((s, p) => s + p.apareceEn.length, 0);
    const revisar = preguntas.filter((p) => p.norma?.estado === 'revisar');
    const porNorma = {};
    for (const p of revisar) for (const n of p.norma.normas) (porNorma[n] ??= []).push(p.id);
    const multiples = preguntas.filter((p) => p.aceptadas.length > 1);
    const L = [];
    L.push(`## ${tit.toUpperCase()}`, '');
    L.push(`- Apariciones extraídas: **${apariciones}** en ${porExamen.length} exámenes (convocatoria · modelo) de ${convs.length} convocatorias.`);
    L.push(`- Preguntas distintas: **${preguntas.length}** (${preguntas.filter((p) => p.apareceEn.length > 1).length} aparecen más de una vez).`);
    L.push(`- Anuladas: **${preguntas.filter((p) => p.anulada).length}** · con varias respuestas aceptadas: **${multiples.length}** · con norma a revisar: **${revisar.length}** · requieren carta: ${preguntas.filter((p) => p.requiere.includes('carta')).length} · requieren anuario: ${preguntas.filter((p) => p.requiere.includes('anuario')).length}.`);
    L.push(`- Puertas de calidad: **${errores.length} errores**, ${avisos.length} avisos.`, '');
    if (errores.length) L.push('### Errores', '', ...errores.slice(0, 200).map((x) => `- ${x}`), errores.length > 200 ? `- … y ${errores.length - 200} más` : '', '');
    if (avisos.length) L.push('### Avisos', '', ...avisos.slice(0, 200).map((x) => `- ${x}`), avisos.length > 200 ? `- … y ${avisos.length - 200} más` : '', '');
    const porCuadernillo = config.titulaciones[tit].disposicion === 'py-modulos' ? 20 : esperado;
    L.push('### Preguntas por examen', '', tabla(['Examen (conv · modelo)', 'Preguntas'], porExamen.map(([k, n]) => [k, n === porCuadernillo ? n : `**${n}**`])), '');
    L.push('### Anuladas y respuestas múltiples', '', tabla(['id', 'Estado', 'Notas'], [...preguntas.filter((p) => p.anulada), ...multiples].map((p) => [p.id, p.anulada ? 'anulada' : `aceptadas ${p.aceptadas.join(', ')}`, (p.notasCorreccion ?? []).join(' ').slice(0, 300)])), '');
    L.push('### Conflictos de respuesta entre apariciones', '', tabla(['id', 'Enunciado', 'Respuestas'], (d.conflictos ?? []).map((c) => [c.id, c.enunciado, c.respuestas.join('; ')])), '');
    L.push('### Lecturas dudosas o sin respuesta', '', tabla(['id', 'Motivo', 'Detalle'], (d.dudas ?? []).map((c) => [c.id, c.motivo, c.detalle.join('; ')])), '');
    L.push('### Correcciones publicadas que no encuentran su pregunta', '', tabla(['conv', 'modelo', 'nº', 'acción'], (d.sinAplicar ?? []).map((c) => [c.conv, c.modelo, c.numero, c.accion])), '');
    L.push(`### Posibles duplicados no unidos (similitud entre 0,80 y el umbral de unión)`, '', tabla(['A', 'B', 'Similitud', 'Motivo', 'Enunciado A', 'Enunciado B'], (d.ambiguas ?? []).map((a) => [a.a, a.b, a.similitud, a.motivo, a.enunciadoA, a.enunciadoB])), '');
    if (d.emparejadas?.length) L.push('### Permutaciones emparejadas con diferencias de texto entre modelos', '', tabla(['A', 'B', 'Similitud', 'Texto A', 'Texto B'], d.emparejadas.map((a) => [a.a, a.b, a.similitud, a.enunciadoA, a.enunciadoB])), '');
    L.push('### Clasificación: preguntas atípicas para su tema', '', 'El tema sale de la posición; estas preguntas suman palabras clave de otro tema y ninguna del suyo (o el cuadernillo las pone en otra unidad). No se cambian: se revisan.', '', tabla(['id', 'UT asignada', 'Sugerida', 'Indicio', 'Enunciado'], (d.atipicas ?? []).map((a) => [a.id, a.ut, a.sugerido.join(', '), a.puntos, a.enunciado])), '');
    L.push('### Normativa: preguntas a revisar', '', tabla(['Norma', 'Preguntas', 'ids'], Object.entries(porNorma).map(([n, ids]) => [n, ids.length, ids.join(', ')])), '');
    // Revisión normativa ya hecha (ajustes.json): cuántas se marcaron por cada norma y cómo se resolvieron.
    const revisadas = preguntas.filter((p) => p.norma?.normas?.length && p.norma.estado !== 'revisar');
    if (revisadas.length) {
      const res = {};
      for (const p of revisadas) for (const n of p.norma.normas) { res[n] ??= { vigente: 0, actualizada: 0, retirada: 0 }; res[n][p.norma.estado] = (res[n][p.norma.estado] ?? 0) + 1; }
      L.push('### Normativa: revisión hecha', '', `${revisadas.length} preguntas marcadas por los detectores y revisadas contra el texto de la norma (BOE): ${['vigente', 'actualizada', 'retirada'].map((e) => `${revisadas.filter((p) => p.norma.estado === e).length} ${e}`).join(', ')}.`, '',
        tabla(['Norma', 'Vigente', 'Actualizada', 'Retirada'], Object.entries(res).map(([n, r]) => [n, r.vigente, r.actualizada, r.retirada])), '',
        tabla(['id', 'Estado', 'Por qué'], revisadas.filter((p) => p.norma.estado !== 'vigente').map((p) => [p.id, p.norma.estado, p.norma.nota ?? ''])), '');
    }
    secciones.push(L.join('\n'));
    out[tit] = { preguntas: preguntas.length, errores: errores.length, avisos: avisos.length };
  }
  const docs = man.documentos;
  const roles = docs.reduce((m, x) => m.set(x.rol, (m.get(x.rol) ?? 0) + 1), new Map());
  const cab = [
    `# Informe de extracción · ${config.nombre}`, '',
    `Generado por \`npm run bancos -- ${eje}\` el ${hoy()}. Eje \`${eje}\` (prefijo \`${config.prefijo}\`), adaptador ${JSON.stringify(config.adaptador)}, salida: ${config.salida === 'cache' ? '`.cache/bancos/' + eje + '/salida/` (no se escribe en data/ejes)' : '`data/ejes/' + eje + '/`'}.`, '',
    `Manifiesto: ${docs.length} documentos (${[...roles].map(([r, n]) => `${n} ${r}`).join(', ')}); ${docs.filter((x) => x.sha256).length} con sha256.`,
    config.notasInforme ? `\n${config.notasInforme}\n` : '', '',
  ];
  // config.informeEnCache: el informe cita textos de preguntas; si la licencia no permite publicarlas (Murcia), va a la caché.
  const rutaInforme = config.informeEnCache ? join(cacheEje(eje), 'informe.md') : join(BANCOS, 'informes', `${eje}.md`);
  escribirTexto(rutaInforme, `${cab.join('\n')}\n${secciones.join('\n\n')}\n`);
  return out;
}

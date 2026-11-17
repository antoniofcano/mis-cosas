// Lista de preguntas reales (#/<tit>/examenes/<lista>), plegada por convocatoria (H-73). Lógica sin DOM: agrupar,
// contar lo hecho y acertado, y elegir «la siguiente sin hacer». La vista está en src/ui/views/exams.js (listaView).
//
// `respuestas` es progress.get().exams: { [idPregunta]: { ok, t, … } }.

/** Estado de una pregunta del alumno: 'ok' (acertada), 'mal' (fallada) o 'sin' (sin hacer). */
export function estadoDe(respuesta) {
  if (!respuesta) return 'sin';
  return respuesta.ok ? 'ok' : 'mal';
}

/** Las preguntas, agrupadas por convocatoria en el orden de la lista: [{ conv, titulo, preguntas }]. */
export function agruparPorConvocatoria(preguntas) {
  const grupos = new Map();
  for (const q of preguntas) {
    const clave = q.conv ?? q.convocatoria ?? '';
    if (!grupos.has(clave)) grupos.set(clave, { conv: clave, titulo: q.convocatoria ?? clave, preguntas: [] });
    grupos.get(clave).preguntas.push(q);
  }
  return [...grupos.values()];
}

/** Cuántas de estas preguntas ha hecho y cuántas ha acertado el alumno. */
export function contarGrupo(preguntas, respuestas) {
  let hechas = 0;
  let acertadas = 0;
  for (const q of preguntas) {
    const e = estadoDe(respuestas?.[q.id]);
    if (e !== 'sin') hechas += 1;
    if (e === 'ok') acertadas += 1;
  }
  return { total: preguntas.length, hechas, acertadas };
}

/** «1ª Convocatoria 2020 · 40 preguntas · 12 hechas · 9 acertadas» (sin repetir lo que es cero). */
export function rotuloGrupo(grupo, respuestas) {
  const { total, hechas, acertadas } = contarGrupo(grupo.preguntas, respuestas);
  const hechasTx = hechas ? `${hechas} ${hechas === 1 ? 'hecha' : 'hechas'}` : 'ninguna hecha';
  return `${grupo.titulo} · ${total} preguntas · ${hechasTx}${hechas ? ` · ${acertadas} ${acertadas === 1 ? 'acertada' : 'acertadas'}` : ''}`;
}

/** Lo de la derecha de cada convocatoria: «25 de 40 hechas · 17 acertadas» (o «sin hacer» si no hay ninguna). */
export function contadoresGrupo(grupo, respuestas) {
  const { total, hechas, acertadas } = contarGrupo(grupo.preguntas, respuestas);
  return hechas ? `${hechas} de ${total} hechas · ${acertadas} ${acertadas === 1 ? 'acertada' : 'acertadas'}` : `${total} sin hacer`;
}

/** La pregunta de la lista que el alumno tocó en último lugar (por la hora de su última respuesta), o null. */
export function ultimaTocada(preguntas, respuestas) {
  let mejor = null;
  let mejorT = '';
  for (const q of preguntas) {
    const r = respuestas?.[q.id];
    if (!r) continue;
    const t = String(r.t ?? '');
    if (!mejor || t > mejorT) { mejor = q; mejorT = t; }
  }
  return mejor;
}

/**
 * «Seguir con la siguiente sin hacer»: la primera sin hacer después de la última que tocó el alumno; si no hay
 * ninguna detrás, la primera sin hacer de la lista. null si ya están todas hechas.
 */
export function siguienteSinHacer(preguntas, respuestas) {
  const sinHacer = (q) => estadoDe(respuestas?.[q.id]) === 'sin';
  const ultima = ultimaTocada(preguntas, respuestas);
  const desde = ultima ? preguntas.indexOf(ultima) + 1 : 0;
  return preguntas.slice(desde).find(sinHacer) ?? preguntas.find(sinHacer) ?? null;
}

/** Las primeras `n` palabras de un enunciado, con «…» si se cortó. */
export function primerasPalabras(texto, n = 8) {
  const palabras = String(texto ?? '').trim().split(/\s+/).filter(Boolean);
  return palabras.length > n ? `${palabras.slice(0, n).join(' ')}…` : palabras.join(' ');
}

/** La convocatoria sin su fecha entre paréntesis: «2ª convocatoria 2016 (18 de junio de 2016)» → «2ª convocatoria 2016». */
export const convocatoriaCorta = (t) => String(t ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();

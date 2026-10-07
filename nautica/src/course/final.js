// Examen final (F1): un examen real con preguntas reservadas que el alumno no ha estudiado nunca. Funciones puras: el
// motor (motor.js) las llama con la reserva del banco del alumno, sus respuestas, sus exámenes y su «¿Estás listo?», y
// las pantallas solo pintan lo que devuelven (también los textos).
//
// - Se abre cuando la app ve al alumno listo (listo.estado «listo»); hasta entonces dice qué le falta, con los números
//   de listo.js.
// - Modo «examen» (se reservan convocatorias): toca una convocatoria reservada que el alumno no haya visto. Una
//   convocatoria está vista si ya la hizo como examen o si respondió al menos UMBRAL_VISTA de sus preguntas (los
//   alumnos de antes de la reserva las practicaron). Si las ha visto todas, se dice: el examen ya no es inédito.
// - Modo «pregunta» (se reservan preguntas): un examen con el reparto oficial por temas, primero las no vistas.
// - «Preparado» = el último examen final, aprobado con margen (estructura.margen: más aciertos y menos fallos en los
//   temas con límite de los que pide el tribunal).

import { totalPreguntas } from '../theory/blocks.js';
import { LISTO, MIN_RESPUESTAS } from './listo.js';
import { cuenta, fechaLarga, diaISO } from '../texto.js';

export const UMBRAL_VISTA = 0.2; // fracción de preguntas respondidas a partir de la cual una convocatoria está vista
export const DIAS_FINAL = 21; // con el examen a estos días o menos, Hoy propone el examen final

const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}` : xs[0] ?? '');

/**
 * Aprobado con margen de un examen hecho (por sus aciertos y su `porTema`).
 * @returns {{ apto: boolean|null, conMargen: boolean, motivos: string[] }}
 */
export function margenExamen(estructura, t) {
  const m = estructura.margen;
  const motivos = [];
  if (!m) return { apto: t.apto ?? null, conMargen: !!t.apto, motivos };
  if (t.aciertos < m.minAciertos) motivos.push(`${cuenta(t.aciertos, 'acierto')} (para ir sobrado, ${m.minAciertos} o más)`);
  for (const [ut, max] of Object.entries(m.maxErrores ?? {})) {
    const b = estructura.bloques.find((x) => x.ut === Number(ut));
    const p = (t.porTema ?? []).find((x) => x.ut === Number(ut));
    if (!b || !p) continue;
    const errores = p.total - p.aciertos;
    if (errores > max) motivos.push(`${b.titulo}: ${cuenta(errores, 'fallo')} (para ir sobrado, ${max} como mucho)`);
  }
  return { apto: t.apto ?? null, conMargen: t.apto === true && !motivos.length, motivos };
}

/** Línea de un examen final hecho. */
function lineaResultado(r, ahora) {
  const base = `${fechaLarga(r.t, { ahora })}: ${r.aciertos} de ${r.total}`;
  if (r.apto === false) return `${base}, no apto.`;
  if (r.conMargen) return `${base}, apto con margen: estás preparado.`;
  return `${base}, apto pero sin margen: ${lista(r.motivos)}.`;
}

/**
 * Estado del examen final.
 * @param {{ estructura: object, reserva: { modo: string, examenes: { key, titulo, fecha, n, ids: string[] }[] } | null,
 *   pool: { id: string, ut: number, anulada?: boolean, correcta?: string|null, norma?: object }[], respuestas: object,
 *   tests: object[], listo: object, diasAlExamen: number|null, ahora: number }} o
 */
export function estadoFinal({ estructura, reserva = null, pool = [], respuestas = {}, tests = [], listo, diasAlExamen = null, ahora = Date.now() }) {
  const modo = reserva?.modo ?? 'examen';
  const total = totalPreguntas(estructura);
  const validas = pool.filter((q) => !q.anulada && q.correcta && q.norma?.estado !== 'retirada');
  const hay = modo === 'examen' ? !!reserva?.examenes?.length : validas.length > 0;
  const finales = tests.filter((t) => t.tipo === 'final');
  const resultados = finales.map((t) => ({ t: t.t, conv: t.conv ?? null, aciertos: t.aciertos, total: t.total, ...margenExamen(estructura, t) }));
  const ultimo = resultados.at(-1) ?? null;
  const preparado = !!ultimo?.conMargen;
  const base = { hay, modo, total, duracionMin: estructura.duracionMin, resultados, ultimo, preparado };
  if (!hay) return { ...base, desbloqueado: false, bloqueo: null, convs: [], siguiente: null, ineditas: 0, todasVistas: false, sugerir: false, lineas: [], lineasResultado: [] };

  // Lo visto de la reserva.
  let convs = [];
  let siguiente = null;
  let ineditas;
  let todasVistas;
  if (modo === 'examen') {
    convs = reserva.examenes.map((c) => {
      const respondidas = c.ids.filter((id) => respuestas[id]).length;
      const hecha = tests.some((t) => (t.tipo === 'final' || t.tipo === 'real') && t.conv === c.key);
      return { key: c.key, titulo: c.titulo, fecha: c.fecha, n: c.n, respondidas, hecha, vista: hecha || respondidas >= UMBRAL_VISTA * c.n };
    });
    const orden = (a, b) => a.respondidas - b.respondidas || String(b.fecha).localeCompare(String(a.fecha));
    const sinVer = convs.filter((c) => !c.vista).sort(orden);
    ineditas = sinVer.length;
    todasVistas = !ineditas;
    const elegida = sinVer[0] ?? convs.filter((c) => !c.hecha).sort(orden)[0] ?? [...convs].sort((a, b) => {
      const ult = (k) => finales.filter((t) => t.conv === k).at(-1)?.t ?? '';
      return ult(a.key).localeCompare(ult(b.key));
    })[0];
    siguiente = elegida ? { key: elegida.key, n: elegida.n, yaVistas: elegida.respondidas, vista: elegida.vista } : null;
  } else {
    const nuevas = validas.filter((q) => !respuestas[q.id]).length;
    ineditas = nuevas;
    todasVistas = nuevas === 0;
    siguiente = { key: null, n: total, yaVistas: Math.max(0, total - nuevas), vista: nuevas < total };
  }

  // ¿Se abre? Cuando la app te ve listo (los números, de listo.js).
  const desbloqueado = listo?.estado === 'listo';
  let bloqueo = null;
  const lineas = [];
  if (!desbloqueado) {
    if (listo?.estado === 'faltan-datos') {
      const temas = listo.temasSinDatos.map((t) => ({ ut: t.ut, titulo: t.titulo, hechas: t.hechas, necesarias: t.necesarias, faltan: Math.max(0, t.necesarias - t.hechas) }));
      bloqueo = { motivo: 'faltan-datos', temas, prob: null, objetivo: LISTO, limitante: null };
      const nombres = temas.map((t) => `${t.titulo} (${t.faltan})`);
      lineas.push(`Se abre cuando la app te vea listo. Primero, responde al menos ${cuenta(MIN_RESPUESTAS, 'pregunta')} de cada tema; te faltan: ${nombres.length > 4 ? `${nombres.slice(0, 4).join(', ')} y ${cuenta(nombres.length - 4, 'tema')} más` : lista(nombres)}.`);
    } else {
      const de10 = Math.round((listo?.prob ?? 0) * 10);
      bloqueo = { motivo: 'prob', temas: [], prob: listo?.prob ?? 0, objetivo: LISTO, limitante: listo?.limitante ?? null };
      lineas.push(`Se abre cuando aprobarías unas ${Math.round(LISTO * 10)} de cada 10 veces; ahora, unas ${de10}.`);
      if (listo?.limitante) lineas.push(`Lo que más te frena: ${listo.limitante.titulo} (aciertas el ${listo.limitante.pct} %).`);
    }
  } else if (modo === 'examen') {
    const n = convs.length;
    if (todasVistas) {
      lineas.push(`Ya has visto ${n === 1 ? 'la convocatoria reservada' : `las ${n} convocatorias reservadas`} (las hiciste o respondiste sus preguntas al estudiar): este examen ya no es inédito y cuenta como un simulacro más.`);
    } else {
      lineas.push(`Una convocatoria real que no has visto al estudiar (te ${ineditas === 1 ? 'queda 1' : `quedan ${ineditas}`} de ${n}): ${cuenta(siguiente.n, 'pregunta')}, ${cuenta(estructura.duracionMin, 'minuto')}, sin ayudas.`);
      if (siguiente.yaVistas) lineas.push(`De esta convocatoria ya habías respondido ${cuenta(siguiente.yaVistas, 'pregunta')} antes de la reserva.`);
    }
  } else if (todasVistas) {
    lineas.push('Ya has respondido todas las preguntas reservadas: este examen ya no es inédito y cuenta como un simulacro más.');
  } else {
    lineas.push(`${cuenta(total, 'pregunta')} reservadas que no se estudian, con el reparto oficial por temas: ${ineditas >= total ? 'ninguna vista' : `${cuenta(ineditas, 'nueva', 'nuevas')} y el resto ya vistas`}. ${cuenta(estructura.duracionMin, 'minuto')}, sin ayudas.`);
  }

  // Hoy lo propone si estás listo, el examen está cerca, aún no estás preparado, queda algo inédito y hoy no lo has hecho.
  const hoy = diaISO(ahora);
  const hechoHoy = finales.some((t) => t.t && diaISO(new Date(t.t).getTime()) === hoy);
  const sugerir = desbloqueado && !preparado && ineditas > 0 && diasAlExamen != null && diasAlExamen >= 0 && diasAlExamen <= DIAS_FINAL && !hechoHoy;

  return { ...base, desbloqueado, bloqueo, convs, siguiente, ineditas, todasVistas, sugerir, lineas,
    lineasResultado: resultados.slice(-3).reverse().map((r) => lineaResultado(r, ahora)) };
}

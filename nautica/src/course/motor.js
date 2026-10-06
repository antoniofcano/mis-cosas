// Motor de seguimiento: TODOS los números que la app enseña al alumno salen de aquí, de una sola pasada y de los
// mismos datos. Las pantallas (Hoy, Progreso, Plan, Temario, cierres, Ajustes) solo pintan lo que devuelve; no
// calculan nada por su cuenta. Así no pueden contradecirse: los minutos, las preguntas hechas, el avance del camino,
// el plan, la fecha de fin y el mensaje del día son el mismo estado visto desde sitios distintos.
//
// Es una función pura: entra una foto del progreso y sale el estado. Sus reglas (invariantes) se comprueban en
// tests/motor.test.js con sesiones de estudio simuladas.

import { bloquesEnOrden } from '../theory/blocks.js';
import { estadoTema, avance, planHoy, ritmoEstudio, diasHasta, temasFlojos, clasesFlojas } from './plan.js';
import { avanceCamino, unidades, temasDePocoPeso, crearPlan, planCaducado, seguimiento, alternativaEsencial, describir, duracion } from './calendario.js';
import { estoyListo } from './listo.js';
import { SEG_TARJETA } from './engine.js';
import { cuenta, fechaLarga, diaISO } from '../texto.js';
import { colaRepaso, repasoDelDia, sumaDias } from './repaso.js';

/**
 * @typedef {object} Entrada
 * @property {object} estructura  estructura del examen (theory/blocks.js)
 * @property {object|null} curso
 * @property {object[]} preguntas  banco de la titulación
 * @property {Record<string, object>} regs  registros de clases (progress.lecciones())
 * @property {Record<string, object>} respuestas  progress.get().exams
 * @property {object[]} tests  tests hechos de la titulación
 * @property {object|null} testEnCurso
 * @property {string} tit
 * @property {object} settings  progress.settings()
 * @property {number} minutosHoy  progress.minutosHoy()
 * @property {number} racha  progress.racha()
 * @property {object|null} planGuardado  progress.planEstudio(tit)
 * @property {number} ahora
 */

/** El estado del alumno: lo único que leen las pantallas. @param {Entrada} e */
export function estadoAlumno(e) {
  const s = e.settings ?? {};
  const tit = e.tit;
  const objetivo = s.minutosDia ?? 20;
  const segTarjeta = s.segTarjeta ?? SEG_TARJETA;
  const fechaExamen = s[`examen_${tit}`] || null;
  const esencial = !!s[`planEsencial_${tit}`];
  const chuletasLeidas = s[`chuletasLeidas_${tit}`] ?? [];
  // Los datos que comparten todos los cálculos (una sola fuente).
  const d = {
    estructura: e.estructura, curso: e.curso, preguntas: e.preguntas, regs: e.regs ?? {}, respuestas: e.respuestas ?? {}, tests: e.tests ?? [],
    testEnCurso: e.testEnCurso ?? null, fechaExamen, ultimoMezclado: s[`mezclado_${tit}`] || null, segTarjeta, minutosDia: objetivo,
    minutosHoy: e.minutosHoy ?? 0, esencial, chuletasLeidas, ahora: e.ahora ?? Date.now(),
  };

  // Día: minutos y meta.
  const dia = { minutos: d.minutosHoy, objetivo, cumplida: d.minutosHoy >= objetivo, racha: e.racha ?? 0, quedan: Math.max(0, objetivo - d.minutosHoy) };

  // Temas (en el orden de estudio) y camino.
  const temas = bloquesEnOrden(d.estructura).map((b) => ({ b, e: estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora) }));
  const camino = { ...avance(d.estructura, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora), ...avanceCamino(d) };

  // Plan con fecha (si la hay): el guardado si sigue valiendo; si no, uno nuevo (la pantalla lo guarda).
  let plan = null;
  if (fechaExamen) {
    const diasEstudio = s.diasEstudio ?? 'todos';
    let base = e.planGuardado ?? null;
    let nuevo = false;
    if (planCaducado(base, fechaExamen, objetivo, diasEstudio, esencial)) { base = crearPlan(d, { fechaExamen, minutosDia: objetivo, diasEstudio, ahora: d.ahora }); nuevo = true; }
    if (base) {
      const seg = seguimiento(base, d, { ahora: d.ahora });
      const alt = seg.estado === 'no-llega' && !esencial ? alternativaEsencial(d, { fechaExamen, minutosDia: objetivo, diasEstudio, ahora: d.ahora }) : null;
      plan = { base, seg, alt, nuevo };
    }
  }

  // Actividades del día; con el plan esencial, en un tema de poco peso toca su chuleta en vez de la clase.
  const actividades = planHoy(d);
  let principal = actividades[0];
  if (esencial && principal.tipo === 'clase' && temasDePocoPeso(d.estructura).includes(principal.ut)) {
    const u = unidades(d).find((x) => x.id === `chuleta:${principal.ut}`);
    if (u && !u.hecha) principal = { tipo: 'chuleta', titulo: u.titulo, verbo: 'Leer', minutos: u.minutos, ruta: u.ruta, query: undefined, ut: u.ut };
  }

  // Repaso espaciado visible: cuántas falladas vuelven hoy y cuántas mañana.
  const hoyISO = diaISO(d.ahora);
  const cola = colaRepaso(d.preguntas, d.respuestas, hoyISO);
  const repaso = { hoy: cola.hoy.length, manana: repasoDelDia(d.preguntas, d.respuestas, sumaDias(hoyISO, 1), hoyISO), total: cola.total };

  // Dónde fallas más: por tema en cuanto hay 5 respuestas; por clase, con 3 de la misma clase.
  const flojos = { temas: temasFlojos(d.estructura, d.preguntas, d.respuestas), clases: clasesFlojas(d.curso, d.respuestas) };

  const ritmo = ritmoEstudio(d);
  const listo = estoyListo(d.estructura, d.preguntas, d.respuestas, d.tests);
  const mensaje = mensajeDelDia({ dia, plan, ritmo, fechaExamen, objetivo, principal, ahora: d.ahora });
  const diasAlExamen = fechaExamen ? diasHasta(fechaExamen, d.ahora) : null;

  return { tit, datos: d, dia, temas, camino, plan, actividades, principal, ritmo, listo, repaso, flojos, mensaje, fechaExamen, diasAlExamen, orientativa: !!s[`examenOrientativo_${tit}`] };
}

/**
 * El mensaje del día. Los estados se excluyen: nunca «has cumplido» y «hoy te tocan…» a la vez.
 * - terminado: no queda nada del plan.
 * - hecho / hecho-atraso: la meta de hoy está cumplida (con atraso se dice cuánto queda, sin pedir más hoy).
 * - descanso: hoy no es día de estudio en el plan.
 * - toca: lo normal; el texto dice cómo vas (la actividad la pinta la tarjeta, no se repite aquí).
 * @returns {{ tipo: 'terminado'|'hecho'|'hecho-atraso'|'descanso'|'toca', texto: string, detalle: string|null, aviso: boolean }}
 */
export function mensajeDelDia({ dia, plan, ritmo, fechaExamen, objetivo, principal, ahora = Date.now() }) {
  const seg = plan?.seg ?? null;
  if (principal?.tipo === 'examen-en-curso') return { tipo: 'toca', texto: 'Tienes un examen a medias: termínalo.', detalle: null, aviso: false };
  if (seg ? seg.estado === 'terminado' : !ritmo.minutosPendientes) return { tipo: 'terminado', texto: 'Has hecho todo el plan: ahora, simulacros y repasar tus fallos.', detalle: null, aviso: false };
  if (dia.cumplida) {
    // Hoy no se pide más; pero si con estos minutos no se llega al examen, se dice (es una decisión que tomar).
    const noLlega = seg?.estado === 'no-llega';
    const detalle = noLlega ? `Pero con ${cuenta(objetivo, 'minuto')} al día no llegas al examen: hacen falta unos ${seg.futuro.minutosNecesarios}.` : null;
    const atraso = seg && (seg.estado === 'atrasado' || noLlega) && seg.atrasadas.length;
    if (atraso) return { tipo: 'hecho-atraso', texto: `Hoy has cumplido. Queda por recuperar ${describir(seg.atrasadas)} (${duracion(seg.minutosAtraso)}), repartido en los próximos días.`, detalle, aviso: noLlega };
    return { tipo: 'hecho', texto: 'Hoy has cumplido.', detalle, aviso: noLlega };
  }
  if (seg?.descansoHoy) return { tipo: 'descanso', texto: 'Hoy es día de descanso en tu plan.', detalle: null, aviso: false };
  if (seg) {
    if (seg.estado === 'no-llega') {
      const falta = seg.futuro.fuera.reduce((t, u) => t + u.minutos, 0);
      return { tipo: 'toca', texto: `Con ${cuenta(objetivo, 'minuto')} al día no te da tiempo: se quedarían fuera ${describir(seg.futuro.fuera)} (${duracion(falta)}).`,
        detalle: `Para llegar, unos ${cuenta(seg.futuro.minutosNecesarios, 'minuto')} al día.`, aviso: true };
    }
    if (seg.estado === 'atrasado') return { tipo: 'toca', texto: `Tienes ${describir(seg.atrasadas)} por recuperar (${duracion(seg.minutosAtraso)}): empieza por ahí y llegas a tiempo.`, detalle: null, aviso: false };
    return { tipo: 'toca', texto: 'Vas al día con tu plan.', detalle: null, aviso: false };
  }
  // Sin fecha: el ritmo general.
  const fin = ritmo.fechaFin ? fechaLarga(ritmo.fechaFin, { ahora }) : null;
  const base = fin ? `A ${cuenta(objetivo, 'minuto')} al día terminas el plan el ${fin}` : `A ${cuenta(objetivo, 'minuto')} al día`;
  if (!fechaExamen || ritmo.llega == null) return { tipo: 'toca', texto: `${base}.`, detalle: ritmo.desglose.repaso ? 'Incluye repasar tus fallos.' : null, aviso: false };
  return ritmo.llega ? { tipo: 'toca', texto: `${base}, antes de tu examen.`, detalle: null, aviso: false }
    : { tipo: 'toca', texto: `${base}, después de tu examen.`, detalle: `Para llegar, unos ${cuenta(ritmo.minutosNecesarios, 'minuto')} al día.`, aviso: true };
}

/** Reglas que el estado cumple siempre (para los tests): lista de incumplimientos, vacía si todo cuadra. */
export function invariantes(st) {
  const mal = [];
  const { dia, mensaje, temas, camino, datos: d } = st;
  if (dia.cumplida !== (dia.minutos >= dia.objetivo)) mal.push('meta cumplida no cuadra con los minutos');
  if (dia.cumplida && mensaje.tipo === 'toca') mal.push('meta cumplida y aun así «toca»');
  if (!dia.cumplida && (mensaje.tipo === 'hecho' || mensaje.tipo === 'hecho-atraso')) mal.push('«hecho» sin meta cumplida');
  if (camino.fraccion < 0 || camino.fraccion > 1) mal.push('avance fuera de 0–1');
  for (const { b, e } of temas) {
    const validas = d.preguntas.filter((q) => q.ut === b.ut && !q.anulada && q.correcta);
    const hechas = validas.filter((q) => d.respuestas[q.id]).length;
    if (e.hechas !== hechas) mal.push(`${b.titulo}: ${cuenta(e.hechas, 'pregunta hecha', 'preguntas hechas')} y hay ${hechas} respuestas`);
  }
  // Si con estos minutos no se llega, el mensaje lo dice (salvo examen a medias o día de descanso).
  if (st.plan?.seg.estado === 'no-llega' && ['toca', 'hecho', 'hecho-atraso'].includes(mensaje.tipo) && !mensaje.aviso && st.principal?.tipo !== 'examen-en-curso') mal.push('no llega y el mensaje no avisa');
  if (st.plan && st.principal?.tipo === 'clase' && !(st.principal.minutos > 0)) mal.push('actividad sin minutos');
  return mal;
}

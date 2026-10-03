// Plan de estudio con fecha en la interfaz: mantiene el plan base guardado al día con la fecha y los minutos de
// Ajustes y devuelve su seguimiento.

import { crearPlan, planCaducado, seguimiento } from '../course/calendario.js';

/** @returns {{ plan, seg } | null} null si no hay fecha de examen (o ya pasó). */
export function planConSeguimiento(progress, tit, datos) {
  const s = progress.settings();
  const fechaExamen = s[`examen_${tit}`] || null;
  const minutosDia = s.minutosDia ?? 20;
  let plan = progress.planEstudio(tit);
  if (planCaducado(plan, fechaExamen, minutosDia)) {
    plan = crearPlan(datos, { fechaExamen, minutosDia, ahora: datos.ahora });
    progress.setPlanEstudio(tit, plan);
  }
  return plan ? { plan, seg: seguimiento(plan, datos, { ahora: datos.ahora }) } : null;
}

/** Rehace el plan base desde hoy (acepta lo que se haya quedado atrás y lo vuelve a repartir). */
export function rehacerPlan(progress, tit, datos) {
  const s = progress.settings();
  progress.setPlanEstudio(tit, crearPlan(datos, { fechaExamen: s[`examen_${tit}`] || null, minutosDia: s.minutosDia ?? 20, ahora: datos.ahora }));
}

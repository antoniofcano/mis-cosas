// Por qué una pregunta de carta no trae resolución programada (o, si es anulada, por qué se resuelve igualmente).
// Puro: lo usa la vista de la pregunta (src/ui/views/exams.js, `showSolution`) y lo comprueban los tests.
// Los motivos documentados vienen de cada eje (`documentadas` de src/bancos/ejes/<eje>.js): `discrepancia` (nuestra
// resolución no llega a la opción oficial) o `sin-calculo` (no es un cálculo: se resuelve mirando la carta). Una
// pregunta anulada por el tribunal lo dice, con el acuerdo si consta en sus notas de la fuente.

/** Fecha «22-07-2019» o «14-jun-2022» → tal cual; «nota de 04-01-2022» → «04-01-2022». */
const FECHA = String.raw`\d{1,2}-(?:\d{2}|[a-z]{3})-\d{4}`;

/**
 * Lo que dice la fuente sobre la anulación: { todasValidas, acuerdo, causa } (cada uno o null).
 * - todasValidas: el tribunal dio por buena cualquier respuesta.
 * - acuerdo: «acuerdo del tribunal de 26-07-2024» o «nota informativa de 14-jun-2022».
 * - causa: la errata o el error que la anuló, si se cita.
 */
export function acuerdoAnulacion(notas = '') {
  const t = String(notas ?? '');
  const todasValidas = /todas\s+(?:las\s+respuestas\s+)?(?:se\s+dan\s+)?(?:por\s+)?(?:v[aá]lidas|correctas)|todas\s+por\s+correctas|cualquier\s+respuesta\s+se\s+considera\s+correcta/i.test(t);
  let acuerdo = null;
  const ac = t.match(new RegExp(`acuerdo del tribunal de (${FECHA})`, 'i'));
  const ni = t.match(new RegExp(`nota informativa[^"(\\d]*?(${FECHA})`, 'i'));
  const nd = t.match(new RegExp(`nota de (${FECHA})`, 'i'));
  if (ac) acuerdo = `acuerdo del tribunal de ${ac[1]}`;
  else if (ni) acuerdo = `nota informativa del tribunal de ${ni[1]}`;
  else if (nd) acuerdo = `nota del tribunal de ${nd[1]}`;
  const ca = t.match(/por (la errata [«"][^»"]+[»"](?:\s*\([^)]*\))?|un error material[^.[]*)/i);
  const causa = ca ? ca[1].replace(/"([^"]+)"/g, '«$1»').trim() : null;
  return { todasValidas, acuerdo, causa };
}

/**
 * El aviso de una pregunta de carta sin resolución programada, o de una anulada (resuelta o no).
 * @param {object} q  la pregunta ({ anulada, notas })
 * @param {{ tipo: string, texto: string } | undefined} doc  su motivo documentado (DOCUMENTADAS[id])
 * @param {{ programada?: boolean, sinMargen?: string }} [o]  si la app trae su resolución y, si llega a la oficial por
 *   poco (otra opción casi igual de próxima), el porqué (`sinMargen` de la solución)
 * @returns {{ tipo: 'anulada'|'por-poco'|'sin-calculo'|'discrepancia'|'sin-motivo', etiqueta: string, titulo: string, texto: string } | null}
 *   null: una pregunta normal con resolución programada (no hay nada que avisar).
 */
export function motivoSinSolucion(q, doc, { programada = false, sinMargen = null } = {}) {
  if (q?.anulada) {
    const { todasValidas, acuerdo, causa } = acuerdoAnulacion(q.notas);
    const partes = [`El tribunal anuló esta pregunta${acuerdo ? ` (${acuerdo})` : ''}${causa ? ` por ${causa}` : ''}.`];
    if (todasValidas) partes.push('En el examen se dieron todas las respuestas por válidas.');
    partes.push(programada
      ? 'Aun así la resolvemos para que te sirva de práctica (los pasos dicen qué datos tomamos).'
      : (doc?.texto ?? 'Todavía no la tenemos resuelta.'));
    const detalle = todasValidas ? 'se dieron todas por válidas' : causa ? 'el enunciado tenía un error' : null;
    return {
      tipo: 'anulada',
      etiqueta: 'Anulada',
      titulo: `Pregunta anulada por el tribunal${detalle ? `: ${detalle}` : ''}`,
      texto: partes.join(' '),
    };
  }
  if (programada && sinMargen) {
    return {
      tipo: 'por-poco', etiqueta: 'Por poco', titulo: 'Nuestra cuenta llega a la respuesta oficial, pero por poco',
      texto: sinMargen,
    };
  }
  if (programada) return null;
  if (doc?.tipo === 'sin-calculo') {
    return { tipo: 'sin-calculo', etiqueta: 'Mirando la carta', titulo: 'Se resuelve mirando la carta', texto: doc.texto };
  }
  if (doc?.tipo === 'discrepancia') {
    return {
      tipo: 'discrepancia', etiqueta: 'No coincide', titulo: 'Nuestra resolución no coincide con la plantilla oficial',
      texto: `${doc.texto} En el examen vale la respuesta oficial del tribunal.`,
    };
  }
  return {
    tipo: 'sin-motivo', etiqueta: 'Sin resolver', titulo: 'Todavía no tenemos esta pregunta resuelta',
    texto: 'Resuélvela en la carta con el enunciado; la respuesta oficial está arriba.',
  };
}

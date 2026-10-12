// Código propio del eje Andalucía: las soluciones programadas de sus preguntas de carta (PER y PY), escritas para
// su banco y la carta L105. Es contenido del eje, ordenado por id de pregunta; solo se registra aquí.
import per, { documentadas as perDoc } from '../../exams/solutions/andalucia-per.js';
import py, { documentadas as pyDoc } from '../../exams/solutions/andalucia-py.js';

export default {
  id: 'andalucia',
  soluciones: { ...per, ...py },
  // Preguntas de carta sin solución programada y por qué (el detalle de las discrepancias, al final de su fichero).
  documentadas: {
    ...perDoc,
    ...pyDoc,
    // Anulada sin solución programada (la vista dice además el acuerdo del tribunal, de sus notas).
    'and-py-2021-c2-n12': { tipo: 'anulada', texto: 'No la resolvemos porque el dato no encaja: en la oposición de Isla de Tarifa y Punta Alcázar estamos entre los dos faros, y Punta Alcázar queda al S (Dv 165,7°). Con una Da de 351° a ella la Ct saldría de casi 180°, imposible. Solo tendría sentido como demora a Isla de Tarifa (Dv 345,7°: Ct = −5,3°), pero eso sería cambiar el enunciado.' },
    'and-2025-c2-q45': { tipo: 'sin-calculo', texto: 'Identificar en la carta una situación donde está prohibido fondear: no hay cálculo, se comprueba mirando la carta (zonas de fondeo prohibido).' },
    },
};

// Código propio del eje Andalucía: las soluciones programadas de sus preguntas de carta (PER y PY), escritas para
// su banco y la carta L105. Es contenido del eje, ordenado por id de pregunta; solo se registra aquí.
import per from '../../exams/solutions/andalucia-per.js';
import py from '../../exams/solutions/andalucia-py.js';

export default {
  id: 'andalucia',
  soluciones: { ...per, ...py },
  // Preguntas de carta sin solución programada y por qué (el detalle de las discrepancias, al final de su fichero).
  documentadas: {
    'and-2025-c2-q45': { tipo: 'sin-calculo', texto: 'Identificar en la carta una situación donde está prohibido fondear: no hay cálculo, se comprueba mirando la carta (zonas de fondeo prohibido).' },
    'and-py-2022-c2-n11': { tipo: 'discrepancia', texto: 'En la carta, la enfilación Espartel–Malabata mide 078,6°: con la Da 078° la Ct es +0,6°, y la oficial (+2°) queda fuera de la tolerancia. El tribunal debió medir 080°.' },
  },
};

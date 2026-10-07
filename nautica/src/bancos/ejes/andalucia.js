// Código propio del eje Andalucía: las soluciones programadas de sus preguntas de carta (PER y PY), escritas para
// su banco y la carta L105. Es contenido del eje, ordenado por id de pregunta; solo se registra aquí.
import per from '../../exams/solutions/andalucia-per.js';
import py from '../../exams/solutions/andalucia-py.js';

export default {
  id: 'andalucia',
  soluciones: { ...per, ...py },
};

// Código propio del eje Illes Balears: las soluciones programadas de sus preguntas de carta (PER 42–45 y PY 31–40),
// escritas para su banco y la carta L105 del Estrecho (src/exams/solutions/baleares-<tit>-NN.js, por lotes).
// Cada fichero exporta { default: soluciones, documentadas }: `documentadas` son las preguntas de carta sin solución
// programada, con el motivo (`discrepancia` con la opción oficial, o `sin-calculo`: no se resuelve con la carta de la
// app). Las de mareas que necesitan el anuario ya no son de carta (requiere «anuario»): no se documentan aquí.
import * as per01 from '../../exams/solutions/baleares-per-01.js';
import * as per02 from '../../exams/solutions/baleares-per-02.js';
import * as per03 from '../../exams/solutions/baleares-per-03.js';
import * as per04 from '../../exams/solutions/baleares-per-04.js';
import * as per05 from '../../exams/solutions/baleares-per-05.js';
import * as py05 from '../../exams/solutions/baleares-py-05.js';
import * as py06 from '../../exams/solutions/baleares-py-06.js';
import * as py07 from '../../exams/solutions/baleares-py-07.js';
import * as py08 from '../../exams/solutions/baleares-py-08.js';

const FICHEROS = [per01, per02, per03, per04, per05, py05, py06, py07, py08];

export default {
  id: 'baleares',
  soluciones: Object.assign({}, ...FICHEROS.map((f) => f.default ?? {})),
  documentadas: Object.fromEntries(FICHEROS.flatMap((f) => Object.entries(f.documentadas ?? {})).filter(([, d]) => d.tipo !== 'anuario')),
};

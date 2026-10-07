// Índice de soluciones programadas del banco PER Andalucía (repartidas en varios ficheros): 2020–2026 en los ficheros
// 0–3 y 2015–2019 en uno por año (con sus preguntas de carta documentadas sin solución).
import p0 from './andalucia-per-0.js';
import p1 from './andalucia-per-1.js';
import p2 from './andalucia-per-2.js';
import p3 from './andalucia-per-3.js';
import p2015, { documentadas as d2015 } from './andalucia-per-2015.js';
import p2016, { documentadas as d2016 } from './andalucia-per-2016.js';
import p2017, { documentadas as d2017 } from './andalucia-per-2017.js';
import p2018, { documentadas as d2018 } from './andalucia-per-2018.js';
import p2019, { documentadas as d2019 } from './andalucia-per-2019.js';

/** Preguntas de carta de 2015–2019 sin solución programada, con su motivo. */
export const documentadas = { ...d2015, ...d2016, ...d2017, ...d2018, ...d2019 };

export default { ...p0, ...p1, ...p2, ...p3, ...p2015, ...p2016, ...p2017, ...p2018, ...p2019 };

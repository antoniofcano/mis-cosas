// Soluciones programadas de las preguntas de carta del PY Andalucía (módulo de navegación, UT 4), un fichero por año.
// Mismo formato que andalucia-per-*.js: cada `solve(k, q)` resuelve con el kit y devuelve los valores a comparar
// con las opciones. Las de mareas leen la tabla del Anuario que trae la propia pregunta (q.tabla_mareas).
// `sinCarta: true` marca las que no dibujan nada (mareas, estima analítica fuera de la carta L105).
import y2020 from './andalucia-py-2020.js';
import y2021 from './andalucia-py-2021.js';
import y2022 from './andalucia-py-2022.js';
import y2023 from './andalucia-py-2023.js';
import y2024 from './andalucia-py-2024.js';
import y2025 from './andalucia-py-2025.js';
import y2026 from './andalucia-py-2026.js';
import y2015, { documentadas as d2015 } from './andalucia-py-2015.js';
import y2016, { documentadas as d2016 } from './andalucia-py-2016.js';
import y2017, { documentadas as d2017 } from './andalucia-py-2017.js';
import y2018, { documentadas as d2018 } from './andalucia-py-2018.js';
import y2019, { documentadas as d2019 } from './andalucia-py-2019.js';

/** Preguntas de carta de 2015–2019 sin solución programada, con su motivo. */
export const documentadas = { ...d2015, ...d2016, ...d2017, ...d2018, ...d2019 };

export default { ...y2015, ...y2016, ...y2017, ...y2018, ...y2019, ...y2020, ...y2021, ...y2022, ...y2023, ...y2024, ...y2025, ...y2026 };

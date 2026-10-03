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

export default { ...y2020, ...y2021, ...y2022, ...y2023, ...y2024, ...y2025, ...y2026 };

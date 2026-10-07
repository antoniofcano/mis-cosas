// Código propio del eje DGMM (Marina Mercante, Madrid): las soluciones programadas de sus preguntas de carta (PER y PY),
// escritas para su banco y la carta L105 del Estrecho, un fichero por titulación y año (src/exams/solutions/dgmm-*.js).
// Cada fichero exporta { soluciones, documentadas }: `documentadas` son las preguntas de carta sin solución programada,
// con el motivo (discrepancia con la opción oficial, o que no es un cálculo).
import per2019 from '../../exams/solutions/dgmm-per-2019.js';
import per2020 from '../../exams/solutions/dgmm-per-2020.js';
import per2021 from '../../exams/solutions/dgmm-per-2021.js';
import per2022 from '../../exams/solutions/dgmm-per-2022.js';
import per2023 from '../../exams/solutions/dgmm-per-2023.js';
import per2024 from '../../exams/solutions/dgmm-per-2024.js';
import per2025 from '../../exams/solutions/dgmm-per-2025.js';
import per2026 from '../../exams/solutions/dgmm-per-2026.js';
import py2019 from '../../exams/solutions/dgmm-py-2019.js';
import py2020 from '../../exams/solutions/dgmm-py-2020.js';
import py2021 from '../../exams/solutions/dgmm-py-2021.js';
import py2022 from '../../exams/solutions/dgmm-py-2022.js';
import py2023 from '../../exams/solutions/dgmm-py-2023.js';
import py2024 from '../../exams/solutions/dgmm-py-2024.js';
import py2025 from '../../exams/solutions/dgmm-py-2025.js';
import py2026 from '../../exams/solutions/dgmm-py-2026.js';

const FICHEROS = [per2019, per2020, per2021, per2022, per2023, per2024, per2025, per2026, py2019, py2020, py2021, py2022, py2023, py2024, py2025, py2026];

export default {
  id: 'dgmm',
  soluciones: Object.assign({}, ...FICHEROS.map((f) => f.soluciones ?? {})),
  documentadas: Object.assign({}, ...FICHEROS.map((f) => f.documentadas ?? {})),
};

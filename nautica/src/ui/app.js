// Punto de entrada de la interfaz: carga datos, crea el contexto de los motores y enruta vistas.

import { h, clear } from './dom.js';
import { parseHash } from './router.js';
import { createChart } from '../chart/chart.js';
import { loadChartData } from '../store/datasets.js';
import { createProgressStore } from '../store/progress.js';
import { installApi } from '../ai/api.js';
import { setSharedProgress } from './chart-widget.js';
import { voice } from './voice.js';
import { homeView } from './views/home.js';
import { exerciseView } from './views/exercise.js';
import { examsView } from './views/exams.js';
import { theoryView, progressView, chartView } from './views/misc.js';
import { theoryHubView, practiceView, testView } from './views/theory.js';

const ROUTES = {
  '': homeView,
  ej: exerciseView,
  examenes: examsView,
  teoria: (o) => (o.params.parts[1] === 'ut' ? practiceView(o) : theoryHubView(o)),
  test: testView,
  conceptos: theoryView,
  progreso: progressView,
  carta: chartView,
};

async function main() {
  const root = document.getElementById('app');
  const chart = createChart(await loadChartData());
  const ctx = { chart };
  const progress = createProgressStore();
  setSharedProgress(progress);
  voice.bind(progress);
  let current = null;

  const session = { summary: () => current?.summary?.() ?? '' };
  installApi({ ctx, session });

  function render() {
    const route = parseHash();
    const view = ROUTES[route.parts[0] ?? ''] ?? homeView;
    try {
      current = view({ ctx, progress, params: route });
    } catch (e) {
      console.error(e);
      current = { el: h('div', h('h1', 'Algo ha fallado'), h('pre', String(e.stack ?? e))), summary: () => `ERROR ${e.message}` };
    }
    voice.stop();
    clear(root).append(current.el);
    document.querySelectorAll('header.top nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#/${route.parts[0] ?? ''}`));
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  render();
}

main().catch((e) => {
  document.getElementById('app').textContent = `Error al iniciar: ${e.message}`;
  console.error(e);
});

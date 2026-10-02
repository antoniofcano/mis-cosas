// Punto de entrada de la interfaz: carga datos, crea el contexto de los motores y enruta vistas.
// La app se organiza por titulación (#/per, #/py); la mesa de cartas, las láminas y el progreso son comunes.

import { h, clear } from './dom.js';
import { parseHash, navigate } from './router.js';
import { createChart } from '../chart/chart.js';
import { loadChartData } from '../store/datasets.js';
import { createProgressStore } from '../store/progress.js';
import { installApi } from '../ai/api.js';
import { setSharedProgress } from './chart-widget.js';
import { voice } from './voice.js';
import { exerciseView } from './views/exercise.js';
import { examsView } from './views/exams.js';
import { theoryView, progressView, chartView } from './views/misc.js';
import { teoriaView, examenesView, practiceView, testView } from './views/theory.js';
import { galleryView } from './views/gallery.js';
import { portadaView, dashboardView, cartaView } from './views/titulacion.js';
import { reglasView } from './views/reglas.js';
import { TITULACIONES, currentTit, setTit, tlink } from './titulacion.js';

// Rutas de una titulación: #/<tit>/<sección>/…  (tit = per | py)
const TIT_ROUTES = {
  '': dashboardView,
  teoria: (o) => (o.params.parts[1] === 'ut' ? practiceView(o) : teoriaView(o)),
  test: testView,
  carta: cartaView,
  examenes: (o) => (o.params.parts[1] ? examsView(o) : examenesView(o)),
};

// Rutas comunes a todas las titulaciones
const ROUTES = {
  '': portadaView,
  ej: exerciseView,
  examenes: examsView, // #/examenes/<banco>/<pregunta>
  mesa: chartView,
  laminas: galleryView,
  conceptos: theoryView,
  reglas: reglasView,
  progreso: progressView,
};

// Direcciones antiguas → nuevas (enlaces guardados)
function legacy(parts, progress) {
  const tit = currentTit(progress);
  if (parts[0] === 'teoria' || parts[0] === 'test') return [tit, ...parts];
  if (parts[0] === 'examenes' && !parts[1]) return [tit, 'examenes'];
  if (parts[0] === 'carta') return ['mesa'];
  if (parts[0] === 'ilustraciones') return ['laminas'];
  return null;
}

/** Cabecera: selector de titulación y menú de la titulación activa. */
function renderNav(tit, section) {
  const sw = document.getElementById('tit-switch');
  const nav = document.getElementById('nav');
  if (!sw || !nav) return;
  sw.replaceChildren(...Object.values(TITULACIONES).map((T) => h('a', { href: tlink(T.id), class: T.id === tit ? 'active' : '', title: T.nombre }, T.sigla)));
  const items = [['', 'Panel'], ['teoria', 'Teoría'], ['carta', 'Carta'], ['examenes', 'Exámenes']];
  nav.replaceChildren(
    ...items.map(([k, t]) => h('a', { href: tlink(tit, k ? [k] : []), class: section === k ? 'active' : '' }, t)),
    h('a', { href: '#/mesa', class: section === 'mesa' ? 'active' : '' }, '🗺️ Mesa'),
    h('a', { href: '#/progreso', class: section === 'progreso' ? 'active' : '' }, 'Progreso'),
  );
}

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
    const old = legacy(route.parts, progress);
    if (old) { navigate(old, route.query, { replace: true }); render(); return; }
    let view;
    let params = route;
    let tit;
    let section;
    if (TITULACIONES[route.parts[0]]) {
      tit = route.parts[0];
      setTit(progress, tit);
      params = { parts: route.parts.slice(1), query: route.query };
      section = params.parts[0] ?? '';
      view = TIT_ROUTES[section] ?? dashboardView;
      if (section === 'test') section = 'examenes';
    } else {
      tit = currentTit(progress);
      section = route.parts[0] ?? '';
      if (section === 'ej') section = 'carta';
      if (section === 'examenes') section = 'carta';
      view = ROUTES[route.parts[0] ?? ''] ?? portadaView;
    }
    document.body.dataset.tit = tit;
    renderNav(tit, route.parts.length ? section : null);
    try {
      current = view({ ctx, progress, params, tit });
    } catch (e) {
      console.error(e);
      current = { el: h('div', h('h1', 'Algo ha fallado'), h('pre', String(e.stack ?? e))), summary: () => `ERROR ${e.message}` };
    }
    voice.stop();
    clear(root).append(current.el);
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  render();
}

main().catch((e) => {
  document.getElementById('app').textContent = `Error al iniciar: ${e.message}`;
  console.error(e);
});

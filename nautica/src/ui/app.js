// Punto de entrada de la interfaz: carga datos, crea el contexto de los motores y enruta vistas.
// La app se organiza por titulación (#/per, #/py); la mesa de cartas, las láminas y el progreso son comunes.
// Navegación: barra inferior de 4 pestañas (Hoy, Temario, Examen, Más); durante una clase, una tanda de
// preguntas o un examen, «modo concentración» (body.focus) con la barra de actividad de la propia vista.

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
import { examenesView, practiceView, testView } from './views/theory.js';
import { galleryView } from './views/gallery.js';
import { cartaView } from './views/titulacion.js';
import { hoyView } from './views/hoy.js';
import { bienvenidaView } from './views/bienvenida.js';
import { reglasView } from './views/reglas.js';
import { leccionView } from './views/curso.js';
import { temarioView, temaView } from './views/temario.js';
import { masView } from './views/mas.js';
import { bibliotecaView } from './views/biblioteca.js';
import { iniciarPwa } from './pwa.js';
import { TITULACIONES, currentTit, setTit, tlink } from './titulacion.js';

// Rutas de una titulación: #/<tit>/<sección>/…  (tit = per | py)
const TIT_ROUTES = {
  '': hoyView,
  temario: (o) => (o.params.parts[1] ? temaView(o) : temarioView(o)),
  curso: leccionView, // #/<tit>/curso/<id> (sin id redirige al temario)
  laminas: galleryView,
  biblioteca: bibliotecaView,
  teoria: practiceView, // #/<tit>/teoria/ut/<n> (sin ut redirige al temario)
  test: testView,
  carta: cartaView,
  examenes: (o) => (o.params.parts[1] ? examsView(o) : examenesView(o)),
};

// Rutas comunes a todas las titulaciones
const ROUTES = {
  '': hoyView,
  bienvenida: bienvenidaView,
  ej: exerciseView,
  examenes: examsView, // #/examenes/<banco>/<pregunta>
  mesa: chartView,
  conceptos: theoryView,
  reglas: reglasView,
  progreso: progressView,
  ajustes: masView,
};

// Direcciones antiguas → nuevas (enlaces guardados)
function legacy(parts, progress) {
  const tit = currentTit(progress);
  if (!parts.length && progress.settings().onboarded !== true) return ['bienvenida'];
  if (parts[0] === 'teoria' || parts[0] === 'test') return [tit, ...parts];
  if (parts[0] === 'examenes' && !parts[1]) return [tit, 'examenes'];
  if (parts[0] === 'carta') return ['mesa'];
  if (parts[0] === 'mas') return ['ajustes'];
  if (parts[0] === 'ilustraciones' || parts[0] === 'laminas') return [tit, 'laminas'];
  if (TITULACIONES[parts[0]]) {
    if (parts[1] === 'curso' && !parts[2]) return [parts[0], 'temario'];
    if (parts[1] === 'teoria' && parts[2] !== 'ut' && parts[2] !== 'mezcla') return [parts[0], 'temario'];
  }
  return null;
}

/** Pestaña activa de la barra inferior según la ruta (§2.3). Ajustes no tiene pestaña (va en la cabecera). */
export function pestanaDe(parts) {
  const [a, b] = parts;
  if (!a || a === 'bienvenida' || a === 'progreso') return 'hoy';
  if (TITULACIONES[a]) {
    if (!b || b === 'hoy') return 'hoy';
    if (['temario', 'curso', 'teoria'].includes(b)) return 'temario';
    if (b === 'examenes' && parts[2]) return 'temario';
    if (b === 'examenes' || b === 'test') return 'examen';
    return 'biblioteca'; // biblioteca, laminas, carta
  }
  if (a === 'ej' || a === 'examenes') return 'temario';
  if (a === 'ajustes') return null;
  return 'biblioteca'; // reglas, conceptos, mesa
}

/** Modo concentración: clase, tanda de preguntas, examen y bienvenida. */
function esFoco(parts) {
  if (parts[0] === 'bienvenida') return true;
  if (!TITULACIONES[parts[0]]) return false;
  const [, b, c] = parts;
  return (b === 'curso' && !!c) || (b === 'teoria' && (c === 'ut' || c === 'mezcla')) || b === 'test';
}

/** Barra inferior: siempre las mismas 4 pestañas. */
function renderNav(tit, parts) {
  const bar = document.getElementById('tabbar');
  const label = document.getElementById('tit-label');
  if (label) label.textContent = TITULACIONES[tit].sigla;
  if (!bar) return;
  const activa = pestanaDe(parts);
  const tabs = [
    ['hoy', '🏠', 'Hoy', tlink(tit)],
    ['temario', '📚', 'Temario', tlink(tit, ['temario'])],
    ['examen', '📝', 'Examen', tlink(tit, ['examenes'])],
    ['biblioteca', '📖', 'Biblioteca', tlink(tit, ['biblioteca'])],
  ];
  bar.replaceChildren(...tabs.map(([id, icon, txt, href]) => h('a.tab', { href, class: id === activa ? 'active' : '', 'aria-current': id === activa ? 'page' : null },
    h('span.tab-icon', { 'aria-hidden': 'true' }, icon), h('span.tab-txt', txt))));
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
    if (TITULACIONES[route.parts[0]]) {
      tit = route.parts[0];
      setTit(progress, tit);
      params = { parts: route.parts.slice(1), query: route.query };
      view = TIT_ROUTES[params.parts[0] ?? ''] ?? TIT_ROUTES[''];
    } else {
      tit = currentTit(progress);
      view = ROUTES[route.parts[0] ?? ''] ?? ROUTES[''];
    }
    document.body.dataset.tit = tit;
    document.body.classList.toggle('focus', esFoco(route.parts));
    const footer = document.querySelector('body > footer');
    if (footer) footer.hidden = route.parts[0] !== 'ajustes';
    renderNav(tit, route.parts);
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

iniciarPwa();

main().catch((e) => {
  document.getElementById('app').textContent = `Error al iniciar: ${e.message}`;
  console.error(e);
});

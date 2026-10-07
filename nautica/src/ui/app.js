// Punto de entrada de la interfaz: carga datos, crea el contexto de los motores y enruta vistas.
// La app se organiza por titulación (#/per, #/py); la mesa de cartas, las láminas y el progreso son comunes.
// Navegación: barra inferior de 4 pestañas (Hoy, Temario, Examen, Más); durante una clase, una tanda de
// preguntas o un examen, «modo concentración» (body.focus) con la barra de actividad de la propia vista.

import { h, clear } from './dom.js';
import { parseHash, navigate, link } from './router.js';
import { createChart } from '../chart/chart.js';
import { loadChartData } from '../store/datasets.js';
import { createProgressStore } from '../store/progress.js';
import { installApi } from '../ai/api.js';
import { setSharedProgress } from './chart-widget.js';
import { transicion } from './movimiento.js';
import { icono } from './iconos.js';
import { voice } from './voice.js';
import { exerciseView } from './views/exercise.js';
import { preguntaView, listaView, legadoExamenesView } from './views/exams.js';
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
import { guiaView } from './views/guia.js';
import { tarjetasView } from './views/tarjetas.js';
import { planView } from './views/plan.js';
import { mapasView } from './views/mapas.js';
import { podcastView } from './views/podcast.js';
import { iniciarRadio, enVistaEpisodio } from './radio.js';
import { iniciarPwa } from './pwa.js';
import { TITULACIONES, currentTit, setTit, tlink } from './titulacion.js';
import { fijarReservaAlumno } from '../bancos/index.js';
import { fijarModoExamen, modoExamen } from './modo-examen.js';

// Rutas de una titulación: #/<tit>/<sección>/…  (tit = per | py)
const TIT_ROUTES = {
  '': hoyView,
  temario: (o) => (o.params.parts[1] ? temaView(o) : temarioView(o)),
  curso: leccionView, // #/<tit>/curso/<id> (sin id redirige al temario)
  laminas: galleryView,
  biblioteca: bibliotecaView,
  guia: guiaView, // #/<tit>/guia: cómo funciona el curso (guía de bienvenida)
  tarjetas: tarjetasView,
  plan: planView, // #/<tit>/plan: calendario hasta el examen
  mapas: mapasView, // #/<tit>/mapas[/<id>]: mapas de conceptos
  podcast: podcastView, // #/<tit>/podcast[/<id>]: la radio de a bordo (podcasts)
  teoria: practiceView, // #/<tit>/teoria/ut/<n> (sin ut redirige al temario)
  test: testView,
  carta: cartaView,
  // #/<tit>/examenes[/<lista>]; con un fichero (.json), dirección antigua de un banco
  examenes: (o) => (!o.params.parts[1] ? examenesView(o) : /\.json$/.test(o.params.parts[1]) ? legadoExamenesView(o) : listaView(o)),
};

// Rutas comunes a todas las titulaciones
const ROUTES = {
  '': hoyView,
  bienvenida: bienvenidaView,
  ej: exerciseView,
  examenes: legadoExamenesView, // #/examenes/<fichero>[/<pregunta>]: direcciones antiguas
  q: preguntaView, // #/q/<id>[?l=<lista>]: una pregunta real de examen (de cualquier eje)
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
    if (parts[1] === 'teoria' && !['ut', 'mezcla', 'repaso', 'rapido'].includes(parts[2])) return [parts[0], 'temario'];
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
  if (a === 'ej' || a === 'examenes' || a === 'q') return 'temario';
  if (a === 'ajustes') return null;
  return 'biblioteca'; // reglas, conceptos, mesa
}

/** Modo concentración: clase, tanda de preguntas, examen y bienvenida. */
function esFoco(parts) {
  if (parts[0] === 'bienvenida') return true;
  if (!TITULACIONES[parts[0]]) return false;
  const [, b, c] = parts;
  return b === 'guia' || (b === 'curso' && !!c) || (b === 'teoria' && ['ut', 'mezcla', 'repaso', 'rapido'].includes(c)) || b === 'test' || (b === 'tarjetas' && !!c);
}

/** Misma sección en la otra titulación (una clase o un tema concreto no existen en la otra: se va a su apartado). */
export function rutaEnTit(parts, id) {
  if (!TITULACIONES[parts[0]]) return null; // rutas comunes (reglas, mesa…): se queda en la misma página
  const b = parts[1];
  if (b === 'curso' || b === 'temario') return [id, 'temario'];
  if (['examenes', 'laminas', 'biblioteca', 'carta'].includes(b)) return [id, b];
  return [id];
}

/** Selector de titulación de la cabecera: «PY ▾» abre un menú con las dos y cambia ahí mismo. */
function renderSelectorTit(tit, parts, cambiarTit) {
  const det = document.getElementById('selector-tit');
  const menu = document.getElementById('menu-tit');
  if (!det || !menu) return;
  det.open = false;
  menu.replaceChildren(...Object.values(TITULACIONES).map((X) => {
    const actual = X.id === tit;
    const destino = rutaEnTit(parts, X.id);
    return h('a.opcion-tit', { href: destino ? link(destino) : location.hash || '#/', 'aria-current': actual ? 'true' : null,
      onclick: (ev) => { det.open = false; if (actual) { ev.preventDefault(); return; } if (!destino) { ev.preventDefault(); cambiarTit(X.id); } } },
    h('span.opcion-tit-sigla', `${X.icon} ${X.sigla}`), h('span.opcion-tit-nombre', X.nombre), actual ? h('span.opcion-tit-marca', { 'aria-hidden': 'true' }, '✓') : null);
  }));
}

/** Barra inferior: siempre las mismas 4 pestañas. */
function renderNav(tit, parts, cambiarTit) {
  const bar = document.getElementById('tabbar');
  const label = document.getElementById('tit-label');
  if (label) label.textContent = `${TITULACIONES[tit].sigla} ▾`;
  renderSelectorTit(tit, parts, cambiarTit);
  if (!bar) return;
  const activa = pestanaDe(parts);
  const tabs = [
    ['hoy', 'hoy', 'Hoy', tlink(tit)],
    ['temario', 'temario', 'Temario', tlink(tit, ['temario'])],
    ['examen', 'examen', 'Examen', tlink(tit, ['examenes'])],
    ['biblioteca', 'biblioteca', 'Biblioteca', tlink(tit, ['biblioteca'])],
  ];
  bar.replaceChildren(...tabs.map(([id, icon, txt, href]) => h('a.tab', { href, class: id === activa ? 'active' : '', 'aria-current': id === activa ? 'page' : null },
    h('span.tab-icon', icono(icon)), h('span.tab-txt', txt))));
}

async function main() {
  const root = document.getElementById('app');
  const chart = createChart(await loadChartData());
  const ctx = { chart };
  const progress = createProgressStore();
  // Examen final: la reserva de cada eje y titulación se fija para el alumno la primera vez que carga ese banco
  // (ajuste reserva_<eje>_<tit>); si después cambian los datos, su examen final no cambia.
  fijarReservaAlumno({
    leer: (eje, tit) => progress.settings()[`reserva_${eje}_${tit}`] ?? null,
    guardar: (eje, tit, foto) => progress.setSetting(`reserva_${eje}_${tit}`, foto),
  });
  // Una versión nueva se aplica sola al abrir la app, salvo con un examen a medias (entonces se pregunta).
  iniciarPwa({ puedeActualizarSolo: () => !progress.testEnCurso() });
  setSharedProgress(progress);
  voice.bind(progress);
  iniciarRadio(progress);
  let current = null;

  const session = { summary: () => current?.summary?.() ?? '' };
  installApi({ ctx, session });

  // Tamaño de letra elegido en Ajustes (normal, grande, muy grande) e icono de ajustes de la cabecera.
  const aplicaLetra = () => { document.documentElement.dataset.letra = progress.settings().letra ?? 'normal'; };
  aplicaLetra();
  window.addEventListener('ajustes-letra', aplicaLetra);
  document.querySelector('header.top a.ajustes')?.replaceChildren(icono('ajustes'));
  document.querySelector('header.top a.brand')?.replaceChildren(icono('brujula'), ' Patrón');

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
    renderNav(tit, route.parts, (id) => { setTit(progress, id); render(); });
    enVistaEpisodio(false); // la vista del episodio lo vuelve a poner
    if (modoExamen()) fijarModoExamen(null); // el examen en marcha lo vuelve a poner
    try {
      current = view({ ctx, progress, params, tit });
    } catch (e) {
      console.error(e);
      current = { el: h('div', h('h1', 'Algo ha fallado'), h('pre', String(e.stack ?? e))), summary: () => `ERROR ${e.message}` };
    }
    voice.stop();
    const el = current.el;
    transicion(() => { clear(root).append(el); window.scrollTo(0, 0); }, 'pantalla');
  }

  window.addEventListener('hashchange', render);
  // El menú de titulación se cierra al tocar fuera o con Escape.
  document.addEventListener('click', (ev) => { const d = document.getElementById('selector-tit'); if (d?.open && !d.contains(ev.target)) d.open = false; });
  document.addEventListener('keydown', (ev) => { const d = document.getElementById('selector-tit'); if (ev.key === 'Escape' && d?.open) { d.open = false; d.querySelector('summary')?.focus(); } });
  render();
}


main().catch((e) => {
  document.getElementById('app').textContent = `Error al iniciar: ${e.message}`;
  console.error(e);
});

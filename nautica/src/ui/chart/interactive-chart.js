// Carta interactiva: zoom y desplazamiento, capas (vectorial / escaneo del usuario) y herramientas de
// dibujo náutico (regla, compás, transportador cuadrado, punto, goma). Las construcciones de la solución
// se dibujan aparte de lo que dibuja el alumno.

import { h } from '../dom.js';
import {
  DEFS, baseLayer, gridLayer, marksLayer, itemsLayer, drawItem, toWorld, fromWorld, worldRect, fitBBox, worldPerMile,
} from '../../graphics/chart-renderer.js';
import { squareProtractor, compassPreview, rulerPreview, bearingWorld } from '../../graphics/instruments.js';
import { rhumbTo } from '../../math/mercator.js';
import { norm360 } from '../../math/angles.js';
import { fmtLat, fmtLon, fmtBearing, fmtMiles, fmtPos } from '../../math/format.js';
import { getRaster } from './raster.js';
import { rulersLayer, RULER_LEFT, RULER_TOP } from '../../graphics/rulers.js';
import { parseAngle } from '../../math/format.js';
import { botonCalculadora } from '../calculadora.js';

const TOOLS = [
  { id: 'move', icon: '✋', label: 'Mover', help: 'Arrastra la carta para desplazarla, o arrastra tus puntos, notas, guías y el transportador. Un trazo: por un extremo (asa redonda) lo alargas o giras; por el medio lo trasladas paralelo; un círculo, por el centro lo mueves y por el borde cambias el radio. Para una guía, arrastra desde la escala de latitudes (izquierda) o de longitudes (arriba). Toca un punto para mostrar u ocultar sus coordenadas; toca una nota para editarla o cambiar su tamaño. Rueda o dos dedos: zoom.' },
  { id: 'ruler', icon: '📏', label: 'Regla', help: 'Arrastra de un punto a otro: traza la línea y lee Rv y distancia. Se ajusta a los faros. Si empiezas sobre el extremo (asa) de un trazo tuyo, lo mueves.' },
  { id: 'compass', icon: '🧭', label: 'Compás', help: 'Pincha en el centro y arrastra hasta el radio: lee las millas y traza la circunferencia.' },
  { id: 'protractor', icon: '📐', label: 'Transportador', corto: 'Transpor\u00ADtador', help: 'Interruptor: púlsalo para poner o quitar el transportador. Arrastra el agujero central para moverlo (se ajusta a los faros) y arrastra dentro del cuadrado para girar el hilo. Luego «Trazar». Se queda puesto aunque uses otras herramientas.' },
  { id: 'point', icon: '📍', label: 'Punto', help: 'Toca para marcar un punto y leer sus coordenadas.' },
  { id: 'text', icon: '🔤', label: 'Texto', help: 'Toca donde quieras poner una nota y escríbela en la barra de abajo (también su tamaño). Con ✋ Mover se arrastra.' },
  { id: 'erase', icon: '🧽', label: 'Goma', help: 'Toca un trazo, punto o texto tuyo para borrarlo.' },
];
const NOTE_SIZES = [[11, 'S'], [14, 'M'], [18, 'L'], [24, 'XL'], [32, 'XXL']];
const LAYERS = [['vectorial', 'Vectorial'], ['escaneada', 'Mi carta'], ['ambas', 'Ambas']];
const SNAP_PX = 14;
const ZMIN = 0.3;
const ZMAX = 40;

let nextId = 1;

/**
 * @param {object} opts
 * @param {object} opts.chart   motor de carta
 * @param {object[]} [opts.items] construcción de la solución (primitivas con `step`)
 * @param {object[]} [opts.focus] puntos para encuadrar
 * @param {number} [opts.step]  paso de la solución hasta el que se dibuja
 * @param {object} [opts.progress] almacén de ajustes (capa preferida)
 * @param {number} [opts.height]
 * @param {boolean} [opts.calculadora]  botón de la calculadora científica en la barra (no en un examen que no la permite)
 */
export function interactiveChart({ chart, items = [], focus = [], step = Infinity, progress, height = 480, fill = false, calculadora = true }) {
  const state = {
    tool: 'move', z: 1, cx: 0, cy: 0, w: 640, h: height,
    user: [], history: [], protractor: null, protractorVisible: false, showCoords: true, drag: null, pointers: new Map(), preview: '', raster: null,
    layer: progress?.settings().capa ?? 'vectorial',
    selectedNote: null, noteSize: 14, highlights: [], anim: null, selectedGuide: null,
  };

  // ---------- DOM
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'chart interactive');
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', `Carta náutica ${chart.name} con herramientas de dibujo`);
  if (fill) svg.classList.add('fill'); else svg.style.height = `${height}px`;
  const gBase = ns('g');
  const gRaster = ns('g');
  const gLand = ns('g');
  const gGrid = ns('g');
  const gMarks = ns('g');
  const gItems = ns('g');
  const gUser = ns('g');
  const gTool = ns('g');
  const gRulers = ns('g');
  svg.innerHTML = DEFS;
  svg.append(gBase, gRaster, gLand, gGrid, gMarks, gItems, gUser, gTool, gRulers);

  // En móvil la ayuda va en dos líneas (CSS); tocándola se despliega entera y se vuelve a plegar.
  const readout = h('div.readout', { onclick: () => readout.classList.toggle('abierta') }, TOOLS[0].help);
  const toolButtons = TOOLS.map((t) => h('button.tool', { type: 'button', title: `${t.label}: ${t.help}`, 'aria-pressed': 'false', onclick: () => (t.id === 'protractor' ? toggleProtractor() : setTool(t.id)) }, h('span.tool-icon', t.icon), h('span.tool-name', t.corto ?? t.label)));
  const layerSelect = h('select.small', { 'aria-label': 'Capa de la carta', onchange: (ev) => setLayer(ev.target.value) },
    LAYERS.map(([v, t]) => h('option', { value: v }, t)));
  const bearingInput = h('input.bearing', { type: 'number', min: 0, max: 359, step: 1, 'aria-label': 'Rumbo del transportador', onchange: () => { if (state.protractor) { state.protractor.bearing = norm360(Number(bearingInput.value) || 0); render(); } } });
  const protractorBar = h('div.protractor-bar', { hidden: true },
    h('label', 'Hilo ', bearingInput, '°'),
    h('button.small.secondary', { type: 'button', onclick: () => rotate(-1) }, '−1°'),
    h('button.small.secondary', { type: 'button', onclick: () => rotate(1) }, '+1°'),
    h('button.small.secondary', { type: 'button', onclick: () => rotate(180) }, '↔ Opuesta'),
    h('button.small', { type: 'button', onclick: () => drawProtractorLine('line') }, 'Trazar recta'),
    h('button.small', { type: 'button', onclick: () => drawProtractorLine('ray') }, 'Trazar desde el centro'),
  );
  // Barra de edición de notas de texto
  const noteInput = h('input.note-text', { type: 'text', 'aria-label': 'Texto de la nota', placeholder: 'Escribe tu nota…' });
  let noteEditPushed = false;
  let pendingFocus = false;
  const flushFocus = () => { if (pendingFocus) { pendingFocus = false; noteInput.focus(); noteInput.select(); } };
  noteInput.addEventListener('input', () => {
    if (!state.selectedNote) return;
    if (!noteEditPushed) { state.history.push(state.user); noteEditPushed = true; }
    replaceUser(state.selectedNote, (u) => ({ ...u, text: noteInput.value }));
    render();
  });
  noteInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); selectNote(null); } });
  const sizeButtons = NOTE_SIZES.map(([px, lbl]) => h('button.small.secondary.size', { type: 'button', 'data-size': px, title: `Tamaño ${lbl}`, onclick: () => setNoteSize(px) }, lbl));
  const noteBar = h('div.note-bar', { hidden: true },
    h('span.muted', '🔤'), noteInput,
    h('span.sizes', h('button.small.secondary', { type: 'button', title: 'Letra más pequeña', onclick: () => stepNoteSize(-1) }, 'A−'), sizeButtons,
      h('button.small.secondary', { type: 'button', title: 'Letra más grande', onclick: () => stepNoteSize(1) }, 'A+')),
    h('button.small.secondary', { type: 'button', title: 'Borrar la nota', onclick: () => { const id = state.selectedNote; selectNote(null); state.history.push(state.user); state.user = state.user.filter((u) => u.id !== id); render(); } }, '🗑'),
    h('button.small', { type: 'button', onclick: () => selectNote(null) }, 'Listo'),
  );
  // Barra de la guía seleccionada (valor exacto) y barra «ir a coordenadas»
  const guideInput = h('input.guide-value', { type: 'text', 'aria-label': 'Valor de la guía' });
  const applyGuide = () => {
    const g = state.user.find((u) => u.id === state.selectedGuide);
    if (!g) return;
    const v = parseCoord(guideInput.value, g.axis);
    if (Number.isNaN(v)) { readout.textContent = 'No entiendo ese valor. Ejemplo: 36 05,2 N o 5 36,4 W'; return; }
    state.history.push(state.user);
    replaceUser(g.id, (u) => ({ ...u, value: v }));
    readout.textContent = `Guía en ${g.axis === 'lat' ? fmtLat(v) : fmtLon(v)}.`;
    render();
  };
  guideInput.addEventListener('change', applyGuide);
  guideInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); applyGuide(); selectGuide(null); } });
  const guideLbl = h('span.muted');
  const guideBar = h('div.note-bar.guide-bar', { hidden: true }, guideLbl, guideInput,
    h('button.small.secondary', { type: 'button', title: 'Borrar la guía', onclick: () => { const id = state.selectedGuide; selectGuide(null); state.history.push(state.user); state.user = state.user.filter((u) => u.id !== id); render(); } }, '🗑'),
    h('button.small', { type: 'button', onclick: () => { applyGuide(); selectGuide(null); } }, 'Listo'));
  const latIn = h('input', { type: 'text', placeholder: '36 05,2 N', 'aria-label': 'Latitud' });
  const lonIn = h('input', { type: 'text', placeholder: '5 36,4 W', 'aria-label': 'Longitud' });
  const coordBar = h('div.note-bar.coord-bar', { hidden: true },
    h('span.muted', '⌖'), latIn, lonIn,
    h('button.small.secondary', { type: 'button', onclick: () => guidesFromInputs(false) }, 'Trazar guías'),
    h('button.small', { type: 'button', onclick: () => guidesFromInputs(true) }, 'Guías + punto'),
    h('button.small.secondary', { type: 'button', title: 'Cerrar', onclick: () => { coordBar.hidden = true; } }, '✕'));
  const coordBtn = h('button.tool', { type: 'button', title: 'Situar por coordenadas: traza las guías de latitud y longitud', onclick: () => { coordBar.hidden = !coordBar.hidden; if (!coordBar.hidden) latIn.focus(); } }, h('span.tool-icon', '⌖'), h('span.tool-name', 'Situar'));
  const coordsBtn = h('button.tool', { type: 'button', title: 'Mostrar u ocultar las coordenadas de los puntos', 'aria-pressed': 'true', onclick: () => { state.showCoords = !state.showCoords; render(); } }, h('span.tool-icon', '🏷'), h('span.tool-name', 'Coorde\u00ADnadas'));


  const el = h('div.ichart',
    // Tres grupos: las herramientas de dibujo (siempre enteras, también en el móvil), las de edición y las de vista.
    h('div.ichart-toolbar',
      h('div.tools.dibujo', { role: 'group', 'aria-label': 'Herramientas de dibujo' }, toolButtons,
        // La calculadora va con las de dibujo: siempre a la vista, también en el móvil (no escondida en «Más»).
        calculadora ? botonCalculadora({ clase: 'tool', texto: 'Calcu\u00ADladora' }) : null,
        // Solo en pantallas estrechas: muestra u oculta edición y vista para que la carta conserve su alto.
        h('button.tool.mas-herramientas', { type: 'button', 'aria-expanded': 'false', title: 'Más herramientas: deshacer, coordenadas, zoom…', onclick: (ev) => {
          const bar = ev.currentTarget.closest('.ichart-toolbar');
          const abierta = bar.classList.toggle('abierta');
          ev.currentTarget.setAttribute('aria-expanded', String(abierta));
        } }, h('span.tool-icon', '⋯'), h('span.tool-name', 'Más'))),
      h('div.tools.edicion', { role: 'group', 'aria-label': 'Edición' },
        h('button.tool', { type: 'button', title: 'Deshacer', onclick: undo }, h('span.tool-icon', '↶'), h('span.tool-name', 'Deshacer')),
        coordsBtn, coordBtn,
        h('button.tool', { type: 'button', title: 'Borrar todo lo dibujado', onclick: clearUser }, h('span.tool-icon', '🗑'), h('span.tool-name', 'Borrar todo'))),
      h('div.tools.vista', { role: 'group', 'aria-label': 'Vista' },
        h('button.tool', { type: 'button', title: 'Acercar', onclick: () => zoomBy(1.6) }, h('span.tool-icon', '+'), h('span.tool-name', 'Acercar')),
        h('button.tool', { type: 'button', title: 'Alejar', onclick: () => zoomBy(1 / 1.6) }, h('span.tool-icon', '−'), h('span.tool-name', 'Alejar')),
        h('button.tool', { type: 'button', title: 'Encuadrar toda la zona de trabajo', onclick: () => { fit(); render(); } }, h('span.tool-icon', '⤢'), h('span.tool-name', 'Encuadrar')),
        layerSelect,
      ),
    ),
    svg,
    coordBar,
    guideBar,
    noteBar,
    protractorBar,
    readout,
  );
  if (fill) el.classList.add('fill');

  // ---------- Vista
  function fit(geoPoints = focus) {
    const bbox = geoPoints.length ? fitBBox(geoPoints, 3, chart.bounds) : chart.bounds;
    const r = worldRect(bbox);
    state.z = clampZ(Math.min(state.w / r.w, state.h / r.h) * 0.95);
    state.cx = r.x + r.w / 2;
    state.cy = r.y + r.h / 2;
  }
  const clampZ = (z) => Math.min(ZMAX, Math.max(ZMIN, z));
  const viewRect = () => ({ x: state.cx - state.w / 2 / state.z, y: state.cy - state.h / 2 / state.z, w: state.w / state.z, h: state.h / state.z });

  function zoomBy(k, at) {
    const z2 = clampZ(state.z * k);
    if (at) {
      // mantener fijo el punto `at` (mundo)
      state.cx = at.x - (at.x - state.cx) * (state.z / z2);
      state.cy = at.y - (at.y - state.cy) * (state.z / z2);
    }
    state.z = z2;
    render();
  }

  // ---------- Dibujo
  let raf = 0;
  /** Con Mover o Regla, los extremos de tus trazos y los centros de tus círculos se ven como asas que se pueden coger. */
  function asas() {
    if (state.tool !== 'move' && state.tool !== 'ruler') return '';
    const r = 6 / state.z;
    const pts = state.user.flatMap((it) => (it.t === 'seg' ? [it.from, it.to] : it.t === 'circle' && state.tool === 'move' ? [it.center] : []));
    return pts.map((g) => { const q = toWorld(g); return `<circle class="asa" cx="${q.x}" cy="${q.y}" r="${r}"/>`; }).join('');
  }

  function render() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; draw(); });
  }
  let baseKey = '';
  function draw() {
    const v = viewRect();
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const showVector = state.layer !== 'escaneada' || !state.raster?.calibrated;
    const key = `${showVector}`;
    if (key !== baseKey) {
      baseKey = key;
      gBase.innerHTML = baseLayer(chart, { land: false });
      gLand.innerHTML = showVector ? baseLayer(chart).replace(/^<rect[^>]*>/, '') : '';
    }
    gLand.style.opacity = state.layer === 'ambas' && state.raster ? '0.35' : '';
    gGrid.innerHTML = gridLayer(chart, state.z, v, { labels: false }); // las escalas de los márgenes ya rotulan
    gMarks.innerHTML = (showVector ? marksLayer(chart, state.z) : '') + state.highlights.map((id) => {
      const q = toWorld(chart.point(id));
      return `<circle class="highlight" cx="${q.x}" cy="${q.y}" r="${14 / state.z}"/>`;
    }).join('');
    gItems.innerHTML = itemsLayer(items, state.z, step);
    gUser.innerHTML = state.user.map((it) => drawItem(
      it.t === 'pos' && (!state.showCoords || it.hideLabel) ? { ...it, label: undefined } : (it.t === 'text' && it.id === state.selectedNote) || (it.t === 'guide' && it.id === state.selectedGuide) ? { ...it, selected: true } : it,
      state.z,
    )).join('') + asas();
    const ins = state.instrument;
    const insSvg = !ins ? '' : ins.type === 'compass' ? compassPreview(ins.center, ins.edge, state.z).svg : rulerPreview(ins.a, ins.b, state.z).svg;
    gTool.innerHTML = (state.protractor && state.protractorVisible ? squareProtractor(state.protractor.c, state.protractor.bearing, state.z) : '') + insSvg + state.preview;
    coordsBtn.setAttribute('aria-pressed', String(state.showCoords));
    gRulers.innerHTML = rulersLayer(v, state.z, state.user.filter((u) => u.t === 'guide').map((g) => ({ ...g, selected: g.id === state.selectedGuide })), fromWorld);
    guideBar.hidden = !state.selectedGuide;

    // El transportador es un interruptor: su botón refleja si está puesto, no si es la herramienta activa.
    TOOLS.forEach((t, i) => toolButtons[i].setAttribute('aria-pressed', String(t.id === 'protractor' ? state.protractorVisible : t.id === state.tool)));
    protractorBar.hidden = !state.protractorVisible;
    if (state.protractor) bearingInput.value = Math.round(state.protractor.bearing) % 360;
    noteBar.hidden = !state.selectedNote;
    const sel = state.user.find((u) => u.id === state.selectedNote);
    for (const b of sizeButtons) b.setAttribute('aria-pressed', String(Number(b.dataset.size) === (sel?.size ?? state.noteSize)));
    svg.dataset.tool = state.tool;
  }

  async function loadRaster() {
    state.raster = await getRaster();
    const opt = layerSelect.querySelector('option[value="escaneada"]');
    const opt2 = layerSelect.querySelector('option[value="ambas"]');
    const ok = !!state.raster?.calibrated;
    opt.disabled = !ok;
    opt2.disabled = !ok;
    if (!ok && state.layer !== 'vectorial') state.layer = 'vectorial';
    layerSelect.value = state.layer;
    gRaster.innerHTML = '';
    if (ok && state.layer !== 'vectorial') {
      const { url, matrix, width, height: hh } = state.raster;
      const img = ns('image');
      img.setAttribute('href', url);
      img.setAttribute('width', width);
      img.setAttribute('height', hh);
      img.setAttribute('transform', `matrix(${matrix.join(' ')})`);
      img.setAttribute('class', 'raster');
      gRaster.append(img);
    }
    baseKey = '';
    render();
  }

  function setLayer(v) {
    state.layer = v;
    progress?.setSetting('capa', v);
    loadRaster();
  }

  function setTool(id) {
    state.tool = id;
    state.preview = '';
    if (id === 'protractor') { if (!state.protractor) placeProtractor(); state.protractorVisible = true; }
    readout.textContent = TOOLS.find((t) => t.id === id).help;
    render();
  }

  function toggleProtractor() {
    if (state.protractorVisible) {
      state.protractorVisible = false;
      if (state.tool === 'protractor') state.tool = 'move';
      readout.textContent = 'Transportador quitado.';
    } else {
      if (!state.protractor) placeProtractor();
      state.protractorVisible = true;
      state.tool = 'protractor';
      state.preview = '';
      readout.textContent = TOOLS.find((t) => t.id === 'protractor').help;
    }
    render();
  }

  // ---------- Notas
  function selectNote(id, { focus: doFocus = false } = {}) {
    state.selectedNote = id;
    noteEditPushed = false;
    const it = state.user.find((u) => u.id === id);
    if (it) {
      noteInput.value = it.text;
      if (doFocus) pendingFocus = true; // se enfoca al soltar el dedo (si no, la carta le roba el foco)
    } else {
      // una nota vacía no tiene sentido: se elimina al deseleccionar
      state.user = state.user.filter((u) => !(u.t === 'text' && !u.text.trim()));
    }
    render();
  }
  function setNoteSize(px) {
    state.noteSize = px;
    if (state.selectedNote) { state.history.push(state.user); replaceUser(state.selectedNote, (u) => ({ ...u, size: px })); }
    render();
  }
  function stepNoteSize(d) {
    const cur = state.user.find((u) => u.id === state.selectedNote)?.size ?? state.noteSize;
    const i = NOTE_SIZES.findIndex(([px]) => px >= cur);
    const j = Math.min(NOTE_SIZES.length - 1, Math.max(0, (i < 0 ? NOTE_SIZES.length - 1 : i) + d));
    setNoteSize(NOTE_SIZES[j][0]);
  }

  // ---------- Guías
  function parseCoord(text, axis) {
    const v = parseAngle(text);
    if (Number.isNaN(v)) return NaN;
    return axis === 'lon' && !/[EWO]/i.test(text) ? -Math.abs(v) : v; // sin E/W se asume W (toda la carta)
  }
  function selectGuide(id) {
    state.selectedGuide = id;
    const g = state.user.find((u) => u.id === id);
    if (g) {
      guideLbl.textContent = g.axis === 'lat' ? 'Guía de latitud' : 'Guía de longitud';
      guideInput.value = (g.axis === 'lat' ? fmtLat(g.value) : fmtLon(g.value)).replace(/° /, ' ').replace(/'/, '');
    }
    render();
  }
  function guidesFromInputs(withPoint) {
    const lat = parseCoord(latIn.value, 'lat');
    const lon = parseCoord(lonIn.value, 'lon');
    if (Number.isNaN(lat) || Number.isNaN(lon)) { readout.textContent = 'Escribe latitud y longitud, por ejemplo 36 05,2 N y 5 36,4 W.'; return; }
    state.history.push(state.user);
    state.user = [...state.user, { t: 'guide', axis: 'lat', value: lat, id: nextId++ }, { t: 'guide', axis: 'lon', value: lon, id: nextId++ }];
    if (withPoint) state.user = [...state.user, { t: 'pos', at: { lat, lon }, style: 'user', label: `${fmtLat(lat)} ${fmtLon(lon)}`, id: nextId++ }];
    readout.textContent = `Guías en ${fmtLat(lat)} y ${fmtLon(lon)}${withPoint ? ', con el punto en el cruce' : ''}.`;
    fit([{ lat, lon }]);
    state.z = clampZ(state.z * 0.25);
    render();
  }
  const round01 = (deg) => Math.round(deg * 600) / 600; // a la décima de minuto
  const guideValueAt = (axis, w) => round01(axis === 'lat' ? fromWorld(w).lat : fromWorld(w).lon);
  function inRuler(ev) {
    const r = svg.getBoundingClientRect();
    const lx = ev.clientX - r.left;
    const ly = ev.clientY - r.top;
    if (lx < RULER_LEFT && ly > RULER_TOP) return 'lat';
    if (ly < RULER_TOP && lx > RULER_LEFT) return 'lon';
    if (lx < RULER_LEFT && ly < RULER_TOP) return 'corner';
    return null;
  }
  const guidePreview = (axis, value) => drawItem({ t: 'guide', axis, value, selected: true }, state.z);

  function placeProtractor() {
    state.protractor = { c: { x: state.cx, y: state.cy }, bearing: 0 };
  }

  // ---------- Dibujo del alumno
  /** Sustituye un elemento del alumno (inmutable, para poder deshacer). */
  function replaceUser(id, fn) {
    state.user = state.user.map((it) => (it.id === id ? fn(it) : it));
  }
  function addUser(item) {
    state.history.push(state.user);
    state.user = [...state.user, { ...item, id: nextId++ }];
    render();
  }
  function undo() {
    if (state.history.length) state.user = state.history.pop();
    render();
  }
  function clearUser() {
    if (!state.user.length) return;
    state.history.push(state.user);
    state.user = [];
    render();
  }
  function rotate(d) {
    if (!state.protractor) return;
    state.protractor.bearing = norm360(Math.round(state.protractor.bearing) + d);
    readout.textContent = `Hilo del transportador: ${fmtBearing(state.protractor.bearing)} (opuesta ${fmtBearing(state.protractor.bearing + 180)})`;
    render();
  }
  function drawProtractorLine(kind) {
    const p = state.protractor;
    if (!p) return;
    const geo = fromWorld(p.c);
    if (kind === 'line') addUser({ t: 'line', through: geo, bearing: p.bearing, length: 80, style: 'user' });
    else addUser({ t: 'ray', from: geo, bearing: p.bearing, length: 40, style: 'user' });
    readout.textContent = `Trazada ${kind === 'line' ? 'recta' : 'línea'} ${fmtBearing(p.bearing)} por ${fmtPos(geo)}.`;
  }

  // ---------- Ajuste (snap) a faros y a puntos dibujados
  function snapCandidates(excludeId) {
    const c = chart.points().filter((m) => m.mark !== false || m.port).map((m) => ({ geo: m, name: m.name }));
    if (state.protractor && state.protractorVisible && state.drag?.kind !== 'protractor-move') c.push({ geo: fromWorld(state.protractor.c), name: 'centro del transportador' });
    for (const it of [...state.user.filter((u) => u.id !== excludeId), ...items.filter((x) => (x.step ?? 0) <= step)]) {
      if (it.t === 'pos') c.push({ geo: it.at, name: it.label ?? 'punto' });
      if (it.t === 'seg') c.push({ geo: it.from, name: 'extremo' }, { geo: it.to, name: 'extremo' });
      if (it.t === 'circle') c.push({ geo: it.center, name: 'centro' });
    }
    const gl = state.user.filter((u) => u.t === 'guide' && u.id !== excludeId);
    for (const a of gl.filter((g) => g.axis === 'lat')) {
      for (const b of gl.filter((g) => g.axis === 'lon')) c.push({ geo: { lat: a.value, lon: b.value }, name: `cruce de guías ${fmtLat(a.value)} ${fmtLon(b.value)}` });
    }
    return c;
  }
  function snap(w, excludeId) {
    let best = null;
    let bd = SNAP_PX / state.z;
    for (const cand of snapCandidates(excludeId)) {
      const p = toWorld(cand.geo);
      const d = Math.hypot(p.x - w.x, p.y - w.y);
      if (d < bd) { bd = d; best = { w: p, geo: cand.geo, name: cand.name }; }
    }
    if (best) return best;
    // Si no hay punto cerca, se ajusta a la guía más próxima (se desliza a lo largo de ella).
    let bg = null;
    let gd = SNAP_PX / state.z;
    for (const g of state.user.filter((u) => u.t === 'guide' && u.id !== excludeId)) {
      const d = distanceTo(g, w);
      if (d < gd) { gd = d; bg = g; }
    }
    if (bg) {
      const geo = fromWorld(w);
      const p = bg.axis === 'lat' ? { lat: bg.value, lon: geo.lon } : { lat: geo.lat, lon: bg.value };
      return { w: toWorld(p), geo: p, name: bg.axis === 'lat' ? `guía ${fmtLat(bg.value)}` : `guía ${fmtLon(bg.value)}` };
    }
    return { w, geo: fromWorld(w), name: null };
  }

  // ---------- Punteros
  function toWorldPt(ev) {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: q.x, y: q.y };
  }

  svg.addEventListener('pointerdown', (ev) => {
    svg.setPointerCapture(ev.pointerId);
    state.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (state.pointers.size === 2) { state.drag = { kind: 'pinch', ...pinchInfo() }; state.preview = ''; return; }
    const w = toWorldPt(ev);
    const band = inRuler(ev);
    if (band === 'lat' || band === 'lon') {
      state.drag = { kind: 'guide-new', axis: band };
      state.preview = guidePreview(band, guideValueAt(band, w));
      readout.textContent = band === 'lat' ? 'Guía de latitud: arrástrala hasta el valor y suelta.' : 'Guía de longitud: arrástrala hasta el valor y suelta.';
      render();
      return;
    }
    if (band === 'corner') return;
    const s = snap(w);
    switch (state.tool) {
      case 'move': {
        state.drag = grabAt(w) ?? { kind: 'pan', sx: ev.clientX, sy: ev.clientY, cx: state.cx, cy: state.cy };
        if (state.drag.kind === 'pan' && state.selectedNote) selectNote(null);
        break;
      }
      case 'ruler': {
        // Si empiezas sobre el extremo de un trazo tuyo, lo mueves; si no, trazas uno nuevo.
        const g = grabAt(w);
        const extremo = g?.kind === 'item-move' && state.user.find((u) => u.id === g.id)?.t === 'seg';
        state.drag = extremo ? g : { kind: 'ruler', a: s };
        break;
      }
      case 'compass': state.drag = { kind: 'compass', c: s }; break;
      case 'protractor': {
        if (!state.protractor) placeProtractor();
        state.protractorVisible = true;
        const p = state.protractor;
        const near = p && Math.hypot(w.x - p.c.x, w.y - p.c.y) < 22 / state.z;
        state.drag = near ? { kind: 'protractor-move', dx: p.c.x - w.x, dy: p.c.y - w.y } : { kind: 'protractor-rotate' };
        if (!near) p.bearing = bearingWorld(p.c, w);
        break;
      }
      case 'point':
        addUser({ t: 'pos', at: s.geo, style: 'user', label: `${fmtLat(s.geo.lat)} ${fmtLon(s.geo.lon)}` });
        readout.textContent = `Punto${s.name ? ` (${s.name})` : ''}: ${fmtPos(s.geo)}`;
        break;
      case 'text': {
        const g = grabAt(w);
        if (g?.kind === 'item-move' && state.user.find((u) => u.id === g.id)?.t === 'text') { state.drag = g; break; }
        addUser({ t: 'text', at: s.geo, text: '', size: state.noteSize, style: 'user' });
        selectNote(state.user[state.user.length - 1].id, { focus: true });
        readout.textContent = 'Escribe la nota en la barra; elige el tamaño con S/M/L/XL. Con ✋ Mover la arrastras.';
        break;
      }
      case 'erase': eraseAt(w); break;
      default:
    }
    render();
  });

  /** Con la herramienta Mover: ¿qué hay bajo el puntero? (centro del transportador, punto, texto o extremo). */
  function grabAt(w) {
    const tol = 14 / state.z;
    const p = state.protractor;
    if (p && state.protractorVisible && Math.hypot(w.x - p.c.x, w.y - p.c.y) < 22 / state.z) return { kind: 'protractor-move', dx: p.c.x - w.x, dy: p.c.y - w.y };
    let best = null;
    let bd = tol;
    for (const it of state.user) {
      if (it.t === 'text' && hitText(it, w)) return { kind: 'item-move', id: it.id, key: 'at', dx: toWorld(it.at).x - w.x, dy: toWorld(it.at).y - w.y, moved: false };
      const handles = it.t === 'pos' ? [['at', it.at]] : it.t === 'text' ? [['at', it.at]] : it.t === 'seg' ? [['from', it.from], ['to', it.to]] : it.t === 'circle' ? [['center', it.center]] : [];
      for (const [key, geo] of handles) {
        const q = toWorld(geo);
        const d = Math.hypot(q.x - w.x, q.y - w.y);
        if (d < bd) { bd = d; best = { kind: 'item-move', id: it.id, key, dx: q.x - w.x, dy: q.y - w.y, moved: false }; }
      }
    }
    if (best) return best;
    // El cuerpo de un trazo se arrastra entero, paralelo a sí mismo (trasladar una línea de posición); el borde de
    // un círculo cambia su radio. Gana el trazo dibujado más tarde.
    for (const it of [...state.user].reverse()) {
      if (!['seg', 'line', 'ray', 'circle'].includes(it.t) || distanceTo(it, w) >= tol) continue;
      return it.t === 'circle' ? { kind: 'item-radius', id: it.id, moved: false } : { kind: 'item-shift', id: it.id, w0: w, orig: it, moved: false };
    }
    for (const g of state.user.filter((u) => u.t === 'guide')) {
      if (distanceTo(g, w) < 8 / state.z) return { kind: 'guide-move', id: g.id, moved: false };
    }
    // Dentro del cuadrado del transportador (fuera del agujero): girar el hilo.
    const half = 130 / state.z;
    if (p && state.protractorVisible && Math.abs(w.x - p.c.x) < half && Math.abs(w.y - p.c.y) < half) {
      p.bearing = Math.round(bearingWorld(p.c, w)) % 360;
      return { kind: 'protractor-rotate' };
    }
    return null;
  }

  svg.addEventListener('pointermove', (ev) => {
    if (state.pointers.has(ev.pointerId)) state.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const d = state.drag;
    const w = toWorldPt(ev);
    if (!d) {
      const g = fromWorld(w);
      if (state.tool !== 'protractor') readout.textContent = `${fmtLat(g.lat)}  ${fmtLon(g.lon)}`;
      return;
    }
    if (d.kind === 'pinch' && state.pointers.size === 2) {
      const now = pinchInfo();
      const k = now.dist / d.dist;
      const z2 = clampZ(d.z * k);
      // el punto bajo el centro del pellizco se mantiene
      state.z = z2;
      state.cx = d.wx - (now.mx - d.rect.left - state.w / 2) / z2;
      state.cy = d.wy - (now.my - d.rect.top - state.h / 2) / z2;
      render();
      return;
    }
    switch (d.kind) {
      case 'pan': {
        const scale = state.w / svg.getBoundingClientRect().width;
        state.cx = d.cx - ((ev.clientX - d.sx) * scale) / state.z;
        state.cy = d.cy - ((ev.clientY - d.sy) * scale) / state.z;
        break;
      }
      case 'ruler': {
        const b = snap(w);
        const r = rulerPreview(d.a.geo, b.geo, state.z);
        state.preview = r.svg;
        d.b = b;
        readout.textContent = `${d.a.name ? `${d.a.name} → ` : ''}${b.name ? `${b.name}: ` : ''}${r.text}`;
        break;
      }
      case 'compass': {
        const e = snap(w);
        const r = compassPreview(d.c.geo, e.geo, state.z);
        state.preview = r.svg;
        d.e = e;
        d.r = r.radius;
        readout.textContent = `Compás${d.c.name ? ` en ${d.c.name}` : ''}: radio ${fmtMiles(r.radius)} (medido en la escala de latitudes)`;
        break;
      }
      case 'protractor-move': {
        const s = snap({ x: w.x + d.dx, y: w.y + d.dy });
        state.protractor.c = s.w;
        readout.textContent = `Transportador ${s.name ? `en ${s.name}` : `en ${fmtPos(s.geo)}`} · hilo ${fmtBearing(state.protractor.bearing)}`;
        break;
      }
      case 'guide-new': {
        const val = guideValueAt(d.axis, w);
        d.value = val;
        d.left = d.left || !inRuler(ev);
        state.preview = guidePreview(d.axis, val);
        readout.textContent = `Guía de ${d.axis === 'lat' ? `latitud ${fmtLat(val)}` : `longitud ${fmtLon(val)}`}`;
        break;
      }
      case 'guide-move': {
        const g = state.user.find((u) => u.id === d.id);
        if (!d.moved) { state.history.push(state.user); d.moved = true; }
        const val = guideValueAt(g.axis, w);
        replaceUser(d.id, (u) => ({ ...u, value: val }));
        readout.textContent = `Guía de ${g.axis === 'lat' ? `latitud ${fmtLat(val)}` : `longitud ${fmtLon(val)}`} · suéltala sobre la escala para quitarla`;
        break;
      }
      case 'item-move': {
        if (!d.moved) { state.history.push(state.user); d.moved = true; }
        const s = snap({ x: w.x + d.dx, y: w.y + d.dy }, d.id);
        replaceUser(d.id, (it) => {
          const n = { ...it, [d.key]: s.geo };
          if (n.t === 'pos') n.label = `${fmtLat(s.geo.lat)} ${fmtLon(s.geo.lon)}`;
          if (n.t === 'seg') { const r = rhumbTo(n.from, n.to); n.label = `${fmtBearing(r.bearing)} · ${fmtMiles(r.distance)}`; }
          return n;
        });
        readout.textContent = `${s.name ? `${s.name}: ` : ''}${fmtPos(s.geo)}`;
        break;
      }
      case 'item-shift': {
        if (!d.moved) { state.history.push(state.user); d.moved = true; }
        const mueve = (geo) => { const q = toWorld(geo); return fromWorld({ x: q.x + w.x - d.w0.x, y: q.y + w.y - d.w0.y }); };
        const o = d.orig;
        replaceUser(d.id, (it) => (it.t === 'seg' ? { ...it, from: mueve(o.from), to: mueve(o.to) } : it.through ? { ...it, through: mueve(o.through) } : { ...it, from: mueve(o.from) }));
        const n = state.user.find((u) => u.id === d.id);
        readout.textContent = n.t === 'seg' ? `Trazo ${fmtBearing(rhumbTo(n.from, n.to).bearing)} trasladado: ${fmtPos(n.from)} → ${fmtPos(n.to)}` : `Recta ${fmtBearing(n.bearing)} por ${fmtPos(n.through ?? n.from)}`;
        break;
      }
      case 'item-radius': {
        if (!d.moved) { state.history.push(state.user); d.moved = true; }
        const it = state.user.find((u) => u.id === d.id);
        const e = snap(w, d.id);
        const r = rhumbTo(it.center, e.geo).distance;
        replaceUser(d.id, (u) => ({ ...u, radius: r, label: fmtMiles(r) }));
        readout.textContent = `Radio ${fmtMiles(r)}${e.name ? ` (hasta ${e.name})` : ''}`;
        break;
      }
      case 'protractor-rotate':
        state.protractor.bearing = Math.round(bearingWorld(state.protractor.c, w)) % 360;
        readout.textContent = `Hilo ${fmtBearing(state.protractor.bearing)} · opuesta ${fmtBearing(state.protractor.bearing + 180)}`;
        break;
      default:
    }
    render();
  });

  const endPointer = (ev) => {
    state.pointers.delete(ev.pointerId);
    setTimeout(flushFocus, 0);
    const d = state.drag;
    if (!d) return;
    if (d.kind === 'pinch') { if (state.pointers.size < 2) state.drag = null; return; }
    if (d.kind === 'ruler' && d.b && rhumbTo(d.a.geo, d.b.geo).distance > 0.05) {
      const { bearing, distance } = rhumbTo(d.a.geo, d.b.geo);
      addUser({ t: 'seg', from: d.a.geo, to: d.b.geo, style: 'user', label: `${fmtBearing(bearing)} · ${fmtMiles(distance)}` });
    }
    if (d.kind === 'compass' && d.r > 0.05) addUser({ t: 'circle', center: d.c.geo, radius: d.r, style: 'user', label: fmtMiles(d.r) });
    if (d.kind === 'guide-new') {
      if (d.left && d.value != null) {
        addUser({ t: 'guide', axis: d.axis, value: d.value });
        selectGuide(state.user[state.user.length - 1].id);
        readout.textContent = `Guía en ${d.axis === 'lat' ? fmtLat(d.value) : fmtLon(d.value)}. Escribe el valor exacto en la barra o arrástrala con ✋.`;
      }
    }
    if (d.kind === 'guide-move') {
      const band = inRuler(ev);
      if (d.moved && (band === 'lat' || band === 'lon')) {
        state.user = state.user.filter((u) => u.id !== d.id);
        if (state.selectedGuide === d.id) state.selectedGuide = null;
        readout.textContent = 'Guía quitada.';
      } else if (!d.moved) selectGuide(d.id);
    }
    if (d.kind === 'item-move' && !d.moved) {
      const it = state.user.find((u) => u.id === d.id);
      if (it?.t === 'pos') {
        state.history.push(state.user);
        replaceUser(d.id, (u) => ({ ...u, hideLabel: !u.hideLabel }));
        readout.textContent = `Punto ${fmtPos(it.at)}: coordenadas ${it.hideLabel ? 'visibles' : 'ocultas'}.`;
      } else if (it?.t === 'text') {
        selectNote(it.id, { focus: true });
      }
    }
    state.drag = null;
    state.preview = '';
    render();
  };
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  function pinchInfo() {
    const [a, b] = [...state.pointers.values()];
    const rect = svg.getBoundingClientRect();
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    return {
      dist: Math.hypot(a.x - b.x, a.y - b.y), mx, my, rect, z: state.z,
      wx: state.cx + (mx - rect.left - state.w / 2) / state.z,
      wy: state.cy + (my - rect.top - state.h / 2) / state.z,
    };
  }

  svg.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    zoomBy(Math.exp(-ev.deltaY * 0.0015), toWorldPt(ev));
  }, { passive: false });

  svg.tabIndex = 0;
  svg.addEventListener('keydown', (ev) => {
    if (state.protractorVisible && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) { rotate(ev.key === 'ArrowLeft' ? -1 : 1); ev.preventDefault(); }
    if (ev.key === '+' || ev.key === '=') zoomBy(1.4);
    if (ev.key === '-') zoomBy(1 / 1.4);
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { undo(); ev.preventDefault(); }
  });

  /** ¿Está el punto mundo w sobre el texto de una nota? (caja aproximada en píxeles de pantalla) */
  function hitText(it, w) {
    const p = toWorld(it.at);
    const fs = it.size ?? 14;
    const dx = (w.x - p.x) * state.z;
    const dy = (w.y - p.y) * state.z;
    return dx > -8 && dx < 8 + Math.max(1, (it.text || '…').length) * fs * 0.6 && Math.abs(dy) < fs * 0.8;
  }

  function eraseAt(w) {
    const note = [...state.user].reverse().find((u) => u.t === 'text' && hitText(u, w));
    if (note) { state.history.push(state.user); state.user = state.user.filter((x) => x !== note); readout.textContent = 'Nota borrada.'; return; }
    let best = null;
    let bd = 12 / state.z;
    for (const it of state.user) {
      const d = distanceTo(it, w);
      if (d < bd) { bd = d; best = it; }
    }
    if (best) {
      state.history.push(state.user);
      state.user = state.user.filter((x) => x !== best);
      readout.textContent = 'Trazo borrado.';
    }
  }

  // ---------- Tamaño
  const ro = new ResizeObserver(() => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    const first = state.w === 640 && !state.sized;
    state.w = r.width;
    state.h = r.height;
    if (first) { state.sized = true; fit(); }
    render();
  });
  ro.observe(svg);

  fit();
  loadRaster();
  render();

  // ---------- API para la mesa de cartas y el tutorial
  /** Anima el encuadre hasta que se vean los puntos dados. */
  function flyTo(geoPoints, ms = 600) {
    if (!geoPoints?.length) return Promise.resolve();
    const from = { cx: state.cx, cy: state.cy, z: state.z };
    fit(geoPoints);
    const to = { cx: state.cx, cy: state.cy, z: state.z };
    Object.assign(state, from);
    if (state.anim) cancelAnimationFrame(state.anim);
    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        state.cx = from.cx + (to.cx - from.cx) * e;
        state.cy = from.cy + (to.cy - from.cy) * e;
        state.z = Math.exp(Math.log(from.z) + (Math.log(to.z) - Math.log(from.z)) * e);
        draw();
        if (k < 1) state.anim = requestAnimationFrame(tick); else { state.anim = null; resolve(); }
      };
      state.anim = requestAnimationFrame(tick);
    });
  }

  /** Coloca un instrumento para enseñar un trazo: {type:'protractor', at, bearing} | {type:'compass', center, edge} | {type:'ruler', a, b} | null */
  function showInstrument(spec) {
    state.preview = '';
    state.instrument = null;
    if (!spec) { render(); return; }
    if (spec.type === 'protractor') {
      state.protractor = { c: toWorld(spec.at), bearing: norm360(spec.bearing) };
      state.protractorVisible = true;
    } else {
      state.instrument = spec; // compás o regla: se redibuja a la escala actual en draw()
    }
    render();
  }

  let noteOffset = 0;
  return {
    el,
    flyTo,
    showInstrument,
    hideProtractor() { state.protractorVisible = false; render(); },
    setReadout(text) { readout.textContent = text; },
    setHighlights(ids) { state.highlights = ids; render(); },
    /** Añade una nota de texto cerca del centro de la vista (para «enviar a la carta»). */
    addNote(text, size = 12) {
      const v = viewRect();
      const at = fromWorld({ x: v.x + v.w * 0.05, y: v.y + v.h * 0.1 + ((noteOffset++ % 12) * 30) / state.z });
      addUser({ t: 'text', at, text, size, style: 'user' });
      readout.textContent = 'Nota añadida a la carta. Con ✋ Mover la colocas donde quieras.';
    },
    focusPoints: (pts) => { fit(pts); render(); },
    setStep(s) { step = s; render(); },
    setItems(newItems, newFocus) { items = newItems; if (newFocus) { focus = newFocus; fit(); } render(); },
    getUserItems: () => state.user,
    /** Resumen textual de lo dibujado por el alumno (para asistentes IA). */
    summary() {
      return state.user.map((it) => {
        if (it.t === 'seg') { const r = rhumbTo(it.from, it.to); return `línea ${fmtPos(it.from)} → ${fmtPos(it.to)} (Rv ${fmtBearing(r.bearing)}, ${fmtMiles(r.distance)})`; }
        if (it.t === 'circle') return `círculo centro ${fmtPos(it.center)} radio ${fmtMiles(it.radius)}`;
        if (it.t === 'line' || it.t === 'ray') return `recta ${fmtBearing(it.bearing)} por ${fmtPos(it.through ?? it.from)}`;
        if (it.t === 'pos') return `punto ${fmtPos(it.at)}`;
        if (it.t === 'text') return `nota "${it.text}" en ${fmtPos(it.at)}`;
        if (it.t === 'guide') return `guía de ${it.axis === 'lat' ? `latitud ${fmtLat(it.value)}` : `longitud ${fmtLon(it.value)}`}`;
        return it.t;
      }).concat(state.protractor && state.protractorVisible ? [`transportador en ${fmtPos(fromWorld(state.protractor.c))} con el hilo a ${fmtBearing(state.protractor.bearing)}`] : []).join(' | ');
    },
  };
}

function ns(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

/** Distancia (mundo) de un punto a una primitiva dibujada. */
function distanceTo(it, w) {
  const segDist = (a, b) => {
    const dx = b.x - a.x; const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(a.x + t * dx - w.x, a.y + t * dy - w.y);
  };
  switch (it.t) {
    case 'pos': case 'text': { const p = toWorld(it.at); return Math.hypot(p.x - w.x, p.y - w.y); }
    case 'guide': return it.axis === 'lat' ? Math.abs(toWorld({ lat: it.value, lon: 0 }).y - w.y) : Math.abs(toWorld({ lat: 0, lon: it.value }).x - w.x);
    case 'seg': return segDist(toWorld(it.from), toWorld(it.to));
    case 'circle': { const c = toWorld(it.center); return Math.abs(Math.hypot(c.x - w.x, c.y - w.y) - it.radius * worldPerMile(it.center.lat)); }
    case 'line': case 'ray': {
      const o = it.through ?? it.from;
      const a = toWorld(o);
      const len = (it.length ?? 40) * worldPerMile(o.lat);
      const d = { x: Math.sin((it.bearing * Math.PI) / 180), y: -Math.cos((it.bearing * Math.PI) / 180) };
      const back = it.t === 'line' ? len / 2 : 0;
      const fwd = it.t === 'line' ? len / 2 : len;
      return segDist({ x: a.x - d.x * back, y: a.y - d.y * back }, { x: a.x + d.x * fwd, y: a.y + d.y * fwd });
    }
    default: return Infinity;
  }
}

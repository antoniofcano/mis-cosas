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

const TOOLS = [
  { id: 'move', icon: '✋', label: 'Mover', help: 'Arrastra la carta para desplazarla, o arrastra tus puntos, textos, extremos de línea y el centro del transportador. Toca un punto para mostrar u ocultar sus coordenadas; toca un texto para editarlo. Rueda o dos dedos: zoom.' },
  { id: 'ruler', icon: '📏', label: 'Regla', help: 'Arrastra de un punto a otro: traza la línea y lee Rv y distancia. Se ajusta a los faros.' },
  { id: 'compass', icon: '🧭', label: 'Compás', help: 'Pincha en el centro y arrastra hasta el radio: lee las millas y traza la circunferencia.' },
  { id: 'protractor', icon: '📐', label: 'Transportador', help: 'Interruptor: púlsalo para poner o quitar el transportador. Arrastra el agujero central para moverlo (se ajusta a los faros) y arrastra dentro del cuadrado para girar el hilo. Luego «Trazar». Se queda puesto aunque uses otras herramientas.' },
  { id: 'point', icon: '📍', label: 'Punto', help: 'Toca para marcar un punto y leer sus coordenadas.' },
  { id: 'text', icon: '🔤', label: 'Texto', help: 'Toca donde quieras escribir una anotación.' },
  { id: 'erase', icon: '🧽', label: 'Goma', help: 'Toca un trazo, punto o texto tuyo para borrarlo.' },
];
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
 */
export function interactiveChart({ chart, items = [], focus = [], step = Infinity, progress, height = 480 }) {
  const state = {
    tool: 'move', z: 1, cx: 0, cy: 0, w: 640, h: height,
    user: [], history: [], protractor: null, protractorVisible: false, showCoords: true, drag: null, pointers: new Map(), preview: '', raster: null,
    layer: progress?.settings().capa ?? 'vectorial',
  };

  // ---------- DOM
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'chart interactive');
  svg.setAttribute('role', 'application');
  svg.setAttribute('aria-label', `Carta náutica ${chart.name} con herramientas de dibujo`);
  svg.style.height = `${height}px`;
  const gBase = ns('g');
  const gRaster = ns('g');
  const gLand = ns('g');
  const gGrid = ns('g');
  const gMarks = ns('g');
  const gItems = ns('g');
  const gUser = ns('g');
  const gTool = ns('g');
  svg.innerHTML = DEFS;
  svg.append(gBase, gRaster, gLand, gGrid, gMarks, gItems, gUser, gTool);

  const readout = h('div.readout', TOOLS[0].help);
  const toolButtons = TOOLS.map((t) => h('button.tool', { type: 'button', title: `${t.label}: ${t.help}`, 'aria-pressed': 'false', onclick: () => (t.id === 'protractor' ? toggleProtractor() : setTool(t.id)) }, t.icon, h('span', t.label)));
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
  const coordsBtn = h('button.small.secondary', { type: 'button', title: 'Mostrar u ocultar las coordenadas de los puntos', 'aria-pressed': 'true', onclick: () => { state.showCoords = !state.showCoords; render(); } }, '🏷');


  const el = h('div.ichart',
    h('div.ichart-toolbar',
      h('div.tools', toolButtons),
      h('div.tools',
        h('button.small.secondary', { type: 'button', title: 'Deshacer', onclick: undo }, '↶'),
        coordsBtn,
        h('button.small.secondary', { type: 'button', title: 'Borrar todo lo dibujado', onclick: clearUser }, '🗑'),
        h('button.small.secondary', { type: 'button', title: 'Acercar', onclick: () => zoomBy(1.6) }, '+'),
        h('button.small.secondary', { type: 'button', title: 'Alejar', onclick: () => zoomBy(1 / 1.6) }, '−'),
        h('button.small.secondary', { type: 'button', title: 'Encuadrar', onclick: () => { fit(); render(); } }, '⤢'),
        layerSelect,
      ),
    ),
    svg,
    protractorBar,
    readout,
  );

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
    gGrid.innerHTML = gridLayer(chart, state.z, v);
    gMarks.innerHTML = showVector ? marksLayer(chart, state.z) : '';
    gItems.innerHTML = itemsLayer(items, state.z, step);
    gUser.innerHTML = state.user.map((it) => drawItem(it.t === 'pos' && (!state.showCoords || it.hideLabel) ? { ...it, label: undefined } : it, state.z)).join('');
    gTool.innerHTML = (state.protractor && state.protractorVisible ? squareProtractor(state.protractor.c, state.protractor.bearing, state.z) : '') + state.preview;
    coordsBtn.setAttribute('aria-pressed', String(state.showCoords));

    // El transportador es un interruptor: su botón refleja si está puesto, no si es la herramienta activa.
    TOOLS.forEach((t, i) => toolButtons[i].setAttribute('aria-pressed', String(t.id === 'protractor' ? state.protractorVisible : t.id === state.tool)));
    protractorBar.hidden = !state.protractorVisible;
    if (state.protractor) bearingInput.value = Math.round(state.protractor.bearing) % 360;
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
    return best ?? { w, geo: fromWorld(w), name: null };
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
    const s = snap(w);
    switch (state.tool) {
      case 'move': state.drag = grabAt(w) ?? { kind: 'pan', sx: ev.clientX, sy: ev.clientY, cx: state.cx, cy: state.cy }; break;
      case 'ruler': state.drag = { kind: 'ruler', a: s }; break;
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
        const text = prompt('Texto de la anotación:');
        if (text?.trim()) { addUser({ t: 'text', at: s.geo, text: text.trim(), style: 'user' }); readout.textContent = 'Anotación añadida. Con ✋ Mover puedes arrastrarla o tocarla para editarla.'; }
        state.pointers.delete(ev.pointerId);
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
      const handles = it.t === 'pos' ? [['at', it.at]] : it.t === 'text' ? [['at', it.at]] : it.t === 'seg' ? [['from', it.from], ['to', it.to]] : it.t === 'circle' ? [['center', it.center]] : [];
      for (const [key, geo] of handles) {
        const q = toWorld(geo);
        const d = Math.hypot(q.x - w.x, q.y - w.y);
        if (d < bd) { bd = d; best = { kind: 'item-move', id: it.id, key, dx: q.x - w.x, dy: q.y - w.y, moved: false }; }
      }
    }
    if (best) return best;
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
    const d = state.drag;
    if (!d) return;
    if (d.kind === 'pinch') { if (state.pointers.size < 2) state.drag = null; return; }
    if (d.kind === 'ruler' && d.b && rhumbTo(d.a.geo, d.b.geo).distance > 0.05) {
      const { bearing, distance } = rhumbTo(d.a.geo, d.b.geo);
      addUser({ t: 'seg', from: d.a.geo, to: d.b.geo, style: 'user', label: `${fmtBearing(bearing)} · ${fmtMiles(distance)}` });
    }
    if (d.kind === 'compass' && d.r > 0.05) addUser({ t: 'circle', center: d.c.geo, radius: d.r, style: 'user', label: fmtMiles(d.r) });
    if (d.kind === 'item-move' && !d.moved) {
      const it = state.user.find((u) => u.id === d.id);
      if (it?.t === 'pos') {
        state.history.push(state.user);
        replaceUser(d.id, (u) => ({ ...u, hideLabel: !u.hideLabel }));
        readout.textContent = `Punto ${fmtPos(it.at)}: coordenadas ${it.hideLabel ? 'visibles' : 'ocultas'}.`;
      } else if (it?.t === 'text') {
        const text = prompt('Editar anotación (vacío para borrarla):', it.text);
        if (text != null) {
          state.history.push(state.user);
          if (text.trim()) replaceUser(d.id, (u) => ({ ...u, text: text.trim() }));
          else state.user = state.user.filter((u) => u.id !== d.id);
        }
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

  function eraseAt(w) {
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

  return {
    el,
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

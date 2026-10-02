// Componente de carta interactiva: dibuja la carta con el motor gráfico y añade herramientas
// (coordenadas del cursor, medir rumbo y distancia entre dos puntos, encuadre ajustado/completo).

import { h } from './dom.js';
import { renderChart } from '../graphics/chart-renderer.js';
import { rhumbTo } from '../math/mercator.js';
import { fmtLat, fmtLon, fmtBearing, fmtMiles } from '../math/format.js';

export function chartWidget(chart, { items = [], focus = [], step = Infinity, height = 440 } = {}) {
  let full = !focus.length;
  let measure = [];
  const holder = h('div.chart-holder');
  const readout = h('div.readout', 'Toca la carta para medir rumbo y distancia entre dos puntos.');
  const toggle = h('button.small.secondary', { type: 'button', onclick: () => { full = !full; draw(); } });
  let view;

  function draw() {
    toggle.textContent = full ? '🔍 Ajustar a la zona' : '🗺️ Ver carta completa';
    toggle.hidden = !focus.length;
    const measureItems = measure.length === 2
      ? [{ t: 'seg', from: measure[0], to: measure[1], style: 'measure', arrow: true }]
      : measure.map((p) => ({ t: 'pos', at: p, style: 'measure' }));
    const r = renderChart(chart, { items: [...items, ...measureItems], focus: full ? [] : focus, step, width: 640, height });
    view = r.view;
    holder.innerHTML = r.svg;
    const svg = holder.querySelector('svg');
    svg.addEventListener('pointermove', (ev) => {
      if (measure.length === 1 || measure.length === 0) {
        const p = toGeo(svg, ev);
        readout.textContent = `${fmtLat(p.lat)}  ${fmtLon(p.lon)}${measure.length === 1 ? ` · ${describe(measure[0], p)}` : ''}`;
      }
    });
    svg.addEventListener('click', (ev) => {
      const p = toGeo(svg, ev);
      measure = measure.length >= 2 ? [p] : [...measure, p];
      draw();
      readout.textContent = measure.length === 2
        ? `Medida: ${describe(measure[0], measure[1])}  (toca otra vez para empezar de nuevo)`
        : `Punto A: ${fmtLat(p.lat)} ${fmtLon(p.lon)} — toca el punto B`;
    });
  }

  function toGeo(svg, ev) {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return view.unproject(q);
  }

  const describe = (a, b) => {
    const r = rhumbTo(a, b);
    return `Rv ${fmtBearing(r.bearing)} · ${fmtMiles(r.distance)}`;
  };

  draw();
  const el = h('div.chart-widget', holder, h('div.chart-tools', readout, h('span.spacer'), toggle,
    h('button.small.secondary', { type: 'button', onclick: () => { measure = []; draw(); readout.textContent = 'Medición borrada.'; } }, '✖ Borrar medida')));
  return {
    el,
    setStep(s) { step = s; draw(); },
  };
}

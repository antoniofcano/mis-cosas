// Vistas secundarias: teoría, progreso y carta.

import { h } from '../dom.js';
import { EXERCISES, exercisesByCategory } from '../../exercises/registry.js';
import { GLOSSARY } from '../../nautical/glossary.js';
import { chartWidget } from '../chart-widget.js';
import { fmtLat, fmtLon } from '../../math/format.js';
import { link } from '../router.js';

export function theoryView() {
  const el = h('div.theory',
    h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › Teoría'),
    h('h1', 'Conceptos y métodos'),
    h('section', h('h2', 'Convención de signos'),
      h('p', 'Este (E) = +, Oeste (W) = −. Ct = dm + Δ. Rv = Ra + Ct. Dv = Da + Ct. Dv = Rv + M (estribor +, babor −). Rs = Rv + Ab.')),
    h('section', h('h2', 'Glosario'), h('dl', Object.values(GLOSSARY).map((g) => [h('dt', g.term), h('dd', g.text)]))),
    exercisesByCategory().map((c) => h('section', h('h2', `${c.icon} ${c.title}`),
      c.exercises.map((e) => h('article.method-card', h('h3', h('a', { href: link(['ej', e.id]) }, e.title)), h('ol', e.method.map((m) => h('li', m))))))),
  );
  return {
    el,
    summary: () => `VISTA teoría\n${Object.values(GLOSSARY).map((g) => `${g.term}: ${g.text}`).join('\n')}`,
  };
}

export function progressView({ progress }) {
  const s = progress.settings();
  const rows = EXERCISES.map((e) => ({ e, st: progress.stats(e.id) }));
  const fileInput = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: async () => {
    try { progress.import(await fileInput.files[0].text()); location.reload(); } catch (err) { alert(`No se pudo importar: ${err.message}`); }
  } });
  const exams = Object.values(progress.get().exams);
  const el = h('div.progress',
    h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › Progreso'),
    h('h1', 'Tu progreso'),
    h('table.stats', h('thead', h('tr', h('th', 'Ejercicio'), h('th', 'Intentos'), h('th', 'Aciertos'), h('th', '%'), h('th', 'Errores frecuentes'))),
      h('tbody', rows.map(({ e, st }) => h('tr',
        h('td', h('a', { href: link(['ej', e.id]) }, e.title)), h('td', st.attempts), h('td', st.correct),
        h('td', st.rate == null ? '—' : `${Math.round(st.rate * 100)}%`),
        h('td.small', Object.entries(st.mistakes ?? {}).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join(', ') || '—'))))),
    h('p', `Preguntas de examen respondidas: ${exams.length} · correctas: ${exams.filter((x) => x.ok).length}`),
    h('section', h('h2', 'Ajustes'),
      h('label.field', h('span.lbl', 'Tolerancia de corrección'),
        h('select', { onchange: (ev) => progress.setSetting('toleranceFactor', Number(ev.target.value)) },
          [[0.5, 'Estricta (½)'], [1, 'Normal (examen)'], [2, 'Amplia (×2)']].map(([v, t]) => h('option', { value: v, selected: s.toleranceFactor === v }, t)))),
    ),
    h('section', h('h2', 'Copia de seguridad'),
      h('p.muted', 'El progreso se guarda solo en este navegador. Expórtalo para no perderlo o pasarlo a otro dispositivo.'),
      h('div.actions',
        h('button', { type: 'button', onclick: () => download('progreso-nautica.json', progress.export()) }, '⬇️ Exportar'),
        h('button.secondary', { type: 'button', onclick: () => fileInput.click() }, '⬆️ Importar'), fileInput,
        h('button.secondary', { type: 'button', onclick: () => { if (confirm('¿Borrar todo el progreso?')) { progress.reset(); location.reload(); } } }, '🗑️ Borrar'))),
  );
  return {
    el,
    summary: () => `VISTA progreso\n${rows.map(({ e, st }) => `${e.id}: ${st.correct}/${st.attempts}${st.mistakes ? ` errores=${JSON.stringify(st.mistakes)}` : ''}`).join('\n')}`,
  };
}

function download(name, text) {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function chartView({ ctx }) {
  const { chart } = ctx;
  const w = chartWidget(chart, { height: 560 });
  const el = h('div.chart-page',
    h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › Carta'),
    h('h1', chart.name),
    h('p.muted', 'Toca dos puntos para medir rumbo verdadero y distancia (loxodrómica, como con transportador y compás).'),
    w.el,
    h('h2', 'Puntos notables'),
    h('table.stats', h('thead', h('tr', h('th', 'Punto'), h('th', 'Latitud'), h('th', 'Longitud'), h('th', 'Luz'))),
      h('tbody', chart.points().map((p) => h('tr', h('td', p.name), h('td', fmtLat(p.lat)), h('td', fmtLon(p.lon)), h('td.small', p.characteristic ?? ''))))),
    chart.source ? h('p.muted.small', `Fuente de datos: ${chart.source}`) : null,
  );
  return { el, summary: () => `VISTA carta ${chart.id}\n${chart.points().map((p) => `${p.id}: ${p.name} ${fmtLat(p.lat)} ${fmtLon(p.lon)}`).join('\n')}` };
}

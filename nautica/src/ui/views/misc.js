// Vistas secundarias: teoría, progreso y carta.

import { h } from '../dom.js';
import { EXERCISES, exercisesByCategory } from '../../exercises/registry.js';
import { GLOSSARY } from '../../nautical/glossary.js';
import { chartWidget } from '../chart-widget.js';
import { fmtLat, fmtLon } from '../../math/format.js';
import { link } from '../router.js';
import { voice, spanishVoices } from '../voice.js';
import { saveUserChart, loadUserChart, deleteUserChart } from '../../store/user-chart.js';
import { resetRaster } from '../chart/raster.js';

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
    voice.supported ? h('section', h('h2', '👨‍🏫 Voz del profe'),
      h('p.muted', 'Usa las voces de tu navegador o sistema (gratis). En Chrome y en Android suelen estar las de Google; en iPhone/Mac, las de Apple. Si no oyes nada, revisa que haya una voz en español instalada.'),
      h('label.field', h('span.lbl', 'Voz activada'), h('input', { type: 'checkbox', checked: voice.enabled, style: 'width:auto', onchange: (ev) => voice.setEnabled(ev.target.checked) })),
      (() => {
        const sel = h('select', { onchange: (ev) => voice.setVoiceName(ev.target.value) }, h('option', 'Cargando voces…'));
        spanishVoices().then((list) => {
          sel.replaceChildren(...(list.length ? list.map((v) => h('option', { value: v.name, selected: v.name === s.vozNombre }, `${v.name} (${v.lang})`)) : [h('option', 'No hay voces en español en este dispositivo')]));
        });
        return h('label.field', h('span.lbl', 'Voz'), sel);
      })(),
      h('label.field', h('span.lbl', 'Velocidad'), h('select', { onchange: (ev) => voice.setRate(Number(ev.target.value)) },
        [[0.85, 'Lenta'], [1, 'Normal'], [1.15, 'Rápida']].map(([v, t]) => h('option', { value: v, selected: voice.rate === v }, t)))),
      h('div.actions', h('button.secondary', { type: 'button', onclick: () => voice.speak('Hola, soy tu profe de navegación. Recuerda: corrección total igual a declinación más desvío. Este suma, oeste resta.') }, '▶ Probar la voz')),
    ) : null,
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
  const w = chartWidget(chart, { height: 600 });
  const status = h('p.small', 'Comprobando…');
  const fileInput = h('input', { type: 'file', accept: 'application/pdf,image/*', hidden: true, onchange: async () => {
    const file = fileInput.files[0];
    if (!file) return;
    status.textContent = 'Procesando la carta…';
    try {
      const { width, height } = await saveUserChart(file);
      resetRaster();
      status.textContent = `Carta guardada (${width}×${height} px). Recargando…`;
      location.reload();
    } catch (e) {
      status.textContent = `No se pudo cargar: ${e.message}`;
    }
  } });
  loadUserChart().then((rec) => {
    status.textContent = rec
      ? `Tienes cargada «${rec.name}» (${rec.width}×${rec.height} px). Elige «Mi carta» o «Ambas» en el selector de capa.`
      : 'No has cargado tu carta escaneada. La carta vectorial funciona igualmente.';
  });
  const el = h('div.chart-page',
    h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › Carta'),
    h('h1', chart.name),
    h('p.muted', 'Herramientas: ✋ mover (la carta, tus puntos, textos, extremos de línea y el transportador, también girar su hilo; toca un punto para ver u ocultar sus coordenadas) · 📏 regla (Rv y distancia) · 🧭 compás (millas en la escala de latitudes) · 📐 transportador cuadrado (interruptor: púlsalo para ponerlo o quitarlo; se queda puesto aunque cambies de herramienta; arrastra el centro, gira el hilo dentro del cuadrado, «Trazar») · 📍 punto · 🔤 texto · 🧽 goma · 🏷 coordenadas sí/no · ⌖ situar por coordenadas. Guías: arrastra desde la escala de latitudes (izquierda) o de longitudes (arriba) para sacar un paralelo o un meridiano; tócala para escribir su valor exacto; suéltala sobre la escala para quitarla. El cruce de dos guías es el punto, y las herramientas se ajustan a él. Se ajustan a los faros y al centro del transportador.'),
    w.el,
    h('section', h('h2', 'Mi carta escaneada (opcional)'),
      h('p', 'Puedes cargar tu propia copia de la carta L105 Enseñanza (PDF escaneado o imagen) para usarla de fondo con las mismas herramientas. ',
        'Se guarda solo en este navegador: no se sube a ningún sitio. La app la georreferencia con la calibración del escaneo A4 de la L105 (7024×5226 px o la misma proporción).'),
      status,
      h('div.actions',
        h('button', { type: 'button', onclick: () => fileInput.click() }, '📂 Cargar mi carta (PDF o imagen)'), fileInput,
        h('button.secondary', { type: 'button', onclick: async () => { await deleteUserChart(); resetRaster(); location.reload(); } }, 'Quitar'),
      ),
    ),
    h('h2', 'Puntos notables'),
    h('table.stats', h('thead', h('tr', h('th', 'Punto'), h('th', 'Latitud'), h('th', 'Longitud'), h('th', 'Luz'))),
      h('tbody', chart.points().map((p) => h('tr', h('td', p.name), h('td', fmtLat(p.lat)), h('td', fmtLon(p.lon)), h('td.small', p.characteristic ?? ''))))),
    chart.source ? h('p.muted.small', `Fuente de datos: ${chart.source}`) : null,
  );
  return { el, summary: () => `VISTA carta ${chart.id}\nDIBUJO ALUMNO: ${w.summary() || '(nada)'}\n${chart.points().map((p) => `${p.id}: ${p.name} ${fmtLat(p.lat)} ${fmtLon(p.lon)}`).join('\n')}` };
}

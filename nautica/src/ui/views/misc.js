// Vistas secundarias: conceptos de carta, mi progreso y mesa de cartas.

import { h, setChildren } from '../dom.js';
import { EXERCISES, exercisesByCategory } from '../../exercises/registry.js';
import { GLOSSARY } from '../../nautical/glossary.js';
import { chartWidget, avisoCartaMovil } from '../chart-widget.js';
import { fmtLat, fmtLon } from '../../math/format.js';
import { link } from '../router.js';
import { volver, tlink } from '../titulacion.js';
import { TITULACIONES } from '../../theory/blocks.js';
import { calcularPlan } from '../cierre.js';
import { avance, estadoTema, parteTema, lineaAvance, clasesFlojas, MIN_DIAGNOSTICO } from '../../course/plan.js';
import { lineaEstado } from './temario.js';
import { saveUserChart, loadUserChart, deleteUserChart } from '../../store/user-chart.js';
import { resetRaster } from '../chart/raster.js';
import { bloquesEnOrden } from '../../theory/blocks.js';

export function theoryView({ tit }) {
  const el = h('div.theory',
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', 'Conceptos y métodos de carta'),
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

export function progressView({ progress, tit }) {
  const T = TITULACIONES[tit] ?? TITULACIONES.per;
  const s = progress.settings();
  const rows = EXERCISES.map((e) => ({ e, st: progress.stats(e.id) })).filter(({ st }) => st.attempts > 0);
  const temas = h('div', h('p.muted', 'Cargando…'));
  let resumenTemas = '';
  calcularPlan(progress, tit).then((d) => {
    const a = avance(T.estructura, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora);
    // En el mismo orden que el Temario y Examen: el de estudio recomendado.
    const filas = bloquesEnOrden(T.estructura).map((b) => ({ b, e: estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora) }));
    const racha = progress.racha();
    resumenTemas = `AVANCE ${T.sigla}: ${a.temasAlDia}/${a.temasTotal} temas al día\n${filas.map(({ b, e }) => `${b.titulo}: ${e.estado} · hechas ${e.hechas}/${e.total} · acierto ${e.pct ?? '—'}`).join('\n')}`;
    setChildren(temas,
      h('section.avance',
        h('div.bar', h('span', { style: `width:${Math.round(a.fraccion * 100)}%` })),
        h('p', lineaAvance(a, racha))),
      (() => {
        // Diagnóstico por clase (B5): dónde se falla, con enlace a la clase para repasarla.
        const flojas = clasesFlojas(d.curso, d.respuestas);
        resumenTemas += `\nCLASES FLOJAS: ${flojas.map((c) => `${c.id} ${c.titulo} ${c.aciertos}/${c.hechas}`).join(' · ') || '—'}`;
        return h('section.diagnostico', h('h2', 'Dónde fallas más'),
          flojas.length
            ? h('ul.clases-flojas', flojas.map((c) => h('li', h('a', { href: tlink(T.id, ['curso', c.id]) },
              h('span.clase-floja-titulo', `🎓 ${c.titulo}`),
              h('span.clase-floja-dato', `aciertas ${c.aciertos} de ${c.hechas} · repasar la clase →`)))))
            : h('p.muted', `Cuando respondas al menos ${MIN_DIAGNOSTICO} preguntas de una clase, aquí verás las que más te cuestan.`));
      })(),
      h('h2', `Por temas · ${T.sigla}`),
      h('div.lista-temas', filas.map(({ b, e }) => h('a.card.tema-card', { href: tlink(T.id, ['temario', String(b.ut)]) },
        h('h3', `${b.icon} ${b.titulo}`),
        h('p.estado-linea', { class: { bien: 'ok', repasar: 'warn' }[e.estado] ?? '' }, lineaEstado(e)),
        e.estado !== 'sin-empezar' ? h('div.bar', { title: 'Camino hasta tener el tema al día' }, h('span', { style: `width:${Math.round(100 * parteTema(e))}%` })) : null))));
  }).catch((e) => setChildren(temas, h('p.warn', `No se pudo calcular tu avance: ${e.message}`)));

  const examenes = Object.values(TITULACIONES).map((X) => {
    const tests = progress.tests().filter((t) => (t.tit ?? 'per') === X.id).reverse();
    return tests.length ? h('section', h('h2', `${X.icon} Exámenes ${X.sigla}`),
      h('ul.ultimos', tests.slice(0, 20).map((t) => h('li', `${new Date(t.t).toLocaleDateString('es-ES')} · ${t.titulo}: ${t.aciertos} de ${t.total} ${t.apto == null ? '' : t.apto ? '✅ APTO' : '❌ NO APTO'}`)))) : null;
  });

  const el = h('div.progress',
    volver('Hoy', tlink(tit)),
    h('h1', 'Mi progreso'),
    temas,
    examenes,
    h('details', h('summary', 'Ejercicios de carta'),
      rows.length
        ? h('table.stats', h('thead', h('tr', h('th', 'Ejercicio'), h('th', 'Bien'), h('th', 'Errores frecuentes'))),
          h('tbody', rows.map(({ e, st }) => h('tr',
            h('td', h('a', { href: link(['ej', e.id]) }, e.title)), h('td', `${st.correct} de ${st.attempts}`),
            h('td', Object.entries(st.mistakes ?? {}).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${k} (${n})`).join(', ') || '—')))))
        : h('p', 'Todavía no has hecho ejercicios de carta.'),
      h('label.field', h('span.lbl', 'Exigencia al corregir la carta'),
        h('select', { onchange: (ev) => progress.setSetting('toleranceFactor', Number(ev.target.value)) },
          [[0.5, 'Exigente'], [1, 'Como en el examen'], [2, 'Con margen']].map(([v, t]) => h('option', { value: v, selected: s.toleranceFactor === v }, t))))),
  );
  return {
    el,
    summary: () => `VISTA progreso\n${resumenTemas}\nEJERCICIOS DE CARTA:\n${rows.map(({ e, st }) => `${e.id}: ${st.correct}/${st.attempts}${st.mistakes ? ` errores=${JSON.stringify(st.mistakes)}` : ''}`).join('\n') || '(ninguno)'}`,
  };
}

export function chartView({ ctx, progress, tit }) {
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
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', `Mesa de cartas · ${chart.name}`),
    h('details.como-se-usa', h('summary', 'Cómo se usa la mesa de cartas'),
      h('ul',
        h('li', '✋ Mover: la carta, tus puntos, textos, extremos de línea y el transportador (también girar su hilo). Toca un punto para ver u ocultar sus coordenadas.'),
        h('li', '📏 Regla: rumbo verdadero y distancia.'),
        h('li', '🧭 Compás: millas en la escala de latitudes.'),
        h('li', '📐 Transportador cuadrado: púlsalo para ponerlo o quitarlo; se queda puesto aunque cambies de herramienta. Arrastra el centro, gira el hilo dentro del cuadrado y pulsa «Trazar».'),
        h('li', '📍 Punto · 🔤 Texto · 🧽 Goma.'),
        h('li', '🏷 Coordenadas: muestra u oculta las de los puntos. ⌖ Situar: traza las guías desde unas coordenadas.'),
        h('li', 'Guías: arrastra desde la escala de latitudes (izquierda) o de longitudes (arriba) para sacar un paralelo o un meridiano; tócala para escribir su valor exacto; suéltala sobre la escala para quitarla.'),
        h('li', 'El cruce de dos guías es el punto, y las herramientas se ajustan a él, a los faros y al centro del transportador.'))),
    avisoCartaMovil(progress),
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
  return { el, summary: () => `VISTA mesa de cartas ${chart.id}\nDIBUJO ALUMNO: ${w.summary() || '(nada)'}\n${chart.points().map((p) => `${p.id}: ${p.name} ${fmtLat(p.lat)} ${fmtLon(p.lon)}`).join('\n')}` };
}

// #/<tit>/idea/<idConcepto>[?desde=repaso|sesion|temario/<ut>|progreso] — ficha de una idea que se le resiste al alumno
// (src/course/ficha.js): qué es (la nota del catálogo, sin lo que solo sirve para etiquetar), dónde se enseña (clase,
// mapa y lámina), la regla para recordar si la hay, la chuleta de su clase y «Probar otra pregunta» (del estudio de este
// banco: nunca reservada, anulada ni retirada). Se abre desde el repaso de fallos, el resumen de la sesión, el Temario
// y Progreso; ningún examen ni simulacro la enlaza. Sin etiquetas en el banco activo, solo un aviso.

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink, volver, currentEje } from '../titulacion.js';
import { cargarBanco, cargarCurso } from '../../bancos/index.js';
import { loadMnemonics } from '../../store/datasets.js';
import { conceptosDelBanco, clasesDeCurso, estadoFicha } from '../concepto.js';
import { cargarMapas } from './mapas.js';
import { nodosDeClase } from '../../course/mapas.js';
import { notaParaAlumno, reglasDeIdea, preguntaParaProbar } from '../../course/ficha.js';
import { chuletasDeClases } from '../../course/chuletario.js';
import { bloqueDe, nombreBloque } from '../../course/nivel.js';
import { colaRepaso, siguienteRepasoConcepto, diaLocal } from '../../course/repaso.js';
import { illustrationEls } from '../illustration.js';
import { tandaPreguntas, prepareTheory } from './theory.js';
import { rich } from './curso.js';
import { cuenta } from '../../texto.js';

/** Adónde vuelve la ficha según de dónde se abrió. */
export function volverDe(tit, desde) {
  const [a, b] = String(desde ?? '').split('/');
  if (a === 'repaso') return ['Repaso de fallos', tlink(tit, ['teoria', 'repaso'])];
  if (a === 'sesion') return ['Resumen de la sesión', tlink(tit, ['sesion'])];
  if (a === 'temario' && /^\d+$/.test(b ?? '')) return ['El tema', tlink(tit, ['temario', b])];
  if (a === 'temario') return ['Temario', tlink(tit, ['temario'])];
  if (a === 'progreso') return ['Mi progreso', link(['progreso'])];
  return ['Hoy', tlink(tit)];
}

export function ideaView({ ctx, progress, params: route, tit }) {
  const T = TITULACIONES[tit];
  const id = decodeURIComponent(route.parts[1] ?? '');
  const [txtVolver, hrefVolver] = volverDe(tit, route.query.desde);
  const el = h('div.ficha-idea', volver(txtVolver, hrefVolver), h('p.muted', 'Cargando…'));
  let summaryText = `VISTA ficha de la idea ${id} (${T.sigla})`;
  const eje = currentEje(progress);
  Promise.all([cargarBanco(eje, tit), conceptosDelBanco(eje, tit), cargarCurso(tit, eje), loadMnemonics().catch(() => ({ reglas: [] }))]).then(([banco, ic, curso, mnemo]) => {
    const c = ic?.concepto(id);
    if (!ic || !c || c.tipo !== 'concepto' || !(c.tit ?? []).includes(tit) || !ic.preguntasDe(id, { soloEstudio: false }).length) {
      setChildren(el, volver(txtVolver, hrefVolver), h('h1', 'Ficha de la idea'),
        h('p', ic ? 'Esta idea no está en el temario que estudias.' : `Las fichas de ideas aún no están disponibles con los exámenes de ${banco.eje.nombre ?? 'tu comunidad'}.`),
        h('a.btn.grande', { href: hrefVolver }, `Volver: ${txtVolver}`));
      summaryText += ic ? ': no es de este banco' : ': sin etiquetas';
      return;
    }
    prepareTheory({ tit, chart: ctx?.chart, reglas: banco.reglasDe });
    const clave = banco.eje.id;
    const respuestas = () => progress.get().exams;
    const { d } = estadoFicha(ic, id, respuestas(), progress.fichasVistas(clave, tit));
    progress.recordFichaVista(clave, tit, id); // abierta: el repaso ya puede volver a preguntarla

    // Dónde se enseña: la primera de sus clases en este curso, con su mapa (si un nodo es de esa clase) y su lámina.
    const clases = clasesDeCurso(curso);
    const clase = (c.clases ?? []).map((x) => clases.get(x)).find(Boolean) ?? null;
    const spec = clase ? (clase.pasos ?? []).find((p) => p.tipo === 'ilustracion' && p.spec)?.spec ?? null : null;
    const mapaHueco = h('span');
    if (clase) {
      cargarMapas().then((mapas) => {
        const n = nodosDeClase(mapas, clase.id, tit)[0];
        if (n) setChildren(mapaHueco, ' · ', h('a', { href: tlink(tit, ['mapas', n.mapa.id], { v: 'mapa', n: n.nodo.id }) }, `Mapa: ${n.mapa.titulo}`));
      }).catch(() => {});
    }
    const qs = ic.preguntasDe(id, { soloEstudio: false, conDescendientes: false });
    const reglas = reglasDeIdea(qs, banco.reglasDe, clase, new Map((mnemo.reglas ?? []).map((r) => [r.id, r])));
    const chuleta = clase ? chuletasDeClases(curso, { leccion: clase.id })[0] ?? null : null;
    const nota = notaParaAlumno(c.nota);
    const bloque = nombreBloque(ic.catalogo, bloqueDe(ic.catalogo, id));
    const como = d?.vistas ? `Llevas ${d.aciertos} de ${cuenta(d.vistas, 'pregunta')} bien${d.estado === 'flojo' ? ': todavía se te resiste' : ''}.` : 'Aún no has respondido preguntas de esta idea.';

    // Probar otra pregunta: una del estudio de esta idea. Si la idea toca hoy en el repaso, cuenta como su repaso.
    const prueba = h('section.ficha-prueba', { 'aria-live': 'polite' });
    const usadas = [];
    const botones = h('div.botones.ficha-botones', h('button.grande', { type: 'button', onclick: () => probar() }, 'Probar otra pregunta'), h('a.btn.secondary.grande', { href: hrefVolver }, `Volver: ${txtVolver}`));
    const probar = () => {
      botones.hidden = true;
      // Mientras responde, modo concentración (como en una tanda): la hoja de la corrección y «No la sé» van abajo, sin
      // la barra de pestañas encima. Se quita al terminar (y con cualquier cambio de pantalla, que lo recalcula app.js).
      document.body.classList.add('focus');
      const q = preguntaParaProbar(ic, id, respuestas(), { excluir: usadas });
      if (!q) { document.body.classList.remove('focus'); botones.hidden = false; setChildren(prueba, h('p.muted', 'No quedan más preguntas de esta idea en tus exámenes.')); return; }
      usadas.push(q.id);
      const hoy = diaLocal();
      const barra = { set: () => {} };
      setChildren(prueba, h('h2', 'Otra pregunta de esta idea'), tandaPreguntas({
        preguntas: [q], explicaciones: banco.explicaciones, progress, barra, vocab: banco.vocab,
        alResponder: (i, q2, ok) => {
          const item = colaRepaso(banco.estudio, progress.get().exams, hoy, { principalDe: ic.principalDe, estado: progress.repasoConceptos(clave, tit) }).items.find((x) => x.concepto === id);
          if (item && item.rep.prox <= hoy) progress.recordRepasoConcepto(clave, tit, id, siguienteRepasoConcepto(item.rep, ok, hoy, new Date().toISOString()));
          return ok ? 'Bien: esta vez la tienes.' : 'Vuelve mañana al repaso, con otra pregunta.';
        },
        onFin: (ok) => {
          document.body.classList.remove('focus');
          setChildren(prueba, h('p.ficha-prueba-fin', ok ? 'Bien: esta vez la tienes.' : 'Todavía no: repasa la ficha y vuelve a probar.'),
            h('div.botones', h('button.grande', { type: 'button', onclick: probar }, 'Probar otra pregunta'), h('a.btn.secondary.grande', { href: hrefVolver }, `Volver: ${txtVolver}`)));
          prueba.scrollIntoView?.({ block: 'start' });
        },
      }));
      prueba.scrollIntoView?.({ block: 'start' });
    };

    setChildren(el,
      volver(txtVolver, hrefVolver),
      h('p.eti.ficha-eti', `Ficha de la idea · ${bloque}`),
      h('h1', c.etiqueta),
      h('p.ficha-como', como),
      nota ? h('section.ficha-nota', h('h2.eti', 'Qué es'), h('p', nota)) : null,
      h('section.ficha-donde', h('h2.eti', 'Dónde se enseña'),
        clase ? h('p', h('a', { href: tlink(tit, ['curso', clase.id]) }, `Clase: ${clase.titulo}`), mapaHueco) : h('p.muted', 'No tiene una clase propia: sale en las preguntas de examen.'),
        spec ? h('div.ficha-lamina', illustrationEls(spec)) : null),
      reglas.length ? h('section.ficha-reglas', h('h2.eti', 'Para recordar'), h('ul', reglas.map((r) => h('li', h('strong', r.regla), r.significado ? h('span.muted.small', ` ${r.significado}`) : null)))) : null,
      chuleta?.lineas?.length ? h('section.ficha-chuleta', h('h2.eti', 'Chuleta de la clase'), h('ul', chuleta.lineas.map((x) => h('li', rich(x))))) : null,
      prueba,
      botones);
    summaryText = `VISTA ficha de la idea ${id} «${c.etiqueta}» (${T.sigla}, ${clave}) · ${como}\nNOTA: ${nota ?? '—'}\nCLASE: ${clase ? `${clase.id} ${clase.titulo}` : '—'}${spec ? ' · con lámina' : ''}\nREGLAS: ${reglas.map((r) => r.id).join(', ') || '—'} · CHULETA: ${chuleta ? 'sí' : 'no'}`;
  }).catch((e) => setChildren(el, volver(txtVolver, hrefVolver), h('p.warn', `No se pudo abrir la ficha: ${e.message}`)));
  return { el, summary: () => summaryText };
}

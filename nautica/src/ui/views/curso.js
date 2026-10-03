// Clase: #/<tit>/curso/<lección>[?practica=1] — tarjetas paso a paso (se retoma donde se dejó), chuleta,
// práctica con preguntas reales y repaso espaciado. Modo concentración con barra de actividad.

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { loadCourse, loadTheoryBank, loadMnemonics } from '../../store/datasets.js';
import { trasPractica, leccionesDe, APROBADO, conPreguntaFinal, estadoLeccion } from '../../course/engine.js';
import { resueltasDe, conResuelto } from '../../course/resueltos.js';
import { SOLUCIONES, bancoResolucion } from '../../exams/solutions/index.js';
import { MIN_TANDA } from '../../course/plan.js';
import { tlink, volver } from '../titulacion.js';
import { barraActividad } from '../actividad.js';
import { pintarCierre } from '../cierre.js';
import { illustrationEls } from '../illustration.js';
import { pidePrediccion } from '../../illustrations/interactivas.js';
import { questionCard, prepareTheory, tandaPreguntas, profePanel } from './theory.js';
import { voice } from '../voice.js';
import { avisoError } from '../aviso-error.js';
import { dondeEncaja } from '../encaja.js';
import { episodiosDeClase, enlaceEpisodio } from './podcast.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { getExercise } from '../../exercises/registry.js';

const PRACTICA_MAX = 10;

/** Texto con **negrita** y listas «- » → nodos (sin HTML del contenido). */
const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p) => (/^\*\*.+\*\*$/.test(p) ? h('strong', p.slice(2, -2)) : p));
export function rich(text = '') {
  return text.split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-•]\s/.test(l))) return h('ul', lines.map((l) => h('li', inline(l.replace(/^\s*[-•]\s/, '')))));
    return h('p', lines.map((l, i) => [i ? h('br') : null, inline(l)]));
  });
}
const plain = (text = '') => text.replace(/\*\*/g, '').replace(/^\s*[-•]\s/gm, '');

// ---------------------------------------------------------------------------
// #/<tit>/curso/<id>

export function leccionView({ ctx, progress, params: route, tit }) {
  const id = route.parts[1];
  const barra = barraActividad({ texto: 'Cargando la clase…', onSalir: () => { voice.stop(); location.hash = tlink(tit); } });
  const cont = h('div', h('p.muted', 'Cargando la clase…'));
  const el = h('div.leccion', barra, cont);
  let summaryText = `VISTA clase ${id} (cargando)`;

  // Clase del PER abierta desde una del PY (?desde=<id>): se ofrece volver a ella.
  const desde = route.query?.desde || null;
  Promise.all([loadCourse(tit), loadTheoryBank(tit), loadMnemonics(), tit === 'py' ? loadCourse('per') : null, desde ? loadCourse('py') : null,
    episodiosDeClase(tit, id).catch(() => [])]).then(([curso, bank, mnemo, cursoPer, cursoPy, episodios]) => {
    const todas = curso ? leccionesDe(curso) : [];
    const L = todas.find((l) => l.id === id);
    if (!L) {
      document.body.classList.remove('focus');
      barra.remove();
      setChildren(cont, volver('Temario', tlink(tit, ['temario'])), h('p', 'Esta clase no existe (todavía).'));
      return;
    }
    prepareTheory({ tit, chart: ctx.chart, reglas: bank.reglasDe });
    const reglas = new Map(mnemo.reglas.map((r) => [r.id, r]));
    const preguntas = new Map(bank.preguntas.map((q) => [q.id, q]));
    const reg = () => progress.leccion(L.id) ?? {};
    const disponibles = (L.practica ?? []).map((q) => preguntas.get(q)).filter((q) => q && !q.anulada && q.correcta);
    const nPractica = Math.min(PRACTICA_MAX, disponibles.length);

    // Base del PER de una clase del PY (L.refresco): título, si ya se vio y enlace que permite volver aquí.
    const clasesPer = cursoPer ? new Map(leccionesDe(cursoPer).map((l) => [l.id, l])) : new Map();
    const base = (L.refresco ?? []).map((rid) => clasesPer.get(rid)).filter(Boolean).map((l) => {
      const e = estadoLeccion(l, progress.leccion(l.id), progress.get().exams).estado;
      return { l, vista: e !== 'nueva' && e !== 'empezada' };
    });
    const enlaceBase = ({ l, vista }) => h('li', h('a', { href: tlink('per', ['curso', l.id], { desde: L.id }) }, l.titulo), vista ? ' ✓' : h('span.muted.small', ' · sin ver'));
    const listaBase = () => h('ul.base-per', base.map(enlaceBase));
    // Volver a la clase del PY desde la que se abrió esta del PER.
    const origen = desde && cursoPy ? leccionesDe(cursoPy).find((l) => l.id === desde) : null;
    const volverOrigen = (cls = 'a.volver-origen') => (origen ? h(cls, { href: tlink('py', ['curso', origen.id]) }, `← Volver a tu clase del PY: ${origen.titulo}`) : null);

    // El podcast de esta clase (si ya tiene audio): en la primera tarjeta, a mano en todas y al terminar.
    const episodio = episodios.find((e) => e.audio) ?? null;
    const enlacePodcast = episodio ? enlaceEpisodio(tit, episodio, `curso/${L.id}`) : null;
    const minPodcast = episodio ? Math.round(episodio.duracion / 60) : 0;

    // --- tarjetas: la 0 es «En esta clase» (objetivos y tiempo); después, los pasos de la clase
    // La pregunta del final cambia cada vez: una real de examen de esta clase.
    const tarjetas = [{ tipo: 'intro' }, ...conPreguntaFinal(conResuelto(L.pasos, resueltasDe(L.id).filter((id) => preguntas.has(id))), disponibles, createRng(randomSeed()))];
    const n = tarjetas.length;
    let paso = Math.min(Math.max(0, Number(reg().paso) || 0), n - 1);
    let checkOk = new Set();

    function pasoEl(p, i) {
      switch (p.tipo) {
        case 'intro': return h('div.paso.intro', h('h2', L.titulo),
          // Lo primero, antes de empezar: lo que esta clase del PY da por sabido del PER.
          base.length ? h('section.viene-per', h('h3', '🔁 Viene del PER'),
            h('p.small', base.every((b) => b.vista) ? 'Esta clase da por sabido lo del PER que ya viste:' : 'Esta clase da por sabido esto del PER. Si no lo tienes fresco, repásalo antes (luego vuelves aquí):'),
            listaBase()) : null,
          h('h3', 'En esta clase'),
          L.objetivos?.length ? h('ul', L.objetivos.map((o) => h('li', o))) : null,
          h('p.muted', `Unos ${L.minutos ?? 10} minutos.`),
          episodio ? h('p.radio-clase', h('a.btn.secondary', { href: enlacePodcast }, `🎧 Escucha el podcast de esta clase (${minPodcast} min)`),
            h('span.muted.small', ' Antes o después de la clase: Elena y Andrés lo cuentan en voz alta.')) : null);
        case 'texto': return h('div.paso.texto', p.titulo ? h('h3', p.titulo) : null, rich(p.texto));
        case 'ilustracion': {
          // Con predicción, el pie de la clase (que suele dar la respuesta) aparece al responder.
          const pie = p.texto ? h('p.muted', { hidden: pidePrediccion(p.spec) }, p.texto) : null;
          const onRespuesta = () => { if (pie) pie.hidden = false; checkOk.add(i); if (i === paso) refrescaBotones(); };
          return h('div.paso.ilu', h('div.il-grid.inline', illustrationEls(p.spec, { modo: 'clase', onRespuesta })), pie);
        }
        case 'regla': {
          const r = reglas.get(p.id);
          return r ? h('div.paso.regla', h('p.mnemo-big', `🧠 ${r.regla}`), h('p', r.significado)) : null;
        }
        case 'clave': return h('div.paso.clave', h('p', '💡 ', rich(p.texto)));
        case 'ojo': return h('div.paso.ojo', h('p', '⚠️ ', rich(p.texto)));
        case 'resuelto': {
          // Una pregunta real del mismo tipo, resuelta por la app (dibujada en la carta o paso a paso); «Otra» cambia.
          const box = h('div');
          let k = Math.floor(Math.random() * p.ids.length);
          const pinta = () => {
            const q = preguntas.get(p.ids[k]);
            const sinCarta = SOLUCIONES[q.id]?.sinCarta;
            setChildren(box, h('p.muted.small', q.convocatoria ?? ''), h('p', q.enunciado.length > 220 ? `${q.enunciado.slice(0, 220)}…` : q.enunciado),
              h('div.actions',
                h('a.btn', { href: link(['examenes', bancoResolucion(q), q.id]) }, sinCarta ? '🧮 Verla resuelta paso a paso' : '🗺️ Verla resuelta en la carta'),
                p.ids.length > 1 ? h('button.secondary', { type: 'button', onclick: () => { k = (k + 1) % p.ids.length; pinta(); } }, 'Otra pregunta') : null));
          };
          pinta();
          return h('div.paso.resuelto', h('p.badge', `Míralo resuelto: ${p.ids.length} preguntas reales de este tipo`), box);
        }
        case 'check': {
          const fb = h('div');
          if (p.real) {
            const q = p.real;
            let card = questionCard(q, { tema: false, onChoose: (k) => {
              progress.recordExam(q.id, { choice: k, ok: k === q.correcta });
              const nuevo = questionCard(q, { chosen: k, reveal: true, lock: true, tema: false });
              card.replaceWith(nuevo);
              card = nuevo;
              setChildren(fb, profePanel(q, bank.explicaciones[q.id], k));
              checkOk.add(i);
              if (i === paso) refrescaBotones();
            } });
            return h('div.paso.check', h('p.badge', '¿Lo pillas? Pregunta de examen'), card, fb);
          }
          const q = { id: `${L.id}-chk-${i}-${p.enunciado.length}`, enunciado: p.enunciado, opciones: p.opciones, correcta: p.correcta };
          let card = questionCard(q, { tema: false, onChoose: (k) => {
            const nuevo = questionCard(q, { chosen: k, reveal: true, lock: true, tema: false });
            card.replaceWith(nuevo);
            card = nuevo;
            setChildren(fb, h('p', { class: k === p.correcta ? 'ok' : 'warn' }, k === p.correcta ? '✅ ¡Bien!' : `❌ Era la ${p.correcta}).`), p.explicacion ? h('p', p.explicacion) : null);
            checkOk.add(i);
            if (i === paso) refrescaBotones();
          } });
          return h('div.paso.check', h('p.badge', '¿Lo pillas?'), card, fb);
        }
        default: return null;
      }
    }
    const speechOf = (p) => ({
      intro: `${L.titulo}. En esta clase: ${(L.objetivos ?? []).join('. ')}`,
      texto: `${p.titulo ? `${p.titulo}. ` : ''}${plain(p.texto)}`, clave: plain(p.texto), ojo: `Ojo: ${plain(p.texto)}`, ilustracion: p.texto ?? '',
      resuelto: 'Míralo resuelto con una pregunta real de examen.',
      regla: reglas.get(p.id) ? `Para recordarlo: ${reglas.get(p.id).regla}. ${reglas.get(p.id).significado}` : '', check: p.enunciado,
    }[p.tipo] ?? '');

    const guardaPaso = () => progress.saveLeccion(L.id, { ...reg(), paso });
    const anterior = h('button.secondary.boton-anterior', { type: 'button', 'aria-label': 'Anterior', onclick: () => { voice.stop(); paso -= 1; guardaPaso(); tarjeta(); } }, '←');
    const siguiente = h('button.grande', { type: 'button', onclick: () => {
      voice.stop();
      if (paso === n - 1) { terminar(); return; }
      paso += 1;
      guardaPaso();
      tarjeta();
    } });
    function refrescaBotones() {
      anterior.disabled = paso === 0;
      siguiente.textContent = paso === n - 1 ? 'Terminar la clase ✓' : 'Siguiente →';
      const t = tarjetas[paso];
      // Un «¿Lo pillas?» o la predicción de una lámina interactiva se responden antes de seguir.
      siguiente.disabled = (t.tipo === 'check' || (t.tipo === 'ilustracion' && pidePrediccion(t.spec))) && !checkOk.has(paso);
    }

    function tarjeta() {
      const p = tarjetas[paso];
      checkOk.delete(paso); // una pregunta rápida (o una predicción) se vuelve a responder al volver a ella
      barra.set(`Tarjeta ${paso + 1} de ${n}`, (paso + 1) / n);
      const escuchar = voice.supported ? h('button.secondary.small.escuchar', { type: 'button', onclick: () => voice.speak(speechOf(p)) }, '🔊 Escuchar') : null;
      setChildren(cont,
        volverOrigen(),
        h('div.pasos', h('div.paso-cabecera', paso ? h('p.rotulo-tema', L.titulo) : h('span'),
          h('span.paso-botones', episodio && paso ? h('a.btn.secondary.small.escuchar', { href: enlacePodcast, title: 'Escuchar el podcast de esta clase', 'aria-label': 'Podcast de esta clase' }, '🎧') : null, escuchar)),
          pasoEl(p, paso)),
        // A mano durante toda la clase (salvo en la primera tarjeta, que ya la enseña): la base del PER.
        paso && base.length ? h('details.base-per-chip', h('summary', `🔁 Base del PER (${base.length})`), listaBase()) : null,
        h('p.ver-todas', h('a', { href: '#', onclick: (ev) => { ev.preventDefault(); voice.stop(); verTodas(); } }, 'Ver todas las tarjetas seguidas')),
        h('div.fila-inferior', anterior, siguiente),
        h('p.pie-aviso', avisoError(`Clase ${L.id} «${L.titulo}», tarjeta ${paso + 1} de ${n}`, p.titulo ?? p.tipo)));
      refrescaBotones();
      if (voice.supported && progress.settings().vozAuto === true) voice.speak(speechOf(p));
      summaryText = `CLASE ${L.id} «${L.titulo}» · tarjeta ${paso + 1}/${n}: ${speechOf(p)}`;
      window.scrollTo(0, 0);
    }

    function verTodas() {
      barra.set('Todas las tarjetas', 1);
      setChildren(cont,
        h('div.pasos.todas', tarjetas.map((p, i) => pasoEl(p, i))),
        h('div.fila-inferior',
          h('button.secondary', { type: 'button', onclick: () => tarjeta() }, 'Tarjeta a tarjeta'),
          h('button.grande', { type: 'button', onclick: () => terminar() }, 'Terminar la clase ✓')));
      summaryText = `CLASE ${L.id} «${L.titulo}» · todas las tarjetas\n${tarjetas.map(speechOf).join('\n')}`;
      window.scrollTo(0, 0);
    }

    // --- final: chuleta, práctica y material para profundizar
    function terminar() {
      paso = 0;
      progress.saveLeccion(L.id, { ...reg(), visto: true, paso: 0 });
      progress.logActividad(L.minutos ?? 10);
      barra.set('Clase terminada', 1);
      // El podcast que trata esta clase, si ya tiene audio.
      const escucha = episodio ? h('p.radio-clase', h('a.btn.secondary', { href: enlacePodcast }, `🎧 Escúchalo: «${episodio.titulo}» (${minPodcast} min)`)) : null;
      const extra = [
        escucha,
        dondeEncaja(tit, L.id),
        L.carta?.length ? h('details', h('summary', '🗺️ En la carta'), h('ul', L.carta.map((x) => (getExercise(x) ? h('li', h('a', { href: link(['ej', x]) }, getExercise(x).title)) : null)))) : null,
        L.profundizar?.length ? h('details', h('summary', '📚 Para profundizar'), h('ul', L.profundizar.map((r) => h('li', h('a', { href: r.url, target: '_blank', rel: 'noopener' }, r.titulo))))) : null,
        base.length ? h('details', h('summary', '🔁 Repaso del PER'), listaBase()) : null,
      ];
      const chuleta = L.chuleta?.length ? h('section.chuleta', h('h2', '📌 Chuleta'), h('ul', L.chuleta.map((c) => h('li', inline(c)))),
        voice.supported ? h('button.small.secondary', { type: 'button', onclick: () => voice.speak(L.chuleta.map(plain).join('. ')) }, '🔊 Escuchar la chuleta') : null) : null;
      const vuelta = origen ? h('p', volverOrigen('a.btn.grande')) : null;
      if (nPractica) {
        setChildren(cont, vuelta, chuleta,
          h('button.grande.practicar', { type: 'button', onclick: () => practicar() }, `Practicar con ${nPractica} preguntas de examen`),
          extra);
      } else {
        const hueco = h('div');
        setChildren(cont, vuelta, hueco, chuleta, extra);
        pintarCierre(hueco, progress, tit, { icono: '🎉', titulo: 'Clase terminada' });
      }
      summaryText = `CLASE ${L.id} «${L.titulo}» terminada · chuleta: ${(L.chuleta ?? []).map(plain).join(' | ')}`;
      window.scrollTo(0, 0);
    }

    function practicar() {
      const resp = progress.get().exams;
      // primero las no hechas, después las falladas, después el resto
      const orden = (q) => (!resp[q.id] ? 0 : !resp[q.id].ok ? 1 : 2);
      const rng = createRng(randomSeed());
      const ses = rng.shuffle(disponibles).sort((a, b) => orden(a) - orden(b)).slice(0, PRACTICA_MAX);
      setChildren(cont, tandaPreguntas({
        preguntas: ses, explicaciones: bank.explicaciones, progress, barra, vocab: bank.vocab, rotulo: `🎓 ${L.titulo}`,
        onSummary: (t) => { summaryText = `CLASE ${L.id} práctica\n${t}`; },
        onFin: (ok, total) => {
          const acierto = ok / total;
          progress.saveLeccion(L.id, { ...trasPractica(reg(), acierto), paso: 0 });
          progress.logActividad(MIN_TANDA);
          barra.remove();
          pintarCierre(cont, progress, tit, acierto >= APROBADO
            ? { icono: '🎉', titulo: 'Clase aprendida', lineas: [`${ok} de ${total}. Volverá dentro de unos días para afianzarla.`] }
            : { icono: '💪', titulo: `${ok} de ${total}`, lineas: ['Casi. Mañana la repasamos.'] });
          summaryText = `CLASE ${L.id} práctica terminada ${ok}/${total}`;
          window.scrollTo(0, 0);
        },
      }));
      window.scrollTo(0, 0);
    }

    if (route.query.practica === '1' && nPractica) practicar();
    else tarjeta();
  }).catch((err) => setChildren(cont, h('p.warn', `No se pudo cargar la clase: ${err.message}`)));

  return { el, summary: () => summaryText };
}

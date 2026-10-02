// Curso: #/<tit>/curso (módulos, lecciones y «Hoy toca») y #/<tit>/curso/<lección> (tarjetas paso a paso,
// chuleta, práctica con preguntas reales y repaso espaciado).

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { loadCourse, loadTheoryBank, loadMnemonics } from '../../store/datasets.js';
import { estadoLeccion, trasPractica, hoyToca, leccionesDe, APROBADO } from '../../course/engine.js';
import { TITULACIONES, tlink, crumbs } from '../titulacion.js';
import { illustrationEls } from '../illustration.js';
import { questionCard, profePanel, prepareTheory, explanationFor } from './theory.js';
import { voice } from '../voice.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { getExercise } from '../../exercises/registry.js';

const ESTADO_TXT = { nueva: 'sin empezar', empezada: 'a medias', repasar: 'toca repasar', dominada: 'aprendida' };
const PRACTICA_MAX = 10;

/** Texto con **negrita** y listas «- » → nodos (sin HTML del contenido). */
const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p) => (/^\*\*.+\*\*$/.test(p) ? h('strong', p.slice(2, -2)) : p));
function rich(text = '') {
  return text.split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-•]\s/.test(l))) return h('ul', lines.map((l) => h('li', inline(l.replace(/^\s*[-•]\s/, '')))));
    return h('p', lines.map((l, i) => [i ? h('br') : null, inline(l)]));
  });
}
const plain = (text = '') => text.replace(/\*\*/g, '').replace(/^\s*[-•]\s/gm, '');

// ---------------------------------------------------------------------------
// #/<tit>/curso

export function cursoView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.curso', h('p.muted', 'Cargando el curso…'));
  let summaryText = `VISTA curso ${T.sigla} (cargando)`;
  loadCourse(tit).then((curso) => {
    const resp = progress.get().exams;
    const regs = progress.lecciones();
    const fecha = progress.settings()[`examen_${tit}`] ?? '';
    const prioridad = T.estructura.bloques.filter((b) => b.maxErrores != null).map((b) => b.ut);
    const plan = curso ? hoyToca(curso, regs, resp, { fechaExamen: fecha || null, prioridad }) : null;
    const porUt = new Map((curso?.modulos ?? []).map((m) => [m.ut, m]));
    const leccionLink = (l) => tlink(tit, ['curso', l.id]);

    summaryText = `VISTA curso ${T.sigla}\n` + (curso ? leccionesDe(curso).map((l) => {
      const e = estadoLeccion(l, regs[l.id], resp);
      return `${l.id} ${l.titulo}: ${e.estado} · práctica ${e.aciertos}/${e.hechas} de ${e.total}`;
    }).join('\n') : 'sin lecciones todavía');

    const dateInput = h('input', { type: 'date', id: `fecha-${tit}`, value: fecha, style: 'width:auto', onchange: (ev) => { progress.setSetting(`examen_${tit}`, ev.target.value); dispatchEvent(new HashChangeEvent('hashchange')); } });

    setChildren(el,
      crumbs(tit, 'Curso'),
      h('h1', `🎓 Curso ${T.sigla}`),
      h('p', `Clases cortas por bloques del temario: el concepto explicado con dibujos y animaciones, reglas para recordar, preguntas rápidas y, al final, práctica con preguntas reales de examen. Lo que fallas vuelve a los pocos días para que no se te olvide.`),
      tit === 'py' ? h('p.muted.small', 'El Patrón de Yate da por sabido el PER. Si algo te suena oxidado, cada lección enlaza las clases del PER que conviene repasar.') : null,
      plan ? h('section.hoy',
        h('h2', '📅 Hoy toca'),
        plan.repasos.length ? h('p', 'Repasar: ', plan.repasos.map((l, i) => [i ? ' · ' : '', h('a', { href: leccionLink(l) }, l.titulo)])) : null,
        plan.siguiente ? h('p', 'Siguiente clase: ', h('a.btn', { href: leccionLink(plan.siguiente) }, `${plan.siguiente.titulo} →`)) : h('p', '🎉 Has visto todas las lecciones publicadas.'),
        h('p.small', h('label', 'Fecha de tu examen: ', dateInput),
          plan.ritmo ? ` · quedan ${plan.ritmo.dias} días: ${plan.ritmo.pendientes ? `unas ${plan.ritmo.porDia} lecciones al día para acabar una semana antes` : 'temario visto'}${plan.ritmo.simulacros ? '. Esta recta final, haz un simulacro cada día.' : ''}` : ''),
        h('p.muted.small', `${plan.dominadas} de ${plan.total} lecciones dominadas.`)) : null,
      T.estructura.bloques.map((b) => {
        const m = porUt.get(b.ut);
        return h('section.modulo',
          h('h2', `${b.icon} ${b.titulo}`),
          m ? [m.intro ? h('p.muted', m.intro) : null,
            h('ol.lecciones', m.lecciones.map((l) => {
              const e = estadoLeccion(l, regs[l.id], resp);
              return h('li', h('a', { href: leccionLink(l) }, l.titulo),
                h('span.muted.small', ` · ${l.minutos ?? 10} min`),
                h('span.estado', { class: { dominada: 'ok', repasar: 'warn', empezada: 'close' }[e.estado] ?? '' }, ESTADO_TXT[e.estado]),
                e.hechas ? h('span.muted.small', ` ${e.aciertos}/${e.hechas}`) : null);
            }))]
            : h('p.muted.small', 'Lecciones en preparación. Mientras tanto: ', h('a', { href: tlink(tit, ['teoria', 'ut', String(b.ut)], { s: randomSeed() }) }, 'practica el bloque con preguntas reales'), '.'));
      }),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar el curso: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// ---------------------------------------------------------------------------
// #/<tit>/curso/<id>

export function leccionView({ ctx, progress, params: route, tit }) {
  const id = route.parts[1];
  const el = h('div.leccion', h('p.muted', 'Cargando la lección…'));
  let summaryText = `VISTA lección ${id} (cargando)`;

  Promise.all([loadCourse(tit), loadTheoryBank(tit), loadMnemonics()]).then(([curso, bank, mnemo]) => {
    const todas = curso ? leccionesDe(curso) : [];
    const idx = todas.findIndex((l) => l.id === id);
    const L = todas[idx];
    if (!L) { setChildren(el, crumbs(tit, ['Curso', tlink(tit, ['curso'])], 'No encontrada'), h('p', 'Esta lección no existe (todavía).')); return; }
    prepareTheory({ tit, chart: ctx.chart, reglas: bank.reglasDe });
    const next = todas[idx + 1];
    const prev = todas[idx - 1];
    const reglas = new Map(mnemo.reglas.map((r) => [r.id, r]));
    const preguntas = new Map(bank.preguntas.map((q) => [q.id, q]));
    const reg = () => progress.leccion(L.id) ?? {};

    // --- tarjetas
    let paso = 0;
    let todo = false;
    const stage = h('div.pasos');
    const dots = h('div.qnav');
    const nav = h('div.actions');

    function pasoEl(p) {
      switch (p.tipo) {
        case 'texto': return h('div.paso.texto', p.titulo ? h('h3', p.titulo) : null, rich(p.texto));
        case 'ilustracion': return h('div.paso.ilu', h('div.il-grid.inline', illustrationEls(p.spec)), p.texto ? h('p.muted', p.texto) : null);
        case 'regla': {
          const r = reglas.get(p.id);
          return r ? h('div.paso.regla', h('p.mnemo-big', `🧠 ${r.regla}`), h('p', r.significado)) : null;
        }
        case 'clave': return h('div.paso.clave', h('p', '💡 ', rich(p.texto)));
        case 'ojo': return h('div.paso.ojo', h('p', '⚠️ ', rich(p.texto)));
        case 'check': {
          const fb = h('div');
          const q = { id: `${L.id}-chk-${p.enunciado.length}`, enunciado: p.enunciado, opciones: p.opciones, correcta: p.correcta };
          let card = questionCard(q, { onChoose: (k) => {
            const nuevo = questionCard(q, { chosen: k, reveal: true, lock: true });
            card.replaceWith(nuevo);
            card = nuevo;
            setChildren(fb, h('p', { class: k === p.correcta ? 'ok' : 'warn' }, k === p.correcta ? '✅ ¡Bien!' : `❌ Era la ${p.correcta}).`), p.explicacion ? h('p', p.explicacion) : null);
          } });
          return h('div.paso.check', h('p.badge', '¿Lo pillas?'), card, fb);
        }
        default: return null;
      }
    }
    const speechOf = (p) => ({ texto: `${p.titulo ? `${p.titulo}. ` : ''}${plain(p.texto)}`, clave: plain(p.texto), ojo: `Ojo: ${plain(p.texto)}`, ilustracion: p.texto ?? '', regla: reglas.get(p.id) ? `Para recordarlo: ${reglas.get(p.id).regla}. ${reglas.get(p.id).significado}` : '', check: p.enunciado }[p.tipo] ?? '');

    function render() {
      if (todo) {
        setChildren(stage, L.pasos.map(pasoEl));
        setChildren(dots);
        setChildren(nav, h('button.secondary', { type: 'button', onclick: () => { todo = false; render(); } }, 'Ver tarjeta a tarjeta'));
        terminar();
        return;
      }
      const p = L.pasos[paso];
      setChildren(stage, pasoEl(p));
      setChildren(dots, L.pasos.map((_, i) => h('a.qdot', { href: `#paso${i + 1}`, class: i < paso ? 'done' : i === paso ? 'current' : '', onclick: (ev) => { ev.preventDefault(); voice.stop(); paso = i; render(); } }, String(i + 1))));
      const ultimo = paso === L.pasos.length - 1;
      setChildren(nav,
        h('button.secondary', { type: 'button', disabled: paso === 0, onclick: () => { voice.stop(); paso -= 1; render(); } }, '← Anterior'),
        voice.supported ? h('button.secondary', { type: 'button', onclick: () => voice.speak(speechOf(p)) }, '🔊 Escuchar') : null,
        h('button', { type: 'button', onclick: () => { voice.stop(); if (ultimo) { todo = true; render(); final.scrollIntoView({ behavior: 'smooth' }); } else { paso += 1; render(); } } }, ultimo ? 'Terminar la clase ✓' : 'Siguiente →'),
        h('button.small.secondary', { type: 'button', onclick: () => { todo = true; render(); } }, 'Ver todo'));
      summaryText = `LECCIÓN ${L.id} «${L.titulo}» · tarjeta ${paso + 1}/${L.pasos.length}: ${speechOf(p)}`;
    }

    // --- final: chuleta, práctica, carta y para profundizar
    const final = h('div.final');
    function terminar() {
      if (!reg().visto) progress.saveLeccion(L.id, { ...reg(), visto: true });
      const disponibles = (L.practica ?? []).map((q) => preguntas.get(q)).filter((q) => q && !q.anulada && q.correcta);
      setChildren(final,
        L.chuleta?.length ? h('section.chuleta', h('h2', '📌 Chuleta'), h('ul', L.chuleta.map((c) => h('li', inline(c)))),
          voice.supported ? h('button.small.secondary', { type: 'button', onclick: () => voice.speak(L.chuleta.map(plain).join('. ')) }, '🔊 Escuchar la chuleta') : null) : null,
        disponibles.length ? h('section', h('h2', '📝 Practica con preguntas reales'),
          h('p', `${disponibles.length} preguntas de exámenes oficiales sobre esta lección. Haz ${Math.min(PRACTICA_MAX, disponibles.length)}: si aciertas el ${Math.round(APROBADO * 100)} %, la lección queda dominada y volverá más adelante para que no se te olvide.`),
          h('button', { type: 'button', onclick: () => practicar(disponibles) }, '▶ Empezar la práctica')) : null,
        L.carta?.length ? h('section', h('h2', '🗺️ En la carta'), h('ul', L.carta.map((x) => getExercise(x) ? h('li', h('a', { href: link(['ej', x]) }, getExercise(x).title)) : null))) : null,
        L.profundizar?.length ? h('section', h('h2', '📚 Para profundizar'), h('ul', L.profundizar.map((r) => h('li', h('a', { href: r.url, target: '_blank', rel: 'noopener' }, r.titulo))))) : null,
        L.refresco?.length ? h('section', h('h2', '🔁 Repaso del PER'), h('ul', L.refresco.map((rid) => h('li', h('a', { href: tlink('per', ['curso', rid]) }, rid))))) : null,
        h('div.actions', prev ? h('a.btn.secondary', { href: tlink(tit, ['curso', prev.id]) }, `← ${prev.titulo}`) : null,
          next ? h('a.btn', { href: tlink(tit, ['curso', next.id]) }, `${next.titulo} →`) : h('a.btn', { href: tlink(tit, ['curso']) }, 'Volver al curso')),
      );
    }

    function practicar(disponibles) {
      const resp = progress.get().exams;
      // primero las no hechas, después las falladas, después el resto
      const orden = (q) => (!resp[q.id] ? 0 : !resp[q.id].ok ? 1 : 2);
      const rng = createRng(randomSeed());
      const ses = rng.shuffle(disponibles).sort((a, b) => orden(a) - orden(b)).slice(0, PRACTICA_MAX);
      let i = 0;
      let ok = 0;
      const box = h('div.practice');
      final.replaceChildren(h('h2', '📝 Práctica'), box);
      const show = () => {
        const q = ses[i];
        if (!q) {
          const acierto = ok / ses.length;
          progress.saveLeccion(L.id, trasPractica(reg(), acierto));
          setChildren(box, h('p', { class: acierto >= APROBADO ? 'ok' : 'warn' }, acierto >= APROBADO ? `🎉 ${ok}/${ses.length}: lección dominada. Volverá a salir dentro de unos días para afianzarla.` : `${ok}/${ses.length}: casi. Repasa las tarjetas y vuelve a intentarlo; la lección volverá mañana.`),
            h('div.actions', h('button.secondary', { type: 'button', onclick: () => { paso = 0; todo = false; render(); setChildren(final); window.scrollTo(0, 0); } }, 'Repasar las tarjetas'),
              next ? h('a.btn', { href: tlink(tit, ['curso', next.id]) }, `Siguiente: ${next.titulo} →`) : h('a.btn', { href: tlink(tit, ['curso']) }, 'Volver al curso')));
          summaryText = `LECCIÓN ${L.id} práctica terminada ${ok}/${ses.length}`;
          return;
        }
        const fb = h('div');
        const sig = h('button', { type: 'button', hidden: true, onclick: () => { voice.stop(); i += 1; show(); } }, i + 1 < ses.length ? 'Siguiente →' : 'Ver resultado');
        let card = questionCard(q, { number: i + 1, onChoose: (k) => {
          const good = k === q.correcta;
          if (good) ok += 1;
          progress.recordExam(q.id, { choice: k, ok: good });
          const nuevo = questionCard(q, { number: i + 1, chosen: k, reveal: true, lock: true });
          card.replaceWith(nuevo);
          card = nuevo;
          setChildren(fb, profePanel(q, explanationFor(q, bank.explicaciones), k));
          sig.hidden = false;
          summaryText = `LECCIÓN ${L.id} práctica · ${q.id}: marcó ${k}, correcta ${q.correcta} · llevas ${ok}/${i + 1}`;
        } });
        setChildren(box, h('p.badge', `${i + 1} de ${ses.length} · ${ok} ✓`), card, fb, h('div.actions', sig));
        summaryText = `LECCIÓN ${L.id} práctica · pregunta ${q.id} (sin responder: no des la respuesta)`;
      };
      show();
      box.scrollIntoView({ behavior: 'smooth' });
    }

    const e = estadoLeccion(L, reg(), progress.get().exams);
    setChildren(el,
      crumbs(tit, ['Curso', tlink(tit, ['curso'])], L.titulo),
      h('header', h('p.muted.small', `${L.modulo} · lección ${idx + 1} de ${todas.length} · ${L.minutos ?? 10} min`), h('h1', L.titulo),
        h('span.estado', { class: { dominada: 'ok', repasar: 'warn', empezada: 'close' }[e.estado] ?? '' }, ESTADO_TXT[e.estado])),
      L.objetivos?.length ? h('section.objetivos', h('h2', '🎯 Al acabar sabrás'), h('ul', L.objetivos.map((o) => h('li', o)))) : null,
      dots, stage, nav, final,
    );
    render();
  }).catch((err) => setChildren(el, h('p.warn', `No se pudo cargar la lección: ${err.message}`)));

  return { el, summary: () => summaryText };
}

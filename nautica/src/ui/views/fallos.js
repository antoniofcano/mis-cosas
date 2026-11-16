// #/<tit>/fallos — Tu cuaderno de fallos (R-55, R-56; docs/CARTA-MOVIL.md, función 2).
//   #/<tit>/fallos                    la lista: abiertos, vigilando y resueltos, con nombre, veces, de dónde y su botón
//   #/<tit>/fallos/dosis/<fallo>      la dosis de 2 minutos: micro-tarjetas con reloj (o, sin tarjetas, 2–3 preguntas
//                                     reales cuya trampa es ese error, o un ejercicio generado)
//   #/<tit>/fallos/comprobar/<fallo>  la comprobación: un problema completo del tipo, sin pistas
// La lógica: src/course/cuaderno.js (estados y calendario) y src/course/dosis.js (tarjetas y qué problema comprueba).
// Las preguntas reales salen solo de banco.practica (nunca reservadas para el examen final). Nunca durante un examen.

import { h, setChildren } from '../dom.js';
import { conIcono } from '../iconos.js';
import { tlink, volver, currentEje, TITULACIONES } from '../titulacion.js';
import { link } from '../router.js';
import { modoExamen } from '../modo-examen.js';
import { relojPaso } from '../reloj-paso.js';
import { cierre, cifrasCierre } from '../cierre.js';
import { diagnosticoEl } from '../diagnostico.js';
import { questionCard, prepareTheory, botonCarta } from './theory.js';
import { falloDe, registrarDosis, registrarComprobacion, cuadernoActual, fraseProxima } from '../cuaderno.js';
import { nombreFallo, origenesDe, lineaEstado, ORIGENES, ESTADOS, partesFallo } from '../../course/cuaderno.js';
import { dosisDe, corregirTarjeta, resumenDosis, tieneTarjetas, preguntasConTrampa, elegirComprobacion, ejercicioParaFallo, TARJETAS_DOSIS, OBJETIVO_DOSIS_S } from '../../course/dosis.js';
import { AVISOS } from '../../exams/avisos-pasos.js';
import { EXERCISES } from '../../exercises/registry.js';
import { cargarBanco, cargarDistractores, SOLUCIONES } from '../../bancos/index.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { mmssCorto } from '../../course/velocidad.js';
import { cuenta, fechaLarga } from '../../texto.js';

const tipoDe = (q) => SOLUCIONES[q.id]?.ejercicio ?? 'carta';
const enFrase = (t) => t.charAt(0).toLowerCase() + t.slice(1);

export function fallosView({ ctx, progress, params: route, tit }) {
  if (modoExamen()) return { el: h('div', h('h1', 'Tu cuaderno de fallos'), h('p', 'No está disponible durante un examen.')), summary: () => 'VISTA cuaderno de fallos: no disponible durante un examen' };
  const [, accion, id] = route.parts;
  if (accion === 'dosis' && id) return dosisView({ ctx, progress, tit, id, query: route.query });
  if (accion === 'comprobar' && id) return comprobarView({ ctx, progress, tit, id });
  return listaView({ progress, tit });
}

// ---------------------------------------------------------------------------
// La lista

function listaView({ progress, tit }) {
  const cu = cuadernoActual(progress);
  const ahora = Date.now();
  const tarjeta = (f) => {
    const n = nombreFallo(f);
    const ultima = f.ev.at(-1)?.t;
    const prox = f.comp?.prox && f.est !== 'resuelto' && f.pide !== 'comprobar' ? ` Comprobación: ${fraseProxima(f.comp.prox, ahora)}.` : '';
    const boton = f.pide === 'comprobar'
      ? h('a.btn', { href: tlink(tit, ['fallos', 'comprobar', f.id]) }, conIcono('diana', 'Comprobar'))
      : h('a.btn', { class: f.pide === 'dosis' ? '' : 'secondary', href: tlink(tit, ['fallos', 'dosis', f.id]) }, conIcono('reloj', 'Dosis de 2 minutos'));
    return h('li.fallo', { class: `est-${f.est}${f.pide ? ' pide' : ''}` },
      h('div.fallo-cab', h('h3.fallo-nombre', n.titulo), h('span.fallo-veces', cuenta(f.n, 'vez'))),
      h('p.fallo-donde.small.muted', n.donde),
      h('p.fallo-si', `Te pasa cuando ${n.si}.`),
      h('p.fallo-linea.small', `${lineaEstado(f, ahora)}${prox}`),
      h('p.fallo-de.small.muted', `De: ${origenesDe(f).join(', ')}${ultima ? ` · la última, ${fechaLarga(ultima, { ahora, diaSemana: false })}` : ''}.`),
      h('details.fallo-historia.small', h('summary', 'Historia'),
        h('ul', [...f.ev].reverse().map((v) => h('li', `${fechaLarga(v.t, { ahora, diaSemana: false })}: ${ORIGENES[v.o] ?? v.o}`)),
          f.dosis ? h('li', `Dosis: ${cuenta(f.dosis.n, 'vez', 'veces')}; la última, ${f.dosis.a} de ${f.dosis.de}${f.dosis.ok ? ' (superada)' : ''}.`) : null,
          (f.comp?.hist ?? []).map((c) => h('li', `Comprobación del ${fechaLarga(c.t, { ahora, diaSemana: false })}: ${c.ok ? 'bien' : 'mal'}`)))),
      h('div.fallo-acciones', boton));
  };
  const grupo = (titulo, lista, vacio) => h('section.fallos-grupo', h('h2', `${titulo} (${lista.length})`),
    lista.length ? h('ul.fallos-lista', lista.map(tarjeta)) : h('p.small.muted', vacio));
  const el = h('div.fallos',
    volver('Hoy', tlink(tit)),
    h('h1', 'Tu cuaderno de fallos'),
    h('p', 'Cada fallo tiene nombre: el paso exacto en el que te equivocas. Una dosis de 2 minutos lo entrena. Días después, un problema completo sin pistas comprueba que ya no caes.'),
    cu.vacio
      ? h('div.fallos-vacio',
        h('p', 'Aún no hay fallos con nombre. Aparecen cuando un paso del paso a paso, una opción que marcas o un ejercicio coinciden con un error típico: por ejemplo, sumar el adelanto en vez de restarlo.'),
        h('p', h('a.btn.secondary', { href: tlink(tit, ['carta-pasos']) }, 'Resolver problemas paso a paso')))
      : [
        grupo(ESTADOS.abierto + 's', cu.abiertos, 'Ninguno abierto.'),
        grupo('Vigilando', cu.vigilando, 'Ninguno en vigilancia.'),
        grupo(ESTADOS.resuelto + 's', cu.resueltos, 'Todavía ninguno resuelto: hacen falta dos comprobaciones seguidas bien.'),
      ],
    h('p.small.muted', 'Se guarda con tu progreso y viaja a tus otros aparatos.'));
  const summary = () => `VISTA cuaderno de fallos ${TITULACIONES[tit].sigla}: ${cu.lista.map((f) => `${f.id} ${f.est} ×${f.n}${f.pide ? ` (pide ${f.pide})` : ''}`).join(', ') || 'vacío'}`;
  return { el, summary };
}

// ---------------------------------------------------------------------------
// La dosis

function sinFallo(tit) {
  return { el: h('div', volver('Tu cuaderno de fallos', tlink(tit, ['fallos'])), h('h1', 'Tu cuaderno de fallos'), h('p', 'Ese fallo no está en tu cuaderno.')), summary: () => 'VISTA cuaderno de fallos: fallo desconocido' };
}

function dosisView({ ctx, progress, tit, id, query }) {
  const f = falloDe(id, progress);
  if (!f) return sinFallo(tit);
  const n = nombreFallo(f);
  const A = AVISOS[f.e];
  const seed = Number(query?.s) || randomSeed();
  const cuerpo = h('div.dosis-cuerpo');
  let summaryText = `DOSIS ${id} (${n.titulo})`;
  const el = h('div.dosis',
    volver('Tu cuaderno de fallos', tlink(tit, ['fallos'])),
    h('h1', `Dosis: ${n.titulo}`),
    h('p.muted.small', n.donde),
    h('details.dosis-no', h('summary', 'No olvides'), h('p', A.no)),
    cuerpo);
  if (tieneTarjetas(f.e)) tarjetas();
  else sinTarjetas();
  return { el, summary: () => summaryText };

  function tarjetas() {
    const ts = dosisDe(f.e, createRng(seed));
    const rp = relojPaso({ compacto: true, vivo: () => el.isConnected, objetivo: { s: OBJETIVO_DOSIS_S, texto: `Objetivo: ${mmssCorto(OBJETIVO_DOSIS_S)} para ${cuenta(TARJETAS_DOSIS, 'tarjeta')}. La soltura también se entrena.` } });
    const resp = [];
    const hueco = h('div.dosis-tarjeta-hueco');
    setChildren(cuerpo, h('p.small', `${cuenta(TARJETAS_DOSIS, 'tarjeta')} sobre este paso, con números distintos. Toca la respuesta o escríbela.`), rp.el, hueco);
    let i = 0;
    pinta();

    function pinta() {
      const t = ts[i];
      summaryText = `DOSIS ${id}: tarjeta ${i + 1}/${ts.length} · ${t.enunciado} (no des la respuesta)`;
      const fb = h('div.dosis-fb', { 'aria-live': 'polite' });
      const titulo = h('p.dosis-enunciado', { tabindex: '-1' }, t.enunciado);
      let respondida = false;
      const responder = (r, eleccion) => {
        if (respondida) return;
        respondida = true;
        resp.push(r);
        rp.marcaPaso(r.ok);
        const aviso = AVISOS[r.error ?? f.e];
        setChildren(fb,
          r.ok ? h('p.ok', conIcono('ok', `Bien: ${t.correcta}.`)) : h('p.warn', conIcono('no', `${eleccion ? `${eleccion} no. ` : ''}Era ${t.correcta}.`)),
          !r.ok && r.error ? h('p.dosis-has', h('strong', `${AVISOS[r.error].has}.`)) : null,
          !r.ok ? h('p.dosis-regla', h('strong', 'No olvides: '), aviso.no) : null,
          h('p.small.muted.dosis-cuenta', t.cuenta),
          h('div.actions', h('button.grande', { type: 'button', onclick: () => { i += 1; if (i < ts.length) pinta(); else fin(); } }, i + 1 < ts.length ? 'Siguiente' : 'Terminar')));
        requestAnimationFrame?.(() => fb.querySelector('button')?.focus());
      };
      let control;
      if (t.modo === 'teclear') {
        const input = h('input.dosis-input', { id: `dosis-in-${i}`, autocomplete: 'off', inputmode: t.kind === 'clock' ? 'numeric' : 'text', placeholder: t.kind === 'clock' ? 'hh:mm' : '000' });
        const avisoFmt = h('p.small.warn', { 'aria-live': 'polite' });
        control = h('form.dosis-teclear', { onsubmit: (ev) => {
          ev.preventDefault();
          if (respondida) return;
          const r = corregirTarjeta(t, input.value);
          if (r.ilegible) { avisoFmt.textContent = t.kind === 'clock' ? 'Escribe la hora como 14:35.' : 'Escribe el rumbo como 045.'; return; }
          input.disabled = true;
          input.dataset.status = r.ok ? 'ok' : 'wrong';
          responder(r, input.value);
        } }, h('label.field', { for: input.id }, h('span.lbl', t.pide), input), avisoFmt, h('div.actions', h('button', { type: 'submit' }, 'Comprobar')));
        requestAnimationFrame?.(() => input.focus());
      } else {
        const botones = t.opciones.map((o, k) => h('button.dosis-op', { type: 'button', onclick: () => {
          if (respondida) return;
          for (const b of botones) b.disabled = true;
          botones[t.opciones.findIndex((x) => x.ok)].classList.add('correcta');
          if (!o.ok) botones[k].classList.add('elegida-mal');
          responder(corregirTarjeta(t, k), null);
        } }, o.txt));
        control = h('div.dosis-ops', { role: 'group', 'aria-label': t.pide }, botones);
      }
      setChildren(hueco, h('article.dosis-tarjeta',
        h('p.dosis-num.small.muted', `Tarjeta ${i + 1} de ${ts.length} · ${t.pide}`),
        titulo, control, fb));
      if (i > 0) requestAnimationFrame?.(() => titulo.focus());
    }

    function fin() {
      const s = rp.parar();
      const r = resumenDosis(resp, f.e);
      cerrar(r, s);
    }
  }

  /** Sin micro-tarjetas: 2–3 preguntas reales cuya trampa es este error; si no hay, un ejercicio generado. */
  function sinTarjetas() {
    setChildren(cuerpo, h('p.muted', 'Preparando la dosis…'));
    const eje = currentEje(progress);
    Promise.all([cargarBanco(eje, tit), cargarDistractores(eje, tit)]).then(([banco, indice]) => {
      const qs = preguntasConTrampa({ error: f.e, tipo: f.y, indice, practica: banco.practica, respuestas: progress.get().exams, tipoDe, rng: createRng(seed) }).slice(0, 3);
      if (qs.length >= 2) return preguntas(qs);
      const ej = ejercicioParaFallo(f.e, f.y, EXERCISES);
      if (ej) {
        summaryText = `DOSIS ${id}: un ejercicio generado (${ej})`;
        return setChildren(cuerpo, h('p', 'Para este fallo, la dosis es un ejercicio con números nuevos. Fíjate en el paso que fallas.'),
          h('p.dosis-regla', h('strong', 'Así se hace: '), A.asi),
          h('div.botones-columna', h('a.btn.grande', { href: link(['ej', ej], { s: String(randomSeed()), dosis: id }) }, conIcono('lapiz', 'Empezar el ejercicio'))));
      }
      summaryText = `DOSIS ${id}: sin dosis en la app`;
      return setChildren(cuerpo, h('p', 'Todavía no tengo una dosis para este fallo. Repasa la regla y practícalo en papel.'), h('p.dosis-regla', h('strong', 'Así se hace: '), A.asi));
    }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la dosis: ${e.message}`)));
  }

  function preguntas(qs) {
    prepareTheory({ tit, chart: ctx.chart });
    const resp = [];
    let i = 0;
    const rp = relojPaso({ compacto: true, vivo: () => el.isConnected, objetivo: { s: 3 * OBJETIVO_DOSIS_S, texto: 'Objetivo orientativo: 2 minutos por pregunta.' } });
    const hueco = h('div');
    setChildren(cuerpo, h('p.small', `${cuenta(qs.length, 'pregunta')} de examen cuyas opciones falsas incluyen este error.`), rp.el, hueco);
    pinta();
    function pinta() {
      const q = qs[i];
      summaryText = `DOSIS ${id}: pregunta ${i + 1}/${qs.length} (${q.id}; no des la respuesta)`;
      let elegida = null;
      const fb = h('div', { 'aria-live': 'polite' });
      const card = questionCard(q, { onChoose: (k) => { elegida = k; } });
      setChildren(hueco, h('p.dosis-num.small.muted', `Pregunta ${i + 1} de ${qs.length}`), card, botonCarta(q, progress, null),
        h('div.actions', h('button', { type: 'button', onclick: (ev) => {
          if (!elegida) { fb.textContent = 'Elige una opción.'; return; }
          ev.currentTarget.disabled = true;
          const ok = q.anulada || elegida === q.correcta || (q.aceptadas ?? []).includes(elegida);
          progress.recordExam(q.id, { choice: elegida, ok });
          rp.marcaPaso(ok);
          resp.push({ ok, error: ok ? null : f.e });
          setChildren(fb, ok ? h('p.ok', conIcono('ok', 'Bien.')) : h('p.warn', conIcono('no', `No: era la ${q.correcta}).`)),
            ok ? null : diagnosticoEl(q, elegida, { chart: ctx.chart, origen: 'pregunta' }),
            ok ? null : h('p.dosis-regla', h('strong', 'No olvides: '), A.no),
            h('div.actions', h('button.grande', { type: 'button', onclick: () => { i += 1; if (i < qs.length) pinta(); else cerrar(resumenDosis(resp, f.e), rp.parar()); } }, i + 1 < qs.length ? 'Siguiente' : 'Terminar')));
        } }, 'Comprobar')), fb);
    }
  }

  function cerrar(r, s) {
    const g = registrarDosis(id, r, progress);
    progress.logActividad(Math.max(1, Math.round(s / 60)));
    const superada = !!g?.dosis?.ok;
    const prox = g?.comp?.prox ? fraseProxima(g.comp.prox) : null;
    const lineas = [
      superada ? `Dosis superada en ${mmssCorto(s)}.` : `Para superarla hacen falta ${Math.ceil(r.total * 0.8)} de ${r.total}. Son 2 minutos: repítela.`,
      r.cayo ? `Has caído ${cuenta(r.cayo, 'vez')} en «${enFrase(n.titulo)}».` : null,
      superada && prox && g.est !== 'resuelto' ? `Comprobación: ${prox}. Un problema completo, sin pistas.` : null,
    ].filter(Boolean);
    summaryText = `DOSIS ${id} TERMINADA: ${r.aciertos}/${r.total} en ${mmssCorto(s)}${superada ? ` · superada · comprobación ${g?.comp?.prox ?? '—'}` : ' · repetir'}`;
    const otra = h('a.btn.grande', { class: superada ? 'secondary' : '', href: tlink(tit, ['fallos', 'dosis', id], { s: String(randomSeed()) }) }, superada ? 'Otra dosis' : 'Repetir la dosis');
    const cuaderno = h('a.btn.grande', { class: superada ? '' : 'secondary', href: tlink(tit, ['fallos']) }, 'Tu cuaderno de fallos');
    setChildren(el, cierre({ icono: superada ? 'hecho' : 'flojo', titulo: `${r.aciertos} de ${r.total}`, lineas, tit, stats: cifrasCierre(progress, `${r.aciertos} de ${r.total}`),
      botones: superada ? [cuaderno, otra] : [otra, cuaderno] }));
    window.scrollTo?.(0, 0);
  }
}

// ---------------------------------------------------------------------------
// La comprobación

function comprobarView({ ctx, progress, tit, id }) {
  const f = falloDe(id, progress);
  if (!f) return sinFallo(tit);
  const n = nombreFallo(f);
  const cuerpo = h('div.comprobar-cuerpo', h('p.muted', 'Buscando un problema…'));
  let summaryText = `COMPROBACIÓN ${id} (${n.titulo}) cargando`;
  const el = h('div.comprobar',
    volver('Tu cuaderno de fallos', tlink(tit, ['fallos'])),
    h('h1', `Comprobar: ${n.titulo}`),
    h('p', 'Un problema completo, sin pistas, como en el examen. Si no caes en el error, el fallo pasa a «vigilando»; con dos seguidas bien, queda resuelto.'),
    cuerpo);
  const eje = currentEje(progress);
  const { error, tipo } = partesFallo(id);
  const usadas = new Set([...(f.comp?.hist ?? []), ...f.ev].map((x) => x.q).filter(Boolean));
  Promise.all([cargarBanco(eje, tit), cargarDistractores(eje, tit)]).then(([banco, indice]) => {
    const c = elegirComprobacion({ error, tipo, indice, practica: banco.practica, respuestas: progress.get().exams, usadas, tipoDe, ejercicios: EXERCISES, rng: createRng(randomSeed()) });
    if (!c) return aMano();
    if (c.modo === 'ejercicio') {
      summaryText = `COMPROBACIÓN ${id}: ejercicio generado ${c.id} (sin pistas)`;
      return setChildren(cuerpo, h('p', 'Un ejercicio con números nuevos. Resuélvelo entero; las pistas y la solución salen al corregir.'),
        h('div.botones-columna', h('a.btn.grande', { href: link(['ej', c.id], { s: String(c.seed), comprobar: id }) }, conIcono('diana', 'Empezar la comprobación'))));
    }
    return pregunta(c.q);
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la comprobación: ${e.message}`)));
  return { el, summary: () => summaryText };

  function pregunta(q) {
    prepareTheory({ tit, chart: ctx.chart });
    summaryText = `COMPROBACIÓN ${id}: pregunta ${q.id} (sin pistas; no des la respuesta)`;
    let elegida = null;
    const fb = h('div', { 'aria-live': 'polite' });
    const card = questionCard(q, { onChoose: (k) => { elegida = k; } });
    const boton = h('button.grande', { type: 'button', onclick: () => {
      if (!elegida) { fb.textContent = 'Elige una opción.'; return; }
      boton.disabled = true;
      const ok = q.anulada || elegida === q.correcta || (q.aceptadas ?? []).includes(elegida);
      progress.recordExam(q.id, { choice: elegida, ok });
      const g = registrarComprobacion(id, { ok, q: q.id }, progress);
      const diag = ok ? null : diagnosticoEl(q, elegida, { chart: ctx.chart, origen: 'comprobacion' });
      fin(ok, g, q, elegida, diag);
    } }, 'Comprobar');
    setChildren(cuerpo, card, botonCarta(q, progress, null), h('div.actions', boton), fb);
  }

  function fin(ok, g, q = null, elegida = null, diag = null) {
    const prox = g?.comp?.prox ? fraseProxima(g.comp.prox) : null;
    const lineas = ok
      ? [g?.est === 'resuelto' ? `«${n.titulo}»: resuelto. Dos comprobaciones seguidas bien.` : `«${n.titulo}»: bien. Lo vigilo.${prox ? ` Siguiente comprobación: ${prox}.` : ''}`]
      : [q ? `No: era la ${q.correcta}).` : 'No ha salido.', `«${n.titulo}» vuelve a estar abierto: primero, una dosis de 2 minutos.`];
    summaryText = `COMPROBACIÓN ${id} TERMINADA: ${ok ? 'bien' : 'mal'} · estado ${g?.est ?? '—'}${prox ? ` · siguiente ${g.comp.prox}` : ''}`;
    const botones = ok
      ? [h('a.btn.grande', { href: tlink(tit, ['fallos']) }, 'Tu cuaderno de fallos')]
      : [h('a.btn.grande', { href: tlink(tit, ['fallos', 'dosis', id]) }, 'Dosis de 2 minutos'),
        q ? h('a.btn.grande.secondary', { href: link(['q', q.id], { guiado: '1' }) }, 'Resolverla paso a paso') : null,
        h('a.btn.grande.secondary', { href: tlink(tit, ['fallos']) }, 'Tu cuaderno de fallos')].filter(Boolean);
    setChildren(el, volver('Tu cuaderno de fallos', tlink(tit, ['fallos'])),
      cierre({ icono: ok ? 'hecho' : 'flojo', titulo: ok ? (g?.est === 'resuelto' ? 'Resuelto' : 'Bien') : 'Todavía no', lineas, tit, stats: cifrasCierre(progress), botones }),
      q ? h('details.comprobar-revisar', { open: !ok }, h('summary', 'La pregunta'), questionCard(q, { chosen: elegida, reveal: true, lock: true }), diag) : null);
    window.scrollTo?.(0, 0);
  }

  /** Sin problema en la app: se hace en papel y el alumno dice cómo le fue. */
  function aMano() {
    summaryText = `COMPROBACIÓN ${id}: sin problema en la app (en papel)`;
    setChildren(cuerpo,
      h('p', `No tengo en la app un problema para comprobar «${enFrase(n.titulo)}». Haz uno en papel, sin mirar la solución, y dime cómo te fue.`),
      h('div.botones-columna',
        h('button.grande', { type: 'button', onclick: () => fin(true, registrarComprobacion(id, { ok: true }, progress)) }, conIcono('ok', 'Me salió bien')),
        h('button.grande.secondary', { type: 'button', onclick: () => fin(false, registrarComprobacion(id, { ok: false }, progress)) }, 'Caí otra vez')));
  }
}


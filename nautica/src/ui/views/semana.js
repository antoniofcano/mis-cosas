// #/<tit>/semana — «la semana antes» (R-33): el plan de los días que quedan hasta el examen (qué toca cada día, cuánto
// dura, qué está hecho), tus ideas más flojas con su ficha y los accesos a simulacro, tarjetas y chuletas. Sin el modo
// activo explica qué es y deja activarlo a mano (cuántos días quedan). La lógica, en src/course/semana.js.
// #/<tit>/semana/ideas/<n>?c=<ideas>&s=<semilla> — una tanda de preguntas de esas ideas (paso «Tus ideas flojas» de un
// día del plan): solo preguntas que se practican, nunca reservadas para el examen final.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, currentEje, volver } from '../titulacion.js';
import { cargarBanco } from '../../bancos/index.js';
import { bloquesEnOrden } from '../../theory/blocks.js';
import { calcularPlan, hrefActividad } from '../cierre.js';
import { conceptosDelBanco, hrefFicha } from '../concepto.js';
import { leerSesion } from '../sesion.js';
import { terminada } from '../../course/sesion.js';
import { empezarSesion } from '../entrada.js';
import { barraActividad } from '../actividad.js';
import { crearAyudas } from '../ayudas.js';
import { pintarCierre } from '../cierre.js';
import { tandaPreguntas, prepareTheory, cierreTanda } from './theory.js';
import { icono, conIcono } from '../iconos.js';
import { hayRuta } from '../rutas.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { cuenta, diaISO, fechaLarga } from '../../texto.js';
import { sumaDiasISO } from '../../course/calendario.js';
import { ideasFlojas, tandaDeIdeas, rotuloSemana, lineaFaltan, resumenPlan, DIAS_MODO, recordatorioEnsayos } from '../../course/semana.js';
import { ENSAYOS_RECOMENDADOS } from '../../theory/ensayo.js';
import { calcularSemana, apuntarSemana, botonSalir, botonVolver, activarAMano, tarjetaComoFue } from '../semana.js';

export function semanaView(o) {
  return o.params.parts[1] === 'ideas' ? ideasView(o) : planSemanaView(o);
}

/** Nombre corto de un día del plan: «Hoy», «Mañana», «Víspera», «Examen» o la fecha. */
function nombreDia(x, ahora) {
  if (x.k === 0) return 'Día del examen';
  if (x.hoy) return 'Hoy';
  return fechaLarga(x.fecha, { ahora });
}

/** Pasos de un día, en una lista corta. */
const listaPasos = (pasos) => (pasos.length ? h('ul.semana-pasos', pasos.map((p) => h('li', h('span.semana-paso-tx', h('strong', p.titulo), h('span.muted.small', p.sub)),
  h('span.semana-min', { 'aria-label': cuenta(p.minutos, 'minuto') }, `${p.minutos}′`)))) : null);

/** Accesos de la semana: simulacro, tarjetas, chuletas y, si existe en esta versión, la estrategia de examen. */
function accesos(tit) {
  const T = TITULACIONES[tit];
  const fila = (href, ico, titulo, texto) => h('li', h('a.mas-fila', { href }, h('span.mas-fila-ico', icono(ico)), h('span.mas-fila-tx', h('strong', titulo), h('span.muted.small', texto)), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')));
  return h('section.semana-accesos', { 'aria-labelledby': 'semana-accesos-t' },
    h('h2.eti#semana-accesos-t', 'A mano esta semana'),
    h('ul.mas-lista',
      fila(tlink(tit, ['examenes']), 'examen', 'Simulacro', T.estructura.modulos ? 'Completo o por módulos, con las reglas reales.' : 'Un examen completo con las reglas reales.'),
      fila(tlink(tit, ['tarjetas']), 'tarjetas', 'Tarjetas de memoria', 'Lo que solo se aprende repitiendo.'),
      // Punto de extensión: la página «Estrategia de examen» se enlaza solo si su ruta existe (src/ui/rutas.js).
      hayRuta('estrategia') ? fila(tlink(tit, ['estrategia']), 'diana', 'Estrategia de examen', 'Cómo repartir el tiempo y qué hacer con las dudas.') : null),
    h('details.mas-chuletas', h('summary', conIcono('chincheta', 'Chuletas de cada tema')),
      h('ul.mas-lista.compacta', bloquesEnOrden(T.estructura).map((b) => h('li', h('a.mas-fila', { href: tlink(tit, ['temario', String(b.ut), 'chuleta']) },
        h('span.mas-fila-ico', icono(b.ico)), h('span.mas-fila-tx', h('strong', b.titulo), b.maxErrores != null ? h('span.muted.small', `Con límite: ${cuenta(b.maxErrores, 'fallo')} como mucho`) : null),
        h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')))))));
}

/** Tus ideas más flojas (5 a 10), con su ficha; sin etiquetas, los temas que más pesan y más fallas. */
function seccionFlojas(tit, sem) {
  const xs = ideasFlojas(sem.ideas);
  if (sem.ideas.length) {
    return h('section.semana-flojas', { 'aria-labelledby': 'semana-flojas-t' },
      h('h2.eti#semana-flojas-t', 'Tus ideas más flojas'),
      xs.length ? h('p.muted.small', 'Ordenadas por lo que más pesan en tu examen y más se preguntan en tu tribunal.') : h('p', 'No tienes ideas flojas ahora mismo. Bien hecho: sigue con el plan.'),
      xs.length ? h('ol.semana-ideas', xs.map((i) => h('li',
        h('a.semana-idea', { href: hrefFicha(tit, i.id, 'semana') }, h('span.semana-idea-nombre', i.etiqueta),
          h('span.muted.small', `${i.tema}${i.conLimite ? ' · tema con límite de fallos' : ''}${i.estado === 'sin-ver' ? ' · aún sin ver' : ''}`)),
      ))) : null);
  }
  const temas = sem.temas.slice(0, 5);
  return h('section.semana-flojas', { 'aria-labelledby': 'semana-flojas-t' },
    h('h2.eti#semana-flojas-t', 'Tus temas más flojos'),
    h('ol.semana-ideas', temas.map((t) => h('li', h('a.semana-idea', { href: tlink(tit, ['temario', String(t.ut)]) }, h('span.semana-idea-nombre', t.titulo),
      h('span.muted.small', `Aciertas el ${Math.round(t.tasa * 100)} %${t.conLimite ? ' · tema con límite de fallos' : ''}`))))));
}

/** Ensayo general en papel (R-41): cuántos llevas de los recomendados y, si aún toca, el enlace para prepararlo. */
function seccionEnsayos(tit, tests, dias) {
  const r = recordatorioEnsayos(tests, { dias, recomendados: ENSAYOS_RECOMENDADOS });
  return h('section.semana-ensayos', { 'aria-labelledby': 'semana-ensayos-t' },
    h('h2.eti#semana-ensayos-t', 'Ensayo general en papel'),
    h('p', r.texto),
    r.proponer ? h('a.btn.secondary', { href: tlink(tit, ['ensayo']) }, conIcono('lapiz', 'Preparar un ensayo en papel')) : null);
}

function planSemanaView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const cuerpo = h('div.semana-cuerpo', h('p.muted', 'Preparando tu semana…'));
  const el = h('div.semana-pantalla', volver('Hoy', tlink(tit)), cuerpo);
  let summaryText = `VISTA semana ${T.sigla} (cargando)`;
  calcularPlan(progress, tit).then((d) => {
    apuntarSemana(progress, tit);
    const ahora = Date.now();
    const sem = calcularSemana(progress, tit, d, ahora);
    const { estado, plan } = sem;
    if (!estado.activo) {
      const dExamen = estado.diasExamen;
      const lejos = dExamen != null && dExamen > DIAS_MODO;
      setChildren(cuerpo,
        h('header.semana-cab', h('p.semana-eti', `${T.sigla} · la semana antes`), h('h1', 'La semana antes del examen')),
        estado.preguntar ? tarjetaComoFue(progress, tit, estado.preguntar) : null,
        h('section.semana-intro',
          h('p', 'Un repaso comprimido para los últimos días: lo que más cae en tu examen y las ideas que más te cuestan, repartido día a día hasta la fecha. A mitad, un simulacro; el penúltimo día, un repaso ligero; y la víspera, nada nuevo.'),
          estado.salido ? h('p', 'Saliste del modo para este examen. ', botonVolver(progress, tit)) : null,
          lejos ? h('p', `Tu examen es dentro de ${cuenta(dExamen, 'día')}: el modo empieza solo cuando falten ${DIAS_MODO}. Si prefieres empezar ya, elige cuándo es.`)
            : dExamen == null || d.st.orientativa ? h('p', 'No tienes puesta la fecha del examen (o es orientativa). Elige cuántos días quedan o ', h('a', { href: '#/ajustes?campo=fecha' }, 'pon la fecha en Ajustes'), '.') : null,
          estado.salido ? null : activarAMano(progress, tit)),
        seccionFlojas(tit, sem),
        seccionEnsayos(tit, d.st.datos.tests, dExamen ?? DIAS_MODO),
        accesos(tit));
      summaryText = `VISTA semana ${T.sigla}: modo inactivo${estado.salido ? ' (salido)' : ''}${dExamen != null ? ` · examen en ${cuenta(dExamen, 'día')}` : ' · sin fecha'}${estado.preguntar ? ` · PREGUNTA cómo fue (${estado.preguntar.fecha})` : ''}`;
      return;
    }
    const hoyDia = plan.dias[0];
    const guardada = leerSesion(progress, tit);
    const deSemana = guardada?.semana ? guardada : null;
    let accion = null;
    if (hoyDia.tipo === 'examen') accion = null;
    else if (deSemana && !terminada(deSemana)) accion = h('a.boton-sesion', { href: tlink(tit, ['sesion']) }, 'Seguir');
    else if (deSemana?.estado === 'hecha' || hoyDia.hecho) accion = h('p.semana-hecho', icono('ok', 'ico-t'), 'Lo de hoy está hecho. Descansa.');
    else if (sem.comp) accion = h('button.boton-sesion', { type: 'button', onclick: () => empezarSesion(progress, tit, d, sem.comp) }, 'Empezar lo de hoy');
    const inicio = sumaDiasISO(estado.fecha, -DIAS_MODO);
    const hechos = Object.keys(sem.ajuste.hechos).filter((f) => f >= inicio && f <= diaISO(ahora)).length;
    setChildren(cuerpo,
      h('header.semana-cab',
        h('p.semana-eti', rotuloSemana(estado.dias)),
        h('h1', 'La semana antes del examen'),
        h('p.semana-fecha', `Examen: ${fechaLarga(estado.fecha, { ahora })}${estado.modo === 'manual' ? ' (la elegiste tú)' : ''}. ${lineaFaltan(estado.dias)}.`)),
      h('section.semana-hoy', { 'aria-labelledby': 'semana-hoy-t' },
        h('p.semana-eti', hoyDia.tipo === 'examen' ? 'Hoy' : `Hoy · ${cuenta(hoyDia.minutos, 'minuto')}`),
        h('h2#semana-hoy-t', hoyDia.titulo),
        h('p', hoyDia.texto),
        listaPasos(hoyDia.pasos),
        accion),
      plan.dias.length > 1 ? h('section.semana-dias', { 'aria-labelledby': 'semana-dias-t' },
        h('h2.eti#semana-dias-t', 'Los días que quedan'),
        h('ol.semana-lista', plan.dias.slice(1).map((x) => h('li.semana-dia', { class: `tipo-${x.tipo}${x.hecho ? ' hecho' : ''}` },
          h('div.semana-dia-cab', h('span.semana-dia-nombre', nombreDia(x, ahora)), x.minutos ? h('span.semana-min', `${x.minutos}′`) : null,
            x.hecho ? h('span.semana-dia-hecho', icono('ok', 'ico-t'), 'Hecho') : null),
          h('strong.semana-dia-titulo', x.titulo),
          x.pasos.length ? h('span.muted.small', x.pasos.map((p) => p.titulo).join(' · ')) : h('span.muted.small', x.k === 0 ? 'Sin tarea: solo el examen.' : '')))),
        h('p.muted.small', 'Si un día no puedes, no pasa nada: el plan se rehace con los días que quedan.')) : null,
      seccionFlojas(tit, sem),
      seccionEnsayos(tit, d.st.datos.tests, estado.dias),
      accesos(tit),
      h('p.semana-salir-fila', botonSalir(progress, tit, estado)));
    summaryText = `VISTA semana ${T.sigla}: ${rotuloSemana(estado.dias)} · examen ${estado.fecha} (${estado.modo}) · ${cuenta(hechos, 'día hecho', 'días hechos')}\n` +
      `HOY: ${hoyDia.titulo} — ${hoyDia.pasos.map((p) => `${p.titulo}: ${p.sub} (${p.minutos} min) → ${hrefActividad(tit, p)}`).join(' · ') || 'sin tarea'}\nPLAN:\n${resumenPlan(plan)}\n` +
      `IDEAS FLOJAS: ${ideasFlojas(sem.ideas).map((i) => `${i.etiqueta} (${i.tema}) → #/${tit}/idea/${i.id}`).join(' · ') || '—'}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar la semana: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// --- la tanda de ideas ---------------------------------------------------------------------------------------------

function ideasView({ ctx, progress, params: route, tit }) {
  const seed = Number(route.query.s) || randomSeed();
  const ids = String(route.query.c ?? '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 8);
  const ayudas = crearAyudas({ modo: 'mezcla', tit });
  const barra = barraActividad({ texto: 'Preparando…', onSalir: () => { location.hash = tlink(tit); }, derecha: ayudas.barra });
  const cont = h('div', h('p.muted', 'Cargando…'));
  const el = h('div.practice', barra, ayudas.panel, cont);
  let summaryText = 'VISTA tanda de ideas flojas (cargando)';
  const eje = currentEje(progress);
  Promise.all([cargarBanco(eje, tit), conceptosDelBanco(eje, tit)]).then(([banco, ic]) => {
    prepareTheory({ tit, chart: ctx?.chart, reglas: banco.reglasDe });
    const validas = ic ? ids.filter((id) => ic.concepto(id)) : [];
    const preguntas = tandaDeIdeas({ ic, ideas: validas, respuestas: progress.get().exams, rng: createRng(seed), hoy: diaISO(),
      enPractica: new Set(banco.practica.map((q) => q.id)), reservadas: banco.reservadas });
    if (!preguntas.length) {
      barra.set('Tus ideas flojas', 0);
      setChildren(cont, h('p.vacio', 'No hay preguntas para estas ideas.'), h('a.btn.grande', { href: tlink(tit, ['semana']) }, 'Volver a la semana'));
      summaryText = 'VISTA tanda de ideas flojas: sin preguntas';
      return;
    }
    const nombres = validas.map((id) => ic.concepto(id)?.etiqueta).filter(Boolean);
    setChildren(cont, tandaPreguntas({
      preguntas, explicaciones: banco.explicaciones, progress, barra, vocab: banco.vocab, ayudas, temaEnCadaPregunta: true,
      rotulo: conIcono('diana', `Tus ideas flojas · ${cuenta(nombres.length, 'idea')}`),
      onSummary: (t) => { summaryText = `VISTA tanda de ideas flojas (${nombres.join(' · ')})\n${t}`; },
      onFin: (ok, n, min) => {
        progress.logActividad(min);
        barra.remove();
        pintarCierre(cont, progress, tit, cierreTanda(ok, n));
        summaryText = `VISTA tanda de ideas flojas terminada: ${ok} de ${cuenta(n, 'acierto')}`;
        window.scrollTo(0, 0);
      },
    }));
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudieron cargar las preguntas: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// Ensayo general en papel (R-41):
//   #/<tit>/ensayo[?p=<parte>&s=<semilla>]              preparación: qué parte, qué tiene que haber en la mesa (lo que
//                                                        pide el tribunal, de data/comun/estrategia.json y la ficha del
//                                                        eje), el aviso de la carta de papel y empezar o imprimir
//   #/<tit>/ensayo/cuadernillo?p=<parte>&s=<semilla>    el cuadernillo imprimible: enunciados numerados y hoja de
//                                                        respuestas en blanco (patrón de impresión de las chuletas)
// El ensayo en marcha es una dirección de examen (#/<tit>/test/ensayo?p=…&s=…: src/ui/views/theory.js y src/ui/ensayo.js).
// La lógica, sin DOM, en src/theory/ensayo.js.

import { h, setChildren } from '../dom.js';
import { navigate } from '../router.js';
import { TITULACIONES, tlink, currentEje, volver } from '../titulacion.js';
import { cargarBanco } from '../../bancos/index.js';
import { loadEstrategia } from '../../store/datasets.js';
import { cifrasExamen, textosEstrategia } from '../../course/estrategia.js';
import { partesEnsayo, parteValida, estructuraEnsayo, buildEnsayo, cuentaEnsayos, ENSAYOS_RECOMENDADOS } from '../../theory/ensayo.js';
import { totalPreguntas } from '../../theory/blocks.js';
import { nuevasDe } from '../../theory/engine.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { icono, conIcono } from '../iconos.js';
import { cuenta } from '../../texto.js';
import { fechaImpresion } from './chuleta.js';
import { cuadernillo, hojaEnBlanco } from '../ensayo.js';

const deTitEje = (x, tit, eje) => (x?.tit ?? 'per') === tit && x?.eje === eje;

/** Dirección del ensayo en marcha. */
export const rutaEnsayo = (tit, parte, seed) => tlink(tit, ['test', 'ensayo'], { p: parte, s: String(seed) });

export function ensayoView(o) {
  return o.params.parts[1] === 'cuadernillo' ? cuadernilloView(o) : preparacionView(o);
}

/** Una línea de la lista de la mesa: «Norma» (con su fuente) o «Para el ensayo» (consejo). */
function lineaMesa(x, i) {
  const f = x.fuente;
  return h('li.ensayo-mesa-item', { 'data-tipo': x.tipo },
    h('label.check', h('input', { type: 'checkbox', id: `mesa-${i}` }),
      h('span.ensayo-mesa-tx',
        h('span.est-eti', x.tipo === 'norma' ? 'Norma' : 'Para el ensayo'), ' ', x.texto,
        f ? h('span.est-fuente', 'Fuente: ', f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.corto ?? f.titulo) : (f.corto ?? f.titulo), f.ref ? `, ${f.ref}` : '', '.') : null)));
}

function preparacionView({ progress, params: route, tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.ensayo-prep.inicio-examen', h('p.muted', 'Preparando el ensayo…'));
  let summaryText = `VISTA preparación del ensayo en papel ${T.sigla} (cargando)`;
  const seed = Number(route.query.s) || randomSeed();
  let parte = parteValida(T, route.query.p);
  if (!route.query.s || route.query.p !== parte) navigate([tit, 'ensayo'], { p: parte, s: String(seed) }, { replace: true });

  Promise.all([cargarBanco(currentEje(progress), tit), loadEstrategia()]).then(([banco, datos]) => {
    const ficha = banco.eje;
    const c = cifrasExamen(T, ficha);
    const tx = textosEstrategia(datos, { tit, eje: ficha.id, calculadora: c.calculadora.permitida });
    const tests = progress.tests().filter((t) => deTitEje(t, tit, ficha.id));
    const cuentaE = cuentaEnsayos(tests);
    const partes = partesEnsayo(T);

    // Lo que tiene que haber en la mesa: lo que pide el tribunal (normas con fuente) y lo propio del ensayo (consejos).
    const mesa = [
      ...tx.tribunal.dia,
      c.calculadora.permitida
        ? { tipo: 'consejo', texto: 'La calculadora, la tuya de mano (la que llevarás al examen): la de la app no se usa en el ensayo.' }
        : { tipo: 'consejo', texto: 'Sin calculadora: en tu examen no se permite, así que las cuentas, a mano.' },
      { tipo: 'consejo', texto: 'Tu carta del Estrecho de papel (la de enseñanza que usas para estudiar), con la mesa despejada para extenderla.' },
      { tipo: 'consejo', texto: 'Papel de borrador para las cuentas y un reloj a la vista (o el de la app, arriba).' },
      { tipo: 'consejo', texto: 'Nada más abierto en el móvil: la app solo para leer los enunciados, el reloj y, al final, la hoja de respuestas.' },
    ];

    const pinta = () => {
      const E1 = estructuraEnsayo(T, parte, tx.tiempo);
      const tc = progress.testEnCurso();
      const otro = tc && deTitEje(tc, tit, ficha.id) ? tc : null;
      const empezar = (impreso = false, minutos = null) => {
        // En pantalla, primero las preguntas que no has visto; el impreso, las mismas del cuadernillo (que no las mira).
        const test = buildEnsayo(E1, banco.oficial?.estudio ?? banco.estudio, createRng(seed), { respuestas: impreso ? null : progress.get().exams });
        if (!test.preguntas.length) { alert('No hay preguntas para este ensayo.'); return; }
        progress.saveTestEnCurso({ tit, eje: ficha.id, tipo: 'ensayo', parte, conv: null, seed, ids: test.preguntas.map((q) => q.id), nuevas: nuevasDe(test.preguntas, progress.get().exams),
          respuestas: {}, i: 0, consumidoMs: impreso ? (minutos ? minutos * 60000 : null) : 0, duracionMin: E1.duracionMin, fase: impreso ? 'hoja' : 'papel', ...(impreso ? { impreso: true } : {}) });
        location.hash = rutaEnsayo(tit, parte, seed);
      };
      const confirmarOtro = (fn) => () => { if (!otro || confirm('Tienes otro examen a medias y se descartará. ¿Empezar el ensayo?')) fn(); };
      const minutosImpreso = h('input#ensayo-min', { type: 'number', min: '1', max: String(E1.duracionMin * 2), inputmode: 'numeric', placeholder: String(E1.duracionMin) });
      summaryText = `VISTA preparación del ensayo en papel ${T.sigla} · parte ${parte} (${cuenta(totalPreguntas(E1), 'pregunta')}, ${E1.duracionMin} min${E1.oficial ? '' : ', orientativo'}) · ${cuentaE.hechos}/${cuentaE.recomendados} ensayos hechos\n` +
        `MESA: ${mesa.map((x) => x.texto).join(' | ')}\nRUTAS: ${rutaEnsayo(tit, parte, seed)} (empezar) · #/${tit}/ensayo/cuadernillo?p=${parte}&s=${seed} (imprimir)`;
      setChildren(el,
        volver('Examen', tlink(tit, ['examenes'])),
        h('p.lc-eti', icono('lapiz', 'ico-t'), `Ensayo general · ${T.sigla} · ${ficha.nombre}`),
        h('h1', 'Ensayo general en papel'),
        h('p', 'El examen como el día de verdad: lo resuelves en papel con tu carta, tu transportador, tu compás y tu lápiz. La app solo te da los enunciados y el reloj del tribunal; al acabar, pasas tus respuestas a la hoja y se corrige con las reglas del examen.'),
        h('p.ensayo-cuenta', { class: cuentaE.faltan ? '' : 'ok' }, icono(cuentaE.faltan ? 'diana' : 'ok', 'ico-t'), cuentaE.texto),

        h('fieldset.ensayo-partes', h('legend', '¿Qué ensayas?'),
          partes.map((x) => h('label.ensayo-parte', h('input', { type: 'radio', name: 'parte', value: x.id, checked: x.id === parte, onchange: () => { parte = x.id; navigate([tit, 'ensayo'], { p: parte, s: String(seed) }, { replace: true }); pinta(); } }),
            h('span', h('strong', x.titulo), h('span.muted.small', x.sub))))),
        E1.oficial ? null : h('p.muted.small', `Esta parte no tiene tiempo propio en el examen (son ${cuenta(T.estructura.duracionMin, 'minuto')} para ${cuenta(totalPreguntas(T.estructura), 'pregunta')}): ${cuenta(E1.duracionMin, 'minuto')} es lo que le deja el reparto orientativo de la estrategia.`),
        h('ul.datos-examen',
          h('li', cuenta(totalPreguntas(E1), 'pregunta')),
          h('li', `${cuenta(E1.duracionMin, 'minuto')}${E1.oficial ? '' : ' (orientativo)'}`),
          E1.bloques.filter((b) => b.maxErrores != null).map((b) => h('li', conIcono(b.ico, `${b.titulo}: como mucho ${cuenta(b.maxErrores, 'fallo')}`))),
          E1.modulo ? null : h('li', `Apruebas con ${cuenta(E1.minAciertos, 'acierto')}`)),

        h('section.ensayo-carta', { 'aria-labelledby': 'ensayo-carta-t' },
          h('h2#ensayo-carta-t', conIcono('mapa', 'La carta de papel la pones tú')),
          h('p', 'La app no da la carta: la carta oficial (la 105 del Estrecho, de enseñanza) es del Instituto Hidrográfico de la Marina y tiene derechos. Usa la tuya, la misma con la que estudias. El día del examen te la da el tribunal.')),

        h('section.ensayo-mesa', { 'aria-labelledby': 'ensayo-mesa-t' },
          h('h2#ensayo-mesa-t', conIcono('lista', 'En tu mesa')),
          h('p.muted.small', 'Lo que pide tu tribunal (con su fuente) y lo que hace falta para el ensayo. Márcalo a medida que lo pongas en la mesa.'),
          h('ul.ensayo-mesa-lista', mesa.map(lineaMesa)),
          tx.tribunal.nota ? h('p.est-nota', tx.tribunal.nota) : null),

        h('p.muted.small', `Mientras dura, nada de la práctica: ni la mesa de cartas, ni las fórmulas, ni el paso a paso. Se recomienda hacer al menos ${ENSAYOS_RECOMENDADOS} antes del examen.`),
        otro ? h('p.aviso-medias', 'Tienes otro examen a medias: si empiezas el ensayo, se descarta.') : null,
        h('div.botones-columna',
          h('button.grande', { type: 'button', onclick: confirmarOtro(() => empezar(false)) }, conIcono('reloj', 'Empezar el ensayo')),
          h('a.btn.secondary.grande', { href: tlink(tit, ['ensayo', 'cuadernillo'], { p: parte, s: String(seed) }) }, conIcono('imprimir', 'Imprimir el cuadernillo'))),
        h('details.ensayo-impreso',
          h('summary', 'Ya lo hice con el cuadernillo impreso: pasar mis respuestas'),
          h('p.muted.small', `Este ensayo es el del código ${seed}: el que imprimiste con este mismo enlace. Si quieres, di cuánto tardaste.`),
          h('label.ensayo-min', 'Minutos que tardaste (opcional) ', minutosImpreso),
          h('button.secondary', { type: 'button', onclick: confirmarOtro(() => empezar(true, Math.round(Number(minutosImpreso.value)) || null)) }, conIcono('lista', 'Pasar a la hoja de respuestas'))),
        h('p.centrado', h('a', { href: tlink(tit, ['examenes']) }, 'Ahora no')));
    };
    pinta();
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo preparar el ensayo: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// #/<tit>/ensayo/cuadernillo — para imprimir: cabecera, instrucciones, enunciados numerados y la hoja en blanco.
function cuadernilloView({ progress, params: route, tit }) {
  const T = TITULACIONES[tit];
  const seed = Number(route.query.s) || randomSeed();
  const parte = parteValida(T, route.query.p);
  if (!route.query.s) navigate([tit, 'ensayo', 'cuadernillo'], { p: parte, s: String(seed) }, { replace: true });
  const cuerpo = h('div.ep-hoja-cuerpo', h('p.muted', 'Preparando el cuadernillo…'));
  const impresion = h('p.mc-impresion', h('span', `${T.nombre} (${T.sigla})`), h('span', 'Ensayo en papel'), h('span', fechaImpresion()));
  const titulo = h('h1.lc-titulo', 'Cuadernillo del ensayo');
  const el = h('article.mc-hoja.ensayo-papel',
    h('div.no-imprimir.mc-acciones', volver('Preparación', tlink(tit, ['ensayo'], { p: parte, s: String(seed) })),
      h('div.mc-botones', h('button.mc-imprimir', { type: 'button', onclick: () => window.print() }, conIcono('imprimir', 'Imprimir / guardar PDF')))),
    h('header.mc-hoja-cab', impresion, h('p.lc-eti.mc-eti-pantalla', icono('lapiz', 'ico-t'), `Ensayo en papel · ${T.sigla}`), titulo),
    cuerpo);
  let summaryText = `VISTA cuadernillo imprimible del ensayo ${T.sigla} (cargando)`;
  Promise.all([cargarBanco(currentEje(progress), tit), loadEstrategia()]).then(([banco, datos]) => {
    const E1 = estructuraEnsayo(T, parte, datos.tiempo);
    // Las mismas preguntas que tendrá el ensayo con esta semilla (sin «primero las no vistas»: el cuadernillo no cambia
    // según lo que hayas respondido después de imprimirlo).
    const test = buildEnsayo(E1, banco.oficial?.estudio ?? banco.estudio, createRng(seed));
    titulo.textContent = test.titulo.replace('Ensayo en papel · ', 'Ensayo en papel: ');
    impresion.children[1].textContent = `${test.titulo} · código ${seed}`;
    setChildren(cuerpo,
      h('section.ep-instrucciones',
        h('p', h('strong', `${cuenta(test.preguntas.length, 'pregunta')} · ${cuenta(E1.duracionMin, 'minuto')}${E1.oficial ? '' : ' (orientativo)'}.`), ' Una sola respuesta correcta en cada una. Resuélvelo con la carta de papel, el transportador, el compás y el lápiz; marca tus respuestas en la hoja del final.'),
        E1.bloques.some((b) => b.maxErrores != null) ? h('p', `Límites de fallos: ${E1.bloques.filter((b) => b.maxErrores != null).map((b) => `${b.titulo}, ${b.maxErrores}`).join('; ')}.`) : null,
        h('p', `Para corregirlo: en la app, Examen → «Ensayo en papel», código ${seed} (el mismo enlace), «Ya lo hice con el cuadernillo impreso».`),
        h('p.no-imprimir.muted.small', 'La carta no va en el cuadernillo: es del Instituto Hidrográfico de la Marina. Usa la tuya.')),
      cuadernillo(test.preguntas),
      h('section.ep-hoja-sec', hojaEnBlanco(test.preguntas),
        h('p.ep-firma', 'Tiempo empleado: ______ min')));
    summaryText = `VISTA cuadernillo imprimible del ensayo ${T.sigla} · ${test.titulo} · código ${seed} · ${cuenta(test.preguntas.length, 'pregunta')}: ${test.preguntas.map((q) => q.id).join(', ')}`;
  }).catch((e) => setChildren(cuerpo, h('p.warn', `No se pudo preparar el cuadernillo: ${e.message}`)));
  return { el, summary: () => summaryText };
}

// «Lo hice en papel» (R-58): el alumno resuelve una pregunta de carta en su hoja, mete el resultado de los pasos que tiene
// y la app le dice en qué paso se desvió, con nombre si es un error típico, y qué pasos están bien hechos con su dato
// (el error arrastrado no se marca). Lógica en src/exams/papel.js; el primer fallo con nombre va al cuaderno de fallos
// (origen «papel»). Nunca durante un examen en curso (modoExamen()).
//
// papelPanel({ q, sol, chart, factor, tit, onCerrar, onGuiado }) → { el, summary } en la vista de la pregunta
// (#/q/<id>?papel=1). Se llega desde el botón «Lo hice en papel», desde el resultado del ensayo en papel y desde tu
// examen oficial.

import { h, setChildren } from './dom.js';
import { conIcono } from './iconos.js';
import { modoExamen } from './modo-examen.js';
import { pasosPapel, corregirPapel, veredicto, textoPapel, tecladoDe, EJEMPLO, PAPEL, papelPosible } from '../exams/papel.js';
import { AVISOS } from '../exams/avisos-pasos.js';
import { ERRORES } from '../exams/taxonomia.js';
import { createKit } from '../exams/kit.js';
import { tipoDePregunta } from '../course/velocidad.js';
import { erroresAlumno } from '../store/errores.js';
import { anotarFallo } from './cuaderno.js';
import { cuenta } from '../texto.js';
import { introPlegable } from './intro-vista.js';

let contador = 0;
const BORRADOR = (id) => `nautica.papel.${id}`;
const leerBorrador = (id) => { try { return JSON.parse(localStorage.getItem(BORRADOR(id)) ?? 'null') ?? {}; } catch { return {}; } };
const guardarBorrador = (id, v) => { try { localStorage.setItem(BORRADOR(id), JSON.stringify(v)); } catch { /* sin almacén: no pasa nada */ } };

/** ¿Se puede corregir en papel esta pregunta? (resolución con pasos y ningún examen en marcha) */
export function papelDisponible(q, sol, chart) {
  return !modoExamen() && papelPosible(sol, q, chart);
}

const ROTULO = {
  [PAPEL.OK]: ['ok', 'Bien'],
  [PAPEL.ARRASTRADO]: ['ok', 'Bien hecho con tu dato'],
  [PAPEL.CASI]: ['casi', 'Casi: un redondeo'],
  [PAPEL.MAL]: ['no', 'Aquí te desviaste'],
  [PAPEL.SIN_COMPROBAR]: ['aviso', 'No se puede comprobar con tu dato anterior'],
  [PAPEL.ILEGIBLE]: ['aviso', 'No entiendo lo que escribiste'],
};

export function papelPanel(o) {
  const { q, sol, chart } = o;
  const factor = o.factor ?? 1;
  const uid = `pp${++contador}`;
  const k = createKit(chart);
  sol.solve(k, q);
  const pasos = pasosPapel(k.steps);
  const borrador = leerBorrador(q.id);
  let ultimo = null;

  const filas = pasos.map((p) => {
    const inputs = p.campos.map((c, j) => {
      const id = `${uid}-${p.i}-${j}`;
      const input = h('input.papel-input', { id, name: id, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', inputmode: tecladoDe(c.kind),
        enterkeyhint: 'next', placeholder: EJEMPLO[c.kind] ? `p. ej. ${EJEMPLO[c.kind]}` : '', value: borrador[p.i]?.[j] ?? '' });
      input.addEventListener('input', () => { const b = leerBorrador(q.id); b[p.i] = inputs.map((x) => x.input.value); guardarBorrador(q.id, b); });
      return { c, input, campo: h('label.papel-campo', { for: id }, h('span.papel-lbl', c.label),
        input) };
    });
    const res = h('div.papel-res', { 'aria-live': 'polite' });
    const li = h('li.papel-paso', { 'data-paso': String(p.n) },
      h('h3.papel-tit', h('span.papel-n', `${p.n}`), ` ${p.title}`),
      h('p.papel-pregunta.small', p.pregunta),
      h('div.papel-campos', inputs.map((x) => x.campo)),
      res);
    return { p, inputs, res, li };
  });

  const veredictoEl = h('div.papel-veredicto', { 'aria-live': 'polite', tabindex: '-1' });
  const form = h('form.papel-form', { onsubmit: (ev) => { ev.preventDefault(); corregir(); } },
    h('ol.papel-lista', filas.map((f) => f.li)),
    h('div.actions.papel-acciones',
      h('button.grande', { type: 'submit' }, conIcono('ok', 'Corregir mi hoja')),
      h('button.secondary', { type: 'button', onclick: borrar }, conIcono('papelera', 'Borrar lo escrito'))));

  function borrar() {
    for (const f of filas) { for (const x of f.inputs) { x.input.value = ''; delete x.input.dataset.status; } f.res.replaceChildren(); f.li.className = 'papel-paso'; }
    guardarBorrador(q.id, {});
    veredictoEl.replaceChildren();
    ultimo = null;
  }

  function corregir() {
    const entradas = Object.fromEntries(filas.map((f) => [f.p.i, f.inputs.map((x) => x.input.value)]));
    const r = corregirPapel({ sol, q, chart, entradas, factor });
    ultimo = r;
    let cuaderno = null;
    // Solo el primer fallo con nombre va al cuaderno (y a tus errores); los arrastrados no.
    if (r.fallo) {
      try { erroresAlumno().error(q.id, r.fallo.error); } catch { /* sin almacén */ }
      cuaderno = anotarFallo({ error: r.fallo.error, tipo: tipoDePregunta(q, sol, { deCarta: true }), origen: 'papel', q: q.id });
    }
    for (const [j, f] of filas.entries()) pintarPaso(f, r.pasos[j], r);
    pintarVeredicto(r, cuaderno);
    o.onCorregido?.(r);
    requestAnimationFrame(() => { veredictoEl.scrollIntoView({ block: 'start', behavior: 'smooth' }); veredictoEl.focus({ preventScroll: true }); });
  }

  function pintarPaso(f, x, r) {
    f.li.className = `papel-paso e-${x.estado}${r.primero === x ? ' primero' : ''}`;
    f.inputs.forEach((inp, j) => { const c = x.campos[j]; inp.input.dataset.status = c.estado === PAPEL.ILEGIBLE ? 'invalid' : x.estado === PAPEL.MAL && c.estado === PAPEL.MAL ? 'wrong' : c.estado === PAPEL.CASI ? 'close' : c.estado === PAPEL.VACIO || x.estado === PAPEL.SIN_COMPROBAR ? '' : 'ok'; });
    if (x.estado === PAPEL.VACIO) { f.res.replaceChildren(h('p.small.muted', 'No lo escribiste.')); return; }
    const [ico, rot] = ROTULO[x.estado];
    const tuyo = x.campos.filter((c) => c.valorTexto);
    const lineas = [];
    if (x.estado === PAPEL.ILEGIBLE) {
      lineas.push(h('p.small', `Escríbelo como en el paso a paso. Ejemplo: ${x.campos.filter((c) => c.estado === PAPEL.ILEGIBLE).map((c) => `${c.label} ${EJEMPLO[c.kind] ?? ''}`).join(' · ')}.`));
    } else {
      lineas.push(h('p.papel-cmp', h('span', 'Tú: ', h('strong', tuyo.map((c) => `${c.label} ${c.valorTexto}`).join(' · '))),
        x.estado === PAPEL.OK ? null : h('span', ' · Resolución: ', h('strong', tuyo.map((c) => `${c.label} ${c.esperadoTexto}`).join(' · ')))));
      // La explicación del arrastre, en el primero; en los demás, corta.
      if (x.estado === PAPEL.ARRASTRADO) lineas.push(h('p.small', r.pasos.find((y) => y.estado === PAPEL.ARRASTRADO) === x ? 'No coincide con la resolución porque arrastras un dato de antes, pero con tu dato la cuenta está bien hecha: este paso no cuenta como fallo.' : 'Arrastrado: bien hecho con tu dato, no cuenta como fallo.'));
      if (x.estado === PAPEL.CASI) lineas.push(h('p.small', 'Te pasas del margen por poco: revisa los decimales o la lectura en la carta.'));
      if (x.estado === PAPEL.SIN_COMPROBAR) lineas.push(h('p.small', 'Con lo que escribiste antes la cuenta no sale (por ejemplo, la hora cae fuera de la tabla): corrige primero el paso que te desvió.'));
      if (x.estado === PAPEL.MAL) {
        const conDato = x.campos.filter((c) => c.valorTexto && c.conTuDatoTexto);
        if (r.primero !== x && conDato.length) lineas.push(h('p.small', `Con tus datos de antes saldría ${conDato.map((c) => `${c.label} ${c.conTuDatoTexto}`).join(' · ')}: aquí hay otro error, además del primero.`));
        if (x.error) {
          const a = AVISOS[x.error];
          lineas.push(h('div.papel-error',
            h('p', conIcono('aviso', h('strong', x.errorEn != null && x.errorEn !== x.i ? `${a.has}, en el paso ${pasos.find((p) => p.i === x.errorEn)?.n} (no lo escribiste).` : `${a.has}.`))),
            h('p.small', h('strong', 'No olvides: '), a.no)));
        } else if (x.posibles) {
          lineas.push(h('p.small', `Puede ser «${ERRORES[x.posibles[0]].nombre}» o «${ERRORES[x.posibles[1]].nombre}»: con lo escrito no se distingue. Escribe también los pasos de antes.`));
        }
      }
    }
    f.res.replaceChildren(h('p.papel-estado', conIcono(ico, rot)), ...lineas);
  }

  function pintarVeredicto(r, cuaderno) {
    const tit = o.tit ?? q.tit ?? 'py';
    const icono = r.primero ? 'no' : r.casi ? 'casi' : r.escritos ? 'ok' : 'aviso';
    setChildren(veredictoEl,
      h('p.papel-veredicto-tx', conIcono(icono, h('strong', veredicto(r)))),
      r.escritos ? h('p.small.muted', `Has escrito ${r.escritos} de ${cuenta(r.total, 'paso')}: ${[r.aciertos ? `${r.aciertos} bien` : null, r.arrastrados ? `${r.arrastrados} bien con tu dato` : null, r.casi ? `${r.casi} casi` : null, r.primero ? `${r.otros + 1} con error` : null].filter(Boolean).join(', ')}.`) : null,
      r.otros ? h('p.small', `Además del primero, hay ${cuenta(r.otros, 'paso')} con otro error que no viene arrastrado.`) : null,
      cuaderno ? h('p.small.papel-cuaderno', h('a', { href: `#/${tit}/fallos` }, cuaderno.nuevo ? `Apuntado en tu cuaderno de fallos: «${cuaderno.nombre.titulo}».` : cuaderno.reabierto ? `«${cuaderno.nombre.titulo}» vuelve a abrirse en tu cuaderno de fallos.` : `«${cuaderno.nombre.titulo}», en tu cuaderno de fallos.`)) : null,
      r.primero && !r.fallo ? h('p.small.muted', 'No coincide con ningún error típico: no va al cuaderno. Mira la cuenta de ese paso en el paso a paso.') : null,
      h('div.actions',
        o.onGuiado ? h('button.secondary', { type: 'button', onclick: o.onGuiado }, conIcono('diana', 'Verlo paso a paso')) : null));
  }

  const el = h('section.papel', { 'aria-labelledby': `${uid}-t` },
    h('div.guiado-cab', h('h2', { id: `${uid}-t` }, conIcono('documento', 'Lo hice en papel')),
      o.onCerrar ? h('button.secondary.small', { type: 'button', onclick: o.onCerrar }, 'Cerrar') : null),
    introPlegable('papel'),
    h('details.papel-margenes', h('summary', 'Qué margen doy'),
      h('p.small', 'El mismo que el paso a paso: rumbos ±1°, Ct ±0,5°, horas y duraciones ±3 min, alturas y sondas ±0,10 m, millas y nudos ±0,3, minutos de Δl y apartamiento ±0,5′, situación ±1′.'),
      h('p.small', h('strong', 'Lo que se mide en la carta con transportador o compás admite el doble: '), 'rumbos y demoras ±2°, distancias ±0,6 millas, situación ±2′. En papel la regla, el lápiz y el transportador no dan más precisión.'),
      h('p.small', 'Si un paso no coincide con la resolución pero sí con lo que sale de tus datos anteriores, está bien hecho: el error viene de antes y solo cuenta el primero.')),
    veredictoEl,
    form);

  return {
    el,
    summary: () => (ultimo ? textoPapel(ultimo) : `HOJA EN PAPEL abierta: ${cuenta(pasos.length, 'paso')} para escribir (${pasos.map((p) => p.title).join(' · ')}).`),
  };
}

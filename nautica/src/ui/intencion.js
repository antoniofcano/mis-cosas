// «Trázalo en la carta» (R-54): la carta gráfica por intención en el móvil. El alumno elige qué trazar, desde dónde y con
// qué valor, con botones grandes; la app lo dibuja exacto en la carta, con su rótulo, y le acerca la vista al trazo. Si se
// equivoca, se le dice el error con nombre y se le dibuja lo que habría trazado. Al terminar, la pregunta se resuelve con
// sus primeras elecciones y se compara con la resolución. Lógica en src/exams/intencion.js; el primer fallo con nombre
// va al cuaderno de fallos (origen «traza»). Nunca durante un examen en curso (modoExamen()).
//
// intencionPanel({ q, sol, chart, tit, onCerrar, onGuiado }) → { el, summary } en la vista de la pregunta (#/q/<id>?traza=1).

import { h, setChildren } from './dom.js';
import { conIcono } from './iconos.js';
import { modoExamen } from './modo-examen.js';
import { chartWidget, pantallaPequena } from './chart-widget.js';
import { planIntencion, elegir, intento, compararFinal, puntosDe, textoIntencion } from '../exams/intencion.js';
import { tipoDePregunta } from '../course/velocidad.js';
import { erroresAlumno } from '../store/errores.js';
import { anotarFallo } from './cuaderno.js';
import { cuenta } from '../texto.js';

let contador = 0;
const cache = new Map();
/** El plan de la pregunta (se calcula una vez: resuelve la pregunta con cada error típico). */
function planDe(q, sol, chart) {
  if (!cache.has(q.id)) { if (cache.size > 30) cache.delete(cache.keys().next().value); cache.set(q.id, planIntencion({ sol, q, chart })); }
  return cache.get(q.id);
}

/** ¿Se puede trazar por intención? (pregunta de carta con resolución por pasos y ningún examen en marcha) */
export function intencionDisponible(q, sol, chart) {
  if (modoExamen() || !sol || !chart) return false;
  try { return !!planDe(q, sol, chart); } catch { return false; }
}

export function intencionPanel(o) {
  const { q, sol, chart } = o;
  const plan = planDe(q, sol, chart);
  const uid = `in${++contador}`;
  const tit = o.tit ?? q.tit ?? 'py';
  // Estado: trazo y decisión en curso, primeras elecciones, intentos y lo dibujado.
  let t = 0; let d = 0;
  let primeras = plan.trazos.map(() => ({}));
  let fallos = []; // errores con nombre, en orden
  let dibujado = [...plan.inicio];
  let anotado = null;
  let terminado = false;

  // La carta entera del problema (sus faros y la salida) al empezar; luego, la vista se acerca a cada trazo.
  const encuadre = [...plan.focus, ...puntosDe(plan.inicio)];
  const w = chartWidget(chart, { items: dibujado, focus: encuadre, height: pantallaPequena() ? 250 : 380 });
  const hechos = h('ol.int-hechos', { 'aria-label': 'Trazos hechos' });
  const tarjeta = h('div.int-tarjeta');
  const fin = h('div.int-final', { tabindex: '-1', 'aria-live': 'polite' });

  const ver = (items, pts) => { w.setItems(items); if (pts?.length) w.flyTo(pts); };

  function pintarTrazo() {
    const tr = plan.trazos[t];
    const dec = tr.decisiones[d];
    const resp = tr.decisiones.slice(0, d).map((x) => {
      const ok = x.opciones.find((y) => y.ok);
      return h('li', h('span.int-q', x.pregunta), ' ', h('strong', conIcono('ok', ok.texto)));
    });
    const preguntaId = `${uid}-q${t}-${d}`;
    const fb = h('div.int-fb', { 'aria-live': 'polite' });
    const botones = dec.opciones.map((op) => h('button.int-opcion', { type: 'button', 'data-op': op.id, onclick: () => escoger(op, botones, fb) }, h('span.int-tx', op.texto)));
    setChildren(tarjeta,
      h('p.int-n.small', `Trazo ${t + 1} de ${plan.total}`),
      tr.pista.length && dec.id.startsWith('valor') ? h('details.int-pista', h('summary', 'Pista para el valor'), tr.pista.map((p) => h('p.small', p))) : null,
      resp.length ? h('ul.int-resp.small', resp) : null,
      h('h3.int-pregunta', { id: preguntaId, tabindex: '-1' }, dec.pregunta),
      h('div.int-opciones', { role: 'group', 'aria-labelledby': preguntaId }, botones),
      h('p.int-dimelo', h('button.secondary.small', { type: 'button', onclick: () => dimelo(botones, fb) }, 'No lo sé: dímelo')),
      fb);
  }

  function escoger(op, botones, fb) {
    const tr = plan.trazos[t];
    const dec = tr.decisiones[d];
    const r = elegir(dec, op.id);
    if (primeras[t][dec.id] == null) primeras[t][dec.id] = op.id;
    if (r.ok) { avanzar(); return; }
    const b = botones.find((x) => x.dataset.op === op.id);
    b.disabled = true;
    b.classList.add('mal');
    b.replaceChildren(...conIcono('no', h('span.int-marca', 'No:'), h('span.int-tx', op.texto)));
    let apunte = null;
    if (r.error) {
      fallos.push(r.error);
      // Solo el primer fallo con nombre va al cuaderno (y a tus errores).
      if (!anotado && !modoExamen()) {
        try { erroresAlumno().error(q.id, r.error); } catch { /* sin almacén */ }
        anotado = anotarFallo({ error: r.error, tipo: tipoDePregunta(q, sol, { deCarta: true }), origen: 'traza', q: q.id }) ?? { sin: true };
        if (!anotado.sin) apunte = h('p.small.int-cuaderno', h('a', { href: `#/${tit}/fallos` }, anotado.nuevo ? `Apuntado en tu cuaderno de fallos: «${anotado.nombre.titulo}».` : `«${anotado.nombre.titulo}», en tu cuaderno de fallos.`));
      }
    }
    const malo = intento({ sol, q, chart, plan, t, opcion: op });
    if (malo.length) ver([...dibujado, ...malo], puntosDe([...malo, ...tr.items]));
    setChildren(fb, h('div.int-error', { role: 'status' },
      h('p', conIcono('aviso', h('strong', r.frase))),
      r.regla ? h('p.small', h('strong', 'No olvides: '), r.regla) : null,
      malo.length ? h('p.small', 'En la carta tienes tu trazo, en discontinua y rotulado «Tu trazo». Elige otra vez.') : h('p.small', 'Elige otra vez.'),
      apunte));
  }

  function dimelo(botones, fb) {
    const tr = plan.trazos[t];
    const dec = tr.decisiones[d];
    if (primeras[t][dec.id] == null) primeras[t][dec.id] = 'dimelo';
    const ok = dec.opciones.find((x) => x.ok);
    setChildren(fb, h('p.small', `Era: ${ok.texto}.`));
    avanzar();
  }

  function avanzar() {
    const tr = plan.trazos[t];
    const dec = tr.decisiones[d];
    // Elegido el objeto (o la acción, si no hay objeto), la vista se acerca a donde va el trazo.
    if (dec.id === 'objeto' || (dec.id === 'accion' && !tr.decisiones.some((x) => x.id === 'objeto'))) ver(dibujado, tr.focus);
    else ver(dibujado);
    d += 1;
    if (d < tr.decisiones.length) { pintarTrazo(); enfocar(); return; }
    // Trazo hecho: la app lo dibuja.
    dibujado = [...dibujado, ...tr.antes.filter((x) => !dibujado.includes(x)), ...tr.items];
    ver(dibujado, tr.focus);
    const aLaPrimera = tr.decisiones.every((x) => primeras[t][x.id] && x.opciones.find((y) => y.id === primeras[t][x.id])?.ok);
    hechos.append(h('li', h('strong', tr.titulo), ' ', h('span.small', aLaPrimera ? conIcono('ok', 'a la primera') : conIcono('casi', 'con ayuda'))));
    const ultimo = t + 1 >= plan.total;
    setChildren(tarjeta,
      h('p.int-n.small', `Trazo ${t + 1} de ${plan.total}`),
      h('h3.int-pregunta', { tabindex: '-1' }, conIcono('ok', `Trazado: ${tr.titulo}`)),
      h('p.small', 'Lo tienes en la carta, con su rótulo.'),
      tr.asi ? h('p.small.int-asi', h('strong', 'Así se hace en el papel: '), tr.asi) : null,
      h('div.actions', h('button.grande', { type: 'button', onclick: () => { if (ultimo) terminar(); else { t += 1; d = 0; prepararTrazo(); } } }, ultimo ? 'Ver el resultado' : 'Siguiente trazo')));
    enfocar();
  }

  function prepararTrazo() {
    const tr = plan.trazos[t];
    // Lo que da el enunciado (una situación de salida) aparece al llegar a su trazo.
    if (tr.antes.length) { dibujado = [...dibujado, ...tr.antes.filter((x) => !dibujado.includes(x))]; ver(dibujado); }
    pintarTrazo();
    enfocar();
  }

  function enfocar() { requestAnimationFrame(() => tarjeta.querySelector('.int-pregunta')?.focus({ preventScroll: false })); }

  function terminar() {
    terminado = true;
    tarjeta.replaceChildren();
    const decs = plan.trazos.flatMap((tr, n) => tr.decisiones.map((x) => ({ x, n })));
    const bien = decs.filter(({ x, n }) => x.opciones.find((y) => y.id === primeras[n][x.id])?.ok).length;
    const cmp = compararFinal({ sol, q, chart, plan, primeras });
    ver(dibujado, encuadre);
    setChildren(fin,
      h('h3', conIcono(bien === decs.length ? 'ok' : 'casi', bien === decs.length ? 'Todo a la primera' : `A la primera: ${bien} de ${cuenta(decs.length, 'elección', 'elecciones')}`)),
      cmp.roto ? h('p', 'Con lo que elegiste a la primera, las líneas no llegan a cortarse: no sale ninguna situación.')
        : cmp.igual ? h('p', 'Con lo que elegiste a la primera, tu resultado coincide con el de la resolución.')
          : h('p', 'Con lo que elegiste a la primera, te habría salido otro resultado:'),
      cmp.lineas.length ? h('table.int-cmp', h('thead', h('tr', h('th', ''), h('th', 'Tú, a la primera'), h('th', 'Resolución'))),
        h('tbody', cmp.lineas.map((l) => h('tr', h('th', { scope: 'row' }, l.que), h('td', l.tuyo, l.ok ? null : h('span.small.int-dif', l.dif)), h('td', l.bueno))))) : null,
      plan.finales.length ? h('details.int-cuentas', { open: true }, h('summary', 'Lo que queda, en cuentas'), h('ol.small', plan.finales.map((f) => h('li', h('strong', `${f.title}: `), f.text)))) : null,
      fallos.length ? h('p.small', `Errores al elegir: ${[...new Set(fallos)].length}. ${anotado && !anotado.sin ? 'El primero está en tu cuaderno de fallos.' : ''}`) : null,
      h('p.small.muted', 'La precisión del transportador y del compás, entrénala en tu hoja: aquí entrenas qué trazar y en qué orden.'),
      h('div.actions',
        h('button', { type: 'button', onclick: reiniciar }, 'Otra vez'),
        o.onGuiado ? h('button.secondary', { type: 'button', onclick: o.onGuiado }, conIcono('diana', 'Resolver paso a paso')) : null,
        o.onCerrar ? h('button.secondary', { type: 'button', onclick: o.onCerrar }, 'Cerrar') : null));
    fin.hidden = false;
    requestAnimationFrame(() => fin.focus({ preventScroll: false }));
  }

  function reiniciar() {
    t = 0; d = 0; primeras = plan.trazos.map(() => ({})); fallos = []; terminado = false;
    dibujado = [...plan.inicio];
    hechos.replaceChildren(); fin.replaceChildren(); fin.hidden = true;
    ver(dibujado, encuadre);
    pintarTrazo(); enfocar();
  }

  const el = h('section.intencion', { 'aria-labelledby': `${uid}-t` },
    h('div.guiado-cab', h('h2', { id: `${uid}-t` }, conIcono('transportador', 'Trázalo en la carta')),
      o.onCerrar ? h('button.secondary.small', { type: 'button', onclick: o.onCerrar }, 'Cerrar') : null),
    h('p.small', `Eliges qué trazar, desde dónde y con qué valor; la app lo dibuja exacto. ${cuenta(plan.total, 'trazo')}.`),
    h('div.int-cuerpo', h('div.int-carta', w.el), h('div.int-panel', hechos, tarjeta, fin)));
  fin.hidden = true;
  pintarTrazo();

  return {
    el,
    summary: () => textoIntencion(plan, { t, hechos: terminado ? plan.total : t, fallos }),
  };
}

// Clase: #/<tit>/curso/<lección>[?practica=1] — tarjetas paso a paso (se retoma donde se dejó), chuleta,
// práctica con preguntas reales y repaso espaciado. Modo concentración con barra de actividad.

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { loadCourse, loadTheoryBank, loadMnemonics } from '../../store/datasets.js';
import { trasPractica, leccionesDe, APROBADO, conPreguntaFinal, conPreguntasIntercaladas, conEjercicios, pistaParte, estadoLeccion, numTramos, enTramos, minutosTramo, nuevoRitmo, SEG_TARJETA } from '../../course/engine.js';
import { resueltasDe, conResuelto } from '../../course/resueltos.js';
import { SOLUCIONES, bancoResolucion } from '../../exams/solutions/index.js';
import { tlink, volver } from '../titulacion.js';
import { barraActividad } from '../actividad.js';
import { pintarCierre, cierre, cifrasCierre } from '../cierre.js';
import { illustrationEls } from '../illustration.js';
import { pidePrediccion, interactivaDe, dibujoFijo } from '../../illustrations/interactivas.js';
import { questionCard, prepareTheory, tandaPreguntas, profePanel } from './theory.js';
import { voice } from '../voice.js';
import { transicion, deslizar, vibrar } from '../movimiento.js';
import { icono } from '../iconos.js';
import { hojaRespuesta } from '../hoja.js';
import { avisoError } from '../aviso-error.js';
import { dondeEncaja } from '../encaja.js';
import { episodiosDeClase, enlaceEpisodio } from './podcast.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { cronometro } from '../../course/cronometro.js';
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
    // y, por el camino, una pregunta real cada pocas tarjetas para no leer mucho seguido sin responder.
    const rngClase = createRng(randomSeed());
    // Lo que no cae en el examen (`extra`) sale del camino y se ofrece al final, plegado, como «Para saber más».
    const pasosExtra = L.pasos.filter((p) => p.extra);
    const sinExtra = L.pasos.filter((p) => !p.extra);
    // La clase va en tramos de unos 5 minutos, cada uno con su cierre: se puede dejar al acabar cualquiera.
    const k = numTramos(sinExtra.length);
    const pasosBase = enTramos(conResuelto(sinExtra, resueltasDe(L.id).filter((id) => preguntas.has(id))), k)
      .map((p) => (p.tipo === 'ilustracion' ? { ...p, prediccion: pidePrediccion(p.spec) } : p));
    // Ejercicios que no son de elegir opción: tocar las partes de una lámina y emparejar los términos de la clase.
    // Los términos los declara cada clase en sus datos (`terminos`): no se deducen del texto.
    const terminos = (L.terminos ?? []).map((id) => bank.vocab?.porId.get(id)).filter((t) => t?.definicion);
    // Partes con nombre y una pista de qué es cada una: se pide por lo que hace, no por la letra que se ve escrita.
    const partesDe = (spec) => { const d = interactivaDe(spec); return d?.botonesPartes?.map(([k, nombre]) => [k, nombre, d.partes?.[k] ? pistaParte(d.partes[k]) : nombre]) ?? null; };
    const conTodo = conEjercicios(conPreguntaFinal(pasosBase, disponibles, rngClase), { terminos, partesDe });
    const tarjetas = [{ tipo: 'intro', tramo: 0 }, ...conPreguntasIntercaladas(conTodo, disponibles, rngClase)];
    // Las preguntas añadidas (la final, las intercaladas) van en el tramo de la tarjeta que tienen delante.
    tarjetas.forEach((t, i) => { if (t.tramo == null) t.tramo = tarjetas[i - 1].tramo; });
    const n = tarjetas.length;
    // Duración de cada tramo al ritmo real del alumno (se mide al cerrar cada tramo) y hora de empiece del actual.
    const ritmo = () => progress.settings().segTarjeta ?? SEG_TARJETA;
    const tarjetasEn = (t) => tarjetas.filter((x) => x.tramo === t).length;
    // Tiempo real del tramo: cada cambio de tarjeta cierra una pantalla (con tope de 2 min por pantalla).
    const crono = cronometro();
    // Al cerrar un tramo: los minutos reales a la meta del día y el ritmo (segundos por tarjeta) actualizado.
    const apuntaTramo = (t) => {
      const n = tarjetasEn(t);
      const ms = crono.ms();
      progress.logActividad(Math.round(ms / 60000));
      progress.setSetting('segTarjeta', nuevoRitmo(ritmo(), n, ms));
      crono.reinicia();
    };
    const finTramo = (i) => i < n - 1 && tarjetas[i + 1].tramo > tarjetas[i].tramo;
    const enTramo = (i) => { const t = tarjetas[i].tramo; const del = tarjetas.filter((x) => x.tramo === t); return { t, j: del.indexOf(tarjetas[i]) + 1, m: del.length }; };
    let paso = Math.min(Math.max(0, Number(reg().paso) || 0), n - 1);
    let checkOk = new Set();
    const enClase = { respondidas: 0, aciertos: 0 }; // preguntas de examen respondidas durante la clase

    // Corrección de un «¿Lo pillas?»: en el modo tarjeta, en el panel que sube desde abajo (con «Continuar»); viendo
    // todas las tarjetas seguidas, debajo de la pregunta.
    function corrige(fb, ok, contenido) {
      if (cont.querySelector('.paso-cabecera')) hojaRespuesta(cont, { ok, contenido, onContinuar: () => irSiguiente() });
      else setChildren(fb, h('p', { class: ok ? 'ok' : 'warn' }, ok ? 'Correcto.' : 'No es esa.'), contenido);
    }

    function pasoEl(p, i) {
      switch (p.tipo) {
        case 'intro': return h('div.paso.intro', h('h2', L.titulo),
          h('h3', 'En esta clase'),
          L.objetivos?.length ? h('ul', L.objetivos.map((o) => h('li', o))) : null,
          h('p.muted', k > 1 ? `Este tramo: unos ${minutosTramo(tarjetasEn(tarjetas[paso]?.tramo ?? 0), ritmo())} min · Clase completa (${k} tramos): unos ${minutosTramo(n, ritmo())} min.`
            : `Unos ${minutosTramo(n, ritmo())} minutos.`),
          // Lo que esta clase del PY da por sabido del PER, plegado: no saca de la clase salvo que el alumno lo pida.
          base.length ? h('details.viene-per', h('summary', `🔁 ¿Te falta base del PER? (${base.length} ${base.length === 1 ? 'clase' : 'clases'})`),
            h('p.small', base.every((b) => b.vista) ? 'Esta clase da por sabido lo del PER que ya viste:' : 'Esta clase da por sabido esto del PER. Si no lo tienes fresco, repásalo (luego vuelves aquí):'),
            listaBase()) : null,
          episodio ? h('div.radio-clase', h('a.btn.secondary.boton-icono', { href: enlacePodcast }, icono('podcast'), `Escucha el podcast de esta clase (${minPodcast} min)`),
            h('p.muted.small', 'Antes o después de la clase: Elena y Andrés lo cuentan en voz alta.')) : null);
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
        case 'toca': {
          // «Toca en el dibujo»: se piden tres partes de la lámina, una a una. Con dos fallos en la misma, se resalta.
          const { svg } = dibujoFijo(interactivaDe(p.spec), p.spec);
          const orden = rngClase.shuffle([...p.partes]).slice(0, 3);
          let k = 0;
          let fallos = 0;
          const pregunta = h('p.toca-pregunta');
          const fb = h('p.toca-fb', { 'aria-live': 'polite' });
          const dib = h('div.il-svg.toca-dibujo', { html: svg });
          const marca = (parte, cls) => { for (const el of dib.querySelectorAll(`[data-parte="${parte}"]`)) el.classList.add(cls); };
          const pinta = () => { pregunta.textContent = k < orden.length ? `Toca: ${orden[k][2]}` : '¡Hecho!'; };
          dib.addEventListener('click', (ev) => {
            if (k >= orden.length) return;
            // Margen de toque: las partes pequeñas o pegadas (G, B, M) cuentan si el dedo cae a ~22 px de la pedida.
            const cerca = [...dib.querySelectorAll(`[data-parte="${orden[k][0]}"]`)].some((el) => {
              const r = el.getBoundingClientRect();
              return Math.hypot(Math.max(r.left - ev.clientX, 0, ev.clientX - r.right), Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom)) <= 22;
            });
            const parte = cerca ? orden[k][0] : ev.target.closest?.('[data-parte]')?.dataset.parte;
            if (!parte) return;
            const nombre = p.partes.find((x) => x[0] === parte)?.[1];
            if (parte === orden[k][0]) {
              vibrar(true);
              marca(parte, 'toca-ok');
              k += 1;
              fallos = 0;
              fb.textContent = k < orden.length ? `✅ Bien: es ${nombre}.` : `✅ Bien: es ${nombre}. Las has encontrado todas.`;
              pinta();
              if (k >= orden.length) { checkOk.add(i); if (i === paso) refrescaBotones(); }
            } else {
              vibrar(false);
              fallos += 1;
              if (fallos >= 2) marca(orden[k][0], 'toca-pista');
              fb.textContent = `${nombre ? `Eso es ${nombre}.` : 'Ahí no está.'} ${fallos >= 2 ? `Es ${orden[k][1]}: te lo resalto, tócalo.` : 'Prueba otra vez.'}`;
            }
          });
          pinta();
          return h('div.paso.toca', h('p.badge', '👆 Toca en el dibujo'), pregunta, dib, fb);
        }
        case 'emparejar': {
          // «Empareja»: toca un término y después su definición.
          const defs = rngClase.shuffle(p.pares.map(([, d], j) => ({ d, j })));
          let sel = null;
          let hechos = 0;
          const fb = h('p.toca-fb', { 'aria-live': 'polite' });
          const bTer = p.pares.map(([t], j) => h('button.emp-termino', { type: 'button', 'aria-pressed': 'false', onclick: () => {
            if (bTer[j].disabled) return;
            sel = j;
            bTer.forEach((b, x) => b.setAttribute('aria-pressed', String(x === j)));
            fb.textContent = `Ahora toca la definición de «${t}».`;
          } }, t));
          const bDef = defs.map(({ d, j }) => {
            const b = h('button.emp-def', { type: 'button', onclick: () => {
              if (b.disabled) return;
              if (sel == null) { fb.textContent = 'Primero toca un término de arriba.'; return; }
              if (sel === j) {
                vibrar(true);
                b.disabled = true; b.classList.add('emp-ok');
                bTer[j].disabled = true; bTer[j].classList.add('emp-ok'); bTer[j].setAttribute('aria-pressed', 'false');
                sel = null;
                hechos += 1;
                fb.textContent = hechos === p.pares.length ? '✅ Todas emparejadas.' : '✅ Bien.';
                if (hechos === p.pares.length) { checkOk.add(i); if (i === paso) refrescaBotones(); }
              } else {
                vibrar(false);
                b.classList.remove('emp-mal'); void b.offsetWidth; b.classList.add('emp-mal');
                fb.textContent = 'Esa no es. Prueba con otra.';
              }
            } }, d);
            return b;
          });
          return h('div.paso.emparejar', h('p.badge', '🔗 Empareja cada término con su definición'), h('div.emp-terminos', bTer), h('div.emp-defs', bDef), fb);
        }
        case 'check': {
          const fb = h('div');
          if (p.real) {
            const q = p.real;
            let card = questionCard(q, { tema: false, onChoose: (k) => {
              progress.recordExam(q.id, { choice: k, ok: k === q.correcta });
              enClase.respondidas += 1;
              if (k === q.correcta) enClase.aciertos += 1;
              const nuevo = questionCard(q, { chosen: k, reveal: true, lock: true, tema: false });
              card.replaceWith(nuevo);
              card = nuevo;
              checkOk.add(i);
              if (i === paso) refrescaBotones();
              corrige(fb, k === q.correcta, profePanel(q, bank.explicaciones[q.id], k));
            } });
            return h('div.paso.check', h('p.badge', '¿Lo pillas? Pregunta de examen'), card, fb);
          }
          const q = { id: `${L.id}-chk-${i}-${p.enunciado.length}`, enunciado: p.enunciado, opciones: p.opciones, correcta: p.correcta };
          let card = questionCard(q, { tema: false, onChoose: (k) => {
            const nuevo = questionCard(q, { chosen: k, reveal: true, lock: true, tema: false });
            card.replaceWith(nuevo);
            card = nuevo;
            checkOk.add(i);
            if (i === paso) refrescaBotones();
            corrige(fb, k === p.correcta, [k === p.correcta ? null : h('p', h('strong', `Era la ${p.correcta}).`)), p.explicacion ? h('p', p.explicacion) : null]);
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
      toca: 'Toca en el dibujo las partes que te pido.', emparejar: `Empareja cada término con su definición: ${(p.pares ?? []).map(([t]) => t).join(', ')}.`,
      regla: reglas.get(p.id) ? `Para recordarlo: ${reglas.get(p.id).regla}. ${reglas.get(p.id).significado}` : '', check: p.enunciado,
    }[p.tipo] ?? '');

    const guardaPaso = () => progress.saveLeccion(L.id, { ...reg(), paso, tramo: tarjetas[paso].tramo, tramos: k });
    const irAnterior = () => { if (paso === 0) return; voice.stop(); crono.marca(); paso -= 1; guardaPaso(); transicion(tarjeta, 'atras'); };
    const irSiguiente = () => {
      voice.stop();
      crono.marca();
      if (paso === n - 1) { transicion(terminar, 'adelante'); return; }
      const cierra = finTramo(paso);
      paso += 1;
      guardaPaso();
      transicion(cierra ? cierreTramo : tarjeta, 'adelante');
    };

    // Fin de un tramo: lo hecho, la meta del día y elegir entre seguir o dejarlo aquí (se retoma en el siguiente tramo).
    function cierreTramo() {
      const hecho = tarjetas[paso - 1].tramo;
      apuntaTramo(hecho);
      barra.set(`Tramo ${hecho + 1} de ${k} hecho`, paso / n);
      const titulo = `Tramo ${hecho + 1} de ${k} hecho`;
      setChildren(cont, cierre({ icono: '✅', titulo, tit, lineas: [L.titulo], logros: logrosClase().slice(1), stats: cifrasCierre(progress),
        botones: [h('button.grande', { type: 'button', onclick: () => transicion(tarjeta, 'adelante') }, `Seguir con el tramo ${hecho + 2} (unos ${minutosTramo(tarjetasEn(hecho + 1), ritmo())} min)`),
          h('a.btn.secondary.grande', { href: tlink(tit) }, 'Terminar por hoy')] }));
      summaryText = `CLASE ${L.id} · tramo ${hecho + 1}/${k} hecho`;
      window.scrollTo(0, 0);
    }
    const anterior = h('button.secondary.boton-anterior', { type: 'button', 'aria-label': 'Anterior', onclick: irAnterior }, '←');
    const siguiente = h('button.grande', { type: 'button', onclick: irSiguiente });
    // Pasar tarjeta deslizando el dedo (solo en el modo tarjeta a tarjeta y si «Siguiente» está disponible).
    deslizar(cont, {
      izquierda: () => { if (cont.querySelector('.paso-cabecera') && !siguiente.disabled) irSiguiente(); },
      derecha: () => { if (cont.querySelector('.paso-cabecera') && !anterior.disabled) irAnterior(); },
    });
    function refrescaBotones() {
      anterior.disabled = paso === 0;
      siguiente.textContent = paso === n - 1 ? 'Terminar la clase ✓' : 'Siguiente →';
      const t = tarjetas[paso];
      // Un «¿Lo pillas?» o la predicción de una lámina interactiva se responden antes de seguir.
      siguiente.disabled = (t.tipo === 'check' || t.tipo === 'toca' || t.tipo === 'emparejar' || (t.tipo === 'ilustracion' && pidePrediccion(t.spec))) && !checkOk.has(paso);
    }

    function tarjeta() {
      const p = tarjetas[paso];
      checkOk.delete(paso); // una pregunta rápida (o una predicción) se vuelve a responder al volver a ella
      const et = enTramo(paso);
      // La barra y el contador miden lo mismo: el tramo en curso.
      barra.set(k > 1 ? `Tramo ${et.t + 1} de ${k} · ${et.j}/${et.m}` : `Tarjeta ${paso + 1} de ${n}`, k > 1 ? et.j / et.m : (paso + 1) / n);
      const escuchar = voice.supported ? h('button.secondary.small.escuchar', { type: 'button', 'aria-label': 'Escuchar esta tarjeta', title: 'Escuchar', onclick: () => voice.speak(speechOf(p)) }, icono('escuchar')) : null;
      setChildren(cont,
        volverOrigen(),
        h('div.pasos', h('div.paso-cabecera', paso ? h('p.rotulo-tema', L.titulo) : h('span'),
          h('span.paso-botones', episodio && paso ? h('a.btn.secondary.small.escuchar', { href: enlacePodcast, title: 'Escuchar el podcast de esta clase', 'aria-label': 'Podcast de esta clase' }, icono('podcast')) : null, escuchar)),
          pasoEl(p, paso)),
        // A mano durante toda la clase (salvo en la primera tarjeta, que ya la enseña): la base del PER.
        paso && base.length ? h('details.base-per-chip', h('summary', `🔁 Base del PER (${base.length})`), listaBase()) : null,
        // Lo secundario, junto y plegado. «Terminar ya» solo pasada la mitad: al principio daría la clase por vista sin leerla.
        h('details.mas-opciones', h('summary', '⋯ Más opciones'),
          h('ul',
            h('li', h('a', { href: '#', onclick: (ev) => { ev.preventDefault(); voice.stop(); verTodas(); } }, 'Ver todas las tarjetas seguidas')),
            paso >= Math.ceil(n / 2) && paso < n - 1 ? h('li', h('a', { href: '#', onclick: (ev) => { ev.preventDefault(); voice.stop(); terminar(); } }, 'Terminar ya la clase ✓')) : null,
            h('li', avisoError(`Clase ${L.id} «${L.titulo}», tarjeta ${paso + 1} de ${n}`, p.titulo ?? p.tipo)))),
        h('div.fila-inferior', anterior, siguiente));
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

    const logrosClase = () => [`Clase vista: ${L.titulo}`,
      enClase.respondidas ? `${enClase.aciertos} de ${enClase.respondidas} ${enClase.respondidas === 1 ? 'pregunta' : 'preguntas'} de examen bien por el camino` : null].filter(Boolean);

    // --- final: chuleta, práctica y material para profundizar
    function terminar() {
      paso = 0;
      progress.saveLeccion(L.id, { ...reg(), visto: true, paso: 0, tramo: 0 });
      apuntaTramo(tarjetas[n - 1].tramo); // el último tramo (los anteriores se apuntaron al cerrarlos)
      barra.set('Clase terminada', 1);
      // El podcast que trata esta clase, si ya tiene audio.
      const escucha = episodio ? h('p.radio-clase', h('a.btn.secondary', { href: enlacePodcast }, `🎧 Escúchalo: «${episodio.titulo}» (${minPodcast} min)`)) : null;
      const extra = [
        escucha,
        dondeEncaja(tit, L.id),
        L.carta?.length ? h('details', h('summary', '🗺️ En la carta'), h('ul', L.carta.map((x) => (getExercise(x) ? h('li', h('a', { href: link(['ej', x]) }, getExercise(x).title)) : null)))) : null,
        pasosExtra.length ? h('details.saber-mas', h('summary', `📚 Para saber más (${pasosExtra.length}) · no cae en el examen`), h('div.pasos.todas', pasosExtra.map((p) => pasoEl(p, -1)))) : null,
        L.profundizar?.length ? h('details', h('summary', '📚 Para profundizar'), h('ul', L.profundizar.map((r) => h('li', h('a', { href: r.url, target: '_blank', rel: 'noopener' }, r.titulo))))) : null,
        base.length ? h('details', h('summary', '🔁 Repaso del PER'), listaBase()) : null,
      ];
      const chuleta = L.chuleta?.length ? h('section.chuleta', h('h2', '📌 Chuleta'), h('ul', L.chuleta.map((c) => h('li', inline(c)))),
        voice.supported ? h('button.small.secondary', { type: 'button', onclick: () => voice.speak(L.chuleta.map(plain).join('. ')) }, '🔊 Escuchar la chuleta') : null) : null;
      const vuelta = origen ? h('p', volverOrigen('a.btn.grande')) : null;
      if (nPractica) {
        // Practicar la afianza; si no, la clase ya cuenta como vista y se puede cerrar o pasar a lo siguiente.
        const hueco = h('div');
        setChildren(cont, vuelta, chuleta,
          h('button.grande.practicar', { type: 'button', onclick: () => practicar() }, `Practicar con ${nPractica} preguntas de examen`),
          hueco, extra);
        pintarCierre(hueco, progress, tit, { icono: '✅', titulo: 'Clase terminada', lineas: ['Cuando la practiques quedará aprendida.'], ut: L.ut, logros: logrosClase() });
      } else {
        const hueco = h('div');
        setChildren(cont, vuelta, hueco, chuleta, extra);
        pintarCierre(hueco, progress, tit, { icono: '🎉', titulo: 'Clase terminada', ut: L.ut, logros: logrosClase() });
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
        preguntas: ses, explicaciones: bank.explicaciones, progress, barra, vocab: bank.vocab, rotulo: L.titulo,
        onSummary: (t) => { summaryText = `CLASE ${L.id} práctica\n${t}`; },
        onFin: (ok, total, min) => {
          const acierto = ok / total;
          progress.saveLeccion(L.id, { ...trasPractica(reg(), acierto), paso: 0 });
          progress.logActividad(min);
          barra.remove();
          const logros = [`${ok} de ${total} ${total === 1 ? 'pregunta' : 'preguntas'} de examen bien`, acierto >= APROBADO ? `Clase aprendida: ${L.titulo}` : null].filter(Boolean);
          pintarCierre(cont, progress, tit, acierto >= APROBADO
            ? { icono: '🎉', titulo: 'Clase aprendida', lineas: ['Volverá dentro de unos días para afianzarla.'], ut: L.ut, logros }
            : { icono: '💪', titulo: `${ok} de ${total}`, lineas: ['Casi. Mañana la repasamos.'], ut: L.ut, logros });
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

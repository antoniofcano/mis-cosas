// #/<tit>/nivel[?repetir=1] — test de nivel por conceptos (src/course/nivel.js): «¿Ya sabes algo?». Unas 20 preguntas
// adaptativas del estudio del banco activo; al acabar, el punto de partida (bloques e ideas), las clases que ya sabe
// (con «Saltar estas clases», que no las marca como vistas) y por dónde empieza. Uno por eje y titulación: si ya está
// hecho, enseña el resultado (repetirlo, desde Más, con confirmación). Sin etiquetas en el banco, solo un aviso.
//
// Las respuestas cuentan como cualquier respuesta (dominio de cada idea, aciertos del tema) pero no entran en la cola
// de repaso ni cuentan como simulacro: progress.recordExam(…, { nivel: true }) y nada de recordTest.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, currentEje } from '../titulacion.js';
import { barraActividad, avisoBreve } from '../actividad.js';
import { cargarBanco, cargarCurso } from '../../bancos/index.js';
import { conceptosDelBanco } from '../concepto.js';
import { tandaPreguntas, prepareTheory } from './theory.js';
import {
  nuevoNivel, siguienteNivel, responderNivel, estimadasNivel, resultadoNivel, clasesQueSabes, puntoDePartida, minutosNivel, VERSION_NIVEL, MAX_PREGUNTAS,
} from '../../course/nivel.js';
import { ordenRuta } from '../../course/ruta.js';
import { estadoLeccion } from '../../course/engine.js';
import { randomSeed } from '../../math/rng.js';
import { cuenta } from '../../texto.js';
import { conIcono } from '../iconos.js';

const claveEnCurso = (eje, tit) => `nivelEnCurso_${eje}_${tit}`;
/** Ajuste de «Ahora no» en la oferta de Hoy. */
export const claveNoNivel = (eje, tit) => `nivelNo_${eje}_${tit}`;

/** El test a medias de este banco (o null). */
export function nivelEnCurso(progress, eje, tit) {
  const s = progress.settings()[claveEnCurso(eje, tit)];
  return s && s.v === VERSION_NIVEL && s.eje === eje && s.tit === tit && Array.isArray(s.hechas) ? s : null;
}

/**
 * Salta clases que el alumno ya sabe: quedan «saltadas» (src/course/engine.js), no vistas; el plan deja de
 * proponerlas y siguen en el Temario. Solo las que no ha empezado.
 */
export function saltarClases(progress, ids) {
  const t = new Date().toISOString();
  let n = 0;
  for (const id of ids) {
    const reg = progress.leccion(id);
    if (reg?.visto || reg?.caja != null || reg?.paso) continue;
    progress.saveLeccion(id, { ...(reg ?? {}), saltada: true, saltadaT: t });
    n += 1;
  }
  return n;
}

/** La primera clase de la ruta por la que empieza (sin empezar o a medias), sin contar las que ya sabe. */
export function empiezaPor(curso, regs, respuestas, saltables = []) {
  const fuera = new Set(saltables.map((x) => x.l.id));
  const ls = ordenRuta(curso).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas).estado }));
  return (ls.find((x) => x.e === 'empezada') ?? ls.find((x) => x.e === 'nueva' && !fuera.has(x.l.id)))?.l ?? null;
}

const DETALLE = { sabe: 'Lo sabes', 'a-medias': 'A medias: lo verás en sus clases', flojo: 'Empieza por aquí' };

export function nivelView({ ctx, progress, params: route, tit }) {
  const T = TITULACIONES[tit];
  const eje = currentEje(progress);
  const cont = h('div.nivel', h('p.muted', 'Preparando el test…'));
  const el = h('div.nivel-pantalla', cont);
  let summaryText = `VISTA test de nivel ${T.sigla} (cargando)`;

  Promise.all([cargarBanco(eje, tit), conceptosDelBanco(eje, tit), cargarCurso(tit, eje)]).then(([banco, ic, curso]) => {
    const clave = banco.eje.id;
    if (!ic) {
      setChildren(cont, h('h1', 'Test de nivel'),
        h('p', `El test de nivel aún no está disponible con los exámenes de ${banco.eje.nombre ?? 'tu comunidad'}. Empieza por la primera clase: Hoy te va guiando.`),
        h('a.btn.grande', { href: tlink(tit) }, 'Ir a Hoy'));
      summaryText = `VISTA test de nivel ${T.sigla}: no disponible (sin etiquetas en ${clave})`;
      return;
    }
    prepareTheory({ tit, chart: ctx?.chart, reglas: banco.reglasDe });
    const guardar = (st) => progress.setSetting(claveEnCurso(clave, tit), st);
    const borrar = () => progress.setSetting(claveEnCurso(clave, tit), null);

    // --- resultado
    const pintaResultado = (r, { recien = false } = {}) => {
      const respuestas = progress.get().exams;
      const regs = progress.lecciones();
      const p = puntoDePartida(r, ic, respuestas);
      const saltables = clasesQueSabes({ curso, ic, respuestas, regs, nivel: r, tit });
      const primera = empiezaPor(curso, regs, respuestas, saltables);
      const saltarBox = h('section.nivel-saltar');
      const pintaSaltar = () => {
        const xs = clasesQueSabes({ curso, ic, respuestas: progress.get().exams, regs: progress.lecciones(), nivel: r, tit });
        if (!xs.length) { setChildren(saltarBox, h('p.muted.small', 'Las clases que ya sabías no se cuentan como vistas: siguen en el Temario.')); return; }
        setChildren(saltarBox,
          h('h2.eti', `Clases que ya sabes (${xs.length})`),
          h('ul.nivel-clases', xs.slice(0, 8).map((x) => h('li', x.l.titulo)), xs.length > 8 ? h('li.muted', `y ${cuenta(xs.length - 8, 'clase')} más`) : null),
          h('p.muted.small', 'Acertaste sus ideas en el test o ya las dominas. Si las saltas, tu plan no te las propone; no se marcan como vistas y siguen en el Temario por si quieres darlas.'),
          h('button.grande', { type: 'button', onclick: () => {
            const n = saltarClases(progress, xs.map((x) => x.l.id));
            avisoBreve(`Te saltas ${cuenta(n, 'clase')} que ya sabes.`);
            setChildren(saltarBox, h('p.ok', `Hecho: te saltas ${cuenta(n, 'clase')}. Siguen en el Temario.`));
            const ya = empiezaPor(curso, progress.lecciones(), progress.get().exams);
            setChildren(empieza, ya ? ['Empiezas por ', h('strong', `«${ya.titulo}»`), '.'] : 'Ya has visto todas las clases: toca mezclar temas.');
          } }, xs.length === 1 ? 'Ya lo sabes: saltar esta clase' : `Ya lo sabes: saltar estas ${cuenta(xs.length, 'clase')}`));
      };
      pintaSaltar();
      const ofrece = saltables.some((x) => !progress.leccion(x.l.id)?.saltada);
      const empieza = h('p.nivel-empieza', primera ? [ofrece ? 'Si saltas lo que ya sabes, empiezas por ' : 'Empiezas por ', h('strong', `«${primera.titulo}»`), '.'] : 'Ya has visto todas las clases: toca mezclar temas.');
      setChildren(cont,
        h('h1', recien ? 'Tu punto de partida' : 'Tu test de nivel'),
        h('p.nivel-linea', `Has acertado ${r.aciertos} de ${cuenta(r.total, 'pregunta')}: dominas ${p.sabidas} de ${cuenta(p.total, 'idea')} del test.`),
        empieza,
        h('section.nivel-bloques', h('h2.eti', 'Por bloques'),
          h('ul.nivel-lista', r.bloques.map((b) => h('li', { class: `b-${b.estado}` },
            h('span.punto', { 'aria-hidden': 'true' }),
            h('span.tx', h('strong', b.nombre), h('span.muted.small', `${DETALLE[b.estado]} · ${b.bien} de ${b.total} bien`)))))),
        saltarBox,
        h('a.btn.grande', { href: tlink(tit) }, 'Ir a Hoy'),
        recien ? null : h('button.linklike.nivel-repetir', { type: 'button', onclick: () => {
          if (confirm('¿Repetir el test de nivel? El resultado nuevo sustituye al anterior. Lo que respondas cuenta como cualquier respuesta.')) location.hash = tlink(tit, ['nivel'], { repetir: '1' });
        } }, 'Repetir el test de nivel'));
      summaryText = `VISTA test de nivel ${T.sigla} · RESULTADO: ${r.aciertos}/${r.total} bien · dominas ${p.sabidas} de ${p.total} ideas del test\n` +
        `BLOQUES: ${r.bloques.map((b) => `${b.nombre} ${b.estado} (${b.bien}/${b.total})`).join(' · ')}\n` +
        `SALTABLES: ${saltables.map((x) => x.l.id).join(', ') || '—'} · EMPIEZA POR: ${primera?.id ?? '—'}`;
    };

    // --- el test
    const correr = (st0) => {
      let st = st0;
      guardar(st);
      let actual = siguienteNivel(st, ic, tit, curso, progress.get().exams);
      if (!actual) { terminar(st); return; }
      const barra = barraActividad({ texto: 'Test de nivel', onSalir: () => { avisoBreve('Test guardado: sigues por donde lo dejas.'); location.hash = tlink(tit); } });
      const preguntas = [banco.porId.get(actual.q)];
      setChildren(el, barra, cont);
      setChildren(cont, tandaPreguntas({
        preguntas, explicaciones: banco.explicaciones, progress, barra, temaEnCadaPregunta: true, rotulo: conIcono('diana', 'Test de nivel'),
        registrar: (q, k, ok) => progress.recordExam(q.id, { choice: k, ok, nivel: true }),
        contador: () => {
          const est = Math.max(estimadasNivel(st), st.hechas.length + 1);
          return { texto: `Pregunta ${Math.min(st.hechas.length + 1, MAX_PREGUNTAS)} de unas ${est}`, fraccion: st.hechas.length / est };
        },
        alResponder: (i, q, ok) => {
          st = responderNivel(st, actual, ok);
          guardar(st);
          actual = siguienteNivel(st, ic, tit, curso, progress.get().exams);
          if (actual) preguntas.push(banco.porId.get(actual.q));
          return !ok && actual?.tipo === 'facil' ? 'La siguiente es más sencilla, del mismo bloque.' : null;
        },
        onFin: (ok, n, min) => { progress.logActividad(min); barra.remove(); terminar(st); window.scrollTo(0, 0); },
        onSummary: (t) => { summaryText = `VISTA test de nivel ${T.sigla} · ${cuenta(st.hechas.length, 'respondida')}\n${t}`; },
      }));
    };
    const terminar = (st) => {
      const r = resultadoNivel(st, ic.catalogo);
      if (r.total) progress.recordNivel(clave, tit, r);
      borrar();
      setChildren(el, cont);
      if (r.total) pintaResultado(r, { recien: true });
      else setChildren(cont, h('h1', 'Test de nivel'), h('p', 'No hay preguntas para el test en este banco.'), h('a.btn.grande', { href: tlink(tit) }, 'Ir a Hoy'));
    };

    // --- la entrada
    const enCurso = nivelEnCurso(progress, clave, tit);
    const hecho = progress.nivel(clave, tit);
    if (route.query.repetir === '1' && enCurso) borrar();
    if (enCurso && route.query.repetir !== '1') { correr(enCurso); return; }
    if (hecho && route.query.repetir !== '1') { pintaResultado(hecho); return; }
    const borrador = nuevoNivel(ic, tit, curso, { eje: clave, seed: randomSeed(), respuestas: progress.get().exams });
    if (!borrador.sondas.length) {
      setChildren(cont, h('h1', 'Test de nivel'), h('p', 'No hay preguntas para el test en este banco.'), h('a.btn.grande', { href: tlink(tit) }, 'Ir a Hoy'));
      return;
    }
    const min = minutosNivel(borrador);
    setChildren(cont,
      h('p.eti', `Test de nivel · ${T.sigla}`),
      h('h1', '¿Ya sabes algo?'),
      h('p.nivel-intro', `Unas ${cuenta(borrador.sondas.length + 2, 'pregunta')} de todo el temario, unos ${cuenta(min, 'minuto')}. Si aciertas, pasamos a otra cosa; si fallas, te pongo una más sencilla del mismo bloque.`),
      h('ul.nivel-reglas',
        h('li', 'Si no sabes una, pulsa «No la sé»: el test sirve si no adivinas.'),
        h('li', 'Al final ves tu punto de partida y puedes saltarte las clases que ya sabes.'),
        h('li', 'Cuenta como práctica: no es un simulacro y lo que falles no se te acumula para repasar.')),
      h('button.grande', { type: 'button', onclick: () => correr(borrador) }, 'Empezar el test'),
      h('a.btn.secondary.grande', { href: tlink(tit) }, 'Ahora no'));
    summaryText = `VISTA test de nivel ${T.sigla} · INTRO: ${borrador.sondas.length} sondas, ~${min} min · bloques ${[...new Set(borrador.sondas.map((s) => s.bloque))].join(', ')}`;
  }).catch((e) => setChildren(cont, h('p.warn', `No se pudo preparar el test: ${e.message}`)));
  return { el, summary: () => summaryText };
}

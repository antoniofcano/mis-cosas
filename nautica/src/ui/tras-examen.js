// Antes y después del examen real en la interfaz (la lógica, en src/course/tras-examen.js):
// - la tabla «Tus fallos por materia» bajo «¿Estás listo?» (Hoy y Travesía);
// - la foto de la predicción, que se guarda sola en la semana del examen;
// - el resultado por materia tras «¿Cómo te fue?», con la comparación frente a la foto;
// - el aviso del módulo que queda (PY) y el botón para dejar de centrarse en él.
// Todo se guarda en el ajuste `semana_<tit>` (compartido entre aparatos).

import { h, setChildren, copyText } from './dom.js';
import { TITULACIONES, tlink } from './titulacion.js';
import { claveSemana, leerAjuste, guardarFoto, apuntarResultado, descartarModulo, responderComoFue, RESPUESTAS_FUE } from '../course/semana.js';
import {
  fallosPorMateria, fotoPrediccion, tocaFoto, leerResultado, modulosAprobados, aptoCompleto, compararPrediccion,
  textoComparacion, lineaModuloPendiente, DIAS_RESULTADO,
} from '../course/tras-examen.js';
import { estructuraModulo } from '../theory/blocks.js';
import { diasHasta } from '../course/plan.js';
import { cuenta, fechaLarga } from '../texto.js';
import { randomSeed } from '../math/rng.js';

const ajuste = (progress, tit) => leerAjuste(progress.settings()[claveSemana(tit)]);
const guardar = (progress, tit, a) => progress.setSetting(claveSemana(tit), a);
const repintar = () => dispatchEvent(new HashChangeEvent('hashchange'));

/** La estructura y los exámenes con los que se mide al alumno: los del módulo que le queda, si le queda uno. */
export function medida(tit, st) {
  const E = TITULACIONES[tit].estructura;
  const id = st.moduloPendiente?.id ?? null;
  // Los fallos por materia solo leen `porTema`: valen todos los exámenes, en su orden.
  return { estructura: id ? estructuraModulo(E, id) : E, tests: st.datos?.tests ?? [] };
}

const ESTADO_ETI = { holgado: 'Holgado', justo: 'Justo', pasado: 'Pasado' };
const num = (x) => (x == null ? '—' : String(x).replace('.', ','));

/**
 * «Tus fallos por materia»: en tus últimos exámenes, cuántas fallaste en cada materia frente a su límite.
 * null si aún no hay ningún examen que lo diga.
 */
export function tablaFallos(tit, st) {
  const { estructura, tests } = medida(tit, st);
  const r = fallosPorMateria(estructura, tests);
  if (!r.examenes) return null;
  const celda = (fs) => (fs.length ? fs.join(' · ') : '—');
  const fila = (nombre, fs, lim, notaLim, estado) => h('tr', { class: estado ? `fxm-${estado}` : '' },
    h('th', { scope: 'row' }, nombre),
    h('td.fxm-num', celda(fs)),
    h('td.fxm-num', lim == null ? '—' : String(lim), notaLim ? h('span.fxm-nota', notaLim) : null),
    h('td', estado ? ESTADO_ETI[estado] : '—'));
  return h('section.fallos-materia', { 'aria-labelledby': 'fxm-t' },
    h('h3#fxm-t', 'Tus fallos por materia'),
    h('p.muted.small', `En tus ${cuenta(r.examenes, 'último examen', 'últimos exámenes')}, el más reciente primero. Se suspende por pasarse en una sola materia, aunque la nota total dé.`),
    h('div.fxm-tabla-caja', h('table.fxm-tabla',
      h('thead', h('tr', h('th', { scope: 'col' }, 'Materia'), h('th', { scope: 'col' }, 'Fallos'), h('th', { scope: 'col' }, 'Límite'), h('th', { scope: 'col' }, 'Vas'))),
      h('tbody',
        r.materias.map((m) => fila(m.corto, m.fallos, m.limite ?? m.limiteModulo, m.limite == null && m.limiteModulo != null ? 'por módulos' : null, m.estado)),
        r.total.fallos.length ? fila('Total', r.total.fallos, r.total.limite, null, r.total.estado) : null))),
    r.materias.some((m) => m.estado === 'justo' || m.estado === 'pasado')
      ? h('p.small', `Prioriza ${r.materias.filter((m) => m.estado === 'pasado' || m.estado === 'justo').sort((a, b) => (b.estado === 'pasado') - (a.estado === 'pasado')).map((m) => m.corto).join(' y ')}: es donde un despiste suspende.`) : null);
}

/**
 * En la semana del examen, hasta la víspera, guarda la foto de lo que predice la app (una vez al día; se queda la
 * última). No pinta nada. Devuelve true si ha guardado.
 */
export function fotografiar(progress, tit, st, estadoSemana, ahora = Date.now()) {
  const fecha = estadoSemana?.activo ? estadoSemana.fecha : null;
  const a = ajuste(progress, tit);
  if (!tocaFoto(a.fotos, fecha, estadoSemana?.dias, ahora) || !st?.listo) return false;
  const { estructura, tests } = medida(tit, st);
  guardar(progress, tit, guardarFoto(a, fecha, fotoPrediccion(st.listo, fallosPorMateria(estructura, tests), ahora)));
  return true;
}

/**
 * Apuntar el resultado del examen de `fecha` (cuántas fallaste en cada materia; en el PY, si aprobaste un módulo) y,
 * guardado, la comparación con la foto de la predicción. `fue`: lo que contestó en «¿Cómo te fue?».
 */
export function tarjetaResultado(progress, tit, fecha, fue) {
  const T = TITULACIONES[tit];
  const E = T.estructura;
  const caja = h('section.resultado-examen', { 'aria-labelledby': `res-${tit}-t` });
  const pintar = () => {
    const a = ajuste(progress, tit);
    const r = leerResultado(a.resultados[fecha], E);
    setChildren(caja, r ? comparacion(r) : formulario(a, null));
  };
  const formulario = (a, previo) => {
    const sels = E.bloques.map((b) => {
      const s = h(`select#res-${tit}-${b.ut}`, h('option', { value: '' }, 'No lo sé'),
        Array.from({ length: b.n + 1 }, (_, i) => h('option', { value: String(i), selected: previo?.fallos?.[b.ut] === i }, String(i))));
      return { b, s };
    });
    const conModulos = E.modulos?.length && fue === 'suspenso';
    const radios = conModulos ? h('fieldset.res-modulos',
      h('legend', '¿Aprobaste algún módulo?'),
      h('p.muted.small', 'Si rellenas los fallos de todas las materias se calcula solo.'),
      [['ninguno', 'Ninguno'], ...E.modulos.map((m) => [m.id, m.titulo]), ['', 'No lo sé']].map(([v, t]) => h('label.res-radio',
        h('input', { type: 'radio', name: `res-mod-${tit}`, value: v, checked: (previo?.modulo ?? '') === v }), ` ${t}`))) : null;
    return h('form.res-form', { onsubmit: (ev) => {
      ev.preventDefault();
      const fallos = Object.fromEntries(sels.filter(({ s }) => s.value !== '').map(({ b, s }) => [b.ut, Number(s.value)]));
      let modulo = null;
      if (conModulos) {
        const ms = modulosAprobados(E, fallos);
        const calc = ms?.every((m) => m.aprobado != null) ? (ms.find((m) => m.aprobado)?.id ?? 'ninguno') : null;
        modulo = calc ?? (caja.querySelector(`input[name="res-mod-${tit}"]:checked`)?.value || null);
      }
      guardar(progress, tit, apuntarResultado(ajuste(progress, tit), fecha, { fallos, modulo }));
      pintar();
      repintar();
    } },
    h('h2', { id: `res-${tit}-t` }, '¿Cuántas fallaste en cada materia?'),
    h('p.muted.small', 'Con la plantilla de respuestas, cuando salga. Es voluntario: sirve para ver si la app acertó contigo y para afinarla.'),
    h('div.res-materias', sels.map(({ b, s }) => h('div.res-materia', h('label', { for: s.id }, b.titulo), s))),
    radios,
    h('div.semana-fue-botones', h('button', { type: 'submit' }, 'Guardar'), previo ? h('button.linklike', { type: 'button', onclick: pintar }, 'Cancelar') : null));
  };
  const comparacion = (r) => {
    const a = ajuste(progress, tit);
    const c = compararPrediccion(E, a.fotos[fecha] ?? null, r);
    const apto = aptoCompleto(E, r.fallos);
    const texto = textoComparacion(T.sigla, fecha, RESPUESTAS_FUE[fue] ?? fue, c, r);
    const aviso = h('span.muted.small', { role: 'status' });
    return [
      h('h2', { id: `res-${tit}-t` }, 'Lo que dijo la app y lo que pasó'),
      c.dia ? h('p', `El ${fechaLarga(c.dia, { diaSemana: false })} la app decía: aprobarías ${c.prob != null ? `unas ${Math.round(c.prob * 10)} de cada 10 veces` : '(sin datos suficientes)'}.`)
        : h('p.muted', 'No hay foto de la predicción de ese examen: se guarda sola en la semana del examen, con la fecha puesta.'),
      apto != null && (apto ? fue !== 'aprobado' : fue === 'aprobado') ? h('p.small', 'Ojo: con esos fallos la cuenta no coincide con lo que contestaste. Revisa los números.') : null,
      h('div.fxm-tabla-caja', h('table.fxm-tabla',
        h('thead', h('tr', h('th', { scope: 'col' }, 'Materia'), h('th', { scope: 'col' }, h('abbr', { title: 'Fallos que preveía la app (media de tus últimos exámenes)' }, 'App')), h('th', { scope: 'col' }, 'Real'), h('th', { scope: 'col' }, h('abbr', { title: 'Límite de fallos' }, 'Máx.')), h('th', { scope: 'col' }, 'Acertó'))),
        h('tbody', c.filas.map((f) => h('tr', h('th', { scope: 'row' }, f.corto), h('td.fxm-num', num(f.previsto)), h('td.fxm-num', num(f.real)), h('td.fxm-num', num(f.limite)),
          h('td', f.acierto == null ? '—' : f.acierto ? 'Sí' : 'No')))))),
      c.comparables ? h('p.small', `La app acertó en ${c.aciertos} de ${cuenta(c.comparables, 'materia')} con límite: avisaba de ir justo donde ibas justo, y no donde no.`) : null,
      r.modulo && r.modulo !== 'ninguno' ? h('p.small', `Módulo aprobado: ${E.modulos.find((m) => m.id === r.modulo)?.titulo ?? r.modulo}.`) : null,
      h('div.semana-fue-botones',
        h('button.secondary', { type: 'button', onclick: () => copyText(texto).then(() => { aviso.textContent = 'Copiado.'; }, () => { aviso.textContent = 'No se ha podido copiar.'; }) }, 'Copiar para enviar'),
        h('button.linklike', { type: 'button', onclick: () => setChildren(caja, formulario(a, r)) }, 'Cambiar'),
        aviso),
    ];
  };
  pintar();
  return caja;
}

/**
 * Los exámenes pasados (hace 120 días o menos) con respuesta «Aprobé» o «No aprobé», para la vista de la semana: el
 * resultado por materia o el formulario para apuntarlo.
 */
export function resultadosRecientes(progress, tit, ahora = Date.now()) {
  const a = ajuste(progress, tit);
  return Object.entries(a.fue)
    .filter(([f, r]) => ['aprobado', 'suspenso', 'no-se'].includes(r) && (() => { const d = diasHasta(f, ahora); return d != null && d < 0 && d >= -DIAS_RESULTADO; })())
    .sort(([x], [y]) => y.localeCompare(x))
    .slice(0, 2)
    .map(([f, r]) => (r === 'no-se' ? yaLoSe(progress, tit, f) : tarjetaResultado(progress, tit, f, r)));
}

/** Contestaste «Aún no lo sé»: cuando salga la nota, se apunta aquí. */
function yaLoSe(progress, tit, fecha) {
  const T = TITULACIONES[tit];
  const responder = (r) => { guardar(progress, tit, responderComoFue(ajuste(progress, tit), fecha, r)); repintar(); };
  return h('section.semana-fue', { 'aria-labelledby': `yalose-${tit}` },
    h('h2', { id: `yalose-${tit}` }, `¿Ya sabes la nota del examen de ${T.sigla}?`),
    h('p.muted.small', `Era el ${fechaLarga(fecha, { diaSemana: false })}.`),
    h('div.semana-fue-botones', ['aprobado', 'suspenso'].map((r) => h('button.secondary', { type: 'button', onclick: () => responder(r) }, RESPUESTAS_FUE[r]))));
}

/** El aviso del módulo que queda (PY), con el simulacro del módulo y la salida. null si no queda ninguno. */
export function avisoModulo(progress, tit, st) {
  const p = st.moduloPendiente;
  if (!p) return null;
  const T = TITULACIONES[tit];
  return h('section.modulo-pendiente', { 'aria-labelledby': `modp-${tit}` },
    h('h2', { id: `modp-${tit}` }, `Te queda el ${p.titulo.replace(/^Módulo/, 'módulo')}`),
    h('p', lineaModuloPendiente(p, T.sigla)),
    h('p.muted.small', '«¿Estás listo?» y la semana del examen miran ahora solo este módulo. Te examinarás solo de él, con su tiempo.'),
    h('div.semana-fue-botones',
      h('a.btn', { href: tlink(tit, ['test', 'simulacro'], { s: randomSeed(), m: p.id }) }, `Simulacro del ${p.titulo.replace(/^Módulo/, 'módulo')}`),
      h('button.linklike', { type: 'button', onclick: () => {
        if (!confirm('¿Volver a preparar el examen entero? Puedes volver a apuntar el módulo aprobado desde «La semana del examen».')) return;
        guardar(progress, tit, descartarModulo(ajuste(progress, tit), p.desde));
        repintar();
      } }, 'Prepararlo entero')));
}

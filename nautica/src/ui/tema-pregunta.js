// «¿No es de este tema?»: el alumno corrige el tema (y, si quiere, la clase) de una pregunta que está estudiando
// (docs/BANCOS.md, «Correcciones del alumno»). La corrección es suya: se guarda con su progreso (y se sincroniza entre
// sus aparatos, docs/SYNC.md), cambia su estudio al momento y no toca el banco. Después se le ofrece avisar al autor por
// la vía de «Avisar de un error» (src/ui/aviso-error.js), con todo ya escrito y sin obligarle a nada.
//
//   accionTema(q)                  el enlace discreto que va junto a «Avisar de un error» (tras responder en tandas,
//                                  repaso y clases, en la vista de la pregunta y en la revisión de un examen terminado)
//   seccionCorrecciones(progress)  Ajustes → «Mis correcciones»: verlas, deshacerlas y enviarlas al autor
//
// Nunca durante un examen en curso: con el modo examen puesto (src/ui/modo-examen.js) no se pinta ni se abre.

import { h, setChildren, copyText } from './dom.js';
import { conIcono } from './iconos.js';
import { link } from './router.js';
import { modoExamen } from './modo-examen.js';
import { TITULACIONES, bloque } from '../theory/blocks.js';
import { cargarCursoBase, pregunta } from '../bancos/index.js';
import { textoCorrecciones } from '../bancos/correcciones.js';
import { REPO_ISSUES } from './aviso-error.js';
import { cuenta } from '../texto.js';

let progreso = null;
/** La app dice dónde se guardan las correcciones (el almacén del progreso). Sin él, la acción no se ofrece. */
export const iniciarTemaPregunta = (p) => { progreso = p; };

const MAX_EN_ENLACE = 20; // correcciones que caben con holgura en la dirección de una incidencia
const estructuraDe = (tit) => (TITULACIONES[tit] ?? TITULACIONES.per).estructura;
const tituloTema = (tit, ut) => bloque(estructuraDe(tit), ut)?.titulo ?? `Tema ${ut}`;

/** Tema que la pregunta tiene en el banco y el que tiene para el alumno (su corrección, si vale). */
function temasDe(q) {
  const E = estructuraDe(q.tit);
  const utBanco = q.utBanco ?? q.ut;
  const c = progreso?.correccionDe(q.id) ?? null;
  const vale = !!c && !!bloque(E, c.ut) && (c.ut !== utBanco || !!c.clase);
  return { utBanco, corr: vale ? c : null, ut: vale ? c.ut : utBanco };
}

/** Dirección de la incidencia de GitHub con las correcciones ya escritas (el alumno no tiene que escribir nada). */
export function urlAvisoTema(lista, texto) {
  const una = lista.length === 1 ? lista[0] : null;
  const title = una
    ? `Tema de una pregunta: ${una.id} (${una.de === una.ut ? `clase ${una.clase}` : `del tema ${una.de} al ${una.ut}`})`
    : `Tema de ${cuenta(lista.length, 'pregunta')}`;
  // La dirección tiene un tope de tamaño: con muchas, van las primeras y el resto se manda con «Copiar el aviso».
  const lineas = texto.split('\n');
  if (lineas.length > MAX_EN_ENLACE) texto = [...lineas.slice(0, MAX_EN_ENLACE), `(…y ${lineas.length - MAX_EN_ENLACE} más)`].join('\n');
  const body = ['Un alumno ha corregido en la app el tema de estas preguntas (acción «¿No es de este tema?»):', '', texto, '',
    'Enviado desde la app; no hace falta añadir nada.', ''].join('\n');
  return `${REPO_ISSUES}?${new URLSearchParams({ title, body })}`;
}

/** Texto del aviso al autor para una lista de correcciones ({ id, eje, tit, de, ut, clase }), con los títulos de las clases. */
async function textoAviso(lista) {
  const cursos = new Map();
  for (const tit of new Set(lista.filter((c) => c.clase).map((c) => c.tit))) cursos.set(tit, await cargarCursoBase(tit).catch(() => null));
  const tituloClase = (id) => [...cursos.values()].flatMap((c) => c?.modulos ?? []).flatMap((m) => m.lecciones ?? []).find((l) => l.id === id)?.titulo ?? id;
  return textoCorrecciones(lista, { titulo: tituloTema, tituloClase });
}

/** Botones para avisar al autor (opcional): la incidencia de GitHub ya rellenada o copiar el texto para mandarlo como sea. */
function envioAutor(lista) {
  const gh = h('a.btn.secondary', { href: REPO_ISSUES, target: '_blank', rel: 'noopener' }, conIcono('aviso', 'Avisar al autor'));
  const copiado = h('span.small.muted', { 'aria-live': 'polite' });
  let texto = textoCorrecciones(lista, { titulo: tituloTema });
  const pon = () => { gh.href = urlAvisoTema(lista, texto); };
  pon();
  textoAviso(lista).then((t) => { texto = t; pon(); }).catch(() => {});
  const copiar = h('button.secondary', { type: 'button', onclick: () => {
    copyText(`Corrección de tema (app Patrón):\n${texto}`).then(() => { copiado.textContent = 'Copiado.'; }, () => { copiado.textContent = 'No se ha podido copiar.'; });
  } }, conIcono('portapapeles', 'Copiar el aviso'));
  return h('div.tema-envio',
    h('div.actions', gh, copiar, copiado),
    h('p.small.muted', 'Es opcional y va ya escrito: solo hay que enviarlo. GitHub pide una cuenta; si no tienes, copia el aviso y pásaselo a tu profesor.'));
}

/**
 * Abre el diálogo para elegir el tema correcto de una pregunta.
 * @param {object} q  la pregunta (del banco o de la vista del alumno)
 * @param {{ alCambiar?: () => void }} o
 */
export function abrirDialogoTema(q, { alCambiar = () => {} } = {}) {
  if (!progreso || modoExamen() || typeof document === 'undefined') return null;
  const tit = TITULACIONES[q.tit] ? q.tit : 'per';
  const E = estructuraDe(tit);
  const { utBanco, corr, ut: utAhora } = temasDe(q);
  let elegido = utAhora;
  let clase = corr?.clase ?? '';
  const idTitulo = `tema-dlg-${Math.random().toString(36).slice(2, 8)}`;
  const cuerpo = h('div.dialogo-tema-cuerpo');
  const dlg = h('dialog.dialogo-tema', { 'aria-labelledby': idTitulo }, cuerpo);
  const cerrar = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => dlg.remove());
  // Tocar fuera (el fondo) lo cierra, como Esc.
  dlg.addEventListener('click', (ev) => { if (ev.target === dlg) cerrar(); });

  const selClase = h('select', { id: `${idTitulo}-clase`, onchange: (ev) => { clase = ev.target.value; pintaGuardar(); } });
  const campoClase = h('label.field.tema-clase', { for: `${idTitulo}-clase`, hidden: true }, h('span.lbl', 'Clase (opcional)'), selClase);
  let curso = null;
  const pintaClases = () => {
    const clases = (curso?.modulos ?? []).filter((m) => m.ut === elegido).flatMap((m) => m.lecciones ?? []);
    if (!clases.some((l) => l.id === clase)) clase = '';
    setChildren(selClase, h('option', { value: '' }, 'Sin elegir clase'), clases.map((l) => h('option', { value: l.id, selected: l.id === clase }, l.titulo)));
    campoClase.hidden = !clases.length;
  };
  cargarCursoBase(tit).then((c) => { curso = c; pintaClases(); }).catch(() => {});

  const guardar = h('button.grande', { type: 'submit' }, 'Guardar');
  const cambia = () => elegido !== utAhora || (clase || '') !== (corr?.clase ?? '');
  function pintaGuardar() { guardar.disabled = !cambia(); }

  const radios = E.bloques.map((b) => h('label.option.tema-opcion',
    h('input', { type: 'radio', name: idTitulo, value: String(b.ut), checked: b.ut === elegido, onchange: () => { elegido = b.ut; pintaClases(); pintaGuardar(); } }),
    h('span.tema-nombre', conIcono(b.ico, b.titulo), b.ut === utBanco ? h('span.tema-oficial', 'el del examen') : null)));

  function hecho(texto, lista) {
    alCambiar();
    setChildren(cuerpo,
      h('h2', { id: idTitulo, tabindex: '-1' }, conIcono('ok', 'Hecho')),
      h('p', texto),
      lista ? [h('p', 'Si quieres, avisa al autor para que lo arregle en la app para todos:'), envioAutor(lista)] : null,
      h('div.actions.tema-final',
        h('button.grande', { type: 'button', onclick: cerrar }, 'Cerrar'),
        Object.keys(progreso.correcciones()).length ? h('a', { href: link(['ajustes'], { campo: 'correcciones' }), onclick: cerrar }, 'Ver mis correcciones') : null));
    cuerpo.querySelector('h2')?.focus();
  }

  const form = h('form', { method: 'dialog', onsubmit: (ev) => {
    ev.preventDefault();
    if (!cambia()) return;
    if (elegido === utBanco && !clase) {
      progreso.quitarCorreccion(q.id);
      hecho(`La pregunta vuelve a su tema del examen: ${tituloTema(tit, utBanco)}.`, null);
      return;
    }
    progreso.corregirTema(q.id, { ut: elegido, clase: clase || null, de: utBanco });
    hecho(elegido === utBanco
      ? 'Desde ahora esta pregunta sale en la práctica de la clase que has elegido.'
      : `Desde ahora esta pregunta cuenta en «${tituloTema(tit, elegido)}» cuando estudias, y ya no sale en «${tituloTema(tit, utBanco)}».`,
    [{ id: q.id, eje: q.eje, tit, de: utBanco, ut: elegido, clase: clase || null }]);
  } },
  h('h2', { id: idTitulo }, '¿De qué tema es esta pregunta?'),
  h('p.small.muted', corr
    ? `La tienes en «${tituloTema(tit, utAhora)}» (la cambiaste tú). En el examen salió en «${tituloTema(tit, utBanco)}».`
    : `Ahora está en «${tituloTema(tit, utBanco)}», el bloque del examen en que salió.`),
  h('fieldset.tema-opciones', h('legend', 'Tema correcto'), radios),
  campoClase,
  h('p.small.muted.tema-nota', 'Cambia solo tu estudio (tandas, Temario, repaso), en todos tus aparatos. Los exámenes y los simulacros siguen como el examen oficial. Se puede deshacer en Ajustes.'),
  h('div.actions.tema-botones',
    guardar,
    h('button.secondary.grande', { type: 'button', onclick: cerrar }, 'Cancelar'),
    corr ? h('button.linklike.tema-quitar', { type: 'button', onclick: () => {
      progreso.quitarCorreccion(q.id);
      hecho(`Corrección quitada: la pregunta vuelve a «${tituloTema(tit, utBanco)}».`, null);
    } }, conIcono('deshacer', 'Quitar mi corrección')) : null));
  setChildren(cuerpo, form);
  pintaGuardar();
  document.body.append(dlg);
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  return dlg;
}

/**
 * La acción discreta «¿No es de este tema?» de una pregunta (o «Tema cambiado: …» si el alumno ya la corrigió).
 * null durante un examen en curso o si no hay dónde guardar.
 */
export function accionTema(q) {
  if (!progreso || !q?.id || modoExamen() || !TITULACIONES[q.tit]) return null;
  const boton = h('button.linklike.tema-accion', { type: 'button', onclick: () => abrirDialogoTema(q, { alCambiar: pinta }) });
  function pinta() {
    const { corr, ut } = temasDe(q);
    boton.classList.toggle('corregida', !!corr);
    setChildren(boton, conIcono('etiqueta', corr ? `Tema cambiado: ${tituloTema(q.tit, ut)}` : '¿No es de este tema?'));
  }
  pinta();
  return boton;
}

/**
 * Ajustes → «Mis correcciones»: las preguntas cuyo tema ha cambiado el alumno, para verlas, deshacerlas y enviarlas al
 * autor. Sin correcciones, una línea que dice dónde se hacen.
 */
export function seccionCorrecciones(progress) {
  const cuerpo = h('div.correcciones-cuerpo', { 'aria-live': 'polite' });
  const sec = h('section.mis-correcciones', { id: 'mis-correcciones' }, h('h2', conIcono('etiqueta', 'Mis correcciones')), cuerpo);
  let turno = 0;
  async function pinta() {
    const mio = ++turno;
    const guardadas = Object.entries(progress.correcciones());
    if (!guardadas.length) {
      setChildren(cuerpo, h('p.muted', 'Si al estudiar ves una pregunta que no es del tema, toca «¿No es de este tema?» bajo la explicación y elige el correcto. Aquí verás tus cambios y podrás deshacerlos.'));
      return;
    }
    const filas = [];
    for (const [id, c] of guardadas.sort((a, b) => String(b[1].t ?? '').localeCompare(String(a[1].t ?? '')))) {
      const r = await pregunta(id).catch(() => null);
      filas.push({ id, c, q: r?.q ?? null, banco: r?.banco ?? null });
    }
    if (mio !== turno) return;
    const cursos = new Map();
    for (const tit of new Set(filas.filter((f) => f.q && f.c.clase).map((f) => f.q.tit))) cursos.set(tit, await cargarCursoBase(tit).catch(() => null));
    if (mio !== turno) return;
    const tituloClase = (tit, idClase) => (cursos.get(tit)?.modulos ?? []).flatMap((m) => m.lecciones ?? []).find((l) => l.id === idClase)?.titulo ?? idClase;
    const lista = filas.filter((f) => f.q).map((f) => ({ id: f.id, eje: f.q.eje, tit: f.q.tit, de: f.q.ut, ut: f.c.ut, clase: f.c.clase ?? null }));
    setChildren(cuerpo,
      h('p.muted', 'Preguntas que has cambiado de tema. Solo cambia tu estudio; los exámenes siguen como el oficial.'),
      h('ul.lista-correcciones', filas.map((f) => {
        const quitar = h('button.secondary.small', { type: 'button', 'aria-label': `Deshacer la corrección de la pregunta ${f.id}`, onclick: () => { progress.quitarCorreccion(f.id); pinta(); } }, conIcono('deshacer', 'Deshacer'));
        if (!f.q) return h('li', h('div.corr-texto', h('p.corr-enunciado', `Pregunta ${f.id}`), h('p.small.muted', 'Ya no está en la app.')), quitar);
        // Una pregunta del examen final no se enseña suelta (docs/CUARENTENA.md): solo se nombra.
        const reservada = f.banco.reservadas.has(f.id);
        const enunciado = String(f.q.enunciado ?? '');
        const igual = f.c.ut === f.q.ut && !f.c.clase;
        return h('li',
          h('div.corr-texto',
            h('p.corr-enunciado', reservada ? 'Pregunta de tu examen final' : h('a', { href: link(['q', f.id]) }, enunciado.slice(0, 110) + (enunciado.length > 110 ? '…' : ''))),
            h('p.small.corr-cambio', igual ? `El banco ya la tiene en «${tituloTema(f.q.tit, f.q.ut)}»: tu corrección ya no hace falta.`
              : [f.c.ut === f.q.ut ? `«${tituloTema(f.q.tit, f.q.ut)}»` : [`De «${tituloTema(f.q.tit, f.q.ut)}» a `, h('strong', `«${tituloTema(f.q.tit, f.c.ut)}»`)],
                f.c.clase ? ` · clase: ${tituloClase(f.q.tit, f.c.clase)}` : null]),
            h('p.small.muted', `${TITULACIONES[f.q.tit]?.sigla ?? ''} · ${f.banco.eje.nombre}`)),
          quitar);
      })),
      lista.length ? h('details.corr-enviar', h('summary', lista.length === 1 ? 'Enviar mi corrección al autor' : `Enviar mis ${cuenta(lista.length, 'corrección', 'correcciones')} al autor`), envioAutor(lista)) : null);
  }
  pinta();
  return sec;
}

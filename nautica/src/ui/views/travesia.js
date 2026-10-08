// #/<tit>/travesia — la Travesía: tu progreso como una derrota con faros (un faro por bloque del temario, se enciende con
// el 80 % de sus ideas dominadas), tu rango, la semana, lo que falta por reforzar y, aparte, las insignias
// (#/<tit>/travesia/insignias). También aquí: la carta de la derrota (cartaDerrota, que Hoy usa en compacto) y el parte que se enseña al terminar una sesión.
// Todo se calcula en src/course/travesia.js; esta pantalla solo pinta. «¿Estás listo?» y el dominio de cada idea son los
// de siempre: la travesía los lee, no los cambia. Sin etiquetas de conceptos en el banco activo no hay travesía.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { icono } from '../iconos.js';
import { calcularPlan } from '../cierre.js';
import { hrefFicha } from '../concepto.js';
import { sincronizarTravesia } from '../travesia.js';
import {
  RANGOS, FARO_ENCENDIDO, DIAS_SEMANA, BANDERA, catalogoInsignias, faltaInsignia, requisitoRango,
  posicionesDerrota, faroInicial,
} from '../../course/travesia.js';
import { lineaListo } from '../../course/listo.js';
import { cuenta, fechaLarga } from '../../texto.js';
import { deducirFase, componerSesion, terminada } from '../../course/sesion.js';
import { leerSesion } from '../sesion.js';
import { empezarSesion, marcaDerrota, pasosQueTocan } from '../entrada.js';
import { novedades, marcarVistos, claseAnimada } from '../efectos.js';

const ANCHO = 358;
const ALTO = 320;
const MAX_FLOJAS = 4;
const pct = (x) => `${Math.round(x * 100)} %`;
const ideas = (n) => cuenta(n, 'idea');

/** Fondo de la carta: mar, dos costas y la rosa de los vientos (decorativo). */
const FONDO = `<svg class="carta-fondo" viewBox="0 0 ${ANCHO} ${ALTO}" aria-hidden="true" focusable="false">
<path class="costa" d="M0 0 H66 C58 58 38 96 30 146 C22 196 4 214 0 240 Z"/>
<path class="costa" d="M236 0 H358 V126 C330 108 300 102 280 82 C262 64 248 38 236 0 Z"/>
<path class="ola" d="M70 300 C130 286 190 306 250 292 C300 281 330 292 358 284"/>
<path class="ola" d="M92 268 C150 254 200 270 260 256 C300 247 330 256 358 248"/>
<path class="ola" d="M120 140 C150 150 170 140 210 156"/>
<g class="rosa"><circle cx="322" cy="290" r="14"/><path d="M322 279 L325 290 L322 301 L319 290 Z"/><text x="322" y="276" text-anchor="middle">N</text></g>
</svg>`;

const posPct = ([x, y], alto = ALTO) => `left:clamp(52px, ${(100 * x / ANCHO).toFixed(2)}%, calc(100% - 52px)); top:${(100 * y / alto).toFixed(2)}%`;
/** En la carta compacta de Hoy las capas llegan hasta y = 360 (un poco de mar más abajo): caben los nombres de abajo. */
const ALTO_COMPACTA = 360;

/** Las patas de la derrota entre faros (la última llega a la bandera del examen). */
function patas(faros, pos) {
  const puntos = [...pos, BANDERA];
  const lineas = faros.map((f, i) => `<line class="pata ${f.estado}" x1="${puntos[i][0]}" y1="${puntos[i][1]}" x2="${puntos[i + 1][0]}" y2="${puntos[i + 1][1]}"/>`);
  return `<svg class="carta-patas" viewBox="0 0 ${ANCHO} ${ALTO}" aria-hidden="true" focusable="false">${lineas.join('')}</svg>`;
}

/**
 * La carta de la derrota: fondo, patas, un faro por bloque y la bandera del examen. La usan esta pantalla (faros que se
 * eligen: `elegir(id)`, con `sel` el elegido) y la entrada de Hoy (`compacta`: más baja, faros sin botón y la carta
 * entera es un enlace; docs/ENTRADA.md). `marca` = índice del faro con el marcador «estás aquí» (-1: en la bandera del
 * examen; null: sin marcador).
 * @returns {{ carta: HTMLElement, botones: HTMLElement[] }}  `botones` = los contenedores de cada faro
 */
export function cartaDerrota(faros, { sel = null, elegir = null, marca = null, compacta = false, recien = new Set() } = {}) {
  const pos = posicionesDerrota(faros.length);
  const alto = compacta ? ALTO_COMPACTA : ALTO;
  const marcaAqui = () => h('span.marca-aqui', { 'aria-hidden': 'true' }, icono('barco-marca'));
  const botones = faros.map((f, i) => {
    const disco = elegir
      ? h('button.faro', { type: 'button', class: `${f.estado}${recien.has(f.id) ? ` ${claseAnimada('se-enciende')}` : ''}`.trim(), 'aria-label': ariaFaro(f) + (i === marca ? '. Estás aquí' : ''), 'aria-pressed': String(f.id === sel), onclick: () => elegir(f.id) }, icono('faro'))
      : h('span.faro', { class: f.estado }, icono('faro'));
    return h('div.faro-pos', { style: posPct(pos[i], alto), class: i === marca ? 'aqui' : '' }, i === marca ? marcaAqui() : null, disco, h('span.faro-nombre', f.corto));
  });
  const carta = h('div.carta-trav', elegir ? { role: 'group', 'aria-label': 'Carta de tu derrota: un faro por bloque del temario' } : { 'aria-hidden': 'true', class: compacta ? 'compacta' : '' },
    h('div.carta-capas', { html: FONDO + patas(faros, pos) }),
    h('div.bandera-pos', { style: posPct(BANDERA, alto), class: marca === -1 ? 'aqui' : '' }, marca === -1 ? marcaAqui() : null, h('span.bandera-disco', icono('bandera')), h('span.faro-nombre', 'Examen')),
    ...botones);
  // En compacto la carta es más baja que la de 358 × 320: el fondo y las patas se estiran (los faros van en %, no se
  // deforman) y llegan hasta ALTO_COMPACTA.
  if (compacta) carta.querySelectorAll('.carta-capas svg').forEach((s) => { s.setAttribute('viewBox', `0 0 ${ANCHO} ${ALTO_COMPACTA}`); s.setAttribute('preserveAspectRatio', 'none'); });
  return { carta, botones };
}

/** Disco con el icono del rango. */
const discoRango = () => h('span.trav-disco', icono('ancla'));

/** Texto accesible de un faro. */
const ariaFaro = (f) => `${f.nombre}: ${f.dominadas} de ${ideas(f.total)} dominadas${f.estado === 'on' ? ', faro encendido' : ''}`;

function textoFaro(f) {
  if (f.estado === 'on') return `Faro encendido: llevas el ${pct(f.pct)} de las ideas de este bloque dominadas.`;
  if (!f.vistas) return 'Todavía sin empezar. Cuando trabajes sus ideas, el faro irá cogiendo luz.';
  return `Vas por el ${pct(f.pct)}. ${f.faltan === 1 ? 'Te falta 1 idea dominada' : `Te faltan ${cuenta(f.faltan, 'idea dominada', 'ideas dominadas')}`} para encender el faro (hace falta el ${pct(FARO_ENCENDIDO)}).`;
}

/**
 * La tarjeta del rango (fondo de marca): rango, ideas dominadas y la barra hacia el siguiente. La usan esta pantalla y
 * «Mi progreso» (#/progreso), con el mismo cálculo (sincronizarTravesia → progresoRango).
 */
export function tarjetaRango(sy) {
  const { est, rango } = sy;
  return h('section.trav-rango', { 'aria-label': 'Tu rango' },
    h('div.trav-rango-fila', discoRango(),
      h('div.trav-rango-tx', h('span.small', 'Tu rango'), h('strong', rango.actual.nombre)),
      h('div.trav-rango-cifra', h('b', `${est.dominadas} de ${est.total}`), h('span', 'ideas dominadas'))),
    h('div.barra-trav.sobre-fondo', { role: 'progressbar', 'aria-label': rango.siguiente ? `Camino hacia ${rango.siguiente.nombre}` : 'Camino completado', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(rango.fraccion * 100)) },
      h('span', { style: `width:${Math.round(rango.fraccion * 100)}%` })),
    h('p.small', rango.texto));
}

/** Enlace a la pantalla de insignias con la cuenta. */
const cuentaInsignias = (est, reg) => {
  const cat = catalogoInsignias(est.faros);
  return { total: cat.length, hechas: cat.filter((x) => reg.insignias[x.id]).length };
};

// --- la pantalla ---------------------------------------------------------------------------------------------------------

export function travesiaView({ progress, params, tit }) {
  const T = TITULACIONES[tit];
  const enInsignias = params.parts[1] === 'insignias';
  const el = h('div.travesia', volver('Hoy', tlink(tit)), h('p.muted', 'Preparando tu travesía…'));
  let summaryText = `VISTA travesía ${T.sigla} (cargando)`;
  calcularPlan(progress, tit).then((d) => {
    const ic = d.indiceConceptos;
    const eje = d.banco.eje.id;
    const sy = ic ? sincronizarTravesia(progress, eje, tit, ic, { respuestas: d.respuestas, ahora: d.ahora }) : null;
    if (!sy) {
      setChildren(el, volver('Hoy', tlink(tit)), h('h1', 'Tu travesía'),
        h('p', `La travesía aún no está disponible con los exámenes de ${d.banco.eje.nombre ?? 'tu comunidad'}: necesita que las preguntas estén ordenadas por ideas.`),
        h('a.btn.grande', { href: tlink(tit) }, 'Volver a Hoy'));
      summaryText = `VISTA travesía ${T.sigla}: sin conceptos en este banco`;
      return;
    }
    if (enInsignias) { const r = pantallaInsignias({ T, tit, sy, eje }); setChildren(el, r.el); summaryText = r.summary; return; }
    const r = pantallaTravesia({ T, tit, d, sy, eje, query: params.query, progress });
    setChildren(el, r.el);
    summaryText = r.summary;
  }).catch((e) => setChildren(el, volver('Hoy', tlink(tit)), h('p.warn', `No se pudo preparar la travesía: ${e.message}`)));
  return { el, summary: () => summaryText };
}

/**
 * «Seguir» en la Travesía si la sesión de hoy no está hecha: retoma la que va a medias o arranca la de hoy (la misma que
 * ofrece Hoy, en la fase del alumno). null si ya está hecha.
 */
function botonSeguir(progress, tit, d) {
  const ses = leerSesion(progress, tit);
  if (ses?.estado === 'hecha') return null;
  if (ses && !terminada(ses)) return h('a.boton-sesion.trav-seguir', { href: tlink(tit, ['sesion']) }, 'Seguir la sesión');
  return h('button.boton-sesion.trav-seguir', { type: 'button', onclick: () => empezarSesion(progress, tit, d, componerSesion(d.st, deducirFase(d.st).id)) }, 'Seguir la derrota');
}

/** Ámbitos de «ya visto» de un banco (src/ui/efectos.js): faros encendidos e insignias ganadas. */
export const ambitoFaros = (eje, tit) => `faros:${eje}/${tit}`;
export const ambitoInsignias = (eje, tit) => `insignias:${eje}/${tit}`;

function pantallaTravesia({ T, tit, d, sy, eje, query, progress }) {
  const { est, rango } = sy;
  const faros = est.faros;
  // Un faro que se ha encendido desde la última vez que viste la carta se enciende delante de ti (una vez; los demás,
  // con su halo de siempre). Solo el cambio: la primera visita no anima nada.
  const recien = new Set(novedades(ambitoFaros(eje, tit), faros.filter((f) => f.estado === 'on').map((f) => f.id)));
  let sel = faros.find((f) => f.id === query?.f)?.id ?? faroInicial(faros);

  // La carta (con el marcador «estás aquí» en la siguiente parada, como en Hoy)
  const detalle = h('section.trav-detalle', { 'aria-live': 'polite', 'aria-label': 'Faro elegido' });
  const aqui = d.indiceConceptos ? marcaDerrota(sy, d.indiceConceptos, pasosQueTocan(progress ? leerSesion(progress, tit) : null, componerSesion(d.st, deducirFase(d.st).id))) : null;
  const { carta, botones } = cartaDerrota(faros, { sel, elegir: (id) => elegir(id), marca: aqui, recien });

  function pintaDetalle() {
    const f = faros.find((x) => x.id === sel);
    const flojas = f.flojas.slice(0, MAX_FLOJAS);
    setChildren(detalle,
      h('div.trav-detalle-cab', h('h2', f.nombre), h('span.trav-cuenta', `${f.dominadas} de ${ideas(f.total)}`)),
      h('div.barra-trav', { class: f.estado, role: 'progressbar', 'aria-label': `Ideas dominadas de ${f.nombre}`, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(f.pct * 100)) },
        h('span', { style: `width:${Math.round(f.pct * 100)}%` })),
      h('p.trav-texto', textoFaro(f)),
      flojas.length ? h('div.trav-flojas', h('h3.eti', 'Ideas por reforzar'),
        h('ul', flojas.map((i) => h('li', h('span.trav-idea', i.etiqueta),
          h('a.trav-ficha', { href: hrefFicha(tit, i.id, `travesia/${f.id}`), 'aria-label': `Ver la ficha de «${i.etiqueta}»` }, 'Ver ficha')))),
        f.flojas.length > flojas.length ? h('p.muted.small', `Y ${f.flojas.length - flojas.length === 1 ? '1 idea más' : `${f.flojas.length - flojas.length} ideas más`} por reforzar.`) : null) : null);
  }
  function elegir(id) {
    sel = id;
    botones.forEach((w, i) => w.querySelector('button').setAttribute('aria-pressed', String(faros[i].id === id)));
    pintaDetalle();
  }
  pintaDetalle();

  // El rango
  const rangoEl = tarjetaRango(sy);

  // La semana
  const sem = est.semana;
  const marca = { estudio: '✓', descanso: 'z', hoy: '•', libre: '', futuro: '' };
  const decir = { estudio: 'estudiaste', descanso: 'día de descanso', hoy: 'hoy, aún sin estudiar', libre: 'sin estudiar', futuro: 'todavía no ha llegado' };
  const semanaEl = h('section.trav-semana', { 'aria-label': 'Esta semana' },
    h('div.trav-fila-cab', h('h2.eti', 'Esta semana'), h('span.muted.small', sem.texto)),
    h('ul.trav-dias', sem.dias.map((x) => h('li', { class: x.estado, 'aria-label': `${x.nombre}: ${decir[x.estado]}` }, h('span.dia-marca', { 'aria-hidden': 'true' }, marca[x.estado]), h('span.dia-letra', { 'aria-hidden': 'true' }, x.letra)))),
    h('p.muted.small', `Cuenta cualquier día con estudio. El día de descanso no rompe nada: con ${cuenta(DIAS_SEMANA, 'día')} de estudio en la semana ya es una buena semana.`));

  // La nota real, tal cual la da «¿Estás listo?»
  const nota = lineaListo(d.st.listo);
  const notaEl = h('section.trav-nota', h('h2.eti', '¿Estás listo? · tu nota real'), h('p.trav-nota-linea', nota),
    h('p.small', 'Los rangos, los faros y las insignias no la cambian: solo la cambia lo que sabes.'));

  const ins = cuentaInsignias(est, sy.reg);
  const seguirEl = progress ? botonSeguir(progress, tit, d) : null;
  const dias = d.st.diasAlExamen;
  const pildora = dias != null && dias >= 0 ? h('a.pildora-examen', { href: '#/ajustes?campo=fecha', title: 'Fecha del examen' }, dias === 0 ? 'Examen hoy' : dias === 1 ? 'Examen mañana' : `${cuenta(dias, 'día')} al examen`) : null;

  const el = h('div.travesia-pantalla',
    volver('Hoy', tlink(tit)),
    h('header.trav-cab', h('div', h('p.muted.small', `Tu travesía · ${T.sigla}`), h('h1', 'De Grumete a Patrón')), pildora),
    seguirEl,
    rangoEl,
    h('section.trav-carta', h('div.trav-fila-cab', h('h2.eti', 'Tu derrota'), h('span.muted.small', 'Toca un faro')), carta),
    detalle,
    semanaEl,
    notaEl,
    h('a.trav-insignias-enlace', { href: tlink(tit, ['travesia', 'insignias']) },
      h('span.trav-insignias-tx', h('strong', 'Insignias'), h('span.muted.small', `${ins.hechas} de ${ins.total} conseguidas`)), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')),
    h('p.muted.small.trav-pie', `Cada faro agrupa los bloques del temario: ${faros.map((f) => f.corto.toLowerCase()).join(', ')}. Se enciende con el ${pct(FARO_ENCENDIDO)} de sus ideas dominadas.`));
  const summary = `VISTA travesía ${T.sigla} · rango ${rango.actual.nombre}: ${est.dominadas}/${est.total} ideas dominadas. ${rango.texto}\n` +
    `FAROS: ${faros.map((f) => `${f.nombre} ${f.dominadas}/${f.total}${f.estado === 'on' ? ' (encendido)' : ''}`).join(' · ')}\n` +
    `SEGUIR: ${seguirEl ? `${seguirEl.textContent} → #/${tit}/sesion` : 'sesión de hoy hecha'}\nSEMANA: ${sem.texto}\nINSIGNIAS: ${ins.hechas}/${ins.total} → #/${tit}/travesia/insignias\nNOTA: ${nota}`;
  return { el, summary };
}

function pantallaInsignias({ T, tit, sy, eje }) {
  const { est, reg, rango } = sy;
  const cat = catalogoInsignias(est.faros);
  const tiene = (x) => !!reg.insignias[x.id];
  const recien = new Set(novedades(ambitoInsignias(eje, tit), cat.filter(tiene).map((x) => x.id)));
  let sel = (cat.find(tiene) ?? cat[0]).id;
  const detalle = h('section.trav-detalle', { 'aria-live': 'polite', 'aria-label': 'Insignia elegida' });
  const botones = cat.map((x) => h('button.insignia', { type: 'button', class: tiene(x) ? `ganada${recien.has(x.id) ? ` ${claseAnimada('entra')}` : ''}`.trim() : '', 'aria-pressed': String(x.id === sel),
    'aria-label': `${x.nombre}: ${tiene(x) ? 'conseguida' : 'por conseguir'}`, onclick: () => elegir(x.id) },
  h('span.insignia-disco', icono(x.icono)), h('span.insignia-nombre', x.nombre)));
  function pinta() {
    const x = cat.find((y) => y.id === sel);
    setChildren(detalle, h('h2', x.nombre), h('p.trav-texto', x.texto),
      h('p.trav-estado', tiene(x) ? `Conseguida el ${fechaLarga(reg.insignias[x.id])}.` : faltaInsignia(x, est)));
  }
  function elegir(id) { sel = id; botones.forEach((b, i) => b.setAttribute('aria-pressed', String(cat[i].id === id))); pinta(); }
  pinta();
  const idx = RANGOS.findIndex((r) => r.id === rango.actual.id);
  const escalera = h('ol.rangos-lista', RANGOS.map((r, i) => h('li', { class: i === idx ? 'actual' : i < idx ? 'superado' : '' },
    h('span.rango-num', { 'aria-hidden': 'true' }, String(i + 1)),
    h('span.rango-tx', h('strong', r.nombre), h('span.muted.small', requisitoRango(r))),
    h('span.rango-marca', i < idx ? 'Superado' : i === idx ? 'Tu rango' : 'Por llegar'))));
  const hechas = cat.filter(tiene).length;
  const el = h('div.travesia-pantalla',
    volver('Tu travesía', tlink(tit, ['travesia'])),
    h('header.trav-cab', h('div', h('p.muted.small', `${hechas} de ${cat.length} conseguidas`), h('h1', 'Insignias'))),
    h('div.insignias-grid', botones),
    detalle,
    h('section.trav-rangos', h('h2.eti', 'Rangos'), escalera,
      h('p.muted.small', 'Los rangos se ganan con ideas dominadas y exámenes aprobados, nunca con horas ni con número de preguntas. Un rango, una vez ganado, no se pierde.')));
  const summary = `VISTA insignias ${T.sigla}: ${hechas}/${cat.length} conseguidas · ${cat.map((x) => `${x.nombre} ${tiene(x) ? 'sí' : 'no'}`).join(' · ')}\nRANGOS: ${RANGOS.map((r) => `${r.nombre} (${requisitoRango(r)})`).join(' · ')} · tu rango: ${rango.actual.nombre}`;
  return { el, summary };
}

// --- el parte de una sesión ----------------------------------------------------------------------------------------------

const cajaCifra = (n, uno, varios, suave = false) => h('div.parte-cifra', { class: suave ? 'suave' : '' }, h('b', String(n)), h('span', n === 1 ? uno : varios));

/**
 * El parte de travesía al terminar una sesión (src/course/travesia.js, parteSesion). `parte` = su resultado; `manana` =
 * paraManana() o null; `sig` = progresoRango() de ahora.
 */
export function parteTravesiaEl({ tit, parte, manana, sig, catalogo, animar = null }) {
  // `animar` (solo la primera vez que se enseña este parte): { faros: Set, insignias: Set, rango: boolean }. Sin él, quieto.
  const an = (si, clase) => (si ? claseAnimada(clase) : '');
  if (parte.vacio && !parte.insignias.length && !parte.rango.sube) {
    return h('section.parte-trav.corto', h('h2.eti', 'Parte de travesía'),
      h('p', 'Hoy no ha cambiado el estado de ninguna idea.'), h('a.trav-ficha', { href: tlink(tit, ['travesia']) }, 'Ver mi travesía'));
  }
  const nombreIns = (id) => catalogo.find((x) => x.id === id) ?? { nombre: id, texto: '', icono: 'ins-rescate' };
  return h('section.parte-trav', { 'aria-label': 'Parte de travesía' },
    h('h2.eti', 'Parte de travesía'),
    h('div.parte-cifras',
      cajaCifra(parte.nuevas.length, 'idea nueva', 'ideas nuevas'),
      cajaCifra(parte.rescatadas.length, 'rescatada', 'rescatadas'),
      cajaCifra(parte.flojas.length, 'sigue floja', 'siguen flojas', true)),
    ...parte.faros.map((f) => h('div.parte-faro', h('span.parte-faro-disco.encendido', { class: an(animar?.faros?.has(f.id), 'se-enciende') }, icono('faro')),
      h('div', h('span.small', 'Faro encendido'), h('strong', f.nombre), h('span.small', `Del ${pct(f.antes)} al ${pct(f.ahora)} de sus ideas dominadas.`)))),
    // Rango nuevo: su propio momento (el disco sube y brilla una vez).
    parte.rango.sube ? h('div.parte-subida', h('span.trav-disco', { class: an(animar?.rango, 'sube') }, icono('ancla')),
      h('div', h('span.small', 'Rango nuevo'), h('strong', sig.actual.nombre))) : null,
    ...parte.insignias.map((id) => { const x = nombreIns(id); return h('div.parte-insignia', h('span.insignia-disco.ganada', { class: an(animar?.insignias?.has(id), 'entra') }, icono(x.icono)),
      h('div', h('span.small.muted', 'Insignia nueva'), h('strong', x.nombre), h('span.small', x.texto))); }),
    parte.rescatadas.length ? h('p.parte-nota', `Rescatada${parte.rescatadas.length > 1 ? 's' : ''}: ${parte.rescatadas.slice(0, 3).map((i) => `«${i.etiqueta}»`).join(', ')}${parte.rescatadas.length > 3 ? ` y ${parte.rescatadas.length - 3} más` : ''}.`) : null,
    parte.flojas.length ? h('p.parte-nota', `Siguen flojas: ${parte.flojas.slice(0, 3).map((i) => `«${i.etiqueta}»`).join(', ')}${parte.flojas.length > 3 ? ` y ${parte.flojas.length - 3} más` : ''}.`) : null,
    manana ? h('div.parte-manana', h('h3.eti', 'Para mañana'),
      h('p', `«${manana.etiqueta}» vuelve ${manana.dias === 1 ? 'mañana' : `dentro de ${cuenta(manana.dias, 'día')}`}, con otra pregunta. Si quieres, mírala ahora en su ficha.`),
      h('a.trav-ficha.grande', { href: hrefFicha(tit, manana.id, 'sesion') }, 'Ver la ficha de la idea')) : null,
    h('p.parte-rango', parte.rango.sube ? `Subes a ${sig.actual.nombre}. ` : '', sig.texto, ' «¿Estás listo?» no cambia por esto: solo cambia con lo que aciertas.'),
    h('a.trav-ficha', { href: tlink(tit, ['travesia']) }, 'Ver mi travesía'));
}

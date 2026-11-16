// Estima analítica (loxodrómica) como la pone hoy el tribunal del PY (R-53): situación de salida (a menudo junto al
// meridiano de 180°, en el hemisferio sur o al lado del ecuador), una velocidad, de 2 a 5 rumbos con su tiempo y una
// corriente (Rc hacia donde va e intensidad horaria) que actúa toda la navegación o desde una hora hasta el final. Se
// pide la situación de llegada y, a veces, el rumbo y la distancia directos desde la salida.
//
// Cómo lo resuelve el tribunal (sus preguntas de estima analítica y las resoluciones de src/exams/solutions/*.js): la
// corriente es UNA FILA MÁS de la tabla de tramos, con su rumbo y lo que arrastra en todo el tiempo que actúa
// (d = Ihc × horas); se suman las columnas Δl y A, y con el total se saca la llegada.
//
// Fórmulas del curso (data/comun/formulas.json: estima-tramo, estima-directa, estima-inversa y meridiano-180; clases
// py-3-4 y py-4-10), loxodrómica por latitud media:
//   Δl = d · cos R · A = d · sen R (N y E +, S y W −) · l llegada = l salida + Δl · lm = (l salida + l llegada) / 2 con
//   signo · ΔL = A / cos lm · L llegada = L salida + ΔL; si pasa de 180°, 360° − L y cambia E por W.
//   Inversa: ΔL por el camino corto, A = ΔL · cos lm, tg R = A / Δl en su cuadrante, D = √(Δl² + A²).
// Latitudes por debajo de 55° (y la llegada por debajo de 60°): ahí la latitud media vale para estas distancias.
//
// El paso a paso guiado de este ejercicio (con la hoja de examen, los avisos y el diagnóstico por paso) se resuelve con
// el kit de los exámenes en src/exams/ejercicios.js; `calcular` (aquí, sin el kit) hace la misma cuenta y simula los
// errores típicos con los mismos ids y el mismo efecto que sus variantes del kit (tests/estima-analitica.test.js).

import { defineExercise } from '../define.js';
import { norm180, norm360, toDegMin } from '../../math/angles.js';
import { fmtBearing, fmtLat, fmtLon, fmtMiles, fmtClock } from '../helpers.js';

const DEG = Math.PI / 180;
const coma = (x, dec = 1) => x.toFixed(dec).replace('.', ',');
/** Con signo; lo que se redondea a cero, sin signo («0,0′»). */
const sg = (x, dec = 1) => (Math.abs(x) < 0.5 * 10 ** -dec ? coma(0, dec) : `${x < 0 ? '−' : '+'}${coma(Math.abs(x), dec)}`);
const min2 = (m) => coma(m).padStart(4, '0');
const latSigno = (x) => { const { deg, min } = toDegMin(x, 1); return `${x < 0 ? '−' : '+'}${deg}° ${min2(min)}′`; };
const gm = (x) => { const { deg, min } = toDegMin(x, 1); return `${deg}° ${min2(min)}′`; };
/** Nudos: «8 nudos», «7,5 nudos». */
const nudos = (v) => `${Number.isInteger(v) ? v : coma(v)} ${v === 1 ? 'nudo' : 'nudos'}`;
/** Millas con las décimas que hagan falta: «32 millas», «11,25 millas». */
const millas = (d) => `${Number.isInteger(d) ? d : Number.isInteger(Math.round(d * 10 * 1e6) / 1e6) ? coma(d) : coma(d, 2)} millas`;

/** Rumbos con nombre en la rosa de 8 (el tribunal da así muchas corrientes: «Rc = SE»). */
export const NOMBRE_RUMBO = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
/** Zonas: dónde empieza la navegación. */
export const ZONAS = ['antimeridiano', 'ecuador', 'sur', 'estrecho'];

/** Horas escritas: «3 horas», «1 hora», «2 h 30 min». */
export const horasTexto = (h) => (Number.isInteger(h) ? `${h} ${h === 1 ? 'hora' : 'horas'}` : `${Math.floor(h)} h ${Math.round((h % 1) * 60)} min`);
/** Rumbo de la corriente como en el enunciado: «SE» o «080°». */
export const rcTexto = (c) => (c.nombre ? NOMBRE_RUMBO[c.rc] : fmtBearing(c.rc));
/** Duración total de la navegación, en horas. */
export const horasTotales = (p) => p.legs.reduce((s, l) => s + l.h, 0);
/** Horas que actúa la corriente (desde `desde` horas tras la salida hasta el final). */
export const horasCorriente = (p) => (p.corriente ? horasTotales(p) - p.corriente.desde : 0);

/**
 * Tramos para la tabla de la estima: los rumbos navegados y, si hay corriente, una fila más con su rumbo y lo que
 * arrastra (Ihc × horas que actúa). Mismo formato que el kit (`k.tramos`): { rumbo, millas, nombre? }.
 */
export function filasEstima(p) {
  const filas = p.legs.map((l) => ({ rumbo: l.rv, millas: p.v * l.h }));
  if (p.corriente) filas.push({ rumbo: p.corriente.rc, millas: p.corriente.ihc * horasCorriente(p), nombre: `Corriente ${rcTexto(p.corriente)}` });
  return filas;
}

/**
 * La estima analítica entera, sin el kit. `error` = id de un error típico de la taxonomía (src/exams/taxonomia.js) para
 * simular cómo calcula quien lo comete; con el mismo efecto que su variante del kit (src/exams/kit.js):
 *   seno-coseno · sin-cos-lm · signo-dL · lm-salida (como sus variantes de siempre)
 *   corriente-al-reves  la fila de la corriente con Rc + 180° (variante del kit «corriente-al-reves»)
 *   lm-hemisferios      latitud de llegada sin signo, con la letra de la salida («lm-hemisferios:llegada»)
 *   antimeridiano       al pasar de 180° resta de 360° pero deja la letra de la salida («antimeridiano:letra»)
 * @returns {{ dl, ap, lat, lm, dL, lonBruta, lon, cruza180, cruzaEcuador, rd?, dd?, dl2?, dL2?, A2? }}
 */
export function calcular(p, error = null) {
  const e = (id) => error === id;
  let dl = 0; let ap = 0;
  for (const f of filasEstima(p)) {
    const r = ((f.nombre && e('corriente-al-reves')) ? f.rumbo + 180 : f.rumbo) * DEG;
    const [a, b] = e('seno-coseno') ? [f.millas * Math.sin(r), f.millas * Math.cos(r)] : [f.millas * Math.cos(r), f.millas * Math.sin(r)];
    dl += a; ap += b;
  }
  const l0 = p.start.lat;
  const lat0 = l0 + dl / 60;
  const lat = e('lm-hemisferios') && (l0 < 0 || lat0 < 0) ? (l0 < 0 ? -1 : 1) * Math.abs(Math.abs(l0) + dl / 60) : lat0;
  const lm = e('lm-salida') ? l0 : (l0 + lat) / 2;
  const cos = Math.cos(lm * DEG);
  const dL = e('sin-cos-lm') ? ap : ap / cos;
  const lonBruta = p.start.lon + (e('signo-dL') ? -dL : dL) / 60;
  const cruza180 = Math.abs(lonBruta) > 180;
  let lon = cruza180 ? norm180(lonBruta) : lonBruta;
  if (cruza180 && e('antimeridiano')) lon = -lon;
  const out = { dl, ap, lat, lm, dL, lonBruta, lon, cruza180, cruzaEcuador: l0 * lat < 0 };
  if (p.directo) {
    // Inversa desde la salida hasta la llegada (la del alumno, si se equivocó antes).
    const dl2 = (lat - l0) * 60;
    const dL2 = norm180(lon - p.start.lon) * 60 * (e('signo-dL') ? -1 : 1);
    const lm2 = e('lm-salida') ? l0 : (l0 + lat) / 2;
    const cos2 = Math.cos(lm2 * DEG);
    const A2 = e('sin-cos-lm') ? dL2 : dL2 * cos2;
    let rd = norm360(Math.atan2(A2, dl2) / DEG);
    if (e('seno-coseno')) {
      const c = 90 - Math.atan(Math.abs(A2) / Math.abs(dl2)) / DEG;
      rd = dl2 >= 0 ? (A2 >= 0 ? c : 360 - c) : (A2 >= 0 ? 180 - c : 180 + c);
    }
    Object.assign(out, { dl2, dL2, A2, rd, dd: Math.hypot(A2, dl2) });
  }
  return out;
}

// ---- Generación

const minutos = (rng, a, b) => rng.int(a, b) / 60;
/** Un rumbo: a veces uno cardinal (000, 090, 180, 270); si no, de 5 en 5 dentro de [desde, hasta] (en circular). */
function rumbo(rng, desde = 0, hasta = 355) {
  if (rng.bool(0.25)) return rng.pick([0, 90, 180, 270]);
  const ancho = norm360(hasta - desde) || 360;
  return norm360(desde + rng.step(0, ancho, 5));
}

/** Salida, rumbos y corriente de una zona; `forzar` = { corriente?: true }. */
function intento(rng, zona, forzar) {
  let lat; let lon; let hacia = null; // sector de rumbos que lleva a cruzar (180° o ecuador)
  if (zona === 'antimeridiano') {
    lat = rng.sign() * (rng.int(5, 50) + minutos(rng, 0, 59));
    lon = rng.sign() * (179 + minutos(rng, 0, 55));
    hacia = lon > 0 ? [20, 160] : [200, 340]; // hacia el E desde una L E; hacia el W desde una L W
  } else if (zona === 'ecuador') {
    // Mar abierto en el ecuador: Pacífico central, Atlántico entre Brasil y África, Índico.
    const [l1, l2] = rng.pick([[-175, -100], [-33, -8], [56, 88]]);
    lat = rng.sign() * minutos(rng, 5, 90);
    lon = rng.int(l1, l2 - 1) + minutos(rng, 0, 59);
    hacia = lat > 0 ? [110, 250] : [290, 70];
  } else if (zona === 'sur') {
    // Mar abierto del hemisferio sur: Pacífico, Atlántico e Índico (lejos de las costas para estas distancias).
    const [a1, a2, l1, l2] = rng.pick([[-45, -10, -170, -95], [-42, -15, -28, 2], [-40, -15, 60, 100]]);
    lat = rng.int(a1, a2 - 1) + minutos(rng, 0, 59);
    lon = rng.int(l1, l2 - 1) + minutos(rng, 0, 59);
  } else { // estrecho: mar adentro del golfo de Cádiz, con rumbos sobre todo hacia el W, como las preguntas de antes
    lat = 35 + minutos(rng, 40, 90);
    lon = -(7 + minutos(rng, 0, 90));
    hacia = [200, 340];
  }
  const v = rng.step(5, 10, 0.5);
  const n = rng.int(2, 5);
  const legs = [];
  for (let i = 0; i < n; i++) {
    const rv = hacia && rng.bool(0.75) ? rumbo(rng, hacia[0], hacia[1]) : rumbo(rng);
    legs.push({ rv, h: rng.bool(0.7) ? rng.int(1, 4) : rng.step(1.5, 3.5, 1) });
  }
  const total = legs.reduce((s, l) => s + l.h, 0);
  let corriente = null;
  if (forzar.corriente || rng.bool(0.8)) {
    const nombre = rng.bool(0.5);
    corriente = { rc: nombre ? rng.step(0, 315, 45) : rng.step(0, 355, 5), nombre, ihc: rng.step(1, 4, 0.5), desde: rng.bool(0.5) ? 0 : rng.int(1, Math.max(1, Math.floor(total) - 1)) };
    if (corriente.desde >= total) corriente.desde = 0;
  }
  // Situación al minuto entero, como en un enunciado.
  const start = { lat: Math.round(lat * 60) / 60, lon: Math.round(lon * 60) / 60 };
  return { zona, hora: rng.step(0, 23 * 60, 60), start, v, legs, corriente, directo: rng.bool(0.35) };
}

/** ¿Cumple lo que pide su zona? (cruzar el 180° o el ecuador; latitudes donde vale la latitud media) */
function vale(p) {
  const r = calcular(p);
  if (Math.abs(r.lat) > 58 || !Number.isFinite(r.lon)) return false;
  if (p.zona === 'antimeridiano') return r.cruza180;
  if (p.zona === 'ecuador') return r.cruzaEcuador;
  if (p.zona === 'sur') return r.lat < 0;
  return true;
}

export default defineExercise({
  id: 'estima-analitica',
  title: 'Estima analítica (varios rumbos y corriente)',
  category: 'estima',
  levels: ['PY'],
  difficulty: 3,
  concepts: ['estima', 'distancia'],
  summary: 'Sin carta: tabla de tramos con la corriente, cruce del meridiano 180° y hemisferio sur, por latitud media.',
  method: [
    'Distancia de cada tramo: d = V · t. La corriente es una fila más: su rumbo (hacia donde va) y d = Ihc × horas que actúa.',
    'Para cada fila: Δl = d · cos R (N +, S −) y A = d · sen R (E +, W −). Suma las dos columnas con su signo.',
    'Latitud de llegada = l salida + Δl, con signo (S negativa). lm = (l salida + l llegada) / 2, también con signo.',
    'ΔL = A / cos lm. Longitud de llegada = L salida + ΔL (E +, W −). Si pasa de 180°: 360° − L y cambia E por W.',
    'Rumbo y distancia directos (si los piden): ΔL por el camino corto, A = ΔL · cos lm, tg R = A / Δl en su cuadrante, D = √(Δl² + A²).',
  ],

  /**
   * `ctx.foco` (opcional): el error de una dosis o comprobación del cuaderno de fallos, para que el ejercicio lo ponga a
   * prueba (cruzar el 180°, latitudes S, corriente).
   */
  generate(rng, ctx) {
    const foco = ctx?.foco ?? null;
    const zona = foco === 'antimeridiano' ? 'antimeridiano'
      : foco === 'lm-hemisferios' ? rng.pick(['sur', 'ecuador'])
      : rng.pick(['antimeridiano', 'antimeridiano', 'ecuador', 'sur', 'sur', 'estrecho']);
    const forzar = { corriente: foco === 'corriente-al-reves' };
    let p = null;
    for (let i = 0; i < 60; i++) {
      p = intento(rng, zona, forzar);
      if (vale(p)) break;
    }
    return p;
  },

  statement(p) {
    const legs = p.legs.map((l) => `Rv = ${fmtBearing(l.rv)} durante ${horasTexto(l.h)}`);
    const lista = legs.length > 1 ? `${legs.slice(0, -1).join('; ')} y ${legs.at(-1)}` : legs[0];
    const llegada = p.hora + horasTotales(p) * 60;
    const c = p.corriente;
    const corr = !c ? '' : c.desde === 0
      ? ` Durante toda la navegación nos afecta una corriente de Rc = ${rcTexto(c)} e intensidad horaria Ihc = ${nudos(c.ihc)}.`
      : ` A partir de HRB = ${fmtClock(p.hora + c.desde * 60)} entramos en una zona de corriente de Rc = ${rcTexto(c)} e intensidad horaria Ihc = ${nudos(c.ihc)}, que se mantiene hasta el final.`;
    return `A HRB = ${fmtClock(p.hora)} nos encontramos en la situación l = ${fmtLat(p.start.lat)}, L = ${fmtLon(p.start.lon)}, y navegamos a ${nudos(p.v)} los rumbos siguientes: ${lista}.${corr} ` +
      `Calcula por estima analítica la situación de llegada (HRB = ${fmtClock(llegada)})${p.directo ? ', y el rumbo y la distancia directos desde la situación de salida' : ''}.`;
  },

  answers(p) {
    const a = [
      { key: 'lat', label: 'Latitud', kind: 'lat' },
      { key: 'lon', label: 'Longitud', kind: 'lon' },
    ];
    if (p.directo) a.push({ key: 'rd', label: 'Rumbo directo', kind: 'bearing' }, { key: 'dd', label: 'Distancia directa', kind: 'distance' });
    return a;
  },

  solve(p) {
    const r = calcular(p);
    const filas = filasEstima(p);
    const llegadaH = p.hora + horasTotales(p) * 60;
    const dist = p.legs.map((l, i) => `tramo ${i + 1}: ${nudos(p.v)} × ${horasTexto(l.h)} = ${millas(p.v * l.h)}`);
    const c = p.corriente;
    const distCorr = c ? ` Corriente ${rcTexto(c)}: actúa de ${fmtClock(p.hora + c.desde * 60)} a ${fmtClock(llegadaH)}, ${horasTexto(horasCorriente(p))} × ${nudos(c.ihc)} = ${millas(c.ihc * horasCorriente(p))}.` : '';
    const comps = filas.map((f) => ({ ...f, dl: f.millas * Math.cos(f.rumbo * DEG), ap: f.millas * Math.sin(f.rumbo * DEG) }));
    const rows = comps.map((f, i) => `${f.nombre ? 'Corriente' : `Tramo ${i + 1}`} (${fmtBearing(f.rumbo)}, ${millas(f.millas)}): Δl = ${sg(f.dl)}′; A = ${sg(f.ap)}′`);
    const conSur = p.start.lat < 0 || r.lat < 0;
    const steps = [
      { title: 'Distancias', text: `d = V · t; ${dist.join('; ')}.${distCorr}` },
      { title: 'Tabla de tramos', text: `Δl = d · cos R y A = d · sen R${c ? '; la corriente es una fila más, con su rumbo hacia donde va' : ''}. ${rows.join('. ')}.` },
      { title: 'Totales', text: `Δl = ${sg(r.dl)}′ (${r.dl >= 0 ? 'N' : 'S'}); A = ${sg(r.ap)}′ (${r.ap >= 0 ? 'E' : 'W'}).` },
      { title: 'Latitud de llegada', text: conSur
        ? `Con signo (N +, S −): ${latSigno(p.start.lat)} ${r.dl < 0 ? '−' : '+'} ${coma(Math.abs(r.dl))}′ = ${latSigno(r.lat)} → ${fmtLat(r.lat)}.${r.cruzaEcuador ? ' Cambia de signo: hemos cruzado el ecuador.' : ''}`
        : `${fmtLat(p.start.lat)} ${r.dl < 0 ? '−' : '+'} ${coma(Math.abs(r.dl))}′ = ${fmtLat(r.lat)}.` },
      { title: 'Latitud media y diferencia de longitud', text: `lm = (l salida + l llegada) / 2${conSur ? ', con signo' : ''} = ${coma(Math.abs(r.lm), 2)}° ${r.lm < 0 ? 'S' : 'N'}; ΔL = A / cos lm = ${sg(r.ap)} / ${coma(Math.cos(r.lm * DEG), 4)} = ${sg(r.dL)}′ (${r.dL >= 0 ? 'E' : 'W'}).` },
      { title: 'Longitud de llegada', text: r.cruza180
        ? `${fmtLon(p.start.lon)} ${r.dL >= 0 ? 'hacia el E' : 'hacia el W'} ${coma(Math.abs(r.dL))}′ = ${gm(Math.abs(r.lonBruta))} ${r.lonBruta > 0 ? 'E' : 'W'}: pasa de 180°, hemos cruzado el meridiano 180°. 360° − ${gm(Math.abs(r.lonBruta))} = ${fmtLon(r.lon)} (cambia la letra).`
        : `${fmtLon(p.start.lon)} ${r.dL >= 0 ? 'hacia el E' : 'hacia el W'} ${coma(Math.abs(r.dL))}′ = ${fmtLon(r.lon)}.` },
    ];
    if (p.directo) {
      steps.push({ title: 'Rumbo y distancia directos', text: `Δl = ${sg(r.dl2)}′; ΔL = ${sg(r.dL2)}′${r.cruza180 ? ' (por el camino corto, cruzando el 180°)' : ''}; A = ΔL · cos lm = ${sg(r.A2)}′. tg R = ${coma(Math.abs(r.A2))} / ${coma(Math.abs(r.dl2))} → R = ${fmtBearing(r.rd, 1)}; D = √(Δl² + A²) = ${fmtMiles(r.dd)}.` });
    }
    return { results: { lat: r.lat, lon: r.lon, ...(p.directo ? { rd: r.rd, dd: r.dd } : {}) }, steps };
  },

  // Errores típicos con los ids de la taxonomía común (src/exams/taxonomia.js): así el diagnóstico, el cuaderno de
  // fallos y la dosis los reconocen. Cada uno calcula como quien lo comete (calcular(p, id)).
  mistakes: [
    { id: 'antimeridiano', explain: 'Al pasar de 180° hay que restar de 360° y cambiar la letra: la longitud de llegada es del otro lado del meridiano 180° (E ↔ W).', results: (p) => conError(p, 'antimeridiano') },
    { id: 'corriente-al-reves', explain: 'La corriente se nombra hacia donde va: su fila de la tabla lleva Rc tal cual y se suma como un tramo más.', results: (p) => (p.corriente ? conError(p, 'corriente-al-reves') : null) },
    { id: 'lm-hemisferios', explain: 'Las latitudes van con su signo (N +, S −): en el hemisferio S, ir hacia el S hace mayor el número; al cruzar el ecuador cambia la letra.', results: (p) => conError(p, 'lm-hemisferios') },
    { id: 'signo-dL', explain: 'La ΔL lleva el signo del apartamiento: hacia el E suma y hacia el W resta.', results: (p) => conError(p, 'signo-dL') },
    { id: 'sin-cos-lm', explain: 'Has tomado el apartamiento como diferencia de longitud. Hay que dividir por cos lm: ΔL = A / cos lm.', results: (p) => conError(p, 'sin-cos-lm') },
    { id: 'lm-salida', explain: 'El apartamiento se pasa a longitud con la latitud media, no con la de salida: lm = (l salida + l llegada) / 2.', results: (p) => conError(p, 'lm-salida') },
    { id: 'seno-coseno', explain: 'Has cambiado seno y coseno: Δl = d · cos R y A = d · sen R.', results: (p) => conError(p, 'seno-coseno') },
  ],
});

function conError(p, id) {
  const r = calcular(p, id);
  return { lat: r.lat, lon: r.lon, ...(p.directo ? { rd: r.rd, dd: r.dd } : {}) };
}

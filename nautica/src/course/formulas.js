// «Fórmulas y tablas en una hoja» (data/comun/formulas.json): las fórmulas y tablas del examen por bloques, cada fórmula
// con su ejemplo resuelto. Funciones puras (sin DOM): la vista (src/ui/views/formulas.js) solo pinta.
//
// Regla de oro de los ejemplos: no se escriben a mano sin comprobar. Cada ejemplo lleva `comprobar` ({ calculo, datos,
// esperado }): `CALCULOS[calculo](datos)` lo resuelve con los motores de la app (src/nautical, src/math) y
// tests/formulas.test.js exige que cada valor publicado coincida con el cálculo y aparezca escrito en el ejemplo. Las
// teclas de la calculadora se pulsan en el motor de la calculadora (src/calculadora/motor.js) y deben dar lo que se dice.
//
// Como la chuleta, es una ayuda para estudiar: nunca se enlaza ni se abre en un examen (src/course/chuletario.js).

import { correccionTotal, updateDeclination, ctFrom, desvioFrom, rvFromRa, raFromRv, dvFromMarcacion } from '../nautical/compass.js';
import { windSide, abatimientoSigned, cadenaInversa, effectiveCourse, courseToSteer, currentFromDrift, timeFor } from '../nautical/kinematics.js';
import { correccionTabla, tideHeight, timeForHeight, twelfthsFraction, aguaBajoQuilla } from '../nautical/tides.js';
import { legComponents, deadReckoning } from '../nautical/sailing.js';
import { horaCivilLugar, husoDe, horaLegal, horaOficial } from '../nautical/hora.js';
import { estabilidad } from '../nautical/estabilidad.js';
import { humedadRelativa, tensionSaturacion } from '../nautical/meteo.js';
import { vientoAparente } from '../nautical/viento.js';
import { norm360, norm180, reciprocal } from '../math/angles.js';
import { estadoInicial, pulsarTodas } from '../calculadora/motor.js';
import { esRutaDeExamen } from './chuletario.js';

const RAD = Math.PI / 180;

/** «hh:mm» → minutos desde las 00:00. */
export const minutos = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
/** { g, m, ns|ew } → grados con signo (N y E +, S y W −). */
export const grados = ({ g, m = 0, ns, ew }) => (ns === 'S' || ew === 'W' ? -1 : 1) * (g + m / 60);
/** Longitud en (−180°, 180°]: la que pasa de 180° se escribe 360° − L con el nombre cambiado. */
export const longitudNormal = (lon) => { const x = norm180(lon); return x === -180 ? 180 : x; };
/** Minutos del día (0–1440), con la vuelta al día. */
const delDia = (min) => ((min % 1440) + 1440) % 1440;

/**
 * Cálculos de los ejemplos, con los motores de la app. Cada uno recibe los `datos` del ejemplo y devuelve los valores
 * que el ejemplo publica (mismas claves que su `esperado`).
 */
export const CALCULOS = {
  // Corrección total, rumbos y demoras (src/nautical/compass.js)
  ct: ({ dm, desvio }) => ({ ct: correccionTotal(dm, desvio) }),
  dmDelAno: ({ dmCarta, ano, variacionMin, hacia, anoActual }) => ({
    dm: updateDeclination(grados(dmCarta), ano, (hacia === 'W' ? -1 : 1) * (variacionMin / 60), anoActual),
  }),
  ctEnfilacion: ({ dv, da, dm }) => { const ct = ctFrom(dv, da); return { ct, desvio: desvioFrom(ct, dm) }; },
  ctPolar: ({ za }) => ({ ct: ctFrom(0, za) }),
  rvDeRa: ({ ra, ct }) => ({ rv: rvFromRa(ra, ct) }),
  dvDeDa: ({ da, ct }) => { const dv = rvFromRa(da, ct); return { dv, opuesta: reciprocal(dv) }; },
  dvDeMarcacion: ({ rv, m }) => ({ dv: dvFromMarcacion(rv, m) }),
  cuadrantal: ({ ns, x, ew }) => ({ rumbo: norm360(ns === 'N' ? (ew === 'E' ? x : 360 - x) : (ew === 'E' ? 180 - x : 180 + x)) }),

  // Viento y corriente (src/nautical/kinematics.js)
  abatimientoInverso: ({ rs, viento, ab, ct }) => {
    const banda = windSide(viento, rs); // con el Rs: el Rv aún no se sabe (como enseña la clase)
    const abs = abatimientoSigned(ab, banda);
    const { rv } = cadenaInversa({ ref: rs, vb: 1, ab: abs });
    return { ab: abs, rv, ra: raFromRv(rv, ct) };
  },
  efectivo: ({ rs, vb, rc, ic }) => {
    const { ref, vef } = effectiveCourse(rs, vb, rc, ic);
    return { norte: vb * Math.cos(rs * RAD) + ic * Math.cos(rc * RAD), este: vb * Math.sin(rs * RAD) + ic * Math.sin(rc * RAD), ref, vef };
  },
  rumboADar: ({ ref, vb, rc, ic, d }) => { const s = courseToSteer(ref, vb, rc, ic); return { rs: s.rs, vef: s.vef, horas: timeFor(d, s.vef) }; },
  corrienteDesconocida: ({ rumbo, d, h }) => { const c = currentFromDrift(rumbo, d, h); return { rc: c.rc, ic: c.ic }; },

  // Distancia, velocidad y tiempo
  llegada: ({ d, v, salida }) => { const t = timeFor(d, v); return { t, llegada: delDia(minutos(salida) + t * 60) }; },
  corredera: ({ verdadera, corredera, lectura }) => { const k = verdadera / corredera; return { k, d: k * lectura }; },
  sexagesimal: ({ h, m, s, gs }) => ({ horas: h + m / 60 + s / 3600, decimas: gs / 60 }),
  tangente: ({ dv, D, d, banda }) => { const alfa = Math.asin(d / D) / RAD; return { alfa, rv: norm360(banda === 'estribor' ? dv - alfa : dv + alfa) }; },

  // Mareas (src/nautical/tides.js)
  duodecimos: ({ bm, pm, horas, sondaCarta }) => {
    const amplitud = pm - bm;
    const subida = amplitud * twelfthsFraction(horas);
    return { amplitud, subida, altura: bm + subida, sonda: aguaBajoQuilla({ sondaCarta, altura: bm + subida, calado: 0 }).sonda };
  },
  presionMarea: ({ sonda, presion }) => { const correccion = (1013 - presion) / 100; return { correccion, sonda: sonda + correccion }; },
  mareaDirecta: ({ bm, pm, oficial, adelanto, sondaCarta }) => {
    const a = { t: minutos(bm.hora), h: bm.h };
    const b = { t: minutos(pm.hora), h: pm.h };
    const ut = minutos(oficial) - adelanto * 60;
    const D = b.t - a.t;
    const I = ut - a.t;
    const C = correccionTabla(b.h - a.h, I, D);
    const h = tideHeight(a, b, ut); // la misma curva que la tabla del examen
    return { D, I, C, h, sonda: aguaBajoQuilla({ sondaCarta, altura: h, calado: 0 }).sonda, hC: a.h + C };
  },
  mareaInversa: ({ bm, pm, sondaQuerida, sondaCarta, adelanto }) => {
    const a = { t: minutos(bm.hora), h: bm.h };
    const b = { t: minutos(pm.hora), h: pm.h };
    const h = sondaQuerida - sondaCarta;
    const C = h - a.h;
    const ut = timeForHeight(a, b, h);
    return { C, angulo: Math.asin(Math.sqrt(C / (b.h - a.h))) / RAD, I: ut - a.t, oficial: delDia(ut + adelanto * 60) };
  },

  // Estima analítica (src/nautical/sailing.js)
  tramo: ({ rumbo, d }) => { const c = legComponents(rumbo, d); return { dl: c.dLat, a: c.dep }; },
  estimaDirecta: ({ lat, lon, tramos }) => {
    const r = deadReckoning({ lat: grados(lat), lon: grados(lon) }, tramos.map((t) => ({ rv: t.rumbo, dist: t.d })));
    return { dl: r.dLat, a: r.dep, lat: r.end.lat, lm: r.lm, dL: r.dLon, lon: longitudNormal(r.end.lon) };
  },
  // Inversa por latitud media, como la enseña la clase (la carta, en cambio, mide en Mercator: src/math/mercator.js).
  estimaInversa: ({ salida, llegada }) => {
    const l1 = grados(salida.lat); const l2 = grados(llegada.lat);
    const dl = (l2 - l1) * 60;
    let dL = (grados(llegada.lon) - grados(salida.lon)) * 60;
    if (Math.abs(dL) > 180 * 60) dL -= Math.sign(dL) * 360 * 60; // por el meridiano de 180°
    const lm = l1 + dl / 120;
    const a = dL * Math.cos(lm * RAD);
    return { dl, dL, lm, a, rumbo: norm360(Math.atan2(a, dl) / RAD), d: Math.hypot(dl, a) };
  },
  meridiano180: ({ lon, dL, de, a }) => {
    const llegada = longitudNormal(grados(lon) + grados({ g: 0, ...dL }));
    let d = grados(a) - grados(de);
    if (Math.abs(d) > 180) d -= Math.sign(d) * 360;
    return { llegada: Math.abs(llegada), llegadaE: llegada > 0 ? 1 : 0, dL: Math.abs(d) * 60, haciaE: d > 0 ? 1 : 0 };
  },

  // La hora (src/nautical/hora.js); minutos desde las 00:00
  longitudTiempo: ({ g, m }) => ({ horas: (g + m / 60) / 15 }),
  hcl: ({ tu, lon }) => ({ hcl: delDia(horaCivilLugar(minutos(tu), grados(lon))) }),
  horaLegal: ({ tu, lon }) => ({ huso: husoDe(grados(lon)), hz: delDia(horaLegal(minutos(tu), grados(lon))) }),
  horaOficial: ({ tu, adelanto }) => ({ ho: delDia(horaOficial(minutos(tu), adelanto)) }),
  cambioFecha: ({ hacia, dia }) => ({ dia: dia + (hacia === 'W' ? 1 : -1) }),

  // Estabilidad (src/nautical/estabilidad.js), con un barco sin peso móvil (w = 0) o con el peso que se traslada
  gm: ({ KB, BM, KG }) => { const r = estabilidad({ altura: 0 }, { D: 1, w: 0, KM: KB + BM, KB, KGresto: KG }); return { KM: KB + BM, GM: r.GM }; },
  gz: ({ GM, escora, D }) => {
    const r = estabilidad({ altura: 0, escora }, { D, w: 0, KM: 2 + GM, KB: 0, KGresto: 2 });
    return { GZ: r.GZ, momento: D * r.GZ };
  },
  gg: ({ p, d, D }) => ({ gg: estabilidad({ altura: 1, traslado: d }, { D, w: p, KM: 2, KB: 0, KGresto: 1 }).GGt }),

  // Meteorología (src/nautical/meteo.js, src/nautical/viento.js)
  presion: ({ mmhg, nudos }) => ({ hpa: (mmhg * 1013.25) / 760, kmh: nudos * 1.852 }),
  gradiente: ({ p1, p2, millas }) => ({ g: Math.abs(p1 - p2) / (millas / 60) }),
  humedad: ({ t, td }) => ({ E: tensionSaturacion(t), e: tensionSaturacion(td), hr: humedadRelativa(t, td) }),
  vientoAparente: ({ ang, vr, vb }) => { const r = vientoAparente({ angReal: ang, vr, vb }); return { proa: r.proa, costado: r.costado, va: r.va, ang: r.ang }; },
  horizonteRadar: ({ h, H }) => ({ d: 2.2 * (Math.sqrt(h) + Math.sqrt(H)) }),
};

// ---------------------------------------------------------------------------
// Teclas de la calculadora: «2.4 × sin 90 × 158 ÷ 372 ) x² =» → pulsaciones del motor de la calculadora

/** Nombre escrito de cada tecla → id de tecla de src/calculadora/motor.js. */
const TECLA = {
  '+': '+', '−': '-', '-': '-', '×': '×', '÷': '÷', '(': '(', ')': ')', '=': '=',
  '(−)': 'neg', 'x²': 'sq', 'x⁻¹': 'inv', '√': 'sqrt', '°′″': 'gms', SHIFT: 'shift', Ans: 'ans', π: 'pi',
  sin: 'sin', cos: 'cos', tan: 'tan',
};

/** Pulsaciones de una secuencia de teclas escrita con espacios; null si alguna no existe. */
export function pulsaciones(texto) {
  const out = [];
  for (const t of String(texto).trim().split(/\s+/)) {
    if (/^\d+(\.\d+)?$/.test(t)) out.push(...t);
    else if (TECLA[t]) out.push(TECLA[t]);
    else return null;
  }
  return out;
}

/** Lo que da una secuencia de teclas en la calculadora de la app: { valor, error }. */
export function resultadoTeclas(texto) {
  const ps = pulsaciones(texto);
  if (!ps) return { valor: NaN, error: 'tecla desconocida' };
  const e = pulsarTodas(estadoInicial(), ps);
  return { valor: e.hecho ? e.resultado : NaN, error: e.error ?? (e.hecho ? null : 'sin terminar') };
}

/** Teclas para pintar: cada una en su chip, los números juntos. */
export const teclasParaPintar = (texto) => String(texto).trim().split(/\s+/).map((t) => ({ t, numero: /^\d/.test(t) }));

// ---------------------------------------------------------------------------
// Selección, búsqueda y texto

/** Valor que puede ser común o por titulación ({ per, py }). */
export const porTit = (v, tit) => (v && typeof v === 'object' && !Array.isArray(v) ? v[tit] ?? null : v ?? null);

const deTit = (x, tit) => !x.tits || x.tits.includes(tit);

/**
 * Bloques de una titulación, con solo sus fórmulas y tablas (y los bloques vacíos fuera). Con `ut`, solo lo de ese tema.
 * @returns {{ id, titulo, ico, formulas: object[], tablas: object[] }[]}
 */
export function bloquesPara(datos, tit, { ut = null } = {}) {
  const delTema = (x) => ut == null || (x.temas?.[tit] ?? []).includes(Number(ut));
  return (datos?.bloques ?? []).map((b0) => ({ ...b0, titulo: porTit(b0.titulo, tit), corto: porTit(b0.corto, tit) })).map((b) => ({
    ...b,
    // Cada fórmula y tabla lleva el título de su bloque: también se encuentra buscando por él («loxodrómica»).
    formulas: (b.formulas ?? []).filter((f) => deTit(f, tit) && delTema(f)).map((f) => ({ ...f, bloqueTitulo: b.titulo })),
    tablas: (b.tablas ?? []).filter((t) => deTit(t, tit) && delTema(t)).map((t) => ({ ...t, bloqueTitulo: b.titulo })),
  })).filter((b) => b.formulas.length || b.tablas.length);
}

/** Temas (UT) de una titulación que tienen alguna fórmula o tabla. */
export const temasConFormulas = (datos, tit) => [...new Set(bloquesPara(datos, tit).flatMap((b) => [...b.formulas, ...b.tablas].flatMap((x) => x.temas?.[tit] ?? [])))].sort((a, b) => a - b);

/** Texto sin tildes, en minúsculas y sin signos raros, para buscar. */
export const normaliza = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\*\*/g, '');

/** Todo el texto de una fórmula o tabla en el que se busca. */
export function textoBuscable(x, tit) {
  return normaliza([x.bloqueTitulo, x.titulo, ...(x.expresion ?? []), ...(x.letras ?? []).flat(), porTit(x.signos, tit), porTit(x.cuando, tit), porTit(x.trampa, tit),
    ...(x.palabras ?? []), x.columnas?.join(' '), (porTit(x.filas, tit) ?? []).flat().join(' ')].filter(Boolean).join(' '));
}

/** ¿Encaja con lo que se busca? Todas las palabras tienen que aparecer (en cualquier orden). */
export function encaja(x, tit, consulta) {
  const ps = normaliza(consulta).split(/\s+/).filter(Boolean);
  if (!ps.length) return true;
  const t = textoBuscable(x, tit);
  return ps.every((p) => t.includes(p));
}

/**
 * ¿Se puede abrir la hoja ahora? Nunca en un examen: ni en una dirección de examen ni con el modo examen puesto
 * (src/ui/modo-examen.js). Es la misma regla que la chuleta.
 */
export const formulasPermitidas = ({ hash = '', modoExamen = null } = {}) => !modoExamen && !esRutaDeExamen(hash);

/** Resumen en texto (para nautica.state()). */
export function resumenFormulas(bloques, tit) {
  return bloques.map((b) => `## ${b.titulo}\n${[
    ...b.formulas.map((f) => `- ${f.titulo}: ${f.expresion.join(' · ')}${f.ejemplo?.resultado ? ` (ejemplo: ${f.ejemplo.resultado})` : ''}`),
    ...b.tablas.map((t) => `- Tabla: ${t.titulo}`),
  ].join('\n')}`).join('\n');
}

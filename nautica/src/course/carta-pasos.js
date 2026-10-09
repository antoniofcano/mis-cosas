// Ejercicios de carta resueltos paso a paso (#/<tit>/carta-pasos[/<tipo>]): para cada tipo de ejercicio de carta del PY
// (y los que también entran en el PER), un ejemplo propio sobre la carta del Estrecho resuelto en 4–8 pasos. Cada paso
// tiene su regla, una cuenta corta y un dibujo en estilo C (src/illustrations/carta-pasos-c.js) con lo trazado hasta ese
// paso y lo nuevo resaltado.
//
// Las cifras NO se escriben a mano: se calculan aquí con los motores de la app (src/nautical, src/math) a partir de los
// datos del enunciado, igual que lo haría el alumno: lo que se mide en la carta se redondea como en el examen (rumbos al
// grado, distancias a la décima) y las cuentas siguientes parten de ese valor redondeado. tests/carta-pasos.test.js
// comprueba cada cifra contra el motor y la geometría (que la situación cumple las demoras y distancias del enunciado).
//
// Los ejemplos son propios (no son preguntas de examen, y menos aún reservadas: docs/CUARENTENA.md). Convenios del
// examen: E (+), W (−); Ct = dm + Δ; Rv = Ra + Ct; Dv = Da + Ct; Rs = Rv + Ab (Ab + con el viento por babor); la
// corriente se nombra por hacia dónde va y el viento por de dónde viene. Sin DOM.

import { norm360, angleDist, toDeg, round, toDegMin } from '../math/angles.js';
import { rhumbTo, rhumbDestination } from '../math/mercator.js';
import { fmtBearing, fmtSignedNum, fmtPos, fmtLat, fmtLon, fmtClock, fmtDuration } from '../math/format.js';
import { correccionTotal, rvFromRa, raFromRv, desvioFrom, ctFrom, updateDeclination, rmFromRa, rvFromRm } from '../nautical/compass.js';
import { fixTwoBearings, fixBearingDistance, fixTwoRanges, fixRunning, closestApproach } from '../nautical/positioning.js';
import { effectiveCourse, courseToSteer, rvFromRs, windSide, abatimientoSigned, distance as distanciaNavegada, timeFor } from '../nautical/kinematics.js';
import { deadReckoning } from '../nautical/sailing.js';

// ---------------------------------------------------------------------------
// Formato (coma decimal, como en el resto de la app)

const coma = (x, dec = 1) => round(x, dec).toFixed(dec).replace('.', ',');
/** Rumbo o demora: «022°». */
const R = (x, dec = 0) => fmtBearing(x, dec);
/** Ángulo con signo de cálculo: «+1°», «−3,5°». */
const S = (x, dec = 1) => fmtSignedNum(x, dec);
/** Entre paréntesis para las cuentas: «(−2°)». */
const P = (x, dec = 1) => `(${S(x, dec)})`;
/** Millas: «6,0 M». */
const M = (x, dec = 1) => `${coma(x, dec)} M`;
/** Nudos: «6 nudos» o «6,4 nudos». */
const N = (x, dec = 1) => `${Number.isInteger(round(x, dec)) ? String(round(x, dec)) : coma(x, dec)} nudos`;
/** Grados y minutos con su letra: «1° 40′ W». */
const GM = (x) => { const { sign, deg, min } = toDegMin(x, 0); return `${deg}° ${String(min).padStart(2, '0')}′ ${sign < 0 ? 'W' : 'E'}`; };
/** Grados y minutos con signo de cálculo: «−1° 40′». */
const GMs = (x) => { const { sign, deg, min } = toDegMin(x, 0); return `${sign < 0 ? '−' : '+'}${deg}° ${String(min).padStart(2, '0')}′`; };
/** Declinación como en los enunciados: «2° NW». */
const dmTexto = (dm) => `${String(Math.abs(dm)).replace('.', ',')}° ${dm < 0 ? 'NW' : 'NE'}`;
/** Minutos de arco con signo: «−11,3′». */
const MIN = (x, dec = 1) => `${x < 0 ? '−' : '+'}${coma(Math.abs(x), dec)}′`;
/** Posición: «36° 00,0' N  005° 45,0' W». */
const POS = (p) => fmtPos(p, 1);
/** Hora del reloj de bitácora. */
const HRB = (min) => fmtClock(min);
/** Grados y minutos (lat/lon de un enunciado) → grados decimales; longitud W negativa. */
const pos = (latG, latM, lonG, lonM) => ({ lat: latG + latM / 60, lon: -(lonG + lonM / 60) });
/** Redondeo de lo que se mide en la carta: rumbos al grado, distancias a la décima. */
const rumboMedido = (x) => norm360(Math.round(x));
const millasMedidas = (x) => round(x, 1);
/** Posición leída en la carta: al décimo de minuto. */
const leida = (p) => ({ lat: round(p.lat * 60, 1) / 60, lon: round(p.lon * 60, 1) / 60 });

/** Nombre del faro para el texto. */
const NOMBRES = {
  'punta-paloma': 'Punta Paloma', 'isla-tarifa': 'Isla de Tarifa', 'cabo-trafalgar': 'Cabo Trafalgar', 'punta-carnero': 'Punta Carnero',
  'punta-europa': 'Punta Europa', 'punta-almina': 'Punta Almina', 'punta-cires': 'Punta Cires', 'punta-alcazar': 'Punta Alcázar',
  'tarifa-espigon': 'Tarifa (espigón)', 'punta-malabata': 'Punta Malabata',
};

/** Categorías de la lista (en este orden). */
export const CATEGORIAS_PASOS = [
  { id: 'aguja', titulo: 'Aguja y corrección total' },
  { id: 'situacion', titulo: 'Situación' },
  { id: 'estima', titulo: 'Estima, rumbos y distancias' },
  { id: 'viento-corriente', titulo: 'Viento y corriente' },
  { id: 'analitica', titulo: 'Estima analítica' },
];

// ---------------------------------------------------------------------------
// Los tipos. Cada uno: { id, titulo, corto, categoria, niveles, conceptos, ejercicios, enunciado, datos, pasos,
// resultado, convenios, trampas, valores, carta }.
//   pasos[i] = { titulo, regla, texto, cuenta: string[], figura: 'carta' | { tipo: 'nortes', … } }
//   carta.elementos[j] = { paso, tipo, … } (paso 0: siempre a la vista; el resto, desde su paso)

function ctDe(dm, desvio) {
  const ct = correccionTotal(dm, desvio);
  return { dm, desvio, ct, cuenta: `Ct = dm + Δ = ${P(dm, 0)} + ${P(desvio, 0)} = ${S(ct, 1)}` };
}

/** Texto de los datos de aguja como en un enunciado: «dm 2° NW y desvío +1°». */
const agujaTexto = (a) => `declinación magnética es ${dmTexto(a.dm)} y el desvío ${S(a.desvio, 0)}`;

const pasoCt = (a, extra = '') => ({
  titulo: 'Corrección total',
  regla: 'Ct = dm + Δ, cada una con su signo: E (NE) suma, W (NW) resta.',
  texto: `La declinación ${dmTexto(a.dm)} vale ${S(a.dm, 0)} y el desvío ${S(a.desvio, 0)}. Se suman con su signo.${extra}`,
  cuenta: [a.cuenta],
  figura: { tipo: 'nortes', dm: a.dm, desvio: a.desvio, mostrar: ['dm', 'desvio', 'ct'], resalta: 'ct' },
});

// --- Situación por dos demoras simultáneas ----------------------------------------------------------------------
function dosDemoras(chart) {
  const A = chart.point('punta-paloma');
  const B = chart.point('isla-tarifa');
  const a = ctDe(-2, 1);
  const daA = 23;
  const daB = 90;
  const dvA = rvFromRa(daA, a.ct);
  const dvB = rvFromRa(daB, a.ct);
  const fix = fixTwoBearings(A, dvA, B, dvB);
  const corte = angleDist(dvA, dvB);
  const S1 = leida(fix);
  return {
    id: 'dos-demoras', titulo: 'Situación por dos demoras simultáneas', categoria: 'situacion', niveles: ['PER', 'PY'],
    corto: 'Dos demoras a la vez: pasarlas a verdaderas, trazarlas desde los faros y cortarlas.',
    conceptos: ['carta.situacion.dos-demoras'], ejercicios: ['situacion-dos-demoras'],
    enunciado: `Navegando al sur de la costa de Tarifa, tomamos a la vez demora de aguja del faro de Punta Paloma ${R(daA)} y del faro de Isla de Tarifa ${R(daB)}. La ${agujaTexto(a)}. Halla la situación.`,
    datos: [{ cifra: R(daA), texto: 'Da de Punta Paloma' }, { cifra: R(daB), texto: 'Da de Isla de Tarifa' }, { cifra: `${dmTexto(a.dm)} · ${S(a.desvio, 0)}`, texto: 'dm y desvío' }],
    pasos: [
      pasoCt(a),
      { titulo: 'Primera demora: a verdadera y a la carta', regla: 'Dv = Da + Ct. Desde el faro se traza la opuesta: Dv ± 180°.',
        texto: 'La demora va del barco al faro; en la carta se traza al revés, desde el faro. El barco está en algún punto de esa línea.',
        cuenta: [`Dv = ${R(daA)} + ${P(a.ct, 0)} = ${R(dvA)}`, `opuesta = ${R(dvA)} + 180° = ${R(dvA + 180)}`] },
      { titulo: 'Segunda demora', regla: 'La misma Ct para todas las demoras tomadas con la aguja a ese rumbo.',
        texto: 'Desde el faro de Isla de Tarifa, la opuesta de su demora verdadera.',
        cuenta: [`Dv = ${R(daB)} + ${P(a.ct, 0)} = ${R(dvB)}`, `opuesta = ${R(dvB)} + 180° = ${R(dvB + 180)}`] },
      { titulo: 'Situación', regla: 'El barco está en el corte de las dos líneas de posición.',
        texto: 'Marca el corte con un círculo y lee la latitud en la escala de los márgenes laterales y la longitud en la de arriba o abajo.',
        cuenta: [`S: ${fmtLat(S1.lat)}`, `   ${fmtLon(S1.lon)}`] },
      { titulo: 'Comprueba el corte', regla: 'Cuanto más se acerque a 90° el ángulo entre las dos líneas, más fiable es la situación.',
        texto: 'Con menos de unos 30° (o más de 150°) un error pequeño en una demora mueve mucho el corte.',
        cuenta: [`ángulo = ${R(dvB)} − ${R(dvA)} = ${Math.round(corte)}°`] },
    ],
    resultado: [{ cifra: fmtLat(S1.lat), texto: 'latitud' }, { cifra: fmtLon(S1.lon), texto: 'longitud' }],
    convenios: ['Signos del examen: E (NE) +, W (NW) −. Una declinación 2° NW es −2°.', 'Demora: del barco al objeto, contada desde el norte en el sentido de las agujas del reloj. En la carta se traza desde el objeto con la opuesta.'],
    trampas: [
      { error: 'Trazar la demora verdadera desde el faro sin invertirla.', porque: 'La línea sale hacia el otro lado y el corte cae en tierra o lejísimos. Desde el faro se traza siempre Dv ± 180°.' },
      { error: 'Restar la corrección total: Dv = Da − Ct.', porque: 'De aguja a verdadero se suma la Ct con su signo; se resta al pasar de verdadero a aguja.' },
      { error: 'Elegir dos faros casi en línea.', porque: 'El corte es tan agudo que medio grado de error en la demora mueve la situación varias décimas de milla.' },
    ],
    valores: { ct: a.ct, dvA, dvB, fix, corte },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: A, nombre: NOMBRES['punta-paloma'] }, { paso: 0, tipo: 'faro', at: B, nombre: NOMBRES['isla-tarifa'] },
      { paso: 2, tipo: 'linea', desde: A, rumbo: norm360(dvA + 180), millas: rhumbTo(A, fix).distance + 1.6, rotulo: `Dv ${R(dvA)}` },
      { paso: 3, tipo: 'linea', desde: B, rumbo: norm360(dvB + 180), millas: rhumbTo(B, fix).distance + 1.6, rotulo: `Dv ${R(dvB)}`, discontinua: true },
      { paso: 4, tipo: 'punto', at: fix, forma: 'situacion', rotulo: 'situación' },
      { paso: 5, tipo: 'angulo', en: fix, de: dvA, a: dvB, rotulo: `${Math.round(corte)}°` },
    ] },
  };
}

// --- Situación por demora y distancia ---------------------------------------------------------------------------
function demoraDistancia(chart) {
  const F = chart.point('cabo-trafalgar');
  const a = ctDe(-1, -2);
  const da = 50;
  const dist = 6;
  const dv = rvFromRa(da, a.ct);
  const fix = fixBearingDistance(F, dv, dist);
  const S1 = leida(fix);
  return {
    id: 'demora-distancia', titulo: 'Situación por demora y distancia', categoria: 'situacion', niveles: ['PER', 'PY'],
    corto: 'Una demora y una distancia al mismo faro: línea desde el faro y la distancia con el compás.',
    conceptos: ['carta.situacion.demora-distancia'], ejercicios: ['situacion-demora-distancia'],
    enunciado: `Tomamos demora de aguja del faro de Cabo Trafalgar ${R(da)} y, a la vez, el radar nos da ${M(dist)} hasta él. La ${agujaTexto(a)}. Halla la situación.`,
    datos: [{ cifra: R(da), texto: 'Da de Cabo Trafalgar' }, { cifra: M(dist), texto: 'distancia (radar)' }, { cifra: `${dmTexto(a.dm)} · ${S(a.desvio, 0)}`, texto: 'dm y desvío' }],
    pasos: [
      pasoCt(a),
      { titulo: 'Demora verdadera y su opuesta', regla: 'Dv = Da + Ct; desde el faro se traza Dv ± 180°.',
        texto: 'Desde el faro de Cabo Trafalgar se traza la línea hacia la opuesta: hacia donde está el barco.',
        cuenta: [`Dv = ${R(da)} + ${P(a.ct, 0)} = ${R(dv)}`, `opuesta = ${R(dv)} + 180° = ${R(dv + 180)}`] },
      { titulo: 'La distancia, con el compás', regla: 'Las millas se toman en la escala de latitudes, a la altura de la zona (1′ de latitud = 1 milla).',
        texto: 'Abre el compás 6 millas en la escala de los márgenes laterales y, con centro en el faro, corta la línea.',
        cuenta: [`radio = ${M(dist)} (escala de latitudes)`] },
      { titulo: 'Situación', regla: 'El barco está donde el arco corta la línea de la demora.',
        texto: 'Marca el corte y lee las coordenadas en las escalas de la carta.',
        cuenta: [`S: ${fmtLat(S1.lat)}`, `   ${fmtLon(S1.lon)}`] },
    ],
    resultado: [{ cifra: fmtLat(S1.lat), texto: 'latitud' }, { cifra: fmtLon(S1.lon), texto: 'longitud' }],
    convenios: ['E (NE) +, W (NW) −: dm 1° NW = −1°, desvío −2°.', 'La distancia se mide siempre en la escala de latitudes, nunca en la de longitudes.'],
    trampas: [
      { error: 'Medir las millas en la escala de longitudes (arriba o abajo de la carta).', porque: 'En la Mercator el minuto de longitud es más corto que la milla: la situación queda demasiado cerca del faro.' },
      { error: 'Trazar la Dv desde el faro.', porque: 'Con la Dv sin invertir el barco aparece al otro lado del faro, en tierra.' },
    ],
    valores: { ct: a.ct, dv, fix },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: F, nombre: NOMBRES['cabo-trafalgar'] },
      { paso: 2, tipo: 'linea', desde: F, rumbo: norm360(dv + 180), millas: dist + 1.6, rotulo: `Dv ${R(dv)}` },
      { paso: 3, tipo: 'arco', centro: F, radio: dist, hacia: norm360(dv + 180), abertura: 50, rotulo: M(dist, 0) },
      { paso: 4, tipo: 'punto', at: fix, forma: 'situacion', rotulo: 'situación' },
    ] },
  };
}

// --- Enfilación: Ct, desvío y situación ------------------------------------------------------------------------
function enfilacion(chart) {
  const C = chart.point('punta-carnero');
  const E = chart.point('punta-europa');
  const A = chart.point('punta-almina');
  const dvEnf = round(rhumbTo(E, C).bearing, 1); // la enfilación, medida en la carta uniendo los dos faros
  const daEnf = 247;
  const ct = ctFrom(dvEnf, daEnf);
  const dm = -2;
  const desvio = desvioFrom(ct, dm);
  const barco = rhumbDestination(E, norm360(dvEnf + 180), 4); // dónde está de verdad (para fijar la demora del ejemplo)
  const daA = Math.round(norm360(rhumbTo(barco, A).bearing - ct));
  const dvA = rvFromRa(daA, ct);
  const fix = fixTwoBearings(E, dvEnf, A, dvA);
  const S1 = leida(fix);
  const dEu = rhumbTo(fix, E).distance;
  return {
    id: 'enfilacion', titulo: 'Enfilación: corrección total, desvío y situación', categoria: 'aguja', niveles: ['PER', 'PY'],
    corto: 'Al cruzar una enfilación, la carta da la demora verdadera exacta: Ct = Dv − Da y Δ = Ct − dm.',
    conceptos: ['nav.ct.enfilacion', 'carta.situacion.enfilacion'], ejercicios: ['ct-enfilacion', 'distancia-faro'],
    enunciado: `Al este de Gibraltar vemos enfilados los faros de Punta Europa y Punta Carnero y los marcamos con la aguja a ${R(daEnf)}. En ese momento tomamos demora de aguja del faro de Punta Almina ${R(daA)}. La declinación magnética es ${dmTexto(dm)}. Halla la corrección total, el desvío, la situación y la distancia a Punta Europa.`,
    datos: [{ cifra: R(daEnf), texto: 'Da de la enfilación' }, { cifra: R(daA), texto: 'Da de Punta Almina' }, { cifra: dmTexto(dm), texto: 'declinación' }],
    pasos: [
      { titulo: 'La enfilación en la carta', regla: 'Dos marcas una detrás de otra: la demora verdadera es la recta que las une, medida en la carta.',
        texto: 'Une los dos faros con la regla y prolonga la línea hacia el mar. Mide su dirección con el transportador, en el sentido del barco hacia los faros.',
        cuenta: [`Dv enfilación = ${R(dvEnf, 1)}`] },
      { titulo: 'Corrección total', regla: 'Ct = Dv − Da: la verdadera de la carta menos la de aguja.',
        texto: 'Es la única forma de conocer la Ct sin la tablilla: la enfilación no tiene error de aguja.',
        cuenta: [`Ct = ${R(dvEnf, 1)} − ${R(daEnf)} = ${S(ct, 1)}`],
        figura: { tipo: 'nortes', dm, desvio, mostrar: ['ct'], resalta: 'ct' } },
      { titulo: 'Desvío', regla: 'Δ = Ct − dm (la dm con su signo).',
        texto: `La declinación ${dmTexto(dm)} es ${S(dm, 0)}: el desvío es lo que falta hasta la Ct.`,
        cuenta: [`Δ = ${S(ct, 1)} − ${P(dm, 0)} = ${S(desvio, 1)}`],
        figura: { tipo: 'nortes', dm, desvio, mostrar: ['dm', 'desvio', 'ct'], resalta: 'desvio' } },
      { titulo: 'Demora de Punta Almina', regla: 'Dv = Da + Ct, con la Ct que acabas de sacar.',
        texto: 'Desde el faro de Punta Almina se traza la opuesta.',
        cuenta: [`Dv = ${R(daA)} + ${P(ct, 1)} = ${R(dvA, 1)}`, `opuesta = ${R(dvA + 180, 1)}`] },
      { titulo: 'Situación', regla: 'Corte de la enfilación con la otra línea de posición.',
        texto: 'Lee las coordenadas del corte.',
        cuenta: [`S: ${fmtLat(S1.lat)}`, `   ${fmtLon(S1.lon)}`] },
      { titulo: 'Distancia a Punta Europa', regla: 'Distancia: con el compás, en la escala de latitudes.',
        texto: 'Toma con el compás la distancia de la situación al faro y llévala a la escala de latitudes de la zona.',
        cuenta: [`d = ${M(millasMedidas(dEu))}`] },
    ],
    resultado: [{ cifra: S(ct, 1), texto: 'Ct' }, { cifra: S(desvio, 1), texto: 'desvío' }, { cifra: M(millasMedidas(dEu)), texto: 'a Punta Europa' }],
    convenios: ['Ct = Dv − Da (de la carta menos la de aguja); Δ = Ct − dm.', 'Una Ct negativa es W: el norte de aguja queda a la izquierda del verdadero.'],
    trampas: [
      { error: 'Medir la enfilación en el sentido contrario (del faro hacia el barco).', porque: 'Sale la opuesta y la Ct se va a unos 180°. La demora es siempre del barco hacia las marcas.' },
      { error: 'Hacer Da − Dv.', porque: 'La Ct cambia de signo. Piensa: Dv = Da + Ct, luego Ct = Dv − Da.' },
      { error: 'Olvidar el signo de la dm al sacar el desvío.', porque: 'Δ = Ct − dm: con dm W (negativa), restar un negativo es sumar.' },
    ],
    valores: { dvEnf, ct, desvio, dvA, fix, dEu },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: C, nombre: NOMBRES['punta-carnero'] }, { paso: 0, tipo: 'faro', at: E, nombre: NOMBRES['punta-europa'] }, { paso: 0, tipo: 'faro', at: A, nombre: NOMBRES['punta-almina'] },
      { paso: 1, tipo: 'linea', desde: C, rumbo: norm360(dvEnf + 180), millas: rhumbTo(C, fix).distance + 1.6, rotulo: `Dv ${R(dvEnf, 1)}`, discontinua: true },
      { paso: 4, tipo: 'linea', desde: A, rumbo: norm360(dvA + 180), millas: rhumbTo(A, fix).distance + 1.6, rotulo: `Dv ${R(dvA, 1)}` },
      { paso: 5, tipo: 'punto', at: fix, forma: 'situacion', rotulo: 'situación' },
      { paso: 6, tipo: 'seg', de: fix, a: E, rotulo: M(millasMedidas(dEu)) },
    ] },
  };
}

// --- Corrección total con la declinación de la carta y el desvío --------------------------------------------------
function ctDmDesvio() {
  const dmBase = -(2 + 50 / 60);
  const anyoBase = 2005;
  const variacion = 7 / 60; // 7′ E al año
  const anyo = 2015;
  const anyos = anyo - anyoBase;
  const dm = round(updateDeclination(dmBase, anyoBase, variacion, anyo) * 60, 0) / 60;
  const ra = 75;
  const desvio = 3;
  const ct = correccionTotal(dm, desvio);
  const rv = rvFromRa(ra, ct);
  const rm = rmFromRa(ra, desvio);
  const rv2 = rvFromRm(rm, dm);
  const total = Math.round(anyos * variacion * 60);
  return {
    id: 'ct-dm-desvio', titulo: 'Corrección total con la declinación y el desvío', categoria: 'aguja', niveles: ['PER', 'PY'],
    corto: 'Actualizar la declinación de la carta, tomar el desvío de la tablilla y pasar el rumbo de aguja a verdadero.',
    conceptos: ['nav.ct.dm-desvio', 'nav.ct.convertir'], ejercicios: ['conversion-rumbos'],
    enunciado: `En la carta del Estrecho se lee «2° 50′ W 2005 (7′ E)». En ${anyo} navegamos al rumbo de aguja ${R(ra)} y la tablilla de desvíos da, para ese rumbo, ${S(desvio, 0)}. Halla la declinación del año, la corrección total y el rumbo verdadero.`,
    datos: [{ cifra: '2° 50′ W', texto: 'dm de la carta (2005)' }, { cifra: '7′ E', texto: 'variación anual' }, { cifra: R(ra), texto: `Ra (año ${anyo})` }],
    pasos: [
      { titulo: 'Años y variación', regla: 'Variación acumulada = años transcurridos × variación anual.',
        texto: 'La variación de la carta es hacia el E: la aguja magnética se va moviendo hacia el E cada año.',
        cuenta: [`${anyo} − ${anyoBase} = ${anyos} años`, `${anyos} × 7′ = ${total}′ = ${GM(total / 60)}`],
        figura: { tipo: 'nortes', dm, desvio, dmBase, mostrar: ['dmBase', 'variacion'], resalta: 'variacion' } },
      { titulo: 'Declinación del año', regla: 'dm del año = dm de la carta + variación, con sus signos (E +, W −).',
        texto: 'Una declinación W que se mueve hacia el E disminuye: se acerca a cero.',
        cuenta: [`dm = (${GMs(dmBase)}) + (${GMs(total / 60)}) = ${GMs(dm)}`, `dm ${anyo} = ${GM(dm)}`],
        figura: { tipo: 'nortes', dm, desvio, dmBase, mostrar: ['dmBase', 'dm'], resalta: 'dm' } },
      { titulo: 'Desvío de la tablilla', regla: 'El desvío depende del rumbo: se entra en la tablilla con el rumbo de aguja.',
        texto: `Para el rumbo de aguja ${R(ra)} la tablilla da ${S(desvio, 0)}: el norte de aguja está ${desvio > 0 ? 'al E' : 'al W'} del magnético.`,
        cuenta: [`Δ (Ra ${R(ra)}) = ${S(desvio, 0)} = ${GM(desvio)}`],
        figura: { tipo: 'nortes', dm, desvio, mostrar: ['dm', 'desvio'], resalta: 'desvio' } },
      { titulo: 'Corrección total', regla: 'Ct = dm + Δ.',
        texto: 'Se suman los dos ángulos con su signo; el resultado dice dónde queda el norte de aguja respecto al verdadero.',
        cuenta: [`Ct = (${GMs(dm)}) + (${GMs(desvio)}) = ${GMs(ct)}`, `Ct = ${GM(ct)}`],
        figura: { tipo: 'nortes', dm, desvio, mostrar: ['dm', 'desvio', 'ct'], resalta: 'ct' } },
      { titulo: 'Rumbo verdadero', regla: 'Rv = Ra + Ct (y al revés, Ra = Rv − Ct).',
        texto: 'Con la Ct positiva el rumbo verdadero es mayor que el de aguja.',
        cuenta: [`Rv = ${R(ra)} + ${GMs(ct).slice(1)} = ${R(Math.floor(rv))} ${String(Math.round((rv % 1) * 60)).padStart(2, '0')}′`, `Rv ≈ ${R(rv, 1)}`],
        figura: { tipo: 'nortes', dm, desvio, mostrar: ['ct', 'rumbo'], resalta: 'rumbo', ra, rv } },
      { titulo: 'Comprobación por el magnético', regla: 'Rm = Ra + Δ y Rv = Rm + dm: sale lo mismo.',
        texto: 'Si las dos cuentas no coinciden, hay un signo cambiado.',
        cuenta: [`Rm = ${R(ra)} + ${P(desvio, 0)} = ${R(rm)}`, `Rv = ${R(rm)} + (${GMs(dm)}) = ${R(Math.floor(rv2))} ${String(Math.round((rv2 % 1) * 60)).padStart(2, '0')}′`],
        figura: { tipo: 'nortes', dm, desvio, mostrar: ['dm', 'desvio', 'ct', 'rumbo'], resalta: 'dm', ra, rv } },
    ],
    resultado: [{ cifra: GM(dm), texto: `dm ${anyo}` }, { cifra: GM(ct), texto: 'Ct' }, { cifra: R(rv, 1), texto: 'Rv' }],
    convenios: ['E (o NE) +, W (o NW) −. «2° 50′ W» es −2° 50′.', 'La variación anual se suma con su signo: «7′ E» es +7′ al año.', 'El desvío es del rumbo de aguja que se lleva: cambia al cambiar de rumbo.'],
    trampas: [
      { error: 'Sumar la variación al valor de la dm sin mirar los signos (2° 50′ + 1° 10′ = 4° W).', porque: 'Una dm W con variación E disminuye. Con signos: −2° 50′ + 1° 10′ = −1° 40′.' },
      { error: 'Entrar en la tablilla con el rumbo verdadero.', porque: 'La tablilla de desvíos se hace con la aguja de a bordo: se entra con el rumbo de aguja (o con el magnético, si así lo dice).' },
      { error: 'Usar la Ct de un rumbo para otro rumbo distinto.', porque: 'El desvío cambia con el rumbo, y con él la Ct.' },
    ],
    valores: { dm, ct, rv, rm, rv2, desvio },
    carta: null,
  };
}

// --- Estima directa ----------------------------------------------------------------------------------------------
function estimaDirecta() {
  const salida = pos(36, 8, 6, 12);
  const a = ctDe(-3, 1);
  const ra = 140;
  const v = 6;
  const t0 = 10 * 60;
  const t1 = 11 * 60 + 30;
  const horas = (t1 - t0) / 60;
  const rv = rvFromRa(ra, a.ct);
  const d = distanciaNavegada(v, horas);
  const se = rhumbDestination(salida, rv, d);
  const S1 = leida(se);
  return {
    id: 'estima', titulo: 'Situación de estima', categoria: 'estima', niveles: ['PER', 'PY'],
    corto: 'Desde una situación conocida, a un rumbo y una velocidad durante un tiempo: ¿dónde estamos?',
    conceptos: ['carta.estima'], ejercicios: ['estima-directa'],
    enunciado: `A HRB ${HRB(t0)}, en situación ${POS(salida)}, damos rumbo de aguja ${R(ra)} con ${N(v)}. La ${agujaTexto(a)}. Sin viento ni corriente, ¿cuál es la situación de estima a HRB ${HRB(t1)}?`,
    datos: [{ cifra: R(ra), texto: 'Ra' }, { cifra: N(v), texto: 'velocidad' }, { cifra: `${HRB(t0)}–${HRB(t1)}`, texto: 'HRB' }],
    pasos: [
      { titulo: 'Situar la salida', regla: 'La latitud en la escala de los márgenes laterales; la longitud en la de arriba o abajo.',
        texto: 'Con la regla paralela, lleva el paralelo de la latitud y el meridiano de la longitud: la salida está en el cruce.',
        cuenta: [`l = ${fmtLat(salida.lat)}`, `L = ${fmtLon(salida.lon)}`] },
      { titulo: 'Rumbo verdadero', regla: 'Rv = Ra + Ct, con Ct = dm + Δ.',
        texto: 'En la carta solo se trazan rumbos verdaderos: primero se corrige el de aguja.',
        cuenta: [a.cuenta, `Rv = ${R(ra)} + ${P(a.ct, 0)} = ${R(rv)}`] },
      { titulo: 'Distancia navegada', regla: 'd = v · t (millas = nudos × horas).',
        texto: `De ${HRB(t0)} a ${HRB(t1)} pasan ${fmtDuration(horas)}: en horas, ${coma(horas, 1)}.`,
        cuenta: [`d = ${coma(v, 0)} × ${coma(horas, 1)} = ${M(d)}`] },
      { titulo: 'Situación de estima', regla: 'Desde la salida, el Rv y la distancia: la estima se marca con un triángulo.',
        texto: 'Traza el rumbo con el transportador, toma las millas en la escala de latitudes y lee las coordenadas del extremo.',
        cuenta: [`Se: ${fmtLat(S1.lat)}`, `    ${fmtLon(S1.lon)}`] },
    ],
    resultado: [{ cifra: fmtLat(S1.lat), texto: 'latitud de estima' }, { cifra: fmtLon(S1.lon), texto: 'longitud de estima' }],
    convenios: ['Rv = Ra + Ct; en la carta solo van rumbos verdaderos.', 'Horas y minutos: 1 h 30 min son 1,5 h (no 1,3).'],
    trampas: [
      { error: 'Trazar el rumbo de aguja directamente.', porque: 'El transportador mide desde el norte verdadero: con el Ra el error es toda la Ct.' },
      { error: 'Escribir 1 h 30 min como 1,30 h.', porque: 'Los minutos se dividen entre 60: 30 min = 0,5 h, y la distancia sale de 9 millas, no de 7,8.' },
    ],
    valores: { ct: a.ct, rv, d, se },
    carta: { elementos: [
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: `salida ${HRB(t0)}` },
      { paso: 2, tipo: 'seg', de: salida, a: rhumbDestination(salida, rv, d + 2.2), rotulo: `Rv ${R(rv)}`, discontinua: true },
      { paso: 3, tipo: 'vector', desde: salida, rumbo: rv, millas: d, puntas: 1, rotulo: M(d) },
      { paso: 4, tipo: 'punto', at: se, forma: 'estima', rotulo: `Se ${HRB(t1)}` },
    ] },
  };
}

// --- Rumbo y distancia directos, hora de llegada -----------------------------------------------------------------
function rumboDistancia(chart) {
  const salida = pos(35, 53, 5, 34);
  const D = chart.point('tarifa-espigon');
  const a = ctDe(-2, -1);
  const v = 6;
  const t0 = 8 * 60 + 15;
  const m = rhumbTo(salida, D);
  const rv = rumboMedido(m.bearing);
  const d = millasMedidas(m.distance);
  const ra = raFromRv(rv, a.ct);
  const horas = timeFor(d, v);
  const t1 = t0 + Math.round(horas * 60);
  return {
    id: 'rumbo-distancia', titulo: 'Rumbo, distancia y hora de llegada', categoria: 'estima', niveles: ['PER', 'PY'],
    corto: 'Qué rumbo de aguja dar para ir a un punto, cuántas millas son y a qué hora llegamos.',
    conceptos: ['carta.rumbo-distancia'], ejercicios: ['rumbo-distancia'],
    enunciado: `A HRB ${HRB(t0)} estamos en ${POS(salida)} y queremos ir al espigón de Tarifa a ${N(v)}. La ${agujaTexto(a)}. Halla el rumbo de aguja, la distancia y la hora de llegada.`,
    datos: [{ cifra: N(v), texto: 'velocidad' }, { cifra: HRB(t0), texto: 'HRB de salida' }, { cifra: `${dmTexto(a.dm)} · ${S(a.desvio, 0)}`, texto: 'dm y desvío' }],
    pasos: [
      { titulo: 'Salida y llegada', regla: 'Sitúa los dos puntos antes de medir nada.',
        texto: 'La salida por sus coordenadas; la llegada es la luz del espigón de Tarifa.',
        cuenta: [`salida: ${fmtLat(salida.lat)}`, `        ${fmtLon(salida.lon)}`] },
      { titulo: 'Rumbo verdadero y distancia', regla: 'Une los dos puntos: la recta es el rumbo verdadero; su longitud, la distancia.',
        texto: 'Mide el rumbo con el transportador desde el norte, en el sentido de la marcha, y la distancia con el compás en la escala de latitudes.',
        cuenta: [`Rv = ${R(rv)}`, `d = ${M(d)}`] },
      { titulo: 'Rumbo de aguja', regla: 'Ra = Rv − Ct (al pasar de verdadero a aguja, la Ct se resta).',
        texto: 'Es el rumbo que se da al timonel: el que marca la aguja de a bordo.',
        cuenta: [a.cuenta, `Ra = ${R(rv)} − ${P(a.ct, 0)} = ${R(ra)}`],
        figura: { tipo: 'nortes', dm: a.dm, desvio: a.desvio, mostrar: ['ct', 'rumbo'], resalta: 'rumbo', ra, rv } },
      { titulo: 'Tiempo', regla: 't = d / v (horas = millas / nudos).',
        texto: 'Pasa los decimales de hora a minutos multiplicando por 60.',
        cuenta: [`t = ${coma(d, 1)} / ${coma(v, 0)} = ${coma(horas, 3)} h`, `t = ${fmtDuration(horas)}`] },
      { titulo: 'Hora de llegada', regla: 'HRB de llegada = HRB de salida + tiempo.',
        texto: 'Suma horas con horas y minutos con minutos; si pasan de 60, lleva una hora.',
        cuenta: [`${HRB(t0)} + ${fmtDuration(horas)} = ${HRB(t1)}`] },
    ],
    resultado: [{ cifra: R(ra), texto: 'Ra' }, { cifra: M(d), texto: 'distancia' }, { cifra: HRB(t1), texto: 'HRB de llegada' }],
    convenios: ['Ra = Rv − Ct: con Ct negativa, el rumbo de aguja es mayor que el verdadero.', 'Tiempo en horas decimales × 60 = minutos.'],
    trampas: [
      { error: 'Sumar la Ct al pasar a aguja (Ra = Rv + Ct).', porque: 'Se suma de aguja a verdadero; al revés se resta. Con Ct −3° el Ra sale 6° desviado.' },
      { error: 'Leer 1,95 h como 1 h 95 min.', porque: '0,95 h × 60 = 57 min: 1 h 57 min.' },
    ],
    valores: { ct: a.ct, rv, d, ra, horas, t1, exacto: m },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: chart.point('isla-tarifa'), nombre: NOMBRES['isla-tarifa'] },
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: `salida ${HRB(t0)}` },
      { paso: 1, tipo: 'punto', at: D, forma: 'destino', rotulo: 'espigón' },
      { paso: 2, tipo: 'vector', desde: salida, hasta: D, puntas: 1, rotulo: `Rv ${R(rv)} · ${M(d)}` },
      { paso: 4, tipo: 'nota', en: [salida, D], texto: `t ${fmtDuration(horas)}` },
      { paso: 5, tipo: 'punto', at: D, forma: 'situacion', rotulo: `llegada ${HRB(t1)}` },
    ] },
  };
}

// --- Rumbo para pasar a una distancia de un faro ------------------------------------------------------------------
function pasarDistancia(chart) {
  const salida = pos(36, 0, 6, 9);
  const F = chart.point('cabo-trafalgar');
  const a = ctDe(-1, 3);
  const dPaso = 3;
  const m = rhumbTo(salida, F);
  const dv = rumboMedido(m.bearing);
  const D = millasMedidas(m.distance);
  const alfa = toDeg(Math.asin(dPaso / D));
  const rvExacto = norm360(dv - alfa); // faro por estribor: la tangente queda a la izquierda de la demora
  const rv = rumboMedido(rvExacto);
  const ra = raFromRv(rv, a.ct);
  const ca = closestApproach(salida, rv, F);
  const traves = norm360(rv + 90);
  return {
    id: 'pasar-distancia', titulo: 'Rumbo para pasar a una distancia de un faro', categoria: 'estima', niveles: ['PER', 'PY'],
    corto: 'La tangente al círculo de seguridad: sen α = d / D y Rv = Dv ± α según la banda.',
    conceptos: ['carta.pasar-distancia'], ejercicios: ['rumbo-pasar-distancia'],
    enunciado: `Estamos en ${POS(salida)} y queremos pasar a ${M(dPaso, 0)} del faro de Cabo Trafalgar dejándolo por estribor. La ${agujaTexto(a)}. Halla el rumbo de aguja y la demora del faro cuando pasemos por su través.`,
    datos: [{ cifra: M(dPaso, 0), texto: 'distancia de paso' }, { cifra: 'estribor', texto: 'banda del faro' }, { cifra: `${dmTexto(a.dm)} · ${S(a.desvio, 0)}`, texto: 'dm y desvío' }],
    pasos: [
      { titulo: 'Situación', regla: 'Sitúa el barco con sus coordenadas.',
        texto: 'Paralelo y meridiano con la regla paralela; la salida está en el cruce.',
        cuenta: [`l = ${fmtLat(salida.lat)}`, `L = ${fmtLon(salida.lon)}`] },
      { titulo: 'Demora y distancia al faro', regla: 'Une la situación con el faro: Dv y distancia D.',
        texto: 'Es la referencia para el ángulo de la tangente.',
        cuenta: [`Dv = ${R(dv)}`, `D = ${M(D)}`] },
      { titulo: 'Círculo de seguridad', regla: 'Con centro en el faro, un arco de radio la distancia de paso.',
        texto: 'Por fuera de ese círculo el barco pasa a más de 3 millas del faro.',
        cuenta: [`radio = ${M(dPaso)}`] },
      { titulo: 'La tangente', regla: 'sen α = d / D. Faro por estribor: Rv = Dv − α. Por babor: Rv = Dv + α.',
        texto: 'Para dejar el faro a estribor, el rumbo va por la izquierda de la demora (más hacia babor).',
        cuenta: [`sen α = ${coma(dPaso, 0)} / ${coma(D, 1)} → α = ${coma(alfa, 1)}°`, `Rv = ${R(dv)} − ${coma(alfa, 1)}° = ${R(rvExacto, 1)} ≈ ${R(rv)}`] },
      { titulo: 'Rumbo de aguja', regla: 'Ra = Rv − Ct.',
        texto: 'La Ct se resta con su signo.',
        cuenta: [a.cuenta, `Ra = ${R(rv)} − ${P(a.ct, 0)} = ${R(ra)}`],
        figura: { tipo: 'nortes', dm: a.dm, desvio: a.desvio, mostrar: ['ct', 'rumbo'], resalta: 'rumbo', ra, rv } },
      { titulo: 'Por el través', regla: 'El punto más cercano es el través: Dv = Rv + 90° (estribor) o Rv − 90° (babor).',
        texto: 'Cuando el faro demore a 90° de la proa por estribor estaremos a la distancia de paso.',
        cuenta: [`Dv través = ${R(rv)} + 90° = ${R(traves)}`, `distancia = ${M(ca.distance)}`] },
    ],
    resultado: [{ cifra: R(rv), texto: 'Rv' }, { cifra: R(ra), texto: 'Ra' }, { cifra: R(traves), texto: 'Dv del faro por el través' }],
    convenios: ['Faro por estribor: Rv = Dv − α. Faro por babor: Rv = Dv + α.', 'Marcación de estribor positiva: el través de estribor es Rv + 90°.'],
    trampas: [
      { error: 'Sumar α con el faro por estribor.', porque: 'El barco pasaría por el otro lado del faro (por tierra en este caso). Dibuja siempre el círculo y mira de qué lado queda.' },
      { error: 'Usar tg α en vez de sen α.', porque: 'El radio del círculo es perpendicular a la tangente: en el triángulo, d es el cateto opuesto y D la hipotenusa.' },
    ],
    valores: { ct: a.ct, dv, D, alfa, rvExacto, rv, ra, ca, traves },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: F, nombre: NOMBRES['cabo-trafalgar'] },
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: 'salida' },
      { paso: 2, tipo: 'seg', de: salida, a: F, rotulo: `Dv ${R(dv)} · ${M(D)}`, discontinua: true },
      { paso: 3, tipo: 'arco', centro: F, radio: dPaso, hacia: norm360(traves + 180), abertura: 150, rotulo: M(dPaso, 0) },
      { paso: 4, tipo: 'vector', desde: salida, rumbo: rv, millas: ca.along + 2.5, puntas: 1, rotulo: `Rv ${R(rv)}` },
      { paso: 4, tipo: 'angulo', en: salida, de: rv, a: dv, rotulo: `α ${coma(alfa, 0)}°` },
      { paso: 6, tipo: 'seg', de: ca.point, a: F, rotulo: `través ${R(traves)}` },
      { paso: 6, tipo: 'punto', at: ca.point, forma: 'estima', rotulo: 'través' },
    ] },
  };
}

// --- Demoras no simultáneas ---------------------------------------------------------------------------------------
function noSimultaneas(chart) {
  const A = chart.point('punta-paloma');
  const B = chart.point('isla-tarifa');
  const a = ctDe(-1, 2);
  const real1 = pos(36, 0, 5, 47); // donde está de verdad a la primera hora (para fijar las demoras del ejemplo)
  const ra = 94;
  const rv = rvFromRa(ra, a.ct);
  const v = 6;
  const t0 = 10 * 60;
  const t1 = 10 * 60 + 50;
  const d = distanciaNavegada(v, (t1 - t0) / 60);
  const real2 = rhumbDestination(real1, rv, d);
  const da1 = Math.round(norm360(rhumbTo(real1, A).bearing - a.ct));
  const da2 = Math.round(norm360(rhumbTo(real2, B).bearing - a.ct));
  const dv1 = rvFromRa(da1, a.ct);
  const dv2 = rvFromRa(da2, a.ct);
  const r = fixRunning(A, dv1, B, dv2, rv, d);
  const S2 = leida(r.fix);
  const A2 = rhumbDestination(A, rv, d);
  return {
    id: 'no-simultaneas', titulo: 'Situación por demoras no simultáneas', categoria: 'situacion', niveles: ['PY'],
    corto: 'Dos demoras a horas distintas: trasladar la primera línea lo navegado y cortarla con la segunda.',
    conceptos: ['carta.situacion.no-simultaneas'], ejercicios: ['demoras-no-simultaneas'],
    enunciado: `Navegamos al rumbo de aguja ${R(ra)} con ${N(v)}, sin viento ni corriente; la ${agujaTexto(a)}. A HRB ${HRB(t0)} tomamos demora de aguja del faro de Punta Paloma ${R(da1)} y a HRB ${HRB(t1)} demora de aguja del faro de Isla de Tarifa ${R(da2)}. Halla la situación a HRB ${HRB(t1)}.`,
    datos: [{ cifra: `${R(da1)} · ${HRB(t0)}`, texto: 'Da de Punta Paloma' }, { cifra: `${R(da2)} · ${HRB(t1)}`, texto: 'Da de Isla de Tarifa' }, { cifra: `${R(ra)} · ${N(v)}`, texto: 'Ra y velocidad' }],
    pasos: [
      { ...pasoCt(a), titulo: 'Todo a verdadero', regla: 'Ct = dm + Δ; Dv = Da + Ct; Rv = Ra + Ct.', texto: 'Con la misma Ct se corrigen el rumbo y las dos demoras.',
        cuenta: [a.cuenta, `Rv = ${R(ra)} + ${P(a.ct, 0)} = ${R(rv)}`, `Dv1 = ${R(dv1)} · Dv2 = ${R(dv2)}`] },
      { titulo: `Primera línea (${HRB(t0)})`, regla: 'Desde el faro, la opuesta de la demora.',
        texto: 'A esa hora el barco estaba en algún punto de esta línea, pero no sabemos cuál.',
        cuenta: [`opuesta = ${R(dv1)} + 180° = ${R(dv1 + 180)}`] },
      { titulo: 'Traslado', regla: 'Se traslada la primera línea paralela a sí misma el rumbo y la distancia navegados entre las dos demoras.',
        texto: 'Desde un punto cualquiera de la línea (aquí el propio faro) traza el Rv y mide la distancia; por el extremo, una paralela.',
        cuenta: [`d = ${coma(v, 0)} × ${t1 - t0} / 60 = ${M(d)}`, `al Rv ${R(rv)}`] },
      { titulo: `Segunda línea (${HRB(t1)})`, regla: 'La segunda demora se traza normal, desde su faro.',
        texto: 'Es la línea de posición a la hora de la segunda demora.',
        cuenta: [`opuesta = ${R(dv2)} + 180° = ${R(dv2 + 180)}`] },
      { titulo: `Situación a las ${HRB(t1)}`, regla: 'El corte de la línea trasladada con la segunda es la situación a la hora de la segunda demora.',
        texto: 'Lee las coordenadas del corte.',
        cuenta: [`S: ${fmtLat(S2.lat)}`, `   ${fmtLon(S2.lon)}`] },
      { titulo: `Y a las ${HRB(t0)}, si la piden`, regla: 'Desde la situación, el rumbo opuesto y la misma distancia: cae sobre la primera línea.',
        texto: 'Así compruebas el traslado: el punto tiene que quedar sobre la línea sin trasladar.',
        cuenta: [`${R(rv + 180)} y ${M(d)} desde S`] },
    ],
    resultado: [{ cifra: fmtLat(S2.lat), texto: `latitud a las ${HRB(t1)}` }, { cifra: fmtLon(S2.lon), texto: `longitud a las ${HRB(t1)}` }],
    convenios: ['El traslado usa el rumbo y la distancia sobre el fondo: el Rv sin viento ni corriente; con viento, el de superficie; con corriente, el efectivo.', 'La situación hallada es la de la hora de la SEGUNDA demora.'],
    trampas: [
      { error: 'Trasladar la segunda línea en lugar de la primera.', porque: 'Se traslada siempre la línea más antigua hacia la hora más reciente.' },
      { error: 'Trasladar al rumbo de aguja o con la distancia mal pasada de minutos.', porque: 'El traslado es un rumbo verdadero en la carta; 50 min son 0,83 h.' },
      { error: 'Dar como resultado la situación de la primera hora.', porque: 'El corte de la trasladada con la segunda es la situación a la hora de la segunda.' },
    ],
    valores: { ct: a.ct, rv, dv1, dv2, d, fix: r.fix, first: r.first },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: A, nombre: NOMBRES['punta-paloma'] }, { paso: 0, tipo: 'faro', at: B, nombre: NOMBRES['isla-tarifa'] },
      { paso: 2, tipo: 'linea', desde: A, rumbo: norm360(dv1 + 180), millas: rhumbTo(A, r.first).distance + 2, rotulo: `${HRB(t0)} · Dv ${R(dv1)}` },
      { paso: 3, tipo: 'vector', desde: A, rumbo: rv, millas: d, puntas: 1, rotulo: M(d) },
      { paso: 3, tipo: 'linea', desde: A2, rumbo: norm360(dv1 + 180), millas: rhumbTo(A2, r.fix).distance + 2, rotulo: 'trasladada', discontinua: true },
      { paso: 4, tipo: 'linea', desde: B, rumbo: norm360(dv2 + 180), millas: rhumbTo(B, r.fix).distance + 2, rotulo: `${HRB(t1)} · Dv ${R(dv2)}` },
      { paso: 5, tipo: 'punto', at: r.fix, forma: 'situacion', rotulo: HRB(t1) },
      { paso: 6, tipo: 'vector', desde: r.first, hasta: r.fix, puntas: 1, discontinua: true },
      { paso: 6, tipo: 'punto', at: r.first, forma: 'estima', rotulo: HRB(t0) },
    ] },
  };
}

// --- Situación por dos distancias ---------------------------------------------------------------------------------
function dosDistancias(chart) {
  const A = chart.point('punta-almina');
  const B = chart.point('punta-europa');
  const estima = pos(35, 56, 5, 22);
  const dA = 4.6;
  const dB = 10.7;
  const cortes = fixTwoRanges(A, dA, B, dB, estima);
  const fix = cortes[0];
  const otro = cortes[1];
  const S1 = leida(fix);
  return {
    id: 'dos-distancias', titulo: 'Situación por dos distancias', categoria: 'situacion', niveles: ['PER', 'PY'],
    corto: 'Dos distancias (radar) a dos puntos: dos arcos de compás y elegir el corte que tiene sentido.',
    conceptos: ['carta.situacion.distancias'], ejercicios: [],
    enunciado: `Al norte de Ceuta, el radar nos da a la vez ${M(dA)} al faro de Punta Almina y ${M(dB)} al faro de Punta Europa. Nuestra estima nos sitúa hacia ${POS(estima)}. Halla la situación.`,
    datos: [{ cifra: M(dA), texto: 'a Punta Almina' }, { cifra: M(dB), texto: 'a Punta Europa' }],
    pasos: [
      { titulo: 'Primer arco', regla: 'Distancia a un punto: un arco con centro en el punto y radio la distancia.',
        texto: 'Abre el compás en la escala de latitudes, a la altura de la zona, y traza el arco por la parte del mar.',
        cuenta: [`radio = ${M(dA)} (centro Punta Almina)`] },
      { titulo: 'Segundo arco', regla: 'Cada distancia es una línea de posición circular.',
        texto: 'Con centro en Punta Europa y el compás abierto la otra distancia.',
        cuenta: [`radio = ${M(dB)} (centro Punta Europa)`] },
      { titulo: 'Elegir el corte', regla: 'Dos circunferencias se cortan en dos puntos: vale el que está en el mar y cerca de la estima.',
        texto: `El otro corte ${otro ? 'queda lejos de la estima' : 'no existe'}: se descarta.`,
        cuenta: otro ? [`otro corte: ${fmtLat(leida(otro).lat)}`, `           ${fmtLon(leida(otro).lon)}`] : ['un solo corte'] },
      { titulo: 'Situación', regla: 'Lee las coordenadas del corte elegido.',
        texto: 'Latitud en los márgenes laterales; longitud arriba o abajo.',
        cuenta: [`S: ${fmtLat(S1.lat)}`, `   ${fmtLon(S1.lon)}`] },
    ],
    resultado: [{ cifra: fmtLat(S1.lat), texto: 'latitud' }, { cifra: fmtLon(S1.lon), texto: 'longitud' }],
    convenios: ['La distancia se toma con el compás en la escala de latitudes: 1′ de latitud = 1 milla.', 'Una distancia sola no sitúa: hace falta otra línea (otra distancia, una demora o una sonda).'],
    trampas: [
      { error: 'Abrir el compás en la escala de longitudes.', porque: 'En la Mercator el minuto de longitud es más corto: los arcos salen pequeños y el corte se desplaza.' },
      { error: 'Quedarse con el primer corte que se ve.', porque: 'Hay dos: mira cuál está en el mar y cerca de la estima.' },
    ],
    valores: { fix, otro, dA, dB },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: A, nombre: NOMBRES['punta-almina'] }, { paso: 0, tipo: 'faro', at: B, nombre: NOMBRES['punta-europa'] },
      { paso: 1, tipo: 'arco', centro: A, radio: dA, hacia: rhumbTo(A, fix).bearing, abertura: 90, rotulo: M(dA) },
      { paso: 2, tipo: 'arco', centro: B, radio: dB, hacia: rhumbTo(B, fix).bearing, abertura: 34, rotulo: M(dB) },
      { paso: 3, tipo: 'punto', at: estima, forma: 'estima', rotulo: 'estima' },
      { paso: 4, tipo: 'punto', at: fix, forma: 'situacion', rotulo: 'situación' },
    ] },
  };
}

// --- Corriente: rumbo y velocidad efectivos -----------------------------------------------------------------------
function corrienteEfectiva() {
  const salida = pos(35, 52, 5, 40);
  const a = ctDe(-2, 0);
  const ra = 12;
  const rv = rvFromRa(ra, a.ct);
  const v = 6;
  const rc = 80;
  const ic = 2;
  const t0 = 9 * 60;
  const t1 = 10 * 60 + 15;
  const horas = (t1 - t0) / 60;
  const ef = effectiveCourse(rv, v, rc, ic);
  const ref = rumboMedido(ef.ref);
  const vef = round(ef.vef, 1);
  const finBarco = rhumbDestination(salida, rv, v);
  const finCorriente = rhumbDestination(finBarco, rc, ic);
  const se = rhumbDestination(salida, ref, vef * horas);
  const S1 = leida(se);
  return {
    id: 'corriente-efectiva', titulo: 'Corriente: rumbo y velocidad efectivos', categoria: 'viento-corriente', niveles: ['PY'],
    corto: 'Con la corriente conocida: el triángulo de velocidades da por dónde avanzamos y dónde estaremos.',
    conceptos: ['carta.corriente.efectiva', 'nav.viento-corriente.deriva'], ejercicios: ['corriente-efectiva'],
    enunciado: `A HRB ${HRB(t0)} salimos de ${POS(salida)} con rumbo de aguja ${R(ra)} y ${N(v)}. La ${agujaTexto(a)}. Hay una corriente de rumbo ${R(rc)} e intensidad horaria ${N(ic)}. Halla el rumbo y la velocidad efectivos y la situación a HRB ${HRB(t1)}.`,
    datos: [{ cifra: `${R(ra)} · ${N(v)}`, texto: 'Ra y velocidad' }, { cifra: `${R(rc)} · ${N(ic)}`, texto: 'corriente (hacia)' }, { cifra: `${HRB(t0)}–${HRB(t1)}`, texto: 'HRB' }],
    pasos: [
      { titulo: 'Rumbo verdadero', regla: 'Rv = Ra + Ct. Sin viento, el rumbo de superficie es el verdadero.',
        texto: 'Es la dirección en que avanza el barco sobre el agua.',
        cuenta: [a.cuenta, `Rv = ${R(ra)} + ${P(a.ct, 0)} = ${R(rv)} = Rs`],
        figura: { tipo: 'nortes', dm: a.dm, desvio: a.desvio, mostrar: ['ct', 'rumbo'], resalta: 'rumbo', ra, rv } },
      { titulo: 'Vector del barco (1 hora)', regla: 'Desde la salida, el rumbo de superficie y la velocidad del barco: una punta de flecha.',
        texto: 'Se dibuja lo que el barco navega sobre el agua en una hora.',
        cuenta: [`${R(rv)} · ${M(v)}`] },
      { titulo: 'Vector de la corriente', regla: 'La corriente se nombra hacia dónde va: desde el extremo del vector del barco, su rumbo y su intensidad (tres puntas).',
        texto: 'En una hora el agua arrastra al barco esa distancia hacia el rumbo de la corriente.',
        cuenta: [`Rc ${R(rc)} · ${M(ic)}`] },
      { titulo: 'Efectivo', regla: 'Uniendo la salida con el extremo de la corriente: rumbo efectivo y velocidad efectiva (dos puntas).',
        texto: 'Es por donde avanza el barco sobre el fondo; su longitud en una hora es la velocidad efectiva.',
        cuenta: [`Ref = ${R(ref)}`, `Vef = ${N(vef)}`] },
      { titulo: `Situación a las ${HRB(t1)}`, regla: 'Sobre el rumbo efectivo, la distancia efectiva: d = Vef · t.',
        texto: 'Lee las coordenadas del extremo.',
        cuenta: [`d = ${coma(vef, 1)} × ${coma(horas, 2)} = ${M(vef * horas)}`, `S: ${fmtLat(S1.lat)}`, `   ${fmtLon(S1.lon)}`] },
    ],
    resultado: [{ cifra: R(ref), texto: 'rumbo efectivo' }, { cifra: N(vef), texto: 'velocidad efectiva' }, { cifra: `${fmtLat(S1.lat)}`, texto: `latitud a las ${HRB(t1)}` }],
    convenios: ['La corriente se nombra por hacia dónde va: «rumbo 080°» empuja hacia el 080°.', 'Vectores: barco una punta, corriente tres, efectivo dos.'],
    trampas: [
      { error: 'Dibujar la corriente al revés (como el viento, de dónde viene).', porque: 'El efectivo cae hacia el otro lado. La corriente va HACIA su rumbo.' },
      { error: 'Medir la situación final sobre el rumbo verdadero.', porque: 'Con corriente el barco avanza sobre el efectivo, a la velocidad efectiva.' },
    ],
    valores: { ct: a.ct, rv, ref, vef, exacto: ef, se },
    carta: { elementos: [
      { paso: 2, tipo: 'punto', at: salida, forma: 'salida', rotulo: `salida ${HRB(t0)}` },
      { paso: 2, tipo: 'vector', desde: salida, rumbo: rv, millas: v, puntas: 1, rotulo: `Rs ${R(rv)}` },
      { paso: 3, tipo: 'vector', desde: finBarco, rumbo: rc, millas: ic, puntas: 3, rotulo: `Rc ${R(rc)}` },
      { paso: 4, tipo: 'vector', desde: salida, hasta: finCorriente, puntas: 2, rotulo: `Ref ${R(ref)}` },
      { paso: 5, tipo: 'seg', de: finCorriente, a: se, discontinua: true },
      { paso: 5, tipo: 'punto', at: se, forma: 'estima', rotulo: HRB(t1) },
    ] },
  };
}

// --- Corriente: rumbo a dar ----------------------------------------------------------------------------------------
function corrienteRumboADar(chart) {
  const salida = pos(35, 55, 5, 32);
  const destino = pos(36, 3, 5, 24);
  const a = ctDe(-2, -1);
  const v = 6;
  const rc = 90;
  const ic = 2;
  const t0 = 9 * 60;
  const m = rhumbTo(salida, destino);
  const ref = rumboMedido(m.bearing);
  const D = millasMedidas(m.distance);
  const sol = courseToSteer(ref, v, rc, ic);
  const rs = rumboMedido(sol.rs);
  const vef = round(sol.vef, 1);
  const ra = raFromRv(rs, a.ct);
  const horas = timeFor(D, vef);
  const t1 = t0 + Math.round(horas * 60);
  const finC = rhumbDestination(salida, rc, ic);
  const corte = rhumbDestination(salida, ref, sol.vef);
  return {
    id: 'corriente-rumbo-a-dar', titulo: 'Corriente: rumbo a dar para llegar', categoria: 'viento-corriente', niveles: ['PY'],
    corto: 'Queremos ir a un punto con corriente: corriente desde la salida y arco con la velocidad del barco.',
    conceptos: ['carta.corriente.rumbo-a-dar'], ejercicios: ['corriente-rumbo-a-dar'],
    enunciado: `A HRB ${HRB(t0)} estamos en ${POS(salida)} y queremos ir a ${POS(destino)}, cerca de Punta Carnero, con ${N(v)}. Hay una corriente de rumbo ${R(rc)} e intensidad horaria ${N(ic)}. La ${agujaTexto(a)}. Halla el rumbo de aguja, la velocidad efectiva y la hora de llegada.`,
    datos: [{ cifra: N(v), texto: 'velocidad del barco' }, { cifra: `${R(rc)} · ${N(ic)}`, texto: 'corriente (hacia)' }, { cifra: HRB(t0), texto: 'HRB de salida' }],
    pasos: [
      { titulo: 'Rumbo efectivo y distancia', regla: 'Une la salida con la llegada: es el rumbo efectivo que queremos sobre el fondo.',
        texto: 'Mide el rumbo y la distancia: todavía no es el rumbo a dar.',
        cuenta: [`Ref = ${R(ref)}`, `D = ${M(D)}`] },
      { titulo: 'Corriente desde la salida', regla: 'Desde la salida, el vector corriente de una hora (tres puntas), hacia donde va.',
        texto: 'En el problema inverso la corriente se pone primero, desde la salida.',
        cuenta: [`Rc ${R(rc)} · ${M(ic)}`] },
      { titulo: 'Arco con la velocidad del barco', regla: 'Con centro en el extremo de la corriente y radio la velocidad del barco, corta la línea del efectivo.',
        texto: 'El corte es donde estaría el barco al cabo de una hora.',
        cuenta: [`radio = ${M(v)}`] },
      { titulo: 'Rumbo de superficie', regla: 'Del extremo de la corriente al corte: ese es el rumbo a dar sobre el agua (una punta).',
        texto: 'Sin viento, el rumbo de superficie es el verdadero.',
        cuenta: [`Rs = Rv = ${R(rs)}`] },
      { titulo: 'Velocidad efectiva y llegada', regla: 'Vef: de la salida al corte. t = D / Vef.',
        texto: 'La corriente a favor o en contra cambia el tiempo de la travesía.',
        cuenta: [`Vef = ${N(vef)}`, `t = ${coma(D, 1)} / ${coma(vef, 1)} = ${fmtDuration(horas)}`, `llegada ${HRB(t0)} + ${fmtDuration(horas)} = ${HRB(t1)}`] },
      { titulo: 'Rumbo de aguja', regla: 'Ra = Rv − Ct.',
        texto: 'El último paso es siempre pasar a aguja.',
        cuenta: [a.cuenta, `Ra = ${R(rs)} − ${P(a.ct, 0)} = ${R(ra)}`],
        figura: { tipo: 'nortes', dm: a.dm, desvio: a.desvio, mostrar: ['ct', 'rumbo'], resalta: 'rumbo', ra, rv: rs } },
    ],
    resultado: [{ cifra: R(ra), texto: 'Ra' }, { cifra: N(vef), texto: 'velocidad efectiva' }, { cifra: HRB(t1), texto: 'HRB de llegada' }],
    convenios: ['Corriente hacia donde va. En el inverso: corriente desde la salida; en el directo, desde el extremo del barco.', 'Rs = Rv cuando no hay viento.'],
    trampas: [
      { error: 'Poner el arco con centro en la salida.', porque: 'El arco va con centro en el extremo de la corriente; desde la salida sale el rumbo efectivo, no el de superficie.' },
      { error: 'Calcular el tiempo con la velocidad del barco.', porque: 'Sobre el fondo se avanza a la velocidad efectiva: t = D / Vef.' },
      { error: 'Compensar la corriente sumando o restando su rumbo al Ref.', porque: 'No es una suma de ángulos: es un triángulo de velocidades.' },
    ],
    valores: { ct: a.ct, ref, D, rs, vef, ra, horas, t1, exacto: sol },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: chart.point('punta-carnero'), nombre: NOMBRES['punta-carnero'] },
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: `salida ${HRB(t0)}` },
      { paso: 1, tipo: 'punto', at: destino, forma: 'destino', rotulo: 'llegada' },
      { paso: 1, tipo: 'seg', de: salida, a: destino, rotulo: `Ref ${R(ref)}`, discontinua: true },
      { paso: 2, tipo: 'vector', desde: salida, rumbo: rc, millas: ic, puntas: 3, rotulo: `Rc ${R(rc)}` },
      { paso: 3, tipo: 'arco', centro: finC, radio: v, hacia: rhumbTo(finC, corte).bearing, abertura: 34, rotulo: M(v, 0) },
      { paso: 4, tipo: 'vector', desde: finC, hasta: corte, puntas: 1, rotulo: `Rs ${R(rs)}` },
      { paso: 5, tipo: 'vector', desde: salida, hasta: corte, puntas: 2, rotulo: `Vef ${coma(vef, 1)}` },
    ] },
  };
}

// --- Corriente desconocida ------------------------------------------------------------------------------------------
function corrienteDesconocida(chart) {
  const salida = pos(35, 56, 5, 50);
  const A = chart.point('isla-tarifa');
  const B = chart.point('punta-cires');
  const a = ctDe(-2, 0);
  const ra = 95;
  const rv = rvFromRa(ra, a.ct);
  const v = 6;
  const t0 = 10 * 60;
  const t1 = 12 * 60;
  const horas = (t1 - t0) / 60;
  const d = distanciaNavegada(v, horas);
  const se = rhumbDestination(salida, rv, d);
  const real = rhumbDestination(se, 70, 3); // donde está de verdad (para fijar las demoras del ejemplo)
  const dvA = rumboMedido(rhumbTo(real, A).bearing);
  const dvB = rumboMedido(rhumbTo(real, B).bearing);
  const so = fixTwoBearings(A, dvA, B, dvB);
  const deriva = rhumbTo(se, so);
  const rc = rumboMedido(deriva.bearing);
  const dc = millasMedidas(deriva.distance);
  const ic = round(dc / horas, 1);
  return {
    id: 'corriente-desconocida', titulo: 'Corriente desconocida', categoria: 'viento-corriente', niveles: ['PY'],
    corto: 'La estima y la situación observada no coinciden: la diferencia, de la estima a la observada, es la corriente.',
    conceptos: ['carta.corriente.desconocida'], ejercicios: ['corriente-desconocida'],
    enunciado: `A HRB ${HRB(t0)} salimos de ${POS(salida)} con rumbo de aguja ${R(ra)} y ${N(v)}; la ${agujaTexto(a)}. A HRB ${HRB(t1)} tomamos demoras verdaderas del faro de Isla de Tarifa ${R(dvA)} y del faro de Punta Cires ${R(dvB)}. Halla el rumbo y la intensidad horaria de la corriente.`,
    datos: [{ cifra: `${R(ra)} · ${N(v)}`, texto: 'Ra y velocidad' }, { cifra: `${R(dvA)} · ${R(dvB)}`, texto: 'Dv Tarifa y Cires' }, { cifra: `${HRB(t0)}–${HRB(t1)}`, texto: 'HRB' }],
    pasos: [
      { titulo: 'Salida', regla: 'Sitúa la salida por sus coordenadas.',
        texto: 'Paralelo y meridiano con la regla paralela.',
        cuenta: [`l = ${fmtLat(salida.lat)}`, `L = ${fmtLon(salida.lon)}`] },
      { titulo: 'Estima sin corriente', regla: 'Rv = Ra + Ct; d = v · t. La estima se marca con un triángulo.',
        texto: 'Es donde estaríamos si no hubiera corriente.',
        cuenta: [`Rv = ${R(ra)} + ${P(a.ct, 0)} = ${R(rv)}`, `d = ${coma(v, 0)} × ${coma(horas, 0)} = ${M(d)}`] },
      { titulo: `Situación observada (${HRB(t1)})`, regla: 'Dos demoras simultáneas: desde cada faro, la opuesta; el corte es la situación verdadera.',
        texto: 'La observada es la buena: la estima no sabía nada de la corriente.',
        cuenta: [`desde Tarifa ${R(dvA + 180)} · desde Cires ${R(dvB + 180)}`] },
      { titulo: 'La corriente', regla: 'De la estima a la observada (a la misma hora): rumbo de la corriente y distancia que ha arrastrado.',
        texto: 'Siempre en ese sentido: la corriente va hacia donde ha llevado al barco.',
        cuenta: [`Rc = ${R(rc)}`, `distancia = ${M(dc)}`] },
      { titulo: 'Intensidad horaria', regla: 'Ihc = distancia / horas transcurridas.',
        texto: 'La corriente ha actuado durante todo el tiempo desde la salida.',
        cuenta: [`Ihc = ${coma(dc, 1)} / ${coma(horas, 0)} = ${N(ic)}`] },
    ],
    resultado: [{ cifra: R(rc), texto: 'rumbo de la corriente' }, { cifra: N(ic), texto: 'intensidad horaria' }],
    convenios: ['Corriente: de la estima a la observada, hacia donde va.', 'Ihc = distancia / tiempo transcurrido desde la última situación buena.'],
    trampas: [
      { error: 'Medir de la observada a la estima.', porque: 'Sale el rumbo opuesto (180° de error).' },
      { error: 'Dividir la distancia por una hora en lugar de por el tiempo navegado.', porque: 'En 2 horas la corriente arrastra el doble: la intensidad es la mitad de lo medido.' },
    ],
    valores: { ct: a.ct, rv, d, se, so, rc, dc, ic, deriva },
    carta: { elementos: [
      { paso: 0, tipo: 'faro', at: A, nombre: NOMBRES['isla-tarifa'] }, { paso: 0, tipo: 'faro', at: B, nombre: NOMBRES['punta-cires'] },
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: `salida ${HRB(t0)}` },
      { paso: 2, tipo: 'vector', desde: salida, rumbo: rv, millas: d, puntas: 1, rotulo: `Rv ${R(rv)}` },
      { paso: 2, tipo: 'punto', at: se, forma: 'estima', rotulo: `Se ${HRB(t1)}` },
      { paso: 3, tipo: 'linea', desde: A, rumbo: norm360(dvA + 180), millas: rhumbTo(A, so).distance + 1.5, rotulo: `Dv ${R(dvA)}` },
      { paso: 3, tipo: 'linea', desde: B, rumbo: norm360(dvB + 180), millas: rhumbTo(B, so).distance + 1.5, rotulo: `Dv ${R(dvB)}`, discontinua: true },
      { paso: 3, tipo: 'punto', at: so, forma: 'situacion', rotulo: `So ${HRB(t1)}` },
      { paso: 4, tipo: 'vector', desde: se, hasta: so, puntas: 3, rotulo: `Rc ${R(rc)}` },
      { paso: 5, tipo: 'nota', en: [se, so], texto: `Ihc ${N(ic)}` },
    ] },
  };
}

// --- Viento: rumbo de superficie, rumbo verdadero y de aguja --------------------------------------------------------
function viento() {
  const salida = pos(35, 53, 5, 42);
  const destino = pos(36, 0, 5, 28);
  const a = ctDe(-1, -2);
  const v = 5;
  const vientoDe = 0;
  const abGrados = 8;
  const t0 = 7 * 60 + 30;
  const m = rhumbTo(salida, destino);
  const rs = rumboMedido(m.bearing);
  const D = millasMedidas(m.distance);
  const banda = windSide(vientoDe, rs);
  const ab = abatimientoSigned(abGrados, banda);
  const rv = rvFromRs(rs, ab);
  const bandaRv = windSide(vientoDe, rv);
  const ra = raFromRv(rv, a.ct);
  const horas = timeFor(D, v);
  const t1 = t0 + Math.round(horas * 60);
  return {
    id: 'viento', titulo: 'Viento y abatimiento: rumbo de superficie y de aguja', categoria: 'viento-corriente', niveles: ['PY'],
    corto: 'El viento nos abate: la derrota es el rumbo de superficie y hay que aproar al viento para seguirla.',
    conceptos: ['carta.viento', 'nav.viento-corriente.abatimiento'], ejercicios: ['abatimiento'],
    enunciado: `A HRB ${HRB(t0)} estamos en ${POS(salida)} y queremos ir a ${POS(destino)} con ${N(v)}. Sopla viento del N que nos produce un abatimiento de ${abGrados}°. La ${agujaTexto(a)}. Halla el rumbo verdadero, el rumbo de aguja y la hora de llegada.`,
    datos: [{ cifra: 'N', texto: 'viento (de dónde viene)' }, { cifra: `${abGrados}°`, texto: 'abatimiento' }, { cifra: N(v), texto: 'velocidad' }],
    pasos: [
      { titulo: 'Rumbo de superficie', regla: 'Sin corriente, la línea que une la salida con la llegada es el rumbo de superficie (la derrota sobre el agua).',
        texto: 'Mide su rumbo y la distancia. No es el rumbo que se da: el viento nos saca de él.',
        cuenta: [`Rs = ${R(rs)}`, `D = ${M(D)}`] },
      { titulo: 'Por qué banda entra el viento', regla: 'Viento por babor: el barco abate a estribor, Ab +. Por estribor: abate a babor, Ab −.',
        texto: `El viento viene del N y la proa mira hacia el ${R(rs)}: entra por ${banda}.`,
        cuenta: [`viento por ${banda} → Ab = ${S(ab, 0)}`] },
      { titulo: 'Rumbo verdadero (la proa)', regla: 'Rs = Rv + Ab, luego Rv = Rs − Ab: hay que aproar al viento.',
        texto: 'La proa va un poco hacia el lado de donde viene el viento; el barco se desliza hasta la derrota.',
        cuenta: [`Rv = ${R(rs)} − ${P(ab, 0)} = ${R(rv)}`, `(con la proa al ${R(rv)} el viento sigue entrando por ${bandaRv})`] },
      { titulo: 'Rumbo de aguja', regla: 'Ra = Rv − Ct.',
        texto: 'La aguja se corrige sobre el rumbo verdadero, el de la proa.',
        cuenta: [a.cuenta, `Ra = ${R(rv)} − ${P(a.ct, 0)} = ${R(ra)}`],
        figura: { tipo: 'nortes', dm: a.dm, desvio: a.desvio, mostrar: ['ct', 'rumbo'], resalta: 'rumbo', ra, rv } },
      { titulo: 'Hora de llegada', regla: 't = D / v: la distancia se recorre sobre el agua a la velocidad del barco.',
        texto: 'Sin corriente, la velocidad sobre la derrota es la del barco.',
        cuenta: [`t = ${coma(D, 1)} / ${coma(v, 0)} = ${fmtDuration(horas)}`, `llegada ${HRB(t0)} + ${fmtDuration(horas)} = ${HRB(t1)}`] },
    ],
    resultado: [{ cifra: R(rv), texto: 'Rv (proa)' }, { cifra: R(ra), texto: 'Ra' }, { cifra: HRB(t1), texto: 'HRB de llegada' }],
    convenios: ['El viento se nombra por de dónde viene: viento del N sopla hacia el S.', 'Rs = Rv + Ab, con Ab + si el viento entra por babor y − si entra por estribor.'],
    trampas: [
      { error: 'Sumar el abatimiento al pasar del rumbo de superficie al verdadero.', porque: 'Rs = Rv + Ab: para ir hacia atrás se resta. Si no, la proa se aparta del viento y el error es el doble.' },
      { error: 'Decidir la banda mirando hacia dónde va el viento.', porque: 'La banda es por donde ENTRA el viento: viento del N con rumbo al ENE entra por babor.' },
      { error: 'Corregir la aguja sobre el rumbo de superficie.', porque: 'La aguja marca la proa: Ra = Rv − Ct.' },
    ],
    valores: { ct: a.ct, rs, D, banda, ab, rv, ra, horas, t1, exacto: m },
    carta: { elementos: [
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: `salida ${HRB(t0)}` },
      { paso: 1, tipo: 'punto', at: destino, forma: 'destino', rotulo: 'llegada' },
      { paso: 1, tipo: 'vector', desde: salida, hasta: destino, puntas: 1, rotulo: `Rs ${R(rs)}` },
      { paso: 2, tipo: 'viento', de: vientoDe, rotulo: 'viento del N' },
      { paso: 3, tipo: 'vector', desde: salida, rumbo: rv, millas: D * 0.75, puntas: 1, discontinua: true, rotulo: `Rv ${R(rv)}` },
      { paso: 3, tipo: 'angulo', en: salida, de: rv, a: rs, rotulo: `Ab ${S(ab, 0)}` },
      { paso: 5, tipo: 'punto', at: destino, forma: 'situacion', rotulo: `llegada ${HRB(t1)}` },
    ] },
  };
}

// --- Estima analítica (loxodrómica) ---------------------------------------------------------------------------------
function estimaAnalitica() {
  const salida = pos(36, 6, 6, 14);
  const tramos = [{ rv: 160, dist: 12 }, { rv: 100, dist: 10 }];
  const r = deadReckoning(salida, tramos);
  const [c1, c2] = r.comps;
  const llegada = leida(r.end);
  const lm = r.lm;
  const cuadrante = `${r.dLat < 0 ? 'S' : 'N'} ${coma(toDeg(Math.atan(Math.abs(r.dep / r.dLat))), 1)}° ${r.dep < 0 ? 'W' : 'E'}`;
  const p1 = rhumbDestination(salida, tramos[0].rv, tramos[0].dist);
  const p2 = rhumbDestination(p1, tramos[1].rv, tramos[1].dist);
  return {
    id: 'estima-analitica', titulo: 'Estima analítica (loxodrómica)', categoria: 'analitica', niveles: ['PY'],
    corto: 'Sin carta: diferencia de latitud y apartamiento de cada tramo, latitud media y diferencia de longitud.',
    conceptos: ['carta.loxodromica.directa', 'carta.loxodromica.inversa'], ejercicios: ['estima-analitica'],
    enunciado: `Desde ${POS(salida)} navegamos ${M(tramos[0].dist, 0)} al rumbo verdadero ${R(tramos[0].rv)} y después ${M(tramos[1].dist, 0)} al ${R(tramos[1].rv)}. Halla por cálculo la situación de llegada y el rumbo y la distancia directos.`,
    datos: [{ cifra: `${R(tramos[0].rv)} · ${M(tramos[0].dist, 0)}`, texto: 'primer tramo' }, { cifra: `${R(tramos[1].rv)} · ${M(tramos[1].dist, 0)}`, texto: 'segundo tramo' }],
    pasos: [
      { titulo: 'Primer tramo', regla: 'Δl = d · cos R (minutos de latitud, + N); A = d · sen R (millas, + E).',
        texto: 'El coseno de un rumbo hacia el sur es negativo: la latitud baja.',
        cuenta: [`Δl1 = 12 · cos 160° = ${MIN(c1.dLat, 2)}`, `A1 = 12 · sen 160° = ${S(c1.dep, 2).replace('°', '')} M`] },
      { titulo: 'Segundo tramo', regla: 'Lo mismo con cada tramo, con su signo.',
        texto: 'Un rumbo poco al sur del E baja muy poco la latitud y da casi todo apartamiento.',
        cuenta: [`Δl2 = 10 · cos 100° = ${MIN(c2.dLat, 2)}`, `A2 = 10 · sen 100° = ${S(c2.dep, 2).replace('°', '')} M`] },
      { titulo: 'Suma', regla: 'Se suman todas las Δl y todos los A con su signo.',
        texto: 'Es como si se hubiera navegado un solo tramo: el triángulo de la figura.',
        cuenta: [`Δl = ${MIN(r.dLat, 2)} (S)`, `A = ${S(r.dep, 2).replace('°', '')} M (E)`] },
      { titulo: 'Latitud de llegada y latitud media', regla: 'l = l0 + Δl; lm = l0 + Δl / 2.',
        texto: 'La latitud media hace falta para pasar el apartamiento a longitud.',
        cuenta: [`l = ${fmtLat(salida.lat, 1)} ${MIN(r.dLat, 1)} = ${fmtLat(r.end.lat, 1)}`, `lm = ${fmtLat(lm, 1)}`] },
      { titulo: 'Diferencia de longitud', regla: 'ΔL = A / cos lm (minutos de longitud). Hacia el E, la longitud W disminuye.',
        texto: 'Un minuto de longitud es más corto que una milla: ΔL sale mayor que A.',
        cuenta: [`ΔL = ${coma(r.dep, 2)} / cos ${coma(lm, 2)}° = ${MIN(r.dLon, 1)} (E)`, `L = ${fmtLon(salida.lon, 1)} − ${coma(r.dLon, 1)}′ = ${fmtLon(r.end.lon, 1)}`] },
      { titulo: 'Rumbo y distancia directos', regla: 'tg R = A / Δl (en cuadrante); D = √(Δl² + A²).',
        texto: 'El cuadrante lo dan los signos: Δl al S y A al E es un rumbo del segundo cuadrante (S…E).',
        cuenta: [`R = ${cuadrante} = ${R(r.course, 1)}`, `D = ${M(r.distance, 1)}`] },
    ],
    resultado: [{ cifra: fmtLat(llegada.lat), texto: 'latitud de llegada' }, { cifra: fmtLon(llegada.lon), texto: 'longitud de llegada' }, { cifra: `${R(r.course, 0)} · ${M(r.distance, 1)}`, texto: 'rumbo y distancia directos' }],
    convenios: ['Δl + al N y − al S; A + al E y − al W (signo de cos R y sen R).', 'Δl en minutos de latitud (= millas); ΔL en minutos de longitud.'],
    trampas: [
      { error: 'Dividir por el coseno de la latitud de salida.', porque: 'Se usa la latitud media: con la de salida, en un viaje largo, la ΔL se desvía.' },
      { error: 'Tomar el rumbo que da la calculadora (arctg) sin mirar el cuadrante.', porque: 'arctg de un número negativo da un ángulo negativo: hay que llevarlo al cuadrante S…E y pasarlo a circular.' },
      { error: 'Sumar la ΔL a la longitud W como si fuera hacia el W.', porque: 'Navegando al E una longitud W se hace más pequeña.' },
    ],
    valores: { r, llegada },
    carta: { elementos: [
      { paso: 1, tipo: 'punto', at: salida, forma: 'salida', rotulo: 'salida' },
      { paso: 1, tipo: 'vector', desde: salida, hasta: p1, puntas: 1, rotulo: `${R(tramos[0].rv)} · ${M(tramos[0].dist, 0)}` },
      { paso: 2, tipo: 'vector', desde: p1, hasta: p2, puntas: 1, rotulo: `${R(tramos[1].rv)} · ${M(tramos[1].dist, 0)}` },
      { paso: 3, tipo: 'componentes', de: salida, a: r.end, rotulos: [`Δl ${coma(Math.abs(r.dLat), 1)}′`, `A ${M(r.dep, 1)}`] },
      { paso: 4, tipo: 'nota', en: [salida, { lat: r.end.lat, lon: salida.lon }], texto: `l ${fmtLat(r.end.lat, 1)}` },
      { paso: 5, tipo: 'punto', at: r.end, forma: 'estima', rotulo: 'llegada' },
      { paso: 6, tipo: 'seg', de: salida, a: r.end, rotulo: `${R(r.course, 0)} · ${M(r.distance, 1)}`, discontinua: true },
    ] },
  };
}

// ---------------------------------------------------------------------------

const CONSTRUCTORES = [ctDmDesvio, enfilacion, dosDemoras, demoraDistancia, dosDistancias, noSimultaneas, estimaDirecta, rumboDistancia, pasarDistancia, corrienteEfectiva, corrienteRumboADar, corrienteDesconocida, viento, estimaAnalitica];

const cache = new WeakMap();

/** Todos los tipos resueltos, en el orden de la lista (calculados con los motores sobre esta carta). */
export function tiposCarta(chart) {
  if (!cache.has(chart)) cache.set(chart, CONSTRUCTORES.map((f) => f(chart)));
  return cache.get(chart);
}

/** Un tipo por su id (o undefined). */
export const tipoCarta = (chart, id) => tiposCarta(chart).find((t) => t.id === id);

/** Tipos de una titulación ('per' | 'py'). */
export const tiposDeTit = (chart, tit) => tiposCarta(chart).filter((t) => t.niveles.includes(String(tit).toUpperCase()));

// Enlaces desde otras pantallas (sin calcular nada): concepto del catálogo o ejercicio de la app → tipo resuelto.
export const TIPO_DE_CONCEPTO = {
  'carta.situacion.dos-demoras': 'dos-demoras', 'carta.situacion.demora-distancia': 'demora-distancia', 'carta.situacion.enfilacion': 'enfilacion',
  'nav.ct.enfilacion': 'enfilacion', 'carta.situacion.distancias': 'dos-distancias', 'carta.situacion.no-simultaneas': 'no-simultaneas',
  'carta.estima': 'estima', 'carta.rumbo-distancia': 'rumbo-distancia', 'carta.pasar-distancia': 'pasar-distancia',
  'carta.corriente.efectiva': 'corriente-efectiva', 'carta.corriente.rumbo-a-dar': 'corriente-rumbo-a-dar', 'carta.corriente.desconocida': 'corriente-desconocida',
  'carta.viento': 'viento', 'nav.viento-corriente.abatimiento': 'viento', 'nav.viento-corriente.deriva': 'corriente-efectiva',
  'nav.ct.dm-desvio': 'ct-dm-desvio', 'nav.ct.convertir': 'ct-dm-desvio',
  'carta.loxodromica.directa': 'estima-analitica', 'carta.loxodromica.inversa': 'estima-analitica',
};

export const TIPO_DE_EJERCICIO = {
  'situacion-dos-demoras': 'dos-demoras', 'situacion-demora-distancia': 'demora-distancia', 'ct-enfilacion': 'enfilacion', 'distancia-faro': 'enfilacion',
  'situacion-dos-distancias': 'dos-distancias', 'demoras-no-simultaneas': 'no-simultaneas', 'estima-directa': 'estima', 'rumbo-distancia': 'rumbo-distancia',
  'rumbo-pasar-distancia': 'pasar-distancia', 'corriente-efectiva': 'corriente-efectiva', 'corriente-rumbo-a-dar': 'corriente-rumbo-a-dar',
  'corriente-desconocida': 'corriente-desconocida', abatimiento: 'viento', 'conversion-rumbos': 'ct-dm-desvio', 'estima-analitica': 'estima-analitica',
};

/** Títulos de los tipos, para los enlaces (sin necesidad de la carta). */
export const TITULO_TIPO = {
  'dos-demoras': 'Situación por dos demoras simultáneas', 'demora-distancia': 'Situación por demora y distancia', enfilacion: 'Enfilación: corrección total, desvío y situación',
  'dos-distancias': 'Situación por dos distancias', 'no-simultaneas': 'Situación por demoras no simultáneas', estima: 'Situación de estima',
  'rumbo-distancia': 'Rumbo, distancia y hora de llegada', 'pasar-distancia': 'Rumbo para pasar a una distancia de un faro',
  'corriente-efectiva': 'Corriente: rumbo y velocidad efectivos', 'corriente-rumbo-a-dar': 'Corriente: rumbo a dar para llegar',
  'corriente-desconocida': 'Corriente desconocida', viento: 'Viento y abatimiento: rumbo de superficie y de aguja',
  'ct-dm-desvio': 'Corrección total con la declinación y el desvío', 'estima-analitica': 'Estima analítica (loxodrómica)',
};


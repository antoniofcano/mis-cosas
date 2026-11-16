// Estimar y descartar (R-57): cuando no da tiempo a resolver una pregunta de carta, qué opciones son IMPOSIBLES con los
// datos del propio enunciado, por orden de magnitud o por signo. Funciones puras (sin DOM).
//
// Regla de honestidad: cada regla descarta solo lo que se puede justificar con los números que trae el enunciado (o la
// tabla del Anuario que viene con él) y una propiedad que no falla: un vector suma de otros dos está entre ellos, una
// distancia no es menor que su diferencia de latitud, la altura de la marea está entre la de la bajamar y la de la
// pleamar… Si el enunciado no trae el dato, o no se entiende sin ambigüedad, la regla no se aplica (null). Nunca se
// descarta todo: si una regla dejase sin ninguna opción, es que algo no se ha leído bien y no se aplica.
// tests/descarte.test.js pasa todas las reglas por todas las preguntas reales del estudio (nunca las reservadas) y
// comprueba que ninguna descarta jamás la respuesta oficial.

import { norm180, norm360 } from '../math/angles.js';
import { rhumbTo } from '../math/mercator.js';
import { num } from './estrategia.js';

// ---------------------------------------------------------------------------------------------------------------
// Lectura de números, horas, rumbos y coordenadas en el texto

/** «3,24» o «3.24» → 3.24. */
const aNumero = (s) => Number(String(s).replace(',', '.'));

/** El primer número de un texto (con coma o punto decimal), o null. */
export function primerNumero(texto) {
  const m = String(texto ?? '').match(/-?\d+(?:[.,]\d+)?/);
  return m ? aNumero(m[0]) : null;
}

/** La primera hora «HH:MM» (o «HHhMMm», «HH-MM») de un texto, en minutos; null si no hay. */
export function primeraHora(texto) {
  const m = String(texto ?? '').match(/(\d{1,2})\s*(?::|h\s*)\s*(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** El primer ángulo en grados de un texto («Rv= 260º», «166º»), o null. */
export function primerRumbo(texto) {
  const t = String(texto ?? '');
  // Notación cuadrantal: «S46,6ºW», «N 002º E».
  const c = t.match(/\b([NS])\s*(\d{1,3}(?:[.,]\d+)?)\s*[º°]?\s*([EW])\b/);
  if (c) {
    const x = aNumero(c[2]);
    return norm360(c[1] === 'N' ? (c[3] === 'E' ? x : 360 - x) : (c[3] === 'E' ? 180 - x : 180 + x));
  }
  const m = t.match(/(?<![\d,.])(\d{1,3}(?:[.,]\d+)?)\s*[º°]/);
  return m ? aNumero(m[1]) : null;
}

const RE_COORD = /(\d{1,3})\s*(?:[º°]\s*[-–]?\s*|\s+)(\d{1,2})(?:\s*[º°])?(?:[.,](\d+))?\s*[′'´’]?\s*([NSEW])(?![A-Za-z])/g;

/**
 * Las situaciones (latitud y longitud) escritas en un texto, en orden: «36º 04,0′ N, 006º 00,0′ W», «l = 35º-53,0’ N,
 * L = 005º-46,0’ W», «l=35º50´N-L=06º50´W». Grados con signo (N y E positivos).
 */
export function coordenadas(texto) {
  const partes = [...String(texto ?? '').matchAll(RE_COORD)].map((m) => {
    const min = Number(m[2]) + (m[3] ? Number(`0.${m[3]}`) : 0);
    if (min >= 60) return null;
    const v = Number(m[1]) + min / 60;
    return { eje: /[NS]/.test(m[4]) ? 'lat' : 'lon', v: /[SW]/.test(m[4]) ? -v : v };
  });
  const out = [];
  for (let i = 0; i < partes.length - 1; i++) {
    if (partes[i]?.eje === 'lat' && partes[i + 1]?.eje === 'lon') { out.push({ lat: partes[i].v, lon: partes[i + 1].v }); i++; }
  }
  return out;
}

const CARDINALES = { n: 0, norte: 0, ne: 45, nordeste: 45, noreste: 45, e: 90, este: 90, se: 135, sudeste: 135, sureste: 135, s: 180, sur: 180, sw: 225, so: 225, suroeste: 225, sudoeste: 225, w: 270, oeste: 270, o: 270, nw: 315, no: 315, noroeste: 315 };

/** Rumbo de la corriente (Rc) del enunciado, en grados, o null: «Rc = 050º», «Rc = NW», «corriente de dirección norte». */
export function rumboCorriente(texto) {
  const t = String(texto ?? '');
  const g = t.match(/\bRc\s*=\s*(\d{1,3})\s*[º°]/);
  if (g) return Number(g[1]);
  const c = t.match(/(?:\bRc\s*=|rumbo de corriente\s*=?|corriente de rumbo|corriente de direcci[oó]n)\s*([A-Za-zé]+)/i);
  const k = c?.[1]?.toLowerCase();
  return k != null && k in CARDINALES ? CARDINALES[k] : null;
}

/** Intensidad horaria de la corriente (nudos o millas por hora), o null. */
export function intensidadCorriente(texto) {
  const m = String(texto ?? '').match(/(?:intensidad horaria|\bIhc|\bIh)\s*(?:=|de)?\s*(\d+(?:[.,]\d+)?)/i);
  return m ? aNumero(m[1]) : null;
}

/** Velocidad del barco (nudos), o null: «a 8 nudos», «velocidad del buque 6 nudos», «Vhb = 7 nudos», «Vm=8knt». */
export function velocidadBarco(texto) {
  const m = String(texto ?? '').match(/(?:\ba|velocidad(?: del (?:buque|barco))?(?:\s*=)?(?: de)?|\bV(?:hb|b|m)\s*=)\s*(\d+(?:[.,]\d+)?)\s*(?:nudos|knt|kn\b)/i);
  return m ? aNumero(m[1]) : null;
}

/** Lo que pide la pregunta: el texto desde «Calcular» (o la última frase). */
function loQuePide(texto) {
  const t = String(texto ?? '');
  const i = t.search(/calcular|se pide|queremos saber|situaci[oó]n a HRB/i);
  return i >= 0 ? t.slice(i) : t.split(/\.\s+/).at(-1);
}

const letrasDe = (q) => Object.keys(q?.opciones ?? {}).sort();
const grados = (x) => `${String(Math.round(norm360(x))).padStart(3, '0')}°`;
const hhmm = (m) => { const r = ((Math.round(m) % 1440) + 1440) % 1440; return `${String(Math.floor(r / 60)).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`; };

// ---------------------------------------------------------------------------------------------------------------
// Mareas (la tabla del Anuario viene con la pregunta, en hora UT)

/** Las mareas de la tabla en minutos absolutos desde las 00:00 UT del día `dia0`, con su tipo (pleamar o bajamar). */
function mareas(tabla, dia0) {
  const xs = (tabla ?? []).map((x) => ({ t: (x.dia - dia0) * 1440 + (primeraHora(x.hora) ?? NaN), h: x.altura_m, dia: x.dia }))
    .filter((x) => Number.isFinite(x.t) && Number.isFinite(x.h)).sort((a, b) => a.t - b.t);
  return xs.map((x, i) => {
    const vecinos = [xs[i - 1], xs[i + 1]].filter(Boolean);
    const pm = vecinos.length && vecinos.every((v) => x.h > v.h);
    const bm = vecinos.length && vecinos.every((v) => x.h < v.h);
    return { ...x, tipo: pm ? 'pleamar' : bm ? 'bajamar' : null };
  });
}

/** Adelanto vigente (horas) o null. */
function adelanto(texto) {
  const m = String(texto ?? '').match(/Adelanto vigente:?\s*([+\-–−]?)\s*(\d+)\s*hora/i);
  return m ? (/[-–−]/.test(m[1]) ? -1 : 1) * Number(m[2]) : null;
}

/** Día del mes del enunciado («del 29 de febrero», «El 23 de junio»). */
function diaDe(texto) {
  const m = String(texto ?? '').match(/\b(?:del|el)\s+(\d{1,2})\s+(?:de\s+)?[a-zA-Z]/i);
  return m ? Number(m[1]) : null;
}

const ORD = { primera: 0, segunda: 1, tercera: 2 };

/** La hora pedida está dentro del tramo de marea que nombra el enunciado. */
function reglaMareaHora(q) {
  const tx = q.enunciado ?? '';
  if (!q.tabla_mareas?.length || !/calcular la hora/i.test(tx)) return null;
  const dia = diaDe(tx);
  const ad = adelanto(tx);
  if (dia == null || ad == null) return null;
  const ms = mareas(q.tabla_mareas, dia);
  const del = (ord, tipo) => ms.filter((x) => x.dia === dia && x.tipo === tipo)[ORD[ord]] ?? null;
  let a = null;
  let b = null;
  const entre = tx.match(/entre la (primera|segunda) (pleamar|bajamar) y (?:la )?(primera|segunda) (pleamar|bajamar)/i);
  const despues = tx.match(/despu[eé]s de la (primera|segunda) (pleamar|bajamar)/i);
  if (entre) { a = del(entre[1].toLowerCase(), entre[2].toLowerCase()); b = del(entre[3].toLowerCase(), entre[4].toLowerCase()); }
  else if (despues) { a = del(despues[1].toLowerCase(), despues[2].toLowerCase()); b = a ? ms[ms.indexOf(a) + 1] ?? null : null; }
  if (!a || !b || b.t <= a.t || b.t - a.t > 9 * 60) return null;
  const desde = a.t + ad * 60;
  const hasta = b.t + ad * 60;
  const TOL = 3;
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const m = primeraHora(q.opciones[l]);
    if (m == null) return null;
    // La hora de la opción, el día que más se acerque al tramo (un tramo puede cruzar la medianoche).
    const dist = Math.min(...[m - 1440, m, m + 1440].map((x) => (x < desde ? desde - x : x > hasta ? x - hasta : 0)));
    if (dist > TOL) descartadas.push({ letra: l, porque: `${hhmm(m)} queda fuera del tramo (${hhmm(desde)} a ${hhmm(hasta)}, hora oficial)` });
  }
  return { cota: `El tramo va de ${hhmm(desde)} a ${hhmm(hasta)} en hora oficial (las del Anuario, en UT, ${ad >= 0 ? 'más' : 'menos'} ${Math.abs(ad)} h de adelanto).`, descartadas };
}

/** La sonda a una hora está entre la sonda de la carta más la bajamar y más la pleamar de su tramo. */
function reglaMareaSonda(q) {
  const tx = q.enunciado ?? '';
  if (!q.tabla_mareas?.length || !/calcular la sonda|la sonda (?:en|del) (?:el )?momento|sonda del momento/i.test(tx)) return null;
  const sc = tx.match(/(?:carta con(?: una sonda de)?|en la carta de|\bSc\s*=)\s*(\d+(?:[.,]\d+)?)/i);
  if (!sc) return null;
  const sonda = aNumero(sc[1]);
  let t = null;
  const oficial = tx.match(/hora oficial (\d{1,2}):(\d{2})|las (\d{1,2}):(\d{2}) hora oficial/i);
  const ut = tx.match(/\b(?:UTC?|TU)\s*(\d{1,2}):?(\d{2})/);
  const dia = diaDe(tx);
  if (dia == null) return null;
  if (oficial) {
    const ad = adelanto(tx);
    if (ad == null) return null;
    t = Number(oficial[1] ?? oficial[3]) * 60 + Number(oficial[2] ?? oficial[4]) - ad * 60;
  } else if (ut) t = Number(ut[1]) * 60 + Number(ut[2]);
  if (t == null) return null;
  const ms = mareas(q.tabla_mareas, dia);
  const i = ms.findIndex((x, k) => k < ms.length - 1 && x.t <= t && ms[k + 1].t >= t);
  if (i < 0) return null;
  const [a, b] = [ms[i], ms[i + 1]];
  if (a.tipo == null || b.tipo == null || a.tipo === b.tipo) return null;
  // La presión cambia la altura cerca de 1 cm por hPa; si el enunciado la da y no dice que se ignore, se deja ese margen.
  const hpa = tx.match(/(\d{3,4})\s*hPa/);
  const margenP = hpa && !/no tener en cuenta[^.]*presi[oó]n/i.test(tx) ? Math.abs(1013 - Number(hpa[1])) / 100 + 0.05 : 0;
  const TOL = 0.03 + margenP;
  const min = sonda + Math.min(a.h, b.h);
  const max = sonda + Math.max(a.h, b.h);
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const v = primerNumero(q.opciones[l]);
    if (v == null) return null;
    if (v < min - TOL) descartadas.push({ letra: l, porque: `${num(v, 2)} m es menos que la sonda de la carta más la bajamar (${num(min, 2)} m)` });
    else if (v > max + TOL) descartadas.push({ letra: l, porque: `${num(v, 2)} m es más que la sonda de la carta más la pleamar (${num(max, 2)} m)` });
  }
  return { cota: `Sonda de la carta ${num(sonda, 2)} m; en ese tramo la marea sube o baja entre ${num(Math.min(a.h, b.h), 2)} y ${num(Math.max(a.h, b.h), 2)} m: la sonda está entre ${num(min, 2)} y ${num(max, 2)} m${margenP ? ' (más unos centímetros por la presión)' : ''}.`, descartadas };
}

// ---------------------------------------------------------------------------------------------------------------
// De un punto a otro (estima analítica)

/** Dos puntos dados en el enunciado y la pregunta es el rumbo directo, el efectivo o la distancia. */
function dosPuntos(q) {
  const tx = q.enunciado ?? '';
  const ps = coordenadas(tx);
  if (ps.length !== 2) return null;
  if (/cambia|caemos|HRB/i.test(tx)) return null; // estima de varios tramos: no es un punto a otro
  const dLat = (ps[1].lat - ps[0].lat) * 60;
  // Por el camino corto: cruzar el meridiano 180° no es dar la vuelta al mundo.
  const dLon = norm180(ps[1].lon - ps[0].lon) * 60;
  return { a: ps[0], b: ps[1], dLat, dLon, tx };
}

/** El rumbo de un punto a otro está en el cuadrante que dicen los signos de Δl y ΔL. */
function reglaCuadrante(q) {
  const p = dosPuntos(q);
  if (!p) return null;
  const pide = loQuePide(p.tx);
  const pideRef = /\bRef\b|rumbo efectivo/i.test(pide);
  const pideRv = /\bRv\b|rumbo verdadero|rumbo directo/i.test(pide);
  // Con corriente o viento, el rumbo verdadero no es el de un punto al otro; el efectivo, sí.
  if (!(pideRef || (pideRv && !/corriente|viento|abatimiento/i.test(p.tx)))) return null;
  if (Math.abs(p.dLat) < 1 || Math.abs(p.dLon) < 1) return null;
  const desde = p.dLat > 0 ? (p.dLon > 0 ? 0 : 270) : (p.dLon > 0 ? 90 : 180);
  const nombre = `${p.dLat > 0 ? 'N' : 'S'}${p.dLon > 0 ? 'E' : 'W'}`;
  const TOL = 1;
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const r = primerRumbo(q.opciones[l]);
    if (r == null) return null;
    const d = norm360(r - desde);
    if (d > 90 + TOL && d < 360 - TOL) descartadas.push({ letra: l, porque: `${grados(r)} no va al ${nombre}` });
  }
  return { cota: `El destino está al ${p.dLat > 0 ? 'norte' : 'sur'} y al ${p.dLon > 0 ? 'este' : 'oeste'} de la salida: el rumbo va al ${nombre}, entre ${grados(desde)} y ${grados(desde + 90)}.`, descartadas };
}

/** La distancia entre dos puntos, entre la hipotenusa de Δl con el menor y con el mayor apartamiento posibles. */
function reglaDistancia(q) {
  const p = dosPuntos(q);
  if (!p || !/distancia/i.test(loQuePide(p.tx))) return null;
  const cos = [p.a.lat, p.b.lat].map((x) => Math.cos((x * Math.PI) / 180));
  const aMin = Math.abs(p.dLon) * Math.min(...cos);
  const aMax = Math.abs(p.dLon) * Math.max(...cos);
  const min = Math.hypot(p.dLat, aMin) * 0.99 - 0.1;
  const max = Math.hypot(p.dLat, aMax) * 1.01 + 0.1;
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const o = String(q.opciones[l]);
    const v = primerNumero(o.match(/(\d+(?:[.,]\d+)?)\s*millas/)?.[1] ?? o.replace(/^[^\d]*?=\s*/, ''));
    if (v == null) return null;
    if (v < min) descartadas.push({ letra: l, porque: `${num(v)} millas es menos de lo que separa los dos puntos (al menos ${num(min)})` });
    else if (v > max) descartadas.push({ letra: l, porque: `${num(v)} millas es más de lo que separa los dos puntos (como mucho ${num(max)})` });
  }
  return { cota: `Δl = ${num(Math.abs(p.dLat))}′ y el apartamiento, entre ${num(aMin)} y ${num(aMax)} millas: la distancia está entre ${num(min)} y ${num(max)} millas (Pitágoras).`, descartadas };
}

// ---------------------------------------------------------------------------------------------------------------
// Corriente y estima

/** La velocidad efectiva está entre la resta y la suma de la del barco y la de la corriente. */
function reglaVelocidadEfectiva(q) {
  const tx = q.enunciado ?? '';
  if (!/velocidad efectiva/i.test(loQuePide(tx))) return null;
  const v = velocidadBarco(tx);
  const i = intensidadCorriente(tx);
  if (v == null || i == null) return null;
  const min = Math.abs(v - i);
  const max = v + i;
  const TOL = 0.1;
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const x = primerNumero(q.opciones[l]);
    if (x == null) return null;
    if (x < min - TOL || x > max + TOL) descartadas.push({ letra: l, porque: `${num(x)} nudos no está entre ${num(min)} y ${num(max)}` });
  }
  return { cota: `Barco a ${num(v)} nudos y corriente de ${num(i)}: la efectiva está entre ${num(min)} (en contra) y ${num(max)} (a favor).`, descartadas };
}

/** Rumbo verdadero del barco desde el enunciado: el verdadero escrito o el de aguja con dm y desvío (o la Ct). */
function rumboVerdaderoDe(tx) {
  const rvs = [...tx.matchAll(/(?:rumbo verdadero|\bRv)\s*(?:=|de)?\s*(\d{1,3})\s*[º°]/gi)];
  if (rvs.length === 1) return Number(rvs[0][1]);
  if (rvs.length > 1) return null;
  const ras = [...tx.matchAll(/(?:rumbo de aguja|\bRa)\s*(?:=|de)?\s*(\d{1,3})\s*[º°]/gi)];
  if (ras.length !== 1) return null;
  const ra = Number(ras[0][1]);
  const ct = tx.match(/correcci[oó]n total(?: de| es)?\s*(?:=\s*)?([+\-–−‒])?\s*(\d+(?:[.,]\d+)?)\s*[º°]/i);
  if (ct) return ra + (/[-–−‒]/.test(ct[1] ?? '') ? -1 : 1) * aNumero(ct[2]);
  // Declinación sin año (la del año pide corregirla) y desvío con su signo.
  const dm = tx.match(/declinaci[oó]n magn[eé]tica\s*(?:=|es)\s*(\d+(?:[.,]\d+)?)\s*[º°]\s*(NE|NW|E|W)\b(?!\s*\d{4})/i);
  const dv = tx.match(/desv[ií]o(?: de la aguja)?\s*(?:=|es)?\s*([+\-–−‒])\s*(\d+(?:[.,]\d+)?)\s*[º°]/i);
  if (!dm || !dv) return null;
  return ra + (/W/i.test(dm[2]) ? -1 : 1) * aNumero(dm[1]) + (/[-–−‒]/.test(dv[1]) ? -1 : 1) * aNumero(dv[2]);
}

/** El rumbo efectivo está entre el rumbo del barco en el agua (Rv, o Rv ± abatimiento) y el de la corriente. */
function reglaRumboEfectivo(q) {
  const tx = q.enunciado ?? '';
  const pide = loQuePide(tx);
  if (!/rumbo efectivo|\bRef\b|rumbo que har[aá] el barco/i.test(pide) || /situaci[oó]n/i.test(pide)) return null;
  if (coordenadas(tx).length > 1) return null; // a un punto: lo cubre el cuadrante
  const rv = rumboVerdaderoDe(tx);
  const rc = rumboCorriente(tx);
  if (rv == null || rc == null) return null;
  const abs = [...tx.matchAll(/abatimiento de (\d+(?:[.,]\d+)?)\s*[º°]/gi)];
  if (abs.length > 1) return null;
  const ab = abs.length ? aNumero(abs[0][1]) : 0;
  // El abatimiento lleva el barco a sotavento: viento por babor, Rs = Rv + Ab; por estribor, Rv − Ab. Si el viento no
  // se lee (o viene casi de proa o de popa), valen los dos lados.
  const viento = tx.match(/viento (?:del|de direcci[oó]n)\s+([A-Za-zé]+)/i)?.[1]?.toLowerCase();
  const rel = viento in CARDINALES ? norm180(CARDINALES[viento] - rv) : null;
  const lado = rel == null || Math.abs(rel) < 10 || Math.abs(rel) > 170 ? 0 : rel < 0 ? 1 : -1;
  const superficie = !ab ? [rv] : lado ? [rv + lado * ab] : [rv - ab, rv + ab];
  const arcos = superficie.map((rs) => ({ rs, d: norm180(rc - rs) }));
  if (arcos.some((x) => Math.abs(x.d) > 170)) return null;
  const TOL = 1;
  const dentro = (r) => arcos.some(({ rs, d }) => { const x = norm180(r - rs); return x >= Math.min(0, d) - TOL && x <= Math.max(0, d) + TOL; });
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const r = primerRumbo(q.opciones[l]);
    if (r == null) return null;
    if (!dentro(r)) descartadas.push({ letra: l, porque: `${grados(r)} no está entre el rumbo del barco y el de la corriente` });
  }
  const barco = !ab ? grados(rv) : lado ? `${grados(superficie[0])} (Rv ${grados(rv)} y ${num(ab)}° de abatimiento por ${lado > 0 ? 'babor' : 'estribor'})` : `entre ${grados(rv - ab)} y ${grados(rv + ab)} (Rv ${grados(rv)} y ${num(ab)}° de abatimiento)`;
  return { cota: `El barco va ${ab ? (lado ? 'por el agua al ' : 'por el agua ') : 'al '}${barco} y la corriente hacia ${grados(rc)}: el efectivo queda entre los dos.`, descartadas };
}

/** Las horas del enunciado («HRB = 16:00», «a las 12h 00m», «HRB= 14-00»), en minutos y en orden. */
function horasDelEnunciado(tx) {
  return [...String(tx).matchAll(/(?:HRB|Hrb|\blas)\s*[:=]?\s*(\d{1,2})\s*(?::\s*|h\s*|-\s*)(\d{2})/g)].map((m) => Number(m[1]) * 60 + Number(m[2]));
}

/** Situación de estima: desde la salida, lo navegado en ese tiempo está entre (V − I)·t y (V + I)·t. */
function reglaAlcance(q) {
  const tx = q.enunciado ?? '';
  if (!/situaci[oó]n/i.test(loQuePide(tx))) return null;
  if (/cambia|caemos|m[aá]quina|aver[ií]a|trav[eé]s|demora|distancia|oposici[oó]n|enfilaci[oó]n|verdadero del faro|Situados/i.test(tx)) return null;
  const ps = coordenadas(tx);
  if (ps.length !== 1) return null;
  // Un solo tramo: un solo rumbo en el enunciado (el del barco; el de la corriente es Rc).
  if ([...tx.matchAll(/(?:rumbo(?: verdadero| de aguja)?|\bR[va])\s*(?:=|de)?\s*\d{1,3}\s*[º°]/gi)].length !== 1) return null;
  const hs = horasDelEnunciado(tx);
  if (hs.length !== 2) return null;
  let t = (hs[1] - hs[0]) / 60;
  if (t <= 0) t += 24;
  if (t > 12) return null;
  const v = velocidadBarco(tx);
  if (v == null) return null;
  const sinCorriente = !/corriente/i.test(tx) || /ausencia de[^.]*corriente/i.test(tx);
  const i = sinCorriente ? 0 : intensidadCorriente(tx);
  if (i == null) return null;
  const min = Math.abs(v - i) * t;
  const max = (v + i) * t;
  // Precisión del dibujo en la carta y del redondeo de las opciones: unas décimas de milla.
  const TOL = Math.max(0.6, 0.05 * max);
  const descartadas = [];
  for (const l of letrasDe(q)) {
    const p = coordenadas(q.opciones[l])[0];
    if (!p) return null;
    // Por el camino corto también si se cruza el meridiano 180°.
    const d = rhumbTo(ps[0], { lat: p.lat, lon: ps[0].lon + norm180(p.lon - ps[0].lon) }).distance;
    if (d < min - TOL) descartadas.push({ letra: l, porque: `está a ${num(d)} millas de la salida, menos de lo que se navega (${num(min)})` });
    else if (d > max + TOL) descartadas.push({ letra: l, porque: `está a ${num(d)} millas de la salida, más de lo que da tiempo a navegar (${num(max)})` });
  }
  const horas = num(t, 2);
  return { cota: i ? `En ${horas} h a ${num(v)} nudos con ${num(i)} de corriente: entre ${num(min)} y ${num(max)} millas de la salida.` : `En ${horas} h a ${num(v)} nudos, sin corriente: ${num(max)} millas de la salida.`, descartadas };
}

// ---------------------------------------------------------------------------------------------------------------
// Las reglas

/**
 * Las reglas de descarte, en el orden en que se enseñan. `explica`: la regla en una frase (para el alumno); `tipos`: los
 * tipos de problema donde suele servir (src/course/velocidad.js).
 */
export const REGLAS_DESCARTE = [
  { id: 'marea-hora', nombre: 'La hora, dentro del tramo de marea', tipos: ['marea-sonda'], aplicar: reglaMareaHora,
    explica: 'Si piden la hora «entre la primera pleamar y la primera bajamar», la respuesta está entre esas dos horas del Anuario (en UT) más el adelanto. Una opción fuera de ese tramo es imposible.' },
  { id: 'marea-sonda', nombre: 'La sonda, entre bajamar y pleamar', tipos: ['marea-sonda'], aplicar: reglaMareaSonda,
    explica: 'Sonda = sonda de la carta + altura de la marea, y la altura a esa hora está entre la de la bajamar y la de la pleamar de su tramo. Una sonda menor o mayor es imposible.' },
  { id: 'cuadrante', nombre: 'El cuadrante del rumbo', tipos: ['estima-analitica'], aplicar: reglaCuadrante,
    explica: 'De un punto a otro: si el destino está más al norte y más al oeste, el rumbo va entre 270° y 360°. Mira hacia dónde cambian la latitud y la longitud.' },
  { id: 'distancia-puntos', nombre: 'La distancia, del orden de Δl y el apartamiento', tipos: ['estima-analitica'], aplicar: reglaDistancia,
    explica: 'La distancia entre dos puntos es la hipotenusa de la diferencia de latitud y el apartamiento (Δl en minutos y ΔL por el coseno de la latitud): ni menos ni mucho más.' },
  { id: 'velocidad-efectiva', nombre: 'La velocidad efectiva, entre la resta y la suma', tipos: ['corriente-rumbo-a-dar'], aplicar: reglaVelocidadEfectiva,
    explica: 'Con la corriente en contra vas a la resta de las dos velocidades; a favor, a la suma. Cualquier otra dirección queda entre las dos.' },
  { id: 'rumbo-efectivo', nombre: 'El rumbo efectivo, entre el del barco y el de la corriente', tipos: ['corriente-efectiva'], aplicar: reglaRumboEfectivo,
    explica: 'La corriente te arrastra hacia su lado: el rumbo efectivo queda entre el rumbo del barco (con el abatimiento, si lo hay) y el de la corriente, nunca fuera.' },
  { id: 'alcance', nombre: 'Lo que da tiempo a navegar', tipos: ['estima-directa', 'corriente-efectiva', 'abatimiento', 'estima-analitica'], aplicar: reglaAlcance,
    explica: 'En t horas a V nudos te alejas V·t millas de la salida; con una corriente de I nudos, entre (V − I)·t y (V + I)·t. Una situación más lejos o más cerca es imposible.' },
];

/**
 * Lo que se puede descartar en una pregunta con sus datos: las reglas que se aplican (con su cota y sus opciones
 * descartadas) y las opciones que quedan. null si no se aplica ninguna o si entre todas no dejarían ninguna opción.
 * @returns {{ reglas: { id, nombre, cota, letras: string[] }[], porque: Record<string, string[]>, descartadas: string[], quedan: string[] } | null}
 */
export function descartes(q) {
  const letras = letrasDe(q);
  if (letras.length < 2) return null;
  const reglas = [];
  const porque = {};
  for (const r of REGLAS_DESCARTE) {
    let x = null;
    try { x = r.aplicar(q); } catch { x = null; }
    if (!x?.descartadas?.length || x.descartadas.length >= letras.length) continue;
    reglas.push({ id: r.id, nombre: r.nombre, cota: x.cota, letras: x.descartadas.map((d) => d.letra) });
    for (const d of x.descartadas) (porque[d.letra] ??= []).push(d.porque);
  }
  const descartadas = letras.filter((l) => porque[l]);
  if (!reglas.length || descartadas.length >= letras.length) return null;
  return { reglas, porque, descartadas, quedan: letras.filter((l) => !porque[l]) };
}

/** Una pista general para estimar según el tipo de problema (sin mirar la pregunta: vale en pleno examen). */
export function pistaEstimar(tipo) {
  const r = REGLAS_DESCARTE.find((x) => x.tipos.includes(tipo));
  return r ? r.explica : 'Si no sale, marca la que mejor cuadre descartando lo imposible (signos, cuadrante, orden de magnitud) y sigue: en blanco también cuenta como fallo.';
}

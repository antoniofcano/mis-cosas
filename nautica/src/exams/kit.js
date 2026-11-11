// Kit para resolver preguntas reales de examen con los motores de la app.
// Cada operación calcula, anota un paso explicado (en lenguaje de examen) y añade el dibujo a la carta.
// Las soluciones de cada banco (src/exams/solutions/*.js) se escriben con este kit.
//
// Paso preguntable (modo guiado, src/exams/guiado.js): cada operación que da un valor que el alumno puede calcular o
// medir lo registra junto al paso, en `steps[i].pide = { paso, pregunta, campos: [{ kind, value, label, medido? }] }`:
// `paso` es el tipo de paso de la taxonomía común (src/exams/taxonomia.js), `kind` la magnitud de
// src/analysis/quantities.js (que lee, formatea y da la tolerancia de examen) y `medido` marca lo que se mide sobre
// la carta (transportador, compás). Los pasos que son solo una nota, un dato o una construcción no llevan `pide`.
//
// Kit «con un error típico» (diagnóstico, src/exams/diagnostico.js): createKit(chart, { error: '<tipo>:<variante>' })
// hace exactamente lo mismo salvo en las operaciones donde ese error se comete, que calculan como lo haría quien lo
// comete (p. ej. 'signo-ct:aplicacion' resta la Ct en vez de sumarla). Las variantes están en src/exams/taxonomia.js.

import { rhumbTo, rhumbDestination } from '../math/mercator.js';
import { norm360, norm180, angleDist, toDeg } from '../math/angles.js';
import { parseAngle, fmtBearing, fmtSignedNum, fmtPos, fmtMiles, fmtKnots, fmtClock } from '../math/format.js';
import { fixTwoBearings, fixBearingDistance, fixBearingAndRange, closestApproach } from '../nautical/positioning.js';
import { toPlane, fromPlane, unitsPerMile } from '../math/mercator.js';
import { intersectLines } from '../math/vector.js';
import { effectiveCourse, courseToSteer, windSide, abatimientoSigned } from '../nautical/kinematics.js';
import { timeForHeight, correccionTabla } from '../nautical/tides.js';

const DIR_NAME = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
const coma = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
/** Con signo tipográfico: +12,3 / −4,5. */
const sg = (x, dec = 1) => `${x < 0 ? '−' : '+'}${coma(Math.abs(x), dec)}`;
/** Duración en minutos → "4h 30m". */
/** Sentido de una diferencia con signo: «  → N»; nada si es cero. */
const hacia = (v, pos, neg) => (Math.abs(v) < 0.05 ? '' : `  → ${v < 0 ? neg : pos}`);
const hm = (m) => { const r = Math.round(Math.abs(m)); return `${Math.floor(r / 60)}h ${String(r % 60).padStart(2, '0')}m`; };

export function createKit(chart, { error = null } = {}) {
  const steps = [];
  const items = [];
  const focus = [];
  let n = 0;
  // `extra` (modo guiado, src/ui/guiado.js): { traigo: string[] (datos de pasos anteriores que usa este), plantea: string
  // (la fórmula, que se enseña antes de contestar), lineas: string[] (la cuenta, línea a línea), tabla: { cab, filas } }.
  const step = (title, text, pide, extra) => { steps.push({ title, text, ...(pide ? { pide } : {}), ...(extra ?? {}) }); n = steps.length; };
  /** ¿Se resuelve con este error típico? (`id` = variante exacta o, sin «:», cualquier variante de ese tipo) */
  const E = (id) => error != null && (error === id || (!id.includes(':') && error.split(':')[0] === id));
  /** Lo que pide el paso (modo guiado). */
  const pide = (paso, pregunta, campos) => ({ paso, pregunta, campos });
  const posCampos = (p, medido = true) => [{ kind: 'lat', value: p.lat, label: 'Latitud', medido }, { kind: 'lon', value: p.lon, label: 'Longitud', medido }];
  /** Minutos navegados → horas, o como los lee quien confunde minutos y décimas de hora (1 h 30 min → 1,30 h). */
  const horasDe = (min) => (E('horas-decimales') ? Math.floor(min / 60) + (min % 60) / 100 : min / 60);
  const P = (id) => (typeof id === 'string' ? chart.point(id) : id);
  const nm = (id) => (P(id).name ?? 'el punto').replace(/^Faro de /, 'faro de ');
  const mark = (p) => { focus.push(p); return p; };
  // Dentro de la carta, contando el propio borde (hay enunciados que parten justo de él).
  const dentro = (p) => chart.inBounds(p, -0.001);

  const k = {
    steps, items, focus,
    P,
    /** Coordenadas escritas como en el examen: k.pos("35 50,0 N", "6 10,0 W"). */
    pos(lat, lon, label = 'Situación') {
      const p = { lat: parseAngle(lat), lon: -Math.abs(parseAngle(lon)) * (/E/i.test(lon) ? -1 : 1) };
      // Fuera de la carta L105 se resuelve analíticamente (sin dibujo).
      if (!dentro(p)) { step(label, `${fmtPos(p)}, fuera de esta carta: lo resolvemos con números.`); return p; }
      step(label, `Situamos el punto en la carta: ${fmtPos(p)}.`);
      items.push({ t: 'pos', at: p, label, style: 'start', step: n });
      return mark(p);
    },
    /** Paso libre. */
    note(title, text) { step(title, text); },

    // ---- Aguja
    ct({ dm, desvio, ct, carta, anyo }) {
      if (ct != null) { step('Corrección total', `Ct = ${fmtSignedNum(ct)} (dato).`); return ct; }
      let d = dm;
      if (carta) {
        const [base, year, varMin] = carta; // varMin con signo: + E, − W
        let exact = base + (varMin / 60) * (anyo - year);
        if (E('dm-sin-actualizar')) exact = base;
        if (E('variacion-signo')) exact = base - (varMin / 60) * (anyo - year);
        // Se trabaja con la declinación exacta, al minuto: redondearla al grado (y con Math.round, siempre hacia el E en
        // los valores negativos) movía la Ct medio grado en casos como 3,5° o −2,5°.
        d = Math.round(exact * 60) / 60;
        step('Declinación actualizada', `dm ${anyo} = ${fmtSignedNum(base, 2)} + (${anyo - year} años × ${varMin}′) = ${fmtSignedNum(d, 2)}.`,
          pide('declinacion', `¿Cuánto vale la declinación magnética en ${anyo}?`, [{ kind: 'signed', value: d, label: `dm ${anyo}` }]));
      }
      if (E('signo-dm')) d = -d;
      let dz = desvio ?? 0;
      if (E('signo-desvio')) dz = -dz;
      if (E('olvida-desvio')) dz = 0;
      let r = d + dz;
      if (E('signo-ct:valor')) r = -r;
      step('Corrección total', `Ct = dm + Δ = (${fmtSignedNum(d)}) + (${fmtSignedNum(dz)}) = ${fmtSignedNum(r)}.`,
        pide('ct', '¿Cuánto vale la corrección total (Ct)?', [{ kind: 'signed', value: r, label: 'Ct' }]));
      return r;
    },
    rv(ra, ct) {
      const c = E('sin-ct') ? 0 : E('signo-ct:aplicacion') || E('signo-ct:resta-siempre') ? -ct : ct;
      const r = norm360(ra + c);
      step('Rumbo verdadero', `Rv = Ra + Ct = ${fmtBearing(ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(r)}.`, pide('aguja', '¿Cuál es el rumbo verdadero (Rv)?', [{ kind: 'bearing', value: r, label: 'Rv' }]));
      return r;
    },
    ra(rv, ct) {
      const c = E('sin-ct') ? 0 : E('signo-ct:aplicacion') || E('signo-ct:suma-siempre') ? -ct : ct;
      const r = norm360(rv - c);
      step('Rumbo de aguja', `Ra = Rv − Ct = ${fmtBearing(rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(r)}.`, pide('aguja', '¿Cuál es el rumbo de aguja (Ra)?', [{ kind: 'bearing', value: r, label: 'Ra' }]));
      return r;
    },
    dv(da, ct, id) {
      const c = E('sin-ct') ? 0 : E('signo-ct:aplicacion') || E('signo-ct:resta-siempre') ? -ct : ct;
      const r = norm360(da + c);
      step(`Demora verdadera ${nm(id)}`, `Dv = Da + Ct = ${fmtBearing(da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(r)}.`, pide('aguja', `¿Cuál es la demora verdadera de ${nm(id)}?`, [{ kind: 'bearing', value: r, label: 'Dv' }]));
      return r;
    },
    /** Marcación con signo (+ estribor, − babor). */
    dvM(rv, m, id) {
      const r = E('marcacion-como-demora') ? norm360(m) : norm360(E('banda-marcacion') ? rv - m : rv + m);
      step(`Demora verdadera ${nm(id)}`, `Dv = Rv + M = ${fmtBearing(rv)} + (${fmtSignedNum(m)}) [${m >= 0 ? 'estribor' : 'babor'}] = ${fmtBearing(r)}.`, pide('marcacion', `¿Cuál es la demora verdadera de ${nm(id)}?`, [{ kind: 'bearing', value: r, label: 'Dv' }]));
      return r;
    },
    /** Ct = Dv − Da. */
    ctFrom(dv, da) {
      let r = norm180(dv - da);
      if (E('signo-ct:valor') || E('signo-ct:aplicacion')) r = -r;
      step('Corrección total', `Ct = Dv − Da = ${fmtBearing(dv, 1)} − ${fmtBearing(da)} = ${fmtSignedNum(r, 1)}.`, pide('ct', '¿Cuánto vale la corrección total (Ct)?', [{ kind: 'signed', value: r, label: 'Ct' }]));
      return r;
    },

    // ---- Líneas de posición
    /** Demora verdadera desde el barco hacia el faro `toward` cuando estamos en la oposición `other`–`toward`. */
    oposicion(other, toward) {
      const dv = norm360(rhumbTo(P(other), P(toward)).bearing + (E('sentido-recta') ? 180 : 0));
      step('Oposición', `En la oposición de ${nm(other)} y ${nm(toward)} estamos entre ambos: la demora a ${nm(toward)} es la de la recta ${nm(other)} → ${nm(toward)}, Dv = ${fmtBearing(dv, 1)}.`,
        pide('linea', `Mide en la carta la demora verdadera de ${nm(toward)} en la oposición.`, [{ kind: 'bearing', value: dv, label: 'Dv', medido: true }]));
      items.push({ t: 'seg', from: P(other), to: P(toward), style: 'lop', step: n });
      mark(P(other)); mark(P(toward));
      return dv;
    },
    /** Enfilación: devuelve la Dv de la línea en el sentido más próximo a `approx`. */
    enfilacion(a, b, approx) {
      const ab = rhumbTo(P(a), P(b)).bearing;
      let dv = approx == null || angleDist(ab, approx) <= 90 ? ab : norm360(ab + 180);
      if (E('sentido-recta')) dv = norm360(dv + 180);
      step('Enfilación', `La enfilación de ${nm(a)} y ${nm(b)} se mide en la carta uniendo ambos faros: Dv = ${fmtBearing(dv, 1)}.`,
        pide('linea', `Mide en la carta la demora verdadera de la enfilación de ${nm(a)} y ${nm(b)}.`, [{ kind: 'bearing', value: dv, label: 'Dv', medido: true }]));
      items.push({ t: 'line', through: P(a), bearing: dv, length: rhumbTo(P(a), P(b)).distance * 2 + 10, style: 'lop', step: n });
      mark(P(a)); mark(P(b));
      return dv;
    },
    /** Situación por dos demoras verdaderas (desde el barco a cada punto). */
    fix2(a, dvA, b, dvB, label = 'Situación') {
      const p = fixTwoBearings(P(a), dvA, P(b), dvB) ?? lineCut(P(a), dvA, P(b), dvB);
      if (!p) throw new Error('Sin corte');
      step(label, `Desde ${nm(a)} trazamos ${fmtBearing(dvA + 180)} y desde ${nm(b)} ${fmtBearing(dvB + 180)}: se cortan en ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      for (const [m, dv] of [[a, dvA], [b, dvB]]) items.push({ t: 'ray', from: P(m), bearing: norm360(dv + 180), length: rhumbTo(P(m), p).distance + 1.5, style: 'lop', step: n });
      items.push({ t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** Situación por demora verdadera y distancia a un punto. */
    fixDist(id, dv, dist, label = 'Situación') {
      const p = fixBearingDistance(P(id), E('demora-sin-opuesta') ? norm360(dv + 180) : dv, dist);
      step(label, `Desde ${nm(id)} trazamos ${fmtBearing(dv + 180)} y medimos ${fmtMiles(dist)}: ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'ray', from: P(id), bearing: norm360(dv + 180), length: dist, style: 'lop', step: n }, { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(id));
      return mark(p);
    },
    /** Demora a un punto y distancia a otro: `pick` = índice de la solución (0 la más cercana al punto de la demora). */
    fixBearingRange(idB, dv, idR, dist, pick = 0, label = 'Situación') {
      const sols = fixBearingAndRange(P(idB), dv, P(idR), dist);
      const p = sols[Math.min(pick, sols.length - 1)];
      if (!p) throw new Error('Sin corte');
      step(label, `Línea ${fmtBearing(dv + 180)} desde ${nm(idB)} y arco de ${fmtMiles(dist)} con centro en ${nm(idR)}: ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'ray', from: P(idB), bearing: norm360(dv + 180), length: rhumbTo(P(idB), p).distance + 1.5, style: 'lop', step: n },
        { t: 'arc', center: P(idR), radius: dist, around: rhumbTo(P(idR), p).bearing, span: 40, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(idB)); mark(P(idR));
      return mark(p);
    },
    /** Situación por dos distancias (dos arcos). `near` elige el corte más próximo a ese punto. */
    fix2Ranges(a, da, b, db, near, label = 'Situación') {
      const pa = toPlane(P(a)); const pb = toPlane(P(b));
      const lat = (P(a).lat + P(b).lat) / 2;
      const ra = da * unitsPerMile(lat); const rb = db * unitsPerMile(lat);
      const dx = pb.x - pa.x; const dy = pb.y - pa.y; const d = Math.hypot(dx, dy);
      const x = (ra * ra - rb * rb + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(0, ra * ra - x * x));
      const base = { x: pa.x + (dx * x) / d, y: pa.y + (dy * x) / d };
      const c = [{ x: base.x - (dy * h) / d, y: base.y + (dx * h) / d }, { x: base.x + (dy * h) / d, y: base.y - (dx * h) / d }].map(fromPlane);
      const p = near ? c.sort((u, v) => rhumbTo(u, near).distance - rhumbTo(v, near).distance)[0] : c[0];
      step(label, `Arcos de ${fmtMiles(da)} con centro en ${nm(a)} y de ${fmtMiles(db)} con centro en ${nm(b)}: se cortan en ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'arc', center: P(a), radius: da, around: rhumbTo(P(a), p).bearing, span: 40, style: 'lop', step: n },
        { t: 'arc', center: P(b), radius: db, around: rhumbTo(P(b), p).bearing, span: 40, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** "a d millas al <dir> verdadero del faro X" (dir en grados). */
    fromMark(id, dir, dist, label = 'Situación') {
      const p = rhumbDestination(P(id), E('lado-del-faro') ? norm360(dir + 180) : dir, dist);
      step(label, `A ${fmtMiles(dist)} al ${DIR_NAME[dir] ?? fmtBearing(dir)} verdadero de ${nm(id)}: desde el faro trazamos ${fmtBearing(dir)} y medimos la distancia: ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'ray', from: P(id), bearing: dir, length: dist, style: 'construction', step: n }, { t: 'pos', at: p, label, style: 'start', step: n });
      mark(P(id));
      return mark(p);
    },
    /** "al <dirA> verdadero de A y al <dirB> verdadero de B" */
    cardinal2(a, dirA, b, dirB, label = 'Situación') {
      const p = fixTwoBearings(P(a), norm360(dirA + 180), P(b), norm360(dirB + 180)) ?? lineCut(P(a), norm360(dirA + 180), P(b), norm360(dirB + 180));
      step(label, `Desde ${nm(a)} trazamos ${fmtBearing(dirA)} (${DIR_NAME[dirA] ?? ''}) y desde ${nm(b)} ${fmtBearing(dirB)} (${DIR_NAME[dirB] ?? ''}): se cortan en ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      for (const [m, d] of [[a, dirA], [b, dirB]]) items.push({ t: 'ray', from: P(m), bearing: d, length: rhumbTo(P(m), p).distance + 1, style: 'construction', step: n });
      items.push({ t: 'pos', at: p, label, style: 'start', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** Corte de una línea que pasa por `through` con rumbo `dv` y la demora `dvB` a otro punto. */
    lineAndBearing(through, dv, b, dvB, label = 'Situación') {
      const p = lineCut(P(through), dv, P(b), dvB);
      step(label, `Corte de la línea ${fmtBearing(dv)} que pasa por ${nm(through)} con la demora ${fmtBearing(dvB)} de ${nm(b)} (trazada desde el faro como ${fmtBearing(dvB + 180)}): ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'ray', from: P(b), bearing: norm360(dvB + 180), length: rhumbTo(P(b), p).distance + 1.5, style: 'lop', step: n }, { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(b));
      return mark(p);
    },

    // ---- Navegación
    /** Estima: desde `from` al Rv `rv` durante `dist` millas. */
    run(from, rv, dist, label = 'Situación de estima') {
      const p = rhumbDestination(from, rv, dist);
      step(label, `Desde ${fmtPos(from)} trazamos el Rv ${fmtBearing(rv)} y medimos ${fmtMiles(dist, 2)}: ${fmtPos(p)}.`, pide('estima', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'vec', from, bearing: rv, length: dist, style: 'boat', step: n }, { t: 'pos', at: p, label, style: 'estima', step: n });
      return mark(p);
    },
    /** Distancia = V · t, con t en minutos. */
    distFor(v, minutes) {
      const d = v * horasDe(minutes);
      step('Distancia navegada', `d = V · t = ${fmtKnots(v)} × ${minutes} min / 60 = ${fmtMiles(d, 2)}.`, pide('tiempo', '¿Cuántas millas se navegan?', [{ kind: 'distance', value: d, label: 'Distancia' }]));
      return d;
    },
    /** Rumbo verdadero y distancia entre dos puntos. */
    rhumb(a, b, label = 'Rumbo y distancia') {
      const r = rhumbTo(P(a), P(b));
      step(label, `Uniendo ${typeof a === 'string' ? nm(a) : 'el punto de salida'} con ${typeof b === 'string' ? nm(b) : 'el punto de llegada'}: Rv = ${fmtBearing(r.bearing)}, distancia = ${fmtMiles(r.distance)}.`,
        pide('medida', 'Mide en la carta el rumbo verdadero y la distancia.', [{ kind: 'bearing', value: r.bearing, label: 'Rv', medido: true }, { kind: 'distance', value: r.distance, label: 'Distancia', medido: true }]));
      items.push({ t: 'seg', from: P(a), to: P(b), style: 'boat', arrow: true, step: n });
      mark(P(a)); mark(P(b));
      return { rv: r.bearing, dist: r.distance };
    },
    /** Demora verdadera y distancia de un punto a un faro (lo que se mide en la carta). */
    bearingTo(from, id) {
      const r = rhumbTo(P(from), P(id));
      step(`Demora y distancia a ${nm(id)}`, `Medimos en la carta desde ${fmtPos(P(from))}: Dv = ${fmtBearing(r.bearing)}, distancia = ${fmtMiles(r.distance)}.`,
        pide('medida', `Mide en la carta la demora verdadera y la distancia a ${nm(id)}.`, [{ kind: 'bearing', value: r.bearing, label: 'Dv', medido: true }, { kind: 'distance', value: r.distance, label: 'Distancia', medido: true }]));
      items.push({ t: 'seg', from: P(from), to: P(id), style: 'construction', step: n });
      mark(P(id));
      return { dv: r.bearing, dist: r.distance };
    },
    /** Rumbo verdadero para pasar a `d` millas de un faro dejándolo por la banda `side` ('babor'|'estribor'). */
    tangent(from, id, d, side) {
      const r = rhumbTo(P(from), P(id));
      const alpha = E('directo') ? 0 : toDeg(Math.asin(Math.min(1, d / r.distance)));
      const lado = E('banda') ? (side === 'estribor' ? 'babor' : 'estribor') : side;
      const rv = norm360(lado === 'estribor' ? r.bearing - alpha : r.bearing + alpha);
      step('Rumbo para pasar a distancia', `Con centro en ${nm(id)} trazamos un arco de ${fmtMiles(d)}. Desde la situación (a ${fmtMiles(r.distance)} del faro, demora ${fmtBearing(r.bearing)}) trazamos la tangente dejando el faro por ${side}: ` +
        `ángulo = arcsen(${String(d).replace('.', ',')} / ${r.distance.toFixed(1).replace('.', ',')}) = ${alpha.toFixed(1).replace('.', ',')}°, rumbo a seguir = ${fmtBearing(rv)}.`,
        pide('tangente', `¿Qué rumbo verdadero hay que hacer para pasar a ${fmtMiles(d)} de ${nm(id)}?`, [{ kind: 'bearing', value: rv, label: 'Rv', medido: true }]));
      const ca = closestApproach(P(from), rv, P(id));
      items.push({ t: 'arc', center: P(id), radius: d, around: rhumbTo(P(id), ca.point).bearing, span: 70, style: 'construction', step: n },
        { t: 'vec', from: P(from), bearing: rv, length: Math.max(ca.along * 1.3, 3), style: 'boat', step: n });
      mark(P(id));
      return rv;
    },
    /** HRB de llegada: t0 en minutos desde 00:00. */
    eta(t0, dist, v) {
      const hDec = dist / v;
      // Error típico: leer las horas decimales como horas y minutos (1,5 h → 1 h 50 min).
      const mins = E('horas-decimales') ? Math.floor(hDec) * 60 + Math.round((hDec % 1) * 100) : hDec * 60;
      const t = t0 + mins;
      step('HRB de llegada', `t = d / V = ${fmtMiles(dist)} / ${fmtKnots(v)} = ${Math.round(mins)} min → ${fmtClock(t0)} + ${Math.round(mins)} min = ${fmtClock(t)}.`, pide('tiempo', '¿A qué hora (HRB) se llega?', [{ kind: 'clock', value: t, label: 'HRB' }]));
      return t;
    },
    distanceBetween(a, b) {
      const r = rhumbTo(P(a), P(b));
      step(`Distancia a ${typeof b === 'string' ? nm(b) : 'el punto'}`, `Medimos con el compás en la escala de latitudes: ${fmtMiles(r.distance)}.`, pide('medida', 'Mide la distancia en la carta (escala de latitudes).', [{ kind: 'distance', value: r.distance, label: 'Distancia', medido: true }]));
      items.push({ t: 'seg', from: P(a), to: P(b), style: 'construction', step: n });
      mark(P(b));
      return r.distance;
    },

    // ---- Viento y corriente
    /** Abatimiento: del Rv al rumbo de superficie. `vientoDe` = de dónde sopla (grados). */
    abatimiento(rv, grados, vientoDe) {
      const banda = windSide(vientoDe, rv);
      const ab = abatimientoSigned(grados, banda);
      const rs = norm360(rv + (E('sin-abatimiento') ? 0 : E('signo-abatimiento') ? -ab : ab));
      step('Rumbo de superficie', `El viento del ${DIR_NAME[vientoDe] ?? fmtBearing(vientoDe)} entra por ${banda}: nos abate a ${banda === 'babor' ? 'estribor' : 'babor'}, Ab = ${fmtSignedNum(ab, 0)}. Rs = Rv + Ab = ${fmtBearing(rv)} + (${fmtSignedNum(ab, 0)}) = ${fmtBearing(rs)}.`,
        pide('abatimiento', '¿Cuál es el rumbo de superficie (Rs)?', [{ kind: 'bearing', value: rs, label: 'Rs' }]));
      return rs;
    },
    /** Al revés: el rumbo de superficie que necesitamos → el Rv que hay que dar. */
    rvConAbatimiento(rs, grados, vientoDe) {
      const banda = windSide(vientoDe, rs);
      const ab = abatimientoSigned(grados, banda);
      const rv = norm360(rs - (E('sin-abatimiento') ? 0 : E('signo-abatimiento') ? -ab : ab));
      step('Rumbo verdadero a dar', `El viento del ${DIR_NAME[vientoDe] ?? fmtBearing(vientoDe)} entra por ${banda} y nos abatiría ${fmtSignedNum(ab, 0)}: lo compensamos metiendo la proa al viento. Rv = Rs − Ab = ${fmtBearing(rs)} − (${fmtSignedNum(ab, 0)}) = ${fmtBearing(rv)}.`,
        pide('abatimiento', '¿Qué rumbo verdadero (Rv) hay que dar para compensar el abatimiento?', [{ kind: 'bearing', value: rv, label: 'Rv' }]));
      return rv;
    },
    /** Rumbo y velocidad efectivos (vector barco + vector corriente). Dibuja el triángulo en `from` si se da. */
    efectivo(rs, vb, rc, ic, from) {
      let { ref, vef } = effectiveCourse(rs, vb, E('corriente-invertida') ? norm360(rc + 180) : rc, ic);
      if (E('sin-corriente')) { ref = rs; vef = vb; }
      if (E('corriente-sumada')) vef = vb + ic;
      step('Rumbo y velocidad efectivos', `Triángulo de velocidades: vector barco ${fmtBearing(rs)} y ${fmtKnots(vb)}; a continuación, vector corriente ${fmtBearing(rc)} y ${fmtKnots(ic)}. La resultante es Ref = ${fmtBearing(ref)} y Vef = ${fmtKnots(vef)}.`,
        pide('corriente', '¿Cuáles son el rumbo efectivo (Ref) y la velocidad efectiva (Vef)?', [{ kind: 'bearing', value: ref, label: 'Ref', medido: true }, { kind: 'speed', value: vef, label: 'Vef', medido: true }]));
      if (from && dentro(from)) {
        const tip = rhumbDestination(from, rs, vb);
        items.push({ t: 'vec', from, bearing: rs, length: vb, label: `Rs ${fmtBearing(rs)}`, style: 'boat', step: n },
          { t: 'vec', from: tip, bearing: rc, length: ic, label: 'Corriente', style: 'current', step: n },
          { t: 'vec', from, bearing: ref, length: vef, label: `Ref ${fmtBearing(ref)}`, style: 'effective', step: n });
      }
      return { ref, vef };
    },
    /** Situación de estima con viento y corriente: d = Vef · t sobre el Ref. */
    estimaEfectiva(from, ref, vef, minutes, label = 'Situación de estima') {
      const d = vef * horasDe(minutes);
      const p = rhumbDestination(from, ref, d);
      step(label, `En ${minutes} min recorremos ${fmtKnots(vef)} × ${coma(minutes / 60)} h = ${fmtMiles(d, 2)} sobre el Ref ${fmtBearing(ref)}: ${fmtPos(p)}.`, pide('estima', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'vec', from, bearing: ref, length: d, style: 'effective', step: n }, { t: 'pos', at: p, label, style: 'estima', step: n });
      return mark(p);
    },
    /**
     * Rumbo y velocidad del barco para ir de `from` a `to` en `minutes` con corriente (rc, ic):
     * vector barco = vector efectivo (lo que hay que recorrer por hora) − vector corriente.
     */
    rumboYVelocidad(from, to, minutes, rc, ic) {
      const r = rhumbTo(P(from), P(to));
      const vef = r.distance / horasDe(minutes);
      step('Rumbo y velocidad efectivos', `Uniendo la salida con ${typeof to === 'string' ? nm(to) : 'el destino'}: Ref = ${fmtBearing(r.bearing)}, ${fmtMiles(r.distance)} en ${coma(minutes / 60, 1)} h → Vef = ${fmtKnots(vef)}.`,
        pide('medida', 'Mide el rumbo efectivo (Ref) y calcula la velocidad efectiva (Vef) que hace falta.', [{ kind: 'bearing', value: r.bearing, label: 'Ref', medido: true }, { kind: 'speed', value: vef, label: 'Vef' }]));
      items.push({ t: 'seg', from: P(from), to: P(to), style: 'effective', arrow: true, step: n });
      if (typeof to === 'string') mark(P(to));
      const e = { x: vef * Math.sin(r.bearing * Math.PI / 180), y: vef * Math.cos(r.bearing * Math.PI / 180) };
      const rcE = E('corriente-invertida') ? norm360(rc + 180) : rc;
      const c = { x: ic * Math.sin(rcE * Math.PI / 180), y: ic * Math.cos(rcE * Math.PI / 180) };
      let rs = norm360(toDeg(Math.atan2(e.x - c.x, e.y - c.y)));
      let vb = Math.hypot(e.x - c.x, e.y - c.y);
      if (E('sin-corriente')) { rs = r.bearing; vb = vef; }
      if (E('corriente-sumada')) vb = vef - ic;
      step('Triángulo de velocidades', `Desde la salida trazamos el vector corriente ${fmtBearing(rc)} y ${fmtKnots(ic)}; uniendo su extremo con el extremo del vector efectivo (${fmtMiles(vef)} en una hora) sale el vector barco: Rs = ${fmtBearing(rs)}, Vb = ${fmtKnots(vb)}.`,
        pide('corriente', '¿Qué rumbo de superficie (Rs) y qué velocidad (Vb) debe llevar el barco?', [{ kind: 'bearing', value: rs, label: 'Rs', medido: true }, { kind: 'speed', value: vb, label: 'Vb', medido: true }]));
      const pc = rhumbDestination(P(from), rc, ic);
      items.push({ t: 'vec', from: P(from), bearing: rc, length: ic, label: 'Corriente', style: 'current', step: n },
        { t: 'vec', from: pc, bearing: rs, length: vb, label: `Rs ${fmtBearing(rs)}`, style: 'boat', step: n });
      return { rs, vb, ref: r.bearing, vef };
    },
    /** Corte de nuestro rumbo (desde `from`) con la demora `dv` a un faro: «cuando lo tengamos por el través»… */
    corteRumbo(from, rumbo, id, dv, label = 'Situación') {
      const p = lineCut(P(from), rumbo, P(id), dv);
      if (!p) throw new Error('Sin corte');
      step(label, `Desde ${nm(id)} trazamos ${fmtBearing(dv + 180)} y la cortamos con nuestro rumbo ${fmtBearing(rumbo)}: ${fmtPos(p)}.`, pide('situacion', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'seg', from: P(from), to: p, style: 'boat', arrow: true, step: n },
        { t: 'ray', from: P(id), bearing: norm360(dv + 180), length: rhumbTo(P(id), p).distance + 1.5, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(id));
      return mark(p);
    },
    /** Demoras no simultáneas: la 1ª línea se traslada lo navegado (rumbo, millas) y se corta con la 2ª. */
    traslado(a, dvA, b, dvB, rumbo, millas, label = 'Situación') {
      const pA2 = rhumbDestination(P(a), rumbo, E('sin-traslado') ? 0 : millas);
      const p = lineCut(pA2, dvA, P(b), dvB);
      if (!p) throw new Error('Sin corte');
      step('Traslado de la 1ª línea', `Desde ${nm(a)} llevamos ${fmtBearing(rumbo)} y ${fmtMiles(millas, 1)}: por ese punto trazamos una paralela a la 1ª demora (${fmtBearing(dvA + 180)}).`);
      items.push({ t: 'ray', from: P(a), bearing: norm360(dvA + 180), length: rhumbTo(P(a), p).distance + 2, style: 'lop', step: n },
        { t: 'vec', from: P(a), bearing: rumbo, length: millas, style: 'construction', step: n },
        { t: 'line', through: p, bearing: dvA, length: 8, label: 'trasladada', style: 'lop2', step: n });
      step(label, `Desde ${nm(b)} trazamos ${fmtBearing(dvB + 180)}: corta a la línea trasladada en ${fmtPos(p)}.`, pide('traslado', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'ray', from: P(b), bearing: norm360(dvB + 180), length: rhumbTo(P(b), p).distance + 1.5, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /**
     * Demora y distancia no simultáneas: la demora `dvA` del faro `a` se traslada lo navegado (rumbo, millas)
     * y se corta con el arco de `dist` millas del faro `b`. `elegir(cortes)` decide entre los dos cortes.
     */
    trasladoArco(a, dvA, b, dist, rumbo, millas, elegir, label = 'Situación') {
      const A = P(a); const B = P(b);
      const cortes = cortesRectaArco(rhumbDestination(A, rumbo, E('sin-traslado') ? 0 : millas), dvA, B, dist);
      const p = elegir(cortes);
      if (!p) throw new Error('Sin corte');
      step('Traslado de la 1ª línea', `Desde ${nm(a)} llevamos el rumbo ${fmtBearing(rumbo)} y ${fmtMiles(millas)} navegadas: por ese punto trazamos una paralela a la 1ª demora (${fmtBearing(dvA + 180)} desde el faro).`);
      items.push({ t: 'ray', from: A, bearing: norm360(dvA + 180), length: rhumbTo(A, p).distance + 2, style: 'lop', step: n },
        { t: 'vec', from: A, bearing: rumbo, length: millas, style: 'construction', step: n },
        { t: 'line', through: p, bearing: dvA, length: 8, label: 'trasladada', style: 'lop2', step: n });
      step(label, `Con centro en ${nm(b)} trazamos el arco de ${fmtMiles(dist)}: corta a la línea trasladada en ${cortes.map((c) => fmtPos(c)).join(' y en ')}. Nos quedamos con ${fmtPos(p)}, el corte en el mar y coherente con la derrota.`, pide('traslado', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'arc', center: B, radius: dist, around: rhumbTo(B, p).bearing, span: 40, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(A); mark(B);
      return mark(p);
    },
    /** Distancias no simultáneas: el centro del 1er arco se traslada lo navegado y se corta con el 2º arco. */
    trasladoDosArcos(a, da, b, db, rumbo, millas, elegir, label = 'Situación') {
      const A = P(a); const B = P(b);
      const A2 = rhumbDestination(A, rumbo, E('sin-traslado') ? 0 : millas);
      const cortes = cortesDosArcos(A2, da, B, db);
      const p = elegir(cortes);
      if (!p) throw new Error('Sin corte');
      step('Traslado de la 1ª línea', `La 1ª línea de posición es el arco de ${fmtMiles(da)} con centro en ${nm(a)}. Trasladamos su centro lo navegado entre las dos observaciones, ${fmtBearing(rumbo)} y ${fmtMiles(millas)}: nuevo centro en ${fmtPos(A2)}, y desde él trazamos de nuevo el arco de ${fmtMiles(da)}.`);
      items.push({ t: 'vec', from: A, bearing: rumbo, length: millas, style: 'construction', step: n },
        { t: 'arc', center: A2, radius: da, around: rhumbTo(A2, p).bearing, span: 40, label: 'trasladada', style: 'lop2', step: n });
      step(label, `Con centro en ${nm(b)} trazamos el arco de ${fmtMiles(db)}: los dos arcos se cortan en ${cortes.map((c) => fmtPos(c)).join(' y en ')}. Nos quedamos con ${fmtPos(p)}, el corte en el mar.`, pide('traslado', `Marca o escribe la ${label.toLowerCase()}.`, posCampos(p)));
      items.push({ t: 'arc', center: B, radius: db, around: rhumbTo(B, p).bearing, span: 40, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(A); mark(B);
      return mark(p);
    },
    /** Estima por varios tramos {rumbo, millas, nombre?} sumando Δl y apartamiento (sin carta si se sale). */
    tramos(from, lista, label = 'Situación de estima') {
      let dl = 0; let ap = 0;
      const min = (v, lab) => ({ kind: 'minutos', value: v, label: lab });
      const lt = (p) => fmtPos(p).split('  ')[0];
      const lg = (p) => fmtPos(p).split('  ')[1];
      const filas = lista.map((t) => {
        const r = t.rumbo * Math.PI / 180;
        const [a, b] = E('seno-coseno') ? [t.millas * Math.sin(r), t.millas * Math.cos(r)] : [t.millas * Math.cos(r), t.millas * Math.sin(r)];
        dl += a; ap += b;
        return { nombre: t.nombre ?? fmtBearing(t.rumbo), rumbo: t.rumbo, millas: t.millas, dl: a, ap: b, corriente: /corriente/i.test(t.nombre ?? '') };
      });
      // Un paso por tramo (la corriente es un tramo más): es la tabla que se hace en el examen, fila a fila.
      filas.forEach((f, i) => {
        const R = fmtBearing(f.rumbo); const d = coma(f.millas, 1);
        step(`${f.corriente ? 'La corriente' : `Tramo ${i + 1}`}: Δl y apartamiento`,
          `${f.nombre}, ${fmtMiles(f.millas, 1)}: Δl = d · cos R = ${d} × cos ${R} = ${sg(f.dl)}′; A = d · sen R = ${d} × sen ${R} = ${sg(f.ap)}′.`,
          pide('loxodromica', f.corriente ? '¿Cuánto nos mueve la corriente en latitud (Δl) y en apartamiento (A)?' : `¿Cuánto avanzamos en latitud (Δl) y en apartamiento (A) en el tramo ${i + 1}?`, [min(f.dl, 'Δl (N +, S −)'), min(f.ap, 'A (E +, W −)')]),
          { traigo: [`${f.corriente ? 'Rc' : 'Rv'} = ${R}${f.corriente ? ` (${f.nombre.replace(/^corriente\s*/i, '')})` : ''}`, `d = ${d} millas`],
            plantea: `Δl = d · cos R   ·   A = d · sen R${f.corriente ? '   (la corriente es un tramo más: su rumbo y lo que nos arrastra en todo el tiempo)' : ''}`,
            lineas: [`Δl = ${d} × cos ${R} = ${sg(f.dl)}′${hacia(f.dl, 'N', 'S')}`, `A = ${d} × sen ${R} = ${sg(f.ap)}′${hacia(f.ap, 'E', 'W')}`] });
      });
      const tabla = { cab: ['Tramo', 'R', 'd', 'Δl', 'A'], filas: filas.map((f, i) => [f.corriente ? 'Corr.' : String(i + 1), fmtBearing(f.rumbo), coma(f.millas, 1), sg(f.dl), sg(f.ap)]) };
      // Con un solo tramo no hay nada que sumar.
      if (filas.length > 1) step('Sumo la tabla', `Sumamos las columnas con su signo (N y E +, S y W −): ${filas.map((f) => `${f.nombre} ${fmtMiles(f.millas, 1)}: Δl ${sg(f.dl)}′, A ${sg(f.ap)}′`).join('; ')}. Totales: Δl = ${sg(dl)}′, A = ${sg(ap)}′.`,
        pide('loxodromica', '¿Cuánto suman la Δl y el apartamiento?', [min(dl, 'Δl total'), min(ap, 'A total')]),
        { tabla, croquis: { tipo: 'tramos', legs: filas.map((f) => ({ dl: f.dl, ap: f.ap, corriente: f.corriente })) }, plantea: 'Suma cada columna con su signo: N y E suman, S y W restan.',
          lineas: [`Δl total = ${filas.map((f) => sg(f.dl)).join(' ')} = ${sg(dl)}′${hacia(dl, 'N', 'S')}`, `A total = ${filas.map((f) => sg(f.ap)).join(' ')} = ${sg(ap)}′${hacia(ap, 'E', 'W')}`] });
      const lat = from.lat + dl / 60;
      const lm = E('lm-salida') ? from.lat : (from.lat + lat) / 2;
      const cos = Math.cos(lm * Math.PI / 180);
      const dL = E('sin-cos-lm') ? ap : E('cos-lm-multiplica') ? ap * cos : ap / cos;
      let p = { lat, lon: from.lon + (E('signo-dL') ? -dL : dL) / 60 };
      step('Latitud de llegada', `l = ${lt(from)} ${dl < 0 ? '−' : '+'} ${coma(Math.abs(dl), 1)}′ = ${lt(p)}.`, pide('loxodromica', '¿Cuál es la latitud de llegada?', [{ kind: 'lat', value: p.lat, label: 'Latitud' }]),
        { traigo: [`l salida = ${lt(from)}`, `Δl total = ${sg(dl)}′`], plantea: 'l llegada = l salida + Δl   (los minutos de Δl son minutos de latitud)',
          lineas: [`${lt(from)} ${dl < 0 ? '−' : '+'} ${coma(Math.abs(dl), 1)}′`, `l llegada = ${lt(p)}`] });
      step('Del apartamiento a la diferencia de longitud', `Latitud media ${coma(Math.abs(lm), 1)}°: ΔL = A / cos lm = ${sg(ap)}′ / ${coma(cos, 3)} = ${sg(dL)}′.`,
        pide('loxodromica', '¿Cuánto vale la diferencia de longitud (ΔL)?', [min(dL, 'ΔL (E +, W −)')]),
        { traigo: [`A total = ${sg(ap)}′`, `l salida = ${lt(from)}`, `l llegada = ${lt(p)}`], plantea: 'lm = (l salida + l llegada) / 2   ·   ΔL = A / cos lm   (el apartamiento son millas; ΔL, minutos de longitud)',
          lineas: [`lm = ${coma(Math.abs(lm), 1)}°`, `cos lm = ${coma(cos, 3)}`, `ΔL = ${sg(ap)} / ${coma(cos, 3)} = ${sg(dL)}′${hacia(dL, 'E', 'W')}`] });
      const bruta = p.lon;
      let cruce = '';
      const lineasL = [`${lg(from)} ${(bruta - from.lon) * (from.lon < 0 ? -1 : 1) < 0 ? '−' : '+'} ${coma(Math.abs(dL), 1)}′`];
      if (Math.abs(p.lon) > 180) {
        const a = Math.abs(p.lon);
        p = { lat: p.lat, lon: norm180(p.lon) };
        cruce = ` La longitud sale ${Math.floor(a)}° ${coma((a % 1) * 60, 1)}′ ${p.lon < 0 ? 'E' : 'W'}, más de 180°: hemos cruzado el meridiano 180°. Restando de 360° queda ${lg(p)}.`;
        lineasL.push(`= ${Math.floor(a)}° ${coma((a % 1) * 60, 1)}′ ${p.lon < 0 ? 'E' : 'W'}  → ¡pasa de 180°!`, `360° − ${Math.floor(a)}° ${coma((a % 1) * 60, 1)}′ = ${lg(p)}`);
      } else lineasL.push(`L llegada = ${lg(p)}`);
      step(label, `${fmtPos(p)}.${cruce}`, pide('loxodromica', `¿Cuál es la ${label.toLowerCase()}?`, posCampos(p, false)),
        { traigo: [`l llegada = ${lt(p)}`, `L salida = ${lg(from)}`, `ΔL = ${sg(dL)}′`],
          plantea: 'L llegada = L salida + ΔL: hacia el E, la longitud E crece y la W disminuye. Si pasa de 180°, resta de 360° y cambia E por W.',
          lineas: [...lineasL, `${label} = ${fmtPos(p)}`] });
      if (dentro(from) && dentro(p)) items.push({ t: 'pos', at: p, label, style: 'estima', step: n });
      return p;
    },

    /** Corriente desconocida: lo que nos lleva de la situación de estima a la observada en `minutes`. */
    corrienteDesconocida(estima, observada, minutes) {
      const r = rhumbTo(estima, observada);
      if (E('corriente-invertida')) r.bearing = norm360(r.bearing + 180);
      const ic = r.distance / horasDe(minutes);
      step('Rumbo e intensidad de la corriente', `La corriente es lo que nos ha llevado de la situación de estima a la observada. Uniéndolas: Rc = ${fmtBearing(r.bearing)}, ${fmtMiles(r.distance, 2)} en ${coma(minutes / 60, 2)} h → Ihc = ${fmtKnots(ic)}.`,
        pide('corriente', '¿Cuáles son el rumbo (Rc) y la intensidad horaria (Ihc) de la corriente?', [{ kind: 'bearing', value: r.bearing, label: 'Rc', medido: true }, { kind: 'speed', value: ic, label: 'Ihc', medido: true }]));
      items.push({ t: 'seg', from: estima, to: observada, label: 'Corriente', style: 'current', arrow: true, step: n });
      return { rc: r.bearing, ic };
    },
    /**
     * Rumbo de superficie con corriente conociendo la velocidad del barco (no la hora de llegada).
     * `to` es el destino (id o punto) o directamente el Ref deseado (número). Dibuja el triángulo en `from`.
     */
    rumboConCorriente(from, to, vb, rc, ic) {
      let ref = to; let dist = null;
      if (typeof to !== 'number') {
        const r = rhumbTo(P(from), P(to));
        ref = r.bearing; dist = r.distance;
        step('Rumbo efectivo', `Uniendo la salida con ${typeof to === 'string' ? nm(to) : 'el destino'}: Ref = ${fmtBearing(ref)}, distancia = ${fmtMiles(dist)}.`,
          pide('medida', 'Mide en la carta el rumbo efectivo (Ref) y la distancia.', [{ kind: 'bearing', value: ref, label: 'Ref', medido: true }, { kind: 'distance', value: dist, label: 'Distancia', medido: true }]));
        items.push({ t: 'seg', from: P(from), to: P(to), style: 'effective', arrow: true, step: n });
        if (typeof to === 'string') mark(P(to));
      }
      let sol = courseToSteer(ref, vb, E('corriente-invertida') ? norm360(rc + 180) : rc, ic);
      if (!sol) throw new Error('El barco no puede vencer la corriente');
      if (E('sin-corriente')) sol = { rs: ref, vef: vb };
      if (E('corriente-sumada')) sol = { ...sol, vef: vb + ic };
      step('Triángulo de velocidades', `Desde la salida trazamos el vector corriente ${fmtBearing(rc)} y ${fmtKnots(ic)}. Con centro en su extremo y radio ${fmtKnots(vb)} (lo que anda el barco en una hora) cortamos la línea del Ref ${fmtBearing(ref)}: el vector barco da Rs = ${fmtBearing(sol.rs)}, y la velocidad efectiva es Vef = ${fmtKnots(sol.vef)}.`,
        pide('corriente', '¿Qué rumbo de superficie (Rs) hay que hacer y qué velocidad efectiva (Vef) se obtiene?', [{ kind: 'bearing', value: sol.rs, label: 'Rs', medido: true }, { kind: 'speed', value: sol.vef, label: 'Vef', medido: true }]));
      const pc = rhumbDestination(P(from), rc, ic);
      items.push({ t: 'vec', from: P(from), bearing: rc, length: ic, label: 'Corriente', style: 'current', step: n },
        { t: 'vec', from: pc, bearing: sol.rs, length: vb, label: `Rs ${fmtBearing(sol.rs)}`, style: 'boat', step: n });
      if (dist == null) items.push({ t: 'vec', from: P(from), bearing: ref, length: sol.vef, label: `Ref ${fmtBearing(ref)}`, style: 'effective', step: n });
      return { rs: sol.rs, vef: sol.vef, ref, dist };
    },
    /**
     * Rumbo nombrado como en las opciones («Rc = SE», «Rc = N»): el punto de la rosa de 8 (cada 45°) en que cae `r`.
     * Solo para preguntas cuyas opciones dan el rumbo por su nombre.
     */
    porNombre(r) {
      const v = norm360(Math.round(norm360(r) / 45) * 45);
      step('Rumbo por su nombre', `Las opciones dan el rumbo por su nombre (N, NE, E, SE…, uno cada 45°): ${fmtBearing(r)} cae en el ${DIR_NAME[v]} (${fmtBearing(v)}), que abarca de ${fmtBearing(norm360(v - 22.5), 1)} a ${fmtBearing(norm360(v + 22.5), 1)}.`);
      return v;
    },
    /** Ct por la Polar: su azimut verdadero es prácticamente 000°, así que Ct = 0° − Za. */
    ctPolar(za) {
      let ct = norm180(-za);
      if (E('signo-ct:valor') || E('signo-ct:aplicacion')) ct = -ct;
      step('Corrección total', `La Polar marca el norte verdadero (Zv ≈ 000°). Ct = Zv − Za = 000° − ${fmtBearing(za)} = ${fmtSignedNum(ct, 0)}.`, pide('ct', '¿Cuánto vale la corrección total (Ct)?', [{ kind: 'signed', value: ct, label: 'Ct' }]));
      return ct;
    },
    /** Rumbo directo y distancia entre dos situaciones por latitud media (ΔL por el camino corto, aunque se cruce el meridiano 180°). */
    rumboDirecto(a, b) {
      const min = (v, lab) => ({ kind: 'minutos', value: v, label: lab });
      const lt = (p) => fmtPos(p).split('  ')[0];
      const lg = (p) => fmtPos(p).split('  ')[1];
      const dl = (b.lat - a.lat) * 60;
      const dL = norm180(b.lon - a.lon) * 60 * (E('signo-dL') ? -1 : 1);
      const cruza = Math.abs((b.lon - a.lon) * 60 - dL) > 1e-6;
      step('Diferencia de latitud', `De ${lt(a)} a ${lt(b)}: Δl = ${coma(Math.abs(dl), 1)}′ ${dl < 0 ? 'S' : 'N'}.`,
        pide('loxodromica', '¿Cuánto vale la diferencia de latitud (Δl)?', [min(dl, 'Δl (N +, S −)')]),
        { traigo: [`l salida = ${lt(a)}`, `l llegada = ${lt(b)}`], plantea: 'Δl = l llegada − l salida, en minutos. Si vas hacia el N es +; hacia el S, −. Con distinto hemisferio, se suman.',
          lineas: [`${lt(b)} − ${lt(a)}`, `Δl = ${sg(dl)}′${hacia(dl, 'N', 'S')}`] });
      step('Diferencia de longitud', `De ${lg(a)} a ${lg(b)}: ΔL = ${coma(Math.abs(dL), 1)}′ ${dL < 0 ? 'W' : 'E'}${cruza ? ' (por el camino corto, cruzando el meridiano 180°)' : ''}.`,
        pide('loxodromica', '¿Cuánto vale la diferencia de longitud (ΔL)?', [min(dL, 'ΔL (E +, W −)')]),
        { traigo: [`L salida = ${lg(a)}`, `L llegada = ${lg(b)}`],
          plantea: 'ΔL = L llegada − L salida, en minutos, por el camino corto. Si una es E y otra W junto al 180°, suma lo que le falta a cada una hasta 180°.',
          lineas: cruza ? [`Cruzo el 180°: (180° − ${lg(a).replace(/ [EW]$/, '')}) + (180° − ${lg(b).replace(/ [EW]$/, '')})`, `ΔL = ${sg(dL)}′${hacia(dL, 'E', 'W')}`] : [`${lg(b)} − ${lg(a)}`, `ΔL = ${sg(dL)}′${hacia(dL, 'E', 'W')}`] });
      const lm = E('lm-salida') ? a.lat : (a.lat + b.lat) / 2;
      const cos = Math.cos(lm * Math.PI / 180);
      const A = E('sin-cos-lm') ? dL : E('cos-lm-multiplica') ? dL / cos : dL * cos;
      let r = norm360(toDeg(Math.atan2(A, dl)));
      const ang = toDeg(Math.atan(Math.abs(A) / Math.abs(dl)));
      // Seno y coseno cambiados: tg R = Δl / A (el ángulo complementario, en el mismo cuadrante).
      if (E('seno-coseno')) { const c = 90 - ang; r = dl >= 0 ? (A >= 0 ? c : 360 - c) : (A >= 0 ? 180 - c : 180 + c); }
      const d = Math.hypot(A, dl);
      step('Apartamiento', `Latitud media ${coma(Math.abs(lm), 1)}°: A = ΔL · cos lm = ${coma(Math.abs(dL), 1)}′ × ${coma(cos, 3)} = ${coma(Math.abs(A), 1)}′ ${A < 0 ? 'W' : 'E'}.`,
        pide('loxodromica', '¿Cuánto vale el apartamiento (A)?', [min(A, 'A (E +, W −)')]),
        { traigo: [`ΔL = ${sg(dL)}′`, `l salida = ${lt(a)}`, `l llegada = ${lt(b)}`], plantea: 'lm = (l salida + l llegada) / 2   ·   A = ΔL · cos lm   (aquí se multiplica: de minutos de longitud a millas)',
          lineas: [`lm = ${coma(Math.abs(lm), 1)}°`, `cos lm = ${coma(cos, 3)}`, `A = ${coma(Math.abs(dL), 1)} × ${coma(cos, 3)} = ${sg(A)}′${hacia(A, 'E', 'W')}`] });
      const cuad = `${dl < 0 ? 'S' : 'N'} ${coma(ang, 1)}° ${A < 0 ? 'W' : 'E'}`;
      const aCircular = dl >= 0 ? (A >= 0 ? `${cuad} = ${fmtBearing(r, 1)}` : `360° − ${coma(ang, 1)}° = ${fmtBearing(r, 1)}`) : (A >= 0 ? `180° − ${coma(ang, 1)}° = ${fmtBearing(r, 1)}` : `180° + ${coma(ang, 1)}° = ${fmtBearing(r, 1)}`);
      step('Rumbo y distancia', `tg R = A / Δl = ${coma(Math.abs(A), 1)} / ${coma(Math.abs(dl), 1)} → R = ${cuad} = ${fmtBearing(r, 1)}. Distancia = √(Δl² + A²) = ${fmtMiles(d)}.`,
        pide('loxodromica', '¿Cuáles son el rumbo directo y la distancia?', [{ kind: 'bearing', value: r, label: 'Rumbo' }, { kind: 'distance', value: d, label: 'Distancia' }]),
        { traigo: [`Δl = ${sg(dl)}′  (${dl < 0 ? 'S' : 'N'})`, `A = ${sg(A)}′  (${A < 0 ? 'W' : 'E'})`],
          croquis: { tipo: 'tramos', legs: [{ dl, ap: A }], catetos: true },
          plantea: 'tg R = A / Δl (sin signos) da el ángulo del cuadrante; pásalo a circular: NE tal cual, SE 180° − R, SW 180° + R, NW 360° − R.   ·   D = √(Δl² + A²)',
          lineas: [`tg R = ${coma(Math.abs(A), 1)} / ${coma(Math.abs(dl), 1)} = ${coma(Math.abs(A) / Math.abs(dl), 3)}`, `R = ${cuad}`, `Rumbo: ${aCircular}`, `D = √(${coma(Math.abs(dl), 1)}² + ${coma(Math.abs(A), 1)}²) = ${fmtMiles(d)}`] });
      return { rumbo: r, dist: d };
    },

    // ---- Mareas (Anuario: horas en UT; la corrección C = A · sen²(90° · I / D) desde la bajamar)
    /** Tramo BM–PM de la tabla: `{ desde: i }` (del extremo i al i+1) o `{ t }` (el que contiene esa hora UT, en minutos). */
    tramoMarea(tabla, { desde, t: cual }) {
      const ext = tabla.map((x) => ({ t: hrb(...x.hora.split(':').map(Number)), h: x.altura_m, hora: x.hora }));
      const [a, b] = desde != null ? [ext[desde], ext[desde + 1]] : ext.slice(0, -1).map((e, i) => [e, ext[i + 1]]).find(([u, v]) => cual >= u.t && cual <= v.t);
      const bm = a.h < b.h ? a : b; const pm = a.h < b.h ? b : a;
      const D = Math.abs(b.t - a.t); const A = pm.h - bm.h;
      const nom = (x) => (x === bm ? 'Bajamar' : 'Pleamar');
      step('Duración y amplitud', `Tramo entre la ${a === bm ? 'bajamar' : 'pleamar'} de las ${a.hora} UT (${coma(a.h)} m) y la ${b === bm ? 'bajamar' : 'pleamar'} de las ${b.hora} UT (${coma(b.h)} m): D = ${hm(D)}, A = ${coma(pm.h)} − ${coma(bm.h)} = ${coma(A)} m.`,
        pide('marea', '¿Cuánto valen la duración (D) y la amplitud (A) de la marea?', [{ kind: 'duration', value: D / 60, label: 'Duración D' }, { kind: 'meters', value: A, label: 'Amplitud A' }]),
        { traigo: [`${nom(a)}: ${a.hora} UT, ${coma(a.h)} m`, `${nom(b)}: ${b.hora} UT, ${coma(b.h)} m`],
          plantea: 'D = tiempo entre los dos extremos   ·   A = altura de la pleamar − altura de la bajamar',
          lineas: [`D = ${b.hora} − ${a.hora} = ${hm(D)}`, `A = ${coma(pm.h)} − ${coma(bm.h)} = ${coma(A)} m`],
          croquis: { tipo: 'marea', a: { hora: a.hora, h: a.h }, b: { hora: b.hora, h: b.h } } });
      return { a, b, bm, pm, D, A };
    },
    /** Hora oficial → UT. */
    horaUT(oficial, adelanto) {
      const t = E('sin-adelanto') ? oficial : E('adelanto-signo') ? oficial + adelanto * 60 : oficial - adelanto * 60;
      step('TU', `Hora oficial ${fmtClock(oficial)} − adelanto ${adelanto} h = ${fmtClock(t)} UT (el Anuario va en UT).`, pide('hora-legal', '¿Qué hora UT es (el Anuario va en UT)?', [{ kind: 'clock', value: t, label: 'Hora UT' }]),
        { traigo: [`Hora oficial = ${fmtClock(oficial)}`, `Adelanto = ${adelanto} h`], plantea: 'UT = hora oficial − adelanto   (el Anuario de Mareas va en UT)',
          lineas: [`${fmtClock(oficial)} − ${adelanto} h = ${fmtClock(t)} UT`] });
      return t;
    },
    /** Sonda en la carta + altura de marea a la hora `t` (UT) dentro del tramo. */
    sondaA(tr, t, sondaCarta) {
      const I = Math.abs(t - (E('pleamar-bajamar') ? tr.pm.t : tr.bm.t));
      const C = E('lineal') ? (tr.A * Math.min(I, tr.D)) / tr.D : correccionTabla(tr.A, I, tr.D);
      const alt = tr.bm.h + C;
      const ang = (90 * I) / tr.D; const s2 = Math.sin(ang * Math.PI / 180) ** 2;
      const cro = { tipo: 'marea', a: { hora: tr.a.hora, h: tr.a.h }, b: { hora: tr.b.hora, h: tr.b.h }, x: (t - tr.a.t) / (tr.b.t - tr.a.t), hora: fmtClock(t) };
      step('Intervalo desde la bajamar', `Desde la bajamar de las ${tr.bm.hora} UT hasta las ${fmtClock(t)} UT: I = ${hm(I)}.`,
        pide('marea', '¿Cuánto tiempo hay entre la bajamar y nuestra hora (el intervalo I)?', [{ kind: 'duration', value: I / 60, label: 'Intervalo I' }]),
        { traigo: [`Nuestra hora = ${fmtClock(t)} UT`, `Bajamar = ${tr.bm.hora} UT`], plantea: 'I = tiempo entre la bajamar y nuestra hora. Siempre desde la bajamar, esté antes o después.',
          lineas: [tr.bm.t <= t ? `${fmtClock(t)} − ${tr.bm.hora}` : `${tr.bm.hora} − ${fmtClock(t)}`, `I = ${hm(I)}`], croquis: cro });
      step('Corrección de altura', `C = A · sen²(90° · I / D) = ${coma(tr.A)} × sen²(90° × ${hm(I)} / ${hm(tr.D)}) = ${coma(C)} m.`,
        pide('marea', '¿Cuánto ha subido la marea sobre la bajamar (la corrección C)?', [{ kind: 'meters', value: C, label: 'Corrección C' }]),
        { traigo: [`A = ${coma(tr.A)} m`, `I = ${hm(I)}  (${Math.round(I)} min)`, `D = ${hm(tr.D)}  (${Math.round(tr.D)} min)`],
          plantea: 'C = A · sen²(90° · I / D), con I y D en minutos (o la tabla del Anuario). La marea no sube a ritmo constante.',
          lineas: [`90° × ${Math.round(I)} / ${Math.round(tr.D)} = ${coma(ang, 1)}°`, `sen² ${coma(ang, 1)}° = ${coma(s2, 3)}`, `C = ${coma(tr.A)} × ${coma(s2, 3)} = ${coma(C)} m`] });
      step('Altura de la marea', `Altura = altura de la bajamar + C = ${coma(tr.bm.h)} + ${coma(C)} = ${coma(alt)} m.`,
        pide('marea', '¿Cuál es la altura de la marea a esa hora?', [{ kind: 'meters', value: alt, label: 'Altura' }]),
        { traigo: [`Altura de la bajamar = ${coma(tr.bm.h)} m`, `C = ${coma(C)} m`], plantea: 'Altura de la marea = altura de la bajamar + C',
          lineas: [`${coma(tr.bm.h)} + ${coma(C)} = ${coma(alt)} m`] });
      const s = E('sonda-carta-olvidada') ? alt : E('sonda-carta-signo') ? alt - sondaCarta : sondaCarta + alt;
      step('Sonda', `Sonda = sonda de la carta + altura de la marea = ${coma(sondaCarta)} + ${coma(alt)} = ${coma(s)} m.`, pide('sonda', '¿Qué sonda hay en ese momento?', [{ kind: 'meters', value: s, label: 'Sonda' }]),
        { traigo: [`Sonda de la carta = ${coma(sondaCarta)} m`, `Altura de la marea = ${coma(alt)} m`], plantea: 'Sonda en el momento = sonda de la carta + altura de la marea',
          lineas: [`${coma(sondaCarta)} + ${coma(alt)} = ${coma(s)} m`] });
      return s;
    },
    /** Hora (oficial) a la que hay `sonda` metros en un bajo de `sondaCarta`. */
    horaParaSonda(tr, sonda, sondaCarta, adelanto) {
      const alt = E('sonda-carta-olvidada') ? sonda : E('sonda-carta-signo') ? sonda + sondaCarta : sonda - sondaCarta;
      step('Altura de la marea necesaria', `Altura = sonda deseada − sonda de la carta = ${coma(sonda)} − ${coma(sondaCarta)} = ${coma(alt)} m.`, pide('sonda', '¿Qué altura de marea hace falta?', [{ kind: 'meters', value: alt, label: 'Altura' }]),
        { traigo: [`Sonda que queremos = ${coma(sonda)} m`, `Sonda de la carta = ${coma(sondaCarta)} m`], plantea: 'Altura de marea necesaria = sonda que queremos − sonda de la carta',
          lineas: [`${coma(sonda)} − ${coma(sondaCarta)} = ${coma(alt)} m`] });
      const C = alt - tr.bm.h;
      let t = timeForHeight(tr.a, tr.b, alt);
      if (t == null) throw new Error('La marea no alcanza esa altura en el tramo');
      let I = Math.abs(t - tr.bm.t);
      if (E('lineal')) { I = (tr.D * C) / tr.A; t = tr.bm === tr.a ? tr.bm.t + I : tr.bm.t - I; }
      // Contar el intervalo desde la pleamar (hacia la bajamar) en vez de desde la bajamar.
      if (E('pleamar-bajamar')) t = tr.pm === tr.a ? tr.pm.t + I : tr.pm.t - I;
      const raiz = Math.sqrt(Math.max(0, C / tr.A)); const ang = toDeg(Math.asin(Math.min(1, raiz)));
      step('Corrección de altura', `C = altura necesaria − altura de la bajamar = ${coma(alt)} − ${coma(tr.bm.h)} = ${coma(C)} m.`,
        pide('marea', '¿Cuánto tiene que subir la marea sobre la bajamar (la corrección C)?', [{ kind: 'meters', value: C, label: 'Corrección C' }]),
        { traigo: [`Altura necesaria = ${coma(alt)} m`, `Altura de la bajamar = ${coma(tr.bm.h)} m`], plantea: 'C = altura necesaria − altura de la bajamar',
          lineas: [`${coma(alt)} − ${coma(tr.bm.h)} = ${coma(C)} m`] });
      step('Intervalo desde la bajamar', `sen²(90° · I / D) = C / A = ${coma(C)} / ${coma(tr.A)} = ${coma(C / tr.A, 3)} → I = ${hm(I)}.`,
        pide('marea', '¿Cuánto tiempo desde la bajamar hace falta para esa corrección (el intervalo I)?', [{ kind: 'duration', value: I / 60, label: 'Intervalo I' }]),
        { traigo: [`C = ${coma(C)} m`, `A = ${coma(tr.A)} m`, `D = ${hm(tr.D)}  (${Math.round(tr.D)} min)`],
          plantea: 'sen²(90° · I / D) = C / A  →  I = D × arcsen √(C / A) / 90°   (o entrando al revés en la tabla del Anuario)',
          lineas: [`C / A = ${coma(C)} / ${coma(tr.A)} = ${coma(C / tr.A, 3)}`, `√ = ${coma(raiz, 3)}  →  arcsen = ${coma(ang, 1)}°`, `I = ${Math.round(tr.D)} × ${coma(ang, 1)} / 90 = ${Math.round(I)} min = ${hm(I)}`] });
      const sube = tr.bm === tr.a;
      step('Hora UT', `La bajamar es a las ${tr.bm.hora} UT y la marea ${sube ? 'sube' : 'baja'} en este tramo: ${tr.bm.hora} ${sube ? '+' : '−'} ${hm(I)} = ${fmtClock(t)} UT.`,
        pide('marea', '¿A qué hora UT hay esa altura?', [{ kind: 'clock', value: t, label: 'Hora UT' }]),
        { traigo: [`Bajamar = ${tr.bm.hora} UT`, `I = ${hm(I)}`, `En este tramo la marea ${sube ? 'sube (bajamar → pleamar)' : 'baja (pleamar → bajamar)'}`],
          plantea: 'Si la marea sube, hora = bajamar + I. Si baja, hora = bajamar − I (la bajamar está al final del tramo).',
          lineas: [`${tr.bm.hora} ${sube ? '+' : '−'} ${hm(I)} = ${fmtClock(t)} UT`],
          croquis: { tipo: 'marea', a: { hora: tr.a.hora, h: tr.a.h }, b: { hora: tr.b.hora, h: tr.b.h }, x: (t - tr.a.t) / (tr.b.t - tr.a.t), hora: '¿hora?' } });
      const of = E('sin-adelanto') ? t : E('adelanto-signo') ? t - adelanto * 60 : t + adelanto * 60;
      step('Hora oficial', `${fmtClock(t)} UT + adelanto ${adelanto} h = ${fmtClock(of)}.`, pide('hora-legal', '¿Y en hora oficial?', [{ kind: 'clock', value: of, label: 'Hora oficial' }]),
        { traigo: [`Hora UT = ${fmtClock(t)}`, `Adelanto = ${adelanto} h`], plantea: 'Hora oficial = UT + adelanto', lineas: [`${fmtClock(t)} + ${adelanto} h = ${fmtClock(of)}`] });
      return of;
    },
  };
  return k;
}

/** Cortes de la circunferencia (centro c, radio en millas) con la recta que pasa por p con dirección dv. */
export function cortesRectaArco(p, dv, c, radio) {
  const u = unitsPerMile((p.lat + c.lat) / 2);
  const P0 = toPlane(p); const C = toPlane(c);
  const dx = Math.sin(dv * Math.PI / 180); const dy = Math.cos(dv * Math.PI / 180);
  const fx = P0.x - C.x; const fy = P0.y - C.y; const R = radio * u;
  const b = fx * dx + fy * dy; const disc = b * b - (fx * fx + fy * fy - R * R);
  if (disc < 0) return [];
  return [-b - Math.sqrt(disc), -b + Math.sqrt(disc)].map((t) => fromPlane({ x: P0.x + t * dx, y: P0.y + t * dy }));
}

/** Cortes de dos circunferencias (centros a y b, radios en millas). */
export function cortesDosArcos(a, ra, b, rb) {
  const u = unitsPerMile((a.lat + b.lat) / 2);
  const pa = toPlane(a); const pb = toPlane(b); const RA = ra * u; const RB = rb * u;
  const dx = pb.x - pa.x; const dy = pb.y - pa.y; const d = Math.hypot(dx, dy);
  const x = (RA * RA - RB * RB + d * d) / (2 * d); const h = Math.sqrt(Math.max(0, RA * RA - x * x));
  const m = { x: pa.x + (dx * x) / d, y: pa.y + (dy * x) / d };
  return [{ x: m.x - (dy * h) / d, y: m.y + (dx * h) / d }, { x: m.x + (dy * h) / d, y: m.y - (dx * h) / d }].map(fromPlane);
}

/** Corte de dos rectas infinitas (sin exigir el sentido de las demoras). */
function lineCut(a, dvA, b, dvB) {
  const hit = intersectLines(toPlane(a), dvA, toPlane(b), dvB);
  return hit ? fromPlane(hit.point) : null;
}

/** Hora "08h 30m" / "08:30" → minutos. */
export const hrb = (h, m = 0) => h * 60 + m;

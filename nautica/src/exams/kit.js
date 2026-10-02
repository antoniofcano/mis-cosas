// Kit para resolver preguntas reales de examen con los motores de la app.
// Cada operación calcula, anota un paso explicado (en lenguaje de examen) y añade el dibujo a la carta.
// Las soluciones de cada banco (src/exams/solutions/*.js) se escriben con este kit.

import { rhumbTo, rhumbDestination } from '../math/mercator.js';
import { norm360, norm180, angleDist, toDeg } from '../math/angles.js';
import { parseAngle, fmtBearing, fmtSignedNum, fmtPos, fmtMiles, fmtKnots, fmtClock } from '../math/format.js';
import { fixTwoBearings, fixBearingDistance, fixBearingAndRange, closestApproach } from '../nautical/positioning.js';
import { toPlane, fromPlane, unitsPerMile } from '../math/mercator.js';
import { intersectLines } from '../math/vector.js';

const DIR_NAME = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };

export function createKit(chart) {
  const steps = [];
  const items = [];
  const focus = [];
  let n = 0;
  const step = (title, text) => { steps.push({ title, text }); n = steps.length; };
  const P = (id) => (typeof id === 'string' ? chart.point(id) : id);
  const nm = (id) => P(id).name.replace(/^Faro de /, 'faro de ');
  const mark = (p) => { focus.push(p); return p; };

  const k = {
    steps, items, focus,
    P,
    /** Coordenadas escritas como en el examen: k.pos("35 50,0 N", "6 10,0 W"). */
    pos(lat, lon, label = 'Situación') {
      const p = { lat: parseAngle(lat), lon: -Math.abs(parseAngle(lon)) * (/E/i.test(lon) ? -1 : 1) };
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
        const exact = base + (varMin / 60) * (anyo - year);
        d = Math.round(exact);
        step('Declinación actualizada', `dm ${anyo} = ${fmtSignedNum(base, 2)} + (${anyo - year} años × ${varMin}′) = ${fmtSignedNum(exact, 2)} ≈ ${fmtSignedNum(d)}.`);
      }
      const r = d + (desvio ?? 0);
      step('Corrección total', `Ct = dm + Δ = (${fmtSignedNum(d)}) + (${fmtSignedNum(desvio ?? 0)}) = ${fmtSignedNum(r)}.`);
      return r;
    },
    rv(ra, ct) { const r = norm360(ra + ct); step('Rumbo verdadero', `Rv = Ra + Ct = ${fmtBearing(ra)} + (${fmtSignedNum(ct)}) = ${fmtBearing(r)}.`); return r; },
    ra(rv, ct) { const r = norm360(rv - ct); step('Rumbo de aguja', `Ra = Rv − Ct = ${fmtBearing(rv)} − (${fmtSignedNum(ct)}) = ${fmtBearing(r)}.`); return r; },
    dv(da, ct, id) { const r = norm360(da + ct); step(`Demora verdadera ${nm(id)}`, `Dv = Da + Ct = ${fmtBearing(da)} + (${fmtSignedNum(ct)}) = ${fmtBearing(r)}.`); return r; },
    /** Marcación con signo (+ estribor, − babor). */
    dvM(rv, m, id) { const r = norm360(rv + m); step(`Demora verdadera ${nm(id)}`, `Dv = Rv + M = ${fmtBearing(rv)} + (${fmtSignedNum(m)}) [${m >= 0 ? 'estribor' : 'babor'}] = ${fmtBearing(r)}.`); return r; },
    /** Ct = Dv − Da. */
    ctFrom(dv, da) { const r = norm180(dv - da); step('Corrección total', `Ct = Dv − Da = ${fmtBearing(dv, 1)} − ${fmtBearing(da)} = ${fmtSignedNum(r, 1)}.`); return r; },

    // ---- Líneas de posición
    /** Demora verdadera desde el barco hacia el faro `toward` cuando estamos en la oposición `other`–`toward`. */
    oposicion(other, toward) {
      const dv = rhumbTo(P(other), P(toward)).bearing;
      step('Oposición', `En la oposición de ${nm(other)} y ${nm(toward)} estamos entre ambos: la demora a ${nm(toward)} es la de la recta ${nm(other)} → ${nm(toward)}, Dv = ${fmtBearing(dv, 1)}.`);
      items.push({ t: 'seg', from: P(other), to: P(toward), style: 'lop', step: n });
      mark(P(other)); mark(P(toward));
      return dv;
    },
    /** Enfilación: devuelve la Dv de la línea en el sentido más próximo a `approx`. */
    enfilacion(a, b, approx) {
      const ab = rhumbTo(P(a), P(b)).bearing;
      const dv = approx == null || angleDist(ab, approx) <= 90 ? ab : norm360(ab + 180);
      step('Enfilación', `La enfilación de ${nm(a)} y ${nm(b)} se mide en la carta uniendo ambos faros: Dv = ${fmtBearing(dv, 1)}.`);
      items.push({ t: 'line', through: P(a), bearing: dv, length: rhumbTo(P(a), P(b)).distance * 2 + 10, style: 'lop', step: n });
      mark(P(a)); mark(P(b));
      return dv;
    },
    /** Situación por dos demoras verdaderas (desde el barco a cada punto). */
    fix2(a, dvA, b, dvB, label = 'Situación') {
      const p = fixTwoBearings(P(a), dvA, P(b), dvB) ?? lineCut(P(a), dvA, P(b), dvB);
      if (!p) throw new Error('Sin corte');
      step(label, `Desde ${nm(a)} trazamos ${fmtBearing(dvA + 180)} y desde ${nm(b)} ${fmtBearing(dvB + 180)}: se cortan en ${fmtPos(p)}.`);
      for (const [m, dv] of [[a, dvA], [b, dvB]]) items.push({ t: 'ray', from: P(m), bearing: norm360(dv + 180), length: rhumbTo(P(m), p).distance + 1.5, style: 'lop', step: n });
      items.push({ t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** Situación por demora verdadera y distancia a un punto. */
    fixDist(id, dv, dist, label = 'Situación') {
      const p = fixBearingDistance(P(id), dv, dist);
      step(label, `Desde ${nm(id)} trazamos ${fmtBearing(dv + 180)} y medimos ${fmtMiles(dist)}: ${fmtPos(p)}.`);
      items.push({ t: 'ray', from: P(id), bearing: norm360(dv + 180), length: dist, style: 'lop', step: n }, { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(id));
      return mark(p);
    },
    /** Demora a un punto y distancia a otro: `pick` = índice de la solución (0 la más cercana al punto de la demora). */
    fixBearingRange(idB, dv, idR, dist, pick = 0, label = 'Situación') {
      const sols = fixBearingAndRange(P(idB), dv, P(idR), dist);
      const p = sols[Math.min(pick, sols.length - 1)];
      if (!p) throw new Error('Sin corte');
      step(label, `Línea ${fmtBearing(dv + 180)} desde ${nm(idB)} y arco de ${fmtMiles(dist)} con centro en ${nm(idR)}: ${fmtPos(p)}.`);
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
      step(label, `Arcos de ${fmtMiles(da)} con centro en ${nm(a)} y de ${fmtMiles(db)} con centro en ${nm(b)}: se cortan en ${fmtPos(p)}.`);
      items.push({ t: 'arc', center: P(a), radius: da, around: rhumbTo(P(a), p).bearing, span: 40, style: 'lop', step: n },
        { t: 'arc', center: P(b), radius: db, around: rhumbTo(P(b), p).bearing, span: 40, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** "a d millas al <dir> verdadero del faro X" (dir en grados). */
    fromMark(id, dir, dist, label = 'Situación') {
      const p = rhumbDestination(P(id), dir, dist);
      step(label, `A ${fmtMiles(dist)} al ${DIR_NAME[dir] ?? fmtBearing(dir)} verdadero de ${nm(id)}: desde el faro trazamos ${fmtBearing(dir)} y medimos la distancia: ${fmtPos(p)}.`);
      items.push({ t: 'ray', from: P(id), bearing: dir, length: dist, style: 'construction', step: n }, { t: 'pos', at: p, label, style: 'start', step: n });
      mark(P(id));
      return mark(p);
    },
    /** "al <dirA> verdadero de A y al <dirB> verdadero de B" */
    cardinal2(a, dirA, b, dirB, label = 'Situación') {
      const p = fixTwoBearings(P(a), norm360(dirA + 180), P(b), norm360(dirB + 180)) ?? lineCut(P(a), norm360(dirA + 180), P(b), norm360(dirB + 180));
      step(label, `Desde ${nm(a)} trazamos ${fmtBearing(dirA)} (${DIR_NAME[dirA] ?? ''}) y desde ${nm(b)} ${fmtBearing(dirB)} (${DIR_NAME[dirB] ?? ''}): se cortan en ${fmtPos(p)}.`);
      for (const [m, d] of [[a, dirA], [b, dirB]]) items.push({ t: 'ray', from: P(m), bearing: d, length: rhumbTo(P(m), p).distance + 1, style: 'construction', step: n });
      items.push({ t: 'pos', at: p, label, style: 'start', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** Corte de una línea que pasa por `through` con rumbo `dv` y la demora `dvB` a otro punto. */
    lineAndBearing(through, dv, b, dvB, label = 'Situación') {
      const p = lineCut(P(through), dv, P(b), dvB);
      step(label, `Corte de la línea ${fmtBearing(dv)} que pasa por ${nm(through)} con la demora ${fmtBearing(dvB)} de ${nm(b)} (trazada desde el faro como ${fmtBearing(dvB + 180)}): ${fmtPos(p)}.`);
      items.push({ t: 'ray', from: P(b), bearing: norm360(dvB + 180), length: rhumbTo(P(b), p).distance + 1.5, style: 'lop', step: n }, { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(b));
      return mark(p);
    },

    // ---- Navegación
    /** Estima: desde `from` al Rv `rv` durante `dist` millas. */
    run(from, rv, dist, label = 'Situación de estima') {
      const p = rhumbDestination(from, rv, dist);
      step(label, `Desde ${fmtPos(from)} trazamos el Rv ${fmtBearing(rv)} y medimos ${fmtMiles(dist, 2)}: ${fmtPos(p)}.`);
      items.push({ t: 'vec', from, bearing: rv, length: dist, style: 'boat', step: n }, { t: 'pos', at: p, label, style: 'estima', step: n });
      return mark(p);
    },
    /** Distancia = V · t, con t en minutos. */
    distFor(v, minutes) {
      const d = (v * minutes) / 60;
      step('Distancia navegada', `d = V · t = ${fmtKnots(v)} × ${minutes} min / 60 = ${fmtMiles(d, 2)}.`);
      return d;
    },
    /** Rumbo verdadero y distancia entre dos puntos. */
    rhumb(a, b, label = 'Rumbo y distancia') {
      const r = rhumbTo(P(a), P(b));
      step(label, `Uniendo ${typeof a === 'string' ? nm(a) : 'el punto de salida'} con ${typeof b === 'string' ? nm(b) : 'el punto de llegada'}: Rv = ${fmtBearing(r.bearing)}, distancia = ${fmtMiles(r.distance)}.`);
      items.push({ t: 'seg', from: P(a), to: P(b), style: 'boat', arrow: true, step: n });
      mark(P(a)); mark(P(b));
      return { rv: r.bearing, dist: r.distance };
    },
    /** Demora verdadera y distancia de un punto a un faro (lo que se mide en la carta). */
    bearingTo(from, id) {
      const r = rhumbTo(P(from), P(id));
      step(`Demora y distancia a ${nm(id)}`, `Medimos en la carta desde ${fmtPos(P(from))}: Dv = ${fmtBearing(r.bearing)}, distancia = ${fmtMiles(r.distance)}.`);
      items.push({ t: 'seg', from: P(from), to: P(id), style: 'construction', step: n });
      mark(P(id));
      return { dv: r.bearing, dist: r.distance };
    },
    /** Rumbo verdadero para pasar a `d` millas de un faro dejándolo por la banda `side` ('babor'|'estribor'). */
    tangent(from, id, d, side) {
      const r = rhumbTo(P(from), P(id));
      const alpha = toDeg(Math.asin(Math.min(1, d / r.distance)));
      const rv = norm360(side === 'estribor' ? r.bearing - alpha : r.bearing + alpha);
      step('Rumbo para pasar a distancia', `Con centro en ${nm(id)} trazamos un arco de ${fmtMiles(d)}. Desde la situación (a ${fmtMiles(r.distance)} del faro, demora ${fmtBearing(r.bearing)}) trazamos la tangente dejando el faro por ${side}: ` +
        `ángulo = arcsen(${String(d).replace('.', ',')} / ${r.distance.toFixed(1).replace('.', ',')}) = ${alpha.toFixed(1).replace('.', ',')}°, Rv = ${fmtBearing(rv)}.`);
      const ca = closestApproach(P(from), rv, P(id));
      items.push({ t: 'arc', center: P(id), radius: d, around: rhumbTo(P(id), ca.point).bearing, span: 70, style: 'construction', step: n },
        { t: 'vec', from: P(from), bearing: rv, length: Math.max(ca.along * 1.3, 3), style: 'boat', step: n });
      mark(P(id));
      return rv;
    },
    /** HRB de llegada: t0 en minutos desde 00:00. */
    eta(t0, dist, v) {
      const mins = (dist / v) * 60;
      const t = t0 + mins;
      step('HRB de llegada', `t = d / V = ${fmtMiles(dist)} / ${fmtKnots(v)} = ${Math.round(mins)} min → ${fmtClock(t0)} + ${Math.round(mins)} min = ${fmtClock(t)}.`);
      return t;
    },
    distanceBetween(a, b) {
      const r = rhumbTo(P(a), P(b));
      step(`Distancia a ${typeof b === 'string' ? nm(b) : 'el punto'}`, `Medimos con el compás en la escala de latitudes: ${fmtMiles(r.distance)}.`);
      items.push({ t: 'seg', from: P(a), to: P(b), style: 'construction', step: n });
      mark(P(b));
      return r.distance;
    },
  };
  return k;
}

/** Corte de dos rectas infinitas (sin exigir el sentido de las demoras). */
function lineCut(a, dvA, b, dvB) {
  const hit = intersectLines(toPlane(a), dvA, toPlane(b), dvB);
  return hit ? fromPlane(hit.point) : null;
}

/** Hora "08h 30m" / "08:30" → minutos. */
export const hrb = (h, m = 0) => h * 60 + m;

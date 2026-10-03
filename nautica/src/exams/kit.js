// Kit para resolver preguntas reales de examen con los motores de la app.
// Cada operación calcula, anota un paso explicado (en lenguaje de examen) y añade el dibujo a la carta.
// Las soluciones de cada banco (src/exams/solutions/*.js) se escriben con este kit.

import { rhumbTo, rhumbDestination } from '../math/mercator.js';
import { norm360, norm180, angleDist, toDeg } from '../math/angles.js';
import { parseAngle, fmtBearing, fmtSignedNum, fmtPos, fmtMiles, fmtKnots, fmtClock } from '../math/format.js';
import { fixTwoBearings, fixBearingDistance, fixBearingAndRange, closestApproach } from '../nautical/positioning.js';
import { toPlane, fromPlane, unitsPerMile } from '../math/mercator.js';
import { intersectLines } from '../math/vector.js';
import { effectiveCourse, windSide, abatimientoSigned } from '../nautical/kinematics.js';
import { timeForHeight, correccionTabla } from '../nautical/tides.js';

const DIR_NAME = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
const coma = (x, dec = 2) => x.toFixed(dec).replace('.', ',');
/** Duración en minutos → "4h 30m". */
const hm = (m) => { const r = Math.round(Math.abs(m)); return `${Math.floor(r / 60)}h ${String(r % 60).padStart(2, '0')}m`; };

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
      if (!chart.inBounds(p)) return p; // fuera de la carta L105: se resuelve analíticamente
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

    // ---- Viento y corriente
    /** Abatimiento: del Rv al rumbo de superficie. `vientoDe` = de dónde sopla (grados). */
    abatimiento(rv, grados, vientoDe) {
      const banda = windSide(vientoDe, rv);
      const ab = abatimientoSigned(grados, banda);
      const rs = norm360(rv + ab);
      step('Rumbo de superficie', `El viento del ${DIR_NAME[vientoDe] ?? fmtBearing(vientoDe)} entra por ${banda}: nos abate a ${banda === 'babor' ? 'estribor' : 'babor'}, Ab = ${fmtSignedNum(ab, 0)}. Rs = Rv + Ab = ${fmtBearing(rv)} + (${fmtSignedNum(ab, 0)}) = ${fmtBearing(rs)}.`);
      return rs;
    },
    /** Al revés: el rumbo de superficie que necesitamos → el Rv que hay que dar. */
    rvConAbatimiento(rs, grados, vientoDe) {
      const banda = windSide(vientoDe, rs);
      const ab = abatimientoSigned(grados, banda);
      const rv = norm360(rs - ab);
      step('Rumbo verdadero a dar', `El viento del ${DIR_NAME[vientoDe] ?? fmtBearing(vientoDe)} entra por ${banda} y nos abatiría ${fmtSignedNum(ab, 0)}: lo compensamos metiendo la proa al viento. Rv = Rs − Ab = ${fmtBearing(rs)} − (${fmtSignedNum(ab, 0)}) = ${fmtBearing(rv)}.`);
      return rv;
    },
    /** Rumbo y velocidad efectivos (vector barco + vector corriente). Dibuja el triángulo en `from` si se da. */
    efectivo(rs, vb, rc, ic, from) {
      const { ref, vef } = effectiveCourse(rs, vb, rc, ic);
      step('Rumbo y velocidad efectivos', `Triángulo de velocidades: vector barco ${fmtBearing(rs)} y ${fmtKnots(vb)}; a continuación, vector corriente ${fmtBearing(rc)} y ${fmtKnots(ic)}. La resultante es Ref = ${fmtBearing(ref)} y Vef = ${fmtKnots(vef)}.`);
      if (from && chart.inBounds(from)) {
        const tip = rhumbDestination(from, rs, vb);
        items.push({ t: 'vec', from, bearing: rs, length: vb, label: `Rs ${fmtBearing(rs)}`, style: 'boat', step: n },
          { t: 'vec', from: tip, bearing: rc, length: ic, label: 'Corriente', style: 'current', step: n },
          { t: 'vec', from, bearing: ref, length: vef, label: `Ref ${fmtBearing(ref)}`, style: 'effective', step: n });
      }
      return { ref, vef };
    },
    /** Situación de estima con viento y corriente: d = Vef · t sobre el Ref. */
    estimaEfectiva(from, ref, vef, minutes, label = 'Situación de estima') {
      const d = (vef * minutes) / 60;
      const p = rhumbDestination(from, ref, d);
      step(label, `En ${minutes} min recorremos ${fmtKnots(vef)} × ${coma(minutes / 60)} h = ${fmtMiles(d, 2)} sobre el Ref ${fmtBearing(ref)}: ${fmtPos(p)}.`);
      items.push({ t: 'vec', from, bearing: ref, length: d, style: 'effective', step: n }, { t: 'pos', at: p, label, style: 'estima', step: n });
      return mark(p);
    },
    /**
     * Rumbo y velocidad del barco para ir de `from` a `to` en `minutes` con corriente (rc, ic):
     * vector barco = vector efectivo (lo que hay que recorrer por hora) − vector corriente.
     */
    rumboYVelocidad(from, to, minutes, rc, ic) {
      const r = rhumbTo(P(from), P(to));
      const vef = r.distance / (minutes / 60);
      step('Rumbo y velocidad efectivos', `Uniendo la salida con ${typeof to === 'string' ? nm(to) : 'el destino'}: Ref = ${fmtBearing(r.bearing)}, ${fmtMiles(r.distance)} en ${coma(minutes / 60, 1)} h → Vef = ${fmtKnots(vef)}.`);
      items.push({ t: 'seg', from: P(from), to: P(to), style: 'effective', arrow: true, step: n });
      if (typeof to === 'string') mark(P(to));
      const e = { x: vef * Math.sin(r.bearing * Math.PI / 180), y: vef * Math.cos(r.bearing * Math.PI / 180) };
      const c = { x: ic * Math.sin(rc * Math.PI / 180), y: ic * Math.cos(rc * Math.PI / 180) };
      const rs = norm360(toDeg(Math.atan2(e.x - c.x, e.y - c.y)));
      const vb = Math.hypot(e.x - c.x, e.y - c.y);
      step('Triángulo de velocidades', `Desde la salida trazamos el vector corriente ${fmtBearing(rc)} y ${fmtKnots(ic)}; uniendo su extremo con el extremo del vector efectivo (${fmtMiles(vef)} en una hora) sale el vector barco: Rs = ${fmtBearing(rs)}, Vb = ${fmtKnots(vb)}.`);
      const pc = rhumbDestination(P(from), rc, ic);
      items.push({ t: 'vec', from: P(from), bearing: rc, length: ic, label: 'Corriente', style: 'current', step: n },
        { t: 'vec', from: pc, bearing: rs, length: vb, label: `Rs ${fmtBearing(rs)}`, style: 'boat', step: n });
      return { rs, vb, ref: r.bearing, vef };
    },
    /** Corte de nuestro rumbo (desde `from`) con la demora `dv` a un faro: «cuando lo tengamos por el través»… */
    corteRumbo(from, rumbo, id, dv, label = 'Situación') {
      const p = lineCut(P(from), rumbo, P(id), dv);
      if (!p) throw new Error('Sin corte');
      step(label, `Desde ${nm(id)} trazamos ${fmtBearing(dv + 180)} y la cortamos con nuestro rumbo ${fmtBearing(rumbo)}: ${fmtPos(p)}.`);
      items.push({ t: 'seg', from: P(from), to: p, style: 'boat', arrow: true, step: n },
        { t: 'ray', from: P(id), bearing: norm360(dv + 180), length: rhumbTo(P(id), p).distance + 1.5, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(id));
      return mark(p);
    },
    /** Demoras no simultáneas: la 1ª línea se traslada lo navegado (rumbo, millas) y se corta con la 2ª. */
    traslado(a, dvA, b, dvB, rumbo, millas, label = 'Situación') {
      const pA2 = rhumbDestination(P(a), rumbo, millas);
      const p = lineCut(pA2, dvA, P(b), dvB);
      if (!p) throw new Error('Sin corte');
      step('Traslado de la 1ª línea', `Desde ${nm(a)} llevamos ${fmtBearing(rumbo)} y ${fmtMiles(millas, 1)}: por ese punto trazamos una paralela a la 1ª demora (${fmtBearing(dvA + 180)}).`);
      items.push({ t: 'ray', from: P(a), bearing: norm360(dvA + 180), length: rhumbTo(P(a), p).distance + 2, style: 'lop', step: n },
        { t: 'vec', from: P(a), bearing: rumbo, length: millas, style: 'construction', step: n },
        { t: 'line', through: p, bearing: dvA, length: 8, label: 'trasladada', style: 'lop2', step: n });
      step(label, `Desde ${nm(b)} trazamos ${fmtBearing(dvB + 180)}: corta a la línea trasladada en ${fmtPos(p)}.`);
      items.push({ t: 'ray', from: P(b), bearing: norm360(dvB + 180), length: rhumbTo(P(b), p).distance + 1.5, style: 'lop', step: n },
        { t: 'pos', at: p, label, style: 'fix', step: n });
      mark(P(a)); mark(P(b));
      return mark(p);
    },
    /** Estima por varios tramos {rumbo, millas, nombre?} sumando Δl y apartamiento (sin carta si se sale). */
    tramos(from, lista, label = 'Situación de estima') {
      let dl = 0; let ap = 0;
      const filas = lista.map((t) => {
        const r = t.rumbo * Math.PI / 180;
        const a = t.millas * Math.cos(r); const b = t.millas * Math.sin(r);
        dl += a; ap += b;
        return `${t.nombre ?? fmtBearing(t.rumbo)} ${fmtMiles(t.millas, 1)}: Δl ${coma(a, 1)}′, A ${coma(b, 1)}′`;
      });
      step('Tramos', `Descomponemos cada tramo en diferencia de latitud (+N) y apartamiento (+E): ${filas.join('; ')}. Totales: Δl = ${coma(dl, 1)}′, A = ${coma(ap, 1)}′.`);
      const lat = from.lat + dl / 60;
      const lm = (from.lat + lat) / 2;
      const dL = ap / Math.cos(lm * Math.PI / 180);
      const p = { lat, lon: from.lon + dL / 60 };
      step('Latitud de llegada', `l = ${fmtPos(from).split('  ')[0]} ${dl < 0 ? '−' : '+'} ${coma(Math.abs(dl), 1)}′ = ${fmtPos(p).split('  ')[0]}.`);
      step('Diferencia de longitud', `Latitud media ${coma(lm, 1)}°: ΔL = A / cos lm = ${coma(ap, 1)}′ / ${coma(Math.cos(lm * Math.PI / 180), 3)} = ${coma(dL, 1)}′. ${label}: ${fmtPos(p)}.`);
      if (chart.inBounds(from) && chart.inBounds(p)) items.push({ t: 'pos', at: p, label, style: 'estima', step: n });
      return p;
    },

    // ---- Mareas (Anuario: horas en UT; la corrección C = A · sen²(90° · I / D) desde la bajamar)
    /** Tramo BM–PM de la tabla: `{ desde: i }` (del extremo i al i+1) o `{ t }` (el que contiene esa hora UT, en minutos). */
    tramoMarea(tabla, { desde, t: cual }) {
      const ext = tabla.map((x) => ({ t: hrb(...x.hora.split(':').map(Number)), h: x.altura_m, hora: x.hora }));
      const [a, b] = desde != null ? [ext[desde], ext[desde + 1]] : ext.slice(0, -1).map((e, i) => [e, ext[i + 1]]).find(([u, v]) => cual >= u.t && cual <= v.t);
      const bm = a.h < b.h ? a : b; const pm = a.h < b.h ? b : a;
      const D = Math.abs(b.t - a.t); const A = pm.h - bm.h;
      step('Duración y amplitud', `Tramo entre la ${a === bm ? 'bajamar' : 'pleamar'} de las ${a.hora} UT (${coma(a.h)} m) y la ${b === bm ? 'bajamar' : 'pleamar'} de las ${b.hora} UT (${coma(b.h)} m): D = ${hm(D)}, A = ${coma(pm.h)} − ${coma(bm.h)} = ${coma(A)} m.`);
      return { a, b, bm, pm, D, A };
    },
    /** Hora oficial → UT. */
    horaUT(oficial, adelanto) {
      const t = oficial - adelanto * 60;
      step('TU', `Hora oficial ${fmtClock(oficial)} − adelanto ${adelanto} h = ${fmtClock(t)} UT (el Anuario va en UT).`);
      return t;
    },
    /** Sonda en la carta + altura de marea a la hora `t` (UT) dentro del tramo. */
    sondaA(tr, t, sondaCarta) {
      const I = Math.abs(t - tr.bm.t);
      const C = correccionTabla(tr.A, I, tr.D);
      const alt = tr.bm.h + C;
      step('Altura de la marea', `Intervalo desde la bajamar I = ${hm(I)}. C = A · sen²(90° · I / D) = ${coma(tr.A)} × sen²(90° × ${hm(I)} / ${hm(tr.D)}) = ${coma(C)} m. Altura = ${coma(tr.bm.h)} + ${coma(C)} = ${coma(alt)} m.`);
      const s = sondaCarta + alt;
      step('Sonda', `Sonda = sonda de la carta + altura de la marea = ${coma(sondaCarta)} + ${coma(alt)} = ${coma(s)} m.`);
      return s;
    },
    /** Hora (oficial) a la que hay `sonda` metros en un bajo de `sondaCarta`. */
    horaParaSonda(tr, sonda, sondaCarta, adelanto) {
      const alt = sonda - sondaCarta;
      step('Altura de la marea necesaria', `Altura = sonda deseada − sonda de la carta = ${coma(sonda)} − ${coma(sondaCarta)} = ${coma(alt)} m.`);
      const C = alt - tr.bm.h;
      const t = timeForHeight(tr.a, tr.b, alt);
      if (t == null) throw new Error('La marea no alcanza esa altura en el tramo');
      const I = Math.abs(t - tr.bm.t);
      step('Intervalo desde la bajamar', `C = ${coma(alt)} − ${coma(tr.bm.h)} = ${coma(C)} m → sen²(90° · I / D) = ${coma(C)} / ${coma(tr.A)} = ${coma(C / tr.A, 3)} → I = ${hm(I)} ${tr.bm === tr.b ? 'antes' : 'después'} de la bajamar → ${fmtClock(t)} UT.`);
      const of = t + adelanto * 60;
      step('Hora oficial', `${fmtClock(t)} UT + adelanto ${adelanto} h = ${fmtClock(of)}.`);
      return of;
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

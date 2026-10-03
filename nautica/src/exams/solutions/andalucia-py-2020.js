// Soluciones programadas PY Andalucía, convocatorias de 2020. Ver andalucia-py.js para el formato.
import { hrb } from '../kit.js';
import { rhumbTo, rhumbDestination } from '../../math/mercator.js';
import { norm360 } from '../../math/angles.js';
import { fmtBearing, fmtPos, fmtMiles, fmtKnots, fmtLon } from '../../math/format.js';
import { courseToSteer } from '../../nautical/kinematics.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const E = 90; const SE = 135; const SW = 225; const W = 270; const NW = 315; const NE = 45; const S = 180;
const coma = (x, dec = 1) => x.toFixed(dec).replace('.', ',');

// ---- Operaciones locales (candidatas al kit)

/** Corriente desconocida: une la situación de estima con la observada; rumbo = Rc, distancia / horas = Ihc. */
function corrienteDesconocida(k, estima, observada, minutos) {
  const r = rhumbTo(estima, observada);
  const ic = r.distance / (minutos / 60);
  k.note('Rumbo e intensidad de la corriente', `La corriente es lo que nos ha llevado de la situación de estima a la observada. Uniéndolas: Rc = ${fmtBearing(r.bearing)} y ${fmtMiles(r.distance)} en ${coma(minutos / 60, 1)} h → Ihc = ${fmtMiles(r.distance)} / ${coma(minutos / 60, 1)} h = ${fmtKnots(ic)}.`);
  k.items.push({ t: 'seg', from: estima, to: observada, style: 'current', arrow: true, step: k.steps.length });
  return { rc: r.bearing, ic };
}

/**
 * Rumbo a dar con corriente conocida y velocidad del barco dada: el vector barco (radio Vb) con centro
 * en el extremo del vector corriente corta la línea del rumbo efectivo hacia el destino.
 */
function rumboConCorriente(k, from, to, vb, rc, ic) {
  const r = rhumbTo(k.P(from), k.P(to));
  k.note('Rumbo efectivo', `Uniendo la salida con el destino: Ref = ${fmtBearing(r.bearing)}, distancia = ${fmtMiles(r.distance)}.`);
  k.items.push({ t: 'seg', from: k.P(from), to: k.P(to), style: 'effective', arrow: true, step: k.steps.length });
  const sol = courseToSteer(r.bearing, vb, rc, ic);
  if (!sol) throw new Error('El barco no puede vencer la corriente');
  k.note('Triángulo de velocidades', `Desde la salida trazamos el vector corriente ${fmtBearing(rc)} y ${fmtKnots(ic)}. Con centro en su extremo y radio ${fmtKnots(vb)} (lo que anda el barco en una hora) cortamos la línea del Ref: el vector barco da Rs = ${fmtBearing(sol.rs)}, y la velocidad efectiva sobre el fondo es Vef = ${fmtKnots(sol.vef)}.`);
  const pc = rhumbDestination(k.P(from), rc, ic);
  k.items.push({ t: 'vec', from: k.P(from), bearing: rc, length: ic, label: 'Corriente', style: 'current', step: k.steps.length },
    { t: 'vec', from: pc, bearing: sol.rs, length: vb, label: `Rs ${fmtBearing(sol.rs)}`, style: 'boat', step: k.steps.length });
  return { rs: sol.rs, vef: sol.vef, ref: r.bearing, dist: r.distance };
}

/** Longitud > 180° E (o < 180° W) al cruzar el antimeridiano → se pasa al otro hemisferio. */
function antimeridiano(k, p) {
  if (p.lon <= 180 && p.lon >= -180) return p;
  const lon = p.lon > 180 ? p.lon - 360 : p.lon + 360;
  const grados = Math.abs(p.lon);
  k.note('Longitud de llegada', `Hemos pasado el meridiano 180°: ${Math.floor(grados)}° ${coma((grados % 1) * 60)}′ ${p.lon > 0 ? 'E' : 'W'} equivale a 360° − ${Math.floor(grados)}° ${coma((grados % 1) * 60)}′ = ${fmtLon(lon)}. Situación de llegada: ${fmtPos({ lat: p.lat, lon })}.`);
  return { lat: p.lat, lon };
}

/** Rumbo directo (loxodrómico por estima) entre dos situaciones, aunque crucen el antimeridiano. lon: + E. */
function rumboDirecto(k, a, b) {
  const dl = (b.lat - a.lat) * 60;
  let dL = (b.lon - a.lon) * 60;
  if (dL > 180 * 60) dL -= 360 * 60;
  if (dL < -180 * 60) dL += 360 * 60;
  const lm = (a.lat + b.lat) / 2;
  const ap = dL * Math.cos(lm * Math.PI / 180);
  k.note('Diferencia de latitud y de longitud', `Δl = ${coma(Math.abs(dl))}′ ${dl < 0 ? 'S' : 'N'}. ΔL = ${coma(Math.abs(dL))}′ ${dL < 0 ? 'W' : 'E'}${Math.abs(b.lon - a.lon) > 180 ? ' (por el meridiano 180°, el camino corto)' : ''}.`);
  const angulo = Math.atan2(Math.abs(ap), Math.abs(dl)) * 180 / Math.PI;
  const r = norm360(Math.atan2(ap, dl) * 180 / Math.PI);
  const d = Math.hypot(ap, dl);
  k.note('Rumbo y distancia', `Latitud media ${coma(lm)}°: apartamiento A = ΔL · cos lm = ${coma(Math.abs(dL))}′ × ${coma(Math.cos(lm * Math.PI / 180), 3)} = ${coma(Math.abs(ap))}′. tg R = A / Δl = ${coma(Math.abs(ap))} / ${coma(Math.abs(dl))} → R = ${dl < 0 ? 'S' : 'N'} ${coma(angulo)}° ${ap < 0 ? 'W' : 'E'} = ${coma(r)}°. Distancia = ${coma(d)} millas.`);
  return { rumbo: r, dist: d };
}

export default {
  // ---- 1ª Convocatoria 2020
  'and-py-2020-c1-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv 332º y la velocidad no intervienen.
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 338) }];
    },
  },
  'and-py-2020-c1-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 17,0 N', '6 20,0 W', 'Salida');
      // Pasamos por fuera (al SW) de Trafalgar: el faro queda por babor.
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'babor');
      const rv = k.rvConAbatimiento(rs, 20, NE);
      const ct = k.ct({ dm: -3, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2020-c1-n13': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.cardinal2('punta-paloma', S, 'isla-tarifa', SW, 'Salida');
      // Pasamos al N de Punta Cires: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, NW);
      const ct = k.ct({ carta: [5.5, 2015, -6], anyo: 2020, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2020-c1-n14': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 20,0 W', 'Situación 20:00');
      const t = hrb(22, 30) - hrb(20);
      const est = k.run(s, 80, k.distFor(7.2, t), 'Situación de estima 22:30');
      const obs = k.fix2('cabo-espartel', 191, 'punta-malabata', 100, 'Situación observada 22:30');
      const { rc, ic } = corrienteDesconocida(k, est, obs, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'and-py-2020-c1-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 04,0 N', '6 00,0 W', 'Situación 16:00');
      const ct = k.ct({ dm: -3, desvio: 8 });
      const rv = k.rv(240, ct);
      const rs = k.abatimiento(rv, 10, SE);
      const { ref, vef } = k.efectivo(rs, 6, NW, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(18) - hrb(16), 'Situación 18:00'));
    },
  },
  'and-py-2020-c1-n16': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 15,0 W', 'Salida');
      const { rs } = rumboConCorriente(k, s, 'algeciras-espigon', 6, E, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -2, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2020-c1-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // «Faro de Pta. Camarinal» = faro de Punta Gracia.
      const s = k.cardinal2('punta-gracia', S, 'punta-paloma', W, 'Salida 15:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', hrb(18) - hrb(15), W, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'and-py-2020-c1-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (05:02 UT) → primera bajamar (11:01 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 0 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.45, 1.85, 1) }];
    },
  },
  'and-py-2020-c1-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(22, 50), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.70) }];
    },
  },
  'and-py-2020-c1-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('15 00,0 N', '179 15,0 E', 'Salida');
      k.note('Distancia navegada', 'A 10 nudos: 120° durante 3 h (30 millas), 090° durante 4 h (40 millas) y 150° durante 6 h (60 millas).');
      const p = k.tramos(s, [{ rumbo: 120, millas: 30 }, { rumbo: 90, millas: 40 }, { rumbo: 150, millas: 60 }], 'Situación de llegada');
      return latlon(antimeridiano(k, p));
    },
  },

  // ---- 3ª Convocatoria 2020
  'and-py-2020-c3-n11': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // El Rv 220º y la velocidad no intervienen.
      const dv = k.oposicion('isla-tarifa', 'punta-malabata');
      return [{ kind: 'signed', value: k.ctFrom(dv, 218) }];
    },
  },
  'and-py-2020-c3-n12': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const dvOp = k.oposicion('isla-tarifa', 'punta-alcazar');
      k.note('Demora verdadera de Punta Cires', 'Al W verdadero de Punta Cires, el faro nos demora al E: Dv = 090°.');
      const s = k.lineAndBearing('isla-tarifa', dvOp, 'punta-cires', E, 'Salida');
      // Pasamos al N de Punta Almina: el faro queda por estribor.
      const rs = k.tangent(s, 'punta-almina', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, SE);
      const ct = k.ct({ dm: -5, desvio: 10 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-py-2020-c3-n13': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(5, hrb(11) - hrb(9));
      return latlon(k.traslado('cabo-roche', 70, 'cabo-trafalgar', 45, 150, d, 'Situación 11:00'));
    },
  },
  'and-py-2020-c3-n14': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-almina', E, 3, 'Salida 16:00');
      const { rs } = k.rumboYVelocidad(s, 'algeciras-espigon', hrb(20) - hrb(16), SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -3, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2020-c3-n15': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 20,0 W', 'Situación 13:00');
      const ct = k.ct({ dm: -3, desvio: -6 });
      const rv = k.rv(89, ct);
      const rs = k.abatimiento(rv, 10, NW);
      const { ref, vef } = k.efectivo(rs, 6, SE, 3, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(14, 30) - hrb(13), 'Situación 14:30'));
    },
  },
  'and-py-2020-c3-n16': {
    sinCarta: true,
    ejercicio: 'abatimiento',
    solve(k) {
      const ct = k.ct({ carta: [2.5, 2015, -6], anyo: 2020, desvio: 11 });
      const rv = k.rv(197, ct);
      return [{ kind: 'bearing', value: k.abatimiento(rv, 15, SE) }];
    },
  },
  'and-py-2020-c3-n17': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // «Faro de Pta. Camarinal» = faro de Punta Gracia; al S verdadero → la línea N–S que pasa por él.
      const s = k.lineAndBearing('punta-gracia', S, 'isla-tarifa', 70, 'Salida');
      const { rs } = rumboConCorriente(k, s, 'barbate-faro', 7, SW, 3);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 4, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'and-py-2020-c3-n18': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      // Primera pleamar (12:01 UT) → segunda bajamar (18:19 UT).
      const tr = k.tramoMarea(q.tabla_mareas, { desde: 1 });
      return [{ kind: 'clock', value: k.horaParaSonda(tr, 3.30, 2.15, 1) }];
    },
  },
  'and-py-2020-c3-n19': {
    sinCarta: true,
    ejercicio: 'marea-sonda',
    solve(k, q) {
      const t = k.horaUT(hrb(8, 25), 1);
      const tr = k.tramoMarea(q.tabla_mareas, { t });
      return [{ kind: 'meters', value: k.sondaA(tr, t, 1.90) }];
    },
  },
  'and-py-2020-c3-n20': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('38 20,0 N', '179 05,0 E', 'Salida');
      const b = k.pos('35 42,0 N', '178 38,0 W', 'Llegada');
      return [{ kind: 'bearing', value: rumboDirecto(k, a, b).rumbo }];
    },
  },
};

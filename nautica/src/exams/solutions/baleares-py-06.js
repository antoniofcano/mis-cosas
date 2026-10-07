// Soluciones programadas de carta del PY de Baleares (lote 06). Ver baleares-py.js para el formato.
// Resumen: 30 preguntas; 21 resueltas y comprobadas, 9 en DISCREPANCIAS:
//   - falta la tabla de mareas: 4
//   - formato de las opciones: 4
//   - elemento que no está en la carta de la app: 1
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];

export default {
  'bal-py-2018-12-a-37': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 03,0 W', 'Situación 10:30');
      const ct1 = k.ct({ carta: L105, anyo: 2018, desvio: -3.5 });
      const rv1 = k.rv(50, ct1);
      const rs1 = k.abatimiento(rv1, 6, NW);
      const p = k.run(s, rs1, k.distFor(11, 60), 'Situación 11:30');
      const { rs, vb } = k.rumboYVelocidad(p, 'punta-cires', hrb(13) - hrb(11, 30), 120, 3);
      const rv = k.rvConAbatimiento(rs, 2, SE);
      const ct2 = k.ct({ carta: L105, anyo: 2018, desvio: -0.5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct2) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2018-12-b-37': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ ct: -11 });
      const rv = k.rv(170, ct);
      const rs = k.abatimiento(rv, 5, E);
      const p1 = k.run(k.P('algeciras-espigon'), rs, k.distFor(6, 60), 'Situación 10:00');
      const { ref, vef } = k.efectivo(rs, 6, 90, 4, p1);
      const p2 = k.estimaEfectiva(p1, ref, vef, 60, 'Situación estimada 11:00');
      k.note('Último tramo', 'Seguimos en la zona de corriente y con el mismo viento: hay que compensar ambos para llegar a la bocana.');
      const { rs: rs2 } = k.rumboConCorriente(p2, 'ceuta-bocana', 6, 90, 4);
      const rv2 = k.rvConAbatimiento(rs2, 5, E);
      return [...latlon(p2), { kind: 'bearing', value: k.ra(rv2, ct) }];
    },
  },
  'bal-py-2018-12-b-38': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 58,8 N', '5 25,6 W', 'Situación');
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(138, ct);
      const { ref, vef } = k.efectivo(rv, 5, 80, 2, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2018-12-a-40': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ ct: -5 });
      const dv = k.dv(278, ct, 'punta-europa');
      const s = k.fixDist('punta-europa', dv, 4.5);
      const rv = k.rv(182, ct);
      const { ref, vef } = k.efectivo(rv, 7, 260, 3, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2019-04-a-31': {
    sinCarta: true,
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Desvío para Ra = 140°', 'Interpolamos en la tablilla entre Ra = 120° (+0,4°) y Ra = 150° (+0,1°): Δ = 0,4 − 0,3 × 20/30 = +0,2°.');
      const ct = k.ct({ carta: [-(1 + 45 / 60), 1990, 9], anyo: 2019, desvio: 0.2 });
      return [{ kind: 'signed', value: ct }];
    },
  },
  'bal-py-2019-04-a-32': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.cardinal2('punta-europa', S, 'punta-carnero', E, 'Situación 04:54');
      const ct = k.ctPolar(355);
      const rv = k.rv(218, ct);
      const rs = k.abatimiento(rv, 11, S);
      return latlon(k.run(s, rs, k.distFor(9, hrb(6, 12) - hrb(4, 54)), 'Situación 06:12'));
    },
  },
  'bal-py-2019-04-b-32': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 05,0 N', '5 20,0 W', 'Salida');
      const dest = k.fromMark('punta-almina', E, 3, 'A 3 millas al E/v de Punta Almina');
      const { rv: rs } = k.rhumb(s, dest);
      const rv = k.rvConAbatimiento(rs, 11, SW);
      const ct = k.ct({ dm: -2, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2019-04-a-33': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const dvOp = k.oposicion('isla-tarifa', 'punta-alcazar');
      const ct = k.ct({ dm: 3 + 20 / 60, desvio: 2 + 40 / 60 });
      const rv = k.rv(250, ct);
      const dv = k.dv(184, ct, 'punta-malabata');
      const d = k.distFor(7, hrb(8, 24) - hrb(7, 30));
      return latlon(k.traslado('isla-tarifa', dvOp, 'punta-malabata', dv, rv, d, 'Situación 08:24'));
    },
  },
  'bal-py-2019-04-a-34': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const dvEnf = k.enfilacion('cabo-roche', 'cabo-trafalgar', 140);
      k.note('Demora del través', 'Por el través de estribor: Dv = Rv + 90° = 300° + 90° = 030°.');
      const s = k.lineAndBearing('cabo-roche', dvEnf, 'punta-gracia', 30, 'Situación 09:18');
      const rs = k.abatimiento(300, 15, N);
      const { ref, vef } = k.efectivo(rs, 8.5, 200, 3, s);
      const p = k.corteRumbo(s, ref, 'cabo-roche', 0, 'Al S/v de Cabo Roche');
      const d = k.distanceBetween(s, p);
      return [{ kind: 'bearing', value: ref }, { kind: 'clock', value: k.eta(hrb(9, 18), d, vef) }];
    },
  },
  'bal-py-2019-04-a-35': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fix2Ranges('cabo-espartel', 6, 'punta-malabata', 6, { lat: 36, lon: -5.85 }, 'Situación 10:30');
      const { rv } = k.rhumb(s, 'cabo-trafalgar');
      const t = hrb(12, 6) - hrb(10, 30);
      const e = k.run(s, rv, k.distFor(7, t), 'Situación de estima 12:06');
      const o = k.fromMark('punta-gracia', W, 5, 'Situación verdadera 12:06');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2019-04-a-37': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const o = k.fixDist('punta-almina', 250, 2.5, 'Situación observada');
      const e = k.pos('35 53,0 N', '5 10,0 W', 'Situación de estima');
      const { rv } = k.rhumb(e, o, 'Rumbo de la corriente');
      return [{ kind: 'bearing', value: rv }];
    },
  },
  'bal-py-2019-04-b-37': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 54,0 N', '5 40,0 W', 'Salida');
      // Navegamos hacia el E por fuera de la costa africana: Cires queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 7, E);
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2019-04-a-38': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: -2 });
      const rv = k.rv(105, ct);
      const rs = k.abatimiento(rv, 5, NW);
      const { ref, vef } = k.efectivo(rs, 14, 300, 1.5);
      const d1 = k.dvM(rv, -40, 'cabo-trafalgar');
      k.note('Través', 'Trafalgar estaba por babor: al través por babor, Dv = Rv − 90°.');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      const d = (vef * 20) / 60;
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, ref, d, 'Situación 00:20'));
    },
  },
  'bal-py-2019-04-a-39': {
    ejercicio: 'abatimiento',
    solve(k) {
      const dvOp = k.oposicion('punta-carnero', 'punta-europa');
      const s = k.fixDist('punta-europa', dvOp, 1, 'Situación');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 4, E);
      const ct = k.ct({ ct: -1 });
      const vb = dist / (40 / 60);
      k.note('Velocidad', `V = d / t = ${dist.toFixed(2).replace('.', ',')} millas / (40/60) h = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2019-04-b-39': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ctPolar(5);
      const rv = k.rv(95, ct);
      k.note('Punta Cires por la proa', 'Dv de Cires = Rv.');
      const d2 = k.dvM(rv, 115, 'punta-alcazar');
      return latlon(k.fix2('punta-cires', rv, 'punta-alcazar', d2, 'Situación 12:15'));
    },
  },
  'bal-py-2019-06-b-32': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('48 12,6 N', '1 20,5 E', 'Salida 15:00');
      const b = k.pos('47 03,2 N', '2 53,8 W', 'Punto P');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      const ct = k.ct({ dm: -9, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rumbo, ct) }, { kind: 'clock', value: k.eta(hrb(15), dist, 15) }];
    },
  },
  'bal-py-2019-06-a-33': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 02,0 N', '5 22,0 W', 'Situación 14:00');
      const dest = k.fromMark('isla-tarifa', S, 3, 'Destino');
      const { rv } = k.rhumb(s, dest);
      const t = hrb(17) - hrb(14);
      const e = k.run(s, rv, k.distFor(6, t), 'Situación de estima 17:00');
      const ct = k.ct({ dm: -2, desvio: -3 });
      const o = k.fix2('isla-tarifa', k.dv(347, ct, 'isla-tarifa'), 'punta-cires', k.dv(127, ct, 'punta-cires'), 'Situación verdadera 17:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2019-06-b-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 3 });
      const s = k.fix2('punta-carnero', k.dv(280, ct, 'punta-carnero'), 'punta-europa', k.dv(14, ct, 'punta-europa'), 'Situación 21:12');
      const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, W);
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2019-06-b-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 34,0 W', 'Punto H 23:12');
      const dest = k.fromMark('cabo-trafalgar', 200, 5.3, 'Destino');
      const { rs, vb } = k.rumboYVelocidad(s, dest, hrb(24 + 3, 42) - hrb(23, 12), 71, 1.94);
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: -3 });
      return [{ kind: 'speed', value: vb }, { kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'bal-py-2019-06-a-37': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('tanger-espigon', N, 'punta-cires', W, 'Situación 06:00');
      const dest = k.fromMark('tanger-espigon', N, 2, 'Destino');
      const { rs, vb } = k.rumboYVelocidad(s, dest, 30, E, 3);
      const rv = k.rvConAbatimiento(rs, 4, W);
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2019-06-b-37': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fromMark('punta-gracia', W, 3, 'Situación 12:00');
      const ct1 = k.ct({ dm: -2, desvio: -3 });
      const rs1 = k.abatimiento(k.rv(245, ct1), 10, N);
      const p1 = k.run(s, rs1, k.distFor(10, 60), 'Situación 13:00');
      k.note('Rumbo al faro de Espartel', 'Damos el rumbo que, compensando la corriente y el abatimiento, nos lleva derechos al faro.');
      const { ref, vef } = k.rumboConCorriente(p1, 'cabo-espartel', 10, 90, 3);
      const p2 = k.estimaEfectiva(p1, ref, vef, 30, 'Situación 13:30');
      const ct3 = k.ct({ dm: -2, desvio: 10 });
      return latlon(k.run(p2, k.rv(60, ct3), k.distFor(10, 90), 'Situación estimada 15:00'));
    },
  },
};

/* DISCREPANCIAS
 * 'bal-py-2018-12-b-39' (falta la tabla de mareas): hora con sonda ≥ 10 m en Santander el 23-05-2018; el banco no
 *   trae el Anuario de mareas (tabla_mareas vacía). Oficial: b (07:01).
 * 'bal-py-2018-12-b-40' (falta la tabla de mareas): sonda en Barbate el 17-12-2018 a las 10:00 GMT corregida por
 *   presión (993 mb); sin el Anuario de ese día no se puede calcular. Oficial: a (6,98 m).
 * 'bal-py-2019-04-a-40' (falta la tabla de mareas): sonda en Cádiz el 27-06-2019 a las 10:00 UTC. Oficial: a (5,26 m).
 * 'bal-py-2019-06-a-39' (falta la tabla de mareas): hora con 13 m de sonda en Barbate el 07-08-2019, con presión de
 *   989 hPa. Oficial: c (13:39 UT).
 * 'bal-py-2019-04-b-31' (formato de las opciones): sale 35° 51,1′ N, 6° 09,9′ W, que es la c (oficial), pero las
 *   opciones escriben «35º 51'4 N» (décimas tras el apóstrofo) y el lector de opciones no las entiende.
 * 'bal-py-2019-04-b-36' (formato de las opciones): sale Ra = 357,5° y llegada 09:49, que es la c (oficial), pero las
 *   opciones escriben la hora sin separador («Hrb=0950») y el lector de opciones no la entiende.
 * 'bal-py-2019-04-b-40' (formato de las opciones): sale 35° 57,0′ N, 5° 21,5′ W, que es la d (oficial), pero las
 *   opciones escriben «35º-57' N» (guion tras el grado) y el lector de opciones no las entiende.
 * 'bal-py-2019-06-a-32' (formato de las opciones): sale 35° 55,4′ N, 5° 35,8′ W, que es la a (oficial), pero las
 *   opciones escriben «35º55’2 N» (décimas tras el apóstrofo) y el lector de opciones no las entiende.
 * 'bal-py-2019-06-a-36' (elemento que no está en la carta de la app): la Ct sale de la enfilación «Magair / cabo
 *   Espartel» y Magair no está en la carta; además las opciones llevan «35º-49,0´N». Oficial: b.
 *
 * Código de las que se resuelven bien pero no pasan el lector de opciones:
 *
 *   'bal-py-2019-04-b-31': {
 *     ejercicio: 'estima-directa',
 *     solve(k) {
 *       const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
 *       const ct = k.ct({ carta: L105, anyo: 2019, desvio: -5 });
 *       const rv = k.rv(233, ct);
 *       const rs = k.abatimiento(rv, 5, W);
 *       return latlon(k.run(s, rs, k.distFor(6, hrb(17, 30) - hrb(15, 30)), 'Situación de estima 17:30'));
 *     },
 *   },
 *   'bal-py-2019-04-b-36': {
 *     ejercicio: 'corriente-rumbo-a-dar',
 *     solve(k) {
 *       const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación 08:00');
 *       const { rs, vef, dist } = k.rumboConCorriente(s, 'barbate-espigon', 12, 100, 3);
 *       const rv = k.rvConAbatimiento(rs, 4, W);
 *       const ct = k.ct({ dm: -2, desvio: -4 });
 *       return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(8), dist, vef) }];
 *     },
 *   },
 *   'bal-py-2019-04-b-40': {
 *     ejercicio: 'situacion-dos-demoras',
 *     solve(k) {
 *       const dvOp = k.oposicion('punta-paloma', 'punta-alcazar');
 *       const ct = k.ctFrom(dvOp, 146);
 *       const rv = k.rv(95.5, ct);
 *       const d1 = k.dv(1, ct, 'punta-europa');
 *       const d2 = k.dvM(rv, 28, 'punta-almina');
 *       return latlon(k.fix2('punta-europa', d1, 'punta-almina', d2, 'Situación 23:31'));
 *     },
 *   },
 *   'bal-py-2019-06-a-32': {
 *     ejercicio: 'situacion-dos-demoras',
 *     solve(k) {
 *       const ct = k.ct({ dm: -2, desvio: -10 });
 *       const d1 = k.dv(171, ct, 'punta-alcazar');
 *       const d2 = k.dv(110, ct, 'punta-cires');
 *       return latlon(k.fix2('punta-alcazar', d1, 'punta-cires', d2, 'Situación 11:21'));
 *     },
 *   },
 */

// Soluciones programadas de carta del PY de Baleares (lote 06). Ver baleares-py.js para el formato.
// Resumen: 109 preguntas; 79 resueltas y comprobadas, 30 en DISCREPANCIAS:
//   - falta la tabla de mareas: 12
//   - formato de las opciones: 9
//   - elemento que no está en la carta de la app: 5
//   - sin margen frente a otra opción: 2
//   - no llega a la oficial: 1
//   - no llega a la oficial con margen: 1
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
  'bal-py-2019-06-b-39': {
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
  'bal-py-2019-12-a-31': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fix2Ranges('cabo-trafalgar', 5, 'punta-gracia', 9.2, { lat: 36.05, lon: -6.0 }, 'Situación');
      const { rs, vef } = k.rumboConCorriente(s, 'cabo-espartel', 8, 130, 3);
      const ct = k.ct({ ct: -4 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2019-12-c-31': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct1 = k.ct({ carta: L105, anyo: 2019, desvio: 3.2 });
      const s = k.fix2('punta-carnero', k.dv(280, ct1, 'punta-carnero'), 'punta-europa', k.dv(14, ct1, 'punta-europa'), 'Situación 21:12');
      const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, W);
      const ct2 = k.ct({ carta: L105, anyo: 2019, desvio: -0.8 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }];
    },
  },
  'bal-py-2019-12-c-32': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dvOp = k.oposicion('punta-carnero', 'punta-alcazar');
      const dvEnf = k.enfilacion('punta-paloma', 'isla-tarifa', 300);
      return latlon(k.lineAndBearing('punta-alcazar', dvOp, 'isla-tarifa', dvEnf, 'Situación 11:00'));
    },
  },
  'bal-py-2019-12-c-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', N, 3, 'Salida');
      const rs = k.tangent(s, 'punta-cires', 2, 'estribor');
      const rv = k.rvConAbatimiento(rs, 10, N);
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2019-12-a-34': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.P('tanger-espigon');
      const t = hrb(17, 30) - hrb(16);
      const e = k.run(s, 350, k.distFor(7, t), 'Situación de estima 17:30');
      const o = k.fix2Ranges('punta-gracia', 6.1, 'punta-paloma', 4.2, { lat: 36.0, lon: -5.75 }, 'Situación verdadera 17:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2019-12-a-35': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fixDist('cabo-trafalgar', 340, 3, 'Situación');
      const rs = k.tangent(s, 'punta-gracia', 6.1, 'babor');
      const rv = k.rvConAbatimiento(rs, 4, NE);
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2019-12-a-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 52,3 N', '5 55,4 W', 'Salida');
      const { rs, vb, ref, vef } = k.rumboYVelocidad(s, 'tanger-espigon', 90, 193, 2);
      return [{ kind: 'bearing', value: rs }, { kind: 'speed', value: vb }, { kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2019-12-c-36': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct1 = k.ct({ carta: L105, anyo: 2019, desvio: -2.2 });
      const rv = k.rv(69, ct1);
      const d1 = k.dvM(rv, 60, 'cabo-espartel');
      const d2 = k.dvM(rv, 120, 'cabo-espartel');
      const s = k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rv, k.distFor(12, 25), 'Situación 01:25');
      const rv2 = k.tangent(s, 'punta-cires', 3, 'estribor');
      const ct2 = k.ct({ carta: L105, anyo: 2019, desvio: -3.2 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv2, ct2) }];
    },
  },
  'bal-py-2019-12-a-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ ct: 4 });
      const rv = k.rv(284.5, ct);
      const d1 = k.dv(350, ct, 'punta-gracia');
      const d2 = k.dv(60, ct, 'punta-gracia');
      return latlon(k.traslado('punta-gracia', d1, 'punta-gracia', d2, rv, k.distFor(7, hrb(12, 36) - hrb(11, 12)), 'Situación 12:36'));
    },
  },
  'bal-py-2019-12-c-37': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.fromMark('punta-carbonera', SE, 6.7, 'Salida');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 8, E);
      const ct = k.ct({ ct: -5 });
      const vb = dist / (70 / 60);
      k.note('Velocidad', `V = d / t = ${dist.toFixed(2).replace('.', ',')} millas / (70/60) h = ${vb.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2019-12-a-38': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 06,0 N', '6 14,2 W', 'Salida');
      const { rv: rs } = k.rhumb(s, 'cabo-trafalgar');
      const rv = k.rvConAbatimiento(rs, 10, NE);
      const ct = k.ct({ ct: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2019-12-c-38': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 07,2 N', '6 00,5 W', 'Situación 04:00');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 1.2 });
      // Navegamos hacia el SE por fuera de la costa: Punta Paloma queda por babor.
      const rv = k.tangent(s, 'punta-paloma', 5, 'babor');
      const d1 = k.dv(92, ct, 'punta-paloma');
      const d2 = k.dv(19, ct, 'punta-paloma');
      k.note('Traslado', 'Como la corriente es desconocida, la 1ª demora se traslada con el rumbo y la velocidad del barco.');
      const o = k.traslado('punta-paloma', d1, 'punta-paloma', d2, rv, k.distFor(12, 30), 'Situación 05:00');
      const e = k.run(s, rv, k.distFor(12, 60), 'Situación de estima 05:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, 60);
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2019-12-a-39': {
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 10,0 W', 'Salida');
      const ct = k.ct({ ct: 2 });
      const rv = k.rv(70, ct);
      return latlon(k.tramos(s, [{ rumbo: rv, millas: 140 }], 'Situación final de estima'));
    },
  },
  'bal-py-2019-12-a-40': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('43 22,6 N', '3 03,2 W', 'Salida');
      const b = k.pos('44 53,9 N', '2 42,1 W', 'Llegada');
      return [{ kind: 'distance', value: k.rumboDirecto(a, b).dist }];
    },
  },
  'bal-py-2020-07-a-32': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 51,8 N', '8 05,0 W', 'Situación 10:10');
      const dest = k.fromMark('cabo-espartel', N, 3, 'Destino');
      const { rv, dist } = k.rhumb(s, dest);
      const t = hrb(19, 40) - hrb(10, 10);
      const v = dist / (t / 60);
      k.note('Velocidad', `V = d / t = ${dist.toFixed(1).replace('.', ',')} millas / ${(t / 60).toFixed(1).replace('.', ',')} h = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: rv }, { kind: 'speed', value: v }];
    },
  },
  'bal-py-2020-07-b-32': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const b = k.P('ceuta-bocana'); const r = k.P('ceuta-roja');
      const s = k.pos(`${(b.lat + r.lat) / 2}`, `${-(b.lon + r.lon) / 2} W`, 'Entre puntas de Ceuta 19:00');
      const dest = k.fromMark('punta-europa', E, 3, 'Destino');
      const { rv } = k.rhumb(s, dest);
      const t = hrb(20, 10) - hrb(19);
      const e = k.run(s, rv, k.distFor(9, t), 'Situación de estima 20:10');
      const o = k.fix2('punta-europa', 0, 'punta-carnero', 290, 'Situación verdadera 20:10');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2020-07-a-34': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      k.note('Rumbo verdadero por la Polar', 'La Polar (norte verdadero) queda abierta 108° por estribor: Rv + 108° = 360° → Rv = 252°.');
      const rv = 252;
      const s = k.fix2('punta-carnero', k.dvM(rv, 53, 'punta-carnero'), 'punta-europa', k.dvM(rv, 108, 'punta-europa'), 'Situación 01:00');
      const t = hrb(2, 30) - hrb(1);
      const e = k.run(s, rv, k.distFor(8, t), 'Situación de estima 02:30');
      const ct = k.ct({ ct: -5 });
      const o = k.fix2('isla-tarifa', k.dv(268, ct, 'isla-tarifa'), 'punta-cires', k.dv(174, ct, 'punta-cires'), 'Situación verdadera 02:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2020-07-a-35': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('isla-tarifa', S, 3, 'Situación 04:00');
      const ref = k.tangent(s, 'punta-gracia', 4, 'estribor');
      const { rs } = k.rumboConCorriente(s, ref, 8, 43, 3);
      const rv = k.rvConAbatimiento(rs, 7, SW);
      const ct = k.ct({ dm: -2, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2020-07-b-35': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 03,0 W', 'Situación 10:30');
      const ct1 = k.ct({ carta: L105, anyo: 2020, desvio: -3.5 });
      const rs1 = k.abatimiento(k.rv(50, ct1), 6, NW);
      const p = k.run(s, rs1, k.distFor(11, 60), 'Situación 11:30');
      const { rs, vb } = k.rumboYVelocidad(p, 'punta-cires', hrb(13) - hrb(11, 30), 120, 3);
      const rv = k.rvConAbatimiento(rs, 2, SE);
      const ct2 = k.ct({ carta: L105, anyo: 2020, desvio: -0.5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct2) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2020-07-a-36': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ ct: -5 });
      const rs = k.abatimiento(k.rv(297, ct), 6, SW);
      const d1 = k.dv(341, ct, 'cabo-trafalgar');
      const d2 = k.dv(58, ct, 'cabo-trafalgar');
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rs, k.distFor(8, 60), 'Situación 08:00'));
    },
  },
  'bal-py-2020-07-b-36': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ ct: -0.5 });
      const rv = k.rv(130, ct);
      const rs = k.abatimiento(rv, 5, N);
      const d1 = k.dvM(rv, -90, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -128, 'cabo-trafalgar');
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rs, k.distFor(8, 30), 'Situación 06:00'));
    },
  },
  'bal-py-2020-07-a-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: -5 });
      const rv = k.rv(48, ct);
      const rs = k.abatimiento(rv, 9, W);
      const d1 = k.dv(92, ct, 'cabo-espartel');
      const d2 = k.dvM(rv, 90, 'cabo-espartel');
      return latlon(k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rs, k.distFor(8, 60), 'Situación 02:00'));
    },
  },
  'bal-py-2020-07-b-38': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 58,8 N', '5 25,6 W', 'Situación');
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(138, ct);
      const { ref, vef } = k.efectivo(rv, 5, 80, 2, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2020-07-a-39': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const ct1 = k.ct({ ct: -10 });
      const s = k.fix2('punta-europa', k.dv(46, ct1, 'punta-europa'), 'punta-cires', k.dv(154, ct1, 'punta-cires'), 'Situación 05:00');
      k.note('Destino', 'A 1 milla de Punta Europa sobre la demora que llevamos hacia el faro.');
      const dest = k.fromMark('punta-europa', k.bearingTo('punta-europa', s).dv, 1, 'A 1 milla de Punta Europa');
      const { rs, vb } = k.rumboYVelocidad(s, dest, 60, 70, 4);
      const ct2 = k.ct({ dm: -1, desvio: -7 });
      return [{ kind: 'bearing', value: k.ra(rs, ct2) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2020-07-b-40': {
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
  'bal-py-2020-12-a-31': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 45,2 N', '6 00,5 W', 'Situación 11:06');
      const ct = k.ct({ ct: -3 });
      const rs = k.abatimiento(k.rv(300, ct), 4, W);
      const { ref, vef } = k.efectivo(rs, 6, 45, 2.5, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(13, 6) - hrb(11, 6), 'Situación estimada 13:06'));
    },
  },
  'bal-py-2020-12-b-31': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('33 18,0 N', '50 30,0 W', 'Salida 01:00');
      const b = k.pos('31 20,0 N', '52 15,0 W', 'Punto P');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      const ct = k.ctPolar(3);
      const rv = k.rvConAbatimiento(rumbo, 5, S);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(1), dist, 16) }];
    },
  },
  'bal-py-2020-12-b-32': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 34,0 W', 'Punto H 23:12');
      const dest = k.fromMark('cabo-trafalgar', 200, 5.3, 'Destino');
      const { rs, vb } = k.rumboYVelocidad(s, dest, hrb(24 + 3, 42) - hrb(23, 12), 71, 1.94);
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2020-12-b-33': {
    ejercicio: 'abatimiento',
    solve(k) {
      const dvEnf = k.enfilacion('punta-carnero', 'punta-europa', 90);
      k.note('Situación', 'A 5 millas de Punta Europa sobre la enfilación, por fuera (al E) de Punta Europa: hacia el W la enfilación entra en tierra pasada Punta Carnero.');
      const s = k.fromMark('punta-europa', dvEnf, 5, 'Situación');
      const { rv: rs } = k.rhumb(s, 'punta-almina');
      const rv = k.rvConAbatimiento(rs, 9, E);
      const ct = k.ct({ ct: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2020-12-b-35': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 7, 'Situación 17:42');
      const ct = k.ct({ ct: -5 });
      const rv = k.rv(30, ct);
      const t = hrb(19, 2) - hrb(17, 42);
      const e = k.run(s, rv, k.distFor(12, t), 'Situación de estima 19:02');
      const dvOp = k.oposicion('punta-gracia', 'cabo-espartel');
      const o = k.fixBearingRange('cabo-espartel', dvOp, 'punta-paloma', 9.4, 0, 'Situación verdadera 19:02');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2020-12-b-36': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: -2 });
      const rv = k.rv(167, ct);
      const d1 = k.dv(204, ct, 'punta-almina');
      const d2 = k.dv(290, ct, 'punta-almina');
      return latlon(k.traslado('punta-almina', d1, 'punta-almina', d2, rv, k.distFor(11, 25), 'Situación 03:40'));
    },
  },
  'bal-py-2020-12-b-38': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ ct: 4 });
      const rv = k.rv(293, ct);
      const d1 = k.dv(67, ct, 'isla-tarifa');
      k.note('Elección del corte', 'Sondas de más de 200 m: nos quedamos con el corte más al S, mar adentro.');
      const s = k.trasladoArco('isla-tarifa', d1, 'punta-gracia', 6.5, rv, k.distFor(7, 45), (c) => [...c].sort((a, b) => a.lat - b.lat)[0], 'Situación 08:21');
      const { ref, vef } = k.efectivo(260, 7, 120, 2.5, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2021-03-b-31': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('33 18,0 N', '50 30,0 W', 'Salida 01:00');
      const b = k.pos('31 20,0 N', '52 15,0 W', 'Punto P');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      const ct = k.ctPolar(3);
      const rv = k.rvConAbatimiento(rumbo, 5, S);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(1), dist, 16) }];
    },
  },
  'bal-py-2021-03-ac-32': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 50,0 W', 'Salida');
      k.note('Dispositivo de separación de tráfico', 'Hacia el E se navega por la vía S del dispositivo: Isla de Tarifa queda por babor.');
      const rs = k.tangent(s, 'isla-tarifa', 4, 'babor');
      const rv = k.rvConAbatimiento(rs, 7, E);
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2021-03-b-32': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const dvOp = k.oposicion('punta-carnero', 'punta-europa');
      const s = k.fixDist('punta-europa', dvOp, 3, 'Situación');
      const dest = k.fromMark('punta-almina', N, 3, 'A 3 millas al N/v de Punta Almina');
      const { rv } = k.rhumb(s, dest);
      const p = k.corteRumbo(s, rv, 'punta-cires', 236, 'Cires al 236°');
      return [{ kind: 'bearing', value: rv }, ...latlon(p)];
    },
  },
  'bal-py-2021-03-ac-33': {
    sinCarta: true,
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Desvío para Ra = 140°', 'Interpolamos en la tablilla entre Ra = 120° (+0,4°) y Ra = 150° (+0,1°): Δ = 0,4 − 0,3 × 20/30 = +0,2°.');
      const ct = k.ct({ carta: [-(1 + 45 / 60), 1990, 9], anyo: 2021, desvio: 0.2 });
      return [{ kind: 'signed', value: ct }];
    },
  },
  'bal-py-2021-03-b-36': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 43,0 W', 'Situación 12:00');
      // Hacia el Atlántico pasamos por fuera (al N) de Espartel: el faro queda por babor.
      const ref = k.tangent(s, 'cabo-espartel', 2, 'babor');
      k.note('Primer tramo', 'Con la corriente se gobierna para hacer buena la derrota con Ve = 6 nudos; sin corriente seguimos sobre la misma derrota.');
      const p = k.run(s, ref, k.distFor(6, 40), 'Situación 12:40');
      const dvTr = (ref - 90 + 360) % 360;
      k.note('Través de babor', `Dv de la luz del espigón de Tánger = Rv − 90° = ${dvTr.toFixed(0)}°.`);
      const q = k.corteRumbo(p, ref, 'tanger-espigon', dvTr, 'Tánger por el través de babor');
      const rs = k.tangent(q, 'cabo-espartel', 2, 'babor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 10, NW) }];
    },
  },
  'bal-py-2021-03-ac-37': {
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
  'bal-py-2021-03-b-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -1.5 });
      const rv = k.rv(120, ct);
      const d1 = k.dvM(rv, -30, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -60, 'cabo-trafalgar');
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rv, k.distFor(10, 30), 'Situación 07:30'));
    },
  },
  'bal-py-2021-03-ac-38': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      k.note('Rumbo verdadero por la Polar', 'La Polar (norte verdadero) queda 70° por babor: Rv − 70° = 000° → Rv = 070°.');
      const rv = 70;
      const s = k.fixDist('cabo-espartel', k.dvM(rv, 60, 'cabo-espartel'), 1.8, 'Situación 07:00');
      return latlon(k.run(s, rv, k.distFor(14, 15), 'Situación estimada 07:15'));
    },
  },
  'bal-py-2021-03-b-39': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 10:30');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 5, E);
      const ct = k.ct({ dm: -3, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2021-03-ac-40': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida');
      // Salimos hacia el Atlántico por fuera de Espartel: el faro queda por babor.
      const rs = k.tangent(s, 'cabo-espartel', 3, 'babor');
      const rv = k.rvConAbatimiento(rs, 12, SE);
      const ct = k.ct({ dm: -2, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2021-06-b-31': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.P('tanger-espigon');
      const t = hrb(17, 30) - hrb(16);
      const e = k.run(s, 350, k.distFor(7, t), 'Situación de estima 17:30');
      const o = k.fix2Ranges('punta-gracia', 6.1, 'punta-paloma', 4.2, { lat: 36.0, lon: -5.75 }, 'Situación verdadera 17:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2021-06-ac-32': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-malabata', NW, 4, 'Situación 08:03');
      const dest = k.fromMark('punta-gracia', SW, 9.4, 'Situación 09:33');
      const { rs, vb } = k.rumboYVelocidad(s, dest, hrb(9, 33) - hrb(8, 3), 73, 3);
      return [{ kind: 'bearing', value: rs }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2021-06-b-32': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 45,2 N', '6 00,5 W', 'Situación 11:06');
      const ct = k.ct({ ct: -3 });
      const rs = k.abatimiento(k.rv(300, ct), 4, W);
      const { ref, vef } = k.efectivo(rs, 6, 45, 2.5, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(13, 6) - hrb(11, 6), 'Situación estimada 13:06'));
    },
  },
  'bal-py-2021-06-ac-33': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fixDist('cabo-espartel', 123, 4.5, 'Situación 14:52');
      const t = hrb(16, 7) - hrb(14, 52);
      const e = k.run(s, 314, k.distFor(11.4, t), 'Situación de estima 16:07');
      const o = k.fixDist('cabo-trafalgar', 12, 11.4, 'Situación verdadera 16:07');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2021-06-b-33': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const a = k.pos('36 05,0 N', '6 15,0 W', 'Situación inicial');
      const b = k.pos('35 53,4 N', '5 52,0 W', 'Situación final');
      const { rv, dist } = k.rhumb(a, b);
      return [{ kind: 'bearing', value: rv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-py-2021-06-ac-34': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 01,3 N', '5 50,0 W', 'Situación 22:10');
      const { rv: rs, dist } = k.rhumb(s, 'cabo-espartel');
      const rv = k.rvConAbatimiento(rs, 10, W);
      const ct = k.ct({ dm: -3, desvio: -7 });
      k.note('Distancia hasta 2,5 millas del faro', `${dist.toFixed(2).replace('.', ',')} − 2,5 = ${(dist - 2.5).toFixed(2).replace('.', ',')} millas.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(22, 10), dist - 2.5, 6) }];
    },
  },
  'bal-py-2021-06-b-34': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fix2Ranges('cabo-trafalgar', 5, 'punta-gracia', 9.2, { lat: 36.05, lon: -6.0 }, 'Situación');
      const { rs, vef } = k.rumboConCorriente(s, 'cabo-espartel', 8, 130, 3);
      const ct = k.ct({ ct: -4 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2021-06-b-35': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('52 14,2 S', '3 18,2 W', 'Situación 00:00');
      const ct = k.ct({ dm: 14, desvio: 7 });
      const rs = k.abatimiento(k.rv(67, ct), 2, NW);
      return latlon(k.tramos(s, [{ rumbo: rs, millas: (12 * (14 * 60 + 20)) / 60 }], 'Situación de llegada 14:20'));
    },
  },
  'bal-py-2021-06-ac-36': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      return latlon(k.trasladoDosArcos('punta-malabata', 3, 'punta-malabata', 6, 30, k.distFor(12, 20), (c) => [...c].sort((a, b) => b.lat - a.lat)[0], 'Situación 18:20'));
    },
  },
  'bal-py-2021-06-b-36': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -5, desvio: -4 });
      const rv = k.rv(142, ct);
      const rs = k.abatimiento(rv, 8, NE);
      const d1 = k.dvM(rv, -45, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      const s = k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rs, k.distFor(12, 30), 'Situación 07:30');
      const rv2 = k.tangent(s, 'isla-tarifa', 2, 'babor');
      const ct2 = k.ct({ dm: -5, desvio: -5 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv2, ct2) }];
    },
  },
  'bal-py-2021-06-ac-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ctPolar(2);
      const rv = k.rv(102, ct);
      const d1 = k.dv(47, ct, 'cabo-trafalgar');
      const d2 = k.dv(317, ct, 'cabo-trafalgar');
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rv, k.distFor(30, 20), 'Situación 01:54'));
    },
  },
  'bal-py-2021-06-b-37': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const a = k.pos('35 57,0 N', '5 59,2 W', 'Situación 12:55');
      const b = k.pos('36 56,7 N', '8 56,9 W', 'A 3 millas al S/v del punto');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      const t = (dist / 7.2) * 60;
      k.note('Intervalo', `t = d / V = ${dist.toFixed(1).replace('.', ',')} / 7,2 = ${Math.floor(t / 60)}h ${(t % 60).toFixed(1).replace('.', ',')}m.`);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'clock', value: t }];
    },
  },
  'bal-py-2021-06-ac-38': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const ct1 = k.ct({ dm: -1, desvio: -2 });
      const s = k.fix2('punta-gracia', 0, 'isla-tarifa', k.dv(77, ct1, 'isla-tarifa'), 'Situación observada 11:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', 90, 82.5, 2);
      const rv = k.rvConAbatimiento(rs, 2, E);
      const ct2 = k.ct({ dm: -1, desvio: 2 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2021-06-b-38': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: 6.5 });
      const rv = k.rv(97, ct);
      const d1 = k.dv(0, ct, 'punta-paloma');
      k.note('Isla de Tarifa por la proa', 'Dv de Tarifa = Rv.');
      return latlon(k.traslado('punta-paloma', d1, 'isla-tarifa', rv, rv, k.distFor(7, 25), 'Situación 14:30'));
    },
  },
  'bal-py-2021-06-ac-39': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
      const ct = k.ct({ dm: -1, desvio: -5 });
      return latlon(k.run(s, k.rv(233, ct), k.distFor(6, 120), 'Situación de estima 17:30'));
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
 * 'bal-py-2019-06-a-40' (falta la tabla de mareas): sonda en Llanes el 02-07-2019 a las 13:15 UTC con 1009 mb.
 *   Oficial: c (7,53 m).
 * 'bal-py-2019-12-c-34' (formato de las opciones): por dos distancias sale 36° 11,9′ N, 6° 14,6′ W, que es la d
 *   (oficial), pero las opciones escriben «36º12’0 N» (décimas tras el apóstrofo) y el lector no las entiende.
 * 'bal-py-2019-12-a-32' (no llega a la oficial): Rv 297°, Rs 301° (viento del W por babor), corriente 045°/2,5 nudos
 *   durante 2 h: sale 35° 54,9′ N, 6° 08,8′ W (la d). La oficial (a, 35° 51,1′ N, 6° 10,6′ W) supone un
 *   desplazamiento de unas 10 millas al 306°, que no sale ni sin corriente ni con el abatimiento al otro lado. El mismo enunciado
 *   vuelve en 'bal-py-2020-12-a-31' con la oficial d (la que sale aquí): probable errata de la plantilla de 2019.
 * 'bal-py-2019-12-c-39' (formato de las opciones): sale 35° 51,1′ N, 6° 09,9′ W, que es la c (oficial), pero las
 *   opciones escriben «35º 51'2 N» (décimas tras el apóstrofo) y el lector de opciones no las entiende.
 * 'bal-py-2020-07-b-31' (formato de las opciones): enfilación Punta Leona–Cires y S/v de Tarifa: sale 35° 53,4′ N,
 *   5° 36,5′ W, que es la a (oficial), pero las opciones escriben «35º 53'2 N» y el lector no las entiende.
 * 'bal-py-2020-07-a-33' (falta la tabla de mareas): hora de salida en Santander el 09-05-2020. Oficial: b (13:43).
 * 'bal-py-2020-07-b-37' (formato de las opciones): sale 35° 54,5′ N, 5° 53,9′ W y Ra = 063°, que es la c (oficial),
 *   pero las opciones b, c y d escriben «35º-54,6' N» (guion tras el grado) y el lector solo entiende la a.
 * 'bal-py-2020-07-a-38' (elemento que no está en la carta de la app): la situación es el corte de la enfilación
 *   Malabata–El Xarf con la isobática de 100 m, que la carta de la app no tiene. Oficial: b (Ra = 066°).
 * 'bal-py-2020-07-a-40' (falta la tabla de mareas): varada en Baiona el 08-04-2020. Oficial: a (12:32 TU).
 * 'bal-py-2020-12-a-36' (falta la tabla de mareas): sonda en Cádiz el 27-10-2020 a las 10:00 UTC con 1028 mb.
 *   Oficial: c (5 m).
 * 'bal-py-2020-12-b-37' (elemento que no está en la carta de la app): el destino es la marca cardinal N próxima a
 *   Punta Malabata, que la carta de la app no tiene. Oficial: b (Ra = 181°, Vm = 7,7 nudos).
 * 'bal-py-2020-12-b-40' (falta la tabla de mareas): varada en la barra de Ayamonte el 01-07-2020. Oficial: a.
 * 'bal-py-2021-03-ac-31' (falta la tabla de mareas): sonda en Barbate el 17-12-2021 a las 10:00 GMT con 993 mb.
 *   Oficial: a (6,64 m).
 * 'bal-py-2021-03-ac-34' (elemento que no está en la carta de la app): la situación inicial usa la enfilación
 *   Punta Paloma – cima del monte Órganos, que la carta de la app no tiene. Oficial: a.
 * 'bal-py-2021-03-b-35' (falta la tabla de mareas): sonda en Llanes el 12-03-2021 a las 11:45 UT. Oficial: c (5,44 m).
 * 'bal-py-2021-03-b-33' (sin margen frente a otra opción): Rv 071°, 19,25 millas de estima y situación verdadera por
 *   Europa (Dv 306°) y Almina (Dv 205°): sale Rc = 069,8° e Ihc = 2,56 nudos. Elige la oficial (b, 072°/2,5) pero la
 *   a (070°/1,5) queda casi empatada por el rumbo, y el comprobador del PY exige que la segunda quede al doble.
 * 'bal-py-2021-03-b-40' (sin margen frente a otra opción): Ct = +1°, sale Ra = 199,3° y Vb = 10,7 nudos. Elige la
 *   oficial (a, 200°/10,2) pero sin el margen del PY frente a la b (195°/10,8). En la misma pregunta de 2019
 *   ('bal-py-2019-06-a-37', Ct +0,8°) la oficial daba 10,4 nudos.
 * 'bal-py-2021-06-ac-31' (no llega a la oficial con margen): en la carta de la app la enfilación Alcázar–Cires
 *   va al 046,7° / 226,7°; con Da de Cires = Ra − 60° = 243° sale Ct = −16,4° (16,4° NW). La más próxima es la oficial
 *   (d, 15° NW), pero a 1,4° y fuera del margen del PY: la plantilla mide la enfilación al 228°.
 * 'bal-py-2021-06-b-40' (falta la tabla de mareas): hora con 8,50 m de sonda en Camariñas el 05-01-2021 con 998 mb.
 *   Oficial: a (11:34 TU).
 * 'bal-py-2021-12-a-31' (elemento que no está en la carta de la app): la situación usa la demora a la cima de San
 *   Bartolomé (436 m, junto a Punta Paloma), que la carta de la app no tiene. Oficial: c (079,5° y 1,95 nudos).
 * 'bal-py-2021-12-b-31' (formato de las opciones): sale 36° 00,6′ N, 5° 23,0′ W, que es la c (oficial), pero las
 *   opciones escriben «36º- 00,5' N» (guion tras el grado) y el lector de opciones no las entiende.
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
 *   'bal-py-2019-12-c-34': {
 *     ejercicio: 'situacion-demora-distancia',
 *     solve(k) {
 *       return latlon(k.fix2Ranges('cabo-roche', 7.8, 'cabo-trafalgar', 10.2, { lat: 36.2, lon: -6.3 }, 'Situación 13:45'));
 *     },
 *   },
 *   'bal-py-2019-12-c-39': {
 *     ejercicio: 'estima-directa',
 *     solve(k) {
 *       const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
 *       const ct = k.ct({ carta: L105, anyo: 2019, desvio: -4.8 });
 *       const rs = k.abatimiento(k.rv(233, ct), 5, W);
 *       return latlon(k.run(s, rs, k.distFor(6, hrb(17, 30) - hrb(15, 30)), 'Situación de estima 17:30'));
 *     },
 *   },
 *   'bal-py-2020-07-b-31': {
 *     ejercicio: 'situacion-dos-demoras',
 *     solve(k) {
 *       const dvEnf = k.enfilacion('punta-leona', 'punta-cires', 270);
 *       return latlon(k.lineAndBearing('punta-cires', dvEnf, 'isla-tarifa', N, 'Situación 10:45'));
 *     },
 *   },
 *   'bal-py-2020-07-b-37': {
 *     ejercicio: 'demoras-no-simultaneas',
 *     solve(k) {
 *       const ct1 = k.ctPolar(3);
 *       const rv = k.rv(83, ct1);
 *       const rs = k.abatimiento(rv, 5, NE);
 *       const d1 = k.dvM(rv, 40, 'cabo-espartel');
 *       const d2 = k.dvM(rv, -37, 'punta-paloma');
 *       const s = k.traslado('cabo-espartel', d1, 'punta-paloma', d2, rs, k.distFor(20, 35), 'Situación 21:35');
 *       const { rv: rs2 } = k.rhumb(s, 'isla-tarifa');
 *       const rv2 = k.rvConAbatimiento(rs2, 3, NE);
 *       const ct2 = k.ct({ carta: L105, anyo: 2020, desvio: 3.5 });
 *       return [...latlon(s), { kind: 'bearing', value: k.ra(rv2, ct2) }];
 *     },
 *   },
 *   'bal-py-2021-12-b-31': {
 *     ejercicio: 'demoras-no-simultaneas',
 *     solve(k) {
 *       const ct = k.ct({ dm: -3.5, desvio: -2.5 });
 *       const rv = k.rv(240, ct);
 *       const rs = k.abatimiento(rv, 5, N);
 *       const d1 = k.dvM(rv, 60, 'punta-europa');
 *       const d2 = k.dvM(rv, 100, 'punta-carnero');
 *       return latlon(k.traslado('punta-europa', d1, 'punta-carnero', d2, rs, k.distFor(7, 60), 'Situación 08:30'));
 *     },
 *   },
 */

// Preguntas del lote que no están en export default (ver DISCREPANCIAS).
export const documentadas = {
  'bal-py-2018-12-b-39': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: hora con sonda ≥ 10 m en Santander el 23-05-2018; el banco no trae el Anuario de mareas (tabla_mareas vacía). Oficial: b (07:01).',
  },
  'bal-py-2018-12-b-40': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: sonda en Barbate el 17-12-2018 a las 10:00 GMT corregida por presión (993 mb); sin el Anuario de ese día no se puede calcular. Oficial: a (6,98 m).',
  },
  'bal-py-2019-04-a-40': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: sonda en Cádiz el 27-06-2019 a las 10:00 UTC. Oficial: a (5,26 m).',
  },
  'bal-py-2019-06-a-39': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: hora con 13 m de sonda en Barbate el 07-08-2019, con presión de 989 hPa. Oficial: c (13:39 UT).',
  },
  'bal-py-2019-04-b-31': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale 35° 51,1′ N, 6° 09,9′ W, que es la c (oficial), pero las opciones escriben «35º 51\'4 N» (décimas tras el apóstrofo) y el lector de opciones no las entiende.',
  },
  'bal-py-2019-04-b-36': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale Ra = 357,5° y llegada 09:49, que es la c (oficial), pero las opciones escriben la hora sin separador («Hrb=0950») y el lector de opciones no la entiende.',
  },
  'bal-py-2019-04-b-40': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale 35° 57,0′ N, 5° 21,5′ W, que es la d (oficial), pero las opciones escriben «35º-57\' N» (guion tras el grado) y el lector de opciones no las entiende.',
  },
  'bal-py-2019-06-a-32': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale 35° 55,4′ N, 5° 35,8′ W, que es la a (oficial), pero las opciones escriben «35º55’2 N» (décimas tras el apóstrofo) y el lector de opciones no las entiende.',
  },
  'bal-py-2019-06-a-36': {
    tipo: 'discrepancia',
    texto: 'Elemento que no está en la carta de la app: la Ct sale de la enfilación «Magair / cabo Espartel» y Magair no está en la carta; además las opciones llevan «35º-49,0´N». Oficial: b.',
  },
  'bal-py-2019-06-a-40': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: sonda en Llanes el 02-07-2019 a las 13:15 UTC con 1009 mb. Oficial: c (7,53 m).',
  },
  'bal-py-2019-12-c-34': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: por dos distancias sale 36° 11,9′ N, 6° 14,6′ W, que es la d (oficial), pero las opciones escriben «36º12’0 N» (décimas tras el apóstrofo) y el lector no las entiende.',
  },
  'bal-py-2019-12-a-32': {
    tipo: 'discrepancia',
    texto: 'No llega a la oficial: Rv 297°, Rs 301° (viento del W por babor), corriente 045°/2,5 nudos durante 2 h: sale 35° 54,9′ N, 6° 08,8′ W (la d). La oficial (a, 35° 51,1′ N, 6° 10,6′ W) supone un desplazamiento de unas 10 millas al 306°, que no sale ni sin corriente ni con el abatimiento al otro lado. El mismo enunciado vuelve en \'bal-py-2020-12-a-31\' con la oficial d (la que sale aquí): probable errata de la plantilla de 2019.',
  },
  'bal-py-2019-12-c-39': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale 35° 51,1′ N, 6° 09,9′ W, que es la c (oficial), pero las opciones escriben «35º 51\'2 N» (décimas tras el apóstrofo) y el lector de opciones no las entiende.',
  },
  'bal-py-2020-07-b-31': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: enfilación Punta Leona–Cires y S/v de Tarifa: sale 35° 53,4′ N, 5° 36,5′ W, que es la a (oficial), pero las opciones escriben «35º 53\'2 N» y el lector no las entiende.',
  },
  'bal-py-2020-07-a-33': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: hora de salida en Santander el 09-05-2020. Oficial: b (13:43).',
  },
  'bal-py-2020-07-b-37': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale 35° 54,5′ N, 5° 53,9′ W y Ra = 063°, que es la c (oficial), pero las opciones b, c y d escriben «35º-54,6\' N» (guion tras el grado) y el lector solo entiende la a.',
  },
  'bal-py-2020-07-a-38': {
    tipo: 'discrepancia',
    texto: 'Elemento que no está en la carta de la app: la situación es el corte de la enfilación Malabata–El Xarf con la isobática de 100 m, que la carta de la app no tiene. Oficial: b (Ra = 066°).',
  },
  'bal-py-2020-07-a-40': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: varada en Baiona el 08-04-2020. Oficial: a (12:32 TU).',
  },
  'bal-py-2020-12-a-36': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: sonda en Cádiz el 27-10-2020 a las 10:00 UTC con 1028 mb. Oficial: c (5 m).',
  },
  'bal-py-2020-12-b-37': {
    tipo: 'discrepancia',
    texto: 'Elemento que no está en la carta de la app: el destino es la marca cardinal N próxima a Punta Malabata, que la carta de la app no tiene. Oficial: b (Ra = 181°, Vm = 7,7 nudos).',
  },
  'bal-py-2020-12-b-40': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: varada en la barra de Ayamonte el 01-07-2020. Oficial: a.',
  },
  'bal-py-2021-03-ac-31': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: sonda en Barbate el 17-12-2021 a las 10:00 GMT con 993 mb. Oficial: a (6,64 m).',
  },
  'bal-py-2021-03-ac-34': {
    tipo: 'discrepancia',
    texto: 'Elemento que no está en la carta de la app: la situación inicial usa la enfilación Punta Paloma – cima del monte Órganos, que la carta de la app no tiene. Oficial: a.',
  },
  'bal-py-2021-03-b-35': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: sonda en Llanes el 12-03-2021 a las 11:45 UT. Oficial: c (5,44 m).',
  },
  'bal-py-2021-03-b-33': {
    tipo: 'discrepancia',
    texto: 'Sin margen frente a otra opción: Rv 071°, 19,25 millas de estima y situación verdadera por Europa (Dv 306°) y Almina (Dv 205°): sale Rc = 069,8° e Ihc = 2,56 nudos. Elige la oficial (b, 072°/2,5) pero la a (070°/1,5) queda casi empatada por el rumbo, y el comprobador del PY exige que la segunda quede al doble.',
  },
  'bal-py-2021-03-b-40': {
    tipo: 'discrepancia',
    texto: 'Sin margen frente a otra opción: Ct = +1°, sale Ra = 199,3° y Vb = 10,7 nudos. Elige la oficial (a, 200°/10,2) pero sin el margen del PY frente a la b (195°/10,8). En la misma pregunta de 2019 (\'bal-py-2019-06-a-37\', Ct +0,8°) la oficial daba 10,4 nudos.',
  },
  'bal-py-2021-06-ac-31': {
    tipo: 'discrepancia',
    texto: 'No llega a la oficial con margen: en la carta de la app la enfilación Alcázar–Cires va al 046,7° / 226,7°; con Da de Cires = Ra − 60° = 243° sale Ct = −16,4° (16,4° NW). La más próxima es la oficial (d, 15° NW), pero a 1,4° y fuera del margen del PY: la plantilla mide la enfilación al 228°.',
  },
  'bal-py-2021-06-b-40': {
    tipo: 'anuario',
    texto: 'Falta la tabla de mareas: hora con 8,50 m de sonda en Camariñas el 05-01-2021 con 998 mb. Oficial: a (11:34 TU).',
  },
  'bal-py-2021-12-a-31': {
    tipo: 'discrepancia',
    texto: 'Elemento que no está en la carta de la app: la situación usa la demora a la cima de San Bartolomé (436 m, junto a Punta Paloma), que la carta de la app no tiene. Oficial: c (079,5° y 1,95 nudos).',
  },
  'bal-py-2021-12-b-31': {
    tipo: 'discrepancia',
    texto: 'Formato de las opciones: sale 36° 00,6′ N, 5° 23,0′ W, que es la c (oficial), pero las opciones escriben «36º- 00,5\' N» (guion tras el grado) y el lector de opciones no las entiende.',
  },
};

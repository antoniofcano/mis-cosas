// Soluciones programadas de carta del PY de Baleares (lote 07). Ver baleares-py.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;

export default {
  'bal-py-2021-12-a-32': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 34,0 W', 'Salida 23:12');
      const d = k.fromMark('cabo-trafalgar', 200, 5.3, 'Destino');
      // De 23:12 a 03:42 del día siguiente: 4 h 30 min.
      const { rs, vb } = k.rumboYVelocidad(s, d, 270, 71, 1.94);
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2021-12-a-34': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:00');
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(56, ct);
      const t = hrb(11) - hrb(9);
      const e = k.run(s, rv, k.distFor(5, t), 'Situación de estima 11:00');
      const o = k.fix2('punta-malabata', k.dv(107, ct, 'punta-malabata'), 'cabo-espartel', k.dv(176, ct, 'cabo-espartel'), 'Situación verdadera 11:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2021-12-a-35': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:30');
      const ct = k.ct({ ct: -2 });
      const rv = k.rv(52, ct);
      // Rc = S70E = 110°.
      const { ref, vef } = k.efectivo(rv, 8, 110, 3, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2021-12-b-35': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // El enunciado dice l = 39° 50′ N, fuera de la zona: es 35° 50′ N (errata).
      k.note('Situación de salida', 'El enunciado da l = 39° 50′ N, que cae muy lejos de la carta: es una errata por 35° 50′ N.');
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:30');
      const ct1 = k.ct({ dm: -3.5, desvio: 1.5 });
      const rv = k.rv(52, ct1);
      const { ref, vef } = k.efectivo(rv, 8, 110, 3, s);
      const p = k.estimaEfectiva(s, ref, vef, 60, 'Situación 10:30');
      const r = k.rumboConCorriente(p, 'barbate-espigon', 8, 110, 3);
      const ct2 = k.ct({ dm: -3.5, desvio: 0.5 });
      return [{ kind: 'bearing', value: r.ref }, { kind: 'speed', value: r.vef },
        { kind: 'bearing', value: k.ra(r.rs, ct2) }, { kind: 'clock', value: k.eta(hrb(10, 30), r.dist, r.vef) }];
    },
  },
  'bal-py-2021-12-b-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 40,0 W', 'Situación 13:00');
      const ct1 = k.ct({ dm: -3.5, desvio: -2.5 });
      const rv = k.rv(66, ct1);
      const { ref, vef } = k.efectivo(rv, 9, S, 2.5, s);
      const p = k.estimaEfectiva(s, ref, vef, 90, 'Situación 14:30');
      const r = k.rumboConCorriente(p, 'ceuta-bocana', 9, S, 2.5);
      const ct2 = k.ct({ dm: -3.5, desvio: -0.5 });
      return [{ kind: 'bearing', value: r.ref }, { kind: 'speed', value: r.vef },
        { kind: 'bearing', value: k.ra(r.rs, ct2) }, { kind: 'clock', value: k.eta(hrb(14, 30), r.dist, r.vef) }];
    },
  },
  'bal-py-2021-12-a-37': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fix2Ranges('cabo-espartel', 6, 'punta-malabata', 6, k.P('punta-gracia'), 'Situación 10:30');
      const { rv } = k.rhumb(s, 'cabo-trafalgar');
      const t = hrb(12, 6) - hrb(10, 30);
      const e = k.run(s, rv, k.distFor(7, t), 'Situación de estima 12:06');
      const o = k.fromMark('punta-gracia', W, 5, 'Situación verdadera 12:06');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2021-12-a-38': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 43,0 W', 'Salida');
      const rs = k.tangent(s, 'cabo-espartel', 2, 'babor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 10, E) }];
    },
  },
  'bal-py-2021-12-a-39': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Salida');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 9, NE);
      const ct = k.ct({ dm: -2, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2022-03-b-31': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const t = hrb(17, 30) - hrb(16);
      const e = k.run(k.P('tanger-espigon'), 350, k.distFor(7, t), 'Situación de estima 17:30');
      const o = k.fix2Ranges('punta-gracia', 6.1, 'punta-paloma', 4.2, e, 'Situación verdadera 17:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2022-03-a-32': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      k.note('Declinación', 'El enunciado fija el año: 2019.');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 3.2 });
      const s = k.fix2('punta-carnero', k.dv(280, ct, 'punta-carnero'), 'punta-europa', k.dv(14, ct, 'punta-europa'), 'Situación 21:12');
      const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, W);
      const ct2 = k.ct({ carta: L105, anyo: 2019, desvio: -0.8 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }];
    },
  },
  'bal-py-2022-03-a-33': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:00');
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(56, ct);
      const t = hrb(11) - hrb(9);
      const e = k.run(s, rv, k.distFor(5, t), 'Situación de estima 11:00');
      const o = k.fix2('punta-malabata', k.dv(107, ct, 'punta-malabata'), 'cabo-espartel', k.dv(176, ct, 'cabo-espartel'), 'Situación verdadera 11:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2022-03-a-35': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('35 45,2 N', '6 00,5 W', 'Situación 11:06');
      const rs = k.abatimiento(300, 4, W);
      const { ref, vef } = k.efectivo(rs, 6, 45, 2.5, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(13, 6) - hrb(11, 6), 'Situación 13:06'));
    },
  },
  'bal-py-2022-03-b-38': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 51,8 N', '8 05,0 W', 'Situación 10:10');
      const d = k.fromMark('cabo-espartel', N, 3, 'Destino');
      const { rv, dist } = k.rhumb(s, d);
      const t = (hrb(19, 40) - hrb(10, 10)) / 60;
      k.note('Velocidad', `De 10:10 a 19:40 hay 9,5 h: Vm = ${dist.toFixed(1).replace('.', ',')} M / 9,5 h = ${(dist / t).toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: rv }, { kind: 'speed', value: dist / t }];
    },
  },
  'bal-py-2022-03-a-39': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 11,0 N', '5 13,0 W', 'Situación 18:24');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 5, W);
      const ct = k.ct({ ct: -8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(18, 24), dist, 5) }];
    },
  },
  'bal-py-2022-03-b-39': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.cardinal2('punta-europa', S, 'punta-carnero', E, 'Situación 04:54');
      const ct = k.ctPolar(355);
      const rv = k.rv(218, ct);
      const rs = k.abatimiento(rv, 11, S);
      return latlon(k.run(s, rs, k.distFor(9, hrb(6, 12) - hrb(4, 54)), 'Situación 06:12'));
    },
  },
  'bal-py-2022-06-n-31': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const s = k.pos('36 11,8 N', '5 06,6 W', 'Situación 10:00');
      const ct1 = k.ct({ carta: L105, anyo: 2022, desvio: -1 });
      const rv1 = k.rv(215.5, ct1);
      const rs1 = k.abatimiento(rv1, 2, E);
      const p = k.run(s, rs1, 10, 'Situación 11:00');
      // Hacia el W, Punta Carnero queda por estribor.
      const rs2 = k.tangent(p, 'punta-carnero', 4, 'estribor');
      const ct2 = k.ct({ carta: L105, anyo: 2022, desvio: -2.5 });
      const rv2 = k.rvConAbatimiento(rs2, 2, E);
      const dvOp = k.oposicion('isla-tarifa', 'punta-cires');
      const dvA = k.dv(167.8, ct2, 'punta-alcazar');
      k.note('Rumbo de aguja', `Para la Ct no hace falta: Rv = ${rv2.toFixed(1).replace('.', ',')}°.`);
      // De 12:46,8 a 12:58,8 son 12 minutos: 2 millas a 10 nudos.
      return latlon(k.traslado('isla-tarifa', dvOp, 'punta-alcazar', dvA, rs2, k.distFor(10, 12), 'Situación 12:58,8'));
    },
  },
  'bal-py-2022-06-n-32': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dvOp = k.oposicion('punta-paloma', 'punta-alcazar');
      const ct = k.ctFrom(dvOp, 146);
      const rv = k.rv(95.5, ct);
      const dvE = k.dv(1, ct, 'punta-europa');
      const dvA = k.dvM(rv, 28, 'punta-almina');
      return latlon(k.fix2('punta-europa', dvE, 'punta-almina', dvA, 'Situación 23:31'));
    },
  },
  'bal-py-2022-06-a-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 3.2 });
      const s = k.fix2('punta-carnero', k.dv(280, ct, 'punta-carnero'), 'punta-europa', k.dv(14, ct, 'punta-europa'), 'Situación 21:12');
      const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, W);
      const ct2 = k.ct({ carta: L105, anyo: 2022, desvio: -0.8 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }];
    },
  },
  'bal-py-2022-06-a-34': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Salida');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 12, W);
      const ct = k.ct({ dm: -2, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2022-06-n-34': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 56,5 N', '5 21,5 W', 'Situación 23:31');
      const d = k.fromMark('punta-europa', E, 1.5, 'Destino 00:21');
      const { rv: rs, dist } = k.rhumb(s, d);
      const vb = dist / ((hrb(24, 21) - hrb(23, 31)) / 60);
      k.note('Velocidad', `En 50 minutos: Vb = ${dist.toFixed(2).replace('.', ',')} M / 0,83 h = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      const rv = k.rvConAbatimiento(rs, 4, NE);
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2022-06-n-35': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(258, ct);
      const s = k.fixDist('punta-europa', k.dv(328, ct, 'punta-europa'), 3, 'Situación 07:00');
      const t = hrb(7, 50) - hrb(7);
      const e = k.run(s, rv, k.distFor(10, t), 'Situación de estima 07:50');
      const o = k.fix2('punta-europa', k.dv(8, ct, 'punta-europa'), 'isla-tarifa', k.dv(266, ct, 'isla-tarifa'), 'Situación 07:50');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [...latlon(o), { kind: 'speed', value: ic }, { kind: 'bearing', value: rc }];
    },
  },
  'bal-py-2022-06-a-38': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 04:00');
      const ct = k.ct({ dm: -4, desvio: -1 });
      const rv = k.rv(140, ct);
      const t = hrb(4, 45) - hrb(4);
      const e = k.run(s, rv, k.distFor(8, t), 'Situación de estima 04:45');
      const o = k.fromMark('cabo-trafalgar', S, 7, 'Situación verdadera 04:45');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2022-06-n-38': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const ct = k.ctPolar(8);
      const s = k.fix2('punta-almina', k.dv(184, ct, 'punta-almina'), 'punta-carnero', k.dv(300, ct, 'punta-carnero'), 'Situación 23:00');
      const rs = k.tangent(s, 'isla-tarifa', 1.9, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, SW);
      const t = hrb(25) - hrb(23);
      const e = k.run(s, rs, k.distFor(10, t), 'Situación de estima 01:00');
      k.note('Situación observada', 'Las dos marcaciones de Isla de Tarifa no son simultáneas: trasladamos la primera lo navegado en esos 30 minutos (rumbo de superficie y 5 millas).');
      const o = k.traslado('isla-tarifa', k.dvM(rv, 43, 'isla-tarifa'), 'isla-tarifa', k.dvM(rv, 103, 'isla-tarifa'), rs, k.distFor(10, 30), 'Situación 01:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2022-06-n-39': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('52 14,2 S', '3 18,2 W', 'Situación 00:00');
      const ct = k.ct({ dm: 14, desvio: 7 });
      const rv = k.rv(67, ct);
      const rs = k.abatimiento(rv, 2, NW);
      return latlon(k.tramos(s, [{ rumbo: rs, millas: k.distFor(12, hrb(14, 20)) }], 'Situación 14:20'));
    },
  },
  'bal-py-2022-06-a-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 07,2 N', '6 00,5 W', 'Situación 04:00');
      // Hacia el ESE, Punta Paloma queda por babor.
      const rv = k.tangent(s, 'punta-paloma', 5, 'babor');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 1.2 });
      const t = hrb(5) - hrb(4);
      const e = k.run(s, rv, k.distFor(12, t), 'Situación de estima 05:00');
      const o = k.traslado('punta-paloma', k.dv(92, ct, 'punta-paloma'), 'punta-paloma', k.dv(19, ct, 'punta-paloma'), rv, k.distFor(12, 30), 'Situación 05:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2022-06-n-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 35,8 W', 'Situación de estima 12:59');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: -3 });
      k.note('Caída a estribor', 'Ra = 258° + 22° = 280°.');
      const rv = k.rv(280, ct);
      const t = hrb(14) - hrb(12, 59);
      const e = k.run(s, rv, k.distFor(10, t), 'Situación de estima 14:00');
      const o = k.traslado('punta-paloma', k.dvM(rv, 90, 'punta-paloma'), 'punta-paloma', k.dv(56.5, ct, 'punta-paloma'), rv, k.distFor(10, 30), 'Situación 14:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      const r = k.rumboConCorriente(o, 'barbate-espigon', 10, rc, ic);
      const ct2 = k.ct({ carta: L105, anyo: 2022, desvio: -2.5 });
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }, { kind: 'bearing', value: k.ra(r.rs, ct2) }];
    },
  },
  'bal-py-2022-12-ac-31': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 56,5 N', '5 21,5 W', 'Situación 23:31');
      const d = k.fromMark('punta-europa', E, 1.5, 'Destino 00:21');
      const { rv: rs, dist } = k.rhumb(s, d);
      const vb = dist / ((hrb(24, 21) - hrb(23, 31)) / 60);
      k.note('Velocidad', `En 50 minutos: Vb = ${dist.toFixed(2).replace('.', ',')} M / 0,83 h = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      const rv = k.rvConAbatimiento(rs, 4, NE);
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2022-12-b-31': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fix2Ranges('punta-paloma', 5, 'isla-tarifa', 7, k.P('punta-cires'), 'Situación 10:00');
      const ct = k.ct({ dm: 5, desvio: 4 });
      const rv = k.rv(171, ct);
      const { ref, vef } = k.efectivo(rv, 7, W, 3, s);
      const vN = -vef * Math.cos(ref * Math.PI / 180);
      const dl = (s.lat - (35 + 55 / 60)) * 60;
      const min = dl / vN * 60;
      k.note('Paralelo 35° 55′ N', `Hasta el paralelo faltan ${dl.toFixed(1).replace('.', ',')}′ de latitud; bajamos hacia el S a Vef · cos Ref = ${vN.toFixed(2).replace('.', ',')} nudos: ${Math.round(min)} minutos.`);
      k.estimaEfectiva(s, ref, vef, min, 'Paralelo 35° 55′ N');
      return [{ kind: 'clock', value: hrb(10) + min }];
    },
  },
  'bal-py-2022-12-b-32': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // «Observa el faro por el NE verdadero»: el faro demora 045°, así que estamos al 225° del faro.
      const s = k.fromMark('punta-gracia', SW, 3, 'Salida');
      const ref = k.tangent(s, 'cabo-espartel', 4, 'babor');
      const { rs } = k.rumboConCorriente(s, ref, 10, NW, 4);
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 7, N) }];
    },
  },
  'bal-py-2022-12-ac-33': {
    ejercicio: 'abatimiento',
    solve(k) {
      const dv = k.oposicion('punta-carnero', 'punta-europa');
      const s = k.fixDist('punta-europa', dv, 1, 'Situación');
      const a = k.P('ceuta-bocana'); const b = k.P('ceuta-roja');
      const d = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2, name: 'Puerto de Ceuta (entre puntas)' };
      k.note('Destino', 'La bocana de Ceuta «entre puntas»: el punto medio entre las luces verde y roja de los diques.');
      const { rv: rs, dist } = k.rhumb(s, d);
      const rv = k.rvConAbatimiento(rs, 4, E);
      const ct = k.ct({ ct: -1 });
      const v = dist / (40 / 60);
      k.note('Velocidad', `${dist.toFixed(1).replace('.', ',')} millas en 40 minutos: v = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-py-2022-12-b-33': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const t = hrb(13) - hrb(11, 6);
      const e = k.run(k.P('cabo-espartel'), 330, k.distFor(9, t), 'Situación de estima 13:00');
      const o = k.fromMark('cabo-trafalgar', S, 5, 'Situación verdadera 13:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2022-12-ac-34': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('36 30,0 N', '7 20,0 W', 'Salida');
      const b = k.pos('35 40,0 N', '10 10,0 W', 'Punto P');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
  'bal-py-2022-12-ac-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -5, desvio: -4 });
      const rv = k.rv(142, ct);
      const rs = k.abatimiento(rv, 8, NE);
      const d1 = k.dvM(rv, -45, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      const s = k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rs, k.distFor(12, 30), 'Situación 07:30');
      // Sin viento y sin conocer la corriente, el Rv es el de la tangente; hacia el E, Isla de Tarifa queda por babor.
      const rv2 = k.tangent(s, 'isla-tarifa', 2, 'babor');
      const ct2 = k.ct({ dm: -5, desvio: -5 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv2, ct2) }];
    },
  },
  'bal-py-2022-12-b-37': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const op = k.oposicion('isla-tarifa', 'punta-cires');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-alcazar', S, 'Salida');
      const rs = k.tangent(s, 'punta-gracia', 4, 'estribor');
      const rv = k.rvConAbatimiento(rs, 15, NE);
      const ct = k.ct({ dm: -5, desvio: -7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2022-12-b-38': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d1 = k.dvM(70, 140, 'punta-malabata');
      const d2 = k.dvM(70, 40, 'punta-cires');
      return latlon(k.traslado('punta-malabata', d1, 'punta-cires', d2, 70, k.distFor(8, 60), 'Situación 23:00'));
    },
  },
  'bal-py-2022-12-ac-39': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const { rs, vb } = k.rumboYVelocidad(k.P('barbate-espigon'), 'tanger-espigon', 200, 100, 1.5);
      const ct = k.ct({ dm: 3, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2022-12-b-39': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // En la enfilación (Carnero detrás de Europa): estamos al E de Punta Europa y vemos los dos faros hacia el W.
      const dv = k.enfilacion('punta-carnero', 'punta-europa', W);
      const s = k.fixDist('punta-europa', dv, 1.8, 'Situación 00:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'ceuta-bocana', 40, NE, 6);
      const ct = k.ct({ dm: -2, desvio: 12 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2022-12-ac-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      // En la enfilación (Carnero detrás de Europa): estamos al E de Punta Europa y vemos los dos faros hacia el W.
      const dv = k.enfilacion('punta-carnero', 'punta-europa', W);
      const s = k.fixDist('punta-europa', dv, 2, 'Situación 02:25');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: -0.7 });
      const rv = k.rv(172, ct);
      const t = hrb(4, 12) - hrb(2, 25);
      const e = k.run(s, rv, k.distFor(5, t), 'Situación de estima 04:12');
      const o = k.fix2('punta-almina', 192, 'punta-carnero', 290, 'Situación 04:12');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }, ...latlon(o)];
    },
  },
  'bal-py-2022-12-b-40': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Rumbo', 'El Rv y la velocidad no intervienen: la Ct sale de la oposición, Ct = Dv − Da.');
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 352) }];
    },
  },
  'bal-py-2023-03-ac-31': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: -5 });
      const rv = k.rv(233, ct);
      const rs = k.abatimiento(rv, 5, W);
      return latlon(k.run(s, rs, k.distFor(6, hrb(17, 30) - hrb(15, 30)), 'Situación 17:30'));
    },
  },
  'bal-py-2023-03-ac-32': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      k.note('Declinación', 'El enunciado no la da: la de la carta llevada al año del examen (2023).');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 6 });
      const rv = k.rv(335, ct);
      const rs = k.abatimiento(rv, 8, W);
      const d1 = k.dv(305, ct, 'punta-almina');
      const d2 = k.dvM(rv, -90, 'punta-almina');
      return latlon(k.traslado('punta-almina', d1, 'punta-almina', d2, rs, k.distFor(8, 45), 'Situación 04:45'));
    },
  },
  'bal-py-2023-03-ac-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-carbonera', E, 2, 'Salida');
      const rs = k.tangent(s, 'punta-europa', 2, 'estribor');
      const rv = k.rvConAbatimiento(rs, 12, E);
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2023-03-ac-34': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ ct: -5 });
      const s = k.fixDist('punta-europa', k.dv(278, ct, 'punta-europa'), 4.5, 'Situación');
      const rv = k.rv(182, ct);
      const { ref, vef } = k.efectivo(rv, 7, 260, 3, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2023-03-ac-35': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // «Observa el faro por el NE verdadero»: el faro demora 045°, así que estamos al 225° del faro.
      const s = k.fromMark('punta-gracia', SW, 3, 'Salida');
      const ref = k.tangent(s, 'cabo-espartel', 4, 'babor');
      const { rs } = k.rumboConCorriente(s, ref, 10, NW, 4);
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 7, N) }];
    },
  },
  'bal-py-2023-03-ac-36': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 02,0 N', '5 22,0 W', 'Situación 14:00');
      const d = k.fromMark('isla-tarifa', S, 3, 'Destino');
      const { rv } = k.rhumb(s, d);
      const t = hrb(17) - hrb(14);
      const e = k.run(s, rv, k.distFor(6, t), 'Situación de estima 17:00');
      const ct = k.ct({ dm: -2, desvio: -3 });
      const o = k.fix2('isla-tarifa', k.dv(347, ct, 'isla-tarifa'), 'punta-cires', k.dv(127, ct, 'punta-cires'), 'Situación verdadera 17:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2023-03-ac-40': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 11,1 N', '6 09,1 W', 'Situación 10:30');
      const a = k.pos('36 09,3 N', '6 02,7 W', 'Punto Alpha');
      const r = k.rumboConCorriente(s, a, 7.8, 206, 4);
      return [{ kind: 'bearing', value: r.rs }, { kind: 'clock', value: k.eta(hrb(10, 30), r.dist, r.vef) }];
    },
  },
  'bal-py-2023-06-ac-31': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 30,1 W', 'Situación 12:00');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: -7 });
      const rv = k.rv(261, ct);
      const p = k.run(s, rv, 12, 'Situación 13:00');
      const { rs } = k.rumboConCorriente(p, 'barbate-espigon', 12, 210, 3);
      const rv2 = k.rvConAbatimiento(rs, 15, E);
      const ct2 = k.ct({ carta: L105, anyo: 2023, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv2, ct2) }];
    },
  },
  'bal-py-2023-06-ac-32': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-alcazar', N, 5, 'Situación 08:00');
      // Hacia el W, Cabo Espartel queda por babor.
      const ref = k.tangent(s, 'cabo-espartel', 5, 'babor');
      k.note('Velocidad efectiva', 'Es dato (12 nudos): el extremo del vector efectivo está a 12 millas por el Ref.');
      const x = k.run(s, ref, 12, 'Extremo del vector efectivo');
      const { rs } = k.rumboYVelocidad(s, x, 60, 30, 4);
      const rv = k.rvConAbatimiento(rs, 7, S);
      const ct = k.ctPolar(6);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2023-06-b-32': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      // En la enfilación (Carnero detrás de Europa): el punto A está al E de Punta Europa y desde él se ven los dos faros hacia el W.
      const dv = k.enfilacion('punta-carnero', 'punta-europa', W);
      const a = k.fixDist('punta-europa', dv, 4, 'Punto A');
      const r = k.rumboConCorriente(k.P('ceuta-bocana'), a, 8, 84, 3.5);
      const min = r.dist / r.vef * 60;
      k.note('Tiempo', `t = ${r.dist.toFixed(1).replace('.', ',')} M / ${r.vef.toFixed(1).replace('.', ',')} nudos = ${Math.floor(min / 60)} h ${Math.round(min % 60)} min.`);
      return [{ kind: 'clock', value: min }, { kind: 'bearing', value: r.rs }];
    },
  },
  'bal-py-2023-06-ac-33': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      // 4 cuartas = 45°, 8 cuartas = 90° (el través). A las 04:00 el faro demora N 20° W = 340° por el través de babor: Rv = 340° + 90° = 070°.
      k.note('Rumbo verdadero', 'A las 04:00 Trafalgar demora 340° y está por el través de babor (8 cuartas): Rv = 340° + 90° = 070°.');
      const rv = 70;
      const d1 = k.dvM(rv, -45, 'cabo-trafalgar');
      const d = k.distFor(12, hrb(4) - hrb(3, 41));
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', 340, rv, d, 'Situación 04:00'));
    },
  },
  'bal-py-2023-06-b-33': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 58,6 N', '5 42,3 W', 'Situación 11:30');
      k.note('Rumbo verdadero', 'El Rv = 270° es dato: la dm y el desvío no hacen falta.');
      const t = 120;
      const e = k.run(s, 270, k.distFor(5, t), 'Situación de estima 13:30');
      const dv = k.oposicion('cabo-espartel', 'cabo-trafalgar');
      const o = k.fixDist('cabo-trafalgar', dv, 10, 'Situación verdadera 13:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2023-06-ac-34': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 43,0 W', 'Salida');
      const rs = k.tangent(s, 'cabo-espartel', 2, 'babor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 10, E) }];
    },
  },
  'bal-py-2023-06-b-34': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 12.8, 'Situación 16:20');
      const r = k.rumboConCorriente(s, 'barbate-espigon', 8, W, 4);
      const rv = k.rvConAbatimiento(r.rs, 5, E);
      return [{ kind: 'bearing', value: rv }, { kind: 'speed', value: r.vef }];
    },
  },
  'bal-py-2023-06-ac-35': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.fromMark('punta-carbonera', SE, 6.7, 'Salida');
      const a = k.P('ceuta-bocana'); const b = k.P('ceuta-roja');
      const d = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2, name: 'Bocana de Ceuta' };
      k.note('Destino', 'La bocana de Ceuta: el punto medio entre las luces verde y roja de los diques.');
      const { rv: rs, dist } = k.rhumb(s, d);
      const rv = k.rvConAbatimiento(rs, 8, E);
      const ct = k.ct({ ct: -5 });
      const vb = dist / (70 / 60);
      k.note('Velocidad', `${dist.toFixed(1).replace('.', ',')} millas en 70 minutos: Vb = ${vb.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2023-06-ac-36': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      // Rumbo al NE, hacia el Mediterráneo: Punta Europa queda por babor.
      const rs = k.tangent('ceuta-roja', 'punta-europa', 6, 'babor');
      const rv = k.rvConAbatimiento(rs, 3, E);
      const ct = k.ctPolar(4);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2023-06-ac-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -0.73, desvio: -5 });
      const rv = k.rv(48, ct);
      const rs = k.abatimiento(rv, 9, W);
      const d1 = k.dv(92, ct, 'cabo-espartel');
      const d2 = k.dvM(rv, 90, 'cabo-espartel');
      return latlon(k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rs, k.distFor(8, 60), 'Situación 02:00'));
    },
  },
  'bal-py-2023-06-ac-39': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      k.note('Situación de salida', 'El tribunal corrigió la errata del enunciado: donde dice l = 39° 50′ N se lee 35° 50′ N.');
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:30');
      const ct1 = k.ct({ dm: -3.5, desvio: 1.5 });
      const rv = k.rv(52, ct1);
      const { ref, vef } = k.efectivo(rv, 8, 110, 3, s);
      const p = k.estimaEfectiva(s, ref, vef, 60, 'Situación 10:30');
      const r = k.rumboConCorriente(p, 'barbate-espigon', 8, 110, 3);
      const ct2 = k.ct({ dm: -3.5, desvio: 0.5 });
      return [{ kind: 'bearing', value: r.ref }, { kind: 'speed', value: r.vef }, { kind: 'bearing', value: k.ra(r.rs, ct2) }];
    },
  },
  'bal-py-2023-06-b-39': {
    sinCarta: true,
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Desvío', 'Interpolando en la tablilla entre Ra 120° (+0,4°) y Ra 150° (+0,1°): para Ra 140°, Δ = 0,4° − 0,3° × 20/30 = +0,2°.');
      return [{ kind: 'signed', value: k.ct({ carta: [-(1 + 45 / 60), 1990, 9], anyo: 2023, desvio: 0.2 }) }];
    },
  },
  'bal-py-2023-06-b-40': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
      const ct = k.ct({ carta: L105, anyo: 2023, desvio: -5 });
      const rv = k.rv(233, ct);
      const rs = k.abatimiento(rv, 5, W);
      return latlon(k.run(s, rs, k.distFor(6, hrb(17, 30) - hrb(15, 30)), 'Situación 17:30'));
    },
  },
  'bal-py-2023-12-b-32': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 30,0 W', 'Situación 20:00');
      const d = k.fromMark('punta-europa', S, 2, 'Punto a 2 millas al S de Punta Europa');
      const { rv: rs } = k.rhumb(s, d);
      const rv = k.rvConAbatimiento(rs, 10, NW);
      const ct = k.ct({ dm: -2, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2023-12-a-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Salida');
      const rs = k.tangent(s, 'cabo-trafalgar', 5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 7, SW);
      const ct = k.ct({ ct: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2023-12-b-33': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      k.note('Rumbo', 'El Rv y la velocidad no intervienen: la Ct sale de la oposición, Ct = Dv − Da.');
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 352) }];
    },
  },
};

/* DISCREPANCIAS
 * 'bal-py-2021-12-b-32' (formato de las opciones): las coordenadas vienen escritas como «35º- 53,5′» y el lector de
 * opciones no las entiende (todas puntúan ∞). Calculada sale 35° 56,3′ N 5° 33,8′ W, que es la oficial b. Se publicará
 * cuando el lector admita ese guion.
 *   'bal-py-2021-12-b-32': {
 *     ejercicio: 'demoras-no-simultaneas',
 *     solve(k) {
 *       const ct = k.ctPolar(2);
 *       const rv = k.rv(272, ct);
 *       const rs = k.abatimiento(rv, 5, S);
 *       const d1 = k.dvM(rv, -70, 'punta-cires');
 *       const d2 = k.dvM(rv, 60, 'isla-tarifa');
 *       const d = k.distFor(6, hrb(22, 15) - hrb(21, 30));
 *       return latlon(k.traslado('punta-cires', d1, 'isla-tarifa', d2, rs, d, 'Situación 22:15'));
 *     },
 *   },
 * 'bal-py-2021-12-b-33' (formato de las opciones): las coordenadas vienen escritas como «35º- 53,5′» y el lector de
 * opciones no las entiende (todas puntúan ∞). Calculada sale 36° 01,1′ N 5° 52,7′ W, que es la oficial a.
 *   'bal-py-2021-12-b-33': {
 *     ejercicio: 'situacion-dos-demoras',
 *     solve(k) {
 *       const dvR = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
 *       const ct = k.ctFrom(dvR, 330);
 *       const rv = k.rv(0, ct);
 *       const dvG = k.dvM(rv, 45, 'punta-gracia');
 *       return latlon(k.lineAndBearing('cabo-roche', dvR, 'punta-gracia', dvG, 'Situación 11:00'));
 *     },
 *   },
 * 'bal-py-2021-12-b-37' (formato de las opciones): las coordenadas vienen escritas como «35º- 53,5′» y el lector de
 * opciones no las entiende (todas puntúan ∞). Calculada sale 35° 58,6′ N 5° 21,3′ W (la situación de la oficial d),
 * pero la corriente da Rc 139,5° / Ihc 2,4 nudos frente a 135° / 2,5 de la d (las a y b llevan Rc 139°): la diferencia
 * de rumbo de corriente sale de cómo se traza el rumbo para pasar a 3 millas de Isla de Tarifa.
 *   'bal-py-2021-12-b-37': {
 *     ejercicio: 'corriente-desconocida',
 *     solve(k) {
 *       const ct = k.ct({ dm: -3.5, desvio: 1.5 });
 *       const rv = k.rv(180, ct);
 *       const rs = k.abatimiento(rv, 8, SE);
 *       const dvEnf = k.enfilacion('punta-carnero', 'punta-europa', 90);
 *       const dvA = k.dvM(rv, 17, 'punta-almina');
 *       const s = k.lineAndBearing('punta-europa', dvEnf, 'punta-almina', dvA, 'Situación 03:00');
 *       const p = k.run(s, rs, k.distFor(8, 45), 'Situación 03:45');
 *       // Rumbo de superficie para pasar a 3 millas de Isla de Tarifa (dejándola por estribor) y Rv con el abatimiento.
 *       const rs2 = k.tangent(p, 'isla-tarifa', 3, 'estribor');
 *       const rv2 = k.rvConAbatimiento(rs2, 15, SE);
 *       const t = hrb(5) - hrb(3, 45);
 *       const e = k.run(p, rs2, k.distFor(8, t), 'Situación de estima 05:00');
 *       const o = k.fix2('punta-cires', k.dvM(rv2, 3, 'punta-cires'), 'punta-almina', k.dvM(rv2, -93, 'punta-almina'), 'Situación 05:00');
 *       const { rc, ic } = k.corrienteDesconocida(e, o, t);
 *       return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
 *     },
 *   },
 * 'bal-py-2021-12-b-38' (empate): elige la oficial c (Rc 038°, 2,4 nudos) pero sin margen: sale Rc 035,7° e Ihc 2,47
 * nudos, a medio camino entre la c y la b (035°, 3,1 nudos). Probablemente diferencias de trazado en la situación de
 * las 09:30 (Leona y Cires dan un corte muy agudo).
 *   'bal-py-2021-12-b-38': {
 *     ejercicio: 'corriente-desconocida',
 *     solve(k) {
 *       const ct = k.ct({ dm: -3.5, desvio: 1 });
 *       const rv = k.rv(253, ct);
 *       const s = k.fixDist('punta-europa', k.dvM(rv, 80, 'punta-europa'), 6, 'Situación 08:00');
 *       const t = hrb(9, 30) - hrb(8);
 *       const e = k.run(s, rv, k.distFor(8.33, t), 'Situación de estima 09:30');
 *       const o = k.fix2('punta-cires', k.dv(183, ct, 'punta-cires'), 'punta-leona', k.dvM(rv, -109, 'punta-leona'), 'Situación verdadera 09:30');
 *       const { rc, ic } = k.corrienteDesconocida(e, o, t);
 *       return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
 *     },
 *   },
 * 'bal-py-2022-06-n-36' (formato de las opciones): las coordenadas vienen escritas como «35º- 53,5′» y el lector de
 * opciones no las entiende (todas puntúan ∞). La oficial b y las c y d están en ese formato. Calculada sale 35° 54,5′
 * N 5° 53,9′ W y Ra 062,7°, que es la oficial b (35° 54,6′ N 5° 53,9′ W, Ra 064°).
 *   'bal-py-2022-06-n-36': {
 *     ejercicio: 'demoras-no-simultaneas',
 *     solve(k) {
 *       const ct = k.ctPolar(3);
 *       const rv = k.rv(83, ct);
 *       const rs = k.abatimiento(rv, 5, NE);
 *       const d1 = k.dvM(rv, 40, 'cabo-espartel');
 *       const d2 = k.dvM(rv, -37, 'punta-paloma');
 *       const p = k.traslado('cabo-espartel', d1, 'punta-paloma', d2, rs, k.distFor(20, 35), 'Situación 21:35');
 *       const { rv: rs2 } = k.rhumb(p, 'isla-tarifa');
 *       const rv2 = k.rvConAbatimiento(rs2, 3, NE);
 *       const ct2 = k.ct({ carta: L105, anyo: 2022, desvio: 3.5 });
 *       return [...latlon(p), { kind: 'bearing', value: k.ra(rv2, ct2) }];
 *     },
 *   },
 * 'bal-py-2021-12-b-40' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-03-a-37' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-03-a-40' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-03-b-40' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-06-a-37' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-12-ac-36' (formato de las opciones): las coordenadas vienen escritas como «35º-57′» y el lector de
 * opciones no las entiende (todas puntúan ∞). Calculada sale 35° 57,0′ N 5° 21,5′ W, que es la oficial a.
 *   'bal-py-2022-12-ac-36': {
 *     ejercicio: 'situacion-dos-demoras',
 *     solve(k) {
 *       const dvOp = k.oposicion('punta-alcazar', 'punta-paloma');
 *       const ct = k.ctFrom(dvOp, 326);
 *       const rv = k.rv(95.5, ct);
 *       const dvE = k.dv(1, ct, 'punta-europa');
 *       const dvA = k.dvM(rv, 28, 'punta-almina');
 *       return latlon(k.fix2('punta-europa', dvE, 'punta-almina', dvA, 'Situación 23:31'));
 *     },
 *   },
 * 'bal-py-2022-06-n-37' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-12-b-34' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-12-b-36' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de Mareas
 * y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 * 'bal-py-2022-12-ac-35' (elemento que no está en la carta de la app): la situación de las 04:00 es el corte de la
 * enfilación Malabata–El Xarf con la isobática de 100 m, y la carta de la app no tiene isobáticas; sin esa situación
 * no se puede trazar el rumbo para pasar a 1 milla de Punta Cires.
 * 'bal-py-2023-12-a-31' (formato de las opciones): las coordenadas vienen escritas como «35º56’0 N» (la décima detrás
 * del apóstrofo) y el lector de opciones no las entiende (todas puntúan ∞). Calculada sale 35° 56,0′ N 5° 49,2′ W, que
 * es la oficial b.
 *   'bal-py-2023-12-a-31': {
 *     ejercicio: 'situacion-dos-demoras',
 *     solve(k) {
 *       k.oposicion('punta-malabata', 'punta-gracia');
 *       const ct = k.ct({ carta: L105, anyo: 2023, desvio: 2 });
 *       k.note('Rumbo', 'La oposición y el rumbo solo sitúan la derrota: la situación sale de las dos demoras.');
 *       const d1 = k.dv(2, ct, 'punta-gracia');
 *       const d2 = k.dv(67, ct, 'isla-tarifa');
 *       return latlon(k.fix2('punta-gracia', d1, 'isla-tarifa', d2, 'Situación observada'));
 *     },
 *   },
 * 'bal-py-2023-06-ac-40' (marea, falta la tabla): pide una sonda o una hora de marea en un puerto del Anuario de
 * Mareas y la pregunta no trae la tabla (tabla_mareas = null); no se puede resolver con los datos de la app.
 */

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
 */

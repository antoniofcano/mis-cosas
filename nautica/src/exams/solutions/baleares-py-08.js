// Soluciones programadas de carta del PY de Baleares (lote 08). Ver baleares-per.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;

export default {
  'bal-py-2024-07-a-31': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 11,0 N', '5 13,0 W', 'Situación 11:13');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 5, W);
      const ct = k.ct({ ct: -8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(11, 13), dist, 5) }];
    },
  },
  'bal-py-2024-07-a-32': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: 3.2 });
      const s = k.fix2('punta-carnero', k.dv(280, ct, 'punta-carnero'), 'punta-europa', k.dv(14, ct, 'punta-europa'), 'Situación 21:12');
      // Navegamos al W y pasamos por el S de Isla de Tarifa: la dejamos por estribor.
      const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, W);
      const ct2 = k.ct({ carta: L105, anyo: 2024, desvio: -0.8 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }];
    },
  },
  'bal-py-2024-07-a-34': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 02,0 N', '5 53,0 W', 'Situación');
      // Subimos hacia el NW por fuera del cabo: Trafalgar queda por estribor.
      const rs = k.tangent(s, 'cabo-trafalgar', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 8, SW);
      const ct = k.ct({ dm: -2, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-07-bc-34': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: -2 });
      const rv = k.rv(105, ct);
      const rs = k.abatimiento(rv, 5, NW);
      const { ref, vef } = k.efectivo(rs, 14, 300, 1.5);
      const d1 = k.dvM(rv, -40, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      const d = (vef * 20) / 60;
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, ref, d, 'Situación 00:20'));
    },
  },
  'bal-py-2024-07-a-35': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('cabo-espartel', W, 12.8, 'Situación 16:20');
      const { rs, vef } = k.rumboConCorriente(s, 'barbate-espigon', 8, W, 4);
      const rv = k.rvConAbatimiento(rs, 5, E);
      return [{ kind: 'bearing', value: rv }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2024-07-bc-35': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const dvEnf = k.enfilacion('punta-carnero', 'punta-europa', 70);
      k.note('Situación 02:25', 'En la enfilación Carnero–Europa y a 2 millas de Punta Europa: el punto está en la prolongación de la línea, al otro lado de Punta Europa.');
      const s = k.fromMark('punta-europa', dvEnf, 2, 'Situación 02:25');
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -0.7 });
      const rv = k.rv(172, ct);
      const t = hrb(4, 12) - hrb(2, 25);
      const e = k.run(s, rv, k.distFor(5, t), 'Situación de estima 04:12');
      const o = k.fix2('punta-almina', 192, 'punta-carnero', 290, 'Situación observada 04:12');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2024-07-a-36': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 30,0 W', 'Situación 20:00');
      const p = k.fromMark('punta-europa', S, 2, 'Punto a 2 millas al S de Punta Europa');
      const { rv: rs } = k.rhumb(s, p);
      const rv = k.rvConAbatimiento(rs, 10, NW);
      const ct = k.ct({ dm: -2, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-07-bc-36': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-alcazar');
      return [{ kind: 'signed', value: k.ctFrom(dv, 173) }];
    },
  },
  'bal-py-2024-07-bc-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: 5 });
      const rv = k.rv(151, ct);
      const rs = k.abatimiento(rv, 8, SW);
      const d1 = k.dvM(rv, -90, 'cabo-roche');
      const d2 = k.dv(31.6, ct, 'cabo-trafalgar');
      const d = k.distFor(8, hrb(22, 15) - hrb(20, 45));
      return latlon(k.traslado('cabo-roche', d1, 'cabo-trafalgar', d2, rs, d, 'Situación 22:15'));
    },
  },
  'bal-py-2024-07-a-38': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 50,0 W', 'Situación');
      k.note('Banda', 'Hacia el Mediterráneo la vía del DST es la del S: Isla de Tarifa queda por babor.');
      const rs = k.tangent(s, 'isla-tarifa', 4, 'babor');
      const rv = k.rvConAbatimiento(rs, 7, E);
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-07-bc-38': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 40,0 W', 'Situación 13:00');
      const ct = k.ct({ dm: -3.5, desvio: -2.5 });
      const rv = k.rv(66, ct);
      const { ref, vef } = k.efectivo(rv, 9, S, 2.5, s);
      const p = k.estimaEfectiva(s, ref, vef, 90, 'Situación 14:30');
      const r = k.rumboConCorriente(p, 'ceuta-bocana', 9, S, 2.5);
      return [{ kind: 'clock', value: k.eta(hrb(14, 30), r.dist, r.vef) }];
    },
  },
  'bal-py-2024-07-a-39': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 04:00');
      const ct = k.ct({ dm: -4, desvio: -1 });
      const rv = k.rv(140, ct);
      const t = hrb(4, 45) - hrb(4, 0);
      const e = k.run(s, rv, k.distFor(8, t), 'Situación de estima 04:45');
      const o = k.fromMark('cabo-trafalgar', S, 7, 'Situación observada 04:45');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2024-07-bc-40': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-europa', SE, 5, 'Situación 12:50');
      const p = k.fromMark('isla-tarifa', S, 3, 'Punto a 3 millas al S de Isla de Tarifa');
      const { rv: rs } = k.rhumb(s, p);
      const rv = k.rvConAbatimiento(rs, 5, SE);
      const ct = k.ct({ dm: -2, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-12-a-31': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ ct: -5 });
      const s = k.fixDist('punta-europa', k.dv(278, ct, 'punta-europa'), 4.5);
      const rv = k.rv(182, ct);
      const { ref, vef } = k.efectivo(rv, 7, 260, 3, s);
      return [{ kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2024-12-bc-31': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fix2Ranges('cabo-roche', 3, 'cabo-trafalgar', 7, { lat: 36.25, lon: -6.25 }, 'Situación 10:00');
      const ct = k.ct({ dm: -3, desvio: -2 });
      const rv = k.rv(185, ct);
      const p = k.corteRumbo(s, rv, 'cabo-trafalgar', k.dvM(rv, -90, 'cabo-trafalgar'), 'Situación 10:30');
      const vb = k.distanceBetween(s, p) / 0.5;
      k.note('Velocidad máquina', `Lo navegado entre las 10:00 y las 10:30, en media hora: Vm = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      const x = k.pos('36 09,3 N', '6 02,7 W', 'Punto X');
      const r = k.rumboConCorriente(p, x, vb, 260, 4);
      k.eta(hrb(10, 30), r.dist, r.vef);
      // Las opciones dan la HRB sin separador («1154»), que el lector de opciones no reconoce: se compara solo el Rv
      // (sale 11:55, la de la opción a).
      return [{ kind: 'bearing', value: r.rs }];
    },
  },
  'bal-py-2024-12-a-32': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('36 30,0 N', '7 20,0 W', 'Salida');
      const b = k.pos('35 40,0 N', '10 10,0 W', 'Punto P');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      return [{ kind: 'bearing', value: rumbo }, { kind: 'distance', value: dist }];
    },
  },
  'bal-py-2024-12-bc-33': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 43,0 W', 'Situación 12:00');
      // Salimos del Estrecho hacia el SW: Cabo Espartel queda por babor.
      const ref = k.tangent(s, 'cabo-espartel', 2, 'babor');
      k.note('Vector efectivo', 'La velocidad efectiva es dato (6 nudos): en una hora recorremos 6 millas sobre el Ref.');
      const p = k.run(s, ref, 6, 'Al cabo de 1 h');
      const { rs, vb } = k.rumboYVelocidad(s, p, 60, E, 3.2);
      const ct = k.ct({ dm: -2, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2024-12-a-34': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 12, W);
      const ct = k.ct({ dm: -2, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-12-bc-34': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carbonera', SE, 6.7, 'Situación');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 8, E);
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -4.4 });
      const vb = dist / (70 / 60);
      k.note('Velocidad', `Para llegar en 70 minutos: Vb = ${dist.toFixed(2).replace('.', ',')} millas / (70/60) h = ${vb.toFixed(2).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2024-12-bc-35': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ctPolar(3.2);
      const rv = k.rv(105, ct);
      const rs = k.abatimiento(rv, 5, NW);
      const { ref, vef } = k.efectivo(rs, 14, 300, 1.5);
      const d1 = k.dvM(rv, -40, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      const d = (vef * 20) / 60;
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, ref, d, 'Situación 00:20'));
    },
  },
  'bal-py-2024-12-a-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 53,8 N', '5 52,0 W', 'Situación 11:45');
      const { rs, vb } = k.rumboYVelocidad(s, 'isla-tarifa', hrb(13, 45) - hrb(11, 45), 215, 3);
      const rv = k.rvConAbatimiento(rs, 4, N);
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -1 });
      return [{ kind: 'speed', value: vb }, { kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-12-bc-36': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('isla-tarifa', 'punta-alcazar');
      return [{ kind: 'signed', value: k.ctFrom(dv, 173) }];
    },
  },
  'bal-py-2024-12-a-37': {
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
  'bal-py-2024-12-bc-37': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación');
      // Entramos en el Estrecho hacia el E: Punta Cires, en la costa africana, queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 10, NW);
      const ct = k.ctPolar(13);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-12-a-38': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      // Salimos de Barbate hacia el W por fuera del cabo: Trafalgar queda por estribor.
      const rs = k.tangent('barbate-espigon', 'cabo-trafalgar', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 4, NW);
      const ct = k.ct({ carta: L105, anyo: 2024, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2024-12-a-39': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const o = k.fixDist('punta-almina', 250, 2.5, 'Situación observada');
      const e = k.pos('35 53,0 N', '5 10,0 W', 'Situación de estima');
      const { rc } = k.corrienteDesconocida(e, o, 60);
      return [{ kind: 'bearing', value: rc }];
    },
  },
  'bal-py-2024-12-bc-39': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 04,0 N', '5 21,3 W', 'Situación 21:12');
      const t = hrb(23, 12) - hrb(21, 12);
      k.note('Rumbo de superficie', 'El Rs = 241° ya lleva el abatimiento: la estima se hace directamente sobre él.');
      const e = k.run(s, 241, k.distFor(8, t), 'Situación de estima 23:12');
      const o = k.pos('35 57,0 N', '5 33,6 W', 'Situación observada 23:12');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2024-12-bc-40': {
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Salida');
      return latlon(k.tramos(s, [{ rumbo: 240, millas: 50 }]));
    },
  },
  'bal-py-2025-04-bc-31': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('punta-europa', S, 'punta-carnero', E, 'Situación 04:54');
      const ct = k.ctPolar(355);
      const rv = k.rv(218, ct);
      const rs = k.abatimiento(rv, 11, S);
      return latlon(k.run(s, rs, k.distFor(9, hrb(6, 12) - hrb(4, 54)), 'Situación 06:12'));
    },
  },
  'bal-py-2025-04-a-32': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
      const ct = k.ct({ dm: -1, desvio: -5 });
      const rv = k.rv(233, ct);
      return latlon(k.run(s, rv, k.distFor(6, 120), 'Situación 17:30'));
    },
  },
  'bal-py-2025-04-bc-32': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('40 53,4 N', '9 40,1 E', 'Salida');
      return latlon(k.tramos(s, [{ rumbo: 17, millas: 90 }]));
    },
  },
  'bal-py-2025-04-bc-33': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 03,0 W', 'Situación 10:30');
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: -3.5 });
      const rv = k.rv(50, ct);
      const rs = k.abatimiento(rv, 6, NW);
      const p = k.run(s, rs, 11, 'Situación 11:30');
      const r = k.rumboYVelocidad(p, 'punta-cires', 90, 120, 3);
      const rv2 = k.rvConAbatimiento(r.rs, 2, SE);
      const ct2 = k.ct({ carta: L105, anyo: 2020, desvio: -0.5 });
      return [{ kind: 'bearing', value: k.ra(rv2, ct2) }, { kind: 'speed', value: r.vb }];
    },
  },
  'bal-py-2025-04-a-34': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fromMark('punta-gracia', W, 3, 'Situación 12:00');
      const ct = k.ct({ dm: -2, desvio: -3 });
      const rv = k.rv(245, ct);
      const rs = k.abatimiento(rv, 10, N);
      const p1 = k.run(s, rs, 10, 'Situación 13:00');
      const r = k.rumboConCorriente(p1, 'cabo-espartel', 10, E, 3);
      const p2 = k.estimaEfectiva(p1, r.ref, r.vef, 30, 'Situación 13:30');
      const ct3 = k.ct({ dm: -2, desvio: 10 });
      const rv3 = k.rv(60, ct3);
      return latlon(k.run(p2, rv3, k.distFor(10, 90), 'Situación 15:00'));
    },
  },
  'bal-py-2025-04-bc-34': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -1, desvio: 6.5 });
      const rv = k.rv(97, ct);
      const d1 = k.dv(0, ct, 'punta-paloma');
      const d2 = k.dvM(rv, 0, 'isla-tarifa');
      return latlon(k.traslado('punta-paloma', d1, 'isla-tarifa', d2, rv, k.distFor(7, 25), 'Situación 14:30'));
    },
  },
  'bal-py-2025-04-bc-35': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(258, ct);
      const s = k.fixDist('punta-europa', k.dv(328, ct, 'punta-europa'), 3, 'Situación 07:00');
      const t = hrb(7, 50) - hrb(7, 0);
      const e = k.run(s, rv, k.distFor(10, t), 'Situación de estima 07:50');
      const o = k.fix2('punta-europa', k.dv(8, ct, 'punta-europa'), 'isla-tarifa', k.dv(266, ct, 'isla-tarifa'), 'Situación observada 07:50');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'speed', value: ic }, { kind: 'bearing', value: rc }];
    },
  },
  'bal-py-2025-04-a-37': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fixDist('cabo-trafalgar', 340, 3, 'Situación');
      // Costeamos hacia el SE: Punta de Gracia queda por babor.
      const rs = k.tangent(s, 'punta-gracia', 6.1, 'babor');
      const rv = k.rvConAbatimiento(rs, 4, NE);
      const ct = k.ct({ carta: L105, anyo: 2025, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2025-04-bc-37': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('43 22,6 N', '3 03,2 W', 'Salida');
      const b = k.pos('44 53,9 N', '2 42,1 W', 'Llegada');
      return [{ kind: 'distance', value: k.rumboDirecto(a, b).dist }];
    },
  },
  'bal-py-2025-04-a-38': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const ct = k.ct({ dm: -1, desvio: -3 });
      const s = k.fix2('cabo-trafalgar', k.dv(330, ct, 'cabo-trafalgar'), 'cabo-espartel', k.dv(204, ct, 'cabo-espartel'), 'Situación 17:15');
      const rv = k.rv(284, ct);
      const rs = k.abatimiento(rv, 3, NW);
      const { ref, vef } = k.efectivo(rs, 4.5, S, 2, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(20, 15) - hrb(17, 15), 'Situación 20:15'));
    },
  },
  'bal-py-2025-04-bc-38': {
    ejercicio: 'estima-directa',
    solve(k) {
      k.note('Rumbo verdadero', 'La Polar (en el polo) demora 000°: marcándola 70° por babor, Rv − 70° = 000° → Rv = 070°. Ct = Rv − Ra = 070° − 078° = −8°.');
      const rv = 70;
      const s = k.fixDist('cabo-espartel', k.dvM(rv, 60, 'cabo-espartel'), 1.8, 'Situación 07:00');
      return latlon(k.run(s, rv, k.distFor(14, 15), 'Situación 07:15'));
    },
  },
  'bal-py-2025-04-bc-39': {
    sinCarta: true,
    ejercicio: 'abatimiento',
    solve(k) {
      return [{ kind: 'bearing', value: k.abatimiento(S, 3, E) }];
    },
  },
  'bal-py-2025-04-a-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fix2Ranges('cabo-espartel', 6, 'punta-malabata', 6, { lat: 35.9, lon: -5.85 }, 'Situación 12:22');
      const { rv } = k.rhumb(s, 'cabo-trafalgar');
      const t = hrb(13, 58) - hrb(12, 22);
      const e = k.run(s, rv, k.distFor(7, t), 'Situación de estima 13:58');
      const o = k.fromMark('punta-gracia', W, 5, 'Situación observada 13:58');
      return [{ kind: 'speed', value: k.corrienteDesconocida(e, o, t).ic }];
    },
  },
  'bal-py-2025-07-a-31': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -1, desvio: -5 });
      const rv = k.rv(48, ct);
      const rs = k.abatimiento(rv, 9, W);
      const d1 = k.dv(92, ct, 'cabo-espartel');
      const d2 = k.dvM(rv, 90, 'cabo-espartel');
      return latlon(k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rs, k.distFor(8, 60), 'Situación 02:00'));
    },
  },
  'bal-py-2025-07-b-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación');
      // Subimos hacia el NW por fuera del cabo: Trafalgar queda por estribor.
      const rs = k.tangent(s, 'cabo-trafalgar', 3, 'estribor');
      const rv = k.rvConAbatimiento(rs, 5, SW);
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -8 })) }];
    },
  },
  'bal-py-2025-07-b-34': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 15,0 N', '6 14,0 W', 'Situación 10:00');
      const ct = k.ct({ dm: -3, desvio: 1 });
      const rv = k.rv(132, ct);
      const { ref, vef } = k.efectivo(rv, 5, 260, 3.5, s);
      return latlon(k.estimaEfectiva(s, ref, vef, hrb(12, 15) - hrb(10, 0), 'Situación 12:15'));
    },
  },
  'bal-py-2025-07-b-35': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', N, 3, 'Salida');
      // Entramos en el Estrecho hacia el E: Punta Cires, en la costa africana, queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 2, 'estribor');
      const rv = k.rvConAbatimiento(rs, 10, E);
      const ct = k.ct({ dm: -2, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2025-07-a-36': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const t = hrb(17, 30) - hrb(16, 0);
      const e = k.run(k.P('tanger-espigon'), 350, k.distFor(7, t), 'Situación de estima 17:30');
      const o = k.fix2Ranges('punta-gracia', 6.1, 'punta-paloma', 4.2, { lat: 36.0, lon: -5.75 }, 'Situación observada 17:30');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2025-07-b-36': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('isla-tarifa', 'punta-alcazar');
      const ct = k.ct({ dm: 9, desvio: -12 });
      const dv = k.dv(227, ct, 'punta-malabata');
      return latlon(k.lineAndBearing('isla-tarifa', op, 'punta-malabata', dv, 'Situación 13:40'));
    },
  },
  'bal-py-2025-07-a-37': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const { rs, vb } = k.rumboYVelocidad('barbate-espigon', 'tanger-espigon', hrb(9, 20) - hrb(7, 0), 96, 3.2);
      const rv = k.rvConAbatimiento(rs, 5, W);
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -5 })) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2025-07-b-38': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-malabata', N, 4, 'Salida');
      // Entramos en el Estrecho hacia el E: Punta Cires, en la costa africana, queda por estribor.
      const rs = k.tangent(s, 'punta-cires', 2, 'estribor');
      const rv = k.rvConAbatimiento(rs, 10, N);
      const ct = k.ct({ dm: -2, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2025-07-b-40': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 15:30');
      const ct = k.ct({ dm: -3.5, desvio: 1.5 });
      const rv = k.rv(52, ct);
      const { ref, vef } = k.efectivo(rv, 8, 110, 3, s);
      const p = k.estimaEfectiva(s, ref, vef, 60, 'Situación 16:30');
      const { rs } = k.rumboConCorriente(p, 'barbate-espigon', 8, 110, 3);
      const ct2 = k.ct({ dm: -3.5, desvio: 0.5 });
      return [{ kind: 'bearing', value: k.ra(rs, ct2) }];
    },
  },
  'bal-py-2025-12-a-31': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-gracia', W, 3, 'Situación 12:00');
      const ct = k.ct({ dm: -2, desvio: -3 });
      const rv = k.rv(245, ct);
      const rs = k.abatimiento(rv, 10, N);
      const p = k.run(s, rs, 10, 'Situación 13:00');
      const r = k.rumboConCorriente(p, 'cabo-espartel', 10, E, 3);
      k.note('Distancia a recorrer', `Hasta quedar a 1 milla del faro: ${r.dist.toFixed(1).replace('.', ',')} − 1 = ${(r.dist - 1).toFixed(1).replace('.', ',')} millas.`);
      return [{ kind: 'clock', value: k.eta(hrb(13, 0), r.dist - 1, r.vef) }];
    },
  },
  'bal-py-2025-12-b-31': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 10,0 W', 'Situación 09:00');
      k.note('Deriva', 'Sin arrancada el barco va con la corriente: en 3 horas recorre 2,7 × 3 = 8,1 millas al 090°.');
      const p = k.run(s, E, 2.7 * 3, 'Situación 12:00');
      return [{ kind: 'distance', value: k.distanceBetween(p, 'barbate-espigon') }];
    },
  },
  'bal-py-2025-12-b-32': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fix2Ranges('cabo-espartel', 6, 'punta-malabata', 6, { lat: 35.9, lon: -5.85 }, 'Situación 10:30');
      const { rv } = k.rhumb(s, 'cabo-trafalgar');
      const t = hrb(12, 6) - hrb(10, 30);
      const e = k.run(s, rv, k.distFor(7, t), 'Situación de estima 12:06');
      const o = k.fromMark('punta-gracia', W, 5, 'Situación observada 12:06');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2025-12-a-33': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const d = k.distFor(12, 20);
      // De los dos cortes, el que queda en el mar (al N de Malabata).
      const p = k.trasladoDosArcos('punta-malabata', 3, 'punta-malabata', 6, 30, d, (c) => c.sort((a, b) => b.lat - a.lat)[0], 'Situación 18:20');
      return latlon(p);
    },
  },
  'bal-py-2025-12-b-33': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('33 18,0 N', '50 30,0 W', 'Situación 01:00');
      const b = k.pos('31 20,0 N', '52 15,0 W', 'Punto P');
      const { rumbo } = k.rumboDirecto(a, b);
      const rv = k.rvConAbatimiento(rumbo, 5, S);
      return [{ kind: 'bearing', value: k.ra(rv, k.ctPolar(3)) }];
    },
  },
  'bal-py-2025-12-a-34': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('tanger-espigon', N, 'punta-cires', W, 'Situación 06:00');
      const p = k.fromMark('tanger-espigon', N, 2, 'Punto a 2 millas al N de Tánger');
      const { rs, vb } = k.rumboYVelocidad(s, p, 30, E, 3);
      const rv = k.rvConAbatimiento(rs, 4, W);
      const ct = k.ct({ dm: -2, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2025-12-b-34': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('punta-europa', S, 'punta-carnero', E, 'Situación 04:54');
      const ct = k.ctPolar(355);
      const rv = k.rv(218, ct);
      const rs = k.abatimiento(rv, 11, S);
      return latlon(k.run(s, rs, k.distFor(9, hrb(6, 12) - hrb(4, 54)), 'Situación 06:12'));
    },
  },
  'bal-py-2025-12-a-36': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const dvOp = k.oposicion('punta-europa', 'punta-carnero');
      const s = k.fromMark('punta-europa', dvOp, 1, 'Situación');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 4, E);
      const vb = dist / (40 / 60);
      k.note('Velocidad', `Para llegar en 40 minutos: Vb = ${dist.toFixed(1).replace('.', ',')} millas / (40/60) h = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -1 })) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2025-12-b-37': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-gracia', SW, 3, 'Situación');
      // Salimos al Atlántico pasando por fuera de Espartel: lo dejamos por babor.
      const ref = k.tangent(s, 'cabo-espartel', 4, 'babor');
      const { rs } = k.rumboConCorriente(s, ref, 10, NW, 4);
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 7, N) }];
    },
  },
  'bal-py-2025-12-b-38': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const s = k.pos('25 50,0 N', '32 10,0 E', 'Salida');
      return latlon(k.tramos(s, [{ rumbo: 80, millas: 15 * 4 }]));
    },
  },
  'bal-py-2025-12-b-39': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 07,1 N', '6 02,6 W', 'Situación');
      const { rs } = k.rumboConCorriente(s, 'punta-malabata', 11, 100, 3.2);
      const rv = k.rvConAbatimiento(rs, 6, NE);
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -1, desvio: -4 })) }];
    },
  },
  'bal-py-2025-12-b-40': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -3.5, desvio: 0.5 });
      const rv = k.rv(250, ct);
      const d1 = k.dvM(rv, -45, 'cabo-espartel');
      const d2 = k.dvM(rv, -90, 'cabo-espartel');
      return latlon(k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rv, k.distFor(10, 30), 'Situación 05:30'));
    },
  },
  'bal-py-2026-03-b-31': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      // El enunciado fecha el ejercicio el 3 de marzo de 2012: declinación de la carta llevada a 2012.
      const ct = k.ct({ carta: L105, anyo: 2012, desvio: -8 });
      const rv = k.rv(80, ct);
      const d1 = k.dvM(rv, 140, 'punta-malabata');
      const d2 = k.dvM(rv, 40, 'punta-cires');
      return latlon(k.traslado('punta-malabata', d1, 'punta-cires', d2, rv, k.distFor(8, 60), 'Situación 23:00'));
    },
  },
};

/* DISCREPANCIAS
 * 'bal-py-2024-07-a-33': (trazado al límite) sale Rc = 035,7°, Ihc = 2,47 nudos: el comprobador elige la a (035°, 2,4) y la oficial es la d (037°, 2,4). La intensidad cuadra; los 1,3° de rumbo son precisión de trazado y no se fuerzan.
 *
 *     'bal-py-2024-07-a-33': {
 *       ejercicio: 'corriente-desconocida',
 *       solve(k) {
 *         const ct = k.ct({ dm: -3.5, desvio: 1 });
 *         const rv = k.rv(253, ct);
 *         const s = k.fixDist('punta-europa', k.dvM(rv, 80, 'punta-europa'), 6, 'Situación 08:00');
 *         const t = hrb(9, 30) - hrb(8, 0);
 *         const e = k.run(s, rv, k.distFor(8.33, t), 'Situación de estima 09:30');
 *         const o = k.fix2('punta-cires', k.dv(183, ct, 'punta-cires'), 'punta-leona', k.dvM(rv, -109, 'punta-leona'), 'Situación observada 09:30');
 *         const { rc, ic } = k.corrienteDesconocida(e, o, t);
 *         return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
 *       },
 *     },
 *
 * 'bal-py-2024-07-a-37': (marea sin datos) sonda en Barbate el 17-12-2024 con corrección barométrica: el enunciado no trae la tabla de mareas del Anuario y Barbate no tiene datos de marea en la app.
 * 'bal-py-2024-07-a-40': (elemento que no está en la carta de la app) la enfilación «Magair/cabo Espartel» necesita la marca de Magair, que no está en la carta de la app ni el enunciado da sus coordenadas.
 * 'bal-py-2024-12-a-33': (respuesta cualitativa / DST) se pregunta en qué vía del DST estaremos a las 16:15; la respuesta no es un valor numérico y los límites del DST no están en la carta de la app.
 * 'bal-py-2024-12-a-35': (elemento que no está en la carta de la app) la salida es «al SW verdadero de Cabo Roche sobre la isobática de 20 m»: la carta de la app no tiene isobáticas.
 * 'bal-py-2024-12-a-40': (marea sin datos) sonda en el puerto de Cádiz el 27-10-2024 por tabla: fuera de la carta y sin la tabla de mareas del Anuario en el enunciado.
 * 'bal-py-2025-04-a-36': (trazado al límite) la enfilación Alcázar–Cires en la carta de la app da Dv = 226,6° y, con Da = 303° − 60° = 243°, Ct = −16,4°: la opción más próxima es la oficial (d, 15° NW) pero a 1,4°, fuera del margen del PY.
 *
 *     'bal-py-2025-04-a-36': {
 *       ejercicio: 'ct-enfilacion',
 *       solve(k) {
 *         const da = 303 - 60;
 *         k.note('Demora de aguja', `Marcación por babor: Da = Ra − M = 303° − 60° = ${da}°.`);
 *         const dv = k.enfilacion('punta-alcazar', 'punta-cires', 230);
 *         return [{ kind: 'signed', value: k.ctFrom(dv, da) }];
 *       },
 *     },
 *
 * 'bal-py-2025-04-a-39': (no cuadra) el corte en el mar de los arcos de 5 millas (Paloma) y 7 millas (Tarifa) está en l = 35° 59,2′ N; al Rv 180° la corriente al W no cambia la latitud y los 4,2′ hasta 35° 55′ N se recorren en 36 min (10:36). La oficial (b, 10:53) supone salir unas 2′ más al N; posible errata o situación de partida distinta.
 *
 *     'bal-py-2025-04-a-39': {
 *       ejercicio: 'corriente-efectiva',
 *       solve(k) {
 *         const s = k.fix2Ranges('punta-paloma', 5, 'isla-tarifa', 7, { lat: 35.95, lon: -5.72 }, 'Situación 10:00');
 *         const ct = k.ct({ dm: 5, desvio: 4 });
 *         const rv = k.rv(171, ct);
 *         const { ref, vef } = k.efectivo(rv, 7, W, 3, s);
 *         const dl = (s.lat - (35 + 55 / 60)) * 60;
 *         const min = (dl / (vef * -Math.cos(ref * Math.PI / 180))) * 60;
 *         k.note('Paralelo de 35° 55′ N', `Faltan ${dl.toFixed(1).replace('.', ',')}′ de latitud; al Ref la latitud baja ${(vef * -Math.cos(ref * Math.PI / 180)).toFixed(2).replace('.', ',')}′ por hora: t = ${Math.round(min)} min.`);
 *         k.estimaEfectiva(s, ref, vef, min, 'Cruce del paralelo');
 *         return [{ kind: 'clock', value: hrb(10, 0) + min }];
 *       },
 *     },
 *
 * 'bal-py-2025-07-a-33': (trazado al límite) sale Ra = 241,8° (dm 2019 = 1° 12′ W, Ct = +1,8°): queda entre la b (240°) y la oficial d (243°), más cerca de la oficial pero sin margen. En la pregunta gemela bal-py-2024-07-a-32 la plantilla también da ~0,9° más que el trazado de la app.
 *
 *     'bal-py-2025-07-a-33': {
 *       ejercicio: 'rumbo-pasar-distancia',
 *       solve(k) {
 *         const ct = k.ct({ carta: L105, anyo: 2019, desvio: 3 });
 *         const s = k.fix2('punta-carnero', k.dv(280, ct, 'punta-carnero'), 'punta-europa', k.dv(14, ct, 'punta-europa'), 'Situación 21:12');
 *         // Navegamos al W y pasamos por el S de Isla de Tarifa: la dejamos por estribor.
 *         const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
 *         const rv = k.rvConAbatimiento(rs, 3, W);
 *         return [{ kind: 'bearing', value: k.ra(rv, ct) }];
 *       },
 *     },
 *
 * 'bal-py-2025-04-bc-40': (marea sin datos) sonda en el puerto de Cádiz el 18-04-2025 por el método exacto: fuera de la carta y sin la tabla de mareas del Anuario en el enunciado.
 * 'bal-py-2025-07-b-31': (elemento que no está en la carta de la app) la enfilación del faro de Punta Cires con la cumbre del monte «Loma El Garrób» necesita ese monte, que no está en la carta de la app ni el enunciado da sus coordenadas.
 * 'bal-py-2025-07-b-37': (marea sin datos) sonda en el puerto de Cádiz el 09-04-2025 con corrección barométrica: fuera de la carta y sin la tabla de mareas del Anuario en el enunciado.
 * 'bal-py-2025-07-a-39': (formato de las opciones) sale Ra = 357,5° y llegada a las 09:49, que es la oficial (c: 358°, 0950); pero las horas vienen sin separador («Hrb=0950») y el lector de opciones no las lee, y con el Ra solo hay empate entre c y d (ambas 358°).
 *
 *     'bal-py-2025-07-a-39': {
 *       ejercicio: 'corriente-rumbo-a-dar',
 *       solve(k) {
 *         const s = k.pos('35 50,0 N', '6 00,0 W', 'Situación 08:00');
 *         const r = k.rumboConCorriente(s, 'barbate-espigon', 12, 100, 3);
 *         const rv = k.rvConAbatimiento(r.rs, 4, W);
 *         const ct = k.ct({ dm: -2, desvio: -4 });
 *         return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(8, 0), r.dist, r.vef) }];
 *       },
 *     },
 *
 * 'bal-py-2025-12-b-36': (formato de las opciones) sale l = 35° 56,1′ N, L = 5° 21,3′ W, que es la oficial (a); pero las opciones escriben «35º-56,2' N» con guion entre grados y minutos y el lector de opciones no las lee.
 *
 *     'bal-py-2025-12-b-36': {
 *       ejercicio: 'estima-directa',
 *       solve(k) {
 *         const dvOp = k.oposicion('punta-alcazar', 'punta-paloma');
 *         const ct = k.ctFrom(dvOp, 326);
 *         const s = k.fixBearingRange('punta-paloma', dvOp, 'punta-cires', 9.6, 0, 'Situación 22:31');
 *         const rv = k.rv(95.5, ct);
 *         const rs = k.abatimiento(rv, 2, NE);
 *         return latlon(k.run(s, rs, 15, 'Situación 23:31'));
 *       },
 *     },
 *
 * 'bal-py-2025-07-a-40': (marea sin datos) sonda en el puerto de Camariñas el 03-01-2025 con corrección barométrica: fuera de la carta y sin la tabla de mareas del Anuario en el enunciado.
 * 'bal-py-2025-12-b-35': (marea sin datos) sonda en el puerto de Chipiona el 08-08-2025 con corrección barométrica: fuera de la carta y sin la tabla de mareas del Anuario en el enunciado.
 * 'bal-py-2025-12-a-37': (elemento que no está en la carta de la app) la enfilación «monte Magair / faro de cabo Espartel» necesita el monte Magair, que no está en la carta de la app ni el enunciado da sus coordenadas (gemela de bal-py-2024-07-a-40).
 */

// Soluciones programadas de carta del PY de Baleares (lote 05). Ver baleares-py.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const N = 0; const NE = 45; const E = 90; const SE = 135; const S = 180; const SW = 225; const W = 270; const NW = 315;
/** Punto medio entre dos puntos (bocana «entre puntas»). */
const medio = (a, b) => ({ lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 });

export default {
  // ---- Marzo-abril de 2017
  'bal-py-2017-03-a-31': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 07,1 N', '6 02,6 W', 'Salida');
      const { rs } = k.rumboConCorriente(s, 'punta-malabata', 11, 100, 3.2);
      const rv = k.rvConAbatimiento(rs, 6, NE);
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },

  'bal-py-2017-03-a-33': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 6 });
      const rv = k.rv(335, ct);
      const rs = k.abatimiento(rv, 8, W);
      const d1 = k.dv(305, ct, 'punta-almina');
      k.note('Través de babor', 'El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90°.');
      const d2 = k.dvM(rv, -90, 'punta-almina');
      const m = k.distFor(8, 45);
      return latlon(k.traslado('punta-almina', d1, 'punta-almina', d2, rs, m, 'Situación 04:45'));
    },
  },
  'bal-py-2017-03-a-34': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -1.5 });
      const rv = k.rv(120, ct);
      const d1 = k.dvM(rv, -30, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -60, 'cabo-trafalgar');
      const m = k.distFor(10, 30);
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rv, m, 'Situación 07:30'));
    },
  },
  'bal-py-2017-03-a-35': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fromMark('punta-gracia', W, 3, 'Situación 12:00');
      const ct1 = k.ct({ dm: -2, desvio: -3 });
      const rv1 = k.rv(245, ct1);
      const rs1 = k.abatimiento(rv1, 10, N);
      const p1 = k.run(s, rs1, k.distFor(10, 60), 'Situación 13:00');
      k.note('Segundo tramo', 'De 13:00 a 13:30 vamos hacia Cabo Espartel con corriente: el Ref es la línea al faro y el triángulo de velocidades da la Vef.');
      const { ref, vef } = k.rumboConCorriente(p1, 'cabo-espartel', 10, E, 3);
      const p2 = k.estimaEfectiva(p1, ref, vef, 30, 'Situación 13:30');
      const ct3 = k.ct({ dm: -2, desvio: 10 });
      const rv3 = k.rv(60, ct3);
      return latlon(k.run(p2, rv3, k.distFor(10, 90), 'Situación 15:00'));
    },
  },
  'bal-py-2017-03-a-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 34,0 W', 'Salida 23:12');
      const b = k.fromMark('cabo-trafalgar', 200, 5.3, 'Llegada 03:42');
      const t = hrb(24 + 3, 42) - hrb(23, 12);
      const { rs, vb } = k.rumboYVelocidad(s, b, t, 71, 1.94);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -3 });
      return [{ kind: 'speed', value: vb }, { kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'bal-py-2017-03-cb-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 52,3 N', '5 55,4 W', 'Salida');
      const { rs, vb, ref, vef } = k.rumboYVelocidad(s, 'tanger-espigon', 90, 193, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      return [{ kind: 'bearing', value: rs }, { kind: 'speed', value: vb }, { kind: 'bearing', value: ref }, { kind: 'speed', value: vef }];
    },
  },
  'bal-py-2017-03-cb-37': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const s = k.fix2Ranges('cabo-roche', 3, 'cabo-trafalgar', 7, k.pos('36 15,0 N', '6 15,0 W', 'Referencia: al W, en el mar'), 'Situación 10:00');
      const ct = k.ct({ dm: -3, desvio: -2 });
      const ra = k.ra(S, ct);
      k.note('Trafalgar por el través de babor', 'Navegando al S, el través de babor está al E: Trafalgar demora 090°.');
      const p = k.corteRumbo(s, S, 'cabo-trafalgar', E, 'Situación 10:30');
      const d = k.distanceBetween(s, p);
      k.note('Velocidad', `Vb = ${d.toFixed(2).replace('.', ',')} M / 0,5 h = ${(d / 0.5).toFixed(1).replace('.', ',')} nudos.`);
      return [...latlon(s), { kind: 'bearing', value: ra }, { kind: 'speed', value: d / 0.5 }];
    },
  },
  'bal-py-2017-03-a-38': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = medio(k.P('ceuta-bocana'), k.P('ceuta-roja'));
      k.note('Salida', 'Salimos de la bocana de Ceuta, entre las luces verde y roja de los diques.');
      const b = k.fromMark('punta-europa', E, 3, 'A 3 M al E/v de Punta Europa');
      const { rv } = k.rhumb(s, b);
      const t = hrb(20, 10) - hrb(19, 0);
      const e = k.run(s, rv, k.distFor(9, t), 'Situación de estima 20:10');
      const o = k.fix2('punta-europa', 0, 'punta-carnero', 290, 'Situación verdadera 20:10');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2017-03-cb-38': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 11,1 N', '6 09,1 W', 'Situación 10:30');
      const b = k.pos('36 09,3 N', '6 02,7 W', 'Punto Alpha');
      const { rs, vef, dist } = k.rumboConCorriente(s, b, 7.8, 206, 4);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      return [{ kind: 'bearing', value: rs }, { kind: 'clock', value: k.eta(hrb(10, 30), dist, vef) }];
    },
  },
  'bal-py-2017-03-a-39': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      k.note('Cuartas', '4 cuartas = 45°; 8 cuartas = 90° (el través).');
      const d2 = 340;
      const rv = d2 + 90 - 360;
      k.note('Rumbo verdadero', `A las 04:00 Trafalgar demora N 20° W = 340° y está por el través de babor: Rv = 340° + 90° = ${String(rv).padStart(3, '0')}°.`);
      const d1 = k.dvM(rv, -45, 'cabo-trafalgar');
      const m = k.distFor(12, 19);
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rv, m, 'Situación 04:00'));
    },
  },
  'bal-py-2017-03-cb-40': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 10:30');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 5, E);
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  // ---- Julio de 2017
  'bal-py-2017-07-a-32': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 56,5 N', '5 21,5 W', 'Situación 23:31');
      const b = k.fromMark('punta-europa', E, 1.5, 'A 1,5 M al E/v de Punta Europa');
      const { rv: rs, dist } = k.rhumb(s, b);
      const t = hrb(24, 21) - hrb(23, 31);
      const vb = dist / (t / 60);
      k.note('Velocidad necesaria', `Vb = ${dist.toFixed(2).replace('.', ',')} M / ${t} min = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      const rv = k.rvConAbatimiento(rs, 4, NE);
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2017-07-b-32': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 11,0 N', '5 13,0 W', 'Situación 18:24');
      const { rv: rs, dist } = k.rhumb(s, 'ceuta-bocana');
      const rv = k.rvConAbatimiento(rs, 5, W);
      const ct = k.ct({ ct: -8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(18, 24), dist, 5) }];
    },
  },
  'bal-py-2017-07-a-33': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('48 12,6 N', '1 20,5 E', 'Salida 15:00');
      const b = k.pos('47 03,2 N', '2 53,8 W', 'Punto P');
      const { rumbo, dist } = k.rumboDirecto(a, b);
      const ct = k.ct({ dm: -9, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rumbo, ct) }, { kind: 'clock', value: k.eta(hrb(15, 0), dist, 15) }];
    },
  },
  'bal-py-2017-07-b-33': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.cardinal2('tanger-espigon', N, 'punta-cires', W, 'Situación 06:00');
      const b = k.fromMark('tanger-espigon', N, 2, 'A 2 M al N/v de Tánger');
      const { rs, vb } = k.rumboYVelocidad(s, b, 30, E, 3);
      const rv = k.rvConAbatimiento(rs, 4, W);
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2017-07-a-34': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 10:30');
      k.note('Destino', 'La única luz del puerto de Tánger en la carta de la app es la del espigón (dique de abrigo): la tomamos como destino.');
      const { rv: rs } = k.rhumb(s, 'tanger-espigon');
      const rv = k.rvConAbatimiento(rs, 5, E);
      const ct = k.ct({ dm: -3, desvio: -6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2017-07-b-34': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fromMark('punta-alcazar', N, 5, 'Situación 08:00');
      // Hacia el W, por el norte de Espartel: el cabo queda a babor (al S).
      const ref = k.tangent(s, 'cabo-espartel', 5, 'babor');
      const { rs } = k.rumboConCorriente(s, ref, 12, 30, 4);
      const rv = k.rvConAbatimiento(rs, 7, S);
      const ct = k.ctPolar(6);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2017-07-a-35': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 10,0 W', 'Situación 13:00');
      k.note('Sin máquina', 'Con el motor parado solo nos mueve la corriente: 2 h al 090° a 2,7 nudos.');
      const d = k.distFor(2.7, 120);
      return latlon(k.run(s, E, d, 'Situación 15:00'));
    },
  },
  'bal-py-2017-07-a-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 34,0 W', 'Salida 23:12');
      const b = k.fromMark('cabo-trafalgar', 200, 5.3, 'Llegada 03:42');
      const t = hrb(24 + 3, 42) - hrb(23, 12);
      const { rs, vb } = k.rumboYVelocidad(s, b, t, 71, 1.94);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -3 });
      return [{ kind: 'speed', value: vb }, { kind: 'bearing', value: k.ra(rs, ct) }];
    },
  },
  'bal-py-2017-07-b-36': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 50,0 N', '5 50,0 W', 'Salida');
      // Entramos en el Estrecho hacia el NE: Tarifa queda a babor (al N).
      const rs = k.tangent(s, 'isla-tarifa', 4, 'babor');
      const rv = k.rvConAbatimiento(rs, 7, E);
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2017-07-b-37': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 07,2 N', '6 00,5 W', 'Situación 04:00');
      // Hacia el Estrecho por fuera de la costa: Punta Paloma queda a babor (al N).
      const rv = k.tangent(s, 'punta-paloma', 5, 'babor');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 1 });
      const d1 = k.dv(92, ct, 'punta-paloma');
      const d2 = k.dv(19, ct, 'punta-paloma');
      k.note('Hora', 'El enunciado pide la situación «a las 1700h»: es la de las 05:00, la de la segunda demora.');
      const o = k.traslado('punta-paloma', d1, 'punta-paloma', d2, rv, k.distFor(12, 30), 'Situación 05:00');
      const e = k.run(s, rv, k.distFor(12, 60), 'Situación de estima 05:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, 60);
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2017-07-b-38': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.fromMark('punta-gracia', W, 3, 'Situación 12:00');
      const ct1 = k.ct({ dm: -2, desvio: -3 });
      const rv1 = k.rv(245, ct1);
      const rs1 = k.abatimiento(rv1, 10, N);
      const p1 = k.run(s, rs1, k.distFor(10, 60), 'Situación 13:00');
      k.note('Segundo tramo', 'De 13:00 a 13:30 vamos hacia Cabo Espartel con corriente: el Ref es la línea al faro y el triángulo de velocidades da la Vef.');
      const { ref, vef } = k.rumboConCorriente(p1, 'cabo-espartel', 10, E, 3);
      const p2 = k.estimaEfectiva(p1, ref, vef, 30, 'Situación 13:30');
      const ct3 = k.ct({ dm: -2, desvio: 10 });
      const rv3 = k.rv(60, ct3);
      return latlon(k.run(p2, rv3, k.distFor(10, 90), 'Situación 15:00'));
    },
  },
  'bal-py-2017-07-a-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 5.5, 4.9, 'Situación 01:25');
      // Hacia el E por el sur del Estrecho: Punta Cires queda a estribor.
      const rv = k.tangent(s, 'punta-cires', 3, 'estribor');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -3 });
      const ra = k.ra(rv, ct);
      const t = hrb(2, 35) - hrb(1, 25);
      const e = k.run(s, rv, k.distFor(12, t), 'Situación de estima 02:35');
      const o = k.fix2('isla-tarifa', k.dv(0, ct, 'isla-tarifa'), 'punta-cires', k.dv(120, ct, 'punta-cires'), 'Situación verdadera 02:35');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: ra }, { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2017-07-b-40': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 57,4 N', '5 30,1 W', 'Situación 12:00');
      const ct1 = k.ct({ carta: L105, anyo: 2017, desvio: -7 });
      const p = k.run(s, k.rv(261, ct1), k.distFor(12, 60), 'Situación 13:00');
      const { rs } = k.rumboConCorriente(p, 'barbate-espigon', 12, 210, 3);
      const rv = k.rvConAbatimiento(rs, 15, E);
      const ct2 = k.ct({ carta: L105, anyo: 2017, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct2) }];
    },
  },
};

/* DISCREPANCIAS
 * 'bal-py-2017-03-cb-34' (faltan datos: tabla de mareas): sonda en Mazagón el 23-04-2017 a las 11:00 UT; la pregunta no trae la tabla del Anuario (bajamares y pleamares de ese día), así que no se puede calcular. Oficial: a (7,89 m).
 * 'bal-py-2017-03-cb-35' (elemento que no está en la carta de la app): la salida es «al SW/v de Cabo Roche sobre la isobática de 20 m», y las isobáticas no están en la carta de la app; sin ella no hay situación de estima para la corriente. Oficial: a (Rc 195°, Ic 2,1).
 * 'bal-py-2017-03-a-32' (opciones con formato que el lector no reconoce): las opciones escriben «35-57N», «05-21,6W». Con la Ct de la oposición Paloma–Alcázar (Da Alcázar 146°), Dv Europa y marcación de Almina sale 35° 57,0′ N 5° 21,5′ W, la oficial a.
 *   Código que la resuelve:
 *     'bal-py-2017-03-a-32': {
 *       ejercicio: 'situacion-dos-demoras',
 *       solve(k) {
 *         const dvA = k.oposicion('punta-paloma', 'punta-alcazar');
 *         const ct = k.ctFrom(dvA, 146);
 *         k.note('Situación de las 22:31', 'La distancia radar a Punta Cires no hace falta para la situación de las 23:31: de la oposición solo necesitamos la Ct.');
 *         const rv = k.rv(95.5, ct);
 *         const dE = k.dv(1, ct, 'punta-europa');
 *         const dAl = k.dvM(rv, 28, 'punta-almina');
 *         return latlon(k.fix2('punta-europa', dE, 'punta-almina', dAl, 'Situación 23:31'));
 *       },
 *     },
 * 'bal-py-2017-07-a-31' (opciones con formato que el lector no reconoce): es la misma pregunta que bal-py-2017-03-a-32, con opciones «35º-57' N», «05º-21,6' W». Sale 35° 57,0′ N 5° 21,5′ W, la oficial d. El código es el de bal-py-2017-03-a-32.
 * 'bal-py-2017-07-b-31' (elemento que no está en la carta de la app): la Ct sale de la enfilación «Magair – Cabo Espartel», y ese punto no está en la carta de la app ni el enunciado da sus coordenadas. Oficial: b (35° 51,9′ N 5° 50,0′ W).
 * 'bal-py-2017-07-b-35' (faltan datos: tabla de mareas): hora de sonda 10 m en Fisterra el 17-01-2017; la pregunta no trae la tabla del Anuario. Oficial: a (16:41).
 */

// Soluciones programadas de carta del PY de Baleares (lote 05). Ver baleares-py.js para el formato.
// Resumen: 82 preguntas; 58 resueltas; 24 en DISCREPANCIAS: 9 por falta de la tabla de mareas, 8 por opciones con un
// formato que el lector no reconoce (resueltas, con el código o la referencia en el bloque final), 6 por elementos que
// no están en la carta de la app (isobáticas, Magair, San Bartolomé, DST) y 1 sin margen frente a otra opción.
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
  // ---- Diciembre de 2017
  'bal-py-2017-12-a-33': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      k.note('Año actual', 'Tomamos la declinación de la carta llevada al año de la convocatoria (2017).');
      const ct1 = k.ct({ carta: L105, anyo: 2017, desvio: 3 });
      const s = k.fix2('punta-carnero', k.dv(280, ct1, 'punta-carnero'), 'punta-europa', k.dv(14, ct1, 'punta-europa'), 'Situación 21:12');
      // Hacia el W por el centro del Estrecho: la Isla de Tarifa queda a estribor (al N).
      const rs = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      const rv = k.rvConAbatimiento(rs, 3, W);
      const ct2 = k.ct({ carta: L105, anyo: 2017, desvio: -1 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }];
    },
  },
  'bal-py-2017-12-a-34': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const enf = k.enfilacion('punta-malabata', 'cabo-espartel');
      const ct = k.ct({ ct: 10 });
      const dT = k.dv(350, ct, 'cabo-trafalgar');
      return latlon(k.lineAndBearing('cabo-espartel', enf, 'cabo-trafalgar', dT, 'Situación 11:00'));
    },
  },
  'bal-py-2017-12-a-35': {
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
  'bal-py-2017-12-b-35': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: -2 });
      const rv = k.rv(69, ct);
      const d1 = k.dvM(rv, 60, 'cabo-espartel');
      const d2 = k.dvM(rv, 120, 'cabo-espartel');
      return latlon(k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rv, k.distFor(12, 25), 'Situación 01:25'));
    },
  },
  'bal-py-2017-12-a-36': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('35 53,6 N', '6 10,4 W', 'Situación 10:00');
      const b = k.fromMark('cabo-espartel', NW, 4, 'A 4 M al NW/v de Espartel');
      const { rs, vb } = k.rumboYVelocidad(s, b, 120, S, 2);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: -4, desvio: -1 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2017-12-b-36': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 04,0 N', '5 21,3 W', 'Situación 21:12');
      const rs = 241;
      const rv = k.rvConAbatimiento(rs, 3, W);
      k.note('Marcaciones', 'Las marcaciones se cuentan desde la proa, es decir, desde el Rv; las distancias, sobre el rumbo de superficie.');
      const d1 = k.dvM(rv, 36, 'isla-tarifa');
      const d2 = k.dvM(rv, 77, 'isla-tarifa');
      const o = k.traslado('isla-tarifa', d1, 'isla-tarifa', d2, rs, k.distFor(8, 30), 'Situación 23:12');
      const t = hrb(23, 12) - hrb(21, 12);
      const e = k.run(s, rs, k.distFor(8, t), 'Situación de estima 23:12');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2017-12-a-38': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 04:00');
      const ct = k.ct({ dm: -4, desvio: -1 });
      const rv = k.rv(140, ct);
      const e = k.run(s, rv, k.distFor(8, 45), 'Situación de estima 04:45');
      const o = k.fromMark('cabo-trafalgar', S, 7, 'Situación verdadera 04:45');
      const { rc, ic } = k.corrienteDesconocida(e, o, 45);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2017-12-a-39': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 22,0 N', '6 14,0 W', 'Salida');
      const ct1 = k.ct({ dm: -3, desvio: 3 });
      const rv1 = k.rv(180, ct1);
      k.note('Viento del S', 'Navegando al S con viento del S, el viento entra por la proa y no nos abate.');
      k.note('Cabo Roche por el través de babor', 'Navegando al S, el través de babor está al E: Roche demora 090°.');
      const p = k.corteRumbo(s, rv1, 'cabo-roche', E, 'Situación 12:15');
      const ct2 = k.ct({ dm: -3, desvio: 1 });
      const rv2 = k.rv(132, ct2);
      const { ref } = k.efectivo(rv2, 12, 260, 3.5, p);
      return [...latlon(p), { kind: 'bearing', value: ref }];
    },
  },
  'bal-py-2017-12-a-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('36 07,2 N', '6 00,5 W', 'Situación 04:00');
      // Hacia el Estrecho por fuera de la costa: Punta Paloma queda a babor (al N).
      const rv = k.tangent(s, 'punta-paloma', 5, 'babor');
      const ct = k.ct({ carta: L105, anyo: 2017, desvio: 1 });
      const d1 = k.dv(92, ct, 'punta-paloma');
      const d2 = k.dv(19, ct, 'punta-paloma');
      const o = k.traslado('punta-paloma', d1, 'punta-paloma', d2, rv, k.distFor(12, 30), 'Situación 05:00');
      const e = k.run(s, rv, k.distFor(12, 60), 'Situación de estima 05:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, 60);
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  // ---- Abril de 2018
  'bal-py-2018-04-c-31': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -2 });
      const rv = k.rv(69, ct);
      const d1 = k.dvM(rv, 60, 'cabo-espartel');
      const d2 = k.dvM(rv, 120, 'cabo-espartel');
      return latlon(k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rv, k.distFor(12, 25), 'Situación 01:25'));
    },
  },
  'bal-py-2018-04-b-32': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 05,0 N', '5 20,0 W', 'Salida');
      const b = k.fromMark('punta-almina', E, 3, 'A 3 M al E/v de Almina');
      const { rv: rs } = k.rhumb(s, b);
      const rv = k.rvConAbatimiento(rs, 11, SW);
      const ct = k.ct({ dm: -2, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2018-04-b-33': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.pos('36 07,1 N', '6 02,6 W', 'Salida');
      const { rs } = k.rumboConCorriente(s, 'punta-malabata', 11, 100, 3.2);
      const rv = k.rvConAbatimiento(rs, 6, NE);
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-py-2018-04-a-34': {
    sinCarta: true,
    ejercicio: 'estima-analitica',
    solve(k) {
      const a = k.pos('25 50,0 N', '32 10,0 E', 'Punto A');
      const b = k.pos('27 40,0 N', '33 50,0 E', 'Punto B');
      return [{ kind: 'bearing', value: k.rumboDirecto(a, b).rumbo }];
    },
  },
  'bal-py-2018-04-b-34': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 43,0 W', 'Situación 12:00');
      // Hacia el Atlántico por el norte de Espartel: el cabo queda a babor (al S).
      const ref = k.tangent(s, 'cabo-espartel', 2, 'babor');
      const { rs } = k.rumboConCorriente(s, ref, 6, E, 3.2);
      const p1 = k.estimaEfectiva(s, ref, k.efectivo(rs, 6, E, 3.2).vef, 40, 'Situación 12:40');
      k.note('Sin corriente', `Seguimos al mismo rumbo (${Math.round(rs)}°) a 6 nudos hasta tener el espigón de Tánger por el través de babor: Dv = Rv − 90°.`);
      const p2 = k.corteRumbo(p1, rs, 'tanger-espigon', rs - 90, 'Tánger por el través');
      const rs2 = k.tangent(p2, 'cabo-espartel', 2, 'babor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs2, 10, NW) }];
    },
  },
  'bal-py-2018-04-b-35': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 52,0 W', 'Situación 18:00');
      const ct = k.ct({ ct: -1.5 });
      const rv = k.rv(82, ct);
      const rs = k.abatimiento(rv, 3, E);
      return latlon(k.run(s, rs, k.distFor(7, 90), 'Situación 19:30'));
    },
  },
  'bal-py-2018-04-a-36': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -2 });
      const rv = k.rv(69, ct);
      const d1 = k.dvM(rv, 60, 'cabo-espartel');
      const d2 = k.dvM(rv, 120, 'cabo-espartel');
      const s = k.traslado('cabo-espartel', d1, 'cabo-espartel', d2, rv, k.distFor(12, 25), 'Situación 01:25');
      // Hacia el E por el sur del Estrecho: Punta Cires queda a estribor.
      const rv2 = k.tangent(s, 'punta-cires', 3, 'estribor');
      const ct2 = k.ct({ carta: L105, anyo: 2018, desvio: -3 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv2, ct2) }];
    },
  },
  'bal-py-2018-04-b-36': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Salida');
      const { rv: rs } = k.rhumb(s, 'cabo-espartel');
      const rv = k.rvConAbatimiento(rs, 8, S);
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },

  'bal-py-2018-04-b-37': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(96, ct);
      k.note('Proa y través', 'Tarifa por la proa: Dv = Rv. Punta de Gracia, en la costa al N, por el través de babor: Dv = Rv − 90°.');
      const s = k.fix2('isla-tarifa', rv, 'punta-gracia', rv - 90, 'Situación 15:00');
      const { dv, dist } = k.bearingTo(s, 'punta-paloma');
      const m = ((dv - rv + 540) % 360) - 180;
      k.note('Marcación', `M = Dv − Rv = ${dv.toFixed(0)}° − ${rv.toFixed(0)}° = ${Math.abs(m).toFixed(0)}° por ${m >= 0 ? 'estribor' : 'babor'}.`);
      // Todas las opciones son por babor: se compara el valor de la marcación.
      return [{ kind: 'bearing', value: Math.abs(m) }, { kind: 'distance', value: dist }];
    },
  },
  'bal-py-2018-04-c-37': {
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
  'bal-py-2018-04-a-38': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -2 });
      k.note('Punta de Gracia por el través', 'Navegando al 270°, Punta de Gracia (en la costa, al N) queda por el través de estribor: Dv = 000°.');
      const s = k.fix2('punta-gracia', 0, 'isla-tarifa', k.dv(77, ct, 'isla-tarifa'), 'Situación 11:00');
      const { rs, vb } = k.rumboYVelocidad(s, 'tanger-espigon', 90, 82.5, 2);
      const rv = k.rvConAbatimiento(rs, 2, E);
      const ct2 = k.ct({ carta: L105, anyo: 2018, desvio: 2 });
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct2) }, { kind: 'speed', value: vb }];
    },
  },
  'bal-py-2018-04-a-39': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      k.note('Marcación de la Polar', 'La Polar (Dv 000°) a 70° por babor: Rv = 000° + 70° = 070°, y Ct = Rv − Ra = 070° − 078° = −8°.');
      const rv = 70;
      const dv = k.dvM(rv, 60, 'cabo-espartel');
      const s = k.fixDist('cabo-espartel', dv, 1.8, 'Situación 07:00');
      return latlon(k.run(s, rv, k.distFor(14, 15), 'Situación 07:15'));
    },
  },
  'bal-py-2018-04-a-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -4 });
      const rv = k.rv(231, ct);
      const rs = k.abatimiento(rv, 3, NW);
      const d1 = k.dv(276, ct, 'punta-europa');
      const d2 = k.dv(141, ct, 'punta-almina');
      const s = k.traslado('punta-europa', d1, 'punta-almina', d2, rs, k.distFor(12, 45), 'Situación 08:45');
      // Hacia el W por el centro del Estrecho: Tarifa queda a estribor (al N).
      const rs2 = k.tangent(s, 'isla-tarifa', 2, 'estribor');
      const e = k.run(s, rs2, k.distFor(12, 60), 'Situación de estima 09:45');
      const ct2 = k.ct({ carta: L105, anyo: 2018, desvio: -3 });
      const o = k.fix2('punta-europa', k.dv(60, ct2, 'punta-europa'), 'isla-tarifa', k.dv(353, ct2, 'isla-tarifa'), 'Situación verdadera 09:45');
      const { rc, ic } = k.corrienteDesconocida(e, o, 60);
      return [...latlon(o), { kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2018-04-c-40': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 43,0 W', 'Situación 12:00');
      // Hacia el Atlántico por el norte de Espartel: el cabo queda a babor (al S).
      const ref = k.tangent(s, 'cabo-espartel', 2, 'babor');
      const { rs } = k.rumboConCorriente(s, ref, 6, E, 3.2);
      const p1 = k.estimaEfectiva(s, ref, k.efectivo(rs, 6, E, 3.2).vef, 40, 'Situación 12:40');
      k.note('Sin corriente', `Seguimos al mismo rumbo (${Math.round(rs)}°) a 6 nudos hasta tener el espigón de Tánger por el través de babor: Dv = Rv − 90°.`);
      const p2 = k.corteRumbo(p1, rs, 'tanger-espigon', rs - 90, 'Tánger por el través');
      const rs2 = k.tangent(p2, 'cabo-espartel', 2, 'babor');
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs2, 10, NW) }];
    },
  },
  // ---- Junio de 2018
  'bal-py-2018-06-b-31': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -3 });
      const rv = k.rv(160, ct);
      const rs = k.abatimiento(rv, 5, S);
      const d1 = k.dvM(rv, -64, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -144, 'cabo-trafalgar');
      return latlon(k.traslado('cabo-trafalgar', d1, 'cabo-trafalgar', d2, rs, k.distFor(11, 45), 'Situación 07:45'));
    },
  },
  'bal-py-2018-06-b-32': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const ct = k.ct({ dm: -2.5, desvio: -0.5 });
      const rv = k.rv(253, ct);
      const s = k.fixDist('punta-europa', k.dvM(rv, 80, 'punta-europa'), 6, 'Situación 02:30');
      const t = hrb(4, 0) - hrb(2, 30);
      const e = k.run(s, rv, k.distFor(8.35, t), 'Situación de estima 04:00');
      const o = k.fix2('punta-cires', k.dv(183, ct, 'punta-cires'), 'punta-leona', k.dvM(rv, -109, 'punta-leona'), 'Situación verdadera 04:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2018-06-b-33': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const enf = k.enfilacion('punta-carnero', 'punta-europa');
      k.note('Situación de partida', 'En la enfilación, a 2 M del faro de Punta Europa por fuera (al E): desde Europa seguimos la línea de la enfilación 2 millas.');
      const s = k.fromMark('punta-europa', enf, 2, 'Situación 02:25');
      k.note('Corrección total', '«La del año en curso»: declinación de la carta llevada a 2018.');
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: -0.7 });
      const rv = k.rv(172, ct);
      const t = hrb(4, 12) - hrb(2, 25);
      const e = k.run(s, rv, k.distFor(5, t), 'Situación de estima 04:12');
      const o = k.fix2('punta-almina', 192, 'punta-carnero', 290, 'Situación verdadera 04:12');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }, ...latlon(o)];
    },
  },

  'bal-py-2018-06-b-36': {
    ejercicio: 'corriente-efectiva',
    solve(k) {
      const s = k.pos('36 22,0 N', '6 14,0 W', 'Salida');
      const ct1 = k.ct({ dm: -3, desvio: 3 });
      const rv1 = k.rv(180, ct1);
      k.note('Viento del S', 'Navegando al S con viento del S, el viento entra por la proa y no nos abate.');
      k.note('Cabo Roche por el través de babor', 'Navegando al S, el través de babor está al E: Roche demora 090°.');
      const p = k.corteRumbo(s, rv1, 'cabo-roche', E, 'Situación 12:15');
      const ct2 = k.ct({ dm: -3, desvio: 1 });
      const rv2 = k.rv(132, ct2);
      const { ref } = k.efectivo(rv2, 12, 260, 3.5, p);
      return [...latlon(p), { kind: 'bearing', value: ref }];
    },
  },
  'bal-py-2018-06-a-37': {
    ejercicio: 'demoras-no-simultaneas',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2018, desvio: 6 });
      const rv = k.rv(335, ct);
      const rs = k.abatimiento(rv, 8, W);
      const d1 = k.dv(305, ct, 'punta-almina');
      k.note('Través de babor', 'El través se mide desde la proa, es decir, desde el Rv: Dv = Rv − 90°.');
      const d2 = k.dvM(rv, -90, 'punta-almina');
      const m = k.distFor(8, 45);
      return latlon(k.traslado('punta-almina', d1, 'punta-almina', d2, rs, m, 'Situación 04:45'));
    },
  },
  'bal-py-2018-06-b-39': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const s = k.fix2Ranges('cabo-roche', 3, 'cabo-trafalgar', 7, { lat: 36.25, lon: -6.25 }, 'Situación 10:00');
      const ct = k.ct({ dm: -3, desvio: -2 });
      const rv = k.rv(185, ct);
      k.note('Trafalgar por el través de babor', 'Navegando al S, el través de babor está al E: Trafalgar demora 090°.');
      const p = k.corteRumbo(s, rv, 'cabo-trafalgar', E, 'Situación 10:30');
      const d = k.distanceBetween(s, p);
      const vb = d / 0.5;
      k.note('Velocidad del barco', `De 10:00 a 10:30 hemos navegado ${d.toFixed(2).replace('.', ',')} M: Vb = ${vb.toFixed(1).replace('.', ',')} nudos.`);
      const x = k.pos('36 09,3 N', '6 02,7 W', 'Punto X');
      const { rs, vef, dist } = k.rumboConCorriente(p, x, vb, 260, 4);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      k.eta(hrb(10, 30), dist, vef);
      // Las opciones escriben la hora como «1155», que el lector no reconoce: se compara solo el Rv (sale 11:55, la de la b).
      return [{ kind: 'bearing', value: rs }];
    },
  },
  'bal-py-2018-06-b-40': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -0.5 });
      const s = k.fixBearingRange('punta-europa', k.dv(333.5, ct, 'punta-europa'), 'punta-almina', 7.5, 0, 'Situación 13:25');
      const t = hrb(14, 40) - hrb(13, 25);
      const e = k.run(s, 250, k.distFor(10, t), 'Situación de estima 14:40');
      const o = k.fix2('isla-tarifa', k.dv(272.5, ct, 'isla-tarifa'), 'punta-cires', k.dv(183.5, ct, 'punta-cires'), 'Situación verdadera 14:40');
      const { rc, ic } = k.corrienteDesconocida(e, o, t);
      const d = k.distanceBetween(s, o);
      const vef = d / (t / 60);
      k.note('Velocidad efectiva', `Lo realmente recorrido entre las dos situaciones: ${d.toFixed(2).replace('.', ',')} M en ${t} min → Vef = ${vef.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }, { kind: 'speed', value: vef }];
    },
  },

  // ---- Diciembre de 2018


  'bal-py-2018-12-a-32': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      k.note('Corte', 'De los dos cortes de los arcos nos quedamos con el del centro del Estrecho (en el DST), no con el de la costa.');
      return latlon(k.fix2Ranges('punta-almina', 10.5, 'punta-carnero', 5, { lat: 35.95, lon: -5.5 }));
    },
  },
  'bal-py-2018-12-a-33': {
    ejercicio: 'corriente-rumbo-a-dar',
    solve(k) {
      const { rs, vb } = k.rumboYVelocidad('barbate-espigon', 'tanger-espigon', 200, 100, 1.5);
      k.note('Rumbo verdadero', 'Sin viento no hay abatimiento: el Rv es el mismo rumbo de superficie.');
      const ct = k.ct({ dm: 3, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rs, ct) }, { kind: 'speed', value: vb }];
    },
  },

  'bal-py-2018-12-b-35': {
    ejercicio: 'corriente-desconocida',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 09:00');
      const ct = k.ct({ ct: -8 });
      const rv = k.rv(56, ct);
      const e = k.run(s, rv, k.distFor(5, 120), 'Situación de estima 11:00');
      const o = k.fix2('punta-malabata', k.dv(107, ct, 'punta-malabata'), 'cabo-espartel', k.dv(176, ct, 'cabo-espartel'), 'Situación verdadera 11:00');
      const { rc, ic } = k.corrienteDesconocida(e, o, 120);
      return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
    },
  },
  'bal-py-2018-12-b-36': {
    ejercicio: 'abatimiento',
    solve(k) {
      const s = k.pos('35 58,0 N', '5 42,7 W', 'Salida');
      const b = k.fromMark('punta-malabata', N, 3, 'A 3 M al N/v de Malabata');
      const { rv: rs } = k.rhumb(s, b);
      return [{ kind: 'bearing', value: k.rvConAbatimiento(rs, 3, W) }];
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
 * 'bal-py-2017-12-b-32' (faltan datos: tabla de mareas): hora de sonda 11 m en Navia el 23-06-2017; la pregunta no trae la tabla del Anuario. Oficial: a (11:43 UT).
 * 'bal-py-2018-04-a-31' (faltan datos: tabla de mareas): sonda en Cádiz el 09-04-2018 a las 12:00 UT; la pregunta no trae la tabla del Anuario. Oficial: c (5,15 m).
 * 'bal-py-2018-04-a-32' (elemento que no está en la carta de la app): la Ct sale de la enfilación «Magair – Cabo Espartel», y ese punto no está en la carta de la app ni el enunciado da sus coordenadas. Oficial: b (35° 51,8′ N 5° 50,0′ W).
 * 'bal-py-2018-04-c-33' (opciones con formato que el lector no reconoce): las opciones escriben «35-53,2N», «05-55,4 W». Sale 35° 53,3′ N 5° 55,4′ W y Ra a Tarifa 061°, la oficial a.
 *   Código que la resuelve:
 *     'bal-py-2018-04-c-33': {
 *       ejercicio: 'demoras-no-simultaneas',
 *       solve(k) {
 *         const ct = k.ctPolar(3);
 *         const rv = k.rv(83, ct);
 *         const rs = k.abatimiento(rv, 5, NE);
 *         const d1 = k.dvM(rv, 40, 'cabo-espartel');
 *         const d2 = k.dvM(rv, -37, 'punta-paloma');
 *         const o = k.traslado('cabo-espartel', d1, 'punta-paloma', d2, rs, k.distFor(15, 35), 'Situación 21:35');
 *         const { rv: rs2 } = k.rhumb(o, 'isla-tarifa');
 *         const rv2 = k.rvConAbatimiento(rs2, 3, NE);
 *         const ct2 = k.ctPolar(358);
 *         return [...latlon(o), { kind: 'bearing', value: k.ra(rv2, ct2) }];
 *       },
 *     },
 * 'bal-py-2018-04-a-35' (faltan datos: tabla de mareas): Santander el 23-05-2018; la pregunta no trae la tabla del Anuario. Oficial: b (07:01).
 * 'bal-py-2018-04-a-37' (opciones con formato que el lector no reconoce): la oficial escribe «36º 04'6' N». Con Ct = +2° (Polar), Rv 192°, Rs 198°, marcación de Europa 40° Er y Da 313° trasladada 5 M sale 36° 04,7′ N 5° 18,2′ W, la oficial a; el lector, sin poder leer la a, elige la b.
 *   Código que la resuelve:
 *     'bal-py-2018-04-a-37': {
 *       ejercicio: 'demoras-no-simultaneas',
 *       solve(k) {
 *         const ct = k.ctPolar(358);
 *         const rv = k.rv(190, ct);
 *         const rs = k.abatimiento(rv, 6, NE);
 *         const d1 = k.dvM(rv, 40, 'punta-europa');
 *         const d2 = k.dv(313, ct, 'punta-europa');
 *         return latlon(k.traslado('punta-europa', d1, 'punta-europa', d2, rs, k.distFor(10, 30), 'Situación 20:30'));
 *       },
 *     },
 * 'bal-py-2018-04-b-38' (faltan datos: tabla de mareas): Llanes el 12-04-2018; la pregunta no trae la tabla del Anuario. Oficial: d (6,42 m).
 * 'bal-py-2018-04-b-39' (elemento que no está en la carta de la app): pregunta en qué vía del DST estaremos, y el dispositivo de separación de tráfico no está en la carta de la app. Oficial: b (vía hacia el Mediterráneo).
 * 'bal-py-2018-04-b-40' (elemento que no está en la carta de la app): la situación observada usa la demora a la cima de San Bartolomé, que no está en la carta de la app (el enunciado no da sus coordenadas). Oficial: c (Rc 078,5°, Ihc 1,95 nudos).
 * 'bal-py-2018-06-a-32' (opciones con formato que el lector no reconoce): es la misma pregunta que bal-py-2017-03-a-32, con opciones «35º-57' N», «005º-21,6' W». Sale 35° 57,0′ N 5° 21,5′ W, la oficial d. El código es el de bal-py-2017-03-a-32.
 * 'bal-py-2018-06-a-33' (faltan datos: tabla de mareas): Conil el 28-06-2018; la pregunta no trae la tabla del Anuario. Oficial: b (7,64 m).
 * 'bal-py-2018-06-a-36' (opciones con formato que el lector no reconoce): la oficial escribe «35º-54,6' N», «005º-54,0' W». Con Ct = −3° (Polar), Rv 080°, Rs 085°, traslado de 11,7 M y Ra a Tarifa con la dm de 2018 y desvío +3,5° sale 35° 54,5′ N 5° 53,9′ W y Ra 063°, la oficial b; el lector, sin poder leer la b, elige la a.
 *   Código que la resuelve:
 *     'bal-py-2018-06-a-36': {
 *       ejercicio: 'demoras-no-simultaneas',
 *       solve(k) {
 *         const ct = k.ctPolar(3);
 *         const rv = k.rv(83, ct);
 *         const rs = k.abatimiento(rv, 5, NE);
 *         const d1 = k.dvM(rv, 40, 'cabo-espartel');
 *         const d2 = k.dvM(rv, -37, 'punta-paloma');
 *         const o = k.traslado('cabo-espartel', d1, 'punta-paloma', d2, rs, k.distFor(20, 35), 'Situación 21:35');
 *         const { rv: rs2 } = k.rhumb(o, 'isla-tarifa');
 *         const rv2 = k.rvConAbatimiento(rs2, 3, NE);
 *         const ct2 = k.ct({ carta: L105, anyo: 2018, desvio: 3.5 });
 *         return [...latlon(o), { kind: 'bearing', value: k.ra(rv2, ct2) }];
 *       },
 *     },
 * 'bal-py-2018-06-b-37' (elemento que no está en la carta de la app): la situación a las 12:00 sale (36° 00′ N 6° 00,0′ W, la de la oficial a), pero la pregunta también pide cuántas veces pasamos por sondas de más de 100 m, y las isobáticas no están en la carta de la app; a y b solo se distinguen por la situación, pero no publicamos media respuesta.
 *   Código que la resuelve:
 *     'bal-py-2018-06-b-37': {
 *       ejercicio: 'corriente-efectiva',
 *       solve(k) {
 *         const s = k.pos('36 00,0 N', '6 10,0 W', 'Situación 09:00');
 *         k.note('Sin máquina', 'Con el motor parado solo nos mueve la corriente: 3 h al 090° a 2,7 nudos.');
 *         return latlon(k.run(s, E, k.distFor(2.7, 180), 'Situación 12:00'));
 *       },
 *     },
 * 'bal-py-2018-06-b-38' (faltan datos: tabla de mareas): Cádiz el 16-08-2018; la pregunta no trae la tabla del Anuario. Oficial: b (4,4 m).
 * 'bal-py-2018-12-a-31' (opciones con formato que el lector no reconoce): misma pregunta que bal-py-2018-06-a-36 (opciones «35º-54,6' N»). Sale 35° 54,5′ N 5° 53,9′ W y Ra 063°, la oficial d (064°). El código es el de bal-py-2018-06-a-36.
 *   Código que la resuelve:
 *     'bal-py-2018-12-a-31': {
 *       ejercicio: 'demoras-no-simultaneas',
 *       solve(k) {
 *         const ct = k.ctPolar(3);
 *         const rv = k.rv(83, ct);
 *         const rs = k.abatimiento(rv, 5, NE);
 *         const d1 = k.dvM(rv, 40, 'cabo-espartel');
 *         const d2 = k.dvM(rv, -37, 'punta-paloma');
 *         const o = k.traslado('cabo-espartel', d1, 'punta-paloma', d2, rs, k.distFor(20, 35), 'Situación 21:35');
 *         const { rv: rs2 } = k.rhumb(o, 'isla-tarifa');
 *         const rv2 = k.rvConAbatimiento(rs2, 3, NE);
 *         const ct2 = k.ct({ carta: L105, anyo: 2018, desvio: 3.5 });
 *         return [...latlon(o), { kind: 'bearing', value: k.ra(rv2, ct2) }];
 *       },
 *     },
 * 'bal-py-2018-12-b-31' (opciones con formato que el lector no reconoce): las opciones escriben «35º 51'4 N». Con Ct = −6,3°, Rv 226,7°, Rs 221,7° y 12 M sale 35° 51,1′ N 6° 09,8′ W, la oficial c.
 *   Código que la resuelve:
 *     'bal-py-2018-12-b-31': {
 *       ejercicio: 'abatimiento',
 *       solve(k) {
 *         const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 15:30');
 *         const ct = k.ct({ carta: L105, anyo: 2018, desvio: -5 });
 *         const rv = k.rv(233, ct);
 *         const rs = k.abatimiento(rv, 5, W);
 *         return latlon(k.run(s, rs, k.distFor(6, 120), 'Situación 17:30'));
 *       },
 *     },
 * 'bal-py-2018-12-a-34' (sin margen frente a otra opción): sale Rc 069,8° e Ihc 2,6 nudos. La oficial a (072°, 2,6) es la más próxima, pero la c (070°, 1,5) queda a menos del doble de distancia y el comprobador del PY exige que la oficial gane con claridad. Puede deberse a la Ct (dato «3º» sin signo, tomado como +3°).
 *   Código que la resuelve:
 *     'bal-py-2018-12-a-34': {
 *       ejercicio: 'corriente-desconocida',
 *       solve(k) {
 *         const s = k.pos('35 54,0 N', '5 40,0 W', 'Situación 16:15');
 *         const ct = k.ct({ ct: 3 });
 *         const rv = k.rv(68, ct);
 *         const t = hrb(18, 0) - hrb(16, 15);
 *         const e = k.run(s, rv, k.distFor(11, t), 'Situación de estima 18:00');
 *         const o = k.fix2('punta-europa', k.dv(303, ct, 'punta-europa'), 'punta-almina', k.dv(202, ct, 'punta-almina'), 'Situación verdadera 18:00');
 *         const { rc, ic } = k.corrienteDesconocida(e, o, t);
 *         return [{ kind: 'bearing', value: rc }, { kind: 'speed', value: ic }];
 *       },
 *     },
 * 'bal-py-2018-12-a-36' (faltan datos: tabla de mareas): Algeciras el 06-06-2018; la pregunta no trae la tabla del Anuario. Oficial: c (6,70 m).
 */

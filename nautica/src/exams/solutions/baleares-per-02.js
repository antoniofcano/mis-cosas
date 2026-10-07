// Soluciones programadas de carta del PER de Baleares (lote 02). Ver baleares-per.js para el formato.
// Resumen del lote (109 preguntas): 92 resueltas y comprobadas (bal-per-2019-12-c-43 da, como la oficial «Ev», la
//   demora del barco vista desde el faro); 17 en `documentadas`, todas 'sin-calculo' (16 usan elementos que no están en la carta de la app: isóbatas, sondas, naufragios, montes,
//   marcas, DST, puertos; a 1 le falta la hora de salida). En 3 de las resueltas la hora se desvía de la oficial
//   (4–7 min) aunque el resto cuadra: se indica en cada una.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];
const f1 = (x) => x.toFixed(1).replace('.', ',');

export default {
  'bal-per-2019-04-a-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dvE = k.oposicion('punta-almina', 'punta-europa');
      const ct = k.ctFrom(dvE, 357);
      const dvC = k.dv(330, ct, 'punta-carnero');
      const s = k.fix2('punta-europa', dvE, 'punta-carnero', dvC, 'Situación 14:00');
      const { rv } = k.rhumb(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2019-04-b-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 01,4 N', '5 19,2 W', 'Salida');
      // Pasamos por el oeste de Punta Europa rumbo al NW: el faro queda por estribor.
      const rv = k.tangent(s, 'punta-europa', 1.8, 'estribor');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2019-04-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dC = k.dvM(257, 35, 'punta-carnero');
      const dA = k.dvM(257, -90, 'punta-almina');
      const s = k.fix2('punta-carnero', dC, 'punta-almina', dA, 'Situación 07:24');
      const p = k.fromMark('isla-tarifa', 135, 3, 'A 3 millas al SE de Isla de Tarifa');
      const { dist } = k.rhumb(s, p);
      return [{ kind: 'clock', value: k.eta(hrb(7, 24), dist, 7) }];
    },
  },
  'bal-per-2019-04-e-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 50,0 W', 'Situación 15:45');
      // Bajamos hacia el SW por fuera del cabo: Espartel queda por babor.
      const rv = k.tangent(s, 'cabo-espartel', 3, 'babor');
      const t = k.corteRumbo(s, rv, 'cabo-espartel', rv - 90, 'Espartel por el través');
      return [{ kind: 'clock', value: k.eta(hrb(15, 45), k.distanceBetween(s, t), 12) }];
    },
  },
  'bal-per-2019-04-f-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const s = k.lineAndBearing('punta-carnero', op, 'punta-alcazar', enf, 'Situación 20:00');
      const { dv, dist } = k.bearingTo(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: dv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-per-2019-04-b-45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // Estamos al SE de Trafalgar, sobre la prolongación de la enfilación: Trafalgar demora hacia Roche.
      const dvT = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
      const ct = k.ctFrom(dvT, 330);
      const dvP = k.dv(75, ct, 'punta-paloma');
      return latlon(k.lineAndBearing('cabo-trafalgar', dvT, 'punta-paloma', dvP));
    },
  },
  'bal-per-2019-04-e-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const dvT = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const s = k.lineAndBearing('cabo-trafalgar', dvT, 'barbate-faro', 340, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'cabo-espartel');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 1.2 });
      const t = hrb(17, 0) - hrb(15, 0);
      const v = dist / (t / 60);
      k.note('Distancia y velocidad', `Para llegar en 2 h: V = ${dist.toFixed(1).replace('.', ',')} / 2 = ${v.toFixed(1).replace('.', ',')} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2019-04-f-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('punta-alcazar', 'isla-tarifa');
      k.note('Demora de Punta Cires', 'Al W verdadero de Punta Cires: desde el barco el faro demora 090°.');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-cires', 90, 'Situación 10:00');
      const ct = k.ct({ dm: -2, desvio: 4 });
      const rv = k.rv(75, ct);
      const p = k.corteRumbo(s, rv, 'punta-almina', 180, 'Situación al S verdadero de Punta Almina');
      return [{ kind: 'clock', value: k.eta(hrb(10, 0), k.distanceBetween(s, p), 9) }];
    },
  },
  'bal-per-2019-06-b-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-gracia', 180, 3, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ dm: -2, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(15, 0), dist, 7.5) }];
    },
  },
  'bal-per-2019-06-b-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 12:00');
      const rv = k.rv(345, k.ct({ ct: -15 }));
      const p = k.corteRumbo(s, rv, 'punta-gracia', rv + 90, 'Punta de Gracia por el través de estribor');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), k.distanceBetween(s, p), 8) }];
    },
  },
  'bal-per-2019-06-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: 0, desvio: 6 });
      const rv = k.rv(250, ct);
      const d1 = k.dvM(rv, 13, 'isla-tarifa');
      const d2 = k.dvM(rv, -55, 'punta-cires');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-cires', d2));
    },
  },
  'bal-per-2019-06-b-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dvT = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
      const ct = k.ctFrom(dvT, 330);
      const dvP = k.dv(75, ct, 'punta-paloma');
      return latlon(k.lineAndBearing('cabo-trafalgar', dvT, 'punta-paloma', dvP));
    },
  },
  'bal-per-2019-06-c-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dvE = k.oposicion('punta-almina', 'punta-europa');
      const ct = k.ctFrom(dvE, 357);
      const dvC = k.dv(330, ct, 'punta-carnero');
      const s = k.fix2('punta-europa', dvE, 'punta-carnero', dvC, 'Situación 14:00');
      const { rv } = k.rhumb(s, 'isla-tarifa');
      return [...latlon(s), { kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2019-06-e-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ ct: -4 });
      const d1 = k.dv(4, ct, 'barbate-faro');
      const d2 = k.dv(94, ct, 'punta-paloma');
      const s = k.fix2('barbate-faro', d1, 'punta-paloma', d2);
      // Rumbo al NW por fuera del cabo: Trafalgar queda por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 4, 'estribor');
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2019-09-b-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const { dv, dist } = k.bearingTo('isla-tarifa', 'punta-alcazar');
      k.note('Punto medio de la oposición', 'Desde Isla de Tarifa medimos la mitad de la distancia hacia Punta Alcázar.');
      const s = k.run(k.P('isla-tarifa'), dv, dist / 2, 'Situación 16:34');
      // Rumbo al E dejando Almina por estribor (pasamos al norte de Ceuta).
      const rv = k.tangent(s, 'punta-almina', 5, 'estribor');
      const d = k.distFor(9, hrb(18, 12) - hrb(16, 34));
      return latlon(k.run(s, rv, d, 'Situación 18:12'));
    },
  },
  'bal-per-2019-09-d-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const o1 = k.oposicion('punta-malabata', 'cabo-trafalgar');
      // «Pta Camarinal»: el faro de Camarinal (punta-gracia).
      const o2 = k.oposicion('cabo-espartel', 'punta-gracia');
      const s = k.lineAndBearing('cabo-trafalgar', o1, 'punta-gracia', o2, 'Situación 10:00');
      const o3 = k.oposicion('punta-alcazar', 'punta-paloma');
      const p = k.fixBearingRange('punta-paloma', o3, 'punta-cires', 6, 0, 'Segunda situación');
      const { rv, dist } = k.rhumb(s, p);
      const ct = k.ct({ ct: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(10, 0), dist, 3.5) }];
    },
  },
  'bal-per-2019-09-c-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', 90, 2, 'Situación 19:50');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(19, 50), dist, 5) }];
    },
  },
  'bal-per-2019-09-d-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 04,0 N', '5 15,0 W');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: -3 });
      const rv = k.rv(52, ct);
      const { dv } = k.bearingTo(s, 'punta-europa');
      const m = ((dv - rv + 540) % 360) - 180;
      k.note('Línea de posición: Marcación', `M = Dv − Rv = ${dv.toFixed(1).replace('.', ',')}° − ${rv.toFixed(1).replace('.', ',')}° = ${Math.abs(m).toFixed(1).replace('.', ',')}° ${m < 0 ? 'babor' : 'estribor'}.`);
      return [{ kind: 'bearing', value: Math.abs(m) }];
    },
  },
  'bal-per-2019-09-a-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const o1 = k.oposicion('punta-cires', 'punta-europa');
      const o2 = k.oposicion('punta-almina', 'punta-carnero');
      const s = k.lineAndBearing('punta-europa', o1, 'punta-carnero', o2, 'Situación inicial');
      const rv = k.rv(243, k.ct({ dm: -1.1, desvio: 1.8 }));
      return latlon(k.run(s, rv, k.distFor(2.5, 240), 'Situación final'));
    },
  },
  'bal-per-2019-09-c-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ ct: -3 });
      const rv = k.rv(120, ct);
      const d1 = k.dv(333, ct, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -97, 'barbate-faro');
      return latlon(k.fix2('cabo-trafalgar', d1, 'barbate-faro', d2));
    },
  },
  'bal-per-2019-09-d-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('punta-gracia', 'cabo-trafalgar');
      k.note('Demora de Barbate', 'Al S verdadero del faro de Barbate: desde el barco el faro demora 000°.');
      const s = k.lineAndBearing('cabo-trafalgar', op, 'barbate-faro', 0, 'Situación 14:36');
      const { rv } = k.rhumb(s, 'tanger-espigon');
      const { dist } = k.bearingTo(s, 'tanger-espigon');
      const v = dist / ((hrb(16, 48) - hrb(14, 36)) / 60);
      k.note('Distancia y velocidad', `Para llegar a las 16:48 (2 h 12 min): V = ${f1(dist)} / 2,2 = ${f1(v)} nudos.`);
      const p = k.corteRumbo(s, rv, 'isla-tarifa', 90, 'Isla de Tarifa al E');
      return [{ kind: 'clock', value: k.eta(hrb(14, 36), k.distanceBetween(s, p), v) }];
    },
  },
  'bal-per-2019-12-c-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const a = k.pos('36 05,0 N', '5 50,0 W', 'Situación A, a las 09:02');
      const b = k.pos('35 54,4 N', '5 40,0 W', 'B');
      const { rv, dist } = k.rhumb(a, b);
      const ct = k.ct({ dm: -(1 + 40 / 60), desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(9, 2), dist, 12) }];
    },
  },
  'bal-per-2019-12-e-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const s1 = k.fix2('punta-europa', 30, 'punta-almina', 140, 'Situación 20:00');
      const d1 = k.dvM(254, 156, 'isla-tarifa');
      const d2 = k.dvM(254, -112, 'punta-alcazar');
      const s2 = k.fix2('isla-tarifa', d1, 'punta-alcazar', d2, 'Situación 21:20');
      const d = k.distanceBetween(s1, s2);
      const v = d / (80 / 60);
      k.note('Distancia y velocidad', `En 1 h 20 min hemos recorrido ${f1(d)} millas: V = ${f1(d)} / 1,33 = ${f1(v)} nudos.`);
      // Solo se comparan las situaciones: el lector de opciones toma el «21» de «(21:20h)» como velocidad.
      // La velocidad (9,9 nudos) también coincide con la oficial (10,1).
      return [...latlon(s1), ...latlon(s2)];
    },
  },
  'bal-per-2019-12-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: 10 });
      const rv = k.rv(84, ct);
      const d1 = k.dvM(rv, 133, 'punta-cires');
      const d2 = k.dv(132, ct, 'punta-almina');
      return latlon(k.fix2('punta-cires', d1, 'punta-almina', d2));
    },
  },
  'bal-per-2019-12-d-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const o1 = k.oposicion('punta-cires', 'punta-europa');
      const o2 = k.oposicion('punta-almina', 'punta-carnero');
      const s = k.lineAndBearing('punta-europa', o1, 'punta-carnero', o2, 'Situación inicial');
      const rv = k.rv(243, k.ct({ dm: -1.3, desvio: 1.8 }));
      return latlon(k.run(s, rv, k.distFor(2.5, 240), 'Situación final'));
    },
  },
  'bal-per-2019-12-e-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dC = k.dvM(257, 35, 'punta-carnero');
      const dA = k.dvM(257, -90, 'punta-almina');
      const s = k.fix2('punta-carnero', dC, 'punta-almina', dA, 'Situación 07:24');
      const p = k.fromMark('isla-tarifa', 135, 3, 'A 3 millas al SE de Isla de Tarifa');
      const { dist } = k.rhumb(s, p);
      return [{ kind: 'clock', value: k.eta(hrb(7, 24), dist, 7) }];
    },
  },
  'bal-per-2020-07-d-42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const enf = k.enfilacion('isla-tarifa', 'punta-paloma');
      k.note('Demora de Punta Alcázar', 'Al N verdadero de Punta Alcázar: desde el barco el faro demora 180°.');
      const s = k.lineAndBearing('isla-tarifa', enf, 'punta-alcazar', 180);
      return [{ kind: 'bearing', value: k.bearingTo(s, 'punta-carnero').dv }];
    },
  },
  'bal-per-2020-07-e-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: 1 });
      const rv = k.rv(150, ct);
      const d1 = k.dv(15, ct, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -105, 'barbate-faro');
      return latlon(k.fix2('cabo-trafalgar', d1, 'barbate-faro', d2, 'Situación 08:00'));
    },
  },
  'bal-per-2020-07-espbn-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 51,9 N', '5 50,0 W', 'Salida');
      const rv = k.tangent(s, 'punta-cires', 4, 'estribor');
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2020-07-ah-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 19:00');
      const rv = k.rv(82, k.ct({ dm: -2, desvio: 9 }));
      return latlon(k.run(s, rv, k.distFor(8, 90), 'Situación 20:30'));
    },
  },
  'bal-per-2020-07-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -4 });
      const rv = k.rv(297, ct);
      k.note('Línea de posición: Marcaciones', 'Marcaciones contadas de 0° a 360° desde la proa hacia estribor: 275° = 85° Br y 225° = 135° Br.');
      const d1 = k.dvM(rv, -85, 'cabo-espartel');
      const d2 = k.dvM(rv, -135, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2));
    },
  },
  'bal-per-2020-07-d-43': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const op = k.oposicion('punta-gracia', 'cabo-trafalgar');
      k.note('Destino: el faro de Barbate', 'Es el faro de Barbate.');
      return latlon(k.fixBearingRange('cabo-trafalgar', op, 'barbate-faro', 2.7, 0, 'Boya cardinal S'));
    },
  },
  'bal-per-2020-07-e-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 12:00');
      const rv = k.rv(345, k.ct({ ct: -15 }));
      const p = k.corteRumbo(s, rv, 'punta-gracia', rv + 90, 'Punta de Gracia por el través de estribor');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), k.distanceBetween(s, p), 8) }];
    },
  },
  'bal-per-2020-07-espf-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      k.note('Tres distancias', 'Basta con dos arcos (Almina y Carnero, 8 millas); la distancia a Punta Europa (6 millas) decide cuál de los dos cortes vale.');
      const s = k.fix2Ranges('punta-almina', 8, 'punta-carnero', 8, k.P('punta-europa'), 'Situación 11:23');
      const p = k.fromMark('isla-tarifa', 225, 3, 'A 3 millas al SW de Isla de Tarifa');
      const { rv } = k.rhumb(s, p);
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -2, desvio: -5 })) }];
    },
  },
  'bal-per-2020-07-d-44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const { dv, dist } = k.bearingTo('isla-tarifa', 'punta-alcazar');
      const s = k.run(k.P('isla-tarifa'), dv, dist / 2, 'Situación 16:34');
      const rv = k.tangent(s, 'punta-almina', 5, 'estribor');
      return latlon(k.run(s, rv, k.distFor(9, hrb(18, 12) - hrb(16, 34)), 'Situación 18:12'));
    },
  },
  'bal-per-2020-07-e-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const rv = k.rv(201, k.ct({ dm: -2, desvio: -3 }));
      const d1 = k.dvM(rv, 100, 'punta-carbonera');
      const d2 = k.dvM(rv, 20, 'punta-europa');
      const s = k.fix2('punta-carbonera', d1, 'punta-europa', d2, 'Situación 07:00');
      const { rv: r2, dist } = k.rhumb(s, 'ceuta-bocana');
      const ra = k.ra(r2, k.ct({ dm: -2, desvio: -2 }));
      return [{ kind: 'bearing', value: ra }, { kind: 'clock', value: k.eta(hrb(7, 0), dist, 11) }];
    },
  },
  'bal-per-2020-07-ah-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(96, k.ct({ dm: -2, desvio: -4 }));
      const d1 = k.dvM(rv, 0, 'punta-paloma');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      return latlon(k.fix2('punta-paloma', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2020-07-d-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 59,3 N', '5 28,8 W', 'Salida');
      const p = k.run(s, 260, k.distFor(10, 90));
      const { rv } = k.rhumb(p, 'tanger-espigon');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: 2.5 })) }];
    },
  },
  'bal-per-2020-07-e-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const dC = k.dvM(257, 35, 'punta-carnero');
      const dA = k.dvM(257, -90, 'punta-almina');
      const s = k.fix2('punta-carnero', dC, 'punta-almina', dA, 'Situación 07:24');
      const p = k.fromMark('isla-tarifa', 135, 3, 'A 3 millas al SE de Isla de Tarifa');
      const { dist } = k.rhumb(s, p);
      return [{ kind: 'clock', value: k.eta(hrb(7, 24), dist, 7) }];
    },
  },
  'bal-per-2020-07-espf-45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -1 });
      const d1 = k.dv(171, ct, 'cabo-espartel');
      const d2 = k.dv(126, ct, 'punta-malabata');
      const s = k.fix2('cabo-espartel', d1, 'punta-malabata', d2);
      const p = k.run(s, k.rv(61, ct), 10);
      return [{ kind: 'bearing', value: k.bearingTo(p, 'punta-alcazar').dv }];
    },
  },
  'bal-per-2020-10-a-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(90, k.ct({ dm: -4, desvio: 4 }));
      const d1 = k.dvM(rv, 0, 'cabo-trafalgar');
      const d2 = k.dvM(rv, -90, 'cabo-roche');
      return latlon(k.fix2('cabo-trafalgar', d1, 'cabo-roche', d2));
    },
  },
  'bal-per-2020-10-e-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      // De los dos cortes nos quedamos con el del sur: en el DST la vía de navegación hacia el E es la más próxima a la costa africana.
      const s = k.fix2Ranges('punta-cires', 6, 'isla-tarifa', 5, k.P('punta-alcazar'), 'Situación 23:20');
      const rv = k.rv(65, k.ct({ dm: 3, desvio: 2 }));
      return latlon(k.run(s, rv, k.distFor(8, 90), 'Situación 00:50'));
    },
  },
  'bal-per-2020-10-i-42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-carnero', 90, 2, 'Situación 19:50');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(19, 50), dist, 5) }];
    },
  },
  'bal-per-2020-10-b-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const rv = k.rv(147, k.ct({ dm: 3, desvio: -1.6 }));
      const d1 = k.dvM(rv, -42, 'punta-gracia');
      const d2 = k.dvM(rv, -22, 'punta-alcazar');
      const s = k.fix2('punta-gracia', d1, 'punta-alcazar', d2);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'isla-tarifa') }];
    },
  },
  'bal-per-2020-10-d-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 50,0 W', 'Situación 15:45');
      const rv = k.tangent(s, 'cabo-espartel', 3, 'babor');
      const t = k.corteRumbo(s, rv, 'cabo-espartel', rv - 90, 'Espartel por el través');
      return [{ kind: 'clock', value: k.eta(hrb(15, 45), k.distanceBetween(s, t), 12) }];
    },
  },
  'bal-per-2020-10-f-43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const d1 = k.dvM(66.6, 0, 'punta-paloma');
      const d2 = k.dvM(66.6, 66.6, 'punta-malabata');
      const s = k.fix2('punta-paloma', d1, 'punta-malabata', d2, 'Situación 06:16');
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: -6.66 });
      const rv = k.rv(66.6, ct);
      return [...latlon(k.run(s, rv, 6.66, 'Situación 07:16')), { kind: 'bearing', value: rv }];
    },
  },
  'bal-per-2020-10-i-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-gracia', 180, 3, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ dm: -2, desvio: -2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(15, 0), dist, 7.5) }];
    },
  },
  'bal-per-2020-10-a-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const e1 = k.enfilacion('punta-carnero', 'punta-europa');
      const e2 = k.enfilacion('cabo-negro', 'punta-almina');
      const s = k.lineAndBearing('punta-europa', e1, 'punta-almina', e2, 'Situación 12:00');
      const { dist } = k.rhumb(s, 'ceuta-bocana');
      return [{ kind: 'clock', value: k.eta(hrb(12, 0), dist, 20) }];
    },
  },
  'bal-per-2020-10-d-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2Ranges('cabo-trafalgar', 5, 'cabo-roche', 10, k.pos('36 10,0 N', '6 20,0 W', 'Al W de la costa'), 'Situación 16:21');
      const rv = k.rv(198, k.ct({ carta: L105, anyo: 2020, desvio: 3 }));
      return latlon(k.run(s, rv, k.distFor(5.5, 180), 'Situación 19:21'));
    },
  },
  'bal-per-2020-10-f-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 00,0 W', 'Salida');
      const rv = k.rv(75, k.ct({ dm: -2, desvio: 6 }));
      return latlon(k.run(s, rv, k.distFor(12, 45), 'Situación a los 45 min'));
    },
  },
  'bal-per-2020-10-d-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const dvT = k.oposicion('punta-gracia', 'cabo-trafalgar');
      const s = k.lineAndBearing('cabo-trafalgar', dvT, 'barbate-faro', 340, 'Situación 15:00');
      const { rv, dist } = k.rhumb(s, 'cabo-espartel');
      const ct = k.ct({ carta: L105, anyo: 2020, desvio: 1.2 });
      const v = dist / 2;
      k.note('Distancia y velocidad', `Para llegar en 2 h: V = ${f1(dist)} / 2 = ${f1(v)} nudos.`);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'speed', value: v }];
    },
  },
  'bal-per-2020-10-e-45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('cabo-trafalgar', 'cabo-roche', 310);
      return [{ kind: 'signed', value: k.ctFrom(dv, 310) }];
    },
  },
  'bal-per-2020-10-g-45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const s = k.fromMark('punta-almina', 0, 2, 'Salida');
      const { rv } = k.rhumb(s, 'punta-carnero');
      k.note('Demora de Almina', 'Navegamos alejándonos del faro por el meridiano: lo tenemos por la popa, Dv = 180°.');
      const ct = k.ctFrom(180, 170);
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'bal-per-2020-10-i-45': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      return latlon(k.fix2Ranges('punta-europa', 12, 'punta-almina', 6, k.pos('35 55,0 N', '5 0,0 W', 'Al E de Almina')));
    },
  },
  'bal-per-2020-12-a-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const enf = k.enfilacion('punta-alcazar', 'punta-cires');
      const dvC = k.dv(255, k.ct({ dm: 0.3, desvio: -1.6 }), 'punta-carnero');
      const s = k.lineAndBearing('punta-cires', enf, 'punta-carnero', dvC, 'Situación 09:45');
      const rv = k.rv(222, k.ct({ ct: -2 }));
      const p = k.run(s, rv, k.distFor(4, 75), 'Situación 11:00');
      const { rv: r2 } = k.rhumb(p, 'cabo-negro');
      return latlon(k.run(p, r2, k.distFor(3, hrb(15, 55) - hrb(11, 0)), 'Situación 15:55'));
    },
  },
  'bal-per-2020-12-c-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const op = k.oposicion('punta-leona', 'punta-carnero');
      return latlon(k.lineAndBearing('punta-carnero', op, 'isla-tarifa', 270));
    },
  },
  'bal-per-2020-12-d-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(48, k.ct({ dm: -2, desvio: -2 }));
      const d1 = k.dvM(rv, 0, 'punta-gracia');
      const d2 = k.dvM(rv, -90, 'cabo-trafalgar');
      return latlon(k.fix2('punta-gracia', d1, 'cabo-trafalgar', d2, 'Situación 08:00'));
    },
  },
  'bal-per-2020-12-i-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 01,0 N', '5 20,5 W', 'Situación 19:00');
      const rv = k.tangent(s, 'isla-tarifa', 2.5, 'estribor');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -3, desvio: 7 })) }];
    },
  },
  'bal-per-2020-12-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(350, k.ct({ carta: L105, anyo: 2020, desvio: 6 }));
      const d1 = k.dvM(rv, 0, 'cabo-roche');
      const d2 = k.dvM(rv, 90, 'cabo-trafalgar');
      return latlon(k.fix2('cabo-roche', d1, 'cabo-trafalgar', d2));
    },
  },
  'bal-per-2020-12-d-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const s = k.lineAndBearing('punta-carnero', op, 'punta-alcazar', enf, 'Situación 20:00');
      const { dv, dist } = k.bearingTo(s, 'isla-tarifa');
      return [{ kind: 'bearing', value: dv }, { kind: 'distance', value: dist }];
    },
  },
  'bal-per-2020-12-g-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const op = k.oposicion('punta-camarinal', 'cabo-trafalgar');
      const s = k.lineAndBearing('cabo-trafalgar', op, 'barbate-faro', 0, 'Situación 14:36');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const v = dist / ((hrb(16, 48) - hrb(14, 36)) / 60);
      k.note('Distancia y velocidad', `Para llegar a las 16:48 (2 h 12 min): V = ${f1(dist)} / 2,2 = ${f1(v)} nudos.`);
      const p = k.corteRumbo(s, rv, 'isla-tarifa', 90, 'Isla de Tarifa al E');
      return [{ kind: 'clock', value: k.eta(hrb(14, 36), k.distanceBetween(s, p), v) }];
    },
  },
  'bal-per-2020-12-i-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      k.note('Demora de Almina', 'Al N verdadero del faro de Punta Almina: desde el barco el faro demora 180°.');
      const s = k.fix2('punta-almina', 180, 'punta-europa', 250);
      const { rv } = k.rhumb(s, 'ceuta-bocana');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: 6, desvio: 4 })) }];
    },
  },
  'bal-per-2020-12-c-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.fix2Ranges('cabo-trafalgar', 5, 'cabo-roche', 10, k.pos('36 10,0 N', '6 20,0 W', 'Al W de la costa'), 'Situación 16:21');
      const rv = k.rv(198, k.ct({ carta: L105, anyo: 2020, desvio: 3 }));
      return latlon(k.run(s, rv, k.distFor(5.5, 180), 'Situación 19:21'));
    },
  },
  'bal-per-2020-12-d-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dvT = k.oposicion('punta-malabata', 'isla-tarifa');
      const ct = k.ctFrom(dvT, 37);
      const rv = k.rv(95, ct);
      const dG = k.dvM(rv, -120, 'punta-gracia');
      return latlon(k.lineAndBearing('isla-tarifa', dvT, 'punta-gracia', dG));
    },
  },
  'bal-per-2020-12-e-44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 03,0 N', '6 10,0 W', 'Situación 09:30');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ carta: [-6, 2006, 6], anyo: 2020, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(9, 30), dist, 6) }];
    },
  },
  'bal-per-2020-12-c-45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fromMark('punta-europa', 180, 2, 'Salida');
      // Bajamos hacia el S dejando Almina por estribor (pasamos al E de Ceuta).
      const rv = k.tangent(s, 'punta-almina', 2, 'estribor');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -5 })) }];
    },
  },
  'bal-per-2020-12-d-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fixDist('punta-carnero', 283, 3.2);
      const { rv } = k.rhumb(s, 'algeciras-espigon');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: -2 })) }];
    },
  },
  'bal-per-2020-12-e-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(80, -60, 'punta-carnero');
      // «Faro de Punta Camarinal»: el faro de Camarinal (punta-gracia).
      const d2 = k.dvM(80, -140, 'punta-gracia');
      return latlon(k.fix2('punta-carnero', d1, 'punta-gracia', d2, 'Situación 09:00'));
    },
  },
  'bal-per-2020-12-g-45': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.pos('36 08,7 N', '6 00,5 W');
      return [{ kind: 'bearing', value: k.bearingTo(s, 'cabo-trafalgar').dv }];
    },
  },
  'bal-per-2021-03-b-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 56,4 N', '5 25,0 W', 'Situación 12:00');
      const rv = k.tangent(s, 'punta-europa', 5, 'babor');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -2, desvio: -3 })) }];
    },
  },
  'bal-per-2021-03-eg-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 54,6 N', '5 50,0 W', 'Situación 10:00');
      const rv = k.tangent(s, 'isla-tarifa', 3, 'babor');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ carta: L105, anyo: 2021, desvio: 5.1 })) }];
    },
  },
  'bal-per-2021-03-c-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '6 00,0 W', 'Situación 18:00');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ dm: -2, desvio: 9 })) }, { kind: 'clock', value: k.eta(hrb(18, 0), dist, 8) }];
    },
  },
  'bal-per-2021-03-eg-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(135, k.ct({ ct: -5 }));
      const d1 = k.dvM(rv, -90, 'barbate-espigon');
      const d2 = k.dvM(rv, -34, 'punta-gracia');
      return latlon(k.fix2('barbate-espigon', d1, 'punta-gracia', d2, 'Situación 20:00'));
    },
  },
  'bal-per-2021-03-fi-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const o1 = k.oposicion('punta-malabata', 'cabo-trafalgar');
      const o2 = k.oposicion('cabo-espartel', 'punta-gracia');
      const s = k.lineAndBearing('cabo-trafalgar', o1, 'punta-gracia', o2, 'Situación 10:00');
      const o3 = k.oposicion('punta-alcazar', 'punta-paloma');
      const p = k.fixBearingRange('punta-paloma', o3, 'punta-cires', 6, 0, 'Segunda situación');
      const { rv, dist } = k.rhumb(s, p);
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: 2 })) }, { kind: 'clock', value: k.eta(hrb(10, 0), dist, 3.5) }];
    },
  },
  'bal-per-2021-03-b-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(297, k.ct({ dm: -3, desvio: -4 }));
      const d1 = k.dvM(rv, -85, 'cabo-espartel');
      const d2 = k.dvM(rv, -135, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2));
    },
  },
  'bal-per-2019-06-c-42': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      // De los dos cortes de los arcos, el del mar es el del sur (el otro cae al norte de la bahía de Algeciras).
      return latlon(k.fix2Ranges('punta-europa', 6, 'punta-carnero', 6.8, k.P('punta-almina')));
    },
  },
  'bal-per-2019-09-c-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(262, k.ct({ ct: -3 }));
      k.note('Línea de posición: Marcaciones', 'Isla de Tarifa por la proa (M = 0°) y Punta Europa por el través: queda al norte, por estribor (M = 90° Er).');
      const d1 = k.dvM(rv, 0, 'isla-tarifa');
      const d2 = k.dvM(rv, 90, 'punta-europa');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-europa', d2));
    },
  },
  'bal-per-2019-09-a-44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const { dv, dist } = k.bearingTo('ceuta-bocana', 'ceuta-roja');
      k.note('Salida', 'Entre puntas del puerto de Ceuta: el punto medio entre la luz verde y la roja de la bocana.');
      const s = k.run(k.P('ceuta-bocana'), dv, dist / 2, 'Salida 09:00');
      const enf = k.enfilacion('gibraltar-muelle-sur', 'punta-europa');
      const p = k.corteRumbo(s, 0, 'punta-europa', enf, 'Avería');
      const t = k.eta(hrb(9, 0), k.distanceBetween(s, p), 3.4);
      k.note('Avería', 'Sin máquina ni arrancada (y sin corriente) seguimos en el mismo punto 2 h 30 min.');
      // La situación cuadra con la oficial c); la hora sale 14:33 y la oficial da 14:26 (7 min menos).
      return [...latlon(p), { kind: 'clock', value: t + 150 }];
    },
  },
  'bal-per-2019-09-b-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dvC = k.enfilacion('punta-europa', 'punta-carnero', 249);
      const ct = k.ctFrom(dvC, 249);
      const rv = k.rv(241, ct);
      const dB = k.dvM(rv, 79, 'punta-carbonera');
      return latlon(k.lineAndBearing('punta-carnero', dvC, 'punta-carbonera', dB));
    },
  },
  'bal-per-2019-12-d-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -4 });
      const d1 = k.dv(86, ct, 'isla-tarifa');
      const d2 = k.dv(346, ct, 'punta-paloma');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-paloma', d2));
    },
  },
  'bal-per-2019-12-a-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -1 });
      const rv = k.rv(230, ct);
      const d1 = k.dvM(rv, -60, 'cabo-espartel');
      const d2 = k.dvM(rv, -125, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2));
    },
  },
  'bal-per-2020-07-c-42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const { dv, dist } = k.bearingTo('ceuta-bocana', 'ceuta-roja');
      const s = k.run(k.P('ceuta-bocana'), dv, dist / 2, 'Salida 09:00');
      const enf = k.enfilacion('gibraltar-muelle-sur', 'punta-europa');
      const p = k.corteRumbo(s, 0, 'punta-europa', enf, 'Avería');
      const t = k.eta(hrb(9, 0), k.distanceBetween(s, p), 3.4);
      k.note('Avería', 'Sin máquina ni arrancada, y sin viento ni corriente, seguimos en el mismo punto 2 h 30 min.');
      // La situación cuadra con la oficial c); la hora sale 14:33 y la oficial da 14:26 (7 min menos).
      return [...latlon(p), { kind: 'clock', value: t + 150 }];
    },
  },
  'bal-per-2020-10-d-42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(254, k.ct({ dm: -2, desvio: 2 }));
      const d1 = k.dvM(rv, 25, 'isla-tarifa');
      const d2 = k.dvM(rv, -97, 'punta-cires');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-cires', d2));
    },
  },
  'bal-per-2020-10-g-43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const { rv, dist } = k.rhumb('tanger-espigon', 'barbate-espigon');
      const v = dist / ((hrb(12, 20) - hrb(10, 0)) / 60);
      k.note('Distancia y velocidad', `Para llegar a las 12:20 (2 h 20 min): V = ${f1(dist)} / 2,33 = ${f1(v)} nudos.`);
      const t1 = k.corteRumbo('tanger-espigon', rv, 'isla-tarifa', rv + 90, 'Isla de Tarifa por el través');
      const p = k.fromMark('ceuta-bocana', 0, 2.6, 'Punto P');
      const { rv: r2 } = k.rhumb(t1, p);
      const op = k.oposicion('punta-cires', 'isla-tarifa');
      const c = k.lineAndBearing(t1, r2, 'isla-tarifa', op, 'Corte con la oposición');
      const d = k.distanceBetween(k.P('tanger-espigon'), t1) + k.distanceBetween(t1, c);
      return [{ kind: 'clock', value: k.eta(hrb(10, 0), d, v) }];
    },
  },
  'bal-per-2020-12-b-43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -3, desvio: -4 });
      return latlon(k.fix2('punta-carnero', k.dv(334, ct, 'punta-carnero'), 'punta-cires', k.dv(233, ct, 'punta-cires')));
    },
  },
  'bal-per-2020-12-e-43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dvT = k.enfilacion('cabo-trafalgar', 'cabo-roche', 330);
      const ct = k.ctFrom(dvT, 330);
      const dvG = k.dv(52, ct, 'punta-gracia');
      return latlon(k.lineAndBearing('cabo-trafalgar', dvT, 'punta-gracia', dvG, 'Situación 02:30'));
    },
  },
  'bal-per-2020-12-a-44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -5 });
      return latlon(k.fix2('punta-malabata', k.dv(126, ct, 'punta-malabata'), 'cabo-espartel', k.dv(215, ct, 'cabo-espartel')));
    },
  },
  'bal-per-2020-12-i-45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const o1 = k.oposicion('punta-malabata', 'cabo-trafalgar');
      const o2 = k.oposicion('cabo-espartel', 'punta-gracia');
      const s = k.lineAndBearing('cabo-trafalgar', o1, 'punta-gracia', o2, 'Situación 10:00');
      const o3 = k.oposicion('punta-alcazar', 'punta-paloma');
      const p = k.fixBearingRange('punta-paloma', o3, 'punta-cires', 6, 0, 'Segunda situación');
      const { rv, dist } = k.rhumb(s, p);
      // Sale Ra 101,5° y 13:37; la oficial da 101,8° y 13:41.
      return [{ kind: 'bearing', value: k.ra(rv, k.ct({ ct: 2.2 })) }, { kind: 'clock', value: k.eta(hrb(10, 0), dist, 3.5) }];
    },
  },
  'bal-per-2021-03-a-42': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: 6 });
      const rv = k.rv(40, ct);
      const d1 = k.dvM(rv, 90, 'cabo-espartel');
      const d2 = k.dvM(rv, 55, 'punta-malabata');
      const s = k.fix2('cabo-espartel', d1, 'punta-malabata', d2, 'Situación 14:00');
      const r2 = k.tangent(s, 'punta-cires', 3, 'estribor');
      const p = k.corteRumbo(s, r2, 'punta-cires', 180, 'Al N de Punta Cires');
      return [{ kind: 'clock', value: k.eta(hrb(14, 0), k.distanceBetween(s, p), 11) }];
    },
  },
  'bal-per-2020-07-ah-44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      // Al E de Europa sobre la enfilación: Europa y Carnero demoran lo mismo.
      const dvE = k.enfilacion('punta-europa', 'punta-carnero', 249);
      const ct = k.ctFrom(dvE, 249);
      const rv = k.rv(241, ct);
      const dB = k.dvM(rv, 79, 'punta-carbonera');
      return latlon(k.lineAndBearing('punta-carnero', dvE, 'punta-carbonera', dB));
    },
  },
  'bal-per-2019-09-b-45': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const rv = k.rv(256, k.ct({ ct: -10 }));
      const d1 = k.dvM(rv, 157, 'punta-europa');
      const d2 = k.dvM(rv, -120, 'punta-almina');
      return latlon(k.fix2('punta-europa', d1, 'punta-almina', d2));
    },
  },
  'bal-per-2019-12-c-43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const op = k.oposicion('punta-carnero', 'punta-almina');
      const enf = k.enfilacion('punta-cires', 'punta-alcazar');
      const s = k.lineAndBearing('punta-carnero', op, 'punta-alcazar', enf, 'Situación 20:00');
      const { dv, dist } = k.bearingTo(s, 'isla-tarifa');
      const desde = (dv + 180) % 360;
      k.note('Demora desde el faro', `El faro de Isla de Tarifa nos demora ${Math.round(dv)}°; «a qué demora nos encontramos del faro» es la contraria, la del barco vista desde el faro: ${Math.round(dv)}° − 180° = ${String(Math.round(desde)).padStart(3, '0')}°, es decir, al Este verdadero del faro.`);
      return [{ kind: 'bearing', value: desde }, { kind: 'distance', value: dist }];
    },
  },
};


const falta = 'Elemento que no está en la carta de la app';
export const documentadas = {
  'bal-per-2019-04-b-44': { tipo: 'sin-calculo', texto: `${falta}: la isóbata de 100 m. Tomando el punto a 7 millas al W verdadero de Punta Alcázar, Malabata demora 230° (opción d); la oficial (213°) exige el punto sobre la isóbata.` },
  'bal-per-2019-04-a-45': { tipo: 'sin-calculo', texto: `${falta}: la sonda de 50 m y el naufragio del meridiano 5°40′ W.` },
  'bal-per-2019-04-c-45': { tipo: 'sin-calculo', texto: `${falta}: la situación se da sobre la isobática de 100 m.` },
  'bal-per-2019-06-b-45': { tipo: 'sin-calculo', texto: `${falta}: la isobática de 30 m del banco de Trafalgar.` },
  'bal-per-2019-06-c-45': { tipo: 'sin-calculo', texto: `${falta}: el naufragio próximo a Torre Castilobo y la marca cardinal N frente a Punta Malabata.` },
  'bal-per-2019-09-a-43': { tipo: 'sin-calculo', texto: `${falta}: el monte Beni Meyimel de la enfilación con Punta Malabata.` },
  'bal-per-2019-12-d-45': { tipo: 'sin-calculo', texto: `${falta}: la boya cardinal E de Barbate y los sectores de luz de El Xarf.` },
  'bal-per-2020-07-ah-42': { tipo: 'sin-calculo', texto: `${falta}: la situación sale del DST del Estrecho y de la sonda de 500 m.` },
  'bal-per-2020-07-c-44': { tipo: 'sin-calculo', texto: `${falta}: la latitud sale de la sonda de 50 m.` },
  'bal-per-2020-10-b-42': { tipo: 'sin-calculo', texto: `${falta}: la sonda de 30 m sobre la enfilación Trafalgar–Gracia.` },
  'bal-per-2020-10-g-44': { tipo: 'sin-calculo', texto: `${falta}: la sonda de 100 m sobre la oposición Trafalgar–Espartel.` },
  'bal-per-2020-10-f-45': { tipo: 'sin-calculo', texto: `${falta}: la marca especial de La Línea de la Concepción.` },
  'bal-per-2020-12-b-42': { tipo: 'sin-calculo', texto: `${falta}: la demora al monte Chajchuja (475 m).` },
  'bal-per-2020-12-f-43': { tipo: 'sin-calculo', texto: `${falta}: la luz verde del puerto de Torre de Guadiaro.` },
  'bal-per-2020-12-g-44': { tipo: 'sin-calculo', texto: `${falta}: el espigón de Piedra Redonda y la sonda de 500 m.` },
  'bal-per-2021-03-b-43': { tipo: 'sin-calculo', texto: `${falta}: el monte Magair de la enfilación con Cabo Espartel.` },
  'bal-per-2020-12-i-44': { tipo: 'sin-calculo', texto: 'Falta un dato: «A HRB = en situación…» no da la hora de salida, así que no se puede calcular lo navegado hasta las 15:30. Con la oficial c) saldrían unas 16,4 millas al Rv 078°, salida hacia las 13:10.' },
};

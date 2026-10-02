// Soluciones programadas PER Andalucía (parte 1). Ver andalucia-per-0.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];

export default {
  'and-2020-c3-q42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.fromMark('cabo-espartel', 0, 10, 'Situación 12:00');
      const ct = k.ct({ dm: 2, desvio: 4 });
      const rv = k.rv(38, ct);
      const d1 = k.dvM(rv, -89, 'cabo-trafalgar');
      const d2 = k.dvM(rv, 25, 'punta-paloma');
      return latlon(k.fix2('cabo-trafalgar', d1, 'punta-paloma', d2));
    },
  },
  'and-2020-c3-q43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 08:00');
      k.note('Rumbo verdadero', 'El Rv = 110° es dato: la Ct no hace falta.');
      const d = k.distFor(7.2, hrb(10, 30) - hrb(8, 0));
      return latlon(k.run(s, 110, d, 'Situación 10:30'));
    },
  },
  'and-2020-c3-q44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 50,0 W', 'Situación 11:15');
      const { rv, dist } = k.rhumb(s, 'barbate-faro');
      const ct = k.ct({ dm: 6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(11, 15), dist, 8.5) }];
    },
  },
  'and-2020-c3-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const op = k.oposicion('punta-carnero', 'punta-almina');
      // "Al Este verdadero de Isla de Tarifa": vemos el faro en Dv 270°.
      const s = k.lineAndBearing('punta-carnero', op, 'isla-tarifa', 270, 'Situación 08:00');
      const ct = k.ct({ dm: -6, desvio: 6 });
      const rv = k.rv(256, ct);
      const d = k.distFor(6, hrb(9, 30) - hrb(8, 0));
      return latlon(k.run(s, rv, d, 'Situación 09:30'));
    },
  },
  'and-2021-c1-q42': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-almina', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 338) }];
    },
  },
  'and-2021-c1-q43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('35 45,0 N', '6 10,0 W', 'Situación 09:00');
      const rv = k.tangent(s, 'cabo-espartel', 5, 'estribor');
      // El enunciado da "desvío 5º" sin signo: lo tomamos positivo.
      const ct = k.ct({ carta: L105, anyo: 2021, desvio: 5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2021-c1-q45': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.run(k.P('barbate-espigon'), 175, 12);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'isla-tarifa') }];
    },
  },
  'and-2021-c2-q42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -2, desvio: -2 });
      const rv = k.rv(117, ct);
      const d1 = k.dv(25, ct, 'isla-tarifa');
      const d2 = k.dvM(rv, 35, 'punta-alcazar');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-alcazar', d2));
    },
  },
  'and-2021-c2-q43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-carnero', 'punta-europa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 60) }];
    },
  },
  'and-2021-c2-q44': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación inicial');
      const d = k.distFor(6, 150);
      const p = k.run(s, 32, d);
      return [{ kind: 'distance', value: k.distanceBetween(p, 'punta-gracia') }];
    },
  },
  'and-2021-c2-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const ct = k.ct({ ct: -2 });
      const dv = k.dv(156, ct, 'punta-almina');
      const s = k.fixDist('punta-almina', dv, 5);
      const { rv } = k.rhumb(s, 'algeciras-espigon');
      // Se pide Ra aunque las opciones dicen "Rv" (pregunta anulada).
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2022-c1-q42': {
    ejercicio: 'situacion-demora-distancia',
    solve(k) {
      const dv = k.dvM(130, -90, 'cabo-trafalgar');
      return latlon(k.fixDist('cabo-trafalgar', dv, 6.3));
    },
  },
  'and-2022-c1-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: 4, desvio: 2 });
      const rv = k.rv(79, ct);
      const d1 = k.dvM(rv, -64, 'isla-tarifa');
      const d2 = k.dvM(rv, 39, 'punta-alcazar');
      return latlon(k.fix2('isla-tarifa', d1, 'punta-alcazar', d2));
    },
  },
  'and-2022-c1-q44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 14,0 W', 'Situación 12:30');
      const { rv, dist } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ dm: -6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(12, 30), dist, 8.3) }];
    },
  },
  'and-2022-c1-q45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-paloma', 'punta-malabata');
      return [{ kind: 'signed', value: k.ctFrom(dv, 180) }];
    },
  },
  'and-2022-c2-q42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.cardinal2('cabo-trafalgar', 180, 'punta-gracia', 270, 'Situación 08:00');
      const ct = k.ct({ dm: -4, desvio: -6 });
      const rv = k.rv(320, ct);
      const d = k.distFor(6, hrb(9, 30) - hrb(8, 0));
      return latlon(k.run(s, rv, d, 'Situación 09:30'));
    },
  },
  'and-2022-c2-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: 2 });
      const rv = k.rv(92, ct);
      const d1 = k.dvM(rv, -70, 'punta-paloma');
      const d2 = k.dvM(rv, 65, 'punta-malabata');
      return latlon(k.fix2('punta-paloma', d1, 'punta-malabata', d2));
    },
  },
  'and-2022-c2-q44': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 05,0 N', '5 57,0 W', 'Situación 14:30');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ dm: -8, desvio: 3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(14, 30), dist, 9.5) }];
    },
  },
  'and-2022-c2-q45': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-alcazar', 'punta-cires', 220);
      k.note('Rumbo', 'El Rv = 230° no interviene: la Ct sale de la enfilación.');
      return [{ kind: 'signed', value: k.ctFrom(dv, 220) }];
    },
  },
  'and-2022-c3-q42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const ct = k.ct({ carta: [-(5 + 40 / 60), 2005, 8], anyo: 2022, desvio: 5 });
      const dv = k.dv(143, ct, 'cabo-espartel');
      const s = k.fixDist('cabo-espartel', dv, 4.5, 'Situación 11:30');
      const rv = k.rv(285, ct);
      const d = k.distFor(7, hrb(13, 0) - hrb(11, 30));
      return latlon(k.run(s, rv, d, 'Situación 13:00'));
    },
  },
  'and-2022-c3-q43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const op = k.oposicion('isla-tarifa', 'punta-cires');
      const s = k.lineAndBearing('isla-tarifa', op, 'punta-alcazar', 205);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'punta-europa') }];
    },
  },
  'and-2022-c3-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-malabata', 0, 4.8, 'Situación 20:40');
      const { rv, dist } = k.rhumb(s, 'barbate-espigon');
      const ct = k.ct({ carta: L105, anyo: 2022, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20, 40), dist, 7) }];
    },
  },
};

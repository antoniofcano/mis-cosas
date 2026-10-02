// Soluciones programadas PER Andalucía (parte 2). Ver andalucia-per-0.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export default {
  'and-2023-c1-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('35 55,0 N', '5 15,0 W', 'Situación 13:00');
      const { rv } = k.rhumb(s, 'algeciras-espigon');
      const ct = k.ct({ carta: [3 + 40 / 60, 2018, -8], anyo: 2023, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2023-c1-q43': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 10,0 N', '6 10,0 W', 'Situación 08:00');
      const ct = k.ct({ dm: -2, desvio: 9 });
      const rv = k.rv(155, ct);
      const d = k.distFor(8, hrb(9, 30) - hrb(8, 0));
      return latlon(k.run(s, rv, d, 'Situación 09:30'));
    },
  },
  'and-2023-c1-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-cires', 'punta-carnero');
      return [{ kind: 'signed', value: k.ctFrom(dv, 10) }];
    },
  },
  'and-2023-c2-q42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 05,0 N', '6 10,0 W', 'Situación 20:00');
      const ct = k.ct({ carta: [5 + 45 / 60, 2018, -9], anyo: 2023, desvio: 7 });
      const rv = k.rv(82, ct);
      const d = k.distFor(6, hrb(21, 45) - hrb(20, 0));
      return latlon(k.run(s, rv, d, 'Situación 21:45'));
    },
  },
  'and-2023-c2-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(90, 120, 'cabo-espartel');
      const d2 = k.dvM(90, 30, 'punta-malabata');
      return latlon(k.fix2('cabo-espartel', d1, 'punta-malabata', d2));
    },
  },
  'and-2023-c2-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-paloma', 'isla-tarifa');
      return [{ kind: 'signed', value: k.ctFrom(dv, 130) }];
    },
  },
  'and-2023-c2-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.cardinal2('punta-gracia', 180, 'isla-tarifa', 270, 'Situación 10:00');
      const { rv } = k.rhumb(s, 'barbate-faro');
      const ct = k.ct({ dm: 6, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2023-c3-q42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 18:20');
      const ct = k.ct({ dm: -5, desvio: -6 });
      const rv = k.rv(311, ct);
      const d = k.distFor(6, hrb(20, 35) - hrb(18, 20));
      return latlon(k.run(s, rv, d, 'Situación 20:35'));
    },
  },
  'and-2023-c3-q43': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const enf = k.enfilacion('isla-tarifa', 'punta-carnero');
      // Al Sur verdadero de Punta Paloma: la demora desde el barco a Paloma es 000°.
      const s = k.lineAndBearing('isla-tarifa', enf, 'punta-paloma', 0, 'Situación 08:00');
      return [{ kind: 'distance', value: k.distanceBetween(s, 'punta-gracia') }];
    },
  },
  'and-2023-c3-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-malabata', 'punta-cires');
      return [{ kind: 'signed', value: k.ctFrom(dv, 58) }];
    },
  },
  'and-2023-c3-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.cardinal2('cabo-trafalgar', 180, 'punta-paloma', 270, 'Situación 19:40');
      const { rv } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ carta: [4, 2013, -6], anyo: 2023, desvio: 8 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2024-c1-q42': {
    ejercicio: 'distancia-faro',
    solve(k) {
      const op = k.oposicion('punta-alcazar', 'isla-tarifa');
      const s = k.lineAndBearing('punta-alcazar', op, 'punta-cires', 80);
      return [{ kind: 'distance', value: k.distanceBetween(s, 'punta-alcazar') }];
    },
  },
  'and-2024-c1-q43': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('cabo-espartel', 0, 8, 'Situación 17:00');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ dm: -3, desvio: 7 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(17, 0), dist, 6) }];
    },
  },
  'and-2024-c1-q44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const d1 = k.dvM(260, 109, 'punta-europa');
      const d2 = k.dvM(260, 37, 'punta-carnero');
      return latlon(k.fix2('punta-europa', d1, 'punta-carnero', d2));
    },
  },
  'and-2024-c1-q45': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('36 08,0 N', '6 13,0 W', 'Situación 14:30');
      const ct = k.ct({ dm: -5, desvio: -8 });
      const rv = k.rv(116, ct);
      const d = k.distFor(6, hrb(16, 45) - hrb(14, 30));
      return latlon(k.run(s, rv, d, 'Situación 16:45'));
    },
  },
  'and-2024-c2-q42': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 10,0 N', '5 15,0 W');
      const { rv } = k.rhumb(s, 'ceuta-bocana');
      const ct = k.ct({ carta: [-(2 + 50 / 60), 2005, 7], anyo: 2024, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2024-c2-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const ct = k.ct({ dm: -4, desvio: 4 });
      const rv = k.rv(65, ct);
      const d1 = k.dvM(rv, -55, 'punta-paloma');
      const d2 = k.dvM(rv, 20, 'isla-tarifa');
      return latlon(k.fix2('punta-paloma', d1, 'isla-tarifa', d2));
    },
  },
  'and-2024-c2-q44': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.enfilacion('punta-alcazar', 'punta-cires', 235);
      return [{ kind: 'signed', value: k.ctFrom(dv, 235) }];
    },
  },
  'and-2024-c2-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.fromMark('punta-malabata', 315, 5, 'Situación 08:00');
      const dest = k.fromMark('cabo-trafalgar', 180, 4, 'Punto de llegada');
      const { rv, dist } = k.rhumb(s, dest);
      const ct = k.ct({ dm: -3, desvio: 6 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(8, 0), dist, 8) }];
    },
  },
  'and-2024-c3-q42': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 08,0 W', 'Situación 10:00');
      const ct = k.ct({ dm: -4, desvio: -8 });
      const rv = k.rv(85, ct);
      const d = k.distFor(6, hrb(12, 30) - hrb(10, 0));
      return latlon(k.run(s, rv, d, 'Situación 12:30'));
    },
  },
  'and-2024-c3-q43': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      const s = k.fromMark('punta-almina', 0, 3.5, 'Situación 10:00');
      const ct = k.ct({ dm: 2, desvio: 3 });
      const rv = k.rv(265, ct);
      const d1 = k.dvM(rv, 37, 'isla-tarifa');
      const d2 = k.dvM(rv, -82, 'punta-alcazar');
      const p = k.fix2('isla-tarifa', d1, 'punta-alcazar', d2, 'Situación por marcaciones');
      return [...latlon(p), { kind: 'distance', value: k.distanceBetween(s, p) }];
    },
  },
  'and-2024-c3-q44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      // Al W verdadero de Isla de Tarifa (demora 090° al faro) y a 5′ de Punta Paloma: el corte más al E.
      const s = k.fixBearingRange('isla-tarifa', 90, 'punta-paloma', 5, 0, 'Situación 12:00');
      // Rumbo hacia el WNW dejando Trafalgar (al N de la derrota) por estribor.
      const rv = k.tangent(s, 'cabo-trafalgar', 4, 'estribor');
      const ct = k.ct({ dm: 5, desvio: -5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
};

// Soluciones programadas de las preguntas de carta de los exámenes PER de Andalucía.
// Cada solución usa el kit (src/exams/kit.js): calcula, explica y dibuja; devuelve los valores que
// se comparan con las opciones. tests/exams.test.js comprueba que coinciden con la plantilla oficial.
//
// Notas de la carta L105: el "faro de Punta Camarinal" de los enunciados es el faro de Punta de Gracia
// (punta-gracia). Marcaciones: estribor +, babor −. Declinación NE +, NW −.

import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];

export default {
  'and-2020-c1-q42': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.fromMark('punta-carnero', 180, 4, 'Situación 12:00');
      const ct = k.ct({ dm: 2, desvio: 4 });
      const rv = k.rv(244, ct);
      const d1 = k.dvM(rv, -110, 'punta-cires');
      const d2 = k.dvM(rv, -30, 'punta-malabata');
      return latlon(k.fix2('punta-cires', d1, 'punta-malabata', d2));
    },
  },
  'and-2020-c1-q43': {
    ejercicio: 'ct-enfilacion',
    solve(k) {
      const dv = k.oposicion('punta-almina', 'punta-carnero');
      return [{ kind: 'signed', value: k.ctFrom(dv, 332) }];
    },
  },
  'and-2020-c1-q44': {
    ejercicio: 'estima-directa',
    solve(k) {
      const s = k.pos('35 50,0 N', '6 10,0 W', 'Situación 18:00');
      const ct = k.ct({ dm: -5, desvio: -6 });
      const rv = k.rv(56, ct);
      const d = k.distFor(7, hrb(19, 45) - hrb(18, 0));
      return latlon(k.run(s, rv, d, 'Situación 19:45'));
    },
  },
  'and-2020-c1-q45': {
    ejercicio: 'rumbo-distancia',
    solve(k) {
      const s = k.pos('36 00,0 N', '5 50,0 W', 'Situación 20:00');
      const { rv, dist } = k.rhumb(s, 'tanger-espigon');
      const ct = k.ct({ carta: [4.5, 2010, -6], anyo: 2020, desvio: 6.5 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }, { kind: 'clock', value: k.eta(hrb(20, 0), dist, 8) }];
    },
  },
  'and-2021-c1-q44': {
    ejercicio: 'situacion-dos-demoras',
    solve(k) {
      k.note('Rumbo cuadrantal', 'Ra = S 76º W = 180° + 76° = 256°.');
      const ct = k.ct({ dm: -5, desvio: -5 });
      const rv = k.rv(256, ct);
      const d1 = k.dvM(rv, 157, 'punta-europa');
      const d2 = k.dvM(rv, -120, 'punta-almina');
      return latlon(k.fix2('punta-europa', d1, 'punta-almina', d2));
    },
  },
  'and-2022-c3-q44': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.fix2Ranges('isla-perejil', 4.2, 'punta-almina', 5.3, { lat: 36, lon: -5.35 });
      const rv = k.tangent(s, 'punta-europa', 2.5, 'babor');
      const ct = k.ct({ dm: -4, desvio: -3 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
  'and-2023-c1-q45': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const dv = k.dvM(340, 110, 'punta-gracia');
      const s = k.lineAndBearing('cabo-trafalgar', 180, 'punta-gracia', dv, 'Situación 10:00');
      const rv = k.tangent(s, 'cabo-roche', 5, 'estribor');
      const ct = k.ct({ dm: -4, desvio: 4 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
};
